# CML-631F — Baseline Runtime Audit Evidence

## Evidence Record

**Date:** 2026-07-26
**Auditor:** Kilo (automated)
**Baseline:** CML-631F-BASELINE-01
**Commit audited:** b39e2d7 (HEAD was ec2899e — mismatch documented)

## Code Evidence

### Stale Closure in `initializeDataset()`

**File:** `src/features/curriculum-functional-pilot/hooks/useCurriculumPilot.ts`
**Lines:** 104-116

```tsx
const initializeDataset = useCallback((): ServiceResult<PilotDataset> => {
  setAsyncOperation('init');
  const result = initializePilotDataset();
  if (result.ok) {
    setPilotDatasetState(result.data);  // Line 108: queues state update
    setLastError(null);
    refreshData();                        // Line 110: called with stale closure
  } else {
    setLastError(result.error);
  }
  queueMicrotask(() => setAsyncOperation('none'));
  return result;
}, [refreshData]);
```

**`refreshData` definition (lines 91-102):**

```tsx
const refreshData = useCallback(() => {
  setVersionsState(listPilotVersions().ok ? ... : []);
  if (pilotDatasetState) {  // Captures stale null value
    setSegmentsState(...);
    const allNodes = pilotDatasetState.segmentIds.flatMap(...);
    setNodesState(allNodes);
    setLinksState(...);
  }
}, [pilotDatasetState]);  // Depends on pilotDatasetState
```

**Issue:** `refreshData` depends on `pilotDatasetState` and captures it in its closure. When called on line 110 immediately after `setPilotDatasetState(result.data)`, the state update has not been processed yet, so `pilotDatasetState` is still `null`.

### Conditional Rendering in `PilotMainView`

**File:** `src/features/curriculum-functional-pilot/components/PilotMainView.tsx`
**Line:** 96

```tsx
{pilot.isPilotActive && pilot.isPilotInitialized && (
  <div className="space-y-6 fade-in">
```

The entire guided flow UI (segment filter, node pickers, relation form) is only rendered when both conditions are true. If `refreshData` doesn't run after initialization, `segments` and `nodes` remain empty, but the block still renders because `isPilotInitialized` is true.

### Storage Guard Warning

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

**Classification:** Non-blocking. Uses `navigator.storage.persist()` API. Does not affect IndexedDB, localStorage, or pilot functionality.

## Diagnostic Matrix

| Level | Expected | Observed | Result | Evidence |
|-------|----------|----------|--------|----------|
| Pilot | initialized | initialized (service layer) | OK | `initializePilotDataset()` returns dataset |
| Pilot | data loaded into React state | NOT loaded | FAIL | Stale closure in `initializeDataset()` |
| Segments | 2 available | 0 in React state | FAIL | `refreshData()` skipped due to stale `pilotDatasetState` |
| Nodes | 6 available | 0 in React state | FAIL | Same root cause |
| Segment filter | "Tutti" + 2 segments | "Tutti" only | FAIL | `pilot.segments` is empty |
| Node search | results visible | no results | FAIL | `pilot.nodes` is empty |
| Source selection | possible | impossible | FAIL | No nodes to select |
| Target picker | enabled after source | disabled | FAIL | No source can be selected |
| Relations | available | not reachable | BLOCKED | Flow blocked at step 1 |
| Summary | correct | not reachable | BLOCKED | Flow blocked at step 1 |
| Confirmation | registration succeeds | not reachable | BLOCKED | Flow blocked at step 1 |
| Reload | data preserved | not testable | BLOCKED | Flow never completes |
| Storage Guard | non-blocking | non-blocking | OK | Unrelated warning |

## Test Evidence

- **Service layer tests:** 8/8 passed — `listPilotSegments()` and `listPilotNodes()` return correct data when called directly
- **React integration tests:** None exist — no test verifies that segments/nodes are loaded into React state after `initializeDataset()`
- **TypeScript:** Clean — no compile errors
- **Build:** Not run (code audit only)

## Why This Was Not Detected by CML-631E

1. CML-631E tests call service functions directly, bypassing the React hook
2. The A1 fix changed node loading logic inside `refreshData`, not the stale closure issue
3. No integration test verifies React state after initialization
4. Visual browser verification was not part of CML-631E closure

## Next Steps Required

1. Fix stale closure in `initializeDataset()`
2. Add React integration test for post-initialization state
3. Verify with actual browser session
4. Create new baseline
5. Re-run T01–T05 on fixed baseline