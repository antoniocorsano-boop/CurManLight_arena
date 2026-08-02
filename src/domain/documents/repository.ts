import { touchMetadata } from '../curriculum/identity';
import type { ActorReference, EntityId, EntityReference } from '../curriculum/identity';
import { cloneDocumentArchive, createDocument, createInitialVersion } from './constructors';
import type { CreateDocumentInput } from './constructors';
import type {
  DocumentArchive,
  DocumentContent,
  DocumentEntity,
  DocumentError,
  DocumentVersion,
  InstitutionalSnapshot,
} from './types';
import { validateArchiveIntegrity, validateDocument, validateVersion, validateContent } from './validators';
import { listVersions, addVersionToArchive, createVersion, setCurrentVersion as versioningSetCurrentVersion } from './versioning';
import { canTransitionDocumentStatus } from './vocabularies';

function error(code: string, message: string, field?: string): DocumentError {
  return { code, message, field };
}

export function createDocumentInArchive(
  archive: DocumentArchive,
  documentInput: CreateDocumentInput,
  content: DocumentContent,
  snapshot: InstitutionalSnapshot,
  now = new Date().toISOString(),
):
  | { success: true; document: DocumentEntity; version: DocumentVersion; archive: DocumentArchive }
  | { success: false; errors: DocumentError[] } {
  const doc = createDocument(documentInput, now);
  const version = createInitialVersion(doc, content, {
    author: documentInput.author,
    sourceRefs: documentInput.sourceRefs,
    institutionalSnapshot: snapshot,
  }, now);

  const docValidation = validateDocument(doc);
  if (!docValidation.valid) {
    return { success: false, errors: docValidation.errors };
  }

  const contentValidation = validateContent(content);
  if (!contentValidation.valid) {
    return { success: false, errors: contentValidation.errors };
  }

  const verValidation = validateVersion(version);
  if (!verValidation.valid) {
    return { success: false, errors: verValidation.errors };
  }

  const docWithVersionRef = { ...doc, currentVersionRef: version.id as EntityId };

  const next = cloneDocumentArchive(archive);
  next.documents.push(docWithVersionRef);
  next.versions.push(version);
  next.updatedAt = now;

  return { success: true, document: docWithVersionRef, version, archive: next };
}

export function getDocument(
  archive: DocumentArchive,
  id: string,
): DocumentEntity | undefined {
  return archive.documents.find(d => d.id === id);
}

export interface DocumentFilter {
  documentType?: string;
  status?: string;
  instituteRef?: string;
  academicYearRef?: string;
}

export function listDocuments(
  archive: DocumentArchive,
  filter?: DocumentFilter,
): DocumentEntity[] {
  let docs = [...archive.documents];
  if (filter) {
    if (filter.documentType) {
      docs = docs.filter(d => d.documentType === filter.documentType);
    }
    if (filter.status) {
      docs = docs.filter(d => d.status === filter.status);
    }
    if (filter.instituteRef) {
      docs = docs.filter(d => d.instituteRef?.id === filter.instituteRef);
    }
    if (filter.academicYearRef) {
      docs = docs.filter(d => d.academicYearRef?.id === filter.academicYearRef);
    }
  }
  return docs;
}

export function getVersion(
  archive: DocumentArchive,
  id: string,
): DocumentVersion | undefined {
  return archive.versions.find(v => v.id === id);
}

export function getVersionList(
  archive: DocumentArchive,
  documentId: string,
): DocumentVersion[] {
  return listVersions(archive, documentId);
}

export function getCurrentVersion(
  archive: DocumentArchive,
  document: DocumentEntity,
): DocumentVersion | undefined {
  return archive.versions.find(v => v.id === document.currentVersionRef);
}

export function setCurrentVersion(
  archive: DocumentArchive,
  documentId: string,
  versionId: string,
):
  | { success: true; document: DocumentEntity; archive: DocumentArchive }
  | { success: false; errors: DocumentError[] } {
  const doc = archive.documents.find(d => d.id === documentId);
  if (!doc) {
    return { success: false, errors: [error('DOCUMENT_NOT_FOUND', `Document ${documentId} not found`)] };
  }

  const ver = archive.versions.find(v => v.id === versionId && v.documentRef === documentId);
  if (!ver) {
    return { success: false, errors: [error('VERSION_NOT_FOUND', `Version ${versionId} not found for document ${documentId}`)] };
  }

  const next = cloneDocumentArchive(archive);
  const updatedDoc: DocumentEntity = { ...doc, currentVersionRef: versionId as EntityId };
  next.documents = next.documents.map(d => (d.id === documentId ? updatedDoc : d));
  next.updatedAt = new Date().toISOString();

  return { success: true, document: updatedDoc, archive: next };
}

export function transitionDocumentStatus(
  archive: DocumentArchive,
  documentId: string,
  newStatus: DocumentEntity['status'],
):
  | { success: true; document: DocumentEntity; archive: DocumentArchive }
  | { success: false; errors: DocumentError[] } {
  const doc = archive.documents.find(d => d.id === documentId);
  if (!doc) {
    return { success: false, errors: [error('DOCUMENT_NOT_FOUND', `Document ${documentId} not found`)] };
  }

  if (!canTransitionDocumentStatus(doc.status, newStatus)) {
    return { success: false, errors: [error('INVALID_TRANSITION', `Cannot transition from ${doc.status} to ${newStatus}`)] };
  }

  const next = cloneDocumentArchive(archive);
  const updatedDoc = { ...doc, status: newStatus };
  next.documents = next.documents.map(d => (d.id === documentId ? updatedDoc : d));
  next.updatedAt = new Date().toISOString();

  return { success: true, document: updatedDoc, archive: next };
}

export function archiveDocument(
  archive: DocumentArchive,
  documentId: string,
):
  | { success: true; document: DocumentEntity; archive: DocumentArchive }
  | { success: false; errors: DocumentError[] } {
  return transitionDocumentStatus(archive, documentId, 'archived');
}

export function supersedeDocument(
  archive: DocumentArchive,
  documentId: string,
):
  | { success: true; document: DocumentEntity; archive: DocumentArchive }
  | { success: false; errors: DocumentError[] } {
  return transitionDocumentStatus(archive, documentId, 'superseded');
}

export function duplicateDocument(
  archive: DocumentArchive,
  documentId: string,
  now = new Date().toISOString(),
):
  | { success: true; document: DocumentEntity; version: DocumentVersion; archive: DocumentArchive }
  | { success: false; errors: DocumentError[] } {
  const source = archive.documents.find(d => d.id === documentId);
  if (!source) {
    return { success: false, errors: [error('DOCUMENT_NOT_FOUND', `Document ${documentId} not found`)] };
  }

  const sourceVersion = getCurrentVersion(archive, source);
  if (!sourceVersion) {
    return { success: false, errors: [error('NO_CURRENT_VERSION', `Document ${documentId} has no current version`)] };
  }

  const snapshot: InstitutionalSnapshot = {
    instituteName: sourceVersion.institutionalSnapshot.instituteName,
    configured: sourceVersion.institutionalSnapshot.configured,
    mechanicalCode: sourceVersion.institutionalSnapshot.mechanicalCode,
    siteName: sourceVersion.institutionalSnapshot.siteName,
    academicYearLabel: sourceVersion.institutionalSnapshot.academicYearLabel,
    declaredRole: sourceVersion.institutionalSnapshot.declaredRole,
  };

  const input: CreateDocumentInput = {
    documentType: source.documentType,
    title: `${source.title} (copia)`,
    author: source.author,
    instituteRef: source.instituteRef,
    academicYearRef: source.academicYearRef,
    sourceRefs: source.sourceRefs,
    originRefs: source.originRefs,
    tags: source.tags,
    origin: source.metadata.origin,
  };

  return createDocumentInArchive(archive, input, sourceVersion.content, snapshot, now);
}

export function applyDocumentActorContext(
  archive: DocumentArchive,
  documentId: string,
  actor: ActorReference,
  now = new Date().toISOString(),
):
  | { success: true; document: DocumentEntity; version: DocumentVersion; archive: DocumentArchive }
  | { success: false; errors: DocumentError[] } {
  const doc = archive.documents.find(d => d.id === documentId);
  if (!doc) {
    return { success: false, errors: [error('DOCUMENT_NOT_FOUND', `Document ${documentId} not found`)] };
  }

  if (doc.status === 'archived') {
    return {
      success: false,
      errors: [error('DOCUMENT_ARCHIVED', 'Un documento archiviato non può essere modificato.', 'status')],
    };
  }

  const current = getCurrentVersion(archive, doc);
  if (!current) {
    return { success: false, errors: [error('NO_CURRENT_VERSION', `Document ${documentId} has no current version`)] };
  }

  const snapshot: InstitutionalSnapshot = {
    instituteName: current.institutionalSnapshot.instituteName,
    configured: current.institutionalSnapshot.configured,
    mechanicalCode: current.institutionalSnapshot.mechanicalCode,
    siteName: current.institutionalSnapshot.siteName,
    academicYearLabel: current.institutionalSnapshot.academicYearLabel,
    declaredRole: actor.role,
  };

  const created = createVersion(archive, doc, current.content, {
    author: actor,
    reason: 'Contesto autore/ruolo applicato al documento',
    sourceRefs: current.sourceRefs,
    institutionalSnapshot: snapshot,
  }, now);

  const setCurrent = versioningSetCurrentVersion(created.archive, doc.id, created.version.id);
  if (Array.isArray(setCurrent)) {
    return { success: false, errors: setCurrent };
  }

  const updatedDoc: DocumentEntity = {
    ...setCurrent.document,
    author: actor,
    metadata: touchMetadata(setCurrent.document.metadata, actor, now),
  };
  const next = updateDocument(setCurrent.archive, updatedDoc);

  return { success: true, document: updatedDoc, version: created.version, archive: next };
}

export interface DocumentRevisionInput {
  author?: ActorReference;
  reason?: string;
  sourceRefs?: EntityReference[];
}

export function createDocumentRevision(
  archive: DocumentArchive,
  documentId: string,
  content: DocumentContent,
  input: DocumentRevisionInput = {},
  now = new Date().toISOString(),
):
  | { success: true; document: DocumentEntity; version: DocumentVersion; archive: DocumentArchive }
  | { success: false; errors: DocumentError[] } {
  const doc = archive.documents.find(d => d.id === documentId);
  if (!doc) {
    return { success: false, errors: [error('DOCUMENT_NOT_FOUND', `Document ${documentId} not found`)] };
  }

  if (doc.status === 'archived') {
    return {
      success: false,
      errors: [error('DOCUMENT_ARCHIVED', 'Un documento archiviato non può essere modificato.', 'status')],
    };
  }

  const contentValidation = validateContent(content);
  if (!contentValidation.valid) {
    return { success: false, errors: contentValidation.errors };
  }

  const current = getCurrentVersion(archive, doc);
  if (!current) {
    return { success: false, errors: [error('NO_CURRENT_VERSION', `Document ${documentId} has no current version`)] };
  }

  const snapshot: InstitutionalSnapshot = {
    instituteName: current.institutionalSnapshot.instituteName,
    configured: current.institutionalSnapshot.configured,
    mechanicalCode: current.institutionalSnapshot.mechanicalCode,
    siteName: current.institutionalSnapshot.siteName,
    academicYearLabel: current.institutionalSnapshot.academicYearLabel,
    declaredRole: current.institutionalSnapshot.declaredRole,
  };

  const created = createVersion(archive, doc, content, {
    author: input.author ?? current.author,
    reason: input.reason,
    sourceRefs: input.sourceRefs ?? current.sourceRefs,
    institutionalSnapshot: snapshot,
  }, now);

  const setCurrent = versioningSetCurrentVersion(created.archive, doc.id, created.version.id);
  if (Array.isArray(setCurrent)) {
    return { success: false, errors: setCurrent };
  }

  const updatedDoc: DocumentEntity = {
    ...setCurrent.document,
    metadata: touchMetadata(setCurrent.document.metadata, input.author ?? setCurrent.document.metadata.updatedBy, now),
  };
  const next = updateDocument(setCurrent.archive, updatedDoc);

  return { success: true, document: updatedDoc, version: created.version, archive: next };
}

export function verifyIntegrity(
  archive: DocumentArchive,
): { valid: boolean; errors: string[]; warnings: string[] } {
  const checked = validateArchiveIntegrity(archive);
  return {
    valid: checked.valid,
    errors: checked.errors.map(e => `${e.code}: ${e.message}`),
    warnings: checked.warnings.map(w => `${w.code}: ${w.message}`),
  };
}

export function addVersion(
  archive: DocumentArchive,
  version: DocumentVersion,
): DocumentArchive {
  const next = addVersionToArchive(archive, version);
  return next;
}

export function updateDocument(
  archive: DocumentArchive,
  document: DocumentEntity,
): DocumentArchive {
  const next = cloneDocumentArchive(archive);
  next.documents = next.documents.map(d => (d.id === document.id ? document : d));
  next.updatedAt = new Date().toISOString();
  return next;
}
