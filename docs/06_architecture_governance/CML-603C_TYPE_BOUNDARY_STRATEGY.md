# CML-603C - Type Boundary Strategy

> **Decision scope**: define how data becomes trusted in CurManLight, from external runtime inputs to typed UI contracts.

## Context

CML-603B verified the governance process on an infrastructure layer. CML-603C applies the same process to a broader architectural concern: type safety across system boundaries.

The repository currently compiles and passes tests, but many public component and hook contracts still use `any`. The baseline scan reports 548 `any` occurrences in `src`. This number is useful as a diagnostic, not as the governing success metric.

CML-603C does not start from files and does not start from `any` removal. It starts from the boundaries where untrusted data enters or leaves the application.

## Problem

CurManLight handles data from browser APIs, local storage, files, Google Drive, generated documents, service worker lifecycle, clipboard APIs, Web Speech APIs, and user-driven imports.

Without a typed boundary strategy, untrusted data can flow directly into domain state, UI props, and persistence structures. This creates hidden coupling and makes future React/domain modularization riskier.

## Boundary Inventory

| Boundary | Origin | Destination | Current state | Target state | Priority |
|---|---|---|---|---|---|
| `localStorage` consolidated state | Browser | Session/domain state | Partially typed, JSON parsed directly | `unknown` at read, parser to DTO, domain model after validation | High |
| Emergency backup / restore | File/local storage | Workspace/session state | JSON parsed into broad objects | Backup DTO with validator and restore result | High |
| Import `.cml` / curriculum payloads | File | Curriculum domain | JSON/CSV parsed with broad shapes | Import DTO and curriculum adapter | High |
| Google Drive sync | Remote API | Workspace/session state | Fetch responses and file payloads loosely typed | Drive DTOs and conflict model | High |
| App views boundary | Session orchestrator | Domain UI views | `AppViewsLayerProps` uses `any` broadly | Typed ViewModel-style props | High |
| App modals boundary | Session orchestrator | Modal components | `AppModalsLayerProps` uses `any` broadly | Typed modal ViewModels and handlers | High |
| Document export | Domain | HTML/PDF/SCORM/clipboard | Some typed input, generated HTML string output | Document DTO/ViewModel and trusted HTML pipeline | Medium |
| Clipboard | Browser | UI/document flows | Canonical utility typed as string/Promise | Keep typed, classify as browser adapter | Low |
| Service Worker | Runtime | App lifecycle | Development-era reset documented in CML-603A | Versioned runtime event contract | Medium |
| Web Speech / microphone | Browser | Copilot/UI | Browser APIs accessed through `any` | Speech adapter types and permission DTO | Medium |
| OAuth token/userinfo | Remote/browser token | Workspace/session | Parsed token/userinfo loosely typed | OAuth DTO and user identity parser | Medium |
| File System Access API | Browser | Workspace export | `window as any` fallback | Optional browser capability adapter | Low |

## Domain Contracts

Every domain exposes contracts, not implementations.

| Domain | Incoming DTOs | Domain model | ViewModel / UI contract | First CML-603C action |
|---|---|---|---|---|
| Session | Onboarding profile, runtime restore, navigation state | Role, order, session flags, selected views | `AppViewsLayerProps`, `AppModalsLayerProps` | Replace public `any` contracts with typed props |
| Curriculum | CSV rows, `.cml` import, generated curriculum payload | Curriculum map, proposals, decisions | Curriculum tab and review props | Define curriculum import DTO and parser result |
| Classroom | persisted classroom state, imported students, cooperative groups | Students, feedback, grouping, classroom layout | Classroom workspace props | Define classroom state DTOs and layout unions |
| Planning | UDA drafts, generated UDA, planning wizard state | `UdaModel`, draft fields, status | Planning tab props and modal props | Stabilize UDA/draft ViewModel contracts |
| Documents | export config, template config, generated document text | Document generation model | Export/preview modal props | Define trusted document output contract |
| Knowledge | custom docs, glossary, wiki volumes | Knowledge document and graph model | Reader/search ViewModel | Type custom document and graph node contracts |
| Workspace | Drive account, sync payload, backup payload | Workspace identity, sync status, conflict state | Workspace modal and sync handlers | Type backup and sync DTOs |
| Copilot | local agent config, speech events, chat context | Agent status, recommendation, message context | Copilot panel/modal props | Type browser adapter events and agent setup props |
| Settings | persisted options, profile preferences | User settings and runtime flags | Settings modal props | Type profile/settings DTOs |

## Trust Zones

| Zone | Allowed types | Rule |
|---|---|---|
| External runtime | `unknown` | Browser, file, network and storage data are untrusted at entry |
| Adapter | `unknown` -> DTO | Adapters parse, validate and normalize data before domain use |
| DTO | Explicit serializable types | DTOs represent transport/storage shape, not UI state |
| Domain | Strong domain types | Domain code never consumes unvalidated external structures |
| ViewModel | Explicit UI-facing types | UI receives stable contracts, not raw DTOs or broad records |
| UI | Typed props and callbacks | Public component props do not use `any` |
| Tests | Typed fixtures | Tests use typed fixture builders for boundary and domain cases |

## Alternatives Considered

| Alternative | Decision | Reason |
|---|---|---|
| Count and remove `any` occurrences globally | Rejected | Optimizes a metric without addressing trust boundaries |
| Type files from largest to smallest | Rejected | File size does not identify architecture risk |
| Type only domain models | Rejected | Leaves unsafe data at runtime/storage/file boundaries |
| Boundary-first typed architecture | Approved | Makes data trust explicit and gives future refactors stable contracts |

## Approved Decision

### TY-001 - Typed Boundary Architecture

CurManLight uses a boundary-first type architecture:

```text
Boundary
-> DTO
-> Domain
-> ViewModel
-> UI
```

Rules:

1. `unknown` is allowed at external boundaries.
2. `any` is not allowed in public contracts for components, hooks, stores or shared utilities.
3. External data must be validated or normalized before it enters domain state.
4. DTOs describe storage, file, network or runtime payloads.
5. Domain models describe application meaning and must not depend on unvalidated structures.
6. ViewModels describe the shape consumed by UI components.
7. Tests use typed fixtures for DTO, domain and ViewModel scenarios.
8. Existing `any` can remain temporarily only when it is internal, documented, and scheduled behind a boundary migration item.

## Boundary Coverage Dashboard

| Indicator | Baseline | Observed after TY-001 | Target final |
|---|:---:|:---:|:---:|
| Boundary inventory | 100% | 100% | 100% |
| Boundary typed | 20% | 100% | 100% |
| DTO explicit | 35% | 75% | 100% |
| Domain model explicit | 70% | 80% | 100% |
| ViewModel explicit | 45% | 85% | 100% |
| UI contracts typed | 60% | 100% | 100% |

These values are architectural indicators. The observed TY-001 values reflect verified feature, hook, store and runtime/browser boundary contracts; they will be reviewed again in CML-603F and frozen in the CML-604 Architecture Baseline.

## Implementation Plan

The operative batch plan is [TY-001_IMPLEMENTATION_PLAN.md](./TY-001_IMPLEMENTATION_PLAN.md).

Implementation must follow the no-propagation rule: each batch changes only its declared contract surface and records newly discovered type debt as follow-up evidence.

## Trusted Flow Coverage

| Flow | Current | Target CML-603C | Verification |
|---|:---:|:---:|---|
| Curriculum | Partial | Complete | Import DTO -> domain model -> curriculum ViewModel |
| Classroom | Partial | Partial+ | Persisted classroom DTO -> domain model -> classroom UI props |
| Planning | Partial | Partial+ | UDA draft/domain model -> planning ViewModel |
| Documents | Missing | Partial | Document export DTO -> trusted document output contract |
| Workspace | Partial | Partial+ | Backup/sync DTO -> workspace state -> modal ViewModel |
| Copilot | Partial | Partial+ | Browser capability adapter -> agent setup ViewModel |

## Migration Plan

| Step | Scope | Objective | Verification |
|---|---|---|---|
| 1 | `AppViewsLayerProps` | Replace public `any` props with typed ViewModel and callback contracts | `rg` no `any` in `AppViewsLayerProps`; `tsc`; tests |
| 2 | `AppModalsLayerProps` | Replace modal public `any` props with typed modal contracts | `rg` no `any` in `AppModalsLayerProps`; `tsc`; tests |
| 3 | Storage and backup boundaries | Parse `localStorage`, backup and restore payloads through DTO validators | Restore/import unit tests; `tsc`; tests |
| 4 | Import/export boundaries | Type CSV, `.cml`, document export and SCORM contracts | Import/export tests; build |
| 5 | Workspace/Drive boundary | Type fetch responses, sync payloads and conflict state | Sync handler tests with mocked network |
| 6 | Browser capability adapters | Type Web Speech, clipboard and File System Access wrappers | Adapter tests or smoke tests |
| 7 | Domain component contracts | Move remaining UI props to ViewModel contracts by domain | Domain review and `rg` checks |

## Verification Criteria

TY-001 can move to `Verified` only when:

- all boundaries listed here are classified;
- `AppViewsLayerProps` has no `any`;
- `AppModalsLayerProps` has no `any`;
- public component, hook and store contracts touched by CML-603C avoid `any`;
- primary storage/import boundaries use `unknown` plus DTO validation or normalization;
- Boundary Coverage Dashboard is updated with observed values;
- `npx tsc --noEmit` passes;
- `npm test` passes;
- `npm run build` passes;
- ADI marks TY-001 as `Verified` only after implementation and verification evidence exist.

## Decision Register

| ID | Decision | Status | Impact |
|---|---|---|---|
| TY-001 | CurManLight uses boundary-first typed architecture | Verified | High |

## Architectural Health Impact

| Area | Before CML-603C | Target after CML-603C | Impact |
|---|:---:|:---:|---|
| Type Safety | 2/5 | 4/5 | Boundary contracts verified; broader type hardening remains future work |
| Boundary Coverage | 2/5 | 5/5 | Main CML-603C trust boundaries are classified, typed and verified |
| Maintainability | 4/5 | 5/5 | Public contracts are explicit across feature, hook and store boundaries |
| Domain Separation | 4/5 | 4/5 | Prepares domain modularization with explicit contracts |
| Test Confidence | 3/5 | 4/5 | Requires typed fixtures and boundary tests |

## Governance Review

| Check | Status | Evidence |
|---|---|---|
| ADR coherent | Passed | CML-603 requires documented architecture decisions before implementation |
| ADI updated | Passed | TY-001 traceability updated after Batches 1-5 and verification |
| Decision paper complete | Passed | Context, problem, inventory, trust zones, decision, migration and verification are present |
| Traceability complete | Passed | ADI links TY-001 to implemented contracts, validation commands and deferred legacy simulator status |
| Architectural Health updated | Passed | Type Safety and Boundary Coverage targets reached for CML-603C feature/store/hook boundaries |
| Gate unchanged | Passed | CML-603F still requires approved type strategy before CML-604 |


## Batch Outcomes

| Batch | Status | Observed outcome | Verification | Residual risk |
|---|---|---|---|---|
| 1 - `AppViewsLayerProps` | Complete | `AppViewsLayerProps` moved to an explicit session contract; `AppViewsLayer.tsx` and `appViewContracts.ts` contain 0 `any`; local `as any` tab casts removed | `rg` no `any`; `npx tsc --noEmit`; `npm test` 59/59; `npm run build` | Downstream component props still contain `any`; deferred by no-propagation rule to later batches |
| 2 - `AppModalsLayerProps` | Complete | `AppModalsLayerProps` moved to an explicit modal contract; `AppModalsLayer.tsx` and `appModalContracts.ts` contain 0 `any`; local runtime/tab casts replaced with guards | `rg` no `any`; `npx tsc --noEmit`; `npm test` 59/59; `npm run build` | Downstream modal props still contain `any`; deferred by no-propagation rule to later batches |
| 3 - Shared Hooks | Complete | Root shared hooks and session autosave boundary now expose typed contracts; Web Speech, OAuth token parsing and emergency backup restore use typed/`unknown` boundaries | `rg` no `any` in selected hook targets; `npx tsc --noEmit`; `npm test` 59/59; `npm run build` | Feature hook `any` residuals resolved by Batch 5; broader storage/import hardening continues under future runtime/data decisions |
| 4 - Shared Stores | Complete | Modular Zustand stores now expose public state/action contracts from their owning modules and shared barrel; active curriculum store IndexedDB boundary no longer uses `any` for the Dexie handle/read result | `rg` no `any` in `src/stores`, active store has no `any`; `npx tsc --noEmit`; `npm test` 59/59; `npm run build` | Legacy simulator still contains an internal `as any`; deferred by no-propagation rule because it is outside shared store contracts |
| 5 - Feature Boundaries | Complete | Exported feature component props, domain ViewModels, classroom/social/curriculum/workspace/copilot boundary hooks and browser capability adapters now use explicit contracts; `src/features` contains 0 `any`/`as any` matches | `rg -n "\bany\b|as any|window as any|navigator as any" src\features` no matches; `npx tsc --noEmit`; `npm test` 59/59; `npm run build` | Legacy simulator outside `src/features` remains deferred for a future legacy/simulator decision |

## Decision Outcome

| Item | Expected outcome | Observed outcome | Status |
|---|---|---|---|
| TY-001 | Boundary-first typed contracts across App layer, hooks, stores and feature boundaries | Batches 1-5 completed; `src/features`, selected shared hooks, `src/stores` and active curriculum store contracts have no public `any` | Verified |
| Validation | Green Repository Rule after each batch | `npx tsc --noEmit`, `npm test` 59/59 and `npm run build` pass after Batch 5 | Verified |
| Deferred legacy item | Legacy simulator explicitly classified outside TY-001 | `src/store/curmanlight_v2_core_simulator.ts` retains internal `as any`; deferred for future legacy/simulator decision | Deferred |
## Exit Criteria

CML-603C is complete only when TY-001 has followed the complete lifecycle:

```text
Decision
-> Document
-> Implementation
-> Verification
-> ADI
-> Verified
```

The milestone must not be closed by reducing the raw `any` count alone.
