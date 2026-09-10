-- CurManLight Arena — H3 vertical review outcome.
--
-- H3 consumes persisted case-scoped TeamProfessionalOutcome receipts and records
-- one explicit review of a previous -> next curriculum-unit relationship.
-- This migration must never create InstitutionalDecision, AdoptionReceipt,
-- change curriculum vigency, or promote the canonical master.

create table if not exists public.vertical_review_outcomes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
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
  outcome text not null check (outcome in ('COHERENT','ISSUES_FOUND','DEFERRED')),
  findings jsonb not null check (
    jsonb_typeof(findings) = 'array'
    and jsonb_array_length(findings) between 1 and 50
  ),
  rationale text not null check (char_length(trim(rationale)) between 1 and 4000),
  recorded_by_user_id uuid not null references auth.users(id) on delete restrict,
  recorded_by_role text not null check (recorded_by_role in ('dipartimento','referente','dirigente')),
  recorded_at timestamptz not null default now(),
  client_request_id uuid not null,
  institutional_decision_created boolean not null default false check (not institutional_decision_created),
  adoption_receipt_created boolean not null default false check (not adoption_receipt_created),
  curriculum_in_force_changed boolean not null default false check (not curriculum_in_force_changed),
  automatic_master_promotion boolean not null default false check (not automatic_master_promotion),
  unique (workspace_id, client_request_id)
);

create index if not exists vertical_review_outcomes_workspace_master_idx
  on public.vertical_review_outcomes(workspace_id, master_id, master_version, recorded_at desc);

alter table public.vertical_review_outcomes enable row level security;

drop policy if exists "vertical_review_outcomes_select_active_member" on public.vertical_review_outcomes;
create policy "vertical_review_outcomes_select_active_member"
  on public.vertical_review_outcomes
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.workspace_memberships membership
      join public.workspaces workspace on workspace.id = membership.workspace_id
      where membership.workspace_id = vertical_review_outcomes.workspace_id
        and membership.user_id = auth.uid()
        and membership.status = 'active'
        and workspace.status = 'active'
    )
  );

revoke all on table public.vertical_review_outcomes from public, anon, authenticated;
grant select on table public.vertical_review_outcomes to authenticated;

create or replace function public.list_vertical_review_candidates_v1(
  p_workspace_id uuid,
  p_master_id text,
  p_master_drive_file_id text,
  p_master_version text,
  p_discipline text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_result jsonb;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;
  if p_workspace_id is null
     or p_master_id <> 'CAN-CURR-MASTER-00'
     or nullif(trim(p_master_drive_file_id), '') is null
     or nullif(trim(p_master_version), '') is null
     or p_discipline is null
     or p_discipline <> trim(p_discipline)
     or p_discipline = '' then
    raise exception 'INVALID_VERTICAL_REVIEW_SCOPE' using errcode = '22023';
  end if;
  if not exists (
    select 1
    from public.workspace_memberships membership
    join public.workspaces workspace on workspace.id = membership.workspace_id
    where membership.workspace_id = p_workspace_id
      and membership.user_id = v_user
      and membership.status = 'active'
      and workspace.status = 'active'
  ) then
    raise exception 'VERTICAL_REVIEW_WORKSPACE_MEMBERSHIP_REQUIRED' using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'team_outcome_id', candidate.team_outcome_id,
      'workspace_id', candidate.workspace_id,
      'review_case_id', candidate.review_case_id,
      'academic_year', candidate.academic_year,
      'group_code', candidate.group_code,
      'discipline', candidate.discipline,
      'school_order', candidate.school_order,
      'class_or_age_band', candidate.class_or_age_band,
      'curriculum_unit_key', candidate.curriculum_unit_key,
      'master_id', candidate.master_id,
      'master_drive_file_id', candidate.master_drive_file_id,
      'master_version', candidate.master_version,
      'proposal_ref', candidate.proposal_ref,
      'proposal_fingerprint', candidate.proposal_fingerprint,
      'team_outcome', candidate.team_outcome,
      'shared_text', candidate.shared_text,
      'team_rationale', candidate.team_rationale,
      'team_outcome_recorded_at', candidate.team_outcome_recorded_at,
      'scope_reason', candidate.scope_reason
    ) order by candidate.team_outcome_recorded_at desc
  ), '[]'::jsonb)
  into v_result
  from (
    select distinct on (team_outcome.review_case_id, team_outcome.proposal_ref)
      team_outcome.id as team_outcome_id,
      team_outcome.workspace_id,
      team_outcome.review_case_id,
      team_outcome.academic_year,
      team_outcome.group_code,
      review_case.discipline,
      review_case.school_order,
      review_case.class_or_age_band,
      review_case.curriculum_unit_key,
      review_case.master_id,
      review_case.master_drive_file_id,
      review_case.master_version,
      team_outcome.proposal_ref,
      team_outcome.proposal_fingerprint,
      team_outcome.outcome as team_outcome,
      team_outcome.shared_text,
      team_outcome.rationale as team_rationale,
      team_outcome.recorded_at as team_outcome_recorded_at,
      review_case.scope_reason
    from public.team_review_outcomes team_outcome
    join public.shared_curriculum_review_cases review_case
      on review_case.workspace_id = team_outcome.workspace_id
      and review_case.case_id = team_outcome.review_case_id
    where team_outcome.workspace_id = p_workspace_id
      and team_outcome.review_case_id is not null
      and review_case.master_id = p_master_id
      and review_case.master_drive_file_id = trim(p_master_drive_file_id)
      and review_case.master_version = trim(p_master_version)
      and review_case.discipline = p_discipline
      and team_outcome.proposal_ref = any(review_case.targeted_proposal_refs)
    order by team_outcome.review_case_id, team_outcome.proposal_ref, team_outcome.recorded_at desc, team_outcome.id desc
  ) candidate;

  return v_result;
end;
$$;

revoke all on function public.list_vertical_review_candidates_v1(uuid,text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.list_vertical_review_candidates_v1(uuid,text,text,text,text)
  to authenticated;

create or replace function public.record_vertical_review_outcome_v1(
  p_workspace_id uuid,
  p_master_id text,
  p_master_drive_file_id text,
  p_master_version text,
  p_source_team_outcome_ids uuid[],
  p_outcome text,
  p_findings jsonb,
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
  v_source_count integer;
  v_unit_count integer;
  v_discipline_count integer;
  v_academic_year_count integer;
  v_source_discipline text;
  v_source_academic_year text;
  v_master_match boolean;
  v_source_has_defer boolean;
  v_reviewed_unit_keys text[];
  v_source_snapshot jsonb;
  v_link_finding_count integer;
  v_issue_count integer;
  v_open_question_count integer;
  v_existing public.vertical_review_outcomes%rowtype;
  v_row public.vertical_review_outcomes%rowtype;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;
  if p_workspace_id is null
     or p_master_id <> 'CAN-CURR-MASTER-00'
     or nullif(trim(p_master_drive_file_id), '') is null
     or nullif(trim(p_master_version), '') is null
     or p_source_team_outcome_ids is null
     or cardinality(p_source_team_outcome_ids) <> 2
     or p_source_team_outcome_ids[1] = p_source_team_outcome_ids[2]
     or p_outcome not in ('COHERENT','ISSUES_FOUND','DEFERRED')
     or p_findings is null
     or jsonb_typeof(p_findings) <> 'array'
     or jsonb_array_length(p_findings) < 1
     or jsonb_array_length(p_findings) > 50
     or p_rationale is null
     or char_length(trim(p_rationale)) not between 1 and 4000
     or p_client_request_id is null then
    raise exception 'INVALID_VERTICAL_REVIEW_INPUT' using errcode = '22023';
  end if;

  select membership.role into v_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id
    and membership.user_id = v_user
    and membership.status = 'active'
    and workspace.status = 'active';

  if v_role not in ('dipartimento','referente','dirigente') then
    raise exception 'VERTICAL_REVIEW_REVIEW_REQUIRED' using errcode = '42501';
  end if;

  select
    count(*)::integer,
    count(distinct review_case.curriculum_unit_key)::integer,
    count(distinct review_case.discipline)::integer,
    count(distinct review_case.academic_year)::integer,
    min(review_case.discipline),
    min(review_case.academic_year),
    coalesce(bool_and(
      review_case.master_id = p_master_id
      and review_case.master_drive_file_id = trim(p_master_drive_file_id)
      and review_case.master_version = trim(p_master_version)
    ), false),
    coalesce(bool_or(team_outcome.outcome = 'defer'), false),
    array_agg(
      review_case.curriculum_unit_key
      order by array_position(p_source_team_outcome_ids, team_outcome.id)
    ),
    jsonb_agg(
      jsonb_build_object(
        'team_outcome_id', team_outcome.id,
        'review_case_id', team_outcome.review_case_id,
        'curriculum_unit_key', review_case.curriculum_unit_key,
        'school_order', review_case.school_order,
        'class_or_age_band', review_case.class_or_age_band,
        'discipline', review_case.discipline,
        'proposal_ref', team_outcome.proposal_ref,
        'proposal_fingerprint', team_outcome.proposal_fingerprint,
        'team_outcome', team_outcome.outcome,
        'team_outcome_recorded_at', team_outcome.recorded_at
      ) order by array_position(p_source_team_outcome_ids, team_outcome.id)
    )
  into
    v_source_count,
    v_unit_count,
    v_discipline_count,
    v_academic_year_count,
    v_source_discipline,
    v_source_academic_year,
    v_master_match,
    v_source_has_defer,
    v_reviewed_unit_keys,
    v_source_snapshot
  from public.team_review_outcomes team_outcome
  join public.shared_curriculum_review_cases review_case
    on review_case.workspace_id = team_outcome.workspace_id
    and review_case.case_id = team_outcome.review_case_id
  where team_outcome.workspace_id = p_workspace_id
    and team_outcome.id = any(p_source_team_outcome_ids)
    and team_outcome.review_case_id is not null
    and team_outcome.proposal_ref = any(review_case.targeted_proposal_refs);

  if v_source_count <> 2 then
    raise exception 'VERTICAL_REVIEW_H2_OUTCOMES_REQUIRED' using errcode = '23514';
  end if;
  if not v_master_match then
    raise exception 'VERTICAL_REVIEW_MASTER_MISMATCH' using errcode = '23514';
  end if;
  if v_unit_count <> 2 then
    raise exception 'VERTICAL_REVIEW_DISTINCT_UNITS_REQUIRED' using errcode = '23514';
  end if;
  if v_discipline_count <> 1 then
    raise exception 'VERTICAL_REVIEW_DISCIPLINE_MISMATCH' using errcode = '23514';
  end if;
  if v_academic_year_count <> 1 then
    raise exception 'VERTICAL_REVIEW_ACADEMIC_YEAR_MISMATCH' using errcode = '23514';
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
      and selected_outcome.id = any(p_source_team_outcome_ids)
  ) then
    raise exception 'VERTICAL_REVIEW_STALE_TEAM_OUTCOME' using errcode = '23514';
  end if;

  if v_role in ('dipartimento','referente') and not exists (
    select 1
    from public.team_operational_memberships operational
    where operational.user_id = v_user
      and operational.academic_year = v_source_academic_year
      and operational.membership_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO')
      and v_source_discipline = any(operational.disciplines)
  ) then
    raise exception 'VERTICAL_REVIEW_DISCIPLINE_COMPETENCE_REQUIRED' using errcode = '42501';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_findings) finding
    where jsonb_typeof(finding) <> 'object'
      or coalesce(finding->>'kind', '') not in (
        'PROGRESSION_LINK','GAP','DUPLICATION','MISSING_PREREQUISITE','OPEN_QUESTION'
      )
      or coalesce(finding->>'from_unit_key', '') <> v_reviewed_unit_keys[1]
      or coalesce(finding->>'to_unit_key', '') <> v_reviewed_unit_keys[2]
      or nullif(trim(coalesce(finding->>'note', '')), '') is null
      or char_length(trim(coalesce(finding->>'note', ''))) > 1200
  ) then
    raise exception 'INVALID_VERTICAL_REVIEW_FINDING' using errcode = '22023';
  end if;

  select
    count(*) filter (where finding->>'kind' = 'PROGRESSION_LINK')::integer,
    count(*) filter (where finding->>'kind' in ('GAP','DUPLICATION','MISSING_PREREQUISITE'))::integer,
    count(*) filter (where finding->>'kind' = 'OPEN_QUESTION')::integer
  into v_link_finding_count, v_issue_count, v_open_question_count
  from jsonb_array_elements(p_findings) finding;

  if v_link_finding_count <> 1 then
    raise exception 'VERTICAL_REVIEW_LINK_FINDING_REQUIRED' using errcode = '23514';
  end if;
  if v_source_has_defer and p_outcome <> 'DEFERRED' then
    raise exception 'VERTICAL_REVIEW_H2_UNRESOLVED' using errcode = '23514';
  end if;
  if v_open_question_count > 0 and p_outcome <> 'DEFERRED' then
    raise exception 'VERTICAL_REVIEW_OPEN_QUESTION_REQUIRES_DEFER' using errcode = '23514';
  end if;
  if p_outcome = 'COHERENT' and (v_issue_count > 0 or v_open_question_count > 0) then
    raise exception 'VERTICAL_REVIEW_COHERENT_WITH_ISSUES' using errcode = '23514';
  end if;
  if p_outcome = 'ISSUES_FOUND' and v_issue_count = 0 then
    raise exception 'VERTICAL_REVIEW_ISSUE_REQUIRED' using errcode = '23514';
  end if;
  if p_outcome = 'DEFERRED' and v_open_question_count = 0 and not v_source_has_defer then
    raise exception 'VERTICAL_REVIEW_DEFER_REASON_REQUIRED' using errcode = '23514';
  end if;

  select * into v_existing
  from public.vertical_review_outcomes outcome
  where outcome.workspace_id = p_workspace_id
    and outcome.client_request_id = p_client_request_id;

  if found then
    if v_existing.recorded_by_user_id <> v_user
      or v_existing.master_id <> p_master_id
      or v_existing.master_drive_file_id <> trim(p_master_drive_file_id)
      or v_existing.master_version <> trim(p_master_version)
      or v_existing.source_team_outcome_ids <> p_source_team_outcome_ids
      or v_existing.outcome <> p_outcome
      or v_existing.findings <> p_findings
      or v_existing.rationale <> trim(p_rationale)
    then
      raise exception 'CLIENT_REQUEST_ID_REUSE_MISMATCH' using errcode = '23505';
    end if;
    return to_jsonb(v_existing);
  end if;

  insert into public.vertical_review_outcomes(
    workspace_id,
    master_id,
    master_drive_file_id,
    master_version,
    source_team_outcome_ids,
    source_team_outcomes,
    reviewed_unit_keys,
    outcome,
    findings,
    rationale,
    recorded_by_user_id,
    recorded_by_role,
    client_request_id,
    institutional_decision_created,
    adoption_receipt_created,
    curriculum_in_force_changed,
    automatic_master_promotion
  ) values (
    p_workspace_id,
    p_master_id,
    trim(p_master_drive_file_id),
    trim(p_master_version),
    p_source_team_outcome_ids,
    v_source_snapshot,
    v_reviewed_unit_keys,
    p_outcome,
    p_findings,
    trim(p_rationale),
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

revoke all on function public.record_vertical_review_outcome_v1(
  uuid,text,text,text,uuid[],text,jsonb,text,uuid
) from public, anon, authenticated;
grant execute on function public.record_vertical_review_outcome_v1(
  uuid,text,text,text,uuid[],text,jsonb,text,uuid
) to authenticated;

comment on table public.vertical_review_outcomes is
  'H3 append-only professional vertical-review receipts. They consume case-scoped H2 team outcomes and never create institutional decisions, adoption receipts, vigency, or master promotion.';

comment on function public.record_vertical_review_outcome_v1(uuid,text,text,text,uuid[],text,jsonb,text,uuid) is
  'Records one explicit previous-to-next H3 relationship after verifying two current H2 outcomes, same master/version, distinct curriculum units, discipline coherence, authenticated review authority, and idempotency. H4 remains untouched.';
