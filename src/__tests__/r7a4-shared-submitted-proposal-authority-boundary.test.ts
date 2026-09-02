import { describe, expect, it } from 'vitest';
import { generateDeterministicId } from '../domain/curriculum/identity';
import { canUseCapability, getRoleCapabilities } from '../domain/institution/capabilities';
import type { WorkspaceActorContext } from '../domain/institution/sharedWorkspacePort';
import {
  SHARED_PROPOSAL_AUTHORITY_BOUNDARY,
  SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA,
  SHARED_PROPOSAL_LIFECYCLE_TRANSITION_POLICY,
  buildRevisionProposalVersionFingerprintPayload,
  getSharedProposalLifecycleTransitionPolicy,
  type RevisionProposalVersion,
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

const context: WorkspaceActorContext = {
  membership: {
    workspaceId: 'workspace-1',
    userId: 'user-1',
    role: 'docente',
    status: 'active',
  },
  assurance: 'authenticated-workspace',
};

const proposalVersionId = generateDeterministicId('r7a4-proposal-version-1');
const proposalId = generateDeterministicId('r7a4-proposal-1');
const sourceId = generateDeterministicId('r7a4-source-1');
const evidenceNodeId = generateDeterministicId('r7a4-evidence-node-1');

const localVersion: RevisionProposalVersion = {
  id: proposalVersionId,
  proposalRef: proposalId,
  versionNumber: 1,
  currentTextSnapshot: 'Current curriculum text',
  proposedText: 'Proposed curriculum text',
  rationale: 'Rationale',
  sourceRefs: [{ id: sourceId, entityType: 'source', snapshotLabel: 'Source 1' }],
  evidenceRefs: [{ id: evidenceNodeId, entityType: 'curriculum-node' }],
  createdAt: '2026-09-01T12:00:00.000Z',
  structuralFootprint: '',
  frozen: true,
};

const canonicalPayload = JSON.stringify(
  buildRevisionProposalVersionFingerprintPayload(localVersion),
);

const submittedFixture = (
  previousSharedProposalVersionRef: string | null = null,
): SharedSubmittedProposalVersion => ({
  schemaVersion: 1,
  workspaceId: context.membership.workspaceId,
  proposalRef: String(proposalId),
  proposalVersionRef: String(proposalVersionId),
  proposalVersionFingerprint: 'a'.repeat(64),
  canonicalPayload,
  targetNodeRef: 'node-1',
  baseCurriculumVersionRef: 'curriculum-v1',
  submittedByUserId: context.membership.userId,
  submittedByRole: 'docente',
  submittedAt: '2026-09-01T12:01:00.000Z',
  submittedAtSource: 'server-transaction-clock',
  submittedPrincipalSource: 'server-session',
  lifecycleState: 'submitted',
  previousSharedProposalVersionRef,
});

const commandFixture = (
  expectedCurrentSharedProposalVersionRef: string | null,
): SubmitSharedProposalVersionCommand => ({
  workspaceId: context.membership.workspaceId,
  proposalRef: String(proposalId),
  proposalVersionRef: String(proposalVersionId),
  proposalVersionFingerprint: 'a'.repeat(64),
  canonicalPayload,
  targetNodeRef: 'node-1',
  baseCurriculumVersionRef: 'curriculum-v1',
  expectedCurrentSharedProposalVersionRef,
  clientRequestId: 'client-request-submit-1',
});

describe('R7A4 shared submitted proposal authority boundary', () => {
  it('keeps submitted as the first shared state and binds operations to an authenticated workspace', () => {
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.localPreparationStates).toEqual([
      'draft',
      'ready-for-review',
    ]);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.firstSharedState).toBe('submitted');
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresAuthenticatedWorkspace).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresServerSessionPrincipalBinding).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.serverPrincipalMustMatchContextUser).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresFreshMembershipOnEverySharedOperation).toBe(true);
  });

  it('keeps submission authority limited to CURRICULUM_PROPOSE roles', () => {
    const proposalCapableRoles = roles.filter((role) =>
      getRoleCapabilities(role).includes('CURRICULUM_PROPOSE'),
    );
    expect(proposalCapableRoles).toEqual(['docente', 'dipartimento', 'referente']);
    expect([...SHARED_PROPOSAL_AUTHORITY_BOUNDARY.submissionActorRoles]).toEqual(proposalCapableRoles);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiredSubmissionCapability).toBe('CURRICULUM_PROPOSE');
  });

  it('freezes the canonical payload schema, serialization and digest contract', () => {
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
    expect(SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA.optionalKeys).toEqual(['previousVersionRef', 'changeNote']);
    expect(SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA.rejectsExtraTopLevelKeys).toBe(true);
    expect(SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA.rejectsExtraReferenceKeys).toBe(true);
    expect(SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA.serialization).toBe(
      'JSON.stringify(buildRevisionProposalVersionFingerprintPayload(version))',
    );
    expect(SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA.byteEncoding).toBe('UTF-8');
    expect(SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA.digest).toBe('SHA-256');
  });

  it('requires explicit head CAS and predecessor binding for replacements', () => {
    const first = commandFixture(null);
    const replacement = commandFixture('proposal-version-0');
    expect(first.expectedCurrentSharedProposalVersionRef).toBeNull();
    expect(submittedFixture(null).previousSharedProposalVersionRef).toBeNull();
    expect(replacement.expectedCurrentSharedProposalVersionRef).toBe('proposal-version-0');
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresCompareAndSwapHead).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresPredecessorEqualsExpectedHead).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.replacementRequiresChangesRequestedHead).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.replacementRequiresNewVersionIdentity).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.scopeChangeRequiresNewProposalIdentity).toBe(true);
  });

  it('keeps the shared lifecycle policy closed and capability-derived', () => {
    expect(SHARED_PROPOSAL_LIFECYCLE_TRANSITION_POLICY).toEqual([
      expect.objectContaining({ from: 'submitted', to: 'under-review', requiredCapability: 'REVISION_REVIEW' }),
      expect.objectContaining({ from: 'submitted', to: 'withdrawn', requiredCapability: 'CURRICULUM_PROPOSE', actorBinding: 'original-submitter' }),
      expect.objectContaining({ from: 'under-review', to: 'changes-requested', requiredCapability: 'REVISION_REVIEW' }),
      expect.objectContaining({ from: 'under-review', to: 'accepted-for-decision', requiredCapability: 'REVISION_REVIEW' }),
      expect.objectContaining({ from: 'under-review', to: 'rejected', requiredCapability: 'REVISION_REVIEW' }),
    ]);
    expect(getSharedProposalLifecycleTransitionPolicy('changes-requested', 'submitted')).toBeNull();
    expect(getSharedProposalLifecycleTransitionPolicy('accepted-for-decision', 'archived')).toBeNull();
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.lifecycleMutationRequiresCurrentHead).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.lifecycleMutationPersistsImmutableReceipt).toBe(true);
  });

  it('keeps submitted versions immutable, server-timestamped and idempotent', () => {
    const submitted = submittedFixture();
    expect(submitted.submittedAtSource).toBe('server-transaction-clock');
    expect(submitted.submittedPrincipalSource).toBe('server-session');
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.submittedVersionsAreImmutable).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresServerFingerprintRecompute).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresClientRequestIdIdempotency).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.conflictingClientRequestReuseFailsClosed).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.allowsLocalInstitutionalSuccessFallback).toBe(false);
  });

  it('preserves the historical R7A4 non-adoption boundary without freezing future slices', () => {
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.assignsCurriculumAdopt).toBe(false);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.removesProposalAuthorityBlocker).toBe(false);

    expect(getRoleCapabilities('dirigente')).not.toContain('CURRICULUM_ADOPT');
    expect(canUseCapability('dirigente', 'CURRICULUM_ADOPT', 'authenticated-workspace')).toBe(true);
    expect(canUseCapability('dirigente', 'CURRICULUM_ADOPT', 'self-declared')).toBe(false);
    for (const role of roles.filter((role) => role !== 'dirigente')) {
      expect(canUseCapability(role, 'CURRICULUM_ADOPT', 'authenticated-workspace')).toBe(false);
    }
  });
});
