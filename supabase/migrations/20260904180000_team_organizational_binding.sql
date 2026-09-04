-- CurManLight Arena — gruppi operativi disciplinari 2026/2027
--
-- Regole di autorità:
-- 1. i gruppi sono costituiti per disciplina, non per nominativo;
-- 2. l'utente dichiara la propria competenza disciplinare e l'eventuale funzione
--    di coordinatore operativo;
-- 3. OPERATIVO_PROVVISORIO consente il lavoro professionale ma non equivale a
--    formalizzazione istituzionale;
-- 4. appartenenza al gruppo != competenza sulla singola disciplina;
-- 5. Educazione civica e AI Literacy sono assi trasversali instradati per nucleo;
-- 6. contributo individuale != esito professionale del gruppo != decisione
--    istituzionale != curricolo vigente.

create table if not exists public.operational_group_definitions (
  group_code text primary key check (
    group_code in ('P-G01','P-G02','P-G03','P-G04','S-G01','S-G02','S-G03','S-G04')
  ),
  school_order text not null check (school_order in ('primaria','secondaria')),
  label text not null check (char_length(trim(label)) between 1 and 240),
  active boolean not null default true
);

create table if not exists public.operational_group_discipline_map (
  group_code text not null references public.operational_group_definitions(group_code) on delete restrict,
  discipline text not null check (
    discipline = trim(discipline)
    and char_length(discipline) between 1 and 120
    and position(chr(31) in discipline) = 0
  ),
  primary key (group_code, discipline)
);

create table if not exists public.operational_transversal_axes (
  axis_code text primary key check (axis_code in ('educazione-civica','ai-literacy')),
  label text not null check (char_length(trim(label)) between 1 and 240),
  routing_mode text not null default 'NUCLEUS' check (routing_mode = 'NUCLEUS')
);

insert into public.operational_group_definitions(group_code, school_order, label, active) values
  ('P-G01','primaria','Area linguistico-storico-geografica',true),
  ('P-G02','primaria','Area matematico-scientifico-tecnologica',true),
  ('P-G03','primaria','Area delle lingue straniere',true),
  ('P-G04','primaria','Area artistico-espressiva e motoria',true),
  ('S-G01','secondaria','Area linguistico-storico-geografica',true),
  ('S-G02','secondaria','Area matematico-scientifico-tecnologica',true),
  ('S-G03','secondaria','Area delle lingue straniere',true),
  ('S-G04','secondaria','Area artistico-espressiva e motoria',true)
on conflict (group_code) do update set
  school_order = excluded.school_order,
  label = excluded.label,
  active = excluded.active;

insert into public.operational_group_discipline_map(group_code, discipline) values
  ('P-G01','italiano'),('P-G01','storia'),('P-G01','geografia'),('P-G01','religione'),
  ('P-G02','matematica'),('P-G02','scienze'),('P-G02','tecnologia'),
  ('P-G03','inglese'),
  ('P-G04','musica'),('P-G04','arteImmagine'),('P-G04','educazioneFisica'),
  ('S-G01','italiano'),('S-G01','storia'),('S-G01','geografia'),('S-G01','latino'),('S-G01','religione'),
  ('S-G02','matematica'),('S-G02','scienze'),('S-G02','tecnologia'),
  ('S-G03','inglese'),('S-G03','secondaLingua'),
  ('S-G04','musica'),('S-G04','arteImmagine'),('S-G04','educazioneFisica')
on conflict do nothing;

insert into public.operational_transversal_axes(axis_code, label, routing_mode) values
  ('educazione-civica','Educazione civica','NUCLEUS'),
  ('ai-literacy','AI Literacy','NUCLEUS')
on conflict (axis_code) do update set
  label = excluded.label,
  routing_mode = excluded.routing_mode;

alter table public.operational_group_definitions enable row level security;
alter table public.operational_group_discipline_map enable row level security;
alter table public.operational_transversal_axes enable row level security;

drop policy if exists operational_group_definitions_read on public.operational_group_definitions;
create policy operational_group_definitions_read on public.operational_group_definitions
for select to authenticated using (true);

drop policy if exists operational_group_discipline_map_read on public.operational_group_discipline_map;
create policy operational_group_discipline_map_read on public.operational_group_discipline_map
for select to authenticated using (true);

drop policy if exists operational_transversal_axes_read on public.operational_transversal_axes;
create policy operational_transversal_axes_read on public.operational_transversal_axes
for select to authenticated using (true);

revoke insert, update, delete on public.operational_group_definitions from anon, authenticated;
revoke insert, update, delete on public.operational_group_discipline_map from anon, authenticated;
revoke insert, update, delete on public.operational_transversal_axes from anon, authenticated;
grant select on public.operational_group_definitions to authenticated;
grant select on public.operational_group_discipline_map to authenticated;
grant select on public.operational_transversal_axes to authenticated;

create table if not exists public.team_operational_memberships (
  user_id uuid not null references auth.users(id) on delete restrict,
  academic_year text not null check (academic_year ~ '^[0-9]{4}/[0-9]{4}$'),
  school_order text not null check (school_order in ('primaria','secondaria')),
  group_code text not null references public.operational_group_definitions(group_code) on delete restrict,
  member_role text not null check (member_role in ('docente','coordinatore')),
  membership_state text not null default 'OPERATIVO_PROVVISORIO' check (
    membership_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO')
  ),
  disciplines text[] not null check (cardinality(disciplines) > 0),
  source_ref text,
  source_date date,
  formalized_by_user_id uuid references auth.users(id) on delete restrict,
  formalized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, academic_year, group_code),
  check (
    membership_state <> 'FORMALIZZATO'
    or (
      source_ref is not null
      and char_length(trim(source_ref)) > 0
      and source_date is not null
      and formalized_by_user_id is not null
      and formalized_at is not null
    )
  )
);

alter table public.team_operational_memberships enable row level security;

drop policy if exists team_operational_memberships_select_own on public.team_operational_memberships;
create policy team_operational_memberships_select_own
on public.team_operational_memberships
for select to authenticated using (user_id = auth.uid());

revoke insert, update, delete on public.team_operational_memberships from anon, authenticated;
grant select on public.team_operational_memberships to authenticated;

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
  v_group_count integer;
  v_result jsonb;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
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

  if p_coordinator_group_code is not null then
    if p_coordinator_group_code <> trim(p_coordinator_group_code) or p_coordinator_group_code = '' then
      raise exception 'INVALID_COORDINATOR_GROUP' using errcode = '22023';
    end if;
    select count(*)::integer into v_group_count
    from public.operational_group_discipline_map map
    join public.operational_group_definitions defs on defs.group_code = map.group_code
    where map.discipline = any(p_disciplines)
      and defs.school_order = p_school_order
      and defs.group_code = p_coordinator_group_code
      and defs.active = true;
    if v_group_count = 0 then
      raise exception 'COORDINATOR_GROUP_NOT_IN_PROFILE' using errcode = '22023';
    end if;
  end if;

  -- Only provisional rows may be replaced by self-service onboarding.
  -- A future formalization is never silently downgraded by a later local edit.
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
    case when grouped.group_code = p_coordinator_group_code then 'coordinatore' else 'docente' end,
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
      else excluded.member_role
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

-- Scope the existing review receipts without breaking the earlier draft migrations.
alter table public.team_review_contributions
  add column if not exists academic_year text,
  add column if not exists group_code text references public.operational_group_definitions(group_code) on delete restrict,
  add column if not exists discipline text;

alter table public.team_review_outcomes
  add column if not exists academic_year text,
  add column if not exists group_code text references public.operational_group_definitions(group_code) on delete restrict,
  add column if not exists discipline text,
  add column if not exists authority_state text,
  add column if not exists recorded_by_operational_role text;

alter table public.team_review_outcomes
  drop constraint if exists team_review_outcomes_recorded_by_role_check;
alter table public.team_review_outcomes
  drop constraint if exists team_review_outcomes_recorded_by_workspace_role_check;
alter table public.team_review_outcomes
  add constraint team_review_outcomes_recorded_by_workspace_role_check
  check (recorded_by_role in ('docente','dipartimento','referente'));

alter table public.team_review_outcomes
  drop constraint if exists team_review_outcomes_authority_state_check;
alter table public.team_review_outcomes
  add constraint team_review_outcomes_authority_state_check
  check (authority_state is null or authority_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO'));

alter table public.team_review_outcomes
  drop constraint if exists team_review_outcomes_operational_role_check;
alter table public.team_review_outcomes
  add constraint team_review_outcomes_operational_role_check
  check (recorded_by_operational_role is null or recorded_by_operational_role = 'coordinatore');

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
  v_has_competence boolean;
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

  if v_workspace_role not in ('docente','dipartimento','referente') then
    raise exception 'TEAM_REVIEW_CONTRIBUTE_REQUIRED' using errcode = '42501';
  end if;

  select exists (
    select 1 from public.team_operational_memberships operational
    where operational.user_id = v_user
      and operational.academic_year = p_academic_year
      and operational.group_code = p_group_code
      and operational.membership_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO')
      and p_discipline = any(operational.disciplines)
  ) into v_has_competence;

  if not v_has_competence then
    raise exception 'OPERATIONAL_DISCIPLINE_MEMBERSHIP_REQUIRED' using errcode = '42501';
  end if;

  insert into public.team_review_contributions(
    workspace_id,
    academic_year,
    group_code,
    discipline,
    proposal_ref,
    proposal_fingerprint,
    contributor_user_id,
    contributor_role,
    orientation,
    custom_text,
    updated_at
  ) values (
    p_workspace_id,
    p_academic_year,
    p_group_code,
    p_discipline,
    p_proposal_ref,
    p_proposal_fingerprint,
    v_user,
    v_workspace_role,
    p_orientation,
    case when p_orientation = 'propose-change' then trim(p_custom_text) else null end,
    now()
  )
  on conflict (workspace_id, proposal_ref, contributor_user_id)
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

revoke all on function public.upsert_team_review_contribution_v2(uuid,text,text,text,text,text,text,text) from public;
grant execute on function public.upsert_team_review_contribution_v2(uuid,text,text,text,text,text,text,text) to authenticated;

create or replace function public.get_team_review_eligible_contributor_count_v3(
  p_workspace_id uuid,
  p_academic_year text,
  p_group_code text,
  p_discipline text
) returns integer
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_member_active boolean;
  v_count integer;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;

  select exists (
    select 1
    from public.workspace_memberships membership
    join public.workspaces workspace on workspace.id = membership.workspace_id
    where membership.workspace_id = p_workspace_id
      and membership.user_id = v_user
      and membership.status = 'active'
      and workspace.status = 'active'
  ) into v_member_active;

  if not v_member_active then
    raise exception 'ACTIVE_WORKSPACE_MEMBERSHIP_REQUIRED' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.operational_group_discipline_map map
    where map.group_code = p_group_code and map.discipline = p_discipline
  ) then
    raise exception 'INVALID_OPERATIONAL_REVIEW_SCOPE' using errcode = '22023';
  end if;

  select count(distinct membership.user_id)::integer into v_count
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

  return v_count;
end;
$$;

revoke all on function public.get_team_review_eligible_contributor_count_v3(uuid,text,text,text) from public;
grant execute on function public.get_team_review_eligible_contributor_count_v3(uuid,text,text,text) to authenticated;

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
  v_coordinator_state text;
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

  if v_workspace_role not in ('docente','dipartimento','referente') then
    raise exception 'TEAM_REVIEW_DECIDE_REQUIRED' using errcode = '42501';
  end if;

  select operational.membership_state into v_coordinator_state
  from public.team_operational_memberships operational
  where operational.user_id = v_user
    and operational.academic_year = p_academic_year
    and operational.group_code = p_group_code
    and operational.member_role = 'coordinatore'
    and operational.membership_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO');

  if v_coordinator_state is null then
    raise exception 'OPERATIONAL_COORDINATOR_REQUIRED' using errcode = '42501';
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

  select count(distinct contribution.contributor_user_id)::integer into v_current_count
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
    when v_coordinator_state = 'FORMALIZZATO' and v_all_formalized then 'FORMALIZZATO'
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

-- Old v1 clients must not be able to bypass the operational coordinator scope.
create or replace function public.assert_team_operational_outcome_scope_v1()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_state text;
begin
  if new.academic_year is null
    or new.group_code is null
    or new.discipline is null
    or new.recorded_by_operational_role <> 'coordinatore'
    or new.authority_state is null
  then
    raise exception 'OPERATIONAL_TEAM_SCOPE_REQUIRED' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.operational_group_discipline_map map
    where map.group_code = new.group_code and map.discipline = new.discipline
  ) then
    raise exception 'INVALID_OPERATIONAL_REVIEW_SCOPE' using errcode = '22023';
  end if;

  select operational.membership_state into v_state
  from public.team_operational_memberships operational
  where operational.user_id = new.recorded_by_user_id
    and operational.academic_year = new.academic_year
    and operational.group_code = new.group_code
    and operational.member_role = 'coordinatore'
    and operational.membership_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO');

  if v_state is null then
    raise exception 'OPERATIONAL_COORDINATOR_REQUIRED' using errcode = '42501';
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

comment on table public.operational_group_definitions is
'Eight stable operational discipline groups for primary and lower-secondary onboarding. They are working structures, not evidence of institutional formalization.';

comment on table public.team_operational_memberships is
'Self-declared operational group membership by authenticated user. OPERATIVO_PROVVISORIO is sufficient for professional working outcomes but never for institutional approval.';

comment on function public.upsert_my_operational_profile_v1(text,text,text[],text) is
'Onboarding self-service: derives group memberships from declared disciplines and optionally records one operational coordinator role. It grants no institutional authority.';

comment on function public.get_team_review_eligible_contributor_count_v3(uuid,text,text,text) is
'Privacy-minimal denominator: counts active workspace users who declared competence for the exact discipline inside the operational group.';

comment on trigger team_review_outcomes_require_operational_scope on public.team_review_outcomes is
'Prevents legacy or direct paths from recording a team outcome without an operational group, discipline, academic year and coordinator.';
