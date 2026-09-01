-- CurManLight Arena R7A2 — adoption binding v2
-- New institutional decisions bind the frozen proposal version to the exact
-- target node and base curriculum version. Historical v1 receipts remain
-- readable but are not sufficient for canonical adoption.

create extension if not exists pgcrypto;

alter table public.institutional_revision_decisions
  add column if not exists adoption_binding_version smallint,
  add column if not exists adoption_target_node_ref text,
  add column if not exists adoption_base_curriculum_version_ref text,
  add column if not exists adoption_binding_fingerprint text;

alter table public.institutional_revision_decisions
  drop constraint if exists institutional_revision_decisions_adoption_binding_v2_check;
alter table public.institutional_revision_decisions
  add constraint institutional_revision_decisions_adoption_binding_v2_check check (
    (
      adoption_binding_version is null
      and adoption_target_node_ref is null
      and adoption_base_curriculum_version_ref is null
      and adoption_binding_fingerprint is null
    )
    or (
      adoption_binding_version = 2
      and nullif(trim(adoption_target_node_ref), '') is not null
      and nullif(trim(adoption_base_curriculum_version_ref), '') is not null
      and adoption_binding_fingerprint ~ '^[a-f0-9]{64}$'
    )
  );

create or replace function public.record_institutional_revision_decision_v2(
  p_workspace_id uuid,
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
  v_existing public.institutional_revision_decisions%rowtype;
  v_binding_material text;
  v_binding_fingerprint text;
begin
  if v_user_id is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;

  if p_workspace_id is null
     or nullif(trim(p_proposal_ref), '') is null
     or nullif(trim(p_proposal_version_ref), '') is null
     or p_proposal_version_fingerprint is null
     or lower(p_proposal_version_fingerprint) !~ '^[a-f0-9]{64}$'
     or nullif(trim(p_target_node_ref), '') is null
     or nullif(trim(p_base_curriculum_version_ref), '') is null
     or position(chr(31) in p_proposal_ref) > 0
     or position(chr(31) in p_proposal_version_ref) > 0
     or position(chr(31) in p_target_node_ref) > 0
     or position(chr(31) in p_base_curriculum_version_ref) > 0
     or p_outcome not in ('approve', 'approve-with-changes', 'reject', 'defer', 'return-for-revision')
     or nullif(trim(p_rationale), '') is null
     or char_length(trim(p_rationale)) > 4000
     or p_client_request_id is null then
    raise exception 'INVALID_INSTITUTIONAL_DECISION_V2_INPUT' using errcode = '22023';
  end if;

  select membership.role into v_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id
    and membership.user_id = v_user_id
    and membership.status = 'active'
    and workspace.status = 'active';

  if v_role is distinct from 'collegio' then
    raise exception 'REVISION_DECIDE_REQUIRED' using errcode = '42501';
  end if;

  v_binding_material :=
    'CML_ARENA_ADOPTION_BINDING_V2' || chr(31)
    || p_workspace_id::text || chr(31)
    || trim(p_proposal_ref) || chr(31)
    || trim(p_proposal_version_ref) || chr(31)
    || lower(p_proposal_version_fingerprint) || chr(31)
    || trim(p_target_node_ref) || chr(31)
    || trim(p_base_curriculum_version_ref);
  v_binding_fingerprint := encode(digest(convert_to(v_binding_material, 'UTF8'), 'sha256'), 'hex');

  select * into v_existing
  from public.institutional_revision_decisions decision
  where decision.workspace_id = p_workspace_id
    and decision.client_request_id = p_client_request_id;

  if found then
    if v_existing.decided_by <> v_user_id
       or v_existing.proposal_ref <> trim(p_proposal_ref)
       or v_existing.proposal_version_ref <> trim(p_proposal_version_ref)
       or v_existing.proposal_version_fingerprint <> lower(p_proposal_version_fingerprint)
       or v_existing.adoption_binding_version is distinct from 2
       or v_existing.adoption_target_node_ref is distinct from trim(p_target_node_ref)
       or v_existing.adoption_base_curriculum_version_ref is distinct from trim(p_base_curriculum_version_ref)
       or v_existing.adoption_binding_fingerprint is distinct from v_binding_fingerprint
       or v_existing.outcome <> p_outcome
       or v_existing.rationale <> trim(p_rationale) then
      raise exception 'CLIENT_REQUEST_ID_REUSE_MISMATCH' using errcode = '23505';
    end if;
    return next v_existing;
    return;
  end if;

  insert into public.institutional_revision_decisions (
    workspace_id, proposal_ref, proposal_version_ref, proposal_version_fingerprint,
    adoption_binding_version, adoption_target_node_ref,
    adoption_base_curriculum_version_ref, adoption_binding_fingerprint,
    outcome, rationale, decided_by, authority_role, client_request_id
  ) values (
    p_workspace_id, trim(p_proposal_ref), trim(p_proposal_version_ref), lower(p_proposal_version_fingerprint),
    2, trim(p_target_node_ref), trim(p_base_curriculum_version_ref), v_binding_fingerprint,
    p_outcome, trim(p_rationale), v_user_id, 'collegio', p_client_request_id
  ) returning * into v_existing;

  return next v_existing;
end;
$$;

revoke all on function public.record_institutional_revision_decision_v2(uuid, text, text, text, text, text, text, text, uuid) from public;
grant execute on function public.record_institutional_revision_decision_v2(uuid, text, text, text, text, text, text, text, uuid) to authenticated;

comment on function public.record_institutional_revision_decision_v2(uuid, text, text, text, text, text, text, text, uuid) is
  'R7A2 server-authoritative decision boundary. Computes SHA-256 adoption binding v2 over workspace, proposal/version, proposal fingerprint, target node and base curriculum version.';
