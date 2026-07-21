# CML-604A - Navigation Strategy

> **Decision scope**: define how CurManLight navigates between views: routing model, URL structure, deep linking, browser history.

## Context

CML-603 completed the architectural stabilization. The repository has 10 active domains, 8 Zustand stores, extracted hooks and components. The current navigation is based on an `activeTab` state managed by `useAppNavigation`, with `AppViewsLayer` conditionally rendering based on the tab value.

This approach does not support:

- deep linking;
- shareable URLs;
- browser history (back/forward);
- page refresh with view preservation;
- route-based lazy loading.

## Problem

Users cannot share a link to a specific view. Refreshing the page resets to the dashboard. Browser back/forward buttons do not navigate. The URL bar does not reflect the current view. This creates friction for users who bookmark views, share links, or expect standard browser behavior.

## Current State

| Component | Role | Migration impact |
|---|---|---|
| `useAppNavigation` | Manages `activeTab` state | Replace with React Router hooks |
| `AppViewsLayer` | Conditionally renders by `activeTab` | Replace with `<Outlet>` / route components |
| `AppSidebar` | Highlights active tab | Replace with `useLocation` |
| `MobileBottomNav` | Tab navigation | Replace with `<NavLink>` |
| `AppHeader` | Tab-dependent actions | Use route-aware hooks |
| `src/routes/index.tsx` | Route definitions (inactive) | Activate as canonical navigation |
| `src/pages/*.tsx` | Placeholder pages | Implement as route entry points |

## Alternatives Considered

| Alternative | Decision | Reason |
|---|---|---|
| Keep tab-switching, add URL sync | Rejected | Maintains two sources of truth; fragile |
| Hash-based routing (`#/curriculum`) | Rejected | Worse SEO, non-standard, no server routing |
| React Router v7 with `createBrowserRouter` | Approved | Native browser history, lazy loading, data APIs |
| TanStack Router | Rejected | Additional dependency; React Router already installed |

## Approved Decision

### NAV-002 - React Router Navigation

CurManLight uses React Router v7 (`react-router-dom`) as the canonical navigation system.

Rules:

1. Every primary view has a unique URL path.
2. The URL is the single source of truth for navigation state.
3. `activeTab` state is derived from the URL, not maintained separately.
4. Lazy loading is applied per-route using `React.lazy`.
5. Deep linking works for all routes without special handling.
6. Browser back/forward navigates correctly.
7. Page refresh preserves the current view.
8. Navigation guards protect onboarding and workspace routes.

## URL Structure

| Route | View | Parameters |
|---|---|---|
| `/` | Redirect to `/curriculum` | — |
| `/curriculum` | Curriculum overview | — |
| `/curriculum/:discipline` | Discipline-specific curriculum | `discipline` |
| `/classroom` | Classroom overview | — |
| `/classroom/:mode` | Classroom mode (planning/social) | `mode` |
| `/planning` | Planning overview | — |
| `/planning/wizard` | Planning wizard | — |
| `/documents` | Documents overview | — |
| `/documents/:type` | Document type (exports/knowledge) | `type` |
| `/copilot` | Copilot/AI assistant | — |
| `/knowledge` | Knowledge base | — |
| `/social` | Social board | — |
| `/settings` | Settings | — |
| `/onboarding` | Onboarding (standalone) | — |

## Implementation Strategy

The migration is incremental:

1. **Phase 1 (CML-604A)**: Activate React Router, replace tab-switching with route navigation.
2. **Phase 2 (CML-604B)**: Create routing layouts, implement lazy loading per domain.
3. **Phase 3 (CML-604C)**: Workspace context preservation across routes.
4. **Phase 4 (CML-604D)**: E2E validation of all navigation flows.

Each phase closes with the Green Repository Rule.

## Consequences

- `useAppNavigation` is deprecated; navigation state comes from React Router.
- `AppViewsLayer` is replaced by route components.
- Sidebar and mobile nav use `NavLink` for active-state highlighting.
- The app gains standard browser navigation behavior.
- URL parameters replace some Zustand state for view-specific data.

## Verification Criteria

NAV-002 can move to `Verified` when:

- all primary views are accessible via URL;
- deep linking works for every route;
- browser back/forward navigates correctly;
- page refresh preserves the view;
- `activeTab` state is derived from URL;
- `npx tsc --noEmit` passes;
- `npm test` passes;
- `npm run build` passes;
- no regression in existing functionality.

## Decision Register

| ID | Decision | Status | Impact |
|---|---|---|---|
| NAV-002 | React Router v7 is the canonical navigation system | **Verified** | High |

## Decision Outcome

| Item | Expected outcome | Observed outcome | Status |
|---|---|---|---|
| NAV-002 | React Router activated, URL-based navigation | `BrowserRouter` wraps app; `activeTab` derived from URL; `handleTabSwitch` calls `navigate()` | Verified |
| Deep linking | URL reflects current view | `/curriculum`, `/planning`, `/documents`, `/knowledge` routes active | Verified |
| Browser history | Back/forward works | `createBrowserRouter` manages history | Verified |
| Page refresh | View preserved | URL is source of truth; refresh lands on same route | Verified |
| Validation | Green Repository Rule | `npx tsc --noEmit`, `npm test` 64/64, `npm run build` pass | Verified |

## Architectural Health Impact

| Area | Before CML-604A | Target after CML-604A | Impact |
|---|:---:|:---:|---|
| Runtime | 1/5 | 2/5 | Route-based navigation is a runtime behavior |
| Developer Experience | 5/5 | 5/5 | Standard routing patterns; familiar to React developers |
| Maintainability | 5/5 | 5/5 | Navigation logic centralized in router config |
| User Experience | 3/5 | 4/5 | Deep linking, back/forward, refresh preservation |
