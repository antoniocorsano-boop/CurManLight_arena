# Arena R7A1 — Shared Canonical Adoption Port v1

Status: **IMPLEMENTED_BOUNDARY**

## Problem

Institutional decisions are already server-backed and membership-authenticated, while the existing curriculum persistence backend is local Dexie/IndexedDB. A local database transaction is useful for personal persistence but cannot be the authority that turns an institutional decision into the canonical curriculum of a workspace.

Therefore P6 must not be implemented by updating `instituteCurriculumVersions` locally and later calling that state “adopted”.

## Authority boundary

Canonical adoption requires a server-backed `SharedCanonicalAdoptionRepository`.

The authoritative operation must atomically:

1. verify active workspace membership;
2. verify `CURRICULUM_ADOPT` capability;
3. re-read the institutional decision receipt;
4. re-check proposal version and fingerprint;
5. compare the expected current canonical head;
6. activate the prepared candidate canonical version;
7. supersede the previous canonical version;
8. persist one immutable `CanonicalAdoptionReceipt`;
9. return the new canonical head and receipt.

No local/self-declared fallback is allowed.

## Compare-and-swap rule

The adoption command carries `expectedCurrentCanonicalVersionRef`. If the authoritative current head has moved, the command must fail instead of overwriting a newer adoption.

This protects against stale browser sessions and concurrent institutional actions.

## Candidate version rule

The port promotes a `candidateCanonicalVersionRef`; it does not construct curriculum content from free text inside the adoption transaction. Candidate materialization is a separate governed step and must preserve exact proposal/version provenance.

## Local persistence

Dexie/localStorage may cache a successfully adopted canonical state for offline consultation. They may not:

- create an institutional adoption receipt;
- decide which version is canonical for a shared workspace;
- infer adoption from local revision effects;
- silently recover a failed shared mutation as a local success.

## Current blocker

No infrastructure implementation of `SharedCanonicalAdoptionRepository` exists yet and no current role owns `CURRICULUM_ADOPT`.

R7A1 therefore closes the authority boundary, **not P6 runtime**.

## Historical roadmap note

The original R7A1 plan named “Shared Canonical Registry + transactional adoption persistence” as the immediate next slice. Subsequent R7A2/R7A3 review correctly exposed prerequisite authority gaps that must be closed first:

- R7A2 bound decision receipts to proposal version, target node and base curriculum version;
- R7A3 added the immutable server-owned deliberation snapshot and kept P6 fail-closed;
- R7A4 freezes the missing local-to-shared submitted-proposal authority boundary.

Therefore the original immediate-next-slice sequence is superseded. Canonical registry/adoption persistence remains required, but only after shared proposal persistence and authoritative decision rebind make the institutional proposal version independently verifiable server-side.

The R7A1 adoption authority rules themselves remain valid and unchanged.
