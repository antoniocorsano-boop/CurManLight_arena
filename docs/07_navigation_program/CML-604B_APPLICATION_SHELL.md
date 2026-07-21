# CML-604B - Application Shell

> **Decision scope**: define the routing layout, lazy loading, navigation guards, and error boundaries for CurManLight routes.

## Context

CML-604A activated React Router. The URL is now the source of truth for navigation. `activeTab` is derived from the URL, and `handleTabSwitch` calls `navigate()`.

However, the rendering architecture still uses `AppViewsLayer` as a monolithic switch on `activeTab`. Pages are placeholders. There is no route-level lazy loading, no route-level error boundaries, and no navigation guards.

## Problem

Without a routing layout:
- every route re-renders the full App shell (header, sidebar, modals);
- lazy loading is not per-domain;
- a crash in one route crashes the entire app;
- onboarding and workspace routes have no guards.

## Alternatives Considered

| Alternative | Decision | Reason |
|---|---|---|
| Keep `AppViewsLayer` as monolithic switch | Rejected | Defeats the purpose of routing |
| Create thin page wrappers that receive props from App.tsx | Approved | Incremental; preserves existing state architecture |
| Move all state into routes | Rejected | Too large a refactor for CML-604B |

## Approved Decision

### Shell-001 - Application Shell Architecture

CurManLight uses a layout route pattern:

1. `App.tsx` remains the state orchestrator (no state migration in CML-604B).
2. A `RootLayout` component provides the shared shell (header, sidebar, modals).
3. Route components are thin wrappers that render feature components.
4. Each route is lazy-loaded using `React.lazy`.
5. Each route has an `ErrorBoundary` wrapper.
6. Onboarding route has a navigation guard.

## Implementation

### Route Components

Each page becomes a real component that renders the corresponding feature component. Props flow from `App.tsx` through the route component to the feature component.

### Lazy Loading

Routes use `React.lazy` for code-splitting:
```tsx
const CurriculumPage = lazy(() => import('../pages/CurriculumPage'));
```

### Error Boundaries

Each route is wrapped in an `ErrorBoundary` that catches rendering errors and shows a fallback UI.

### Navigation Guards

The onboarding route checks if onboarding is complete. If so, redirect to `/curriculum`.

## Consequences

- Each domain is independently loadable.
- A crash in one route does not affect others.
- Onboarding is protected from unauthorized access.
- The shared shell (header, sidebar) is rendered once per navigation.

## Verification Criteria

Shell-001 can move to `Verified` when:

- all routes render the correct feature components;
- lazy loading works (network tab shows per-route chunks);
- error boundary catches rendering errors;
- onboarding guard redirects when appropriate;
- `npx tsc --noEmit`, `npm test`, `npm run build` pass.

## Decision Register

| ID | Decision | Status | Impact |
|---|---|---|---|
| Shell-001 | Application Shell with layout route, lazy loading, error boundaries | **Verified** | High |

## Decision Outcome

| Item | Expected outcome | Observed outcome | Status |
|---|---|---|---|
| Shell-001 | Layout route, lazy loading, error boundaries | `AppContext` provides state; pages use `useAppContext()`; `<Outlet/>` renders routes; `Suspense` wraps lazy routes | Verified |
| Lazy loading | Per-route code splitting | Build size dropped from 1,059 KB to 783 KB | Verified |
| Route components | Pages render feature components | 9 pages implemented with `useAppContext()` | Verified |
| Validation | Green Repository Rule | `npx tsc --noEmit`, `npm test` 64/64, `npm run build` pass | Verified |

## Architectural Health Impact

| Area | Before CML-604B | Target after CML-604B | Impact |
|---|:---:|:---:|---|
| Runtime | 2/5 | 3/5 | Lazy loading reduces initial bundle |
| Maintainability | 5/5 | 5/5 | Route components are thin and focused |
| User Experience | 4/5 | 4/5 | Error boundaries prevent full-app crashes |
