import { describe, it, expect } from 'vitest';
import {
  createEmptyDesignArchive,
  cloneDesignArchive,
  createDesignCurriculumSelection,
} from '../domain/design/constructors';
import {
  validateDesignCurriculumSelection,
  validateDesignArchiveIntegrity,
} from '../domain/design/validators';
import {
  createEmptyDesignStore,
  addSelection,
  getSelection,
  listSelectionsForDesign,
  replaceSelectionSnapshot,
  removeSelectionLogically,
  findSelectionBySource,
  compareSelectionWithSource,
} from '../domain/design/archive';
import { VALID_DESIGN_QUALIFICATIONS } from '../domain/design/types';
import { addSelectionWithConflictResolution, detectConflicts } from '../domain/design/conflicts';
import { enrichUdaWithSelections, classifyLegacyUdaContent } from '../domain/design/udaAdapter';
import { createDocumentSectionsFromDesignSelections } from '../domain/design/traceabilityA07';
import type { EntityReference, EntityId } from '../domain/curriculum/identity/types';

function makeRef(id: string, entityType = 'curriculum-node'): EntityReference {
  return { id: id as EntityId, entityType: entityType as never };
}

describe('DesignArchive', () => {
  it('creates empty archive with schema version 1', () => {
    const a = createEmptyDesignArchive();
    expect(a.schemaVersion).toBe(1);
    expect(a.selections).toEqual([]);
  });

  it('clone does not mutate original', () => {
    const a = createEmptyDesignArchive();
    const clone = cloneDesignArchive(a);
    clone.selections.push({} as never);
    expect(a.selections.length).toBe(0);
  });
});

describe('DesignCurriculumSelection', () => {
  it('creates valid selection', () => {
    const s = createDesignCurriculumSelection({
      designRef: makeRef('design-1'),
      sourceArea: 'A02',
      sourceEntityRef: makeRef('src-1'),
      currentTextSnapshot: 'text',
      selectedTextSnapshot: 'text',
      qualification: 'current-curriculum',
    });
    expect(s.qualification).toBe('current-curriculum');
    expect(s.sourceArea).toBe('A02');
    expect(typeof s.id).toBe('string');
  });

  it('all five qualifications are accepted', () => {
    for (const q of VALID_DESIGN_QUALIFICATIONS) {
      const s = createDesignCurriculumSelection({
        designRef: makeRef('d'),
        sourceArea: 'A02',
        sourceEntityRef: makeRef('s'),
        currentTextSnapshot: 't',
        selectedTextSnapshot: 't',
        qualification: q,
      });
      expect(VALID_DESIGN_QUALIFICATIONS).toContain(s.qualification);
    }
  });
});

describe('validators', () => {
  it('rejects null/undefined selection', () => {
    expect(validateDesignCurriculumSelection(null).valid).toBe(false);
    expect(validateDesignCurriculumSelection(undefined).valid).toBe(false);
  });

  it('accepts valid selection', () => {
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'),
      sourceArea: 'A02',
      sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 't',
      selectedTextSnapshot: 't',
      qualification: 'current-curriculum',
    });
    expect(validateDesignCurriculumSelection(s).valid).toBe(true);
  });

  it('rejects invalid qualification', () => {
    const invalid = { ...createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 't', selectedTextSnapshot: 't', qualification: 'current-curriculum',
    }), qualification: 'not-a-qualification' as never };
    expect(validateDesignCurriculumSelection(invalid).valid).toBe(false);
  });

  it('validates archive integrity', () => {
    const a = createEmptyDesignStore();
    a.schemaVersion = 99;
    expect(validateDesignArchiveIntegrity(a).valid).toBe(false);
    const a2 = createEmptyDesignStore();
    expect(validateDesignArchiveIntegrity(a2).valid).toBe(true);
  });
});

describe('archive repository', () => {
  it('adds and retrieves selection', () => {
    const a = createEmptyDesignStore();
    const s = createDesignCurriculumSelection({
      designRef: makeRef('design-1'),
      sourceArea: 'A02',
      sourceEntityRef: makeRef('src-1'),
      currentTextSnapshot: 'text',
      selectedTextSnapshot: 'text',
      qualification: 'current-curriculum',
    });
    const r = addSelection(a, s);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.archive.selections.length).toBe(1);
    expect(getSelection(r.archive, s.id)).toBeDefined();
  });

  it('lists selections for design', () => {
    const a = createEmptyDesignStore();
    const s1 = createDesignCurriculumSelection({
      designRef: makeRef('design-a'), sourceArea: 'A02', sourceEntityRef: makeRef('s1'),
      currentTextSnapshot: 'a', selectedTextSnapshot: 'a', qualification: 'current-curriculum',
    });
    const s2 = createDesignCurriculumSelection({
      designRef: makeRef('design-b'), sourceArea: 'A02', sourceEntityRef: makeRef('s2'),
      currentTextSnapshot: 'b', selectedTextSnapshot: 'b', qualification: 'current-curriculum',
    });
    const r1 = addSelection(a, s1);
    if (!r1.success) throw new Error('fail');
    const r2 = addSelection(r1.archive, s2);
    if (!r2.success) throw new Error('fail');
    expect(listSelectionsForDesign(r2.archive, 'design-a').length).toBe(1);
    expect(listSelectionsForDesign(r2.archive, 'design-b').length).toBe(1);
  });

  it('replaces snapshot', () => {
    const a = createEmptyDesignStore();
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 'old', selectedTextSnapshot: 'old', qualification: 'current-curriculum',
    });
    const r = addSelection(a, s);
    if (!r.success) throw new Error('fail');
    const rep = replaceSelectionSnapshot(r.archive, s.id, 'new');
    expect(rep.success).toBe(true);
    if (!rep.success) return;
    expect(rep.selection?.selectedTextSnapshot).toBe('new');
  });

  it('removes selection logically', () => {
    const a = createEmptyDesignStore();
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 'text', selectedTextSnapshot: 'text', qualification: 'current-curriculum',
    });
    const r = addSelection(a, s);
    if (!r.success) throw new Error('fail');
    const rem = removeSelectionLogically(r.archive, s.id);
    expect(rem.success).toBe(true);
    if (!rem.success) return;
    expect(rem.archive.selections.length).toBe(0);
  });

  it('finds selection by source', () => {
    const a = createEmptyDesignStore();
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('src-x'),
      currentTextSnapshot: 't', selectedTextSnapshot: 't', qualification: 'current-curriculum',
    });
    const r = addSelection(a, s);
    if (!r.success) throw new Error('fail');
    expect(findSelectionBySource(r.archive, 'src-x').length).toBe(1);
    expect(findSelectionBySource(r.archive, 'src-y').length).toBe(0);
  });

  it('compareSelectionWithSource returns source-current', () => {
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 'text', selectedTextSnapshot: 'text', qualification: 'current-curriculum',
    });
    expect(compareSelectionWithSource(s, 'text')).toBe('source-current');
    expect(compareSelectionWithSource(s, 'changed')).toBe('source-updated');
    expect(compareSelectionWithSource(s, undefined)).toBe('source-unavailable');
  });
});

describe('conflicts', () => {
  it('detects duplicate source', () => {
    const a = createEmptyDesignStore();
    const s1 = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('dup'),
      currentTextSnapshot: 't', selectedTextSnapshot: 't', qualification: 'current-curriculum',
    });
    const r = addSelection(a, s1);
    if (!r.success) throw new Error('fail');
    const s2 = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('dup'),
      currentTextSnapshot: 't2', selectedTextSnapshot: 't2', qualification: 'current-curriculum',
    });
    const conflicts = detectConflicts(s2, r.archive);
    expect(conflicts.some(c => c.type === 'duplicate-source')).toBe(true);
  });

  it('keep-existing strategy returns existing', () => {
    const a = createEmptyDesignStore();
    const s1 = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('dup'),
      currentTextSnapshot: 't1', selectedTextSnapshot: 't1', qualification: 'current-curriculum',
    });
    const r = addSelection(a, s1);
    if (!r.success) throw new Error('fail');
    const s2 = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('dup'),
      currentTextSnapshot: 't2', selectedTextSnapshot: 't2', qualification: 'current-curriculum',
    });
    const result = addSelectionWithConflictResolution(r.archive, s2, 'keep-existing');
    expect(result.success).toBe(true);
    expect(result.selection!.selectedTextSnapshot).toBe('t1');
  });
});

describe('UDA adapter', () => {
  it('enriches UDA with selections', () => {
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 'text', selectedTextSnapshot: 'text', qualification: 'current-curriculum',
    });
    const uda = { id: 'uda-1', traguardi: ['Obiettivo 1'], obiettivi: ['O1'] };
    const enriched = enrichUdaWithSelections(uda, [s]);
    expect(enriched.curriculumReferences.length).toBe(1);
    expect(enriched.curriculumReferences[0].qualification).toBe('current-curriculum');
    expect(enriched.fallbackText).toBe('Obiettivo 1; O1');
  });

  it('classifies legacy UDA content', () => {
    const result = classifyLegacyUdaContent(false, false, false, false);
    expect(result.qualification).toBe('legacy-content');
    expect(result.warnings.length).toBe(4);
  });
});

describe('A04→A07 traceability', () => {
  it('creates document sections from selections', () => {
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'),
      sourceArea: 'A03',
      sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 'current',
      selectedTextSnapshot: 'selected',
      qualification: 'proposed-content',
      sourceRefs: [makeRef('src', 'source')],
      evidenceRefs: [makeRef('ev', 'evidence')],
    });
    s.warnings = [{ code: 'TEST', message: 'warning' }];

    const sections = createDocumentSectionsFromDesignSelections([s]);
    expect(sections.length).toBeGreaterThan(3);
    expect(sections[0].type).toBe('heading');
    expect(sections.some(sec => sec.type === 'paragraph' && 'text' in sec && (sec as { text: string }).text === 'selected')).toBe(true);
  });
});