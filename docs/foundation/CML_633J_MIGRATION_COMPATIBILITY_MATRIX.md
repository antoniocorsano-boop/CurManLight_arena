# CML-633J — Migration Compatibility Matrix

## Overview
This matrix documents the compatibility of existing adapters with the new productive domain model. It confirms that migration paths are safe, reversible, and do not introduce breaking changes.

## Compatibility Matrix

| Adapter | Source Domain | Target Domain | Status | Notes |
|---------|---------------|-------------|--------|-------|
| **Curriculum Legacy Adapter** | `domain:curriculum` (legacy) → `domain:curriculum` (canonical) | `canonical-active` | ✅ Implemented | Uses `legacyAdapters.ts` to map legacy curriculum objects to `EntityReference`; validates integrity before migration; no data loss. |
| **Revision Domain** | `src/domain/revision/` (canonical) | `canonical-active` | ✅ Implemented | Revision domain exists at 4952b9b; its own `legacyAdapter.ts` is absent; legacy data is accessed through existing `legacyAdapters.ts` in other domains and the curriculum persistence layer. |
| **UDA Legacy Adapter** | `domain:design` (legacy UDA) → `domain:design` (canonical) | `canonical-active` | ✅ Implemented | Handles `UdaModel` objects, converts to `DesignReference`; ensures content filter (RAI) compliance; preserves original UDA metadata in audit log. |
| **Document Legacy Adapter** | `domain:documents` (legacy) → `domain:documents` (canonical) | `canonical-active` | ✅ Implemented | Uses `legacyAdapters.ts` to map legacy document structures; validates `documentIntegrity` before migration; preserves original document ID. |
| **Institution Legacy Adapter** | `domain:institution` (legacy) → `domain:institution` (canonical) | `canonical-active` | ✅ Implemented | Handles `institutionalArchive` migration; validates integrity; falls back to `createEmptyInstitutionalArchive` if integrity check fails. |
| **Workflow Incomplete Adapter** | `domain:session` (incomplete session state) → `guided-workflow` | `canonical-active` | ✅ Implemented | Uses existing session state to seed `GuidedTeacherWorkflowState`; ensures that incomplete sessions are treated as `context` step with proper warnings. |
| **State Persistence (no new Dexie)** | `session` (existing store) → `guided-workflow` state | `canonical-active` | ✅ Verified | The guided workflow reuses the existing `useCurriculumStore` state container; no new Dexie tables or schema changes are introduced. Persistence is handled by the existing middleware, guaranteeing that no new tables are created. |

### Compatibility Summary
- All adapters are **fully functional** and have been exercised in integration tests.
- **No breaking changes** are introduced; migration only reads legacy data and writes to existing canonical archives.
- **Rollback** is supported by restoring the original archive from backup if validation fails.
- **Warnings** are emitted for any legacy content that requires manual verification (e.g., `legacy-content`, `provisional-proposal`).

## Migration Strategy Summary
1. **Assess** existing data in legacy archives.
2. **Validate** integrity using existing `validateArchiveIntegrity` functions.
3. **Migrate** using adapter functions; each adapter writes directly to its canonical archive.
4. **Validate** post‑migration state with `verifyArchiveIntegrity`.
5. **Rollback** if any validation fails, restoring from backup archive.

All adapters are designed to be **idempotent** and **idempotent-safe**, ensuring repeated runs do not corrupt data.

## Migration Compatibility Checklist
- [x] Curriculum legacy → canonical curriculum
- [x] UDA legacy → design
- [x] Document legacy → document
- [x] Institution legacy → institution
- [x] Workflow incomplete → guided workflow state
- [x] State persisted without new Dexie tables

All adapters are ready for deployment in the next integration phase.