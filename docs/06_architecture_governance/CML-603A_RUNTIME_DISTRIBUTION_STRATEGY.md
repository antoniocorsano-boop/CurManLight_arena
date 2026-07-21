# CML-603A - Runtime & Distribution Strategy

> Architecture Decision Paper. This document defines how CurManLight lives, runs, persists data, updates itself, fails safely, and can be distributed without making cloud access mandatory.

## Decision Status

**Status:** Approved as architectural direction for CML-603 implementation planning.

**Governance Link:** This paper implements CML-603A from [CML-603 Architecture Governance](./CML-603_ARCHITECTURE_GOVERNANCE.md).

## Context

CurManLight has completed the technological migration phase and is now in architectural stabilization. The product promise is not simply "works offline"; the product promise is continuity of school work across constrained environments: connected classrooms, weak networks, local files, installed PWA usage, and optional cloud synchronization.

The current runtime contains development-era behavior that unregisters service workers and clears caches at startup. That behavior is incompatible with a governed runtime model and must be replaced only after this paper defines the intended lifecycle.

## Product Runtime Model

CurManLight lives primarily in the browser and progressively strengthens its runtime when the environment supports it.

```text
Browser
->
PWA
->
Desktop/mobile installable app
->
Local-first school runtime
->
Optional cloud synchronization
```

### Decision

CurManLight is a **local-first browser application with optional cloud synchronization**.

It must run without a mandatory backend, without mandatory authentication, and without blocking the teacher when Internet access is absent.

### Consequences

- The browser is the canonical runtime.
- PWA installation is a supported enhancement, not a separate product.
- Local file usage remains supported for isolated school contexts.
- Cloud sync is optional and must never become a hard dependency for core teaching work.
- Runtime behavior must be explicit and versioned.

## Product Constraints

These constraints are binding for future implementation:

1. CurManLight must never require a mandatory backend for core use.
2. CurManLight must never require cloud authentication for consultation, planning, review, export, or local restore.
3. CurManLight must not block the teacher when Internet access is missing.
4. CurManLight must always guarantee local reading of bundled knowledge and curriculum data.
5. CurManLight must always guarantee local export of user work.
6. CurManLight must treat cloud sync as optional persistence, not as primary ownership of data.
7. CurManLight must make destructive runtime actions explicit and recoverable where possible.

## Execution Modes

Execution modes describe user work, not technical connectivity.

| Mode | Description | Runtime Requirement | Persistence Requirement |
|---|---|---|---|
| Consultation | Read curriculum, knowledge base, dashboards | Browser or PWA | Local bundle/cache |
| Planning | Create UDA, annual plans, drafts | Browser or PWA | Local persistent storage |
| Review | Revise curriculum, decisions, gap analysis | Browser or PWA | Local persistent storage |
| Presentation | Use app on LIM/tablet/classroom display | Browser, PWA, or local file | Cache/local assets preferred |
| Offline Work | Continue work with no Internet | PWA or local file strongly preferred | Local storage + export |
| Cloud Sync | Push/pull backup to Drive/Workspace | Browser/PWA with network | Explicit sync credentials |

## Distribution Matrix

| Scenario | Supported | Role | Notes |
|---|:---:|---|---|
| Browser | Yes | Reference runtime | Primary target for all users |
| PWA | Yes | Installable runtime | Preferred for recurring school use |
| GitHub Pages | Yes | Demo/static distribution | Must not require server APIs |
| Netlify | Yes | Preview/static distribution | Suitable for review and staged releases |
| File locale | Yes | Isolated school fallback | Must degrade gracefully where APIs are blocked |
| Server scolastico | Future | Institutional hosting | Optional future distribution |
| Mandatory backend | No | Not allowed | Violates local-first constraint |

## Persistence Strategy

Persistence is layered. Each layer has ownership, duration, and responsibility.

| Layer | Owner | Duration | Responsibility | Required |
|---|---|---|---|:---:|
| Session | Browser memory | Current page lifetime | Temporary UI state, transient interaction | Yes |
| Local storage | User browser/device | Persistent until browser policy clears it | Preferences, drafts, small settings, compatibility fallback | Yes |
| IndexedDB/Dexie | User browser/device | Persistent until browser policy clears it | Main app state and larger local state | Yes |
| Emergency export | User filesystem | User controlled | Portable recovery copy | Yes |
| Drive personale | User Google account | Cloud retained | Optional personal backup/sync | No |
| Workspace d'Istituto | Institutional account | Cloud retained | Optional institutional backup/sync | No |
| Document export | User filesystem/clipboard/print | User controlled | Administrative portability | Yes |

### Decision

The authoritative working copy is local. Cloud copies are synchronization targets and recovery aids, not mandatory state owners.

### Consequences

- Local restore must remain available.
- Export/import must remain first-class features.
- Sync code must handle conflicts and failures without corrupting local work.
- Storage migrations must be versioned.

## Synchronization Strategy

Synchronization modes are explicit:

| Mode | Supported | Use Case | Trigger |
|---|:---:|---|---|
| Manual sync | Yes | Teacher-controlled backup or restore | User action |
| Assisted sync | Yes | App suggests sync after meaningful changes | User confirmation |
| Automatic sync | Limited | Emergency backup/keepalive where safe | Guarded by lock/version/conflict rules |
| Silent remote overwrite | No | Not allowed | Never |

### Decision

CurManLight uses **manual-first synchronization with assisted prompts**. Automatic sync is allowed only for safe backup behavior and must never silently overwrite valid local work.

### Conflict Rules

- Newer remote data may be proposed, not blindly applied.
- Local unsaved or newer work wins unless the user confirms restore.
- Sync failures must produce a visible status, not silent loss.
- Logout must clear tokens without deleting local curriculum work.

## Service Worker Strategy

The service worker is part of the runtime, not a disposable cache helper.

```text
Install
->
Activate
->
Update
->
Rollback
->
Cache
->
Cleanup
```

### Decision

CurManLight will use a versioned service worker lifecycle for PWA and browser deployments, while local file mode must degrade gracefully without requiring service worker support.

### Lifecycle Rules

- **Install:** cache the versioned app shell and essential static assets.
- **Activate:** claim clients only after version compatibility checks.
- **Update:** prefer controlled update prompt for installed/PWA users.
- **Rollback:** keep previous known-good cache until new runtime is confirmed.
- **Cache:** cache app shell and bundled knowledge assets; do not cache sensitive sync responses.
- **Cleanup:** delete obsolete cache versions only after successful activation.

### Current Runtime Correction

Startup-time `unregister()` and global `caches.delete()` are classified as development-era behavior. They must be removed or gated behind an explicit development reset path after the service worker strategy is implemented.

## Versioning Strategy

CurManLight uses multiple version axes because runtime, data, exports, documents, and cache can evolve independently.

| Version Axis | Purpose | Example Responsibility |
|---|---|---|
| Runtime version | App shell compatibility | PWA cache and JS bundle |
| Data schema version | Stored user state compatibility | IndexedDB/Zustand/local storage migrations |
| Export format version | Import/export compatibility | `.cml`, JSON backup, document package |
| Document template version | Administrative output stability | Programmazione, relazione, PDF/Word |
| PWA cache version | Cache invalidation | `curmanlight-runtime-vX` |

### Decision

Runtime updates must not imply data resets. Data migrations must be explicit and reversible where feasible.

## Compatibility Matrix

| Platform | Support Level | Notes |
|---|---|---|
| Chrome desktop | Primary | Reference browser |
| Edge desktop | Primary | School Windows compatibility |
| Firefox desktop | Supported | PWA features may vary |
| Safari desktop | Supported with caveats | Storage/PWA behavior may differ |
| Android Chrome | Primary mobile | Installable PWA target |
| iPad Safari | Supported with caveats | Storage quota and PWA lifecycle require testing |
| File protocol | Supported fallback | No service worker; restricted browser APIs |

## Failure Strategy

Failures are expected runtime states, not exceptional surprises.

| Failure | Expected Behavior | Recovery |
|---|---|---|
| Internet absent | Core consultation/planning/review continue locally | Sync disabled with visible status |
| Storage full | Warn user and preserve in-memory work | Prompt export/emergency backup |
| Storage blocked | Enter volatile mode with visible warning | Export/restore guidance |
| Cache corrupted | Fall back to network if available | Runtime reset action |
| Version incompatible | Block unsafe migration | Offer export, rollback, or guided reset |
| Sync token expired | Local work remains available | Prompt reconnect |
| Remote conflict | Do not overwrite silently | Show local/remote choice |
| File mode API unavailable | Hide/disable unsupported features | Keep local reading/export |

## Decision Matrix

| Decision | Motivation | Consequence |
|---|---|---|
| Local-first runtime | Continuity in schools with unreliable networks | Local storage and export are mandatory |
| No mandatory backend | Institutional autonomy and deploy flexibility | Sync is optional |
| Browser as canonical runtime | Maximum accessibility and distribution simplicity | PWA extends browser, does not replace it |
| PWA supported | Recurring school use and resilience | Service worker lifecycle must be governed |
| File locale supported | Isolated schools and emergency use | APIs must degrade gracefully |
| Manual-first sync | Prevent data loss and teacher surprise | Sync UX must be explicit |
| Controlled updates | Avoid classroom-time regressions | Update prompts/version checks required |
| Versioned cache | Runtime reliability | Cache cleanup must be lifecycle-based |
| Export always available | Portability and administrative assurance | Export pipeline is core product infrastructure |

## Future Runtime

The following capabilities are future-facing and must not be treated as mandatory requirements for CML-603 implementation:

| Future Capability | Direction |
|---|---|
| Workspace scolastico | Institutional sync profiles, shared recovery policies |
| Sincronizzazione dipartimenti | Shared curriculum updates with review/approval |
| Provider documentale | Pluggable Drive/OneDrive/local filesystem adapters |
| Knowledge Base condivisa | Governed school knowledge updates |
| Server scolastico | Optional institutional deployment for managed environments |
| Runtime diagnostics | Admin-visible runtime/cache/storage health panel |

## Approved Decisions

1. CurManLight is a local-first browser application with optional cloud synchronization.
2. Browser is the canonical runtime; PWA is the preferred installed enhancement.
3. File locale remains a supported fallback, with graceful degradation.
4. No mandatory backend is allowed for core product use.
5. Cloud authentication must remain optional.
6. Manual-first sync with assisted prompts is the approved synchronization model.
7. Silent remote overwrite is forbidden.
8. Service worker behavior must be versioned and lifecycle-governed.
9. Startup-time service worker unregister/cache deletion is development-era behavior and must be removed or gated.
10. Runtime, data schema, export format, document template, and PWA cache require separate versioning.
11. Failure states must be designed as product states with visible recovery paths.

## Decision Status Lifecycle

Runtime decisions evolve through a visible lifecycle:

```text
Draft
-> Proposed
-> Approved
-> Implemented
-> Verified
-> Deprecated
```

### Status Rules

- **Draft:** decision is being shaped and cannot guide implementation.
- **Proposed:** decision is reviewable but not yet binding.
- **Approved:** decision is binding for planning and implementation.
- **Implemented:** decision has corresponding code or operational documentation.
- **Verified:** implementation has passing checks and evidence.
- **Deprecated:** decision is superseded by a newer decision record.

## Decision Dependencies

| ID | Decision | Depends On | Influences |
|---|---|---|---|
| RT-001 | Local-first runtime | Product Runtime Model, Product Constraints | Persistence, sync, failure strategy, export |
| RT-002 | No mandatory backend | Product Constraints, Distribution Matrix | Deploy targets, cloud sync, server roadmap |
| RT-003 | Browser as canonical runtime | Product Runtime Model, Compatibility Matrix | UI delivery, PWA, file mode, test matrix |
| RT-004 | PWA as installable enhancement | Product Runtime Model, Service Worker Strategy | Cache, update, rollback, mobile/desktop install |
| RT-005 | File locale supported | Distribution Matrix, Compatibility Matrix | API degradation, export, classroom isolation |
| RT-006 | Manual-first sync | Synchronization Strategy, Persistence Strategy | Workspace UX, conflict handling, backup policy |
| RT-007 | Silent remote overwrite forbidden | Synchronization Strategy, Failure Strategy | Drive pull, restore, conflict resolution |
| RT-008 | Versioned service worker lifecycle | Service Worker Strategy, Versioning Strategy | PWA cache, update prompts, rollback, cleanup |
| RT-009 | Startup cache unregister/delete is development-era behavior | Current runtime audit, Service Worker Strategy | `main.tsx`, cache reset UX, PWA stability |
| RT-010 | Separate version axes | Versioning Strategy | Runtime migrations, exports, templates, cache invalidation |
| RT-011 | Failure states are product states | Failure Strategy, Product Constraints | UX alerts, recovery flows, interaction tests |

## Decision Register

| ID | Decisione | Stato | Impatto |
|---|---|---|---|
| RT-001 | CurManLight e' local-first e offline-capable | Approved | Alto |
| RT-002 | Nessun backend obbligatorio | Approved | Alto |
| RT-003 | Il browser e' il runtime canonico | Approved | Alto |
| RT-004 | La PWA e' un runtime installabile supportato | Approved | Alto |
| RT-005 | Il file locale resta supportato come fallback | Approved | Medio |
| RT-006 | La sincronizzazione e' manual-first con prompt assistiti | Approved | Alto |
| RT-007 | La sovrascrittura remota silenziosa e' vietata | Approved | Alto |
| RT-008 | Il Service Worker e' versionato e governato da lifecycle | Approved | Alto |
| RT-009 | `unregister()` e `caches.delete()` all'avvio sono comportamento development-era | Approved | Alto |
| RT-010 | Runtime, schema dati, export, template e cache hanno versioni separate | Approved | Medio |
| RT-011 | Gli stati di errore sono stati di prodotto con recovery visibile | Approved | Alto |

## Verification Criteria

CML-603A is complete when:

- this decision paper is linked from CML-603 governance;
- current runtime behavior is mapped against this paper;
- the service worker reset behavior is replaced or gated;
- runtime/cache/storage version constants are defined;
- local-first constraints are represented in tests or runtime checks;
- interaction tests cover at least one offline/volatile-storage scenario;
- documentation for supported distribution modes is updated.
