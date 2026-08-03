# CML-635B2 — Permission Enforcement and UI Exposure Design

## 1. Stato della specifica

```text
CML_635B2_PERMISSION_ENFORCEMENT_UI_EXPOSURE_DESIGN_APPROVED
```

| Voce | Stato |
| --- | --- |
| Baseline | `6885f18 feat(session): unify workspace and teacher profile settings` |
| CML-635A | Completa localmente |
| CML-635B1 | Specifica completata |
| Implementazione B2 | Non iniziata |
| Codice modificato da questa attività | Nessuno |
| Nuovo store dei permessi | Escluso |
| Autenticazione/backend | Esclusi |

Questa specifica definisce l'applicazione del modello B1 all'interfaccia e ai
punti di esecuzione. Non è un piano d'implementazione e non introduce codice.

Il verdetto definitivo è **APPROVATA**. Le correzioni sono recepite in questo documento prima della stesura del piano d'implementazione; l'implementazione B2 non è iniziata.

## 2. Obiettivo prodotto

Il docente potrà capire quali azioni può svolgere nel workspace locale e potrà
ricevere un esito chiaro quando un'azione non è disponibile, senza che
l'interfaccia simuli un'autenticazione istituzionale.

B2 deve allineare tre elementi:

1. ciò che l'interfaccia espone;
2. ciò che il servizio o l'azione può eseguire;
3. ciò che la matrice di capacità di B1 dichiara.

Nascondere o disabilitare un controllo non è sufficiente: un richiamo diretto
all'azione deve ricevere la stessa verifica.

## 3. Fonti e ricognizione del repository

La specifica usa come fonti:

- `WorkspaceIdentity` e il relativo resolver già definiti da CML-635A;
- `docs/07_product_evolution/CML-635B1_ROLES_AND_CAPABILITIES_DESIGN.md`;
- `useCurriculumStore` come persistenza locale dell'identità e degli archivi;
- `InstitutionConfigPanel` per il salvataggio e il reset del contesto;
- `DashboardView` per le attuali esposizioni condizionate dal ruolo dichiarato;
- `CanonicalDocumentTab`, `EsportazioniTab` e i servizi documentali canonici;
- `ProcessoTab` e gli handler di import/merge CML;
- dominio revisioni (`RevisionProposal`, `Decision`, transizioni e repository);
- `curriculumPilotService` e i validatori curricolari;
- registry e servizi dei provider IA locali.

La ricognizione ha rilevato confronti diretti come `role === 'insegnante'` nel
dashboard. Sono esposizioni legacy da ricondurre al resolver B2 durante
l'implementazione; non costituiscono una nuova matrice autorizzativa.

## 4. Principi architetturali obbligatori

### 4.1 Una sola matrice

La matrice definita da B1 è l'unica fonte delle capacità. Non devono esistere
copie nei componenti, nello store, nei servizi o nei test d'integrazione.

Un componente può chiedere:

```ts
can(role, 'document.export')
```

Non può decidere autonomamente che un ruolo “sembra” abilitato.

### 4.2 Risoluzione centralizzata

`WorkspaceIdentity.declaredRole` viene trasformato una sola volta nel ruolo
operativo definito da B1. I componenti non leggono né interpretano direttamente
`declaredRole`.

Il valore resta autodichiarato. La risoluzione deve esporre anche la fonte e il
trust locale (`self-declared` oppure `unknown`), senza produrre un ruolo
verificato.

### 4.3 Capacità derivate

Le capacità sono calcolate dal ruolo corrente e non vengono persistite:

- nessun campo `capabilities` in `WorkspaceIdentity`;
- nessun campo `permissions` nello store;
- nessuna chiave `localStorage` dedicata;
- nessun cache persistente delle concessioni;
- nessuna modifica automatica della matrice in base alle azioni eseguite.

### 4.4 Doppio livello di controllo

Ogni azione protetta deve avere:

1. controllo di esposizione nell'interfaccia;
2. controllo nel punto di esecuzione, servizio o funzione di dominio che
   produce la mutazione o l'effetto osservabile.

Il secondo controllo riceve il contesto operativo risolto; non deve recuperare
autonomamente il ruolo dalla UI o da una chiave locale.

### 4.5 Negazione deterministica

Una negazione deve essere tipizzata e non deve mutare lo stato:

```ts
type CapabilityDenial = {
  ok: false;
  reason: 'CAPABILITY_NOT_GRANTED';
  requiredCapability: WorkspaceCapability;
  resolution: ResolvedWorkspaceRole;
};
```

Un'azione negata non deve:

- aggiornare lo store;
- creare versioni, proposte o decisioni;
- esportare dati;
- inviare richieste a un provider IA;
- produrre effetti collaterali osservabili.

### 4.6 Stati restrittivi

Workspace assente, ruolo dichiarato assente e ruolo sconosciuto usano il profilo
più restrittivo. Non sono alias di `teacher` e non ricevono capacità per
default.

Il ruolo `neutral` non è una voce della matrice B1: identità assente, ruolo assente e ruolo sconosciuto non ricevono quindi implicitamente `workspace.view` o `curriculum.consult`. Restano disponibili soltanto le superfici informative già pubbliche e non protette dal prodotto; B2 non può trasformarle in capacità operative. Analogamente, una modalità di `public-consultation` non concede capacità da sola: l accesso è ammesso solo se la matrice B1 lo assegna al ruolo risolto. Un eventuale accesso neutro o pubblico di sola lettura richiederebbe una decisione formale B1.

### 4.7 Limite di sicurezza

B2 fornisce vincoli locali di flusso e di interfaccia. Non protegge da
manomissioni locali e non dimostra identità, appartenenza o autorità
istituzionale.

## 5. Tracciabilità capacità → prodotto reale

| Capacità B1 | Caso d'uso reale | Punto UI | Punto di esecuzione | Stato |
| --- | --- | --- | --- | --- |
| `workspace.view` | Consultazione del contesto corrente per i ruoli concessi da B1 | `InstitutionConfigPanel`, dashboard e intestazioni | Letture di `useCurriculumStore` e selettori institution | `READY_FOR_B2` |
| `workspace.configure` | Salvataggio/reset di `WorkspaceIdentity` | `InstitutionConfigPanel` | futuri comandi applicativi `configureWorkspace` / `resetWorkspaceConfiguration`, poi setter store | `READY_FOR_B2` |
| `curriculum.consult` | Consultazione del curriculum locale per i ruoli concessi da B1 | `CurriculumTab`, viste curricolo e knowledge base | Selettori e read model curricolari | `READY_FOR_B2` |
| `design.create` | Creazione/modifica di progettazione e UDA | flussi `progetta-annuale`, componenti design | handler di progettazione e aggiornamento archivi locali | `READY_FOR_B2` |
| `document.create` | Creazione di documento canonico da UDA/proposta | `EsportazioniTab` | `documentProduction` e repository documenti | `READY_FOR_B2` |
| `document.preview` | Generazione/consultazione anteprima | `CanonicalDocumentTab` | `renderDocument` e stato preview locale | `READY_FOR_B2` |
| `document.export` | Effetto finale di stampa/download/export del documento canonico | `CanonicalDocumentTab`, `EsportazioniTab` | futuro comando export; `validateExportability` resta solo validatore documentale puro | `READY_FOR_B2` |
| `proposal.create` | Proposta di revisione curricolare canonica | nessun punto UI canonico completo; `ProcessoTab` usa ancora dati legacy | `addProposal` nel dominio revisioni | `REQUIRES_WORKFLOW_REDESIGN` |
| `document.review` | Consultazione e revisione di proposte/documenti | `RevisioneTab`, `CanonicalDocumentTab` | transizioni revisioni e `createDocumentRevision` | `DEFERRED_PENDING_SCOPE_DECISION` |
| `department.consolidate` | Import/merge di file dipartimentali `.cml` | `ProcessoTab` e dashboard referente/dipartimento | handler import/merge e contratti transfer | `READY_FOR_B2` |
| `curriculum.validate` | Validazione di dati e sintesi curricolari | viste curricolo/pilot, senza comando unico di validazione | validatori curricolari e `curriculumPilotService` | `DOMAIN_ONLY_NO_CURRENT_UI` |
| `institution.validate` | Consultazione di checklist e riferimenti istituzionali | `certificazione-pa` e widget dirigente/collegio | non esiste un servizio di validazione istituzionale esecutivo | `UI_ONLY_NO_ACTION_BOUNDARY` |

Lo stato `READY_FOR_B2` indica che esiste un'azione o un confine applicativo
reale da proteggere; non significa che il controllo sia già implementato.

## 6. Confini per area funzionale

| Area | Capacità | Concessa | Negata | UI | Esecuzione | Stato B2 |
| --- | --- | --- | --- | --- | --- | --- |
| Configurazione contesto | `workspace.configure` | Salvataggio/reset di `WorkspaceIdentity` | `InstitutionConfigPanel` | futuri comandi applicativi `configureWorkspace` / `resetWorkspaceConfiguration`, poi setter store | `READY_FOR_B2` |
| Modifica profilo docente | nessuna capacità B1 dedicata | Continua secondo il profilo A3 | Non viene bloccata dal ruolo operativo | `TeacherProfileConfigPanel` | Handler A3 invariati | Fuori da enforcement B2 |
| Consultazione documenti | `document.preview`, `curriculum.consult` | Consultazione e anteprima | Mostra contenuto senza azioni di modifica/export non concesse | `CanonicalDocumentTab` | Letture/rendering | In scope parziale |
| Creazione proposte | `proposal.create` | Avvia proposta quando il flusso canonico esiste | Nessuna creazione o mutazione | futuro punto canonico | Guard su `addProposal`/application service | In attesa redesign |
| Revisione | `document.review` | Consultazione e revisione di proposte/documenti | `RevisioneTab`, `CanonicalDocumentTab` | transizioni revisioni e `createDocumentRevision` | `DEFERRED_PENDING_SCOPE_DECISION` |
| Consolidamento dipartimentale | `department.consolidate` | Importa e consolida dati locali | Nessun merge e nessuna mutazione dell'archivio | `ProcessoTab` | Guard su handler/import service | Primo candidato verticale |
| Validazione istituzionale | `institution.validate` | Mostra esito locale se esiste un servizio | Nessuna validazione o registrazione | checklist locale | Nessun punto esecutivo attuale | Non dichiarare completa |
| Archiviazione | nessuna assegnazione attuale | Consultazione secondo policy già esistente | Nessuna transizione di archivio protetta da B2 | `CanonicalDocumentTab` | `archiveDocument`/status transition | `DEFERRED_PENDING_CAPABILITY_DECISION` |
| Esportazione | `document.preview` / `document.export` | Preview pura separata da stampa, download JSON legacy e altri export | Nessun effetto finale senza `document.export` | pulsanti preview/export/print/download | guard capability -> `validateExportability` -> effetto export | Primo candidato verticale |
| Amministrazione locale | `workspace.configure` | Salvataggio/reset di `WorkspaceIdentity` | `InstitutionConfigPanel` | futuri comandi applicativi `configureWorkspace` / `resetWorkspaceConfiguration`, poi setter store | `READY_FOR_B2` |
| Configurazione provider IA | nessuna capacità B1 specifica | Resta nel boundary IA locale esistente | Non viene trasformata in privilegio di ruolo | pannelli/provider boundary esistenti | registry/configuration service | `OUT_OF_SCOPE` |
| Azioni senza boundary | nessuna assegnazione automatica | Restano invariate fino a un confine esplicito | Non applicare un blocco solo grafico | eventuale UI legacy | nessun punto sicuro | `OUT_OF_SCOPE` |

Il profilo docente non viene usato come permesso: ordine, disciplina, classi e
sezioni descrivono il lavoro del docente e restano separati dalle capacità.

## 7. Modello di esposizione UI

La scelta dell'esposizione deve dipendere dalla funzione, non dal solo nome del
ruolo.

| Stato UI | Quando usarlo | Requisito |
| --- | --- | --- |
| Visibile e abilitata | Azione pertinente e concessa | Il punto di esecuzione deve comunque verificare la capacità |
| Visibile ma disabilitata | Il processo è utile da comprendere anche senza poterlo eseguire | `disabled`, focus/accessibilità coerenti e spiegazione associata |
| Nascosta | Funzione non pertinente e la sua presenza aggiungerebbe rumore | Non nascondere informazioni necessarie a capire il workflow |
| Sezione consultabile, non modificabile | Dati utili alla lettura ma mutazione non concessa | Mostrare chiaramente il limite e mantenere navigazione da tastiera |
| Messaggio di capacità mancante | L'utente ha tentato l'azione o deve capire perché non può eseguirla | Messaggio vicino all'azione e risultato tipizzato |

Regole:

- non creare pannelli vuoti senza spiegazione;
- non usare solo colore o opacità per comunicare la negazione;
- mantenere nome accessibile, focus e ordine di tabulazione;
- associare una descrizione con `aria-describedby` quando l'azione è
  disabilitata;
- dopo il cambio ruolo, rieseguire la risoluzione e aggiornare immediatamente
  l'esposizione;
- non rimuovere bozze soltanto perché il ruolo è cambiato.

Testi utente approvati:

- “Questa funzione non è disponibile per il ruolo dichiarato.”
- “Per eseguire questa attività occorre un ruolo operativo compatibile.”
- “Il ruolo è autodichiarato e non costituisce una verifica istituzionale.”
- “Puoi consultare questo contenuto, ma non modificarlo con il ruolo corrente.”

Da evitare: `permission denied`, `unauthorized`, `utente non autorizzato`,
`ruolo verificato` o formule che suggeriscano sicurezza istituzionale.

## 8. Interfaccia applicativa prevista

### 8.1 Dominio puro

Il dominio B2/B1 deve possedere, concettualmente:

- `resolveOperationalRole(declaredRole)`;
- `can(role, capability)`;
- `getCapabilities(role)`;
- `requireCapability(role, capability)`;
- risultato di negazione tipizzato.

Queste funzioni ricevono valori espliciti e non importano React, Zustand,
IndexedDB, `localStorage` o servizi di rete.

### 8.2 Risoluzione tipizzata e adattatore applicativo

La risoluzione non deve usare un ruolo opzionale che renda ambiguo il caso neutro/sconosciuto. Il contratto concettuale è discriminato:

```ts
type ResolvedWorkspaceRole =
  | { status: 'resolved'; role: WorkspaceRole; trust: 'self-declared' }
  | { status: 'neutral'; trust: 'unknown' }
  | { status: 'unknown'; declaredRole: string; trust: 'unknown' };
```

Il valore `declaredRole` sconosciuto può comparire solo come diagnostica non autoritativa. Il `CapabilityDenial` conserva l intera `resolution`.

Un adattatore può leggere lo stato corrente di `useCurriculumStore`, invocare il resolver e fornire alla UI un read model equivalente a:

```ts
interface CapabilitiesReadModel {
  resolution: ResolvedWorkspaceRole;
  can: (capability: WorkspaceCapability) => boolean;
  capabilities: readonly WorkspaceCapability[];
}
```

Un eventuale `useCapabilities()` è un adattatore React, non una nuova fonte di stato. Deve ricalcolare il read model quando cambia `workspaceIdentity` e non deve persistere il risultato. L array delle capability, se esposto, è ordinato, immutabile e stabilizzato/memoizzato; non si crea un nuovo Set a ogni render. Il selettore `can` resta la superficie minima preferita.

### 8.3 Servizi e punti di esecuzione

I servizi ricevono un contesto o una funzione di guard esplicita. Non leggono
`declaredRole` direttamente e non importano componenti UI.

Esempio concettuale:

```ts
function executeConsolidation(input: ConsolidationInput, role: WorkspaceRole | undefined) {
  const guard = requireCapability(role, 'department.consolidate');
  if (!guard.ok) return guard;

  // Solo dopo la verifica si eseguono import, merge e mutazioni.
  return applyConsolidation(input);
}
```

La posizione del guard deve precedere la prima mutazione o chiamata con effetto
osservabile.

### 8.4 Confini applicativi obbligatori

`workspace.configure` non è protetta lasciando che `InstitutionConfigPanel` chiami direttamente i setter Zustand. Il piano dovrà introdurre comandi applicativi come `configureWorkspace(context, identity)` e `resetWorkspaceConfiguration(context)`, che verificano la capability e chiamano i setter soltanto dopo il guard. La logica di permesso resta fuori da Zustand e il servizio non legge direttamente `useCurriculumStore`.

Per `document.export`, `document.preview` resta una generazione/consultazione pura. Stampa, download JSON legacy, eventuali export reali e futuri Word/PDF sono effetti distinti: la sequenza protetta è capability guard -> `validateExportability` -> effetto. La validazione documentale è separata dal controllo autorizzativo; nessun effetto può avvenire prima del guard.

Per l accessibilità il piano sceglierà per ogni componente una sola strategia: controllo nativamente disabled con spiegazione adiacente sempre visibile, oppure controllo focusabile con aria-disabled true e guard esplicito dell evento. Non si richiederanno contemporaneamente natività non-focusabile e focus obbligatorio.

### 8.5 Dipendenze vietate

- componenti che importano la matrice direttamente per duplicarla;
- servizi che leggono `useCurriculumStore` al posto del contesto ricevuto;
- dominio che importa hook o componenti;
- store che persiste capacità derivate;
- più resolver con mapping divergenti;
- confronto diretto di `declaredRole` nei componenti B2;
- sostituzione indiscriminata dei confronti legacy nel dashboard: si interviene solo nei componenti toccati dal segmento B2 e si registra il resto come debito tecnico.

## 9. Stati e transizioni

| Evento | Risoluzione | UI | Azione/esito |
| --- | --- | --- | --- |
| `WorkspaceIdentity` assente | `neutral`, trust `unknown` | Solo funzioni informative minime | Azioni protette negate |
| `declaredRole` assente | `neutral`, trust `unknown` | Nessun default docente | Nessuna capacità operativa |
| `declaredRole` sconosciuto | `unknown`, trust `unknown` | Messaggio esplicativo | Negazione deterministica |
| Ruolo modificato nelle impostazioni | Nuova risoluzione immediata | Aggiornamento sincrono dell'esposizione | Le azioni successive usano il nuovo ruolo |
| Pannello aperto durante il cambio | Read model aggiornato | Non chiudere automaticamente il pannello | Disabilitare o riabilitare solo le azioni interessate |
| Bozza esistente e ruolo modificato | Bozza conservata | Mostrare eventuale impossibilità di salvataggio/esecuzione | Nessuna cancellazione automatica |
| Richiamo diretto di azione | Guard nel punto di esecuzione | Eventuale messaggio non dipendente dalla UI | `CAPABILITY_NOT_GRANTED`, nessuna mutazione |
| Documento consultabile ma non modificabile | Consultazione concessa, mutazione valutata separatamente | Sezione read-only | Revision/export negati se richiesti |
| Capacità in matrice senza funzionalità | Risoluzione teoricamente possibile | Nessun controllo fittizio | Stato `DOMAIN_ONLY_NO_CURRENT_UI` |

Il reset di `WorkspaceIdentity` produce sempre il profilo restrittivo e non
modifica il profilo docente A3.

## 10. Strategia incrementale

B2 non deve applicare tutte le dodici capacità in una modifica indiscriminata.

### Segmento verticale candidato

Il primo segmento candidato comprende:

1. `workspace.configure`: salvataggio/reset del contesto tramite comando applicativo;
2. `department.consolidate`: import/merge dipartimentale locale;
3. `document.export`: export/print/download canonico con validazione, distinguendo preview e JSON legacy;
4. una negazione eseguita direttamente dal servizio;
5. aggiornamento dell'interfaccia dopo il cambio del ruolo dichiarato.

Questo segmento usa punti esistenti e consente di verificare il doppio livello
senza fingere che il workflow canonico delle proposte sia già completo. Non include
`proposal.create`, `document.review`, `institution.validate` o archiviazione.
`document.review` resta differita finché non è deciso se copre proposta curricolare,
revisione di documento canonico, transizioni di stato o archiviazione; l archiviazione
resta `DEFERRED_PENDING_CAPABILITY_DECISION` e non viene mappata a `document.review`.

### Lavoro successivo

- collegare `proposal.create` al flusso canonico revisioni;
- definire il boundary applicativo per `document.review`;
- definire il comando e il servizio per `institution.validate`;
- decidere se archiviazione richiede una capacità esistente o una nuova
  capacità B1, registrando la decisione prima di modificare B1.

## 11. Decisioni aperte per il piano d'implementazione

1. Quale dei tre punti — consolidamento, export o configurazione — sarà il
   primo test end-to-end del guard di servizio.
2. Se il primo segmento includerà una capability di sola consultazione o si
   concentrerà sulle mutazioni protette.
3. Forma definitiva del `CapabilityDenial` discriminato e del risultato union dei servizi.
4. Collocazione dell'adattatore React senza introdurre un nuovo hook globale
   non necessario.
5. Strategia per sostituire progressivamente i confronti diretti del dashboard
   senza modificare la baseline di navigazione.
6. Sequenza precisa del consolidamento CML: lettura/parsing, validazione, merge, prima mutazione e costruzione dell esito; il guard precede la prima mutazione.
7. Perimetro di `document.review`: proposta curricolare, revisione del documento canonico, transizioni di stato e archiviazione; nessuna applicazione prima della decisione.
8. Se l'area IA debba restare completamente fuori da B2 o ricevere in futuro una
   capability dedicata, senza aggiungerla ora alla matrice.

Queste decisioni devono essere chiuse nel piano d'implementazione, non lasciate
implicite nei componenti.

## 12. Strategia di prova

### A. Dominio

- matrice completa dei sei ruoli e dodici capacità;
- mapping completo da `declaredRole`;
- ruolo neutro e ruolo sconosciuto;
- negazione predefinita;
- assenza di capacità implicite o ereditarietà;
- trust sempre `self-declared` per mapping locali.

### B. Adattamento applicativo

- capacità derivate dallo stato corrente;
- aggiornamento dopo il cambio di ruolo;
- reset dell'identità con profilo restrittivo;
- nessuna persistenza delle capacità;
- nessun nuovo store.

### C. Interfaccia

- azione visibile e abilitata quando concessa;
- azione visibile ma disabilitata quando il processo va spiegato;
- azione nascosta solo quando non pertinente;
- messaggio comprensibile di indisponibilità;
- accessibilità, focus e tastiera secondo una strategia coerente per ogni controllo;
- nessun confronto diretto sui ruoli nei componenti modificati.

### D. Punto di esecuzione

- azione concessa eseguita;
- azione negata senza mutazioni;
- codice `CAPABILITY_NOT_GRANTED` verificabile;
- risoluzione discriminata completa nel diniego, inclusa la diagnostica non autoritativa del ruolo sconosciuto;
- capability richiesta e ruolo risolto presenti nel risultato;
- richiamo diretto non aggira il controllo;
- nessuna chiamata IA, export, stampa, download o scrittura di archivio prima del guard.
- nessun componente protetto chiama direttamente setter dello store;
- nessun servizio protetto legge `useCurriculumStore`;
- bozze leggibili conservate dopo perdita della capability e nessuna cancellazione al cambio ruolo;
- confronti diretti sostituiti soltanto nei componenti toccati, con controllo statico/test dedicato;
- capability differite non rappresentate come implementate;
- disponibilità neutra/pubblica di sola lettura giustificata esplicitamente dalla matrice B1.

### E. Regressione

- cambio ruolo non modifica il profilo docente;
- reset del workspace non cancella bozze;
- consultazione pubblica/neutra resta disponibile solo dove prevista;
- workflow non ancora coperti da B2 non cambiano accidentalmente;
- documenti, preview ed export canonici mantengono le validazioni esistenti.

## 13. Criteri di accettazione B2

B2 potrà essere dichiarata completa quando:

- esiste una sola matrice ruolo-capacità;
- `declaredRole` viene risolto centralmente;
- nessuna capacità è persistita;
- non esiste un nuovo store dei permessi;
- stato neutro e sconosciuto sono restrittivi;
- i componenti interessati non confrontano direttamente i ruoli;
- almeno un segmento verticale è protetto dalla UI al punto di esecuzione;
- nessun componente protetto chiama direttamente setter dello store;
- nessun servizio protetto legge `useCurriculumStore`;
- la negazione contiene la risoluzione discriminata completa;
- export, stampa, download e consolidamento non producono effetti prima del guard;
- il cambio ruolo non cancella bozze e la perdita di capability mantiene la consultazione prevista;
- le capability differite e l archiviazione non sono rappresentate come implementate;
- la disponibilità neutra/pubblica di sola lettura è giustificata esplicitamente dalla matrice B1;
- la negazione è tipizzata e priva di effetti collaterali;
- il cambio ruolo aggiorna immediatamente l'esposizione;
- ogni capacità applicata è tracciata a un caso d'uso reale;
- le capacità senza punto applicativo sono marcate come non complete;
- nessuna parte del sistema presenta il ruolo come verificato;
- TypeScript, test focalizzati, `test:fast`, build e `git diff --check` sono
  verdi.

## 14. Fuori perimetro

Restano esclusi:

- autenticazione e identità verificata;
- account e utenti multipli;
- gestione sessioni come sicurezza;
- protezione da manomissioni locali;
- backend e sincronizzazione;
- ruoli assegnati da amministratori;
- gruppi, membership e gerarchie complesse;
- ruoli multipli simultanei;
- deleghe temporanee;
- audit remoto;
- firma digitale;
- validità amministrativa delle decisioni;
- modifica strutturale dei workflow;
- nuovo store o persistenza delle capacità;
- refactoring generale dell'interfaccia;
- modifica o risoluzione del difetto Graphify `CML-INFRA-GRAPHIFY-01`.

## 15. Sequenza del percorso

```text
CML-635A   Workspace and Teacher Configuration        COMPLETE
CML-635B1  Roles and Capabilities Design              COMPLETE
CML-635B2  Permission Enforcement and UI Exposure     APPROVED
CML-635B3  Role-aware Workflow Validation             DA VALUTARE
CML-635C   Shared Institutional Repository            BLOCCATO
```
