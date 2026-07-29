import { describe, it, expect } from 'vitest';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { createInitialGuidedWorkflowState } from '../features/guided-workflow/workflow';
import type { GuidedWorkflowStep } from '../features/guided-workflow/types';

describe('CML-633J — Store and Rehydration', () => {
  it('store initializes guidedWorkflowState to undefined when absent', () => {
    const store = useCurriculumStore.getState();
    expect(store.guidedWorkflowState).toBeUndefined();
  });

  it('setGuidedWorkflowState updates state without side effects', () => {
    const store = useCurriculumStore.getState();
    store.setGuidedWorkflowState(createInitialGuidedWorkflowState());
    const updated = useCurriculumStore.getState();
    expect(updated.guidedWorkflowState).toEqual(createInitialGuidedWorkflowState());
  });

  it('resetGuidedWorkflowState clears only workflow progress', () => {
    const store = useCurriculumStore.getState();
    store.setGuidedWorkflowState({
      currentStep: 'completion' as GuidedWorkflowStep,
      completedSteps: ['context' as GuidedWorkflowStep, 'curriculum-selection' as GuidedWorkflowStep, 'selection-review' as GuidedWorkflowStep, 'teaching-design' as GuidedWorkflowStep, 'design-review' as GuidedWorkflowStep, 'document-preparation' as GuidedWorkflowStep, 'completion' as GuidedWorkflowStep],
      selectedCurriculumRefs: [],
      selectedRevisionRefs: [],
      selectedDesignRef: { id: 'd1' as any, entityType: 'design' as any },
      generatedDocumentRef: { id: 'doc1' as any, entityType: 'document' as any },
      warnings: [{ type: 'legacy-content' as any, message: 'Contenuto legacy utilizzato' as any }],
    });
    store.resetGuidedWorkflowState();
    const afterReset = useCurriculumStore.getState();
    expect(afterReset.guidedWorkflowState).toBeUndefined();
    expect(afterReset.designArchive).toBeDefined();
    expect(afterReset.institutionalArchive).toBeDefined();
  });

  it('guidedWorkflowState rehydrates from persisted state', () => {
    const store = useCurriculumStore.getState();
    store.setGuidedWorkflowState({
      currentStep: 'design-review' as GuidedWorkflowStep,
      completedSteps: ['context' as GuidedWorkflowStep, 'curriculum-selection' as GuidedWorkflowStep, 'selection-review' as GuidedWorkflowStep, 'teaching-design' as GuidedWorkflowStep],
      selectedCurriculumRefs: [],
      selectedRevisionRefs: [],
      selectedDesignRef: { id: 'd1' as any, entityType: 'design' as any },
      generatedDocumentRef: undefined,
      warnings: [],
    });
    useCurriculumStore.persist.rehydrate();
    const rehydrated = useCurriculumStore.getState();
    expect(rehydrated.guidedWorkflowState?.currentStep).toBe('design-review');
  });
});