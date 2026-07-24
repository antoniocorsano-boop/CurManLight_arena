/**
 * CML-630E — Productive Curriculum Domain
 *
 * Barrel pubblico controllato per il dominio curricolare produttivo.
 * Modello C ibrido: relazioni strutturali nei segmenti, relazioni pedagogiche in VerticalCurriculumLink.
 */

// ─── Types ──────────────────────────────────────────────────────────────────────

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

// ─── Entity Types ───────────────────────────────────────────────────────────────

export type { InstituteCurriculumVersion } from './version';
export type { CurriculumSegment, CurriculumSegmentContent } from './segment';
export type { CurriculumNode } from './node';
export type { VerticalCurriculumLink } from './verticalLink';

// ─── Validation Functions ──────────────────────────────────────────────────────

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
} from './validation';
