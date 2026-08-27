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
      'src/__tests__/identity.test.ts',
      'src/__tests__/beta-identity-authority.test.ts'
    ],
    exclude: ['**/node_modules/**', '**/.git/**'],
    pool: 'threads',
    maxWorkers: 2,
    fileParallelism: true
  }
});
