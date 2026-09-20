# CurManLight Arena — M4 Controlled Production Pilot Decision

Status: **FINAL M4 PROMOTION DECISION**  
Date: **2026-09-20**  
Canonical tracker: **#121**  
Pre-decision canonical main: `9bc3bb3f57b4c6bc17453fce044d478a0994976a`  
Final human-validated Beta candidate: `a315aa72ce68a52da7d4d960996b6470774104b0`  
M4-S7 merge commit on `main`: `9bc3bb3f57b4c6bc17453fce044d478a0994976a`

## 1. Decision

CurManLight Arena is promoted to:

**M4 — CONTROLLED PRODUCTION PILOT**

Canonical decision token:

`ARENA_M4_CONTROLLED_PRODUCTION_PILOT`

This decision is based on closure of A1–A10 in tracker #121, exact-head automated evidence, immutable Beta deployment identity, repository-hosting governance and mobile human validation on the same published candidate.

This is a controlled production pilot, not unrestricted production and not authorization for a broad feature train.

## 2. Evidence basis

The final decision uses the current evidence chain required by the M4 governance contract:

- protected `main` with PR-only promotion and required checks;
- current release/rollback/incident/recovery runbook;
- current M4 evidence registry;
- exact-head Product CI, Beta Release Contract, Curriculum Alignment, Human Interaction Model, Beta Identity Authority, H3/H4 Authority Boundary, S3 Critical Journey Browser Evidence and Beta E2E Workflow;
- immutable Beta deployment of `a315aa72ce68a52da7d4d960996b6470774104b0`;
- public smoke identity `BETA_PUBLISHED_SMOKE_PASS a315aa72ce68a52da7d4d960996b6470774104b0`;
- final mobile human review after that deployment;
- closure of A3 in PR #290 and issue #280.

## 3. A1–A10 disposition

| Item | Final M4 disposition |
| --- | --- |
| A1 — Canonical Surface Freeze | SATISFIED |
| A2 — Routing Consolidation | SATISFIED — M4-S1 / PR #276 |
| A3 — Sources Registry / applicability convergence | SATISFIED — M4-S7 / PR #290 |
| A4 — Revision Single Source of Truth | SATISFIED — M4-S3 / PR #282 |
| A5 — Automation/User UI Parity | SATISFIED — M4-S2 / PR #278 |
| A6 — Arena / Curriculum Atlas / Docente OS Surface Boundary | SATISFIED — M4-S4 / PR #285 |
| A7 — Persistence Activation | ACCEPTED BOUNDED M4 LIMITATION — M4-S5 / PR #287 |
| A8 — Full G5 HVA | SATISFIED — `BETA_HIA_PASS` |
| A9 — G6 Accessibility | SATISFIED — `BETA_ACCESSIBILITY_PASS` |
| A10 — Operations / Governance Closure | SATISFIED — M4-S6 / PR #289 |

## 4. Accepted M4 limitation

The canonical curriculum-content persistence mode remains `legacy-only`.

This is explicitly accepted for M4 under the bounded hybrid persistence contract:

- personal/non-authoritative continuity remains local-device state;
- authenticated shared review/decision artifacts use server-side repositories with workspace/RLS authority;
- local role declarations never grant institutional authority;
- OAuth credentials remain memory-only;
- Arena, Curriculum Atlas and Docente OS do not share a database;
- migration beyond `legacy-only` remains separately gated and is not authorized by this M4 decision.

The accepted limitation is not a waiver of future migration gates.

## 5. Final human findings closed

The final M4-S7 human validation confirms:

- institutional configuration distinguishes draft, confirmed-inactive and active states;
- institute identity remains visible without being falsely promoted to active authority;
- Curricolo distinguishes the active institute from the provenance of source fascicles;
- Planning separates institutional year, class selection and national applicability;
- no class or section is invented as a product default;
- explicit Classe I for A.S. 2026/2027 resolves to Indicazioni 2025 / source N4;
- continuing secondary cohorts resolve to Indicazioni 2012 / source N5;
- consultation-only roles such as Collegio do not receive an operational contribution journey;
- Arena remains the governance layer, Curriculum Atlas the exploratory layer and Docente OS the teacher-operational layer.

## 6. Pilot operating constraints

During the controlled production pilot:

1. consequential institutional actions remain human-authorized and fail closed;
2. release promotion remains PR-based and exact-SHA governed;
3. every promoted Beta must retain immutable release identity and public smoke verification;
4. current human validation must be repeated when a relevant interaction, authority, persistence or boundary contract changes;
5. the bounded persistence limitation remains visible and governed;
6. new work must not reintroduce Arena as the teacher's classroom/UDA execution workspace;
7. broad cross-product state sharing or automatic writes remain prohibited unless separately governed;
8. historical evidence remains auditable but does not authorize a new release by itself.

## 7. Next governed state

M4 closes the maturity follow-up represented by #121.

The next state is **controlled-pilot stabilization and maintenance**, not a new feature train.

Existing maintenance documentation such as PR #291 must be refreshed against the M4 baseline before merge; older claims such as a pre-M4 baseline or obsolete non-goals must not be promoted unchanged.

New feature work requires an explicit new milestone/decision and must preserve the Arena / Curriculum Atlas / Docente OS boundary.

## 8. Final statement

CurManLight Arena has completed the M4 closure sequence M4-S1 through M4-S7 and meets the governed requirements for a controlled production pilot.

**Final classification: M4 — CONTROLLED PRODUCTION PILOT.**

**Decision token: `ARENA_M4_CONTROLLED_PRODUCTION_PILOT`.**
