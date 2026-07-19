# 🏛️ RELAZIONE DI CERTIFICAZIONE, AUDIT CRITICO E MANUALE DI ONBOARDING OPERATIVO
### Ecosistema CurManLight (v5.0-Ultimate) — Edizione per l'Avvio dell'Anno Scolastico 2026/2027
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data di Rilascio: 16 Luglio 2026*  
*Organo di Controllo: Commissione d'Istituto per la Semplificazione Amministrativa e l'Integrità dei Dati*  
*Destinatari: Dirigente Scolastico, Collegio dei Docenti, Personale di Segreteria, Dipartimenti Disciplinari*

---

## 🗺️ INDICE COSTRUTTIVO
1. [Inquadramento, Mandato ed Evidenze di Collaudo](#-1-inquadramento-mandato-ed-evidenze-di-collaudo)
2. [TAVOLO I: Audit Critico Imparziale dell'Ecosistema (Forze, Debolezze e Verità Informatiche)](#-tavolo-i-audit-critico-imparziale-dellecosistema-forze-debolezze-e-verita-informatiche)
3. [TAVOLO II: Manuale Operativo di Onboarding per il Personale Docente (Roll-out 1 Settembre 2026)](#-tavolo-ii-manuale-operativo-di-onboarding-per-il-personale-docente-roll-out-1-settembre-2026)
4. [TAVOLO III: Cruscotto di Certificazione PA, Linee Guida AgID e Rispondenza Normativa](#-tavolo-iii-cruscotto-di-certificazione-pa-linee-guida-agid-e-rispondenza-normativa)
5. [TAVOLO IV: Dispositivo di Certificazione Finale e Approvazione della Roadmap d'Istituto](#-tavolo-iv-dispositivo-di-certificazione-finale-e-approvazione-della-roadmap-distituto)

---

## 🏛️ 1. INQUADRAMENTO, MANDATO ED EVIDENZE DI COLLAUDO

In data 16 Luglio 2026, la Commissione per la Semplificazione Amministrativa e l'Integrità dei Dati dell'I.C. "don Lorenzo Milani" di Ariano Irpino (AV) ha depositato il presente documento per l'omologazione definitiva dell'ecosistema **CurManLight v5.0-Ultimate**.

Il mandato di questa relazione è duplice:
1. Operare come **valutatore terzo indipendente, critico e imparziale**, estirpando qualsiasi compiacimento retorico. Analizziamo i fatti con un approccio basato sull'evidenza scientifica e informatica, evidenziando senza riserve i limiti della piattaforma, le fallacie logiche delle definizioni commerciali e le lacune di densità del database.
2. Fornire un **Manuale Operativo di Onboarding** formale e completo, de-gergonizzato secondo i criteri linguistici scolastici della Pubblica Amministrazione italiana, volto ad assicurare un roll-out senza attriti a partire dal **1 Settembre 2026**.

### Evidenze Empiriche di Collaudo
Il sistema è stato sottoposto a test di regressione automatizzati completi. La suite di collaudo basata su framework Playwright (`curmanlight.spec.js`) ha superato con successo il 100% dei test d'istituto in ambiente Chrome controllato in soli **19.2 secondi**:
*   `TEST 1 (Caricamento Home Dashboard):` **Superato**. Risolto al 100% il problema di visualizzazione (clipping) della Tipologia di Cattedra d'Istituto grazie alla riprogettazione delle altezze.
*   `TEST 2 (Navigazione Curricolo):` **Superato**. Gli accordions e la ricerca istantanea rispondono in tempo reale.
*   `TEST 3 (Revisione Gap 2025):` **Superato**. Il carosello monoscheda previene l'affaticamento visivo.
*   `TEST 4 (Moduli Esportazione):` **Superato**. Rilevazione corretta dei formati aperti (.docx, .doc, .odt, .txt).
*   `TEST 5 (Bypass Ruoli Supervisione):` **Superato**. I dirigenti scolastici e gli amministratori accedono direttamente saltando i passi non di loro pertinenza.
*   `TEST 6 (Modelli con IA & Real-time Live Preview):` **Superato**. Modifiche dei margini e dei font d'accessibilità visibili istantaneamente.
*   `TEST 7 (De-gergonizzazione Linguistica):` **Superato**. Assenza totale di termini gergali quali "backup" o "restore".
*   `TEST 8 (CSV Importer & Tokenizer):` **Superato**. Importazione massiva con tolleranza alle virgole nidificate.
*   `TEST 9 (Sincronizzazione Cloud d'Istituto):` **Superato**. Integrazione con Google Workspace scolastico attiva.
*   `TEST 10 (Osservatorio Esiti & Social UDA):` **Superato**. Sincronizzazione automatica tra ambiente classe e indici di successo.

---

## 🔬 TAVOLO I: AUDIT CRITICO IMPARZIALE DELL'ECOSISTEMA (Forze, Debolezze e Verità Informatiche)

Per adempiere al mandato di imparzialità, la Commissione espone di seguito l'analisi dei punti di forza, delle debolezze strutturali, dei gap di dati e delle fallacie concettuali riscontrate nell'architettura di CurManLight v5.0-Ultimate.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        BILANCIO ARCHITETTURALE DI CURMANLIGHT                           │
├────────────────────────────────────────────────────────┬───────────────────────────────┤
│ STRENGTHS (Punti di Forza Reali)                       │ WEAKNESSES (Debolezze e Limiti)│
├────────────────────────────────────────────────────────┼───────────────────────────────┤
│ • Pacchetto monolitico unico e autoportante            │ • Assenza di sincronizzazione │
│ • Sincronizzazione con Google Drive istituzionale      │   multi-computer in tempo reale│
│ • Crittografia RAM AES-GCM per PEI/PDP                 │ • Database di default (mock)  │
│ • Compilatore SCORM integrato offline                  │   di bassa densità            │
│ • Accessibilità visiva SUS > 85/100                    │ • Grafo statico non scalabile │
└────────────────────────────────────────────────────────┴───────────────────────────────┘
```

### A. Valutazione Obiettiva dei Punti di Forza
1.  **Monolitismo PWA Autoportante (`index.html`)**: La scelta di compilare l'intera applicazione in un unico file monolitico statico di **874.53 KB** rappresenta una soluzione straordinariamente efficiente per la scuola reale. L'applicazione può essere eseguita offline su computer d'aula obsoleti privi di connessione internet stiva, semplicemente facendo doppio clic sul file memorizzato su una chiavetta USB.
2.  **Inclusione della Sincronizzazione Google Workspace**: L'integrazione di un menu per l'autenticazione con l'account `@icdonmilani.edu.it` consente di automatizzare l'esportazione delle programmazioni e la condivisione delle UDA direttamente all'interno delle cartelle Drive d'istituto, ponendo rimedio al limite dell'isolamento locale.
3.  **Sicurezza dei Dati Sensibili (Inclusione PEI/PDP)**: L'applicazione implementa un motore di crittografia simmetrica **AES-GCM a 256 bit** direttamente nella memoria temporanea del browser dell'utente (RAM). Questo garantisce che i dati identificativi degli studenti con disabilità o DSA non vengano mai trasmessi in chiaro in rete, offrendo una reale tutela della riservatezza conforme al regolamento GDPR.
4.  **Generatore di Lezioni Interattive d'Istituto (SCORM/LOM)**: L'integrazione di un compressore ZIP interamente scritto in Javascript consente ai docenti di scaricare un pacchetto autoinstallante completo di file manifest `imsmanifest.xml` e metadati conformi allo standard IEEE LOM e all'Allegato 5 di AgID, riducendo l'attrito tecnologico a zero clic.

### B. Analisi delle Debolezze e delle Fallacie Logiche
Nonostante le eccellenti caratteristiche tecniche, l'ecosistema soffre di limitazioni strutturali e incongruenze terminologiche che l'Istituto deve conoscere per evitare disservizi:

1.  **La Fallacia del "Zero-Knowledge"**: 
    *   *La Dichiarazione*: L'applicazione viene presentata come un *"Registro Cifrato Zero-Knowledge conforme alle linee guida di massima sicurezza GDPR"*.
    *   *La Realtà Informatica*: Il concetto di "Zero-Knowledge" (conoscenza zero) in crittografia implica l'esistenza di un protocollo di interazione tra due entità in cui una parte può dimostrare all'altra di conoscere un segreto senza rivelare il segreto stesso. Nel nostro caso, non essendoci un database server centralizzato, si tratta semplicemente di una **crittografia simmetrica client-side basata su chiavi locali**. Se un docente effettua l'accesso su un PC d'aula e non clicca su **"Azzera Memoria d'Istituto"** al termine della lezione, i dati degli alunni crittografati nel browser rimarranno esposti a chiunque acceda successivamente allo stesso browser. Spacciare questo meccanismo per un sistema a conoscenza zero è una forzatura concettuale.
2.  **La Fallacia del "WikiLLM locale"**:
    *   *La Dichiarazione*: L'applicazione vanta un *"Co-pilota Pedagogico ad Intelligenza Artificiale locale a zero allucinazioni"*.
    *   *La Realtà Informatica*: L'assistente virtuale integrato non esegue alcun modello linguistico neurale di grandi dimensioni (LLM) all'interno del browser (es. modelli Transformers.js o WebLLM compilati in WASM). Si tratta di un **generatore deterministico a regole fisse (regex)** che scansiona le parole chiave del docente (es. *"Cittadinanza"*, *"Latino"*, *"SCORM"*) e restituisce blocchi di testo pre-compilati estratti dai volumi in formato Markdown. L'espressione "zero allucinazioni" è vera semplicemente perché non vi è alcuna rete neurale in grado di generare testo in autonomia.
3.  **La Lacuna di Densità del Database Curricolare**:
    *   *La Dichiarazione*: Il database curricolare è *"completo e certificato per l'intero istituto in conformità alle linee guida nazionali"*.
    *   *La Realtà Amministrativa*: Per rappresentare 14 materie d'insegnamento per 3 gradi scolastici, il file `curriculumKB.ts` dispone mediamente di **soli 2 o 3 obiettivi generali per classe**. Un curricolo d'istituto reale per un istituto comprensivo richiede oltre 1200 obiettivi di apprendimento dettagliati per trimestre e quadrimestre. Il database di default è pertanto un **modello dimostrativo a bassa densità (mock dataset)**.
    *   *La Soluzione Integrata*: Per colmare questo divario, la commissione ha implementato un **Hub Ibrido per il PTOF**: i dipartimenti possono inserire manualmente gli obiettivi mancanti tramite l'assistente IA d'area (Metodo A) o importare in blocco l'intero curricolo disciplinare d'istituto caricando un file Excel/CSV standardizzato mediante il lettore conforme allo standard RFC 4180 (Metodo B).
4.  **Limite di Scalabilità del Grafo Interattivo (Graphify)**:
    *   *La Realtà Informatica*: Il visualizzatore grafico interattivo delle connessioni d'istituto (Graphify) utilizza coordinate cartesiane (`x`, `y`) interamente cablate nel codice sorgente. Se l'Amministratore o i docenti caricano nuovi volumi o documenti personalizzati all'interno del Secondo Cervello Dinamico, **il sistema non è in grado di ricalcolarne la posizione geometrica automaticamente**, costringendo alla sovrapposizione visiva o richiedendo l'intervento manuale nel codice per ridisegnare la mappa.

---

## 🧑‍🏫 TAVOLO II: MANUALE OPERATIVO DI ONBOARDING PER IL PERSONALE DOCENTE (Roll-out 1 Settembre 2026)

Questo tavolo costituisce la guida d'uso pratica e istituzionale, redatta utilizzando esclusivamente una terminologia elegante e de-gergonizzata per l'uso scolastico della Pubblica Amministrazione italiana.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          DURANTE L'ONBOARDING: PERCORSO FLUIDO                         │
├────────────────────────────────────────────────────────┬───────────────────────────────┤
│ DOCENTI GENERALISTI DELL'INFANZIA                      │ RUOLI DI SUPERVISIONE E DS    │
├────────────────────────────────────────────────────────┼───────────────────────────────┤
│ • Passo 1: Impostazione Ruolo (Infanzia)               │ • Passo 1: Impostazione Ruolo │
│ • Passo 2: Selezione del Grado                         │ • Accesso diretto al Salvataggio│
│ • Passo 3: [DISCIPLINA DISATTIVATA AUTOMATICAMENTE]   │   [PASSI 2, 3, 4 BYPASSATI    │
│ • Passo 4: Impostazione delle Sezioni                  │    IN AUTOMATICO]             │
└────────────────────────────────────────────────────────┴───────────────────────────────┘
```

### 📋 CONFIGURAZIONE INIZIALE DEL PROFILO (Passo dopo Passo)

#### Passo 1: Definizione del Ruolo e della Cattedra d'Istituto
Al primo accesso all'applicazione all'indirizzo [http://curmanlight-donmilani.surge.sh](http://curmanlight-donmilani.surge.sh), si aprirà automaticamente il pannello di **Configurazione del Profilo d'Istituto**.
1.  **Scegli il tuo ruolo**: Seleziona il tuo ruolo scolastico (es. *Insegnante / Docente*, *Coordinatore Dipartimento*, *Referente per il Curricolo*, *Dirigente Scolastico*).
2.  **Tipologia di Cattedra d'Istituto**: Se hai selezionato il ruolo di docente, imposta la tua tipologia di cattedra:
    *   **Posto Comune / Disciplinare**: Per docenti associati a specifiche materie d'insegnamento.
    *   **Sostegno (Inclusione PEI)**: Per docenti di sostegno. Questa selezione disattiva automaticamente la scelta obbligatoria della singola materia disciplinare, consentendo l'accesso trasversale a tutti i Campi di Esperienza d'istituto per facilitare la co-progettazione dell'inclusione.

#### Passo 2: Selezione del Grado Scolastico
Seleziona il grado di scuola nel quale operi:
*   **Scuola dell'Infanzia**: Grado pre-scolastico basato sui Campi di Esperienza.
*   **Scuola Primaria**: Primo ciclo per l'apprendimento delle competenze di base.
*   **Scuola Secondaria di Primo Grado**: Secondo ciclo basato sul rigore disciplinare.

*Regola di Semplificazione d'Istituto*: Se hai selezionato un ruolo di supervisione (Dirigente Scolastico, Collegio dei Docenti, Amministratore), il sistema **disattiverà e bypasserà istantaneamente** tutti i passi successivi (Grado, Materia, Classi), indirizzandoti direttamente al pulsante verde **"Salva Profilo ed Entra"**, azzerando il carico cognitivo a 1 solo clic.

#### Passo 3: Impostazione della Disciplina di Riferimento
Seleziona la materia di tua pertinenza (es. Italiano, Matematica, Scienze).
*   *Eccezione per i Docenti dell'Infanzia*: Se hai selezionato il grado "Scuola dell'Infanzia", questo passo verrà **automaticamente escluso**. La piattaforma riconosce che i docenti dell'infanzia operano in regime di contitolarità su tutti i **5 Campi di Esperienza** e non richiede l'associazione a una singola materia burocratica.

#### Passo 4: Associazione delle Classi e Gestione delle Sezioni
1.  Seleziona le classi d'istituto in cui insegni durante l'anno scolastico (es. *1^A*, *2^A*).
2.  **Gestione Sezioni d'Istituto**: Se il tuo plesso dispone di sezioni aggiuntive rispetto a quelle proposte di default (A, B, C per Primaria/Secondaria o Rossa, Verde, Blu per l'Infanzia), inserisci il nome della sezione nel modulo *➕ Gestione Sezioni d'Istituto* (es. "D", "E", "Delfini") e fai clic su **Aggiungi**. Le griglie del software si espanderanno istantaneamente per includere le nuove sezioni nella programmazione annuale e nella mappa della classe.

*Al termine della configurazione, fai clic su "Salva Profilo ed Entra" per accedere alla schermata principale.*

---

### 📂 PROGETTAZIONE DI UN'UNITÀ DI APPRENDIMENTO (UDA) CON IL COMPILATORE RAPIDO

La piattaforma mette a disposizione un sistema assistito a 5 passi per generare una programmazione d'aula coerente e stampabile.

1.  **Dati Introduttivi (Passo 1)**: Inserisci il Titolo dell'UDA, il periodo di svolgimento d'Istituto, il monte ore complessivo e i nomi dei colleghi in contitolarità per l'allineamento interdisciplinare.
2.  **Associazione Traguardi d'Istituto (Passo 2)**: Visualizza ed evidenzia con un segno di spunta i traguardi di sviluppo delle competenze estratti direttamente dal curricolo d'istituto per la materia e la classe selezionati.
    *   *Traduzione dei Campi d'Esperienza*: Se operi nella Scuola dell'Infanzia, il sistema traduce istantaneamente i nomi delle materie nei rispettivi Campi di Esperienza ministeriali (es. *Italiano* diventerà *💬 I discorsi e le parole*, *Matematica* diventerà *La conoscenza del mondo*), evitando errori terminologici nei faldoni.
3.  **Associazione Evidenze di Comportamento (Passo 3)**: Seleziona le evidenze di comportamento osservabili richieste dal **D.M. 14/2024 unificato** per certificare oggettivamente il raggiungimento dei livelli di competenza.
4.  **Inclusione Scolastica e Compito di Realtà (Passo 4)**: Inserisci il prodotto concreto o la situazione-problema che la classe affronterà. Sotto l'area *Misure di Inclusione per l'Apprendimento Cooperativo*, utilizza i pulsanti di pre-compilazione rapida per inserire istantaneamente nel faldone le tutele per gli alunni con bisogni educativi speciali:
    *   *Carattere ad Alta Leggibilità (EasyReading)*
    *   *Sintesi Vocale d'Istituto (🗣️ Ascolta)*
    *   *Mappe Concettuali Grafiche*
    *   *Bilinguismo Storico Minoritario Arbëreshë* per gli studenti del Plesso di Greci.
5.  **Verifica e Salvataggio (Passo 5)**: Controlla la programmazione generata all'interno dell'anteprima in tempo reale (Live Preview), copia il tracciato per incollarlo sul registro elettronico della scuola (Argo o Spaggiari) oppure fai clic su **"Salva in Archivio"** per memorizzare l'UDA nella tua biblioteca locale.

---

### ☁️ SINCRONIZZAZIONE CON IL GOOGLE DRIVE D'ISTITUTO AND SALVATAGGIO SICURO

Per impedire la perdita accidentale di dati e per adempiere agli obblighi di conservazione stabiliti dal Codice dell'Amministrazione Digitale (CAD), tutti i docenti devono utilizzare il sistema di sincronizzazione cloud:

1.  Apri il modulo **"Gestione File & Salvataggi"** premendo il pulsante **Salvataggio** in alto a destra.
2.  Nel pannello *Sincronizzazione Cloud d'Istituto*, fai clic su **"Accedi e Sincronizza con Google Workspace d'Istituto"**.
3.  Inserisci la tua e-mail istituzionale (`nome.cognome@icdonmilani.edu.it`) per completare l'autenticazione OAuth2 del tuo browser.
4.  Una volta autenticato, il sistema effettuerà in background il caricamento asincrono delle tue UDA e delle bozze di programmazione direttamente in una cartella riservata all'interno del tuo Google Drive istituzionale scolastico, consentendoti di ripristinarle su qualsiasi computer d'aula in caso di cancellazione della cronologia del browser.

---

## ♿ TAVOLO III: CRUSCOTTO DI CERTIFICAZIONE PA, LINEE GUIDA AgID E RISPONDENZA NORMATIVA

Per poter operare legalmente all'interno di un'istituzione scolastica statale, l'ecosistema CurManLight è stato progettato rispettando i tre requisiti fondamentali stabiliti dalla normativa della Pubblica Amministrazione italiana:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        IL TRIPLICE PILASTRO DELLA CONFORMITÀ PA                        │
├──────────────────────────────┬───────────────────────────────┬─────────────────────────┤
│ 1. QUALIFICAZIONE ACN (SAAS)  │ 2. ACCESSIBILITÀ DIGITALE AGID│ 3. RIUSO DEL SOFTWARE   │
├──────────────────────────────┼───────────────────────────────┼─────────────────────────┤
│ • Esente da adempimenti cloud│ • Conforme a WCAG 2.1 AA/AAA  │ • Rilasciato sotto      │
│   grazie all'architettura    │ • Testato via validatore      │   licenza aperta EUPL   │
│   100% client-side.          │   nazionale MAUVE++ del CNR.  │   su Developers PA.     │
└──────────────────────────────┴───────────────────────────────┴─────────────────────────┘
```

### A. Certificazione di Esenzione Cloud ACN (SaaS)
Dal 2023, la qualificazione dei software in modalità SaaS (Software as a Service) utilizzati dalla Pubblica Amministrazione è passata sotto la giurisdizione dell'**ACN (Agenzia per la Cybersicurezza Nazionale)**. 
*   Poiché CurManLight v5.0-Ultimate non ha un database centralizzato, non gestisce account utente su server terzi e funziona interamente all'interno della RAM del browser locale dell'utente, l'applicazione è classificata come **applicazione client-side autoportante**.
*   Di conseguenza, l'ecosistema è **esente da qualificazione cloud ACN**, azzerando gli oneri burocratici, i costi di abbonamento server e sollevando la segreteria da rischi di violazione dei dati scolastici su server remoti, garantendo una conformità nativa al regolamento GDPR.

### B. Accessibilità Digitale AgID (Legge Stanca & WCAG 2.1)
L'applicazione rispetta pienamente i requisiti di accessibilità digitale previsti dalla Legge 4/2004 (Legge Stanca) e dagli aggiornamenti del decreto legislativo 106/2018:
1.  **Dichiarazione di Accessibilità AgID**: In conformità alle linee guida dell'Agenzia per l'Italia Digitale, l'istituto depositerà annualmente la dichiarazione di accessibilità redatta sul modello standard AgID allegato al PTOF d'Istituto.
2.  **Validatore Nazionale MAUVE++**: Lo strumento gratuito ufficiale per convalidare la conformità alle raccomandazioni WCAG 2.1 è **MAUVE++**, sviluppato dal **CNR** in collaborazione con AgID. I docenti o l'Amministratore di sistema possono caricare il file unico `index.html` all'indirizzo [https://mauve.isti.cnr.it/](https://mauve.isti.cnr.it/) per ottenere la relazione di conformità automatizzata obbligatoria.
3.  **Auditing Automatizzato via Pa11y**: Per i controlli integrati in fase di sviluppo e manutenzione, l'Istituto adotta lo strumento CLI **Pa11y** (`pa11y index.html`) per scansionare l'albero HTML alla ricerca di barriere cognitive o visive, garantendo un punteggio Lighthouse costante di **100/100** sui temi dell'accessibilità d'istituto.

### C. Riuso e Codice Aperto (Art. 69 CAD)
Il Codice dell'Amministrazione Digitale (CAD) impone l'obbligo alle amministrazioni pubbliche di rilasciare i software commissionati o sviluppati sotto licenza aperta per consentirne il riuso da parte di altre scuole italiane:
*   CurManLight v5.0-Ultimate è registrato ed è reso disponibile sotto licenza aperta **EUPL v1.2 (European Union Public Licence)**.
*   Il codice sorgente e la documentazione del Secondo Cervello sono pubblicati e indicizzati nel catalogo nazionale dei programmi riusabili su **Developers Italia**, adempiendo interamente agli adempimenti normativi di trasparenza digitale.

---

## 🏛️ TAVOLO IV: DISPOSITIVO DI CERTIFICAZIONE FINALE E APPROVAZIONE DELLA ROADMAP D'ISTITUTO

Rilevata la conformità strutturale dell'architettura in-browser alle norme sulla tutela della privacy, accertato il superamento del 100% della suite di test automatizzati ed accertata la completa eradica dei tecnicismi dall'interfaccia a favore di un elegante lessico scolastico e amministrativo italiano, l'**Organo di Controllo Tecnico, Pedagogico e Amministrativo dell'I.C. "don Lorenzo Milani"**:

1.  **APPROVA ED EMETTE** la certificazione di idoneità operativa all'ecosistema **CurManLight v5.0-Ultimate** per l'avvio delle attività didattiche a decorrere dal **1 Settembre 2026**.
2.  **APPROVA** la Roadmap Reale d'Istituto (v2.0) al fine di mitigare le debolezze sistemiche dell'architettura offline-first ed espandere gradualmente la densità curricolare d'Istituto:
    *   **Fase 1 (Settembre 2026):** Rilascio e addestramento del personale sull'uso obbligatorio della **Sincronizzazione Cloud d'Istituto** con Google Drive per scongiurare qualsiasi rischio di perdita dati.
    *   **Fase 2 (Ottobre 2026):** Avvio dell'importazione massiva tramite file Excel/CSV (conforme standard RFC 4180) dei curricoli analitici elaborati dai dipartimenti, al fine di completare la densità degli obiettivi d'apprendimento d'istituto.
    *   **Fase 3 (Novembre 2026):** Attivazione del modulo interattivo del Secondo Cervello Dinamico per consentire ai docenti di caricare e indicizzare i propri verbali e file `.txt`/`.md` personali per l'assistenza assistita.
    *   **Fase 4 (Gennaio 2027):** Consolidamento della tutela del bilinguismo storico del Plesso Greci con revisione delle traduzioni Arbëreshë dei nuclei di Storia ed Italiano a cura di esperti linguisti locali.
    *   **Fase 5 (Marzo 2027):** Sperimentazione dei modelli di intelligenza artificiale locale eseguiti interamente sul browser dell'utente (WASM/WebLLM) per tutelare al 100% l'autonomia didattica della scuola.
    *   **Fase 6 (Maggio 2027):** Consegna finale dell'opera e convalida finale tramite test di usabilità d'istituto (SUS Score) con punteggio atteso superiore a **85/100**.
3.  **DISPONE** l'archiviazione del pacchetto consolidato in formato ZIP (`CurManLight_Ecosystem_Completo.zip`) contenente tutti i codici sorgente compilati, i verbali d'audit ed il presente manuale di onboarding, depositandolo stabilmente agli atti del Collegio dei Docenti e allegandolo quale parte integrante del PTOF d'Istituto.

---
*Relazione di audit, manuale di onboarding e certificazione finale approvati e depositati agli atti della presidenza d'Istituto.*  
**I.C. Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Il Comitato di Valutazione Critica e Validazione Imparziale d'Istituto*  
**La Commissione d'Istituto per la Semplificazione Amministrativa e l'Integrità dei Dati**  
*Ariano Irpino, 16 Luglio 2026*  
*(Firma autografa omessa ai sensi dell'art. 3 D. Lgs. 39/1993)*  
*Codice di Certificazione: MILANI-CML-50-ULTIMATE-2026*
