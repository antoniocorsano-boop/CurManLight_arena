# CML-633E Transfer Contracts — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` or `executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Define formal, typed transfer contracts between curriculum areas (A11→A02, A02→A03, A02/A03→A04, A04→A07) with validation, structural signatures, local event logging, error handling, legacy compatibility, and area boundary tests.

**Architecture:** `src/domain/transfer/` owns contract types, validators, event log, and error taxonomy. Feature hooks consume contracts to formalize existing cross-area data flows through the Zustand store. No new state manager, no new framework, no new dependencies.

**Tech Stack:** React 18, TypeScript, Zustand (existing), Vitest, Testing Library, Vite.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/domain/transfer/types.ts` | Contract types, transfer areas, payloads, results, errors, events, signatures |
| `src/domain/transfer/vocabularies.ts` | Transfer area enum, status transitions, error recovery strategies |
| `src/domain/transfer/validators.ts` | Pre-condition validation, post-condition validation, payload integrity |
| `src/domain/transfer/signatures.ts` | Structural footprint computation: canonical serialization + FNV-1a (non-cryptographic, see Binding Rule 1) |
| `src/domain/transfer/eventLog.ts` | Append-only transfer event log (in-memory, replaceable interface, see Binding Rule 3) |
| `src/domain/transfer/errors.ts` | Error taxonomy, recovery strategies, conflict resolution |
| `src/domain/transfer/contracts.ts` | Concrete contract definitions for each area transition |
| `src/domain/transfer/legacyAdapters.ts` | Legacy data compatibility for transfers involving old formats |
| `src/domain/transfer/index.ts` | Public transfer API |
| `src/__tests__/transfer-domain.test.ts` | Domain and contract tests |
| `src/__tests__/transfer-boundary.test.ts` | Area boundary tests (A11→A02, A02→A03, etc.) |
| `src/__tests__/transfer-errors.test.ts` | Error handling and conflict resolution tests |

---

## Task 1: Transfer Domain Types and Vocabularies

**Files:**
- Create: `src/domain/transfer/types.ts`
- Create: `src/domain/transfer/vocabularies.ts`
- Test: `src/__tests__/transfer-domain.test.ts`

- [ ] Write failing tests proving: transfer areas are a closed branded type (not free strings), a transfer payload carries source and target references, a transfer result discriminates success/partial/failure, a transfer error has a code and recoverable flag, a transfer event records all required fields.
- [ ] Run `npx vitest run src/__tests__/transfer-domain.test.ts` and verify missing-module failures.
- [ ] Define `TransferContractId`: branded string (e.g., `'A11-A02'`, `'A02-A03'`, `'A02-A04'`, `'A03-A04'`, `'A04-A07'`).
- [ ] Define `TransferContractVersion`: branded number (starts at 1).
- [ ] Define `TransferId`: branded string (unique per transfer execution).
- [ ] Define `TransferArea`: branded string type `'A11' | 'A02' | 'A03' | 'A04' | 'A07'` (not free string).
- [ ] Define `TransferKind`: branded string for transfer type (e.g., `'knowledge-to-curriculum'`, `'curriculum-to-proposal'`, etc.).
- [ ] Define `TransferStatus`: `'pending' | 'validating' | 'executing' | 'completed' | 'partial' | 'failed' | 'rolled-back'`.
- [ ] Define `TransferPayload` base interface: `transferId`, `contractId`, `contractVersion`, `fromArea`, `toArea`, `sourceRefs`, `targetRef`, `config`, `metadata`.
- [ ] Define `TransferContext`: `initiatedBy?`, `sessionTimestamp`, `contractVersion`.
- [ ] Define `TransferResult`: discriminated union `{ status: 'completed', created, updated, skipped } | { status: 'partial', created, updated, skipped, errors } | { status: 'failed', errors }`.
- [ ] Define `TransferWarning`: `{ code: string, message: string, field?: string }`.
- [ ] Define `TransferError`: `{ errorType: TransferErrorType, code: string, message: string, uiMessage?: string, recoverable: boolean, recoveryAction?, details?, affectedRefs? }`.
- [ ] Define `TransferEvent`: all fields from Binding Rule 3 (id, transferId, kind, contractVersion, timestamp, fromArea, toArea, entityRefs, status, errorCode?, structuralFootprint, author?, persistent: false).
- [ ] Define `StructuralFootprint`: `{ algorithm: 'fnv1a', version: 1, hash: string, computedAt: string }` (non-cryptographic, see Binding Rule 1).
- [ ] Run the targeted test and `npx tsc --noEmit`; both must pass.

---

## Task 2: Transfer Error Taxonomy and Recovery

**Files:**
- Create: `src/domain/transfer/errors.ts`
- Modify: `src/__tests__/transfer-domain.test.ts`

- [ ] Add failing tests for each error type having a recovery strategy, for recoverable errors allowing retry/skip/rollback, and for non-recoverable errors halting the transfer.
- [ ] Define `TransferErrorType` union with all required codes: `'CONTRACT_NOT_SUPPORTED' | 'VERSION_NOT_SUPPORTED' | 'PAYLOAD_INVALID' | 'REFERENCE_MISSING' | 'ENTITY_NOT_RESOLVED' | 'SOURCE_STATUS_INVALID' | 'IDENTITY_CONFLICT' | 'METADATA_MISSING' | 'SOURCE_MISSING' | 'LEGACY_CONTENT_INCOMPLETE' | 'EXPERIMENTAL_NOT_TRANSFERABLE' | 'POST_CONDITION_FAILED' | 'SIGNATURE_INCOHERENT' | 'TARGET_INCOMPATIBLE' | 'SOURCE_NOT_FOUND' | 'TARGET_INVALID' | 'STATUS_VIOLATION' | 'VALIDATION_FAILED' | 'SIGNATURE_MISMATCH' | 'DUPLICATE_CONFLICT' | 'TEMPLATE_NOT_FOUND' | 'FORMAT_UNSUPPORTED' | 'INTEGRITY_VIOLATION' | 'SCHEMA_MISMATCH'`.
- [ ] Each error type must have: stable code, technical message, UI-ready message, recoverable flag, recovery action, structured details, affected refs.
- [ ] Define `TransferRecovery`: `{ errorType, recoverable, recoveryAction?: 'retry' | 'skip' | 'rollback' | 'manual-intervention', maxRetries? }`.
- [ ] Implement `RECOVERY_STRATEGIES` registry mapping each error type to its default recovery.
- [ ] Implement `classifyError(error: unknown): TransferError` — wraps unknown errors into typed TransferError.
- [ ] Implement `createTransferError(type, details?): TransferError` — factory with all required fields.
- [ ] Run tests and TypeScript to green.

---

## Task 3: Transfer Validators

**Files:**
- Create: `src/domain/transfer/validators.ts`
- Modify: `src/__tests__/transfer-domain.test.ts`

- [ ] Add failing tests for all validation levels, distinguishing warnings from errors.
- [ ] Implement `validateContract(payload): ValidationResult` — checks contract ID is supported, version is supported, areas are valid.
- [ ] Implement `validatePreConditions(payload): ValidationResult` — source entities exist, target is in valid status, source status is allowed.
- [ ] Implement `validatePayload(payload): ValidationResult` — reference integrity, ID format, required fields, no null refs.
- [ ] Implement `validatePostConditions(result, payload): ValidationResult` — created/updated entities reference correct target.
- [ ] Implement `validateCompleteness(payload): ValidationResult` — all required metadata present, sources classified.
- [ ] Implement `validateStateCompatibility(payload): ValidationResult` — source and target states are compatible for this transfer.
- [ ] Define `ValidationResult`: `{ valid: boolean, errors: ValidationError[], warnings: TransferWarning[] }`.
- [ ] Define `ValidationError`: `{ field: string, message: string, code: string }`.
- [ ] Errors halt transfer; warnings do not. Each validator returns both.
- [ ] Run tests and TypeScript to green.

---

## Task 4: Structural Signatures (Binding Rule 1 + 2)

**Binding Rule 1 — Impronta strutturale non crittografica:**
La firma è un'impronta strutturale. Non garantisce autenticità, non ripudio, sicurezza, provenienza verificata, o integrità contro alterazioni intenzionali. Serve solo a: rilevare modifiche accidentali, confrontare payload, identificare una rappresentazione specifica, verificare corrispondenza risultato-payload.

**Binding Rule 2 — Serializzazione canonica obbligatoria:**
La firma NON usa `JSON.stringify()` diretto. Implementa una funzione canonica che: ordina ricorsivamente le chiavi, preserva ordine array, distingue `null` da campo assente, rifiuta `undefined`/funzioni/non-serializzabili, normalizza date ISO, non dipende dall'ordine di costruzione, esclude solo il campo firma stesso.

**Prova essenziale:** Due payload semanticamente identici con chiavi in ordine diverso devono produrre la stessa impronta.

**Files:**
- Create: `src/domain/transfer/signatures.ts`
- Modify: `src/__tests__/transfer-domain.test.ts`

- [ ] Implement `canonicalSerialize(value: unknown): string` — recursive key-sorting, null-safe, undefined-rejecting, ISO-date-normalizing canonical JSON serializer.
- [ ] Add tests for canonical serialization: same keys in different order produce identical output, `null` vs absent distinguished, `undefined` rejected, arrays preserve order, dates normalized.
- [ ] Implement `fnv1a hash(str: string): string` — deterministic non-cryptographic hash, no dependencies.
- [ ] Implement `computeStructuralFootprint(payload, excludedFields?: string[]): StructuralFootprint` — canonicalizes payload, hashes with FNV-1a, returns `{ algorithm: 'fnv1a', version: 1, hash, computedAt }`.
- [ ] Implement `validateStructuralFootprint(payload, footprint): boolean` — recomputes and compares.
- [ ] Implement `signTransferResult(result): TransferResultSignature` — signs result for audit.
- [ ] Label all exports explicitly as non-cryptographic structural footprint.
- [ ] Add determinism test: same payload → same footprint. Collision test: different payloads → different footprints (known collision tolerance documented).
- [ ] Run tests and TypeScript to green.

---

## Task 5: Append-Only Event Log (Binding Rule 3)

**Binding Rule 3 — Registro eventi append-only semanticamente immutabile:**
Il registro è in memoria ma semanticamente immutabile. Ogni evento include: id, tipo trasferimento, versione contratto, data, origine, destinazione, riferimenti entità, esito, codice errore eventuale, firma strutturale payload, autore dichiarato (facoltativo), indicazione non-persistente. Il registro: restituisce copie/valori immutabili, impedisce modifica retroattiva, non è presentato come registro istituzionale, può essere sostituito da persistenza futura senza cambiare contratti pubblici.

**Files:**
- Create: `src/domain/transfer/eventLog.ts`
- Modify: `src/__tests__/transfer-domain.test.ts`

- [ ] Define `TransferEventLog` interface: `append(event): void`, `list(): readonly TransferEvent[]`, `getByTransferId(id): readonly TransferEvent[]`, `getByArea(area): readonly TransferEvent[]`, `getRecent(n): readonly TransferEvent[]`.
- [ ] Define `TransferEvent` with all required fields: `id`, `transferId`, `kind`, `contractVersion`, `timestamp`, `fromArea`, `toArea`, `entityRefs`, `status`, `errorCode?`, `structuralFootprint`, `author?`, `persistent: false`.
- [ ] Implement `TransferEventLogImpl` class: internal array, append-only, returns `Object.freeze()` copies, max 100 events (configurable).
- [ ] Implement `createTransferEventLog(maxEvents?: number): TransferEventLog`.
- [ ] Add failing tests: append works, list returns frozen copy, getByTransferId filters correctly, getByArea filters correctly, getRecent returns last N, max events enforced (oldest dropped), internal array not modifiable through public API, retroactive modification impossible.
- [ ] Run tests and TypeScript to green.

---

## Task 6: Concrete Transfer Contracts (A11→A02, A02→A03)

**Files:**
- Create: `src/domain/transfer/contracts.ts`
- Modify: `src/__tests__/transfer-domain.test.ts`

- [ ] Define `A11ToA02Payload`: structured references to source, version, curriculum nodes, metadata, completeness, warnings.
- [ ] Define `A02ToA03Payload`: node reference, current text snapshot, curriculum version, sources, evidences, context, origin, status.
- [ ] Implement `validateA11ToA02(payload): ValidationResult` — source nodes must be in allowed status, target version must be `draft`, metadata completeness checked.
- [ ] Implement `validateA02ToA03(payload): ValidationResult` — segments must have non-empty content, proposal type compatible, status explicitly allowed.
- [ ] Implement `executeA11ToA02(payload): TransferResult` — creates nodes, returns result with created/updated/skipped counts.
- [ ] Implement `executeA02ToA03(payload): TransferResult` — creates proposals, returns result. Must NOT create auto-approved proposals.
- [ ] Each execute function: validate pre → execute → validate post → sign → log.
- [ ] Add failing tests: A11→A02 valid transfer, A02→A03 valid transfer, A02→A03 rejects auto-approval, missing source reference, invalid status, metadata warnings.
- [ ] Run tests and TypeScript to green.

---

## Task 7: Concrete Transfer Contracts (A02/A03→A04, A04→A07)

**Files:**
- Modify: `src/domain/transfer/contracts.ts`
- Modify: `src/__tests__/transfer-domain.test.ts`

- [ ] Define `A02ToA04Payload`: node references, explicit snapshots, sources, evidences, curriculum version, origin, legacy data warnings.
- [ ] Define `A03ToA04Payload`: proposal references, only from explicitly allowed states. Non-approved proposals: excluded or transferred as proposed content clearly qualified (never as current curriculum).
- [ ] Define `A04ToA07Payload`: teaching design identification, curriculum references, sources, institutional context, teaching structure, assisted content origin, version/snapshot, warnings.
- [ ] Implement `validateA02ToA04(payload): ValidationResult` — source IDs exist, snapshots present, legacy warnings attached.
- [ ] Implement `validateA03ToA04(payload): ValidationResult` — only allowed states, non-approved proposals flagged as proposed.
- [ ] Implement `validateA04ToA07(payload): ValidationResult` — design identified, context complete, no auto-created document entity.
- [ ] Implement `executeA02ToA04(payload): TransferResult`, `executeA03ToA04(payload): TransferResult`, `executeA04ToA07(payload): TransferResult`.
- [ ] Each execute: validate pre → execute → validate post → sign → log.
- [ ] Add failing tests for each boundary, including: non-approved proposal exclusion, legacy warnings, no auto-created document, institutional context preserved.
- [ ] Run tests and TypeScript to green.

---

## Task 8: Legacy Compatibility Adapters (Binding Rule 4)

**Binding Rule 4 — Adattatori legacy con risultati discriminati:**
Gli adattatori interni restitituiscono `LegacyAdaptationResult<T>` (discriminato `ok: true/false` con warnings). Mai `null` nei percorsi interni. Il `null` è esposto solo da funzioni di compatibilità esplicitamente denominate `tryAdaptLegacy*`. Ogni adattatore: preserva testo, classifica origine, registra campi mancanti, non inventa fonti/metadati, non promuove contenuti.

**Files:**
- Create: `src/domain/transfer/legacyAdapters.ts`
- Modify: `src/__tests__/transfer-domain.test.ts`

- [ ] Define `LegacyAdaptationResult<T>`: discriminated union `{ ok: true, value: T, warnings: TransferWarning[] } | { ok: false, error: TransferError, warnings: TransferWarning[] }`.
- [ ] Define `TransferWarning`: `{ code: string, message: string, field?: string }`.
- [ ] Implement `adaptLegacyCurriculumNode(node: unknown): LegacyAdaptationResult<CurriculumNodeRef>` — handles old format, records missing fields, classifies origin.
- [ ] Implement `adaptLegacyUdaModel(uda: unknown): LegacyAdaptationResult<A02A03ToA04Payload>` — handles old UDA format, records missing fields.
- [ ] Implement `tryAdaptLegacyCurriculumNode(node: unknown): CurriculumNodeRef | null` — compatibility wrapper returning null on failure.
- [ ] Implement `tryAdaptLegacyUdaModel(uda: unknown): A02A03ToA04Payload | null` — compatibility wrapper.
- [ ] Implement `isLegacyFormat(data: unknown): boolean` — detects legacy vs canonical.
- [ ] Add failing tests: legacy node adapted with warnings for missing fields, legacy UDA adapted, unknown format produces error result (not throw), try* wrappers return null on failure, no inventing of sources/metadata, text preserved, origin classified.
- [ ] Run tests and TypeScript to green.

---

## Task 9: Area Boundary Tests

**Files:**
- Create: `src/__tests__/transfer-boundary.test.ts`

- [ ] Write integration tests for each area boundary:
  - A11→A02: Knowledge nodes transfer to curriculum editor, preserving origin, metadata, sources.
  - A02→A03: Curriculum segments transfer to proposal generator, preserving structure, evidences, status.
  - A02→A04: Curriculum nodes transfer to teaching design with explicit snapshots and legacy warnings.
  - A03→A04: Proposals transfer to teaching design; non-approved excluded or qualified as proposed.
  - A04→A07: Teaching design transfers to export center with institutional context, no auto-document.
- [ ] Each boundary test: creates source data, executes transfer, verifies target data integrity.
- [ ] Test that identity, origin, sources, and metadata are preserved across transfers.
- [ ] Test that conflicts are detected and classified correctly.
- [ ] Test that event log records all successful transfers.
- [ ] Test that event log does NOT record transfers that fail at pre-condition validation.
- [ ] Test that input is not mutated by transfer execution.
- [ ] Test that no identity or provenance is lost in transfer.
- [ ] Run tests and TypeScript to green.

---

## Task 10: Error Handling and Conflict Resolution Tests

**Files:**
- Create: `src/__tests__/transfer-errors.test.ts`

- [ ] Write tests for each error type: CONTRACT_NOT_SUPPORTED, VERSION_NOT_SUPPORTED, PAYLOAD_INVALID, REFERENCE_MISSING, ENTITY_NOT_RESOLVED, SOURCE_STATUS_INVALID, IDENTITY_CONFLICT, METADATA_MISSING, SOURCE_MISSING, LEGACY_CONTENT_INCOMPLETE, EXPERIMENTAL_NOT_TRANSFERABLE, POST_CONDITION_FAILED, SIGNATURE_INCOHERENT, TARGET_INCOMPATIBLE.
- [ ] Test recovery strategies: retry, skip, rollback, manual-intervention.
- [ ] Test that non-recoverable errors halt the transfer.
- [ ] Test that partial results are correctly reported.
- [ ] Test conflict resolution: duplicate detection, merge strategies (create-new, update-existing, skip-duplicates).
- [ ] Test that event log is NOT populated when transfer fails at pre-condition stage.
- [ ] Test that input objects are not mutated by transfer execution.
- [ ] Test that no identity or provenance data is lost on error.
- [ ] Test structural footprint: deterministic (same payload → same hash), different payloads → different hashes, tampered payload → mismatch.
- [ ] Test post-condition failure detection.
- [ ] Run tests and TypeScript to green.

---

## Task 11: Public API and Integration

**Files:**
- Create: `src/domain/transfer/index.ts`
- Modify: `src/__tests__/transfer-domain.test.ts`

- [ ] Export all public types, validators, contracts, event log, and error utilities from `index.ts`.
- [ ] Add integration test: full transfer lifecycle (create payload → validate → execute → sign → log → verify result).
- [ ] Verify no circular dependencies between `src/domain/transfer/` and `src/domain/institution/` or `src/domain/curriculum/`.
- [ ] Run full test suite: `npx vitest run src/__tests__/transfer-*.test.ts`.
- [ ] Run `npx tsc --noEmit`.

---

## Task 12: Documentation and Full Verification

**Files:**
- Create: `docs/foundation/CML_633E_TRANSFER_CONTRACTS_IMPLEMENTATION.md`
- Create: `docs/foundation/CML_633E_TRANSFER_ERROR_TAXONOMY.md`
- Create: `docs/foundation/CML_633E_STRUCTURAL_SIGNATURE_POLICY.md`
- Create: `docs/foundation/CML_633E_AREA_BOUNDARY_CONTRACTS.md`
- Create: `docs/foundation/CML_633E_LEGACY_TRANSFER_COMPATIBILITY.md`

- [ ] Document contract types, area transitions, validation rules in `CML_633E_TRANSFER_CONTRACTS_IMPLEMENTATION.md`.
- [ ] Document full error taxonomy with codes, messages, recovery in `CML_633E_TRANSFER_ERROR_TAXONOMY.md`.
- [ ] Document canonical serialization, FNV-1a, non-cryptographic label, versioning in `CML_633E_STRUCTURAL_SIGNATURE_POLICY.md`.
- [ ] Document each area boundary contract (A11→A02, A02→A03, A02/A03→A04, A04→A07) in `CML_633E_AREA_BOUNDARY_CONTRACTS.md`.
- [ ] Document legacy adapter behavior, discriminated results, try* wrappers in `CML_633E_LEGACY_TRANSFER_COMPATIBILITY.md`.
- [ ] Run `npm test`, `npm run build`, `npm run build-storybook`, `git diff --check`.
- [ ] Verify `package.json`/lockfiles unchanged, no Dexie changes, no store changes, no feature hook changes.
- [ ] Stage only CML-633E files and create `feat(CML-633E): add canonical cross-area transfer contracts`.

---

## Scope Boundaries

### In Scope

- Transfer contract types and interfaces for A11→A02, A02→A03, A02/A03→A04, A04→A07
- Pre-condition and post-condition validation
- Structural signatures (non-cryptographic)
- Local transfer event log
- Error taxonomy and recovery strategies
- Conflict detection and resolution strategies
- Legacy data compatibility adapters
- Area boundary tests
- Documentation

### Out of Scope

- Cryptographic signatures (SHA-256, etc.)
- Transfer UI (separate phase per roadmap: CML-633I I6)
- Event persistence to IndexedDB (in-memory only for now)
- Cross-session transfer history
- Transfer rollback UI
- Real-time collaboration transfers
- External system integrations
- Dexie schema changes
- New npm dependencies
- Governance document modifications

---

## Constraints

- No new npm dependencies
- No new frameworks or state managers
- No Dexie schema changes
- No modifications to `package.json`, lockfiles, governance, curriculum content
- No push, merge, or publication
- Structural signatures only (no cryptographic)
- In-memory event log only (no persistence layer changes)
- Feature hooks are NOT modified in this phase (contracts are domain-only)
