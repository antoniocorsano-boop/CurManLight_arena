# Arena R7B2 — P3 Curriculum Analysis Runtime

**Status:** IMPLEMENTATION_IN_PROGRESS

## Scope

R7B2 closes the remaining runtime gap in `P3_CURRICULUM_ANALYSIS` without creating decision authority.

Canonical path:

`curriculum baseline + structured discipline/order scope + P1 eligible evidence → deterministic findings → observations → evidence-linked issues → proposal candidates`

## Runtime contract

The analysis runtime:

- requires a concrete baseline identity, curriculum version and explicit discipline/order scope;
- derives the whole-school scope from the canonical D.M. 221/2025 discipline/order structure when used by the Referente control tower;
- computes `COVERAGE`, `GAP`, `DISCONTINUITY` and `OVERLAP` directly from the concrete `CurriculumMap`; callers do not supply pre-classified findings;
- accepts only evidence already qualified by P1 as `ELIGIBLE_EVIDENCE` for evidence-linked P3 outputs;
- rejects unknown or consult-only evidence;
- rejects duplicate or non-canonical scope targets;
- emits all findings as `OBSERVATION_ONLY`;
- creates issues and proposal candidates only for non-coverage findings;
- emits proposal candidates as `CANDIDATE_ONLY` with `authorityEffect = NONE`.

The structural analysis deliberately distinguishes presence from authority. A `COVERAGE` finding means that both traguardi and obiettivi are structurally present for the canonical discipline/order target; it does not certify semantic correctness, normative provenance or institutional adoption.

## Referente runtime

`ReferenteControlTower` now consumes the concrete curriculum baseline and uses the same deterministic structural analysis used by P3. It exposes explicit counts for:

- canonical discipline/order targets analyzed;
- structurally covered targets;
- gaps;
- discontinuities and overlaps requiring review.

The view does not infer coverage from proposal labels, free text or AI output and does not present a structural count as institutional authority.

## R7 reality

With P3 marked implemented, all canonical runtime steps P1–P7 classify as executable and the machine reality gate may return `ADOPTION_FLOW_VALIDATED`.

This verdict means **runtime blocker closure only**. It does not satisfy the two separate R7 acceptance obligations already encoded by the validator:

1. same-SHA release validation;
2. representative human acceptance.

Therefore R7B2 must not be described as final institutional adoption validation until those external gates are actually evidenced.

## Non-goals

No autonomous semantic curriculum inference, no proposal submission, no institutional decision, no canonical adoption mutation, no deployment.