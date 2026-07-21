import { AgentSetupModal } from '../../copilot';
import { AddKbDocumentModal, WikiReaderModal } from '../../documents';
import { OutcomesModal, UdaDetailModal } from '../../progettazione';
import { CloudAccountModal, GemmaSuggestionModal, MicPermissionGuideModal } from '../../workspace';
import { DocumentViewModal, MottoModal, OnboardingModal, SaveSettingsModal, TourModal } from './SessionModals';
import type { AppModalsLayerProps, CloudAccountType, LocalAgentSize, LocalAgentStatus, OllamaStatus } from '../types/appModalContracts';
import type { AppTab } from '../../navigation';

export type { AppModalsLayerProps } from '../types/appModalContracts';

const LOCAL_AGENT_STATUSES = ['not_installed', 'downloading', 'installed'] as const;
const LOCAL_AGENT_SIZES = ['light', 'full', 'none'] as const;
const OLLAMA_STATUSES = ['idle', 'testing', 'connected', 'error'] as const;
const CLOUD_ACCOUNT_TYPES = ['scolastica', 'personale'] as const;
const APP_TABS = ['dashboard', 'curricolo', 'revisione', 'progetta-evidenze', 'progetta-annuale', 'processo', 'esportazioni', 'certificazione-pa', 'fonti', 'guida', 'second-brain'] as const;

const isLocalAgentStatus = (value: string): value is LocalAgentStatus => (LOCAL_AGENT_STATUSES as readonly string[]).includes(value);
const isLocalAgentSize = (value: string): value is LocalAgentSize => (LOCAL_AGENT_SIZES as readonly string[]).includes(value);
const isOllamaStatus = (value: string): value is OllamaStatus => (OLLAMA_STATUSES as readonly string[]).includes(value);
const isCloudAccountType = (value: string): value is CloudAccountType => (CLOUD_ACCOUNT_TYPES as readonly string[]).includes(value);
const isAppTab = (tab: string): tab is AppTab => (APP_TABS as readonly string[]).includes(tab);


export function AppModalsLayer(props: AppModalsLayerProps) {
  const {
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
    handleAddCustomKbDoc,
  } = props;

  return (
    <>
   {/* MODAL: CONFIGURAZIONE AGENTE LOCALE OFFLINE */}
   <AgentSetupModal
    showAgentSetupModal={showAgentSetupModal}
    setShowAgentSetupModal={setShowAgentSetupModal}
    detectedDeviceType={detectedDeviceType}
    localAgentType={localAgentType}
    setLocalAgentType={setLocalAgentType}
    localAgentStatus={localAgentStatus}
    setLocalAgentStatus={(value) => { if (isLocalAgentStatus(value)) setLocalAgentStatus(value); }}
    localAgentSize={localAgentSize}
    setLocalAgentSize={(value) => { if (isLocalAgentSize(value)) setLocalAgentSize(value); }}
    localAgentProgress={localAgentProgress}
    setLocalAgentProgress={setLocalAgentProgress}
    activeHelpModel={activeHelpModel}
    setActiveHelpModel={setActiveHelpModel}
    ollamaServerUrl={ollamaServerUrl}
    setOllamaServerUrl={setOllamaServerUrl}
    ollamaModelName={ollamaModelName}
    setOllamaModelName={setOllamaModelName}
    ollamaStatus={ollamaStatus}
    setOllamaStatus={(value) => { if (isOllamaStatus(value)) setOllamaStatus(value); }}
    handleTestOllamaConnection={handleTestOllamaConnection}
    checkModelRamSafety={checkModelRamSafety}
    getModelRecommendation={getModelRecommendation}
    agentIntervalRefs={agentIntervalRefs}
    showToast={showToast}
   />
   {/* MODAL: GUIDA ATTIVAZIONE MICROFONO */}
   <MicPermissionGuideModal
    showMicPermissionGuide={showMicPermissionGuide}
    setShowMicPermissionGuide={setShowMicPermissionGuide}
   />
   {/* MODAL: SUGGERIMENTO GEMMA CO-PILOTA */}
   <GemmaSuggestionModal
    gemFieldActive={gemFieldActive}
    setGemFieldActive={setGemFieldActive}
    gemSuggestedText={gemSuggestedText}
    setGemSuggestedText={setGemSuggestedText}
    isGemGenerating={isGemGenerating}
    handleAcceptGemSuggestion={handleAcceptGemSuggestion}
   />
   {/* MODAL: SELEZIONE ACCOUNT CLOUD PER COPIA DI SICUREZZA */}
   <CloudAccountModal
    showCloudAccountModal={showCloudAccountModal}
    setShowCloudAccountModal={setShowCloudAccountModal}
    workspaceUserEmail={workspaceUserEmail}
    setWorkspaceUserEmail={setWorkspaceUserEmail}
    personalUserEmail={personalUserEmail}
    setPersonalUserEmail={setPersonalUserEmail}
    safeLocalStorageSetItem={safeLocalStorageSetItem}
    handleWorkspaceLogin={(type) => { if (isCloudAccountType(type)) handleWorkspaceLogin(type); }}
    handleLocalDriveSync={handleLocalDriveSync}
   />
   {/* MODAL: ONBOARDING */}
   <OnboardingModal
    showOnboardingModal={showOnboardingModal}
    setShowOnboardingModal={setShowOnboardingModal}
    onboardingRole={onboardingRole}
    setOnboardingRoleLocal={setOnboardingRoleLocal}
    onboardingStep={onboardingStep}
    setOnboardingStep={setOnboardingStep}
    onboardingOrd={onboardingOrd}
    handleSetOnboardingOrdLocal={handleSetOnboardingOrdLocal}
    onboardingIsSostegno={onboardingIsSostegno}
    setOnboardingIsSostegno={setOnboardingIsSostegno}
    onboardingDisc={onboardingDisc}
    setOnboardingDiscLocal={setOnboardingDiscLocal}
    localCurriculum={localCurriculum}
    onboardingCombinations={onboardingCombinations}
    setOnboardingCombinations={setOnboardingCombinations}
    handleToggleOnboardingCombination={handleToggleOnboardingCombination}
    availableSections={availableSections}
    setAvailableSections={setAvailableSections}
    newSectionInput={newSectionInput}
    setNewSectionInput={setNewSectionInput}
    handleAddSectionLocal={handleAddSectionLocal}
    safeLocalStorageSetItem={safeLocalStorageSetItem}
    showToast={showToast}
    saveOnboardingProfile={saveOnboardingProfile}
    getRoleLabel={getRoleLabel}
    getDisciplineLabel={getDisciplineLabel}
   />
   {/* MODAL: MOTTO */}
   <MottoModal
    showMottoModal={showMottoModal}
    setShowMottoModal={setShowMottoModal}
   />
   {/* MODAL: UDA DETAIL */}
   <UdaDetailModal
    selectedUda={selectedUda}
    setSelectedUda={setSelectedUda}
    handleDownloadScormManifest={handleDownloadScormManifest}
    copyUdaForRegister={copyUdaForRegister}
    copyUdaTextLocal={copyUdaTextLocal}
   />

   {/* MODAL: OUTCOMES RECORDING */}
   <OutcomesModal
    showOutcomesModal={showOutcomesModal}
    setShowOutcomesModal={setShowOutcomesModal}
    selectedUdaForOutcomes={selectedUdaForOutcomes}
    selfEvaluationStars={selfEvaluationStars}
    setSelfEvaluationStars={setSelfEvaluationStars}
    outcomesAvanzato={outcomesAvanzato}
    setOutcomesAvanzato={setOutcomesAvanzato}
    outcomesIntermedio={outcomesIntermedio}
    setOutcomesIntermedio={setOutcomesIntermedio}
    outcomesBase={outcomesBase}
    setOutcomesBase={setOutcomesBase}
    outcomesIniziale={outcomesIniziale}
    setOutcomesIniziale={setOutcomesIniziale}
    criticalReflectionsInput={criticalReflectionsInput}
    setCriticalReflectionsInput={setCriticalReflectionsInput}
    handleSaveOutcomes={handleSaveOutcomes}
   />
   {/* MODAL: GESTIONE FILE & SALVATAGGI */}
   <SaveSettingsModal
    showSaveModal={showSaveModal}
    setShowSaveModal={setShowSaveModal}
    setShowOnboardingModal={setShowOnboardingModal}
    setShowCloudAccountModal={setShowCloudAccountModal}
    setShowAgentSetupModal={setShowAgentSetupModal}
    saveProgDraft={saveProgDraft}
    handleDownloadBackup={handleDownloadBackup}
    handleRestoreBackup={handleRestoreBackup}
    handleClearLocalStorageWithReset={handleClearLocalStorageWithReset}
    isWorkspaceLoggedIn={isWorkspaceLoggedIn}
    workspaceClientId={workspaceClientId}
    setWorkspaceClientId={setWorkspaceClientId}
    safeLocalStorageSetItem={safeLocalStorageSetItem}
    showToast={showToast}
    isSyncingWorkspace={isSyncingWorkspace}
    handleWorkspaceSync={handleWorkspaceSync}
    handleWorkspaceLogout={handleWorkspaceLogout}
    handleWorkspaceLogin={() => handleWorkspaceLogin(cloudAccountType)}
    workspaceUserEmail={workspaceUserEmail}
    handleRestoreFromLocalEmergencyStorage={handleRestoreFromLocalEmergencyStorage}
    setShowMottoModal={setShowMottoModal}
    triggerPwaInstall={triggerPwaInstall}
   />
   {/* MODAL: GUIDED TOUR & TEST RESULTS */}
   <TourModal
    showTourModal={showTourModal}
    setShowTourModal={setShowTourModal}
    handleTabSwitch={(tab) => { if (isAppTab(tab)) handleTabSwitch(tab); }}
   />
   {/* MODAL: DOCUMENT VIEW MODAL */}
   <DocumentViewModal
    generatedDocTitle={generatedDocTitle}
    setGeneratedDocTitle={setGeneratedDocTitle}
    generatedDocText={generatedDocText}
    setGeneratedDocText={setGeneratedDocText}
    handlePrintDocumentPdf={(title, text) => { if (title && text) handlePrintDocumentPdf(title, text); }}
    copyText={copyText}
    showToast={showToast}
   />
   {/* MODAL: WIKI FULL TEXT READER */}
   <WikiReaderModal
    showWikiReaderModal={showWikiReaderModal}
    setShowWikiReaderModal={setShowWikiReaderModal}
    selectedBrainDoc={selectedBrainDoc}
    getVolumeTitleWithCustom={getVolumeTitleWithCustom}
    getVolumePlainTxtWithCustom={getVolumePlainTxtWithCustom}
    getVolumeFullHtmlWithCustom={getVolumeFullHtmlWithCustom}
    handleDeleteCustomKbDoc={handleDeleteCustomKbDoc}
    showToast={showToast}
   />

   {/* MODAL: ADD CUSTOM KB DOCUMENT */}
   <AddKbDocumentModal
    showAddKbModal={showAddKbModal}
    setShowAddKbModal={setShowAddKbModal}
    newKbDocTitle={newKbDocTitle}
    setNewKbDocTitle={setNewKbDocTitle}
    newKbDocSubtitle={newKbDocSubtitle}
    setNewKbDocSubtitle={setNewKbDocSubtitle}
    newKbDocContent={newKbDocContent}
    setNewKbDocContent={setNewKbDocContent}
    handleAddCustomKbDoc={handleAddCustomKbDoc}
    showToast={showToast}
   />
    </>
  );
}
