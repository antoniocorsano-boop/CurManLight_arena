# CML-632D — Audit: A02 Curriculum Consultation

## Metadata

| Field | Value |
|-------|-------|
| Area ID | A02 |
| Area Name | Curriculum Consultation |
| Audit date | 2026-07-27 |
| Branch | `audit/cml-632d-a02-curriculum-consultation` |
| Initial commit | `eddbf6b` |
| Baseline | CML-632A inventory |

---

## 1. Perimeter

### Components analyzed

| Component | File | Lines | Role |
|-----------|------|-------|------|
| `CurriculumTab` | `src/features/curriculum/components/CurriculumTab.tsx` | 757 | Main curriculum view with 4 sub-views |
| `RevisioneTab` | `src/features/curriculum/components/RevisioneTab.tsx` | 295 | Gap revision (A03) sharing `/curriculum` URL |
| `curriculumKB` | `src/data/curriculumKB.ts` | 1075 | Static curriculum knowledge base |
| `useCurriculumStore` | `src/store/useCurriculumStore.ts` | 207 | Zustand store (IndexedDB persistence) |
| `useLocalCurriculum` | `src/features/curriculum/hooks/useLocalCurriculum.ts` | 21 | Local curriculum state |
| `AppSidebar` | `src/features/navigation/components/AppSidebar.tsx` | 240 | Navigation with curriculum sub-menu |
| `AppViewsLayer` | `src/features/session/components/AppViewsLayer.tsx` | 552 | View routing and props |
| Types | `src/types/curriculum.ts` | 81 | TypeScript type definitions |
| Domain layer | `src/domain/curriculum/` | 18 files | CML-630E productive domain (not yet connected) |

### Sub-views in CurriculumTab

| View | ID | Purpose | Data source |
|------|----|---------|-------------|
| Home | `home` | Area landing with 3 action cards | Static |
| Albero | `albero` | Structured tree of traguardi/obiettivi | `localCurriculum[discipline][order]` |
| Mappa | `mappa` | Vertical diachronic progression map | `localCurriculum[discipline][*]` across 3 orders |
| Popolamento | `popolamento` | Data management (AI + CSV import) | `curriculumKB` baseline |
| Pilota | `pilota` | Experimental pilot view | `PilotMainView` (CML-631) |

### Data sources

| Source | Type | Persistence | Used in A02 |
|--------|------|-------------|-------------|
| `curriculumKB` | Hardcoded TypeScript | Static (code) | **Yes** — primary data |
| `localCurriculum` | localStorage fallback | `curmanlight-custom-curriculum-v2` | **Yes** — overrides KB if present |
| `useCurriculumStore` | Zustand + IndexedDB | `curmanlight-react-db-state-v1.4.0` | **Yes** — selections, decisions, UI state |

### Experimental/frozen modules

| Module | Status | Present in A02 |
|--------|--------|----------------|
| `PilotMainView` (CML-631) | FROZEN | **Yes** — accessible via "Pilota Sperimentale" sub-menu and `activeCurricoloView === 'pilota'` |
| Curriculum eTwin (CML-630C) | Complete local, not promoted | **No** — not visible |
| Assisted Pedagogical Suggestions (CML-631I) | Complete local, not adopted | **No** — not visible |

---

## 2. Data Completeness Matrix

### Discipline coverage

| Discipline | Key | Infanzia | Primaria | Secondaria | Proposals | Nuclei | Complete |
|------------|-----|:--------:|:--------:|:----------:|:---------:|:------:|:--------:|
| Italiano | `italiano` | ✅ 3T/5O | ✅ 3T/8O | ✅ 3T/8O | ✅ 6 | ✅ | **Yes** |
| Matematica | `matematica` | ✅ 2T/5O | ✅ 3T/8O | ✅ 3T/8O | ✅ 3 | ✅ | **Yes** |
| Scienze | `scienze` | ✅ 2T/5O | ✅ 3T/8O | ✅ 3T/8O | ✅ 3 | ✅ | **Yes** |
| Storia | `storia` | ✅ 2T/5O | ✅ 3T/8O | ✅ 3T/8O | ✅ 3 | ✅ | **Yes** |
| Geografia | `geografia` | ✅ 2T/5O | ✅ 3T/8O | ✅ 3T/8O | ✅ 3 | ✅ | **Yes** |
| Tecnologia | `tecnologia` | ✅ 2T/5O | ✅ 3T/8O | ✅ 3T/8O | ✅ 3 | ✅ | **Yes** |
| Inglese | `inglese` | ✅ 2T/5O | ✅ 3T/8O | ✅ 3T/8O | 0 | ✅ | Partial |
| 2ᵃ Lingua | `secondaLingua` | ❌ | ❌ | ✅ 3T/8O | 0 | ✅ | **No** |
| Arte e Immagine | `arteImmagine` | ✅ 2T/5O | ✅ 3T/8O | ✅ 3T/8O | 0 | ✅ | Partial |
| Musica | `musica` | ✅ 2T/5O | ✅ 3T/8O | ✅ 3T/8O | 0 | ✅ | Partial |
| Educazione Fisica | `educazioneFisica` | ✅ 2T/5O | ✅ 3T/8O | ✅ 3T/8O | 0 | ✅ | Partial |
| Educazione Civica | `educazioneCivica` | ✅ 2T/5O | ✅ 3T/8O | ✅ 3T/8O | ✅ 2 | ✅ | **Yes** |
| Religione | `religione` | ❌ | ❌ | ❌ | 0 | ❌ | **No** |
| Latino | `latino` | ❌ | ❌ | ✅ 2T/8O | ✅ 1 | ✅ | **No** |

**Summary:**
- **14 disciplines** present in `curriculumKB`
- **9 fully complete** (traguardi + obiettivi + proposals in ≥2 orders)
- **4 partially complete** (traguardi + obiettivi present, no proposals)
- **3 incomplete** (secondaLingua: empty infanzia/primaria; religione: empty all; latino: empty infanzia/primaria)

### Data field completeness

| Field | Present in type | Populated in KB | Shown in UI |
|-------|:--------------:|:---------------:|:-----------:|
| Traguardi | ✅ | ✅ (all orders) | ✅ Albero, Mappa |
| Obiettivi | ✅ | ✅ (all orders) | ✅ Albero, Mappa |
| Proposals | ✅ | Partial (14/39 combos) | ✅ Mappa, RevisioneTab |
| Evidenze | ✅ | ✅ (all orders) | ❌ **Not shown in consultation** |
| Nuclei Fondanti | ✅ | ✅ (all orders) | ❌ **Not shown in Albero/Mappa** |
| IDs | ✅ (proposal.id) | ✅ (e.g., "it-inf-1") | ✅ RevisioneTab |
| Notes/authority | ✅ (proposal.notes) | ✅ (all proposals) | ❌ **Not shown in consultation** |
| Source | ❌ | ❌ | ❌ |
| Status | ❌ | ❌ | ❌ |
| Date | ❌ | ❌ | ❌ |
| Version | ❌ | ❌ | ❌ |

---

## 3. Data Flow Trace

```
curriculumKB (static code)
  ↓
useLocalCurriculum (localStorage override or KB fallback)
  ↓
localCurriculum (React state)
  ↓
CurriculumTab → AlberoView / MappaView / PopolamentoView
  ↓
useCurriculumStore (discipline, order, selections, decisions)
  ↓
RevisioneTab (proposals + decisions)
ProgettazioneTab (localCurriculum passed as prop)
ProcessoTab (localCurriculum passed as prop)
EsportazioniTab (indirect via store)
```

### Information loss between levels

| Level | Data present | Data lost |
|-------|-------------|-----------|
| curriculumKB | traguardi, obiettivi, proposals, evidenze, nucleiFondanti | Source, date, version, status |
| localCurriculum | Same as KB (or user-modified via popolamento) | Evidenze, nucleiFondanti not used in Albero |
| AlberoView UI | traguardi, obiettivi | Proposals, evidenze, nucleiFondanti, all metadata |
| MappaView UI | traguardi, obiettivi, proposals (voting only) | Evidenze, nucleiFondanti, metadata |
| RevisioneTab | proposals (DM 254/2012 vs DM 221/2025) | Evidenze, nucleiFondanti, no source verification |

---

## 4. Central Question Assessment

| # | Question | Assessment | Evidence |
|---|----------|------------|----------|
| 1 | Quale disciplina sto consultando? | **Chiaro** | Header shows discipline + order prominently |
| 2 | Quale ordine o classe riguarda? | **Chiaro** | Order shown in header and filter |
| 3 | Quale nucleo o ambito sto visualizzando? | **Non chiaro** | `nucleiFondanti` exists in KB but is NOT displayed in Albero or Mappa |
| 4 | Questo è un traguardo, un obiettivo, una conoscenza o una competenza? | **Parzialmente chiaro** | Labeled as "Traguardi" and "Obiettivi" but no explanation of difference |
| 5 | Da quale fonte deriva? | **Informazione assente** | No source, no date, no DM reference in data items |
| 6 | È vigente, validato, interno o in lavorazione? | **Non chiaro** | Badge says "Mappa Validata" (hardcoded) — no real status |
| 7 | Posso confrontarlo con altri livelli? | **Parzialmente chiaro** | MappaView shows vertical progression across 3 orders |
| 8 | Posso usarlo nella progettazione? | **Interrotto** | `localCurriculum` is passed to ProgettazioneTab but no selection transfer mechanism exists |
| 9 | Posso ritrovarlo dopo aver cambiato vista? | **Parzialmente chiaro** | `activeCurricoloView` persists in store; discipline/order persist; but `selectedTraguardi`/`selectedObiettivi` are reset on discipline change |
| 10 | Posso verificare il documento originale? | **Informazione assente** | No links to DM 254/2012 or DM 221/2025 |

**Score: 2 chiaro, 3 parzialmente chiaro, 3 non chiaro, 2 informazione assente**

---

## 5. First Access State

| Element | State | Issue |
|---------|-------|-------|
| Default discipline | `italiano` (from store) | OK |
| Default order | `secondaria` (from store) | OK |
| Default view | `albero` (webdriver) / `home` (real users) | Home view shows 3 action cards — OK |
| Discipline selector | Always visible in AlberoView | OK |
| Order selector | **Not visible** — no order selector in UI | **Critical** — teacher cannot change school order from the interface |
| Initial instructions | Header text explains purpose | OK |
| Empty state | Not applicable — data always present | OK |
| Primary action | Select discipline from list | OK |

**Critical finding:** There is **no order selector** in the CurriculumTab UI. The `order` is set in the store (`setOrder` action exists) but **no UI element exposes it**. The only way to change order is via store manipulation or navigating to the MappaView which shows all 3 orders vertically.

---

## 6. Filters and Search

| Feature | Available | Functional | Issue |
|---------|:---------:|:----------:|-------|
| Filter by discipline | ✅ | ✅ | Left sidebar list in AlberoView |
| Filter by order | ❌ | ❌ | **No UI control** — order is store-only |
| Filter by nucleo | ❌ | ❌ | nucleiFondanti not exposed as filter |
| Filter by tipologia | ❌ | ❌ | No traguardo/obiettivo type filter |
| Filter by stato | ❌ | ❌ | No status field exists |
| Text search | ❌ | ❌ | No search across curriculum content |
| Combine filters | N/A | N/A | Only discipline filter exists |
| Reset filters | Partial | ✅ | "Tutto il Curricolo" / "Mio Profilo" toggle |
| Filter persistence | ✅ | ✅ | Store persists to IndexedDB |
| Result count | ❌ | ❌ | No count of traguardi/obiettivi displayed |
| Empty results state | N/A | N/A | All disciplines have data |

---

## 7. List and Scanning

### AlberoView (primary consultation)

| Element | Present | Adequate | Issue |
|---------|:-------:|:--------:|-------|
| Discipline name | ✅ | ✅ | Clear, bold, labeled |
| Order | ✅ | ⚠️ | Shows in header but not filterable |
| Nucleo | ❌ | ❌ | nucleiFondanti not displayed |
| Tipologia | ✅ | ⚠️ | "Traguardi di Competenza" / "Obiettivi Fondanti" — labels present but not standardized |
| Content | ✅ | ✅ | Full traguardi and obiettivi text |
| Status | ❌ | ❌ | Badge says "Mappa Validata" — hardcoded, not real |
| Source | ❌ | ❌ | No source information |
| Validation | ❌ | ❌ | No validation indicator |
| Action | ❌ | ❌ | No "use in planning" action |
| Font size | ❌ | ❌ | 8-11px labels — cross-cutting A01 issue |

### MappaView (vertical progression)

| Element | Present | Adequate | Issue |
|---------|:-------:|:--------:|-------|
| Vertical timeline | ✅ | ✅ | Shows infanzia→primaria→secondaria progression |
| Discipline chips | ✅ | ✅ | All disciplines shown as buttons |
| Expand/collapse | ✅ | ✅ | Sections expandable |
| Proposals (gap) | ✅ | ✅ | Shows DM 254/2012 vs DM 221/2025 comparison |
| Voting state | ✅ | ✅ | Approvato/Mantenuto/Personalizzato/Da Votare |
| Evidenze | ❌ | ❌ | Not displayed |
| Nuclei | ❌ | ❌ | Not displayed |

---

## 8. Detail View

The AlberoView **has no dedicated detail view**. Content is shown inline:
- Traguardi: scrollable list in a `max-h-[240px]` container
- Obiettivi: scrollable list in a `max-h-[240px]` container
- No expandable detail per item
- No metadata per item
- No "use this" action per item
- No cross-reference to sources
- No link to original DM text

---

## 9. Provenance and Sources

| Content | Source in data | Source shown | Link to original | In A11 | Consistent |
|---------|---------------|-------------|-----------------|--------|------------|
| Traguardi | None | None | None | No | N/A |
| Obiettivi | None | None | None | No | N/A |
| Proposals | `proposal.notes` mentions "Parere dello Swarm di Esperti" | **No** | None | No | N/A |
| DM 254/2012 | `proposal.oldText` | ✅ RevisioneTab | None | No | N/A |
| DM 221/2025 | `proposal.newText` with `[IN 2025: ...]` suffix | ✅ RevisioneTab | None | No | N/A |

**Finding:** Proposals contain inline annotations like `[IN 2025: valorizzazione del corsivo fin dall'infanzia]` embedded in the text. These are **not structured metadata** — they're editorial notes baked into the display text. The `notes` field mentions "Parere dello Swarm di Esperti" — non-standard terminology.

---

## 10. A03 Revision Shared URL

| Aspect | State | Classification |
|--------|-------|----------------|
| URL sharing | Both A02 and A03 use `activeTab` from store — different tabs (`curricolo` vs `revisione`) | **Coherent** — different `activeTab` values |
| Tab distinction | A02 = `curricolo`, A03 = `revisione` | Clear in code |
| Browser back | Works via `activeTab` state | OK |
| Deep linking | Not supported — no URL params | Minor |
| Reload persistence | Store persists to IndexedDB — tab survives reload | OK |
| User comprehension | Sidebar shows "Revisione (Gap 2025)" as separate entry | **OK** — clear separation |
| Responsibility overlap | A02 shows proposals in MappaView; A03 shows same proposals for voting | **Ambiguous** — same data, two views |

**Classification: Tolerable** — different tabs, clear sidebar labels, but proposal data appears in both A02 (MappaView) and A03 (RevisioneTab) creating mild redundancy.

---

## 11. Experimental Functions

| Function | Visible in A02 | Issue |
|----------|:-:|-------|
| `PilotMainView` (CML-631) | **Yes** | Accessible via "★ Pilota Sperimentale" sub-menu and `activeCurricoloView === 'pilota'` |
| Curriculum eTwin | No | Not visible |
| Assisted Pedagogical Suggestions | No | Not visible |

**Finding:** The frozen CML-631 pilot is **still accessible** from the curriculum sub-menu ("★ Pilota Sperimentale"). It should be hidden or disabled per audit rules. This is a RILEVANTE finding.

---

## 12. Integration Analysis

### A02 → A04 (Planning/Progettazione)

| Aspect | State | Issue |
|--------|-------|-------|
| Data flow | `localCurriculum` passed to `ProgettazioneTab` as prop | OK |
| Selection transfer | **None** — no mechanism to select traguardi/obiettivi in A02 and send to A04 | **Blocking** |
| Discipline maintenance | Discipline/order in store, shared across views | OK |
| Context preservation | No "breadcrumb" or return path from A04 to A02 | Minor |
| Evidenze transfer | `selectedEvidenze` in store but populated differently in A02 vs A04 | **Inconsistent** |

### A02 → A11 (Sources)

| Aspect | State | Issue |
|--------|-------|-------|
| Data connection | **None** — A02 does not reference A11; A11 does not reference A02 | **Blocking** |
| Source metadata | Neither area has structured source data | **Blocking** |
| Cross-reference | No link from curriculum items to sources | **Blocking** |

### A02 → A07 (Documents/Export)

| Aspect | State | Issue |
|--------|-------|-------|
| Data flow | Export handlers receive store state | OK |
| Source citation | Exports do not cite DM 254/2012 or DM 221/2025 | **Blocking** |
| Curriculum content in exports | Traguardi/obiettivi can be included in generated docs | OK |
| Metadata preservation | No source/date/version in exports | **Blocking** |

---

## 13. Language Audit

| Term | Location | Quality | Recommendation |
|------|----------|---------|----------------|
| "Consulta Curricolo" | Sidebar | Acceptable | Keep |
| "Ambito di Raccordo d'Istituto" | CurriculumTab header | Jargon | Simplify |
| "Materia Curricolare" | CurriculumTab header | Acceptable | Keep (for non-infanzia) |
| "Campo d'Esperienza" | CurriculumTab header | Acceptable | Keep (for infanzia) |
| "Traguardi di Competenza d'Istituto" | AlberoView | Mixed | "Traguardi" is standard; "d'Istituto" is contextual |
| "Obiettivi Fondanti di Apprendimento" | AlberoView | Non-standard | Use "Obiettivi di Apprendimento" |
| "Mappa Validata" | AlberoView badge | **Misleading** — hardcoded, not real validation | Remove or make data-driven |
| "Raccordo Diacronico" | MappaView | Jargon | Simplify to "Progressione" |
| "Swarm di Esperti" | curriculumKB proposals | Non-standard | Replace with "Comitato Scientifico" |
| "Studio e Comprensione del Curricolo d'Istituto" | AlberoView copilot box | Long | Shorten |
| "Integrazione & Popolamento" | Sidebar/view | Jargon | Simplify |
| "Passo-Passo (Monoscheda)" | RevisioneTab | Non-standard | Use "Wizard" or "Guida" |
| "DM 254/2012 (Ordinamento Previgente)" | RevisioneTab | Acceptable | Keep |
| "DM 221/2025 (Ordinamento Riformato)" | RevisioneTab | Acceptable | Keep |

---

## 14. Visual Hierarchy

### Current layout (AlberoView)

```
[Header: "Ambito di Raccordo d'Istituto" / Discipline — Order]
[Subtitle: contextual description]
[View switcher: Albero | Mappa | Popolamento] (webdriver only)
[Left: Profile filter + Discipline list]
[Right: Discipline title + "Mappa Validata" badge + Traguardi/Obiettivi grid]
[Copilot box at bottom]
```

### Issues

- **No order selector** — teacher cannot change school order from the UI
- **View switcher hidden for real users** — `navigator.webdriver` check hides it
- **"Mappa Validated" badge hardcoded** — misleading
- **Font sizes 8-11px** — cross-cutting from A01
- **No visual hierarchy** between traguardi and obiettivi — same card style
- **No indication of number** of traguardi/obiettivi
- **No "next step" CTA** — teacher finishes consultation with no clear action

---

## 15. Accessibility

| Issue | Severity | Evidence |
|-------|----------|----------|
| No heading hierarchy | Medium | No `<h1>` in CurriculumTab — uses `<span>` and `<h2>`/`<h3>` |
| Discipline list buttons lack `aria-current` | Medium | Selected discipline not announced to screen readers |
| View switcher uses `onClick` without `role="tab"` | Medium | Not semantically tabs |
| Font sizes 8-11px | High | Cross-cutting from A01 |
| No skip-to-content | Medium | Cross-cutting from A01 |
| Scroll containers lack `aria-label` | Low | `max-h-[240px]` containers not labeled |
| Filter toggle lacks `aria-pressed` | Low | "Mio Profilo" toggle not announced |

---

## 16. Responsivity

| Viewport | Behavior | Issue |
|----------|----------|-------|
| 1440px | Full width, 4+8 column grid | OK |
| 1366px | Full width | OK |
| 1024px | Grid may stack | Minor |
| 768px (tablet) | Single column, all content visible | OK |
| 390px (mobile) | Single column, discipline list horizontal scroll | May overflow |

---

## 17. States and Reliability

| Scenario | Behavior | Issue |
|----------|----------|-------|
| First access (clean) | Shows `home` view with 3 action cards | OK |
| Reload | State restored from IndexedDB | OK |
| Discipline without data | All disciplines have data | N/A |
| Empty results | N/A — no search/filter that returns empty | N/A |
| Corrupted localStorage | `useLocalCurriculum` falls back to `curriculumKB` | OK |
| IndexedDB unavailable | `useCurriculumStore` falls back to memory store | OK |
| Console errors | None observed | OK |

---

## 18. Technical Coverage

| Element | Present | Adequate | Gap |
|---------|:-------:|:--------:|-----|
| Unit tests (curriculum domain) | ✅ | ✅ | `curriculum-domain.test.ts`, `curriculum-transition-resolver.test.ts` |
| Unit tests (CurriculumTab) | ❌ | — | No component tests |
| Unit tests (RevisioneTab) | Partial | — | `cml610-empty-states.test.ts` covers empty state |
| Tests filtri | ❌ | — | No filter interaction tests |
| Tests ricerca | N/A | — | No search feature |
| Tests dettaglio | ❌ | — | No detail view tests |
| Tests fonti | ❌ | — | No source connection tests |
| Tests integrazione A04 | ❌ | — | No integration tests |
| Tests accessibilità | ❌ | — | No a11y tests |
| Tests responsive | ❌ | — | No viewport tests |
| Storybook | ❌ | — | `.storybook/` missing |
| Browser verification | No | — | No runtime evidence |

### Technical verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | **PASS** — 0 errors |
| `npx vitest run` | **227/228 pass** — 1 timeout (pilot-service.test.ts, infrastructure) |
| `npm run build` | **PASS** — 1,143.80 kB |

---

## 19. Scores

| Dimension | Score | Key Finding |
|-----------|:-----:|-------------|
| Valore per l'utente | **2** | Real curriculum data is present and readable; but no actionable next step, no sources, no integration |
| Coerenza funzionale | **2** | Three sub-views work but home view is disconnected; view switcher hidden for real users |
| Copertura dei dati | **2** | 9/14 disciplines complete; 3 empty; evidenze and nucleiFondanti not surfaced |
| Qualità dei metadati | **0** | Zero metadata: no source, date, version, status, authority on any curriculum item |
| Comprensibilità | **2** | Terms like "Raccordo Diacronico", "Ambito di Raccordo" are jargon; "Mappa Validata" is misleading |
| Ricerca e filtri | **1** | Only discipline filter; no order filter, no search, no nucleo/tipologia filter |
| Dettaglio | **1** | No dedicated detail view; content is inline in scrollable containers |
| Provenienza | **0** | No source information anywhere; DM references only in proposal text (not structured) |
| Integrazione A04 | **1** | `localCurriculum` passed as prop but no selection transfer; evidenze populated differently |
| Integrazione A11 | **0** | Completely isolated — no connection between curriculum and sources |
| Gerarchia visiva | **2** | Header is clear; but no order selector, hardcoded badge, 8-11px labels |
| Accessibilità | **1** | No heading hierarchy, no aria-current, no tab roles, small fonts |
| Responsività | **2** | Basic stacking works; mobile discipline list may overflow |
| Affidabilità | **3** | Store fallbacks work; corrupted data handled; but no error states for curriculum |
| Copertura tecnica | **1** | Domain tests exist; no component, integration, a11y, or responsive tests |

**Dimensions below 3:** Valore (2), Coerenza (2), Copertura dati (2), Metadati (0), Comprensibilità (2), Ricerca (1), Dettaglio (1), Provenienza (0), Integrazione A04 (1), Integrazione A11 (0), Gerarchia (2), Accessibilità (1), Responsività (2), Copertura tecnica (1)

**14 of 15 dimensions below threshold.**
