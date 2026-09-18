-- CurManLight Arena — case-scoped team comparison read authority.
--
-- The browser must not derive multi-actor coverage through a direct SELECT on
-- team_review_contributions: nested RLS on workspace_memberships can hide other
-- active contributors even when the requester is allowed to compare the team.
-- This RPC performs the same scope/assignment checks server-side and returns
-- only contributions belonging to the exact shared CurriculumReviewCase.

create or replace function public.list_case_scoped_team_review_contributions_v1(
  p_workspace_id uuid,
  p_academic_year text,
  p_group_code text,
  p_discipline text,
  p_review_case_id text
)
returns table (
  workspace_id uuid,
  academic_year text,
  group_code text,
  discipline text,
  review_case_id text,
  proposal_ref text,
  proposal_fingerprint text,
  contributor_user_id uuid,
  contributor_role text,
  orientation text,
  custom_text text,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_workspace_role text;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;
  if p_academic_year is null or p_academic_year !~ '^[0-9]{4}/[0-9]{4}$' then
    raise exception 'INVALID_ACADEMIC_YEAR' using errcode = '22023';
  end if;
  if p_review_case_id is null or p_review_case_id <> trim(p_review_case_id) or p_review_case_id = ''
     or char_length(p_review_case_id) > 600 or position(chr(31) in p_review_case_id) > 0 then
    raise exception 'REVIEW_CASE_ID_REQUIRED' using errcode = '22023';
  end if;
  if p_group_code is null or p_group_code <> trim(p_group_code) or p_group_code = ''
     or p_discipline is null or p_discipline <> trim(p_discipline) or p_discipline = '' then
    raise exception 'INVALID_OPERATIONAL_REVIEW_SCOPE' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.operational_group_discipline_map map
    join public.operational_group_definitions defs on defs.group_code = map.group_code
    where map.group_code = p_group_code
      and map.discipline = p_discipline
      and defs.active = true
  ) then
    raise exception 'INVALID_OPERATIONAL_REVIEW_SCOPE' using errcode = '22023';
  end if;

  select membership.role into v_workspace_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id
    and membership.user_id = v_user
    and membership.status = 'active'
    and workspace.status = 'active';

  if v_workspace_role not in ('docente','dipartimento','referente') then
    raise exception 'TEAM_REVIEW_CONTRIBUTE_REQUIRED' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.team_operational_memberships operational
    where operational.user_id = v_user
      and operational.academic_year = p_academic_year
      and operational.group_code = p_group_code
      and operational.membership_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO')
      and p_discipline = any(operational.disciplines)
  ) then
    raise exception 'OPERATIONAL_DISCIPLINE_MEMBERSHIP_REQUIRED' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.shared_curriculum_review_cases review_case
    where review_case.workspace_id = p_workspace_id
      and review_case.case_id = p_review_case_id
      and review_case.academic_year = p_academic_year
      and review_case.group_code = p_group_code
      and review_case.discipline = p_discipline
      and review_case.case_status = 'ASSIGNED_FOR_PROFESSIONAL_REVIEW'
  ) then
    raise exception 'SHARED_REVIEW_CASE_SCOPE_REQUIRED' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.shared_curriculum_review_case_assignments assignment
    where assignment.workspace_id = p_workspace_id
      and assignment.case_id = p_review_case_id
      and assignment.assigned_user_id = v_user
      and assignment.assignment_state = 'ASSIGNED'
  ) then
    raise exception 'SHARED_REVIEW_CASE_ASSIGNMENT_REQUIRED' using errcode = '42501';
  end if;

  return query
  select
    contribution.workspace_id,
    contribution.academic_year,
    contribution.group_code,
    contribution.discipline,
    contribution.review_case_id,
    contribution.proposal_ref,
    contribution.proposal_fingerprint,
    contribution.contributor_user_id,
    contribution.contributor_role,
    contribution.orientation,
    contribution.custom_text,
    contribution.updated_at
  from public.team_review_contributions contribution
  join public.shared_curriculum_review_case_assignments assignment
    on assignment.workspace_id = contribution.workspace_id
    and assignment.case_id = contribution.review_case_id
    and assignment.assigned_user_id = contribution.contributor_user_id
    and assignment.assignment_state = 'ASSIGNED'
  join public.workspace_memberships membership
    on membership.workspace_id = contribution.workspace_id
    and membership.user_id = contribution.contributor_user_id
    and membership.status = 'active'
    and membership.role in ('docente','dipartimento','referente')
  join public.team_operational_memberships operational
    on operational.user_id = contribution.contributor_user_id
    and operational.academic_year = p_academic_year
    and operational.group_code = p_group_code
    and operational.membership_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO')
    and p_discipline = any(operational.disciplines)
  where contribution.workspace_id = p_workspace_id
    and contribution.academic_year = p_academic_year
    and contribution.group_code = p_group_code
    and contribution.discipline = p_discipline
    and contribution.review_case_id = p_review_case_id
  order by contribution.proposal_ref, contribution.updated_at, contribution.contributor_user_id;
end;
$$;

revoke all on function public.list_case_scoped_team_review_contributions_v1(uuid, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.list_case_scoped_team_review_contributions_v1(uuid, text, text, text, text)
  to authenticated;

comment on function public.list_case_scoped_team_review_contributions_v1(uuid, text, text, text, text) is
'Server-authoritative case-scoped contribution read. Avoids nested-RLS undercount while requiring active workspace/operational membership and an ASSIGNED shared review case.';