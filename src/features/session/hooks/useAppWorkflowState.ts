import { useEffect, useState } from 'react';
import type { GraphNode } from '../../../lib/architectureGraph';
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../../../lib/consolidatedStorage';

const WIZARD_STEP_MIN = 1;
const WIZARD_STEP_MAX = 5;
const WIZARD_STEP_KEY = 'curman_wizardStep';
const TARGET_CLASS_KEY = 'curman_targetClass';
const TARGET_SECTION_KEY = 'curman_targetSection';

function readWizardStep(): number {
 const raw = safeLocalStorageGetItem(WIZARD_STEP_KEY, '');
 const n = Number(raw);
 if (Number.isFinite(n) && n >= WIZARD_STEP_MIN && n <= WIZARD_STEP_MAX) {
  return Math.round(n);
 }
 return 1;
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
 const [targetClass, setTargetClass] = useState(() => safeLocalStorageGetItem(TARGET_CLASS_KEY, '1'));
 const [targetSection, setTargetSection] = useState<string>(() => safeLocalStorageGetItem(TARGET_SECTION_KEY, 'A'));
 const [activeCompetencyExplorer, setActiveCompetencyExplorer] = useState<string | null>('KC1');
 const [graphNodes] = useState<GraphNode[]>(initialNodes);
 const [selectedNodeId, setSelectedNodeId] = useState<string | null>('app');

 useEffect(() => {
  safeLocalStorageSetItem(WIZARD_STEP_KEY, String(wizardStep));
 }, [wizardStep]);

 useEffect(() => {
  safeLocalStorageSetItem(TARGET_CLASS_KEY, targetClass);
 }, [targetClass]);

 useEffect(() => {
  safeLocalStorageSetItem(TARGET_SECTION_KEY, targetSection);
 }, [targetSection]);

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
