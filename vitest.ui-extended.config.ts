import { defineConfig } from 'vite';
import { createUiSuiteConfig } from './vitest.ui-suites';

const include = [
  'src/__tests__/uda-detail-modal.test.tsx',
  'src/__tests__/knowledge-companion.test.tsx',
  'src/__tests__/institution-integration.test.tsx',
  'src/__tests__/cml-638b-hook.test.tsx',
  'src/__tests__/cml-634b-r4b-teacher-local-ai-ui.test.tsx',
  'src/__tests__/cml-633j-end-to-end-flow.test.tsx',
  'src/__tests__/copilot.test.tsx',
  'src/__tests__/cml617b-activity.test.tsx',
  'src/__tests__/cml611-dialogs-confirmations.test.tsx',
  'src/__tests__/cml610-empty-states.test.tsx',
  'src/features/ai/components/LocalAiModelSelector.test.tsx',
];

export default defineConfig({
  ...createUiSuiteConfig(include),
  test: { ...createUiSuiteConfig(include).test, name: 'ui-extended' },
});
