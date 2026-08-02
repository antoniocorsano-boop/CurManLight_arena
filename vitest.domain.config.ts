import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cjsEsmBridge } from './vitest.shared';

export default defineConfig({
  plugins: [react(), cjsEsmBridge()],
  test: {
    name: 'domain',
    globals: true,
    environment: 'node',
    css: false,
    include: ['src/__tests__/**/*.test.ts', 'src/domain/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/.git/**', 'src/__tests__/**/*.browser.test.ts', 'src/__tests__/cml-633j-*.test.ts', 'src/__tests__/role-onboarding-task10.test.ts', 'src/__tests__/*persistence*.test.ts', 'src/__tests__/*rehydration*.test.ts'],
    pool: 'threads',
    maxWorkers: 2,
    fileParallelism: true,
  },
});
