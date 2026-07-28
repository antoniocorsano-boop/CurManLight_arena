import { describe, it, expect } from 'vitest';
import { executeA11ToA02, executeA02ToA03 } from '../domain/transfer/contracts';
import { executeA02ToA04, executeA03ToA04, executeA04ToA07, validateA03ToA04 } from '../domain/transfer/areaContracts';
import { createTransferEventLog } from '../domain/transfer/eventLog';

const TS = '2026-07-28T10:00:00Z';

describe('CML-633E Task 9 — Area Boundary Integration Tests', () => {

  describe('A11 → A02: Knowledge → Curriculum', () => {
    const makePayload = () => ({
      sourceNodes: [
        { entityId: 'kb-node-001', entityType: 'knowledge-node' },
        { entityId: 'kb-node-002', entityType: 'knowledge-node' },
        { entityId: 'kb-node-003', entityType: 'knowledge-node' },
      ],
      targetVersionId: 'cv-2026-01',
      mergeStrategy: 'create-new' as const,
      targetDiscipline: 'matematica',
      targetArea: 'primaria',
      metadata: { sessionTimestamp: TS },
    });

    it('creates target nodes with correct entityIds', () => {
      const result = executeA11ToA02(makePayload());
      expect(result.status).toBe('completed');
      if (result.status === 'completed') {
        expect(result.created).toEqual([
          'curriculum-node-kb-node-001',
          'curriculum-node-kb-node-002',
          'curriculum-node-kb-node-003',
        ]);
        expect(result.skipped).toHaveLength(0);
        expect(result.updated).toHaveLength(0);
      }
    });

    it('preserves origin and metadata', () => {
      const payload = makePayload();
      const before = JSON.stringify(payload);
      const result = executeA11ToA02(payload);
      expect(result.status).toBe('completed');
      expect(JSON.stringify(payload)).toBe(before);
    });

    it('input is not mutated', () => {
      const payload = makePayload();
      const snapshot = JSON.parse(JSON.stringify(payload));
      executeA11ToA02(payload);
      expect(payload).toEqual(snapshot);
    });

    it('empty sourceNodes fails with SOURCE_MISSING', () => {
      const payload = makePayload();
      const emptyPayload = { ...payload, sourceNodes: [] as typeof payload.sourceNodes };
      const result = executeA11ToA02(emptyPayload);
      expect(result.status).toBe('failed');
      if (result.status === 'failed') {
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].errorType).toBe('SOURCE_MISSING');
      }
    });

    it('failed transfer is not recorded in event log', () => {
      const payload = makePayload();
      const emptyPayload = { ...payload, sourceNodes: [] as typeof payload.sourceNodes };
      executeA11ToA02(emptyPayload);
      const log = createTransferEventLog();
      const events = log.getByArea('A11');
      expect(events).toHaveLength(0);
    });
  });

  describe('A02 → A03: Curriculum → Proposal', () => {
    const makePayload = () => ({
      nodeRef: { entityId: 'curr-node-042', entityType: 'curriculum-node' },
      currentTextSnapshot: 'Obiettivo: risolvere equazioni di secondo grado con metodo grafico',
      curriculumVersionRef: 'cv-2026-01',
      sources: ['src-001', 'src-002'],
      evidences: ['ev-001'],
      context: { discipline: 'matematica', level: 'secondaria' },
      origin: 'A02',
      status: 'draft',
      metadata: { sessionTimestamp: TS },
    });

    it('creates proposal with correct entityId', () => {
      const result = executeA02ToA03(makePayload());
      expect(result.status).toBe('completed');
      if (result.status === 'completed') {
        expect(result.created).toEqual(['proposal-curr-node-042']);
      }
    });

    it('text snapshot is preserved in source data', () => {
      const payload = makePayload();
      const before = JSON.stringify(payload);
      executeA02ToA03(payload);
      expect(JSON.stringify(payload)).toBe(before);
      expect(payload.currentTextSnapshot).toBe(
        'Obiettivo: risolvere equazioni di secondo grado con metodo grafico',
      );
    });

    it('status is NOT auto-approved (draft stays draft)', () => {
      const payload = makePayload();
      const result = executeA02ToA03(payload);
      expect(result.status).toBe('completed');
      if (result.status === 'completed') {
        expect(result.created[0]).toBe('proposal-curr-node-042');
        expect(result.created[0]).not.toContain('approved');
      }
    });

    it('input is not mutated', () => {
      const payload = makePayload();
      const snapshot = JSON.parse(JSON.stringify(payload));
      executeA02ToA03(payload);
      expect(payload).toEqual(snapshot);
    });

    it('approved status fails (cannot transfer approved status as proposal)', () => {
      const payload = { ...makePayload(), status: 'approved' };
      const result = executeA02ToA03(payload);
      expect(result.status).toBe('failed');
      if (result.status === 'failed') {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it('empty text snapshot fails', () => {
      const payload = { ...makePayload(), currentTextSnapshot: '' };
      const result = executeA02ToA03(payload);
      expect(result.status).toBe('failed');
    });

    it('empty nodeRef.entityId fails', () => {
      const payload = { ...makePayload(), nodeRef: { entityId: '', entityType: 'curriculum-node' } };
      const result = executeA02ToA03(payload);
      expect(result.status).toBe('failed');
    });

    it('failed transfer is not recorded in event log', () => {
      const payload = makePayload();
      payload.nodeRef = { entityId: '', entityType: 'curriculum-node' };
      executeA02ToA03(payload);
      const log = createTransferEventLog();
      const events = log.getByArea('A03');
      expect(events).toHaveLength(0);
    });
  });

  describe('A02 → A04: Curriculum → Design (Area Contracts)', () => {
    const makePayload = () => ({
      nodeRefs: [
        { entityId: 'design-node-01', entityType: 'curriculum-node' },
        { entityId: 'design-node-02', entityType: 'curriculum-node' },
      ],
      explicitSnapshots: { 'design-node-01': 'snap-v1', 'design-node-02': 'snap-v2' },
      sources: ['source-file.pdf', 'evidence-data.xlsx'],
      evidences: ['ev-001', 'ev-002'],
      curriculumVersionRef: 'cv-2026-01',
      origin: 'A02',
      legacyWarnings: ['LEGACY_FORMAT_DETECTED', 'MISSING_FIELD:competencies'],
      metadata: { sessionTimestamp: TS },
    });

    it('creates target entities with correct structure', () => {
      const log = createTransferEventLog();
      const result = executeA02ToA04(makePayload(), log);
      expect(result.status).toBe('completed');
      expect(result.created).toEqual([
        'curriculum-design-node-01',
        'curriculum-design-node-02',
      ]);
      expect(result.structuralFootprint.algorithm).toBe('fnv1a');
      expect(result.structuralFootprint.version).toBe(1);
    });

    it('data integrity: nodeRefs mapped correctly', () => {
      const log = createTransferEventLog();
      const result = executeA02ToA04(makePayload(), log);
      expect(result.created).toHaveLength(makePayload().nodeRefs.length);
      for (const id of result.created) {
        expect(id).toMatch(/^curriculum-/);
      }
    });

    it('legacy warnings are attached to the payload and preserved', () => {
      const payload = makePayload();
      const log = createTransferEventLog();
      executeA02ToA04(payload, log);
      expect(payload.legacyWarnings).toEqual(['LEGACY_FORMAT_DETECTED', 'MISSING_FIELD:competencies']);
    });

    it('input is not mutated', () => {
      const payload = makePayload();
      const snapshot = JSON.parse(JSON.stringify(payload));
      const log = createTransferEventLog();
      executeA02ToA04(payload, log);
      expect(payload).toEqual(snapshot);
    });

    it('event log records the successful transfer', () => {
      const log = createTransferEventLog();
      executeA02ToA04(makePayload(), log);
      const events = log.list();
      expect(events).toHaveLength(1);
      expect(events[0].fromArea).toBe('A02');
      expect(events[0].toArea).toBe('A04');
      expect(events[0].status).toBe('completed');
      expect(events[0].persistent).toBe(false);
    });

    it('missing nodeRefs fails', () => {
      const log = createTransferEventLog();
      const result = executeA02ToA04({ ...makePayload(), nodeRefs: [] }, log);
      expect(result.status).toBe('failed');
      expect(result.event.status).toBe('failed');
      expect(result.event.errorCode).toBeDefined();
    });

    it('failed transfer records event with status failed', () => {
      const log = createTransferEventLog();
      executeA02ToA04({ ...makePayload(), nodeRefs: [] }, log);
      const events = log.list();
      expect(events).toHaveLength(1);
      expect(events[0].status).toBe('failed');
    });
  });

  describe('A03 → A04: Proposal → Design', () => {
    const makePayload = () => ({
      proposalRefs: [
        { entityId: 'prop-alpha', entityType: 'proposal', status: 'approved' },
        { entityId: 'prop-beta', entityType: 'proposal', status: 'approved' },
      ],
      allowedStates: ['approved', 'reviewed'],
      metadata: { sessionTimestamp: TS },
    });

    it('creates curriculum entries from approved proposals', () => {
      const log = createTransferEventLog();
      const result = executeA03ToA04(makePayload(), log);
      expect(result.status).toBe('completed');
      expect(result.created).toEqual([
        'curriculum-prop-alpha',
        'curriculum-prop-beta',
      ]);
    });

    it('event log records the transfer', () => {
      const log = createTransferEventLog();
      const result = executeA03ToA04(makePayload(), log);
      expect(result.event.status).toBe('completed');
      expect(result.event.fromArea).toBe('A03');
      expect(result.event.toArea).toBe('A04');
      expect(log.list()).toHaveLength(1);
    });

    it('non-approved proposals produce NON_APPROVED_FLAGGED warning', () => {
      const log = createTransferEventLog();
      const payload = {
        ...makePayload(),
        proposalRefs: [
          { entityId: 'prop-draft', entityType: 'proposal', status: 'draft' },
        ],
        allowedStates: ['approved', 'reviewed', 'draft'],
      };
      const result = executeA03ToA04(payload, log);
      expect(result.status).toBe('completed');
      expect(log.list()[0].status).toBe('completed');
      const validation = validateA03ToA04(payload);
      expect(validation.warnings.some((w: any) => w.code === 'NON_APPROVED_FLAGGED')).toBe(true);
    });

    it('proposals with disallowed status fail with STATUS_VIOLATION', () => {
      const log = createTransferEventLog();
      const payload = {
        ...makePayload(),
        proposalRefs: [
          { entityId: 'prop-draft', entityType: 'proposal', status: 'draft' },
        ],
        allowedStates: ['approved', 'reviewed'],
      };
      const result = executeA03ToA04(payload, log);
      expect(result.status).toBe('failed');
      expect(result.event.status).toBe('failed');
      expect(result.event.errorCode).toBeDefined();
    });

    it('input is not mutated', () => {
      const payload = makePayload();
      const snapshot = JSON.parse(JSON.stringify(payload));
      const log = createTransferEventLog();
      executeA03ToA04(payload, log);
      expect(payload).toEqual(snapshot);
    });

    it('empty proposalRefs fails', () => {
      const log = createTransferEventLog();
      const result = executeA03ToA04({ ...makePayload(), proposalRefs: [] }, log);
      expect(result.status).toBe('failed');
    });

    it('mixed statuses: approved and non-approved', () => {
      const log = createTransferEventLog();
      const payload = {
        ...makePayload(),
        proposalRefs: [
          { entityId: 'prop-ok', entityType: 'proposal', status: 'approved' },
          { entityId: 'prop-warn', entityType: 'proposal', status: 'reviewed' },
        ],
        allowedStates: ['approved', 'reviewed'],
      };
      const result = executeA03ToA04(payload, log);
      expect(result.status).toBe('completed');
      expect(result.created).toHaveLength(2);
      const validation = validateA03ToA04(payload);
      expect(validation.valid).toBe(true);
      expect(validation.warnings.some((w: any) => w.code === 'NON_APPROVED_FLAGGED')).toBe(true);
    });
  });

  describe('A04 → A07: Design → Teaching Plan', () => {
    const makePayload = () => ({
      designId: 'teaching-design-001',
      curriculumRefs: ['cv-ref-01', 'cv-ref-02'],
      sources: ['methodology-guide.pdf'],
      institutionalContext: {
        department: 'Scienze Matematiche',
        level: 'Laurea Magistrale',
        programmeYear: 2,
      },
      teachingStructure: {
        modules: ['mod-fundamentals', 'mod-advanced'],
        totalHours: 120,
      },
      assistedContentOrigin: 'A04',
      versionOrSnapshot: 'v2.1',
      warnings: [],
      metadata: { sessionTimestamp: TS },
    });

    it('creates teaching plan entity from design', () => {
      const log = createTransferEventLog();
      const result = executeA04ToA07(makePayload(), log);
      expect(result.status).toBe('completed');
      expect(result.created).toEqual(['teaching-plan-teaching-design-001']);
    });

    it('no auto-created document entity in result', () => {
      const log = createTransferEventLog();
      const result = executeA04ToA07(makePayload(), log);
      for (const id of result.created) {
        expect(id).not.toMatch(/auto[_-]?creat/i);
      }
    });

    it('institutional context is preserved in source payload', () => {
      const payload = makePayload();
      const log = createTransferEventLog();
      executeA04ToA07(payload, log);
      expect(payload.institutionalContext).toEqual({
        department: 'Scienze Matematiche',
        level: 'Laurea Magistrale',
        programmeYear: 2,
      });
    });

    it('teaching structure is preserved in source payload', () => {
      const payload = makePayload();
      const log = createTransferEventLog();
      executeA04ToA07(payload, log);
      expect(payload.teachingStructure).toEqual({
        modules: ['mod-fundamentals', 'mod-advanced'],
        totalHours: 120,
      });
    });

    it('input is not mutated', () => {
      const payload = makePayload();
      const snapshot = JSON.parse(JSON.stringify(payload));
      const log = createTransferEventLog();
      executeA04ToA07(payload, log);
      expect(payload).toEqual(snapshot);
    });

    it('event log records the transfer', () => {
      const log = createTransferEventLog();
      executeA04ToA07(makePayload(), log);
      const events = log.list();
      expect(events).toHaveLength(1);
      expect(events[0].fromArea).toBe('A04');
      expect(events[0].toArea).toBe('A07');
      expect(events[0].status).toBe('completed');
      expect(events[0].persistent).toBe(false);
    });

    it('footprint is structurally valid', () => {
      const log = createTransferEventLog();
      const result = executeA04ToA07(makePayload(), log);
      expect(result.structuralFootprint.algorithm).toBe('fnv1a');
      expect(result.structuralFootprint.version).toBe(1);
      expect(typeof result.structuralFootprint.hash).toBe('string');
      expect(result.structuralFootprint.hash.length).toBeGreaterThan(0);
    });

    it('empty designId fails', () => {
      const log = createTransferEventLog();
      const result = executeA04ToA07({ ...makePayload(), designId: '' }, log);
      expect(result.status).toBe('failed');
      expect(result.event.status).toBe('failed');
      expect(result.event.errorCode).toBeDefined();
    });

    it('auto-created designId fails', () => {
      const log = createTransferEventLog();
      const result = executeA04ToA07({ ...makePayload(), designId: 'auto_created_doc' }, log);
      expect(result.status).toBe('failed');
      expect(result.event.errorCode).toBeDefined();
    });

    it('auto-created curriculumRef fails', () => {
      const log = createTransferEventLog();
      const result = executeA04ToA07(
        { ...makePayload(), curriculumRefs: ['auto-created-ref'] },
        log,
      );
      expect(result.status).toBe('failed');
      expect(result.event.errorCode).toBeDefined();
    });

    it('failed transfer records event with status failed', () => {
      const log = createTransferEventLog();
      executeA04ToA07({ ...makePayload(), designId: '' }, log);
      const events = log.list();
      expect(events).toHaveLength(1);
      expect(events[0].status).toBe('failed');
    });
  });
});
