# Arena Canonical Adoption Contract v1

**Stage:** R5 — Contract only  
**Parent process:** `P6_CANONICAL_ADOPTION`  
**Runtime status:** `NOT_IMPLEMENTED`

## Purpose

Close the semantic gap between an institutional decision and a future canonical curriculum version without silently turning a decision receipt into curriculum state.

The canonical sequence is:

`institutional decision receipt → validity check → version/fingerprint binding → current canonical target check → distinct adoption authority → explicit human confirmation → future canonical version + adoption receipt`

R5 freezes the contract and readiness checks only. It does **not** mutate curriculum content, create a canonical version, or persist an adoption receipt.

## Decision is not adoption

`REVISION_DECIDE` and `CURRICULUM_ADOPT` are different capabilities.

A Collegio membership may hold `REVISION_DECIDE`; this does not imply authority to materialize the decision as a new canonical curriculum version. `CURRICULUM_ADOPT` is authenticated-only and is intentionally assigned to no current role in R5.

Therefore P6 remains fail-closed and `NOT_IMPLEMENTED`.

## Adoptive outcomes

Only these institutional outcomes can become adoption candidates:

- `approve`
- `approve-with-changes`

These outcomes are not adoptive:

- `reject`
- `defer`
- `return-for-revision`

They return `NOT_APPLICABLE`, not a partially successful adoption state.

## Required bindings

A future adoption must verify all of the following on the authoritative workspace state:

1. institutional decision receipt exists;
2. decision validity is `VERIFIED_ACTIVE`;
3. receipt workspace matches the adoption workspace;
4. receipt `proposalVersionRef` matches the version being adopted;
5. receipt fingerprint matches the exact proposal version material;
6. the canonical version being superseded is `VERIFIED_CURRENT`;
7. no adoption receipt already exists for the same transition;
8. actor has `CURRICULUM_ADOPT` under `authenticated-workspace` assurance;
9. a final explicit human confirmation occurs before mutation.

Unknown, stale, superseded or revoked state blocks adoption.

## Future adoption receipt

A successful future P6 implementation must emit an immutable receipt containing at least:

- workspace;
- decision receipt reference;
- proposal and proposal-version references;
- proposal-version fingerprint;
- previous canonical version;
- newly adopted canonical version;
- adopting authenticated user and role;
- adoption timestamp;
- optional superseded adoption receipt reference.

The receipt is an audit artifact. It must not be reconstructed from UI history, export history, free text or inference.

## Revocation and supersession

R5 deliberately does not define rollback as deletion. A future implementation must preserve history and represent supersession/revocation through append-only governance records and a new canonical transition. Previous canonical versions remain traceable.

## Non-goals

R5 does not:

- assign `CURRICULUM_ADOPT` to a role;
- add a button to the UI;
- change the canonical curriculum store;
- apply `DecisionEffectRecord` to curriculum content;
- treat `applied-local` effects as institutional adoption;
- infer authority from self-declared roles;
- deploy R3/R4/R5 to Beta.

## Exit gate

R5 passes when:

- `CURRICULUM_ADOPT` exists as a distinct capability;
- no current role can use it;
- P6 work items canonicalize to that capability and remain read-only;
- the readiness assessment fails closed on missing/stale/mismatched state;
- only approve outcomes are adoption candidates;
- the future receipt schema is frozen;
- regression, governance, TypeScript and build gates pass on one SHA;
- no deploy is performed.
