import { Check, Copy, FileText, X } from 'lucide-react';
import { useState } from 'react';
import { UiConfirmDialog } from '../../../ui/components/UiConfirmDialog';

interface WikiReaderModalProps {
  showWikiReaderModal: boolean;
  setShowWikiReaderModal: (value: boolean) => void;
  selectedBrainDoc: string;
  getVolumeTitleWithCustom: (id: string) => string;
  getVolumePlainTxtWithCustom: (id: string) => string;
  getVolumeFullHtmlWithCustom: (id: string) => string;
  handleDeleteCustomKbDoc: (id: string) => void;
  showToast: (message: string, success?: boolean) => void;
}

export function WikiReaderModal({
  showWikiReaderModal,
  setShowWikiReaderModal,
  selectedBrainDoc,
  getVolumeTitleWithCustom,
  getVolumePlainTxtWithCustom,
  getVolumeFullHtmlWithCustom,
  handleDeleteCustomKbDoc,
  showToast,
}: WikiReaderModalProps) {
  const [docToDelete, setDocToDelete] = useState<string | null>(null);
  if (!showWikiReaderModal) return null;

  return (
    <>
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-[180] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-2xl fade-in">
          <div className="flex shrink-0 items-center justify-between bg-slate-900 px-5 py-4 text-white">
            <div>
              <h3 className="text-base font-black text-slate-100">Leggi la fonte</h3>
              <p className="mt-1 text-xs text-slate-300">Controlla il contenuto prima di usarlo in una decisione.</p>
            </div>
            <button onClick={() => setShowWikiReaderModal(false)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Chiudi"><X className="h-5 w-5" /></button>
          </div>

          <div className="flex shrink-0 flex-col gap-3 border-b bg-slate-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="block text-xs font-bold text-slate-500">Fonte selezionata</span>
              <span className="text-sm font-extrabold text-slate-800">{getVolumeTitleWithCustom(selectedBrainDoc)}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getVolumePlainTxtWithCustom(selectedBrainDoc));
                  showToast('Testo copiato negli appunti.', true);
                }}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-500"
              >
                <Copy className="h-4 w-4" />
                Copia testo
              </button>
              {selectedBrainDoc.startsWith('vol-custom-') && (
                <button onClick={() => setDocToDelete(selectedBrainDoc)} className="min-h-10 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50">
                  Elimina fonte
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white p-5 text-sm leading-7 text-slate-800 md:p-7">
            <div className="prose prose-slate max-w-3xl" dangerouslySetInnerHTML={{ __html: getVolumeFullHtmlWithCustom(selectedBrainDoc) }} />
            <div className="h-8" />
          </div>
        </div>
      </div>
      <UiConfirmDialog
        open={docToDelete !== null}
        title="Elimina fonte"
        message="Vuoi eliminare questa fonte locale? L’operazione non può essere annullata."
        confirmLabel="Elimina"
        variant="danger"
        onConfirm={() => { if (docToDelete) handleDeleteCustomKbDoc(docToDelete); setDocToDelete(null); }}
        onCancel={() => setDocToDelete(null)}
      />
    </>
  );
}

interface AddKbDocumentModalProps {
  showAddKbModal: boolean;
  setShowAddKbModal: (value: boolean) => void;
  newKbDocTitle: string;
  setNewKbDocTitle: (value: string) => void;
  newKbDocSubtitle: string;
  setNewKbDocSubtitle: (value: string) => void;
  newKbDocContent: string;
  setNewKbDocContent: (value: string) => void;
  handleAddCustomKbDoc: () => void;
  showToast: (message: string, success?: boolean) => void;
}

export function AddKbDocumentModal({
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
}: AddKbDocumentModalProps) {
  if (!showAddKbModal) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[180] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-2xl fade-in">
        <div className="flex shrink-0 items-start justify-between bg-slate-900 px-5 py-4 text-white">
          <div className="max-w-md">
            <h3 className="text-base font-black">Aggiungi una fonte</h3>
            <p className="mt-1 text-xs leading-5 text-slate-300">Aggiungi un materiale alla conoscenza locale. Resterà separato dalle fonti istituzionali finché non viene verificato.</p>
          </div>
          <button onClick={() => setShowAddKbModal(false)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Chiudi"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-5 overflow-y-auto p-5">
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-labelledby="kb-import-title">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
              <div className="min-w-0">
                <h4 id="kb-import-title" className="font-black text-slate-900">Hai già un file di testo?</h4>
                <p className="mt-1 text-sm leading-6 text-slate-600">Puoi importare file .txt, .md, .csv o .json. Per PDF e Word, per ora copia e incolla il testo nel campo più sotto.</p>
                <input
                  type="file"
                  accept=".txt,.md,.csv,.json,text/plain,text/markdown,text/csv,application/json"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (loadEvent) => {
                      const text = loadEvent.target?.result as string;
                      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
                      setNewKbDocTitle(cleanName);
                      setNewKbDocSubtitle('Materiale aggiunto localmente');
                      setNewKbDocContent(text);
                      showToast(`Materiale “${file.name}” pronto da aggiungere.`, true);
                    };
                    reader.readAsText(file);
                  }}
                  className="hidden"
                  id="kb-file-upload-input"
                />
                <label htmlFor="kb-file-upload-input" className="mt-3 inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50">
                  Scegli un file
                </label>
              </div>
            </div>
          </section>

          <section className="space-y-4" aria-labelledby="kb-describe-title">
            <div>
              <h4 id="kb-describe-title" className="font-black text-slate-900">Descrivi la fonte</h4>
              <p className="mt-1 text-sm leading-6 text-slate-600">Bastano un titolo chiaro e il contenuto. La descrizione è facoltativa.</p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-800">Titolo</span>
              <input
                type="text"
                value={newKbDocTitle}
                onChange={(event) => setNewKbDocTitle(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-indigo-500"
                placeholder="Per esempio: Atto di indirizzo 2026"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-800">Descrizione <span className="font-normal text-slate-500">(facoltativa)</span></span>
              <input
                type="text"
                value={newKbDocSubtitle}
                onChange={(event) => setNewKbDocSubtitle(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-indigo-500"
                placeholder="Per esempio: indicazioni per il PTOF"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-800">Testo della fonte</span>
              <textarea
                value={newKbDocContent}
                onChange={(event) => setNewKbDocContent(event.target.value)}
                rows={8}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm leading-6 outline-none focus:border-indigo-500"
                placeholder="Incolla qui il testo di un documento oppure importa un file dal riquadro sopra."
              />
            </label>
          </section>

          <details className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <summary className="cursor-pointer font-bold text-slate-800">Che cosa succede dopo?</summary>
            <p className="mt-2 leading-6">La fonte viene salvata localmente nella base di conoscenza del browser. Non diventa automaticamente una fonte istituzionale e non modifica il curricolo approvato.</p>
          </details>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
          <button onClick={() => setShowAddKbModal(false)} className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100">Annulla</button>
          <button onClick={handleAddCustomKbDoc} disabled={!newKbDocTitle.trim() || !newKbDocContent.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300">
            <Check className="h-4 w-4" />
            Aggiungi alla conoscenza
          </button>
        </div>
      </div>
    </div>
  );
}
