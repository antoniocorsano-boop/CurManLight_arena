# Knowledge Companion

> Fase di osservazione, analisi e mock — prima dell'implementazione.

## 1. Baseline

| Campo | Valore |
|---|---|
| Commit | `4d416df` |
| Allineamento | 0/0 |
| Teacher Workspace | Integrato, chiuso, congelato |
| Architettura | Congelata (CML-603) |
| Navigazione | Congelata (CML-604) |
| Shell | Congelata |
| Test | 128/128 PASS |
| Iniziativa selezionata | Knowledge Companion |
| Iniziative rinviate | Decision Support, Document Continuity |
| Fase corrente | Osservazione → Analisi → Mock |

**Vincoli operativi:**
- Nessuna modifica a file runtime
- Nessun nuovo branch
- Nessun commit, push, PR, merge
- Nessuna modifica a shell, routing o navigazione
- Nessuna nuova rotta
- Nessuna nuova dipendenza
- Nessun backend o servizio remoto
- Nessuna chat conversazionale generale
- Nessuna duplicazione di SecondBrain o Copilot

## 2. Obiettivo di prodotto

**Frase:**

> "Il docente potrà trovare, nei passaggi centrali della progettazione UDA, i riferimenti più pertinenti al lavoro in corso senza abbandonare il contesto operativo."

**Problema:** Il docente lavora nei passi 2, 3 e 4 del wizard UDA e ha bisogno di informazioni da SecondBrain, Curricolo o Copilot — viste separate. Deve abbandonare il wizard, cercare, leggere, tornare. Ogni passaggio del wizard richiede questo ciclo.

**Obiettivo ridotto:** Collegare i riferimenti già esistenti nel prodotto (SecondBrain volumi, Curricolo traguardi/obiettivi/evidenze, glossario) ai passi 2-4 del wizard, mostrando un riferimento principale con possibilità di espandere altri, con fonte visibile, grado di autorevolezza e possibilità di approfondimento. Esclusi dalla prima fase: proposte expert, UDA archiviati, WikiLLM, documenti personalizzati.

**Non è:**
- Un assistente conversazionale generale
- Un generatore automatico di UDA
- Un sistema che prende decisioni al posto del docente
- Una nuova area autonoma dell'applicazione
- Una nuova navigazione
- Un'estensione indiscriminata del Copilot
- Un motore remoto obbligatorio

## 3. Analisi dei passaggi 2-4

### Passo 2 — Selezione Traguardi & Obiettivi

| Campo | Dato |
|---|---|
| Titolo wizard | "Selezione Traguardi & Obiettivi" |
| Progress bar | "2. Traguardi" |
| Percentuale | 40% |
| Label Dashboard | "Compito di Realtà" (inconsistente) |
| Campi | 1: `selectedTraguardi` — multi-select checkboxes da `localCurriculum[discipline][order].traguardi` |
| Input | Indici numerici (`number[]`) |
| Fonte dati | `curriculumKB[discipline][order].traguardi` (array di stringhe) |
| Validazione | Nessuna (avanza anche senza selezioni) |

**Dati già inseriti (step 1):** titolo UDA, periodo.

**Decisione richiesta:** Quali traguardi di competenza selezionare per questo UDA.

**Contenuti nell'interfaccia:** Lista di checkbox con testo del traguardo (`T1. {testo}`, `T2. {testo}`, ...).

**Riferimenti esterni attuali:** Nessuno. Il docente non ha indicazioni su quali traguardi siano più rilevanti, quali collegamenti abbiano con i passaggi successivi, o cosa implichi ogni scelta.

**Punti in cui il docente deve cambiare vista:** Se vuole sapere cosa implicano i traguardi per la progettazione, deve aprire il Curricolo o il SecondBrain.

**Informazioni che deve ricordare:** Quali traguardi ha selezionato e perché, cosa significheranno nei passi successivi.

**Esitazioni:** Quali traguardi scegliere quando ce ne sono molti. Selezionarne troppi sovraccarica i passi successivi. Selezionarne troppi pochi rischia incompletezza.

**Rischio di scelta generica:** Alto. Senza riferimenti, il docente seleziona i primi traguardi disponibili o quelli che ricorda.

**Supporti Copilot attuali:** Chips contestuali ("Suggerisci un compito realta", "Proponi misure inclusive per DSA") — generiche, non collegate alla selezione traguardi.

**Supporti SecondBrain attuali:** Volume 4 (Curricolo Fondativo) e Volume 8 (Dettaglio 14 Discipline) contengono traguardi e obiettivi completi, ma in un'altra vista.

**Supporti Curricolo attuali:** La vista Albero mostra traguardi e obiettivi in contesto verticale, ma non è collegata al wizard.

**Lacuna effettiva:** Il docente seleziona traguardi senza sapere cosa implicano per i passi successivi (evidenze, compito di realtà, inclusione). Non ha riferimenti normativi o metodologici nel momento della scelta.

**Nota critica:** Il wizard dice "Traguardi & Obiettivi" ma mostra solo traguardi. Gli obiettivi sono nel layout griglia ma non nel wizard. Questo crea confusione: il docente si aspetta di selezionare anche obiettivi.

---

### Passo 3 — Associazione Evidenze di Certificazione

| Campo | Dato |
|---|---|
| Titolo wizard | "Associazione Evidenze di Certificazione" |
| Progress bar | "3. Evidenze" |
| Percentuale | 60% |
| Label Dashboard | "Evidenze e Valutazione" (parzialmente coerente) |
| Campi | 1: `selectedEvidenze` — multi-select checkboxes da `localCurriculum[discipline][order].evidenze` |
| Input | Stringhe (`string[]` — valori completi, non indici) |
| Fonte dati | `curriculumKB[discipline][order].evidenze` (array di stringhe) |
| Validazione | Nessuna |
| Riferimento normativo | "DM 14/2024" menzionato nell'intestazione |

**Dati già inseriti (step 1-2):** titolo UDA, periodo, traguardi selezionati.

**Decisione richiesta:** Quali evidenze comportamentali osservabili assocerà alla certificazione.

**Contenuti nell'interfaccia:** Lista di checkbox con testo completo dell'evidenza. Esempi:
- Italiano/Infanzia: "Riferisce brevi episodi scolastici o storie con coerenza temporale"
- Italiano/Primaria: "Redige in corsivo un testo narrativo o descrittivo privo di errori ortografici di base"
- Matematica/Primaria: "Risolve a mente un set di 10 calcoli rapidi di addizione e sottrazione in 1 minuto"

**Riferimenti esterni attuali:** Nessuno. Il titolo menziona "DM 14/2024" ma non c'è link o spiegazione.

**Punti in cui il docente deve cambiare vista:** Se vuole capire cosa sono le evidenze o quali normative le regolano, deve aprire SecondBrain volume 3 (Didattica, Inclusione, Privacy) o volume 4 (Curricolo Fondativo).

**Informazioni che deve ricordare:** Quali evidenze ha selezionato e come si collegano ai traguardi scelti.

**Esitazioni:** Non sapere cosa sia esattamente un'evidenza di certificazione. Non sapere se le evidenze selezionate siano sufficienti. Non sapere se le evidenze siano coerenti con i traguardi.

**Rischio di scelta generica:** Medio. Le evidenze sono più concrete dei traguardi, ma il docente potrebbe non capire il legame con la valutazione.

**Supporti Copilot attuali:** Nessuna chip specifica per evidenze.

**Supporti SecondBrain attuali:** Volume 3 contiene il quadro normativo (DM 14/2024, D.Lgs. 62/2017). Volume 4 contiene il curricolo con evidenze. Volume 6 (Repertorio Concettuale) definisce "Evidenza Comportamentale".

**Supporti Curricolo attuali:** La vista CertificazioneTab mostra la matrice di copertura competenze europee, ma non è collegata al wizard.

**Lacuna effettiva:** Il docente seleziona evidenze senza sapere cosa significhino per la valutazione, senza riferimento normativo, e senza sapere se siano coerenti con i traguardi.

---

### Passo 4 — Definizione Compito di Realtà & Note BES

| Campo | Dato |
|---|---|
| Titolo wizard | "Definizione Compito di Realtà & Note BES" |
| Progress bar | "4. Compito & BES" |
| Percentuale | 80% |
| Label Dashboard | "Risorse e Tempistica" (completamente incoerente) |
| Campi | 2: `realTaskInput` (textarea, 3 righe), `progNotes` (textarea, 3 righe) |
| Input | Testo libero |
| Fonte dati | Nessuna — input manuale |
| Validazione | Nessuna |
| Placeholder | "E.g. Realizzazione di un opuscolo illustrato..." / "Scrivi note d'inclusione o adattamenti..." |

**Dati già inseriti (step 1-3):** titolo UDA, periodo, traguardi, evidenze.

**Decisione richiesta:** Due decisioni distinte:
1. Quale compito di realtà autentico proporre (prodotto/servizio reale)
2. Quali adattamenti metodologici inclusivi applicare (BES/DSA)

**Contenuti nell'interfaccia:** Due textarea vuote con placeholder.

**Riferimenti esterni attuali:** Il `handleTriggerGemSuggestion` è disponibile come prop ma NON è collegato a nessun bottone nel wizard. Le suggerimenti di Gemma per `uda-realtask` e `uda-inclusion` esistono nel codice ma sono inutilizzati nel wizard.

**Punti in cui il docente deve cambiare vista:** Se vuole ispirazione per il compito di realtà, deve aprire SecondBrain (volumi 1, 8, 19). Se vuole sapere cosa prevede la normativa sull'inclusione, deve aprire volume 3. Se vuole un esempio di UDA, deve aprire l'archivio.

**Informazioni che deve ricordare:** I traguardi e le evidenze selezionati (non visibili in questo passo). Il contesto della disciplina e dell'ordine.

**Esitazioni:** Non sapere che tipo di compito sia appropriato per il livello. Non sapere cosa preveda la normativa BES/DSA. Non sapere se il compito sia coerente con traguardi e evidenze.

**Rischio di scelta generica:** Alto. Senza riferimenti, il docente usa il placeholder ("Realizzazione di un prodotto di sintesi disciplinare") o copia un UDA precedente.

**Supporti Copilot attuali:** Gemma può generare suggerimenti per `uda-realtask` e `uda-inclusion`, ma il bottone di trigger non esiste nel wizard.

**Supporti SecondBrain attuali:** Volume 3 (normativa inclusione), Volume 6 (definizione "Compito di Realtà"), Volume 19 (Ambiente Classe Tematico — Jigsaw, Peer Tutoring).

**Lacuna effettiva:** Il passo 4 è il più critico: il docente deve creare un compito di realtà autentico e note di inclusione, senza riferimenti, senza esempi, senza coerenza visibile con traguardi e evidenze.

---

### Contesto disponibile (tutti i passi)

| Dato | Disponibile nel wizard | Disponibile nel prodotto |
|---|---|---|
| Disciplina | Sì (da store) | Sì |
| Ordine scolastico | Sì (da store) | Sì |
| Titolo UDA | Sì (step 1) | Sì |
| Periodo | Sì (step 1) | Sì |
| Nucleo | No | Sì (curriculumKB.nucleiFondanti) |
| Traguardi selezionati | Sì (step 2) | Sì |
| Obiettivi selezionati | No (solo griglia) | Sì (store) |
| Evidenze selezionate | Sì (step 3) | Sì |
| Compito di realtà | Sì (step 4) | Sì |
| Note BES | Sì (step 4) | Sì |
| Volumi SecondBrain | No | Sì (16 volumi in memoria) |
| Glossario | No | Sì (14+ termini) |
| Curricolo completo | No | Sì (14 discipline × 3 ordini) |
| UDA salvati | No | Sì (archivio) |

## 4. Scenari ipotizzati

> **Nota:** Gli scenari seguenti sono derivati dall'analisi del codice, dall'ispezione delle superfici e dalla simulazione dei flussi. Non sono ancora stati confermati con sessioni condotte con docenti reali. Le frequenze indicano ricorrenza potenziale nel flusso (perché il passaggio è obbligatorio) e non misure statistiche.

| # | Scenario | Passo | Problema ipotizzato | Ricorrenza potenziale |
|---|---|---|---|---|
| S1 | Il docente seleziona traguardi senza sapere cosa implicano per i passi successivi | 2 | Recorrente nel flusso (passaggio obbligatorio) | Da verificare con utenti |
| S2 | Il docente sceglie evidenze senza riferimento normativo | 3 | Recorrente nel flusso | Da verificare con utenti |
| S3 | Il docente lascia compito di realtà vuoto usando il placeholder | 4 | Potenziale criticità frequente | Da verificare con utenti |
| S4 | Il docente non sa che tipo di compito sia appropriato per il livello | 4 | Potenziale criticità frequente | Da verificare con utenti |
| S5 | Il docente non sa cosa preveda la normativa BES/DSA | 4 | Potenziale criticità | Da verificare con utenti |
| S6 | Il docente apre SecondBrain per cercare un riferimento, perde il wizard | 2-4 | Recorrente nel flusso | Da verificare con utenti |
| S7 | Il docente usa il Copilot, riceve suggerimento generico non pertinente | 2-4 | Potenziale criticità | Da verificare con utenti |
| S8 | Il docente consulta il glossario per capire un termine, deve cambiare vista | 2-4 | Occasionale | Da verificare con utenti |
| S9 | Il docente torna al wizard dopo consultazione esterna e non ricorda il contesto | 2-4 | Potenziale criticità | Da verificare con utenti |
| S10 | Il docente sceglie traguardi troppi o troppo pochi | 2 | Potenziale criticità | Da verificare con utenti |
| S11 | Il docente non vede coerenza tra traguardi e evidenze | 3 | Potenziale criticità | Da verificare con utenti |
| S12 | Il docente copia un UDA precedente senza capire le scelte | 4 | Occasionale | Da verificare con utenti |

## 5. Mappa dei problemi

| # | Problema | Passo | Tipo | Gravità |
|---|---|---|---|---|
| P1 | Il docente non sa quali traguardi siano pertinenti al suo contesto | 2 | Limite informativo | Alto |
| P2 | Il docente non sa cosa implichi ogni traguardo per i passi successivi | 2 | Limite informativo | Alto |
| P3 | Il docente non conosce le evidenze di certificazione relative alla sua disciplina | 3 | Limite informativo | Alto |
| P4 | Il docente non sa cosa significhi "evidenza comportamentale" | 3 | Limite di comprensione | Medio |
| P5 | Il docente non ha riferimenti per creare un compito di realtà autentico | 4 | Limite informativo | Alto |
| P6 | Il docente non sa cosa preveda la normativa BES/DSA | 4 | Limite informativo | Alto |
| P7 | Il docente deve cambiare vista per trovare informazioni | 2-4 | Limite di navigazione | Alto |
| P8 | Il docente perde il contesto dopo consultazione esterna | 2-4 | Limite di continuità | Medio |
| P9 | Il Copilot fornisce suggerimenti generici non collegati al contenuto | 2-4 | Limite dell'interfaccia | Medio |
| P10 | Il wizard non mostra coerenza tra passi | 2-4 | Limite dell'interfaccia | Medio |
| P11 | Il docente seleziona traguardi/obiettivi senza criterio | 2 | Limite informativo | Medio |
| P12 | Il docente non vede il glossario nel momento in cui serve | 2-4 | Limite di continuità | Bassa |

**Problemi per categoria:**
- **Informativi** (il docente non sa): P1, P2, P3, P5, P6, P11 (6)
- **Navigazione** (il docente deve spostarsi): P7 (1)
- **Continuità** (il docente perde contesto): P8, P12 (2)
- **Interfaccia** (l'UI non aiuta): P4, P9, P10 (3)

**Il problema prevalente:** 6 problemi su 12 sono informativi — il docente non ha le informazioni che servono nel momento in cui le cerca.

## 6. Mappa delle fonti esistenti

### Fonti nel prodotto

| # | Fonte | Contenuto | Struttura | Affidabilità | Collegamento a contesto | Identificatori | Locale | Dipendenza esterna | Citazione | Rischio duplicazione |
|---|---|---|---|---|---|---|---|---|---|---|
| F1 | `curriculumKB` — traguardi | Traguardi di competenza per disciplina/ordine | `string[]` | Alta (dati ministeriali) | `curriculumKB[discipline][order].traguardi` | Indice numerico | Sì | No | `T{idx+1}. {testo}` | Basso |
| F2 | `curriculumKB` — obiettivi | Obiettivi di apprendimento per disciplina/ordine | `string[]` | Alta (dati ministeriali) | `curriculumKB[discipline][order].obiettivi` | Indice numerico | Sì | No | `O{idx+1}. {testo}` | Basso |
| F3 | `curriculumKB` — evidenze | Evidenze comportamentali per disciplina/ordine | `string[]` | Alta (DM 14/2024) | `curriculumKB[discipline][order].evidenze` | Valore stringa | Sì | No | Testo completo | Basso |
| F4 | `curriculumKB` — nucleiFondanti | Nuclei tematici fondanti | `string[]` (opzionale) | Alta | `curriculumKB[discipline][order].nucleiFondanti` | Valore stringa | Sì | No | Testo | Basso |
| F5 | `curriculumKB` — proposals | Proposte di modifica traguardi | `Proposal[]` | Media (expert swarm) | `curriculumKB[discipline][order].proposals` | ID + focus | Sì | No | `{focus}: {newText}` | Basso | **Escluso prima fase** |
| F6 | SecondBrain vol.4 | Curricolo Fondativo completo | HTML + text | Alta (istituzionale) | `volumesKB['vol4']` | `vol4` | Sì | No | Titolo + volume | Basso | Prima fase |
| F7 | SecondBrain vol.3 | Quadro normativo (DPR 275/99, D.Lgs. 62/2017, PEI, PDP, UDL, GDPR) | HTML + text | Alta (normativo) | `volumesKB['vol3']` | `vol3` | Sì | No | Titolo + volume | Basso | Prima fase |
| F8 | SecondBrain vol.6 | Repertorio Concettuale (14 definizioni: UDA, Competenza, Compito di Realtà...) | HTML + text | Alta (certificata) | `volumesKB['vol6']` | `vol6` | Sì | No | Titolo + volume | Basso | Prima fase |
| F9 | SecondBrain vol.8 | Dettaglio 14 Discipline — mappatura classe per classe | HTML + text | Alta (istituzionale) | `volumesKB['vol8']` | `vol8` | Sì | No | Titolo + volume | Basso | Prima fase |
| F10 | SecondBrain vol.7 | Transizione Graduale IN2025 — cronogramma adozione | HTML + text | Alta (normativo) | `volumesKB['vol7']` | `vol7` | Sì | No | Titolo + volume | Basso | Prima fase |
| F11 | SecondBrain vol.19 | Ambiente Classe Tematico — Jigsaw, Peer Tutoring, disposizione banchi | HTML + text | Media (specifica) | `volumesKB['vol19']` | `vol19` | Sì | No | Titolo + volume | Basso | Prima fase |
| F12 | SecondBrain vol.1 | Progetti e Territorio — fondi PNRR, STEM, Arbëreshë | HTML + text | Alta (istituzionale) | `volumesKB['vol1']` | `vol1` | Sì | No | Titolo + volume | Basso | Prima fase |
| F13 | Glossario | Definizioni di 14+ termini pedagogici | `{term, definition, source}[]` | Alta (certificata) | `localStorage('curman_glossary')` | Termine | Sì | No | `{term}: {definition}` | Basso | Prima fase |
| F14 | Documenti personalizzati | Documenti caricati dall'istituto | `{id, title, subtitle, content}[]` | Media (utente) | `localStorage('curman_customKbDocs')` | `vol-custom-{ts}` | Sì | No | `{title}: {content}` | Basso | **Escluso prima fase** |
| F15 | WikiLLM | Motore di ricerca keyword/risposta | Deterministico | Media (keyword-based) | Query → risposta pre-scritta | Query text | Sì | No | Risposta con fonte | Basso | **Escluso prima fase** |
| F16 | Copilot chips | Suggerimenti contestuali per vista | Testo statico | Bassa (generica) | `activeTab` + keyword routing | Testo chip | Sì | No | Risposta con chip | Basso | **Escluso — non è riferimento** |
| F17 | UDA salvati | Archivio UDA completati | `UdaModel[]` | Alta (utente) | `savedUda` | `uda-{ts}` | Sì | No | Titolo + dati | Basso | **Escluso prima fase** |
| F18 | `proposals` | Proposte expert sui traguardi | `Proposal[]` | Media (expert swarm) | `curriculumKB[discipline][order].proposals` | `{discipline}-{order}-{n}` | Sì | No | Focus + testo | Basso | **Escluso prima fase** |

### Mappe di copertura per passo

**Passo 2 (Traguardi):** F1 (traguardi diretti), F2 (obiettivi correlati), F6 (curricolo fondativo), F9 (dettaglio discipline), F13 (glossario: "Traguardo", "Competenza").

**Passo 3 (Evidenze):** F3 (evidenze dirette), F7 (normativa DM 14/2024), F8 (definizione "Evidenza Comportamentale"), F6 (curricolo con evidenze).

**Passo 4 (Compito di Realtà + BES):** F8 (definizione "Compito di Realtà"), F7 (normativa inclusione PEI/PDP/UDL), F11 (metodologie cooperative), F13 (glossario: "PEI", "PDP", "UDL").

**Esclusi dalla prima fase:** F5 (proposte expert), F14 (documenti personalizzati), F15 (WikiLLM), F17 (UDA salvati), F18 (proposte expert duplicate).

## 7. Contratto minimo del Knowledge Companion

### Quando il supporto compare

- Quando il docente è al passo 2, 3 o 4 del wizard UDA
- Automaticamente, senza azione del docente
- Come sezione compatta sotto o accanto ai campi del passo corrente

### Quali dati del contesto utilizza

- `discipline` (da store): disciplina corrente
- `order` (da store): ordine scolastico
- `wizardStep` (da store): passo corrente (2, 3 o 4)
- `selectedTraguardi` (da store): traguardi già selezionati (per passi 3 e 4)
- `selectedEvidenze` (da store): evidenze già selezionate (per passo 4)

### Come seleziona i riferimenti

- **Mapping contestuale wizardStep + disciplina + ordine + selezioni → fonti**
- Ogni passo usa i segnali disponibili per filtrare:
  - **Passo 2:** `wizardStep` + `discipline` + `order`
  - **Passo 3:** `wizardStep` + `discipline` + `order` + `selectedTraguardi`
  - **Passo 4:** `wizardStep` + `discipline` + `order` + `selectedTraguardi` + `selectedEvidenze`
- **Filtro per pertinenza:** Ogni riferimento ha un tag che lo lega a uno o più passi
- **Ordine:** Massimo 3-5 riferimenti per passo, mostrati in modo compatto e progressivamente espandibile
- **Nessuna generazione dinamica:** I riferimenti sono fissi, non calcolati
- **Nessuna IA:** Il filtering è interamente basato su regole statiche

### Quantità

- **3-5 riferimenti** per passo del wizard
- **Ogni riferimento** è una riga con: icona, titolo breve, fonte visibile, azione "Approfondisci"

### Come espone la fonte

Ogni riferimento mostra:
- **Icona** (volume, glossario, curricolo)
- **Titolo breve** del riferimento
- **Categoria** con grado di autorevolezza (etichetta visibile)
- **Volume/Fonte** di provenienza

### Categorie di autorevolezza

| Categoria | Esempio | Etichetta | Significato |
|---|---|---|---|
| Fonte normativa | DM 14/2024, D.Lgs. 62/2017, L. 104 | **Fonte normativa** | Contenuto con forza legislativa o regolamentare |
| Curricolo istituzionale | Traguardi, obiettivi, evidenze del curricolo | **Curricolo** | Contenuto del curricolo adottato dall'istituto |
| Repertorio concettuale | Definizioni pedagogiche (UDA, Competenza...) | **Approfondimento** | Definizioni certificate ma non normative |
| Documento d'istituto | Documenti personalizzati caricati | **Documento d'istituto** | Contenuto aggiunto dall'utente |

Esempi:
- `[📄] [Fonte normativa] DM 14/2024: evidenze — Vol. 3: Quadro Normativo`
- `[📄] [Curricolo] Traguardi Italiano / Primaria — Vol. 4: Curricolo Fondativo`
- `[📖] [Approfondimento] "Compito di Realtà" — Vol. 6: Repertorio Concettuale`
- `[📄] [Documento d'istituto] Linee Guida Inclusione — Documento caricato`

### Come il docente apre un approfondimento

- Click sul riferimento → apre il reader del SecondBrain (volume pertinente) in una modal/overlay
- Il wizard resta visibile sullo sfondo
- Il docente chiude il reader e torna al wizard

### Come torna al wizard

- Chiusura della modal/overlay
- Nessuna navigazione necessaria
- Il wizard mantiene tutti i dati inseriti

### Se non esistono riferimenti pertinenti

- Mostra: "Nessun riferimento specifico disponibile per questa disciplina/passaggio"
- Non mostra riferimenti generici forzati
- Il wizard continua a funzionare normalmente

### Se i dati sono incompleti

- Se la disciplina non è impostata: mostra solo riferimenti generali (Volume 4, Volume 6)
- Se l'ordine non è impostato: mostra riferimenti che non dipendono dall'ordine

### Senza accesso a servizi esterni

- Tutti i dati sono locali (volumesKB, curriculumKB, glossario)
- Nessuna dipendenza da servizi remoti
- Funzionamento completo offline

### Come evita contenuti generici

- Ogni riferimento è collegato a un volume specifico o a un dato del curricolo
- Non genera testo libero: mostra solo riferimenti esistenti
- Non dà consigli: mostra fonti da consultare

### Come evita prescrittività

- I riferimenti sono introdotti con linguaggio neutro: "Può consultare...", "È disponibile in...", "A titolo informativo..."
- Non dice "Devi usare..." o "Scegli questo..."
- Il docente decide se consultare o meno

### Persistenza

- Lo stato del Knowledge Companion (riferimenti aperti/chiusi) è ephemeral (Tier 3)
- Si resetta ad ogni sessione
- Non interferisce con la persistenza del wizard

## 8. Relazione con Copilot e SecondBrain

### Copilot attuale — Cosa fa

| Funzione | Cosa fa | Fonte dati | Contesto usato | Output |
|---|---|---|---|---|
| Chat sidebar | Risposte pre-scritte per keyword | Testo hardcoded | `activeTab` + keyword | Testo |
| Chips contestuali | Suggerimenti rapidi per vista | Testo hardcoded | `activeTab`, `activeProgTab` | Messaggio chat |
| Gemma suggestion | Suggerimento per campo specifico | Testo hardcoded | `discipline`, `order` | Testo nel campo |
| Voice dictation | Dictation nel chat | Browser Speech API | Nessuno | Testo nel chat |
| TTS | Lettura risposte | Browser SpeechSynthesis | Nessuno | Audio |

### SecondBrain attuale — Cosa fa

| Funzione | Cosa fa | Fonte dati | Accesso |
|---|---|---|---|
| Volume reader | Mostra contenuto volume in pannello | `volumesKB[id].html` | Sidebar libreria |
| WikiLLM | Query keyword → risposta pre-scritta | `volumesKB` text + keyword map | Input testo |
| Glossario | Lista filtrabile di definizioni | `localStorage('curman_glossary')` | Tab glossario |
| Grafico architettura | Visualizzazione nodi/archi | `architectureGraph.ts` | Tab mappa |

### Confini — Knowledge Companion vs Copilot

| Aspetto | Knowledge Companion | Copilot |
|---|---|---|
| Scopo | Mostrare riferimenti pertinenti | Dare suggerimenti/risposte |
| Contenuto | Fonti esistenti (volumi, curricolo, glossario) | Testo hardcoded |
| Modalità | Passiva (mostra, non propone) | Attiva (risponde, suggerisce) |
| Contesto | `wizardStep` + `discipline` + `order` | `activeTab` + keyword |
| Output | Riferimento con fonte visibile | Testo di risposta |
| Interazione | Click per approfondire | Chat conversazionale |
| Fonte | Tracciabile (volume N, glossario) | Non tracciabile (hardcoded) |
| Prescrittività | Mai | A volte ("Scegli questo metodo") |

### Confini — Knowledge Companion vs SecondBrain

| Aspetto | Knowledge Companion | SecondBrain |
|---|---|---|
| Scopo | Collegare riferimenti al wizard | Archiviare e consultare documenti |
| Accesso | automatico nel wizard | manuale nella sidebar libreria |
| Contesto | Filtrato per passo/disciplina | Tutti i volumi disponibili |
| Selezione | 3-5 riferimenti per passo | 12+ volumi nella sidebar |
| Profondità | Estratto / riferimento | Contenuto completo |
| Navigazione | Nessuna (stessa vista) | Cambio di vista |

### Cosa riutilizzare (prima fase)

- **volumesKB** per i contenuti dei volumi (vol. 3, 4, 6, 7, 8, 19)
- **curriculumKB** per traguardi, obiettivi, evidenze, nucleiFondanti
- **glossario** per definizioni di termini pedagogici
- **Logica di contesto** del Copilot (il pattern `activeTab → risposta`)
- **Pattern di rendering** del SecondBrain (card, pannelli, fonti)

### Cosa non duplicare

- **La chat sidebar** del Copilot — il Companion non è conversazionale
- **Il reader dei volumi** del SecondBrain — il Companion mostra solo riferimenti, non il contenuto completo
- **Le chips del Copilot** — il Companion non suggerisce azioni
- **Il WikiLLM** — escluso dalla prima fase
- **Il glossario** come vista separata — il Companion mostra solo definizioni pertinenti
- **Le proposte expert** — escluse dalla prima fase
- **L'archivio UDA** — escluso dalla prima fase
- **I documenti personalizzati** — esclusi dalla prima fase

### Cosa mantenere separato

- Il **Copilot** resta attivo per chi vuole una risposta conversazionale
- Il **SecondBrain** resta la vista per consultazione approfondita
- Il **Knowledge Companion** è un ponte tra il wizard e queste fonti

## 9. Tre ipotesi di soluzione

### Ipotesi 1 — Pannello compatto progressivamente espandibile

**Frase:** "Il docente potrà vedere, sotto ogni passo del wizard, un riferimento principale con la fonte e la possibilità di espandere gli altri, senza cambiare vista."

**Comportamento:** Sotto ogni passo del wizard (2, 3, 4), compare una sezione sintetica:

```
Riferimenti utili — 1 fonte
[📄] [Fonte normativa] DM 14/2024: evidenze comportamentali — Vol. 3
     [Approfondisci]                        [Mostra altre 2 fonti →]
```

Stato iniziale: mostra **1 riferimento principale** con fonte visibile e categoria.

Il docente può:
- **Ignorarlo** — il pannello resta compatto, non blocca nulla
- **Leggere il riferimento principale** — testo sintetico in linea
- **Espandere** — click "Mostra altre N fonti" → elenco completo (max 5)
- **Approfondire** — click "Approfondisci" → overlay con reader del volume SecondBrain

**Superficie:** Sezione compatta sotto i campi del wizard, nella stessa vista. Massimo 1 riga visibile di default, espandibile.

**Dati utilizzati:** `wizardStep` + `discipline` + `order`. Per il passo 3: anche `selectedTraguardi`. Per il passo 4: anche `selectedTraguardi` + `selectedEvidenze`.

**Fonti:** Mapping contestuale `wizardStep + disciplina + ordine + selezioni → fonti`. Esempio passo 4 italiano/primaria: Vol. 6 "Compito di Realtà" (riferimento principale), Vol. 3 Inclusione, Vol. 19 Metodologie.

**Azione principale:** Click "Approfondisci" → overlay con reader del volume SecondBrain.

**Casi vuoti:** Se nessun riferimento è disponibile, il pannello non compare (o mostra messaggio "Nessun riferimento specifico per questa combinazione").

**Rischi:** Basso rischio di sovraccarico (1 riga di default). Rischio che il docente non noti il pannello se è troppo compatto.

**Compatibilità baseline:** Completa. Nessuna modifica a shell, routing o navigazione. Componente inline nel wizard.

**Testabilità:** Alta. Si può osservare: se il docente nota il pannello, se legge il riferimento principale, se espande, se apre "Approfondisci", se i riferimenti sono pertinenti.

---

### Ipotesi 2 — Approfondimento contestuale espandibile

**Frase:** "Il docente potrà espandere, accanto a ogni campo del wizard, un riferimento sintetico che mostra il testo rilevante dal volume pertinente, senza cambiare vista."

**Comportamento:** Accanto a ogni campo del wizard (traguardi, evidenze, compito, BES), compare un'icona "i" o "?". Al click, si apre un pannello laterale o un accordion con il contenuto rilevante dal SecondBrain o dal glossario. Il pannello è chiuso di default e si apre solo su richiesta.

**Superficie:** Icona inline nel wizard + pannello laterale/accordion.

**Dati utilizzati:** `wizardStep` + `discipline` + `order` + campo specifico (traguardi, evidenze, compito, BES).

**Fonti:** Le stesse dell'Ipotesi 1, ma con contenuto più dettagliato (estratto dal volume, non solo titolo).

**Azione principale:** Click sull'icona "i" → apertura pannello/accordion con testo rilevante.

**Casi vuoti:** Se nessun riferimento è disponibile, l'icona non compare (o è disabilitata).

**Rischi:** Rischio che il docente non noti le icone. Rischio di pannelli annidati se il pannello è troppo grande.

**Compatibilità baseline:** Completa. Componente inline + pannello espandibile.

**Testabilità:** Media. Si deve verificare se il docente nota le icone e se il contenuto è pertinente.

---

### Ipotesi 3 — Collegamento guidato al SecondBrain

**Frase:** "Il docente potrà accedere direttamente dal wizard ai volumi del SecondBrain più pertinenti, con evidenziazione del paragrafo rilevante."

**Comportamento:** In ogni passo del wizard, una sezione "Approfondisci" mostra 2-3 link diretti ai volumi del SecondBrain. Click su un link apre direttamente il volume nel reader del SecondBrain, con il paragrafo rilevante evidenziato o in primo piano.

**Superficie:** Sezione link nel wizard → reader SecondBrain (vista esistente).

**Dati utilizzati:** `wizardStep`, `discipline`, `order`.

**Fonti:** Mapping `wizardStep → volume + paragrafo`. Esempio: passo 4 "Compito di Realtà" → vol.6 paragrafo "Compito di Realtà".

**Azione principale:** Click sul link → apertura SecondBrainTab con volume e paragrafo evidenziato.

**Casi vuoti:** Se nessun volume è pertinente, mostra messaggio "Consultare il Curricolo Fondativo (Volume 4) per approfondimenti generali."

**Rischi:** Alto rischio di perdita di contesto: il docente lascia il wizard, apre un'altra vista, deve tornare indietro manualmente. Questo è esattamente il problema che il Companion vorrebbe risolvere.

**Compatibilità baseline:** Completa. Nessuna modifica alla navigazione.

**Testabilità:** Alta. Si può misurare se il docente torna al wizard dopo la consultazione.

---

### Confronto

| Criterio | Ipotesi 1 (Compatto) | Ipotesi 2 (Espandibile) | Ipotesi 3 (Link) |
|---|---|---|---|
| Valore per il docente | **Alto** — 1 riferimento sempre visibile | Medio — bisogna cercare le icone | Medio — perde contesto |
| Pertinenza dei riferimenti | **Alta** — contestuale (passo+disciplina+ordine+selezioni) | **Alta** — testo rilevante | **Alta** — link diretto |
| Continuità del lavoro | **Alta** — stesso pannello, espansione su richiesta | **Alta** — accordion/pannello | **Bassa** — cambia vista |
| Chiarezza delle fonti | **Alta** — fonte + categoria visibili | **Alta** — fonte nel pannello | **Alta** — link diretto |
| Controllo professionale | **Alto** — il docente decide se espandere e approfondire | **Alto** — il docente decide se espandere | **Alto** — il docente decide se cliccare |
| Compatibilità con navigazione congelata | **Completa** | **Completa** | **Completa** |
| Riuso funzioni esistenti | **Alto** — rendering card, fonti | **Alto** — accordion, testo volume | **Alto** — link a SecondBrain |
| Minimo perimetro | **Piccolo** — 1 riga + espansione | **Piccolo** — icona + accordion | **Piccolo** — solo link |
| Accessibilità | **Alta** — 1 riga sempre visibile | **Media** — bisogna trovare l'icona | **Media** — link testuali |
| Comportamento mobile | **Buono** — 1 riga sotto i campi | **Buono** — accordion compatto | **Medio** — cambio vista su mobile |
| Rischio di sovraccarico | **Basso** — 1 riga di default | **Basso** — solo su richiesta | **Basso** — solo link |
| Rischio di duplicazione | **Basso** | **Basso** | **Basso** |
| Dipendenza da servizi remoti | **Nessuna** | **Nessuna** | **Nessuna** |
| Reversibilità | **Alta** — rimuovere il pannello | **Alta** — rimuovere le icone | **Alta** — rimuovere i link |
| Facilità di validazione | **Alta** — osservabile nel flusso | **Media** — bisogna interagire | **Alta** — osservabile |

### Raccomandazione

**Ipotesi 1 (Pannello compatto progressivamente espandibile)** come prima implementazione.

Motivazioni:
1. Il riferimento principale è sempre visibile → il docente lo nota senza cercare
2. Il pannello è compatto (1 riga di default) → non sovraccarica la vista
3. L'espansione è su richiesta → il docente controlla quanto vedere
4. La validazione è diretta → si osserva se il docente nota, legge, espande, approfondisce
5. La sostenibilità mobile è buona → 1 riga sotto i campi

L'Ipotesi 2 può essere una fase successiva (aggiungere icone "i" per approfondimento inline).

L'Ipotesi 3 è sconsigliata perché rompe la continuità del wizard.

## 10. Mock

### Mock 1 — Passo 2 con riferimenti pertinenti (Italiano / Primaria)

```
┌─────────────────────────────────────────────────────────────┐
│  Step 2 di 5 — Selezione Traguardi & Obiettivi    40%     │
│  ════════════════════════░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                             │
│  Traguardi di Competenza — Italiano / Primaria              │
│                                                             │
│  ☑ T1. Il bambino usa la lingua italiana, arricchisce e    │
│     precisa il proprio lessico, comprende parole e discorsi.│
│  ☑ T2. Il bambino interpreta e produce testi orali e       │
│     scritti in diverse situazioni comunicative.             │
│  ☐ T3. Il bambino si avvicina alla lingua scritta,         │
│     esplora e sperimenta le funzioni della scrittura.       │
│                                                             │
│  ─── Riferimenti utili — 1 fonte ───────────────────────── │
│  📄 [Curricolo] Traguardi Italiano / Primaria               │
│     Vol. 4: Curricolo Fondativo              [Approfondisci]│
│                                              [Mostra altre  │
│                                               2 fonti →]   │
│                                                             │
│  [Avanti →]                                                 │
└─────────────────────────────────────────────────────────────┘
```

*Espansione "Mostra altre 2 fonti":*
```
  📄 [Curricolo] Dettaglio 14 Discipline                     │
     Vol. 8: Dettaglio Discipline              [Approfondisci]│
  📖 [Approfondimento] "Traguardo di Competenza"             │
     Vol. 6: Repertorio Concettuale            [Approfondisci]│
```

---

### Mock 2 — Passo 3 con riferimenti normativi (Scienze / Secondaria)

```
┌─────────────────────────────────────────────────────────────┐
│  Step 3 di 5 — Associazione Evidenze di Certificazione 60% │
│  ════════════════════════════════════░░░░░░░░░░░░░░░░░░░░ │
│                                                             │
│  Evidenze di Certificazione (DM 14/2024) — Scienze / Sec.  │
│                                                             │
│  ☑ Osserva e descrive fenomeni naturali utilizzando         │
│     strumenti di misura e registrazione.                    │
│  ☐ Progetta e realizza semplici esperimenti seguendo il     │
│     metodo scientifico.                                     │
│  ☑ Comunica i risultati delle osservazioni utilizzando      │
│     rappresentazioni grafiche e tabella.                    │
│                                                             │
│  ─── Riferimenti utili — 1 fonte ───────────────────────── │
│  📄 [Fonte normativa] DM 14/2024: evidenze comportamentali │
│     Vol. 3: Quadro Normativo                [Approfondisci]│
│                                              [Mostra altre  │
│                                               1 fonte →]   │
│                                                             │
│  [Avanti →]                                                 │
└─────────────────────────────────────────────────────────────┘
```

*Espansione "Mostra altre 1 fonte":*
```
  📖 [Approfondimento] "Evidenza Comportamentale"            │
     Vol. 6: Repertorio Concettuale            [Approfondisci]│
```

---

### Mock 3 — Passo 4 con riferimento inclusivo (Italiano / Primaria)

```
┌─────────────────────────────────────────────────────────────┐
│  Step 4 di 5 — Compito di Realtà & Note BES         80%   │
│  ══════════════════════════════════════════════░░░░░░░░░░ │
│                                                             │
│  Compito di Realtà                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Realizzazione di un diario personale della classe   │   │
│  │ curando la calligrafia in corsivo e la coerenza     │   │
│  │ narrativa degli episodi raccontati.                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Note Metodologiche d'Inclusione (BES/DSA)                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Adattamento personalizzato: supporto visivo per     │   │
│  │ alunni con DSA, mappe concettuali, sintesi vocale.  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─── Riferimenti utili — 1 fonte ───────────────────────── │
│  📖 [Approfondimento] Definizione: "Compito di Realtà"     │
│     Vol. 6: Repertorio Concettuale          [Approfondisci]│
│                                              [Mostra altre  │
│                                               2 fonti →]   │
│                                                             │
│  [Avanti →]                                                 │
└─────────────────────────────────────────────────────────────┘
```

*Espansione "Mostra altre 2 fonti":*
```
  📄 [Fonte normativa] Didattica, Inclusione, Privacy        │
     Vol. 3: Quadro Normativo                 [Approfondisci]│
  📖 [Approfondimento] Metodologie Cooperative               │
     Vol. 19: Ambiente Classe                 [Approfondisci]│
```

---

### Mock 4 — Stato con contesto insufficiente

```
┌─────────────────────────────────────────────────────────────┐
│  Step 2 di 5 — Selezione Traguardi & Obiettivi    40%     │
│  ════════════════════════░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                             │
│  Traguardi di Competenza — [disciplina non impostata]       │
│                                                             │
│  ⚠ Impostare disciplina e ordine nelle Impostazioni         │
│    Generali per visualizzare i traguardi.                   │
│                                                             │
│  ─── Riferimenti utili — 1 fonte ───────────────────────── │
│  📄 [Curricolo] Curricolo Fondativo generale                │
│     Vol. 4: Curricolo Fondativo              [Approfondisci]│
│                                              [Mostra altre  │
│                                               1 fonte →]   │
│                                                             │
│  [Avanti →]                                                 │
└─────────────────────────────────────────────────────────────┘
```

*Espansione "Mostra altre 1 fonte":*
```
  📖 [Approfondimento] "Traguardo", "Competenza"             │
     Vol. 6: Repertorio Concettuale            [Approfondisci]│
```

---

### Mock 5 — Stato senza risultati pertinenti

```
┌─────────────────────────────────────────────────────────────┐
│  Step 3 di 5 — Associazione Evidenze di Certificazione 60% │
│  ════════════════════════════════════░░░░░░░░░░░░░░░░░░░░ │
│                                                             │
│  Evidenze di Certificazione — Religione / Infanzia          │
│                                                             │
│  ☐ [Nessuna evidenza disponibile per questa disciplina]    │
│                                                             │
│  ─── Riferimenti ────────────────────────────────────────── │
│                                                             │
│  ℹ Nessun riferimento specifico disponibile per la         │
│    combinazione Religione / Infanzia.                       │
│                                                             │
│  📄 [Fonte normativa] Quadro Normativo generale             │
│     Vol. 3: DM 14/2024                      [Approfondisci]│
│                                                             │
│  [Avanti →]                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

### Mock 6 — Approfondimento aperto (overlay)

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─ Reader SecondBrain ─────────────────────────────────┐  │
│  │ ✕                                                     │  │
│  │                                                        │  │
│  │  📖 Volume 6 — Repertorio Concettuale                 │  │
│  │                                                        │  │
│  │  ─── Compito di Realtà ────────────────────────────   │  │
│  │                                                        │  │
│  │  Il Compito di Realtà è un prodotto o servizio        │  │
│  │  reale che l'alunno produce utilizzando le            │  │
│  │  competenze sviluppate nell'Unità Didattica di        │  │
│  │  Apprendimento.                                       │  │
│  │                                                        │  │
│  │  Caratteristiche:                                     │  │
│  │  • Autenticità: il prodotto ha un destinatario reale  │  │
│  │  • Complessità: richiede integrazione di competenze   │  │
│  │  • Contestualizzazione: inserito in un scenario reale │  │
│  │                                                        │  │
│  │  Esempi: lettera aperta, opuscolo, prototipo,        │  │
│  │  presentazione, diario, mappa concettuale.            │  │
│  │                                                        │  │
│  │  Fonte: Curricolo Fondativo I.C. Calvario-Covotta    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  Step 4 di 5 — Compito di Realtà & Note BES         80%   │
│  [testo del wizard visibile sullo sfondo, sfocato]         │
└─────────────────────────────────────────────────────────────┘
```

---

### Mock 7 — Ritorno al wizard dopo approfondimento

```
┌─────────────────────────────────────────────────────────────┐
│  Step 4 di 5 — Compito di Realtà & Note BES         80%   │
│  ══════════════════════════════════════════════░░░░░░░░░░ │
│                                                             │
│  Compito di Realtà                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Redazione cooperativa di una lettera aperta della   │   │
│  │ classe sui temi dell'inclusione sociale.            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─── Riferimenti (3) ───────────────────────────────────── │
│  📄 [Fonte normativa] Definizione: "Compito di Realtà"     │
│     Vol. 6: Repertorio Concettuale         [Approfondisci] │
│  📄 [Fonte normativa] Didattica, Inclusione, Privacy       │
│     Vol. 3: Quadro Normativo                [Approfondisci] │
│  📖 [Approfondimento] Metodologie Cooperative              │
│     Vol. 19: Ambiente Classe                [Mostra tutti]  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  Traguardi selezionati: T1, T2 (Italiano / Primaria)       │
│  Evidenze selezionate: 2 di 4                              │
│                                                             │
│  [Avanti →]                                                 │
└─────────────────────────────────────────────────────────────┘
```

*Nota: il pannello mostra 3 riferimenti con etichetta di categoria. Nessun tracciamento del comportamento di lettura.*

---

### Mock 8 — Versione mobile

```
┌───────────────────────────┐
│ Step 2 di 5        40%   │
│ ══════════════░░░░░░░░░░ │
│                           │
│ Traguardi — Ita./Prim.   │
│                           │
│ ☑ T1. Il bambino usa la  │
│    lingua italiana...     │
│ ☑ T2. Il bambino         │
│    interpreta e produce   │
│    testi orali e scritti. │
│ ☐ T3. Il bambino si      │
│    avvicina alla lingua   │
│    scritta...             │
│                           │
│ ── Riferimenti — 1 fonte │
│ 📄 [Curricolo]           │
│ Vol. 4: Curricolo Fond.  │
│ [Approfondisci]          │
│ [Mostra altre 2 →]       │
│                           │
│ [Avanti →]               │
└───────────────────────────┘
```

---

### Mock 9 — Contenuto locale puro (nessuna fonte esterna)

```
┌─────────────────────────────────────────────────────────────┐
│  ─── Riferimenti ────────────────────────────────────────── │
│                                                             │
│  📄 Curricolo Fondativo — Vol. 4                            │
│     Tutti i riferimenti provengono da volumesKB (locale)    │
│     e curriculumKB (locale). Nessuna richiesta di rete.     │
│                                                             │
│  📖 Glossario Istituto — 14 definizioni                     │
│     caricato da localStorage. Nessuna dipendenza esterna.   │
│                                                             │
│  ✓ Tutti i dati sono locali.                               │
│    Nessun servizio esterno è richiesto.                     │
│                                                             │
│  [Avanti →]                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

### Mock 10 — WikiLLM (escluso dalla prima fase)

```
┌─────────────────────────────────────────────────────────────┐
│  ─── Riferimenti ────────────────────────────────────────── │
│                                                             │
│  📄 [Curricolo] Curricolo Fondativo — Vol. 4               │
│     Traguardi e obiettivi per la disciplina.                │
│                                                             │
│  ⚠ WikiLLM non è incluso nella prima fase di validazione.  │
│    Può essere valutato successivamente per estrarre         │
│    paragrafi pertinenti o facilitare la ricerca.            │
│                                                             │
│  [Avanti →]                                                 │
└─────────────────────────────────────────────────────────────┘
```

*Nota: WikiLLM è escluso dalla prima fase per evitare complessità non necessarie. Le fonti deterministiche e direttamente citabili (curriculumKB, volumi, glossario) sono sufficienti per la validazione iniziale.*

## 11. Tavolo professionale

> **Nota:** Le valutazioni seguenti sono ipotesi basate sull'analisi del prodotto e sulle competenze dei ruoli. Non derivano da interviste effettive con docenti reali. Servono a orientare la progettazione e a identificare rischi potenziali.

### Docente di classe

- **Beneficio potenziale:** La disponibilità immediata delle fonti pertinenti potrebbe ridurre il tempo di ricerca e migliorare la coerenza delle scelte.
- **Criticità potenziale:** I riferimenti non devono essere suggerimenti, devono essere fonti consultabili. Il docente deve mantenere la deciding authority.
- **Condizione di accettazione:** I riferimenti devono essere pertinenti alla disciplina e all'ordine del docente.
- **Rischio principale:** Riferimenti generici non utili al contesto specifico.
- **Preferenza:** Ipotesi 1 — pannello compatto espandibile.

### Docente di sostegno

- **Beneficio potenziale:** Al passo 4, la normativa BES/DSA potrebbe essere disponibile senza aprire una vista separata.
- **Criticità potenziale:** Non deve sostituire il PDP o il PEI. Deve solo rendere accessibile il riferimento normativo.
- **Condizione di accettazione:** I riferimenti normativi devono essere corretti e aggiornati.
- **Rischio principale:** Confusione tra riferimento e prescrizione.
- **Preferenza:** Ipotesi 1 — con fonte chiara (Vol. 3).

### Coordinatore di dipartimento

- **Beneficio potenziale:** I riferimenti potrebbero migliorare la coerenza del lavoro dipartimentale.
- **Criticità potenziale:** Non deve diventare un obbligo burocratico o un meccanismo di controllo.
- **Condizione di accettazione:** I riferimenti devono essere informativi, non tracciati come adempimento.
- **Rischio principale:** Trasformare un supporto in un controllo.
- **Preferenza:** Ipotesi 1 — senza tracciamento del comportamento di lettura.

### Esperto di didattica

- **Beneficio potenziale:** Connettere traguardi, evidenze e compito di realtà nel momento della scelta potrebbe migliorare la coerenza della progettazione.
- **Criticità potenziale:** Non deve generare contenuti didattici. Il compito di realtà è una scelta professionale.
- **Condizione di accettazione:** I riferimenti devono essere accademici e normativi, non opinioni.
- **Rischio principale:** Il docente potrebbe delegare la scelta al sistema.
- **Preferenza:** Ipotesi 1 — con linguaggio neutro ("Puoi consultare...").

### Esperto di usabilità

- **Beneficio potenziale:** Un pannello contestuale potrebbe ridurre il carico cognitivo e il numero di cambi di vista.
- **Criticità potenziale:** Il pannello non deve essere troppo grande o invasivo. Deve essere compatto e opzionale.
- **Condizione di accettazione:** Il pannello non deve occupare più del 30% della vista del wizard.
- **Rischio principale:** Information overload.
- **Preferenza:** Ipotesi 1 — pannello compatto progressivamente espandibile.

### Esperto di sistemi per la didattica

- **Beneficio potenziale:** Il Knowledge Companion potrebbe risolvere la discontinuità tra conoscenza del dominio e contesto operativo, senza diventare un chatbot.
- **Criticità potenziale:** Non deve evolversi verso un assistente conversazionale. La semplicità è la forza.
- **Condizione di accettazione:** I riferimenti devono essere basati su fonti verificate (SecondBrain, Curricolo).
- **Rischio principale:** Deriva verso assistente generico.
- **Preferenza:** Ipotesi 1 — con confini chiari con Copilot e SecondBrain.

### Responsabile privacy

- **Beneficio potenziale:** Il Knowledge Companion è intrinsecamente locale. Nessun dato esce dal browser.
- **Criticità potenziale:** Nessuna — la funzionalità è basata su dati già presenti in memoria.
- **Condizione di accettazione:** Nessuna comunicazione esterna.
- **Rischio principale:** Nessuno.
- **Preferenza:** Ipotesi 1 — tutti i dati sono in volumesKB e curriculumKB (in-memory).

## 12. Test con docenti

> **Nota:** I test seguenti sono prove esplorative qualitative. I partecipanti costituiscono un campione esplorativo, non una misura statistica. L'obiettivo è osservare comprensione, pertinenza, ostacoli e differenze tra profili.

### Test 1 — Pertinenza traguardi

| Campo | Dato |
|---|---|
| Situazione iniziale | Docente di Italiano / Primaria, nuovo UDA |
| Passo del wizard | Passo 2 — Selezione Traguardi |
| Compito | Selezionare i traguardi per un UDA di scrittura creativa |
| Riferimento disponibile | Vol. 4 Curricolo, Vol. 8 Dettaglio, glossario "Traguardo" |
| Comportamento atteso | Docente consulta almeno un riferimento prima di selezionare |
| Segnale di utilità | Comprensione: "Capisco cosa devo coprire" |
| Segnale di confusione | "Non capisco cosa devo fare con questi riferimenti" |
| Errore critico | Docente ignora completamente il pannello |
| Domande da porre | "I riferimenti ti sono stati utili? Cosa cercavi che non hai trovato?" |
| Criterio di superamento | Campione esplorativo: osservare se almeno un partecipante utilizza i riferimenti |

### Test 2 — Riferimento normativo per evidenze

| Campo | Dato |
|---|---|
| Situazione iniziale | Docente di Scienze / Secondaria, nuovo UDA |
| Passo del wizard | Passo 3 — Evidenze |
| Compito | Sezionare le evidenze per un UDA di laboratorio scientifico |
| Riferimento disponibile | Vol. 3 Quadro Normativo (DM 14/2024), Vol. 6 Repertorio ("Evidenza") |
| Comportamento atteso | Docente apre il riferimento normativo per capire cosa sono le evidenze |
| Segnale di utilità | Comprensione: "Non sapevo cosa significasse evidenza comportamentale" |
| Segnale di confusione | "Il riferimento è troppo lungo, non ho tempo di leggerlo" |
| Errore critico | Docente seleziona evidenze senza guardare i riferimenti |
| Domande da porre | "Hai consultato il riferimento normativo? Ti è servito?" |
| Criterio di superamento | Campione esplorativo: osservare se i partecipanti aprono il riferimento normativo |

### Test 3 — Compito di realtà con ispirazione

| Campo | Dato |
|---|---|
| Situazione iniziale | Docente di Italiano / Secondaria, nuovo UDA |
| Passo del wizard | Passo 4 — Compito di Realtà |
| Compito | Scrivere il compito di realtà per un UDA di analisi del testo |
| Riferimento disponibile | Vol. 6 "Compito di Realtà", Vol. 19 Metodologie |
| Comportamento atteso | Docente consulta la definizione prima di scrivere |
| Segnale di utilità | Comprensione: "Vedere la definizione mi ha chiarito cosa devo scrivere" |
| Segnale di confusione | "Non capisco la differenza tra questo e un compito scolastico" |
| Errore critico | Docente usa il placeholder "Realizzazione di un prodotto di sintesi" |
| Domande da porre | "Cosa cercavi? Lo hai trovato? Cosa mancava?" |
| Criterio di superamento | Campione esplorativo: osservare se i partecipanti scrivono un compito specifico |

### Test 4 — Inclusione BES/DSA

| Campo | Dato |
|---|---|
| Situazione iniziale | Docente di Matematica / Primaria, UDA con alunno BES |
| Passo del wizard | Passo 4 — Note BES |
| Compito | Scrivere le note di inclusione per un UDA di geometria |
| Riferimento disponibile | Vol. 3 Normativa (PEI, PDP, UDL), Vol. 19 Metodologie |
| Comportamento atteso | Docente consulta la normativa prima di scrivere le note |
| Segnale di utilità | Comprensione: "Mi ha ricordato gli strumenti compensativi" |
| Segnale di confusione | "Non so cosa significhi UDL" |
| Errore critico | Docente lascia il campo vuoto |
| Domande da porre | "Hai consultato il riferimento normativo? Cosa cercavi?" |
| Criterio di superamento | Campione esplorativo: osservare se i partecipanti compilano il campo |

### Test 5 — Continuità dopo consultazione

| Campo | Dato |
|---|---|
| Situazione iniziale | Docente di Storia / Secondaria, al passo 4 |
| Passo del wizard | Passo 4 — Compito di Realtà |
| Compito | Consultare il riferimento "Compito di Realtà" (Vol. 6) e tornare al wizard |
| Riferimento disponibile | Vol. 6 con overlay |
| Comportamento atteso | Docente apre il reader, legge, chiude il reader, continua a scrivere |
| Segnale di utilità | Comprensione: "Ho letto la definizione e ora so cosa scrivere" |
| Segnale di confusione | "Ho perso il wizard, come torno?" |
| Errore critico | Docente non riesce a tornare al wizard |
| Domande da porre | "Sei riuscito a tornare al wizard senza problemi? Il testo era ancora presente?" |
| Criterio di superamento | Campione esplorativo: tutti i partecipanti riescono a tornare al wizard |

### Test 6 — Capacità di ignorare il pannello

| Campo | Dato |
|---|---|
| Situazione iniziale | Docente esperto di Italiano / Primaria |
| Passo del wizard | Passo 2 — Traguardi |
| Compito | Selezionare traguardi ignorando i riferimenti |
| Riferimento disponibile | Pannello riferimenti (come sempre) |
| Comportamento atteso | Docente seleziona traguardi senza consultare i riferimenti |
| Segnale di utilità | "Li ignoro ma non mi danno fastidio" |
| Segnale di confusione | "Non li guardo ma occupano spazio" |
| Errore critico | Il pannello blocca l'avanzamento del wizard |
| Domande da porre | "I riferimenti ti hanno disturbato quando non li usavi?" |
| Criterio di superamento | Il pannello non impedisce mai l'avanzamento del wizard |

### Test 7 — Assenza di prescrittività

| Campo | Dato |
|---|---|
| Situazione iniziale | Qualsiasi docente, qualsiasi passo |
| Passo del wizard | Passi 2-4 |
| Compito | Verificare che i riferimenti non dicano "Devi usare questo" |
| Riferimento disponibile | Tutti i riferimenti |
| Comportamento atteso | Il docente percepisce i riferimenti come opzionali e informativi |
| Segnale di utilità | "Mi danno informazioni, non ordini" |
| Segnale di confusione | "Mi stanno dicendo cosa fare?" |
| Errore critico | Un riferimento contiene linguaggio prescrittivo |
| Domande da porre | "Ti sembra che il sistema ti stia dicendo cosa scegliere?" |
| Criterio di superamento | Campione esplorativo: nessun partecipante segnala prescrittività |

## 13. Criteri di autorizzazione

### Autorizzazione SOLO SE:

| # | Criterio | Verifica |
|---|---|---|
| 1 | L'ipotesi è fondata dall'analisi del codice | 6 problemi informativi identificati per ispezione delle superfici |
| 2 | I riferimenti sono realmente disponibili | volumesKB (vol. 3, 4, 6, 7, 8, 19), curriculumKB (14 discipline × 3 ordini), glossario (14+ termini) |
| 3 | La pertinenza può essere spiegata con regole semplici | Mapping contestuale wizardStep + disciplina + ordine + selezioni → fonti |
| 4 | Il docente comprende la provenienza | Ogni riferimento mostra: categoria (Fonte normativa/Curricolo/Approfondimento) + volume |
| 5 | Il supporto non sostituisce la decisione | I riferimenti sono informativi ("Puoi consultare..."), mai prescrittivi |
| 6 | Il mock non richiede nuova navigazione | Ipotesi 1: pannello compatto nella stessa vista del wizard |
| 7 | Il comportamento mobile è sostenibile | 1 riga sotto i campi, espansione su richiesta |
| 8 | Almeno un'ipotesi supera i test esplorativi | Test 1-7 da eseguire con campione qualitativo |
| 9 | Il perimetro resta limitato ai passaggi 2-4 | Passi 2, 3, 4 del wizard; passi 1 e 5 esclusi |

### Blocca l'implementazione se:

| # | Condizione | Azione |
|---|---|---|
| 1 | I suggerimenti risultano generici | Bloccare e rivalutare il mapping |
| 2 | Serve una nuova architettura | Bloccare — il Companion deve usare l'architettura esistente |
| 3 | Serve una nuova rotta | Bloccare — nessuna modifica al routing congelato |
| 4 | La funzione duplica Copilot o SecondBrain | Rivedere i confini |
| 5 | Le fonti non sono affidabili | Aggiornare volumesKB prima di continuare |
| 6 | La pertinenza dipende esclusivamente da un modello remoto | Bloccare — tutto deve essere locale |
| 7 | Il docente non comprende perché il contenuto viene mostrato | Ridurre il numero di riferimenti |

## 14. Rischi

| # | Rischio | Impatto | Probabilità | Mitigazione |
|---|---|---|---|---|
| R1 | Sovraccarico informativo | Alto | Media | Max 5 riferimenti per passo, design compatto |
| R2 | Confusione riferimento/prescrizione | Alto | Bassa | Linguaggio neutro ("Puoi consultare..."), mai "Devi" |
| R3 | Deriva verso assistente conversazionale | Alto | Bassa | Nessuna chat, nessuna generazione di testo |
| R4 | Riferimenti generici non pertinenti | Medio | Media | Mapping statico testato con docenti |
| R5 | Il docente ignora il pannello | Medio | Alta | Validare con test; se ignorato, rivalutare il formato |
| R6 | Duplicazione del Copilot | Medio | Bassa | Confini chiari: Companion = fonti, Copilot = risposte |
| R7 | Duplicazione del SecondBrain | Medio | Bassa | Companion = estratti, SecondBrain = contenuto completo |
| R8 | Mancata manutenzione dei riferimenti | Medio | Media | Mapping statico, aggiornamento manuale quando i volumi cambiano |
| R9 | Incompatibilità mobile | Medio | Bassa | Mock mobile testato, pannello sotto i campi |
| R10 | Perdita di contesto dopo overlay | Basso | Bassa | Overlay con wizard visibile sullo sfondo |

## 15. Verdetto

**KNOWLEDGE_COMPANION_READY_FOR_USER_VALIDATION**

| Campo | Valore |
|---|---|
| Ipotesi fondata | L'analisi del codice e l'ispezione delle superfici indicano un'elevata probabilità che il docente non disponga delle informazioni necessarie nei passi 2-4 (6 problemi informativi su 12 identificati). Da verificare con utenti reali. |
| Ipotesi raccomandata | Ipotesi 1 — Pannello compatto progressivamente espandibile (1 riferimento principale + "Mostra tutti", fonte tracciabile con grado di autorevolezza) |
| Frase | "Il docente potrà trovare, nei passaggi centrali della progettazione UDA, i riferimenti più pertinenti al lavoro in corso senza abbandonare il contesto operativo." |
| Perimetro | Passi 2, 3, 4 del wizard UDA; riferimenti da volumesKB, curriculumKB, glossario; categori delle fonti per grado di autorevolezza |
| Esclusioni | Nessuna chat, nessuna generazione, nessuna nuova vista, nessuna modifica a shell/routing/navigazione. Esclusi dalla prima fase: UDA archiviate, proposte expert, WikiLLM, tracciamento "letto" |
| Fonti riutilizzate (prima fase) | volumesKB (vol. 3, 4, 6, 7, 8, 19), curriculumKB (traguardi, obiettivi, evidenze, nucleiFondanti), glossario (14+ termini) |
| Test richiesti | 7 test esplorativi qualitativi con campione (pertinenza, normativa, compito, inclusione, continuità, ignorabilità, prescrittività) |
| Conferma | Nessun file runtime è stato modificato. Questo documento è un OUTPUT DI ANALISI, non di implementazione. |

---

*Documento prodotto come analisi e mock. Nessuna modifica al codice è stata effettuata.*
*Commit: nessuno. Branch: nessuno. Stato: ANALISI COMPLETATA.*
