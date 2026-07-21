import { useState } from 'react';
import { getVolumeFullHtml, getVolumePlainTxt, getVolumeTitle } from '../../../data/volumesKB';
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../../../lib/consolidatedStorage';

export type CustomKbDoc = {
 id: string;
 title: string;
 subtitle: string;
 content: string;
};

type UseKnowledgeBaseHandlersArgs = {
 showToast: (msg: string, success?: boolean) => void;
};

export function useKnowledgeBaseHandlers({ showToast }: UseKnowledgeBaseHandlersArgs) {
 // Second Brain & WikiLLM States
 const [selectedBrainDoc, setSelectedBrainDoc] = useState<string>('vol1');
 const [customKbDocs, setCustomKbDocs] = useState<{ id: string; title: string; subtitle: string; content: string }[]>(() => {
  const saved = safeLocalStorageGetItem('curman_customKbDocs', '[]');
  try {
   return JSON.parse(saved);
  } catch(e) {
   return [];
  }
 });

 const [newKbDocTitle, setNewKbDocTitle] = useState('');
 const [newKbDocSubtitle, setNewKbDocSubtitle] = useState('');
 const [newKbDocContent, setNewKbDocContent] = useState('');
 const [showAddKbModal, setShowAddKbModal] = useState(false);
 const [isSpeaking, setIsSpeaking] = useState(false);

 const handleToggleSpeech = (text: string) => {
  if (isSpeaking) {
   window.speechSynthesis.cancel();
   setIsSpeaking(false);
   showToast("Lettura audio interrotta.", true);
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
   showToast("Lettura audio avviata! (Usa lo stesso bottone per interrompere)", true);
  }
 };

 const handleAddCustomKbDoc = () => {
  if (!newKbDocTitle.trim() || !newKbDocContent.trim()) {
   showToast("Inserisci almeno un titolo e il contenuto del documento!", false);
   return;
  }
  const newDoc = {
   id: `vol-custom-${Date.now()}`,
   title: newKbDocTitle.trim(),
   subtitle: newKbDocSubtitle.trim() || "Documento Personalizzato d'Istituto",
   content: newKbDocContent.trim()
  };
  const updated = [...customKbDocs, newDoc];
  setCustomKbDocs(updated);
  safeLocalStorageSetItem('curman_customKbDocs', JSON.stringify(updated));
  setNewKbDocTitle('');
  setNewKbDocSubtitle('');
  setNewKbDocContent('');
  setShowAddKbModal(false);
  showToast(`Documento '${newDoc.title}' aggiunto alla KB d'Istituto!`, true);
 };

 const handleDeleteCustomKbDoc = (id: string) => {
  const updated = customKbDocs.filter(d => d.id !== id);
  setCustomKbDocs(updated);
  safeLocalStorageSetItem('curman_customKbDocs', JSON.stringify(updated));
  if (selectedBrainDoc === id) {
   setSelectedBrainDoc('vol1');
  }
  showToast("Documento rimosso dalla KB d'Istituto.", true);
 };

 const getVolumeTitleWithCustom = (id: string) => {
  if (id.startsWith('vol-custom-')) {
   const doc = customKbDocs.find(d => d.id === id);
   return doc ? doc.title : "Documento Personalizzato";
  }
  return getVolumeTitle(id);
 };

 const getVolumeFullHtmlWithCustom = (id: string) => {
  if (id.startsWith('vol-custom-')) {
   const doc = customKbDocs.find(d => d.id === id);
   if (!doc) return "<p>Nessun contenuto disponibile.</p>";
   return `
    <div class="space-y-4">
     <h1 class="text-lg font-black text-indigo-950 uppercase border-b pb-2">${doc.title}</h1>
     <p class="text-xs font-bold text-slate-500">${doc.subtitle}</p>
     <div class="bg-amber-50/20 border border-amber-100 rounded-xl p-4 space-y-2">
      <strong class="text-xs text-amber-900 block font-black"> Documento Caricato d'Istituto:</strong>
      <p class="text-slate-700 leading-relaxed font-semibold">Questo faldone ÃƒÂ¨ stato caricato localmente per potenziare il Second Brain e indicizzarlo nel WikiLLM d'Istituto.</p>
     </div>
     <div class="text-slate-700 leading-relaxed text-xs whitespace-pre-wrap font-semibold">${doc.content}</div>
    </div>
   `;
  }
  return getVolumeFullHtml(id);
 };

 const getVolumePlainTxtWithCustom = (id: string) => {
  if (id.startsWith('vol-custom-')) {
   const doc = customKbDocs.find(d => d.id === id);
   return doc ? `${doc.title}\n${doc.subtitle}\n\n${doc.content}` : "Nessun contenuto disponibile.";
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
  getVolumePlainTxtWithCustom
 };
}