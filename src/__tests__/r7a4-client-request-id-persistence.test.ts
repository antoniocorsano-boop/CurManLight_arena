import { describe, expect, it } from 'vitest';
import {
  SHARED_PROPOSAL_CLIENT_REQUEST_ID_SCHEMA,
  isValidSharedProposalClientRequestId,
} from '../domain/revision';

describe('R7A4 client request id persistence contract', () => {
  it('freezes PostgreSQL representability before idempotency lookup or persistence', () => {
    expect(SHARED_PROPOSAL_CLIENT_REQUEST_ID_SCHEMA).toEqual({
      field: 'clientRequestId',
      participatesInIdempotencyKey: true,
      uniquenessScope: ['workspaceId', 'clientRequestId'],
      requiresPostgresRepresentableString: true,
      rejectsCodePointNull: true,
      rejectsUnpairedUtf16Surrogates: true,
      allowsValidUtf16SurrogatePairs: true,
      appliesTo: ['submission', 'lifecycle-mutation'],
      validationOrder: 'before-idempotency-lookup-or-persistence',
    });
  });

  it.each(['', '\u0000', 'request\u00001', '\ud800', '\udc00', 'request\ud800x', 'request\udc00x'])(
    'rejects non-persistable clientRequestId %j',
    (value) => {
      expect(isValidSharedProposalClientRequestId(value)).toBe(false);
    },
  );

  it.each(['request-1', 'request 1', 'request-😀'])(
    'accepts PostgreSQL-representable clientRequestId %j',
    (value) => {
      expect(isValidSharedProposalClientRequestId(value)).toBe(true);
    },
  );
});
