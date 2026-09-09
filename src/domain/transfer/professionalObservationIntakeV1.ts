import type { CmlCanonicalRef } from './interopV1';
import {
  DocenteFeedbackInbox,
  type DocenteFeedbackObservation,
} from './docenteFeedbackIntake';

export const CML_PROFESSIONAL_OBSERVATION_REVIEW_INPUT_V1 = 'CML_PROFESSIONAL_OBSERVATION_REVIEW_INPUT_V1' as const;

export type ProfessionalObservationReviewBoundaryState = 'NOT_READY' | 'READY';
export type ProfessionalObservationRoutingState =
  | 'WAITING_FOR_GOVERNED_REVIEW_BOUNDARY'
  | 'READY_FOR_HUMAN_REVIEW_ROUTING';

export interface ProfessionalObservationReviewInputV1 {
  readonly contract: typeof CML_PROFESSIONAL_OBSERVATION_REVIEW_INPUT_V1;
  readonly observationId: string;
  readonly receivedMessageId: string;
  readonly sourceProduct: 'DOCENTE_OS';
  readonly sourceVersion: string;
  readonly emittedAt: string;
  readonly authority: 'NON_AUTHORITATIVE_PROFESSIONAL_EVIDENCE';
  readonly role: 'REVIEW_INPUT_ONLY';
  readonly triageRequired: true;
  readonly reviewBoundaryState: ProfessionalObservationReviewBoundaryState;
  readonly routingState: ProfessionalObservationRoutingState;
  readonly automaticPromotionAllowed: false;
  readonly automaticProposalAllowed: false;
  readonly automaticDecisionAllowed: false;
  readonly teamProfessionalOutcomeEffect: 'NONE';
  readonly verticalReviewOutcomeEffect: 'NONE';
  readonly institutionalDecisionEffect: 'NONE';
  readonly curriculumMutationEffect: 'NONE';
  readonly curriculumVersionRef: CmlCanonicalRef;
  readonly alignedNodeRefs: readonly CmlCanonicalRef[];
  readonly summary: string;
  readonly professionalReviewEvidenceRef: CmlCanonicalRef;
  readonly provenanceRefs: readonly CmlCanonicalRef[];
}

export interface ProfessionalObservationIntakeReceiptV1 {
  readonly status: 'ACCEPTED_AS_REVIEW_INPUT';
  readonly idempotencyKey: string;
  readonly reviewInput: ProfessionalObservationReviewInputV1;
}

const RAW_CLASSROOM_ENTITY_TYPES = new Set([
  'TeachingSession',
  'TeachingSessionRecord',
  'ClassroomEvidence',
  'ClassroomEvidenceV1',
  'FormativeFeedback',
  'FormativeFeedbackV1',
  'LearnerResponse',
  'LearnerResponseV1',
  'AssessmentObservation',
  'TeacherAssessmentObservationV1',
  'AnnualPlanBlock',
]);

function cloneRef(ref: CmlCanonicalRef): CmlCanonicalRef {
  return { ...ref };
}

function refKey(ref: CmlCanonicalRef): string {
  return `${ref.namespace}|${ref.entityType}|${ref.entityId}|${ref.versionId ?? ''}`;
}

function isArenaRef(ref: CmlCanonicalRef): boolean {
  return ref.namespace === 'curmanlight.arena';
}

function isProfessionalReviewEvidenceRef(ref: CmlCanonicalRef): boolean {
  return ref.namespace === 'docente.os'
    && ref.entityType === 'TeacherCurriculumReviewEvidence'
    && ref.entityId.trim().length > 0;
}

function looksLikePupilEntityType(entityType: string): boolean {
  return /(student|pupil|alunn|learner)/i.test(entityType);
}

function assertObservationIsProfessionalReviewInput(observation: DocenteFeedbackObservation): CmlCanonicalRef {
  if (observation.authority !== 'NON_AUTHORITATIVE_PROFESSIONAL_EVIDENCE') {
    throw new Error('professional observation intake requires non-authoritative professional evidence');
  }
  if (observation.status !== 'READY_FOR_HUMAN_TRIAGE') {
    throw new Error('professional observation intake requires human-triage-ready evidence');
  }
  if (observation.automaticProposalAllowed || observation.automaticDecisionAllowed) {
    throw new Error('professional observation intake forbids automatic proposal or decision effects');
  }
  if (!isArenaRef(observation.curriculumVersionRef)) {
    throw new Error('professional observation must target an Arena curriculum version reference');
  }
  if (observation.alignedNodeRefs.length === 0 || !observation.alignedNodeRefs.every(isArenaRef)) {
    throw new Error('professional observation must align only to Arena curriculum node references');
  }
  if (observation.evidenceRefs.length !== 1 || !isProfessionalReviewEvidenceRef(observation.evidenceRefs[0])) {
    throw new Error('C2P-08 requires exactly one aggregated TeacherCurriculumReviewEvidence reference');
  }

  for (const ref of observation.provenanceRefs) {
    if (looksLikePupilEntityType(ref.entityType)) {
      throw new Error('professional observation provenance cannot contain pupil-level references');
    }
    if (RAW_CLASSROOM_ENTITY_TYPES.has(ref.entityType)) {
      throw new Error(`professional observation provenance cannot contain raw classroom reference: ${ref.entityType}`);
    }
  }

  const professionalEvidence = observation.evidenceRefs[0];
  if (!observation.provenanceRefs.some((ref) => refKey(ref) === refKey(professionalEvidence))) {
    throw new Error('professional review evidence must be present in observation provenance');
  }
  return professionalEvidence;
}

export function projectProfessionalObservationReviewInputV1(input: {
  observation: DocenteFeedbackObservation;
  reviewBoundaryState: ProfessionalObservationReviewBoundaryState;
}): ProfessionalObservationReviewInputV1 {
  const professionalEvidence = assertObservationIsProfessionalReviewInput(input.observation);
  return {
    contract: CML_PROFESSIONAL_OBSERVATION_REVIEW_INPUT_V1,
    observationId: input.observation.observationId,
    receivedMessageId: input.observation.receivedMessageId,
    sourceProduct: 'DOCENTE_OS',
    sourceVersion: input.observation.sourceVersion,
    emittedAt: input.observation.emittedAt,
    authority: 'NON_AUTHORITATIVE_PROFESSIONAL_EVIDENCE',
    role: 'REVIEW_INPUT_ONLY',
    triageRequired: true,
    reviewBoundaryState: input.reviewBoundaryState,
    routingState: input.reviewBoundaryState === 'READY'
      ? 'READY_FOR_HUMAN_REVIEW_ROUTING'
      : 'WAITING_FOR_GOVERNED_REVIEW_BOUNDARY',
    automaticPromotionAllowed: false,
    automaticProposalAllowed: false,
    automaticDecisionAllowed: false,
    teamProfessionalOutcomeEffect: 'NONE',
    verticalReviewOutcomeEffect: 'NONE',
    institutionalDecisionEffect: 'NONE',
    curriculumMutationEffect: 'NONE',
    curriculumVersionRef: cloneRef(input.observation.curriculumVersionRef),
    alignedNodeRefs: input.observation.alignedNodeRefs.map(cloneRef),
    summary: input.observation.summary,
    professionalReviewEvidenceRef: cloneRef(professionalEvidence),
    provenanceRefs: input.observation.provenanceRefs.map(cloneRef),
  };
}

export function receiveProfessionalObservationReviewInputV1(input: {
  inbox: DocenteFeedbackInbox;
  envelope: unknown;
  reviewBoundaryState: ProfessionalObservationReviewBoundaryState;
}): ProfessionalObservationIntakeReceiptV1 {
  const receipt = input.inbox.receive(input.envelope);
  return {
    status: 'ACCEPTED_AS_REVIEW_INPUT',
    idempotencyKey: receipt.idempotencyKey,
    reviewInput: projectProfessionalObservationReviewInputV1({
      observation: receipt.observation,
      reviewBoundaryState: input.reviewBoundaryState,
    }),
  };
}
