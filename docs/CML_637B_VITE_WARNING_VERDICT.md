# CML-637B — Vite/Vitest esbuild→oxc Warning Root Cause & Verdict

## Verdict

```text
CML_637B_VITE_WARNING_ROOT_CAUSE_CONFIRMED
CML_637B_WARNING_DEPENDENCY_DEBT_DOCUMENTED
```

## Summary

The `esbuild` / `optimizeDeps.esbuildOptions` deprecation warnings observed during CML-634B R5 runs do **not** come from the project's Vite/Vitest configuration, and cannot be fixed at configuration level without changing dependencies. They are caused by the committed `package-lock.json` resolving **two Vite majors**: `vite@6.4.3` at the project root and `vite@8.1.5` (rolldown/oxc engine) nested under `vitest@4.1.10`.

| Item | Value |
|------|-------|
| Branch | `fix/cml-637b-test-suite-stabilization` |
| HEAD | `991ad31` (worktree `CurManLight_arena`) |
| Project vite | `6.4.3` |
| vitest nested vite (from lock) | `8.1.5` |
| rolldown (from lock) | `1.1.5` |
| `@vitejs/plugin-react` | `4.7.0` |
| vitest | `4.1.10` |
| storybook | `10.5.5` (`main`) / `10.5.3` (merge_review) |

## Reproduction Evidence (first-hand, 2026-07-31)

### A. Fresh install (worktree `CurManLight_arena_merge_review`, node_modules installed 31/07)

Command: `npx vitest run --project unit src/__tests__/curriculum-persistence/schema.test.ts`

```
[vite] warning: `esbuild` option was specified by "vite:react-babel" plugin.
       This option is deprecated, please use `oxc` instead.
[vite] warning: `optimizeDeps.esbuildOptions` option was specified by
       "vite:react-babel" plugin. This option is deprecated,
       please use `optimizeDeps.rolldownOptions` instead.
Both esbuild and oxc options were set. oxc options will be used and
esbuild options will be ignored. The following esbuild options were set:
`{ jsx: 'automatic', jsxImportSource: undefined }`

Test Files  1 passed (1)
     Tests  10 passed (10)
  Duration  1.63s
```

Warnings present; tests green. The merge_review tree resolves `vitest@4.1.10 → vite@8.1.5` (nested) and installs `rolldown@1.1.5`.

### B. Stale install (worktree `CurManLight_arena`, node_modules installed 29/07)

Same command, same tracked files:

```
Test Files  1 passed (1)
     Tests  11 passed (11)
  Duration  5.12s
```

**Zero** esbuild/oxc warnings. This tree resolves `vitest@4.1.10 → vite@6.4.3` (deduped, hoisted) and has no `rolldown`. The node_modules predate the lock entry that pins the nested vite 8. The only warning in this run is `No story files found for the specified pattern: src\**\*.mdx`, a separate storybook pattern issue removed by R5 (`c00ba6b`).

## Root Cause Chain

1. **Tracked lock carries two Vite majors.** `package-lock.json` (entry introduced in `99ee137` CML-603 baseline, still present at `991ad31`) contains:
   - `node_modules/vite` → `6.4.3`
   - `node_modules/vitest/node_modules/vite` → `8.1.5`
   - `node_modules/rolldown` → `1.1.5`
   - `vitest@4.1.10` declares `vite: ^6.0.0 || ^7.0.0 || ^8.0.0`, so the nested resolution is valid and survives a clean `npm ci`.

2. **Plugin React is hoisted against Vite 6.** `@vitejs/plugin-react@4.7.0` is installed at the root, so its `import ... from "vite"` resolves `vite@6.4.3`. The runtime feature-detect `"rolldownVersion" in vite` is therefore `false`.

3. **Plugin writes legacy options.** With `rolldownVersion` absent, the `vite:react-babel` `config()` hook (`dist/index.cjs:150-156`) sets the legacy options `esbuild: { jsx: "automatic", jsxImportSource }` and `optimizeDeps.esbuildOptions: { jsx: "automatic" }`.

4. **Vitest serves on Vite 8.** Vitest's Vite server runs the nested `vite@8.1.5` (rolldown + oxc). Its config validation sees the plugin-provided `esbuild`/`esbuildOptions` and emits the deprecation warnings; since oxc is active by default, it also reports "Both esbuild and oxc options were set. oxc options will be used…".

5. **Masking by stale install.** The main worktree did not reproduce because its 29/07 node_modules install predates the nested vite 8 entry. Any clean install from the tracked lock reproduces the warnings (confirmed in the merge_review tree).

## Why No Configuration-Only Fix Exists

- The offending options are injected by `vite:react-babel` (plugin-react 4.7.0), not by any user config. `git grep` over `*.ts/*.js/*.json/*.jsonc` finds no `esbuild`/`esbuildOptions`/`oxc`/`rolldownOptions` in the project sources.
- For the automatic JSX runtime, the plugin always sets top-level `esbuild` regardless of the Vite major (line 150-154), so even making the plugin detect Vite 8 would still emit the `esbuild → oxc` warning.
- Vite user config cannot remove options merged in by a later plugin `config()` hook.

## Documented Dependency Debt (not applied — out of scope)

No change to `package.json`, `package-lock.json`, or `node_modules` was made. Options that would resolve the warnings when a dependency change is authorized:

| Option | Change | Effect |
|--------|--------|--------|
| **Recommended** | Upgrade `@vitejs/plugin-react` to a version supporting oxc (`@vitejs/plugin-react-oxc` or plugin-react 5.x) | Stops injecting `esbuild`/`esbuildOptions`; uses `oxc`/`rolldownOptions` |
| Alternative | Pin the nested vite under `vitest` to 6.x (e.g. `overrides`), or install with a single Vite major | Warnings disappear because the server stays esbuild-based |

## Constraints Honored

- No dependency update, no lockfile change.
- No `git clean` / `reset --hard` / stash / rebase / merge / pull / push.
- `kilo.jsonc` (pre-existing modification) and all untracked files left untouched.
- Branch `fix/cml-637b-test-suite-stabilization` stays at `991ad31`, `0/1` behind `origin/main`.
