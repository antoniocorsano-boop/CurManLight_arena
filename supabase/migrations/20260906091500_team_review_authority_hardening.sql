-- CurManLight Arena — hardening dell'autorità di revisione del team
--
-- Questo incremento corregge il confine tra:
--   1. competenza disciplinare auto-dichiarata;
--   2. membership condivisa verificata di Dipartimento/Referente;
--   3. esito professionale del team;
--   4. successiva decisione istituzionale.
--
-- Il profilo personale può dichiarare discipline e gruppi derivati, ma non può
-- autoattribuire una funzione che abiliti la registrazione degli esiti del team.

-- Neutralizza eventuali autoattribuzioni provvisorie prodotte da versioni
-- precedenti della migrazione. Le righe FORMALIZZATO non vengono modificate.
update public.team_operational_memberships
set member_role = 'docente', updated_at = now()
where membership_state = 'OPERATIVO_PROVVISORIO'
  and member_role = 'coordinatore';

-- Manteniamo la firma RPC a quattro argomenti per compatibilità dei client, ma
-- qualsiasi tentativo di assegnare il coordinamento dal profilo personale viene
-- rifiutato in modo esplicito e fail-closed.
create or replace function public.upsert_my_operational_profile_v1(
  p_academic_year text,
  p_school_order text,
  p_disciplines text[],
  p_coordinator_group_code text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_invalid_count integer;
  v_result jsonb;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;

  if p_coordinator_group_code is not null then
    raise exception 'SELF_ASSIGNED_OPERATIONAL_COORDINATOR_FORBIDDEN' using errcode = '42501';
  end if;

  if p_academic_year is null or p_academic_year !~ '^[0-9]{4}/[0-9]{4}$' then
    raise exception 'INVALID_ACADEMIC_YEAR' using errcode = '22023';
  end if;
  if p_school_order not in ('primaria','secondaria') then
    raise exception 'OPERATIONAL_SCHOOL_ORDER_REQUIRED' using errcode = '22023';
  end if;
  if p_disciplines is null or cardinality(p_disciplines) = 0 then
    raise exception 'OPERATIONAL_DISCIPLINE_REQUIRED' using errcode = '22023';
  end if;
  if exists (
    select 1 from unnest(p_disciplines) as raw(discipline)
    where raw.discipline is null
      or raw.discipline = ''
      or raw.discipline <> trim(raw.discipline)
      or position(chr(31) in raw.discipline) > 0
  ) then
    raise exception 'INVALID_OPERATIONAL_DISCIPLINE' using errcode = '22023';
  end if;

  select count(*)::integer into v_invalid_count
  from (
    select distinct raw.discipline
    from unnest(p_disciplines) as raw(discipline)
  ) selected
  left join public.operational_group_discipline_map map
    on map.discipline = selected.discipline
  left join public.operational_group_definitions defs
    on defs.group_code = map.group_code
      and defs.school_order = p_school_order
      and defs.active = true
  where defs.group_code is null;

  if v_invalid_count > 0 then
    raise exception 'DISCIPLINE_NOT_AVAILABLE_FOR_OPERATIONAL_ORDER' using errcode = '22023';
  end if;

  -- Solo le righe provvisorie sono sostituibili dal self-service. Una futura
  -- formalizzazione non viene mai declassata da una modifica del profilo locale.
  delete from public.team_operational_memberships membership
  using public.operational_group_definitions defs
  where membership.user_id = v_user
    and membership.academic_year = p_academic_year
    and membership.school_order = p_school_order
    and membership.membership_state = 'OPERATIVO_PROVVISORIO'
    and defs.group_code = membership.group_code
    and defs.school_order = p_school_order;

  insert into public.team_operational_memberships(
    user_id,
    academic_year,
    school_order,
    group_code,
    member_role,
    membership_state,
    disciplines,
    updated_at
  )
  select
    v_user,
    p_academic_year,
    p_school_order,
    grouped.group_code,
    'docente',
    'OPERATIVO_PROVVISORIO',
    grouped.disciplines,
    now()
  from (
    select
      map.group_code,
      array_agg(distinct selected.discipline order by selected.discipline) as disciplines
    from (
      select distinct raw.discipline
      from unnest(p_disciplines) as raw(discipline)
    ) selected
    join public.operational_group_discipline_map map on map.discipline = selected.discipline
    join public.operational_group_definitions defs
      on defs.group_code = map.group_code
      and defs.school_order = p_school_order
      and defs.active = true
    group by map.group_code
  ) grouped
  on conflict (user_id, academic_year, group_code)
  do update set
    school_order = case
      when public.team_operational_memberships.membership_state = 'FORMALIZZATO'
        then public.team_operational_memberships.school_order
      else excluded.school_order
    end,
    member_role = case
      when public.team_operational_memberships.membership_state = 'FORMALIZZATO'
        then public.team_operational_memberships.member_role
      else 'docente'
    end,
    disciplines = case
      when public.team_operational_memberships.membership_state = 'FORMALIZZATO'
        then public.team_operational_memberships.disciplines
      else excluded.disciplines
    end,
    updated_at = now();

  select jsonb_build_object(
    'academic_year', p_academic_year,
    'school_order', p_school_order,
    'groups', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'group_code', membership.group_code,
          'member_role', membership.member_role,
          'membership_state', membership.membership_state,
          'disciplines', membership.disciplines
        ) order by membership.group_code
      ),
      '[]'::jsonb
    )
  ) into v_result
  from public.team_operational_memberships membership
  where membership.user_id = v_user
    and membership.academic_year = p_academic_year
    and membership.school_order = p_school_order;

  return v_result;
end;
$$;

revoke all on function public.upsert_my_operational_profile_v1(text,text,text[],text) from public;
grant execute on function public.upsert_my_operational_profile_v1(text,text,text[],text) to authenticated;

-- La registrazione dell'esito richiede due condizioni indipendenti:
-- A) membership condivisa verificata Dipartimento/Referente;
-- B) competenza operativa sulla disciplina esatta.
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

  select operational.membership_state into v_actor_operational_state
  from public.team_operational_memberships operational
  where operational.user_id = v_user
    and operational.academic_year = p_academic_year
    and operational.group_code = p_group_code
    and operational.membership_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO')
    and p_discipline = any(operational.disciplines);

  if v_actor_operational_state is null then
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
      workspace_id,
      academic_year,
      group_code,
      discipline,
      proposal_ref,
      proposal_fingerprint,
      outcome,
      shared_text,
      rationale,
      recorded_by_user_id,
      recorded_by_role,
      recorded_by_operational_role,
      authority_state,
      recorded_at,
      client_request_id
    ) values (
      p_workspace_id,
      p_academic_year,
      p_group_code,
      p_discipline,
      p_proposal_ref,
      p_proposal_fingerprint,
      p_outcome,
      case when p_outcome = 'shared-text' then trim(p_shared_text) else null end,
      trim(p_rationale),
      v_user,
      v_workspace_role,
      'coordinatore',
      v_authority_state,
      now(),
      p_client_request_id
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

revoke all on function public.record_team_review_outcome_v2(uuid,text,text,text,text,text,text,text,text,text) from public;
grant execute on function public.record_team_review_outcome_v2(uuid,text,text,text,text,text,text,text,text,text) to authenticated;

-- Protegge anche insert diretti o percorsi legacy: il ruolo organizzativo deve
-- provenire dalla membership condivisa verificata, non dal profilo personale.
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
    or new.recorded_by_operational_role <> 'coordinatore'
    or new.authority_state is null
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

revoke all on function public.assert_team_operational_outcome_scope_v1() from public;

drop trigger if exists team_review_outcomes_require_current_organizational_binding on public.team_review_outcomes;
drop trigger if exists team_review_outcomes_require_operational_scope on public.team_review_outcomes;
create trigger team_review_outcomes_require_operational_scope
before insert on public.team_review_outcomes
for each row execute function public.assert_team_operational_outcome_scope_v1();

comment on function public.upsert_my_operational_profile_v1(text,text,text[],text) is
'Self-service del profilo: dichiara esclusivamente competenze disciplinari. Il parametro coordinator è mantenuto per compatibilità e deve essere NULL; nessuna autorità di team può essere autoattribuita.';

comment on function public.record_team_review_outcome_v2(uuid,text,text,text,text,text,text,text,text,text) is
'Registra un esito professionale solo se il chiamante possiede una membership condivisa attiva Dipartimento/Referente, competenza sulla disciplina e copertura richiesta. Non costituisce approvazione istituzionale.';

comment on trigger team_review_outcomes_require_operational_scope on public.team_review_outcomes is
'Fail-closed: impedisce insert legacy o diretti senza ruolo condiviso Dipartimento/Referente verificato e competenza disciplinare corrente.';
