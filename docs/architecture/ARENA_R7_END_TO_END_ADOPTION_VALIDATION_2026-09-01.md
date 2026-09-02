# Arena R7 — End-to-End Adoption Validation

Date: 2026-09-01
Updated: 2026-09-02 (R7B2 scope clarification)

## Scope

R7 validates the institutional chain:

`source → context → analysis → proposal → review → decision → adoption → planning handoff`

This document records runtime reality. It must not upgrade a contract, test, planned effect, export or receipt into an implemented process.

### R7B2 scope clarification — 2026-09-02

The executable P3/R7B2 curriculum-analysis gate is explicitly limited to the canonical D.M. 221 **first cycle** (`primaria + secondaria`). It must not be read as a whole-school claim including `infanzia`.

`infanzia` remains outside this gate because the current legacy `CurriculumMap` projects it through disciplines, while D.M. 221 models five canonical fields of experience. `legacyStructureAudit.ts` already treats that mismatch as blocking. Until a semantic migration to `DM221_INFANZIA_FIELDS` exists, the R7 runtime assessment exposes:

- `curriculumScope = DM221_FIRST_CYCLE_ONLY`;
- `excludedSchoolOrders = ['infanzia']`.

Accordingly, any `ADOPTION_FLOW_VALIDATED` verdict produced after R7B2 is valid only inside that declared first-cycle scope.

## Current verdict

**FIRST_CYCLE_RUNTIME_EXECUTABLE — FINAL R7 ACCEPTANCE STILL PENDING**

Inside `DM221_FIRST_CYCLE_ONLY`, P1–P7 are runtime-executable and the machine assessment may return `ADOPTION_FLOW_VALIDATED`. That is not final institutional acceptance: same-SHA release validation and representative human acceptance remain separate mandatory gates. Infanzia is outside this verdict.

## Process reality after R7B2

| Process | Current canonical implementation status | R7 reality | Consequence |
|---|---|---|---|
| P1 Source qualification | IMPLEMENTED | EXECUTABLE | governed source qualification produces eligible evidence without upgrading source authority automatically |
| P2 Curriculum context | IMPLEMENTED | EXECUTABLE | applicable curriculum context can be resolved and inspected |
| P3 Curriculum analysis | IMPLEMENTED | EXECUTABLE | deterministic first-cycle coverage/gap analysis is wired to the current CurriculumMap; infanzia remains excluded explicitly |
| P4 Revision review | IMPLEMENTED | EXECUTABLE | proposals can be prepared/reviewed under the current contract |
| P5 Institutional decision | IMPLEMENTED | EXECUTABLE | authenticated institutional decision receipts are supported |
| P6 Canonical adoption | IMPLEMENTED | EXECUTABLE | canonical adoption runtime performs the governed transition and receipt path |
| P7 Planning handoff | IMPLEMENTED | EXECUTABLE | validated handoff exists without applying it automatically to docente planning |

## Historical blocking findings and closure

### R7-B1 — P6 was contract-only — CLOSED

R7A introduced the governed canonical adoption runtime, including authority checks, immutable version promotion and adoption receipts.

### R7-B2 — P1 was partial — CLOSED

The source qualification runtime now provides the governed P1 evidence eligibility path required by downstream analysis while preserving the authority boundary.

### R7-B3 — P3 was partial — CLOSED FOR FIRST CYCLE

R7B2 implements deterministic first-cycle coverage/gap/discontinuity/overlap analysis from explicit curriculum data and wires the Referente view to that same runtime.

This closure is intentionally **not** an infanzia closure. The current legacy data model cannot be treated as the five canonical fields of experience without semantic migration.

## What R0–R7B2 have achieved

The integrated foundations now include:

- process/role contract;
- work-queue semantics;
- task-first role-aware Home;
- Referente process-readiness control tower;
- source qualification and evidence eligibility;
- deterministic first-cycle curriculum analysis;
- decision/adoption authority separation;
- canonical adoption runtime and receipt path;
- observer read-only access profile;
- validated planning handoff contract.

The remaining work before **final R7 acceptance** is not another first-cycle runtime remediation: it is release/HVA evidence on one exact SHA.

## Remaining canonical work outside R7B2 scope

### Infanzia canonical migration

The repository already detects the mismatch: legacy discipline-shaped infanzia data cannot be promoted directly to `DM221_INFANZIA_FIELDS`. A separate tranche must define and validate the semantic migration to the five fields of experience before infanzia can enter the same coverage gate.

## Final acceptance sequence

1. same-SHA automated invariants;
2. browser critical journeys;
3. one Beta release on the same SHA;
4. representative human acceptance by Docente, Dipartimento/Referente and institutional decision path;
5. Observer read-only confirmation.

## Release rule

R3/R4 UX changes remain intentionally undeployed until the R7 remediation checkpoint is suitable for a single batch release. S0/S1 defects remain exceptions.

## Exit gate

Within the declared first-cycle scope, the machine gate can return **ADOPTION_FLOW_VALIDATED** only when every P1–P7 process is runtime-executable.

Final R7 acceptance additionally requires:

`automated invariants → browser critical journey → same-SHA release → representative human acceptance`

Neither the machine verdict nor the first-cycle gate includes infanzia until the canonical field-of-experience migration is completed and promoted into a later validation scope.
