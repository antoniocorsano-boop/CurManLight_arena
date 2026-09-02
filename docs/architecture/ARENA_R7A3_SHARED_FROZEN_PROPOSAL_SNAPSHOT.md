# Arena R7A3 — Shared Frozen Proposal Snapshot

Status: **IMPLEMENTED**

## Objective

A decision receipt must not be considered eligible for any future canonical-adoption assessment unless the shared server owns the exact frozen proposal-version payload that was deliberated, can validate its canonical shape, and can recompute its SHA-256 independently of the browser-declared fingerprint.

R7A3 does **not** establish the missing shared submitted-proposal authority required before P6 can trust a proposal version as institutional input. The frozen snapshot is immutable institutional evidence of the payload used by the R7A3 decision path; it is not, by itself, an independent authoritative proposal registry.

This proposal-authority gap is distinct from the R7 process named **P3 Curriculum analysis**, which remains partial for its own whole-school coverage/gap-analysis reasons.

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
- validates source/evidence references against canonical Arena entity types;
- recomputes SHA-256 from the exact UTF-8 payload bytes and compares it with the supplied proposal-version fingerprint;
- makes repeated freezing idempotent only when payload, parsed JSON and fingerprint are identical;
- rejects conflicting writes fail-closed.

Because no independent shared submitted-proposal authority exists yet, R7A3 does not claim that canonical-shape validation proves semantic equality with a separately authoritative proposal record. P6 therefore remains fail-closed with `PROPOSAL_AUTHORITY_UNAVAILABLE` until that authority exists and the decision path is rebound to it.

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
- R7A3 snapshot-backed receipts remain blocked by `PROPOSAL_AUTHORITY_UNAVAILABLE` until a genuine shared submitted-proposal authority exists and is bound into the decision path;
- `CURRICULUM_ADOPT` remains unassigned and no receipt can mutate canonical curriculum automatically.

## Final validation and review

Final validated branch head before squash merge:

`a9f8de418df00e59c60e8e144e72e8794a7c2a2d`

Required workflows were all PASS:
- CurManLight Product CI #546;
- Beta Identity Authority #218;
- Beta Release Contract #414;
- Human Interaction Model #126;
- S3 Critical Journey Browser Evidence #117;
- Beta E2E Workflow #224.

Codex final review on `a9f8de418d` reported no major issues. PR #164 was squash-merged to `main` as:

`b04bfd0d324f8db6b654e0b95c0307d1cf753901`

## Successor boundary

R7A4 freezes the next authority boundary: local proposal preparation may remain local, but authenticated `submitted` is the first shared-authoritative proposal state. R7A4 remains contract-only; persistence and authoritative decision rebind are separate later slices.

## Non-goals

No shared proposal authority implementation, no canonical curriculum registry, no `CURRICULUM_ADOPT` assignment, no canonical mutation RPC, no automatic adoption and no deployment are introduced by R7A3.
