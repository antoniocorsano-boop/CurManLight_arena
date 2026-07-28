# CML-633D Backup, Import and Compatibility

> Reference for backup format, import workflow, rollback, and backward compatibility.

## 1. Backup Format

### 1.1 Downloadable Backup (JSON)

The downloadable backup is the existing Zustand state record serialized as JSON. The institutional archive is a property of this record:

```json
{
  "state": {
    "role": "...",
    "discipline": "...",
    "order": "...",
    "schoolYear": "...",
    "decisions": {},
    "customTexts": {},
    "savedUda": [],
    "institutionalArchive": {
      "schemaVersion": 1,
      "updatedAt": "...",
      "institutes": [],
      "academicYears": [],
      "sites": [],
      "contexts": [],
      "activeInstituteRef": null,
      "currentContextRef": null
    }
  },
  "version": 0
}
```

### 1.2 Institutional Archive Envelope (Export/Import)

A standalone institutional archive uses a dedicated envelope:

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-07-27T10:00:00Z",
  "archive": { ... }
}
```

## 2. Schema Version

| Property | Value |
|---|---|
| `INSTITUTIONAL_ARCHIVE_SCHEMA_VERSION` | `1` |
| Dexie database version | `2` (unchanged) |
| New IndexedDB tables | None |
| Dexie schema changes | None |

The institutional archive is stored within the existing Zustand state record in IndexedDB. No new tables or schema migrations are introduced.

## 3. Serialization

- `serializeInstitutionalArchive(archive)` → validates integrity, then produces JSON envelope
- `deserializeInstitutionalArchive(json)` → validates envelope schema version, structure, and archive integrity
- All values are deep-cloned to prevent reference leaks
- Future schema versions are rejected with explicit error

## 4. Import Workflow

### 4.1 Preview

`previewInstitutionalImport(currentArchive, json)` returns:

| Field | Description |
|---|---|
| `success` | Whether preview completed without errors |
| `incomingArchive` | The validated incoming archive |
| `additions` | IDs present in incoming but not in current |
| `updates` | IDs present in both but with different content |
| `conflicts` | IDs that are updated (subset of updates) |
| `baseFingerprint` | Deterministic hash of current archive |
| `incomingFingerprint` | Deterministic hash of incoming archive |
| `errors` | Any validation errors |

Preview does NOT mutate the current archive.

### 4.2 Apply

`applyInstitutionalImport(currentArchive, preview, resolution?)` returns:

| Field | Description |
|---|---|
| `success` | Whether apply completed |
| `archive` | The new archive (incoming content) |
| `previousArchive` | The archive before apply (for rollback) |
| `errors` | Any errors |

Apply checks:
- Base fingerprint hasn't changed since preview
- Incoming content hasn't been tampered with since preview
- All conflicts are explicitly resolved
- Both archives are structurally valid

### 4.3 Rollback

`rollbackInstitutionalImport(result)` → returns the `previousArchive` from the import result.

## 5. State Persistence Integration

### 5.1 Atomic Write

The institutional archive is persisted atomically as part of the Zustand state record:

```typescript
replaceInstitutionalArchive(archive: InstitutionalArchive): void
```

This writes the entire state record in one IndexedDB operation. There is no separate institutional persistence layer.

### 5.2 Hydration

On store rehydration (page load):

- If persisted state has no `institutionalArchive` → initialize with empty archive
- If persisted state has a valid archive → use it
- If persisted state has an invalid archive → keep existing (default empty)
- Action functions (`replaceInstitutionalArchive`, `resetAll`) are never overwritten by persisted data

### 5.3 Backup Integration

| Surface | Archive Included |
|---|---|
| Downloadable backup (`handleDownloadBackup`) | Yes |
| Emergency backup (`beforeunload`) | Yes |
| Google Drive sync (`handleWorkspaceSync`) | Yes |
| Cloud restore (`handleWorkspaceAutoPull`) | Yes (with validation) |
| Local emergency restore | Yes (with validation) |

## 6. Validation Rules

### 6.1 Schema Version

- Only `INSTITUTIONAL_ARCHIVE_SCHEMA_VERSION` (currently `1`) is accepted
- Future versions are rejected before any data is processed
- Malformed JSON is rejected with explicit error message

### 6.2 Archive Integrity

`validateArchiveIntegrity` checks:
- Valid schema version
- Valid `updatedAt` timestamp
- All entities have valid IDs, metadata, and status values
- No duplicate IDs across all collections
- No orphaned references (year→institute, site→institute, context→institute)
- Cross-owner context references (year, site must belong to same institute)
- At most one active year per institute
- Bidirectional active year consistency
- At most one main site per institute (non-archived)
- No overlapping academic years (non-archived)
- Active institute is `confirmed-local`
- Current context belongs to active institute

### 6.3 Reject Without Mutation

All import/restore operations follow the principle:
- Validate first
- Reject invalid data without modifying current state
- Return structured errors
- Never fabricate identity from partial data

## 7. Backward Compatibility

### 7.1 Legacy Backups (Pre-CML-633D)

- Backups without `institutionalArchive` are restored with an empty neutral archive
- Existing `decisions`, `savedUda`, `customTexts` are preserved
- No institutional identity is fabricated

### 7.2 Legacy Institutional Data

- `importLegacyInstitutions(sources)` creates `legacy-imported` candidates
- Legacy candidates are NEVER automatically activated or confirmed
- Users must explicitly review and promote legacy data to `draft` status
- Conflicting legacy sources (different addresses for same name) remain separate

### 7.3 Future Schema Evolution

- Schema version `> 1` is rejected by current code
- Import preview detects and rejects future schemas
- No migration path is needed until schema changes

## 8. What is NOT Changed

| Aspect | Status |
|---|---|
| Dexie schema version | Remains `2` |
| IndexedDB tables | No new tables |
| `package.json` | Unchanged |
| Lockfiles | Unchanged |
| Curriculum content | Unchanged |
| Governance documents | Unchanged |
| `volumesKB.ts` | Unchanged (historical archive) |
| `curriculumKB.ts` | Unchanged (CML-633C authoritative) |
