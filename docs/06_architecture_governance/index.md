# CML-603 - Architecture Governance

> **Goal**: Govern the transition from React migration to architectural stabilization before the next functional implementation phase.
> **Status**: Completed (2026-07-21). Architecture Baseline frozen. CML-604 is the next program step.

## Documents

| # | Document | Scope |
|---|---|---|
| 01 | [CML-603_ARCHITECTURE_GOVERNANCE.md](./CML-603_ARCHITECTURE_GOVERNANCE.md) | ADR-0001, architectural principles, CML-603A-F, Architecture Gate, Architectural Health Dashboard |
| 02 | [CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md) | Architecture Decision Paper for runtime, distribution, persistence, sync, service worker, versioning, compatibility, failure strategy, decision register and dependencies |
| 03 | [CML-603B_UTILITY_LAYER_CONSOLIDATION.md](./CML-603B_UTILITY_LAYER_CONSOLIDATION.md) | Architecture Decision Paper for the canonical shared utility layer and first governance-backed code change |
| 04 | [CML-603C_TYPE_BOUNDARY_STRATEGY.md](./CML-603C_TYPE_BOUNDARY_STRATEGY.md) | Architecture Decision Paper for typed boundaries, trust zones, DTOs, domain contracts and ViewModels |
| 05 | [TY-001_IMPLEMENTATION_PLAN.md](./TY-001_IMPLEMENTATION_PLAN.md) | Batch implementation plan for TY-001 without opportunistic `any` cleanup |
| 06 | [CML-603D_INTERACTION_TESTS.md](./CML-603D_INTERACTION_TESTS.md) | Architecture Decision Paper for interaction tests governing the primary user flows before domain modularization |
| 07 | [CML-603E_DOMAIN_MODULARIZATION.md](./CML-603E_DOMAIN_MODULARIZATION.md) | Architecture Decision Paper for domain public APIs and cross-domain modularization |
| 08 | [CML-603F_PRODUCT_ARCHITECTURE_REVIEW.md](./CML-603F_PRODUCT_ARCHITECTURE_REVIEW.md) | Final Architecture Gate report: PASSED, 4/4 implementation decisions verified, BL-001 accepted |
| 09 | [ARCHITECTURE_DECISION_INDEX.md](./ARCHITECTURE_DECISION_INDEX.md) | Central index and traceability matrix for ADR, runtime, utility, type, test, domain, navigation and design-system decisions |

## Phase Statement

CurManLight has completed the technological migration phase and enters architectural stabilization. CML-603 decisions define how future product evolution must happen.

## CML-603 Structure

```text
CML-603A - Runtime & Distribution Strategy
CML-603B - Utility Layer Consolidation
CML-603C - Type Boundary Strategy
CML-603D - Interaction Tests
CML-603E - Domain Modularization
CML-603F - Product Architecture Review
```

## Decision Paper Standard

From CML-603B onward, every governance document uses the standard structure defined in `CML-603_ARCHITECTURE_GOVERNANCE.md`: context, problem, alternatives, approved decision, consequences, verification criteria, decision register, and Architectural Health impact.

## Next Baseline

CML-603F passed the Architecture Gate. CML-604 will now freeze the verified Architecture Baseline before functional development resumes.
