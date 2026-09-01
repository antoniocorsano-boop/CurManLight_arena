# Arena R7A3 — Shared Frozen Proposal Snapshot

Status: **IN_IMPLEMENTATION**

## Objective

A v2 institutional decision must not be sufficient for future canonical adoption unless the shared server owns the exact frozen proposal-version payload that was deliberated and can recompute its SHA-256 independently of the browser-declared fingerprint.

## Boundary

R7A3 adds `institutional_revision_proposal_snapshots` as an immutable shared authority record.

The server snapshot binds:
- workspace;
- proposal reference;
- proposal-version reference;
- exact fingerprint payload text;
- server-computed SHA-256;
- authenticated freezing actor and timestamp.

Direct authenticated insert/update/delete is forbidden. Creation is only through `freeze_institutional_revision_proposal_snapshot_v1`, which requires active workspace membership and `REVISION_DECIDE` authority.

## Integrity

The RPC parses the payload, verifies that it is an object, checks `id`, `proposalRef` and `frozen=true`, recomputes SHA-256 from the exact UTF-8 payload and compares it with the proposal-version fingerprint. Re-freezing the same version is idempotent only when payload and fingerprint are identical; conflicting writes fail closed.

A database trigger blocks every new adoption-binding-v2 decision row unless a matching frozen server snapshot already exists.

## Compatibility

Historical v1 decisions remain readable. R7A2 receipts already written before R7A3 remain historical records, but the release batch must not expose the strengthened v2 decision path until the client first freezes the snapshot.

## Remaining work before R7A3 PASS

1. Client decision boundary must serialize `buildRevisionProposalVersionFingerprintPayload(version)` exactly once and submit that payload to the snapshot RPC before the decision RPC.
2. The shared repository must verify the returned server snapshot fingerprint before recording the decision.
3. Contract tests must prove: server recomputation, immutability, snapshot-required decision insert, idempotency and browser fingerprint mismatch rejection.
4. Product CI, Identity Authority, Beta E2E, Release Contract and HIM must be green on the final head.

## Non-goals

No canonical curriculum registry, no `CURRICULUM_ADOPT` assignment, no canonical mutation RPC, no automatic adoption and no deployment are introduced by R7A3.
