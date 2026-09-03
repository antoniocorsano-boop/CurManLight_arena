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
} from './model/types';

export {
  CURRICULUM_SCHEMA_VERSION,
  VALID_CURRICULUM_VERSION_STATUSES,
  VALID_SEGMENT_STATUSES,
  VALID_NODE_STATUSES,
  VALID_LINK_STATUSES as VALID_CANONICAL_LINK_STATUSES,
  VALID_PROVENANCES,
  VALID_COMPLETENESS_LEVELS,
} from './model/types';

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

export {
  SourceRepository,
  SourceVersionRepository,
  CurriculumVersionRepository,
  CurriculumSegmentRepository,
  CurriculumNodeRepository,
  CurriculumLinkRepository,
  CurriculumDomainRepository,
} from './repositories';

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

// ─── Arena R7C1 Operational Composition Contract ────────────────────────────

export type {
  OperationalCurriculumSourcePlane,
  OperationalCurriculumAuthorityState,
  OperationalCurriculumSemanticStatus,
  OperationalRequirementAuthority,
  OperationalNodeLifecycle,
  OperationalCurriculumAuthority,
  OperationalDisciplineTarget,
  OperationalInfanziaFieldTarget,
  OperationalSpecialSegmentTarget,
  OperationalCurriculumTarget,
  OperationalNationalElementEvidence,
  OperationalCurriculumSegment,
  OperationalCurriculumNode,
  OperationalCurriculumLink,
  OperationalCurriculumAggregateV1,
  OperationalCurriculumValidationIssue,
  OperationalCurriculumValidationResult,
} from './operationalContract';

export {
  OPERATIONAL_CURRICULUM_SCHEMA_VERSION,
  OPERATIONAL_CURRICULUM_KIND,
  buildOperationalCurriculumTargetRef,
  canUseOperationalNodeAsNationalRequirement,
  validateOperationalCurriculumAggregate,
  assertOperationalCurriculumAggregate,
} from './operationalContract';

// ─── Arena R7C2 Technology end-to-end pilot ─────────────────────────────────

export type {
  TechnologyDraftGrade,
  TechnologyDraftNucleusId,
  TechnologyDraftNucleus,
  TechnologyExitProfileArea,
} from './technology/technologyInstitutionalDraft';

export {
  TECHNOLOGY_INSTITUTIONAL_DRAFT_SOURCE,
  TECHNOLOGY_INSTITUTIONAL_DRAFT_FINALITIES,
  TECHNOLOGY_INSTITUTIONAL_DRAFT_EXIT_PROFILE,
  TECHNOLOGY_INSTITUTIONAL_DRAFT_NUCLEI,
} from './technology/technologyInstitutionalDraft';

export type {
  TechnologyMethodologyEntry,
  TechnologyCrossCurricularEntry,
  TechnologyAssessmentEntry,
} from './technology/technologyInstitutionalCompanion';

export {
  TECHNOLOGY_INSTITUTIONAL_GUIDING_PRINCIPLE,
  TECHNOLOGY_INSTITUTIONAL_METHODOLOGIES,
  TECHNOLOGY_INSTITUTIONAL_CROSS_CURRICULAR,
  TECHNOLOGY_INSTITUTIONAL_ASSESSMENT_PRINCIPLE,
  TECHNOLOGY_INSTITUTIONAL_ASSESSMENT,
  TECHNOLOGY_INSTITUTIONAL_GOVERNANCE_RULES,
} from './technology/technologyInstitutionalCompanion';

export type {
  TechnologyArtifactCode,
  TechnologyArtifactKind,
  TechnologyArtifactOperationalStatus,
  TechnologyCurriculumArtifactDefinition,
  TechnologyCurriculumArtifactInstance,
} from './technology/technologyArtifacts';

export {
  TECHNOLOGY_ARTIFACT_DEFINITIONS,
  buildTechnologyWorkingArtifactGraph,
  canArtifactBeAdopted,
} from './technology/technologyArtifacts';

export type {
  TechnologyArtifactFieldGroup,
  TechnologyArtifactTemplateSchema,
} from './technology/technologyArtifactSchemas';

export {
  TECHNOLOGY_ARTIFACT_TEMPLATE_SCHEMAS,
  getTechnologyArtifactTemplateSchema,
} from './technology/technologyArtifactSchemas';

export type {
  TechnologyCanonicalDomainSnapshot,
  TechnologyCanonicalDomainValidation,
} from './technology/technologyCanonicalDomain';

export {
  buildTechnologyCanonicalDomainSnapshot,
  validateTechnologyCanonicalDomainSnapshot,
} from './technology/technologyCanonicalDomain';

export type {
  TechnologyGradeProgressionEntry,
  TechnologyGradeProgressionLink,
  TechnologyInstitutionalContextSnapshot,
  TechnologyOperationalPilotPackage,
  TechnologyPlanningRequirementSnapshot,
  TechnologyPlanningHandoff,
} from './technology/technologyOperationalPilot';

export {
  sha256NormalizedText,
  buildTechnologyOperationalPilot,
  buildTechnologyPlanningHandoff,
} from './technology/technologyOperationalPilot';
