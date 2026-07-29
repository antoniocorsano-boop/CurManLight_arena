import { useCurriculumStore } from '../../../store/useCurriculumStore';
import type {
  GuidedTeacherWorkflowState,
  GuidedWorkflowStep,
  GuidedWorkflowWarning
} from '../types';
import type {
  EntityReference
} from '../../../domain/curriculum/identity/types';

export const useGuidedWorkflow = () => {
  const {
    guidedWorkflowState,
    setGuidedWorkflowState,
  } = useCurriculumStore((_state: any) => ({
    guidedWorkflowState: _state.guidedWorkflowState,
    setGuidedWorkflowState: _state.setGuidedWorkflowState,
  }));

  const initializeState = () => {
    if (!guidedWorkflowState) {
      const initialState: GuidedTeacherWorkflowState = {
        currentStep: 'context',
        completedSteps: [],
        selectedDesignRef: undefined,
        selectedCurriculumRefs: [],
        selectedRevisionRefs: [],
        generatedDocumentRef: undefined,
        warnings: []
      };
      setGuidedWorkflowState(initialState);
      return initialState;
    }
    return guidedWorkflowState;
  };

  const state = guidedWorkflowState || initializeState();

  const advanceToNextStep = () => {
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
      return state;
    }

    const nextStep = stepOrder[currentIndex + 1];
    const updatedCompletedSteps = state.completedSteps.includes(state.currentStep)
      ? state.completedSteps
      : [...state.completedSteps, state.currentStep];

    const newState: GuidedTeacherWorkflowState = {
      ...state,
      currentStep: nextStep,
      completedSteps: updatedCompletedSteps
    };

    setGuidedWorkflowState(newState);
    return newState;
  };

  const goToPreviousStep = () => {
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
      return state;
    }

    const previousStep = stepOrder[currentIndex - 1];
    const newState: GuidedTeacherWorkflowState = {
      ...state,
      currentStep: previousStep
    };

    setGuidedWorkflowState(newState);
    return newState;
  };

  const goToStep = (step: GuidedWorkflowStep) => {
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
    if (targetIndex === -1) return state;

    for (let i = 0; i < targetIndex; i++) {
      if (!state.completedSteps.includes(stepOrder[i])) {
        return state;
      }
    }

    const newState: GuidedTeacherWorkflowState = {
      ...state,
      currentStep: step
    };

    setGuidedWorkflowState(newState);
    return newState;
  };

  const resetWorkflow = () => {
    const initialState: GuidedTeacherWorkflowState = {
      currentStep: 'context',
      completedSteps: [],
      selectedDesignRef: undefined,
      selectedCurriculumRefs: [],
      selectedRevisionRefs: [],
      generatedDocumentRef: undefined,
      warnings: []
    };

    setGuidedWorkflowState(initialState);
    return initialState;
  };

  const setSelectedDesign = (designRef: EntityReference | undefined) => {
    const newState: GuidedTeacherWorkflowState = {
      ...state,
      selectedDesignRef: designRef
    };

    setGuidedWorkflowState(newState);
    return newState;
  };

  const addCurriculumReference = (curriculumRef: EntityReference) => {
    if (state.selectedCurriculumRefs.some((ref: any) => ref.id === curriculumRef.id)) {
      return state;
    }

    const newState: GuidedTeacherWorkflowState = {
      ...state,
      selectedCurriculumRefs: [...state.selectedCurriculumRefs, curriculumRef]
    };

    setGuidedWorkflowState(newState);
    return newState;
  };

  const removeCurriculumReference = (curriculumRefId: string) => {
    const newState: GuidedTeacherWorkflowState = {
      ...state,
      selectedCurriculumRefs: state.selectedCurriculumRefs.filter((ref: any) => ref.id !== curriculumRefId)
    };

    setGuidedWorkflowState(newState);
    return newState;
  };

  const setCurriculumReferences = (curriculumRefs: EntityReference[]) => {
    const newState: GuidedTeacherWorkflowState = {
      ...state,
      selectedCurriculumRefs: curriculumRefs
    };

    setGuidedWorkflowState(newState);
    return newState;
  };

  const addEntityReference = (revisionRef: EntityReference) => {
    if (state.selectedRevisionRefs.some((ref: any) => ref.id === revisionRef.id)) {
      return state;
    }

    const newState: GuidedTeacherWorkflowState = {
      ...state,
      selectedRevisionRefs: [...state.selectedRevisionRefs, revisionRef]
    };

    setGuidedWorkflowState(newState);
    return newState;
  };

  const removeEntityReference = (revisionRefId: string) => {
    const newState: GuidedTeacherWorkflowState = {
      ...state,
      selectedRevisionRefs: state.selectedRevisionRefs.filter((ref: any) => ref.id !== revisionRefId)
    };

    setGuidedWorkflowState(newState);
    return newState;
  };

  const setEntityReferences = (revisionRefs: EntityReference[]) => {
    const newState: GuidedTeacherWorkflowState = {
      ...state,
      selectedRevisionRefs: revisionRefs
    };

    setGuidedWorkflowState(newState);
    return newState;
  };

  const setGeneratedDocument = (documentRef: EntityReference | undefined) => {
    const newState: GuidedTeacherWorkflowState = {
      ...state,
      generatedDocumentRef: documentRef
    };

    setGuidedWorkflowState(newState);
    return newState;
  };

  const addWarning = (warning: Omit<GuidedWorkflowWarning, 'id'> & { id?: string }) => {
    const warningWithId = {
      ...warning,
      id: warning.id || `${warning.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    if (state.warnings.some((w: any) => (w as any).id === warningWithId.id)) {
      return state;
    }

    const newState: GuidedTeacherWorkflowState = {
      ...state,
      warnings: [...state.warnings, warningWithId as any]
    };

    setGuidedWorkflowState(newState);
    return newState;
  };

  const removeWarning = (warningId: string) => {
    const newState: GuidedTeacherWorkflowState = {
      ...state,
      warnings: state.warnings.filter((w: any) => (w as any).id !== warningId)
    };

    setGuidedWorkflowState(newState);
    return newState;
  };

  return {
    state,
    advanceToNextStep,
    goToPreviousStep,
    goToStep,
    resetWorkflow,
    setSelectedDesign,
    addCurriculumReference,
    removeCurriculumReference,
    setCurriculumReferences,
    addEntityReference,
    removeEntityReference,
    setEntityReferences,
    setGeneratedDocument,
    addWarning,
    removeWarning
  };
};
