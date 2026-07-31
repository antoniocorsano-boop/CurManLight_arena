# CML-633G Revision and Decision Workflow — Implementation Plan

> **Branch:** `feat/cml-633g-revision-decision-workflow` (from `2ba65a5`)
> **Baseline commit:** `2ba65a5` (feat(CML-633F): add canonical document system)

**Goal:** Implement canonical domain for proposal, examination, decision, authority, events, timelines, and A02→A03→A04→A07 integration, replacing the legacy A03 model where a personal vote appeared as approval.

---

## File Structure

```
src/domain/revision/
  types.ts                # RevisionProposal, RevisionProposalVersion, Decision, DecisionEffect, events
  vocabularies.ts         # Statuses, outcomes, authority values, transitions
  constructors.ts         # Factory functions for proposals, versions, decisions, events
  validators.ts           # Structural, transition, mandatory-field validators
  stateMachine.ts         # Proposal state machine + decision state machine
  repository.ts           # CRUD for proposals, versions, decisions, events
  eventLog.ts             # Immutable event log (local, not official protocol)
  serialization.ts        # Backup/restore for RevisionArchive
  legacyAdapters.ts       # Adapt old decisions/customTexts/Proposal → canonical
  selectors.ts            # Read models for A03 views
  transferIntegration.ts  # A02→A03 (create draft), A03→A04 (by status), A03→A07 (generate documents)
  documentIntegration.ts  # Generate canonical documents from proposals/decisions
  index.ts                # Public barrel
```

---

## Task 1: Types and Vocabularies

**Files:** `types.ts`, `vocabularies.ts`

### RevisionProposal
```typescript
interface RevisionProposal {
  id: EntityId;
  metadata: EntityMetadata;
  targetNodeRef: EntityReference;        // curriculum node
  curriculumVersionRef: EntityReference;  // version of curriculum at proposal time
  currentTextSnapshot: string;           // frozen snapshot of current text
  proposedText: string;                  // proposed replacement
  rationale: string;                     // required before submission
  evidenceRefs: EntityReference[];
  sourceRefs: EntityReference[];
  author?: ActorReference;
  institutionalContext?: InstitutionalContext;
  status: RevisionProposalStatus;
  currentVersionRef: EntityReference;    // pointer to current version
  decisionRefs: EntityReference[];       // linked decisions
}
```

### RevisionProposalStatus
`'draft' | 'ready-for-review' | 'submitted' | 'under-review' | 'changes-requested' | 'withdrawn' | 'accepted-for-decision' | 'rejected' | 'archived' | 'legacy'`

NOT allowed as proposal status: `'approved'`, `'adopted'`, `'official'`

### RevisionProposalVersion
```typescript
interface RevisionProposalVersion {
  id: EntityId;
  proposalRef: EntityId;
  versionNumber: number;
  currentTextSnapshot: string;
  proposedText: string;
  rationale: string;
  sourceRefs: EntityReference[];
  evidenceRefs: EntityReference[];
  author?: ActorReference;
  createdAt: string;
  structuralFootprint: string;
  previousVersionRef?: EntityId;
  changeNote?: string;
  frozen: true;
}
```

### Decision
```typescript
interface Decision {
  id: EntityId;
  metadata: EntityMetadata;
  proposalRef: EntityReference;
  proposalVersionRef: EntityReference;
  outcome: DecisionOutcome;
  rationale: string;
  authority: DecisionAuthority;
  decidedBy?: ActorReference;
  institutionalContext?: InstitutionalContext;
  decidedAt?: string;
  effectiveFrom?: string;
  sourceRefs: EntityReference[];
  documentRefs: EntityReference[];
  status: DecisionStatus;
}
```

### DecisionOutcome
`'approve' | 'approve-with-changes' | 'reject' | 'defer' | 'return-for-revision' | 'record-only'`

### DecisionStatus
`'draft' | 'recorded-local' | 'superseded' | 'revoked' | 'archived' | 'legacy'`

### DecisionAuthority
```typescript
interface DecisionAuthority {
  declaredRole: 'docente' | 'dipartimento' | 'coordinatore' | 'referente-curricolo' | 'dirigente-scolastico' | 'collegio-docenti' | 'consiglio-istituto' | 'altro';
  otherDescription?: string;
  note?: string;
}
```

Rules:
- Declared, not authenticated
- Not equivalent to signature
- Does not prove validity of deliberation
- Must be accompanied by date and rationale
- Must be distinct from author of the record

### DecisionEffect
```typescript
type DecisionEffectType = 'none' | 'new-proposal' | 'planned-update' | 'new-institute-node' | 'node-replacement' | 'archive' | 'defer';
interface DecisionEffect {
  type: DecisionEffectType;
  targetRef?: EntityReference;
  description: string;
  applied: boolean;
  appliedAt?: string;
}
```

### RevisionEvent
```typescript
interface RevisionEvent {
  id: string;
  entityRef: EntityReference;
  eventType: RevisionEventType;
  actor?: ActorReference;
  role?: string;
  timestamp: string;
  previousStatus?: string;
  newStatus?: string;
  rationale?: string;
  references: EntityReference[];
  structuralFootprint: string;
}
```

### RevisionEventType
`'proposal-created' | 'proposal-modified' | 'version-created' | 'proposal-submitted' | 'proposal-taken-over' | 'changes-requested' | 'proposal-withdrawn' | 'decision-recorded' | 'decision-superseded' | 'decision-revoked' | 'proposal-archived' | 'document-generated' | 'curricular-effect-applied'`

### RevisionArchive
```typescript
interface RevisionArchive {
  schemaVersion: number;
  updatedAt: string;
  proposals: RevisionProposal[];
  versions: RevisionProposalVersion[];
  decisions: Decision[];
  events: RevisionEvent[];
}
```

### Vocabularies
- `VALID_PROPOSAL_STATUSES`, `VALID_DECISION_OUTCOMES`, `VALID_DECISION_STATUSES`
- `VALID_AUTHORITY_ROLES`, `VALID_EVENT_TYPES`, `VALID_EFFECT_TYPES`
- Status transition maps for both proposal and decision state machines

---

## Task 2: State Machine

**File:** `stateMachine.ts`

### Proposal State Machine
```
draft → ready-for-review
ready-for-review → submitted
submitted → under-review
submitted → withdrawn
under-review → changes-requested
under-review → accepted-for-decision
under-review → rejected
changes-requested → ready-for-review  (new version created)
changes-requested → withdrawn
accepted-for-decision → (decision created externally, not as status)
any (except archived) → archived
legacy → draft | archived
```

### Decision State Machine
```
draft → recorded-local
recorded-local → superseded (when new decision replaces it)
recorded-local → revoked
recorded-local → archived
superseded → archived
revoked → archived
legacy → draft | archived
```

Functions: `canTransitionProposalStatus()`, `canTransitionDecisionStatus()`

---

## Task 3: Constructors

**File:** `constructors.ts`

- `createEmptyRevisionArchive()` — default empty archive
- `cloneRevisionArchive()` — deep clone via JSON
- `createProposal(input)` — creates with status `draft`, generates id + metadata
- `createProposalVersion(proposal, input)` — creates version 1 or increments
- `restoreProposalVersion(proposal, sourceVersion, input)` — restore creates new version
- `createDecision(input)` — creates with status `draft`
- `createRevisionEvent(input)` — creates immutable event
- `createDecisionEffect(type, target?, description?)` — creates effect object
- `createDecisionAuthority(role, other?, note?)` — authority factory

---

## Task 4: Validators

**File:** `validators.ts`

- `validateProposal(proposal)` — id, metadata, targetNode, curriculumVersion, status, etc.
- `validateProposalVersion(version)` — id, proposalRef, versionNumber, frozen, etc.
- `validateDecision(decision)` — id, metadata, proposalRef, outcome, authority, rationale
- `validateTransition(proposalOrDecision, newStatus)` — checks transition table
- `validateMandatoryRationale(proposal)` — rationale required before submission
- `validateArchiveIntegrity(archive)` — no orphan versions/decisions, no duplicate IDs
### Reference Validation (split)

```typescript
function validateInternalArchiveReferences(archive: RevisionArchive): DocumentValidationResult
```
Validates internal references resolvable within the archive:
- proposal → version, proposal → decision
- decision → proposal, decision → proposal version
- event → proposal/decision
- effect → decision

```typescript
function validateExternalRevisionReferences(
  archive: RevisionArchive,
  resolvers: {
    resolveCurriculumNode?: (id: EntityId) => boolean;
    resolveSource?: (id: EntityId) => boolean;
    resolveDocument?: (id: EntityId) => boolean;
    resolveInstitute?: (id: EntityId) => boolean;
  },
): DocumentValidationResult
```
Validates external references with explicit resolvers. An external source not loaded during isolated validation is NOT classified as an internal error.

---

## Task 5: Repository

**File:** `repository.ts`

- `createProposalInArchive(archive, input, versions?, decisions?, events?)` → creation result
- `getProposal(id, archive)` → proposal
- `listProposals(archive, filter?)` → by status, node, author
- `getProposalVersion(id, archive)` → version
- `listProposalVersions(proposalId, archive)` → ordered versions
- `getDecision(id, archive)` → decision
- `listDecisions(archive, filter?)` → by proposal, outcome, authority, status
- `getEvents(archive, filter?)` → events
- `transitionProposalStatus(archive, proposalId, newStatus)` → result
- `transitionDecisionStatus(archive, decisionId, newStatus)` → result
- `createDecisionForProposal(archive, proposalId, decisionInput)` → creates decision + event
- `supersedeDecision(archive, decisionId)` → mark superseded
- `revokeDecision(archive, decisionId)` → mark revoked
- `verifyIntegrity(archive)` → errors/warnings
- `exportBackup(archive)` → serialized string
- `importBackup(json)` → import result

---

## Task 6: Event Log (Revision Domain)

**File:** `eventLog.ts`

Domain-specific event log for revision lifecycle. NOT a duplicate of CML-633E's TransferEventLog.

- `TransferEvent`: technical cross-area transfer (CML-633E)
- `RevisionEvent`: proposal/decision lifecycle (CML-633G)

Shared principles: immutability, structural footprint, common constructors, temporal conventions.

Not shared: type system, event kinds, storage.

`RevisionEvent` declares explicitly:
```
Registro locale delle attività, non protocollo ufficiale
```

---

## Task 7: Serialization

**File:** `serialization.ts`

- `serializeRevisionArchive(archive)` → JSON string with schema version
- `deserializeRevisionArchive(json)` → validation + deserialization
- `fingerprintRevisionArchive(archive)` → FNV-1a hash for integrity

---

## Task 8: Legacy Adapters

**File:** `legacyAdapters.ts`

Adapt old A03 data to canonical:

```typescript
function adaptLegacyProposal(
  proposalId: string,
  decision: DecisionStatus,
  customText?: string,
  proposalData?: Proposal,
): LegacyAdaptationResult
```

Rules:
- Import as `legacy` status
- Never promote to `submitted` or `accepted-for-decision`
- Never create a Decision entity from a personal vote
- Never invent author, date, or authority
- Preserve original value
- Produce warnings for missing fields

```typescript
function adaptLegacyDecisions(
  decisions: Record<string, DecisionStatus>,
  customTexts: Record<string, string>,
  proposalsData: Record<string, Proposal>,
): LegacyAdaptationBatchResult
```

Also adapt:
- `customTexts` entries → proposals with status `legacy` and `contentOrigin: 'teacher'`
- `approved` → legacy proposal with note "Valutazione personale: testo proposto"
- `rejected` → legacy proposal with note "Valutazione personale: testo 2012"
- Proposals without author → warning
- Proposals without date → warning
- Proposals without source → warning

---

## Task 9: Transfer Integration

**File:** `transferIntegration.ts`

### A02 → A03

Uses CML-633E contract `A02ToA03Payload` (NOT `A02ToA04Payload`). Specific contract with:
- curriculum node reference
- curriculum version reference
- text snapshot
- sources
- evidences
- content origin
- institutional context
- warnings
- contract version
- structural footprint

```typescript
function executeA02ToA03ProposalTransfer(
  payload: A02ToA03Payload,
  archive: RevisionArchive,
): A02ToA03ProposalResult
```

Creates:
- Draft `RevisionProposal` targeting the curriculum node
- Version 1 with text snapshot from source
- Sources and evidences preserved
- Content origin preserved
- Warnings preserved

**Does NOT:**
- Create decisions
- Set approval
- Modify curriculum
- Delete legacy data

### A03 → A04

```typescript
function executeA03ToA04ProposalTransfer(
  proposalRefs: EntityReference[],
  archive: RevisionArchive,
): A03ToA04TransferResult
```

Rules:
- `draft`: not transferable
- `submitted` or `under-review`: transferable as proposed content only
- Decision `approve`: transferable as planned institute content
- Decision `reject`: not transferable
- `approve-with-changes`: requires coherent version
- Legacy content: accompanied by warnings

### A03 → A07

```typescript
function generateProposalDocument(
  proposalId: EntityId,
  archive: RevisionArchive,
  documentArchive: DocumentArchive,
): DocumentCreationResult
```

Generates canonical documents:
- Proposal sheet (heading, rationale, comparison, sources)
- Decision record (outcome, authority, rationale, date)
- Source attachment (list of sources)
- Event history (log)

Documents never self-declare as "official record" without verified process and authority.

---

## Task 10: Decision Effects

**File:** `repository.ts` (extend)

### DecisionEffectRecord (persisted in RevisionArchive)

```typescript
interface DecisionEffectRecord {
  id: EntityId;
  metadata: EntityMetadata;
  decisionRef: EntityReference;
  effectType: DecisionEffectType;
  targetRef?: EntityReference;
  description: string;
  status: 'planned' | 'applied-local' | 'cancelled' | 'legacy';
  appliedAt?: string;
  appliedBy?: ActorReference;
}
```

Stored in `RevisionArchive.effects: DecisionEffectRecord[]`.

`applied-local` does NOT mean the curriculum has been formally adopted.

```typescript
function applyDecisionEffect(
  archive: RevisionArchive,
  decisionId: EntityId,
  effectInput: DecisionEffectInput,
): ApplyEffectResult
```

Process:
1. Verify decision status is `recorded-local`
2. Verify authority is present
3. Verify rationale is present
4. Create event `curricular-effect-applied`
5. Mark effect as applied
6. Return updated archive

Effect types:
- `none` — record-only, no action
- `new-proposal` — creates follow-up proposal draft
- `planned-update` — marks for future curriculum update
- `new-institute-node` — flags creation of new institute-level node
- `node-replacement` — flags replacement (does NOT modify curriculum directly)
- `archive` — archives the target
- `defer` — postpones to later

**NEVER:**
- Modifies curriculum content directly
- Overwrites original node
- Alters frozen curriculum versions
- Touches national legacy curriculum

---

## Task 11: Persistence (Store Integration)

**File:** `src/store/useCurriculumStore.ts`

Add:
```typescript
interface CurriculumStoreState {
  // ... existing
  revisionArchive: RevisionArchive;
}
```

Actions:
- `replaceRevisionArchive(archive)` — validates then replaces
- `addRevisionEvent(event)` — appends event to archive

Merge handler:
- Validate archive integrity on rehydration
- Default to `createEmptyRevisionArchive()` if missing or invalid

**Option A** — same pattern as CML-633F (aggregated in Zustand state, no new Dexie tables)

---

## Task 12: Minimal A03 Surface

**File:** Modify `src/features/curriculum/components/RevisioneTab.tsx`

**Principle:** Legacy view = read-only. New proposals only in canonical domain. No double-write.

Display:
- **Proposte strutturate**: new canonical model (create draft, modify, submit, withdraw, etc.)
- **Valutazioni personali precedenti**: legacy data, read-only or "Importa come proposta legacy" action

Legacy actions must NOT continue producing new data if the canonical flow is operational.

Actions based on real status (no generic "Approva" button):
- create draft, modify, prepare for review, submit, withdraw, take over, request changes, admit to decision, record local decision, view history

**Non introdurre:**
- Remote collaboration
- Signatures
- Protocollazione
- Simulated collegial voting
- Unnecessary complex panels
- Double-write to legacy fields

---

## Task 13: Security and Integrity

Verify:
- No arbitrary HTML in proposal text
- No unsanitized interpolation
- No retroactive modification
- No immediate irreversible deletion
- No automatic promotion
- All references resolvable
- Versions immutable
- Decisions separate from proposals
- Single coherent current state

---

## Task 14: Tests (7 files)

1. `revision-domain.test.ts` — entities, versions, state machine, validation
2. `revision-state-machine.test.ts` — all transitions, edge cases
3. `revision-repository.test.ts` — CRUD, filters, integrity, backup/restore
4. `revision-transfer.test.ts` — A02→A03, A03→A04, A03→A07
5. `revision-decision-effects.test.ts` — effect types, application rules
6. `revision-legacy.test.ts` — legacy decision adaptation, warnings
7. `revision-integration.test.tsx` — end-to-end, CML-633B–F compatibility

---

## Task 15: Documentation (6 files)

1. `CML_633G_REVISION_DECISION_WORKFLOW_IMPLEMENTATION.md`
2. `CML_633G_REVISION_PROPOSAL_SCHEMA.md`
3. `CML_633G_DECISION_AUTHORITY_POLICY.md`
4. `CML_633G_STATE_EVENT_MODEL.md`
5. `CML_633G_LEGACY_A03_MIGRATION.md`
6. `CML_633G_A02_A03_A04_A07_INTEGRATION.md`

---

## Task 16: Final Verification + Commit

```bash
npx tsc --noEmit
npm test
npm run build
npm run build-storybook
git diff --check
git diff -- package.json package-lock.json
git diff -- src/domain/documents
git diff -- src/domain/transfer
git diff -- src/domain/institution
git diff -- src/domain/curriculum
```

Commit: `feat(CML-633G): add canonical revision and decision workflow`

---

## Scope Boundaries

### In Scope
- `RevisionProposal`, `RevisionProposalVersion`, `Decision`, `DecisionEffect`, `RevisionEvent`
- State machines for proposals and decisions
- Repository with CRUD + filters + integrity
- Option A persistence in Zustand
- A02→A03→A04→A07 transfer contracts
- Legacy A03 adapters (decisions, customTexts, proposals)
- Decision authority model (declared, not authenticated)
- Decision effects (controlled application, no direct curriculum modification)
- Minimal A03 surface (canonical data alongside legacy)
- 7 test files + 6 documentation files

### Out of Scope
- Remote collaboration
- Digital signatures
- Authentication
- Official protocol/protocollazione
- Voting simulations
- New Dexie tables
- Governance changes
- CML-631 pilot reactivation
- Curriculum content modification
- Backend services

---

## Constraints Check
- [x] No main modification
- [x] No push/merge/publication
- [x] No governance changes
- [x] No backend
- [x] No authentication
- [x] No digital signatures
- [x] No institutional authority simulation
- [x] No new dependencies
- [x] No Dexie schema changes
- [x] No CML-633B–F domain modifications (except minimal public exports with tests)
- [x] No CML-631 reactivation
- [x] No legacy data promotion to approved
- [x] No curriculum content modifications
- [x] No remote collaboration