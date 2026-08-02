import { describe, it, expect } from 'vitest';
import {
  createEmptyDocumentArchive,
  createDocumentInArchive,
  createInstitutionalSnapshot,
  createSectionHeading,
  createSectionParagraph,
  createSectionTeachingDesign,
  transitionDocumentStatus,
  archiveDocument,
  applyDocumentActorContext,
  createDocumentRevision,
  setDocumentCurrentVersion,
  getDocument,
  getCurrentVersion,
  getVersion,
  getDocumentHistory,
  validateExportability,
  computePreviewKey,
  serializePreviewKey,
  renderDocument,
  verifyIntegrity,
  serializeDocumentArchive,
  deserializeDocumentArchive,
} from '../domain/documents';
import type { DocumentArchive, ParagraphSection } from '../domain/documents';
import { createSelfDeclaredActor } from '../domain/curriculum/identity';

const AUTHOR = createSelfDeclaredActor('Docente Test', 'docente');

function makeTeachingDesign(opts: { withActor?: boolean } = {}): {
  archive: DocumentArchive;
  documentId: string;
  version1Id: string;
} {
  const archive = createEmptyDocumentArchive();
  const snapshot = createInstitutionalSnapshot('Liceo Classico', {
    configured: true,
    academicYearLabel: '2026-2027',
    ...(opts.withActor ? { declaredRole: 'docente' } : {}),
  });
  const created = createDocumentInArchive(archive, {
    documentType: 'teaching-design',
    title: 'Progettazione: UDA-001',
    ...(opts.withActor ? { author: AUTHOR } : {}),
  }, {
    sections: [
      createSectionHeading(1, 'Progettazione: UDA-001'),
      createSectionParagraph('Contenuto della progettazione didattica'),
      createSectionTeachingDesign({ discipline: 'italiano', order: 'secondaria', class: '3A' }, 'Struttura progetto'),
    ],
  }, snapshot);
  if (!created.success) {
    throw new Error(`Fixture creation failed: ${created.errors.map(e => e.message).join('; ')}`);
  }
  return { archive: created.archive, documentId: created.document.id, version1Id: created.version.id };
}

function advanceToCompleted(archive: DocumentArchive, documentId: string): DocumentArchive {
  let work = archive;
  for (const status of ['in-progress', 'completed'] as const) {
    const result = transitionDocumentStatus(work, documentId, status);
    if (!result.success) throw new Error(`Transition to ${status} failed`);
    work = result.archive;
  }
  return work;
}

describe('CML-631F-R1 — regression: document created without author/role', () => {
  it('blocks export with AUTHOR_OR_ROLE_MISSING when author and role are absent', () => {
    const { archive, documentId } = makeTeachingDesign();
    const doc = getDocument(archive, documentId)!;
    const version = getCurrentVersion(archive, doc)!;
    const result = validateExportability({ archive, document: doc, version });
    expect(result.exportable).toBe(false);
    expect(result.blockingErrors.some(e => e.code === 'AUTHOR_OR_ROLE_MISSING')).toBe(true);
  });

  it('does not silently succeed: the failure is explicit and lists the author field', () => {
    const { archive, documentId } = makeTeachingDesign();
    const doc = getDocument(archive, documentId)!;
    const version = getCurrentVersion(archive, doc)!;
    const result = validateExportability({ archive, document: doc, version });
    const authorError = result.blockingErrors.find(e => e.code === 'AUTHOR_OR_ROLE_MISSING');
    expect(authorError?.field).toBe('author');
  });
});

describe('CML-631F-R1 — regression: late actor configuration', () => {
  it('applies actor context after creation without recreating the document', () => {
    const { archive, documentId } = makeTeachingDesign();
    const applied = applyDocumentActorContext(archive, documentId, AUTHOR);
    expect(applied.success).toBe(true);
    expect(applied.success).toBe(true);
    if (!applied.success) {
      throw new Error('Operazione attesa come riuscita');
    }
    expect(applied.document.id).toBe(documentId);
    const version = getCurrentVersion(applied.archive, applied.document)!;
    expect(version.author?.displayName).toBe('Docente Test');
    expect(version.author?.role).toBe('docente');
    expect(version.institutionalSnapshot.declaredRole).toBe('docente');
  });

  it('keeps the version frozen and the content untouched when applying actor context', () => {
    const { archive, documentId } = makeTeachingDesign();
    const applied = applyDocumentActorContext(archive, documentId, AUTHOR);
    expect(applied.success).toBe(true);
    if (!applied.success) {
      throw new Error('Operazione attesa come riuscita');
    }
    const version = getCurrentVersion(applied.archive, applied.document)!;
    expect(version.frozen).toBe(true);
    const paragraph = version.content.sections.find(s => s.type === 'paragraph') as ParagraphSection;
    expect(paragraph.text).toBe('Contenuto della progettazione didattica');
  });

  it('unblocks preview and print on the existing document after late actor configuration', () => {
    const { archive, documentId } = makeTeachingDesign();
    const doc = getDocument(archive, documentId)!;
    const before = validateExportability({ archive, document: doc, version: getCurrentVersion(archive, doc)! });
    expect(before.blockingErrors.some(e => e.code === 'AUTHOR_OR_ROLE_MISSING')).toBe(true);

    const applied = applyDocumentActorContext(archive, documentId, AUTHOR);
    expect(applied.success).toBe(true);
    if (!applied.success) {
      throw new Error('Operazione attesa come riuscita');
    }
    const version = getCurrentVersion(applied.archive, applied.document)!;
    const afterActor = validateExportability({ archive: applied.archive, document: applied.document, version });
    expect(afterActor.blockingErrors.some(e => e.code === 'AUTHOR_OR_ROLE_MISSING')).toBe(false);

    const previewState = {
      key: serializePreviewKey(computePreviewKey(applied.document, version)),
      html: renderDocument(applied.document, version),
      renderedAt: new Date().toISOString(),
      versionNumber: version.versionNumber,
    };
    const afterPreview = validateExportability({
      archive: applied.archive,
      document: applied.document,
      version,
      selectedVersionId: version.id,
      previewState,
    });
    expect(afterPreview.exportable).toBe(true);
  });
});

describe('CML-631F-R1 — regression: new version creation', () => {
  it('creates a new version and keeps the previous one', () => {
    const { archive, documentId, version1Id } = makeTeachingDesign();
    const doc = getDocument(archive, documentId)!;
    const v1 = getCurrentVersion(archive, doc)!;
    const revised = createDocumentRevision(archive, documentId, {
      sections: [
        createSectionHeading(1, 'Progettazione: UDA-001'),
        createSectionParagraph('Contenuto modificato'),
        createSectionTeachingDesign({ discipline: 'italiano', order: 'secondaria', class: '3A' }, 'Struttura progetto'),
      ],
    }, { reason: 'Corretto il compito di realtà' });
    expect(revised.success).toBe(true);
    expect(revised.success).toBe(true);
    if (!revised.success) {
      throw new Error('Operazione attesa come riuscita');
    }
    expect(revised.version.versionNumber).toBe(2);
    expect(revised.version.previousVersionRef).toBe(v1.id);
    expect(getCurrentVersion(revised.archive, revised.document)?.id).toBe(revised.version.id);
    const history = getDocumentHistory(revised.archive, documentId);
    expect(history).toHaveLength(2);
    const preserved = getVersion(revised.archive, version1Id)!;
    const paragraph = preserved.content.sections.find(s => s.type === 'paragraph') as ParagraphSection;
    expect(paragraph.text).toBe('Contenuto della progettazione didattica');
  });

  it('selects current or previous version without losing either', () => {
    const { archive, documentId, version1Id } = makeTeachingDesign();
    const revised = createDocumentRevision(archive, documentId, {
      sections: [
        createSectionHeading(1, 'Progettazione: UDA-001'),
        createSectionParagraph('Contenuto modificato'),
        createSectionTeachingDesign({ discipline: 'italiano', order: 'secondaria', class: '3A' }, 'Struttura progetto'),
      ],
    }, { reason: 'Revisione' });
    expect(revised.success).toBe(true);
    if (!revised.success) {
      throw new Error('Operazione attesa come riuscita');
    }

    const backToV1 = setDocumentCurrentVersion(revised.archive, documentId, version1Id);
    expect(backToV1.success).toBe(true);
    expect(backToV1.success).toBe(true);
    if (!backToV1.success) {
      throw new Error('Operazione attesa come riuscita');
    }
    expect(getCurrentVersion(backToV1.archive, backToV1.document)?.id).toBe(version1Id);

    const forwardToV2 = setDocumentCurrentVersion(backToV1.archive, documentId, revised.version.id);
    expect(forwardToV2.success).toBe(true);
    expect(forwardToV2.success).toBe(true);
    if (!forwardToV2.success) {
      throw new Error('Operazione attesa come riuscita');
    }
    expect(getCurrentVersion(forwardToV2.archive, forwardToV2.document)?.id).toBe(revised.version.id);
  });

  it('rejects a revision when content is empty', () => {
    const { archive, documentId } = makeTeachingDesign();
    const result = createDocumentRevision(archive, documentId, { sections: [] }, { reason: 'x' });
    expect(result.success).toBe(false);
  });
});

describe('CML-631F-R1 — regression: valid archiving path', () => {
  it('archives a document through draft → in-progress → completed → archived', () => {
    const { archive, documentId } = makeTeachingDesign();
    const completed = advanceToCompleted(archive, documentId);
    const archived = archiveDocument(completed, documentId);
    expect(archived.success).toBe(true);
    expect(archived.success).toBe(true);
    if (!archived.success) {
      throw new Error('Operazione attesa come riuscita');
    }
    expect(archived.document.status).toBe('archived');
  });

  it('returns an explicit error for the invalid draft → archived transition', () => {
    const { archive, documentId } = makeTeachingDesign();
    const result = archiveDocument(archive, documentId);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some(e => e.code === 'INVALID_TRANSITION')).toBe(true);
      expect(result.errors[0].message.length).toBeGreaterThan(0);
    }
  });

  it('returns an explicit error for the invalid draft → completed jump', () => {
    const { archive, documentId } = makeTeachingDesign();
    const result = transitionDocumentStatus(archive, documentId, 'completed');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some(e => e.code === 'INVALID_TRANSITION')).toBe(true);
    }
  });

  it('persists the archived status through serialization roundtrip', () => {
    const { archive, documentId } = makeTeachingDesign();
    const completed = advanceToCompleted(archive, documentId);
    const archived = archiveDocument(completed, documentId);
    expect(archived.success).toBe(true);
    if (!archived.success) {
      throw new Error('Operazione attesa come riuscita');
    }
    const deserialized = deserializeDocumentArchive(serializeDocumentArchive(archived.archive));
    expect(deserialized.success).toBe(true);
    expect(deserialized.success).toBe(true);
    if (!deserialized.success) {
      throw new Error('Operazione attesa come riuscita');
    }
    expect(getDocument(deserialized.archive!, documentId)?.status).toBe('archived');
  });
});

describe('CML-631F-R1 — regression: archived document is read-only', () => {
  it('rejects content revision of an archived document', () => {
    const { archive, documentId } = makeTeachingDesign();
    const completed = advanceToCompleted(archive, documentId);
    const archived = archiveDocument(completed, documentId);
    expect(archived.success).toBe(true);
    if (!archived.success) {
      throw new Error('Operazione attesa come riuscita');
    }
    const version = getCurrentVersion(archived.archive, archived.document)!;
    const result = createDocumentRevision(archived.archive, documentId, version.content, { reason: 'x' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some(e => e.code === 'DOCUMENT_ARCHIVED')).toBe(true);
    }
  });

  it('rejects late actor configuration of an archived document', () => {
    const { archive, documentId } = makeTeachingDesign();
    const completed = advanceToCompleted(archive, documentId);
    const archived = archiveDocument(completed, documentId);
    expect(archived.success).toBe(true);
    if (!archived.success) {
      throw new Error('Operazione attesa come riuscita');
    }
    const result = applyDocumentActorContext(archived.archive, documentId, AUTHOR);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some(e => e.code === 'DOCUMENT_ARCHIVED')).toBe(true);
    }
  });

  it('blocks export of an archived document with DOCUMENT_ARCHIVED', () => {
    const { archive, documentId } = makeTeachingDesign({ withActor: true });
    const completed = advanceToCompleted(archive, documentId);
    const archived = archiveDocument(completed, documentId);
    expect(archived.success).toBe(true);
    if (!archived.success) {
      throw new Error('Operazione attesa come riuscita');
    }
    const version = getCurrentVersion(archived.archive, archived.document)!;
    const result = validateExportability({ archive: archived.archive, document: archived.document, version });
    expect(result.blockingErrors.some(e => e.code === 'DOCUMENT_ARCHIVED')).toBe(true);
  });
});

describe('CML-631F-R1 — regression: reopen after persistence', () => {
  it('reopens a document with both versions after serialize/deserialize', () => {
    const { archive, documentId } = makeTeachingDesign({ withActor: true });
    const doc = getDocument(archive, documentId)!;
    const v1 = getCurrentVersion(archive, doc)!;
    const revised = createDocumentRevision(archive, documentId, {
      sections: [
        createSectionHeading(1, 'Progettazione: UDA-001'),
        createSectionParagraph('Contenuto della seconda versione'),
        createSectionTeachingDesign({ discipline: 'italiano', order: 'secondaria', class: '3A' }, 'Struttura progetto'),
      ],
    }, { reason: 'Seconda stesura' });
    expect(revised.success).toBe(true);
    if (!revised.success) {
      throw new Error('Operazione attesa come riuscita');
    }

    const roundtripped = deserializeDocumentArchive(serializeDocumentArchive(revised.archive));
    expect(roundtripped.success).toBe(true);
    expect(roundtripped.success).toBe(true);
    if (!roundtripped.success) {
      throw new Error('Operazione attesa come riuscita');
    }
    const rtArchive = roundtripped.archive!;
    const reopened = getDocument(rtArchive, documentId);
    expect(reopened).toBeDefined();
    const history = getDocumentHistory(rtArchive, documentId);
    expect(history).toHaveLength(2);
    expect(getCurrentVersion(rtArchive, reopened!)?.versionNumber).toBe(2);
    expect(getVersion(rtArchive, v1.id)).toBeDefined();
  });

  it('keeps archive integrity valid after actor context, revision and archiving', () => {
    const { archive, documentId } = makeTeachingDesign();
    const applied = applyDocumentActorContext(archive, documentId, AUTHOR);
    expect(applied.success).toBe(true);
    if (!applied.success) {
      throw new Error('Operazione attesa come riuscita');
    }
    const revised = createDocumentRevision(applied.archive, documentId, {
      sections: [
        createSectionHeading(1, 'Progettazione: UDA-001'),
        createSectionParagraph('Contenuto modificato'),
        createSectionTeachingDesign({ discipline: 'italiano', order: 'secondaria', class: '3A' }, 'Struttura progetto'),
      ],
    }, { reason: 'Revisione' });
    expect(revised.success).toBe(true);
    if (!revised.success) {
      throw new Error('Operazione attesa come riuscita');
    }
    const completed = advanceToCompleted(revised.archive, documentId);
    const archived = archiveDocument(completed, documentId);
    expect(archived.success).toBe(true);
    if (!archived.success) {
      throw new Error('Operazione attesa come riuscita');
    }
    expect(verifyIntegrity(archived.archive).valid).toBe(true);
  });
});
