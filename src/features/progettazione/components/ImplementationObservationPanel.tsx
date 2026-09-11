import { useMemo, useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import {
  IMPLEMENTATION_SIGNAL_LABELS,
  countImplementationSignals,
} from '../../../domain/curriculum/implementationObservation';
import type { ImplementationSignal, UdaModel } from '../../../types/curriculum';
import { useImplementationObservationRecorder } from '../hooks/useImplementationObservationRecorder';

const SIGNALS = Object.keys(IMPLEMENTATION_SIGNAL_LABELS) as ImplementationSignal[];

interface ImplementationObservationPanelProps {
  uda: UdaModel;
  onUdaUpdated: (uda: UdaModel) => void;
}

export function ImplementationObservationPanel({ uda, onUdaUpdated }: ImplementationObservationPanelProps) {
  const { recordImplementationObservation } = useImplementationObservationRecorder();
  const [signal, setSignal] = useState<ImplementationSignal | ''>('');
  const [note, setNote] = useState('');
  const [personalDataAbsentConfirmed, setPersonalDataAbsentConfirmed] = useState(false);
  const [feedback, setFeedback] = useState('');

  const binding = uda.curriculumBindings?.[0];
  const observations = uda.implementationObservations ?? [];
  const counts = useMemo(() => countImplementationSignals(observations), [observations]);
  const canRecord = Boolean(binding)
    && Boolean(signal)
    && personalDataAbsentConfirmed
    && (signal !== 'OTHER' || note.trim().length > 0);

  const handleRecord = () => {
    if (!canRecord || !signal) return;
    try {
      const { updatedUda } = recordImplementationObservation({
        uda,
        signal,
        note,
        personalDataAbsentConfirmed,
      });
      onUdaUpdated(updatedUda);
      setSignal('');
      setNote('');
      setPersonalDataAbsentConfirmed(false);
      setFeedback('Osservazione registrata. Non modifica il curricolo: sarà disponibile per il riesame dalla pratica.');
    } catch (error) {
      console.warn('[Arena] ImplementationObservation non registrata:', error);
      setFeedback('Non è stato possibile registrare l’osservazione. Verifica il collegamento al curricolo e riprova.');
    }
  };

  return (
    <section
      data-implementation-observation-panel
      data-human-task="practice-review-observation"
      className="rounded-xl border border-violet-200 bg-violet-50/50 p-4"
      aria-labelledby="implementation-observation-title"
    >
      <div className="flex items-start gap-3">
        <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-violet-700" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-violet-700">Riesame dalla pratica</span>
          <h3 id="implementation-observation-title" className="mt-1 text-sm font-black text-slate-900">Segnala ciò che hai osservato nell’attuazione</h3>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Registra un segnale professionale sul curricolo collegato a questa UDA. L’osservazione non modifica il curricolo e non valuta il docente.
          </p>
        </div>
      </div>

      {!binding ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-900">
          Questa UDA non ha ancora un collegamento curricolare verificabile. Prima collega la progettazione al curricolo.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-xs font-bold text-slate-800">Che cosa hai rilevato?</span>
            <select
              value={signal}
              onChange={(event) => setSignal(event.target.value as ImplementationSignal | '')}
              className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
            >
              <option value="">Seleziona un segnale</option>
              {SIGNALS.map((item) => <option key={item} value={item}>{IMPLEMENTATION_SIGNAL_LABELS[item]}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-slate-800">Nota professionale facoltativa</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value.slice(0, 600))}
              rows={3}
              placeholder="Descrivi il punto curricolare, senza nomi o dati degli alunni."
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm leading-5 text-slate-800"
            />
            <span className="mt-1 block text-[10px] text-slate-500">{note.length}/600 · Per “Altro” la nota è necessaria.</span>
          </label>

          <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs leading-5 text-slate-700">
            <input
              type="checkbox"
              checked={personalDataAbsentConfirmed}
              onChange={(event) => setPersonalDataAbsentConfirmed(event.target.checked)}
              className="mt-1"
            />
            <span>Confermo che questa osservazione non contiene nomi, voti, diagnosi o altri dati personali degli alunni.</span>
          </label>

          <button
            type="button"
            disabled={!canRecord}
            onClick={handleRecord}
            className="min-h-11 rounded-xl bg-violet-700 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Registra per il riesame
          </button>

          {feedback && <p role="status" className="text-xs font-semibold leading-5 text-slate-700">{feedback}</p>}
        </div>
      )}

      {observations.length > 0 && (
        <details className="mt-4 border-t border-violet-200 pt-3" data-implementation-observation-history>
          <summary className="cursor-pointer text-xs font-bold text-slate-700">Osservazioni registrate ({observations.length})</summary>
          <div className="mt-3 space-y-2">
            {Object.entries(counts).map(([key, count]) => (
              <div key={key} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
                <span>{IMPLEMENTATION_SIGNAL_LABELS[key as ImplementationSignal]}</span>
                <span className="font-black text-slate-700">{count}</span>
              </div>
            ))}
            <p className="flex items-start gap-2 text-[10px] leading-4 text-slate-500">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
              I segnali restano osservazioni professionali. Un riesame curricolare richiede aggregazione o una motivazione professionale esplicita e non viene aperto automaticamente.
            </p>
          </div>
        </details>
      )}
    </section>
  );
}
