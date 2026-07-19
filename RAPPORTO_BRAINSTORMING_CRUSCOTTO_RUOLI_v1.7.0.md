# 🏛️ RAPPORTO DI BRAINSTORMING SPECIALISTICO D'ISTITUTO
### Definizione Semantica, Strutturale e Ruolo-Based dei Cruscotti di Governance (v1.7.0)
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data dell'Audit: 15 Luglio 2026*  
*Coordinamento: Tavolo di Specialisti per l'Innovazione Tecnologica e Pedagogica*  
*Stato del Rapporto: APPROVATO & ARCHIVIATO NEL SECONDO CERVELLO*

---

## 🗺️ INDICE DEL RAPPORTO DI AUDIT
1. [Inquadramento e Membri del Tavolo di Specialisti](#-1-inquadramento-e-membri-del-tavolo-di-specialisti)
2. [Analisi Ruolo-Based: Cosa deve visualizzare ciascun profilo?](#-2-analisi-ruolo-based-cosa-deve-visualizzare-ciascun-profilo)
3. [Widget, Metriche e KPI per i 6 Livelli di Governance](#-3-widget-metriche-e-kpi-per-i-6-livelli-di-governance)
4. [La Matrice di Autorizzazione e Sicurezza dei Dati (GDPR)](#-4-la-matrice-di-autorizzazione-e-sicurezza-dei-dati-gdpr)
5. [Raccomandazioni Finali per il Rilascio dei Cruscotti Dedicati](#-5-raccomandazioni-finali-per-il-rilascio-dei-cruscotti-dedicati)

---

## 🏛️ 1. INQUADRAMENTO E MEMBRI DEL TAVOLO DI SPECIALISTI

Per progettare l'ambiente di lavoro ideale dei 6 profili di governance previsti dal sistema **CurManLight (v1.7.0)**, è stato convocato un tavolo di specialisti multidisciplinare, volto a fondere gli aspetti pedagogici, amministrativi, di usabilità e di sicurezza d'Istituto:

*   **Prof.ssa Maria Letizia (Preside / DS)**: Focus su monitoraggio strategico, efficienza dei dipartimenti, legalità e delibere.
*   **Prof. Vincenzo (Animatore Digitale & Coordinatore Curricolo)**: Focus su usabilità d'aula per docenti comuni e sostegno, coerenza delle UDA e adozione del PTOF.
*   **Dr.ssa Silvia (Esperta di EdTech & Pedagogia delle Competenze)**: Focus su raccordi ordinamentali (D.M. 221/2025), declinazione delle evidenze e modelli valutativi descrittivi.
*   **Ing. Roberto (Software Architect & DPO d'Istituto)**: Focus su segregazione dei ruoli, sicurezza locale in-browser (GDPR), stabilità degli schemi JSON e integrità del codice.

---

## 👥 2. ANALISI RUOLO-BASED: COSA DEVE VISUALIZZARE CIASCUN PROFILO?

Il tavolo ha stabilito in modo rigoroso e dettagliato i requisiti informativi, i widget operativi e le metriche visive che ciascuno dei **6 tipi di utente** deve poter visualizzare nel proprio cruscotto personalizzato:

---

### 🧑‍🏫 PROFILO 1: INSEGNANTE / DOCENTE (COMUNE E SOSTEGNO)
*   **Visione Strategica**: Semplificazione burocratica, compilazione guidata delle proprie classi e pianificazione inclusiva immediata.
*   **Elementi Chiave del Cruscotto**:
    *   **Stato della Progettazione UDA**: Widget visivo che indica quante UDA sono in bozza, quante in revisione e quante approvate per la propria classe attiva.
    *   **Mappa dei Traguardi Selezionati**: Visualizzazione ad albero dei traguardi e degli obiettivi ministeriali (D.M. 221/2025) associati alla propria disciplina, con traduzione automatica nei *Campi di Esperienza* se l'ordine è l'Infanzia.
    *   **Pannello di Inclusione Rapida (PEI/PDP)**: Accesso immediato ai 5 pulsanti rapidi d'Istituto per inserire al volo le misure compensative e dispensative (EasyReading, sintesi vocale, bilinguismo Arbëreshë per il Plesso Greci).
    *   **Linea Temporale d'Istituto (Timeline)**: Cronoprogramma visuale diviso in Primo e Secondo Quadrimestre per la propria classe d'insegnamento.
*   **Strumenti d'Esportazione**: Generazione istantanea del modello Word (.docx) della programmazione annuale, relazione intermedia/finale o del PEI-ICF personalizzato.

---

### 💻 PROFILO 2: COORDINATORE DI DIPARTIMENTO DISCIPLINARE
*   **Visione Strategica**: Raccordo ordinamentale d'area (es. Dipartimento Umanistico, Scientifico, ecc.) e monitoraggio delle proposte di voto dei gap.
*   **Elementi Chiave del Cruscotto**:
    *   **Stato del Voto dei Gap (Tavola Sinottica)**: Tabella riassuntiva dei 46 raccordi ordinamentali 2012 vs 2025 di pertinenza del proprio dipartimento (es. adozione o modifica d'Istituto).
    *   **Widget di Avanzamento Dipartimentale**: Indicatore percentuale dei gap già esaminati e votati dai docenti membri del dipartimento.
    *   **Bacheca delle Proposte d'Istituto**: Visualizzazione delle modifiche personalizzate locali inserite dai docenti per adeguarle al territorio irpino.
*   **Strumenti d'Esportazione**: Generazione del file di lavoro di dipartimento in formato d'Istituto `.cml` contenente i voti d'area da inviare al Referente del Curricolo.

---

### 📊 PROFILO 3: REFERENTE PER IL CURRICOLO (FUNZIONE STRUMENTALE PTOF)
*   **Visione Strategica**: Consolidamento e unione (merging) di tutte le proposte dipartimentali, monitoraggio statistico d'adozione e controllo di coerenza.
*   **Elementi Chiave del Cruscotto**:
    *   **Pannello di Fusione Asincrona (CML Merger)**: Widget interattivo per caricare e unire con un clic i file `.cml` trasmessi dai vari dipartimenti d'Istituto.
    *   **Cruscotto Statistico del Consenso**: Grafici a ciambella e barre che mostrano:
        *   Tasso di adozione delle linee guida 2025 (D.M. 221/2025) a livello d'Istituto.
        *   Percentuale di raccordi mantenuti transitoriamente al regime 2012.
        *   Percentuale di personalizzazioni locali d'Istituto.
    *   **Allineamento Competenze Europee**: Analisi semantica di copertura delle 8 Competenze Chiave (Raccomandazione 2018) sul totale delle UDA d'Istituto in archivio.
*   **Strumenti d'Esportazione**: Generazione del Libro del Curricolo Verticale completo in formato Word (.docx), ODF (.odt), Markdown (.md) o tracciato copia-registro.

---

### 🏛️ PROFILO 4: DIRIGENTE SCOLASTICO (DS)
*   **Visione Strategica**: Supervisione istituzionale, conformità alle scadenze di legge, firma della delibera consiliare ed adempimenti di accessibilità PA.
*   **Elementi Chiave del Cruscotto**:
    *   **Sintesi degli Indicatori PA (Compliance d'Istituto)**: Monitoraggio visuale dei 4 bollenti della scuola pubblica:
        1.  *Accessibilità AgID (WCAG 2.1 AA)*: Stato di validazione tramite MAUVE++ e Pa11y.
        2.  *Sicurezza GDPR*: Trattamento 100% in-browser dei voti a zero server footprint.
        3.  *ACN Cloud SaaS*: Stato di esenzione dall'obbligo di qualificazione per l'architettura offline-first.
        4.  *CAD Riuso (Art. 69)*: Disponibilità della licenza EUPL v1.2 e codice su Developers Italia.
    *   **Quadro di Avanzamento Generale dei Plessi**: Grafico dell'avanzamento dei lavori nei plessi Calvario (Infanzia), Greci (Primaria) e Covotta (Secondaria).
    *   **Modulo di Delibera d'Adozione (Volume 10)**: Visualizzazione della bozza di delibera formale con i relativi dispositivi pronti per la firma.
*   **Strumenti d'Esportazione**: Generazione della *Dichiarazione di Accessibilità AgID* pre-compilata in formato testo (.txt) pronta per l'invio telematico, e stampa PDF ad alta definizione dei verbali d'Istituto.

---

### 👥 PROFILO 5: COLLEGIO DEI DOCENTI (ORGANO COLLEGIALE)
*   **Visione Strategica**: Consultazione collettiva del testo del curricolo risultante dall'allineamento dei dipartimenti, votazione sovrana finale e validazione.
*   **Elementi Chiave del Cruscotto**:
    *   **Tavola Sinottica Comparativa**: Visualizzazione 1-a-1 dei testi originali 2012 e dei testi aggiornati e deliberati d'Istituto per il 2025, per consentire l'esame prima del voto collegiale.
    *   **Widget della Premessa e Riforme**: Lettura rapida della Premessa d'Istituto, del cronoprogramma di transizione graduale e della delibera consiliare.
    *   **Visualizzatore della Mappa delle Connessioni (Graphify)**: Esplorazione visuale e interattiva di come le discipline scolastiche e i volumi normativi si intersecano tra loro.
*   **Strumenti d'Esportazione**: Accesso alla copia rapida delle tabelle di raccordo per l'inserimento immediato nel verbale di seduta del Collegio.

---

### 🔧 PROFILO 6: REVISORE TECNICO / AMMINISTRATORE DI SISTEMA
*   **Visione Strategica**: Diagnostica del sistema, manutenzione della Progressive Web App (PWA), ripristino di emergenza dei database locali e controllo dei log.
*   **Elementi Chiave del Cruscotto**:
    *   **Stato della Memoria Locale (IndexedDB/Dexie)**: Widget diagnostico che indica lo spazio occupato dal database locale sul browser dell'utente e lo stato dell'adattatore Storage Guard.
    *   **Quadro di Controllo PWA**: Stato del Service Worker (`sw.js`), versione della cache d'Istituto attiva e pulsante per forzare il wipe cache-busting in caso di aggiornamenti.
    *   **Pannello di Importazione/Esportazione delle Copie di Sicurezza (Backup)**: Strumenti per scaricare la copia completa dell'intero database d'Istituto (.json) e per effettuarne il ripristino o l'azzeramento confidenziale.
    *   **Log degli Errori di Compilazione**: Visualizzatore di diagnostica tecnica per identificare anomalie grafiche o conflitti di codice.

---

## 🔒 3. LA MATRICE DI AUTORIZZAZIONE E SICUREZZA (GDPR)

Il tavolo di specialisti ha ratificato la **Matrice di Segregazione dei Ruoli d'Istituto**, che garantisce che ciascun utente possa visualizzare unicamente le informazioni di sua competenza burocratica:

```
Ruolo d'Istituto         Consulta Curricolo   Progetta UDA   Vota Gap Dipartimento   Unisci File (.cml)   Delibera DS   Backup / Reset
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
• Insegnante             [X] Consente         [X] Consente   [ ] Inibito             [ ] Inibito          [ ] Inibito   [ ] Inibito
• Dipartimento           [X] Consente         [X] Consente   [X] Consente            [ ] Inibito          [ ] Inibito   [ ] Inibito
• Referente              [X] Consente         [X] Consente   [X] Consente            [X] Consente         [ ] Inibito   [ ] Inibito
• Dirigente (DS)         [X] Consente         [ ] Inibito    [ ] Inibito             [X] Consente         [X] Consente  [ ] Inibito
• Collegio               [X] Consente         [ ] Inibito    [ ] Inibito             [ ] Inibito          [X] Consente  [ ] Inibito
• Amministratore         [X] Consente         [ ] Inibito    [ ] Inibito             [ ] Inibito          [ ] Inibito   [X] Consente
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
```

---

## 📅 4. RACCOMANDAZIONI FINALI DELLA COMMISSIONE D'AUDIT

In conclusione del tavolo di brainstorming, si delibera di:
1.  **Convalidare la struttura dei 6 cruscotti** come pilastro della stabilità e dell'ergonomia di CurManLight.
2.  **Mantenere l'Isolamento Locale**: Ribadire che la segregazione dei ruoli e la memorizzazione locale in-browser (senza server esterni) costituisce il massimo punto di forza d'Istituto in termini di riservatezza, audibilità del GDPR ed esenzione dai controlli centralizzati ACN.

---
*Verbale d'audit e progettazione dei cruscotti approvato e depositato.*  
**Il Tavolo di Specialisti per l'Innovazione Tecnologica**  
*Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani»*  
*Ariano Irpino, 15 Luglio 2026*
