# CML-633D Institutional Configuration Schema

> Canonical reference for the institutional domain contracts, archive structure, and selection rules.

## 1. Entity Types

### 1.1 Institute

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `EntityId` | yes | UUID v4 generated at creation |
| `metadata` | `EntityMetadata` | yes | Includes `createdAt`, `updatedAt`, `origin`, `schemaVersion` |
| `name` | `string` | yes | Free-text institute name; must be non-empty |
| `mechanicalCode` | `string` | no | 6-20 alphanumeric chars; structurally validated only, never externally authenticated |
| `schoolOrders` | `SchoolOrder[]` | yes | From `['infanzia', 'primaria', 'secondaria']`; at least one required for non-legacy |
| `status` | `InstituteStatus` | yes | See §2.1 |
| `documentProfile` | `InstitutionalDocumentProfile` | no | Optional local heading, subheading, footer, general references, logo |
| `activeAcademicYearRef` | `AcademicYearReference` | no | Managed by `setActiveAcademicYear`; cleared on demotion/archival |

### 1.2 AcademicYear

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `EntityId` | yes | UUID v4 |
| `metadata` | `EntityMetadata` | yes | |
| `instituteRef` | `InstituteReference` | yes | Owner institute |
| `label` | `string` | yes | Format `YYYY/YYYY+1`; validated against date range |
| `startsOn` | `string` | yes | ISO date `YYYY-MM-DD` |
| `endsOn` | `string` | yes | Must be after `startsOn` |
| `status` | `AcademicYearStatus` | yes | See §2.2 |

### 1.3 InstituteSite

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `EntityId` | yes | UUID v4 |
| `metadata` | `EntityMetadata` | yes | |
| `instituteRef` | `InstituteReference` | yes | Owner institute |
| `name` | `string` | yes | Non-empty |
| `isMain` | `boolean` | yes | At most one non-archived main site per institute |
| `address` | `InstituteAddress` | no | Optional street, city, province, postalCode, country |
| `email` | `string` | no | |
| `phone` | `string` | no | |
| `status` | `InstituteSiteStatus` | yes | See §2.3 |

### 1.4 InstitutionalContext

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `EntityId` | yes | UUID v4 |
| `metadata` | `EntityMetadata` | yes | |
| `instituteRef` | `InstituteReference` | yes | Must be the active confirmed institute |
| `academicYearRef` | `AcademicYearReference` | no | Must be a non-archived year of the same institute |
| `siteRef` | `InstituteSiteReference` | no | Must be a non-archived site of the same institute |
| `declaredActor` | `DeclaredActorReference` | no | Self-declared name and role; assertion is always `'self-declared'` |

### 1.5 InstitutionalDocumentProfile

| Field | Type | Required |
|---|---|---|
| `heading` | `string` | no |
| `subheading` | `string` | no |
| `footer` | `string` | no |
| `generalReferences` | `string` | no |
| `logo` | `LocalLogoDescriptor` | no |

Logo validation: local asset ID (no data URIs, no file paths, no control characters), media type restricted to PNG/JPEG/WebP, max 2 MB, extension must match media type.

## 2. Status Unions

### 2.1 InstituteStatus

```
'unconfigured' | 'draft' | 'confirmed-local' | 'incomplete' | 'legacy-imported' | 'archived'
```

### 2.2 AcademicYearStatus

```
'planned' | 'active' | 'closed' | 'archived' | 'legacy'
```

### 2.3 InstituteSiteStatus

```
'draft' | 'legacy-imported' | 'archived'
```

## 3. Archive Aggregate

```typescript
interface InstitutionalArchive {
  schemaVersion: number;       // Currently 1
  updatedAt: string;           // ISO timestamp
  institutes: Institute[];
  academicYears: AcademicYear[];
  sites: InstituteSite[];
  contexts: InstitutionalContext[];
  activeInstituteRef?: InstituteReference;
  currentContextRef?: InstitutionalContextReference;
}
```

- **Schema version**: `INSTITUTIONAL_ARCHIVE_SCHEMA_VERSION = 1`
- **Active institute**: At most one; must be `confirmed-local`
- **Active year**: At most one per institute; must be `active` status with matching `activeAcademicYearRef`
- **Current context**: Must belong to the active institute

## 4. Configuration States

| Completeness | Meaning |
|---|---|
| `unconfigured` | No institute exists or active institute is undefined |
| `minimal` | Institute exists but only has name and orders |
| `partial` | Has mechanical code or heading but not all fields for `complete-local` |
| `complete-local` | `confirmed-local` + at least one order + non-empty heading |
| `legacy` | Status is `legacy-imported` or origin is `'legacy'` |
| `invalid` | Structural validation fails (empty name, bad IDs, etc.) |

**Key invariant**: `complete-local` does NOT imply verified, authenticated, or officially approved. It means the user has locally confirmed the data they entered.

## 5. Status Transitions

| From | Allowed To |
|---|---|
| `unconfigured` | `draft`, `archived` |
| `draft` | `confirmed-local`, `archived` |
| `confirmed-local` | `draft`, `incomplete`, `archived` |
| `incomplete` | `archived` |
| `legacy-imported` | `draft`, `archived` |
| `archived` | (none) |

## 6. Repository Rules

- All operations return `ArchiveOperationResult` with a new snapshot or structured errors
- No operation mutates the input archive (immutable snapshots via deep clone)
- Setting active institute requires `confirmed-local` status
- Setting active year requires confirmed institute + valid year
- Demoting from `confirmed-local` clears: active institute ref, active year ref, current context, active year statuses become `closed`
- Archiving an institute closes all its active years and clears references
- No entity is deleted; archival is terminal

## 7. Selectors

All selectors validate archive integrity before returning values:

- `getActiveInstitute(archive)` → validated institute or `undefined`
- `getNeutralInstituteName(archive)` → institute name or `'Istituto non configurato'`
- `getActiveAcademicYear(archive)` → validated active year or `undefined`
- `getConfiguredSchoolOrders(archive)` → ordered array of school orders
- `getMainInstituteSite(archive)` → first non-archived main site
- `getInstitutionalDocumentProfile(archive)` → resolved profile with institute name
- `getCurrentInstitutionalContext(archive)` → current context or `undefined`
- `getDeclaredRoleWording(archive)` → human-readable role string or `undefined`
- `getInstitutionalWarnings(archive)` → always contains at least one warning
- `getA07InstitutionalDocumentRead(archive)` → full projection for document exports
- `getA04InstitutionalRead(archive, selectedOrder, contextOrder)` → projection for teaching design

## 8. Data Authority

- **Institute name**: Single source of truth is `Institute.name`; `documentProfile.instituteName` is ignored if present
- **Active institute**: `archive.activeInstituteRef`; validated against `confirmed-local` status
- **Active year**: Bidirectional: `Institute.activeAcademicYearRef` ↔ exactly one `AcademicYear` with `status: 'active'`
- **Document profile**: Derived from active institute's `documentProfile` + context site + active year
- **Declared role**: Always `assertion: 'self-declared'`; never authenticated, never institutional delegation
- **Mechanical code**: Optional; structurally validated (6-20 alphanumeric); never externally verified

## 9. Separation: Local Configuration vs. Institutional Verification

| Aspect | Local Configuration (CML-633D) | Institutional Verification |
|---|---|---|
| Authority | User-entered, locally confirmed | External validation (not implemented) |
| Confirmation | `confirmed-local` status | Would require external authority |
| Role | Self-declared per session | Would require authentication |
| Code | Optional, structural only | Would require institutional database |
| Exports | Local neutral/configured | Would carry official weight |

CML-633D explicitly does NOT implement institutional verification. All data is local and user-declared.
