# CML-633G — Revision and Decision Workflow: Implementation

> **Branch:** `feat/cml-633g-revision-decision-workflow`
> **Baseline commit:** `2ba65a5`
> **Domain directory:** `src/domain/revision/`

## Entity Types

### RevisionProposal
Core entity targeting a curriculum node. Statuses include `draft`, `ready-for-review`, `submitted`, `under-review`, `changes-requested`, `withdrawn`, `accepted-for-decision`, `rejected`, `archived`, `legacy`. Never `approved`.

### RevisionProposalVersion
Immutable (`frozen: true`) snapshots of proposal text at a point in time. Linked via `previousVersionRef`. Created by `createInitialProposalVersion`, `createNextProposalVersion`, or `restoreProposalVersion`.

### Decision
A declared decision on a proposal version. Outcome: `approve`, `approve-with-changes`, `reject`, `defer`, `return-for-revision`, `record-only`. Status: `draft`, `recorded-local`, `superseded`, `revoked`, `archived`, `legacy`. Requires rationale and declared authority.

### DecisionEffectRecord
Records an effect of a decision. Effects: `none`, `new-proposal`, `planned-update`, `new-institute-node`, `node-replacement`, `archive`, `defer`. Status: `planned`, `applied-local`, `cancelled`, `legacy`. Never modifies curriculum directly.

### RevisionEvent
Immutable event log entry for proposal/decision/effect lifecycle. Type defines the event kind. Not a formal protocol.

## State Machines

### Proposal transitions
draft → ready-for-review → submitted → under-review → (changes-requested | accepted-for-decision | rejected) → archived. withdrawn → archived. legacy → draft | archived.

### Decision transitions
draft → recorded-local → (superseded | revoked | archived) → archived. legacy → draft | archived.

## Modules

| File | Purpose |
|------|---------|
| `types.ts` | All entity interfaces and result types |
| `vocabularies.ts` | Valid statuses, outcomes, roles, event types, effect types, transition tables |
| `constructors.ts` | Factory functions for all entities |
| `validators.ts` | Structural, transition, internal/external reference validation |
| `repository.ts` | CRUD operations: addProposal, addProposalVersion, recordDecision, transitionProposalStatus, transitionDecisionStatus, verifyArchiveIntegrity |
| `eventLog.ts` | Append-only immutable event log: appendRevisionEvent, getRevisionEvents, getEventsByProposal, getEventsByDecision, verifyRevisionEventIntegrity |
| `serialization.ts` | Backup/restore: serializeRevisionArchive, deserializeRevisionArchive, importRevisionArchive, createRevisionArchiveBackup, fingerprintRevisionArchive |
| `legacyAdapter.ts` | Legacy A03 import/export: importLegacyProposals, exportLegacyState |
| `transferIntegration.ts` | A02→A03 (draft creation), A03→A04 (transfer matrix) |
| `documentIntegration.ts` | A03→A07: generateProposalSheet, generateDecisionRecord, generateProposalDocument, generateDecisionDocument |
| `decisionEffects.ts` | planDecisionEffect, applyDecisionEffectLocally, cancelDecisionEffect, listDecisionEffects |
| `queries.ts` | Read models: findProposalsByStatus, findDecisionsByProposal, etc. |
| `index.ts` | Barrel export |

## Persistence
Store integration in `useCurriculumStore.ts`: `revisionArchive` state + `replaceRevisionArchive` action. No Dexie schema change (Option A).

## Constraints
- No curriculum content modification
- No authentication/signatures
- No governance changes
- No new dependencies
- No double-write to legacy fields
- Legacy `approved` never creates `approved` proposal status