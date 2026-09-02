# Arena R7A6 — Shared Decision Rebind

Status: IMPLEMENTATION_IN_PROGRESS

Canonical base: `21a5282c54df3be215d4c28177eb5a114f532760`

## Objective

Rebind the institutional decision authority to the R7A5 authoritative shared proposal/version persistence. A new institutional decision must no longer create or depend on a second frozen proposal snapshot as its authority source.

## Authoritative precondition

A decision may be recorded only when all of the following are true in the same active workspace:

- the proposal exists in `shared_revision_proposals`;
- `current_proposal_version_ref` equals the requested `proposalVersionRef`;
- the shared version belongs to the same proposal;
- the persisted server-recomputed proposal fingerprint equals the requested fingerprint;
- the shared version lifecycle is exactly `accepted-for-decision`;
- the decision target/base scope is exactly the persisted shared proposal target/base scope;
- the server session principal equals the `WorkspaceActorContext` principal supplied by the repository;
- fresh active membership grants `REVISION_DECIDE` through role `collegio`.

Any mismatch fails closed before institutional success.

## Decision authority marker

New R7A6 decisions are marked `shared_proposal_authority_version = 1`.

Historical R7A2/R7A3 receipts remain readable. `proposal_snapshot_version = 1` identifies the previous R7A3 path and is not sufficient evidence that the decision was rebound to R7A5 shared authority.

## Idempotency and serialization

- `(workspace_id, client_request_id)` remains the collision scope for institutional decisions.
- Exact retries by the same principal with identical authoritative proposal identity, scope, outcome and rationale return the original receipt/timestamp.
- Cross-principal or conflicting reuse fails closed.
- Per-proposal-version decision serialization remains guarded with a transaction-scoped advisory lock.
- A prior final institutional decision remains final.

## Read boundary

R7A6 decision reads used by the shared decision port are principal-bound server RPC reads: server session principal must equal `WorkspaceActorContext.membership.userId`, and fresh active membership is required.

## Explicit non-goals

R7A6 does **not**:

- grant or introduce `CURRICULUM_ADOPT`;
- mutate/materialize the canonical curriculum registry;
- implement P6 adoption execution;
- change the R7A5 proposal lifecycle policy;
- add UI;
- deploy;
- remove historical R7A2/R7A3 records or migrations.

P6 remains fail-closed after R7A6.

## Acceptance gate

R7A6 can close only when exact-head CI and review demonstrate:

1. decision recording cannot succeed from a local/R7A3 snapshot alone;
2. only the current R7A5 shared version in `accepted-for-decision` can be decided;
3. proposal identity, fingerprint and target/base are server-derived/rechecked against R7A5 persistence;
4. principal and fresh membership are enforced server-side for writes and reads;
5. exact retries preserve the original receipt and conflicts fail closed;
6. no `CURRICULUM_ADOPT`, P6 execution, UI or deploy is introduced.
