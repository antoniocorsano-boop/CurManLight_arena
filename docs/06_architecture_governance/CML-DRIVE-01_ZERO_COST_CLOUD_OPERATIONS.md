# CML-DRIVE-01 — Zero-cost cloud operations

**Status:** Approved for implementation  
**Date:** 2026-09-29  
**Scope:** optional Google Drive backup/restore paths

## Decision

Arena remains local-first. Ordinary operation MUST NOT generate autonomous cloud traffic.

Cloud operations are permitted only after an explicit user action and MUST remain optional. Drive is portability/recovery infrastructure, not required runtime infrastructure.

## Blocking invariants

1. No polling, timers, background synchronization or startup Drive reads/writes.
2. OAuth/Drive initiation must originate from an explicit user action.
3. A Drive backup payload is limited to 25 MiB and is rejected before provider traffic.
4. Only one outbound Drive backup may be active across the same browser origin; concurrent attempts fail closed.
5. No silent remote overwrite.
6. Local export remains available when Drive is unavailable or intentionally unused.
7. Provider pricing is not guaranteed; this decision governs Arena behavior, not third-party commercial terms.

## Implementation surface

- `src/features/workspace/hooks/useWorkspaceSyncHandlers.ts`
- `src/features/session/hooks/useAppStartupEffects.ts`
- `src/features/workspace/lib/driveCostGuard.ts`

## Verification

- size-boundary unit tests;
- concurrency/lease tests;
- source invariant tests proving no startup auto-pull and pre-network guard ordering;
- Product CI / TypeScript / build.

This decision refines RT-006 without changing RT-001/RT-002: synchronization remains manual-first and cloud remains optional.
