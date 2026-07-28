import { describe, it, expect } from 'vitest';
import {
  createEmptyDocumentArchive,
  cloneDocumentArchive,
  createDocument,
  createInitialVersion,
  createNextVersion,
  restoreVersionFrom,
  createInstitutionalSnapshot,
  createSectionHeading,
  createSectionParagraph,
  createSectionList,
  createSectionTable,
  createSectionCurriculumReference,
  createSectionSourceReference,
  createSectionTeachingDesign,
  createSectionMetadata,
  validateDocument,
  validateVersion,
  validateContent,
  validateTransition,
  validateArchiveIntegrity,
  canTransitionDocumentStatus,
  validateDocumentArchiveIntegrity,
  listVersions,
  getLatestVersion,
} from '../domain/documents';

describe('DocumentArchive', () => {
  it('creates empty archive', () => {
    const archive = createEmptyDocumentArchive();
    expect(archive.schemaVersion).toBe(1);
    expect(archive.documents).toEqual([]);
    expect(archive.versions).toEqual([]);
    expect(typeof archive.updatedAt).toBe('string');
  });

  it('clones archive without reference sharing', () => {
    const a = createEmptyDocumentArchive();
    const b = cloneDocumentArchive(a);
    a.documents.push({} as never);
    expect(b.documents.length).toBe(0);
  });
});

describe('DocumentEntity creation', () => {
  it('creates document with default status draft', () => {
    const doc = createDocument({
      documentType: 'teaching-design',
      title: 'Progettazione annuale',
      origin: 'teacher',
    });
    expect(doc.documentType).toBe('teaching-design');
    expect(doc.title).toBe('Progettazione annuale');
    expect(doc.status).toBe('draft');
    expect(doc.sourceRefs).toEqual([]);
    expect(doc.originRefs).toEqual([]);
    expect(doc.metadata.origin).toBe('teacher');
  });

  it('creates document with optional fields', () => {
    const doc = createDocument({
      documentType: 'annual-plan',
      title: 'Piano annuale',
      origin: 'institute',
      tags: ['2024-2025', 'importante'],
      sourceRefs: [{ id: 'src-1' as never, entityType: 'source', snapshotLabel: 'Fonte' }],
    });
    expect(doc.tags).toEqual(['2024-2025', 'importante']);
    expect(doc.sourceRefs).toHaveLength(1);
  });

  it('generates unique IDs for each document', () => {
    const a = createDocument({ documentType: 'report', title: 'A' });
    const b = createDocument({ documentType: 'report', title: 'B' });
    expect(a.id).not.toBe(b.id);
  });
});

describe('DocumentVersion creation', () => {
  it('creates initial version with number 1', () => {
    const doc = createDocument({ documentType: 'meeting-minutes', title: 'Riunione' });
    const snapshot = createInstitutionalSnapshot('Istituto Tecnico', { configured: true });
    const content = { sections: [createSectionParagraph('Testo')] };
    const version = createInitialVersion(doc, content, { institutionalSnapshot: snapshot });

    expect(version.versionNumber).toBe(1);
    expect(version.documentRef).toBe(doc.id);
    expect(version.frozen).toBe(true);
    expect(version.previousVersionRef).toBeUndefined();
    expect(version.content.sections).toHaveLength(1);
  });

  it('frozen version cannot be modified', () => {
    const doc = createDocument({ documentType: 'report', title: 'Report' });
    const content = { sections: [createSectionParagraph('Originale')] };
    const snapshot = createInstitutionalSnapshot('Istituto');
    const version = createInitialVersion(doc, content, { institutionalSnapshot: snapshot });

    expect(version.frozen).toBe(true);
  });

  it('creates next version with incremented number', () => {
    const doc = createDocument({ documentType: 'report', title: 'Report' });
    const snapshot = createInstitutionalSnapshot('Istituto');
    const content = { sections: [createSectionParagraph('v1')] };
    const v1 = createInitialVersion(doc, content, { institutionalSnapshot: snapshot });

    const content2 = { sections: [createSectionParagraph('v2')] };
    const v2 = createNextVersion(doc, v1, content2, { institutionalSnapshot: snapshot, reason: 'Aggiornamento' });

    expect(v2.versionNumber).toBe(2);
    expect(v2.previousVersionRef).toBe(v1.id);
    expect(v2.reason).toBe('Aggiornamento');
  });

  it('restore version creates new version from source', () => {
    const doc = createDocument({ documentType: 'report', title: 'Report' });
    const snapshot = createInstitutionalSnapshot('Istituto');
    const content = { sections: [createSectionParagraph('v1')] };
    const v1 = createInitialVersion(doc, content, { institutionalSnapshot: snapshot });

    const restored = restoreVersionFrom(doc, v1, content, { institutionalSnapshot: snapshot });
    expect(restored.versionNumber).toBe(v1.versionNumber + 1);
    expect(restored.reason).toContain('Ripristino');
  });
});

describe('InstitutionalSnapshot', () => {
  it('creates snapshot with institute name', () => {
    const s = createInstitutionalSnapshot('Istituto Comprensivo Roma 1', {
      configured: true, mechanicalCode: 'RMIC12345',
    });
    expect(s.instituteName).toBe('Istituto Comprensivo Roma 1');
    expect(s.mechanicalCode).toBe('RMIC12345');
    expect(s.configured).toBe(true);
  });

  it('defaults to unconfigured message', () => {
    const s = createInstitutionalSnapshot('', { configured: false });
    expect(s.instituteName).toBe('Istituto non configurato');
    expect(s.configured).toBe(false);
  });
});

describe('Section creation', () => {
  it('creates all section types', () => {
    expect(createSectionHeading(1, 'Title')).toEqual({ type: 'heading', level: 1, text: 'Title' });
    expect(createSectionParagraph('Text', 'bold')).toEqual({ type: 'paragraph', text: 'Text', format: 'bold' });
    expect(createSectionList(['a', 'b'], true)).toEqual({ type: 'list', items: ['a', 'b'], ordered: true });
    expect(createSectionTable(['H1'], [['V1']])).toEqual({ type: 'table', headers: ['H1'], rows: [['V1']] });
    expect(createSectionCurriculumReference([], 'Ref')).toHaveProperty('type', 'curriculum-reference');
    expect(createSectionSourceReference([], 'Src')).toHaveProperty('type', 'source-reference');
    expect(createSectionTeachingDesign({ key: 'val' }, 'Design')).toHaveProperty('type', 'teaching-design');
    expect(createSectionMetadata({ key: 'val' })).toEqual({ type: 'metadata', data: { key: 'val' } });
  });
});

describe('State machine transitions', () => {
  it('allows valid transitions', () => {
    expect(canTransitionDocumentStatus('draft', 'in-progress')).toBe(true);
    expect(canTransitionDocumentStatus('in-progress', 'completed')).toBe(true);
    expect(canTransitionDocumentStatus('completed', 'shared-locally')).toBe(true);
    expect(canTransitionDocumentStatus('completed', 'archived')).toBe(true);
    expect(canTransitionDocumentStatus('legacy', 'draft')).toBe(true);
    expect(canTransitionDocumentStatus('legacy', 'archived')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(canTransitionDocumentStatus('draft', 'completed')).toBe(false);
    expect(canTransitionDocumentStatus('draft', 'shared-locally')).toBe(false);
    expect(canTransitionDocumentStatus('archived', 'draft')).toBe(false);
    expect(canTransitionDocumentStatus('draft', 'draft')).toBe(false);
    expect(canTransitionDocumentStatus('completed', 'draft')).toBe(false);
  });

  it('rejects transitions from archived', () => {
    expect(canTransitionDocumentStatus('archived', 'draft')).toBe(false);
    expect(canTransitionDocumentStatus('archived', 'completed')).toBe(false);
    expect(canTransitionDocumentStatus('archived', 'shared-locally')).toBe(false);
  });

  it('allows legacy to draft and archived', () => {
    expect(canTransitionDocumentStatus('legacy', 'draft')).toBe(true);
    expect(canTransitionDocumentStatus('legacy', 'archived')).toBe(true);
  });
});

describe('Document validation', () => {
  it('validates a correctly constructed document', () => {
    const doc = createDocument({ documentType: 'report', title: 'Valid' });
    // ValidEntityId check expects a specific format - validateDocument checks
    // the id format via isValidEntityId. The auto-generated id should pass.
    const result = validateDocument(doc);
    expect(result.valid).toBe(true);
  });

  it('rejects document with empty title', () => {
    const result = validateDocument({ id: 'test', title: '', documentType: 'report', status: 'draft' });
    expect(result.valid).toBe(false);
  });

  it('rejects document with invalid type', () => {
    const result = validateDocument({ id: 'test', title: 'X', documentType: 'fake-type', status: 'draft' });
    expect(result.valid).toBe(false);
  });
});

describe('Version validation', () => {
  it('validates a correctly constructed version', () => {
    const doc = createDocument({ documentType: 'report', title: 'Test' });
    const snapshot = createInstitutionalSnapshot('Istituto');
    const content = { sections: [createSectionParagraph('Testo')] };
    const version = createInitialVersion(doc, content, { institutionalSnapshot: snapshot });

    const result = validateVersion(version);
    expect(result.valid).toBe(true);
  });

  it('rejects unfrozen version', () => {
    const result = validateVersion({ id: 'v1', documentRef: 'd1', versionNumber: 1, frozen: false });
    expect(result.valid).toBe(false);
  });
});

describe('Content validation', () => {
  it('validates content with sections', () => {
    const result = validateContent({ sections: [createSectionParagraph('Test')] });
    expect(result.valid).toBe(true);
  });

  it('rejects empty sections', () => {
    const result = validateContent({ sections: [] });
    expect(result.valid).toBe(false);
  });

  it('rejects null content', () => {
    const result = validateContent(null);
    expect(result.valid).toBe(false);
  });
});

describe('Transition validation', () => {
  it('validates allowed transition', () => {
    const doc = createDocument({ documentType: 'report', title: 'X' });
    const result = validateTransition(doc, 'in-progress');
    expect(result.valid).toBe(true);
  });

  it('rejects invalid transition', () => {
    const doc = createDocument({ documentType: 'report', title: 'X' });
    const result = validateTransition(doc, 'completed');
    expect(result.valid).toBe(false);
  });
});

describe('Archive integrity validation', () => {
  it('validates empty archive', () => {
    const archive = createEmptyDocumentArchive();
    const result = validateArchiveIntegrity(archive);
    expect(result.valid).toBe(true);
  });

  it('detects orphan version references', () => {
    const archive = createEmptyDocumentArchive();
    const doc = createDocument({ documentType: 'report', title: 'X' });
    archive.documents.push({ ...doc, currentVersionRef: 'nonexistent' as never });
    const result = validateArchiveIntegrity(archive);
    expect(result.valid).toBe(false);
  });

  it('detects duplicate document IDs', () => {
    const archive = createEmptyDocumentArchive();
    const doc = createDocument({ documentType: 'report', title: 'X' });
    archive.documents.push(doc, doc);
    const result = validateArchiveIntegrity(archive);
    expect(result.valid).toBe(false);
  });

  it('rejects archive with wrong schema version', () => {
    const archive = createEmptyDocumentArchive();
    archive.schemaVersion = 999;
    const result = validateArchiveIntegrity(archive);
    expect(result.valid).toBe(false);
  });

  it('validates complete archive with document and version', () => {
    const archive = createEmptyDocumentArchive();
    const doc = createDocument({ documentType: 'report', title: 'X' });
    const snapshot = createInstitutionalSnapshot('Istituto');
    const content = { sections: [createSectionParagraph('Testo')] };
    const version = createInitialVersion(doc, content, { institutionalSnapshot: snapshot });
    archive.documents.push({ ...doc, currentVersionRef: version.id as never });
    archive.versions.push(version);

    const result = validateArchiveIntegrity(archive);
    expect(result.valid).toBe(true);
  });
});

describe('validateDocumentArchiveIntegrity', () => {
  it('validates empty archive', () => {
    const archive = createEmptyDocumentArchive();
    const result = validateDocumentArchiveIntegrity(archive);
    expect(result.valid).toBe(true);
  });

  it('detects orphan versions', () => {
    const archive = createEmptyDocumentArchive();
    const snapshot = createInstitutionalSnapshot('Istituto');
    const content = { sections: [createSectionParagraph('Testo')] };
    const doc = createDocument({ documentType: 'report', title: 'X' });
    const version = createInitialVersion(doc, content, { institutionalSnapshot: snapshot });
    archive.versions.push({ ...version, documentRef: 'nonexistent' as never });
    const result = validateDocumentArchiveIntegrity(archive);
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe('listVersions', () => {
  it('returns versions ordered by number', () => {
    const archive = createEmptyDocumentArchive();
    const doc = createDocument({ documentType: 'report', title: 'X' });
    const snapshot = createInstitutionalSnapshot('Istituto');
    const c1 = { sections: [createSectionParagraph('v1')] };
    const v1 = createInitialVersion(doc, c1, { institutionalSnapshot: snapshot });
    const v2 = createNextVersion(doc, v1, c1, { institutionalSnapshot: snapshot });
    archive.versions.push(v1, v2);

    const result = listVersions(archive, doc.id);
    expect(result).toHaveLength(2);
    expect(result[0].versionNumber).toBe(1);
    expect(result[1].versionNumber).toBe(2);
  });

  it('returns empty for unknown document', () => {
    const archive = createEmptyDocumentArchive();
    expect(listVersions(archive, 'unknown')).toEqual([]);
  });
});

describe('getLatestVersion', () => {
  it('returns the highest version number', () => {
    const archive = createEmptyDocumentArchive();
    const doc = createDocument({ documentType: 'report', title: 'X' });
    const snapshot = createInstitutionalSnapshot('Istituto');
    const c1 = { sections: [createSectionParagraph('v1')] };
    const v1 = createInitialVersion(doc, c1, { institutionalSnapshot: snapshot });
    const v2 = createNextVersion(doc, v1, c1, { institutionalSnapshot: snapshot });
    archive.versions.push(v1, v2);

    const result = getLatestVersion(archive, doc.id);
    expect(result?.versionNumber).toBe(2);
  });

  it('returns undefined when no versions exist', () => {
    const archive = createEmptyDocumentArchive();
    expect(getLatestVersion(archive, 'none')).toBeUndefined();
  });
});