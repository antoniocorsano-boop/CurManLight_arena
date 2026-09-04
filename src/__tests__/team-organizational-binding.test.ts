import { describe, expect, it } from 'vitest';
import {
  deriveTeamReviewSummary,
  type TeamReviewContribution,
  type TeamReviewProposalDescriptor,
} from '../domain/revision/teamReview';

const proposalFingerprint = 'a'.repeat(64);

const proposal: TeamReviewProposalDescriptor = {
  proposalRef: 'sec-tec-ii-001',
  focus: 'Tecnologia — classe seconda',
  proposalFingerprint,
};

const contribution = (userId: string): TeamReviewContribution => ({
  workspaceId: '11111111-1111-4111-8111-111111111111',
  proposalRef: proposal.proposalRef,
  proposalFingerprint,
  contributorUserId: userId,
  contributorRole: 'docente',
  orientation: 'confirm-proposal',
  customText: null,
  updatedAt: '2026-09-04T16:00:00.000Z',
});

describe('Arena institutional team binding', () => {
  it('never turns unanimous individual contributions into full-team sharing while the current institutional group is unbound', () => {
    const summary = deriveTeamReviewSummary(
      [proposal],
      [contribution('u1'), contribution('u2')],
      null,
    );

    expect(summary.shared).toBe(0);
    expect(summary.needsClarification).toBe(1);
    expect(summary.expectedContributorCount).toBeNull();
    expect(summary.items[0].coverageComplete).toBe(false);
    expect(summary.items[0].bucket).toBe('needs-clarification');
  });

  it('allows sharing only after an externally verified denominator is supplied', () => {
    const summary = deriveTeamReviewSummary(
      [proposal],
      [contribution('u1'), contribution('u2')],
      2,
    );

    expect(summary.shared).toBe(1);
    expect(summary.needsClarification).toBe(0);
    expect(summary.items[0].coverageComplete).toBe(true);
  });
});
