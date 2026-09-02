import { describe, expect, it } from 'vitest';
import {
  SHARED_PROPOSAL_AUTHORITY_BOUNDARY,
  SHARED_PROPOSAL_CLIENT_REQUEST_ID_SCHEMA,
  SHARED_PROPOSAL_IDEMPOTENCY_SCHEMA,
  isValidSharedProposalClientRequestId,
} from '../domain/revision';

describe('R7A4 client request id persistence contract', () => {
  it('freezes canonical persistence-safe validation before idempotency lookup or persistence', () => {
    expect(SHARED_PROPOSAL_CLIENT_REQUEST_ID_SCHEMA).toEqual({
      field: 'clientRequestId',
      participatesInIdempotencyKey: true,
      uniquenessScope: ['workspaceId', 'clientRequestId'],
      requiresTrimmedNonEmptyString: true,
      submittedValueMustEqualTrimmedValue: true,
      requiresPostgresRepresentableString: true,
      rejectsCodePointNull: true,
      rejectsUnpairedUtf16Surrogates: true,
      allowsValidUtf16SurrogatePairs: true,
      appliesTo: ['submission', 'lifecycle-mutation'],
      validationOrder: 'before-idempotency-lookup-or-persistence',
    });

    expect(SHARED_PROPOSAL_IDEMPOTENCY_SCHEMA.clientRequestIdSchema).toBe(
      SHARED_PROPOSAL_CLIENT_REQUEST_ID_SCHEMA,
    );
    expect(SHARED_PROPOSAL_IDEMPOTENCY_SCHEMA.clientRequestIdMustBeCanonical).toBe(true);
    expect(SHARED_PROPOSAL_IDEMPOTENCY_SCHEMA.clientRequestIdMustBePostgresRepresentable).toBe(true);
    expect(SHARED_PROPOSAL_IDEMPOTENCY_SCHEMA.validateClientRequestIdBeforeLookupOrPersistence).toBe(true);

    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.clientRequestIdSchema).toBe(
      SHARED_PROPOSAL_CLIENT_REQUEST_ID_SCHEMA,
    );
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.clientRequestIdRequiresTrimmedNonEmpty).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.clientRequestIdMustEqualTrimmedValue).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.clientRequestIdRequiresPostgresRepresentability).toBe(true);
    expect(
      SHARED_PROPOSAL_AUTHORITY_BOUNDARY.clientRequestIdValidatedBeforeIdempotencyLookupOrPersistence,
    ).toBe(true);
  });

  it.each([
    '',
    ' ',
    '\t',
    '\n',
    ' request-1',
    'request-1 ',
    '\trequest-1',
    'request-1\t',
    '\nrequest-1',
    'request-1\n',
    '\u0000',
    'request\u00001',
    '\ud800',
    '\udc00',
    'request\ud800x',
    'request\udc00x',
  ])('rejects non-canonical or non-persistable clientRequestId %j', (value) => {
    expect(isValidSharedProposalClientRequestId(value)).toBe(false);
  });

  it.each(['request-1', 'request 1', 'request-😀'])(
    'accepts canonical PostgreSQL-representable clientRequestId %j',
    (value) => {
      expect(isValidSharedProposalClientRequestId(value)).toBe(true);
    },
  );
});
