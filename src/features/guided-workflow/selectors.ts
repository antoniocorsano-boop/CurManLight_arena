// Selectors for the guided teacher workflow (CML-633I)
// These functions extract specific pieces of state or derived data from the workflow state

import type { GuidedTeacherWorkflowState, GuidedWorkflowStep, GuidedWorkflowWarning } from './types';
import type { EntityReference } from '../../domain/curriculum/identity/types';

/**
 * Get the current step in the workflow
 */
export const getCurrentStep = (state: GuidedTeacherWorkflowState): GuidedWorkflowStep => {
  return state.currentStep;
};

/**
 * Check if a specific step has been completed
 */
export const isStepCompleted = (
  state: GuidedTeacherWorkflowState,
  step: GuidedWorkflowStep
): boolean => {
  return state.completedSteps.includes(step);
};

/**
 * Get the list of completed steps
 */
export const getCompletedSteps = (state: GuidedTeacherWorkflowState): GuidedWorkflowStep[] => {
  return [...state.completedSteps];
};

/**
 * Get the selected curriculum references
 */
export const getSelectedCurriculumReferences = (
  state: GuidedTeacherWorkflowState
): readonly EntityReference[] => {
  return state.selectedCurriculumRefs;
};

/**
 * Get the selected revision references
 */
export const getSelectedRevisionReferences = (
  state: GuidedTeacherWorkflowState
): readonly EntityReference[] => {
  return state.selectedRevisionRefs;
};

/**
 * Get the selected design reference
 */
export const getSelectedDesignReference = (
  state: GuidedTeacherWorkflowState
): EntityReference | undefined => {
  return state.selectedDesignRef;
};

/**
 * Get the generated document reference
 */
export const getGeneratedDocumentReference = (
  state: GuidedTeacherWorkflowState
): EntityReference | undefined => {
  return state.generatedDocumentRef;
};

/**
 * Get the warnings in the workflow
 */
export const getWarnings = (
  state: GuidedTeacherWorkflowState
): readonly GuidedWorkflowWarning[] => {
  return state.warnings;
};

/**
 * Check if the workflow is at the beginning (context step, no steps completed)
 */
export const isWorkflowAtStart = (
  state: GuidedTeacherWorkflowState
): boolean => {
  return state.currentStep === 'context' && state.completedSteps.length === 0;
};

/**
 * Check if the workflow is complete (at completion step)
 */
export const isWorkflowComplete = (
  state: GuidedTeacherWorkflowState
): boolean => {
  return state.currentStep === 'completion';
};

/**
 * Get the progress percentage (0-100)
 */
export const getProgressPercentage = (
  state: GuidedTeacherWorkflowState
): number => {
  const stepOrder: GuidedWorkflowStep[] = [
    'context',
    'curriculum-selection',
    'selection-review',
    'teaching-design',
    'design-review',
    'document-preparation',
    'completion'
  ];

  const currentIndex = stepOrder.indexOf(state.currentStep);
  if (currentIndex === -1) return 0;

  // Calculate progress based on current step position
  return Math.round((currentIndex / (stepOrder.length - 1)) * 100);
};

/**
 * Get the next step in the workflow (if available)
 */
export const getNextStep = (
  state: GuidedTeacherWorkflowState
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

  const currentIndex = stepOrder.indexOf(state.currentStep);
  if (currentIndex === -1 || currentIndex >= stepOrder.length - 1) {
    return null; // No next step
  }

  return stepOrder[currentIndex + 1];
};

/**
 * Get the previous step in the workflow (if available)
 */
export const getPreviousStep = (
  state: GuidedTeacherWorkflowState
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

  const currentIndex = stepOrder.indexOf(state.currentStep);
  if (currentIndex === -1 || currentIndex === 0) {
    return null; // No previous step
  }

  return stepOrder[currentIndex - 1];
};

/**
 * Check if a specific step is available (all prerequisites completed)
 */
export const isStepAvailable = (
  state: GuidedTeacherWorkflowState,
  step: GuidedWorkflowStep
): boolean => {
  const stepOrder: GuidedWorkflowStep[] = [
    'context',
    'curriculum-selection',
    'selection-review',
    'teaching-design',
    'design-review',
    'document-preparation',
    'completion'
  ];

  const targetIndex = stepOrder.indexOf(step);
  if (targetIndex === -1) return false;

  // All steps before the target must be completed
  for (let i = 0; i < targetIndex; i++) {
    if (!state.completedSteps.includes(stepOrder[i])) {
      return false;
    }
  }

  return true;
};

/**
 * Check if the workflow has any curriculum selections
 */
export const hasCurriculumSelections = (
  state: GuidedTeacherWorkflowState
): boolean => {
  return state.selectedCurriculumRefs.length > 0;
};

/**
 * Check if the workflow has any revision selections
 */
export const hasRevisionSelections = (
  state: GuidedTeacherWorkflowState
): boolean => {
  return state.selectedRevisionRefs.length > 0;
};

/**
 * Check if the workflow has a design selected
 */
export const hasDesignSelected = (
  state: GuidedTeacherWorkflowState
): boolean => {
  return !!state.selectedDesignRef;
};

/**
 * Check if the workflow has a generated document
 */
export const hasGeneratedDocument = (
  state: GuidedTeacherWorkflowState
): boolean => {
  return !!state.generatedDocumentRef;
};

/**
 * Get a warning by its ID (if it has one)
 */
export const getWarningById = (
  state: GuidedTeacherWorkflowState,
  warningId: string
): GuidedWorkflowWarning | undefined => {
  return state.warnings.find(w =>
    // Assuming warnings have an id property, or we use the type as identifier
    (w as any).id === warningId ||
    w.type === warningId
  );
};

/**
 * Check if there are any warnings of a specific type
 */
export const hasWarningType = (
  state: GuidedTeacherWorkflowState,
  warningType: GuidedWorkflowWarning['type']
): boolean => {
  return state.warnings.some(w => w.type === warningType);
};

/**
 * Get warnings of a specific type
 */
export const getWarningsByType = (
  state: GuidedTeacherWorkflowState,
  warningType: GuidedWorkflowWarning['type']
): GuidedWorkflowWarning[] => {
  return state.warnings.filter(w => w.type === warningType);
};
