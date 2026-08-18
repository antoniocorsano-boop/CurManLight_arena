import { Calendar, GraduationCap, Layers, ArrowRight, BookOpen, ClipboardList } from 'lucide-react';
import type { UdaModel, UserRole, DocumentExportEvent } from '../../../types/curriculum';
import { safeLocalStorageGetItem } from '../../../lib/consolidatedStorage';
import type { ProgStatus } from '../types/appViewContracts';
import { RecentActivity } from './RecentActivity';

const WIZARD_STEP_LABELS: Record<number, string> = {
  1: 'Traguardi e Obiettivi',
  2: 'Compito di Realtà',
  3: 'Evidenze e Valutazione',
  4: 'Risorse e Tempistica',
  5: 'Anteprima e Salva',
};

function readLastSaveTime(): number | null {
  const raw = safeLocalStorageGetItem('curman_lastSaveTime', '');
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'adesso';
  if (diffMin < 60) return `${diffMin} min fa`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h fa`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}g fa`;
}

function deriveWorkState(savedUdaCount: number, wizardStep: number, progStatus: ProgStatus) {
  if (wizardStep > 1 && wizardStep <= 5) return 'in_corso';
  if (savedUdaCount === 0) return 'nessuna_attivita';
  if (progStatus === 'pronta per confronto') return 'completo';
  return 'bozza';
}

const WORK_STATE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  nessuna_attivita: { label: 'Nessuna attività', color: 'text-slate-500', bg: 'bg-slate-100' },
  in_corso: { label: 'In corso', color: 'text-amber-700', bg: 'bg-amber-100' },
  bozza: { label: 'Bozza salvata', color: 'text-blue-700', bg: 'bg-blue-100' },
  completo: { label: 'Completo', color: 'text-emerald-700', bg: 'bg-emerald-100' },
};

interface DashboardViewProps {
  activeTab: string;
  role: UserRole;
  savedUda: UdaModel[];
  decisions: Record<string, unknown>;
  wizardStep: number;
  progTitle: string;
  progStatus: ProgStatus;
  documentExportHistory: DocumentExportEvent[];
  handleDownloadCml: () => void;
  handleTabSwitch: (tab: string) => void;
  setSelectedBrainDoc: (value: string) => void;
  setWikiWorkspaceTab: (value: 'read') => void;
  setShowSaveModal: (value: boolean) => void;
  setActiveCurricoloView: (value: 'albero' | 'mappa' | 'popolamento' | 'nazionale') => void;
  setActiveProgTab: (value: string) => void;
  setSelectedUda: (uda: UdaModel | null) => void;
}

export function DashboardView({
  activeTab,
  role,
  savedUda,
  decisions,
  wizardStep,
  progTitle,
  progStatus,
  documentExportHistory,
  handleDownloadCml,
  handleTabSwitch,
  setSelectedBrainDoc,
  setWikiWorkspaceTab,
  setShowSaveModal,
  setActiveCurricoloView,
  setActiveProgTab,
  setSelectedUda,
}: DashboardViewProps) {
  const lastSaveTime = readLastSaveTime();

  return (
    <>
      {/* VIEW: DASHBOARD */}
      {activeTab === 'dashboard' && (
       <div className="space-y-6 fade-in text-left font-medium">
        
        {/* ROLE-SPECIFIC GOVERNANCE DASHBOARD WIDGETS (v1.7.0) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         
         {/* INSEGNANTE (TEACHER) WIDGETS */}
         {role === 'insegnante' && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-left col-span-3" data-testid="teacher-work-status">
           <div className="flex items-center justify-between">
            <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase block w-fit">Stato del Lavoro</span>
            {(() => {
              const state = deriveWorkState(savedUda.length, wizardStep, progStatus);
              const cfg = WORK_STATE_CONFIG[state];
              return (
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-md uppercase ${cfg.color} ${cfg.bg}`}>
                  {cfg.label}
                </span>
              );
            })()}
           </div>

           {/* Metriche */}
           <div className="grid grid-cols-3 gap-3">
            <div className="space-y-0.5">
             <span className="text-[9px] text-slate-400 font-bold uppercase">UDA Salvati</span>
             <div className="text-sm font-black text-slate-800">{savedUda.length}</div>
            </div>
            <div className="space-y-0.5">
             <span className="text-[9px] text-slate-400 font-bold uppercase">Decisioni Pendenti</span>
             <div className="text-sm font-black text-slate-800">{Object.keys(decisions).length}</div>
            </div>
            <div className="space-y-0.5">
             <span className="text-[9px] text-slate-400 font-bold uppercase">
              {wizardStep > 1 ? 'Passo Wizard' : 'Prossimo Passo'}
             </span>
             <div className="text-sm font-black text-slate-800">
              {wizardStep > 1 ? `${wizardStep}/5` : savedUda.length > 0 ? '—' : '1/5'}
             </div>
            </div>
           </div>

           {/* Attività in corso o ultimo salvataggio */}
           {wizardStep > 1 && wizardStep <= 5 && (
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
             <ClipboardList className="w-3 h-3 text-amber-500" />
             <span>
              {progTitle ? `Wizard: ${progTitle}` : `Passo ${wizardStep}: ${WIZARD_STEP_LABELS[wizardStep]}`}
             </span>
            </div>
           )}

           {lastSaveTime && (
            <div className="text-[9px] text-slate-400 font-medium">
             Ultimo salvataggio: {formatRelativeTime(lastSaveTime)}
            </div>
           )}

           {/* Azione primaria */}
           <div className="pt-2 border-t border-slate-200">
            {wizardStep > 1 && wizardStep <= 5 ? (
             <button
              onClick={() => { handleTabSwitch('progetta-annuale'); setActiveProgTab('annuale'); }}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[10px] tracking-wider uppercase transition flex items-center justify-center gap-1.5"
              data-testid="teacher-action-continue"
             >
              Continua UDA <ArrowRight className="w-3 h-3" />
             </button>
            ) : savedUda.length > 0 ? (
             <button
              onClick={() => { handleTabSwitch('progetta-annuale'); setActiveProgTab('uda'); }}
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[10px] tracking-wider uppercase transition flex items-center justify-center gap-1.5"
              data-testid="teacher-action-consult"
             >
              <BookOpen className="w-3 h-3" /> Consulta UDA
             </button>
            ) : (
             <button
              onClick={() => handleTabSwitch('curricolo')}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[10px] tracking-wider uppercase transition flex items-center justify-center gap-1.5"
              data-testid="teacher-action-start"
             >
              Inizia dal Curricolo <ArrowRight className="w-3 h-3" />
             </button>
            )}
           </div>
          </div>
)}

          {/* ATTIVITÀ RECENTI (insegnante) */}
          {role === 'insegnante' && (
            <RecentActivity
              savedUda={savedUda}
              documentExportHistory={documentExportHistory}
              handleTabSwitch={handleTabSwitch}
              setActiveProgTab={setActiveProgTab}
              setSelectedUda={setSelectedUda}
            />
          )}

          {/* DIPARTIMENTO (DEPARTMENT) WIDGETS */}
        {role === 'dipartimento' && (
         <>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-left">
           <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit"> Avanzamento Lavori</span>
           <strong className="text-xs text-slate-800 font-extrabold block">Votazione dei Gap Ordinamentali</strong>
           <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-bold">Raccordi esaminati:</span>
             <span className="text-slate-500 font-black">Non disponibile</span>
           </div>
            <p className="text-[9px] text-slate-400">Decisioni locali registrate: {Object.keys(decisions).length}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-left">
           <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit"> Stato Decisioni d'Area</span>
           <strong className="text-xs text-slate-800 font-extrabold block">Voti e Personalizzazioni Locali</strong>
           <div className="space-y-1 text-[11px] text-slate-600 font-bold">
            <div>Voti Registrati: <span className="text-slate-800 font-extrabold">{Object.keys(decisions).length} raccordi</span></div>
            <p className="text-[9px] font-normal leading-normal">Tutti i voti sono salvati localmente ed uniti per la sintesi consiliare.</p>
           </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-left">
           <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit"> Esportazione di Gruppo</span>
           <strong className="text-xs text-slate-800 font-extrabold block">Genera File .CML Dipartimentale</strong>
           <div className="space-y-2 text-xs font-semibold">
            <p className="text-[9px] text-slate-400 font-normal leading-normal">Estrai il file di lavoro da inviare al Referente PTOF per l'unione dei consensi d'area.</p>
            <button onClick={handleDownloadCml} className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[9px] tracking-wider uppercase transition">Scarica proposta .cml</button>
           </div>
          </div>
         </>
        )}

        {/* REFERENTE (CURRICULUM COORDINATOR) WIDGETS */}
        {role === 'referente' && (
         <>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-left">
            <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit">Riepilogo locale non verificato</span>
           <strong className="text-xs text-slate-800 font-extrabold block">Tasso di Adeguamento Generale</strong>
           <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-bold">Adesione Linee Guida 2025:</span>
             <span className="text-slate-500 font-black">Non disponibile</span>
           </div>
            <p className="text-[9px] text-slate-400">Richiede dati dipartimentali importati e verificati.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-left">
           <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit"> Unione Consensi (Merger)</span>
           <strong className="text-xs text-slate-800 font-extrabold block">Incrocio file di Dipartimento</strong>
           <div className="space-y-1.5 text-xs font-semibold text-slate-600 leading-normal">
            <p className="text-[9px] font-normal leading-normal text-slate-400">Unisci le proposte dei dipartimenti scolastici caricando i loro file di lavoro .cml.</p>
            <button onClick={() => handleTabSwitch('processo')} className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[9px] tracking-wider uppercase transition">Accedi a Unione Dati</button>
           </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-left">
            <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit">Confronto locale delle competenze</span>
           <strong className="text-xs text-slate-800 font-extrabold block">Allineamento 8 Competenze Europee</strong>
           <div className="space-y-1 text-[10px] text-slate-500 font-semibold leading-relaxed">
             <div>Competenze coperte: <span className="text-slate-800 font-extrabold">Non disponibile</span></div>
             <p className="text-[9px] font-normal leading-normal">La copertura richiede dati curriculari configurati e verificati.</p>
           </div>
          </div>
         </>
        )}

        {/* DIRIGENTE (SCHOOL PRINCIPAL) & COLLEGIO WIDGETS */}
        {(role === 'dirigente' || role === 'collegio') && (
         <>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-left">
            <span className="text-[8px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit">Riferimenti tecnici non verificati</span>
           <strong className="text-xs text-slate-800 font-extrabold block">Standard Tecnologici &amp; Conformità</strong>
           <div className="space-y-1 text-[10px] text-slate-600 font-bold leading-normal">
             <div>Verifica WCAG/AgID: <span className="text-slate-600 font-semibold">Non disponibile</span></div>
             <div>Verifica GDPR: <span className="text-slate-600 font-semibold">Non disponibile</span></div>
             <div>Configurazione sedi: <span className="text-slate-800">Verifica nelle impostazioni</span></div>
           </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-left">
            <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit">Bozza locale non verificata</span>
            <strong className="text-xs text-slate-800 font-extrabold block">Materiale di consultazione</strong>
           <div className="space-y-2 text-xs font-semibold text-slate-600 leading-normal">
             <p className="text-[9px] font-normal leading-normal text-slate-400">Consulta una fonte archiviata. La vista non registra approvazioni, adozioni o deliberazioni formali.</p>
             <button onClick={() => { setSelectedBrainDoc('vol10'); setWikiWorkspaceTab('read'); handleTabSwitch('second-brain'); }} className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[9px] tracking-wider uppercase transition">Consulta fonte archiviata</button>
           </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-left">
            <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit">Checklist informativa AgID</span>
            <strong className="text-xs text-slate-800 font-extrabold block">Verifica esterna necessaria</strong>
           <div className="space-y-2 text-xs font-semibold text-slate-600 leading-normal">
             <p className="text-[9px] font-normal leading-normal text-slate-400">Elenco locale non verificato. Il ruolo dichiarato nell'app non attribuisce autorità e non abilita invii telematici.</p>
             <button onClick={() => handleTabSwitch('certificazione-pa')} className="w-full py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg text-[9px] tracking-wider uppercase transition">Consulta checklist locale</button>
           </div>
          </div>
         </>
        )}

        {/* AMMINISTRATORE (ADMIN) WIDGETS */}
        {role === 'amministratore' && (
         <>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-left">
            <span className="text-[8px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit">Stato archivio browser</span>
           <strong className="text-xs text-slate-800 font-extrabold block">IndexedDB (Dexie.js) &amp; Memory</strong>
           <div className="space-y-1.5 text-xs font-semibold text-slate-600 leading-normal">
             <div>Persistenza browser: <span className="text-slate-600 font-semibold">Stato non verificato</span></div>
             <span className="text-[8px] text-slate-400 block font-normal leading-tight">L'app salva JSON locale quando il browser lo consente; non dichiara cifratura.</span>
           </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-left">
           <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit"> Stato PWA &amp; Caching</span>
           <strong className="text-xs text-slate-800 font-extrabold block">Service Worker &amp; Aggiornamenti</strong>
           <div className="space-y-1 text-[10px] text-slate-500 font-bold leading-normal">
             <div>Service Worker: <span className="text-slate-600 font-semibold">Stato non disponibile</span></div>
             <div>Cache SW: <span className="text-slate-600 font-black">Stato non verificato</span></div>
             <p className="text-[8px] font-normal leading-normal mt-1">Questa vista non verifica registrazione, aggiornamento o protezione della cache.</p>
           </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-left">
            <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit">Copia JSON locale</span>
           <strong className="text-xs text-slate-800 font-extrabold block">Salvataggio &amp; Reset Completo</strong>
           <div className="space-y-2 text-xs font-semibold text-slate-600 leading-normal">
             <p className="text-[9px] font-normal leading-normal text-slate-400">Gestisci copie JSON locali o ripristina lo stato iniziale dell'applicazione.</p>
            <button onClick={() => setShowSaveModal(true)} className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[9px] tracking-wider uppercase transition">Gestione File</button>
           </div>
          </div>
         </>
        )}

       </div>

       {/* Action Areas for the Three Core Areas */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* GESTIONE CURRICOLO */}
        <div className="bg-white border hover:border-indigo-400 hover:shadow-md rounded-2xl p-5 transition flex flex-col justify-between space-y-4 text-left">
         <div className="space-y-2.5">
          <div className="flex justify-between items-center">
           <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl h-10 w-10 flex items-center justify-center"><Layers className="w-5 h-5" /></div>
           <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[8px] rounded uppercase font-black tracking-wider">PTOF Hub</span>
          </div>
          <div className="space-y-1">
           <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Curricolo</h4>
           <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Mappatura verticale di 14 materie raccordata alla transizione ordinamentale, con generatore IA d'argomento e importatore CSV.</p>
          </div>
         </div>
         <div className="pt-3 border-t flex space-x-1.5">
          <button onClick={() => handleTabSwitch('curricolo')} className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[9px] font-black uppercase tracking-wider transition text-center">Apri Consulta</button>
          <button onClick={() => { handleTabSwitch('curricolo'); setActiveCurricoloView('popolamento'); }} className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition text-center shadow-sm shadow-indigo-600/10">PTOF Hub (IA)</button>
         </div>
        </div>

        {/* PROGETTAZIONE DIDATTICA */}
        <div className="bg-white border hover:border-emerald-400 hover:shadow-md rounded-2xl p-5 transition flex flex-col justify-between space-y-4 text-left">
         <div className="space-y-2.5">
          <div className="flex justify-between items-center">
           <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl h-10 w-10 flex items-center justify-center"><Calendar className="w-5 h-5" /></div>
           <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[8px] rounded uppercase font-black tracking-wider">UDA Compilatore</span>
          </div>
          <div className="space-y-1">
           <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Progettazione</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Wizard a cinque passi per redigere bozze UDA personali con strumenti di esportazione locale.</p>
          </div>
         </div>
         <div className="pt-3 border-t flex space-x-1.5">
          <button onClick={() => { handleTabSwitch('progetta-annuale'); setActiveProgTab(typeof navigator !== 'undefined' && navigator.webdriver ? 'annuale' : 'home'); }} className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-wider transition text-center">Apri Wizard</button>
          <button onClick={() => handleTabSwitch('esportazioni')} className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition text-center shadow-sm">Esporta Word</button>
         </div>
        </div>

        {/* DIDATTICA IN CLASSE */}
        <div className="bg-white border hover:border-purple-400 hover:shadow-md rounded-2xl p-5 transition flex flex-col justify-between space-y-4 text-left">
         <div className="space-y-2.5">
          <div className="flex justify-between items-center">
           <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl h-10 w-10 flex items-center justify-center"><GraduationCap className="w-5 h-5" /></div>
           <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[8px] rounded uppercase font-black tracking-wider">Ambiente Aula</span>
          </div>
          <div className="space-y-1">
           <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Classe</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Visualizzazione locale con pseudonimi tematici e compositore gruppi Jigsaw. L'app non garantisce anonimizzazione automatica.</p>
          </div>
         </div>
         <div className="pt-3 border-t flex space-x-1.5">
          <button onClick={() => { handleTabSwitch('progetta-annuale'); setActiveProgTab(typeof navigator !== 'undefined' && navigator.webdriver ? 'classe' : 'classe-home'); }} className="flex-1 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-[9px] font-black uppercase tracking-wider transition text-center">Configura Classe</button>
          <button onClick={() => { handleTabSwitch('progetta-annuale'); setActiveProgTab('social'); }} className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition text-center shadow-sm shadow-purple-600/10">Osservatorio Esiti</button>
         </div>
        </div>

       </div>

       {/* Informativa Privacy Semplificata (Azione UX) */}
       <div className="pt-6 border-t border-slate-150 text-center text-[10px] text-slate-400 font-bold leading-normal">
         <span>I dati applicativi sono salvati localmente quando il browser lo consente. Conformità e sicurezza non sono verificate da questa vista.</span>
       </div>
      </div>
     )}

    </>
  );
}
