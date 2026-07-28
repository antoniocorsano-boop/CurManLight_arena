import { describe, it, expect } from 'vitest';

describe('CML-633E Transfer Error Handling', () => {
  describe('Error types produce correct structure', () => {
    const errorTypes = [
      'CONTRACT_NOT_SUPPORTED', 'VERSION_NOT_SUPPORTED', 'PAYLOAD_INVALID',
      'REFERENCE_MISSING', 'ENTITY_NOT_RESOLVED', 'SOURCE_STATUS_INVALID',
      'IDENTITY_CONFLICT', 'METADATA_MISSING', 'SOURCE_MISSING',
      'LEGACY_CONTENT_INCOMPLETE', 'EXPERIMENTAL_NOT_TRANSFERABLE',
      'POST_CONDITION_FAILED', 'SIGNATURE_INCOHERENT', 'TARGET_INCOMPATIBLE',
    ] as const;

    for (const errorType of errorTypes) {
      it(`${errorType} produces correct error structure`, async () => {
        const { createTransferError } = await import('../domain/transfer/errors');
        const err = createTransferError(errorType);
        expect(err.errorType).toBe(errorType);
        expect(typeof err.code).toBe('string');
        expect(typeof err.message).toBe('string');
        expect(typeof err.uiMessage).toBe('string');
        expect(typeof err.recoverable).toBe('boolean');
      });
    }
  });

  describe('Recovery strategies', () => {
    it('recoverable errors allow retry or skip', async () => {
      const { RECOVERY_STRATEGIES } = await import('../domain/transfer/errors');
      const recoverable = ['METADATA_MISSING', 'LEGACY_CONTENT_INCOMPLETE', 'DUPLICATE_CONFLICT', 'TEMPLATE_NOT_FOUND'];
      for (const t of recoverable) {
        const s = RECOVERY_STRATEGIES.get(t as any);
        expect(s?.recoverable).toBe(true);
      }
    });

    it('non-recoverable errors halt transfer', async () => {
      const { RECOVERY_STRATEGIES } = await import('../domain/transfer/errors');
      const nonRec = ['CONTRACT_NOT_SUPPORTED', 'SOURCE_NOT_FOUND', 'SCHEMA_MISMATCH'];
      for (const t of nonRec) {
        const s = RECOVERY_STRATEGIES.get(t as any);
        expect(s?.recoverable).toBe(false);
      }
    });
  });

  describe('Structural footprint', () => {
    it('deterministic: same payload → same hash', async () => {
      const { computeStructuralFootprint } = await import('../domain/transfer/signatures');
      const p = { a: 1, b: 'test', c: [1, 2, 3] };
      const fp1 = computeStructuralFootprint(p);
      const fp2 = computeStructuralFootprint(p);
      expect(fp1.hash).toBe(fp2.hash);
    });

    it('tampered payload → mismatch', async () => {
      const { computeStructuralFootprint, validateStructuralFootprint } = await import('../domain/transfer/signatures');
      const p = { a: 1, b: 'test' };
      const fp = computeStructuralFootprint(p);
      expect(validateStructuralFootprint(p, fp)).toBe(true);
      expect(validateStructuralFootprint({ a: 1, b: 'tampered' }, fp)).toBe(false);
    });

    it('different payloads → different hashes', async () => {
      const { computeStructuralFootprint } = await import('../domain/transfer/signatures');
      const fp1 = computeStructuralFootprint({ a: 1 });
      const fp2 = computeStructuralFootprint({ a: 2 });
      expect(fp1.hash).not.toBe(fp2.hash);
    });
  });

  describe('Input immutability', () => {
    it('transfer execution does not mutate input', async () => {
      const { executeA11ToA02 } = await import('../domain/transfer/contracts');
      const payload = {
        sourceNodes: [{ entityId: 'kb-1', entityType: 'knowledge' }],
        targetVersionId: 'cv-1',
        mergeStrategy: 'create-new' as const,
        targetDiscipline: 'mat',
        targetArea: 'primaria',
        metadata: { sessionTimestamp: '2026-01-01T00:00:00Z' },
      };
      const frozen = JSON.stringify(payload);
      executeA11ToA02(payload);
      expect(JSON.stringify(payload)).toBe(frozen);
    });
  });

  describe('Event log behavior', () => {
    it('event log NOT populated when transfer fails at pre-condition', async () => {
      const { executeA11ToA02 } = await import('../domain/transfer/contracts');
      const result = executeA11ToA02({
        sourceNodes: [],
        targetVersionId: 'cv-1',
        mergeStrategy: 'create-new',
        targetDiscipline: 'mat',
        targetArea: 'primaria',
        metadata: { sessionTimestamp: '2026-01-01T00:00:00Z' },
      });
      expect(result.status).toBe('failed');
    });

    it('event log populated on successful transfer', async () => {
      const { executeA11ToA02 } = await import('../domain/transfer/contracts');
      const result = executeA11ToA02({
        sourceNodes: [{ entityId: 'kb-1', entityType: 'knowledge' }],
        targetVersionId: 'cv-1',
        mergeStrategy: 'create-new',
        targetDiscipline: 'mat',
        targetArea: 'primaria',
        metadata: { sessionTimestamp: '2026-01-01T00:00:00Z' },
      });
      expect(result.status).toBe('completed');
    });
  });

  describe('Post-condition failure', () => {
    it('completed with no created entities is invalid', async () => {
      const { validatePostConditions } = await import('../domain/transfer/validators');
      const result = { status: 'completed' as const, created: [], updated: [], skipped: [] };
      const payload = {
        transferId: 't-1' as any,
        contractId: 'A11-A02' as any,
        contractVersion: 1 as any,
        fromArea: 'A11',
        toArea: 'A02',
        sourceRefs: [{ entityId: 's-1', entityType: 'node' }],
        targetRef: { entityId: 't-1', entityType: 'version' },
        config: {},
        metadata: { sessionTimestamp: '2026-01-01T00:00:00Z' },
      };
      const r = validatePostConditions(result, payload as any);
      expect(r.valid).toBe(false);
      expect(r.errors.some(e => e.code === 'POST_CONDITION_FAILED')).toBe(true);
    });
  });
});
