import type { WorkspaceActorContext } from '../institution/sharedWorkspacePort';
import type { DecisionOutcome } from './types';
import type { InstitutionalAdoptionBindingV2 } from './adoptionBinding';

export type InstitutionalDecisionOutcome = Exclude<DecisionOutcome, 'record-only'>;

export interface InstitutionalRevisionDecisionInput {
  workspaceId: string;
  proposalRef: string;
  proposalVersionRef: string;
  proposalVersionFingerprint: string;
  /** Historical R7A3 compatibility input. R7A6 shared authority does not freeze or trust this payload. */
  proposalVersionSnapshotPayload?: string;
  targetNodeRef: string;
  baseCurriculumVersionRef: string;
  outcome: InstitutionalDecisionOutcome;
  rationale: string;
  clientRequestId: string;
}

export interface InstitutionalRevisionDecisionReceipt {
  id: string;
  workspaceId: string;
  proposalRef: string;
  proposalVersionRef: string;
  proposalVersionFingerprint: string;
  /** Present only for decisions recorded against the R7A5 shared authoritative proposal boundary. */
  sharedProposalAuthorityVersion?: 1;
  adoptionBinding?: InstitutionalAdoptionBindingV2;
  outcome: InstitutionalDecisionOutcome;
  rationale: string;
  decidedByUserId: string;
  authorityRole: 'collegio';
  decidedAt: string;
  clientRequestId: string;
}

export interface SharedRevisionDecisionRepository {
  findInstitutionalDecisionForVersion(
    context: WorkspaceActorContext,
    proposalVersionRef: string
  ): Promise<InstitutionalRevisionDecisionReceipt | null>;

  recordInstitutionalDecision(
    context: WorkspaceActorContext,
    input: InstitutionalRevisionDecisionInput
  ): Promise<InstitutionalRevisionDecisionReceipt>;
}
