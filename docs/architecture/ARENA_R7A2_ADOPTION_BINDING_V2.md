# Arena R7A2 — Institutional Adoption Binding v2

Status: **FROZEN_FOR_IMPLEMENTATION**

## Problem

The existing `RevisionProposalVersion` SHA-256 fingerprint binds the frozen textual proposal version, rationale, sources and evidence. `targetNodeRef` and `curriculumVersionRef` live on the parent `RevisionProposal`, so they are not part of that fingerprint.

That is sufficient to prove which proposal version was deliberated, but it is not sufficient to authorize P6 canonical mutation: the adoption layer must also know exactly which canonical node and which base curriculum version the decision may affect.

## Binding v2

Every new institutional decision written through the v2 boundary binds:

`workspaceId + proposalRef + proposalVersionRef + proposalVersionFingerprint + targetNodeRef + baseCurriculumVersionRef`

The canonical material is prefixed with `CML_ARENA_ADOPTION_BINDING_V2`, separated by U+001F, and SHA-256 hashed.

The server computes the fingerprint. The browser never supplies an authoritative `bindingFingerprint`.

## Compatibility

Existing v1 institutional decision receipts remain readable and valid as historical decisions. They have no adoption binding and therefore **cannot be used for canonical adoption**.

No historical row is silently upgraded or backfilled from browser state.

## Server boundary

`record_institutional_revision_decision_v2`:
- requires authentication;
- verifies active workspace membership and active workspace;
- requires the existing Collegio `REVISION_DECIDE` authority;
- validates proposal fingerprint, target and baseline;
- computes binding SHA-256 server-side;
- preserves idempotency by `client_request_id` including all binding fields;
- appends a v2 receipt to the existing institutional decision table.

The original v1 RPC remains available for the currently deployed Beta until the batch release, avoiding a breaking change for the live client.

## P6 readiness

`assessCanonicalAdoption` now fails closed when:
- a receipt has no binding v2;
- the target node differs from the bound target;
- the current canonical baseline differs from the bound base version.

`CURRICULUM_ADOPT` remains unassigned and P6 remains `NOT_IMPLEMENTED`.

## Next slice

R7A3 must give the server an immutable proposal-version snapshot whose content can be re-hashed and matched to `proposalVersionFingerprint`. Only after that may a shared canonical candidate or canonical adoption transaction be implemented without trusting arbitrary browser JSON.
