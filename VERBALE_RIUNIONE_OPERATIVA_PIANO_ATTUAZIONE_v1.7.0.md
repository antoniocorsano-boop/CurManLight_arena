# 🏛️ VERBALE DI RIUNIONE OPERATIVA: PIANO DI ATTUAZIONE v1.7.0
### Definizione della Roadmap, Responsabilità e Protocolli per il Motore di Template Assistito da IA
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data della Riunione: 15 Luglio 2026, ore 15:30*  
*Luogo: Ufficio di Presidenza (Sede Covotta) / Sessione Swarm Telematica Protetta*  
*Verbale n. 42 / Commissione Innovazione Tecnologica*  
*Stato del Piano: APPROVATO ALL'UNANIMITÀ & IMMEDIATAMENTE ESECUTIVO*

---

## 👥 1. PARTECIPANTI E RUOLI OPERATIVI

*   **Prof.ssa Maria Letizia (Preside / Dirigente Scolastico - DS)**: Presidente della seduta. Garante della conformità istituzionale, della legalità amministrativa e della visione d'insieme del PTOF.
*   **Prof. Vincenzo (Animatore Digitale & Referente Curricolo)**: Segretario verbalizzante. Responsabile dell'ergonomia d'uso d'aula, dell'onboarding dei docenti e del raccordo pedagogico-ordinamentale.
*   **Ing. Roberto (Software Architect & Admin di Sistema)**: Responsabile dell'architettura tecnica offline-first, dell'integrazione delle librerie open-source e della sicurezza del database locale.
*   **Dr.ssa Silvia (Consulente AI & EdTech d'Istituto)**: Progettista dei modelli linguistici, del prompt-engineering del Co-pilota e delle strutture di convalida semantica JSON.

---

## 📌 2. ORDINE DEL GIORNO (ODG)

1.  **Esame del disegno tecnico e dell'analisi di fattibilità v1.7.0** (Motore di Template con Assistenza Intelligente).
2.  **Approvazione del Cronoprogramma di Sviluppo (Roadmap Operativa)**.
3.  **Assegnazione dei compiti e delle responsabilità d'Istituto**.
4.  **Definizione dei Protocolli di Sicurezza e Mitigazione Rischi** (Controllo Amministrativo e Ripristino).
5.  **Pianificazione del piano di formazione e Change Management per il corpo docente**.

---

## 💬 3. SINTESI DELLA DISCUSSIONE (BRAINSTORMING ATTIVO)

### 3.1 Apertura dei Lavori e Validazione del Modello Dati
La **Dirigente Maria Letizia** apre la seduta congratulandosi con la Commissione per la rapidità e il rigore del lavoro svolto nell'Audit Terminologico. 
> *"L'eliminazione del gergo informatico ha reso CurManLight uno strumento amato dai docenti, come dimostrato dai test sul campo. Ora dobbiamo fare lo stesso passo da giganti con la personalizzazione dei documenti. Il disegno dell'ing. Roberto basato su schemi JSON e sulla libreria Docxtemplater è eccellente perché non impatta sulla velocità e non viola la privacy dei docenti. Tuttavia, esigo che il sistema includa un **blocco di sicurezza invalicabile**: se un utente prova a nascondere o modificare l'intestazione ministeriale ufficiale, il codice meccanografico AVIC849003 o le firme di legge, l'Assistente deve bloccare l'azione e notificare con gentilezza che tali campi sono presidiati per regolamento d'Istituto."*

L'**Ing. Roberto** rassicura la Presidenza: 
> *"La regola di protezione è stata codificata direttamente nel nucleo del compilatore. Come descritto nell'allegato tecnico, l'algoritmo effettua una validazione a freddo del JSON modificato dall'IA rispetto a una lista di campi contrassegnati come 'immutabili'. Qualsiasi tentativo di rimozione o alterazione di questi nodi sensibili viene intercettato prima del rendering, ripristinando il valore originale e mostrando un avviso chiaro. Il docente ha la massima libertà sulle sezioni didattiche, ma l'impalcatura istituzionale è blindata."*

### 3.2 L'Ergonomia dell'Interfaccia Assistita
Il **Prof. Vincenzo** solleva il problema della confidenza digitale dei docenti: 
> *"Dobbiamo assicurarci che l'interfaccia con l'IA sia rassicurante. Alcuni colleghi si sentono intimiditi dal dover scrivere istruzioni di testo libere. Propongo che, accanto alla barra di chat con il Co-pilota, vi sia un elenco di **'Suggerimenti Rapidi d'Istituto'** (Quick Prompts) cliccabili, come: 'Scegli carattere Times per relazioni', 'Applica loghi PNRR', 'Aggiungi firma del Segretario'. Questo consentirebbe anche ai docenti meno esperti di utilizzare l'IA con un solo clic, apprendendo per imitazione."*

La **Dr.ssa Silvia** accoglie con entusiasmo la proposta: 
> *"Ottima idea, Vincenzo. Possiamo integrare questi suggerimenti rapidi direttamente nel pannello di sinistra. Cliccando sul suggerimento, l'applicazione pre-compila la richiesta e la inoltra al modulo di orchestrazione semantica. Inoltre, l'Assistente non risponderà con codici freddi, ma utilizzerà un linguaggio accogliente, spiegando brevemente l'impatto pedagogico della modifica (es. 'Ho applicato i loghi PNRR richiesti. Ora i tuoi faldoni sono conformi alle linee guida europee per la rendicontazione')."*

---

## 📅 4. APPROVAZIONE DEL PIANO DI ATTUAZIONE (ROADMAP E PIANO DI GANTT)

La Commissione approva all'unanimità il seguente piano di sviluppo suddiviso in 4 fasi, sincronizzato con l'inizio dell'anno scolastico 2026/2027:

```
[FASE I - Set] ────────► [FASE II - Ott] ────────► [FASE III - Nov] ────────► [FASE IV - Dic]
Integrazione             Sincronizzazione        Co-pilota IA &           Formazione Docenti
Docxtemplater & JSZip    Database Offline        Suggerimenti Rapidi      & Delibera Collegio
```

### 📋 Dettaglio delle Fasi e dei Deliverables:

#### FASE I: Integrazione e Compilazione Locale (Settembre 2026)
*   **Attività**: Integrazione delle librerie open-source `docxtemplater` e `pizzip` nel compilatore Vite.
*   **Responsabile**: Ing. Roberto.
*   **Traguardo di Qualità**: Compilazione riuscita del bundle statico in un unico file `index.html` senza errori di bundle e con un aumento di peso inferiore a 90 KB.

#### FASE II: Sincronizzazione Database Offline-First (Ottobre 2026)
*   **Attività**: Creazione dello stato persistente `documentTemplates` in Zustand ed IndexedDB, permettendo la conservazione e l'importazione di modelli d'Istituto personalizzati in formato `.json`.
*   **Responsabile**: Ing. Roberto e Prof. Vincenzo.
*   **Traguardo di Qualità**: Persistenza garantita su riavvio del browser ed attivazione fluida del fallback in memoria temporanea RAM in caso di blocco di sicurezza (Storage Guard attivo).

#### FASE III: Sviluppo del Co-pilota Semantico (Novembre 2026)
*   **Attività**: Integrazione dell'algoritmo di orchestrazione semantica delle istruzioni dell'utente. Implementazione del pannello visuale a due colonne (Comandi a sinistra, Anteprima Foglio Bianco a destra) e della lista dei *Suggerimenti Rapidi*.
*   **Responsabile**: Dr.ssa Silvia e Prof. Vincenzo.
*   **Traguardo di Qualità**: L'IA deve elaborare correttamente il 95% dei comandi standard relativi a margini, font, loghi e sezioni, rigenerando l'HTML del Foglio Bianco in meno di 200ms.

#### FASE IV: Formazione, Test e Delibera Collegiale (Dicembre 2026)
*   **Attività**: Conduzione di sessioni di formazione mirate (2 ore) per i Coordinatori di Dipartimento d'Istituto. Sottoposizione della release v1.7.0 al Collegio dei Docenti per l'adozione formale.
*   **Responsabile**: Prof.ssa Maria Letizia e Prof. Vincenzo.
*   **Traguardo di Qualità**: Almeno l'85% dei docenti deve esprimere un parere "estremamente positivo" nei questionari d'usabilità d'Istituto.

---

## 🔒 5. PROTOCOLLI DI SICUREZZA E MITIGAZIONE DEI RISCHI

Per garantire che la flessibilità del motore di template non pregiudichi la continuità amministrativa della scuola, la Commissione stabilisce tre protocolli di sicurezza:

1.  **Protocollo di Ripristino Istantaneo (Hard Reset)**:
    Il pannello dei modelli deve includere un pulsante di emergenza ben visibile: **`Azzera e Ripristina Modelli di Fabbrica`**. Al clic, l'applicazione cancella qualsiasi modifica locale e ripristina all'istante i 3 modelli d'Istituto standard (approvati dalla Dirigenza).
2.  **Validazione Rigida (Schema Validation Guard)**:
    Qualsiasi modifica generata dal Co-pilota o inserita manualmente viene convalidata rispetto al `JSON-Schema` d'Istituto prima del salvataggio. Se la modifica contiene errori strutturali, il salvataggio viene bloccato e l'applicazione ripristina l'ultima versione sicuramente funzionante.
3.  **Limitazione delle Firme**:
    Le firme digitalizzate non vengono mai salvate nel file. Il sistema genera unicamente i blocchi descrittivi formalmente previsti dal Codice dell'Amministrazione Digitale (CAD), tutelando l'identità del personale scolastico.

---

## 🎓 6. PIANO DI CHANGE MANAGEMENT E FORMAZIONE

La riunione si chiude con la definizione delle azioni per accompagnare i docenti nell'adozione dello strumento:
*   **La Guida Rapida "Modelli Facili"**: Il Prof. Vincenzo redigerà una guida visuale di una pagina, inclusa nel Wiki del sistema, intitolata *“Personalizzare la propria programmazione in 3 domande all'Assistente”*.
*   **Sessioni di Supporto in Compresenza**: Durante le ore di dipartimento di Ottobre/Novembre, l'Animatore Digitale sarà presente per supportare i coordinatori nella prima configurazione dei modelli d'area.

---

La seduta è tolta alle ore 17:15. Il presente verbale viene firmato e depositato nell'archivio digitale d'Istituto, pronto per essere integrato come addendum operativo al PTOF 2026/2027.

*Letto, approvato e sottoscritto.*

**Il Segretario Verbalizzante**  
*Prof. Vincenzo*  

**Il Presidente della Seduta / Dirigente Scolastico**  
*Prof.ssa Maria Letizia*
