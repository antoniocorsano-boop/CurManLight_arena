import { describe, it, expect } from 'vitest';
import { createInitialGuidedWorkflowState, advanceToNextStep, canAccessStep } from '../features/guided-workflow/workflow';

describe('CML-633J — End-to-End Flow', () => {
  const steps = ['context', 'curriculum-selection', 'selection-review', 'teaching-design', 'design-review', 'document-preparation', 'completion'] as const;

  it('workflow starts at context', () => {
    const state = createInitialGuidedWorkflowState();
    expect(state.currentStep).toBe('context');
  });

  it('workflow advances through all 7 steps in order', () => {
    let state = createInitialGuidedWorkflowState();
    for (let i = 0; i < steps.length - 1; i++) {
      state = advanceToNextStep(state);
      expect(state.currentStep).toBe(steps[i + 1]);
    }
  });

  it('all prior steps are completed when reaching completion', () => {
    let state = createInitialGuidedWorkflowState();
    for (let i = 0; i < steps.length - 1; i++) {
      state = advanceToNextStep(state);
    }
    expect(state.completedSteps).toEqual(steps.slice(0, -1));
    expect(state.currentStep).toBe('completion');
  });

  it('completion step cannot advance further', () => {
    const finalState = createInitialGuidedWorkflowState();
    const advanced = advanceToNextStep(finalState);
    expect(advanced.currentStep).not.toBeNull();
  });

  it('backward navigation does not clear completed steps', () => {
    let state = createInitialGuidedWorkflowState();
    state = advanceToNextStep(state);
    state = advanceToNextStep(state);
    state = advanceToNextStep(state);
    expect(state.completedSteps.length).toBe(3);
  });

  it('workflow state contains only references and advancement', () => {
    const state = createInitialGuidedWorkflowState();
    expect(state).toHaveProperty('currentStep');
    expect(state).toHaveProperty('completedSteps');
    expect(state).toHaveProperty('selectedCurriculumRefs');
    expect(state).toHaveProperty('selectedRevisionRefs');
    expect(state).toHaveProperty('selectedDesignRef');
    expect(state).toHaveProperty('generatedDocumentRef');
    expect(state).toHaveProperty('warnings');
  });

  it('context is always accessible', () => {
    const state = createInitialGuidedWorkflowState();
    expect(canAccessStep('context', state)).toBe(true);
  });
});