-- CurManLight Arena — fail closed against stale H2 receipts while a deferred
-- continuation is open for the same case/proposal.

create or replace function public.list_case_scoped_team_review_outcomes_v2(
  p_workspace_id uuid,
  p_academic_year text,
  p_group_code text,
  p_discipline text,
  p_review_case_id text
)
returns table (
  id uuid,
  workspace_id uuid,
  academic_year text,
  group_code text,
  discipline text,
  review_case_id text,
  proposal_ref text,
  proposal_fingerprint text,
  outcome text,
  shared_text text,
  rationale text,
  recorded_by_user_id uuid,
  recorded_by_role text,
  recorded_by_operational_role text,
  authority_state text,
  recorded_at timestamptz,
  client_request_id text
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;
  if not exists (
    select 1
    from public.workspace_memberships membership
    join public.workspaces workspace on workspace.id = membership.workspace_id
    join public.shared_curriculum_review_case_assignments assignment
      on assignment.workspace_id = membership.workspace_id
      and assignment.case_id = p_review_case_id
      and assignment.assigned_user_id = membership.user_id
      and assignment.assignment_state = 'ASSIGNED'
    join public.team_operational_memberships operational
      on operational.user_id = membership.user_id
      and operational.academic_year = p_academic_year
      and operational.group_code = p_group_code
      and operational.membership_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO')
      and p_discipline = any(operational.disciplines)
    where membership.workspace_id = p_workspace_id
      and membership.user_id = v_user
      and membership.status = 'active'
      and workspace.status = 'active'
  ) then
    raise exception 'TEAM_REVIEW_OUTCOME_READ_REQUIRED' using errcode = '42501';
  end if;

  return query
  select
    team_outcome.id, team_outcome.workspace_id, team_outcome.academic_year,
    team_outcome.group_code, team_outcome.discipline, team_outcome.review_case_id,
    team_outcome.proposal_ref, team_outcome.proposal_fingerprint,
    team_outcome.outcome, team_outcome.shared_text, team_outcome.rationale,
    team_outcome.recorded_by_user_id, team_outcome.recorded_by_role,
    team_outcome.recorded_by_operational_role, team_outcome.authority_state,
    team_outcome.recorded_at, team_outcome.client_request_id
  from public.team_review_outcomes team_outcome
  where team_outcome.workspace_id = p_workspace_id
    and team_outcome.academic_year = p_academic_year
    and team_outcome.group_code = p_group_code
    and team_outcome.discipline = p_discipline
    and team_outcome.review_case_id = p_review_case_id
    and not exists (
      select 1
      from public.team_review_deferred_continuations continuation
      where continuation.workspace_id = team_outcome.workspace_id
        and continuation.review_case_id = team_outcome.review_case_id
        and continuation.proposal_ref = team_outcome.proposal_ref
        and continuation.completed_by_outcome_id is null
    )
  order by team_outcome.recorded_at desc, team_outcome.id desc;
end;
$$;

revoke all on function public.list_case_scoped_team_review_outcomes_v2(uuid,text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.list_case_scoped_team_review_outcomes_v2(uuid,text,text,text,text)
  to authenticated;

create or replace function public.guard_vertical_review_against_open_h2_continuation_v1()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if exists (
    select 1
    from public.team_review_outcomes selected_outcome
    join public.team_review_deferred_continuations continuation
      on continuation.workspace_id = selected_outcome.workspace_id
      and continuation.review_case_id = selected_outcome.review_case_id
      and continuation.proposal_ref = selected_outcome.proposal_ref
      and continuation.completed_by_outcome_id is null
    where selected_outcome.workspace_id = new.workspace_id
      and selected_outcome.id = any(new.source_team_outcome_ids)
  ) then
    raise exception 'VERTICAL_REVIEW_H2_CONTINUATION_OPEN' using errcode = '23514';
  end if;
  return new;
end;
$$;

create or replace function public.list_vertical_review_candidates_v1(
  p_workspace_id uuid,
  p_master_id text,
  p_master_drive_file_id text,
  p_master_version text,
  p_discipline text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_result jsonb;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;
  if p_workspace_id is null
     or p_master_id <> 'CAN-CURR-MASTER-00'
     or nullif(trim(p_master_drive_file_id), '') is null
     or nullif(trim(p_master_version), '') is null
     or p_discipline is null
     or p_discipline <> trim(p_discipline)
     or p_discipline = '' then
    raise exception 'INVALID_VERTICAL_REVIEW_SCOPE' using errcode = '22023';
  end if;
  if not exists (
    select 1
    from public.workspace_memberships membership
    join public.workspaces workspace on workspace.id = membership.workspace_id
    where membership.workspace_id = p_workspace_id
      and membership.user_id = v_user
      and membership.status = 'active'
      and workspace.status = 'active'
  ) then
    raise exception 'VERTICAL_REVIEW_WORKSPACE_MEMBERSHIP_REQUIRED' using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'team_outcome_id', candidate.team_outcome_id,
      'workspace_id', candidate.workspace_id,
      'review_case_id', candidate.review_case_id,
      'academic_year', candidate.academic_year,
      'group_code', candidate.group_code,
      'discipline', candidate.discipline,
      'school_order', candidate.school_order,
      'class_or_age_band', candidate.class_or_age_band,
      'curriculum_unit_key', candidate.curriculum_unit_key,
      'master_id', candidate.master_id,
      'master_drive_file_id', candidate.master_drive_file_id,
      'master_version', candidate.master_version,
      'proposal_ref', candidate.proposal_ref,
      'proposal_fingerprint', candidate.proposal_fingerprint,
      'team_outcome', candidate.team_outcome,
      'shared_text', candidate.shared_text,
      'team_rationale', candidate.team_rationale,
      'team_outcome_recorded_at', candidate.team_outcome_recorded_at,
      'scope_reason', candidate.scope_reason
    ) order by candidate.team_outcome_recorded_at desc
  ), '[]'::jsonb)
  into v_result
  from (
    select distinct on (team_outcome.review_case_id, team_outcome.proposal_ref)
      team_outcome.id as team_outcome_id,
      team_outcome.workspace_id,
      team_outcome.review_case_id,
      team_outcome.academic_year,
      team_outcome.group_code,
      review_case.discipline,
      review_case.school_order,
      review_case.class_or_age_band,
      review_case.curriculum_unit_key,
      review_case.master_id,
      review_case.master_drive_file_id,
      review_case.master_version,
      team_outcome.proposal_ref,
      team_outcome.proposal_fingerprint,
      team_outcome.outcome as team_outcome,
      team_outcome.shared_text,
      team_outcome.rationale as team_rationale,
      team_outcome.recorded_at as team_outcome_recorded_at,
      review_case.scope_reason
    from public.team_review_outcomes team_outcome
    join public.shared_curriculum_review_cases review_case
      on review_case.workspace_id = team_outcome.workspace_id
      and review_case.case_id = team_outcome.review_case_id
    where team_outcome.workspace_id = p_workspace_id
      and team_outcome.review_case_id is not null
      and review_case.master_id = p_master_id
      and review_case.master_drive_file_id = trim(p_master_drive_file_id)
      and review_case.master_version = trim(p_master_version)
      and review_case.discipline = p_discipline
      and team_outcome.proposal_ref = any(review_case.targeted_proposal_refs)
      and not exists (
        select 1
        from public.team_review_deferred_continuations continuation
        where continuation.workspace_id = team_outcome.workspace_id
          and continuation.review_case_id = team_outcome.review_case_id
          and continuation.proposal_ref = team_outcome.proposal_ref
          and continuation.completed_by_outcome_id is null
      )
    order by team_outcome.review_case_id, team_outcome.proposal_ref, team_outcome.recorded_at desc, team_outcome.id desc
  ) candidate;

  return v_result;
end;
$$;

revoke all on function public.list_vertical_review_candidates_v1(uuid,text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.list_vertical_review_candidates_v1(uuid,text,text,text,text)
  to authenticated;
