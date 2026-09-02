# Arena R7A5 — Shared Submitted Proposal Persistence

Status: **IMPLEMENTATION_IN_PROGRESS**

Base: `bed0a6d597ee2985e7e38a8881f14b52310bf239` (R7A4 frozen and merged).

## Objective

Implement the persistence layer required by the frozen R7A4 shared submitted proposal authority boundary without changing P6 canonical adoption authority.

R7A5 must make shared proposal submission, shared lifecycle mutation and shared reads executable through Supabase while preserving every R7A4 invariant exactly.

## Implementation boundary

R7A5 may add:

- authoritative shared proposal/version persistence;
- immutable lifecycle transition receipts;
- workspace-scoped request-id reservations for idempotency;
- transactionally enforced current-head CAS;
- security-definer RPCs anchored to the server-session principal;
- RLS for authenticated read access;
- a Supabase implementation of `SharedSubmittedProposalAuthorityPort`;
- focused persistence/authority tests and Product CI coverage.

R7A5 must not add:

- `CURRICULUM_ADOPT` to any role;
- canonical curriculum materialization or registry mutation;
- P6 adoption RPC/runtime;
- R7A6 decision rebind;
- remote draft/ready-for-review persistence;
- automatic institutional fallback from local state;
- UI or deployment work.

## Required storage invariants

Persistence must implement the R7A4 contract transactionally:

1. `submitted` is the first shared-authoritative lifecycle state; local `draft` / `ready-for-review` remain outside shared persistence.
2. `(workspace_id, proposal_version_ref)` is workspace-unique and one proposal-version identity is immutably bound to one canonical `proposal_ref`.
3. Proposal head advancement uses explicit CAS. `expectedCurrentSharedProposalVersionRef = null` means first shared submission.
4. Replacements are accepted only when the authoritative current head is `changes-requested`; target/base scope is preserved exactly.
5. Canonical payload is validated against the exact R7A3/R7A4 schema, serialized deterministically and fingerprinted by server-side SHA-256; only the server-recomputed 64-char lowercase digest is persisted/returned.
6. Consequential strings are PostgreSQL-representable; U+0000 and malformed UTF-16 input fail closed before authority is created.
7. `proposalRef`, `proposalVersionRef`, `targetNodeRef`, `baseCurriculumVersionRef` are already-trimmed canonical values and reject U+001F.
8. For submission and lifecycle mutation, `clientRequestId` is non-empty, already equal to `trim()`, PostgreSQL-text representable and validated before idempotency lookup/reservation/persistence.
9. Idempotency collision identity is `(workspace_id, client_request_id)`. The authenticated server principal is immutable operation data, not part of the collision key. Exact same-principal retries return the original result/timestamps; conflicting or cross-principal reuse fails closed.
10. Every mutation resolves the principal from the server session, re-reads active workspace membership, verifies exact workspace/context binding and re-checks the transition-specific capability.
11. Submission provenance and lifecycle receipt provenance are server-authored from that fresh membership and transaction clock.
12. Lifecycle mutation is limited to the closed R7A4 transition policy and requires current-head plus expected-state CAS.

## Persistence shape

Use the existing Arena pattern: authenticated clients do not receive direct mutation policies. Institutional writes occur through narrowly scoped `security definer` RPCs that derive actor identity from `auth.uid()` and perform all authority/CAS/idempotency checks inside the transaction.

At minimum R7A5 needs authoritative storage for:

- proposal/version records and current head;
- lifecycle transition receipts;
- workspace request-id reservations including operation kind, immutable server principal and canonical operation material/result binding.

Authenticated shared reads may use RLS and must remain workspace/member scoped.

## Exit gate

R7A5 is complete only when:

- the Supabase repository implements the frozen `SharedSubmittedProposalAuthorityPort` without weakening its types or semantics;
- first submission, replacement, lifecycle mutation, shared read and idempotent retry are executable against the persistence contract;
- stale head/state, revoked membership, wrong capability, cross-workspace context, payload/fingerprint mismatch, non-canonical identity/scope/request id, workspace-wide version collision, cross-principal request-id reuse and conflicting retry all fail closed;
- lifecycle receipts and submission timestamps/provenance are server-authored and stable on exact retries;
- the R7A4 guard suite remains green and R7A5 persistence guards are included in `npm run test:fast` / Product CI;
- P6 remains fail-closed, `PROPOSAL_AUTHORITY_UNAVAILABLE` remains active for canonical adoption, and no role gains `CURRICULUM_ADOPT`;
- exact-head CI passes and Codex review finds no major issue.
