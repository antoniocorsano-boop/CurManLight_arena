# CML-633F Canonical Document System Implementation

## Objective
Implement a canonical document system for A07 with persistent entities, immutable versions, structured content, state machine, institutional snapshotting, and verifiable export.

## Architecture
- Domain contracts in `src/domain/documents/`
- Persistence via Zustand aggregate (Option A — no new Dexie tables)
- A07 views consume selectors
- A04→A07 transfer via CML-633E contract

## Key Decisions
- **Option A** persistence: `DocumentArchive` aggregated in existing Zustand state record, persisted via existing IndexedDB mechanism
- **Entity types** `'document'` and `'document-version'` already registered in `EntityType` union
- **HTML** is a derived rendering, never the authoritative content
- **No new dependencies** added
- **No Dexie schema changes**

## Files Created
```
src/domain/documents/
  types.ts             # DocumentEntity, DocumentVersion, DocumentContent, sections, statuses
  vocabularies.ts      # DocumentType, DocumentStatus, transitions, export formats
  constructors.ts      # Factory functions
  validators.ts        # Structural, completeness, transition, integrity validators
  versioning.ts        # Version creation, promotion, restore, listing
  repository.ts        # CRUD, list, filter, integrity checks
  serialization.ts     # JSON envelope, export/import serialization
  rendering.ts         # Safe HTML renderer (escaped, no script injection)
  exportPolicy.ts      # Format validation, MIME, extension, content checks
  legacyAdapters.ts    # UDA HTML → canonical, old exports → legacy state
  selectors.ts         # Public read models for A07 views
  contracts.ts         # A04→A07 transfer producing canonical documents
  index.ts             # Public API barrel
```

## Files Modified
- `src/store/useCurriculumStore.ts` — Added `documentArchive` property and `replaceDocumentArchive` action
- `src/features/documents/components/EsportazioniTab.tsx` — Added canonical document section
- `src/features/documents/components/CanonicalDocumentTab.tsx` — New minimal A07 surface component
- `src/features/documents/components/index.ts` — Added export

## Test Files Created
1. `document-domain.test.ts` — Domain entities, versions, sections, state machine, validation, integrity
2. `document-repository.test.ts` — CRUD, listing, filters, transitions, duplication, archiving, integrity
3. `document-transfer.test.ts` — A04→A07 transfer validation and creation
4. `document-rendering.test.ts` — Safe HTML rendering, escape verification, output consistency
5. `document-export.test.ts` — Format validation, MIME, extension, filename, consistency
6. `document-legacy.test.ts` — Legacy HTML import, missing fields, no auto-promotion
7. `document-integration.test.ts` — End-to-end flows, CML-633E/CML-631 compatibility

## Test Results
- 1339 tests pass (52 files)
- 7 new test files with ~135 new tests
- All existing 1203 tests still pass

## Verdict
CML_633F_CANONICAL_DOCUMENT_SYSTEM_COMPLETE