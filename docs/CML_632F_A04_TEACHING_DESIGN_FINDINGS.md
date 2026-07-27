# CML-632F — Findings: A04 Teaching Design

## Verdict

```
CML_632F_A04_TEACHING_DESIGN_REDESIGN
```

---

## Summary

A04 is the largest area in CurManLight, comprising 5 sub-tabs (Progettatore, Archivio UDA, Matrice Competenze, Bacheca Social, Registro & Classe). The Progettatore offers a 5-step wizard and 3-column grid for creating Units of Learning (UDA). Despite its breadth, the area has **structural isolation** from A02 and A03 (no real curriculum transfer), **no metadata traceability** on selections, a **Knowledge Companion** that provides curated but unverifiable references, and **no reliable document output** beyond clipboard text. The `UdaModel` stores traguardi/obiettivi/evidenze as plain text arrays — once generated, the link to their curriculum source is permanently lost.

**12 of 30 dimensions scored below 3. 11 findings rated Blocking or Significant.**

---

## Blocking Findings

### B-1: No curriculum-to-design transfer

**Area:** A04→A02/A03 | **Dimension:** Integration | **Severity:** Blocking

`selectedTraguardi` and `selectedObiettivi` are store-level indices into `localCurriculum[discipline][order].traguardi/obiettivi`. When the user changes discipline or order, the store resets these selections to `[0]` (lines 120-143 of `useCurriculumStore.ts`). There is no mechanism to:

1. Transfer a selection made in A02 MappaView to A04 Progettatore
2. Import a revision decision from A03 into A04
3. Preserve selections across discipline/order changes

The selections in A04 are **independent** of A02. A teacher must re-select everything in A04 from scratch.

**Consequence:** The curriculum consultation (A02) and revision (A03) areas produce no operational input for teaching design. The teacher repeats work.

**Recommendation:** Implement a transfer protocol: A02 selections → A04 pre-fill. A03 approved proposals → A04 flagged items.

---

### B-2: UdaModel loses all source metadata on generation

**Area:** A04 | **Dimension:** Data integrity | **Severity:** Blocking

When `handleGenerateUda` creates a `UdaModel` (line 133-160 of `useUdaProgrammingHandlers.ts`), it copies traguardi/obiettivi/evidenze as **plain text strings**:

```typescript
traguardi: selectedTraguardi.map(idx => currentData.traguardi[idx]),
obiettivi: selectedObiettivi.map(idx => currentData.obiettivi[idx]),
evidenze: [...selectedEvidenze],
```

After generation, the UDA contains only the text — no index, no source discipline, no order, no curriculum version, no decision reference. The link to the curriculum is permanently severed.

**Consequence:** A generated UDA cannot be traced back to its curricular source. No audit trail. No version control.

**Recommendation:** Store source metadata alongside text: `{ text, sourceIndex, sourceDiscipline, sourceOrder, curriculumVersion }`.

---

### B-3: No draft/completed/archived state machine

**Area:** A04 | **Dimension:** Persistence | **Severity:** Blocking

`UdaModel.status` has 5 values: `bozza`, `in revisione`, `pronta per confronto`, `validata`, `archiviata`. However:

- `handleGenerateUda` always sets `status: 'bozza'` (line 148)
- No UI transitions exist to move from `bozza` → `in revisione` → `validata` → `archiviata`
- The `validata` and `archiviata` states are defined in the type but never set by any code path
- The filter in ArchivioUdaView shows `bozza`, `in revisione`, `pronta per confronto` — but not `validata` or `archiviata`

**Consequence:** The state machine is incomplete. UDAs remain forever in `bozza`. The `validata` and `archiviata` states are dead code.

**Recommendation:** Implement state transitions with UI controls. Or remove unused states to avoid confusion.

---

### B-4: Knowledge Companion references are curated, not verifiable

**Area:** A04 | **Dimension:** Traceability | **Severity:** Blocking

`useKnowledgeCompanion` (lines 20-104) provides references from `volumesKB` for wizard steps 2-4. Each reference has `volumeId`, `category`, `title`, `excerpt`, `relevance`. However:

1. References are **hardcoded per step** — not dynamically generated from the actual curriculum data
2. The `volumeId` maps to a static HTML blob in `volumesKB` — no version, no date, no authority
3. References don't change based on the specific discipline or selections made
4. The "Curricolo" category references `vol4` and `vol8` — generic volumes, not discipline-specific

**Consequence:** A teacher sees references that may not be directly relevant to their specific discipline or selections. The references cannot be verified against an authoritative source.

**Recommendation:** Generate references dynamically from the actual curriculum data. Add source metadata (date, version, authority).

---

### B-5: No work recovery mechanism

**Area:** A04 | **Dimension:** Recoverability | **Severity:** Blocking

`saveProgDraft` (line 61-70 of `useUdaProgrammingHandlers.ts`) saves to `localStorage` keys `curman_progTitle`, `curman_progPeriod`, etc. — individual field values, not a structured draft. There is:

- No draft versioning
- No undo for "Genera UDA" (which clears the form implicitly by switching to 'uda' tab)
- No recovery for deleted UDAs (`deleteUda` is permanent, only guarded by a confirm dialog)
- No history of changes

**Consequence:** A teacher who accidentally generates or deletes loses work permanently.

**Recommendation:** Implement draft versioning. Add undo for generation. Add soft-delete with recovery.

---

### B-6: Hardcoded school identity in exports

**Area:** A04 | **Dimension:** Data integrity | **Severity:** Blocking

Multiple locations contain hardcoded school identity:

- `compileProgPreviewText` (line 85): `I.C. don Lorenzo Milani`
- `CertificazioneTab` exportMatrix (line 32): `IC Calvario-Covotta "don Lorenzo Milani"` and `AVIC849003`
- `copyUdaForRegister` (line 62): `CurManLight d'Istituto (AVIC849003)`

**Consequence:** Exports from any school will carry another school's identity. This is a data integrity violation.

**Recommendation:** Parameterize school identity from user profile or configuration.

---

### B-7: Suggested UDAs are synthetic data exposed as real

**Area:** A04 | **Dimension:** Data integrity | **Severity:** Blocking

`handleLoadSuggestedUda` (lines 162-200 of `useUdaProgrammingHandlers.ts`) loads hardcoded synthetic UDAs ("Smart Home con Blender 3D", "Etica e Algoritmi", etc.) with pre-filled titles, tasks, and notes. These appear:

- In the "Programmazione Annuale" timeline when no real UDAs exist (lines 338-359)
- In CertificazioneTab as "UDA d'Istituto Suggerite" (lines 164-169)
- As loadable templates that fill the form fields

There is no visual distinction between synthetic suggestions and real teacher-created content.

**Consequence:** A teacher may mistake synthetic data for real curriculum content. Exports may include synthetic data without the teacher realizing it.

**Recommendation:** Clearly label synthetic suggestions. Add a "Synthetic" badge. Warn before including in exports.

---

### B-8: CML-631 pilot still accessible

**Area:** A04 | **Dimension:** Experimental data | **Severity:** Blocking

The "★ Pilota Sperimentale" sidebar entry remains visible. Cross-cutting with A02, A03.

---

## Significant Findings

### S-1: 80+ props drilled through AppViewsLayer

**Area:** A04 | **Dimension:** Architecture | **Severity:** Significant

`ProgettazioneTabProps` is a `Pick<AppViewsLayerProps>` of **80+ properties** (lines 30-162 of `ProgettazioneTab.tsx`). This creates an extremely fragile interface where any change to `AppViewsLayerProps` can break A04.

**Recommendation:** Group related props into domain-specific interfaces. Use context or hooks to reduce prop drilling.

---

### S-2: Wizard steps skip obiettivi selection

**Area:** A04 | **Dimension:** Didactic coherence | **Severity:** Significant

The wizard has 5 steps:
1. Dati Generali (title, period)
2. Traguardi (traguardi only)
3. Evidenze (evidenze only)
4. Compito & BES (real task, notes)
5. Riepilogo (preview)

**Obiettivi are not selectable in the wizard** — only in the grid layout (line 637). A teacher using the wizard cannot select obiettivi.

**Consequence:** The wizard produces incomplete UDAs missing obiettivi.

**Recommendation:** Add obiettivi selection to wizard step 2.

---

### S-3: Curriculum year logic is hardcoded and fragile

**Area:** A04 | **Dimension:** Data integrity | **Severity:** Significant

The reform detection logic (lines 604-619 of `ProgettazioneTab.tsx`) is:

```typescript
schoolYear === '2026-2027' && targetClass !== '1' && order !== 'infanzia'
```

This hardcodes the transition year. When 2027-2028 arrives, this logic will be wrong. There's no configuration or data-driven approach.

**Recommendation:** Make the transition year configurable or derive it from curriculum metadata.

---

### S-4: No validation on UDA generation

**Area:** A04 | **Dimension:** Error prevention | **Severity:** Significant

`handleGenerateUda` only checks `if (!progTitle)`. It does not validate:

- Whether traguardi are selected
- Whether obiettivi are selected
- Whether evidenze are selected
- Whether realTask is filled
- Whether hours > 0

A teacher can generate a completely empty UDA.

**Recommendation:** Add required field validation before generation.

---

### S-5: ProgettazioneTab embeds ClasseTab and SocialTab

**Area:** A04 | **Dimension:** Architecture | **Severity:** Significant

`ProgettazioneTab` renders `ClasseTab` (line 467) and `SocialTab` (line 471) as sub-views under `activeProgTab === 'classe'` and `activeProgTab === 'social'`. These are separate feature areas (A05, A06) embedded inside A04.

**Consequence:** A04's scope is artificially inflated. Changes to A05/A06 can break A04.

**Recommendation:** Move ClasseTab and SocialTab to their own top-level tabs.

---

### S-6: No heading hierarchy in ProgettazioneTab

**Area:** A04 | **Dimension:** Accessibility | **Severity:** Significant

The component uses `<h2>`, `<h3>`, `<h4>` but skips levels and uses them inconsistently. The `text-[9px]` labels are used as pseudo-headings without semantic markup.

**Recommendation:** Use consistent heading hierarchy. Replace visual-only labels with semantic headings.

---

### S-7: 8-11px font sizes throughout

**Area:** A04 | **Dimension:** Visual | **Severity:** Significant

Pervasive use of `text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`. Cross-cutting with A01, A02, A03, A11.

---

### S-8: VolumeReaderOverlay uses dangerouslySetInnerHTML

**Area:** A04 | **Dimension:** Security | **Severity:** Significant

`KnowledgeCompanionPanel.tsx` line 85: `<div dangerouslySetInnerHTML={{ __html: html }} />` renders HTML from `volumesKB` without sanitization.

**Recommendation:** Sanitize HTML content before rendering.

---

### S-9: No integration with A07 for document generation

**Area:** A04→A07 | **Dimension:** Integration | **Severity:** Significant

The only export from A04 is clipboard text (`copyUdaTextLocal`, `copyUdaForRegister`) and SCORM manifest. There is no structured export to A07's document generation system. A07's `useDocumentExportHandlers` doesn't read `savedUda`.

**Recommendation:** Implement a structured export from A04 to A07.

---

### S-10: ProgettazioneAnnualeView reads store directly

**Area:** A04 | **Dimension:** Architecture | **Severity:** Significant

`ProgettazioneAnnualeView` (line 552) calls `useCurriculumStore()` directly for `discipline`, `order`, `selectedTraguardi`, etc., in addition to receiving them via props. This creates dual data paths — some data from props, some from store — which can diverge.

**Recommendation:** Use a single data path (either props or store, not both).

---

## Minor Findings

### M-1: "Ambito di Progettazione d'Istituto" is jargon

**Area:** A04 | **Dimension:** Language | **Severity:** Minor

### M-2: "Pianificazione Diacronica d'Istituto" is unclear

**Area:** A04 | **Dimension:** Language | **Severity:** Minor

### M-3: "Riusa ed Importa d'Istituto" button label is confusing

**Area:** A04 | **Dimension:** Language | **Severity:** Minor

### M-4: TEP banner ("Assistente Ergonomico d'Aula") may confuse

**Area:** A04 | **Dimension:** Language | **Severity:** Minor

### M-5: SCORM export produces minimal manifest

**Area:** A04 | **Dimension:** Export | **Severity:** Minor

### M-6: Progress percentage in wizard is cosmetic only

**Area:** A04 | **Dimension:** Visual | **Severity:** Minor

### M-7: "Procedura Guidata Wizard" mixes Italian/English

**Area:** A04 | **Dimension:** Language | **Severity:** Minor

### M-8: "Matrice delle Competenze d'Istituto" tab is read-only

**Area:** A04 | **Dimension:** Utility | **Severity:** Minor

---

## Opportunity Areas

| # | Description | Impact |
|---|-------------|--------|
| 1 | Dynamic Knowledge Companion based on actual selections | Improve relevance |
| 2 | UDA versioning with diff view | Support iteration |
| 3 | Integration with A07 for structured document generation | Enable formal output |
| 4 | Import from A02/A03 selections | Reduce redundant work |
| 5 | UDA templates per discipline with didactic scaffolding | Guide non-expert teachers |
| 6 | Collaborative UDA editing (multi-author) | Support department work |
| 7 | UDA quality score based on didactic completeness | Improve output quality |

---

## Cross-Cutting Patterns

| Pattern | Status | Areas |
|---------|--------|-------|
| `CML_632_CROSS_CUTTING_UI_READABILITY_DEFECT_CONFIRMED` | **CONFIRMED** | A01, A02, A03, A04, A11 |
| `CML_632_CROSS_CUTTING_ISOLATION_PATTERN_CONFIRMED` | **CONFIRMED** | A01, A02, A03, A04, A11 |
| `CML_632_CROSS_CUTTING_NO_STRUCTURED_SOURCE_DATA_CONFIRMED` | **CONFIRMED** | A01, A02, A03, A04, A11 |
| `CML_632_CROSS_CUTTING_UNVERIFIED_VALIDATION_LABELS` | **CONFIRMED** | A02, A03, A04 |
| `CML_632_CROSS_CUTTING_NO_DECISION_TRACEABILITY` | **CONFIRMED** | A03, A04 |
| `CML_632_CROSS_CUTTING_EXPERIMENTAL_DATA_EXPOSURE` | **CONFIRMED** | A02, A03, A04 |
| `CML_632_CROSS_CUTTING_NO_CURRICULUM_TO_DESIGN_TRANSFER` | **NEW — CONFIRMED** | A02→A04, A03→A04 |
| `CML_632_CROSS_CUTTING_UNTRACEABLE_ASSISTED_CONTENT` | **NEW — CONFIRMED** | A04 KnowledgeCompanion |
| `CML_632_CROSS_CUTTING_WORK_RECOVERY_DEFECT` | **NEW — CONFIRMED** | A04 (no draft versioning, no undo) |
| `CML_632_CROSS_CUTTING_OUTPUT_DATA_LOSS` | **NEW — CONFIRMED** | A04 (UdaModel loses source metadata) |
| `CML_632_CROSS_CUTTING_FALSE_COMPLETENESS` | **NEW — CONFIRMED** | A04 (synthetic UDAs presented as real) |

---

## Conclusion

A04 is the most feature-rich area but also the most structurally compromised. The Progettatore provides a functional wizard/grid workflow for creating UDAs, but:

1. **No curriculum transfer** — A02 and A03 produce no input for A04
2. **No metadata traceability** — generated UDAs lose all source links
3. **Incomplete state machine** — `validata` and `archiviata` states are dead code
4. **Synthetic data exposure** — suggested UDAs are indistinguishable from real content
5. **Hardcoded school identity** — exports carry wrong school data
6. **No document output** — only clipboard text, no structured export

The area is a **rich form builder** that produces **disconnected artifacts**. For a teacher, the experience is: "I filled in the form, I got a text output, but it's not connected to my curriculum, my school, or my documents."

**Recommendation:** REDESIGN — implement curriculum transfer, metadata traceability, complete state machine, parameterize school identity, and establish A04→A07 integration.
