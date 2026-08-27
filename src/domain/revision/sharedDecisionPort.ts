import type { WorkspaceActorContext } from '../institution/sharedWorkspacePort';
import type { DecisionOutcome } from './types';

export type InstitutionalDecisionOutcome = Exclude<DecisionOutcome, 'record-only'>;

export interface InstitutionalRevisionDecisionInput {
  workspaceId: string;
  proposalRef: string;
  proposalVersionRef: string;
  proposalVersionFingerprint: string;
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
  outcome: InstitutionalDecisionOutcome;
  rationale: string;
  decidedByUserId: string;
  authorityRole: 'collegio';
  decidedAt: string;
  clientRequestId: string;
}

/**
 * Consequential institutional decisions are deliberately separate from the
 * historical local DecisionAuthority model. Implementations must verify an
 * authenticated workspace capability and must never fall back to a
 * self-declared role or to local-only persistence.
 */
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
