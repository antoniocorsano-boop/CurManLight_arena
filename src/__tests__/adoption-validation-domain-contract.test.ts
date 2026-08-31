import { describe, expect, it } from 'vitest';
import {
  ADOPTION_VALIDATION_INVARIANTS,
  canTransitionAdoption,
  canTransitionValidation,
  validateAdoption,
  validateImplementationEvidence,
  validateValidationReview,
  type Adoption,
  type ImplementationEvidenceEnvelope,
  type ValidationReview,
} from '../domain/adoption';

describe('AD-0 adoption and validation domain contract', () => {
  it('keeps applicability, approval, baseline, adoption and validation distinct', () => {
    expect(ADOPTION_VALIDATION_INVARIANTS.applicabilityIsNotAdoption).toBe(true);
    expect(ADOPTION_VALIDATION_INVARIANTS.approvalIsNotAdoption).toBe(true);
    expect(ADOPTION_VALIDATION_INVARIANTS.baselineIsNotAdoption).toBe(true);
    expect(ADOPTION_VALIDATION_INVARIANTS.adoptionIsNotValidation).toBe(true);
  });

  it('does not allow approval semantics to jump directly to active adoption', () => {
    expect(canTransitionAdoption('PROPOSED', 'ACTIVE')).toBe(false);
    expect(canTransitionAdoption('PROPOSED', 'DECIDED')).toBe(true);
    expect(canTransitionAdoption('DECIDED', 'ACTIVE')).toBe(true);
  });

  it('allows an active adoption to enter review and return active', () => {
    expect(canTransitionAdoption('ACTIVE', 'UNDER_REVIEW')).toBe(true);
    expect(canTransitionAdoption('UNDER_REVIEW', 'ACTIVE')).toBe(true);
  });

  it('requires authority and provenance for adoption', () => {
    const adoption: Adoption = {
      adoptionId: 'adoption-1',
      curriculumBaselineRef: 'baseline-1',
      curriculumVersionRef: 'version-1',
      institutionalDecisionRef: 'decision-1',
      scope: { institutionRef: 'school-1', schoolYear: '2026/2027' },
      status: 'ACTIVE',
      effectiveFrom: '2026-09-01',
      provenanceRefs: [],
      authorityEvidenceRefs: [],
      recordedAt: '2026-08-31T08:00:00+02:00',
    };

    expect(validateAdoption(adoption)).toEqual(
      expect.arrayContaining(['AUTHORITY_EVIDENCE_REQUIRED', 'PROVENANCE_REQUIRED']),
    );
  });

  it('keeps Docente OS implementation evidence non-authoritative', () => {
    const evidence: ImplementationEvidenceEnvelope = {
      evidenceId: 'ev-1',
      kind: 'IMPLEMENTATION_ISSUE',
      curriculumBaselineRef: 'baseline-1',
      adoptionRef: 'adoption-1',
      sourceSystem: 'DOCENTE_OS',
      sourceRef: 'dos-observation-1',
      provenanceRefs: ['dos-event-1'],
      observedAt: '2026-10-10T09:00:00+02:00',
      payloadRef: 'payload-1',
      authorityClaim: 'NONE',
    };

    expect(validateImplementationEvidence(evidence)).toEqual([]);
    expect(ADOPTION_VALIDATION_INVARIANTS.docenteOsCannotMutateArenaCanonicalState).toBe(true);
  });

  it('requires reviewer authority before a validation outcome', () => {
    const review: ValidationReview = {
      reviewId: 'review-1',
      targetAdoptionRef: 'adoption-1',
      targetBaselineRef: 'baseline-1',
      triggerRefs: ['trigger-1'],
      evidenceRefs: ['evidence-1'],
      status: 'VALIDATED',
      findings: [],
      openedAt: '2027-05-01T10:00:00+02:00',
    };

    expect(validateValidationReview(review)).toContain('REVIEWER_AUTHORITY_REQUIRED_FOR_OUTCOME');
    expect(canTransitionValidation('UNDER_REVIEW', 'VALIDATED')).toBe(true);
  });
});
