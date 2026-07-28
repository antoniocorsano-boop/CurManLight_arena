# CML-633E Transfer Contracts Implementation

> Final implementation record for canonical cross-area transfer contracts.

## 1. Objective

Define formal, typed transfer contracts between curriculum areas (A11→A02, A02→A03, A02→A04, A03→A04, A04→A07) with validation, structural signatures, local event logging, error handling, legacy compatibility, and area boundary tests.

## 2. Baseline

- **Branch:** `feat/cml-633d-institutional-configuration`
- **Baseline commit:** `d1b7130` (feat(CML-633D): add canonical institutional configuration)
- **Plan:** `session/CML_633E_PLAN.md`

## 3. Scope

### In Scope

- Transfer contract types and interfaces for A11→A02, A02→A03, A02→A04, A03→A04, A04→A07
- Pre-condition and post-condition validation
- Structural signatures (non-cryptographic, FNV-1a)
- Canonical serialization (recursive key sorting)
- Local transfer event log (append-only, in-memory)
- Error taxonomy (24 error types) and recovery strategies
- Conflict detection and resolution strategies
- Legacy data compatibility adapters (discriminated results)
- Area boundary integration tests
- Error handling and conflict resolution tests
- Public API barrel (`src/domain/transfer/index.ts`)

### Out of Scope

- Cryptographic signatures
- Transfer UI (separate phase: CML-633I I6)
- Event persistence to IndexedDB
- Cross-session transfer history
- Feature hook modifications
- Dexie schema changes
- New npm dependencies

## 4. Architecture

```
src/domain/transfer/
├── types.ts           # Branded types, payloads, results, events, warnings
├── vocabularies.ts    # TransferArea closed type, VALID_AREAS
├── errors.ts          # 24 error types, recovery strategies, classifyError
├── validators.ts      # 6 validator functions (contract, pre, payload, post, completeness, state)
├── signatures.ts      # Canonical serialization + FNV-1a structural footprint
├── eventLog.ts        # Append-only in-memory event log
├── contracts.ts       # A11→A02, A02→A03 contracts
├── areaContracts.ts   # A02→A04, A03→A04, A04→A07 contracts
├── legacyAdapters.ts  # Legacy format adapters with discriminated results
└── index.ts           # Public API barrel
```

## 5. Binding Rules Applied

1. **Structural footprint (non-cryptographic):** FNV-1a hash, labeled as non-cryptographic, detects accidental modifications only.
2. **Canonical serialization:** Recursive key sorting, null-safe, undefined-rejecting, ISO-date-normalizing. Two identical payloads with different key order produce the same footprint.
3. **Append-only event log:** In-memory, semantically immutable, returns frozen copies, preventable retroactive modification, replaceable by future persistence.
4. **Legacy adapters with discriminated results:** Internal paths return `LegacyAdaptationResult<T>` (not null). `tryAdaptLegacy*` wrappers expose null for compatibility.

## 6. Files Created

| File | Lines | Responsibility |
|------|-------|---------------|
| `src/domain/transfer/types.ts` | ~190 | Branded types, factory functions, event creation |
| `src/domain/transfer/vocabularies.ts` | ~15 | TransferArea constants and validation |
| `src/domain/transfer/errors.ts` | ~170 | Error taxonomy, recovery strategies, classifyError |
| `src/domain/transfer/validators.ts` | ~120 | 6 validator functions with error/warning distinction |
| `src/domain/transfer/signatures.ts` | ~110 | Canonical serialization, FNV-1a, footprint computation |
| `src/domain/transfer/eventLog.ts` | ~50 | Append-only event log with frozen copies |
| `src/domain/transfer/contracts.ts` | ~150 | A11→A02, A02→A03 contracts with validation and signing |
| `src/domain/transfer/areaContracts.ts` | ~180 | A02→A04, A03→A04, A04→A07 contracts |
| `src/domain/transfer/legacyAdapters.ts` | ~100 | Legacy format detection and adaptation |
| `src/domain/transfer/index.ts` | ~80 | Public API barrel |
| `src/__tests__/transfer-domain.test.ts` | ~960 | Domain, validator, signature, event log, contract, adapter tests |
| `src/__tests__/transfer-boundary.test.ts` | ~380 | Area boundary integration tests |
| `src/__tests__/transfer-errors.test.ts` | ~160 | Error handling and conflict tests |

## 7. Test Coverage

- **transfer-domain.test.ts:** 97 tests (types, vocabularies, errors, validators, signatures, event log, contracts, area contracts, legacy adapters)
- **transfer-boundary.test.ts:** 38 tests (area boundary integration)
- **transfer-errors.test.ts:** 23 tests (error types, recovery, footprint, immutability, event log)
- **Total:** 158 new tests, 1203 tests full suite ALL PASS

## 8. Verification

- `npx tsc --noEmit` — PASS
- `npm test` — 46 files, 1203 tests, ALL PASS
- `npm run build` — PASS (26.16s)
- `git diff -- package.json` — no changes
- No Dexie schema changes
- No feature hook modifications
- No new dependencies
- No governance changes

## 9. Next Step

```
CML-633F — Document System
```
