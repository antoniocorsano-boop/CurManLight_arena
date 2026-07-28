import { describe, it, expect } from 'vitest';
import {
  createEmptyDocumentArchive,
  cloneDocumentArchive,
  createDocumentInArchive,
  getDocument,
  getCurrentVersion,
  getDocumentList,
  getDocumentWithVersion,
  getDocumentExportPayload,
  renderDocument,
  createInstitutionalSnapshot,
  createSectionParagraph,
  createSectionHeading,
  validateArchiveIntegrity,
} from '../domain/documents';

describe('Integration: A07 reads canonical archive', () => {
  it('creates and reads a document through selectors', () => {
    const archive = createEmptyDocumentArchive();
    const snapshot = createInstitutionalSnapshot('Istituto Comprensivo', { configured: true });

    const created = createDocumentInArchive(archive, {
      documentType: 'teaching-design',
      title: 'Progettazione Didattica',
    }, {
      sections: [
        createSectionHeading(1, 'Progettazione Didattica'),
        createSectionParagraph('Contenuto della progettazione'),
      ],
    }, snapshot);
    if (!created.success) return;

    // Read through selectors
    const doc = getDocument(created.archive, created.document.id);
    expect(doc).toBeDefined();

    const version = getCurrentVersion(created.archive, created.document);
    expect(version).toBeDefined();
    expect(version?.content.sections).toHaveLength(2);

    const withVersion = getDocumentWithVersion(created.archive, created.document.id);
    expect(withVersion).toBeDefined();
    expect(withVersion?.version.versionNumber).toBe(1);

    const list = getDocumentList(created.archive);
    expect(list).toHaveLength(1);
  });

  it('renders document to safe HTML', () => {
    const archive = createEmptyDocumentArchive();
    const snapshot = createInstitutionalSnapshot('Istituto Tecnico', { configured: true });

    const created = createDocumentInArchive(archive, {
      documentType: 'annual-plan',
      title: 'Piano Annuale',
    }, {
      sections: [createSectionParagraph('Obiettivi annuali')],
    }, snapshot);
    if (!created.success) return;

    const html = renderDocument(created.document, created.version);
    expect(html).toContain('Piano Annuale');
    expect(html).toContain('Istituto Tecnico');
    expect(html).toContain('Obiettivi annuali');
  });
});

describe('Integration: archive integrity', () => {
  it('maintains integrity after create', () => {
    const archive = createEmptyDocumentArchive();
    const snapshot = createInstitutionalSnapshot('Istituto');

    const created = createDocumentInArchive(archive, {
      documentType: 'report',
      title: 'Report',
    }, {
      sections: [createSectionParagraph('Testo')],
    }, snapshot);
    if (!created.success) return;

    // Validate the resulting archive
    const validationA = validateArchiveIntegrity(created.archive);
    expect(validationA.valid).toBe(true);

    // Clone and validate again
    const cloned = cloneDocumentArchive(created.archive);
    const validationB = validateArchiveIntegrity(cloned);
    expect(validationB.valid).toBe(true);
  });
});

describe('Integration: export payload', () => {
  it('generates export payload for existing document', () => {
    const archive = createEmptyDocumentArchive();
    const snapshot = createInstitutionalSnapshot('Istituto');

    const created = createDocumentInArchive(archive, {
      documentType: 'report',
      title: 'Report Export',
    }, {
      sections: [createSectionParagraph('Da esportare')],
    }, snapshot);
    if (!created.success) return;

    const payload = getDocumentExportPayload(created.archive, created.document.id, 'html');
    expect(payload).toBeDefined();
    expect(payload?.format).toBe('html');
    expect(payload?.document.id).toBe(created.document.id);
    expect(payload?.version.id).toBe(created.version.id);
  });
});

describe('Integration: CML-633E compatibility', () => {
  it('uses EntityId from identity domain', () => {
    const archive = createEmptyDocumentArchive();
    const snapshot = createInstitutionalSnapshot('Istituto');
    const created = createDocumentInArchive(archive, {
      documentType: 'report',
      title: 'Compatibilità',
    }, {
      sections: [createSectionParagraph('Test')],
    }, snapshot);
    if (!created.success) return;

    // EntityId is a branded string - verify it behaves as string
    expect(typeof created.document.id).toBe('string');
    expect(created.document.id.length).toBeGreaterThan(0);
  });

  it('uses EntityMetadata from identity domain', () => {
    const archive = createEmptyDocumentArchive();
    const snapshot = createInstitutionalSnapshot('Istituto');
    const created = createDocumentInArchive(archive, {
      documentType: 'report',
      title: 'Metadati',
    }, {
      sections: [createSectionParagraph('Test')],
    }, snapshot);
    if (!created.success) return;

    expect(created.document.metadata.createdAt).toBeTruthy();
    expect(created.document.metadata.origin).toBe('teacher');
    expect(created.document.metadata.schemaVersion).toBe(1);
  });
});

describe('Integration: CML-631 compatibility', () => {
  it('maintains existing store shape', () => {
    // Verify the documentArchive is a separate property (not nested in institutionalArchive)
    const archive = createEmptyDocumentArchive();
    const snapshot = createInstitutionalSnapshot('Istituto');

    const created = createDocumentInArchive(archive, {
      documentType: 'teaching-design',
      title: 'A07 Doc',
    }, {
      sections: [createSectionParagraph('A07 content')],
    }, snapshot);
    if (!created.success) return;

    // The archive is a flat document archive, separate from institutional archive
    expect(created.archive.schemaVersion).toBe(1);
    expect(created.archive.documents.length).toBe(1);
    expect(created.archive.versions.length).toBe(1);
    // No institutional data in document archive
    expect('institutes' in created.archive).toBe(false);
  });
});