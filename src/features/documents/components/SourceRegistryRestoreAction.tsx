import { useRef, useState, type ChangeEvent } from 'react';
import { AlertTriangle, CheckCircle2, FileUp, RotateCcw, ShieldCheck } from 'lucide-react';
import {
  applyLocalSourceRegistryRestore,
  previewLocalSourceRegistryRestore,
  type LocalSourceRegistryRestorePreview,
} from '../lib/localSourceRegistryRestore';
import type { CustomKbDoc } from '../lib/localKnowledgeStore';

const MAX_RESTORE_PACKAGE_BYTES = 64 * 1024 * 1024;

export interface SourceRegistryRestoreActionProps {
  setCustomKbDocs: React.Dispatch<React.SetStateAction<CustomKbDoc[]>>;
  showToast: (message: string, success: boolean) => void;
}

type RestoreState = 'idle' | 'reading' | 'preview' | 'restoring' | 'success' | 'error';

function shortHash(hash: string): string {
  return hash.length > 22 ? `${hash.slice(0, 22)}…` : hash;
}

function restoreErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('BACKUP_PACKAGE_MAGIC_INVALID')) return 'Il file non è un package di backup CurManLight riconosciuto.';
  if (message.includes('BACKUP_PACKAGE') || message.includes('SNAPSHOT_INVALID_JSON')) return 'Il package di backup è incompleto o non leggibile.';
  if (message.includes('SCHEMA_UNSUPPORTED')) return 'La versione di questo backup non è supportata da questa release di Arena.';
  if (message.includes('CONTENT_HASH_MISMATCH') || message.includes('FINGERPRINT_MISMATCH')) return 'Il controllo di integrità non coincide: il ripristino è stato bloccato.';
  if (message.includes('AUTHORITY_ESCALATION_BLOCKED')) return 'Il backup contiene un livello di autorità non ammesso per il registro personale. Ripristino bloccato.';
  if (message.includes('COUNT_MISMATCH') || message.includes('ORPHAN_GOVERNANCE') || message.includes('GOVERNANCE_MISSING')) return 'Fonti e governance del backup non sono coerenti. Ripristino bloccato.';
  if (message.includes('VERIFICATION_STATE_INCONSISTENT')) return 'Lo stato di verifica del backup non è coerente. Ripristino bloccato.';
  return 'Non riesco a validare o ripristinare questo backup. Nessun dato locale è stato modificato.';
}

export function SourceRegistryRestoreAction({
  setCustomKbDocs,
  showToast,
}: SourceRegistryRestoreActionProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<RestoreState>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<LocalSourceRegistryRestorePreview | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reset = () => {
    setState('idle');
    setFileName(null);
    setPreview(null);
    setErrorMessage(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const onFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setPreview(null);
    setErrorMessage(null);

    if (file.size <= 0 || file.size > MAX_RESTORE_PACKAGE_BYTES) {
      const message = 'Il package deve essere non vuoto e non superare 64 MB.';
      setState('error');
      setErrorMessage(message);
      showToast(message, false);
      return;
    }

    setState('reading');
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const candidate = await previewLocalSourceRegistryRestore(bytes);
      setPreview(candidate);
      setState('preview');
    } catch (error) {
      console.warn('[CML-DRIVE-01] Restore preview rejected:', error);
      const message = restoreErrorMessage(error);
      setErrorMessage(message);
      setState('error');
      showToast(message, false);
    }
  };

  const confirmRestore = async () => {
    if (!preview || state === 'restoring') return;
    setState('restoring');
    setErrorMessage(null);
    try {
      const result = await applyLocalSourceRegistryRestore(preview);
      setCustomKbDocs(result.sources);
      setState('success');
      showToast(
        `Ripristino completato: ${result.restoredSourceCount} fonti locali. ${result.needsVerificationCount} richiedono verifica nel contesto corrente.`,
        true,
      );
    } catch (error) {
      console.warn('[CML-DRIVE-01] Explicit restore failed:', error);
      const message = restoreErrorMessage(error);
      setErrorMessage(message);
      setState('error');
      showToast(message, false);
    }
  };

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
      aria-labelledby="source-registry-restore-title"
      data-human-task="source-registry-explicit-restore"
      data-restore-mode="preview-confirm"
    >
      <div className="flex items-start gap-3">
        <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 id="source-registry-restore-title" className="text-base font-black text-slate-900">Ripristina un backup delle fonti personali</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Seleziona un file <strong>.cml-backup</strong>. Arena verifica package, schema, hash, versioni e governance prima di mostrarti l’anteprima. La selezione del file non modifica alcun dato.
          </p>
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            <p>
              Il ripristino è locale e provider-neutral: Arena non legge Drive e non sincronizza cartelle. Se il backup appartiene a un altro principal locale, la verifica personale precedente non viene ereditata automaticamente.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-bold text-indigo-700">
              <FileUp className="h-4 w-4" aria-hidden="true" />
              {state === 'reading' ? 'Verifica del package…' : 'Seleziona .cml-backup'}
              <input
                ref={inputRef}
                type="file"
                accept=".cml-backup,application/vnd.curmanlight.backup"
                disabled={state === 'reading' || state === 'restoring'}
                onChange={(event) => void onFileSelected(event)}
                className="sr-only"
              />
            </label>
            {fileName && <span className="text-xs font-semibold text-slate-600">{fileName}</span>}
            {(preview || errorMessage || state === 'success') && (
              <button type="button" onClick={reset} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700">Azzera</button>
            )}
          </div>

          {errorMessage && (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800" role="alert">{errorMessage}</p>
          )}

          {preview && (state === 'preview' || state === 'restoring') && (
            <div className="mt-4 space-y-3 rounded-xl border-2 border-amber-300 bg-amber-50/60 p-4" data-restore-preview="ready">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
                <div>
                  <h3 className="font-black text-slate-900">Anteprima: il registro locale corrente verrà sostituito</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    Il backup contiene {preview.restoredSourceCount} fonti; il browser ne contiene ora {preview.currentSourceCount}. Nessuna modifica avviene finché non premi la conferma qui sotto.
                  </p>
                </div>
              </div>
              <dl className="grid gap-1 text-xs leading-5 text-slate-700 sm:grid-cols-2">
                <div><dt className="font-bold">Backup creato</dt><dd>{preview.snapshotCreatedAt}</dd></div>
                <div><dt className="font-bold">Hash verificato</dt><dd>{shortHash(preview.recomputedContentHash)}</dd></div>
                <div><dt className="font-bold">Verifiche preservabili</dt><dd>{preview.preservedVerificationCount}</dd></div>
                <div><dt className="font-bold">Fonti da verificare dopo il restore</dt><dd>{preview.needsVerificationCount}</dd></div>
                <div><dt className="font-bold">Riassegnazioni al principal corrente</dt><dd>{preview.principalRebindCount}</dd></div>
                <div><dt className="font-bold">Autorità acquisita dal backup</dt><dd>nessuna</dd></div>
              </dl>
              <button
                type="button"
                disabled={state === 'restoring'}
                onClick={() => void confirmRestore()}
                className="min-h-11 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-bold text-white disabled:bg-slate-300"
              >
                {state === 'restoring' ? 'Ripristino in corso…' : 'Conferma ripristino locale'}
              </button>
            </div>
          )}

          {state === 'success' && preview && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900" role="status">
              <div className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Ripristino completato</div>
              <p className="mt-1 text-xs leading-5">{preview.restoredSourceCount} fonti ripristinate; {preview.needsVerificationCount} restano da verificare nel principal e contesto correnti.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
