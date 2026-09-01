# Arena Work Queue Contract v1

**Status:** FROZEN_FOR_IMPLEMENTATION  
**Parent:** `ARENA_PROCESS_ROLE_MODEL_V1.md`  
**Input audit:** `ARENA_ROLE_EXPERIENCE_INVENTORY_V1.md`

## 1. Purpose

Arena needs a deterministic way to answer a user's operational question:

> **What needs my attention now, why, what may I do, and who acts next?**

The work queue is a **read-only projection** over existing process state. It is not a workflow engine and it never grants authority.

Canonical derivation:

`process state + evidence/blockers + canonical process requirements + actor assurance → work-item projection`

## 2. Actor model

A work-item projection receives an actor with:

- `role`: institutional role;
- `assurance`: `self-declared` or `authenticated-workspace`.

The projection MUST use the canonical capability resolver. It MUST NOT infer authenticated authority from a role label, local profile, route or UI state.

## 3. Work-item contract

A work item must carry enough information for a person to understand the task without knowing Arena internals:

- stable item id;
- canonical process id;
- title;
- reason it needs attention;
- queue state;
- evidence state;
- optional blocker;
- required capability;
- allowed next action label;
- next actor role when known;
- consequential flag;
- authenticated-authority requirement;
- source/target reference when available;
- stable secondary ordering key.

Seed fields are descriptive inputs, not a source of higher or lower authority. A seed MUST NOT weaken requirements already frozen by the canonical process contract. Where a canonical process fixes a stronger requirement, the projection must normalize to that stronger requirement and fail closed.

## 4. Queue states

Canonical states remain:

- `TO_READ` — information requires recognition/inspection;
- `TO_VERIFY` — source, evidence or state must be verified before continuation;
- `TO_REVIEW` — a proposal or analysis requires human review;
- `TO_DECIDE` — an institutionally consequential decision is ready for an authorized actor;
- `COMPLETED` — no current action is required.

The queue state describes the **work**, not the user's permission. A `TO_DECIDE` item may therefore project as read-only for an actor who cannot decide.

`COMPLETED` is always non-actionable. Even when the actor owns the relevant capability, a completed item projects as READ_ONLY because there is no current action to execute.

## 5. Evidence states

- `READY` — required evidence is present for the stated task;
- `MISSING` — evidence required by the task is absent;
- `STALE` — evidence exists but is no longer safely bound/current;
- `NOT_REQUIRED` — this task does not require evidence.

`MISSING` or `STALE` evidence can produce a blocker. A work-item projection MUST NOT convert missing evidence into an actionable consequential task.

## 6. Projection access

A projected item has one of three access states:

### ACTIONABLE

The actor has the effective required capability under the supplied assurance and no hard process/evidence blocker prevents the action.

### READ_ONLY

The actor may inspect the item but cannot execute the required action. Typical reasons:

- the role lacks the required capability;
- the capability requires authenticated assurance but the actor is only self-declared;
- the process is not implemented yet;
- a consequential action is blocked by missing/stale evidence;
- the work item is already completed.

### HIDDEN

The actor has no relevant read capability for the item. Hidden is a projection result, not deletion of institutional records.

## 7. Fail-closed rules

### 7.1 Canonical process invariants dominate seed fields

The projection derives consequence/authentication requirements from `getArenaProcessContract()` and combines them monotonically with the seed: a seed may add restrictions but cannot remove canonical ones.

For currently fixed consequential processes:

- P5 Institutional decision requires `REVISION_DECIDE` and authenticated workspace assurance;
- P6 Canonical adoption remains authenticated and non-actionable until implemented;
- P7 Planning handoff requires `DOCUMENT_EXPORT` and authenticated workspace assurance.

Supplying a weaker capability, `consequential: false` or `authenticatedAuthorityRequired: false` for these processes cannot make the item actionable.

### 7.2 Self-declared decision role

A self-declared `collegio` encountering a P5 decision item is **READ_ONLY**, never ACTIONABLE.

### 7.3 Authenticated Collegio

An authenticated workspace `collegio` may receive an ACTIONABLE decision item only when:

- effective required capability is `REVISION_DECIDE`;
- evidence is `READY` or `NOT_REQUIRED` as appropriate;
- no blocker exists;
- P5 institutional decision is implemented.

### 7.4 Dirigente

The current capability model does not grant `REVISION_DECIDE` to `dirigente`. Authentication does not change that; the item remains READ_ONLY.

### 7.5 Amministratore

Technical administration never implies curriculum decision authority.

### 7.6 Canonical adoption P6

`P6_CANONICAL_ADOPTION` is currently `NOT_IMPLEMENTED`.

Therefore **no P6 work item can be ACTIONABLE**, even for an authenticated actor that otherwise owns a required capability. It must remain READ_ONLY with an explicit implementation blocker until R5 defines and implements the adoption contract.

### 7.7 Evidence blockers

A consequential item with `MISSING` or `STALE` evidence is never ACTIONABLE.

### 7.8 Completed work

A `COMPLETED` item is always READ_ONLY after visibility resolution. Completion cannot be converted back into an executable action merely because the actor has the associated capability.

## 8. Relevance and visibility

The work queue is not a global dump of all institutional objects.

Projection rules:

1. resolve canonical process requirements and effective capability first;
2. if the actor can use the effective required capability, consider ACTIONABLE subject to blockers;
3. otherwise, if the actor has `CURRICULUM_READ`, project READ_ONLY when the item is institutionally relevant;
4. otherwise project HIDDEN.

Future product selectors may add contextual scoping (discipline, order, workspace, assigned review responsibility). Such scoping must narrow visibility; it must not grant capability.

## 9. Deterministic ordering

R2 does not invent urgency scores.

The canonical grouping order is:

`TO_VERIFY → TO_REVIEW → TO_DECIDE → TO_READ → COMPLETED`

Within a group, use the item's explicit stable `orderKey`, then stable id.

Rationale:
- unresolved verification/evidence blockers must surface before downstream review;
- review precedes institutional decision in the canonical pipeline;
- reading is lower-action work;
- completed items are last.

This ordering is operational, not an authority ranking and not a semantic relevance score.

## 10. Representative process mapping

| Process | Typical queue state | Effective capability pattern | Typical next actor |
| --- | --- | --- | --- |
| P1 Source qualification | TO_VERIFY | CURRICULUM_READ | Referente / responsible reviewer |
| P2 Curriculum context | TO_READ / TO_VERIFY | CURRICULUM_READ | current actor |
| P3 Curriculum analysis | TO_REVIEW | REVISION_REVIEW or CURRICULUM_PROPOSE | Dipartimento / Referente |
| P4 Revision review | TO_REVIEW | REVISION_REVIEW | Dipartimento / Referente |
| P5 Institutional decision | TO_DECIDE | REVISION_DECIDE, canonical | Collegio |
| P6 Canonical adoption | TO_DECIDE | REVISION_DECIDE placeholder, blocked until R5 | blocked until R5 |
| P7 Planning handoff | TO_READ / COMPLETED | DOCUMENT_EXPORT, canonical | Docente / downstream acceptor |

The table is illustrative. Concrete work items must derive from actual state rather than being fabricated to fill a dashboard.

## 11. Non-goals

R2 does not:

- change Home;
- change navigation;
- hide current surfaces;
- add a new backend;
- implement P6 adoption;
- authenticate users;
- assign institutional responsibility automatically;
- generate work items from AI inference;
- mutate proposals, decisions or curriculum.

## 12. R2 exit gate

R2 is complete when:

- the work-item and projection contracts exist in code;
- projection reuses the canonical capability resolver;
- canonical process requirements cannot be weakened by caller-controlled seed fields;
- self-declared institutional roles cannot unlock authenticated-only work;
- completed work cannot become ACTIONABLE;
- P6 fails closed as not implemented;
- consequential evidence blockers fail closed;
- representative tests cover all six institutional roles and all seven processes;
- deterministic queue ordering is tested;
- no runtime UI/routing mutation is included.

After R2, R3 may use this projection to build the role-aware Home.
