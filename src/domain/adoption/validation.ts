import type {
  Adoption,
  AdoptionStatus,
  ImplementationEvidenceEnvelope,
  ValidationReview,
  ValidationStatus,
} from './contracts';

const adoptionTransitions: Record<AdoptionStatus, readonly AdoptionStatus[]> = {
  PROPOSED: ['DECIDED'],
  DECIDED: ['ACTIVE'],
  ACTIVE: ['UNDER_REVIEW', 'SUPERSEDED', 'EXPIRED'],
  UNDER_REVIEW: ['ACTIVE', 'SUPERSEDED', 'EXPIRED'],
  SUPERSEDED: [],
  EXPIRED: [],
};

const validationTransitions: Record<ValidationStatus, readonly ValidationStatus[]> = {
  NOT_EVALUATED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['VALIDATED', 'VALIDATED_WITH_CONDITIONS', 'REVISION_REQUIRED', 'SUPERSEDED'],
  VALIDATED: ['UNDER_REVIEW', 'SUPERSEDED'],
  VALIDATED_WITH_CONDITIONS: ['UNDER_REVIEW', 'SUPERSEDED'],
  REVISION_REQUIRED: ['UNDER_REVIEW', 'SUPERSEDED'],
  SUPERSEDED: [],
};

export function canTransitionAdoption(from: AdoptionStatus, to: AdoptionStatus): boolean {
  return adoptionTransitions[from].includes(to);
}

export function canTransitionValidation(from: ValidationStatus, to: ValidationStatus): boolean {
  return validationTransitions[from].includes(to);
}

export function validateAdoption(adoption: Adoption): string[] {
  const errors: string[] = [];
  if (!adoption.adoptionId) errors.push('ADOPTION_ID_REQUIRED');
  if (!adoption.curriculumBaselineRef) errors.push('BASELINE_REF_REQUIRED');
  if (!adoption.curriculumVersionRef) errors.push('CURRICULUM_VERSION_REF_REQUIRED');
  if (!adoption.institutionalDecisionRef) errors.push('INSTITUTIONAL_DECISION_REF_REQUIRED');
  if (!adoption.scope.institutionRef) errors.push('INSTITUTION_REF_REQUIRED');
  if (!adoption.scope.schoolYear) errors.push('SCHOOL_YEAR_REQUIRED');
  if (!adoption.effectiveFrom) errors.push('EFFECTIVE_FROM_REQUIRED');
  if (adoption.authorityEvidenceRefs.length === 0) errors.push('AUTHORITY_EVIDENCE_REQUIRED');
  if (adoption.provenanceRefs.length === 0) errors.push('PROVENANCE_REQUIRED');
  if (adoption.effectiveUntil && adoption.effectiveUntil < adoption.effectiveFrom) {
    errors.push('INVALID_EFFECTIVE_PERIOD');
  }
  return errors;
}

export function validateImplementationEvidence(envelope: ImplementationEvidenceEnvelope): string[] {
  const errors: string[] = [];
  if (envelope.authorityClaim !== 'NONE') errors.push('IMPLEMENTATION_EVIDENCE_MUST_NOT_CLAIM_AUTHORITY');
  if (!envelope.curriculumBaselineRef) errors.push('BASELINE_REF_REQUIRED');
  if (!envelope.sourceRef) errors.push('SOURCE_REF_REQUIRED');
  if (!envelope.payloadRef) errors.push('PAYLOAD_REF_REQUIRED');
  if (envelope.provenanceRefs.length === 0) errors.push('PROVENANCE_REQUIRED');
  return errors;
}

export function validateValidationReview(review: ValidationReview): string[] {
  const errors: string[] = [];
  if (!review.reviewId) errors.push('REVIEW_ID_REQUIRED');
  if (!review.targetAdoptionRef) errors.push('TARGET_ADOPTION_REQUIRED');
  if (!review.targetBaselineRef) errors.push('TARGET_BASELINE_REQUIRED');
  if (review.triggerRefs.length === 0) errors.push('REVIEW_TRIGGER_REQUIRED');
  if (review.evidenceRefs.length === 0) errors.push('REVIEW_EVIDENCE_REQUIRED');
  if (review.status !== 'UNDER_REVIEW' && review.status !== 'NOT_EVALUATED' && !review.reviewerAuthority) {
    errors.push('REVIEWER_AUTHORITY_REQUIRED_FOR_OUTCOME');
  }
  if (review.resultingDecisionRef && !review.reviewerAuthority) {
    errors.push('DECISION_REQUIRES_AUTHORITY');
  }
  return errors;
}
