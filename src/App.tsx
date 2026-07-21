import { useState } from 'react';
import { Suspense } from 'react';
import { Check } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useCurriculumStore } from './store/useCurriculumStore';
import { SchoolOrder, UdaModel } from './types/curriculum';
import { AppModalsLayer, useAppLocalHandlers, useAppStartupEffects, useAppWorkflowState, useOnboardingProfile, useSessionUiState, useToast, type AppModalsLayerProps, type AppViewsLayerProps } from './features/session';
import { CopilotChatSidebar, useCopilotInteractionHandlers, useLocalAgentSetup } from './features/copilot';
import { AppHeader, AppSidebar, GlobalAlerts, MobileBottomNav, type AppTab } from './features/navigation';
import { AppContext, type AppContextValue } from './components/layout/AppContext';
import { initialEdges, initialNodes } from './lib/architectureGraph';
import { safeLocalStorageSetItem } from './lib/consolidatedStorage';
import { getDisciplineIcon, getDisciplineLabel, orderLabelsForMap } from './lib/disciplineLabels';
import { useClassroomSocialHandlers, useClassroomSocialState } from './features/classroom';
import { useBackupHandlers, useDocumentExportHandlers, useKnowledgeBaseHandlers, useResetSpeechOnContextChange, useTemplateEngine, useUdaPackageHandlers, useWikiGlossaryHandlers } from './features/documents';
import { useCurriculumImportHandlers, useCurriculumProgressStats, useLocalCurriculum } from './features/curriculum';
import { useProgettazioneAssistiveHandlers, useUdaProgrammingHandlers } from './features/progettazione';
import { useSessionAutoSave, useWorkspaceState, useWorkspaceSyncHandlers } from './features/workspace';
import { copyText } from './lib/clipboard';
import { getRoleLabel } from './lib/roleLabels';

export default function App() {
 // Store actions and state
 const {
  role, discipline, order, schoolYear, decisions, customTexts, savedUda,
  selectedTraguardi, selectedObiettivi, selectedEvidenze,
  activeProgTab, activeCurricoloView, activeProcessoTab, activeGeneralSubtab,
  setRole, setDiscipline, setOrder, setDecision, setCustomText,
  addUda,
  setActiveProgTab, setActiveCurricoloView, setActiveProcessoTab, setActiveGeneralSubtab,
  resetAll, restoreBackupState
 } = useCurriculumStore();

 const {
  localCurriculum,
  setLocalCurriculum
 } = useLocalCurriculum();

 const {
  cloudAccountType,
  setCloudAccountType,
  showCloudAccountModal,
  setShowCloudAccountModal,
  personalUserEmail,
  setPersonalUserEmail,
  isWorkspaceLoggedIn,
  setIsWorkspaceLoggedIn,
  workspaceUserEmail,
  setWorkspaceUserEmail,
  isSyncingWorkspace,
  setIsSyncingWorkspace,
  workspaceAccessToken,
  setWorkspaceAccessToken,
  workspaceTokenExpiry,
  setWorkspaceTokenExpiry,
  isWorkspaceSyncLocked,
  setIsWorkspaceSyncLocked,
  isFileProtocol,
  setIsFileProtocol,
  workspaceClientId,
  setWorkspaceClientId
 } = useWorkspaceState();
 const {
  showOnlyProfileCurriculum,
  setShowOnlyProfileCurriculum,
  showOnlyProfileProcesso,
  setShowOnlyProfileProcesso,
  isDatabaseVolatile,
  setIsDatabaseVolatile,
  isWikiDyslexiaFont,
  setIsWikiDyslexiaFont,
  popolamentoTab,
  setPopolamentoTab,
  expandedMapSections,
  setExpandedMapSections,
  isCopilotChatOpen,
  setIsCopilotChatOpen,
  roleDropdownOpen,
  setRoleDropdownOpen,
  showSaveModal,
  setShowSaveModal,
  showMottoModal,
  setShowMottoModal,
  showOnboardingModal,
  setShowOnboardingModal,
  showWikiReaderModal,
  setShowWikiReaderModal,
  selectedUda,
  setSelectedUda,
  generatedDocTitle,
  setGeneratedDocTitle,
  generatedDocText,
  setGeneratedDocText,
  showTourModal,
  setShowTourModal
 } = useSessionUiState({ order });

 const {
  socialUdas,
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
 } = useClassroomSocialState();

 const {
  toastMessage,
  toastSuccess,
  showToast
 } = useToast();

 const {
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
 } = useAppWorkflowState({ initialNodes });

 const {
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
 } = useUdaProgrammingHandlers({
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
 });

 const {
  handleBack,
  handleNext,
  handleClearLocalStorageWithReset,
  triggerPwaInstall
 } = useAppLocalHandlers({
  wizardStep,
  setWizardStep,
  progTitle,
  resetAll,
  showToast
 });

 const {
  branchFocusHighlight,
  toggleBranchFocusHighlight,
  tepBannerVisible,
  setTepBannerVisible,
  setTepBannerDismissed,
  handleTepSwitchToWizard,
  handleTepSimplifyGrid,
  anticipatedFields,
  confirmAnticipatedField,
  applyAnticipatoryPrefill,
  handleCloneUdaAdaptive
 } = useProgettazioneAssistiveHandlers({
  savedUda,
  localCurriculum,
  order,
  targetClass,
  targetSection,
  progNotes,
  setProgNotes,
  realTaskInput,
  setRealTaskInput,
  addUda,
  setProgettazioneMode,
  showToast
 });

 const {
  assignedCombinations,
  onboardingRole,
  setOnboardingRoleLocal,
  onboardingDisc,
  setOnboardingDiscLocal,
  onboardingOrd,
  setOnboardingOrdLocal,
  onboardingStep,
  setOnboardingStep,
  onboardingCombinations,
  setOnboardingCombinations,
  onboardingIsSostegno,
  setOnboardingIsSostegno,
  availableSections,
  setAvailableSections,
  newSectionInput,
  setNewSectionInput,
  handleSetOnboardingOrdLocal,
  handleToggleOnboardingCombination,
  handleAddSectionLocal,
  saveOnboardingProfile
 } = useOnboardingProfile({
  order,
  setRole,
  setDiscipline,
  setOrder,
  setShowOnboardingModal,
  showToast
 });

 const {
  stateRef,
  handleRestoreFromLocalEmergencyStorage
 } = useSessionAutoSave({
  localCurriculum,
  savedUda,
  decisions,
  customTexts,
  schoolYear,
  role,
  discipline,
  order,
  isWorkspaceLoggedIn,
  workspaceAccessToken,
  isWorkspaceSyncLocked,
  restoreBackupState,
  showToast
 });

 const {
  localAgentStatus,
  setLocalAgentStatus,
  localAgentType,
  setLocalAgentType,
  ollamaServerUrl,
  setOllamaServerUrl,
  ollamaModelName,
  setOllamaModelName,
  ollamaStatus,
  setOllamaStatus,
  localAgentProgress,
  setLocalAgentProgress,
  localAgentSize,
  setLocalAgentSize,
  showAgentSetupModal,
  setShowAgentSetupModal,
  activeHelpModel,
  setActiveHelpModel,
  agentIntervalRefs,
  detectedDeviceType,
  handleTestOllamaConnection
 } = useLocalAgentSetup({ showToast });

 const {
  importTopicInput,
  setImportTopicInput,
  isGeneratingKB,
  generatedKBOuput,
  handleAiGenerateCurriculum,
  handleSaveGeneratedToKB,
  handleCSVUpload,
  handleResetCurriculumToBaseline
 } = useCurriculumImportHandlers({
  localCurriculum,
  setLocalCurriculum,
  discipline,
  order,
  showToast
 });

 const {
  selectedBrainDoc,
  setSelectedBrainDoc,
  customKbDocs,
  setCustomKbDocs,
  newKbDocTitle,
  setNewKbDocTitle,
  newKbDocSubtitle,
  setNewKbDocSubtitle,
  newKbDocContent,
  setNewKbDocContent,
  showAddKbModal,
  setShowAddKbModal,
  isSpeaking,
  setIsSpeaking,
  handleToggleSpeech,
  handleAddCustomKbDoc,
  handleDeleteCustomKbDoc,
  getVolumeTitleWithCustom,
  getVolumeFullHtmlWithCustom,
  getVolumePlainTxtWithCustom
 } = useKnowledgeBaseHandlers({ showToast });
 const {
  wikiQuery,
  setWikiQuery,
  secondBrainTab,
  setSecondBrainTab,
  wikiWorkspaceTab,
  setWikiWorkspaceTab,
  wikiResponse,
  wikiLoading,
  glossary,
  selectedGlossaryTerm,
  setSelectedGlossaryTerm,
  customGlossaryTerm,
  setCustomGlossaryTerm,
  isGlossaryLoading,
  glossarySearch,
  setGlossarySearch,
  triggerWikiLLMQuery,
  handleGlossaryAgentPopulate
 } = useWikiGlossaryHandlers({
  discipline,
  order,
  customKbDocs,
  getVolumeTitleWithCustom,
  showToast
 });

 // Derive activeTab from URL (React Router)
 const location = useLocation();
 const navigate = useNavigate();

 const pathnameToTab = (pathname: string): AppTab => {
  if (pathname.startsWith('/curriculum') || pathname.startsWith('/revisione')) return 'curricolo';
  if (pathname.startsWith('/classroom')) return 'progetta-annuale';
  if (pathname.startsWith('/planning')) return 'progetta-annuale';
  if (pathname.startsWith('/documents')) return 'esportazioni';
  if (pathname.startsWith('/copilot')) return 'dashboard';
  if (pathname.startsWith('/knowledge') || pathname.startsWith('/second-brain')) return 'second-brain';
  if (pathname.startsWith('/social')) return 'dashboard';
  if (pathname.startsWith('/settings') || pathname.startsWith('/fonti')) return 'fonti';
  if (pathname.startsWith('/guida')) return 'guida';
  if (pathname.startsWith('/onboarding')) return 'dashboard';
  return 'dashboard';
 };

 const activeTab = pathnameToTab(location.pathname);
 const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

 const toggleSidebar = () => {
  if (window.innerWidth < 768) {
   const sidebar = document.getElementById('sidebar');
   if (sidebar) {
    if (sidebar.classList.contains('hidden')) {
     sidebar.className = "fixed inset-y-16 left-4 bg-white border-2 border-slate-200 shadow-2xl z-40 p-4 rounded-2xl w-[280px] space-y-4 overflow-y-auto fade-in block";
    } else {
     sidebar.className = "hidden md:block w-full md:w-64 shrink-0 space-y-4 transition-all duration-300";
    }
   }
  } else {
   setSidebarCollapsed(prev => !prev);
  }
 };

 const tabToPath = (tab: AppTab): string => {
  switch (tab) {
   case 'curricolo': return '/curriculum';
   case 'revisione': return '/curriculum';
   case 'progetta-annuale': return '/planning';
   case 'processo': return '/planning';
   case 'esportazioni': return '/documents';
   case 'certificazione-pa': return '/documents';
   case 'second-brain': return '/knowledge';
   case 'fonti': return '/settings';
   case 'guida': return '/guida';
   case 'dashboard':
   default: return '/';
  }
 };

 const handleTabSwitch = (tab: AppTab) => {
  navigate(tabToPath(tab));
  // Close mobile sidebar
  if (window.innerWidth < 768) {
   const sidebar = document.getElementById('sidebar');
   if (sidebar) {
    sidebar.className = "hidden md:block w-full md:w-64 shrink-0 space-y-4 transition-all duration-300";
   }
  }
  // Reset scroll
  const mainEl = document.getElementById('main-content');
  if (mainEl) mainEl.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'auto' });
  document.body.scrollTop = 0;
  if (document.documentElement) document.documentElement.scrollTop = 0;
 };

 useResetSpeechOnContextChange({
  selectedBrainDoc,
  activeTab,
  setIsSpeaking
 });

 const {
  copilotChatInput,
  setCopilotChatInput,
  copilotChatHistory,
  isCopilotResponding,
  isVoiceListening,
  showMicPermissionGuide,
  setShowMicPermissionGuide,
  ttsPlayingState,
  ttsActiveMsgIndex,
  gemFieldActive,
  setGemFieldActive,
  gemSuggestedText,
  setGemSuggestedText,
  isGemGenerating,
  handleSendCopilotMessage,
  getModelRecommendation,
  handleTriggerGemSuggestion,
  handleAcceptGemSuggestion,
  checkModelRamSafety,
  handleToggleVoiceTyping,
  handleSpeakController,
  handleSelectCopilotChip
 } = useCopilotInteractionHandlers({
  activeTab,
  activeProgTab,
  detectedDeviceType,
  discipline,
  order,
  getDisciplineLabel,
  setProgTitle,
  setRealTaskInput,
  setProgNotes,
  selectedStudentForFeedback,
  classroomStudentFeedback,
  setClassroomStudentFeedback,
  setSelectedStudentForFeedback,
  showToast
 });

 const {
  copyUdaTextLocal,
  copyUdaForRegister,
  handleDownloadScormManifest
 } = useUdaPackageHandlers({
  savedUda,
  targetClass,
  targetSection,
  showToast
 });
 const {
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
 } = useClassroomSocialHandlers({
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
 });

 const {
  handleWorkspaceLogin,
  handleWorkspaceSync,
  handleLocalDriveSync,
  handleWorkspaceLogout,
  handleWorkspaceAutoPull
 } = useWorkspaceSyncHandlers({
  isWorkspaceLoggedIn,
  workspaceAccessToken,
  cloudAccountType,
  schoolYear,
  localCurriculum,
  savedUda,
  decisions,
  customTexts,
  role,
  discipline,
  order,
  stateRef,
  restoreBackupState,
  setIsSyncingWorkspace,
  setCloudAccountType,
  setShowCloudAccountModal,
  setIsWorkspaceLoggedIn,
  setWorkspaceAccessToken,
  setWorkspaceUserEmail,
  setIsWorkspaceSyncLocked,
  showToast
 });

 useAppStartupEffects({
  role,
  discipline,
  order,
  assignedCombinations,
  setIsDatabaseVolatile,
  setProgettazioneMode,
  setIsFileProtocol,
  setWorkspaceAccessToken,
  setWorkspaceTokenExpiry,
  setIsWorkspaceLoggedIn,
  setWorkspaceUserEmail,
  setCloudAccountType,
  setOnboardingRoleLocal,
  setOnboardingDiscLocal,
  setOnboardingOrdLocal,
  setShowOnboardingModal,
  showToast,
  handleWorkspaceAutoPull
 });
 const {
  totalDecisions,
  approvedCount,
  rejectedCount,
  customCount,
  progressPercent,
  pendingCount,
  currentDisciplineProps,
  currentDisciplineDecided
 } = useCurriculumProgressStats({
  localCurriculum,
  decisions,
  discipline,
  order
 });

 const {
  handleDownloadWordDefinitivo,
  handleDownloadWordDocx,
  handleDownloadODF,
  handlePrintDocumentPdf,
  handleDownloadCurricoloPDF,
  handleDownloadRichMarkdown,
  handleDownloadPdfDirect,
  handleDownloadWordConfronto,
  handleCopyToClipboardFormatted,
  handleDownloadTxt,
  handleDownloadCml,
  handleGenerateProgrammazioneAnnualeDoc,
  handleGenerateRelazioneDoc,
  handleGenerateSpecificoGradoDoc
 } = useDocumentExportHandlers({
  localCurriculum,
  decisions,
  customTexts,
  schoolYear,
  discipline,
  order,
  role,
  selectedTraguardi,
  selectedObiettivi,
  selectedEvidenze,
  savedUda,
  targetClass,
  targetSection,
  showToast,
  getDisciplineLabel,
  setGeneratedDocTitle,
  setGeneratedDocText
 });
 const {
  esportazioniTab,
  setEsportazioniTab,
  templateDocType,
  setTemplateDocType,
  templateJsonState,
  setTemplateJsonState,
  templateChatInput,
  setTemplateChatInput,
  templateChatHistory,
  handleSendTemplateInstruction
 } = useTemplateEngine({ showToast });

 const {
  handleImportMergeCml,
  handleDownloadBackup,
  handleRestoreBackup
 } = useBackupHandlers({
  schoolYear,
  setDecision,
  setCustomText,
  restoreBackupState,
  setShowSaveModal,
  showToast
 });
 const appViewsLayerProps: AppViewsLayerProps = {
  activeTab,
  role,
  savedUda,
  decisions,
  handleDownloadCml,
  handleTabSwitch,
  setSelectedBrainDoc,
  setWikiWorkspaceTab,
  setShowSaveModal,
  setActiveCurricoloView,
  setActiveProgTab,
  localCurriculum,
  showOnlyProfileCurriculum,
  setShowOnlyProfileCurriculum,
  expandedMapSections,
  setExpandedMapSections,
  showOnlyProfileProcesso,
  setShowOnlyProfileProcesso,
  importTopicInput,
  setImportTopicInput,
  isGeneratingKB,
  generatedKBOuput,
  localAgentStatus,
  localAgentSize,
  popolamentoTab,
  setPopolamentoTab,
  setShowAgentSetupModal,
  handleAiGenerateCurriculum,
  handleSaveGeneratedToKB,
  handleCSVUpload,
  handleResetCurriculumToBaseline,
  currentDisciplineProps,
  currentDisciplineDecided,
  revisioneMode,
  setRevisioneMode,
  revisioneWizardIndex,
  setRevisioneWizardIndex,
  targetClass,
  setTargetClass,
  targetSection,
  setTargetSection,
  assignedCombinations,
  progettazioneMode,
  setProgettazioneMode,
  wizardStep,
  setWizardStep,
  progTitle,
  setProgTitle,
  progPeriod,
  setProgPeriod,
  progHours,
  setProgHours,
  progStatus,
  setProgStatus,
  progNotes,
  setProgNotes,
  realTaskInput,
  setRealTaskInput,
  progCoAuthors,
  setProgCoAuthors,
  branchFocusHighlight,
  toggleBranchFocusHighlight,
  tepBannerVisible,
  setTepBannerVisible,
  setTepBannerDismissed,
  handleTepSwitchToWizard,
  handleTepSimplifyGrid,
  anticipatedFields,
  confirmAnticipatedField,
  applyAnticipatoryPrefill,
  saveProgDraft,
  handleGenerateUda,
  compileProgPreviewText,
  handleTriggerGemSuggestion,
  handleBack,
  handleNext,
  handleLoadSuggestedUda,
  handleCloneUdaAdaptive,
  copyUdaTextLocal,
  handleShareUdaToSocial,
  handleApplyLibFilters,
  handleSortUdaList,
  handleClearLibFilters,
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
  setSelectedUda,
  classeSubTab,
  setClasseSubTab,
  selectedEvidenze,
  activeCompetencyExplorer,
  setActiveCompetencyExplorer,
  showToast,
  getDisciplineIcon,
  getDisciplineLabel,
  selectedClassCombination,
  setSelectedClassCombination,
  classroomStudents,
  setClassroomStudents,
  showAiSimulatedResponse,
  setShowAiSimulatedResponse,
  isClassroomLoading,
  setIsClassroomLoading,
  classroomStudentFeedback,
  setClassroomStudentFeedback,
  selectedStudentForFeedback,
  setSelectedStudentForFeedback,
  showClassroomReport,
  setShowClassroomReport,
  activeClassTheme,
  setActiveClassTheme,
  classroomLayout,
  setClassroomLayout,
  isAulaConfigOpen,
  setIsAulaConfigOpen,
  shuffledStudentMap,
  setShuffledStudentMap,
  handleShufflePseudonyms,
  exclusionsList,
  setExclusionsList,
  exclusionInputS1,
  setExclusionInputS1,
  exclusionInputS2,
  setExclusionInputS2,
  activeCooperativeMethod,
  setActiveCooperativeMethod,
  cooperativeGroups,
  setCooperativeGroups,
  handleGenerateCooperativeGroups,
  getThemedStudentName,
  classroomTopicInput,
  setClassroomTopicInput,
  isAnalyzingTopic,
  classroomTopicAnalysisResult,
  handleAnalyzeClassroomTopic,
  handleApproveAndInjectUda,
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
  activeTaughtUdaId,
  socialUdas,
  newAnnotationInputs,
  setNewAnnotationInputs,
  handleLikeUda,
  handleReuseUda,
  updateSocialUdas,
  setSelectedUdaForOutcomes,
  setShowOutcomesModal,
  handleAddAnnotation,
  activeProcessoTab,
  setActiveProcessoTab,
  handleImportMergeCml,
  progressPercent,
  totalDecisions,
  approvedCount,
  rejectedCount,
  customCount,
  discipline,
  order,
  customTexts,
  esportazioniTab,
  setEsportazioniTab,
  templateDocType,
  setTemplateDocType,
  templateJsonState,
  setTemplateJsonState,
  templateChatInput,
  setTemplateChatInput,
  templateChatHistory,
  handleSendTemplateInstruction,
  handleDownloadWordDefinitivo,
  handleDownloadWordDocx,
  handleDownloadODF,
  handleDownloadCurricoloPDF,
  handleCopyToClipboardFormatted,
  handleDownloadTxt,
  handleDownloadWordConfronto,
  handleDownloadRichMarkdown,
  handleDownloadPdfDirect,
  handleClearLocalStorageWithReset,
  handleGenerateProgrammazioneAnnualeDoc,
  handleGenerateRelazioneDoc,
  handleGenerateSpecificoGradoDoc,
  activeGeneralSubtab,
  setActiveGeneralSubtab,
  secondBrainTab,
  setSecondBrainTab,
  selectedBrainDoc,
  customKbDocs,
  setCustomKbDocs,
  setShowAddKbModal,
  isSpeaking,
  isWikiDyslexiaFont,
  setIsWikiDyslexiaFont,
  wikiWorkspaceTab,
  wikiQuery,
  setWikiQuery,
  wikiResponse,
  wikiLoading,
  triggerWikiLLMQuery,
  handleToggleSpeech,
  handleDeleteCustomKbDoc,
  isSyncingWorkspace,
  setIsSyncingWorkspace,
  graphNodes,
  selectedNodeId,
  setSelectedNodeId,
  glossary,
  selectedGlossaryTerm,
  setSelectedGlossaryTerm,
  customGlossaryTerm,
  setCustomGlossaryTerm,
  isGlossaryLoading,
  glossarySearch,
  setGlossarySearch,
  handleGlossaryAgentPopulate,
  initialEdges
 };

 const appModalsLayerProps: AppModalsLayerProps = {
  showAgentSetupModal,
  setShowAgentSetupModal,
  detectedDeviceType,
  localAgentType,
  setLocalAgentType,
  localAgentStatus,
  setLocalAgentStatus,
  localAgentSize,
  setLocalAgentSize,
  localAgentProgress,
  setLocalAgentProgress,
  activeHelpModel,
  setActiveHelpModel,
  ollamaServerUrl,
  setOllamaServerUrl,
  ollamaModelName,
  setOllamaModelName,
  ollamaStatus,
  setOllamaStatus,
  handleTestOllamaConnection,
  checkModelRamSafety,
  getModelRecommendation,
  agentIntervalRefs,
  showToast,
  showMicPermissionGuide,
  setShowMicPermissionGuide,
  gemFieldActive,
  setGemFieldActive,
  gemSuggestedText,
  setGemSuggestedText,
  isGemGenerating,
  handleAcceptGemSuggestion,
  showCloudAccountModal,
  setShowCloudAccountModal,
  workspaceUserEmail,
  setWorkspaceUserEmail,
  personalUserEmail,
  setPersonalUserEmail,
  safeLocalStorageSetItem,
  handleWorkspaceLogin,
  handleLocalDriveSync,
  showOnboardingModal,
  setShowOnboardingModal,
  onboardingRole,
  setOnboardingRoleLocal,
  onboardingStep,
  setOnboardingStep,
  onboardingOrd,
  handleSetOnboardingOrdLocal,
  onboardingIsSostegno,
  setOnboardingIsSostegno,
  onboardingDisc,
  setOnboardingDiscLocal,
  localCurriculum,
  onboardingCombinations,
  setOnboardingCombinations,
  handleToggleOnboardingCombination,
  availableSections,
  setAvailableSections,
  newSectionInput,
  setNewSectionInput,
  handleAddSectionLocal,
  saveOnboardingProfile,
  getRoleLabel,
  getDisciplineLabel,
  showMottoModal,
  setShowMottoModal,
  selectedUda,
  setSelectedUda,
  handleDownloadScormManifest,
  copyUdaForRegister,
  copyUdaTextLocal,
  showOutcomesModal,
  setShowOutcomesModal,
  selectedUdaForOutcomes,
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
  setCriticalReflectionsInput,
  handleSaveOutcomes,
  showSaveModal,
  setShowSaveModal,
  saveProgDraft,
  handleDownloadBackup,
  handleRestoreBackup,
  handleClearLocalStorageWithReset,
  isWorkspaceLoggedIn,
  workspaceClientId,
  setWorkspaceClientId,
  isSyncingWorkspace,
  handleWorkspaceSync,
  handleWorkspaceLogout,
  handleRestoreFromLocalEmergencyStorage,
  triggerPwaInstall,
  cloudAccountType,
  showTourModal,
  setShowTourModal,
  handleTabSwitch,
  generatedDocTitle,
  setGeneratedDocTitle,
  generatedDocText,
  setGeneratedDocText,
  handlePrintDocumentPdf,
  copyText,
  showWikiReaderModal,
  setShowWikiReaderModal,
  selectedBrainDoc,
  getVolumeTitleWithCustom,
  getVolumePlainTxtWithCustom,
  getVolumeFullHtmlWithCustom,
  handleDeleteCustomKbDoc,
  showAddKbModal,
  setShowAddKbModal,
  newKbDocTitle,
  setNewKbDocTitle,
  newKbDocSubtitle,
  setNewKbDocSubtitle,
  newKbDocContent,
  setNewKbDocContent,
  handleAddCustomKbDoc
 };

 const appContextValue: AppContextValue = {
  ...appViewsLayerProps,
  handleTabSwitch: (tab: AppTab) => handleTabSwitch(tab)
 };

 return (
  <AppContext.Provider value={appContextValue}>
  <div className="flex-1 flex flex-col">
   {/* Dynamic Toast */}
   {toastMessage && (
    <div className="fixed bottom-6 right-6 bg-slate-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 z-[200] flex items-center space-x-3 text-xs max-w-sm transition-all duration-300">
     <div className={`${toastSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'} p-1 rounded-lg`}>
      <Check className="w-4 h-4" />
     </div>
     <div className="font-semibold">{toastMessage}</div>
    </div>
   )}

   {/* TOP HEADER */}
   <AppHeader
    toggleSidebar={toggleSidebar}
    isCopilotChatOpen={isCopilotChatOpen}
    setIsCopilotChatOpen={setIsCopilotChatOpen}
    setShowAgentSetupModal={setShowAgentSetupModal}
    localAgentStatus={localAgentStatus}
    localAgentType={localAgentType}
    ollamaStatus={ollamaStatus}
    ollamaModelName={ollamaModelName}
    localAgentSize={localAgentSize}
    setShowSaveModal={setShowSaveModal}
    roleDropdownOpen={roleDropdownOpen}
    setRoleDropdownOpen={setRoleDropdownOpen}
    isWorkspaceLoggedIn={isWorkspaceLoggedIn}
    cloudAccountType={cloudAccountType}
    workspaceUserEmail={workspaceUserEmail}
    handleWorkspaceSync={handleWorkspaceSync}
    showToast={showToast}
    handleClearLocalStorageWithReset={handleClearLocalStorageWithReset}
    handleWorkspaceLogout={handleWorkspaceLogout}
    setShowCloudAccountModal={setShowCloudAccountModal}
   />
   {/* MAIN CONTAINER */}
   <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6 overflow-hidden">

    {/* COLLAPSIBLE SIDEBAR PANEL (Azione UX - Semplificata) */}
    <AppSidebar
     sidebarCollapsed={sidebarCollapsed}
     activeTab={activeTab}
     activeCurricoloView={activeCurricoloView}
     activeProgTab={activeProgTab}
     pendingCount={pendingCount}
     handleTabSwitch={(tab) => handleTabSwitch(tab as AppTab)}
     setActiveCurricoloView={(view) => setActiveCurricoloView(view as any)}
     setActiveProgTab={(tab) => setActiveProgTab(tab as any)}
    />
    {/* MAIN BODY AREA WITH TRANS-TAB WARNING BANNERS (Azione IV) */}
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

     {/* SOTTO-HEADER DI ALLERTA GLOBALE (Visibile sempre se attivo, trans-tab) */}
     <GlobalAlerts
      isDatabaseVolatile={isDatabaseVolatile}
      isFileProtocol={isFileProtocol}
      isWorkspaceLoggedIn={isWorkspaceLoggedIn}
      workspaceTokenExpiry={workspaceTokenExpiry}
      cloudAccountType={cloudAccountType}
      handleWorkspaceLogin={handleWorkspaceLogin}
     />
     <main id="main-content" className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-y-auto relative">

      {/* VIEW LAYER - Route-based rendering */}
      <Suspense fallback={<div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
       <Outlet />
      </Suspense>
     </main>
    </div>
    {/* CONTEXTUAL COPILOT CHAT SIDEBAR (OIV ERGONOMIC ENHANCEMENT) */}
    <CopilotChatSidebar
     isCopilotChatOpen={isCopilotChatOpen}
     setIsCopilotChatOpen={setIsCopilotChatOpen}
     copilotChatHistory={copilotChatHistory}
     isCopilotResponding={isCopilotResponding}
     copilotChatInput={copilotChatInput}
     setCopilotChatInput={setCopilotChatInput}
     handleSendCopilotMessage={handleSendCopilotMessage}
     handleSelectCopilotChip={handleSelectCopilotChip}
     handleToggleVoiceTyping={handleToggleVoiceTyping}
     isVoiceListening={isVoiceListening}
     handleSpeakController={handleSpeakController}
     ttsActiveMsgIndex={ttsActiveMsgIndex}
     ttsPlayingState={ttsPlayingState}
     activeTab={activeTab}
     activeProgTab={activeProgTab}
    />
   </div>

   {/* MODAL LAYER */}
   <AppModalsLayer {...appModalsLayerProps} />
   {/* MOBILE BOTTOM NAV */}
    <MobileBottomNav
     activeTab={activeTab}
     pendingCount={pendingCount}
     handleTabSwitch={(tab) => handleTabSwitch(tab as AppTab)}
   />  </div>
  </AppContext.Provider>
 );
}

export type { SchoolOrder, UdaModel };
export { orderLabelsForMap };
export { useCurriculumStore };
export { getDisciplineIcon };
export { getDisciplineLabel };
