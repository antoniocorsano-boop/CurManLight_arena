import { useState } from 'react';
import { Suspense } from 'react';
import { Check } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCurriculumStore } from './store/useCurriculumStore';
import { SchoolOrder, UdaModel } from './types/curriculum';
import { AppModalsLayer, AppViewsLayer, useAppLocalHandlers, useAppStartupEffects, useAppWorkflowState, useOnboardingProfile, useSessionUiState, useToast, type AppModalsLayerProps, type AppViewsLayerProps } from './features/session';
import { CopilotChatSidebar, useCopilotInteractionHandlers, useLocalAgentSetup } from './features/copilot';
import { AppHeader, AppSidebar, GlobalAlerts, MobileBottomNav, appTabToPath, pathnameToAppTab, type AppTab } from './features/navigation';
import { AppContext, type AppContextValue } from './components/layout/AppContext';
import { initialEdges, initialNodes } from './lib/architectureGraph';
import { safeLocalStorageSetItem } from './lib/consolidatedStorage';
import { getDisciplineIcon, getDisciplineLabel, orderLabelsForMap } from './lib/disciplineLabels';
import { useBackupHandlers, useDocumentExportHandlers, useDocumentContinuity, useKnowledgeBaseHandlers, useResetSpeechOnContextChange, useTemplateEngine, useUdaPackageHandlers, useWikiGlossaryHandlers } from './features/documents';
import { useCurriculumImportHandlers, useCurriculumProgressStats, useLocalCurriculum } from './features/curriculum';
import { useProgettazioneAssistiveHandlers, useUdaProgrammingHandlers } from './features/progettazione';
import { useSessionAutoSave, useWorkspaceState, useWorkspaceSyncHandlers } from './features/workspace';
import { copyText } from './lib/clipboard';
import { getRoleLabel } from './lib/roleLabels';
import { getA07InstitutionalDocumentRead } from './domain/institution';

export default function App() {
 const {
  role, discipline, order, schoolYear, decisions, customTexts, savedUda, institutionalArchive,
  selectedTraguardi, selectedObiettivi, selectedEvidenze,
  activeProgTab, activeCurricoloView, activeProcessoTab, activeGeneralSubtab,
  setRole, setDiscipline, setOrder, setDecision, setCustomText,
  addUda,
  setActiveProgTab, setActiveCurricoloView, setActiveProcessoTab, setActiveGeneralSubtab,
  resetAll, restoreBackupState
 } = useCurriculumStore();
 const institutionalProfile = getA07InstitutionalDocumentRead(institutionalArchive);

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
  toastMessage,
  toastSuccess,
  showToast
 } = useToast();

 const {
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
  openOnboardingProfileEditor,
  saveOnboardingProfile
 } = useOnboardingProfile({
  role,
  discipline,
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
  institutionalArchive,
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

 const location = useLocation();
 const navigate = useNavigate();
 const activeTab = pathnameToAppTab(location.pathname);
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

 const handleTabSwitch = (tab: AppTab) => {
  navigate(appTabToPath(tab));
  if (window.innerWidth < 768) {
   const sidebar = document.getElementById('sidebar');
   if (sidebar) sidebar.className = "hidden md:block w-full md:w-64 shrink-0 space-y-4 transition-all duration-300";
  }
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
  detectedDeviceType,
  discipline,
  order,
  getDisciplineLabel,
  setProgTitle,
  setRealTaskInput,
  setProgNotes,
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
  showToast,
  institutionalProfile
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
  workspaceClientId,
  cloudAccountType,
  schoolYear,
  localCurriculum,
  savedUda,
  decisions,
  customTexts,
  role,
  discipline,
  order,
  institutionalArchive,
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
  setGeneratedDocText,
  institutionalProfile
 });

 const {
  recordExport,
  clearDocumentExportHistory,
  documentExportHistory,
  computeCurrentCurriculumSignature,
 } = useDocumentContinuity();

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
  handleSendTemplateInstruction,
  resetTemplateState
 } = useTemplateEngine({ showToast, institutionalProfile });

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
  selectedEvidenze,
  activeCompetencyExplorer,
  setActiveCompetencyExplorer,
  showToast,
  getDisciplineIcon,
  getDisciplineLabel,
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
  resetTemplateState,
  institutionalProfile,
  handleDownloadWordDefinitivo: () => { handleDownloadWordDefinitivo(); recordExport({ documentType: 'curricolo', format: 'DOC', label: `Curricolo Verticale ${schoolYear}`, sourceKind: 'curriculum', discipline, order, sourceSignature: computeCurrentCurriculumSignature(), sourceView: 'esportazioni' }); },
  handleDownloadWordDocx: () => { handleDownloadWordDocx(); recordExport({ documentType: 'curricolo', format: 'DOCX', label: `Curricolo Verticale ${schoolYear}`, sourceKind: 'curriculum', discipline, order, sourceSignature: computeCurrentCurriculumSignature(), sourceView: 'esportazioni' }); },
  handleDownloadODF: () => { handleDownloadODF(); recordExport({ documentType: 'curricolo', format: 'ODF', label: `Curricolo Verticale ${schoolYear}`, sourceKind: 'curriculum', discipline, order, sourceSignature: computeCurrentCurriculumSignature(), sourceView: 'esportazioni' }); },
  handleDownloadCurricoloPDF: () => { handleDownloadCurricoloPDF(); recordExport({ documentType: 'curricolo', format: 'PDF', label: `Curricolo Verticale ${schoolYear}`, sourceKind: 'curriculum', discipline, order, sourceSignature: computeCurrentCurriculumSignature(), sourceView: 'esportazioni' }); },
  handleCopyToClipboardFormatted,
  handleDownloadTxt: () => { handleDownloadTxt(); recordExport({ documentType: 'curricolo', format: 'TXT', label: `Bozza ${discipline} ${order}`, sourceKind: 'curriculum', discipline, order, sourceSignature: computeCurrentCurriculumSignature(), sourceView: 'esportazioni' }); },
  handleDownloadWordConfronto: () => { handleDownloadWordConfronto(); recordExport({ documentType: 'confronto', format: 'DOC', label: `Tavola Confronto ${schoolYear}`, sourceKind: 'curriculum', discipline, order, sourceSignature: computeCurrentCurriculumSignature(), sourceView: 'esportazioni' }); },
  handleDownloadRichMarkdown: () => { handleDownloadRichMarkdown(); recordExport({ documentType: 'curricolo', format: 'Markdown', label: `Curricolo Verticale ${schoolYear}`, sourceKind: 'curriculum', discipline, order, sourceSignature: computeCurrentCurriculumSignature(), sourceView: 'esportazioni' }); },
  handleDownloadPdfDirect: () => { handleDownloadPdfDirect(); recordExport({ documentType: 'curricolo', format: 'PDF', label: `Curricolo Verticale ${schoolYear}`, sourceKind: 'curriculum', discipline, order, sourceSignature: computeCurrentCurriculumSignature(), sourceView: 'esportazioni' }); },
  handleClearLocalStorageWithReset,
  handleGenerateProgrammazioneAnnualeDoc,
  handleGenerateRelazioneDoc,
  handleGenerateSpecificoGradoDoc,
  documentExportHistory,
  clearDocumentExportHistory,
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
  institutionalProfile,
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
    {toastMessage && (
     <div className="fixed bottom-6 right-6 bg-slate-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 z-[200] flex items-center space-x-3 text-xs max-w-sm transition-all duration-300">
      <div className={`${toastSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'} p-1 rounded-lg`}>
       <Check className="w-4 h-4" />
      </div>
      <div className="font-semibold">{toastMessage}</div>
     </div>
    )}

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
     openLocalProfileEditor={openOnboardingProfileEditor}
     setShowCloudAccountModal={setShowCloudAccountModal}
    />

    <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6 overflow-hidden">
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

     <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <GlobalAlerts
       isDatabaseVolatile={isDatabaseVolatile}
       isFileProtocol={isFileProtocol}
       isWorkspaceLoggedIn={isWorkspaceLoggedIn}
       workspaceTokenExpiry={workspaceTokenExpiry}
       cloudAccountType={cloudAccountType}
       handleWorkspaceLogin={handleWorkspaceLogin}
      />
      <main id="main-content" className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-y-auto relative">
       <Suspense fallback={<div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
        <AppViewsLayer {...appViewsLayerProps} />
       </Suspense>
      </main>
     </div>

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

    <AppModalsLayer {...appModalsLayerProps} />
    <MobileBottomNav
     activeTab={activeTab}
     pendingCount={pendingCount}
     handleTabSwitch={(tab) => handleTabSwitch(tab as AppTab)}
    />
   </div>
  </AppContext.Provider>
 );
}

export type { SchoolOrder, UdaModel };
export { orderLabelsForMap };
export { useCurriculumStore };
export { getDisciplineIcon };
export { getDisciplineLabel };
