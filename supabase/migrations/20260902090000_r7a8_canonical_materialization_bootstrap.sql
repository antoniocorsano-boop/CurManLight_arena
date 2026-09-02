-- Arena R7A8 — immutable canonical materialization authority + genesis bootstrap.

create table if not exists public.shared_canonical_materializations (
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  materialization_ref text not null,
  materialization_kind text not null check (materialization_kind in ('GENESIS','CANDIDATE')),
  canonical_version_ref text not null,
  base_canonical_version_ref text,
  decision_receipt_ref uuid references public.institutional_revision_decisions(id) on delete restrict,
  proposal_ref text,
  proposal_version_ref text,
  proposal_version_fingerprint text,
  payload_text text not null,
  payload_fingerprint text not null check (payload_fingerprint ~ '^[a-f0-9]{64}$'),
  created_by uuid not null,
  created_by_role text not null check (created_by_role in ('amministratore','dirigente')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, materialization_ref),
  unique (workspace_id, canonical_version_ref),
  check (nullif(trim(materialization_ref), '') is not null),
  check (nullif(trim(canonical_version_ref), '') is not null),
  check (
    (materialization_kind = 'GENESIS'
      and base_canonical_version_ref is null
      and decision_receipt_ref is null
      and proposal_ref is null
      and proposal_version_ref is null
      and proposal_version_fingerprint is null
      and created_by_role = 'amministratore')
    or
    (materialization_kind = 'CANDIDATE'
      and nullif(trim(base_canonical_version_ref), '') is not null
      and decision_receipt_ref is not null
      and nullif(trim(proposal_ref), '') is not null
      and nullif(trim(proposal_version_ref), '') is not null
      and proposal_version_fingerprint ~ '^[a-f0-9]{64}$'
      and created_by_role = 'dirigente')
  )
);

alter table public.shared_canonical_materializations enable row level security;
revoke insert, update, delete on public.shared_canonical_materializations from authenticated;
grant select on public.shared_canonical_materializations to authenticated;

drop policy if exists shared_canonical_materializations_read on public.shared_canonical_materializations;
create policy shared_canonical_materializations_read on public.shared_canonical_materializations
for select to authenticated using (exists (
  select 1 from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = shared_canonical_materializations.workspace_id
    and membership.user_id = auth.uid()
    and membership.status = 'active'
    and workspace.status = 'active'
));

create or replace function public.reject_shared_canonical_materialization_mutation_v1()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'CANONICAL_MATERIALIZATION_IMMUTABLE' using errcode = '55000';
end;
$$;

drop trigger if exists shared_canonical_materializations_immutable on public.shared_canonical_materializations;
create trigger shared_canonical_materializations_immutable
before update or delete on public.shared_canonical_materializations
for each row execute function public.reject_shared_canonical_materialization_mutation_v1();

create or replace function public.bootstrap_shared_canonical_curriculum_v1(
  p_workspace_id uuid,
  p_expected_context_user_id uuid,
  p_materialization_ref text,
  p_canonical_version_ref text,
  p_materialization_payload_text text,
  p_expected_materialization_fingerprint text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_payload jsonb;
  v_keys text[];
  v_fingerprint text;
  v_now timestamptz := now();
begin
  if v_user_id is null then raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501'; end if;
  if p_expected_context_user_id is null or p_expected_context_user_id <> v_user_id then
    raise exception 'WORKSPACE_ACTOR_CONTEXT_PRINCIPAL_MISMATCH' using errcode = '42501';
  end if;
  if p_workspace_id is null
     or not public.is_shared_proposal_js_trimmed_v1(p_materialization_ref)
     or not public.is_shared_proposal_js_trimmed_v1(p_canonical_version_ref)
     or not public.is_shared_proposal_js_trimmed_v1(p_materialization_payload_text)
     or p_expected_materialization_fingerprint !~ '^[a-f0-9]{64}$'
     or position(chr(31) in p_materialization_ref) > 0
     or position(chr(31) in p_canonical_version_ref) > 0 then
    raise exception 'INVALID_CANONICAL_BOOTSTRAP_INPUT' using errcode = '22023';
  end if;

  select membership.role into v_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id
    and membership.user_id = v_user_id
    and membership.status = 'active'
    and workspace.status = 'active';
  if v_role is null then raise exception 'ACTIVE_WORKSPACE_MEMBERSHIP_REQUIRED' using errcode = '42501'; end if;
  if v_role is distinct from 'amministratore' then raise exception 'WORKSPACE_ADMIN_REQUIRED' using errcode = '42501'; end if;

  begin
    v_payload := p_materialization_payload_text::jsonb;
  exception when others then
    raise exception 'INVALID_CANONICAL_MATERIALIZATION_JSON' using errcode = '22023';
  end;
  if jsonb_typeof(v_payload) <> 'object' then raise exception 'INVALID_CANONICAL_MATERIALIZATION_SCHEMA' using errcode = '22023'; end if;
  select array_agg(key order by key) into v_keys from jsonb_object_keys(v_payload) key;
  if v_keys is distinct from array['canonicalVersionRef','curriculum','kind','schemaVersion']::text[]
     or v_payload->>'schemaVersion' <> '1'
     or v_payload->>'kind' <> 'GENESIS'
     or v_payload->>'canonicalVersionRef' <> p_canonical_version_ref
     or not (v_payload ? 'curriculum') then
    raise exception 'INVALID_CANONICAL_MATERIALIZATION_SCHEMA' using errcode = '22023';
  end if;

  v_fingerprint := encode(digest(convert_to(p_materialization_payload_text, 'UTF8'), 'sha256'), 'hex');
  if v_fingerprint <> p_expected_materialization_fingerprint then
    raise exception 'CANONICAL_MATERIALIZATION_FINGERPRINT_MISMATCH' using errcode = '23514';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('canonical-bootstrap:' || p_workspace_id::text, 0));
  if exists (select 1 from public.shared_canonical_curriculum_heads where workspace_id = p_workspace_id) then
    raise exception 'CANONICAL_HEAD_ALREADY_EXISTS' using errcode = '23505';
  end if;
  if exists (select 1 from public.shared_canonical_curriculum_versions where workspace_id = p_workspace_id) then
    raise exception 'CANONICAL_BOOTSTRAP_REQUIRES_EMPTY_REGISTRY' using errcode = '23505';
  end if;

  insert into public.shared_canonical_materializations (
    workspace_id, materialization_ref, materialization_kind, canonical_version_ref,
    payload_text, payload_fingerprint, created_by, created_by_role, created_at
  ) values (
    p_workspace_id, p_materialization_ref, 'GENESIS', p_canonical_version_ref,
    p_materialization_payload_text, v_fingerprint, v_user_id, 'amministratore', v_now
  );

  insert into public.shared_canonical_curriculum_versions (
    workspace_id, canonical_version_ref, status, materialization_ref,
    materialization_fingerprint, previous_canonical_version_ref, prepared_at, activated_at
  ) values (
    p_workspace_id, p_canonical_version_ref, 'ACTIVE', p_materialization_ref,
    v_fingerprint, null, v_now, v_now
  );

  insert into public.shared_canonical_curriculum_heads (
    workspace_id, canonical_version_ref, adoption_receipt_ref, activated_at
  ) values (p_workspace_id, p_canonical_version_ref, null, v_now);

  return jsonb_build_object(
    'workspaceId', p_workspace_id::text,
    'canonicalVersionRef', p_canonical_version_ref,
    'status', 'ACTIVE',
    'activatedAt', v_now,
    'adoptionReceiptRef', '',
    'materializationRef', p_materialization_ref,
    'materializationFingerprint', v_fingerprint,
    'bootstrapAuthorityVersion', 1
  );
end;
$$;

create or replace function public.prepare_shared_canonical_candidate_v1(
  p_workspace_id uuid,
  p_expected_context_user_id uuid,
  p_decision_receipt_ref uuid,
  p_materialization_ref text,
  p_candidate_canonical_version_ref text,
  p_materialization_payload_text text,
  p_expected_materialization_fingerprint text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_decision public.institutional_revision_decisions%rowtype;
  v_latest_decision_id uuid;
  v_head public.shared_canonical_curriculum_heads%rowtype;
  v_payload jsonb;
  v_keys text[];
  v_fingerprint text;
  v_now timestamptz := now();
begin
  if v_user_id is null then raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501'; end if;
  if p_expected_context_user_id is null or p_expected_context_user_id <> v_user_id then
    raise exception 'WORKSPACE_ACTOR_CONTEXT_PRINCIPAL_MISMATCH' using errcode = '42501';
  end if;
  if p_workspace_id is null or p_decision_receipt_ref is null
     or not public.is_shared_proposal_js_trimmed_v1(p_materialization_ref)
     or not public.is_shared_proposal_js_trimmed_v1(p_candidate_canonical_version_ref)
     or not public.is_shared_proposal_js_trimmed_v1(p_materialization_payload_text)
     or p_expected_materialization_fingerprint !~ '^[a-f0-9]{64}$'
     or position(chr(31) in p_materialization_ref) > 0
     or position(chr(31) in p_candidate_canonical_version_ref) > 0 then
    raise exception 'INVALID_CANONICAL_CANDIDATE_INPUT' using errcode = '22023';
  end if;

  select membership.role into v_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id
    and membership.user_id = v_user_id
    and membership.status = 'active'
    and workspace.status = 'active';
  if v_role is null then raise exception 'ACTIVE_WORKSPACE_MEMBERSHIP_REQUIRED' using errcode = '42501'; end if;
  if v_role is distinct from 'dirigente' then raise exception 'CURRICULUM_ADOPT_REQUIRED' using errcode = '42501'; end if;

  perform pg_advisory_xact_lock(hashtextextended('canonical-candidate:' || p_workspace_id::text, 0));

  select * into v_head from public.shared_canonical_curriculum_heads
  where workspace_id = p_workspace_id for update;
  if not found then raise exception 'AUTHORITATIVE_CANONICAL_HEAD_REQUIRED' using errcode = '23514'; end if;

  select * into v_decision from public.institutional_revision_decisions
  where id = p_decision_receipt_ref and workspace_id = p_workspace_id;
  if not found then raise exception 'AUTHORITATIVE_DECISION_REQUIRED' using errcode = '23514'; end if;
  if v_decision.shared_proposal_authority_version is distinct from 1
     or v_decision.outcome not in ('approve','approve-with-changes')
     or v_decision.adoption_binding_version is distinct from 2
     or v_decision.adoption_base_curriculum_version_ref is distinct from v_head.canonical_version_ref then
    raise exception 'AUTHORITATIVE_DECISION_BINDING_MISMATCH' using errcode = '23514';
  end if;
  select id into v_latest_decision_id from public.institutional_revision_decisions
  where workspace_id = p_workspace_id and proposal_version_ref = v_decision.proposal_version_ref
  order by decided_at desc, id desc limit 1;
  if v_latest_decision_id is distinct from p_decision_receipt_ref then
    raise exception 'CURRENT_FINAL_DECISION_REQUIRED' using errcode = '23514';
  end if;

  begin
    v_payload := p_materialization_payload_text::jsonb;
  exception when others then
    raise exception 'INVALID_CANONICAL_MATERIALIZATION_JSON' using errcode = '22023';
  end;
  if jsonb_typeof(v_payload) <> 'object' then raise exception 'INVALID_CANONICAL_MATERIALIZATION_SCHEMA' using errcode = '22023'; end if;
  select array_agg(key order by key) into v_keys from jsonb_object_keys(v_payload) key;
  if v_keys is distinct from array['baseCanonicalVersionRef','canonicalVersionRef','curriculum','kind','proposalRef','proposalVersionFingerprint','proposalVersionRef','schemaVersion']::text[]
     or v_payload->>'schemaVersion' <> '1'
     or v_payload->>'kind' <> 'CANDIDATE'
     or v_payload->>'canonicalVersionRef' <> p_candidate_canonical_version_ref
     or v_payload->>'baseCanonicalVersionRef' <> v_head.canonical_version_ref
     or v_payload->>'proposalRef' <> v_decision.proposal_ref
     or v_payload->>'proposalVersionRef' <> v_decision.proposal_version_ref
     or v_payload->>'proposalVersionFingerprint' <> v_decision.proposal_version_fingerprint
     or not (v_payload ? 'curriculum') then
    raise exception 'INVALID_CANONICAL_MATERIALIZATION_SCHEMA' using errcode = '22023';
  end if;

  v_fingerprint := encode(digest(convert_to(p_materialization_payload_text, 'UTF8'), 'sha256'), 'hex');
  if v_fingerprint <> p_expected_materialization_fingerprint then
    raise exception 'CANONICAL_MATERIALIZATION_FINGERPRINT_MISMATCH' using errcode = '23514';
  end if;

  if exists (select 1 from public.shared_canonical_curriculum_versions
    where workspace_id = p_workspace_id and canonical_version_ref = p_candidate_canonical_version_ref) then
    raise exception 'CANONICAL_CANDIDATE_VERSION_ALREADY_EXISTS' using errcode = '23505';
  end if;

  insert into public.shared_canonical_materializations (
    workspace_id, materialization_ref, materialization_kind, canonical_version_ref,
    base_canonical_version_ref, decision_receipt_ref, proposal_ref, proposal_version_ref,
    proposal_version_fingerprint, payload_text, payload_fingerprint, created_by, created_by_role, created_at
  ) values (
    p_workspace_id, p_materialization_ref, 'CANDIDATE', p_candidate_canonical_version_ref,
    v_head.canonical_version_ref, p_decision_receipt_ref, v_decision.proposal_ref, v_decision.proposal_version_ref,
    v_decision.proposal_version_fingerprint, p_materialization_payload_text, v_fingerprint, v_user_id, 'dirigente', v_now
  );

  insert into public.shared_canonical_curriculum_versions (
    workspace_id, canonical_version_ref, status, decision_receipt_ref, proposal_ref,
    proposal_version_ref, proposal_version_fingerprint, target_node_ref, base_canonical_version_ref,
    materialization_ref, materialization_fingerprint, previous_canonical_version_ref, prepared_at
  ) values (
    p_workspace_id, p_candidate_canonical_version_ref, 'PREPARED', p_decision_receipt_ref, v_decision.proposal_ref,
    v_decision.proposal_version_ref, v_decision.proposal_version_fingerprint, v_decision.adoption_target_node_ref,
    v_head.canonical_version_ref, p_materialization_ref, v_fingerprint, v_head.canonical_version_ref, v_now
  );

  return jsonb_build_object(
    'workspaceId', p_workspace_id::text,
    'canonicalVersionRef', p_candidate_canonical_version_ref,
    'status', 'PREPARED',
    'baseCanonicalVersionRef', v_head.canonical_version_ref,
    'decisionReceiptRef', p_decision_receipt_ref::text,
    'proposalRef', v_decision.proposal_ref,
    'proposalVersionRef', v_decision.proposal_version_ref,
    'proposalVersionFingerprint', v_decision.proposal_version_fingerprint,
    'materializationRef', p_materialization_ref,
    'materializationFingerprint', v_fingerprint,
    'preparedAt', v_now,
    'materializationAuthorityVersion', 1
  );
end;
$$;

revoke all on function public.bootstrap_shared_canonical_curriculum_v1(uuid, uuid, text, text, text, text) from public;
grant execute on function public.bootstrap_shared_canonical_curriculum_v1(uuid, uuid, text, text, text, text) to authenticated;
revoke all on function public.prepare_shared_canonical_candidate_v1(uuid, uuid, uuid, text, text, text, text) from public;
grant execute on function public.prepare_shared_canonical_candidate_v1(uuid, uuid, uuid, text, text, text, text) to authenticated;

comment on function public.bootstrap_shared_canonical_curriculum_v1(uuid, uuid, text, text, text, text) is
  'R7A8 one-time WORKSPACE_ADMIN genesis bootstrap. Creates the first immutable server-side materialization, ACTIVE canonical version and head atomically.';
comment on function public.prepare_shared_canonical_candidate_v1(uuid, uuid, uuid, text, text, text, text) is
  'R7A8 prepares an immutable candidate bound to the current R7A6 adoptive decision and canonical head. Activation remains R7A7 CURRICULUM_ADOPT.';
