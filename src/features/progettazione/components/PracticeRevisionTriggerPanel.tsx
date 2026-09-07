import { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { IMPLEMENTATION_SIGNAL_LABELS } from '../../../domain/curriculum/implementationObservation';
import type { UdaModel } from '../../../types/curriculum';
import { usePracticeRevisionTrigger } from '../hooks/usePracticeRevisionTrigger';

interface PracticeRevisionTriggerPanelProps {
  uda: UdaModel;
}

export function PracticeRevisionTriggerPanel({ uda }: PracticeRevisionTriggerPanelProps) {
  const { baseQualification, currentTrigger, qualifyWithReason } = usePracticeRevisionTrigger(uda);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');

  const hasObservations = baseQualification.relatedObservations.length > 0;
  const recurringLabel = useMemo(() => (
    baseQualification.recurringSignal
      ? IMPLEMENTATION_SIGNAL_LABELS[baseQualification.recurringSignal]
      : undefined
  ), [baseQualification.recurringSignal]);
  const canQualify = hasObservations && (baseQualification.qualified || reason.trim().length > 0);

  if (!hasObservations) return null;

  if (currentTrigger) {
    return (
      <section data-practice-revision-trigger="qualified" className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Motivo di riesame qualificato</span>
            <p className="mt-1 text-sm font-black text-slate-900">Il segnale è pronto per essere valutato nel Quadro applicabile.</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Questo passaggio non apre ancora una revisione e non modifica il curricolo. Il caso dovrà essere aperto esplicitamente nel ciclo professionale.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const handleQualify = () => {
    if (!canQualify) return;
    try {
      qualifyWithReason(reason);
      setFeedback('Motivo di riesame registrato. Il curricolo non è stato modificato e nessun caso di revisione è stato aperto automaticamente.');
      setReason('');
    } catch (error) {
      console.warn('[Arena] Motivo di riesame non qualificato:', error);
      setFeedback('Il motivo non è ancora qualificabile. Registra almeno un’osservazione e indica una motivazione professionale, oppure attendi una ricorrenza dello stesso problema.');
    }
  };

  return (
    <section data-practice-revision-trigger="qualification" className="rounded-xl border border-sky-200 bg-sky-50/55 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-sky-700">Valuta un possibile riesame</span>
          <h3 className="mt-1 text-sm font-black text-slate-900">Queste osservazioni meritano un riesame del curricolo?</h3>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Arena non apre revisioni in automatico. Puoi qualificare il motivo quando emerge una ricorrenza oppure quando registri una ragione professionale esplicita.
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-700">
        <strong>{baseQualification.relatedObservations.length}</strong> osservazioni collegate alla stessa unità curricolare.
        {baseQualification.recurringCount >= 2 && recurringLabel && (
          <span className="ml-1">Ricorrenza rilevata: <strong>{recurringLabel}</strong> ({baseQualification.recurringCount}).</span>
        )}
      </div>

      {!baseQualification.qualified && (
        <label className="mt-3 block">
          <span className="text-xs font-bold text-slate-800">Perché ritieni necessario il riesame?</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value.slice(0, 800))}
            rows={3}
            placeholder="Indica la ragione professionale. Non inserire dati degli alunni."
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm leading-5 text-slate-800"
          />
          <span className="mt-1 block text-[10px] text-slate-500">{reason.length}/800</span>
        </label>
      )}

      <button
        type="button"
        disabled={!canQualify}
        onClick={handleQualify}
        className="mt-3 min-h-11 rounded-xl bg-sky-700 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Registra il motivo di riesame
      </button>

      {feedback && <p role="status" className="mt-2 text-xs font-semibold leading-5 text-slate-700">{feedback}</p>}
      <p className="mt-3 text-[10px] leading-4 text-slate-500">
        Motivo di riesame ≠ caso di revisione ≠ modifica del master. Il rientro nel ciclo avviene dal Quadro applicabile.
      </p>
    </section>
  );
}
