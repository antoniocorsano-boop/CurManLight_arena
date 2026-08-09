# CML-TARGET-H1 — Canonical Human Workflow

**Stato:** specifica funzionale proposta per revisione umana  
**Baseline:** P1.2 congelata, commit `9f2ac12`  
**Scope:** comportamento del docente, senza modifiche al runtime  
**Verdetto da assegnare dopo revisione:** `CML_TARGET_H1_CANONICAL_HUMAN_WORKFLOW_APPROVED`

## 1. Obiettivo

Il docente deve poter usare CurManLight dall'inizio alla fine senza conoscere la struttura tecnica dell'applicazione, i nomi dei componenti o la differenza tra viste legacy e domini interni.

Il modello umano di riferimento è:

```text
contesto di lavoro → riferimento → lavoro didattico → risultato → ripresa
```

Le aree dell'applicazione non sono il punto di partenza del ragionamento. Sono superfici diverse dello stesso lavoro:

| Concetto umano | Superficie prevalente |
|---|---|
| Contesto | Classe |
| Riferimento | Curricolo |
| Lavoro | Progettazione |
| Risultato | Documenti |
| Ripresa e orientamento | Home |

Questa corrispondenza è funzionale, non una nuova architettura di navigazione.

## 2. Principi vincolanti

1. Il docente parte da un bisogno professionale, non dal nome di una feature.
2. Il contesto classe, quando disponibile, deve restare riconoscibile durante il lavoro.
3. Ogni passaggio deve rendere espliciti contesto, oggetto corrente, stato e prossimo passo naturale.
4. Curricolo, Progettazione e Documenti devono essere passaggi collegati, non pagine indipendenti.
5. Una superficie di lettura non deve sembrare un comando di mutazione.
6. Un dato non disponibile non deve essere inventato per completare l'interfaccia.
7. Le azioni tecniche sono subordinate al lavoro professionale.
8. Il docente deve poter riprendere una bozza o un documento senza ricostruire la sequenza precedente.
9. Il flusso locale non implica autenticazione, approvazione istituzionale o collaborazione remota.
10. La specifica non autorizza ancora codice, nuove capability o modifiche alla shell/routing.

## 3. Modello di orientamento

Ogni momento del lavoro deve poter rispondere a cinque domande:

| Domanda | Risposta attesa |
|---|---|
| Dove sono? | area professionale e contesto classe, se disponibile |
| Su cosa sto lavorando? | curricolo, UDA, documento o attività corrente |
| Qual è lo stato? | disponibile, bozza, in corso, pronto o non disponibile |
| Cosa posso fare adesso? | una sola azione primaria riconoscibile |
| Dove vado dopo? | passaggio naturale già coerente con il lavoro |

Il sistema non deve obbligare il docente a interpretare tab, wizard, export o moduli per rispondere a queste domande.

## 4. Casi d'uso canonici

### H1 — «Devo lavorare sulla 2A»

**Bisogno:** entrare nel contesto corretto prima di scegliere un'attività.

| Passo | Comportamento umano atteso |
|---|---|
| Punto di partenza | Il docente apre CurManLight o riprende il lavoro dalla Home. |
| Decisione | Seleziona o conferma la classe `2A`; se esistono più sezioni, sceglie quella corretta. |
| Azione | Apre il contesto della classe e vede attività, UDA e documenti collegati quando disponibili. |
| Risultato | Il contesto attivo è chiaramente `2A`; le azioni successive si riferiscono a quella classe. |
| Passo successivo naturale | Consultare il curricolo pertinente oppure riprendere un lavoro aperto della classe. |

**Regola:** la classe è un contesto di lavoro, non necessariamente un nuovo archivio duplicato. Se non esiste una classe selezionata, il sistema deve dichiararlo e consentire di proseguire solo con dati non dipendenti dalla classe.

### H2 — «Cosa devo insegnare?»

**Bisogno:** individuare il riferimento curricolare pertinente senza leggere strutture tecniche.

| Passo | Comportamento umano atteso |
|---|---|
| Punto di partenza | Il docente parte dalla classe attiva oppure dalla Home. |
| Decisione | Conferma disciplina e livello scolastico; sceglie il riferimento curricolare pertinente. |
| Azione | Consulta traguardi, obiettivi, evidenze e organizzazione verticale disponibili per quel contesto. |
| Risultato | Capisce che cosa può insegnare e quali elementi può usare per progettare. |
| Passo successivo naturale | Avvia una progettazione collegata al riferimento selezionato. |

**Regola:** il Curricolo è una superficie di riferimento e comprensione. La presenza di importazione, popolamento o assistenza non deve sostituire la domanda professionale principale.

### H3 — «Devo preparare la progettazione»

**Bisogno:** trasformare un riferimento curricolare in un lavoro didattico concreto.

| Passo | Comportamento umano atteso |
|---|---|
| Punto di partenza | Il docente arriva dal Curricolo, dalla classe o da una bozza già aperta. |
| Decisione | Conferma disciplina, classe/target e riferimento da usare per la progettazione. |
| Azione | Costruisce o riprende un'UDA: titolo, periodo, ore, compito, evidenze e note pertinenti. |
| Risultato | Esiste una progettazione riconoscibile, collegata al curricolo e nello stato corretto. |
| Passo successivo naturale | Salvare la bozza, continuare il lavoro o generare/aggiornare il documento risultante. |

**Regola:** il wizard è una modalità di compilazione, non il modello mentale principale. Il docente deve riconoscere prima cosa sta progettando, per chi e a quale punto si trova.

### H4 — «Riprendo ciò che avevo iniziato»

**Bisogno:** tornare al lavoro aperto senza cercare tra tutte le funzioni.

| Passo | Comportamento umano atteso |
|---|---|
| Punto di partenza | Il docente apre la Home oppure rientra nel sistema. |
| Decisione | Riconosce la scheda di lavoro corrente tramite titolo, classe, disciplina e stato. |
| Azione | Preme una sola azione primaria di ripresa, per esempio continuare l'UDA o aprire il documento corrente. |
| Risultato | Torna esattamente al lavoro aperto, senza dover ripetere la selezione del percorso. |
| Passo successivo naturale | Continuare dal punto salvato oppure passare al risultato collegato. |

**Regola:** lo stato del lavoro corrente ha priorità sulle attività storiche. Le attività recenti non devono rappresentare il wizard in corso come se fosse un documento già prodotto.

### H5 — «Voglio vedere il risultato»

**Bisogno:** ottenere anteprima o documento senza cercare un'azione tecnica in un'altra area.

| Passo | Comportamento umano atteso |
|---|---|
| Punto di partenza | Il docente si trova nella progettazione corrente oppure nella Home. |
| Decisione | Sceglie di vedere l'anteprima o il documento collegato alla progettazione. |
| Azione | Apre l'anteprima; da lì può eseguire l'azione documentale disponibile, come aggiornare, scaricare o stampare. |
| Risultato | Vede il risultato della progettazione e ne comprende origine e stato/versione. |
| Passo successivo naturale | Tornare alla progettazione per correggere oppure conservare/esportare la versione corrente. |

**Regola:** Documenti rappresenta oggetti professionali e loro versioni, non un contenitore di formati di export. L'export è un'azione contestuale sul documento, non l'identità della workspace.

### H6 — «Cosa ho già predisposto per questa classe?»

**Bisogno:** avere una vista affidabile del lavoro collegato a una classe.

| Passo | Comportamento umano atteso |
|---|---|
| Punto di partenza | Il docente apre la classe `2A`. |
| Decisione | Sceglie di consultare il lavoro già predisposto, senza dover distinguere UDA, documenti o attività tecniche per nome interno. |
| Azione | Consulta una lista o una sintesi di lavori collegati: progettazioni, documenti, stato e ultima attività disponibile. |
| Risultato | Capisce cosa esiste già per la classe, cosa è in bozza e cosa può essere ripreso o aggiornato. |
| Passo successivo naturale | Aprire un lavoro esistente, creare una nuova progettazione dal curricolo o vedere il documento collegato. |

**Regola:** il collegamento alla classe è un asse di consultazione e continuità. Non autorizza a duplicare gli archivi dei domini né a introdurre automaticamente un nuovo modello persistente.

## 5. Decisioni strutturali derivate

Le decisioni sotto riportate sono conseguenze funzionali candidate, non ancora approvate per l'implementazione.

### 5.1 Classe come contenitore operativo principale

**Raccomandazione:** sì, come contesto operativo principale quando il lavoro è riferito a una classe; no, come contenitore esclusivo di tutte le funzioni.

La classe deve fornire l'ancoraggio umano per H1 e H6 e deve restare visibile durante H2, H3 e H5 quando il dato è disponibile. Non deve assorbire il significato autonomo di Curricolo, Progettazione o Documenti e non deve creare copie locali degli stessi oggetti.

### 5.2 Ruolo autonomo delle aree

| Area | Ruolo umano autonomo | Non deve diventare |
|---|---|---|
| Curricolo | capire il riferimento e decidere cosa usare | un menu di strumenti tecnici o un deposito di importazioni |
| Progettazione | costruire e seguire il lavoro didattico | una sequenza di wizard senza contesto |
| Documenti | vedere, versionare e ottenere il risultato professionale | una lista di formati da esportare |
| Classe | orientare il lavoro riferito a un gruppo reale | un duplicato degli archivi curriculari/documentali |
| Home | riprendere il lavoro e mostrare la prossima azione | un dashboard di metriche senza continuità |

### 5.3 Passaggi artificiali da eliminare

Sono candidati alla rimozione o al riassorbimento nel contesto, non alla cancellazione indiscriminata delle capability:

- passare da Curricolo a Progettazione senza trasferire disciplina, livello, classe e riferimento;
- entrare in Progettazione per capire prima quale lavoro si sta costruendo;
- cercare un documento come se fosse un export tecnico separato dal suo oggetto d'origine;
- usare tab o modalità interne come unica spiegazione della pagina;
- riprendere un wizard dal menu invece che dallo stato del lavoro corrente;
- ricostruire dalla classe quali UDA e documenti le appartengono;
- mostrare dati di classe, stato o origine non realmente disponibili;
- esporre azioni di assistenza, importazione o configurazione prima dell'azione professionale primaria.

## 6. Stato e continuità minimi

Per ciascun oggetto collegabile al percorso devono essere distinguibili, quando realmente disponibili:

```text
contesto personale → classe/target → oggetto di lavoro → stato → origine → prossima azione
```

La continuità minima richiesta è:

```text
Classe → Curricolo → Progettazione → Documenti → Classe
Home → lavoro corrente → punto salvato → risultato collegato
```

Se un collegamento non esiste, il sistema deve mostrare l'assenza e offrire il passo possibile più vicino, senza simulare una relazione.

## 7. Fuori perimetro H1

- modifiche a codice, store, componenti, shell o routing;
- nuova IA o nuove macro-aree;
- completamento dei workflow curriculari, documentali o di classe;
- autenticazione, ruoli verificati, collaborazione remota o backend;
- nuove capability o decisioni di governance;
- visual polish, mockup pixel-perfect o scelta dei componenti UI;
- piano d'implementazione P1.3;
- correzione del debito tecnico non necessario a validare il modello umano.

## 8. Criteri di approvazione

La specifica può essere approvata solo se un docente può leggere ciascun caso H1–H6 e riconoscere:

1. da quale situazione reale parte;
2. quale decisione deve prendere;
3. quale azione esegue;
4. quale risultato ottiene;
5. quale passo successivo è naturale;
6. quale area è responsabile del significato del lavoro;
7. quali dati non devono essere inventati quando mancano.

La validazione non consiste ancora nel verificare schermate. Consiste nell'approvare il percorso umano e le tre decisioni strutturali derivate.

## 9. Esito proposto

```text
CML_TARGET_H1_CANONICAL_HUMAN_WORKFLOW_READY_FOR_REVIEW
```

Solo dopo approvazione esplicita della specifica potrà essere assegnato:

```text
CML_TARGET_H1_CANONICAL_HUMAN_WORKFLOW_APPROVED
```

e potrà essere definita la successiva slice d'implementazione.
