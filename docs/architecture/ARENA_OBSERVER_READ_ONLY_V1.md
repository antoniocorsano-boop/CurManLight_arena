# Arena Observer / Institutional Read-only Experience v1

**Stage:** R6  
**Parent:** `ARENA_PROCESS_ROLE_MODEL_V1.md`  
**Purpose:** provide institutional consultation/audit without creating a new authority role.

## Core decision

Observer is an **access profile**, not an `InstitutionalRole`.

This avoids granting authority by adding another role value to decision, workspace, Human Task or curriculum governance types.

The profile is:

`observer-read-only`

and it overrides the capabilities of the underlying actor for the duration of the observer projection.

## Capability contract

Observer receives exactly:

- `CURRICULUM_READ`

Observer does **not** receive:

- `CURRICULUM_PROPOSE`;
- `REVISION_REVIEW`;
- `REVISION_DECIDE`;
- `CURRICULUM_ADOPT`;
- `DOCUMENT_PREPARE`;
- `DOCUMENT_EXPORT`;
- `WORKSPACE_ADMIN`.

The restriction applies even if the underlying authenticated role would normally own one of those capabilities. For example, an authenticated `collegio` projected as observer still cannot decide.

## Visible domains

Observer may inspect:

1. **curriculum** — applicable curriculum and version/state information;
2. **evidence** — sources/evidence and their qualification state;
3. **process** — proposal/review/decision/adoption/handoff state as read-only information.

## Work queue behavior

`ArenaActorProjection` accepts an optional access profile.

When `observer-read-only` is active:

- readable work remains visible;
- mutation work projects as `READ_ONLY`;
- no work item may become `ACTIONABLE` through the underlying role;
- P6 remains independently fail-closed because canonical adoption is still `NOT_IMPLEMENTED`.

## Authority invariant

`observer-read-only` MUST NOT:

- become a workspace membership authority role;
- unlock proposal mutations;
- unlock review transitions;
- unlock institutional decision;
- unlock canonical adoption;
- export/hand off as an institutional act;
- administer workspace state.

## Intended use cases

- NIV;
- commissione PTOF participant;
- invited reviewer;
- auditor/trainer;
- other stakeholder requiring governed institutional consultation.

## Non-goals

R6 does not:

- add a new top-level surface;
- add a new `InstitutionalRole`;
- add a membership database value;
- change routing;
- deploy the UX batch;
- implement P6 adoption.

A future authenticated invitation flow may choose when to activate this profile. That activation mechanism must not weaken the capability boundary defined here.

## Exit gate

R6 passes when:

- observer is modeled separately from authority roles;
- the profile contains only `CURRICULUM_READ`;
- an authenticated actor with mutation capabilities loses them under observer projection;
- proposal, review, decision, adoption, export and administration paths are non-actionable;
- focused tests, governance tests, TypeScript and build pass on one candidate SHA;
- no deployment occurs before the planned R7 batch validation checkpoint.
