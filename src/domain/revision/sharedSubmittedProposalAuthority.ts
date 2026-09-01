import type { InstitutionalRole } from '../curriculum/types';

export type SharedProposalLifecycleState =
  | 'submitted'
  | 'under-review'
  | 'changes-requested'
  | 'accepted-for-decision'
  | 'rejected'
  | 'withdrawn'
  | 'archived';

export type SharedSubmissionActorRole = Exclude<InstitutionalRole, 'non-dichiarato'>;

export interface SharedSubmittedProposalVersion {
  schemaVersion: 1;
  workspaceId: string;
  proposalRef: string;
  proposalVersionRef: string;
  proposalVersionFingerprint: string;
  canonicalPayload: string;
  targetNodeRef: string;
  baseCurriculumVersionRef: string;
  submittedByUserId: string;
  submittedByRole: SharedSubmissionActorRole;
  submittedAt: string;
  lifecycleState: SharedProposalLifecycleState;
  previousSharedProposalVersionRef?: string;
}

export interface SubmitSharedProposalVersionCommand {
  workspaceId: string;
  proposalRef: string;
  proposalVersionRef: string;
  proposalVersionFingerprint: string;
  canonicalPayload: string;
  targetNodeRef: string;
  baseCurriculumVersionRef: string;
  /**
   * Mandatory compare-and-swap precondition.
   * null means the caller explicitly expects this to be the first shared version.
   */
  expectedCurrentSharedProposalVersionRef: string | null;
  clientRequestId: string;
}

export interface AdvanceSharedProposalLifecycleCommand {
  workspaceId: string;
  proposalRef: string;
  proposalVersionRef: string;
  expectedLifecycleState: SharedProposalLifecycleState;
  nextLifecycleState: SharedProposalLifecycleState;
  clientRequestId: string;
}

export interface SharedSubmittedProposalAuthorityPort {
  submitVersion(command: SubmitSharedProposalVersionCommand): Promise<SharedSubmittedProposalVersion>;
  advanceLifecycle(command: AdvanceSharedProposalLifecycleCommand): Promise<SharedSubmittedProposalVersion>;
  getCurrentSharedVersion(workspaceId: string, proposalRef: string): Promise<SharedSubmittedProposalVersion | null>;
  getSharedVersion(workspaceId: string, proposalVersionRef: string): Promise<SharedSubmittedProposalVersion | null>;
}

/**
 * R7A4 freezes the authority contract only.
 *
 * No infrastructure implementation is provided in this slice. Local draft and
 * ready-for-review preparation remain local; successful authenticated submission
 * is the first point at which the shared server becomes authoritative for proposal
 * identity, immutable content, fingerprint and institutional lifecycle.
 */
export const SHARED_PROPOSAL_AUTHORITY_BOUNDARY = {
  localPreparationStates: ['draft', 'ready-for-review'] as const,
  firstSharedState: 'submitted' as const,
  requiresAuthenticatedWorkspace: true as const,
  requiredCapability: 'CURRICULUM_PROPOSE' as const,
  submittedVersionsAreImmutable: true as const,
  requiresCompareAndSwapHead: true as const,
  firstSubmissionExpectedHead: null as null,
  allowsLocalInstitutionalSuccessFallback: false as const,
  assignsCurriculumAdopt: false as const,
  removesProposalAuthorityBlocker: false as const,
};
