# CML-633H — A02/A03 to A04 Transfer Contracts

## A02 → A04

### Contract
`executeA02ToA04Transfer(payload, archive, designRef)` uses `A02ToA04Payload` from `areaContracts.ts`.

### Preconditions
- `payload.nodeRefs` must be non-empty
- `payload.curriculumVersionRef` must be non-empty
- `payload.origin` must be present

### Execution
For each nodeRef:
1. Creates `EntityReference` for source entity
2. Creates `EntityReference` for curriculum version
3. Maps sources and evidences to `EntityReference[]`
4. Computes `structuralFootprint` via `computeStructuralFootprint`
5. Creates `DesignCurriculumSelection` with qualification `current-curriculum`
6. Validates the selection
7. Returns discriminated result with warnings

### Result
```typescript
{ ok: true, selection: DesignCurriculumSelection, warnings }
| { ok: false, error: DesignTransferError, warnings }
```

## A03 → A04

### Transfer Matrix

| Proposal Status / Decision | Transferable | Qualification |
|---------------------------|-------------|---------------|
| `draft` | ❌ | — |
| `ready-for-review` | ❌ | — |
| `submitted` | ✅ | `proposed-content` |
| `under-review` | ✅ | `proposed-content` |
| `accepted-for-decision` | ✅ | `proposed-content` |
| `changes-requested` | ❌ | — |
| `rejected` | ❌ | — |
| `withdrawn` | ❌ | — |
| `archived` | ❌ | — |
| `legacy` (not rejected) | ✅ | `legacy-content` |
| legacy + decision reject | ❌ | — |
| recorded-local `approve` | ✅ | `planned-institute-content` |
| recorded-local `approve-with-changes` | ✅ | `planned-institute-content` |
| recorded-local `reject` | ❌ | — |
| recorded-local `defer` | ❌ | — |
| recorded-local `record-only` | ✅ | `proposed-content` |

### Fallback
If no decision found for a non-blocked status, treated as `proposed-content`.

### Errors
- `MISSING_PROPOSAL_REFS`: no proposal references provided
- `PROPOSAL_NOT_FOUND`: proposal not in revision archive
- `NOT_TRANSFERABLE`: blocked by matrix