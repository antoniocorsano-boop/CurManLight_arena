# CML-632C — A11 Institute Sources — Findings

## Criticality Classification

### BLOCCANTE (Blocking)

| ID | Finding | Evidence | Impact |
|----|---------|----------|--------|
| A11-B01 | **Zero source metadata** | No dates, authors, versions, authority levels, or validity indicators on any source. | Teacher cannot assess currency, authority, or reliability of any content. |
| A11-B02 | **No links to original documents** | All sources are paraphrased prose with no hyperlinks to D.M. 221/2025, DM 254/2012, or any other normative text. | Teacher cannot verify claims or consult original sources. |
| A11-B03 | **No distinction between normativa and internal** | Constitutional principles, national reform, and internal grade levels are presented in identical format. | Teacher cannot distinguish binding legal requirements from institutional preferences. |
| A11-B04 | **Completely isolated from system** | Fonti view is not referenced by curriculum, planning, documents, or any other area. | Sources serve no operational purpose; teacher gains no actionable connection. |

### RILEVANTE (Significant)

| ID | Finding | Evidence | Impact |
|----|---------|----------|--------|
| A11-R01 | **Unverified claims in text** | "Educazione Economico-Finanziaria obbligatoria", "studio etico ed algoritmico dell'IA", "ecologia d'istituto" — all stated as fact without citation. | Misinformation risk if claims don't match actual DM text. |
| A11-R02 | **Editorialized language** | "La Svolta delle Nuove Indicazioni", "pilastri innovativi", "sviluppare cittadini consapevoli". | Undermines credibility; reads as advocacy, not reference. |
| A11-R03 | **curriculumKB not connected to Fonti** | 14 disciplines × 3 orders of real curriculum data exist in `curriculumKB.ts` but are not displayed or referenced in the Fonti view. | Actual authoritative data is invisible in the area meant to show sources. |
| A11-R04 | **"obiettivi" sub-tab nearly empty** | Contains only one sentence: "I docenti d'inizio anno scelgono e raccordano le evidenze d'istituto basandosi sulle competenze mirate europee." | Misleading — implies comprehensive content that doesn't exist. |
| A11-R05 | **No search, filter, or sort** | All content is static prose with no interaction beyond sub-tab switching. | Teacher cannot find specific information efficiently. |
| A11-R06 | **"I.C. don Lorenzo Milani" hardcoded** | Guide tab contains specific school name in generic help text. | Should be parameterized or made generic for portability. |
| A11-R07 | **Sub-tab numbering implies sequence** | "1. Premessa & Profilo", "2. Riforma IN 2025", etc. | Content is independent; numbering suggests mandatory reading order. |

### MINORE (Minor)

| ID | Finding | Evidence | Impact |
|----|---------|----------|--------|
| A11-M01 | **"Sezioni Generali" ambiguous** | Header says "Fonti e Sezioni Generali d'Istituto" — "Sezioni Generali" is unclear. | Minor confusion about what the view contains. |
| A11-M02 | **Grade levels in sources view** | "Livelli di Valutazione" sub-tab shows A/B/C/D grade descriptors — not a "source". | Conceptual mismatch; grading rubrics are not institutional sources. |
| A11-M03 | **No semantic HTML** | Content uses `<div>` and `<p>` without `<article>`, `<section>`, or heading hierarchy. | Minor accessibility impact. |
| A11-M04 | **"Swarm di Esperti" terminology** | curriculumKB proposals reference "Parere dello Swarm di Esperti" — unusual and potentially confusing. | Minor credibility issue. |

### OPPORTUNITÀ (Opportunity)

| ID | Finding | Evidence | Impact |
|----|---------|----------|--------|
| A11-O01 | **curriculumKB could power Fonti** | Real curriculum data exists but is not surfaced in the sources view. | Could transform Fonti from empty prose to authoritative reference. |
| A11-O02 | **Cross-references possible** | Curriculum decisions could link back to source documents. | Would create traceability from practice to normativa. |
| A11-O03 | **Source status system** | No way to mark sources as valid, draft, archived, or superseded. | Would help teachers understand currency. |

---

## Findings Summary

| Severity | Count |
|----------|-------|
| BLOCCANTE | 4 |
| RILEVANTE | 7 |
| MINORE | 4 |
| OPPORTUNITÀ | 3 |
| **Total** | **18** |

---

## Dependency Map

```
A11-B01 (No metadata) ← A11-B02 (No links) ← A11-B03 (No typology)
A11-B04 (Isolated) ← A11-R03 (KB not connected)
A11-R01 (Unverified claims) ← A11-B02 (No links)
A11-R02 (Editorialized) ← A11-B03 (No typology)
A11-R04 (Empty sub-tab) ← independent
A11-R05 (No search) ← independent
A11-R06 (Hardcoded school) ← independent
```

---

## Proposed Interventions

### Must resolve (blocking):

1. **Add source metadata** — date, author/ente, version, authority level, status for every source
2. **Add links to original documents** — D.M. 221/2025, DM 254/2012, PTOF, etc.
3. **Distinguish source typology** — visually separate normativa, istituzionale, operativo
4. **Integrate with curriculum** — link fonti to curriculum decisions; show which sources support which areas

### Should resolve (significant):

5. **Verify all claims against actual DM text** — remove unverified statements
6. **Remove editorializing** — use neutral, professional language
7. **Surface curriculumKB data** — show actual curriculum content as authoritative reference
8. **Fill or remove empty sub-tab** — "obiettivi" has only one sentence
9. **Add search and filter** — enable finding specific sources
10. **Parameterize school name** — replace "I.C. don Lorenzo Milani" with configurable value
11. **Remove sequential numbering** — use descriptive labels instead of "1.", "2.", "3.", "4."

### Could improve (minor):

12. Clarify "Sezioni Generali" in header
13. Move grade levels out of sources view (or rename the area)
14. Add semantic HTML
15. Replace "Swarm di Esperti" with standard terminology

---

## Acceptance Criteria for Resolution

- A teacher can identify the authority and currency of every source displayed
- A teacher can click through to the original normative document
- A teacher can distinguish between binding legal requirements and internal preferences
- Curriculum decisions can be traced back to their supporting sources
- The Fonti view is referenced by and useful to at least one other area
