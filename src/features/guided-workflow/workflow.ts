// Workflow utilities for guided teacher workflow (CML-633I)
// Simple implementation to avoid JSX/TS errors in this environment

import {
  GuidedWorkflowStep,
  GuidedTeacherWorkflowState,
  GuidedWorkflowWarning
} from './types';
import type { EntityReference } from '../../domain/curriculum/identity/types';

/**
 * Initial state for the guided teacher workflow
 */
export const createInitialGuidedWorkflowState = (): GuidedTeacherWorkflowState => ({
  currentStep: 'context',
  completedSteps: [],
  selectedDesignRef: undefined,
  selectedCurriculumRefs: [],
  selectedRevisionRefs: [],
  generatedDocumentRef: undefined,
  warnings: []
});

/**
 * Validates if a step can be accessed based on completed steps
 */
export const canAccessStep = (
  step: GuidedWorkflowStep,
  state: GuidedTeacherWorkflowState
): boolean => {
  // Context step is always accessible
  if (step === 'context') return true;

  // Curriculum selection requires context to be completed
  if (step === 'curriculum-selection') {
    return state.completedSteps.includes('context');
  }

  // Selection review requires curriculum selection to be completed
  if (step === 'selection-review') {
    return state.completedSteps.includes('curriculum-selection');
  }

  // Teaching design requires selection review to be completed
  if (step === 'teaching-design') {
    return state.completedSteps.includes('selection-review');
  }

  // Design review requires teaching design to be completed
  if (step === 'design-review') {
    return state.completedSteps.includes('teaching-design');
  }

  // Document preparation requires design review to be completed
  if (step === 'document-preparation') {
    return state.completedSteps.includes('design-review');
  }

  // Completion requires document preparation to be completed
  if (step === 'completion') {
    return state.completedSteps.includes('document-preparation');
  }

  return false;
};

/**
 * Gets the next step in the workflow
 */
export const getNextStep = (
  currentStep: GuidedWorkflowStep
): GuidedWorkflowStep | null => {
  const stepOrder: GuidedWorkflowStep[] = [
    'context',
    'curriculum-selection',
    'selection-review',
    'teaching-design',
    'design-review',
    'document-preparation',
    'completion'
  ];

  const currentIndex = stepOrder.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex >= stepOrder.length - 1) {
    return null; // No next step
  }

  return stepOrder[currentIndex + 1];
};

/**
 * Gets the previous step in the workflow
 */
export const getPreviousStep = (
  currentStep: GuidedWorkflowStep
): GuidedWorkflowStep | null => {
  const stepOrder: GuidedWorkflowStep[] = [
    'context',
    'curriculum-selection',
    'selection-review',
    'teaching-design',
    'design-review',
    'document-preparation',
    'completion'
  ];

  const currentIndex = stepOrder.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === 0) {
    return null; // No previous step
  }

  return stepOrder[currentIndex - 1];
};

/**
 * Advances to the next step in the workflow
 */
export const advanceToNextStep = (
  state: GuidedTeacherWorkflowState
): GuidedTeacherWorkflowState => {
  const nextStep = getNextStep(state.currentStep);
  if (!nextStep) {
    // Already at the end, return current state
    return state;
  }

  // Add current step to completed steps if not already there
  const updatedCompletedSteps = state.completedSteps.includes(state.currentStep)
    ? state.completedSteps
    : [...state.completedSteps, state.currentStep];

  return {
    ...state,
    currentStep: nextStep,
    completedSteps: updatedCompletedSteps
  };
};

/**
 * Goes back to the previous step in the workflow
 */
export const goToPreviousStep = (
  state: GuidedTeacherWorkflowState
): GuidedTeacherWorkflowState => {
  const previousStep = getPreviousStep(state.currentStep);
  if (!previousStep) {
    // Already at the beginning, return current state
    return state;
  }

  return {
    ...state,
    currentStep: previousStep
  };
};

/**
 * Goes directly to a specific step (if accessible)
 */
export const goToStep = (
  state: GuidedTeacherWorkflowState,
  step: GuidedWorkflowStep
): GuidedTeacherWorkflowState => {
  if (!canAccessStep(step, state)) {
    // Cannot access this step yet, return current state
    return state;
  }

  return {
    ...state,
    currentStep: step
  };
};

/**
 * Resets the workflow to the initial state
 * Note: This does not clear domain artifacts (designs, documents, etc.)
 */
export const resetWorkflow = (): GuidedTeacherWorkflowState => {
  return createInitialGuidedWorkflowState();
};

/**
 * Adds a warning to the workflow state
 */
export const addWarning = (
  state: GuidedTeacherWorkflowState,
  warning: Omit<GuidedWorkflowWarning, 'id'> & { id?: string }
): GuidedTeacherWorkflowState => {
  // Avoid duplicate warnings
  if (state.warnings.some(w => (w as any).id === warning.id)) {
    return state;
  }

  // Create a unique ID if not provided
  const warningWithId = {
    ...warning,
    id: warning.id || `${warning.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };

  return {
    ...state,
    warnings: [...state.warnings, warningWithId as any]
  };
};

/**
 * Removes a warning from the workflow state
 */
export const removeWarning = (
  state: GuidedTeacherWorkflowState,
  warningId: string
): GuidedTeacherWorkflowState => {
  return {
    ...state,
    warnings: state.warnings.filter(w => (w as any).id !== warningId)
  };
};

/**
 * Sets the selected design reference
 */
export const setSelectedDesign = (
  state: GuidedTeacherWorkflowState,
  designRef: EntityReference | undefined
): GuidedTeacherWorkflowState => {
  return {
    ...state,
    selectedDesignRef: designRef
  };
};

/**
 * Adds a curriculum reference to the selection
 */
export const addCurriculumReference = (
  state: GuidedTeacherWorkflowState,
  curriculumRef: EntityReference
): GuidedTeacherWorkflowState => {
  // Avoid duplicates
  if (state.selectedCurriculumRefs.some(ref => ref.id === curriculumRef.id)) {
    return state;
  }

  return {
    ...state,
    selectedCurriculumRefs: [...state.selectedCurriculumRefs, curriculumRef]
  };
};

/**
 * Removes a curriculum reference from the selection
 */
export const removeCurriculumReference = (
  state: GuidedTeacherWorkflowState,
  curriculumRefId: string
): GuidedTeacherWorkflowState => {
  return {
    ...state,
    selectedCurriculumRefs: state.selectedCurriculumRefs.filter(ref => ref.id !== curriculumRefId)
  };
};

/**
 * Sets the selected curriculum references (replaces all)
 */
export const setCurriculumReferences = (
  state: GuidedTeacherWorkflowState,
  curriculumRefs: EntityReference[]
): GuidedTeacherWorkflowState => {
  return {
    ...state,
    selectedCurriculumRefs: curriculumRefs
  };
};

/**
 * Adds a revision reference to the selection
 */
export const addRevisionReference = (
  state: GuidedTeacherWorkflowState,
  revisionRef: EntityReference
): GuidedTeacherWorkflowState => {
  // Avoid duplicates
  if (state.selectedRevisionRefs.some(ref => ref.id === revisionRef.id)) {
    return state;
  }

  return {
    ...state,
    selectedRevisionRefs: [...state.selectedRevisionRefs, revisionRef]
  };
};

/**
 * Removes a revision reference from the selection
 */
export const removeRevisionReference = (
  state: GuidedTeacherWorkflowState,
  revisionRefId: string
): GuidedTeacherWorkflowState => {
  return {
    ...state,
    selectedRevisionRefs: state.selectedRevisionRefs.filter(ref => ref.id !== revisionRefId)
  };
};

/**
 * Sets the selected revision references (replaces all)
 */
export const setRevisionReferences = (
  state: GuidedTeacherWorkflowState,
  revisionRefs: EntityReference[]
): GuidedTeacherWorkflowState => {
  return {
    ...state,
    selectedRevisionRefs: revisionRefs
  };
};

/**
 * Sets the generated document reference
 */
export const setGeneratedDocument = (
  state: GuidedTeacherWorkflowState,
  documentRef: EntityReference | undefined
): GuidedTeacherWorkflowState => {
  return {
    ...state,
    generatedDocumentRef: documentRef
  };
};
