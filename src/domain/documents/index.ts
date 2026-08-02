export type {
  DocumentType,
  DocumentStatus,
  DocumentEntity,
  DocumentVersion,
  DocumentContent,
  DocumentSection,
  ParagraphSection,
  DocumentArchive,
  InstitutionalSnapshot,
  ExportFormat,
  ExportPayload,
  DocumentError,
  DocumentValidationResult,
  DocumentArchiveOperationResult,
  DocumentCreationResult,
  LegacyDocumentAdaptationResult,
  A04ToA07DocumentResult,
  DocumentFilter,
} from './types';

export type {
  PreviewIdentity,
  PreviewState,
  TeachingDesignMetadata,
} from './preview';

export type {
  ExportBlockCode,
  ExportError,
  ExportabilityResult,
  ExportabilityContext,
  InstitutionalMetadata,
} from './exportValidator';

export {
  DOCUMENT_ARCHIVE_SCHEMA_VERSION,
  VALID_DOCUMENT_TYPES,
  VALID_DOCUMENT_STATUSES,
  VALID_EXPORT_FORMATS,
  EXPORT_FORMAT_META,
  DOCUMENT_STATUS_TRANSITIONS,
  canTransitionDocumentStatus,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
} from './vocabularies';

export {
  createEmptyDocumentArchive,
  cloneDocumentArchive,
  createDocument,
  createInitialVersion,
  createNextVersion,
  restoreVersionFrom,
  createSectionHeading,
  createSectionParagraph,
  createSectionList,
  createSectionTable,
  createSectionCurriculumReference,
  createSectionSourceReference,
  createSectionTeachingDesign,
  createSectionMetadata,
  createInstitutionalSnapshot,
} from './constructors';

export {
  validateDocument,
  validateVersion,
  validateContent,
  validateTransition,
  validateArchiveIntegrity,
  validateDocumentArchiveIntegrity,
} from './validators';

export {
  createVersion,
  setCurrentVersion,
  restoreVersion,
  listVersions,
  getLatestVersion,
} from './versioning';

export {
  createDocumentInArchive,
  getDocument,
  listDocuments,
  getVersion,
  getVersionList,
  getCurrentVersion,
  setCurrentVersion as setDocumentCurrentVersion,
  transitionDocumentStatus,
  archiveDocument,
  supersedeDocument,
  duplicateDocument,
  applyDocumentActorContext,
  createDocumentRevision,
  verifyIntegrity,
  addVersion,
  updateDocument,
} from './repository';

export type { DocumentRevisionInput } from './repository';

export {
  serializeDocumentArchive,
  deserializeDocumentArchive,
  fingerprintDocumentArchive,
} from './serialization';

export {
  renderSection,
  renderDocumentContent,
  renderSnapshotHeader,
  renderVersionMetadata,
  renderProvenance,
  renderDocument,
} from './rendering';

export {
  computeContentFingerprint,
  computeMetadataFingerprint,
  computeTemplateId,
  computePreviewKey,
  serializePreviewKey,
  isPreviewStale,
  extractTeachingDesignMetadata,
  getAuthorDisplay,
  getRoleDisplay,
} from './preview';

export {
  validateExportability,
  checkExportability,
  resolveInstitutionalMetadata,
  isTemplateResolvable,
  isContentRenderable,
  getExportPayload,
} from './exportValidator';

export {
  validateExportFormat,
  getExportExtension,
  getExportMime,
  buildExportFilename,
  validateExportContent,
  checkFormatConsistency,
} from './exportPolicy';

export {
  adaptLegacyUdaHtml,
  adaptLegacyExportEvent,
  adaptLegacyHtmlDocument,
  isLegacyDocumentPromotable,
  hasNoPhantomSource,
  hasNoPhantomAuthor,
} from './legacyAdapters';

export {
  getDocumentById,
  getCurrentVersionForDocument,
  getDocumentList,
  getDocumentWithVersion,
  getDocumentsByType,
  getDocumentsByStatus,
  getDocumentHistory,
  getDocumentExportPayload,
  getDocumentsByInstitute,
  getDocumentsByAcademicYear,
} from './selectors';