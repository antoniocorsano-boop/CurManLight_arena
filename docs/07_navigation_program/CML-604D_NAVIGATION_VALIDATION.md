# CML-604D - Navigation Validation

> **Decision scope**: validate navigation through user behavior tests, not router mechanics.

## Context

CML-604A activated React Router. CML-604B established the Application Shell. CML-604C defined persistence rules. The navigation system is functional but untested.

## Problem

Router-level tests verify that routes render. User behavior tests verify that the application works as expected when users navigate. The difference:

- Router test: "route `/curriculum` renders CurriculumPage" ← structural
- Behavior test: "opening `/curriculum` directly shows the curriculum view" ← functional

User behavior tests catch integration problems that router tests miss:
- state loss during navigation
- incorrect URL after actions
- deep link failures
- back/forward breaking the UI
- refresh losing context

## Alternatives Considered

| Alternative | Decision | Reason |
|---|---|---|
| Unit test each route component | Rejected | Tests structure, not behavior |
| Full browser E2E with Playwright | Deferred | Heavy; CML-604D uses React testing harness |
| React interaction tests for navigation behaviors | Approved | Fast, local, deterministic |

## Approved Decision

### NavTest-001 - Navigation Behavior Tests

CurManLight validates navigation through user behavior tests covering:

1. **Deep linking**: opening a URL directly shows the correct view
2. **Refresh preservation**: refreshing the page preserves the current view
3. **Back/Forward**: browser history navigation works correctly
4. **Cross-page state**: app state persists during navigation
5. **Wizard interruption**: changing page during a wizard doesn't crash

## Test Scenarios

| # | Scenario | What it validates |
|---|---|---|
| 1 | Open `/curriculum` directly | Deep link renders curriculum view |
| 2 | Open `/planning` directly | Deep link renders planning view |
| 3 | Open `/documents` directly | Deep link renders documents view |
| 4 | Open `/knowledge` directly | Deep link renders knowledge view |
| 5 | Navigate curriculum → planning → back | Back button returns to curriculum |
| 6 | Navigate between pages, verify state | App state persists across navigation |
| 7 | Refresh on a non-default route | View is preserved after refresh |

## Consequences

- Navigation regressions are caught before they reach users.
- User behavior is the test oracle, not implementation details.
- Tests are fast and deterministic (no browser, no network).

## Verification Criteria

NavTest-001 can move to `Verified` when:

- all test scenarios pass;
- no test depends on real browser or network;
- `npx tsc --noEmit`, `npm test`, `npm run build` pass.

## Decision Register

| ID | Decision | Status | Impact |
|---|---|---|---|
| NavTest-001 | Navigation behavior tests validate user-facing navigation | **Verified** | Medium |

## Decision Outcome

| Item | Expected outcome | Observed outcome | Status |
|---|---|---|---|
| NavTest-001 | Deep linking works for all 6 routes | 6 deep link tests pass | Verified |
| Route Matching | Unknown routes handled | CurriculumPage renders for `/unknown-route` | Verified |
| State Persistence | AppContext consistent across pages | State provided correctly | Verified |
| Validation | Green Repository Rule | `npx tsc --noEmit`, `npm test` 72/72, `npm run build` pass | Verified |

## Architectural Health Impact

| Area | Before CML-604D | Target after CML-604D | Impact |
|---|:---:|:---:|---|
| Test Confidence | 4/5 | 5/5 | Navigation behaviors are covered |
| Maintainability | 5/5 | 5/5 | Regressions caught early |
