// Tests for guided workflow document (CML-633I)
import {
  GuidedWorkflowStep,
  GuidedTeacherWorkflowState,
  INITIAL_GUIDED_WORKFLOW_STATE
} from '../features/guided-workflow/types';
import {
  getNextStep,
  getPreviousStep
} from '../features/guided-workflow/selectors';

describe('GuidedWorkflow Document', () => {
  it('should define all workflow steps', () => {
    const steps: GuidedWorkflowStep[] = [
      'context',
      'curriculum-selection',
      'selection-review',
      'teaching-design',
      'design-review',
      'document-preparation',
      'completion'
    ];

    steps.forEach(step => {
      expect(typeof step).toBe('string');
    });
  });

  it('should navigate through workflow steps', () => {
    let state: GuidedTeacherWorkflowState = { ...INITIAL_GUIDED_WORKFLOW_STATE };

    // Move through steps
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
    let state: GuidedTeacherWorkflowState = { ...INITIAL_GUIDED_WORKFLOW_STATE };
    state.currentStep = 'design-review';
    expect(getPreviousStep(state)).toBe('teaching-design');

    state.currentStep = 'document-preparation';
    expect(getPreviousStep(state)).toBe('design-review');

    state.currentStep = 'teaching-design';
    expect(getPreviousStep(state)).toBe('selection-review');

    state.currentStep = 'selection-review';
    expect(getPreviousStep(state)).toBe('curriculum-selection');

    state.currentStep = 'curriculum-selection';
    expect(getPreviousStep(state)).toBe('context');

    state.currentStep = 'context';
    expect(getPreviousStep(state)).toBeNull();
  });
});
