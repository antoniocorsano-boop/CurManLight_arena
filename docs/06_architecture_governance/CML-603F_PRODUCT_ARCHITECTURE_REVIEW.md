# CML-603F - Product Architecture Review

> Final Architecture Gate report for the CML-603 architectural stabilization program.

## Gate Summary

| Field | Result |
|---|---|
| Program | CML-603 |
| Gate | CML-603F Product Architecture Review |
| Result | **PASSED** |
| Verified implementation decisions | 4 / 4 |
| Outstanding blockers | 1 |
| Accepted blockers | BL-001 |
| Rejected items | None |
| Architectural Health | Reviewed and confirmed |
| Repository | Green except accepted generated-artifact blocker BL-001 |
| Conclusion | Architecture Baseline Established |
| Closure date | 2026-07-21 |

This gate validates the CML-603 program as a whole. It is not a fifth implementation decision and introduces no application behavior change.

## 1. Decision Review

| Decision | Lifecycle status | Decision Outcome | Exit criteria | Gate result |
|---|---|---|---|---|
| UT-001 - Shared Utility Layer | Verified | Present in CML-603B | Canonical `src/lib`, no `src/utils`, checks green | Passed |
| TY-001 - Typed Boundary Architecture | Verified | Present in CML-603C | Batches 1-5 complete, public boundaries typed, checks green | Passed |
| TS-001 - Interaction Tests | Verified | Present in CML-603D | Five priority flows covered, no real network, checks green | Passed |
| DM-001 - Domain Modularization | Verified | Present in CML-603E | Active domains expose public APIs, intentional dependencies, checks green | Passed |

The implementation metric is therefore `4 / 4 Verified`. Runtime decisions RT-001 through RT-011 remain `Approved`, consistently with their scope: CML-603A established binding runtime direction but did not claim runtime implementation verification.

## 2. ADI And Traceability Review

| Check | Evidence | Result |
|---|---|---|
| Decision states match source papers | UT-001, TY-001, TS-001 and DM-001 are `Verified` in both papers and ADI | Passed |
| Decision Outcomes present | Each verified implementation decision has an observed outcome | Passed |
| Traceability complete | ADI maps document, implementation and verification for every registered decision | Passed |
| Governance links valid | Relative-link audit of `docs/06_architecture_governance` reports 0 broken links | Passed |
| Orphan decisions | No decision present in a CML-603 decision paper is missing from the ADI | Passed |

NAV-001 and DS-001 remain explicitly classified as future draft decisions and are not part of the CML-603 implementation metric.

## 3. Architectural Health Review

The CML-603 dashboard is accepted without optimistic promotion during this gate.

| Indicator | Confirmed value | Gate rationale |
|---|:---:|---|
| Runtime | 1/5 | Runtime policy is approved, while service-worker and distribution implementation remain unverified |
| Domains | 5/5 | All ten active feature domains expose intentional root APIs |
| Type Safety | 4/5 | Public boundaries are typed; broader internal and legacy hardening remains |
| Boundary Coverage | 5/5 | TY-001 boundary inventory and Batches 1-5 are complete |
| Modularita' | 5/5 | Cross-domain consumers use public domain APIs in the verified scope |
| Test | 4/5 | Primary flows have interaction coverage; full browser E2E remains future work |
| Mobile | 3/5 | No CML-603 decision promoted this area |
| Accessibilita' | 3/5 | No CML-603 decision promoted this area |
| Utility Layer | 5/5 | `src/lib` is canonical and `src/utils` is absent |
| Developer Experience | 5/5 | Public imports, decision traceability and repeatable checks are established |
| Maintainability | 5/5 | Ownership and public contracts are explicit; file size alone is not used as a negative proxy for cohesion |

## 4. Boundary And Domain Review

| Contract | Observed evidence | Result |
|---|---|---|
| Utility boundary | `src/utils` does not exist and source scans find no legacy utility imports | Passed |
| Typed boundary | `src/features` scan finds no `any` or `as any` | Passed |
| Domain roots | `classroom`, `copilot`, `curriculum`, `documents`, `navigation`, `processo`, `progettazione`, `session`, `social` and `workspace` expose `index.ts` | Passed |
| Cross-domain encapsulation | Scans find no imports into another active domain's `components`, `hooks`, `types` or `data` folders | Passed |
| Placeholder domains | Empty placeholders are not classified as active domains | Accepted |

The remaining dependency edges are intentional orchestration or type-contract dependencies already listed in the DM-001 outcome. No circular domain dependency was observed in the reviewed edge set.

## 5. Test And Build Review

Fresh CML-603F evidence:

| Verification | Observed result | Gate result |
|---|---|---|
| `npx tsc --noEmit` | Exit code 0 | Passed |
| `npm test` | 4 files, 64/64 tests | Passed |
| TS-001 targeted suite | 1 file, 5/5 interaction tests | Passed |
| `npm run build` | 1,619 modules transformed; production single-file build generated | Passed |
| Scoped `git diff --check -- . ':!index.html'` | Exit code 0; line-ending warnings only | Passed |
| Global generated artifact check | `index.html` trailing-whitespace findings reproduced | BL-001 |

Vite emits dependency/configuration deprecation warnings during tests, but no compilation, test or build failure. These warnings do not alter the CML-603F result and may be handled as future dependency maintenance.

## 6. Blocker Review

| Field | BL-001 assessment |
|---|---|
| Blocker | `index.html` generated diff / whitespace |
| Status | Open - Accepted |
| Reproducible | Yes, after the production build rewrites the tracked single-file artifact |
| Scope | Generated artifact and repository hygiene |
| Architectural impact | None observed |
| Decision impact | No CML-603 implementation decision depends on accepting malformed source code from this artifact |
| Gate decision | Accepted; does not block CML-603F |
| Follow-up | Resolve or formalize generated-artifact handling in the CML-604 baseline/repository hygiene work |

BL-001 remains visible and is not reclassified as resolved. The exception is accepted because the source, TypeScript, tests, build and scoped repository checks are green and the failure is isolated to the build-generated tracked artifact.

## Gate Decision

The CML-603 Architecture Gate is **PASSED**.

- All four planned implementation decisions are `Verified` with traceable outcomes.
- ADI, decision papers and observed repository state are coherent.
- Architectural Health is reviewed without unsupported score increases.
- BL-001 is real, reproducible, classified and accepted with no architectural impact.
- No rejected gate item remains.

CurManLight has therefore established the CML-603 Architecture Baseline. The next program step is CML-604, which freezes this baseline as the official reference for subsequent functional evolution. Future architectural changes require new decisions; the four verified CML-603 decisions must not be rewritten retroactively except to record corrections or deprecation history.

## Closure

This gate report was verified and the CML-603 milestone closed on 2026-07-21. Fresh verification evidence:

| Check | Result | Date |
|---|---|---|
| `npx tsc --noEmit` | Exit code 0 | 2026-07-21 |
| `npm test` | 64/64 passed | 2026-07-21 |
| `npm run build` | 1,619 modules; 1,024 KB single-file | 2026-07-21 |
| `src/utils` absent | Confirmed | 2026-07-21 |
| `src/features` zero `any` | Confirmed | 2026-07-21 |
| 10 active domain entrypoints | Confirmed | 2026-07-21 |

The Architecture Baseline is now frozen. CML-604 is the next program step.
