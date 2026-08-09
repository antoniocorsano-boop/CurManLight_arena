# Session State

> Nota storica: snapshot precedente la sanificazione finale del repository; rami e worktree CML-637B qui indicati come conservati sono stati integrati/rimossi/ripuliti nella PR #16.

- Session: 20260731_214634
- Repo: C:/Users/anton/CurManLight_arena
- Branch (main worktree): fix/cml-637b-test-suite-stabilization
- Started: 2026-07-31 21:46:34 +02:00
- Updated: 2026-08-09 22:49:59 +02:00

## Goal
CML-637B — confirm Vite esbuild/oxc warning root cause, document dependency debt verdict, execute the dependency compatibility matrix, and close CML-637B by adopting Cell C plus a fast test workflow.

## Current Subtask
CML-637B CHIUSO, MERGIATO e PULITO (`CML_637B_CLEANUP_COMPLETED_SAFE`). Merge `026542c` su origin/main; cleanup conservativo completato.

## Loaded Skills
- agent-memory protocol - preserve context across Codex, opencode, Copilot, and Claude.

## Current Status
- Verdict docs integrated on `main` = `2ed681d` (PR #14, fast-forward), branch docs kept.
- Matrix executed in scratch `C:/Users/anton/CurManLight_arena_matrix` (branch `docs/cml-637b-dependency-compatibility-matrix`), base `2ed681d`. Cells: A (warnings present), C **RECOMMENDED** (override vite 6.4.3, 0 warnings, single major), B1 (vite 8 + plugin-react 5.2.0, green but new `[PLUGIN_TIMINGS]`), B2 (BLOCKED ERESOLVE). Commit `62a8f9a` (matrix + plan). NO push.
- CLOSING worktree `C:/Users/anton/CurManLight_arena_single_vite` (branch `fix/cml-637b-single-vite-and-fast-test-workflow`, base `2ed681d`): cell C applied (override + lock regenerated; single Vite 6.4.3; rolldown absent; storybook 10.5.5; 157 lockfile entries classified as intended override effect + registry drift).
- Scripts added: `test:fast` (vitest.fast.config.ts, 8 curated files, 273 tests), `test:unit`, `test:browser`, `test:storybook`, `test:full`. `npm test` unchanged.
- Measurements (median): test:fast 21.90s (18.9–22.0), test:unit 228.92s (170.8–330.3), test:browser 3.18s (2.9–3.6), test:storybook 11.67s (11.4–33.3), test:full 324.17s (260.9–373.7). All PASS, 1767 tests total, 0 esbuild/oxc/PLUGIN_TIMINGS.
- Bottleneck quantified: per-file jsdom/node env + worker startup (~2.3s/file + fixed startup), NOT assertions (tests cumulative ~30s). `--maxWorkers=4` measured no improvement (29.95 vs 29.11s). test:unit/test:full targets (90s/180s) not reachable without risky changes → documented, not forced (per brief).
- Commit `beb69de`: 7 files (package.json, package-lock.json, vitest.config.ts, vitest.fast.config.ts, report + matrix + plan docs). Working tree clean. NO push.
- PUSH + PR + REVIEW + MERGE (2026-07-31 22:00Z): ramo pushato su origin; **PR #15** vs `main` (`MERGEABLE`/`CLEAN`); review lockfile: 157 variazioni (78 changed + 21 added + 58 removed) classificate in (A) effetto override [rolldown 22 voci + lightningcss 12 + detect-libc + vite@8.1.5 nested rimossi; esbuild binaries hoisting flip], (B) drift registry tutto entro range caret dichiarati (storybook 10.5.5, playwright 1.62.1, react-router 7.18.2, postcss 8.5.25, autoprefixer 10.5.4, rollup 4.62.3, ecc.), (C) hoisting restructure senza variazioni di versione; nessuna dipendenza inattesa, `npm ls` pulito, vitest 4.1.10 nel peer range `^6.0.0||^7.0.0||^8.0.0`; **merge commit `026542c`** su `origin/main` (convenzione repo: merge commit).
- Ramo remoto `fix/cml-637b-single-vite-and-fast-test-workflow` ancora presente (non eliminato — cleanup opzionale); worktree `_single_vite` in sync, pulita. `origin/main` ora `026542c`.
- CLEANUP (conservativo, worktree principale non toccata): rimossi rami locali `fix/cml-637b-single-vite-and-fast-test-workflow` (`-D`, autorizzato dopo -d rifiutato per upstream eliminato; evidenza antenato di main) e `docs/cml-637b-vite-warning-dependency-debt` (`-d`, merged nello upstream); rimossi remoti `origin/fix/cml-637b-single-vite-and-fast-test-workflow` e `origin/docs/cml-637b-vite-warning-dependency-debt` (PR #14 e #15 merged); rimossi worktree `_single_vite` e `_cml637b_closeout` (no --force); eliminato backup `backup/main-before-cml-634b-r5` (`-d`, interamente in origin/main, nessuna worktree, nessun valore recupero). Prune worktree+remote+fetch eseguito. fsck: oggetti unreachable lasciati intatti.
- CONSERVATI: worktree principale `CurManLight_arena` su `fix/cml-637b-test-suite-stabilization` (SPORCA, 39 entry: `M kilo.jsonc` + untracked — ramo senza commit propri, diff nullo vs main); `docs/cml-637b-dependency-compatibility-matrix` `62a8f9a` (NOT ancestor di main → non eliminabile, contenuto già su main via file-copy in `beb69de`); ramo locale `main` `c00ba6b` (worktree `_merge_review`); tutti i rami non CML-637B. `origin/main` invariato = `026542c`.
- Main worktree untouched (`M kilo.jsonc` + untracked invariate). merge_review `main` ref a `c00ba6b` (locale, preesistente).

## Plan
- [x] Task 1: scratch worktree + prerequisiti.
- [x] Task 2: cell A (lock as-is).
- [x] Task 3: cell C (override) — RECOMMENDED.
- [x] Task 4: cell B1 (vite 8 + plugin-react 5.x) — green ma nuovi PLUGIN_TIMINGS.
- [x] Task 5: cell B2 (vite 8 + plugin-react-oxc) — BLOCKED install.
- [x] Task 6: worktree verificate intatte.
- [x] Task 7: matrice + piano committati (`62a8f9a`), no push.
- [x] Closing: worktree `_single_vite`, cell C applicata, profilazione, script fast, 3 misurazioni per comando, report, commit `beb69de`, no push.
- [x] Push + PR #15 + review lockfile + merge `026542c` su origin/main.
- [x] Cleanup conservativo: rami/remoti/worktree CML-637B rimossi (salvo non-antenati/sporchi), backup valutato, prune, verifica origin/main. `CML_637B_CLEANUP_COMPLETED_SAFE`.

## Assumptions
- Session files are safe to commit because they must not contain secrets.

## Blockers
- Nessun blocco. CML-637B chiuso, mergiato (PR #15, `026542c`) e ripulito. Pendenze deliberate: worktree principale sporca (da classificare prima di chiudere `fix/cml-637b-test-suite-stabilization`); ramo matrice `62a8f9a` conservato (non antenato); oggetti fsck unreachable non rimossi. Opzionali: cleanup ramo storico `fix/cml-637b`, avvio `CML_TEST_SUITE_PERFORMANCE`.

## Evidence
- Log 4 check per cella: log di evidenza generati nella directory scratch locale, non versionati nel repository (file `cellX-*.txt`).
- Misurazioni workflow: `fast-run*.txt`, `fast8-run*.txt`, `profile-unit.txt`, `profile-fast*.txt`, `sb-run.txt` (stessa directory scratch locale, non versionati).
- Piano: `docs/superpowers/plans/2026-07-31-cml-637b-dependency-compatibility-matrix.md` (gitignored, add -f usato).
