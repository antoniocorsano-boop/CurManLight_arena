-- CurManLight Arena R7A3 — shared frozen proposal snapshot
-- R7A3 decisions are distinguishable from historical/deployed R7A2 v2 decisions:
-- old v2 clients remain writable during rollout, while only the new v3 RPC marks
-- a decision as backed by a server-owned frozen proposal snapshot.

create extension if not exists pgcrypto;

create table if not exists public.institutional_revision_proposal_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  proposal_ref text not null,
  proposal_version_ref text not null,
  proposal_version_fingerprint text not null check (proposal_version_fingerprint ~ '^[a-f0-9]{64}$'),
  snapshot_payload text not null,
  snapshot_json jsonb not null,
  frozen_by uuid not null,
  frozen_at timestamptz not null default now(),
  unique (workspace_id, proposal_version_ref),
  check (jsonb_typeof(snapshot_json) = 'object')
);

alter table public.institutional_revision_decisions
  add column if not exists proposal_snapshot_version smallint;
alter table public.institutional_revision_decisions
  drop constraint if exists institutional_revision_decisions_proposal_snapshot_version_check;
alter table public.institutional_revision_decisions
  add constraint institutional_revision_decisions_proposal_snapshot_version_check
  check (proposal_snapshot_version is null or proposal_snapshot_version = 1);

alter table public.institutional_revision_proposal_snapshots enable row level security;
revoke insert, update, delete on public.institutional_revision_proposal_snapshots from authenticated;
grant select on public.institutional_revision_proposal_snapshots to authenticated;

drop policy if exists institutional_revision_proposal_snapshots_read on public.institutional_revision_proposal_snapshots;
create policy institutional_revision_proposal_snapshots_read
on public.institutional_revision_proposal_snapshots for select to authenticated
using (exists (
  select 1
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = institutional_revision_proposal_snapshots.workspace_id
    and membership.user_id = auth.uid()
    and membership.status = 'active'
    and workspace.status = 'active'
));

create or replace function public.freeze_institutional_revision_proposal_snapshot_v1(
  p_workspace_id uuid,
  p_proposal_ref text,
  p_proposal_version_ref text,
  p_expected_fingerprint text,
  p_snapshot_payload text
)
returns setof public.institutional_revision_proposal_snapshots
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_json jsonb;
  v_fingerprint text;
  v_existing public.institutional_revision_proposal_snapshots%rowtype;
  v_allowed_keys text[] := array[
    'id','proposalRef','versionNumber','currentTextSnapshot','proposedText','rationale',
    'sourceRefs','evidenceRefs','createdAt','structuralFootprint','previousVersionRef','changeNote','frozen'
  ];
  v_required_keys text[] := array[
    'id','proposalRef','versionNumber','currentTextSnapshot','proposedText','rationale',
    'sourceRefs','evidenceRefs','createdAt','structuralFootprint','frozen'
  ];
  v_valid_entity_types text[] := array[
    'institute','source','curriculum-version','curriculum-segment','curriculum-node','curriculum-link',
    'revision-proposal','decision','teaching-design','document','document-version','template',
    'class-context','assessment','actor','event'
  ];
  v_ref jsonb;
begin
  if v_user_id is null then raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501'; end if;
  if p_workspace_id is null
     or nullif(trim(p_proposal_ref), '') is null
     or nullif(trim(p_proposal_version_ref), '') is null
     or lower(coalesce(p_expected_fingerprint, '')) !~ '^[a-f0-9]{64}$'
     or nullif(p_snapshot_payload, '') is null then
    raise exception 'INVALID_FROZEN_PROPOSAL_SNAPSHOT_INPUT' using errcode = '22023';
  end if;

  select membership.role into v_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id
    and membership.user_id = v_user_id
    and membership.status = 'active'
    and workspace.status = 'active';
  if v_role is distinct from 'collegio' then raise exception 'REVISION_DECIDE_REQUIRED' using errcode = '42501'; end if;

  begin
    v_json := p_snapshot_payload::jsonb;
  exception when others then
    raise exception 'INVALID_FROZEN_PROPOSAL_SNAPSHOT_JSON' using errcode = '22023';
  end;

  if jsonb_typeof(v_json) <> 'object'
     or not (v_json ?& v_required_keys)
     or exists (
       select 1 from jsonb_object_keys(v_json) as snapshot_keys(key_name)
       where not (snapshot_keys.key_name = any(v_allowed_keys))
     )
     or v_json->>'id' is distinct from trim(p_proposal_version_ref)
     or v_json->>'proposalRef' is distinct from trim(p_proposal_ref)
     or jsonb_typeof(v_json->'versionNumber') <> 'number'
     or (v_json->>'versionNumber') !~ '^[1-9][0-9]*$'
     or jsonb_typeof(v_json->'currentTextSnapshot') <> 'string'
     or jsonb_typeof(v_json->'proposedText') <> 'string'
     or nullif(trim(v_json->>'proposedText'), '') is null
     or jsonb_typeof(v_json->'rationale') <> 'string'
     or jsonb_typeof(v_json->'sourceRefs') <> 'array'
     or jsonb_typeof(v_json->'evidenceRefs') <> 'array'
     or jsonb_typeof(v_json->'createdAt') <> 'string'
     or nullif(trim(v_json->>'createdAt'), '') is null
     or jsonb_typeof(v_json->'structuralFootprint') <> 'string'
     or (v_json ? 'previousVersionRef' and (jsonb_typeof(v_json->'previousVersionRef') <> 'string' or nullif(trim(v_json->>'previousVersionRef'), '') is null))
     or (v_json ? 'changeNote' and (jsonb_typeof(v_json->'changeNote') <> 'string' or nullif(trim(v_json->>'changeNote'), '') is null))
     or v_json->'frozen' is distinct from 'true'::jsonb then
    raise exception 'FROZEN_PROPOSAL_SNAPSHOT_CANONICAL_SHAPE_REQUIRED' using errcode = '23514';
  end if;

  begin
    perform (v_json->>'createdAt')::timestamptz;
  exception when others then
    raise exception 'FROZEN_PROPOSAL_SNAPSHOT_CANONICAL_SHAPE_REQUIRED' using errcode = '23514';
  end;

  for v_ref in select value from jsonb_array_elements(v_json->'sourceRefs') loop
    if jsonb_typeof(v_ref) <> 'object'
       or not (v_ref ?& array['id','entityType'])
       or exists (
         select 1 from jsonb_object_keys(v_ref) as ref_keys(key_name)
         where not (ref_keys.key_name = any(array['id','entityType','snapshotLabel']))
       )
       or jsonb_typeof(v_ref->'id') <> 'string' or nullif(trim(v_ref->>'id'), '') is null
       or jsonb_typeof(v_ref->'entityType') <> 'string' or nullif(trim(v_ref->>'entityType'), '') is null
       or not (v_ref->>'entityType' = any(v_valid_entity_types))
       or (v_ref ? 'snapshotLabel' and (jsonb_typeof(v_ref->'snapshotLabel') <> 'string' or nullif(trim(v_ref->>'snapshotLabel'), '') is null)) then
      raise exception 'FROZEN_PROPOSAL_SNAPSHOT_CANONICAL_SHAPE_REQUIRED' using errcode = '23514';
    end if;
  end loop;

  for v_ref in select value from jsonb_array_elements(v_json->'evidenceRefs') loop
    if jsonb_typeof(v_ref) <> 'object'
       or not (v_ref ?& array['id','entityType'])
       or exists (
         select 1 from jsonb_object_keys(v_ref) as ref_keys(key_name)
         where not (ref_keys.key_name = any(array['id','entityType','snapshotLabel']))
       )
       or jsonb_typeof(v_ref->'id') <> 'string' or nullif(trim(v_ref->>'id'), '') is null
       or jsonb_typeof(v_ref->'entityType') <> 'string' or nullif(trim(v_ref->>'entityType'), '') is null
       or not (v_ref->>'entityType' = any(v_valid_entity_types))
       or (v_ref ? 'snapshotLabel' and (jsonb_typeof(v_ref->'snapshotLabel') <> 'string' or nullif(trim(v_ref->>'snapshotLabel'), '') is null)) then
      raise exception 'FROZEN_PROPOSAL_SNAPSHOT_CANONICAL_SHAPE_REQUIRED' using errcode = '23514';
    end if;
  end loop;

  v_fingerprint := encode(digest(convert_to(p_snapshot_payload, 'UTF8'), 'sha256'), 'hex');
  if v_fingerprint <> lower(p_expected_fingerprint) then
    raise exception 'FROZEN_PROPOSAL_SNAPSHOT_FINGERPRINT_MISMATCH' using errcode = '23514';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_workspace_id::text || ':' || trim(p_proposal_version_ref), 0));
  select * into v_existing from public.institutional_revision_proposal_snapshots snapshot
  where snapshot.workspace_id = p_workspace_id and snapshot.proposal_version_ref = trim(p_proposal_version_ref);
  if found then
    if v_existing.proposal_ref <> trim(p_proposal_ref)
       or v_existing.proposal_version_fingerprint <> v_fingerprint
       or v_existing.snapshot_payload <> p_snapshot_payload
       or v_existing.snapshot_json <> v_json then
      raise exception 'FROZEN_PROPOSAL_SNAPSHOT_IMMUTABILITY_VIOLATION' using errcode = '23514';
    end if;
    return next v_existing; return;
  end if;

  insert into public.institutional_revision_proposal_snapshots (
    workspace_id, proposal_ref, proposal_version_ref, proposal_version_fingerprint,
    snapshot_payload, snapshot_json, frozen_by
  ) values (
    p_workspace_id, trim(p_proposal_ref), trim(p_proposal_version_ref), v_fingerprint,
    p_snapshot_payload, v_json, v_user_id
  ) returning * into v_existing;
  return next v_existing;
end;
$$;

revoke all on function public.freeze_institutional_revision_proposal_snapshot_v1(uuid, text, text, text, text) from public;
grant execute on function public.freeze_institutional_revision_proposal_snapshot_v1(uuid, text, text, text, text) to authenticated;

create or replace function public.record_institutional_revision_decision_v3(
  p_workspace_id uuid, p_proposal_ref text, p_proposal_version_ref text,
  p_proposal_version_fingerprint text, p_target_node_ref text,
  p_base_curriculum_version_ref text, p_outcome text, p_rationale text,
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
  v_latest public.institutional_revision_decisions%rowtype;
  v_binding_material text;
  v_binding_fingerprint text;
begin
  if v_user_id is null then raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501'; end if;
  if p_workspace_id is null
     or nullif(trim(p_proposal_ref), '') is null
     or nullif(trim(p_proposal_version_ref), '') is null
     or lower(coalesce(p_proposal_version_fingerprint, '')) !~ '^[a-f0-9]{64}$'
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
    raise exception 'INVALID_INSTITUTIONAL_DECISION_V3_INPUT' using errcode = '22023';
  end if;

  select membership.role into v_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id
    and membership.user_id = v_user_id
    and membership.status = 'active'
    and workspace.status = 'active';
  if v_role is distinct from 'collegio' then raise exception 'REVISION_DECIDE_REQUIRED' using errcode = '42501'; end if;

  if not exists (
    select 1 from public.institutional_revision_proposal_snapshots snapshot
    where snapshot.workspace_id = p_workspace_id
      and snapshot.proposal_ref = trim(p_proposal_ref)
      and snapshot.proposal_version_ref = trim(p_proposal_version_ref)
      and snapshot.proposal_version_fingerprint = lower(p_proposal_version_fingerprint)
  ) then raise exception 'FROZEN_PROPOSAL_SNAPSHOT_REQUIRED' using errcode = '23514'; end if;

  v_binding_material := 'CML_ARENA_ADOPTION_BINDING_V2' || chr(31)
    || p_workspace_id::text || chr(31) || trim(p_proposal_ref) || chr(31)
    || trim(p_proposal_version_ref) || chr(31) || lower(p_proposal_version_fingerprint) || chr(31)
    || trim(p_target_node_ref) || chr(31) || trim(p_base_curriculum_version_ref);
  v_binding_fingerprint := encode(digest(convert_to(v_binding_material, 'UTF8'), 'sha256'), 'hex');

  select * into v_existing from public.institutional_revision_decisions decision
  where decision.workspace_id = p_workspace_id and decision.client_request_id = p_client_request_id;
  if found then
    if v_existing.decided_by <> v_user_id
       or v_existing.proposal_ref <> trim(p_proposal_ref)
       or v_existing.proposal_version_ref <> trim(p_proposal_version_ref)
       or v_existing.proposal_version_fingerprint <> lower(p_proposal_version_fingerprint)
       or v_existing.proposal_snapshot_version is distinct from 1
       or v_existing.adoption_binding_version is distinct from 2
       or v_existing.adoption_target_node_ref is distinct from trim(p_target_node_ref)
       or v_existing.adoption_base_curriculum_version_ref is distinct from trim(p_base_curriculum_version_ref)
       or v_existing.adoption_binding_fingerprint is distinct from v_binding_fingerprint
       or v_existing.outcome <> p_outcome
       or v_existing.rationale <> trim(p_rationale) then
      raise exception 'CLIENT_REQUEST_ID_REUSE_MISMATCH' using errcode = '23505';
    end if;
    return next v_existing; return;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_workspace_id::text || ':' || trim(p_proposal_version_ref), 0));
  select * into v_latest from public.institutional_revision_decisions decision
  where decision.workspace_id = p_workspace_id and decision.proposal_version_ref = trim(p_proposal_version_ref)
  order by decision.decided_at desc, decision.id desc limit 1;
  if found then
    if v_latest.proposal_ref <> trim(p_proposal_ref) then raise exception 'PROPOSAL_VERSION_REFERENCE_MISMATCH' using errcode = '23514'; end if;
    if v_latest.proposal_version_fingerprint <> lower(p_proposal_version_fingerprint) then raise exception 'PROPOSAL_VERSION_FINGERPRINT_MISMATCH' using errcode = '23514'; end if;
    if v_latest.adoption_binding_version = 2 and (
      v_latest.adoption_target_node_ref is distinct from trim(p_target_node_ref)
      or v_latest.adoption_base_curriculum_version_ref is distinct from trim(p_base_curriculum_version_ref)
      or v_latest.adoption_binding_fingerprint is distinct from v_binding_fingerprint
    ) then raise exception 'ADOPTION_BINDING_MISMATCH' using errcode = '23514'; end if;
    if v_latest.outcome in ('approve', 'approve-with-changes', 'reject') then raise exception 'INSTITUTIONAL_DECISION_ALREADY_FINAL' using errcode = '23505'; end if;
  end if;

  insert into public.institutional_revision_decisions (
    workspace_id, proposal_ref, proposal_version_ref, proposal_version_fingerprint,
    proposal_snapshot_version, adoption_binding_version, adoption_target_node_ref,
    adoption_base_curriculum_version_ref, adoption_binding_fingerprint,
    outcome, rationale, decided_by, authority_role, client_request_id
  ) values (
    p_workspace_id, trim(p_proposal_ref), trim(p_proposal_version_ref), lower(p_proposal_version_fingerprint),
    1, 2, trim(p_target_node_ref), trim(p_base_curriculum_version_ref), v_binding_fingerprint,
    p_outcome, trim(p_rationale), v_user_id, 'collegio', p_client_request_id
  ) returning * into v_existing;
  return next v_existing;
end;
$$;

revoke all on function public.record_institutional_revision_decision_v3(uuid, text, text, text, text, text, text, text, uuid) from public;
grant execute on function public.record_institutional_revision_decision_v3(uuid, text, text, text, text, text, text, text, uuid) to authenticated;

comment on column public.institutional_revision_decisions.proposal_snapshot_version is
  'NULL for historical/R7A2-compatible decisions; 1 only for R7A3 decisions recorded after server snapshot verification.';
comment on function public.record_institutional_revision_decision_v3(uuid, text, text, text, text, text, text, text, uuid) is
  'R7A3 decision boundary. Requires a matching complete canonical frozen server snapshot and marks the receipt proposal_snapshot_version=1. R7A2 v2 RPC remains available for rollout compatibility but does not set this marker.';
comment on table public.institutional_revision_proposal_snapshots is
  'R7A3 immutable server-owned proposal-version snapshots. Direct writes are forbidden; the complete canonical fingerprint payload shape is validated and SHA-256 is recomputed server-side from its exact bytes. This is not yet an independent shared proposal authority.';
