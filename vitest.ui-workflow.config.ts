import { defineConfig } from 'vite';
import { createUiSuiteConfig } from './vitest.ui-suites';

const include = [
  'src/__tests__/dashboard-task10.test.tsx',
  'src/__tests__/teacher-workspace-part1.test.tsx',
  'src/__tests__/teacher-workspace-part2.test.tsx',
  'src/__tests__/teacher-workspace-part3.test.tsx',
  'src/__tests__/navigation.cml604d.test.tsx',
  'src/__tests__/guided-workflow-navigation.test.tsx',
  'src/__tests__/guided-workflow-design.test.tsx',
  'src/__tests__/guided-workflow-curriculum-selection.test.tsx',
  'src/__tests__/guided-workflow-accessibility.test.tsx',
  'src/__tests__/interaction.cml603d.test.tsx',
  'src/__tests__/design-transfer-integration.test.tsx',
  'src/__tests__/curriculum-functional-pilot/cml631g-pilot-init.test.tsx',
  'src/__tests__/social-task10.test.tsx',
];

export default defineConfig({
  ...createUiSuiteConfig(include),
  test: { ...createUiSuiteConfig(include).test, name: 'ui-workflow' },
});
