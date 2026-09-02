-- CurManLight Arena R7A5 — shared submitted proposal persistence
-- Contract authority: ARENA_R7A4_SHARED_SUBMITTED_PROPOSAL_AUTHORITY_BOUNDARY.md
-- Direct client writes remain closed; authenticated mutations are RPC-only.

create table if not exists public.shared_revision_proposals (
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  proposal_ref text not null,
  current_proposal_version_ref text,
  target_node_ref text not null,
  base_curriculum_version_ref text not null,
  created_at timestamptz not null default now(),
  primary key (workspace_id, proposal_ref),
  check (proposal_ref = trim(proposal_ref) and char_length(proposal_ref) > 0 and position(chr(31) in proposal_ref) = 0),
  check (target_node_ref = trim(target_node_ref) and char_length(target_node_ref) > 0 and position(chr(31) in target_node_ref) = 0),
  check (base_curriculum_version_ref = trim(base_curriculum_version_ref) and char_length(base_curriculum_version_ref) > 0 and position(chr(31) in base_curriculum_version_ref) = 0)
);

create table if not exists public.shared_revision_proposal_versions (
  workspace_id uuid not null,
  proposal_ref text not null,
  proposal_version_ref text not null,
  proposal_version_fingerprint text not null check (proposal_version_fingerprint ~ '^[0-9a-f]{64}$'),
  canonical_payload text not null,
  lifecycle_state text not null check (lifecycle_state in ('submitted','under-review','changes-requested','accepted-for-decision','rejected','withdrawn','archived')),
  previous_shared_proposal_version_ref text,
  submitted_by uuid not null references auth.users(id) on delete restrict,
  submitted_by_role text not null check (submitted_by_role in ('docente','dipartimento','referente')),
  submitted_at timestamptz not null default now(),
  primary key (workspace_id, proposal_version_ref),
  foreign key (workspace_id, proposal_ref) references public.shared_revision_proposals(workspace_id, proposal_ref) on delete restrict,
  check (proposal_ref = trim(proposal_ref) and char_length(proposal_ref) > 0 and position(chr(31) in proposal_ref) = 0),
  check (proposal_version_ref = trim(proposal_version_ref) and char_length(proposal_version_ref) > 0 and position(chr(31) in proposal_version_ref) = 0)
);

alter table public.shared_revision_proposals
  add constraint shared_revision_proposals_current_head_fk
  foreign key (workspace_id, current_proposal_version_ref)
  references public.shared_revision_proposal_versions(workspace_id, proposal_version_ref)
  deferrable initially deferred;

create table if not exists public.shared_proposal_request_reservations (
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  client_request_id text not null,
  operation_kind text not null check (operation_kind in ('submission','lifecycle-mutation')),
  server_principal_user_id uuid not null references auth.users(id) on delete restrict,
  operation_fingerprint text not null check (operation_fingerprint ~ '^[0-9a-f]{64}$'),
  result_payload jsonb not null,
  created_at timestamptz not null default now(),
  primary key (workspace_id, client_request_id),
  check (client_request_id = trim(client_request_id) and char_length(client_request_id) > 0)
);

create table if not exists public.shared_proposal_lifecycle_receipts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  proposal_ref text not null,
  proposal_version_ref text not null,
  from_state text not null,
  to_state text not null,
  capability_used text not null check (capability_used in ('CURRICULUM_PROPOSE','REVISION_REVIEW')),
  transitioned_by uuid not null references auth.users(id) on delete restrict,
  transitioned_by_role text not null,
  transitioned_at timestamptz not null default now(),
  client_request_id text not null,
  unique (workspace_id, client_request_id),
  foreign key (workspace_id, proposal_version_ref) references public.shared_revision_proposal_versions(workspace_id, proposal_version_ref) on delete restrict
);

alter table public.shared_revision_proposals enable row level security;
alter table public.shared_revision_proposal_versions enable row level security;
alter table public.shared_proposal_lifecycle_receipts enable row level security;
alter table public.shared_proposal_request_reservations enable row level security;

create policy "shared_revision_proposals_select_active_member" on public.shared_revision_proposals
for select to authenticated using (exists (
  select 1 from public.workspace_memberships m join public.workspaces w on w.id=m.workspace_id
  where m.workspace_id=shared_revision_proposals.workspace_id and m.user_id=auth.uid() and m.status='active' and w.status='active'
));
create policy "shared_revision_proposal_versions_select_active_member" on public.shared_revision_proposal_versions
for select to authenticated using (exists (
  select 1 from public.workspace_memberships m join public.workspaces w on w.id=m.workspace_id
  where m.workspace_id=shared_revision_proposal_versions.workspace_id and m.user_id=auth.uid() and m.status='active' and w.status='active'
));
create policy "shared_proposal_lifecycle_receipts_select_active_member" on public.shared_proposal_lifecycle_receipts
for select to authenticated using (exists (
  select 1 from public.workspace_memberships m join public.workspaces w on w.id=m.workspace_id
  where m.workspace_id=shared_proposal_lifecycle_receipts.workspace_id and m.user_id=auth.uid() and m.status='active' and w.status='active'
));

revoke insert, update, delete on public.shared_revision_proposals, public.shared_revision_proposal_versions, public.shared_proposal_lifecycle_receipts, public.shared_proposal_request_reservations from anon, authenticated;
grant select on public.shared_revision_proposals, public.shared_revision_proposal_versions, public.shared_proposal_lifecycle_receipts to authenticated;

create or replace function public.submit_shared_revision_proposal_version_v1(
  p_workspace_id uuid,
  p_proposal_ref text,
  p_proposal_version_ref text,
  p_proposal_version_fingerprint text,
  p_canonical_payload text,
  p_target_node_ref text,
  p_base_curriculum_version_ref text,
  p_expected_current_proposal_version_ref text,
  p_client_request_id text
) returns jsonb
language plpgsql security definer set search_path=public,pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_role text;
  v_head text;
  v_state text;
  v_previous text;
  v_digest text;
  v_operation_fingerprint text;
  v_existing public.shared_proposal_request_reservations%rowtype;
  v_result jsonb;
begin
  if v_user is null then raise exception 'AUTHENTICATION_REQUIRED' using errcode='42501'; end if;
  if p_client_request_id is null or p_client_request_id <> trim(p_client_request_id) or p_client_request_id='' then raise exception 'INVALID_CLIENT_REQUEST_ID' using errcode='22023'; end if;
  if p_proposal_ref is null or p_proposal_ref<>trim(p_proposal_ref) or p_proposal_ref='' or position(chr(31) in p_proposal_ref)>0 then raise exception 'INVALID_PROPOSAL_REF' using errcode='22023'; end if;
  if p_proposal_version_ref is null or p_proposal_version_ref<>trim(p_proposal_version_ref) or p_proposal_version_ref='' or position(chr(31) in p_proposal_version_ref)>0 then raise exception 'INVALID_PROPOSAL_VERSION_REF' using errcode='22023'; end if;
  if p_target_node_ref is null or p_target_node_ref<>trim(p_target_node_ref) or p_target_node_ref='' or position(chr(31) in p_target_node_ref)>0 then raise exception 'INVALID_TARGET_NODE_REF' using errcode='22023'; end if;
  if p_base_curriculum_version_ref is null or p_base_curriculum_version_ref<>trim(p_base_curriculum_version_ref) or p_base_curriculum_version_ref='' or position(chr(31) in p_base_curriculum_version_ref)>0 then raise exception 'INVALID_BASE_CURRICULUM_VERSION_REF' using errcode='22023'; end if;
  if p_proposal_version_fingerprint !~ '^[0-9a-f]{64}$' then raise exception 'INVALID_PROPOSAL_FINGERPRINT' using errcode='22023'; end if;
  perform convert_to(p_canonical_payload,'UTF8');
  v_digest := encode(digest(convert_to(p_canonical_payload,'UTF8'),'sha256'),'hex');
  if v_digest <> p_proposal_version_fingerprint then raise exception 'PROPOSAL_FINGERPRINT_MISMATCH' using errcode='22023'; end if;

  select m.role into v_role from public.workspace_memberships m join public.workspaces w on w.id=m.workspace_id
  where m.workspace_id=p_workspace_id and m.user_id=v_user and m.status='active' and w.status='active';
  if v_role not in ('docente','dipartimento','referente') then raise exception 'CURRICULUM_PROPOSE_REQUIRED' using errcode='42501'; end if;

  v_operation_fingerprint := encode(digest(convert_to(concat_ws(chr(31),'submission',p_proposal_ref,p_proposal_version_ref,p_proposal_version_fingerprint,p_target_node_ref,p_base_curriculum_version_ref,coalesce(p_expected_current_proposal_version_ref,'')),'UTF8'),'sha256'),'hex');
  select * into v_existing from public.shared_proposal_request_reservations where workspace_id=p_workspace_id and client_request_id=p_client_request_id for update;
  if found then
    if v_existing.operation_kind<>'submission' or v_existing.server_principal_user_id<>v_user or v_existing.operation_fingerprint<>v_operation_fingerprint then
      raise exception 'CLIENT_REQUEST_ID_REUSE_MISMATCH' using errcode='23505';
    end if;
    return v_existing.result_payload;
  end if;

  select current_proposal_version_ref,target_node_ref,base_curriculum_version_ref into v_head,p_target_node_ref,p_base_curriculum_version_ref
  from public.shared_revision_proposals where workspace_id=p_workspace_id and proposal_ref=p_proposal_ref for update;
  if found then
    if v_head is distinct from p_expected_current_proposal_version_ref then raise exception 'STALE_SHARED_PROPOSAL_HEAD' using errcode='40001'; end if;
    select lifecycle_state into v_state from public.shared_revision_proposal_versions where workspace_id=p_workspace_id and proposal_version_ref=v_head;
    if v_state<>'changes-requested' then raise exception 'REPLACEMENT_REQUIRES_CHANGES_REQUESTED' using errcode='23514'; end if;
    v_previous:=v_head;
  else
    if p_expected_current_proposal_version_ref is not null then raise exception 'STALE_SHARED_PROPOSAL_HEAD' using errcode='40001'; end if;
    insert into public.shared_revision_proposals(workspace_id,proposal_ref,target_node_ref,base_curriculum_version_ref)
    values(p_workspace_id,p_proposal_ref,p_target_node_ref,p_base_curriculum_version_ref);
    v_previous:=null;
  end if;

  insert into public.shared_revision_proposal_versions(workspace_id,proposal_ref,proposal_version_ref,proposal_version_fingerprint,canonical_payload,lifecycle_state,previous_shared_proposal_version_ref,submitted_by,submitted_by_role)
  values(p_workspace_id,p_proposal_ref,p_proposal_version_ref,v_digest,p_canonical_payload,'submitted',v_previous,v_user,v_role);
  update public.shared_revision_proposals set current_proposal_version_ref=p_proposal_version_ref where workspace_id=p_workspace_id and proposal_ref=p_proposal_ref;

  select jsonb_build_object('schemaVersion',1,'workspaceId',v.workspace_id,'proposalRef',v.proposal_ref,'proposalVersionRef',v.proposal_version_ref,'proposalVersionFingerprint',v.proposal_version_fingerprint,'canonicalPayload',v.canonical_payload,'targetNodeRef',p_target_node_ref,'baseCurriculumVersionRef',p_base_curriculum_version_ref,'submittedByUserId',v.submitted_by,'submittedByRole',v.submitted_by_role,'submittedAt',v.submitted_at,'submittedAtSource','server-transaction-clock','submittedPrincipalSource','server-session','lifecycleState',v.lifecycle_state,'previousSharedProposalVersionRef',v.previous_shared_proposal_version_ref)
  into v_result from public.shared_revision_proposal_versions v where v.workspace_id=p_workspace_id and v.proposal_version_ref=p_proposal_version_ref;
  insert into public.shared_proposal_request_reservations(workspace_id,client_request_id,operation_kind,server_principal_user_id,operation_fingerprint,result_payload)
  values(p_workspace_id,p_client_request_id,'submission',v_user,v_operation_fingerprint,v_result);
  return v_result;
end; $$;

revoke all on function public.submit_shared_revision_proposal_version_v1(uuid,text,text,text,text,text,text,text,text) from public;
grant execute on function public.submit_shared_revision_proposal_version_v1(uuid,text,text,text,text,text,text,text,text) to authenticated;

comment on function public.submit_shared_revision_proposal_version_v1(uuid,text,text,text,text,text,text,text,text) is
'R7A5 authenticated shared submission boundary. Server-session principal, fresh active membership, CAS head and workspace-scoped idempotency are enforced transactionally. No canonical adoption occurs.';
