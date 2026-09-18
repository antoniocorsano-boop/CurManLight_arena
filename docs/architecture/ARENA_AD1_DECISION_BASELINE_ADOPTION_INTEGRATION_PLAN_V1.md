# Arena AD-1 — Decision → Baseline → Adoption Integration & Migration Plan v1

Status: PREPARED_BLOCKED_PROMOTION
Date: 2026-08-31
Plan ID: ARENA-AD1-DECISION-BASELINE-ADOPTION-V1
Base: `main@0d9fe4ca946d8175564d25fd51f8a464ace30613`
Depends on: `ARENA_AD0_DOMAIN_CONTRACT_FROZEN`

## Purpose

Prepare the integration and migration boundary for AD-1 without yet mutating Arena routing, product surfaces, persistence source of truth, runtime authority paths or deployed Beta behavior.

AD-1 exists to make the following chain explicit and independently auditable:

`RevisionProposal -> Institutional Decision -> Curriculum Baseline -> Adoption`

The chain must never collapse approval, baseline creation and adoption into one implicit state transition.

## Governance constraint

The integrated governed memory still places `ARENA-S3 human validation closure` in progress and blocks later stabilization work until S3 closes or governance is explicitly amended.

Therefore this document freezes the AD-1 implementation plan only.

It does not authorize:

- schema/storage migration;
- UI or routing changes;
- canonical write-path changes;
- creation of active adoption records at runtime;
- automatic conversion of historical `approved` values into institutional adoption;
- Docente OS write-back;
- `ARENA_AD1_ADOPTION_CANONICAL` promotion.

## Existing revision-domain assessment

### Structured proposal and decision domain

`src/domain/revision/` already provides structured, versioned proposals, decisions, effects and event history.

This domain should remain the upstream decision source rather than being replaced by a parallel adoption workflow.

### Current `Decision` authority limitation

The existing `Decision` stores a `DecisionAuthority` containing a declared role such as docente, dipartimento, dirigente or collegio.

A declared role is not sufficient evidence of institutional authority under the governed rule:

`Person != Role != Capability != Authority`

AD-1 must therefore introduce an explicit bridge from an eligible structured `Decision` to an `InstitutionalDecisionRecord` carrying `AuthorityEvidenceRef` from AD-0.

No existing `Decision` may be promoted merely because `authority.declaredRole` is populated.

### Current decision-effect semantics

`src/domain/revision/decisionEffects.ts` already states that a planned or locally applied decision effect:

- does not modify canonical curriculum content;
- does not create official content;
- does not declare the effect institutionally adopted.

AD-1 must preserve this invariant.

`applied-local != baseline promotion != adoption`.

### Legacy decision semantics

`src/domain/revision/legacyAdapter.ts` maps historical `approved`, `rejected` and `custom` values into structured legacy decisions.

Those imported decisions have historical/compatibility value only.

They must not be interpreted as proof of:

- institutional authority;
- canonical baseline creation;
- active adoption;
- effective institutional scope.

Legacy compatibility remains read/adapt/migrate only until explicit human-governed evidence upgrades a record.

## Canonical target relationship

AD-1 must converge on the following authority-preserving sequence:

1. `RevisionProposalVersion` is frozen.
2. A structured `Decision` is recorded.
3. Decision eligibility for institutional promotion is assessed.
4. Explicit capability/authority evidence is resolved.
5. An `InstitutionalDecisionRecord` is created.
6. If the decision outcome changes authoritative curriculum content, a new immutable `CurriculumBaselineRecord` is materialized or an existing baseline is explicitly retained.
7. Adoption is created only through a separately explicit adoption act/state transition.
8. Adoption scope and effective period are recorded.
9. Controlled handoff may read the resulting baseline/adoption state.

No step may infer the next consequential step solely from the previous status name.

## Candidate `CurriculumBaselineRecord` semantics

AD-1 should introduce or map to one canonical baseline record with at least:

- `baselineId`;
- `curriculumVersionRef`;
- `institutionalDecisionRef`;
- optional `previousBaselineRef`;
- immutable structural/content footprint;
- source/provenance references;
- creation timestamp;
- authority state;
- supersession relationship where applicable.

A baseline is the authoritative curriculum snapshot resulting from a governed decision.

A baseline is not an adoption.

The implementation should reuse existing curriculum identity/version primitives where possible rather than creating a second curriculum content store.

## Decision eligibility classification

Before any structured `Decision` can create or retain a canonical baseline, AD-1 must classify it into one of these categories:

### `INSTITUTIONALLY_ELIGIBLE`

Requires all of:

- non-legacy structured decision;
- resolvable frozen proposal version;
- explicit outcome and rationale;
- source/evidence provenance sufficient for the decision type;
- explicit actor/person binding where required;
- explicit capability/authority evidence;
- compatible institutional context/scope;
- no revoked/superseded state.

### `LOCAL_ONLY`

A structured decision may be useful locally but lacks institutional authority evidence or sufficient institutional context.

It cannot create an authoritative baseline or adoption.

### `LEGACY_UNVERIFIED`

Imported historical semantics from `decisions/customTexts` or other compatibility sources.

It remains historical evidence only.

### `BLOCKED_INCOMPLETE`

The record lacks required proposal version, rationale, provenance, actor, context or authority evidence.

Promotion fails closed.

## Decision outcome → baseline effect

AD-1 must not treat every recorded decision as creating a new baseline.

Candidate rules:

- `approve` -> may materialize a new baseline when the approved proposal changes authoritative content;
- `approve-with-changes` -> requires a frozen resulting proposal/version before baseline materialization;
- `reject` -> no new baseline;
- `defer` -> no new baseline;
- `return-for-revision` -> no new baseline;
- `record-only` -> no new baseline unless a separately governed decision type explicitly states otherwise.

Whether a new baseline is required must be derived from the governed resulting content footprint, not merely from the decision outcome label.

## Baseline → adoption separation

A successfully materialized baseline must not automatically become adopted.

Required separation:

`InstitutionalDecisionRecord -> CurriculumBaselineRecord`

then, independently:

`CurriculumBaselineRecord -> Adoption(PROPOSED) -> Adoption(DECIDED) -> Adoption(ACTIVE)`

Activation requires:

- explicit adoption decision/reference;
- adoption scope;
- school year or governed period;
- `effectiveFrom`;
- authority evidence;
- provenance.

The AD-0 transition invariant forbidding `PROPOSED -> ACTIVE` remains mandatory.

## Migration strategy

Migration must be additive, reversible and fail closed.

### Phase M1 — Inventory only

Classify existing data without writing new canonical state:

- structured non-legacy decisions;
- locally recorded effects;
- legacy decisions;
- orphan/missing proposal-version references;
- records with or without authority/context evidence.

Output is a migration report, not a mutation.

### Phase M2 — Compatibility projection

Expose a read-only projection from existing revision records into AD-1 eligibility classes.

No baseline or adoption is created.

### Phase M3 — Institutional decision bridge

For records with explicit authority evidence, create/derive `InstitutionalDecisionRecord` through an auditable migration command or human-confirmed transaction.

Historical role declaration alone is insufficient.

### Phase M4 — Baseline materialization

Materialize canonical baseline records only from eligible institutional decisions and frozen resulting content.

Existing authoritative baseline data must be reconciled rather than duplicated.

### Phase M5 — Adoption initialization

Create adoption records only when scope, period and institutional adoption authority are explicitly known.

For historical states where adoption cannot be proved, preserve `UNKNOWN/NOT_RECORDED` semantics rather than inventing `ACTIVE`.

## Legacy treatment

The legacy `decisions/customTexts` model must become a compatibility edge, not a competing source of truth.

Rules:

- do not delete legacy data during initial AD-1 migration;
- do not surface legacy approval as institutional adoption;
- preserve original values and provenance;
- expose migration warnings where authority/evidence are missing;
- allow explicit human-governed reconciliation into structured records;
- stop new canonical writes to legacy semantics once the AD-1 write path is authorized and proven;
- retire user-facing dependence on legacy semantics only after migration evidence and HVA support it.

## Repository/source-of-truth target

Target ownership after AD-1 promotion:

- `src/domain/revision/` -> proposals, proposal versions, structured review/decision source;
- Institutional Decision Ledger -> canonical consequential institutional decision record;
- curriculum baseline domain -> authoritative resulting curriculum snapshot/version binding;
- `src/domain/adoption/` -> scoped adoption lifecycle;
- legacy adapter -> compatibility/migration only.

There must be no second user-facing decision workflow.

## Planned implementation slices

These slices are ordered but are not authorized merely by this plan.

### AD-1A — Eligibility & bridge contract

Pure domain/read-only logic:

- classify structured decisions;
- require explicit authority evidence;
- map eligible records to candidate `InstitutionalDecisionRecord`;
- prove legacy/local decisions cannot promote.

### AD-1B — Baseline derivation contract

Pure domain logic first:

- define baseline identity/footprint;
- determine when a decision creates, retains or supersedes a baseline;
- enforce frozen resulting content.

### AD-1C — Persistence migration

Only after governance authorization:

- canonical storage/repository for institutional decisions, baselines and adoption;
- additive migration;
- rollback/reconciliation rules;
- no silent legacy promotion.

### AD-1D — Canonical write integration

Only after storage and authority gates:

- explicit transaction from decision to baseline;
- separate explicit adoption transaction;
- event/audit records;
- fail-closed errors.

### AD-1E — Product projection preparation

No new top-level surface.

Future UI changes must project through Revisione, Curricolo, Home and Documenti/Handoff only, and belong to the authorized product-projection phase.

## Required tests before AD-1 promotion

At minimum:

1. declared role without authority evidence cannot promote;
2. legacy `approved` cannot create adoption;
3. `recorded-local` decision cannot imply institutional baseline;
4. `applied-local` effect cannot imply adoption;
5. rejected/deferred/returned decision cannot create a new authoritative baseline;
6. approve-with-changes requires a frozen resulting version;
7. baseline creation preserves provenance and structural footprint;
8. baseline creation does not activate adoption;
9. adoption activation requires scope, effective date and authority evidence;
10. missing authority/context/provenance fails closed;
11. migration is idempotent and does not duplicate canonical records;
12. legacy data remains recoverable until explicit retirement.

## Human-task implications

When AD-1 is eventually projected into the product, a human must be able to answer without knowing internal identifiers:

- What was proposed?
- What was institutionally decided?
- What curriculum baseline resulted?
- Is that baseline actually adopted?
- For whom/where/when is it adopted?
- Who had authority to decide?
- Which evidence supports the decision?
- What happens if adoption authority is missing?

The UI must never present these as one generic “approved” state.

## Promotion gate

This plan may be considered prepared when:

- existing revision and legacy semantics are mapped;
- target source-of-truth boundaries are frozen;
- migration classes are explicit;
- no prohibited runtime/UI/persistence mutation is introduced;
- repository gates on the plan SHA are green.

Prepared exit label:

`ARENA_AD1_INTEGRATION_PLAN_FROZEN`

Formal AD-1 product/domain promotion remains:

`ARENA_AD1_ADOPTION_CANONICAL`

and remains blocked until Arena S3 closes or the integrated governed execution order is explicitly amended.
