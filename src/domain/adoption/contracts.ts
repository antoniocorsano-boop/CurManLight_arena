export type AdoptionStatus =
  | 'PROPOSED'
  | 'DECIDED'
  | 'ACTIVE'
  | 'UNDER_REVIEW'
  | 'SUPERSEDED'
  | 'EXPIRED';

export type ValidationStatus =
  | 'NOT_EVALUATED'
  | 'UNDER_REVIEW'
  | 'VALIDATED'
  | 'VALIDATED_WITH_CONDITIONS'
  | 'REVISION_REQUIRED'
  | 'SUPERSEDED';

export type ReviewTriggerType =
  | 'NORMATIVE_SOURCE_CHANGED'
  | 'APPLICABILITY_CHANGED'
  | 'AUTHORITATIVE_SOURCE_CHANGED'
  | 'SCHEDULED_REVIEW_DUE'
  | 'ADOPTION_EXPIRY'
  | 'IMPLEMENTATION_ISSUE'
  | 'COVERAGE_PROBLEM'
  | 'CONTEXT_INCONSISTENCY'
  | 'CLARIFICATION_REQUEST'
  | 'HUMAN_OBSERVATION'
  | 'INSTITUTIONAL_REQUEST';

export type ImplementationEvidenceKind =
  | 'CURRICULUM_COVERAGE_OBSERVATION'
  | 'IMPLEMENTATION_ISSUE'
  | 'CLARIFICATION_REQUEST'
  | 'REVISION_SUGGESTION';

export interface AdoptionScope {
  institutionRef: string;
  schoolYear: string;
  educationLevelRef?: string;
  gradeRef?: string;
  disciplineRef?: string;
  applicabilityRefs?: string[];
}

export interface AuthorityEvidenceRef {
  actorRef: string;
  capabilityRef: string;
  authorityEvidenceRef: string;
}

export interface InstitutionalDecisionRecord {
  decisionId: string;
  subjectRef: string;
  decisionType: string;
  authority: AuthorityEvidenceRef;
  evidenceRefs: string[];
  previousStateRef?: string;
  resultingStateRef: string;
  effectiveFrom?: string;
  recordedAt: string;
}

export interface Adoption {
  adoptionId: string;
  curriculumBaselineRef: string;
  curriculumVersionRef: string;
  institutionalDecisionRef: string;
  scope: AdoptionScope;
  status: AdoptionStatus;
  effectiveFrom: string;
  effectiveUntil?: string;
  reviewDueAt?: string;
  provenanceRefs: string[];
  authorityEvidenceRefs: string[];
  supersedesAdoptionRef?: string;
  recordedAt: string;
}

export interface ReviewTrigger {
  triggerId: string;
  type: ReviewTriggerType;
  subjectRef: string;
  evidenceRefs: string[];
  observedAt: string;
  sourceSystem: 'ARENA' | 'DOCENTE_OS' | 'EXTERNAL';
}

export interface ImplementationEvidenceEnvelope {
  evidenceId: string;
  kind: ImplementationEvidenceKind;
  curriculumBaselineRef: string;
  adoptionRef?: string;
  sourceSystem: 'DOCENTE_OS' | 'ARENA';
  sourceRef: string;
  provenanceRefs: string[];
  observedAt: string;
  payloadRef: string;
  authorityClaim: 'NONE';
}

export interface ValidationFinding {
  findingId: string;
  code: string;
  summary: string;
  evidenceRefs: string[];
}

export interface ValidationReview {
  reviewId: string;
  targetAdoptionRef: string;
  targetBaselineRef: string;
  triggerRefs: string[];
  evidenceRefs: string[];
  status: ValidationStatus;
  findings: ValidationFinding[];
  reviewerAuthority?: AuthorityEvidenceRef;
  resultingDecisionRef?: string;
  openedAt: string;
  decidedAt?: string;
}

export const ADOPTION_VALIDATION_INVARIANTS = {
  applicabilityIsNotAdoption: true,
  approvalIsNotAdoption: true,
  baselineIsNotAdoption: true,
  adoptionIsNotValidation: true,
  implementationEvidenceHasNoInstitutionalAuthority: true,
  docenteOsCannotMutateArenaCanonicalState: true,
  consequentialTransitionsRequireExplicitAuthorityEvidence: true,
  reviewDoesNotInvalidateActiveAdoption: true,
} as const;
