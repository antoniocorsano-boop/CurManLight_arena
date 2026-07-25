# CML-631C — Curriculum Pilot Usability Corrections Report

> **Status:** COMPLETE_LOCAL
> **Branch:** `feat/cml-631c-pilot-usability-corrections`
> **Base:** `main` at `58a17c2` (CML-631B closed)
> **Date:** 2026-07-25

---

## Summary

5 usability corrections applied to the CML-631A curriculum pilot, motivated by CML-631B evaluation findings. No new roles, workflows, routes, datasets, store/migration changes, or CSV export.

## Corrections Applied

### C1 — Relation Type Guidance Tooltips

**Files modified:**
- `src/features/curriculum-functional-pilot/relationTypeGuidance.ts` (CREATED)
- `src/features/curriculum-functional-pilot/hooks/useCurriculumPilot.ts` (interface + implementation)
- `src/features/curriculum-functional-pilot/components/PilotVerticalLinkForm.tsx` (title attribute)

**What:** Added typed guidance (description + example) for all 6 relation types. Each relation type button now shows a tooltip with a description in Italian and a concrete example.

**Types covered:** continuity, development, prerequisite, integration, deepening, discontinuity.

### C2 — Local Segment Filter

**Files modified:**
- `src/features/curriculum-functional-pilot/components/PilotMainView.tsx` (filter state + UI)

**What:** Added a segment filter bar above the node pickers. "Tutti" shows all nodes; selecting a segment filters both nodes and links to that segment only. No Dipartimento semantics introduced.

### C3 — Delete Confirmation Dialog

**Files modified:**
- `src/features/curriculum-functional-pilot/components/PilotLinkList.tsx` (two-step flow)

**What:** Replaced the single-click delete with a two-step confirmation flow. First click shows "Eliminare {tipo}?" with Conferma/Annulla buttons. The confirmation shows the relation type label for clarity.

### C4 — Async Operation States

**Files modified:**
- `src/features/curriculum-functional-pilot/types.ts` (PilotAsyncOperation type)
- `src/features/curriculum-functional-pilot/hooks/useCurriculumPilot.ts` (asyncOperation state, wrapped actions)
- `src/features/curriculum-functional-pilot/components/PilotStatusPanel.tsx` (loading state on init button)
- `src/features/curriculum-functional-pilot/components/PilotVerticalLinkForm.tsx` (double-submit prevention)
- `src/features/curriculum-functional-pilot/components/PilotLinkList.tsx` (loading state on confirm delete)

**What:** Added `PilotAsyncOperation` type (`init | activate | create-link | update-link | delete-link | none`). Each hook action sets the async operation before calling the service and clears it via `queueMicrotask`. Components disable buttons and show loading text during operations. Double-submit prevention on create and delete.

### C5 — CML-631B Microfixes Verified

**What:** All 13 microfixes from CML-631B (aria-labels, aria-pressed, touch targets, focus indicators, accented labels) are preserved on `main` and inherited by this branch. Verified via grep.

## Test Results

### Pilot Evaluation Tests: 37/37 PASS

| Group | Tests | Status |
|-------|-------|--------|
| C1 — Relation Type Guidance | 6 | PASS |
| C2 — Local Segment Filter | 4 | PASS |
| C3 — Delete Confirmation | 4 | PASS |
| C4 — Async States | 5 | PASS |
| S1-S6 — CML-631B Scenarios | 18 | PASS |

### Full Suite: 720/720 PASS

### Validations

| Check | Result |
|-------|--------|
| TypeScript (`npx tsc --noEmit`) | 0 errors |
| Vitest (`npx vitest run`) | 720/720 pass |
| Vite build (`npm run build`) | OK |
| Storybook build (`npm run build-storybook`) | OK |

## Files Changed

| File | Action |
|------|--------|
| `src/features/curriculum-functional-pilot/relationTypeGuidance.ts` | CREATED |
| `src/features/curriculum-functional-pilot/types.ts` | MODIFIED (+PilotAsyncOperation) |
| `src/features/curriculum-functional-pilot/hooks/useCurriculumPilot.ts` | MODIFIED (async states, guidance) |
| `src/features/curriculum-functional-pilot/components/PilotMainView.tsx` | MODIFIED (segment filter) |
| `src/features/curriculum-functional-pilot/components/PilotVerticalLinkForm.tsx` | MODIFIED (tooltip, async) |
| `src/features/curriculum-functional-pilot/components/PilotStatusPanel.tsx` | MODIFIED (async loading) |
| `src/features/curriculum-functional-pilot/components/PilotLinkList.tsx` | MODIFIED (confirm, async) |
| `src/__tests__/curriculum-functional-pilot/pilot-evaluation.test.ts` | MODIFIED (+19 tests) |

## Scope Verification

| Constraint | Status |
|------------|--------|
| No new roles (Dipartimento/Referente) | ✅ |
| No approvals | ✅ |
| No global activation | ✅ |
| No new datasets | ✅ |
| No new routes | ✅ |
| No store/migration/Dexie changes | ✅ |
| No CML-630 contract changes | ✅ |
| No import/export | ✅ |
| No new relation types | ✅ |
| No new domain states | ✅ |
| No CSV export | ✅ |
