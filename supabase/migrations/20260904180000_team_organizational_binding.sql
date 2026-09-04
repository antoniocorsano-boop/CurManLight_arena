-- CurManLight Arena — source-bound institutional team identity
--
-- Non-negotiable rule:
-- workspace membership != institutional work-group membership.
--
-- Individual review remains available without this binding. Full-team coverage and
-- team outcomes fail closed until an authorized human confirms that the active
-- contributor memberships correspond to a current institutional source.

create table if not exists public.team_organizational_bindings (
  workspace_id uuid primary key references public.workspaces(id) on delete restrict,
  academic_year text not null check (academic_year ~ '^[0-9]{4}/[0-9]{4}$'),
  school_order text not null check (
    school_order in ('infanzia','primaria','secondaria-primo-grado','istituto')
  ),
  group_type text not null check (
    group_type in ('dipartimento','ambito-disciplinare','classi-parallele','plesso','campo-esperienza','commissione','altro')
  ),
  official_label text not null check (char_length(trim(official_label)) between 1 and 240),
  competence_scope text not null check (char_length(trim(competence_scope)) between 1 and 1000),
  source_ref text not null check (
    source_ref = trim(source_ref)
    and char_length(source_ref) between 1 and 1000
    and position(chr(31) in source_ref) = 0
  ),
  source_date date not null,
  valid_from date not null,
  valid_to date,
  responsible_user_id uuid references auth.users(id) on delete restrict,
  confirmation_state text not null check (
    confirmation_state in (
      'CONFIRMED_CURRENT',
      'PARTIALLY_CONFIRMED',
      'UNCONFIRMED_CURRENT',
      'HISTORICAL_REFERENCE',
      'SUPERSEDED'
    )
  ),
  expected_contributor_count integer check (expected_contributor_count is null or expected_contributor_count > 0),
  membership_fingerprint text check (membership_fingerprint is null or membership_fingerprint ~ '^[0-9a-f]{64}$'),
  confirmed_by_user_id uuid references auth.users(id) on delete restrict,
  confirmed_at timestamptz,
  updated_at timestamptz not null default now(),
  check (valid_to is null or valid_to >= valid_from),
  check (
    confirmation_state <> 'CONFIRMED_CURRENT'
    or (
      expected_contributor_count is not null
      and membership_fingerprint is not null
      and confirmed_by_user_id is not null
      and confirmed_at is not null
    )
  )
);

alter table public.team_organizational_bindings enable row level security;

create policy "team_organizational_bindings_select_active_member"
on public.team_organizational_bindings
for select to authenticated
using (exists (
  select 1
  from public.workspace_memberships m
  join public.workspaces w on w.id = m.workspace_id
  where m.workspace_id = team_organizational_bindings.workspace_id
    and m.user_id = auth.uid()
    and m.status = 'active'
    and w.status = 'active'
));

revoke insert, update, delete on public.team_organizational_bindings from anon, authenticated;
grant select on public.team_organizational_bindings to authenticated;

create or replace function public.compute_team_review_membership_snapshot_v1(
  p_workspace_id uuid
) returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_count integer;
  v_canonical text;
  v_fingerprint text;
begin
  select
    count(*)::integer,
    coalesce(
      string_agg(
        m.user_id::text || ':' || m.role,
        '|' order by m.user_id::text, m.role
      ),
      ''
    )
  into v_count, v_canonical
  from public.workspace_memberships m
  where m.workspace_id = p_workspace_id
    and m.status = 'active'
    and m.role in ('docente','dipartimento','referente');

  v_fingerprint := encode(digest(convert_to(v_canonical, 'UTF8'), 'sha256'), 'hex');

  return jsonb_build_object(
    'count', v_count,
    'fingerprint', v_fingerprint
  );
end;
$$;

revoke all on function public.compute_team_review_membership_snapshot_v1(uuid) from public;
-- Intentionally no client grant: this helper is used only by guarded server functions.

create or replace function public.confirm_team_organizational_binding_v1(
  p_workspace_id uuid,
  p_academic_year text,
  p_school_order text,
  p_group_type text,
  p_official_label text,
  p_competence_scope text,
  p_source_ref text,
  p_source_date date,
  p_valid_from date,
  p_valid_to date,
  p_responsible_user_id uuid,
  p_source_expected_contributor_count integer
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_role text;
  v_snapshot jsonb;
  v_count integer;
  v_fingerprint text;
  v_row public.team_organizational_bindings%rowtype;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;

  select m.role into v_role
  from public.workspace_memberships m
  join public.workspaces w on w.id = m.workspace_id
  where m.workspace_id = p_workspace_id
    and m.user_id = v_user
    and m.status = 'active'
    and w.status = 'active';

  -- A department cannot self-certify its own organizational denominator.
  if v_role not in ('dirigente','amministratore') then
    raise exception 'ORGANIZATIONAL_BINDING_AUTHORITY_REQUIRED' using errcode = '42501';
  end if;

  if p_academic_year is null or p_academic_year !~ '^[0-9]{4}/[0-9]{4}$' then
    raise exception 'INVALID_ACADEMIC_YEAR' using errcode = '22023';
  end if;
  if p_school_order not in ('infanzia','primaria','secondaria-primo-grado','istituto') then
    raise exception 'INVALID_SCHOOL_ORDER' using errcode = '22023';
  end if;
  if p_group_type not in ('dipartimento','ambito-disciplinare','classi-parallele','plesso','campo-esperienza','commissione','altro') then
    raise exception 'INVALID_GROUP_TYPE' using errcode = '22023';
  end if;
  if p_official_label is null or char_length(trim(p_official_label)) = 0 then
    raise exception 'OFFICIAL_LABEL_REQUIRED' using errcode = '22023';
  end if;
  if p_competence_scope is null or char_length(trim(p_competence_scope)) = 0 then
    raise exception 'COMPETENCE_SCOPE_REQUIRED' using errcode = '22023';
  end if;
  if p_source_ref is null
    or p_source_ref <> trim(p_source_ref)
    or p_source_ref = ''
    or position(chr(31) in p_source_ref) > 0
  then
    raise exception 'ORGANIZATIONAL_SOURCE_REQUIRED' using errcode = '22023';
  end if;
  if p_source_date is null or p_valid_from is null then
    raise exception 'ORGANIZATIONAL_SOURCE_DATES_REQUIRED' using errcode = '22023';
  end if;
  if p_valid_to is not null and p_valid_to < p_valid_from then
    raise exception 'INVALID_BINDING_VALIDITY' using errcode = '22023';
  end if;
  if p_source_expected_contributor_count is null or p_source_expected_contributor_count <= 0 then
    raise exception 'SOURCE_MEMBER_COUNT_REQUIRED' using errcode = '22023';
  end if;

  v_snapshot := public.compute_team_review_membership_snapshot_v1(p_workspace_id);
  v_count := (v_snapshot ->> 'count')::integer;
  v_fingerprint := v_snapshot ->> 'fingerprint';

  -- The source-derived denominator and the technical workspace must agree before
  -- the binding can become current. No missing or extra contributor is ignored.
  if v_count <> p_source_expected_contributor_count then
    raise exception 'ORGANIZATIONAL_SOURCE_MEMBERSHIP_COUNT_MISMATCH' using errcode = '23514';
  end if;

  insert into public.team_organizational_bindings(
    workspace_id,
    academic_year,
    school_order,
    group_type,
    official_label,
    competence_scope,
    source_ref,
    source_date,
    valid_from,
    valid_to,
    responsible_user_id,
    confirmation_state,
    expected_contributor_count,
    membership_fingerprint,
    confirmed_by_user_id,
    confirmed_at,
    updated_at
  ) values (
    p_workspace_id,
    p_academic_year,
    p_school_order,
    p_group_type,
    trim(p_official_label),
    trim(p_competence_scope),
    p_source_ref,
    p_source_date,
    p_valid_from,
    p_valid_to,
    p_responsible_user_id,
    'CONFIRMED_CURRENT',
    v_count,
    v_fingerprint,
    v_user,
    now(),
    now()
  )
  on conflict (workspace_id)
  do update set
    academic_year = excluded.academic_year,
    school_order = excluded.school_order,
    group_type = excluded.group_type,
    official_label = excluded.official_label,
    competence_scope = excluded.competence_scope,
    source_ref = excluded.source_ref,
    source_date = excluded.source_date,
    valid_from = excluded.valid_from,
    valid_to = excluded.valid_to,
    responsible_user_id = excluded.responsible_user_id,
    confirmation_state = excluded.confirmation_state,
    expected_contributor_count = excluded.expected_contributor_count,
    membership_fingerprint = excluded.membership_fingerprint,
    confirmed_by_user_id = excluded.confirmed_by_user_id,
    confirmed_at = excluded.confirmed_at,
    updated_at = excluded.updated_at
  returning * into v_row;

  return jsonb_build_object(
    'workspace_id', v_row.workspace_id,
    'academic_year', v_row.academic_year,
    'school_order', v_row.school_order,
    'group_type', v_row.group_type,
    'official_label', v_row.official_label,
    'competence_scope', v_row.competence_scope,
    'source_ref', v_row.source_ref,
    'source_date', v_row.source_date,
    'valid_from', v_row.valid_from,
    'valid_to', v_row.valid_to,
    'confirmation_state', v_row.confirmation_state,
    'expected_contributor_count', v_row.expected_contributor_count,
    'membership_fingerprint', v_row.membership_fingerprint,
    'confirmed_by_user_id', v_row.confirmed_by_user_id,
    'confirmed_at', v_row.confirmed_at
  );
end;
$$;

revoke all on function public.confirm_team_organizational_binding_v1(uuid,text,text,text,text,text,text,date,date,date,uuid,integer) from public;
grant execute on function public.confirm_team_organizational_binding_v1(uuid,text,text,text,text,text,text,date,date,date,uuid,integer) to authenticated;

create or replace function public.get_team_review_eligible_contributor_count_v2(
  p_workspace_id uuid
) returns integer
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_member_active boolean;
  v_binding public.team_organizational_bindings%rowtype;
  v_snapshot jsonb;
  v_count integer;
  v_fingerprint text;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;

  select exists (
    select 1
    from public.workspace_memberships m
    join public.workspaces w on w.id = m.workspace_id
    where m.workspace_id = p_workspace_id
      and m.user_id = v_user
      and m.status = 'active'
      and w.status = 'active'
  ) into v_member_active;

  if not v_member_active then
    raise exception 'ACTIVE_WORKSPACE_MEMBERSHIP_REQUIRED' using errcode = '42501';
  end if;

  select * into v_binding
  from public.team_organizational_bindings
  where workspace_id = p_workspace_id
    and confirmation_state = 'CONFIRMED_CURRENT'
    and valid_from <= current_date
    and (valid_to is null or valid_to >= current_date);

  if not found then
    return null;
  end if;

  v_snapshot := public.compute_team_review_membership_snapshot_v1(p_workspace_id);
  v_count := (v_snapshot ->> 'count')::integer;
  v_fingerprint := v_snapshot ->> 'fingerprint';

  if v_count <= 0
    or v_binding.expected_contributor_count <> v_count
    or v_binding.membership_fingerprint <> v_fingerprint
  then
    return null;
  end if;

  return v_count;
end;
$$;

revoke all on function public.get_team_review_eligible_contributor_count_v2(uuid) from public;
grant execute on function public.get_team_review_eligible_contributor_count_v2(uuid) to authenticated;

create or replace function public.assert_team_organizational_binding_current_v1()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_binding public.team_organizational_bindings%rowtype;
  v_snapshot jsonb;
  v_count integer;
  v_fingerprint text;
begin
  select * into v_binding
  from public.team_organizational_bindings
  where workspace_id = new.workspace_id
    and confirmation_state = 'CONFIRMED_CURRENT'
    and valid_from <= current_date
    and (valid_to is null or valid_to >= current_date);

  if not found then
    raise exception 'TEAM_ORGANIZATIONAL_BINDING_REQUIRED' using errcode = '42501';
  end if;

  v_snapshot := public.compute_team_review_membership_snapshot_v1(new.workspace_id);
  v_count := (v_snapshot ->> 'count')::integer;
  v_fingerprint := v_snapshot ->> 'fingerprint';

  if v_count <= 0
    or v_binding.expected_contributor_count <> v_count
    or v_binding.membership_fingerprint <> v_fingerprint
  then
    raise exception 'TEAM_ORGANIZATIONAL_BINDING_STALE' using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.assert_team_organizational_binding_current_v1() from public;

drop trigger if exists team_review_outcomes_require_current_organizational_binding
on public.team_review_outcomes;

create trigger team_review_outcomes_require_current_organizational_binding
before insert on public.team_review_outcomes
for each row execute function public.assert_team_organizational_binding_current_v1();

comment on table public.team_organizational_bindings is
'Annual, source-bound identity of the institutional work group represented by a workspace. No current group is inferred or seeded automatically.';

comment on function public.get_team_review_eligible_contributor_count_v2(uuid) is
'Returns full-team denominator only when current active contributor memberships still match a human-confirmed institutional-source binding; otherwise NULL.';

comment on trigger team_review_outcomes_require_current_organizational_binding on public.team_review_outcomes is
'Fail-closed guard: no team outcome may be persisted without a current, source-bound organizational identity matching the active workspace contributors.';
