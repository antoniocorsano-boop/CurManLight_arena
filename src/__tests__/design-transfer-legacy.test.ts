import { describe, it, expect } from 'vitest';
import { enrichUdaWithSelections, extractSelectionsFromUda, classifyLegacyUdaContent } from '../domain/design/udaAdapter';
import { createDesignCurriculumSelection } from '../domain/design/constructors';
import type { EntityReference, EntityId } from '../domain/curriculum/identity/types';

function makeRef(id: string, entityType = 'curriculum-node'): EntityReference {
  return { id: id as EntityId, entityType: entityType as never };
}

describe('UDA legacy adapter', () => {
  it('preserves UDA text in fallback', () => {
    const uda = { id: 'uda-1', traguardi: ['Traguardo 1'], obiettivi: ['Obiettivo 1'] };
    const result = enrichUdaWithSelections(uda, []);
    expect(result.fallbackText).toContain('Traguardo 1');
    expect(result.fallbackText).toContain('Obiettivo 1');
  });

  it('classifies legacy content', () => {
    const result = classifyLegacyUdaContent(false, false, false, false);
    expect(result.qualification).toBe('legacy-content');
    expect(result.warnings.length).toBe(4);
  });

  it('classifies with some fields present', () => {
    const result = classifyLegacyUdaContent(true, true, false, false);
    expect(result.qualification).toBe('legacy-content');
    expect(result.warnings.length).toBe(2);
  });

  it('extractSelectionsFromUda returns empty (no invention)', () => {
    const result = extractSelectionsFromUda({ id: 'uda-1' });
    expect(result).toEqual([]);
  });

  it('enriches with canonical selections', () => {
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 'text', selectedTextSnapshot: 'text', qualification: 'current-curriculum',
    });
    const uda = { id: 'uda-1', traguardi: ['T1'] };
    const result = enrichUdaWithSelections(uda, [s]);
    expect(result.curriculumReferences.length).toBe(1);
    expect(result.curriculumReferences[0].qualification).toBe('current-curriculum');
    expect(result.curriculumReferences[0].isLegacy).toBe(false);
  });

  it('marks legacy selections as legacy', () => {
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A03', sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 'text', selectedTextSnapshot: 'text', qualification: 'legacy-content',
    });
    const uda = { id: 'uda-1' };
    const result = enrichUdaWithSelections(uda, [s]);
    expect(result.curriculumReferences[0].isLegacy).toBe(true);
  });

  it('does not mutate source UDA', () => {
    const uda = { id: 'uda-1', traguardi: ['T1'] };
    const original = JSON.parse(JSON.stringify(uda));
    enrichUdaWithSelections(uda, []);
    expect(uda).toEqual(original);
  });

  it('handles UDA without traguardi/obiettivi', () => {
    const uda = { id: 'uda-1' };
    const result = enrichUdaWithSelections(uda, []);
    expect(result.fallbackText).toBe('');
    expect(result.curriculumReferences).toEqual([]);
  });

  it('preserves warnings in enriched references', () => {
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 'text', selectedTextSnapshot: 'text', qualification: 'current-curriculum',
    });
    s.warnings = [{ code: 'TEST', message: 'warning text' }];
    const result = enrichUdaWithSelections({ id: 'uda-1' }, [s]);
    expect(result.curriculumReferences[0].warnings).toContain('warning text');
  });
});