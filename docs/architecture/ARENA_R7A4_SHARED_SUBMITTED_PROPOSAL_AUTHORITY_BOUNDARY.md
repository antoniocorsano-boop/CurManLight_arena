# Arena R7A4 — Shared Submitted Proposal Authority Boundary

Status: **FROZEN_FOR_REVIEW**

## Objective

R7A4 freezes the authority boundary between local proposal preparation and institutional proposal authority.

The goal is not to make every draft remote. The goal is to ensure that, once a proposal enters an institutional workflow, the shared server independently owns the exact submitted proposal version that later review, frozen deliberation evidence and institutional decision refer to.

R7A4 is a contract-only slice. It introduces no database migration, no RPC, no UI, no `CURRICULUM_ADOPT` assignment and no canonical curriculum mutation.

## Problem

Today `RevisionProposal`, `RevisionProposalVersion` and proposal lifecycle transitions are produced in the local `revisionArchive` and persisted through Zustand/IndexedDB. R7A3 can validate and immutably freeze the complete proposal-version payload used by a decision, but the server first learns that proposal content at freeze time.

R7A3 therefore proves exact payload shape, server-side SHA-256 recomputation, immutability of the deliberation snapshot and authenticated institutional decision binding. It does not yet prove that the frozen payload equals a proposal version already owned independently by shared proposal authority.

For this reason canonical adoption remains fail-closed with `PROPOSAL_AUTHORITY_UNAVAILABLE`.

## Distinction from R7 P3

R7 **P3 Curriculum analysis** remains separate. P3 is partial because whole-school deterministic coverage/gap analysis is incomplete.

Shared proposal authority is not P3 closure. It is an authority prerequisite in the revision → decision → adoption chain.

## Canonical authority transition

The boundary is:

`local preparation -> authenticated submission -> shared institutional proposal`

Local preparation includes `draft`, `ready-for-review`, editing and local frozen proposal versions. The first shared-authoritative state is `submitted`.

After successful submission:

- the shared server is authoritative for submitted version identity, payload, fingerprint and institutional lifecycle;
- local persistence may remain only a cache/projection;
- local state can never prove that an institutional transition succeeded;
- failed or unavailable shared operations never fall back to local institutional success.

## Shared authoritative identity

Every shared version binds:

- `workspaceId`;
- `proposalRef`;
- `proposalVersionRef`;
- exact canonical proposal payload;
- server-recomputed SHA-256 fingerprint;
- `targetNodeRef`;
- `baseCurriculumVersionRef`;
- authenticated submitter user and role;
- `submittedAt`;
- lifecycle state;
- previous shared proposal version reference.

Submitted content is immutable. Content changes create a new immutable submitted version.

## Authentication and fresh authority evidence

A structurally valid `WorkspaceActorContext` is not sufficient authority evidence by itself.

Every shared operation must, at call time:

1. re-read server-backed membership;
2. require membership `active`;
3. require workspace `active`;
4. require context workspace to match the requested workspace;
5. verify the capability required by the operation or transition;
6. fail closed on revocation, mismatch or unavailable authority evidence.

Self-declared roles remain valid only for local preparation.

Shared reads require fresh `CURRICULUM_READ` authority. Shared submission requires fresh `CURRICULUM_PROPOSE` authority.

## Submission authority and provenance

Only roles currently carrying `CURRICULUM_PROPOSE` may appear as successful shared submitters:

- `docente`;
- `dipartimento`;
- `referente`.

Runtime membership/capability verification remains mandatory.

On successful submission:

- `submittedByUserId` must equal the freshly verified membership user;
- `submittedByRole` must equal the freshly verified membership role;
- provenance may not be supplied independently by the client.

The server must validate the canonical payload and recompute the fingerprint independently before success.

## Shared head, CAS and replacement rules

Every operation that can advance or replace the current shared proposal state uses explicit compare-and-swap semantics.

For submission:

- `expectedCurrentSharedProposalVersionRef = null` means explicitly “first shared submission”;
- a non-null expected head must equal the authoritative current head;
- `previousSharedProposalVersionRef` must equal that expected head;
- replacement submission is allowed only when the current authoritative predecessor is `changes-requested`;
- replacement must create a new proposal-version identity;
- stale or concurrent submissions fail instead of overwriting a newer head.

This prevents a proposer from silently replacing a version that is still under institutional review.

## Closed shared lifecycle policy

The local `PROPOSAL_STATUS_TRANSITIONS` table is not reused as institutional authority policy.

R7A4 freezes the following shared transitions only:

| From | To | Required capability | Additional actor binding |
|---|---|---|---|
| `submitted` | `under-review` | `REVISION_REVIEW` | authorized member |
| `submitted` | `withdrawn` | `CURRICULUM_PROPOSE` | original submitter |
| `under-review` | `changes-requested` | `REVISION_REVIEW` | authorized member |
| `under-review` | `accepted-for-decision` | `REVISION_REVIEW` | authorized member |
| `under-review` | `rejected` | `REVISION_REVIEW` | authorized member |

Every lifecycle mutation must additionally:

- re-read fresh server membership;
- verify the capability selected by this policy;
- require the target version to remain the current shared head;
- compare-and-swap the expected lifecycle state;
- fail closed on stale state, revoked membership or capability mismatch.

No other transition is implicitly authorized by R7A4.

In particular, `changes-requested -> ready-for-review` is a **local preparation** step. It never rewrites the shared historical version. A corrected local version must cross the authenticated submission boundary again and become a new shared version.

Archival policy for terminal shared states is intentionally deferred until an explicit authority rule is designed; it is not inferred from the local state machine.

## Lifecycle audit receipt

A lifecycle transition is not only a mutable state change. Every successful shared lifecycle mutation must persist immutable audit evidence binding:

- workspace;
- proposal and exact proposal version;
- previous and next lifecycle state;
- capability used;
- freshly verified actor user and role;
- transition timestamp;
- `clientRequestId`.

The transition receipt must derive actor identity/role and capability from server-verified authority evidence and transition policy, not from caller-supplied provenance.

## Idempotency

Every consequential shared mutation is idempotent by `clientRequestId`.

The same request identifier with the same canonical operation returns the same institutional result. Reuse of the same request identifier with conflicting payload, proposal/version, expected head or lifecycle transition fails closed.

Idempotency may never be implemented as “last write wins”.

## Adversarial invariant matrix

R7A4 is reviewed against the following classes of failure rather than waiting for individual implementation bugs:

| Invariant | Submission | Lifecycle mutation | Shared read |
|---|---|---|---|
| authenticated context required | yes | yes | yes |
| fresh membership re-read | yes | yes | yes |
| active workspace/member | yes | yes | yes |
| workspace binding | yes | yes | yes |
| capability check | `CURRICULUM_PROPOSE` | transition-specific | `CURRICULUM_READ` |
| actor provenance bound to membership | yes | yes, in receipt | n/a |
| server payload validation | yes | n/a | n/a |
| server fingerprint recomputation | yes | n/a | n/a |
| current-head guard | CAS | yes | n/a |
| expected-state CAS | submission head | lifecycle state | n/a |
| immutable version content | yes | preserved | preserved |
| immutable institutional audit receipt | submission provenance | yes | n/a |
| idempotency / conflict detection | yes | yes | n/a |
| revocation fails closed | yes | yes | yes |
| local institutional fallback | never | never | never |

This matrix is enforced by the R7A4 Authority Contract Harness in `src/__tests__/r7a4-shared-submitted-proposal-authority-boundary.test.ts`.

## Relationship to R7A3

R7A3 remains valid and is not replaced by R7A4.

The future strengthened decision path must require:

`shared authoritative proposal version -> exact R7A3 deliberation snapshot -> institutional decision`

Before removing `PROPOSAL_AUTHORITY_UNAVAILABLE`, the server must prove that snapshot workspace/proposal/version, fingerprint, target/base binding and decision-eligible lifecycle all match the authoritative shared proposal version.

R7A4 itself does not remove the blocker because it contains no shared persistence implementation.

## Relationship to P6

R7A4 does not make canonical adoption executable.

Still intentionally unavailable:

- `CURRICULUM_ADOPT` for every current role;
- shared canonical candidate materialization;
- canonical curriculum registry/head mutation;
- canonical adoption RPC;
- `CanonicalAdoptionReceipt` persistence;
- automatic or inferred adoption.

## Compatibility and no-double-authority rule

Existing local proposals remain readable/editable until explicitly submitted through the future shared authority path. No historical local record is retroactively promoted.

After successful shared submission there is exactly one institutional authority: the shared server. Local state is projection only. Any reconciliation mismatch fails visibly.

## Implementation sequence

### R7A5 — Shared Proposal Persistence

Must implement the frozen contract, including:

- shared proposal/version persistence;
- active workspace/member RLS;
- authenticated submission RPC;
- server payload validation and SHA-256 recomputation;
- immutable submitted versions;
- CAS shared head;
- replacement only from `changes-requested`;
- closed shared lifecycle policy;
- fresh capability verification on each lifecycle mutation;
- immutable lifecycle transition receipts;
- idempotency/conflicting-request protection;
- client repository implementation;
- no local institutional-success fallback.

### R7A6 — Authoritative Decision Rebind

Must bind the R7A3 freeze and institutional decision to the exact authoritative shared version and its decision-eligible state. Only after executable proof may `PROPOSAL_AUTHORITY_UNAVAILABLE` be reconsidered.

Canonical candidate materialization, canonical registry and deliberate `CURRICULUM_ADOPT` policy remain later work.

## Non-goals

No Supabase schema, RPC, remote draft editor, synchronization engine, P3 curriculum-analysis closure, canonical registry, `CURRICULUM_ADOPT`, adoption mutation, deploy or automatic adoption.

## Exit gate

R7A4 is complete only when review accepts that:

- local preparation remains local;
- authenticated submission is the first shared-authority boundary;
- every shared operation requires fresh server-backed authority evidence;
- submission provenance is bound to the verified member;
- submitted content is immutable;
- replacement is CAS-protected and only follows `changes-requested`;
- lifecycle mutations use the closed least-privilege transition policy;
- institutional lifecycle changes create immutable audit receipts;
- mutations are idempotent and conflicting retries fail closed;
- no local fallback can become institutional success;
- no current role gains `CURRICULUM_ADOPT`;
- `PROPOSAL_AUTHORITY_UNAVAILABLE` remains active until later runtime/rebind slices actually implement these invariants.
