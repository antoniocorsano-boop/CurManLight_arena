import { useMemo, useState, type ChangeEvent } from 'react';
import { AlertTriangle, CheckCircle2, Download, FileCheck2, FileUp, RotateCcw, ShieldAlert, Upload } from 'lucide-react';
import { INSTITUTE_CURRICULUM_SOURCE_RECONSTRUCTION_V3 } from '../../../domain/curriculum/institute/sourceReconstructionReadiness';
import {
  INSTITUTE_SOURCE_REVIEW_QUEUE,
  assessInstituteSourceReview,
  createInstituteSourceReviewReceiptPack,
  doesInstituteSourceReceiptResolveTask,
  validateInstituteSourceReviewReceipt,
  validateInstituteSourceReviewReceiptPack,
  type InstituteSourceReviewDecision,
  type InstituteSourceReviewReceipt,
  type InstituteSourceReviewReceiptPack,
  type InstituteSourceReviewTask,
  type InstituteSourceReviewTaskId,
} from '../../../domain/curriculum/institute/sourceReviewQueue';

const SOURCE_SHA256 = INSTITUTE_CURRICULUM_SOURCE_RECONSTRUCTION_V3.sourceSha256;
const STORAGE_KEY = `arena-institute-source-review-receipts-v1:${SOURCE_SHA256}`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readStoredReceipts(): InstituteSourceReviewReceipt[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((candidate): candidate is InstituteSourceReviewReceipt => {
      if (!isRecord(candidate)) return false;
      return validateInstituteSourceReviewReceipt(candidate as unknown as InstituteSourceReviewReceipt).valid;
    });
  } catch {
    return [];
  }
}

function writeStoredReceipts(receipts: readonly InstituteSourceReviewReceipt[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
}

function receiptForTask(
  receipts: readonly InstituteSourceReviewReceipt[],
  taskId: InstituteSourceReviewTaskId,
): InstituteSourceReviewReceipt | null {
  return [...receipts].reverse().find((receipt) => receipt.taskId === taskId) ?? null;
}

function downloadJson(fileName: string, value: unknown): void {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function sha256File(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function decisionLabel(decision: InstituteSourceReviewDecision): string {
  switch (decision) {
    case 'ACKNOWLEDGED_REQUIRES_CORRECTED_SOURCE': return 'Preso in carico — serve fonte corretta';
    case 'CORRECTED_SOURCE_VERSION_LINKED': return 'Correzione verificata su nuova versione';
    case 'SCOPE_SECOND_YEAR_AND_LATER': return 'Latino/LEL dal secondo anno e successivi';
    case 'SCOPE_CLASS_ONE': return 'Latino/LEL applicabile alla classe prima';
    case 'SCOPE_DEFERRED': return 'Decisione sull’ambito rinviata';
    case 'IDENTITY_NORMALIZE_CANONICAL_PRESERVE_SOURCE_LABEL': return 'Normalizza al campo canonico conservando l’etichetta sorgente';
    case 'IDENTITY_KEEP_SOURCE_LABEL_PENDING_REPAIR': return 'Mantieni distinta l’etichetta finché la fonte non è corretta';
  }
}

function policyLabel(task: InstituteSourceReviewTask): string {
  switch (task.resolutionPolicy) {
    case 'CORRECTED_SOURCE_VERSION_REQUIRED': return 'Richiede una nuova versione corretta del DOCX';
    case 'HUMAN_SCOPE_DECISION_REQUIRED': return 'Richiede una decisione umana sull’ambito di classe';
    case 'HUMAN_IDENTITY_DECISION_REQUIRED': return 'Richiede una decisione umana sull’identità del campo';
  }
}

export function InstituteSourceReviewPanel() {
  const [receipts, setReceipts] = useState<InstituteSourceReviewReceipt[]>(readStoredReceipts);
  const [expanded, setExpanded] = useState(false);
  const [candidateSource, setCandidateSource] = useState<{ fileName: string; sha256: string } | null>(null);
  const [hashing, setHashing] = useState(false);
  const [notesByTask, setNotesByTask] = useState<Partial<Record<InstituteSourceReviewTaskId, string>>>({});
  const [scopeDecision, setScopeDecision] = useState<InstituteSourceReviewDecision>('SCOPE_DEFERRED');
  const [identityDecision, setIdentityDecision] = useState<InstituteSourceReviewDecision>('IDENTITY_KEEP_SOURCE_LABEL_PENDING_REPAIR');
  const [message, setMessage] = useState<string | null>(null);
  const assessment = useMemo(() => assessInstituteSourceReview(receipts), [receipts]);

  const persist = (next: InstituteSourceReviewReceipt[]) => {
    setReceipts(next);
    writeStoredReceipts(next);
  };

  const replaceReceipt = (
    task: InstituteSourceReviewTask,
    decision: InstituteSourceReviewDecision,
    extra: Partial<InstituteSourceReviewReceipt> = {},
  ) => {
    const nextReceipt: InstituteSourceReviewReceipt = {
      schemaVersion: 'arena-institute-source-review-receipt-v1',
      sourceSha256: SOURCE_SHA256,
      taskId: task.taskId,
      findingId: task.findingId,
      decision,
      reviewerAttestation: true,
      reviewedAt: new Date().toISOString(),
      ...extra,
    };
    const validation = validateInstituteSourceReviewReceipt(nextReceipt);
    if (!validation.valid) {
      setMessage(validation.reason);
      return;
    }
    persist([...receipts.filter((receipt) => receipt.taskId !== task.taskId), nextReceipt]);
    setMessage(`Decisione registrata per ${task.taskId}.`);
  };

  const handleCorrectedSource = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setHashing(true);
    setMessage(null);
    try {
      const sha256 = await sha256File(file);
      setCandidateSource({ fileName: file.name, sha256 });
      if (sha256 === SOURCE_SHA256) {
        setMessage('Hai selezionato la stessa versione già auditata: non può essere usata come fonte corretta.');
      } else {
        setMessage('Nuova versione identificata localmente. Verifica ogni correzione prima di registrarla.');
      }
    } catch {
      setCandidateSource(null);
      setMessage('Non riesco a calcolare SHA-256 del file selezionato nel browser.');
    } finally {
      setHashing(false);
    }
  };

  const handleExport = () => {
    const pack = createInstituteSourceReviewReceiptPack(receipts);
    downloadJson('arena-curricolo-istituto-source-review-receipts.json', pack);
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as InstituteSourceReviewReceiptPack;
      const validation = validateInstituteSourceReviewReceiptPack(parsed);
      if (!validation.valid) {
        setMessage(`Importazione bloccata: ${validation.reason}`);
        return;
      }
      const importedAssessment = assessInstituteSourceReview(parsed.receipts);
      if (importedAssessment.conflictingTaskIds.length > 0) {
        setMessage(`Importazione bloccata: ricevute in conflitto per ${importedAssessment.conflictingTaskIds.join(', ')}.`);
        return;
      }
      const merged = new Map<InstituteSourceReviewTaskId, InstituteSourceReviewReceipt>();
      receipts.forEach((receipt) => merged.set(receipt.taskId, receipt));
      parsed.receipts.forEach((receipt) => merged.set(receipt.taskId, receipt));
      persist([...merged.values()]);
      setMessage('Ricevute importate e ricollegate alla versione sorgente corrente.');
    } catch {
      setMessage('Importazione bloccata: il file non contiene un pacchetto JSON valido.');
    }
  };

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 sm:p-5" data-human-task="institute-source-remediation">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
            <div>
              <h2 className="text-base font-black text-slate-900">Controlli sul Curricolo verticale d’istituto</h2>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                L’audit cell-aware ha individuato 7 interventi da chiudere prima della revisione semantica. Registrare una decisione qui non modifica il DOCX e non attribuisce autorità normativa o istituzionale.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-white px-2.5 py-1 text-slate-700">Risolti {assessment.resolvedTaskCount}/7</span>
            <span className="rounded-full bg-white px-2.5 py-1 text-amber-800">Aperti {assessment.unresolvedTaskCount}</span>
            {assessment.conflictingTaskIds.length > 0 && <span className="rounded-full bg-rose-100 px-2.5 py-1 text-rose-800">Conflitti {assessment.conflictingTaskIds.length}</span>}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="min-h-11 rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-900"
        >
          {expanded ? 'Chiudi controlli' : 'Apri i 7 controlli'}
        </button>
      </div>

      {expanded && (
        <div className="mt-5 space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-900">Nuova versione corretta del documento</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Il file resta nel tuo dispositivo: Arena calcola soltanto SHA-256. Selezionarlo non risolve nulla; per ogni problema devi confermare separatamente di avere verificato la correzione.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-indigo-700 px-4 py-2 text-sm font-bold text-white">
                <FileUp className="h-4 w-4" aria-hidden="true" />
                {hashing ? 'Calcolo SHA-256…' : 'Seleziona DOCX corretto'}
                <input type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" disabled={hashing} onChange={handleCorrectedSource} />
              </label>
              {candidateSource && (
                <div className="min-w-0 text-xs text-slate-600">
                  <div className="truncate font-bold text-slate-800">{candidateSource.fileName}</div>
                  <div className="font-mono">sha256:{candidateSource.sha256.slice(0, 16)}…</div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {INSTITUTE_SOURCE_REVIEW_QUEUE.map((task) => {
              const existing = receiptForTask(receipts, task.taskId);
              const resolved = existing ? doesInstituteSourceReceiptResolveTask(existing) : false;
              const note = notesByTask[task.taskId] ?? '';
              const requiresCorrectedSource = task.resolutionPolicy === 'CORRECTED_SOURCE_VERSION_REQUIRED';
              return (
                <article key={task.taskId} className="rounded-xl border border-slate-200 bg-white p-4" data-source-review-task={task.taskId}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-black ${task.priority === 'P0' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>{task.priority}</span>
                        <span className="text-xs font-bold text-slate-500">{task.findingId}</span>
                        <span className="text-xs text-slate-500">pp. {task.pages.join(', ')}</span>
                      </div>
                      <h4 className="mt-2 font-black text-slate-900">{task.target}</h4>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{task.summary}</p>
                      <p className="mt-2 text-xs font-bold text-slate-700">{policyLabel(task)}</p>
                    </div>
                    {resolved ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-label="Controllo risolto" /> : <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" aria-label="Controllo aperto" />}
                  </div>

                  {existing && (
                    <div className={`mt-3 rounded-lg px-3 py-2 text-xs ${resolved ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>
                      Ultima decisione: <strong>{decisionLabel(existing.decision)}</strong> · {new Date(existing.reviewedAt).toLocaleString('it-IT')}
                    </div>
                  )}

                  {requiresCorrectedSource && (
                    <div className="mt-4 grid gap-3">
                      <textarea
                        value={note}
                        onChange={(event) => setNotesByTask((current) => ({ ...current, [task.taskId]: event.target.value }))}
                        placeholder="Nota sulla correzione verificata nella nuova versione"
                        className="min-h-20 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-800"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => replaceReceipt(task, 'ACKNOWLEDGED_REQUIRES_CORRECTED_SOURCE')}
                          className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700"
                        >
                          Segna preso in carico
                        </button>
                        <button
                          type="button"
                          disabled={!candidateSource || candidateSource.sha256 === SOURCE_SHA256 || note.trim().length === 0}
                          onClick={() => candidateSource && replaceReceipt(task, 'CORRECTED_SOURCE_VERSION_LINKED', {
                            replacementSourceSha256: candidateSource.sha256,
                            notes: note,
                          })}
                          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-700 px-3 py-2 text-sm font-bold text-white disabled:bg-slate-300"
                        >
                          <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                          Conferma correzione verificata
                        </button>
                      </div>
                    </div>
                  )}

                  {task.resolutionPolicy === 'HUMAN_SCOPE_DECISION_REQUIRED' && (
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                      <label className="flex-1 text-sm font-bold text-slate-700">
                        Ambito da usare nel mapping
                        <select value={scopeDecision} onChange={(event) => setScopeDecision(event.target.value as InstituteSourceReviewDecision)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal">
                          <option value="SCOPE_DEFERRED">Rinvia la decisione</option>
                          <option value="SCOPE_SECOND_YEAR_AND_LATER">Dal secondo anno e successivi</option>
                          <option value="SCOPE_CLASS_ONE">Classe prima</option>
                        </select>
                      </label>
                      <button type="button" onClick={() => replaceReceipt(task, scopeDecision)} className="min-h-11 rounded-xl bg-indigo-700 px-4 py-2 text-sm font-bold text-white">Registra decisione</button>
                    </div>
                  )}

                  {task.resolutionPolicy === 'HUMAN_IDENTITY_DECISION_REQUIRED' && (
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                      <label className="flex-1 text-sm font-bold text-slate-700">
                        Gestione dell’identità
                        <select value={identityDecision} onChange={(event) => setIdentityDecision(event.target.value as InstituteSourceReviewDecision)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal">
                          <option value="IDENTITY_KEEP_SOURCE_LABEL_PENDING_REPAIR">Mantieni distinto in attesa di correzione</option>
                          <option value="IDENTITY_NORMALIZE_CANONICAL_PRESERVE_SOURCE_LABEL">Normalizza al campo canonico e conserva l’etichetta sorgente</option>
                        </select>
                      </label>
                      <button type="button" onClick={() => replaceReceipt(task, identityDecision)} className="min-h-11 rounded-xl bg-indigo-700 px-4 py-2 text-sm font-bold text-white">Registra decisione</button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleExport} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800">
                <Download className="h-4 w-4" aria-hidden="true" /> Esporta ricevute
              </button>
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800">
                <Upload className="h-4 w-4" aria-hidden="true" /> Importa ricevute
                <input type="file" accept="application/json,.json" className="sr-only" onChange={handleImport} />
              </label>
              <button type="button" onClick={() => { persist([]); setMessage('Ricevute locali eliminate. I blocker tornano tutti aperti.'); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-bold text-rose-700">
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> Azzera ricevute
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Le ricevute sono legate a sha256:{SOURCE_SHA256.slice(0, 16)}… e restano locali al browser salvo esportazione esplicita.
            </p>
          </div>

          {message && <div role="status" className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">{message}</div>}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            <strong className="text-slate-900">Confine del controllo:</strong> anche con 7/7 task risolti, la revisione semantica resta separata e nessun contenuto diventa automaticamente adottato, istituzionale o nazionale.
          </div>
        </div>
      )}
    </section>
  );
}
