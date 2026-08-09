# Timeline

> Nota storica: cronologia precedente la sanificazione finale del repository; rami e worktree CML-637B citati come attivi/conservati sono stati poi integrati/rimossi/ripuliti nella PR #16.

## 2026-07-31 21:46:34 +02:00
- Session created.
- Goal: CML-637B - confirm Vite esbuild/oxc warning root cause and document dependency debt verdict

## 2026-07-31 21:46:45 +02:00
- CML-637B root cause CONFIRMED: tracked package-lock.json resolves vitest@4.1.10 -> nested vite@8.1.5 (rolldown 1.1.5) while root vite=6.4.3. plugin-react 4.7.0 hoisted resolves vite 6 -> rolldownVersion absent -> config hook sets legacy esbuild + optimizeDeps.esbuildOptions (dist/index.cjs:150-156). Vitest server runs vite 8 -> emits 3 deprecation warnings. Main worktree node_modules stale (29/07, all vite 6.4.3) masks issue; clean install reproduces (confirmed first-hand in merge_review 21:45, 10 tests pass 1.63s). No config-only fix: plugin always sets esbuild for automatic JSX. Verdict doc written: docs/CML_637B_VITE_WARNING_VERDICT.md. No dependency changes. Branch fix/cml-637b at 991ad31, 0/1 behind origin/main.

## 2026-07-31 22:11:59 +02:00
- CML-637B closed on main (2ed681d, PR #14 MERGED via ff). Branch fix/cml-637b verified as strict ancestor of main -> historical, no material to transfer. Formal plan approved-for-review written: docs/superpowers/plans/2026-07-31-cml-637b-dependency-compatibility-matrix.md (3 cells A/B/C, scratch worktree CurManLight_arena_matrix on branch docs/cml-637b-dependency-compatibility-matrix, clean install per cell, measured checks: unit + indexeddb-browser + build + build-storybook, deliverable docs/CML_637B_DEPENDENCY_COMPATIBILITY_MATRIX.md committed locally, no push). Awaiting plan approval before touching dependencies.

## 2026-07-31 22:16:35 +02:00
- Plan approved with CML_637B_DEPENDENCY_COMPATIBILITY_MATRIX_EXECUTION_APPROVED. Plan updated: cell B split into B1 (vite8+plugin-react 5.x) and B2 (vite8+plugin-react-oxc); full cell isolation protocol (restore package.json/lock/vitest.config.ts + rm node_modules + clean install + npm ls record); cell C uses explicit overrides (never manual lock edit) with diff/resolved version/vite count recorded; decision criteria ranked (4 checks green, zero warnings, no CJS->ESM regression, single vite major, minimal diff, no src changes). Executing Tasks 1-7 in scratch worktree CurManLight_arena_matrix.

## 2026-08-09 21:46:32 +02:00
- H0.1 document committed as 5690b4f; no runtime, UI, H1, or test changes.

## 2026-08-09 21:57:15 +02:00
- H1 ristrutturata sui due percorsi canonici; specifica pronta per approvazione; commit 61bed86; nessuna modifica runtime.
