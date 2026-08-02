import react from '@vitejs/plugin-react';
import { cjsEsmBridge } from './vitest.shared';

export function createUiSuiteConfig(include: string[]) {
  return {
    plugins: [react(), cjsEsmBridge()],
    test: {
      globals: true,
      environment: 'jsdom' as const,
      setupFiles: ['./src/__tests__/setup.ts'],
      css: false,
      include,
      pool: 'threads' as const,
      maxWorkers: 2,
      fileParallelism: true,
    },
  };
}
