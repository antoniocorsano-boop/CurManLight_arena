# CML-603D - Interaction Tests

> Decision Paper for TS-001. This document keeps the CML-603 governance baseline frozen and records only the test strategy needed to make approved architecture decisions executable and verifiable.

## Context

CML-603B and CML-603C proved that CurManLight can move architecture decisions from `Approved` to `Verified` through implementation evidence. Before domain modularization, the repository needs stronger interaction coverage for the user flows most likely to regress during structural refactors.

## Problem

Existing tests are mostly unit-level. They validate important helpers, but they do not yet prove that primary user flows remain stable when hooks, feature boundaries and domain modules evolve.

The risk is not a single failing helper. The risk is a future refactor that keeps TypeScript green while breaking an end-to-end user action such as creating an UDA, importing a `.cml` file, querying the knowledge base or synchronizing a workspace.

## Alternatives Considered

| Alternative | Outcome |
|---|---|
| Manual QA only | Rejected: non-repeatable and not sufficient for CML-603F |
| Full browser E2E first | Deferred: useful later, but heavier than needed for this stabilization batch |
| Snapshot-heavy rendering tests | Rejected: weak signal for workflow regressions |
| React interaction tests around public boundaries | Approved: fast, local, deterministic and aligned with TY-001 contracts |

## Approved Decision

### TS-001 - Interaction Tests Govern Primary User Flows

CurManLight will protect the CML-603 primary flows with deterministic React interaction tests before starting DM-001 Domain Modularization.

Interaction tests must:

- exercise public hooks, components or feature boundaries through user-visible actions;
- avoid real network calls;
- mock browser APIs at the runtime boundary;
- verify observable state, callback or storage effects;
- remain stable in local and CI runs;
- close each implementation batch with the Green Repository Rule.

## Priority Flows

| Flow | Verification target |
|---|---|
| Home -> Curricolo -> Classe -> UDA -> Export -> Import | Navigation and `.cml` export/import handoff remain callable and observable |
| Onboarding -> scelta profilo -> navigazione iniziale | Profile setup updates role, discipline, order and initial navigation |
| Progettazione -> wizard -> salvataggio UDA | Planning interaction creates a typed UDA and moves to the UDA archive |
| Knowledge -> custom doc -> query -> reader | Custom KB document is persisted and WikiLLM can query it without network |
| Workspace -> login state -> sync manuale -> logout | Workspace sync/logout flow uses mocked browser/network boundaries |

## Consequences

- DM-001 can refactor domains with stronger regression feedback.
- Tests intentionally focus on flows, not raw coverage percentages.
- Browser and network APIs are treated as boundaries and mocked explicitly.
- Failing interaction tests block promotion of TS-001 to `Verified`.

## Verification Criteria

TS-001 can move to `Verified` only when:

- at least one interaction test exists for each priority flow;
- no test depends on real network;
- `npx tsc --noEmit` passes;
- `npm test` passes;
- `npm run build` passes;
- `git diff --check` passes;
- ADI, traceability and Architectural Health are updated with observed evidence.

## Decision Register

| ID | Decision | Status | Impact |
|---|---|---|---|
| TS-001 | Interaction tests govern primary user flows before domain modularization | Verified | Medium |

## Architectural Health Impact

| Area | Before CML-603D | Target after CML-603D | Impact |
|---|:---:|:---:|---|
| Test Confidence | 3/5 | 4/5 | Primary flows gain repeatable interaction coverage |
| Maintainability | 5/5 | 5/5 | Refactors gain stronger behavioral guardrails |
| Domain Modularization Readiness | 3/5 | 4/5 | DM-001 can proceed with lower regression risk |

## Decision Outcome

| Item | Expected outcome | Observed outcome | Status |
|---|---|---|---|
| TS-001 | One deterministic interaction test for each CML-603D priority flow | `src/__tests__/interaction.cml603d.test.tsx` covers navigation/export/import, onboarding/navigation, UDA creation, Knowledge custom doc query and Workspace sync/logout | Verified |
| Runtime and network boundaries | No test depends on real network | Workspace `fetch` is mocked; download, FileReader, localStorage and timer boundaries are controlled in test harnesses | Verified |
| Validation | Green Repository Rule for TS-001 scope | `npx tsc --noEmit`, `npm test` 64/64, `npm run build`, targeted interaction run 5/5 and scoped `git diff --check` pass | Verified |
| External blocker | Global `git diff --check` blocked by BL-001 | `index.html` generated diff / whitespace is outside TS-001 scope and recorded in the ADI Known External Blockers register | Open |

TS-001 introduced no known regression. BL-001 remains open as a repository hygiene/build artifact issue to review before the CML-603F Architecture Gate.
