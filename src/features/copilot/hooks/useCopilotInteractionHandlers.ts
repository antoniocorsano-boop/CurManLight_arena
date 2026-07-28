import { useState } from 'react';
import type { SchoolOrder } from '../../../types/curriculum';
import type { ClassroomFeedback } from '../../session';
import { containsInclusiveSensitiveTerms } from '../../../lib/gdprFilter';
import { safeLocalStorageSetItem } from '../../../lib/consolidatedStorage';

type CopilotMessage = { sender: 'user' | 'assistant'; text: string; isError?: boolean };
type NavigatorWithDeviceMemory = Navigator & {
 deviceMemory?: number;
};

type SpeechRecognitionEventLike = Event & {
 results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionErrorEventLike = Event & {
 error?: string;
};

type SpeechRecognitionLike = {
 lang: string;
 interimResults: boolean;
 maxAlternatives: number;
 onstart: (() => void) | null;
 onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
 onend: (() => void) | null;
 onresult: ((event: SpeechRecognitionEventLike) => void) | null;
 start: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type WindowWithSpeechRecognition = Window & {
 SpeechRecognition?: SpeechRecognitionConstructor;
 webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

type UseCopilotInteractionHandlersArgs = {
 activeTab: string;
 activeProgTab: string;
 detectedDeviceType: 'desktop' | 'mobile';
 discipline: string;
 order: SchoolOrder;
 getDisciplineLabel: (disc: string, ord?: SchoolOrder) => string;
 setProgTitle: (value: string) => void;
 setRealTaskInput: (value: string) => void;
 setProgNotes: (value: string) => void;
 selectedStudentForFeedback: ClassroomFeedback | null;
 classroomStudentFeedback: ClassroomFeedback[];
 setClassroomStudentFeedback: (value: ClassroomFeedback[]) => void;
 setSelectedStudentForFeedback: (value: ClassroomFeedback | null) => void;
 showToast: (msg: string, success?: boolean) => void;
};

export function useCopilotInteractionHandlers({
 activeTab,
 activeProgTab,
 detectedDeviceType,
 discipline,
 order,
 getDisciplineLabel,
 setProgTitle,
 setRealTaskInput,
 setProgNotes,
 selectedStudentForFeedback,
 classroomStudentFeedback,
 setClassroomStudentFeedback,
 setSelectedStudentForFeedback,
 showToast
}: UseCopilotInteractionHandlersArgs) {
  const [copilotChatInput, setCopilotChatInput] = useState("");
  const [copilotChatHistory, setCopilotChatHistory] = useState<CopilotMessage[]>([
    { sender: 'assistant', text: "Benvenuto nello spazio di assistenza locale. I suggerimenti sono generici e non verificati: valuta sempre il contesto e le fonti disponibili." }
  ]);
  const [isCopilotResponding, setIsCopilotResponding] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [showMicPermissionGuide, setShowMicPermissionGuide] = useState(false);
  const [ttsPlayingState, setTtsPlayingState] = useState<'playing' | 'paused' | 'idle'>('idle');
  const [ttsActiveMsgIndex, setTtsActiveMsgIndex] = useState<number | null>(null);
  const [gemFieldActive, setGemFieldActive] = useState<string | null>(null);
  const [gemSuggestedText, setGemSuggestedText] = useState<string>("");
  const [isGemGenerating, setIsGemGenerating] = useState<boolean>(false);
 const handleSendCopilotMessage = (customText?: string) => {
  const query = (customText || copilotChatInput).trim();
  if (!query) return;

  // GDPR check
  if (containsInclusiveSensitiveTerms(query)) {
   setCopilotChatHistory(prev => [
     ...prev,
     { sender: 'user', text: query },
      { sender: 'assistant', text: "Avvertenza sui dati: non inserire riferimenti clinici, sigle sanitarie o altri dati personali nella chat. Formula il quesito in chiave puramente metodologica.", isError: true }
   ]);
   setCopilotChatInput("");
   return;
  }

  // Clear input
  if (!customText) setCopilotChatInput("");

  // Append user message
  setCopilotChatHistory(prev => [...prev, { sender: 'user', text: query }]);
  setIsCopilotResponding(true);

  setTimeout(() => {
   let responseText = "";
   const q = query.toLowerCase();

   // Contextual responses based on the query and active tab
   if (activeTab === 'dashboard') {
     if (q.includes("priorit") || q.includes("pdm") || q.includes("obiettivo")) {
        responseText = "Suggerimento locale non verificato: definisci le priorità a partire dal piano o dai dati che hai effettivamente a disposizione. Senza una fonte esplicita non posso inferire obiettivi, percentuali o requisiti della scuola.";
     } else {
        responseText = "Puoi consultare le fonti caricate e le viste locali disponibili. Questo è uno spunto non verificato e non implica che dati o contenuti siano protetti o approvati.";
     }
   } else if (activeTab === 'curricolo' || activeTab === 'revisione') {
     if (q.includes("diacronia") || q.includes("verticale") || q.includes("raccordo")) {
        responseText = "Spunto metodologico non verificato: confronta i nuclei disponibili nei diversi ordini e descrivi esplicitamente i passaggi di continuità. La vista corrente non certifica l'allineamento locale.";
     } else if (q.includes("scadenz") || q.includes("linee guida") || q.includes("221")) {
        responseText = "Suggerimento non verificato: consulta il testo normativo e la configurazione locale prima di definire scadenze o applicabilità. La vista corrente non permette di inferire date di avvio o classi coinvolte.";
     } else {
        responseText = "Puoi esaminare i traguardi visibili per la disciplina selezionata e registrare scelte locali di lavoro. Lo spunto non verifica completezza, autorità o adozione del curricolo.";
     }
   } else if (activeTab === 'progetta-annuale') {
     if (q.includes("compito") || q.includes("realt") || q.includes("prodotto")) {
       responseText = "Per la materia attiva, il Co-pilota suggerisce un compito di realtÃƒÂ  cooperativo che si concluda con un prodotto concreto (es. un opuscolo digitale, un plastico o un breve video esplicativo). Questo stimola lo sviluppo di competenze reali e l'interconnessione con l'Educazione Civica.";
     } else if (q.includes("inclusione") || q.includes("compensativ") || q.includes("strument")) {
        responseText = "Spunto metodologico non verificato: valuta font leggibili, mappe, sintesi vocale e tempi adeguati solo in base alle esigenze osservate e alle indicazioni effettivamente disponibili.";
     } else {
        responseText = "Confronta i traguardi selezionati con evidenze osservabili. È un suggerimento locale non verificato, basato soltanto sui campi correnti.";
     }
   } else if (activeProgTab === 'classe' || activeProgTab === 'classe-home') {
     if (q.includes("jigsaw") || q.includes("cooperativ")) {
        responseText = "Spunto locale non verificato: il Jigsaw può articolarsi in gruppi base, gruppi di esperti e restituzione reciproca. Adattalo alla classe senza considerarlo un protocollo obbligatorio.";
     } else if (q.includes("banchi") || q.includes("disposiz") || q.includes("isole")) {
        responseText = "Possibile spunto locale: valuta isole, cerchio o disposizione frontale in base all'attività, agli spazi e alle necessità osservate. La scelta non è verificata dal sistema.";
     } else {
        responseText = "La vista permette di provare disposizioni e pseudonimi locali. Il sistema non verifica che una configurazione favorisca specifici risultati didattici.";
     }
   } else {
      responseText = "Sono disponibile per spunti generici e non verificati basati sulla vista corrente e sugli input espliciti.";
   }

   setCopilotChatHistory(prev => [...prev, { sender: 'assistant', text: responseText }]);
   setIsCopilotResponding(false);
  }, 1000);
 };

 const getModelRecommendation = (modelId: string): boolean => {
  const ram = (navigator as NavigatorWithDeviceMemory).deviceMemory || 4;
  const isMobile = detectedDeviceType === 'mobile';

  if (isMobile) {
   if (ram < 4) {
    return modelId === 'gemini-nano' || modelId === 'qwen-0.5b';
   } else {
    return modelId === 'deepseek-1.5b' || modelId === 'gemma-2b';
   }
  } else {
   if (ram < 8) {
    return modelId === 'deepseek-1.5b' || modelId === 'qwen-1.5b';
   } else {
    return modelId === 'phi-3' || modelId === 'llama-3b';
   }
  }
 };

 const handleTriggerGemSuggestion = (fieldId: string) => {
  setGemFieldActive(fieldId);
  setIsGemGenerating(true);
  setGemSuggestedText("");
  showToast("Generazione di un suggerimento locale non verificato...");

  setTimeout(() => {
   let suggestion = "";
   if (fieldId === 'uda-title') {
    if (discipline === 'italiano') {
      suggestion = order === 'primaria' 
        ? "Alla scoperta dei nessi filologici delle fiabe d'autore"
        : "Il viaggio dell'eroe e la sintassi dell'oratoria classica";
    } else if (discipline === 'matematica') {
      suggestion = order === 'primaria'
        ? "La geometria delle forme nel disegno d'aula cooperativo"
        : "Statistica d'aula: analisi dei consumi ed economia verde";
    } else if (discipline === 'storia') {
       suggestion = "Il Novecento nel territorio locale e il raccordo delle memorie";
    } else {
      suggestion = `Percorso diacronico integrato per la disciplina di ${getDisciplineLabel(discipline).toUpperCase()}`;
    }
   } else if (fieldId === 'uda-realtask') {
    if (discipline === 'italiano') {
      suggestion = "Realizzazione di un diario di bordo digitale in cui la classe descrive a puntate, curando la sintassi e l'esposizione, una vicenda storica raccordata alle fonti d'area.";
    } else if (discipline === 'matematica') {
      suggestion = "Sviluppo di un foglio di calcolo per simulare la contabilità di un'impresa cooperativa scolastica e un bilancio ecologico.";
    } else if (discipline === 'storia') {
       suggestion = "Creazione di un archivio digitale delle memorie locali tramite interviste registrate e schedate dagli alunni sul Novecento nel proprio territorio.";
    } else if (discipline === 'scienze') {
      suggestion = "Mappatura della biodiversitÃƒÂ  del giardino scolastico tramite la creazione di schede botaniche con QR-Code autogestite dalla classe.";
    } else {
      suggestion = `Sviluppo di un prototipo cooperativo o presentazione critica basata sui nuclei selezionati per ${getDisciplineLabel(discipline).toUpperCase()}.`;
    }
   } else if (fieldId === 'uda-inclusion') {
    suggestion = "Spunti non verificati da valutare nel contesto reale: organizzazione dei banchi, tutoraggio tra pari, mappe concettuali, schemi visivi, font leggibili e tempi definiti dal docente.";
     if (order === 'primaria') suggestion += " Possibile integrazione di laboratori linguistici cooperativi coerenti con il contesto locale.";
   } else if (fieldId === 'student-observation') {
    suggestion = "L'alunno dimostra eccellente collaborazione nelle fasi di Jigsaw d'aula. Espone con chiarezza logica, mostrando parziale autonomia nell'auto-correzione metodologica. Si consiglia di continuare a stimolare l'esposizione orale raccordata.";
   }

   setGemSuggestedText(suggestion);
   setIsGemGenerating(false);
   showToast("Suggerimento pronto dal Co-pilota!");
  }, 700);
 };

 const handleAcceptGemSuggestion = (text: string, editMode: boolean) => {
  if (gemFieldActive === 'uda-title') {
   setProgTitle(text);
   safeLocalStorageSetItem('curman_progTitle', text);
  } else if (gemFieldActive === 'uda-realtask') {
   setRealTaskInput(text);
  } else if (gemFieldActive === 'uda-inclusion') {
   setProgNotes(text);
  } else if (gemFieldActive === 'student-observation') {
   if (selectedStudentForFeedback) {
    const list = classroomStudentFeedback.map(s => {
     if (s.id === selectedStudentForFeedback.id) {
      return { ...s, obs: text };
     }
     return s;
    });
    setClassroomStudentFeedback(list);
    setSelectedStudentForFeedback({ ...selectedStudentForFeedback, obs: text });
   }
  }

  setGemFieldActive(null);
  setGemSuggestedText("");
  showToast(editMode ? "Suggerimento inserito per la modifica!" : "Suggerimento accettato ed inserito!");
 };

 const checkModelRamSafety = (modelId: string, modelName: string): boolean => {
  const isMobile = detectedDeviceType === 'mobile';

  if (isMobile && (modelId === 'llama-1b' || modelId === 'deepseek-1.5b' || modelId === 'gemma-2b' || modelId === 'phi-3' || modelId === 'llama-3b')) {
   return confirm(
      `Avvertenza locale sulla memoria del dispositivo:\n\n` +
     `Il saggio '${modelName}' richiede un elevato impegno di memoria RAM d'aula.\n\n` +
     `Sui dispositivi mobili (tablet/smartphone) con meno di 8 GB di RAM, questo potrebbe causare rallentamenti o l'arresto anomalo del browser.\n\n` +
     `Consigliamo invece l'uso del saggio 'Ermes' o 'Socrate'. Desideri procedere comunque col caricamento?`
   );
  }
  return true;
 };

 const handleToggleVoiceTyping = () => {
  const speechWindow = window as WindowWithSpeechRecognition;
  const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
  if (!SpeechRecognition) {
   showToast("Riconoscimento vocale non supportato in questo browser.", false);
   return;
  }

  if (isVoiceListening) {
   setIsVoiceListening(false);
   showToast("Dettatura vocale interrotta.");
   return;
  }

  // Pre-check permissions if available
  if (navigator.permissions && navigator.permissions.query) {
   navigator.permissions.query({ name: 'microphone' as PermissionName }).then((result) => {
    if (result.state === 'denied') {
     setShowMicPermissionGuide(true);
     showToast("Microfono bloccato nelle impostazioni del browser.", false);
     return;
    }
   }).catch(err => {
    console.warn("Permissions query failed", err);
   });
  }

  try {
   const recognition = new SpeechRecognition();
   recognition.lang = 'it-IT';
   recognition.interimResults = false;
   recognition.maxAlternatives = 1;

   recognition.onstart = () => {
     setIsVoiceListening(true);
     showToast("Dettatura attiva... Parla in italiano");
   };

   recognition.onerror = (e: SpeechRecognitionErrorEventLike) => {
     console.error("Speech recognition error:", e);
     setIsVoiceListening(false);
     if (e.error === 'not-allowed') {
      setShowMicPermissionGuide(true);
      showToast("Accesso al microfono negato o bloccato.", false);
     } else {
      showToast("Errore di dettatura o microfono bloccato.", false);
     }
   };

   recognition.onend = () => {
     setIsVoiceListening(false);
   };

   recognition.onresult = (event: SpeechRecognitionEventLike) => {
     const resultText = event.results[0][0].transcript;
     setCopilotChatInput(prev => prev ? prev + " " + resultText : resultText);
     showToast("Voce trascritta con successo!");
   };

   recognition.start();
  } catch (err) {
   console.error("Failed to start speech recognition:", err);
   setIsVoiceListening(false);
   setShowMicPermissionGuide(true);
   showToast("Impossibile accedere al microfono d'aula.", false);
  }
 };

 const handleSpeakController = (textToSpeak: string, msgIdx: number) => {
  if (!('speechSynthesis' in window)) {
   showToast("Sintesi vocale non supportata in questo browser.", false);
   return;
  }

  // If clicking on the currently speaking message
  if (ttsActiveMsgIndex === msgIdx) {
   if (ttsPlayingState === 'playing') {
    window.speechSynthesis.pause();
    setTtsPlayingState('paused');
    showToast("Riproduzione vocale in pausa.");
   } else if (ttsPlayingState === 'paused') {
    window.speechSynthesis.resume();
    setTtsPlayingState('playing');
    showToast("Riproduzione vocale ripresa.");
   }
   return;
  }

  // If clicking a new message, cancel the current speech
  window.speechSynthesis.cancel();

  const cleanText = textToSpeak
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\*+/g, "");

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'it-IT';

  const voices = window.speechSynthesis.getVoices();
  const itVoices = voices.filter(v => v.lang.startsWith('it'));
  const bestVoice = itVoices.sort((a, b) => {
    const keywords = ['natural', 'neural', 'google', 'microsoft', 'premium', 'enhanced', 'apple', 'siri'];
    const aScore = keywords.reduce((acc, k) => acc + (a.name.toLowerCase().includes(k) ? 1 : 0), 0);
    const bScore = keywords.reduce((acc, k) => acc + (b.name.toLowerCase().includes(k) ? 1 : 0), 0);
    return bScore - aScore;
  })[0];

  if (bestVoice) {
   utterance.voice = bestVoice;
   const isPremium = ['natural', 'neural', 'google', 'microsoft', 'premium', 'enhanced'].some(k => bestVoice.name.toLowerCase().includes(k));
   utterance.rate = isPremium ? 1.0 : 0.88;
  } else {
   utterance.rate = 0.88;
  }
  utterance.pitch = 1.0;

  utterance.onstart = () => {
   setTtsPlayingState('playing');
   setTtsActiveMsgIndex(msgIdx);
   showToast("Inizio riproduzione vocale...");
  };

  utterance.onend = () => {
   setTtsPlayingState('idle');
   setTtsActiveMsgIndex(null);
  };

  utterance.onerror = (e) => {
   console.error("SpeechSynthesis error:", e);
   setTtsPlayingState('idle');
   setTtsActiveMsgIndex(null);
  };

  window.speechSynthesis.speak(utterance);
 };

 const handleSelectCopilotChip = (text: string) => {
  handleSendCopilotMessage(text);
 };


 return {
  copilotChatInput,
  setCopilotChatInput,
  copilotChatHistory,
  setCopilotChatHistory,
  isCopilotResponding,
  isVoiceListening,
  showMicPermissionGuide,
  setShowMicPermissionGuide,
  ttsPlayingState,
  ttsActiveMsgIndex,
  gemFieldActive,
  setGemFieldActive,
  gemSuggestedText,
  setGemSuggestedText,
  isGemGenerating,
  handleSendCopilotMessage,
  getModelRecommendation,
  handleTriggerGemSuggestion,
  handleAcceptGemSuggestion,
  checkModelRamSafety,
  handleToggleVoiceTyping,
  handleSpeakController,
  handleSelectCopilotChip
 };
}
