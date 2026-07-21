# TY-001 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement TY-001 by typing CurManLight's highest-risk public contracts without turning the work into an opportunistic `any` cleanup.

**Architecture:** Work proceeds by trust boundary, not by file size or raw `any` count. Each batch must preserve the chain `Boundary -> DTO -> Domain -> ViewModel -> UI` and must stop at its declared scope.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, local Markdown governance docs.

---

## Scope Rule

No propagation. If a batch exposes another untyped area outside its scope, record it as a follow-up in the batch outcome and do not refactor it inside the current batch.

TY-001 remained `Approved` until all exit criteria in `CML-603C_TYPE_BOUNDARY_STRATEGY.md` were met. It moved to `Verified` only after implementation, validation, ADI update and decision outcome were complete.

## Green Repository Rule

A batch is complete only when the repository is green for its declared scope: `npx tsc --noEmit`, `npm test`, `npm run build`, and the batch-specific `rg`/architecture checks all pass. No batch may leave partially typed public contracts behind as accepted work.

## Batch Plan

| Batch | Scope | Risk | Dependencies | Rollback | Verification |
|---|---|---|---|---|---|
| 1 | `AppViewsLayerProps` | Medium | Existing domain/component prop shapes | Revert only `src/features/session/components/AppViewsLayer.tsx` plus any new local type file | `rg -n "any" src/features/session/components/AppViewsLayer.tsx`; `npx tsc --noEmit`; `npm test` |
| 2 | `AppModalsLayerProps` | Medium/High | Modal props, onboarding/session/workspace/copilot state | Revert only `src/features/session/components/AppModalsLayer.tsx` plus any new local type file | `rg -n "any" src/features/session/components/AppModalsLayer.tsx`; `npx tsc --noEmit`; `npm test` |
| 3 | Shared Hooks | Medium | Hook return values and browser boundaries already used by App | Revert changed hook files independently | `rg -n "export function|export const|interface .*Props|: any" src/hooks src/features/*/hooks`; `npx tsc --noEmit`; targeted tests |
| 4 | Shared Stores | Medium | Zustand state contracts and `src/types/curriculum.ts` | Revert changed store/type files as one batch | `rg -n "any" src/stores src/types`; `npx tsc --noEmit`; `npm test` |
| 5 | Feature Boundaries | High | Domain DTOs, ViewModels, component public props | Revert one domain at a time | Domain review; `npx tsc --noEmit`; `npm test`; `npm run build` |

## Batch 1 - AppViewsLayerProps

**Files:**

- Modify: `src/features/session/components/AppViewsLayer.tsx`
- Create if needed: `src/features/session/types/appViewContracts.ts`
- Read only: `src/App.tsx`, domain tab component prop interfaces

- [x] Replace public `any` fields in `AppViewsLayerProps` with explicit primitives, imported domain types, `React.Dispatch<React.SetStateAction<T>>`, and named callback types.
- [x] Keep internal casts outside the public interface if a downstream domain still requires them.
- [x] Record any downstream untyped dependency in the batch outcome section of `CML-603C_TYPE_BOUNDARY_STRATEGY.md`.
- [x] Run `rg -n "any" src/features/session/components/AppViewsLayer.tsx` and expect no matches inside `AppViewsLayerProps`.
- [x] Run `npx tsc --noEmit` and expect success.
- [x] Run `npm test` and expect 59 passing tests.

## Batch 2 - AppModalsLayerProps

**Files:**

- Modify: `src/features/session/components/AppModalsLayer.tsx`
- Create if needed: `src/features/session/types/appModalContracts.ts`
- Read only: `src/features/session/components/SessionModals.tsx`, workspace/copilot/document modal props

- [x] Replace public `any` fields in `AppModalsLayerProps` with modal ViewModel and callback contracts.
- [x] Isolate browser/runtime adapter values such as PWA install, Drive sync, local agent state and speech/microphone state behind named types.
- [x] Do not type unrelated modal internals in the same batch.
- [x] Run `rg -n "any" src/features/session/components/AppModalsLayer.tsx` and expect no matches inside `AppModalsLayerProps`.
- [x] Run `npx tsc --noEmit` and expect success.
- [x] Run `npm test` and expect 59 passing tests.

## Batch 3 - Shared Hooks

**Files:**

- Modify selectively: `src/hooks/*.ts`, `src/features/*/hooks/*.ts`
- Create if needed: domain-local `types/*.ts` files under the owning feature

- [x] Type exported hook argument and return contracts touched by App/session flows.
- [x] Convert external runtime data to `unknown` at entry points before narrowing.
- [x] Leave internal implementation `any` only when it is isolated and documented in the batch outcome.
- [x] Run `npx tsc --noEmit` and targeted Vitest suites.

## Batch 4 - Shared Stores

**Files:**

- Modify selectively: `src/stores/*.ts`, `src/types/curriculum.ts`

- [x] Type public Zustand state slices and actions used across domains.
- [x] Keep persisted/rehydrated data classified as boundary input until validated.
- [x] Run `npx tsc --noEmit`, `npm test`, and `npm run build`.

## Batch 5 - Feature Boundaries

**Files:**

- Modify one domain at a time under `src/features/<domain>/`
- Create domain-local DTO/ViewModel files where needed

- [x] Define DTO, domain model and ViewModel contracts for the selected feature boundary.
- [x] Add or update typed fixtures for the touched boundary.
- [x] Run `npx tsc --noEmit`, `npm test`, and `npm run build` before closing the batch.

## Trusted Flow Coverage

| Flow | Current | Target CML-603C | Verification |
|---|:---:|:---:|---|
| Curriculum | Partial | Complete | Import DTO -> domain model -> curriculum ViewModel |
| Classroom | Partial | Partial+ | Persisted classroom DTO -> domain model -> classroom UI props |
| Planning | Partial | Partial+ | UDA draft/domain model -> planning ViewModel |
| Documents | Missing | Partial | Document export DTO -> trusted document output contract |
| Workspace | Partial | Partial+ | Backup/sync DTO -> workspace state -> modal ViewModel |
| Copilot | Partial | Partial+ | Browser capability adapter -> agent setup ViewModel |

## Completion Rule

After each batch, update `CML-603C_TYPE_BOUNDARY_STRATEGY.md` with observed outcome and residual risks. After all batches pass, update the ADI from `Approved` to `Verified` and add a TY-001 Decision Outcome.
