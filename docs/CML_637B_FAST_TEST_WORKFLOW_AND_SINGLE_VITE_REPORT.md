# CML-637B — Fast Test Workflow and Single-Vite Report

## Verdicts

```
CML_637B_SINGLE_VITE_CONFIGURATION_STABILIZED_LOCAL
CML_637B_FAST_TEST_WORKFLOW_READY_LOCAL
CML_637B_CLOSED_LOCAL
```

## Summary

CML-637B is closed: the Vite/esbuild/oxc dependency debt is resolved by **Cell C** (single Vite major `6.4.3` via a documented `overrides` block, no build-engine change), and the suite is now articulated into a **fast daily command** (`test:fast`, median ~22s) plus explicit area/full commands. Full coverage is preserved (1767 tests across unit + indexeddb-browser + storybook). The full suite remains heavy (median ~324s) and is reserved for final gates; the bottleneck is quantified below and is not forced to change without risky interventions.

## Decision: Cell C

Adopted from the compatibility matrix (`docs/CML_637B_DEPENDENCY_COMPATIBILITY_MATRIX.md`, commit `62a8f9a`):

- Keep Vite `6.4.3` (root) and `@vitejs/plugin-react` `4.7.0`.
- Keep Vitest `4.1.10`.
- Add an explicit override so Vitest resolves Vite `6.4.3` (single major, no nested Vite 8).
- No migration to Vite 8, no `@vitejs/plugin-react-oxc`, no changes to `src/`.

## Override diff (package.json)

```diff
     "vite": "^6.0.0",
     "vite-plugin-singlefile": "^2.0.1",
     "vitest": "^4.1.10"
+  },
+  "overrides": {
+    "vitest": {
+      "vite": "6.4.3"
+    }
   }
 }
```

The lockfile is **not** hand-edited: it is regenerated from the manifest (`npm install`) after removing `node_modules` and the previous lock, per the procedure validated in the matrix. This is the only way npm applies the override deterministically.

## Vite dependency graph — before / after

| Aspect | Before (`2ed681d`, matrix cell A) | After (this branch, cell C) |
|---|---|---|
| Root `vite` | `6.4.3` | `6.4.3` (marked `overridden`) |
| Nested `vite` under `vitest` | `8.1.5` | `NONE` (deduped to root) |
| Distinct Vite majors | **2** | **1** |
| `rolldown` / `@rolldown/*` | `1.1.5` + platform bindings | absent |
| `esbuild` | two copies (vite 6 → 0.25.12; hoisted 0.25.12) | vite keeps its own `0.25.12`; hoisted `0.28.1` for Storybook 10.5.5 (within `storybook` declared range) |
| `npm ls vite vitest @vitejs/plugin-react rolldown` | clean, but two Vite versions | **clean, no invalid entries, one Vite** |

Registry drift produced by the controlled lock regeneration (all within declared semver ranges, no invalid resolutions):

- **Intended:** removal of `vitest/node_modules/vite` (8.1.5), `rolldown@1.1.5`, all `@rolldown/*` bindings, and rolldown-adjacent packages (`lightningcss`, `oxc-parser`, `detect-libc`).
- **Registered separately:** Storybook family `10.5.3 → 10.5.5` (addons, `storybook`, `@storybook/react-vite`, `@storybook/builder-vite`).
- **Patch/minor drift within ranges:** `@babel/*` 7.29.8, `rollup` 4.62.3, `@playwright/test`/`playwright` 1.62.1, `react-router(-dom)` 7.18.2, `postcss` 8.5.25, `autoprefixer` 10.5.4, `caniuse-lite`/`browserslist`/`electron-to-chromium` data updates, `@csstools/*`, `undici`, `tldts`, `recast`, `magicast`, `nanoid`, `acorn` 8.18.0, `chai` (6.2.2 nested for vitest, 5.3.3 for storybook), plus dedupe/hoisting reshuffles (`@vitest/mocker`, `@emnapi/*`, `picomatch`, `estree-walker`, `fdir`, `fsevents`).

157 lockfile entries changed in total; every change is either the intended override effect or registry drift within declared ranges. No `--force`/`--legacy-peer-deps` was used.

## Warnings — before / after

| Check | Before (cell A) | After (cell C) |
|---|---|---|
| unit | 10 esbuild/oxc warnings (4× `esbuild`, 4× `esbuildOptions`, 2× "Both esbuild and oxc") | **0** |
| indexeddb-browser | 10 esbuild/oxc warnings | **0** |
| `npm run build` | 0 | 0 (no `PLUGIN_TIMINGS`) |
| `npm run build-storybook` | 0 | 0 (no `PLUGIN_TIMINGS`) |

## Test workflow commands (package.json)

| Script | Command | Coverage | Median | Target |
|---|---|---|---|---|
| `test:fast` | `vitest run --config vitest.fast.config.ts` | 8 curated fast/deterministic unit files (273 tests) | **21.90s** | ≤ 30s ✓ |
| `test:unit` | `vitest run --project unit` | full unit project (83 files, 1745 tests) | 228.92s | ≤ 90s ✗ (residual) |
| `test:browser` | `vitest run --project indexeddb-browser` | real IndexedDB browser test | **3.18s** | ≤ 15s ✓ |
| `test:storybook` | `vitest run --project storybook` | storybook stories (21 tests) | 11.67s | — |
| `test:full` | `vitest run --project unit --project indexeddb-browser --project storybook` | complete current coverage (89 files, 1767 tests) | 324.17s | < 180s ✗ (residual) |
| `test` (unchanged) | `vitest run` | identical to `test:full` (the fast config is not picked up by default runs) | — | — |

`test:fast` does **not** replace `test:full` in final gates. `test:fast` is the recommended daily command; `test:full` is the mandatory pre-integration command.

## Profiling evidence

One full measured run (cell C): total wall 260.89s; per-project sums: unit 23.1s of pure file execution, storybook 6.2s, browser 0.08s — **test logic is fast**. The wall time is dominated by per-file worker/environment overhead (cumulative `environment` 287s in the full run; 333s in a standalone unit run), i.e. transform + import + jsdom/node environment setup per test file on Windows, not by the assertions.

- 15 slowest files: `institution-integration.test.tsx` 6.4s, `cml-634b-r4b-teacher-local-ai-ui.test.tsx` 2.8s, `interaction.cml603d.test.tsx` 1.6s, storybook `*.stories.tsx` ~1.4s, `cml631g-pilot-init.test.tsx` 1.3s, others ≤ 1.0s.
- Tests slower than 2s: **none**.
- Workers: unit project `pool: 'threads'`, `maxWorkers: 2`, `fileParallelism: true` (Windows stability decision documented in `vitest.config.ts`). A measured `--maxWorkers=4` run showed **no improvement** (29.95s vs 29.11s for the same set) — concurrency is not the bottleneck; the per-file environment/startup cost is.
- No serialized tests, no manually launched servers or browsers. Playwright launches its own Chromium per browser project run.

## Residual limits

1. **`test:unit` (~229s median, 171–330s range) and `test:full` (~324s median, 261–374s range) are slow.** The bottleneck is per-file jsdom/node environment + worker startup cost, not the assertions (cumulative test time is ~30s across 1767 tests). Reducing this without changing `src/` or the worker pool stability decision is not achievable safely, so per the execution brief it is **documented rather than forced**.
2. **Run-to-run variance is high** (machine load sensitive), especially for the unit/full projects.
3. **`test:fast` is a curated subset** (273 tests): `src/domain/ai/*` (5 files), `transfer-domain`, `revision-domain`, `identity`. `storage`, `wikiLLM` and all UI/integration/curriculum/document suites remain covered by `test:unit`/`test:full` — they were excluded because they import heavier modules and would break the 30s budget.
4. Lockfile regeneration introduces registry drift (classified above); Storybook family moved `10.5.3 → 10.5.5`.

## Why Vite 8 is deferred

Cell B1 (Vite 8.2.0 + `@vitejs/plugin-react` 5.2.0) is green with zero esbuild/oxc warnings, but it replaces the production build engine with rolldown and introduces **new `[PLUGIN_TIMINGS]` warnings** in `build` and `build-storybook`, with a much larger blast radius for the teacher-facing product. Cell B2 (`@vitejs/plugin-react-oxc`) is blocked (`ERESOLVE`: peer `vite ^6.3.0 || ^7.0.0`). Cell C achieves the warning goal with minimal, reversible, engine-preserving change.

## Recommended commands

- **Daily development:** `npm run test:fast` (median ~22s).
- **Before integration:** `npm run test:full` (all projects, 1767 tests), plus `npx tsc --noEmit`, `npm run build`, `npm run build-storybook`.

## Verification log (all green on this branch)

- `npm run test:fast` — 273 tests PASS (3 measured runs: 22.02s / 21.90s / 18.85s).
- `npm run test:unit` — 1745 tests PASS (228.92s / 170.81s / 330.31s).
- `npm run test:browser` — 1 test PASS (2.94s / 3.18s / 3.62s).
- `npm run test:storybook` — 21 tests PASS (33.30s / 11.36s / 11.67s; first run cold).
- `npm run test:full` — 1767 tests PASS (260.89s / 324.17s / 373.73s).
- `npx tsc --noEmit` — clean.
- `npm run build` — PASS (14.73s).
- `npm run build-storybook` — PASS.
- `npm ls vite vitest @vitejs/plugin-react rolldown` — clean, single Vite 6.4.3.
- `git diff --check` — clean.
- Full coverage preserved: 1767 = 1745 (unit) + 1 (browser) + 21 (storybook); the fast subset (273) is a strict subset of unit.

## Constraints honored

- Only this worktree (`C:\Users\anton\CurManLight_arena_single_vite`, branch `fix/cml-637b-single-vite-and-fast-test-workflow`, base `origin/main = 2ed681d`) was modified.
- No `src/`, no `kilo.jsonc`, no sessions/audits/reports included.
- No push, no PR, no merge.
- Matrix and plan integrated from `62a8f9a` (matrix doc + plan file, no foreign material).
