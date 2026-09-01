import { describe, expect, it } from 'vitest';
import { createEmptyRevisionStore } from '../domain/revision/repository';
import { executeA02ToA03ProposalTransfer } from '../domain/revision/transferIntegration';

describe('R7A3 evidence reference normalization', () => {
  it('maps A02 evidence node ids to canonical curriculum-node references', () => {
    const result = executeA02ToA03ProposalTransfer({
      curriculumNodeRef: { entityId: 'node-1', entityType: 'curriculum-node' },
      curriculumVersionRef: { entityId: 'curriculum-v1', entityType: 'curriculum-version' },
      textSnapshot: 'Testo corrente',
      sources: ['source-1'],
      evidences: ['evidence-node-1'],
      contentOrigin: 'teacher',
      warnings: [],
      contractVersion: 1,
      structuralFootprint: '',
    }, createEmptyRevisionStore());

    expect(result.success).toBe(true);
    expect(result.proposal?.sourceRefs).toEqual([
      expect.objectContaining({ id: 'source-1', entityType: 'source' }),
    ]);
    expect(result.proposal?.evidenceRefs).toEqual([
      expect.objectContaining({ id: 'evidence-node-1', entityType: 'curriculum-node' }),
    ]);
    expect(result.proposal?.evidenceRefs.some(ref => ref.entityType === ('evidence' as never))).toBe(false);
  });
});
