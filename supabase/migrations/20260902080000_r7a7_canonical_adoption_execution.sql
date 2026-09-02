-- Arena R7A7 — shared canonical registry and adoption execution.
-- Candidate materialization/bootstrap is deliberately outside this migration.

create extension if not exists pgcrypto;

create table if not exists public.shared_canonical_curriculum_versions (
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  canonical_version_ref text not null,
  status text not null check (status in ('PREPARED','ACTIVE','SUPERSEDED')),
  decision_receipt_ref uuid references public.institutional_revision_decisions(id) on delete restrict,
  proposal_ref text,
  proposal_version_ref text,
  proposal_version_fingerprint text,
  target_node_ref text,
  base_canonical_version_ref text,
  materialization_ref text not null,
  materialization_fingerprint text not null check (materialization_fingerprint ~ '^[a-f0-9]{64}$'),
  previous_canonical_version_ref text,
  prepared_at timestamptz not null default now(),
  activated_at timestamptz,
  superseded_at timestamptz,
  primary key (workspace_id, canonical_version_ref),
  check (nullif(trim(canonical_version_ref), '') is not null),
  check (nullif(trim(materialization_ref), '') is not null),
  check (
    (status = 'PREPARED' and decision_receipt_ref is not null and proposal_ref is not null and proposal_version_ref is not null and proposal_version_fingerprint ~ '^[a-f0-9]{64}$' and target_node_ref is not null and base_canonical_version_ref is not null and previous_canonical_version_ref is not null and activated_at is null and superseded_at is null)
    or (status = 'ACTIVE' and activated_at is not null and superseded_at is null)
    or (status = 'SUPERSEDED' and activated_at is not null and superseded_at is not null)
  )
);

create table if not exists public.canonical_adoption_receipts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  decision_receipt_ref uuid not null references public.institutional_revision_decisions(id) on delete restrict,
  proposal_ref text not null,
  proposal_version_ref text not null,
  proposal_version_fingerprint text not null check (proposal_version_fingerprint ~ '^[a-f0-9]{64}$'),
  previous_canonical_version_ref text not null,
  adopted_canonical_version_ref text not null,
  adopted_by uuid not null,
  adopted_by_role text not null check (adopted_by_role = 'dirigente'),
  adopted_at timestamptz not null default now(),
  status text not null default 'ADOPTED' check (status = 'ADOPTED'),
  supersedes_adoption_receipt_ref uuid references public.canonical_adoption_receipts(id) on delete restrict,
  client_request_id text not null,
  unique (workspace_id, decision_receipt_ref),
  unique (workspace_id, client_request_id),
  check (nullif(trim(proposal_ref), '') is not null),
  check (nullif(trim(proposal_version_ref), '') is not null),
  check (nullif(trim(previous_canonical_version_ref), '') is not null),
  check (nullif(trim(adopted_canonical_version_ref), '') is not null),
  check (nullif(trim(client_request_id), '') is not null),
  check (previous_canonical_version_ref <> adopted_canonical_version_ref)
);

create table if not exists public.shared_canonical_curriculum_heads (
  workspace_id uuid primary key references public.workspaces(id) on delete restrict,
  canonical_version_ref text not null,
  adoption_receipt_ref uuid references public.canonical_adoption_receipts(id) on delete restrict,
  activated_at timestamptz not null,
  foreign key (workspace_id, canonical_version_ref)
    references public.shared_canonical_curriculum_versions(workspace_id, canonical_version_ref)
    on delete restrict
);

alter table public.shared_canonical_curriculum_versions enable row level security;
alter table public.canonical_adoption_receipts enable row level security;
alter table public.shared_canonical_curriculum_heads enable row level security;

revoke insert, update, delete on public.shared_canonical_curriculum_versions from authenticated;
revoke insert, update, delete on public.canonical_adoption_receipts from authenticated;
revoke insert, update, delete on public.shared_canonical_curriculum_heads from authenticated;
grant select on public.shared_canonical_curriculum_versions to authenticated;
grant select on public.canonical_adoption_receipts to authenticated;
grant select on public.shared_canonical_curriculum_heads to authenticated;

drop policy if exists shared_canonical_versions_read on public.shared_canonical_curriculum_versions;
create policy shared_canonical_versions_read on public.shared_canonical_curriculum_versions
for select to authenticated using (exists (
  select 1 from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = shared_canonical_curriculum_versions.workspace_id
    and membership.user_id = auth.uid()
    and membership.status = 'active'
    and workspace.status = 'active'
));

drop policy if exists canonical_adoption_receipts_read on public.canonical_adoption_receipts;
create policy canonical_adoption_receipts_read on public.canonical_adoption_receipts
for select to authenticated using (exists (
  select 1 from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = canonical_adoption_receipts.workspace_id
    and membership.user_id = auth.uid()
    and membership.status = 'active'
    and workspace.status = 'active'
));

drop policy if exists shared_canonical_heads_read on public.shared_canonical_curriculum_heads;
create policy shared_canonical_heads_read on public.shared_canonical_curriculum_heads
for select to authenticated using (exists (
  select 1 from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = shared_canonical_curriculum_heads.workspace_id
    and membership.user_id = auth.uid()
    and membership.status = 'active'
    and workspace.status = 'active'
));

create or replace function public.get_shared_canonical_head_v1(
  p_workspace_id uuid,
  p_expected_context_user_id uuid
)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_head public.shared_canonical_curriculum_heads%rowtype;
begin
  if v_user_id is null then raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501'; end if;
  if p_expected_context_user_id is null or p_expected_context_user_id <> v_user_id then
    raise exception 'WORKSPACE_ACTOR_CONTEXT_PRINCIPAL_MISMATCH' using errcode = '42501';
  end if;
  select membership.role into v_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id and membership.user_id = v_user_id
    and membership.status = 'active' and workspace.status = 'active';
  if v_role is null then raise exception 'ACTIVE_WORKSPACE_MEMBERSHIP_REQUIRED' using errcode = '42501'; end if;
  select * into v_head from public.shared_canonical_curriculum_heads where workspace_id = p_workspace_id;
  if not found then return null; end if;
  return jsonb_build_object(
    'workspaceId', v_head.workspace_id::text,
    'canonicalVersionRef', v_head.canonical_version_ref,
    'status', 'ACTIVE',
    'activatedAt', v_head.activated_at,
    'adoptionReceiptRef', coalesce(v_head.adoption_receipt_ref::text, '')
  );
end;
$$;

create or replace function public.get_canonical_adoption_for_decision_v1(
  p_workspace_id uuid,
  p_expected_context_user_id uuid,
  p_decision_receipt_ref uuid
)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_receipt public.canonical_adoption_receipts%rowtype;
begin
  if v_user_id is null then raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501'; end if;
  if p_expected_context_user_id is null or p_expected_context_user_id <> v_user_id then
    raise exception 'WORKSPACE_ACTOR_CONTEXT_PRINCIPAL_MISMATCH' using errcode = '42501';
  end if;
  select membership.role into v_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id and membership.user_id = v_user_id
    and membership.status = 'active' and workspace.status = 'active';
  if v_role is null then raise exception 'ACTIVE_WORKSPACE_MEMBERSHIP_REQUIRED' using errcode = '42501'; end if;
  select * into v_receipt from public.canonical_adoption_receipts
  where workspace_id = p_workspace_id and decision_receipt_ref = p_decision_receipt_ref;
  if not found then return null; end if;
  return jsonb_strip_nulls(jsonb_build_object(
    'schemaVersion', 1, 'id', v_receipt.id::text, 'workspaceId', v_receipt.workspace_id::text,
    'decisionReceiptRef', v_receipt.decision_receipt_ref::text, 'proposalRef', v_receipt.proposal_ref,
    'proposalVersionRef', v_receipt.proposal_version_ref, 'proposalVersionFingerprint', v_receipt.proposal_version_fingerprint,
    'previousCanonicalVersionRef', v_receipt.previous_canonical_version_ref,
    'adoptedCanonicalVersionRef', v_receipt.adopted_canonical_version_ref,
    'adoptedByUserId', v_receipt.adopted_by::text, 'adoptedByRole', v_receipt.adopted_by_role,
    'adoptedAt', v_receipt.adopted_at, 'status', v_receipt.status,
    'supersedesAdoptionReceiptRef', v_receipt.supersedes_adoption_receipt_ref::text
  ));
end;
$$;

create or replace function public.adopt_shared_canonical_curriculum_v1(
  p_workspace_id uuid,
  p_expected_context_user_id uuid,
  p_decision_receipt_ref uuid,
  p_proposal_ref text,
  p_proposal_version_ref text,
  p_proposal_version_fingerprint text,
  p_expected_current_canonical_version_ref text,
  p_candidate_canonical_version_ref text,
  p_client_request_id text
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
  v_candidate public.shared_canonical_curriculum_versions%rowtype;
  v_previous public.shared_canonical_curriculum_versions%rowtype;
  v_head public.shared_canonical_curriculum_heads%rowtype;
  v_existing public.canonical_adoption_receipts%rowtype;
  v_receipt public.canonical_adoption_receipts%rowtype;
  v_now timestamptz := now();
  v_result jsonb;
begin
  if v_user_id is null then raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501'; end if;
  if p_expected_context_user_id is null or p_expected_context_user_id <> v_user_id then
    raise exception 'WORKSPACE_ACTOR_CONTEXT_PRINCIPAL_MISMATCH' using errcode = '42501';
  end if;
  if p_workspace_id is null or p_decision_receipt_ref is null
     or not public.is_shared_proposal_js_trimmed_v1(p_proposal_ref)
     or not public.is_shared_proposal_js_trimmed_v1(p_proposal_version_ref)
     or p_proposal_version_fingerprint !~ '^[a-f0-9]{64}$'
     or not public.is_shared_proposal_js_trimmed_v1(p_expected_current_canonical_version_ref)
     or not public.is_shared_proposal_js_trimmed_v1(p_candidate_canonical_version_ref)
     or not public.is_shared_proposal_js_trimmed_v1(p_client_request_id)
     or position(chr(31) in p_proposal_ref) > 0
     or position(chr(31) in p_proposal_version_ref) > 0
     or position(chr(31) in p_expected_current_canonical_version_ref) > 0
     or position(chr(31) in p_candidate_canonical_version_ref) > 0
     or position(chr(31) in p_client_request_id) > 0
     or p_expected_current_canonical_version_ref = p_candidate_canonical_version_ref then
    raise exception 'INVALID_CANONICAL_ADOPTION_INPUT' using errcode = '22023';
  end if;

  select membership.role into v_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id and membership.user_id = v_user_id
    and membership.status = 'active' and workspace.status = 'active';
  if v_role is null then raise exception 'ACTIVE_WORKSPACE_MEMBERSHIP_REQUIRED' using errcode = '42501'; end if;
  if v_role is distinct from 'dirigente' then raise exception 'CURRICULUM_ADOPT_REQUIRED' using errcode = '42501'; end if;

  perform pg_advisory_xact_lock(hashtextextended('canonical-adoption:' || p_workspace_id::text, 0));

  select * into v_existing from public.canonical_adoption_receipts
  where workspace_id = p_workspace_id and client_request_id = p_client_request_id;
  if found then
    if v_existing.adopted_by <> v_user_id
       or v_existing.decision_receipt_ref <> p_decision_receipt_ref
       or v_existing.proposal_ref <> p_proposal_ref
       or v_existing.proposal_version_ref <> p_proposal_version_ref
       or v_existing.proposal_version_fingerprint <> p_proposal_version_fingerprint
       or v_existing.previous_canonical_version_ref <> p_expected_current_canonical_version_ref
       or v_existing.adopted_canonical_version_ref <> p_candidate_canonical_version_ref then
      raise exception 'CLIENT_REQUEST_ID_REUSE_MISMATCH' using errcode = '23505';
    end if;
    select * into v_previous from public.shared_canonical_curriculum_versions
      where workspace_id = p_workspace_id and canonical_version_ref = v_existing.previous_canonical_version_ref;
    select * into v_candidate from public.shared_canonical_curriculum_versions
      where workspace_id = p_workspace_id and canonical_version_ref = v_existing.adopted_canonical_version_ref;
    return jsonb_build_object(
      'receipt', jsonb_strip_nulls(jsonb_build_object(
        'schemaVersion',1,'id',v_existing.id::text,'workspaceId',v_existing.workspace_id::text,
        'decisionReceiptRef',v_existing.decision_receipt_ref::text,'proposalRef',v_existing.proposal_ref,
        'proposalVersionRef',v_existing.proposal_version_ref,'proposalVersionFingerprint',v_existing.proposal_version_fingerprint,
        'previousCanonicalVersionRef',v_existing.previous_canonical_version_ref,'adoptedCanonicalVersionRef',v_existing.adopted_canonical_version_ref,
        'adoptedByUserId',v_existing.adopted_by::text,'adoptedByRole',v_existing.adopted_by_role,'adoptedAt',v_existing.adopted_at,
        'status','ADOPTED','supersedesAdoptionReceiptRef',v_existing.supersedes_adoption_receipt_ref::text)),
      'previousHead', jsonb_build_object('workspaceId',p_workspace_id::text,'canonicalVersionRef',v_existing.previous_canonical_version_ref,'status','ACTIVE','activatedAt',v_previous.activated_at,'adoptionReceiptRef',coalesce(v_existing.supersedes_adoption_receipt_ref::text,'')),
      'currentHead', jsonb_build_object('workspaceId',p_workspace_id::text,'canonicalVersionRef',v_existing.adopted_canonical_version_ref,'status','ACTIVE','activatedAt',v_candidate.activated_at,'adoptionReceiptRef',v_existing.id::text)
    );
  end if;

  select * into v_decision from public.institutional_revision_decisions
  where id = p_decision_receipt_ref and workspace_id = p_workspace_id;
  if not found then raise exception 'AUTHORITATIVE_DECISION_REQUIRED' using errcode = '23514'; end if;
  if v_decision.shared_proposal_authority_version is distinct from 1
     or v_decision.outcome not in ('approve','approve-with-changes')
     or v_decision.proposal_ref <> p_proposal_ref
     or v_decision.proposal_version_ref <> p_proposal_version_ref
     or v_decision.proposal_version_fingerprint <> p_proposal_version_fingerprint
     or v_decision.adoption_binding_version is distinct from 2
     or v_decision.adoption_base_curriculum_version_ref <> p_expected_current_canonical_version_ref then
    raise exception 'AUTHORITATIVE_DECISION_BINDING_MISMATCH' using errcode = '23514';
  end if;

  select id into v_latest_decision_id from public.institutional_revision_decisions
  where workspace_id = p_workspace_id and proposal_version_ref = p_proposal_version_ref
  order by decided_at desc, id desc limit 1;
  if v_latest_decision_id is distinct from p_decision_receipt_ref then
    raise exception 'CURRENT_FINAL_DECISION_REQUIRED' using errcode = '23514';
  end if;

  if exists (select 1 from public.canonical_adoption_receipts where workspace_id = p_workspace_id and decision_receipt_ref = p_decision_receipt_ref) then
    raise exception 'DECISION_ALREADY_ADOPTED' using errcode = '23505';
  end if;

  select * into v_head from public.shared_canonical_curriculum_heads
    where workspace_id = p_workspace_id for update;
  if not found then raise exception 'SHARED_CANONICAL_BASELINE_REQUIRED' using errcode = '23514'; end if;
  if v_head.canonical_version_ref <> p_expected_current_canonical_version_ref then
    raise exception 'CANONICAL_HEAD_CAS_MISMATCH' using errcode = '40001';
  end if;

  select * into v_previous from public.shared_canonical_curriculum_versions
    where workspace_id = p_workspace_id and canonical_version_ref = p_expected_current_canonical_version_ref for update;
  if not found or v_previous.status <> 'ACTIVE' then raise exception 'ACTIVE_CANONICAL_BASELINE_REQUIRED' using errcode = '23514'; end if;

  select * into v_candidate from public.shared_canonical_curriculum_versions
    where workspace_id = p_workspace_id and canonical_version_ref = p_candidate_canonical_version_ref for update;
  if not found or v_candidate.status <> 'PREPARED' then raise exception 'PREPARED_CANONICAL_CANDIDATE_REQUIRED' using errcode = '23514'; end if;
  if v_candidate.decision_receipt_ref <> p_decision_receipt_ref
     or v_candidate.proposal_ref <> p_proposal_ref
     or v_candidate.proposal_version_ref <> p_proposal_version_ref
     or v_candidate.proposal_version_fingerprint <> p_proposal_version_fingerprint
     or v_candidate.target_node_ref <> v_decision.adoption_target_node_ref
     or v_candidate.base_canonical_version_ref <> p_expected_current_canonical_version_ref
     or v_candidate.previous_canonical_version_ref <> p_expected_current_canonical_version_ref then
    raise exception 'CANONICAL_CANDIDATE_PROVENANCE_MISMATCH' using errcode = '23514';
  end if;

  update public.shared_canonical_curriculum_versions
    set status = 'SUPERSEDED', superseded_at = v_now
    where workspace_id = p_workspace_id and canonical_version_ref = p_expected_current_canonical_version_ref;
  update public.shared_canonical_curriculum_versions
    set status = 'ACTIVE', activated_at = v_now
    where workspace_id = p_workspace_id and canonical_version_ref = p_candidate_canonical_version_ref;

  insert into public.canonical_adoption_receipts (
    workspace_id, decision_receipt_ref, proposal_ref, proposal_version_ref, proposal_version_fingerprint,
    previous_canonical_version_ref, adopted_canonical_version_ref, adopted_by, adopted_by_role,
    adopted_at, supersedes_adoption_receipt_ref, client_request_id
  ) values (
    p_workspace_id, p_decision_receipt_ref, p_proposal_ref, p_proposal_version_ref, p_proposal_version_fingerprint,
    p_expected_current_canonical_version_ref, p_candidate_canonical_version_ref, v_user_id, 'dirigente',
    v_now, v_head.adoption_receipt_ref, p_client_request_id
  ) returning * into v_receipt;

  update public.shared_canonical_curriculum_heads
    set canonical_version_ref = p_candidate_canonical_version_ref,
        adoption_receipt_ref = v_receipt.id,
        activated_at = v_now
    where workspace_id = p_workspace_id;

  v_result := jsonb_build_object(
    'receipt', jsonb_strip_nulls(jsonb_build_object(
      'schemaVersion',1,'id',v_receipt.id::text,'workspaceId',v_receipt.workspace_id::text,
      'decisionReceiptRef',v_receipt.decision_receipt_ref::text,'proposalRef',v_receipt.proposal_ref,
      'proposalVersionRef',v_receipt.proposal_version_ref,'proposalVersionFingerprint',v_receipt.proposal_version_fingerprint,
      'previousCanonicalVersionRef',v_receipt.previous_canonical_version_ref,'adoptedCanonicalVersionRef',v_receipt.adopted_canonical_version_ref,
      'adoptedByUserId',v_receipt.adopted_by::text,'adoptedByRole',v_receipt.adopted_by_role,'adoptedAt',v_receipt.adopted_at,
      'status','ADOPTED','supersedesAdoptionReceiptRef',v_receipt.supersedes_adoption_receipt_ref::text)),
    'previousHead', jsonb_build_object('workspaceId',p_workspace_id::text,'canonicalVersionRef',p_expected_current_canonical_version_ref,'status','ACTIVE','activatedAt',v_previous.activated_at,'adoptionReceiptRef',coalesce(v_head.adoption_receipt_ref::text,'')),
    'currentHead', jsonb_build_object('workspaceId',p_workspace_id::text,'canonicalVersionRef',p_candidate_canonical_version_ref,'status','ACTIVE','activatedAt',v_now,'adoptionReceiptRef',v_receipt.id::text)
  );
  return v_result;
end;
$$;

revoke all on function public.get_shared_canonical_head_v1(uuid, uuid) from public;
grant execute on function public.get_shared_canonical_head_v1(uuid, uuid) to authenticated;
revoke all on function public.get_canonical_adoption_for_decision_v1(uuid, uuid, uuid) from public;
grant execute on function public.get_canonical_adoption_for_decision_v1(uuid, uuid, uuid) to authenticated;
revoke all on function public.adopt_shared_canonical_curriculum_v1(uuid, uuid, uuid, text, text, text, text, text, text) from public;
grant execute on function public.adopt_shared_canonical_curriculum_v1(uuid, uuid, uuid, text, text, text, text, text, text) to authenticated;

comment on function public.adopt_shared_canonical_curriculum_v1(uuid, uuid, uuid, text, text, text, text, text, text) is
  'R7A7 CURRICULUM_ADOPT transaction for a server-prepared canonical candidate bound to an R7A6 decision. Requires an existing authoritative baseline and performs CAS, supersession and immutable receipt persistence atomically.';
