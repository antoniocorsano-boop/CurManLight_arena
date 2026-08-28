import { describe, expect, it } from 'vitest';
import type { DocenteFeedbackObservation } from '../domain/transfer/docenteFeedbackIntake';
import { triageDocenteFeedback } from '../domain/transfer/docenteFeedbackHumanTriage';

const ref = (namespace: string, entityType: string, entityId: string, versionId?: string) => ({
  namespace, entityType, entityId, ...(versionId ? { versionId } : {}),
});

function observation(): DocenteFeedbackObservation {
  return {
    observationId: 'docente-feedback:feedback-001',
    sourceProduct: 'DOCENTE_OS',
    sourceVersion: 'docente-os-develop',
    receivedMessageId: 'feedback-001',
    emittedAt: '2026-08-27T21:00:00.000Z',
    authority: 'NON_AUTHORITATIVE_PROFESSIONAL_EVIDENCE',
    status: 'READY_FOR_HUMAN_TRIAGE',
    automaticProposalAllowed: false,
    automaticDecisionAllowed: false,
    curriculumVersionRef: ref('curmanlight.arena', 'CurriculumVersion', 'technology-grade-1', '2026-27'),
    alignedNodeRefs: [ref('curmanlight.arena', 'CurriculumNode', 'node-001')],
    summary: 'Il prerequisito grafico va anticipato.',
    evidenceRefs: [ref('docente.os', 'AnnualPlanBlock', 'section-1a:B04', '2026-27')],
    provenanceRefs: [ref('docente.os', 'CurricularContext', 'ctx-tech-1a-2026', 'deadbeef')],
  };
}

describe('Docente OS feedback human triage', () => {
  it('can close an observation as not relevant without creating any proposal request', () => {
    const receipt = triageDocenteFeedback({
      observation: observation(),
      outcome: 'NOT_RELEVANT',
      rationale: 'Non modifica il curricolo di istituto.',
      triagedBy: 'referente-curricolo',
      triagedAt: '2026-08-28T06:00:00.000Z',
    });
    expect(receipt.status).toBe('TRIAGED');
    expect(receipt.proposalAuthoringRequest).toBeUndefined();
  });

  it('can request more context without creating any proposal request', () => {
    const receipt = triageDocenteFeedback({
      observation: observation(),
      outcome: 'NEEDS_CONTEXT',
      rationale: 'Serve verificare se l’osservazione ricorre in più classi.',
      triagedBy: 'referente-curricolo',
      triagedAt: '2026-08-28T06:00:00.000Z',
    });
    expect(receipt.outcome).toBe('NEEDS_CONTEXT');
    expect(receipt.proposalAuthoringRequest).toBeUndefined();
  });

  it('turns a human candidate decision only into an awaiting-authoring request', () => {
    const receipt = triageDocenteFeedback({
      observation: observation(),
      outcome: 'CANDIDATE_FOR_PROPOSAL_AUTHORING',
      rationale: 'L’evidenza può motivare una proposta da redigere e valutare separatamente.',
      triagedBy: 'referente-curricolo',
      triagedAt: '2026-08-28T06:00:00.000Z',
      targetNodeRef: ref('curmanlight.arena', 'CurriculumNode', 'node-001'),
    });
    expect(receipt.proposalAuthoringRequest?.status).toBe('AWAITING_HUMAN_PROPOSAL_AUTHORING');
    expect(receipt.proposalAuthoringRequest?.automaticProposalAllowed).toBe(false);
    expect(receipt.proposalAuthoringRequest?.automaticDecisionAllowed).toBe(false);
  });

  it('fails closed if a proposal-authoring candidate has no explicit target node', () => {
    expect(() => triageDocenteFeedback({
      observation: observation(),
      outcome: 'CANDIDATE_FOR_PROPOSAL_AUTHORING',
      rationale: 'Potenziale revisione.',
      triagedBy: 'referente-curricolo',
      triagedAt: '2026-08-28T06:00:00.000Z',
    })).toThrow(/targetNodeRef is required/);
  });

  it('requires a human rationale and actor', () => {
    expect(() => triageDocenteFeedback({
      observation: observation(),
      outcome: 'NOT_RELEVANT',
      rationale: '   ',
      triagedBy: 'referente-curricolo',
      triagedAt: '2026-08-28T06:00:00.000Z',
    })).toThrow(/rationale is required/);
  });
});
