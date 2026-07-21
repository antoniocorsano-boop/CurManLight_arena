# 12 — Migration Checklist: Per-PR Verification

> Step-by-step verification checklist for each PR in the migration. Every item must be checked before merging.

> **Status note:** this file is the historical migration plan and preserves its original per-PR checkboxes. Current architectural completion and verification are governed by [CML-603 Architecture Governance](../06_architecture_governance/CML-603_ARCHITECTURE_GOVERNANCE.md), its [Architecture Decision Index](../06_architecture_governance/ARCHITECTURE_DECISION_INDEX.md), and the [CML-603F Architecture Gate Report](../06_architecture_governance/CML-603F_PRODUCT_ARCHITECTURE_REVIEW.md). Unchecked items here are not current CML-603 gate results.

---

## 1. Pre-Migration (Phase 0)

### Baseline Verification
- [ ] `npm test` → 59/59 tests passing
- [ ] `npm run build` → build succeeds, output ~1,007 KB
- [ ] `wc -l src/App.tsx` → baseline line count documented
- [ ] All imports resolve (no broken imports)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No ESLint errors (if configured)
- [ ] Git: clean working tree, all changes committed

---

## 2. Phase 1: React Router Installation

### Files Created
- [ ] `src/routes/index.tsx` — route definitions (commented out)
- [ ] `src/pages/CurriculumPage.tsx` — placeholder
- [ ] `src/pages/ClassroomPage.tsx` — placeholder
- [ ] `src/pages/PlanningPage.tsx` — placeholder
- [ ] `src/pages/DocumentsPage.tsx` — placeholder
- [ ] `src/pages/CopilotPage.tsx` — placeholder
- [ ] `src/pages/KnowledgePage.tsx` — placeholder
- [ ] `src/pages/SocialPage.tsx` — placeholder
- [ ] `src/pages/SettingsPage.tsx` — placeholder
- [ ] `src/pages/OnboardingPage.tsx` — placeholder
- [ ] `package.json` updated with `react-router-dom`

### Verification
- [ ] `npm install` → no errors
- [ ] `npm test` → 59/59 passing (no regressions)
- [ ] `npm run build` → build succeeds
- [ ] App still works with existing tab navigation (no behavior change)
- [ ] Router imported but not active (routes commented out)

---

## 3. Phase 2: Extract Zustand Stores

### Files Created
- [ ] `src/stores/useNavigationStore.ts`
- [ ] `src/stores/useClassroomStore.ts`
- [ ] `src/stores/useCopilotStore.ts`
- [ ] `src/stores/useWorkspaceStore.ts`
- [ ] `src/stores/useSocialStore.ts`
- [ ] `src/stores/useKnowledgeStore.ts`
- [ ] `src/stores/useSessionStore.ts`
- [ ] `src/stores/index.ts` — barrel export
- [ ] `src/__tests__/stores/useNavigationStore.test.ts`
- [ ] `src/__tests__/stores/useCurriculumStore.test.ts`
- [ ] `src/__tests__/stores/useClassroomStore.test.ts`
- [ ] `src/__tests__/stores/useCopilotStore.test.ts`
- [ ] `src/__tests__/stores/useWorkspaceStore.test.ts`
- [ ] `src/__tests__/stores/useSocialStore.test.ts`
- [ ] `src/__tests__/stores/useKnowledgeStore.test.ts`
- [ ] `src/__tests__/stores/useSessionStore.test.ts`

### App.tsx Changes
- [ ] Imports updated to use new stores
- [ ] `useCurriculumStore` slimmed (removed non-curriculum fields)
- [ ] Line count decreased by ~500

### Verification
- [ ] `npm test` → all tests passing
- [ ] `npm run build` → build succeeds
- [ ] Each store: actions work, persistence works (if applicable)
- [ ] No circular imports between stores
- [ ] No broken imports in App.tsx

---

## 4. Phase 3: Extract Shared UI Primitives

### Files Created
- [ ] `src/components/ui/Button.tsx`
- [ ] `src/components/ui/Card.tsx`
- [ ] `src/components/ui/Modal.tsx`
- [ ] `src/components/ui/Input.tsx`
- [ ] `src/components/ui/Select.tsx`
- [ ] `src/components/ui/Toast.tsx`
- [ ] `src/components/ui/ToastContainer.tsx`
- [ ] `src/components/ui/Badge.tsx`
- [ ] `src/components/ui/Accordion.tsx`
- [ ] `src/components/ui/Tabs.tsx`
- [ ] `src/components/ui/ErrorBoundary.tsx`
- [ ] `src/components/ui/Spinner.tsx`
- [ ] `src/components/ui/EmptyState.tsx`
- [ ] `src/components/ui/ConfirmDialog.tsx`
- [ ] `src/components/ui/Tooltip.tsx`
- [ ] `src/components/ui/Progress.tsx`
- [ ] `src/components/ui/index.ts` — barrel export
- [ ] `src/__tests__/components/ui/*.test.tsx` — 16 test files

### App.tsx Changes
- [ ] Inline UI components removed
- [ ] Imports updated to use `src/components/ui/`
- [ ] Line count decreased by ~500

### Verification
- [ ] `npm test` → all tests passing
- [ ] `npm run build` → build succeeds
- [ ] Each component renders correctly
- [ ] All props interfaces match usage in App.tsx
- [ ] No visual regressions

---

## 5. Phase 4: Extract Lib Functions

### Files Created
- [ ] `src/lib/escapeHtml.ts` (moved from utils/)
- [ ] `src/lib/clipboard.ts` (moved from utils/)
- [ ] `src/lib/storage.ts` (moved from utils/)
- [ ] `src/lib/wikiLLM.ts` (moved from utils/)
- [ ] `src/lib/semanticSearch.ts` (moved from utils/)
- [ ] `src/lib/documentGenerator.ts`
- [ ] `src/lib/csvParser.ts`
- [ ] `src/lib/scormGenerator.ts`
- [ ] `src/lib/ollamaClient.ts`
- [ ] `src/lib/googleDrive.ts`
- [ ] `src/lib/gdprFilter.ts`
- [ ] `src/__tests__/lib/documentGenerator.test.ts`
- [ ] `src/__tests__/lib/csvParser.test.ts`
- [ ] `src/__tests__/lib/scormGenerator.test.ts`
- [ ] `src/__tests__/lib/ollamaClient.test.ts`
- [ ] `src/__tests__/lib/googleDrive.test.ts`
- [ ] `src/__tests__/lib/gdprFilter.test.ts`

### App.tsx Changes
- [ ] Handler logic extracted to lib functions
- [ ] Imports updated to use `src/lib/`
- [ ] Line count decreased by ~1,000

### Verification
- [ ] `npm test` → all tests passing
- [ ] `npm run build` → build succeeds
- [ ] Each lib function: correct input/output, edge cases handled
- [ ] No duplicate logic between lib files
- [ ] Document generation produces valid output

---

## 6. Phase 5: Extract Custom Hooks

### Files Created
- [ ] `src/hooks/useAutoSave.ts`
- [ ] `src/hooks/useSpeech.ts`
- [ ] `src/hooks/useVoiceTyping.ts`
- [ ] `src/hooks/useStorageMaintenance.ts`
- [ ] `src/hooks/useOAuth.ts`
- [ ] `src/hooks/useTEP.ts`
- [ ] `src/hooks/useGraphDrag.ts`
- [ ] `src/hooks/useSimulations.ts`
- [ ] `src/hooks/index.ts` — barrel export
- [ ] `src/__tests__/hooks/useAutoSave.test.ts`
- [ ] `src/__tests__/hooks/useSpeech.test.ts`
- [ ] `src/__tests__/hooks/useVoiceTyping.test.ts`
- [ ] `src/__tests__/hooks/useStorageMaintenance.test.ts`
- [ ] `src/__tests__/hooks/useOAuth.test.ts`
- [ ] `src/__tests__/hooks/useTEP.test.ts`
- [ ] `src/__tests__/hooks/useGraphDrag.test.ts`
- [ ] `src/__tests__/hooks/useSimulations.test.ts`

### App.tsx Changes
- [ ] useEffect + handler combinations removed
- [ ] Imports updated to use `src/hooks/`
- [ ] Line count decreased by ~1,000

### Verification
- [ ] `npm test` → all tests passing
- [ ] `npm run build` → build succeeds
- [ ] Each hook: correct behavior, cleanup on unmount
- [ ] No memory leaks (intervals, event listeners cleaned up)
- [ ] Speech synthesis/recognition works correctly

---

## 7. Phases 6–14: Extract Feature Domains

Each phase follows the same checklist:

### Per-Domain Checklist

#### Files Created
- [ ] `src/features/<domain>/components/*.tsx` — N components
- [ ] `src/features/<domain>/hooks/*.ts` — M hooks (if needed)
- [ ] `src/features/<domain>/index.ts` — barrel export
- [ ] `src/__tests__/features/<domain>/*.test.tsx` — K test files

#### App.tsx Changes
- [ ] Domain JSX removed
- [ ] Domain handlers removed
- [ ] Domain useState hooks removed
- [ ] Imports updated to use `src/features/<domain>/`
- [ ] Line count decreased by expected amount

#### Verification
- [ ] `npm test` → all tests passing
- [ ] `npm run build` → build succeeds
- [ ] Feature works exactly as before (no behavior change)
- [ ] All handlers preserved (copy-paste, not rewrite)
- [ ] No new bugs introduced
- [ ] No visual regressions

### Phase-Specific Line Count Targets

| Phase | Domain | Expected Decrease |
|-------|--------|------------------|
| 6 | Navigation | ~1,000 lines |
| 7 | Curriculum | ~1,500 lines |
| 8 | Progettazione | ~800 lines |
| 9 | Documents | ~1,200 lines |
| 10 | Classroom | ~1,200 lines |
| 11 | Copilot + AI | ~800 lines |
| 12 | Knowledge | ~500 lines |
| 13 | Workspace + Social | ~700 lines |
| 14 | Graphs + Voice + TEP + Session + Onboarding | ~1,000 lines |

---

## 8. Phase 15: Final Cleanup

### App.tsx Final State
- [ ] Line count < 500
- [ ] No useState hooks (all moved to stores/features)
- [ ] No useEffect hooks (all moved to hooks/features)
- [ ] No handler functions (all moved to features)
- [ ] Only layout shell + routes + providers

### Router Activation
- [ ] React Router routes activated (uncommented)
- [ ] Tab navigation switched to use `useNavigate`
- [ ] URL parameters syncing to stores
- [ ] Suspense boundaries in place
- [ ] Error boundaries at page level

### Final Verification
- [ ] `npm test` → all tests passing (target: 435+ tests)
- [ ] `npm run build` → build succeeds
- [ ] `npx tsc --noEmit` → no TypeScript errors
- [ ] All features work correctly
- [ ] No visual regressions
- [ ] No performance regressions
- [ ] Bundle size < 600 KB (with lazy loading)
- [ ] All routes accessible via URL
- [ ] Deep linking works (direct URL to specific page)
- [ ] Browser back/forward buttons work

---

## 9. Post-Migration Verification

### Code Quality
- [ ] No `any` types (strict TypeScript)
- [ ] No unused imports
- [ ] No unused variables
- [ ] All functions have return types
- [ ] All components have prop types
- [ ] No console.log in production code
- [ ] No hardcoded URLs/secrets

### Performance
- [ ] Initial load < 2 seconds
- [ ] Route transitions < 500ms
- [ ] No unnecessary re-renders (React DevTools)
- [ ] Lazy loading working (check Network tab)
- [ ] Bundle splitting correct

### Accessibility
- [ ] All interactive elements keyboard accessible
- [ ] Screen reader compatible
- [ ] Color contrast passes WCAG 2.1 AA
- [ ] Focus management correct

### Documentation
- [ ] All new files have JSDoc comments
- [ ] README updated with new architecture
- [ ] CLAUDE.md updated with new structure
- [ ] AGENTS.md updated with new file paths

---

## 10. Rollback Plan

If any phase fails:

1. **Revert the PR** — `git revert <commit>`
2. **Verify baseline** — `npm test` + `npm run build`
3. **Document failure** — what broke, why, how to fix
4. **Fix forward** — don't retry the same approach
5. **Consider smaller PR** — split the phase into smaller chunks

### Critical Rollback Triggers
- Build fails after merge
- Tests fail after merge
- App crashes on load
- Data loss (localStorage/IndexedDB)
- Visual regressions in production
