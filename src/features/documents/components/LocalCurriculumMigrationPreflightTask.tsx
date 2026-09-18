import { useEffect, useState } from 'react';
import {
  R7C6C_LOCAL_PREFLIGHT_RECEIPT_STORAGE_KEY,
  fingerprintLegacyCurriculumSource,
  readCurrentLegacyCurriculumSnapshot,
  runLocalLegacyCurriculumMigrationPreflight,
  validateLocalMigrationPreflightReceipt,
  type LocalMigrationPreflightReceipt,
} from '../../../domain/curriculum/persistence/migrationLocalPreflight';

async function readValidStoredReceipt(): Promise<LocalMigrationPreflightReceipt | null> {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(R7C6C_LOCAL_PREFLIGHT_RECEIPT_STORAGE_KEY);
  if (!raw) return null;
  try {
    const candidate = JSON.parse(raw) as unknown;
    const snapshot = readCurrentLegacyCurriculumSnapshot(window.localStorage);
    const fingerprint = await fingerprintLegacyCurriculumSource(snapshot.source);
    return validateLocalMigrationPreflightReceipt(candidate, fingerprint.sha256)
      ? candidate
      : null;
  } catch {
    return null;
  }
}

export function LocalCurriculumMigrationPreflightTask() {
  const [running, setRunning] = useState(false);
  const [receipt, setReceipt] = useState<LocalMigrationPreflightReceipt | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    void readValidStoredReceipt().then((stored) => {
      if (stored) setReceipt(stored);
    });
  }, []);

  const runPreflight = async () => {
    if (running || typeof window === 'undefined') return;
    setRunning(true);
    setFeedback(null);
    try {
      const result = await runLocalLegacyCurriculumMigrationPreflight(window.localStorage);
      if (result.state !== 'PASS') {
        setReceipt(null);
        setFeedback(`Controllo bloccato: ${result.reason}. Nessun dato è stato migrato.`);
        return;
      }
      window.localStorage.setItem(
        R7C6C_LOCAL_PREFLIGHT_RECEIPT_STORAGE_KEY,
        JSON.stringify(result.receipt),
      );
      setReceipt(result.receipt);
      setFeedback(
        'Controllo superato sulla copia del curricolo locale: backup, confronto e rollback sono coerenti. Il runtime resta legacy-only.',
      );
    } catch {
      setFeedback('Controllo non completato. Nessun dato è stato migrato e la modalità di persistenza non è cambiata.');
    } finally {
      setRunning(false);
    }
  };

  const exportReceipt = () => {
    if (!receipt || typeof document === 'undefined') return;
    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'arena-r7c6c-controllo-migrazione-locale.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const clearReceipt = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(R7C6C_LOCAL_PREFLIGHT_RECEIPT_STORAGE_KEY);
    }
    setReceipt(null);
    setFeedback('Ricevuta locale eliminata. Il curricolo non è stato modificato.');
  };

  return (
    <section
      className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
      data-r7c6c-local-preflight
      aria-labelledby="local-curriculum-preflight-title"
    >
      <div className="max-w-3xl">
        <h3 id="local-curriculum-preflight-title" className="text-sm font-black text-slate-900">
          Controllo tecnico del curricolo locale
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Esegue backup, migrazione di prova, confronto e rollback su una copia in memoria del curricolo che Arena sta usando. Non apre il database produttivo del nuovo dominio e non cambia la modalità <strong>legacy-only</strong>.
        </p>
      </div>

      {receipt && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-950" role="status">
          <p className="font-black">Ultimo controllo valido per i dati correnti</p>
          <p>Origine: {receipt.sourceOrigin === 'LOCAL_CUSTOM_CURRICULUM' ? 'curricolo locale personalizzato' : 'baseline inclusa'}</p>
          <p>Discipline/chiavi sorgente: {receipt.sourceSubjectCount}</p>
          <p>SHA-256 snapshot: <code>{receipt.sourceSha256.slice(0, 16)}…</code></p>
          <p>Eseguito: {receipt.runAt}</p>
        </div>
      )}

      {feedback && (
        <p role="status" className="rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-700">
          {feedback}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={running}
          onClick={runPreflight}
          className="min-h-11 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:bg-slate-400"
        >
          {running ? 'Controllo in corso…' : 'Esegui controllo in copia'}
        </button>
        {receipt && (
          <>
            <button
              type="button"
              onClick={exportReceipt}
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800"
            >
              Esporta ricevuta
            </button>
            <button
              type="button"
              onClick={clearReceipt}
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-600"
            >
              Elimina ricevuta
            </button>
          </>
        )}
      </div>

      <p className="text-[11px] leading-5 text-slate-500">
        Una ricevuta valida dimostra soltanto che lo snapshot locale corrente supera il rehearsal tecnico in copia. Non verifica i testi nazionali, non corregge il curricolo d’istituto e non autorizza da sola il passaggio a dual-read.
      </p>
    </section>
  );
}
