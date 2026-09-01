import { isPostgresRepresentableSharedProposalString } from './sharedSubmittedProposalAuthority';

/**
 * clientRequestId participates in the authoritative workspace-scoped idempotency key.
 * R7A5 must reject values PostgreSQL text cannot preserve exactly before any lookup,
 * reservation, retry comparison or shared mutation is attempted.
 */
export const SHARED_PROPOSAL_CLIENT_REQUEST_ID_SCHEMA = {
  field: 'clientRequestId' as const,
  participatesInIdempotencyKey: true as const,
  uniquenessScope: ['workspaceId', 'clientRequestId'] as const,
  requiresPostgresRepresentableString: true as const,
  rejectsCodePointNull: true as const,
  rejectsUnpairedUtf16Surrogates: true as const,
  allowsValidUtf16SurrogatePairs: true as const,
  appliesTo: ['submission', 'lifecycle-mutation'] as const,
  validationOrder: 'before-idempotency-lookup-or-persistence' as const,
} as const;

export const isValidSharedProposalClientRequestId = (value: string): boolean =>
  value.length > 0 && isPostgresRepresentableSharedProposalString(value);
