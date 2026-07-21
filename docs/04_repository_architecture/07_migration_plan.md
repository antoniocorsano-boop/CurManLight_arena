# 07 — Migration Plan: Extraction Order, PR Strategy, Risk Mitigation

> Step-by-step plan to extract App.tsx into the domain-based architecture. Each phase is a PR that can be reviewed, tested, and merged independently.

---

## 1. Migration Principles

1. **Extract, don't rewrite** — Move existing code into new files, don't rewrite from scratch
2. **One domain per PR** — Each PR extracts exactly one domain
3. **Tests before extraction** — Write tests for the extracted code BEFORE moving it
4. **Green builds at every step** — `npm run build` + `npm test` must pass after each PR
5. **No behavior changes** — Extraction only; feature changes come later in CML-603
6. **Incremental** — App.tsx shrinks gradually; it's never broken

---

## 2. Phase Overview

| Phase | PR | What | App.tsx Lines After | Risk |
|-------|-----|------|-------------------|------|
| 0 | — | Baseline: tests, build, audit | 12,525 | — |
| 1 | PR-1 | Install React Router, create route skeleton | 12,525 (unchanged) | Low |
| 2 | PR-2 | Extract Zustand stores (8 stores) | 12,000 | Low |
| 3 | PR-3 | Extract shared UI primitives (16 components) | 11,500 | Low |
| 4 | PR-4 | Extract lib/ functions (11 modules) | 10,500 | Low |
| 5 | PR-5 | Extract custom hooks (8 hooks) | 9,500 | Medium |
| 6 | PR-6 | Extract Navigation domain | 8,500 | Medium |
| 7 | PR-7 | Extract Curriculum domain | 7,000 | Medium |
| 8 | PR-8 | Extract Progettazione domain | 6,200 | Medium |
| 9 | PR-9 | Extract Documents domain | 5,000 | Medium |
| 10 | PR-10 | Extract Classroom domain | 3,800 | Medium |
| 11 | PR-11 | Extract Copilot + AI Generation domain | 3,000 | Medium |
| 12 | PR-12 | Extract Knowledge domain | 2,500 | Low |
| 13 | PR-13 | Extract Workspace + Social domains | 1,800 | Medium |
| 14 | PR-14 | Extract Graphs, Voice, TEP, Session, Onboarding | 800 | Medium |
| 15 | PR-15 | Final App.tsx cleanup + layout shell | 500 | Low |

---

## 3. Detailed Phase Descriptions

### Phase 0: Baseline (No Code Changes)
**Goal**: Ensure all tests pass, build works, and we have a complete audit.

**Actions**:
- [ ] Run `npm test` → confirm 59/59 pass
- [ ] Run build → confirm ~1,007 KB output
- [ ] Run `npx eslint src/App.tsx --max-warnings=0` (if configured)
- [ ] Document current line count: `wc -l src/App.tsx`
- [ ] Commit baseline state

**Exit Criteria**: Green build, all tests pass, baseline documented.

---

### Phase 1: React Router Installation
**Goal**: Install React Router without changing any behavior. Tab navigation continues to work via useState.

**Actions**:
- [ ] `npm install react-router-dom`
- [ ] Create `src/routes/index.tsx` with route definitions (commented out)
- [ ] Create `src/pages/` directory with placeholder page components
- [ ] Wrap App in `<BrowserRouter>` in `main.tsx`
- [ ] Keep existing tab navigation working (don't switch to router yet)

**Files Created**:
```
src/routes/index.tsx
src/pages/CurriculumPage.tsx (placeholder)
src/pages/ClassroomPage.tsx (placeholder)
src/pages/PlanningPage.tsx (placeholder)
src/pages/DocumentsPage.tsx (placeholder)
src/pages/CopilotPage.tsx (placeholder)
src/pages/KnowledgePage.tsx (placeholder)
src/pages/SocialPage.tsx (placeholder)
src/pages/SettingsPage.tsx (placeholder)
src/pages/OnboardingPage.tsx (placeholder)
```

**Exit Criteria**: Build passes, tests pass, router installed but not active.

---

### Phase 2: Extract Zustand Stores
**Goal**: Split the monolithic `useCurriculumStore` into 8 domain-specific stores.

**Actions**:
- [ ] Create `src/stores/` directory
- [ ] Extract `useNavigationStore.ts` (tab state, accordions, sidebar)
- [ ] Extract `useClassroomStore.ts` (classroom state from useState)
- [ ] Extract `useCopilotStore.ts` (copilot messages, context)
- [ ] Extract `useWorkspaceStore.ts` (OAuth tokens, sync status)
- [ ] Extract `useSocialStore.ts` (shared board, annotations, likes)
- [ ] Extract `useKnowledgeStore.ts` (custom docs, glossary)
- [ ] Extract `useSessionStore.ts` (onboarding, emergency, health)
- [ ] Slim down `useCurriculumStore.ts` to curriculum-only fields
- [ ] Update App.tsx imports to use new stores
- [ ] Write tests for each store (actions, persistence)

**Files Created**:
```
src/stores/useNavigationStore.ts
src/stores/useClassroomStore.ts
src/stores/useCopilotStore.ts
src/stores/useWorkspaceStore.ts
src/stores/useSocialStore.ts
src/stores/useKnowledgeStore.ts
src/stores/useSessionStore.ts
src/stores/useCurriculumStore.ts (modified)
src/__tests__/stores/useNavigationStore.test.ts
src/__tests__/stores/useClassroomStore.test.ts
src/__tests__/stores/useCopilotStore.test.ts
src/__tests__/stores/useWorkspaceStore.test.ts
src/__tests__/stores/useSocialStore.test.ts
src/__tests__/stores/useKnowledgeStore.test.ts
src/__tests__/stores/useSessionStore.test.ts
src/__tests__/stores/useCurriculumStore.test.ts
```

**Exit Criteria**: All 8 stores exist, App.tsx uses new stores, all tests pass.

---

### Phase 3: Extract Shared UI Primitives
**Goal**: Extract reusable UI components from App.tsx's inline JSX.

**Actions**:
- [ ] Create `src/components/ui/` directory
- [ ] Extract Toast/ToastContainer (used throughout)
- [ ] Extract Modal (used for onboarding, glossary, templates, etc.)
- [ ] Extract Button, Card, Input, Select, Badge, Accordion, Tabs
- [ ] Extract ErrorBoundary (move from main.tsx or create new)
- [ ] Extract Spinner, EmptyState, ConfirmDialog, Tooltip, Progress
- [ ] Write tests for each component

**Files Created**:
```
src/components/ui/Toast.tsx
src/components/ui/ToastContainer.tsx
src/components/ui/Modal.tsx
src/components/ui/Button.tsx
src/components/ui/Card.tsx
src/components/ui/Input.tsx
src/components/ui/Select.tsx
src/components/ui/Badge.tsx
src/components/ui/Accordion.tsx
src/components/ui/Tabs.tsx
src/components/ui/ErrorBoundary.tsx
src/components/ui/Spinner.tsx
src/components/ui/EmptyState.tsx
src/components/ui/ConfirmDialog.tsx
src/components/ui/Tooltip.tsx
src/components/ui/Progress.tsx
src/__tests__/components/ui/*.test.ts (16 files)
```

**Exit Criteria**: All UI primitives extracted, App.tsx imports them, tests pass.

---

### Phase 4: Extract Lib Functions
**Goal**: Move pure utility functions and API clients out of App.tsx.

**Actions**:
- [ ] Create `src/lib/` directory
- [ ] Move existing `src/utils/*.ts` to `src/lib/`
- [ ] Extract `documentGenerator.ts` (all document generation logic from handlers)
- [ ] Extract `csvParser.ts` (CSV import logic)
- [ ] Extract `scormGenerator.ts` (SCORM manifest generation)
- [ ] Extract `ollamaClient.ts` (Ollama API calls)
- [ ] Extract `googleDrive.ts` (Google Drive REST API wrapper)
- [ ] Extract `gdprFilter.ts` (GDPR content filtering)
- [ ] Update all imports

**Files Created**:
```
src/lib/escapeHtml.ts (moved from utils/)
src/lib/clipboard.ts (moved from utils/)
src/lib/storage.ts (moved from utils/)
src/lib/wikiLLM.ts (moved from utils/)
src/lib/semanticSearch.ts (moved from utils/)
src/lib/documentGenerator.ts
src/lib/csvParser.ts
src/lib/scormGenerator.ts
src/lib/ollamaClient.ts
src/lib/googleDrive.ts
src/lib/gdprFilter.ts
src/__tests__/lib/documentGenerator.test.ts
src/__tests__/lib/csvParser.test.ts
src/__tests__/lib/scormGenerator.test.ts
src/__tests__/lib/ollamaClient.test.ts
src/__tests__/lib/googleDrive.test.ts
src/__tests__/lib/gdprFilter.test.ts
```

**Exit Criteria**: All lib functions extracted, no duplicate logic, tests pass.

---

### Phase 5: Extract Custom Hooks
**Goal**: Extract useEffect + handler combinations into reusable hooks.

**Actions**:
- [ ] Create `src/hooks/` directory
- [ ] Extract `useAutoSave.ts` (useEffect lines 800, 777)
- [ ] Extract `useSpeech.ts` (handleToggleSpeech, handleSpeakController)
- [ ] Extract `useVoiceTyping.ts` (handleToggleVoiceTyping)
- [ ] Extract `useStorageMaintenance.ts` (useEffect lines 1988, 1995)
- [ ] Extract `useOAuth.ts` (useEffect lines 558, 2006)
- [ ] Extract `useTEP.ts` (TEP state + handlers)
- [ ] Extract `useGraphDrag.ts` (shared drag logic for both graphs)
- [ ] Extract `useSimulations.ts` (simulation interval management)
- [ ] Write tests for each hook

**Files Created**:
```
src/hooks/useAutoSave.ts
src/hooks/useSpeech.ts
src/hooks/useVoiceTyping.ts
src/hooks/useStorageMaintenance.ts
src/hooks/useOAuth.ts
src/hooks/useTEP.ts
src/hooks/useGraphDrag.ts
src/hooks/useSimulations.ts
src/__tests__/hooks/useAutoSave.test.ts
src/__tests__/hooks/useSpeech.test.ts
src/__tests__/hooks/useVoiceTyping.test.ts
src/__tests__/hooks/useStorageMaintenance.test.ts
src/__tests__/hooks/useOAuth.test.ts
src/__tests__/hooks/useTEP.test.ts
src/__tests__/hooks/useGraphDrag.test.ts
src/__tests__/hooks/useSimulations.test.ts
```

**Exit Criteria**: All hooks extracted, App.tsx uses them, tests pass.

---

### Phase 6–14: Extract Feature Domains

Each phase follows the same pattern:

1. Create `src/features/<domain>/components/` directory
2. Create `src/features/<domain>/hooks/` directory (if needed)
3. Create `src/features/<domain>/index.ts` barrel export
4. Extract components from App.tsx's JSX
5. Extract domain-specific handlers into component-level handlers or hooks
6. Write tests for each component
7. Update App.tsx to import from feature
8. Verify build + tests

#### Phase 6: Navigation Domain
- Components: AppShell, Sidebar, TopBar, TabBar, MobileSidebar
- Extract: layout JSX, handleTabSwitch, sidebar state
- App.tsx after: ~8,500 lines

#### Phase 7: Curriculum Domain
- Components: CurriculumTab, DisciplineAccordion, TraguardoList, ObiettivoList, EvidenzaList, CurriculumTree, CurriculumFilters, CurriculumSearch, CurriculumDetailPanel
- Extract: curriculum JSX, filter/sort handlers, accordion logic
- App.tsx after: ~7,000 lines

#### Phase 8: Progettazione Domain
- Components: ProgettazioneTab, WizardStep1–6
- Extract: wizard JSX, handleBack, handleNext, form state
- App.tsx after: ~6,200 lines

#### Phase 9: Documents Domain
- Components: DocumentsTab, DocumentConfig, DocumentPreview, TemplateSelector, ExportModal, ComparisonView, ProgrammazioneDoc, RelazioneDoc, SpecificoGradoDoc, AgidAudit
- Extract: document JSX, all export handlers (14 handlers!)
- App.tsx after: ~5,000 lines

#### Phase 10: Classroom Domain
- Components: ClassroomTab, StudentList, CooperativeGroups, GroupOptimizer, StudentFeedback, SentimentAnalysis, AttendanceTracker, BehaviorLog, TopicAnalysis, ClassroomLayout, ClassroomNotifications
- Extract: classroom JSX, shuffle/group handlers, 5 useEffects
- App.tsx after: ~3,800 lines

#### Phase 11: Copilot + AI Generation Domain
- Components: CopilotPanel, CopilotChat, CopilotMessage, CopilotInput, CopilotSuggestions, CopilotChips, CopilotVoiceInput, InlineSuggestion, AiGenerationPanel, GeneratedCurriculum, GeminiSuggestion
- Extract: copilot JSX, 8 AI handlers, chat logic
- App.tsx after: ~3,000 lines

#### Phase 12: Knowledge Domain
- Components: SecondBrainTab, KnowledgeSearch, KnowledgeDoc, GlossaryModal, GlossaryFull, CustomKbManager
- Extract: knowledge JSX, KB handlers
- App.tsx after: ~2,500 lines

#### Phase 13: Workspace + Social Domains
- Components: WorkspaceSyncPanel, SyncProgress, UserInfo, SocialBoard, SharedUdaCard, UdaAnnotations, UdaLikeButton, UdaOutcomeStats, ShareUdaModal
- Extract: workspace JSX (5 handlers), social JSX (5 handlers)
- App.tsx after: ~1,800 lines

#### Phase 14: Graphs, Voice, TEP, Session, Onboarding
- Components: ArchitectureGraph, DidacticGraph, GraphNode, GraphEdge, GraphControls, GraphTooltip, VoiceControls, VoiceTypingButton, SpeechBlock, TepBanner, TepSimplifiedGrid, EmergencyBanner, StorageWarning, OfflineIndicator, OnboardingModal, OnboardingStep1–5
- Extract: all remaining domain JSX and handlers
- App.tsx after: ~800 lines

---

### Phase 15: Final Cleanup
**Goal**: App.tsx becomes a pure layout shell (~500 lines).

**Actions**:
- [ ] Activate React Router (replace tab navigation)
- [ ] Move remaining inline JSX to AppShell
- [ ] Add Suspense boundaries for lazy loading
- [ ] Add page-level ErrorBoundary wrappers
- [ ] Final App.tsx review: no handlers, no useState, no useEffect
- [ ] Run full test suite
- [ ] Run build
- [ ] Performance audit (bundle size, render count)

**Exit Criteria**: App.tsx < 500 lines, all features extracted, router active, all tests pass.

---

## 4. Test Coverage Plan

### Per-Phase Test Requirements

| Phase | New Tests Required |
|-------|-------------------|
| Phase 2 (Stores) | 8 store test files (~40 tests) |
| Phase 3 (UI) | 16 component test files (~80 tests) |
| Phase 4 (Lib) | 6 lib test files (~30 tests) |
| Phase 5 (Hooks) | 8 hook test files (~40 tests) |
| Phase 6 (Navigation) | 5 component tests (~15 tests) |
| Phase 7 (Curriculum) | 9 component tests (~30 tests) |
| Phase 8 (Progettazione) | 7 component tests (~20 tests) |
| Phase 9 (Documents) | 10 component tests (~35 tests) |
| Phase 10 (Classroom) | 11 component tests (~35 tests) |
| Phase 11 (Copilot) | 11 component tests (~30 tests) |
| Phase 12 (Knowledge) | 6 component tests (~15 tests) |
| Phase 13 (Workspace + Social) | 9 component tests (~25 tests) |
| Phase 14 (Graphs + Voice + TEP + Session + Onboarding) | 16 component tests (~40 tests) |
| **Total** | **~120 component/store/lib/hook test files, ~435 tests** |

### Test File Structure

```
src/__tests__/
├── stores/
│   ├── useNavigationStore.test.ts
│   ├── useCurriculumStore.test.ts
│   ├── useClassroomStore.test.ts
│   ├── useCopilotStore.test.ts
│   ├── useWorkspaceStore.test.ts
│   ├── useSocialStore.test.ts
│   ├── useKnowledgeStore.test.ts
│   └── useSessionStore.test.ts
├── lib/
│   ├── documentGenerator.test.ts
│   ├── csvParser.test.ts
│   ├── scormGenerator.test.ts
│   ├── ollamaClient.test.ts
│   ├── googleDrive.test.ts
│   └── gdprFilter.test.ts
├── hooks/
│   ├── useAutoSave.test.ts
│   ├── useSpeech.test.ts
│   ├── useVoiceTyping.test.ts
│   ├── useStorageMaintenance.test.ts
│   ├── useOAuth.test.ts
│   ├── useTEP.test.ts
│   ├── useGraphDrag.test.ts
│   └── useSimulations.test.ts
├── components/
│   └── ui/
│       ├── Toast.test.ts
│       ├── Modal.test.ts
│       ├── Button.test.ts
│       └── ... (13 more)
└── features/
    ├── curriculum/
    │   ├── CurriculumTab.test.ts
    │   ├── DisciplineAccordion.test.ts
    │   └── ... (7 more)
    ├── classroom/
    │   ├── ClassroomTab.test.ts
    │   ├── CooperativeGroups.test.ts
    │   └── ... (9 more)
    ├── copilot/
    │   ├── CopilotChat.test.ts
    │   └── ... (10 more)
    ├── documents/
    │   ├── DocumentConfig.test.ts
    │   └── ... (9 more)
    ├── knowledge/
    │   ├── SecondBrainTab.test.ts
    │   └── ... (5 more)
    ├── workspace/
    │   ├── WorkspaceSyncPanel.test.ts
    │   └── ... (2 more)
    └── social/
        ├── SocialBoard.test.ts
        └── ... (5 more)
```

---

## 5. Risk Mitigation

### Risk 1: State Coupling Breaks
**Risk**: Extracting a domain breaks cross-domain state reads.
**Mitigation**: 
- Write integration tests BEFORE extraction
- Extract stores first (Phase 2) to formalize boundaries
- Use Zustand selectors to avoid unnecessary re-renders

### Risk 2: Handler Logic Scattered
**Risk**: Handlers that touch multiple domains get split incorrectly.
**Mitigation**:
- Map handler dependencies BEFORE extraction (02_dependency_map.md)
- Keep multi-domain handlers in a shared hook until domain is clear
- Prefer composition over splitting for tightly coupled handlers

### Risk 3: localStorage Key Conflicts
**Risk**: Multiple stores writing to same localStorage keys.
**Mitigation**:
- Namespace all keys: `curmanlight-<domain>-<key>`
- Use Zustand persist middleware for automatic namespacing
- Write migration script for existing keys

### Risk 4: Bundle Size Regression
**Risk**: Lazy loading adds overhead, bundle grows.
**Mitigation**:
- Measure bundle size at each phase
- Use `vite-bundle-analyzer` to identify duplicates
- Tree-shake unused imports

### Risk 5: Test Coverage Drops
**Risk**: Extraction creates untested code paths.
**Mitigation**:
- Write tests BEFORE extraction (TDD)
- Require coverage report in each PR
- Minimum 80% coverage per domain

### Risk 6: Build Breaks Mid-Phase
**Risk**: Partial extraction leaves imports broken.
**Mitigation**:
- Extract in order: stores → lib → hooks → components
- Each phase is atomic (one PR)
- Never leave App.tsx in a broken state

---

## 6. PR Template

```markdown
## CML-601A Phase X: Extract <Domain>

### What
- [ ] Created `src/features/<domain>/` with N components
- [ ] Extracted M handlers from App.tsx
- [ ] Created K test files with L tests
- [ ] App.tsx reduced from X to Y lines

### Why
- Decouples <domain> from monolithic App.tsx
- Enables independent testing and development
- Follows domain-based architecture (CML-601A)

### Tests
- [ ] New tests: X/X passing
- [ ] Existing tests: X/X passing
- [ ] Build: passing
- [ ] Bundle size: <regression threshold>

### Risk
- Low/Medium/High: <explanation>
- Mitigation: <what we did>

### Checklist
- [ ] No behavior changes
- [ ] All imports updated
- [ ] No circular dependencies
- [ ] No secrets/keys committed
- [ ] TypeScript strict mode passing
```

---

## 7. Verification Commands (Per Phase)

```bash
# Must ALL pass before merging any PR
npm test                    # All tests pass
npm run build               # Build succeeds
npm run lint                # No lint errors (if configured)
npx tsc --noEmit            # TypeScript compiles
wc -l src/App.tsx           # Line count decreased
```
