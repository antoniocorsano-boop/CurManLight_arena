import { describe, expect, it } from 'vitest';
import { DocenteFeedbackInbox, prepareDocenteFeedbackObservation } from '../domain/transfer/docenteFeedbackIntake';

const ref = (namespace: string, entityType: string, entityId: string, versionId?: string) => ({
  namespace, entityType, entityId, ...(versionId ? { versionId } : {}),
});

function envelope() {
  return {
    contract: 'CML_INTEROP_V1',
    messageId: 'feedback-001',
    messageType: 'CURRICULUM_FEEDBACK_SUBMITTED',
    sourceProduct: 'DOCENTE_OS',
    sourceVersion: 'docente-os-develop',
    emittedAt: '2026-08-27T21:00:00.000Z',
    payloadVersion: 1,
    privacyClass: 'PROFESSIONAL_NON_PERSONAL',
    provenance: {
      sourceRefs: [
        ref('docente.os', 'CurricularContext', 'ctx-tech-1a-2026', 'deadbeef'),
        ref('curmanlight.arena', 'CurriculumVersion', 'technology-grade-1', '2026-27'),
        ref('docente.os', 'AnnualPlanBlock', 'section-1a:B04', '2026-27'),
      ],
      generatedBy: 'HUMAN',
      humanConfirmed: true,
      note: 'Teacher-confirmed professional observation.',
    },
    payload: {
      curriculumVersionRef: ref('curmanlight.arena', 'CurriculumVersion', 'technology-grade-1', '2026-27'),
      alignedNodeRefs: [ref('curmanlight.arena', 'CurriculumNode', 'node-001')],
      summary: 'Il prerequisito grafico va anticipato prima dell’attività di modellazione.',
      evidenceRefs: [ref('docente.os', 'AnnualPlanBlock', 'section-1a:B04', '2026-27')],
      teacherConfirmed: true,
    },
  };
}

describe('Docente OS curriculum feedback intake', () => {
  it('accepts the shared reverse envelope only as non-authoritative professional evidence', () => {
    const observation = prepareDocenteFeedbackObservation(envelope());
    expect(observation.status).toBe('READY_FOR_HUMAN_TRIAGE');
    expect(observation.authority).toBe('NON_AUTHORITATIVE_PROFESSIONAL_EVIDENCE');
    expect(observation.automaticProposalAllowed).toBe(false);
    expect(observation.automaticDecisionAllowed).toBe(false);
    expect(observation.summary).toContain('prerequisito grafico');
  });

  it('is idempotent for the same Docente OS message', () => {
    const inbox = new DocenteFeedbackInbox();
    const first = inbox.receive(envelope());
    const second = inbox.receive(envelope());
    expect(second.idempotencyKey).toBe(first.idempotencyKey);
    expect(inbox.list()).toHaveLength(1);
  });

  it('fails closed on a same-id payload conflict', () => {
    const inbox = new DocenteFeedbackInbox();
    inbox.receive(envelope());
    const changed = envelope();
    changed.payload.summary = 'Una osservazione differente con lo stesso identificativo.';
    expect(() => inbox.receive(changed)).toThrow(/idempotency conflict/);
  });

  it('rejects student personal-data fields through the shared interop validator', () => {
    const changed = envelope() as Record<string, any>;
    changed.payload.studentName = 'forbidden';
    expect(() => prepareDocenteFeedbackObservation(changed)).toThrow(/INTEROP_PRIVACY_REJECTED/);
  });

  it('rejects feedback that is not explicitly teacher-confirmed', () => {
    const changed = envelope();
    changed.payload.teacherConfirmed = false;
    expect(() => prepareDocenteFeedbackObservation(changed)).toThrow(/INTEROP_PAYLOAD_INVALID/);
  });
});
