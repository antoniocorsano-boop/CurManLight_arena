-- CurManLight Arena B3 — verified framework source + institutional baseline attestation
-- A current institute curriculum baseline is never invented by Arena: an authenticated
-- institutional referent attests a structured snapshot against an existing institute document.

create table if not exists public.verified_curriculum_sources (
  source_ref text primary key,
  title text not null,
  source_type text not null check (source_type in ('normative-ministerial', 'normative-national')),
  authority text not null,
  issued_at date not null,
  publication_reference text not null,
  official_identifier text not null unique,
  official_locator text not null,
  effective_from date not null,
  status text not null check (status = 'active'),
  assurance text not null check (assurance = 'verified-official'),
  created_at timestamptz not null default now()
);

alter table public.verified_curriculum_sources enable row level security;

drop policy if exists "verified_curriculum_sources_public_read"
  on public.verified_curriculum_sources;
create policy "verified_curriculum_sources_public_read"
  on public.verified_curriculum_sources
  for select
  to anon, authenticated
  using (true);

revoke insert, update, delete on table public.verified_curriculum_sources from anon, authenticated;
grant select on table public.verified_curriculum_sources to anon, authenticated;

-- Official legal source for the 2026/2027 Beta applicability path.
-- Normattiva/Gazzetta code: 26G00021; GU Serie generale n. 21 del 27-01-2026.
insert into public.verified_curriculum_sources (
  source_ref,
  title,
  source_type,
  authority,
  issued_at,
  publication_reference,
  official_identifier,
  official_locator,
  effective_from,
  status,
  assurance
) values (
  'normattiva:26G00021',
  'Decreto 9 dicembre 2025, n. 221 — Indicazioni nazionali per il curricolo',
  'normative-ministerial',
  'Ministero dell''istruzione e del merito',
  date '2025-12-09',
  'Gazzetta Ufficiale della Repubblica Italiana, Serie generale n. 21 del 27-01-2026',
  '26G00021',
  'https://www.normattiva.it/atto/caricaDettaglioAtto?atto.codiceRedazionale=26G00021&atto.dataPubblicazioneGazzetta=2026-01-27&tipoDettaglio=originario',
  date '2026-02-11',
  'active',
  'verified-official'
)
on conflict (source_ref) do nothing;

create table if not exists public.institutional_curriculum_baselines (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  baseline_version_ref text not null check (char_length(trim(baseline_version_ref)) between 1 and 240),
  baseline_fingerprint text not null check (baseline_fingerprint ~ '^[a-f0-9]{64}$'),
  source_document_title text not null check (char_length(trim(source_document_title)) between 1 and 500),
  source_document_ref text not null check (char_length(trim(source_document_ref)) between 1 and 1000),
  source_document_fingerprint text not null check (source_document_fingerprint ~ '^[a-f0-9]{64}$'),
  source_document_issued_at date not null,
  framework_source_ref text not null references public.verified_curriculum_sources(source_ref) on delete restrict,
  status text not null check (status in ('current', 'superseded')),
  attested_by uuid not null references auth.users(id) on delete restrict,
  attested_at timestamptz not null default now(),
  client_request_id uuid not null,
  unique (workspace_id, baseline_version_ref),
  unique (workspace_id, client_request_id)
);

create unique index if not exists institutional_curriculum_baselines_one_current_idx
  on public.institutional_curriculum_baselines(workspace_id)
  where status = 'current';

create index if not exists institutional_curriculum_baselines_history_idx
  on public.institutional_curriculum_baselines(workspace_id, attested_at desc);

alter table public.institutional_curriculum_baselines enable row level security;

drop policy if exists "institutional_curriculum_baselines_select_active_member"
  on public.institutional_curriculum_baselines;
create policy "institutional_curriculum_baselines_select_active_member"
  on public.institutional_curriculum_baselines
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.workspace_memberships membership
      join public.workspaces workspace on workspace.id = membership.workspace_id
      where membership.workspace_id = institutional_curriculum_baselines.workspace_id
        and membership.user_id = auth.uid()
        and membership.status = 'active'
        and workspace.status = 'active'
    )
  );

revoke insert, update, delete on table public.institutional_curriculum_baselines from anon, authenticated;
grant select on table public.institutional_curriculum_baselines to authenticated;

create or replace function public.attest_institutional_curriculum_baseline(
  p_workspace_id uuid,
  p_baseline_version_ref text,
  p_baseline_fingerprint text,
  p_source_document_title text,
  p_source_document_ref text,
  p_source_document_fingerprint text,
  p_source_document_issued_at date,
  p_framework_source_ref text,
  p_client_request_id uuid
)
returns setof public.institutional_curriculum_baselines
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_existing public.institutional_curriculum_baselines%rowtype;
begin
  if v_user_id is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;

  if p_workspace_id is null
     or p_baseline_version_ref is null
     or nullif(trim(p_baseline_version_ref), '') is null
     or p_baseline_fingerprint is null
     or p_baseline_fingerprint !~ '^[a-f0-9]{64}$'
     or p_source_document_title is null
     or nullif(trim(p_source_document_title), '') is null
     or char_length(trim(p_source_document_title)) > 500
     or p_source_document_ref is null
     or nullif(trim(p_source_document_ref), '') is null
     or char_length(trim(p_source_document_ref)) > 1000
     or p_source_document_fingerprint is null
     or p_source_document_fingerprint !~ '^[a-f0-9]{64}$'
     or p_source_document_issued_at is null
     or p_source_document_issued_at > current_date
     or p_framework_source_ref is null
     or nullif(trim(p_framework_source_ref), '') is null
     or p_client_request_id is null then
    raise exception 'INVALID_BASELINE_ATTESTATION_INPUT' using errcode = '22023';
  end if;

  select membership.role
    into v_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id
    and membership.user_id = v_user_id
    and membership.status = 'active'
    and workspace.status = 'active';

  -- Baseline attestation is an authenticated responsibility of the designated
  -- curriculum referent. It is neither workspace administration nor final approval.
  if v_role is distinct from 'referente' then
    raise exception 'CURRICULUM_BASELINE_ATTEST_REQUIRED' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.verified_curriculum_sources source
    where source.source_ref = p_framework_source_ref
      and source.status = 'active'
      and source.assurance = 'verified-official'
  ) then
    raise exception 'VERIFIED_FRAMEWORK_SOURCE_REQUIRED' using errcode = '23503';
  end if;

  select *
    into v_existing
  from public.institutional_curriculum_baselines baseline
  where baseline.workspace_id = p_workspace_id
    and baseline.client_request_id = p_client_request_id;

  if found then
    if v_existing.attested_by <> v_user_id
       or v_existing.baseline_version_ref <> trim(p_baseline_version_ref)
       or v_existing.baseline_fingerprint <> p_baseline_fingerprint
       or v_existing.source_document_title <> trim(p_source_document_title)
       or v_existing.source_document_ref <> trim(p_source_document_ref)
       or v_existing.source_document_fingerprint <> p_source_document_fingerprint
       or v_existing.source_document_issued_at <> p_source_document_issued_at
       or v_existing.framework_source_ref <> p_framework_source_ref then
      raise exception 'CLIENT_REQUEST_ID_REUSE_MISMATCH' using errcode = '23505';
    end if;

    return next v_existing;
    return;
  end if;

  -- Serialize baseline replacement per workspace to preserve exactly one current baseline.
  perform 1
  from public.workspaces workspace
  where workspace.id = p_workspace_id
  for update;

  update public.institutional_curriculum_baselines
  set status = 'superseded'
  where workspace_id = p_workspace_id
    and status = 'current';

  insert into public.institutional_curriculum_baselines (
    workspace_id,
    baseline_version_ref,
    baseline_fingerprint,
    source_document_title,
    source_document_ref,
    source_document_fingerprint,
    source_document_issued_at,
    framework_source_ref,
    status,
    attested_by,
    client_request_id
  ) values (
    p_workspace_id,
    trim(p_baseline_version_ref),
    p_baseline_fingerprint,
    trim(p_source_document_title),
    trim(p_source_document_ref),
    p_source_document_fingerprint,
    p_source_document_issued_at,
    p_framework_source_ref,
    'current',
    v_user_id,
    p_client_request_id
  )
  returning * into v_existing;

  return next v_existing;
end;
$$;

revoke all on function public.attest_institutional_curriculum_baseline(uuid, text, text, text, text, text, date, text, uuid) from public;
grant execute on function public.attest_institutional_curriculum_baseline(uuid, text, text, text, text, text, date, text, uuid) to authenticated;

comment on table public.verified_curriculum_sources is
  'Public official framework-source registry used by the bounded Arena Beta. No browser mutation is allowed.';

comment on table public.institutional_curriculum_baselines is
  'Authenticated attestations that bind a structured curriculum baseline to an existing official institute document and a verified national framework source.';

comment on function public.attest_institutional_curriculum_baseline(uuid, text, text, text, text, text, date, text, uuid) is
  'Authenticated referent-only boundary for attesting the current institute curriculum baseline. It does not constitute institutional approval of curriculum changes.';
