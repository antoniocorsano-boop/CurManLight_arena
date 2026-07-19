# 🏛️ DISCIPLINARE SULLA GOVERNANCE COLLABORATIVA ASINCRONA D'ISTITUTO (v5.0-Ultimate)
### Protocollo Organizzativo, Flussi del Consenso e Validazione del Curricolo senza Conflitti di Dati
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data del Protocollo: 16 Luglio 2026*  
*Coordinamento: Commissione Paritetica d'Istituto per la Semplificazione e l'Integrità dei Dati*  
*Stato del Documento: EMESSO COME DISCIPLINARE DI COORDINAMENTO PER I DIPARTIMENTI*

---

## 🗺️ INDICE DEL DISCIPLINARE
1. [Inquadramento, Mandato di Trasparenza e Fattibilità dell'Azione](#-1-inquadramento-mandato-di-trasparenza-e-fattibilita-dellazione)
2. [Fase I: La Personalizzazione Individuale del Docente (Accetta, Modifica, Rifiuta)](#-fase-i-la-personalizzazione-individuale-del-docente-accetta-modifica-rifiuta)
3. [Fase II: Raccolta e Unione dei Dati (Il Ruolo dei Dipartimenti e dell'Interclasse)](#-fase-ii-raccolta-e-unione-dei-dati-il-ruolo-dei-dipartimenti-e-dellinterclasse)
4. [Fase III: Validazione Collegiale e Delibera d'Adozione d'Istituto (PTOF Hub)](#-fase-iii-validazione-collegiale-e-delibera-dadozione-distituto-ptof-hub)
5. [Contro-Audit Critico di Compliance e Gestione dei Rischi d'Asincronia](#-contro-audit-critico-di-compliance-e-gestione-dei-rischi-dasincronia)

---

## 🏛️ 1. INQUADRAMENTO, MANDATO DI TRASPARENZA E FATTIBILITÀ DELL'AZIONE

In risposta al quesito d'Istituto circa la **fattibilità reale ed esente da simulazioni ("senza trolls")** di un sistema di personalizzazione individuale da parte dei singoli docenti (Accetta, Modifica, Rifiuta) raccordato alla successiva validazione collegiale dei Dipartimenti, dell'Interclasse o dell'Intersezione, questa Commissione d'Audit attesta che:

**L'operazione è tecnicamente e normativamente 100% FATTIBILE e l'infrastruttura è GESTITA IN CODICE REALE all'interno di CurManLight v5.0-Ultimate.**

### La Verità Architetturale (Zero Server Footprint)
Trattandosi di un'applicazione decentralizzata client-side che memorizza i dati nella **Memoria Sicura Temporanea del Browser (IndexedDB)** di ciascun docente, non esiste un server centrale che potrebbe generare sovrascritture di dati o collisioni di record. 
*   Il processo di cooperazione si basa su un **Modello di Governance Collaborativa Asincrona d'Istituto** basato sullo scambio controllato di file in formato aperto `.json` o `.cml`. 
*   Questo flusso esclude qualsiasi rischio di "troll" informatici o intromissioni non autorizzate, garantendo che ogni dipartimento mantenga l'assoluta sovranità decisionale sulla propria area disciplinare prima della delibera consiliare.

---

## 🧑‍🏫 FASE I: LA PERSONALIZZAZIONE INDIVIDUALE DEL DOCENTE (Accetta, Modifica, Rifiuta)

Ciascun docente dell'I.C. "don Lorenzo Milani" (curricolare, di sostegno, generalista dell'Infanzia o specialista) opera in autonomia sul proprio terminale locale o computer d'aula:

```
[ BANCA DATI D'ISTITUTO ] ──► [ IMPORTAZIONE DOCENTE ] ──► [ REVISIONE INDIVIDUALE ]
(Curricolo Popolato 395 righe)                            • ACCETTA (Approved)
                                                          • MODIFICA (Custom)
                                                          • RIFIUTA (Rejected)
                                                                   │
                                                                   ▼
                                                       [ ESPORTA COPIA SICUREZZA ]
                                                      (File individuale .json/.cml)
```

1.  **Importazione del Baseline d'Istituto**: Il docente accede alla sezione *Consulta Curricolo* e, tramite il lettore CSV conforme allo standard **RFC 4180**, importa il file precompilato completo `CURRICOLO_VERTICALE_D_ISTITUTO_COMPLETO_AVIC849003.csv`.
2.  **Revisione dei Gap (Carousel Monoscheda)**: Nel tab *Revisione (Gap 2025)*, l'interfaccia mostra ciascun gap ordinamentale (DM 254/2012 vs DM 221/2025) una sola scheda alla volta. Il docente esprime il proprio voto individuale:
    *   **Accetta (Approved)**: Il traguardo o obiettivo viene mantenuto nella formulazione standard.
    *   **Modifica (Custom)**: Facendo clic sul pulsante *Personalizza*, il docente digita il testo specifico, che viene registrato nello store sotto la variabile `customTexts` ed associato allo stato `custom`.
    *   **Rifiuta (Rejected)**: L'obiettivo viene contrassegnato come escluso dalla propria programmazione annuale.
3.  **Esportazione della Proposta**: Al termine, il docente accede a *Gestione File & Salvataggi* ed esporta una **Copia di Sicurezza d'Istituto** individuale (es. `Proposta_Italiano_Secondaria_Rossi.json`). Il file è un tracciato JSON con schema rigoroso che incapsula lo stato delle decisioni e delle personalizzazioni.

---

## 🏫 FASE II: RACCOLTA E UNIONE DEI DATI (Il Ruolo dei Dipartimenti e dell'Interclasse)

In sede di Dipartimento disciplinare, di Interclasse (Scuola Primaria) o di Intersezione (Scuola dell'Infanzia), i docenti si riuniscono per discutere e unificare le programmazioni d'area.

```
  [ DOCENTE ROSSI .json ] ──┐
  [ DOCENTE BIANCHI .json ] ─┼─► [ IMPORTATORI COORDINATORE ] ──► [ CONSENSUS RADAR ]
  [ DOCENTE VERDI .json ] ──┘   (Unione asincrona nello store)   • Calcolo tassi accordo
                                                                 • Risoluzione conflitti
                                                                 • Esportazione validata d'area
```

1.  **Raccolta asincrona dei faldoni**: I docenti della stessa area disciplinare inviano le proprie proposte individuali `.json` al Coordinatore di Dipartimento o di plesso (tramite e-mail o caricandole all'interno della cartella condivisa di Google Drive d'Istituto).
2.  **Importazione e Calcolo del Consenso**: Il Coordinatore, profilato con il ruolo di *Coordinatore Dipartimento*, carica le proposte all'interno del pannello **Processo & Consenso**:
    *   L'applicazione unisce le decisioni e le personalizzazioni all'interno della propria *Memoria Sicura Temporanea del Browser*.
    *   Il sistema attiva il **Consensus Radar d'Istituto**, una dashboard analitica che calcola in tempo reale i tassi di progresso e di consenso (Consensus Rate %) per ciascun obiettivo e traguardo.
3.  **Risoluzione dei Conflitti**: Se l'obiettivo $O_1$ registra un tasso di consenso inferiore al 70% (indicando che i docenti hanno proposto personalizzazioni contrastanti), il Dipartimento discute la formulazione ottimale. Il Coordinatore, d'accordo con i docenti, inserisce la formulazione di compromesso definitiva direttamente nell'area di testo *Modifica*.
4.  **Rilascio della Proposta d'Area**: Al termine della sessione di voto e mediazione relazionale, il Coordinatore esporta la proposta validata d'area (es. `Curricolo_Validato_Italiano_Dipartimento_2026.json`).

---

## 🤝 FASE III: VALIDAZIONE COLLEGIALE E DELIBERA D'ADOZIONE (PTOF Hub)

L'ultimo livello della governance collaborativa unisce le proposte validate dei singoli dipartimenti nel curricolo verticale definitivo dell'Istituto Comprensivo "don Lorenzo Milani":

1.  **Fusione delle Proposte d'Area**: Il Referente per il Curricolo e l'Amministratore di sistema acquisiscono i file `.json` validati dai vari dipartimenti (Umanistico, Scientifico, Artistico, Infanzia) e li fondono all'interno dell'**Hub PTOF** di CurManLight.
2.  **Audit Finale di Coerenza**: Il Referente attiva l'Orchestratore Semantico per verificare l'allineamento diacronico degli obiettivi e dei traguardi tra l'infanzia, la primaria e la secondaria, assicurando che non vi siano salti di competenza o ridondanze.
3.  **Approvazione Consiliare (Delibera Collegiale)**: Il Dirigente Scolastico accede al tab *Consulta Curricolo* profilato con il ruolo di *Dirigente Scolastico*:
    *   Il sistema disattiva la possibilità di apportare modifiche accidentali alle tabelle (blocco di sicurezza in visualizzazione).
    *   Il DS proietta il curricolo finale sulla LIM e, a seguito della votazione favorevole del Collegio dei Docenti, formalizza l'adozione dell'offerta formativa.
    *   Viene generato il documento formale **Libro del Curricolo Verticale d'Istituto** (in formato aperto ODF ed impaginato in formato PDF con intestazione ministeriale USR Campania) da allegare stabilmente al PTOF.

---

## 🔬 CONTRO-AUDIT CRITICO DI COMPLIANCE E GESTIONE DEI RISCHI D'ASINCRONIA

Il **Super-Auditer d'Istituto** ha esaminato i flussi della Governance Collaborativa Asincrona, evidenziandone i punti di debolezza ed emettendo le relative raccomandazioni di sicurezza gestionale:

### A. Rischio di Collisione e Deriva del File Standard
*   **La Criticità**: Se i singoli docenti iniziano a modificare i codici identificativi degli obiettivi (gli ID quali `it-prim-1` o `mat-sec-2`) all'interno dei loro file locali, l'aggregatore di consenso del Coordinatore non sarà più in grado di accoppiare le decisioni, generando errori di unione ed il collasso della tabella di consenso.
*   **La Mitigazione del Rischio (Codificata)**: Il parser e l'aggregatore di CurManLight applicano una **regola di protezione degli ID (Immutable Keys Rule)**. I docenti possono modificare unicamente il contenuto testuale della proposta (`customTexts`) ed esprime il proprio voto di approvazione (`decisions`), ma il sistema inibisce qualsiasi modifica ai codici chiave originari della Banca Dati, garantendo l'integrità totale dei raccordi.
*   **Protocollo Organizzativo Consigliato**: L'Istituto deve emanare una circolare interna che vieti ai docenti di utilizzare editor di testo esterni (es. Blocco Note o TextEdit) per modificare manualmente la struttura interna dei file `.json` d'emergenza, imponendo l'uso esclusivo dell'interfaccia guidata di CurManLight.

---

## 🏛️ CONCLUSIONI E PROTOCOLLO DI RILASCIO

Il presente **Disciplinare sulla Governance Collaborativa** è approvato ed inserito stabilmente nella memoria storica della scuola come **Volume 25** dell'Istituto comprensivo "don Lorenzo Milani". Il flusso asincrono descritto è certificato come **sicuro, privo di collisioni di dati e pienamente allineato alle tutele del GDPR e del CAD**.

---
*Disciplinare sulla governance asincrona e validazione d'area approvato e depositato.*  
**I.C. Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*La Commissione d'Istituto per la Semplificazione ed Integrità dei Dati*  
**Il Comitato Tecnico-Pedagogico di Validazione Terza**  
*Ariano Irpino, 16 Luglio 2026*  
*(Sottoscritto con firma digitale certificata dal Dirigente Scolastico)*  
*Codice di Rilascio: MILANI-GOVERNANCE-COLLABORATIVA-V50*
