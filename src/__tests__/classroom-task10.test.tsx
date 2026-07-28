import { fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClasseTab, type ClasseTabProps, useClassroomSocialState } from '../features/classroom';
import {
  addInstitute,
  confirmInstitute,
  createEmptyInstitutionalArchive,
  createInstituteDraft,
  createInstitutionalContext,
  instituteReference,
  setActiveInstitute,
  setInstitutionalContext,
} from '../domain/institution';
import { useCurriculumStore } from '../store/useCurriculumStore';

const NOW = '2026-07-28T00:00:00.000Z';

function props(overrides: Partial<ClasseTabProps> = {}): ClasseTabProps {
  return {
    classeSubTab: 'registro', setClasseSubTab: vi.fn(), selectedClassCombination: '1A', setSelectedClassCombination: vi.fn(), assignedCombinations: ['1A'],
    classroomStudents: [], setClassroomStudents: vi.fn(), showAiSimulatedResponse: false, setShowAiSimulatedResponse: vi.fn(), isClassroomLoading: false, setIsClassroomLoading: vi.fn(),
    classroomStudentFeedback: [], setClassroomStudentFeedback: vi.fn(), selectedStudentForFeedback: null, setSelectedStudentForFeedback: vi.fn(), showClassroomReport: false, setShowClassroomReport: vi.fn(),
    activeClassTheme: 'scientists', setActiveClassTheme: vi.fn(), classroomLayout: 'frontale', setClassroomLayout: vi.fn(), isAulaConfigOpen: false, setIsAulaConfigOpen: vi.fn(),
    shuffledStudentMap: null, setShuffledStudentMap: vi.fn(), handleShufflePseudonyms: vi.fn(), exclusionsList: [], setExclusionsList: vi.fn(), exclusionInputS1: '', setExclusionInputS1: vi.fn(),
    exclusionInputS2: '', setExclusionInputS2: vi.fn(), activeCooperativeMethod: 'jigsaw', setActiveCooperativeMethod: vi.fn(), cooperativeGroups: null, setCooperativeGroups: vi.fn(),
    handleGenerateCooperativeGroups: vi.fn(), getThemedStudentName: vi.fn(() => 'Studente'), classroomTopicInput: '', setClassroomTopicInput: vi.fn(), isAnalyzingTopic: false,
    classroomTopicAnalysisResult: null, handleAnalyzeClassroomTopic: vi.fn(), handleApproveAndInjectUda: vi.fn(), weeklyHoursItaliano: 1, setWeeklyHoursItaliano: vi.fn(),
    weeklyHoursStoria: 1, setWeeklyHoursStoria: vi.fn(), weeklyHoursGeografia: 1, setWeeklyHoursGeografia: vi.fn(), weeklyHoursMatematica: 1, setWeeklyHoursMatematica: vi.fn(),
    weeklyHoursScienze: 1, setWeeklyHoursScienze: vi.fn(), bufferCoefficient: 1, setBufferCoefficient: vi.fn(), savedUda: [], discipline: 'scienze', showToast: vi.fn(),
    confirmAnticipatedField: vi.fn(), handleTriggerGemSuggestion: vi.fn(), activeTaughtUdaId: '', order: 'primaria',
    ...overrides,
  };
}

function archiveWithDeclaredRole() {
  const institute = createInstituteDraft({ name: 'Istituto Configurato', schoolOrders: ['primaria'] }, NOW);
  let archive = addInstitute(createEmptyInstitutionalArchive(NOW), institute, NOW).archive!;
  archive = confirmInstitute(archive, institute.id, NOW).archive!;
  archive = setActiveInstitute(archive, institute.id, NOW).archive!;
  const context = createInstitutionalContext({
    instituteRef: instituteReference(institute),
    declaredActor: { displayName: 'Persona locale', role: 'docente', assertion: 'self-declared' },
  }, NOW);
  return setInstitutionalContext(archive, context, NOW).archive!;
}

describe('CML-633D Task 10 classroom honesty', () => {
  beforeEach(() => {
    localStorage.clear();
    useCurriculumStore.setState({ institutionalArchive: createEmptyInstitutionalArchive(NOW) });
  });

  it('starts both active classroom collections empty without loading fictional feedback', () => {
    const { result } = renderHook(() => useClassroomSocialState());
    expect(result.current.classroomStudents).toEqual([]);
    expect(result.current.classroomStudentFeedback).toEqual([]);
    expect(result.current.selectedClassCombination).toBe('');
    expect(localStorage.getItem('curman_classroomStudentFeedback')).toBe('[]');
  });

  it('starts outcome-entry controls neutral and does not write metrics when there are no students', async () => {
    const { result } = renderHook(() => useClassroomSocialState());
    expect(result.current.selfEvaluationStars).toBe(0);
    expect(result.current.outcomesAvanzato).toBe(0);
    expect(result.current.outcomesIntermedio).toBe(0);
    expect(result.current.outcomesBase).toBe(0);
    expect(result.current.outcomesIniziale).toBe(0);
    await waitFor(() => {
      expect(result.current.socialUdas[0]).not.toHaveProperty('selfEvaluation');
      expect(result.current.socialUdas[0]).not.toHaveProperty('studentOutcomes');
    });
  });

  it('labels headings and reports neutrally when no class is selected', () => {
    render(<ClasseTab {...props({ selectedClassCombination: '', assignedCombinations: [], showClassroomReport: true })} />);
    expect(screen.getAllByText(/Classe non selezionata/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText(/1\^A/)).not.toBeInTheDocument();
  });

  it('does not mutate students or report success for unavailable classroom imports', () => {
    const setClassroomStudents = vi.fn();
    const showToast = vi.fn();
    render(<ClasseTab {...props({ setClassroomStudents, showToast })} />);

    fireEvent.click(screen.getByRole('button', { name: /Google Classroom non disponibile/i }));
    fireEvent.click(screen.getByRole('button', { name: /CSV non disponibile/i }));

    expect(setClassroomStudents).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledTimes(2);
    expect(showToast).toHaveBeenNthCalledWith(1, expect.stringMatching(/demo locale|non disponibile/i), false);
    expect(showToast).toHaveBeenNthCalledWith(2, expect.stringMatching(/demo locale|non disponibile/i), false);
    expect(screen.getByText(/nessun dato studente viene creato o importato/i)).toBeInTheDocument();
  });

  it('runs the adaptation preview as a local rule-based demonstration without student mutation', () => {
    const setClassroomStudents = vi.fn();
    const setShowAiSimulatedResponse = vi.fn();
    const showToast = vi.fn();
    render(<ClasseTab {...props({
      classroomStudents: [{ id: 'local-1', name: 'Pseudonimo', token: 'token-1', diagnosis: '', maskedDiagnosis: '', osiLevel: 'Base' }],
      setClassroomStudents,
      setShowAiSimulatedResponse,
      showToast,
    })} />);

    fireEvent.click(screen.getByRole('button', { name: /anteprima locale basata su regole/i }));

    expect(setClassroomStudents).not.toHaveBeenCalled();
    expect(setShowAiSimulatedResponse).toHaveBeenCalledWith(true);
    expect(showToast).toHaveBeenCalledWith(expect.stringMatching(/dimostrazione locale|regole locali/i), false);
  });

  it('uses a neutral compiler role when no actor is declared', () => {
    render(<ClasseTab {...props({ showClassroomReport: true })} />);
    expect(screen.getByText('Responsabile della compilazione')).toBeInTheDocument();
    expect(screen.queryByText(/coordinatore/i)).not.toBeInTheDocument();
  });

  it('labels the canonical session role as declared when present', () => {
    useCurriculumStore.setState({ institutionalArchive: archiveWithDeclaredRole() });
    render(<ClasseTab {...props({ showClassroomReport: true })} />);
    expect(screen.getByText('Ruolo dichiarato: docente')).toBeInTheDocument();
    expect(screen.queryByText('Responsabile della compilazione')).not.toBeInTheDocument();
  });
});
