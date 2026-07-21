import { Check, Copy, X } from 'lucide-react';

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
  if (!showWikiReaderModal) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[180] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh] h-auto fade-in text-left">
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-xl"></span>
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">Lettore Documentale d'Istituto - Second Brain</h3>
          </div>
          <button onClick={() => setShowWikiReaderModal(false)} className="text-slate-400 hover:text-white transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-slate-50 border-b px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0 text-xs font-semibold">
          <div>
            <span className="text-slate-500 uppercase tracking-wider block text-[9px] font-black">Volume Attivo</span>
            <span className="text-slate-800 font-extrabold text-xs">{getVolumeTitleWithCustom(selectedBrainDoc)}</span>
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <button
              onClick={() => {
                navigator.clipboard.writeText(getVolumePlainTxtWithCustom(selectedBrainDoc));
                showToast('Testo del volume copiato negli appunti!', true);
              }}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition text-[10px] shadow-sm shadow-indigo-600/10 flex items-center space-x-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copia Testo Volume</span>
            </button>
            {selectedBrainDoc.startsWith('vol-custom-') && (
              <button onClick={() => handleDeleteCustomKbDoc(selectedBrainDoc)} className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition text-[10px] flex items-center space-x-1">
                <X className="w-3.5 h-3.5" />
                <span>Elimina Volume</span>
              </button>
            )}
            <button onClick={() => setShowWikiReaderModal(false)} className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition text-[10px] bg-white">Chiudi Lettore</button>
          </div>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-white text-slate-800 leading-relaxed max-w-none text-xs space-y-4">
          <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: getVolumeFullHtmlWithCustom(selectedBrainDoc) }} />
          <div className="h-6 shrink-0" />
        </div>
      </div>
    </div>
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
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[180] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] h-auto fade-in text-left font-medium text-xs text-slate-700">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-6 py-4 flex justify-between items-center shrink-0">
          <span className="flex items-center space-x-2 font-black uppercase tracking-wider text-xs">
            <span></span> <span>Aggiungi Documento a KB d'Istituto</span>
          </span>
          <button onClick={() => setShowAddKbModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="space-y-1.5 p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-xl"></span>
            <div>
              <strong className="text-[10px] text-slate-700 font-extrabold block">Caricamento rapido File d'Istituto</strong>
              <span className="text-[8px] text-slate-400 block font-semibold leading-relaxed">Seleziona un file di testo (.txt o .md) per estrarne il contenuto all'istante in modo offline.</span>
            </div>
            <input
              type="file"
              accept=".txt,.md"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  const text = event.target?.result as string;
                  const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
                  setNewKbDocTitle(cleanName);
                  setNewKbDocSubtitle('Documento caricato in locale');
                  setNewKbDocContent(text);
                  showToast(`File '${file.name}' caricato ed estratto con successo!`, true);
                };
                reader.readAsText(file);
              }}
              className="hidden"
              id="kb-file-upload-input"
            />
            <label
              htmlFor="kb-file-upload-input"
              className="px-3 py-1 bg-white hover:bg-slate-100 text-indigo-700 font-black border border-indigo-100 rounded-lg text-[9px] cursor-pointer transition shadow-sm"
            >
              Seleziona File (.txt / .md)
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-500">Titolo del Documento (es. Atto di indirizzo 2026)</label>
            <input
              type="text"
              value={newKbDocTitle}
              onChange={(e) => setNewKbDocTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="Es. Atto di indirizzo del Dirigente..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-500">Sottotitolo o Descrizione Breve</label>
            <input
              type="text"
              value={newKbDocSubtitle}
              onChange={(e) => setNewKbDocSubtitle(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="Es. Linee strategiche per l'allineamento del PTOF..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-500">Contenuto Esteso del Documento (Testo o Markdown)</label>
            <textarea
              value={newKbDocContent}
              onChange={(e) => setNewKbDocContent(e.target.value)}
              rows={8}
              className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none leading-relaxed"
              placeholder="Incolla o scrivi qui il testo completo del documento scolastico da aggiungere alla base di conoscenza d'Istituto..."
            />
          </div>

          <div className="h-6 shrink-0" />
        </div>

        <div className="bg-slate-50 px-6 py-3.5 border-t flex justify-end space-x-3 shrink-0">
          <button
            onClick={handleAddCustomKbDoc}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/10 flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Aggiungi a Second Brain</span>
          </button>
          <button
            onClick={() => setShowAddKbModal(false)}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}

