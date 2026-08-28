import type { ActorReference, EntityReference } from '../curriculum/identity';
import type { DocenteFeedbackProposalAuthoringRequest } from '../transfer/docenteFeedbackHumanTriage';
import type { RevisionProposalCreationResult, RevisionArchive } from './types';
import { addProposal } from './repository';

export interface DocenteFeedbackProposalDraftInput {
  readonly currentTextSnapshot: string;
  readonly proposedText: string;
  readonly rationale: string;
  readonly author: ActorReference;
}

export interface DocenteFeedbackProposalPreview {
  readonly status: 'AWAITING_HUMAN_CONFIRMATION';
  readonly sourceRequestId: string;
  readonly automaticCreationAllowed: false;
  readonly targetNodeRef: EntityReference;
  readonly curriculumVersionRef: EntityReference;
  readonly currentTextSnapshot: string;
  readonly proposedText: string;
  readonly rationale: string;
  readonly evidenceRefs: readonly EntityReference[];
  readonly sourceRefs: readonly EntityReference[];
  readonly author: ActorReference;
}

function requireText(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${field} is required for proposal authoring`);
  return trimmed;
}

function toEntityReference(ref: { entityId: string; entityType: string }): EntityReference {
  const typeMap: Record<string, EntityReference['entityType']> = {
    CurriculumVersion: 'curriculum-version',
    CurriculumNode: 'curriculum-node',
    AnnualPlanBlock: 'source',
    CurricularContext: 'source',
    Evidence: 'source',
    Source: 'source',
  };
  const entityType = typeMap[ref.entityType];
  if (!entityType) throw new Error(`unsupported canonical reference type: ${ref.entityType}`);
  return { id: ref.entityId as EntityReference['id'], entityType };
}

export function prepareProposalFromDocenteFeedback(
  request: DocenteFeedbackProposalAuthoringRequest,
  draft: DocenteFeedbackProposalDraftInput,
): DocenteFeedbackProposalPreview {
  if (request.status !== 'AWAITING_HUMAN_PROPOSAL_AUTHORING') {
    throw new Error('proposal authoring requires AWAITING_HUMAN_PROPOSAL_AUTHORING');
  }
  return {
    status: 'AWAITING_HUMAN_CONFIRMATION',
    sourceRequestId: request.requestId,
    automaticCreationAllowed: false,
    targetNodeRef: toEntityReference(request.targetNodeRef),
    curriculumVersionRef: toEntityReference(request.curriculumVersionRef),
    currentTextSnapshot: requireText(draft.currentTextSnapshot, 'currentTextSnapshot'),
    proposedText: requireText(draft.proposedText, 'proposedText'),
    rationale: requireText(draft.rationale, 'rationale'),
    evidenceRefs: request.evidenceRefs.map(toEntityReference),
    sourceRefs: request.provenanceRefs.map(toEntityReference),
    author: draft.author,
  };
}

export function confirmProposalFromDocenteFeedback(
  archive: RevisionArchive,
  preview: DocenteFeedbackProposalPreview,
  humanConfirmed: boolean,
  now = new Date().toISOString(),
): RevisionProposalCreationResult {
  if (!humanConfirmed) {
    return { success: false, errors: [{ code: 'HUMAN_CONFIRMATION_REQUIRED', message: 'La proposta non può essere creata senza conferma umana esplicita.' }] };
  }
  return addProposal(archive, {
    targetNodeRef: preview.targetNodeRef,
    curriculumVersionRef: preview.curriculumVersionRef,
    currentTextSnapshot: preview.currentTextSnapshot,
    proposedText: preview.proposedText,
    rationale: preview.rationale,
    evidenceRefs: [...preview.evidenceRefs],
    sourceRefs: [...preview.sourceRefs],
    author: preview.author,
    origin: 'teacher',
  }, now);
}
