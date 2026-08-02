import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cjsEsmBridge } from './vitest.shared';

export default defineConfig({
  plugins: [react(), cjsEsmBridge()],
  test: {
    name: 'persistence',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    css: false,
    include: [
      'src/__tests__/**/*persistence*.test.ts',
      'src/__tests__/**/*migration*.test.ts',
      'src/__tests__/storage.test.ts',
      'src/__tests__/**/*rehydration*.test.ts',
    ],
    exclude: ['**/node_modules/**', '**/.git/**', 'src/__tests__/**/*.browser.test.ts'],
    pool: 'threads',
    maxWorkers: 2,
    fileParallelism: true,
  },
});
