# CML-636B Verification Report

## Identification

| Item | Value |
|------|-------|
| Phase | CML-636B — Canonical Document Preview & Print Export |
| Branch | `feat/cml-636b-canonical-document-preview-export` |
| Baseline Commit | `9d27c57a5097e1d0344488602f58bce8df8e42f4` |
| Functional Commit | `33eb4ec7712b79c89ccc837e1f809821f94f341b` (`feat(CML-636B): add canonical document preview and print export`) |
| Corrective Commit | `fix(CML-636B): stabilize preview validation and integration tests` (post-`33eb4ec`) |
| Initial Worktree State | 5 corrected files present but uncommitted (post-`33eb4ec` fixes) |
| Expected Verdict | `CML_636B_CANONICAL_DOCUMENT_PREVIEW_EXPORT_COMPLETE_LOCAL` |

---

## Implemented Scope

- Explicit version selection via dropdown (locked to document's versions)
- HTML preview generated from persisted `DocumentVersion` via single `renderDocument()`
- Print/PDF via browser-controlled window using same preview HTML
- Pre-print validation (`validateExportability()`) with blocking/warning feedback
- Preview invalidation on version/content change (`isPreviewStale()` / `PREVIEW_STALE`)
- Archived documents: readable but print blocked (`DOCUMENT_ARCHIVED`)
- Accessibility: `aria-live` validation region, `role="alert"` for blocking errors, `aria-label` on version selector, `aria-hidden` decorative icons
- Italian UI terminology ("Versione", "Anteprima", "Dati mancanti", "Stampa o salva in PDF")

---

## Files

### Modified Files (4)
- `src/domain/documents/index.ts` (+37) — barrel exports for new domain functions
- `src/domain/documents/rendering.ts` (+30) — `renderDocument()` enhancements
- `src/features/documents/components/CanonicalDocumentTab.tsx` (+474/-111) — main UI component
- `src/features/documents/index.ts` (+2) — feature exports

### New Files (8)
- `src/__tests__/cml-636b-exportability-validator.test.ts` (27 tests)
- `src/__tests__/cml-636b-preview-rendering.test.ts` (43 tests)
- `src/__tests__/cml-636b-canonical-preview-ui.test.tsx` (16 tests)
- `src/__tests__/cml-636b-preview-persistence-integration.test.ts` (12 tests)
- `src/domain/documents/exportValidator.ts` — exportability validation logic
- `src/domain/documents/preview.ts` — preview key computation, staleness detection
- `src/features/documents/services/canonicalDocumentPrint.ts` — print service
- `docs/03_execution/CML-636B_VERIFICATION.md` — this document

### Excluded from Commit (session artifacts)
- `session/20260801_212232/` — working session logs (not tracked)

---

## Architecture

### Single Canonical Renderer
- **`renderDocument(document, version, options?)`** in `src/domain/documents/rendering.ts:139` produces complete HTML including:
  - Document title, institute metadata header
  - Rendered content sections (`renderDocumentContent()`)
  - Version footer (number, date, author)
  - Provenance list (UDA references)
- Escapes all user content via `escapeHtml()` / `escapeAttr()`

### Validation Pipeline
1. `validateExportability()` in `exportValidator.ts:115` checks (in order):
   - Document exists in archive
   - Version exists and belongs to document
   - Version is persisted
   - Document not archived
   - Template resolvable (`isTemplateResolvable()` — rejects "Istituto non configurato")
   - Title present
   - Institute name, academic year, discipline, school level/class present
   - Author/role present
   - Date present
   - Content renderable (`isContentRenderable()` — extracts `<article>` text)
   - Preview state provided (`PREVIEW_REQUIRED`)
   - Preview not stale (`PREVIEW_STALE`)

### Preview Key & Staleness
- `computePreviewKey(doc, version)` in `preview.ts` returns a deterministic `PreviewIdentity` built from: document ID, version ID, template ID (`computeTemplateId`), content fingerprint (`computeContentFingerprint`) and metadata fingerprint (`computeMetadataFingerprint`)
- `serializePreviewKey()` serializes the identity into a deterministic string
- `isPreviewStale(state, document, version)` detects drift after version switch or content edit (returns true when state is null or the stored key no longer matches)

### Print Service
- `printCanonicalDocument(html, options?)` in `canonicalDocumentPrint.ts`:
  - Receives the stored `previewState.html` (exact same HTML from UI preview) and an optional title
  - Opens controlled `window.open('', '_blank')`
  - Writes the provided HTML into the print window and calls `print()`
  - Does NOT call `renderDocument()`
  - Does NOT access store, archive, or document/version state
- Re-validation at action time happens in `CanonicalDocumentTab.handlePrint()`, which calls `validateExportability()` again immediately before invoking `printCanonicalDocument(previewState.html, ...)`; archived documents are additionally blocked with `DOCUMENT_ARCHIVED`

### Data Flow
```
User selects version →
  getDocumentHistory() →
  renderDocument() →
  previewState { key, html, renderedAt, versionNumber } →
  UI shows iframe with previewState.html →
  User clicks Print →
  validateExportability() →
  printCanonicalDocument(previewState.html)
```

---

## Perimeter Decisions

| Decision | Rationale |
|----------|-----------|
| Removed "Scarica HTML" button | Not an approved format (HTML preview + browser print/PDF only) |
| Preserved "Archivio JSON" button | Legacy function, independent of CML-636B preview/validation/renderer |
| No DOCX / ODF / JSON single-doc export | Explicitly excluded per design |
| No new stores / archives / persistence | Reuses CML-638B `useCurriculumStore` / `documentArchive` |
| No parallel renderer | `renderDocument()` is sole HTML producer |

---

## Test Results

### CML-636B Targeted Suites (4 files, 98 tests)

| File | Tests | Passed | Failed | Skipped |
|------|-------|--------|--------|---------|
| `cml-636b-exportability-validator.test.ts` | 27 | 27 | 0 | 0 |
| `cml-636b-preview-rendering.test.ts` | 43 | 43 | 0 | 0 |
| `cml-636b-canonical-preview-ui.test.tsx` | 16 | 16 | 0 | 0 |
| `cml-636b-preview-persistence-integration.test.ts` | 12 | 12 | 0 | 0 |
| **Total** | **98** | **98** | **0** | **0** |

### CML-638B Regression Suites (3 files, 13 tests)

| File | Tests | Passed | Failed |
|------|-------|--------|--------|
| `cml-638b-persistence.test.ts` | 6 | 6 | 0 |
| `cml-638b-persistence.browser.test.ts` | 4 | 4 | 0 |
| `cml-638b-a07-canonical-ui.test.tsx` | 3 | 3 | 0 |
| **Total** | **13** | **13** | **0** |

All regression paths intact: UDA creation → canonical document → persistence → rehydration → A07 auto-open → dedup.

### Comparison: Baseline vs HEAD

| Commit | Test File | Result |
|--------|-----------|--------|
| `9d27c57` (baseline) | `cml-638b-a07-canonical-ui.test.tsx` | 3/3 ✓ (passes on baseline) |
| HEAD (CML-636B) | `cml-638b-a07-canonical-ui.test.tsx` | 3/3 ✓ (passes after CML-636B) |

The CML-638B empty-state test initially failed on HEAD due to **duplicate DOM text** ("Non sono ancora presenti documenti creati dalle progettazioni") between `EsportazioniTab` and the new `CanonicalDocumentTab`. Fixed by changing the `CanonicalDocumentTab` empty-state message to "Nessun documento canonico ancora presente" to avoid collision.

### Full Test Suite
- `npm test` (`vitest run`): **1955 tests across 103 test files — all passing** (0 failed, 0 skipped).

---

## Gates

| Gate | Result |
|------|--------|
| TypeScript (`npx tsc --noEmit`) | ✓ Clean |
| Production Build (`npm run build`) | ✓ Successful |
| Storybook Build (`npm run build-storybook`) | ✓ Successful |
| Git Diff Check (`git diff --check`) | ✓ No whitespace issues |

---

## Residual Limits (Explicitly Out of Scope)

- DOCX generation
- ODF generation
- Library-based PDF generation (no `pdf-lib`, `puppeteer`, etc.)
- Digital signature / protocol workflow
- Backend integration / institutional repository sync
- Sharing / collaboration features
- Multi-format export pipeline
- Synthetic/test data in production paths

---

## Manual Verification (Browser)

Performed against local dev server (`npm run dev`):

1. ✓ A07 opens canonical document list
2. ✓ Persisted document opens with correct version
3. ✓ Version dropdown shows only document's versions
4. ✓ Preview generates and displays in iframe
5. ✓ Missing data shows blocking errors ("Dati mancanti")
6. ✓ Print button disabled before preview
7. ✓ Print enabled after valid preview
8. ✓ Version switch marks preview stale
9. ✓ Archived document readable, print blocked
10. ✓ No "Scarica HTML" button present
11. ✓ "Archivio JSON" button works independently
12. ✓ Responsive layout on reduced width

---

## Final Commit

**Command:**
`git commit -m "feat(CML-636B): add canonical document preview and print export"`

**Files Committed (12):**
1. `src/domain/documents/index.ts`
2. `src/domain/documents/rendering.ts`
3. `src/domain/documents/exportValidator.ts`
4. `src/domain/documents/preview.ts`
5. `src/features/documents/components/CanonicalDocumentTab.tsx`
6. `src/features/documents/index.ts`
7. `src/features/documents/services/canonicalDocumentPrint.ts`
8. `src/__tests__/cml-636b-exportability-validator.test.ts`
9. `src/__tests__/cml-636b-preview-rendering.test.ts`
10. `src/__tests__/cml-636b-canonical-preview-ui.test.tsx`
11. `src/__tests__/cml-636b-preview-persistence-integration.test.ts`
12. `docs/03_execution/CML-636B_VERIFICATION.md`

**Files Left Uncommitted:**
- `session/20260801_212232/` (session artifacts — excluded by design)

---

## Corrective Commit

During post-commit diagnosis (handoff `CML-636B Diagnostic Recovery and Final Closure`), the claim that
`computePreviewKey`, `serializePreviewKey`, `validateExportability`, `resolveInstitutionalMetadata` and
`isContentRenderable` were missing was verified to be **false**: all five functions exist in
`src/domain/documents/preview.ts` / `src/domain/documents/exportValidator.ts`, are tracked by git, and are
re-exported from `src/domain/documents/index.ts`.

The real cause of the earlier failures was a set of uncommitted corrections still present in the worktree after `33eb4ec`:

1. **Wrong archive in fixtures** — `resetStore(archive)` passed the empty initial archive instead of
   `resetStore(result.archive)` (the populated archive produced by `makeFullDocument`).
2. **Empty-title construction** — `createDocumentInArchive` rejects empty titles; tests now create the document
   with a valid title and then override `doc.title` to `''` in the archive.
3. **Unconfigured institutional context** — the persistence test used `createEmptyInstitutionalArchive()`; it now
   builds a real configured archive via `createTestInstitutionalArchive()` (institute, academic year, site, context).
4. **Premature `setPreviewState(null)` in `handleVersionChange`** — removed; version change now leaves the preview
   stale through key mismatch (`isPreviewStale` → `PREVIEW_STALE`) instead of discarding it.
5. **Duplicate empty-state DOM text** with `EsportazioniTab` — `CanonicalDocumentTab` empty state changed to
   "Nessun documento canonico ancora presente."
6. **Unused import** `createMetadata` removed from `cml-636b-exportability-validator.test.ts`.

No new module, parallel renderer, stub, or barrel change was introduced.

### Corrective Commit Contents

**Command:**
`git commit -m "fix(CML-636B): stabilize preview validation and integration tests"`

**Files Committed (5):**
1. `src/features/documents/components/CanonicalDocumentTab.tsx`
2. `src/__tests__/cml-636b-canonical-preview-ui.test.tsx`
3. `src/__tests__/cml-636b-exportability-validator.test.ts`
4. `src/__tests__/cml-636b-preview-persistence-integration.test.ts`
5. `docs/03_execution/CML-636B_VERIFICATION.md`

---

## Test Isolation Root Cause Analysis

The initial test failures were caused by **fixture incompleteness**, not by the IndexedDB/storage layer:

1. **`createDocumentInArchive` with empty title**: `createDocumentInArchive` validates and rejects empty titles during creation. Fix: create document with valid title, then override `doc.title` to `''` in the archive.

2. **Empty `institutionalArchive` in persistence test**: The test "renders preview from persisted DocumentVersion" used `createEmptyInstitutionalArchive()` which has no institutes. `getA07InstitutionalDocumentRead()` returns `{ configured: false, instituteName: 'Istituto non configurato' }`, causing `validateExportability` to return blocking errors (`TEMPLATE_MISSING`, `INSTITUTE_NAME_MISSING`, `SCHOOL_YEAR_MISSING`, `AUTHOR_OR_ROLE_MISSING`). Fix: added `createTestInstitutionalArchive()` helper using proper domain constructors (`createInstituteDraft`, `confirmInstitute`, `setActiveInstitute`, `createAcademicYear` with `YYYY/YYYY` format, `setActiveAcademicYear`, `createInstituteSite`, `setInstitutionalContext`).

3. **`resetStore(archive)` using empty archive**: Tests passed `resetStore(archive)` (the empty initial archive) instead of `resetStore(result.archive)` (the populated archive from `makeFullDocument`). Fix: use `result.archive` in all test setup.

4. **`setPreviewState(null)` in `handleVersionChange`**: The component cleared preview state on version change, preventing `isPreviewStale` from detecting drift. Fix: removed the `setPreviewState(null)` call.

5. **Duplicate DOM text collision**: The new `CanonicalDocumentTab`'s empty-state message ("Non sono ancora presenti documenti creati dalle progettazioni") conflicted with `EsportazioniTab`'s same message, causing `getByText` to throw "Found multiple elements" in CML-638B tests. Fix: changed `CanonicalDocumentTab` empty-state to "Nessun documento canonico ancora presente."

---

## Verdict

**`CML_636B_CANONICAL_DOCUMENT_PREVIEW_EXPORT_COMPLETE_LOCAL`**

All implementation gates green: CML-636B 98/98 (validator 27, rendering 43, UI 16, persistence 12), CML-638B regressions 13/13 across 3 files (6+4+3), full suite 1955/1955 across 103 test files, TypeScript clean, production build and Storybook build successful, `git diff --check` clean. CML-638B baseline verified: `cml-638b-a07-canonical-ui.test.tsx` 3/3 on both baseline `9d27c57` and HEAD. No regressions, no new store/archive/persistence/renderer, no parallel module. Ready for local commit only — no push, merge, rebase, or PR.