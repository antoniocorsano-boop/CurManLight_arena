import { describe, it, expect } from 'vitest';
import { createDocumentSectionsFromDesignSelections, enrichDocumentContentWithSelections } from '../domain/design/traceabilityA07';
import { createDesignCurriculumSelection } from '../domain/design/constructors';
import { DESIGN_QUALIFICATION_LABELS } from '../domain/design/types';
import type { EntityReference, EntityId } from '../domain/curriculum/identity/types';
import type { DocumentContent } from '../domain/documents/types';

function makeRef(id: string, entityType = 'curriculum-node'): EntityReference {
  return { id: id as EntityId, entityType: entityType as never };
}

describe('A04→A07 traceability', () => {
  it('creates sections from selections', () => {
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 'text', selectedTextSnapshot: 'text', qualification: 'current-curriculum',
    });
    const sections = createDocumentSectionsFromDesignSelections([s]);
    expect(sections.length).toBeGreaterThan(0);
    expect(sections[0].type).toBe('heading');
  });

  it('preserves qualification label', () => {
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A03', sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 'text', selectedTextSnapshot: 'text', qualification: 'proposed-content',
    });
    const sections = createDocumentSectionsFromDesignSelections([s]);
    const headingText = sections.map(sec => 'text' in sec ? (sec as { text: string }).text : '').join(' ');
    expect(headingText).toContain(DESIGN_QUALIFICATION_LABELS['proposed-content']);
  });

  it('preserves snapshot text', () => {
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 'original', selectedTextSnapshot: 'selected text', qualification: 'current-curriculum',
    });
    const sections = createDocumentSectionsFromDesignSelections([s]);
    const allText = sections.map(sec => 'text' in sec ? (sec as { text: string }).text : '').join(' ');
    expect(allText).toContain('selected text');
  });

  it('preserves sources', () => {
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 'text', selectedTextSnapshot: 'text', qualification: 'current-curriculum',
      sourceRefs: [makeRef('src-1', 'source')],
    });
    const sections = createDocumentSectionsFromDesignSelections([s]);
    const allText = sections.map(sec => 'text' in sec ? (sec as { text: string }).text : '').join(' ');
    expect(allText).toContain('Fonti');
  });

  it('preserves evidences', () => {
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 'text', selectedTextSnapshot: 'text', qualification: 'current-curriculum',
      evidenceRefs: [makeRef('ev-1', 'evidence')],
    });
    const sections = createDocumentSectionsFromDesignSelections([s]);
    const allText = sections.map(sec => 'text' in sec ? (sec as { text: string }).text : '').join(' ');
    expect(allText).toContain('Evidenze');
  });

  it('preserves warnings', () => {
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 'text', selectedTextSnapshot: 'text', qualification: 'current-curriculum',
    });
    s.warnings = [{ code: 'TEST', message: 'test warning' }];
    const sections = createDocumentSectionsFromDesignSelections([s]);
    const allText = sections.map(sec => {
      if ('text' in sec) return (sec as { text: string }).text;
      if ('items' in sec) return (sec as { items: string[] }).items.join(' ');
      return '';
    }).join(' ');
    expect(allText).toContain('Avvisi');
    expect(allText).toContain('test warning');
  });

  it('includes disclaimer about non-officiality', () => {
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 'text', selectedTextSnapshot: 'text', qualification: 'current-curriculum',
    });
    const sections = createDocumentSectionsFromDesignSelections([s]);
    const allText = sections.map(sec => 'text' in sec ? (sec as { text: string }).text : '').join(' ');
    expect(allText).toContain('Non costituisce adozione ufficiale');
  });

  it('enriches existing content', () => {
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 'text', selectedTextSnapshot: 'text', qualification: 'current-curriculum',
    });
    const existing: DocumentContent = { sections: [{ type: 'heading', level: 1, text: 'Existing' }] };
    const enriched = enrichDocumentContentWithSelections(existing, [s]);
    expect(enriched.sections.length).toBeGreaterThan(existing.sections.length);
  });

  it('handles empty selections', () => {
    const sections = createDocumentSectionsFromDesignSelections([]);
    expect(sections.length).toBe(2); // heading + disclaimer
  });

  it('preserves source area', () => {
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A03', sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 'text', selectedTextSnapshot: 'text', qualification: 'proposed-content',
    });
    const sections = createDocumentSectionsFromDesignSelections([s]);
    const allText = sections.map(sec => 'text' in sec ? (sec as { text: string }).text : '').join(' ');
    expect(allText).toContain('A03');
  });

  it('preserves transfer timestamp', () => {
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 'text', selectedTextSnapshot: 'text', qualification: 'current-curriculum',
    });
    const sections = createDocumentSectionsFromDesignSelections([s]);
    const allText = sections.map(sec => {
      if ('text' in sec) return (sec as { text: string }).text;
      if ('items' in sec) return (sec as { items: string[] }).items.join(' ');
      return '';
    }).join(' ');
    expect(allText).toContain('Trasferito');
  });

  it('legacy content preserves warnings in export', () => {
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A03', sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 'text', selectedTextSnapshot: 'text', qualification: 'legacy-content',
    });
    s.warnings = [{ code: 'LEGACY', message: 'legacy warning' }];
    const sections = createDocumentSectionsFromDesignSelections([s]);
    const allText = sections.map(sec => {
      if ('text' in sec) return (sec as { text: string }).text;
      if ('items' in sec) return (sec as { items: string[] }).items.join(' ');
      return '';
    }).join(' ');
    expect(allText).toContain('legacy warning');
  });

  it('no official/adopted claims in export', () => {
    const s = createDesignCurriculumSelection({
      designRef: makeRef('d'), sourceArea: 'A02', sourceEntityRef: makeRef('s'),
      currentTextSnapshot: 'text', selectedTextSnapshot: 'text', qualification: 'planned-institute-content',
    });
    const sections = createDocumentSectionsFromDesignSelections([s]);
    const allText = sections.map(sec => {
      if ('text' in sec) return (sec as { text: string }).text;
      if ('items' in sec) return (sec as { items: string[] }).items.join(' ');
      return '';
    }).join(' ');
    // "ufficiale" appears only in the disclaimer "Non costituisce adozione ufficiale"
    // which DENIES officiality. Check for positive claims instead.
    expect(allText).not.toContain('approvato');
    expect(allText).not.toContain('adottato');
    expect(allText).not.toMatch(/curricolo ufficiale/i);
    expect(allText).not.toMatch(/decisione ufficiale/i);
    expect(allText).not.toMatch(/contenuto ufficiale/i);
    // The disclaimer is allowed
    expect(allText).toContain('Non costituisce adozione ufficiale');
  });
});