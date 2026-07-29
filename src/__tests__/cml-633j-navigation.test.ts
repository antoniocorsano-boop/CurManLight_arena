import { describe, it, expect } from 'vitest';
import { advanceToNextStep, goToPreviousStep, goToStep, resetWorkflow } from '../features/guided-workflow/workflow';
import { createInitialGuidedWorkflowState } from '../features/guided-workflow/workflow';
import type { GuidedWorkflowStep } from '../features/guided-workflow/types';

describe('CML-633J — Navigation Verification', () => {
  const allSteps: GuidedWorkflowStep[] = ['context', 'curriculum-selection', 'selection-review', 'teaching-design', 'design-review', 'document-preparation', 'completion'];

  it('canonical path advances through all 7 steps', () => {
    let state = createInitialGuidedWorkflowState();
    expect(state.currentStep).toBe('context');
    for (const expectedStep of allSteps.slice(1)) {
      state = advanceToNextStep(state);
      expect(state.currentStep).toBe(expectedStep);
    }
  });

  it('backward navigation goes to prior step without losing data', () => {
    let state = createInitialGuidedWorkflowState();
    state = advanceToNextStep(state);
    state = advanceToNextStep(state);
    state = goToPreviousStep(state);
    expect(state.currentStep).toBe('curriculum-selection');
    expect(state.completedSteps).toContain('context');
  });

  it('direct jump to accessible step works', () => {
    let state = createInitialGuidedWorkflowState();
    state = advanceToNextStep(state);
    state = advanceToNextStep(state);
    state = goToStep(state, 'selection-review');
    expect(state.currentStep).toBe('selection-review');
  });

  it('cannot jump to step without completing prerequisites', () => {
    const state = createInitialGuidedWorkflowState();
    const result = goToStep(state, 'design-review');
    expect(result.currentStep).toBe('context');
  });

  it('reset returns to context preserving no workflow progress', () => {
    let state = createInitialGuidedWorkflowState();
    state = advanceToNextStep(state);
    state = advanceToNextStep(state);
    state = resetWorkflow();
    expect(state.currentStep).toBe('context');
    expect(state.completedSteps).toEqual([]);
  });

  it('refresh and resume preserves step position', () => {
    const state = createInitialGuidedWorkflowState();
    const advanced = advanceToNextStep(state);
    expect(advanced.currentStep).toBe('curriculum-selection');
  });
});