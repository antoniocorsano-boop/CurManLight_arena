# CML-603B - Utility Layer Consolidation

> **Decision scope**: define and implement the canonical Shared Utility Layer for CurManLight.

## Context

CurManLight has completed the React migration phase and is now in architectural stabilization. The repository currently contains duplicated shared utilities under both `src/lib` and `src/utils`.

TypeScript, tests, build, and audit are stable, so CML-603B is the first governance milestone that intentionally modifies code to implement an approved architecture decision.

## Problem

The project cannot keep two equivalent shared utility locations without creating long-term ambiguity.

The problem is not the directory name. The problem is the absence of a clear contract:

- where official shared utilities live;
- which layers may depend on them;
- which helpers are domain-specific and should not be shared;
- how tests and future code select the canonical import path.

## Utility Inventory

| Utility | Current locations | Current usage | Destination | Rationale |
|---|---|---|---|---|
| `clipboard` | `src/lib/clipboard.ts`, `src/utils/clipboard.ts` | App, Second Brain, tests | `src/lib/clipboard.ts` | Shared browser utility, domain-independent |
| `escapeHtml` | `src/lib/escapeHtml.ts`, `src/utils/escapeHtml.ts` | Tests, document/HTML safety helpers | `src/lib/escapeHtml.ts` | Shared string safety utility |
| `semanticSearch` | `src/lib/semanticSearch.ts`, `src/utils/semanticSearch.ts` | Tests, wiki/knowledge helpers | `src/lib/semanticSearch.ts` | Shared text utility, domain-independent |
| `storage` | `src/lib/storage.ts`, `src/utils/storage.ts` | Hooks, Copilot setup, tests | `src/lib/storage.ts` | Shared browser storage boundary |
| `wikiLLM` | `src/lib/wikiLLM.ts`, `src/utils/wikiLLM.ts` | Runtime and tests | `src/lib/wikiLLM.ts` | Shared knowledge/LLM utility used across runtime and tests |

All duplicate files are byte-identical at the start of CML-603B.

## Alternatives Considered

| Alternative | Decision | Reason |
|---|---|---|
| Keep both `src/lib` and `src/utils` | Rejected | Preserves ambiguity and weakens governance |
| Move everything to `src/utils` | Rejected | Existing runtime already uses `src/lib` as the broader shared library layer |
| Keep temporary re-export files in `src/utils` | Rejected for this milestone | Import surface is small enough to migrate directly |
| Use `src/lib` as canonical shared utility layer | Approved | Matches current exports and keeps shared, domain-independent code in one place |

## Approved Decision

### UT-001 - Shared Utility Layer

`src/lib` is the canonical shared utility layer for CurManLight.

Rules:

1. `src/lib` contains only shared utilities that are independent from a specific product domain.
2. Utilities in `src/lib` must not import React components.
3. Utilities in `src/lib` must not know Zustand stores, routing, or UI composition.
4. Domain-specific utilities live inside their owning domain under `src/features/<domain>/`.
5. Tests must import shared utilities from the canonical `src/lib` path.
6. New shared utilities require an explicit reason to be shared; otherwise they start inside the owning domain.

## Consequences

- `src/utils` is deprecated as a shared utility location and removed when no canonical imports depend on it.
- Existing imports from `src/utils` are migrated to `src/lib`.
- Future reviews can reject new `src/utils` utilities unless a later decision changes this contract.
- The shared layer remains a thin technical boundary, not a catch-all domain layer.

## Migration Strategy

1. **Census**: identify duplicated utilities and classify destination.
2. **Consolidation**: update runtime and tests to import from `src/lib`.
3. **Compatibility**: skip temporary re-exports because all call sites can be migrated in one change.
4. **Removal**: delete duplicate `src/utils` files after import migration.

## Verification Criteria

UT-001 is verified when:

- no source import points to `src/utils`;
- no duplicated utility files remain under `src/utils`;
- tests use canonical `src/lib` imports;
- `npx tsc --noEmit` passes;
- `npm test` passes;
- `npm run build` passes.

## Decision Register

| ID | Decision | Status | Impact |
|---|---|---|---|
| UT-001 | `src/lib` is the canonical shared utility layer | Verified | High |

## Architectural Health Impact

| Area | Before CML-603B | After CML-603B | Impact |
|---|:---:|:---:|---|
| Modularita | 3/5 | 4/5 | Removes duplicate shared layer |
| Developer Experience | 4/5 | 5/5 | Provides one canonical import path |
| Utility Layer | 2/5 | 5/5 | Establishes and verifies the canonical shared layer |
| Maintainability | 3/5 | 4/5 | Removes duplicated utility ownership |
| Type Safety | 2/5 | 2/5 | No direct type-boundary change |
| Domain Separation | 4/5 | 4/5 | Establishes the rule for future domain utilities |


## Decision Outcome

### UT-001

| Field | Outcome |
|---|---|
| Expected outcome | One canonical shared utility layer |
| Observed outcome | `src/lib` is the only shared utility layer used by source imports |
| Code change | `src/utils` removed after migrating imports to `src/lib` |
| Duplicated modules removed | 5: `clipboard`, `escapeHtml`, `semanticSearch`, `storage`, `wikiLLM` |
| Legacy imports | 0 imports from `src/utils` inside `src` |
| Validation | `npx tsc --noEmit`, `npm test`, `npm run build` passed |
| Residual risk | None identified for the utility-layer consolidation scope |

## Governance Review

| Check | Status | Evidence |
|---|---|---|
| ADR coherent | Passed | CML-603 requires documented architecture decisions before implementation |
| ADI updated | Passed | UT-001 is listed as `Verified` |
| Decision paper complete | Passed | Context, problem, alternatives, decision, consequences, verification, register, health impact and outcome are present |
| Traceability complete | Passed | ADI maps UT-001 to document, implementation and verification |
| Architectural Health updated | Passed | Utility Layer, Developer Experience and Maintainability effects are recorded |
| Gate unchanged | Passed | CML-603F still requires no structural `lib`/`utils` duplication |
## Exit Criteria

CML-603B is complete only when the code change and the Architecture Decision Index are aligned:

- UT-001 appears in the ADI as `Verified`;
- the traceability matrix points to `src/lib`;
- repository verification evidence is recorded in the milestone outcome.
