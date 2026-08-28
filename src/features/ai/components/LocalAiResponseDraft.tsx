import type { AiResponse } from '../../../domain/ai/types';
import { BookOpen, Copy, Network, RotateCcw, X } from 'lucide-react';
import { openAssistantKnowledge } from '../../copilot/assistantKnowledgeNavigation';

interface LocalAiResponseDraftProps {
  response: AiResponse<string>;
  onCopy: () => void;
  onNewRequest: () => void;
  onClose: () => void;
}

export function LocalAiResponseDraft({
  response,
  onCopy,
  onNewRequest,
  onClose,
}: LocalAiResponseDraftProps) {
  const timestamp = response.provenance?.timestamp
    ? new Date(response.provenance.timestamp).toLocaleString('it-IT')
    : '';

  return (
    <div
      className="p-3 space-y-2 text-xs"
      role="region"
      aria-label="Bozza generata dal modello"
    >
      <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
        <p className="text-[10px] font-black text-amber-800 text-center">
          Bozza generata dal modello locale
        </p>
        <p className="text-[9px] font-bold text-amber-700 text-center mt-1">
          La risposta è una proposta e deve essere verificata dal docente prima dell'uso.
        </p>
      </div>

      <div className="bg-white border rounded-xl p-3 text-[10px] font-bold text-slate-800 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
        {response.result}
      </div>

      <div className="bg-slate-50 border rounded-xl p-2 space-y-1 text-[9px]">
        <div className="flex justify-between">
          <span className="font-bold text-slate-400">Provider</span>
          <span className="font-bold text-slate-700">{response.providerId}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold text-slate-400">Modello</span>
          <span className="font-bold text-slate-700">{response.provenance?.providerId}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold text-slate-400">Data e ora</span>
          <span className="font-bold text-slate-700">{timestamp}</span>
        </div>
        {response.provenance?.warning && (
          <div className="flex justify-between">
            <span className="font-bold text-slate-400">Avvertenza</span>
            <span className="font-bold text-amber-700 text-right">{response.provenance.warning}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="font-bold text-slate-400">Verifica umana</span>
          <span className="font-bold text-emerald-700">
            {response.requiresHumanVerification ? 'Richiesta' : 'Non richiesta'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2" data-assistant-knowledge-continuity>
        <button
          onClick={() => openAssistantKnowledge('source')}
          className="flex items-center justify-center space-x-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-100 font-black text-[9px] uppercase tracking-wider py-2 rounded-xl transition"
          aria-label="Apri la conoscenza istituzionale"
        >
          <BookOpen className="w-3 h-3" />
          <span>Apri conoscenza</span>
        </button>
        <button
          onClick={() => openAssistantKnowledge('graph')}
          className="flex items-center justify-center space-x-1 bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-100 font-black text-[9px] uppercase tracking-wider py-2 rounded-xl transition"
          aria-label="Mostra le connessioni della conoscenza"
        >
          <Network className="w-3 h-3" />
          <span>Mostra connessioni</span>
        </button>
      </div>

      <p className="text-[8px] leading-relaxed text-slate-500 font-semibold" data-assistant-authority-note>
        Queste azioni aprono fonti e relazioni per la verifica. Non trasformano la risposta dell'assistente in proposta o decisione istituzionale.
      </p>

      <div className="flex space-x-2">
        <button
          onClick={onCopy}
          className="flex-1 flex items-center justify-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[9px] uppercase tracking-wider py-2 rounded-xl transition"
          aria-label="Copia testo della risposta"
        >
          <Copy className="w-3 h-3" />
          <span>Copia testo</span>
        </button>
        <button
          onClick={onNewRequest}
          className="flex-1 flex items-center justify-center space-x-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-black text-[9px] uppercase tracking-wider py-2 rounded-xl transition"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Nuova richiesta</span>
        </button>
        <button
          onClick={onClose}
          className="flex-1 flex items-center justify-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[9px] uppercase tracking-wider py-2 rounded-xl transition"
          aria-label="Chiudi risposta"
        >
          <X className="w-3 h-3" />
          <span>Chiudi</span>
        </button>
      </div>
    </div>
  );
}
