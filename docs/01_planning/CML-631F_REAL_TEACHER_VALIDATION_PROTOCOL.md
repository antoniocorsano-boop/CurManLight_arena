# CML-631F — Protocollo di Validazione Reale con Docenti

> Documento di pianificazione preparatorio. **Nessuna validazione è stata avviata.**
> L'esecuzione inizia solo dopo approvazione formale di questo protocollo.

## Identificazione

| Campo | Valore |
|-------|--------|
| Fase | CML-631F — Real Teacher Validation |
| Documento | `docs/01_planning/CML-631F_REAL_TEACHER_VALIDATION_PROTOCOL.md` |
| Data di predisposizione | 2026-08-02 |
| Baseline di riferimento | `31ca25b99d07c70a02073fdfa6a1c65756c182e2` (documentale) / `f2cae27285a9b5a0099b470af708ca0978cb76f6` (funzionale CML-636B, suite 1955/1955) |
| Stato | `READY_FOR_APPROVAL` |
| Verdetto atteso dopo approvazione | `CML_631F_REAL_TEACHER_VALIDATION_PROTOCOL_READY_FOR_APPROVAL` |
| Pubblicazione | Nessun push, merge, rebase o PR |

---

## 1. Obiettivo

Verificare con **docenti reali** la comprensibilità, l'utilità e l'affidabilità del percorso produttivo:

```
UDA
→ documento canonico
→ riapertura
→ versione
→ anteprima
→ validazione
→ stampa/PDF
```

La validazione deve rispondere a tre domande:

1. Il docente **comprende** il percorso (etichette, stati, versioni, anteprime)?
2. Il docente **riesce a completare** i compiti reali (fino al PDF) senza assistenza bloccante?
3. Il risultato finale (documento canonico + PDF) è **percepito come utile** per il lavoro reale?

La fase NON è un test tecnico: i test tecnici sono già coperti dalla suite `1955/1955`. CML-631F misura l'esperienza del docente.

---

## 2. Partecipanti

| Requisito | Specifica |
|-----------|-----------|
| Numero | 3–5 docenti reali |
| Competenza digitale | Preferibilmente livelli diversi (basso / medio / alto) |
| Dati personali studenti | **Nessuno** — vietati all'ingresso dei dati |
| Partecipazione | Volontaria, con consenso informato |
| Valutazione | Nessuna valutazione individuale del docente; si valuta il prodotto, non la persona |

Regole di reclutamento:

- i docenti sono coinvolti **dopo** l'approvazione del protocollo, mai prima;
- il reclutamento non dipende dal team di sviluppo;
- ogni docente partecipa a **una sessione osservata** della durata definita dal copione;
- i dati identificativi raccolti (nome/contatto del docente) servono solo per l'organizzazione e sono trattati secondo il consenso informato.

---

## 3. Scenari osservati

Compiti concreti da far eseguire, in ordine di percorso:

| # | Compito | Cosa verifica |
|---|---------|---------------|
| 1 | Individuare o creare una UDA | Orientamento iniziale, ricerca/creazione |
| 2 | Generare il documento canonico | Comprensione della conversione UDA → documento |
| 3 | Riaprire il documento | Ritrovamento del lavoro precedentemente creato |
| 4 | Riconoscere la versione corrente | Comprensione del concetto di versione |
| 5 | Generare l'anteprima | Comprensione del concetto di anteprima |
| 6 | Comprendere eventuali dati mancanti | Lettura degli stati di incompletezza |
| 7 | Aggiornare l'anteprima | Comprensione del ciclo modifica → nuova resa |
| 8 | Stampare o salvare in PDF | Completamento del percorso fino al PDF |
| 9 | Riconoscere un documento archiviato | Comprensione dell'archivio e del ripristino |
| 10 | Comprendere perché un'esportazione è bloccata | Lettura dei blocchi e dei messaggi di errore |

Ogni scenario ha un compito definito con un **criterio di completamento osservabile** (ad es. "il PDF viene aperto e contiene il contenuto della UDA corrente").

---

## 4. Dati da raccogliere

Per ogni scenario:

- completamento o mancato completamento (esito binario + livello di assistenza);
- tempo per scenario (cronometrato dal facilitatore, non percepito dal docente);
- richieste di aiuto (numero e punto in cui avvengono);
- errori (descrizione, frequenza);
- esitazioni (punti in cui il docente si ferma o chiede conferma);
- terminologia non compresa (etichette, stati, termini tecnici);
- passaggi saltati (dove il docente salta o evita un passaggio);
- problemi di navigazione (spostamenti, ritorni, dispersione);
- comprensione di versione, anteprima e validazione (valutazione del facilitatore);
- utilità percepita del documento finale (scala + commento);
- osservazioni libere (note del docente e del facilitatore).

---

## 5. Strumenti

| Strumento | Scopo | Stato |
|-----------|-------|-------|
| Scheda introduttiva per il docente | Obiettivo, durata, cosa verrà osservato, diritti | Da predisporre in fase di esecuzione |
| Consenso informato essenziale | Partecipazione volontaria, uso dei dati, registrazioni | Da predisporre in fase di esecuzione |
| Copione del facilitatore | Sequenza di compiti, tempi, interventi ammessi | Da predisporre in fase di esecuzione |
| Scheda di osservazione | Cattura dati per scenario (sezione 4) | Da predisporre in fase di esecuzione |
| Domande finali | Percezione, comprensione, utilità, criticità | Da predisporre in fase di esecuzione |
| Griglia di sintesi delle sessioni | Riepilogo dei risultati per sessione | Da predisporre in fase di esecuzione |
| Registro dei problemi | Elenco problemi rilevati con contesto | Da predisporre in fase di esecuzione |
| Matrice severità/frequenza | Classificazione dei problemi | Da predisporre in fase di esecuzione |
| Modello di rapporto finale | Struttura dell'esito della validazione | Da predisporre in fase di esecuzione |

Nota: gli strumenti sono elencati come **consegne minime**; i contenuti esatti vengono sviluppati in fase di esecuzione, dopo l'approvazione del protocollo e senza toccare l'ambiente di produzione.

---

## 6. Vincoli

- **Nessun dato reale degli studenti** (i dati di esempio sono sintetici o de-identificati).
- **Nessuna registrazione audio o video senza consenso specifico** (e solo per lo scopo dichiarato).
- **Nessuna telemetria** (nessuna raccolta automatica di utilizzo).
- **Nessun invio remoto** (i dati restano locali).
- **Nessuna modifica automatica del lavoro** del docente (nessuna azione di sistema non richiesta).
- **Nessuna promessa di anonimato se vengono raccolti dati identificativi**: si dichiara esplicitamente cosa si raccoglie e come si protegge.
- **Separazione tra problemi del prodotto e difficoltà personali del partecipante**: ogni problema è registrato rispetto al prodotto, mai attribuito al docente; nessuna valutazione individuale.
- L'ambiente usato per la validazione NON è l'ambiente di produzione corrente con dati reali.

---

## 7. Criteri di successo

Soglie verificabili, motivate da obiettivi di prodotto (nessuna percentuale arbitraria).

| Criterio | Soglia | Motivazione |
|----------|--------|-------------|
| Completamento dei compiti principali (1, 2, 5, 8, 10) | ≥ 80% dei partecipanti completa senza aiuto sostanziale | Il percorso deve essere percorribile senza intervento bloccante |
| Comprensione delle etichette (4, 5, 6) | ≥ 3 partecipanti su 5 (o ≥ 2 su 3) non segnalano terminologia oscura | Le etichette sono la lingua del prodotto |
| Assenza di errori bloccanti ricorrenti | Nessun errore bloccante ricorrente (severità alta, frequenza multipla) | Un blocco ripetuto impedisce l'adozione |
| Comprensione del rapporto versione ↔ anteprima | ≥ 3 partecipanti su 5 (o ≥ 2 su 3) descrivono correttamente la relazione | Concetto centrale del modello canonico |
| Capacità di ottenere il PDF | ≥ 80% dei partecipanti ottiene il PDF (scenario 8) | Il PDF è l'output finale utile |
| Utilità percepita | ≥ 3 partecipanti su 5 (o ≥ 2 su 3) valutano il documento finale utile | Conferma di valore per il docente |

Le soglie sono **punti di decisione**, non metriche pubblicitarie: se non vengono raggiunte, scatta il verdetto `CORRECT_BEFORE_EXTENSION` o `SUSPEND`.

---

## 8. Verdetti possibili

| Verdetto | Significato |
|----------|-------------|
| `EXTEND` | Percorso sufficientemente comprensibile e utile: si estende la validazione (più docenti/più scenari) o si procede alla fase successiva |
| `CORRECT_BEFORE_EXTENSION` | Valore confermato ma presenti problemi da correggere prima di estendere |
| `SUSPEND` | Problemi strutturali o valore non confermato: si sospende la validazione e si rivaluta la priorità |
| `INSUFFICIENT_EVIDENCE` | Partecipanti o sessioni insufficienti per una decisione affidabile: si ripete o si allarga la validazione |

---

## 9. Criteri di interruzione

La sessione viene interrotta quando:

- **dati personali inseriti accidentalmente** (si sospende la sessione, si raccoglie solo quanto serve per il de-identificazione e si registra l'evento);
- **disagio del partecipante** (il docente chiede di fermarsi o mostra disagio evidente);
- **malfunzionamento che impedisce il percorso** (l'ambiente non consente di completare gli scenari);
- **impossibilità di distinguere un problema del prodotto da un problema ambientale** (problemi di rete/macchina/firma che contaminano l'osservazione).

In ogni caso di interruzione, l'osservazione parziale è comunque registrata e classificata, e si valuta se conta come evidenza.

---

## 10. Piano di analisi

Aggregazione dei dati raccolti:

1. **Risultati per scenario** — esiti di completamento, tempo e livello di assistenza per ciascun compito;
2. **Problemi per gravità** — matrice severità/frequenza (bloccante / significativo / minore × frequente / sporadico);
3. **Frequenza** — quante sessioni riportano lo stesso problema;
4. **Ruolo o profilo del partecipante** — correlazione dei risultati con il livello di competenza digitale dichiarato;
5. **Osservazioni qualitative** — note libere riassunte per tema;
6. **Divergenze tra test tecnici ed esperienza reale** — punti in cui la suite verde non corrisponde a un'esperienza fluida (se presenti).

L'esito dell'analisi confluisce nel **rapporto finale**, che termina con un verdetto tra quelli della sezione 8.

---

## 11. Cosa NON rientra in questa fase

- reclutamento di partecipanti;
- fissazione di date;
- raccolta di dati;
- modifica di codice;
- creazione di questionari in ambiente di produzione;
- esecuzione di test con docenti reali.

Tutto quanto sopra inizia **solo dopo l'approvazione formale del protocollo**.

---

## Verdetto

**`CML_631F_REAL_TEACHER_VALIDATION_PROTOCOL_READY_FOR_APPROVAL`** — protocollo predisposto e coerente con la roadmap approvata (`CML_MASTER_ROADMAP_STATUS_APPROVED_LOCAL`); nessuna validazione avviata.
