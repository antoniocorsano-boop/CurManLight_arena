import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CircleDotDashed, RefreshCw, Route } from 'lucide-react';
import { INSTITUTE_CURRICULUM_SOURCE_RECONSTRUCTION_V3 } from '../../../domain/curriculum/institute/sourceReconstructionReadiness';
import { buildInstituteSourceChangeTrace } from '../../../domain/curriculum/institute/sourceChangeTrace';
import {
  validateInstituteSourceReviewReceipt,
  type InstituteSourceReviewReceipt,
} from '../../../domain/curriculum/institute/sourceReviewQueue';

const SOURCE_SHA256 = INSTITUTE_CURRICULUM_SOURCE_RECONSTRUCTION_V3.sourceSha256;
const STORAGE_KEY = `arena-institute-source-review-receipts-v1:${SOURCE_SHA256}`;

function readReceipts(): InstituteSourceReviewReceipt[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is InstituteSourceReviewReceipt => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
      return validateInstituteSourceReviewReceipt(value as InstituteSourceReviewReceipt).valid;
    });
  } catch {
    return [];
  }
}

export function InstituteSourceChangeTracePanel() {
  const [receipts, setReceipts] = useState<InstituteSourceReviewReceipt[]>(() => readReceipts());
  const refresh = useCallback(() => setReceipts(readReceipts()), []);
  const trace = useMemo(() => buildInstituteSourceChangeTrace(receipts), [receipts]);
  const resolved = trace.filter((entry) => entry.status === 'RESOLVED').length;
  const acknowledged = trace.filter((entry) => entry.status === 'ACKNOWLEDGED').length;

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) refresh();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  return (
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 sm:p-5" data-source-change-trace>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-start gap-3">
            <Route className="mt-0.5 h-5 w-5 shrink-0 text-indigo-700" aria-hidden="true" />
            <div>
              <h2 className="text-base font-black text-slate-900">Traccia delle modifiche alla fonte d’istituto</h2>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                Rende leggibile il percorso problema → decisione umana → eventuale nuova fonte → stato. La traccia documenta il processo, ma non approva il curricolo e non attribuisce autorità ai contenuti.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-white px-2.5 py-1 text-emerald-800">Risolti {resolved}/7</span>
            <span className="rounded-full bg-white px-2.5 py-1 text-amber-800">Presi in carico {acknowledged}</span>
            <span className="rounded-full bg-white px-2.5 py-1 text-slate-700">Autorità automatica: nessuna</span>
          </div>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm font-bold text-indigo-800"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Aggiorna traccia
        </button>
      </div>

      <details className="mt-4 rounded-xl border border-indigo-100 bg-white">
        <summary className="cursor-pointer px-4 py-3 text-sm font-black text-slate-800">
          Mostra i 7 passaggi documentati
        </summary>
        <div className="border-t border-indigo-100 p-4 space-y-3">
          {trace.map((entry) => (
            <article key={entry.taskId} className="rounded-xl border border-slate-200 bg-slate-50 p-4" data-source-change-trace-entry={entry.taskId}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                    <span>{entry.findingId}</span>
                    <span>pp. {entry.pages.join(', ')}</span>
                  </div>
                  <h3 className="mt-1 font-black text-slate-900">{entry.target}</h3>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-black ${entry.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : entry.status === 'ACKNOWLEDGED' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'}`}>
                  {entry.status === 'RESOLVED' ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <CircleDotDashed className="h-3.5 w-3.5" aria-hidden="true" />}
                  {entry.status === 'RESOLVED' ? 'Risolto' : entry.status === 'ACKNOWLEDGED' ? 'Preso in carico' : 'Aperto'}
                </span>
              </div>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-black uppercase tracking-wide text-slate-500">Problema</dt>
                  <dd className="mt-1 leading-6 text-slate-700">{entry.problem}</dd>
                </div>
                <div>
                  <dt className="text-xs font-black uppercase tracking-wide text-slate-500">Decisione umana</dt>
                  <dd className="mt-1 leading-6 text-slate-700">{entry.decision}</dd>
                </div>
                <div>
                  <dt className="text-xs font-black uppercase tracking-wide text-slate-500">Fonte</dt>
                  <dd className="mt-1 break-all font-mono text-xs leading-5 text-slate-700">
                    {entry.replacementSourceSha256 ? `nuova sha256:${entry.replacementSourceSha256}` : `fonte auditata sha256:${SOURCE_SHA256}`}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-black uppercase tracking-wide text-slate-500">Effetto di autorità</dt>
                  <dd className="mt-1 font-bold text-slate-700">Nessuno — resta richiesta la governance prevista</dd>
                </div>
              </dl>
              {entry.correctionNote && (
                <p className="mt-3 rounded-lg bg-white px-3 py-2 text-xs leading-5 text-slate-600">
                  <strong className="text-slate-800">Nota di correzione:</strong> {entry.correctionNote}
                </p>
              )}
            </article>
          ))}
        </div>
      </details>
    </section>
  );
}
