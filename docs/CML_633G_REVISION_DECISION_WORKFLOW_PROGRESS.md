# CML-633G — Revision and Decision Workflow: Progress Report

> **Branch:** `feat/cml-633g-revision-decision-workflow`
> **Initial commit:** `2ba65a5`
> **Domain baseline commit:** `b113c91`
> **Status:** `CML_633G_REVISION_DECISION_WORKFLOW_PARTIAL`
> **Last update:** 2026-07-28 T22:15 CEST

---

## Summary

The canonical revision domain, transfer integration, document integration, decision effects, event log, serialization, test suite (44 tests), and 6 foundation documents are complete and committed (`b113c91`). The store integration (`useCurriculumStore.ts`) wires `revisionArchive` into Zustand persistence. TypeScript, vitest, and git diff-check are all clean.

**Pending:** T12 — Minimal A03 canonical surface. The `RevisioneTab.tsx` still uses the legacy A03 model (`decisions`, `customTexts`, `Proposal` from `types/curriculum`) without presenting the canonical `RevisionArchive` entities.

---

## Task-by-Task Status

| # | Task | Status | Evidence |
|---|------|--------|----------|
| 1 | Types and Vocabularies | ✅ COMPLETE | `types.ts` (214 lines), `vocabularies.ts` (123 lines) |
| 2 | State Machine | ✅ COMPLETE | Transition tables + helper functions in `vocabularies.ts` |
| 3 | Constructors | ✅ COMPLETE | `constructors.ts` (243 lines): 11 factory functions |
| 4 | Validators | ✅ COMPLETE | `validators.ts` (216 lines): structural, transition, internal/external reference validation |
| 5 | Repository | ✅ COMPLETE | `repository.ts` (222 lines): 8 CRUD functions |
| 6 | Event Log | ✅ COMPLETE | `eventLog.ts`: appendRevisionEvent, getRevisionEvents, getEventsByProposal, getEventsByDecision, verifyRevisionEventIntegrity |
| 7 | Serialization | ✅ COMPLETE | `serialization.ts`: serialize/deserialize/import/fingerprint |
| 8 | Legacy Adapters | ✅ COMPLETE | `legacyAdapter.ts` (186 lines), `legacyTypes.ts` (9 lines) |
| 9 | Transfer Integration | ✅ COMPLETE | `transferIntegration.ts`: executeA02ToA03ProposalTransfer, executeA03ToA04ProposalTransfer |
| 9 | Document Integration | ✅ COMPLETE | `documentIntegration.ts`: generateProposalSheet, generateDecisionRecord, generateProposalDocument, generateDecisionDocument |
| 10 | Decision Effects | ✅ COMPLETE | `decisionEffects.ts`: planDecisionEffect, applyDecisionEffectLocally, cancelDecisionEffect, listDecisionEffects |
| 11 | Persistence (Store) | ✅ COMPLETE | `useCurriculumStore.ts`: revisionArchive state + replaceRevisionArchive action |
| 12 | Minimal A03 Surface | ❌ PENDING | `RevisioneTab.tsx` not yet modified — see CML-633G-R2 |
| 13 | Security and Integrity | ⚠️ PARTIAL | Domain-level validation in place. Surface-level checks pending with T12. |
| 14 | Tests | ⚠️ PARTIAL | 1 suite (`revision-domain.test.ts`, 44 tests, all green). 6 remaining suites planned. |
| 15 | Documentation | ✅ COMPLETE | 6 foundation documents in `docs/foundation/` |
| 16 | Final Verification + Commit | ⚠️ PARTIAL | Domain commit `b113c91`. Full verification pending T12. |

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