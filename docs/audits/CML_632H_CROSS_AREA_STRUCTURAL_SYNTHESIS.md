# CML-632H — Cross-Area Structural Synthesis

## Metadata

| Field | Value |
|-------|-------|
| Audit ID | CML-632H |
| Audit Name | Cross-Area Structural Synthesis |
| Date | 2026-07-27 |
| Branch | `audit/cml-632h-cross-area-structural-synthesis` |
| Initial commit | `e1395a5` |
| Baseline | CML-632G (A07 audit complete) |

---

## 1. Audit Inventory

| ID | Area | Branch | Commit | Verdict | Blocking | Significant | Minor | Opps | Dims <3 |
|----|------|--------|--------|---------|:--------:|:-----------:|:-----:|:----:|:-------:|
| CML-632B | A01 Home & Orientation | `audit/cml-632b-a01-home-orientation` | `4e02417` | REDESIGN | — | — | — | — | 7/10 |
| CML-632C | A11 Institute Sources | `audit/cml-632c-a11-institute-sources` | `eddbf6b` | REDESIGN | — | — | — | — | 11/12 |
| CML-632D | A02 Curriculum Consultation | `audit/cml-632d-a02-curriculum-consultation` | `a6f3325` | REDESIGN | — | — | — | — | 14/15 |
| CML-632E | A03 Curriculum Revision | `audit/cml-632e-a03-curriculum-revision` | `c70f1d8` | REDESIGN | 8 | 7 | 5 | 7 | 17/20 |
| CML-632F | A04 Teaching Design | `audit/cml-632f-a04-teaching-design` | `b39a1b7` | REDESIGN | 8 | 10 | 8 | 7 | 24/30 |
| CML-632G | A07 Documents & Export | `audit/cml-632g-a07-documents-export` | `e1395a5` | REDESIGN | 8 | 9 | 3 | 12 | — |

**Total: 6 areas audited, 6 REDESIGN verdicts.**

---

## 2. Overall Product State

### 2.1 What CurManLight Is Today

CurManLight is a React/TypeScript single-page application that presents itself as a curriculum management tool for Italian schools. It offers:

- Consultation of a hardcoded curriculum knowledge base (14 disciplines × 3 school orders)
- A gap revision interface comparing DM 254/2012 with DM 221/2025
- A UDA (Unità di Apprendimento) builder with wizard and grid modes
- Document generation (Programmazione Annuale, Relazione, Documento Specifico)
- Export to Word/ODF/PDF/TXT/CML/Markdown
- A template configurator marketed as "AI-assisted"
- Classroom management, social sharing, and process/consent views (partially embedded)

### 2.2 What It Declares vs What It Does

| Claim | Reality |
|-------|---------|
| "Curricolo" consultation | Displays hardcoded text with no source metadata |
| "Revisione" with "Accetta 2025 / Mantieni 2012" | Personal vote stored as key-value pair; no institutional process |
| "Progettazione" with "Compilatore UDA" | Rich form builder producing plain-text artifacts with no persistence of structure |
| "Documenti" generation | HTML wrapped in .doc/.odt extensions with hardcoded school identity |
| "Modelli con IA" (AI templates) | Keyword-matching chat interface with 800ms fake latency |
| "Mappa Validata" badge | Hardcoded string, not data-driven |
| "Approvato 2025" status | Personal vote labeled as institutional approval |
| "Pilota Sperimentale" | Frozen CML-631 module still accessible without warning |
| "Knowledge Companion" | Static references from `volumesKB` with no date/version |
| "SCORM" export | Minimal XML manifest with no content |

### 2.3 End-to-End Flow: Does It Exist?

**No.** There is no continuous, data-connected flow from source consultation through curriculum revision, teaching design, and document export. Each area operates on its own data snapshot. The theoretical user journey:

```
Fonti (A11) → Consultazione (A02) → Revisione (A03) → Progettazione (A04) → Documenti (A07)
```

is in reality:

```
Fonti: static prose, no connection to anything
  ↓ (no data transfer)
Consultazione: hardcoded KB, selections stored in Zustand
  ↓ (store state shared but no structured transfer)
Revisione: personal votes as flat key-value pairs
  ↓ (decisions not consumed by A04 or A07)
Progettazione: reads curriculumKB directly, builds UDA as plain-text arrays
  ↓ (savedUda not read by A07 document generators)
Documenti: generates synthetic text, wraps HTML as DOCX, hardcoded school identity
```

Every arrow represents a **break**. No area produces data that the next area consumes in structured form.

---

## 3. Cross-Area Matrix

| Dimension | A01 | A11 | A02 | A03 | A04 | A07 |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|
| **Declared purpose** | Entry point | Source library | Curriculum view | Gap revision | UDA builder | Document export |
| **Real behavior** | Dashboard with no identity | Static prose panels | Hardcoded KB display | Personal voting | Rich form → plain text | HTML → fake DOCX |
| **Verdict** | REDESIGN | REDESIGN | REDESIGN | REDESIGN | REDESIGN | REDESIGN |
| **Source metadata** | — | None | None | None | None | None |
| **States** | — | — | — | 3 (misleading) | 5 (1 used) | None |
| **Versioning** | — | — | — | None | None | None |
| **Input integration** | — | None | A11: none | A02: visual only | A02: store shared; A03: none | A04: savedUda read directly |
| **Output integration** | → sidebar | None | → A03 (visual), A04 (store) | → A07 (.cml only) | → clipboard, SCORM | → file download |
| **Persistence** | IndexedDB (store) | Static code | IndexedDB (store) | IndexedDB (store) | IndexedDB (savedUda) | None (generated on-the-fly) |
| **Hardcoded identity** | No | No | No | Yes | Yes | Yes (8+ locations) |
| **Synthetic content** | Metrics in widgets | Prose panels | "Mappa Validata" badge | "Approvato" labels | 3 suggested UDAs, synthetic timeline | Entire document generators |
| **Dims below 3** | 7/10 | 11/12 | 14/15 | 17/20 | 24/30 | — |

---

## 4. Current Flow Reconstruction

### 4.1 Technical Flow

```text
curriculumKB.ts (1075 lines, static TypeScript)
  ↓ useLocalCurriculum (localStorage override or KB fallback)
localCurriculum (React state)
  ↓ passed as prop to ProgettazioneTab, ProcessoTab
  ↓ read by CurriculumTab, RevisioneTab, EsportazioniTab
useCurriculumStore (Zustand + IndexedDB)
  ├── discipline, order (shared across views)
  ├── selectedTraguardi[], selectedObiettivi[] (shared but reset on change)
  ├── decisions: Record<string, DecisionStatus> (A03 only)
  ├── customTexts: Record<string, string> (A03 only)
  ├── savedUda[] (A04 only)
  ├── documentExportHistory[] (A07 only)
  └── UI state (activeTab, activeCurricoloView, etc.)
```

**Data lost at each transition:**

| Transition | Data Lost |
|------------|-----------|
| KB → localCurriculum | Source, date, version, authority, nucleiFondanti |
| localCurriculum → AlberoView | Proposals, evidenze, nucleiFondanti, all metadata |
| localCurriculum → RevisioneTab | Evidenze, nucleiFondanti, source verification |
| A03 decisions → A04 | **Entire decisions object** — A04 doesn't read it |
| A03 decisions → A07 | Only in .cml export; not in generated documents |
| A02 selections → A04 | Shared via store but **reset on discipline/order change** |
| A04 UDA → A07 | **savedUda not consumed** by document generators |
| A04 UDA → clipboard | Source metadata, curriculum version, rubrica, competenze |
| A07 generators → output | Real class data replaced by synthetic text |

### 4.2 User Flow

```text
Teacher opens app
  → Sees dashboard with no product identity
  → Clicks "Inizia dal Curricolo"
  → Lands on A02 AlberoView
  → Selects discipline (no order selector)
  → Reads traguardi/obiettivi (no source info)
  → Navigates to A03 "Revisione"
  → Votes on 24 proposals across 7 disciplines
  → Votes are stored as personal choices labeled "Approvato"
  → Navigates to A04 "Progettazione"
  → Opens UDA builder
  → Selects traguardi (same ones from A02, if discipline hasn't changed)
  → Fills form (wizard or grid)
  → Generates UDA (plain text, no source metadata)
  → UDA saved to archive
  → Navigates to A07 "Esportazioni"
  → Clicks "Genera Programmazione Annuale"
  → Sees synthetic text in preview pane
  → Navigates away → preview content disappears
  → Clicks "Scarica Word (.doc)"
  → Downloads HTML file with .doc extension
  → Opens in Word → formatting may be incorrect
```

**At no point does the teacher's actual work flow continuously from one area to the next.**

---

## 5. Root Cause Analysis

### RC-01: Absence of a Canonical Data Model

**Status: CONFIRMED — CAUSE RADICE**

The product has no domain model. Data is stored as:
- Static TypeScript objects (`curriculumKB`)
- Flat key-value pairs in Zustand (`decisions`, `customTexts`)
- Plain text arrays (`traguardi: string[]`, `obiettivi: string[]`)
- Individual localStorage keys (draft fields)

No entity has: stable ID, source reference, date, version, authority, or relationships to other entities.

**Derived patterns:**
- `NO_STRUCTURED_SOURCE_DATA` (all 6 areas)
- `OUTPUT_DATA_LOSS` (A04, A07)
- `NO_DECISION_TRACEABILITY` (A03, A04)
- `DOCUMENT_VERSIONING_ABSENCE` (A07)
- `UNSAFE_HTML_EXPORT` (A07)

### RC-02: Absence of an Institutional Process Model

**Status: CONFIRMED — CAUSE RADICE**

The product has no workflow states, no role enforcement, no approval chain, no audit trail. Personal votes are labeled as institutional approvals. The "Pipeline di Validazione" in ProcessoTab is descriptive only.

**Derived patterns:**
- `UNVERIFIED_VALIDATION_LABELS` (A02, A03, A04)
- `PROCESS_STATE_AMBIGUITY` (A03, ProcessoTab)
- `NO_DECISION_TRACEABILITY` (A03, A04)
- `FALSE_COMPLETENESS` (A04)
- `UNRELIABLE_DOCUMENT_STATUS` (A07)

### RC-03: Areas Designed as Isolated Modules

**Status: CONFIRMED — CAUSE RADICE**

Each area was built independently with its own data access pattern. No area produces structured output that the next area consumes. The "integration" consists of passing `localCurriculum` as a prop or sharing Zustand store keys.

**Derived patterns:**
- `ISOLATION_PATTERN` (all 6 areas)
- `NO_CURRICULUM_TO_DESIGN_TRANSFER` (A02→A04, A03→A04)
- `NO_DESIGN_TO_DOCUMENT_TRANSFER` (A04→A07)

### RC-04: Prototypes Remained in Product

**Status: CONFIRMED — CAUSE RADICE**

The CML-631 pilot is frozen but still accessible. Synthetic data (suggested UDAs, hardcoded metrics, template content) is indistinguishable from real data. Experimental features appear as regular product capabilities.

**Derived patterns:**
- `EXPERIMENTAL_DATA_EXPOSURE` (A02, A03, A04)
- `FALSE_COMPLETENESS` (A04)
- `SYNTHETIC_CONTENT_FORMALIZATION` (A07)

### RC-05: Absence of a Document Model

**Status: CONFIRMED — CAUSE RADICE**

Documents are generated on-the-fly from store state, rendered into a preview pane, and lost on navigation. No document entity, no states, no versioning, no archive. Exports are HTML wrapped in misleading file extensions.

**Derived patterns:**
- `DOCUMENT_VERSIONING_ABSENCE` (A07)
- `UNRELIABLE_DOCUMENT_STATUS` (A07)
- `PREVIEW_EXPORT_DIVERGENCE` (A07)
- `UNSAFE_HTML_EXPORT` (A07)

### RC-06: Absence of Institutional Configuration

**Status: CONFIRMED — CAUSE RADICE**

School name, codice meccanografico, address, principal name, and ministerial headers are hardcoded in 8+ locations. The product can only be used by one specific institute.

**Derived patterns:**
- `HARDCODED_INSTITUTIONAL_IDENTITY` (A07, A04)

### RC-07: UI Architecture Precedes Domain Model

**Status: CONFIRMED — CAUSE RADICE**

`ProgettazioneTab` has 80+ props. The navigation has 11+ tabs with sub-menus. The sidebar exposes frozen modules as regular items. The UI complexity reflects accumulated features, not a coherent domain model.

**Derived patterns:**
- `UI_READABILITY_DEFECT` (all 6 areas)
- `WORK_RECOVERY_DEFECT` (A04)

---

## 6. Cross-Cutting Patterns Consolidated

### 6.1 Confirmed Patterns (Unified)

| Pattern | Level | Areas | Root Cause |
|---------|-------|-------|------------|
| `DATA_MODEL_ABSENCE` | Causa radice | All | RC-01 |
| `PROCESS_MODEL_ABSENCE` | Causa radice | A03, A04, A07 | RC-02 |
| `AREA_ISOLATION` | Causa radice | All | RC-03 |
| `PROTOTYPE_IN_PRODUCT` | Causa radice | A02, A03, A04 | RC-04 |
| `DOCUMENT_MODEL_ABSENCE` | Causa radice | A07 | RC-05 |
| `INSTITUTIONAL_CONFIG_ABSENCE` | Causa radice | A04, A07 | RC-06 |
| `UI_PRECEDES_DOMAIN` | Causa radice | All | RC-07 |
| `SOURCE_METADATA_ABSENCE` | Difetto sistemico | All (A11, A02, A03, A04, A07) | RC-01 |
| `VALIDATION_LABEL_MISUSE` | Difetto sistemico | A02, A03, A04, A07 | RC-02 |
| `TRANSFER_BREAK` | Difetto sistemico | A02→A04, A03→A04, A04→A07 | RC-03 |
| `SYNTHETIC_REAL_CONFUSION` | Difetto sistemico | A02, A04, A07 | RC-04 |
| `UI_READABILITY` | Sintomo | All 6 areas | RC-07 |

### 6.2 Retired Patterns

| Original Pattern | Action | Reason |
|------------------|--------|--------|
| `UNVERIFIED_VALIDATION_LABELS` | Unified into `VALIDATION_LABEL_MISUSE` | Same root cause across areas |
| `PROCESS_STATE_AMBIGUITY` | Unified into `PROCESS_MODEL_ABSENCE` | Symptom of missing process model |
| `NO_DECISION_TRACEABILITY` | Unified into `SOURCE_METADATA_ABSENCE` | No metadata on any entity |
| `NO_CURRICULUM_TO_DESIGN_TRANSFER` | Unified into `TRANSFER_BREAK` | Same isolation pattern |
| `NO_DESIGN_TO_DOCUMENT_TRANSFER` | Unified into `TRANSFER_BREAK` | Same isolation pattern |
| `FALSE_COMPLETENESS` | Unified into `SYNTHETIC_REAL_CONFUSION` | Same confusion between real and synthetic |
| `UNTRACEABLE_ASSISTED_CONTENT` | Unified into `SOURCE_METADATA_ABSENCE` | Knowledge Companion has no metadata |
| `WORK_RECOVERY_DEFECT` | Unified into `DATA_MODEL_ABSENCE` | No entities to recover |
| `OUTPUT_DATA_LOSS` | Unified into `TRANSFER_BREAK` | Data lost at area transitions |
| `UNSAFE_HTML_EXPORT` | Unified into `DOCUMENT_MODEL_ABSENCE` | No proper document model |
| `PREVIEW_EXPORT_DIVERGENCE` | Unified into `DOCUMENT_MODEL_ABSENCE` | No shared rendering pipeline |
| `DOCUMENT_VERSIONING_ABSENCE` | Unified into `DOCUMENT_MODEL_ABSENCE` | No document entity |
| `UNRELIABLE_DOCUMENT_STATUS` | Unified into `DOCUMENT_MODEL_ABSENCE` | No document states |
| `SYNTHETIC_CONTENT_FORMALIZATION` | Unified into `SYNTHETIC_REAL_CONFUSION` | Same confusion |
| `INSTITUTIONAL_APPEARANCE_WITHOUT_GOVERNANCE` | Unified into `VALIDATION_LABEL_MISUSE` | Same mislabeling |
| `EXPERIMENTAL_DATA_EXPOSURE` | Unified into `PROTOTYPE_IN_PRODUCT` | Same root cause |

### 6.3 Final Consolidated Pattern List

| # | Pattern | Level | Areas |
|---|---------|-------|-------|
| 1 | `DATA_MODEL_ABSENCE` | Causa radice | All |
| 2 | `PROCESS_MODEL_ABSENCE` | Causa radice | A03, A04, A07 |
| 3 | `AREA_ISOLATION` | Causa radice | All |
| 4 | `PROTOTYPE_IN_PRODUCT` | Causa radice | A02, A03, A04 |
| 5 | `DOCUMENT_MODEL_ABSENCE` | Causa radice | A07 |
| 6 | `INSTITUTIONAL_CONFIG_ABSENCE` | Causa radice | A04, A07 |
| 7 | `UI_PRECEDES_DOMAIN` | Causa radice | All |
| 8 | `SOURCE_METADATA_ABSENCE` | Difetto sistemico | All (A11, A02, A03, A04, A07) |
| 9 | `VALIDATION_LABEL_MISUSE` | Difetto sistemico | A02, A03, A04, A07 |
| 10 | `TRANSFER_BREAK` | Difetto sistemico | A02→A04, A03→A04, A04→A07 |
| 11 | `SYNTHETIC_REAL_CONFUSION` | Difetto sistemico | A02, A04, A07 |
| 12 | `UI_READABILITY` | Sintomo | All 6 areas |

---

## 7. What Is Conservable

| Element | Current Value | Defects | Dependencies Missing | Reuse |
|---------|:------------:|---------|---------------------|:-----:|
| A03 old/new comparison UI | High | No metadata, no draft | Domain model | Con adattamento |
| A04 wizard flow (5 steps) | Medium | Missing obiettivi, no validation | Domain model, process model | Con adattamento |
| A04 ArchivioUdaView (filters, search) | Medium | Depends on UdaModel | Stable UDA entity | Diretto |
| A04 KnowledgeCompanionPanel | Medium | Static, not discipline-specific | Source metadata | Con adattamento |
| A04 clone + keyword realignment | Medium | — | Stable UDA entity | Diretto |
| A02 MappaView vertical timeline | Medium | No metadata, hardcoded badge | Domain model | Con adattamento |
| A02 AlberoView tree structure | Medium | No order selector, no detail | Domain model | Con adattamento |
| UI components (UiButton, UiPanel, etc.) | High | — | — | Diretto |
| Zustand store pattern | Medium | Flat key-value, no entities | Domain model | Con adattamento |
| localStorage fallback pattern | Medium | — | — | Diretto |
| DocumentExportHistory | Low | Unused by exports | Domain model | Con adattamento |
| Source signature computation | Low | Simple concatenation | Domain model | Con adattamento |
| Responsive layout (grid stacking) | Medium | Small fonts | — | Diretto |
| Confirmation dialogs | High | — | — | Diretto |
| CML import/export format | Medium | Snapshot, no versioning | Domain model | Con adattamento |

**Conclusion:** The product has useful UI patterns, component library, and interaction paradigms that can be preserved. The domain model, data architecture, and process logic must be rebuilt.

---

## 8. Functions to Hide

| Function | Risk | Condition to Keep | Condition to Hide | Condition to Reactivate |
|----------|------|-------------------|-------------------|------------------------|
| CML-631 Pilot | Teacher confusion | After proper labeling | **Now** — no experimental warning | After domain model exists |
| "Mappa Validata" badge | Misleading | When validation is real | **Now** — hardcoded, not data-driven | After process model |
| "Approvato 2025" label | Misleading as institutional | When approval workflow exists | **Now** — personal vote mislabeled | After process model |
| DOCX/ODF export | False format expectation | When real DOCX generation exists | **Now** — HTML in .doc wrapper | After document model |
| "Modelli con IA" (AI templates) | False AI claim | When real AI is integrated | **Now** — keyword matching | After AI integration |
| Synthetic document generators | Fabricated content | When real data populates them | **Now** — hard-coded text | After domain model |
| Programazione Annuale generator | Synthetic text | When UDA data flows in | **Now** — ignores real decisions | After transfer pipeline |
| Relazione generator | Synthetic text | When class data exists | **Now** — entirely hard-coded | After A05 integration |
| Documento Specifico generator | Synthetic text | When real assessment data exists | **Now** — synthetic observations | After A05 integration |

---

## 9. Overall Evaluation

| # | Dimension | Score | Evidence | Main Cause | Condition for ≥3 |
|---|-----------|:-----:|----------|------------|-------------------|
| 1 | Proposition clarity | 1 | No product purpose statement; teacher cannot understand what CurManLight is | UI_PRECEDES_DOMAIN | Product definition + onboarding |
| 2 | Data reliability | 0 | Zero metadata on any entity; hardcoded KB; synthetic content | DATA_MODEL_ABSENCE | Canonical data model |
| 3 | Source traceability | 0 | No source, date, version, or authority on any data item | DATA_MODEL_ABSENCE | Source entity model |
| 4 | Curriculum coherence | 1 | 14 disciplines present but no nucleiFondanti in UI, no order selector | DATA_MODEL_ABSENCE | Structured curriculum entities |
| 5 | Institutional process correctness | 0 | Personal votes labeled as approval; no roles; no workflow | PROCESS_MODEL_ABSENCE | Process model with states and roles |
| 6 | Cross-area continuity | 0 | No area produces structured output for the next | AREA_ISOLATION | Transfer pipeline |
| 7 | Persistence | 2 | Zustand+IndexedDB works; but flat key-value, no entities | DATA_MODEL_ABSENCE | Entity-based persistence |
| 8 | Recoverability | 1 | Decisions persist; but no history, no undo, no soft-delete | DATA_MODEL_ABSENCE | Entity versioning |
| 9 | Versioning | 0 | No versioning on any entity | DATA_MODEL_ABSENCE | Version model |
| 10 | Document reliability | 0 | HTML as DOCX; synthetic content; hardcoded identity; no states | DOCUMENT_MODEL_ABSENCE | Document entity model |
| 11 | Institutional identity | 0 | Hardcoded in 8+ locations; single-school only | INSTITUTIONAL_CONFIG_ABSENCE | Institute profile entity |
| 12 | Accessibility | 1 | 8-11px fonts; no heading hierarchy; no skip links; no tab roles | UI_PRECEDES_DOMAIN | Design system audit |
| 13 | Readability | 1 | Dense text; small fonts; jargon throughout; many competing elements | UI_PRECEDES_DOMAIN | Information architecture redesign |
| 14 | Teacher utility | 1 | Rich form builder exists but produces disconnected plain-text artifacts | TRANSFER_BREAK | End-to-end flow |
| 15 | Department utility | 0 | No multi-author support; no review workflow; no formal output | PROCESS_MODEL_ABSENCE | Process + document model |
| 16 | Curriculum referent utility | 0 | No institutional overview; no alignment verification; no approval chain | PROCESS_MODEL_ABSENCE | Process model |
| 17 | Security | 3 | Local-only storage; no server; no auth; XSS risk in exports | DOCUMENT_MODEL_ABSENCE | HTML escaping |
| 18 | Data integrity | 1 | No validation; no cross-field checks; flat key-value pairs | DATA_MODEL_ABSENCE | Schema validation |
| 19 | Product maturity | 0 | Prototypes in product; misleading labels; synthetic content | PROTOTYPE_IN_PRODUCT | Clean separation |
| 20 | Real validation readiness | 0 | Cannot test with real teachers while prototypes and synthetic data exist | PROTOTYPE_IN_PRODUCT | Phase 0 containment |

**Overall score: 12/100 (0.6/5)**

---

## 10. Overall Classification

```
CML_632H_PRODUCT_STRUCTURAL_REFOUNDATION
```

**Rationale:**

The product is not a failed prototype to be discarded. It contains:
- A functional React/TypeScript application with working build, tests, and persistence
- Useful UI components and interaction patterns
- Real curriculum data (14 disciplines × 3 orders with traguardi, obiettivi, proposals)
- A working wizard for UDA creation
- A functional gap revision interface with old/new comparison
- Responsive layout and component library

However, the **domain model is absent**. Data exists as hardcoded text and flat key-value pairs. No entity has stable identity, metadata, versions, or relationships. Areas are isolated modules with no data transfer. The process model is absent — personal votes are labeled as institutional approvals. The document model is absent — exports are HTML wrapped in misleading extensions.

The product can be recovered **without a complete rewrite** by:
1. Defining a canonical domain model (entities, relationships, metadata)
2. Rebuilding the data layer on top of existing UI patterns
3. Connecting areas through structured data transfer
4. Implementing a real process model with states and roles
5. Building a document model with persistence and versioning
6. Configuring institutional identity as data, not code

This is **structural refoundation**, not incremental recovery (the foundations are missing) and not a complete rebuild (the UI layer is largely usable).

---

## 11. Recommended Next Step

```
CML-633 — Product Foundation Redesign
```

The synthesis demonstrates that all 6 audited areas share the same 7 root causes. No area can be fixed independently. The next step must be a domain model definition and data architecture redesign that provides the foundation for all subsequent work.

---

## 12. Technical Verification

| Check | Result | Notes |
|-------|--------|-------|
| `git status --short` | Clean (branch only) | No product files modified |
| `git diff --check` | Clean | No whitespace errors |
| `npx tsc --noEmit` | PASS | 0 errors |
| `npx vitest run` | 13/14 pass | 1 timeout (pilot-evaluation — pre-existing) |
| `npm run build` | PASS | No regression |

**Product modified:** No
**Push/merge/publication:** Not executed
