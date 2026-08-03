# CML-635A3 — Unified Workspace and Teacher Profile Configuration

## Obiettivo

Il docente può configurare e modificare dallo stesso punto sia il contesto dell’ambiente sia il proprio profilo operativo, senza dover rientrare nell’onboarding e senza creare una seconda fonte dei dati.

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

Proprietario: infrastruttura personale già esistente, mantenuta compatibile con le chiavi locali correnti.

- ordine scolastico;
- disciplina;
- docente comune o di sostegno;
- classi assegnate;
- sezioni;
- combinazioni classe/sezione.

Classi, sezioni e assegnazioni non entrano in `WorkspaceIdentity`.

## Esperienza utente

Le impostazioni locali diventano l’area unica di configurazione con due sezioni esplicite:

1. **Contesto dell’ambiente** — stato neutro o configurato, riferimenti istituzionali, modalità, ruolo dichiarato, salvataggio e reset indipendenti.
2. **Profilo docente** — ordine, disciplina, sostegno, classi e sezioni, con gli stessi controlli e le stesse persistenze dell’onboarding.

L’onboarding resta il primo accesso guidato e progressivo a questa configurazione. Non conserva un modello alternativo: usa gli stessi valori, handler e persistenze dell’area impostazioni. Le impostazioni devono poter essere riaperte successivamente.

Il reset del contesto non modifica il profilo docente; il reset del profilo non modifica `WorkspaceIdentity`.

## Implementazione prevista

- Estendere il pannello impostazioni già esistente, senza nuova route o nuovo store.
- Riutilizzare gli handler di `useOnboardingProfile` per il profilo docente e renderli disponibili alla sezione impostazioni.
- Mantenere le chiavi locali esistenti durante la migrazione, evitando spostamenti dei dati.
- Usare `setWorkspaceIdentity` e `resetWorkspaceIdentity` per il contesto.
- Validare il contesto con i costruttori e validatori A1 prima del salvataggio.
- Mostrare esplicitamente configurazioni incomplete, senza introdurre valori impliciti incoerenti.

## Verifica

- valori già presenti nell’onboarding visibili nelle impostazioni;
- modifica dalle impostazioni riflessa nei flussi applicativi;
- riapertura dell’onboarding con gli stessi valori;
- persistenza dopo ricaricamento;
- reset indipendente di contesto e profilo;
- nessuna autorizzazione derivata dal ruolo;
- TypeScript, test focalizzati, `test:fast`, build e `git diff --check` verdi.
