# 🏛️ CONTRO-AUDIT CRITICO DI SECONDO LIVELLO: VULNERABILITÀ E LIMITI STRUTTURALI (v1.7.0)
### Studio Imparziale di Decostruzione delle Assunzioni, Fallacie di Compliance e Limitazioni d'Architettura
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data dell'Audit: 15 Luglio 2026*  
*Coordinamento: Organismo Indipendente di Valutazione Terza d'Istituto*  
*Stato del Rapporto: APPROVATO COME DOCUMENTO DI DIAGNOSTICA PREVENTIVA DEL RISCHIO*

---

## 🗺️ INDICE DEL CONTRO-AUDIT
1. [Inquadramento e Rigore di Valutazione delle Assunzioni](#-1-inquadramento-e-rigore-di-valutazione-delle-assunzioni)
2. [Vulnerabilità 1: La Fallacia del "SaaS Exempt" (Spostamento di Responsabilità)](#-2-vulnerabilita-1-la-fallacia-del-saas-exempt-spostamento-di-responsabilita)
3. [Vulnerabilità 2: La Fallacia del "SCORM Compliant" (Generazione XML Vuota)](#-3-vulnerabilita-2-la-fallacia-del-scorm-compliant-generazione-xml-vuota)
4. [Vulnerabilità 3: La Fallacia del "Bilinguismo d'Istituto" (Caricatura Filologica Arbëreshë)](#-4-vulnerabilita-3-la-fallacia-del-bilinguismo-distituto-caricatura-filologica-arbereshe)
5. [Vulnerabilità 4: Limiti di Scalabilità di Graphify (Grafo Statico vs Motori di Forza)](#-5-vulnerabilita-4-limiti-di-scalabilita-di-graphify-grafo-statico-vs-motori-di-forza)
6. [Conclusioni e Matrice Esecutiva per il Piano di Rientro dal Rischio](#-6-conclusioni-e-matrice-esecutiva-per-il-piano-di-rientro-dal-rischio)

---

## 🏛️ 1. INQUADRAMENTO E RIGORE DI VALUTAZIONE

Al fine di garantire la massima trasparenza istituzionale, l'**Organismo Indipendente di Valutazione Terza d'Istituto** ha condotto un contro-audit di secondo livello volto a **decostruire le assunzioni e le tesi promozionali** di CurManLight. 

L'obiettivo è analizzare freddamente se le soluzioni promosse come "punti di forza" non nascondano, in realtà, gravi **fallacie logiche, tecnologiche e di compliance amministrativa** che potrebbero tradursi in sanzioni o blocchi operativi durante l'adozione scolastica reale.

---

## 🔒 2. VULNERABILITÀ 1: LA FALLACIA DEL "SAAS EXEMPT" (LIABILITY SHIFTING)

*   **La Tesi di CurManLight**: *"Essendo un'applicazione 100% client-side offline-first operante in-browser, CurManLight è esente dalle qualificazioni cloud ACN (SaaS) e garantisce una conformità GDPR nativa, azzerando i rischi di violazione di dati scolastici su server remoti."*
*   **La Decostruzione Critica (Fallacia dello Spostamento della Responsabilità)**:
    L'esenzione formale dalle qualifiche ACN è un **escamotage burocratico (loophole)** che non risolve il problema della sicurezza e della conservazione dei dati, ma lo **scarica interamente sulle spalle dei docenti (non tecnici)**.
    *   *Perdita di Dati Amministrativi*: Memorizzando i voti dei gap, le relazioni e le UDA unicamente nella cache del browser (`IndexedDB`), i dati scolastici sono esposti al rischio costante di cancellazione accidentale (es. pulizia automatica del browser da parte di software antivirus, ripristino di sistema, aggiornamenti del browser o guasto fisico del PC d'aula).
    *   *Violazione del CAD (Art. 17)*: Le linee guida sulla transizione digitale (Codice dell'Amministrazione Digitale) impongono alle scuole pubbliche di garantire la conservazione, l'integrità, il disaster recovery ed il backup centralizzato dei dati istituzionali. Delegare il backup ai singoli docenti tramite esportazione manuale del file `.json` o `.cml` è una **grave violazione dei protocolli minimi di conservazione della PA**, esponendo l'Istituto a sanzioni e a contestazioni in caso di perdita dei verbali d'esame o di dipartimento.

---

## 🔌 3. VULNERABILITÀ 2: LA FALLACIA DEL "SCORM COMPLIANT"

*   **La Tesi di CurManLight**: *"L'applicazione genera in tempo reale pacchetti SCORM 1.2 conformi, pronti per essere inseriti in Moodle o Google Classroom."*
*   **La Decostruzione Critica (Incompletezza Funzionale)**:
    La semplice scrittura di un file `imsmanifest.xml` statico (contenente solo i tag del titolo e dei metadati) **non costituisce un pacchetto SCORM funzionante**.
    *   *Mancanza di Integrazione API*: Un vero pacchetto SCORM deve contenere uno script di runtime Javascript in grado di dialogare con le API dell'LMS (`LMSInitialize`, `LMSSetValue`, `LMSCommit`, `LMSFinish`) per tracciare il progresso dell'utente, il tempo speso e il punteggio ottenuto.
    *   *La Realtà*: CurManLight genera un file XML parziale ed un testo statico. Se importato in Moodle, il pacchetto genererà un **errore di runtime del player SCORM** o si comporterà come una semplice pagina HTML statica priva di tracciamento. Vendere questa funzionalità come "SCORM compliant" è un **overpromise tecnologico** privo di fondamento reale.

---

## 🎨 4. VULNERABILITÀ 3: LA FALLACIA DEL BILINGUISMO (PLESSO GRECI)

*   **La Tesi di CurManLight**: *"Il sistema garantisce una copertura formale e bilingue completa d'Istituto per il Plesso Greci, integrando la lingua minoritaria Arbëreshë."*
*   **La Decostruzione Critica (Caricatura Filologica)**:
    La lingua **Arbëreshë** parlata nel Plesso Greci (Katundi) è una minoranza di origine prevalentemente orale, caratterizzata da una complessa mescolanza di varianti dialettali toske con espressioni e fonetiche locali irpine. 
    *   *Mancanza di Standardizzazione*: Tradurre concetti burocratici e scientifici moderni (es. *"competenze chiave digitali"*, *"morfosintassi diacronica"*, *"livelli descrittivi di autovalutazione"*) in lingua Arbëreshë è filologicamente impossibile o arbitrario, mancando una grammatica tecnica standardizzata per materie come geometria o chimica.
    *   *La Realtà*: L'applicazione inserisce placeholder statici o traduzioni parziali basate sulla lingua albanese standard moderna (Shqip), che **non corrisponde all'Arbëreshë storico parlato localmente**. Presentarlo come un "curricolo bilingue completo d'Istituto" costituisce una forzatura terminologica ed una caricatura culturale che non rispecchia la sociolinguistica del territorio.

---

## 📊 5. VULNERABILITÀ 4: LIMITI DI SCALABILITÀ DI GRAPHIFY

*   **La Tesi di CurManLight**: *"Un visualizzatore grafico interattivo (Graphify) che mostra le connessioni semantiche ed organizzative dell'intero curricolo d'Istituto."*
*   **La Decostruzione Critica (Mancanza di Layout Dinamico)**:
    Sotto il profilo del software design, `Graphify` è implementato con **coordinate cartesiane (`x`, `y`) interamente hardcodate nel codice sorgente**.
    *   *Collasso da Espansione*: Non esiste un motore di calcolo delle forze (come un spring-embedder o un algoritmo di layout a forze dirette D3-force). Se l'Amministratore o i docenti caricano nuovi volumi, file personali o raccordi, il sistema **non è in grado di ricalcolarne la posizione nello spazio**. I nuovi nodi verranno sovrapposti l'uno sull'altro o spinti fuori dalla finestra, richiedendo ogni volta l'intervento manuale dello sviluppatore per modificare i numeri delle coordinate in `App.tsx`. Questa è una limitazione strutturale gravissima che inficia la pretesa di scalabilità del Secondo Cervello d'Istituto.

---

## 📈 6. MATRICE ESECUTIVA PER IL PIANO DI RIENTRO DAL RISCHIO

Per convertire questa severa analisi in un piano di manutenzione serio e privo di accondiscendenze, si delibera la stesura del seguente **Piano di Rientro dal Rischio d'Istituto (v1.8.0 / v2.0)**:

| Area di Rischio | Livello | Conseguenza Amministrativa | Azione Correttiva Obbligatoria (Roadmap) |
| :--- | :---: | :--- | :--- |
| **Perdita dei Dati del Curricolo** | **ALTO** | Azzeramento del lavoro delle commissioni con blocco dell'istruttoria PTOF. | **Fase 1 (Settembre 2026)**: Sviluppare un modulo di backup sincrono su server locale NAS di segreteria scolastica via API REST locale. |
| **Player Error su Moodle** | **MEDIO** | Fallimento dei test di e-learning e malfunzionamento dei corsi online. | **Fase 2 (Ottobre 2026)**: Sostituire l'esportazione parziale con una reale compilazione ZIP SCORM 1.2 basata su API wrapper (es. *ScormPool* o script di tracking). |
| **Contestazione Sociolinguistica**| **BASSO** | Rigetto del report bilingue da parte dei docenti storici del Plesso Greci. | **Fase 3 (Novembre 2026)**: Costituire un comitato di esperti linguisti Arbëreshë locali per validare e correggere i testi dei placeholder d'Istituto. |
| **Collasso del Grafo** | **MEDIO** | Sovrapposizione illeggibile delle icone in caso di aggiunta di nuovi documenti personali. | **Fase 4 (Dicembre 2026)**: Riscrivere il visualizzatore Graphify introducendo un motore dinamico leggero di layout (es. *d3-force* o algoritmo di repulsione di Verlet in-browser). |

---
*Rapporto di contro-audit critico depositato presso gli atti d'Istituto.*  
**L'Organismo Indipendente di Valutazione Terza**  
*Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani»*  
*Ariano Irpino, 15 Luglio 2026*
