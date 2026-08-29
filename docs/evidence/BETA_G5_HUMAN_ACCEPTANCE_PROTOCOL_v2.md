# CurManLight Arena — BETA-G5 Human Interaction Acceptance Protocol v2

Status: `CANONICAL_RELEASE_NEUTRAL_PROTOCOL`
Gate: `BETA-G5 — Human Interaction Acceptance`
Pass label: `BETA_HIA_PASS`

## Purpose

This protocol defines how human interaction acceptance is executed for an immutable published Arena release. It is intentionally release-neutral: a release SHA is supplied only when a concrete human-review session is opened.

Automation may prepare states, verify reachability and collect browser evidence. It must never issue the human verdict or fabricate an authorized institutional decision path.

## Release binding

A G5 session is valid only when all of the following identify the same immutable release:

1. the candidate commit selected for `Deploy Arena Beta`;
2. the SHA resolved by the deploy workflow;
3. the published `beta-release.json` `releaseSha`;
4. automated browser evidence used by the session;
5. the completed human-acceptance receipt `releaseSha`.

A receipt copied from the template must not be marked PASS while `releaseSha` is unset or while the published Beta identifies another commit.

## Frozen Beta-critical Human Tasks

1. `HT-BETA-CURRICULUM-CONTEXT`
2. `HT-BETA-REVISION-PREPARE`
3. `HT-REVISION-DECISION`
4. `HT-BETA-PLANNING-HANDOFF`

Canonical journey:

`curriculum context → revision inspection/preparation → institutional decision boundary → resulting curriculum baseline → planning handoff`

The Human Task definitions in `.human/tasks` remain the task contracts. This protocol does not redefine their domain semantics.

## Required devices

### Desktop

Use the published Beta in a normal desktop browser. Normal completion must not require developer tools or implementation knowledge.

### Mobile

Use the same release in a normal mobile browser. Baseline viewport class: approximately `390 × 844`.

## Required observation dimensions

For every safely observable task/state assess:

- orientation;
- evident primary action;
- task-oriented language;
- understandable status;
- evidence/provenance inspectability;
- authority clarity;
- consequence clarity;
- recovery;
- refresh/re-entry continuity;
- mobile comfort.

A technically executable task is not automatically human-accepted.

## Task acceptance obligations

### HT-BETA-CURRICULUM-CONTEXT

The reviewer must be able to understand the applicable curriculum framework, applicability/state and provenance; invalid or incomplete context must fail closed and expose recovery.

### HT-BETA-REVISION-PREPARE

The reviewer must be able to inspect proposal purpose, status, rationale/evidence and responsibility without confusing a proposal with an institutional decision. Missing requirements and unauthorized/read-only states must be understandable and recoverable.

### HT-REVISION-DECISION

The no-authority path must remain observable and fail closed. When a bounded authorized path is genuinely available, evidence/consequence, explicit outcome choice, deliberate human confirmation and receipt/re-entry must be reviewed. Authority must never be fabricated merely to complete acceptance.

### HT-BETA-PLANNING-HANDOFF

The reviewer must understand what is handed downstream, its provenance and approval state, that invalid/provisional material is not silently final, and that downstream teacher work is not mutated automatically. Handoff must require an explicit human action and blocked states must expose recovery.

## Cross-state coverage

Where safely observable, record human evidence for:

- empty;
- loading;
- success;
- blocked;
- error;
- recovery.

`NOT_OBSERVABLE` is not PASS and requires a reason.

## Verdict rule

`BETA_HIA_PASS` may be recorded only when:

1. desktop and mobile human review are complete;
2. every required safely observable item is PASS;
3. no item is BLOCK;
4. any consequential `NOT_OBSERVABLE` item has an explicit reason and does not conceal an actually available required path;
5. proposal, authority, decision, curriculum state and planning handoff remain semantically distinct;
6. the receipt identifies exactly the deployed `releaseSha`;
7. no severity-1 or severity-2 human-interaction finding remains open.

If consequential authorized-decision observations remain legitimately unavailable, use `PARTIAL_HUMAN_EVIDENCE` unless current human evidence on the same interaction contract is explicitly adopted by the human reviewer.

## Non-claims

- G5 does not satisfy the separate G6 accessibility acceptance.
- Automated browser evidence does not substitute for human review.
- A missing/revoked institutional membership must not be fabricated.
- This protocol itself is not evidence that a review occurred.

## Completion artifact

Copy `docs/evidence/BETA_G5_HUMAN_ACCEPTANCE_RECEIPT_TEMPLATE_v2.json` into a release-specific receipt, set the exact deployed SHA, complete observations during the actual session and record the human verdict only after review.
