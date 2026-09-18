-- CurManLight Arena Beta — governed H4 -> canonical adoption handoff.
--
-- This slice deliberately does NOT adopt, activate, publish, or promote any
-- curriculum. It creates one immutable receipt that binds an approved H4
-- decision to the later adoption phase. Canonical adoption remains a separate
-- human action and a separate authority boundary.

create extension if not exists pgcrypto;

create table if not exists public.h4_canonical_adoption_handoffs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  institutional_decision_id uuid not null references public.institutional_revision_decisions(id) on delete restrict,
  vertical_review_handoff_id uuid not null references public.vertical_review_institutional_handoffs(id) on delete restrict,
  vertical_review_outcome_id uuid not null references public.vertical_review_outcomes(id) on delete restrict,
  master_id text not null,
  master_drive_file_id text not null,
  master_version text not null,
  discipline text not null,
  reviewed_unit_keys text[] not null,
  source_team_outcome_ids uuid[] not null,
  h4_binding_version smallint not null check (h4_binding_version = 1),
  h4_binding_fingerprint text not null check (h4_binding_fingerprint ~ '^[a-f0-9]{64}$'),
  h4_outcome text not null check (h4_outcome in ('approve','approve-with-changes')),
  h4_rationale text not null check (char_length(trim(h4_rationale)) between 1 and 4000),
  h4_authority_context text not null check (h4_authority_context in ('INSTITUTIONAL','DEVELOPMENT_PILOT')),
  h4_authority_assignment_id uuid references public.development_pilot_authority_assignments(id) on delete restrict,
  handoff_binding_version smallint not null default 1 check (handoff_binding_version = 1),
  handoff_binding_fingerprint text not null check (handoff_binding_fingerprint ~ '^[a-f0-9]{64}$'),
  adoption_state text not null default 'READY_FOR_ADOPTION_REVIEW' check (adoption_state = 'READY_FOR_ADOPTION_REVIEW'),
  required_adoption_role text not null default 'dirigente' check (required_adoption_role = 'dirigente'),
  prepared_by_user_id uuid not null references auth.users(id) on delete restrict,
  prepared_by_role text not null check (prepared_by_role in ('collegio','dirigente')),
  prepared_at timestamptz not null default now(),
  client_request_id uuid not null,
  adoption_receipt_created boolean not null default false check (adoption_receipt_created = false),
  curriculum_in_force_changed boolean not null default false check (curriculum_in_force_changed = false),
  automatic_master_promotion boolean not null default false check (automatic_master_promotion = false),
  unique (workspace_id, institutional_decision_id),
  unique (workspace_id, client_request_id),
  constraint h4_canonical_adoption_handoff_authority_context_check check (
    (h4_authority_context = 'INSTITUTIONAL' and h4_authority_assignment_id is null)
    or (h4_authority_context = 'DEVELOPMENT_PILOT' and h4_authority_assignment_id is not null)
  ),
  check (cardinality(reviewed_unit_keys) >= 1),
  check (cardinality(source_team_outcome_ids) >= 1),
  check (nullif(trim(master_id), '') is not null),
  check (nullif(trim(master_drive_file_id), '') is not null),
  check (nullif(trim(master_version), '') is not null),
  check (nullif(trim(discipline), '') is not null)
);

alter table public.h4_canonical_adoption_handoffs enable row level security;

create index if not exists h4_canonical_adoption_handoffs_h3_idx
  on public.h4_canonical_adoption_handoffs(vertical_review_outcome_id);
create index if not exists h4_canonical_adoption_handoffs_h3_handoff_idx
  on public.h4_canonical_adoption_handoffs(vertical_review_handoff_id);
create index if not exists h4_canonical_adoption_handoffs_prepared_by_idx
  on public.h4_canonical_adoption_handoffs(prepared_by_user_id);
create index if not exists h4_canonical_adoption_handoffs_authority_assignment_idx
  on public.h4_canonical_adoption_handoffs(h4_authority_assignment_id)
  where h4_authority_assignment_id is not null;

revoke insert, update, delete on table public.h4_canonical_adoption_handoffs from public, anon, authenticated;
grant select on table public.h4_canonical_adoption_handoffs to authenticated;

drop policy if exists "h4_canonical_adoption_handoffs_select_active_member"
  on public.h4_canonical_adoption_handoffs;
create policy "h4_canonical_adoption_handoffs_select_active_member"
  on public.h4_canonical_adoption_handoffs
  for select to authenticated
  using (exists (
    select 1
    from public.workspace_memberships membership
    join public.workspaces workspace on workspace.id = membership.workspace_id
    where membership.workspace_id = h4_canonical_adoption_handoffs.workspace_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and workspace.status = 'active'
  ));

create or replace function public.reject_h4_canonical_adoption_handoff_mutation_v1()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'H4_ADOPTION_HANDOFF_IMMUTABLE' using errcode = '55000';
end;
$$;

revoke all on function public.reject_h4_canonical_adoption_handoff_mutation_v1()
  from public, anon, authenticated;

drop trigger if exists h4_canonical_adoption_handoffs_immutable
  on public.h4_canonical_adoption_handoffs;
create trigger h4_canonical_adoption_handoffs_immutable
  before update or delete on public.h4_canonical_adoption_handoffs
  for each row execute function public.reject_h4_canonical_adoption_handoff_mutation_v1();

create or replace function public.prepare_h4_canonical_adoption_handoff_v1(
  p_workspace_id uuid,
  p_expected_context_user_id uuid,
  p_institutional_decision_id uuid,
  p_client_request_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_role text;
  v_decision public.institutional_revision_decisions%rowtype;
  v_h3_handoff public.vertical_review_institutional_handoffs%rowtype;
  v_h3 public.vertical_review_outcomes%rowtype;
  v_existing public.h4_canonical_adoption_handoffs%rowtype;
  v_binding_material text;
  v_binding_fingerprint text;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;
  if p_expected_context_user_id is null or p_expected_context_user_id <> v_user then
    raise exception 'WORKSPACE_ACTOR_CONTEXT_PRINCIPAL_MISMATCH' using errcode = '42501';
  end if;
  if p_workspace_id is null or p_institutional_decision_id is null or p_client_request_id is null then
    raise exception 'INVALID_H4_ADOPTION_HANDOFF_INPUT' using errcode = '22023';
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
  if v_role not in ('collegio','dirigente') then
    raise exception 'ADOPTION_HANDOFF_PREPARE_REQUIRED' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    p_workspace_id::text || ':H4-ADOPTION-HANDOFF:' || p_institutional_decision_id::text, 0
  ));

  select * into v_existing
  from public.h4_canonical_adoption_handoffs handoff
  where handoff.workspace_id = p_workspace_id
    and handoff.client_request_id = p_client_request_id;
  if found then
    if v_existing.institutional_decision_id <> p_institutional_decision_id
       or v_existing.prepared_by_user_id <> v_user then
      raise exception 'CLIENT_REQUEST_ID_REUSE_MISMATCH' using errcode = '23505';
    end if;
    return to_jsonb(v_existing);
  end if;

  select * into v_decision
  from public.institutional_revision_decisions decision
  where decision.workspace_id = p_workspace_id
    and decision.id = p_institutional_decision_id
  for share;
  if not found then
    raise exception 'H4_DECISION_REQUIRED' using errcode = '23514';
  end if;
  if v_decision.decision_basis <> 'VERTICAL_REVIEW_HANDOFF'
     or v_decision.outcome not in ('approve','approve-with-changes')
     or v_decision.vertical_review_handoff_id is null
     or v_decision.vertical_review_outcome_id is null
     or v_decision.vertical_review_binding_version is distinct from 1
     or v_decision.vertical_review_binding_fingerprint is null
     or v_decision.vertical_review_binding_fingerprint !~ '^[a-f0-9]{64}$'
     or v_decision.vertical_review_master_id is null
     or v_decision.vertical_review_master_drive_file_id is null
     or v_decision.vertical_review_master_version is null
     or v_decision.vertical_review_discipline is null
     or v_decision.vertical_review_unit_keys is null
     or v_decision.vertical_review_source_team_outcome_ids is null then
    raise exception 'H4_DECISION_NOT_ADOPTION_ELIGIBLE' using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.institutional_revision_decisions newer
    where newer.workspace_id = p_workspace_id
      and newer.decision_basis = 'VERTICAL_REVIEW_HANDOFF'
      and newer.vertical_review_handoff_id = v_decision.vertical_review_handoff_id
      and newer.id <> v_decision.id
      and (
        newer.decided_at > v_decision.decided_at
        or (newer.decided_at = v_decision.decided_at and newer.id > v_decision.id)
      )
  ) then
    raise exception 'CURRENT_FINAL_H4_DECISION_REQUIRED' using errcode = '23514';
  end if;

  select * into v_h3_handoff
  from public.vertical_review_institutional_handoffs handoff
  where handoff.workspace_id = p_workspace_id
    and handoff.id = v_decision.vertical_review_handoff_id
  for share;
  if not found then
    raise exception 'H3_INSTITUTIONAL_HANDOFF_REQUIRED' using errcode = '23514';
  end if;
  if v_h3_handoff.vertical_review_outcome_id <> v_decision.vertical_review_outcome_id
     or v_h3_handoff.master_id <> v_decision.vertical_review_master_id
     or v_h3_handoff.master_drive_file_id <> v_decision.vertical_review_master_drive_file_id
     or v_h3_handoff.master_version <> v_decision.vertical_review_master_version
     or v_h3_handoff.discipline <> v_decision.vertical_review_discipline
     or v_h3_handoff.reviewed_unit_keys <> v_decision.vertical_review_unit_keys
     or v_h3_handoff.source_team_outcome_ids <> v_decision.vertical_review_source_team_outcome_ids then
    raise exception 'H4_ADOPTION_HANDOFF_SNAPSHOT_MISMATCH' using errcode = '23514';
  end if;
  if v_h3_handoff.adoption_receipt_created
     or v_h3_handoff.curriculum_in_force_changed
     or v_h3_handoff.automatic_master_promotion then
    raise exception 'H3_HANDOFF_ADOPTION_BOUNDARY_VIOLATED' using errcode = '23514';
  end if;

  select * into v_h3
  from public.vertical_review_outcomes outcome
  where outcome.workspace_id = p_workspace_id
    and outcome.id = v_decision.vertical_review_outcome_id
  for share;
  if not found then
    raise exception 'H3_RECEIPT_REQUIRED' using errcode = '23514';
  end if;
  if v_h3.outcome = 'DEFERRED'
     or v_h3.master_id <> v_decision.vertical_review_master_id
     or v_h3.master_drive_file_id <> v_decision.vertical_review_master_drive_file_id
     or v_h3.master_version <> v_decision.vertical_review_master_version
     or v_h3.reviewed_unit_keys <> v_decision.vertical_review_unit_keys
     or v_h3.source_team_outcome_ids <> v_decision.vertical_review_source_team_outcome_ids then
    raise exception 'H4_ADOPTION_H3_SNAPSHOT_MISMATCH' using errcode = '23514';
  end if;
  if v_h3.adoption_receipt_created
     or v_h3.curriculum_in_force_changed
     or v_h3.automatic_master_promotion then
    raise exception 'H3_ADOPTION_BOUNDARY_VIOLATED' using errcode = '23514';
  end if;

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
      and selected_outcome.id = any(v_decision.vertical_review_source_team_outcome_ids)
  ) then
    raise exception 'ADOPTION_HANDOFF_STALE_H2_SOURCE' using errcode = '23514';
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
      and selected_outcome.id = any(v_decision.vertical_review_source_team_outcome_ids)
  ) then
    raise exception 'ADOPTION_HANDOFF_H2_CONTINUATION_OPEN' using errcode = '23514';
  end if;

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
    raise exception 'ADOPTION_HANDOFF_STALE_H3' using errcode = '23514';
  end if;

  select * into v_existing
  from public.h4_canonical_adoption_handoffs handoff
  where handoff.workspace_id = p_workspace_id
    and handoff.institutional_decision_id = p_institutional_decision_id;
  if found then
    return to_jsonb(v_existing);
  end if;

  v_binding_material := 'CML_ARENA_H4_ADOPTION_HANDOFF_V1' || chr(31)
    || p_workspace_id::text || chr(31)
    || v_decision.id::text || chr(31)
    || v_decision.vertical_review_handoff_id::text || chr(31)
    || v_decision.vertical_review_outcome_id::text || chr(31)
    || v_decision.vertical_review_binding_fingerprint || chr(31)
    || v_decision.outcome || chr(31)
    || v_decision.authority_context;
  v_binding_fingerprint := encode(extensions.digest(convert_to(v_binding_material, 'UTF8'), 'sha256'), 'hex');

  insert into public.h4_canonical_adoption_handoffs(
    workspace_id,
    institutional_decision_id,
    vertical_review_handoff_id,
    vertical_review_outcome_id,
    master_id,
    master_drive_file_id,
    master_version,
    discipline,
    reviewed_unit_keys,
    source_team_outcome_ids,
    h4_binding_version,
    h4_binding_fingerprint,
    h4_outcome,
    h4_rationale,
    h4_authority_context,
    h4_authority_assignment_id,
    handoff_binding_version,
    handoff_binding_fingerprint,
    prepared_by_user_id,
    prepared_by_role,
    client_request_id
  ) values (
    p_workspace_id,
    v_decision.id,
    v_decision.vertical_review_handoff_id,
    v_decision.vertical_review_outcome_id,
    v_decision.vertical_review_master_id,
    v_decision.vertical_review_master_drive_file_id,
    v_decision.vertical_review_master_version,
    v_decision.vertical_review_discipline,
    v_decision.vertical_review_unit_keys,
    v_decision.vertical_review_source_team_outcome_ids,
    v_decision.vertical_review_binding_version,
    v_decision.vertical_review_binding_fingerprint,
    v_decision.outcome,
    v_decision.rationale,
    v_decision.authority_context,
    v_decision.authority_assignment_id,
    1,
    v_binding_fingerprint,
    v_user,
    v_role,
    p_client_request_id
  ) returning * into v_existing;

  return to_jsonb(v_existing);
end;
$$;

revoke all on function public.prepare_h4_canonical_adoption_handoff_v1(uuid,uuid,uuid,uuid)
  from public, anon, authenticated;
grant execute on function public.prepare_h4_canonical_adoption_handoff_v1(uuid,uuid,uuid,uuid)
  to authenticated;

comment on table public.h4_canonical_adoption_handoffs is
  'Immutable H4-to-adoption handoff. It proves adoption eligibility from one current approved H4 receipt but never performs adoption, activation, vigency, publication, or master promotion.';
comment on function public.prepare_h4_canonical_adoption_handoff_v1(uuid,uuid,uuid,uuid) is
  'Prepares one immutable H4-bound adoption-review receipt after revalidating the current H4/H3/H2 chain. No canonical adoption or curriculum-in-force mutation is performed.';
