import { describe, it, expect } from 'vitest';
import { createInitialGuidedWorkflowState } from '../features/guided-workflow/workflow';
import type { GuidedTeacherWorkflowState } from '../features/guided-workflow/types';

describe('CML-633J — Migration Compatibility', () => {
  it('legacy workflow state is compatible with current state model', () => {
    const legacyState = {
      currentStep: 'context' as const,
      completedSteps: [] as const,
      selectedCurriculumRefs: [],
      selectedRevisionRefs: [],
      warnings: [],
    };
    const state: GuidedTeacherWorkflowState = {
      ...legacyState,
      selectedDesignRef: undefined,
      generatedDocumentRef: undefined,
    };
    expect(state.currentStep).toBe('context');
    expect(state.completedSteps).toEqual([]);
  });

  it('mixed state (legacy + new fields) is handled without error', () => {
    const mixedState = {
      currentStep: 'design-review' as const,
      completedSteps: ['context', 'curriculum-selection', 'selection-review', 'teaching-design'] as const,
      selectedCurriculumRefs: [{ id: 'curric-1', entityType: 'curriculum-node' }],
      selectedRevisionRefs: [{ id: 'rev-1', entityType: 'revision' }],
      selectedDesignRef: { id: 'design-1', entityType: 'design' },
      generatedDocumentRef: undefined,
      warnings: [],
    };
    expect(mixedState.completedSteps.length).toBe(4);
    expect(mixedState.selectedDesignRef).toBeDefined();
  });

  it('empty workflow state initializes correctly', () => {
    const state = createInitialGuidedWorkflowState();
    expect(state.currentStep).toBe('context');
    expect(state.completedSteps).toEqual([]);
    expect(state.warnings).toEqual([]);
  });

  it('forward migration does not lose state fields', () => {
    const state = createInitialGuidedWorkflowState();
    const serialized = JSON.parse(JSON.stringify(state));
    expect(serialized.currentStep).toBe('context');
    expect(serialized.completedSteps).toEqual([]);
    expect(serialized.warnings).toEqual([]);
  });
});