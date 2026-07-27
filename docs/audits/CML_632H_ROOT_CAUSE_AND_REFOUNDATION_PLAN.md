# CML-632H — Root Cause Analysis & Refoundation Plan

## Metadata

| Field | Value |
|-------|-------|
| Parent | CML-632H Cross-Area Structural Synthesis |
| Date | 2026-07-27 |
| Classification | CML_632H_PRODUCT_STRUCTURAL_REFOUNDATION |

---

## 1. Root Causes

### RC-01: Absence of a Canonical Data Model

**Status:** CONFIRMED  
**Priority:** P0  
**Type:** Riprogettazione del dominio  
**Areas affected:** All (A01, A11, A02, A03, A04, A07)

**Evidence:**
- `curriculumKB.ts` — 1075 lines of static TypeScript; no entity IDs, no dates, no versions
- `UdaModel` — plain text arrays for traguardi/obiettivi/evidenze; no source metadata
- `useCurriculumStore` — flat key-value pairs (`decisions: Record<string, string>`)
- Draft fields saved as individual localStorage keys, not structured objects

**Derived patterns:**
- `SOURCE_METADATA_ABSENCE` (5 areas)
- `OUTPUT_DATA_LOSS` (A04, A07)
- `NO_DECISION_TRACEABILITY` (A03, A04)
- `DOCUMENT_VERSIONING_ABSENCE` (A07)
- `UNSAFE_HTML_EXPORT` (A07)

**Intervention required:** Domain model redesign — define entities with stable IDs, metadata, versions, and relationships.

---

### RC-02: Absence of an Institutional Process Model

**Status:** CONFIRMED  
**Priority:** P0  
**Type:** Riprogettazione del dominio  
**Areas affected:** A03, A04, A07

**Evidence:**
- `DecisionStatus` = `'approved' | 'rejected' | 'custom'` — 3 states only
- No draft, pending, departmental, referente, or collegio states
- No author, timestamp, rationale, or history on decisions
- ProcessoTab describes 6 roles but enforces none
- "Approvato 2025" label on personal votes
- "Pipeline di Validazione" is descriptive only

**Derived patterns:**
- `VALIDATION_LABEL_MISUSE` (4 areas)
- `PROCESS_STATE_AMBIGUITY` (A03, ProcessoTab)

**Intervention required:** Process model with real states, roles, authority, and audit trail.

---

### RC-03: Areas Designed as Isolated Modules

**Status:** CONFIRMED  
**Priority:** P0  
**Type:** Riprogettazione del prodotto  
**Areas affected:** All

**Evidence:**
- A11 → A02: No connection (Fonti view is completely isolated)
- A02 → A03: Visual only (same proposals, different views)
- A02/A03 → A04: Shared store state but reset on discipline/order change
- A04 → A07: `savedUda` not consumed by document generators
- No area produces structured output for the next area

**Derived patterns:**
- `AREA_ISOLATION` (all 6 areas)
- `TRANSFER_BREAK` (A02→A04, A03→A04, A04→A07)

**Intervention required:** Transfer pipeline — each area must produce and consume structured data.

---

### RC-04: Prototypes Remained in Product

**Status:** CONFIRMED  
**Priority:** P1  
**Type:** Contenimento  
**Areas affected:** A02, A03, A04

**Evidence:**
- CML-631 pilot still accessible via "★ Pilota Sperimentale" sidebar
- Synthetic UDAs in A04 timeline labeled "Riusa ed Importa d'Istituto"
- 3 suggested UDAs indistinguishable from real content
- "Mappa Validata" hardcoded badge
- "Pilota Sperimentale" appears as regular sidebar item

**Derived patterns:**
- `PROTOTYPE_IN_PRODUCT` (3 areas)
- `SYNTHETIC_REAL_CONFUSION` (3 areas)

**Intervention required:** Phase 0 containment — hide experimental features, label synthetic content, remove misleading badges.

---

### RC-05: Absence of a Document Model

**Status:** CONFIRMED  
**Priority:** P1  
**Type:** Riprogettazione del dominio  
**Areas affected:** A07

**Evidence:**
- Documents generated on-the-fly into `generatedDocText` (string in App state)
- No `Document` entity, no states, no versioning, no archive
- HTML wrapped in .doc/.odt extensions
- Template engine is keyword matching, not AI
- Export buttons that only show toast notifications
- Preview uses React components; exports use raw HTML

**Derived patterns:**
- `DOCUMENT_MODEL_ABSENCE` (A07)
- `PREVIEW_EXPORT_DIVERGENCE` (A07)

**Intervention required:** Document entity model with states, versioning, persistence, and real export formats.

---

### RC-06: Absence of Institutional Configuration

**Status:** CONFIRMED  
**Priority:** P1  
**Type:** Riprogettazione del dominio  
**Areas affected:** A04, A07

**Evidence:**
- "ISTITUTO COMPRENSIVO CALVARIO-COVOTTA \"DON LORENZO MILANI\"" in 8+ locations
- `AVIC849003` codice meccanografico hardcoded
- "Prof.ssa Maria Letizia CML" hardcoded as principal
- "MINISTERO DELL'ISTRUZIONE E DEL MERITO" hardcoded in exports
- Different school name variants: "I.C. don Lorenzo Milani", "IC Calvario-Covotta"

**Derived patterns:**
- `HARDCODED_INSTITUTIONAL_IDENTITY` (A04, A07)

**Intervention required:** Institute profile entity — configurable school identity, logo, principal, codice meccanografico.

---

### RC-07: UI Architecture Precedes Domain Model

**Status:** CONFIRMED  
**Priority:** P2  
**Type:** Riprogettazione del prodotto  
**Areas affected:** All

**Evidence:**
- `ProgettazioneTabProps` has 80+ properties
- 11+ sidebar tabs with sub-menus
- Frozen modules exposed as regular items
- Dense text, 8-11px fonts, jargon throughout
- No product purpose statement on home view
- No onboarding, no tour, no guided first step

**Derived patterns:**
- `UI_READABILITY` (all 6 areas)
- `WORK_RECOVERY_DEFECT` (A04)

**Intervention required:** Information architecture redesign — reduce cognitive load, clarify product purpose, improve typography.

---

## 2. Future Domain Model

### 2.1 Core Entities

| Entity | Description | Key Fields |
|--------|-------------|------------|
| **Institute** | School identity | name, codMeccanografico, codFiscale, address, principal, logo, regionalOffice |
| **AcademicYear** | School year | year, startDate, endDate, status |
| **SchoolOrder** | Educational level | infanzia, primaria, secondaria |
| **Discipline** | Subject area | key, label, hasProposals |
| **Source** | Normative/institutional reference | id, title, type (normativa/istituzionale/operativa), authority, date, version, url, status |
| **CurriculumItem** | Traguardo or obiettivo | id, sourceId, discipline, order, type, text, version, nucleo |
| **Proposal** | Gap revision entry | id, curriculumItemId, sourceOld, sourceNew, focus, notes, status |
| **Decision** | Teacher/institutional choice | id, proposalId, author, role, timestamp, status, rationale, authority |
| **UdaModel** | Teaching design unit | id, title, discipline, order, period, hours, status, traguardi[], obiettivi[], evidenze[], realTask, notes, rubrica[], competenze[], valutazione, version |
| **Document** | Generated/exported artifact | id, type, title, content, status, version, sourceRefs[], createdAt, updatedAt, author |
| **DocumentVersion** | Version snapshot | id, documentId, version, content, createdAt, author |
| **ExportEvent** | Export log | id, documentId, format, exportedAt, sourceSignature, coherence |

### 2.2 Relationships

```
Institute 1──N AcademicYear
AcademicYear 1──N Discipline
Discipline 1──N CurriculumItem
Source 1──N CurriculumItem
CurriculumItem 1──N Proposal
Proposal 1──N Decision
CurriculumItem 1──N UdaModel (traguardi refs)
UdaModel 1──N Document
Document 1──N DocumentVersion
Document 1──N ExportEvent
```

### 2.3 State Machines

**Proposal/Decision states:**
```
bozza → in_revisione → proposto_dipartimento → proposto_referente → approvato_collegio
                    ↘ respinto
                    ↘ personalizzato
```

**UDA states:**
```
bozza → in_completamento → pronta_per_verifica → validata → archiviata
```

**Document states:**
```
bozza → completato → approvato → pubblicato → archiviato
```

---

## 3. Future End-to-End Flow

```text
1. Fonte (A11)
   Attore: Referente curricolo
   Azione: Importa/referenzia normativa
   Uscita: Source entity con metadata

2. Elemento curricolare (A02)
   Attore: Referente curricolo
   Azione: Consulta traguardi/obiettivi con fonte collegata
   Uscita: CurriculumItem selezionati con sourceRefs

3. Proposta di revisione (A03)
   Attore: Docente/dipartimento
   Azione: Confronta vecchio vs nuovo testo, motiva scelta
   Uscita: Decision con autore, data, motivazione, autorità

4. Progettazione (A04)
   Attore: Docente
   Azione: Crea UDA usando elementi curricolari identificati
   Uscita: UdaModel con sourceRefs, traguardi refs, obiettivi refs

5. Documento (A07)
   Attore: Docente/referente
   Azione: Genera documento da UDA o programmazione
   Uscita: Document con versioni, fonti, decisioni collegate

6. Approvazione
   Attore: Dirigente/referente
   Azione: Revisione e approvazione documento
   Uscita: Document status → approvato

7. Archivio
   Attore: Sistema
   Azione: Conserva versione finale
   Uscita: Document archiviato con audit trail
```

---

## 4. Refoundation Plan

### Phase 0 — Contenimento

**Objective:** Hide prototypes, remove misleading labels, prevent harmful exports.  
**Prerequisites:** None.  
**Areas:** All (navigation, A02, A03, A04, A07).  
**Criteria:** No teacher encounters synthetic data as real, no misleading labels, no experimental features without warning.

| Intervention | Problem | Risk if Deferred |
|-------------|---------|-----------------|
| Hide CML-631 pilot from sidebar | Experimental data exposed | Teachers build on unstable foundation |
| Remove "Mappa Validata" badge | Hardcoded validation | Misleading trust |
| Relabel "Approvato 2025" to "Scelta personale" | Personal vote = institutional approval | False institutional claims |
| Hide DOCX/ODF export until real format | HTML as .doc | Broken documents in Word |
| Label synthetic document content | Hard-coded text in generators | Fabricated institutional documents |
| Remove "IA" from template engine label | Keyword matching = AI | False capability claim |
| Disable export buttons that are stubs | Toast-only functions | Broken user trust |

### Phase 1 — Fondazione Dati

**Objective:** Define canonical domain model, implement entities with metadata, migrate existing data.  
**Prerequisites:** Phase 0 complete.  
**Areas:** Data layer (new), A11, A02.  
**Criteria:** Every curriculum item has source, date, version; every decision has author and timestamp; stable entity IDs exist.

| Intervention | Problem | Dependencies |
|-------------|---------|-------------|
| Define Institute entity | Hardcoded school identity | None |
| Define Source entity with metadata | No source data | None |
| Define CurriculumItem entity | Plain text arrays | Source entity |
| Define Proposal entity | Flat key-value | CurriculumItem entity |
| Define Decision entity | No traceability | Proposal entity |
| Implement entity persistence (Zustand + IndexedDB) | Flat key-value store | Entity definitions |
| Migrate curriculumKB to entity instances | Hardcoded static data | Entity persistence |
| Add institute profile configuration | Hardcoded identity | Institute entity |

### Phase 2 — Processo e Governance

**Objective:** Implement real workflow states, roles, authority, and audit trail.  
**Prerequisites:** Phase 1 complete.  
**Areas:** A03, ProcessoTab.  
**Criteria:** Decisions have author, role, timestamp, rationale; states represent real workflow; roles are enforced.

| Intervention | Problem | Dependencies |
|-------------|---------|-------------|
| Implement Decision state machine | 3 flat states | Decision entity |
| Add author/role/timestamp to decisions | No traceability | Decision entity |
| Implement role-based access | No enforcement | Process model |
| Add rationale field to decisions | No motivation | Decision entity |
| Add decision history | No audit trail | Decision entity |
| Connect ProcessoTab to real data | Descriptive only | Process model |

### Phase 3 — Continuità tra Aree

**Objective:** Connect areas through structured data transfer.  
**Prerequisites:** Phases 1-2 complete.  
**Areas:** A02→A04, A03→A04, A04→A07.  
**Criteria:** Selection in A02 produces structured output consumed by A04; decisions in A03 flow to A04 and A07; UDA data flows to A07.

| Intervention | Problem | Dependencies |
|-------------|---------|-------------|
| A02 → A04 selection transfer | Shared store, no structure | CurriculumItem entity |
| A03 → A04 decision transfer | No integration | Decision entity |
| A04 → A07 UDA transfer | savedUda not consumed | UdaModel entity with refs |
| A11 → A02 source connection | Isolated | Source entity |
| A03 → A07 decision inclusion in docs | Only in .cml | Decision + Document entities |

### Phase 4 — Documenti

**Objective:** Implement document entity model with persistence, versioning, and real export.  
**Prerequisites:** Phase 3 complete.  
**Areas:** A07.  
**Criteria:** Documents are entities with states and versions; exports produce real DOCX/PDF; institute identity is configurable.

| Intervention | Problem | Dependencies |
|-------------|---------|-------------|
| Define Document entity | Generated on-the-fly | Domain model |
| Implement document states | No states | Process model |
| Implement document versioning | No versioning | Document entity |
| Implement document archive | No persistence | Document entity |
| Real DOCX generation (docx library) | HTML as .doc | Document entity |
| Real PDF generation (jsPDF/puppeteer) | print-based | Document entity |
| Configure institute identity | Hardcoded | Institute entity |
| Connect generators to real data | Synthetic text | Transfer pipeline |
| HTML escaping in exports | XSS risk | Document entity |

### Phase 5 — Esperienza Utente

**Objective:** Reduce cognitive load, clarify product purpose, improve accessibility.  
**Prerequisites:** Phases 0-4 complete.  
**Areas:** All.  
**Criteria:** Product purpose clear on first access; fonts ≥12px; heading hierarchy; skip links; real terminology.

| Intervention | Problem | Dependencies |
|-------------|---------|-------------|
| Product purpose statement on home | No identity | Product definition |
| Onboarding flow | No guided first step | Product definition |
| Font size ≥12px across all views | 8-11px | Design system |
| Heading hierarchy (h1→h2→h3) | No structure | Design system |
| Replace jargon with plain language | Technical terms | Content review |
| Separate experimental from production | Mixed visibility | Phase 0 |
| Reduce ProgettazioneTab props (80+) | UI_PRECEDES_DOMAIN | Domain model |

### Phase 6 — Validazione Reale

**Objective:** Test with real teachers, departments, and curriculum referents.  
**Prerequisites:** Phases 0-5 complete.  
**Areas:** All.  
**Criteria:** Teachers can complete end-to-end flow; departments can review and approve; documents are institutionally valid.

| Intervention | Problem | Dependencies |
|-------------|---------|-------------|
| Teacher testing (individual) | No real validation | Phase 5 |
| Department testing (group) | No departmental workflow | Phase 2 |
| Curriculum referent testing | No institutional oversight | Phase 2 |
| Document validation | No real documents | Phase 4 |
| Institutional flow verification | No real process | Phase 2 |

---

## 5. Priority Ranking

| Priority | Intervention | Problem | Root Cause | Areas | Risk if Deferred | User Value | Complexity |
|----------|-------------|---------|------------|-------|-----------------|------------|------------|
| **P0** | Hide CML-631 pilot | Experimental exposure | RC-04 | A02, A03, A04 | Teacher confusion | High | Low |
| **P0** | Remove misleading labels | False validation | RC-02 | A02, A03, A07 | False institutional claims | High | Low |
| **P0** | Hide fake DOCX/ODF exports | HTML as .doc | RC-05 | A07 | Broken documents | High | Low |
| **P0** | Label synthetic content | Real/synthetic confusion | RC-04 | A04, A07 | Fabricated content | High | Low |
| **P0** | Define Institute entity | Hardcoded identity | RC-06 | A04, A07 | Single-school only | High | Medium |
| **P1** | Define Source entity | No source data | RC-01 | A11, A02 | No traceability | High | Medium |
| **P1** | Define CurriculumItem entity | Plain text arrays | RC-01 | A02, A03, A04 | No structure | High | High |
| **P1** | Define Decision entity | No traceability | RC-02 | A03 | No audit trail | High | Medium |
| **P1** | Implement entity persistence | Flat key-value | RC-01 | All | No versioning | High | High |
| **P1** | Migrate curriculumKB | Hardcoded data | RC-01 | A02 | No metadata | High | Medium |
| **P2** | A02→A04 transfer | No continuity | RC-03 | A02, A04 | Redundant work | High | Medium |
| **P2** | A03→A04 transfer | No integration | RC-03 | A03, A04 | Decisions ignored | High | Medium |
| **P2** | A04→A07 transfer | No document flow | RC-03 | A04, A07 | No formal output | High | Medium |
| **P2** | Implement Decision state machine | 3 flat states | RC-02 | A03 | No workflow | High | Medium |
| **P3** | Define Document entity | Generated on-the-fly | RC-05 | A07 | No persistence | High | High |
| **P3** | Real DOCX generation | HTML as .doc | RC-05 | A07 | Broken exports | Medium | High |
| **P3** | Real PDF generation | print-based | RC-05 | A07 | Poor quality | Medium | Medium |
| **P3** | Connect generators to real data | Synthetic text | RC-04, RC-05 | A07 | Fabricated documents | High | High |
| **P4** | Product purpose statement | No identity | RC-07 | A01 | Confused teachers | High | Low |
| **P4** | Onboarding flow | No guided start | RC-07 | A01 | Abandonment | High | Medium |
| **P4** | Font size ≥12px | WCAG violation | RC-07 | All | Exclusion | Medium | Low |
| **P4** | Replace jargon | Technical language | RC-07 | All | Confusion | Medium | Medium |
| **P4** | Reduce ProgettazioneTab props | UI complexity | RC-07 | A04 | Maintenance burden | Medium | High |

---

## 6. Remaining Audits Decision

| Area | Value | Known Patterns | Risk | Dependency | Decision |
|------|-------|---------------|------|------------|----------|
| A05 Process & Consent | Low | Already analyzed in A03 (ProcessoTab) | Low | Phase 1-2 | **Rinviare** — already covered in A03 audit |
| A06 Classroom & Social | Low | Embedded in A04; no data flow | Low | Phase 1-3 | **Rinviare** — covered in A04 audit |
| A08 Teacher Workspace | Medium | Cross-cutting persistence | Low | Phase 1 | **Eseguire in forma ridotta** — persistence patterns only |
| A09 Copilot & AI | Medium | Experimental; Ollama integration | Low | Phase 4+ | **Rinviare** — depends on domain model |
| A10 Second Brain | Medium | WikiLLM, KB, glossary | Low | Phase 4+ | **Rinviare** — depends on domain model |
| A12 User Guide | Low | Static content | None | None | **Rinviare** — no structural value |
| A13 PA Certification | Low | Shares view with esportazioni | Low | Phase 3-4 | **Rinviare** — depends on document model |

**Recommendation:** No additional audits before refoundation. All remaining areas share the same root causes already identified. Auditing them would produce predictable findings (isolation, no metadata, no process) without adding structural insight.

---

## 7. Conclusion

The product is recoverable. The UI layer, component library, responsive layout, and interaction patterns provide a solid foundation. The domain model, data architecture, and process logic must be rebuilt on this foundation.

The recommended next step is **CML-633 — Product Foundation Redesign**, which should:

1. Start with Phase 0 (containment) — immediate, low-effort, high-value
2. Define the domain model (Phase 1) — the critical dependency for all subsequent work
3. Connect areas (Phase 3) — the highest user value
4. Build document model (Phase 4) — the concrete output teachers need
5. Improve UX (Phase 5) — the adoption enabler

The estimated scope is significant but bounded. The product does not need to be rewritten from scratch — it needs its foundations rebuilt while preserving the usable UI layer.
