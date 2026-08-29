# ARENA-S1 — Curriculum Runtime Consolidation Spec

Date: 2026-08-29
Status: READY_FOR_IMPLEMENTATION

## Purpose

Turn the authority conclusions of ARENA-S0 into machine-testable runtime invariants without changing the product boundary or introducing AILit runtime behavior.

## Invariants to enforce

1. `PROPOSAL_DECISION != COMPLETE_CURRICULUM_APPROVAL`.
2. Runtime curriculum state defaults to `PROVISIONAL_COMPLETE` when the projected curriculum is usable for planning but no explicit complete-curriculum approval exists.
3. `APPROVED` may be emitted only from explicit complete-curriculum approval evidence bound to the projected curriculum/version/context.
4. Rejected/deferred/returned proposal outcomes cannot become mandatory planning requirements.
5. Transition remodulation remains `HYPOTHESIS` until explicit institutional approval.
6. Mandatory requirement authority remains closed to implicit promotion.
7. The projection version is deterministic over curriculum, revision evidence and approval evidence.
8. Empty mandatory coverage refuses `completeForPlanning`.

## Minimal implementation shape

Extend the Runtime Curriculum Binding input with an optional explicit approval evidence object rather than inferring approval from revision proposal decisions.

Suggested semantic shape:

```ts
interface CompleteCurriculumApprovalEvidence {
  readonly decisionRef: CmlCanonicalRef;
  readonly curriculumRef: CmlCanonicalRef;
  readonly curriculumVersionRef?: CmlCanonicalRef;
  readonly approved: true;
  readonly approvedAt: string;
}
```

The exact type may be adapted to existing domain contracts, but the semantic rule is fixed: **the evidence must identify complete-curriculum approval, not merely a proposal decision**.

## Acceptance tests

- no evidence -> `PROVISIONAL_COMPLETE`;
- proposal-level approved decision only -> still `PROVISIONAL_COMPLETE`;
- explicit complete-curriculum approval matching projection -> `APPROVED`;
- approval for another curriculum/version -> fail closed or remain provisional;
- reject/defer/return-for-revision proposal -> no mandatory requirement promotion;
- deterministic projection hash changes when valid complete-approval evidence changes state/version;
- no mandatory requirements -> projection rejected.

## Non-goals

- no UI changes;
- no persistence-mode switch;
- no new curriculum store;
- no Docente OS changes in this slice;
- no AILit implementation.

## Gate

ARENA-S1 closes only with implementation + regression tests + Product CI + HIM on the same candidate SHA.
