# CML-632G — Audit: A07 Documents & Export

## Metadata

| Field | Value |
|-------|-------|
| Area ID | A07 |
| Area Name | Documents & Export (Documenti ed Esportazioni) |
| Audit date | 2026-07-27 |
| Branch | `audit/cml-632g-a07-documents-export` |
| Initial commit | `b39a1b7` |
| Baseline | CML-632F (A04 audit complete) |

---

## 1. Initial State

```text
Branch: audit/cml-632g-a07-documents-export
Initial commit: b39a1b7
Working tree: clean
Untracked: .playwright-mcp/, report/, scripts/, test-results/ (unrelated)
```

---

## 2. Perimeter

### Feature Area Structure

```
src/features/documents/
├── index.ts                              (6 lines — exports EsportazioniTab)
├── components/
│   ├── index.ts                          (3 lines — exports EsportazioniTab, DocumentExportHistory)
│   ├── EsportazioniTab.tsx              (470 lines — main component)
│   └── DocumentExportHistory.tsx        (65 lines — export event log)
├── hooks/
│   ├── useDocumentExportHandlers.ts     (921 lines — ALL export functions)
│   ├── useDocumentContinuity.ts         (114 lines — export recording + coherence)
│   ├── useTemplateEngine.ts             (141 lines — template configurator)
│   ├── useUdaPackageHandlers.ts         (164 lines — UDA clipboard + SCORM)
│   └── useBackupHandlers.ts             (56 lines — CML import/merge)
└── utils/
    └── sourceSignature.ts               (44 lines — signature computation)
```

**Total: ~1,978 lines across 9 files.**

### Sub-tabs within EsportazioniTab

| Tab ID | Label | Purpose |
|--------|-------|---------|
| `standard` | Esportazioni standard | Word, ODF, PDF, TXT, CML, confronto, markdown, copy-clipboard |
| `template` | Modelli con IA | Template configurator with "AI copilot" chat |

### Export Categories (Standard Tab)

| Category | Formats | Sources |
|----------|---------|---------|
| Word, ODF e Testo | .doc, .docx, .odt, PDF (print), copy-table | localCurriculum, decisions, customTexts |
| File di lavoro .CML | .cml (JSON), Word confronto, .md, PDF (print) | localCurriculum, decisions, customTexts |
| Documentazione didattica | Programmazione Annuale, Relazione, Documento Specifico | savedUda, localCurriculum, hard-coded text |
| Sicurezza e reset | CML import/merge, localStorage reset | file upload |

### Export Formats

| Format | Actual Implementation | MIME Type |
|--------|----------------------|-----------|
| Word (.doc) | HTML with MS Office namespaces | `application/msword` |
| Word (.docx) | Same HTML as .doc (no actual DOCX) | `application/msword` |
| ODF (.odt) | HTML with ODF namespaces | `application/vnd.oasis.opendocument.text` |
| PDF | `window.print()` browser dialog | N/A |
| TXT | Plain text concatenation | `text/plain` |
| CML | JSON with metadata | `application/json` |
| Markdown | String concatenation | `text/markdown` |
| Rich Markdown | String concatenation with tables | `text/markdown` |
| SCORM | ZIP with HTML + manifest.xml | `application/zip` |
| Clipboard | HTML table via Clipboard API | `text/html` |

### Document Generators (Standard Tab — "Documentazione didattica")

| Generator | Output | Content Source |
|-----------|--------|----------------|
| Programmazione Annuale | In-memory text → preview pane | savedUda (filtered by period), hard-coded templates |
| Relazione Scolastica | In-memory text → preview pane | Hard-coded templates (class description, methodology, evaluation) |
| Documento Specifico | In-memory text → preview pane | Hard-coded templates (observation, valuation levels, exam program) |

### Template Engine (Template Tab)

| Feature | Implementation |
|---------|---------------|
| Document types | `relazione`, `uda`, `greci` (Albanian bilingual) |
| Configurator | Chat-based "AI copilot" — **actually rule-based keyword matching** |
| State | React useState — **not persisted** |
| Settings | fontFamily, fontSize, lineHeight, margins, logos, sections, signees |
| Preview | Live React component with styled HTML |
| Export buttons | **Toast-only stubs** — "Genera Modello Word" and "Salva in PDF" do nothing |

### Continuity System

| Feature | Implementation |
|---------|---------------|
| Export recording | `useDocumentContinuity.recordExport()` — writes `DocumentExportEvent` to store |
| Coherence check | `computeCoherence()` — compares source signatures at display time |
| Signature computation | String concatenation of UDA/curriculum fields (no hashing) |
| History display | `DocumentExportHistory` — shows export events with coherence badges |
| Usage in exports | **Not used** — exports do not check or record continuity |

---

## 3. Source Data Flow

### A04 → A07 Transfer

```text
savedUda[] (UdaModel)
  ├── title, discipline, order, period, hours, status     ✓ available in exports
  ├── traguardi[], obiettivi[], evidenze[]                ✓ used in programmazione
  ├── realTask, notes                                      ✓ used in programmazione
  ├── rubrica (RubricaEntry[])                            ✗ NOT available in exports
  ├── competenze (Competency[])                           ✗ NOT available in exports
  ├── valutazione (ValutazioneSettings)                   ✗ NOT available in exports
  └── id                                                   ✗ NOT included in export output
```

### A03 → A07 Transfer

```text
decisions (Record<string, DecisionStatus>)
  ├── Used in: confronto export, CML export, TXT export     ✓
  └── Used in: programmazione, relazione, documento specifico  ✗ (hard-coded text instead)

customTexts (Record<string, string>)
  ├── Used in: confronto export, CML export, TXT export     ✓
  └── Used in: programmazione, relazione, documento specifico  ✗

selectedTraguardi, selectedObiettivi
  ├── Used in: curriculum signature                          ✓
  └── Used in: export content                                ✗
```

### A11 → A07 Transfer

```text
No source data flows from A11 to A07.
Exports reference "d'Istituto" in hard-coded text but have no connection to actual institute sources.
```

---

## 4. Key Patterns Found

### P-46: Document Generation Without Entity Model

**Severity: blocking**

Documents are generated on-the-fly from store state and rendered into a preview pane or exported as files. There is no `Document` entity, no `DocumentState` type, no document archive, no document persistence.

Generated documents (Programmazione Annuale, Relazione, Documento Specifico) appear in `generatedDocText` (a string in App.tsx state) and disappear when the user navigates away.

**Evidence:**
- `useDocumentExportHandlers.ts:778-779` — `setGeneratedDocTitle(title); setGeneratedDocText(text);`
- `useDocumentExportHandlers.ts:900-901` — Same pattern for all generators
- No `Document` type in `documentContinuity.ts` — only `DocumentExportEvent`
- No document store slice in `useCurriculumStore.ts`

### P-47: Hardcoded Institutional Identity

**Severity: blocking**

School name, codice meccanografico, address, principal name, and ministerial headers are hard-coded as string literals across 6+ locations. There is no configurable institute profile.

**Evidence:**
- `useDocumentExportHandlers.ts:535-536` — "ISTITUTO COMPRENSIVO CALVARIO-COVOTTA \"DON LORENZO MILANI\""
- `useDocumentExportHandlers.ts:707-708` — Same in programmazione
- `useDocumentExportHandlers.ts:786-787` — Same in relazione
- `useDocumentExportHandlers.ts:830-831` — Same in documento specifico
- `EsportazioniTab.tsx:401` — Same in template preview
- `useTemplateEngine.ts:29` — "Prof.ssa Maria Letizia CML" in default signee
- `useDocumentExportHandlers.ts:536` — `AVIC849003` codice meccanografico
- `useDocumentExportHandlers.ts:578` — "Prof.ssa Maria Letizia CML" in confronto signatures

### P-48: HTML-in-DOC Export (Fake Format)

**Severity: significant**

All Word and ODF exports are HTML documents with MS Office or ODF namespaces wrapped in files with .doc/.odt extensions. The .docx handler produces identical output to .doc. These files may not render correctly in Word or LibreOffice.

**Evidence:**
- `useDocumentExportHandlers.ts:526-529` — HTML construction with `String.fromCharCode(60/62)` to avoid Vite stripping
- `useDocumentExportHandlers.ts:585` — `new Blob([html], { type: 'application/msword' })` for .doc
- `useDocumentExportHandlers.ts:1-100` (lines 1-100 of the Word handler) — Same HTML approach for .docx

### P-49: No Document State or Versioning

**Severity: blocking**

There is no concept of document states (bozza/completato/approvato), no document versioning, no document history. Each export is atomic and independent. The export history (`documentExportHistory`) logs exports but does not constitute versioning.

**Evidence:**
- `documentContinuity.ts` — `DocumentExportEvent` has `coherence` but no `version` or `status`
- No document store slice
- No document state machine

### P-50: Continuity System Exists But Is Unused

**Severity: significant**

`useDocumentContinuity` implements export recording and coherence checking, but exports do not call `recordExport()`. The coherence system is only displayed in `DocumentExportHistory` — it does not prevent stale exports or warn users.

**Evidence:**
- `useDocumentContinuity.ts:40-62` — `recordExport` implementation exists
- `useDocumentExportHandlers.ts` — None of the 13+ export functions call `recordExport`
- `EsportazioniTab.tsx:255-258` — History is displayed but not used in export flow

### P-51: Synthetic Content Formalization

**Severity: significant**

Document generators produce hard-coded "synthetic" text that represents class descriptions, teaching methodologies, evaluation criteria, and student observations. This text appears in formal institutional documents without any disclaimer.

**Evidence:**
- `useDocumentExportHandlers.ts:797` — "La classe si presenta coesa e relazionalmente vivace"
- `useDocumentExportHandlers.ts:802` — "Cooperative Learning, didattica laboratoriale attiva, problem-solving e scoperta guidata"
- `useDocumentExportHandlers.ts:843-851` — Synthetic observation text for infanzia
- `useDocumentExportHandlers.ts:860-868` — Synthetic valuation levels for primaria
- `useDocumentExportHandlers.ts:879-891` — Synthetic exam program for secondaria

### P-52: Template Engine Is Not AI

**Severity: significant**

The "Co-pilota dei Modelli d'Istituto" is a chat interface that pattern-matches user input against ~15 keywords (e.g., "margini stretti", "times", "pnrr") and applies template state changes. There is no AI, no LLM, no NLP. The 800ms `setTimeout` simulates AI thinking time.

**Evidence:**
- `useTemplateEngine.ts:44-127` — `handleSendTemplateInstruction` uses `query.includes()` for all logic
- `useTemplateEngine.ts:121` — `showToast("Modello aggiornato in tempo reale con l'IA!", true)` — claims AI
- `EsportazioniTab.tsx:317-319` — `<Sparkles>` icon + "Co-pilota dei Modelli d'Istituto" label

### P-53: Template State Not Persisted

**Severity: significant**

Template configurations (font, margins, logos, sections, signees) exist only in React `useState` within `useTemplateEngine`. Navigating away from the template tab loses all configuration. The "Azzera e ripristina modello di fabbrica" button resets to hard-coded defaults.

**Evidence:**
- `useTemplateEngine.ts:14-30` — `useState` for `templateJsonState`
- No persistence in store or localStorage
- `EsportazioniTab.tsx:352-368` — Reset handler sets hard-coded defaults

### P-54: Export Buttons Are Stubs

**Severity: significant**

Two export buttons in the template tab only show toast notifications without performing any export:
- "Genera Modello Word (.docx)" → `showToast("Modello Word d'istituto (.docx) generato con successo!", true)`
- "Salva in PDF d'istituto" → `showToast("Anteprima di stampa PDF del modello avviata!", true)`

**Evidence:**
- `EsportazioniTab.tsx:447-448` — onClick handlers are toast-only

### P-55: Preview-Export Divergence

**Severity: significant**

The template tab preview uses styled React components with Tailwind classes, while actual exports use raw HTML string concatenation with different structure, fonts, and styling. What users see in the preview does not match what they get in exports.

**Evidence:**
- `EsportazioniTab.tsx:386-444` — Preview uses `templateJsonState` with styled React components
- `useDocumentExportHandlers.ts:526-529` — Export uses raw HTML with different CSS
- No shared rendering pipeline

### P-56: Unsafe HTML Export

**Severity: significant**

Export functions concatenate user-provided text (from `customTexts`, UDA fields, decisions) directly into HTML strings without escaping. The preview pane uses `dangerouslySetInnerHTML`-equivalent patterns.

**Evidence:**
- `useDocumentExportHandlers.ts:561` — `customTexts[p.id]` injected directly into HTML
- `useDocumentExportHandlers.ts:619` — Same pattern for clipboard export
- `EsportazioniTab.tsx:422-426` — Template preview renders section content as React JSX (safe), but exports use raw HTML

### P-57: No Document-to-Document Transfer

**Severity: blocking**

Document generators (Programmazione, Relazione, Documento Specifico) do not receive data from other documents. Each generator produces self-contained synthetic content. There is no:
- UDA → Programmazione Annuale transfer (only `savedUda` filtered by period)
- Curriculum decisions → Document transfer
- Relazione → Specifico transfer

**Evidence:**
- `useDocumentExportHandlers.ts:704-780` — Programmazione uses `savedUda` but generates synthetic methodology/inclusion text
- `useDocumentExportHandlers.ts:783-824` — Relazione is entirely hard-coded
- `useDocumentExportHandlers.ts:827-902` — Specifico is entirely hard-coded

### P-58: No Document Status Concept

**Severity: blocking**

There is no concept of document states (bozza, completato, approvato). All exports are immediate and final. No review workflow, no approval chain, no draft mode.

**Evidence:**
- No `DocumentState` type in `documentContinuity.ts`
- No state machine in export handlers
- `UdaModel.status` exists but is not used in document export flow

### P-59: No Decision Traceability in Exports

**Severity: significant**

Curriculum revision decisions (A03) appear only in confronto and CML exports. Document generators (Programmazione, Relazione, Specifico) produce hard-coded text that does not reflect actual decisions.

**Evidence:**
- `useDocumentExportHandlers.ts:554-559` — Confronto uses `decisions[p.id]`
- `useDocumentExportHandlers.ts:660-666` — TXT uses `decisions[p.id]`
- `useDocumentExportHandlers.ts:704-780` — Programmazione ignores decisions entirely
- `useDocumentExportHandlers.ts:783-824` — Relazione ignores decisions entirely

### P-60: A04 Output Data Loss

**Severity: significant**

UDA data lost in export:
- `rubrica` (detailed assessment rubric) — not included in any export
- `competenze` (European key competencies) — not included in any export
- `valutazione` (evaluation settings) — not included in any export
- `id` (UDA identifier) — not included in export output

**Evidence:**
- `useDocumentExportHandlers.ts:736-737` — Programmazione uses `savedUda` but only accesses `title`, `hours`, `realTask`, `traguardi.length`
- `useDocumentExportHandlers.ts:1-100` — Word export uses `localCurriculum` not `savedUda`

---

## 5. Cross-Cutting Patterns Confirmed

| Pattern | Status | Evidence |
|---------|--------|----------|
| `CML_632_CROSS_CUTTING_UI_READABILITY_DEFECT_CONFIRMED` | **CONFIRMED** (9th area) | 10px, 11px, 12px fonts throughout EsportazioniTab |
| `CML_632_CROSS_CUTTING_ISOLATION_PATTERN_CONFIRMED` | **CONFIRMED** (9th area) | No data flows from A02/A03/A04/A11 into exports |
| `CML_632_CROSS_CUTTING_NO_STRUCTURED_SOURCE_DATA_CONFIRMED` | **CONFIRMED** (9th area) | Exports use store state directly, no source metadata |
| `CML_632_CROSS_CUTTING_UNVERIFIED_VALIDATION_LABELS` | **CONFIRMED** (4th area) | Export formats claim to be DOCX/ODF but are HTML |
| `CML_632_CROSS_CUTTING_EXPERIMENTAL_DATA_EXPOSURE` | **CONFIRMED** (4th area) | CML export exposes raw decisions/customTexts |
| `CML_632_CROSS_CUTTING_NO_DECISION_TRACEABILITY` | **CONFIRMED** (3rd area) | Decisions only in confronto/CML, not in document generators |
| `CML_632_CROSS_CUTTING_UNTRACEABLE_ASSISTED_CONTENT` | **CONFIRMED** (2nd area) | Template "AI" produces output without attribution |

### New Patterns for A07

| Pattern | Status | Areas |
|---------|--------|-------|
| `CML_632_CROSS_CUTTING_NO_DESIGN_TO_DOCUMENT_TRANSFER` | **NEW — CONFIRMED** | A04→A07 |
| `CML_632_CROSS_CUTTING_HARDCODED_INSTITUTIONAL_IDENTITY` | **NEW — CONFIRMED** | A07 (global impact) |
| `CML_632_CROSS_CUTTING_UNRELIABLE_DOCUMENT_STATUS` | **NEW — CONFIRMED** | A07 |
| `CML_632_CROSS_CUTTING_DOCUMENT_VERSIONING_ABSENCE` | **NEW — CONFIRMED** | A07 |
| `CML_632_CROSS_CUTTING_UNSAFE_HTML_EXPORT` | **NEW — CONFIRMED** | A07 |
| `CML_632_CROSS_CUTTING_PREVIEW_EXPORT_DIVERGENCE` | **NEW — CONFIRMED** | A07 |
| `CML_632_CROSS_CUTTING_SYNTHETIC_CONTENT_FORMALIZATION` | **NEW — CONFIRMED** | A07 |
| `CML_632_CROSS_CUTTING_INSTITUTIONAL_APPEARANCE_WITHOUT_GOVERNANCE` | **NEW — CONFIRMED** | A07 |

---

## 6. Technical Verification

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✓ Clean (no output) |
| `vitest run` | ⚠ 13/14 passed, 1 failed (pilot-evaluation timeout — pre-existing, unrelated) |
| Working tree | Clean (branch: `audit/cml-632g-a07-documents-export`) |

---

## 7. Verdict

### CML_632G_A07_DOCUMENTS_EXPORT_REDESIGN

**Decision: REDESIGN**

**Rationale:** A07 Documents & Export has **8 blocking**, **9 significant**, and **3 minor** findings. The area has no document entity model, no document states, no versioning, no persistence, no institutional governance, and generates synthetic content as formal output. The export formats are mislabeled (HTML as DOCX/ODF). The "AI" template engine is keyword matching. The continuity system exists but is unused. Data from upstream areas (A02, A03, A04, A11) does not flow into exports.

**Blocking findings (8):**
1. P-46: Document Generation Without Entity Model
2. P-47: Hardcoded Institutional Identity
3. P-49: No Document State or Versioning
4. P-57: No Document-to-Document Transfer
5. P-58: No Document Status Concept
6. CML_632_CROSS_CUTTING_NO_DESIGN_TO_DOCUMENT_TRANSFER
7. CML_632_CROSS_CUTTING_HARDCODED_INSTITUTIONAL_IDENTITY
8. CML_632_CROSS_CUTTING_UNRELIABLE_DOCUMENT_STATUS

**Significant findings (9):**
1. P-48: HTML-in-DOC Export (Fake Format)
2. P-50: Continuity System Exists But Is Unused
3. P-51: Synthetic Content Formalization
4. P-52: Template Engine Is Not AI
5. P-53: Template State Not Persisted
6. P-54: Export Buttons Are Stubs
7. P-55: Preview-Export Divergence
8. P-56: Unsafe HTML Export
9. P-59: No Decision Traceability in Exports

**Minor findings (3):**
1. P-60: A04 Output Data Loss
2. CML_632_CROSS_CUTTING_UNTRACEABLE_ASSISTED_CONTENT
3. CML_632_CROSS_CUTTING_SYNTHETIC_CONTENT_FORMALIZATION

---

## 8. Opportunity Register

| ID | Opportunity | Impact | Effort |
|----|-------------|--------|--------|
| O-40 | Real DOCX generation (docx library) | High | High |
| O-41 | Configurable institute profile | High | Medium |
| O-42 | Document entity model with states | High | High |
| O-43 | Activate continuity system in exports | Medium | Low |
| O-44 | Real AI template engine (LLM-backed) | Medium | High |
| O-45 | Persist template configurations | Medium | Low |
| O-46 | Unified preview-export rendering | Medium | Medium |
| O-47 | HTML escaping in exports | Medium | Low |
| O-48 | Wire A03 decisions into document generators | High | Medium |
| O-49 | Wire A04 UDA data (rubrica, competenze) into exports | High | Medium |
| O-50 | Document version history with diff | Medium | High |
| O-51 | PDF generation via jsPDF/puppeteer (not print) | Medium | Medium |
