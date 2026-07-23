# CML-609A — Execution Log

## Branch
- **Created**: feat/cml-609a-storybook-aria-query-compatibility
- **Base**: feat/cml-609-ui-system-pilot-audit (82e1c1e)
- **Status**: Local, not pushed

## Root Cause

### Peer Dependency Mismatch
`vitest@4.1.10` requires `vite@^6.0.0 || ^7.0.0 || ^8.0.0` as a dependency.
`@vitest/mocker@4.1.10` (transitive via `@vitest/browser`) requires `vite@^6.0.0 || ^7.0.0 || ^8.0.0`.
The project had `vite@5.4.21`, creating an invalid resolution.

### CJS→ESM Interop Failure
In Vitest browser mode, modules are served as ESM to a real Chromium browser via Vite dev server.
`aria-query@5.3.0` is a pure CJS package (`exports.elementRoles = void 0; ... exports.elementRoles = elementRoles`).
Vite 5's CJS interop failed to detect named exports from this chained pattern.
`lz-string@1.5.0` and `pretty-format@27.5.1` exhibited the same failure pattern.

## Changes

### `package.json`
- `vite`: `^5.2.11` → `^6.0.0` (resolved to 6.4.3)

### `vitest.config.ts`
- Added `cjsEsmBridge()` Vite plugin:
  - `config()` hook: sets `optimizeDeps.include` for `aria-query`, `lz-string`, `pretty-format`
  - `resolveId()` hook: intercepts `aria-query` and `lz-string` bare imports
  - `load()` hook: generates ESM modules with proper Map/Map-like serialization
  - Handles CJS→ESM conversion for modules with Map-like objects (`elementRoles`, `roleElements`, etc.)

## Validation
- **`npm test`**: EXIT CODE 0 — 15/15 test files, 243/243 tests (222 app + 21 Storybook)
- **`npm run build`**: EXIT CODE 0 — 1,088.80 kB (gzip 284.89 kB)
- **`npm run build-storybook`**: EXIT CODE 0 — 3,075.63 kB (gzip 911.14 kB)

## Impact
- Pre-existing Storybook test failures resolved (5 suites × ~4 tests each)
- All existing app tests continue to pass
- Build pipeline unaffected
- All existing plugins compatible: `@vitejs/plugin-react@4.7.0`, `vite-plugin-singlefile@2.3.3`, `@storybook/react-vite@10.5.3`
