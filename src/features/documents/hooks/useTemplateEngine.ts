import { useEffect, useReducer, useRef, useState, type SetStateAction } from 'react';
import type { A07InstitutionalDocumentRead } from '../../../domain/institution';

type TemplateDocType = 'relazione' | 'uda' | 'greci';
type TemplateTab = 'standard' | 'template';
type TemplateChatMessage = { sender: 'user' | 'assistant'; text: string };

interface UseTemplateEngineArgs {
  showToast: (msg: string, success?: boolean) => void;
  institutionalProfile: A07InstitutionalDocumentRead;
}

const createTemplateState = () => ({
  fontFamily: "Arial, sans-serif",
  fontSize: "11pt",
  lineHeight: "1.5",
  showMinisterialHeader: true,
  logoLeft: "",
  logoRight: "",
  margins: "Normali (2cm)",
  sections: [
    { id: "sec1", title: "1. PRESENTAZIONE GENERALE DELLA CLASSE", enabled: true },
    { id: "sec2", title: "2. SVOLGIMENTO DELLA PROGRAMMAZIONE & METODOLOGIE", enabled: true },
    { id: "sec3", title: "3. METODOLOGIE INCLUSIVE (PEI/PDP/DSA)", enabled: true },
    { id: "sec4", title: "4. PROPOSTE DI VALUTAZIONE E AUTOVALUTAZIONE", enabled: true }
  ],
  leftSignee: "",
  rightSignee: "",
});

type TemplateState = ReturnType<typeof createTemplateState>;
type TemplateInstructionResult = { state: TemplateState; responseText: string; success: boolean };
type TemplateEngineState = {
  templateJsonState: TemplateState;
  conversation: TemplateChatMessage[];
  notification?: { id: number; text: string; success: boolean };
};
type TemplateEngineAction =
  | { type: 'add-user'; text: string }
  | { type: 'complete'; id: number; query: string }
  | { type: 'set-template'; value: SetStateAction<TemplateState> }
  | { type: 'reset-template' };

function applyTemplateInstruction(state: TemplateState, query: string): TemplateInstructionResult {
  const updated = { ...state };
  let responseText = '';
  let success = true;

  if (query.includes('margini stretti') || query.includes('1.5')) {
    updated.margins = 'Stretti (1.5cm)';
    responseText = "Ho ridotto i margini di stampa a 1.5 cm su tutti i lati per massimizzare la resa dello spazio sul Foglio Bianco d'Ufficio.";
  } else if (query.includes('margini larghi') || query.includes('2.5')) {
    updated.margins = 'Larghi (2.5cm)';
    responseText = 'Ho configurato margini di stampa larghi a 2.5 cm su tutti i lati per una spaziatura più ariosa.';
  } else if (query.includes('times') || query.includes('serif')) {
    updated.fontFamily = 'Times New Roman, serif';
    responseText = "Carattere del modello configurato su 'Times New Roman'.";
  } else if (query.includes('carattere piccolo') || query.includes('10pt')) {
    updated.fontSize = '10pt';
    responseText = 'Dimensione del carattere del corpo testo ridotta a 10pt per facilitare stampe compatte.';
  } else if (query.includes('carattere grande') || query.includes('12pt')) {
    updated.fontSize = '12pt';
    responseText = 'Dimensione del carattere del corpo testo ampliata a 12pt per facilitare la leggibilità e l\'accessibilità.';
  } else if (query.includes('intestazione')) {
    updated.showMinisterialHeader = !query.includes('nascondi') && !query.includes('rimuovi');
    responseText = updated.showMinisterialHeader ? "Ho mostrato l'intestazione configurata." : "Ho nascosto l'intestazione configurata.";
  } else if (query.includes('logo') || query.includes('pnrr') || query.includes('usr') || query.includes('unione europea')) {
    success = false;
    responseText = 'Nessun logo locale è configurato nel profilo istituzionale.';
  } else if (query.includes('nascondi') || query.includes('rimuovi')) {
    let matched = false;
    const sections = updated.sections.map(section => {
      if (query.includes(section.title.toLowerCase()) || query.includes(section.id.toLowerCase()) || query.includes('sezione')) {
        matched = true;
        return { ...section, enabled: false };
      }
      return section;
    });
    if (matched) {
      updated.sections = sections;
      responseText = 'Ho disabilitato la sezione corrispondente nel modello locale.';
    } else {
      success = false;
      responseText = 'Spiacente, non ho trovato sezioni corrispondenti nel modello attivo. Puoi inserire il titolo esatto della sezione da disabilitare.';
    }
  } else if (query.includes('mostra') || query.includes('ripristina') || query.includes('abilita')) {
    let matched = false;
    const sections = updated.sections.map(section => {
      if (query.includes(section.title.toLowerCase()) || query.includes(section.id.toLowerCase())) {
        matched = true;
        return { ...section, enabled: true };
      }
      return section;
    });
    if (matched) {
      updated.sections = sections;
      responseText = 'Ho abilitato ed inserito nuovamente la sezione indicata nel corpo del modello.';
    } else {
      success = false;
      responseText = 'Spiacente, non ho trovato sezioni disabilitate corrispondenti. Puoi inserire il titolo esatto della sezione da abilitare.';
    }
  } else if (query.includes('firma') || query.includes('segretario') || query.includes('coordinatore')) {
    success = false;
    responseText = 'Nessuna firma è configurata nel profilo istituzionale.';
  } else {
    success = false;
    responseText = 'Non ho compreso l\'istruzione. Puoi chiedermi di cambiare margini, caratteri, intestazione o sezioni.';
  }

  return { state: success ? updated : state, responseText, success };
}

function templateEngineReducer(state: TemplateEngineState, action: TemplateEngineAction): TemplateEngineState {
  if (action.type === 'add-user') return { ...state, conversation: [...state.conversation, { sender: 'user', text: action.text }] };
  if (action.type === 'set-template') {
    return { ...state, templateJsonState: typeof action.value === 'function' ? action.value(state.templateJsonState) : action.value };
  }
  if (action.type === 'reset-template') return { ...state, templateJsonState: createTemplateState() };
  const result = applyTemplateInstruction(state.templateJsonState, action.query);
  return {
    ...state,
    templateJsonState: result.state,
    conversation: [...state.conversation, { sender: 'assistant', text: result.responseText }],
    notification: { id: action.id, text: result.responseText, success: result.success },
  };
}

export const useTemplateEngine = ({ showToast, institutionalProfile }: UseTemplateEngineArgs) => {
  const [esportazioniTab, setEsportazioniTab] = useState<TemplateTab>('standard');
  const [templateDocType, setTemplateDocType] = useState<TemplateDocType>('relazione');
  const [templateChatInput, setTemplateChatInput] = useState("");
  const [engineState, dispatch] = useReducer(templateEngineReducer, undefined, () => ({
    templateJsonState: createTemplateState(),
    conversation: [],
  }));
  const timerIds = useRef<ReturnType<typeof setTimeout>[]>([]);
  const completionId = useRef(0);
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;
  const initialAssistantMessage: TemplateChatMessage = {
    sender: 'assistant',
    text: `Modelli per ${institutionalProfile.instituteName}. Puoi modificare margini, caratteri e sezioni del documento.`,
  };

  useEffect(() => {
    if (engineState.notification) showToastRef.current(engineState.notification.text, engineState.notification.success);
  }, [engineState.notification]);

  useEffect(() => () => {
    timerIds.current.forEach(clearTimeout);
    timerIds.current = [];
  }, []);

  const handleSendTemplateInstruction = (instructionText: string) => {
    if (!instructionText.trim()) return;

    const query = instructionText.toLowerCase().trim();
    dispatch({ type: 'add-user', text: instructionText });
    setTemplateChatInput("");

    const id = ++completionId.current;
    const timerId = setTimeout(() => {
      timerIds.current = timerIds.current.filter(item => item !== timerId);
      dispatch({ type: 'complete', id, query });
    }, 800);
    timerIds.current.push(timerId);
  };

  const resetTemplateState = () => {
    dispatch({ type: 'reset-template' });
    showToast("Modello ripristinato allo stato iniziale.", true);
  };

  const setTemplateJsonState = (value: SetStateAction<TemplateState>) => dispatch({ type: 'set-template', value });

  return {
    esportazioniTab,
    setEsportazioniTab,
    templateDocType,
    setTemplateDocType,
    templateJsonState: engineState.templateJsonState,
    setTemplateJsonState,
    templateChatInput,
    setTemplateChatInput,
    templateChatHistory: [initialAssistantMessage, ...engineState.conversation],
    handleSendTemplateInstruction,
    resetTemplateState
  };
};
