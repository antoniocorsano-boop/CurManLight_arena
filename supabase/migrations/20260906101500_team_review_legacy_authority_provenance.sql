-- CurManLight Arena — #201 legacy authority provenance correction
-- Historical team outcomes recorded before the operational-scope model remain
-- evidence, but they must not be promoted retroactively to current #201 authority.

-- Temporarily remove the current-write trigger while reclassifying known legacy rows.
drop trigger if exists team_review_outcomes_require_operational_scope on public.team_review_outcomes;

alter table public.team_review_outcomes
  drop constraint if exists team_review_outcomes_authority_state_check;
alter table public.team_review_outcomes
  add constraint team_review_outcomes_authority_state_check
  check (authority_state is null or authority_state in ('PRE_SCOPE_LEGACY','OPERATIVO_PROVVISORIO','FORMALIZZATO'));

alter table public.team_review_outcomes
  drop constraint if exists team_review_outcomes_operational_role_check;
alter table public.team_review_outcomes
  add constraint team_review_outcomes_operational_role_check
  check (recorded_by_operational_role is null or recorded_by_operational_role in ('docente','coordinatore'));

alter table public.team_review_outcomes
  drop constraint if exists team_review_outcomes_authority_provenance_check;
alter table public.team_review_outcomes
  add constraint team_review_outcomes_authority_provenance_check
  check (
    (authority_state = 'PRE_SCOPE_LEGACY' and recorded_by_operational_role is null)
    or (authority_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO') and recorded_by_operational_role in ('docente','coordinatore'))
    or (authority_state is null and recorded_by_operational_role is null)
  );

-- These five rows were recorded by a verified workspace Dipartimento role before
-- #201 introduced operational discipline memberships. Restore their original
-- pre-scope fingerprint and record explicitly that no operational role existed.
update public.team_review_outcomes
set proposal_fingerprint = case proposal_ref
      when 'tec-sec1-2026-r2-n1' then '13440266d7439e96c56ad44bd723a3017e8bcbc222db5495c3965627de96d8cd'
      when 'tec-sec1-2026-r2-n2' then 'f8c55c86063251b85ea4e6fdcca405d65b79f296d7306c5121337c2aa4403194'
      when 'tec-sec1-2026-r2-n3' then '9916b4c92139d194ac480409c57f9fb2d0c1bd1c97699a4383069a79dad101e5'
      when 'tec-sec1-2026-r2-n4' then '5a553d6ac03fa839a00b8470e398a01b437e22b72fc8cc2cb8f6f7296861ae0f'
      when 'tec-sec1-2026-r2-verticalita' then 'a405b4a454748509c258e155230103f9c42e607ab588cac14092d416803e331b'
    end,
    recorded_by_operational_role = null,
    authority_state = 'PRE_SCOPE_LEGACY'
where proposal_ref in (
  'tec-sec1-2026-r2-n1','tec-sec1-2026-r2-n2','tec-sec1-2026-r2-n3',
  'tec-sec1-2026-r2-n4','tec-sec1-2026-r2-verticalita'
)
  and recorded_by_role in ('dipartimento','referente')
  and academic_year = '2026/2027'
  and group_code = 'S-G02'
  and discipline = 'tecnologia';

-- Current #201 outcomes preserve the actor's actual operational member role.
-- Team authority continues to derive from the verified workspace role
-- Dipartimento/Referente plus exact discipline competence and coverage.
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
  if p_outcome not in ('accept-proposal','keep-previous','shared-text','defer') then
    raise exception 'INVALID_TEAM_REVIEW_OUTCOME' using errcode = '22023';
  end if;
  if p_rationale is null or char_length(trim(p_rationale)) = 0 then
    raise exception 'RATIONALE_REQUIRED' using errcode = '22023';
  end if;
  if p_client_request_id is null or p_client_request_id <> trim(p_client_request_id) or p_client_request_id = '' or position(chr(31) in p_client_request_id) > 0 then
    raise exception 'INVALID_CLIENT_REQUEST_ID' using errcode = '22023';
  end if;
  if p_outcome = 'shared-text' and (p_shared_text is null or char_length(trim(p_shared_text)) = 0) then
    raise exception 'SHARED_TEXT_REQUIRED' using errcode = '22023';
  end if;
  if p_outcome <> 'shared-text' and p_shared_text is not null then
    raise exception 'SHARED_TEXT_NOT_ALLOWED' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.operational_group_discipline_map map
    where map.group_code = p_group_code and map.discipline = p_discipline
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

  if v_workspace_role not in ('dipartimento','referente') then
    raise exception 'TEAM_REVIEW_DECIDE_REQUIRED' using errcode = '42501';
  end if;

  select operational.membership_state, operational.member_role
  into v_actor_operational_state, v_actor_operational_role
  from public.team_operational_memberships operational
  where operational.user_id = v_user
    and operational.academic_year = p_academic_year
    and operational.group_code = p_group_code
    and operational.membership_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO')
    and p_discipline = any(operational.disciplines);

  if v_actor_operational_state is null or v_actor_operational_role is null then
    raise exception 'OPERATIONAL_DISCIPLINE_MEMBERSHIP_REQUIRED' using errcode = '42501';
  end if;

  select count(distinct membership.user_id)::integer,
         coalesce(bool_and(operational.membership_state = 'FORMALIZZATO'), false)
  into v_expected_count, v_all_formalized
  from public.workspace_memberships membership
  join public.team_operational_memberships operational
    on operational.user_id = membership.user_id
    and operational.academic_year = p_academic_year
    and operational.group_code = p_group_code
    and operational.membership_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO')
  where membership.workspace_id = p_workspace_id
    and membership.status = 'active'
    and membership.role in ('docente','dipartimento','referente')
    and p_discipline = any(operational.disciplines);

  select count(distinct contribution.contributor_user_id)::integer
  into v_current_count
  from public.team_review_contributions contribution
  join public.workspace_memberships membership
    on membership.workspace_id = contribution.workspace_id
    and membership.user_id = contribution.contributor_user_id
    and membership.status = 'active'
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
    and contribution.proposal_ref = p_proposal_ref
    and contribution.proposal_fingerprint = p_proposal_fingerprint;

  if p_outcome <> 'defer' then
    if v_expected_count <= 0 then
      raise exception 'NO_OPERATIONAL_COMPETENT_CONTRIBUTORS' using errcode = '23514';
    end if;
    if v_current_count < v_expected_count then
      raise exception 'TEAM_REVIEW_COVERAGE_INCOMPLETE' using errcode = '23514';
    end if;
  end if;

  v_authority_state := case
    when v_actor_operational_state = 'FORMALIZZATO' and v_all_formalized then 'FORMALIZZATO'
    else 'OPERATIVO_PROVVISORIO'
  end;

  select * into v_existing
  from public.team_review_outcomes
  where workspace_id = p_workspace_id and client_request_id = p_client_request_id;

  if found then
    if v_existing.recorded_by_user_id <> v_user
      or coalesce(v_existing.academic_year, '') <> p_academic_year
      or coalesce(v_existing.group_code, '') <> p_group_code
      or coalesce(v_existing.discipline, '') <> p_discipline
      or v_existing.proposal_ref <> p_proposal_ref
      or v_existing.proposal_fingerprint <> p_proposal_fingerprint
      or v_existing.outcome <> p_outcome
      or coalesce(v_existing.shared_text, '') <> coalesce(case when p_outcome = 'shared-text' then trim(p_shared_text) else null end, '')
      or v_existing.rationale <> trim(p_rationale)
    then
      raise exception 'CLIENT_REQUEST_ID_REUSE_MISMATCH' using errcode = '23505';
    end if;
    v_row := v_existing;
  else
    insert into public.team_review_outcomes(
      workspace_id, academic_year, group_code, discipline, proposal_ref,
      proposal_fingerprint, outcome, shared_text, rationale,
      recorded_by_user_id, recorded_by_role, recorded_by_operational_role,
      authority_state, recorded_at, client_request_id
    ) values (
      p_workspace_id, p_academic_year, p_group_code, p_discipline,
      p_proposal_ref, p_proposal_fingerprint, p_outcome,
      case when p_outcome = 'shared-text' then trim(p_shared_text) else null end,
      trim(p_rationale), v_user, v_workspace_role, v_actor_operational_role,
      v_authority_state, now(), p_client_request_id
    ) returning * into v_row;
  end if;

  return jsonb_build_object(
    'id', v_row.id,
    'workspace_id', v_row.workspace_id,
    'academic_year', v_row.academic_year,
    'group_code', v_row.group_code,
    'discipline', v_row.discipline,
    'proposal_ref', v_row.proposal_ref,
    'proposal_fingerprint', v_row.proposal_fingerprint,
    'outcome', v_row.outcome,
    'shared_text', v_row.shared_text,
    'rationale', v_row.rationale,
    'recorded_by_user_id', v_row.recorded_by_user_id,
    'recorded_by_role', v_row.recorded_by_role,
    'recorded_by_operational_role', v_row.recorded_by_operational_role,
    'authority_state', v_row.authority_state,
    'recorded_at', v_row.recorded_at,
    'client_request_id', v_row.client_request_id
  );
end;
$$;

revoke all on function public.record_team_review_outcome_v2(uuid,text,text,text,text,text,text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.record_team_review_outcome_v2(uuid,text,text,text,text,text,text,text,text,text)
  to authenticated;

-- Current-write trigger: a new outcome can never claim PRE_SCOPE_LEGACY and its
-- operational role must match the actor's real current operational membership.
create or replace function public.assert_team_operational_outcome_scope_v1()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.academic_year is null
    or new.group_code is null
    or new.discipline is null
    or new.authority_state not in ('OPERATIVO_PROVVISORIO','FORMALIZZATO')
    or new.recorded_by_operational_role not in ('docente','coordinatore')
  then
    raise exception 'OPERATIONAL_TEAM_SCOPE_REQUIRED' using errcode = '42501';
  end if;
  if new.recorded_by_role not in ('dipartimento','referente') then
    raise exception 'TEAM_REVIEW_DECIDE_REQUIRED' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.operational_group_discipline_map map
    where map.group_code = new.group_code and map.discipline = new.discipline
  ) then
    raise exception 'INVALID_OPERATIONAL_REVIEW_SCOPE' using errcode = '22023';
  end if;
  if not exists (
    select 1
    from public.workspace_memberships membership
    join public.workspaces workspace on workspace.id = membership.workspace_id
    join public.team_operational_memberships operational
      on operational.user_id = membership.user_id
      and operational.academic_year = new.academic_year
      and operational.group_code = new.group_code
      and operational.member_role = new.recorded_by_operational_role
      and operational.membership_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO')
      and new.discipline = any(operational.disciplines)
    where membership.workspace_id = new.workspace_id
      and membership.user_id = new.recorded_by_user_id
      and membership.role = new.recorded_by_role
      and membership.role in ('dipartimento','referente')
      and membership.status = 'active'
      and workspace.status = 'active'
  ) then
    raise exception 'VERIFIED_TEAM_OUTCOME_AUTHORITY_REQUIRED' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function public.assert_team_operational_outcome_scope_v1()
  from public, anon, authenticated;

create trigger team_review_outcomes_require_operational_scope
before insert or update on public.team_review_outcomes
for each row execute function public.assert_team_operational_outcome_scope_v1();

comment on column public.team_review_outcomes.recorded_by_operational_role is
'Actual operational member role at recording time. NULL for PRE_SCOPE_LEGACY receipts; it is not the source of team authority.';
comment on column public.team_review_outcomes.authority_state is
'PRE_SCOPE_LEGACY preserves historical receipts without promoting them to #201. Current values are OPERATIVO_PROVVISORIO or FORMALIZZATO and remain professional, not institutional approval.';
