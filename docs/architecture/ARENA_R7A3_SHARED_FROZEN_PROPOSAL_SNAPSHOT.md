# Arena R7A3 — Shared Frozen Proposal Snapshot

Status: **IMPLEMENTED_PENDING_FINAL_REVIEW**

## Objective

A decision receipt must not be considered eligible for any future canonical-adoption assessment unless the shared server owns the exact frozen proposal-version payload that was deliberated, can validate its canonical shape, and can recompute its SHA-256 independently of the browser-declared fingerprint.

R7A3 does **not** establish the missing shared proposal authority for P3. The frozen snapshot is immutable institutional evidence of the payload used by the R7A3 decision path; it is not, by itself, an independent authoritative proposal registry.

## Boundary

R7A3 adds `institutional_revision_proposal_snapshots` as an immutable shared snapshot record.

The server snapshot binds:
- workspace;
- proposal reference;
- proposal-version reference;
- exact canonical fingerprint-payload text;
- server-computed SHA-256;
- authenticated freezing actor and timestamp.

Direct authenticated insert/update/delete is forbidden. Creation is only through `freeze_institutional_revision_proposal_snapshot_v1`, which requires active workspace membership in an active workspace and `REVISION_DECIDE` authority.

## Integrity

The freeze RPC:
- parses the payload as JSON;
- requires the complete canonical fingerprint-payload shape;
- rejects missing and extra top-level fields;
- validates `versionNumber`, text fields, `sourceRefs`, `evidenceRefs`, `createdAt`, `structuralFootprint`, optional version/change fields, and `frozen=true`;
- verifies `id` and `proposalRef` against the RPC binding;
- recomputes SHA-256 from the exact UTF-8 payload bytes and compares it with the supplied proposal-version fingerprint;
- makes repeated freezing idempotent only when payload, parsed JSON and fingerprint are identical;
- rejects conflicting writes fail-closed.

Because P3 does not yet expose an independent shared proposal authority, R7A3 does not claim that canonical-shape validation proves semantic equality with a separate authoritative proposal record. P6 therefore remains fail-closed with `PROPOSAL_AUTHORITY_UNAVAILABLE` until that authority exists.

## Versioned decision guard and rollout compatibility

R7A3 deliberately does **not** install a database trigger that blocks every adoption-binding-v2 decision.

The rollout contract is versioned:

- `record_institutional_revision_decision_v2` remains available for already deployed or cached R7A2 clients;
- those compatible R7A2 receipts keep `proposal_snapshot_version = NULL` and must never be interpreted as snapshot-backed;
- `record_institutional_revision_decision_v3` is the R7A3 path;
- v3 requires a matching frozen server snapshot for workspace, proposal, proposal version and proposal-version fingerprint before inserting the decision;
- only v3 writes `proposal_snapshot_version = 1`.

Therefore a newly written v2 receipt can still exist during the compatibility window, but it is explicitly distinguishable from an R7A3 snapshot-backed receipt.

## Adoption assessment

`assessCanonicalAdoption` requires all of the existing binding-v2 checks and additionally requires `proposalSnapshotVersion === 1`.

Consequences:
- historical receipts without binding v2 remain non-adoptable;
- R7A2-compatible v2 receipts without the R7A3 marker produce `PROPOSAL_SNAPSHOT_MISSING`;
- R7A3 snapshot-backed receipts still remain blocked by `PROPOSAL_AUTHORITY_UNAVAILABLE` until P3 gains a genuine shared proposal authority;
- `CURRICULUM_ADOPT` remains unassigned and no receipt can mutate canonical curriculum automatically.

## Validation

Validated on head `c81f3a0f74d0632b457207a78330a45823fd9563` before this documentation-only correction:
- CurManLight Product CI #538 — PASS;
- Beta Identity Authority #210 — PASS;
- Beta Release Contract #406 — PASS;
- Human Interaction Model #118 — PASS;
- S3 Critical Journey Browser Evidence #109 — PASS;
- Beta E2E Workflow #216 — PASS.

This documentation correction changes the PR head and therefore requires the complete gate set to be revalidated before merge.

## Non-goals

No shared proposal authority implementation, no canonical curriculum registry, no `CURRICULUM_ADOPT` assignment, no canonical mutation RPC, no automatic adoption and no deployment are introduced by R7A3.
