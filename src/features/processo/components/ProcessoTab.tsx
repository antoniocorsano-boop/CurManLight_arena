import { Save } from 'lucide-react';
import type { Proposal, SchoolOrder } from '../../../types/curriculum';

type ProcessoCurricularLevel = {
  traguardi: string[];
  obiettivi: string[];
  proposals: Proposal[];
};

export interface ProcessoTabProps {
  activeProcessoTab: 'flusso' | 'verifica';
  setActiveProcessoTab: (tab: 'flusso' | 'verifica') => void;
  currentDisciplineDecided: number;
  currentDisciplineProps: Proposal[];
  handleImportMergeCml: (event: React.ChangeEvent<HTMLInputElement>) => void;
  canConsolidate?: boolean;
  progressPercent: number;
  totalDecisions: number;
  approvedCount: number;
  rejectedCount: number;
  customCount: number;
  localCurriculum: Record<string, Record<SchoolOrder, ProcessoCurricularLevel>>;
  discipline: string;
  order: SchoolOrder;
  decisions: Record<string, string>;
  customTexts: Record<string, string>;
}
export function ProcessoTab(props: ProcessoTabProps) {
  const {
    activeProcessoTab,
    setActiveProcessoTab,
    currentDisciplineDecided,
    currentDisciplineProps,
    handleImportMergeCml,
    canConsolidate = false,
    progressPercent,
    totalDecisions,
    approvedCount,
    rejectedCount,
    customCount,
    localCurriculum,
    discipline,
    order,
    decisions,
    customTexts,
  } = props;

  return (
      <div className="space-y-6 fade-in text-left">
        {/* Dynamic Contextual Header Panel */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition duration-200">
         <div className="space-y-1">
           <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">Scelte locali di lavoro</span>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
            Processo e confronto locale
          </h2>
          <p className="text-xs text-slate-600 font-semibold leading-relaxed max-w-2xl">
           {activeProcessoTab === 'flusso' 
              ? "Tracciamento di scelte locali non verificate. L'app non autentica ruoli e non produce atti formali."
              : `Riepilogo locale di lavoro: ${currentDisciplineDecided}/${currentDisciplineProps.length} proposte con una scelta registrata.`}
          </p>
         </div>

         {/* Sub-view Navigation (Adeguata ed Essenziale UI) */}
         <div className="bg-slate-100 p-1 rounded-xl flex space-x-1 border border-slate-200 shrink-0 text-[10px] font-black uppercase shadow-sm">
          <button onClick={() => setActiveProcessoTab('flusso')} className={`px-3 py-1.5 rounded-lg transition ${activeProcessoTab === 'flusso' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}>Flusso Collaborativo</button>
           <button onClick={() => setActiveProcessoTab('verifica')} className={`px-3 py-1.5 rounded-lg transition ${activeProcessoTab === 'verifica' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}>Riepilogo locale</button>
         </div>
        </div>

       {activeProcessoTab === 'flusso' ? (
        <div className="space-y-6">
         {/* Flusso Organizzativo dei 6 Ruoli (Dettagliato ed Istituzionale) */}
         <div className="bg-slate-50 p-4 border rounded-xl space-y-3 text-xs leading-relaxed">
           <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded uppercase text-[9px]">Possibile organizzazione del lavoro</span>
           <h4 className="font-extrabold text-slate-800 text-xs">Schema informativo non autenticato</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
           <div className="bg-white p-3 border rounded-lg space-y-1">
            <strong className="text-slate-800 block text-[11px]">1. Insegnante (Docente)</strong>
            <p className="text-slate-500 font-medium">Esamina il curricolo, adatta le evidenze d'aula, progetta i moduli e formula proposte di adeguamento locali esportandole in formato `.cml`.</p>
           </div>
           <div className="bg-white p-3 border rounded-lg space-y-1">
            <strong className="text-slate-800 block text-[11px]">2. Dipartimento Disciplinare</strong>
             <p className="text-slate-500 font-medium">Questa vista consente di unire file e registrare una scelta locale di lavoro, senza attribuirle valore formale.</p>
           </div>
           <div className="bg-white p-3 border rounded-lg space-y-1">
            <strong className="text-slate-800 block text-[11px]">3. Referente per il Curricolo</strong>
             <p className="text-slate-500 font-medium">Può usare la vista per organizzare una sintesi locale; il ruolo dichiarato non è autenticato dall'app.</p>
           </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
           <div className="bg-white p-3 border rounded-lg space-y-1">
            <strong className="text-slate-800 block text-[11px]">4. Dirigente Scolastico</strong>
             <p className="text-slate-500 font-medium">La vista può essere consultata, ma non convalida istruttorie né autorizza presentazioni formali.</p>
           </div>
           <div className="bg-white p-3 border rounded-lg space-y-1">
            <strong className="text-slate-800 block text-[11px]">5. Collegio dei Docenti</strong>
             <p className="text-slate-500 font-medium">La vista non approva, delibera o integra contenuti nel PTOF; gli eventuali atti restano esterni all'app.</p>
           </div>
           <div className="bg-white p-3 border rounded-lg space-y-1">
            <strong className="text-slate-800 block text-[11px]">6. Revisore Tecnico / Amministratore</strong>
            <p className="text-slate-500 font-medium">Gestisce il corretto funzionamento del sistema, effettua il salvataggio di sicurezza dei dati didattici ed assiste i coordinatori nell'importazione dei file.</p>
           </div>
          </div>
         </div>

         {/* Operational merger controls based on active role */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-slate-50 border p-4 rounded-xl space-y-3">
           <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase">Azioni di Dipartimento / Referente</span>
           <h4 className="font-extrabold text-slate-800 text-xs">Unione dei File di Lavoro</h4>
           <label htmlFor="processo-cml-import" className={`w-full flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-lg p-4 bg-white transition shadow-sm ${canConsolidate ? 'cursor-pointer hover:bg-slate-100' : 'cursor-not-allowed opacity-60'}`}>
            <Save className="w-5 h-5 text-slate-400 mb-1" />
            <span className="font-semibold text-slate-700">Carica file di proposta (.cml)</span>
            <input id="processo-cml-import" type="file" onChange={handleImportMergeCml} disabled={!canConsolidate} aria-describedby={!canConsolidate ? 'processo-consolidation-capability-note' : undefined} className="hidden" accept=".cml" />
            {!canConsolidate && <span id="processo-consolidation-capability-note" className="mt-1 text-amber-700" role="status">Questa funzione non è disponibile per il ruolo dichiarato.</span>}
           </label>
          </div>

          <div className="bg-slate-50 border p-4 rounded-xl space-y-3 flex flex-col justify-between">
           <div className="space-y-1">
             <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase">Riepilogo locale</span>
             <h4 className="font-extrabold text-slate-800 text-xs">Consulta le scelte registrate</h4>
             <p className="text-slate-500">Il riepilogo mostra dati locali non verificati e non costituisce consenso o adozione formale.</p>
           </div>
           <button onClick={() => setActiveProcessoTab('verifica')} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-md shadow-indigo-600/10 text-xs text-center">
            Apri Anteprima Libro Curricolo 
           </button>
          </div>
         </div>
        </div>
       ) : (
        <div className="space-y-6 font-medium text-xs leading-relaxed text-left">
         
         {/* Consolidated Governance Pipeline Diagram (v5.0-Ultimate) */}
         <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 rounded-2xl space-y-4 text-left shadow-md mb-4">
            <span className="bg-indigo-500/20 text-indigo-300 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-indigo-500/30">Riepilogo locale non verificato</span>
            <h3 className="font-extrabold text-sm uppercase block tracking-wider">Schema delle scelte di lavoro</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10px]">
             <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
               <div className="flex justify-between items-center">
                 <strong className="text-indigo-300 uppercase font-black text-[9px]">Fase 1: Dipartimenti / Interclasse</strong>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[7px] font-black px-1.5 py-0.2 rounded uppercase">Scelta locale</span>
               </div>
               <p className="text-slate-300 font-semibold leading-relaxed">I singoli coordinatori esprimono il consenso sulle variazioni 2012-2025 d'area.</p>
             </div>
             <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
               <div className="flex justify-between items-center">
                 <strong className="text-indigo-300 uppercase font-black text-[9px]">Fase 2: Referente del Curricolo</strong>
                 <span className="bg-indigo-500/20 text-indigo-400 text-[7px] font-black px-1.5 py-0.2 rounded uppercase">Sintesi Qualitativa</span>
               </div>
               <p className="text-slate-300 font-semibold leading-relaxed">Il referente unifica le evidenze di comportamento ed allinea i carichi orari.</p>
             </div>
             <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
               <div className="flex justify-between items-center">
                 <strong className="text-indigo-300 uppercase font-black text-[9px]">Fase 3: Collegio & Dirigente</strong>
                  <span className="bg-indigo-500/20 text-indigo-400 text-[7px] font-black px-1.5 py-0.2 rounded uppercase">Passaggio esterno</span>
               </div>
                <p className="text-slate-300 font-semibold leading-relaxed">Eventuali atti formali e aggiornamenti PTOF avvengono fuori dall'app.</p>
             </div>
           </div>
         </div>

         {/* CRUSCOTTO STATISTICO CONSENSO D'ISTITUTO */}
         <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="border-b pb-2.5">
            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">Monitoraggio locale non verificato</span>
           <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center space-x-2">
             <span></span> <span>Riepilogo numerico delle scelte locali</span>
           </h3>
            <p className="text-[10px] text-slate-400 font-bold">Sintesi in tempo reale delle decisioni registrate dai dipartimenti disciplinari.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
           
           {/* STAT 1: Avanzamento Lavori */}
           <div className="p-3.5 bg-slate-50 border rounded-xl space-y-2">
            <span className="text-slate-400 font-black uppercase text-[8px] tracking-wider block">Stato Allineamento</span>
            <div className="flex justify-between items-end">
             <span className="text-lg font-black text-indigo-950">{progressPercent}%</span>
             <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-black uppercase">Registrato</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
             <div className="bg-indigo-600 h-full" style={{ width: `${progressPercent}%` }}></div>
            </div>
             <span className="text-[8px] text-slate-400 block font-normal leading-tight">Percentuale di proposte con scelta locale su {totalDecisions} totali.</span>
           </div>

           {/* STAT 2: Approvazione Riforma */}
           <div className="p-3.5 bg-slate-50 border rounded-xl space-y-2">
             <span className="text-slate-400 font-black uppercase text-[8px] tracking-wider block">Scelte sul testo proposto</span>
            <div className="flex justify-between items-end">
             <span className="text-lg font-black text-emerald-950">{Math.round((approvedCount / (approvedCount + rejectedCount + customCount || 1)) * 100)}%</span>
             <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-black uppercase">Accettato</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
             <div className="bg-emerald-500 h-full" style={{ width: `${Math.round((approvedCount / (approvedCount + rejectedCount + customCount || 1)) * 100)}%` }}></div>
            </div>
             <span className="text-[8px] text-slate-400 block font-normal leading-tight">Quota locale della scelta tecnica “usa testo proposto”.</span>
           </div>

           {/* STAT 3: Autonomia Locale */}
           <div className="p-3.5 bg-slate-50 border rounded-xl space-y-2">
             <span className="text-slate-400 font-black uppercase text-[8px] tracking-wider block">Testo personalizzato</span>
            <div className="flex justify-between items-end">
             <span className="text-lg font-black text-amber-950">{Math.round((customCount / (approvedCount + rejectedCount + customCount || 1)) * 100)}%</span>
             <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-black uppercase">Personalizzato</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
             <div className="bg-amber-500 h-full" style={{ width: `${Math.round((customCount / (approvedCount + rejectedCount + customCount || 1)) * 100)}%` }}></div>
            </div>
            <span className="text-[8px] text-slate-400 block font-normal leading-tight">Percentuale di raccordi modificati per adattarsi alle specificit� locali.</span>
           </div>

           {/* STAT 4: Conservazione Tradizione */}
           <div className="p-3.5 bg-slate-50 border rounded-xl space-y-2">
            <span className="text-slate-400 font-black uppercase text-[8px] tracking-wider block">Tradizione (2012)</span>
            <div className="flex justify-between items-end">
             <span className="text-lg font-black text-rose-950">{Math.round((rejectedCount / (approvedCount + rejectedCount + customCount || 1)) * 100)}%</span>
             <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-black uppercase">Mantenuto</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
             <div className="bg-rose-500 h-full" style={{ width: `${Math.round((rejectedCount / (approvedCount + rejectedCount + customCount || 1)) * 100)}%` }}></div>
            </div>
            <span className="text-[8px] text-slate-400 block font-normal leading-tight">Percentuale di raccordi mantenuti transitoriamente nel vecchio ordinamento.</span>
           </div>

          </div>
         </div>

         {(['infanzia', 'primaria', 'secondaria'] as SchoolOrder[]).map(o => {
          const data = (localCurriculum[discipline]?.[o] || { traguardi: [], obiettivi: [], proposals: [] }) as ProcessoCurricularLevel;
          return (
           <div key={o} className="border border-slate-200 rounded-2xl bg-white p-6 space-y-4 shadow-sm">
            <h4 className="font-extrabold text-slate-800 uppercase tracking-wide flex items-center space-x-2">
             <span className="bg-indigo-600 text-white font-extrabold h-5 w-5 rounded-full flex items-center justify-center text-[10px]">{o.charAt(0).toUpperCase()}</span>
             <span>Livello Scolastico: {o.toUpperCase()}</span>
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 leading-relaxed">
             <div>
              <strong className="text-slate-400 block text-[9px] uppercase tracking-wide mb-2">Traguardi Coordinati</strong>
              <div className="space-y-1.5">{data.traguardi.map((t, idx) => <p key={idx}>T{idx+1}. {t}</p>)}</div>
              <hr className="my-3 border-slate-100" />
              <strong className="text-slate-400 block text-[9px] uppercase tracking-wide mb-2">Obiettivi Base</strong>
              <div className="space-y-1.5">{data.obiettivi.map((ob, idx) => <p key={idx}>O{idx+1}. {ob}</p>)}</div>
             </div>
             <div className="bg-slate-50 p-4 rounded-xl border">
               <strong className="text-slate-400 block text-[9px] uppercase tracking-wide mb-2">Scelte locali sul raccordo</strong>
              <div className="space-y-3">
               {data.proposals && data.proposals.map(p => {
                const dec = decisions[p.id];
                let txt = p.oldText;
                let label = "Mantenuto 2012";
                 if (dec === 'approved') { txt = p.newText; label = "Scelta locale: usa testo proposto"; }
                else if (dec === 'custom') { txt = customTexts[p.id] || p.newText; label = "Personalizzata"; }
                return (
                 <div key={p.id} className="border-l-4 border-slate-300 pl-3 py-0.5">
                  <span className="text-[9px] text-slate-400 font-bold block">{p.id.toUpperCase()} - {label}</span>
                  <p className="font-medium">"{txt}"</p>
                 </div>
                );
               })}
              </div>
             </div>
            </div>
           </div>
          );
         })}
        </div>
       )}

       {/* Log Table */}
       <div className="bg-white border rounded-xl overflow-hidden shadow-sm mt-6 text-xs text-left">
         <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-700">Registro locale delle scelte</div>
        <div className="p-4 overflow-x-auto">
         <table className="w-full text-left border-collapse">
          <thead>
           <tr className="border-b text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <th className="pb-2">ID Raccordo</th>
            <th className="pb-2">Materia d'Insegnamento</th>
            <th className="pb-2">Livello di Scuola</th>
             <th className="pb-2 text-center">Scelta locale</th>
           </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
           {Object.keys(decisions).map(id => {
            const s = decisions[id];
            return (
             <tr key={id}>
              <td className="py-2 font-mono text-[10px]">{id.toUpperCase()}</td>
              <td className="py-2 font-bold">{discipline.toUpperCase()}</td>
              <td className="py-2">{order.toUpperCase()}</td>
              <td className="py-2 text-center">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s === 'approved' ? 'bg-emerald-100 text-emerald-800' : s === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>{s === 'approved' ? 'USA TESTO PROPOSTO' : s === 'rejected' ? 'MANTIENI TESTO PRECEDENTE' : 'PERSONALIZZA'}</span>
              </td>
             </tr>
            );
           })}
            {Object.keys(decisions).length === 0 && <tr><td colSpan={4} className="py-8 text-center text-slate-400 italic">Nessuna scelta locale registrata.</td></tr>}
          </tbody>
         </table>
        </div>
       </div>
      </div>

  );
}
