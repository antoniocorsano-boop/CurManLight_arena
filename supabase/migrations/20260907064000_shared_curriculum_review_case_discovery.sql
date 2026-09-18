-- CurManLight Arena — shared CurriculumReviewCase discovery / assignment.
--
-- This migration distributes the immutable opening snapshot of a targeted
-- CurriculumReviewCase to the active, operationally competent participants of
-- the same workspace/group/discipline. It does NOT persist a participant's
-- CurriculumWorkSession and does NOT advance H2, H3, institutional authority,
-- adoption or the canonical curriculum.

create table if not exists public.shared_curriculum_review_cases (
  case_id text not null,
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  academic_year text not null check (academic_year ~ '^[0-9]{4}/[0-9]{4}$'),
  group_code text not null references public.operational_group_definitions(group_code) on delete restrict,
  discipline text not null,
  school_order text not null check (school_order in ('primaria','secondaria')),
  class_or_age_band text not null,
  curriculum_unit_key text not null,
  master_id text not null check (master_id = 'CAN-CURR-MASTER-00'),
  master_drive_file_id text not null,
  master_version text not null,
  trigger_id text not null,
  trigger_type text not null check (trigger_type in ('EXTERNAL_NORMATIVE','INSTITUTE_NEED','PRACTICE_SIGNAL','PERIODIC_REVIEW')),
  qualification_basis text not null check (qualification_basis in (
    'AGGREGATED_PRACTICE_SIGNAL',
    'EXPLICIT_PROFESSIONAL_REASON',
    'QUALIFIED_EXTERNAL_NORMATIVE_SOURCE',
    'EXPLICIT_INSTITUTE_NEED',
    'PERIODIC_REVIEW_WITH_EXPLICIT_REASON'
  )),
  trigger_recorded_at timestamptz not null,
  targeted_proposal_refs text[] not null check (cardinality(targeted_proposal_refs) between 1 and 50),
  scope_reason text not null check (char_length(trim(scope_reason)) between 1 and 1200),
  opened_at timestamptz not null,
  opened_by_user_id uuid not null references auth.users(id) on delete restrict,
  opened_by_role text not null check (opened_by_role in ('dipartimento','referente')),
  published_by_user_id uuid not null references auth.users(id) on delete restrict,
  published_by_role text not null check (published_by_role in ('dipartimento','referente')),
  published_at timestamptz not null default now(),
  case_status text not null default 'ASSIGNED_FOR_PROFESSIONAL_REVIEW' check (
    case_status = 'ASSIGNED_FOR_PROFESSIONAL_REVIEW'
  ),
  primary key (workspace_id, case_id),
  check (
    case_id = trim(case_id)
    and case_id <> ''
    and case_id like 'CRC:%'
    and position(chr(31) in case_id) = 0
  ),
  check (discipline = trim(discipline) and discipline <> '' and position(chr(31) in discipline) = 0),
  check (curriculum_unit_key = trim(curriculum_unit_key) and curriculum_unit_key <> '' and position(chr(31) in curriculum_unit_key) = 0),
  check (master_drive_file_id = trim(master_drive_file_id) and master_drive_file_id <> ''),
  check (master_version = trim(master_version) and master_version <> ''),
  check (trigger_id = trim(trigger_id) and trigger_id <> '' and position(chr(31) in trigger_id) = 0)
);

create table if not exists public.shared_curriculum_review_case_assignments (
  workspace_id uuid not null,
  case_id text not null,
  assigned_user_id uuid not null references auth.users(id) on delete restrict,
  assigned_workspace_role text not null check (assigned_workspace_role in ('docente','dipartimento','referente')),
  assigned_operational_role text not null check (assigned_operational_role in ('docente','coordinatore')),
  assignment_state text not null default 'ASSIGNED' check (assignment_state = 'ASSIGNED'),
  assigned_at timestamptz not null default now(),
  primary key (workspace_id, case_id, assigned_user_id),
  foreign key (workspace_id, case_id)
    references public.shared_curriculum_review_cases(workspace_id, case_id)
    on delete cascade
);

create index if not exists shared_curriculum_review_case_assignments_user_idx
  on public.shared_curriculum_review_case_assignments(assigned_user_id, workspace_id, assignment_state);
create index if not exists shared_curriculum_review_cases_scope_idx
  on public.shared_curriculum_review_cases(workspace_id, academic_year, group_code, discipline, published_at desc);

alter table public.shared_curriculum_review_cases enable row level security;
alter table public.shared_curriculum_review_case_assignments enable row level security;

revoke all on public.shared_curriculum_review_cases from public, anon, authenticated;
revoke all on public.shared_curriculum_review_case_assignments from public, anon, authenticated;

create or replace function public.publish_curriculum_review_case_v1(
  p_workspace_id uuid,
  p_academic_year text,
  p_group_code text,
  p_discipline text,
  p_case_id text,
  p_school_order text,
  p_class_or_age_band text,
  p_curriculum_unit_key text,
  p_master_id text,
  p_master_drive_file_id text,
  p_master_version text,
  p_trigger_id text,
  p_trigger_type text,
  p_qualification_basis text,
  p_trigger_recorded_at timestamptz,
  p_targeted_proposal_refs text[],
  p_scope_reason text,
  p_opened_at timestamptz,
  p_opened_by_user_id uuid,
  p_opened_by_role text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_workspace_role text;
  v_existing public.shared_curriculum_review_cases%rowtype;
  v_case public.shared_curriculum_review_cases%rowtype;
  v_assignment_count integer;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;
  if p_academic_year is null or p_academic_year !~ '^[0-9]{4}/[0-9]{4}$' then
    raise exception 'INVALID_ACADEMIC_YEAR' using errcode = '22023';
  end if;
  if p_case_id is null or p_case_id <> trim(p_case_id) or p_case_id = '' or p_case_id not like 'CRC:%' or position(chr(31) in p_case_id) > 0 then
    raise exception 'INVALID_SHARED_REVIEW_CASE_ID' using errcode = '22023';
  end if;
  if p_discipline is null or p_discipline <> trim(p_discipline) or p_discipline = '' or position(chr(31) in p_discipline) > 0 then
    raise exception 'INVALID_SHARED_REVIEW_CASE_DISCIPLINE' using errcode = '22023';
  end if;
  if p_curriculum_unit_key is null or p_curriculum_unit_key <> trim(p_curriculum_unit_key) or p_curriculum_unit_key = '' or position(chr(31) in p_curriculum_unit_key) > 0 then
    raise exception 'INVALID_SHARED_REVIEW_CASE_UNIT' using errcode = '22023';
  end if;
  if p_master_id <> 'CAN-CURR-MASTER-00' or nullif(trim(p_master_drive_file_id), '') is null or nullif(trim(p_master_version), '') is null then
    raise exception 'INVALID_SHARED_REVIEW_CASE_MASTER' using errcode = '22023';
  end if;
  if p_trigger_type not in ('EXTERNAL_NORMATIVE','INSTITUTE_NEED','PRACTICE_SIGNAL','PERIODIC_REVIEW') then
    raise exception 'INVALID_SHARED_REVIEW_CASE_TRIGGER_TYPE' using errcode = '22023';
  end if;
  if p_qualification_basis not in (
    'AGGREGATED_PRACTICE_SIGNAL','EXPLICIT_PROFESSIONAL_REASON','QUALIFIED_EXTERNAL_NORMATIVE_SOURCE',
    'EXPLICIT_INSTITUTE_NEED','PERIODIC_REVIEW_WITH_EXPLICIT_REASON'
  ) then
    raise exception 'INVALID_SHARED_REVIEW_CASE_QUALIFICATION' using errcode = '22023';
  end if;
  if p_targeted_proposal_refs is null or cardinality(p_targeted_proposal_refs) < 1 or cardinality(p_targeted_proposal_refs) > 50 then
    raise exception 'SHARED_REVIEW_CASE_EMPTY_SCOPE' using errcode = '22023';
  end if;
  if exists (
    select 1 from unnest(p_targeted_proposal_refs) raw(proposal_ref)
    where raw.proposal_ref is null
      or raw.proposal_ref = ''
      or raw.proposal_ref <> trim(raw.proposal_ref)
      or position(chr(31) in raw.proposal_ref) > 0
  ) then
    raise exception 'INVALID_SHARED_REVIEW_CASE_PROPOSAL_REF' using errcode = '22023';
  end if;
  if (select count(*) from unnest(p_targeted_proposal_refs)) <> (select count(distinct proposal_ref) from unnest(p_targeted_proposal_refs) raw(proposal_ref)) then
    raise exception 'DUPLICATE_SHARED_REVIEW_CASE_PROPOSAL_REF' using errcode = '22023';
  end if;
  if p_scope_reason is null or char_length(trim(p_scope_reason)) = 0 or char_length(trim(p_scope_reason)) > 1200 then
    raise exception 'SHARED_REVIEW_CASE_SCOPE_REASON_REQUIRED' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.operational_group_discipline_map map
    join public.operational_group_definitions defs on defs.group_code = map.group_code
    where map.group_code = p_group_code
      and map.discipline = p_discipline
      and defs.school_order = p_school_order
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

  if v_workspace_role not in ('dipartimento','referente') then
    raise exception 'SHARED_REVIEW_CASE_ASSIGN_REQUIRED' using errcode = '42501';
  end if;
  if p_opened_by_user_id is distinct from v_user or p_opened_by_role is distinct from v_workspace_role then
    raise exception 'SHARED_REVIEW_CASE_OPENING_ACTOR_MISMATCH' using errcode = '42501';
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

  select * into v_existing
  from public.shared_curriculum_review_cases
  where workspace_id = p_workspace_id and case_id = p_case_id;

  if found then
    if v_existing.academic_year <> p_academic_year
      or v_existing.group_code <> p_group_code
      or v_existing.discipline <> p_discipline
      or v_existing.school_order <> p_school_order
      or v_existing.class_or_age_band <> p_class_or_age_band
      or v_existing.curriculum_unit_key <> p_curriculum_unit_key
      or v_existing.master_id <> p_master_id
      or v_existing.master_drive_file_id <> p_master_drive_file_id
      or v_existing.master_version <> p_master_version
      or v_existing.trigger_id <> p_trigger_id
      or v_existing.trigger_type <> p_trigger_type
      or v_existing.qualification_basis <> p_qualification_basis
      or v_existing.trigger_recorded_at <> p_trigger_recorded_at
      or v_existing.targeted_proposal_refs <> p_targeted_proposal_refs
      or v_existing.scope_reason <> trim(p_scope_reason)
      or v_existing.opened_at <> p_opened_at
      or v_existing.opened_by_user_id <> p_opened_by_user_id
      or v_existing.opened_by_role <> p_opened_by_role
    then
      raise exception 'SHARED_REVIEW_CASE_ID_REUSE_MISMATCH' using errcode = '23505';
    end if;
    v_case := v_existing;
  else
    insert into public.shared_curriculum_review_cases(
      case_id, workspace_id, academic_year, group_code, discipline, school_order,
      class_or_age_band, curriculum_unit_key, master_id, master_drive_file_id, master_version,
      trigger_id, trigger_type, qualification_basis, trigger_recorded_at,
      targeted_proposal_refs, scope_reason, opened_at, opened_by_user_id, opened_by_role,
      published_by_user_id, published_by_role
    ) values (
      p_case_id, p_workspace_id, p_academic_year, p_group_code, p_discipline, p_school_order,
      trim(p_class_or_age_band), p_curriculum_unit_key, p_master_id, trim(p_master_drive_file_id), trim(p_master_version),
      p_trigger_id, p_trigger_type, p_qualification_basis, p_trigger_recorded_at,
      p_targeted_proposal_refs, trim(p_scope_reason), p_opened_at, p_opened_by_user_id, p_opened_by_role,
      v_user, v_workspace_role
    ) returning * into v_case;
  end if;

  insert into public.shared_curriculum_review_case_assignments(
    workspace_id, case_id, assigned_user_id, assigned_workspace_role,
    assigned_operational_role, assignment_state, assigned_at
  )
  select
    p_workspace_id,
    p_case_id,
    membership.user_id,
    membership.role,
    operational.member_role,
    'ASSIGNED',
    now()
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  join public.team_operational_memberships operational
    on operational.user_id = membership.user_id
    and operational.academic_year = p_academic_year
    and operational.group_code = p_group_code
    and operational.membership_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO')
    and p_discipline = any(operational.disciplines)
  where membership.workspace_id = p_workspace_id
    and membership.status = 'active'
    and membership.role in ('docente','dipartimento','referente')
    and workspace.status = 'active'
  on conflict (workspace_id, case_id, assigned_user_id)
  do update set
    assigned_workspace_role = excluded.assigned_workspace_role,
    assigned_operational_role = excluded.assigned_operational_role,
    assignment_state = 'ASSIGNED';

  select count(*)::integer into v_assignment_count
  from public.shared_curriculum_review_case_assignments assignment
  where assignment.workspace_id = p_workspace_id
    and assignment.case_id = p_case_id
    and assignment.assignment_state = 'ASSIGNED';

  if v_assignment_count <= 0 then
    raise exception 'SHARED_REVIEW_CASE_NO_ELIGIBLE_ASSIGNEES' using errcode = '23514';
  end if;

  return jsonb_build_object(
    'review_case', jsonb_build_object(
      'case_id', v_case.case_id,
      'workspace_id', v_case.workspace_id,
      'academic_year', v_case.academic_year,
      'group_code', v_case.group_code,
      'discipline', v_case.discipline,
      'school_order', v_case.school_order,
      'class_or_age_band', v_case.class_or_age_band,
      'curriculum_unit_key', v_case.curriculum_unit_key,
      'master_id', v_case.master_id,
      'master_drive_file_id', v_case.master_drive_file_id,
      'master_version', v_case.master_version,
      'trigger_id', v_case.trigger_id,
      'trigger_type', v_case.trigger_type,
      'qualification_basis', v_case.qualification_basis,
      'trigger_recorded_at', v_case.trigger_recorded_at,
      'targeted_proposal_refs', v_case.targeted_proposal_refs,
      'scope_reason', v_case.scope_reason,
      'opened_at', v_case.opened_at,
      'opened_by_user_id', v_case.opened_by_user_id,
      'opened_by_role', v_case.opened_by_role,
      'published_by_user_id', v_case.published_by_user_id,
      'published_by_role', v_case.published_by_role,
      'published_at', v_case.published_at,
      'assignment_state', 'ASSIGNED',
      'assignment_count', v_assignment_count
    ),
    'assignment_count', v_assignment_count
  );
end;
$$;

revoke all on function public.publish_curriculum_review_case_v1(
  uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,timestamptz,text[],text,timestamptz,uuid,text
) from public, anon, authenticated;
grant execute on function public.publish_curriculum_review_case_v1(
  uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,timestamptz,text[],text,timestamptz,uuid,text
) to authenticated;

create or replace function public.list_my_assigned_curriculum_review_cases_v1(
  p_workspace_id uuid,
  p_academic_year text,
  p_group_code text,
  p_discipline text
) returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_workspace_role text;
  v_result jsonb;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;
  if p_academic_year is null or p_academic_year !~ '^[0-9]{4}/[0-9]{4}$' then
    raise exception 'INVALID_ACADEMIC_YEAR' using errcode = '22023';
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
    and membership.role in ('docente','dipartimento','referente')
    and workspace.status = 'active';

  if v_workspace_role is null then
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

  select coalesce(jsonb_agg(item order by item->>'published_at' desc), '[]'::jsonb)
  into v_result
  from (
    select jsonb_build_object(
      'case_id', review_case.case_id,
      'workspace_id', review_case.workspace_id,
      'academic_year', review_case.academic_year,
      'group_code', review_case.group_code,
      'discipline', review_case.discipline,
      'school_order', review_case.school_order,
      'class_or_age_band', review_case.class_or_age_band,
      'curriculum_unit_key', review_case.curriculum_unit_key,
      'master_id', review_case.master_id,
      'master_drive_file_id', review_case.master_drive_file_id,
      'master_version', review_case.master_version,
      'trigger_id', review_case.trigger_id,
      'trigger_type', review_case.trigger_type,
      'qualification_basis', review_case.qualification_basis,
      'trigger_recorded_at', review_case.trigger_recorded_at,
      'targeted_proposal_refs', review_case.targeted_proposal_refs,
      'scope_reason', review_case.scope_reason,
      'opened_at', review_case.opened_at,
      'opened_by_user_id', review_case.opened_by_user_id,
      'opened_by_role', review_case.opened_by_role,
      'published_by_user_id', review_case.published_by_user_id,
      'published_by_role', review_case.published_by_role,
      'published_at', review_case.published_at,
      'assignment_state', assignment.assignment_state,
      'assignment_count', (
        select count(*)::integer
        from public.shared_curriculum_review_case_assignments all_assignments
        where all_assignments.workspace_id = review_case.workspace_id
          and all_assignments.case_id = review_case.case_id
          and all_assignments.assignment_state = 'ASSIGNED'
      )
    ) as item
    from public.shared_curriculum_review_cases review_case
    join public.shared_curriculum_review_case_assignments assignment
      on assignment.workspace_id = review_case.workspace_id
      and assignment.case_id = review_case.case_id
      and assignment.assigned_user_id = v_user
      and assignment.assignment_state = 'ASSIGNED'
    where review_case.workspace_id = p_workspace_id
      and review_case.academic_year = p_academic_year
      and review_case.group_code = p_group_code
      and review_case.discipline = p_discipline
      and review_case.case_status = 'ASSIGNED_FOR_PROFESSIONAL_REVIEW'
  ) rows;

  return v_result;
end;
$$;

revoke all on function public.list_my_assigned_curriculum_review_cases_v1(uuid,text,text,text)
  from public, anon, authenticated;
grant execute on function public.list_my_assigned_curriculum_review_cases_v1(uuid,text,text,text)
  to authenticated;

comment on table public.shared_curriculum_review_cases is
'Immutable opening snapshot used only to discover and assign a targeted CurriculumReviewCase. It is not a CurriculumWorkSession, TeamProfessionalOutcome, InstitutionalDecision or adopted curriculum.';
comment on table public.shared_curriculum_review_case_assignments is
'Assignment receipts derived from active workspace membership plus operational discipline competence. Assignment does not start H2 automatically.';
