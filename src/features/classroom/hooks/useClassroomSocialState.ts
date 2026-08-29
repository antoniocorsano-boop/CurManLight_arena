import { useState } from 'react';
import { createDefaultSocialUdas } from '../../social';
import type { ClassTheme, ClassroomLayout, ClassroomStudent, ClassroomTopicAnalysisResult, CooperativeGroup, CooperativeMethod, SocialUda } from '../../session';

export type ClassroomFeedback = {
 id: string;
 name: string;
 level: 'avanzato' | 'intermedio' | 'base' | 'iniziale';
 stars: number;
 obs: string;
};

/**
 * Legacy Classroom/Social compatibility state.
 *
 * ARENA-S2A deliberately keeps this hook memory-only while the remaining
 * prop surface is detached from the canonical Arena runtime. Pupil/classroom
 * operational data MUST NOT be read from or written to persistent browser
 * storage by Arena. The canonical teacher-owned destination is Docente OS;
 * no silent migration is performed here.
 */
export function useClassroomSocialState() {
 const [socialUdas, setSocialUdas] = useState<SocialUda[]>(() => createDefaultSocialUdas() as SocialUda[]);
 const updateSocialUdas = (newList: SocialUda[]) => setSocialUdas(newList);

 const [newAnnotationInputs, setNewAnnotationInputs] = useState<Record<string, string>>({});
 const [classroomStudents, setClassroomStudents] = useState<ClassroomStudent[]>([]);
 const [showAiSimulatedResponse, setShowAiSimulatedResponse] = useState(false);
 const [isClassroomLoading, setIsClassroomLoading] = useState(false);

 const [weeklyHoursItaliano, setWeeklyHoursItaliano] = useState(6);
 const [weeklyHoursStoria, setWeeklyHoursStoria] = useState(2);
 const [weeklyHoursGeografia, setWeeklyHoursGeografia] = useState(2);
 const [weeklyHoursMatematica, setWeeklyHoursMatematica] = useState(5);
 const [weeklyHoursScienze, setWeeklyHoursScienze] = useState(2);
 const [bufferCoefficient, setBufferCoefficient] = useState(1.2);

 const [shuffledStudentMap, setShuffledStudentMap] = useState<Record<string, string> | null>(null);
 const [exclusionsList, setExclusionsList] = useState<Array<{s1: string, s2: string}>>([]);
 const [exclusionInputS1, setExclusionInputS1] = useState('st1');
 const [exclusionInputS2, setExclusionInputS2] = useState('st2');
 const [isAulaConfigOpen, setIsAulaConfigOpen] = useState(true);

 const [selectedClassCombination, setSelectedClassCombination] = useState('');
 const [activeClassTheme, setActiveClassTheme] = useState<ClassTheme>('scientists');
 const [classroomLayout, setClassroomLayout] = useState<ClassroomLayout>('frontale');
 const [activeCooperativeMethod, setActiveCooperativeMethod] = useState<CooperativeMethod>('jigsaw');
 const [cooperativeGroups, setCooperativeGroups] = useState<CooperativeGroup | null>(null);
 const [classroomStudentFeedback, setClassroomStudentFeedback] = useState<ClassroomFeedback[]>([]);
 const [selectedStudentForFeedback, setSelectedStudentForFeedback] = useState<ClassroomFeedback | null>(null);

 const [classroomTopicInput, setClassroomTopicInput] = useState('');
 const [isAnalyzingTopic, setIsAnalyzingTopic] = useState(false);
 const [classroomTopicAnalysisResult, setClassroomTopicAnalysisResult] = useState<ClassroomTopicAnalysisResult | null>(null);
 const [showClassroomReport, setShowClassroomReport] = useState(false);
 const [activeTaughtUdaId, setActiveTaughtUdaId] = useState('');

 const [showOutcomesModal, setShowOutcomesModal] = useState(false);
 const [selectedUdaForOutcomes, setSelectedUdaForOutcomes] = useState<SocialUda | null>(null);
 const [selfEvaluationStars, setSelfEvaluationStars] = useState(0);
 const [outcomesAvanzato, setOutcomesAvanzato] = useState(0);
 const [outcomesIntermedio, setOutcomesIntermedio] = useState(0);
 const [outcomesBase, setOutcomesBase] = useState(0);
 const [outcomesIniziale, setOutcomesIniziale] = useState(0);
 const [criticalReflectionsInput, setCriticalReflectionsInput] = useState('');

 return {
  socialUdas,
  setSocialUdas,
  updateSocialUdas,
  newAnnotationInputs,
  setNewAnnotationInputs,
  classroomStudents,
  setClassroomStudents,
  showAiSimulatedResponse,
  setShowAiSimulatedResponse,
  isClassroomLoading,
  setIsClassroomLoading,
  weeklyHoursItaliano,
  setWeeklyHoursItaliano,
  weeklyHoursStoria,
  setWeeklyHoursStoria,
  weeklyHoursGeografia,
  setWeeklyHoursGeografia,
  weeklyHoursMatematica,
  setWeeklyHoursMatematica,
  weeklyHoursScienze,
  setWeeklyHoursScienze,
  bufferCoefficient,
  setBufferCoefficient,
  shuffledStudentMap,
  setShuffledStudentMap,
  exclusionsList,
  setExclusionsList,
  exclusionInputS1,
  setExclusionInputS1,
  exclusionInputS2,
  setExclusionInputS2,
  isAulaConfigOpen,
  setIsAulaConfigOpen,
  selectedClassCombination,
  setSelectedClassCombination,
  activeClassTheme,
  setActiveClassTheme,
  classroomLayout,
  setClassroomLayout,
  activeCooperativeMethod,
  setActiveCooperativeMethod,
  cooperativeGroups,
  setCooperativeGroups,
  classroomStudentFeedback,
  setClassroomStudentFeedback,
  selectedStudentForFeedback,
  setSelectedStudentForFeedback,
  classroomTopicInput,
  setClassroomTopicInput,
  isAnalyzingTopic,
  setIsAnalyzingTopic,
  classroomTopicAnalysisResult,
  setClassroomTopicAnalysisResult,
  showClassroomReport,
  setShowClassroomReport,
  activeTaughtUdaId,
  setActiveTaughtUdaId,
  showOutcomesModal,
  setShowOutcomesModal,
  selectedUdaForOutcomes,
  setSelectedUdaForOutcomes,
  selfEvaluationStars,
  setSelfEvaluationStars,
  outcomesAvanzato,
  setOutcomesAvanzato,
  outcomesIntermedio,
  setOutcomesIntermedio,
  outcomesBase,
  setOutcomesBase,
  outcomesIniziale,
  setOutcomesIniziale,
  criticalReflectionsInput,
  setCriticalReflectionsInput
 };
}
