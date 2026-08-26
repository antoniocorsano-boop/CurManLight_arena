# CurManLight Arena — Beta Readiness Audit v1

Status: AUDIT BASELINE / BETA NOT YET AUTHORIZED  
Date: 2026-08-26  
Audited baseline: `d368b2bd0040dfe808d8ae65b13ba60942a831d5`

## 1. Decision

CurManLight Arena is **not yet ready for a real external Beta**.

The reason is not lack of curriculum-domain implementation. The repository already has a strong technical and governance foundation: productive curriculum contracts, deterministic transition resolution, Human Task governance, capability boundaries, local persistence, controlled revision/decision semantics, interoperability contracts, and green product CI.

The remaining gap is operational product maturity: Arena must prove that a bounded Beta can be used by real people in a stable published environment, with reliable identity/authority, recoverable failure modes, accessible interaction, feedback capture and an explicit release/rollback process.

This audit therefore defines a narrow Beta target and the gates required before the label `BETA_READY` may be used.

## 2. Beta definition

A **real Beta** means:

> A deliberately limited but genuine product release that can be used by external pilot users for a defined human workflow without developer intervention during normal operation, while failures remain observable, recoverable and non-destructive.

A green build, a simulated validation, a local pilot, a Storybook review, or a feature flag do not by themselves constitute Beta readiness.

## 3. Proposed Beta scope

The first Beta should be intentionally narrower than the whole historical Arena surface.

### Beta workflow

`Curriculum context → inspect applicable framework → review curriculum/revision state → prepare or inspect a revision proposal → human institutional decision boundary → inspect resulting curriculum baseline → export/hand off a planning baseline`

The Beta must not require Classroom, Social, generic Copilot, legacy Knowledge or other areas that are not necessary for this institutional curriculum workflow.

### Beta actors

Minimum actor coverage:

- teacher/contributor;
- curriculum/department reviewer;
- decision authority for the controlled institutional-decision scenario;
- system administrator only for account/workspace setup, never as curriculum authority.

### Beta data boundary

The first Beta remains professional/curricular and must not require student personal data.

## 4. Maturity scale

- **0 — ABSENT**: capability is not implemented.
- **1 — FOUNDATION**: architecture/contract exists but not operationally proven.
- **2 — FUNCTIONAL**: implementation works in controlled/local conditions.
- **3 — PILOTABLE**: end-to-end workflow works in a realistic test environment with recovery and acceptance evidence.
- **4 — BETA READY**: external users can use it in a stable published environment under documented operational controls.

## 5. Current maturity assessment

| Dimension | Score | Evidence / interpretation | Beta status |
|---|---:|---|---|
| Curriculum/domain correctness | 3.5/4 | Productive domain, transition resolver, revision semantics, runtime curriculum binding and extensive tests exist | STRONG |
| Human interaction governance | 3/4 | Arena Human Task + HIM-L2 + explicit human authority boundary | STRONG, needs wider HIA evidence |
| Automated quality | 3/4 | Product CI runs fast regression, Human governance, TypeScript and production build | STRONG, missing broader release gates |
| Local persistence/integrity | 2.5/4 | Dexie persistence, backup/rollback foundations exist; productive runtime still intentionally `legacy-only` | PARTIAL |
| Shared identity/authorization | 1.5/4 | Capability model + Supabase adapter/RLS foundation exist; remote project/authenticated user flow not proven end-to-end | BLOCKING |
| Institutional multi-user workflow | 1/4 | Authority model exists; shared writes/admin/membership lifecycle are not yet operationally proven | BLOCKING |
| Real-user validation | 1/4 | Simulated teacher validation exists and explicitly requires real user testing | BLOCKING |
| Browser/mobile/accessibility acceptance | 1.5/4 | Storybook/a11y tooling and historical microfixes exist; no current systematic Beta acceptance matrix | BLOCKING |
| Deployment/release environment | 1/4 | Build produces a distributable artefact; no canonical Beta environment/release contract is established | BLOCKING |
| Recovery/rollback operations | 1.5/4 | Local backup/rollback concepts exist; no Beta operational recovery rehearsal and release rollback evidence | BLOCKING |
| Security/privacy operations | 2/4 | RLS foundation, least privilege and non-personal interoperability guard exist; no complete Beta threat/security release gate | PARTIAL/BLOCKING |
| Observability/support/feedback | 0.5/4 | No canonical Beta telemetry/support/incident feedback loop is established | BLOCKING |
| Interoperability with Docente OS | 2.5/4 | Contracts and local handoff v1/v2 are implemented; later reverse/revalidation/UI slices remain in roadmap | NOT REQUIRED FOR CORE BETA, useful pilot extension |
| Documentation/governance | 3/4 | Architecture and decision records are extensive; current general project baseline is stale relative to recent H0-H2/interop work | STRONG, needs consolidation |

Indicative maturity: **~56% of a real Beta release model**.

This percentage is diagnostic only. Beta authorization is gate-based, not score-based: one unresolved release blocker keeps the product `NOT_READY`.

## 6. What is already mature enough

The following areas should be preserved rather than redesigned:

1. curriculum-domain model and transition applicability;
2. explicit proposal/decision separation;
3. human authority for consequential institutional decisions;
4. capability-based authorization model;
5. fail-closed validation and provenance rules;
6. local-first compatibility as a fallback mode;
7. Product CI baseline;
8. HIM/Human Task governance;
9. Arena ↔ Docente OS product-boundary and transfer contracts.

The Beta program must not reopen these foundations without a concrete blocking defect.

## 7. Blocking gaps

### BETA-G1 — Scope and journey freeze

Define one canonical Beta journey, actor set, allowed data and explicitly excluded surfaces.

**Exit:** `BETA_SCOPE_FROZEN`.

### BETA-G2 — Canonical Beta environment

Publish one stable Beta URL/environment from a reproducible release pipeline. Record version/commit and provide rollback to the previous known-good release.

**Exit:** `BETA_ENVIRONMENT_READY`.

### BETA-G3 — Real identity and authority

Complete the authenticated workspace path required by the Beta roles. A self-declared role may never gain institutional decision capability. Membership must be backend-authoritative and RLS-enforced.

**Exit:** `BETA_IDENTITY_AUTHORITY_PASS`.

### BETA-G4 — End-to-end institutional workflow

Prove the complete Beta journey with real persistence and the real authority boundary, including rejected/blocked paths and refresh/re-entry.

**Exit:** `BETA_E2E_WORKFLOW_PASS`.

### BETA-G5 — Human Interaction Acceptance

For every Beta-critical task, register a HIM Human Task and collect HIA evidence for desktop and mobile. Include empty, loading, success, blocked, error and recovery states.

**Exit:** `BETA_HIA_PASS`.

### BETA-G6 — Accessibility acceptance

Run automated accessibility checks plus keyboard/focus/touch/manual inspection on critical Beta routes. No blocking WCAG 2.2 A/AA defect may remain in the Beta journey.

**Exit:** `BETA_ACCESSIBILITY_PASS`.

### BETA-G7 — Real-user pilot

Run observed sessions with real intended users. Minimum recommended cohort: 5 users covering at least teacher/contributor and reviewer/decision perspectives. Record task completion, confusion, recovery, critical incidents and qualitative findings.

A simulated session cannot satisfy this gate.

**Exit:** `BETA_REAL_USER_ACCEPTANCE_PASS`.

### BETA-G8 — Recovery and data safety

Prove backup/export/recovery for Beta-owned data and rehearse at least one failed-operation/recovery scenario. Define what can be lost, what cannot be lost, and how a release rollback behaves.

**Exit:** `BETA_RECOVERY_PASS`.

### BETA-G9 — Security and privacy release gate

Review attack surface, secrets/configuration, dependencies, authentication, authorization/RLS, unsafe browser trust, personal-data boundary and export/import handling. Beta must fail closed on misconfiguration.

**Exit:** `BETA_SECURITY_PRIVACY_PASS`.

### BETA-G10 — Observability, support and incident loop

Provide a lightweight but real Beta operations loop: release identifier, client-visible error/report path, issue intake, severity classification, known-issues register and owner for pilot incidents. Avoid collecting unnecessary personal data.

**Exit:** `BETA_OPERATIONS_PASS`.

### BETA-G11 — Release candidate gate

On the exact release-candidate SHA run at least:

- Product CI;
- HIM validation;
- full relevant test suite;
- TypeScript;
- production build;
- browser E2E for Beta journey;
- accessibility gate;
- security/privacy gate;
- deployment smoke on the published Beta environment.

**Exit:** `BETA_RC_PASS`.

## 8. Beta authorization rule

Beta may be declared only when all required gates are PASS on a named release candidate.

```text
BETA_SCOPE_FROZEN
AND BETA_ENVIRONMENT_READY
AND BETA_IDENTITY_AUTHORITY_PASS
AND BETA_E2E_WORKFLOW_PASS
AND BETA_HIA_PASS
AND BETA_ACCESSIBILITY_PASS
AND BETA_REAL_USER_ACCEPTANCE_PASS
AND BETA_RECOVERY_PASS
AND BETA_SECURITY_PRIVACY_PASS
AND BETA_OPERATIONS_PASS
AND BETA_RC_PASS
= CML_ARENA_BETA_READY
```

No weighted score may override a failed blocker.

## 9. Recommended execution order

### Phase B0 — Freeze the Beta

- freeze workflow, actors, data boundary and excluded surfaces;
- create Beta task registry under `.human/tasks`;
- define the release-candidate matrix.

### Phase B1 — Make it deployable and accountable

- canonical Beta environment;
- release/version marker;
- reproducible deployment;
- rollback procedure;
- lightweight incident intake.

### Phase B2 — Complete identity and real shared authority

- authenticated membership resolution;
- required workspace administration path;
- RLS/repository integration tests against a real test backend;
- no client-side authority fallback.

### Phase B3 — Prove the whole human workflow

- browser E2E on the Beta environment;
- HIA states;
- accessibility;
- error and recovery scenarios.

### Phase B4 — Real users

- observed pilot sessions;
- prioritized findings;
- correction tranche;
- repeat acceptance on changed tasks.

### Phase B5 — Release candidate

- recovery rehearsal;
- security/privacy review;
- full RC gate on one immutable SHA;
- publish known limitations;
- authorize Beta only after every blocker is closed.

## 10. Explicit non-goals before first Beta

Do not delay the Beta to complete the whole historical product.

Not required unless the frozen Beta journey proves otherwise:

- real-time Arena ↔ Docente OS sync;
- shared database between the products;
- complete Classroom/Social/Copilot productization;
- full migration away from every legacy Arena path;
- broad student-data handling;
- institution-wide rollout;
- redesign of architecture or routing;
- speculative new AI agents.

## 11. Immediate next action

Start **B0 — Beta Scope Freeze** from this audit baseline.

The next implementation PR should not add another broad feature. It should produce:

1. canonical Beta journey and actor matrix;
2. Beta Human Task registry;
3. Beta release-gate manifest;
4. first browser acceptance scenario skeleton;
5. explicit list of surfaces excluded from Beta.

Until those artifacts are canonical, status remains:

`CML_ARENA_BETA_NOT_READY`.
