-- CurManLight Arena — restore the general H1/H2 path after case-scoped review
-- introduced partial unique indexes on team_review_contributions.
--
-- General review rows are exactly those with review_case_id IS NULL.
-- Case-scoped rows remain handled by the v3 RPCs and must never satisfy the
-- general contribution or coverage path.

create or replace function public.upsert_team_review_contribution_v2(
  p_workspace_id uuid,
  p_academic_year text,
  p_group_code text,
  p_discipline text,
  p_proposal_ref text,
  p_proposal_fingerprint text,
  p_orientation text,
  p_custom_text text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_workspace_role text;
  v_row public.team_review_contributions%rowtype;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;
  if p_academic_year is null or p_academic_year !~ '^[0-9]{4}/[0-9]{4}$' then
    raise exception 'INVALID_ACADEMIC_YEAR' using errcode = '22023';
  end if;
  if p_proposal_ref is null or p_proposal_ref <> trim(p_proposal_ref) or p_proposal_ref = '' or position(chr(31) in p_proposal_ref) > 0 then
    raise exception 'INVALID_PROPOSAL_REF' using errcode = '22023';
  end if;
  if p_proposal_fingerprint is null or p_proposal_fingerprint !~ '^[0-9a-f]{64}$' then
    raise exception 'INVALID_PROPOSAL_FINGERPRINT' using errcode = '22023';
  end if;
  if p_orientation not in ('confirm-proposal','propose-change','keep-previous') then
    raise exception 'INVALID_TEAM_REVIEW_ORIENTATION' using errcode = '22023';
  end if;
  if p_orientation = 'propose-change' and (p_custom_text is null or char_length(trim(p_custom_text)) = 0) then
    raise exception 'CUSTOM_TEXT_REQUIRED' using errcode = '22023';
  end if;
  if p_orientation <> 'propose-change' and p_custom_text is not null then
    raise exception 'CUSTOM_TEXT_NOT_ALLOWED' using errcode = '22023';
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
    select 1 from public.team_operational_memberships operational
    where operational.user_id = v_user
      and operational.academic_year = p_academic_year
      and operational.group_code = p_group_code
      and operational.membership_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO')
      and p_discipline = any(operational.disciplines)
  ) then
    raise exception 'OPERATIONAL_DISCIPLINE_MEMBERSHIP_REQUIRED' using errcode = '42501';
  end if;

  insert into public.team_review_contributions(
    workspace_id, academic_year, group_code, discipline, review_case_id,
    proposal_ref, proposal_fingerprint, contributor_user_id, contributor_role,
    orientation, custom_text, updated_at
  ) values (
    p_workspace_id, p_academic_year, p_group_code, p_discipline, null,
    p_proposal_ref, p_proposal_fingerprint, v_user, v_workspace_role,
    p_orientation,
    case when p_orientation = 'propose-change' then trim(p_custom_text) else null end,
    now()
  )
  on conflict (workspace_id, proposal_ref, contributor_user_id)
    where review_case_id is null
  do update set
    academic_year = excluded.academic_year,
    group_code = excluded.group_code,
    discipline = excluded.discipline,
    proposal_fingerprint = excluded.proposal_fingerprint,
    contributor_role = excluded.contributor_role,
    orientation = excluded.orientation,
    custom_text = excluded.custom_text,
    updated_at = excluded.updated_at
  returning * into v_row;

  return jsonb_build_object(
    'workspace_id', v_row.workspace_id,
    'academic_year', v_row.academic_year,
    'group_code', v_row.group_code,
    'discipline', v_row.discipline,
    'proposal_ref', v_row.proposal_ref,
    'proposal_fingerprint', v_row.proposal_fingerprint,
    'contributor_user_id', v_row.contributor_user_id,
    'contributor_role', v_row.contributor_role,
    'orientation', v_row.orientation,
    'custom_text', v_row.custom_text,
    'updated_at', v_row.updated_at
  );
end;
$$;

create or replace function public.record_team_review_outcome_v2(
  p_workspace_id uuid,
  p_academic_year text,
  p_group_code text,
  p_discipline text,
  p_proposal_ref text,
  p_proposal_fingerprint text,
  p_outcome text,
  p_shared_text text,
  p_rationale text,
  p_client_request_id text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_workspace_role text;
  v_actor_operational_state text;
  v_actor_operational_role text;
  v_expected_count integer;
  v_current_count integer;
  v_all_formalized boolean;
  v_authority_state text;
  v_existing public.team_review_outcomes%rowtype;
  v_row public.team_review_outcomes%rowtype;
begin
  if v_user is null then raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501'; end if;
  if p_academic_year is null or p_academic_year !~ '^[0-9]{4}/[0-9]{4}$' then raise exception 'INVALID_ACADEMIC_YEAR' using errcode = '22023'; end if;
  if p_proposal_ref is null or p_proposal_ref <> trim(p_proposal_ref) or p_proposal_ref = '' or position(chr(31) in p_proposal_ref) > 0 then raise exception 'INVALID_PROPOSAL_REF' using errcode = '22023'; end if;
  if p_proposal_fingerprint is null or p_proposal_fingerprint !~ '^[0-9a-f]{64}$' then raise exception 'INVALID_PROPOSAL_FINGERPRINT' using errcode = '22023'; end if;
  if p_outcome not in ('accept-proposal','keep-previous','shared-text','defer') then raise exception 'INVALID_TEAM_REVIEW_OUTCOME' using errcode = '22023'; end if;
  if p_rationale is null or char_length(trim(p_rationale)) = 0 then raise exception 'RATIONALE_REQUIRED' using errcode = '22023'; end if;
  if p_client_request_id is null or p_client_request_id <> trim(p_client_request_id) or p_client_request_id = '' or position(chr(31) in p_client_request_id) > 0 then raise exception 'INVALID_CLIENT_REQUEST_ID' using errcode = '22023'; end if;
  if p_outcome = 'shared-text' and (p_shared_text is null or char_length(trim(p_shared_text)) = 0) then raise exception 'SHARED_TEXT_REQUIRED' using errcode = '22023'; end if;
  if p_outcome <> 'shared-text' and p_shared_text is not null then raise exception 'SHARED_TEXT_NOT_ALLOWED' using errcode = '22023'; end if;
  if not exists (select 1 from public.operational_group_discipline_map map where map.group_code = p_group_code and map.discipline = p_discipline) then raise exception 'INVALID_OPERATIONAL_REVIEW_SCOPE' using errcode = '22023'; end if;

  select membership.role into v_workspace_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id and membership.user_id = v_user and membership.status = 'active' and workspace.status = 'active';
  if v_workspace_role not in ('dipartimento','referente') then raise exception 'TEAM_REVIEW_DECIDE_REQUIRED' using errcode = '42501'; end if;

  select operational.membership_state, operational.member_role into v_actor_operational_state, v_actor_operational_role
  from public.team_operational_memberships operational
  where operational.user_id = v_user and operational.academic_year = p_academic_year and operational.group_code = p_group_code
    and operational.membership_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO') and p_discipline = any(operational.disciplines);
  if v_actor_operational_state is null or v_actor_operational_role is null then raise exception 'OPERATIONAL_DISCIPLINE_MEMBERSHIP_REQUIRED' using errcode = '42501'; end if;

  select count(distinct membership.user_id)::integer, coalesce(bool_and(operational.membership_state = 'FORMALIZZATO'), false)
  into v_expected_count, v_all_formalized
  from public.workspace_memberships membership
  join public.team_operational_memberships operational on operational.user_id = membership.user_id and operational.academic_year = p_academic_year
    and operational.group_code = p_group_code and operational.membership_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO')
  where membership.workspace_id = p_workspace_id and membership.status = 'active' and membership.role in ('docente','dipartimento','referente')
    and p_discipline = any(operational.disciplines);

  select count(distinct contribution.contributor_user_id)::integer into v_current_count
  from public.team_review_contributions contribution
  join public.workspace_memberships membership on membership.workspace_id = contribution.workspace_id and membership.user_id = contribution.contributor_user_id and membership.status = 'active'
  join public.team_operational_memberships operational on operational.user_id = contribution.contributor_user_id and operational.academic_year = p_academic_year
    and operational.group_code = p_group_code and operational.membership_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO') and p_discipline = any(operational.disciplines)
  where contribution.workspace_id = p_workspace_id and contribution.academic_year = p_academic_year and contribution.group_code = p_group_code
    and contribution.discipline = p_discipline and contribution.review_case_id is null
    and contribution.proposal_ref = p_proposal_ref and contribution.proposal_fingerprint = p_proposal_fingerprint;

  if p_outcome <> 'defer' then
    if v_expected_count <= 0 then raise exception 'NO_OPERATIONAL_COMPETENT_CONTRIBUTORS' using errcode = '23514'; end if;
    if v_current_count < v_expected_count then raise exception 'TEAM_REVIEW_COVERAGE_INCOMPLETE' using errcode = '23514'; end if;
  end if;

  v_authority_state := case when v_actor_operational_state = 'FORMALIZZATO' and v_all_formalized then 'FORMALIZZATO' else 'OPERATIVO_PROVVISORIO' end;

  select * into v_existing
  from public.team_review_outcomes
  where workspace_id = p_workspace_id
    and client_request_id = p_client_request_id
    and review_case_id is null;
  if found then
    if v_existing.recorded_by_user_id <> v_user or coalesce(v_existing.academic_year, '') <> p_academic_year or coalesce(v_existing.group_code, '') <> p_group_code
      or coalesce(v_existing.discipline, '') <> p_discipline or v_existing.proposal_ref <> p_proposal_ref or v_existing.proposal_fingerprint <> p_proposal_fingerprint
      or v_existing.outcome <> p_outcome or coalesce(v_existing.shared_text, '') <> coalesce(case when p_outcome = 'shared-text' then trim(p_shared_text) else null end, '')
      or v_existing.rationale <> trim(p_rationale) then raise exception 'CLIENT_REQUEST_ID_REUSE_MISMATCH' using errcode = '23505'; end if;
    v_row := v_existing;
  else
    insert into public.team_review_outcomes(workspace_id, academic_year, group_code, discipline, review_case_id, proposal_ref, proposal_fingerprint, outcome, shared_text, rationale,
      recorded_by_user_id, recorded_by_role, recorded_by_operational_role, authority_state, recorded_at, client_request_id)
    values (p_workspace_id, p_academic_year, p_group_code, p_discipline, null, p_proposal_ref, p_proposal_fingerprint, p_outcome,
      case when p_outcome = 'shared-text' then trim(p_shared_text) else null end, trim(p_rationale), v_user, v_workspace_role, v_actor_operational_role,
      v_authority_state, now(), p_client_request_id) returning * into v_row;
  end if;

  return jsonb_build_object('id', v_row.id,'workspace_id', v_row.workspace_id,'academic_year', v_row.academic_year,'group_code', v_row.group_code,
    'discipline', v_row.discipline,'proposal_ref', v_row.proposal_ref,'proposal_fingerprint', v_row.proposal_fingerprint,'outcome', v_row.outcome,
    'shared_text', v_row.shared_text,'rationale', v_row.rationale,'recorded_by_user_id', v_row.recorded_by_user_id,'recorded_by_role', v_row.recorded_by_role,
    'recorded_by_operational_role', v_row.recorded_by_operational_role,'authority_state', v_row.authority_state,'recorded_at', v_row.recorded_at,
    'client_request_id', v_row.client_request_id);
end;
$$;

revoke all on function public.upsert_team_review_contribution_v2(uuid,text,text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.upsert_team_review_contribution_v2(uuid,text,text,text,text,text,text,text) to authenticated;

revoke all on function public.record_team_review_outcome_v2(uuid,text,text,text,text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.record_team_review_outcome_v2(uuid,text,text,text,text,text,text,text,text,text) to authenticated;
