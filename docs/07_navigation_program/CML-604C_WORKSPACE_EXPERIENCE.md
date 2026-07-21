# CML-604C - Workspace Experience

> **Decision scope**: define what state survives navigation, what persists across refresh, and what is ephemeral.

## Context

CML-604A activated React Router. CML-604B established the Application Shell with AppContext. The URL is now the single source of truth for navigation.

However, the persistence strategy is layered and inconsistent:

| State | Current persistence | Risk |
|---|---|---|
| Curriculum data (role, discipline, decisions, UDAs) | Zustand persist + IndexedDB | Low — survives refresh |
| Workspace config (tokens, login, email) | Read from localStorage on mount; setters don't write back | **Medium — runtime changes may be lost** |
| Navigation state (active tab, accordions) | In-memory Zustand | Expected — derives from URL |
| Session UI (modals, filters, selected UDA) | In-memory useState | Expected — ephemeral UI |
| Knowledge, Copilot, Classroom, Social | In-memory Zustand stores | Expected — session-scoped |

## Problem

Without explicit persistence rules:

1. `useWorkspaceState` setters don't write back to localStorage — runtime changes to tokens, login status, and email can be lost on unexpected unmounts.
2. Future developers may persist UI state that should be ephemeral, or fail to persist app state that should survive refresh.
3. There is no clear contract for what survives navigation vs. refresh vs. neither.

## State Classification

### Tier 1: Survives Refresh (persisted to localStorage/IndexedDB)

| State | Mechanism | Status |
|---|---|---|
| Curriculum data (role, discipline, decisions, UDAs, customTexts) | Zustand persist + IndexedDB | ✅ Working |
| Workspace config (cloudAccountType, login status, emails, tokens) | localStorage via `safeLocalStorageSetItem` | ⚠️ **Gap: setters don't write back** |
| Emergency backup | `useSessionAutoSave` on `beforeunload`/`visibilitychange` | ✅ Working |

### Tier 2: Survives Navigation (in-memory, resets on refresh)

| State | Mechanism | Status |
|---|---|---|
| Session UI (modals, filters, selected UDA, generated docs) | useState in `useSessionUiState` | ✅ Working — ephemeral by design |
| Knowledge store (custom docs, glossary) | In-memory Zustand | ✅ Working — session-scoped |
| Copilot store (chat messages, context) | In-memory Zustand | ✅ Working — session-scoped |
| Classroom store (mode, groups, attendance) | In-memory Zustand | ✅ Working — session-scoped |
| Social store (shared UDAs, annotations) | In-memory Zustand | ✅ Working — session-scoped |

### Tier 3: Ephemeral (derived from URL or transient)

| State | Mechanism | Status |
|---|---|---|
| Navigation state (active tab, subtabs) | Derived from URL via `useLocation()` | ✅ Working — URL is source of truth |
| Scroll position | Reset on navigation | ✅ Working — expected behavior |
| Wizard progress | In-memory React state | ✅ Working — resets on navigation |

## Approved Decision

### Persist-001 - State Persistence Rules

**Rule 1: Navigation state lives exclusively in the router.**

No `activeTab`, `currentPage`, `selectedTab`, `activeView`, or `navigationState` variables. Navigation is derived from URL.

**Rule 2: App state that must survive refresh uses Zustand persist or localStorage.**

Workspace config, curriculum data, and user preferences are Tier 1.

**Rule 3: UI state that survives navigation but not refresh uses in-memory Zustand or useState.**

Modal visibility, filters, selections, chat messages are Tier 2.

**Rule 4: Temporary state is ephemeral.**

Wizard progress, scroll position, loading states are Tier 3.

**Rule 5: Every Zustand store that manages Tier 1 state must use persistence middleware.**

No "read from localStorage but don't write back" patterns.

## Implementation

### Fix: Workspace State Persistence Gap

`useWorkspaceState` currently reads from localStorage on mount but its setters don't write back. This must be fixed:

1. Add a `persist` middleware to `useWorkspaceStore` (or equivalent pattern).
2. Ensure runtime changes to tokens, login status, and email are persisted.
3. Verify with `useAppStartupEffects` that startup restoration still works.

### Verification

1. Navigate between routes → app state persists.
2. Refresh the page → Tier 1 state restores, Tier 2 resets.
3. Close and reopen browser → Tier 1 state restores.
4. Workspace login → token persists across refresh.
5. Workspace logout → token cleared from localStorage.

## Consequences

- The persistence contract is explicit and documented.
- Future developers know which state to persist and which to keep ephemeral.
- The workspace state gap is closed.
- No unnecessary persistence bloat (UI state stays ephemeral).

## Verification Criteria

Persist-001 can move to `Verified` when:

- workspace config persists across refresh (login, tokens, email);
- curriculum data persists across refresh (existing behavior);
- UI state resets on refresh (existing behavior);
- navigation state derives from URL (existing behavior);
- no "read but don't write" patterns remain;
- `npx tsc --noEmit`, `npm test`, `npm run build` pass.

## Decision Register

| ID | Decision | Status | Impact |
|---|---|---|---|
| Persist-001 | State persistence rules: Tier 1 (refresh), Tier 2 (navigation), Tier 3 (ephemeral) | **Verified** | High |

## Decision Outcome

| Item | Expected outcome | Observed outcome | Status |
|---|---|---|---|
| Persist-001 | Explicit persistence contract; workspace state persists across refresh | `useWorkspaceStore` uses `persist` middleware; `useSessionStore` uses `persist` with `partialize` for Tier 1 flags | Verified |
| Workspace persistence | Login, tokens, email survive refresh | `useWorkspaceStore` persists to `curmanlight-workspace-v1` localStorage | Verified |
| Session flags | Onboarding, devMode, mockDataInjected survive refresh | `useSessionStore` persists to `curmanlight-session-v1` with partialize | Verified |
| Navigation state | Derives from URL, no persistence | `useNavigationStore` remains in-memory; URL is source of truth | Verified |
| Validation | Green Repository Rule | `npx tsc --noEmit`, `npm test` 64/64, `npm run build` pass | Verified |

## Architectural Health Impact

| Area | Before CML-604C | Target after CML-604C | Impact |
|---|:---:|:---:|---|
| Runtime | 3/5 | 3/5 | Persistence is a runtime concern |
| Maintainability | 5/5 | 5/5 | Explicit persistence contract |
| User Experience | 4/5 | 5/5 | No state loss on refresh for workspace |
