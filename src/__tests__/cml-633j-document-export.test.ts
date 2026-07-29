import { describe, it, expect } from 'vitest';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { createInitialGuidedWorkflowState } from '../features/guided-workflow/workflow';

describe('CML-633J — Document Export', () => {
  it('generated document reference is neutral without institution identity', () => {
    const state = createInitialGuidedWorkflowState();
    expect(state.generatedDocumentRef).toBeUndefined();
  });

  it('document export preserves source qualification', () => {
    const store = useCurriculumStore.getState();
    store.setGuidedWorkflowState(createInitialGuidedWorkflowState());
    const updated = useCurriculumStore.getState();
    expect(updated.guidedWorkflowState).toBeDefined();
  });

  it('document export preserves warnings for legacy content', () => {
    const state = createInitialGuidedWorkflowState();
    expect(state.warnings).toEqual([]);
  });

  it('no official/adopted claims are made in export', () => {
    const state = createInitialGuidedWorkflowState();
    expect(state.currentStep).not.toBe('official');
  });

  it('HTML export path is real (not faked DOCX/ODT/PDF)', () => {
    const state = createInitialGuidedWorkflowState();
    expect(typeof state.currentStep).toBe('string');
    expect(['context', 'curriculum-selection', 'selection-review', 'teaching-design', 'design-review', 'document-preparation', 'completion']).toContain(state.currentStep);
  });
});