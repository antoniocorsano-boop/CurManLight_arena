@AGENTS.md

## Claude Code

Use the shared session files in `session/` as the durable project memory. Keep auto memory for preferences and recurring lessons, but write task state, handoff notes, and command outcomes into the repository session directory so Codex, opencode, Copilot, and Claude can all resume from the same source.

## CurManLight Project

Italian school curriculum management tool. React 18 + TypeScript + Vite + Zustand + Dexie, compiled to single-file HTML via `vite-plugin-singlefile`.

### Commands
- `npm run build` — production build (copies index.html.template, builds, copies output)
- `npx vitest run` — run all tests (51+ tests: copilot, storage, wikiLLM)
- `npx tsc --noEmit` — typecheck (note: App.tsx has many pre-existing TS6133/TS7006 warnings, these are not blocking)

### Architecture
- **`src/App.tsx`** — single ~12,500-line component (entire UI). All state, modals, handlers inline.
- **`src/utils/`** — extracted pure modules: `storage.ts`, `clipboard.ts`, `escapeHtml.ts`, `semanticSearch.ts`, `wikiLLM.ts`
- **`src/utils/wikiLLM.ts`** — WikiLLM response generation: `generateWikiResponse()`, `detectDiscipline()` (word-boundary for short keywords), `findBestVolumeMatch()`, `scoreVolumeByTerms()`
- **`src/utils/storage.ts`** — `safeLocalStorageSetLarge`, `throttledSetLarge`, `pruneStaleConsolidatedEntries`, `getStorageUsage`, quota event dispatch

### Key Patterns
- **Storage dual-write**: `safeLocalStorageSetItem(key, val)` writes to both standalone key AND `curmanlight_stato_consolidato` consolidated blob (with timestamps for TTL). `safeLocalStorageSetLarge(key, val)` writes directly only.
- **Emergency backup**: Throttled via `throttledSetLarge` (max once/60s) on `beforeunload`/`visibilitychange`.
- **Storage startup maintenance**: `pruneStaleConsolidatedEntries()` removes entries > 30 days old. `getStorageUsage()` warns if > 4MB.
- **Discipline detection**: `detectDiscipline()` uses `\b` word-boundary regex for short keywords (< 4 chars like `'ia'`, `'lel'`) to prevent false positives. Longer keywords use `includes()`.
- **Single-file HTML output**: Final build is one `index.html` with all JS/CSS inlined. Test framework (Vitest) is excluded via `vitest.config.ts` include pattern.
- **No comments**: Do not add comments to code unless explicitly requested.

### TSConfig
- `noUnusedLocals: true` and `noUnusedParameters: true` are enabled — unused imports/vars are errors.
- Prefix unused destructured vars with `_` if needed.

