# CML-635A3 — Unified Workspace and Teacher Profile Configuration

## Obiettivo

Il docente può configurare e modificare dallo stesso punto sia il contesto dell’ambiente sia il proprio profilo operativo, senza rientrare nell’onboarding e senza creare una seconda fonte dei dati.

## Confini dei dati

### Contesto dell’ambiente

Proprietario: `WorkspaceIdentity` nel `useCurriculumStore`.

- istituto;
- sede;
- anno scolastico;
- modalità operativa;
- ruolo dichiarato.

Il ruolo è descrittivo e non produce autorizzazioni.

### Profilo docente

Interfaccia applicativa canonica: `useOnboardingProfile`. Le chiavi locali sono un dettaglio della persistenza esistente e non devono essere lette o scritte direttamente dai componenti UI.

| Dato | Fonte applicativa | Persistenza esistente |
| --- | --- | --- |
| Ordine scolastico | `useCurriculumStore.order` e `setOrder` | stato Zustand persistito |
| Disciplina | `useCurriculumStore.discipline` e `setDiscipline` | stato Zustand persistito |
| Docente comune/sostegno | `useOnboardingProfile` | `curman_isSostegno` |
| Classi assegnate | `useOnboardingProfile` | `curman_assignedClasses` |
| Sezioni | `useOnboardingProfile` | `curman_availableSections` |
| Combinazioni classe/sezione | `useOnboardingProfile` | `curman_assignedCombinations` |

Le letture e scritture dirette già presenti in `SessionModals` devono essere ricondotte agli handler del hook. `useAppWorkflowState` mantiene invece le preferenze di navigazione corrente (`curman_targetClass` e `curman_targetSection`), che non fanno parte del profilo docente.

Classi, sezioni e assegnazioni non entrano in `WorkspaceIdentity`.

## Esperienza utente

Le impostazioni locali diventano l’area unica di configurazione con due sezioni esplicite:

1. **Contesto dell’ambiente** — stato neutro o configurato, riferimenti istituzionali, modalità, ruolo dichiarato, salvataggio e reset indipendenti.
2. **Profilo docente** — ordine, disciplina, sostegno, classi e sezioni, con gli stessi controlli e le stesse persistenze dell’onboarding.

L’onboarding resta il primo accesso guidato e progressivo a questa configurazione. Non conserva un modello alternativo: usa gli stessi valori, handler e persistenze dell’area impostazioni. Le impostazioni devono poter essere riaperte successivamente.

Il reset del contesto non modifica il profilo docente; il reset del profilo non modifica `WorkspaceIdentity`.

## Stati espliciti

### Contesto dell’ambiente

- **neutro**: nessuna `WorkspaceIdentity` presente;
- **bozza incompleta**: campi temporanei compilati, ma riferimenti o modalità insufficienti per creare un’identità valida; la bozza non modifica lo store;
- **configurato**: tutti i riferimenti obbligatori sono validi e il salvataggio ha prodotto una `WorkspaceIdentity`;
- **persistito invalido**: il livello A2 lo riconduce a stato neutro durante la hydration.

Per il contesto sono obbligatori modalità operativa, istituto e anno scolastico. Sede, attore e ruolo dichiarato restano opzionali, con validazione coerente con A1.

### Profilo docente

- **non configurato**: nessuna preferenza personale significativa presente;
- **parzialmente configurato**: almeno ordine, disciplina o sostegno sono presenti, ma mancano classi/sezioni operative;
- **operativo**: ordine e disciplina sono validi e il profilo può essere usato dai flussi applicativi; classi e sezioni restano configurabili secondo il grado.

## Salvataggio e bozze

Le due sezioni hanno salvataggio e reset indipendenti.

- Il contesto mantiene una bozza locale transitoria e aggiorna `WorkspaceIdentity` solo con il pulsante esplicito di salvataggio.
- Una chiusura o annullamento del pannello scarta la bozza del contesto non salvata.
- Il profilo docente conserva la semantica di persistenza già adottata dall’onboarding, ma passa dagli stessi handler sia nell’onboarding sia nelle impostazioni.
- Nessun salvataggio del contesto avviene modificando il profilo e viceversa.

## Implementazione prevista

- Estendere il pannello impostazioni già esistente, senza nuova route o nuovo store.
- Riutilizzare gli handler di `useOnboardingProfile` per il profilo docente e renderli disponibili alla sezione impostazioni.
- Mantenere le chiavi locali esistenti durante la migrazione, evitando spostamenti dei dati.
- Usare `setWorkspaceIdentity` e `resetWorkspaceIdentity` per il contesto.
- Validare il contesto con i costruttori e validatori A1 prima del salvataggio.
- Mostrare esplicitamente configurazioni incomplete, senza introdurre valori impliciti incoerenti.

## Compatibilità e migrazione

La prima apertura delle impostazioni deve leggere senza migrazione distruttiva:

- un onboarding già completato;
- un profilo parziale;
- un’installazione senza profilo;
- valori locali non riconosciuti;
- combinazioni classe/sezione già presenti.

Non vengono introdotte nuove chiavi persistenti. Un valore non riconosciuto viene ignorato o riportato allo stato neutro del relativo campo, senza cancellare dati validi delle altre sezioni.

## Fuori perimetro

- autenticazione, autorizzazioni e ruoli effettivi;
- profili multipli e sincronizzazione remota;
- archivio istituzionale condiviso;
- nuovo store o nuove chiavi di persistenza;
- migrazione strutturale del profilo docente;
- assegnazioni ufficiali, consigli di classe o dipartimenti;
- modifica del dominio `WorkspaceIdentity`;
- variazioni ai documenti canonici o all’amministrazione IA.

## Verifica

- valori già presenti nell’onboarding visibili nelle impostazioni;
- modifica dalle impostazioni riflessa nei flussi applicativi;
- riapertura dell’onboarding con gli stessi valori;
- persistenza dopo ricaricamento;
- reset indipendente di contesto e profilo;
- nessuna autorizzazione derivata dal ruolo;
- nessun accesso diretto aggiuntivo alle chiavi locali dai componenti UI;
- onboarding e impostazioni leggono e salvano dalla stessa interfaccia applicativa;
- nessuna nuova chiave persistente o copia parallela;
- una bozza non salvata del contesto non modifica lo store;
- stati neutro, incompleto e configurato sono distinguibili;
- profili preesistenti vengono mostrati senza migrazione distruttiva;
- valori locali non riconosciuti non producono default impliciti incoerenti;
- TypeScript, test focalizzati, `test:fast`, build e `git diff --check` verdi.