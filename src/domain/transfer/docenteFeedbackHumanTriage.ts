import type { CmlCanonicalRef } from './interopV1';
import type { DocenteFeedbackObservation } from './docenteFeedbackIntake';

export type DocenteFeedbackTriageOutcome =
  | 'NOT_RELEVANT'
  | 'NEEDS_CONTEXT'
  | 'CANDIDATE_FOR_PROPOSAL_AUTHORING';

export interface DocenteFeedbackHumanTriageInput {
  readonly observation: DocenteFeedbackObservation;
  readonly outcome: DocenteFeedbackTriageOutcome;
  readonly rationale: string;
  readonly triagedBy: string;
  readonly triagedAt: string;
  readonly targetNodeRef?: CmlCanonicalRef;
}

export interface DocenteFeedbackProposalAuthoringRequest {
  readonly requestId: string;
  readonly sourceObservationId: string;
  readonly sourceMessageId: string;
  readonly status: 'AWAITING_HUMAN_PROPOSAL_AUTHORING';
  readonly automaticProposalAllowed: false;
  readonly automaticDecisionAllowed: false;
  readonly curriculumVersionRef: CmlCanonicalRef;
  readonly targetNodeRef: CmlCanonicalRef;
  readonly evidenceRefs: readonly CmlCanonicalRef[];
  readonly provenanceRefs: readonly CmlCanonicalRef[];
  readonly suggestedRationale: string;
}

export interface DocenteFeedbackHumanTriageReceipt {
  readonly triageId: string;
  readonly observationId: string;
  readonly outcome: DocenteFeedbackTriageOutcome;
  readonly rationale: string;
  readonly triagedBy: string;
  readonly triagedAt: string;
  readonly status: 'TRIAGED';
  readonly proposalAuthoringRequest?: DocenteFeedbackProposalAuthoringRequest;
}

function cloneRef(ref: CmlCanonicalRef): CmlCanonicalRef {
  return { ...ref };
}

function requireText(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${field} is required for human triage`);
  return trimmed;
}

function requireIsoDate(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) throw new Error('triagedAt must be a valid ISO date');
  return new Date(parsed).toISOString();
}

export function triageDocenteFeedback(input: DocenteFeedbackHumanTriageInput): DocenteFeedbackHumanTriageReceipt {
  const { observation } = input;
  if (observation.status !== 'READY_FOR_HUMAN_TRIAGE') {
    throw new Error('only READY_FOR_HUMAN_TRIAGE observations can be triaged');
  }
  if (observation.authority !== 'NON_AUTHORITATIVE_PROFESSIONAL_EVIDENCE') {
    throw new Error('human triage requires non-authoritative professional evidence');
  }

  const rationale = requireText(input.rationale, 'rationale');
  const triagedBy = requireText(input.triagedBy, 'triagedBy');
  const triagedAt = requireIsoDate(input.triagedAt);
  const triageId = `docente-feedback-triage:${observation.receivedMessageId}:${input.outcome}`;

  if (input.outcome !== 'CANDIDATE_FOR_PROPOSAL_AUTHORING') {
    if (input.targetNodeRef) throw new Error('targetNodeRef is only valid for proposal-authoring candidates');
    return {
      triageId,
      observationId: observation.observationId,
      outcome: input.outcome,
      rationale,
      triagedBy,
      triagedAt,
      status: 'TRIAGED',
    };
  }

  if (!input.targetNodeRef) {
    throw new Error('targetNodeRef is required before requesting human proposal authoring');
  }

  return {
    triageId,
    observationId: observation.observationId,
    outcome: input.outcome,
    rationale,
    triagedBy,
    triagedAt,
    status: 'TRIAGED',
    proposalAuthoringRequest: {
      requestId: `proposal-authoring:${observation.receivedMessageId}`,
      sourceObservationId: observation.observationId,
      sourceMessageId: observation.receivedMessageId,
      status: 'AWAITING_HUMAN_PROPOSAL_AUTHORING',
      automaticProposalAllowed: false,
      automaticDecisionAllowed: false,
      curriculumVersionRef: cloneRef(observation.curriculumVersionRef),
      targetNodeRef: cloneRef(input.targetNodeRef),
      evidenceRefs: observation.evidenceRefs.map(cloneRef),
      provenanceRefs: observation.provenanceRefs.map(cloneRef),
      suggestedRationale: rationale,
    },
  };
}
