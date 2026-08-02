/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { cjsEsmBridge } from './vitest.shared';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), cjsEsmBridge()],
  test: {
    projects: [{
      extends: true,
      test: {
        name: 'unit',
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/__tests__/setup.ts'],
        css: false,
        include: ['src/__tests__/**/*.test.{ts,tsx}', 'src/domain/**/*.test.ts', 'src/features/**/*.test.tsx'],
        exclude: ['**/node_modules/**', '**/.git/**', 'src/__tests__/**/*.browser.test.{ts,tsx}'],
        // On Windows, the process-based worker pool produced intermittent startup
        // timeouts. Two thread workers provide stable unit-test execution while
        // keeping file-level parallelism enabled.
        pool: 'threads',
        maxWorkers: 2,
        fileParallelism: true,
        sequence: {
          groupOrder: 1
        }
      }
    }, {
      extends: true,
      test: {
        name: 'indexeddb-browser',
        include: ['src/__tests__/**/*.browser.test.{ts,tsx}'],
        testTimeout: 10_000,
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }, {
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        },
        sequence: {
          groupOrder: 2
        }
      }
    }]
  }
});
