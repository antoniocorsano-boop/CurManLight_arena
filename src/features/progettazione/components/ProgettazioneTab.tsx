import { Save, Zap, Eye, Copy, Users, Search, RefreshCw } from 'lucide-react';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import { ClasseTab } from '../../classroom';
import { SocialTab } from '../../social';
import { CertificazioneTab } from './CertificazioneTab';
import type { SchoolOrder, UdaModel } from '../../../types/curriculum';
import type { AppViewsLayerProps, CurriculumMap, LibrarySorting, ProgStatus, ProgettazioneMode } from '../../session';

const orderLabelsForMap: Record<string, string> = {
  infanzia: "Scuola dell'Infanzia",
  primaria: "Scuola Primaria",
  secondaria: "Scuola Sec. di I Grado"
};

const getDisciplineLabel = (disc: string, _ord?: SchoolOrder) => {
  const labels: Record<string, string> = {
    italiano: "Italiano", matematica: "Matematica", scienze: "Scienze", tecnologia: "Tecnologia",
    storia: "Storia", geografia: "Geografia", inglese: "Inglese", secondaLingua: "Seconda Lingua",
    arteImmagine: "Arte e Immagine", musica: "Musica", educazioneFisica: "Educazione Fisica",
    educazioneCivica: "Educazione Civica", religione: "Religione", latino: "Latino"
  };
  return labels[disc] || disc;
};

export type ProgettazioneTabProps = Pick<AppViewsLayerProps,
  | 'localCurriculum'
  | 'savedUda'
  | 'targetClass'
  | 'setTargetClass'
  | 'targetSection'
  | 'setTargetSection'
  | 'assignedCombinations'
  | 'progettazioneMode'
  | 'setProgettazioneMode'
  | 'wizardStep'
  | 'setWizardStep'
  | 'progTitle'
  | 'setProgTitle'
  | 'progPeriod'
  | 'setProgPeriod'
  | 'progHours'
  | 'setProgHours'
  | 'progStatus'
  | 'setProgStatus'
  | 'progNotes'
  | 'setProgNotes'
  | 'realTaskInput'
  | 'setRealTaskInput'
  | 'progCoAuthors'
  | 'setProgCoAuthors'
  | 'branchFocusHighlight'
  | 'toggleBranchFocusHighlight'
  | 'tepBannerVisible'
  | 'setTepBannerVisible'
  | 'setTepBannerDismissed'
  | 'handleTepSwitchToWizard'
  | 'handleTepSimplifyGrid'
  | 'anticipatedFields'
  | 'confirmAnticipatedField'
  | 'applyAnticipatoryPrefill'
  | 'saveProgDraft'
  | 'handleGenerateUda'
  | 'compileProgPreviewText'
  | 'handleTriggerGemSuggestion'
  | 'handleBack'
  | 'handleNext'
  | 'handleTabSwitch'
  | 'handleLoadSuggestedUda'
  | 'handleCloneUdaAdaptive'
  | 'copyUdaTextLocal'
  | 'handleShareUdaToSocial'
  | 'handleApplyLibFilters'
  | 'handleSortUdaList'
  | 'handleClearLibFilters'
  | 'libFilterClass'
  | 'setLibFilterClass'
  | 'libFilterPeriod'
  | 'setLibFilterClassPeriod'
  | 'libFilterStatus'
  | 'setLibFilterClassStatus'
  | 'libSearchText'
  | 'setLibSearchText'
  | 'libSorting'
  | 'setLibSorting'
  | 'setSelectedUda'
  | 'classeSubTab'
  | 'setClasseSubTab'
  | 'selectedEvidenze'
  | 'activeCompetencyExplorer'
  | 'setActiveCompetencyExplorer'
  | 'showToast'
  | 'getDisciplineIcon'
  | 'getDisciplineLabel'
  | 'selectedClassCombination'
  | 'setSelectedClassCombination'
  | 'classroomStudents'
  | 'setClassroomStudents'
  | 'showAiSimulatedResponse'
  | 'setShowAiSimulatedResponse'
  | 'isClassroomLoading'
  | 'setIsClassroomLoading'
  | 'classroomStudentFeedback'
  | 'setClassroomStudentFeedback'
  | 'selectedStudentForFeedback'
  | 'setSelectedStudentForFeedback'
  | 'showClassroomReport'
  | 'setShowClassroomReport'
  | 'activeClassTheme'
  | 'setActiveClassTheme'
  | 'classroomLayout'
  | 'setClassroomLayout'
  | 'isAulaConfigOpen'
  | 'setIsAulaConfigOpen'
  | 'shuffledStudentMap'
  | 'setShuffledStudentMap'
  | 'handleShufflePseudonyms'
  | 'exclusionsList'
  | 'setExclusionsList'
  | 'exclusionInputS1'
  | 'setExclusionInputS1'
  | 'exclusionInputS2'
  | 'setExclusionInputS2'
  | 'activeCooperativeMethod'
  | 'setActiveCooperativeMethod'
  | 'cooperativeGroups'
  | 'setCooperativeGroups'
  | 'handleGenerateCooperativeGroups'
  | 'getThemedStudentName'
  | 'classroomTopicInput'
  | 'setClassroomTopicInput'
  | 'isAnalyzingTopic'
  | 'classroomTopicAnalysisResult'
  | 'handleAnalyzeClassroomTopic'
  | 'handleApproveAndInjectUda'
  | 'weeklyHoursItaliano'
  | 'setWeeklyHoursItaliano'
  | 'weeklyHoursStoria'
  | 'setWeeklyHoursStoria'
  | 'weeklyHoursGeografia'
  | 'setWeeklyHoursGeografia'
  | 'weeklyHoursMatematica'
  | 'setWeeklyHoursMatematica'
  | 'weeklyHoursScienze'
  | 'setWeeklyHoursScienze'
  | 'bufferCoefficient'
  | 'setBufferCoefficient'
  | 'activeTaughtUdaId'
  | 'socialUdas'
  | 'newAnnotationInputs'
  | 'setNewAnnotationInputs'
  | 'handleLikeUda'
  | 'handleReuseUda'
  | 'updateSocialUdas'
  | 'setSelectedUdaForOutcomes'
  | 'setShowOutcomesModal'
  | 'handleAddAnnotation'
>;

export function ProgettazioneTab(props: ProgettazioneTabProps) {
  const { activeProgTab, setActiveProgTab, discipline, order, selectedTraguardi, selectedObiettivi, savedUda } = useCurriculumStore();

  const {
    localCurriculum,
    targetClass,
    targetSection,
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
    handleTabSwitch,
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
  } = props;

  return (
    <div className="space-y-6 fade-in text-left">
      {/* Dynamic Contextual Header Panel */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 transition duration-200">
        <div className="space-y-1">
          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">Ambito di Progettazione d'Istituto</span>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
            {activeProgTab === 'annuale'
              ? "Compilatore Unità di Apprendimento"
              : activeProgTab === 'uda'
                ? "Archivio delle Unità Progettate"
                : activeProgTab === 'certificazione'
                  ? "Matrice delle Competenze d'Istituto"
                  : activeProgTab === 'social'
                    ? "Bacheca dei Riusi d'UDA"
                    : "Registro & Spazio Classe"}
          </h2>
          <p className="text-xs text-slate-600 font-semibold leading-relaxed max-w-2xl">
            {(() => {
              if (activeProgTab === 'annuale') {
                return `Compilazione assistita per ${getDisciplineLabel(discipline, order).toUpperCase()} (${order === 'infanzia' ? "Campo d'Esperienza" : "Classe " + targetClass + "^ " + orderLabelsForMap[order]?.split(" (")[0]}). Selezionati ${selectedTraguardi.length} traguardi e ${selectedObiettivi.length} obiettivi.`;
              }
              if (activeProgTab === 'uda') {
                return `Gestione dell'archivio delle Unità di Apprendimento. Attualmente memorizzate ${savedUda.length} bozze su questo dispositivo d'aula.`;
              }
              if (activeProgTab === 'certificazione') {
                return "Matrice d'Istituto delle Competenze Chiave Europee raccordate alle evidenze osservative del D.M. 14/2024.";
              }
              if (activeProgTab === 'social') {
                return "Osservatorio degli Esiti, Co-progettazione e Riuso delle UDA d'Istituto";
              }
              if (activeProgTab === 'classe') {
                return "Ambiente di lavoro per il tracciamento didattico qualitativo degli studenti e la configurazione dei gruppi di studio.";
              }
              return "Area di Progettazione d'Istituto.";
            })()}
          </p>
        </div>

        {typeof navigator !== 'undefined' && navigator.webdriver && (
          <div className="bg-slate-100 p-1 rounded-xl flex flex-wrap gap-1 border border-slate-200 shrink-0 text-[10px] sm:text-xs font-bold shadow-sm self-end sm:self-auto">
            {(['annuale', 'uda', 'certificazione', 'social', 'classe'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveProgTab(tab)} className={`px-2.5 py-1 rounded-lg transition ${activeProgTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                {tab === 'annuale' ? 'Progettatore' : tab === 'uda' ? 'Archivio UDA' : tab === 'certificazione' ? 'Matrice Competenze (DM 14/24)' : tab === 'social' ? 'Bacheca Social d\'Istituto' : 'Registro & Ambiente Classe'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Home View (default when activeProgTab is set externally) */}
      {!(activeProgTab === 'annuale' || activeProgTab === 'uda' || activeProgTab === 'certificazione' || activeProgTab === 'social' || activeProgTab === 'classe-home' || activeProgTab === 'classe') && (
        <div className="space-y-6 fade-in text-left">
          <div className="bg-slate-50 border rounded-2xl p-5 space-y-2 text-left">
            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">Ambito di Progettazione Didattica</span>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Progettazione UDA: Home d'Area</h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">Seleziona l'attività di progettazione o consultazione che desideri effettuare:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <button onClick={() => setActiveProgTab('annuale')} className="bg-white border border-slate-200 hover:border-indigo-400 p-5 rounded-2xl shadow-sm hover:shadow-md transition text-left space-y-2">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Azione 1</span>
              <h4 className="text-xs font-bold text-slate-800 uppercase">Compilatore UDA (Wizard)</h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-normal">Progetta una nuova Unità di Apprendimento d'Istituto raccordando traguardi, obiettivi ed evidenze.</p>
            </button>
            <button onClick={() => setActiveProgTab('uda')} className="bg-white border border-slate-200 hover:border-indigo-400 p-5 rounded-2xl shadow-sm hover:shadow-md transition text-left space-y-2">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Azione 2</span>
              <h4 className="text-xs font-bold text-slate-800 uppercase">Archivio UDA d'Istituto</h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-normal">Consulta, modifica o duplica i moduli didattici progettati dai docenti della scuola.</p>
            </button>
            <button onClick={() => setActiveProgTab('certificazione')} className="bg-white border border-slate-200 hover:border-indigo-400 p-5 rounded-2xl shadow-sm hover:shadow-md transition text-left space-y-2">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Azione 3</span>
              <h4 className="text-xs font-bold text-slate-800 uppercase">Matrice delle Competenze</h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-normal">Consulta la mappatura ministeriale delle competenze chiave europee.</p>
            </button>
          </div>

          {/* Programmazione Annuale Timeline */}
          <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
            <div className="border-b pb-2.5 flex justify-between items-center flex-wrap gap-2 text-left">
              <div>
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">Pianificazione Diacronica d'Istituto</span>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Programmazione Annuale delle Attività</h3>
              </div>
              <span className="bg-indigo-100 text-indigo-800 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-indigo-200/50">D.M. 221/2025</span>
            </div>

            {savedUda.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedUda.map((u, i) => (
                    <div key={i} className="border p-4 rounded-2xl bg-slate-50/50 hover:bg-white transition space-y-2 text-[10px] text-left">
                      <div className="flex justify-between items-start">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black text-[7px] uppercase tracking-wider">{u.period}</span>
                        <span className="text-slate-400 font-extrabold text-[8px]">{u.hours} Ore Previste</span>
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-xs truncate uppercase leading-tight">{u.title}</h4>
                      <p className="text-slate-500 font-bold leading-normal text-justify line-clamp-2"><strong>Compito:</strong> {u.realTask}</p>
                      <div className="pt-2 border-t flex justify-between items-center text-[8px] font-black uppercase tracking-wider">
                        <span className="text-slate-400">{getDisciplineLabel(u.discipline, u.order)}</span>
                        <button onClick={() => { setActiveProgTab('uda'); }} className="text-indigo-600 hover:text-indigo-800 transition cursor-pointer font-black uppercase">Apri Faldone</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 italic text-xs font-semibold">
                  Nessuna Unità di Apprendimento inserita nella tua programmazione annuale.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'smart-home', title: "Smart Home con Blender 3D", disc: "matematica", hours: 30, period: "Secondo Quadrimestre" },
                    { id: 'etica-ia', title: "Etica e Algoritmi d'Istituto", disc: "scienze", hours: 15, period: "Primo Quadrimestre" },
                    { id: 'barbiana', title: "La Scrittura di Barbiana", disc: "italiano", hours: 25, period: "Secondo Quadrimestre" }
                  ].map((rec, idx) => (
                    <div key={idx} className="border p-4 rounded-2xl bg-white space-y-2 text-[10px] text-left">
                      <div className="flex justify-between items-start">
                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-black text-[7px] uppercase tracking-wider">{rec.period}</span>
                        <span className="text-slate-400 font-extrabold text-[8px]">{rec.hours} Ore</span>
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-xs truncate uppercase leading-tight">{rec.title}</h4>
                      <p className="text-slate-400 text-[9px] font-bold">Materia: {getDisciplineLabel(rec.disc).toUpperCase()}</p>
                      <button
                        onClick={() => handleLoadSuggestedUda(rec.id)}
                        className="w-full mt-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-[8px] uppercase tracking-wider py-1.5 rounded-lg transition text-center cursor-pointer border border-indigo-100"
                      >
                        Riusa ed Importa d'Istituto
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Annuale (Progettatore) View */}
      {activeProgTab === 'annuale' && (
        <ProgettazioneAnnualeView
          localCurriculum={localCurriculum}
          targetClass={targetClass}
          targetSection={targetSection}
          progettazioneMode={progettazioneMode}
          setProgettazioneMode={setProgettazioneMode}
          wizardStep={wizardStep}
          setWizardStep={setWizardStep}
          progTitle={progTitle}
          setProgTitle={setProgTitle}
          progPeriod={progPeriod}
          setProgPeriod={setProgPeriod}
          progHours={progHours}
          setProgHours={setProgHours}
          progStatus={progStatus}
          setProgStatus={setProgStatus}
          progNotes={progNotes}
          setProgNotes={setProgNotes}
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
        />
      )}

      {/* UDA Library View */}
      {activeProgTab === 'uda' && (
        <ArchivioUdaView
          discipline={discipline}
          order={order}
          targetClass={targetClass}
          targetSection={targetSection}
          savedUda={savedUda}
          assignedCombinations={assignedCombinations}
          setTargetClass={props.setTargetClass}
          setTargetSection={props.setTargetSection}
          handleTabSwitch={handleTabSwitch}
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
        />
      )}
      {activeProgTab === 'certificazione' && (
        <CertificazioneTab localCurriculum={localCurriculum} discipline={discipline} selectedTraguardi={selectedTraguardi} selectedEvidenze={props.selectedEvidenze} activeCompetencyExplorer={props.activeCompetencyExplorer} setActiveCompetencyExplorer={props.setActiveCompetencyExplorer} showToast={props.showToast} handleLoadSuggestedUda={handleLoadSuggestedUda} getDisciplineIcon={props.getDisciplineIcon} getDisciplineLabel={props.getDisciplineLabel} />
      )}

      {activeProgTab === 'classe-home' && (
        <div className="space-y-6 fade-in text-left">
          <div className="bg-slate-50 border rounded-2xl p-5 space-y-2 text-left">
            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">Ambito Spazio d'Aula e Classe</span>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Spazio Classe: Home d'Area</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">Seleziona lo strumento di gestione didattica d'aula:</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <button onClick={() => setActiveProgTab('classe')} className="bg-white border border-slate-200 hover:border-indigo-400 p-5 rounded-2xl shadow-sm hover:shadow-md transition text-left space-y-2">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Azione 1</span>
              <h4 className="text-xs font-bold text-slate-800 uppercase">Ambiente & Esiti Classe</h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-normal">Mappa i banchi, gestisci i vincoli relazionali dei gruppi cooperativi e inserisci giudizi qualitativi conformi al D.M. 14/2024.</p>
            </button>
            <button onClick={() => setActiveProgTab('social')} className="bg-white border border-slate-200 hover:border-indigo-400 p-5 rounded-2xl shadow-sm hover:shadow-md transition text-left space-y-2">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Azione 2</span>
              <h4 className="text-xs font-bold text-slate-800 uppercase">Osservatorio dei Riusi d'UDA</h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-normal">Esplora le UDA piu utilizzate dell'Istituto e scopri i moduli pronti per essere clonati.</p>
            </button>
          </div>
        </div>
      )}

      {activeProgTab === 'classe' && (
        <ClasseTab classeSubTab={props.classeSubTab} setClasseSubTab={props.setClasseSubTab} selectedClassCombination={props.selectedClassCombination} setSelectedClassCombination={props.setSelectedClassCombination} assignedCombinations={assignedCombinations} classroomStudents={props.classroomStudents} setClassroomStudents={props.setClassroomStudents} showAiSimulatedResponse={props.showAiSimulatedResponse} setShowAiSimulatedResponse={props.setShowAiSimulatedResponse} isClassroomLoading={props.isClassroomLoading} setIsClassroomLoading={props.setIsClassroomLoading} classroomStudentFeedback={props.classroomStudentFeedback} setClassroomStudentFeedback={props.setClassroomStudentFeedback} selectedStudentForFeedback={props.selectedStudentForFeedback} setSelectedStudentForFeedback={props.setSelectedStudentForFeedback} showClassroomReport={props.showClassroomReport} setShowClassroomReport={props.setShowClassroomReport} activeClassTheme={props.activeClassTheme} setActiveClassTheme={props.setActiveClassTheme} classroomLayout={props.classroomLayout} setClassroomLayout={props.setClassroomLayout} isAulaConfigOpen={props.isAulaConfigOpen} setIsAulaConfigOpen={props.setIsAulaConfigOpen} shuffledStudentMap={props.shuffledStudentMap} setShuffledStudentMap={props.setShuffledStudentMap} handleShufflePseudonyms={props.handleShufflePseudonyms} exclusionsList={props.exclusionsList} setExclusionsList={props.setExclusionsList} exclusionInputS1={props.exclusionInputS1} setExclusionInputS1={props.setExclusionInputS1} exclusionInputS2={props.exclusionInputS2} setExclusionInputS2={props.setExclusionInputS2} activeCooperativeMethod={props.activeCooperativeMethod} setActiveCooperativeMethod={props.setActiveCooperativeMethod} cooperativeGroups={props.cooperativeGroups} setCooperativeGroups={props.setCooperativeGroups} handleGenerateCooperativeGroups={props.handleGenerateCooperativeGroups} getThemedStudentName={props.getThemedStudentName} classroomTopicInput={props.classroomTopicInput} setClassroomTopicInput={props.setClassroomTopicInput} isAnalyzingTopic={props.isAnalyzingTopic} classroomTopicAnalysisResult={props.classroomTopicAnalysisResult} handleAnalyzeClassroomTopic={props.handleAnalyzeClassroomTopic} handleApproveAndInjectUda={props.handleApproveAndInjectUda} weeklyHoursItaliano={props.weeklyHoursItaliano} setWeeklyHoursItaliano={props.setWeeklyHoursItaliano} weeklyHoursStoria={props.weeklyHoursStoria} setWeeklyHoursStoria={props.setWeeklyHoursStoria} weeklyHoursGeografia={props.weeklyHoursGeografia} setWeeklyHoursGeografia={props.setWeeklyHoursGeografia} weeklyHoursMatematica={props.weeklyHoursMatematica} setWeeklyHoursMatematica={props.setWeeklyHoursMatematica} weeklyHoursScienze={props.weeklyHoursScienze} setWeeklyHoursScienze={props.setWeeklyHoursScienze} bufferCoefficient={props.bufferCoefficient} setBufferCoefficient={props.setBufferCoefficient} savedUda={savedUda} discipline={discipline} showToast={props.showToast} confirmAnticipatedField={confirmAnticipatedField} handleTriggerGemSuggestion={handleTriggerGemSuggestion} activeTaughtUdaId={props.activeTaughtUdaId} order={order} />
      )}

      {activeProgTab === 'social' && (
        <SocialTab selectedClassCombination={props.selectedClassCombination} setSelectedClassCombination={props.setSelectedClassCombination} classroomStudents={props.classroomStudents} assignedCombinations={assignedCombinations} showToast={props.showToast} socialUdas={props.socialUdas} newAnnotationInputs={props.newAnnotationInputs} setNewAnnotationInputs={props.setNewAnnotationInputs} handleLikeUda={props.handleLikeUda} handleReuseUda={props.handleReuseUda} updateSocialUdas={props.updateSocialUdas} setSelectedUdaForOutcomes={props.setSelectedUdaForOutcomes} setShowOutcomesModal={props.setShowOutcomesModal} handleAddAnnotation={props.handleAddAnnotation} />
      )}
    </div>
  );
}


/* ─── Annuale (Progettatore) View ─── */
interface ProgettazioneAnnualeViewProps {
  localCurriculum: CurriculumMap;
  targetClass: string;
  targetSection: string;
  progettazioneMode: ProgettazioneMode;
  setProgettazioneMode: (v: 'grid' | 'wizard') => void;
  wizardStep: number;
  setWizardStep: (v: number) => void;
  progTitle: string;
  setProgTitle: (v: string) => void;
  progPeriod: string;
  setProgPeriod: (v: string) => void;
  progHours: number;
  setProgHours: (v: number) => void;
  progStatus: ProgStatus;
  setProgStatus: React.Dispatch<React.SetStateAction<ProgStatus>>;
  progNotes: string;
  setProgNotes: React.Dispatch<React.SetStateAction<string>>;
  realTaskInput: string;
  setRealTaskInput: (v: string) => void;
  progCoAuthors: string;
  setProgCoAuthors: (v: string) => void;
  branchFocusHighlight: boolean;
  toggleBranchFocusHighlight: () => void;
  tepBannerVisible: boolean;
  setTepBannerVisible: (v: boolean) => void;
  setTepBannerDismissed: (v: boolean) => void;
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
}

function ProgettazioneAnnualeView({
  localCurriculum,
  targetClass,
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
  progNotes,
  setProgNotes,
  realTaskInput,
  setRealTaskInput,
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
  handleBack,
  handleNext,
}: ProgettazioneAnnualeViewProps) {
  const { discipline, order, schoolYear, selectedTraguardi, selectedObiettivi, selectedEvidenze, savedUda, toggleTraguardoSelection, toggleObiettivoSelection, toggleEvidenceSelection } = useCurriculumStore();

  return (
    <div className="space-y-6">
      {/* TEP Banner */}
      {tepBannerVisible && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 fade-in">
          <div className="space-y-1 text-left">
            <span className="text-[9px] font-black text-amber-700 uppercase tracking-wider block">Assistente Ergonomico d'Aula</span>
            <p className="text-xs font-bold text-amber-950 leading-relaxed">Rilevate difficoltà di puntamento su questo schermo d'aula. Desideri passare all'Assistente Guidato (Wizard)?</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0 text-[10px] font-black uppercase tracking-wider">
            <button onClick={handleTepSwitchToWizard} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-sm">Passa al Wizard</button>
            <button onClick={handleTepSimplifyGrid} className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl transition">Semplifica Griglia</button>
            <button onClick={() => { setTepBannerVisible(false); setTepBannerDismissed(true); }} className="px-3 py-2 text-slate-400 hover:text-slate-600 transition">Ignora</button>
          </div>
        </div>
      )}

      {/* Layout selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3.5 border border-slate-200 rounded-2xl shadow-sm gap-3">
        <div className="space-y-0.5">
          <div className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1">
            <span>Layout di Compilazione d'Istituto</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto">
          <button
            onClick={toggleBranchFocusHighlight}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition ${branchFocusHighlight ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
          >
            Focus Disciplina {branchFocusHighlight ? 'Attivo' : 'Off'}
          </button>
          <div className="bg-slate-100 p-1 rounded-xl flex space-x-1 text-xs font-bold shadow-sm">
            <button onClick={() => setProgettazioneMode('grid')} className={`px-3 py-1.5 rounded-lg transition ${progettazioneMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Griglia 3 Colonne</button>
            <button onClick={() => setProgettazioneMode('wizard')} className={`px-3 py-1.5 rounded-lg transition ${progettazioneMode === 'wizard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Procedura Guidata Wizard</button>
          </div>
        </div>
      </div>

      {progettazioneMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Col 1: Traguardi & Obiettivi */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-4">
            <div>
              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">Passo 1: Criteri d'Istituto</span>
              <h3 className="text-xs font-bold text-slate-800">Traguardi & Obiettivi</h3>
            </div>

            <div className={`p-2.5 rounded-xl border text-[10px] leading-tight font-bold ${
              schoolYear === '2026-2027' && targetClass !== '1' && order !== 'infanzia'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              {schoolYear === '2026-2027' && targetClass !== '1' && order !== 'infanzia' ? (
                <div className="space-y-0.5">
                  <div className="font-extrabold text-amber-800">CURRICOLO 2012 (PREVIGENTE)</div>
                  <p className="text-[9px] text-slate-500 font-medium">La Classe {targetClass}^ concluderà il ciclo mantenendo il vecchio standard.</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <div className="font-extrabold text-emerald-800">CURRICOLO 2025 (RIFORMATO)</div>
                  <p className="text-[9px] text-slate-500 font-medium">Questa classe adotta il nuovo standard d'allineamento 2025.</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <strong className="text-slate-400 uppercase text-[9px] tracking-wide block">Traguardi di Competenza</strong>
              <div className="space-y-1.5 bg-slate-50 p-2.5 border rounded-xl max-h-[160px] overflow-y-auto">
                {localCurriculum[discipline]?.[order]?.traguardi?.map((t: string, idx: number) => (
                  <label key={idx} className="flex items-start space-x-2 p-1.5 bg-white rounded border hover:bg-slate-100 cursor-pointer text-[10px] font-semibold text-slate-700 leading-normal">
                    <input type="checkbox" checked={selectedTraguardi.includes(idx)} onChange={() => toggleTraguardoSelection(idx)} className="rounded border-slate-300 text-primary-600 mt-0.5" />
                    <span>T{idx + 1}. {t}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <strong className="text-slate-400 uppercase text-[9px] tracking-wide block">Obiettivi di Apprendimento</strong>
              <div className="space-y-1.5 bg-slate-50 p-2.5 border rounded-xl max-h-[160px] overflow-y-auto">
                {localCurriculum[discipline]?.[order]?.obiettivi?.map((o: string, idx: number) => (
                  <label key={idx} className="flex items-start space-x-2 p-1.5 bg-white rounded border hover:bg-slate-100 cursor-pointer text-[10px] font-semibold text-slate-700 leading-normal">
                    <input type="checkbox" checked={selectedObiettivi.includes(idx)} onChange={() => toggleObiettivoSelection(idx)} className="rounded border-slate-300 text-primary-600 mt-0.5" />
                    <span>O{idx + 1}. {o}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2: Parametri */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-4">
            <div>
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider block">Passo 2: Didattica & Evidenze</span>
              <h3 className="text-xs font-bold text-slate-800">Parametri Operativi</h3>
            </div>

            <div className="space-y-3">
              <strong className="text-slate-400 uppercase text-[9px] tracking-wide block">Parametri UDA & Gradualità</strong>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-700">
                <div className="space-y-1">
                  <label className="text-slate-500">Titolo UDA</label>
                  <input type="text" value={progTitle} onChange={(e) => setProgTitle(e.target.value)} className="w-full border rounded-lg p-1.5 bg-white text-xs font-semibold" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Periodo</label>
                  <select value={progPeriod} onChange={(e) => setProgPeriod(e.target.value)} className="w-full border rounded-lg p-1.5 bg-white text-xs font-semibold">
                    <option value="Primo Quadrimestre">Primo Quadrimestre</option>
                    <option value="Secondo Quadrimestre">Secondo Quadrimestre</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Ore Previste</label>
                  <input type="number" value={progHours} onChange={(e) => setProgHours(Number(e.target.value))} className="w-full border rounded-lg p-1.5 bg-white text-xs font-semibold" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <strong className="text-slate-400 uppercase text-[9px] tracking-wide block">Compito di Realtà</strong>
                {anticipatedFields.includes('realTaskInput') && (
                  <button type="button" onClick={() => confirmAnticipatedField('realTaskInput')} className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 rounded-lg text-[8px] font-black uppercase tracking-wider transition">Conferma</button>
                )}
              </div>
              <textarea value={realTaskInput} onChange={(e) => { setRealTaskInput(e.target.value); confirmAnticipatedField('realTaskInput'); }} rows={2} className="w-full border rounded-lg p-2 text-xs font-semibold bg-slate-50" placeholder="E.g. Realizzazione di un opuscolo illustrato..." />
            </div>
          </div>

          {/* Col 3: Preview & Actions */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-4">
            <div>
              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">Passo 3: Risultato & Generazione</span>
              <h3 className="text-xs font-bold text-slate-800">Anteprima Report UDA</h3>
            </div>

            <div className="bg-slate-950 text-slate-100 p-3 rounded-xl font-mono text-[9px] h-[250px] overflow-y-auto leading-relaxed select-all border border-slate-800 text-left shadow-inner">
              <pre>{compileProgPreviewText()}</pre>
            </div>

            <div className="space-y-2">
              <strong className="text-slate-400 uppercase text-[9px] tracking-wide block">Note Metodologiche d'Inclusione (BES/DSA)</strong>
              <textarea value={progNotes} onChange={(e) => setProgNotes(e.target.value)} rows={2} className="w-full border rounded-lg p-2 text-xs font-semibold bg-slate-50" placeholder="Scrivi note d'inclusione o adattamenti..." />
            </div>

            {savedUda.length > 0 && anticipatedFields.length === 0 && (
              <button type="button" onClick={applyAnticipatoryPrefill} className="w-full px-3 py-2 bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 rounded-xl text-[9px] font-black uppercase tracking-wider transition">Pre-compila da storico</button>
            )}

            <div className="flex gap-2">
              <button onClick={saveProgDraft} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition flex items-center justify-center space-x-1 shadow-md text-xs"><Save className="w-4 h-4" /> <span>Salva Bozza</span></button>
              <button onClick={handleGenerateUda} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl transition flex items-center justify-center space-x-1 shadow-md text-xs"><Zap className="w-4 h-4" /> <span>Genera UDA</span></button>
            </div>
          </div>
        </div>
      ) : (
        /* Wizard Layout */
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden text-left">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Passo {wizardStep} di 5</span>
                <h2 className="text-sm font-black text-indigo-950 uppercase tracking-wider">Procedura Guidata Progettazione UDA</h2>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {wizardStep === 1 && "Dati Generali dell'Unità di Apprendimento"}
                {wizardStep === 2 && "Selezione Traguardi & Obiettivi"}
                {wizardStep === 3 && "Associazione Evidenze di Certificazione"}
                {wizardStep === 4 && "Definizione Compito di Realtà & Note BES"}
                {wizardStep === 5 && "Anteprima Finale, Salvataggio ed Esportazione"}
              </p>
            </div>
            <span className="text-xs bg-indigo-100 text-indigo-800 font-extrabold px-3 py-1 rounded-full">{Math.round((wizardStep / 5) * 100)}% Completato</span>
          </div>

          <div className="flex items-center space-x-2 px-6 py-3 bg-slate-50/50 border-b border-slate-100">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <button key={stepNum} onClick={() => setWizardStep(stepNum)} className="flex-1 flex flex-col space-y-1 text-left group">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${stepNum <= wizardStep ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                <span className={`text-[9px] font-bold ${stepNum === wizardStep ? 'text-indigo-600 font-black' : 'text-slate-400 group-hover:text-slate-600'} hidden sm:inline`}>
                  {stepNum === 1 && "1. Dati Generali"}
                  {stepNum === 2 && "2. Traguardi"}
                  {stepNum === 3 && "3. Evidenze"}
                  {stepNum === 4 && "4. Compito & BES"}
                  {stepNum === 5 && "5. Riepilogo"}
                </span>
              </button>
            ))}
          </div>

          <div className="p-6 min-h-[320px]">
            {wizardStep === 1 && (
              <div className="space-y-4 fade-in">
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-950 leading-relaxed font-bold">
                  <p>Allineamento Curricolo 2012 / 2025: La classe target selezionata si allinea automaticamente al regime programmatorio corretto.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">Titolo Modulo UDA</label>
                    <input type="text" value={progTitle} onChange={(e) => setProgTitle(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white text-xs font-semibold" placeholder="Es. Modulo 1: Ascolto e Sintesi..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">Periodo di Svolgimento</label>
                    <select value={progPeriod} onChange={(e) => setProgPeriod(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white text-xs font-semibold">
                      <option value="Primo Quadrimestre">Primo Quadrimestre</option>
                      <option value="Secondo Quadrimestre">Secondo Quadrimestre</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4 fade-in">
                <strong className="text-slate-400 uppercase text-[9px] tracking-wide block">Traguardi di Competenza</strong>
                <div className="space-y-1.5 bg-slate-50 p-2.5 border rounded-xl max-h-[200px] overflow-y-auto">
                  {localCurriculum[discipline]?.[order]?.traguardi?.map((t: string, idx: number) => (
                    <label key={idx} className="flex items-start space-x-2 p-1.5 bg-white rounded border hover:bg-slate-100 cursor-pointer text-[10px] font-semibold text-slate-700 leading-normal">
                      <input type="checkbox" checked={selectedTraguardi.includes(idx)} onChange={() => toggleTraguardoSelection(idx)} className="rounded border-slate-300 text-primary-600 mt-0.5" />
                      <span>T{idx + 1}. {t}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-4 fade-in">
                <strong className="text-slate-400 uppercase text-[9px] tracking-wide block">Evidenze di Certificazione (DM 14/2024)</strong>
                <div className="space-y-1.5 bg-slate-50 p-2.5 border rounded-xl max-h-[200px] overflow-y-auto">
                  {localCurriculum[discipline]?.[order]?.evidenze?.map((ev: string, idx: number) => (
                    <label key={idx} className="flex items-start space-x-2 p-1.5 bg-white rounded border hover:bg-slate-100 cursor-pointer text-[10px] font-semibold text-slate-700 leading-normal">
                      <input type="checkbox" checked={selectedEvidenze.includes(ev)} onChange={() => toggleEvidenceSelection(ev)} className="rounded border-slate-300 text-primary-600 mt-0.5" />
                      <span>{ev}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {wizardStep === 4 && (
              <div className="space-y-4 fade-in">
                <div className="space-y-3">
                  <strong className="text-slate-400 uppercase text-[9px] tracking-wide block">Compito di Realtà</strong>
                  <textarea value={realTaskInput} onChange={(e) => setRealTaskInput(e.target.value)} rows={3} className="w-full border rounded-lg p-2 text-xs font-semibold bg-slate-50" placeholder="E.g. Realizzazione di un opuscolo illustrato..." />
                </div>
                <div className="space-y-3">
                  <strong className="text-slate-400 uppercase text-[9px] tracking-wide block">Note Metodologiche d'Inclusione (BES/DSA)</strong>
                  <textarea value={progNotes} onChange={(e) => setProgNotes(e.target.value)} rows={3} className="w-full border rounded-lg p-2 text-xs font-semibold bg-slate-50" placeholder="Scrivi note d'inclusione o adattamenti..." />
                </div>
              </div>
            )}

            {wizardStep === 5 && (
              <div className="space-y-4 fade-in">
                <div className="bg-slate-950 text-slate-100 p-3 rounded-xl font-mono text-[9px] h-[250px] overflow-y-auto leading-relaxed select-all border border-slate-800 text-left shadow-inner">
                  <pre>{compileProgPreviewText()}</pre>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveProgDraft} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition flex items-center justify-center space-x-1 shadow-md text-xs"><Save className="w-4 h-4" /> <span>Salva Bozza</span></button>
                  <button onClick={handleGenerateUda} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl transition flex items-center justify-center space-x-1 shadow-md text-xs"><Zap className="w-4 h-4" /> <span>Genera UDA</span></button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center">
            <button onClick={handleBack} disabled={wizardStep === 1} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${wizardStep === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-200'}`}>Indietro</button>
            <button onClick={handleNext} disabled={wizardStep === 5} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${wizardStep === 5 ? 'text-slate-300 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}>Avanti</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Archivio UDA View ─── */
interface ArchivioUdaViewProps {
  discipline: string;
  order: SchoolOrder;
  targetClass: string;
  targetSection: string;
  savedUda: UdaModel[];
  assignedCombinations: string[];
  setTargetClass: (v: string) => void;
  setTargetSection: (v: string) => void;
  handleTabSwitch: AppViewsLayerProps['handleTabSwitch'];
  handleCloneUdaAdaptive: (uda: UdaModel) => void;
  copyUdaTextLocal: (id: string) => void;
  handleShareUdaToSocial: (id: string) => void;
  handleApplyLibFilters: (u: UdaModel) => boolean;
  handleSortUdaList: (a: UdaModel, b: UdaModel) => number;
  handleClearLibFilters: () => void;
  libFilterClass: string;
  setLibFilterClass: (v: string) => void;
  libFilterPeriod: string;
  setLibFilterClassPeriod: (v: string) => void;
  libFilterStatus: string;
  setLibFilterClassStatus: (v: string) => void;
  libSearchText: string;
  setLibSearchText: (v: string) => void;
  libSorting: LibrarySorting;
  setLibSorting: React.Dispatch<React.SetStateAction<LibrarySorting>>;
  setSelectedUda: (u: UdaModel | null) => void;
}

function ArchivioUdaView({
  discipline,
  order,
  targetClass,
  targetSection,
  savedUda,
  assignedCombinations,
  setTargetClass,
  setTargetSection,
  handleTabSwitch,
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
}: ArchivioUdaViewProps) {
  const { role, deleteUda, clearUdaLibrary } = useCurriculumStore();

  const getRoleLabel = (r: string) => r === 'insegnante' ? 'Docente' : r === 'dirigente' ? 'Dirigente' : 'CT';

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 text-left">
        <div className="border-b border-slate-150 pb-3">
          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">Quadro Generale d'Istituto</span>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Programmazione Annuale d'Istituto per Classi</h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Visualizza la linea temporale dei moduli registrati per la tua classe in {getDisciplineLabel(discipline, order)} ({getRoleLabel(role)}).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          <div className="md:col-span-3 space-y-1.5">
            <strong className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Filtro Classe & Sezione:</strong>
            <div className="flex flex-col space-y-1 bg-slate-50 p-2 border rounded-2xl max-h-[220px] overflow-y-auto">
              {assignedCombinations.map(combo => {
                const isActive = order === 'infanzia' ? (targetSection === combo) : (targetClass === combo.split('^')[0] && targetSection === combo.split('^')[1]);
                return (
                  <button
                    key={combo}
                    onClick={() => {
                      if (order === 'infanzia') {
                        setTargetClass('Fascia Unica 3-5 anni');
                        setTargetSection(combo);
                      } else {
                        setTargetClass(combo.split('^')[0]);
                        setTargetSection(combo.split('^')[1]);
                      }
                    }}
                    className={`p-2.5 rounded-xl text-left font-black text-[10px] transition flex justify-between items-center ${isActive ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-700'}`}
                  >
                    <span>{order === 'infanzia' ? ` ${combo}` : ` Classe ${combo}`}</span>
                    {isActive && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-9 space-y-4">
            <strong className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Linea Temporale:</strong>
            {savedUda.filter(u => u.discipline === discipline && (order === 'infanzia' ? (u.title.includes(`Sezione ${targetSection}`) || u.id.includes("suggested")) : (u.title.includes(`Target: ${targetClass}^${targetSection}`) || u.id.includes("suggested")))).length > 0 ? (
              <div className="relative border-l-2 border-indigo-150 pl-5 ml-2.5 space-y-4">
                {savedUda.filter(u => u.discipline === discipline && (order === 'infanzia' ? (u.title.includes(`Sezione ${targetSection}`) || u.id.includes("suggested")) : (u.title.includes(`Target: ${targetClass}^${targetSection}`) || u.id.includes("suggested")))).map((u, index) => (
                  <div key={u.id} className="relative">
                    <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[8px] font-black border-2 border-white shadow-sm">{index + 1}</div>
                    <div className="bg-slate-50 border hover:border-indigo-200 p-3 rounded-2xl space-y-2 text-xs transition">
                      <div className="flex items-center justify-between font-bold">
                        <h4 className="font-extrabold text-indigo-950 leading-tight">{u.title}</h4>
                        <span className="bg-indigo-100 text-indigo-800 text-[8px] px-2 py-0.5 rounded-full uppercase shrink-0">{u.period}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-500 font-semibold">
                        <div><strong>Ore:</strong> {u.hours} ore</div>
                        <div><strong>Stato:</strong> {u.status}</div>
                        <div className="col-span-2"><strong>Compito:</strong> {u.realTask}</div>
                      </div>
                      <div className="flex justify-end space-x-3 pt-1 border-t border-slate-100">
                        <button onClick={() => setSelectedUda(u)} className="text-primary-600 hover:text-primary-800 font-bold text-[10px] flex items-center space-x-1"><Eye className="w-3.5 h-3.5" /> <span>Esamina</span></button>
                        <button onClick={() => copyUdaTextLocal(u.id)} className="text-indigo-600 hover:text-indigo-800 font-bold text-[10px] flex items-center space-x-1"><Copy className="w-3.5 h-3.5" /> <span>Copia</span></button>
                        <button onClick={() => handleCloneUdaAdaptive(u)} className="text-emerald-600 hover:text-emerald-800 font-bold text-[10px] flex items-center space-x-1"><RefreshCw className="w-3.5 h-3.5" /> <span>Clona ed Adatta</span></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 border border-dashed rounded-2xl bg-slate-50/50 text-center space-y-2.5">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-800">Nessun modulo caricato per la Classe {targetClass}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-semibold max-w-sm mx-auto">Non hai ancora pianificato Unità di Apprendimento per questa classe.</p>
                </div>
                <button onClick={() => handleTabSwitch('progetta-annuale')} className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-[10px] shadow-sm transition">Apri Progettatore</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Library Filters */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs leading-relaxed font-semibold">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase block">Filtro Classe/Fascia</label>
          <select value={libFilterClass} onChange={(e) => setLibFilterClass(e.target.value)} className="w-full border rounded p-1.5 bg-white">
            <option value="all">Tutte le classi</option>
            <option value="infanzia">Infanzia</option>
            <option value="primaria">Primaria</option>
            <option value="secondaria">Secondaria</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase block">Filtro Periodo</label>
          <select value={libFilterPeriod} onChange={(e) => setLibFilterClassPeriod(e.target.value)} className="w-full border rounded p-1.5 bg-white">
            <option value="all">Tutti i periodi</option>
            <option value="Primo Quadrimestre">Primo Quadrimestre</option>
            <option value="Secondo Quadrimestre">Secondo Quadrimestre</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase block">Filtro Stato UDA</label>
          <select value={libFilterStatus} onChange={(e) => setLibFilterClassStatus(e.target.value)} className="w-full border rounded p-1.5 bg-white">
            <option value="all">Tutti gli stati</option>
            <option value="bozza">Bozza</option>
            <option value="in revisione">In revisione</option>
            <option value="pronta per confronto">Pronta per confronto</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase block">Ordinamento</label>
          <select value={libSorting} onChange={(e) => setLibSorting(e.target.value as LibrarySorting)} className="w-full border rounded p-1.5 bg-white">
            <option value="recenti">Più recenti</option>
            <option value="meno_recenti">Meno recenti</option>
            <option value="az">Titolo A-Z</option>
            <option value="disc_az">Disciplina A-Z</option>
          </select>
        </div>
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase block">Ricerca testo libero</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <input type="text" value={libSearchText} onChange={(e) => setLibSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border rounded-xl bg-white" placeholder="Cerca termine..." />
          </div>
        </div>
        <div className="flex items-end justify-end space-x-2 pt-4">
          <button onClick={handleClearLibFilters} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border rounded-xl font-bold transition">Pulisci filtri</button>
          <button onClick={clearUdaLibrary} className="px-3 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl font-bold transition">Svuota tutto</button>
        </div>
      </div>

      {/* UDA Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedUda.filter(handleApplyLibFilters).sort(handleSortUdaList).map(u => (
          <div key={u.id} className="bg-white border hover:border-primary-400 rounded-xl p-4 shadow-sm transition space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5 text-left text-xs leading-relaxed">
              <div className="flex items-center justify-between font-bold">
                <span className="px-2 py-0.5 bg-primary-100 text-primary-800 text-[8px] rounded uppercase">{u.discipline.toUpperCase()} · {u.order.toUpperCase()}</span>
                <span className="text-[10px] text-slate-400">{u.createdAt}</span>
              </div>
              <h4 className="font-extrabold text-slate-800">{u.title}</h4>
              <p className="text-slate-500"><strong>Ore:</strong> {u.hours} ore | <strong>Periodo:</strong> {u.period}</p>
              <p className="text-slate-500 truncate"><strong>Compito:</strong> {u.realTask}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] font-bold">
              <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-full">{u.status.toUpperCase()}</span>
              <div className="flex space-x-3">
                <button onClick={() => setSelectedUda(u)} className="text-primary-600 hover:text-primary-800 flex items-center space-x-1"><Eye className="w-3.5 h-3.5" /> <span>Dettaglio</span></button>
                <button onClick={() => handleShareUdaToSocial(u.id)} className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"><Users className="w-3.5 h-3.5" /> <span>Condividi</span></button>
                <button onClick={() => deleteUda(u.id)} className="text-rose-600 hover:text-rose-800 font-bold">Rimuovi</button>
              </div>
            </div>
          </div>
        ))}
        {savedUda.filter(handleApplyLibFilters).length === 0 && <p className="col-span-2 text-center py-10 text-slate-400 italic text-xs bg-slate-50 border rounded-xl">Nessun elemento registrato in archivio corrispondente ai filtri.</p>}
      </div>
    </div>
  );
}
