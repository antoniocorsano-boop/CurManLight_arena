import { CurriculumTab, RevisioneTab } from '../../curriculum';
import { EsportazioniTab, SecondBrainTab } from '../../documents';
import { ProcessoTab } from '../../processo';
import { ProgettazioneTab } from '../../progettazione';
import PlanningCatalogue from '../../progettazione/components/PlanningCatalogue';
import { DashboardView } from './DashboardView';
import { InfoViews } from './InfoViews';
import { WorkspaceHeader } from '../../workspace/components';
import { useMemo, useState } from 'react';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import { createCanonicalPlanningWorkspace, buildPlanningCatalogue, materializeUdaFromPlanning, updatePlanningContent, updatePlanningContext, type DidacticPlanning } from '../../../domain/planning';
import type { EntityId } from '../../../domain/curriculum/identity/types';
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../../../lib/consolidatedStorage';
import type { ActiveProgTab, AppViewsLayerProps } from '../types/appViewContracts';
import type { AppTab } from '../../navigation';

export type { AppViewsLayerProps } from '../types/appViewContracts';

const APP_TABS = ['dashboard', 'curricolo', 'revisione', 'progetta-evidenze', 'progetta-annuale', 'processo', 'esportazioni', 'certificazione-pa', 'fonti', 'guida', 'second-brain'] as const;
const ACTIVE_PROG_TABS = ['home', 'annuale', 'uda', 'certificazione', 'social', 'classe-home', 'classe'] as const;

const isAppTab = (tab: string): tab is AppTab => (APP_TABS as readonly string[]).includes(tab);
const isActiveProgTab = (tab: string): tab is ActiveProgTab => (ACTIVE_PROG_TABS as readonly string[]).includes(tab);


export function AppViewsLayer(props: AppViewsLayerProps) {
  const {
    activeTab,
    activeProgTab = 'home',
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
    canConsolidate,
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
    initialEdges,
  } = props;

  const workspaceContext = `${getDisciplineLabel(discipline, order)} · ${order === 'infanzia' ? "Scuola dell'Infanzia" : order === 'primaria' ? 'Scuola Primaria' : 'Scuola secondaria di I grado'}`;
  const designArchive = useCurriculumStore(state => state.designArchive);
  const selectedObiettivi = useCurriculumStore(state => state.selectedObiettivi);
  const addUda = useCurriculumStore(state => state.addUda);
  const [planningId, setPlanningId] = useState<EntityId>(() => {
   const stored = safeLocalStorageGetItem('curman_canonical_planning_id', '');
   if (stored) return stored as EntityId;
   const created = `planning-${Date.now()}` as EntityId;
   safeLocalStorageSetItem('curman_canonical_planning_id', created);
   return created;
  });
  const canonicalPlanning: DidacticPlanning = useMemo(() => ({
   ...createCanonicalPlanningWorkspace({
    id: planningId,
    draft: {
     title: progTitle,
     discipline,
     schoolOrder: order,
     classLabel: targetClass,
     period: progPeriod,
     hours: progHours,
     objectives: selectedObiettivi.map(index => localCurriculum[discipline]?.[order]?.obiettivi?.[index]).filter((value): value is string => Boolean(value)),
     activities: realTaskInput.trim() ? [realTaskInput.trim()] : [],
     notes: progNotes,
    },
    curriculumSelections: designArchive.selections,
    status: progStatus === 'pronta per confronto' ? 'ready' : 'in_progress',
   }),
   reconstruction: 'partial',
  }), [planningId, progTitle, discipline, order, targetClass, progPeriod, progHours, realTaskInput, progNotes, progStatus, selectedObiettivi, localCurriculum, designArchive.selections]);
  const materializedUda = savedUda.find(uda => String(uda.sourcePlanningRef?.id) === String(canonicalPlanning.id));
  const handleMaterializeUda = () => {
   const result = materializeUdaFromPlanning(canonicalPlanning, savedUda);
   if (result.status === 'success') {
    addUda(result.uda);
    setActiveProgTab('uda');
   } else if (result.status === 'already-materialized') {
    setActiveProgTab('uda');
   } else {
    showToast(result.issues[0]?.message ?? 'La progettazione non è pronta per la materializzazione.');
   }
  };
  const planningCatalogue = buildPlanningCatalogue({ plannings: [canonicalPlanning], udaArtifacts: savedUda });
  const startNewPlanning = () => {
   const nextId = `planning-${Date.now()}` as EntityId;
   safeLocalStorageSetItem('curman_canonical_planning_id', nextId);
   setPlanningId(nextId);
   setProgTitle('');
   setActiveProgTab('annuale');
  };
  const setCanonicalTitle = (value: string) => setProgTitle(updatePlanningContent(canonicalPlanning, { title: value }).content.title ?? '');
  const setCanonicalPeriod = (value: string) => setProgPeriod(updatePlanningContent(canonicalPlanning, { period: value }).content.period ?? '');
  const setCanonicalHours = (value: number) => setProgHours(updatePlanningContent(canonicalPlanning, { hours: value }).content.hours ?? 0);
  const setCanonicalNotes = (value: string | ((current: string) => string)) => {
   const resolved = typeof value === 'function' ? value(canonicalPlanning.content.notes ?? '') : value;
   setProgNotes(updatePlanningContent(canonicalPlanning, { notes: resolved }).content.notes ?? '');
  };
  const setCanonicalClass = (value: string) => setTargetClass(updatePlanningContext(canonicalPlanning, { classLabel: value }).context.classLabel ?? '');
  const classContext = targetClass ? `${workspaceContext} · Classe ${targetClass}${targetSection ? ` · Sezione ${targetSection}` : ''}` : workspaceContext;

  return (
    <>
{/* VIEW: DASHBOARD */}
      <DashboardView
        activeTab={activeTab}
        role={role}
        savedUda={savedUda}
        decisions={decisions}
        wizardStep={wizardStep}
        progTitle={progTitle}
        progStatus={progStatus}
        documentExportHistory={documentExportHistory}
        handleDownloadCml={handleDownloadCml}
        handleTabSwitch={(tab) => { if (isAppTab(tab)) handleTabSwitch(tab); }}
        setSelectedBrainDoc={setSelectedBrainDoc}
        setWikiWorkspaceTab={setWikiWorkspaceTab}
        setShowSaveModal={setShowSaveModal}
        setActiveCurricoloView={setActiveCurricoloView}
        setActiveProgTab={(tab) => { if (isActiveProgTab(tab)) setActiveProgTab(tab); }}
        setSelectedUda={setSelectedUda}
       />
     {/* VIEW: CURRICOLO */}
     {activeTab === 'curricolo' && (
      <div className="space-y-6">
       <WorkspaceHeader
        identity="Curricolo"
        context={workspaceContext}
        workObject="Curricolo locale"
        status={localCurriculum ? 'Disponibile per la consultazione' : undefined}
        primaryAction={{ label: 'Apri progettazione', onClick: () => { handleTabSwitch('progetta-annuale'); setActiveProgTab('annuale'); } }}
       />
       <CurriculumTab
        localCurriculum={localCurriculum}
        showOnlyProfileCurriculum={showOnlyProfileCurriculum}
        setShowOnlyProfileCurriculum={setShowOnlyProfileCurriculum}
        expandedMapSections={expandedMapSections}
        setExpandedMapSections={setExpandedMapSections}
        showOnlyProfileProcesso={showOnlyProfileProcesso}
        setShowOnlyProfileProcesso={setShowOnlyProfileProcesso}
        importTopicInput={importTopicInput}
        setImportTopicInput={setImportTopicInput}
        isGeneratingKB={isGeneratingKB}
        generatedKBOuput={generatedKBOuput}
        localAgentStatus={localAgentStatus}
        localAgentSize={localAgentSize}
        popolamentoTab={popolamentoTab}
        setPopolamentoTab={setPopolamentoTab}
        setShowAgentSetupModal={setShowAgentSetupModal}
        handleAiGenerateCurriculum={handleAiGenerateCurriculum}
        handleSaveGeneratedToKB={handleSaveGeneratedToKB}
        handleCSVUpload={handleCSVUpload}
        handleResetCurriculumToBaseline={handleResetCurriculumToBaseline}
        handleTabSwitch={handleTabSwitch}
        setActiveProgTab={setActiveProgTab}
       />
      </div>
     )}

     {/* VIEW: REVISIONE */}
     {activeTab === 'revisione' && (
      <RevisioneTab
       currentDisciplineProps={currentDisciplineProps}
       currentDisciplineDecided={currentDisciplineDecided}
       revisioneMode={revisioneMode}
       setRevisioneMode={setRevisioneMode}
       revisioneWizardIndex={revisioneWizardIndex}
       setRevisioneWizardIndex={setRevisioneWizardIndex}
      />
     )}
     {/* VIEW: AREA DI PROGETTAZIONE UNIFICATA */}
     {activeTab === 'progetta-annuale' && (
      <div className="space-y-6">
       <WorkspaceHeader
        identity={['classe', 'classe-home', 'social'].includes(activeProgTab) ? 'Classe' : 'Progettazione'}
        context={classContext}
        workObject={['classe', 'classe-home', 'social'].includes(activeProgTab) ? (selectedClassCombination ? `Attività della classe ${selectedClassCombination}` : undefined) : (progTitle || undefined)}
        status={['classe', 'classe-home', 'social'].includes(activeProgTab) ? undefined : progStatus}
        primaryAction={['classe', 'classe-home', 'social'].includes(activeProgTab)
          ? { label: 'Torna a progettazione', onClick: () => setActiveProgTab('annuale') }
          : { label: 'Apri documenti', onClick: () => handleTabSwitch('esportazioni') }}
       />
       {activeProgTab === 'home' ? (
        <PlanningCatalogue
         entries={planningCatalogue}
         onContinue={(entry) => {
          setPlanningId(entry.id);
          safeLocalStorageSetItem('curman_canonical_planning_id', entry.id);
          setProgTitle(entry.title === 'Progettazione senza titolo' ? '' : entry.title);
          if (entry.context.classLabel) setTargetClass(entry.context.classLabel);
          setActiveProgTab('annuale');
         }}
         onNew={startNewPlanning}
         disciplineLabel={(value) => getDisciplineLabel(value, order)}
        />
       ) : (
       <ProgettazioneTab
       canonicalPlanning={canonicalPlanning}
       materializedUda={materializedUda}
       onMaterializeUda={handleMaterializeUda}
       localCurriculum={localCurriculum}
       savedUda={savedUda}
       targetClass={targetClass}
       setTargetClass={setCanonicalClass}
       targetSection={targetSection}
       setTargetSection={setTargetSection}
       assignedCombinations={assignedCombinations}
       progettazioneMode={progettazioneMode}
       setProgettazioneMode={setProgettazioneMode}
       wizardStep={wizardStep}
       setWizardStep={setWizardStep}
       progTitle={progTitle}
       setProgTitle={setCanonicalTitle}
       progPeriod={progPeriod}
       setProgPeriod={setCanonicalPeriod}
       progHours={progHours}
       setProgHours={setCanonicalHours}
       progStatus={progStatus}
       setProgStatus={setProgStatus}
       progNotes={progNotes}
       setProgNotes={setCanonicalNotes}
       realTaskInput={realTaskInput}
       setRealTaskInput={setRealTaskInput}
       progCoAuthors={progCoAuthors}
       setProgCoAuthors={setProgCoAuthors}
       branchFocusHighlight={branchFocusHighlight}
       toggleBranchFocusHighlight={toggleBranchFocusHighlight}
       tepBannerVisible={tepBannerVisible}
       setTepBannerVisible={setTepBannerVisible}
       setTepBannerDismissed={setTepBannerDismissed}
       handleTepSwitchToWizard={handleTepSwitchToWizard}
       handleTepSimplifyGrid={handleTepSimplifyGrid}
       anticipatedFields={anticipatedFields}
       confirmAnticipatedField={confirmAnticipatedField}
       applyAnticipatoryPrefill={applyAnticipatoryPrefill}
       saveProgDraft={saveProgDraft}
       handleGenerateUda={handleGenerateUda}
       compileProgPreviewText={compileProgPreviewText}
       handleTriggerGemSuggestion={handleTriggerGemSuggestion}
       handleBack={handleBack}
       handleNext={handleNext}
       handleTabSwitch={(tab) => { if (isAppTab(tab)) handleTabSwitch(tab); }}
       handleLoadSuggestedUda={handleLoadSuggestedUda}
       handleCloneUdaAdaptive={handleCloneUdaAdaptive}
       copyUdaTextLocal={copyUdaTextLocal}
       handleShareUdaToSocial={handleShareUdaToSocial}
       handleApplyLibFilters={handleApplyLibFilters}
       handleSortUdaList={handleSortUdaList}
       handleClearLibFilters={handleClearLibFilters}
       libFilterClass={libFilterClass}
       setLibFilterClass={setLibFilterClass}
       libFilterPeriod={libFilterPeriod}
       setLibFilterClassPeriod={setLibFilterClassPeriod}
       libFilterStatus={libFilterStatus}
       setLibFilterClassStatus={setLibFilterClassStatus}
       libSearchText={libSearchText}
       setLibSearchText={setLibSearchText}
       libSorting={libSorting}
       setLibSorting={setLibSorting}
       setSelectedUda={setSelectedUda}
       classeSubTab={classeSubTab}
       setClasseSubTab={setClasseSubTab}
       selectedEvidenze={selectedEvidenze}
       activeCompetencyExplorer={activeCompetencyExplorer}
       setActiveCompetencyExplorer={setActiveCompetencyExplorer}
       showToast={showToast}
       getDisciplineIcon={getDisciplineIcon}
       getDisciplineLabel={getDisciplineLabel}
       selectedClassCombination={selectedClassCombination}
       setSelectedClassCombination={setSelectedClassCombination}
       classroomStudents={classroomStudents}
       setClassroomStudents={setClassroomStudents}
       showAiSimulatedResponse={showAiSimulatedResponse}
       setShowAiSimulatedResponse={setShowAiSimulatedResponse}
       isClassroomLoading={isClassroomLoading}
       setIsClassroomLoading={setIsClassroomLoading}
       classroomStudentFeedback={classroomStudentFeedback}
       setClassroomStudentFeedback={setClassroomStudentFeedback}
       selectedStudentForFeedback={selectedStudentForFeedback}
       setSelectedStudentForFeedback={setSelectedStudentForFeedback}
       showClassroomReport={showClassroomReport}
       setShowClassroomReport={setShowClassroomReport}
       activeClassTheme={activeClassTheme}
       setActiveClassTheme={setActiveClassTheme}
       classroomLayout={classroomLayout}
       setClassroomLayout={setClassroomLayout}
       isAulaConfigOpen={isAulaConfigOpen}
       setIsAulaConfigOpen={setIsAulaConfigOpen}
       shuffledStudentMap={shuffledStudentMap}
       setShuffledStudentMap={setShuffledStudentMap}
       handleShufflePseudonyms={handleShufflePseudonyms}
       exclusionsList={exclusionsList}
       setExclusionsList={setExclusionsList}
       exclusionInputS1={exclusionInputS1}
       setExclusionInputS1={setExclusionInputS1}
       exclusionInputS2={exclusionInputS2}
       setExclusionInputS2={setExclusionInputS2}
       activeCooperativeMethod={activeCooperativeMethod}
       setActiveCooperativeMethod={setActiveCooperativeMethod}
       cooperativeGroups={cooperativeGroups}
       setCooperativeGroups={setCooperativeGroups}
       handleGenerateCooperativeGroups={handleGenerateCooperativeGroups}
       getThemedStudentName={getThemedStudentName}
       classroomTopicInput={classroomTopicInput}
       setClassroomTopicInput={setClassroomTopicInput}
       isAnalyzingTopic={isAnalyzingTopic}
       classroomTopicAnalysisResult={classroomTopicAnalysisResult}
       handleAnalyzeClassroomTopic={handleAnalyzeClassroomTopic}
       handleApproveAndInjectUda={handleApproveAndInjectUda}
       weeklyHoursItaliano={weeklyHoursItaliano}
       setWeeklyHoursItaliano={setWeeklyHoursItaliano}
       weeklyHoursStoria={weeklyHoursStoria}
       setWeeklyHoursStoria={setWeeklyHoursStoria}
       weeklyHoursGeografia={weeklyHoursGeografia}
       setWeeklyHoursGeografia={setWeeklyHoursGeografia}
       weeklyHoursMatematica={weeklyHoursMatematica}
       setWeeklyHoursMatematica={setWeeklyHoursMatematica}
       weeklyHoursScienze={weeklyHoursScienze}
       setWeeklyHoursScienze={setWeeklyHoursScienze}
       bufferCoefficient={bufferCoefficient}
       setBufferCoefficient={setBufferCoefficient}
       activeTaughtUdaId={activeTaughtUdaId}
       socialUdas={socialUdas}
       newAnnotationInputs={newAnnotationInputs}
       setNewAnnotationInputs={setNewAnnotationInputs}
       handleLikeUda={handleLikeUda}
       handleReuseUda={handleReuseUda}
       updateSocialUdas={updateSocialUdas}
       setSelectedUdaForOutcomes={setSelectedUdaForOutcomes}
       setShowOutcomesModal={setShowOutcomesModal}
       handleAddAnnotation={handleAddAnnotation}
       />
       )}
      </div>
     )}
     {/* VIEW: PROCESSO & CONSENSO */}
     {activeTab === 'processo' && (
      <ProcessoTab
       activeProcessoTab={activeProcessoTab}
       setActiveProcessoTab={setActiveProcessoTab}
       currentDisciplineDecided={currentDisciplineDecided}
       currentDisciplineProps={currentDisciplineProps}
       handleImportMergeCml={handleImportMergeCml}
       canConsolidate={canConsolidate ?? false}
       progressPercent={progressPercent}
       totalDecisions={totalDecisions}
       approvedCount={approvedCount}
       rejectedCount={rejectedCount}
       customCount={customCount}
       localCurriculum={localCurriculum}
       discipline={discipline}
       order={order}
       decisions={decisions}
       customTexts={customTexts}
      />
     )}
     {/* VIEW: ESPORTAZIONI */}
     {activeTab === 'esportazioni' && (
      <div className="space-y-6">
       <WorkspaceHeader
        identity="Documenti"
        context={workspaceContext}
        workObject={documentExportHistory[0]?.sourceTitle || (documentExportHistory.length > 0 ? 'Documenti recenti' : undefined)}
        status={documentExportHistory.length > 0 ? `${documentExportHistory.length} attività registrate` : undefined}
        primaryAction={{ label: 'Apri progettazione', onClick: () => { handleTabSwitch('progetta-annuale'); setActiveProgTab('annuale'); } }}
       />
       <EsportazioniTab
       esportazioniTab={esportazioniTab}
       setEsportazioniTab={setEsportazioniTab}
       templateDocType={templateDocType}
       setTemplateDocType={setTemplateDocType}
       templateJsonState={templateJsonState}
       setTemplateJsonState={setTemplateJsonState}
       templateChatInput={templateChatInput}
       setTemplateChatInput={setTemplateChatInput}
       templateChatHistory={templateChatHistory}
       handleSendTemplateInstruction={handleSendTemplateInstruction}
       resetTemplateState={resetTemplateState}
       institutionalProfile={institutionalProfile}
       handleDownloadWordDefinitivo={handleDownloadWordDefinitivo}
       handleDownloadWordDocx={handleDownloadWordDocx}
       handleDownloadODF={handleDownloadODF}
       handleDownloadCurricoloPDF={handleDownloadCurricoloPDF}
       handleCopyToClipboardFormatted={handleCopyToClipboardFormatted}
       handleDownloadTxt={handleDownloadTxt}
       handleDownloadCml={handleDownloadCml}
       handleDownloadWordConfronto={handleDownloadWordConfronto}
       handleDownloadRichMarkdown={handleDownloadRichMarkdown}
       handleDownloadPdfDirect={handleDownloadPdfDirect}
       handleClearLocalStorageWithReset={handleClearLocalStorageWithReset}
        handleGenerateProgrammazioneAnnualeDoc={handleGenerateProgrammazioneAnnualeDoc}
        handleGenerateRelazioneDoc={handleGenerateRelazioneDoc}
        handleGenerateSpecificoGradoDoc={handleGenerateSpecificoGradoDoc}
        documentExportHistory={documentExportHistory}
        clearDocumentExportHistory={clearDocumentExportHistory}
        targetClass={targetClass}
       targetSection={targetSection}
       showToast={showToast}
       />
      </div>
     )}
     {/* VIEW: FONTI & SEZIONI GENERALI */}
     <InfoViews
      activeTab={activeTab}
      activeGeneralSubtab={activeGeneralSubtab}
      setActiveGeneralSubtab={setActiveGeneralSubtab}
     />     {/* VIEW: SECOND BRAIN & WIKILLM */}
     {activeTab === 'second-brain' && (
      <SecondBrainTab
       secondBrainTab={secondBrainTab}
       setSecondBrainTab={setSecondBrainTab}
       selectedBrainDoc={selectedBrainDoc}
       setSelectedBrainDoc={setSelectedBrainDoc}
       customKbDocs={customKbDocs}
       setCustomKbDocs={setCustomKbDocs}
       setShowAddKbModal={setShowAddKbModal}
       isSpeaking={isSpeaking}
       isWikiDyslexiaFont={isWikiDyslexiaFont}
       setIsWikiDyslexiaFont={setIsWikiDyslexiaFont}
       wikiWorkspaceTab={wikiWorkspaceTab}
       setWikiWorkspaceTab={setWikiWorkspaceTab}
       wikiQuery={wikiQuery}
       setWikiQuery={setWikiQuery}
       wikiResponse={wikiResponse}
       wikiLoading={wikiLoading}
       triggerWikiLLMQuery={triggerWikiLLMQuery}
       handleToggleSpeech={handleToggleSpeech}
       handleDeleteCustomKbDoc={handleDeleteCustomKbDoc}
       isSyncingWorkspace={isSyncingWorkspace}
       setIsSyncingWorkspace={setIsSyncingWorkspace}
       showToast={showToast}
       graphNodes={graphNodes}
       selectedNodeId={selectedNodeId}
       setSelectedNodeId={setSelectedNodeId}
       glossary={glossary}
       selectedGlossaryTerm={selectedGlossaryTerm}
       setSelectedGlossaryTerm={setSelectedGlossaryTerm}
       customGlossaryTerm={customGlossaryTerm}
       setCustomGlossaryTerm={setCustomGlossaryTerm}
       isGlossaryLoading={isGlossaryLoading}
       glossarySearch={glossarySearch}
       setGlossarySearch={setGlossarySearch}
       handleGlossaryAgentPopulate={handleGlossaryAgentPopulate}
       initialEdges={initialEdges}
      />
     )}    </>
  );
}
