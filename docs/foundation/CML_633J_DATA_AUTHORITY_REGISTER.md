# CML-633J — Data Authority Register

## Overview
This document defines the authoritative data sources for the CML-633 product model. It ensures a single source of truth for all domain entities. No new Dexie tables are introduced by CML-633I or CML-633J.

## Authority Register

| Authority | Source | Type | Description | Persistence Mechanism |
|-----------|--------|------|-------------|----------------------|
| **institutionalArchive** | `src/domain/institution/` | Archive | Institutional archive containing metadata, policies, versioned snapshots, and integrity validation reports. | Zustand persist middleware; backed by a single IndexedDB `state` table via `createCurriculumDatabase()`; fallback to in-memory store when IndexedDB is unavailable. |
| **documentArchive** | `src/domain/documents/` | Archive | Document versioning, export history, and rendering metadata. | Same Zustand persist middleware; single IndexedDB `state` table. |
| **revisionArchive** | `src/domain/revision/` | Archive | Revision history, decision logs, and audit trail for curriculum and design artifacts. | Same Zustand persist middleware; single IndexedDB `state` table. |
| **designArchive** | `src/domain/design/` | Archive | Design artifacts including wireframes, specifications, and validation traces. | Same Zustand persist middleware; single IndexedDB `state` table. |
| **curriculum domain** | `src/domain/curriculum/` | Canonical data store | Curriculum knowledge base (canonical payload). Source of truth for curriculum content, objectives, and versioning. | IndexedDB via `createCurriculumDatabase()` shared `state` table; fallback to in-memory. |
| **guidedWorkflowState** | `useCurriculumStore.guidedWorkflowState` | Runtime state | Lightweight state container for the guided teacher workflow (current step, completed steps, selections, warnings). | Zustand persist middleware; same IndexedDB `state` table; no new Dexie tables or schema changes. |

## Persistence Rules

- **No new tables or schema modifications** are introduced for any authority.
- **All existing Dexie schemas** remain unchanged. The single `createCurriculumDatabase()` instance is reused for all state persistence.
- **Persistence is exclusively handled by `useCurriculumStore`** via Zustand `persist` middleware with IndexedDB backend.
- **No new storage mechanisms** (e.g., additional localStorage, sessionStorage, remote APIs) are introduced.
- **Reset operations** clear only the guided workflow state (completed steps, current step) while preserving all domain archives and artifacts.

## Validation Checks

- [x] Each authority maps to exactly one domain or the existing Zustand store.
- [x] No domain writes to another domain's archive.
- [x] No new Dexie schema definitions are added at CML-633I or CML-633J.
- [x] All existing validation and integrity checks remain intact.
- [x] Reset operations clear only the guided workflow state, preserving all domain artifacts.

## Governance

- The authority register is maintained as part of the codebase; any changes require code changes and peer review.
- No runtime configuration changes are allowed; the register is static and code-driven.
- Future extensions must follow the same pattern: add a new entry only if a new domain or state type is introduced, and ensure no new storage mechanism is required.

## Verification Checklist

- [x] All authorities map to existing domains or the existing store.
- [x] No new Dexie schema definitions are added.
- [x] No new storage middleware is introduced.
- [x] All existing validation logic (e.g., archive integrity checks) remains intact.
- [x] Reset operations preserve domain artifacts and do not delete any data.

## Summary
The product model relies on a single source of truth for each domain entity, ensuring that teachers interact with a consistent, traceable, and verifiable data model. The state model is lightweight, session-based, and fully recoverable without loss of domain artifacts. Persistence is unified through the existing Zustand + IndexedDB setup; no new Dexie tables, schemas, or storage mechanisms are introduced.