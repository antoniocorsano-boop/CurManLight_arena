import { defineConfig } from 'vite';
import { createUiSuiteConfig } from './vitest.ui-suites';

const include = [
  'src/__tests__/cml-631f-r1-canonical-ui.test.tsx',
  'src/__tests__/cml-636b-canonical-preview-ui.test.tsx',
  'src/__tests__/document-continuity.test.tsx',
  'src/__tests__/guided-workflow-document.test.tsx',
  'src/__tests__/cml-638b-a07-canonical-ui.test.tsx',
];

export default defineConfig({
  ...createUiSuiteConfig(include),
  test: { ...createUiSuiteConfig(include).test, name: 'ui-documents' },
});
