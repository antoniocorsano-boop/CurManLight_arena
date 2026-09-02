-- R7A5 closure: preserve proposal scope on replacement and implement closed lifecycle RPC.

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
  v_existing_target text;
  v_existing_base text;
  v_digest text;
  v_operation_fingerprint text;
  v_existing public.shared_proposal_request_reservations%rowtype;
  v_result jsonb;
begin
  if v_user is null then raise exception 'AUTHENTICATION_REQUIRED' using errcode='42501'; end if;
  if p_client_request_id is null or p_client_request_id<>trim(p_client_request_id) or p_client_request_id='' then raise exception 'INVALID_CLIENT_REQUEST_ID' using errcode='22023'; end if;
  if p_proposal_ref is null or p_proposal_ref<>trim(p_proposal_ref) or p_proposal_ref='' or position(chr(31) in p_proposal_ref)>0 then raise exception 'INVALID_PROPOSAL_REF' using errcode='22023'; end if;
  if p_proposal_version_ref is null or p_proposal_version_ref<>trim(p_proposal_version_ref) or p_proposal_version_ref='' or position(chr(31) in p_proposal_version_ref)>0 then raise exception 'INVALID_PROPOSAL_VERSION_REF' using errcode='22023'; end if;
  if p_target_node_ref is null or p_target_node_ref<>trim(p_target_node_ref) or p_target_node_ref='' or position(chr(31) in p_target_node_ref)>0 then raise exception 'INVALID_TARGET_NODE_REF' using errcode='22023'; end if;
  if p_base_curriculum_version_ref is null or p_base_curriculum_version_ref<>trim(p_base_curriculum_version_ref) or p_base_curriculum_version_ref='' or position(chr(31) in p_base_curriculum_version_ref)>0 then raise exception 'INVALID_BASE_CURRICULUM_VERSION_REF' using errcode='22023'; end if;
  if p_proposal_version_fingerprint is null or p_proposal_version_fingerprint !~ '^[0-9a-f]{64}$' then raise exception 'INVALID_PROPOSAL_FINGERPRINT' using errcode='22023'; end if;
  perform convert_to(p_canonical_payload,'UTF8');
  v_digest := encode(digest(convert_to(p_canonical_payload,'UTF8'),'sha256'),'hex');
  if v_digest<>p_proposal_version_fingerprint then raise exception 'PROPOSAL_FINGERPRINT_MISMATCH' using errcode='22023'; end if;

  select m.role into v_role from public.workspace_memberships m join public.workspaces w on w.id=m.workspace_id
  where m.workspace_id=p_workspace_id and m.user_id=v_user and m.status='active' and w.status='active';
  if v_role not in ('docente','dipartimento','referente') then raise exception 'CURRICULUM_PROPOSE_REQUIRED' using errcode='42501'; end if;

  v_operation_fingerprint:=encode(digest(convert_to(concat_ws(chr(31),'submission',p_proposal_ref,p_proposal_version_ref,p_proposal_version_fingerprint,p_target_node_ref,p_base_curriculum_version_ref,coalesce(p_expected_current_proposal_version_ref,'')),'UTF8'),'sha256'),'hex');
  select * into v_existing from public.shared_proposal_request_reservations where workspace_id=p_workspace_id and client_request_id=p_client_request_id for update;
  if found then
    if v_existing.operation_kind<>'submission' or v_existing.server_principal_user_id<>v_user or v_existing.operation_fingerprint<>v_operation_fingerprint then raise exception 'CLIENT_REQUEST_ID_REUSE_MISMATCH' using errcode='23505'; end if;
    return v_existing.result_payload;
  end if;

  select current_proposal_version_ref,target_node_ref,base_curriculum_version_ref into v_head,v_existing_target,v_existing_base
  from public.shared_revision_proposals where workspace_id=p_workspace_id and proposal_ref=p_proposal_ref for update;
  if found then
    if v_head is distinct from p_expected_current_proposal_version_ref then raise exception 'STALE_SHARED_PROPOSAL_HEAD' using errcode='40001'; end if;
    if v_existing_target<>p_target_node_ref or v_existing_base<>p_base_curriculum_version_ref then raise exception 'PROPOSAL_SCOPE_CHANGE_REQUIRES_NEW_IDENTITY' using errcode='23514'; end if;
    select lifecycle_state into v_state from public.shared_revision_proposal_versions where workspace_id=p_workspace_id and proposal_version_ref=v_head;
    if v_state<>'changes-requested' then raise exception 'REPLACEMENT_REQUIRES_CHANGES_REQUESTED' using errcode='23514'; end if;
    v_previous:=v_head;
  else
    if p_expected_current_proposal_version_ref is not null then raise exception 'STALE_SHARED_PROPOSAL_HEAD' using errcode='40001'; end if;
    insert into public.shared_revision_proposals(workspace_id,proposal_ref,target_node_ref,base_curriculum_version_ref) values(p_workspace_id,p_proposal_ref,p_target_node_ref,p_base_curriculum_version_ref);
    v_previous:=null;
  end if;

  insert into public.shared_revision_proposal_versions(workspace_id,proposal_ref,proposal_version_ref,proposal_version_fingerprint,canonical_payload,lifecycle_state,previous_shared_proposal_version_ref,submitted_by,submitted_by_role)
  values(p_workspace_id,p_proposal_ref,p_proposal_version_ref,v_digest,p_canonical_payload,'submitted',v_previous,v_user,v_role);
  update public.shared_revision_proposals set current_proposal_version_ref=p_proposal_version_ref where workspace_id=p_workspace_id and proposal_ref=p_proposal_ref;

  select jsonb_build_object('schemaVersion',1,'workspaceId',v.workspace_id,'proposalRef',v.proposal_ref,'proposalVersionRef',v.proposal_version_ref,'proposalVersionFingerprint',v.proposal_version_fingerprint,'canonicalPayload',v.canonical_payload,'targetNodeRef',p_target_node_ref,'baseCurriculumVersionRef',p_base_curriculum_version_ref,'submittedByUserId',v.submitted_by,'submittedByRole',v.submitted_by_role,'submittedAt',v.submitted_at,'submittedAtSource','server-transaction-clock','submittedPrincipalSource','server-session','lifecycleState',v.lifecycle_state,'previousSharedProposalVersionRef',v.previous_shared_proposal_version_ref)
  into v_result from public.shared_revision_proposal_versions v where v.workspace_id=p_workspace_id and v.proposal_version_ref=p_proposal_version_ref;
  insert into public.shared_proposal_request_reservations(workspace_id,client_request_id,operation_kind,server_principal_user_id,operation_fingerprint,result_payload) values(p_workspace_id,p_client_request_id,'submission',v_user,v_operation_fingerprint,v_result);
  return v_result;
end; $$;

create or replace function public.advance_shared_revision_proposal_lifecycle_v1(
  p_workspace_id uuid,
  p_proposal_ref text,
  p_proposal_version_ref text,
  p_expected_lifecycle_state text,
  p_next_lifecycle_state text,
  p_client_request_id text
) returns jsonb
language plpgsql security definer set search_path=public,pg_temp
as $$
declare
  v_user uuid:=auth.uid();
  v_role text;
  v_capability text;
  v_actor_binding text;
  v_head text;
  v_current_state text;
  v_submitter uuid;
  v_operation_fingerprint text;
  v_existing public.shared_proposal_request_reservations%rowtype;
  v_result jsonb;
  v_receipt jsonb;
begin
  if v_user is null then raise exception 'AUTHENTICATION_REQUIRED' using errcode='42501'; end if;
  if p_client_request_id is null or p_client_request_id<>trim(p_client_request_id) or p_client_request_id='' then raise exception 'INVALID_CLIENT_REQUEST_ID' using errcode='22023'; end if;

  if p_expected_lifecycle_state='submitted' and p_next_lifecycle_state='under-review' then v_capability:='REVISION_REVIEW'; v_actor_binding:='authorized-member';
  elsif p_expected_lifecycle_state='submitted' and p_next_lifecycle_state='withdrawn' then v_capability:='CURRICULUM_PROPOSE'; v_actor_binding:='original-submitter';
  elsif p_expected_lifecycle_state='under-review' and p_next_lifecycle_state in ('changes-requested','accepted-for-decision','rejected') then v_capability:='REVISION_REVIEW'; v_actor_binding:='authorized-member';
  else raise exception 'SHARED_LIFECYCLE_TRANSITION_NOT_ALLOWED' using errcode='23514'; end if;

  select m.role into v_role from public.workspace_memberships m join public.workspaces w on w.id=m.workspace_id
  where m.workspace_id=p_workspace_id and m.user_id=v_user and m.status='active' and w.status='active';
  if v_capability='REVISION_REVIEW' and v_role not in ('dipartimento','referente','dirigente') then raise exception 'REVISION_REVIEW_REQUIRED' using errcode='42501'; end if;
  if v_capability='CURRICULUM_PROPOSE' and v_role not in ('docente','dipartimento','referente') then raise exception 'CURRICULUM_PROPOSE_REQUIRED' using errcode='42501'; end if;

  v_operation_fingerprint:=encode(digest(convert_to(concat_ws(chr(31),'lifecycle-mutation',p_proposal_ref,p_proposal_version_ref,p_expected_lifecycle_state,p_next_lifecycle_state),'UTF8'),'sha256'),'hex');
  select * into v_existing from public.shared_proposal_request_reservations where workspace_id=p_workspace_id and client_request_id=p_client_request_id for update;
  if found then
    if v_existing.operation_kind<>'lifecycle-mutation' or v_existing.server_principal_user_id<>v_user or v_existing.operation_fingerprint<>v_operation_fingerprint then raise exception 'CLIENT_REQUEST_ID_REUSE_MISMATCH' using errcode='23505'; end if;
    return v_existing.result_payload;
  end if;

  select current_proposal_version_ref into v_head from public.shared_revision_proposals where workspace_id=p_workspace_id and proposal_ref=p_proposal_ref for update;
  if v_head is distinct from p_proposal_version_ref then raise exception 'STALE_SHARED_PROPOSAL_HEAD' using errcode='40001'; end if;
  select lifecycle_state,submitted_by into v_current_state,v_submitter from public.shared_revision_proposal_versions where workspace_id=p_workspace_id and proposal_ref=p_proposal_ref and proposal_version_ref=p_proposal_version_ref for update;
  if not found or v_current_state<>p_expected_lifecycle_state then raise exception 'STALE_SHARED_PROPOSAL_LIFECYCLE_STATE' using errcode='40001'; end if;
  if v_actor_binding='original-submitter' and v_submitter<>v_user then raise exception 'ORIGINAL_SUBMITTER_REQUIRED' using errcode='42501'; end if;

  update public.shared_revision_proposal_versions set lifecycle_state=p_next_lifecycle_state where workspace_id=p_workspace_id and proposal_version_ref=p_proposal_version_ref;
  insert into public.shared_proposal_lifecycle_receipts(workspace_id,proposal_ref,proposal_version_ref,from_state,to_state,capability_used,transitioned_by,transitioned_by_role,client_request_id)
  values(p_workspace_id,p_proposal_ref,p_proposal_version_ref,p_expected_lifecycle_state,p_next_lifecycle_state,v_capability,v_user,v_role,p_client_request_id)
  returning jsonb_build_object('schemaVersion',1,'workspaceId',workspace_id,'proposalRef',proposal_ref,'proposalVersionRef',proposal_version_ref,'fromState',from_state,'toState',to_state,'capabilityUsed',capability_used,'transitionedByUserId',transitioned_by,'transitionedByRole',transitioned_by_role,'transitionedAt',transitioned_at,'transitionedAtSource','server-transaction-clock','transitionedPrincipalSource','server-session','clientRequestId',client_request_id) into v_receipt;
  select jsonb_build_object('version',jsonb_build_object('schemaVersion',1,'workspaceId',v.workspace_id,'proposalRef',v.proposal_ref,'proposalVersionRef',v.proposal_version_ref,'proposalVersionFingerprint',v.proposal_version_fingerprint,'canonicalPayload',v.canonical_payload,'targetNodeRef',p.target_node_ref,'baseCurriculumVersionRef',p.base_curriculum_version_ref,'submittedByUserId',v.submitted_by,'submittedByRole',v.submitted_by_role,'submittedAt',v.submitted_at,'submittedAtSource','server-transaction-clock','submittedPrincipalSource','server-session','lifecycleState',v.lifecycle_state,'previousSharedProposalVersionRef',v.previous_shared_proposal_version_ref),'receipt',v_receipt)
  into v_result from public.shared_revision_proposal_versions v join public.shared_revision_proposals p on p.workspace_id=v.workspace_id and p.proposal_ref=v.proposal_ref where v.workspace_id=p_workspace_id and v.proposal_version_ref=p_proposal_version_ref;
  insert into public.shared_proposal_request_reservations(workspace_id,client_request_id,operation_kind,server_principal_user_id,operation_fingerprint,result_payload) values(p_workspace_id,p_client_request_id,'lifecycle-mutation',v_user,v_operation_fingerprint,v_result);
  return v_result;
end; $$;

revoke all on function public.advance_shared_revision_proposal_lifecycle_v1(uuid,text,text,text,text,text) from public;
grant execute on function public.advance_shared_revision_proposal_lifecycle_v1(uuid,text,text,text,text,text) to authenticated;
