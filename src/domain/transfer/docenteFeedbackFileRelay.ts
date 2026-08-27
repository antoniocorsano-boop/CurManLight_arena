import {
  DocenteFeedbackInbox,
  type DocenteFeedbackIntakeReceipt,
  type DocenteFeedbackObservation,
} from './docenteFeedbackIntake';

export const DOCENTE_FEEDBACK_FILE_MAX_BYTES = 256 * 1024;
export const DOCENTE_FEEDBACK_LOCAL_STORAGE_KEY = 'CML_DOCENTE_FEEDBACK_TRIAGE_V1';

export function importDocenteFeedbackJson(
  text: string,
  previous: readonly DocenteFeedbackObservation[] = [],
): DocenteFeedbackIntakeReceipt {
  if (new TextEncoder().encode(text).byteLength > DOCENTE_FEEDBACK_FILE_MAX_BYTES) {
    throw new Error('Il file supera il limite di 256 KiB previsto per un’osservazione curricolare.');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Il file non contiene un JSON valido.');
  }
  const inbox = new DocenteFeedbackInbox();
  for (const observation of previous) {
    inbox.receive(observationToEnvelope(observation));
  }
  return inbox.receive(parsed);
}

export function parseStoredDocenteFeedback(value: string | null): DocenteFeedbackObservation[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredObservation).map(cloneObservation);
  } catch {
    return [];
  }
}

export function mergeStoredDocenteFeedback(
  previous: readonly DocenteFeedbackObservation[],
  incoming: DocenteFeedbackObservation,
): DocenteFeedbackObservation[] {
  const existing = previous.find((item) => item.receivedMessageId === incoming.receivedMessageId);
  if (existing) {
    if (JSON.stringify(existing) !== JSON.stringify(incoming)) throw new Error('Conflitto: esiste già un’osservazione con lo stesso identificativo ma contenuto diverso.');
    return previous.map(cloneObservation);
  }
  return [...previous.map(cloneObservation), cloneObservation(incoming)];
}

function observationToEnvelope(observation: DocenteFeedbackObservation) {
  return {
    contract: 'CML_INTEROP_V1',
    messageId: observation.receivedMessageId,
    messageType: 'CURRICULUM_FEEDBACK_SUBMITTED',
    sourceProduct: 'DOCENTE_OS',
    sourceVersion: observation.sourceVersion,
    emittedAt: observation.emittedAt,
    payloadVersion: 1,
    privacyClass: 'PROFESSIONAL_NON_PERSONAL',
    provenance: {
      sourceRefs: observation.provenanceRefs.map((ref) => ({ ...ref })),
      generatedBy: 'HUMAN',
      humanConfirmed: true,
    },
    payload: {
      curriculumVersionRef: { ...observation.curriculumVersionRef },
      alignedNodeRefs: observation.alignedNodeRefs.map((ref) => ({ ...ref })),
      category: observation.category,
      summary: observation.summary,
      evidenceRefs: observation.evidenceRefs.map((ref) => ({ ...ref })),
      teacherConfirmed: true,
    },
  };
}

function isStoredObservation(value: unknown): value is DocenteFeedbackObservation {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const item = value as Partial<DocenteFeedbackObservation>;
  return item.sourceProduct === 'DOCENTE_OS'
    && item.authority === 'NON_AUTHORITATIVE_PROFESSIONAL_EVIDENCE'
    && item.status === 'READY_FOR_HUMAN_TRIAGE'
    && item.automaticProposalAllowed === false
    && item.automaticDecisionAllowed === false
    && typeof item.receivedMessageId === 'string'
    && typeof item.summary === 'string'
    && Array.isArray(item.alignedNodeRefs)
    && Array.isArray(item.evidenceRefs)
    && Array.isArray(item.provenanceRefs);
}

function cloneObservation(observation: DocenteFeedbackObservation): DocenteFeedbackObservation {
  return {
    ...observation,
    curriculumVersionRef: { ...observation.curriculumVersionRef },
    alignedNodeRefs: observation.alignedNodeRefs.map((ref) => ({ ...ref })),
    evidenceRefs: observation.evidenceRefs.map((ref) => ({ ...ref })),
    provenanceRefs: observation.provenanceRefs.map((ref) => ({ ...ref })),
  };
}
