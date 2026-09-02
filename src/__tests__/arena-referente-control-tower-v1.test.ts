import { describe, expect, it } from 'vitest';
import type { CurriculumMap } from '../features/session/types/appViewContracts';
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

const asCurriculum = (value: Record<string, unknown>): CurriculumMap => value as unknown as CurriculumMap;

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

  it('derives review and known decision readiness from canonical states', () => {
    const proposals = [
      { id: 'p1', status: 'draft' },
      { id: 'p2', status: 'under-review' },
      { id: 'p3', status: 'changes-requested' },
      { id: 'p4', status: 'accepted-for-decision' },
      { id: 'p5', status: 'archived' },
      { id: 'p6', status: 'legacy' },
    ] as RevisionArchive['proposals'];
    const decisions = [
      { id: 'd1', status: 'recorded-local', outcome: 'defer', proposalRef: { id: 'p2' } },
      { id: 'd2', status: 'draft', outcome: 'approve', proposalRef: { id: 'p3' } },
    ] as RevisionArchive['decisions'];

    const snapshot = deriveReferenteControlTowerSnapshot([], archive({ proposals, decisions }), new Set());
    expect(snapshot.proposalTotal).toBe(6);
    expect(snapshot.proposalActive).toBe(4);
    expect(snapshot.proposalInReview).toBe(2);
    expect(snapshot.proposalAcceptedForDecision).toBe(1);
    expect(snapshot.proposalReadyForDecision).toBe(1);
    expect(snapshot.decisionReceiptCoverageAvailable).toBe(true);
    expect(snapshot.decisionsRecordedLocal).toBe(1);
  });

  it('removes a locally terminally decided proposal from ready-for-decision', () => {
    const proposals = [{ id: 'p1', status: 'accepted-for-decision' }] as RevisionArchive['proposals'];
    const decisions = [{
      id: 'd1',
      status: 'recorded-local',
      outcome: 'approve',
      proposalRef: { id: 'p1' },
    }] as RevisionArchive['decisions'];

    const snapshot = deriveReferenteControlTowerSnapshot([], archive({ proposals, decisions }));
    expect(snapshot.proposalReadyForDecision).toBe(0);
    expect(snapshot.decisionReceiptCoverageAvailable).toBe(true);
  });

  it('fails closed when institutional receipt coverage is unavailable', () => {
    const proposals = [{ id: 'p1', status: 'accepted-for-decision' }] as RevisionArchive['proposals'];
    const snapshot = deriveReferenteControlTowerSnapshot([], archive({ proposals }));

    expect(snapshot.proposalReadyForDecision).toBeNull();
    expect(snapshot.decisionReceiptCoverageAvailable).toBe(false);
  });

  it('removes a proposal with a known terminal institutional receipt', () => {
    const proposals = [{ id: 'p1', status: 'accepted-for-decision' }] as RevisionArchive['proposals'];
    const snapshot = deriveReferenteControlTowerSnapshot([], archive({ proposals }), new Set(['p1']));

    expect(snapshot.proposalReadyForDecision).toBe(0);
    expect(snapshot.decisionReceiptCoverageAvailable).toBe(true);
  });

  it('fails closed on discipline/order coverage rather than inferring scope from labels', () => {
    const snapshot = deriveReferenteControlTowerSnapshot([], archive({
      proposals: [{ id: 'p1', status: 'under-review', targetNodeRef: { id: 'node-1', snapshotLabel: 'Tecnologia secondaria' } }] as RevisionArchive['proposals'],
    }));

    expect(snapshot.disciplineCoverageAvailable).toBe(false);
    expect(snapshot.curriculumTargetTotal).toBeNull();
    expect(snapshot.scopeNote).toMatch(/CurriculumMap concreta/i);
  });

  it('computes whole-school discipline/order coverage from explicit curriculum data', () => {
    const snapshot = deriveReferenteControlTowerSnapshot(
      [],
      archive(),
      null,
      asCurriculum({
        tecnologia: {
          primaria: { traguardi: ['T1'], obiettivi: ['O1'], evidenze: [] },
          secondaria: { traguardi: ['T2'], obiettivi: ['O2'], evidenze: [] },
        },
      }),
    );

    expect(snapshot.disciplineCoverageAvailable).toBe(true);
    expect(snapshot.curriculumTargetTotal).toBeGreaterThan(2);
    expect(snapshot.curriculumCoverageTargets).toBe(2);
    expect(snapshot.curriculumGapTargets).toBe((snapshot.curriculumTargetTotal ?? 0) - 2);
    expect(snapshot.scopeNote).toMatch(/deterministicamente/i);
  });
});