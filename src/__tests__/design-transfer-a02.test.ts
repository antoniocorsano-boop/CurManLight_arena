import { describe, it, expect } from 'vitest';
import { executeA02ToA04Transfer } from '../domain/design/transferA02';
import { createEmptyDesignStore } from '../domain/design/archive';
import type { A02ToA04Payload } from '../domain/transfer/areaContracts';
import type { EntityReference, EntityId } from '../domain/curriculum/identity/types';

function makeRef(id: string, entityType = 'curriculum-node'): EntityReference {
  return { id: id as EntityId, entityType: entityType as never };
}

function makePayload(overrides: Partial<A02ToA04Payload> = {}): A02ToA04Payload {
  return {
    nodeRefs: [{ entityId: 'node-1', entityType: 'curriculum-node' }],
    explicitSnapshots: { 'node-1': 'testo vigente' },
    sources: ['src-1'],
    evidences: ['ev-1'],
    curriculumVersionRef: 'cv-1',
    origin: 'teacher',
    legacyWarnings: [],
    metadata: { sessionTimestamp: new Date().toISOString() },
    ...overrides,
  };
}

describe('A02→A04 transfer', () => {
  it('creates valid transfer', () => {
    const archive = createEmptyDesignStore();
    const result = executeA02ToA04Transfer(makePayload(), archive, makeRef('design-1'));
    expect(result.ok).toBe(true);
  });

  it('preserves curriculum node', () => {
    const archive = createEmptyDesignStore();
    const result = executeA02ToA04Transfer(makePayload(), archive, makeRef('design-1'));
    if (!result.ok) throw new Error('fail');
    expect(result.selection.sourceEntityRef.id).toBe('node-1');
  });

  it('preserves curriculum version', () => {
    const archive = createEmptyDesignStore();
    const result = executeA02ToA04Transfer(makePayload(), archive, makeRef('design-1'));
    if (!result.ok) throw new Error('fail');
    expect(result.selection.curriculumVersionRef?.id).toBe('cv-1');
  });

  it('preserves snapshot', () => {
    const archive = createEmptyDesignStore();
    const result = executeA02ToA04Transfer(makePayload(), archive, makeRef('design-1'));
    if (!result.ok) throw new Error('fail');
    expect(result.selection.currentTextSnapshot).toBe('testo vigente');
    expect(result.selection.selectedTextSnapshot).toBe('testo vigente');
  });

  it('preserves sources', () => {
    const archive = createEmptyDesignStore();
    const result = executeA02ToA04Transfer(makePayload({ sources: ['src-a', 'src-b'] }), archive, makeRef('design-1'));
    if (!result.ok) throw new Error('fail');
    expect(result.selection.sourceRefs.length).toBe(2);
  });

  it('preserves evidences', () => {
    const archive = createEmptyDesignStore();
    const result = executeA02ToA04Transfer(makePayload({ evidences: ['ev-a', 'ev-b'] }), archive, makeRef('design-1'));
    if (!result.ok) throw new Error('fail');
    expect(result.selection.evidenceRefs.length).toBe(2);
  });

  it('qualifies as current-curriculum', () => {
    const archive = createEmptyDesignStore();
    const result = executeA02ToA04Transfer(makePayload(), archive, makeRef('design-1'));
    if (!result.ok) throw new Error('fail');
    expect(result.selection.qualification).toBe('current-curriculum');
  });

  it('source area is A02', () => {
    const archive = createEmptyDesignStore();
    const result = executeA02ToA04Transfer(makePayload(), archive, makeRef('design-1'));
    if (!result.ok) throw new Error('fail');
    expect(result.selection.sourceArea).toBe('A02');
  });

  it('rejects empty nodeRefs', () => {
    const archive = createEmptyDesignStore();
    const result = executeA02ToA04Transfer(makePayload({ nodeRefs: [] }), archive, makeRef('design-1'));
    expect(result.ok).toBe(false);
  });

  it('rejects missing curriculumVersionRef', () => {
    const archive = createEmptyDesignStore();
    const result = executeA02ToA04Transfer(makePayload({ curriculumVersionRef: '' }), archive, makeRef('design-1'));
    expect(result.ok).toBe(false);
  });

  it('preserves legacy warnings', () => {
    const archive = createEmptyDesignStore();
    const result = executeA02ToA04Transfer(makePayload({ legacyWarnings: ['warning-1'] }), archive, makeRef('design-1'));
    if (!result.ok) throw new Error('fail');
    expect(result.warnings.some(w => w.message === 'warning-1')).toBe(true);
  });
});