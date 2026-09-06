import { describe, expect, it } from 'vitest';
import {
  deriveTeamReviewSummary,
  type TeamReviewContribution,
  type TeamReviewProposalDescriptor,
} from '../domain/revision/teamReview';

const proposalFingerprint = 'a'.repeat(64);
const scope = {
  academicYear: '2026/2027',
  order: 'secondaria' as const,
  groupCode: 'S-G02' as const,
  discipline: 'tecnologia',
};

const proposal: TeamReviewProposalDescriptor = {
  ...scope,
  proposalRef: 'sec-tec-ii-001',
  focus: 'Tecnologia — classe seconda',
  proposalFingerprint,
};

const contribution = (
  userId: string,
  overrides: Partial<TeamReviewContribution> = {},
): TeamReviewContribution => ({
  ...scope,
  workspaceId: '11111111-1111-4111-8111-111111111111',
  proposalRef: proposal.proposalRef,
  proposalFingerprint,
  contributorUserId: userId,
  contributorRole: 'docente',
  orientation: 'confirm-proposal',
  customText: null,
  updatedAt: '2026-09-04T16:00:00.000Z',
  ...overrides,
});

describe('Arena operational discipline-group scope', () => {
  it('allows a provisional professional sharing result when all competent contributors have participated', () => {
    const summary = deriveTeamReviewSummary(
      [proposal],
      [contribution('u1'), contribution('u2')],
      2,
    );

    expect(summary.shared).toBe(1);
    expect(summary.needsClarification).toBe(0);
    expect(summary.items[0].coverageComplete).toBe(true);
  });

  it('never counts contributions from another discipline or group toward the current scope', () => {
    const summary = deriveTeamReviewSummary(
      [proposal],
      [
        contribution('u1'),
        contribution('u2', { discipline: 'scienze' }),
        contribution('u3', { groupCode: 'S-G01', discipline: 'italiano' }),
      ],
      2,
    );

    expect(summary.shared).toBe(0);
    expect(summary.needsClarification).toBe(1);
    expect(summary.items[0].contributionCount).toBe(1);
    expect(summary.items[0].coverageComplete).toBe(false);
  });

  it('keeps a point open when the discipline denominator is not available', () => {
    const summary = deriveTeamReviewSummary([proposal], [contribution('u1')], null);
    expect(summary.shared).toBe(0);
    expect(summary.items[0].bucket).toBe('needs-clarification');
  });
});
