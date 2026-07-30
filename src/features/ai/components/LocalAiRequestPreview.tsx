import type { RequestPreview } from '../../../domain/ai/requestPreview';

interface LocalAiRequestPreviewProps {
  preview: RequestPreview;
}

export function LocalAiRequestPreview({ preview }: LocalAiRequestPreviewProps) {
  return (
    <div className="p-3 space-y-2 text-xs" role="region" aria-label="Anteprima richiesta">
      <p className="text-[9px] font-black text-indigo-600 uppercase tracking-wider">
        Anteprima della richiesta
      </p>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 space-y-1.5 text-[10px]">
        <div className="flex justify-between">
          <span className="font-bold text-slate-500">Provider</span>
          <span className="font-bold text-slate-800">{preview.providerId}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold text-slate-500">Tipo</span>
          <span className="font-bold text-slate-800">{preview.providerKind}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold text-slate-500">Endpoint</span>
          <span className="font-bold text-slate-800 font-mono text-[9px]">{preview.endpoint}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold text-slate-500">Modello</span>
          <span className="font-bold text-slate-800">{preview.model}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold text-slate-500">Capacità</span>
          <span className="font-bold text-slate-800">{preview.capability}</span>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
          Testo da inviare
        </p>
        <div className="bg-white border rounded-xl p-2.5 font-bold text-slate-800 text-[10px] leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
          {preview.outgoingText}
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-xl text-[9px] font-bold text-emerald-700 text-center">
        Nessun contesto nascosto viene trasmesso al modello.
      </div>
    </div>
  );
}
