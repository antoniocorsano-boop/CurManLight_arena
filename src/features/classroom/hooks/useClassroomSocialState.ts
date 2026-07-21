import { useEffect, useState } from 'react';
import { createDefaultClassroomStudentFeedback } from '../data/defaultClassroomStudents';
import { createDefaultSocialUdas } from '../../social';
import type { ClassTheme, ClassroomLayout, ClassroomStudent, ClassroomTopicAnalysisResult, CooperativeGroup, CooperativeMethod, SocialUda } from '../../session';

export type ClassroomFeedback = {
 id: string;
 name: string;
 level: 'avanzato' | 'intermedio' | 'base' | 'iniziale';
 stars: number;
 obs: string;
};

export function useClassroomSocialState() {
 const [socialUdas, setSocialUdas] = useState<SocialUda[]>(() => {
  const saved = localStorage.getItem('curmanlight-social-udas-v1');
  if (saved) {
   try {
    return JSON.parse(saved);
   } catch {}
  }
  return createDefaultSocialUdas() as SocialUda[];
 });

 const updateSocialUdas = (newList: SocialUda[]) => {
  setSocialUdas(newList);
  localStorage.setItem('curmanlight-social-udas-v1', JSON.stringify(newList));
 };

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

 const [shuffledStudentMap, setShuffledStudentMap] = useState<Record<string, string> | null>(() => {
  const saved = localStorage.getItem('curman_shuffledStudentMap');
  return saved ? JSON.parse(saved) as Record<string, string> : null;
 });
 const [exclusionsList, setExclusionsList] = useState<Array<{s1: string, s2: string}>>(() => {
  const saved = localStorage.getItem('curman_exclusionsList');
  return saved ? JSON.parse(saved) : [];
 });
 const [exclusionInputS1, setExclusionInputS1] = useState('st1');
 const [exclusionInputS2, setExclusionInputS2] = useState('st2');
 const [isAulaConfigOpen, setIsAulaConfigOpen] = useState(true);

 const [selectedClassCombination, setSelectedClassCombination] = useState('1^A');
 const [activeClassTheme, setActiveClassTheme] = useState<ClassTheme>(() => {
  return (localStorage.getItem('curman_activeClassTheme') as ClassTheme | null) || 'scientists';
 });
 const [classroomLayout, setClassroomLayout] = useState<ClassroomLayout>(() => {
  return (localStorage.getItem('curman_classroomLayout') as ClassroomLayout | null) || 'frontale';
 });
 const [activeCooperativeMethod, setActiveCooperativeMethod] = useState<CooperativeMethod>(() => {
  return (localStorage.getItem('curman_activeCooperativeMethod') as CooperativeMethod | null) || 'jigsaw';
 });
 const [cooperativeGroups, setCooperativeGroups] = useState<CooperativeGroup | null>(() => {
  const saved = localStorage.getItem('curman_cooperativeGroups');
  return saved ? JSON.parse(saved) as CooperativeGroup : null;
 });
 const [classroomStudentFeedback, setClassroomStudentFeedback] = useState<ClassroomFeedback[]>(() => {
  const saved = localStorage.getItem('curman_classroomStudentFeedback');
  if (saved) {
   try {
    return JSON.parse(saved);
   } catch {}
  }
  return createDefaultClassroomStudentFeedback() as ClassroomFeedback[];
 });
 const [selectedStudentForFeedback, setSelectedStudentForFeedback] = useState<ClassroomFeedback | null>(null);

 const [classroomTopicInput, setClassroomTopicInput] = useState('');
 const [isAnalyzingTopic, setIsAnalyzingTopic] = useState(false);
 const [classroomTopicAnalysisResult, setClassroomTopicAnalysisResult] = useState<ClassroomTopicAnalysisResult | null>(null);
 const [showClassroomReport, setShowClassroomReport] = useState(false);
 const [activeTaughtUdaId, setActiveTaughtUdaId] = useState('');

 const [showOutcomesModal, setShowOutcomesModal] = useState(false);
 const [selectedUdaForOutcomes, setSelectedUdaForOutcomes] = useState<SocialUda | null>(null);
 const [selfEvaluationStars, setSelfEvaluationStars] = useState(5);
 const [outcomesAvanzato, setOutcomesAvanzato] = useState(50);
 const [outcomesIntermedio, setOutcomesIntermedio] = useState(35);
 const [outcomesBase, setOutcomesBase] = useState(10);
 const [outcomesIniziale, setOutcomesIniziale] = useState(5);
 const [criticalReflectionsInput, setCriticalReflectionsInput] = useState('');

 useEffect(() => {
  localStorage.setItem('curman_classroomStudentFeedback', JSON.stringify(classroomStudentFeedback));

  const totalCount = classroomStudentFeedback.length || 1;
  const avanzatoCount = classroomStudentFeedback.filter((s) => s.level === 'avanzato').length;
  const intermedioCount = classroomStudentFeedback.filter((s) => s.level === 'intermedio').length;
  const baseCount = classroomStudentFeedback.filter((s) => s.level === 'base').length;
  const inizialeCount = classroomStudentFeedback.filter((s) => s.level === 'iniziale').length;

  const avanzatoPct = Math.round((avanzatoCount / totalCount) * 100);
  const intermedioPct = Math.round((intermedioCount / totalCount) * 100);
  const basePct = Math.round((baseCount / totalCount) * 100);
  const inizialePct = Math.round((inizialeCount / totalCount) * 100);

  const studentWeightedScores = classroomStudentFeedback.map((s) => {
   const compitoScore = s.stars * 20;
   const levelScore = s.level === 'avanzato' ? 100 : s.level === 'intermedio' ? 80 : s.level === 'base' ? 60 : 40;
   return (0.60 * compitoScore) + (0.40 * levelScore);
  });
  const averageWeightedScore = studentWeightedScores.reduce((sum, val) => sum + val, 0) / totalCount;
  const averageStars = Math.max(1, Math.min(5, Math.round(averageWeightedScore / 20)));

  setSocialUdas((currentSocialUdas) => {
   const updatedSocial = currentSocialUdas.map((u) => {
    const matchesActive = activeTaughtUdaId ? (u.id === activeTaughtUdaId) : (u.id === 'uda-shared-1');
    if (matchesActive) {
     return {
      ...u,
      selfEvaluation: averageStars,
      studentOutcomes: {
       avanzato: avanzatoPct,
       intermedio: intermedioPct,
       base: basePct,
       iniziale: inizialePct
      }
     };
    }
    return u;
   });
   localStorage.setItem('curmanlight-social-udas-v1', JSON.stringify(updatedSocial));
   return updatedSocial;
  });
 }, [classroomStudentFeedback, activeTaughtUdaId]);

 useEffect(() => {
  localStorage.setItem('curman_activeClassTheme', activeClassTheme);
  localStorage.setItem('curman_classroomLayout', classroomLayout);
  localStorage.setItem('curman_activeCooperativeMethod', activeCooperativeMethod);
 }, [activeClassTheme, classroomLayout, activeCooperativeMethod]);

 useEffect(() => {
  if (shuffledStudentMap) {
   localStorage.setItem('curman_shuffledStudentMap', JSON.stringify(shuffledStudentMap));
  } else {
   localStorage.removeItem('curman_shuffledStudentMap');
  }
 }, [shuffledStudentMap]);

 useEffect(() => {
  localStorage.setItem('curman_exclusionsList', JSON.stringify(exclusionsList));
 }, [exclusionsList]);

 useEffect(() => {
  if (cooperativeGroups) {
   localStorage.setItem('curman_cooperativeGroups', JSON.stringify(cooperativeGroups));
  } else {
   localStorage.removeItem('curman_cooperativeGroups');
  }
 }, [cooperativeGroups]);

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