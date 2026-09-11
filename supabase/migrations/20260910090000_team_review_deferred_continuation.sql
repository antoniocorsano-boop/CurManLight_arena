-- CurManLight Arena — governed continuation of a deferred H2 outcome.
--
-- A deferred TeamProfessionalOutcome stays immutable. A later professional
-- discussion re-enters the same CurriculumReviewCase through a new explicit
-- continuation, starts with an empty current contribution set, and can append
-- a new TeamProfessionalOutcome. H3/H4/adoption/master authority is never
-- created or changed by this migration.

create table if not exists public.team_review_deferred_continuations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  academic_year text not null check (academic_year ~ '^[0-9]{4}/[0-9]{4}$'),
  group_code text not null references public.operational_group_definitions(group_code) on delete restrict,
  discipline text not null,
  review_case_id text not null,
  proposal_ref text not null,
  proposal_fingerprint text not null check (proposal_fingerprint ~ '^[0-9a-f]{64}$'),
  source_outcome_id uuid not null unique references public.team_review_outcomes(id) on delete restrict,
  opened_by_user_id uuid not null references auth.users(id) on delete restrict,
  opened_by_role text not null check (opened_by_role in ('dipartimento','referente')),
  opened_at timestamptz not null default now(),
  completed_by_outcome_id uuid references public.team_review_outcomes(id) on delete restrict,
  completed_at timestamptz,
  institutional_decision_created boolean not null default false check (not institutional_decision_created),
  adoption_receipt_created boolean not null default false check (not adoption_receipt_created),
  curriculum_in_force_changed boolean not null default false check (not curriculum_in_force_changed),
  automatic_master_promotion boolean not null default false check (not automatic_master_promotion),
  check (review_case_id = trim(review_case_id) and review_case_id <> '' and position(chr(31) in review_case_id) = 0),
  check (proposal_ref = trim(proposal_ref) and proposal_ref <> '' and position(chr(31) in proposal_ref) = 0),
  check (discipline = trim(discipline) and discipline <> '' and position(chr(31) in discipline) = 0),
  check (
    (completed_by_outcome_id is null and completed_at is null)
    or (completed_by_outcome_id is not null and completed_at is not null)
  )
);

create unique index if not exists team_review_deferred_continuations_active_uidx
  on public.team_review_deferred_continuations(workspace_id, review_case_id, proposal_ref)
  where completed_by_outcome_id is null;

create index if not exists team_review_deferred_continuations_case_idx
  on public.team_review_deferred_continuations(workspace_id, review_case_id, opened_at desc);

create table if not exists public.team_review_contribution_history (
  id uuid primary key default gen_random_uuid(),
  continuation_id uuid not null references public.team_review_deferred_continuations(id) on delete restrict,
  source_outcome_id uuid not null references public.team_review_outcomes(id) on delete restrict,
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  academic_year text not null,
  group_code text not null,
  discipline text not null,
  review_case_id text not null,
  proposal_ref text not null,
  proposal_fingerprint text not null,
  contributor_user_id uuid not null references auth.users(id) on delete restrict,
  contributor_role text not null check (contributor_role in ('docente','dipartimento','referente')),
  orientation text not null check (orientation in ('confirm-proposal','propose-change','keep-previous')),
  custom_text text,
  contributed_at timestamptz not null,
  archived_at timestamptz not null default now(),
  unique (continuation_id, contributor_user_id, proposal_ref)
);

alter table public.team_review_deferred_continuations enable row level security;
alter table public.team_review_contribution_history enable row level security;

revoke all on public.team_review_deferred_continuations from public, anon, authenticated;
revoke all on public.team_review_contribution_history from public, anon, authenticated;
grant select on public.team_review_deferred_continuations, public.team_review_contribution_history to authenticated;

drop policy if exists "team_review_deferred_continuations_select_active_member" on public.team_review_deferred_continuations;
create policy "team_review_deferred_continuations_select_active_member"
  on public.team_review_deferred_continuations
  for select to authenticated
  using (exists (
    select 1
    from public.workspace_memberships membership
    join public.workspaces workspace on workspace.id = membership.workspace_id
    where membership.workspace_id = team_review_deferred_continuations.workspace_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
      and workspace.status = 'active'
  ));

drop policy if exists "team_review_contribution_history_select_active_member" on public.team_review_contribution_history;
create policy "team_review_contribution_history_select_active_member"
  on public.team_review_contribution_history
  for select to authenticated
  using (exists (
    select 1
    from public.workspace_memberships membership
    join public.workspaces workspace on workspace.id = membership.workspace_id
    where membership.workspace_id = team_review_contribution_history.workspace_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
      and workspace.status = 'active'
  ));

create or replace function public.list_deferred_team_review_states_v1(
  p_workspace_id uuid,
  p_academic_year text,
  p_group_code text,
  p_discipline text,
  p_review_case_id text
) returns jsonb
language plpgsql
stable
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
  if p_academic_year is null or p_academic_year !~ '^[0-9]{4}/[0-9]{4}$'
     or nullif(trim(p_group_code), '') is null
     or nullif(trim(p_discipline), '') is null
     or nullif(trim(p_review_case_id), '') is null then
    raise exception 'INVALID_DEFERRED_CONTINUATION_SCOPE' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.workspace_memberships membership
    join public.workspaces workspace on workspace.id = membership.workspace_id
    join public.shared_curriculum_review_case_assignments assignment
      on assignment.workspace_id = membership.workspace_id
      and assignment.case_id = p_review_case_id
      and assignment.assigned_user_id = membership.user_id
      and assignment.assignment_state = 'ASSIGNED'
    join public.team_operational_memberships operational
      on operational.user_id = membership.user_id
      and operational.academic_year = p_academic_year
      and operational.group_code = p_group_code
      and operational.membership_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO')
      and p_discipline = any(operational.disciplines)
    where membership.workspace_id = p_workspace_id
      and membership.user_id = v_user
      and membership.status = 'active'
      and workspace.status = 'active'
  ) then
    raise exception 'DEFERRED_CONTINUATION_ASSIGNMENT_REQUIRED' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.shared_curriculum_review_cases review_case
    where review_case.workspace_id = p_workspace_id
      and review_case.case_id = p_review_case_id
      and review_case.academic_year = p_academic_year
      and review_case.group_code = p_group_code
      and review_case.discipline = p_discipline
  ) then
    raise exception 'DEFERRED_CONTINUATION_CASE_SCOPE_MISMATCH' using errcode = '23514';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'proposal_ref', state.proposal_ref,
    'latest_outcome_id', state.latest_outcome_id,
    'latest_outcome', state.latest_outcome,
    'continuation_id', state.continuation_id,
    'continuation_open', state.continuation_id is not null,
    'can_resume', state.latest_outcome = 'defer' and state.continuation_id is null,
    'opened_at', state.opened_at
  ) order by state.proposal_ref), '[]'::jsonb)
  into v_result
  from (
    select
      proposal.proposal_ref,
      latest.id as latest_outcome_id,
      latest.outcome as latest_outcome,
      continuation.id as continuation_id,
      continuation.opened_at
    from public.shared_curriculum_review_cases review_case
    cross join lateral unnest(review_case.targeted_proposal_refs) proposal(proposal_ref)
    left join lateral (
      select outcome.id, outcome.outcome
      from public.team_review_outcomes outcome
      where outcome.workspace_id = review_case.workspace_id
        and outcome.review_case_id = review_case.case_id
        and outcome.proposal_ref = proposal.proposal_ref
      order by outcome.recorded_at desc, outcome.id desc
      limit 1
    ) latest on true
    left join public.team_review_deferred_continuations continuation
      on continuation.workspace_id = review_case.workspace_id
      and continuation.review_case_id = review_case.case_id
      and continuation.proposal_ref = proposal.proposal_ref
      and continuation.completed_by_outcome_id is null
    where review_case.workspace_id = p_workspace_id
      and review_case.case_id = p_review_case_id
      and review_case.academic_year = p_academic_year
      and review_case.group_code = p_group_code
      and review_case.discipline = p_discipline
  ) state;

  return v_result;
end;
$$;

revoke all on function public.list_deferred_team_review_states_v1(uuid,text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.list_deferred_team_review_states_v1(uuid,text,text,text,text)
  to authenticated;

create or replace function public.resume_deferred_team_review_item_v1(
  p_workspace_id uuid,
  p_academic_year text,
  p_group_code text,
  p_discipline text,
  p_review_case_id text,
  p_proposal_ref text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_role text;
  v_source public.team_review_outcomes%rowtype;
  v_continuation public.team_review_deferred_continuations%rowtype;
  v_archived_count integer := 0;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;
  if p_academic_year is null or p_academic_year !~ '^[0-9]{4}/[0-9]{4}$'
     or nullif(trim(p_group_code), '') is null
     or nullif(trim(p_discipline), '') is null
     or nullif(trim(p_review_case_id), '') is null
     or nullif(trim(p_proposal_ref), '') is null then
    raise exception 'INVALID_DEFERRED_CONTINUATION_SCOPE' using errcode = '22023';
  end if;

  select membership.role into v_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id
    and membership.user_id = v_user
    and membership.status = 'active'
    and workspace.status = 'active';

  if v_role not in ('dipartimento','referente') then
    raise exception 'DEFERRED_CONTINUATION_COORDINATOR_REQUIRED' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.team_operational_memberships operational
    join public.shared_curriculum_review_case_assignments assignment
      on assignment.assigned_user_id = operational.user_id
      and assignment.workspace_id = p_workspace_id
      and assignment.case_id = p_review_case_id
      and assignment.assignment_state = 'ASSIGNED'
    where operational.user_id = v_user
      and operational.academic_year = p_academic_year
      and operational.group_code = p_group_code
      and operational.membership_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO')
      and p_discipline = any(operational.disciplines)
  ) then
    raise exception 'DEFERRED_CONTINUATION_OPERATIONAL_AUTHORITY_REQUIRED' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.shared_curriculum_review_cases review_case
    where review_case.workspace_id = p_workspace_id
      and review_case.case_id = p_review_case_id
      and review_case.academic_year = p_academic_year
      and review_case.group_code = p_group_code
      and review_case.discipline = p_discipline
      and p_proposal_ref = any(review_case.targeted_proposal_refs)
  ) then
    raise exception 'DEFERRED_CONTINUATION_CASE_SCOPE_MISMATCH' using errcode = '23514';
  end if;

  select * into v_source
  from public.team_review_outcomes outcome
  where outcome.workspace_id = p_workspace_id
    and outcome.academic_year = p_academic_year
    and outcome.group_code = p_group_code
    and outcome.discipline = p_discipline
    and outcome.review_case_id = p_review_case_id
    and outcome.proposal_ref = p_proposal_ref
  order by outcome.recorded_at desc, outcome.id desc
  limit 1
  for update;

  if not found then
    raise exception 'DEFERRED_CONTINUATION_H2_REQUIRED' using errcode = '23514';
  end if;
  if v_source.outcome <> 'defer' then
    raise exception 'DEFERRED_CONTINUATION_REQUIRES_DEFER' using errcode = '23514';
  end if;
  if exists (
    select 1 from public.team_review_deferred_continuations continuation
    where continuation.workspace_id = p_workspace_id
      and continuation.review_case_id = p_review_case_id
      and continuation.proposal_ref = p_proposal_ref
      and continuation.completed_by_outcome_id is null
  ) then
    raise exception 'DEFERRED_CONTINUATION_ALREADY_OPEN' using errcode = '23505';
  end if;

  insert into public.team_review_deferred_continuations(
    workspace_id, academic_year, group_code, discipline, review_case_id,
    proposal_ref, proposal_fingerprint, source_outcome_id,
    opened_by_user_id, opened_by_role
  ) values (
    p_workspace_id, p_academic_year, p_group_code, p_discipline, p_review_case_id,
    p_proposal_ref, v_source.proposal_fingerprint, v_source.id,
    v_user, v_role
  ) returning * into v_continuation;

  insert into public.team_review_contribution_history(
    continuation_id, source_outcome_id, workspace_id, academic_year, group_code,
    discipline, review_case_id, proposal_ref, proposal_fingerprint,
    contributor_user_id, contributor_role, orientation, custom_text,
    contributed_at, archived_at
  )
  select
    v_continuation.id, v_source.id, contribution.workspace_id,
    contribution.academic_year, contribution.group_code, contribution.discipline,
    contribution.review_case_id, contribution.proposal_ref,
    contribution.proposal_fingerprint, contribution.contributor_user_id,
    contribution.contributor_role, contribution.orientation,
    contribution.custom_text, contribution.updated_at, now()
  from public.team_review_contributions contribution
  where contribution.workspace_id = p_workspace_id
    and contribution.academic_year = p_academic_year
    and contribution.group_code = p_group_code
    and contribution.discipline = p_discipline
    and contribution.review_case_id = p_review_case_id
    and contribution.proposal_ref = p_proposal_ref;
  get diagnostics v_archived_count = row_count;

  delete from public.team_review_contributions contribution
  where contribution.workspace_id = p_workspace_id
    and contribution.academic_year = p_academic_year
    and contribution.group_code = p_group_code
    and contribution.discipline = p_discipline
    and contribution.review_case_id = p_review_case_id
    and contribution.proposal_ref = p_proposal_ref;

  return jsonb_build_object(
    'continuation_id', v_continuation.id,
    'source_outcome_id', v_source.id,
    'proposal_ref', p_proposal_ref,
    'archived_contribution_count', v_archived_count,
    'opened_at', v_continuation.opened_at
  );
end;
$$;

revoke all on function public.resume_deferred_team_review_item_v1(uuid,text,text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.resume_deferred_team_review_item_v1(uuid,text,text,text,text,text)
  to authenticated;

create or replace function public.list_case_scoped_team_review_outcomes_v2(
  p_workspace_id uuid,
  p_academic_year text,
  p_group_code text,
  p_discipline text,
  p_review_case_id text
)
returns table (
  id uuid,
  workspace_id uuid,
  academic_year text,
  group_code text,
  discipline text,
  review_case_id text,
  proposal_ref text,
  proposal_fingerprint text,
  outcome text,
  shared_text text,
  rationale text,
  recorded_by_user_id uuid,
  recorded_by_role text,
  recorded_by_operational_role text,
  authority_state text,
  recorded_at timestamptz,
  client_request_id text
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;
  if not exists (
    select 1
    from public.workspace_memberships membership
    join public.workspaces workspace on workspace.id = membership.workspace_id
    join public.shared_curriculum_review_case_assignments assignment
      on assignment.workspace_id = membership.workspace_id
      and assignment.case_id = p_review_case_id
      and assignment.assigned_user_id = membership.user_id
      and assignment.assignment_state = 'ASSIGNED'
    join public.team_operational_memberships operational
      on operational.user_id = membership.user_id
      and operational.academic_year = p_academic_year
      and operational.group_code = p_group_code
      and operational.membership_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO')
      and p_discipline = any(operational.disciplines)
    where membership.workspace_id = p_workspace_id
      and membership.user_id = v_user
      and membership.status = 'active'
      and workspace.status = 'active'
  ) then
    raise exception 'TEAM_REVIEW_OUTCOME_READ_REQUIRED' using errcode = '42501';
  end if;

  return query
  select
    team_outcome.id, team_outcome.workspace_id, team_outcome.academic_year,
    team_outcome.group_code, team_outcome.discipline, team_outcome.review_case_id,
    team_outcome.proposal_ref, team_outcome.proposal_fingerprint,
    team_outcome.outcome, team_outcome.shared_text, team_outcome.rationale,
    team_outcome.recorded_by_user_id, team_outcome.recorded_by_role,
    team_outcome.recorded_by_operational_role, team_outcome.authority_state,
    team_outcome.recorded_at, team_outcome.client_request_id
  from public.team_review_outcomes team_outcome
  where team_outcome.workspace_id = p_workspace_id
    and team_outcome.academic_year = p_academic_year
    and team_outcome.group_code = p_group_code
    and team_outcome.discipline = p_discipline
    and team_outcome.review_case_id = p_review_case_id
    and not exists (
      select 1 from public.team_review_deferred_continuations continuation
      where continuation.source_outcome_id = team_outcome.id
        and continuation.completed_by_outcome_id is null
    )
  order by team_outcome.recorded_at desc, team_outcome.id desc;
end;
$$;

revoke all on function public.list_case_scoped_team_review_outcomes_v2(uuid,text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.list_case_scoped_team_review_outcomes_v2(uuid,text,text,text,text)
  to authenticated;

create or replace function public.complete_deferred_team_review_continuation_v1()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.team_review_deferred_continuations continuation
  set completed_by_outcome_id = new.id,
      completed_at = new.recorded_at
  where continuation.workspace_id = new.workspace_id
    and continuation.review_case_id = new.review_case_id
    and continuation.proposal_ref = new.proposal_ref
    and continuation.proposal_fingerprint = new.proposal_fingerprint
    and continuation.completed_by_outcome_id is null
    and continuation.source_outcome_id <> new.id
    and new.recorded_at >= continuation.opened_at;
  return new;
end;
$$;

drop trigger if exists complete_deferred_team_review_continuation_after_h2 on public.team_review_outcomes;
create trigger complete_deferred_team_review_continuation_after_h2
after insert on public.team_review_outcomes
for each row execute function public.complete_deferred_team_review_continuation_v1();

create or replace function public.guard_vertical_review_against_open_h2_continuation_v1()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if exists (
    select 1
    from public.team_review_deferred_continuations continuation
    where continuation.workspace_id = new.workspace_id
      and continuation.source_outcome_id = any(new.source_team_outcome_ids)
      and continuation.completed_by_outcome_id is null
  ) then
    raise exception 'VERTICAL_REVIEW_H2_CONTINUATION_OPEN' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_vertical_review_open_h2_continuation on public.vertical_review_outcomes;
create trigger guard_vertical_review_open_h2_continuation
before insert on public.vertical_review_outcomes
for each row execute function public.guard_vertical_review_against_open_h2_continuation_v1();

-- Keep H3 discovery fail-closed while a deferred H2 is explicitly being
-- reconsidered. Once a new H2 closes the continuation, the newest outcome is
-- again the candidate and the earlier defer remains historical evidence.
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
      and not exists (
        select 1 from public.team_review_deferred_continuations continuation
        where continuation.source_outcome_id = team_outcome.id
          and continuation.completed_by_outcome_id is null
      )
    order by team_outcome.review_case_id, team_outcome.proposal_ref, team_outcome.recorded_at desc, team_outcome.id desc
  ) candidate;

  return v_result;
end;
$$;

revoke all on function public.list_vertical_review_candidates_v1(uuid,text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.list_vertical_review_candidates_v1(uuid,text,text,text,text)
  to authenticated;

comment on table public.team_review_deferred_continuations is
'Append-only link from a deferred H2 outcome to an explicitly opened professional continuation and its later H2 outcome. It never creates institutional authority.';
comment on table public.team_review_contribution_history is
'Immutable snapshot of current professional contributions archived before a deferred H2 continuation starts; prior contributions are never carried forward.';
