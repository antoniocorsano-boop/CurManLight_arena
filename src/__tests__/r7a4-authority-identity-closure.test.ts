import { describe, expect, it } from 'vitest';
import {
  SHARED_PROPOSAL_AUTHORITY_BOUNDARY,
  SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA,
  SHARED_PROPOSAL_IDEMPOTENCY_SCHEMA,
  SHARED_PROPOSAL_VERSION_IDENTITY_SCHEMA,
  isCanonicalSharedProposalIdentityRef,
} from '../domain/revision';

describe('R7A4 authority identity closure', () => {
  it('matches R7A3 trimmed canonical payload requirements', () => {
    expect(SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA.fieldTypes.id).toBe(
      'trimmed-non-empty-string',
    );
    expect(SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA.fieldTypes.proposalRef).toBe(
      'trimmed-non-empty-string',
    );
    expect(SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA.fieldTypes.proposedText).toBe(
      'trimmed-non-empty-string',
    );
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.canonicalPayloadTrimRulesMatchR7A3).toBe(true);
  });

  it('requires proposal identities to already be canonical trimmed values', () => {
    expect(SHARED_PROPOSAL_VERSION_IDENTITY_SCHEMA.canonicalIdentityFields).toEqual([
      'proposalRef',
      'proposalVersionRef',
    ]);
    expect(SHARED_PROPOSAL_VERSION_IDENTITY_SCHEMA.commandIdentityMustEqualTrimmedValue).toBe(true);
    expect(
      SHARED_PROPOSAL_VERSION_IDENTITY_SCHEMA.canonicalPayloadIdentityMustMatchCanonicalCommand,
    ).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.proposalIdentityReferencesMustEqualTrimmedValue).toBe(
      true,
    );

    for (const value of ['', ' ', ' proposal-1', 'proposal-1 ', '\tproposal-1', 'proposal-1\n']) {
      expect(isCanonicalSharedProposalIdentityRef(value)).toBe(false);
    }
    for (const value of ['proposal-1', 'version-1']) {
      expect(isCanonicalSharedProposalIdentityRef(value)).toBe(true);
    }
  });

  it('freezes workspace-wide canonical proposal-version identity and immutable proposal binding', () => {
    expect(SHARED_PROPOSAL_VERSION_IDENTITY_SCHEMA.uniquenessScope).toEqual([
      'workspaceId',
      'proposalVersionRef',
    ]);
    expect(SHARED_PROPOSAL_VERSION_IDENTITY_SCHEMA.uniquenessUsesCanonicalProposalVersionRef).toBe(
      true,
    );
    expect(SHARED_PROPOSAL_VERSION_IDENTITY_SCHEMA.immutableProposalBinding).toEqual([
      'workspaceId',
      'proposalVersionRef',
      'proposalRef',
    ]);
    expect(SHARED_PROPOSAL_VERSION_IDENTITY_SCHEMA.reuseAcrossProposalRefsFailsClosed).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.proposalVersionRefUniqueWithinWorkspace).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.proposalVersionUniquenessUsesCanonicalIdentity).toBe(
      true,
    );
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.proposalVersionRefImmutablyBindsProposalRef).toBe(true);
  });

  it('reserves request ids independently of principal and binds principal as operation data', () => {
    expect(SHARED_PROPOSAL_IDEMPOTENCY_SCHEMA.key).toEqual(['workspaceId', 'clientRequestId']);
    expect(SHARED_PROPOSAL_IDEMPOTENCY_SCHEMA.collisionScope).toBe('workspace');
    expect(SHARED_PROPOSAL_IDEMPOTENCY_SCHEMA.principalBindingField).toBe(
      'serverPrincipalUserId',
    );
    expect(SHARED_PROPOSAL_IDEMPOTENCY_SCHEMA.requestIdReservedIndependentOfPrincipal).toBe(true);
    expect(SHARED_PROPOSAL_IDEMPOTENCY_SCHEMA.appliesTo).toEqual([
      'submission',
      'lifecycle-mutation',
    ]);
    expect(SHARED_PROPOSAL_IDEMPOTENCY_SCHEMA.exactRetryRequiresSamePrincipal).toBe(true);
    expect(SHARED_PROPOSAL_IDEMPOTENCY_SCHEMA.crossPrincipalReuseFailsClosed).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.idempotencyRequestIdReservedWithinWorkspace).toBe(
      true,
    );
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.idempotencyPrincipalIsBoundOperationData).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.idempotencyBoundToServerPrincipal).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.crossPrincipalClientRequestReuseFailsClosed).toBe(true);
  });
});
