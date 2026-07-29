// Types for the guided teacher workflow (CML-633I)
// This file defines the workflow steps and state model

// Import EntityReference from curriculum domain to maintain type consistency
import type { EntityReference } from '../../domain/curriculum/identity/types';

/**
 * Workflow steps for the guided teacher workflow
 * Represents the sequential steps a teacher goes through
 */
export type GuidedWorkflowStep =
  | 'context'
  | 'curriculum-selection'
  | 'selection-review'
  | 'teaching-design'
  | 'design-review'
  | 'document-preparation'
  | 'completion';

/**
 * Warning types for the guided workflow
 * Represents non-blocking issues that should be communicated to the teacher
 */
export type GuidedWorkflowWarning =
  | { type: 'institution-not-configured'; message: 'Istituto non configurato' }
  | { type: 'legacy-content'; message: 'Contenuto legacy utilizzato' }
  | { type: 'experimental-content'; message: 'Contenuto sperimentale utilizzato' }
  | { type: 'provisional-proposal'; message: 'Proposta ancora in revisione' }
  | { type: 'missing-sources'; message: 'Fonti mancanti o incomplete' }
  | { type: 'source-unavailable'; message: 'Sorgente non disponibile' }
  | { type: 'source-modified'; message: 'Sorgente modificata dalla selezione' }
  | { type: 'duplicate-selection'; message: 'Selezione duplicata' }
  | { type: 'legacy-designation'; message: 'Designazione legacy presente' };

/**
 * State model for the guided teacher workflow
 * Contains only references and advancement state - no domain data duplication
 */
export interface GuidedTeacherWorkflowState {
  /** Current step in the workflow */
  currentStep: GuidedWorkflowStep;

  /** Steps that have been completed (in order) */
  completedSteps: readonly GuidedWorkflowStep[];

  /** Selected curriculum references (can be multiple) */
  selectedCurriculumRefs: readonly EntityReference[];

  /** Selected revision references (can be multiple) */
  selectedRevisionRefs: readonly EntityReference[];

  /** Selected design reference (single active design) */
  selectedDesignRef?: EntityReference;

  /** Generated document reference (if any) */
  generatedDocumentRef?: EntityReference;

  /** Warnings accumulated during the workflow */
  warnings: readonly GuidedWorkflowWarning[];
}

/**
 * Initial state for the guided workflow
 */
export const INITIAL_GUIDED_WORKFLOW_STATE: GuidedTeacherWorkflowState = {
  currentStep: 'context',
  completedSteps: [],
  selectedCurriculumRefs: [],
  selectedRevisionRefs: [],
  selectedDesignRef: undefined,
  generatedDocumentRef: undefined,
  warnings: [],
};

/**
 * Type guard to check if a step has been completed
 */
export const isStepCompleted = (
  state: GuidedTeacherWorkflowState,
  step: GuidedWorkflowStep
): boolean => {
  return state.completedSteps.includes(step);
};

/**
 * Get the next step in the workflow
 */
export const getNextStep = (currentStep: GuidedWorkflowStep): GuidedWorkflowStep | null => {
  const stepOrder: GuidedWorkflowStep[] = [
    'context',
    'curriculum-selection',
    'selection-review',
    'teaching-design',
    'design-review',
    'document-preparation',
    'completion',
  ];

  const currentIndex = stepOrder.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
    return null; // No next step (at the end)
  }

  return stepOrder[currentIndex + 1];
};

/**
 * Get the previous step in the workflow
 */
export const getPreviousStep = (currentStep: GuidedWorkflowStep): GuidedWorkflowStep | null => {
  const stepOrder: GuidedWorkflowStep[] = [
    'context',
    'curriculum-selection',
    'selection-review',
    'teaching-design',
    'design-review',
    'document-preparation',
    'completion',
  ];

  const currentIndex = stepOrder.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === 0) {
    return null; // No previous step (at the beginning)
  }

  return stepOrder[currentIndex - 1];
};

/**
 * Check if a step is available (all previous steps completed)
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
    'completion',
  ];

  const currentIndex = stepOrder.indexOf(step);
  if (currentIndex === -1) return false;

  // All previous steps must be completed
  for (let i = 0; i < currentIndex; i++) {
    if (!state.completedSteps.includes(stepOrder[i])) {
      return false;
    }
  }

  return true;
};
