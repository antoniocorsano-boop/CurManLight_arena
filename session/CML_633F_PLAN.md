# CML-633F Canonical Document System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` or `executing-plans` to implement this plan task-by-task.
>
> **Baseline commit:** `64c4fe3` (feat(CML-633E): add canonical cross-area transfer contracts)
>
> **Branch:** `feat/cml-633f-canonical-document-system`

**Goal:** Transform A07 from temporary HTML generator into a canonical document system with persistent entities, immutable versions, structured content, state machine, institutional snapshotting, and verifiable export.

**Architecture:** `src/domain/documents/` owns all contracts. Documents are persisted as an aggregated property of the existing Zustand/IndexedDB state record (Option A — no Dexie schema change). A07 views consume selectors without direct access to domain internals.

**Tech Stack:** React 18, TypeScript, Zustand (existing), Vitest, Testing Library, Vite.

---

## File Structure

```
src/domain/documents/
  types.ts             # DocumentEntity, DocumentVersion, DocumentContent, sections, statuses
  vocabularies.ts      # DocumentType, DocumentStatus, transitions, export formats
  constructors.ts      # Factory functions for entities, versions, sections
  validators.ts        # Structural, completeness, state-transition, integrity validators
  versioning.ts        # Version creation, promotion, rollback, snapshotting
  repository.ts        # CRUD, list, filter, integrity checks
  serialization.ts     # JSON envelope, export/import serialization
  rendering.ts         # HTML renderer: sections → safe HTML
  exportPolicy.ts      # Format validation, MIME, extension, content checks
  legacyAdapters.ts    # UDA HTML → canonical, old exports → legacy state
  selectors.ts         # Public read models for A07 views
  index.ts             # Public API barrel
```

---

## Reuse (no rewrite)

| From CML-633 | Reuse as-is |
|---|---|
| Identity | `EntityId`, `EntityMetadata`, `EntityReference`, `ContentOrigin`, `CURRENT_SCHEMA_VERSION`, `ActorReference` |
| Institution | `InstituteReference`, `AcademicYearReference`, `getA07InstitutionalDocumentRead`, `projectA07InstitutionalDocumentHeader` |
| Transfer | `A04ToA07Payload`, `executeA04ToA07`, `StructuralFootprint`, `TransferEventLog`, errors, validators |
| Types | `EntityType` already includes `'document'` and `'document-version'` |

---

## Task 1: Document Domain Types and Vocabularies

**Files:** `src/domain/documents/types.ts`, `src/domain/documents/vocabularies.ts`

Define:

- `DocumentId` — branded string (or use existing `EntityId`)
- `DocumentType` — closed union: `'teaching-design' | 'annual-plan' | 'revision-proposal' | 'decision-record' | 'meeting-minutes' | 'report' | 'curriculum-document' | 'assessment-rubric' | 'generic-local-document'`
- `DocumentStatus` — `'draft' | 'in-progress' | 'completed' | 'shared-locally' | 'archived' | 'superseded' | 'legacy'`
- `DocumentEntity` — `id, metadata, documentType, title, status, currentVersionRef, instituteRef?, academicYearRef?, author?, sourceRefs[], originRefs[], tags?`
- `DocumentVersion` — `id, documentRef, versionNumber, content, createdAt, author?, reason?, sourceRefs[], institutionalSnapshot, structuralFootprint, previousVersionRef?, frozen, metadata`
- `DocumentContent` — `{ sections: DocumentSection[] }`
- `DocumentSection` discriminated union: `HeadingSection | ParagraphSection | ListSection | TableSection | CurriculumReferenceSection | SourceReferenceSection | TeachingDesignSection | MetadataSection`
- `DocumentArchive` — `{ schemaVersion, updatedAt, documents: DocumentEntity[], versions: DocumentVersion[] }`
- `DOCUMENT_ARCHIVE_SCHEMA_VERSION` = 1

---

## Task 2: Document State Machine and Transitions

**Files:** `src/domain/documents/vocabularies.ts` (extend)

Define:

- `DOCUMENT_STATUS_TRANSITIONS` — map from `DocumentStatus` to allowed next statuses
- Transition table:
  - `draft` → `in-progress`
  - `in-progress` → `completed` (explicit)
  - `completed` → `shared-locally`
  - Any non-legacy → `archived`
  - Any non-legacy → `superseded` (with new version)
  - `legacy` → only `draft` or `archived`

Each transition must:
- Be validated
- Be reversible when possible
- Not allow auto-approval

---

## Task 3: Constructors

**Files:** `src/domain/documents/constructors.ts`

- `createEmptyDocumentArchive(): DocumentArchive`
- `createDocument(input): DocumentEntity` — auto-sets `draft` status
- `createInitialVersion(document, content, input): DocumentVersion` — version 1
- `createNextVersion(document, previousVersion, content, input): DocumentVersion` — increments number
- `createSectionHeading(level, text): HeadingSection`
- `createSectionParagraph(text, format?): ParagraphSection`
- `createSectionList(items, ordered?): ListSection`
- `createSectionTable(headers, rows): TableSection`
- `createSectionCurriculumReference(refs): CurriculumReferenceSection`
- `createSectionSourceReference(refs): SourceReferenceSection`
- `createSectionTeachingDesign(snapshot): TeachingDesignSection`
- `createSectionMetadata(data): MetadataSection`

---

## Task 4: Validators

**Files:** `src/domain/documents/validators.ts`

- `validateDocument(document): ValidationResult` — id, metadata, status, currentVersionRef resolvable
- `validateVersion(version): ValidationResult` — documentRef, content, number, dates
- `validateContent(content): ValidationResult` — at least one section, no empty sections
- `validateTransition(document, newStatus): ValidationResult` — checks transition table
- `validateArchiveIntegrity(archive): ValidationResult` — no orphan versions, no missing refs
- `validateReference(ref, archive): ValidationResult` — entity exists, type matches

---

## Task 5: Versioning

**Files:** `src/domain/documents/versioning.ts`

- `createVersion(document, content, archive, input): { version: DocumentVersion; archive: DocumentArchive }` — creates version, links to document
- `setCurrentVersion(documentId, versionId, archive): { document: DocumentEntity; archive: DocumentArchive }` — promotes version to current
- `restoreVersion(documentId, versionId, archive, input): { version: DocumentVersion; archive: DocumentArchive }` — creates NEW version from old content
- `listVersions(documentId, archive): DocumentVersion[]` — ordered by version number

Rules:
- Published/archived versions are NOT overwritten
- Restore creates new version (not mutation)
- Previous version remains available
- Document always points to current version
- No version auto-approved

---

## Task 6: Repository

**Files:** `src/domain/documents/repository.ts`

- `createDocumentInArchive(document, archive): DocumentArchive` — add to archive, auto-create version 1
- `getDocument(id, archive): DocumentEntity | undefined`
- `listDocuments(archive, filter?): DocumentEntity[]` — filter by type, status, institute, year
- `getVersion(id, archive): DocumentVersion | undefined`
- `listVersions(documentId, archive): DocumentVersion[]`
- `setCurrentVersion(documentId, versionId, archive): DocumentArchive`
- `archiveDocument(documentId, archive): DocumentArchive`
- `supersedeDocument(documentId, archive): DocumentArchive`
- `duplicateDocument(documentId, archive): { document: DocumentEntity; archive: DocumentArchive }`
- `verifyIntegrity(archive): { valid: boolean; errors: string[]; warnings: string[] }`

Integrity checks:
- Every document has currentVersionRef resolvable
- Every version's documentRef exists
- No orphan versions
- No duplicate IDs
- All refs valid
- No document without version
- No version without document

---

## Task 7: Serialization and Persistence Integration

**Files:** `src/domain/documents/serialization.ts`

- `serializeDocumentArchive(archive): string` — JSON envelope with schema version
- `deserializeDocumentArchive(json): DocumentArchive` — version check, structural validation
- `exportDocument(document, version, archive): ExportPayload` — full document for export
- `importDocument(payload): { document: DocumentEntity; version: DocumentVersion; warnings }`

**Store integration** (modify `src/store/useCurriculumStore.ts`):
- Add `documentArchive: DocumentArchive` to `CurriculumStoreState`
- Add actions: `replaceDocumentArchive`, `addDocumentEvent`
- Default: `createEmptyDocumentArchive()`

**Persistence decision:** Option A — aggregated in existing Zustand/IndexedDB state.
- No Dexie schema changes
- Atomic write with institutional archive
- Versioned archive separate from institutional

---

## Task 8: Rendering (Safe HTML)

**Files:** `src/domain/documents/rendering.ts`

- `renderDocumentContent(content): string` — DocumentContent → safe HTML string
- `renderSection(section, options?): string` — each section type → semantic HTML
- `renderDocumentHead(profile, options?): string` — institutional header + title
- `renderDocument(document, version, archive?): string` — full document HTML

Requirements:
- No `dangerouslySetInnerHTML` needed for canonical content
- No `<script>` tags
- No arbitrary markup
- Semantic HTML5 (headings, lists, tables)
- Escape all text content
- Testable without DOM
- Output consistent with preview

---

## Task 9: A04→A07 Transfer Integration

**Files:** `src/domain/documents/contracts.ts` or extend `src/domain/transfer/areaContracts.ts`

- `executeA04ToA07Document(payload, archive): { document: DocumentEntity; version: DocumentVersion; archive: DocumentArchive }`
- Produces a `draft` document with version 1
- Preserves: identity, snapshot, curricular references, sources, evidences, assisted content origin, institute, academic year, author, warnings, structural footprint
- Creates: document entity, initial version, relationship with source teaching design
- Logs: transfer event
- Forbids: auto-approval

---

## Task 10: Institutional Snapshot in Versions

**Files:** `src/domain/documents/versioning.ts` (extend)

Each version must snapshot:
- Institute name
- Mechanical code (if configured)
- Site name (if configured)
- Academic year label
- Declared role (if configured)

Implementation: Store `InstitutionalSnapshot` in `DocumentVersion.institutionalSnapshot`
- `{ instituteName: string; mechanicalCode?: string; siteName?: string; academicYearLabel?: string; declaredRole?: string; configured: boolean }`

Rules:
- Snapshot taken at version creation time
- Subsequent institutional changes do NOT modify existing versions
- Unconfigured: `instituteName: 'Istituto non configurato'`
- No hardcoded identities
- No presumed signatures

---

## Task 11: Export Policy

**Files:** `src/domain/documents/exportPolicy.ts`

- `validateExportFormat(format): ValidationResult` — only supported formats pass
- `SUPPORTED_EXPORT_FORMATS: ('html' | 'json' | 'pdf-browser')[]`
- `ExportFormatValidator` checks: extension, MIME, content, filename, encoding, accented chars, sanitization, completeness

| Format | Extension | MIME | Implementation |
|---|---|---|---|
| HTML | `.html` | `text/html` | From renderer |
| JSON | `.json` | `application/json` | Serialized archive/document |
| PDF (browser) | `.pdf` | `application/pdf` | `window.print()` |

NOT supported without real implementation:
- DOCX, ODT, ODF, binary PDF

---

## Task 12: Legacy Adapters (Document)

**Files:** `src/domain/documents/legacyAdapters.ts`

- `adaptLegacyUdaHtml(html: string): LegacyDocumentAdaptationResult` — imports old UDA HTML as `legacy` document
- `adaptLegacyExportEvent(event: DocumentExportEvent): LegacyDocumentAdaptationResult` — wraps old export as `legacy` document
- `adaptLegacyHtmlDocument(html: string, metadata?): LegacyDocumentAdaptationResult` — generic HTML → canonical

```typescript
type LegacyDocumentAdaptationResult =
  | { ok: true; document: DocumentEntity; version: DocumentVersion; warnings: TransferWarning[] }
  | { ok: false; error: DocumentError; warnings: TransferWarning[] };
```

Rules:
- Import as `legacy` or `draft` status
- Never promote to approved
- Never invent sources
- Never invent author
- Never invent original date
- Preserve HTML as legacy attachment (NOT as canonical content)
- Register missing fields as warnings

---

## Task 13: Selectors (A07 Read Models)

**Files:** `src/domain/documents/selectors.ts`

- `getDocument(id, archive): DocumentEntity | undefined`
- `getCurrentVersion(document, archive): DocumentVersion | undefined`
- `getDocumentList(archive, filters?): DocumentEntity[]`
- `getDocumentWithVersion(id, archive): { document: DocumentEntity; version: DocumentVersion } | undefined`
- `getDocumentsByType(type, archive): DocumentEntity[]`
- `getDocumentsByStatus(status, archive): DocumentEntity[]`
- `getDocumentHistory(documentId, archive): DocumentVersion[]`
- `getDocumentExportPayload(documentId, archive, format): ExportPayload | undefined`

---

## Task 14: Minimal A07 Integration Surface

**Files:** Modify `src/features/documents/` — minimal UI changes

- Add document list view (type, status, version, date)
- Add document detail (title, content preview, metadata)
- Add version history (ordered list, current version highlighted)
- Add "Create from A04" action (uses transfer contract)
- Add export action (HTML, JSON, browser PDF)
- Add duplicate action
- Add archive action

Minimal surface — no full restyling.

---

## Task 15: Security and Safety

Verify:
- No `document.write`
- No non-sanitized HTML
- No `<script>` in rendered output
- Proper escaping
- Safe URLs
- Controlled local images
- No arbitrary SVG execution
- No user content interpreted as markup
- No mandatory personal data

---

## Task 16: Tests

**Domain tests** (`src/__tests__/document-domain.test.ts`):
- Document creation, version creation, initial status
- All status transitions
- Duplication, archiving, restore
- Current version pointer
- Integrity checks
- References, metadata, sources, institute, academic year

**Repository tests** (`src/__tests__/document-repository.test.ts`):
- CRUD operations
- List + filters
- Multiple versions
- Conflicts, duplicates
- Orphan detection
- Rollback

**Transfer tests** (`src/__tests__/document-transfer.test.ts`):
- A04→A07 valid transfer
- Incomplete payload
- Missing sources
- Assisted content
- Absent configuration
- Legacy warnings
- Structural footprint
- Transfer event

**Rendering tests** (`src/__tests__/document-rendering.test.ts`):
- Text escaping
- Headings, paragraphs, lists, tables
- References
- Italian characters
- Preview/export consistency
- No script injection

**Export tests** (`src/__tests__/document-export.test.ts`):
- Correct HTML
- Correct MIME
- Correct extension
- Correct JSON
- No false DOCX/ODT
- Filename safety
- Neutral identity
- Preserved sources

**Legacy tests** (`src/__tests__/document-legacy.test.ts`):
- HTML import
- Legacy UDA
- Missing date, author, source
- No auto-promotion

**Integration tests** (`src/__tests__/document-integration.test.ts`):
- A07 reads canonical archive
- No hardcoded identity
- No legacy generators as authority
- CML-631/CML-630E/CML-633E compatibility

---

## Task 17: Documentation

**Files:**
- `docs/foundation/CML_633F_DOCUMENT_SYSTEM_IMPLEMENTATION.md`
- `docs/foundation/CML_633F_DOCUMENT_DOMAIN_SCHEMA.md`
- `docs/foundation/CML_633F_DOCUMENT_STATE_VERSION_POLICY.md`
- `docs/foundation/CML_633F_RENDERING_EXPORT_POLICY.md`
- `docs/foundation/CML_633F_LEGACY_DOCUMENT_MIGRATION.md`
- `docs/foundation/CML_633F_A04_A07_INTEGRATION.md`

---

## Task 18: Final Verification and Commit

- `npx tsc --noEmit`
- `npm test`
- `npm run build`
- `npm run build-storybook`
- `git diff --check`
- `git diff -- package.json package-lock.json`
- `git diff -- src/domain/transfer`
- `git diff -- src/domain/institution`
- `git diff -- src/domain/curriculum`

Expected:
- No dependency changes
- No Dexie schema changes
- No transfer domain mutations (except extended contract)
- No institution domain mutations
- No curriculum content mutations

**Commit:** `feat(CML-633F): add canonical document system`

---

## Scope Boundaries

### In Scope
- DocumentEntity, DocumentVersion, DocumentContent, sections
- Status machine with validated transitions
- Repository (CRUD, list, filter, integrity)
- Persistence via Zustand aggregate (Option A)
- Versioning (create, promote, restore, list)
- Rendering (safe HTML from sections)
- Export policy (HTML, JSON, browser PDF only)
- A04→A07 transfer producing canonical document draft
- Institutional snapshot frozen in version
- Legacy adapters for UDA HTML, old exports
- Minimal A07 integration surface
- Security (escape, no script, safe URLs)
- Tests and documentation

### Out of Scope
- DOCX, ODT, ODF, binary PDF generation
- Full A07 UI restyling
- Server-side rendering
- Authentication
- Document approval/adoption workflow
- Electronic signatures
- Collaborative editing
- Cross-session sync
- New IndexedDB tables
- Governance modifications

---

## Constraints

- No new npm dependencies
- No Dexie schema changes
- No store persistence changes outside document archive aggregate
- No modifications to src/domain/transfer (extend but don't mutate)
- No modifications to src/domain/institution (consume but don't mutate)
- No modifications to src/domain/curriculum (consume but don't mutate)
- No hardcoded identities
- No auto-approval
- No false format claims
- No dangerous HTML
- Governance unchanged