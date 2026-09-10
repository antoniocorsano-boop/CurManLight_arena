-- CurManLight Arena — H3 -> institutional review handoff.
--
-- This boundary makes a non-deferred H3 receipt explicitly eligible for a later
-- institutional review without creating H4, an adoption receipt, curriculum
-- vigency, or master promotion. H4 stays fail-closed until a later RPC consumes
-- this handoff and a real authenticated Collegio actor makes the decision.

create table if not exists public.vertical_review_institutional_handoffs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  vertical_review_outcome_id uuid not null references public.vertical_review_outcomes(id) on delete restrict,
  master_id text not null check (master_id = 'CAN-CURR-MASTER-00'),
  master_drive_file_id text not null check (char_length(trim(master_drive_file_id)) > 0),
  master_version text not null check (char_length(trim(master_version)) > 0),
  source_team_outcome_ids uuid[] not null check (
    cardinality(source_team_outcome_ids) = 2
    and source_team_outcome_ids[1] <> source_team_outcome_ids[2]
  ),
  source_team_outcomes jsonb not null check (
    jsonb_typeof(source_team_outcomes) = 'array'
    and jsonb_array_length(source_team_outcomes) = 2
  ),
  reviewed_unit_keys text[] not null check (
    cardinality(reviewed_unit_keys) = 2
    and reviewed_unit_keys[1] <> reviewed_unit_keys[2]
  ),
  discipline text not null check (char_length(trim(discipline)) > 0),
  vertical_outcome text not null check (vertical_outcome in ('COHERENT','ISSUES_FOUND')),
  findings jsonb not null check (jsonb_typeof(findings) = 'array'),
  vertical_rationale text not null check (char_length(trim(vertical_rationale)) between 1 and 4000),
  handoff_state text not null default 'READY_FOR_INSTITUTIONAL_REVIEW'
    check (handoff_state = 'READY_FOR_INSTITUTIONAL_REVIEW'),
  required_authority_role text not null default 'collegio'
    check (required_authority_role = 'collegio'),
  prepared_by_user_id uuid not null references auth.users(id) on delete restrict,
  prepared_by_role text not null check (prepared_by_role in ('dipartimento','referente','dirigente')),
  prepared_at timestamptz not null default now(),
  client_request_id uuid not null,
  institutional_decision_created boolean not null default false check (not institutional_decision_created),
  adoption_receipt_created boolean not null default false check (not adoption_receipt_created),
  curriculum_in_force_changed boolean not null default false check (not curriculum_in_force_changed),
  automatic_master_promotion boolean not null default false check (not automatic_master_promotion),
  unique (workspace_id, vertical_review_outcome_id),
  unique (workspace_id, client_request_id)
);

create index if not exists vertical_review_institutional_handoffs_workspace_master_idx
  on public.vertical_review_institutional_handoffs(workspace_id, master_id, master_version, prepared_at desc);

alter table public.vertical_review_institutional_handoffs enable row level security;

drop policy if exists "vertical_review_institutional_handoffs_select_active_member"
  on public.vertical_review_institutional_handoffs;
create policy "vertical_review_institutional_handoffs_select_active_member"
  on public.vertical_review_institutional_handoffs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.workspace_memberships membership
      join public.workspaces workspace on workspace.id = membership.workspace_id
      where membership.workspace_id = vertical_review_institutional_handoffs.workspace_id
        and membership.user_id = (select auth.uid())
        and membership.status = 'active'
        and workspace.status = 'active'
    )
  );

revoke all on table public.vertical_review_institutional_handoffs from public, anon, authenticated;
grant select on table public.vertical_review_institutional_handoffs to authenticated;

create or replace function public.prepare_vertical_review_institutional_handoff_v1(
  p_workspace_id uuid,
  p_expected_context_user_id uuid,
  p_vertical_review_outcome_id uuid,
  p_client_request_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_role text;
  v_h3 public.vertical_review_outcomes%rowtype;
  v_existing public.vertical_review_institutional_handoffs%rowtype;
  v_row public.vertical_review_institutional_handoffs%rowtype;
  v_discipline text;
  v_discipline_count integer;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;
  if p_workspace_id is null
     or p_expected_context_user_id is null
     or p_expected_context_user_id <> v_user
     or p_vertical_review_outcome_id is null
     or p_client_request_id is null then
    raise exception 'INVALID_VERTICAL_REVIEW_INSTITUTIONAL_HANDOFF_INPUT' using errcode = '22023';
  end if;

  select membership.role into v_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id
    and membership.user_id = v_user
    and membership.status = 'active'
    and workspace.status = 'active';

  if v_role not in ('dipartimento','referente','dirigente') then
    raise exception 'VERTICAL_REVIEW_HANDOFF_REVIEW_AUTHORITY_REQUIRED' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    p_workspace_id::text || ':H3-H4:' || p_vertical_review_outcome_id::text, 0
  ));

  select * into v_existing
  from public.vertical_review_institutional_handoffs handoff
  where handoff.workspace_id = p_workspace_id
    and handoff.client_request_id = p_client_request_id;
  if found then
    if v_existing.vertical_review_outcome_id <> p_vertical_review_outcome_id
       or v_existing.prepared_by_user_id <> v_user then
      raise exception 'CLIENT_REQUEST_ID_REUSE_MISMATCH' using errcode = '23505';
    end if;
    return to_jsonb(v_existing);
  end if;

  select * into v_h3
  from public.vertical_review_outcomes outcome
  where outcome.workspace_id = p_workspace_id
    and outcome.id = p_vertical_review_outcome_id
  for share;
  if not found then
    raise exception 'VERTICAL_REVIEW_OUTCOME_REQUIRED' using errcode = '23514';
  end if;
  if v_h3.outcome = 'DEFERRED' then
    raise exception 'VERTICAL_REVIEW_DEFERRED_NOT_ELIGIBLE_FOR_INSTITUTIONAL_HANDOFF' using errcode = '23514';
  end if;
  if v_h3.institutional_decision_created
     or v_h3.adoption_receipt_created
     or v_h3.curriculum_in_force_changed
     or v_h3.automatic_master_promotion then
    raise exception 'VERTICAL_REVIEW_AUTHORITY_BOUNDARY_VIOLATED' using errcode = '23514';
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
      and selected_outcome.id = any(v_h3.source_team_outcome_ids)
  ) then
    raise exception 'VERTICAL_REVIEW_HANDOFF_STALE_H2_SOURCE' using errcode = '23514';
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
      and selected_outcome.id = any(v_h3.source_team_outcome_ids)
  ) then
    raise exception 'VERTICAL_REVIEW_HANDOFF_H2_CONTINUATION_OPEN' using errcode = '23514';
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
    raise exception 'VERTICAL_REVIEW_HANDOFF_STALE_H3' using errcode = '23514';
  end if;

  select count(distinct source_item->>'discipline')::integer,
         min(source_item->>'discipline')
    into v_discipline_count, v_discipline
  from jsonb_array_elements(v_h3.source_team_outcomes) source_item;
  if v_discipline_count <> 1 or nullif(trim(v_discipline), '') is null then
    raise exception 'VERTICAL_REVIEW_HANDOFF_DISCIPLINE_INVALID' using errcode = '23514';
  end if;

  select * into v_existing
  from public.vertical_review_institutional_handoffs handoff
  where handoff.workspace_id = p_workspace_id
    and handoff.vertical_review_outcome_id = p_vertical_review_outcome_id;
  if found then
    return to_jsonb(v_existing);
  end if;

  insert into public.vertical_review_institutional_handoffs(
    workspace_id,
    vertical_review_outcome_id,
    master_id,
    master_drive_file_id,
    master_version,
    source_team_outcome_ids,
    source_team_outcomes,
    reviewed_unit_keys,
    discipline,
    vertical_outcome,
    findings,
    vertical_rationale,
    handoff_state,
    required_authority_role,
    prepared_by_user_id,
    prepared_by_role,
    client_request_id,
    institutional_decision_created,
    adoption_receipt_created,
    curriculum_in_force_changed,
    automatic_master_promotion
  ) values (
    p_workspace_id,
    v_h3.id,
    v_h3.master_id,
    v_h3.master_drive_file_id,
    v_h3.master_version,
    v_h3.source_team_outcome_ids,
    v_h3.source_team_outcomes,
    v_h3.reviewed_unit_keys,
    v_discipline,
    v_h3.outcome,
    v_h3.findings,
    v_h3.rationale,
    'READY_FOR_INSTITUTIONAL_REVIEW',
    'collegio',
    v_user,
    v_role,
    p_client_request_id,
    false,
    false,
    false,
    false
  ) returning * into v_row;

  return to_jsonb(v_row);
end;
$$;

revoke all on function public.prepare_vertical_review_institutional_handoff_v1(uuid,uuid,uuid,uuid)
  from public, anon, authenticated;
grant execute on function public.prepare_vertical_review_institutional_handoff_v1(uuid,uuid,uuid,uuid)
  to authenticated;

-- H4 is intentionally closed while the H3-bound institutional-decision RPC does
-- not yet exist. This prevents the older proposal-only B3 boundary from bypassing
-- the real H3 receipt proven by the human workflow.
revoke execute on function public.record_institutional_revision_decision(uuid,text,text,text,text,text,uuid)
  from authenticated;

do $$
begin
  if to_regprocedure('public.record_institutional_revision_decision_v4(uuid,uuid,text,text,text,text,text,text,text,uuid)') is not null then
    execute 'revoke execute on function public.record_institutional_revision_decision_v4(uuid,uuid,text,text,text,text,text,text,text,uuid) from authenticated';
  end if;
end;
$$;

comment on table public.vertical_review_institutional_handoffs is
  'Append-only H3-to-institutional-review handoffs. They snapshot one current non-deferred H3 receipt and never create H4, adoption, vigency, or master promotion.';

comment on function public.prepare_vertical_review_institutional_handoff_v1(uuid,uuid,uuid,uuid) is
  'Explicit H3 handoff boundary. Verifies authenticated review authority, current H2/H3 sources, no open H2 continuation, and records a READY_FOR_INSTITUTIONAL_REVIEW snapshot. H4 remains separate and closed.';
