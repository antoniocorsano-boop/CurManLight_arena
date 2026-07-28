# CML-633D Institutional Configuration Implementation

> Final implementation record for the canonical institutional configuration feature.

## 1. Objective

Add one local canonical institutional archive and remove presumed institutional identity from active product surfaces.

## 2. Baseline

- **Implementation baseline**: `c4fb40e` (docs(CML-633D): add implementation plan)
- **Branch**: `feat/cml-633d-institutional-configuration`
- **Plan**: `docs/foundation/CML_633D_IMPLEMENTATION_PLAN.md`

## 3. Scope

### In Scope

- Institutional domain contracts, validation, repository, serialization
- Selectors for neutral and configured identity
- Legacy adapter for historical data import
- Persistence in existing Zustand/IndexedDB state record
- Minimal accessible configuration surface
- A04 (teaching design) read integration
- A07 (documents and export) header and export integration
- Hardcoded identity removal from all active surfaces
- Backup, restore, and import compatibility

### Out of Scope

- CML-633E (revision and decision workflow)
- Institutional verification or external authentication
- Dexie schema changes
- New IndexedDB tables
- New dependencies
- Governance document updates
- Curriculum content modifications
- Push, merge, or publication

## 4. Architecture

```
src/domain/institution/
  types.ts           — Entities, archive, statuses, completeness contracts
  vocabularies.ts    — Statuses, transitions, roles, constants
  constructors.ts    — Empty archive and entity constructors
  validators.ts      — Structural, completeness, archive integrity validation
  repository.ts      — Immutable aggregate operations
  serialization.ts   — Backup envelope, import preview, apply, rollback
  legacyAdapters.ts  — Legacy candidate detection
  selectors.ts       — Neutral identity, active context, A04/A07 projections
  index.ts           — Public API barrel
```

## 5. Files Introduced

| File | Purpose |
|---|---|
| `src/domain/institution/types.ts` | 150 lines; all entity and result types |
| `src/domain/institution/vocabularies.ts` | 37 lines; constants and transitions |
| `src/domain/institution/constructors.ts` | 54 lines; factory functions |
| `src/domain/institution/validators.ts` | 208 lines; structural and integrity validation |
| `src/domain/institution/repository.ts` | 154 lines; immutable CRUD and lifecycle |
| `src/domain/institution/serialization.ts` | 102 lines; backup and import |
| `src/domain/institution/legacyAdapters.ts` | 51 lines; legacy detection |
| `src/domain/institution/selectors.ts` | 151 lines; projections and selectors |
| `src/domain/institution/index.ts` | 8 lines; barrel export |
| `src/features/session/components/InstitutionConfigPanel.tsx` | ~395 lines; accessible editor |
| `src/__tests__/institution-domain.test.ts` | ~950 lines; domain and repository |
| `src/__tests__/institution-integration.test.tsx` | ~1597 lines; store, UI, A04, A07 |
| `src/__tests__/institution-hardcodes.test.ts` | 250 lines; production source regression |

## 6. Contracts

### 6.1 Entity Types

- `Institute`, `AcademicYear`, `InstituteSite`, `InstitutionalContext`, `InstitutionalDocumentProfile`
- `InstitutionalArchive` (aggregate root)
- `InstituteStatus`, `AcademicYearStatus`, `InstituteSiteStatus`, `InstitutionCompleteness`

### 6.2 Result Types

- `ArchiveOperationResult` — success + new archive or errors
- `InstitutionValidationResult` — valid + errors + warnings
- `InstitutionalImportPreview` — additions, updates, conflicts, fingerprints
- `InstitutionalImportResult` — success + new archive + previous archive for rollback

## 7. Repository

- Immutable operations: every function returns a new snapshot
- No entity deletion; archival is terminal
- Active institute must be `confirmed-local`
- Active year must be `planned` or `active`; one per institute
- Demotion clears all active references
- Cross-owner references rejected

## 8. Persistence

- **Strategy**: Aggregate stored in existing Zustand/IndexedDB state record
- **Atomic write**: `replaceInstitutionalArchive()` writes entire state in one operation
- **Schema**: Dexie version remains `2`; no new tables
- **Hydration**: Missing archive → empty neutral; invalid archive → keep default
- **Security**: Action functions and unknown keys rejected on restore

## 9. Configuration Surface

- `InstitutionConfigPanel` — accessible form within existing settings modal
- Fields: name, code (optional), orders, site (optional), year, document profile, declared actor
- Keyboard submission, ARIA validation, focus management
- Destructive actions require explicit confirmation dialog
- Nested dialog escape and focus trap

## 10. A04 Integration

- `getA04InstitutionalRead()` provides institute, year, orders, warnings
- Order availability checked against configured orders
- Unsupported order shows warning; blocks generation
- No UDA records rewritten on context change

## 11. A07 Integration

- `getA07InstitutionalDocumentRead()` provides full document projection
- `projectA07InstitutionalDocumentHeader()` renders stable shared header
- All export formats (Word, TXT, CML, SCORM, PDF, clipboard) use canonical projection
- HTML escaping at all boundaries
- Incomplete config shows warning without blocking personal use

## 12. Backup

- Archive included in downloadable, emergency, and cloud backups
- Restored with validation; old backups restore as neutral
- Import preview → apply → rollback workflow
- Fingerprint-based tamper detection

## 13. Hardcoded Identities

| Value | Status |
|---|---|
| `I.C. Calvario-Covotta don Lorenzo Milani` | Removed from production; preserved in `volumesKB.ts` |
| `AVIC849003` | Removed from production; preserved in `volumesKB.ts` |
| `Maria Letizia` | Removed from production; preserved in `volumesKB.ts` Vol.10 |
| `Via Calvario` / `Via Covotta` | Removed from production |
| `2025-2026` static year | Removed from production |
| `MOCK_SIGNATURE` | Removed from production |
| `docente@gmail.com` | Removed from production |
| All authority claims | Removed from active UI surfaces |

## 14. Neutral Identity Behavior

When no configuration exists:
- Institute name: `'Istituto non configurato'`
- No code, signature, or authority
- A04 shows `MODALITA: PERSONALE`
- A07 uses neutral heading with incomplete warning
- SCORM uses `curmanlight-local` as organization ID

## 15. Tests

| Suite | Count | Scope |
|---|---|---|
| `institution-domain.test.ts` | ~55 tests | Domain contracts, validation, repository, serialization, selectors |
| `institution-integration.test.tsx` | ~45 tests | Store, persistence, UI, A04, A07, backup, SCORM |
| `institution-hardcodes.test.ts` | ~15 tests | Production source scan, WikiLLM, legacy labeling |
| **Total** | **~115 CML-633D tests** | |

## 16. Verification Results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | PASS |
| `npm test` (43 files, 1045 tests) | ALL PASS |
| `npm run build` | PASS |
| `npm run build-storybook` | PASS |
| `git diff --check` | PASS (CRLF warnings only) |
| Hardcoded identity scan | PASS (no production occurrences) |
| Package/lockfile changes | None |
| Dexie schema changes | None |

## 17. Risks

| Risk | Mitigation |
|---|---|
| Future institutional verification needs | Architecture supports adding verification without breaking local-only flow |
| Schema evolution | Version check rejects future schemas; migration path needed for v2 |
| Large archive performance | Currently single aggregate; sufficient for local use |
| Legacy data quality | Legacy adapter normalizes and warns; user must manually promote |

## 18. Verdict

```
CML_633D_INSTITUTIONAL_CONFIGURATION_COMPLETE
```

All criteria satisfied:
- Canonical institutional domain
- Versioned archive aggregate
- Existing Zustand/IndexedDB persistence
- No new Dexie tables or schema changes
- Multiple institutes and years supported
- Single active reference enforced
- Backup, import, and rollback validated
- Declarative context and role
- Accessible configuration surface
- A04 and A07 read canonical context
- No active surface reconstructs identity
- No hardcoded institutional identity in production
- Neutral behavior without configuration
- Legacy data not auto-promoted
- All tests pass
- Documentation complete

## 19. Next Step

```
CML-633E — Revision and Decision Workflow
```
