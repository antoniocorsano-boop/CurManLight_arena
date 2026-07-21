import { create } from 'zustand';

export interface NavigationState {
  activeTab: 'curriculum' | 'classroom' | 'planning' | 'documents' | 'copilot' | 'knowledge' | 'social';
  activeClassroomSubtab: string;
  activeProcessoTab: string;
  activeProgTab: string;
  activeGeneralSubtab: string;
  activeCurricoloView: 'albero' | 'mappa' | 'popolamento';
  secondBrainTab: string;
  wikiWorkspaceTab: string;
  openAccordions: Set<string>;
  showMobileSidebar: boolean;
  showSettingsPanel: boolean;
  showProfileModal: boolean;
  showKnowledgePanel: boolean;
  showQuickStartGuide: boolean;
  showDocsConfig: boolean;
  showCopilotHint: boolean;
  copilotChatOpen: boolean;
  copilotTab: 'chat' | 'suggerimenti' | 'voci';
  showAdvancedAI: boolean;
  showGlossaryModal: boolean;
  showGlossaryFull: boolean;
  showUdaTemplatesModal: boolean;

  setActiveTab: (tab: NavigationState['activeTab']) => void;
  setActiveClassroomSubtab: (subtab: string) => void;
  setActiveProcessoTab: (tab: string) => void;
  setActiveProgTab: (tab: string) => void;
  setActiveGeneralSubtab: (subtab: string) => void;
  setActiveCurricoloView: (view: NavigationState['activeCurricoloView']) => void;
  setSecondBrainTab: (tab: string) => void;
  setWikiWorkspaceTab: (tab: string) => void;
  toggleAccordion: (key: string) => void;
  resetAccordions: (discipline: string) => void;
  setShowMobileSidebar: (show: boolean) => void;
  setShowSettingsPanel: (show: boolean) => void;
  setShowProfileModal: (show: boolean) => void;
  setShowKnowledgePanel: (show: boolean) => void;
  setShowQuickStartGuide: (show: boolean) => void;
  setShowDocsConfig: (show: boolean) => void;
  setShowCopilotHint: (show: boolean) => void;
  setCopilotChatOpen: (open: boolean) => void;
  setCopilotTab: (tab: NavigationState['copilotTab']) => void;
  setShowAdvancedAI: (show: boolean) => void;
  setShowGlossaryModal: (show: boolean) => void;
  setShowGlossaryFull: (show: boolean) => void;
  setShowUdaTemplatesModal: (show: boolean) => void;
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  activeTab: 'curriculum',
  activeClassroomSubtab: 'students',
  activeProcessoTab: 'flusso',
  activeProgTab: 'annuale',
  activeGeneralSubtab: 'premessa',
  activeCurricoloView: 'albero',
  secondBrainTab: 'kb',
  wikiWorkspaceTab: 'wiki',
  openAccordions: new Set<string>(),
  showMobileSidebar: false,
  showSettingsPanel: false,
  showProfileModal: false,
  showKnowledgePanel: false,
  showQuickStartGuide: false,
  showDocsConfig: false,
  showCopilotHint: true,
  copilotChatOpen: false,
  copilotTab: 'chat',
  showAdvancedAI: false,
  showGlossaryModal: false,
  showGlossaryFull: false,
  showUdaTemplatesModal: false,

  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveClassroomSubtab: (activeClassroomSubtab) => set({ activeClassroomSubtab }),
  setActiveProcessoTab: (activeProcessoTab) => set({ activeProcessoTab }),
  setActiveProgTab: (activeProgTab) => set({ activeProgTab }),
  setActiveGeneralSubtab: (activeGeneralSubtab) => set({ activeGeneralSubtab }),
  setActiveCurricoloView: (activeCurricoloView) => set({ activeCurricoloView }),
  setSecondBrainTab: (secondBrainTab) => set({ secondBrainTab }),
  setWikiWorkspaceTab: (wikiWorkspaceTab) => set({ wikiWorkspaceTab }),
  toggleAccordion: (key) =>
    set((state) => {
      const next = new Set(state.openAccordions);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { openAccordions: next };
    }),
  resetAccordions: (discipline) => set({ openAccordions: new Set([discipline]) }),
  setShowMobileSidebar: (showMobileSidebar) => set({ showMobileSidebar }),
  setShowSettingsPanel: (showSettingsPanel) => set({ showSettingsPanel }),
  setShowProfileModal: (showProfileModal) => set({ showProfileModal }),
  setShowKnowledgePanel: (showKnowledgePanel) => set({ showKnowledgePanel }),
  setShowQuickStartGuide: (showQuickStartGuide) => set({ showQuickStartGuide }),
  setShowDocsConfig: (showDocsConfig) => set({ showDocsConfig }),
  setShowCopilotHint: (showCopilotHint) => set({ showCopilotHint }),
  setCopilotChatOpen: (copilotChatOpen) => set({ copilotChatOpen }),
  setCopilotTab: (copilotTab) => set({ copilotTab }),
  setShowAdvancedAI: (showAdvancedAI) => set({ showAdvancedAI }),
  setShowGlossaryModal: (showGlossaryModal) => set({ showGlossaryModal }),
  setShowGlossaryFull: (showGlossaryFull) => set({ showGlossaryFull }),
  setShowUdaTemplatesModal: (showUdaTemplatesModal) => set({ showUdaTemplatesModal }),
}));
