import { describe, expect, it } from 'vitest';
import { annualPlanningFrameworkFixture } from '../domain/transfer/interopV1Fixtures';
import {
  CML_CURRICULUM_CONTEXT_CONTRACT,
  createCmlLocalHandoffV2,
  type CurriculumContextForClassV1,
} from '../domain/transfer/interopCurriculumContextV2';
import { createCurriculumReleaseContractV1 } from '../domain/transfer/curriculumReleaseContractV1';
import { DocenteFeedbackInbox } from '../domain/transfer/docenteFeedbackIntake';
import { receiveProfessionalObservationReviewInputV1 } from '../domain/transfer/professionalObservationIntakeV1';

const ref = (namespace: string, entityType: string, entityId: string, versionId?: string) => ({
  namespace,
  entityType,
  entityId,
  ...(versionId ? { versionId } : {}),
});

function arenaRef(entityType: string, entityId: string, versionId?: string) {
  return ref('curmanlight.arena', entityType, entityId, versionId);
}

function approvedContext(): CurriculumContextForClassV1 {
  return {
    contract: CML_CURRICULUM_CONTEXT_CONTRACT,
    contextId: 'ctx-technology-grade-1-2026-27',
    institutionRef: arenaRef('Institution', 'school-demo'),
    schoolYearRef: '2026-2027',
    disciplineRef: 'technology',
    gradeRef: 'grade-1',
    sectionRef: 'section-A',
    curriculumRef: arenaRef('Curriculum', 'technology'),
    curriculumVersionRef: arenaRef('CurriculumVersion', 'technology-grade-1', '2026-27'),
    curriculumState: 'APPROVED',
    approvalProcessRef: arenaRef('RevisionProcess', 'curriculum-2025-transition'),
    approvalDecisionRef: arenaRef('InstitutionalDecision', 'decision-approved-gp'),
    applicabilityStatus: 'TRANSITIONAL',
    transitionRuleRef: arenaRef('TransitionRule', 'dm221-2025-art5'),
    completeForPlanning: true,
    requirements: [
      {
        requirementId: 'req-001',
        kind: 'SPECIFIC_LEARNING_OBJECTIVE',
        authorityLevel: 'NATIONAL_PRESCRIPTIVE',
        curriculumNodeRef: arenaRef('CurriculumNode', 'node-001'),
        description: 'Requisito curricolare nazionale da garantire nel percorso.',
        coverageRequired: true,
        sourceRefs: [arenaRef('NationalFramework', 'indicazioni-2025')],
      },
      {
        requirementId: 'req-002',
        kind: 'INSTITUTIONAL_REQUIREMENT',
        authorityLevel: 'TRANSITION_REQUIRED',
        curriculumNodeRef: arenaRef('CurriculumNode', 'node-002'),
        description: 'Requisito derivato dalla rimodulazione transitoria di istituto.',
        coverageRequired: true,
        sourceRefs: [arenaRef('CurriculumDraft', 'technology-transition-draft')],
        transitionOriginRef: arenaRef('TransitionRemodulationProposal', 'remod-001'),
      },
    ],
    transitionRemodulation: {
      state: 'HYPOTHESIS',
      rationale: 'Ipotesi completa per consentire la progettazione durante il processo di approvazione.',
      sourceRefs: [arenaRef('NationalFramework', 'indicazioni-2012'), arenaRef('NationalFramework', 'indicazioni-2025')],
      affectedRequirementIds: ['req-002'],
      usableForPlanning: true,
      institutionallyApproved: false,
      proposalRef: arenaRef('RevisionProposal', 'remod-001'),
    },
    sourceRefs: [arenaRef('InstitutionalDecision', 'decision-approved-gp')],
  };
}

function professionalEnvelope() {
  const reviewEvidence = ref('docente.os', 'TeacherCurriculumReviewEvidence', 'review-gp-001', '1');
  return {
    contract: 'CML_INTEROP_V1',
    messageId: 'review-gp-001',
    messageType: 'CURRICULUM_FEEDBACK_SUBMITTED',
    sourceProduct: 'DOCENTE_OS',
    sourceVersion: 'docente-os-c2p-10-preflight',
    emittedAt: '2026-09-20T08:00:00.000Z',
    payloadVersion: 1,
    privacyClass: 'PROFESSIONAL_NON_PERSONAL',
    provenance: {
      sourceRefs: [
        ref('docente.os', 'CurricularContext', 'ctx-gp-v1', 'deadbeef'),
        arenaRef('CurriculumVersionProjection', 'school-demo:technology:secondaria:grade-1', '2026-27-v1'),
        reviewEvidence,
      ],
      generatedBy: 'HUMAN',
      humanConfirmed: true,
      note: 'Teacher-confirmed aggregated professional curriculum review.',
    },
    payload: {
      curriculumVersionRef: arenaRef(
        'CurriculumVersionProjection',
        'school-demo:technology:secondaria:grade-1',
        '2026-27-v1',
      ),
      alignedNodeRefs: [arenaRef('CurriculumNodeProjection', 'node-gp-001')],
      summary: 'Il riesame professionale segnala un prerequisito ricorrente da discutere nel riesame curricolare.',
      evidenceRefs: [reviewEvidence],
      teacherConfirmed: true,
    },
  };
}

describe('C2P-10 Arena golden path predeploy bookends', () => {
  it('exposes the Arena release as a preview-only C1 contract with no downstream write authority', () => {
    const handoff = createCmlLocalHandoffV2({
      curricularContext: approvedContext(),
      annualPlanningFramework: annualPlanningFrameworkFixture,
      generatedAt: '2026-09-10T06:00:00.000Z',
    });
    const release = createCurriculumReleaseContractV1(handoff);

    expect(release.authorityState).toBe('APPROVED');
    expect(release.authorityReceiptRef).toBeDefined();
    expect(release.downstreamPolicy).toEqual({
      targetProduct: 'DOCENTE_OS',
      importMode: 'PREVIEW_ONLY',
      acceptanceRequired: true,
      automaticWriteAllowed: false,
    });
  });

  it('accepts the returning professional observation only as non-authoritative human review input', () => {
    const receipt = receiveProfessionalObservationReviewInputV1({
      inbox: new DocenteFeedbackInbox(),
      envelope: professionalEnvelope(),
      reviewBoundaryState: 'NOT_READY',
    });

    expect(receipt.status).toBe('ACCEPTED_AS_REVIEW_INPUT');
    expect(receipt.reviewInput.role).toBe('REVIEW_INPUT_ONLY');
    expect(receipt.reviewInput.routingState).toBe('WAITING_FOR_GOVERNED_REVIEW_BOUNDARY');
    expect(receipt.reviewInput.triageRequired).toBe(true);
    expect(receipt.reviewInput.automaticPromotionAllowed).toBe(false);
    expect(receipt.reviewInput.teamProfessionalOutcomeEffect).toBe('NONE');
    expect(receipt.reviewInput.verticalReviewOutcomeEffect).toBe('NONE');
    expect(receipt.reviewInput.institutionalDecisionEffect).toBe('NONE');
    expect(receipt.reviewInput.curriculumMutationEffect).toBe('NONE');
    expect(receipt.reviewInput.professionalReviewEvidenceRef.entityType).toBe('TeacherCurriculumReviewEvidence');
  });

  it('does not let golden-path preflight manufacture the missing governed review boundary', () => {
    const receipt = receiveProfessionalObservationReviewInputV1({
      inbox: new DocenteFeedbackInbox(),
      envelope: professionalEnvelope(),
      reviewBoundaryState: 'NOT_READY',
    });

    expect(receipt.reviewInput.reviewBoundaryState).toBe('NOT_READY');
    expect(receipt.reviewInput.routingState).toBe('WAITING_FOR_GOVERNED_REVIEW_BOUNDARY');
    expect('teamProfessionalOutcome' in receipt.reviewInput).toBe(false);
    expect('verticalReviewOutcome' in receipt.reviewInput).toBe(false);
    expect('institutionalDecision' in receipt.reviewInput).toBe(false);
  });
});
