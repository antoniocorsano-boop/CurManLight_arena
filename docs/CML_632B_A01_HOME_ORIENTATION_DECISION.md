# CML-632B — A01 Home & Orientation — Decision

## Verdict

```text
CML_632B_A01_HOME_ORIENTATION_REDESIGN
```

## Rationale

The Home & Orientation area has **3 blocking findings** and **8 significant findings**. Of 10 audit dimensions, **7 score below 3**. The area fails the central question test: a teacher who opens CurManLight for the first time **cannot understand what the environment is, what it does, or where to start** without external explanation.

The most critical issues are structural, not cosmetic:

1. **No product identification** — the home never states what CurManLight is
2. **No onboarding** — the OnboardingModal component is missing from the codebase
3. **Unreadable text** — 8-11px fonts throughout make the interface inaccessible
4. **No visual hierarchy** — three equal-weight cards create decision paralysis
5. **Technical jargon** — "SCORM zip packer", "de-gergonizzato", "PTOF Hub", "IndexedDB" are meaningless to non-technical teachers
6. **Experimental features exposed as regular** — "Pilota Sperimentale" appears as a normal sidebar item

These issues cannot be resolved by minor corrections. The home needs restructuring to:
- State what CurManLight is and who it's for
- Guide new users through first steps
- Establish clear priority among areas
- Use school-appropriate language
- Separate experimental from production features
- Meet basic accessibility standards

---

## What to Keep

| Element | Reason |
|---------|--------|
| Role-specific widgets | Correct concept — different roles need different views |
| Work state derivation | Useful for returning users |
| Recent activity feed | Good for resuming work |
| Contextual CTA | Smart adaptation to user state |
| Privacy notice | Important for trust |
| Three area concept | Correct grouping — just needs hierarchy |

---

## What to Change

| Element | Change | Priority |
|---------|--------|----------|
| Product title/purpose | Add `<h1>` with product name and one-sentence description | Blocking |
| Onboarding | Create or restore first-run guidance | Blocking |
| Font sizes | Minimum 12px for all user-facing text | Blocking |
| Area cards hierarchy | Make Curricolo the primary card; others secondary | Significant |
| Technical jargon | Replace all technical terms with Italian school language | Significant |
| Experimental features | Move "Pilota Sperimentale" to separate section with warning | Significant |
| Hardcoded metrics | Replace with real data or remove | Significant |
| Heading structure | Add `<h1>`, `<h2>` for screen reader navigation | Significant |
| Mobile nav | Ensure all areas reachable within 2 taps | Significant |
| Skip-to-content | Add keyboard shortcut to bypass sidebar | Significant |

---

## What to Remove

| Element | Reason |
|---------|--------|
| "SCORM zip packer" from description | Technical, not relevant to home |
| "de-gergonizzato" | Typo/unclear term |
| "IndexedDB (Dexie.js)" from admin widget | Technical, not meaningful |
| "Service Worker" from admin widget | Technical, not meaningful |
| Static "46/46" and "94.5%" | Misleading hardcoded data |

---

## Next Phase Criteria

Before implementation begins:

1. All 3 blocking findings must have proposed solutions
2. Significant findings must be prioritized for first iteration
3. Visual mockup or description of new hierarchy
4. Text replacements drafted in Italian school language
5. Mobile nav expansion plan

---

## Dependencies

- None blocking. This area is independent.
- If resolved, improvements should inform A02 (Curriculum Consultation) audit — particularly jargon and hierarchy patterns.

---

## Risk

**Low.** The home view is purely presentational. Changes affect first impressions and navigation entry points but do not break data flows or persisted state. The main risk is over-designing the home at the expense of functional areas.

**Mitigation:** Focus on the 3 blocking findings first. Do not redesign the entire visual system in one pass.

---

## Summary

| Field | Value |
|-------|-------|
| Verdict | `CML_632B_A01_HOME_ORIENTATION_REDESIGN` |
| Blocking findings | 3 |
| Significant findings | 8 |
| Minor findings | 6 |
| Opportunities | 4 |
| Dimensions below 3 | 7 of 10 |
| Product modified | No |
| Push/merge/publication | Not executed |
| Next recommended action | Draft redesign proposal for A01 Home |
