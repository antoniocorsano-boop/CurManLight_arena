# CML-632D — A02 Curriculum Consultation — Findings

## Criticality Classification

### BLOCCANTE (Blocking)

| ID | Finding | Evidence | Impact |
|----|---------|----------|--------|
| A02-B01 | **No order selector in UI** | `setOrder` exists in store but no UI element exposes it. Teacher is stuck on default order (`secondaria`). Only way to change is MappaView (shows all 3) or store manipulation. | Teacher cannot consult curriculum for different school orders from the main view. |
| A02-B02 | **No source metadata on any curriculum item** | Traguardi, obiettivi, evidenze have zero metadata: no source, date, version, status, authority. DM 254/2012 and DM 221/2025 references exist only as inline text in proposals. | Teacher cannot verify origin, currency, or authority of any curriculum content. |
| A02-B03 | **No selection transfer to A04** | `selectedTraguardi`/`selectedObiettivi` exist in store but are populated independently in A02 and A04. No mechanism to select items in consultation and use them in planning. | Curriculum consultation has no operational outcome — teacher cannot act on what they consult. |
| A02-B04 | **No connection to A11 (Sources)** | A02 does not reference A11; A11 does not reference A02. Neither has structured source data. | Curriculum decisions cannot be traced to authoritative sources. |
| A02-B05 | **Frozen pilot still accessible** | `PilotMainView` (CML-631) accessible via "★ Pilota Sperimentale" sub-menu. | Confuses frozen experimental content with canonical curriculum. |

### RILEVANTE (Significant)

| ID | Finding | Evidence | Impact |
|----|---------|----------|--------|
| A02-R01 | **Evidenze not shown in consultation** | `evidenze` exist in KB for all disciplines but are not displayed in AlberoView or MappaView. Only shown in popolamento (AI generation output). | Teacher cannot see observable evidence for assessment planning. |
| A02-R02 | **Nuclei Fondanti not shown** | `nucleiFondanti` exist in KB but are not displayed in AlberoView. Only used as labels in infanzia cards. | Teacher cannot see the thematic nuclei that organize content. |
| A02-R03 | **Hardcoded "Mappa Validata" badge** | Badge shown on every discipline regardless of actual validation state. | Misleading — implies all content is validated when it may not be. |
| A02-R04 | **No text search** | No search across curriculum content. Teacher must read through all traguardi/obiettivi manually. | Cannot find specific content efficiently. |
| A02-R05 | **No detail view per item** | Traguardi/obiettivi shown in scrollable lists with no expand/collapse, no metadata, no actions. | Cannot inspect individual items or perform actions on them. |
| A02-R06 | **Inconsistent evidenze population** | A02 (AlberoView) does not show evidenze at all. A04 (ProgettazioneTab) populates `selectedEvidenze` from store. The two areas populate selections differently. | Teacher sees evidenze in one place but not the other; selections may be inconsistent. |
| A02-R07 | **View switcher hidden for real users** | `navigator.webdriver` check hides the Albero/Mappa/Popolamento switcher. Real users see only the `home` view and must use sidebar sub-menu. | Extra navigation step for primary function. |
| A02-R08 | **"Swarm di Esperti" terminology** | `proposal.notes` uses "Parere dello Swarm di Esperti" — non-standard, potentially confusing. | Undermines professional credibility. |
| A02-R09 | **Home view disconnected** | `home` view shows 3 action cards but provides no data summary, no progress indicator, no quick access to recently viewed content. | First-time users get no orientation into curriculum state. |
| A02-R10 | **Inglese missing proposals** | Inglese has 0 proposals across all 3 orders — no gap analysis for the reform. | Teacher cannot review or vote on English curriculum changes. |
| A02-R11 | **Incomplete disciplines** | `secondaLingua`: empty infanzia/primaria. `religione`: empty all. `latino`: empty infanzia/primaria. | 3 disciplines have no curriculum data in some orders — teacher sees empty state. |

### MINORE (Minor)

| ID | Finding | Evidence | Impact |
|----|---------|----------|--------|
| A02-M01 | **"Ambito di Raccordo d'Istituto" jargon** | Header text is bureaucratic and unclear. | Minor comprehension barrier. |
| A02-M02 | **"Raccordo Diacronico" jargon** | MappaView label is technical. | Minor comprehension barrier. |
| A02-M03 | **Font sizes 8-11px** | Labels, badges, subtitles use 8-11px. | Cross-cutting from A01 — readability issue. |
| A02-M04 | **No heading hierarchy** | CurriculumTab uses `<span>` for labels, `<h2>` for title, no `<h1>`. | Minor accessibility impact. |
| A02-M05 | **No "next step" CTA** | Teacher finishes consultation with no clear action. | Minor workflow gap. |
| A02-M06 | **Proposals inline annotations** | `[IN 2025: ...]` suffix baked into display text, not structured data. | Minor data quality issue. |
| A02-M07 | **selectedTraguardi reset on discipline change** | `setDiscipline` resets selections to `[0]`. | Minor — teacher loses selections when switching discipline. |

### OPPORTUNITÀ (Opportunity)

| ID | Finding | Evidence | Impact |
|----|---------|----------|--------|
| A02-O01 | **Curriculum comparison** | MappaView shows vertical progression but no side-by-side comparison of same discipline across orders. | Could help teacher understand progression. |
| A02-O02 | **Evidenze as planning input** | Evidenze exist but are not connected to assessment planning. | Could bridge consultation → assessment workflow. |
| A02-O03 | **Domain layer unused** | CML-630E domain entities (CurriculumSegment, VerticalCurriculumLink) exist but are not connected to UI. | Could provide structured data model for future. |
| A02-O04 | **Favorites/bookmarks** | No way to bookmark frequently consulted disciplines or items. | Could improve repeated access. |
| A02-O05 | **Recent view history** | No indication of last consulted discipline/order. | Could speed up return visits. |

---

## Findings Summary

| Severity | Count |
|----------|-------|
| BLOCCANTE | 5 |
| RILEVANTE | 11 |
| MINORE | 7 |
| OPPORTUNITÀ | 5 |
| **Total** | **28** |

---

## Dependency Map

```
A02-B01 (No order selector) ← independent
A02-B02 (No metadata) ← A02-B04 (No A11 connection) ← A02-R04 (No search)
A02-B03 (No selection transfer) ← A02-R06 (Inconsistent evidenze)
A02-B04 (No A11 connection) ← A02-B02 (No metadata)
A02-B05 (Frozen pilot) ← independent
A02-R01 (No evidenze) ← A02-R06 (Inconsistent evidenze)
A02-R02 (No nuclei) ← independent
A02-R03 (Hardcoded badge) ← independent
A02-R07 (Hidden view switcher) ← A02-R09 (Disconnected home)
A02-R10 (No English proposals) ← independent
A02-R11 (Incomplete disciplines) ← independent
```

---

## Proposed Interventions

### Must resolve (blocking):

1. **Add order selector** — expose `setOrder` in the CurriculumTab UI
2. **Add source metadata** — at minimum: source DM, date, authority for each curriculum item
3. **Implement selection transfer** — allow teacher to select traguardi/obiettivi in A02 and use them in A04
4. **Connect to A11** — link curriculum items to their source documents
5. **Hide or disable frozen pilot** — remove "★ Pilota Sperimentale" from active navigation

### Should resolve (significant):

6. **Show evidenze in consultation** — display observable evidence alongside traguardi/obiettivi
7. **Show nuclei fondanti** — display thematic nuclei as navigation or filter
8. **Remove hardcoded badge** — make "Mappa Validata" data-driven or remove
9. **Add text search** — enable finding specific content across disciplines
10. **Add detail view per item** — expandable cards with metadata and actions
11. **Reconcile evidenze population** — ensure A02 and A04 use same selection mechanism
12. **Expose view switcher for all users** — remove `navigator.webdriver` gate
13. **Replace "Swarm di Esperti"** — use standard terminology
14. **Improve home view** — add data summary, progress, recent access
15. **Add English proposals** — complete gap analysis for all disciplines
16. **Address incomplete disciplines** — either populate or hide empty orders

### Could improve (minor):

17. Simplify jargon ("Ambito di Raccordo", "Raccordo Diacronico")
18. Fix font sizes (cross-cutting A01)
19. Add heading hierarchy
20. Add "next step" CTA
21. Structure proposal annotations as metadata
22. Preserve selections on discipline change
23. Add no-heading-state for empty disciplines

---

## Acceptance Criteria for Resolution

- Teacher can change school order from the CurriculumTab UI
- Every curriculum item shows its source, date, and authority
- Teacher can select traguardi/obiettivi in A02 and use them in A04 without re-entering
- Curriculum items link to their source documents in A11
- Frozen pilot is not accessible from normal navigation
- Evidenze are visible alongside traguardi/obiettivi
- Teacher can search across all curriculum content
