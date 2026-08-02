import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cjsEsmBridge } from './vitest.shared';

export default defineConfig({
  plugins: [react(), cjsEsmBridge()],
  test: {
    name: 'ui',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    css: false,
    include: ['src/__tests__/**/*.test.tsx', 'src/features/**/*.test.tsx'],
    pool: 'threads',
    maxWorkers: 2,
    fileParallelism: true,
  },
});
