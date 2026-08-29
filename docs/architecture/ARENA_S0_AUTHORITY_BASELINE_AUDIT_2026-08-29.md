# ARENA-S0 — Authority & Baseline Audit

Date: 2026-08-29
Status: PASS_WITH_FOLLOW_UPS
Baseline audited: `main@6991f9293fe83761ab263d6962909554f18853f5`

## Scope

Audit the current CurManLight Arena baseline against the stabilization plan before any new runtime implementation.

## Findings

### 1. Cohort applicability — PASS

The current runtime path resolves the national framework by `schoolYear + schoolOrder + classLevel` through `resolveNationalFramework()`. The caller does not choose the national framework manually.

Expected secondary-first-cycle transition remains:
- 2026/27 grade 1 -> IN2025;
- 2026/27 grades 2-3 -> IN2012 transitional cohorts;
- progressive annual extension until all cohorts use IN2025.

### 2. Requirement authority separation — PASS

The Runtime Curriculum Binding v2 keeps these semantics distinct:
- `NATIONAL_PRESCRIPTIVE` for national competencies/objectives;
- `INSTITUTIONAL_REQUIRED` for institutional essential knowledge already present in the runtime curriculum;
- `RECOMMENDED` for evidence/verification descriptors;
- `TRANSITION_REQUIRED` for provisional transition-remodulation requirements.

This separation must remain closed to implicit promotion by future features.

### 3. Provisional vs approved curriculum — PASS, but implementation remains intentionally conservative

The current runtime projection exports `curriculumState = PROVISIONAL_COMPLETE` and explicitly rejects the inference that a recorded decision on one revision proposal equals approval of the complete institute curriculum.

This is semantically correct for the present baseline. Future introduction of `APPROVED` must require an explicit complete-curriculum institutional approval object/decision and must not be inferred from proposal-level decisions.

### 4. Revision authority — PASS

Revision proposals may contribute to transition hypotheses, but explicit `reject`, `defer` or `return-for-revision` outcomes do not become mandatory planning requirements. Proposal/decision provenance is preserved.

### 5. Empty/incomplete planning context — PASS

Runtime binding refuses to mark a curriculum complete for planning when no mandatory requirements exist.

### 6. Interoperability source-of-truth boundary — PASS

The canonical product boundary states:
- Arena owns institutional curriculum/adoption/revision state;
- Docente OS owns teacher operational state;
- no shared database;
- no cross-product automatic canonical write;
- exchanged objects carry provenance/version/source identity;
- projections and Human Tasks are not second sources of truth.

### 7. External reference frameworks — BLOCKED BY DESIGN

AILit and future external frameworks must remain `EXTERNAL_REFERENCE` by default. They cannot enter the current authority vocabulary as `NATIONAL_PRESCRIPTIVE` or `INSTITUTIONAL_REQUIRED` without an explicit human/institutional adoption action.

## Follow-ups released by S0

ARENA-S0 finds no blocking authority contradiction. It releases ARENA-S1 with the following concrete objectives:

1. make the distinction between proposal-level decisions and complete-curriculum approval machine-testable;
2. ensure Runtime Curriculum Binding v2 cannot emit `APPROVED` without explicit complete-curriculum approval evidence;
3. strengthen regression tests around transition outcomes and authority levels;
4. preserve deterministic version/provenance identity in the projection;
5. keep AILit architecture-only.

## Gate

`ARENA-S0 = PASS_WITH_FOLLOW_UPS`

Next authorized slice: `ARENA-S1 — Curriculum runtime consolidation`.
