-- EC-01/Arena-F3 — shared institutional approval for Educazione civica.
--
-- Authority boundary:
-- - local drafts remain non-authoritative;
-- - only an authenticated active Collegio member may approve;
-- - browser roles have SELECT only, never direct INSERT/UPDATE/DELETE;
-- - approval is atomic, idempotent and CAS-bound to the current EC head;
-- - the candidate must bind to the ACTIVE shared canonical curriculum head.

create extension if not exists pgcrypto;

create table if not exists public.civic_education_approved_frameworks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  institution_id text not null,
  framework_id text not null,
  curriculum_version_id text not null,
  academic_start_year integer not null,
  academic_end_year integer not null,
  school_order text not null check (school_order in ('infanzia','primaria','secondaria')),
  version_label text not null,
  framework_snapshot jsonb not null,
  candidate_fingerprint text not null check (candidate_fingerprint ~ '^[a-f0-9]{64}$'),
  approved_by uuid not null references auth.users(id) on delete restrict,
  approved_by_role text not null check (approved_by_role = 'collegio'),
  approved_at timestamptz not null default now(),
  previous_approved_framework_id text,
  unique (workspace_id, framework_id),
  check (nullif(trim(institution_id), '') is not null),
  check (nullif(trim(framework_id), '') is not null),
  check (nullif(trim(curriculum_version_id), '') is not null),
  check (academic_end_year = academic_start_year + 1),
  check (nullif(trim(version_label), '') is not null),
  check (previous_approved_framework_id is null or previous_approved_framework_id <> framework_id)
);

create table if not exists public.civic_education_approval_receipts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  approved_framework_row_id uuid not null references public.civic_education_approved_frameworks(id) on delete restrict,
  institution_id text not null,
  framework_id text not null,
  curriculum_version_id text not null,
  academic_start_year integer not null,
  academic_end_year integer not null,
  school_order text not null check (school_order in ('infanzia','primaria','secondaria')),
  candidate_fingerprint text not null check (candidate_fingerprint ~ '^[a-f0-9]{64}$'),
  previous_approved_framework_id text,
  approved_by uuid not null references auth.users(id) on delete restrict,
  approved_by_role text not null check (approved_by_role = 'collegio'),
  approved_at timestamptz not null default now(),
  client_request_id text not null,
  status text not null default 'APPROVED' check (status = 'APPROVED'),
  unique (workspace_id, client_request_id),
  unique (workspace_id, framework_id),
  check (academic_end_year = academic_start_year + 1),
  check (nullif(trim(client_request_id), '') is not null)
);

create table if not exists public.civic_education_approved_heads (
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  institution_id text not null,
  academic_start_year integer not null,
  academic_end_year integer not null,
  school_order text not null check (school_order in ('infanzia','primaria','secondaria')),
  approved_framework_row_id uuid not null references public.civic_education_approved_frameworks(id) on delete restrict,
  framework_id text not null,
  approval_receipt_id uuid not null references public.civic_education_approval_receipts(id) on delete restrict,
  approved_at timestamptz not null,
  primary key (workspace_id, institution_id, academic_start_year, school_order),
  check (academic_end_year = academic_start_year + 1)
);

create index if not exists civic_education_approved_frameworks_scope_idx
  on public.civic_education_approved_frameworks(
    workspace_id, institution_id, academic_start_year, school_order, approved_at desc
  );
create index if not exists civic_education_approval_receipts_framework_fk_idx
  on public.civic_education_approval_receipts(approved_framework_row_id);
create index if not exists civic_education_approval_receipts_actor_idx
  on public.civic_education_approval_receipts(approved_by, approved_at desc);
create index if not exists civic_education_approved_heads_framework_fk_idx
  on public.civic_education_approved_heads(approved_framework_row_id);
create index if not exists civic_education_approved_heads_receipt_fk_idx
  on public.civic_education_approved_heads(approval_receipt_id);

alter table public.civic_education_approved_frameworks enable row level security;
alter table public.civic_education_approval_receipts enable row level security;
alter table public.civic_education_approved_heads enable row level security;

revoke insert, update, delete on public.civic_education_approved_frameworks from public, anon, authenticated;
revoke insert, update, delete on public.civic_education_approval_receipts from public, anon, authenticated;
revoke insert, update, delete on public.civic_education_approved_heads from public, anon, authenticated;
grant select on public.civic_education_approved_frameworks to authenticated;
grant select on public.civic_education_approval_receipts to authenticated;
grant select on public.civic_education_approved_heads to authenticated;

drop policy if exists civic_education_approved_frameworks_read on public.civic_education_approved_frameworks;
create policy civic_education_approved_frameworks_read
  on public.civic_education_approved_frameworks
  for select to authenticated
  using (exists (
    select 1
    from public.workspace_memberships membership
    join public.workspaces workspace on workspace.id = membership.workspace_id
    where membership.workspace_id = civic_education_approved_frameworks.workspace_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and workspace.status = 'active'
  ));

drop policy if exists civic_education_approval_receipts_read on public.civic_education_approval_receipts;
create policy civic_education_approval_receipts_read
  on public.civic_education_approval_receipts
  for select to authenticated
  using (exists (
    select 1
    from public.workspace_memberships membership
    join public.workspaces workspace on workspace.id = membership.workspace_id
    where membership.workspace_id = civic_education_approval_receipts.workspace_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and workspace.status = 'active'
  ));

drop policy if exists civic_education_approved_heads_read on public.civic_education_approved_heads;
create policy civic_education_approved_heads_read
  on public.civic_education_approved_heads
  for select to authenticated
  using (exists (
    select 1
    from public.workspace_memberships membership
    join public.workspaces workspace on workspace.id = membership.workspace_id
    where membership.workspace_id = civic_education_approved_heads.workspace_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and workspace.status = 'active'
  ));

create or replace function public.get_current_civic_education_framework_v1(
  p_workspace_id uuid,
  p_expected_context_user_id uuid,
  p_institution_id text,
  p_academic_start_year integer,
  p_academic_end_year integer,
  p_school_order text
)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_role text;
  v_head public.civic_education_approved_heads%rowtype;
  v_framework public.civic_education_approved_frameworks%rowtype;
  v_receipt public.civic_education_approval_receipts%rowtype;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;
  if p_expected_context_user_id is null or p_expected_context_user_id <> v_user then
    raise exception 'WORKSPACE_ACTOR_CONTEXT_PRINCIPAL_MISMATCH' using errcode = '42501';
  end if;
  if p_workspace_id is null
     or nullif(trim(p_institution_id), '') is null
     or p_academic_end_year <> p_academic_start_year + 1
     or p_school_order not in ('infanzia','primaria','secondaria') then
    raise exception 'INVALID_CIVIC_FRAMEWORK_SCOPE' using errcode = '22023';
  end if;

  select membership.role into v_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id
    and membership.user_id = v_user
    and membership.status = 'active'
    and workspace.status = 'active';
  if v_role is null then
    raise exception 'ACTIVE_WORKSPACE_MEMBERSHIP_REQUIRED' using errcode = '42501';
  end if;

  select * into v_head
  from public.civic_education_approved_heads head
  where head.workspace_id = p_workspace_id
    and head.institution_id = trim(p_institution_id)
    and head.academic_start_year = p_academic_start_year
    and head.academic_end_year = p_academic_end_year
    and head.school_order = p_school_order;
  if not found then return null; end if;

  select * into v_framework
  from public.civic_education_approved_frameworks framework
  where framework.id = v_head.approved_framework_row_id
    and framework.workspace_id = p_workspace_id;
  if not found then
    raise exception 'CIVIC_APPROVED_HEAD_FRAMEWORK_MISSING' using errcode = '23514';
  end if;

  select * into v_receipt
  from public.civic_education_approval_receipts receipt
  where receipt.id = v_head.approval_receipt_id
    and receipt.workspace_id = p_workspace_id;
  if not found then
    raise exception 'CIVIC_APPROVED_HEAD_RECEIPT_MISSING' using errcode = '23514';
  end if;

  return jsonb_build_object(
    'framework', v_framework.framework_snapshot,
    'receipt', jsonb_strip_nulls(jsonb_build_object(
      'schemaVersion', 1,
      'id', v_receipt.id::text,
      'workspaceId', v_receipt.workspace_id::text,
      'institutionId', v_receipt.institution_id,
      'frameworkId', v_receipt.framework_id,
      'curriculumVersionId', v_receipt.curriculum_version_id,
      'academicYear', jsonb_build_object(
        'startYear', v_receipt.academic_start_year,
        'endYear', v_receipt.academic_end_year
      ),
      'schoolOrder', v_receipt.school_order,
      'approvedByUserId', v_receipt.approved_by::text,
      'approvedByRole', v_receipt.approved_by_role,
      'approvedAt', v_receipt.approved_at,
      'previousApprovedFrameworkId', v_receipt.previous_approved_framework_id,
      'status', v_receipt.status
    ))
  );
end;
$$;

create or replace function public.approve_civic_education_framework_v1(
  p_workspace_id uuid,
  p_expected_context_user_id uuid,
  p_expected_current_approved_framework_id text,
  p_candidate jsonb,
  p_client_request_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_role text;
  v_framework_id text;
  v_institution_id text;
  v_curriculum_version_id text;
  v_version_label text;
  v_school_order text;
  v_start_year integer;
  v_end_year integer;
  v_current public.civic_education_approved_heads%rowtype;
  v_existing public.civic_education_approval_receipts%rowtype;
  v_existing_framework public.civic_education_approved_frameworks%rowtype;
  v_framework public.civic_education_approved_frameworks%rowtype;
  v_receipt public.civic_education_approval_receipts%rowtype;
  v_canonical_head public.shared_canonical_curriculum_heads%rowtype;
  v_canonical_version public.shared_canonical_curriculum_versions%rowtype;
  v_norm jsonb;
  v_sources jsonb;
  v_source jsonb;
  v_alloc jsonb;
  v_mapping jsonb;
  v_candidate_fingerprint text;
  v_total_hours numeric := 0;
  v_target_key text;
  v_seen_targets text[] := array[]::text[];
  v_has_mim boolean := false;
  v_has_legal boolean := false;
  v_any_changed boolean := false;
  v_now timestamptz := now();
  v_approved_snapshot jsonb;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;
  if p_expected_context_user_id is null or p_expected_context_user_id <> v_user then
    raise exception 'WORKSPACE_ACTOR_CONTEXT_PRINCIPAL_MISMATCH' using errcode = '42501';
  end if;
  if p_workspace_id is null
     or p_candidate is null
     or jsonb_typeof(p_candidate) <> 'object'
     or nullif(trim(p_client_request_id), '') is null
     or char_length(p_client_request_id) > 200
     or position(chr(31) in p_client_request_id) > 0 then
    raise exception 'INVALID_CIVIC_APPROVAL_INPUT' using errcode = '22023';
  end if;

  select membership.role into v_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id
    and membership.user_id = v_user
    and membership.status = 'active'
    and workspace.status = 'active';
  if v_role is null then
    raise exception 'ACTIVE_WORKSPACE_MEMBERSHIP_REQUIRED' using errcode = '42501';
  end if;
  if v_role is distinct from 'collegio' then
    raise exception 'REVISION_DECIDE_REQUIRED' using errcode = '42501';
  end if;

  if p_candidate->>'schemaVersion' is distinct from 'cml-civic-education-framework-v1'
     or p_candidate->>'status' is distinct from 'proposed-to-collegio'
     or nullif(trim(p_candidate->>'id'), '') is null
     or nullif(trim(p_candidate->>'institutionId'), '') is null
     or nullif(trim(p_candidate->>'curriculumVersionId'), '') is null
     or nullif(trim(p_candidate->>'versionLabel'), '') is null
     or nullif(trim(p_candidate->>'createdAt'), '') is null
     or nullif(trim(p_candidate->>'updatedAt'), '') is null
     or (p_candidate ? 'approvedAt')
     or (p_candidate ? 'approvedByRole')
     or jsonb_typeof(p_candidate->'academicYear') <> 'object'
     or coalesce(p_candidate #>> '{academicYear,startYear}', '') !~ '^[0-9]{4}$'
     or coalesce(p_candidate #>> '{academicYear,endYear}', '') !~ '^[0-9]{4}$'
     or coalesce(p_candidate->>'schoolOrder', '') not in ('infanzia','primaria','secondaria')
     or jsonb_typeof(p_candidate->'allocations') <> 'array'
     or jsonb_typeof(p_candidate->'infanziaMappings') <> 'array' then
    raise exception 'INVALID_CIVIC_FRAMEWORK_CANDIDATE' using errcode = '22023';
  end if;

  v_framework_id := trim(p_candidate->>'id');
  v_institution_id := trim(p_candidate->>'institutionId');
  v_curriculum_version_id := trim(p_candidate->>'curriculumVersionId');
  v_version_label := trim(p_candidate->>'versionLabel');
  v_school_order := p_candidate->>'schoolOrder';
  v_start_year := (p_candidate #>> '{academicYear,startYear}')::integer;
  v_end_year := (p_candidate #>> '{academicYear,endYear}')::integer;

  if v_end_year <> v_start_year + 1
     or v_start_year < 2000
     or v_start_year > 2200
     or char_length(v_framework_id) > 240
     or char_length(v_institution_id) > 240
     or char_length(v_curriculum_version_id) > 240
     or char_length(v_version_label) > 160
     or position(chr(31) in v_framework_id) > 0
     or position(chr(31) in v_institution_id) > 0
     or position(chr(31) in v_curriculum_version_id) > 0
     or position(chr(31) in v_version_label) > 0 then
    raise exception 'INVALID_CIVIC_FRAMEWORK_IDENTITY' using errcode = '22023';
  end if;

  if p_expected_current_approved_framework_id is not null
     and (
       nullif(trim(p_expected_current_approved_framework_id), '') is null
       or char_length(p_expected_current_approved_framework_id) > 240
       or position(chr(31) in p_expected_current_approved_framework_id) > 0
     ) then
    raise exception 'INVALID_CIVIC_EXPECTED_HEAD' using errcode = '22023';
  end if;

  if (p_candidate ? 'previousFrameworkId') then
    if p_candidate->>'previousFrameworkId' is distinct from p_expected_current_approved_framework_id then
      raise exception 'CIVIC_PREVIOUS_FRAMEWORK_BINDING_MISMATCH' using errcode = '23514';
    end if;
  elsif p_expected_current_approved_framework_id is not null then
    raise exception 'CIVIC_PREVIOUS_FRAMEWORK_REQUIRED' using errcode = '23514';
  end if;

  if v_school_order = 'infanzia' then
    if jsonb_array_length(p_candidate->'allocations') <> 0
       or jsonb_array_length(p_candidate->'infanziaMappings') = 0 then
      raise exception 'INVALID_CIVIC_INFANZIA_MODEL' using errcode = '23514';
    end if;
    for v_mapping in select value from jsonb_array_elements(p_candidate->'infanziaMappings')
    loop
      if jsonb_typeof(v_mapping) <> 'object'
         or nullif(trim(v_mapping->>'id'), '') is null
         or nullif(trim(v_mapping->>'experienceFieldId'), '') is null
         or nullif(trim(v_mapping->>'citizenshipAreaId'), '') is null
         or jsonb_typeof(v_mapping->'objectiveRefs') <> 'array'
         or jsonb_array_length(v_mapping->'objectiveRefs') = 0
         or exists (
           select 1 from jsonb_array_elements(v_mapping->'objectiveRefs') ref
           where jsonb_typeof(ref) <> 'object'
             or ref->>'entityType' <> 'curriculum-node'
             or nullif(trim(ref->>'id'), '') is null
         ) then
        raise exception 'INVALID_CIVIC_INFANZIA_MAPPING' using errcode = '23514';
      end if;
    end loop;
  else
    if jsonb_array_length(p_candidate->'allocations') = 0
       or jsonb_array_length(p_candidate->'infanziaMappings') <> 0 then
      raise exception 'INVALID_CIVIC_ANNUAL_ALLOCATION_MODEL' using errcode = '23514';
    end if;

    for v_alloc in select value from jsonb_array_elements(p_candidate->'allocations')
    loop
      if jsonb_typeof(v_alloc) <> 'object'
         or nullif(trim(v_alloc->>'id'), '') is null
         or jsonb_typeof(v_alloc->'annualHours') <> 'number'
         or (v_alloc->>'annualHours')::numeric <= 0
         or jsonb_typeof(v_alloc->'nucleusIds') <> 'array'
         or jsonb_array_length(v_alloc->'nucleusIds') = 0
         or exists (
           select 1 from jsonb_array_elements_text(v_alloc->'nucleusIds') nucleus
           where nucleus not in (
             'costituzione',
             'sviluppo-economico-sostenibilita',
             'cittadinanza-digitale'
           )
         )
         or jsonb_typeof(v_alloc->'objectiveRefs') <> 'array'
         or jsonb_array_length(v_alloc->'objectiveRefs') = 0
         or exists (
           select 1 from jsonb_array_elements(v_alloc->'objectiveRefs') ref
           where jsonb_typeof(ref) <> 'object'
             or ref->>'entityType' <> 'curriculum-node'
             or nullif(trim(ref->>'id'), '') is null
         )
         or jsonb_typeof(v_alloc->'target') <> 'object'
         or coalesce(v_alloc #>> '{target,type}', '') not in ('discipline','area') then
        raise exception 'INVALID_CIVIC_ANNUAL_ALLOCATION' using errcode = '23514';
      end if;
      if v_alloc #>> '{target,type}' = 'discipline'
         and nullif(trim(v_alloc #>> '{target,disciplineCode}'), '') is null then
        raise exception 'INVALID_CIVIC_DISCIPLINE_TARGET' using errcode = '23514';
      end if;
      if v_alloc #>> '{target,type}' = 'area'
         and (
           nullif(trim(v_alloc #>> '{target,areaId}'), '') is null
           or nullif(trim(v_alloc #>> '{target,label}'), '') is null
         ) then
        raise exception 'INVALID_CIVIC_AREA_TARGET' using errcode = '23514';
      end if;

      v_target_key := case
        when v_alloc #>> '{target,type}' = 'discipline'
          then 'discipline:' || lower(trim(v_alloc #>> '{target,disciplineCode}'))
        else 'area:' || lower(trim(v_alloc #>> '{target,areaId}'))
      end;
      if v_target_key = any(v_seen_targets) then
        raise exception 'CIVIC_ALLOCATION_DUPLICATE_TARGET' using errcode = '23514';
      end if;
      v_seen_targets := array_append(v_seen_targets, v_target_key);

      v_total_hours := v_total_hours + (v_alloc->>'annualHours')::numeric;
    end loop;

    if v_total_hours < 33 then
      raise exception 'CIVIC_MINIMUM_HOURS_NOT_MET' using errcode = '23514';
    end if;
  end if;

  v_norm := p_candidate->'normativeVerification';
  if v_norm is null
     or jsonb_typeof(v_norm) <> 'object'
     or v_norm->'automaticCheck' is distinct from 'true'::jsonb
     or nullif(trim(v_norm->>'checkedAt'), '') is null
     or v_norm->>'verifiedFrameworkVersion' is distinct from v_version_label
     or coalesce(v_norm->>'result', '') not in ('no-relevant-change','relevant-change-incorporated')
     or nullif(trim(v_norm->>'humanConfirmedAt'), '') is null
     or coalesce(v_norm->>'humanConfirmedByRole', '') not in ('referente','collegio')
     or jsonb_typeof(v_norm->'sources') <> 'array'
     or jsonb_array_length(v_norm->'sources') = 0 then
    raise exception 'INVALID_CIVIC_NORMATIVE_VERIFICATION' using errcode = '23514';
  end if;

  v_sources := v_norm->'sources';
  for v_source in select value from jsonb_array_elements(v_sources)
  loop
    if jsonb_typeof(v_source) <> 'object'
       or nullif(trim(v_source->>'id'), '') is null
       or nullif(trim(v_source->>'title'), '') is null
       or nullif(trim(v_source->>'checkedAt'), '') is null
       or coalesce(v_source->>'authority', '') not in ('MIM','NORMATTIVA','GAZZETTA_UFFICIALE')
       or coalesce(v_source->>'outcome', '') not in ('unchanged','changed')
       or nullif(trim(v_source->>'url'), '') is null then
      raise exception 'INVALID_CIVIC_NORMATIVE_SOURCE' using errcode = '23514';
    end if;

    if v_source->>'outcome' = 'changed' then
      v_any_changed := true;
    end if;

    if v_source->>'authority' = 'MIM' then
      if lower(v_source->>'url') !~ '^https://([a-z0-9-]+\.)*mim\.gov\.it([/:?#]|$)' then
        raise exception 'CIVIC_NORMATIVE_SOURCE_NOT_OFFICIAL' using errcode = '23514';
      end if;
      v_has_mim := true;
    elsif v_source->>'authority' = 'NORMATTIVA' then
      if lower(v_source->>'url') !~ '^https://([a-z0-9-]+\.)*normattiva\.it([/:?#]|$)' then
        raise exception 'CIVIC_NORMATIVE_SOURCE_NOT_OFFICIAL' using errcode = '23514';
      end if;
      v_has_legal := true;
    elsif v_source->>'authority' = 'GAZZETTA_UFFICIALE' then
      if lower(v_source->>'url') !~ '^https://([a-z0-9-]+\.)*gazzettaufficiale\.it([/:?#]|$)' then
        raise exception 'CIVIC_NORMATIVE_SOURCE_NOT_OFFICIAL' using errcode = '23514';
      end if;
      v_has_legal := true;
    end if;
  end loop;
  if not v_has_mim or not v_has_legal then
    raise exception 'CIVIC_NORMATIVE_BASELINE_INCOMPLETE' using errcode = '23514';
  end if;
  if v_any_changed and v_norm->>'result' <> 'relevant-change-incorporated' then
    raise exception 'CIVIC_NORMATIVE_CHANGE_RESULT_MISMATCH' using errcode = '23514';
  end if;
  if not v_any_changed and v_norm->>'result' = 'relevant-change-incorporated' then
    raise exception 'CIVIC_NORMATIVE_CHANGE_RESULT_MISMATCH' using errcode = '23514';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    'EC-01:' || p_workspace_id::text || ':' || v_institution_id || ':' ||
    v_start_year::text || ':' || v_school_order,
    0
  ));

  v_candidate_fingerprint := encode(
    digest(convert_to(p_candidate::text, 'UTF8'), 'sha256'),
    'hex'
  );

  select * into v_existing
  from public.civic_education_approval_receipts receipt
  where receipt.workspace_id = p_workspace_id
    and receipt.client_request_id = p_client_request_id;
  if found then
    if v_existing.approved_by <> v_user
       or v_existing.framework_id <> v_framework_id
       or v_existing.institution_id <> v_institution_id
       or v_existing.curriculum_version_id <> v_curriculum_version_id
       or v_existing.academic_start_year <> v_start_year
       or v_existing.academic_end_year <> v_end_year
       or v_existing.school_order <> v_school_order
       or v_existing.candidate_fingerprint <> v_candidate_fingerprint
       or v_existing.previous_approved_framework_id is distinct from p_expected_current_approved_framework_id then
      raise exception 'CLIENT_REQUEST_ID_REUSE_MISMATCH' using errcode = '23505';
    end if;

    select * into v_existing_framework
    from public.civic_education_approved_frameworks framework
    where framework.id = v_existing.approved_framework_row_id;
    if not found then
      raise exception 'CIVIC_APPROVAL_RECEIPT_FRAMEWORK_MISSING' using errcode = '23514';
    end if;

    return jsonb_build_object(
      'framework', v_existing_framework.framework_snapshot,
      'receipt', jsonb_strip_nulls(jsonb_build_object(
        'schemaVersion', 1,
        'id', v_existing.id::text,
        'workspaceId', v_existing.workspace_id::text,
        'institutionId', v_existing.institution_id,
        'frameworkId', v_existing.framework_id,
        'curriculumVersionId', v_existing.curriculum_version_id,
        'academicYear', jsonb_build_object(
          'startYear', v_existing.academic_start_year,
          'endYear', v_existing.academic_end_year
        ),
        'schoolOrder', v_existing.school_order,
        'approvedByUserId', v_existing.approved_by::text,
        'approvedByRole', v_existing.approved_by_role,
        'approvedAt', v_existing.approved_at,
        'previousApprovedFrameworkId', v_existing.previous_approved_framework_id,
        'status', v_existing.status
      ))
    );
  end if;

  select * into v_canonical_head
  from public.shared_canonical_curriculum_heads head
  where head.workspace_id = p_workspace_id
  for share;
  if not found then
    raise exception 'SHARED_CANONICAL_BASELINE_REQUIRED' using errcode = '23514';
  end if;
  if v_canonical_head.canonical_version_ref <> v_curriculum_version_id then
    raise exception 'CIVIC_CURRICULUM_HEAD_MISMATCH' using errcode = '40001';
  end if;

  select * into v_canonical_version
  from public.shared_canonical_curriculum_versions version
  where version.workspace_id = p_workspace_id
    and version.canonical_version_ref = v_curriculum_version_id
  for share;
  if not found or v_canonical_version.status <> 'ACTIVE' then
    raise exception 'CIVIC_ACTIVE_CURRICULUM_REQUIRED' using errcode = '23514';
  end if;

  select * into v_current
  from public.civic_education_approved_heads head
  where head.workspace_id = p_workspace_id
    and head.institution_id = v_institution_id
    and head.academic_start_year = v_start_year
    and head.school_order = v_school_order
  for update;

  if found then
    if p_expected_current_approved_framework_id is null
       or v_current.framework_id <> p_expected_current_approved_framework_id then
      raise exception 'CIVIC_APPROVED_HEAD_CAS_MISMATCH' using errcode = '40001';
    end if;
  elsif p_expected_current_approved_framework_id is not null then
    raise exception 'CIVIC_APPROVED_HEAD_CAS_MISMATCH' using errcode = '40001';
  end if;

  if exists (
    select 1
    from public.civic_education_approved_frameworks framework
    where framework.workspace_id = p_workspace_id
      and framework.framework_id = v_framework_id
  ) then
    raise exception 'CIVIC_FRAMEWORK_ID_ALREADY_APPROVED' using errcode = '23505';
  end if;

  v_approved_snapshot := p_candidate
    || jsonb_build_object(
      'status', 'approved',
      'approvedAt', v_now,
      'approvedByRole', 'collegio'
    );

  if p_expected_current_approved_framework_id is null then
    v_approved_snapshot := v_approved_snapshot - 'previousFrameworkId';
  else
    v_approved_snapshot := v_approved_snapshot
      || jsonb_build_object('previousFrameworkId', p_expected_current_approved_framework_id);
  end if;

  insert into public.civic_education_approved_frameworks (
    workspace_id, institution_id, framework_id, curriculum_version_id,
    academic_start_year, academic_end_year, school_order, version_label,
    framework_snapshot, candidate_fingerprint, approved_by, approved_by_role,
    approved_at, previous_approved_framework_id
  ) values (
    p_workspace_id, v_institution_id, v_framework_id, v_curriculum_version_id,
    v_start_year, v_end_year, v_school_order, v_version_label,
    v_approved_snapshot, v_candidate_fingerprint, v_user, 'collegio',
    v_now, p_expected_current_approved_framework_id
  ) returning * into v_framework;

  insert into public.civic_education_approval_receipts (
    workspace_id, approved_framework_row_id, institution_id, framework_id,
    curriculum_version_id, academic_start_year, academic_end_year, school_order,
    candidate_fingerprint, previous_approved_framework_id, approved_by,
    approved_by_role, approved_at, client_request_id
  ) values (
    p_workspace_id, v_framework.id, v_institution_id, v_framework_id,
    v_curriculum_version_id, v_start_year, v_end_year, v_school_order,
    v_candidate_fingerprint, p_expected_current_approved_framework_id, v_user,
    'collegio', v_now, p_client_request_id
  ) returning * into v_receipt;

  insert into public.civic_education_approved_heads (
    workspace_id, institution_id, academic_start_year, academic_end_year,
    school_order, approved_framework_row_id, framework_id, approval_receipt_id,
    approved_at
  ) values (
    p_workspace_id, v_institution_id, v_start_year, v_end_year,
    v_school_order, v_framework.id, v_framework_id, v_receipt.id, v_now
  )
  on conflict (workspace_id, institution_id, academic_start_year, school_order)
  do update set
    academic_end_year = excluded.academic_end_year,
    approved_framework_row_id = excluded.approved_framework_row_id,
    framework_id = excluded.framework_id,
    approval_receipt_id = excluded.approval_receipt_id,
    approved_at = excluded.approved_at;

  return jsonb_build_object(
    'framework', v_framework.framework_snapshot,
    'receipt', jsonb_strip_nulls(jsonb_build_object(
      'schemaVersion', 1,
      'id', v_receipt.id::text,
      'workspaceId', v_receipt.workspace_id::text,
      'institutionId', v_receipt.institution_id,
      'frameworkId', v_receipt.framework_id,
      'curriculumVersionId', v_receipt.curriculum_version_id,
      'academicYear', jsonb_build_object(
        'startYear', v_receipt.academic_start_year,
        'endYear', v_receipt.academic_end_year
      ),
      'schoolOrder', v_receipt.school_order,
      'approvedByUserId', v_receipt.approved_by::text,
      'approvedByRole', v_receipt.approved_by_role,
      'approvedAt', v_receipt.approved_at,
      'previousApprovedFrameworkId', v_receipt.previous_approved_framework_id,
      'status', v_receipt.status
    ))
  );
end;
$$;

revoke all on function public.get_current_civic_education_framework_v1(uuid,uuid,text,integer,integer,text)
  from public, anon, authenticated;
grant execute on function public.get_current_civic_education_framework_v1(uuid,uuid,text,integer,integer,text)
  to authenticated;

revoke all on function public.approve_civic_education_framework_v1(uuid,uuid,text,jsonb,text)
  from public, anon, authenticated;
grant execute on function public.approve_civic_education_framework_v1(uuid,uuid,text,jsonb,text)
  to authenticated;

comment on table public.civic_education_approved_frameworks is
  'Immutable shared-institutional EC-01 approved snapshots. Historical snapshots are never rewritten when the head advances.';
comment on table public.civic_education_approval_receipts is
  'Append-only Collegio approval receipts for EC-01, idempotent by workspace + client_request_id.';
comment on table public.civic_education_approved_heads is
  'Current EC-01 approved framework head keyed by workspace, institution, academic year and school order.';
comment on function public.approve_civic_education_framework_v1(uuid,uuid,text,jsonb,text) is
  'EC-01 Collegio approval boundary. Revalidates the candidate server-side, binds to the ACTIVE canonical curriculum head, performs CAS/idempotency, records immutable snapshot+receipt and advances only the EC head.';
