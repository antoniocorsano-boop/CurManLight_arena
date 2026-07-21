import { useEffect, useState } from 'react';
import type { SchoolOrder, UdaModel, UserState } from '../../../types/curriculum';
import type { CurriculumMap } from '../../session';
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../../../lib/consolidatedStorage';

type ProgStatus = 'bozza' | 'in revisione' | 'pronta per confronto';

interface UseUdaProgrammingHandlersArgs {
  localCurriculum: CurriculumMap;
  discipline: string;
  order: SchoolOrder;
  schoolYear: string;
  targetClass: string;
  targetSection: string;
  selectedTraguardi: number[];
  selectedObiettivi: number[];
  selectedEvidenze: string[];
  addUda: (uda: UdaModel) => void;
  setActiveProgTab: (tab: UserState['activeProgTab']) => void;
  showToast: (msg: string, success?: boolean) => void;
}

export const useUdaProgrammingHandlers = ({
  localCurriculum,
  discipline,
  order,
  schoolYear,
  targetClass,
  targetSection,
  selectedTraguardi,
  selectedObiettivi,
  selectedEvidenze,
  addUda,
  setActiveProgTab,
  showToast
}: UseUdaProgrammingHandlersArgs) => {
  const [progTitle, setProgTitle] = useState(() => safeLocalStorageGetItem('curman_progTitle', 'Modulo 1: Ascolto e Sintesi'));
  const [progPeriod, setProgPeriod] = useState(() => safeLocalStorageGetItem('curman_progPeriod', 'Primo Quadrimestre'));
  const [progStatus, setProgStatus] = useState<ProgStatus>(() => safeLocalStorageGetItem('curman_progStatus', 'bozza') as ProgStatus);
  const [progHours, setProgHours] = useState(() => Number(safeLocalStorageGetItem('curman_progHours', '15')) || 15);
  const [progNotes, setProgNotes] = useState(() => safeLocalStorageGetItem('curman_progNotes', ''));
  const [realTaskInput, setRealTaskInput] = useState(() => safeLocalStorageGetItem('curman_realTaskInput', ''));
  const [progCoAuthors, setProgCoAuthors] = useState(() => safeLocalStorageGetItem('curman_progCoAuthors', ''));

  const [libFilterClass, setLibFilterClass] = useState('all');
  const [libFilterPeriod, setLibFilterClassPeriod] = useState('all');
  const [libFilterStatus, setLibFilterClassStatus] = useState('all');
  const [libSearchText, setLibSearchText] = useState('');
  const [libSorting, setLibSorting] = useState<'recenti' | 'meno_recenti' | 'az' | 'disc_az'>('recenti');

  useEffect(() => {
    safeLocalStorageSetItem('curman_progTitle', progTitle);
    safeLocalStorageSetItem('curman_progPeriod', progPeriod);
    safeLocalStorageSetItem('curman_progStatus', progStatus);
    safeLocalStorageSetItem('curman_progHours', String(progHours));
    safeLocalStorageSetItem('curman_progNotes', progNotes);
    safeLocalStorageSetItem('curman_realTaskInput', realTaskInput);
    safeLocalStorageSetItem('curman_progCoAuthors', progCoAuthors);
  }, [progTitle, progPeriod, progStatus, progHours, progNotes, realTaskInput, progCoAuthors]);

  const saveProgDraft = () => {
    safeLocalStorageSetItem('curman_progTitle', progTitle);
    safeLocalStorageSetItem('curman_progPeriod', progPeriod);
    safeLocalStorageSetItem('curman_progStatus', progStatus);
    safeLocalStorageSetItem('curman_progHours', String(progHours));
    safeLocalStorageSetItem('curman_progNotes', progNotes);
    safeLocalStorageSetItem('curman_realTaskInput', realTaskInput);
    safeLocalStorageSetItem('curman_progCoAuthors', progCoAuthors);
    showToast("Bozza della programmazione annuale salvata con successo!");
  };

  const compileProgPreviewText = () => {
    const currentData = localCurriculum[discipline]?.[order] || { traguardi: [], obiettivi: [] };
    const selTraguardi = selectedTraguardi.map(idx => currentData.traguardi[idx]);
    const selObiettivi = selectedObiettivi.map(idx => currentData.obiettivi[idx]);

    const isReformed = !(schoolYear === '2026-2027' && targetClass !== '1' && order !== 'infanzia');
    const normativeRef = isReformed ? "Nuovo Ordinamento D.M. 221/2025" : "Previgente Ordinamento D.M. 254/2012";

    let text = `========================================================\n`;
    text += `PROGRAMMAZIONE ANNUALE DISCIPLINARE - CURMANLIGHT\n`;
    text += `Istituto Comprensivo "don Lorenzo Milani"\n`;
    text += `========================================================\n\n`;
    text += `DISCIPLINA: ${discipline.toUpperCase()}\n`;
    text += `ORDINE:   ${order.toUpperCase()}\n`;
    text += `CLASSE:   Classe ${order === 'infanzia' ? 'Fascia Unica' : targetClass + '^ Sez. ' + targetSection}\n`;
    text += `ANNO SCOL.: ${schoolYear}\n`;
    text += `NORMATIVA:  ${normativeRef}\n`;
    text += `MODULO:   ${progTitle}\n`;
    text += `PERIODO:   ${progPeriod}\n`;
    text += `ORE PREV.:  ${progHours} ore\n`;
    text += `STATO BOZZA: ${progStatus.toUpperCase()}\n\n`;

    text += `--- TRAGUARDI DI RIFERIMENTO ---\n`;
    if (selTraguardi.length === 0) {
      text += `[Nessuno selezionato. Ritorna alla scheda Evidenze per selezionarli]\n`;
    } else {
      selTraguardi.forEach((t, i) => {
        text += `${i + 1}. ${t}\n`;
      });
    }
    text += `\n`;

    text += `--- OBIETTIVI DI APPRENDIMENTO ---\n`;
    if (selObiettivi.length === 0) {
      text += `[Nessuno selezionato. Ritorna alla scheda Evidenze per selezionarli]\n`;
    } else {
      selObiettivi.forEach((o, i) => {
        text += `${i + 1}. ${o}\n`;
      });
    }
    text += `\n`;

    text += `--- EVIDENZE COMPORTAMENTALI OSSERVABILI ---\n`;
    if (selectedEvidenze.length === 0) {
      text += `[Nessuna evidenza associata. Selezionale in Evidenze]\n`;
    } else {
      selectedEvidenze.forEach((ev) => {
        text += `- [ ] ${ev}\n`;
      });
    }
    text += `\n`;

    text += `--- COMPITO DI REALTA' ATTESO ---\n`;
    text += `${realTaskInput || "Non impostato."}\n\n`;

    text += `--- INCLUSIONE, METODOLOGIE E NOTE ---\n`;
    text += `${progNotes || "Nessuna nota integrativa digitata."}\n`;

    return text;
  };

  const handleGenerateUda = () => {
    if (!progTitle) {
      showToast("Inserisci un titolo valido per poter generare l'UDA!", false);
      return;
    }

    const currentData = localCurriculum[discipline]?.[order] || { traguardi: [], obiettivi: [] };
    const titleSuffix = order === 'infanzia' ? '' : ` (Target: ${targetClass}^${targetSection})`;
    const newUda: UdaModel = {
      id: "uda-" + Date.now(),
      title: `${progTitle}${titleSuffix}`,
      discipline,
      order,
      period: progPeriod,
      hours: progHours,
      status: 'bozza',
      traguardi: selectedTraguardi.map(idx => currentData.traguardi[idx]),
      obiettivi: selectedObiettivi.map(idx => currentData.obiettivi[idx]),
      evidenze: [...selectedEvidenze],
      realTask: realTaskInput || "Realizzazione di un prodotto di sintesi disciplinare.",
      notes: progNotes || "Adattamento personalizzato secondo bisogni della classe.",
      createdAt: new Date().toLocaleDateString('it-IT')
    };

    addUda(newUda);
    setActiveProgTab('uda');
    showToast("Bozza di UDA Generata con successo e aggiunta all'archivio locale!");
  };

  const handleLoadSuggestedUda = (udaType: string) => {
    if (udaType === 'smart-home') {
      setProgTitle("Smart Home con Blender 3D");
      setProgPeriod("Secondo Quadrimestre");
      setProgHours(30);
      setRealTaskInput("Sviluppo di un prototipo digitale tridimensionale di una casa domotica a basso consumo energetico usando Blender.");
      setProgNotes("Utilizzo di modelli e interfacce semplificate per supportare gli alunni DSA nei laboratori.");
      showToast("UDA 'Smart Home' caricata con successo! Verifica i parametri.", true);
    } else if (udaType === 'etica-ia') {
      setProgTitle("Etica e Algoritmi: l'impatto dell'I.A.");
      setProgPeriod("Primo Quadrimestre");
      setProgHours(15);
      setRealTaskInput("Realizzazione di un diagramma di flusso logico e una presentazione critica dei bias di un algoritmo di intelligenza artificiale.");
      setProgNotes("Uso delle aule INNOVACLASS PNRR per la didattica collaborativa.");
      showToast("UDA 'Etica e I.A.' caricata con successo! Verifica i parametri.", true);
    } else if (udaType === 'corsivo') {
      setProgTitle("Il corsivo come espressione");
      setProgPeriod("Primo Quadrimestre");
      setProgHours(20);
      setRealTaskInput("Scrittura di un diario personale della classe curando la calligrafia in corsivo ed eseguendo sintesi e riassunti.");
      setProgNotes("Adattamento facilitato con fogli a righine speciali per studenti disgrafici.");
      showToast("UDA 'Il corsivo come espressione' caricata con successo!", true);
    } else if (udaType === 'barbiana') {
      setProgTitle("La scrittura collettiva di Barbiana");
      setProgPeriod("Secondo Quadrimestre");
      setProgHours(25);
      setRealTaskInput("Redazione cooperativa di una lettera aperta della classe sui temi dell'inclusione sociale e del diritto all'istruzione.");
      setProgNotes("Raccordo interdisciplinare con Educazione Civica ed educazione alla legalita.");
      showToast("UDA 'Scrittura collettiva' caricata con successo!", true);
    } else if (udaType === 'etimologia-latino') {
      setProgTitle("Archeologia delle parole: l'etimologia");
      setProgPeriod("Primo Pentamestre");
      setProgHours(18);
      setRealTaskInput("Creazione di un glossario etimologico digitale bilingue (italiano-latino) di termini scientifici e giuridici.");
      setProgNotes("Laboratorio filologico interdisciplinare coordinato con italiano.");
      showToast("UDA 'Etimologia Latino' caricata con successo!", true);
    }
    setActiveProgTab('annuale');
  };

  const handleApplyLibFilters = (u: UdaModel) => {
    if (libFilterClass !== 'all' && u.order !== libFilterClass) return false;
    if (libFilterPeriod !== 'all' && u.period !== libFilterPeriod) return false;
    if (libFilterStatus !== 'all' && u.status !== libFilterStatus) return false;
    if (libSearchText) {
      const matchText = libSearchText.toLowerCase();
      const inTitle = u.title.toLowerCase().includes(matchText);
      const inNotes = u.notes.toLowerCase().includes(matchText);
      const inRealTask = u.realTask.toLowerCase().includes(matchText);
      if (!inTitle && !inNotes && !inRealTask) return false;
    }
    return true;
  };

  const handleSortUdaList = (a: UdaModel, b: UdaModel) => {
    if (libSorting === 'recenti') return b.id.localeCompare(a.id);
    if (libSorting === 'meno_recenti') return a.id.localeCompare(b.id);
    if (libSorting === 'az') return a.title.localeCompare(b.title);
    if (libSorting === 'disc_az') return a.discipline.localeCompare(b.discipline);
    return 0;
  };

  const handleClearLibFilters = () => {
    setLibFilterClass('all');
    setLibFilterClassPeriod('all');
    setLibFilterClassStatus('all');
    setLibSearchText('');
    setLibSorting('recenti');
    showToast("Filtri di ricerca dell'archivio azzerati.");
  };

  return {
    progTitle,
    setProgTitle,
    progPeriod,
    setProgPeriod,
    progStatus,
    setProgStatus,
    progHours,
    setProgHours,
    progNotes,
    setProgNotes,
    realTaskInput,
    setRealTaskInput,
    progCoAuthors,
    setProgCoAuthors,
    libFilterClass,
    setLibFilterClass,
    libFilterPeriod,
    setLibFilterClassPeriod,
    libFilterStatus,
    setLibFilterClassStatus,
    libSearchText,
    setLibSearchText,
    libSorting,
    setLibSorting,
    saveProgDraft,
    compileProgPreviewText,
    handleGenerateUda,
    handleLoadSuggestedUda,
    handleApplyLibFilters,
    handleSortUdaList,
    handleClearLibFilters
  };
};
