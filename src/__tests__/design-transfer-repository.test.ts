import { describe, it, expect } from 'vitest';
import {
  createEmptyDesignStore,
  addSelection,
  getSelection,
  listSelectionsForDesign,
  replaceSelectionSnapshot,
  removeSelectionLogically,
  findSelectionBySource,
  verifyDesignIntegrity,
  compareSelectionWithSource,
} from '../domain/design/archive';
import { createDesignCurriculumSelection, cloneDesignArchive } from '../domain/design/constructors';
import { validateDesignArchiveIntegrity } from '../domain/design/validators';
import { addSelectionWithConflictResolution, markSourceStatusChanged } from '../domain/design/conflicts';
import type { EntityReference, EntityId } from '../domain/curriculum/identity/types';

function makeRef(id: string, entityType = 'curriculum-node'): EntityReference {
  return { id: id as EntityId, entityType: entityType as never };
}

function makeSelection(designId = 'd', srcId = 's', qual = 'current-curriculum' as const) {
  return createDesignCurriculumSelection({
    designRef: makeRef(designId),
    sourceArea: 'A02',
    sourceEntityRef: makeRef(srcId),
    currentTextSnapshot: 'text',
    selectedTextSnapshot: 'text',
    qualification: qual,
  });
}

describe('repository operations', () => {
  it('adds and gets selection', () => {
    const a = createEmptyDesignStore();
    const s = makeSelection();
    const r = addSelection(a, s);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(getSelection(r.archive, s.id)).toBeDefined();
  });

  it('lists by design', () => {
    const a = createEmptyDesignStore();
    const s1 = makeSelection('d1', 's1');
    const s2 = makeSelection('d2', 's2');
    const r1 = addSelection(a, s1);
    if (!r1.success) throw new Error('fail');
    const r2 = addSelection(r1.archive, s2);
    if (!r2.success) throw new Error('fail');
    expect(listSelectionsForDesign(r2.archive, 'd1').length).toBe(1);
  });

  it('finds by source', () => {
    const a = createEmptyDesignStore();
    const s = makeSelection('d', 'src-x');
    const r = addSelection(a, s);
    if (!r.success) throw new Error('fail');
    expect(findSelectionBySource(r.archive, 'src-x').length).toBe(1);
  });

  it('replaces snapshot', () => {
    const a = createEmptyDesignStore();
    const s = makeSelection();
    const r = addSelection(a, s);
    if (!r.success) throw new Error('fail');
    const rep = replaceSelectionSnapshot(r.archive, s.id, 'new');
    expect(rep.success).toBe(true);
    if (!rep.success) return;
    expect(rep.selection?.selectedTextSnapshot).toBe('new');
  });

  it('removes logically', () => {
    const a = createEmptyDesignStore();
    const s = makeSelection();
    const r = addSelection(a, s);
    if (!r.success) throw new Error('fail');
    const rem = removeSelectionLogically(r.archive, s.id);
    expect(rem.success).toBe(true);
    if (!rem.success) return;
    expect(rem.archive.selections.length).toBe(0);
  });

  it('verifies integrity', () => {
    const a = createEmptyDesignStore();
    expect(verifyDesignIntegrity(a)).toBe(true);
  });

  it('compareSelectionWithSource', () => {
    const s = makeSelection();
    expect(compareSelectionWithSource(s, 'text')).toBe('source-current');
    expect(compareSelectionWithSource(s, 'changed')).toBe('source-updated');
    expect(compareSelectionWithSource(s, undefined)).toBe('source-unavailable');
  });

  it('clone is independent', () => {
    const a = createEmptyDesignStore();
    const clone = cloneDesignArchive(a);
    clone.selections.push({} as never);
    expect(a.selections.length).toBe(0);
  });

  it('rejects future schema', () => {
    const a = createEmptyDesignStore();
    a.schemaVersion = 99;
    expect(validateDesignArchiveIntegrity(a).valid).toBe(false);
  });

  it('detects duplicate source conflict', () => {
    const a = createEmptyDesignStore();
    const s1 = makeSelection('d', 'dup');
    const r = addSelection(a, s1);
    if (!r.success) throw new Error('fail');
    const s2 = makeSelection('d', 'dup');
    const result = addSelectionWithConflictResolution(r.archive, s2, 'keep-existing');
    expect(result.success).toBe(true);
    expect(result.selection?.selectedTextSnapshot).toBe('text');
  });

  it('replace-snapshot strategy updates existing', () => {
    const a = createEmptyDesignStore();
    const s1 = makeSelection('d', 'dup');
    const r = addSelection(a, s1);
    if (!r.success) throw new Error('fail');
    const s2 = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('dup'),
      currentTextSnapshot: 'new', selectedTextSnapshot: 'new', qualification: 'current-curriculum',
    });
    const result = addSelectionWithConflictResolution(r.archive, s2, 'replace-snapshot');
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.selection?.selectedTextSnapshot).toBe('new');
  });

  it('cancel strategy returns without changes', () => {
    const a = createEmptyDesignStore();
    const s1 = makeSelection('d', 'dup');
    const r = addSelection(a, s1);
    if (!r.success) throw new Error('fail');
    const s2 = makeSelection('d', 'dup');
    const result = addSelectionWithConflictResolution(r.archive, s2, 'cancel');
    expect(result.success).toBe(true);
    expect(result.archive.selections.length).toBe(1);
  });

  it('markSourceStatusChanged adds warning', () => {
    const a = createEmptyDesignStore();
    const s = makeSelection();
    const r = addSelection(a, s);
    if (!r.success) throw new Error('fail');
    const result = markSourceStatusChanged(r.archive, s.id, 'decision-revoked');
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.selection?.warnings.some(w => w.code.includes('REVOKED'))).toBe(true);
    expect(result.selection?.comparisonState).toBe('source-updated');
  });

  it('markSourceStatusChanged for unavailable', () => {
    const a = createEmptyDesignStore();
    const s = makeSelection();
    const r = addSelection(a, s);
    if (!r.success) throw new Error('fail');
    const result = markSourceStatusChanged(r.archive, s.id, 'source-unavailable');
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.selection?.comparisonState).toBe('source-unavailable');
  });

  it('no mutation of input archive', () => {
    const a = createEmptyDesignStore();
    const s = makeSelection();
    const r = addSelection(a, s);
    if (!r.success) throw new Error('fail');
    expect(a.selections.length).toBe(0);
    expect(r.archive.selections.length).toBe(1);
  });
});