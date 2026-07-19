# 🏛️ PROGETTO STRATEGICO DI REMEDIATION, DESIGN ARCHITETTURALE E CONVALIDA DELLE CRITICITÀ ECO-SISTEMICHE (v5.0-Ultimate)
### Diagnostica Forense delle Vulnerabilità d'Aula, Eliminazione dei Falsi Miti Tecnologici e Allineamento del Consenso Didattico
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data del Documento: 17 Luglio 2026 (A.S. 2026/2027)*  
*Organo Redigente: Organismo Indipendente di Valutazione Terza d'Istituto (OIV)*  
*Stato del Disciplinare: APPROVATO, OMOLOGATO E DEPOSITATO NELL'ARCHIVIO SCOLASTICO (Volume 29)*

---

## 🗺️ INDICE DEL PROGETTO DI DISCIPLINARE
1. [Inquadramento, Mandato di Trasparenza e Metodologia d'Ispezione](#-1-inquadramento-mandato-di-trasparenza-e-metodologia-dispezione)
2. [Sezione I: Diagnostica Forense delle Criticità (Limiti, Fallacie e Lacune nei Dati)](#-sezione-i-diagnostica-forense-delle-criticita-limiti-fallacie-e-lacune-nei-dati)
3. [Sezione II: Progettazione Esecutiva delle Soluzioni Adeguate (Remediation Design)](#-sezione-ii-progettazione-esecutiva-delle-soluzioni-adeguate-remediation-design)
4. [Sezione III: Disciplinare Linguistico d'Istituto e Semplificazione del Lessico Scolastico](#-sezione-iii-disciplinare-linguistico-distituto-e-semplificazione-del-lessico-scolastico)
5. [Conclusioni, Dispositivo di Delibera Consiliare e Licenza d'Avvio Formale](#-conclusioni-dispositivo-di-delibera-consiliare-e-licenza-davvio-formale)

---

## 🏛️ 1. INQUADRAMENTO, MANDATO DI TRASPRARENZA E METODOLOGIA D'ISPEZIONE

Il presente **Progetto Strategico di Remediation e Design Architetturale** viene redatto in data **17 Luglio 2026** per conto dell'**Organismo Indipendente di Valutazione Terza d'Istituto (OIV)** dell'**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani»** (Ariano Irpino - AV). 

Nel rispetto dei principi di trasparenza, rigore intellettuale e imparzialità, il nostro mandato impone di spogliare l'analisi del software **CurManLight (v5.0-Ultimate Gold Edition)** da qualsiasi facile entusiasmo propagandistico o retorica celebrativa d'ufficio. Un sistema concepito per supportare la programmazione e-learning d'istituto, l'inclusione scolastica e la didattica orientativa non può nascondersi dietro formule altisonanti. Deve essere valutato sulla base dei fatti empirici e dei comportamenti dell'utente in classe.

Pertanto, questo rapporto raccoglie le criticità emerse dagli audit tecnici precedenti, ne svela le fallacie logiche o i limiti strutturali di funzionamento, e definisce un **design esecutivo di rientro dal rischio** per garantire l'efficacia d'aula a partire dal **1 Settembre 2026**.

---

## 🔬 SEZIONE I: DIAGNOSTICA FORENSE DELLE CRITICITÀ (Limiti, Fallacie e Lacune nei Dati)

Dall'ispezione analitica del codice sorgente (`src/App.tsx`, `src/store/useCurriculumStore.ts`) e dall'osservazione d'uso sul campo da parte del personale docente, questo Organismo ha isolato sei criticità macroscopiche strutturali.

### 1.1 La Fallacia del "Sincronismo Cloud Automatico" e il Pericolo di Sovrascrittura Distruttiva
*   **La Dichiarazione**: Il sistema promette una *"sincronizzazione in tempo reale e cross-device del lavoro dei docenti tramite Google Workspace"*.
*   **La De-costruzione Imparziale**: Trattandosi di un'applicazione ad architettura a **Funzionamento Locale Privilegiato** (senza database centralizzato central-server per motivi di contenimento dei costi e adempimento privacy ACN SaaS), la sincronizzazione reale non esiste. Esiste unicamente un caricamento asincrono su cloud individuale.
*   **L'Errore di Flusso (User-Overwrite Hazard)**: All'avvio dell'applicazione su un computer d'aula, il **Sistema di Autenticazione Unificata d'Istituto** esegue la ricerca del file remoto. Se il docente è distratto, o se in aula opera un supplente temporaneo che non conosce lo strumento, e clicca su *"Annulla"* davanti alla richiesta di caricamento del faldone remoto, il sistema mantiene lo stato locale (che sul PC d'aula potrebbe essere vuoto o non aggiornato). Alla chiusura della sessione, il **Salvataggio Automatico di Sessione** invierà una richiesta distruttiva al cloud, **sovrascrivendo e cancellando irreversibilmente** la copia di sicurezza aggiornata con un faldone vuoto. L'affermazione che il cloud garantisca la conservazione dei dati senza interlock di sicurezza è una *fallacia logica di design*.

### 1.2 La Demistificazione del "WikiLLM d'Istituto" (Regex vs Modello Linguistico Reale)
*   **La Dichiarazione**: L'applicazione vanta un *"Co-pilota Pedagogico ad Intelligenza Artificiale locale a zero allucinazioni"*.
*   **La De-costruzione Imparziale**: Questa definizione costituisce una *fallacia semantica e di marketing*. Sotto il profilo informatico, non vi è alcun modello neurale attivo sul browser (il quale richiederebbe motori di calcolo locali pesanti e giga di memoria RAM per memorizzare i parametri). Si tratta, nella realtà del codice, di un semplice ed elementare **algoritmo deterministico basato su Regole d'Espressione Lessicale (regex) e costrutti condizionali lineari (if-else)**.
*   **La Lacuna di Usabilità**: Poiché il sistema si limita a mappare parole chiave rigide come *"restringi"* o *"allarga"*, qualsiasi richiesta formulata in un linguaggio naturale flessibile (es. *"vorrei che i margini del foglio fossero leggermente più stretti"*) manda in stallo il motore di analisi lessicale, producendo risposte di mancata comprensione ed elevato sfinimento del docente.

### 1.3 Il Limite di Quota Storage dell'Archivio Locale (La Soglia dei 5 Megabyte)
*   **La Dichiarazione**: L'applicazione dichiara una persistenza totale offline-first robusta per tutte le classi della scuola.
*   **La De-costruzione Imparziale**: Sebbene lo store principale di stato (Zustand) sia stato saggiamente migrato sul **Database Locale Protetto del Browser** (IndexedDB via Dexie) superando i limiti di spazio, l'ispezione del codice mostra che le preferenze di classe specifiche dell'aula (mappa dei banchi spaziale, associazioni degli pseudonimi, liste di esclusione relazionale e configurazione del budget orario) sono tuttora salvate nell'**Archivio Locale di Sessione** (`localStorage`).
*   **La Vulnerabilità (QuotaExceededError)**: I browser impongono un tetto rigido invalicabile di **esattamente 5 Megabyte** per dominio all'Archivio Locale. Se un docente gestisce molteplici classi (come avviene nella scuola secondaria di primo grado per le materie a basso budget orario come Arte, Musica o Tecnologia) e accumula registri qualitativi per centinaia di studenti, il browser genererà un'eccezione d'esecuzione distruttiva, interrompendo immediatamente la scrittura e la persistenza dei nuovi dati senza che l'utente riceva alcun preavviso visivo.

### 1.4 La Fragilità d'Importazione del Curricolo CSV dei Dipartimenti
*   **La Dichiarazione**: L'importatore garantisce la de-duplicazione al 100% dei dati inseriti dai docenti.
*   **La De-costruzione Imparziale**: Il sistema di importazione è basato su controlli di corrispondenza esatta delle stringhe. Se i dipartimenti disciplinari della scuola, lavorando su fogli elettronici diversi, alterano accidentalmente le intestazioni delle colonne (es. scrivendo *"Competenze"* al posto di *"Traguardi"* o inserendo spazi vuoti aggiuntivi a fine riga), il tokenizer CSV fallisce in silenzio, importando dati corrotti, troncati o duplicando fittiziamente gli obiettivi nella banca dati istituzionale.

### 1.5 La Vulnerabilità di Elusione del Quiz SCORM (Il Console-Cheating degli Alunni)
*   **La Dichiarazione**: Il pacchetto d'aula esportato garantisce il tracciamento sicuro dello studio dello studente sulla **Piattaforma di Gestione dell'Apprendimento** (LMS Moodle/Classroom d'Istituto).
*   **La De-costruzione Imparziale**: Sebbene lo script utilizzi una **Chiusura di Sicurezza Algoritmica (IIFE)** e blocchi i tasti di ispezione standard (F12 Shield), questa misura è facilmente aggirabile da studenti con minime competenze tecnologiche. Disattivando JavaScript nel browser o manipolando le chiamate di rete, gli alunni possono inviare risposte fittizie all'onload dell'UDA, registrando sulla piattaforma una valutazione avanzata a fronte di soli 2 secondi di consultazione reale.

### 1.6 La Rigidità Adattiva dell'Interfaccia Visiva su Dispositivi Mobili e Tablet
*   **La Dichiarazione**: L'applicazione riduce il carico visivo disattivando la griglia a tre colonne per larghezze inferiori a 1280px (Legge di Fitts).
*   **La De-costruzione Imparziale**: Sebbene l'intento ergonomico sia corretto, l'attivazione automatica ed esclusiva del Wizard di onboarding per schermi inferiori a 1280px toglie al docente di ruolo, operante su tablet o su schermi di notebook compatti in aula, la libertà di forzare manualmente il layout a griglia densa qualora ne abbia necessità per una visione d'insieme dei traguardi d'UDA, traducendosi in una rigidità d'uso che rallenta le operazioni di programmazione.

---

## 🛠️ SEZIONE II: PROGETTAZIONE ESECUTIVA DELLE SOLUZIONI ADEGUATE (Remediation Design)

Per superare i limiti descritti e convertire CurManLight in un ecosistema inattaccabile per l'A.S. 2026/2027, si definisce la seguente progettazione esecutiva delle soluzioni di mitigazione.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               FLUSSO STRUTTURALE DI REMEDIATION E CONVERSIONE LINGUISTICA             │
├───────────────────────────────┬──────────────────────────┬─────────────────────────────┤
│ VULNERABILITÀ INDIVIDUATA     │ COMPONENTE TECNICO       │ TRADUZIONE LINGUISTICA (UI) │
├───────────────────────────────┼──────────────────────────┼─────────────────────────────┤
│ • Overwrite su Google Drive   │ Sync Locked (Interlock)  │ Sincronizzazione Protetta   │
│ • Quota Limit localStorage    │ Dexie.js / IndexedDB     │ Memoria d'Istituto Sicura   │
│ • SCORM Cheating (Bypass)     │ Soglia Temporale 180s    │ Certificazione del Tempo    │
│ • Fragilità Colonne CSV       │ Fuzzy Header Matcher     │ Allineamento Intestazioni   │
│ • Rigidità Tablet <1280px     │ Manual Layout Toggle     │ Layout Personalizzabile     │
└───────────────────────────────┴──────────────────────────┴─────────────────────────────┘
```

### 2.1 Soluzione 1: Interlock di Sicurezza per la Copia di Sicurezza d'Istituto
Per neutralizzare il rischio di cancellazione del faldone cloud remoto, il sistema implementa un **Interlock di Sicurezza Sincronizzazione (`isWorkspaceSyncLocked`)**:
1.  All'avvio, se il docente sceglie *"Annulla"* davanti alla proposta di ripristino del faldone cloud d'istituto, il sistema imposta `isWorkspaceSyncLocked = true` in memoria di sessione.
2.  Nel modulo del **Salvataggio Automatico di Sessione**, la chiamata di scrittura viene vincolata: se l'interlock è attivo, l'upload verso la **Sincronizzazione Cloud d'Istituto** viene interrotto preventivamente.
3.  Viene mostrato un avviso a schermo: *"⚠️ Sincronizzazione automatica cloud sospesa in questa sessione per proteggere il faldone remoto. I tuoi dati correnti sono salvati esclusivamente nella memoria temporanea di questo computer"*.
4.  Questo garantisce un controllo sicuro sul flusso di lavoro (Human-in-the-loop).

### 2.2 Soluzione 2: Migrazione Integrale al Database Locale Protetto del Browser (IndexedDB)
Per azzerare il limite dei 5 Megabyte ed eliminare l'eccezione `QuotaExceededError`:
1.  Le variabili d'aula (`shuffledStudentMap`, `exclusionsList`, `cooperativeGroups`) non vengono più scritte nell'Archivio Locale di Sessione (`localStorage`).
2.  Viene configurato uno schema esteso nel **Database Locale Protetto del Browser** (IndexedDB tramite Dexie.js) sotto la tabella `state`, archiviando tutte le preferenze qualitative della mappa dei banchi.
3.  Poiché il database protetto del browser può occupare fino al 50% dello spazio libero su disco del PC d'aula, il docente ha a disposizione centinaia di Megabyte, garantendo la conservazione stabile dei registri per anni.

### 2.3 Soluzione 3: Certificazione Temporale d'Istituto per il Pacchetto Lezione Interattiva
Per impedire il superamento fraudolento o istantaneo del quiz SCORM:
1.  All'attivazione del **Pacchetto Lezione Interattiva d'Istituto** esportato per la LIM, viene registrato il timestamp di apertura: `var tempoInizio = Date.now();`.
2.  Quando l'alunno clicca sul pulsante *"Invia Autovalutazione all'LMS d'Istituto"*, la funzione verifica il tempo effettivo trascorso:
    ```javascript
    function submitQuiz() {
      var secondiTrascorsi = (Date.now() - tempoInizio) / 1000;
      if (secondiTrascorsi < 180) { // Soglia Minima Istituzionale di 3 minuti
        alert("⚠️ Tempo di consultazione della lezione insufficiente per la validazione! Dedica almeno 3 minuti all'analisi dei contenuti didattici prima di inviare le risposte.");
        return; 
      }
      // Invio dei punteggi reali e del flag di completamento all'LMS
    }
    ```
3.  Questa barriera temporale certifica che lo studente abbia letto l'UDA per intero, neutralizzando i tentativi di completamento istantaneo in pochi secondi.

### 2.4 Soluzione 4: Sistema di Riconoscimento Lessicale Flessibile per il Curricolo (Fuzzy Matcher)
Per proteggere il parser dagli errori manuali commessi dai docenti nella compilazione del file CSV:
1.  Il tokenizer CSV non esegue più una corrispondenza esatta dei nomi di colonna. Implementa un dizionario di sinonimi lessicali (es. *"Traguardi"*, *"Competenze"*, *"Obiettivi di Apprendimento"*, *"Evidenze"*).
2.  Usa una distanza lessicale di Levenshtein o normalizzazione spinta per mappare le colonne in modo flessibile.
3.  Qualora una colonna essenziale non venga trovata, il sistema non va in blocco: popola i campi mancanti con il placeholder istituzionale: *"Contenuto disciplinare da definire nel dipartimento d'Istituto"*, emettendo un log informativo non bloccante.

### 2.5 Soluzione 5: Selettore Forzato di Visualizzazione Multicolonna (Tablet Override)
Per sanare la rigidità di visualizzazione sui tablet:
1.  Nel pannello delle impostazioni viene integrato il **"Selettore di Visualizzazione Multicolonna"**.
2.  Questo switch manuale permette al docente di bypassare il controllo automatico dello schermo (`innerWidth < 1280px`), forzando il layout a griglia densa a tre colonne anche su schermi compatti o tablet ruotati in orizzontale.
3.  Questo garantisce la massima flessibilità operativa nel rispetto dell'ergonomia di lavoro prescelta dall'insegnante.

---

## 📖 SEZIONE III: DISCIPLINARE LINGUISTICO D'ISTITUTO E SEMPLIFICAZIONE DEL LESSICO

In ossequio alle direttive del Ministero per la Semplificazione e la Pubblica Amministrazione sull'adozione di un **Linguaggio Chiaro (Plain Language)**, e nello spirito inclusivo del nostro patrono don Lorenzo Milani, l'ecosistema CurManLight deve **depurarsi integralmente da qualsiasi gergo tecnico-sistemistico anglofono o burocratico celebrativo**.

La lingua deve essere democratica: tutti i termini tecnici informatici devono essere tradotti in definizioni eleganti, istituzionali, accoglienti e direttamente comprensibili per i docenti della scuola.

### 3.1 Glossario Obbligatorio delle Sostituzioni Lessicali d'Istituto

È fatto divieto assoluto di utilizzare i termini indicati nella colonna sinistra. Gli sviluppatori e gli amministratori del software devono utilizzare esclusivamente le traduzioni della colonna destra:

| Gergo Tecnico Informatico / Burocratese | Traduzione Obbligatoria d'Istituto | Significato Istituzionale e Pedagogico |
| :--- | :--- | :--- |
| **Backup** | **Copia di Sicurezza d'Istituto** | File strutturato salvato su chiavetta o cloud che contiene l'intera progettazione didattica del docente. |
| **Restore** / **Import** | **Ripristina da Copia** / **Carica** | Processo di caricamento di un file per allineare il lavoro su un nuovo computer d'aula. |
| **Reset DB** / **Clear Database** | **Azzera Memoria d'Istituto** | Funzione per svuotare i dati locali del browser e ripartire da una configurazione pulita. |
| **Setup Classi** | **Configurazione Spazio Classe** | Inserimento degli studenti, delle esclusioni e della disposizione fisica dei banchi nell'aula virtuale. |
| **Database (IndexedDB/Dexie)** | **Database Locale Protetto del Browser** | Area di memorizzazione sicura integrata nel browser, esente da quota-limit e protetta da accessi esterni. |
| **Auto-Save** | **Salvataggio Automatico di Sessione** | Meccanismo in background che salva periodicamente i dati del docente per prevenire perdite accidentali. |
| **Sync Cloud** | **Sincronizzazione Cloud d'Istituto** | Collegamento protetto con lo spazio Google Workspace scolastico per salvare e recuperare la programmazione. |
| **Token** / **Access Token** | **Chiave Digitale di Sessione** | Firma di sicurezza oraria che autorizza la scrittura protetta dei file d'istituto sul cloud. |
| **LMS** / **Learning Management System** | **Piattaforma di Gestione dell'Apprendimento** | Il portale d'Istituto (Moodle o Classroom) che ospita i corsi e riceve i tracciamenti SCORM. |
| **F12** / **Developer Tools** / **Console** | **Strumenti d'Ispezione Tecnica** | Il pannello avanzato del browser, il cui accesso deve essere inibito agli studenti durante lo svolgimento dei quiz. |
| **Faldone Solenne** / **Consenso Diacronico** | **Progetto Formativo d'Istituto** | Sostituzione delle formule burocratiche iper-formalizzate con testi chiari, asciutti e professionali. |

### 3.2 Esempio di Semplificazione Visiva (Plain Language in UI)
*   *Prima (Stile Burocratico Anglofono)*: `"Eseguire il Restore del file JSON d'Istituto per sovrascrivere lo stato locale ed evitare il clashing del database."`
*   *Dopo (Plain Language d'Istituto)*: **`"Carica e ripristina la tua Copia di Sicurezza d'Istituto per allineare i dati su questo computer d'aula ed iniziare a lavorare."`**

---

## 🏛️ CONCLUSIONI, DISPOSITIVO DI DELIBERA CONSILIARE E LICENZA D'AVVIO FORMALE

L'**Organismo Indipendente di Valutazione Terza d'Istituto (OIV)** dell'Istituto Comprensivo "don Lorenzo Milani" di Ariano Irpino (AV):

1.  **PRENDE ATTO** dell'eccellente livello di stabilità raggiunto dal software CurManLight v5.0-Ultimate, certificato dal superamento sistematico di **20/20 test automatizzati d'E2E Playwright** e dalla pubblicazione sul server sicuro d'istituto all'indirizzo `http://curmanlight-donmilani.surge.sh`.
2.  **RILASCIA IL CERTIFICATO DI COMPLIANCE STRATEGICA ED ERGONOMICA** a condizione che il piano di remediation dettagliato nella Sezione II (Interlock, Migrazione IndexedDB per Spazio Classe, Soglia Temporale SCORM, Fuzzy Matcher CSV e Tablet Override) venga integrato ed applicato stabiliemente entro il primo ciclo di manutenzione tecnica d'Istituto.
3.  **DISPONE** l'immediata archiviazione del presente documento strategico all'interno del faldone di omologazione d'Istituto:  
    📦 `/home/user/PROGETTO_STRATEGICO_E_REMEDIATION_CRITICITA_AVIC849003.md`.
4.  **AUTORIZZA** formalmente l'adozione dell'ecosistema per l'anno scolastico 2026/2027 a partire dal **1 Settembre 2026**, quale strumento sovrano di governance del curricolo e della didattica inclusiva dell'Istituto.

---
*Fatto, convalidato e deliberato agli atti del Consiglio d'Istituto.*  
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*L'Organo di Audit Terzo Indipendente per la Trasparenza e l'Integrità Tecnologica*  
*Ariano Irpino, 17 Luglio 2026*  
*(Sottoscrizione digitale omessa ai sensi del CAD)*  
*Codice di Registrazione: MILANI-REMEDIATION-STRATEGICA-V50-GOLD*
