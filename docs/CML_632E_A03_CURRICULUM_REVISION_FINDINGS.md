# CML-632E — Findings: A03 Curriculum Revision

## Verdict

```
CML_632E_A03_CURRICULUM_REVISION_REDESIGN_REQUIRED
```

---

## Summary

The A03 Curriculum Revision area presents a functional comparison interface (old vs new formulation) but lacks every structural element that would make revision operationally meaningful: no draft state, no role-based workflow, no traceability, no integration with planning or document generation. The "Approvato 2025" badge implies institutional approval for what is a personal vote, creating misleading validation. The area is well-isolated — decisions don't contaminate other areas — but also don't benefit any other area.

**17 of 20 UX dimensions scored below 3. 8 findings rated Blocking or Significant.**

---

## Blocking Findings

### B-1: No workflow states beyond personal vote

**Area:** A03 | **Dimension:** Process continuity | **Severity:** Blocking

The system provides 3 states: `approved`, `rejected`, `custom`. There is no draft, no pending-review, no departmental, no referente, no collegio state. The ProcessoTab describes a 6-role institutional workflow (Docente → Consiglio di Classe → Referente → Dipartimento → Collegio → Direzione) but this is informational only — no state machine implements it.

**Consequence:** A teacher's personal vote is indistinguishable from institutional approval. The "Approvato 2025" badge creates false confidence.

**Recommendation:** Implement a state machine with at least: `bozza → in_revisione → approvato_dipartimento → approvato_collegio`. Each state transition must record author, role, and timestamp.

---

### B-2: No decision traceability

**Area:** A03 | **Dimension:** Provenance | **Severity:** Blocking

Decisions are stored as `Record<string, DecisionStatus>` — a flat key-value pair with no author, no role, no timestamp, no rationale, no history. Overwriting a decision loses the previous state permanently.

**Consequence:** No audit trail. No accountability. No ability to reconstruct who decided what and when.

**Recommendation:** Extend `DecisionStatus` to a rich object: `{ status, decidedBy: { name, role }, decidedAt: string, rationale?: string, previousStatus?: DecisionStatus }`. Store as an array of state transitions per proposal.

---

### B-3: No evidence or source association

**Area:** A03 | **Dimension:** Source traceability | **Severity:** Blocking

Proposals have `oldText`, `newText`, and `notes` (expert commentary). There is no field for: source document, publication date, legislative reference, authority, or evidentiary support.

**Consequence:** A teacher votes on text changes without knowing the legislative basis or pedagogical evidence.

**Recommendation:** Add structured metadata to each proposal: `{ source: string, date: string, authority: string, evidence?: string[] }`. Display source badges in the comparison view.

---

### B-4: No draft state

**Area:** A03 | **Dimension:** Process continuity | **Severity:** Blocking

Voting immediately sets `approved`, `rejected`, or `custom`. There is no "bozza" (draft) state where a teacher can save a decision without it appearing as finalized.

**Consequence:** A teacher cannot save a tentative decision for later review. The system forces premature commitment.

**Recommendation:** Add `bozza` as the default state for new proposals. Allow transitions: `bozza → approved | rejected | custom`.

---

### B-5: "Approvato 2025" label is misleading

**Area:** A03 | **Dimension:** Validation label reliability | **Severity:** Blocking

The status badge "Approvato 2025" appears when a teacher clicks "Accetta 2025". This implies institutional approval. In reality, it is a personal, non-binding vote. No institutional validation has occurred.

**Consequence:** A user reading the badge believes the proposal has been formally approved. This is factually incorrect.

**Recommendation:** Rename to "Scelta personale: IN 2025" or "Adottato (personale)". Reserve "Approvato" for decisions that have passed institutional validation.

---

### B-6: No integration with A04 (Teaching Design)

**Area:** A03→A04 | **Dimension:** Integration | **Severity:** Blocking

A04 `ProgettazioneTab` reads `localCurriculum` directly. Revision decisions don't modify curriculum content. Approved proposals don't update the curriculum that A04 consumes.

**Consequence:** A teacher who approves a revision in A03 sees no effect in A04. The revision has no operational outcome.

**Recommendation:** After institutional approval, revision decisions should update `localCurriculum` entries. A04 should then consume the revised curriculum.

---

### B-7: No integration with A11 (Institute Sources)

**Area:** A03→A11 | **Dimension:** Integration | **Severity:** Blocking

No connection exists between proposals and institute sources. Proposals reference DM 221/2025 text but A11 doesn't track which proposals reference which sources.

**Consequence:** The institute cannot verify which proposals are grounded in their approved sources.

**Recommendation:** Link each proposal to its source in A11. When A11 updates a source, flag affected proposals for review.

---

### B-8: CML-631 pilot still accessible

**Area:** A03 | **Dimension:** Experimental data exposure | **Severity:** Blocking

The "★ Pilota Sperimentale" sidebar entry is still visible. Users can access `PilotMainView` and potentially mix experimental data with canonical curriculum decisions.

**Consequence:** Confusion about which data is canonical. Risk of pilot contamination.

**Recommendation:** Hide the pilot entry from the sidebar. Preserve data under `cml-631/` for archival but remove navigation access.

---

## Significant Findings

### S-1: 7 disciplines have zero proposals

**Area:** A03 | **Dimension:** Coverage | **Severity:** Significant

Inglese, 2ᵃ Lingua, Arte e Immagine, Musica, Educazione Fisica, Religione, and Latino have no proposals. This covers 7 of 14 disciplines.

**Consequence:** Teachers of these disciplines see "Nessuna variazione da mostrare" and cannot participate in revision.

**Recommendation:** Either add proposals for all disciplines or clearly explain why some are excluded.

---

### S-2: No discipline or order filter in-tab

**Area:** A03 | **Dimension:** Findability | **Severity:** Significant

RevisioneTab inherits the current discipline and order from the store but provides no in-tab selector. To change discipline, the user must navigate to A02 and change it there.

**Consequence:** A teacher reviewing revisions across disciplines must navigate back and forth between A02 and A03.

**Recommendation:** Add discipline and order selectors within RevisioneTab, or a "Review all" mode.

---

### S-3: Custom mode has no structure

**Area:** A03 | **Dimension:** Evidence | **Severity:** Significant

When a teacher selects "Personalizza", they get a free-text input. There is no template, no guidance, no character limit, no validation.

**Consequence:** Custom texts may be inconsistent, incomplete, or unusable for downstream processing.

**Recommendation:** Provide a structured template for custom proposals. Include fields for: new formulation, motivation, sources, expected impact.

---

### S-4: Wizard mode is a one-way stepper

**Area:** A03 | **Dimension:** Detail | **Severity:** Significant

The `RevisioneWizard` component is a linear stepper (next/previous). There is no "skip", no "review later", no "see all" mode.

**Consequence:** A teacher must process every proposal sequentially. Cannot skip controversial items.

**Recommendation:** Add "skip" and "review later" buttons. Allow jumping to specific proposals.

---

### S-5: No confirmation for destructive actions

**Area:** A03 | **Dimension:** Error prevention | **Severity:** Significant

"Resetta" (reset all decisions) executes without confirmation. No undo for individual votes.

**Consequence:** Accidental click on "Resetta" loses all decisions permanently.

**Recommendation:** Add confirmation dialog for "Resetta". Implement undo for individual votes.

---

### S-6: ProcessoTab is informational only

**Area:** A03 | **Dimension:** Role correctness | **Severity:** Significant

ProcessoTab describes 6 roles and a formal workflow but doesn't enforce any of it. The "Pipeline di Validazione Curricolare" header implies a real pipeline exists.

**Consequence:** Users believe a formal process is implemented when it is not.

**Recommendation:** Either implement the workflow (with state transitions and role enforcement) or rename the section to "Descrizione del flusso istituzionale (non ancora implementato)".

---

### S-7: No revision-specific tests

**Area:** A03 | **Dimension:** Coverage | **Severity:** Significant

No unit or integration tests exist for the revision voting flow, wizard, or decision persistence.

**Consequence:** No automated verification that voting works correctly.

**Recommendation:** Add tests for: voting (approve/reject/custom), wizard navigation, decision persistence, reset, state filter.

---

## Minor Findings

### M-1: 8–11px font sizes

**Area:** A03 | **Dimension:** Visual | **Severity:** Minor

Labels use `text-[9px]`, `text-[10px]`, `text-[11px]`. Cross-cutting with A01, A11, A02.

---

### M-2: Wizard "Finito!" screen is sparse

**Area:** A03 | **Dimension:** Visual | **Severity:** Minor

The completion screen shows "Tutte le proposte sono state esaminate" with a "Chiudi Wizard" button. No summary of decisions made.

---

### M-3: Header "Revisione del Curricolo: Gap 2025" is jargon

**Area:** A03 | **Dimension:** Language | **Severity:** Minor

"Gap" implies deficiency. Recommend: "Revisione Curricolare: Aggiornamento Normativo".

---

### M-4: "I.C. don Lorenzo Milani" is hardcoded

**Area:** A03 | **Dimension:** Language | **Severity:** Minor

ProcessoTab header contains hardcoded school name. Should be parameterized.

---

### M-5: "Swarm di Esperti" is non-standard

**Area:** A03 | **Dimension:** Language | **Severity:** Minor

curriculumKB notes reference "Swarm di Esperti" — a non-standard term for expert commentary.

---

## Opportunity Areas

| # | Description | Impact |
|---|-------------|--------|
| 1 | Visual diff highlighting (word-level old vs new) | Improve comprehension |
| 2 | Per-proposal motivation and evidence fields | Increase traceability |
| 3 | Export to Word/PDF for departmental review | Enable formal workflows |
| 4 | "Review later" bookmark for controversial proposals | Support iterative decision-making |
| 5 | Discipline-specific onboarding for revision | Reduce confusion for excluded disciplines |
| 6 | Comparison with other institutes' decisions (anonymized) | Benchmark decisions |
| 7 | Timeline view of decision history | Improve accountability |

---

## Cross-Cutting Patterns

| Pattern | Status | Areas |
|---------|--------|-------|
| `CML_632_CROSS_CUTTING_UI_READABILITY_DEFECT_CONFIRMED` | **CONFIRMED** | A01, A11, A02, A03 |
| `CML_632_CROSS_CUTTING_ISOLATION_PATTERN_CONFIRMED` | **CONFIRMED** | A01, A11, A02, A03 |
| `CML_632_CROSS_CUTTING_NO_STRUCTURED_SOURCE_DATA_CONFIRMED` | **CONFIRMED** | A01, A11, A02, A03 |
| `CML_632_CROSS_CUTTING_UNVERIFIED_VALIDATION_LABELS` | **NEW** | A02, A03 |
| `CML_632_CROSS_CUTTING_PROCESS_STATE_AMBIGUITY` | **NEW** | A03, ProcessoTab |
| `CML_632_CROSS_CUTTING_NO_DECISION_TRACEABILITY` | **NEW** | A03 |
| `CML_632_CROSS_CUTTING_EXPERIMENTAL_DATA_EXPOSURE` | **CONFIRMED** | A02, A03 |

---

## Conclusion

A03 delivers a visually clear comparison interface (old vs new formulation) — its strongest feature. However, the area fails to provide:
1. **A real workflow** — only 3 states, no institutional process
2. **Traceability** — no author, timestamp, rationale, history
3. **Integration** — decisions don't flow to A04, A07, or A11
4. **Honest labels** — "Approvato 2025" implies institutional approval for personal votes

The revision area is **functionally isolated**: it shows comparisons, accepts votes, persists decisions, but produces no operational outcome. For a teacher, the experience is: "I voted, but nothing changed."

**Recommendation:** REDESIGN — implement a state machine with institutional workflow states, add traceability, integrate with A04/A07, and correct validation labels.
