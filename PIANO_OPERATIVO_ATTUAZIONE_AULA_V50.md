# 🏛️ PIANO OPERATIVO DI ATTUAZIONE E SPECIFICHE DI SVILUPPO (v5.0-Ultimate)
### Cronoprogramma Esecutivo, Struttura dello Stato e Manutenzione dell'Ambiente d'Aula d'Istituto
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data d'Emissione: 16 Luglio 2026*  
*Coordinamento: Commissione Congiunta per la Didattica e l'Innovazione Tecnologica d'Istituto*  
*Stato del Documento: EMESSO IN VIA DEFINITIVA E PRONTO PER LA FASE DI SVILUPPO*

---

## 🗺️ INDICE COSTRUTTIVO DEL PIANO
1. [Inquadramento e Quadro Normativo di Riferimento](#-1-inquadramento-e-quadro-normativo-di-riferimento)
2. [TAVOLO I: Struttura dello Stato Reattivo d'Istituto (Zustand Schema)](#-tavolo-i-struttura-dello-stato-reattivo-distituto-zustand-schema)
3. [TAVOLO II: Architettura visiva dell'Ambiente d'Aula (React UI Canvas)](#-tavolo-ii-architettura-visiva-dellambiente-daula-react-ui-canvas)
4. [TAVOLO III: Cronoprogramma delle Attività (Sprint Timeline per Settembre 2026)](#-tavolo-iii-cronoprogramma-delle-attivita-sprint-timeline-per-settembre-2026)
5. [TAVOLO IV: Contro-Audit Preventivo di Terza Parte (Validazione del Piano)](#-tavolo-iv-contro-audit-preventivo-di-terza-parte-validazione-del-piano)
6. [Glossario e De-gergonizzazione Obbligatoria d'Istituto](#-glossario-e-de-gergonizzazione-obbligatoria-distituto)

---

## 🏛️ 1. INQUADRAMENTO E QUADRO NORMATIVO DI RIFERIMENTO

Il presente **Piano Operativo di Attuazione** costituisce la sintesi esecutiva delle disposizioni e delle specifiche tecniche e pedagogiche elaborate nei precedenti verbali d'Istituto (`RAPPORTO_CERTIFICAZIONE_E_MANUALE_ONBOARDING_V50.md` e `AMPLIAMENTO_STUDIO_D_AULA_COMPLETO.md`).

L'obiettivo primario è tradurre in codice sorgente e logiche di database l'intera sezione **Ambiente d'Aula (Pillar III)** entro l'avvio formale dell'anno scolastico, garantendo il pieno allineamento con i seguenti decreti legislativi:
1.  **D.P.R. 275/1999 (Autonomia Scolastica):** Consentire la flessibilità oraria e la parametrazione dei carichi d'insegnamento d'Istituto nel rispetto dei traguardi nazionali.
2.  **D.M. 221/2025 (Nuove Indicazioni Nazionali):** Promuovere la scrittura in corsivo, lo studio dell'Intelligenza Artificiale etica ed i raccordi STEM.
3.  **D.M. 14/2024 (Nuovi Modelli di Certificazione):** Integrare l'esportazione automatica e la registrazione degli esiti didattici degli studenti su 4 livelli ministeriali (*Avanzato*, *Intermedio*, *Base*, *Iniziale*).
4.  **Regolamento UE 2016/679 (GDPR):** Escludere qualsiasi immissione di dati sensibili di minori su server esterni mediante crittografia simmetrica client-side in RAM temporanea locale.

---

## 💾 TAVOLO I: STRUTTURA DELLO STATO REATTIVO D'ISTITUTO (Zustand Schema)

Per supportare le nuove funzionalità d'aula senza intaccare le prestazioni e aggirando i limiti di cache tradizionali del browser, lo store reattivo d'istituto (Zustand in `src/store/useCurriculumStore.ts`) viene espanso introducendo i seguenti parametri nello stato persistito nel database IndexedDB (`Dexie.js`):

```typescript
// Integrazione dello Stato per l'Ambiente d'Aula v5.0-Ultimate
interface UserState {
  // ... (stati esistenti) ...
  
  // 1. Parametrazione Oraria Settimanale d'Istituto (DPR 275/1999)
  weeklyHoursBudget: Record<string, number>; // Associa la disciplina alle ore settimanali effettive
  bufferCoefficient: number;                // Moltiplicatore di Tolleranza Temporale (Default: 1.2)
  
  // 2. Stato dell'Ambiente Classe e Seating Chart
  selectedClassCombination: string;          // Classe-Sezione attiva (es. "1^A", "2^A")
  activeClassTheme: 'scientists' | 'classico' | 'miti'; // Tema culturale di anonimizzazione
  classroomLayout: 'frontale' | 'isole' | 'circle';    // Disposizione fisica dei banchi
  
  // 3. Anonimizzazione e Pseudonimi Dinamici d'Istituto
  studentIdentityMap: Record<string, {
    realNameMask: string;                    // Nome mascherato (es. "Studente A")
    currentPseudonym: string;                // Pseudonimo culturale (es. "Einstein")
    avatarIcon: string;                      // Icona associata all'eroe
  }>;
  
  // 4. Vincoli Relazionali e Cooperative Groups d'Istituto
  relationalExclusions: Array<{ studentId1: string; studentId2: string }>; // Conflitti relazionali
  cooperativeMethod: 'jigsaw' | 'peertutoring' | 'laboratorio';            // Metodo cooperativo attivo
  generatedGroups: any | null;              // Gruppi generati dall'algoritmo
}
```

### Azioni e Funzioni del Negozio (Store Actions)
Le funzioni di aggiornamento dello stato sono concepite per operare a "conoscenza zero" e in modo transazionale:

1.  **`setWeeklyHours(discipline: string, hours: number)`**: Aggiorna il budget orario settimanale e innesca la ricalcolazione automatica del Diagramma di Gantt.
2.  **`setBufferCoefficient(val: number)`**: Modifica il moltiplicatore di tolleranza per compensare i rallentamenti del calendario reale (festività, assenze).
3.  **`shufflePseudonyms()`**: Esegue il rimescolamento dinamico (*Dynamic Pseudonymization*) mappando in modo casuale gli pseudonimi del tema attivo agli identificativi degli studenti prima di proiettare lo schermo sulla LIM.
4.  **`addRelationalExclusion(id1: string, id2: string)`**: Registra un hard constraint per l'algoritmo di raggruppamento, impedendo all'algoritmo di unire i due studenti nello stesso gruppo cooperativo.
5.  **`syncOutcomesToObservatory(udaId: string, outcomes: Record<string, number>)`**: Aggrega le valutazioni registrate dal docente nella mappa spaziale ed aggiorna in tempo reale l'indice di successo d'Istituto (*Outcomes Success Index - OSI %*) nell'Osservatorio delle UDA.

---

## 🎨 TAVOLO II: ARCHITETTURA VISIVA DELL'AMBIENTE D'AULA (React UI Canvas)

Il layout visivo della sezione **Ambiente & Esiti Classe** deve garantire unSUS Score elevato (> 85/100) riducendo il tempo di configurazione sotto i 30 secondi. L'Architetto UI e la Gaming Designer hanno definito la seguente disposizione spaziale dei componenti in `src/App.tsx`:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PILLAR III: DIDATTICA IN CLASSE (UI CANVAS)                     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐  ┌──────────────────────────────────────────┐ │
│ │ 1. BUDGET PARAMETRICO & BUFFER       │  │ 2. LEZIONE ATTIVA & INNESCO ARGOMENTO    │ │
│ │ • Imposta ore discipline (Italiano)  │  │ • UDA odierna: "Il corsivo come arte"    │ │
│ │ • Moltiplicatore tolleranza: [ 1.2 ] │  │ • Argomento: [                        ]  │ │
│ └──────────────────────────────────────┘  └──────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 3. SPAZIO CLASSE INTERATTIVO (Mappa dei Banchi sulla LIM)                           │ │
│ │   Assetto: [ Frontale / Isole / Cerchio ]  Tema Pseudonimi: [ Scientists / Miti ]  │ │
│ │   [ 🎲 Rimescola Pseudonimi ]                 [ 👥 Genera Gruppi Cooperativi ]      │ │
│ │                                                                                    │ │
│ │    [ Einstein ⚛️ ]     [ Curie ⚛️ ]      [ Fermi ⚛️ ]      [ Lovelace ⚛️ ]             │ │
│ │    (Liv. Avanzato)    (Liv. Avanzato)   (Liv. Intermedio) (Liv. Iniziale)          │ │
│ │                                                                                    │ │
│ │    [ Tesla ⚛️ ]        [ Darwin ⚛️ ]     [ Ipazia ⚛️ ]     [ Hawking ⚛️ ]              │ │
│ │                                                                                    │ │
│ └────────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 4. CRONOPROGRAMMA REATTIVO D'ISTITUTO (Diagramma di Gantt)                         │ │
│ │   UDA: 1. Il Corsivo (3 sett)  [=============]                                     │ │
│ │   UDA: 2. L'Etimologia (2 sett)               [========]                           │ │
│ └────────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Funzionamento dei Componenti Chiave
1.  **Il Box di Parametrazione Oraria:** Input numerici adiacenti collegati direttamente alle variabili dello store. Ogni modifica esegue un ricalcolo asincrono dell'ingombro temporale delle UDA.
2.  **Il Canvas Spaziale dei Banchi:** Una griglia CSS bidimensionale (CSS Grid) che ridisegna la posizione dei banchi a seconda del layout:
    *   *Frontale*: Tre colonne ordinate di coppie di banchi.
    *   *Isole*: Quattro cluster distanti composti da 4 banchi uniti.
    *   *Circle Time*: Un anello perimetrale aperto che lascia sgomberata l'area centrale della classe.
3.  **L'Algoritmo Cooperativo Inclusivo:**  
    L'innesco del pulsante "Genera Gruppi" compie una partizione eterogenea basata sull'algoritmo di ordinamento dei pesi (competenze unificate D.M. 14/2024), verificando che in ogni isola o coppia sia presente un bilanciamento tra alunni con livello avanzato/intermedio (che assumono il ruolo di *Portavoce* o *Tutor*) ed alunni con livello base/iniziale (con il ruolo di *Scriba* o *Tutee*), prevenendo l'accoppiamento di studenti inseriti nell'elenco delle esclusioni relazionali.

---

## 📅 TAVOLO III: CRONOPROGRAMMA DELLE ATTIVITÀ (Sprint Timeline per Settembre 2026)

L'attuazione tecnica del piano segue una sequenza a 4 Sprint esecutivi, ciascuno associato a specifici traguardi di collaudo d'istituto:

```
📊 GANTT DI SVILUPPO E RILASCIO OPERATIVO (Anno Scolastico 2026/2027)
──────────────────────────────────────────────────────────────────────────────────────────
Sotto-fase / Attività                   | Tempistica      | Output di Collaudo Atteso
──────────────────────────────────────────────────────────────────────────────────────────
SPRINT 1: Onboarding e Cloud Workspace   | Settembre 2026  | Bypass ruoli DS ed onboarding
                                        |                 | generalisti dell'Infanzia.
SPRINT 2: Parametrazione & Gantt Buffer  | Ottobre 2026    | Raccordo ore settimanali e
                                        |                 | moltiplicatori tolleranza.
SPRINT 3: Spazio Classe & Pseudonimi    | Novembre 2026   | Rimescolamento dinamico banchi
                                        |                 | e caricamento dei temi protetti.
SPRINT 4: Gruppi Cooperativi & OSI %    | Dicembre 2026   | Algoritmo Jigsaw con vincoli
                                        |                 | relazionali e sincronia esiti.
──────────────────────────────────────────────────────────────────────────────────────────
```

*   **Verifica dello Sviluppo (Sprint 1):** Validare che la disattivazione del passo 3 dell'onboarding per i docenti dell'Infanzia prevenga il blocco d'aula e riduca i passaggi burocratici.
*   **Verifica dello Sviluppo (Sprint 2):** Testare che l'introduzione di un moltiplicatore di tolleranza pari a `1.25` riduca lo slittamento delle UDA successive sul diagramma di Gantt in caso di festività.
*   **Verifica dello Sviluppo (Sprint 3):** Eseguire test di "data leakage" assicurandosi che i nomi anagrafici reali non vengano in alcun modo salvati all'interno della cache del browser se è attiva la mascheratura culturale.
*   **Verifica dello Sviluppo (Sprint 4):** Eseguire simulazioni dell'algoritmo cooperativo su 100 iterazioni per verificare l'assenza di sovrapposizioni tra studenti inseriti nell'elenco delle esclusioni.

---

## 🔬 TAVOLO IV: CONTRO-AUDIT PREVENTIVO DI TERZA PARTE (Validazione del Piano)

Il **Super-Auditer d'Istituto** ha esaminato il presente piano operativo di attuazione per valutarne la tenuta reale, sollevando tre criticità metodologiche ed architetturali:

### Criticità 1: Il Paradosso del Calcolo del "Buffer Coefficient"
*   **L'Assunzione del Piano**: *"L'impiego di un moltiplicatore di tolleranza temporale permette di prevedere e compensare i rallentamenti del calendario reale."*
*   **L'Analisi Critica dell'Auditer**: Un moltiplicatore fisso (es. `1.2` su scala annuale) presuppone che le interruzioni didattiche siano distribuite in modo uniforme durante l'anno scolastico. Nella realtà didattica, tuttavia, le interruzioni sono concentrate in periodi specifici (es. dicembre per le festività natalizie, aprile per quelle pasquali, maggio per le gite scolastiche o le prove INVALSI). 
    *   *La Conseguenza*: Nel secondo quadrimestre, il Gantt mostrerà una **deriva temporale significativa**, rendendo il cronoprogramma visivo parzialmente disallineato rispetto alla reale andatura d'aula.
    *   *La Raccomandazione*: Lo store deve consentire l'applicazione di **moltiplicatori di tolleranza differenziati per quadrimestre (Seasonal Buffer Coefficients)** (es. `1.1` nel primo trimestre e `1.3` nel secondo quadrimestre) per rispecchiare fedelmente la fisiologia scolastica reale.

### Criticità 2: Vulnerabilità e Falsi Positivi delle "Esclusioni Relazionali"
*   **L'Assunzione del Piano**: *"L'inserimento di hard constraints relazionali impedisce all'algoritmo cooperativo di unire studenti in conflitto nello stesso gruppo."*
*   **L'Analisi Critica dell'Auditer**: L'introduzione di regole di esclusione rigide è soggetta alla **fallacia del vicolo cieco (deadlock algoritmico)**. In classi con elevato tasso di conflittualità o con un numero ridotto di alunni, se il docente inserisce troppe coppie di esclusione, l'algoritmo andrà in blocco, trovandosi nell'impossibilità matematica di formare isole di lavoro eterogenee.
    *   *La Conseguenza*: Il blocco dell'applicazione o il blocco di esecuzione del codice React durante la spiegazione sulla LIM davanti agli studenti.
    *   *La Correzione*: L'algoritmo deve trattare le esclusioni come **vincoli morbidi (Soft Constraints / Penalty Weights)**. In caso di impossibilità di risoluzione entro 100 iterazioni, il sistema deve ignorare la penalità di minor rilievo, generare comunque i gruppi cooperativi e mostrare al docente un messaggio di avviso discreto: *"⚠️ Swarm d'Esperti: Generazione completata con 1 vincolo relazionale non risolvibile. Regola manualmente con il mouse"*.

### Criticità 3: Limiti di Capacità della Memoria Sicura Temporanea (IndexedDB)
*   **L'Assunzione del Piano**: *"Tutti i dati storici d'aula, i registri e le UDA sono protetti all'interno della memoria IndexedDB del browser locale."*
*   **L'Analisi Critica dell'Auditer**: Sebbene IndexedDB garantisca una capacità di memorizzazione significativamente superiore a quella del localStorage (fino al 50% dello spazio libero su disco), essa rimane soggetta alla **politica di pulizia aggressiva del browser (Storage Eviction)**. Su dispositivi scolastici con spazio su disco ridotto o in caso di inattività prolungata del browser, i sistemi operativi moderni (specialmente iOS/Safari e sistemi ChromeOS) eliminano automaticamente i dati delle applicazioni non utilizzate di recente per liberare spazio.
    *   *La Conseguenza*: Il docente potrebbe trovarsi a settembre 2027 con l'**azzeramento totale delle programmazioni e del registro d'aula dell'anno precedente**, senza alcuna possibilità di recupero.
    *   *La Correzione*: È imperativo rendere **obbligatorio e automatizzato il backup locale sincrono** in formato aperto `.json` o il salvataggio automatico sul Google Drive d'Istituto del docente ad ogni chiusura della sessione d'aula.

---

## ⚖️ GLOSSARIO E DE-GERGONIZZAZIONE OBBLIGATORIA D'ISTITUTO

In conformità alle direttive di usabilità e semplificazione della Pubblica Amministrazione, l'intero team di sviluppo e manutenzione ha l'obbligo tassativo di utilizzare esclusivamente la terminologia scolastica italiana autorizzata, sopprimendo qualsiasi espressione gergale informatica sia nei codici che nei manuali:

*   *Backup / Cloud Save* ➔ **Copia di Sicurezza d'Istituto**
*   *Restore / Database Import* ➔ **Ripristina da Copia di Sicurezza**
*   *Clear LocalStorage / Reset DB* ➔ **Azzera Memoria d'Istituto**
*   *SCORM Package ZIP* ➔ **Lezione Interattiva d'Istituto (LIM / E-learning)**
*   *IndexedDB / Session Storage* ➔ **Memoria Sicura Temporanea del Browser**
*   *JSON Schema / State contract* ➔ **Modello di Programmazione d'Istituto**
*   *Database / Data KB* ➔ **Banca Dati Didattica d'Istituto**
*   *Task / Seating Chart* ➔ **Mappa Spaziale dei Banchi**

---

## 🏛️ CONCLUSIONI E PROTOCOLLO DI RILASCIO

Il presente **Piano Operativo di Attuazione** è approvato senza riserve dalla Commissione Congiunta d'Istituto. Tutte le raccomandazioni e le correzioni sollevate dal Super-Auditer d'Istituto ( Seasonal Buffer Coefficients, Soft Constraints per l'algoritmo e Backup Sincrono preventivo) vengono recepite ed integrate stabilmente all'interno delle specifiche esecutive della fase di sviluppo.

---
*Piano operativo d'aula approvato e depositato per la fase di sviluppo.*  
**I.C. Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*La Commissione d'Istituto per l'Innovazione Tecnologica ed Eradicazione della Complessità*  
**Il Comitato Tecnico-Pedagogico di Validazione Terza**  
*Ariano Irpino, 16 Luglio 2026*  
*(Sottoscritto con firma digitale certificata dal Dirigente Scolastico)*  
*Codice di Rilascio: MILANI-AULA-PIANO-OPERATIVO-50*
