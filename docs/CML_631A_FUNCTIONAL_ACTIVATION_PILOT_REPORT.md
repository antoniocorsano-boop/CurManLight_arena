# CML-631A — Curriculum Domain Functional Activation Pilot — Closing Report

**Date:** 2026-07-25
**Branch:** `feat/cml-631a-curriculum-domain-functional-pilot`
**Base:** `1041fb5` (origin/main after CML-630E2 merge)

---

## Decision

**Option B — `pilot-contribution`** (consultation + local contribution), default `disabled`.

| Decision Point | Choice | Rationale |
|---|---|---|
| Activation mode | `pilot-contribution` | Teachers can propose, edit, delete draft links |
| Pilot role | Docente only | Lowest-risk entry point |
| Pilot scope | Synthetic dataset (Math primary→secondary), one discipline | Minimal blast radius |
| Pilot use case | Teacher proposes VerticalCurriculumLink | Core pedagogical relation |
| Pilot access | Internal to Curriculum view, marked as experimental | No navigation/routing changes |
| Legacy modification | None | No dual-write, no automatic migration, no store changes |

---

## What Was Implemented

### Activation Mode System (`src/features/curriculum-functional-pilot/types.ts`)
- `CurriculumFunctionalActivationMode`: `'disabled' | 'pilot-read-only' | 'pilot-contribution'`
- `PilotDataset` interface for dataset metadata
- `PILOT_DATASET_ID` constant

### Synthetic Dataset (`src/features/curriculum-functional-pilot/data/pilotData.ts`)
- `PILOT_VERSION`: Curricolo Matematica Pilota 2026-2029
- `PILOT_SEGMENTS`: 2 segments (primary-5, secondary-1)
- `PILOT_NODES`: 6 nodes (3 per segment: competence, objective, milestone)
- `PILOT_INITIAL_LINKS`: empty (to be populated by teachers)

### Application Service (`src/features/curriculum-functional-pilot/application/curriculumPilotService.ts`)
- Activation mode management: `getActivationMode`, `setActivationMode`, `isPilotActive`, `isContributionAllowed`
- Dataset initialization: `initializePilotDataset`, `isPilotInitialized`, `getPilotDataset`
- Query functions: `listPilotVersions`, `listPilotSegments`, `listPilotNodes`, `listPilotLinks`
- Mutation functions: `proposeVerticalLink`, `updateDraftVerticalLink`, `deleteDraftVerticalLink`
- Validation: uses CML-630E2 `validateVerticalCurriculumLink`, `findDuplicateVerticalLinks`, `isApprovedVersionImmutable`
- Service result types: `ServiceResult<T>`, `ServiceError`
- Full reset capability: `resetPilot`

### React Hook (`src/features/curriculum-functional-pilot/hooks/useCurriculumPilot.ts`)
- `useCurriculumPilot()` — single entry point for UI
- State: activation mode, dataset, versions, segments, nodes, links, errors, loading
- Actions: initialize, setMode, proposeLink, updateLink, deleteLink, reset
- Selectors: getNodesBySegment, getLinksByVersion, getSegmentLabel, getNodeLabel, getRelationTypeLabel, getStatusLabel

### UI Components (5 components)
- `PilotMainView` — main view integrating all sub-components
- `PilotStatusPanel` — activation mode selector, initialization status, error display
- `PilotVerticalLinkForm` — form for proposing new vertical links
- `PilotLinkList` — list of existing links with delete capability
- `PilotNodePicker` — node selection with search

---

## Validation Results

| Check | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | **0 errors** |
| Pilot tests (65 cases) | **65 passed** |
| Full test suite (683 tests) | **682 passed, 1 pre-existing timeout** |
| Architecture frozen gates | **PRESERVED** |
| No legacy modifications | **CONFIRMED** |
| No navigation/routing changes | **CONFIRMED** |
| No store changes | **CONFIRMED** |

### Pre-existing Failure
- `schema.test.ts > upgrades an isolated real IndexedDB from v1 to v2` — 30s timeout (environment issue, not related to CML-631A)

---

## Test Coverage

65 tests across 8 describe blocks:

| Block | Tests | Coverage |
|---|---|---|
| Activation Mode Management | 9 | Mode get/set, isPilotActive, isContributionAllowed |
| Dataset Initialization | 5 | Init, idempotency, getPilotDataset |
| Query Functions — Disabled | 4 | All queries fail when disabled |
| Query Functions — Active | 7 | Versions, segments, nodes, links queries |
| Propose Vertical Link | 11 | Valid proposals, validation, metadata |
| Update Draft Link | 5 | Relation type, rationale, timestamp |
| Delete Draft Link | 4 | Delete, validation, list updates |
| Reset and State Management | 4 | Reset, full workflow |
| Edge Cases and Error Handling | 16 | Long rationale, special chars, consistency |

---

## Files Changed

### New Files (11)
- `src/features/curriculum-functional-pilot/types.ts`
- `src/features/curriculum-functional-pilot/data/pilotData.ts`
- `src/features/curriculum-functional-pilot/application/curriculumPilotService.ts`
- `src/features/curriculum-functional-pilot/hooks/useCurriculumPilot.ts`
- `src/features/curriculum-functional-pilot/components/PilotMainView.tsx`
- `src/features/curriculum-functional-pilot/components/PilotStatusPanel.tsx`
- `src/features/curriculum-functional-pilot/components/PilotVerticalLinkForm.tsx`
- `src/features/curriculum-functional-pilot/components/PilotLinkList.tsx`
- `src/features/curriculum-functional-pilot/components/PilotNodePicker.tsx`
- `src/features/curriculum-functional-pilot/index.ts`
- `src/__tests__/curriculum-functional-pilot/pilot-service.test.ts`

### Modified Files
- None (no existing files were modified)

---

## What This Does NOT Do

- Does NOT modify any existing curriculum feature code
- Does NOT add routing or navigation entries
- Does NOT modify the Zustand store
- Does NOT add Dexie tables or persistence
- Does NOT implement automatic migration
- Does NOT affect legacy domain functionality

---

## Next Steps (CML-631B+)

1. **Wire into CurriculumTab** — Add "Pilota" tab visible when role=docente
2. **Real persistence** — Connect to Dexie via CML-630E2 repositories
3. **Export functionality** — Allow exporting draft links as JSON
4. **Multi-discipline expansion** — Add more synthetic datasets
5. **Role expansion** — Allow dipartimento and referente roles
