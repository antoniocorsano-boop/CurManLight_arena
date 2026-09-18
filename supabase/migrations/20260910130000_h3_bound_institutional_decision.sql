-- CurManLight Arena — H4 institutional decision bound to the real H3 handoff.
--
-- H4 is an append-only institutional decision. It can consume only a current
-- READY_FOR_INSTITUTIONAL_REVIEW handoff produced from H3 and only a real,
-- authenticated Collegio membership can record it. H4 itself never adopts,
-- changes curriculum vigency, or promotes the canonical master.

create extension if not exists pgcrypto;

alter table public.institutional_revision_decisions
  add column if not exists decision_basis text not null default 'LEGACY_PROPOSAL',
  add column if not exists vertical_review_handoff_id uuid references public.vertical_review_institutional_handoffs(id) on delete restrict,
  add column if not exists vertical_review_outcome_id uuid references public.vertical_review_outcomes(id) on delete restrict,
  add column if not exists vertical_review_master_id text,
  add column if not exists vertical_review_master_drive_file_id text,
  add column if not exists vertical_review_master_version text,
  add column if not exists vertical_review_discipline text,
  add column if not exists vertical_review_unit_keys text[],
  add column if not exists vertical_review_source_team_outcome_ids uuid[],
  add column if not exists vertical_review_binding_version smallint,
  add column if not exists vertical_review_binding_fingerprint text;

-- Legacy B3/R7A rows stay readable. H3-bound H4 receipts do not invent fake
-- proposal identifiers, so the three legacy proposal columns become nullable.
alter table public.institutional_revision_decisions
  alter column proposal_ref drop not null,
  alter column proposal_version_ref drop not null,
  alter column proposal_version_fingerprint drop not null;

alter table public.institutional_revision_decisions
  drop constraint if exists institutional_revision_decisions_decision_basis_check;
alter table public.institutional_revision_decisions
  add constraint institutional_revision_decisions_decision_basis_check check (
    (
      decision_basis = 'LEGACY_PROPOSAL'
      and proposal_ref is not null
      and proposal_version_ref is not null
      and proposal_version_fingerprint is not null
      and vertical_review_handoff_id is null
      and vertical_review_outcome_id is null
      and vertical_review_master_id is null
      and vertical_review_master_drive_file_id is null
      and vertical_review_master_version is null
      and vertical_review_discipline is null
      and vertical_review_unit_keys is null
      and vertical_review_source_team_outcome_ids is null
      and vertical_review_binding_version is null
      and vertical_review_binding_fingerprint is null
    )
    or
    (
      decision_basis = 'VERTICAL_REVIEW_HANDOFF'
      and proposal_ref is null
      and proposal_version_ref is null
      and proposal_version_fingerprint is null
      and vertical_review_handoff_id is not null
      and vertical_review_outcome_id is not null
      and vertical_review_master_id = 'CAN-CURR-MASTER-00'
      and nullif(trim(vertical_review_master_drive_file_id), '') is not null
      and nullif(trim(vertical_review_master_version), '') is not null
      and nullif(trim(vertical_review_discipline), '') is not null
      and cardinality(vertical_review_unit_keys) = 2
      and vertical_review_unit_keys[1] <> vertical_review_unit_keys[2]
      and cardinality(vertical_review_source_team_outcome_ids) = 2
      and vertical_review_source_team_outcome_ids[1] <> vertical_review_source_team_outcome_ids[2]
      and vertical_review_binding_version = 1
      and vertical_review_binding_fingerprint ~ '^[a-f0-9]{64}$'
    )
  );

create index if not exists institutional_revision_decisions_vertical_handoff_idx
  on public.institutional_revision_decisions(workspace_id, vertical_review_handoff_id, decided_at desc)
  where decision_basis = 'VERTICAL_REVIEW_HANDOFF';
create index if not exists institutional_revision_decisions_vertical_outcome_idx
  on public.institutional_revision_decisions(vertical_review_outcome_id)
  where vertical_review_outcome_id is not null;
create index if not exists institutional_revision_decisions_decided_by_idx
  on public.institutional_revision_decisions(decided_by);

-- Keep read access scoped to active members and evaluate auth.uid() once per
-- statement. Direct decision mutations remain closed to browser roles.
drop policy if exists "institutional_revision_decisions_select_active_member"
  on public.institutional_revision_decisions;
create policy "institutional_revision_decisions_select_active_member"
  on public.institutional_revision_decisions
  for select to authenticated
  using (exists (
    select 1
    from public.workspace_memberships membership
    join public.workspaces workspace on workspace.id = membership.workspace_id
    where membership.workspace_id = institutional_revision_decisions.workspace_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and workspace.status = 'active'
  ));

revoke insert, update, delete on table public.institutional_revision_decisions from public, anon, authenticated;
grant select on table public.institutional_revision_decisions to authenticated;

create or replace function public.record_h3_bound_institutional_decision_v1(
  p_workspace_id uuid,
  p_expected_context_user_id uuid,
  p_handoff_id uuid,
  p_outcome text,
  p_rationale text,
  p_client_request_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_role text;
  v_handoff public.vertical_review_institutional_handoffs%rowtype;
  v_h3 public.vertical_review_outcomes%rowtype;
  v_existing public.institutional_revision_decisions%rowtype;
  v_latest public.institutional_revision_decisions%rowtype;
  v_binding_material text;
  v_binding_fingerprint text;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;
  if p_expected_context_user_id is null or p_expected_context_user_id <> v_user then
    raise exception 'WORKSPACE_ACTOR_CONTEXT_PRINCIPAL_MISMATCH' using errcode = '42501';
  end if;
  if p_workspace_id is null
     or p_handoff_id is null
     or p_outcome not in ('approve','approve-with-changes','reject','defer','return-for-revision')
     or nullif(trim(p_rationale), '') is null
     or char_length(trim(p_rationale)) > 4000
     or p_client_request_id is null then
    raise exception 'INVALID_H3_BOUND_INSTITUTIONAL_DECISION_INPUT' using errcode = '22023';
  end if;

  select membership.role into v_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id
    and membership.user_id = v_user
    and membership.status = 'active'
    and workspace.status = 'active';

  if v_role is null then
    raise exception 'ACTIVE_WORKSPACE_MEMBERSHIP_REQUIRED' using errcode = '42501';
  end if;
  if v_role is distinct from 'collegio' then
    raise exception 'REVISION_DECIDE_REQUIRED' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    p_workspace_id::text || ':H4-HANDOFF:' || p_handoff_id::text, 0
  ));

  -- Exact retries are idempotent before sequence checks.
  select * into v_existing
  from public.institutional_revision_decisions decision
  where decision.workspace_id = p_workspace_id
    and decision.client_request_id = p_client_request_id;
  if found then
    if v_existing.decided_by <> v_user
       or v_existing.decision_basis <> 'VERTICAL_REVIEW_HANDOFF'
       or v_existing.vertical_review_handoff_id <> p_handoff_id
       or v_existing.outcome <> p_outcome
       or v_existing.rationale <> trim(p_rationale) then
      raise exception 'CLIENT_REQUEST_ID_REUSE_MISMATCH' using errcode = '23505';
    end if;
    return to_jsonb(v_existing);
  end if;

  select * into v_handoff
  from public.vertical_review_institutional_handoffs handoff
  where handoff.workspace_id = p_workspace_id
    and handoff.id = p_handoff_id
  for share;
  if not found then
    raise exception 'INSTITUTIONAL_REVIEW_HANDOFF_REQUIRED' using errcode = '23514';
  end if;
  if v_handoff.handoff_state <> 'READY_FOR_INSTITUTIONAL_REVIEW'
     or v_handoff.required_authority_role <> 'collegio' then
    raise exception 'INSTITUTIONAL_REVIEW_HANDOFF_NOT_READY' using errcode = '23514';
  end if;
  if v_handoff.institutional_decision_created
     or v_handoff.adoption_receipt_created
     or v_handoff.curriculum_in_force_changed
     or v_handoff.automatic_master_promotion then
    raise exception 'INSTITUTIONAL_REVIEW_HANDOFF_AUTHORITY_BOUNDARY_VIOLATED' using errcode = '23514';
  end if;

  select * into v_h3
  from public.vertical_review_outcomes outcome
  where outcome.workspace_id = p_workspace_id
    and outcome.id = v_handoff.vertical_review_outcome_id
  for share;
  if not found then
    raise exception 'H3_RECEIPT_REQUIRED' using errcode = '23514';
  end if;
  if v_h3.outcome = 'DEFERRED'
     or v_h3.master_id <> v_handoff.master_id
     or v_h3.master_drive_file_id <> v_handoff.master_drive_file_id
     or v_h3.master_version <> v_handoff.master_version
     or v_h3.source_team_outcome_ids <> v_handoff.source_team_outcome_ids
     or v_h3.reviewed_unit_keys <> v_handoff.reviewed_unit_keys
     or v_h3.outcome <> v_handoff.vertical_outcome
     or v_h3.findings <> v_handoff.findings
     or v_h3.rationale <> v_handoff.vertical_rationale then
    raise exception 'H3_HANDOFF_SNAPSHOT_MISMATCH' using errcode = '23514';
  end if;
  if v_h3.institutional_decision_created
     or v_h3.adoption_receipt_created
     or v_h3.curriculum_in_force_changed
     or v_h3.automatic_master_promotion then
    raise exception 'H3_AUTHORITY_BOUNDARY_VIOLATED' using errcode = '23514';
  end if;

  -- Every H2 source captured by H3 must still be current.
  if exists (
    select 1
    from public.team_review_outcomes selected_outcome
    join public.team_review_outcomes newer_outcome
      on newer_outcome.workspace_id = selected_outcome.workspace_id
      and newer_outcome.review_case_id = selected_outcome.review_case_id
      and newer_outcome.proposal_ref = selected_outcome.proposal_ref
      and (
        newer_outcome.recorded_at > selected_outcome.recorded_at
        or (newer_outcome.recorded_at = selected_outcome.recorded_at and newer_outcome.id > selected_outcome.id)
      )
    where selected_outcome.workspace_id = p_workspace_id
      and selected_outcome.id = any(v_handoff.source_team_outcome_ids)
  ) then
    raise exception 'H4_STALE_H2_SOURCE' using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.team_review_outcomes selected_outcome
    join public.team_review_deferred_continuations continuation
      on continuation.workspace_id = selected_outcome.workspace_id
      and continuation.review_case_id = selected_outcome.review_case_id
      and continuation.proposal_ref = selected_outcome.proposal_ref
      and continuation.completed_by_outcome_id is null
    where selected_outcome.workspace_id = p_workspace_id
      and selected_outcome.id = any(v_handoff.source_team_outcome_ids)
  ) then
    raise exception 'H4_H2_CONTINUATION_OPEN' using errcode = '23514';
  end if;

  -- The H3 receipt itself must still be the current review of this pair.
  if exists (
    select 1
    from public.vertical_review_outcomes newer
    where newer.workspace_id = v_h3.workspace_id
      and newer.master_id = v_h3.master_id
      and newer.master_drive_file_id = v_h3.master_drive_file_id
      and newer.master_version = v_h3.master_version
      and newer.id <> v_h3.id
      and newer.reviewed_unit_keys @> v_h3.reviewed_unit_keys
      and v_h3.reviewed_unit_keys @> newer.reviewed_unit_keys
      and (
        newer.recorded_at > v_h3.recorded_at
        or (newer.recorded_at = v_h3.recorded_at and newer.id > v_h3.id)
      )
  ) then
    raise exception 'H4_STALE_H3' using errcode = '23514';
  end if;

  select * into v_latest
  from public.institutional_revision_decisions decision
  where decision.workspace_id = p_workspace_id
    and decision.decision_basis = 'VERTICAL_REVIEW_HANDOFF'
    and decision.vertical_review_handoff_id = p_handoff_id
  order by decision.decided_at desc, decision.id desc
  limit 1;
  if found and v_latest.outcome in ('approve','approve-with-changes','reject') then
    raise exception 'INSTITUTIONAL_DECISION_ALREADY_FINAL' using errcode = '23505';
  end if;

  v_binding_material := 'CML_ARENA_H3_H4_BINDING_V1' || chr(31)
    || p_workspace_id::text || chr(31)
    || v_handoff.id::text || chr(31)
    || v_handoff.vertical_review_outcome_id::text || chr(31)
    || v_handoff.master_id || chr(31)
    || v_handoff.master_drive_file_id || chr(31)
    || v_handoff.master_version || chr(31)
    || v_handoff.discipline || chr(31)
    || array_to_string(v_handoff.reviewed_unit_keys, chr(30)) || chr(31)
    || array_to_string(v_handoff.source_team_outcome_ids, chr(30));
  v_binding_fingerprint := encode(digest(convert_to(v_binding_material, 'UTF8'), 'sha256'), 'hex');

  insert into public.institutional_revision_decisions(
    workspace_id,
    proposal_ref,
    proposal_version_ref,
    proposal_version_fingerprint,
    decision_basis,
    vertical_review_handoff_id,
    vertical_review_outcome_id,
    vertical_review_master_id,
    vertical_review_master_drive_file_id,
    vertical_review_master_version,
    vertical_review_discipline,
    vertical_review_unit_keys,
    vertical_review_source_team_outcome_ids,
    vertical_review_binding_version,
    vertical_review_binding_fingerprint,
    outcome,
    rationale,
    decided_by,
    authority_role,
    client_request_id
  ) values (
    p_workspace_id,
    null,
    null,
    null,
    'VERTICAL_REVIEW_HANDOFF',
    v_handoff.id,
    v_handoff.vertical_review_outcome_id,
    v_handoff.master_id,
    v_handoff.master_drive_file_id,
    v_handoff.master_version,
    v_handoff.discipline,
    v_handoff.reviewed_unit_keys,
    v_handoff.source_team_outcome_ids,
    1,
    v_binding_fingerprint,
    p_outcome,
    trim(p_rationale),
    v_user,
    'collegio',
    p_client_request_id
  ) returning * into v_existing;

  return to_jsonb(v_existing);
end;
$$;

revoke all on function public.record_h3_bound_institutional_decision_v1(uuid,uuid,uuid,text,text,uuid)
  from public, anon, authenticated;
grant execute on function public.record_h3_bound_institutional_decision_v1(uuid,uuid,uuid,text,text,uuid)
  to authenticated;

-- Proposal-only institutional decision RPCs may still exist for historical
-- deployments, but authenticated clients must not use them to bypass H3.
do $$
declare
  v_signature text;
begin
  for v_signature in
    select p.oid::regprocedure::text
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'record_institutional_revision_decision',
        'record_institutional_revision_decision_v2',
        'record_institutional_revision_decision_v3',
        'record_institutional_revision_decision_v4'
      )
  loop
    execute format('revoke execute on function %s from authenticated', v_signature);
  end loop;
end;
$$;

comment on function public.record_h3_bound_institutional_decision_v1(uuid,uuid,uuid,text,text,uuid) is
  'H4 REVISION_DECIDE boundary bound to one current H3 institutional handoff. Requires a real authenticated Collegio membership, rejects stale H2/H3 evidence, and appends a decision receipt without adoption, vigency, or master promotion.';

comment on column public.institutional_revision_decisions.decision_basis is
  'LEGACY_PROPOSAL preserves historical decision receipts; VERTICAL_REVIEW_HANDOFF is the governed H4 path that consumes H3.';
