import { describe, expect, it } from 'vitest';
import guardMigration from '../../supabase/migrations/20260907071500_team_review_case_assignment_authority.sql?raw';
import discoveryMigration from '../../supabase/migrations/20260907064000_shared_curriculum_review_case_discovery.sql?raw';
import caseScopeMigration from '../../supabase/migrations/20260907043000_team_review_case_scope.sql?raw';

describe('shared CurriculumReviewCase server authority', () => {
  it('binds case-scoped writes to a published assigned case and its frozen proposal scope', () => {
    for (const token of [
      'assert_shared_review_case_assignment_scope_v1',
      'shared_curriculum_review_cases',
      'shared_curriculum_review_case_assignments',
      "case_status = 'ASSIGNED_FOR_PROFESSIONAL_REVIEW'",
      'new.proposal_ref = any(review_case.targeted_proposal_refs)',
      "assignment.assignment_state = 'ASSIGNED'",
      'SHARED_REVIEW_CASE_SCOPE_REQUIRED',
      'SHARED_REVIEW_CASE_ASSIGNMENT_REQUIRED',
      'team_review_contributions_case_assignment_guard',
      'team_review_outcomes_case_assignment_guard',
    ]) expect(guardMigration).toContain(token);
  });

  it('preserves general review while protecting SECURITY DEFINER case-scoped writes at table level', () => {
    expect(guardMigration).toContain('if new.review_case_id is null then');
    expect(guardMigration).toContain('before insert or update on public.team_review_contributions');
    expect(guardMigration).toContain('before insert or update on public.team_review_outcomes');
    expect(caseScopeMigration).toContain('upsert_team_review_contribution_v3');
    expect(caseScopeMigration).toContain('record_team_review_outcome_v3');
  });

  it('keeps discovery and assignment as the authority source for the guard', () => {
    expect(discoveryMigration).toContain('create table if not exists public.shared_curriculum_review_cases');
    expect(discoveryMigration).toContain('create table if not exists public.shared_curriculum_review_case_assignments');
    expect(discoveryMigration).toContain('publish_curriculum_review_case_v1');
    expect(discoveryMigration).toContain('list_my_assigned_curriculum_review_cases_v1');
  });
});
