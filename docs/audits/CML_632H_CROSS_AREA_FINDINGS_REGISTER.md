# CML-632H — Cross-Area Findings Register

> Consolidated register of all findings across CML-632 audits, unified by root cause.

---

## Pattern Registry

### P1: DATA_MODEL_ABSENCE

**Level:** Causa radice  
**Status:** Confermato  
**Root cause:** RC-01  
**Areas:** All (A01, A11, A02, A03, A04, A07)

**Definizione:** No canonical entity model exists. Data is stored as static TypeScript objects, flat key-value pairs, or plain text arrays. No entity has stable identity, source metadata, dates, versions, or relationships.

**Evidenze:**
- `curriculumKB.ts` — 1075 lines of hardcoded data; no entity IDs
- `UdaModel.traguardi: string[]` — plain text, no source refs
- `useCurriculumStore.decisions: Record<string, string>` — flat key-value
- Draft fields as individual localStorage keys
- No `Document` entity in A07

**Pattern derivati:** SOURCE_METADATA_ABSENCE, OUTPUT_DATA_LOSS, NO_DECISION_TRACEABILITY, DOCUMENT_VERSIONING_ABSENCE, UNSAFE_HTML_EXPORT  
**Intervento:** Domain model redesign  
**Priorità:** P0

---

### P2: PROCESS_MODEL_ABSENCE

**Level:** Causa radice  
**Status:** Confermato  
**Root cause:** RC-02  
**Areas:** A03, A04, A07

**Definizione:** No workflow states, no role enforcement, no approval chain, no audit trail. Personal votes are labeled as institutional approvals.

**Evidenze:**
- `DecisionStatus` = 3 states only
- ProcessoTab describes 6 roles, enforces none
- "Approvato 2025" on personal votes
- "Pipeline di Validazione" is descriptive only
- No author, timestamp, or rationale on decisions

**Pattern derivati:** VALIDATION_LABEL_MISUSE, PROCESS_STATE_AMBIGUITY  
**Intervento:** Process model with states, roles, authority  
**Priorità:** P0

---

### P3: AREA_ISOLATION

**Level:** Causa radice  
**Status:** Confermato  
**Root cause:** RC-03  
**Areas:** All

**Definizione:** Areas were built independently. No area produces structured output that the next area consumes. Integration is limited to shared Zustand store keys.

**Evidenze:**
- A11 → A02: No connection
- A02 → A03: Visual only
- A02/A03 → A04: Store shared, reset on change
- A04 → A07: `savedUda` not consumed

**Pattern derivati:** TRANSFER_BREAK, NO_CURRICULUM_TO_DESIGN_TRANSFER, NO_DESIGN_TO_DOCUMENT_TRANSFER  
**Intervento:** Transfer pipeline  
**Priorità:** P0

---

### P4: PROTOTYPE_IN_PRODUCT

**Level:** Causa radice  
**Status:** Confermato  
**Root cause:** RC-04  
**Areas:** A02, A03, A04

**Definizione:** Experimental features (CML-631 pilot) are exposed as regular product capabilities. Synthetic data is indistinguishable from real content.

**Evidenze:**
- "★ Pilota Sperimentale" in sidebar as regular item
- 3 suggested UDAs in A04 timeline
- Synthetic document text in A07 generators
- No experimental warning labels

**Pattern derivati:** SYNTHETIC_REAL_CONFUSION  
**Intervento:** Phase 0 containment  
**Priorità:** P1

---

### P5: DOCUMENT_MODEL_ABSENCE

**Level:** Causa radice  
**Status:** Confermato  
**Root cause:** RC-05  
**Areas:** A07

**Definizione:** Documents are generated on-the-fly, not persisted as entities. No states, no versioning, no archive. Exports are HTML wrapped in misleading extensions.

**Evidenze:**
- `generatedDocText` is a string in App state
- No `Document` entity type
- HTML as .doc/.odt
- Template "AI" is keyword matching
- Export buttons are toast-only stubs

**Pattern derivati:** PREVIEW_EXPORT_DIVERGENCE  
**Intervento:** Document entity model  
**Priorità:** P1

---

### P6: INSTITUTIONAL_CONFIG_ABSENCE

**Level:** Causa radice  
**Status:** Confermato  
**Root cause:** RC-06  
**Areas:** A04, A07

**Definizione:** School identity is hardcoded in 8+ locations. Product is single-school only.

**Evidenze:**
- "ISTITUTO COMPRENSIVO CALVARIO-COVOTTA" in 6+ locations
- `AVIC849003` codice meccanografico hardcoded
- "Prof.ssa Maria Letizia CML" hardcoded
- Different name variants across files

**Pattern derivati:** HARDCODED_INSTITUTIONAL_IDENTITY  
**Intervento:** Institute profile entity  
**Priorità:** P1

---

### P7: UI_PRECEDES_DOMAIN

**Level:** Causa radice  
**Status:** Confermato  
**Root cause:** RC-07  
**Areas:** All

**Definizione:** UI complexity reflects accumulated features, not a coherent domain model. 80+ props, 11+ tabs, small fonts, jargon, no product identity.

**Evidenze:**
- `ProgettazioneTabProps` — 80+ properties
- 8-11px fonts across all areas
- No product purpose statement
- No onboarding, no tour
- Technical jargon throughout

**Pattern derivati:** UI_READABILITY, WORK_RECOVERY_DEFECT  
**Intervento:** Information architecture redesign  
**Priorità:** P2

---

### P8: SOURCE_METADATA_ABSENCE

**Level:** Difetto sistemico  
**Status:** Confermato  
**Root cause:** RC-01  
**Areas:** A11, A02, A03, A04, A07

**Definizione:** No data item in the system has source, date, version, or authority metadata.

**Evidenze:**
- InfoViews: 4 panels with zero metadata
- curriculumKB: no source, date, version
- Proposals: `oldText`/`newText` only
- UdaModel: plain text arrays
- Exports: no source citations

**Intervento:** Source entity + metadata on all entities  
**Priorità:** P1

---

### P9: VALIDATION_LABEL_MISUSE

**Level:** Difetto sistemico  
**Status:** Confermato  
**Root cause:** RC-02  
**Areas:** A02, A03, A04, A07

**Definizione:** Status labels do not correspond to real data states.

**Evidenze:**
- "Mappa Validata" — hardcoded, not data-driven
- "Approvato 2025" — personal vote, not institutional
- `validata`/`archiviata` UDA statuses — never set
- "Pipeline di Validazione" — descriptive only
- Synthetic content labeled as institutional

**Intervento:** Real state machine with data-driven labels  
**Priorità:** P0

---

### P10: TRANSFER_BREAK

**Level:** Difetto sistemico  
**Status:** Confermato  
**Root cause:** RC-03  
**Areas:** A02→A04, A03→A04, A04→A07

**Definizione:** Data is lost or not transferred between areas.

**Evidenze:**
- A02 selections reset on discipline/order change
- A03 decisions not consumed by A04 or A07
- A04 UDA data not consumed by A07 generators
- A07 generators produce synthetic text instead of using real data
- Source metadata lost at every transition

**Intervento:** Structured transfer pipeline  
**Priorità:** P2

---

### P11: SYNTHETIC_REAL_CONFUSION

**Level:** Difetto sistemico  
**Status:** Confermato  
**Root cause:** RC-04  
**Areas:** A02, A04, A07

**Definizione:** Synthetic/auto-generated content is indistinguishable from real data.

**Evidenze:**
- Suggested UDAs in A04 timeline
- Synthetic document text in A07 generators
- "Mappa Validata" badge on unsourced data
- Knowledge Companion references from static volumesKB
- Hard-coded class descriptions in Relazione generator

**Intervento:** Label synthetic content; separate experimental from production  
**Priorità:** P1

---

### P12: UI_READABILITY

**Level:** Sintomo  
**Status:** Confermato  
**Root cause:** RC-07  
**Areas:** All 6 areas

**Definizione:** 8-11px fonts, dense text, jargon, no heading hierarchy, no skip links.

**Evidenze:**
- `text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]` throughout
- No `<h1>` on any view
- Technical terms: "PTOF Hub", "UDA Compilatore", "SCORM zip packer", "Swarm di Esperti"
- No skip-to-content links
- No `role="tab"` on tab buttons

**Intervento:** Design system + typography audit  
**Priorità:** P4

---

## Findings Count

| Level | Count |
|-------|-------|
| Causa radice | 7 |
| Difetto sistemico | 4 |
| Sintomo | 1 |
| **Total patterns** | **12** |

| Status | Count |
|--------|-------|
| Confermato | 12 |
| Consolidato | 16 (retired into above) |
| **Net patterns** | **12** |

### Retired Patterns

| Original | Unified Into | Reason |
|----------|-------------|--------|
| UNVERIFIED_VALIDATION_LABELS | VALIDATION_LABEL_MISUSE | Same root cause |
| PROCESS_STATE_AMBIGUITY | PROCESS_MODEL_ABSENCE | Symptom |
| NO_DECISION_TRACEABILITY | SOURCE_METADATA_ABSENCE | No metadata |
| NO_CURRICULUM_TO_DESIGN_TRANSFER | TRANSFER_BREAK | Same isolation |
| NO_DESIGN_TO_DOCUMENT_TRANSFER | TRANSFER_BREAK | Same isolation |
| FALSE_COMPLETENESS | SYNTHETIC_REAL_CONFUSION | Same confusion |
| UNTRACEABLE_ASSISTED_CONTENT | SOURCE_METADATA_ABSENCE | No metadata |
| WORK_RECOVERY_DEFECT | DATA_MODEL_ABSENCE | No entities |
| OUTPUT_DATA_LOSS | TRANSFER_BREAK | Data lost at transitions |
| UNSAFE_HTML_EXPORT | DOCUMENT_MODEL_ABSENCE | No proper model |
| PREVIEW_EXPORT_DIVERGENCE | DOCUMENT_MODEL_ABSENCE | No shared pipeline |
| DOCUMENT_VERSIONING_ABSENCE | DOCUMENT_MODEL_ABSENCE | No entity |
| UNRELIABLE_DOCUMENT_STATUS | DOCUMENT_MODEL_ABSENCE | No states |
| SYNTHETIC_CONTENT_FORMALIZATION | SYNTHETIC_REAL_CONFUSION | Same confusion |
| INSTITUTIONAL_APPEARANCE_WITHOUT_GOVERNANCE | VALIDATION_LABEL_MISUSE | Same mislabeling |
| EXPERIMENTAL_DATA_EXPOSURE | PROTOTYPE_IN_PRODUCT | Same root cause |
