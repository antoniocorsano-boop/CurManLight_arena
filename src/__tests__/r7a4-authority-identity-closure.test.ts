import { describe, expect, it } from 'vitest';
import {
  SHARED_PROPOSAL_ADOPTION_BINDING_DELIMITER,
  SHARED_PROPOSAL_AUTHORITY_BOUNDARY,
  SHARED_PROPOSAL_CANONICAL_PAYLOAD_SCHEMA,
  SHARED_PROPOSAL_FINGERPRINT_SCHEMA,
  SHARED_PROPOSAL_IDEMPOTENCY_SCHEMA,
  SHARED_PROPOSAL_VERSION_IDENTITY_SCHEMA,
  isCanonicalSharedProposalIdentityRef,
  isCanonicalSharedProposalVersionFingerprint,
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

  it('freezes the proposal fingerprint as the server-recomputed lowercase SHA-256 digest', () => {
    expect(SHARED_PROPOSAL_FINGERPRINT_SCHEMA).toEqual({
      algorithm: 'SHA-256',
      representation: '64-lowercase-hex-characters',
      pattern: '^[0-9a-f]{64}$',
      length: 64,
      submittedValueMustBeCanonical: true,
      submittedValueMustEqualServerRecomputedDigest: true,
      persistedValueIsServerRecomputedDigest: true,
      returnedValueIsServerRecomputedDigest: true,
      caseInsensitiveComparisonAllowed: false,
    });
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.fingerprintSchema).toBe(
      SHARED_PROPOSAL_FINGERPRINT_SCHEMA,
    );
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresServerFingerprintRecompute).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresCanonicalLowercaseFingerprint).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.rejectsNonCanonicalFingerprintInput).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.requiresFingerprintExactMatchToServerRecompute).toBe(
      true,
    );
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.persistsServerRecomputedFingerprint).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.returnsServerRecomputedFingerprint).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.allowsCaseInsensitiveFingerprintComparison).toBe(
      false,
    );

    const canonical = '0123456789abcdef'.repeat(4);
    expect(isCanonicalSharedProposalVersionFingerprint(canonical)).toBe(true);

    for (const value of [
      '',
      canonical.toUpperCase(),
      `${canonical.slice(0, 63)}A`,
      canonical.slice(0, 63),
      `${canonical}0`,
      ` ${canonical}`,
      `${canonical} `,
      'g'.repeat(64),
    ]) {
      expect(isCanonicalSharedProposalVersionFingerprint(value)).toBe(false);
    }
  });

  it('requires proposal identities to be canonical and delimiter-safe before shared authority', () => {
    expect(SHARED_PROPOSAL_VERSION_IDENTITY_SCHEMA.canonicalIdentityFields).toEqual([
      'proposalRef',
      'proposalVersionRef',
    ]);
    expect(SHARED_PROPOSAL_VERSION_IDENTITY_SCHEMA.commandIdentityMustEqualTrimmedValue).toBe(true);
    expect(SHARED_PROPOSAL_VERSION_IDENTITY_SCHEMA.rejectsAdoptionBindingDelimiter).toBe(true);
    expect(SHARED_PROPOSAL_VERSION_IDENTITY_SCHEMA.forbiddenCharacters).toEqual([
      SHARED_PROPOSAL_ADOPTION_BINDING_DELIMITER,
    ]);
    expect(
      SHARED_PROPOSAL_VERSION_IDENTITY_SCHEMA.canonicalPayloadIdentityMustMatchCanonicalCommand,
    ).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.proposalIdentityReferencesMustEqualTrimmedValue).toBe(
      true,
    );
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.proposalIdentityReferencesRejectAdoptionDelimiter).toBe(
      true,
    );

    for (const value of [
      '',
      ' ',
      ' proposal-1',
      'proposal-1 ',
      '\tproposal-1',
      'proposal-1\n',
      `proposal${SHARED_PROPOSAL_ADOPTION_BINDING_DELIMITER}1`,
      `version${SHARED_PROPOSAL_ADOPTION_BINDING_DELIMITER}1`,
    ]) {
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
