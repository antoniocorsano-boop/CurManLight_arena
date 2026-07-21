# CML-603E - Domain Modularization

> Decision Paper for DM-001. This document defines the exit criteria for the final CML-603 implementation decision before the CML-603F Architecture Gate.

## Context

CurManLight has completed UT-001, TY-001 and TS-001. The repository now has a canonical utility layer, typed public boundaries and interaction tests for the primary user flows.

DM-001 uses that foundation to make domains explicit architectural units, not just folders.

## Problem

Several feature domains already exist under `src/features`, but their public APIs are uneven. Some domains expose a root barrel, some only expose `components/index.ts`, and cross-domain imports sometimes point directly into another domain's internal component tree.

This weakens the ability to modularize safely because consumers cannot always distinguish public contracts from implementation details.

## Approved Decision

### DM-001 - Domain Modularization

Each active domain must expose an intentional public entrypoint. Cross-domain consumers should import from that public entrypoint unless they are inside the same domain.

Domain modularization means:

- a domain owns its components, hooks, data and public types;
- public API is exported through `src/features/<domain>/index.ts`;
- cross-domain imports use public domain entrypoints;
- internal imports may remain relative inside the owning domain;
- orchestration layers may compose domains through public APIs;
- shared infrastructure remains in `src/lib`, `src/stores`, `src/types` or `src/store` as appropriate.

## Initial Domain Inventory

| Domain | Current role | DM-001 action |
|---|---|---|
| `session` | App composition, session modals, contracts | Publish root entrypoint and compose domains through public APIs |
| `curriculum` | Curriculum and revision UI/hooks | Publish root entrypoint |
| `progettazione` | Planning, UDA and certification UI/hooks | Publish root entrypoint |
| `classroom` | Classroom planning and social state helpers | Publish root entrypoint |
| `documents` | Export, backup, Knowledge and document modals | Publish root entrypoint |
| `processo` | Process review/import UI | Publish root entrypoint |
| `social` | Shared UDA social board | Publish root entrypoint |
| `workspace` | Workspace state, sync and workspace modals | Publish root entrypoint |
| `copilot` | Copilot panel, setup and interaction hooks | Extend existing root entrypoint |
| `navigation` | Shell, top bar, sidebars and navigation hook | Extend existing root entrypoint |

## Exit Criteria

DM-001 can move to `Verified` only when:

- each active domain has a clear public API entrypoint;
- cross-domain imports touched by DM-001 use public domain entrypoints;
- internal same-domain imports are not forced through barrels;
- no obvious circular import is introduced between domains;
- `npx tsc --noEmit` passes;
- `npm test` passes;
- `npm run build` passes;
- scoped `git diff --check` passes, with BL-001 handled as an external blocker until resolved or accepted by CML-603F;
- ADI, traceability and Architectural Health are updated with observed evidence.

## Decision Register

| ID | Decision | Status | Impact |
|---|---|---|---|
| DM-001 | Domains expose public APIs and cross-domain composition uses those APIs | Verified | High |

## Architectural Health Impact

| Area | Before CML-603E | Target after CML-603E | Impact |
|---|:---:|:---:|---|
| Domain Separation | 4/5 | 5/5 | Domains become importable architectural units |
| Modularita' | 3/5 | 5/5 | Cross-domain imports are routed through public entrypoints |
| Maintainability | 5/5 | 5/5 | Future feature work can locate public contracts without reading internals |

## Decision Outcome

| Item | Expected outcome | Observed outcome | Status |
|---|---|---|---|
| Public domain APIs | Each active domain exposes an intentional root entrypoint | `classroom`, `copilot`, `curriculum`, `documents`, `navigation`, `processo`, `progettazione`, `session`, `social` and `workspace` expose `src/features/<domain>/index.ts` | Verified |
| Cross-domain imports | Consumers use public domain APIs instead of internal folders | DM-001 touched imports now route through root domain barrels; scan reports no cross-domain imports into active domain `components/hooks/types/data` | Verified |
| Dependency audit | Remaining domain edges are visible and intentional | Audit lists session orchestration, progettazione composition of classroom/social, navigation composition of copilot and type-only session contract usage | Verified |
| TS-001 compatibility | Interaction tests validate public APIs | `src/__tests__/interaction.cml603d.test.tsx` imports hooks/types from root feature APIs and passes 5/5 | Verified |
| Validation | Green Repository Rule for DM-001 scope | `npx tsc --noEmit`, `npm test` 64/64, `npm run build` and scoped `git diff --check` pass; BL-001 remains external | Verified |

DM-001 introduced no known regression. Empty placeholder feature folders without source files are not promoted to active domains in this decision.
