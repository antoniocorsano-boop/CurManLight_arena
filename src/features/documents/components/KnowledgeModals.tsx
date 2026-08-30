import { Copy, X } from 'lucide-react';
import { useState } from 'react';
import { UiConfirmDialog } from '../../../ui/components/UiConfirmDialog';

export { AddKnowledgeSourceModal as AddKbDocumentModal } from './AddKnowledgeSourceModal';

interface WikiReaderModalProps {
  showWikiReaderModal: boolean;
  setShowWikiReaderModal: (value: boolean) => void;
  selectedBrainDoc: string;
  getVolumeTitleWithCustom: (id: string) => string;
  getVolumePlainTxtWithCustom: (id: string) => string;
  getVolumeFullHtmlWithCustom: (id: string) => string;
  handleDeleteCustomKbDoc: (id: string) => void | Promise<void>;
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
        onConfirm={() => {
          if (docToDelete) void handleDeleteCustomKbDoc(docToDelete);
          setDocToDelete(null);
        }}
        onCancel={() => setDocToDelete(null)}
      />
    </>
  );
}
