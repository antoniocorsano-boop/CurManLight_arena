# CML-632G — Findings: A07 Documents & Export

> Detailed evidence and analysis for each finding in the A07 audit.

---

## P-46: Document Generation Without Entity Model

**Severity:** blocking | **Area:** A07 | **Files:** useDocumentExportHandlers.ts, useCurriculumStore.ts

### Description

Documents are generated on-the-fly from store state and rendered into a preview pane (`generatedDocText` string in App.tsx). There is no `Document` entity type, no document store slice, no document archive. When the user navigates away from the export tab, generated documents disappear.

### Evidence

```typescript
// useDocumentExportHandlers.ts:778-779
setGeneratedDocTitle(title);
setGeneratedDocText(text);
```

The generated document is a plain string stored in App-level state. No persistence, no metadata, no retrieval mechanism.

### Impact

- Teachers cannot save, retrieve, or version documents
- Work is lost on navigation
- No document audit trail
- Cannot implement approval workflows

### Recommended Fix

Create a `Document` entity model with:
- `id`, `type`, `title`, `content`, `status`, `version`, `createdAt`, `updatedAt`
- Store slice in Zustand
- Document archive view

---

## P-47: Hardcoded Institutional Identity

**Severity:** blocking | **Area:** A07 | **Files:** useDocumentExportHandlers.ts, EsportazioniTab.tsx, useTemplateEngine.ts

### Description

School name, codice meccanografico, address, principal name, and ministerial headers are hard-coded as string literals in 8+ locations across the codebase. Changing any institutional detail requires editing multiple files.

### Evidence

| Location | Hardcoded Value |
|----------|----------------|
| `useDocumentExportHandlers.ts:535` | `"ISTITUTO COMPRENSIVO CALVARIO-COVOTTA \"DON LORENZO MILANI\""` |
| `useDocumentExportHandlers.ts:536` | `"Via Covotta, Ariano Irpino (AV) - Cod. Fiscale: 90013010649 - Cod. Mecc.: AVIC849003"` |
| `useDocumentExportHandlers.ts:707` | Same school name (programmazione) |
| `useDocumentExportHandlers.ts:786` | Same school name (relazione) |
| `useDocumentExportHandlers.ts:830` | Same school name (documento specifico) |
| `useDocumentExportHandlers.ts:578` | `"Prof.ssa Maria Letizia CML"` |
| `EsportazioniTab.tsx:401` | Same school name (template preview) |
| `useTemplateEngine.ts:29` | `"Il Dirigente Scolastico (Prof.ssa Maria Letizia CML)"` |

### Impact

- Application is single-school only
- Cannot be used by other institutes without code changes
- Institutional branding is not configurable

### Recommended Fix

Create an `InstituteProfile` configuration:
```typescript
interface InstituteProfile {
  name: string;
  codMeccanografico: string;
  codFiscale: string;
  address: string;
  principal: string;
  ministerialHeader: string;
  regionalOffice: string;
}
```

---

## P-48: HTML-in-DOC Export (Fake Format)

**Severity:** significant | **Area:** A07 | **Files:** useDocumentExportHandlers.ts

### Description

All Word and ODF exports are HTML documents with MS Office or ODF namespaces wrapped in files with .doc/.odt extensions. The .docx handler produces identical output to .doc — both are HTML blobs with `application/msword` MIME type.

### Evidence

```typescript
// useDocumentExportHandlers.ts:526-529 (confronto export)
let html = LT + "html xmlns:o='urn:schemas-microsoft-com:office:office' ...";
// ...
const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
link.download = `tavola_sinottica_confronto_modifiche.doc`;
```

### Impact

- Files may not render correctly in Word/LibreOffice
- Metadata (author, title, subject) is absent
- No actual DOCX/OXML structure
- Users may lose formatting on save

---

## P-49: No Document State or Versioning

**Severity:** blocking | **Area:** A07 | **Files:** documentContinuity.ts, useDocumentExportHandlers.ts

### Description

There is no concept of document lifecycle states (bozza/completato/approvato), no version tracking, and no document history beyond export logging. The `DocumentExportEvent` records exports but does not constitute document versioning.

### Evidence

- `documentContinuity.ts` defines `DocumentExportEvent` with `coherence` but no `version` or `status`
- No document state machine
- No version comparison or diff capability

### Impact

- No draft→final workflow
- No approval chain
- No way to compare document versions
- No audit trail of document changes

---

## P-50: Continuity System Exists But Is Unused

**Severity:** significant | **Area:** A07 | **Files:** useDocumentContinuity.ts, useDocumentExportHandlers.ts

### Description

`useDocumentContinuity` implements `recordExport()` and `computeCoherence()`, but none of the 13+ export functions in `useDocumentExportHandlers.ts` call `recordExport()`. The coherence system is displayed in `DocumentExportHistory` but does not influence export behavior.

### Evidence

```typescript
// useDocumentContinuity.ts:40-62 — recordExport exists
const recordExport = useCallback((args: RecordExportArgs) => { ... }, []);

// useDocumentExportHandlers.ts — 921 lines, zero calls to recordExport
```

### Impact

- Export history is incomplete
- Coherence warnings are never shown during export
- Users cannot detect stale exports

---

## P-51: Synthetic Content Formalization

**Severity:** significant | **Area:** A07 | **Files:** useDocumentExportHandlers.ts

### Description

Document generators produce hard-coded "synthetic" text that represents class descriptions, teaching methodologies, evaluation criteria, and student observations. This text appears in formal institutional documents without any disclaimer that it is auto-generated placeholder content.

### Evidence

```typescript
// useDocumentExportHandlers.ts:797
text += `La classe si presenta coesa e relazionalmente vivace. La partecipazione alle attivit\u00e0 d'Istituto \u00e8 costante e costruttiva.`;

// useDocumentExportHandlers.ts:802
text += `Metodologie: Cooperative Learning, didattica laboratoriale attiva, problem-solving e scoperta guidata.`;
```

### Impact

- Teachers may submit documents with fabricated content
- No distinction between real and synthetic data
- Ethical concerns for official documents

---

## P-52: Template Engine Is Not AI

**Severity:** significant | **Area:** A07 | **Files:** useTemplateEngine.ts, EsportazioniTab.tsx

### Description

The "Co-pilota dei Modelli d'Istituto" is a chat interface that pattern-matches user input against ~15 keywords using `query.includes()`. There is no AI, LLM, or NLP. An 800ms `setTimeout` simulates thinking time.

### Evidence

```typescript
// useTemplateEngine.ts:44-127
if (query.includes("margini stretti") || query.includes("1.5")) { ... }
else if (query.includes("times") || query.includes("serif")) { ... }
// ...
setTimeout(() => { ... }, 800); // fake latency
```

```typescript
// useTemplateEngine.ts:121
showToast("Modello aggiornato in tempo reale con l'IA!", true); // claims AI
```

### Impact

- Misleading product claims
- Limited to pre-programmed responses
- No natural language understanding

---

## P-53: Template State Not Persisted

**Severity:** significant | **Area:** A07 | **Files:** useTemplateEngine.ts

### Description

Template configurations (font, margins, logos, sections, signees) exist only in React `useState`. Navigating away loses all configuration.

### Evidence

```typescript
// useTemplateEngine.ts:14-30
const [templateJsonState, setTemplateJsonState] = useState({ ... });
```

No persistence to store or localStorage.

---

## P-54: Export Buttons Are Stubs

**Severity:** significant | **Area:** A07 | **Files:** EsportazioniTab.tsx

### Description

Two export buttons in the template tab only show toast notifications without performing any export.

### Evidence

```typescript
// EsportazioniTab.tsx:447-448
<UiButton onClick={() => showToast("Modello Word d'istituto (.docx) generato con successo!", true)}>
  Genera Modello Word (.docx)
</UiButton>
<UiButton onClick={() => showToast("Anteprima di stampa PDF del modello avviata!", true)}>
  Salva in PDF d'istituto
</UiButton>
```

---

## P-55: Preview-Export Divergence

**Severity:** significant | **Area:** A07 | **Files:** EsportazioniTab.tsx, useDocumentExportHandlers.ts

### Description

The template tab preview uses styled React components with Tailwind, while actual exports use raw HTML string concatenation with different structure, fonts, and styling.

### Impact

- What users see ≠ what they get
- No WYSIWYG guarantee

---

## P-56: Unsafe HTML Export

**Severity:** significant | **Area:** A07 | **Files:** useDocumentExportHandlers.ts

### Description

Export functions concatenate user-provided text directly into HTML strings without escaping.

### Evidence

```typescript
// useDocumentExportHandlers.ts:561
html += ... customTexts[p.id] ... // no escaping
```

### Impact

- XSS risk if exported HTML is opened in browser
- Broken HTML if user text contains `<`, `>`, `&`

---

## P-57: No Document-to-Document Transfer

**Severity:** blocking | **Area:** A07 | **Files:** useDocumentExportHandlers.ts

### Description

Document generators produce self-contained synthetic content. No data flows from one document type to another.

### Impact

- Programmazione Annuale ignores curriculum decisions
- Relazione ignores UDA data
- No coherent document set

---

## P-58: No Document Status Concept

**Severity:** blocking | **Area:** A07 | **Files:** documentContinuity.ts

### Description

No concept of document states (bozza, completato, approvato). All exports are immediate and final.

### Impact

- No review workflow
- No approval chain
- No draft mode

---

## P-59: No Decision Traceability in Exports

**Severity:** significant | **Area:** A07 | **Files:** useDocumentExportHandlers.ts

### Description

Curriculum revision decisions appear only in confronto and CML exports. Document generators produce hard-coded text that does not reflect actual decisions.

### Impact

- Documents do not reflect teacher's actual choices
- No audit trail from decisions to documents

---

## P-60: A04 Output Data Loss

**Severity:** minor | **Area:** A07 | **Files:** useDocumentExportHandlers.ts

### Description

UDA data lost in export: `rubrica`, `competenze`, `valutazione`, `id` are not included in any export.

### Impact

- Rich UDA data is not available in exported documents
- Programmazione Annuale only uses title, hours, realTask, traguardi.length
