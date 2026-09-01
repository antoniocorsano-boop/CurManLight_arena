import { describe, expect, it } from 'vitest';
import {
  SHARED_PROPOSAL_AUTHORITY_BOUNDARY,
  SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA,
  SHARED_PROPOSAL_IDEMPOTENCY_SCHEMA,
  SHARED_PROPOSAL_VERSION_IDENTITY_SCHEMA,
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

  it('freezes workspace-wide proposal-version identity and immutable proposal binding', () => {
    expect(SHARED_PROPOSAL_VERSION_IDENTITY_SCHEMA.uniquenessScope).toEqual([
      'workspaceId',
      'proposalVersionRef',
    ]);
    expect(SHARED_PROPOSAL_VERSION_IDENTITY_SCHEMA.immutableProposalBinding).toEqual([
      'workspaceId',
      'proposalVersionRef',
      'proposalRef',
    ]);
    expect(SHARED_PROPOSAL_VERSION_IDENTITY_SCHEMA.reuseAcrossProposalRefsFailsClosed).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.proposalVersionRefUniqueWithinWorkspace).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.proposalVersionRefImmutablyBindsProposalRef).toBe(true);
  });

  it('binds consequential idempotency to the server-session principal', () => {
    expect(SHARED_PROPOSAL_IDEMPOTENCY_SCHEMA.key).toEqual([
      'serverPrincipalUserId',
      'clientRequestId',
    ]);
    expect(SHARED_PROPOSAL_IDEMPOTENCY_SCHEMA.appliesTo).toEqual([
      'submission',
      'lifecycle-mutation',
    ]);
    expect(SHARED_PROPOSAL_IDEMPOTENCY_SCHEMA.exactRetryRequiresSamePrincipal).toBe(true);
    expect(SHARED_PROPOSAL_IDEMPOTENCY_SCHEMA.crossPrincipalReuseFailsClosed).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.idempotencyBoundToServerPrincipal).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.crossPrincipalClientRequestReuseFailsClosed).toBe(true);
  });
});
