import { defineConfig } from 'vite';
import { createUiSuiteConfig } from './vitest.ui-suites';

const include = [
  'src/__tests__/app-header-task10.test.tsx',
  'src/__tests__/classroom-task10.test.tsx',
];

export default defineConfig({
  ...createUiSuiteConfig(include),
  test: { ...createUiSuiteConfig(include).test, name: 'ui-smoke' },
});
