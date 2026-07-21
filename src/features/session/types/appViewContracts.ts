import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import type { AppTab } from '../../navigation';
import type { GraphEdge, GraphNode } from '../../../lib/architectureGraph';
import type { CurricularLevel, DecisionStatus, Proposal, SchoolOrder, UdaModel, UserRole } from '../../../types/curriculum';

export type ActiveCurricoloView = 'home' | 'albero' | 'mappa' | 'popolamento';
export type ActiveProcessoTab = 'flusso' | 'verifica';
export type ActiveProgTab = 'home' | 'annuale' | 'uda' | 'certificazione' | 'social' | 'classe-home' | 'classe';
export type ClasseSubTab = 'registro' | 'strumenti' | 'pianificazione';
export type ProgettazioneMode = 'grid' | 'wizard';
export type RevisioneMode = 'list' | 'wizard';
export type PopolamentoTab = 'copilot' | 'csv' | 'security';
export type TemplateTab = 'standard' | 'template';
export type TemplateDocType = 'relazione' | 'uda' | 'greci';
export type SecondBrainTab = 'brain' | 'graph' | 'glossary';
export type WikiWorkspaceTab = 'read' | 'chat';
export type ClassTheme = 'scientists' | 'classico' | 'miti';
export type ClassroomLayout = 'frontale' | 'isole' | 'circle';
export type CooperativeMethod = 'jigsaw' | 'peertutoring' | 'laboratorio';

export type CurriculumMap = Record<string, Record<SchoolOrder, CurricularLevel>>;

export interface GeneratedKnowledgeOutput {
  traguardi: string[];
  obiettivi: string[];
  evidenze: string[];
}

export interface TemplateSection {
  id: string;
  title: string;
  enabled: boolean;
}

export interface TemplateJsonState {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  showMinisterialHeader: boolean;
  logoLeft: string;
  logoRight: string;
  margins: string;
  sections: TemplateSection[];
  leftSignee: string;
  rightSignee: string;
}

export interface TemplateChatMessage {
  sender: 'user' | 'assistant';
  text: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  subtitle: string;
  content: string;
}

export interface GlossaryEntry {
  term: string;
  definition: string;
  source: string;
}

export interface ClassroomFeedback {
  id: string;
  name: string;
  level: 'avanzato' | 'intermedio' | 'base' | 'iniziale';
  stars: number;
  obs: string;
}

export interface ClassroomStudent {
  id: string;
  name: string;
  nome?: string;
  token?: string;
  diagnosis?: string;
  maskedDiagnosis?: string;
  osiLevel?: string;
}

export interface ExclusionPair {
  s1: string;
  s2: string;
}

export interface CooperatmvePeerPamr {
  name: string;
  tutor: string;
  tutee: string;
  task: string;
}

export interface CooperatmveGroupMember {
  id: string;
  role: string;
  task: string;
}

export interface CooperatmveLearnmngGroup {
  name: string;
  members: CooperatmveGroupMember[];
}

export type CooperativeGroup =
  | { method: 'peertutoring'; list: CooperatmvePeerPamr[] }
  | { method: Exclude<CooperativeMethod, 'peertutoring'>; list: CooperatmveLearnmngGroup[] };

export type ClassroomTopicAnalysisResult =
  | {
      type: 'link';
      uda: UdaModel;
      title?: string;
      summary?: string;
    }
  | {
      type: 'proposal';
      id: string;
      title: string;
      discipline: string;
      order: SchoolOrder;
      period: string;
      hours: number;
      traguardi: string[];
      obiettivi: string[];
      evidenze: string[];
      realTask: string;
      notes: string;
      summary?: string;
      suggestedUda?: Partial<UdaModel>;
    };

export type SocialUda = Omit<UdaModel, 'status' | 'createdAt'> & {
  author: string;
  likes: number;
  likedByMe: boolean;
  annotations: Array<{ author: string; text: string }>;
  reusedCount?: number;
  selfEvaluation?: number;
  studentOutcomes?: {
    avanzato: number;
    intermedio: number;
    base: number;
    iniziale: number;
  };
};

export type AnnotationInputs = Record<string, string>;
export type ToastHandler = (msg: string, success?: boolean) => void;
export type ProgStatus = 'bozza' | 'in revisione' | 'pronta per confronto';
export type LibrarySorting = 'recenti' | 'meno_recenti' | 'az' | 'disc_az';

export interface AppViewsLayerProps {
  activeTab: AppTab;
  role: UserRole;
  savedUda: UdaModel[];
  decisions: Record<string, DecisionStatus>;
  handleDownloadCml: () => void;
  handleTabSwitch: (tab: AppTab) => void;
  setSelectedBrainDoc: (value: string) => void;
  setWikiWorkspaceTab: (value: WikiWorkspaceTab) => void;
  setShowSaveModal: (value: boolean) => void;
  setActiveCurricoloView: (view: ActiveCurricoloView) => void;
  setActiveProgTab: (tab: ActiveProgTab) => void;
  localCurriculum: CurriculumMap;
  showOnlyProfileCurriculum: boolean;
  setShowOnlyProfileCurriculum: (value: boolean) => void;
  expandedMapSections: Record<string, boolean>;
  setExpandedMapSections: Dispatch<SetStateAction<Record<string, boolean>>>;
  showOnlyProfileProcesso: boolean;
  setShowOnlyProfileProcesso: (value: boolean) => void;
  importTopicInput: string;
  setImportTopicInput: (value: string) => void;
  isGeneratingKB: boolean;
  generatedKBOuput: GeneratedKnowledgeOutput | null;
  localAgentStatus: string;
  localAgentSize: string;
  popolamentoTab: PopolamentoTab;
  setPopolamentoTab: (value: PopolamentoTab) => void;
  setShowAgentSetupModal: (value: boolean) => void;
  handleAiGenerateCurriculum: () => void;
  handleSaveGeneratedToKB: () => void;
  handleCSVUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  handleResetCurriculumToBaseline: () => void;
  currentDisciplineProps: Proposal[];
  currentDisciplineDecided: number;
  revisioneMode: RevisioneMode;
  setRevisioneMode: (value: RevisioneMode) => void;
  revisioneWizardIndex: number;
  setRevisioneWizardIndex: Dispatch<SetStateAction<number>>;
  targetClass: string;
  setTargetClass: (value: string) => void;
  targetSection: string;
  setTargetSection: (value: string) => void;
  assignedCombinations: string[];
  progettazioneMode: ProgettazioneMode;
  setProgettazioneMode: (value: ProgettazioneMode) => void;
  wizardStep: number;
  setWizardStep: (value: number) => void;
  progTitle: string;
  setProgTitle: (value: string) => void;
  progPeriod: string;
  setProgPeriod: (value: string) => void;
  progHours: number;
  setProgHours: (value: number) => void;
  progStatus: ProgStatus;
  setProgStatus: Dispatch<SetStateAction<ProgStatus>>;
  progNotes: string;
  setProgNotes: Dispatch<SetStateAction<string>>;
  realTaskInput: string;
  setRealTaskInput: (value: string) => void;
  progCoAuthors: string;
  setProgCoAuthors: (value: string) => void;
  branchFocusHighlight: boolean;
  toggleBranchFocusHighlight: () => void;
  tepBannerVisible: boolean;
  setTepBannerVisible: (value: boolean) => void;
  setTepBannerDismissed: (value: boolean) => void;
  handleTepSwitchToWizard: () => void;
  handleTepSimplifyGrid: () => void;
  anticipatedFields: string[];
  confirmAnticipatedField: (field: string) => void;
  applyAnticipatoryPrefill: () => void;
  saveProgDraft: () => void;
  handleGenerateUda: () => void;
  compileProgPreviewText: () => string;
  handleTriggerGemSuggestion: (field: string) => void;
  handleBack: () => void;
  handleNext: () => void;
  handleLoadSuggestedUda: (id: string) => void;
  handleCloneUdaAdaptive: (uda: UdaModel) => void;
  copyUdaTextLocal: (id: string) => void;
  handleShareUdaToSocial: (id: string) => void;
  handleApplyLibFilters: (uda: UdaModel) => boolean;
  handleSortUdaList: (a: UdaModel, b: UdaModel) => number;
  handleClearLibFilters: () => void;
  libFilterClass: string;
  setLibFilterClass: (value: string) => void;
  libFilterPeriod: string;
  setLibFilterClassPeriod: (value: string) => void;
  libFilterStatus: string;
  setLibFilterClassStatus: (value: string) => void;
  libSearchText: string;
  setLibSearchText: (value: string) => void;
  libSorting: LibrarySorting;
  setLibSorting: Dispatch<SetStateAction<LibrarySorting>>;
  setSelectedUda: (uda: UdaModel | null) => void;
  classeSubTab: ClasseSubTab;
  setClasseSubTab: (value: ClasseSubTab) => void;
  selectedEvidenze: string[];
  activeCompetencyExplorer: string | null;
  setActiveCompetencyExplorer: (value: string | null) => void;
  showToast: ToastHandler;
  getDisciplineIcon: (discipline: string) => string;
  getDisciplineLabel: (discipline: string, order?: SchoolOrder) => string;
  selectedClassCombination: string;
  setSelectedClassCombination: (value: string) => void;
  classroomStudents: ClassroomStudent[];
  setClassroomStudents: Dispatch<SetStateAction<ClassroomStudent[]>>;
  showAiSimulatedResponse: boolean;
  setShowAiSimulatedResponse: (value: boolean) => void;
  isClassroomLoading: boolean;
  setIsClassroomLoading: (value: boolean) => void;
  classroomStudentFeedback: ClassroomFeedback[];
  setClassroomStudentFeedback: (value: ClassroomFeedback[]) => void;
  selectedStudentForFeedback: ClassroomFeedback | null;
  setSelectedStudentForFeedback: (value: ClassroomFeedback | null) => void;
  showClassroomReport: boolean;
  setShowClassroomReport: (value: boolean) => void;
  activeClassTheme: ClassTheme;
  setActiveClassTheme: (value: ClassTheme) => void;
  classroomLayout: ClassroomLayout;
  setClassroomLayout: (value: ClassroomLayout) => void;
  isAulaConfigOpen: boolean;
  setIsAulaConfigOpen: (value: boolean) => void;
  shuffledStudentMap: Record<string, string> | null;
  setShuffledStudentMap: Dispatch<SetStateAction<Record<string, string> | null>>;
  handleShufflePseudonyms: () => void;
  exclusionsList: ExclusionPair[];
  setExclusionsList: Dispatch<SetStateAction<ExclusionPair[]>>;
  exclusionInputS1: string;
  setExclusionInputS1: (value: string) => void;
  exclusionInputS2: string;
  setExclusionInputS2: (value: string) => void;
  activeCooperativeMethod: CooperativeMethod;
  setActiveCooperativeMethod: (value: CooperativeMethod) => void;
  cooperativeGroups: CooperativeGroup | null;
  setCooperativeGroups: (value: CooperativeGroup | null) => void;
  handleGenerateCooperativeGroups: () => void;
  getThemedStudentName: (studentId: string) => string;
  classroomTopicInput: string;
  setClassroomTopicInput: (value: string) => void;
  isAnalyzingTopic: boolean;
  classroomTopicAnalysisResult: ClassroomTopicAnalysisResult | null;
  handleAnalyzeClassroomTopic: () => void;
  handleApproveAndInjectUda: () => void;
  weeklyHoursItaliano: number;
  setWeeklyHoursItaliano: (value: number) => void;
  weeklyHoursStoria: number;
  setWeeklyHoursStoria: (value: number) => void;
  weeklyHoursGeografia: number;
  setWeeklyHoursGeografia: (value: number) => void;
  weeklyHoursMatematica: number;
  setWeeklyHoursMatematica: (value: number) => void;
  weeklyHoursScienze: number;
  setWeeklyHoursScienze: (value: number) => void;
  bufferCoefficient: number;
  setBufferCoefficient: (value: number) => void;
  activeTaughtUdaId: string;
  socialUdas: SocialUda[];
  newAnnotationInputs: AnnotationInputs;
  setNewAnnotationInputs: Dispatch<SetStateAction<AnnotationInputs>>;
  handleLikeUda: (id: string) => void;
  handleReuseUda: (sharedUda: SocialUda) => void;
  updateSocialUdas: (newList: SocialUda[]) => void;
  setSelectedUdaForOutcomes: (uda: SocialUda | null) => void;
  setShowOutcomesModal: (value: boolean) => void;
  handleAddAnnotation: (udaId: string) => void;
  activeProcessoTab: ActiveProcessoTab;
  setActiveProcessoTab: (tab: ActiveProcessoTab) => void;
  handleImportMergeCml: (event: ChangeEvent<HTMLInputElement>) => void;
  progressPercent: number;
  totalDecisions: number;
  approvedCount: number;
  rejectedCount: number;
  customCount: number;
  discipline: string;
  order: SchoolOrder;
  customTexts: Record<string, string>;
  esportazioniTab: TemplateTab;
  setEsportazioniTab: (tab: TemplateTab) => void;
  templateDocType: TemplateDocType;
  setTemplateDocType: (type: TemplateDocType) => void;
  templateJsonState: TemplateJsonState;
  setTemplateJsonState: Dispatch<SetStateAction<TemplateJsonState>>;
  templateChatInput: string;
  setTemplateChatInput: (value: string) => void;
  templateChatHistory: TemplateChatMessage[];
  handleSendTemplateInstruction: (text: string) => void;
  handleDownloadWordDefinitivo: () => void;
  handleDownloadWordDocx: () => void;
  handleDownloadODF: () => void;
  handleDownloadCurricoloPDF: () => void;
  handleCopyToClipboardFormatted: () => void;
  handleDownloadTxt: () => void;
  handleDownloadWordConfronto: () => void;
  handleDownloadRichMarkdown: () => void;
  handleDownloadPdfDirect: () => void;
  handleClearLocalStorageWithReset: () => void;
  handleGenerateProgrammazioneAnnualeDoc: () => void;
  handleGenerateRelazioneDoc: () => void;
  handleGenerateSpecificoGradoDoc: () => void;
  activeGeneralSubtab: 'premessa' | 'riforma' | 'obiettivi' | 'livelli';
  setActiveGeneralSubtab: (subtab: 'premessa' | 'riforma' | 'obiettivi' | 'livelli') => void;
  secondBrainTab: SecondBrainTab;
  setSecondBrainTab: (tab: SecondBrainTab) => void;
  selectedBrainDoc: string;
  customKbDocs: KnowledgeDocument[];
  setCustomKbDocs: Dispatch<SetStateAction<KnowledgeDocument[]>>;
  setShowAddKbModal: (value: boolean) => void;
  isSpeaking: boolean;
  isWikiDyslexiaFont: boolean;
  setIsWikiDyslexiaFont: (value: boolean) => void;
  wikiWorkspaceTab: WikiWorkspaceTab;
  wikiQuery: string;
  setWikiQuery: (value: string) => void;
  wikiResponse: string | null;
  wikiLoading: boolean;
  triggerWikiLLMQuery: (query: string) => void;
  handleToggleSpeech: (text: string) => void;
  handleDeleteCustomKbDoc: (id: string) => void;
  isSyncingWorkspace: boolean;
  setIsSyncingWorkspace: (value: boolean) => void;
  graphNodes: GraphNode[];
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  glossary: GlossaryEntry[];
  selectedGlossaryTerm: string;
  setSelectedGlossaryTerm: (value: string) => void;
  customGlossaryTerm: string;
  setCustomGlossaryTerm: (value: string) => void;
  isGlossaryLoading: boolean;
  glossarySearch: string;
  setGlossarySearch: (value: string) => void;
  handleGlossaryAgentPopulate: (term: string) => void;
  initialEdges: GraphEdge[];
}
