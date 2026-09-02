import { useMemo, useState } from 'react';
import {
  buildTechnologySourceReviewQueue,
  promoteTechnologyElementFromHumanReceipt,
  validateTechnologySourceVerificationReceipt,
  type TechnologySourceReviewDecision,
  type TechnologySourceVerificationReceipt,
} from '../../../domain/curriculum/national/technologyHumanVerification';
import { DM221_2025_SOURCE } from '../../../domain/curriculum/national/dm2212025';

const STORAGE_KEY = 'cml.dm221.technology.source-review.receipts.v1';

const GROUP_LABELS: Record<string, string> = {
  PRIMARY_EXPECTED_COMPETENCES: 'Competenze attese al termine della quinta',
  PRIMARY_GRADE3_OBJECTIVES: 'Obiettivi al termine della terza',
  PRIMARY_GRADE5_OBJECTIVES: 'Obiettivi al termine della quinta',
  PRIMARY_KNOWLEDGE: 'Conoscenze',
  LOWER_SECONDARY_EXPECTED_COMPETENCES: 'Competenze attese al termine della terza',
  LOWER_SECONDARY_GRADE3_OBJECTIVES: 'Obiettivi al termine della terza',
  LOWER_SECONDARY_KNOWLEDGE: 'Conoscenze',
};

const SCHOOL_ORDER_LABELS = {
  primaria: 'Scuola primaria',
  secondaria: 'Secondaria di I grado',
} as const;

function readReceipts(): TechnologySourceVerificationReceipt[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistReceipts(receipts: TechnologySourceVerificationReceipt[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
}

export function TechnologySourceReviewTask() {
  const queue = useMemo(() => buildTechnologySourceReviewQueue(), []);
  const [receipts, setReceipts] = useState<TechnologySourceVerificationReceipt[]>(readReceipts);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const completed = new Set(readReceipts().map((receipt) => receipt.elementId));
    const firstPending = queue.findIndex((task) => !completed.has(task.elementId));
    return firstPending >= 0 ? firstPending : 0;
  });
  const [sourceText, setSourceText] = useState('');
  const [notes, setNotes] = useState('');
  const [attested, setAttested] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const completedIds = useMemo(() => new Set(receipts.map((receipt) => receipt.elementId)), [receipts]);
  const current = queue[currentIndex];
  const completedCount = completedIds.size;
  const progress = Math.round((completedCount / queue.length) * 100);

  const saveDecision = (decision: TechnologySourceReviewDecision) => {
    if (!current) return;
    if (!attested) {
      setFeedback('Conferma prima di aver letto personalmente questo elemento nella fonte indicata.');
      return;
    }

    const receipt: TechnologySourceVerificationReceipt = {
      schemaVersion: 'dm221-tech-source-review-v1',
      elementId: current.elementId,
      sourceId: current.sourceId,
      page: current.page,
      section: current.section,
      ordinal: current.ordinal,
      decision,
      verifiedSourceText: sourceText,
      reviewerAttestation: true,
      reviewedAt: new Date().toISOString(),
      notes: notes.trim() || undefined,
    };

    const validation = validateTechnologySourceVerificationReceipt(receipt);
    if (!validation.valid) {
      setFeedback(validation.reason);
      return;
    }

    if (decision === 'VERIFIED') {
      try {
        promoteTechnologyElementFromHumanReceipt(receipt);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : 'La verifica non può essere registrata.');
        return;
      }
    }

    const nextReceipts = [...receipts.filter((item) => item.elementId !== receipt.elementId), receipt];
    persistReceipts(nextReceipts);
    setReceipts(nextReceipts);
    setSourceText('');
    setNotes('');
    setAttested(false);
    setFeedback(
      decision === 'VERIFIED'
        ? 'Verifica registrata localmente. Non modifica il curricolo d’istituto e non equivale a un’adozione.'
        : 'Esito registrato localmente. L’elemento non viene promosso come testo verificato.',
    );

    const nextPending = queue.findIndex((task, index) => index > currentIndex && !new Set(nextReceipts.map((item) => item.elementId)).has(task.elementId));
    if (nextPending >= 0) setCurrentIndex(nextPending);
  };

  const exportReceipts = () => {
    if (typeof document === 'undefined') return;
    const blob = new Blob([JSON.stringify(receipts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'dm221-tecnologia-verifiche-fonte.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (!current) return null;

  const officialSourceUrl = `${DM221_2025_SOURCE.officialLocator.pdfUrl}#page=${current.page}`;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5" aria-labelledby="technology-source-review-title">
      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Curricolo verticale · Tecnologia</span>
        <h3 id="technology-source-review-title" className="text-base font-black text-slate-900">Verifica il testo nella fonte ufficiale</h3>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          Apri la pagina indicata, riporta ciò che leggi e scegli l’esito. Nessuna modifica automatica.
        </p>
      </div>

      <div className="space-y-2" aria-label={`Avanzamento ${completedCount} di ${queue.length}`}>
        <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-600">
          <span>Scheda {currentIndex + 1} di {queue.length}</span>
          <span>{completedCount} già controllate</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-indigo-600" style={{ width: `${progress}%` }} /></div>
      </div>

      <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-2">
        <p className="text-xs font-black uppercase tracking-wide text-indigo-700">{SCHOOL_ORDER_LABELS[current.schoolOrder]}</p>
        <p className="text-sm font-bold text-slate-900">{GROUP_LABELS[current.group] ?? current.group} · elemento {current.ordinal}</p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-600">D.M. 221/2025 · pagina {current.page}</span>
          <a
            href={officialSourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-black text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
          >
            Apri la fonte ufficiale
          </a>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="technology-source-text" className="text-sm font-bold text-slate-800">Testo che leggi nella fonte</label>
        <textarea
          id="technology-source-text"
          value={sourceText}
          onChange={(event) => setSourceText(event.target.value)}
          rows={5}
          placeholder="Riporta qui il testo della scheda."
          className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="technology-source-notes" className="text-sm font-bold text-slate-800">Nota facoltativa</label>
        <input
          id="technology-source-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Per esempio: impaginazione ambigua o testo da ricontrollare."
          className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        <input type="checkbox" checked={attested} onChange={(event) => setAttested(event.target.checked)} className="mt-1" />
        <span>Confermo di aver controllato personalmente questo elemento nella fonte indicata.</span>
      </label>

      {feedback && <p role="status" className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm font-semibold text-slate-700">{feedback}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button type="button" onClick={() => saveDecision('VERIFIED')} className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white hover:bg-indigo-700">Conferma corrispondenza</button>
        <button type="button" onClick={() => saveDecision('NEEDS_CORRECTION')} className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-black text-amber-900 hover:bg-amber-100">Da correggere</button>
        <button type="button" onClick={() => saveDecision('REJECTED')} className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-black text-rose-900 hover:bg-rose-100">Non corrisponde</button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="flex gap-2">
          <button type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))} className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-40">Precedente</button>
          <button type="button" disabled={currentIndex >= queue.length - 1} onClick={() => setCurrentIndex((index) => Math.min(queue.length - 1, index + 1))} className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-40">Successivo</button>
        </div>
        <button type="button" onClick={exportReceipts} disabled={receipts.length === 0} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-40">Esporta le verifiche</button>
      </div>

      <details className="text-xs text-slate-500">
        <summary className="cursor-pointer font-bold">Dettagli tecnici della verifica</summary>
        <div className="mt-2 space-y-1 break-all">
          <p>Elemento: {current.elementId}</p>
          <p>Fonte: {current.sourceId}</p>
          <p>Stato iniziale: {current.status}</p>
          <p>Una verifica positiva certifica il testo sorgente; non costituisce adozione istituzionale.</p>
        </div>
      </details>
    </section>
  );
}