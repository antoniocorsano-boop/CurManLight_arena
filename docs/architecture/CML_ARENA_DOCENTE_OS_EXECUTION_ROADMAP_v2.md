# CurManLight Arena ↔ Docente OS — Execution Roadmap v2

Status: CANONICAL EXECUTION CHECKPOINT  
Date: 2026-08-26  
Arena baseline at start of this slice: `a29b74e71e17837a7365b299f2d5cb5ac025881e`  
Docente OS baseline: `6bbd35d924b0684d547c17a309a7f825604fea48`

## 1. Purpose

This document saves the current execution state after the Arena ↔ Docente OS interoperability work and replaces outdated sequencing assumptions in earlier planning documents. It does not replace the product-boundary invariants in `CML_ARENA_DOCENTE_OS_BOUNDARY_v1.md` or the semantic envelope in `CML_INTEROPERABILITY_CONTRACT_v1.md`.

The governing product rule is:

> Arena determines which institutional curriculum applies and which curricular requirements must be satisfied for a class/cohort in a school year. Docente OS determines how the teacher satisfies those requirements operationally.

No interoperability action may automatically modify Arena canonical curriculum state or overwrite teacher-authored operational state in Docente OS.

## 2. IN2025 transition rule

For progressive school orders, applicability is resolved by cohort using the existing `resolveNationalFramework()` implementation. In the secondary school first cycle:

- 2026/2027: grade 1 → IN2025; grades 2–3 → IN2012 transition cohorts;
- 2027/2028: grades 1–2 → IN2025; grade 3 → IN2012 transition cohort;
- 2028/2029: all grades → IN2025.

The national framework is not chosen by the teacher or by Docente OS.

During the transition, Arena must distinguish:

- `APPLICABLE`: the framework applies directly to the class/cohort;
- `TRANSITIONAL`: a legacy cohort continues under IN2012 while the institution may need a collegial remodulation to maintain curricular coherence with the transition toward IN2025.

## 3. Institutional approval and provisional use

Arena already implements the revision/decision process with explicit proposal versions, decision outcomes, authority roles, provenance and event history.

However, a decision recorded on one revision proposal is not by itself approval of the complete institute curriculum. Therefore interoperability must not infer full curriculum approval from `Decision.status = recorded-local`.

Until a complete curriculum version has an institutional approval decision, Arena exports:

`curriculumState = PROVISIONAL_COMPLETE`

The provisional curriculum is usable for planning only when it is complete enough to provide mandatory requirements for the requested class context.

For transition cohorts Arena also exports:

`transitionRemodulation.state = HYPOTHESIS`

The hypothesis may use real revision proposals already available in Arena. If no accepted remodulation requirement is available, the safe fallback is conservative: preserve the current IN2012 requirements without inventing new curricular requirements, and require revalidation after the collegial decision.

Only an explicit complete-curriculum institutional approval may produce:

`curriculumState = APPROVED`

## 4. Completed interoperability work

### Arena

Completed and canonical before this slice:

- product-boundary freeze;
- `CML_INTEROP_V1` machine contract;
- deterministic structural validation and privacy key guard;
- local handoff v1;
- local handoff v2 with curriculum applicability;
- `PROVISIONAL_COMPLETE` / `APPROVED` distinction;
- transition-remodulation state;
- curricular requirement set for class context.

### Docente OS

Completed and canonical:

- handoff v1 preview receiver;
- explicit teacher acceptance/apply contract;
- handoff v2 receiver;
- curriculum applicability and IN2025 transition awareness;
- curriculum coverage evaluation;
- `PROVISIONAL_BASELINE` / `APPROVED_INSTITUTIONAL` persistence states;
- mandatory revalidation flag for provisional baselines;
- atomic/idempotent persistence of framework, context, provenance and coverage;
- separation from `annual_plan_block_progress`.

## 5. Gap discovered after interoperability implementation

Arena's productive curriculum domain and IndexedDB v2 persistence exist, but runtime compatibility remains:

`CURRICULUM_PERSISTENCE_MODE = legacy-only`

Therefore persistence availability is not equivalent to productive activation.

Before this slice, `createCmlLocalHandoffV2()` accepted a caller-built `curricularContext` and `annualPlanningFramework`. The contract was valid, but the sender was not yet guaranteed to be a deterministic projection of the same curriculum data that the Arena UI currently consumes.

This is the highest-priority gap.

## 6. Current slice — Runtime Curriculum Binding v2

Goal:

> The teacher can export a Docente OS planning baseline that is deterministically derived from the actual curriculum currently used by Arena, with the correct class/cohort applicability and revision-process provenance.

The slice binds the handoff to:

1. the exact `localCurriculum` / `CurriculumMap` currently consumed by Arena;
2. `schoolYear + schoolOrder + classLevel` resolved through `resolveNationalFramework()`;
3. the persisted `revisionArchive`;
4. deterministic curriculum/version projection references;
5. curriculum requirements derived from real traguardi, obiettivi, nuclei fondanti and evidenze;
6. transition hypotheses derived from available revision proposals without silently promoting them to approved curriculum;
7. a neutral annual framework (`Intero anno`) that Docente OS may operationally periodize without changing the Arena requirements.

This slice deliberately does **not** activate `dual-read`, `dual-write` or `new-domain-primary`.

## 7. Requirement classification used by the runtime projection

- `COMPETENCE` → `NATIONAL_PRESCRIPTIVE`, coverage required;
- `SPECIFIC_LEARNING_OBJECTIVE` → `NATIONAL_PRESCRIPTIVE`, coverage required;
- `ESSENTIAL_KNOWLEDGE` already present in the institute runtime curriculum → `INSTITUTIONAL_REQUIRED`, coverage required;
- evidence/verification descriptors → `RECOMMENDED`, not mandatory by themselves;
- transition-remodulation content used for a legacy cohort → `TRANSITION_REQUIRED`, coverage required while the provisional baseline is active.

Every provisional transition requirement remains bound to a source/proposal reference and must be revalidated after approval.

## 8. Execution order after Runtime Curriculum Binding v2

### R2 — Provisional → Approved revalidation in Docente OS

When Arena later emits the approved curriculum version:

- detect `UPDATE_AVAILABLE`;
- compare previous provisional requirements with approved requirements;
- preserve the teacher plan;
- show changed/added/removed requirements;
- require explicit teacher revalidation;
- never use blind last-write-wins.

### R3 — Docente OS → Arena evidence/feedback

Implement the already-defined reverse direction:

`TEACHER_OPERATIONAL_EVIDENCE → CURRICULUM_FEEDBACK / CURRICULUM_ALIGNMENT_EVIDENCE → HUMAN_REVIEW`

Arena receives these as evidence/contributions only, never as automatic curriculum changes.

### R4 — UDA shared contract end-to-end

`Arena UDA framework → Docente OS teacher UDA → coverage/alignment → optional teacher-confirmed evidence → Arena review`

Docente OS owns the operational/versioned UDA. Arena owns institutional framework/alignment constraints.

### R5 — Product UI

Arena:

- modern curriculum/applicability presentation;
- visible annual planning framework before UDA;
- clear provisional/approved/transitional badges;
- curriculum/process specialist surfaces only.

Docente OS:

- show curriculum baseline, coverage, gaps and revalidation state in Piano annuale;
- preserve operational freedom over sequence, activities, UDA and timing.

### R6 — Transport evaluation

Only after both directions are proven end-to-end should the project evaluate a more transparent transport than explicit local handoff. No shared database or automatic real-time synchronization is assumed.

## 9. Non-goals of the current slice

- no network synchronization;
- no shared authentication;
- no activation of school personal data;
- no automatic curriculum approval;
- no automatic mutation of Docente OS plan execution;
- no switch away from Arena `legacy-only` persistence mode;
- no UI redesign in this slice;
- no activation of the new Arena curriculum persistence domain as source of truth.

## 10. Acceptance criteria

Runtime Curriculum Binding v2 is acceptable when:

1. first-grade secondary 2026/2027 resolves to IN2025 and `APPLICABLE`;
2. second/third-grade legacy cohorts resolve to IN2012 and `TRANSITIONAL` where required;
3. the context remains `PROVISIONAL_COMPLETE` without a complete-curriculum approval;
4. revision proposals may contribute to a transition hypothesis but cannot silently become approved curriculum;
5. explicit rejected/deferred revision outcomes do not become mandatory planning requirements;
6. an empty curriculum cannot be marked `completeForPlanning`;
7. generated handoff v2 passes the canonical validator;
8. no student/personal data is introduced;
9. Arena's current storage compatibility mode remains unchanged.

## 11. Next canonical action

After this slice passes Product CI and HIM, proceed with R2: **provisional-to-approved revalidation in Docente OS**, unless human testing identifies a blocking defect in the Arena runtime projection.
