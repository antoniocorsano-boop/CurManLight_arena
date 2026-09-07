-- CurManLight Arena — case-scoped team review authority hardening.
--
-- A case-scoped ProfessionalContribution or TeamProfessionalOutcome is valid
-- only when it belongs to a server-published CurriculumReviewCase, the proposal
-- is inside the frozen case scope, and the acting user has an active assignment
-- for that same case. General/pre-case rows (review_case_id IS NULL) are not
-- changed by this guard.

create or replace function public.assert_shared_review_case_assignment_scope_v1()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_actor uuid;
begin
  if new.review_case_id is null then
    return new;
  end if;

  v_actor := case
    when tg_table_name = 'team_review_contributions' then new.contributor_user_id
    when tg_table_name = 'team_review_outcomes' then new.recorded_by_user_id
    else null
  end;

  if v_actor is null then
    raise exception 'SHARED_REVIEW_CASE_ACTOR_REQUIRED' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.shared_curriculum_review_cases review_case
    where review_case.workspace_id = new.workspace_id
      and review_case.case_id = new.review_case_id
      and review_case.academic_year = new.academic_year
      and review_case.group_code = new.group_code
      and review_case.discipline = new.discipline
      and review_case.case_status = 'ASSIGNED_FOR_PROFESSIONAL_REVIEW'
      and new.proposal_ref = any(review_case.targeted_proposal_refs)
  ) then
    raise exception 'SHARED_REVIEW_CASE_SCOPE_REQUIRED' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.shared_curriculum_review_case_assignments assignment
    where assignment.workspace_id = new.workspace_id
      and assignment.case_id = new.review_case_id
      and assignment.assigned_user_id = v_actor
      and assignment.assignment_state = 'ASSIGNED'
  ) then
    raise exception 'SHARED_REVIEW_CASE_ASSIGNMENT_REQUIRED' using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.assert_shared_review_case_assignment_scope_v1() from public, anon, authenticated;

-- Direct DML is already revoked from ordinary clients; these triggers also
-- protect writes performed by SECURITY DEFINER RPCs and future server paths.
drop trigger if exists team_review_contributions_case_assignment_guard
  on public.team_review_contributions;
create trigger team_review_contributions_case_assignment_guard
before insert or update on public.team_review_contributions
for each row
execute function public.assert_shared_review_case_assignment_scope_v1();

drop trigger if exists team_review_outcomes_case_assignment_guard
  on public.team_review_outcomes;
create trigger team_review_outcomes_case_assignment_guard
before insert or update on public.team_review_outcomes
for each row
execute function public.assert_shared_review_case_assignment_scope_v1();

comment on function public.assert_shared_review_case_assignment_scope_v1() is
'Fail-closed guard: case-scoped contributions/outcomes require an assigned shared CurriculumReviewCase and a proposal inside its frozen scope.';
