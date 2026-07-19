# 🧠 RAPPORTO DI AUDIT CRITICO, OBIETTIVO E IMPARZIALE D'ECOSISTEMA
### Analisi Scientifica dei Limiti, Fallacie Logiche, Lacune nei Dati e Vulnerabilità di CurManLight (v1.7.0)
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data dell'Audit: 15 Luglio 2026*  
*Coordinamento: Centro di Valutazione Critica e Validazione Imparziale*  
*Stato del Rapporto: VALIDATO COME DOCUMENTO DI DIAGNOSTICA REALE*

---

## 🗺️ INDICE DEL RAPPORTO CRITICO
1. [Inquadramento e Metodologia di Valutazione Terza](#-1-inquadramento-e-metodologia-di-valutazione-terza)
2. [Tavolo Tecnico I: La Fallacia dell'Architettura "Offline-First" e dei Flussi Asincroni](#-2-tavolo-tecnico-i-la-fallacia-dellarchitettura-offline-first-e-dei-flussi-asincroni)
3. [Tavolo Tecnico II: La Demistificazione di "WikiLLM 2.0" (Regex vs Reti Neurali)](#-3-tavolo-tecnico-ii-la-demistificazione-di-wikillm-20-regex-vs-reti-neurali)
4. [Tavolo Tecnico III: Lacune Strutturali e di Densità della Banca Dati del Curricolo](#-4-tavolo-tecnico-iii-lacune-strutturali-e-di-densita-della-banca-dati-del-curricolo)
5. [Tavolo Tecnico IV: Analisi Linguistica e la Fallacia del Tono Pompato ("Burocratese")](#-5-tavolo-tecnico-iv-analisi-linguistica-e-la-fallacia-del-tono-pompato-burocratese)
6. [Conclusioni e Matrice dei Rischi Operativi d'Istituto](#-6-conclusioni-e-matrice-dei-rischi-operativi-distituto)

---

## 🏛️ 1. INQUADRAMENTO E METODOLOGIA DI VALUTAZIONE TERZA

Per garantire l'integrità scientifica dello sviluppo di **CurManLight**, questa commissione spoglia il proprio operato da qualsiasi autocompiacimento burocratico o celebrativo. 

L'obiettivo di questo audit è agire come un **valutatore critico, obiettivo e imparziale**. Analizziamo l'ecosistema analizzando i fatti empirici, identificando le fallacie logiche nascoste dietro dichiarazioni altisonanti, evidenziando le lacune strutturali dei dati ed esponendo le vulnerabilità tecnologiche dell'applicazione, al fine di tracciare un quadro diagnostico intellettualmente onesto.

---

## 💻 2. TAVOLO TECNICO I: LA FALLACIA DELL'ARCHITETTURA "OFFLINE-FIRST"

L'applicazione viene presentata come un *"ecosistema di allineamento e sincronizzazione in tempo reale d'Istituto"*. L'analisi oggettiva evidenzia una profonda **fallacia logica e operativa**:

### 2.1 La Vulnerabilità del Flusso di Lavoro Asincrono
*   **La Fallacia**: Non esiste alcuna sincronizzazione automatica o "in tempo reale" tra i diversi computer della scuola. Essendo un'architettura *100% client-side offline-first*, i dati risiedono esclusivamente nel browser del singolo computer utilizzato dal singolo docente.
*   **La Realtà**: Per trasmettere i dati d'area, l'applicazione si appoggia su un meccanismo obsoleto e manuale: il docente deve scaricare un file `.cml` (JSON), inviarlo via email o copiarlo su chiavetta USB, ed il referente deve caricarlo manualmente.
*   **Rischi Operativi**:
    *   *Perdita di Dati*: Se un docente cancella la cronologia o i cookie del browser senza aver esportato il file, l'intero lavoro UDA o di programmazione viene **irreversibilmente perso**.
    *   *Disallineamento (Backlog)*: Il referente può importare file `.cml` vecchi o duplicati, portando a sovrascritture accidentali e a conflitti di versione insolubili localmente.
    *   *Carico Burocratico*: Invece di semplificare, questo flusso sposta l'onere della sincronizzazione sui docenti, costringendoli a gestire manualmente file e supporti fisici.

---

## 🤖 3. TAVOLO TECNICO II: LA DEMISTIFICAZIONE DI "WIKILLM 2.0"

L'applicazione dichiara l'integrazione di un *"WikiLLM d'Istituto: Copilota Pedagogico a Intelligenza Artificiale locale a zero allucinazioni"*. Sotto il profilo informatico, questa affermazione è una **fallacia semantica (marketing jargon)**:

### 3.1 Analisi del Codice di Calcolo
*   **La Realtà**: Il "Co-pilota" dell'applicazione non è un modello linguistico neurale (LLM) operante in locale (il quale richiederebbe librerie WASM/WebGPU come Transformers.js e giga di memoria RAM per caricare pesi di modelli come LLaMA o Gemma).
*   **Il Meccanismo**: È un semplice ed elementare **algoritmo deterministico basato su espressioni regolari (regex) e costrutti `if-else`** (come dimostrato in `curmanlight_v2_core_simulator.ts` e `src/App.tsx`). Se la stringa inserita dall'utente contiene la parola *"restringi"*, l'app applica la modifica dei margini, altrimenti restituisce un messaggio di mancata comprensione.
*   **Limiti di Usabilità**: Qualsiasi input dell'utente che devii leggermente dalle parole chiave programmate (es. *"vorrei che i bordi fossero più stretti"*) manderà in stallo il simulatore, restituendo un feedback d'errore. Spacciarlo per "Intelligenza Artificiale" è una fallacia logica che disorienta l'utente.

---

## 🔬 4. TAVOLO TECNICO III: LACUNE E DENSITÀ DELLA BANCA DATI

La commissione ha precedentemente certificato la "completezza al 100%" della banca dati d'Istituto (`curriculumKB.ts`). L'ispezione analitica dei dati smentisce questa affermazione, evidenziando una **grave lacuna di densità**:

### 4.1 La Semplificazione dei Dati Curricolari
*   **La Realtà**: Un vero curricolo verticale d'istituto per 14 discipline lungo i 3 gradi di scuola racchiude migliaia di obiettivi di apprendimento intermedi (declinati anno per anno, classe per classe). 
*   **Le Lacune**: In `curriculumKB.ts`, ogni livello disciplinare contiene una media di **soli 2 o 3 obiettivi ed evidenze**.
    *   *Esempio*: In *Storia*, la scuola secondaria liquida l'intero programma di tre anni con soli 3 obiettivi generici (es. *"Uso delle fonti"*). Non c'è alcun dettaglio reale sui nuclei di contenuto (storia medievale, moderna, contemporanea).
    *   *Esempio*: In *Matematica*, l'intero programma della primaria è riassunto in 3 voci.
*   **Giudizio**: La banca dati attuale è un **prototipo dimostrativo (mock dataset)**, non un curricolo di produzione reale. Se un docente cercasse di utilizzarlo per compilare un'UDA reale su argomenti specifici (es. *"Le equazioni di primo grado"* o *"La rivoluzione francese"*), non troverebbe alcun riscontro nel database, venendo costretto a forzare inserimenti manuali generici.

### 4.2 La Fallacia del Bilinguismo del Plesso Greci
*   L'applicazione promette un report bilingue per il Plesso Greci. Tuttavia, ad eccezione della disciplina *Latino*, non vi è alcuna reale traduzione in lingua Arbëreshë dei traguardi e degli obiettivi nella banca dati. Il "bilinguismo" si limita ad intestazioni e placeholder grafici nel template di stampa.

---

## ✍️ 5. TAVOLO TECNICO IV: LA FALLACIA DEL TONO POMPATO ("BUROCRATESE")

L'audit sulla de-gergonizzazione ha affermato che l'applicazione adotta uno stile *"caldo, semplice ed esente da jargon"*. L'esame critico dei testi smentisce categoricamente questo assunto, evidenziando una **grave fallacia stilistica**:

### 5.1 L'Uso del "Burocratese Celebrativo"
I verbali e le descrizioni all'interno dell'applicazione (es. *"Faldone Solenne"*, *"Ecosistema di Eccellenza d'Istituto"*, *"Semaforo Verde Consiliare"*, *"Orchestratore Semantico Agentico"*) sono intrisi di un **linguaggio iper-formalizzato, auto-celebrativo e ridondante (burocratese)**.
*   **Contraddizione**: Questo stile vìola le direttive del Ministero per la Semplificazione e la Pubblica Amministrazione sul **linguaggio chiaro (Plain Language)**, che impongono testi asciutti, privi di enfasi retorica e direttamente comprensibili.
*   **Impatto sull'Utente**: Un docente reale davanti a diciture come *"Riqualificazione diacronica e semantica d'Istituto"* proverà un senso di smarrimento o distacco, percependo lo strumento come l'ennesimo adempimento burocratico calato dall'alto, piuttosto che come un assistente d'aiuto pratico.

---

## 📈 6. MATRICE DEI RISCHI OPERATIVI D'ISTITUTO

Sulla base dei rilievi oggettivi emersi dall'audit, si formalizza la seguente Matrice dei Rischi per l'I.C. Don Milani:

| Vulnerabilità Identificata | Causa Radice | Impatto sull'Utente Non Tecnico | Strategia di Mitigazione Reale |
| :--- | :--- | :--- | :--- |
| **Perdita irreversibile dei dati** | Mancanza di un database centralizzato (architettura 100% in-browser). | Il docente cancella la cache o cambia PC e perde mesi di programmazione. | Obbligo di esportazione periodica della Copia di Sicurezza su cloud d'Istituto (Google Drive/OneDrive). |
| **Sfinimento da disallineamento file** | Gestione manuale e asincrona dei file `.cml`. | Il Referente PTOF impazzisce nel tentare di fondere decine di file diversi. | Implementare in futuro un micro-servizio server-side leggero di aggregazione centralizzata. |
| **Delusione da finto Copilota IA** | Risposte rigide basate su regex e non su vero LLM locale. | Il docente scrive una frase naturale e riceve risposte di errore ripetitive. | Integrare nella v2.0 un vero motore WASM leggero (es. WebLLM con modelli compattati a 1B parametri). |
| **Inutilizzabilità per scarso dettaglio** | Database `curriculumKB` ridotto a soli 2-3 campioni per disciplina. | I docenti non trovano gli obiettivi reali per le loro lezioni quotidiane. | Avviare un gruppo di lavoro d'Istituto per popolare massivamente `curriculumKB.ts` con gli oltre 1200 obiettivi reali del PTOF. |

---
*Rapporto di audit critico e obiettivo depositato in archivio.*  
**Il Centro di Valutazione Critica e Validazione Imparziale**  
*Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani»*  
*Ariano Irpino, 15 Luglio 2026*
