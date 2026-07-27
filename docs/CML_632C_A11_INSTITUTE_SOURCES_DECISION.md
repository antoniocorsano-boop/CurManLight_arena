# CML-632C — A11 Institute Sources — Decision

## Verdict

```text
CML_632C_A11_INSTITUTE_SOURCES_REDESIGN
```

## Rationale

The Institute Sources area has **4 blocking findings** and **7 significant findings**. Of 12 audit dimensions, **11 score below 3**. The area is the worst-performing of those audited so far.

The core problem is structural: the Fonti view presents **static, unverifiable prose** as if it were an institutional source reference. It has:

- **Zero metadata** — no dates, authors, versions, or authority indicators
- **No links** — teacher cannot consult any original document
- **No typology** — constitutional principles and internal grade levels look identical
- **No integration** — completely isolated from curriculum, planning, and documents
- **Unverified claims** — statements about the 2025 reform that may not match the actual DM text
- **Editorialized language** — "La Svolta" undermines professional credibility

Meanwhile, the real curriculum data (`curriculumKB.ts`) — 14 disciplines with traguardi, obiettivi, and proposals — exists in the codebase but is **not displayed in the Fonti view**. The area meant to show authoritative sources shows none.

The area cannot be corrected with minor fixes. It needs to be rebuilt around structured source data with metadata, links, typology, and integration with the curriculum system.

---

## What to Keep

| Element | Reason |
|---------|--------|
| Sub-tab concept | Navigation between source categories is correct |
| Content topics (premessa, riforma, obiettivi, livelli) | Relevant categories for institutional sources |
| Grade level descriptors | Useful reference, just misplaced |
| "Premessa" content direction | Constitutional/institutional framing is appropriate |

---

## What to Change

| Element | Change | Priority |
|---------|--------|----------|
| Source metadata | Add date, author, version, authority, status | Blocking |
| Links to originals | Add hyperlinks to D.M. 221/2025, DM 254/2012, etc. | Blocking |
| Typology distinction | Visually separate normativa/istituzionale/operativo | Blocking |
| Integration | Link fonti to curriculum decisions | Blocking |
| Unverified claims | Verify or remove statements about IN 2025 | Significant |
| Editorializing | Replace "Svolta", "pilastri innovativi" with neutral language | Significant |
| curriculumKB display | Surface real curriculum data as authoritative reference | Significant |
| "obiettivi" sub-tab | Fill with actual content or merge into another tab | Significant |
| Search/filter | Add ability to find specific sources | Significant |
| School name | Parameterize "I.C. don Lorenzo Milani" | Significant |
| Sequential numbering | Replace "1.", "2.", "3.", "4." with descriptive labels | Significant |

---

## What to Remove

| Element | Reason |
|---------|--------|
| "Sezioni Generali" from header | Ambiguous |
| "Swarm di Esperti" terminology | Non-standard, confusing |
| Grade levels from sources view | Not a source; belongs in evaluation area |
| "La Svolta" editorializing | Not neutral reference language |

---

## Cross-Cutting Issue

The **8-11px font size** issue identified in A01-B03 applies here too. This is a system-wide interface problem, not specific to A01 or A11. It should be tracked as a cross-cutting finding and resolved in the UI system audit.

---

## Next Phase Criteria

Before implementation:

1. Structured source data model defined (metadata fields)
2. Typology classification system designed
3. Integration points with curriculum identified
4. Actual DM 221/2025 text obtained and verified
5. Visual distinction between source types designed

---

## Dependencies

- A01 redesign may inform visual hierarchy for sources
- A02 (Curriculum) audit will clarify how curriculum decisions should reference sources
- A07 (Documents) audit will clarify if exports should cite sources

---

## Risk

**Medium.** The Fonti area contains claims about national education reform that may be inaccurate. If a teacher relies on unverified statements about D.M. 221/2025, this could lead to incorrect curriculum decisions. However, the area is currently isolated and rarely used, limiting real-world impact.

**Mitigation:** Prioritize verification of all normativa claims before any public use.

---

## Summary

| Field | Value |
|-------|-------|
| Verdict | `CML_632C_A11_INSTITUTE_SOURCES_REDESIGN` |
| Blocking findings | 4 |
| Significant findings | 7 |
| Minor findings | 4 |
| Opportunities | 3 |
| Dimensions below 3 | 11 of 12 |
| Product modified | No |
| Push/merge/publication | Not executed |
| Next recommended action | Audit A02 (Curriculum Consultation) to understand how curriculum data should connect to sources |
