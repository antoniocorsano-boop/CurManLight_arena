import { FileText, Clock, AlertTriangle, CheckCircle, HelpCircle, Trash2, ArrowLeft, RefreshCw } from 'lucide-react';
import type { DocumentExportEvent } from '../../../types/curriculum';

type DocumentExportHistoryProps = {
  events?: DocumentExportEvent[];
  onClearHistory: () => void;
  onNavigateToSource?: (event: DocumentExportEvent) => void;
  onProduceNewVersion?: (event: DocumentExportEvent) => void;
};

function getCoherenceInfo(coherence: DocumentExportEvent['coherence']) {
  switch (coherence) {
    case 'current':
      return { icon: CheckCircle, label: 'Coerente', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    case 'modified':
      return { icon: AlertTriangle, label: 'Modificato', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    case 'unverifiable':
    default:
      return { icon: HelpCircle, label: 'Da verificare', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' };
  }
}

function getDocumentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    uda: 'UDA',
    programmazione: 'Programmazione',
    relazione: 'Relazione',
    curricolo: 'Curricolo',
    confronto: 'Confronto',
    'programma-svolto': 'Programma Svolto',
    'file-lavoro': 'File di Lavoro',
    altro: 'Documento',
  };
  return labels[type] || type;
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function DocumentExportHistory({
  events = [],
  onClearHistory,
  onNavigateToSource,
  onProduceNewVersion,
}: DocumentExportHistoryProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-white border border-dashed border-slate-200 rounded-2xl">
        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-700 mb-1">Non hai ancora prodotto documenti in questa sessione.</h3>
        <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
          Quando esporterai un UDA, una programmazione o una relazione, il documento apparir&agrave; qui con il contesto della fonte.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-800">Documenti prodotti di recente</h3>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
            CurManLight conserva soltanto le informazioni sulle ultime esportazioni. I file restano sul dispositivo.
          </p>
        </div>
        <button
          onClick={onClearHistory}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg text-[10px] font-bold transition"
          aria-label="Cancella cronologia esportazioni"
        >
          <Trash2 className="w-3 h-3" />
          <span>Cancella cronologia</span>
        </button>
      </div>

      <div className="space-y-3">
        {events.map((event) => {
          const coherenceInfo = getCoherenceInfo(event.coherence);
          const CoherenceIcon = coherenceInfo.icon;

          return (
            <div
              key={event.id}
              className={`bg-white border rounded-2xl p-4 transition hover:shadow-sm ${coherenceInfo.border}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider">
                      {getDocumentTypeLabel(event.documentType)}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">{event.format}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 truncate">{event.label}</h4>
                </div>
                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[9px] font-bold ${coherenceInfo.bg} ${coherenceInfo.color} shrink-0`}>
                  <CoherenceIcon className="w-3 h-3" />
                  <span>{coherenceInfo.label}</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500 font-semibold mb-2">
                {event.discipline && <span>{event.discipline}</span>}
                {event.order && <span>{event.order}</span>}
                {event.classLabel && <span>{event.classLabel}</span>}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(event.exportedAt)}
                </span>
              </div>

              {event.sourceTitle && (
                <p className="text-[10px] text-slate-500 bg-slate-50 rounded-lg px-3 py-2 mb-3">
                  {event.coherence === 'modified'
                    ? `Il lavoro \u00E8 stato modificato dopo questa esportazione. Fonte: ${event.sourceTitle}.`
                    : event.coherence === 'current'
                    ? `Corrisponde al lavoro attuale. Fonte: ${event.sourceTitle}.`
                    : `Non \u00E8 possibile confrontare questa esportazione con il lavoro attuale. Fonte: ${event.sourceTitle}.`}
                </p>
              )}

              <div className="flex gap-2">
                {event.sourceId && onNavigateToSource && (
                  <button
                    onClick={() => onNavigateToSource(event)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Torna al lavoro</span>
                  </button>
                )}
                {onProduceNewVersion && (
                  <button
                    onClick={() => onProduceNewVersion(event)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Produci una nuova versione</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[9px] text-slate-400 text-center pt-2">
        I documenti sono scaricati sul tuo dispositivo. CurManLight non conserva copie dei file esportati.
      </p>
    </div>
  );
}
