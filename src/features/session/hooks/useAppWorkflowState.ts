import { useEffect, useState } from 'react';
import type { GraphNode } from '../../../lib/architectureGraph';
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../../../lib/consolidatedStorage';

const WIZARD_STEP_MIN = 1;
const WIZARD_STEP_MAX = 5;
const WIZARD_STEP_KEY = 'curman_wizardStep';
const TARGET_CLASS_KEY = 'curman_targetClass';
const TARGET_SECTION_KEY = 'curman_targetSection';
const TARGET_SELECTION_CONFIRMED_KEY = 'curman_targetSelectionConfirmedV1';

function readWizardStep(): number {
 const raw = safeLocalStorageGetItem(WIZARD_STEP_KEY, '');
 const n = Number(raw);
 if (Number.isFinite(n) && n >= WIZARD_STEP_MIN && n <= WIZARD_STEP_MAX) {
  return Math.round(n);
 }
 return 1;
}

function readTargetSelection(): { targetClass: string; targetSection: string } {
 const storedClass = safeLocalStorageGetItem(TARGET_CLASS_KEY, '');
 const storedSection = safeLocalStorageGetItem(TARGET_SECTION_KEY, '');
 const confirmed = safeLocalStorageGetItem(TARGET_SELECTION_CONFIRMED_KEY, '') === '1';

 // Before explicit-selection tracking existed, 1/A was written automatically
 // for every new session. It is therefore not reliable evidence of a real class.
 if (!confirmed && storedClass === '1' && storedSection === 'A') {
  return { targetClass: '', targetSection: '' };
 }

 return { targetClass: storedClass, targetSection: storedSection };
}

interface UseAppWorkflowStateArgs {
 initialNodes: GraphNode[];
}

export function useAppWorkflowState({ initialNodes }: UseAppWorkflowStateArgs) {
 const [classeSubTab, setClasseSubTab] = useState<'registro' | 'strumenti' | 'pianificazione'>('registro');
 const [progettazioneMode, setProgettazioneMode] = useState<'grid' | 'wizard'>(() => {
  return safeLocalStorageGetItem('curman_progettazioneMode', 'grid') as 'grid' | 'wizard';
 });
 const [wizardStep, setWizardStep] = useState<number>(() => readWizardStep());
 const [revisioneMode, setRevisioneMode] = useState<'list' | 'wizard'>('list');
 const [revisioneWizardIndex, setRevisioneWizardIndex] = useState<number>(0);
 const [targetClass, setTargetClass] = useState(() => readTargetSelection().targetClass);
 const [targetSection, setTargetSection] = useState<string>(() => readTargetSelection().targetSection);
 const [activeCompetencyExplorer, setActiveCompetencyExplorer] = useState<string | null>('KC1');
 const [graphNodes] = useState<GraphNode[]>(initialNodes);
 const [selectedNodeId, setSelectedNodeId] = useState<string | null>('app');

 useEffect(() => {
  safeLocalStorageSetItem(WIZARD_STEP_KEY, String(wizardStep));
 }, [wizardStep]);

 useEffect(() => {
  safeLocalStorageSetItem(TARGET_CLASS_KEY, targetClass);
  safeLocalStorageSetItem(TARGET_SECTION_KEY, targetSection);
  if (targetClass.trim() || targetSection.trim()) {
   safeLocalStorageSetItem(TARGET_SELECTION_CONFIRMED_KEY, '1');
  }
 }, [targetClass, targetSection]);

 return {
  classeSubTab,
  setClasseSubTab,
  progettazioneMode,
  setProgettazioneMode,
  wizardStep,
  setWizardStep,
  revisioneMode,
  setRevisioneMode,
  revisioneWizardIndex,
  setRevisioneWizardIndex,
  targetClass,
  setTargetClass,
  targetSection,
  setTargetSection,
  activeCompetencyExplorer,
  setActiveCompetencyExplorer,
  graphNodes,
  selectedNodeId,
  setSelectedNodeId
 };
}
