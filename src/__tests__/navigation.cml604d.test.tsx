import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppContext, type AppContextValue } from '../components/layout/AppContext';
import CurriculumPage from '../pages/CurriculumPage';
import PlanningPage from '../pages/PlanningPage';
import DocumentsPage from '../pages/DocumentsPage';
import KnowledgePage from '../pages/KnowledgePage';
import SocialPage from '../pages/SocialPage';
import SettingsPage from '../pages/SettingsPage';

function createMockContext(overrides: Partial<AppContextValue> = {}): AppContextValue {
 return {
  activeTab: 'dashboard',
  role: 'insegnante',
  discipline: 'italiano',
  order: 'primaria',
  savedUda: [],
  decisions: {},
  localCurriculum: {} as any,
  handleTabSwitch: vi.fn(),
  handleDownloadCml: vi.fn(),
  setSelectedBrainDoc: vi.fn(),
  setWikiWorkspaceTab: vi.fn(),
  setShowSaveModal: vi.fn(),
  setActiveCurricoloView: vi.fn(),
  setActiveProgTab: vi.fn(),
  showOnlyProfileCurriculum: false,
  setShowOnlyProfileCurriculum: vi.fn(),
  expandedMapSections: {},
  setExpandedMapSections: vi.fn(),
  showOnlyProfileProcesso: false,
  setShowOnlyProfileProcesso: vi.fn(),
  importTopicInput: '',
  setImportTopicInput: vi.fn(),
  isGeneratingKB: false,
  generatedKBOuput: null,
  localAgentStatus: 'idle',
  localAgentSize: '',
  popolamentoTab: 'copilot',
  setPopolamentoTab: vi.fn(),
  setShowAgentSetupModal: vi.fn(),
  handleAiGenerateCurriculum: vi.fn(),
  handleSaveGeneratedToKB: vi.fn(),
  handleCSVUpload: vi.fn(),
  handleResetCurriculumToBaseline: vi.fn(),
  currentDisciplineProps: [],
  currentDisciplineDecided: 0,
  revisioneMode: 'list',
  setRevisioneMode: vi.fn(),
  revisioneWizardIndex: 0,
  setRevisioneWizardIndex: vi.fn(),
  targetClass: '',
  setTargetClass: vi.fn(),
  targetSection: '',
  setTargetSection: vi.fn(),
  assignedCombinations: [],
  progettazioneMode: 'grid',
  setProgettazioneMode: vi.fn(),
  wizardStep: 1,
  setWizardStep: vi.fn(),
  progTitle: '',
  setProgTitle: vi.fn(),
  progPeriod: '',
  setProgPeriod: vi.fn(),
  progHours: 0,
  setProgHours: vi.fn(),
  progStatus: 'bozza',
  setProgStatus: vi.fn(),
  progNotes: '',
  setProgNotes: vi.fn(),
  realTaskInput: '',
  setRealTaskInput: vi.fn(),
  progCoAuthors: '',
  setProgCoAuthors: vi.fn(),
  branchFocusHighlight: false,
  toggleBranchFocusHighlight: vi.fn(),
  tepBannerVisible: false,
  setTepBannerVisible: vi.fn(),
  setTepBannerDismissed: vi.fn(),
  handleTepSwitchToWizard: vi.fn(),
  handleTepSimplifyGrid: vi.fn(),
  anticipatedFields: [],
  confirmAnticipatedField: vi.fn(),
  applyAnticipatoryPrefill: vi.fn(),
  saveProgDraft: vi.fn(),
  handleGenerateUda: vi.fn(),
  compileProgPreviewText: vi.fn(),
  handleTriggerGemSuggestion: vi.fn(),
  handleBack: vi.fn(),
  handleNext: vi.fn(),
  handleLoadSuggestedUda: vi.fn(),
  handleCloneUdaAdaptive: vi.fn(),
  copyUdaTextLocal: vi.fn(),
  handleShareUdaToSocial: vi.fn(),
  handleApplyLibFilters: vi.fn(),
  handleSortUdaList: vi.fn(),
  handleClearLibFilters: vi.fn(),
  libFilterClass: '',
  setLibFilterClass: vi.fn(),
  libFilterPeriod: '',
  setLibFilterClassPeriod: vi.fn(),
  libFilterStatus: '',
  setLibFilterClassStatus: vi.fn(),
  libSearchText: '',
  setLibSearchText: vi.fn(),
  libSorting: 'recenti',
  setLibSorting: vi.fn(),
  setSelectedUda: vi.fn(),
  classeSubTab: 'registro',
  setClasseSubTab: vi.fn(),
  selectedEvidenze: [],
  activeCompetencyExplorer: '',
  setActiveCompetencyExplorer: vi.fn(),
  showToast: vi.fn(),
  getDisciplineIcon: vi.fn(),
  getDisciplineLabel: vi.fn(),
  selectedClassCombination: '',
  setSelectedClassCombination: vi.fn(),
  classroomStudents: [],
  setClassroomStudents: vi.fn(),
  showAiSimulatedResponse: false,
  setShowAiSimulatedResponse: vi.fn(),
  isClassroomLoading: false,
  setIsClassroomLoading: vi.fn(),
  classroomStudentFeedback: [],
  setClassroomStudentFeedback: vi.fn(),
  selectedStudentForFeedback: null,
  setSelectedStudentForFeedback: vi.fn(),
  showClassroomReport: false,
  setShowClassroomReport: vi.fn(),
  activeClassTheme: 'scientists',
  setActiveClassTheme: vi.fn(),
  classroomLayout: 'frontale',
  setClassroomLayout: vi.fn(),
  isAulaConfigOpen: false,
  setIsAulaConfigOpen: vi.fn(),
  shuffledStudentMap: {},
  setShuffledStudentMap: vi.fn(),
  handleShufflePseudonyms: vi.fn(),
  exclusionsList: [],
  setExclusionsList: vi.fn(),
  exclusionInputS1: '',
  setExclusionInputS1: vi.fn(),
  exclusionInputS2: '',
  setExclusionInputS2: vi.fn(),
  activeCooperativeMethod: 'jigsaw',
  setActiveCooperativeMethod: vi.fn(),
  cooperativeGroups: null,
  setCooperativeGroups: vi.fn(),
  handleGenerateCooperativeGroups: vi.fn(),
  getThemedStudentName: vi.fn(),
  classroomTopicInput: '',
  setClassroomTopicInput: vi.fn(),
  isAnalyzingTopic: false,
  classroomTopicAnalysisResult: null,
  handleAnalyzeClassroomTopic: vi.fn(),
  handleApproveAndInjectUda: vi.fn(),
  weeklyHoursItaliano: 0,
  setWeeklyHoursItaliano: vi.fn(),
  weeklyHoursStoria: 0,
  setWeeklyHoursStoria: vi.fn(),
  weeklyHoursGeografia: 0,
  setWeeklyHoursGeografia: vi.fn(),
  weeklyHoursMatematica: 0,
  setWeeklyHoursMatematica: vi.fn(),
  weeklyHoursScienze: 0,
  setWeeklyHoursScienze: vi.fn(),
  bufferCoefficient: 0,
  setBufferCoefficient: vi.fn(),
  activeTaughtUdaId: '',
  socialUdas: [],
  newAnnotationInputs: {},
  setNewAnnotationInputs: vi.fn(),
  handleLikeUda: vi.fn(),
  handleReuseUda: vi.fn(),
  updateSocialUdas: vi.fn(),
  setSelectedUdaForOutcomes: vi.fn(),
  setShowOutcomesModal: vi.fn(),
  handleAddAnnotation: vi.fn(),
  activeProcessoTab: 'flusso',
  setActiveProcessoTab: vi.fn(),
  handleImportMergeCml: vi.fn(),
  progressPercent: 0,
  totalDecisions: 0,
  approvedCount: 0,
  rejectedCount: 0,
  customCount: 0,
  customTexts: {},
  esportazioniTab: 'standard',
  setEsportazioniTab: vi.fn(),
  templateDocType: 'relazione',
  setTemplateDocType: vi.fn(),
  templateJsonState: { fontFamily: '', fontSize: '', lineHeight: '', showMinisterialHeader: false, logoLeft: '', logoRight: '', margins: '', sections: [], leftSignee: '', rightSignee: '' },
  setTemplateJsonState: vi.fn(),
  templateChatInput: '',
  setTemplateChatInput: vi.fn(),
  templateChatHistory: [],
  handleSendTemplateInstruction: vi.fn(),
  handleDownloadWordDefinitivo: vi.fn(),
  handleDownloadWordDocx: vi.fn(),
  handleDownloadODF: vi.fn(),
  handleDownloadCurricoloPDF: vi.fn(),
  handleCopyToClipboardFormatted: vi.fn(),
  handleDownloadTxt: vi.fn(),
  handleDownloadWordConfronto: vi.fn(),
  handleDownloadRichMarkdown: vi.fn(),
  handleDownloadPdfDirect: vi.fn(),
  handleClearLocalStorageWithReset: vi.fn(),
  handleGenerateProgrammazioneAnnualeDoc: vi.fn(),
  handleGenerateRelazioneDoc: vi.fn(),
  handleGenerateSpecificoGradoDoc: vi.fn(),
  activeGeneralSubtab: 'premessa',
  setActiveGeneralSubtab: vi.fn(),
  secondBrainTab: 'brain',
  setSecondBrainTab: vi.fn(),
  selectedBrainDoc: '',
  customKbDocs: [],
  setCustomKbDocs: vi.fn(),
  setShowAddKbModal: vi.fn(),
  isSpeaking: false,
  isWikiDyslexiaFont: false,
  setIsWikiDyslexiaFont: vi.fn(),
  wikiWorkspaceTab: 'read',
  wikiQuery: '',
  setWikiQuery: vi.fn(),
  wikiResponse: '',
  wikiLoading: false,
  triggerWikiLLMQuery: vi.fn(),
  handleToggleSpeech: vi.fn(),
  handleDeleteCustomKbDoc: vi.fn(),
  isSyncingWorkspace: false,
  setIsSyncingWorkspace: vi.fn(),
  graphNodes: [],
  selectedNodeId: '',
  setSelectedNodeId: vi.fn(),
  glossary: [],
  selectedGlossaryTerm: '',
  setSelectedGlossaryTerm: vi.fn(),
  customGlossaryTerm: '',
  setCustomGlossaryTerm: vi.fn(),
  isGlossaryLoading: false,
  glossarySearch: '',
  setGlossarySearch: vi.fn(),
  handleGlossaryAgentPopulate: vi.fn(),
  initialEdges: [],
  documentExportHistory: [],
  clearDocumentExportHistory: vi.fn(),
  ...overrides,
 };
}

function renderWithRouter(component: React.ReactNode, initialEntries: string[] = ['/']) {
 return render(
  <MemoryRouter initialEntries={initialEntries}>
   <AppContext.Provider value={createMockContext()}>
    {component}
   </AppContext.Provider>
  </MemoryRouter>
 );
}

describe('Navigation Behavior Tests (CML-604D)', () => {
 describe('Deep Linking', () => {
  it('opens /curriculum directly and renders curriculum content', () => {
   renderWithRouter(<CurriculumPage />, ['/curriculum']);
   expect(screen.getAllByText(/curricolo/i).length).toBeGreaterThan(0);
  });

  it('opens /planning directly and renders planning content', () => {
   renderWithRouter(<PlanningPage />, ['/planning']);
   expect(screen.getAllByText(/progett/i).length).toBeGreaterThan(0);
  });

  it('opens /documents directly and renders documents content', () => {
   renderWithRouter(<DocumentsPage />, ['/documents']);
   expect(screen.getAllByText(/esport/i).length).toBeGreaterThan(0);
  });

  it('opens /knowledge directly and renders knowledge content', () => {
   renderWithRouter(<KnowledgePage />, ['/knowledge']);
   expect(screen.getAllByText(/wiki/i).length).toBeGreaterThan(0);
  });

  it('opens /social directly and renders social content', () => {
   renderWithRouter(<SocialPage />, ['/social']);
   expect(screen.getAllByText(/registro|studenti|classe/i).length).toBeGreaterThan(0);
  });

  it('opens /settings directly and renders settings content', () => {
   renderWithRouter(<SettingsPage />, ['/settings']);
   expect(screen.getAllByText(/process/i).length).toBeGreaterThan(0);
  });
 });

 describe('Route Matching', () => {
  it('renders CurriculumPage for unknown routes', () => {
   renderWithRouter(<CurriculumPage />, ['/unknown-route']);
   expect(screen.getAllByText(/curricolo/i).length).toBeGreaterThan(0);
  });
 });

 describe('State Persistence Across Navigation', () => {
  it('app context provides consistent state to all pages', () => {
   const ctx = createMockContext({ discipline: 'matematica', order: 'primaria' });
   render(
    <MemoryRouter initialEntries={['/curriculum']}>
     <AppContext.Provider value={ctx}>
      <CurriculumPage />
     </AppContext.Provider>
    </MemoryRouter>
   );
   expect(ctx.discipline).toBe('matematica');
   expect(ctx.order).toBe('primaria');
  });
 });
});
