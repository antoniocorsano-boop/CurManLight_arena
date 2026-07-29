import { describe, it, expect } from 'vitest';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { createInitialGuidedWorkflowState } from '../features/guided-workflow/workflow';

describe('CML-633J — Legacy Surface Containment', () => {
  it('guided workflow does not duplicate curriculum content', () => {
    const state = createInitialGuidedWorkflowState();
    expect(state.selectedCurriculumRefs).toEqual([]);
  });

  it('guided workflow does not duplicate design artifacts', () => {
    const state = createInitialGuidedWorkflowState();
    expect(state.selectedDesignRef).toBeUndefined();
  });

  it('guided workflow does not duplicate document artifacts', () => {
    const state = createInitialGuidedWorkflowState();
    expect(state.generatedDocumentRef).toBeUndefined();
  });

  it('guided workflow does not duplicate revision artifacts', () => {
    const state = createInitialGuidedWorkflowState();
    expect(state.selectedRevisionRefs).toEqual([]);
  });

  it('reset preserves domain data integrity', () => {
    const store = useCurriculumStore.getState();
    store.setGuidedWorkflowState({
      currentStep: 'completion',
      completedSteps: ['context', 'curriculum-selection', 'selection-review', 'teaching-design', 'design-review', 'document-preparation', 'completion'],
      selectedCurriculumRefs: [{ id: 'c1' as any, entityType: 'curriculum-node' as any }],
      selectedRevisionRefs: [{ id: 'r1' as any, entityType: 'revision' as any }],
      selectedDesignRef: { id: 'd1' as any, entityType: 'design' as any },
      generatedDocumentRef: { id: 'doc1' as any, entityType: 'document' as any },
      warnings: [{ type: 'legacy-content' as any, message: 'Contenuto legacy utilizzato' as any }],
    });
    store.resetGuidedWorkflowState();
    expect(store.guidedWorkflowState).toBeUndefined();
    expect(store.designArchive).toBeDefined();
  });

  it('guided workflow does not modify institutional archive on reset', () => {
    const store = useCurriculumStore.getState();
    store.setGuidedWorkflowState(createInitialGuidedWorkflowState());
    store.resetGuidedWorkflowState();
    expect(store.institutionalArchive).toBeDefined();
  });
});