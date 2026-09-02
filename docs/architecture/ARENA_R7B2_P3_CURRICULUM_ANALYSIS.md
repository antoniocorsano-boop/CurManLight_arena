# Arena R7B2 — P3 Curriculum Analysis Runtime

**Status:** IMPLEMENTED_WITH_EXPLICIT_FIRST_CYCLE_SCOPE

## Scope

R7B2 closes the remaining runtime gap in `P3_CURRICULUM_ANALYSIS` **for the canonical D.M. 221 first cycle (primaria + secondaria)** without creating decision authority.

The scope is intentionally explicit:

- `canonicalScope = DM221_FIRST_CYCLE_ONLY`;
- `infanzia` is excluded from the R7B2/P3 gate;
- the exclusion exists because the current legacy `CurriculumMap` projects infanzia through disciplines, while the canonical D.M. 221 model uses five fields of experience;
- those legacy infanzia cells must not be counted as canonical coverage until a semantic migration to `DM221_INFANZIA_FIELDS` exists.

Canonical path:

`first-cycle curriculum baseline + structured discipline/order scope + optional explicit target↔P1 evidence bindings → deterministic findings → observations → evidence-linked issues → proposal candidates`

## Runtime contract

The analysis runtime:

- requires a concrete baseline identity, curriculum version and explicit first-cycle discipline/order scope;
- derives the complete first-cycle scope from the canonical D.M. 221/2025 discipline/order structure when used by the Referente control tower;
- computes `COVERAGE`, `GAP`, `DISCONTINUITY` and `OVERLAP` directly from the concrete `CurriculumMap`; callers do not supply pre-classified findings;
- recognizes both the concrete camelCase curriculum keys used by the current repository baseline and supported legacy aliases;
- permits structural analysis with **zero evidence bindings**: findings remain `OBSERVATION_ONLY`, with no issue or proposal candidate fabricated;
- accepts only evidence already qualified by P1 as `ELIGIBLE_EVIDENCE` for evidence-linked P3 outputs;
- requires evidence relevance to be bound explicitly to a canonical discipline/order `targetRef` and never propagates one eligible source to unrelated targets;
- leaves structurally computed findings without a target-specific evidence binding as observations only;
- rejects unknown or consult-only evidence, out-of-scope evidence bindings, duplicate bindings and empty bindings;
- rejects duplicate or non-canonical first-cycle scope targets;
- emits all findings as `OBSERVATION_ONLY`;
- creates evidence-linked issues and proposal candidates only for non-coverage findings that have an explicit eligible evidence binding;
- emits proposal candidates as `CANDIDATE_ONLY` with `authorityEffect = NONE`.

The structural analysis deliberately distinguishes presence from authority. A `COVERAGE` finding means that both traguardi and obiettivi are structurally present for the canonical first-cycle discipline/order target; it does not certify semantic correctness, normative provenance or institutional adoption.

## Referente runtime

`ReferenteControlTower` consumes the actual current `localCurriculum` propagated by `AppViewsLayer` and uses the same deterministic first-cycle structural analysis used by P3. It exposes explicit counts for:

- canonical first-cycle discipline/order targets analyzed;
- structurally covered targets;
- gaps;
- discontinuities and overlaps requiring review.

The UI labels the section **“Copertura strutturale del primo ciclo”** and states that infanzia is outside this gate until the canonical field-of-experience migration is available. It does not infer coverage from proposal labels, free text or AI output and does not present a structural count as institutional authority. Because the Referente summary is structural, it does not fabricate evidence bindings for its counts.

## R7 reality

With P3 marked implemented, all canonical runtime steps P1–P7 classify as executable **inside the declared `DM221_FIRST_CYCLE_ONLY` curriculum scope** and the machine reality gate may return `ADOPTION_FLOW_VALIDATED`.

That verdict is scope-bound. It does **not** claim coverage or completion for infanzia. The validator exposes both:

- `curriculumScope = DM221_FIRST_CYCLE_ONLY`;
- `excludedSchoolOrders = ['infanzia']`.

The verdict also means **runtime blocker closure only**. It does not satisfy the two separate R7 acceptance obligations already encoded by the validator:

1. same-SHA release validation;
2. representative human acceptance.

Therefore R7B2 must not be described as final institutional adoption validation outside the declared first-cycle scope or before those external gates are actually evidenced.

## Deferred canonical work

Infanzia remains a separate canonical migration tranche. The current repository already detects this honestly through `legacyStructureAudit.ts`: legacy discipline projections for infanzia are blocking and cannot be promoted directly to the five D.M. 221 fields of experience.

## Non-goals

No semantic migration of infanzia fields in this tranche, no autonomous semantic curriculum inference, no proposal submission, no institutional decision, no canonical adoption mutation, no deployment.
