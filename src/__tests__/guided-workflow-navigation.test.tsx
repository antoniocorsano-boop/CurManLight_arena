// Tests for guided workflow navigation (CML-633I)
import {
  GuidedWorkflowStep,
  GuidedTeacherWorkflowState,
  INITIAL_GUIDED_WORKFLOW_STATE
} from '../features/guided-workflow/types';
import {
  getNextStep,
  getPreviousStep
} from '../features/guided-workflow/selectors';

describe('GuidedWorkflow Navigation', () => {
  it('should define workflow step order', () => {
    const stepOrder: GuidedWorkflowStep[] = [
      'context',
      'curriculum-selection',
      'selection-review',
      'teaching-design',
      'design-review',
      'document-preparation',
      'completion'
    ];

    // Check that all steps are present
    stepOrder.forEach(step => {
      expect(step).toBeDefined();
    });

    // Check step count
    expect(stepOrder.length).toBe(7);
  });

  it('should get next step correctly', () => {
    const state: GuidedTeacherWorkflowState = { ...INITIAL_GUIDED_WORKFLOW_STATE };
    state.currentStep = 'context';

    expect(getNextStep(state)).toBe('curriculum-selection');

    state.currentStep = 'curriculum-selection';
    expect(getNextStep(state)).toBe('selection-review');

    state.currentStep = 'selection-review';
    expect(getNextStep(state)).toBe('teaching-design');

    state.currentStep = 'teaching-design';
    expect(getNextStep(state)).toBe('design-review');

    state.currentStep = 'design-review';
    expect(getNextStep(state)).toBe('document-preparation');

    state.currentStep = 'document-preparation';
    expect(getNextStep(state)).toBe('completion');

    state.currentStep = 'completion';
    expect(getNextStep(state)).toBeNull();
  });

  it('should get previous step correctly', () => {
    expect(getPreviousStep({ currentStep: 'design-review' } as any)).toBe('teaching-design');
    expect(getPreviousStep({ currentStep: 'teaching-design' } as any)).toBe('selection-review');
    expect(getPreviousStep({ currentStep: 'selection-review' } as any)).toBe('curriculum-selection');
    expect(getPreviousStep({ currentStep: 'curriculum-selection' } as any)).toBe('context');
    expect(getPreviousStep({ currentStep: 'context' } as any)).toBeNull();
  });
});
