# Arena R7A4 — Shared Submitted Proposal Authority Boundary

Status: **FROZEN_FOR_REVIEW**

## Objective

R7A4 freezes the authority boundary between local proposal preparation and institutional proposal authority.

The goal is not to make every draft remote. The goal is to ensure that, once a proposal enters an institutional workflow, the shared server independently owns the exact submitted proposal version that later review, frozen deliberation evidence and institutional decision refer to.

R7A4 is a contract-only slice. It introduces no database migration, no RPC, no UI, no `CURRICULUM_ADOPT` assignment and no canonical curriculum mutation.

## Problem

Today `RevisionProposal`, `RevisionProposalVersion` and proposal lifecycle transitions are produced in the local `revisionArchive` and persisted through Zustand/IndexedDB. R7A3 can validate and immutably freeze the complete proposal-version payload used by a decision, but the server first learns that proposal content at freeze time.

Therefore R7A3 proves:

- exact payload shape;
- server-side SHA-256 recomputation;
- immutability of the frozen deliberation snapshot;
- authenticated institutional decision binding.

It does not yet prove that the frozen payload equals a proposal version already owned independently by a shared proposal authority.

This is why canonical adoption remains fail-closed with `PROPOSAL_AUTHORITY_UNAVAILABLE`.

## Distinction from R7 P3

The R7 process named **P3 Curriculum analysis** remains a separate concern. P3 is partial because whole-school deterministic coverage/gap analysis is incomplete.

The shared proposal authority defined here is not a redefinition or closure of P3. It is a missing authority precondition in the revision/decision/adoption chain that must be satisfied before P6 can trust a proposal version as institutional input.

## Authority transition

The canonical transition is:

`local preparation -> authenticated submission -> shared institutional proposal`

Local preparation may include:

- `draft`;
- `ready-for-review`;
- local validation;
- editing and creation of frozen local `RevisionProposalVersion` values.

The first shared-authority state is:

- `submitted`.

Once a proposal version is successfully submitted, the shared authority owns that submitted version and its institutional lifecycle. A local copy may remain as cache/read model, but local persistence may not silently replace, rewrite or supersede the shared authoritative record.

## Shared authoritative identity

A shared submitted version must bind at least:

- `workspaceId`;
- `proposalRef`;
- `proposalVersionRef`;
- exact canonical proposal fingerprint payload;
- server-recomputed SHA-256 fingerprint;
- `targetNodeRef`;
- `baseCurriculumVersionRef`;
- `submittedByUserId`;
- authenticated submitter role;
- `submittedAt`;
- institutional lifecycle state;
- previous shared version reference when applicable.

The shared version is immutable. Mutable proposal progress is represented by authoritative state transitions and, when content changes, by a new immutable submitted version.

## Submission authority

Preparing a proposal and submitting it institutionally are distinct acts.

R7A4 does not create a new capability by default. The minimum submission rule is:

- actor has `CURRICULUM_PROPOSE`;
- actor assurance is `authenticated-workspace`;
- workspace membership is active;
- workspace itself is active.

A future policy may introduce a separate `REVISION_SUBMIT` capability if governance requires preparation and formal deposit to be owned by different roles. That decision is deliberately deferred.

Self-declared/local authority is sufficient for preparation but never sufficient for shared institutional submission.

## Shared lifecycle ownership

After successful submission, lifecycle states that carry institutional meaning must be shared-authoritative rather than produced only by the local `transitionProposalStatus()` path.

The intended ownership boundary is:

### Local-only or pre-authoritative

- `draft`;
- `ready-for-review`.

### Shared-authoritative

- `submitted`;
- `under-review`;
- `changes-requested`;
- `accepted-for-decision`;
- `rejected`;
- `withdrawn` when withdrawal concerns an already submitted proposal;
- `archived` when archival concerns shared institutional history.

The exact transition permissions are deferred to the implementation slice and must be derived from least privilege rather than copied blindly from the current local state machine.

## Version immutability and change requests

A submitted proposal version is immutable.

If review requests content changes:

1. the reviewed shared version remains historical and unchanged;
2. a new local proposal version may be prepared;
3. the new version must be submitted through the same authenticated shared boundary;
4. the shared authority records the previous shared version relation;
5. review and decision references always identify one explicit shared proposal version.

No update-in-place of submitted content is allowed.

## Shared head and compare-and-swap

The shared proposal authority must expose one current shared version/head per proposal.

Any command that advances the shared head must carry the caller's expected current shared version reference. If the authoritative head has moved, the operation fails instead of overwriting a newer submission or review outcome.

This compare-and-swap rule protects against stale browser sessions and concurrent submissions.

## Relationship to R7A3

R7A3 remains valid and is not replaced by R7A4.

The future strengthened decision path must require:

`shared authoritative proposal version -> exact R7A3 deliberation snapshot -> institutional decision`

Before removing `PROPOSAL_AUTHORITY_UNAVAILABLE`, the server must be able to prove that:

- the frozen R7A3 payload belongs to the same workspace/proposal/version;
- the frozen payload fingerprint equals the authoritative shared submitted version fingerprint;
- target node and base curriculum version are the same authoritative binding;
- the submitted version was in a state eligible for institutional decision.

R7A4 itself does not remove the blocker because it contains no shared persistence implementation.

## Relationship to P6

R7A4 must not make canonical adoption executable.

The following remain intentionally unavailable:

- `CURRICULUM_ADOPT` for every current role;
- shared canonical candidate materialization;
- shared canonical curriculum head/registry mutation;
- canonical adoption RPC;
- `CanonicalAdoptionReceipt` persistence;
- automatic or inferred adoption.

`PROPOSAL_AUTHORITY_UNAVAILABLE` remains a valid P6 blocker until the later implementation and authoritative rebind slices pass their gates.

## No double-write rule

There must never be two competing authorities for a submitted proposal version.

After authenticated submission succeeds:

- the shared server is authoritative for submitted version identity, payload, fingerprint and institutional lifecycle;
- local `revisionArchive` may retain a cache/projection for continuity and offline consultation;
- local state cannot be treated as proof that a shared transition occurred;
- a failed shared submission cannot be recovered as a local institutional success;
- reconciliation must fail visibly when local and shared identities disagree.

## Compatibility rule

Existing local proposals remain readable and editable under their current semantics until explicitly submitted through the future shared authority path.

R7A4 does not retroactively promote historical local proposals into institutional shared records.

Any future migration/import path must be explicit, authenticated and auditable.

## Implementation sequence after this boundary is accepted

### R7A5 — Shared Proposal Persistence

Expected deliverables:

- authoritative shared proposal and proposal-version records;
- active-workspace/member RLS;
- authenticated submission RPC;
- server-side canonical payload validation and SHA-256 recomputation;
- immutable submitted versions;
- compare-and-swap shared head;
- idempotency by client request ID;
- shared lifecycle transition authority;
- client repository implementation;
- no local fallback reported as institutional success.

### R7A6 — Authoritative Decision Rebind

Expected deliverables:

- R7A3 freeze path verifies the matching authoritative shared submitted version;
- decision path verifies authoritative proposal lifecycle eligibility;
- target/base binding is checked against shared proposal authority;
- historical R7A2/R7A3 compatibility remains distinguishable;
- `PROPOSAL_AUTHORITY_UNAVAILABLE` is removed only when these invariants are actually executable and tested.

Only after that should canonical candidate materialization, shared canonical registry and deliberate `CURRICULUM_ADOPT` policy be implemented.

## Non-goals

No Supabase schema, no RPC, no remote draft editor, no synchronization engine, no P3 curriculum-analysis closure, no canonical registry, no `CURRICULUM_ADOPT`, no adoption mutation, no deploy and no automatic adoption.

## Exit gate

R7A4 is complete only when review accepts the authority boundary and the repository still proves fail-closed behavior:

- local proposal preparation remains possible;
- authenticated submission is the first shared-authority boundary;
- submitted versions are specified as immutable;
- no double authority exists after submission;
- no current role gains `CURRICULUM_ADOPT`;
- `PROPOSAL_AUTHORITY_UNAVAILABLE` remains active until a later runtime slice implements and rebinds the shared authority.
