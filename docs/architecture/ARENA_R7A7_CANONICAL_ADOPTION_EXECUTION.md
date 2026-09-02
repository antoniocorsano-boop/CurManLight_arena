# Arena R7A7 — Canonical Adoption Execution

Status: **IN PROGRESS**

Base: `b9e8161c8aec8fb28b5fc2f21bab1c51d4b168cf`

## Goal

Turn an R7A6 authority-bound institutional decision into an atomic shared canonical-head transition without allowing a local or historical snapshot path to manufacture canonical authority.

## Authority split

R7A7 preserves the R7A1 rule that candidate materialization and adoption are different governed operations.

The adoption transaction may promote only a server-known canonical candidate whose provenance is already bound to:

- workspace;
- authoritative shared proposal ref and proposal-version ref;
- exact proposal fingerprint;
- exact target node;
- exact base canonical version;
- R7A6 institutional decision receipt.

It must not construct a canonical curriculum from free text, browser state, Dexie state, or the historical R7A3 frozen snapshot.

## Adoption authority

`CURRICULUM_ADOPT` is assigned only to the authenticated `dirigente` role. This role executes the canonical registry mutation after a valid adoptive Collegio decision; it does not gain `REVISION_DECIDE`.

Self-declared roles and observer profiles remain unable to adopt.

## Server registry

The shared registry introduces:

- `shared_canonical_curriculum_versions` — immutable identity/provenance plus lifecycle `PREPARED | ACTIVE | SUPERSEDED`;
- `shared_canonical_curriculum_heads` — exactly one current head per workspace;
- `canonical_adoption_receipts` — immutable adoption evidence;
- workspace-scoped request-id reservation through the adoption receipt uniqueness contract.

Direct authenticated DML is revoked. Reads require fresh active workspace membership.

## Atomic adoption RPC

`adopt_shared_canonical_curriculum_v1` must execute in one transaction and fail closed unless all conditions hold:

1. `auth.uid()` exists and equals the expected `WorkspaceActorContext` user;
2. workspace and membership are active;
3. fresh role is exactly `dirigente` and owns `CURRICULUM_ADOPT`;
4. the decision is R7A6 authority-bound (`shared_proposal_authority_version = 1`);
5. outcome is `approve` or `approve-with-changes`;
6. decision workspace/proposal/version/fingerprint and adoption binding match the command;
7. the decision is the final decision for that proposal version and has not already been adopted;
8. the candidate is `PREPARED` and carries the same decision/proposal/version/fingerprint/target/base provenance;
9. the current canonical head equals `expectedCurrentCanonicalVersionRef` (CAS);
10. the candidate ref differs from the current head;
11. the previous version is superseded, candidate becomes active, head moves, and one immutable receipt is persisted atomically.

An exact retry with the same workspace/request id and identical operation returns the same receipt/head. Conflicting reuse fails closed.

## Initial-head rule

R7A7 does not silently invent the first shared canonical baseline from local persistence. A workspace without a server-authoritative current head cannot adopt through this RPC. Baseline bootstrap/materialization is a separate explicit authority step.

## Non-goals

- no UI;
- no deploy;
- no local fallback;
- no browser/Dexie canonical mutation as authority;
- no candidate creation from free text inside adoption;
- no implicit bootstrap of a shared canonical baseline;
- no claim that P6 is fully end-to-end until candidate materialization/bootstrap has an authoritative implementation.

## Gate

R7A7 adoption execution may be marked **EXECUTABLE_FOR_PREPARED_CANDIDATES** only when server persistence, repository binding, CAS/idempotency tests and exact-head CI pass. Full P6 remains blocked until authoritative candidate materialization/bootstrap exists.
