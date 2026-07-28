import type {
  DocumentArchive,
  DocumentEntity,
  DocumentError,
  DocumentValidationResult,
} from './types';
import { canTransitionDocumentStatus, DOCUMENT_ARCHIVE_SCHEMA_VERSION, VALID_DOCUMENT_TYPES, VALID_DOCUMENT_STATUSES } from './vocabularies';
import { isValidEntityId } from '../curriculum/identity';

function error(code: string, message: string, field?: string): DocumentError {
  return { code, message, field };
}

export function validateDocument(document: unknown): DocumentValidationResult {
  const errors: DocumentError[] = [];
  const warnings: DocumentError[] = [];

  if (!document || typeof document !== 'object') {
    return { valid: false, errors: [error('INVALID_DOCUMENT', 'Document must be an object')], warnings };
  }

  const d = document as Record<string, unknown>;

  if (typeof d.id !== 'string' || !isValidEntityId(d.id)) {
    errors.push(error('INVALID_ID', 'Document id must be a valid EntityId', 'id'));
  }

  if (!VALID_DOCUMENT_TYPES.includes(d.documentType as never)) {
    errors.push(error('INVALID_DOCUMENT_TYPE', `Invalid document type: ${String(d.documentType)}`, 'documentType'));
  }

  if (typeof d.title !== 'string' || (d.title as string).trim().length === 0) {
    errors.push(error('MISSING_TITLE', 'Document title must be a non-empty string', 'title'));
  }

  if (!VALID_DOCUMENT_STATUSES.includes(d.status as never)) {
    errors.push(error('INVALID_STATUS', `Invalid document status: ${String(d.status)}`, 'status'));
  }

  if (typeof d.currentVersionRef !== 'string') {
    errors.push(error('MISSING_CURRENT_VERSION_REF', 'currentVersionRef must be a string', 'currentVersionRef'));
  }

  return errors.length > 0
    ? { valid: false, errors, warnings }
    : { valid: true, errors, warnings };
}

export function validateVersion(version: unknown): DocumentValidationResult {
  const errors: DocumentError[] = [];
  const warnings: DocumentError[] = [];

  if (!version || typeof version !== 'object') {
    return { valid: false, errors: [error('INVALID_VERSION', 'Version must be an object')], warnings };
  }

  const v = version as Record<string, unknown>;

  if (typeof v.id !== 'string' || !isValidEntityId(v.id)) {
    errors.push(error('INVALID_VERSION_ID', 'Version id must be a valid EntityId', 'id'));
  }

  if (typeof v.documentRef !== 'string') {
    errors.push(error('MISSING_DOCUMENT_REF', 'version documentRef must be a string', 'documentRef'));
  }

  if (typeof v.versionNumber !== 'number' || (v.versionNumber as number) < 1) {
    errors.push(error('INVALID_VERSION_NUMBER', 'versionNumber must be >= 1', 'versionNumber'));
  }

  if (v.content === undefined || v.content === null) {
    errors.push(error('MISSING_CONTENT', 'Version content is required', 'content'));
  }

  if (v.frozen !== true) {
    errors.push(error('VERSION_NOT_FROZEN', 'Version must be frozen after creation', 'frozen'));
  }

  return errors.length > 0
    ? { valid: false, errors, warnings }
    : { valid: true, errors, warnings };
}

export function validateContent(content: unknown): DocumentValidationResult {
  const errors: DocumentError[] = [];
  const warnings: DocumentError[] = [];

  if (!content || typeof content !== 'object') {
    return { valid: false, errors: [error('INVALID_CONTENT', 'Content must be an object')], warnings };
  }

  const c = content as Record<string, unknown>;
  const sections = c.sections;

  if (!Array.isArray(sections) || sections.length === 0) {
    errors.push(error('EMPTY_CONTENT', 'Content must have at least one section', 'sections'));
    return { valid: false, errors, warnings };
  }

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (!section || typeof section !== 'object') {
      errors.push(error('INVALID_SECTION', `Section at index ${i} is invalid`, `sections[${i}]`));
      continue;
    }
    const s = section as Record<string, unknown>;
    if (typeof s.type !== 'string') {
      errors.push(error('SECTION_MISSING_TYPE', `Section at index ${i} missing type`, `sections[${i}].type`));
    }
  }

  return errors.length > 0
    ? { valid: false, errors, warnings }
    : { valid: true, errors, warnings };
}

export function validateTransition(
  document: DocumentEntity,
  newStatus: string,
): DocumentValidationResult {
  const errors: DocumentError[] = [];
  const warnings: DocumentError[] = [];

  if (!VALID_DOCUMENT_STATUSES.includes(newStatus as DocumentEntity['status'])) {
    errors.push(error('INVALID_STATUS', `Invalid target status: ${newStatus}`, 'status'));
    return { valid: false, errors, warnings };
  }

  if (!canTransitionDocumentStatus(document.status, newStatus as DocumentEntity['status'])) {
    errors.push(
      error(
        'INVALID_TRANSITION',
        `Cannot transition from ${document.status} to ${newStatus}`,
        'status',
      ),
    );
  }

  return errors.length > 0
    ? { valid: false, errors, warnings }
    : { valid: true, errors, warnings };
}

export function validateArchiveIntegrity(archive: unknown): DocumentValidationResult {
  const errors: DocumentError[] = [];
  const warnings: DocumentError[] = [];

  if (!archive || typeof archive !== 'object') {
    return { valid: false, errors: [error('INVALID_ARCHIVE', 'Archive must be an object')], warnings };
  }

  const a = archive as Record<string, unknown>;

  if (a.schemaVersion !== DOCUMENT_ARCHIVE_SCHEMA_VERSION) {
    errors.push(error('UNSUPPORTED_SCHEMA', `Schema version ${String(a.schemaVersion)} not supported`, 'schemaVersion'));
    return { valid: false, errors, warnings };
  }

  const documents = a.documents;
  const versions = a.versions;

  if (!Array.isArray(documents)) {
    errors.push(error('MISSING_DOCUMENTS', 'Archive must have a documents array', 'documents'));
    return { valid: false, errors, warnings };
  }

  if (!Array.isArray(versions)) {
    errors.push(error('MISSING_VERSIONS', 'Archive must have a versions array', 'versions'));
    return { valid: false, errors, warnings };
  }

  const docIds = new Set<string>();
  const versionIds = new Set<string>();
  const docCurrentVersionRefs = new Map<string, string>();

  for (const doc of documents) {
    if (typeof doc.id === 'string') {
      if (docIds.has(doc.id)) {
        errors.push(error('DUPLICATE_DOCUMENT_ID', `Duplicate document id: ${doc.id}`, 'documents'));
      }
      docIds.add(doc.id);
      if (typeof doc.currentVersionRef === 'string') {
        docCurrentVersionRefs.set(doc.id, doc.currentVersionRef);
      }
    }
  }

  for (const ver of versions) {
    if (typeof ver.id === 'string') {
      if (versionIds.has(ver.id)) {
        errors.push(error('DUPLICATE_VERSION_ID', `Duplicate version id: ${ver.id}`, 'versions'));
      }
      versionIds.add(ver.id);
    }
  }

  for (const [docId, versionRef] of docCurrentVersionRefs) {
    if (!versionIds.has(versionRef)) {
      errors.push(error('ORPHAN_VERSION_REF', `Document ${docId} references non-existent version ${versionRef}`, 'currentVersionRef'));
    }
  }

  for (const ver of versions) {
    if (typeof ver.documentRef === 'string' && !docIds.has(ver.documentRef)) {
      warnings.push(error('ORPHAN_VERSION', `Version ${String(ver.id)} references non-existent document ${ver.documentRef}`, 'documentRef'));
    }
  }

  return errors.length > 0
    ? { valid: false, errors, warnings }
    : { valid: true, errors, warnings };
}

export function validateDocumentArchiveIntegrity(archive: DocumentArchive): DocumentValidationResult {
  const errors: DocumentError[] = [];
  const warnings: DocumentError[] = [];

  const docIds = new Set(archive.documents.map(d => d.id));
  const versionIds = new Set(archive.versions.map(v => v.id));

  for (const doc of archive.documents) {
    if (!versionIds.has(doc.currentVersionRef)) {
      errors.push(error('ORPHAN_VERSION_REF', `Document ${doc.id} references missing version ${doc.currentVersionRef}`, 'currentVersionRef'));
    }
  }

  for (const ver of archive.versions) {
    if (!docIds.has(ver.documentRef)) {
      warnings.push(error('ORPHAN_VERSION', `Version ${ver.id} references missing document ${ver.documentRef}`, 'documentRef'));
    }
  }

  return errors.length > 0
    ? { valid: false, errors, warnings }
    : { valid: true, errors, warnings };
}