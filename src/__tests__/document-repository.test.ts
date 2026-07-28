import { describe, it, expect } from 'vitest';
import {
  createEmptyDocumentArchive,
  createDocumentInArchive,
  getDocument,
  listDocuments,
  getVersion,
  getVersionList,
  getCurrentVersion,
  setDocumentCurrentVersion,
  transitionDocumentStatus,
  archiveDocument,
  supersedeDocument,
  duplicateDocument,
  verifyIntegrity,
  addVersion,
  createInstitutionalSnapshot,
  createSectionParagraph,
} from '../domain/documents';

function makeSnapshot() {
  return createInstitutionalSnapshot('Istituto Test', {
    configured: true,
    academicYearLabel: '2024-2025',
  });
}

describe('createDocumentInArchive', () => {
  it('creates document with version 1 in archive', () => {
    const archive = createEmptyDocumentArchive();
    const result = createDocumentInArchive(archive, {
      documentType: 'teaching-design',
      title: 'Progettazione',
    }, { sections: [createSectionParagraph('Contenuto')] }, makeSnapshot());

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.document.status).toBe('draft');
    expect(result.version.versionNumber).toBe(1);
    expect(result.archive.documents).toHaveLength(1);
    expect(result.archive.versions).toHaveLength(1);
  });

  it('fails with empty content', () => {
    const archive = createEmptyDocumentArchive();
    const result = createDocumentInArchive(archive, {
      documentType: 'report',
      title: 'Test',
    }, { sections: [] }, makeSnapshot());

    expect(result.success).toBe(false);
  });

  it('preserves original archive when creation fails', () => {
    const archive = createEmptyDocumentArchive();
    createDocumentInArchive(archive, {
      documentType: 'report',
      title: 'Test',
    }, { sections: [] }, makeSnapshot());

    expect(archive.documents).toHaveLength(0);
  });
});

describe('getDocument', () => {
  it('retrieves document by ID', () => {
    const archive = createEmptyDocumentArchive();
    const result = createDocumentInArchive(archive, {
      documentType: 'meeting-minutes', title: 'Riunione',
    }, { sections: [createSectionParagraph('Ordine del giorno')] }, makeSnapshot());
    if (!result.success) return;

    const doc = getDocument(result.archive, result.document.id);
    expect(doc?.title).toBe('Riunione');
  });

  it('returns undefined for missing ID', () => {
    const archive = createEmptyDocumentArchive();
    expect(getDocument(archive, 'nonexistent')).toBeUndefined();
  });
});

describe('listDocuments', () => {
  it('returns all documents when no filter', () => {
    const archive = createEmptyDocumentArchive();
    createDocumentInArchive(archive, {
      documentType: 'report', title: 'A',
    }, { sections: [createSectionParagraph('A')] }, makeSnapshot());
    createDocumentInArchive(archive, {
      documentType: 'meeting-minutes', title: 'B',
    }, { sections: [createSectionParagraph('B')] }, makeSnapshot());

    // Note: createDocumentInArchive returns new archive, so we need to chain
    let a = createEmptyDocumentArchive();
    let r1 = createDocumentInArchive(a, { documentType: 'report', title: 'A' }, { sections: [createSectionParagraph('A')] }, makeSnapshot());
    if (!r1.success) return;
    let r2 = createDocumentInArchive(r1.archive, { documentType: 'meeting-minutes', title: 'B' }, { sections: [createSectionParagraph('B')] }, makeSnapshot());
    if (!r2.success) return;

    const docs = listDocuments(r2.archive);
    expect(docs).toHaveLength(2);
  });

  it('filters by document type', () => {
    let a = createEmptyDocumentArchive();
    let r1 = createDocumentInArchive(a, { documentType: 'report', title: 'A' }, { sections: [createSectionParagraph('A')] }, makeSnapshot());
    if (!r1.success) return;
    let r2 = createDocumentInArchive(r1.archive, { documentType: 'meeting-minutes', title: 'B' }, { sections: [createSectionParagraph('B')] }, makeSnapshot());
    if (!r2.success) return;

    const docs = listDocuments(r2.archive, { documentType: 'report' });
    expect(docs).toHaveLength(1);
    expect(docs[0].title).toBe('A');
  });
});

describe('getVersion and getVersionList', () => {
  it('retrieves version by ID', () => {
    let a = createEmptyDocumentArchive();
    let r = createDocumentInArchive(a, { documentType: 'report', title: 'V' }, { sections: [createSectionParagraph('V')] }, makeSnapshot());
    if (!r.success) return;

    const v = getVersion(r.archive, r.version.id);
    expect(v?.versionNumber).toBe(1);
  });

  it('lists versions for document', () => {
    let a = createEmptyDocumentArchive();
    let r = createDocumentInArchive(a, { documentType: 'report', title: 'V' }, { sections: [createSectionParagraph('V')] }, makeSnapshot());
    if (!r.success) return;

    const versions = getVersionList(r.archive, r.document.id);
    expect(versions).toHaveLength(1);
  });
});

describe('getCurrentVersion', () => {
  it('returns the version pointed by currentVersionRef', () => {
    let a = createEmptyDocumentArchive();
    let r = createDocumentInArchive(a, { documentType: 'report', title: 'V' }, { sections: [createSectionParagraph('V')] }, makeSnapshot());
    if (!r.success) return;

    const cv = getCurrentVersion(r.archive, r.document);
    expect(cv?.id).toBe(r.version.id);
  });
});

describe('setDocumentCurrentVersion', () => {
  it('updates current version pointer', () => {
    let a = createEmptyDocumentArchive();
    let r = createDocumentInArchive(a, { documentType: 'report', title: 'V' }, { sections: [createSectionParagraph('V1')] }, makeSnapshot());
    if (!r.success) return;

    const doc = r.document;
    const v1 = r.version;
    // Create v2 by adding to versions
    let a2 = addVersion(r.archive, { ...v1, id: 'v2' as never, versionNumber: 2, previousVersionRef: v1.id });

    const sr = setDocumentCurrentVersion(a2, doc.id, 'v2' as never);
    expect(sr.success).toBe(true);
    if (!sr.success) return;
    expect(sr.document.currentVersionRef).toBe('v2' as never);
  });
});

describe('transitionDocumentStatus', () => {
  it('transitions draft to in-progress', () => {
    let a = createEmptyDocumentArchive();
    let r = createDocumentInArchive(a, { documentType: 'report', title: 'T' }, { sections: [createSectionParagraph('T')] }, makeSnapshot());
    if (!r.success) return;

    const tr = transitionDocumentStatus(r.archive, r.document.id, 'in-progress');
    expect(tr.success).toBe(true);
    if (!tr.success) return;
    expect(tr.document.status).toBe('in-progress');
  });

  it('rejects invalid transition', () => {
    let a = createEmptyDocumentArchive();
    let r = createDocumentInArchive(a, { documentType: 'report', title: 'T' }, { sections: [createSectionParagraph('T')] }, makeSnapshot());
    if (!r.success) return;

    const tr = transitionDocumentStatus(r.archive, r.document.id, 'completed');
    expect(tr.success).toBe(false);
  });
});

describe('archiveDocument', () => {
  it('archives a document in proper state', () => {
    let a = createEmptyDocumentArchive();
    let r = createDocumentInArchive(a, { documentType: 'report', title: 'T' }, { sections: [createSectionParagraph('T')] }, makeSnapshot());
    if (!r.success) return;

    // Go to in-progress then completed then we can archive
    let r2 = transitionDocumentStatus(r.archive, r.document.id, 'in-progress');
    if (!r2.success) return;
    let r3 = transitionDocumentStatus(r2.archive, r.document.id, 'completed');
    if (!r3.success) return;

    const ar = archiveDocument(r3.archive, r.document.id);
    expect(ar.success).toBe(true);
    if (!ar.success) return;
    expect(ar.document.status).toBe('archived');
  });
});

describe('supersedeDocument', () => {
  it('rejects supersede from draft', () => {
    let a = createEmptyDocumentArchive();
    let r = createDocumentInArchive(a, { documentType: 'report', title: 'T' }, { sections: [createSectionParagraph('T')] }, makeSnapshot());
    if (!r.success) return;

    const sr = supersedeDocument(r.archive, r.document.id);
    expect(sr.success).toBe(false);
  });
});

describe('duplicateDocument', () => {
  it('creates a copy of the document', () => {
    let a = createEmptyDocumentArchive();
    let r = createDocumentInArchive(a, { documentType: 'report', title: 'Originale' }, { sections: [createSectionParagraph('Contenuto')] }, makeSnapshot());
    if (!r.success) return;

    const dr = duplicateDocument(r.archive, r.document.id);
    expect(dr.success).toBe(true);
    if (!dr.success) return;
    expect(dr.document.title).toBe('Originale (copia)');
    expect(dr.document.id).not.toBe(r.document.id);
    expect(dr.archive.documents).toHaveLength(2);
  });
});

describe('verifyIntegrity', () => {
  it('returns valid for empty archive', () => {
    expect(verifyIntegrity(createEmptyDocumentArchive()).valid).toBe(true);
  });

  it('detects issues in malformed archive', () => {
    const archive = createEmptyDocumentArchive();
    const doc = createDocumentInArchive(archive, { documentType: 'report', title: 'X' }, { sections: [createSectionParagraph('X')] }, makeSnapshot());
    if (!doc.success) return;
    doc.archive.documents[0] = { ...doc.archive.documents[0], currentVersionRef: 'missing' as never };
    const result = verifyIntegrity(doc.archive);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});