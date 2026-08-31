# Arena AD-0 — Adoption & Validation Domain Contract v1

Status: PREPARED_BLOCKED_PROMOTION
Date: 2026-08-31
Contract ID: ARENA-AD0-ADOPTION-VALIDATION-V1
Base: `main@85c67ae02182200ab0831feadfbf4c3ff808d9ec`

## Purpose

Freeze the minimum domain semantics required to evolve Arena from curriculum governance into a complete curriculum adoption and validation system without mutating routes, UI, persistence authority or the Arena ↔ Docente OS product boundary.

## Governance state

Arena S3 human-validation closure is not yet evidenced as `BETA_HIA_PASS` on the current governed memory. Therefore AD-0 may be prepared as a non-mutating domain contract, but promotion to later AD tranches remains blocked by the governed execution order.

This tranche introduces no route, no product surface, no storage migration, no institutional authority path and no runtime interoperability write.

## Canonical entities

The implementation contract is exported from `src/domain/adoption/` and defines:

- `Adoption`;
- `AdoptionScope`;
- `ValidationReview`;
- `ReviewTrigger`;
- `ImplementationEvidenceEnvelope`;
- `InstitutionalDecisionRecord`;
- authority evidence references;
- adoption and validation lifecycle states.

## Mandatory distinctions

The following remain separate and may not be collapsed:

`Applicability != Approval != Baseline != Adoption != Validation`

`Proposal != Review != Institutional Decision`

`Implementation Evidence != Institutional Decision`

`Docente OS Observation != Arena Canonical Write`

## Adoption lifecycle

Candidate transition graph:

`PROPOSED -> DECIDED -> ACTIVE`

`ACTIVE -> UNDER_REVIEW -> ACTIVE`

`ACTIVE/UNDER_REVIEW -> SUPERSEDED | EXPIRED`

There is deliberately no `PROPOSED -> ACTIVE` transition.

An active adoption entering review remains operational unless a separately authorized institutional decision changes its state.

## Validation lifecycle

Candidate transition graph:

`NOT_EVALUATED -> UNDER_REVIEW`

`UNDER_REVIEW -> VALIDATED | VALIDATED_WITH_CONDITIONS | REVISION_REQUIRED | SUPERSEDED`

Validated outcomes may later reopen into `UNDER_REVIEW` when a new governed trigger exists.

A validation outcome requires reviewer authority evidence. Opening a review does not itself require decision authority.

## Evidence boundary

`ImplementationEvidenceEnvelope` carries `authorityClaim: 'NONE'` by contract.

Evidence returned from Docente OS may support a review trigger, finding or proposal. It cannot:

- approve curriculum;
- activate adoption;
- alter an Arena baseline;
- issue an institutional validation result;
- bypass revision/decision authority.

## Relationship to existing revision domain

AD-0 does not replace `src/domain/revision/`.

The intended future relationship is:

`RevisionProposal -> Institutional Decision -> Curriculum Baseline -> Adoption`

and later:

`Implementation Evidence -> ReviewTrigger -> ValidationReview -> Confirm / RevisionProposal`

AD-1 will decide the precise integration and migration boundary. AD-0 intentionally avoids persistence and UI integration.

## Fail-closed validation rules

The contract validator requires:

- baseline and curriculum version references for adoption;
- explicit institutional decision reference;
- institution and school-year scope;
- authority evidence and provenance before an adoption is considered valid;
- provenance and payload references for implementation evidence;
- at least one trigger and evidence reference for validation review;
- reviewer authority before recording a validation outcome or resulting decision.

## Exit assessment

AD-0 contract completeness requires all of the following:

- domain entities frozen;
- state transitions explicit;
- authority invariants testable;
- Docente OS evidence non-authority enforced;
- no runtime/persistence/UI mutation;
- focused tests green;
- applicable same-SHA repository gates green.

Candidate exit label after gates:

`ARENA_AD0_DOMAIN_CONTRACT_FROZEN`

Until the governed S3 sequence authorizes subsequent work, the tranche status remains:

`PREPARED_BLOCKED_PROMOTION`
