-- R7A5 canonical payload closure: validate the full frozen R7A3/R7A4 payload schema server-side.

create or replace function public.validate_shared_revision_proposal_payload_v1(
  p_proposal_ref text,
  p_proposal_version_ref text,
  p_canonical_payload text
) returns void
language plpgsql immutable set search_path=public,pg_temp
as $$
declare
  v_payload jsonb;
  v_keys text[];
  v_ref jsonb;
  v_entity_type text;
  v_required_keys text[] := array['id','proposalRef','versionNumber','currentTextSnapshot','proposedText','rationale','sourceRefs','evidenceRefs','createdAt','structuralFootprint','frozen'];
  v_allowed_keys text[] := array['id','proposalRef','versionNumber','currentTextSnapshot','proposedText','rationale','sourceRefs','evidenceRefs','createdAt','structuralFootprint','previousVersionRef','changeNote','frozen'];
  v_allowed_entity_types text[] := array['institute','source','curriculum-version','curriculum-segment','curriculum-node','curriculum-link','revision-proposal','decision','teaching-design','document','document-version','template','class-context','assessment','actor','event'];
begin
  begin
    v_payload := p_canonical_payload::jsonb;
  exception when others then
    raise exception 'INVALID_CANONICAL_PAYLOAD_JSON' using errcode='22023';
  end;

  if jsonb_typeof(v_payload) <> 'object' then
    raise exception 'INVALID_CANONICAL_PAYLOAD_SHAPE' using errcode='22023';
  end if;

  select array_agg(key order by key) into v_keys from jsonb_object_keys(v_payload) key;
  if exists (select 1 from unnest(v_required_keys) k where not (v_payload ? k)) then
    raise exception 'CANONICAL_PAYLOAD_REQUIRED_KEY_MISSING' using errcode='22023';
  end if;
  if exists (select 1 from unnest(v_keys) k where not (k = any(v_allowed_keys))) then
    raise exception 'CANONICAL_PAYLOAD_EXTRA_KEY' using errcode='22023';
  end if;

  if jsonb_typeof(v_payload->'id') <> 'string' or btrim(v_payload->>'id')='' or (v_payload->>'id')<>btrim(v_payload->>'id') then raise exception 'INVALID_CANONICAL_PAYLOAD_ID' using errcode='22023'; end if;
  if jsonb_typeof(v_payload->'proposalRef') <> 'string' or btrim(v_payload->>'proposalRef')='' or (v_payload->>'proposalRef')<>btrim(v_payload->>'proposalRef') then raise exception 'INVALID_CANONICAL_PAYLOAD_PROPOSAL_REF' using errcode='22023'; end if;
  if v_payload->>'id' <> p_proposal_version_ref or v_payload->>'proposalRef' <> p_proposal_ref then raise exception 'CANONICAL_PAYLOAD_IDENTITY_MISMATCH' using errcode='22023'; end if;
  if jsonb_typeof(v_payload->'versionNumber') <> 'number' or (v_payload->>'versionNumber')::numeric < 1 or trunc((v_payload->>'versionNumber')::numeric) <> (v_payload->>'versionNumber')::numeric then raise exception 'INVALID_CANONICAL_PAYLOAD_VERSION_NUMBER' using errcode='22023'; end if;
  if jsonb_typeof(v_payload->'currentTextSnapshot') <> 'string' then raise exception 'INVALID_CANONICAL_PAYLOAD_CURRENT_TEXT' using errcode='22023'; end if;
  if jsonb_typeof(v_payload->'proposedText') <> 'string' or btrim(v_payload->>'proposedText')='' or (v_payload->>'proposedText')<>btrim(v_payload->>'proposedText') then raise exception 'INVALID_CANONICAL_PAYLOAD_PROPOSED_TEXT' using errcode='22023'; end if;
  if jsonb_typeof(v_payload->'rationale') <> 'string' then raise exception 'INVALID_CANONICAL_PAYLOAD_RATIONALE' using errcode='22023'; end if;
  if jsonb_typeof(v_payload->'createdAt') <> 'string' then raise exception 'INVALID_CANONICAL_PAYLOAD_CREATED_AT' using errcode='22023'; end if;
  perform (v_payload->>'createdAt')::timestamptz;
  if jsonb_typeof(v_payload->'structuralFootprint') <> 'string' then raise exception 'INVALID_CANONICAL_PAYLOAD_STRUCTURAL_FOOTPRINT' using errcode='22023'; end if;
  if jsonb_typeof(v_payload->'frozen') <> 'boolean' or (v_payload->>'frozen')::boolean is distinct from true then raise exception 'INVALID_CANONICAL_PAYLOAD_FROZEN' using errcode='22023'; end if;

  if v_payload ? 'previousVersionRef' then
    if jsonb_typeof(v_payload->'previousVersionRef') <> 'string' or btrim(v_payload->>'previousVersionRef')='' or (v_payload->>'previousVersionRef')<>btrim(v_payload->>'previousVersionRef') then raise exception 'INVALID_CANONICAL_PAYLOAD_PREVIOUS_VERSION_REF' using errcode='22023'; end if;
  end if;
  if v_payload ? 'changeNote' then
    if jsonb_typeof(v_payload->'changeNote') <> 'string' or btrim(v_payload->>'changeNote')='' or (v_payload->>'changeNote')<>btrim(v_payload->>'changeNote') then raise exception 'INVALID_CANONICAL_PAYLOAD_CHANGE_NOTE' using errcode='22023'; end if;
  end if;

  if jsonb_typeof(v_payload->'sourceRefs') <> 'array' or jsonb_typeof(v_payload->'evidenceRefs') <> 'array' then raise exception 'INVALID_CANONICAL_PAYLOAD_REFERENCE_ARRAYS' using errcode='22023'; end if;

  for v_ref in select value from jsonb_array_elements(v_payload->'sourceRefs') loop
    if jsonb_typeof(v_ref) <> 'object' then raise exception 'INVALID_CANONICAL_PAYLOAD_REFERENCE' using errcode='22023'; end if;
    if not (v_ref ? 'id') or not (v_ref ? 'entityType') then raise exception 'CANONICAL_PAYLOAD_REFERENCE_REQUIRED_KEY_MISSING' using errcode='22023'; end if;
    if exists (select 1 from jsonb_object_keys(v_ref) k where k not in ('id','entityType','snapshotLabel')) then raise exception 'CANONICAL_PAYLOAD_REFERENCE_EXTRA_KEY' using errcode='22023'; end if;
    if jsonb_typeof(v_ref->'id') <> 'string' or btrim(v_ref->>'id')='' or (v_ref->>'id')<>btrim(v_ref->>'id') then raise exception 'INVALID_CANONICAL_PAYLOAD_REFERENCE_ID' using errcode='22023'; end if;
    if jsonb_typeof(v_ref->'entityType') <> 'string' then raise exception 'INVALID_CANONICAL_PAYLOAD_REFERENCE_ENTITY_TYPE' using errcode='22023'; end if;
    v_entity_type := v_ref->>'entityType';
    if not (v_entity_type = any(v_allowed_entity_types)) then raise exception 'INVALID_CANONICAL_PAYLOAD_REFERENCE_ENTITY_TYPE' using errcode='22023'; end if;
    if v_ref ? 'snapshotLabel' and (jsonb_typeof(v_ref->'snapshotLabel') <> 'string' or btrim(v_ref->>'snapshotLabel')='' or (v_ref->>'snapshotLabel')<>btrim(v_ref->>'snapshotLabel')) then raise exception 'INVALID_CANONICAL_PAYLOAD_REFERENCE_SNAPSHOT_LABEL' using errcode='22023'; end if;
  end loop;

  for v_ref in select value from jsonb_array_elements(v_payload->'evidenceRefs') loop
    if jsonb_typeof(v_ref) <> 'object' then raise exception 'INVALID_CANONICAL_PAYLOAD_REFERENCE' using errcode='22023'; end if;
    if not (v_ref ? 'id') or not (v_ref ? 'entityType') then raise exception 'CANONICAL_PAYLOAD_REFERENCE_REQUIRED_KEY_MISSING' using errcode='22023'; end if;
    if exists (select 1 from jsonb_object_keys(v_ref) k where k not in ('id','entityType','snapshotLabel')) then raise exception 'CANONICAL_PAYLOAD_REFERENCE_EXTRA_KEY' using errcode='22023'; end if;
    if jsonb_typeof(v_ref->'id') <> 'string' or btrim(v_ref->>'id')='' or (v_ref->>'id')<>btrim(v_ref->>'id') then raise exception 'INVALID_CANONICAL_PAYLOAD_REFERENCE_ID' using errcode='22023'; end if;
    if jsonb_typeof(v_ref->'entityType') <> 'string' then raise exception 'INVALID_CANONICAL_PAYLOAD_REFERENCE_ENTITY_TYPE' using errcode='22023'; end if;
    v_entity_type := v_ref->>'entityType';
    if not (v_entity_type = any(v_allowed_entity_types)) then raise exception 'INVALID_CANONICAL_PAYLOAD_REFERENCE_ENTITY_TYPE' using errcode='22023'; end if;
    if v_ref ? 'snapshotLabel' and (jsonb_typeof(v_ref->'snapshotLabel') <> 'string' or btrim(v_ref->>'snapshotLabel')='' or (v_ref->>'snapshotLabel')<>btrim(v_ref->>'snapshotLabel')) then raise exception 'INVALID_CANONICAL_PAYLOAD_REFERENCE_SNAPSHOT_LABEL' using errcode='22023'; end if;
  end loop;
end;
$$;

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
  perform public.validate_shared_revision_proposal_payload_v1(p_proposal_ref,p_proposal_version_ref,p_canonical_payload);
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

revoke all on function public.validate_shared_revision_proposal_payload_v1(text,text,text) from public;
revoke all on function public.submit_shared_revision_proposal_version_v1(uuid,text,text,text,text,text,text,text,text) from public;
grant execute on function public.submit_shared_revision_proposal_version_v1(uuid,text,text,text,text,text,text,text,text) to authenticated;
