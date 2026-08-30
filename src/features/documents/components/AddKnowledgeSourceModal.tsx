import { Check, FileText, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { extractLocalKnowledgeFile, MAX_LOCAL_KNOWLEDGE_FILE_BYTES } from '../lib/extractLocalKnowledgeFile';
import type { KnowledgeImportMetadata } from '../lib/localKnowledgeStore';

export interface AddKnowledgeSourceModalProps {
  showAddKbModal: boolean;
  setShowAddKbModal: (value: boolean) => void;
  newKbDocTitle: string;
  setNewKbDocTitle: (value: string) => void;
  newKbDocSubtitle: string;
  setNewKbDocSubtitle: (value: string) => void;
  newKbDocContent: string;
  setNewKbDocContent: (value: string) => void;
  handleAddCustomKbDoc: (metadata?: KnowledgeImportMetadata) => Promise<boolean> | boolean;
  showToast: (message: string, success?: boolean) => void;
}

type ImportState = 'IDLE' | 'READING' | 'READY' | 'PARTIAL' | 'OCR_REQUIRED' | 'ERROR';

const humanFileSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const cleanFileTitle = (name: string) => name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();

export function AddKnowledgeSourceModal({
  showAddKbModal,
  setShowAddKbModal,
  newKbDocTitle,
  setNewKbDocTitle,
  newKbDocSubtitle,
  setNewKbDocSubtitle,
  newKbDocContent,
  setNewKbDocContent,
  handleAddCustomKbDoc,
  showToast,
}: AddKnowledgeSourceModalProps) {
  const [importState, setImportState] = useState<ImportState>('IDLE');
  const [importMessage, setImportMessage] = useState('');
  const [pendingMetadata, setPendingMetadata] = useState<KnowledgeImportMetadata | null>(null);
  const [textEditedAfterImport, setTextEditedAfterImport] = useState(false);

  useEffect(() => {
    if (!showAddKbModal) {
      setImportState('IDLE');
      setImportMessage('');
      setPendingMetadata(null);
      setTextEditedAfterImport(false);
    }
  }, [showAddKbModal]);

  if (!showAddKbModal) return null;

  const close = () => {
    setShowAddKbModal(false);
  };

  const handleFileSelection = async (file: File | undefined) => {
    if (!file) return;
    setImportState('READING');
    setImportMessage('Lettura del file in corso…');
    setPendingMetadata(null);
    setTextEditedAfterImport(false);

    try {
      const result = await extractLocalKnowledgeFile(file);
      setNewKbDocTitle(cleanFileTitle(file.name));
      setNewKbDocSubtitle('Materiale aggiunto localmente · da verificare');
      setPendingMetadata(result.metadata);

      if (result.metadata.extractionStatus === 'OCR_REQUIRED') {
        setNewKbDocContent('');
        setImportState('OCR_REQUIRED');
        setImportMessage(result.warning || 'Questo PDF non contiene testo estraibile.');
        showToast('Il PDF sembra una scansione: serve OCR prima di poterlo aggiungere.', false);
        return;
      }

      setNewKbDocContent(result.content);
      if (result.metadata.extractionStatus === 'PARTIAL') {
        setImportState('PARTIAL');
        setImportMessage(result.warning || 'Il testo è stato estratto solo in parte. Controllalo prima di continuare.');
        showToast('PDF letto solo in parte: controlla il testo estratto.', false);
      } else {
        setImportState('READY');
        setImportMessage(file.name.toLocaleLowerCase('it').endsWith('.pdf') ? 'PDF letto localmente. Controlla il testo prima di aggiungerlo.' : 'File letto localmente. Controlla il testo prima di aggiungerlo.');
        showToast(`Materiale “${file.name}” pronto da verificare.`, true);
      }
    } catch (error) {
      console.warn('[KX-3] File ingestion failed:', error);
      setNewKbDocContent('');
      setPendingMetadata(null);
      setImportState('ERROR');
      setImportMessage(error instanceof Error ? error.message : 'Non riesco a leggere questo file.');
      showToast(error instanceof Error ? error.message : 'Non riesco a leggere questo file.', false);
    }
  };

  const save = async () => {
    const metadata: KnowledgeImportMetadata = pendingMetadata
      ? { ...pendingMetadata, textEditedAfterExtraction: textEditedAfterImport }
      : { ingestionMethod: 'PASTE', extractionStatus: 'NOT_REQUIRED' };
    const saved = await handleAddCustomKbDoc(metadata);
    if (saved) {
      setImportState('IDLE');
      setImportMessage('');
      setPendingMetadata(null);
      setTextEditedAfterImport(false);
    }
  };

  const blockedByExtraction = importState === 'READING' || importState === 'OCR_REQUIRED' || importState === 'ERROR';

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[180] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-2xl fade-in">
        <div className="flex shrink-0 items-start justify-between bg-slate-900 px-5 py-4 text-white">
          <div className="max-w-md">
            <h3 className="text-base font-black">Aggiungi una fonte</h3>
            <p className="mt-1 text-xs leading-5 text-slate-300">Aggiungi un materiale alla conoscenza locale. Resterà separato dalle fonti istituzionali finché non viene verificato.</p>
          </div>
          <button onClick={close} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Chiudi"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-5 overflow-y-auto p-5">
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-labelledby="kb-import-title">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <h4 id="kb-import-title" className="font-black text-slate-900">Scegli un documento</h4>
                <p className="mt-1 text-sm leading-6 text-slate-600">PDF testuali, TXT, MD, CSV o JSON fino a {Math.round(MAX_LOCAL_KNOWLEDGE_FILE_BYTES / (1024 * 1024))} MB. Se un PDF è una scansione, Arena lo segnala e non finge di averne letto il testo.</p>
                <input
                  type="file"
                  accept=".pdf,.txt,.md,.csv,.json,application/pdf,text/plain,text/markdown,text/csv,application/json"
                  onChange={(event) => { void handleFileSelection(event.target.files?.[0]); event.currentTarget.value = ''; }}
                  className="hidden"
                  id="kb-file-upload-input"
                />
                <label htmlFor="kb-file-upload-input" className="mt-3 inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50">
                  Scegli un file
                </label>

                {importState !== 'IDLE' && (
                  <div className={`mt-3 rounded-lg border p-3 text-sm leading-5 ${importState === 'READY' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : importState === 'READING' ? 'border-slate-200 bg-white text-slate-700' : 'border-amber-200 bg-amber-50 text-amber-950'}`} aria-live="polite">
                    <div className="font-bold">{importState === 'READING' ? 'Analisi del file' : importState === 'READY' ? 'File pronto da verificare' : importState === 'PARTIAL' ? 'Estrazione parziale' : importState === 'OCR_REQUIRED' ? 'Testo non leggibile automaticamente' : 'Importazione non riuscita'}</div>
                    <p className="mt-1">{importMessage}</p>
                    {pendingMetadata?.originalFileName && (
                      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                        <dt className="font-bold">File</dt><dd className="break-all">{pendingMetadata.originalFileName}</dd>
                        <dt className="font-bold">Dimensione</dt><dd>{humanFileSize(pendingMetadata.byteSize)}</dd>
                        {pendingMetadata.pageCount ? <><dt className="font-bold">Pagine</dt><dd>{pendingMetadata.pageCount}</dd></> : null}
                        <dt className="font-bold">Stato</dt><dd>Locale · non verificata</dd>
                      </dl>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4" aria-labelledby="kb-describe-title">
            <div>
              <h4 id="kb-describe-title" className="font-black text-slate-900">Controlla la fonte</h4>
              <p className="mt-1 text-sm leading-6 text-slate-600">Puoi correggere titolo, descrizione o testo prima di salvarli. Arena conserva l’impronta del file originale quando il materiale arriva da un file.</p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-800">Titolo</span>
              <input type="text" value={newKbDocTitle} onChange={(event) => setNewKbDocTitle(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-indigo-500" placeholder="Per esempio: Atto di indirizzo 2026" />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-800">Descrizione <span className="font-normal text-slate-500">(facoltativa)</span></span>
              <input type="text" value={newKbDocSubtitle} onChange={(event) => setNewKbDocSubtitle(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-indigo-500" placeholder="Per esempio: indicazioni per il PTOF" />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-800">Testo della fonte</span>
              <textarea
                value={newKbDocContent}
                onChange={(event) => { setNewKbDocContent(event.target.value); if (pendingMetadata) setTextEditedAfterImport(true); }}
                rows={8}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm leading-6 outline-none focus:border-indigo-500"
                placeholder="Il testo estratto dal documento comparirà qui. Puoi anche incollare direttamente un testo."
              />
            </label>
            {pendingMetadata && textEditedAfterImport && <p className="text-xs leading-5 text-slate-500">Hai modificato il testo dopo l’estrazione. Arena conserverà questa informazione insieme alla provenienza del file.</p>}
          </section>

          <details className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <summary className="cursor-pointer font-bold text-slate-800">Che cosa succede dopo?</summary>
            <p className="mt-2 leading-6">La fonte viene salvata localmente nel browser con la sua provenienza. Non diventa automaticamente una fonte istituzionale, non modifica il curricolo approvato e il file originale non viene inviato a un server.</p>
          </details>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
          <button onClick={close} className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100">Annulla</button>
          <button onClick={() => { void save(); }} disabled={blockedByExtraction || !newKbDocTitle.trim() || !newKbDocContent.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300">
            <Check className="h-4 w-4" />
            Aggiungi alla conoscenza
          </button>
        </div>
      </div>
    </div>
  );
}
