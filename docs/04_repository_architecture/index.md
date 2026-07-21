# CML-601A — Repository Architecture Analysis

> **Goal**: Document the current monolithic structure, map all state/handlers/effects by domain, define the target domain-based directory structure, and produce a React Architecture Blueprint for CML-602 to consume.

## Documents

| # | Document | Purpose |
|---|----------|---------|
| 01 | [domain_map.md](./01_domain_map.md) | Current state: 168 useState, 80 handlers, 16 useEffects — grouped by domain |
| 02 | [dependency_map.md](./02_dependency_map.md) | What uses what: component tree, handler → state → effect dependencies |
| 03 | [state_map.md](./03_state_map.md) | All state locations, Zustand store fields, local storage sync, data flow |
| 04 | [event_map.md](./04_event_map.md) | Click → event → store mutation → render → toast → persist flows |
| 05 | [target_structure.md](./05_target_structure.md) | Proposed domain-based directory/file structure with file counts |
| 06 | [react_architecture_blueprint.md](./06_react_architecture_blueprint.md) | Router, layout shells, store slices, lazy loading, error boundaries |
| 07 | [migration_plan.md](./07_migration_plan.md) | Extraction order, PR strategy, risk mitigation, verification gates |

## Key Metrics (Current)

| Metric | Value |
|--------|-------|
| App.tsx lines | ~12,525 |
| useState hooks | 168 |
| Handler functions | 80 |
| useEffect hooks | 16 |
| Zustand store fields | 22 |
| Zustand store actions | 18 |
| Lucide icons | 38 |
| Vitest tests | 59/59 passing |
| Build size | ~1,007 KB (single-file) |

## Key Metrics (Target)

| Metric | Target Range |
|--------|-------------|
| Screens | 45–60 |
| Routes | 90–120 |
| Components | 180–220 |
| Zustand stores | 20–30 |
| Vitest tests | 1,500–2,000 |

## Milestone Sequence

```
CML-601A  ← YOU ARE HERE  (this analysis)
CML-602                    React Architecture Blueprint (consumes 05 + 06)
CML-603                    Architecture Governance / stabilization gate (supersedes pure extraction framing)
```


## Status Update

CML-603 is now governed by [CML-603 Architecture Governance](../06_architecture_governance/CML-603_ARCHITECTURE_GOVERNANCE.md). The original extraction plan remains historical input, but CML-603 is no longer treated as feature work or simple file extraction.
