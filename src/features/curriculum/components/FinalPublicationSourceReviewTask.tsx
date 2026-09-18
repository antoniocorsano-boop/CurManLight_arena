import { useMemo, useState } from 'react';
import {
  buildFinalPublicationSourceReviewQueue,
  migrateTechnologySourceVerificationReceipt,
  promoteFinalPublicationElementFromHumanReceipt,
  validateFinalPublicationSourceVerificationReceipt,
  type FinalPublicationSourceReviewDecision,
  type FinalPublicationSourceReviewTask as ReviewTask,
  type FinalPublicationSourceVerificationReceipt,
} from '../../../domain/curriculum/national/finalPublicationHumanVerification';
import type { TechnologySourceVerificationReceipt } from '../../../domain/curriculum/national/technologyHumanVerification';
import { DM221_2025_SOURCE } from '../../../domain/curriculum/national/dm2212025';

const STORAGE_KEY = 'cml.dm221.final-publication.source-review.receipts.v1';
const LEGACY_TECHNOLOGY_STORAGE_KEY = 'cml.dm221.technology.source-review.receipts.v1';

type OrderFilter = 'ALL' | ReviewTask['schoolOrder'];
type StatusFilter = 'ALL' | 'PENDING' | FinalPublicationSourceReviewDecision;

function getSchoolOrderLabel(schoolOrder: ReviewTask['schoolOrder']): string {
  if (schoolOrder === 'infanzia') return 'Scuola dell’infanzia';
  if (schoolOrder === 'primaria') return 'Scuola primaria';
  return 'Secondaria di I grado';
}

function readJsonArray(key: string): unknown[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistReceipts(receipts: FinalPublicationSourceVerificationReceipt[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
}

function readReceipts(): FinalPublicationSourceVerificationReceipt[] {
  if (typeof window === 'undefined') return [];

  const merged = new Map<string, FinalPublicationSourceVerificationReceipt>();

  for (const raw of readJsonArray(LEGACY_TECHNOLOGY_STORAGE_KEY)) {
    const migrated = migrateTechnologySourceVerificationReceipt(raw as TechnologySourceVerificationReceipt);
    if (migrated && validateFinalPublicationSourceVerificationReceipt(migrated).valid) {
      merged.set(migrated.elementId, migrated);
    }
  }

  for (const raw of readJsonArray(STORAGE_KEY)) {
    const receipt = raw as FinalPublicationSourceVerificationReceipt;
    if (validateFinalPublicationSourceVerificationReceipt(receipt).valid) {
      merged.set(receipt.elementId, receipt);
    }
  }

  const receipts = [...merged.values()];
  if (receipts.length > 0) persistReceipts(receipts);
  return receipts;
}

function receiptStatus(
  task: ReviewTask,
  receiptsById: ReadonlyMap<string, FinalPublicationSourceVerificationReceipt>,
): Exclude<StatusFilter, 'ALL'> {
  return receiptsById.get(task.elementId)?.decision ?? 'PENDING';
}

export function FinalPublicationSourceReviewTask() {
  const queue = useMemo(() => buildFinalPublicationSourceReviewQueue(), []);
  const [receipts, setReceipts] = useState<FinalPublicationSourceVerificationReceipt[]>(readReceipts);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('ALL');
  const [scopeFilter, setScopeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sourceText, setSourceText] = useState('');
  const [notes, setNotes] = useState('');
  const [attested, setAttested] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const receiptsById = useMemo(
    () => new Map(receipts.map((receipt) => [receipt.elementId, receipt] as const)),
    [receipts],
  );

  const scopeOptions = useMemo(() => {
    const seen = new Set<string>();
    return queue
      .filter((task) => {
        if (seen.has(task.segmentId)) return false;
        seen.add(task.segmentId);
        return true;
      })
      .map((task) => ({ id: task.segmentId, label: task.scopeLabel }));
  }, [queue]);

  const filteredQueue = useMemo(
    () =>
      queue.filter((task) => {
        if (orderFilter !== 'ALL' && task.schoolOrder !== orderFilter) return false;
        if (scopeFilter !== 'ALL' && task.segmentId !== scopeFilter) return false;
        if (statusFilter !== 'ALL' && receiptStatus(task, receiptsById) !== statusFilter) return false;
        return true;
      }),
    [orderFilter, queue, receiptsById, scopeFilter, statusFilter],
  );

  const safeIndex = Math.min(currentIndex, Math.max(0, filteredQueue.length - 1));
  const current = filteredQueue[safeIndex];
  const reviewedCount = receipts.length;
  const verifiedCount = receipts.filter((receipt) => receipt.decision === 'VERIFIED').length;
  const progress = Math.round((reviewedCount / queue.length) * 100);

  const resetEditor = () => {
    setSourceText('');
    setNotes('');
    setAttested(false);
  };

  const changeFilter = (change: () => void) => {
    change();
    setCurrentIndex(0);
    resetEditor();
    setFeedback(null);
  };

  const saveDecision = (decision: FinalPublicationSourceReviewDecision) => {
    if (!current) return;
    if (!attested) {
      setFeedback('Conferma prima di aver letto personalmente questo elemento nella pubblicazione finale indicata.');
      return;
    }

    const receipt: FinalPublicationSourceVerificationReceipt = {
      schemaVersion: 'dm221-final-publication-source-review-v1',
      elementId: current.elementId,
      segmentId: current.segmentId,
      group: current.group,
      ordinal: current.ordinal,
      sourceId: current.sourceId,
      page: current.page,
      section: current.section,
      decision,
      verifiedSourceText: sourceText,
      reviewerAttestation: true,
      reviewedAt: new Date().toISOString(),
      notes: notes.trim() || undefined,
    };

    const validation = validateFinalPublicationSourceVerificationReceipt(receipt);
    if (!validation.valid) {
      setFeedback(validation.reason);
      return;
    }

    if (decision === 'VERIFIED') {
      try {
        promoteFinalPublicationElementFromHumanReceipt(receipt);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : 'La verifica non può essere registrata.');
        return;
      }
    }

    const nextReceipts = [...receipts.filter((item) => item.elementId !== receipt.elementId), receipt];
    persistReceipts(nextReceipts);
    setReceipts(nextReceipts);
    resetEditor();
    setFeedback(
      decision === 'VERIFIED'
        ? 'Testo sorgente verificato e ricevuta salvata localmente. Questo non approva né adotta il curricolo d’istituto.'
        : 'Esito salvato localmente. L’elemento non viene promosso come testo sorgente verificato.',
    );
  };

  const exportReceipts = () => {
    if (typeof document === 'undefined') return;
    const blob = new Blob([JSON.stringify(receipts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'dm221-verifiche-fonte-pubblicazione-finale.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="final-source-review-title">
      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Indicazioni nazionali 2025 · pubblicazione finale MIM</span>
        <h3 id="final-source-review-title" className="text-base font-black text-slate-900">Verifica i testi della fonte, un elemento alla volta</h3>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
          Il registro contiene {queue.length} slot strutturali già localizzati. La verifica resta umana: il sistema non precompila il testo e non attribuisce automaticamente autorità normativa.
        </p>
      </div>

      <div className="space-y-2" aria-label={`Avanzamento ${reviewedCount} di ${queue.length}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600">
          <span>{reviewedCount} controllati · {verifiedCount} verificati</span>
          <span>{progress}% del registro strutturale</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-indigo-600" style={{ width: `${progress}%` }} /></div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3" aria-label="Filtri della coda di verifica">
        <label className="space-y-1 text-xs font-bold text-slate-700">
          <span>Ordine</span>
          <select
            aria-label="Filtra per ordine scolastico"
            value={orderFilter}
            onChange={(event) => changeFilter(() => setOrderFilter(event.target.value as OrderFilter))}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="ALL">Tutti gli ordini</option>
            <option value="infanzia">Infanzia</option>
            <option value="primaria">Primaria</option>
            <option value="secondaria">Secondaria di I grado</option>
          </select>
        </label>

        <label className="space-y-1 text-xs font-bold text-slate-700">
          <span>Campo / disciplina / quadro</span>
          <select
            aria-label="Filtra per campo o disciplina"
            value={scopeFilter}
            onChange={(event) => changeFilter(() => setScopeFilter(event.target.value))}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="ALL">Tutti gli ambiti</option>
            {scopeOptions.map((scope) => <option key={scope.id} value={scope.id}>{scope.label}</option>)}
          </select>
        </label>

        <label className="space-y-1 text-xs font-bold text-slate-700">
          <span>Stato</span>
          <select
            aria-label="Filtra per stato della verifica"
            value={statusFilter}
            onChange={(event) => changeFilter(() => setStatusFilter(event.target.value as StatusFilter))}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="PENDING">Da controllare</option>
            <option value="VERIFIED">Verificati</option>
            <option value="NEEDS_CORRECTION">Da correggere</option>
            <option value="REJECTED">Non corrispondenti</option>
            <option value="ALL">Tutti gli stati</option>
          </select>
        </label>
      </div>

      <p className="text-xs font-semibold text-slate-500">{filteredQueue.length} schede nella vista corrente.</p>

      {!current ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900" role="status">
          Nessuna scheda corrisponde ai filtri selezionati.
        </div>
      ) : (
        <>
          <div className="space-y-2 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-wide text-indigo-700">{getSchoolOrderLabel(current.schoolOrder)}</p>
              <span className="text-xs font-bold text-slate-500">Scheda {safeIndex + 1} di {filteredQueue.length}</span>
            </div>
            <p className="text-sm font-black text-slate-900">{current.scopeLabel}</p>
            <p className="text-sm font-semibold text-slate-700">{current.section} · elemento {current.ordinal}</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-600">Pagina stampata {current.page}</span>
              <a
                href={DM221_2025_SOURCE.officialCurriculumVolume.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-black text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
              >
                Apri la pubblicazione finale MIM
              </a>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">Il collegamento apre il volume ufficiale; usa il numero di pagina stampato indicato qui sopra. Non viene applicato un offset PDF non verificato.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="final-source-text" className="text-sm font-bold text-slate-800">Testo che leggi nella fonte</label>
            <textarea
              id="final-source-text"
              value={sourceText}
              onChange={(event) => setSourceText(event.target.value)}
              rows={5}
              placeholder="Riporta qui il testo dell’elemento esattamente come lo stai verificando."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="final-source-notes" className="text-sm font-bold text-slate-800">Nota facoltativa</label>
            <input
              id="final-source-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Per esempio: impaginazione ambigua, voce spezzata o da ricontrollare."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <input type="checkbox" checked={attested} onChange={(event) => setAttested(event.target.checked)} className="mt-1" />
            <span>Confermo di aver controllato personalmente questo elemento nella pubblicazione finale MIM alla pagina stampata indicata.</span>
          </label>

          {feedback && <p role="status" className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">{feedback}</p>}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button type="button" onClick={() => saveDecision('VERIFIED')} className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white hover:bg-indigo-700">Conferma corrispondenza</button>
            <button type="button" onClick={() => saveDecision('NEEDS_CORRECTION')} className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-black text-amber-900 hover:bg-amber-100">Da correggere</button>
            <button type="button" onClick={() => saveDecision('REJECTED')} className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-black text-rose-900 hover:bg-rose-100">Non corrisponde</button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex gap-2">
              <button type="button" disabled={safeIndex === 0} onClick={() => { setCurrentIndex((index) => Math.max(0, index - 1)); resetEditor(); }} className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-40">Precedente</button>
              <button type="button" disabled={safeIndex >= filteredQueue.length - 1} onClick={() => { setCurrentIndex((index) => Math.min(filteredQueue.length - 1, index + 1)); resetEditor(); }} className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-40">Successivo</button>
            </div>
            <button type="button" onClick={exportReceipts} disabled={receipts.length === 0} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-40">Esporta le verifiche</button>
          </div>

          <details className="text-xs text-slate-500">
            <summary className="cursor-pointer font-bold">Dettagli tecnici della verifica</summary>
            <div className="mt-2 space-y-1 break-all">
              <p>Elemento: {current.elementId}</p>
              <p>Segmento: {current.segmentId}</p>
              <p>Gruppo: {current.group}</p>
              <p>Fonte: {current.sourceId}</p>
              <p>Stato iniziale: {current.status}</p>
              <p>Una verifica positiva certifica il testo sorgente; non costituisce adozione istituzionale.</p>
            </div>
          </details>
        </>
      )}
    </section>
  );
}
