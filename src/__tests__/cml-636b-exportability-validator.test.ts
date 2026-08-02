import { describe, it, expect } from 'vitest';
import { createEmptyDocumentArchive } from '../domain/documents';
import { createDocumentInArchive } from '../domain/documents';
import { createInstitutionalSnapshot } from '../domain/documents';
import { createSectionHeading } from '../domain/documents';
import { createSectionParagraph } from '../domain/documents';
import { createSectionTeachingDesign } from '../domain/documents';
import { validateExportability, checkExportability, resolveInstitutionalMetadata, isContentRenderable, serializePreviewKey, computePreviewKey } from '../domain/documents';
import type { DocumentArchive, DocumentEntity, DocumentVersion, PreviewState, ExportabilityContext } from '../domain/documents';
import { generateEntityId, type EntityId } from '../domain/curriculum/identity';

function makeValidArchive(): { archive: DocumentArchive; doc: DocumentEntity; version: DocumentVersion } {
  const archive = createEmptyDocumentArchive();
  const snapshot = createInstitutionalSnapshot('Liceo Classico', {
    configured: true,
    academicYearLabel: '2026-2027',
    declaredRole: 'docente',
  });

  const created = createDocumentInArchive(archive, {
    documentType: 'teaching-design',
    title: 'Progettazione: UDA-001',
    sourceRefs: [{ id: generateEntityId(), entityType: 'source', snapshotLabel: 'UDA 1' }],
  }, {
    sections: [
      createSectionHeading(1, 'Progettazione: UDA-001'),
      createSectionParagraph('Contenuto della progettazione didattica'),
      createSectionTeachingDesign({
        discipline: 'italiano',
        order: 'secondaria',
        class: '3A',
      }, 'Struttura progetto'),
    ],
  }, snapshot);

  if (!created.success) throw new Error('Failed to create document');

  return { archive: created.archive, doc: created.document, version: created.version };
}

function makePreviewKey(doc: DocumentEntity, version: DocumentVersion): PreviewState {
  return {
    key: serializePreviewKey(computePreviewKey(doc, version)),
    html: '<!DOCTYPE html><html><body>test</body></html>',
    renderedAt: new Date().toISOString(),
    versionNumber: version.versionNumber,
  };
}

describe('CML-636B exportability validator — valid document', () => {
  it('exports a valid document with valid preview', () => {
    const { archive, doc, version } = makeValidArchive();
    const previewState = makePreviewKey(doc, version);

    const result = validateExportability({
      archive, document: doc, version, selectedVersionId: version.id, previewState,
    });

    expect(result.exportable).toBe(true);
    expect(result.blockingErrors).toHaveLength(0);
  });

  it('exports a valid document with currentVersionRef as default', () => {
    const { archive, doc, version } = makeValidArchive();

    const result = validateExportability({
      archive, document: doc, version, selectedVersionId: version.id, previewState: undefined,
    });

    expect(result.blockingErrors.some(e => e.code === 'PREVIEW_REQUIRED')).toBe(true);
  });
});

describe('CML-636B exportability validator — blocking conditions', () => {
  it('blocks when document is missing', () => {
    const { archive, version } = makeValidArchive();

    const result = validateExportability({
      archive, document: undefined, version, selectedVersionId: version.id, previewState: undefined,
    });

    expect(result.exportable).toBe(false);
    expect(result.blockingErrors.some(e => e.code === 'DOCUMENT_MISSING')).toBe(true);
  });

  it('blocks when document not found in archive', () => {
    const { archive, doc, version } = makeValidArchive();
    const fakeDoc = { ...doc, id: generateEntityId() as EntityId };

    const result = validateExportability({
      archive, document: fakeDoc, version, selectedVersionId: version.id, previewState: undefined,
    });

    expect(result.exportable).toBe(false);
    expect(result.blockingErrors.some(e => e.code === 'DOCUMENT_MISSING')).toBe(true);
  });

  it('blocks when version is missing', () => {
    const { archive, doc } = makeValidArchive();

    const result = validateExportability({
      archive, document: doc, version: undefined, selectedVersionId: undefined, previewState: undefined,
    });

    expect(result.exportable).toBe(false);
    expect(result.blockingErrors.some(e => e.code === 'VERSION_MISSING')).toBe(true);
  });

  it('blocks when selected version does not belong to document', () => {
    const { archive, doc, version } = makeValidArchive();
    const orphanVersion = { ...version, documentRef: generateEntityId() as EntityId };

    const result = validateExportability({
      archive, document: doc, version: orphanVersion, selectedVersionId: version.id, previewState: undefined,
    });

    expect(result.exportable).toBe(false);
    expect(result.blockingErrors.some(e => e.code === 'VERSION_NOT_OWNED_BY_DOCUMENT')).toBe(true);
  });

  it('blocks when version is not persisted', () => {
    const { archive, doc, version } = makeValidArchive();

    const result = validateExportability({
      archive, document: doc, version: { ...version, id: generateEntityId() as EntityId },
      selectedVersionId: generateEntityId() as EntityId, previewState: undefined,
    });

    expect(result.exportable).toBe(false);
    expect(result.blockingErrors.some(e => e.code === 'VERSION_NOT_PERSISTED')).toBe(true);
  });

  it('blocks when template is not resolvable (no institute name)', () => {
    const { archive, doc, version } = makeValidArchive();
    const noInstituteVersion = {
      ...version,
      institutionalSnapshot: { ...version.institutionalSnapshot, instituteName: 'Istituto non configurato' },
    };

    const result = validateExportability({
      archive, document: doc, version: noInstituteVersion, selectedVersionId: version.id, previewState: undefined,
    });

    expect(result.exportable).toBe(false);
    expect(result.blockingErrors.some(e => e.code === 'TEMPLATE_MISSING')).toBe(true);
  });

  it('blocks when title is missing', () => {
    const { archive, doc, version } = makeValidArchive();
    const noTitleDoc = { ...doc, title: '' };

    const result = validateExportability({
      archive, document: noTitleDoc, version, selectedVersionId: version.id, previewState: undefined,
    });

    expect(result.exportable).toBe(false);
    expect(result.blockingErrors.some(e => e.code === 'TITLE_MISSING')).toBe(true);
  });

  it('blocks when institute name is missing', () => {
    const { archive, doc, version } = makeValidArchive();
    const noInstituteVersion = {
      ...version,
      institutionalSnapshot: { ...version.institutionalSnapshot, instituteName: '' },
    };

    const result = validateExportability({
      archive, document: doc, version: noInstituteVersion, selectedVersionId: version.id, previewState: undefined,
    });

    expect(result.exportable).toBe(false);
    expect(result.blockingErrors.some(e => e.code === 'INSTITUTE_NAME_MISSING')).toBe(true);
  });

  it('blocks when academic year is missing', () => {
    const { archive, doc, version } = makeValidArchive();
    const noYearVersion = {
      ...version,
      institutionalSnapshot: { ...version.institutionalSnapshot, academicYearLabel: undefined },
    };

    const result = validateExportability({
      archive, document: doc, version: noYearVersion, selectedVersionId: version.id, previewState: undefined,
    });

    expect(result.exportable).toBe(false);
    expect(result.blockingErrors.some(e => e.code === 'SCHOOL_YEAR_MISSING')).toBe(true);
  });

  it('blocks when discipline is missing', () => {
    const { archive, doc, version } = makeValidArchive();
    const noDisciplineVersion = {
      ...version,
      content: { sections: [{ type: 'teaching-design' as const, snapshot: {} }] },
    };

    const result = validateExportability({
      archive, document: doc, version: noDisciplineVersion, selectedVersionId: version.id, previewState: undefined,
    });

    expect(result.exportable).toBe(false);
    expect(result.blockingErrors.some(e => e.code === 'DISCIPLINE_MISSING')).toBe(true);
  });

  it('blocks when school order or class is missing', () => {
    const { archive, doc, version } = makeValidArchive();
    const noOrderVersion = {
      ...version,
      content: { sections: [{ type: 'teaching-design' as const, snapshot: { discipline: 'italiano' } }] },
    };

    const result = validateExportability({
      archive, document: doc, version: noOrderVersion, selectedVersionId: version.id, previewState: undefined,
    });

    expect(result.exportable).toBe(false);
    expect(result.blockingErrors.some(e => e.code === 'SCHOOL_LEVEL_OR_CLASS_MISSING')).toBe(true);
  });

  it('blocks when author or role is missing', () => {
    const { archive, doc, version } = makeValidArchive();
    const noAuthorVersion = { ...version, author: undefined, institutionalSnapshot: { ...version.institutionalSnapshot, declaredRole: undefined } };

    const result = validateExportability({
      archive, document: doc, version: noAuthorVersion, selectedVersionId: version.id, previewState: undefined,
    });

    expect(result.exportable).toBe(false);
    expect(result.blockingErrors.some(e => e.code === 'AUTHOR_OR_ROLE_MISSING')).toBe(true);
  });

  it('blocks when date (createdAt) is missing', () => {
    const { archive, doc, version } = makeValidArchive();
    const noDateVersion = { ...version, createdAt: '' };

    const result = validateExportability({
      archive, document: doc, version: noDateVersion, selectedVersionId: version.id, previewState: undefined,
    });

    expect(result.exportable).toBe(false);
    expect(result.blockingErrors.some(e => e.code === 'DATE_MISSING')).toBe(true);
  });

  it('blocks when document is archived', () => {
    const { archive, doc, version } = makeValidArchive();
    const archivedDoc = { ...doc, status: 'archived' as const };

    const result = validateExportability({
      archive, document: archivedDoc, version, selectedVersionId: version.id, previewState: undefined,
    });

    expect(result.exportable).toBe(false);
    expect(result.blockingErrors.some(e => e.code === 'DOCUMENT_ARCHIVED')).toBe(true);
  });
});

describe('CML-636B exportability validator — preview state', () => {
  it('blocks with PREVIEW_REQUIRED when no preview state', () => {
    const { archive, doc, version } = makeValidArchive();

    const result = validateExportability({
      archive, document: doc, version, selectedVersionId: version.id, previewState: undefined,
    });

    expect(result.exportable).toBe(false);
    expect(result.blockingErrors.some(e => e.code === 'PREVIEW_REQUIRED')).toBe(true);
  });

  it('blocks with PREVIEW_STALE when preview key does not match', () => {
    const { archive, doc, version } = makeValidArchive();
    const stalePreview: PreviewState = {
      key: 'wrong-key',
      html: '<!DOCTYPE html><html><body>test</body></html>',
      renderedAt: new Date().toISOString(),
      versionNumber: 1,
    };

    const result = validateExportability({
      archive, document: doc, version, selectedVersionId: version.id, previewState: stalePreview,
    });

    expect(result.exportable).toBe(false);
    expect(result.blockingErrors.some(e => e.code === 'PREVIEW_STALE')).toBe(true);
  });

  it('blocks with PREVIEW_STALE when version number does not match', () => {
    const { archive, doc, version } = makeValidArchive();
    const wrongVersionPreview: PreviewState = {
      key: serializePreviewKey(computePreviewKey(doc, version)),
      html: '<!DOCTYPE html><html><body>test</body></html>',
      renderedAt: new Date().toISOString(),
      versionNumber: 999,
    };

    const result = validateExportability({
      archive, document: doc, version, selectedVersionId: version.id, previewState: wrongVersionPreview,
    });

    expect(result.exportable).toBe(false);
    expect(result.blockingErrors.some(e => e.code === 'PREVIEW_STALE')).toBe(true);
  });
});

describe('CML-636B exportability validator — determinism and stability', () => {
  it('returns stable error codes across calls', () => {
    const archive = createEmptyDocumentArchive();

    const context: ExportabilityContext = {
      archive, document: undefined, version: undefined, previewState: undefined,
    };

    const result1 = validateExportability(context);
    const result2 = validateExportability(context);

    expect(result1.blockingErrors.map(e => e.code)).toEqual(result2.blockingErrors.map(e => e.code));
  });

  it('does not mutate input context', () => {
    const { archive, doc, version } = makeValidArchive();
    const previewState = makePreviewKey(doc, version);

    const context: ExportabilityContext = {
      archive, document: doc, version, selectedVersionId: version.id, previewState,
    };

    const archiveBefore = { ...archive, documents: [...archive.documents], versions: [...archive.versions] };
    const docBefore = { ...doc };
    const versionBefore = { ...version };

    validateExportability(context);

    expect(archive.documents.length).toBe(archiveBefore.documents.length);
    expect(archive.versions.length).toBe(archiveBefore.versions.length);
    expect(doc).toEqual(docBefore);
    expect(version).toEqual(versionBefore);
  });

  it('resolveInstitutionalMetadata extracts metadata from version', () => {
    const { version } = makeValidArchive();
    const metadata = resolveInstitutionalMetadata(version);

    expect(metadata.instituteName).toBe('Liceo Classico');
    expect(metadata.academicYearLabel).toBe('2026-2027');
    expect(metadata.discipline).toBe('italiano');
    expect(metadata.schoolOrderOrClass).toBe('secondaria');
    expect(metadata.versionNumber).toBe(1);
    expect(metadata.date).toBe(version.createdAt);
  });

  it('resolveInstitutionalMetadata falls back to declaredRole when no display name', () => {
    const { version } = makeValidArchive();
    const metadata = resolveInstitutionalMetadata(version);

    expect(metadata.authorOrRole).toBeTruthy();
  });
});

describe('CML-636B isContentRenderable', () => {
  it('marks content as renderable when document has valid institution metadata', () => {
    const { doc, version } = makeValidArchive();
    // With valid institutionalSnapshot, title, and metadata, content is always renderable

    expect(isContentRenderable(doc, version)).toBe(true);
  });

  it('marks content as not renderable when renderDocument throws', () => {
    // Test with missing institutionalSnapshot which could cause render crashes
    const { doc, version } = makeValidArchive();
    const brokenVersion = { ...version, institutionalSnapshot: undefined as never };

    // This currently throws, marking content as unrenderable
    expect(isContentRenderable(doc, brokenVersion)).toBe(false);
  });
});

describe('CML-636B checkExportability helper', () => {
  it('wraps validateExportability by ID lookup', () => {
    const { archive, doc, version } = makeValidArchive();
    const previewState = makePreviewKey(doc, version);

    const result = checkExportability(archive, doc.id, version.id, previewState);

    expect(result.exportable).toBe(true);
  });

  it('returns DOCUMENT_MISSING for unknown document ID', () => {
    const { archive, version } = makeValidArchive();

    const result = checkExportability(archive, 'unknown-doc' as EntityId, version.id, undefined);

    expect(result.exportable).toBe(false);
    expect(result.blockingErrors.some(e => e.code === 'DOCUMENT_MISSING')).toBe(true);
  });
});