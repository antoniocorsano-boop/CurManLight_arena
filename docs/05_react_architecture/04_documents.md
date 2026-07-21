# 04 — Documents Domain: Config, Export, Comparison, Doc Generation

> Document configuration, template selection, export in multiple formats, and comparison view.

---

## 1. Components

### 1.1 `DocumentsTab.tsx`

```typescript
// State: reads useNavigationStore (showDocsConfig)
// State: local — activeDocumentTab ('config' | 'export' | 'comparison')
// Renders: tab bar, config panel, export options, comparison view
// Behavior: orchestrates document workflow
```

**JSX Structure**:
```
<div>
  <Tabs tabs={documentTabs} activeTab={activeDocumentTab} onChange={setActiveDocumentTab} />
  {activeDocumentTab === 'config' && <DocumentConfig />}
  {activeDocumentTab === 'export' && <ExportPanel />}
  {activeDocumentTab === 'comparison' && <ComparisonView />}
</div>
```

### 1.2 `DocumentConfig.tsx`

```typescript
// State: local — documentType, documentFormat, selectedTemplate, includeHeader, includeFooter, customHeader, customFooter, fontSize, marginStyle
// Renders: form with all document configuration options
// Behavior: updates config, shows preview
```

**Config Fields**:
| Field | Type | Options |
|-------|------|---------|
| `documentType` | select | programmazione, relazione, specifico, confronto, audit |
| `documentFormat` | select | pdf, word, odt, txt, cml |
| `selectedTemplate` | select | default, ministeriale, moderno |
| `includeHeader` | toggle | true/false |
| `includeFooter` | toggle | true/false |
| `customHeader` | text | free text |
| `customFooter` | text | free text |
| `fontSize` | select | 10, 11, 12, 14 |
| `marginStyle` | select | narrow, normal, wide |

### 1.3 `TemplateSelector.tsx`

```typescript
interface TemplateSelectorProps {
  selected: string;
  onChange: (template: string) => void;
}

// Renders: visual template picker (cards with preview thumbnails)
// Behavior: click to select, shows current selection
```

### 1.4 `DocumentPreview.tsx`

```typescript
interface DocumentPreviewProps {
  config: DocumentConfig;
  curriculum: CurriculumData;
  discipline: string;
  order: SchoolOrder;
}

// Renders: live preview of document with current config
// Behavior: updates preview when config changes
```

### 1.5 `ExportPanel.tsx`

```typescript
// State: reads document config from parent
// Renders: export buttons for each format
// Behavior: triggers export handler for selected format
```

**Export Buttons**:
| Button | Format | Handler | Icon |
|--------|--------|---------|------|
| Scarica Word | .doc | `handleDownloadWordDefinitivo` | FileText |
| Scarica Word (.docx) | .docx | `handleDownloadWordDocx` | FileText |
| Scarica ODT | .odt | `handleDownloadODF` | FileText |
| Scarica PDF | .pdf | `handleDownloadCurricoloPDF` | FileText |
| Scarica Markdown | .md | `handleDownloadRichMarkdown` | FileText |
| Scarica TXT | .txt | `handleDownloadTxt` | FileText |
| Scarica CML | .cml | `handleDownloadCml` | Download |
| Stampa PDF | .pdf | `handlePrintDocumentPdf` | Printer |
| Copia negli appunti | HTML | `handleCopyToClipboardFormatted` | Copy |
| Scarica Backup | .json | `handleDownloadBackup` | Download |

### 1.6 `ComparisonView.tsx`

```typescript
// State: local — comparisonItems, comparisonMode
// Renders: side-by-side comparison table
// Behavior: select items to compare, toggle view mode
```

### 1.7 `ProgrammazioneDoc.tsx`

```typescript
// State: reads useCurriculumStore (discipline, order, localCurriculum)
// Renders: programmazione annuale document content
// Behavior: generates document text
```

### 1.8 `RelazioneDoc.tsx`

```typescript
// State: reads useCurriculumStore (discipline, order)
// Renders: relazione document content
// Behavior: generates document text
```

### 1.9 `SpecificoGradoDoc.tsx`

```typescript
// State: reads useCurriculumStore (discipline, order)
// Renders: grado-specific document content
// Behavior: generates document text based on school level
```

### 1.10 `AgidAudit.tsx`

```typescript
// State: local — agidAuditResult
// Renders: audit report with compliance checklist
// Behavior: generates mock AgID/WCAG 2.1 audit
```

---

## 2. Handlers (in `src/lib/documentGenerator.ts`)

```typescript
export function generateWordDocument(data: DocumentData): Blob {
  // Creates HTML with ministerial headers
  // Returns Blob for download
}

export function generateOdtDocument(data: DocumentData): Blob {
  // Creates ODT XML
  // Returns Blob for download
}

export function generateMarkdownDocument(data: DocumentData): string {
  // Creates markdown with tables
  // Returns string
}

export function generateTxtDocument(data: DocumentData): string {
  // Creates plain text
  // Returns string
}

export function generateCmlExport(state: AppState): string {
  // Creates JSON export
  // Returns string
}

export function printDocument(html: string): void {
  // Opens new window and triggers print
}

export function generateScormManifest(uda: UdaModel): string {
  // Creates imsmanifest.xml
  // Returns string
}
```

---

## 3. Data Flow

```
User configures document (DocumentConfig)
  → local state updates
  → DocumentPreview re-renders

User clicks export button
  → reads config from local state
  → reads curriculum from useCurriculumStore
  → calls appropriate generator from lib/documentGenerator.ts
  → returns Blob/string
  → triggers download or print
  → toast "Download completato"

User clicks "Copia negli appunti"
  → generates HTML table
  → copies to clipboard via lib/clipboard.ts
  → toast "Copiato negli appunti"
```

---

## 4. Tests

| Test File | Tests |
|-----------|-------|
| `DocumentsTab.test.tsx` | renders tabs, switches between config/export/comparison |
| `DocumentConfig.test.tsx` | renders all fields, updates values |
| `TemplateSelector.test.tsx` | renders templates, selects template |
| `DocumentPreview.test.tsx` | renders preview, updates on config change |
| `ExportPanel.test.tsx` | renders all export buttons, triggers correct handler |
| `ComparisonView.test.tsx` | renders comparison table, toggles view mode |
| `ProgrammazioneDoc.test.tsx` | generates correct document text |
| `RelazioneDoc.test.tsx` | generates correct document text |
| `SpecificoGradoDoc.test.tsx` | generates correct document text for each grade |
| `AgidAudit.test.tsx` | generates audit report |
| `documentGenerator.test.ts` | all generator functions produce valid output |

**Total**: ~35 tests
