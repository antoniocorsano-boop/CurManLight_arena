import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cjsEsmBridge } from './vitest.shared';

export default defineConfig({
  plugins: [react(), cjsEsmBridge()],
  test: {
    name: 'unit',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    css: false,
    include: ['src/__tests__/**/*.test.{ts,tsx}', 'src/domain/**/*.test.ts', 'src/features/**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/.git/**', 'src/__tests__/**/*.browser.test.{ts,tsx}'],
    pool: 'threads',
    maxWorkers: 2,
    fileParallelism: true,
  },
});
