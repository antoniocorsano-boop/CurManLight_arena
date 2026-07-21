import { useState } from 'react';
import type { GraphNode } from '../../../lib/architectureGraph';
import { safeLocalStorageGetItem } from '../../../lib/consolidatedStorage';

interface UseAppWorkflowStateArgs {
 initialNodes: GraphNode[];
}

export function useAppWorkflowState({ initialNodes }: UseAppWorkflowStateArgs) {
 const [classeSubTab, setClasseSubTab] = useState<'registro' | 'strumenti' | 'pianificazione'>('registro');
 const [progettazioneMode, setProgettazioneMode] = useState<'grid' | 'wizard'>(() => {
  return safeLocalStorageGetItem('curman_progettazioneMode', 'grid') as 'grid' | 'wizard';
 });
 const [wizardStep, setWizardStep] = useState<number>(1);
 const [revisioneMode, setRevisioneMode] = useState<'list' | 'wizard'>('list');
 const [revisioneWizardIndex, setRevisioneWizardIndex] = useState<number>(0);
 const [targetClass, setTargetClass] = useState(() => safeLocalStorageGetItem('curman_targetClass', '1'));
 const [targetSection, setTargetSection] = useState<string>(() => safeLocalStorageGetItem('curman_targetSection', 'A'));
 const [activeCompetencyExplorer, setActiveCompetencyExplorer] = useState<string | null>('KC1');
 const [graphNodes] = useState<GraphNode[]>(initialNodes);
 const [selectedNodeId, setSelectedNodeId] = useState<string | null>('app');

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
