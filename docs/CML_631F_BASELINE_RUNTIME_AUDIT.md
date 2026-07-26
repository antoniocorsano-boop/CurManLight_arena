# CML-631F — Baseline Runtime Audit

## Verdict

```text
CML_631F_VALIDATION_BASELINE_NOT_READY
```

## Baseline Identity

| Item | Expected | Actual | Status |
|------|----------|--------|--------|
| Branch | `feat/cml-631e-guided-curriculum-connection-flow` | `feat/cml-631e-guided-curriculum-connection-flow` | OK |
| HEAD | `b39e2d7` | `ec2899e` | MISMATCH |
| Working tree | Clean | Clean | OK |
| Diff check | No errors | No errors | OK |

**Note:** `HEAD` is `ec2899e` (docs(CML-631F): add session execution checklist), not the expected `b39e2d7`. This is a docs-only addition after the baseline freeze, but it technically violates the strict baseline identity requirement.

## Environment

| Item | Value |
|------|-------|
| OS | Windows (win32) |
| Node.js | v24.13.1 |
| npm | 11.7.0 |
| Vite | 6.4.3 |
| Vitest | 4.1.10 |
| Browser | Not applicable (code audit) |
| Port | Not applicable |
| Dev mode | Not started (code audit only) |

## Automated Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Pass — no errors |
| `npx vitest run` | 728 passed (28 files) |
| CML-631E data loading tests | 8 passed |

## Root Cause Analysis

### Symptom Summary

1. "Filtra per livello scolastico" shows only "Tutti"
2. "Elemento di partenza" shows no nodes
3. Interface shows "Nessun elemento corrisponde alla ricerca"
4. "Elemento di destinazione" remains disabled
5. Console: `[CurManLight Storage Guard] Memoria persistenza rifiutata o non supportata dal browser.`

### Root Cause: Stale Closure in `initializeDataset()`

**File:** `src/features/curriculum-functional-pilot/hooks/useCurriculumPilot.ts`
**Lines:** 104-116

```tsx
const initializeDataset = useCallback((): ServiceResult<PilotDataset> => {
  setAsyncOperation('init');
  const result = initializePilotDataset();
  if (result.ok) {
    setPilotDatasetState(result.data);  // Line 108: queues state update
    setLastError(null);
    refreshData();                        // Line 110: called immediately
  } else {
    setLastError(result.error);
  }
  queueMicrotask(() => setAsyncOperation('none'));
  return result;
}, [refreshData]);
```

**Problem:** `refreshData()` is called immediately after `setPilotDatasetState(result.data)` on line 110. However, `refreshData` depends on `pilotDatasetState` (line 102) and captures it in its closure. Due to React's state batching, `pilotDatasetState` is still `null` when `refreshData()` executes. Therefore:

```tsx
if (pilotDatasetState) {  // false — stale closure sees null
  // segments and nodes are NOT loaded
}
```

React re-renders with the new `pilotDatasetState`, but `refreshData` is never called again. The result:
- `segmentsState` remains `[]`
- `nodesState` remains `[]`
- Segment filter shows only "Tutti" (because `pilot.segments` is empty)
- Node picker shows no results
- Target picker remains disabled

### Why Tests Pass

The CML-631E data loading tests (`cml631e-data-loading.test.ts`) bypass the React hook entirely and call service functions directly:

```tsx
const segments = listPilotSegments('pilot-version-001');
const primaryNodes = listPilotNodes('pilot-segment-math-primary-5');
const secondaryNodes = listPilotNodes('pilot-segment-math-secondary-1');
```

These operate on the in-memory service state, not the React state. They verify that the service layer correctly returns 2 segments and 6 nodes, but they do not verify the React hook's integration behavior.

### Storage Guard Analysis

**File:** `src/features/session/hooks/useAppStartupEffects.ts`
**Lines:** 66-78

```tsx
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persisted().then((persisted) => {
    if (!persisted) {
      navigator.storage.persist().then((granted) => {
        if (granted) {
          console.log("[CurManLight Storage Guard] Memoria persistenza d'Istituto concessa dal browser!");
        } else {
          console.warn('[CurManLight Storage Guard] Memoria persistenza rifiutata o non supportata dal browser.');
        }
      });
    }
  });
}
```

**Classification:** Non-blocking informational warning.

The Storage Guard uses the browser's `navigator.storage.persist()` API, which requests "persistent storage" for the site. This is:
- Different from IndexedDB availability
- Different from localStorage availability
- Not related to the pilot data loading issue
- Does not block any application functionality

The warning is expected in browsers that either don't support `navigator.storage.persist()` or where the user has not granted persistent storage. The application continues to function normally with regular IndexedDB.

### Why "Tutti" Appears Alone

The segment filter is rendered inside the `pilot.isPilotActive && pilot.isPilotInitialized` block (line 96 of `PilotMainView.tsx`). If the pilot is not initialized, the entire block is hidden. The user's observation of "Tutti" alone suggests:

1. The pilot was initialized (otherwise the block wouldn't render)
2. `pilot.segments` is empty (because `refreshData` didn't load them)
3. The "Tutti" button is hardcoded and always rendered when the block is visible

### Why Node Search Shows Nothing

`PilotNodePicker` receives `nodes={filteredNodes}` where `filteredNodes = pilot.nodes` (or filtered by segment). Since `pilot.nodes` is `[]` (because `refreshData` didn't load them), the picker has no nodes to display, resulting in "Nessun elemento corrisponde alla ricerca."

### Why Target Picker Is Disabled

In `PilotMainView.tsx`, the target picker is conditionally rendered with `isDisabled={!selectedSourceNodeId}`. Even if it were rendered, it would be disabled because no source node can be selected (no nodes available).

## Impact on T01–T05

The baseline is **not usable** for real teacher validation because:

1. After clicking "Inizializza Dataset Pilota", the pilot appears initialized but no data is loaded
2. The segment filter shows only "Tutti"
3. No nodes are visible in either picker
4. The flow cannot proceed past step 1
5. Teachers would be blocked immediately

## Classification

| Category | Description |
|----------|-------------|
| **A. Pilota non inizializzato** | Incorrect — pilot IS initialized, but data is not loaded due to stale closure |
| **B. Dati presenti ma non caricati** | **Correct** — data exists in service layer but is not loaded into React state |
| **C. Nodi caricati ma filtrati o non mostrati** | Incorrect — nodes are not loaded at all |
| **D. Persistenza locale non funzionante** | Incorrect — persistence is not the issue |
| **E. Avviso Storage Guard non bloccante** | Correct for the warning itself, but it's unrelated to the main issue |
| **F. Query non corrispondente** | Incorrect — the search logic is correct, there are simply no nodes to search |
| **G. Baseline pronta** | Incorrect — baseline has a blocking issue |

**Primary classification: B — Dati presenti ma non caricati (regressione di integrazione React)**

## Causal Chain

1. User clicks "Inizializza Dataset Pilota"
2. `initializeDataset()` calls `setPilotDatasetState(result.data)`
3. React queues state update (pilotDatasetState still null in current closure)
4. `refreshData()` is called immediately
5. `refreshData` checks `if (pilotDatasetState)` → false (stale null)
6. Segments and nodes are NOT loaded into React state
7. React re-renders with new `pilotDatasetState`
8. No `useEffect` triggers `refreshData` on state change
9. `segmentsState` and `nodesState` remain empty
10. UI shows empty segment filter and empty node picker

## Why This Was Not Detected Earlier

1. **Tests bypass React hook:** Service-layer tests call `listPilotSegments()` and `listPilotNodes()` directly, bypassing the stale closure issue
2. **A1 fix targeted the wrong layer:** The fix changed node loading logic inside `refreshData`, but the actual problem is that `refreshData` is never called with the updated state
3. **No integration test:** There is no test that verifies the React hook's behavior after initialization
4. **Visual verification not performed:** The CML-631E closure did not include actual browser-based UI verification

## Recommended Action

1. Do not conduct T01–T05 on this baseline
2. Create a corrective task to fix the stale closure in `initializeDataset()`
3. Add an integration test that verifies segments and nodes are loaded after initialization
4. Create a new baseline after the fix
5. Re-verify the new baseline with a browser-based smoke test before T01–T05

## Files Involved

| File | Role |
|------|------|
| `src/features/curriculum-functional-pilot/hooks/useCurriculumPilot.ts` | Contains the stale closure bug (lines 104-116) |
| `src/features/curriculum-functional-pilot/components/PilotMainView.tsx` | Renders empty UI because segments/nodes are empty |
| `src/features/curriculum-functional-pilot/components/PilotNodePicker.tsx` | Shows no results because `nodes` prop is empty |
| `src/features/session/hooks/useAppStartupEffects.ts` | Storage Guard warning (unrelated) |

## Evidence

- Code inspection of `useCurriculumPilot.ts` lines 91-116
- Code inspection of `PilotMainView.tsx` line 96 (conditional rendering)
- Code inspection of `useAppStartupEffects.ts` lines 66-78 (Storage Guard)
- Test results: 728 passed (service layer works, React integration does not)

## Confirmation

- No code modifications made during this audit
- No test modifications made during this audit
- No data modifications made during this audit
- No push, merge, or publication performed

## CML-631G — Fix Status

La correzione CML-631G è stata implementata sul branch `fix/cml-631g-pilot-initialization-refresh`.

### Modifiche

1. **Hook fix**: `useCurriculumPilot.ts` — aggiunto `useEffect` per reagire a `pilotDatasetState` e modificato `refreshData` per accettare `overrideDataset`;
2. **Test di integrazione**: aggiunto `cml631g-pilot-init.test.tsx` con 8 test che attraversano il componente `PilotMainView`;
3. **Documentazione**: creato `docs/CML_631G_PILOT_INITIALIZATION_REFRESH_FIX.md`.

### Verdetto

```text
CML_631G_PILOT_INITIALIZATION_REFRESH_COMPLETE_LOCAL
```

### Nuova baseline

```text
CML_631F_VALIDATION_BASELINE_02_RUNTIME_VERIFIED_READY_LOCAL
```

Vedi: `docs/CML_631F_VALIDATION_BASELINE_02.md`

### Baseline precedente

```text
CML-631F-BASELINE-01 — REVOKED
```

La baseline `CML-631F-BASELINE-01` non deve più essere utilizzata per alcuna sessione reale.

## Notes

- Il difetto era già presente in `b39e2d7`;
- Il commit `ec2899e` (docs-only) è indipendente dal difetto funzionale;
- Il Storage Guard rimane classificato come non bloccante e non causale.