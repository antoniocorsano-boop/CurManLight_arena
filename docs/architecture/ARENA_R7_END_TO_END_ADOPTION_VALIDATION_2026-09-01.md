# Arena R7 — End-to-End Adoption Validation

Date: 2026-09-01

## Scope

R7 validates the institutional chain:

`source → context → analysis → proposal → review → decision → adoption → planning handoff`

This document records runtime reality. It must not upgrade a contract, test, planned effect, export or receipt into an implemented process.

## Current verdict

**ADOPTION_FLOW_BLOCKED**

The current system must not be described as having a complete institutional curriculum adoption workflow.

## Process reality

| Process | Current canonical implementation status | R7 reality | Consequence |
|---|---|---|---|
| P1 Source qualification | PARTIAL | PARTIAL | local source lifecycle/authority exists, but the full governed qualification/promotion lifecycle is not complete |
| P2 Curriculum context | IMPLEMENTED | EXECUTABLE | applicable curriculum context can be resolved and inspected |
| P3 Curriculum analysis | PARTIAL | PARTIAL | analysis exists in parts, but whole-school gap/coverage analysis is not yet a complete canonical pipeline |
| P4 Revision review | IMPLEMENTED | EXECUTABLE | proposals can be prepared/reviewed under the current contract |
| P5 Institutional decision | IMPLEMENTED | EXECUTABLE | authenticated institutional decision receipts are supported |
| P6 Canonical adoption | NOT_IMPLEMENTED | CONTRACT_ONLY | R5 defines fail-closed readiness and receipt shape, but no canonical mutation/adoption receipt is produced |
| P7 Planning handoff | IMPLEMENTED | EXECUTABLE | validated handoff exists, but it cannot prove that P6 happened |

## Blocking findings

### R7-B1 — P6 is contract-only

The canonical adoption contract intentionally does not mutate curriculum state. There is no runtime transition that:

1. re-verifies the active institutional decision receipt;
2. re-verifies the current canonical target;
3. requires an actor with `CURRICULUM_ADOPT`;
4. shows an explicit human preview/confirmation;
5. materializes a new immutable canonical curriculum version;
6. creates and persists a `CanonicalAdoptionReceipt`;
7. supersedes the previous canonical version atomically;
8. exposes rollback/supersession history.

This is the principal blocker for the end-to-end institutional adoption claim.

### R7-B2 — P1 remains partial

Source Lifecycle v1 and Source Authority v1 correctly separate upload, verification, evidence eligibility and authority. However, the governed promotion path to verified institutional/normative authority and full provenance lifecycle remains incomplete.

### R7-B3 — P3 remains partial

The product can inspect curriculum and revision evidence, but it does not yet have a complete canonical whole-school analysis pipeline for coverage/gaps across discipline and order. The Referente control tower correctly fails closed instead of inventing those metrics.

## What R0–R6 have achieved

R0–R6 are not wasted or invalidated by this verdict. They establish the preconditions for a mature process:

- process/role contract;
- work-queue semantics;
- task-first role-aware Home;
- Referente process-readiness control tower;
- decision/adoption authority separation;
- canonical adoption readiness contract;
- observer read-only access profile.

R7 shows that these foundations are coherent, while preventing a false maturity claim.

## Remediation sequence

The next development sequence is:

1. **R7A — Canonical Adoption Runtime v1**
   - explicit `CURRICULUM_ADOPT` policy;
   - authenticated actor requirement;
   - immutable target/version verification;
   - preview and explicit human confirmation;
   - atomic canonical version promotion;
   - immutable adoption receipt;
   - supersession/rollback contract and tests.
2. **R7B — Source Qualification Closure**
   - governed provenance/promotion for institutional/normative sources;
   - supersession/validity handling.
3. **R7C — Curriculum Analysis Closure**
   - structured discipline/order scope in canonical revision/analysis data;
   - deterministic coverage/gap computation;
   - Referente whole-school view based on explicit data.
4. **R7D — Release and representative HVA**
   - all runtime remediation integrated;
   - one batch Beta release;
   - same-SHA release identity;
   - browser critical journeys;
   - representative human acceptance by Docente, Dipartimento/Referente and institutional decision path;
   - Observer read-only confirmation.

## Release rule

R3/R4 UX changes remain intentionally undeployed until the R7 remediation checkpoint is suitable for a single batch release. S0/S1 defects remain exceptions.

## Exit gate

R7 can become **ADOPTION_FLOW_VALIDATED** only when every P1–P7 process required by the canonical chain is runtime-executable at its declared maturity level and the final candidate passes:

`automated invariants → browser critical journey → same-SHA release → representative human acceptance`

Until then, the canonical verdict remains **ADOPTION_FLOW_BLOCKED**.
