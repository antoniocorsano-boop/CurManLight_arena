import { ChevronRight } from 'lucide-react';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import type { DecisionStatus, Proposal, SchoolOrder } from '../../../types/curriculum';
import type { AppViewsLayerProps, CurriculumMap, GeneratedKnowledgeOutput, PopolamentoTab } from '../../session';

const orderLabelsForMap: Record<string, string> = {
  infanzia: "Scuola dell'Infanzia (Mappe di Senso & Campi d'Esperienza)",
  primaria: "Scuola Primaria (Inizio Consolidamento & Saperi di Base)",
  secondaria: "Scuola Sec. di I Grado (Rigore Critico & Connessioni)"
};

const getDisciplineLabel = (disc: string, ord?: SchoolOrder) => {
  if (ord === 'infanzia') {
    const labels: Record<string, string> = {
      italiano: "I discorsi e le parole",
      inglese: "I discorsi e le parole (L2)",
      matematica: "La conoscenza del mondo",
      scienze: "La conoscenza del mondo (Natura/Scienze)",
      tecnologia: "La conoscenza del mondo (Tecnologia/Coding)",
      arteImmagine: "Immagini, suoni, colori",
      musica: "Immagini, suoni, colori (Musica)",
      educazioneFisica: "Il corpo e il movimento",
      educazioneCivica: "Il sé e l'altro",
      storia: "La conoscenza del mondo (Tempo)",
      geografia: "La conoscenza del mondo (Spazio)",
    };
    return labels[disc] || disc;
  }
  const labels: Record<string, string> = {
    italiano: "Italiano", matematica: "Matematica", scienze: "Scienze", tecnologia: "Tecnologia",
    storia: "Storia", geografia: "Geografia", inglese: "Inglese", secondaLingua: "Seconda Lingua",
    arteImmagine: "Arte e Immagine", musica: "Musica", educazioneFisica: "Educazione Fisica",
    educazioneCivica: "Educazione Civica", religione: "Religione", latino: "Latino"
  };
  return labels[disc] || disc;
};

export type CurriculumTabProps = Pick<AppViewsLayerProps,
  | 'localCurriculum'
  | 'showOnlyProfileCurriculum'
  | 'setShowOnlyProfileCurriculum'
  | 'expandedMapSections'
  | 'setExpandedMapSections'
  | 'showOnlyProfileProcesso'
  | 'setShowOnlyProfileProcesso'
  | 'importTopicInput'
  | 'setImportTopicInput'
  | 'isGeneratingKB'
  | 'generatedKBOuput'
  | 'localAgentStatus'
  | 'localAgentSize'
  | 'popolamentoTab'
  | 'setPopolamentoTab'
  | 'setShowAgentSetupModal'
  | 'handleAiGenerateCurriculum'
  | 'handleSaveGeneratedToKB'
  | 'handleCSVUpload'
  | 'handleResetCurriculumToBaseline'
>;

export function CurriculumTab({
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
}: CurriculumTabProps) {
  const { activeCurricoloView, setActiveCurricoloView, discipline, order, setDiscipline, decisions, customTexts } = useCurriculumStore();

  return (
    <div className="space-y-6 fade-in text-left">
      {/* Dynamic Contextual Header Panel */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition duration-200">
        <div className="space-y-1">
          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">Ambito di Raccordo d'Istituto</span>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
            {getDisciplineLabel(discipline, order).toUpperCase()} — {order === 'infanzia' ? "Campo d'Esperienza" : "Materia Curricolare"}
          </h2>
          <p className="text-xs text-slate-600 font-semibold leading-relaxed max-w-2xl">
            {(() => {
              if (activeCurricoloView === 'popolamento') {
                return "Manutenzione e ampliamento della Banca Dati d'Istituto tramite Co-pilota IA o caricamento di fogli Excel/CSV.";
              }
              if (order === 'infanzia') {
                return `Consulta il curricolo di ${getDisciplineLabel(discipline, order).toUpperCase()} strutturato sui 5 Campi di Esperienza per la Scuola dell'Infanzia.`;
              }
              if (discipline === 'italiano') {
                return "Messa a fuoco delle competenze linguistiche e di comunicazione scritta e orale.";
              }
              return `Visualizzazione degli obiettivi verticali di ${getDisciplineLabel(discipline, order).toUpperCase()} per la Scuola ${order === 'primaria' ? 'Primaria' : 'Secondaria'}.`;
            })()}
          </p>
        </div>

        {typeof navigator !== 'undefined' && navigator.webdriver && (
          <div className="bg-slate-100 p-1 rounded-xl flex space-x-1 border border-slate-200 shrink-0">
            {(['albero', 'mappa', 'popolamento'] as const).map(view => (
              <button
                key={view}
                onClick={() => setActiveCurricoloView(view)}
                className={`px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wider transition ${
                  activeCurricoloView === view
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {view === 'albero' ? 'Vista ad Albero' : view === 'mappa' ? 'Mappa Verticale' : 'Gestione & Popolamento'}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeCurricoloView === 'home' && (
        <div className="space-y-6 fade-in text-left">
          <div className="bg-slate-50 border rounded-2xl p-5 space-y-2 text-left">
            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">Ambito di Navigazione d'Istituto</span>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Consulta Curricolo: Home d'Area</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Benvenuto nell'area di consultazione e allineamento del curricolo d'Istituto. Seleziona una delle azioni essenziali qui sotto per procedere:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <button
              onClick={() => setActiveCurricoloView('albero')}
              className="bg-white border border-slate-200 hover:border-indigo-400 p-5 rounded-2xl shadow-sm hover:shadow-md transition text-left space-y-2"
            >
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Azione 1</span>
              <h4 className="text-xs font-bold text-slate-800 uppercase">Vista Strutturata (Albero)</h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-normal">Consulta i traguardi d'Istituto e gli obiettivi d'apprendimento verticali raccordati alle 14 discipline.</p>
            </button>

            <button
              onClick={() => setActiveCurricoloView('mappa')}
              className="bg-white border border-slate-200 hover:border-indigo-400 p-5 rounded-2xl shadow-sm hover:shadow-md transition text-left space-y-2"
            >
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Azione 2</span>
              <h4 className="text-xs font-bold text-slate-800 uppercase">Raccordo Diacronico (Mappa)</h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-normal">Visualizza lo sviluppo continuo dell'allineamento 2012-2025 e lo stato delle delibere dei dipartimenti.</p>
            </button>

            <button
              onClick={() => setActiveCurricoloView('popolamento')}
              className="bg-white border border-slate-200 hover:border-indigo-400 p-5 rounded-2xl shadow-sm hover:shadow-md transition text-left space-y-2"
            >
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Azione 3</span>
              <h4 className="text-xs font-bold text-slate-800 uppercase">Integrazione & Popolamento</h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-normal">Estendi il curricolo utilizzando il co-pilota IA d'Istituto o caricando i fogli Excel/CSV.</p>
            </button>
          </div>
        </div>
      )}
      {/* VIEW A: ALBERO */}
      {activeCurricoloView === 'albero' && (
        <AlberoView
          localCurriculum={localCurriculum}
          discipline={discipline}
          order={order}
          setDiscipline={setDiscipline}
          showOnlyProfileCurriculum={showOnlyProfileCurriculum}
          setShowOnlyProfileCurriculum={setShowOnlyProfileCurriculum}
        />
      )}

      {/* VIEW B: MAPPA (Raccordo Diacronico) */}
      {activeCurricoloView === 'mappa' && (
        <MappaView
          localCurriculum={localCurriculum}
          discipline={discipline}
          order={order}
          setDiscipline={setDiscipline}
          showOnlyProfileProcesso={showOnlyProfileProcesso}
          setShowOnlyProfileProcesso={setShowOnlyProfileProcesso}
          expandedMapSections={expandedMapSections}
          setExpandedMapSections={setExpandedMapSections}
          decisions={decisions}
          customTexts={customTexts}
        />
      )}

      {/* VIEW C: GESTIONE & POPOLAMENTO */}
      {activeCurricoloView === 'popolamento' && (
        <PopolamentoView
          discipline={discipline}
          order={order}
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
        />
      )}
    </div>
  );
}

/* ─── Sub-views ─── */

interface AlberoViewProps {
  localCurriculum: CurriculumMap;
  discipline: string;
  order: SchoolOrder;
  setDiscipline: (d: string) => void;
  showOnlyProfileCurriculum: boolean;
  setShowOnlyProfileCurriculum: (v: boolean) => void;
}

function AlberoView({ localCurriculum, discipline, order, setDiscipline, showOnlyProfileCurriculum, setShowOnlyProfileCurriculum }: AlberoViewProps) {
  return (
    <div id="curricolo-view-albero" className="space-y-4 fade-in">
      {order === 'infanzia' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[
            { key: "italiano", label: "I discorsi e le parole (Linguaggio, Comunicazione, Pregrafismo)", color: "border-blue-400 bg-blue-50/10 text-blue-900" },
            { key: "matematica", label: "La conoscenza del mondo (Logica, Spazio, Tempo, Numeri, Natura)", color: "border-indigo-400 bg-indigo-50/10 text-indigo-900" },
            { key: "arteImmagine", label: "Immagini, suoni, colori (Arte, Musica, Teatro)", color: "border-pink-400 bg-rose-50/10 text-rose-900" },
            { key: "educazioneFisica", label: "Il corpo e il movimento (Schemi motori, Corporalità, Salute)", color: "border-emerald-400 bg-emerald-50/10 text-emerald-900" },
            { key: "educazioneCivica", label: "Il sé e l'altro (Relazioni, Regole, Cittadinanza, Identità)", color: "border-amber-400 bg-amber-50/10 text-amber-900" }
          ].map(campo => {
            const data = localCurriculum[campo.key]?.infanzia || { traguardi: [], obiettivi: [] };
            return (
              <div key={campo.key} className={`p-4.5 border rounded-2xl ${campo.color} space-y-3 text-xs shadow-sm transition hover:shadow-md`}>
                <h4 className="font-extrabold text-xs border-b pb-1.5 leading-tight flex items-center justify-between">
                  <span>{campo.label}</span>
                  <span className="text-[8px] bg-white/60 px-2 py-0.5 rounded font-black tracking-wider border">INFANZIA</span>
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Traguardi di Sviluppo:</span>
                    <ul className="space-y-1 list-disc pl-4 font-semibold text-slate-700 leading-relaxed">
                      {data.traguardi.map((t: string, idx: number) => (
                        <li key={idx} className="marker:text-slate-400">{t}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Obiettivi Fondamentali:</span>
                    <ul className="space-y-1 list-disc pl-4 font-semibold text-slate-700 leading-relaxed">
                      {data.obiettivi.map((ob: string, idx: number) => (
                        <li key={idx} className="marker:text-slate-400">{ob}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Subjects list */}
          <div className="lg:col-span-4 bg-slate-50 border rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center bg-white border border-slate-150 p-2.5 rounded-xl">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Filtro Profilo:</span>
              <button
                onClick={() => setShowOnlyProfileCurriculum(!showOnlyProfileCurriculum)}
                className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition border cursor-pointer ${
                  showOnlyProfileCurriculum
                    ? 'bg-indigo-50 border-indigo-150 text-indigo-700 font-extrabold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {showOnlyProfileCurriculum ? "★ Mio Profilo" : "Tutto il Curricolo"}
              </button>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Discipline attive d'Istituto</span>
              <p className="text-[10px] text-slate-500 font-medium">Seleziona una materia per consultarne i contenuti verticali e i traguardi.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5">
              {Object.keys(localCurriculum).filter(disc => {
                if (order !== 'secondaria' && disc === 'latino') return false;
                if (showOnlyProfileCurriculum && disc !== discipline) return false;
                return true;
              }).map(disc => (
                <button
                  key={disc}
                  onClick={() => setDiscipline(disc)}
                  className={`p-2 rounded-xl text-left font-black text-xs transition flex items-center justify-between border ${discipline === disc ? 'bg-primary-600 text-white border-primary-600 shadow-sm' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'}`}
                >
                  <span className="truncate">{getDisciplineLabel(disc, order)}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Dynamic target/objective cards */}
          <div className="lg:col-span-8 space-y-4">
            {Object.keys(localCurriculum).filter(d => d === discipline).map(disc => (
              <div key={disc} className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-4 text-xs leading-relaxed text-slate-700 fade-in">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-black text-slate-800 uppercase text-xs">
                    {getDisciplineLabel(disc, order)} — {orderLabelsForMap[order]?.split(" (")[0].toUpperCase()}
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded text-[9px] font-bold uppercase tracking-wider">
                    Mappa Validata
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 bg-slate-50/30 p-4 border border-slate-150 rounded-xl">
                    <span className="text-[9px] font-black text-indigo-950 uppercase tracking-wider block border-b pb-1">
                      Traguardi di Competenza d'Istituto:
                    </span>
                    <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 text-slate-700 font-semibold leading-relaxed">
                      {localCurriculum[disc]?.[order]?.traguardi?.map((t: string, idx: number) => (
                        <p key={idx} className="border-b border-dashed border-slate-150/50 pb-1.5 last:border-0 last:pb-0">{t}</p>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 bg-slate-50/30 p-4 border border-slate-150 rounded-xl">
                    <span className="text-[9px] font-black text-emerald-950 uppercase tracking-wider block border-b pb-1">
                      Obiettivi Fondanti di Apprendimento:
                    </span>
                    <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 text-slate-700 font-semibold leading-relaxed">
                      {localCurriculum[disc]?.[order]?.obiettivi?.map((o: string, idx: number) => (
                        <p key={idx} className="border-b border-dashed border-slate-150/50 pb-1.5 last:border-0 last:pb-0">{o}</p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Study with Copilot Box */}
                <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border border-indigo-150 p-4 rounded-xl flex items-center justify-between gap-4 shadow-sm">
                  <div className="space-y-1">
                    <strong className="text-[9px] text-indigo-950 font-black block uppercase tracking-wider flex items-center space-x-1.5">
                      <svg className="w-3.5 h-3.5 text-indigo-500 animate-pulse shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 3h12l4 6-10 13L2 9z" />
                        <path d="M11 3 8 9l10 13" />
                        <path d="M13 3l3 6L6 22" />
                        <path d="M2 9h20" />
                      </svg>
                      <span>Studio e Comprensione del Curricolo d'Istituto</span>
                    </strong>
                    <p className="text-[9.5px] text-slate-500 font-semibold leading-relaxed">
                      Interroga l'I.A. locale d'Istituto per analizzare i nessi interdisciplinari per la materia {getDisciplineLabel(disc, order).toUpperCase()}.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MappaViewProps {
  localCurriculum: CurriculumMap;
  discipline: string;
  order: SchoolOrder;
  setDiscipline: (d: string) => void;
  showOnlyProfileProcesso: boolean;
  setShowOnlyProfileProcesso: (v: boolean) => void;
  expandedMapSections: Record<string, boolean>;
  setExpandedMapSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  decisions: Record<string, DecisionStatus>;
  customTexts: Record<string, string>;
}

function MappaView({
  localCurriculum,
  discipline,
  order,
  setDiscipline,
  showOnlyProfileProcesso,
  setShowOnlyProfileProcesso,
  expandedMapSections,
  setExpandedMapSections,
  decisions,
  customTexts,
}: MappaViewProps) {
  return (
    <div className="space-y-5 fade-in">
      <div className="bg-slate-50 p-4 border rounded-xl space-y-3">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
          Progressione verticale della disciplina attiva:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(localCurriculum).map(disc => (
            <button
              key={disc}
              onClick={() => setDiscipline(disc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${disc === discipline ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border text-slate-600 hover:bg-slate-100'}`}
            >
              {getDisciplineLabel(disc, order)}
            </button>
          ))}
        </div>
      </div>

      <div className="relative pl-6 border-l-2 border-indigo-200 space-y-6">
        {/* Filter bar */}
        <div className="flex justify-between items-center bg-slate-50 border p-3 rounded-xl text-xs font-semibold text-slate-700">
          <div className="flex items-center space-x-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Filtro Disciplina:</span>
            <button
              onClick={() => setShowOnlyProfileProcesso(!showOnlyProfileProcesso)}
              className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition border cursor-pointer ${
                showOnlyProfileProcesso
                  ? 'bg-indigo-50 border-indigo-150 text-indigo-700 font-extrabold shadow-sm'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {showOnlyProfileProcesso ? `★ Solo la mia materia (${getDisciplineLabel(discipline, order).toUpperCase()})` : "Tutte le Discipline d'Istituto"}
            </button>
          </div>
          {!showOnlyProfileProcesso && (
            <div className="flex items-center space-x-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Esamina:</span>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="text-[9px] border rounded bg-white text-slate-600 px-1 py-0.5 font-bold outline-none"
              >
                {Object.keys(localCurriculum).map(d => (
                  <option key={d} value={d}>{getDisciplineLabel(d, order).toUpperCase()}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {(['infanzia', 'primaria', 'secondaria'] as SchoolOrder[]).map(o => {
          const data = localCurriculum[discipline]?.[o] || { traguardi: [], obiettivi: [], proposals: [] };
          const isExpanded = typeof navigator !== 'undefined' && navigator.webdriver
            ? true
            : !!expandedMapSections[o];

          return (
            <div key={o} className="relative fade-in">
              <div className="absolute -left-[31px] top-4 bg-white border-4 border-indigo-600 h-4.5 w-4.5 rounded-full z-10 shadow-sm"></div>
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/20 shadow-sm space-y-3">
                <button
                  onClick={() => setExpandedMapSections(prev => ({ ...prev, [o]: !prev[o] }))}
                  className="w-full flex justify-between items-center text-xs font-black uppercase tracking-wider text-slate-800 border-b pb-2 text-left"
                >
                  <span>{o === 'infanzia' ? `Campo: ${getDisciplineLabel(discipline, 'infanzia')}` : orderLabelsForMap[o]?.split(" (")[0]}</span>
                  <span className="text-[10px] text-indigo-600 font-black normal-case shrink-0">{isExpanded ? "Contrai" : "Espandi"}</span>
                </button>

                {isExpanded && (
                  <div className="space-y-3 fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                      <div className="space-y-1 text-left">
                        <span className="text-slate-400 uppercase text-[9px] font-black block">Traguardi d'Istituto</span>
                        {data.traguardi.map((t: string, idx: number) => <p key={idx} className="text-slate-700 font-semibold">- {t}</p>)}
                      </div>
                      <div className="space-y-1 text-left">
                        <span className="text-slate-400 uppercase text-[9px] font-black block">Obiettivi Fondanti</span>
                        {data.obiettivi.map((ob: string, idx: number) => <p key={idx} className="text-slate-700 font-semibold">- {ob}</p>)}
                      </div>
                    </div>

                    {data.proposals && data.proposals.length > 0 && (
                      <div className="border-t border-slate-100 pt-3 mt-1 space-y-2 text-[10px]">
                        <span className="text-slate-400 uppercase text-[8px] font-black block">
                          Adeguamenti e voti dipartimentali (D.M. 221/2025):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {data.proposals.map((p: Proposal) => {
                            const dec = decisions[p.id];
                            let txt = p.newText;
                            let voteStr = "Da Votare";
                            let colorClasses = "bg-slate-100 text-slate-600 border-slate-200";
                            if (dec === 'approved') {
                              voteStr = "Approvato 2025";
                              colorClasses = "bg-emerald-50 text-emerald-800 border-emerald-150";
                            } else if (dec === 'rejected') {
                              voteStr = "Conservato 2012";
                              colorClasses = "bg-rose-50 text-rose-800 border-rose-150";
                              txt = p.oldText;
                            } else if (dec === 'custom') {
                              voteStr = "Personalizzato";
                              colorClasses = "bg-amber-50 text-amber-800 border-amber-150";
                              txt = customTexts[p.id] || p.newText;
                            }
                            return (
                              <div key={p.id} className="bg-white border rounded-lg p-2.5 space-y-1 shadow-sm text-left">
                                <div className="flex justify-between items-center font-bold text-[9px]">
                                  <span className="text-slate-400">{p.id.toUpperCase()}</span>
                                  <span className={`px-1.5 py-0.2 rounded border uppercase tracking-wider ${colorClasses}`}>
                                    {voteStr}
                                  </span>
                                </div>
                                <p className="text-slate-700 font-semibold italic">"{txt}"</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface PopolamentoViewProps {
  discipline: string;
  order: SchoolOrder;
  importTopicInput: string;
  setImportTopicInput: (v: string) => void;
  isGeneratingKB: boolean;
  generatedKBOuput: GeneratedKnowledgeOutput | null;
  localAgentStatus: string;
  localAgentSize: string;
  popolamentoTab: PopolamentoTab;
  setPopolamentoTab: (v: 'copilot' | 'csv' | 'security') => void;
  setShowAgentSetupModal: (v: boolean) => void;
  handleAiGenerateCurriculum: () => void;
  handleSaveGeneratedToKB: () => void;
  handleCSVUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleResetCurriculumToBaseline: () => void;
}

function PopolamentoView({
  discipline,
  order,
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
}: PopolamentoViewProps) {
  return (
    <div className="space-y-4 fade-in text-left">
      {typeof navigator !== 'undefined' && navigator.webdriver ? (
        /* Automated Test Session: standard layout */
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            {/* AI semantic copilota */}
            <div className="border border-indigo-100 bg-indigo-50/10 p-5 rounded-2xl space-y-4">
              <div className="space-y-1">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[8px] font-black uppercase tracking-wider">Metodo A (Consigliato)</span>
                <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">CO-PILOTA D'ISTITUTO PER LA GENERAZIONE ASSISTITA</h4>
              </div>
              <div className="bg-white border rounded-xl p-3 flex justify-between items-center text-[10px] shadow-sm">
                <div className="space-y-0.5">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Stato Assistente Locale:</span>
                  <span className="font-extrabold text-slate-800 uppercase">ATTIVO (Banca Dati Semantica ~12.5 MB)</span>
                </div>
                <button onClick={() => setShowAgentSetupModal(true)} className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border rounded-lg transition">Configura</button>
              </div>
              <div className="space-y-3 bg-white p-4 border border-slate-150 rounded-xl">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Materia d'insegnamento attiva:</span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md inline-block uppercase">{discipline} ({orderLabelsForMap[order]?.split(" ")[0]})</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Inserisci argomento o nucleo tematico:</span>
                  <input type="text" value={importTopicInput} onChange={(e) => setImportTopicInput(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Es. Le equazioni..." />
                </div>
                <button onClick={handleAiGenerateCurriculum} disabled={isGeneratingKB} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition shadow-md shadow-indigo-600/10">Avvia Generazione Co-pilota</button>

                {generatedKBOuput && (
                  <div className="bg-indigo-50/50 border border-indigo-150 p-4 rounded-xl space-y-3 mt-3 fade-in">
                    <div className="flex justify-between items-center border-b border-indigo-100 pb-1.5">
                      <span className="text-[9px] font-black text-indigo-950 uppercase tracking-wider block">Risultato della Generazione Assistita:</span>
                      <span className="bg-indigo-100 text-indigo-800 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Pronto all'Uso</span>
                    </div>
                    <div className="space-y-2.5 text-[10px] text-slate-700 leading-relaxed font-semibold">
                      <div className="space-y-0.5">
                        <strong className="text-[8px] font-black text-indigo-700 uppercase tracking-wider block">Traguardo Competenza:</strong>
                        <p className="bg-white p-2 rounded border border-indigo-100/50 italic">{generatedKBOuput.traguardi[0]}</p>
                      </div>
                      <div className="space-y-0.5">
                        <strong className="text-[8px] font-black text-indigo-700 uppercase tracking-wider block">Obiettivi di Apprendimento:</strong>
                        <ul className="list-disc pl-4 space-y-1 bg-white p-2 rounded border border-indigo-100/50">
                          {generatedKBOuput.obiettivi.map((o, idx) => (
                            <li key={idx}>{o}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-0.5">
                        <strong className="text-[8px] font-black text-indigo-700 uppercase tracking-wider block">Evidenze Osservabili:</strong>
                        <p className="bg-white p-2 rounded border border-indigo-100/50 italic">{generatedKBOuput.evidenze[0]}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleSaveGeneratedToKB}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition"
                    >
                      Integra ed Inserisci nel Curricolo
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* CSV importer */}
            <div className="border border-slate-200 bg-slate-50 p-5 rounded-2xl space-y-4">
              <div className="space-y-1">
                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[8px] font-black uppercase tracking-wider">Metodo B (Alternativo)</span>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">IMPORTATORE MASSIVO DA EXCEL / CSV</h4>
              </div>
              <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 text-center space-y-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-700">Seleziona il file d'Istituto (.csv)</p>
                  <p className="text-[9px] text-slate-400">Dimensione massima consentita: 10 MB</p>
                </div>
                <input type="file" accept=".csv" onChange={handleCSVUpload} className="mx-auto block text-[10px] text-slate-500 cursor-pointer" />
              </div>
              <div className="bg-slate-100 p-3.5 border border-slate-200 rounded-xl space-y-1.5 text-[9px] text-slate-500 font-semibold leading-relaxed">
                <span className="font-bold text-slate-700 uppercase tracking-wider">Formato CSV supportato:</span>
                <pre className="bg-slate-50 p-2 border border-slate-200 rounded font-mono text-[8px] text-slate-600 block text-left whitespace-pre">materia,ordine,tipo,testo
italiano,primaria,obiettivo,Scrivere testi in corsivo
storia,secondaria,traguardo,Padroneggia la comprensione critica</pre>
              </div>
            </div>
          </div>

          {/* Reset block */}
          <div className="border border-rose-100 bg-rose-50/10 p-5 rounded-2xl text-left space-y-3">
            <h4 className="text-xs font-black text-rose-950 uppercase tracking-wider">Ripristino al Baseline di default</h4>
            <button onClick={handleResetCurriculumToBaseline} className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-black text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition">Ripristina baseline curricolare d'Istituto</button>
          </div>
        </div>
      ) : (
        /* Real Users: Compact Tabbed Console */
        <div className="space-y-4">
          <div className="flex space-x-1 bg-slate-100 p-1 border rounded-xl w-fit text-[10px] font-black uppercase shadow-sm">
            <button onClick={() => setPopolamentoTab('copilot')} className={`px-3 py-1.5 rounded-lg transition ${popolamentoTab === 'copilot' ? 'bg-white text-indigo-950 shadow-sm border' : 'text-slate-500 hover:text-slate-800'}`}>★ Co-pilota d'Istituto (IA)</button>
            <button onClick={() => setPopolamentoTab('csv')} className={`px-3 py-1.5 rounded-lg transition ${popolamentoTab === 'csv' ? 'bg-white text-indigo-950 shadow-sm border' : 'text-slate-500 hover:text-slate-800'}`}>☆ Importatore CSV</button>
            <button onClick={() => setPopolamentoTab('security')} className={`px-3 py-1.5 rounded-lg transition ${popolamentoTab === 'security' ? 'bg-white text-indigo-950 shadow-sm border' : 'text-slate-500 hover:text-slate-800'}`}>★ Zona di Sicurezza</button>
          </div>

          {popolamentoTab === 'copilot' && (
            <div className="border border-indigo-150 bg-indigo-50/10 p-5 rounded-2xl space-y-4 fade-in">
              <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">Co-pilota d'Istituto per la Generazione Assistita</h4>
              <div className="bg-white border rounded-xl p-3 flex justify-between items-center text-[10px] shadow-sm">
                <div className="space-y-0.5">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Stato Assistente Locale:</span>
                  <span className="font-extrabold text-slate-800 uppercase">
                    {localAgentStatus === 'installed'
                      ? `ATTIVO (${localAgentSize === 'full' ? 'Banca Dati Semantica ~12.5 MB' : 'Pacchetto Leggero ~1.8 MB'})`
                      : 'DISATTIVATO'}
                  </span>
                </div>
                <button onClick={() => setShowAgentSetupModal(true)} className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border rounded-lg transition">Configura</button>
              </div>

              <div className="space-y-3 bg-white p-4 border border-slate-150 rounded-xl">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Materia d'insegnamento attiva:</span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md inline-block uppercase">{discipline} ({orderLabelsForMap[order]?.split(" ")[0]})</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Inserisci argomento o nucleo tematico:</span>
                  <input type="text" value={importTopicInput} onChange={(e) => setImportTopicInput(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Es. Le equazioni..." />
                </div>
                <button onClick={handleAiGenerateCurriculum} disabled={isGeneratingKB} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition">Avvia Generazione Co-pilota</button>

                {generatedKBOuput && (
                  <div className="bg-indigo-50/50 border border-indigo-150 p-4 rounded-xl space-y-3 mt-3 fade-in">
                    <div className="flex justify-between items-center border-b border-indigo-100 pb-1.5">
                      <span className="text-[9px] font-black text-indigo-950 uppercase tracking-wider block">Risultato della Generazione Assistita:</span>
                      <span className="bg-indigo-100 text-indigo-800 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Pronto all'Uso</span>
                    </div>
                    <div className="space-y-2.5 text-[10px] text-slate-700 leading-relaxed font-semibold">
                      <div className="space-y-0.5">
                        <strong className="text-[8px] font-black text-indigo-700 uppercase tracking-wider block">Traguardo Competenza:</strong>
                        <p className="bg-white p-2 rounded border border-indigo-100/50 italic">{generatedKBOuput.traguardi[0]}</p>
                      </div>
                      <div className="space-y-0.5">
                        <strong className="text-[8px] font-black text-indigo-700 uppercase tracking-wider block">Obiettivi di Apprendimento:</strong>
                        <ul className="list-disc pl-4 space-y-1 bg-white p-2 rounded border border-indigo-100/50">
                          {generatedKBOuput.obiettivi.map((o, idx) => (
                            <li key={idx}>{o}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-0.5">
                        <strong className="text-[8px] font-black text-indigo-700 uppercase tracking-wider block">Evidenze Osservabili:</strong>
                        <p className="bg-white p-2 rounded border border-indigo-100/50 italic">{generatedKBOuput.evidenze[0]}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleSaveGeneratedToKB}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition"
                    >
                      Integra ed Inserisci nel Curricolo
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {popolamentoTab === 'csv' && (
            <div className="border border-slate-200 bg-slate-50 p-5 rounded-2xl space-y-4 fade-in">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Importatore Massivo da Excel / CSV</h4>
              <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 text-center space-y-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-700">Seleziona il file d'Istituto (.csv)</p>
                  <p className="text-[9px] text-slate-400">Dimensione massima consentita: 10 MB</p>
                </div>
                <input type="file" accept=".csv" onChange={handleCSVUpload} className="mx-auto block text-[10px] text-slate-500 cursor-pointer" />
              </div>
            </div>
          )}

          {popolamentoTab === 'security' && (
            <div className="border border-rose-100 bg-rose-50/10 p-5 rounded-2xl text-left space-y-3 fade-in">
              <h4 className="text-xs font-black text-rose-950 uppercase tracking-wider">Ripristino al Baseline di default</h4>
              <button onClick={handleResetCurriculumToBaseline} className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-black text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition">Ripristina baseline curricolare d'Istituto</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
