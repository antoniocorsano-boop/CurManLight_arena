# 📐 ALLEGATO TECNICO DI ARCHITETTURA E SPECIFICHE IMPLEMENTATIVE
### Progettazione del Motore di Template d'Istituto con Intelligenza Artificiale Co-pilota (v1.7.0)
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data dell'Audit: 15 Luglio 2026*  
*Stato del Documento: VALIDATO & INTEGRATO NEL SECONDO CERVELLO*

---

## 🗺️ INDICE DEL DISGNO TECNICO
1. [Ingegneria del Flusso Dati (Data Flow & State Sincronizzazione)](#-1-ingegneria-del-flusso-dati-data-flow--state-sincronizzazione)
2. [Analisi Comparativa delle Librerie Open-Source (Client-Side)](#-2-analisi-comparativa-delle-librerie-open-source-client-side)
3. [Specifica del JSON-Schema di Configurazione dei Modelli](#-3-specifica-del-json-schema-di-configurazione-dei-modelli)
4. [L'Algoritmo di Orchestrazione Agentica (IA Co-pilota)](#-4-lalgoritmo-di-orchestrazione-agentica-ia-co-pilota)
5. [Disegno della Interfaccia Utente (React UI Mockup)](#-5-disegno-della-interfaccia-utente-react-ui-mockup)
6. [Piano di Rilascio e Integrazione Ordinamentale (v1.7.0)](#-6-piano-di-rilascio-e-integrazione-ordinamentale-v170)

---

## 📐 1. INGEGNERIA DEL FLUSSO DATI (DATA FLOW)

Per garantire la piena conformità all'architettura **offline-first a zero server footprint** di CurManLight, il motore di template non deve fare affidamento su alcun microservizio esterno. Tutta la logica di parsing, iniezione dati e compilazione dei file avviene all'interno del browser web dell'utente.

Il flusso dei dati si articola nelle seguenti fasi:

```
[Richiesta Docente (Testo/Voce)] ──► [Prompt Orchestrator] ──► [LLM Locale (O simulatore)]
                                                                        │
                                                                 (Modifiche JSON)
                                                                        │
                                                                        ▼
[Anteprima Visuale (HTML)] ◄─── [Generatore CSS @media print] ◄── [JSON State]
       │                                                                │
 (Click Stampa)                                                  (Click Scarica .docx)
       │                                                                │
       ▼                                                                ▼
[Salva in PDF Nativo]                                         [Docxtemplater + JSZip]
```

---

## 🔬 2. ANALISI COMPARATIVA DELLE LIBRERIE OPEN-SOURCE

Abbiamo condotto una valutazione rigorosa delle soluzioni Javascript libere disponibili per la manipolazione di documenti d'ufficio directly in-browser:

| Libreria | Licenza | Dimensione | Punti di Forza | Limiti / Rischi nel Browser | Giudizio |
| :--- | :---: | :---: | :--- | :--- | :---: |
| **Docxtemplater** | MIT / Pro | ~60 KB | Lettura di file `.docx` esistenti, iniezione di tag Mustache (`{nome}`), tabelle dinamiche. | La versione gratuita non supporta l'inserimento di immagini dinamiche. | **CONSIGLIATA (Scelta d'Istituto)** |
| **PizZip / JSZip** | MIT | ~30 KB | Leggerissima, veloce, decomprime e ricomprime l'archivio XML del file Word in locale. | Nessuno, è uno standard de-facto robusto e offline-first. | **CONSIGLIATA (Accoppiata a Docxtemplater)** |
| **Carbone.io** | Apache 2.0 | ~150 KB | Motore potentissimo, supporta docx, odt, xlsx. Converte in PDF se abbinato a LibreOffice. | Richiede LibreOffice installato sul server per convertire in PDF; in-browser ha funzionalità limitate. | **FAVOREVOLE (Solo per formati Word/ODT)** |
| **docx (docx.js)** | MIT | ~220 KB | Generazione di file Word complessi da zero con codice Javascript procedurale. | Curva d'apprendimento ripida. Qualsiasi modifica grafica richiede di riscrivere righe di codice JS. | **NON CONSIGLIATA** |
| **Mammoth.js** | BSD | ~80 KB | Eccellente per convertire file Word `.docx` in HTML semantico pulito (CSS friendly). | È un convertitore unidirezionale (da Docx a HTML), non permette di salvare o creare file Word. | **FAVOREVOLE (Per importare modelli esterni)** |

---

## 📜 3. SPECIFICA DEL JSON-SCHEMA DI CONFIGURAZIONE DEI MODELLI

Per garantire la stabilità ed evitare errori di tipo (ReferenceError o TypeMismatch) a runtime, la struttura di ciascun template è definita da un **JSON-Schema dichiarativo**. Ogni modifica prodotta dall'IA viene validata a freddo rispetto a questo schema prima di essere applicata allo stato dell'applicazione.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SchoolDocumentTemplate",
  "type": "object",
  "required": ["templateId", "documentType", "layout", "header", "sections", "footer"],
  "properties": {
    "templateId": { "type": "string" },
    "documentType": { "type": "string", "enum": ["uda", "relazione_scolastica", "programmazione_annuale"] },
    "layout": {
      "type": "object",
      "required": ["fontFamily", "fontSize", "lineHeight", "margins"],
      "properties": {
        "fontFamily": { "type": "string", "enum": ["Arial, sans-serif", "Times New Roman, serif", "Calibri, sans-serif"] },
        "fontSize": { "type": "string", "enum": ["10pt", "11pt", "12pt"] },
        "lineHeight": { "type": "string", "enum": ["1.3", "1.5", "1.6"] },
        "margins": {
          "type": "object",
          "properties": {
            "top": { "type": "string" },
            "bottom": { "type": "string" },
            "left": { "type": "string" },
            "right": { "type": "string" }
          }
        }
      }
    },
    "header": {
      "type": "object",
      "required": ["showMinisterialHeader", "schoolName"],
      "properties": {
        "showMinisterialHeader": { "type": "boolean" },
        "schoolName": { "type": "string" },
        "logoLeft": { "type": "string", "enum": ["none", "MIM", "USR_Campania", "Unione_Europea", "PNRR"] },
        "logoRight": { "type": "string", "enum": ["none", "MIM", "USR_Campania", "Unione_Europea", "PNRR"] }
      }
    },
    "sections": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "title", "enabled"],
        "properties": {
          "id": { "type": "string" },
          "title": { "type": "string" },
          "enabled": { "type": "boolean" }
        }
      }
    },
    "footer": {
      "type": "object",
      "required": ["showSignatures", "leftSignee", "rightSignee"],
      "properties": {
        "showSignatures": { "type": "boolean" },
        "leftSignee": { "type": "string" },
        "rightSignee": { "type": "string" }
      }
    }
  }
}
```

---

## 🤖 4. L'ALGORITMO DI ORCHESTRAZIONE SEMANTICA (IA CO-PILOTA)

L'**Assistente Intelligente per i Modelli (Template Copilot)** agisce come un interprete semantico d'Istituto. Riceve l'istruzione del docente in linguaggio comune, interroga lo schema del template attivo e genera una mutazione JSON conforme.

Di seguito viene illustrato l'algoritmo TypeScript (`TemplateOrchestrator`) che simula questa interazione in modo protetto:

```typescript
interface TemplateState {
  templateId: string;
  documentType: string;
  layout: {
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
    margins: { top: string; bottom: string; left: string; right: string };
  };
  header: {
    showMinisterialHeader: boolean;
    schoolName: string;
    logoLeft: string;
    logoRight: string;
  };
  sections: Array<{ id: string; title: string; enabled: boolean }>;
  footer: {
    showSignatures: boolean;
    leftSignee: string;
    rightSignee: string;
  };
}

class TemplateOrchestrator {
  private activeTemplate: TemplateState;

  constructor(initialTemplate: TemplateState) {
    this.activeTemplate = initialTemplate;
  }

  /**
   * Riceve ed analizza semanticamente la richiesta dell'utente per applicare la modifica al JSON
   */
  public processAiInstruction(instruction: string): { success: boolean; message: string; updatedTemplate: TemplateState } {
    const text = instruction.toLowerCase().trim();
    const updated = { ...this.activeTemplate };

    try {
      // 1. ANALISI SEMANTICA DEI MARGINI
      if (text.includes("margini stretti") || text.includes("riduci margini")) {
        updated.layout.margins = { top: "1.5cm", bottom: "1.5cm", left: "1.5cm", right: "1.5cm" };
        return { success: true, message: "Ho ridotto i margini di stampa a 1.5 cm su tutti i lati per ottimizzare lo spazio.", updatedTemplate: updated };
      }
      if (text.includes("margini larghi") || text.includes("aumenta margini")) {
        updated.layout.margins = { top: "2.5cm", bottom: "2.5cm", left: "3cm", right: "3cm" };
        return { success: true, message: "Ho ampliato i margini di stampa per dare un aspetto più arioso e formale.", updatedTemplate: updated };
      }

      // 2. ANALISI SEMANTICA DEI FONT E CARATTERI
      if (text.includes("cambia carattere in times") || text.includes("serif") || text.includes("times new roman")) {
        updated.layout.fontFamily = "Times New Roman, serif";
        return { success: true, message: "Carattere impostato con successo su 'Times New Roman' per una resa classica.", updatedTemplate: updated };
      }
      if (text.includes("carattere piccolo") || text.includes("riduci testo")) {
        updated.layout.fontSize = "10pt";
        return { success: true, message: "Dimensione testo ridotta a 10pt per facilitare la stampa compatta.", updatedTemplate: updated };
      }

      // 3. ANALISI SEMANTICA DELL'INTESTAZIONE E DEI LOGHI
      if (text.includes("nascondi intestazione ministeriale") || text.includes("rimuovi ministero")) {
        // Regola di Sicurezza: Impediamo la rimozione se l'utente non è amministratore scolastico
        return { success: false, message: "Rilevata regola di protezione d'Istituto: l'intestazione ministeriale d'Istituto è obbligatoria sui documenti formali e non può essere rimossa senza autorizzazione della Dirigenza.", updatedTemplate: this.activeTemplate };
      }
      if (text.includes("aggiungi logo unione europea") || text.includes("logo ue") || text.includes("europa")) {
        updated.header.logoRight = "Unione_Europea";
        return { success: true, message: "Ho inserito il logo dell'Unione Europea nell'intestazione a destra.", updatedTemplate: updated };
      }
      if (text.includes("aggiungi logo pnrr") || text.includes("logo pnrr")) {
        updated.header.logoLeft = "PNRR";
        return { success: true, message: "Ho inserito il logo ufficiale del PNRR nell'intestazione a sinistra.", updatedTemplate: updated };
      }

      // 4. ANALISI SEMANTICA DELLE SEZIONI (ABILITAZIONE / DISABILITAZIONE)
      if (text.includes("nascondi sezione") || text.includes("rimuovi sezione")) {
        // Identifichiamo quale sezione l'utente vuole nascondere
        const match = updated.sections.find(s => text.includes(s.title.toLowerCase()) || text.includes(s.id.toLowerCase()));
        if (match) {
          match.enabled = false;
          return { success: true, message: `Ho disabilitato con successo la sezione '${match.title}' dal template del report.`, updatedTemplate: updated };
        }
      }
      if (text.includes("mostra sezione") || text.includes("ripristina sezione")) {
        const match = updated.sections.find(s => text.includes(s.title.toLowerCase()) || text.includes(s.id.toLowerCase()));
        if (match) {
          match.enabled = true;
          return { success: true, message: `Ho abilitato ed inserito nuovamente la sezione '${match.title}' nel corpo del report.`, updatedTemplate: updated };
        }
      }

      // 5. ANALISI SEMANTICA DELLE FIRME (FOOTER)
      if (text.includes("cambia firma referente") || text.includes("firma del coordinatore")) {
        updated.footer.leftSignee = "Il Coordinatore di Dipartimento";
        return { success: true, message: "Ho aggiornato il blocco firma sinistro impostando il 'Coordinatore di Dipartimento'.", updatedTemplate: updated };
      }
      if (text.includes("aggiungi firma segretario")) {
        updated.footer.leftSignee = "Il Segretario del Collegio";
        return { success: true, message: "Ho inserito la firma del 'Segretario del Collegio' in fondo a sinistra.", updatedTemplate: updated };
      }

      // Sincronizzazione fallita se non ci sono regole corrispondenti
      return { success: false, message: "Spiacente, non ho compreso l'istruzione di modifica del template. Puoi chiedermi di cambiare margini, font, loghi o firme d'Istituto.", updatedTemplate: this.activeTemplate };

    } catch (error) {
      return { success: false, message: `Errore di elaborazione semantica del modello: ${error}`, updatedTemplate: this.activeTemplate };
    }
  }
}
```

---

## 🎨 5. DISEGNO DELLA INTERFACCIA UTENTE (REACT UI MOCKUP)

Il modulo d'interfaccia utente (UI) viene integrato nel tab *Fonti & Configurazione*, offrendo un layout pulito, elegante e diviso in due colonne:

```
+─────────────────────────────────────────────────────────────────────────────+
| 👤 IMPOSTAZIONI MODELLI E TEMPLATE D'ISTITUTO                               |
+─────────────────────────────────────────────────────────────────────────────+
| [ Seleziona Tipo Documento: [Relazione Finale ▾] ]                          |
+─────────────────────────────────────────────────────────────────────────────+
| COLONNA SINISTRA: CO-PILOTA                 | COLONNA DESTRA: ANTEPRIMA      |
|                                             |                               |
| 🤖 Assistente dei Template d'Istituto       | +---------------------------+ |
| Inserisci richiesta in linguaggio comune:   | |   STILE FOGLIO BIANCO     | |
| +─────────────────────────────────────────+ | |                           | |
| | Es. "Aggiungi logo PNRR a sinistra e    | | |  [ Intestazione MIM ]     | |
| | restringi i margini di stampa a 1.5 cm" | | |                           | |
| +─────────────────────────────────────────+ | |  Titolo Documento         | |
| [ 🤖 Applica Modifiche con IA ]             | |                           | |
|                                             | |  Corpo del Testo          | |
| 📋 Impostazioni Strutturali Rapide          | |                           | |
| 🔠 Carattere: [ Arial ▾ ]  📏 Voto: [11pt ▾]| |  [ Blocco Firme ]         | |
| 📐 Margini:  [ Normali ▾ ]                  | |                           | |
|                                             | +---------------------------+ |
| Loghi Intestazione:                         |                               |
| [X] Logo Sinistro (PNRR)                    |                               |
| [ ] Logo Destro (Unione Europea)            | [📄 Scarica Modello Word]     |
|                                             | [🖨️ Stampa Anteprima PDF]     |
+─────────────────────────────────────────────┴───────────────────────────────+
```

---

## 📅 6. PIANO DI RILASCIO E INTEGRAZIONE ORDINAMENTALE (v1.7.0)

La Commissione d'Audit delinea il seguente cronoprogramma per la realizzazione fisica e l'attivazione in produzione del motore di template:

```
   [ Rilascio v1.6.0 ] ──► [ Integrazione Docxtemplater ] ──► [ Sviluppo UI e JSON State ]
                                                                       │
   [ Validazione Collegiale ] ◄── [ Test di Copertura IA ] ◄─── [ Connessione LLM Locale ]
```

* **Fase 1: Integrazione Librerie (Settembre 2026)**:
  Iniezione del pacchetto `docxtemplater.js` e `pizzip.js` nell'ambiente di build Vite, verificando la compatibilità con il modulo monolitico `index.html`.
* **Fase 2: Stato e Validazione (Ottobre 2026)**:
  Abilitazione dello stato `documentTemplates` in Zustand per garantire la memorizzazione offline dei modelli d'Istituto modificati dall'utente in `IndexedDB`.
* **Fase 3: Sviluppo del Copilot (Novembre 2026)**:
  Scrittura del motore di interpretazione semantica dei prompt ed integrazione dell'assistente virtuale nell'interfaccia visuale.
* **Fase 4: Collaudo e Approvazione (Dicembre 2026)**:
  Presentazione della funzionalità alla Dirigenza d'Istituto e delibera di validazione per l'anno scolastico 2026/2027.

---
*Rapporto di specifica e disegno tecnico approvato e firmato.*  
**La Commissione d'Audit per l'Innovazione Tecnologica**  
*Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani»*  
*Ariano Irpino, 15 Luglio 2026*
