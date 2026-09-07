import { describe, expect, it } from 'vitest';
import migration from '../../supabase/migrations/20260907165500_fix_general_team_review_partial_conflict.sql?raw';
import repository from '../infrastructure/supabase/sharedTeamReviewRepository.ts?raw';

describe('general H1/H2 identity after case-scoped review', () => {
  it('binds the v2 upsert to the partial unique index for general contributions', () => {
    expect(migration).toContain('on conflict (workspace_id, proposal_ref, contributor_user_id)');
    expect(migration).toContain('where review_case_id is null');
    expect(migration).toContain('team_review_contributions');
  });

  it('keeps general H2 coverage separate from case-scoped contributions', () => {
    expect(migration).toContain('contribution.review_case_id is null');
    expect(migration).toContain('review_case_id, proposal_ref');
  });

  it('uses only the general contribution RPC from the general repository', () => {
    expect(repository).toContain("rpc('upsert_team_review_contribution_v2'");
    expect(repository).not.toContain("rpc('upsert_team_review_contribution_v3'");
  });
});
