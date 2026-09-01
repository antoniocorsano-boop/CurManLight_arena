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
export type SharedReviewActorRole = 'dipartimento' | 'referente' | 'dirigente';
export type SharedProposalMutationCapability = Extract<
  ArenaCapability,
  'CURRICULUM_PROPOSE' | 'REVISION_REVIEW'
>;

export type SharedProposalRoleForCapability<
  C extends SharedProposalMutationCapability,
> = C extends 'CURRICULUM_PROPOSE'
  ? SharedSubmissionActorRole
  : C extends 'REVISION_REVIEW'
    ? SharedReviewActorRole
    : never;

export type SharedProposalTransitionActorBinding =
  | 'authorized-member'
  | 'original-submitter';

export type SharedProposalLifecycleTransitionDefinition =
  | {
      from: 'submitted';
      to: 'under-review';
      requiredCapability: 'REVISION_REVIEW';
      actorBinding: 'authorized-member';
      requiresCurrentHead: true;
    }
  | {
      from: 'submitted';
      to: 'withdrawn';
      requiredCapability: 'CURRICULUM_PROPOSE';
      actorBinding: 'original-submitter';
      requiresCurrentHead: true;
    }
  | {
      from: 'under-review';
      to: 'changes-requested';
      requiredCapability: 'REVISION_REVIEW';
      actorBinding: 'authorized-member';
      requiresCurrentHead: true;
    }
  | {
      from: 'under-review';
      to: 'accepted-for-decision';
      requiredCapability: 'REVISION_REVIEW';
      actorBinding: 'authorized-member';
      requiresCurrentHead: true;
    }
  | {
      from: 'under-review';
      to: 'rejected';
      requiredCapability: 'REVISION_REVIEW';
      actorBinding: 'authorized-member';
      requiresCurrentHead: true;
    };

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
] as const satisfies readonly SharedProposalLifecycleTransitionDefinition[];

/**
 * Exact R7A3/R7A4 canonical proposal-version payload contract.
 * Serialization MUST be the UTF-8 bytes of
 * JSON.stringify(buildRevisionProposalVersionFingerprintPayload(version)).
 * Implementations reject missing required keys, unknown top-level/reference keys,
 * wrong types, invalid reference entity types, non-object payloads and any payload
 * whose server recomputed SHA-256 differs from proposalVersionFingerprint.
 */
export const SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA = {
  orderedKeys: [
    'id',
    'proposalRef',
    'versionNumber',
    'currentTextSnapshot',
    'proposedText',
    'rationale',
    'sourceRefs',
    'evidenceRefs',
    'createdAt',
    'structuralFootprint',
    'previousVersionRef',
    'changeNote',
    'frozen',
  ] as const,
  requiredKeys: [
    'id',
    'proposalRef',
    'versionNumber',
    'currentTextSnapshot',
    'proposedText',
    'rationale',
    'sourceRefs',
    'evidenceRefs',
    'createdAt',
    'structuralFootprint',
    'frozen',
  ] as const,
  optionalKeys: ['previousVersionRef', 'changeNote'] as const,
  fieldTypes: {
    id: 'non-empty-string',
    proposalRef: 'non-empty-string',
    versionNumber: 'positive-integer',
    currentTextSnapshot: 'string',
    proposedText: 'non-empty-string',
    rationale: 'string',
    sourceRefs: 'reference-array',
    evidenceRefs: 'reference-array',
    createdAt: 'parseable-timestamptz-string',
    structuralFootprint: 'string',
    previousVersionRef: 'optional-non-empty-string',
    changeNote: 'optional-non-empty-string',
    frozen: 'literal-true',
  } as const,
  referenceRequiredKeys: ['id', 'entityType'] as const,
  referenceOptionalKeys: ['snapshotLabel'] as const,
  referenceFieldTypes: {
    id: 'non-empty-string',
    entityType: 'canonical-entity-type',
    snapshotLabel: 'optional-non-empty-string',
  } as const,
  allowedReferenceEntityTypes: [
    'institute',
    'source',
    'curriculum-version',
    'curriculum-segment',
    'curriculum-node',
    'curriculum-link',
    'revision-proposal',
    'decision',
    'teaching-design',
    'document',
    'document-version',
    'template',
    'class-context',
    'assessment',
    'actor',
    'event',
  ] as const,
  rejectsExtraTopLevelKeys: true as const,
  rejectsExtraReferenceKeys: true as const,
  serialization: 'JSON.stringify(buildRevisionProposalVersionFingerprintPayload(version))' as const,
  byteEncoding: 'UTF-8' as const,
  digest: 'SHA-256' as const,
};

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
  /** Generated from the authoritative server transaction clock, never client time. */
  submittedAt: string;
  submittedAtSource: 'server-transaction-clock';
  submittedPrincipalSource: 'server-session';
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
   * state is `changes-requested`. For the same proposalRef, targetNodeRef and
   * baseCurriculumVersionRef MUST equal the authoritative predecessor. Any scope
   * change requires a new proposal identity rather than a replacement version.
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

export type SharedProposalLifecycleCommandFor<
  T extends SharedProposalLifecycleTransitionDefinition,
> = T extends SharedProposalLifecycleTransitionDefinition
  ? AdvanceSharedProposalLifecycleCommandBase & {
      expectedLifecycleState: T['from'];
      nextLifecycleState: T['to'];
    }
  : never;

export type AdvanceSharedProposalLifecycleCommand = SharedProposalLifecycleCommandFor<
  SharedProposalLifecycleTransitionDefinition
>;

export type SharedProposalLifecycleTransitionReceiptFor<
  T extends SharedProposalLifecycleTransitionDefinition,
> = T extends SharedProposalLifecycleTransitionDefinition
  ? {
      schemaVersion: 1;
      workspaceId: string;
      proposalRef: string;
      proposalVersionRef: string;
      fromState: T['from'];
      toState: T['to'];
      capabilityUsed: T['requiredCapability'];
      transitionedByUserId: string;
      transitionedByRole: SharedProposalRoleForCapability<T['requiredCapability']>;
      /** Generated from the same successful server mutation transaction. */
      transitionedAt: string;
      transitionedAtSource: 'server-transaction-clock';
      transitionedPrincipalSource: 'server-session';
      clientRequestId: string;
    }
  : never;

export type SharedProposalLifecycleTransitionReceipt =
  SharedProposalLifecycleTransitionReceiptFor<SharedProposalLifecycleTransitionDefinition>;

export type SharedProposalLifecycleTransitionResultFor<
  T extends SharedProposalLifecycleTransitionDefinition,
> = T extends SharedProposalLifecycleTransitionDefinition
  ? {
      version: SharedProposalVersion & { lifecycleState: T['to'] };
      receipt: SharedProposalLifecycleTransitionReceiptFor<T>;
    }
  : never;

export type SharedProposalLifecycleTransitionResult =
  SharedProposalLifecycleTransitionResultFor<SharedProposalLifecycleTransitionDefinition>;

export const getSharedProposalLifecycleTransitionPolicy = (
  from: SharedProposalLifecycleState,
  to: SharedProposalLifecycleState,
): SharedProposalLifecycleTransitionDefinition | null =>
  SHARED_PROPOSAL_LIFECYCLE_TRANSITION_POLICY.find(
    (transition) => transition.from === from && transition.to === to,
  ) ?? null;

export interface SharedSubmittedProposalAuthorityPort {
  /**
   * Every shared operation receives the canonical authenticated workspace context.
   * The context is an identity hint, not sufficient authority evidence by itself.
   * Before using it, server code MUST resolve the authenticated principal from the
   * server session (for Supabase, auth.uid()), re-read membership using that principal,
   * and fail unless principal userId == context.membership.userId and membership
   * workspaceId == the requested workspace. Caller-supplied user IDs cannot select
   * which membership is authoritative.
   */

  /**
   * Submission always creates/returns the mandatory first shared-authoritative
   * lifecycle state. Before success the implementation must:
   * - resolve the principal from the server session and bind it to context user/workspace;
   * - re-read active membership for that principal and verify CURRICULUM_PROPOSE;
   * - bind submittedByUserId/submittedByRole to that freshly verified membership;
   * - validate canonicalPayload against SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA;
   * - require payload id/proposalRef to match command version/proposal identity;
   * - recompute SHA-256 over the exact UTF-8 JSON.stringify(builder-output) bytes;
   * - apply the explicit head CAS;
   * - allow replacement only when the current predecessor is changes-requested;
   * - preserve the authoritative predecessor targetNodeRef/baseCurriculumVersionRef
   *   for the same proposalRef; a scope change requires a new proposal identity;
   * - persist previousSharedProposalVersionRef exactly equal to the expected head;
   * - generate submittedAt from the server transaction clock;
   * - enforce clientRequestId idempotency and reject conflicting reuse;
   * - return the original submittedAt unchanged on an idempotent retry.
   */
  submitVersion(
    context: WorkspaceActorContext,
    command: SubmitSharedProposalVersionCommand,
  ): Promise<SharedSubmittedProposalVersion>;

  /**
   * Lifecycle mutation is restricted to SHARED_PROPOSAL_LIFECYCLE_TRANSITION_POLICY.
   * The implementation must resolve the current server-session principal, freshly
   * re-read its membership, require active workspace, select the exact transition
   * tuple, verify that tuple's capability server-side and enforce actor binding.
   * The target version must still be the current shared head and its lifecycle must
   * equal the expected state. Success persists a receipt whose identifiers, request
   * ID, from/to states, capability, role and returned version state are all derived
   * from the same command + selected policy tuple. transitionedAt comes from the server
   * transaction clock and is returned unchanged on idempotent retries.
   */
  advanceLifecycle<T extends SharedProposalLifecycleTransitionDefinition>(
    context: WorkspaceActorContext,
    command: SharedProposalLifecycleCommandFor<T>,
  ): Promise<SharedProposalLifecycleTransitionResultFor<T>>;

  /** Shared reads require server-session principal binding plus fresh active-membership + CURRICULUM_READ. */
  getCurrentSharedVersion(
    context: WorkspaceActorContext,
    workspaceId: string,
    proposalRef: string,
  ): Promise<SharedProposalVersion | null>;

  /** Shared reads require server-session principal binding plus fresh active-membership + CURRICULUM_READ. */
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
  requiresServerSessionPrincipalBinding: true as const,
  serverPrincipalMustMatchContextUser: true as const,
  serverMembershipWorkspaceMustMatchCommandWorkspace: true as const,
  requiresFreshMembershipOnEverySharedOperation: true as const,
  requiredReadCapability: 'CURRICULUM_READ' as const,
  requiredSubmissionCapability: 'CURRICULUM_PROPOSE' as const,
  submissionActorRoles: ['docente', 'dipartimento', 'referente'] as const satisfies readonly SharedSubmissionActorRole[],
  reviewActorRoles: ['dipartimento', 'referente', 'dirigente'] as const satisfies readonly SharedReviewActorRole[],
  bindsSubmissionProvenanceToFreshMembership: true as const,
  submittedVersionsAreImmutable: true as const,
  canonicalPayloadSchema: SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA,
  requiresServerPayloadValidation: true as const,
  requiresServerFingerprintRecompute: true as const,
  requiresExactCanonicalPayloadSerialization: true as const,
  requiresCompareAndSwapHead: true as const,
  requiresPredecessorEqualsExpectedHead: true as const,
  replacementRequiresChangesRequestedHead: true as const,
  replacementRequiresNewVersionIdentity: true as const,
  replacementPreservesTargetNodeRef: true as const,
  replacementPreservesBaseCurriculumVersionRef: true as const,
  scopeChangeRequiresNewProposalIdentity: true as const,
  lifecycleMutationRequiresCurrentHead: true as const,
  lifecycleMutationUsesClosedTransitionPolicy: true as const,
  lifecycleReceiptDerivedFromTransitionPolicy: true as const,
  lifecycleReceiptRoleDerivedFromTransitionCapability: true as const,
  lifecycleMutationPersistsImmutableReceipt: true as const,
  requiresServerTransactionClockForAuditTimestamps: true as const,
  idempotentRetriesReturnOriginalAuditTimestamps: true as const,
  requiresClientRequestIdIdempotency: true as const,
  conflictingClientRequestReuseFailsClosed: true as const,
  firstSubmissionExpectedHead: null as null,
  allowsLocalInstitutionalSuccessFallback: false as const,
  assignsCurriculumAdopt: false as const,
  removesProposalAuthorityBlocker: false as const,
};
