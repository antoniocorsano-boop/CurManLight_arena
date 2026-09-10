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

function approvedContext(): CurriculumContextForClassV1 {
  return {
    contract: CML_CURRICULUM_CONTEXT_CONTRACT,
    contextId: 'ctx-technology-grade-1-2026-27-approved',
    institutionRef: ref('curmanlight.arena', 'Institution', 'school-demo'),
    schoolYearRef: '2026-2027',
    disciplineRef: 'technology',
    gradeRef: 'grade-1',
    sectionRef: '1A',
    cohortRef: 'cohort-2026-grade-1',
    curriculumRef: ref('curmanlight.arena', 'Curriculum', 'technology'),
    curriculumVersionRef: ref('curmanlight.arena', 'CurriculumVersion', 'technology-grade-1', '2026-27'),
    curriculumState: 'APPROVED',
    approvalProcessRef: ref('curmanlight.arena', 'CurriculumApprovalProcess', 'technology-2026'),
    approvalDecisionRef: ref('curmanlight.arena', 'InstitutionalDecision', 'technology-2026-approved', '1'),
    applicabilityStatus: 'APPLICABLE',
    transitionRuleRef: ref('curmanlight.arena', 'TransitionRule', 'dm221-2025-art5'),
    completeForPlanning: true,
    requirements: [
      {
        requirementId: 'req-001',
        kind: 'SPECIFIC_LEARNING_OBJECTIVE',
        authorityLevel: 'NATIONAL_PRESCRIPTIVE',
        curriculumNodeRef: ref('curmanlight.arena', 'CurriculumNode', 'node-001'),
        description: 'Analizzare materiali, processi e sistemi tecnologici.',
        coverageRequired: true,
        sourceRefs: [ref('curmanlight.arena', 'NationalFramework', 'indicazioni-2025')],
      },
      {
        requirementId: 'req-002',
        kind: 'SPECIFIC_LEARNING_OBJECTIVE',
        authorityLevel: 'INSTITUTIONAL_REQUIRED',
        curriculumNodeRef: ref('curmanlight.arena', 'CurriculumNode', 'node-002'),
        description: 'Applicare un metodo progettuale esplicitando problema, vincoli e verifica.',
        coverageRequired: true,
        sourceRefs: [ref('curmanlight.arena', 'InstituteCurriculum', 'technology-2026')],
      },
    ],
    transitionRemodulation: {
      state: 'NOT_REQUIRED',
      rationale: 'Il curricolo approvato si applica direttamente alla classe.',
      sourceRefs: [ref('curmanlight.arena', 'NationalFramework', 'indicazioni-2025')],
      affectedRequirementIds: [],
      usableForPlanning: true,
      institutionallyApproved: false,
    },
    sourceRefs: [
      ref('curmanlight.arena', 'CurriculumVersion', 'technology-grade-1', '2026-27'),
      ref('curmanlight.arena', 'InstitutionalDecision', 'technology-2026-approved', '1'),
    ],
  };
}

function docenteProfessionalEnvelope(release: ReturnType<typeof createCurriculumReleaseContractV1>) {
  const professionalEvidence = ref(
    'docente.os',
    'TeacherCurriculumReviewEvidence',
    'teacher-review-uda-1-01',
    '1',
  );
  return {
    contract: 'CML_INTEROP_V1',
    messageId: 'teacher-review-uda-1-01',
    messageType: 'CURRICULUM_FEEDBACK_SUBMITTED',
    sourceProduct: 'DOCENTE_OS',
    sourceVersion: 'docente-os-c2p-10',
    emittedAt: '2026-09-10T10:00:00.000Z',
    payloadVersion: 1,
    privacyClass: 'PROFESSIONAL_NON_PERSONAL',
    provenance: {
      sourceRefs: [
        ref('docente.os', 'CurricularContext', 'ctx-technology-grade-1-2026-27-approved', release.structuralFingerprint.hash),
        release.curriculumVersionRef,
        professionalEvidence,
      ],
      generatedBy: 'HUMAN',
      humanConfirmed: true,
      note: 'Teacher-confirmed aggregated professional curriculum review.',
    },
    payload: {
      curriculumVersionRef: release.curriculumVersionRef,
      alignedNodeRefs: [release.planningSemantics.nodeRefs[1]],
      summary: 'Il riesame professionale segnala che il richiamo esplicito ai vincoli prima della fase progettuale favorisce revisioni più consapevoli.',
      evidenceRefs: [professionalEvidence],
      teacherConfirmed: true,
    },
  };
}

describe('C2P-10 Arena golden path automated bookends', () => {
  it('projects the governed release and accepts the returning Docente OS observation only as non-authoritative review input', () => {
    const context = approvedContext();
    const handoff = createCmlLocalHandoffV2({
      curricularContext: context,
      annualPlanningFramework: annualPlanningFrameworkFixture,
      generatedAt: '2026-09-10T06:00:00.000Z',
    });
    const release = createCurriculumReleaseContractV1(handoff);

    expect(release.authorityState).toBe('APPROVED');
    expect(release.authorityReceiptRef).toEqual(context.approvalDecisionRef);
    expect(release.downstreamPolicy).toEqual({
      targetProduct: 'DOCENTE_OS',
      importMode: 'PREVIEW_ONLY',
      acceptanceRequired: true,
      automaticWriteAllowed: false,
    });

    const receipt = receiveProfessionalObservationReviewInputV1({
      inbox: new DocenteFeedbackInbox(),
      envelope: docenteProfessionalEnvelope(release),
      reviewBoundaryState: 'NOT_READY',
    });

    expect(receipt.status).toBe('ACCEPTED_AS_REVIEW_INPUT');
    expect(receipt.reviewInput.curriculumVersionRef).toEqual(release.curriculumVersionRef);
    expect(receipt.reviewInput.professionalReviewEvidenceRef).toEqual(
      ref('docente.os', 'TeacherCurriculumReviewEvidence', 'teacher-review-uda-1-01', '1'),
    );
    expect(receipt.reviewInput.authority).toBe('NON_AUTHORITATIVE_PROFESSIONAL_EVIDENCE');
    expect(receipt.reviewInput.role).toBe('REVIEW_INPUT_ONLY');
    expect(receipt.reviewInput.triageRequired).toBe(true);
    expect(receipt.reviewInput.routingState).toBe('WAITING_FOR_GOVERNED_REVIEW_BOUNDARY');
    expect(receipt.reviewInput.automaticPromotionAllowed).toBe(false);
    expect(receipt.reviewInput.automaticProposalAllowed).toBe(false);
    expect(receipt.reviewInput.automaticDecisionAllowed).toBe(false);
    expect(receipt.reviewInput.teamProfessionalOutcomeEffect).toBe('NONE');
    expect(receipt.reviewInput.verticalReviewOutcomeEffect).toBe('NONE');
    expect(receipt.reviewInput.institutionalDecisionEffect).toBe('NONE');
    expect(receipt.reviewInput.curriculumMutationEffect).toBe('NONE');
  });
});
