# Knowledge Companion — Piano di Validazione Esplorativa

> Preparazione della fase di validazione con docenti reali. Prototipo interattivo limitato ai passaggi 2–4 del wizard UDA.

## 1. Stato

| Campo | Valore |
|---|---|
| Documento di riferimento | `docs/proposals/KNOWLEDGE_COMPANION.md` |
| Verdetto precedente | `KNOWLEDGE_COMPANION_READY_FOR_USER_VALIDATION` |
| Approvazione piano | `VALIDATION_PLAN_APPROVED_FOR_INTERACTIVE_MOCK_PREPARATION` |
| Fase corrente | Costruzione del mock interattivo |
| Obiettivo | Verificare se il prototipo risolve i problemi identificati dall'analisi |
| Perimetro | Passi 2, 3, 4 del wizard UDA |
| Output | Mock interattivo validabile, separato dal prodotto reale |
| Non è | Implementazione runtime definitiva |

## 2. Cosa si va a verificare

Sette punti di verifica, collegati a evidenze osservabili:

| # | Punto di verifica | Domanda chiave | Evidenza da osservare |
|---|---|---|---|
| V1 | Individuazione | "Il pannello è percepito?" | Il docente nota autonomamente il riferimento |
| V2 | Comprensione | "La pertinenza è comprensibile?" | Sa spiegare perché viene mostrato |
| V3 | Autorevolezza | "La fonte è credibile?" | Distingue fonte normativa, curricolare e approfondimento |
| V4 | Autonomia | "L'interazione è volontaria?" | Usa o ignora il riferimento senza sentirsi guidato |
| V5 | Facoltatività | "Il pannello è opzionale?" | Prosegue senza aprire il pannello |
| V6 | Conservazione del contesto | "Il contesto è preservato?" | Torna al wizard senza disorientamento |
| V7 | Utilità | "Il supporto è utile?" | La fonte incide positivamente sulla scelta o sulla comprensione |

**Nota:** La semplice apertura del riferimento non è prova sufficiente di utilità. L'osservazione deve verificare se la consultazione ha influenzato la decisione o la comprensione.

## 3. Modello di partecipazione

### Modello consigliato (4 partecipanti)

| # | Profilo | Esperienza | Uso CurManLight | Cosa verificare |
|---|---|---|---|---|
| A | Docente di classe esperto | 10+ anni | Regular | Utilità operativa, ignorabilità |
| B | Docente di classe meno esperto | 1–3 anni | Occasionale | Comprensibilità, orientamento |
| C | Docente di sostegno | Qualsiasi | Regular | Pertinenza inclusiva, normativa |
| D | Coordinatore o referente | 5+ anni, coordinamento | Regular | Rischio di trasformazione in adempimento |

### Modello minimo (3 partecipanti)

| # | Profilo | Cosa verificare |
|---|---|---|
| A | Docente con esperienza consolidata | Utilità operativa, ignorabilità |
| B | Docente con minore familiarità con la progettazione UDA | Comprensibilità, orientamento |
| C | Docente di sostegno | Pertinenza inclusiva, normativa |

Il coordinatore (profilo D) viene coinvolto in una breve revisione separata, non come prova d'uso principale.

**Il campione resta qualitativo ed esplorativo. Non deve essere presentato come statisticamente rappresentativo.**

## 4. Scenari di test

> **Nota:** Tutti gli scenari usano dati fittizi standardizzati. I dati sono plausibili ma chiaramente non riconducibili a studenti, classi reali, istituti identificabili, PDP, PEI, situazioni personali o documenti effettivamente prodotti dai partecipanti.

### Scenario 1 — Passo 2: Traguardi (Italiano / Primaria)

| Campo | Dato |
|---|---|
| Situazione | Nuovo UDA di scrittura creativa, passo 2 |
| Compito | Selezionare i traguardi per l'UDA |
| Dati fittizi | Titolo: "La poesia e l'emozione: composizione e lettura ad alta voce"; Disciplina: Italiano; Ordine: Primaria |
| Riferimento principale | `[Curricolo] Traguardi Italiano / Primaria — Vol. 4` |
| Riferimenti espandibili | `[Curricolo] Dettaglio Discipline — Vol. 8`, `[Approfondimento] "Traguardo" — Vol. 6` |
| Osservare | Se nota il pannello, se legge il riferimento principale, se espande |

### Scenario 2 — Passo 3: Evidenze (Scienze / Secondaria)

| Campo | Dato |
|---|---|
| Situazione | UDA di laboratorio scientifico, passo 3 |
| Compito | Selezionare le evidenze di certificazione |
| Dati fittizi | Titolo: "Osservazione e classificazione degli organismi in ambiente naturale"; Disciplina: Scienze; Ordine: Secondaria |
| Riferimento principale | `[Fonte normativa] DM 14/2024: evidenze — Vol. 3` |
| Riferimenti espandibili | `[Approfondimento] "Evidenza Comportamentale" — Vol. 6` |
| Osservare | Se comprende cosa sono le evidenze, se apre il riferimento normativo |

### Scenario 3 — Passo 4: Compito di Realtà (Italiano / Secondaria)

| Campo | Dato |
|---|---|
| Situazione | UDA di analisi del testo, passo 4 |
| Compito | Scrivere il compito di realtà e le note BES |
| Dati fittizi | Titolo: "Analisi di un testo letterario del Novecento"; Disciplina: Italiano; Ordine: Secondaria |
| Riferimento principale | `[Approfondimento] "Compito di Realtà" — Vol. 6` |
| Riferimenti espandibili | `[Fonte normativa] PEI/PDP/UDL — Vol. 3`, `[Approfondimento] Metodologie — Vol. 19` |
| Osservare | Se consulta la definizione, se riconosce la categoria, se mantiene il contesto |

### Scenario 4 — Passo 4: BES/DSA (Matematica / Primaria)

| Campo | Dato |
|---|---|
| Situazione | UDA con alunno con bisogni specifici, passo 4 |
| Compito | Scrivere le note di inclusione |
| Dati fittizi | Titolo: "Geometria: forme, misure e spazio"; Disciplina: Matematica; Ordine: Primaria |
| Riferimento principale | `[Fonte normativa] PEI/PDP/UDL — Vol. 3` |
| Osservare | Se riconosce la fonte normativa, se la consulta, se il linguaggio è neutro |

### Scenario 5 — Ignorabilità (Italiano / Primaria, esperto)

| Campo | Dato |
|---|---|
| Situazione | Docente esperto, passo 2 |
| Compito | Selezionare traguardi senza consultare i riferimenti |
| Osservare | Se il pannello disturba, se è possibile ignorarlo, se blocca l'avanzamento |

## 5. Mock interattivo — Specifica

### Formato

Il mock è un **prototipo HTML/CSS/JS standalone** (nessuna dipendenza esterna), apribile in un browser. Non usa React, Zustand o il stack di CurManLight. L'obiettivo è verificare percezione e comportamento, non funzionalità.

### Posizione

```
mocks/knowledge-companion/
  index.html          ← Entry point
  styles.css          ← Stili del mock
  scenarios.js        ← Logica di navigazione tra stati
  data.js             ← Dati fittizi dei riferimenti
```

La cartella `mocks/` è separata da `src/` e non interferisce con il build.

### Stati da prototipare (6 stati)

| # | Stato | Descrizione | Scenari |
|---|---|---|---|
| S1 | Pannello chiuso (1 riferimento) | 1 riferimento principale + "[Mostra altre N fonti →]" | Tutti |
| S2 | Pannello espanso | Tutti i riferimenti visibili con categorie | 1, 2, 3 |
| S3 | Overlay aperto | Reader con contenuto del volume, wizard visibile sullo sfondo | 2, 3, 4 |
| S4 | Overlay chiuso | Ritorno al wizard con dati intatti | 3 |
| S5 | Stato vuoto | "Nessun riferimento specifico per questa combinazione" | Non previsto |
| S6 | Stato mobile | Pannello compatto su schermo stretto (max-width: 480px) | 1 |

### Interazioni (4 interazioni definite senza ambiguità)

| # | Interazione | Trigger | Effetto |
|---|---|---|---|
| I1 | Espandere le fonti | Click "Mostra altre N fonti →" | Il pannello si espande, mostra tutti i riferimenti |
| I2 | Aprire l'approfondimento | Click "Approfondisci" | Si apre l'overlay con il reader del volume |
| I3 | Chiudere l'approfondimento | Click "✕" sull'overlay | L'overlay si chiude, il wizard è ancora lì con i dati intatti |
| I4 | Continuare nel wizard | Click "Avanti →" | Si avanza al passo successivo (il pannello si aggiorna) |

### Funzionalità escluse dal mock

Il mock non deve simulare:
- Tracciamento delle letture ("letto")
- Chat o conversazione
- Generazione di contenuti
- Archivio UDA
- WikiLLM
- Documenti personalizzati
- Proposte expert
- Navigazione reale (rotte React)

### Dati fittizi standardizzati

| Campo | Scenario 1 | Scenario 2 | Scenario 3 | Scenario 4 |
|---|---|---|---|---|
| Titolo UDA | "La poesia e l'emozione" | "Osservazione organismi" | "Analisi testo Novecento" | "Geometria: forme e spazio" |
| Disciplina | Italiano | Scienze | Italiano | Matematica |
| Ordine | Primaria | Secondaria | Secondaria | Primaria |
| Passo | 2 | 3 | 4 | 4 |
| Traguardi sel. | T1, T2 | — | T1 | T1, T2 |
| Evidenze sel. | — | 2 | 1 | — |
| Compito di realtà | — | — | "Analisi guidata di un racconto" | — |
| Note BES | — | — | — | "Strumenti compensativi visivi" |

### Contenuto dei riferimenti (estratti)

| Riferimento | Categoria | Fonte | Testo visibile nel pannello |
|---|---|---|---|
| Traguardi Italiano / Primaria | **Curricolo** | Vol. 4 | "Il bambino usa la lingua italiana, arricchisce e precisa il proprio lessico, comprende parole e discorsi. Esprime con efficacia idee e sentimenti in forma orale e scritta." |
| Dettaglio 14 Discipline | **Curricolo** | Vol. 8 | "Mappatura classe per classe delle 14 discipline del curricolo fondativo, con obiettivi specifici per ogni ordine e livello." |
| "Traguardo di Competenza" | **Approfondimento** | Vol. 6 | "Il traguardo descrive la competenza attesa alla fine del ciclo scolastico. Si distingue dall'obiettivo di apprendimento, che è più specifico e misurabile." |
| DM 14/2024: evidenze | **Fonte normativa** | Vol. 3 | "Le evidenze comportamentali, ai sensi del DM 14/2024, sono osservabili e misurabili. Collegate ai traguardi di competenza, documentano il processo di certificazione." |
| "Evidenza Comportamentale" | **Approfondimento** | Vol. 6 | "Comportamento osservabile che dimostra il raggiungimento di un traguardo. Si distingue dall'obiettivo di apprendimento per la sua natura integrativa." |
| "Compito di Realtà" | **Approfondimento** | Vol. 6 | "Prodotto o servizio reale che l'alunno produce utilizzando le competenze sviluppate nell'Unità Didattica di Apprendimento. Caratteristiche: autenticità, complessità, contestualizzazione." |
| PEI/PDP/UDL | **Fonte normativa** | Vol. 3 | "PEI (Legge 104/1992), PDP (D.Lgs. 62/2017), UDL (Universal Design for Learning): strumenti compensativi, misure dispensative, valutazione personalizzata." |
| Metodologie Cooperative | **Approfondimento** | Vol. 19 | "Jigsaw, Peer Tutoring, Learning Station: metodologie per l'inclusione attiva. Ogni studente contribuisce con un ruolo definito alla costruzione collettiva del sapere." |

### Layout del mock

```
┌──────────────────────────────────────────────────────┐
│  Header: "Knowledge Companion — Mock di Validazione"  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │  Wizard: Step N di 5 — Titolo Passo   XX%   │    │
│  │  ════════════════════════░░░░░░░░░░░░░░░░░ │    │
│  │                                              │    │
│  │  [Contenuto del passo: campi, checkbox,      │    │
│  │   textarea, secondo lo scenario]             │    │
│  │                                              │    │
│  │  ─── Riferimenti utili — N fonte ──────────  │    │
│  │  [Riferimento principale con categoria]      │    │
│  │  [Approfondisci]  [Mostra altre N fonti →]   │    │
│  │                                              │    │
│  │  [← Indietro]                    [Avanti →] │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │  Log osservatore (visibile solo al tester)   │    │
│  │  Timestamp | Azione | Riferimento            │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Log osservatore

Il mock include un pannello nascosto (toggle con tasto `L`) che registra:
- Timestamp
- Azione (click, espansione, apertura overlay, chiusura overlay, avanzamento)
- Riferimento coinvolto

I dati restano nel browser (localStorage). Nessuna comunicazione esterna.

## 6. Sequenza di esecuzione

| # | Fase | Attività | Prerequisito |
|---|---|---|---|
| 1 | Preparazione mock | Costruzione del mock HTML/CSS/JS standalone | Nessuno |
| 2 | Prova interna | Verificare che tutti gli stati e le interazioni funzionino | Mock completato |
| 3 | Preparazione materiali | Questionario pre-test, griglia di osservazione, domande post-test | Mock superato la prova interna |
| 4 | Reclutamento | Invio inviti a 3-4 docenti (profili diversi) | Materiali pronti |
| 5 | Sessioni di test | 1 partecipante per sessione, 20-30 min, scenario standardizzato | Partecipanti confermati |
| 6 | Analisi | Raccolta osservazioni, Likert, feedback → matrice V1-V7 | Sessioni completate |
| 7 | Verdetto | Redazione esito con raccomandazione | Analisi completata |

**Non è opportuno reclutare i partecipanti prima che il mock abbia superato una prova interna completa.**

## 7. Raccolta dati

### Per ogni partecipante

| Dato | Metodo |
|---|---|
| Profilo | Questionario pre-test (esperienza, uso CurManLight) |
| Osservazione diretta | Trascrizione comportamento durante il test (log mock + osservatore) |
| Feedback verbale | Domande aperte post-test |
| Percezione | Scala Likert (1-5) per ciascun punto di verifica V1-V7 |

### Domande post-test

1. "Hai notato la sezione Riferimenti sotto i campi?"
2. "Hai capito perché quel riferimento era lì?"
3. "Hai riconosciuto che tipo di fonte era?"
4. "Hai cliccato su Approfondisci? Perché sì/no?"
5. "Ti ha disturbato quando non lo usavi?"
6. "Sei riuscito a tornare al wizard senza perdere i dati?"
7. "I riferimenti ti sono stati utili per fare la tua scelta?"
8. "Cosa mancava che avresti voluto vedere?"

### Scala Likert (per V1-V7)

| Punteggio | Significato |
|---|---|
| 1 | Per niente d'accordo |
| 2 | Poco d'accordo |
| 3 | Né d'accordo né in disaccordo |
| 4 | Abbastanza d'accordo |
| 5 | Completamente d'accordo |

## 8. Criteri di esito

### `KNOWLEDGE_COMPANION_VALIDATED_FOR_PROTOTYPE`

Usare quando:
- Il riferimento viene notato (V1)
- La fonte è compresa (V2)
- Il pannello non ostacola il lavoro (V5)
- Almeno alcuni partecipanti ricavano un beneficio concreto (V7)
- Non emerge percezione di prescrittività
- Non sono richieste modifiche a navigazione o architettura

**Azione:** Procedere con prototipo funzionante nei passi 2-4.

### `KNOWLEDGE_COMPANION_REQUIRES_REDESIGN`

Usare quando il valore è percepito, ma:
- Il pannello è troppo invasivo
- Le fonti non sono abbastanza distinguibili
- L'espansione non è chiara
- L'approfondimento interrompe il flusso
- Il comportamento mobile è debole

**Azione:** Rivedere il design del pannello (posizione, formato, linguaggio).

### `KNOWLEDGE_COMPANION_VALUE_NOT_CONFIRMED`

Usare quando:
- I riferimenti vengono ignorati
- Non migliorano la comprensione
- Il docente preferisce gli strumenti già esistenti
- Il problema ipotizzato non emerge durante le prove

**Azione:** Investigare il motivo: riferimenti non pertinenti? Contenuto insufficiente? Timing sbagliato?

### `KNOWLEDGE_COMPANION_REJECTED`

Riservare ai casi in cui:
- Il supporto aumenta il carico cognitivo
- Viene percepito come prescrittivo
- Duplica chiaramente SecondBrain o Copilot
- Richiede cambiamenti incompatibili con le baseline

**Azione:** Bloccare l'iniziativa. Il problema potrebbe non essere risolto con questo approccio.

## 9. Output attesi

| Output | Formato | Contenuto |
|---|---|---|
| Mock | HTML/CSS/JS standalone in `mocks/knowledge-companion/` | Stati del pannello, overlay, transizioni, log osservatore |
| Dati grezzi | Tabella per partecipante | Osservazioni, Likert, feedback verbali |
| Analisi | Matrice V1-V7 × partecipanti | Punteggi, pattern, differenze tra profili |
| Verdetto | `KNOWLEDGE_COMPANION_VALIDATED_FOR_PROTOTYPE` o equivalente | Esito con motivazione e raccomandazioni |

## 10. Vincoli

- Nessuna modifica al codice runtime (`src/`)
- Nessun nuovo branch o commit
- Il mock è un artefatto separato in `mocks/`, non integrato nel prodotto
- I dati dei partecipanti sono anonimi e locali (localStorage del mock)
- Nessuna comunicazione esterna
- Nessun tracciamento del comportamento oltre il log osservatore locale
- I dati fittizi non sono riconducibili a studenti, classi, istituti reali

---

*Documento di preparazione della validazione. Nessuna modifica al codice è stata effettuata.*
