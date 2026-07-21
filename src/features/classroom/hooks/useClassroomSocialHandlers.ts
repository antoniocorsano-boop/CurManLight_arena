import type { Dispatch, SetStateAction } from 'react';
import type { SchoolOrder, UdaModel, UserRole } from '../../../types/curriculum';
import type { ClassTheme, ClassroomTopicAnalysisResult, CooperativeGroup, CooperativeMethod, CurriculumMap, ExclusionPair, SocialUda } from '../../session';
import {
 CLASSROOM_STUDENT_IDS,
 CLASSROOM_THEME_NAME_MAP,
 CLASSROOM_THEME_NAME_POOLS,
 JIGSAW_ROLES,
 LABORATORY_ROLES_A,
 LABORATORY_ROLES_B,
 PEER_TUTORING_PAIR_NAMES,
 PEER_TUTORING_PAIR_TASKS
} from '../data/classroomPlanning';
import { getRoleLabel } from '../../../lib/roleLabels';
import { orderLabelsForMap } from '../../../lib/disciplineLabels';
import { containsInclusiveSensitiveTerms } from '../../../lib/gdprFilter';

type UseClassroomSocialHandlersArgs = {
 activeClassTheme: ClassTheme;
 shuffledStudentMap: Record<string, string> | null;
 setShuffledStudentMap: Dispatch<SetStateAction<Record<string, string> | null>>;
 showToast: (msg: string, success?: boolean) => void;
 exclusionsList: ExclusionPair[];
 activeCooperativeMethod: CooperativeMethod;
 setCooperativeGroups: Dispatch<SetStateAction<CooperativeGroup | null>>;
 classroomTopicInput: string;
 setClassroomTopicInput: (value: string) => void;
 setIsAnalyzingTopic: (value: boolean) => void;
 classroomTopicAnalysisResult: ClassroomTopicAnalysisResult | null;
 setClassroomTopicAnalysisResult: Dispatch<SetStateAction<ClassroomTopicAnalysisResult | null>>;
 savedUda: UdaModel[];
 localCurriculum: CurriculumMap;
 discipline: string;
 order: SchoolOrder;
 addUda: (uda: UdaModel) => void;
 setActiveTaughtUdaId: (value: string) => void;
 socialUdas: SocialUda[];
 updateSocialUdas: (newList: SocialUda[]) => void;
 role: UserRole;
 newAnnotationInputs: Record<string, string>;
 setNewAnnotationInputs: Dispatch<SetStateAction<Record<string, string>>>;
 selectedUdaForOutcomes: SocialUda | null;
 outcomesAvanzato: number;
 outcomesIntermedio: number;
 outcomesBase: number;
 outcomesIniziale: number;
 criticalReflectionsInput: string;
 selfEvaluationStars: number;
 setSelectedUdaForOutcomes: (value: SocialUda | null) => void;
 setShowOutcomesModal: (value: boolean) => void;
 setCriticalReflectionsInput: (value: string) => void;
};

export function useClassroomSocialHandlers({
 activeClassTheme,
 shuffledStudentMap,
 setShuffledStudentMap,
 showToast,
 exclusionsList,
 activeCooperativeMethod,
 setCooperativeGroups,
 classroomTopicInput,
 setClassroomTopicInput,
 setIsAnalyzingTopic,
 classroomTopicAnalysisResult,
 setClassroomTopicAnalysisResult,
 savedUda,
 localCurriculum,
 discipline,
 order,
 addUda,
 setActiveTaughtUdaId,
 socialUdas,
 updateSocialUdas,
 role,
 newAnnotationInputs,
 setNewAnnotationInputs,
 selectedUdaForOutcomes,
 outcomesAvanzato,
 outcomesIntermedio,
 outcomesBase,
 outcomesIniziale,
 criticalReflectionsInput,
 selfEvaluationStars,
 setSelectedUdaForOutcomes,
 setShowOutcomesModal,
 setCriticalReflectionsInput
}: UseClassroomSocialHandlersArgs) {
 const getThemedStudentName = (id: string) => {
  if (shuffledStudentMap && shuffledStudentMap[id]) {
   return shuffledStudentMap[id];
  }
  return CLASSROOM_THEME_NAME_MAP[activeClassTheme]?.[id] || "Studente";
 };

 const handleShufflePseudonyms = () => {
  const pool = [...(CLASSROOM_THEME_NAME_POOLS[activeClassTheme] || [])];
  for (let i = pool.length - 1; i > 0; i--) {
   const j = Math.floor(Math.random() * (i + 1));
   [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const newMap: Record<string, string> = {};
  CLASSROOM_STUDENT_IDS.forEach((id, index) => {
   newMap[id] = pool[index] || "Studente";
  });
  setShuffledStudentMap(newMap);
  showToast(" Pseudonimi d'Aula rimescolati dinamicamente sulla LIM!", true);
 };

 const handleGenerateCooperativeGroups = () => {
  showToast(" Swarm d'Esperti: Elaborazione Gruppi Cooperativi...");
  setTimeout(() => {
   const students = CLASSROOM_STUDENT_IDS;
   let bestLayout: CooperativeGroup | null = null;
   let minViolations = 9999;

   for (let trial = 0; trial < 100; trial++) {
    const shuf = [...students];
    for (let i = shuf.length - 1; i > 0; i--) {
     const j = Math.floor(Math.random() * (i + 1));
     [shuf[i], shuf[j]] = [shuf[j], shuf[i]];
    }

    let currentLayout: CooperativeGroup | null = null;
    let violations = 0;

    if (activeCooperativeMethod === 'jigsaw') {
     const groupA_ids = shuf.slice(0, 4);
     const groupB_ids = shuf.slice(4, 8);

     exclusionsList.forEach(ex => {
      if (groupA_ids.includes(ex.s1) && groupA_ids.includes(ex.s2)) violations++;
      if (groupB_ids.includes(ex.s1) && groupB_ids.includes(ex.s2)) violations++;
     });

     const group1 = groupA_ids.map((id, idx) => ({ id, ...JIGSAW_ROLES[idx] }));
     const group2 = groupB_ids.map((id, idx) => ({ id, ...JIGSAW_ROLES[idx] }));

     currentLayout = {
      method: 'jigsaw',
      list: [
       { name: 'Gruppo Saggi A', members: group1 },
       { name: 'Gruppo Saggi B', members: group2 }
      ]
     };
    } else if (activeCooperativeMethod === 'peertutoring') {
     const pairs_ids = [
      [shuf[0], shuf[1]],
      [shuf[2], shuf[3]],
      [shuf[4], shuf[5]],
      [shuf[6], shuf[7]]
     ];

     exclusionsList.forEach(ex => {
      pairs_ids.forEach(pair => {
       if (pair.includes(ex.s1) && pair.includes(ex.s2)) violations++;
      });
     });

     const list = pairs_ids.map((pair, idx) => ({
      name: PEER_TUTORING_PAIR_NAMES[idx],
      tutor: pair[0],
      tutee: pair[1],
      task: PEER_TUTORING_PAIR_TASKS[idx]
     }));

     currentLayout = {
      method: 'peertutoring',
      list
     };
    } else {
     const groupA_ids = shuf.slice(0, 4);
     const groupB_ids = shuf.slice(4, 8);

     exclusionsList.forEach(ex => {
      if (groupA_ids.includes(ex.s1) && groupA_ids.includes(ex.s2)) violations++;
      if (groupB_ids.includes(ex.s1) && groupB_ids.includes(ex.s2)) violations++;
     });

     const groupA = groupA_ids.map((id, idx) => ({ id, ...LABORATORY_ROLES_A[idx] }));
     const groupB = groupB_ids.map((id, idx) => ({ id, ...LABORATORY_ROLES_B[idx] }));

     currentLayout = {
      method: 'laboratorio',
      list: [
       { name: 'Gruppo Ricercatori Teologi', members: groupA },
       { name: 'Gruppo Sperimentatori Maker', members: groupB }
      ]
     };
    }

    if (violations < minViolations) {
     minViolations = violations;
     bestLayout = currentLayout;
    }

    if (violations === 0) break;
   }

   setCooperativeGroups(bestLayout);

   if (minViolations > 0) {
    showToast(` Generazione completata con ${minViolations} vincolo relazionale non risolvibile. Regola manualmente con il mouse`, false);
   } else {
    showToast(" Gruppi Cooperativi dinamici composti rispettando tutti i vincoli!", true);
   }
  }, 500);
 };

 const handleAnalyzeClassroomTopic = () => {
  const topic = classroomTopicInput.trim();
  if (!topic) {
   showToast(" Inserisci un argomento scolastico da spiegare!");
   return;
  }

  setIsAnalyzingTopic(true);
  setClassroomTopicAnalysisResult(null);

  setTimeout(() => {
   const matched = savedUda.find(u =>
    u.title.toLowerCase().includes(topic.toLowerCase()) ||
    u.notes.toLowerCase().includes(topic.toLowerCase()) ||
    u.realTask.toLowerCase().includes(topic.toLowerCase())
   );

   if (matched) {
    setClassroomTopicAnalysisResult({
     type: "link",
     uda: matched
    });
    showToast(" Raccordo rilevato! Argomento gia' pianificato.");
   } else {
    const curData = localCurriculum[discipline]?.[order] || { traguardi: [], obiettivi: [], evidenze: [] };

    const matchTrag = curData.traguardi.filter((t: string) => t.toLowerCase().includes(topic.toLowerCase()));
    const matchObj = curData.obiettivi.filter((o: string) => o.toLowerCase().includes(topic.toLowerCase()));
    const matchEv = (curData.evidenze || []).filter((e: string) => e.toLowerCase().includes(topic.toLowerCase()));

    const suggestedTraguardi = matchTrag.length > 0 ? matchTrag.slice(0, 3) :
                 (curData.traguardi.length > 0 ? curData.traguardi.slice(0, 2) : [`L'alunno padroneggia le conoscenze relative a "${topic}" raccordandole con le tutele d'Istituto.`]);
    const suggestedObiettivi = matchObj.length > 0 ? matchObj.slice(0, 3) :
                 (curData.obiettivi.length > 0 ? curData.obiettivi.slice(0, 2) : [`Analizzare ed esporre le dinamiche e strutture inerenti a "${topic}".`]);
    const suggestedEvidenze = matchEv.length > 0 ? matchEv.slice(0, 3) :
                 ((curData.evidenze && curData.evidenze.length > 0) ? curData.evidenze.slice(0, 2) : [`Elabora un saggio breve o un poster didattico descrivendo ${topic}.`]);

    const proposedTitle = `UDA Estemporanea: ${topic}`;
    setClassroomTopicAnalysisResult({
     type: "proposal",
     id: `uda-injected-${Date.now()}`,
     title: proposedTitle,
     discipline: discipline,
     order: order,
     period: "In corso d'anno",
     hours: 15,
     traguardi: suggestedTraguardi,
     obiettivi: suggestedObiettivi,
     evidenze: suggestedEvidenze,
     realTask: `Realizzazione di una presentazione multimediale ed attivita' pratica su "${topic}".`,
     notes: "Proposta elaborata con il Co-pilota d'Istituto scansionando i 460 elementi del Curricolo Verticale."
    });
    showToast(" Nessuna UDA copre l'argomento. Generata proposta d'iniezione!");
   }
   setIsAnalyzingTopic(false);
  }, 1200);
 };

 const handleApproveAndInjectUda = () => {
  if (!classroomTopicAnalysisResult || classroomTopicAnalysisResult.type !== 'proposal') return;

  const prop = classroomTopicAnalysisResult;
  const newUda: UdaModel = {
   id: prop.id,
   title: prop.title,
   discipline: prop.discipline,
   order: prop.order,
   period: prop.period,
   hours: prop.hours,
   status: "bozza",
   traguardi: prop.traguardi,
   obiettivi: prop.obiettivi,
   evidenze: prop.evidenze,
   realTask: prop.realTask,
   notes: prop.notes,
   createdAt: new Date().toLocaleDateString('it-IT')
  };

  addUda(newUda);
  setActiveTaughtUdaId(newUda.id);
  setClassroomTopicAnalysisResult(null);
  setClassroomTopicInput("");
  showToast(" UDA iniettata con successo nel diagramma di Gantt e nel piano d'Istituto!");
 };

 const handleShareUdaToSocial = (udaId: string) => {
  const personalUda = savedUda.find(u => u.id === udaId);
  if (!personalUda) return;

  const alreadyShared = socialUdas.some(s => s.title === personalUda.title && s.discipline === personalUda.discipline);
  if (alreadyShared) {
   showToast(" Questa Unita' di Apprendimento (UDA) e' gia' stata condivisa in bacheca!");
   return;
  }

  const newSharedUda: SocialUda = {
   id: `uda-shared-${Date.now()}`,
   title: personalUda.title,
   author: `${getRoleLabel(role)} (${orderLabelsForMap[order].split(" ")[0]})`,
   discipline: personalUda.discipline,
   order: personalUda.order,
   period: personalUda.period,
   hours: personalUda.hours,
   traguardi: personalUda.traguardi,
   obiettivi: personalUda.obiettivi,
   evidenze: personalUda.evidenze,
   realTask: personalUda.realTask,
   notes: personalUda.notes,
   likes: 0,
   likedByMe: false,
   annotations: []
  };

  updateSocialUdas([newSharedUda, ...socialUdas]);
  showToast("UDA condivisa con successo sulla bacheca d'Istituto!");
 };

 const handleReuseUda = (sharedUda: SocialUda) => {
  const newPersonalUda: UdaModel = {
   id: `uda-imported-${Date.now()}`,
   title: `${sharedUda.title} (Importata)`,
   discipline: sharedUda.discipline,
   order: sharedUda.order,
   period: sharedUda.period,
   hours: sharedUda.hours,
   status: "bozza",
   traguardi: sharedUda.traguardi,
   obiettivi: sharedUda.obiettivi,
   evidenze: sharedUda.evidenze,
   realTask: sharedUda.realTask,
   notes: sharedUda.notes,
   createdAt: new Date().toLocaleDateString('it-IT')
  };

  addUda(newPersonalUda);
  showToast("UDA importata con successo nel tuo Archivio Personale!");
 };

 const handleLikeUda = (sharedId: string) => {
  const newList = socialUdas.map(s => {
   if (s.id === sharedId) {
    return {
     ...s,
     likes: s.likedByMe ? s.likes - 1 : s.likes + 1,
     likedByMe: !s.likedByMe
    };
   }
   return s;
  });
  updateSocialUdas(newList);
  showToast(" Preferito aggiornato!");
 };

 const handleAddAnnotation = (sharedId: string) => {
  const text = newAnnotationInputs[sharedId] || "";
  if (!text.trim()) {
   showToast(" Inserisci un'annotazione per l'UDA!");
   return;
  }

  if (containsInclusiveSensitiveTerms(text)) {
   showToast(" Regolamento d'Istituto (GDPR): Evita di inserire riferimenti a diagnosi cliniche (DSA, BES, 104) nelle annotazioni.", false);
   return;
  }

  const newList = socialUdas.map(s => {
   if (s.id === sharedId) {
    return {
     ...s,
     annotations: [...s.annotations, { author: getRoleLabel(role), text: text.trim() }]
    };
   }
   return s;
  });

  updateSocialUdas(newList);
  setNewAnnotationInputs({ ...newAnnotationInputs, [sharedId]: "" });
  showToast(" Annotazione per lessons learned aggiunta con successo!");
 };

 const handleSaveOutcomes = () => {
  if (!selectedUdaForOutcomes) return;

  const totalPct = Number(outcomesAvanzato) + Number(outcomesIntermedio) + Number(outcomesBase) + Number(outcomesIniziale);
  if (totalPct !== 100) {
   alert(` La somma delle percentuali d'esito degli studenti deve essere esattamente pari a 100%! (Somma attuale: ${totalPct}%)`);
   return;
  }

  const newList = socialUdas.map(s => {
   if (s.id === selectedUdaForOutcomes.id) {
    const newAnnotations = [...s.annotations];
    if (criticalReflectionsInput.trim()) {
     newAnnotations.push({
      author: `${getRoleLabel(role)} (Esito d'Aula)`,
      text: `Riflessione critica d'esito: ${criticalReflectionsInput.trim()}`
     });
    }
    return {
     ...s,
     selfEvaluation: selfEvaluationStars,
     studentOutcomes: {
      avanzato: outcomesAvanzato,
      intermedio: outcomesIntermedio,
      base: outcomesBase,
      iniziale: outcomesIniziale
     },
     annotations: newAnnotations
    };
   }
   return s;
  });

  updateSocialUdas(newList);
  setCriticalReflectionsInput("");
  setShowOutcomesModal(false);
  setSelectedUdaForOutcomes(null);
  showToast(" Esiti didattici registrati e calcolati con successo dal sistema!");
 };

 return {
  getThemedStudentName,
  handleShufflePseudonyms,
  handleGenerateCooperativeGroups,
  handleAnalyzeClassroomTopic,
  handleApproveAndInjectUda,
  handleShareUdaToSocial,
  handleReuseUda,
  handleLikeUda,
  handleAddAnnotation,
  handleSaveOutcomes
 };
}
