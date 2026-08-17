/**
 * Curriculum Domain Barrel
 *
 * Pubblico controllato per il dominio curricolare.
 * Include CML-630E legacy types e CML-633C canonical domain.
 */

// ─── CML-630E Legacy Types (still in use) ────────────────────────────────────

export type {
  SchoolLevel,
  NationalFramework,
  InstitutionalRole,
  SegmentScope,
  FrameworkApplicabilityReference,
  InstituteCurriculumStatus,
  CurriculumSegmentWorkStatus,
  CurriculumNodeType,
  CurriculumNodeWorkStatus,
  VerticalCurriculumRelationType,
  VerticalCurriculumLinkStatus,
  DomainValidationSeverity,
  DomainValidationIssue,
} from './types';

export {
  VALID_VERSION_STATUSES,
  VALID_SEGMENT_WORK_STATUSES,
  VALID_NODE_TYPES,
  VALID_NODE_WORK_STATUSES,
  VALID_LINK_RELATION_TYPES,
  VALID_LINK_STATUSES,
  VERSION_STATUS_TRANSITIONS,
  SEGMENT_WORK_STATUS_TRANSITIONS,
  LINK_STATUS_TRANSITIONS,
} from './types';

export type { InstituteCurriculumVersion } from './version';
export type { CurriculumSegment, CurriculumSegmentContent } from './segment';
export type { CurriculumNode } from './node';
export type { VerticalCurriculumLink } from './verticalLink';

export {
  validateInstituteCurriculumVersion,
  validateCurriculumSegment,
  validateCurriculumNode,
  validateVerticalCurriculumLink,
  validateCurriculumDomainGraph,
  canTransitionVersionStatus,
  canTransitionSegmentStatus,
  canTransitionLinkStatus,
  isApprovedVersionImmutable,
  findDuplicateVerticalLinks,
  findDanglingNodeReferences,
  findDanglingSegmentReferences,
  detectInvalidStructuralCycles,
} from './validation-legacy';

// ─── CML-633B Identity ──────────────────────────────────────────────────────

export type {
  EntityId,
  EntityMetadata,
  EntityReference,
  ContentOrigin,
  SchemaVersion,
} from './identity/types';

export {
  CURRENT_SCHEMA_VERSION,
  CONTENT_ORIGIN_REGISTRY,
} from './identity/types';

// ─── CML-633C Canonical Domain ──────────────────────────────────────────────

// Source Types
export type {
  Source,
  SourceType,
  SourceStatus,
  SourceScope,
  SourceLocator,
  SourceVersion,
  SourceValidationError,
  SourceValidationResult,
} from './sources/types';

export {
  VALID_SOURCE_TYPES,
  VALID_SOURCE_STATUSES,
  SOURCE_SCHEMA_VERSION,
} from './sources/types';

// Curriculum Model Types
export type {
  CurriculumVersion as CanonicalCurriculumVersion,
  CurriculumVersionStatus as CanonicalCurriculumVersionStatus,
  CurriculumScope as CanonicalCurriculumScope,
  CurriculumSegment as CanonicalCurriculumSegment,
  CurriculumSegmentStatus as CanonicalCurriculumSegmentStatus,
  CompletenessLevel as CanonicalCompletenessLevel,
  CurriculumNode as CanonicalCurriculumNode,
  CurriculumNodeStatus as CanonicalCurriculumNodeStatus,
  CurriculumProvenance as CanonicalCurriculumProvenance,
  LegacyNodeInfo as CanonicalLegacyNodeInfo,
  CurriculumLink as CanonicalCurriculumLink,
  CurriculumLinkStatus as CanonicalCurriculumLinkStatus,
  EvidenceNode as CanonicalEvidenceNode,
  CurriculumValidationError as CanonicalCurriculumValidationError,
  CurriculumValidationResult as CanonicalCurriculumValidationResult,
  SourceAreaKind,
  SourceAreaReference,
  SourceNucleusReference,
  NormativeCheckpoint,
} from './model/types';

export {
  CURRICULUM_SCHEMA_VERSION,
  VALID_CURRICULUM_VERSION_STATUSES,
  VALID_SEGMENT_STATUSES,
  VALID_NODE_STATUSES,
  VALID_LINK_STATUSES as VALID_CANONICAL_LINK_STATUSES,
  VALID_PROVENANCES,
  VALID_COMPLETENESS_LEVELS,
  VALID_NORMATIVE_CHECKPOINTS,
} from './model/types';

// Vocabularies
export type {
  DisciplineCode,
  CurriculumNodeType as CanonicalCurriculumNodeType,
  CurriculumLinkType as CanonicalCurriculumLinkType,
  DisciplineDefinition,
  NucleusDefinition,
} from './model/vocabularies';

export {
  SCHOOL_ORDERS,
  SCHOOL_ORDER_LABELS,
  DISCIPLINES,
  DISCIPLINE_ALIAS_MAP,
  NUCLEI_FONDANTI,
  NODE_TYPE_LABELS,
  LEGACY_NODE_TYPES,
  LINK_TYPE_LABELS,
  resolveDisciplineCode,
  getDisciplineDefinition,
  isDisciplineSupportedForOrder,
} from './model/vocabularies';

// Constructors
export {
  createSource,
  createLegacySource,
  createSourceVersion,
  createCurriculumVersion,
  createCurriculumSegment,
  createCurriculumNode,
  createLegacyNode,
  createEvidenceNode,
  createCurriculumLink,
  createSourceReference,
  createCurriculumVersionReference,
  createSegmentReference,
  createNodeReference,
} from './constructors';

// Validation
export {
  validateSource,
  validateSourceVersion,
  validateCurriculumVersion as validateCanonicalCurriculumVersion,
  validateCurriculumSegment as validateCanonicalCurriculumSegment,
  validateCurriculumNode as validateCanonicalCurriculumNode,
  validateCurriculumLink as validateCanonicalCurriculumLink,
  checkReferentialIntegrity,
  detectDuplicateNodes,
  detectDuplicateSources,
} from './validation';

// Repositories
export {
  SourceRepository,
  SourceVersionRepository,
  CurriculumVersionRepository,
  CurriculumSegmentRepository,
  CurriculumNodeRepository,
  CurriculumLinkRepository,
  CurriculumDomainRepository,
} from './repositories';

// Adapters
export {
  adaptCurriculumKB,
  adaptDiscipline,
  verifyMigrationMatrix,
} from './adapters';

export {
  serializeCanonicalCurriculumDomain,
  deserializeCanonicalCurriculumDomain,
} from './serialization';

export {
  createA11SourceReadModel,
  createA02CurriculumReadModel,
} from './readModels';
export type { A11SourceSummary, A02CurriculumQuery } from './readModels';
