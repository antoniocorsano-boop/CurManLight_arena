-- Fix the generic trigger actor lookup across contributions and outcomes.
-- NEW is a polymorphic record; to_jsonb avoids referencing a field that does
-- not exist on the current trigger table.

create or replace function public.assert_shared_review_case_assignment_scope_v1()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_actor uuid;
  v_row jsonb := to_jsonb(new);
begin
  if new.review_case_id is null then
    return new;
  end if;

  v_actor := coalesce(
    nullif(v_row->>'contributor_user_id', '')::uuid,
    nullif(v_row->>'recorded_by_user_id', '')::uuid
  );

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
