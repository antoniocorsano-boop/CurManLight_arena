# CML-633G — Revision and Decision Workflow: Progress Report

> **Branch:** `feat/cml-633g-revision-decision-workflow`  
> **Initial commit:** `2ba65a5`  
> **Status:** `CML_633G_REVISION_DECISION_WORKFLOW_PARTIAL`  
> **Date:** 2026-07-28 T21:42 CEST  

---

## Summary

The canonical revision domain types, validators, constructors, state machines, repository, legacy adapters, queries, and store integration are in place and type-check. Missing: transfer integration contracts (A02→A03→A04→A07), event log, serialization, document integration, decision effects application logic, UI surface, tests, and documentation. The domain compiles cleanly (`tsc --noEmit` passes) but no tests exist.

---

## Task-by-Task Status

| # | Task | Status | Evidence |
|---|------|--------|----------|
| 1 | Types and Vocabularies | ✅ COMPLETE | `types.ts` (214 lines), `vocabularies.ts` (123 lines) |
| 2 | State Machine | ✅ COMPLETE | Transition tables + `canTransitionProposalStatus`/`canTransitionDecisionStatus` in `vocabularies.ts` |
| 3 | Constructors | ✅ COMPLETE | `constructors.ts` (243 lines): 11 factory functions including `createEmptyRevisionArchive`, `createProposal`, `createDecision`, `createRevisionEvent` |
| 4 | Validators | ✅ COMPLETE | `validators.ts` (216 lines): `validateProposal`, `validateProposalVersion`, `validateDecision`, `validateArchiveIntegrity`, mandatory rationale, external reference validation with resolvers |
| 5 | Repository | ✅ COMPLETE | `repository.ts` (222 lines): 8 exported functions — `createEmptyRevisionStore`, `cloneRevisionArchiveStore`, `addProposal`, `addProposalVersion`, `recordDecision`, `transitionProposalStatus`, `transitionDecisionStatus`, `verifyArchiveIntegrity` |
| 6 | Event Log | ❌ NOT IMPLEMENTED | `eventLog.ts` does not exist. `RevisionEvent` type defined but no domain-specific event log module. |
| 7 | Serialization | ❌ NOT IMPLEMENTED | `serialization.ts` does not exist. No `serializeRevisionArchive`/`deserializeRevisionArchive`/`fingerprintRevisionArchive`. |
| 8 | Legacy Adapters | ✅ COMPLETE | `legacyAdapter.ts` (186 lines), `legacyTypes.ts` (9 lines). Implementation diverges from plan: uses `importLegacyProposals`/`exportLegacyState` pattern instead of `adaptLegacyProposal`/`adaptLegacyDecisions` names, but covers the same scope. |
| 9 | Transfer Integration | ❌ NOT IMPLEMENTED | `transferIntegration.ts` does not exist. `documentIntegration.ts` does not exist. No A02→A03, A03→A04, A03→A07 contracts. |
| 10 | Decision Effects | ⚠️ PARTIAL | `DecisionEffectRecord` type defined. `DecisionEffectType` and `DecisionEffectStatus` enums defined. No `applyDecisionEffect` function. |
| 11 | Persistence (Store) | ✅ COMPLETE | `useCurriculumStore.ts` imports `RevisionArchive`, exposes `revisionArchive` state + `replaceRevisionArchive` action, wired into partialize/persistence/merge. |
| 12 | Minimal A03 Surface | ❌ NOT STARTED | `RevisioneTab.tsx` not modified. No canonical proposal/decision UI. |
| 13 | Security and Integrity | ❌ NOT VERIFIED | No dedicated audit performed. |
| 14 | Tests (7 planned) | ❌ NOT STARTED | 0 of 7 test files created. No `revision-*.test.ts` files anywhere in the project. |
| 15 | Documentation (6 planned) | ❌ NOT STARTED | 0 of 6 documentation files created. This report is the first CML-633G document. |
| 16 | Final Verification + Commit | ❌ NOT APPLICABLE | Blocked on missing tasks. |

---

## Files in `src/domain/revision/`

| File | Lines | Planned? | Status |
|------|-------|----------|--------|
| `types.ts` | 214 | ✅ | Production |
| `vocabularies.ts` | 123 | ✅ | Production |
| `constructors.ts` | 243 | ✅ | Production |
| `validators.ts` | 216 | ✅ | Production |
| `repository.ts` | 222 | ✅ | Production |
| `legacyAdapter.ts` | 186 | ✅ | Production |
| `legacyTypes.ts` | 9 | ✅ | Production |
| `queries.ts` | 76 | ❌ Not in plan | Supplementary — read models |
| `index.ts` | 8 | ✅ | Barrel export |
| **TOTAL** | **1,297** | | 9 files |

### Files planned but missing

- `stateMachine.ts` — merged into `vocabularies.ts` (acceptable consolidation)
- `eventLog.ts` — not created (Task 6)
- `serialization.ts` — not created (Task 7)
- `selectors.ts` — not created (mentioned in plan file structure)
- `transferIntegration.ts` — not created (Task 9)
- `documentIntegration.ts` — not created (Task 9)

---

## Cross-Domain Changes

| File | Change | Status |
|------|--------|--------|
| `src/domain/transfer/areaContracts.ts` | Added optional `decisionRefs` to `A03ToA04Payload` | ✅ Clean (no breaking changes) |
| `src/store/useCurriculumStore.ts` | Added `revisionArchive` state + `replaceRevisionArchive` action | ✅ Clean |
| `docs/06_architecture_governance/ARCHITECTURE_DECISION_INDEX.md` | Added CAD-001/CAD-002 entries | ✅ (non-CML-633G, done in session 20260728_052816) |

---

## Compilation Status

```
npx tsc --noEmit → exit 0 (clean)
```

No type errors. All domain files compile and the barrel export is complete for implemented modules.

---

## What Remains

### Critical Path (to reach COMPLETE)
1. **Task 6** — Create `eventLog.ts` (immutable local event log)
2. **Task 7** — Create `serialization.ts` (backup/restore/fingerprint)
3. **Task 9** — Create `transferIntegration.ts` (A02→A03, A03→A04, A03→A07)
4. **Task 9** — Create `documentIntegration.ts` (proposal/decision documents)
5. **Task 10** — Implement `applyDecisionEffect` in repository
6. **Task 14** — Write 7 test files
7. **Task 12** — Modify `RevisioneTab.tsx`
8. **Task 15** — Write 6 documentation files
9. **Task 16** — Final verification + commit

### Optionally Deferred
- Task 13 (Security audit — can be done during final verification)

---

## Constraints Compliance

| Constraint | Status |
|------------|--------|
| No main modification | ✅ |
| No push/merge/publication | ✅ |
| No governance changes | ✅ |
| No backend | ✅ |
| No authentication | ✅ |
| No digital signatures | ✅ |
| No institutional authority simulation | ✅ |
| No new dependencies | ✅ |
| No Dexie schema changes | ✅ (Option A — Zustand state only) |
| No CML-633B–F domain modifications | ✅ (only `areaContracts.ts` extended with optional field, no breaking changes) |
| No CML-631 reactivation | ✅ |
| No legacy data promotion to approved | ✅ |
| No curriculum content modifications | ✅ |
| No remote collaboration | ✅ |

---

## Decision

```text
CML_633G_REVISION_DECISION_WORKFLOW_PARTIAL
```

**Rationale:** Core domain entities, state machines, validators, constructors, repository, legacy adapters, and store persistence are implemented and compile cleanly. Six critical modules remain unimplemented (event log, serialization, transfer integration, document integration, decision effects, tests). Seven test files and six documentation files are planned but zero exist. The UI surface has not been started. This is not a blocked state — all prerequisites are in place — but it is substantially incomplete for a production merge.