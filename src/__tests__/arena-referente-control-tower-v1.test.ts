import { describe, expect, it } from 'vitest';
import { deriveReferenteControlTowerSnapshot } from '../domain/institution/referenteControlTower';
import type { RevisionArchive } from '../domain/revision/types';

const archive = (overrides: Partial<RevisionArchive> = {}): RevisionArchive => ({
  schemaVersion: 1,
  updatedAt: '2026-09-01T00:00:00.000Z',
  proposals: [],
  versions: [],
  decisions: [],
  effects: [],
  events: [],
  ...overrides,
});

describe('R4 Referente Control Tower v1', () => {
  it('counts only explicit source lifecycle/evidence states', () => {
    const snapshot = deriveReferenteControlTowerSnapshot([
      { authorityStatus: 'LOCAL_UNVERIFIED', evidenceEligibility: 'CONSULT_ONLY' },
      { authorityStatus: 'LOCAL_VERIFIED', evidenceEligibility: 'LOCAL_EVIDENCE' },
      { authorityStatus: 'LOCAL_VERIFIED', evidenceEligibility: 'CONSULT_ONLY' },
    ], archive());

    expect(snapshot.sourceTotal).toBe(3);
    expect(snapshot.sourcePendingVerification).toBe(1);
    expect(snapshot.sourceLocalEvidence).toBe(1);
  });

  it('derives review and decision readiness only from canonical proposal statuses', () => {
    const proposals = [
      { id: 'p1', status: 'draft' },
      { id: 'p2', status: 'under-review' },
      { id: 'p3', status: 'changes-requested' },
      { id: 'p4', status: 'accepted-for-decision' },
      { id: 'p5', status: 'archived' },
      { id: 'p6', status: 'legacy' },
    ] as RevisionArchive['proposals'];
    const decisions = [
      { id: 'd1', status: 'recorded-local' },
      { id: 'd2', status: 'draft' },
    ] as RevisionArchive['decisions'];

    const snapshot = deriveReferenteControlTowerSnapshot([], archive({ proposals, decisions }));
    expect(snapshot.proposalTotal).toBe(6);
    expect(snapshot.proposalActive).toBe(4);
    expect(snapshot.proposalInReview).toBe(2);
    expect(snapshot.proposalReadyForDecision).toBe(1);
    expect(snapshot.decisionsRecordedLocal).toBe(1);
  });

  it('fails closed on discipline/order coverage rather than inferring scope from labels', () => {
    const snapshot = deriveReferenteControlTowerSnapshot([], archive({
      proposals: [{ id: 'p1', status: 'under-review', targetNodeRef: { id: 'node-1', snapshotLabel: 'Tecnologia secondaria' } }] as RevisionArchive['proposals'],
    }));

    expect(snapshot.disciplineCoverageAvailable).toBe(false);
    expect(snapshot.scopeNote).toMatch(/non una percentuale affidabile/i);
  });
});
