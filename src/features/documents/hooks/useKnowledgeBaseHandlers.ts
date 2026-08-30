import { useEffect, useState } from 'react';
import { getVolumeFullHtml, getVolumePlainTxt, getVolumeTitle } from '../../../data/volumesKB';
import { safeLocalStorageGetItem, safeLocalStorageRemoveItem } from '../../../lib/consolidatedStorage';
import {
 deleteLocalKnowledgeSource,
 listLocalKnowledgeSources,
 putLocalKnowledgeSource,
 putLocalKnowledgeSources,
 type CustomKbDoc,
 type KnowledgeImportMetadata,
} from '../lib/localKnowledgeStore';

export type { CustomKbDoc, KnowledgeImportMetadata } from '../lib/localKnowledgeStore';

type UseKnowledgeBaseHandlersArgs = {
 showToast: (msg: string, success?: boolean) => void;
};

const escapeHtml = (value: string): string => value
 .replace(/&/g, '&amp;')
 .replace(/</g, '&lt;')
 .replace(/>/g, '&gt;')
 .replace(/"/g, '&quot;')
 .replace(/'/g, '&#039;');

const isKnowledgeImportMetadata = (value: unknown): value is KnowledgeImportMetadata => {
 if (!value || typeof value !== 'object') return false;
 const candidate = value as Partial<KnowledgeImportMetadata>;
 return typeof candidate.ingestionMethod === 'string' && typeof candidate.extractionStatus === 'string';
};

function readLegacyCustomDocs(): CustomKbDoc[] {
 const saved = safeLocalStorageGetItem('curman_customKbDocs', '[]');
 try {
  const parsed = JSON.parse(saved) as Array<Partial<CustomKbDoc>>;
  if (!Array.isArray(parsed)) return [];
  return parsed
   .filter((doc) => typeof doc.id === 'string' && typeof doc.title === 'string' && typeof doc.content === 'string')
   .map((doc) => ({
    id: doc.id as string,
    title: doc.title as string,
    subtitle: typeof doc.subtitle === 'string' ? doc.subtitle : 'Documento locale non verificato',
    content: doc.content as string,
    importedAt: typeof doc.importedAt === 'string' ? doc.importedAt : new Date().toISOString(),
    authorityStatus: 'LOCAL_UNVERIFIED',
    ingestionMethod: doc.ingestionMethod ?? 'LEGACY_LOCAL_STORAGE',
    extractionStatus: doc.extractionStatus ?? 'NOT_REQUIRED',
    originalFileName: doc.originalFileName,
    mediaType: doc.mediaType,
    byteSize: doc.byteSize,
    sha256: doc.sha256,
    pageCount: doc.pageCount,
    textEditedAfterExtraction: doc.textEditedAfterExtraction,
   }));
 } catch {
  return [];
 }
}

export function useKnowledgeBaseHandlers({ showToast }: UseKnowledgeBaseHandlersArgs) {
 const [selectedBrainDoc, setSelectedBrainDoc] = useState<string>('vol1');
 const [customKbDocs, setCustomKbDocs] = useState<CustomKbDoc[]>(() => readLegacyCustomDocs());
 const [newKbDocTitle, setNewKbDocTitle] = useState('');
 const [newKbDocSubtitle, setNewKbDocSubtitle] = useState('');
 const [newKbDocContent, setNewKbDocContent] = useState('');
 const [showAddKbModal, setShowAddKbModal] = useState(false);
 const [isSpeaking, setIsSpeaking] = useState(false);

 useEffect(() => {
  let cancelled = false;
  const hydrate = async () => {
   const legacyDocs = readLegacyCustomDocs();
   try {
    const indexedDocs = await listLocalKnowledgeSources();
    const merged = new Map(indexedDocs.map((doc) => [doc.id, doc]));
    const missingLegacy = legacyDocs.filter((doc) => !merged.has(doc.id));
    if (missingLegacy.length > 0) {
     await putLocalKnowledgeSources(missingLegacy);
     missingLegacy.forEach((doc) => merged.set(doc.id, doc));
    }
    safeLocalStorageRemoveItem('curman_customKbDocs');
    if (!cancelled) {
     setCustomKbDocs(Array.from(merged.values()).sort((a, b) => b.importedAt.localeCompare(a.importedAt)));
    }
   } catch (error) {
    console.warn('[KX-3] IndexedDB local knowledge hydration failed:', error);
    if (!cancelled && legacyDocs.length === 0) {
     showToast('La conoscenza locale non è disponibile in questo browser. Nessun documento verrà dichiarato salvato.', false);
    }
   }
  };
  void hydrate();
  return () => { cancelled = true; };
 }, [showToast]);

 const handleToggleSpeech = (text: string) => {
  if (isSpeaking) {
   window.speechSynthesis.cancel();
   setIsSpeaking(false);
   showToast('Lettura audio interrotta.', true);
  } else {
   window.speechSynthesis.cancel();
   const cleanText = text.slice(0, 2500);
   const utterance = new SpeechSynthesisUtterance(cleanText);
   utterance.lang = 'it-IT';
   utterance.rate = 1.05;
   utterance.onend = () => setIsSpeaking(false);
   utterance.onerror = () => setIsSpeaking(false);
   window.speechSynthesis.speak(utterance);
   setIsSpeaking(true);
   showToast('Lettura audio avviata! (Usa lo stesso bottone per interrompere)', true);
  }
 };

 const handleAddCustomKbDoc = async (input?: unknown): Promise<boolean> => {
  const metadata = isKnowledgeImportMetadata(input) ? input : undefined;
  if (!newKbDocTitle.trim() || !newKbDocContent.trim()) {
   showToast('Inserisci almeno un titolo e il contenuto del documento!', false);
   return false;
  }
  const newDoc: CustomKbDoc = {
   id: `vol-custom-${Date.now()}`,
   title: newKbDocTitle.trim(),
   subtitle: newKbDocSubtitle.trim() || 'Documento locale non verificato',
   content: newKbDocContent.trim(),
   importedAt: new Date().toISOString(),
   authorityStatus: 'LOCAL_UNVERIFIED',
   ingestionMethod: metadata?.ingestionMethod ?? 'PASTE',
   extractionStatus: metadata?.extractionStatus ?? 'NOT_REQUIRED',
   originalFileName: metadata?.originalFileName,
   mediaType: metadata?.mediaType,
   byteSize: metadata?.byteSize,
   sha256: metadata?.sha256,
   pageCount: metadata?.pageCount,
   textEditedAfterExtraction: metadata?.textEditedAfterExtraction,
  };

  try {
   await putLocalKnowledgeSource(newDoc);
  } catch (error) {
   console.warn('[KX-3] IndexedDB local knowledge write failed:', error);
   showToast('Non riesco a salvare questa fonte nel browser. Il documento non è stato aggiunto.', false);
   return false;
  }

  setCustomKbDocs((current) => [newDoc, ...current.filter((doc) => doc.id !== newDoc.id)]);
  setNewKbDocTitle('');
  setNewKbDocSubtitle('');
  setNewKbDocContent('');
  setShowAddKbModal(false);
  showToast(`Fonte “${newDoc.title}” aggiunta alla conoscenza locale non verificata.`, true);
  return true;
 };

 const handleDeleteCustomKbDoc = async (id: string): Promise<void> => {
  try {
   await deleteLocalKnowledgeSource(id);
  } catch (error) {
   console.warn('[KX-3] IndexedDB local knowledge delete failed:', error);
   showToast('Non riesco a eliminare questa fonte dal browser.', false);
   return;
  }
  setCustomKbDocs((current) => current.filter((doc) => doc.id !== id));
  if (selectedBrainDoc === id) setSelectedBrainDoc('vol1');
  showToast('Fonte rimossa dalla conoscenza locale.', true);
 };

 const getVolumeTitleWithCustom = (id: string) => {
  if (id.startsWith('vol-custom-')) {
   const doc = customKbDocs.find((item) => item.id === id);
   return doc ? doc.title : 'Documento Personalizzato';
  }
  return getVolumeTitle(id);
 };

 const getVolumeFullHtmlWithCustom = (id: string) => {
  if (id.startsWith('vol-custom-')) {
   const doc = customKbDocs.find((item) => item.id === id);
   if (!doc) return '<p>Nessun contenuto disponibile.</p>';
   const safeTitle = escapeHtml(doc.title);
   const safeSubtitle = escapeHtml(doc.subtitle);
   const safeContent = escapeHtml(doc.content);
   const safeOriginalFileName = doc.originalFileName ? escapeHtml(doc.originalFileName) : '';
   const sourceIdentity = safeOriginalFileName
    ? `<p class="text-xs text-slate-500"><strong>File:</strong> ${safeOriginalFileName}${doc.pageCount ? ` · ${doc.pageCount} pagine` : ''}</p>`
    : '';
   return `
    <div class="space-y-4">
     <h1 class="text-lg font-black text-indigo-950 uppercase border-b pb-2">${safeTitle}</h1>
     <p class="text-xs font-bold text-slate-500">${safeSubtitle}</p>
     ${sourceIdentity}
     <div class="bg-amber-50/20 border border-amber-100 rounded-xl p-4 space-y-2">
       <strong class="text-xs text-amber-900 block font-black">Fonte locale non verificata</strong>
       <p class="text-slate-700 leading-relaxed font-semibold">Il materiale resta separato dalle fonti istituzionali e richiede controllo prima dell'uso.</p>
     </div>
     <div class="text-slate-700 leading-relaxed text-xs whitespace-pre-wrap font-semibold">${safeContent}</div>
    </div>
   `;
  }
  return getVolumeFullHtml(id);
 };

 const getVolumePlainTxtWithCustom = (id: string) => {
  if (id.startsWith('vol-custom-')) {
   const doc = customKbDocs.find((item) => item.id === id);
   if (!doc) return 'Nessun contenuto disponibile.';
   const provenance = doc.originalFileName ? `File originale: ${doc.originalFileName}\n` : '';
   return `${doc.title}\n${doc.subtitle}\n${provenance}\n${doc.content}`;
  }
  return getVolumePlainTxt(id);
 };

 return {
  selectedBrainDoc,
  setSelectedBrainDoc,
  customKbDocs,
  setCustomKbDocs,
  newKbDocTitle,
  setNewKbDocTitle,
  newKbDocSubtitle,
  setNewKbDocSubtitle,
  newKbDocContent,
  setNewKbDocContent,
  showAddKbModal,
  setShowAddKbModal,
  isSpeaking,
  setIsSpeaking,
  handleToggleSpeech,
  handleAddCustomKbDoc,
  handleDeleteCustomKbDoc,
  getVolumeTitleWithCustom,
  getVolumeFullHtmlWithCustom,
  getVolumePlainTxtWithCustom,
 };
}
