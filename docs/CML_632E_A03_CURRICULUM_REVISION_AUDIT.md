# CML-632E — Audit: A03 Curriculum Revision

## Metadata

| Field | Value |
|-------|-------|
| Area ID | A03 |
| Area Name | Curriculum Revision (Revisione Curricolare) |
| Audit date | 2026-07-27 |
| Branch | `audit/cml-632e-a03-curriculum-revision` |
| Initial commit | `a6f3325` |
| Baseline | CML-632D (A02 audit complete) |

---

## 1. Initial State

```text
Branch: audit/cml-632e-a03-curriculum-revision
Initial commit: a6f3325
Working tree: clean (kilo.jsonc modified, unrelated)
Untracked: .playwright-mcp/, report/, scripts/, test-results/ (unrelated)
```

---

## 2. Perimeter

### Components

| Component | File | Lines | Role |
|-----------|------|-------|------|
| `RevisioneTab` | `src/features/curriculum/components/RevisioneTab.tsx` | 295 | Main revision view |
| `RevisioneWizard` | Same file | 178-295 | Step-by-step wizard sub-component |
| `ProcessoTab` | `src/features/processo/components/ProcessoTab.tsx` | 304 | Process & consent workflow |
| `useCurriculumProgressStats` | `src/features/curriculum/hooks/useCurriculumProgressStats.ts` | 54 | Computes decision stats |
| `useBackupHandlers` | `src/features/documents/hooks/useBackupHandlers.ts` | 110 | CML import/merge |
| `useDocumentExportHandlers` | `src/features/documents/hooks/useDocumentExportHandlers.ts` | 921 | CML export |
| `curriculumKB` | `src/data/curriculumKB.ts` | 1075 | Source proposals |
| `useCurriculumStore` | `src/store/useCurriculumStore.ts` | 207 | State persistence |

### URL routing

A03 uses `activeTab === 'revisione'` — a separate tab from A02 (`activeTab === 'curricolo'`). Both are under the "Consulta Curricolo" sidebar section. A03 is accessed via sidebar sub-menu "Revisione (Gap 2025)".

### Data model

The revision system is built on **proposals** — pre-existing diff entries in `curriculumKB` that compare DM 254/2012 text with DM 221/2025 proposed text:

```typescript
interface Proposal {
  id: string;          // e.g., "it-inf-1"
  focus: string;       // e.g., "Avvicinamento pregrafismo e corsivo"
  oldText: string;     // DM 254/2012 formulation
  newText: string;     // DM 221/2025 proposed formulation
  notes: string;       // Expert commentary
}
```

Decisions are stored in `useCurriculumStore`:

```typescript
decisions: Record<string, DecisionStatus>;  // proposal.id → 'approved'|'rejected'|'custom'
customTexts: Record<string, string>;         // proposal.id → custom text
```

### Proposal inventory

| Discipline | Infanzia | Primaria | Secondaria | Total proposals |
|------------|:--------:|:--------:|:----------:|:---------------:|
| Italiano | 2 | 2 | 2 | **6** |
| Matematica | 1 | 1 | 1 | **3** |
| Scienze | 1 | 1 | 1 | **3** |
| Storia | 1 | 1 | 1 | **3** |
| Geografia | 0 | 1 | 1 | **2** |
| Tecnologia | 0 | 1 | 1 | **2** |
| Inglese | 0 | 0 | 0 | **0** |
| 2ᵃ Lingua | 0 | 0 | 0 | **0** |
| Arte e Immagine | 0 | 0 | 0 | **0** |
| Musica | 0 | 0 | 0 | **0** |
| Educazione Fisica | 0 | 0 | 0 | **0** |
| Educazione Civica | 0 | 1 | 1 | **2** |
| Religione | 0 | 0 | 0 | **0** |
| Latino | 0 | 0 | 1 | **1** |
| **Total** | **5** | **9** | **10** | **24** |

**24 proposals total across 14 disciplines. 7 disciplines have zero proposals.**

---

## 3. Data Flow Trace

```
curriculumKB (static proposals per discipline/order)
  ↓
localCurriculum (localStorage override or KB fallback)
  ↓
useCurriculumProgressStats → currentDisciplineProps (filtered by discipline+order)
  ↓                                    ↓
  ↓                           currentDisciplineDecided (count of decided props)
  ↓
RevisioneTab → list mode / wizard mode
  ↓
useCurriculumStore: decisions[id] = 'approved'|'rejected'|'custom'
                   customTexts[id] = custom text string
  ↓
ProcessoTab (reads same decisions for dashboard)
  ↓
handleDownloadCml → exports decisions + customTexts as .cml JSON
  ↓
handleImportMergeCml → imports and merges decisions from .cml file
```

### Key observations

1. **Proposals are hardcoded in curriculumKB** — not generated from diff analysis
2. **Decisions are flat key-value pairs** — no workflow state machine
3. **No author/role stored** — decisions don't record who decided
4. **No timestamp stored** — decisions don't record when
5. **No reason/motivation stored** — only the final text (for custom)
6. **No approval chain** — no dipartimento → referente → collegio workflow
7. **CML export is a snapshot** — exports current decisions, not a workflow artifact

---

## 4. Central Question Assessment

### 4.1 Access and comprehension

| # | Question | Assessment | Evidence |
|---|----------|------------|----------|
| 1 | Does the teacher understand the difference between consultation and revision? | **Partial** | Sidebar labels "Consulta Curricolo" (parent) vs "Revisione (Gap 2025)" (child) — related but different. However, both show curriculum content; the difference is that A03 adds voting buttons. |
| 2 | Is it clear who can propose, examine, validate, and approve? | **No** | No role-based access. Any user can vote on any proposal. The ProcessoTab describes 6 roles but they are informational only — no enforcement. |
| 3 | Does first access explain what to do? | **Partial** | Instructions box says "Vota Accetta 2025 o Mantieni 2012" — clear action. But no explanation of what the reform is or why it matters. |
| 4 | Does shared URL create ambiguity? | **Partial** | Different `activeTab` values (`curricolo` vs `revisione`), clear sidebar labels. But the proposal data appears in both A02 (MappaView) and A03 (RevisioneTab), creating mild redundancy. |

### 4.2 Item identification

| # | Question | Assessment | Evidence |
|---|----------|------------|----------|
| 5 | Can the user select order, discipline, nucleo, state? | **Partial** | Discipline yes (sidebar store). Order — no UI (same as A02). Nucleo — no. State — filter bar with Tutte/Da decidere/Approvati/Rifiutati. |
| 6 | Are revision items identifiable through verifiable criteria? | **No** | Proposals are pre-selected by the KB author. No criteria explain WHY these 24 items need revision and others don't. |
| 7 | Are evidences, gaps, inconsistencies visible? | **No** | Proposals show old vs new text. No evidences shown. No gap analysis. No inconsistency indicators. |
| 8 | Can the user distinguish canonical data from experimental? | **Partial** | CML-631 pilot is accessible via sidebar. But proposals in RevisioneTab are from curriculumKB (canonical). No visual distinction. |

### 4.3 Proposal construction

| # | Question | Assessment | Evidence |
|---|----------|------------|----------|
| 9 | Is the current formulation always visible and comparable? | **Yes** | List mode: side-by-side DM 254/2012 vs DM 221/2025. Wizard mode: same. This is the strongest feature. |
| 10 | Can the user motivate with evidence and sources? | **No** | No field for motivation. "Custom" mode allows free text but no structured motivation. No evidence association. No source linking. |
| 11 | Are changes granular, understandable, reversible? | **Partial** | Granular: per-proposal. Understandable: old/new text. Reversible: "Resetta" button exists. But changes are binary (accept/reject) or free-text (custom) — no partial edits. |
| 12 | Does the system prevent or flag proposals without source? | **No** | No validation. A user can approve a proposal with no evidence, no source, no motivation. |
| 13 | Can the user save a draft without it appearing as validated? | **No** | No draft state. Voting immediately sets `approved`/`rejected`/`custom`. No "bozza" status. |

### 4.4 Decision process

| # | Question | Assessment | Evidence |
|---|----------|------------|----------|
| 14 | Are process states explicit and semantically correct? | **No** | Only 3 states: `approved`, `rejected`, `custom`. No draft, no pending review, no departmental, no validated, no approved-by-collegio. |
| 15 | Are these clearly distinguished? | **No** | `approved` = "Approvato 2025" — but this is a teacher's personal vote, not a formal institutional approval. The label is misleading. |
| 16 | Does the system record who decided and on what basis? | **No** | No author, no role, no timestamp, no rationale stored. |
| 17 | Is there a verifiable revision history? | **No** | Decisions overwrite previous ones. No history. No audit trail. |
| 18 | Do validation labels correspond to real data? | **No** | "Mappa Validated" badge in A02 is hardcoded. "Approvato 2025" in A03 is a personal vote, not institutional approval. |

### 4.5 Outcomes and integrations

| # | Question | Assessment | Evidence |
|---|----------|------------|----------|
| 19 | Does an approved revision actually modify curriculum? | **No** | Decisions don't update `localCurriculum`. The `oldText`/`newText` comparison is display-only. Approved proposals don't replace content. |
| 20 | Can proposals be transferred to A02/A04/A07/A11? | **Partial** | A02 MappaView shows decision state (visual). A04 doesn't consume decisions. A07 exports include decisions in .cml but not in generated documents. A11: no connection. |
| 21 | Does the user know where to find completed work? | **Partial** | ProcessoTab shows dashboard with stats. But no "my decisions" view, no history, no per-user log. |
| 22 | Can proposals be exported in usable form? | **Partial** | .cml export contains decisions + customTexts. But no formatted document (Word/PDF) for departmental review. |
| 23 | Can incomplete/unapproved proposals contaminate operations? | **No** | Decisions only affect display (MappaView badge, ProcessoTab stats). They don't modify curriculum content consumed by A04 or A07. Low contamination risk — but also low operational value. |

---

## 5. Scenario Results

### Scenario 1 — First access

| Step | Result | Issue |
|------|--------|-------|
| Open `/curriculum` | Shows A02 (CurriculumTab) | A03 is not the default |
| Navigate to sidebar | "Revisione (Gap 2025)" visible under "Consulta Curricolo" | OK — clear label |
| Click Revisione | RevisioneTab renders with header, instructions, filter bar, proposal list | OK |
| Understand purpose | Instructions say "Vota Accetta 2025 o Mantieni 2012" — clear action | But no context about what the reform is |
| See status | "X/Y decisioni" counter visible | OK |

### Scenario 2 — Finding items to revise

| Step | Result | Issue |
|------|--------|-------|
| Select discipline | Via store (no UI in RevisioneTab — uses current discipline from store) | Must navigate to A02 to change discipline |
| Select order | **No UI** — same issue as A02 | Cannot change order from RevisioneTab |
| Filter by state | "Da decidere" filter works — shows unvoted proposals | OK |
| See gap | Proposals show old vs new text | But no explanation of WHY this is a gap |

### Scenario 3 — Building a proposal

| Step | Result | Issue |
|------|--------|-------|
| See old vs new text | Side-by-side comparison in list and wizard | **Excellent** — strongest feature |
| Add motivation | **Not possible** — no motivation field | Only free-text "Personalizza" |
| Associate evidence | **Not possible** — no evidence field | |
| Associate source | **Not possible** — no source field | |
| Save as draft | **Not possible** — no draft state | Voting is immediate |
| Verify persistence | Decisions persist to IndexedDB | OK |

### Scenario 4 — Departmental process

| Step | Result | Issue |
|------|--------|-------|
| See proposal with data | Shows old/new text, focus, ID | But no author, no timestamp, no role |
| Simulate departmental review | No departmental state — only personal vote | ProcessoTab describes roles but doesn't enforce them |
| Distinguish proposal from outcome | **Not possible** — `approved` = personal vote = institutional approval | Misleading |

### Scenario 5 — Validation and approval

| Step | Result | Issue |
|------|--------|-------|
| Check for validation states | Only 3: approved/rejected/custom | No draft, no departmental, no referente, no collegio |
| Check role enforcement | None — any user can vote | ProcessoTab is informational only |
| Check formal approval labels | "Approvato 2025" — implies institutional approval | But it's a personal vote |

### Scenario 6 — Operational outcome

| Step | Result | Issue |
|------|--------|-------|
| Check A02 | MappaView shows decision state badges | Visual only — doesn't modify content |
| Check A04 | ProgettazioneTab receives `localCurriculum` — decisions don't affect it | **No integration** |
| Check A07 | Exports don't include revision decisions in generated docs | Only in .cml export |
| Check A11 | No connection | **No integration** |

### Scenario 7 — Incomplete content

| Step | Result | Issue |
|------|--------|-------|
| Select discipline with 0 proposals | Filter shows "Nessuna variazione da mostrare" | OK — empty state works |
| Check for misleading labels | None observed — empty state is honest | OK |

### Scenario 8 — Experimental functions

| Step | Result | Issue |
|------|--------|-------|
| Access CML-631 pilot | Still accessible via "★ Pilota Sperimentale" sidebar | **Blocking** — should be hidden |
| Check data separation | Pilot uses separate `PilotMainView` — data not mixed with canonical | OK structurally |

---

## 6. UX Dimension Scores (1–5)

| # | Dimension | Score | Evidence | Consequence | Severity |
|---|-----------|:-----:|----------|-------------|----------|
| 1 | Purpose clarity | **2** | "Revisione del Curricolo: Gap 2025" — clear label but no context about what the reform is | Teacher votes without understanding the reform | Significant |
| 2 | First access comprehensibility | **2** | Instructions exist but no onboarding; no explanation of DM 221/2025 | Teacher may not understand why revision is needed | Significant |
| 3 | Consultation vs revision distinction | **2** | Both under "Consulta Curricolo"; A03 adds voting but shows same data | Mild confusion about when to use which | Minor |
| 4 | School context selection | **1** | No order selector; discipline from store only | Teacher stuck on default order | Blocking |
| 5 | Item findability | **2** | Filter by state works; but no search, no nucleo filter, no criteria | Cannot find specific items efficiently | Significant |
| 6 | Old/new comparison quality | **4** | Side-by-side comparison is excellent in both list and wizard | **Strongest feature** | — |
| 7 | Evidence visibility | **1** | No evidence shown in revision view | Cannot assess impact of changes | Blocking |
| 8 | Source traceability | **0** | No source, date, version, authority on any proposal | Cannot verify claims | Blocking |
| 9 | State comprehensibility | **1** | 3 states only; "Approvato 2025" implies institutional approval for personal vote | Misleading validation labels | Blocking |
| 10 | Role correctness | **1** | ProcessoTab describes 6 roles but none enforced | Any user can "approve" institutional changes | Blocking |
| 11 | Validation label reliability | **0** | "Approvato 2025" = personal vote; "Mappa Validata" = hardcoded | Labels don't correspond to reality | Blocking |
| 12 | Process continuity | **1** | No draft, no departmental, no referente, no collegio states | Cannot represent real institutional workflow | Blocking |
| 13 | Area integration | **1** | No connection to A04, A07, A11; visual-only in A02 | Revision has no operational outcome | Blocking |
| 14 | Accessibility | **1** | No heading hierarchy, no tab roles, 8-11px fonts | Cross-cutting A01 issue | Significant |
| 15 | Visual readability | **2** | Cards are clear; but font sizes small; "Pipeline di Validazione" is informational only | Minor visual issues | Minor |
| 16 | Responsive behavior | **2** | Basic stacking works; wizard mode may be dense on mobile | Minor mobile issues | Minor |
| 17 | Error prevention | **1** | No validation on votes; no confirmation for destructive actions; no draft safety | User can accidentally "approve" institutional changes | Significant |
| 18 | Work recoverability | **1** | Decisions persist to IndexedDB; "Resetta" exists; but no history, no undo | Cannot recover overwritten decisions | Significant |
| 19 | Departmental utility | **1** | ProcessoTab shows stats and role descriptions; .cml export exists; but no formatted documents | Department cannot use the output formally | Significant |
| 20 | Non-technical teacher suitability | **2** | Voting is simple (3 buttons); but jargon ("Gap 2025", "Ambito di Governance") and no onboarding | May confuse non-technical users | Significant |

**Dimensions at 0:** Source traceability (8), Validation label reliability (11)
**Dimensions at 1:** School context (4), Evidence (7), State (9), Role (10), Process continuity (12), Integration (13), Accessibility (14), Error prevention (17), Work recoverability (18), Departmental utility (19)
**Dimensions at 2:** Purpose (1), First access (2), Consultation/distinction (3), Findability (5), Visual (15), Responsive (16), Non-technical (20)
**Dimensions at 3+:** Old/new comparison (4)

**17 of 20 dimensions below 3.**

---

## 7. Language Audit

| Term | Location | Issue | Recommendation |
|------|----------|-------|----------------|
| "Revisione del Curricolo: Gap 2025" | Header | "Gap" implies deficiency; "2025" is vague | "Revisione Curricolare: Aggiornamento Normativo" |
| "Accetta 2025" | Button | Implies acceptance of the reform as a whole, not a specific proposal | "Adotta formulazione IN 2025" |
| "Mantieni 2012" | Button | Implies conservation of the old standard | "Mantieni formulazione DM 254/2012" |
| "Approvato 2025" | Status badge | Implies institutional approval | "Scelta personale: IN 2025" |
| "Mantenuto 2012" | Status badge | Implies institutional decision | "Scelta personale: DM 254/2012" |
| "Personalizzato" | Status badge | Acceptable | Keep |
| "Da Decidere" | Filter | Acceptable | Keep |
| "Pipeline di Validazione Curricolare" | ProcessoTab | Implies a real pipeline exists | "Descrizione del flusso istituzionale" |
| "Cruscotto di Analisi Statistica dei Consensi" | ProcessoTab | Overly bureaucratic | "Riepilogo decisioni" |
| "I.C. don Lorenzo Milani" | ProcessoTab | Hardcoded school name | Should be parameterized |
| "Ambito di Governance d'Istituto" | ProcessoTab header | Jargon | "Gestione e Consenso" |
| "Finale in Verifica" | ProcessoTab | Unclear reference | "Anteprima stesura coordinata" |
| "Swarm di Esperti" | curriculumKB notes | Non-standard | Replace with standard term |
| "Passo-Passo (Monoscheda)" | RevisioneTab | Non-standard | "Wizard" or "Guida passo-passo" |

---

## 8. Cross-Cutting Pattern Verification

| Pattern | Status | Evidence |
|---------|--------|----------|
| `CML_632_CROSS_CUTTING_UI_READABILITY_DEFECT_CONFIRMED` | **CONFIRMED** | 8-11px labels in RevisioneTab (line 9: `text-[9px]`, line 114: `text-[10px]`). Third area (A01, A11, A02, A03). |
| `CML_632_CROSS_CUTTING_ISOLATION_PATTERN_CONFIRMED` | **CONFIRMED** | A03 decisions don't flow to A04, A07, or A11. Revision has no operational outcome. Fourth area confirmation. |
| `CML_632_CROSS_CUTTING_NO_STRUCTURED_SOURCE_DATA_CONFIRMED` | **CONFIRMED** | Proposals have `oldText`/`newText`/`notes` but no source, date, version, authority. Fourth area confirmation. |
| `CML_632_CROSS_CUTTING_UNVERIFIED_VALIDATION_LABELS` | **NEW — CONFIRMED** | "Approvato 2025" badge on personal votes. "Mappa Validata" hardcoded in A02. ProcessoTab "Pipeline di Validazione" implies formal process. Present in A02 and A03. |
| `CML_632_CROSS_CUTTING_PROCESS_STATE_AMBIGUITY` | **NEW — CONFIRMED** | Only 3 states (approved/rejected/custom) — no draft, departmental, referente, collegio. ProcessoTab describes 6 roles but none enforced. Present in A03 and ProcessoTab. |
| `CML_632_CROSS_CUTTING_EXPERIMENTAL_DATA_EXPOSURE` | **CONFIRMED** | CML-631 pilot still accessible via sidebar. Present in A02 and A03 navigation. |
| `CML_632_CROSS_CUTTING_NO_DECISION_TRACEABILITY` | **NEW — CONFIRMED** | No author, no timestamp, no rationale, no history on decisions. Present in A03 store. |

---

## 9. Technical Verification

| Check | Result | Notes |
|-------|--------|-------|
| `npx tsc --noEmit` | **PASS** — 0 errors | No regression |
| `npm run build` | **PASS** — 1,143.80 kB | No regression |
| `npx vitest run` | 227/228 pass | 1 timeout (pilot-service.test.ts) — infrastructure, not functional |

---

## 10. Integration Analysis

### A03 → A02

| Aspect | State | Issue |
|--------|-------|-------|
| Shared data | Proposals from `localCurriculum` visible in both A02 MappaView and A03 RevisioneTab | Redundancy — same data, two views |
| Decision display | A02 MappaView shows decision state badges | Visual only — OK |
| Navigation | Sidebar groups both under "Consulta Curricolo" | Coherent |

### A03 → A04

| Aspect | State | Issue |
|--------|-------|-------|
| Data flow | **None** — A04 doesn't read decisions | **Blocking** — revision should inform planning |
| Selection transfer | `selectedTraguardi`/`selectedObiettivi` are store-level but populated independently | **Blocking** — same issue as A02→A04 |

### A03 → A07

| Aspect | State | Issue |
|--------|-------|-------|
| Export | .cml export includes decisions | OK for data exchange |
| Generated docs | Programmazione Annuale, Relazione, Specifico Grado don't include revision decisions | **Blocking** — formal documents should reflect revision outcomes |

### A03 → A11

| Aspect | State | Issue |
|--------|-------|-------|
| Source connection | **None** — no link between proposals and sources | **Blocking** |

---

## 11. Scores

| Dimension | Score | Key Finding |
|-----------|:-----:|-------------|
| Valore per l'utente | **2** | Comparison is valuable but revision has no operational outcome |
| Coerenza funzionale | **2** | Voting works but no draft, no workflow, no traceability |
| Copertura dei dati | **2** | 24 proposals across 7 disciplines; 7 disciplines with 0 proposals |
| Qualità dei metadati | **0** | No author, timestamp, source, version, rationale |
| Comprensibilità | **2** | Instructions exist but jargon-heavy; "Approvato" misleading |
| Ricerca e filtri | **2** | State filter works; no search, no discipline/order filter in-tab |
| Dettaglio | **2** | Wizard mode is good; but no per-item metadata or motivation |
| Provenienza | **0** | No source, date, version on any proposal |
| Integrazione A04 | **0** | Decisions don't flow to planning |
| Integrazione A11 | **0** | No connection to sources |
| Integrazione A07 | **1** | .cml export exists; generated docs don't reflect decisions |
| Gerarchia visiva | **2** | Clear cards; but 8-11px fonts; jargon headers |
| Accessibilità | **1** | No heading hierarchy, no tab roles, small fonts |
| Responsività | **2** | Basic stacking; wizard may be dense on mobile |
| Affidabilità | **2** | Decisions persist; but no history, no undo, no validation |
| Copertura tecnica | **1** | Empty state tests exist; no revision-specific tests |

**Dimensions below 3:** 14 of 16.
