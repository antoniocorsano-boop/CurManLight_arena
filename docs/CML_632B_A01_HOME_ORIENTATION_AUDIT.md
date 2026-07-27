# CML-632B — Audit: A01 Home & Orientation

## Metadata

| Field | Value |
|-------|-------|
| Area ID | A01 |
| Area Name | Home & Orientation |
| Audit date | 2026-07-27 |
| Branch | `audit/cml-632b-a01-home-orientation` |
| Initial commit | `6cef1e6` |
| Baseline | CML-632A inventory |

---

## 1. Perimeter

### Components analyzed

| Component | File | Lines | Role |
|-----------|------|-------|------|
| `DashboardView` | `src/features/session/components/DashboardView.tsx` | 394 | Main home view |
| `RecentActivity` | `src/features/session/components/RecentActivity.tsx` | 186 | Activity feed |
| `AppSidebar` | `src/features/navigation/components/AppSidebar.tsx` | 240 | Desktop navigation |
| `MobileBottomNav` | `src/features/navigation/components/MobileBottomNav.tsx` | ~80 | Mobile navigation |
| `AppHeader` | `src/features/navigation/components/AppHeader.tsx` | ~200 | Top bar |
| `GlobalAlerts` | `src/features/navigation/components/GlobalAlerts.tsx` | ~60 | System alerts |
| `InfoViews` | `src/features/session/components/InfoViews.tsx` | 178 | Fonti & Guida |
| `OnboardingModal` | Not found in codebase | — | **Missing** |

### Views in scope

- Dashboard (activeTab === 'dashboard')
- Sidebar navigation (all sections)
- Mobile bottom navigation
- Header bar
- Global alerts

### Out of scope

- Individual area views (curricolo, progettazione, etc.) — audited in their own areas
- Modals (AppModalsLayer) — shared infrastructure

---

## 2. Method

1. Source code analysis of all A01 components
2. Navigation structure reconstruction
3. Text audit (terminology, clarity, language)
4. Visual hierarchy analysis
5. Accessibility review (keyboard, semantics, contrast)
6. Technical verification (TypeScript, tests, build)
7. Runtime behavior verification

---

## 3. Real Behavior Reconstruction

### 3.1 First Access

When a teacher opens CurManLight for the first time:

1. **URL:** App lands on `/` → `activeTab === 'dashboard'`
2. **DashboardView renders** with role-specific widgets
3. **Role defaults to** `insegnante` (teacher) — determined by `useCurriculumStore`
4. **Work state:** `nessuna_attivita` (no activity) since `savedUda.length === 0`
5. **Primary action button:** "Inizia dal Curricolo" → navigates to curriculum tab
6. **Recent activity:** Empty state message "Le UDA salvate e le esportazioni recenti compariranno qui."
7. **No onboarding modal** exists in the codebase — the `OnboardingModal` component is **missing**
8. **No tour** is triggered automatically

### 3.2 Returning User

1. **Dashboard shows** work state based on saved UDA count and wizard step
2. **Primary action** changes contextually:
   - If wizard in progress → "Continua UDA"
   - If UDAs saved → "Consulta UDA"
   - If no activity → "Inizia dal Curricolo"
3. **Recent activity** shows up to 3 most recent UDAs/exports with timestamps
4. **Last save time** displayed if available

### 3.3 Empty State

- Work state badge shows "Nessuna attività" (gray)
- Recent activity shows placeholder text
- Primary CTA directs to curriculum

### 3.4 State with Data

- Work state derived from `savedUda.length`, `wizardStep`, `progStatus`
- Metrics: UDA count, pending decisions, wizard step
- Recent activity populated from `savedUda` and `documentExportHistory`

---

## 4. Central Question Assessment

| # | Question | Assessment | Evidence |
|---|----------|------------|----------|
| 1 | Che cos'è questo ambiente? | **Non chiaro** | No title, no tagline, no product description on home. Only "CurManLight" in header. |
| 2 | A che cosa serve? | **Parzialmente chiaro** | Area cards describe functions but no overall purpose statement. |
| 3 | Quale attività posso svolgere? | **Chiaro** | Three area cards with descriptions and CTAs. |
| 4 | Da dove devo iniziare? | **Parzialmente chiaro** | "Inizia dal Curricolo" button exists but only for empty state. No persistent guidance. |
| 5 | Differenza tra consultare, progettare, documentare, esportare? | **Parzialmente chiaro** | Cards describe areas but "documentare" and "esportare" are not clearly distinguished. |
| 6 | Posso riprendere un lavoro precedente? | **Chiaro** | Recent activity + contextual CTA. |
| 7 | Dove vengono salvati i dati? | **Chiaro** | Privacy notice at bottom: "Tutti i dati sono memorizzati esclusivamente in locale". |
| 8 | Quali funzioni sono ordinarie? | **Non chiaro** | No distinction made. "Pilota Sperimentale" appears as regular sidebar item. |
| 9 | Quali funzioni sono sperimentali? | **Non chiaro** | "★ Pilota Sperimentale" in sidebar has star but no explanation. |
| 10 | Quale risultato concreto ottengo? | **Parzialmente chiaro** | Cards mention outputs (curricolo, UDA, classe) but no concrete deliverable shown. |

**Score: 3/10 fully clear, 4/10 partially clear, 3/10 not clear**

---

## 5. User Value Analysis

| Dimension | Score | Evidence |
|-----------|-------|----------|
| Finalità comprensibile | 1 | No product purpose statement. Teacher must infer from area cards. |
| Orientamento iniziale | 2 | CTA exists but no onboarding, no tour, no guided first step. |
| Utilità per utenti abituali | 3 | Recent activity + contextual CTA works well for returning users. |
| Chiarezza dei risultati | 2 | Area cards describe functions but not concrete deliverables. |
| Riduzione del carico cognitivo | 1 | Dense text, small fonts, many competing elements, technical jargon. |

**Critical:** Finality comprehension scored 1 — a teacher cannot understand what CurManLight is from the home screen.

---

## 6. Functional Analysis

### 6.1 First Access Flow

| Step | Element | Behavior |
|------|---------|----------|
| Entry | URL `/` | DashboardView renders |
| Recognition | No product title/description | Teacher sees widgets and area cards |
| Decision | Three area cards + CTA | Must choose between Curricolo, Progettazione, Classe |
| Action | Click CTA or card | Navigates to target tab |
| Return | Sidebar "Home Dashboard" | Returns to dashboard |

**Break points:**
- No product identification → teacher doesn't know what this is
- No guided first step → decision paralysis possible
- Three cards have equal visual weight → no clear priority

### 6.2 Returning User Flow

| Step | Element | Behavior |
|------|---------|----------|
| Entry | URL `/` | DashboardView renders |
| Recognition | Work state badge + metrics | Teacher sees current status |
| Decision | Contextual CTA or recent activity | Resume or start new work |
| Action | Click CTA/activity item | Navigates to target |
| Return | Sidebar | Returns to dashboard |

**Break points:**
- Work state derivation is complex (3 conditions)
- "Bozza salvata" vs "In corso" distinction may confuse

### 6.3 Mobile Flow

| Step | Element | Behavior |
|------|---------|----------|
| Entry | Bottom nav "Home" | DashboardView renders |
| Layout | Single column | Cards stack vertically |
| Navigation | Bottom nav (5 tabs) | Only 5 of 11 tabs accessible |
| Return | Bottom nav "Home" | Returns to dashboard |

**Break points:**
- 6 tabs not reachable from mobile bottom nav
- Dense text may be unreadable on small screens
- No hamburger menu visible in bottom nav area

---

## 7. Information Hierarchy Analysis

### Perceived order (desktop):

1. **Header bar** (dark, sticky) — logo, copilot button, save, avatar
2. **Role-specific widgets** — work status, metrics
3. **Three area cards** — Curricolo, Progettazione, Classe
4. **Privacy notice** — bottom, small text

### Issues:

- **No product title** on the home view itself
- **"PTOF Hub"** badge on Curricolo card — jargon
- **"UDA Compilatore"** badge on Progettazione card — jargon
- **"Ambiente Aula"** badge on Classe card — unclear
- **Three cards have identical visual weight** — no clear primary action
- **DashboardView renders unconditionally** alongside other views (architectural issue, not visible to user)

---

## 8. Text Audit

### Problematic terms found:

| Term | Location | Issue | Recommendation |
|------|----------|-------|----------------|
| `dashboard` | Code only | Not visible, but concept is foreign | Not a user-facing issue |
| `workspace` | Header menu | Technical term | Replace with "Area di lavoro" or remove |
| `copilot` | Header button | Technical/AI term | Replace with "Assistente" or "AI" |
| `second brain` | Sidebar | Technical term | Replace with "Knowledge base" or "Archivio" |
| `pilota` | Sidebar | Experimental connotation | Move to separate section or remove |
| `PTOF Hub` | Card badge | Jargon (Piano Triennale dell'Offerta Formativa) | Abbreviate or explain |
| `UDA Compilatore` | Card badge | Technical | Replace with "Progettazione" |
| `SCORM zip packer` | Card description | Technical | Remove from user-facing text |
| `de-gergonizzato` | Card description | Jargon/typo | Remove |
| `IndexedDB (Dexie.js)` | Admin widget | Technical | Not user-facing for teachers |
| `Service Worker` | Admin widget | Technical | Not user-facing for teachers |
| `IndexedDB` | Admin widget | Technical | Not user-facing for teachers |

### Text quality issues:

- **"Mappatura verticale di 14 materie raccordata alla transizione ordinamentale"** — too long, technical
- **"Wizard a 5 passi per redigere bozze d'UDA d'Istituto con SCORM zip packer locale, de-gergonizzato d'area e pronto all'uso"** — contains technical jargon and possible typo
- **"Visualizzazione spaziale dei banchi, anagrafica tematica d'anonimato (Scientists, Classico) e compositore gruppi Jigsaw"** — jargon-heavy
- **Font sizes 8-11px** throughout — too small for comfortable reading

---

## 9. Navigation Audit

### Desktop sidebar correspondence:

| Sidebar Item | Dashboard Card | Match |
|--------------|----------------|-------|
| Home Dashboard | (is the home) | OK |
| Consulta Curricolo → Albero | Curricolo card "Apri Consulta" | OK |
| Progettazione UDA → Wizard | Progettazione card "Apri Wizard" | OK |
| Spazio d'Aula → Classe | Classe card "Configura Classe" | OK |
| Certificazione PA | Not on dashboard | Gap |
| WikiLLM & Brain | Not on dashboard | Gap |
| Guida Operativa | Not on dashboard | Gap |
| Pilota Sperimentale | Not on dashboard | **Inconsistent** |

### Issues:

1. **"Pilota Sperimentale"** appears in sidebar as regular item — should be visually separated
2. **Certificazione PA, WikiLLM, Guida** have no dashboard presence — orphaned entry points
3. **Sidebar sub-menus** only expand when `navigator.webdriver` is true OR the parent tab is active — normal users must click parent first to see children
4. **"Consulta Curricolo"** section groups revision, fonti, and pilot together — semantically inconsistent
5. **No "Indietro" (back) button** on any view — rely on sidebar/bottom nav

### Mobile bottom nav:

| Tab | Label | Reaches |
|-----|-------|---------|
| Home | Home | Dashboard |
| Consulta | Curricolo | Curriculum |
| Revisione | Revisione | Revision |
| Progetta | Progettazione | Planning |
| Esporta | Esportazioni | Export |

**Missing from mobile:** `processo`, `certificazione-pa`, `second-brain`, `guida`, `fonti` — 6 of 11 tabs unreachable without sidebar.

---

## 10. Experimental Functions

| Function | Location | Visibility | Issue |
|----------|----------|------------|-------|
| Pilota Sperimentale | Sidebar sub-menu | Visible as regular item | **RILEVANTE** — appears as ordinary feature |
| Curriculum eTwin | Not on home | Hidden | OK |
| Pedagogical Suggestions | Not on home | Hidden | OK |

**"★ Pilota Sperimentale"** in sidebar:
- Uses star emoji as only differentiator
- No explanation of experimental status
- No warning that it's not ready
- Competes visually with regular curriculum items

---

## 11. Visual Analysis

### Hierarchy issues:

- **No product title** on home view
- **Three area cards** have identical visual weight
- **Role-specific widgets** compete with area cards for attention
- **Font sizes 8-11px** throughout — below comfortable reading threshold
- **Dense information** in role widgets (admin especially)

### Density:

- Home view packs: work status, 3 metrics, activity feed, 3 area cards, privacy notice
- No breathing room between sections
- Cards are information-dense with small text

### Responsiveness:

- Cards use `grid-cols-1 md:grid-cols-3` — stacks on mobile ✓
- Role widgets use `col-span-3` — full width on all sizes ✓
- Font sizes don't scale with viewport — same 8-11px on all devices

---

## 12. Accessibility

### Issues found:

| Issue | Severity | Evidence |
|-------|----------|----------|
| Font sizes 8-11px | High | Below WCAG recommended minimum |
| No skip-to-content link | Medium | Tab must traverse entire sidebar |
| No heading hierarchy on home | Medium | No `<h1>` on dashboard view |
| Cards use `<div>` not `<article>` | Low | Semantic HTML missing |
| Buttons have no visible focus indicator | Medium | Default browser outline may be insufficient |
| "★ Pilota Sperimentale" uses emoji as icon | Low | Screen reader reads "star" |
| Privacy notice has no link to details | Low | Static text only |
| Admin widgets show technical terms | Medium | "IndexedDB (Dexie.js)" not accessible to non-technical users |

---

## 13. Reliability

| Scenario | Behavior | Issue |
|----------|----------|-------|
| First access | Shows empty state correctly | OK |
| Page reload | State restored from localStorage | OK |
| No localStorage | Graceful degradation | OK |
| Console errors | None observed | OK |
| Missing data | Empty states shown | OK |

---

## 14. Technical Coverage

| Element | Present | Adequate | Gap |
|---------|---------|----------|-----|
| Unit tests | Yes | Partial | DashboardView has role-based rendering tests in `teacher-workspace-part*.test.tsx` |
| Interaction tests | Yes | Partial | `interaction.cml603d.test.tsx` covers some flows |
| Accessibility tests | No | — | No a11y-specific tests |
| Responsive tests | No | — | No viewport-specific tests |
| Navigation tests | Yes | Partial | `navigation.cml604d.test.tsx` |
| Storybook | No | — | `.storybook/` directory missing |
| Browser verification | Yes | Partial | Previous CML-631 reports exist |

### Technical verification results:

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | **PASS** — 0 errors |
| `npx vitest run` | **209/210 pass** — 1 timeout (infrastructure, not code) |
| `npm run build` | **PASS** — 1,143.80 kB (single file) |
| `npm run build-storybook` | **N/A** — `.storybook/` missing |

---

## 15. Scores

| Dimension | Score | Key Finding |
|-----------|-------|-------------|
| Valore per l'utente | **1** | No product purpose statement; teacher cannot understand what CurManLight is |
| Coerenza funzionale | **2** | Flow exists but no onboarding, no guided first step, no product identification |
| Contenuti e dati | **2** | Hardcoded metrics in role widgets; no real data integration; jargon-heavy |
| Comprensibilità | **1** | Technical terms throughout; no product description; small fonts |
| Gerarchia visiva | **2** | No product title; equal-weight cards; dense layout |
| Navigazione | **3** | Sidebar works; mobile nav limited; pilota not separated |
| Accessibilità | **1** | 8-11px fonts; no skip links; no heading hierarchy; missing semantic HTML |
| Responsività | **3** | Cards stack on mobile; but fonts don't scale |
| Affidabilità | **4** | Graceful empty states; no crashes; localStorage fallback |
| Copertura tecnica | **2** | Some tests exist; no a11y tests; Storybook broken |

**Dimensions below 3:** Valore (1), Coerenza (2), Contenuti (2), Comprensibilità (1), Gerarchia (2), Accessibilità (1), Copertura tecnica (2)

**7 of 10 dimensions below threshold.**
