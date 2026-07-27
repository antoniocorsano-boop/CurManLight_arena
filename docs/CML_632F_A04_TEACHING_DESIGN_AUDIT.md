# CML-632F — Audit: A04 Teaching Design

## Metadata

| Field | Value |
|-------|-------|
| Area ID | A04 |
| Area Name | Teaching Design (Progettazione Didattica) |
| Audit date | 2026-07-27 |
| Branch | `audit/cml-632f-a04-teaching-design` |
| Initial commit | `c70f1d8` |
| Baseline | CML-632E (A03 audit complete) |

---

## 1. Initial State

```text
Branch: audit/cml-632f-a04-teaching-design
Initial commit: c70f1d8
Working tree: clean (kilo.jsonc modified, unrelated)
Untracked: .playwright-mcp/, report/, scripts/, test-results/ (unrelated)
```

---

## 2. Perimeter

### Feature Area Structure

```
src/features/progettazione/
├── index.ts                              (9 lines — exports)
├── components/
│   ├── index.ts                          (8 lines — exports)
│   ├── ProgettazioneTab.tsx              (1096 lines — main component)
│   ├── KnowledgeCompanionPanel.tsx       (158 lines — assistance panel)
│   ├── UdaModals.tsx                     (268 lines — detail + outcomes modals)
│   └── CertificazioneTab.tsx             (177 lines — competencies matrix)
└── hooks/
    ├── useUdaProgrammingHandlers.ts      (266 lines — form + generation)
    ├── useProgettazioneAssistiveHandlers.ts (156 lines — TEP, prefill, clone)
    └── useKnowledgeCompanion.ts          (147 lines — reference system)
```

**Total: ~2,277 lines across 7 files.**

### Sub-tabs within ProgettazioneTab

| Tab ID | Label | Component | Purpose |
|--------|-------|-----------|---------|
| `annuale` | Progettatore | `ProgettazioneAnnualeView` | Create UDA (wizard or grid) |
| `uda` | Archivio UDA | `ArchivioUdaView` | Library of saved UDAs |
| `certificazione` | Matrice Competenze | `CertificazioneTab` | European key competencies |
| `classe-home` | Spazio Classe Home | inline | Classroom workspace entry |
| `classe` | Registro & Classe | `ClasseTab` (A05) | Classroom management |
| `social` | Bacheca Social | `SocialTab` (A06) | UDA reuse/sharing |

### Progettazione Modes

| Mode | Description |
|------|-------------|
| `grid` | 3-column layout: Traguardi/Obiettivi → Parametri → Preview/Actions |
| `wizard` | 5-step guided procedure: Dati → Traguardi → Evidenze → Compito → Riepilogo |

### UdaModel Type

```typescript
interface UdaModel {
  id: string;           // "uda-{timestamp}"
  title: string;
  discipline: string;
  order: SchoolOrder;
  period: string;       // "Primo Quadrimestre" | "Secondo Quadrimestre"
  hours: number;
  status: 'bozza' | 'in revisione' | 'pronta per confronto' | 'validata' | 'archiviata';
  traguardi: string[];  // plain text — no source metadata
  obiettivi: string[];  // plain text — no source metadata
  evidenze: string[];   // plain text — no source metadata
  realTask: string;
  notes: string;
  createdAt: string;
  updatedAt?: string;
}
```

### Key Props

`ProgettazioneTabProps` is a `Pick<AppViewsLayerProps>` of **80+ properties** (lines 30-162). This is the largest prop interface in the codebase.

---

## 3. Data Flow Trace

```
curriculumKB (static data per discipline/order)
  ↓
useCurriculumStore: discipline, order, selectedTraguardi[], selectedObiettivi[], selectedEvidenze[]
  ↓
ProgettazioneTab → ProgettazioneAnnualeView
  ↓                              ↓
  ↓                    KnowledgeCompanionPanel (volumesKB references)
  ↓
useUdaProgrammingHandlers:
  saveProgDraft → localStorage (individual field keys)
  handleGenerateUda → UdaModel → addUda → savedUda[]
  compileProgPreviewText → plain text preview
  ↓
ArchivioUdaView → filters, sorts, displays savedUda[]
  ↓
UdaDetailModal → copyUdaTextLocal → clipboard
               → copyUdaForRegister → clipboard
               → handleDownloadScormManifest → .zip download
  ↓
useProgettazioneAssistiveHandlers:
  applyAnticipatoryPrefill → pre-fills from recent UDAs
  handleCloneUdaAdaptive → clones with keyword realignment
  handleShareUdaToSocial → social sharing
  ↓
CertificazioneTab → reads localCurriculum + selectedTraguardi + selectedEvidenze
  ↓
exportMatrix → clipboard (PTOF matrix text)
```

### Data Loss Points

| Point | Data Lost | Impact |
|-------|-----------|--------|
| `handleGenerateUda` | Source indices, curriculum version | UDA disconnected from curriculum |
| `setDiscipline`/`setOrder` | Resets traguardi/obiettivi/evidenze selections | Previous selections lost |
| `deleteUda` | Entire UDA permanently | No recovery |
| `clearUdaLibrary` | All UDAs permanently | No recovery |
| `compileProgPreviewText` | No metadata in preview text | Preview is display-only |
| `copyUdaTextLocal` | Source metadata | Clipboard text has no provenance |

---

## 4. Central Question Assessment

### 4.1 First access and orientation

| # | Question | Assessment | Evidence |
|---|----------|------------|----------|
| 1 | Does the teacher understand what they can design? | **Partial** | Header says "Compilatore Unità di Apprendimento" — clear for UDA, but unclear for annual programming, certification, social sharing |
| 2 | Is it clear where to start? | **Partial** | Home view shows 3 action cards + timeline. But the "Programmazione Annuale" timeline shows synthetic UDAs when empty |
| 3 | Does it distinguish programming types? | **Partial** | Tabs exist for Progettatore, Archivio, Matrice, Social, Classe. But no explanation of when to use which |
| 4 | Does first access require understandable decisions? | **No** | The wizard has 5 steps but the grid shows all fields simultaneously. No guided onboarding |
| 5 | Is the final product clear? | **Partial** | "Genera UDA" button is clear, but the preview is raw text, not a formatted document |

### 4.2 Curriculum connection

| # | Question | Assessment | Evidence |
|---|----------|------------|----------|
| 6 | Can design start from A02 selection? | **No** | No transfer mechanism. A04 reads `localCurriculum` directly |
| 7 | Can A03 decisions feed A04? | **No** | No integration |
| | | | |
| 8 | Do traguardi/obiettivi/evidenze retain metadata? | **No** | `UdaModel` stores plain text strings. Source, version, order, discipline are lost |
| 9 | Does the teacher distinguish curriculum from system suggestions? | **Partial** | Synthetic UDAs are labeled "Riusa ed Importa d'Istituto" but appear identical to real content |
| 10 | Can design proceed without curriculum selection? | **Yes** | The form works with empty selections. No validation prevents it |
| 11 | Does the system flag inconsistencies? | **No** | No validation between order, discipline, class, and objectives |

### 4.3 Design construction

| # | Question | Assessment | Evidence |
|---|----------|------------|----------|
| 12 | Does the sequence follow didactic logic? | **Partial** | Wizard: Dati → Traguardi → Evidenze → Compito → Riepilogo. Missing obiettivi. Grid: all at once |
| 13 | Does each step explain what to enter? | **Partial** | Labels exist ("Traguardi di Competenza", "Obiettivi di Apprendimento") but no explanations of WHY |
| 14 | Can the teacher proceed with partial info? | **Yes** | No required field validation. All fields can be empty |
| 15 | Are required fields actually necessary? | **No** | Only title is validated. Hours, period, traguardi, obiettivi, evidenze, task, notes can all be empty |
| 16 | Are there controls against duplicates/contradictions? | **No** | No duplicate detection. No contradiction checking |
| 17 | Can the teacher go back without losing data? | **Partial** | Wizard: yes (state persists). Grid: yes (localStorage). But discipline/order change resets selections |
| 18 | Can imported/suggested content be freely modified? | **Yes** | Suggested UDAs fill form fields which can be edited |
| 19 | Can the teacher distinguish data sources? | **No** | No visual distinction between curriculum data, user input, system suggestions, and template content |

### 4.4 Knowledge Companion

| # | Question | Assessment | Evidence |
|---|----------|------------|----------|
| 20 | Does it provide relevant content? | **Partial** | References are curated per step but not per discipline or selection |
| 21 | Are references traceable? | **Partial** | `volumeId` maps to `volumesKB`, but no date, version, or authority |
| 22 | Is it clear suggestions are optional? | **Yes** | Footer: "Puoi continuare anche senza consultare i riferimenti" |
| 23 | Can the teacher identify the source document? | **Partial** | Volume title is shown, but not publication date or legislative reference |
| 24 | Are references updated and consistent? | **No** | Static content in `volumesKB`. No versioning |
| 25 | Does it help or add cognitive load? | **Partial** | Adds 3-4 reference cards to an already dense interface |
| 26 | Can assistance introduce unverified content? | **No** | References are display-only. No auto-fill from Knowledge Companion |
| 27 | Can assistance be ignored without side effects? | **Yes** | Panel can be collapsed. No forced interaction |

### 4.5 Persistence and recovery

| # | Question | Assessment | Evidence |
|---|----------|------------|----------|
| 28 | Is work saved understandably? | **Partial** | `saveProgDraft` saves to individual localStorage keys. No structured draft object |
| 29 | Is there a real state distinction? | **Partial** | `UdaModel.status` has 5 values but only `bozza` is ever set. `validata` and `archiviata` are dead code |
| 30 | Can the teacher find previous designs? | **Yes** | ArchivioUdaView with filters and search |
| 31 | Are date, last modified, and version visible? | **Partial** | `createdAt` shown. No `updatedAt` (only set by clone). No version |
| 32 | Can a design be duplicated? | **Yes** | "Clona ed Adatta" button exists with keyword realignment |
| 33 | Can a deleted design be recovered? | **No** | `deleteUda` is permanent. Confirm dialog is the only safeguard |
| 34 | Does the system prevent accidental loss? | **Partial** | Confirm dialogs for delete and clear-all. No undo for generation |
| 35 | Can multiple designs be managed unambiguously? | **Yes** | Filters by class, period, status, search text |

### 4.6 Operational outcome

| # | Question | Assessment | Evidence |
|---|----------|------------|----------|
| 36 | Does design produce a usable document? | **Partial** | Clipboard text only. No Word/PDF. SCORM manifest is minimal |
| 37 | Does the result preserve traguardi→obiettivi→activities→assessment links? | **No** | UDA stores arrays independently. No structured relationships |
| 38 | Can it transfer to A07? | **No** | A07 doesn't read `savedUda` |
| 39 | Can it link to a class in A05? | **Partial** | ClasseTab is embedded inside A04. But no data flows from UDA to class |
| 40 | Can it feed assessments in A06? | **No** | SocialTab is embedded but receives UDA data only for display |
| 41 | Are sources transferred to A11? | **No** | No integration |
| 42 | Does the teacher know where to find the final product? | **Partial** | ArchivioUdaView shows saved UDAs. But no "final document" view |
| 43 | Does export maintain structure and readability? | **Partial** | Clipboard text is structured but plain. SCORM is XML. No formatted document |
| 44 | Is the result suitable for departmental use? | **No** | No multi-author support. No institutional review workflow. No formal document output |

---

## 5. Functional Scenario Results

### Scenario 1 — First access

| Step | Result | Issue |
|------|--------|-------|
| Open progettazione | Home view with 3 cards + timeline | Synthetic UDAs shown when empty |
| Read header | "Compilatore Unità di Apprendimento" | Clear but jargon-heavy |
| Identify action | 3 action cards visible | But no explanation of what a UDA is |

### Scenario 2 — Design from zero

| Step | Result | Issue |
|------|--------|-------|
| Select order/class/discipline | Via store (sidebar) | Not available within A04 |
| Fill wizard steps | Title, period, traguardi, evidenze, task, notes | **Missing obiettivi in wizard** |
| Save draft | `saveProgDraft` → localStorage | Individual field keys, not structured |
| Exit and return | Data persists | OK |
| Generate UDA | Creates UDA, switches to Archivio | Form cleared implicitly |

### Scenario 3 — Design from A02

| Step | Result | Issue |
|------|--------|-------|
| Select in A02 | Traguardi/obiettivi selected in MappaView | Stored in `selectedTraguardi`/`selectedObiettivi` |
| Open A04 | Same selections visible | **Shared store state** — but no transfer mechanism |
| Change discipline | Selections reset to `[0]` | **Previous selections lost** |

### Scenario 4 — Design from A03

| Step | Result | Issue |
|------|--------|-------|
| Vote in A03 | Decision stored as `approved`/`rejected`/`custom` | No connection to A04 |
| Open A04 | No reference to A03 decisions | **No integration** |

### Scenario 5 — Knowledge Companion

| Step | Result | Issue |
|------|--------|-------|
| Open wizard step 2 | KC panel shows 3 references | Static, not discipline-specific |
| Read references | Volume titles and excerpts shown | No date, version, authority |
| Click "Apri riferimento" | VolumeReaderOverlay opens with HTML | `dangerouslySetInnerHTML` |
| Ignore KC | Panel can be collapsed | OK — no side effects |

### Scenario 6 — Modification and navigation

| Step | Result | Issue |
|------|--------|-------|
| Fill step | Data in form fields | OK |
| Go back | Wizard state persists | OK |
| Change discipline | Selections reset | **Data loss** |
| Change order | Selections reset | **Data loss** |

### Scenario 7 — Multiple designs

| Step | Result | Issue |
|------|--------|-------|
| Create 2 UDAs | Both in Archivio | OK |
| Distinguish | Filters, search, timeline | OK |
| Duplicate | "Clona ed Adatta" works | Keyword realignment applied |
| Modify clone | Editable | OK |
| Delete | Confirm dialog → permanent | **No recovery** |

### Scenario 8 — Export and documents

| Step | Result | Issue |
|------|--------|-------|
| Complete UDA | Status `bozza` | No way to mark as complete |
| Export text | Clipboard only | **No formatted document** |
| SCORM | XML manifest + zip | Minimal, no content |
| A07 connection | **None** | A07 doesn't read savedUda |

### Scenario 9 — Class and assessment

| Step | Result | Issue |
|------|--------|-------|
| Open ClasseTab | Embedded inside A04 | No data flows from UDA |
| Open SocialTab | Embedded inside A04 | UDA shown for reuse |
| Transfer to assessment | **None** | No integration with A06 |

### Scenario 10 — Incomplete data

| Step | Result | Issue |
|------|--------|-------|
| Select empty discipline | Traguardi/obiettivi/evidenze lists empty | OK — empty state |
| Generate empty UDA | **Possible** — only title validated | **Produces incomplete artifact** |
| Export empty UDA | Clipboard text with empty sections | **False completeness** |

### Scenario 11 — Responsiveness

| Width | Result | Issue |
|-------|--------|-------|
| 1440px | 3-column grid works | OK |
| 1024px | Grid stacks | OK |
| 768px | Single column | Wizard usable |
| 390px | Dense on mobile | Small touch targets |

### Scenario 12 — Keyboard and assistive

| Step | Result | Issue |
|------|--------|-------|
| Tab through controls | Most controls reachable | Focus visible on buttons |
| Open modals | Escape closes | OK |
| Use wizard | Buttons clickable | Progress bar not announced |
| Knowledge Companion | Toggle works | No aria-expanded |

---

## 6. UX Dimension Scores (1–5)

| # | Dimension | Score | Evidence | Consequence | Severity |
|---|-----------|:-----:|----------|-------------|----------|
| 1 | Purpose clarity | **2** | "Compilatore Unità di Apprendimento" — clear for UDA but not for full scope | Teacher may not understand all capabilities | Minor |
| 2 | First access comprehensibility | **2** | Home view shows cards but no onboarding; synthetic data shown | Confusion about what's real vs suggested | Significant |
| 3 | Final product recognizability | **2** | Preview is raw text; no formatted document shown | Teacher can't visualize the output | Significant |
| 4 | School context selection | **1** | No in-tab selector; discipline/order from store only | Must navigate to A02 to change context | Blocking |
| 5 | Curriculum connection | **1** | Shared store state but no transfer mechanism; selections reset on change | Redundant work; no A02→A04 flow | Blocking |
| 6 | Didactic sequence quality | **2** | Wizard has logical flow but missing obiettivi; grid is all-at-once | Incomplete UDAs from wizard | Significant |
| 7 | Step comprehensibility | **2** | Labels exist but no explanations of why each field matters | Teacher fills fields without understanding purpose | Significant |
| 8 | Field adequacy | **2** | Core fields present but missing: interdisciplinary links, assessment criteria, methodology details | Shallow UDA structure | Significant |
| 9 | Instruction quality | **1** | No field-level help text; no tooltips; no examples | Teacher guesses what to enter | Significant |
| 10 | Data source distinction | **1** | No visual distinction between curriculum, user, system, template data | Confusion about data provenance | Blocking |
| 11 | Source traceability | **0** | UdaModel stores plain text; no source metadata; Knowledge Companion references unverifiable | Complete loss of provenance | Blocking |
| 12 | Knowledge Companion quality | **2** | Curated references exist but static, not discipline-specific, no versioning | Limited practical value | Significant |
| 13 | User control over suggestions | **3** | KC is collapsible; suggested UDAs are loadable but editable | Adequate control | — |
| 14 | Inconsistency prevention | **0** | No validation; no cross-field checks; no order/discipline/class consistency | Empty or contradictory UDAs possible | Blocking |
| 15 | Persistence | **2** | localStorage for form fields; IndexedDB for savedUda; but no structured draft | Fragile persistence | Significant |
| 16 | Work recoverability | **1** | No undo; no draft versioning; permanent delete; no soft-delete | Work loss risk | Blocking |
| 17 | Version management | **0** | No versioning; no history; no diff; `updatedAt` only on clone | No iteration support | Blocking |
| 18 | Multiple design management | **3** | Filters, search, timeline in ArchivioUdaView | Adequate for basic use | — |
| 19 | A02 continuity | **1** | Shared store state; but no transfer, no pre-fill, no import | Redundant work | Blocking |
| 20 | A03 continuity | **0** | No integration whatsoever | Revision decisions ignored | Blocking |
| 21 | A05 integration | **1** | ClasseTab embedded inside A04; no data flows from UDA | False integration | Significant |
| 22 | A06 integration | **1** | SocialTab embedded inside A04; display-only | False integration | Significant |
| 23 | A07 integration | **0** | No structured export; clipboard only; A07 doesn't read savedUda | No formal document output | Blocking |
| 24 | A11 integration | **0** | No connection to institute sources | Sources not transferred | Blocking |
| 25 | Summary quality | **2** | Preview is raw text; no formatted summary; no statistics | Teacher can't evaluate completeness | Significant |
| 26 | Export quality | **1** | Clipboard text; minimal SCORM; hardcoded school identity | Unusable for formal purposes | Significant |
| 27 | Accessibility | **1** | No heading hierarchy; small fonts; no aria on progress; KC not announced | Exclusion risk | Significant |
| 28 | Visual readability | **2** | Cards clear; but 8-11px fonts; dense information; jargon headers | Readability issues | Significant |
| 29 | Responsive behavior | **2** | Basic stacking; wizard usable on tablet; mobile dense | Minor mobile issues | Minor |
| 30 | Non-technical teacher suitability | **1** | Jargon-heavy; no onboarding; synthetic data confusion; no guidance | High barrier to entry | Significant |

**Dimensions at 0:** Source traceability (11), Inconsistency prevention (14), Version management (17), A03 continuity (20), A07 integration (23), A11 integration (24)
**Dimensions at 1:** School context (4), Curriculum connection (5), Instructions (9), Data source distinction (10), Recoverability (16), A02 (19), A05 (21), A06 (22), Export (26), Accessibility (27), Non-technical (30)
**Dimensions at 2:** Purpose (1), First access (2), Final product (3), Didactic sequence (6), Steps (7), Fields (8), KC (12), Persistence (15), Summary (25), Visual (28), Responsive (29)
**Dimensions at 3+:** User control (13), Multiple designs (18)

**24 of 30 dimensions below 3.**

---

## 7. Didactic Audit

### Structural coherence

| Aspect | Assessment | Evidence |
|--------|------------|----------|
| Traguardi → Obiettivi hierarchy | **Partial** | Both selectable but no hierarchy enforced; obiettivi not in wizard |
| Obiettivi → Activities link | **No** | UDA stores `realTask` as free text; no structured activity list |
| Activities → Assessment link | **No** | No assessment criteria in UDA; `evidenze` are display-only |
| Prerequisites | **No** | No prerequisite field |
| Inclusion attention | **Partial** | `notes` field labeled "BES/DSA" but no structured inclusion plan |
| Differentiation | **No** | No differentiation support |
| Time management | **Partial** | `hours` field exists but no per-activity breakdown |
| Methodologies | **No** | No methodology field; only free-text `notes` |
| Tools | **No** | No tools field |
| Formative assessment | **No** | No formative assessment field |
| Summative assessment | **No** | No summative assessment field |
| Rubrics | **No** | No rubric support |
| Evidence documentation | **Partial** | `evidenze` array but display-only; not connected to activities |
| Interdisciplinarity | **Partial** | `progCoAuthors` field exists but not used in UDA generation |
| Civic education | **No** | No specific support |
| Adaptability | **Partial** | Wizard/grid modes; but no discipline-specific scaffolding |

### Perspective Assessment

| Perspective | Utility | Missing | Risk | Conditions |
|-------------|---------|---------|------|------------|
| Subject teacher | Low | Activity breakdown, methodology, assessment criteria | Produces shallow UDAs | Needs structured fields |
| Support teacher | None | No inclusion-specific workflow | Inclusion notes are free text | Needs PEI/PDP integration |
| Class coordinator | Low | No cross-discipline view | Cannot see UDA in class context | Needs class-level aggregation |
| Department coordinator | None | No department-level workflow | Cannot review/approve | Needs review workflow |
| Curriculum referent | Low | No curriculum alignment verification | Cannot verify UDA↔curriculum | Needs alignment checks |
| School principal | None | No institutional overview | Cannot assess departmental output | Needs dashboard |
| Didactic expert | Low | No didactic model enforcement | UDAs may be pedagogically weak | Needs quality scaffolding |
| EdTech expert | Low | No SCORM content; minimal export | Technical output is skeletal | Needs real content packaging |

---

## 8. Language Audit

| Term | Location | Issue | Recommendation |
|------|----------|-------|----------------|
| "Ambito di Progettazione d'Istituto" | Header | Jargon | "Area di Progettazione" |
| "Compilatore Unità di Apprendimento" | Tab title | Technical | "Crea Nuova UDA" |
| "Archivio delle Unità Progettate" | Tab title | Overly formal | "Le tue UDA" |
| "Matrice delle Competenze d'Istituto" | Tab title | Jargon | "Competenze Chiave Europee" |
| "Bacheca dei Riusi d'UDA" | Tab title | Non-standard | "Condividi e Riusa UDA" |
| "Pianificazione Diacronica d'Istituto" | Timeline header | Unclear | "Programmazione Annuale" |
| "Riusa ed Importa d'Istituto" | Button | Confusing | "Carica Template" |
| "Passa al Wizard" | TEP banner | Mixed language | "Passa alla Guida Passo-passo" |
| "Procedura Guidata Wizard" | Button | Mixed language | "Guida Passo-passo" |
| "Assistente Ergonomico d'Aula" | TEP banner | Non-standard | "Suggerimento di Accessibilità" |
| "Curricolo 2012 (Previgente)" | Badge | Technical | "Normativa 2012" |
| "Curricolo 2025 (Riformato)" | Badge | Technical | "Normativa 2025" |
| "Traccato Interoperabile di Co-progettazione UDA" | Export | Overly bureaucratic | "Tracciato per Registro Elettronico" |
| "IC Calvario-Covotta" | CertificazioneTab | Wrong school name (different from other hardcoded references) | Parameterize |
| "Swarm di Esperti" | curriculumKB | Non-standard | Remove or replace |

---

## 9. Visual, Accessibility, and Responsiveness

### Font Sizes

| Element | Size | Issue |
|---------|------|-------|
| Section labels | 9px | Below WCAG minimum |
| Tab labels | 10px | Below comfortable reading |
| Field labels | 10px | Below comfortable reading |
| Card text | 10-11px | Marginal |
| Wizard step labels | 9px | Below minimum |
| Status badges | 8px | Below minimum |
| Timeline dots | 8px | Below minimum |

### Heading Hierarchy

- `<h2>` used for main titles
- `<h3>` used for section titles
- `<h4>` used for card titles
- But `<span>` with `text-[9px] font-black` used as pseudo-headings throughout

### Keyboard Navigation

| Control | Accessible | Issue |
|---------|:----------:|-------|
| Wizard steps | Yes | Clickable buttons |
| Grid columns | Yes | Standard form controls |
| Modals | Yes | Escape to close; focus trapped |
| Knowledge Companion | Yes | Toggle works |
| Progress bar | No | Not announced to screen readers |
| Filters | Yes | Standard selects |

### Responsive Behavior

| Width | Layout | Issue |
|-------|--------|-------|
| 1440px | 3-column grid | OK |
| 1366px | 3-column grid | OK |
| 1024px | Stacked grid | OK |
| 768px | Single column | Wizard usable; KC panel adds density |
| 390px | Single column | Dense; small touch targets; 8px text illegible |

---

## 10. Data Integrity Audit

### Transformation Points

| Point | Input | Output | Loss |
|-------|-------|--------|------|
| `setDiscipline` | Previous selections | Reset to `[0]` | Previous selections lost |
| `setOrder` | Previous selections | Reset to `[0]` | Previous selections lost |
| `handleGenerateUda` | Store selections + form fields | `UdaModel` | Source indices, curriculum version |
| `handleCloneUdaAdaptive` | `UdaModel` + current curriculum | New `UdaModel` | Keyword-based realignment may change text |
| `compileProgPreviewText` | All form data + selections | Plain text | No metadata in output |
| `copyUdaTextLocal` | `UdaModel` | Clipboard text | No source metadata |
| `copyUdaForRegister` | `UdaModel` | Clipboard text | Hardcoded school identity |
| `handleDownloadScormManifest` | `UdaModel` | SCORM XML + zip | Minimal manifest; no content |
| `exportMatrix` | Competencies | Clipboard text | Hardcoded school identity |

### Hardcoded Values

| Value | Location | Issue |
|-------|----------|-------|
| `I.C. don Lorenzo Milani` | `compileProgPreviewText` | Wrong school |
| `IC Calvario-Covotta "don Lorenzo Milani"` | `CertificazioneTab` | Different school name |
| `AVIC849003` | `CertificazioneTab`, `copyUdaForRegister` | Wrong codice meccanografico |
| `schoolYear === '2026-2027'` | Grid layout | Hardcoded transition year |
| `Modulo 1: Ascolto e Sintesi` | Default progTitle | Synthetic default |
| 3 suggested UDAs | Timeline, CertificazioneTab | Synthetic data |

---

## 11. 14-Discipline Coverage Matrix

| Discipline | Traguardi | Obiettivi | Evidenze | Suggested UDA | Wizard support | Grid support | Export | Classification |
|------------|:---------:|:---------:|:--------:|:-------------:|:--------------:|:------------:|:------:|:--------------:|
| Italiano | Yes | Yes | Yes | Yes (2) | Partial (no obiettivi) | Yes | Text | Partial |
| Matematica | Yes | Yes | Yes | No | Partial | Yes | Text | Partial |
| Scienze | Yes | Yes | Yes | No | Partial | Yes | Text | Partial |
| Tecnologia | Yes | Yes | Yes | Yes (2) | Partial | Yes | Text | Partial |
| Storia | Yes | Yes | Yes | No | Partial | Yes | Text | Partial |
| Geografia | Yes | Yes | Yes | No | Partial | Yes | Text | Partial |
| Inglese | Yes | Yes | Yes | No | Partial | Yes | Text | Partial |
| 2ᵃ Lingua | Yes | Yes | Yes | No | Partial | Yes | Text | Partial |
| Arte e Immagine | Yes | Yes | Yes | No | Partial | Yes | Text | Partial |
| Musica | Yes | Yes | Yes | No | Partial | Yes | Text | Partial |
| Educazione Fisica | Yes | Yes | Yes | No | Partial | Yes | Text | Partial |
| Educazione Civica | Yes | Yes | Yes | No | Partial | Yes | Text | Partial |
| Religione | Yes | Yes | Yes | No | Partial | Yes | Text | Partial |
| Latino | Yes | Yes | Yes | Yes (1) | Partial | Yes | Text | Partial |

**Key issues across all disciplines:**
- Wizard never shows obiettivi (step 2 only shows traguardi)
- No discipline-specific scaffolding
- No suggested UDAs for 11 of 14 disciplines
- Export is always plain text regardless of discipline
- Source metadata lost for all disciplines

---

## 12. Cross-Cutting Pattern Verification

| Pattern | Status | Evidence |
|---------|--------|----------|
| `CML_632_CROSS_CUTTING_UI_READABILITY_DEFECT_CONFIRMED` | **CONFIRMED** | 8-11px throughout. 5th area confirmation. |
| `CML_632_CROSS_CUTTING_ISOLATION_PATTERN_CONFIRMED` | **CONFIRMED** | No A02→A04, A03→A04, A04→A07 transfer. 5th area confirmation. |
| `CML_632_CROSS_CUTTING_NO_STRUCTURED_SOURCE_DATA_CONFIRMED` | **CONFIRMED** | UdaModel stores plain text. Knowledge Companion references static. 5th area confirmation. |
| `CML_632_CROSS_CUTTING_UNVERIFIED_VALIDATION_LABELS` | **CONFIRMED** | Synthetic UDAs labeled as "d'Istituto". Status `validata`/`archiviata` never set. 4th area confirmation. |
| `CML_632_CROSS_CUTTING_NO_DECISION_TRACEABILITY` | **CONFIRMED** | No author, timestamp, or history on UDAs. 3rd area confirmation. |
| `CML_632_CROSS_CUTTING_EXPERIMENTAL_DATA_EXPOSURE` | **CONFIRMED** | CML-631 pilot accessible. Synthetic UDAs indistinguishable from real. 4th area confirmation. |
| `CML_632_CROSS_CUTTING_NO_CURRICULUM_TO_DESIGN_TRANSFER` | **NEW — CONFIRMED** | A02 selections shared via store but reset on discipline/order change. A03 decisions not connected. A04 reads curriculumKB directly. |
| `CML_632_CROSS_CUTTING_UNTRACEABLE_ASSISTED_CONTENT` | **NEW — CONFIRMED** | Knowledge Companion references from static `volumesKB`. No date, version, or authority. Not discipline-specific. |
| `CML_632_CROSS_CUTTING_WORK_RECOVERY_DEFECT` | **NEW — CONFIRMED** | No draft versioning. No undo. Permanent delete. No soft-delete. |
| `CML_632_CROSS_CUTTING_OUTPUT_DATA_LOSS` | **NEW — CONFIRMED** | UdaModel loses source metadata on generation. Exports lose school identity. Clipboard text has no provenance. |
| `CML_632_CROSS_CUTTING_FALSE_COMPLETENESS` | **NEW — CONFIRMED** | Synthetic UDAs presented as "d'Istituto". Empty fields produce apparently complete artifacts. `validata` status exists but never used. |

---

## 13. Technical Verification

| Check | Result | Notes |
|-------|--------|-------|
| `npx tsc --noEmit` | **PASS** — 0 errors | No regression |
| `npm run build` | **PASS** — 1,143.80 kB | No regression |
| `npm test` | 754/755 pass | 1 timeout (`schema.test.ts` — IndexedDB infrastructure, not functional) |

### Existing Tests

| Test file | Relevance | Coverage |
|-----------|-----------|----------|
| `knowledge-companion.test.tsx` | A04 KnowledgeCompanion | Basic rendering |
| `uda-detail-modal.test.tsx` | A04 UdaDetailModal | Basic rendering |
| `teacher-workspace-part1.test.tsx` | A04 progettazioneMode | Mode switching |
| `cml611-dialogs-confirmations.test.tsx` | A04 deletion | Source code pattern matching |
| `navigation.cml604d.test.tsx` | A04 navigation | Tab state |

**No tests for:** UDA generation, Knowledge Companion reference accuracy, export content, curriculum transfer, state transitions, draft persistence.

---

## 14. Scores

| Dimension | Score | Key Finding |
|-----------|:-----:|-------------|
| Valore per l'utente | **2** | Rich form builder but disconnected artifacts |
| Coerenza funzionale | **1** | Missing obiettivi in wizard; dead status states; no validation |
| Copertura dei dati | **2** | 14 disciplines supported but all lose source metadata |
| Qualità dei metadati | **0** | Plain text arrays; no source, version, authority |
| Comprensibilità | **2** | Jargon-heavy; no onboarding; synthetic data confusion |
| Ricerca e filtri | **3** | ArchivioUdaView has good filtering |
| Dettaglio | **2** | Core fields present but missing methodology, assessment, prerequisites |
| Provenienza | **0** | No source metadata; Knowledge Companion unverifiable |
| Integrazione A02 | **1** | Shared store but no transfer mechanism |
| Integrazione A03 | **0** | No integration |
| Integrazione A05 | **1** | ClasseTab embedded but no data flow |
| Integrazione A06 | **1** | SocialTab embedded but display-only |
| Integrazione A07 | **0** | No structured export |
| Integrazione A11 | **0** | No connection |
| Gerarchia visiva | **1** | Inconsistent headings; 8-11px pseudo-headings |
| Accessibilità | **1** | Small fonts; no progress announcement; no aria on KC |
| Responsività | **2** | Basic stacking; mobile dense |
| Persistenza | **2** | localStorage + IndexedDB; but no structured draft |
| Recuperabilità | **1** | No undo; permanent delete; no soft-delete |
| Gestione versioni | **0** | No versioning; no history; no diff |
| Gestione multiple | **3** | Filters, search, timeline adequate |
| Affidabilità | **1** | Synthetic data; hardcoded identity; no validation |
| Copertura didattica | **1** | Missing methodology, assessment, prerequisites, rubrics |
| Utilità docente non tecnico | **1** | High barrier; jargon; no guidance |
| Qualità output | **1** | Clipboard text only; minimal SCORM; no formatted document |

**Dimensions at 0:** Qualità metadati, Provenienza, A03, A07, A11, Versioning
**Dimensions at 1:** Coerenza, A02, A05, A06, Gerarchia, Accessibilità, Recuperabilità, Affidabilità, Copertura didattica, Utilità, Output
**Dimensions at 2:** Valore, Dati, Comprensibilità, Dettaglio, Persistenza, Responsività
**Dimensions at 3+:** Ricerca, Multiple

**21 of 25 dimensions below 3.**
