-- EC-01/Arena-F4 — trusted normative checker support.
--
-- This migration does NOT fetch the web from PostgreSQL.
-- It establishes the server-only baseline registry and the receipt recording boundary.
-- A trusted server worker must fetch official sources, compare SHA-256 fingerprints,
-- then call record_civic_education_normative_check_v1. Browser roles cannot mutate
-- baselines or receipts.

create table if not exists public.civic_education_normative_source_baselines (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  authority text not null check (authority in ('MIM','NORMATTIVA','GAZZETTA_UFFICIALE')),
  title text not null,
  source_url text not null,
  normalization_version text not null default 'RAW_RESPONSE_BYTES_V1'
    check (normalization_version = 'RAW_RESPONSE_BYTES_V1'),
  expected_sha256 text not null check (expected_sha256 ~ '^[a-f0-9]{64}$'),
  evidence_note text not null,
  created_at timestamptz not null default now(),
  created_by text not null default 'TRUSTED_SERVER_BOOTSTRAP'
    check (created_by = 'TRUSTED_SERVER_BOOTSTRAP'),
  unique (source_key, expected_sha256),
  check (nullif(trim(source_key), '') is not null),
  check (nullif(trim(title), '') is not null),
  check (nullif(trim(source_url), '') is not null),
  check (source_key = trim(source_key)),
  check (source_url = trim(source_url)),
  check (
    (authority = 'MIM' and lower(source_url) ~ '^https://([a-z0-9-]+\.)*mim\.gov\.it([/:?#]|$)')
    or (authority = 'NORMATTIVA' and lower(source_url) ~ '^https://([a-z0-9-]+\.)*normattiva\.it([/:?#]|$)')
    or (authority = 'GAZZETTA_UFFICIALE' and lower(source_url) ~ '^https://([a-z0-9-]+\.)*gazzettaufficiale\.it([/:?#]|$)')
  ),
  check (nullif(trim(evidence_note), '') is not null)
);

create table if not exists public.civic_education_normative_source_heads (
  framework_version_label text not null,
  source_key text not null,
  baseline_id uuid not null
    references public.civic_education_normative_source_baselines(id) on delete restrict,
  advanced_at timestamptz not null default now(),
  advanced_by text not null default 'TRUSTED_SERVER_BOOTSTRAP'
    check (advanced_by = 'TRUSTED_SERVER_BOOTSTRAP'),
  primary key (framework_version_label, source_key),
  check (nullif(trim(framework_version_label), '') is not null),
  check (framework_version_label = trim(framework_version_label))
);

alter table public.civic_education_normative_check_receipts
  add column if not exists confirmed_by_user_id uuid references auth.users(id) on delete restrict,
  add column if not exists confirmed_by_role text
    check (confirmed_by_role in ('referente','collegio')),
  add column if not exists client_request_id text;

create unique index if not exists civic_education_normative_check_receipts_request_idx
  on public.civic_education_normative_check_receipts(workspace_id, client_request_id)
  where client_request_id is not null;

create index if not exists civic_education_normative_source_baselines_authority_idx
  on public.civic_education_normative_source_baselines(authority, created_at desc);

alter table public.civic_education_normative_source_baselines enable row level security;
alter table public.civic_education_normative_source_heads enable row level security;

revoke all on public.civic_education_normative_source_baselines from public, anon, authenticated;
revoke all on public.civic_education_normative_source_heads from public, anon, authenticated;
grant select, insert on public.civic_education_normative_source_baselines to service_role;
grant select, insert, update on public.civic_education_normative_source_heads to service_role;

create or replace function public.reject_civic_education_normative_baseline_mutation_v1()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'CIVIC_NORMATIVE_BASELINE_IMMUTABLE' using errcode = '55000';
end;
$$;

drop trigger if exists civic_education_normative_source_baselines_immutable
  on public.civic_education_normative_source_baselines;
create trigger civic_education_normative_source_baselines_immutable
before update or delete on public.civic_education_normative_source_baselines
for each row execute function public.reject_civic_education_normative_baseline_mutation_v1();

create or replace function public.record_civic_education_normative_check_v1(
  p_workspace_id uuid,
  p_requested_by_user_id uuid,
  p_institution_id text,
  p_framework_id text,
  p_framework_version_label text,
  p_client_request_id text,
  p_verification_snapshot jsonb,
  p_source_observations jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_role text;
  v_norm_fingerprint text;
  v_checked_at timestamptz;
  v_human_confirmed_at timestamptz;
  v_source jsonb;
  v_observation jsonb;
  v_baseline public.civic_education_normative_source_baselines%rowtype;
  v_observed_keys text[] := array[]::text[];
  v_active_count integer;
  v_has_mim boolean := false;
  v_has_legal boolean := false;
  v_existing public.civic_education_normative_check_receipts%rowtype;
  v_receipt public.civic_education_normative_check_receipts%rowtype;
begin
  -- Execution is granted only to the privileged server role below.
  -- SECURITY DEFINER supplies table access; browser roles have no EXECUTE grant.

  if p_workspace_id is null
     or p_requested_by_user_id is null
     or nullif(trim(p_institution_id), '') is null
     or p_institution_id <> trim(p_institution_id)
     or nullif(trim(p_framework_id), '') is null
     or p_framework_id <> trim(p_framework_id)
     or nullif(trim(p_framework_version_label), '') is null
     or p_framework_version_label <> trim(p_framework_version_label)
     or nullif(trim(p_client_request_id), '') is null
     or p_client_request_id <> trim(p_client_request_id)
     or char_length(p_client_request_id) > 200
     or jsonb_typeof(p_verification_snapshot) <> 'object'
     or jsonb_typeof(p_source_observations) <> 'array'
     or jsonb_array_length(p_source_observations) = 0 then
    raise exception 'INVALID_CIVIC_NORMATIVE_CHECK_INPUT' using errcode = '22023';
  end if;

  select membership.role into v_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id
    and membership.user_id = p_requested_by_user_id
    and membership.status = 'active'
    and workspace.status = 'active';

  if v_role is null then
    raise exception 'ACTIVE_WORKSPACE_MEMBERSHIP_REQUIRED' using errcode = '42501';
  end if;
  if v_role not in ('referente','collegio') then
    raise exception 'CIVIC_NORMATIVE_CONFIRMATION_ROLE_REQUIRED' using errcode = '42501';
  end if;

  select * into v_existing
  from public.civic_education_normative_check_receipts receipt
  where receipt.workspace_id = p_workspace_id
    and receipt.client_request_id = p_client_request_id;

  if found then
    if v_existing.institution_id <> p_institution_id
       or v_existing.framework_id <> p_framework_id
       or v_existing.framework_version_label <> p_framework_version_label
       or v_existing.confirmed_by_user_id is distinct from p_requested_by_user_id
       or v_existing.confirmed_by_role is distinct from v_role then
      raise exception 'CIVIC_NORMATIVE_REQUEST_ID_REUSE_MISMATCH' using errcode = '23505';
    end if;
    return to_jsonb(v_existing);
  end if;

  if p_verification_snapshot->'automaticCheck' is distinct from 'true'::jsonb
     or nullif(trim(p_verification_snapshot->>'checkedAt'), '') is null
     or p_verification_snapshot->>'verifiedFrameworkVersion' is distinct from p_framework_version_label
     or p_verification_snapshot->>'result' is distinct from 'no-relevant-change'
     or nullif(trim(p_verification_snapshot->>'humanConfirmedAt'), '') is null
     or p_verification_snapshot->>'humanConfirmedByRole' is distinct from v_role
     or jsonb_typeof(p_verification_snapshot->'sources') <> 'array'
     or jsonb_array_length(p_verification_snapshot->'sources') = 0 then
    raise exception 'INVALID_CIVIC_NORMATIVE_VERIFICATION' using errcode = '23514';
  end if;

  begin
    v_checked_at := (p_verification_snapshot->>'checkedAt')::timestamptz;
    v_human_confirmed_at := (p_verification_snapshot->>'humanConfirmedAt')::timestamptz;
  exception when others then
    raise exception 'INVALID_CIVIC_NORMATIVE_TIMESTAMP' using errcode = '22007';
  end;
  if v_human_confirmed_at < v_checked_at then
    raise exception 'CIVIC_NORMATIVE_CONFIRMATION_PRECEDES_CHECK' using errcode = '23514';
  end if;

  lock table public.civic_education_normative_source_heads in share mode;

  select count(*) into v_active_count
  from public.civic_education_normative_source_heads head
  join public.civic_education_normative_source_baselines baseline on baseline.id = head.baseline_id
  where head.framework_version_label = p_framework_version_label;

  if v_active_count = 0 then
    raise exception 'CIVIC_NORMATIVE_BASELINE_NOT_CONFIGURED' using errcode = '23514';
  end if;
  if jsonb_array_length(p_source_observations) <> v_active_count
     or jsonb_array_length(p_verification_snapshot->'sources') <> v_active_count then
    raise exception 'CIVIC_NORMATIVE_SOURCE_SET_MISMATCH' using errcode = '23514';
  end if;

  for v_observation in select value from jsonb_array_elements(p_source_observations)
  loop
    if jsonb_typeof(v_observation) <> 'object'
       or nullif(trim(v_observation->>'sourceKey'), '') is null
       or nullif(trim(v_observation->>'sha256'), '') is null
       or coalesce(v_observation->>'normalizationVersion', '') <> 'RAW_RESPONSE_BYTES_V1'
       or coalesce(v_observation->>'sha256', '') !~ '^[a-f0-9]{64}$' then
      raise exception 'INVALID_CIVIC_NORMATIVE_SOURCE_OBSERVATION' using errcode = '23514';
    end if;

    if (v_observation->>'sourceKey') = any(v_observed_keys) then
      raise exception 'CIVIC_NORMATIVE_DUPLICATE_SOURCE_OBSERVATION' using errcode = '23514';
    end if;
    v_observed_keys := array_append(v_observed_keys, v_observation->>'sourceKey');

    select baseline.* into v_baseline
    from public.civic_education_normative_source_heads head
    join public.civic_education_normative_source_baselines baseline on baseline.id = head.baseline_id
    where head.framework_version_label = p_framework_version_label
      and head.source_key = v_observation->>'sourceKey';

    if not found then
      raise exception 'CIVIC_NORMATIVE_SOURCE_BASELINE_MISSING' using errcode = '23514';
    end if;

    if v_baseline.expected_sha256 <> v_observation->>'sha256'
       or v_baseline.normalization_version <> v_observation->>'normalizationVersion'
       or v_baseline.source_url <> v_observation->>'url'
       or v_baseline.authority <> v_observation->>'authority' then
      raise exception 'CIVIC_NORMATIVE_SOURCE_DRIFT' using errcode = '23514';
    end if;

    if v_baseline.authority = 'MIM' then v_has_mim := true; end if;
    if v_baseline.authority in ('NORMATTIVA','GAZZETTA_UFFICIALE') then v_has_legal := true; end if;

    select value into v_source
    from jsonb_array_elements(p_verification_snapshot->'sources')
    where value->>'id' = v_observation->>'sourceKey'
    limit 1;

    if v_source is null
       or v_source->>'authority' is distinct from v_baseline.authority
       or v_source->>'title' is distinct from v_baseline.title
       or v_source->>'url' is distinct from v_baseline.source_url
       or v_source->>'outcome' is distinct from 'unchanged'
       or (v_source->>'checkedAt')::timestamptz is distinct from v_checked_at then
      raise exception 'CIVIC_NORMATIVE_VERIFICATION_SOURCE_MISMATCH' using errcode = '23514';
    end if;
  end loop;

  if not v_has_mim or not v_has_legal then
    raise exception 'CIVIC_NORMATIVE_BASELINE_INCOMPLETE' using errcode = '23514';
  end if;

  v_norm_fingerprint := encode(
    digest(convert_to(p_verification_snapshot::text, 'UTF8'), 'sha256'),
    'hex'
  );

  insert into public.civic_education_normative_check_receipts (
    workspace_id,
    institution_id,
    framework_id,
    framework_version_label,
    normative_fingerprint,
    verification_snapshot,
    checked_at,
    result,
    checker_authority,
    confirmed_by_user_id,
    confirmed_by_role,
    client_request_id
  ) values (
    p_workspace_id,
    p_institution_id,
    p_framework_id,
    p_framework_version_label,
    v_norm_fingerprint,
    p_verification_snapshot,
    v_checked_at,
    'no-relevant-change',
    'SERVER_AUTOMATIC_CHECK',
    p_requested_by_user_id,
    v_role,
    p_client_request_id
  )
  returning * into v_receipt;

  return to_jsonb(v_receipt);
end;
$$;

revoke all on function public.record_civic_education_normative_check_v1(
  uuid,uuid,text,text,text,text,jsonb,jsonb
) from public, anon, authenticated;
grant execute on function public.record_civic_education_normative_check_v1(
  uuid,uuid,text,text,text,text,jsonb,jsonb
) to service_role;

comment on table public.civic_education_normative_source_baselines is
  'Append-only server-controlled official-source fingerprints for EC-01 automatic normative verification. No baseline is seeded by this migration.';
comment on table public.civic_education_normative_source_heads is
  'Server-controlled pointer to the accepted official-source fingerprint baseline per EC-01 framework version.';
comment on function public.record_civic_education_normative_check_v1(
  uuid,uuid,text,text,text,text,jsonb,jsonb
) is
  'Trusted-server-only EC-01 receipt boundary. Records a no-relevant-change receipt only when every active official-source baseline matches exactly.';
