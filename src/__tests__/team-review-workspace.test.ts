import { describe, expect, it } from 'vitest';
import {
  deriveTeamReviewSummary,
  fingerprintTeamReviewProposal,
  type TeamReviewContribution,
  type TeamReviewProposalDescriptor,
} from '../domain/revision/teamReview';

const fingerprint = (digit: string) => digit.repeat(64);

const proposals: TeamReviewProposalDescriptor[] = [
  { proposalRef: 'p-shared', focus: 'Punto condiviso', proposalFingerprint: fingerprint('1') },
  { proposalRef: 'p-change', focus: 'Modifica proposta', proposalFingerprint: fingerprint('2') },
  { proposalRef: 'p-divergent', focus: 'Opinioni diverse', proposalFingerprint: fingerprint('3') },
  { proposalRef: 'p-clarify', focus: 'Da chiarire', proposalFingerprint: fingerprint('4') },
];

const contribution = (
  proposalRef: string,
  proposalFingerprint: string,
  contributorUserId: string,
  orientation: TeamReviewContribution['orientation'],
  customText: string | null = null,
): TeamReviewContribution => ({
  workspaceId: '11111111-1111-4111-8111-111111111111',
  proposalRef,
  proposalFingerprint,
  contributorUserId,
  contributorRole: 'docente',
  orientation,
  customText,
  updatedAt: '2026-09-04T08:30:00.000Z',
});

describe('Arena team review synthesis', () => {
  it('separates shared points, proposed changes, divergences and stale/missing contributions', () => {
    const contributions: TeamReviewContribution[] = [
      contribution('p-shared', fingerprint('1'), 'u1', 'confirm-proposal'),
      contribution('p-shared', fingerprint('1'), 'u2', 'confirm-proposal'),
      contribution('p-change', fingerprint('2'), 'u1', 'propose-change', 'Testo condivisibile'),
      contribution('p-change', fingerprint('2'), 'u2', 'propose-change', 'Testo   condivisibile'),
      contribution('p-divergent', fingerprint('3'), 'u1', 'confirm-proposal'),
      contribution('p-divergent', fingerprint('3'), 'u2', 'keep-previous'),
      contribution('p-clarify', fingerprint('9'), 'u1', 'confirm-proposal'),
    ];

    const summary = deriveTeamReviewSummary(proposals, contributions, 2);

    expect(summary.total).toBe(4);
    expect(summary.shared).toBe(1);
    expect(summary.changeProposed).toBe(1);
    expect(summary.divergent).toBe(1);
    expect(summary.needsClarification).toBe(1);
    expect(summary.items.find((item) => item.proposalRef === 'p-shared')?.coverageComplete).toBe(true);
    expect(summary.items.find((item) => item.proposalRef === 'p-clarify')?.staleContributionCount).toBe(1);
  });

  it('never treats one unanimous contribution as full-team sharing when more contributors are expected', () => {
    const summary = deriveTeamReviewSummary(
      [{ proposalRef: 'p1', focus: 'P1', proposalFingerprint: fingerprint('a') }],
      [contribution('p1', fingerprint('a'), 'u1', 'confirm-proposal')],
      3,
    );

    expect(summary.shared).toBe(0);
    expect(summary.needsClarification).toBe(1);
    expect(summary.items[0].coverageComplete).toBe(false);
    expect(summary.items[0].contributionCount).toBe(1);
    expect(summary.items[0].expectedContributorCount).toBe(3);
  });

  it('never treats a one-person workspace as team consensus', () => {
    const summary = deriveTeamReviewSummary(
      [{ proposalRef: 'p1', focus: 'P1', proposalFingerprint: fingerprint('a') }],
      [contribution('p1', fingerprint('a'), 'u1', 'confirm-proposal')],
      1,
    );

    expect(summary.shared).toBe(0);
    expect(summary.needsClarification).toBe(1);
    expect(summary.items[0].coverageComplete).toBe(false);
    expect(summary.items[0].contributionCount).toBe(1);
    expect(summary.items[0].expectedContributorCount).toBe(1);
  });

  it('does not treat different custom formulations as consensus', () => {
    const summary = deriveTeamReviewSummary(
      [{ proposalRef: 'p1', focus: 'P1', proposalFingerprint: fingerprint('a') }],
      [
        contribution('p1', fingerprint('a'), 'u1', 'propose-change', 'Prima formulazione'),
        contribution('p1', fingerprint('a'), 'u2', 'propose-change', 'Seconda formulazione'),
      ],
      2,
    );

    expect(summary.divergent).toBe(1);
    expect(summary.changeProposed).toBe(0);
  });

  it('fingerprints the complete visible proposal and changes when the text changes', async () => {
    const base = await fingerprintTeamReviewProposal({
      proposalRef: 'p1',
      focus: 'Tecnologia — classe prima',
      oldText: 'Testo precedente',
      newText: 'Proposta aggiornata',
    });
    const same = await fingerprintTeamReviewProposal({
      proposalRef: 'p1',
      focus: 'Tecnologia — classe prima',
      oldText: 'Testo precedente',
      newText: 'Proposta aggiornata',
    });
    const changed = await fingerprintTeamReviewProposal({
      proposalRef: 'p1',
      focus: 'Tecnologia — classe prima',
      oldText: 'Testo precedente',
      newText: 'Proposta aggiornata e modificata',
    });

    expect(base).toMatch(/^[0-9a-f]{64}$/);
    expect(same).toBe(base);
    expect(changed).not.toBe(base);
  });
});
