# CurManLight Arena + Docente OS — Product Stabilization Execution Plan

Date: 2026-08-29
Status: ACTIVE EXECUTION PLAN
Scope: stabilize the two products before any runtime implementation of AILit / External Reference Framework.

## Governing decision

AILit remains architecture-only and MUST NOT introduce runtime, UI, storage, or curriculum-authority changes until the product-stabilization gates below are closed.

CurManLight Arena remains authoritative for institutional curriculum, applicability, revision, adoption and curricular alignment. Docente OS remains authoritative for teacher-owned operational planning, UDA execution, class work, timetable, professional knowledge and daily activity.

## Execution order

### ARENA-S0 — Baseline and authority audit

Goal: verify that current runtime contracts, product boundaries and authority semantics are internally consistent.

Required checks:
- national applicability is deterministic by cohort;
- `NATIONAL_PRESCRIPTIVE`, `INSTITUTIONAL_REQUIRED`, `RECOMMENDED`, `TRANSITION_REQUIRED` remain semantically distinct;
- provisional curriculum cannot be confused with institutional approval;
- revision decisions cannot silently promote unrelated curriculum state;
- interoperability never becomes a second source of truth.

Exit gate: no unresolved authority contradiction in current canonical contracts.

### ARENA-S1 — Curriculum runtime consolidation

Goal: stabilize the productive curriculum projection used by Arena and its exported planning context.

Work:
- verify Runtime Curriculum Binding v2 against the UI-consumed curriculum;
- make provenance/version identity explicit across curriculum requirements;
- preserve transition hypotheses as non-approved state;
- ensure empty/incomplete curriculum cannot be exported as complete for planning;
- add/strengthen regression tests for class/cohort applicability and requirement authority.

Exit gate: deterministic projection + Product CI + Human Interaction Model PASS.

### ARENA-S2 — Product-surface rationalization

Goal: align user-visible Arena surfaces with the frozen Arena ↔ Docente OS product boundary.

Work:
- curriculum knowledge remains institutional/curricular;
- classroom remains curricular class/grade context, not teacher daily execution;
- copilot remains specialist for curriculum/process/governance;
- documents remain institutional/curricular;
- no planner, timetable, TeachingSession or personal-professional archive is introduced into Arena;
- identify primary-navigation surfaces that still violate this split.

Exit gate: product responsibility audit PASS, with no duplicate operational ownership.

### ARENA-S3 — Human Task / HIM / mobile closure

Goal: ensure institutional curriculum work is understandable and executable by a human without relying on hidden AI behavior.

Work:
- explicit task intent, state and authority;
- available / disabled / blocked / confirmation-required states;
- browser and mobile verification of critical revision, planning handoff and evidence flows;
- manual HVA on the final candidate.

Exit gate: Product CI + HIM + browser/mobile audit + HVA PASS on the same immutable SHA.

### ARENA-S4 — Interoperability stabilization

Goal: freeze Arena → Docente OS planning handoff and Docente OS → Arena evidence return as explicit versioned contracts.

Work:
- no shared persistence;
- provenance/version/source-product identity on exchanged objects;
- no automatic overwrite of teacher-authored state;
- reverse evidence remains contribution only until Arena human review;
- define additive extension policy for future reference-framework alignments without implementing AILit yet.

Exit gate: bidirectional contract tests PASS and no canonical write is possible through the transfer layer alone.

## DOCENTE-OS execution

### DOS-S0 — Receiver/revalidation audit

Goal: ensure the teacher can consume Arena curriculum safely without losing operational authorship.

Work:
- provisional vs approved baseline remains explicit;
- update detection compares requirements instead of last-write-wins;
- changed / added / removed requirements remain visible;
- teacher revalidation is explicit;
- annual plan progress remains distinct from curriculum baseline state.

Exit gate: revalidation contract and regression tests PASS.

### DOS-S1 — Knowledge Base consolidation

Goal: make Conoscenza the single professional knowledge pipeline.

Work:
- immutable original source;
- generation-safe processing;
- provenance and human validation preserved;
- no parallel document stores for future framework ingestion;
- operational modules link to exact KB units instead of duplicating source identity.

Exit gate: ingestion/reprocessing/search/provenance tests PASS.

### DOS-S2 — Annual plan / Design / UDA / Classes coherence

Goal: ensure the curriculum baseline received from Arena can be operationalized without constraining legitimate teacher choices.

Work:
- requirements and coverage visible in Piano annuale;
- Progetta/UDA map to requirements without changing their authority;
- Classi shows operational progress, not a duplicate curriculum source;
- teacher can sequence, adapt and schedule activities independently;
- operational evidence remains attributable to the teacher.

Exit gate: end-to-end teacher flow validated from accepted baseline to planned UDA/activity.

### DOS-S3 — Assistant authority closure

Goal: apply the canonical AI collaboration contract consistently.

Work:
- READ_ONLY / PROPOSE / WRITE_REVERSIBLE / WRITE_EXTERNAL / INSTITUTIONAL_DECISION boundaries;
- evidence classification preserved;
- no AI-generated institutional decision;
- preview/confirmation for consequential writes;
- all essential workflows remain available when AI is disabled.

Exit gate: capability-filtering and human-control tests PASS.

### DOS-S4 — Browser/mobile/HVA closure

Goal: validate real product usability, not only DOM correctness.

Work:
- Conoscenza;
- Piano annuale;
- Progetta/UDA;
- Classi;
- Orario;
- interoperability/revalidation surfaces.

Exit gate: automated regression + browser/mobile audit + human validation PASS on the same candidate SHA.

## Cross-product final gate

The stabilization program is complete only when:

1. Arena authority model has no unresolved contradiction.
2. Arena runtime curriculum projection is deterministic and versioned.
3. Product ownership boundary is reflected in both runtime and UI.
4. Arena → Docente OS planning handoff is stable.
5. Docente OS provisional → approved revalidation is stable.
6. Docente OS → Arena evidence cannot mutate canonical curriculum automatically.
7. Knowledge Base provenance and human validation are preserved end-to-end.
8. Critical user journeys pass browser/mobile validation.
9. Human validation passes on immutable release candidates.
10. AILit remains `EXTERNAL_REFERENCE` and architecture-only until a separate authorization gate.

## AILit hold point

The existing AILit architecture notes are checkpoints only. Runtime implementation is blocked until the cross-product final gate above is complete.

First allowed post-stabilization slice: `AILIT-0 — External Reference Framework machine contract`, followed by source ingestion in Docente OS and only later Arena alignment support.
