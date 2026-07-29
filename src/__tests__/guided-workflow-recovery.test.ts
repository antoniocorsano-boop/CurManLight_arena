// Tests for guided workflow recovery (CML-633I)

import {
  GuidedTeacherWorkflowState,
  INITIAL_GUIDED_WORKFLOW_STATE
} from '../features/guided-workflow/types';
import {
  advanceToNextStep,
  goToPreviousStep,
  resetWorkflow
} from '../features/guided-workflow/workflow';

describe('GuidedWorkflow Recovery', () => {
  it('should preserve state during navigation', () => {
    const state: GuidedTeacherWorkflowState = {
      ...INITIAL_GUIDED_WORKFLOW_STATE,
      currentStep: 'teaching-design',
      completedSteps: ['context', 'curriculum-selection', 'selection-review'],
      selectedDesignRef: { id: 'design-1', type: 'design' } as any,
      selectedCurriculumRefs: [{ id: 'curric-1', type: 'traguardo' } as any],
      selectedRevisionRefs: [{ id: 'rev-1', type: 'traguardo' } as any],
      generatedDocumentRef: undefined,
      warnings: [] as any
    };

    const previousState = goToPreviousStep(state);

    expect(previousState.currentStep).toBe('selection-review');
    expect(previousState.completedSteps).toEqual(['context', 'curriculum-selection', 'selection-review']);
    expect(previousState.selectedDesignRef).toEqual({ id: 'design-1', type: 'design' });
    expect(previousState.selectedCurriculumRefs).toHaveLength(1);
    expect(previousState.selectedRevisionRefs).toHaveLength(1);
    expect(previousState.generatedDocumentRef).toBeUndefined();
    expect(previousState.warnings).toHaveLength(0);
  });

  it('should reset workflow to initial state', () => {
    const resetState = resetWorkflow();

    expect(resetState.currentStep).toBe('context');
    expect(resetState.completedSteps).toHaveLength(0);
    expect(resetState.selectedDesignRef).toBeUndefined();
    expect(resetState.selectedCurriculumRefs).toHaveLength(0);
    expect(resetState.selectedRevisionRefs).toHaveLength(0);
    expect(resetState.generatedDocumentRef).toBeUndefined();
    expect(resetState.warnings).toHaveLength(0);
  });

  it('should advance through workflow steps', () => {
    let state: GuidedTeacherWorkflowState = { ...INITIAL_GUIDED_WORKFLOW_STATE };

    // Advance through steps
    state = advanceToNextStep(state);
    expect(state.currentStep).toBe('curriculum-selection');

    state = advanceToNextStep(state);
    expect(state.currentStep).toBe('selection-review');

    state = advanceToNextStep(state);
    expect(state.currentStep).toBe('teaching-design');

    state = advanceToNextStep(state);
    expect(state.currentStep).toBe('design-review');

    state = advanceToNextStep(state);
    expect(state.currentStep).toBe('document-preparation');

    state = advanceToNextStep(state);
    expect(state.currentStep).toBe('completion');
  });
});
