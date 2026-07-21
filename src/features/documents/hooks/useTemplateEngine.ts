import { useState } from 'react';

type TemplateDocType = 'relazione' | 'uda' | 'greci';
type TemplateTab = 'standard' | 'template';
type TemplateChatMessage = { sender: 'user' | 'assistant'; text: string };

interface UseTemplateEngineArgs {
  showToast: (msg: string, success?: boolean) => void;
}

export const useTemplateEngine = ({ showToast }: UseTemplateEngineArgs) => {
  const [esportazioniTab, setEsportazioniTab] = useState<TemplateTab>('standard');
  const [templateDocType, setTemplateDocType] = useState<TemplateDocType>('relazione');
  const [templateJsonState, setTemplateJsonState] = useState({
    fontFamily: "Arial, sans-serif",
    fontSize: "11pt",
    lineHeight: "1.5",
    showMinisterialHeader: true,
    logoLeft: "PNRR",
    logoRight: "Unione_Europea",
    margins: "Normali (2cm)",
    sections: [
      { id: "sec1", title: "1. PRESENTAZIONE GENERALE DELLA CLASSE", enabled: true },
      { id: "sec2", title: "2. SVOLGIMENTO DELLA PROGRAMMAZIONE & METODOLOGIE", enabled: true },
      { id: "sec3", title: "3. METODOLOGIE INCLUSIVE (PEI/PDP/DSA)", enabled: true },
      { id: "sec4", title: "4. PROPOSTE DI VALUTAZIONE E AUTOVALUTAZIONE", enabled: true }
    ],
    leftSignee: "Il Referente del Curricolo",
    rightSignee: "Il Dirigente Scolastico (Prof.ssa Maria Letizia CML)"
  });
  const [templateChatInput, setTemplateChatInput] = useState("");
  const [templateChatHistory, setTemplateChatHistory] = useState<TemplateChatMessage[]>([
    { sender: 'assistant', text: "Benvenuto nella sezione di configurazione dei modelli d'Istituto! Sono il tuo assistente virtuale. Puoi chiedermi di modificare i margini, i font d'accessibilità, i loghi dell'intestazione o di abilitare/disabilitare sezioni, oppure cliccare sui suggerimenti rapidi qui sotto." }
  ]);

  const handleSendTemplateInstruction = (instructionText: string) => {
    if (!instructionText.trim()) return;

    const query = instructionText.toLowerCase().trim();
    const newHistory = [...templateChatHistory, { sender: 'user' as const, text: instructionText }];
    setTemplateChatHistory(newHistory);
    setTemplateChatInput("");

    setTimeout(() => {
      let responseText = "";
      let success = true;
      const updated = { ...templateJsonState };

      if (query.includes("margini stretti") || query.includes("1.5")) {
        updated.margins = "Stretti (1.5cm)";
        responseText = "Ho ridotto i margini di stampa a 1.5 cm su tutti i lati per massimizzare la resa dello spazio sul Foglio Bianco d'Ufficio.";
      } else if (query.includes("margini larghi") || query.includes("2.5")) {
        updated.margins = "Larghi (2.5cm)";
        responseText = "Ho configurato margini di stampa larghi a 2.5 cm su tutti i lati per una spaziatura più ariosa e formale.";
      } else if (query.includes("times") || query.includes("serif")) {
        updated.fontFamily = "Times New Roman, serif";
        responseText = "Carattere del modello configurato correttamente su 'Times New Roman' d'Istituto.";
      } else if (query.includes("carattere piccolo") || query.includes("10pt")) {
        updated.fontSize = "10pt";
        responseText = "Dimensione del carattere del corpo testo ridotta a 10pt per facilitare stampe compatte.";
      } else if (query.includes("carattere grande") || query.includes("12pt")) {
        updated.fontSize = "12pt";
        responseText = "Dimensione del carattere del corpo testo ampliata a 12pt per facilitare la leggibilità e l'accessibilità.";
      } else if (query.includes("nascondi intestazione") || query.includes("rimuovi ministero")) {
        success = false;
        responseText = "Rilevata regola di protezione d'Istituto: l'intestazione ministeriale d'Istituto è obbligatoria sui documenti formali e non può essere rimossa senza autorizzazione della Dirigenza scolastica.";
      } else if (query.includes("unione europea") || query.includes("ue") || query.includes("europa")) {
        updated.logoRight = "Unione_Europea";
        responseText = "Ho inserito il logo ufficiale dell'Unione Europea nell'intestazione a destra del faldone.";
      } else if (query.includes("pnrr")) {
        updated.logoLeft = "PNRR";
        responseText = "Ho inserito il logo ufficiale del PNRR Next Generation EU nell'intestazione a sinistra.";
      } else if (query.includes("usr") || query.includes("campania")) {
        updated.logoRight = "USR_Campania";
        responseText = "Ho inserito il logo dell'Ufficio Scolastico Regionale per la Campania nell'intestazione a destra.";
      } else if (query.includes("nascondi") || query.includes("rimuovi")) {
        let matched = false;
        const newSec = updated.sections.map(s => {
          if (query.includes(s.title.toLowerCase()) || query.includes(s.id.toLowerCase()) || query.includes("sezione")) {
            matched = true;
            return { ...s, enabled: false };
          }
          return s;
        });
        if (matched) {
          updated.sections = newSec;
          responseText = "Ho disabilitato la sezione corrispondente all'interno del corpo del modello d'Istituto.";
        } else {
          success = false;
          responseText = "Spiacente, non ho trovato sezioni corrispondenti nel modello attivo. Puoi inserire il titolo esatto della sezione da disabilitare.";
        }
      } else if (query.includes("mostra") || query.includes("ripristina") || query.includes("abilita")) {
        let matched = false;
        const newSec = updated.sections.map(s => {
          if (query.includes(s.title.toLowerCase()) || query.includes(s.id.toLowerCase())) {
            matched = true;
            return { ...s, enabled: true };
          }
          return s;
        });
        if (matched) {
          updated.sections = newSec;
          responseText = "Ho abilitato ed inserito nuovamente la sezione indicata nel corpo del modello.";
        } else {
          success = false;
          responseText = "Spiacente, non ho trovato sezioni disabilitate corrispondenti. Puoi inserire il titolo esatto della sezione da abilitare.";
        }
      } else if (query.includes("segretario")) {
        updated.leftSignee = "Il Segretario del Collegio";
        responseText = "Ho configurato la firma del 'Segretario del Collegio' in fondo alla pagina di sinistra.";
      } else if (query.includes("coordinatore")) {
        updated.leftSignee = "Il Coordinatore di Dipartimento";
        responseText = "Ho configurato la firma del 'Coordinatore di Dipartimento' in fondo alla pagina di sinistra.";
      } else {
        success = false;
        responseText = "Non ho compreso l'istruzione di modifica del modello. Puoi chiedermi di cambiare margini, font d'accessibilità, loghi o firme d'Istituto, oppure fare clic sui pulsanti di suggerimento rapido!";
      }

      if (success) {
        setTemplateJsonState(updated);
        showToast("Modello aggiornato in tempo reale con l'IA!", true);
      } else {
        showToast(responseText, false);
      }
      setTemplateChatHistory(prev => [...prev, { sender: 'assistant', text: responseText }]);
    }, 800);
  };

  return {
    esportazioniTab,
    setEsportazioniTab,
    templateDocType,
    setTemplateDocType,
    templateJsonState,
    setTemplateJsonState,
    templateChatInput,
    setTemplateChatInput,
    templateChatHistory,
    handleSendTemplateInstruction
  };
};
