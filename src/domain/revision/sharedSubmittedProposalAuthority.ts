import type { WorkspaceActorContext } from '../institution/sharedWorkspacePort';

export type SharedProposalLifecycleState =
  | 'submitted'
  | 'under-review'
  | 'changes-requested'
  | 'accepted-for-decision'
  | 'rejected'
  | 'withdrawn'
  | 'archived';

export type SharedSubmissionActorRole = 'docente' | 'dipartimento' | 'referente';

export interface SharedProposalVersion {
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
  /**
   * Required immutable predecessor binding.
   * null means this is the first shared version for the proposal.
   * For a successful replacement submission this must equal the command's
   * expectedCurrentSharedProposalVersionRef.
   */
  previousSharedProposalVersionRef: string | null;
}

export interface SharedSubmittedProposalVersion extends SharedProposalVersion {
  lifecycleState: 'submitted';
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
   * A successful result must persist the same value as previousSharedProposalVersionRef.
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
  /**
   * Submission always creates/returns the mandatory first shared-authoritative
   * lifecycle state. Later lifecycle states require advanceLifecycle().
   * Implementations must persist previousSharedProposalVersionRef exactly equal
   * to command.expectedCurrentSharedProposalVersionRef after the CAS succeeds.
   * The authenticated context is mandatory; implementations must re-check
   * active server-backed membership and CURRICULUM_PROPOSE before success.
   */
  submitVersion(
    context: WorkspaceActorContext,
    command: SubmitSharedProposalVersionCommand,
  ): Promise<SharedSubmittedProposalVersion>;

  /** Shared lifecycle mutations require the same authenticated authority context. */
  advanceLifecycle(
    context: WorkspaceActorContext,
    command: AdvanceSharedProposalLifecycleCommand,
  ): Promise<SharedProposalVersion>;

  /** Shared reads remain scoped to an authenticated workspace actor. */
  getCurrentSharedVersion(
    context: WorkspaceActorContext,
    workspaceId: string,
    proposalRef: string,
  ): Promise<SharedProposalVersion | null>;

  getSharedVersion(
    context: WorkspaceActorContext,
    workspaceId: string,
    proposalVersionRef: string,
  ): Promise<SharedProposalVersion | null>;
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
  requiresServerBackedMembershipCapabilityRecheck: true as const,
  requiredCapability: 'CURRICULUM_PROPOSE' as const,
  submissionActorRoles: ['docente', 'dipartimento', 'referente'] as const satisfies readonly SharedSubmissionActorRole[],
  submittedVersionsAreImmutable: true as const,
  requiresCompareAndSwapHead: true as const,
  requiresPredecessorEqualsExpectedHead: true as const,
  firstSubmissionExpectedHead: null as null,
  allowsLocalInstitutionalSuccessFallback: false as const,
  assignsCurriculumAdopt: false as const,
  removesProposalAuthorityBlocker: false as const,
};
