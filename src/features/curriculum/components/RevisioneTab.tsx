import React from 'react';
import { Milestone, Info, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import type { DecisionStatus, Proposal } from '../../../types/curriculum';
import type { AppViewsLayerProps } from '../../session';

export type RevisioneTabProps = Pick<AppViewsLayerProps,
  | 'currentDisciplineProps'
  | 'currentDisciplineDecided'
  | 'revisioneMode'
  | 'setRevisioneMode'
  | 'revisioneWizardIndex'
  | 'setRevisioneWizardIndex'
>;

export function RevisioneTab({
  currentDisciplineProps,
  currentDisciplineDecided,
  revisioneMode,
  setRevisioneMode,
  revisioneWizardIndex,
  setRevisioneWizardIndex,
}: RevisioneTabProps) {
  const { decisions, customTexts, activeRevisionFilter, setActiveRevisionFilter, setDecision, resetDecision, setCustomText } = useCurriculumStore();

  return (
    <div className="space-y-6 fade-in text-left">
      <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
        <div>
          <h1 className="text-base font-extrabold text-slate-800 flex items-center space-x-2">
            <Milestone className="w-5 h-5 text-amber-500" />
            <span>Revisione del Curricolo: Gap 2025</span>
          </h1>
          <p className="text-[11px] text-slate-500">Esamina ed aggiorna i testi del curricolo secondo i nuovi standard ministeriali.</p>
        </div>
        <span className="font-extrabold text-slate-700 text-xs">{currentDisciplineDecided}/{currentDisciplineProps.length} decisioni</span>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start space-x-3 leading-relaxed">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Istruzioni operative:</strong> Vota <strong>Accetta 2025</strong> o <strong>Mantieni 2012</strong> per formulare la proposta da inviare al dipartimento, oppure personalizza la proposta modificandone direttamente il testo a mano.
        </div>
      </div>

      {/* Gradual Transition Banner */}
      <div className="bg-indigo-50 border border-indigo-150 rounded-xl p-4 text-xs text-indigo-950 flex items-start space-x-3 leading-relaxed shadow-sm">
        <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <strong className="text-indigo-950 font-black block uppercase text-[10px] tracking-wider">Informativa d'Istituto: Applicazione Graduale (D.M. 221/2025)</strong>
          <p className="font-semibold text-slate-700 leading-normal">Le decisioni espresse diventeranno obbligatorie a partire dall'anno scolastico 2026/2027 solo per le Classi Prime.</p>
        </div>
      </div>

      {/* Layout selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3.5 border border-slate-200 rounded-2xl shadow-sm gap-3">
        <div className="space-y-0.5">
          <div className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Layout di Votazione d'Istituto</span>
          </div>
          <div className="text-[10px] text-slate-500 font-semibold">Scegli come esaminare e votare le proposte di gap curricolari 2025</div>
        </div>
        <div className="bg-slate-100 p-1 rounded-xl flex space-x-1 text-xs font-bold shadow-sm self-stretch sm:self-auto">
          <button onClick={() => setRevisioneMode('list')} className={`px-3 py-1.5 rounded-lg transition ${revisioneMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Elenco Completo</button>
          <button onClick={() => { setRevisioneMode('wizard'); setRevisioneWizardIndex(0); }} className={`px-3 py-1.5 rounded-lg transition ${revisioneMode === 'wizard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Passo-Passo (Monoscheda)</button>
        </div>
      </div>

      {/* Revision Filters */}
      <div className="flex items-center space-x-1 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
        <span className="mx-2">Filtro:</span>
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => { setActiveRevisionFilter(f); setRevisioneWizardIndex(0); }} className={`px-2.5 py-1 rounded-lg transition ${activeRevisionFilter === f ? 'bg-slate-200 text-slate-800' : 'hover:bg-slate-100'}`}>
            {f === 'all' ? 'Tutte' : f === 'pending' ? 'Da decidere' : f === 'approved' ? 'Approvati' : 'Rifiutati'}
          </button>
        ))}
      </div>

      {revisioneMode === 'list' ? (
        /* Stack comparison cards */
        <div id="gap-comparison-container" className="space-y-4">
          {currentDisciplineProps.filter(p => {
            const s = decisions[p.id];
            if (activeRevisionFilter === 'pending' && s) return false;
            if (activeRevisionFilter === 'approved' && s !== 'approved' && s !== 'custom') return false;
            if (activeRevisionFilter === 'rejected' && s !== 'rejected') return false;
            return true;
          }).map(p => {
            const s = decisions[p.id];
            const cText = customTexts[p.id] || "";
            let cardBorder = "border-slate-200";
            if (s === 'approved') cardBorder = "border-emerald-500 shadow-md shadow-emerald-500/5";
            else if (s === 'rejected') cardBorder = "border-rose-400";
            else if (s === 'custom') cardBorder = "border-amber-500 shadow-md shadow-amber-500/5";

            return (
              <div key={p.id} className={`bg-white border-2 ${cardBorder} rounded-xl overflow-hidden transition-all duration-200`}>
                <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center space-x-2">
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded">{p.id.toUpperCase()}</span>
                    <span>{p.focus}</span>
                  </span>
                  <span>{s === 'approved' ? 'Approvato' : s === 'rejected' ? 'Mantenuto' : s === 'custom' ? 'Personalizzato' : 'Da Decidere'}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 text-xs leading-relaxed">
                  <div className="space-y-1">
                    <strong className="text-slate-400 block text-[9px] uppercase">DM 254/2012 (Vigente)</strong>
                    <p className="bg-slate-50 p-2.5 border rounded-lg italic">"{p.oldText}"</p>
                  </div>
                  <div className="space-y-1">
                    <strong className="text-slate-400 block text-[9px] uppercase">DM 221/2025 (Proposta)</strong>
                    <p className="bg-indigo-50/30 p-2.5 border border-indigo-100 rounded-lg">"{p.newText}"</p>
                  </div>
                </div>
                {s === 'custom' && (
                  <div className="p-4 border-t border-slate-100 bg-amber-50/20">
                    <textarea value={cText} onChange={(e) => setCustomText(p.id, e.target.value)} className="w-full border border-amber-200 rounded-lg p-2.5 text-xs bg-white" rows={2} placeholder="Scrivi la tua proposta personalizzata..." />
                  </div>
                )}
                <div className="bg-slate-50/50 border-t border-slate-100 px-4 py-2 flex justify-between items-center gap-2">
                  <div className="flex space-x-1.5">
                    <button onClick={() => setDecision(p.id, 'approved')} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs transition">Accetta 2025</button>
                    <button onClick={() => setDecision(p.id, 'rejected')} className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-xs transition">Mantieni 2012</button>
                    <button onClick={() => setDecision(p.id, 'custom')} className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded text-xs transition">Modifica</button>
                  </div>
                  {s && <button onClick={() => resetDecision(p.id)} className="text-slate-400 hover:text-slate-600 text-xs">Annulla</button>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Step-by-Step Wizard */
        <RevisioneWizard
          currentDisciplineProps={currentDisciplineProps}
          activeRevisionFilter={activeRevisionFilter}
          decisions={decisions}
          customTexts={customTexts}
          revisioneWizardIndex={revisioneWizardIndex}
          setRevisioneWizardIndex={setRevisioneWizardIndex}
          setDecision={setDecision}
          resetDecision={resetDecision}
          setCustomText={setCustomText}
        />
      )}
    </div>
  );
}

interface RevisioneWizardProps {
  currentDisciplineProps: Proposal[];
  activeRevisionFilter: string;
  decisions: Record<string, DecisionStatus>;
  customTexts: Record<string, string>;
  revisioneWizardIndex: number;
  setRevisioneWizardIndex: React.Dispatch<React.SetStateAction<number>>;
  setDecision: (id: string, status: DecisionStatus) => void;
  resetDecision: (id: string) => void;
  setCustomText: (id: string, text: string) => void;
}

function RevisioneWizard({
  currentDisciplineProps,
  activeRevisionFilter,
  decisions,
  customTexts,
  revisioneWizardIndex,
  setRevisioneWizardIndex,
  setDecision,
  resetDecision,
  setCustomText,
}: RevisioneWizardProps) {
  const filteredProps = currentDisciplineProps.filter(p => {
    const s = decisions[p.id];
    if (activeRevisionFilter === 'pending' && s) return false;
    if (activeRevisionFilter === 'approved' && s !== 'approved' && s !== 'custom') return false;
    if (activeRevisionFilter === 'rejected' && s !== 'rejected') return false;
    return true;
  });

  if (filteredProps.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed rounded-3xl p-8 text-center space-y-3.5">
        <div className="space-y-1">
          <h4 className="font-extrabold text-slate-800 text-sm">Nessuna variazione da mostrare</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed font-semibold max-w-sm mx-auto">Tutte le schede per questa categoria di filtro sono state deliberate, oppure non ci sono elementi corrispondenti.</p>
        </div>
      </div>
    );
  }

  const safeIndex = Math.max(0, Math.min(revisioneWizardIndex, filteredProps.length - 1));
  const p = filteredProps[safeIndex];
  const s = decisions[p.id];
  const cText = customTexts[p.id] || "";

  let cardBorder = "border-slate-200";
  if (s === 'approved') cardBorder = "border-emerald-500 shadow-md shadow-emerald-500/10";
  else if (s === 'rejected') cardBorder = "border-rose-400 shadow-md shadow-rose-400/5";
  else if (s === 'custom') cardBorder = "border-amber-500 shadow-md shadow-amber-500/10";

  return (
    <div className={`bg-white border-2 ${cardBorder} rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between`}>
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-150 px-6 py-4 flex justify-between items-center text-xs font-bold text-slate-700">
        <span className="flex items-center space-x-2.5">
          <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">{p.id.toUpperCase()}</span>
          <span className="font-black text-slate-800 text-xs">{p.focus}</span>
        </span>
        <span className="bg-slate-200 px-2.5 py-1 rounded-full text-[10px]">
          Scheda {safeIndex + 1} di {filteredProps.length}
        </span>
      </div>

      {/* Comparative body */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 text-xs leading-relaxed">
        <div className="space-y-1.5">
          <strong className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">DM 254/2012 (Ordinamento Previgente)</strong>
          <p className="bg-slate-50 p-4 border rounded-2xl italic text-slate-700">"{p.oldText}"</p>
        </div>
        <div className="space-y-1.5">
          <strong className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">DM 221/2025 (Ordinamento Riformato)</strong>
          <p className="bg-indigo-50/20 p-4 border border-indigo-100 rounded-2xl text-slate-800 font-medium">"{p.newText}"</p>
        </div>
      </div>

      {/* Custom text area */}
      {s === 'custom' && (
        <div className="p-6 border-t border-slate-100 bg-amber-50/10 text-xs">
          <label className="text-[10px] font-black uppercase text-amber-800 block mb-2">Inserisci il testo personalizzato della tua commissione:</label>
          <textarea value={cText} onChange={(e) => setCustomText(p.id, e.target.value)} className="w-full border border-amber-200 rounded-xl p-3 text-xs bg-white focus:ring-2 focus:ring-amber-500/20 outline-none leading-relaxed" rows={3} placeholder="Digita le modifiche d'Istituto..." />
        </div>
      )}

      {/* Voting & Navigation */}
      <div className="bg-slate-50 border-t border-slate-150 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setDecision(p.id, 'approved')} className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 ${s === 'approved' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 border text-slate-700'}`}>
            <span>Accetta 2025</span>
          </button>
          <button onClick={() => setDecision(p.id, 'rejected')} className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 ${s === 'rejected' ? 'bg-rose-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 border text-slate-700'}`}>
            <span>Mantieni 2012</span>
          </button>
          <button onClick={() => setDecision(p.id, 'custom')} className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 ${s === 'custom' ? 'bg-amber-500 text-white shadow-md' : 'bg-white hover:bg-slate-100 border text-slate-700'}`}>
            <span>Personalizza</span>
          </button>
          {s && (
            <button onClick={() => resetDecision(p.id)} className="px-3 py-2 text-slate-400 hover:text-slate-600 font-bold text-xs">
              Resetta
            </button>
          )}
        </div>

        <div className="flex space-x-2 self-stretch sm:self-auto w-full sm:w-auto">
          <button
            onClick={() => setRevisioneWizardIndex(prev => Math.max(0, prev - 1))}
            disabled={safeIndex === 0}
            className={`flex-1 sm:flex-initial px-4 py-2 border rounded-xl flex items-center justify-center space-x-1 font-bold text-xs transition ${
              safeIndex === 0 ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed' : 'border-slate-200 hover:bg-slate-100 text-slate-700 bg-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Precedente</span>
          </button>
          <button
            onClick={() => setRevisioneWizardIndex(prev => Math.min(filteredProps.length - 1, prev + 1))}
            disabled={safeIndex === filteredProps.length - 1}
            className={`flex-1 sm:flex-initial px-4 py-2 border rounded-xl flex items-center justify-center space-x-1 font-bold text-xs transition ${
              safeIndex === filteredProps.length - 1 ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed' : 'border-slate-200 hover:bg-slate-100 text-slate-700 bg-white'
            }`}
          >
            <span>Successivo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
