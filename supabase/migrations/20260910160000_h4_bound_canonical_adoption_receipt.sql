-- CurManLight Arena Beta — H4-bound canonical adoption receipt.
--
-- This slice records the human adoption act for the exact H4/H3/H2 package.
-- It deliberately does NOT materialize a new canonical master, activate a
-- canonical head, publish a release, change curriculum vigency, or promote the
-- reviewed master. Those operations remain a later, explicit human boundary.

create extension if not exists pgcrypto;

create table if not exists public.h4_bound_canonical_adoption_receipts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  adoption_handoff_id uuid not null references public.h4_canonical_adoption_handoffs(id) on delete restrict,
  institutional_decision_id uuid not null references public.institutional_revision_decisions(id) on delete restrict,
  vertical_review_handoff_id uuid not null references public.vertical_review_institutional_handoffs(id) on delete restrict,
  vertical_review_outcome_id uuid not null references public.vertical_review_outcomes(id) on delete restrict,
  master_id text not null,
  master_drive_file_id text not null,
  master_version text not null,
  discipline text not null,
  reviewed_unit_keys text[] not null,
  source_team_outcome_ids uuid[] not null,
  adoption_subject_snapshot jsonb not null check (jsonb_typeof(adoption_subject_snapshot) = 'object'),
  adoption_subject_fingerprint text not null check (adoption_subject_fingerprint ~ '^[a-f0-9]{64}$'),
  adoption_binding_version smallint not null default 1 check (adoption_binding_version = 1),
  adoption_binding_fingerprint text not null check (adoption_binding_fingerprint ~ '^[a-f0-9]{64}$'),
  status text not null default 'ADOPTED_PENDING_MATERIALIZATION'
    check (status = 'ADOPTED_PENDING_MATERIALIZATION'),
  rationale text not null check (char_length(trim(rationale)) between 1 and 4000),
  authority_role text not null default 'dirigente' check (authority_role = 'dirigente'),
  authority_context text not null check (authority_context in ('INSTITUTIONAL','DEVELOPMENT_PILOT')),
  authority_assignment_id uuid references public.development_pilot_authority_assignments(id) on delete restrict,
  adopted_by_user_id uuid not null references auth.users(id) on delete restrict,
  adopted_at timestamptz not null default now(),
  client_request_id uuid not null,
  materialization_created boolean not null default false check (materialization_created = false),
  curriculum_in_force_changed boolean not null default false check (curriculum_in_force_changed = false),
  automatic_master_promotion boolean not null default false check (automatic_master_promotion = false),
  unique (workspace_id, adoption_handoff_id),
  unique (workspace_id, client_request_id),
  constraint h4_bound_canonical_adoption_authority_context_check check (
    (authority_context = 'INSTITUTIONAL' and authority_assignment_id is null)
    or (authority_context = 'DEVELOPMENT_PILOT' and authority_assignment_id is not null)
  ),
  check (cardinality(reviewed_unit_keys) >= 1),
  check (cardinality(source_team_outcome_ids) >= 1),
  check (nullif(trim(master_id), '') is not null),
  check (nullif(trim(master_drive_file_id), '') is not null),
  check (nullif(trim(master_version), '') is not null),
  check (nullif(trim(discipline), '') is not null)
);

alter table public.h4_bound_canonical_adoption_receipts enable row level security;

create index if not exists h4_bound_canonical_adoption_decision_idx
  on public.h4_bound_canonical_adoption_receipts(institutional_decision_id);
create index if not exists h4_bound_canonical_adoption_h3_idx
  on public.h4_bound_canonical_adoption_receipts(vertical_review_outcome_id);
create index if not exists h4_bound_canonical_adoption_h3_handoff_idx
  on public.h4_bound_canonical_adoption_receipts(vertical_review_handoff_id);
create index if not exists h4_bound_canonical_adoption_authority_assignment_idx
  on public.h4_bound_canonical_adoption_receipts(authority_assignment_id)
  where authority_assignment_id is not null;
create index if not exists h4_bound_canonical_adoption_adopted_by_idx
  on public.h4_bound_canonical_adoption_receipts(adopted_by_user_id);

revoke insert, update, delete on table public.h4_bound_canonical_adoption_receipts from public, anon, authenticated;
grant select on table public.h4_bound_canonical_adoption_receipts to authenticated;

drop policy if exists "h4_bound_canonical_adoption_receipts_select_active_member"
  on public.h4_bound_canonical_adoption_receipts;
create policy "h4_bound_canonical_adoption_receipts_select_active_member"
  on public.h4_bound_canonical_adoption_receipts
  for select to authenticated
  using (exists (
    select 1
    from public.workspace_memberships membership
    join public.workspaces workspace on workspace.id = membership.workspace_id
    where membership.workspace_id = h4_bound_canonical_adoption_receipts.workspace_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and workspace.status = 'active'
  ));

create or replace function public.reject_h4_bound_canonical_adoption_mutation_v1()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'H4_BOUND_ADOPTION_IMMUTABLE' using errcode = '55000';
end;
$$;

revoke all on function public.reject_h4_bound_canonical_adoption_mutation_v1()
  from public, anon, authenticated;

drop trigger if exists h4_bound_canonical_adoption_receipts_immutable
  on public.h4_bound_canonical_adoption_receipts;
create trigger h4_bound_canonical_adoption_receipts_immutable
  before update or delete on public.h4_bound_canonical_adoption_receipts
  for each row execute function public.reject_h4_bound_canonical_adoption_mutation_v1();

create or replace function public.record_h4_bound_canonical_adoption_v1(
  p_workspace_id uuid,
  p_expected_context_user_id uuid,
  p_adoption_handoff_id uuid,
  p_rationale text,
  p_client_request_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_membership_role text;
  v_pilot_assignment public.development_pilot_authority_assignments%rowtype;
  v_authority_context text := 'INSTITUTIONAL';
  v_handoff public.h4_canonical_adoption_handoffs%rowtype;
  v_decision public.institutional_revision_decisions%rowtype;
  v_h3_handoff public.vertical_review_institutional_handoffs%rowtype;
  v_h3 public.vertical_review_outcomes%rowtype;
  v_existing public.h4_bound_canonical_adoption_receipts%rowtype;
  v_subject jsonb;
  v_subject_fingerprint text;
  v_binding_material text;
  v_binding_fingerprint text;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;
  if p_expected_context_user_id is null or p_expected_context_user_id <> v_user then
    raise exception 'WORKSPACE_ACTOR_CONTEXT_PRINCIPAL_MISMATCH' using errcode = '42501';
  end if;
  if p_workspace_id is null or p_adoption_handoff_id is null or p_client_request_id is null
     or p_rationale is null or char_length(trim(p_rationale)) not between 1 and 4000 then
    raise exception 'INVALID_H4_BOUND_ADOPTION_INPUT' using errcode = '22023';
  end if;

  select membership.role into v_membership_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id
    and membership.user_id = v_user
    and membership.status = 'active'
    and workspace.status = 'active';
  if v_membership_role is null then
    raise exception 'ACTIVE_WORKSPACE_MEMBERSHIP_REQUIRED' using errcode = '42501';
  end if;

  select assignment.* into v_pilot_assignment
  from public.development_pilot_authority_assignments assignment
  where assignment.workspace_id = p_workspace_id
    and assignment.user_id = v_user
    and assignment.authority_role = 'dirigente'
    and assignment.scope = 'BETA_DEVELOPMENT_PILOT'
    and assignment.status = 'active'
  order by assignment.assigned_at desc, assignment.id desc
  limit 1;

  if found then
    v_authority_context := 'DEVELOPMENT_PILOT';
  elsif v_membership_role is distinct from 'dirigente' then
    raise exception 'CURRICULUM_ADOPT_REQUIRED' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    p_workspace_id::text || ':H4-BOUND-ADOPTION:' || p_adoption_handoff_id::text, 0
  ));

  select * into v_existing
  from public.h4_bound_canonical_adoption_receipts receipt
  where receipt.workspace_id = p_workspace_id
    and receipt.client_request_id = p_client_request_id;
  if found then
    if v_existing.adoption_handoff_id <> p_adoption_handoff_id
       or v_existing.adopted_by_user_id <> v_user then
      raise exception 'CLIENT_REQUEST_ID_REUSE_MISMATCH' using errcode = '23505';
    end if;
    return to_jsonb(v_existing);
  end if;

  select * into v_handoff
  from public.h4_canonical_adoption_handoffs handoff
  where handoff.workspace_id = p_workspace_id
    and handoff.id = p_adoption_handoff_id
  for share;
  if not found then
    raise exception 'H4_ADOPTION_HANDOFF_REQUIRED' using errcode = '23514';
  end if;
  if v_handoff.adoption_state <> 'READY_FOR_ADOPTION_REVIEW'
     or v_handoff.required_adoption_role <> 'dirigente'
     or v_handoff.h4_outcome not in ('approve','approve-with-changes')
     or v_handoff.adoption_receipt_created
     or v_handoff.curriculum_in_force_changed
     or v_handoff.automatic_master_promotion then
    raise exception 'H4_ADOPTION_HANDOFF_NOT_READY' using errcode = '23514';
  end if;

  select * into v_existing
  from public.h4_bound_canonical_adoption_receipts receipt
  where receipt.workspace_id = p_workspace_id
    and receipt.adoption_handoff_id = p_adoption_handoff_id;
  if found then
    return to_jsonb(v_existing);
  end if;

  select * into v_decision
  from public.institutional_revision_decisions decision
  where decision.workspace_id = p_workspace_id
    and decision.id = v_handoff.institutional_decision_id
  for share;
  if not found then
    raise exception 'H4_DECISION_REQUIRED' using errcode = '23514';
  end if;
  if v_decision.decision_basis <> 'VERTICAL_REVIEW_HANDOFF'
     or v_decision.outcome not in ('approve','approve-with-changes')
     or v_decision.vertical_review_handoff_id <> v_handoff.vertical_review_handoff_id
     or v_decision.vertical_review_outcome_id <> v_handoff.vertical_review_outcome_id
     or v_decision.vertical_review_master_id <> v_handoff.master_id
     or v_decision.vertical_review_master_drive_file_id <> v_handoff.master_drive_file_id
     or v_decision.vertical_review_master_version <> v_handoff.master_version
     or v_decision.vertical_review_discipline <> v_handoff.discipline
     or v_decision.vertical_review_unit_keys <> v_handoff.reviewed_unit_keys
     or v_decision.vertical_review_source_team_outcome_ids <> v_handoff.source_team_outcome_ids
     or v_decision.vertical_review_binding_version is distinct from v_handoff.h4_binding_version
     or v_decision.vertical_review_binding_fingerprint <> v_handoff.h4_binding_fingerprint then
    raise exception 'H4_BOUND_ADOPTION_SNAPSHOT_MISMATCH' using errcode = '23514';
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
    raise exception 'ADOPTION_CURRENT_FINAL_H4_REQUIRED' using errcode = '23514';
  end if;

  select * into v_h3_handoff
  from public.vertical_review_institutional_handoffs handoff
  where handoff.workspace_id = p_workspace_id
    and handoff.id = v_handoff.vertical_review_handoff_id
  for share;
  if not found then
    raise exception 'H3_INSTITUTIONAL_HANDOFF_REQUIRED' using errcode = '23514';
  end if;
  if v_h3_handoff.vertical_review_outcome_id <> v_handoff.vertical_review_outcome_id
     or v_h3_handoff.master_id <> v_handoff.master_id
     or v_h3_handoff.master_drive_file_id <> v_handoff.master_drive_file_id
     or v_h3_handoff.master_version <> v_handoff.master_version
     or v_h3_handoff.discipline <> v_handoff.discipline
     or v_h3_handoff.reviewed_unit_keys <> v_handoff.reviewed_unit_keys
     or v_h3_handoff.source_team_outcome_ids <> v_handoff.source_team_outcome_ids then
    raise exception 'H3_BOUND_ADOPTION_HANDOFF_MISMATCH' using errcode = '23514';
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
     or v_h3.reviewed_unit_keys <> v_handoff.reviewed_unit_keys
     or v_h3.source_team_outcome_ids <> v_handoff.source_team_outcome_ids then
    raise exception 'H3_BOUND_ADOPTION_SNAPSHOT_MISMATCH' using errcode = '23514';
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
      and selected_outcome.id = any(v_handoff.source_team_outcome_ids)
  ) then
    raise exception 'ADOPTION_STALE_H2_SOURCE' using errcode = '23514';
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
    raise exception 'ADOPTION_H2_CONTINUATION_OPEN' using errcode = '23514';
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
    raise exception 'ADOPTION_STALE_H3' using errcode = '23514';
  end if;

  v_subject := jsonb_build_object(
    'schemaVersion', 1,
    'kind', 'H4_BOUND_ADOPTION_SUBJECT',
    'master', jsonb_build_object(
      'id', v_handoff.master_id,
      'driveFileId', v_handoff.master_drive_file_id,
      'version', v_handoff.master_version
    ),
    'discipline', v_handoff.discipline,
    'reviewedUnitKeys', to_jsonb(v_handoff.reviewed_unit_keys),
    'sourceTeamOutcomes', v_h3.source_team_outcomes,
    'verticalReview', jsonb_build_object(
      'id', v_h3.id,
      'outcome', v_h3.outcome,
      'findings', v_h3.findings,
      'rationale', v_h3.rationale
    ),
    'institutionalDecision', jsonb_build_object(
      'id', v_decision.id,
      'outcome', v_decision.outcome,
      'rationale', v_decision.rationale,
      'authorityContext', v_decision.authority_context,
      'bindingFingerprint', v_decision.vertical_review_binding_fingerprint
    ),
    'adoptionHandoff', jsonb_build_object(
      'id', v_handoff.id,
      'bindingFingerprint', v_handoff.handoff_binding_fingerprint
    )
  );
  v_subject_fingerprint := encode(
    extensions.digest(convert_to(v_subject::text, 'UTF8'), 'sha256'),
    'hex'
  );

  v_binding_material := 'CML_ARENA_H4_BOUND_ADOPTION_V1' || chr(31)
    || p_workspace_id::text || chr(31)
    || v_handoff.id::text || chr(31)
    || v_decision.id::text || chr(31)
    || v_h3.id::text || chr(31)
    || v_handoff.handoff_binding_fingerprint || chr(31)
    || v_decision.vertical_review_binding_fingerprint || chr(31)
    || v_subject_fingerprint || chr(31)
    || v_authority_context;
  v_binding_fingerprint := encode(
    extensions.digest(convert_to(v_binding_material, 'UTF8'), 'sha256'),
    'hex'
  );

  insert into public.h4_bound_canonical_adoption_receipts(
    workspace_id,
    adoption_handoff_id,
    institutional_decision_id,
    vertical_review_handoff_id,
    vertical_review_outcome_id,
    master_id,
    master_drive_file_id,
    master_version,
    discipline,
    reviewed_unit_keys,
    source_team_outcome_ids,
    adoption_subject_snapshot,
    adoption_subject_fingerprint,
    adoption_binding_version,
    adoption_binding_fingerprint,
    status,
    rationale,
    authority_role,
    authority_context,
    authority_assignment_id,
    adopted_by_user_id,
    client_request_id
  ) values (
    p_workspace_id,
    v_handoff.id,
    v_decision.id,
    v_handoff.vertical_review_handoff_id,
    v_h3.id,
    v_handoff.master_id,
    v_handoff.master_drive_file_id,
    v_handoff.master_version,
    v_handoff.discipline,
    v_handoff.reviewed_unit_keys,
    v_handoff.source_team_outcome_ids,
    v_subject,
    v_subject_fingerprint,
    1,
    v_binding_fingerprint,
    'ADOPTED_PENDING_MATERIALIZATION',
    trim(p_rationale),
    'dirigente',
    v_authority_context,
    case when v_authority_context = 'DEVELOPMENT_PILOT' then v_pilot_assignment.id else null end,
    v_user,
    p_client_request_id
  )
  returning * into v_existing;

  return to_jsonb(v_existing);
end;
$$;

revoke all on function public.record_h4_bound_canonical_adoption_v1(uuid, uuid, uuid, text, uuid)
  from public, anon, authenticated;
grant execute on function public.record_h4_bound_canonical_adoption_v1(uuid, uuid, uuid, text, uuid)
  to authenticated;

comment on table public.h4_bound_canonical_adoption_receipts is
  'Immutable H4-bound adoption receipts. Adoption is recorded here; materialization, publication and curriculum vigency remain separate later gates.';
comment on function public.record_h4_bound_canonical_adoption_v1(uuid, uuid, uuid, text, uuid) is
  'Records one explicit dirigente adoption act for a current H4-bound adoption handoff. Supports explicit DEVELOPMENT_PILOT dirigente authority without rewriting workspace membership. Does not materialize or activate curriculum.';
