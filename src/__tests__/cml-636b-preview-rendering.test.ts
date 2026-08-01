import { describe, it, expect } from 'vitest';
import {
  renderDocument,
  renderSection,
  renderSnapshotHeader,
  renderVersionMetadata,
  renderProvenance,
  createDocument,
  createInitialVersion,
  createNextVersion,
  createInstitutionalSnapshot,
  createSectionHeading,
  createSectionParagraph,
  createSectionList,
  createSectionTable,
  createSectionCurriculumReference,
  createSectionSourceReference,
  createSectionTeachingDesign,
  createSectionMetadata,
} from '../domain/documents';
import {
  computeContentFingerprint,
  computeMetadataFingerprint,
  computeTemplateId,
  computePreviewKey,
  serializePreviewKey,
  isPreviewStale,
  extractTeachingDesignMetadata,
} from '../domain/documents';
import type { DocumentContent } from '../domain/documents';
import type { EntityReference } from '../domain/curriculum/identity';
import { generateEntityId } from '../domain/curriculum/identity';

describe('CML-636B renderDocument — determinism', () => {
  it('produces identical HTML for same document/version', () => {
    const doc = createDocument({ documentType: 'teaching-design', title: 'Progettazione' });
    const snapshot = createInstitutionalSnapshot('Istituto Test', { configured: true });
    const content: DocumentContent = { sections: [createSectionParagraph('Testo')] };
    const version = createInitialVersion(doc, content, { institutionalSnapshot: snapshot });

    const html1 = renderDocument(doc, version);
    const html2 = renderDocument(doc, version);

    expect(html1).toBe(html2);
  });

  it('changes HTML when content changes', () => {
    const doc = createDocument({ documentType: 'teaching-design', title: 'Progettazione' });
    const snapshot = createInstitutionalSnapshot('Istituto Test', { configured: true });

    const v1 = createInitialVersion(doc, { sections: [createSectionParagraph('Testo 1')] }, { institutionalSnapshot: snapshot });
    const v2 = createInitialVersion(doc, { sections: [createSectionParagraph('Testo 2')] }, { institutionalSnapshot: snapshot });

    const html1 = renderDocument(doc, v1);
    const html2 = renderDocument(doc, v2);

    expect(html1).not.toBe(html2);
  });

  it('changes HTML when version changes', () => {
    const doc = createDocument({ documentType: 'teaching-design', title: 'Progettazione' });
    const snapshot = createInstitutionalSnapshot('Istituto Test', { configured: true });

    const v1 = createInitialVersion(doc, { sections: [createSectionParagraph('Testo')] }, { institutionalSnapshot: snapshot });
    const v2 = createNextVersion(doc, v1, { sections: [createSectionParagraph('Testo')] }, { institutionalSnapshot: snapshot });

    const html1 = renderDocument(doc, v1);
    const html2 = renderDocument(doc, v2);

    expect(html1).not.toBe(html2);
  });
});

describe('CML-636B renderDocument — HTML safety (escaping)', () => {
  it('escapes script tags in paragraphs', () => {
    const doc = createDocument({ documentType: 'report', title: 'Test' });
    const snapshot = createInstitutionalSnapshot('Istituto', { configured: true });
    const content: DocumentContent = {
      sections: [createSectionParagraph('<script>alert("x")</script>')],
    };
    const version = createInitialVersion(doc, content, { institutionalSnapshot: snapshot });

    const html = renderDocument(doc, version);

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes script tags in headings', () => {
    const doc = createDocument({ documentType: 'report', title: 'Test' });
    const snapshot = createInstitutionalSnapshot('Istituto');
    const content: DocumentContent = {
      sections: [createSectionHeading(1, '<script>alert("x")</script>')],
    };
    const version = createInitialVersion(doc, content, { institutionalSnapshot: snapshot });

    const html = renderDocument(doc, version);

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes HTML in list items', () => {
    const doc = createDocument({ documentType: 'report', title: 'Test' });
    const snapshot = createInstitutionalSnapshot('Istituto');
    const content: DocumentContent = {
      sections: [createSectionList(['<img src=x onerror=alert(1)>'], false)],
    };
    const version = createInitialVersion(doc, content, { institutionalSnapshot: snapshot });

    const html = renderDocument(doc, version);

    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });

  it('escapes HTML in table cells', () => {
    const doc = createDocument({ documentType: 'report', title: 'Test' });
    const snapshot = createInstitutionalSnapshot('Istituto');
    const content: DocumentContent = {
      sections: [createSectionTable(['<script>'], [['<img src=x>']])],
    };
    const version = createInitialVersion(doc, content, { institutionalSnapshot: snapshot });

    const html = renderDocument(doc, version);

    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;img');
  });

  it('preserves Italian characters', () => {
    const doc = createDocument({ documentType: 'report', title: 'àèìòù' });
    const snapshot = createInstitutionalSnapshot('Istituto');
    const content: DocumentContent = {
      sections: [createSectionParagraph('ÀÈÌÒÙ é ó')],
    };
    const version = createInitialVersion(doc, content, { institutionalSnapshot: snapshot });

    const html = renderDocument(doc, version);

    expect(html).toContain('àèìòù');
    expect(html).toContain('ÀÈÌÒÙ');
    expect(html).toContain('é ó');
  });
});

describe('CML-636B renderDocument — single source of truth', () => {
  it('includes document identity and version in output', () => {
    const doc = createDocument({ documentType: 'teaching-design', title: 'Progettazione: UDA-1' });
    const snapshot = createInstitutionalSnapshot('Liceo Test', { configured: true });
    const content: DocumentContent = { sections: [createSectionParagraph('Contenuto')] };
    const version = createInitialVersion(doc, content, { institutionalSnapshot: snapshot });

    const html = renderDocument(doc, version);

    expect(html).toContain('Progettazione: UDA-1');
    expect(html).toContain('Liceo Test');
    expect(html).toContain('Versione: 1');
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('includes provenance from source refs', () => {
    const doc = createDocument({
      documentType: 'teaching-design',
      title: 'Progettazione',
      sourceRefs: [{ id: generateEntityId() as never, entityType: 'source', snapshotLabel: 'UDA Acqua' }],
    });
    const snapshot = createInstitutionalSnapshot('Istituto', { configured: true });
    const content: DocumentContent = { sections: [createSectionParagraph('Testo')] };
    const version = createInitialVersion(doc, content, { institutionalSnapshot: snapshot });

    const html = renderDocument(doc, version);

    expect(html).toContain('Provenienza');
    expect(html).toContain('UDA Acqua');
  });

  it('does not inject synthetic fallback when content is minimal', () => {
    const doc = createDocument({ documentType: 'report', title: 'Minimale' });
    const snapshot = createInstitutionalSnapshot('Istituto');
    const content: DocumentContent = { sections: [createSectionParagraph('Solo testo')] };
    const version = createInitialVersion(doc, content, { institutionalSnapshot: snapshot });

    const html = renderDocument(doc, version);

    expect(html).not.toContain('placeholder');
    expect(html).not.toContain('dati fittizi');
    expect(html).toContain('Solo testo');
  });
});

describe('CML-636B renderSection — all section types', () => {
  it('renders heading with correct level', () => {
    expect(renderSection(createSectionHeading(2, 'Sottotitolo'))).toContain('<h2>Sottotitolo</h2>');
  });

  it('renders paragraph with format', () => {
    expect(renderSection(createSectionParagraph('Testo', 'bold'))).toContain('<strong>Testo</strong>');
  });

  it('renders ordered and unordered lists', () => {
    expect(renderSection(createSectionList(['A', 'B'], true))).toContain('<ol>');
    expect(renderSection(createSectionList(['A', 'B'], false))).toContain('<ul>');
  });

  it('renders table with headers and rows', () => {
    const html = renderSection(createSectionTable(['Col1', 'Col2'], [['A', 'B']]));
    expect(html).toContain('<th>Col1</th>');
    expect(html).toContain('<td>B</td>');
  });

  it('renders curriculum reference section', () => {
    const refs: EntityReference[] = [{ id: generateEntityId() as never, entityType: 'curriculum-node', snapshotLabel: 'Competenza 1' }];
    const html = renderSection(createSectionCurriculumReference(refs, 'Riferimenti'));
    expect(html).toContain('curriculum-refs');
    expect(html).toContain('Competenza 1');
  });

  it('renders source reference section', () => {
    const refs: EntityReference[] = [{ id: generateEntityId() as never, entityType: 'source', snapshotLabel: 'Fonte 1' }];
    const html = renderSection(createSectionSourceReference(refs, 'Fonti'));
    expect(html).toContain('source-refs');
    expect(html).toContain('Fonte 1');
  });

  it('renders teaching design section', () => {
    const html = renderSection(createSectionTeachingDesign({ discipline: 'matematica' }, 'Design'));
    expect(html).toContain('teaching-design-snapshot');
    expect(html).toContain('matematica');
  });

  it('renders metadata section', () => {
    const html = renderSection(createSectionMetadata({ autore: 'Mario', classe: '3A' }));
    expect(html).toContain('metadata-section');
    expect(html).toContain('Mario');
  });
});

describe('CML-636B renderSnapshotHeader — institutional metadata', () => {
  it('renders institute name', () => {
    const html = renderSnapshotHeader(createInstitutionalSnapshot('Liceo Classico', { configured: true }));
    expect(html).toContain('Liceo Classico');
    expect(html).toContain('institute-name');
  });

  it('includes optional fields when present', () => {
    const html = renderSnapshotHeader(createInstitutionalSnapshot('ITIS', {
      configured: true, mechanicalCode: 'ITIS123', siteName: 'Sede Centrale', academicYearLabel: '2024-2025',
    }));
    expect(html).toContain('ITIS123');
    expect(html).toContain('Sede Centrale');
    expect(html).toContain('2024-2025');
  });

  it('omits optional fields when absent', () => {
    const html = renderSnapshotHeader(createInstitutionalSnapshot('ITIS'));
    expect(html).toContain('ITIS');
    expect(html).not.toContain('mechanical-code');
    expect(html).not.toContain('site-name');
  });
});

describe('CML-636B renderVersionMetadata', () => {
  it('renders version number, date, and author', () => {
    const doc = createDocument({ documentType: 'report', title: 'Test' });
    const version = createInitialVersion(
      doc,
      { sections: [createSectionParagraph('test')] },
      { institutionalSnapshot: createInstitutionalSnapshot('Istituto'), author: { displayName: 'Mario Rossi', role: 'docente', assertion: 'self-declared' as const } },
    );

    const html = renderVersionMetadata(version);
    expect(html).toContain('Versione: 1');
    expect(html).toContain('Mario Rossi');
    expect(html).toContain('Data:');
    expect(html).toContain('doc-date');
  });

  it('falls back to role when displayName absent', () => {
    const doc = createDocument({ documentType: 'report', title: 'Test' });
    const version = createInitialVersion(
      doc,
      { sections: [createSectionParagraph('test')] },
      { institutionalSnapshot: createInstitutionalSnapshot('Istituto'), author: { displayName: '', role: 'dirigente', assertion: 'self-declared' as const } },
    );

    const html = renderVersionMetadata(version);
    expect(html).toContain('dirigente');
  });

  it('shows "Non disponibile" when author missing', () => {
    const doc = createDocument({ documentType: 'report', title: 'Test' });
    const version = createInitialVersion(
      doc,
      { sections: [createSectionParagraph('test')] },
      { institutionalSnapshot: createInstitutionalSnapshot('Istituto') },
    );

    const html = renderVersionMetadata(version);
    expect(html).toContain('Non disponibile');
  });
});

describe('CML-636B renderProvenance', () => {
  it('renders provenance list when refs present', () => {
    const refs: EntityReference[] = [
      { id: 'uda-1' as never, entityType: 'source', snapshotLabel: 'UDA 1' },
      { id: 'uda-2' as never, entityType: 'source', snapshotLabel: 'UDA 2' },
    ];
    const html = renderProvenance(refs);
    expect(html).toContain('Provenienza');
    expect(html).toContain('UDA 1');
    expect(html).toContain('UDA 2');
  });

  it('returns empty string when no refs', () => {
    expect(renderProvenance([])).toBe('');
  });
});

describe('CML-636B preview key — determinism and fingerprinting', () => {
  it('computeContentFingerprint is deterministic', () => {
    const c1: DocumentContent = { sections: [createSectionParagraph('Test')] };
    const c2: DocumentContent = { sections: [createSectionParagraph('Test')] };

    const f1 = computeContentFingerprint(c1);
    const f2 = computeContentFingerprint(c2);

    expect(f1).toBe(f2);
  });

  it('computeContentFingerprint changes when content changes', () => {
    const c1: DocumentContent = { sections: [createSectionParagraph('Test 1')] };
    const c2: DocumentContent = { sections: [createSectionParagraph('Test 2')] };

    expect(computeContentFingerprint(c1)).not.toBe(computeContentFingerprint(c2));
  });

  it('computeMetadataFingerprint is deterministic', () => {
    const doc = createDocument({ documentType: 'teaching-design', title: 'Test' });
    const snapshot = createInstitutionalSnapshot('Istituto');
    const version = createInitialVersion(doc, { sections: [createSectionParagraph('x')] }, { institutionalSnapshot: snapshot });

    const f1 = computeMetadataFingerprint(doc, version);
    const f2 = computeMetadataFingerprint(doc, version);

    expect(f1).toBe(f2);
  });

  it('computeMetadataFingerprint changes when title changes', () => {
    const snapshot = createInstitutionalSnapshot('Istituto');

    const doc1 = createDocument({ documentType: 'report', title: 'Titolo 1' });
    const doc2 = createDocument({ documentType: 'report', title: 'Titolo 2' });
    const version = createInitialVersion(doc1, { sections: [createSectionParagraph('x')] }, { institutionalSnapshot: snapshot });

    expect(computeMetadataFingerprint(doc1, version)).not.toBe(computeMetadataFingerprint(doc2, version));
  });

  it('computeTemplateId is deterministic', () => {
    const doc = createDocument({ documentType: 'teaching-design', title: 'Test' });
    const snapshot = createInstitutionalSnapshot('Istituto');
    const version = createInitialVersion(doc, { sections: [] }, { institutionalSnapshot: snapshot });

    const id1 = computeTemplateId(doc, version);
    const id2 = computeTemplateId(doc, version);

    expect(id1).toBe(id2);
  });

  it('computeTemplateId changes when institute name changes', () => {
    const doc = createDocument({ documentType: 'teaching-design', title: 'Test' });
    const v1 = createInitialVersion(doc, { sections: [] }, { institutionalSnapshot: createInstitutionalSnapshot('Istituto A') });
    const v2 = createInitialVersion(doc, { sections: [] }, { institutionalSnapshot: createInstitutionalSnapshot('Istituto B') });

    expect(computeTemplateId(doc, v1)).not.toBe(computeTemplateId(doc, v2));
  });

  it('computePreviewKey combines document, version, template, content, and metadata', () => {
    const doc = createDocument({ documentType: 'teaching-design', title: 'Test' });
    const snapshot = createInstitutionalSnapshot('Istituto');
    const version = createInitialVersion(doc, { sections: [createSectionParagraph('x')] }, { institutionalSnapshot: snapshot });

    const key = computePreviewKey(doc, version);

    expect(key.documentId).toBe(doc.id);
    expect(key.versionId).toBe(version.id);
    expect(key.templateId).toBeTruthy();
    expect(key.contentFingerprint).toBeTruthy();
    expect(key.metadataFingerprint).toBeTruthy();
  });

  it('serializePreviewKey produces deterministic string', () => {
    const doc = createDocument({ documentType: 'teaching-design', title: 'Test' });
    const snapshot = createInstitutionalSnapshot('Istituto');
    const version = createInitialVersion(doc, { sections: [createSectionParagraph('x')] }, { institutionalSnapshot: snapshot });

    const s1 = serializePreviewKey(computePreviewKey(doc, version));
    const s2 = serializePreviewKey(computePreviewKey(doc, version));

    expect(s1).toBe(s2);
  });

  it('isPreviewStale returns false for matching state', () => {
    const doc = createDocument({ documentType: 'teaching-design', title: 'Test' });
    const snapshot = createInstitutionalSnapshot('Istituto');
    const version = createInitialVersion(doc, { sections: [createSectionParagraph('x')] }, { institutionalSnapshot: snapshot });

    const expectedKey = serializePreviewKey(computePreviewKey(doc, version));
    const state = { key: expectedKey, html: '', renderedAt: '', versionNumber: 1 };

    expect(isPreviewStale(state, doc, version)).toBe(false);
  });

  it('isPreviewStale returns true when state is null', () => {
    const doc = createDocument({ documentType: 'teaching-design', title: 'Test' });
    const snapshot = createInstitutionalSnapshot('Istituto');
    const version = createInitialVersion(doc, { sections: [createSectionParagraph('x')] }, { institutionalSnapshot: snapshot });

    expect(isPreviewStale(null, doc, version)).toBe(true);
  });

  it('isPreviewStale returns true when content changes', () => {
    const doc = createDocument({ documentType: 'teaching-design', title: 'Test' });
    const snapshot = createInstitutionalSnapshot('Istituto');
    const version = createInitialVersion(doc, { sections: [createSectionParagraph('x')] }, { institutionalSnapshot: snapshot });

    const expectedKey = serializePreviewKey(computePreviewKey(doc, version));
    const state = { key: expectedKey, html: '', renderedAt: '', versionNumber: 1 };

    const version2 = createInitialVersion(doc, { sections: [createSectionParagraph('changed')] }, { institutionalSnapshot: snapshot });
    expect(isPreviewStale(state, doc, version2)).toBe(true);
  });

  it('isPreviewStale returns true when template (institute) changes', () => {
    const doc = createDocument({ documentType: 'teaching-design', title: 'Test' });
    const v1 = createInitialVersion(doc, { sections: [createSectionParagraph('x')] }, { institutionalSnapshot: createInstitutionalSnapshot('Istituto A') });
    const v2 = createInitialVersion(doc, { sections: [createSectionParagraph('x')] }, { institutionalSnapshot: createInstitutionalSnapshot('Istituto B') });

    const expectedKey = serializePreviewKey(computePreviewKey(doc, v1));
    const state = { key: expectedKey, html: '', renderedAt: '', versionNumber: 1 };

    expect(isPreviewStale(state, doc, v2)).toBe(true);
  });

  it('isPreviewStale returns true when metadata changes', () => {
    const snapshot = createInstitutionalSnapshot('Istituto');
    const doc1 = createDocument({ documentType: 'report', title: 'Titolo 1' });
    const doc2 = createDocument({ documentType: 'report', title: 'Titolo 2' });
    const version = createInitialVersion(doc1, { sections: [createSectionParagraph('x')] }, { institutionalSnapshot: snapshot });

    const expectedKey = serializePreviewKey(computePreviewKey(doc1, version));
    const state = { key: expectedKey, html: '', renderedAt: '', versionNumber: 1 };

    expect(isPreviewStale(state, doc2, version)).toBe(true);
  });
});

describe('CML-636B extractTeachingDesignMetadata', () => {
  it('extracts discipline, order, and class from teaching design snapshot', () => {
    const content: DocumentContent = {
      sections: [createSectionTeachingDesign({
        discipline: 'matematica',
        order: 'secondaria',
        class: '3A',
        period: 'Primo Quadro',
        hours: 10,
      })],
    };

    const meta = extractTeachingDesignMetadata(content);
    expect(meta.discipline).toBe('matematica');
    expect(meta.order).toBe('secondaria');
    expect(meta.class).toBe('3A');
    expect(meta.period).toBe('Primo Quadro');
    expect(meta.hours).toBe(10);
  });

  it('returns empty object when no teaching design section', () => {
    const content: DocumentContent = {
      sections: [createSectionParagraph('test')],
    };

    expect(extractTeachingDesignMetadata(content)).toEqual({});
  });
});

describe('CML-636B renderDocument — same HTML for preview and print', () => {
  it('produces HTML suitable for both preview iframe and print window', () => {
    const doc = createDocument({ documentType: 'teaching-design', title: 'Progettazione' });
    const snapshot = createInstitutionalSnapshot('Liceo Test', { configured: true });
    const content: DocumentContent = { sections: [createSectionParagraph('Contenuto')] };
    const version = createInitialVersion(doc, content, {
      institutionalSnapshot: snapshot,
      author: { displayName: 'Docente', role: 'docente', assertion: 'self-declared' as const },
    });

    const html = renderDocument(doc, version);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
    expect(html).toContain('Contenuto');
    expect(html).toContain('Liceo Test');
    expect(html).toContain('Docente');
  });
});
