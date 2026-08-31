# CurManLight Arena — Curriculum Adoption & Validation Development Guide v1

Status: CANONICAL DEVELOPMENT GUIDE
Date: 2026-08-31
Guide ID: CML-ARENA-CURRICULUM-ADOPTION-VALIDATION-V1
Scope: CurManLight Arena, with governed interoperability implications for Docente OS

## 1. Purpose

This document is the persistent development guide for evolving CurManLight Arena from an advanced curriculum-governance product into a complete curriculum adoption and validation system.

It converts the maturity audit into a durable implementation direction. It is not a point-in-time report and it is not itself authorization to bypass the governed execution order, routing freeze, human-validation gates, authority rules or interoperability boundary defined elsewhere in the repository.

Every agent, assistant, developer or automation working on curriculum, adoption, validation, revision, evidence, institutional decisions, baseline state or Arena ↔ Docente OS curricular interoperability must read this guide before proposing or implementing changes.

## 2. Governance precedence

This guide is subordinate to, and must be interpreted together with:

1. explicit current governance and architecture decisions;
2. `docs/architecture/INTEGRATED_PROJECT_GOVERNED_MEMORY_V1.md`;
3. `AGENTS.md`;
4. `docs/WORKING_PROTOCOL.md`;
5. `docs/architecture/SYSTEM_MATURITY_AUDIT_2026-08-30_CANONICAL.md`;
6. `docs/architecture/ARENA_A1_CANONICAL_SURFACE_FREEZE_2026-08-30.md`.

If this guide conflicts with a higher-precedence governance document, the higher-precedence rule wins and the conflict must be recorded before implementation proceeds.

## 3. Product mission

Arena must answer, with explicit provenance and human-governed authority:

- which curriculum applies;
- which curriculum baseline is currently authoritative;
- which version has been institutionally adopted;
- for which scope and period that adoption applies;
- why that adoption was made;
- which evidence supports or challenges it;
- what is currently under review;
- who may propose, review and decide;
- what changed between one baseline/adoption state and another;
- what controlled curriculum state may be handed to Docente OS or another downstream consumer;
- whether implementation evidence requires confirmation, clarification or a new revision proposal.

Arena must not become the teacher's classroom execution workspace.

## 4. Canonical end-to-end lifecycle

The target lifecycle is:

`Context -> Applicability -> Source Registry -> Curriculum Baseline -> Proposal -> Review -> Institutional Decision -> Adoption -> Controlled Handoff -> Implementation Evidence -> Validation / Periodic Review -> Confirm or Revision Proposal`

This lifecycle extends the existing canonical institutional journey without replacing its proven domain foundations.

The cycle is closed only when implementation evidence can trigger governed review without directly mutating institutional curriculum authority.

## 5. Non-negotiable semantic distinctions

The following states must remain distinct in domain, persistence, UI language, tests and interoperability contracts:

`Applicability != Approval != Baseline != Adoption != Validation`

`Proposal != Review != Institutional Decision`

`Source Verification != Normative Authority != Institutional Authority`

`Person != Role != Capability != Authority`

`Implementation Evidence != Institutional Decision`

`Docente OS Observation != Arena Canonical Write`

No implementation may collapse these states for convenience.

## 6. Existing foundations to preserve

Do not redesign speculatively the following foundations unless a reproducible defect proves that change is necessary:

- curriculum identity, version and applicability contracts;
- IN2025 transition resolver;
- proposal/version/decision separation;
- institutional authority and fail-closed capability boundary;
- curricular provenance and auditability rules;
- explicit human confirmation before consequential promotion;
- local source verification rule: local verified does not mean normative or institutional;
- Arena ↔ Docente OS ownership boundary;
- versioned curricular handoff semantics;
- same-SHA validation, release and HVA discipline;
- seven canonical Arena product surfaces frozen by A1.

## 7. Canonical Adoption Domain

Arena requires an explicit adoption domain rather than treating adoption as an implicit consequence of approval or baseline creation.

Minimum target concepts:

### 7.1 `Adoption`

Represents the institutional act by which a specific curriculum baseline is made operative for a defined scope and period.

Minimum semantics:

- immutable adoption identity;
- referenced curriculum baseline/version;
- institutional decision reference;
- adoption scope;
- effective start;
- optional effective end;
- adoption status;
- provenance and authority evidence;
- recorded timestamp;
- supersession relationship where applicable.

### 7.2 `AdoptionScope`

Defines where the adoption applies.

It must be capable of representing, without assuming one fixed school structure:

- institution/workspace;
- school year;
- educational level/grade where relevant;
- discipline/area where relevant;
- other governed applicability dimensions required by the curriculum model.

Applicability answers what should apply under normative/institutional rules. AdoptionScope answers what the institution has actually adopted for operation.

### 7.3 Adoption state

A candidate state model must support at least the semantic distinctions equivalent to:

`PROPOSED -> DECIDED -> ACTIVE -> UNDER_REVIEW -> SUPERSEDED / EXPIRED`

Exact enum names are an implementation decision, but the lifecycle distinctions are mandatory.

Approval of a revision must never automatically imply `ACTIVE` adoption unless an explicit governed rule authorizes that exact combined transaction.

## 8. Canonical Validation Domain

Validation is a governed assessment of whether an adopted curriculum remains appropriate, coherent, applicable and supportable by available evidence.

Minimum target concepts:

### 8.1 `ValidationReview`

Must bind:

- target adoption or curriculum baseline;
- review scope;
- review trigger;
- evidence references;
- reviewer/authority context;
- findings;
- human decision/result;
- timestamps and provenance.

### 8.2 Validation states

The model must distinguish semantic outcomes equivalent to:

- `NOT_EVALUATED`;
- `UNDER_REVIEW`;
- `VALIDATED`;
- `VALIDATED_WITH_CONDITIONS`;
- `REVISION_REQUIRED`;
- `SUPERSEDED`.

An active adoption may be under review without becoming invalid merely because review has started.

### 8.3 Periodic review

An adoption must be able to carry review policy metadata such as:

- `effectiveFrom`;
- optional `effectiveUntil`;
- `reviewDueAt`;
- review policy/cadence where institutionally meaningful;
- current review state.

The model must support annual or policy-driven review without forcing unnecessary bureaucracy into the UI.

## 9. Evidence model

Arena already has strong source provenance. The same evidence discipline must extend to adoption and validation.

Evidence classes may include, without requiring separate physical stores for each type:

- normative/source evidence;
- curricular evidence;
- adoption evidence;
- implementation evidence;
- human observations;
- validation evidence.

Every consequential decision must be able to answer:

- what evidence was considered;
- where that evidence came from;
- what its authority/verification state was;
- which decision or review used it.

Evidence may support a proposal or review but must never become a decision automatically.

## 10. Review triggers

Review must be event-driven and human-governed rather than dependent only on manually opening a revision screen.

Candidate triggers include:

- new or changed normative source;
- changed applicability;
- new authoritative institutional source;
- adoption expiry or scheduled review date;
- implementation issue;
- recurring coverage problem;
- inconsistency between adopted baseline and application context;
- department/teacher clarification request;
- human observation judged relevant;
- explicit institutional request for review.

A trigger creates or contributes to a review candidate. It does not mutate the adopted baseline.

## 11. Institutional Decision Ledger

Arena must converge toward a single auditable record of consequential institutional decisions.

A canonical decision record must be able to preserve at least:

- decision identity;
- subject/reference;
- decision type;
- actor/person reference;
- capability/authority evidence;
- evidence references;
- previous state;
- resulting state;
- effective date where relevant;
- recorded timestamp;
- provenance/event history.

The structured revision/decision domain is the target source of truth. Legacy `decisions/customTexts` semantics may survive only as migration or compatibility adapters and must not remain a competing user-facing decision model.

## 12. Arena ↔ Docente OS adoption/validation loop

Canonical outbound direction remains:

`Arena adopted curriculum baseline -> versioned governed handoff -> Docente OS teacher intake/revalidation`

The return direction may contain evidence and proposals, never silent authority mutation.

Allowed target categories from Docente OS to Arena include concepts equivalent to:

- `CurriculumCoverageObservation`;
- `ImplementationIssue`;
- `ClarificationRequest`;
- `RevisionSuggestion`;
- other explicitly governed evidence envelopes.

These events may create evidence or a review candidate in Arena.

They must not:

- mark curriculum institutionally approved;
- activate an adoption;
- change an Arena baseline;
- bypass proposal/review/decision authority;
- create shared-database coupling between the two products.

## 13. Product projection: no new primary Process surface

The adoption and validation lifecycle must be projected through the already frozen canonical surfaces rather than creating a second process product.

### Home

Must evolve toward answering:

- current adopted curriculum state;
- scope and school year;
- current review status;
- unresolved institutional actions;
- relevant changed sources/applicability;
- next meaningful human task.

### Curricolo

Must show:

- applicable framework;
- current authoritative/adopted baseline;
- contents;
- what changed;
- relationship between applicability, baseline and adoption.

### Fonti

Must become the canonical Source Registry for identity, version, provenance, verification, authority, applicability and linked curriculum content.

### Revisione

Must become the sole user-facing decision workspace for proposal, evidence review, institutional decision and resulting baseline/adoption effects.

### Conoscenza

May support evidence exploration and understanding but must never become a second source of curriculum authority.

### Documenti / Handoff

Must export or hand off explicit baseline/adoption/authority/provenance state without implying that export itself creates approval or adoption.

### Guida

Must eventually explain the lifecycle in human-task language after the underlying domain and surface consolidation is stable.

## 14. Development program

The adoption/validation evolution is organized into the following durable tranches.

### AD-0 — Adoption & Validation Domain Contract

Goal: freeze the domain semantics before product mutation.

Must define:

- Adoption;
- AdoptionScope;
- ValidationReview;
- ReviewTrigger;
- ImplementationEvidence envelope;
- InstitutionalDecisionRecord relationship;
- authority invariants;
- interoperability invariants;
- lifecycle/state-machine rules.

Exit candidate:

`ARENA_AD0_DOMAIN_CONTRACT_FROZEN`

AD-0 is documentation/domain-contract work and must not silently change routes, UI authority or persistence source of truth.

### AD-1 — Decision -> Baseline -> Adoption separation

Goal: make approval, resulting baseline and institutional adoption explicit and independently traceable.

Required closure:

- one structured decision source of truth;
- baseline creation/supersession traceability;
- explicit adoption record and scope;
- no implicit approval-to-adoption collapse;
- migration/compatibility treatment for legacy decision semantics.

Exit candidate:

`ARENA_AD1_ADOPTION_CANONICAL`

### AD-2 — Evidence & Review Loop

Goal: close the feedback loop without automatic authority mutation.

Required closure:

- review triggers;
- evidence envelopes;
- periodic review semantics;
- Docente OS return evidence contract;
- evidence-to-review linkage;
- fail-closed authority boundary for consequential outcomes.

Exit candidate:

`ARENA_AD2_VALIDATION_LOOP_CANONICAL`

### AD-3 — Canonical Product Projection

Goal: expose adoption/validation states in the seven frozen surfaces using human-task language.

Required closure:

- Home gives current adoption/review status and next task;
- Curricolo distinguishes applicability, baseline and adoption;
- Fonti is the canonical source registry;
- Revisione is the single decision workspace;
- no autonomous duplicate `Processo` governance model;
- no broad teacher operational authoring reintroduced into Arena.

Exit candidate:

`ARENA_AD3_PRODUCT_PROJECTION_PASS`

### AD-4 — Human Adoption & Validation Acceptance

Goal: prove the model is understandable and usable by humans on immutable deployed release evidence.

Minimum Human Tasks to validate:

1. identify which curriculum is currently adopted;
2. identify the scope for which it is adopted;
3. understand why it applies and which sources support it;
4. distinguish an open review from a changed baseline;
5. understand who can decide and what happens without authority;
6. inspect evidence behind a proposed change;
7. understand the downstream handoff without confusing it with institutional approval;
8. understand that implementation evidence may trigger review but not automatic curriculum mutation.

Exit candidate:

`ARENA_AD4_HUMAN_ACCEPTANCE_PASS`

## 15. Execution-order rule

AD-0 through AD-4 define the target development program; their numbering does not authorize bypassing the currently governed Arena stabilization sequence.

Before starting any tranche, verify:

- current `main` SHA;
- current integrated governed memory;
- active Arena stabilization phase;
- routing/architecture freeze status;
- required Architecture Decision, if any;
- required Human Task/HIM/HVA gates;
- compatibility with Docente OS boundary.

If a tranche is conceptually next but not yet authorized by the governed sequence, record it as `PREPARED_BLOCKED_PROMOTION` rather than implementing prohibited mutations.

## 16. Development decision test

Every proposed feature or change in this domain must answer all of the following before implementation:

1. Which lifecycle step does it serve?
2. Which human task does it improve?
3. Which canonical entity/state does it read or write?
4. Does it preserve Applicability / Approval / Baseline / Adoption / Validation distinctions?
5. What evidence and provenance are preserved?
6. Who has authority to perform the consequential transition?
7. Does missing authority fail closed?
8. Does the change duplicate an existing Arena surface or Docente OS capability?
9. Does it introduce a second source of truth?
10. How will the behavior be validated on the same immutable release humans use?

A proposal that cannot answer these questions is not ready for implementation.

## 17. Anti-patterns

Do not implement:

- a generic `Valida` button without a review object and authority context;
- automatic adoption after proposal approval;
- automatic institutional approval from AI, browser automation, imported files or Docente OS observations;
- a second independent Process workflow that duplicates Revision;
- adoption status inferred solely from an exported document;
- local source verification presented as normative or institutional authority;
- teacher operational lesson/UDA execution inside Arena;
- shared mutable curriculum state between Arena and Docente OS;
- hidden state transitions without auditable decision records;
- review processes that invalidate an active adoption merely because review has begun.

## 18. Persistent resumption rule

For future Arena development sessions involving curriculum governance, adoption or validation:

1. read `AGENTS.md`;
2. read `docs/architecture/INTEGRATED_PROJECT_GOVERNED_MEMORY_V1.md`;
3. read this guide;
4. re-check live `main` and active governance/gates;
5. determine the current AD tranche and whether it is authorized;
6. resume only from the first incomplete authorized exit condition;
7. never infer completion from conversation history alone.

## 19. Target maturity definition

Arena can be considered a complete curriculum adoption and validation system only when it can prove end to end:

`authoritative/applicable sources -> governed curriculum baseline -> explicit institutional decision -> scoped adoption -> controlled handoff -> implementation evidence -> human-governed validation/review -> confirmation or new revision proposal`

with provenance, authority, auditability, human confirmation and cross-system boundaries preserved at every consequential transition.

Until this chain is operational and human-validated, Arena may be mature as a curriculum-governance domain but must not be described as a fully closed curriculum adoption and validation system.
