# CML-632D — A02 Curriculum Consultation — Decision

## Verdict

```text
CML_632D_A02_CURRICULUM_CONSULTATION_REDESIGN
```

## Rationale

The Curriculum Consultation area is the **informational core** of CurManLight. It is where a teacher goes to understand what must be taught, to what standard, and from what source. A02 fails this fundamental purpose on multiple dimensions:

**5 blocking findings** establish that the area cannot fulfill its role:

1. **Teacher cannot change school order from the UI** — the most basic filter is hidden
2. **Zero source metadata** — no teacher can verify where content comes from
3. **No operational outcome** — consultation leads nowhere; selections don't transfer to planning
4. **No connection to sources** — curriculum is isolated from the normativa it claims to implement
5. **Frozen experimental content still accessible** — undermines trust in canonical data

**11 significant findings** compound the structural weakness:

- Evidenze (the basis for assessment) exist but are invisible
- Nuclei Fondanti (the organizing structure) are not shown
- The "Mappa Validata" badge is hardcoded — every discipline appears validated regardless of reality
- No search, no detail view, no text-level inspection
- English has zero gap proposals — the reform is incomplete for a core subject
- 3 disciplines have empty data for some orders

**14 of 15 dimensions score below 3.** This is the worst-performing area audited so far, slightly below A11 (11/12 below threshold).

The fundamental problem is that **curriculum data exists (14 disciplines, ~106 traguardi, ~92 obiettivi) but is not transformed into a professional consultation experience**. The data is technically present, type-safe, and persisted — but the UI treats it as a flat list to be read, not a structured reference to be consulted, searched, filtered, traced, and acted upon.

A02 is not broken — it is **incomplete**. The data foundation is solid. The missing pieces are:

- Metadata (source, date, authority, status)
- Navigation (order selector, search, detail)
- Integration (selection transfer to A04, connection to A11)
- Trust indicators (real validation status, not hardcoded badges)

A CORRECT would address individual bugs. A SIMPLIFY would reduce scope. Neither fits — the area needs additional structure (metadata, integration, search) that doesn't exist yet. REDESIGN is the appropriate verdict.

---

## What to Keep

| Element | Reason |
|---------|--------|
| `curriculumKB` data structure | 14 disciplines with traguardi/obiettivi/proposals are solid |
| AlberoView layout concept | Left-discipline + right-content is correct |
| MappaView vertical progression | Showing infanzia→primaria→secondaria is valuable |
| RevisioneTab gap comparison | DM 254/2012 vs DM 221/2025 side-by-side is the right pattern |
| Store persistence | IndexedDB-backed state is reliable |
| Discipline filter | Working correctly |
| Proposals with old/new text | The comparison pattern is correct |

---

## What to Change

| Element | Change | Priority |
|---------|--------|----------|
| Order selector | Expose `setOrder` in CurriculumTab UI | Blocking |
| Source metadata | Add source, date, authority, status to curriculum items | Blocking |
| Selection transfer | Implement A02→A04 selection pipeline | Blocking |
| A11 connection | Link curriculum items to source documents | Blocking |
| Frozen pilot | Hide "★ Pilota Sperimentale" from navigation | Blocking |
| Evidenze display | Show observable evidence in consultation | Significant |
| Nuclei Fondanti | Display as navigation/filter | Significant |
| "Mappa Validata" badge | Make data-driven or remove | Significant |
| Text search | Add search across curriculum content | Significant |
| Detail view | Expandable per-item cards with metadata | Significant |
| View switcher | Remove `navigator.webdriver` gate | Significant |
| Home view | Add data summary, progress, recent access | Significant |
| English proposals | Complete gap analysis | Significant |

---

## What to Remove

| Element | Reason |
|---------|--------|
| "Ambito di Raccordo d'Istituto" | Jargon — replace with clear label |
| "Raccordo Diacronico" | Jargon — replace with "Progressione" |
| "Swarm di Esperti" | Non-standard — replace with standard term |
| Hardcoded "Mappa Validata" | Misleading — not real validation |

---

## Cross-Cutting Issues

1. **8-11px font sizes** — confirmed in A01, A11, and now A02. This is a system-wide interface problem.
2. **No structured source data anywhere** — A02 and A11 both lack metadata. A unified source registry is needed.
3. **Isolation pattern** — A02 is isolated from A04, A07, and A11. The product is organized as separate surfaces rather than a connected workflow.

---

## Next Phase Criteria

Before implementation:

1. Order selector added to UI
2. Source metadata model defined (what fields, where stored)
3. Selection transfer protocol designed (A02→A04)
4. Source connection designed (A02↔A11)
5. Evidenze and nuclei display designed
6. Search mechanism chosen (client-side full-text)
7. English proposals content prepared

---

## Dependencies

- A11 redesign must align on source metadata model
- A04 audit will clarify how selections should be consumed
- A07 audit will clarify export citation requirements
- Cross-cutting font issue should be resolved system-wide

---

## Risk

**High.** The curriculum area is the product's core value proposition. A teacher who cannot trust the data, verify its source, or act on it will abandon the tool. The 5 blocking findings collectively mean that A02 currently fails its primary purpose: enabling a teacher to make informed curriculum decisions.

**Mitigation:** The data foundation is solid (14 disciplines, complete for 9). The fixes are primarily UI/UX and integration — the hard part (curriculum content) is already done.

---

## Summary

| Field | Value |
|-------|-------|
| Verdict | `CML_632D_A02_CURRICULUM_CONSULTATION_REDESIGN` |
| Blocking findings | 5 |
| Significant findings | 11 |
| Minor findings | 7 |
| Opportunities | 5 |
| Dimensions below 3 | **14 of 15** |
| Disciplines analyzed | 14 |
| Data completeness | 9/14 complete, 4 partial, 1 empty |
| Product modified | No |
| Push/merge/publication | Not executed |
| Next recommended action | Audit A03 (Curriculum Revision) or A04 (Teaching Design) — A03 is already partially analyzed as it shares the `/curriculum` URL |
