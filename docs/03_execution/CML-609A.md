# CML-609A — Execution Log

## Branch
- **Created**: feat/cml-609a-storybook-aria-query-compatibility
- **Base**: feat/cml-609-ui-system-pilot-audit (82e1c1e)
- **Status**: Local, not pushed

## Initial State
- **HEAD**: 82e1c1e (CML-609 closure)
- **Vite**: 5.4.21
- **Vitest**: 4.1.10
- **Test**: 5 failed (Storybook) | 10 passed (15) — 222/222 app tests pass
- **Build**: 1,085.98 kB (gzip 283.74 kB) ✓
- **npm test exit code**: 1

## Baseline Comparison
| Metric | Before (CML-609) | After (CML-609A) |
|---|---|---|
| Vite | 5.4.21 | 6.4.3 |
| Vitest | 4.1.10 | 4.1.10 |
| npm test exit code | 1 | 0 |
| Test files | 5 failed, 10 passed | 15 passed |
| Tests | 222 passed | 243 passed (222 app + 21 Storybook) |
| Build app | 1,085.98 kB | 1,088.80 kB |
| Build Storybook | 3,061.75 kB | 3,075.63 kB |

## Root Cause

### Peer Dependency Mismatch
`vitest@4.1.10` depends on `vite@^6.0.0 || ^7.0.0 || ^8.0.0`.
`@vitest/mocker@4.1.10` (transitive via `@vitest/browser`) depends on `vite@^6.0.0 || ^7.0.0 || ^8.0.0`.
The project had `vite@5.4.21`, creating an invalid `npm ls` resolution.

### CJS→ESM Interop Failure
In Vitest browser mode, modules are served as ESM to a real Chromium browser via Vite dev server.
`aria-query@5.3.0` is a pure CJS package (`exports.elementRoles = void 0; ... exports.elementRoles = elementRoles`).
Vite 5's CJS interop failed to detect named exports from this chained pattern.
`lz-string@1.5.0` and `pretty-format@27.5.1` exhibited the same failure pattern.

## Changes

### `package.json`
- `vite`: `^5.2.11` → `^6.0.0` (resolved to 6.4.3)

### `package-lock.json`
- Updated automatically by `npm install`
- Lockfile contains correct Vite 6.4.3 resolution with integrity hash
- Verified consistent: `npm install` produces identical result, no drift

### `vitest.config.ts`
- Added `cjsEsmBridge()` Vite plugin:
  - `config()` hook: sets `optimizeDeps.include` for `aria-query`, `lz-string`, `pretty-format`
  - `resolveId()` hook: intercepts `aria-query` and `lz-string` bare imports → virtual modules
  - `load()` hook: generates ESM code with proper Map/Map-like serialization
  - Handles CJS→ESM conversion for modules with Map-like objects (`elementRoles`, `roleElements`, etc.)

## Plugin Audit: cjsEsmBridge

### Vite Hooks Used
| Hook | Purpose |
|---|---|
| `config()` | Adds `optimizeDeps.include` for 3 CJS modules |
| `resolveId(source)` | Intercepts `aria-query` and `lz-string` bare imports |
| `load(id)` | Generates ESM code for virtual module IDs |

### Modules Intercepted
| Module | resolveId | optimizeDeps.include | Reason |
|---|---|---|---|
| `aria-query` | ✅ | ✅ | Map-like objects lose `.entries()` when serialized as plain objects |
| `lz-string` | ✅ | ✅ | Default export CJS interop failure |
| `pretty-format` | ❌ | ✅ | `exports is not defined` in browser; optimizer handles it |

### Serialization Logic
- Real `Map` instances → `new Map([...entries])`
- Map-like objects (with `.entries()` method, null prototype) → detected by `isMapLike()`, converted to real `Map`
- `Set` instances → `new Set([...values])`
- Functions → `(function(){})` stub (not used by consumers in test context)
- Arrays → recursively serialized
- Objects → recursively serialized
- Primitives → `JSON.stringify`

### Scope Limitation
- Plugin only active in `vitest.config.ts` (test runner), NOT in `vite.config.ts` (production build)
- `resolveId` only intercepts 2 specific bare imports; all other modules pass through unchanged
- `load` only returns code for `\0cjs-bridge:*` IDs; all other IDs return `null`

### Risks
- `isMapLike()` could false-positive on objects with `.entries()` (mitigated: arrays/strings caught earlier)
- Function stubs could mask real usage (mitigated: functions not used in test context for these modules)
- Future CJS modules with similar issues need manual addition to allowlist
- `pretty-format` is only in optimizer, not intercepted — if optimizer behavior changes, it may need bridging

### Removal Criteria
When `aria-query` publishes an ESM build, or when `@testing-library/dom` upgrades to a version that doesn't depend on `pretty-format@27.x`, the bridge can be removed. Check with:
```
npm ls aria-query
npm ls pretty-format
```

## Validation

### npm ci
- `npm ci` succeeded after stopping node/esbuild processes and removing node_modules
- `npm ci` EXIT CODE 0 — 429 packages installed, 0 vulnerabilities
- Verified: Vite 6.4.3, Vitest 4.1.10, no peer dependency mismatches
- Reproducibility confirmed from clean lockfile

### Tests
```
npm test          → EXIT CODE 0
Test Files        → 15 passed (15)
Tests             → 243 passed (243)
                  → 222 app tests + 21 Storybook tests
```

### Builds
```
npm run build         → EXIT CODE 0 — 1,088.80 kB (gzip 284.89 kB)
npm run build-storybook → EXIT CODE 0 — 3,075.63 kB (gzip 911.14 kB)
```

### TypeScript
- 143 pre-existing errors (unchanged, no new errors)

## File Summary
| File | Change | Commit |
|---|---|---|
| `package.json` | Vite ^5.2.11 → ^6.0.0 | 3778097 |
| `package-lock.json` | Updated lockfile | 3778097 |
| `vitest.config.ts` | Added cjsEsmBridge plugin | 3778097 |
| `docs/03_execution/CML-609A.md` | Created | 3778097 |

## Residual Risk
- **Low**: Bridge is test-only, well-scoped, and removable when upstream fixes land
- **Low**: Vite 5→6 upgrade is a major version bump, but all plugins confirmed compatible

## Closure Reserves (resolved)

### npm ci reproducibility
`npm ci` succeeded (EXIT CODE 0) after stopping node processes and removing node_modules. Reproducibility from clean lockfile confirmed.

### Stash audit
Four pre-existing stash entries audited:
| Stash | Branch | Content | CML-609A files |
|---|---|---|---|
| `{0}` | feat/cml-609-ui-system-pilot-audit | CML-609.md, CML-609 proposal, index.html | No |
| `{1}` | feat/cml-609-ui-system-pilot-audit | index.html | No |
| `{2}` | main | index.html, kilo.jsonc, session files | No |
| `{3}` | feat/cml-606-ui-system-documents-pilot | index.html, session files, App.tsx, DocumentExportHistory.tsx, SessionModals.tsx, main.tsx | No |

No stash created or modified by CML-609A. All four are pre-existing, not pertinent to this slice.

### Untracked screenshots
Four screenshots in `report/cml-609-screenshots/` are local evidence from the CML-609 audit. They are intentionally not versioned — not available in the PR, not part of the commit. Cited in `CML-609.md` as reference evidence.

## Verdict

```
CML_609A_STORYBOOK_ARIA_QUERY_COMPATIBILITY_FIXED_AND_REPRODUCIBLE_LOCAL
```

## Commit
- `3778097` fix: resolve Storybook aria-query CJS/ESM incompatibility
- Branch: `feat/cml-609a-storybook-aria-query-compatibility`
- Not pushed, no PR, no merge
