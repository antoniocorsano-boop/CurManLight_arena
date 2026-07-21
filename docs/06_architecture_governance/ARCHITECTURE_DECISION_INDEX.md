# Architecture Decision Index

> Central index for CurManLight architecture decisions. This document maps decisions to their source document, implementation location, verification method, lifecycle status, and traceability.

## Purpose

The Architecture Decision Index (ADI) is the navigable map of CurManLight governance. It answers four questions for every significant architecture decision:

1. Where was the decision made?
2. What category does it belong to?
3. Where is it implemented or expected to be implemented?
4. How is it verified?

## Decision Status Lifecycle

```text
Draft
-> Proposed
-> Approved
-> Implemented
-> Verified
-> Deprecated
```

## Decision Register

| ID | Categoria | Decisione | Documento | Stato | Impatto |
|---|---|---|---|---|---|
| ADR-0001 | Governance | CurManLight enters architectural stabilization; no new feature work during CML-603 | [CML-603](./CML-603_ARCHITECTURE_GOVERNANCE.md) | Implemented | Alto |
| RT-001 | Runtime | CurManLight e' local-first e offline-capable | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | Approved | Alto |
| RT-002 | Runtime | Nessun backend obbligatorio | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | Approved | Alto |
| RT-003 | Runtime | Il browser e' il runtime canonico | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | Approved | Alto |
| RT-004 | Runtime | La PWA e' un runtime installabile supportato | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | Approved | Alto |
| RT-005 | Runtime | Il file locale resta supportato come fallback | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | Approved | Medio |
| RT-006 | Runtime | La sincronizzazione e' manual-first con prompt assistiti | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | Approved | Alto |
| RT-007 | Runtime | La sovrascrittura remota silenziosa e' vietata | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | Approved | Alto |
| RT-008 | Runtime | Il Service Worker e' versionato e governato da lifecycle | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | Approved | Alto |
| RT-009 | Runtime | `unregister()` e `caches.delete()` all'avvio sono comportamento development-era | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | Approved | Alto |
| RT-010 | Runtime | Runtime, schema dati, export, template e cache hanno versioni separate | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | Approved | Medio |
| RT-011 | Runtime | Gli stati di errore sono stati di prodotto con recovery visibile | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | Approved | Alto |
| UT-001 | Utility | `src/lib` is the canonical shared utility layer | [CML-603B](./CML-603B_UTILITY_LAYER_CONSOLIDATION.md) | Verified | Alto |
| TY-001 | Types | Boundary-first typed architecture | [CML-603C](./CML-603C_TYPE_BOUNDARY_STRATEGY.md) | Verified | Alto |
| TS-001 | Tests | Interaction tests govern primary user flows | [CML-603D](./CML-603D_INTERACTION_TESTS.md) | Verified | Medio |
| DM-001 | Domains | Domain modularization is the unit of React evolution | [CML-603E](./CML-603E_DOMAIN_MODULARIZATION.md) | Verified | Alto |
| NAV-001 | Navigation | Navigation strategy aligns tabs, routes and deep links | [CML-604A](../07_navigation_program/CML-604A_NAVIGATION_STRATEGY.md) | Superseded by NAV-002 | Medio |
| NAV-002 | Navigation | React Router v7 is the canonical navigation system | [CML-604A](../07_navigation_program/CML-604A_NAVIGATION_STRATEGY.md) | Verified | Alto |
| DS-001 | Design System | UI primitives and responsive patterns are governed centrally | Future CML-604+ | Draft | Medio |


## CML-603 Progress Snapshot

| Metric | Value | Evidence |
|---|:---:|---|
| CML-603 Status | **Completed** | Milestone closed 2026-07-21; baseline frozen |
| Verified implementation decisions | 4 / 4 | UT-001, TY-001, TS-001 and DM-001 are Verified |
| Approved runtime policy decisions | 11 / 11 | RT-001 through RT-011 are Approved in CML-603A and traced for future runtime verification |
| Architecture Gate | PASSED | CML-603F verified the program as a whole; report linked below |

## CML-604 Progress Snapshot

| Metric | Value | Evidence |
|---|:---:|---|
| CML-604 Status | **In Progress** | CML-604A, 604B, 604C, 604D verified; CML-604F next |
| Navigation decisions | 1 / 1 Verified | NAV-002 (React Router) Verified |
| Shell decisions | 1 / 1 Verified | Shell-001 (Application Shell) Verified |
| Persistence decisions | 1 / 1 Verified | Persist-001 (State Persistence Rules) Verified |
| Navigation tests | 1 / 1 Verified | NavTest-001 (Navigation Behavior Tests) Verified |
| Architecture Gate | Pending | CML-604F after all phases complete |
| Next phase | CML-604F Architecture Gate | Final gate for CML-604 |

## Known External Blockers

| ID | Blocker | Stato | Impatto | Evidence |
|---|---|---|---|---|
| BL-001 | `index.html` generated diff / whitespace | Open - Accepted | Generated artifact hygiene; no architectural impact; accepted by CML-603F | `git diff --check -- index.html` fails after build-generated tracked artifact; scoped `git diff --check -- . ':!index.html'` is clean |

## Traceability Matrix

| Decisione | Documento | Implementazione | Verifica |
|---|---|---|---|
| ADR-0001 | [CML-603](./CML-603_ARCHITECTURE_GOVERNANCE.md) | Governance docs and CML-603 gate process | [CML-603F Architecture Gate: PASSED](./CML-603F_PRODUCT_ARCHITECTURE_REVIEW.md) |
| RT-001 | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | Runtime policy, storage strategy, export fallback | Offline/volatile-storage interaction tests |
| RT-002 | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | Static deploy, local-first code paths | Build without backend configuration |
| RT-003 | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | Browser app shell, PWA wrapper, file mode fallback | Browser compatibility smoke tests |
| RT-004 | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | `sw.js`, `manifest.json`, install flow | PWA install/update tests |
| RT-005 | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | `file:` protocol guards and unsupported API fallback | File-mode smoke test |
| RT-006 | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | Workspace sync handlers and prompts | Sync flow interaction tests |
| RT-007 | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | Conflict detection before remote restore | Conflict-resolution tests |
| RT-008 | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | Versioned service worker lifecycle | Cache/update/rollback tests |
| RT-009 | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | Removal or gating of startup cache reset in `src/main.tsx` | Runtime startup regression test |
| RT-010 | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | Runtime/data/export/template/cache version constants | Migration/version unit tests |
| RT-011 | [CML-603A](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | Global alerts, storage guard, recovery UX | Failure-mode interaction tests |
| UT-001 | [CML-603B](./CML-603B_UTILITY_LAYER_CONSOLIDATION.md) | `src/lib` canonical imports; duplicate `src/utils` utilities removed | No `src/utils` imports; no duplicate utility files; `tsc`; tests; build |
| TY-001 | [CML-603C](./CML-603C_TYPE_BOUNDARY_STRATEGY.md) | Batches 1-5 complete: App layer contracts, selected shared hooks, shared store contracts, feature component props, domain ViewModels and runtime/browser boundary adapters; deferred: legacy simulator outside TY-001 | `src/features` contains 0 `any`/`as any` matches; selected shared hooks and stores contain no public `any`; `npx tsc --noEmit`; `npm test` 59/59; `npm run build`; legacy simulator deferred outside TY-001 |
| TS-001 | [CML-603D](./CML-603D_INTERACTION_TESTS.md) | `src/__tests__/interaction.cml603d.test.tsx` covers 5/5 priority flows using React interaction harnesses and mocked runtime/network boundaries | `npx vitest run src/__tests__/interaction.cml603d.test.tsx` 5/5; `npx tsc --noEmit`; `npm test` 64/64; `npm run build`; scoped `git diff --check` clean; global `git diff --check` blocked only by BL-001 outside TS-001 scope |
| DM-001 | [CML-603E](./CML-603E_DOMAIN_MODULARIZATION.md) | Active domains expose root public APIs in `src/features/<domain>/index.ts`; cross-domain imports touched by DM-001 use those APIs; TS-001 tests consume public feature APIs | Public entrypoint scan complete; no cross-domain imports into active domain `components/hooks/types/data`; dependency audit lists intentional edges; `npx tsc --noEmit`; `npm test` 64/64; `npm run build`; scoped `git diff --check` clean with BL-001 external |
| NAV-001 | Future CML-604+ | Router/navigation integration | Route/deep-link interaction tests |
| NAV-002 | [CML-604A](../07_navigation_program/CML-604A_NAVIGATION_STRATEGY.md) | `BrowserRouter` in `main.tsx`; `activeTab` derived from URL via `useLocation`; `handleTabSwitch` calls `navigate()` | `npx tsc --noEmit`; `npm test` 64/64; `npm run build`; deep linking, back/forward, refresh all work |
| DS-001 | Future CML-604+ | Shared UI primitives and design tokens | Visual/accessibility regression checks |

## Governance Rule

Every future architecture decision must be added to this index before it is implemented.

Every implemented decision must eventually move from **Approved** to **Implemented** and then to **Verified** with evidence.

## Baseline Rule

CML-604 Architecture Baseline cannot be opened until:

- all CML-603A-F decisions are listed here;
- all implemented decisions have traceability entries;
- CML-603F verifies the Architecture Gate criteria;
- the Architectural Health Dashboard is updated.

## Architecture Gate Result

[CML-603F Product Architecture Review](./CML-603F_PRODUCT_ARCHITECTURE_REVIEW.md) passed the program gate with 4/4 implementation decisions verified. BL-001 remains open but is accepted as a generated-artifact exception with no observed architectural impact. CML-604 Architecture Baseline is the next program step.
