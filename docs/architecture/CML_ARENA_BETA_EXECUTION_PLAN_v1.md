# CurManLight Arena — Beta Execution Plan v1

Status: CANONICAL CANDIDATE / AGENTIC EXECUTION PLAN  
Date: 2026-08-26  
Audit baseline: `d368b2bd0040dfe808d8ae65b13ba60942a831d5`

## Goal

Reach a real external Beta without broadening product scope. Beta authorization is gate-based and requires BETA-G1 through BETA-G11 to pass on a named release candidate.

## Frozen Beta outcome

A pilot user can complete the institutional curriculum workflow without ordinary developer intervention:

`curriculum context → applicable framework → revision state → revision proposal → explicit human decision → resulting curriculum baseline → planning handoff/export`

The Beta remains professional/curricular and does not require student personal data.

## Execution policy

Agents must execute the first ready tranche only. They may discover implementation details, but they may not skip prerequisites, silently widen scope, or mark a human/release gate PASS from code inspection alone.

Every tranche must:

1. start from the current canonical branch head;
2. read `AGENTS.md`, `docs/WORKING_PROTOCOL.md`, this plan, the Beta audit and machine state;
3. identify the Human Task(s) affected;
4. work on an isolated branch/worktree;
5. make the smallest coherent change that advances one gate;
6. run the smallest reliable validation plus Product CI/HIM when applicable;
7. record evidence and unresolved human decisions;
8. stop when the tranche exit condition is satisfied or a blocker is discovered;
9. open a reviewable PR rather than writing directly to `main`.

## Phase B0 — Scope Freeze

Target gate: BETA-G1.

Deliverables:

- canonical Beta journey and actor/authority matrix;
- included and excluded surfaces;
- Beta Human Task registry;
- Beta release-candidate evidence matrix;
- agentic state/backlog.

Exit: `BETA_SCOPE_FROZEN`.

No runtime feature work is authorized by B0.

## Phase B1 — Environment and operations foundation

Targets: BETA-G2 and foundation for BETA-G10.

Deliverables:

- one canonical Beta deployment environment;
- release identifier visible/inspectable;
- reproducible deploy from immutable SHA;
- previous-known-good rollback procedure;
- minimal known-issues and incident intake contract.

Exit: `BETA_ENVIRONMENT_READY` plus operations foundation recorded.

## Phase B2 — Identity and authority

Target: BETA-G3.

Deliverables:

- real authenticated membership resolution for Beta actors;
- workspace setup/admin path limited to administration;
- RLS-backed authorization against a real test backend;
- no client/self-declared fallback to institutional authority;
- tests for denied, expired/removed membership and refresh/re-entry.

Exit: `BETA_IDENTITY_AUTHORITY_PASS`.

## Phase B3 — E2E human workflow

Targets: BETA-G4, BETA-G5, BETA-G6.

Deliverables:

- canonical browser E2E harness against Beta environment;
- happy, blocked, rejected, refresh/re-entry and recoverable-error scenarios;
- HIA evidence desktop/mobile for each critical Human Task;
- automated a11y plus keyboard/focus/touch/manual acceptance.

Exit: `BETA_E2E_WORKFLOW_PASS`, `BETA_HIA_PASS`, `BETA_ACCESSIBILITY_PASS`.

## Phase B4 — Real users

Target: BETA-G7.

Deliverables:

- observed sessions with intended users;
- task completion and recovery observations;
- prioritized findings with severity;
- correction tranche for blockers/significant findings;
- re-acceptance of changed critical tasks.

A simulated session cannot close this phase.

Exit: `BETA_REAL_USER_ACCEPTANCE_PASS`.

## Phase B5 — Safety, operations and release candidate

Targets: BETA-G8, BETA-G9, BETA-G10, BETA-G11.

Deliverables:

- data recovery rehearsal and release rollback evidence;
- security/privacy review of configuration, auth, RLS, dependencies, data boundary and import/export;
- incident/known-issues/support ownership for pilot;
- immutable release candidate SHA;
- complete RC gate and published-environment smoke.

Exit: `BETA_RECOVERY_PASS`, `BETA_SECURITY_PRIVACY_PASS`, `BETA_OPERATIONS_PASS`, `BETA_RC_PASS`.

## Authorization rule

Only when every mandatory gate is PASS may governance emit:

`CML_ARENA_BETA_READY`.

Before then the only valid product status is:

`CML_ARENA_BETA_NOT_READY`.

## Scope discipline

Before first Beta, do not introduce speculative AI agents, institution-wide rollout, student-data handling, real-time synchronization, shared Arena/Docente OS database, broad Classroom/Social/Copilot productization, or architecture/routing redesign unless a proven Beta blocker requires it.
