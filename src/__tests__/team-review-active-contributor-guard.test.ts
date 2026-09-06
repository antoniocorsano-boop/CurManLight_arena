import { describe, expect, it } from 'vitest';
import migration from '../../supabase/migrations/20260906062000_team_review_active_contributor_guard.sql?raw';

describe('team review active contributor coverage guard', () => {
  it('exposes current contributions only when the contributor is still active and eligible', () => {
    expect(migration).toContain('contributor.user_id = team_review_contributions.contributor_user_id');
    expect(migration).toContain("contributor.status = 'active'");
    expect(migration).toContain("contributor.role in ('docente', 'dipartimento', 'referente')");
  });

  it('still requires the requesting user to be an active member of an active workspace', () => {
    expect(migration).toContain('requester.user_id = auth.uid()');
    expect(migration).toContain("requester.status = 'active'");
    expect(migration).toContain("w.status = 'active'");
  });
});
