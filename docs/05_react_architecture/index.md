# CML-602 — React Architecture: Implementation Specifications

> **Goal**: Produce implementation-ready specifications for every domain, store, component, hook, and route. CML-603 uses these specs as governance input for architectural stabilization before deeper functional implementation.

## Documents

| # | Document | Scope |
|---|----------|-------|
| 00 | [foundation.md](./00_foundation.md) | Shared types, stores, hooks, UI primitives, lib modules |
| 01 | [navigation.md](./01_navigation.md) | AppShell, Sidebar, TopBar, TabBar, MobileSidebar |
| 02 | [curriculum.md](./02_curriculum.md) | CurriculumTab, accordions, tree, filters, detail panel |
| 03 | [progettazione.md](./03_progettazione.md) | Wizard steps, form state, UDA generation |
| 04 | [documents.md](./04_documents.md) | Config, export, comparison, programmazione, relazione |
| 05 | [classroom.md](./05_classroom.md) | Modes, groups, feedback, attendance, behavior, topic analysis |
| 06 | [copilot.md](./06_copilot.md) | Chat, suggestions, voice input, AI generation, inline suggestions |
| 07 | [knowledge.md](./07_knowledge.md) | Second Brain, KB search, glossary, custom docs |
| 08 | [workspace_social.md](./08_workspace_social.md) | Google Workspace sync, UDA social board |
| 09 | [graphs_voice_tep.md](./09_graphs_voice_tep.md) | Architecture/Didactic graphs, voice synthesis/recognition, TEP |
| 10 | [onboarding_session.md](./10_onboarding_session.md) | Onboarding wizard, session health, emergency backup |
| 11 | [router.md](./11_router.md) | Route definitions, lazy loading, guards, data loading |
| 12 | [migration_checklist.md](./12_migration_checklist.md) | Per-PR verification checklist, exit criteria |

## How to Use These Specs

1. **CML-603** stabilizes architecture first via [CML-603 Architecture Governance](../06_architecture_governance/CML-603_ARCHITECTURE_GOVERNANCE.md); domain implementation resumes after the CML-603F Architecture Gate
2. Each domain spec contains: component interfaces, props, state, handlers, store slice, hooks, tests
3. Types are shared via `src/types/` — read `00_foundation.md` first
4. UI primitives are shared via `src/components/ui/` — read `00_foundation.md` first
5. Store slices are independent — each domain reads its own store, never imports other stores directly

## Spec Conventions

- **Props interfaces** use `PascalCase` with `Props` suffix: `CurriculumTabProps`
- **State interfaces** use `PascalCase` with `State` suffix: `ClassroomState`
- **Store hooks** use `use<Domain>Store` naming: `useClassroomStore`
- **Component files** use `PascalCase.tsx`: `CurriculumTab.tsx`
- **Hook files** use `camelCase` with `use` prefix: `useShuffle.ts`
- **Test files** mirror source: `__tests__/features/curriculum/CurriculumTab.test.tsx`
- **Barrel exports** use `index.ts` in each feature directory
