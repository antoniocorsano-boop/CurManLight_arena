-- Arena R7A6 — institutional decision rebind to R7A5 shared proposal authority.

alter table public.institutional_revision_decisions
  add column if not exists shared_proposal_authority_version smallint;

alter table public.institutional_revision_decisions
  drop constraint if exists institutional_revision_decisions_shared_proposal_authority_version_check;
alter table public.institutional_revision_decisions
  add constraint institutional_revision_decisions_shared_proposal_authority_version_check
  check (shared_proposal_authority_version is null or shared_proposal_authority_version = 1);

create or replace function public.record_institutional_revision_decision_v4(
  p_workspace_id uuid,
  p_expected_context_user_id uuid,
  p_proposal_ref text,
  p_proposal_version_ref text,
  p_proposal_version_fingerprint text,
  p_target_node_ref text,
  p_base_curriculum_version_ref text,
  p_outcome text,
  p_rationale text,
  p_client_request_id uuid
)
returns setof public.institutional_revision_decisions
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_head text;
  v_shared_fingerprint text;
  v_shared_state text;
  v_shared_target text;
  v_shared_base text;
  v_existing public.institutional_revision_decisions%rowtype;
  v_latest public.institutional_revision_decisions%rowtype;
  v_binding_material text;
  v_binding_fingerprint text;
begin
  if v_user_id is null then raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501'; end if;
  if p_expected_context_user_id is null or p_expected_context_user_id <> v_user_id then
    raise exception 'WORKSPACE_ACTOR_CONTEXT_PRINCIPAL_MISMATCH' using errcode = '42501';
  end if;

  if p_workspace_id is null
     or not public.is_shared_proposal_js_trimmed_v1(p_proposal_ref)
     or not public.is_shared_proposal_js_trimmed_v1(p_proposal_version_ref)
     or position(chr(31) in p_proposal_ref) > 0
     or position(chr(31) in p_proposal_version_ref) > 0
     or p_proposal_version_fingerprint is null
     or p_proposal_version_fingerprint !~ '^[a-f0-9]{64}$'
     or not public.is_shared_proposal_js_trimmed_v1(p_target_node_ref)
     or not public.is_shared_proposal_js_trimmed_v1(p_base_curriculum_version_ref)
     or position(chr(31) in p_target_node_ref) > 0
     or position(chr(31) in p_base_curriculum_version_ref) > 0
     or p_outcome not in ('approve', 'approve-with-changes', 'reject', 'defer', 'return-for-revision')
     or not public.is_shared_proposal_js_trimmed_v1(p_rationale)
     or char_length(p_rationale) > 4000
     or p_client_request_id is null then
    raise exception 'INVALID_INSTITUTIONAL_DECISION_V4_INPUT' using errcode = '22023';
  end if;

  select membership.role into v_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id
    and membership.user_id = v_user_id
    and membership.status = 'active'
    and workspace.status = 'active';
  if v_role is null then raise exception 'ACTIVE_WORKSPACE_MEMBERSHIP_REQUIRED' using errcode = '42501'; end if;
  if v_role is distinct from 'collegio' then raise exception 'REVISION_DECIDE_REQUIRED' using errcode = '42501'; end if;

  perform pg_advisory_xact_lock(hashtextextended(p_workspace_id::text || ':' || p_proposal_version_ref, 0));

  select proposal.current_proposal_version_ref, proposal.target_node_ref, proposal.base_curriculum_version_ref
    into v_head, v_shared_target, v_shared_base
  from public.shared_revision_proposals proposal
  where proposal.workspace_id = p_workspace_id
    and proposal.proposal_ref = p_proposal_ref
  for update;
  if not found or v_head is distinct from p_proposal_version_ref then
    raise exception 'SHARED_PROPOSAL_CURRENT_HEAD_REQUIRED' using errcode = '40001';
  end if;

  select version.proposal_version_fingerprint, version.lifecycle_state
    into v_shared_fingerprint, v_shared_state
  from public.shared_revision_proposal_versions version
  where version.workspace_id = p_workspace_id
    and version.proposal_ref = p_proposal_ref
    and version.proposal_version_ref = p_proposal_version_ref
  for update;
  if not found then raise exception 'SHARED_PROPOSAL_VERSION_REQUIRED' using errcode = '23514'; end if;
  if v_shared_fingerprint is distinct from p_proposal_version_fingerprint then
    raise exception 'SHARED_PROPOSAL_VERSION_FINGERPRINT_MISMATCH' using errcode = '23514';
  end if;
  if v_shared_state is distinct from 'accepted-for-decision' then
    raise exception 'SHARED_PROPOSAL_ACCEPTED_FOR_DECISION_REQUIRED' using errcode = '23514';
  end if;
  if v_shared_target is distinct from p_target_node_ref or v_shared_base is distinct from p_base_curriculum_version_ref then
    raise exception 'SHARED_PROPOSAL_SCOPE_MISMATCH' using errcode = '23514';
  end if;

  v_binding_material := 'CML_ARENA_ADOPTION_BINDING_V2' || chr(31)
    || p_workspace_id::text || chr(31) || p_proposal_ref || chr(31)
    || p_proposal_version_ref || chr(31) || v_shared_fingerprint || chr(31)
    || v_shared_target || chr(31) || v_shared_base;
  v_binding_fingerprint := encode(digest(convert_to(v_binding_material, 'UTF8'), 'sha256'), 'hex');

  select * into v_existing
  from public.institutional_revision_decisions decision
  where decision.workspace_id = p_workspace_id
    and decision.client_request_id = p_client_request_id;
  if found then
    if v_existing.decided_by <> v_user_id
       or v_existing.proposal_ref <> p_proposal_ref
       or v_existing.proposal_version_ref <> p_proposal_version_ref
       or v_existing.proposal_version_fingerprint <> v_shared_fingerprint
       or v_existing.shared_proposal_authority_version is distinct from 1
       or v_existing.adoption_binding_version is distinct from 2
       or v_existing.adoption_target_node_ref is distinct from v_shared_target
       or v_existing.adoption_base_curriculum_version_ref is distinct from v_shared_base
       or v_existing.adoption_binding_fingerprint is distinct from v_binding_fingerprint
       or v_existing.outcome <> p_outcome
       or v_existing.rationale <> p_rationale then
      raise exception 'CLIENT_REQUEST_ID_REUSE_MISMATCH' using errcode = '23505';
    end if;
    return next v_existing; return;
  end if;

  select * into v_latest
  from public.institutional_revision_decisions decision
  where decision.workspace_id = p_workspace_id
    and decision.proposal_version_ref = p_proposal_version_ref
  order by decision.decided_at desc, decision.id desc
  limit 1;
  if found then
    if v_latest.proposal_ref <> p_proposal_ref then raise exception 'PROPOSAL_VERSION_REFERENCE_MISMATCH' using errcode = '23514'; end if;
    if v_latest.proposal_version_fingerprint <> v_shared_fingerprint then raise exception 'PROPOSAL_VERSION_FINGERPRINT_MISMATCH' using errcode = '23514'; end if;
    if v_latest.adoption_binding_version = 2 and (
      v_latest.adoption_target_node_ref is distinct from v_shared_target
      or v_latest.adoption_base_curriculum_version_ref is distinct from v_shared_base
      or v_latest.adoption_binding_fingerprint is distinct from v_binding_fingerprint
    ) then raise exception 'ADOPTION_BINDING_MISMATCH' using errcode = '23514'; end if;
    if v_latest.outcome in ('approve', 'approve-with-changes', 'reject') then
      raise exception 'INSTITUTIONAL_DECISION_ALREADY_FINAL' using errcode = '23505';
    end if;
  end if;

  insert into public.institutional_revision_decisions (
    workspace_id, proposal_ref, proposal_version_ref, proposal_version_fingerprint,
    proposal_snapshot_version, shared_proposal_authority_version,
    adoption_binding_version, adoption_target_node_ref, adoption_base_curriculum_version_ref,
    adoption_binding_fingerprint, outcome, rationale, decided_by, authority_role, client_request_id
  ) values (
    p_workspace_id, p_proposal_ref, p_proposal_version_ref, v_shared_fingerprint,
    null, 1,
    2, v_shared_target, v_shared_base, v_binding_fingerprint,
    p_outcome, p_rationale, v_user_id, 'collegio', p_client_request_id
  ) returning * into v_existing;

  return next v_existing;
end;
$$;

create or replace function public.get_institutional_revision_decision_for_shared_version_v1(
  p_workspace_id uuid,
  p_expected_context_user_id uuid,
  p_proposal_version_ref text
)
returns setof public.institutional_revision_decisions
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
begin
  if v_user_id is null then raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501'; end if;
  if p_expected_context_user_id is null or p_expected_context_user_id <> v_user_id then
    raise exception 'WORKSPACE_ACTOR_CONTEXT_PRINCIPAL_MISMATCH' using errcode = '42501';
  end if;
  if not public.is_shared_proposal_js_trimmed_v1(p_proposal_version_ref) or position(chr(31) in p_proposal_version_ref) > 0 then
    raise exception 'INVALID_PROPOSAL_VERSION_REF' using errcode = '22023';
  end if;

  select membership.role into v_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id
    and membership.user_id = v_user_id
    and membership.status = 'active'
    and workspace.status = 'active';
  if v_role is null then raise exception 'ACTIVE_WORKSPACE_MEMBERSHIP_REQUIRED' using errcode = '42501'; end if;

  return query
  select decision.*
  from public.institutional_revision_decisions decision
  where decision.workspace_id = p_workspace_id
    and decision.proposal_version_ref = p_proposal_version_ref
  order by decision.decided_at desc, decision.id desc
  limit 1;
end;
$$;

revoke all on function public.record_institutional_revision_decision_v4(uuid, uuid, text, text, text, text, text, text, text, uuid) from public;
grant execute on function public.record_institutional_revision_decision_v4(uuid, uuid, text, text, text, text, text, text, text, uuid) to authenticated;

revoke all on function public.get_institutional_revision_decision_for_shared_version_v1(uuid, uuid, text) from public;
grant execute on function public.get_institutional_revision_decision_for_shared_version_v1(uuid, uuid, text) to authenticated;

comment on function public.record_institutional_revision_decision_v4(uuid, uuid, text, text, text, text, text, text, text, uuid) is
  'R7A6 REVISION_DECIDE boundary rebound to the current R7A5 shared proposal version in accepted-for-decision state. No R7A3 snapshot creation occurs.';
