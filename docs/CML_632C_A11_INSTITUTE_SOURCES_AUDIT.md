# CML-632C — Audit: A11 Institute Sources

## Metadata

| Field | Value |
|-------|-------|
| Area ID | A11 |
| Area Name | Institute Sources (Fonti d'Istituto) |
| Audit date | 2026-07-27 |
| Branch | `audit/cml-632c-a11-institute-sources` |
| Initial commit | `4e02417` |
| Baseline | CML-632A inventory |

---

## 1. Perimeter

### Components analyzed

| Component | File | Lines | Role |
|-----------|------|-------|------|
| `InfoViews` (fonti tab) | `src/features/session/components/InfoViews.tsx` | 178 | Main sources view |
| `curriculumKB` | `src/data/curriculumKB.ts` | 1075 | Curriculum knowledge base |
| `useCurriculumStore` | `src/store/useCurriculumStore.ts` | ~50 | Curriculum store (references KB) |
| `useLocalCurriculum` | `src/features/curriculum/hooks/useLocalCurriculum.ts` | 22 | Local curriculum hook |
| `AppSidebar` | `src/features/navigation/components/AppSidebar.tsx` | 240 | Navigation (fonti entry) |

### Data inventory

| Data Source | Type | Persistence | Used in Fonti view |
|-------------|------|-------------|-------------------|
| `curriculumKB` | Hardcoded TypeScript | Static (code) | **No** — only used by CurriculumTab, not by InfoViews |
| InfoViews sub-tabs | Hardcoded JSX | Static (code) | **Yes** — the only data in the Fonti view |
| `useCurriculumStore` | Zustand (persisted) | IndexedDB | **No** — fonti view does not read from store |

### Views in scope

- Fonti tab (`activeTab === 'fonti'`)
- Sub-tabs: Premessa, Riforma, Obiettivi, Livelli
- Sidebar entry "Fonti d'Istituto"

### Out of scope

- Curriculum tab (separate area A02)
- Second Brain / WikiLLM (separate area A10)

---

## 2. Method

1. Source code analysis of InfoViews and curriculumKB
2. Data flow tracing (what data reaches the fonti view)
3. Text audit (terminology, authority, accuracy)
4. Integration analysis (how fonti connects to other areas)
5. Technical verification

---

## 3. Source Inventory

### 3.1 Sources displayed in the Fonti view

The Fonti view displays **4 static content panels** with no structured source metadata:

| # | Sub-tab | Title | Content Type | Authority | Date | Version | Status |
|---|---------|-------|-------------|-----------|------|---------|--------|
| 1 | `premessa` | Premessa e Principi Ispiratori | Prose paragraph | Not identified | Not dated | Not versioned | Static |
| 2 | `riforma` | La Svolta delle Nuove Indicazioni Nazionali 2025 | Prose paragraph | Not identified | References 2025 | Not versioned | Static |
| 3 | `obiettivi` | Declinazione degli Obiettivi per Competenze | One-sentence description | Not identified | Not dated | Not versioned | Static |
| 4 | `livelli` | Livelli di Valutazione (A–D) | 4 grade descriptors | Not identified | Not dated | Not versioned | Static |

### 3.2 Sources referenced in text but not structured

| Reference | Where mentioned | Structured? | Link provided? |
|-----------|----------------|-------------|----------------|
| Costituzione Italiana | Premessa tab | No — prose only | No |
| D.M. 221/2025 (Nuove Indicazioni Nazionali) | Premessa, Riforma tabs | No — prose only | No |
| DM 254/2012 | Referenced in guide (InfoViews guida tab) | No | No |
| Linee Guida PTOF | DashboardView hardcoded widget | No | No |
| 8 Competenze Europee | DashboardView hardcoded widget | No | No |
| WCAG 2.1 | DashboardView admin widget | No | No |
| GDPR | Privacy notice | No | No |

### 3.3 Curriculum data (curriculumKB)

The actual curriculum knowledge base contains **14 disciplines × 3 school orders** with:

| Field | Present | Source | Used in Fonti |
|-------|---------|--------|---------------|
| Traguardi (goals) | Yes | Hardcoded | **No** |
| Obiettivi (objectives) | Yes | Hardcoded | **No** |
| Proposals (revision) | Yes | Hardcoded | **No** |
| Evidenze (evidence) | Yes | Hardcoded | **No** |
| Nuclei fondanti | Yes | Hardcoded | **No** |

**Total data:** ~106 traguardi, ~92 obiettivi across 14 disciplines. None of this data appears in the Fonti view.

### 3.4 Sources NOT present

| Missing Source | Impact |
|----------------|--------|
| Original text of D.M. 221/2025 | Teacher cannot verify the reform text |
| Original text of DM 254/2012 | Teacher cannot compare old vs new |
| PTOF document | Teacher cannot reference the institutional plan |
| Curriculum d'Istituto (approved) | Teacher cannot see the approved curriculum |
| European Competence Framework | Teacher cannot verify the 8 competences |
| Internal department documents | Teacher cannot access departmental sources |
| Source metadata (date, author, version) | No way to assess currency or authority |
| Source status (valid, draft, archived) | No way to know if a source is current |
| Source links | No way to consult original documents |

---

## 4. Central Question Assessment

| # | Question | Assessment | Evidence |
|---|----------|------------|----------|
| 1 | Da dove proviene questa fonte? | **Informazione assente** | No author, no ente, no provenance on any source |
| 2 | È normativa, istituzionale o operativa? | **Non chiaro** | All 4 panels presented equally; no typology distinction |
| 3 | È vigente? | **Informazione assente** | No dates, no validity indicators |
| 4 | È stata validata dall'istituto? | **Informazione assente** | No validation status |
| 5 | È definitiva o in lavorazione? | **Non chiaro** | No status indicators |
| 6 | Dove viene utilizzata nel sistema? | **Informazione assente** | No cross-references to curriculum or planning |
| 7 | Posso consultare il contenuto originale? | **Non chiaro** | Text is quoted/paraphrased, not linked |
| 8 | Posso verificare data e versione? | **Informazione assente** | No dates or versions |
| 9 | Quale fonte sostiene una scelta curricolare? | **Non chiaro** | No traceability from curriculum decisions to sources |
| 10 | Quali fonti sono obbligatorie e quali orientative? | **Informazione assente** | No authority levels |

**Score: 0/10 fully clear, 0/10 partially clear, 4/10 not clear, 6/10 information absent**

---

## 5. User Value Analysis

| Dimension | Score | Evidence |
|-----------|-------|----------|
| Finalità | 1 | Purpose unclear — "Fonti e Sezioni Generali" is ambiguous |
| Autorevolezza percepibile | 0 | No authority indicators; all sources look identical |
| Tracciabilità | 0 | No link from curriculum decisions to sources |
| Utilità operativa | 1 | Teacher can read prose but cannot act on it |
| Integrazione con il lavoro | 0 | Fonti view is completely isolated from curriculum, planning, and documents |

---

## 6. Data and Metadata Analysis

### Metadata fields expected vs. present

| Field | Expected | Present in InfoViews | Present in curriculumKB |
|-------|----------|---------------------|------------------------|
| Identifier | Yes | No | No (uses discipline key) |
| Title | Yes | Yes (sub-tab labels) | No (uses discipline name) |
| Author/Ente | Yes | No | No |
| Date | Yes | No | No |
| Version | Yes | No | No |
| Status | Yes | No | No |
| Validity | Yes | No | No |
| Scope | Yes | No | School order only |
| Authority level | Yes | No | No |
| Link to original | Yes | No | No |
| Description | Yes | Partial (prose) | No |
| Usage in system | Yes | No | Implicit (used everywhere) |

### Data quality issues

| Issue | Severity | Evidence |
|-------|----------|----------|
| No source metadata | High | 4 panels with no dates, authors, or versions |
| Hardcoded prose | High | Content is inline JSX, not structured data |
| No link to original documents | High | Teacher cannot verify claims |
| No distinction between normativa and supporto | High | DM 221/2025 and internal notes presented identically |
| "obiettivi" sub-tab has only one sentence | Medium | Almost empty content |
| References to "I.C. don Lorenzo Milani" in guide | Medium | Specific school name in generic guide text |
| "Parere dello Swarm di Esperti" in curriculumKB | Medium | Unusual terminology; unclear authority |

---

## 7. Functional Analysis

### 7.1 Consultation Flow

| Step | Element | Behavior |
|------|---------|----------|
| Entry | Sidebar "Fonti d'Istituto" | InfoViews renders with `activeTab === 'fonti'` |
| Default sub-tab | `premessa` | Shows "Premessa e Principi Ispiratori" |
| Navigation | 4 sub-tab buttons | Switches between panels |
| Content | Static prose | Read-only, no interaction |
| Return | Sidebar or browser back | Returns to previous view |

**Break points:**
- No search or filter — must read all 4 panels sequentially
- No links to original documents — cannot verify claims
- No connection to curriculum — cannot see which sources support which decisions
- Sub-tab buttons labeled "1.", "2.", "3.", "4." — implies sequence but content is independent

### 7.2 Use from Other Areas

| Area | Connection | Behavior |
|------|------------|----------|
| A02 Curriculum | None | Fonti data not referenced in curriculum view |
| A04 Planning | None | Planning does not link to sources |
| A07 Documents | None | Exports do not cite sources |
| A10 Second Brain | Indirect | WikiLLM mentions "fonti" but not structured |
| A01 Home | None | Fonti has no presence on dashboard |

**The Fonti view is completely isolated.** No other area references it, and it references no other area.

---

## 8. Text Audit

### Texts in Fonti view

| Text | Location | Quality | Issue |
|------|----------|---------|-------|
| "Fonti e Sezioni Generali d'Istituto" | Header | Unclear | "Sezioni Generali" is ambiguous |
| "Premessa e Principi Ispiratori" | Sub-tab 1 | Acceptable | But "Principi Ispiratori" is vague |
| "La Svolta delle Nuove Indicazioni Nazionali 2025" | Sub-tab 2 | Sensationalized | "Svolta" is editorializing, not neutral |
| "Declinazione degli Obiettivi per Competenze" | Sub-tab 3 | Jargon | "Declinazione" is bureaucratic Italian |
| "Livelli di Valutazione" | Sub-tab 4 | Clear | But content is just grade descriptors |
| "Il presente Curricolo, ispirandosi ai principi della Costituzione Italiana e alle Nuove Indicazioni Nazionali (D.M. 221/2025)..." | Premessa | Partially accurate | D.M. 221/2025 citation format is non-standard |
| "Le Nuove Indicazioni 2025 ricalibrano l'asse didattico su pilastri innovativi" | Riforma | Editorializing | "pilastri innovativi" is subjective |
| "scrittura a mano continua in corsivo" | Riforma | Potentially inaccurate | IN 2025 emphasizes handwriting but "continua in corsivo" may overstate |
| "Educazione Economico-Finanziaria, Assicurativa e Previdenziale obbligatoria" | Riforma | Unverified | Requires verification against actual DM text |
| "studio etico ed algoritmico dell'Intelligenza Artificiale" | Riforma | Unverified | Requires verification |
| "ecologia d'istituto (sostenibilità ed Agenda 2030)" | Riforma | Unverified | Requires verification |
| "I.C. don Lorenzo Milani" | Guida tab | Specific | School name in generic guide — should be parameterized |

### Terminology issues

| Term | Issue | Recommendation |
|------|-------|----------------|
| "Sezioni Generali" | Ambiguous | Remove or clarify |
| "Svolta" | Editorializing | Replace with "Aggiornamento" or "Riforma" |
| "Declinazione" | Bureaucratic | Replace with "Applicazione" or "Definizione" |
| "Pilastri innovativi" | Subjective | Replace with "Ambiti" or "Linee Guida" |
| "Swarm di Esperti" | Jargon (in KB) | Replace with "Comitato scientifico" or remove |
| "PTOF" | Jargon | Spell out or remove from user-facing text |

---

## 9. Visual Hierarchy

### Current layout

```
[Header: "Fonti e Sezioni Generali d'Istituto"]
[Sub-tab bar: 1. Premessa | 2. Riforma | 3. Obiettivi | 4. Livelli]
[Content panel: single card with prose or grid]
```

### Issues

- **No title hierarchy** — no `<h1>` on the view
- **Sub-tab labels use numbers** — implies mandatory sequence
- **Content panels are uniform** — no visual distinction between normative reference and internal note
- **"Livelli" sub-tab** shows a 2×2 grid of grade levels — unrelated to "sources"
- **Font sizes** — same 8-11px issue as A01 (cross-cutting)
- **No source metadata** — no dates, authors, or badges visible
- **No links** — no clickable references to original documents

---

## 10. Accessibility

| Issue | Severity | Evidence |
|-------|----------|----------|
| No heading hierarchy | Medium | No `<h1>` or `<h2>` in InfoViews |
| Sub-tab buttons use `onClick` without `role="tab"` | Medium | Not semantically tabs |
| No `aria-selected` on active sub-tab | Low | Screen reader cannot identify active tab |
| Font sizes 8-11px | High | Cross-cutting from A01 |
| No skip-to-content | Medium | Cross-cutting from A01 |
| Content panels use `<div>` not `<section>` | Low | No semantic structure |

---

## 11. Responsiveness

| Viewport | Behavior | Issue |
|----------|----------|-------|
| 1440px | Full width, readable | OK |
| 1366px | Full width | OK |
| 1024px | Sub-tab bar may wrap | Minor |
| 768px (tablet) | Content stacks | OK but dense |
| 390px (mobile) | Sub-tab bar horizontal scroll | May be off-screen |

---

## 12. Integration Analysis

| Area | Direction | Connection | Issue |
|------|-----------|------------|-------|
| A02 Curriculum | → Fonti | **None** | Curriculum decisions don't reference sources |
| A04 Planning | → Fonti | **None** | Planning doesn't cite sources |
| A07 Documents | → Fonti | **None** | Exports don't include source citations |
| A10 Second Brain | ↔ Fonti | **Indirect** | WikiLLM mentions "fonti" in prose |
| A01 Home | → Fonti | **None** | No dashboard presence |
| A03 Revision | → Fonti | **None** | Gap revision doesn't link to normativa |

**Finding: The Fonti area is a dead end.** It is not integrated with any other area of the system. A teacher who consults the fonti gains no actionable connection to curriculum, planning, or documents.

---

## 13. Reliability

| Scenario | Behavior | Issue |
|----------|----------|-------|
| First access | Shows "Premessa" sub-tab | OK |
| Page reload | State restored (sub-tab preserved in `activeGeneralSubtab`) | OK |
| No data | N/A — all content is hardcoded | No empty state needed |
| Console errors | None observed | OK |

---

## 14. Technical Coverage

| Element | Present | Adeguato | Gap |
|---------|---------|----------|-----|
| Unit tests | No | — | No tests for InfoViews fonti content |
| Interaction tests | No | — | No filter/search tests (no filters exist) |
| Accessibility tests | No | — | No a11y tests |
| Responsive tests | No | — | No viewport tests |
| Navigation tests | Partial | — | `navigation.cml604d.test.tsx` covers tab switching |
| Storybook | No | — | `.storybook/` missing |
| Browser verification | No | — | No runtime evidence |

### Technical verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | **PASS** — 0 errors |
| `npm run build` | **PASS** — 1,143.80 kB |

---

## 15. Scores

| Dimension | Score | Key Finding |
|-----------|-------|-------------|
| Valore per l'utente | **1** | Teacher reads prose but gains no actionable information |
| Coerenza funzionale | **1** | No search, no filters, no links, no integration |
| Qualità delle fonti | **0** | No metadata, no dates, no authority, no verification possible |
| Completezza dei metadati | **0** | Zero metadata fields present |
| Comprensibilità | **2** | Text is readable but uses jargon and editorializing |
| Gerarchia visiva | **2** | Uniform panels, no distinction between normativa and internal |
| Navigazione | **2** | Sub-tabs work but no search/filter/back |
| Accessibilità | **1** | No semantic HTML, no tab roles, small fonts |
| Responsività | **2** | Basic stacking but sub-tabs may overflow on mobile |
| Affidabilità | **4** | Hardcoded content, no failure modes |
| Copertura tecnica | **0** | Zero tests for this area |
| Integrazione | **0** | Completely isolated from all other areas |

**Dimensions below 3:** Valore (1), Coerenza (1), Qualità fonti (0), Metadati (0), Comprensibilità (2), Gerarchia (2), Navigazione (2), Accessibilità (1), Responsività (2), Copertura (0), Integrazione (0)

**11 of 12 dimensions below threshold.**
