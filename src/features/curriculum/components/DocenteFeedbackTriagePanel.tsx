import React, { useEffect, useState } from 'react';
import { FileUp, MessageSquareText } from 'lucide-react';
import type { DocenteFeedbackCategory, DocenteFeedbackObservation } from '../../../domain/transfer/docenteFeedbackIntake';
import {
  DOCENTE_FEEDBACK_FILE_MAX_BYTES,
  DOCENTE_FEEDBACK_LOCAL_STORAGE_KEY,
  importDocenteFeedbackJson,
  mergeStoredDocenteFeedback,
  parseStoredDocenteFeedback,
} from '../../../domain/transfer/docenteFeedbackFileRelay';

const CATEGORY_LABELS: Record<DocenteFeedbackCategory, string> = {
  SEQUENCING: 'Ordine o sequenza',
  PREREQUISITE: 'Prerequisito necessario',
  SCOPE: 'Ampiezza del contenuto',
  WORDING: 'Formulazione da chiarire',
  FEASIBILITY: 'Realizzabilità didattica',
  OTHER: 'Altra osservazione',
};

export function DocenteFeedbackTriagePanel() {
  const [observations, setObservations] = useState<DocenteFeedbackObservation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastImportedId, setLastImportedId] = useState<string | null>(null);

  useEffect(() => {
    setObservations(parseStoredDocenteFeedback(window.localStorage.getItem(DOCENTE_FEEDBACK_LOCAL_STORAGE_KEY)));
  }, []);

  async function importFile(file: File | null) {
    if (!file) return;
    setError(null);
    setLastImportedId(null);
    try {
      if (file.size > DOCENTE_FEEDBACK_FILE_MAX_BYTES) throw new Error('Il file supera il limite di 256 KiB.');
      if (!file.name.toLowerCase().endsWith('.json')) throw new Error('Seleziona il file JSON preparato da Docente OS.');
      const receipt = importDocenteFeedbackJson(await file.text(), observations);
      const next = mergeStoredDocenteFeedback(observations, receipt.observation);
      window.localStorage.setItem(DOCENTE_FEEDBACK_LOCAL_STORAGE_KEY, JSON.stringify(next));
      setObservations(next);
      setLastImportedId(receipt.observation.receivedMessageId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Non è stato possibile leggere l’osservazione.');
    }
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3" aria-labelledby="docente-feedback-title">
      <div className="flex items-start gap-3">
        <MessageSquareText className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <h2 id="docente-feedback-title" className="text-sm font-extrabold text-slate-800">Osservazioni dal lavoro didattico</h2>
          <p className="text-xs text-slate-600 mt-1">Importa un’osservazione preparata e confermata in Docente OS. Entra qui come evidenza professionale da valutare: non diventa automaticamente una proposta e non produce alcuna decisione.</p>
        </div>
      </div>

      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-800 text-xs font-bold cursor-pointer hover:bg-indigo-100">
        <FileUp className="w-4 h-4" />
        <span>Importa osservazione da Docente OS</span>
        <input
          className="sr-only"
          type="file"
          accept="application/json,.json"
          onChange={(event) => { void importFile(event.currentTarget.files?.[0] ?? null); event.currentTarget.value = ''; }}
        />
      </label>

      {lastImportedId ? <p className="text-xs text-emerald-700 font-semibold">Osservazione acquisita. È pronta per il triage umano.</p> : null}
      {error ? <p className="text-xs text-rose-700 font-semibold" role="alert">{error}</p> : null}

      {observations.length === 0 ? (
        <p className="text-xs text-slate-500">Nessuna osservazione importata in questa sessione locale.</p>
      ) : (
        <div className="space-y-2">
          {observations.slice().reverse().map((observation) => (
            <article key={observation.observationId} className="border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wide bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">{CATEGORY_LABELS[observation.category]}</span>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-1 rounded-full">Da valutare</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{observation.summary}</p>
              <p className="text-[11px] text-slate-500">Fonte: Docente OS · conferma professionale del docente · nessuna autorità istituzionale trasferita.</p>
              <details>
                <summary className="text-[11px] text-slate-500 cursor-pointer">Dettagli tecnici e provenienza</summary>
                <div className="mt-2 text-[10px] text-slate-500 space-y-1 break-all">
                  <p>Messaggio {observation.receivedMessageId}</p>
                  <p>Versione curricolo {observation.curriculumVersionRef.entityId}{observation.curriculumVersionRef.versionId ? ` · ${observation.curriculumVersionRef.versionId}` : ''}</p>
                  <p>{observation.alignedNodeRefs.length} riferimento/i curricolare/i · {observation.evidenceRefs.length} riferimento/i di evidenza.</p>
                </div>
              </details>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
