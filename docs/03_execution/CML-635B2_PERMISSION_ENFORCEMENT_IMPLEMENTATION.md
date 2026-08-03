# CML-635B2 — Permission Enforcement and UI Exposure

Date: 2026-08-03
Status: IMPLEMENTED LOCALLY — awaiting final review
Baseline: `d373372` (`docs(roles): approve B2 permission enforcement design`)
Branch: `feat/cml-636b-canonical-document-preview-export`
Commit/push: not performed

## Scope applied

The approved first vertical segment is implemented without authentication, backend changes, new stores, permission persistence, or changes to the teacher profile.

- Domain model: six supported roles, capability matrix, `neutral` and `unknown` resolution, conservative declared-role mapping, `can`, `requireCapability`, typed capability denial.
- Application adapter: derives a read model from `workspaceIdentity` only and updates immediately on role/reset changes.
- Workspace configuration: `BOOTSTRAP_LOCAL` is returned only when identity is absent; subsequent save/reset operations require `workspace.configure`.
- Department consolidation: CML import parsing is isolated and preserves `CML-LIGHT-EXPORT`, existing validation/messages, and compatibility. The guarded result reports `mergedDecisions` and `mergedCustomTexts`.
- Canonical export: print/PDF launch and canonical JSON archive download are guarded. Legacy curriculum exports, backup/import CML, aggregate exports, and other flows remain outside the capability boundary.
- UI: workspace actions, department consolidation, and canonical export controls expose disabled/status states with accessible descriptions; execution guards remain in application services.

Deferred by the approved plan: `proposal.create` enforcement, `document.review`, archiving, `institution.validate`, AI providers, dashboard refactoring, authentication, and persisted permissions.

## Protected action contract

Capability denial is kept distinct from identity validation, invalid CML import, document non-exportability, and technical print/download failure. Mutations and browser effects occur only after the corresponding guard and validation succeed.

The declared role remains self-declared. No UI state is presented as verified institutional authorization.

## Tests and verification

- Permission domain and matrix: PASS — 75 tests.
- Capability adapter and workspace configuration: PASS.
- Consolidation and transfer regressions: PASS — 123 tests.
- Canonical export boundary: PASS — 4 focused tests.
- Document suite: PASS — 10 files, 234 tests.
- UI suite: PASS — 34 files, 505 tests.
- Fast suite: PASS — 8 files, 273 tests.
- TypeScript: PASS — `npx tsc --noEmit`.
- Production build: PASS — `npm run build`.
- `git diff --check`: PASS.

The initial sandbox run hit `spawn EPERM` while starting esbuild; the affected suites passed when rerun with the approved elevated execution. Existing storage fallback warnings in jsdom remain non-blocking.

## Graphify and documentation status

`npx graphify hook-rebuild` remains blocked by the known local Graphify 0.17.1 wrapper/runtime issue (`node.exe` incompatible with the Windows version). This is recorded as the separate non-blocking upstream reserve `CML-INFRA-GRAPHIFY-01`; no Graphify artifact was changed.

The approved implementation plan `docs/superpowers/plans/2026-08-03-cml-635b2-permission-enforcement.md` remains intentionally unversioned because `docs/superpowers/` is already ignored by the repository. No `.gitignore` change was made for that decision. This report is the versionable execution record.

## Worktree handoff

Pre-existing modifications and untracked files were preserved. `package.json` has no diff. No commit or push was created. Final review should inspect the B2 files and decide whether to commit the implementation and this report together or as separate review units.
## Pre-commit correction

The final review identified one UI-only gap: the `ProcessoTab` CML import control was visible but did not expose the derived `department.consolidate` capability. The correction passes the boolean read model from `useWorkspaceCapabilities` through `useBackupHandlers`, `App.tsx`, `AppViewsLayer`, and `AppViewContracts` into `ProcessoTab`. When denied, the native file input is disabled and references an adjacent explanation via `aria-describedby`; the consolidation service and CML format are unchanged. Focused UI tests cover granted and denied states. No domain, matrix, persistence, teacher-profile, or deferred-capability changes were made. No commit or push was performed.