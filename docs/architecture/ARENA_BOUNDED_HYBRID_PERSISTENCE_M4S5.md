# M4-S5 — Bounded Hybrid Persistence Decision

Status: IMPLEMENTATION CONTRACT
Date: 2026-09-19
Tracker: #286

## Decision

Arena closes M4 A7 with a **bounded hybrid persistence** model.

This is deliberately **not** a migration of the canonical curriculum persistence mode. `CURRICULUM_PERSISTENCE_MODE` remains `legacy-only` because the R7C6A migration gate is still PREP_BLOCKED.

## Persistence planes

| State | Plane | Mechanism | Authority |
| --- | --- | --- | --- |
| personal review state, local archives, local continuity | LOCAL_DEVICE | Zustand + IndexedDB/Dexie | personal/non-institutional until explicitly published |
| operational profile convenience | LOCAL_DEVICE | local storage, non-authoritative | never grants institutional capability |
| authenticated team contributions/outcomes | SHARED_INSTITUTIONAL | Supabase/PostgreSQL behind repository + RLS | bounded by authenticated workspace membership |
| institutional review handoffs/decisions/adoption receipts | SHARED_INSTITUTIONAL | Supabase/PostgreSQL behind repository + RLS | server-enforced authority only |
| UI navigation/transient session state | EPHEMERAL | memory or bounded preference persistence | none |
| OAuth access/refresh tokens | FORBIDDEN_DURABLE | memory only | credential, never domain state |
| Curriculum Atlas state | EXTERNAL | separate product | no Arena persistence ownership |
| Docente OS operational state | EXTERNAL | separate product | no Arena persistence ownership |

## Canonical rules

1. Local-device state is not institutional authority.
2. Supabase is used only behind domain repositories and authenticated workspace/RLS boundaries.
3. No local self-declared role can be promoted into server authority.
4. OAuth access/refresh tokens must not be written to localStorage, IndexedDB, backup or export.
5. User-triggered Drive/file backup is portability, not shared institutional persistence.
6. Arena, Curriculum Atlas and Docente OS do not share a database.
7. No automatic cross-product write is allowed.
8. IndexedDB fallback to volatile memory must remain visible and must not support production-authority claims.
9. Canonical curriculum migration beyond `legacy-only` requires the existing R7C6A readiness gate and human authorization.
10. Legacy authoring/storage code that is not in the primary runtime does not define M4 ownership.

## Accepted M4 limitation

The canonical curriculum content persistence remains `legacy-only` during the controlled production pilot. This is accepted as a bounded limitation because:

- the operational Beta can already preserve personal work locally;
- shared authenticated review/decision artifacts already have server-side durable repositories;
- migration to the new curriculum domain is independently gated and currently blocked by unresolved source/human-validation prerequisites;
- forcing dual-read or dual-write now would increase migration risk without being required for the M4 pilot.

This acceptance does not waive the R7C6A blockers and does not authorize later migration automatically.

## Credential hardening

The legacy Google Drive flow may hold an access token **only in React memory for the active browser session**.

On startup:
- previously persisted access-token/expiry/logged-in markers are ignored and removed;
- a new OAuth callback may populate memory for the current session;
- reload requires re-authentication.

The active emergency backup excludes credentials. The legacy `useAutoSave` module is not mounted by the product runtime and must not be reintroduced without a dedicated security review.

## Human-facing interpretation

Arena should communicate:

- **Sul dispositivo** — personal work survives through IndexedDB when the browser allows it.
- **Nel gruppo autenticato** — only explicit publish/decision actions reach shared Supabase persistence.
- **Portabilità** — backup/download/Drive copy is a user-controlled copy, not institutional authority.
- **Curricolo canonico** — migration remains deliberately frozen at `legacy-only` for M4.

## Exit

`ARENA_BOUNDED_HYBRID_PERSISTENCE_CANONICAL`
