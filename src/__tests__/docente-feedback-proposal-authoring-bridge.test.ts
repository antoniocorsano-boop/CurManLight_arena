import { describe, expect, it } from 'vitest';
import { createEmptyRevisionStore } from '../domain/revision/repository';
import {
  confirmProposalFromDocenteFeedback,
  prepareProposalFromDocenteFeedback,
} from '../domain/revision/docenteFeedbackProposalAuthoringBridge';
import type { DocenteFeedbackProposalAuthoringRequest } from '../domain/transfer/docenteFeedbackHumanTriage';

const ref = (namespace: string, entityType: string, entityId: string, versionId?: string) => ({
  namespace, entityType, entityId, ...(versionId ? { versionId } : {}),
});

function request(): DocenteFeedbackProposalAuthoringRequest {
  return {
    requestId: 'proposal-authoring:feedback-001',
    sourceObservationId: 'docente-feedback:feedback-001',
    sourceMessageId: 'feedback-001',
    status: 'AWAITING_HUMAN_PROPOSAL_AUTHORING',
    automaticProposalAllowed: false,
    automaticDecisionAllowed: false,
    curriculumVersionRef: ref('curmanlight.arena', 'CurriculumVersion', 'technology-grade-1', '2026-27'),
    targetNodeRef: ref('curmanlight.arena', 'CurriculumNode', 'node-001'),
    evidenceRefs: [ref('docente.os', 'AnnualPlanBlock', 'section-1a:B04', '2026-27')],
    provenanceRefs: [ref('docente.os', 'CurricularContext', 'ctx-tech-1a-2026', 'deadbeef')],
    suggestedRationale: 'Osservazione professionale da trasformare solo dopo authoring umano.',
  };
}

const author = {
  displayName: 'Referente curricolo',
  role: 'referente-curricolo' as const,
  assertion: 'self-declared' as const,
};

describe('Docente OS feedback → proposal authoring bridge', () => {
  it('prepares a preview but does not create a proposal automatically', () => {
    const preview = prepareProposalFromDocenteFeedback(request(), {
      currentTextSnapshot: 'Testo curricolare vigente.',
      proposedText: 'Testo curricolare proposto.',
      rationale: 'La modifica recepisce un pattern professionale verificato.',
      author,
    });
    expect(preview.status).toBe('AWAITING_HUMAN_CONFIRMATION');
    expect(preview.automaticCreationAllowed).toBe(false);
    expect(preview.targetNodeRef.entityType).toBe('curriculum-node');
  });

  it('fails closed without explicit human confirmation', () => {
    const preview = prepareProposalFromDocenteFeedback(request(), {
      currentTextSnapshot: 'Testo curricolare vigente.',
      proposedText: 'Testo curricolare proposto.',
      rationale: 'Motivazione umana.',
      author,
    });
    const result = confirmProposalFromDocenteFeedback(createEmptyRevisionStore(), preview, false);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors[0]?.code).toBe('HUMAN_CONFIRMATION_REQUIRED');
  });

  it('creates only a draft RevisionProposal after explicit human confirmation', () => {
    const preview = prepareProposalFromDocenteFeedback(request(), {
      currentTextSnapshot: 'Testo curricolare vigente.',
      proposedText: 'Testo curricolare proposto.',
      rationale: 'Motivazione umana.',
      author,
    });
    const result = confirmProposalFromDocenteFeedback(createEmptyRevisionStore(), preview, true, '2026-08-28T06:30:00.000Z');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.proposal.status).toBe('draft');
      expect(result.archive.decisions).toHaveLength(0);
      expect(result.proposal.evidenceRefs).toHaveLength(1);
      expect(result.proposal.sourceRefs).toHaveLength(1);
    }
  });

  it('requires complete human-authored proposal content', () => {
    expect(() => prepareProposalFromDocenteFeedback(request(), {
      currentTextSnapshot: 'Testo vigente.',
      proposedText: '   ',
      rationale: 'Motivazione.',
      author,
    })).toThrow(/proposedText is required/);
  });
});
