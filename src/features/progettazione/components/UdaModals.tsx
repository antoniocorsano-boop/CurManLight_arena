import { useEffect, useRef } from 'react';
import { X, Code, Copy, Users } from 'lucide-react';
import type { UdaModel } from '../../../types/curriculum';
import type { SocialUda } from '../../session';

export interface UdaDetailModalProps {
  selectedUda: UdaModel | null;
  setSelectedUda: (v: UdaModel | null) => void;
  handleDownloadScormManifest: (id: string) => void;
  copyUdaForRegister: (id: string) => void;
  copyUdaTextLocal: (id: string) => void;
}

export function UdaDetailModal({
  selectedUda,
  setSelectedUda,
  handleDownloadScormManifest,
  copyUdaForRegister,
  copyUdaTextLocal,
}: UdaDetailModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!selectedUda) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedUda(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedUda, setSelectedUda]);

  if (!selectedUda) return null;
  const statusLabel: Record<string, { label: string; color: string }> = {
    bozza: { label: 'Bozza', color: 'bg-amber-500' },
    'in revisione': { label: 'In revisione', color: 'bg-blue-500' },
    'pronta per confronto': { label: 'Pronta', color: 'bg-emerald-500' },
    validata: { label: 'Validata', color: 'bg-emerald-600' },
    archiviata: { label: 'Archiviata', color: 'bg-slate-400' },
  };
  const status = statusLabel[selectedUda.status] ?? { label: selectedUda.status, color: 'bg-slate-400' };
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
     <div className="bg-white border border-slate-200 max-w-3xl w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] h-auto fade-in text-left">
      <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
       <div className="flex items-center space-x-2 flex-wrap gap-y-1">
        <span className="px-2.5 py-0.5 bg-primary-600 text-white text-[9px] font-bold uppercase rounded">{selectedUda.discipline.toUpperCase()}</span>
        <span className={`px-2.5 py-0.5 text-white text-[9px] font-bold uppercase rounded ${status.color}`}>{status.label}</span>
        <span className="px-2.5 py-0.5 bg-slate-700 text-slate-200 text-[9px] font-bold uppercase rounded">{selectedUda.order.toUpperCase()}</span>
        <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">Unità di Apprendimento Modello</h3>
       </div>
       <button ref={closeButtonRef} onClick={() => setSelectedUda(null)} aria-label="Chiudi dettaglio UDA" className="text-slate-400 hover:text-white transition"><X className="w-5 h-5" /></button>
      </div>
      <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 flex-1 leading-relaxed">
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 border rounded-xl font-semibold">
        <div><span className="text-[10px] text-slate-400 uppercase tracking-wider block"> Codice Identificativo</span><span className="text-xs text-slate-800 font-mono">{selectedUda.id}</span></div>
        <div><span className="text-[10px] text-slate-400 uppercase tracking-wider block"> Monte Ore Previsto</span><span className="text-xs text-slate-800">{selectedUda.hours} Ore</span></div>
        <div><span className="text-[10px] text-slate-400 uppercase tracking-wider block"> Periodo Svolgimento</span><span className="text-xs text-slate-800">{selectedUda.period}</span></div>
        <div><span className="text-[10px] text-slate-400 uppercase tracking-wider block">{selectedUda.updatedAt ? 'Ultimo Aggiornamento' : 'Data Creazione'}</span><span className="text-xs text-slate-800">{selectedUda.updatedAt ?? selectedUda.createdAt}</span></div>
       </div>
       <div className="space-y-1">
        <span className="text-[10px] font-black text-slate-400 uppercase block"> Titolo UDA</span>
        <h2 className="text-base font-black text-slate-800 leading-tight">{selectedUda.title}</h2>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
         <span className="text-[10px] font-black text-indigo-500 uppercase block"> Traguardi d'Istituto</span>
         <div className="bg-indigo-50/20 border border-indigo-100 p-3 rounded-xl">
          <ul className="space-y-1">{selectedUda.traguardi.map((t: string, i: number) => <li key={i}> {t}</li>)}</ul>
         </div>
        </div>
        <div className="space-y-2">
         <span className="text-[10px] font-black text-emerald-500 uppercase block"> Obiettivi Formativi</span>
         <div className="bg-emerald-50/20 border border-emerald-100 p-3 rounded-xl">
          <ul className="space-y-1">{selectedUda.obiettivi.map((ob: string, i: number) => <li key={i}> {ob}</li>)}</ul>
         </div>
        </div>
       </div>
       <div className="space-y-2">
        <span className="text-[10px] font-black text-slate-400 uppercase block"> Evidenze Osservabili</span>
        <div className="bg-slate-50 border p-3 rounded-xl space-y-1">
         {selectedUda.evidenze.map((e: string, i: number) => <p key={i}>- {e}</p>)}
        </div>
       </div>
       <div className="space-y-2">
        <span className="text-[10px] font-black text-primary-600 uppercase block"> Compito Autentico</span>
        <div className="bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-100 p-4 rounded-xl font-bold text-primary-900">
         <p>"{selectedUda.realTask}"</p>
        </div>
       </div>
       <div className="space-y-2">
        <span className="text-[10px] font-black text-slate-400 uppercase block"> Note di Inclusione & Metodologiche</span>
        <div className="bg-slate-50 border p-3 rounded-xl font-medium">
         {selectedUda.notes}
        </div>
       </div>
       <hr className="border-slate-200" />
       <div className="text-[10px] text-slate-400 flex justify-between items-center bg-slate-50 p-2 rounded-lg font-bold">
        <span>Legenda Campi:</span>
        <span> = Dato curricolare d'istituto</span>
        <span> = Esempio didattico personalizzabile</span>
       </div>
       
       <div className="h-6 shrink-0" />
      </div>
      <div className="bg-slate-50 px-6 py-3 border-t flex flex-wrap justify-end gap-2 shrink-0">
       <button onClick={() => handleDownloadScormManifest(selectedUda.id)} className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md"><Code className="w-4 h-4" /> <span>Scarica SCORM (.zip)</span></button>
       <button onClick={() => copyUdaForRegister(selectedUda.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md"><Code className="w-4 h-4" /> <span>Copia per Registro (Argo/ClasseViva)</span></button>
       <button onClick={() => copyUdaTextLocal(selectedUda.id)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md"><Copy className="w-4 h-4" /> <span>Copia Testo UDA</span></button>
      </div>
     </div>
    </div>
  );
}

export interface OutcomesModalProps {
  showOutcomesModal: boolean;
  setShowOutcomesModal: (v: boolean) => void;
  selectedUdaForOutcomes: SocialUda | null;
  selfEvaluationStars: number;
  setSelfEvaluationStars: (v: number) => void;
  outcomesAvanzato: number;
  setOutcomesAvanzato: (v: number) => void;
  outcomesIntermedio: number;
  setOutcomesIntermedio: (v: number) => void;
  outcomesBase: number;
  setOutcomesBase: (v: number) => void;
  outcomesIniziale: number;
  setOutcomesIniziale: (v: number) => void;
  criticalReflectionsInput: string;
  setCriticalReflectionsInput: (v: string) => void;
  handleSaveOutcomes: () => void;
}

export function OutcomesModal({
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
}: OutcomesModalProps) {
  if (!showOutcomesModal || !selectedUdaForOutcomes) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
     <div className="bg-white border border-slate-200 max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] h-auto fade-in text-left">
      <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
       <span className="flex items-center space-x-2 font-black uppercase tracking-wider text-xs">
        <Users className="w-5 h-5 text-indigo-400" />
        <span> REGISTRAZIONE ESITI DIDATTICI D'AULA</span>
       </span>
       <button onClick={() => setShowOutcomesModal(false)} className="text-slate-400 hover:text-white transition"><X className="w-5 h-5" /></button>
      </div>
      
      <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1 leading-relaxed">
       <div className="space-y-1 text-left">
        <p className="text-[10px] text-slate-400 uppercase font-black">UDA d'Istituto Selezionata:</p>
        <h4 className="font-extrabold text-sm text-slate-800 leading-snug">{selectedUdaForOutcomes.title}</h4>
        <p className="text-slate-500 font-semibold">Autore: {selectedUdaForOutcomes.author} | Disciplina: {selectedUdaForOutcomes.discipline.toUpperCase()}</p>
       </div>

       <hr className="border-slate-150" />

       <div className="space-y-1.5 text-left font-bold">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Valutazione Efficacia Didattica (1-5 Stelle):</label>
        <div className="flex space-x-1">
         {[1, 2, 3, 4, 5].map((star) => (
           <button 
            key={star} 
            type="button" 
            onClick={() => setSelfEvaluationStars(star)} 
            aria-pressed={star <= selfEvaluationStars}
            className="text-lg transition focus:outline-none"
           >
            {star <= selfEvaluationStars ? "★" : "☆"}
           </button>
         ))}
        </div>
       </div>

       <div className="space-y-2 text-left">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Percentuale Livelli di Competenza degli Studenti (%):</label>
        <p className="text-[9px] text-slate-400 leading-normal mb-1">Inserisci la percentuale di alunni della classe che hanno raggiunto ciascun livello di padronanza (D.M. 14/2024 unificato). La somma deve essere esattamente 100%.</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
         <div className="space-y-1">
          <span className="text-[9px] font-bold text-slate-500 block">Avanzato (%):</span>
          <input 
           type="number" 
           value={outcomesAvanzato} 
           onChange={(e) => setOutcomesAvanzato(Math.max(0, Math.min(100, Number(e.target.value))))} 
           className="w-full border rounded-lg p-2 text-xs font-bold bg-slate-50" 
           min="0" max="100" 
          />
         </div>
         <div className="space-y-1">
          <span className="text-[9px] font-bold text-slate-500 block">Intermedio (%):</span>
          <input 
           type="number" 
           value={outcomesIntermedio} 
           onChange={(e) => setOutcomesIntermedio(Math.max(0, Math.min(100, Number(e.target.value))))} 
           className="w-full border rounded-lg p-2 text-xs font-bold bg-slate-50" 
           min="0" max="100" 
          />
         </div>
         <div className="space-y-1">
          <span className="text-[9px] font-bold text-slate-500 block">Base (%):</span>
          <input 
           type="number" 
           value={outcomesBase} 
           onChange={(e) => setOutcomesBase(Math.max(0, Math.min(100, Number(e.target.value))))} 
           className="w-full border rounded-lg p-2 text-xs font-bold bg-slate-50" 
           min="0" max="100" 
          />
         </div>
         <div className="space-y-1">
          <span className="text-[9px] font-bold text-slate-500 block">Iniziale (%):</span>
          <input 
           type="number" 
           value={outcomesIniziale} 
           onChange={(e) => setOutcomesIniziale(Math.max(0, Math.min(100, Number(e.target.value))))} 
           className="w-full border rounded-lg p-2 text-xs font-bold bg-slate-50" 
           min="0" max="100" 
          />
         </div>
        </div>
       </div>

       <div className="space-y-1 text-left">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Riflessioni Critiche ed Annotazioni d'Istituto (Lessons Learned):</label>
        <textarea 
         value={criticalReflectionsInput} 
         onChange={(e) => setCriticalReflectionsInput(e.target.value)} 
         className="w-full border rounded-lg p-2 text-xs font-semibold placeholder-slate-400 outline-none bg-slate-50" 
         rows={3} 
         placeholder="Inserisci commenti, lezioni apprese e consigli metodologici in forma interamente anonima (es. 'I sussidi LIM hanno accelerato l'apprendimento...')." 
        />
       </div>
      </div>
      
      <div className="bg-slate-50 px-6 py-3.5 border-t flex justify-between shrink-0">
       <button 
        onClick={() => setShowOutcomesModal(false)} 
        className="px-4 py-2 border rounded-xl font-bold text-xs bg-white text-slate-700 hover:bg-slate-50 transition"
       >
        Annulla
       </button>
       <button 
        onClick={handleSaveOutcomes} 
        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/10"
       >
        Salva ed Elabora Esiti
       </button>
      </div>
     </div>
    </div>
  );
}
