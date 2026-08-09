# CML-TARGET-H1 — Canonical Human Workflow

**Stato:** correzione H1-R1 pronta per approvazione
**Baseline:** P1.2 congelata, commit `9f2ac12`  
**Prerequisiti:** H0 e H0.1 approvati; H1 precedente da correggere
**Scope:** comportamento umano, senza modifiche al runtime

## 1. Obiettivo

CurManLight deve poter essere usato da un docente dall'inizio alla fine senza conoscere l'architettura del programma. H1 definisce come le capacità approvate in H0.1 devono essere comprese e utilizzate dalle persone.

Il modello non è una sequenza unica. È composto da due percorsi canonici, collegati ma distinti.

### Percorso didattico

```text
contesto/classe → curricolo vigente → selezione dei riferimenti → progettazione → documento/risultato → ripresa del lavoro
```

Qui l'oggetto centrale è la **progettazione didattica**.

### Percorso di evoluzione curricolare

```text
curricolo vigente → esigenza di modifica → proposta → revisione autorizzata → verifica tecnica della versione pertinente → decisione curricolare → applicazione della decisione → nuova versione → entrata in vigore
```

Qui l'oggetto centrale cambia nel tempo: **curricolo vigente → proposta/versione → decisione → nuova versione curricolare**.

La revisione prevede ritorni e terminali alternativi:

```text
revisione → richiesta modifiche → nuova versione proposta → reinvio → nuova verifica tecnica, se necessaria

terminali: ritirata | respinta | ammessa alla decisione
```

Applicazione della decisione, produzione della nuova versione ed entrata in vigore non sono sinonimi e non devono essere rappresentate come un generico “consolidamento”.

Le aree dell'applicazione sono superfici dello stesso lavoro, non il punto di partenza del ragionamento:

| Concetto umano | Superficie prevalente |
|---|---|
| Contesto | Classe |
| Riferimento | Curricolo |
| Lavoro | Progettazione |
| Risultato | Documenti |
| Ripresa e orientamento | Home |

## 2. Principi vincolanti

1. Il docente parte da un bisogno professionale, non dal nome di una feature.
2. La classe resta riconoscibile durante il percorso didattico, quando disponibile.
3. Ogni passaggio esplicita contesto, oggetto, stato e prossimo passo naturale.
4. Curricolo, Progettazione e Documenti sono passaggi collegati, non pagine isolate.
5. La consultazione non deve sembrare una mutazione.
6. La verifica tecnica non è approvazione pedagogica o istituzionale.
7. La decisione curricolare è un atto umano autorizzato, non un esito automatico.
8. Dati e relazioni non disponibili non devono essere inventati.
9. Il docente deve poter riprendere una bozza o un documento senza ricostruire il percorso.
10. La revisione del curricolo d'istituto è normalmente chiusa e non è una funzione ordinaria sempre disponibile.
11. B3B gestisce proposte solo all'interno di una revisione formalmente aperta.
12. H1 non autorizza codice, nuove capability, modifiche alla shell o al routing.

## 3. Traduzione professionale

La macchina a stati protegge il significato del lavoro, ma non è il linguaggio principale dell'utente.

| Momento | Domanda dell'utente | Risultato comprensibile |
|---|---|---|
| Curricolo vigente | «Qual è il riferimento che vale adesso?» | Riferimento corrente identificato e consultabile |
| Proposta | «Che cosa voglio modificare e perché?» | Proposta/versione con motivazione riconoscibile |
| Revisione | «Questa proposta può proseguire o deve essere corretta?» | Stato e azione successiva |
| Verifica tecnica | «I dati della versione che stiamo valutando sono coerenti?» | “Nessun problema tecnico rilevato” oppure “Problemi da correggere” |
| Decisione curricolare | «Quale decisione è stata assunta su questa versione?» | Esito umano autorizzato, con motivazione e provenienza |
| Applicazione | «Come si traduce la decisione nel curricolo?» | Effetto atteso e nuova versione da produrre |
| Nuova versione | «Quale versione ne deriva?» | Versione identificata e tracciabile |
| Entrata in vigore | «Da quando questa è la versione da utilizzare?» | Riferimento vigente con decorrenza esplicita |

La versione ammessa alla decisione deve possedere una verifica tecnica pertinente e non obsoleta, quando tale verifica è richiesta. Dopo una richiesta di modifica e una nuova versione la verifica può quindi essere rieseguita.

## 4. Processo istituzionale di revisione del curricolo

La revisione del curricolo d'istituto è normalmente **chiusa**. Il curricolo vigente
è disponibile per consultazione e uso didattico ordinario. La revisione viene aperta
solo quando esiste una motivazione istituzionale esplicita, per esempio nuove
Indicazioni o modifiche normative, cambiamenti ordinamentali, scelte strategiche,
esiti di monitoraggio o valutazione, oppure decisioni degli organi della scuola.

Il processo non viene aperto autonomamente dal referente. Il referente opera su
mandato esplicito del dirigente scolastico, nell'ambito del processo che conduce
alla deliberazione o decisione del Collegio dei docenti. Mandato, attivazione e
decisione sono concetti distinti:

- il **mandato** stabilisce perché, con quale perimetro e con quale autorizzazione
  la revisione può essere riaperta;
- l'**attivazione** abilita e prepara operativamente il processo in CurManLight;
- la **decisione** è assunta dagli organi o soggetti previsti dal processo, non dal
  referente in quanto tale.

L'oggetto umano che contiene il percorso è il **Processo/Campagna di Revisione del
Curricolo d'Istituto**. Esso raccoglie mandato, motivazione, perimetro, materiali,
partecipanti, fasi, responsabilità e stato.

```text
revisione chiusa
  → mandato e motivazione istituzionale
  → preparazione del processo
  → revisione aperta e in preparazione
  → consultazione e lavoro dei docenti
  → elaborazione delle strutture intermedie
  → sintesi del referente
  → verifica tecnica, quando richiesta
  → decisione curricolare
  → applicazione → nuova versione → entrata in vigore
  → chiusura della revisione
```

B3B è subordinato a questo oggetto: gestisce la proposta di modifica fino al
confine della decisione **dentro una revisione aperta**. Non apre la revisione,
non sostituisce le strutture intermedie, non rappresenta la decisione collegiale
e non rende vigente una modifica.

### Apertura e preparazione

Il referente, con il mandato ricevuto, deve essere guidato a definire almeno:

1. motivazione della revisione;
2. mandato e contesto, inclusi atti e riferimenti di partenza;
3. perimetro: intero curricolo, ordini, discipline, aree o segmenti;
4. materiali di riferimento;
5. partecipanti e articolazioni professionali;
6. fasi, scadenze e responsabilità;
7. materiali che i docenti devono conoscere;
8. avvio formale del lavoro.

### Partecipazione multilivello

Il processo rende esplicita la progressione professionale:

1. **Docenti:** conoscono motivazione e materiali, consultano il vigente e
   formulano osservazioni o proposte pertinenti al proprio lavoro.
2. **Strutture intermedie:** dipartimento, intersezione, interclasse o altra
   articolazione configurata esaminano, confrontano, aggregano, modificano e
   selezionano le proposte, producendo una sintesi di livello successivo.
3. **Referente:** verifica completezza, coordina, evidenzia convergenze e
   conflitti e prepara il dossier complessivo per la fase decisionale.
4. **Organo decisionale:** riceve vigente, motivazioni, proposte, esiti
   intermedi, verifiche e sintesi e assume la decisione curricolare prevista.
5. **Applicazione:** solo dopo la decisione si producono la nuova versione e la
   sua entrata in vigore.

Il referente è orchestratore del processo, non proprietario del curricolo.

## 5. Modello di orientamento

Ogni momento del lavoro deve rispondere a cinque domande:

| Domanda | Risposta attesa |
|---|---|
| Dove sono? | Area professionale e classe, se disponibile |
| Su cosa sto lavorando? | Curricolo, proposta, progettazione o documento corrente |
| Qual è lo stato? | Disponibile, bozza, in corso, da correggere, pronto o vigente |
| Cosa posso fare adesso? | Una sola azione primaria riconoscibile |
| Dove vado dopo? | Passaggio naturale coerente con il lavoro |

## 6. Casi d'uso didattici canonici

### H1 — «Devo lavorare sulla 2A»

**Punto di partenza:** Home o riapertura del sistema.
**Decisione:** selezionare o confermare la classe `2A`.
**Azione:** aprire il contesto e vedere lavori e documenti collegati, quando disponibili.
**Risultato:** `2A` è il contesto attivo e le azioni successive sono riferite a essa.
**Passo successivo naturale:** consultare il curricolo pertinente o riprendere un lavoro aperto.

La classe è un contesto operativo, non un archivio duplicato dei domini.

### H2 — «Cosa devo insegnare?»

**Punto di partenza:** classe attiva o Home.
**Decisione:** confermare disciplina e livello e scegliere il riferimento pertinente.
**Azione:** consultare traguardi, obiettivi, evidenze e struttura verticale disponibili.
**Risultato:** il docente comprende che cosa può insegnare e da quali riferimenti progettare.
**Passo successivo naturale:** avviare una progettazione collegata.

Il Curricolo è una superficie di riferimento e comprensione.

### H3 — «Devo preparare la progettazione»

**Punto di partenza:** Curricolo, classe o bozza aperta.
**Decisione:** confermare classe/target e riferimento.
**Azione:** costruire o riprendere l'UDA, con i dati didattici pertinenti.
**Risultato:** esiste una progettazione riconoscibile, collegata al curricolo e con stato chiaro.
**Passo successivo naturale:** salvare, continuare o aggiornare il documento risultante.

Il wizard è una modalità di compilazione, non il modello mentale principale.

### H4 — «Riprendo ciò che avevo iniziato»

**Punto di partenza:** Home o rientro nel sistema.
**Decisione:** riconoscere il lavoro tramite titolo, classe, disciplina e stato.
**Azione:** usare una sola azione primaria di ripresa.
**Risultato:** il docente torna al punto salvato senza ripetere la selezione del percorso.
**Passo successivo naturale:** continuare il lavoro o aprire il risultato collegato.

Lo stato corrente ha priorità sulle attività storiche.

### H5 — «Voglio vedere il risultato»

**Punto di partenza:** progettazione corrente o Home.
**Decisione:** vedere anteprima o documento collegato.
**Azione:** aprire il risultato e, se disponibile, aggiornarlo, scaricarlo o stamparlo.
**Risultato:** origine e stato/versione del documento sono comprensibili.
**Passo successivo naturale:** correggere la progettazione oppure conservare/esportare il risultato.

Documenti rappresenta oggetti professionali e versioni, non formati di export.

### H6 — «Cosa ho già predisposto per questa classe?»

**Punto di partenza:** contesto della classe `2A`.
**Decisione:** consultare il lavoro predisposto senza conoscere i nomi interni.
**Azione:** vedere progettazioni, documenti, stato e ultima attività disponibile.
**Risultato:** il docente distingue ciò che è in bozza, pronto, riprendibile o aggiornabile.
**Passo successivo naturale:** aprire un lavoro, crearne uno dal curricolo o vedere il documento.

Il collegamento alla classe offre continuità e consultazione; non crea archivi duplicati.

## 7. Decisioni strutturali derivate

### Classe come contenitore operativo

La classe è il principale contesto operativo quando il lavoro è riferito a un gruppo reale. Non è il contenitore esclusivo e non assorbe il significato autonomo di Curricolo, Progettazione o Documenti.

### Ruoli autonomi

| Area | Ruolo umano | Non deve diventare |
|---|---|---|
| Curricolo | capire il riferimento vigente e scegliere cosa usare | deposito di strumenti tecnici |
| Progettazione | costruire e seguire il lavoro didattico | wizard senza contesto |
| Documenti | vedere, versionare e ottenere il risultato | lista di export |
| Classe | orientare il lavoro riferito a un gruppo | duplicato degli archivi |
| Home | riprendere il lavoro e mostrare la prossima azione | dashboard senza continuità |

### Passaggi artificiali da eliminare

- passare da Curricolo a Progettazione senza trasferire classe e riferimento;
- entrare in Progettazione per capire che cosa si sta costruendo;
- cercare un documento come export separato dal suo oggetto d'origine;
- usare tab o wizard come unica spiegazione del lavoro;
- riprendere un wizard dal menu invece che dallo stato corrente;
- ricostruire manualmente dalla classe quali lavori e documenti le appartengono;
- mostrare dati o relazioni non realmente disponibili.

## 8. Continuità minima

```text
classe → curricolo → progettazione → documento → classe
curricolo vigente → proposta → revisione → decisione → nuova versione → vigente
Home → lavoro corrente → punto salvato → risultato collegato
```

Se un collegamento non esiste, il sistema mostra l'assenza e offre il passo possibile più vicino senza simulare una relazione.

## 9. Fuori perimetro H1

- modifiche a codice, store, componenti, shell o routing;
- completamento dei workflow curriculari, documentali o di classe;
- autenticazione, ruoli verificati, collaborazione remota o backend;
- nuove capability o decisioni di governance;
- visual polish o scelta dei componenti UI;
- piano d'implementazione P1.3.

## 10. Criteri di approvazione

Un docente deve poter leggere H1 e riconoscere, per ciascun percorso e caso d'uso:

1. la situazione reale da cui parte;
2. la decisione da prendere;
3. l'azione da eseguire;
4. il risultato ottenuto;
5. il passo successivo naturale;
6. il significato professionale dell'area coinvolta;
7. i dati che non devono essere inventati;
8. se il processo di revisione è chiuso oppure aperto con quale mandato e perimetro;
9. quale ruolo esercita: docente, articolazione intermedia, referente o organo decisionale.

La validazione non consiste ancora nel verificare schermate: consiste nell'approvare il modello umano e le superfici che dovranno renderlo visibile.

## 11. Esito

```text
CML_TARGET_H1_REQUIRES_CORRECTION_H1_R1
CML_TARGET_H1_R1_CANONICAL_HUMAN_WORKFLOW_READY_FOR_APPROVAL
NO_RUNTIME_CHANGE_AUTHORIZED
P1_3_NOT_DEFINED
```

Solo dopo l'approvazione esplicita di H1-R1 potrà essere definita la successiva slice d'implementazione.
