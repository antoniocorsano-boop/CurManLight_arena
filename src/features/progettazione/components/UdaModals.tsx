import { useEffect, useRef } from 'react';
import { X, Code, Copy } from 'lucide-react';
import type { UdaModel } from '../../../types/curriculum';
import type { A07InstitutionalDocumentRead } from '../../../domain/institution';

export interface UdaDetailModalProps {
  selectedUda: UdaModel | null;
  setSelectedUda: (v: UdaModel | null) => void;
  handleDownloadScormManifest: (id: string) => void;
  copyUdaForRegister: (id: string) => void;
  copyUdaTextLocal: (id: string) => void;
  institutionalProfile: A07InstitutionalDocumentRead;
}

export function UdaDetailModal({
  selectedUda,
  setSelectedUda,
  handleDownloadScormManifest,
  copyUdaForRegister,
  copyUdaTextLocal,
  institutionalProfile,
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
        {institutionalProfile.warning && <div role="status" className="border border-amber-300 bg-amber-50 text-amber-900 rounded-lg px-3 py-2 font-semibold">{institutionalProfile.warning} Puoi comunque usare le esportazioni personali o dimostrative.</div>}
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
         <span className="text-[10px] font-black text-indigo-500 uppercase block"> Traguardi</span>
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
         <span> = Dato curricolare locale</span>
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
