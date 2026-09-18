import { describe, expect, it } from 'vitest';
import { DocenteFeedbackInbox } from '../domain/transfer/docenteFeedbackIntake';
import {
  projectProfessionalObservationReviewInputV1,
  receiveProfessionalObservationReviewInputV1,
} from '../domain/transfer/professionalObservationIntakeV1';

const ref = (namespace: string, entityType: string, entityId: string, versionId?: string) => ({
  namespace, entityType, entityId, ...(versionId ? { versionId } : {}),
});

function professionalEnvelope() {
  const reviewEvidence = ref('docente.os', 'TeacherCurriculumReviewEvidence', 'review-tech-001', '1');
  return {
    contract: 'CML_INTEROP_V1',
    messageId: 'professional-observation-001',
    messageType: 'CURRICULUM_FEEDBACK_SUBMITTED',
    sourceProduct: 'DOCENTE_OS',
    sourceVersion: 'c2p-07-exact-head',
    emittedAt: '2026-09-09T20:10:00.000Z',
    payloadVersion: 1,
    privacyClass: 'PROFESSIONAL_NON_PERSONAL',
    provenance: {
      sourceRefs: [
        ref('docente.os', 'CurricularContext', 'ctx-tech-grade1', 'deadbeef'),
        ref('curmanlight.arena', 'CurriculumVersionProjection', 'technology-grade-1', '2026-27-v1'),
        reviewEvidence,
      ],
      generatedBy: 'HUMAN',
      humanConfirmed: true,
      note: 'Teacher-confirmed aggregated professional curriculum review.',
    },
    payload: {
      curriculumVersionRef: ref('curmanlight.arena', 'CurriculumVersionProjection', 'technology-grade-1', '2026-27-v1'),
      alignedNodeRefs: [
        ref('curmanlight.arena', 'CurriculumNodeProjection', 'technology-project-method'),
        ref('curmanlight.arena', 'CurriculumNodeProjection', 'technology-drawing'),
      ],
      summary: 'Il riesame professionale segnala un prerequisito ricorrente da discutere nel riesame curricolare.',
      evidenceRefs: [reviewEvidence],
      teacherConfirmed: true,
    },
  };
}

describe('C2P-08 professional observation intake', () => {
  it('accepts C2P-07 evidence only as review input while the governed review boundary is not ready', () => {
    const receipt = receiveProfessionalObservationReviewInputV1({
      inbox: new DocenteFeedbackInbox(),
      envelope: professionalEnvelope(),
      reviewBoundaryState: 'NOT_READY',
    });

    expect(receipt.status).toBe('ACCEPTED_AS_REVIEW_INPUT');
    expect(receipt.reviewInput.role).toBe('REVIEW_INPUT_ONLY');
    expect(receipt.reviewInput.triageRequired).toBe(true);
    expect(receipt.reviewInput.routingState).toBe('WAITING_FOR_GOVERNED_REVIEW_BOUNDARY');
    expect(receipt.reviewInput.authority).toBe('NON_AUTHORITATIVE_PROFESSIONAL_EVIDENCE');
    expect(receipt.reviewInput.automaticPromotionAllowed).toBe(false);
    expect(receipt.reviewInput.teamProfessionalOutcomeEffect).toBe('NONE');
    expect(receipt.reviewInput.verticalReviewOutcomeEffect).toBe('NONE');
    expect(receipt.reviewInput.institutionalDecisionEffect).toBe('NONE');
    expect(receipt.reviewInput.curriculumMutationEffect).toBe('NONE');
  });

  it('still requires human routing and creates no governed outcome when the review boundary becomes ready', () => {
    const receipt = receiveProfessionalObservationReviewInputV1({
      inbox: new DocenteFeedbackInbox(),
      envelope: professionalEnvelope(),
      reviewBoundaryState: 'READY',
    });

    expect(receipt.reviewInput.routingState).toBe('READY_FOR_HUMAN_REVIEW_ROUTING');
    expect(receipt.reviewInput.triageRequired).toBe(true);
    expect(receipt.reviewInput.automaticProposalAllowed).toBe(false);
    expect(receipt.reviewInput.automaticDecisionAllowed).toBe(false);
    expect(receipt.reviewInput.teamProfessionalOutcomeEffect).toBe('NONE');
    expect(receipt.reviewInput.verticalReviewOutcomeEffect).toBe('NONE');
    expect(receipt.reviewInput.institutionalDecisionEffect).toBe('NONE');
    expect('teamProfessionalOutcome' in receipt.reviewInput).toBe(false);
    expect('verticalReviewOutcome' in receipt.reviewInput).toBe(false);
    expect('institutionalDecision' in receipt.reviewInput).toBe(false);
  });

  it('requires exactly one aggregated TeacherCurriculumReviewEvidence reference', () => {
    const inbox = new DocenteFeedbackInbox();
    const changed = professionalEnvelope();
    changed.payload.evidenceRefs = [
      ref('docente.os', 'AnnualPlanBlock', 'section-1a:B04', '2026-27'),
    ];

    expect(() => receiveProfessionalObservationReviewInputV1({
      inbox,
      envelope: changed,
      reviewBoundaryState: 'NOT_READY',
    })).toThrow(/exactly one aggregated TeacherCurriculumReviewEvidence/);
  });

  it('rejects raw classroom provenance even if the aggregated review evidence is present', () => {
    const changed = professionalEnvelope();
    changed.provenance.sourceRefs.push(ref('docente.os', 'ClassroomEvidenceV1', 'evidence-local-001'));

    expect(() => receiveProfessionalObservationReviewInputV1({
      inbox: new DocenteFeedbackInbox(),
      envelope: changed,
      reviewBoundaryState: 'NOT_READY',
    })).toThrow(/raw classroom reference/);
  });

  it('rejects pupil-level provenance', () => {
    const changed = professionalEnvelope();
    changed.provenance.sourceRefs.push(ref('docente.os', 'StudentEvidence', 'student-evidence-001'));

    expect(() => receiveProfessionalObservationReviewInputV1({
      inbox: new DocenteFeedbackInbox(),
      envelope: changed,
      reviewBoundaryState: 'NOT_READY',
    })).toThrow(/pupil-level references/);
  });

  it('rejects observations aligned outside Arena curriculum references', () => {
    const changed = professionalEnvelope();
    changed.payload.alignedNodeRefs = [ref('docente.os', 'LocalSkill', 'skill-001')];

    expect(() => receiveProfessionalObservationReviewInputV1({
      inbox: new DocenteFeedbackInbox(),
      envelope: changed,
      reviewBoundaryState: 'NOT_READY',
    })).toThrow(/align only to Arena curriculum node references/);
  });

  it('inherits the shared privacy validator for explicit pupil fields', () => {
    const changed = professionalEnvelope() as Record<string, any>;
    changed.payload.studentName = 'forbidden';

    expect(() => receiveProfessionalObservationReviewInputV1({
      inbox: new DocenteFeedbackInbox(),
      envelope: changed,
      reviewBoundaryState: 'NOT_READY',
    })).toThrow(/INTEROP_PRIVACY_REJECTED/);
  });

  it('inherits teacher-confirmation enforcement from the existing intake', () => {
    const changed = professionalEnvelope();
    changed.payload.teacherConfirmed = false;

    expect(() => receiveProfessionalObservationReviewInputV1({
      inbox: new DocenteFeedbackInbox(),
      envelope: changed,
      reviewBoundaryState: 'NOT_READY',
    })).toThrow(/INTEROP_PAYLOAD_INVALID/);
  });

  it('preserves idempotency through the existing DocenteFeedbackInbox', () => {
    const inbox = new DocenteFeedbackInbox();
    const first = receiveProfessionalObservationReviewInputV1({
      inbox,
      envelope: professionalEnvelope(),
      reviewBoundaryState: 'NOT_READY',
    });
    const second = receiveProfessionalObservationReviewInputV1({
      inbox,
      envelope: professionalEnvelope(),
      reviewBoundaryState: 'NOT_READY',
    });
    expect(second.idempotencyKey).toBe(first.idempotencyKey);
    expect(inbox.list()).toHaveLength(1);
  });

  it('fails closed on same-message idempotency conflict', () => {
    const inbox = new DocenteFeedbackInbox();
    receiveProfessionalObservationReviewInputV1({
      inbox,
      envelope: professionalEnvelope(),
      reviewBoundaryState: 'NOT_READY',
    });
    const changed = professionalEnvelope();
    changed.payload.summary = 'Sintesi professionale differente con lo stesso identificativo di messaggio.';

    expect(() => receiveProfessionalObservationReviewInputV1({
      inbox,
      envelope: changed,
      reviewBoundaryState: 'NOT_READY',
    })).toThrow(/idempotency conflict/);
  });

  it('rejects a forged observation that claims automatic authority before projection', () => {
    const inbox = new DocenteFeedbackInbox();
    const receipt = inbox.receive(professionalEnvelope());
    const forged = ({
      ...receipt.observation,
      automaticDecisionAllowed: true,
    } as unknown) as typeof receipt.observation;

    expect(() => projectProfessionalObservationReviewInputV1({
      observation: forged,
      reviewBoundaryState: 'NOT_READY',
    })).toThrow(/forbids automatic proposal or decision effects/);
  });
});
