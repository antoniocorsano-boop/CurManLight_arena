-- CurManLight Arena Beta — destructive-safe multi-actor shared review smoke.
--
-- Run only against an isolated/Beta database with at least one active workspace
-- containing exactly two active professional participants. The smoke temporarily
-- promotes one participant to Dipartimento and creates provisional Technology
-- operational profiles, but every mutation is enclosed in a transaction and
-- ROLLBACK is mandatory. It exercises the real RPCs and table guards.

begin;

do $$
declare
  v_workspace uuid;
  v_coordinator uuid;
  v_teacher uuid;
  v_case_id constant text := 'CRC:SMOKE:MULTI-ACTOR-SHARED-REVIEW';
  v_proposal_ref constant text := 'smoke-proposal';
  v_fingerprint constant text := 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  v_publish jsonb;
  v_assigned jsonb;
  v_outcome jsonb;
  v_before_institutional integer;
  v_after_institutional integer;
  v_case_rows integer;
  v_assignment_rows integer;
  v_contribution_rows integer;
  v_outcome_rows integer;
  v_blocked boolean;
begin
  select membership.workspace_id
  into v_workspace
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.status = 'active'
    and membership.role in ('docente','dipartimento','referente')
    and workspace.status = 'active'
  group by membership.workspace_id
  having count(*) = 2
  order by membership.workspace_id
  limit 1;

  if v_workspace is null then
    raise exception 'SMOKE_REQUIRES_EXACTLY_TWO_ACTIVE_PARTICIPANTS';
  end if;

  select user_id into v_coordinator
  from public.workspace_memberships
  where workspace_id = v_workspace
    and status = 'active'
    and role in ('docente','dipartimento','referente')
  order by user_id
  limit 1;

  select user_id into v_teacher
  from public.workspace_memberships
  where workspace_id = v_workspace
    and status = 'active'
    and role in ('docente','dipartimento','referente')
    and user_id <> v_coordinator
  order by user_id
  limit 1;

  if v_coordinator is null or v_teacher is null then
    raise exception 'SMOKE_TWO_ACTORS_NOT_RESOLVED';
  end if;

  select count(*)::integer into v_before_institutional
  from public.institutional_revision_decisions
  where workspace_id = v_workspace;

  update public.workspace_memberships
  set role = 'dipartimento'
  where workspace_id = v_workspace and user_id = v_coordinator;

  insert into public.team_operational_memberships(
    user_id, academic_year, school_order, group_code, member_role,
    membership_state, disciplines, updated_at
  ) values
    (v_coordinator, '2026/2027', 'secondaria', 'S-G02', 'docente', 'OPERATIVO_PROVVISORIO', array['tecnologia'], now()),
    (v_teacher, '2026/2027', 'secondaria', 'S-G02', 'docente', 'OPERATIVO_PROVVISORIO', array['tecnologia'], now())
  on conflict (user_id, academic_year, group_code)
  do update set
    school_order = excluded.school_order,
    member_role = 'docente',
    membership_state = 'OPERATIVO_PROVVISORIO',
    disciplines = excluded.disciplines,
    updated_at = now();

  perform set_config('request.jwt.claim.sub', v_coordinator::text, true);

  select public.publish_curriculum_review_case_v1(
    v_workspace,
    '2026/2027',
    'S-G02',
    'tecnologia',
    v_case_id,
    'secondaria',
    '1',
    'CAN-CURR-MASTER-00:1.3:secondaria:1:tecnologia',
    'CAN-CURR-MASTER-00',
    '12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4',
    '1.3',
    'RT:SMOKE:MULTI-ACTOR-SHARED-REVIEW',
    'INSTITUTE_NEED',
    'EXPLICIT_INSTITUTE_NEED',
    '2026-09-07T05:00:00Z'::timestamptz,
    array[v_proposal_ref],
    'Smoke tecnico multi-attore; nessuna decisione istituzionale.',
    '2026-09-07T05:01:00Z'::timestamptz,
    v_coordinator,
    'dipartimento'
  ) into v_publish;

  if coalesce((v_publish->>'assignment_count')::integer, 0) <> 2 then
    raise exception 'SMOKE_ASSIGNMENT_COUNT_MISMATCH:%', v_publish;
  end if;

  perform set_config('request.jwt.claim.sub', v_teacher::text, true);

  select public.list_my_assigned_curriculum_review_cases_v1(
    v_workspace, '2026/2027', 'S-G02', 'tecnologia'
  ) into v_assigned;

  if not exists (
    select 1
    from jsonb_array_elements(v_assigned) item
    where item->>'case_id' = v_case_id
      and item->>'assignment_state' = 'ASSIGNED'
  ) then
    raise exception 'SMOKE_ASSIGNED_CASE_NOT_DISCOVERED:%', v_assigned;
  end if;

  -- Unpublished case identity must fail closed.
  v_blocked := false;
  begin
    perform public.upsert_team_review_contribution_v3(
      v_workspace, '2026/2027', 'S-G02', 'tecnologia',
      'CRC:SMOKE:UNASSIGNED', v_proposal_ref, v_fingerprint,
      'confirm-proposal', null
    );
  exception when others then
    if position('SHARED_REVIEW_CASE_SCOPE_REQUIRED' in sqlerrm) > 0 then
      v_blocked := true;
    else
      raise;
    end if;
  end;
  if not v_blocked then
    raise exception 'SMOKE_UNASSIGNED_CASE_WRITE_ACCEPTED';
  end if;

  -- A proposal outside the frozen case scope must also fail closed.
  v_blocked := false;
  begin
    perform public.upsert_team_review_contribution_v3(
      v_workspace, '2026/2027', 'S-G02', 'tecnologia',
      v_case_id, 'smoke-outside-scope', v_fingerprint,
      'confirm-proposal', null
    );
  exception when others then
    if position('SHARED_REVIEW_CASE_SCOPE_REQUIRED' in sqlerrm) > 0 then
      v_blocked := true;
    else
      raise;
    end if;
  end;
  if not v_blocked then
    raise exception 'SMOKE_OUTSIDE_SCOPE_WRITE_ACCEPTED';
  end if;

  -- Teacher contributes to the assigned case.
  perform public.upsert_team_review_contribution_v3(
    v_workspace, '2026/2027', 'S-G02', 'tecnologia',
    v_case_id, v_proposal_ref, v_fingerprint,
    'confirm-proposal', null
  );

  -- Coordinator cannot record a non-deferred outcome with only 1/2 coverage.
  perform set_config('request.jwt.claim.sub', v_coordinator::text, true);
  v_blocked := false;
  begin
    perform public.record_team_review_outcome_v3(
      v_workspace, '2026/2027', 'S-G02', 'tecnologia',
      v_case_id, v_proposal_ref, v_fingerprint,
      'accept-proposal', null,
      'Smoke: copertura incompleta deve bloccare.',
      'smoke-incomplete-coverage'
    );
  exception when others then
    if position('TEAM_REVIEW_COVERAGE_INCOMPLETE' in sqlerrm) > 0 then
      v_blocked := true;
    else
      raise;
    end if;
  end;
  if not v_blocked then
    raise exception 'SMOKE_INCOMPLETE_COVERAGE_OUTCOME_ACCEPTED';
  end if;

  -- Coordinator contributes to the same assigned case, reaching 2/2.
  perform public.upsert_team_review_contribution_v3(
    v_workspace, '2026/2027', 'S-G02', 'tecnologia',
    v_case_id, v_proposal_ref, v_fingerprint,
    'confirm-proposal', null
  );

  select public.record_team_review_outcome_v3(
    v_workspace, '2026/2027', 'S-G02', 'tecnologia',
    v_case_id, v_proposal_ref, v_fingerprint,
    'accept-proposal', null,
    'Smoke: entrambi i contributi case-scoped sono correnti.',
    'smoke-complete-coverage'
  ) into v_outcome;

  if v_outcome->>'review_case_id' <> v_case_id
    or v_outcome->>'proposal_ref' <> v_proposal_ref
    or v_outcome->>'outcome' <> 'accept-proposal'
  then
    raise exception 'SMOKE_OUTCOME_RECEIPT_MISMATCH:%', v_outcome;
  end if;

  select count(*)::integer into v_case_rows
  from public.shared_curriculum_review_cases
  where workspace_id = v_workspace and case_id = v_case_id;
  select count(*)::integer into v_assignment_rows
  from public.shared_curriculum_review_case_assignments
  where workspace_id = v_workspace and case_id = v_case_id and assignment_state = 'ASSIGNED';
  select count(*)::integer into v_contribution_rows
  from public.team_review_contributions
  where workspace_id = v_workspace and review_case_id = v_case_id and proposal_ref = v_proposal_ref;
  select count(*)::integer into v_outcome_rows
  from public.team_review_outcomes
  where workspace_id = v_workspace and review_case_id = v_case_id and proposal_ref = v_proposal_ref;

  if v_case_rows <> 1 or v_assignment_rows <> 2 or v_contribution_rows <> 2 or v_outcome_rows <> 1 then
    raise exception 'SMOKE_PERSISTED_CHAIN_MISMATCH:case=% assignments=% contributions=% outcomes=%',
      v_case_rows, v_assignment_rows, v_contribution_rows, v_outcome_rows;
  end if;

  select count(*)::integer into v_after_institutional
  from public.institutional_revision_decisions
  where workspace_id = v_workspace;

  if v_after_institutional <> v_before_institutional then
    raise exception 'SMOKE_INSTITUTIONAL_BOUNDARY_VIOLATED';
  end if;
end;
$$;

rollback;

select jsonb_build_object(
  'status', 'MULTI_ACTOR_SHARED_REVIEW_SMOKE_PASS',
  'persisted_case_rows', (
    select count(*) from public.shared_curriculum_review_cases
    where case_id = 'CRC:SMOKE:MULTI-ACTOR-SHARED-REVIEW'
  ),
  'persisted_assignment_rows', (
    select count(*) from public.shared_curriculum_review_case_assignments
    where case_id = 'CRC:SMOKE:MULTI-ACTOR-SHARED-REVIEW'
  ),
  'persisted_contribution_rows', (
    select count(*) from public.team_review_contributions
    where review_case_id = 'CRC:SMOKE:MULTI-ACTOR-SHARED-REVIEW'
  ),
  'persisted_outcome_rows', (
    select count(*) from public.team_review_outcomes
    where review_case_id = 'CRC:SMOKE:MULTI-ACTOR-SHARED-REVIEW'
  )
) as smoke_result;
