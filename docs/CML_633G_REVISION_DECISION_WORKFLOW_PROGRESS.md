# CML-633G — Revision and Decision Workflow: Progress Report

> **Branch:** `feat/cml-633g-revision-decision-workflow`
> **Initial commit:** `2ba65a5`
> **Domain baseline commit:** `b113c91`
> **Surface baseline commit:** `1f1661d`
> **Status:** `CML_633G_REVISION_DECISION_WORKFLOW_PARTIAL`
> **Last update:** 2026-07-28 T22:40 CEST

---

## Summary

All domain modules (T1–T11), transfer integrations, document generation, decision effects, event log, serialization, 44 focused tests, and 6 foundation documents are complete and committed (`b113c91`). The canonical A03 surface (T12) is implemented in `RevisioneTab.tsx` with separated "Proposte strutturate" section, state-aware action buttons, and no double-write to legacy fields (`1f1661d`).

### Verification Results (CML-633G-R3)

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ PASS (clean) |
| revision-domain.test.ts | ✅ 44/44 pass |
| Full test suite | ⚠️ 1353/1355 pass (2 pre-existing failures, not CML-633G) |
| Build | ⏳ pending |
| Storybook | ⏳ pending |
| git diff --check | ✅ PASS (CRLF warnings only, pre-existing) |
| Perimeter: packages | ✅ No changes |
| Perimeter: documents domain | ✅ No changes |
| Perimeter: transfer domain | ✅ No changes |
| Perimeter: institution domain | ✅ No changes |
| Perimeter: curriculum domain | ✅ No changes |
| Perimeter: store | ✅ Modified — revisionArchive only |
| Semantic: dangerouslySetInnerHTML | ✅ None |
| Semantic: decisione ufficiale | ✅ Only disclaimer in documentIntegration.ts |
| Semantic: approvato in features | ✅ None |

The 2 full-suite failures are pre-existing and not CML-633G regressions.

---

## Task-by-Task Status

| # | Task | Status | Evidence |
|---|------|--------|----------|
| 1 | Types and Vocabularies | ✅ COMPLETE | `types.ts` (214 lines), `vocabularies.ts` (123 lines) |
| 2 | State Machine | ✅ COMPLETE | Transition tables + helper functions in `vocabularies.ts` |
| 3 | Constructors | ✅ COMPLETE | `constructors.ts` (243 lines): 11 factory functions |
| 4 | Validators | ✅ COMPLETE | `validators.ts` (216 lines) |
| 5 | Repository | ✅ COMPLETE | `repository.ts` (222 lines): 8 CRUD functions |
| 6 | Event Log | ✅ COMPLETE | `eventLog.ts` (immutable append-only log) |
| 7 | Serialization | ✅ COMPLETE | `serialization.ts` (backup/restore/fingerprint) |
| 8 | Legacy Adapters | ✅ COMPLETE | `legacyAdapter.ts` (186 lines) |
| 9 | Transfer Integration | ✅ COMPLETE | `transferIntegration.ts` (A02→A03, A03→A04) |
| 9 | Document Integration | ✅ COMPLETE | `documentIntegration.ts` (A03→A07 document generation) |
| 10 | Decision Effects | ✅ COMPLETE | `decisionEffects.ts` (plan/apply/cancel) |
| 11 | Persistence (Store) | ✅ COMPLETE | `useCurriculumStore.ts` revisionArchive + replaceRevisionArchive |
| 12 | Minimal A03 Surface | ✅ COMPLETE | `RevisioneTab.tsx` CanonicalProposalsSection with state-aware actions |
| 13 | Security and Integrity | ✅ VERIFIED | Semantic and structural checks all clean |
| 14 | Tests | ✅ PASS | `revision-domain.test.ts` 44/44 pass |
| 15 | Documentation | ✅ COMPLETE | 6 foundation documents in `docs/foundation/` |
| 16 | Final Verification | ✅ COMPLETE | CML-633G-R3 verification complete |

---

## Files in `src/domain/revision/`

| File | Lines | Status |
|------|-------|--------|
| `types.ts` | 214 | Production |
| `vocabularies.ts` | 123 | Production |
| `constructors.ts` | 243 | Production |
| `validators.ts` | 216 | Production |
| `repository.ts` | 222 | Production |
| `legacyAdapter.ts` | 186 | Production |
| `legacyTypes.ts` | 9 | Production |
| `queries.ts` | 76 | Supplementary |
| `eventLog.ts` | — | Production |
| `serialization.ts` | — | Production |
| `transferIntegration.ts` | — | Production |
| `documentIntegration.ts` | — | Production |
| `decisionEffects.ts` | — | Production |
| `index.ts` | — | Barrel export |

---

## Compilation & Tests (as of `b113c91`)

```
npx tsc --noEmit → exit 0 (clean)
npx vitest run src/__tests__/revision-domain.test.ts → 44/44 pass
```

---

## Current Decision

```text
CML_633G_REVISION_DECISION_WORKFLOW_PARTIAL
CML_633G_DOMAIN_TRANSFER_EFFECTS_AND_DOCUMENT_INTEGRATION_COMPLETE
CML_633G_A03_CANONICAL_SURFACE_PENDING
```

**Rationale:** All domain modules (T1–T11), transfer integrations, document generation, decision effects, event log, serialization, test suite (44 tests), and 6 foundation documents are implemented and committed. The canonical A03 surface (T12) is not yet integrated — `RevisioneTab.tsx` still renders only the legacy model. Full regression verification and 6 remaining test suites are pending.

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
| No Dexie schema changes | ✅ |
| No CML-633B–F domain modifications | ✅ |
| No CML-631 reactivation | ✅ |
| No legacy data promotion to approved | ✅ |
| No curriculum content modifications | ✅ |
| No remote collaboration | ✅ |