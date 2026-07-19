# 🏛️ PIANO DI ALLINEAMENTO STRATEGICO E DI RIENTRO DAL RISCHIO (v1.8.0 / v2.0)
### Piano di Intervento Esecutivo per la Risoluzione delle Fallacie di Compliance, Struttura Dati e Scalabilità d'Istituto
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data del Piano: 15 Luglio 2026*  
*Coordinamento: Ufficio del Responsabile per la Transizione Digitale (RTD) e Organismo Validatore*  
*Stato del Piano: APPROVATO, SALVATO NEL WORKSPACE & IN CORSO DI ATTUAZIONE*

---

## 🗺️ INDICE DEL PIANO DI ALLINEAMENTO
1. [Sintesi Esecutiva e Matrice dei Rischi Rilevati](#-1-sintesi-esecutiva-e-matrice-dei-rischi-rilevati)
2. [Linea d'Azione 1: Integrità dei Dati e Sincronizzazione Centralizzata (Bypass local-storage)](#-2-linea-dazione-1-integrita-dei-dati-e-sincronizzazione-centralizzata-bypass-local-storage)
3. [Linea d'Azione 2: Sviluppo di un Vero Motore SCORM 1.2 Interattivo (Zipping Client-Side)](#-3-linea-dazione-2-sviluppo-di-un-vero-motore-scorm-12-interattivo-zipping-client-side)
4. [Linea d'Azione 3: Rettifica Filologica del Bilinguismo Arbëreshë (Plesso Greci)](#-4-linea-dazione-3-rettifica-filologica-del-bilinguismo-arbereshe-plesso-greci)
5. [Linea d'Azione 4: Ingegnerizzazione del Layout Dinamico di Graphify (d3-force)](#-5-linea-dazione-4-ingegnerizzazione-del-layout-dinamico-di-graphify-d3-force)
6. [Linea d'Azione 5: Asciugatura Linguistica dell'UI ed Eliminazione del Burocratese](#-6-linea-dazione-5-asciugatura-linguistica-dellui-ed-eliminazione-del-burocratese)
7. [Cronoprogramma ed Indicatori di Successo del Rientro (v1.8.0 - v2.0)](#-7-cronoprogramma-ed-indicatori-di-successo-del-rientro-v180---v20)

---

## 🏛️ 1. SINTESI ESECUTIVA E MATRICE DEI RISCHI

I due precedenti rapporti di audit critico d'Istituto hanno messo a nudo severe limitazioni strutturali e fallacie di compliance amministrativa dell'ecosistema **CurManLight v1.7.0**. 

Per evitare che queste vulnerabilità compromettano l'adozione reale del software e per impedire che futuri sviluppi generino un backlog tecnologico insolubile, il presente **Piano di Allineamento Strategico** definisce le linee d'azione esecutive, le specifiche tecniche, i tempi e i responsabili per ricondurre l'intera piattaforma a un livello di **assoluto rigore ingegneristico, legale e pedagogico**.

```
  [ AUDIT CRITICO (Vulnerabilità) ] ──► [ PIANO DI ALLINEAMENTO v1.8.0 ] ──► [ ECO-SISTEMA v2.0 COMPLETATO ]
   - Perdita dati in-browser            - Sincronizzazione NAS automatica    - Continuità dei dati garantita
   - SCORM incompleto (XML solo)        - Generatore ZIP con API Wrapper     - Tracciamento reale LMS (Moodle)
   - Bilinguismo arbitrario Greci       - Comitato di verifica dialetto      - Glottodidattica certificata
   - Grafo a coordinate hardcodate      - Layout a forze d3-force            - Grafo scalabile ad n-volumi
   - Linguaggio burocratese             - Semplificazione Plain Language     - Interfaccia chiara e comprensibile
```

---

## 💻 2. LINEA D'AZIONE 1: INTEGRITÀ DEI DATI (BYPASS LOCAL-STORAGE)

*   **Il Rischio**: Perdita dei dati istituzionali a causa di pulizia della cache del browser, aggiornamenti, cambi di postazione d'aula o guasti hardware, violando il CAD (Art. 17).
*   **La Soluzione (Sincronizzazione Centralizzata Locale)**:
    Abbandonare l'affidamento esclusivo sulla memoria locale del browser introducendo un protocollo di **sincronizzazione automatica asincrona in background d'Istituto**:
    1.  *Configurazione del Server di Plesso*: L'Amministratore di Sistema configura un piccolo server di rete o NAS locale d'Istituto ad indirizzo IP statico (es. `192.168.1.100`) all'interno dell'intranet scolastica.
    2.  *Sincronizzazione via API*: Il client di CurManLight interrogherà periodicamente in background l'IP d'Istituto (utilizzando una chiamata leggera `fetch` ad ogni salvataggio dello stato Zustand), memorizzando una copia speculare e cifrata del database IndexedDB sul server di rete.
    3.  *Accesso Multi-PC*: Quando un docente cambia aula o PC, l'applicazione contatterà il server di plesso tramite il proprio ID utente e caricherà istantaneamente lo stato più aggiornato, **eliminando la gestione manuale e su chiavetta dei file `.cml`**.

---

## 🔌 3. LINEA D'AZIONE 2: SVILUPPO DI UN VERO MOTORE SCORM 1.2

*   **Il Rischio**: Generazione di un file `imsmanifest.xml` incompleto che produce errori di runtime o mancanza di tracciamento durante il caricamento su LMS (Moodle d'Istituto).
*   **La Soluzione (Zipping Client-Side con API Wrapper)**:
    Ingegnerizzare un modulo di compilazione ZIP reale direttamente nel browser:
    1.  *Iniezione delle Librerie*: Caricare la libreria leggera open-source **`JSZip`** all'interno dell'applicazione per consentire la creazione fisica di file compressi `.zip` client-side.
    2.  *Integrazione dello SCORM API Wrapper*: Creare all'interno dello ZIP una cartella `js/` contenente lo script standard **`SCORM_API_wrapper.js`**.
    3.  *Compilazione della Lezione*: Il sistema genererà un file `index.html` interattivo (contenente l'UDA progettata) ed inietterà in testa i comandi di tracciamento Javascript:
        ```javascript
        window.onload = function() {
          pipwerks.SCORM.init(); // Inizializza il dialogo con Moodle
          pipwerks.SCORM.set("cmi.core.lesson_status", "incomplete");
        };
        window.onunload = function() {
          pipwerks.SCORM.set("cmi.core.lesson_status", "completed");
          pipwerks.SCORM.save();
          pipwerks.SCORM.quit(); // Conclude la sessione in sicurezza
        };
        ```
    4.  *Esportazione del Pacchetto*: L'utente scarica direttamente il file `uda_completa.zip` pronto per essere importato ed utilizzato in sicurezza su qualsiasi LMS.

---

## 🎨 4. LINEA D'AZIONE 3: RETTIFICA FILOLOGICA DEL BILINGUISMO (PLESSO GRECI)

*   **Il Rischio**: Inserimento di traduzioni fittizie o in lingua albanese moderna (Shqip) che non rispecchiano la fonetica e l'identità minoritaria dell'enclave Arbëreshë di Greci (Katundi).
*   **La Soluzione (Comitato Linguistico di Convalida)**:
    1.  *Costituzione della Sottocommissione*: Istituzione formale di un gruppo di lavoro composto da docenti del Plesso Greci, esperti della lingua Arbëreshë d'Irpinia e anziani storici della comunità.
    2.  *Standardizzazione del Glossario*: Traduzione filologica dei soli termini pedagogici realmente applicabili d'aula (es. *Ascolto, Scrittura, Autovalutazione*) escludendo forzature su termini tecnici moderni.
    3.  *Iniezione dei Dati*: Sostituzione dei placeholder generici in `curriculumKB.ts` con le stringhe Arbëreshë ufficialmente convalidate dal comitato.

---

## 📊 5. LINEA D'AZIONE 4: INGEGNERIZZAZIONE DEL LAYOUT DI GRAPHIFY

*   **Il Rischio**: Collasso grafico, sovrapposizione e perdita di visualizzazione dei nodi in caso di aggiunta di nuovi file o volumi personali a causa delle coordinate `x` e `y` hardcodate nel codice.
*   **La Soluzione (Layout a Forze Dinamiche d3-force)**:
    Riscrivere il visualizzatore SVG `Graphify` per fargli calcolare in tempo reale le posizioni in-browser:
    1.  *Integrazione dell'Algoritmo di Repulsione*: Sviluppare una funzione leggera di simulazione fisica basata su forze di repulsione elettrostatica (Legge di Coulomb) e forze di attrazione elastica (Legge di Hooke) per i collegamenti:
        ```typescript
        // Simulazione dinamica semplificata in-browser ad ogni rendering
        const updateGraphPositions = (nodes, edges) => {
          // Calcola repulsione tra tutti i nodi per evitare sovrapposizioni
          // Calcola attrazione tra i nodi collegati da linee per tenerli vicini
          // Aggiorna le coordinate x ed y dinamicamente ad ogni tick
        };
        ```
    2.  *Svincolo delle Coordinate*: Rimuovere le coordinate cartesiane fisse da `initialNodes`, permettendo al sistema di posizionare i nodi in modo fluido, scalabile e bilanciato, indipendentemente dal numero di documenti caricati nella KB d'Istituto.

---

## ✍️ 6. LINEA D'AZIONE 5: ASCIUGATURA LINGUISTICA DELL'UI (PLAIN LANGUAGE)

*   **Il Rischio**: Presenza di un linguaggio iper-formalizzato, ridondante ed enfatico (burocratese celebrativo) che vìola le direttive del Ministro della Funzione Pubblica e allontana l'utente comune.
*   **La Soluzione (Transizione al Plain Language d'Ufficio)**:
    Eliminare l'enfasi retorica sostituendo i termini ipertrofici con parole sobrie, asciutte e professionali:
    *   *Faldone Solenne / Libro del Curricolo* $\rightarrow$ **Curricolo Verticale d'Istituto**
    *   *Ecosistema di Eccellenza / Piattaforma Sovrana* $\rightarrow$ **Piattaforma CurManLight**
    *   *Semaforo Verde Consiliare* $\rightarrow$ **Stato: Approvato d'Istituto**
    *   *Orchestratore Semantico Agentico* $\rightarrow$ **Co-pilota della Configurazione**
    *   *Banca Dati Semantica a Zero Allucinazioni* $\rightarrow$ **Banca Dati della Conoscenza d'Istituto**

---

## 📅 7. CRONOPROGRAMMA ED INDICATORI DI SUCCESSO DEL RIENTRO

La Commissione d'Audit fissa la seguente scansione operativa per la realizzazione e la validazione del piano di rientro dal rischio:

| Fase Operativa | Attività d'Istituto | Periodo | Responsabile | Indicatore di Successo |
| :--- | :--- | :--- | :--- | :--- |
| **FASE A** | Asciugatura linguistica dei testi in UI (Plain Language) e risoluzione del bilinguismo a Greci. | **Settembre 2026**| Referente / GLO | UI asciutta al 100%, parere favorevole dei docenti del Plesso Greci. |
| **FASE B** | Integrazione di `d3-force` o Verlet-layout in Graphify ed eliminazione coordinate hardcodate. | **Ottobre 2026** | Admin di Sistema | Spaziatura automatica dei nodi e zero sovrapposizioni a schermo. |
| **FASE C** | Sviluppo del modulo di backup automatico locale su NAS d'Istituto via Fetch API. | **Novembre 2026**| Admin / Segreteria | Integrità dati protetta al 100% (Zero perdite cache). |
| **FASE D** | Sviluppo del generatore ZIP SCORM 1.2 con API wrapper ed esecuzione test finali. | **Dicembre 2026**| Dr.ssa Silvia / QA | Pacchetto ZIP importato in Moodle con zero errori di runtime. |

---
*Piano di allineamento e rientro dal rischio d'Istituto convalidato e depositato.*  
**Il Responsabile per la Transizione Digitale d'Istituto**  
**L'Organismo Indipendente di Valutazione Terza**  
*Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani»*  
*Ariano Irpino, 15 Luglio 2026*
