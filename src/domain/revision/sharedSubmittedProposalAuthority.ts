import type { ArenaCapability } from '../institution/capabilities';
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

/** Exact R7A3/R7A4 canonical proposal-version payload contract. */
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
    id: 'trimmed-non-empty-string',
    proposalRef: 'trimmed-non-empty-string',
    versionNumber: 'positive-integer',
    currentTextSnapshot: 'string',
    proposedText: 'trimmed-non-empty-string',
    rationale: 'string',
    sourceRefs: 'reference-array',
    evidenceRefs: 'reference-array',
    createdAt: 'parseable-timestamptz-string',
    structuralFootprint: 'string',
    previousVersionRef: 'optional-trimmed-non-empty-string',
    changeNote: 'optional-trimmed-non-empty-string',
    frozen: 'literal-true',
  } as const,
  referenceRequiredKeys: ['id', 'entityType'] as const,
  referenceOptionalKeys: ['snapshotLabel'] as const,
  referenceFieldTypes: {
    id: 'trimmed-non-empty-string',
    entityType: 'canonical-entity-type',
    snapshotLabel: 'optional-trimmed-non-empty-string',
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

/** U+001F is the R7A3 adoption-binding field delimiter and is never valid inside a bound reference. */
export const SHARED_PROPOSAL_ADOPTION_BINDING_DELIMITER = '\u001f' as const;

const excludesSharedProposalBindingDelimiter = (value: string): boolean =>
  !value.includes(SHARED_PROPOSAL_ADOPTION_BINDING_DELIMITER);

/**
 * Consequential proposal identities are canonical values, not merely values that
 * become valid after trimming. R7A5 must reject padded command identities and the
 * R7A3 adoption-binding delimiter before payload matching or uniqueness checks.
 */
export const SHARED_PROPOSAL_VERSION_IDENTITY_SCHEMA = {
  canonicalIdentityFields: ['proposalRef', 'proposalVersionRef'] as const,
  commandIdentityMustEqualTrimmedValue: true as const,
  rejectsAdoptionBindingDelimiter: true as const,
  forbiddenCharacters: [SHARED_PROPOSAL_ADOPTION_BINDING_DELIMITER] as const,
  canonicalPayloadIdentityMustMatchCanonicalCommand: true as const,
  uniquenessScope: ['workspaceId', 'proposalVersionRef'] as const,
  uniquenessUsesCanonicalProposalVersionRef: true as const,
  immutableProposalBinding: ['workspaceId', 'proposalVersionRef', 'proposalRef'] as const,
  reuseAcrossProposalRefsFailsClosed: true as const,
} as const;

export const isCanonicalSharedProposalIdentityRef = (value: string): boolean => {
  const trimmed = value.trim();
  return (
    trimmed.length > 0 &&
    value === trimmed &&
    excludesSharedProposalBindingDelimiter(value)
  );
};

export const SHARED_PROPOSAL_SCOPE_BINDING_SCHEMA = {
  targetNodeRef: 'canonical-trimmed-non-empty-string-without-adoption-binding-delimiter',
  baseCurriculumVersionRef: 'canonical-trimmed-non-empty-string-without-adoption-binding-delimiter',
  submittedValueMustEqualTrimmedValue: true as const,
  rejectsAdoptionBindingDelimiter: true as const,
  forbiddenCharacters: [SHARED_PROPOSAL_ADOPTION_BINDING_DELIMITER] as const,
} as const;

export const isValidSharedProposalScopeRef = (value: string): boolean => {
  const trimmed = value.trim();
  return (
    trimmed.length > 0 &&
    value === trimmed &&
    excludesSharedProposalBindingDelimiter(value)
  );
};

/**
 * A clientRequestId is reserved independently of the actor within a workspace.
 * The authoritative server principal is immutable bound operation data, not part
 * of the collision key. Cross-principal reuse therefore collides and fails closed.
 */
export const SHARED_PROPOSAL_IDEMPOTENCY_SCHEMA = {
  key: ['workspaceId', 'clientRequestId'] as const,
  collisionScope: 'workspace' as const,
  principalBindingField: 'serverPrincipalUserId' as const,
  requestIdReservedIndependentOfPrincipal: true as const,
  appliesTo: ['submission', 'lifecycle-mutation'] as const,
  exactRetryRequiresSamePrincipal: true as const,
  crossPrincipalReuseFailsClosed: true as const,
  conflictingOperationReuseFailsClosed: true as const,
} as const;

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
  submittedAtSource: 'server-transaction-clock';
  submittedPrincipalSource: 'server-session';
  lifecycleState: SharedProposalLifecycleState;
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
   * Before every shared operation, server code resolves the authenticated principal
   * from the server session, re-reads active membership for that principal and binds
   * principal, context and requested workspace. Caller-supplied user IDs are not authority.
   */
  submitVersion(
    context: WorkspaceActorContext,
    command: SubmitSharedProposalVersionCommand,
  ): Promise<SharedSubmittedProposalVersion>;

  advanceLifecycle<T extends SharedProposalLifecycleTransitionDefinition>(
    context: WorkspaceActorContext,
    command: SharedProposalLifecycleCommandFor<T>,
  ): Promise<SharedProposalLifecycleTransitionResultFor<T>>;

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
  canonicalPayloadTrimRulesMatchR7A3: true as const,
  structuralFootprintPreservesR7A3StringContract: true as const,
  adoptionBindingDelimiter: SHARED_PROPOSAL_ADOPTION_BINDING_DELIMITER,
  bindingReferencesRejectAdoptionDelimiter: true as const,
  versionIdentitySchema: SHARED_PROPOSAL_VERSION_IDENTITY_SCHEMA,
  proposalIdentityReferencesMustEqualTrimmedValue: true as const,
  proposalIdentityReferencesRejectAdoptionDelimiter: true as const,
  proposalVersionRefUniqueWithinWorkspace: true as const,
  proposalVersionUniquenessUsesCanonicalIdentity: true as const,
  proposalVersionRefImmutablyBindsProposalRef: true as const,
  scopeBindingSchema: SHARED_PROPOSAL_SCOPE_BINDING_SCHEMA,
  scopeReferencesRequireTrimmedNonEmpty: true as const,
  scopeReferencesMustEqualTrimmedValue: true as const,
  scopeReferencesRejectAdoptionDelimiter: true as const,
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
  idempotencySchema: SHARED_PROPOSAL_IDEMPOTENCY_SCHEMA,
  requiresClientRequestIdIdempotency: true as const,
  idempotencyRequestIdReservedWithinWorkspace: true as const,
  idempotencyPrincipalIsBoundOperationData: true as const,
  idempotencyBoundToServerPrincipal: true as const,
  crossPrincipalClientRequestReuseFailsClosed: true as const,
  conflictingClientRequestReuseFailsClosed: true as const,
  firstSubmissionExpectedHead: null as null,
  allowsLocalInstitutionalSuccessFallback: false as const,
  assignsCurriculumAdopt: false as const,
  removesProposalAuthorityBlocker: false as const,
};
