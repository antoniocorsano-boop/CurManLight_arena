# CurManLight - Project Baseline

> Reference document for the current architectural and navigation state of CurManLight.

## Status

| Area | Status | Evidence |
|---|---|---|
| Architecture Baseline | **Frozen** | CML-603 Gate PASSED |
| Navigation Baseline | **Frozen** | CML-604 Gate PASSED |
| Active Blockers | 1 (BL-001) | Baseline lock strategy pending |
| Next Phase | Product Evolution | Feature development, not structural changes |

## Architecture Baseline (CML-603)

| Component | State | Decision |
|---|---|---|
| Utility Layer | Extracted | `src/utils/` (18 files) |
| Typed Boundaries | Enforced | All features use `src/features/*/types.ts` |
| Interaction Tests | Active | 72/72 passing |
| Domain Modularization | Complete | 10 active domains with `index.ts` entrypoints |
| App.tsx | Reduced | ~1,134 lines (from ~12,500) |

## Navigation Baseline (CML-604)

| Component | State | Decision |
|---|---|---|
| Router | Active | React Router v7, BrowserRouter in `main.tsx` |
| Shell | Active | `AppContext` + `<Outlet/>` + lazy loading |
| Persistence | Tiered | Tier 1 (refresh), Tier 2 (navigation), Tier 3 (ephemeral) |
| Navigation Tests | Active | NavTest-001 Verified (8 tests) |
| Build Size | 783 KB | Reduced from 1,059 KB (26% reduction) |

## Active Decisions

| ID | Decision | Status | Phase |
|---|---|---|---|
| NAV-002 | React Router as navigation system | Verified | CML-604A |
| Shell-001 | Application Shell with Context + Outlet | Verified | CML-604B |
| Persist-001 | State persistence rules (Tier 1/2/3) | Verified | CML-604C |
| NavTest-001 | Navigation behavior tests | Verified | CML-604D |

## Open Blockers

| ID | Description | Impact |
|---|---|---|
| BL-001 | Baseline lock strategy | Governance process for baseline changes |

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 + vite-plugin-singlefile |
| State | Zustand (8 stores) + Dexie (IndexedDB) |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| AI | WikiLLM integration |
| Testing | Vitest |

## Project Structure

```text
src/
├── components/layout/    # AppContext, Shell
├── features/             # 10 active domains
│   ├── curriculum/
│   ├── planning/
│   ├── documents/
│   ├── knowledge/
│   ├── social/
│   ├── classroom/
│   ├── settings/
│   ├── onboarding/
│   ├── workspace/
│   └── navigation/
├── pages/                # Route components
├── stores/               # 8 Zustand stores
├── utils/                # 18 utility files
└── __tests__/            # 72 tests
```

## Evolution Guidelines

### Do

- Feature development within existing domains
- UX improvements
- Workflow enhancements
- Export/import capabilities
- Knowledge and decision support

### Don't

- Major structural refactoring
- New architectural patterns
- Navigation system changes (frozen)
- State management overhaul (frozen)

## Entry Points for New Contributors

1. Read this document
2. Read `docs/06_architecture_governance/ARCHITECTURE_DECISION_INDEX.md`
3. Read `docs/07_navigation_program/CML-604_GOVERNANCE.md`
4. Check `src/features/` for domain structure
5. Run `npm test` to verify baseline

---

*Last updated: CML-604 Gate PASSED*
