# CML-637B — Dependency Compatibility Matrix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an evidence-based compatibility matrix comparing four dependency configurations (A: lock as-is, Vite 6 + Vitest 4; C: single-major Vite 6.4.3 via override; B1: Vite 8 + @vitejs/plugin-react 5.x; B2: Vite 8 + @vitejs/plugin-react-oxc) under clean installs, and produce a recommendation that eliminates the esbuild/oxc deprecation warnings without breaking the suite.

**Architecture:** Each configuration is executed in an isolated scratch worktree (`C:\Users\anton\CurManLight_arena_matrix`, branch `docs/cml-637b-dependency-compatibility-matrix`, base `origin/main = 2ed681d`). For every cell: clean install → verify resolved versions → run four measured checks → record warnings/durations/results. The only committed artifacts are the matrix document and this plan file; all dependency experiments stay uncommitted in the scratch worktree.

**Tech Stack:** Vite 6.4.3 / Vite 8.1.5, Vitest 4.1.10, @vitejs/plugin-react 4.7.0 / 5.x or @vitejs/plugin-react-oxc, Storybook 10.5.5, npm 11, Windows PowerShell, Playwright (Chromium).

---

## Context (verified ground truth)

Root cause confirmed in `docs/CML_637B_VITE_WARNING_VERDICT.md` (merged to `main` as `2ed681d`):

- The tracked lockfile resolves `vitest@4.1.10 → vite@8.1.5` (nested) while root `vite` stays `6.4.3`.
- `@vitejs/plugin-react@4.7.0` is hoisted, resolves `vite@6.4.3`, feature-detect `"rolldownVersion" in vite` is `false` → its config hook injects legacy `esbuild` / `optimizeDeps.esbuildOptions`.
- Vitest's server runs `vite@8.1.5` (rolldown/oxc) → emits deprecation warnings; tests stay green.
- A clean `npm ci` reproduces the warnings; the stale 29/07 install masks them.

Baseline config at `origin/main` (2ed681d) is `vitest.config.ts` with three projects: `unit`, `indexeddb-browser`, `storybook`. `.storybook/main.ts` stories pattern no longer includes `*.mdx`.

## Scope

- Execute and measure 4 dependency configurations (A, C, B1, B2) in the scratch worktree, in that order.
- Full restore between cells (see protocol below).
- Produce `docs/CML_637B_DEPENDENCY_COMPATIBILITY_MATRIX.md` and commit it locally — together with this plan file — on the dedicated branch.
- Record blockers honestly (a cell may end as BLOCKED with evidence).

## Out of scope

- No changes to the main worktree (`CurManLight_arena`), merge_review worktree, or any existing branch.
- No push, no PR, no merge, no force push.
- No modifications to application source files (`src/`), tests, or Storybook stories.
- No modification to `package.json` / lock outside the scratch worktree.
- No fix to the CML-637B legacy branch (treated as historical, fully merged).

## Success criteria

1. All cells executed with recorded measurements, or blockers explicitly documented with evidence.
2. At least one of the four configurations shows **zero** esbuild/oxc warnings **and** all four checks green.
3. Recommendation section proposes a concrete, reviewable diff (package.json + lock) for the chosen configuration.
4. Other worktrees/branches untouched (verified with `git worktree list` and per-worktree `git status`).
5. Matrix doc + plan file committed locally on `docs/cml-637b-dependency-compatibility-matrix`; working tree clean; no push.

## Decision criteria (final ranking, in order)

1. All four checks green (`unit`, `indexeddb-browser`, `build`, `build-storybook`).
2. Zero `esbuild`/`oxc` warnings.
3. No CJS→ESM regression (Storybook build + `cjsEsmBridge` behavior unchanged; no new module errors).
4. Single Vite major version, preferably.
5. Minimal and maintainable diff.
6. No changes to `src/`.

The recommended cell must satisfy 1, 2, 3 and 6; 4 and 5 are tie-breakers.

## Cell isolation protocol (all cells except A)

For each cell, in this exact order:

1. `git checkout -- package.json package-lock.json vitest.config.ts` (restore scratch baseline);
2. `Remove-Item -Recurse -Force node_modules`;
3. apply **only** the cell's variation;
4. clean install;
5. record `npm ls vite vitest @vitejs/plugin-react @vitejs/plugin-react-oxc rolldown` plus the `node -e` resolved-version output.

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| `vite-plugin-singlefile@2.3.3` may not support Vite 8 (cells B1/B2) | Record as BLOCKED with the exact error; do not force; rely on cell C for the recommendation |
| `@storybook/builder-vite@10.5.x` compatibility with Vite 8 | Verify at runtime; record error if incompatible |
| `@vitejs/plugin-react-oxc` has a different export name (`reactOxc`) | Cell B2 uses the documented import; verify with `node -e` before running |
| Playwright Chromium not installed for fresh worktree | Pre-check; run `npx playwright install chromium` if needed |
| Long suite durations (unit ~700+ tests, build, storybook build) | Use generous command timeouts; record durations |
| `npm ci` network/time | Accept; run once per cell |
| npm `overrides` semantics change | Verify resolved versions after each install with `node -e` |

---

## Task 1: Create scratch worktree and prerequisites

**Files:**
- Create (directory): `C:\Users\anton\CurManLight_arena_matrix`

- [x] **Step 1: Verify target path is free**

Run:
```powershell
Test-Path "C:\Users\anton\CurManLight_arena_matrix"
```
Expected: `False` (if `True`, stop and report).

- [x] **Step 2: Create worktree from origin/main**

Run (from `C:\Users\anton\CurManLight_arena`):
```powershell
git fetch origin
git worktree add -b docs/cml-637b-dependency-compatibility-matrix C:\Users\anton\CurManLight_arena_matrix origin/main
```
Expected: branch created, HEAD = `2ed681d`.

- [x] **Step 3: Verify clean state**

Run (in `C:\Users\anton\CurManLight_arena_matrix`):
```powershell
git branch --show-current
git rev-parse HEAD
git status --short
```
Expected: `docs/cml-637b-dependency-compatibility-matrix`, `2ed681d…`, empty status.

- [x] **Step 4: Pre-check Playwright browsers**

Run:
```powershell
Test-Path "$env:LOCALAPPDATA\ms-playwright"
```
If missing, install later before the first browser-project run (`npx playwright install chromium`).

---

## Task 2: Cell A — Baseline lock as-is (Vite 6 root + Vite 8 nested)

**Files:**
- Run only (no file changes): scratch worktree node_modules

- [x] **Step 1: Clean install from tracked lock**

Run (in `C:\Users\anton\CurManLight_arena_matrix`):
```powershell
npm ci
```
Expected: install completes; exit 0.

- [x] **Step 2: Verify resolved versions**

Run:
```powershell
node -e "const v=(p)=>{try{return require(p).version}catch{return 'NONE'}};console.log('root vite:',v('vite/package.json'));console.log('nested vite under vitest:',v('vitest/node_modules/vite/package.json'));console.log('plugin-react:',v('@vitejs/plugin-react/package.json'));console.log('rolldown:',v('rolldown/package.json'))"
```
Expected: root `6.4.3`, nested `8.1.5`, plugin-react `4.7.0`, rolldown `1.1.5`.

- [x] **Step 3: Measured check — unit project**

Run:
```powershell
npx vitest run --project unit 2>&1 | Tee-Object -FilePath C:\Users\anton\AppData\Local\Temp\opencode\cml637b-matrix\cellA-unit.txt
```
Record: pass/fail, total tests, duration, **count of** lines containing `esbuild`/`oxc`.

- [x] **Step 4: Measured check — indexeddb-browser project**

Run:
```powershell
npx vitest run --project indexeddb-browser 2>&1 | Tee-Object -FilePath C:\Users\anton\AppData\Local\Temp\opencode\cml637b-matrix\cellA-browser.txt
```
If Playwright Chromium missing, run `npx playwright install chromium` first and retry.

- [x] **Step 5: Measured check — production build**

Run:
```powershell
npm run build 2>&1 | Tee-Object -FilePath C:\Users\anton\AppData\Local\Temp\opencode\cml637b-matrix\cellA-build.txt
```

- [x] **Step 6: Measured check — Storybook build**

Run:
```powershell
npm run build-storybook 2>&1 | Tee-Object -FilePath C:\Users\anton\AppData\Local\Temp\opencode\cml637b-matrix\cellA-storybook.txt
```

- [x] **Step 7: Record cell A row**

Expected result: warnings **present** in unit project; all checks green. Write the row into the matrix document (Task 7).

- [x] **Step 8: Record npm ls + restore nothing (baseline cell)**

Run:
```powershell
npm ls vite vitest @vitejs/plugin-react @vitejs/plugin-react-oxc rolldown
```
Record the full output as the cell A dependency inventory.

---

## Task 3: Cell C — Single Vite major 6 via overrides

**Files:**
- Modify: `package.json` (scratch worktree only)

- [x] **Step 1: Reset to tracked baseline**

Run (in `C:\Users\anton\CurManLight_arena_matrix`):
```powershell
git checkout -- package.json package-lock.json
Remove-Item -Recurse -Force node_modules
```
Expected: package.json/lock restored to `2ed681d` state; node_modules gone.

- [x] **Step 2: Add explicit, documented override (never edit the lockfile manually)**

Edit `package.json`: after the closing of `devDependencies` block (line 53), add:

```json
,
  "overrides": {
    "vitest": {
      "vite": "6.4.3"
    }
  }
```

Record the `git diff package.json` output for the report (this is the override evidence).

- [x] **Step 3: Fresh install with overrides**

Run:
```powershell
npm install
```
Expected: install completes; lock regenerated with `node_modules/vitest/node_modules/vite` = `6.4.3`.

- [x] **Step 4: Verify resolved versions**

Run:
```powershell
node -e "const v=(p)=>{try{return require(p).version}catch{return 'NONE'}};console.log('root vite:',v('vite/package.json'));console.log('nested vite under vitest:',v('vitest/node_modules/vite/package.json'));console.log('rolldown:',v('rolldown/package.json'))"
```
Expected: nested vite under vitest = `6.4.3` **or** `NONE` (deduped to the root `6.4.3`); rolldown `NONE`. Either outcome confirms a single Vite major.

- [x] **Step 5: Record npm ls + Vite major count**

Run:
```powershell
npm ls vite vitest @vitejs/plugin-react @vitejs/plugin-react-oxc rolldown
```
Record the full output, the resolved version, and the **number of distinct Vite versions present** (must be 1).

- [x] **Step 6: Measured checks (repeat Task 2 Steps 3–6)**

Run the same four checks, writing to `cml637b-matrix\cellC-*` files.

- [x] **Step 7: Record cell C row**

Expected result: **zero** esbuild/oxc warnings; all checks green. Record, including: `package.json` override diff, actually resolved version, distinct Vite version count, and any warnings/incompatibilities introduced.

- [x] **Step 8: Restore package.json/lock and clean node_modules for next cell**

Run:
```powershell
git checkout -- package.json package-lock.json
Remove-Item -Recurse -Force node_modules
```

---

## Task 4: Cell B1 — Vite 8 + @vitejs/plugin-react 5.x

**Files:**
- Modify: `package.json`, `vitest.config.ts` (scratch worktree only)

- [x] **Step 1: Reset to tracked baseline**

Run:
```powershell
git checkout -- package.json package-lock.json vitest.config.ts
Remove-Item -Recurse -Force node_modules
```

- [x] **Step 2: Edit package.json**

- `"vite": "^6.0.0"` → `"vite": "^8.1.5"`
- `"@vitejs/plugin-react": "^4.3.0"` → `"@vitejs/plugin-react": "^5.0.0"`

Keep `vitest.config.ts` unchanged unless the plugin API demands it; if so, record the change.

- [x] **Step 3: Fresh install**

Run:
```powershell
npm install
```
If resolution fails (e.g. `vite-plugin-singlefile` or storybook builder rejects Vite 8), capture the exact error and record cell B1 as BLOCKED with evidence; skip remaining checks and proceed to Task 5.

- [x] **Step 4: Verify resolved versions + npm ls**

Run:
```powershell
node -e "const v=(p)=>{try{return require(p).version}catch{return 'NONE'}};console.log('root vite:',v('vite/package.json'));console.log('nested vite under vitest:',v('vitest/node_modules/vite/package.json'));console.log('plugin-react:',v('@vitejs/plugin-react/package.json'));console.log('plugin-react-oxc:',v('@vitejs/plugin-react-oxc/package.json'));console.log('rolldown:',v('rolldown/package.json'))"
npm ls vite vitest @vitejs/plugin-react @vitejs/plugin-react-oxc rolldown
```
Record the full `npm ls` output and the distinct Vite version count (expected 1).

- [x] **Step 5: Measured checks (repeat Task 2 Steps 3–6)**

Run the same four checks, writing to `cml637b-matrix\cellB1-*` files.

- [x] **Step 6: Record cell B1 row**

Expected: **zero** esbuild/oxc warnings; all checks green — **or** BLOCKED with exact error output.

- [x] **Step 7: Restore scratch tree to baseline**

Run:
```powershell
git checkout -- package.json package-lock.json vitest.config.ts
Remove-Item -Recurse -Force node_modules
```

---

## Task 5: Cell B2 — Vite 8 + @vitejs/plugin-react-oxc

**Files:**
- Modify: `package.json`, `vitest.config.ts` (scratch worktree only)

- [x] **Step 1: Reset to tracked baseline**

Run:
```powershell
git checkout -- package.json package-lock.json vitest.config.ts
Remove-Item -Recurse -Force node_modules
```

- [x] **Step 2: Edit package.json**

- `"vite": "^6.0.0"` → `"vite": "^8.1.5"`
- `"@vitejs/plugin-react": "^4.3.0"` → `"@vitejs/plugin-react-oxc": "<latest>"` (verify the exact latest version first with `npm view @vitejs/plugin-react-oxc version`)

- [ ] **Step 3: Edit vitest.config.ts import**

Change line 3:
```typescript
import react from '@vitejs/plugin-react';
```
to:
```typescript
import { reactOxc } from '@vitejs/plugin-react-oxc';
```
and line 77 `plugins: [react(), cjsEsmBridge()]` → `plugins: [reactOxc(), cjsEsmBridge()]`.

- [x] **Step 4: Fresh install**

Run:
```powershell
npm install
```
If resolution fails or the plugin API is incompatible, capture the exact error and record cell B2 as BLOCKED with evidence; skip remaining checks and proceed to Task 6.

- [ ] **Step 5: Verify resolved versions + npm ls**

Run:
```powershell
node -e "const v=(p)=>{try{return require(p).version}catch{return 'NONE'}};console.log('root vite:',v('vite/package.json'));console.log('nested vite under vitest:',v('vitest/node_modules/vite/package.json'));console.log('plugin-react:',v('@vitejs/plugin-react/package.json'));console.log('plugin-react-oxc:',v('@vitejs/plugin-react-oxc/package.json'));console.log('rolldown:',v('rolldown/package.json'))"
npm ls vite vitest @vitejs/plugin-react @vitejs/plugin-react-oxc rolldown
```
Record the full `npm ls` output and the distinct Vite version count (expected 1).

- [x] **Step 6: Measured checks (repeat Task 2 Steps 3–6)**

Run the same four checks, writing to `cml637b-matrix\cellB2-*` files.

- [x] **Step 7: Record cell B2 row**

Expected: **zero** esbuild/oxc warnings; all checks green — **or** BLOCKED with exact error output.

- [ ] **Step 8: Restore scratch tree to baseline**

Run:
```powershell
git checkout -- package.json package-lock.json vitest.config.ts
Remove-Item -Recurse -Force node_modules
```

---

## Task 6: Independent check — other worktrees untouched

- [x] **Step 1: Verify all worktrees**

Run (from `C:\Users\anton\CurManLight_arena`):
```powershell
git worktree list
```
Expected: same list as before Task 1, with the new `CurManLight_arena_matrix` added; `CurManLight_arena` still at `fix/cml-637b-test-suite-stabilization` `991ad31`, `merge_review` at `main` `2ed681d` (local ref, not yet fetched).

- [x] **Step 2: Verify main worktree status unchanged**

Run:
```powershell
git status --short
```
Expected: identical to the pre-matrix state (`M kilo.jsonc` + untracked list; no new entries).

---

## Task 7: Write and commit the matrix document and the plan

**Files:**
- Create: `docs/CML_637B_DEPENDENCY_COMPATIBILITY_MATRIX.md` (scratch worktree)
- Copy: `docs/superpowers/plans/2026-07-31-cml-637b-dependency-compatibility-matrix.md` from the main worktree (this file, updated) into the scratch worktree

- [x] **Step 1: Copy the updated plan into the scratch worktree**

Run:
```powershell
Copy-Item "C:\Users\anton\CurManLight_arena\docs\superpowers\plans\2026-07-31-cml-637b-dependency-compatibility-matrix.md" "C:\Users\anton\CurManLight_arena_matrix\docs\superpowers\plans\2026-07-31-cml-637b-dependency-compatibility-matrix.md"
```

- [x] **Step 2: Write the document**

Structure (English, consistent with `docs/CML_637B_VITE_WARNING_VERDICT.md`):

```
# CML-637B — Dependency Compatibility Matrix

## Verdict
CML_637B_DEPENDENCY_COMPATIBILITY_MATRIX_COMPLETED_RECOMMENDED_CELL_<X>
(X is the letter of the recommended cell; replace <X> during execution — never leave the angle brackets literal)

## Summary
(1-2 sentences: which cell is recommended and why)

## Environment
(branch, base commit 2ed681d, npm version, OS, dates)

## Matrix

| Cell | Setup | esbuild/oxc warnings | unit | indexeddb-browser | build | build-storybook | Notes |
|---|---|---|---|---|---|---|---|
| A | Vite 6.4.3 root + Vite 8.1.5 nested (lock as-is) | PRESENT (n) | PASS (m tests, d s) | PASS | PASS | PASS | baseline, reproduced |
| C | overrides vitest->vite 6.4.3 (single major) | none | ... | ... | ... | ... | ... |
| B1 | Vite 8.1.5 + @vitejs/plugin-react 5.x | none | ... | ... | ... | ... | ... |
| B2 | Vite 8.1.5 + @vitejs/plugin-react-oxc | none | ... | ... | ... | ... | ... |

## Measurement Protocol
(exact commands per check, output files referenced)

## Root Cause Re-confirmation
(1-2 lines: cell A reproduces the documented warnings)

## Recommendation
(concrete diff proposal for package.json + expected lock effect; explicitly notes whether cells B1/B2 were blocked and that cell C is the minimal safe fallback)

## Decision criteria evaluation
(checklist against the 6 decision criteria; the recommended cell satisfies 1, 2, 3, 6; 4 and 5 are tie-breakers)

## Constraints Honored
(list: only scratch worktree touched, no push, no src changes)
```

- [x] **Step 3: Review document for internal consistency**

Check: versions match the verified `node -e` outputs; durations present; warnings counts match the captured logs; recommendation references actual results; B1/B2 BLOCKED states (if any) carry the exact error. Fix inline.

- [ ] **Step 4: Commit locally (plan + matrix only)**

Run (in `C:\Users\anton\CurManLight_arena_matrix`):
```powershell
git add docs/CML_637B_DEPENDENCY_COMPATIBILITY_MATRIX.md docs/superpowers/plans/2026-07-31-cml-637b-dependency-compatibility-matrix.md
git diff --cached --check
git diff --cached --stat
git commit -m "docs(CML-637B): add dependency compatibility matrix"
```
Expected: 2 files committed (plan + matrix); `git status --short` empty; HEAD advances from `2ed681d`.

- [ ] **Step 5: Final state verification**

Run:
```powershell
git log -3 --oneline --decorate
git show --stat --oneline HEAD
git status --short
```
Expected: single docs commit on top of `2ed681d`, working tree clean, only the two docs files in the commit.

---

## Execution handoff

After approval: execute Tasks 1–7 in the scratch worktree only. Do **not** run `npm ci`/`npm install` in any other worktree. Do not push. Report results per cell with the captured log files as evidence, then hand back the matrix document and recommendation for review.
