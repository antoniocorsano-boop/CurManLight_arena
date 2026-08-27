import {
  parseCmlInteropEnvelope,
  type CmlCanonicalRef,
  type CmlInteropEnvelope,
  type CurriculumFeedbackPayload,
} from './interopV1';

export type DocenteFeedbackAuthority = 'NON_AUTHORITATIVE_PROFESSIONAL_EVIDENCE';

export interface DocenteFeedbackObservation {
  readonly observationId: string;
  readonly sourceProduct: 'DOCENTE_OS';
  readonly sourceVersion: string;
  readonly receivedMessageId: string;
  readonly emittedAt: string;
  readonly authority: DocenteFeedbackAuthority;
  readonly status: 'READY_FOR_HUMAN_TRIAGE';
  readonly automaticProposalAllowed: false;
  readonly automaticDecisionAllowed: false;
  readonly curriculumVersionRef: CmlCanonicalRef;
  readonly alignedNodeRefs: readonly CmlCanonicalRef[];
  readonly summary: string;
  readonly evidenceRefs: readonly CmlCanonicalRef[];
  readonly provenanceRefs: readonly CmlCanonicalRef[];
}

export interface DocenteFeedbackIntakeReceipt {
  readonly status: 'ACCEPTED_AS_OBSERVATION';
  readonly idempotencyKey: string;
  readonly observation: DocenteFeedbackObservation;
}

function cloneRef(ref: CmlCanonicalRef): CmlCanonicalRef {
  return { ...ref };
}

function asFeedbackEnvelope(input: unknown): CmlInteropEnvelope<CurriculumFeedbackPayload> {
  const parsed = parseCmlInteropEnvelope(input);
  if (parsed.sourceProduct !== 'DOCENTE_OS') throw new Error('curriculum feedback source must be DOCENTE_OS');
  if (parsed.messageType !== 'CURRICULUM_FEEDBACK_SUBMITTED') throw new Error('only CURRICULUM_FEEDBACK_SUBMITTED can enter feedback intake');
  return parsed as CmlInteropEnvelope<CurriculumFeedbackPayload>;
}

export function prepareDocenteFeedbackObservation(input: unknown): DocenteFeedbackObservation {
  const envelope = asFeedbackEnvelope(input);
  return {
    observationId: `docente-feedback:${envelope.messageId}`,
    sourceProduct: 'DOCENTE_OS',
    sourceVersion: envelope.sourceVersion,
    receivedMessageId: envelope.messageId,
    emittedAt: envelope.emittedAt,
    authority: 'NON_AUTHORITATIVE_PROFESSIONAL_EVIDENCE',
    status: 'READY_FOR_HUMAN_TRIAGE',
    automaticProposalAllowed: false,
    automaticDecisionAllowed: false,
    curriculumVersionRef: cloneRef(envelope.payload.curriculumVersionRef),
    alignedNodeRefs: envelope.payload.alignedNodeRefs.map(cloneRef),
    summary: envelope.payload.summary.trim(),
    evidenceRefs: envelope.payload.evidenceRefs.map(cloneRef),
    provenanceRefs: envelope.provenance.sourceRefs.map(cloneRef),
  };
}

function stableObservationSignature(observation: DocenteFeedbackObservation): string {
  return JSON.stringify({
    messageId: observation.receivedMessageId,
    sourceVersion: observation.sourceVersion,
    curriculumVersionRef: observation.curriculumVersionRef,
    alignedNodeRefs: observation.alignedNodeRefs,
    summary: observation.summary,
    evidenceRefs: observation.evidenceRefs,
  });
}

export class DocenteFeedbackInbox {
  private readonly observations = new Map<string, DocenteFeedbackObservation>();

  receive(input: unknown): DocenteFeedbackIntakeReceipt {
    const observation = prepareDocenteFeedbackObservation(input);
    const key = `DOCENTE_OS:CURRICULUM_FEEDBACK_SUBMITTED:${observation.receivedMessageId}`;
    const existing = this.observations.get(key);
    if (existing) {
      if (stableObservationSignature(existing) !== stableObservationSignature(observation)) {
        throw new Error('idempotency conflict for Docente OS curriculum feedback');
      }
      return { status: 'ACCEPTED_AS_OBSERVATION', idempotencyKey: key, observation: existing };
    }
    this.observations.set(key, observation);
    return { status: 'ACCEPTED_AS_OBSERVATION', idempotencyKey: key, observation };
  }

  list(): readonly DocenteFeedbackObservation[] {
    return Object.freeze([...this.observations.values()]);
  }
}
