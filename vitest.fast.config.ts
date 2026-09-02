/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cjsEsmBridge } from './vitest.config';

// CML-637B fast test workflow: a curated, deterministic subset of the unit
// suite for daily development (target < 30s). Excludes browser tests,
// Storybook, real migration tests and heavy integration suites. This config
// is NOT part of `vitest run` / `npm test`; use `npm run test:fast`.
export default defineConfig({
  plugins: [react(), cjsEsmBridge()],
  test: {
    name: 'fast',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    css: false,
    include: [
      'src/domain/ai/executionService.test.ts',
      'src/domain/ai/localOllamaProvider.test.ts',
      'src/domain/ai/ollamaModelDiscovery.test.ts',
      'src/domain/ai/ollamaTransport.test.ts',
      'src/domain/ai/requestPreview.test.ts',
      'src/__tests__/transfer-domain.test.ts',
      'src/__tests__/docente-feedback-intake.test.ts',
      'src/__tests__/revision-domain.test.ts',
      'src/__tests__/r7a4-shared-submitted-proposal-authority-boundary.test.ts',
      'src/__tests__/r7a4-shared-proposal-scope-binding.test.ts',
      'src/__tests__/r7a4-authority-identity-closure.test.ts',
      'src/__tests__/r7a4-client-request-id-persistence.test.ts',
      'src/__tests__/r7a5-shared-submitted-proposal-persistence.test.ts',
      'src/__tests__/r7a5-canonical-payload-server-validation.test.ts',
      'src/__tests__/r7a5-codex-review-closure.test.ts',
      'src/__tests__/identity.test.ts',
      'src/__tests__/beta-identity-authority.test.ts',
      'src/__tests__/beta-shell-regression.test.ts',
      'src/__tests__/s3c-final-human-remediation.test.ts',
      'src/__tests__/guide-readability-s3c.test.tsx',
      'src/__tests__/arena-product-boundary-runtime.test.ts',
      'src/__tests__/arena-institutional-planning-language.test.ts',
      'src/__tests__/arena-s3-human-validation-contract.test.ts',
      'src/__tests__/curriculum-foundation-authority.test.ts',
      'src/__tests__/curriculum-foundation-completeness.test.ts',
      'src/__tests__/dm221-canonical-structure.test.ts',
      'src/__tests__/dm221-requirement-profile.test.ts',
      'src/__tests__/dm221-legacy-structure-audit.test.ts',
      'src/__tests__/dm221-element-bindings.test.ts',
      'src/__tests__/dm221-binding-coverage.test.ts',
      'src/__tests__/dm221-technology-source-index.test.ts',
      'src/__tests__/dm221-technology-element-inventory.test.ts',
      'src/__tests__/dm221-technology-human-verification.test.ts',
      'src/__tests__/dm221-technology-source-review-ui.test.tsx',
      'src/__tests__/interop-runtime-context-scope.test.ts'
    ],
    exclude: ['**/node_modules/**', '**/.git/**'],
    pool: 'threads',
    maxWorkers: 2,
    fileParallelism: true
  }
});
