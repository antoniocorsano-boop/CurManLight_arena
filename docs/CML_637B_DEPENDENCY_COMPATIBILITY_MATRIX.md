# CML-637B — Dependency Compatibility Matrix

## Verdict

```
CML_637B_DEPENDENCY_COMPATIBILITY_MATRIX_COMPLETED_RECOMMENDED_CELL_C
```

## Summary

Cell C (single-major Vite 6.4.3 via a documented `overrides` block) is the recommended configuration: it is the only cell that keeps all four checks green with **zero** esbuild/oxc warnings and **no new warnings introduced**, while retaining the current Vite 6 build engine and a minimal, reviewable diff. Cell B1 also passes all checks with zero esbuild/oxc warnings but migrates the whole toolchain to the rolldown-based Vite 8 and introduces new `[PLUGIN_TIMINGS]` warnings; cell B2 is **BLOCKED** (plugin-react-oxc does not yet support Vite 8).

## Environment

- Branch (scratch): `docs/cml-637b-dependency-compatibility-matrix`
- Base commit: `2ed681d` (`origin/main`)
- OS: Windows (win32), PowerShell 5.1
- Node `v24.13.1`, npm `11.7.0`
- Playwright Chromium present (`$env:LOCALAPPDATA\ms-playwright`)
- Execution dates: 2026-07-31 (cells A–B2)

## Matrix

| Cell | Setup | esbuild/oxc warnings | unit | indexeddb-browser | build | build-storybook | Notes |
|---|---|---|---|---|---|---|---|
| A | Vite 6.4.3 root + Vite 8.1.5 nested (lock as-is), plugin-react 4.7.0 | PRESENT (unit: 4× `esbuild` + 4× `esbuildOptions` + 2× "Both esbuild and oxc"; browser: same) | PASS (1745 tests, 265.14s) | PASS (5.49s) | PASS (14.68s) | PASS (27.25s) | Baseline; warnings reproduced from tracked lock |
| C | `overrides: vitest → vite 6.4.3` (single major), plugin-react 4.7.0 | none | PASS (1745 tests, 226.04s) | PASS (5.57s) | PASS (21.15s) | PASS (26.51s) | Single Vite 6.4.3; rolldown absent; storybook 10.5.5 (lock regenerated) |
| B1 | Vite 8.2.0 (^8.1.5) + plugin-react 5.2.0 (^5.0.0), rolldown 1.2.1 | none | PASS (1745 tests, 232.56s) | PASS (3.61s) | PASS (5.05s) | PASS (7.92s) | Single Vite 8; **new `[PLUGIN_TIMINGS]` warning in build and storybook**; storybook 10.5.5 |
| B2 | Vite 8.2.0 (^8.1.5) + plugin-react-oxc 0.4.3 | — | BLOCKED (install) | — | — | — | ERESOLVE: peer `vite ^6.3.0 || ^7.0.0` from `@vitejs/plugin-react-oxc@0.4.3`; no checks run |

Resolved versions (verified via `fs` read of installed `package.json`, not `require()`):

| Cell | root vite | nested vite under vitest | @vitejs/plugin-react | @vitejs/plugin-react-oxc | rolldown | distinct Vite versions |
|---|---|---|---|---|---|---|
| A | 6.4.3 | 8.1.5 | 4.7.0 | — | 1.1.5 | 2 |
| C | 6.4.3 (overridden) | NONE (deduped) | 4.7.0 | — | NONE | 1 |
| B1 | 8.2.0 | NONE (deduped) | 5.2.0 | — | 1.2.1 | 1 |
| B2 | — (install failed) | — | — | 0.4.3 (uninstalled) | — | — |

## Measurement Protocol

For every cell (A, C, B1) the same four measured checks were run in a clean install:

1. `npx vitest run --project unit` → log `cml637b-matrix\cellX-unit.txt`
2. `npx vitest run --project indexeddb-browser` → log `cml637b-matrix\cellX-browser.txt`
3. `npm run build` → log `cml637b-matrix\cellX-build.txt`
4. `npm run build-storybook` → log `cml637b-matrix\cellX-storybook.txt`

Warnings were counted as lines matching `esbuild|oxc` (deduplicated by message body) and, for cell B1, matching `PLUGIN_TIMINGS`. Cell B2 stopped at the install step by design (BLOCKED).

Cell isolation protocol (enforced): `git checkout -- package.json package-lock.json vitest.config.ts`, `Remove-Item -Recurse -Force node_modules`, apply only the cell variation, fresh install, verify with `npm ls vite vitest @vitejs/plugin-react @vitejs/plugin-react-oxc rolldown` plus the `fs`-based version probe.

**Executed deviation (recorded):** running `npm install` on the existing tracked lockfile with the cell-C override did **not** re-resolve the nested `vite@8.1.5` (result: `npm ls` reported `invalid: "6.4.3"` on the nested copy). The remedy — deleting `package-lock.json` alongside `node_modules` and running `npm install` to regenerate the lock — is the only way npm applies the override deterministically. The lockfile was never edited by hand (plan constraint honored). Side effect: regenerated locks resolve `storybook` family packages to `10.5.5` (latest allowed by `^10.5.3`).

## Root Cause Re-Confirmation

Cell A reproduces the documented root cause exactly: with the tracked lock, vitest resolves a nested `vite@8.1.5` (rolldown 1.1.5) while hoisted `@vitejs/plugin-react@4.7.0` sees root `vite@6.4.3`, feature-detects no `"rolldownVersion"`, and injects legacy `esbuild`/`esbuildOptions` options that Vite 8 warns about (4× `esbuild`, 4× `esbuildOptions`, 2× "Both esbuild and oxc" in both unit and browser projects). See `docs/CML_637B_VITE_WARNING_VERDICT.md`.

## Recommendation

**Adopt Cell C:** add the following to `package.json` and regenerate `package-lock.json`:

```json
"overrides": {
  "vitest": {
    "vite": "6.4.3"
  }
}
```

Expected lock effect: `node_modules/vitest/node_modules/vite` is eliminated (deduped to the root `vite@6.4.3`), `rolldown` disappears from the tree, and only one Vite major remains. No application source, config, or build-engine change.

Why not B1 (Vite 8 + plugin-react 5.x): although it passes all four checks with zero esbuild/oxc warnings, it moves the **production build engine** to rolldown-based Vite 8 and emits **new** `[PLUGIN_TIMINGS]` deprecation-style warnings in `build` and `build-storybook` — trading the esbuild/oxc warnings for a different warning set, with a much larger blast radius for the teacher-facing product.

Why not B2: **blocked** — `@vitejs/plugin-react-oxc@0.4.3` peer-requires `vite ^6.3.0 || ^7.0.0`; npm aborts with `ERESOLVE unable to resolve dependency tree`:

```
npm error Could not resolve dependency:
npm error peer vite@"^6.3.0 || ^7.0.0" from @vitejs/plugin-react-oxc@0.4.3
npm error node_modules/@vitejs/plugin-react-oxc
npm error   dev @vitejs/plugin-react-oxc@"^0.4.3" from the root project
```

Full evidence: `C:\Users\anton\AppData\Local\Temp\opencode\cml637b-matrix\cellB2-install.txt`. No `--force`/`--legacy-peer-deps` was used.

## Decision criteria evaluation

| # | Criterion | A | C | B1 | B2 |
|---|---|---|---|---|---|
| 1 | All four checks green | PASS | **PASS** | PASS | BLOCKED |
| 2 | Zero esbuild/oxc warnings | FAIL (10+10) | **PASS (0)** | PASS (0, but new `PLUGIN_TIMINGS` warnings) | — |
| 3 | No CJS→ESM regression | PASS | **PASS** | PASS | — |
| 4 | Single Vite major (tie-breaker) | FAIL (2) | **PASS (1)** | PASS (1) | — |
| 5 | Minimal maintainable diff (tie-breaker) | n/a | **5-line overrides block; engine unchanged** | 2 version bumps; engine replaced (rolldown) | — |
| 6 | No changes to `src/` | PASS | **PASS** | PASS | — |

Cell C is the only configuration satisfying all hard criteria (1, 2, 3, 6) and both tie-breakers (4, 5). Verdict: `RECOMMENDED_CELL_C`.

## Constraints Honored

- Only the scratch worktree `C:\Users\anton\CurManLight_arena_matrix` was modified during execution.
- No push, no PR, no merge, no force push.
- No modifications to `src/`, tests, or Storybook stories.
- `package.json`/lock outside the scratch worktree untouched; lockfile never hand-edited.
- Other worktrees verified unchanged (`git worktree list` + per-worktree `git status`; main worktree still `fix/cml-637b` with the same pre-existing `M kilo.jsonc` + untracked files).
