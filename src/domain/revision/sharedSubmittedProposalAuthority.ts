import type { ArenaCapability } from '../institution/capabilities';
import type {
  WorkspaceActorContext,
  WorkspaceMemberRole,
} from '../institution/sharedWorkspacePort';

export type SharedProposalLifecycleState =
  | 'submitted'
  | 'under-review'
  | 'changes-requested'
  | 'accepted-for-decision'
  | 'rejected'
  | 'withdrawn'
  | 'archived';

export type SharedSubmissionActorRole = 'docente' | 'dipartimento' | 'referente';
export type SharedProposalMutationCapability = Extract<
  ArenaCapability,
  'CURRICULUM_PROPOSE' | 'REVISION_REVIEW'
>;

export type SharedProposalTransitionActorBinding =
  | 'authorized-member'
  | 'original-submitter';

export interface SharedProposalLifecycleTransitionPolicy {
  from: SharedProposalLifecycleState;
  to: SharedProposalLifecycleState;
  requiredCapability: SharedProposalMutationCapability;
  actorBinding: SharedProposalTransitionActorBinding;
  requiresCurrentHead: true;
}

/**
 * Closed institutional lifecycle policy for R7A4.
 *
 * Local `PROPOSAL_STATUS_TRANSITIONS` is intentionally not reused here: local
 * preparation and shared institutional authority have different ownership rules.
 * In particular, `changes-requested -> ready-for-review` is a local preparation
 * step and must be followed by submission of a NEW immutable shared version.
 */
export const SHARED_PROPOSAL_LIFECYCLE_TRANSITION_POLICY = [
  {
    from: 'submitted',
    to: 'under-review',
    requiredCapability: 'REVISION_REVIEW',
    actorBinding: 'authorized-member',
    requiresCurrentHead: true,
  },
  {
    from: 'submitted',
    to: 'withdrawn',
    requiredCapability: 'CURRICULUM_PROPOSE',
    actorBinding: 'original-submitter',
    requiresCurrentHead: true,
  },
  {
    from: 'under-review',
    to: 'changes-requested',
    requiredCapability: 'REVISION_REVIEW',
    actorBinding: 'authorized-member',
    requiresCurrentHead: true,
  },
  {
    from: 'under-review',
    to: 'accepted-for-decision',
    requiredCapability: 'REVISION_REVIEW',
    actorBinding: 'authorized-member',
    requiresCurrentHead: true,
  },
  {
    from: 'under-review',
    to: 'rejected',
    requiredCapability: 'REVISION_REVIEW',
    actorBinding: 'authorized-member',
    requiresCurrentHead: true,
  },
] as const satisfies readonly SharedProposalLifecycleTransitionPolicy[];

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
   * A non-null predecessor may be replaced only when its authoritative lifecycle
   * state is `changes-requested`.
   */
  expectedCurrentSharedProposalVersionRef: string | null;
  clientRequestId: string;
}

interface AdvanceSharedProposalLifecycleCommandBase {
  workspaceId: string;
  proposalRef: string;
  proposalVersionRef: string;
  clientRequestId: string;
}

export type AdvanceSharedProposalLifecycleCommand =
  | (AdvanceSharedProposalLifecycleCommandBase & {
      expectedLifecycleState: 'submitted';
      nextLifecycleState: 'under-review' | 'withdrawn';
    })
  | (AdvanceSharedProposalLifecycleCommandBase & {
      expectedLifecycleState: 'under-review';
      nextLifecycleState: 'changes-requested' | 'accepted-for-decision' | 'rejected';
    });

export interface SharedProposalLifecycleTransitionReceipt {
  schemaVersion: 1;
  workspaceId: string;
  proposalRef: string;
  proposalVersionRef: string;
  fromState: AdvanceSharedProposalLifecycleCommand['expectedLifecycleState'];
  toState: AdvanceSharedProposalLifecycleCommand['nextLifecycleState'];
  capabilityUsed: SharedProposalMutationCapability;
  transitionedByUserId: string;
  transitionedByRole: WorkspaceMemberRole;
  transitionedAt: string;
  clientRequestId: string;
}

export interface SharedProposalLifecycleTransitionResult {
  version: SharedProposalVersion;
  receipt: SharedProposalLifecycleTransitionReceipt;
}

export const getSharedProposalLifecycleTransitionPolicy = (
  from: SharedProposalLifecycleState,
  to: SharedProposalLifecycleState,
): SharedProposalLifecycleTransitionPolicy | null =>
  SHARED_PROPOSAL_LIFECYCLE_TRANSITION_POLICY.find(
    (transition) => transition.from === from && transition.to === to,
  ) ?? null;

export interface SharedSubmittedProposalAuthorityPort {
  /**
   * Every shared operation receives the canonical authenticated workspace context.
   * The context is an identity hint, not sufficient authority evidence by itself:
   * implementations must re-read server-backed membership at call time, require
   * active membership/workspace and fail closed on any mismatch or revocation.
   */

  /**
   * Submission always creates/returns the mandatory first shared-authoritative
   * lifecycle state. Before success the implementation must:
   * - re-read active membership and verify CURRICULUM_PROPOSE;
   * - require context workspace == command workspace;
   * - bind submittedByUserId/submittedByRole to that freshly verified membership;
   * - validate canonical payload identity and recompute its fingerprint server-side;
   * - apply the explicit head CAS;
   * - allow replacement only when the current predecessor is changes-requested;
   * - persist previousSharedProposalVersionRef exactly equal to the expected head;
   * - enforce clientRequestId idempotency and reject conflicting reuse.
   */
  submitVersion(
    context: WorkspaceActorContext,
    command: SubmitSharedProposalVersionCommand,
  ): Promise<SharedSubmittedProposalVersion>;

  /**
   * Lifecycle mutation is restricted to SHARED_PROPOSAL_LIFECYCLE_TRANSITION_POLICY.
   * The implementation must freshly re-read membership, require active workspace,
   * select the capability from the transition policy, verify it server-side and
   * enforce any actor binding (including original-submitter withdrawal). The target
   * version must still be the current shared head and its lifecycle must equal the
   * expected state. Success persists an immutable transition receipt whose actor,
   * role and capability are derived from the freshly verified membership/policy.
   */
  advanceLifecycle(
    context: WorkspaceActorContext,
    command: AdvanceSharedProposalLifecycleCommand,
  ): Promise<SharedProposalLifecycleTransitionResult>;

  /** Shared reads also require a fresh active-membership + CURRICULUM_READ check. */
  getCurrentSharedVersion(
    context: WorkspaceActorContext,
    workspaceId: string,
    proposalRef: string,
  ): Promise<SharedProposalVersion | null>;

  /** Shared reads also require a fresh active-membership + CURRICULUM_READ check. */
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
  requiresFreshMembershipOnEverySharedOperation: true as const,
  requiredReadCapability: 'CURRICULUM_READ' as const,
  requiredSubmissionCapability: 'CURRICULUM_PROPOSE' as const,
  submissionActorRoles: ['docente', 'dipartimento', 'referente'] as const satisfies readonly SharedSubmissionActorRole[],
  bindsSubmissionProvenanceToFreshMembership: true as const,
  submittedVersionsAreImmutable: true as const,
  requiresServerPayloadValidation: true as const,
  requiresServerFingerprintRecompute: true as const,
  requiresCompareAndSwapHead: true as const,
  requiresPredecessorEqualsExpectedHead: true as const,
  replacementRequiresChangesRequestedHead: true as const,
  replacementRequiresNewVersionIdentity: true as const,
  lifecycleMutationRequiresCurrentHead: true as const,
  lifecycleMutationUsesClosedTransitionPolicy: true as const,
  lifecycleMutationPersistsImmutableReceipt: true as const,
  requiresClientRequestIdIdempotency: true as const,
  conflictingClientRequestReuseFailsClosed: true as const,
  firstSubmissionExpectedHead: null as null,
  allowsLocalInstitutionalSuccessFallback: false as const,
  assignsCurriculumAdopt: false as const,
  removesProposalAuthorityBlocker: false as const,
};
