# CML-632B — A01 Home & Orientation — Findings

## Criticality Classification

### BLOCCANTE (Blocking)

| ID | Finding | Evidence | Impact |
|----|---------|----------|--------|
| A01-B01 | **No product identification on home** | DashboardView has no title, tagline, or description. Only "CurManLight" in header logo. | Teacher cannot understand what the environment is or what it does. |
| A01-B02 | **Onboarding modal missing** | `OnboardingModal` component referenced in codebase but file does not exist. No first-run guidance. | New users have no guided entry point. |
| A01-B03 | **8-11px font sizes throughout** | All text in DashboardView uses `text-[8px]` to `text-[11px]`. Below WCAG minimum. | Unreadable for teachers with moderate visual impairment; poor on projectors. |

### RILEVANTE (Significant)

| ID | Finding | Evidence | Impact |
|----|---------|----------|--------|
| A01-R01 | **"Pilota Sperimentale" exposed as regular feature** | Sidebar shows "★ Pilota Sperimentale" as sub-item under "Consulta Curricolo" with no experimental warning. | Teacher may invest time in unfinished feature; confusion about readiness. |
| A01-R02 | **Technical jargon in user-facing text** | "SCORM zip packer", "de-gergonizzato", "PTOF Hub", "UDA Compilatore", "IndexedDB (Dexie.js)", "Service Worker", "copilot", "second brain", "workspace". | Non-technical teachers cannot understand descriptions. |
| A01-R03 | **Three area cards have equal visual weight** | All three cards (Curricolo, Progettazione, Classe) use identical styling, size, and prominence. | No clear primary action; decision paralysis for new users. |
| A01-R04 | **No product purpose statement** | Home shows widgets and cards but never explains "CurManLight helps teachers manage curriculum, design teaching units, and export documents." | Teacher must reverse-engineer purpose from UI elements. |
| A01-R05 | **Hardcoded metrics in role widgets** | "46/46 (100% completati)", "94.5% (ELEVATO)", "8 / 8 Assi d'Istituto" are static text, not derived from real data. | Misleading dashboard; erodes trust if numbers don't match reality. |
| A01-R06 | **No heading hierarchy on home** | DashboardView uses no `<h1>`, `<h2>` elements. Cards use `<h4>` without parent headings. | Screen readers cannot navigate structure; poor SEO semantics. |
| A01-R07 | **6 of 11 tabs unreachable from mobile bottom nav** | `processo`, `certificazione-pa`, `second-brain`, `guida`, `fonti` not in bottom nav. | Mobile users cannot access significant functionality without sidebar. |
| A01-R08 | **No skip-to-content link** | Tab navigation must traverse entire sidebar before reaching main content. | Keyboard users face excessive navigation overhead. |

### MINORE (Minor)

| ID | Finding | Evidence | Impact |
|----|---------|----------|--------|
| A01-M01 | **Privacy notice is static text** | "Tutti i dati sono memorizzati esclusivamente in locale" — no link to details, no expandable info. | Teacher cannot learn more about data handling. |
| A01-M02 | **Sidebar sub-menus only expand on active tab** | In normal mode, must click parent to see children. Only auto-expands in Playwright test mode. | Extra click required to discover sub-areas. |
| A01-M03 | **Cards use `<div>` not `<article>`** | Area cards are plain divs with no semantic HTML. | Minor accessibility/SEO impact. |
| A01-M04 | **No visible focus indicators** | Buttons rely on browser default outline which may be insufficient. | Keyboard users may lose track of focus. |
| A01-M05 | **"de-gergonizzato" appears to be a typo** | Card description: "de-gergonizzato d'area e pronto all'uso". | Unclear meaning; possibly "de-gerarchizzato" or custom term. |
| A01-M06 | **Duplicate entry points for same areas** | Sidebar + dashboard cards + mobile nav all lead to same views with different labels. | Minor confusion about which path to use. |

### OPPORTUNITÀ (Opportunity)

| ID | Finding | Evidence | Impact |
|----|---------|----------|--------|
| A01-O01 | **DashboardView renders unconditionally** | In `AppViewsLayer.tsx`, DashboardView always renders even when other tabs are active. | Performance: unnecessary DOM nodes; potential state leaks. |
| A01-O02 | **Storybook configuration missing** | `.storybook/` directory absent despite dependencies installed. | Cannot visually test components in isolation. |
| A01-O03 | **No a11y test coverage** | No axe-core or similar accessibility testing. | Regressions possible without detection. |
| A01-O04 | **Role-specific widgets could be progressive** | All role widgets render simultaneously; could show only relevant ones. | Reduce cognitive load for each role. |

---

## Findings Summary

| Severity | Count |
|----------|-------|
| BLOCCANTE | 3 |
| RILEVANTE | 8 |
| MINORE | 6 |
| OPPORTUNITÀ | 4 |
| **Total** | **21** |

---

## Dependency Map

```
A01-B01 (No product ID) ← A01-R04 (No purpose statement)
A01-B02 (No onboarding) ← A01-R03 (Equal cards) ← A01-R04 (No purpose)
A01-B03 (Small fonts) ← A01-R02 (Jargon) ← A01-R06 (No headings)
A01-R01 (Pilota exposed) ← A01-R04 (No distinction)
A01-R05 (Hardcoded data) ← independent
A01-R07 (Mobile gaps) ← independent
A01-R08 (No skip links) ← A01-B03 (Accessibility)
```

---

## Proposed Interventions

### Must resolve (blocking):

1. **Add product title and purpose statement** to home view
2. **Create or restore OnboardingModal** with first-run guidance
3. **Increase minimum font size** to 12px across home view

### Should resolve (significant):

4. **Visually separate experimental features** from regular navigation
5. **Replace technical jargon** with school-appropriate Italian
6. **Establish visual hierarchy** among area cards (primary/secondary)
7. **Replace hardcoded metrics** with real data or remove
8. **Add heading hierarchy** (`<h1>` for product, `<h2>` for sections)
9. **Expand mobile bottom nav** or add clear sidebar access indicator
10. **Add skip-to-content link**

### Could improve (minor):

11. Add link to privacy details
12. Auto-expand sidebar sub-menus on first visit
13. Use semantic HTML (`<article>`, `<section>`)
14. Add visible focus indicators
15. Fix "de-gergonizzato" typo
16. Consolidate duplicate entry points

---

## Acceptance Criteria for Resolution

- A teacher who opens CurManLight for the first time can answer "What is this?" within 5 seconds
- All text is readable at 12px minimum
- No technical jargon in user-facing descriptions
- Experimental features are visually separated from regular features
- Mobile users can reach all major areas within 2 taps
- Screen readers can navigate the home view structure
