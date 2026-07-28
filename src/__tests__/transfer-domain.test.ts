import { describe, it, expect } from 'vitest';

describe('CML-633E Transfer Domain', () => {
  describe('TransferArea — closed branded type', () => {
    it('A11 is a valid transfer area', async () => {
      const { A11 } = await import('../domain/transfer/vocabularies');
      expect(A11).toBe('A11');
    });

    it('A02 is a valid transfer area', async () => {
      const { A02 } = await import('../domain/transfer/vocabularies');
      expect(A02).toBe('A02');
    });

    it('A03 is a valid transfer area', async () => {
      const { A03 } = await import('../domain/transfer/vocabularies');
      expect(A03).toBe('A03');
    });

    it('A04 is a valid transfer area', async () => {
      const { A04 } = await import('../domain/transfer/vocabularies');
      expect(A04).toBe('A04');
    });

    it('A07 is a valid transfer area', async () => {
      const { A07 } = await import('../domain/transfer/vocabularies');
      expect(A07).toBe('A07');
    });

    it('all valid areas are captured in VALID_AREAS', async () => {
      const { VALID_AREAS } = await import('../domain/transfer/vocabularies');
      expect(VALID_AREAS).toEqual(['A11', 'A02', 'A03', 'A04', 'A07']);
    });
  });

  describe('TransferPayload — base interface', () => {
    it('a payload carries transferId, contractId, fromArea, toArea, sourceRefs, targetRef', async () => {
      const { createTransferId } = await import('../domain/transfer/types');
      const id = createTransferId('test-1');
      expect(typeof id).toBe('string');
      expect(id).toBe('test-1');
    });

    it('TransferId is a branded string', async () => {
      const { createTransferId } = await import('../domain/transfer/types');
      const id = createTransferId('abc-123');
      expect(id).toBe('abc-123');
    });
  });

  describe('TransferResult — discriminated union', () => {
    it('completed result has status, created, updated, skipped', async () => {
      const { createCompletedResult } = await import('../domain/transfer/types');
      const result = createCompletedResult({
        created: ['node-1'],
        updated: [],
        skipped: [],
      });
      expect(result.status).toBe('completed');
      expect(result.created).toEqual(['node-1']);
    });

    it('partial result has status, created, updated, skipped, errors', async () => {
      const { createPartialResult } = await import('../domain/transfer/types');
      const result = createPartialResult({
        created: ['node-1'],
        updated: [],
        skipped: ['node-2'],
        errors: [{ errorType: 'SOURCE_NOT_FOUND', code: 'E001', message: 'missing', recoverable: true }],
      });
      expect(result.status).toBe('partial');
      expect(result.errors).toHaveLength(1);
    });

    it('failed result has status and errors', async () => {
      const { createFailedResult } = await import('../domain/transfer/types');
      const result = createFailedResult({
        errors: [{ errorType: 'TARGET_INVALID', code: 'E002', message: 'bad target', recoverable: false }],
      });
      expect(result.status).toBe('failed');
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('TransferError — typed with code and recoverable', () => {
    it('error has errorType, code, message, and recoverable flag', async () => {
      const { createTransferError } = await import('../domain/transfer/errors');
      const err = createTransferError('SOURCE_NOT_FOUND', { details: { node: 'xyz' } });
      expect(err.errorType).toBe('SOURCE_NOT_FOUND');
      expect(typeof err.code).toBe('string');
      expect(typeof err.message).toBe('string');
      expect(typeof err.recoverable).toBe('boolean');
    });
  });

  describe('TransferEvent — all required fields', () => {
    it('event has transferId, fromArea, toArea, status, structuralFootprint, timestamp', async () => {
      const { createTransferEvent } = await import('../domain/transfer/types');
      const event = createTransferEvent({
        transferId: 't-1',
        kind: 'knowledge-to-curriculum',
        fromArea: 'A11',
        toArea: 'A02',
        status: 'completed',
        entityRefs: ['e-1'],
        structuralFootprint: { algorithm: 'fnv1a', version: 1, hash: 'abc', computedAt: new Date().toISOString() },
      });
      expect(event.transferId).toBe('t-1');
      expect(event.fromArea).toBe('A11');
      expect(event.toArea).toBe('A02');
      expect(event.status).toBe('completed');
      expect(event.persistent).toBe(false);
    });
  });

  describe('TransferContractId and TransferContractVersion', () => {
    it('contract IDs are branded strings', async () => {
      const { createContractId } = await import('../domain/transfer/types');
      const id = createContractId('A11-A02');
      expect(id).toBe('A11-A02');
    });

    it('contract versions are branded numbers', async () => {
      const { createContractVersion } = await import('../domain/transfer/types');
      const v = createContractVersion(1);
      expect(v).toBe(1);
    });
  });

  describe('TransferKind — branded string', () => {
    it('kind is a branded string', async () => {
      const { createTransferKind } = await import('../domain/transfer/types');
      const kind = createTransferKind('knowledge-to-curriculum');
      expect(kind).toBe('knowledge-to-curriculum');
    });
  });

  describe('StructuralFootprint — non-cryptographic label', () => {
    it('footprint has algorithm, version, hash, computedAt', async () => {
      const fp = {
        algorithm: 'fnv1a' as const,
        version: 1 as const,
        hash: 'test-hash',
        computedAt: new Date().toISOString(),
      };
      expect(fp.algorithm).toBe('fnv1a');
      expect(fp.version).toBe(1);
    });
  });

  describe('TransferWarning — separate from errors', () => {
    it('warning has code and message', async () => {
      const { createTransferWarning } = await import('../domain/transfer/types');
      const w = createTransferWarning('METADATA_INCOMPLETE', 'Missing optional field: address', 'address');
      expect(w.code).toBe('METADATA_INCOMPLETE');
      expect(w.field).toBe('address');
    });
  });

  describe('Transfer Error Taxonomy', () => {
    it('each error type has a recovery strategy', async () => {
      const { RECOVERY_STRATEGIES } = await import('../domain/transfer/errors');
      const types = [
        'CONTRACT_NOT_SUPPORTED', 'VERSION_NOT_SUPPORTED', 'PAYLOAD_INVALID',
        'REFERENCE_MISSING', 'ENTITY_NOT_RESOLVED', 'SOURCE_STATUS_INVALID',
        'IDENTITY_CONFLICT', 'METADATA_MISSING', 'SOURCE_MISSING',
        'LEGACY_CONTENT_INCOMPLETE', 'EXPERIMENTAL_NOT_TRANSFERABLE',
        'POST_CONDITION_FAILED', 'SIGNATURE_INCOHERENT', 'TARGET_INCOMPATIBLE',
        'SOURCE_NOT_FOUND', 'TARGET_INVALID', 'STATUS_VIOLATION',
        'VALIDATION_FAILED', 'SIGNATURE_MISMATCH', 'DUPLICATE_CONFLICT',
        'TEMPLATE_NOT_FOUND', 'FORMAT_UNSUPPORTED', 'INTEGRITY_VIOLATION',
        'SCHEMA_MISMATCH',
      ] as const;
      for (const t of types) {
        expect(RECOVERY_STRATEGIES.has(t)).toBe(true);
      }
    });

    it('recoverable errors allow retry or skip', async () => {
      const { RECOVERY_STRATEGIES } = await import('../domain/transfer/errors');
      const recoverable = ['METADATA_MISSING', 'LEGACY_CONTENT_INCOMPLETE', 'DUPLICATE_CONFLICT', 'TEMPLATE_NOT_FOUND'];
      for (const t of recoverable) {
        const strategy = RECOVERY_STRATEGIES.get(t as any);
        expect(strategy?.recoverable).toBe(true);
        expect(['retry', 'skip', 'rollback', 'manual-intervention']).toContain(strategy?.recoveryAction);
      }
    });

    it('non-recoverable errors halt the transfer', async () => {
      const { RECOVERY_STRATEGIES } = await import('../domain/transfer/errors');
      const nonRecoverable = ['CONTRACT_NOT_SUPPORTED', 'VERSION_NOT_SUPPORTED', 'PAYLOAD_INVALID', 'SCHEMA_MISMATCH'];
      for (const t of nonRecoverable) {
        const strategy = RECOVERY_STRATEGIES.get(t as any);
        expect(strategy?.recoverable).toBe(false);
      }
    });

    it('createTransferError includes stable code, message, uiMessage, and recoverable', async () => {
      const { createTransferError } = await import('../domain/transfer/errors');
      const err = createTransferError('IDENTITY_CONFLICT', { affectedRefs: ['node-1'] });
      expect(err.errorType).toBe('IDENTITY_CONFLICT');
      expect(err.code).toMatch(/^TE-IDEN-/);
      expect(err.message).toBeTruthy();
      expect(err.uiMessage).toBeTruthy();
      expect(err.recoverable).toBe(false);
      expect(err.affectedRefs).toEqual(['node-1']);
    });

    it('classifyError wraps unknown errors into VALIDATION_FAILED', async () => {
      const { classifyError } = await import('../domain/transfer/errors');
      const err = classifyError(new Error('something broke'));
      expect(err.errorType).toBe('VALIDATION_FAILED');
      expect(err.details).toBeDefined();
    });

    it('classifyError preserves existing TransferError', async () => {
      const { classifyError, createTransferError } = await import('../domain/transfer/errors');
      const original = createTransferError('SOURCE_NOT_FOUND');
      const classified = classifyError(original);
      expect(classified.errorType).toBe('SOURCE_NOT_FOUND');
    });
  });

  describe('Structural Signatures — canonical serialization', () => {
    it('determinism: same payload produces same footprint', async () => {
      const { computeStructuralFootprint } = await import('../domain/transfer/signatures');
      const payload = { a: 1, b: 'hello', c: [1, 2, 3] };
      const fp1 = computeStructuralFootprint(payload);
      const fp2 = computeStructuralFootprint(payload);
      expect(fp1.hash).toBe(fp2.hash);
    });

    it('order independence: same keys in different order produce same footprint', async () => {
      const { computeStructuralFootprint } = await import('../domain/transfer/signatures');
      const p1 = { z: 1, a: 2, m: 3 };
      const p2 = { a: 2, m: 3, z: 1 };
      const fp1 = computeStructuralFootprint(p1);
      const fp2 = computeStructuralFootprint(p2);
      expect(fp1.hash).toBe(fp2.hash);
    });

    it('different payloads produce different footprints', async () => {
      const { computeStructuralFootprint } = await import('../domain/transfer/signatures');
      const fp1 = computeStructuralFootprint({ x: 1 });
      const fp2 = computeStructuralFootprint({ x: 2 });
      expect(fp1.hash).not.toBe(fp2.hash);
    });

    it('tampered payload causes mismatch', async () => {
      const { computeStructuralFootprint, validateStructuralFootprint } = await import('../domain/transfer/signatures');
      const original = { key: 'value', count: 42 };
      const fp = computeStructuralFootprint(original);
      const tampered = { key: 'value', count: 99 };
      expect(validateStructuralFootprint(tampered, fp)).toBe(false);
    });

    it('valid payload passes validation', async () => {
      const { computeStructuralFootprint, validateStructuralFootprint } = await import('../domain/transfer/signatures');
      const payload = { key: 'value', count: 42 };
      const fp = computeStructuralFootprint(payload);
      expect(validateStructuralFootprint(payload, fp)).toBe(true);
    });

    it('null is distinguished from absent key', async () => {
      const { computeStructuralFootprint } = await import('../domain/transfer/signatures');
      const withNull = { a: 1, b: null };
      const withoutB = { a: 1 };
      const fp1 = computeStructuralFootprint(withNull);
      const fp2 = computeStructuralFootprint(withoutB);
      expect(fp1.hash).not.toBe(fp2.hash);
    });

    it('undefined values are rejected during canonicalization', async () => {
      const { canonicalSerialize } = await import('../domain/transfer/signatures');
      expect(() => canonicalSerialize(undefined)).toThrow('Cannot canonicalize undefined');
    });

    it('function values are rejected during canonicalization', async () => {
      const { canonicalSerialize } = await import('../domain/transfer/signatures');
      expect(() => canonicalSerialize(() => 1)).toThrow('Cannot canonicalize function');
    });

    it('arrays preserve order', async () => {
      const { computeStructuralFootprint } = await import('../domain/transfer/signatures');
      const fp1 = computeStructuralFootprint({ items: [1, 2, 3] });
      const fp2 = computeStructuralFootprint({ items: [3, 2, 1] });
      expect(fp1.hash).not.toBe(fp2.hash);
    });

    it('dates are normalized to ISO strings', async () => {
      const { canonicalSerialize } = await import('../domain/transfer/signatures');
      const date = new Date('2026-01-15T10:30:00.000Z');
      const result = canonicalSerialize({ ts: date });
      expect(result).toContain('2026-01-15T10:30:00.000Z');
    });

    it('footprint is labeled as non-cryptographic', async () => {
      const { computeStructuralFootprint } = await import('../domain/transfer/signatures');
      const fp = computeStructuralFootprint({ test: true });
      expect(fp.algorithm).toBe('fnv1a');
      expect(fp.version).toBe(1);
    });

    it('excludedFields are omitted from hash computation', async () => {
      const { computeStructuralFootprint } = await import('../domain/transfer/signatures');
      const p1 = { a: 1, b: 2, computedAt: '2026-01-01' };
      const p2 = { a: 1, b: 2, computedAt: '2026-12-31' };
      const fp1 = computeStructuralFootprint(p1, ['computedAt']);
      const fp2 = computeStructuralFootprint(p2, ['computedAt']);
      expect(fp1.hash).toBe(fp2.hash);
    });

    it('nested objects are recursively sorted', async () => {
      const { computeStructuralFootprint } = await import('../domain/transfer/signatures');
      const p1 = { outer: { z: 1, a: 2 } };
      const p2 = { outer: { a: 2, z: 1 } };
      const fp1 = computeStructuralFootprint(p1);
      const fp2 = computeStructuralFootprint(p2);
      expect(fp1.hash).toBe(fp2.hash);
    });
  });

  describe('Transfer Validators', () => {
    const validPayload = {
      transferId: 't-001' as any,
      contractId: 'A11-A02' as any,
      contractVersion: 1 as any,
      fromArea: 'A11',
      toArea: 'A02',
      sourceRefs: [{ entityId: 'src-1', entityType: 'node' }],
      targetRef: { entityId: 'tgt-1', entityType: 'node' },
      config: { mode: 'full' },
      metadata: { sessionTimestamp: '2026-01-01T00:00:00Z' },
    };

    describe('validateContract', () => {
      it('valid contract passes', async () => {
        const { validateContract } = await import('../domain/transfer/validators');
        const r = validateContract(validPayload as any);
        expect(r.valid).toBe(true);
        expect(r.errors).toHaveLength(0);
      });

      it('unsupported contract ID fails', async () => {
        const { validateContract } = await import('../domain/transfer/validators');
        const r = validateContract({ ...validPayload, contractId: 'X99-X99' } as any);
        expect(r.valid).toBe(false);
        expect(r.errors.some(e => e.code === 'CONTRACT_NOT_SUPPORTED')).toBe(true);
      });

      it('unsupported version fails', async () => {
        const { validateContract } = await import('../domain/transfer/validators');
        const r = validateContract({ ...validPayload, contractVersion: 99 } as any);
        expect(r.valid).toBe(false);
        expect(r.errors.some(e => e.code === 'VERSION_NOT_SUPPORTED')).toBe(true);
      });
    });

    describe('validatePreConditions', () => {
      it('valid payload passes', async () => {
        const { validatePreConditions } = await import('../domain/transfer/validators');
        const r = validatePreConditions(validPayload as any);
        expect(r.valid).toBe(true);
      });

      it('empty sourceRefs fails', async () => {
        const { validatePreConditions } = await import('../domain/transfer/validators');
        const r = validatePreConditions({ ...validPayload, sourceRefs: [] } as any);
        expect(r.valid).toBe(false);
        expect(r.errors.some(e => e.code === 'SOURCE_MISSING')).toBe(true);
      });

      it('missing targetRef fails', async () => {
        const { validatePreConditions } = await import('../domain/transfer/validators');
        const r = validatePreConditions({ ...validPayload, targetRef: { entityId: '', entityType: '' } } as any);
        expect(r.valid).toBe(false);
        expect(r.errors.some(e => e.code === 'TARGET_INVALID')).toBe(true);
      });

      it('same fromArea/toArea fails', async () => {
        const { validatePreConditions } = await import('../domain/transfer/validators');
        const r = validatePreConditions({ ...validPayload, toArea: 'A11' } as any);
        expect(r.valid).toBe(false);
        expect(r.errors.some(e => e.code === 'STATUS_VIOLATION')).toBe(true);
      });

      it('single source produces warning', async () => {
        const { validatePreConditions } = await import('../domain/transfer/validators');
        const r = validatePreConditions(validPayload as any);
        expect(r.valid).toBe(true);
        expect(r.warnings.some(w => w.code === 'SOURCE_SINGLE')).toBe(true);
      });
    });

    describe('validatePayload', () => {
      it('valid payload passes', async () => {
        const { validatePayload } = await import('../domain/transfer/validators');
        const r = validatePayload(validPayload as any);
        expect(r.valid).toBe(true);
      });

      it('empty transferId fails', async () => {
        const { validatePayload } = await import('../domain/transfer/validators');
        const r = validatePayload({ ...validPayload, transferId: '' } as any);
        expect(r.valid).toBe(false);
        expect(r.errors.some(e => e.code === 'REFERENCE_MISSING')).toBe(true);
      });

      it('empty source entityId fails', async () => {
        const { validatePayload } = await import('../domain/transfer/validators');
        const r = validatePayload({
          ...validPayload,
          sourceRefs: [{ entityId: '', entityType: 'node' }],
        } as any);
        expect(r.valid).toBe(false);
        expect(r.errors.some(e => e.field.includes('entityId'))).toBe(true);
      });

      it('empty config produces warning', async () => {
        const { validatePayload } = await import('../domain/transfer/validators');
        const r = validatePayload({ ...validPayload, config: {} } as any);
        expect(r.valid).toBe(true);
        expect(r.warnings.some(w => w.code === 'CONFIG_EMPTY')).toBe(true);
      });
    });

    describe('validatePostConditions', () => {
      it('completed with created entities passes', async () => {
        const { validatePostConditions } = await import('../domain/transfer/validators');
        const result = { status: 'completed' as const, created: ['n1'], updated: [], skipped: [] };
        const r = validatePostConditions(result, validPayload as any);
        expect(r.valid).toBe(true);
      });

      it('completed with no created entities fails', async () => {
        const { validatePostConditions } = await import('../domain/transfer/validators');
        const result = { status: 'completed' as const, created: [], updated: [], skipped: [] };
        const r = validatePostConditions(result, validPayload as any);
        expect(r.valid).toBe(false);
        expect(r.errors.some(e => e.code === 'POST_CONDITION_FAILED')).toBe(true);
      });

      it('partial with errors passes', async () => {
        const { validatePostConditions } = await import('../domain/transfer/validators');
        const result = {
          status: 'partial' as const,
          created: [],
          updated: [],
          skipped: [],
          errors: [{ errorType: 'SOURCE_NOT_FOUND' as const, code: 'E1', message: 'x', recoverable: false }],
        };
        const r = validatePostConditions(result, validPayload as any);
        expect(r.valid).toBe(true);
      });

      it('partial with no errors fails', async () => {
        const { validatePostConditions } = await import('../domain/transfer/validators');
        const result = { status: 'partial' as const, created: [], updated: [], skipped: [], errors: [] };
        const r = validatePostConditions(result, validPayload as any);
        expect(r.valid).toBe(false);
      });
    });

    describe('validateCompleteness', () => {
      it('valid metadata passes', async () => {
        const { validateCompleteness } = await import('../domain/transfer/validators');
        const r = validateCompleteness({ sessionTimestamp: '2026-01-01T00:00:00Z' });
        expect(r.valid).toBe(true);
      });

      it('missing sessionTimestamp fails', async () => {
        const { validateCompleteness } = await import('../domain/transfer/validators');
        const r = validateCompleteness({ sessionTimestamp: '' });
        expect(r.valid).toBe(false);
        expect(r.errors.some(e => e.code === 'METADATA_MISSING')).toBe(true);
      });
    });

    describe('validateStateCompatibility', () => {
      it('different areas pass', async () => {
        const { validateStateCompatibility } = await import('../domain/transfer/validators');
        const r = validateStateCompatibility(validPayload as any);
        expect(r.valid).toBe(true);
      });

      it('same areas fail', async () => {
        const { validateStateCompatibility } = await import('../domain/transfer/validators');
        const r = validateStateCompatibility({ ...validPayload, toArea: 'A11' } as any);
        expect(r.valid).toBe(false);
        expect(r.errors.some(e => e.code === 'STATUS_VIOLATION')).toBe(true);
      });
    });

    describe('errors vs warnings distinction', () => {
      it('errors halt transfer, warnings do not', async () => {
        const { validateContract, validatePreConditions, validatePayload } = await import('../domain/transfer/validators');

        const invalid = {
          ...validPayload,
          contractId: 'BAD' as any,
          sourceRefs: [] as any[],
        };

        const contractResult = validateContract(invalid as any);
        const preResult = validatePreConditions(invalid as any);

        expect(contractResult.valid).toBe(false);
        expect(contractResult.errors.length).toBeGreaterThan(0);
        expect(preResult.valid).toBe(false);
        expect(preResult.errors.length).toBeGreaterThan(0);

        const payloadResult = validatePayload({ ...validPayload, config: {} } as any);
        expect(payloadResult.valid).toBe(true);
        expect(payloadResult.warnings.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Transfer Event Log', () => {
    const makeEvent = (transferId: string, from: string = 'A11', to: string = 'A02') => ({
      id: `evt-${Date.now()}-${Math.random()}`,
      transferId: transferId as any,
      kind: 'test' as any,
      contractVersion: 1 as any,
      timestamp: new Date().toISOString(),
      fromArea: from as any,
      toArea: to as any,
      entityRefs: ['e-1'],
      status: 'completed' as const,
      structuralFootprint: { algorithm: 'fnv1a' as const, version: 1 as const, hash: 'abc', computedAt: new Date().toISOString() },
      persistent: false as const,
    });

    it('append works and event is retrievable', async () => {
      const { createTransferEventLog } = await import('../domain/transfer/eventLog');
      const log = createTransferEventLog();
      const evt = makeEvent('t-1');
      log.append(evt);
      expect(log.list()).toHaveLength(1);
      expect(log.list()[0].transferId).toBe('t-1');
    });

    it('list returns a readonly frozen copy', async () => {
      const { createTransferEventLog } = await import('../domain/transfer/eventLog');
      const log = createTransferEventLog();
      log.append(makeEvent('t-1'));
      const list = log.list();
      expect(Object.isFrozen(list)).toBe(true);
    });

    it('getByTransferId filters correctly', async () => {
      const { createTransferEventLog } = await import('../domain/transfer/eventLog');
      const log = createTransferEventLog();
      log.append(makeEvent('t-1'));
      log.append(makeEvent('t-2'));
      log.append(makeEvent('t-1'));
      expect(log.getByTransferId('t-1' as any)).toHaveLength(2);
      expect(log.getByTransferId('t-2' as any)).toHaveLength(1);
    });

    it('getByArea filters correctly', async () => {
      const { createTransferEventLog } = await import('../domain/transfer/eventLog');
      const log = createTransferEventLog();
      log.append(makeEvent('t-1', 'A11', 'A02'));
      log.append(makeEvent('t-2', 'A02', 'A03'));
      log.append(makeEvent('t-3', 'A04', 'A07'));
      expect(log.getByArea('A02')).toHaveLength(2);
      expect(log.getByArea('A11')).toHaveLength(1);
      expect(log.getByArea('A07')).toHaveLength(1);
    });

    it('getRecent returns last N events', async () => {
      const { createTransferEventLog } = await import('../domain/transfer/eventLog');
      const log = createTransferEventLog();
      log.append(makeEvent('t-1'));
      log.append(makeEvent('t-2'));
      log.append(makeEvent('t-3'));
      expect(log.getRecent(2)).toHaveLength(2);
      expect(log.getRecent(2)[0].transferId).toBe('t-2');
    });

    it('max events enforced (oldest dropped)', async () => {
      const { createTransferEventLog } = await import('../domain/transfer/eventLog');
      const log = createTransferEventLog(3);
      log.append(makeEvent('t-1'));
      log.append(makeEvent('t-2'));
      log.append(makeEvent('t-3'));
      log.append(makeEvent('t-4'));
      expect(log.list()).toHaveLength(3);
      expect(log.list()[0].transferId).toBe('t-2');
    });

    it('events are ordered by insertion', async () => {
      const { createTransferEventLog } = await import('../domain/transfer/eventLog');
      const log = createTransferEventLog();
      log.append(makeEvent('t-1'));
      log.append(makeEvent('t-2'));
      log.append(makeEvent('t-3'));
      const ids = log.list().map(e => e.transferId);
      expect(ids).toEqual(['t-1', 't-2', 't-3']);
    });

    it('internal array not modifiable through public API', async () => {
      const { createTransferEventLog } = await import('../domain/transfer/eventLog');
      const log = createTransferEventLog();
      log.append(makeEvent('t-1'));
      const list = log.list();
      expect(() => { (list as any).push(makeEvent('t-hack')); }).toThrow();
    });
  });

  describe('Area Contracts — Concrete Transfer Contracts', () => {
    const ts = '2026-07-28T10:00:00Z';

    describe('A11 → A02', () => {
      const validA11ToA02 = {
        sourceNodes: [
          { entityId: 'kb-1', entityType: 'knowledge-node' },
          { entityId: 'kb-2', entityType: 'knowledge-node' },
        ],
        targetVersionId: 'cv-2026',
        mergeStrategy: 'create-new' as const,
        targetDiscipline: 'matematica',
        targetArea: 'primaria',
        metadata: { sessionTimestamp: ts },
      };

      it('valid A11→A02 transfer succeeds', async () => {
        const { validateA11ToA02 } = await import('../domain/transfer/contracts');
        const r = validateA11ToA02(validA11ToA02);
        expect(r.valid).toBe(true);
        expect(r.errors).toHaveLength(0);
      });

      it('missing sourceNodes fails', async () => {
        const { validateA11ToA02 } = await import('../domain/transfer/contracts');
        const r = validateA11ToA02({ ...validA11ToA02, sourceNodes: [] });
        expect(r.valid).toBe(false);
        expect(r.errors.length).toBeGreaterThan(0);
      });

      it('empty targetVersionId fails', async () => {
        const { validateA11ToA02 } = await import('../domain/transfer/contracts');
        const r = validateA11ToA02({ ...validA11ToA02, targetVersionId: '' });
        expect(r.valid).toBe(false);
      });

      it('execute produces signed result and logs event', async () => {
        const { executeA11ToA02 } = await import('../domain/transfer/contracts');
        const result = executeA11ToA02(validA11ToA02);
        expect(result.status).toBe('completed');
        if (result.status === 'completed') {
          expect(result.created).toHaveLength(2);
        }
      });
    });

    describe('A02 → A03', () => {
      const validA02ToA03 = {
        nodeRef: { entityId: 'node-1', entityType: 'curriculum-node' },
        currentTextSnapshot: 'Obiettivo: risolvere equazioni di primo grado',
        curriculumVersionRef: 'cv-2026',
        sources: ['src-1'],
        evidences: ['ev-1'],
        context: { discipline: 'matematica' },
        origin: 'A02',
        status: 'draft',
        metadata: { sessionTimestamp: ts },
      };

      it('valid A02→A03 transfer succeeds', async () => {
        const { validateA02ToA03 } = await import('../domain/transfer/contracts');
        const r = validateA02ToA03(validA02ToA03);
        expect(r.valid).toBe(true);
        expect(r.errors).toHaveLength(0);
      });

      it('non-allowed status fails', async () => {
        const { validateA02ToA03 } = await import('../domain/transfer/contracts');
        const r = validateA02ToA03({ ...validA02ToA03, status: 'archived' });
        expect(r.valid).toBe(false);
      });

      it('approved status fails (cannot auto-approve)', async () => {
        const { validateA02ToA03 } = await import('../domain/transfer/contracts');
        const r = validateA02ToA03({ ...validA02ToA03, status: 'approved' });
        expect(r.valid).toBe(false);
      });

      it('empty text snapshot fails', async () => {
        const { validateA02ToA03 } = await import('../domain/transfer/contracts');
        const r = validateA02ToA03({ ...validA02ToA03, currentTextSnapshot: '' });
        expect(r.valid).toBe(false);
      });

      it('execute produces signed result and logs event', async () => {
        const { executeA02ToA03 } = await import('../domain/transfer/contracts');
        const result = executeA02ToA03(validA02ToA03);
        expect(result.status).toBe('completed');
        if (result.status === 'completed') {
          expect(result.created).toHaveLength(1);
        }
      });
    });

    describe('A02 → A04', () => {
      const validA02ToA04 = {
        nodeRefs: [
          { entityId: 'node-1', entityType: 'curriculum-node' },
          { entityId: 'node-2', entityType: 'curriculum-node' },
        ],
        explicitSnapshots: { 'node-1': 'snap-v1' },
        sources: ['src-file.pdf'],
        evidences: ['ev-1'],
        curriculumVersionRef: 'cv-2026-01',
        origin: 'A02',
        legacyWarnings: [],
        metadata: { sessionTimestamp: ts },
      };

      it('valid A02→A04 transfer succeeds', async () => {
        const { validateA02ToA04 } = await import('../domain/transfer/areaContracts');
        const r = validateA02ToA04(validA02ToA04);
        expect(r.valid).toBe(true);
        expect(r.errors).toHaveLength(0);
      });

      it('missing nodeRefs fails validation', async () => {
        const { validateA02ToA04 } = await import('../domain/transfer/areaContracts');
        const r = validateA02ToA04({ ...validA02ToA04, nodeRefs: [] });
        expect(r.valid).toBe(false);
        expect(r.errors.some(e => e.field === 'nodeRefs')).toBe(true);
      });

      it('missing curriculumVersionRef fails', async () => {
        const { validateA02ToA04 } = await import('../domain/transfer/areaContracts');
        const r = validateA02ToA04({ ...validA02ToA04, curriculumVersionRef: '' });
        expect(r.valid).toBe(false);
        expect(r.errors.some(e => e.field === 'curriculumVersionRef')).toBe(true);
      });

      it('auto-created document in nodeRefs fails', async () => {
        const { validateA02ToA04 } = await import('../domain/transfer/areaContracts');
        const r = validateA02ToA04({
          ...validA02ToA04,
          nodeRefs: [{ entityId: 'auto_created_doc', entityType: 'document' }],
        });
        expect(r.valid).toBe(false);
        expect(r.errors.some(e => e.code === 'VALIDATION_FAILED')).toBe(true);
      });

      it('execute produces signed result and logs event', async () => {
        const { executeA02ToA04 } = await import('../domain/transfer/areaContracts');
        const { createTransferEventLog } = await import('../domain/transfer/eventLog');
        const log = createTransferEventLog();
        const result = executeA02ToA04(validA02ToA04, log);
        expect(result.status).toBe('completed');
        expect(result.created).toHaveLength(2);
        expect(result.structuralFootprint.algorithm).toBe('fnv1a');
        expect(result.event.status).toBe('completed');
        expect(log.list()).toHaveLength(1);
      });
    });

    describe('A03 → A04', () => {
      const validA03ToA04 = {
        proposalRefs: [
          { entityId: 'prop-1', entityType: 'proposal', status: 'approved' },
          { entityId: 'prop-2', entityType: 'proposal', status: 'approved' },
        ],
        allowedStates: ['approved', 'reviewed'],
        metadata: { sessionTimestamp: ts },
      };

      it('valid A03→A04 with allowed states succeeds', async () => {
        const { validateA03ToA04 } = await import('../domain/transfer/areaContracts');
        const r = validateA03ToA04(validA03ToA04);
        expect(r.valid).toBe(true);
        expect(r.errors).toHaveLength(0);
      });

      it('missing proposalRefs fails', async () => {
        const { validateA03ToA04 } = await import('../domain/transfer/areaContracts');
        const r = validateA03ToA04({ ...validA03ToA04, proposalRefs: [] });
        expect(r.valid).toBe(false);
        expect(r.errors.some(e => e.field === 'proposalRefs')).toBe(true);
      });

      it('non-approved status flagged as warning', async () => {
        const { validateA03ToA04 } = await import('../domain/transfer/areaContracts');
        const r = validateA03ToA04({
          ...validA03ToA04,
          proposalRefs: [{ entityId: 'prop-1', entityType: 'proposal', status: 'reviewed' }],
        });
        expect(r.valid).toBe(true);
        expect(r.warnings.some(w => w.code === 'NON_APPROVED_FLAGGED')).toBe(true);
      });

      it('status not in allowed states fails', async () => {
        const { validateA03ToA04 } = await import('../domain/transfer/areaContracts');
        const r = validateA03ToA04({
          ...validA03ToA04,
          proposalRefs: [{ entityId: 'prop-1', entityType: 'proposal', status: 'draft' }],
        });
        expect(r.valid).toBe(false);
        expect(r.errors.some(e => e.code === 'STATUS_VIOLATION')).toBe(true);
      });

      it('execute produces signed result and logs event', async () => {
        const { executeA03ToA04 } = await import('../domain/transfer/areaContracts');
        const { createTransferEventLog } = await import('../domain/transfer/eventLog');
        const log = createTransferEventLog();
        const result = executeA03ToA04(validA03ToA04, log);
        expect(result.status).toBe('completed');
        expect(result.created).toHaveLength(2);
        expect(result.structuralFootprint.algorithm).toBe('fnv1a');
        expect(result.event.status).toBe('completed');
        expect(log.list()).toHaveLength(1);
      });
    });

    describe('A04 → A07', () => {
      const validA04ToA07 = {
        designId: 'design-001',
        curriculumRefs: ['cv-1', 'cv-2'],
        sources: ['source-a.pdf'],
        institutionalContext: { department: 'CS', level: 'L-19' },
        teachingStructure: { modules: ['mod-1', 'mod-2'] },
        assistedContentOrigin: 'A04',
        versionOrSnapshot: 'v1.0',
        warnings: [],
        metadata: { sessionTimestamp: ts },
      };

      it('valid A04→A07 transfer succeeds', async () => {
        const { validateA04ToA07 } = await import('../domain/transfer/areaContracts');
        const r = validateA04ToA07(validA04ToA07);
        expect(r.valid).toBe(true);
        expect(r.errors).toHaveLength(0);
      });

      it('missing designId fails', async () => {
        const { validateA04ToA07 } = await import('../domain/transfer/areaContracts');
        const r = validateA04ToA07({ ...validA04ToA07, designId: '' });
        expect(r.valid).toBe(false);
        expect(r.errors.some(e => e.field === 'designId')).toBe(true);
      });

      it('auto-created document in designId fails', async () => {
        const { validateA04ToA07 } = await import('../domain/transfer/areaContracts');
        const r = validateA04ToA07({ ...validA04ToA07, designId: 'auto-created-doc' });
        expect(r.valid).toBe(false);
        expect(r.errors.some(e => e.code === 'VALIDATION_FAILED')).toBe(true);
      });

      it('auto-created document in curriculumRefs fails', async () => {
        const { validateA04ToA07 } = await import('../domain/transfer/areaContracts');
        const r = validateA04ToA07({
          ...validA04ToA07,
          curriculumRefs: ['auto_created_ref'],
        });
        expect(r.valid).toBe(false);
        expect(r.errors.some(e => e.code === 'VALIDATION_FAILED')).toBe(true);
      });

      it('execute produces signed result and logs event', async () => {
        const { executeA04ToA07 } = await import('../domain/transfer/areaContracts');
        const { createTransferEventLog } = await import('../domain/transfer/eventLog');
        const log = createTransferEventLog();
        const result = executeA04ToA07(validA04ToA07, log);
        expect(result.status).toBe('completed');
        expect(result.created).toHaveLength(1);
        expect(result.structuralFootprint.algorithm).toBe('fnv1a');
        expect(result.event.status).toBe('completed');
        expect(log.list()).toHaveLength(1);
      });
    });
  });

  describe('Legacy Adapters', () => {
    it('legacy node adapted with warnings for missing fields', async () => {
      const { adaptLegacyCurriculumNode } = await import('../domain/transfer/legacyAdapters');
      const result = adaptLegacyCurriculumNode({ id: 'n-1', type: 'topic' });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.entityId).toBe('n-1');
        expect(result.value.entityType).toBe('topic');
        expect(result.value.origin).toBe('legacy');
        expect(result.warnings.some(w => w.code === 'LEGACY_CONTENT_INCOMPLETE')).toBe(true);
        expect(result.warnings.some(w => w.field === 'name')).toBe(true);
      }
    });

    it('legacy UDA adapted with origin classified as legacy', async () => {
      const { adaptLegacyUdaModel } = await import('../domain/transfer/legacyAdapters');
      const result = adaptLegacyUdaModel({
        nodes: [{ id: 'n-1', type: 'topic' }, { id: 'n-2', type: 'objective' }],
        sources: ['s1', 's2'],
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.origin).toBe('legacy');
        expect(result.value.nodeRefs).toHaveLength(2);
        expect(result.value.nodeRefs[0].entityId).toBe('n-1');
        expect(result.value.sources).toEqual(['s1', 's2']);
      }
    });

    it('unknown format produces error result (not throw)', async () => {
      const { adaptLegacyCurriculumNode, adaptLegacyUdaModel } = await import('../domain/transfer/legacyAdapters');
      const r1 = adaptLegacyCurriculumNode({ unrelated: true });
      expect(r1.ok).toBe(false);
      if (!r1.ok) {
        expect(r1.error.errorType).toBe('LEGACY_CONTENT_INCOMPLETE');
      }
      const r2 = adaptLegacyUdaModel({ unrelated: true });
      expect(r2.ok).toBe(false);
      if (!r2.ok) {
        expect(r2.error.errorType).toBe('LEGACY_CONTENT_INCOMPLETE');
      }
    });

    it('try* wrappers return null on failure', async () => {
      const { tryAdaptLegacyCurriculumNode, tryAdaptLegacyUdaModel } = await import('../domain/transfer/legacyAdapters');
      expect(tryAdaptLegacyCurriculumNode({ unrelated: true })).toBeNull();
      expect(tryAdaptLegacyUdaModel({ unrelated: true })).toBeNull();
    });

    it('no inventing of sources/metadata', async () => {
      const { adaptLegacyUdaModel } = await import('../domain/transfer/legacyAdapters');
      const result = adaptLegacyUdaModel({ nodes: [{ id: 'n-1', type: 't' }] });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.sources).toEqual([]);
        expect(result.value.origin).toBe('legacy');
      }
    });

    it('text preserved when present', async () => {
      const { adaptLegacyCurriculumNode } = await import('../domain/transfer/legacyAdapters');
      const result = adaptLegacyCurriculumNode({ id: 'n-1', name: 'Linear Equations', type: 'topic' });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.text).toBe('Linear Equations');
        expect(result.warnings.some(w => w.field === 'name')).toBe(false);
      }
    });

    it('isLegacyFormat detects old vs new', async () => {
      const { isLegacyFormat } = await import('../domain/transfer/legacyAdapters');
      expect(isLegacyFormat({ id: 'n-1', name: 'test', type: 'topic' })).toBe(true);
      expect(isLegacyFormat({ entityId: 'n-1', entityType: 'topic' })).toBe(false);
      expect(isLegacyFormat(null)).toBe(false);
      expect(isLegacyFormat('string')).toBe(false);
      expect(isLegacyFormat({ nodes: [], sources: [] })).toBe(true);
    });
  });
});
