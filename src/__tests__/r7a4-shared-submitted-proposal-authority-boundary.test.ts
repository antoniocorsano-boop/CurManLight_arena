import { describe, expect, it } from 'vitest';
import { getRoleCapabilities } from '../domain/institution/capabilities';
import { assessCanonicalAdoption } from '../domain/institution/canonicalAdoptionContract';
import type { WorkspaceActorContext } from '../domain/institution/sharedWorkspacePort';
import {
  SHARED_PROPOSAL_AUTHORITY_BOUNDARY,
  SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA,
  SHARED_PROPOSAL_LIFECYCLE_TRANSITION_POLICY,
  buildRevisionProposalVersionFingerprintPayload,
  getSharedProposalLifecycleTransitionPolicy,
  type AdvanceSharedProposalLifecycleCommand,
  type RevisionProposalVersion,
  type SharedProposalLifecycleTransitionReceipt,
  type SharedProposalVersion,
  type SharedSubmittedProposalVersion,
  type SubmitSharedProposalVersionCommand,
} from '../domain/revision';
import type { InstitutionalRole } from '../domain/curriculum/types';

const roles: InstitutionalRole[] = [
  'non-dichiarato',
  'docente',
  'dipartimento',
  'referente',
  'collegio',
  'dirigente',
  'amministratore',
];

const authenticatedDocente: WorkspaceActorContext = {
  membership: {
    workspaceId: 'workspace-1',
    userId: 'user-1',
    role: 'docente',
    status: 'active',
  },
  assurance: 'authenticated-workspace',
};

const canonicalLocalVersion: RevisionProposalVersion = {
  id: 'proposal-version-1',
  proposalRef: 'proposal-1',
  versionNumber: 1,
  currentTextSnapshot: 'Current curriculum text',
  proposedText: 'Proposed curriculum text',
  rationale: 'Rationale',
  sourceRefs: [{ id: 'source-1', entityType: 'source', snapshotLabel: 'Source 1' }],
  evidenceRefs: [{ id: 'evidence-node-1', entityType: 'curriculum-node' }],
  createdAt: '2026-09-01T12:00:00.000Z',
  structuralFootprint: '{}',
  frozen: true,
};

const canonicalPayload = JSON.stringify(
  buildRevisionProposalVersionFingerprintPayload(canonicalLocalVersion),
);

const sharedSubmittedVersionFixture = (
  previousSharedProposalVersionRef: string | null = null,
): SharedSubmittedProposalVersion => ({
  schemaVersion: 1,
  workspaceId: 'workspace-1',
  proposalRef: 'proposal-1',
  proposalVersionRef: 'proposal-version-1',
  proposalVersionFingerprint: 'a'.repeat(64),
  canonicalPayload,
  targetNodeRef: 'node-1',
  baseCurriculumVersionRef: 'curriculum-v1',
  submittedByUserId: authenticatedDocente.membership.userId,
  submittedByRole: 'docente',
  submittedAt: '2026-09-01T12:01:00.000Z',
  submittedAtSource: 'server-transaction-clock',
  submittedPrincipalSource: 'server-session',
  lifecycleState: 'submitted',
  previousSharedProposalVersionRef,
});

const submitCommandFixture = (
  expectedCurrentSharedProposalVersionRef: string | null,
): SubmitSharedProposalVersionCommand => ({
  workspaceId: authenticatedDocente.membership.workspaceId,
  proposalRef: 'proposal-1',
  proposalVersionRef: 'proposal-version-1',
  proposalVersionFingerprint: 'a'.repeat(64),
  canonicalPayload,
  targetNodeRef: 'node-1',
  baseCurriculumVersionRef: 'curriculum-v1',
  expectedCurrentSharedProposalVersionRef,
  clientRequestId: 'client-request-submit-1',
});

describe('R7A4 shared submitted proposal authority boundary', () => {
  it('keeps draft preparation local and makes submitted the first shared state', () => {
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.localPreparationStates).toEqual([
      'draft',
      'ready-for-review',
    ]);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.firstSharedState).toBe('submitted');
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresAuthenticatedWorkspace).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiredSubmissionCapability).toBe('CURRICULUM_PROPOSE');
  });

  it('requires the server-session principal to bind fresh membership and workspace', () => {
    expect(authenticatedDocente.assurance).toBe('authenticated-workspace');
    expect(authenticatedDocente.membership.status).toBe('active');
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresServerSessionPrincipalBinding).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.serverPrincipalMustMatchContextUser).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.serverMembershipWorkspaceMustMatchCommandWorkspace).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresFreshMembershipOnEverySharedOperation).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiredReadCapability).toBe('CURRICULUM_READ');
    expect(authenticatedDocente.membership.workspaceId).toBe(submitCommandFixture(null).workspaceId);
  });

  it('keeps shared submission provenance aligned with CURRICULUM_PROPOSE capability holders', () => {
    const proposalCapableRoles = roles.filter((role) =>
      getRoleCapabilities(role).includes('CURRICULUM_PROPOSE'),
    );

    const submitted = sharedSubmittedVersionFixture();
    expect(proposalCapableRoles).toEqual(['docente', 'dipartimento', 'referente']);
    expect([...SHARED_PROPOSAL_AUTHORITY_BOUNDARY.submissionActorRoles]).toEqual(proposalCapableRoles);
    expect(submitted.submittedByUserId).toBe(authenticatedDocente.membership.userId);
    expect(submitted.submittedByRole).toBe(authenticatedDocente.membership.role);
    expect(submitted.submittedPrincipalSource).toBe('server-session');
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.bindsSubmissionProvenanceToFreshMembership).toBe(true);
  });

  it('freezes the exact canonical payload schema and serialization used by the fingerprint builder', () => {
    const parsed = JSON.parse(canonicalPayload) as Record<string, unknown>;
    expect(Object.keys(parsed)).toEqual([
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
    ]);
    expect(SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA.requiredKeys).toEqual(Object.keys(parsed));
    expect(SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA.optionalKeys).toEqual([
      'previousVersionRef',
      'changeNote',
    ]);
    expect(SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA.referenceRequiredKeys).toEqual(['id', 'entityType']);
    expect(SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA.referenceOptionalKeys).toEqual(['snapshotLabel']);
    expect(SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA.rejectsExtraTopLevelKeys).toBe(true);
    expect(SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA.rejectsExtraReferenceKeys).toBe(true);
    expect(SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA.serialization).toBe(
      'JSON.stringify(buildRevisionProposalVersionFingerprintPayload(version))',
    );
    expect(SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA.byteEncoding).toBe('UTF-8');
    expect(SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA.digest).toBe('SHA-256');
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresExactCanonicalPayloadSerialization).toBe(true);
  });

  it('requires explicit CAS intent, predecessor binding and controlled replacement', () => {
    const firstSubmission = submitCommandFixture(null);
    const firstResult = sharedSubmittedVersionFixture(null);
    const replacement = submitCommandFixture('proposal-version-0');
    const replacementResult = sharedSubmittedVersionFixture('proposal-version-0');

    expect(firstSubmission.expectedCurrentSharedProposalVersionRef).toBeNull();
    expect(firstResult.previousSharedProposalVersionRef).toBeNull();
    expect(replacement.expectedCurrentSharedProposalVersionRef).toBe('proposal-version-0');
    expect(replacementResult.previousSharedProposalVersionRef).toBe(
      replacement.expectedCurrentSharedProposalVersionRef,
    );
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresCompareAndSwapHead).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresPredecessorEqualsExpectedHead).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.replacementRequiresChangesRequestedHead).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.replacementRequiresNewVersionIdentity).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.firstSubmissionExpectedHead).toBeNull();
  });

  it('freezes a closed least-privilege shared lifecycle transition policy', () => {
    expect(SHARED_PROPOSAL_LIFECYCLE_TRANSITION_POLICY).toEqual([
      expect.objectContaining({ from: 'submitted', to: 'under-review', requiredCapability: 'REVISION_REVIEW' }),
      expect.objectContaining({ from: 'submitted', to: 'withdrawn', requiredCapability: 'CURRICULUM_PROPOSE', actorBinding: 'original-submitter' }),
      expect.objectContaining({ from: 'under-review', to: 'changes-requested', requiredCapability: 'REVISION_REVIEW' }),
      expect.objectContaining({ from: 'under-review', to: 'accepted-for-decision', requiredCapability: 'REVISION_REVIEW' }),
      expect.objectContaining({ from: 'under-review', to: 'rejected', requiredCapability: 'REVISION_REVIEW' }),
    ]);

    for (const transition of SHARED_PROPOSAL_LIFECYCLE_TRANSITION_POLICY) {
      expect(transition.requiresCurrentHead).toBe(true);
      const capableRoles = roles.filter((role) =>
        getRoleCapabilities(role).includes(transition.requiredCapability),
      );
      expect(capableRoles.length).toBeGreaterThan(0);
    }

    expect(getSharedProposalLifecycleTransitionPolicy('changes-requested', 'submitted')).toBeNull();
    expect(getSharedProposalLifecycleTransitionPolicy('accepted-for-decision', 'archived')).toBeNull();
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.lifecycleMutationUsesClosedTransitionPolicy).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.lifecycleMutationRequiresCurrentHead).toBe(true);
  });

  it('keeps changes-requested content repair local and requires a new shared submission', () => {
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.localPreparationStates).toContain('ready-for-review');
    expect(getSharedProposalLifecycleTransitionPolicy('changes-requested', 'under-review')).toBeNull();
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.replacementRequiresChangesRequestedHead).toBe(true);
  });

  it('derives lifecycle receipt capability and states from the selected transition tuple', () => {
    const command: AdvanceSharedProposalLifecycleCommand = {
      workspaceId: 'workspace-1',
      proposalRef: 'proposal-1',
      proposalVersionRef: 'proposal-version-1',
      expectedLifecycleState: 'submitted',
      nextLifecycleState: 'under-review',
      clientRequestId: 'client-transition-1',
    };
    const policy = getSharedProposalLifecycleTransitionPolicy(
      command.expectedLifecycleState,
      command.nextLifecycleState,
    );
    expect(policy?.requiredCapability).toBe('REVISION_REVIEW');

    const receipt: SharedProposalLifecycleTransitionReceipt = {
      schemaVersion: 1,
      workspaceId: command.workspaceId,
      proposalRef: command.proposalRef,
      proposalVersionRef: command.proposalVersionRef,
      fromState: 'submitted',
      toState: 'under-review',
      capabilityUsed: 'REVISION_REVIEW',
      transitionedByUserId: 'reviewer-1',
      transitionedByRole: 'dipartimento',
      transitionedAt: '2026-09-01T12:10:00.000Z',
      transitionedAtSource: 'server-transaction-clock',
      transitionedPrincipalSource: 'server-session',
      clientRequestId: command.clientRequestId,
    };

    expect(receipt.fromState).toBe(command.expectedLifecycleState);
    expect(receipt.toState).toBe(command.nextLifecycleState);
    expect(receipt.capabilityUsed).toBe(policy?.requiredCapability);
    expect(receipt.clientRequestId).toBe(command.clientRequestId);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.lifecycleReceiptDerivedFromTransitionPolicy).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.lifecycleMutationPersistsImmutableReceipt).toBe(true);
  });

  it('requires server-authored audit timestamps and stable idempotent retries', () => {
    const submitted = sharedSubmittedVersionFixture();
    expect(submitted.submittedAtSource).toBe('server-transaction-clock');
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresServerTransactionClockForAuditTimestamps).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.idempotentRetriesReturnOriginalAuditTimestamps).toBe(true);
  });

  it('requires server validation, fingerprint recomputation and idempotent mutations', () => {
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresServerPayloadValidation).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresServerFingerprintRecompute).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresClientRequestIdIdempotency).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.conflictingClientRequestReuseFailsClosed).toBe(true);
  });

  it('makes submit results structurally incapable of skipping the submitted state', () => {
    const submitted = sharedSubmittedVersionFixture();
    const laterState: SharedProposalVersion = {
      ...submitted,
      lifecycleState: 'under-review',
    };

    expect(submitted.lifecycleState).toBe('submitted');
    expect(laterState.lifecycleState).toBe('under-review');
  });

  it('requires immutable submitted versions and no local institutional fallback', () => {
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.submittedVersionsAreImmutable).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.allowsLocalInstitutionalSuccessFallback).toBe(false);
  });

  it('does not assign CURRICULUM_ADOPT to any current role', () => {
    for (const role of roles) {
      expect(getRoleCapabilities(role)).not.toContain('CURRICULUM_ADOPT');
    }
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.assignsCurriculumAdopt).toBe(false);
  });

  it('does not remove the proposal-authority blocker before runtime authority exists', () => {
    const assessment = assessCanonicalAdoption({
      workspaceId: 'workspace-1',
      proposalVersionRef: 'proposal-version-1',
      proposalVersionFingerprint: 'a'.repeat(64),
      targetNodeRef: 'node-1',
      targetCanonicalVersionRef: 'curriculum-v1',
      targetCanonicalState: 'VERIFIED_CURRENT',
      decisionValidity: 'VERIFIED_ACTIVE',
      actor: {
        role: 'collegio',
        assurance: 'authenticated-workspace',
        userId: 'user-collegio',
      },
      decisionReceipt: {
        id: 'decision-1',
        workspaceId: 'workspace-1',
        proposalRef: 'proposal-1',
        proposalVersionRef: 'proposal-version-1',
        proposalVersionFingerprint: 'a'.repeat(64),
        outcome: 'approve',
        rationale: 'approved',
        decidedByUserId: 'user-collegio',
        authorityRole: 'collegio',
        decidedAt: '2026-09-01T12:00:00.000Z',
        clientRequestId: 'client-request-1',
        adoptionBinding: {
          version: 2,
          bindingFingerprint: 'b'.repeat(64),
          targetNodeRef: 'node-1',
          baseCurriculumVersionRef: 'curriculum-v1',
          proposalSnapshotVersion: 1,
        },
      },
    });

    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.removesProposalAuthorityBlocker).toBe(false);
    expect(assessment.blockerCodes).toContain('PROPOSAL_AUTHORITY_UNAVAILABLE');
    expect(assessment.blockerCodes).toContain('ADOPTION_CAPABILITY_UNAVAILABLE');
    expect(assessment.readiness).toBe('BLOCKED');
  });
});
