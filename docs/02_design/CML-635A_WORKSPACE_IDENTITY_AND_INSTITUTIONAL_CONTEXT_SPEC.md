# CML-635A — Workspace Identity and Institutional Context

## Stato e obiettivo

Stato: `DESIGN_PROPOSED_FOR_IMPLEMENTATION`

Frase di valore: **Il docente potrà configurare una volta il proprio contesto
di lavoro locale e creare documenti che conservano l’identità istituzionale
corretta senza doverla ricostruire ogni volta.**

CML-635A completa il passaggio da un profilo istituzionale già presente nel
dominio a un contesto operativo coerente per il workspace. La fase è locale,
first-party e senza autenticazione, autorizzazione remota, backend,
sincronizzazione o amministrazione utenti.

## 1. Ricognizione del repository

### Stato Git iniziale

| Voce | Risultato |
|---|---|
| Branch | `feat/cml-636b-canonical-document-preview-export` |
| HEAD | `1b20901d30f66388a912ddd3128525ac13849d82` |
| Allineamento remoto | HEAD coincide con `origin/feat/cml-636b-canonical-document-preview-export` |
| `main` | Non modificato |
| Modifiche preesistenti | `CLAUDE.md`, `kilo.jsonc`, `.claude/`, report CML-631F, sessioni e documenti CML-634B-C1; esclusi dal lavoro |
| Diff check iniziale | PASS |
| Modifiche applicative iniziali | Nessuna inattesa |

### Mappa rilevante

| Area | File principali | Responsabilità | Stato |
|---|---|---|---|
| Identità canonica | `src/domain/curriculum/identity/types.ts`, `constructors.ts`, `validators.ts`, `serialization.ts` | `EntityId`, `EntityReference`, `ActorReference`, `EntityMetadata`, origini e migrazione | **REUSE** |
| Attore dichiarato | `src/domain/curriculum/identity/constructors.ts` (`createSelfDeclaredActor`), `src/domain/institution/types.ts` (`DeclaredActorReference`) | Dichiara persona e ruolo senza autenticare né concedere permessi | **REUSE**, adattare solo gli accessori |
| Istituto | `src/domain/institution/types.ts`, `constructors.ts`, `repository.ts` | `Institute`, stato locale, codice, ordini, profilo documentale | **REUSE** |
| Sede | `InstituteSite` in `src/domain/institution/types.ts` e repository | Sede/plesso appartenente all’istituto | **REUSE** |
| Anno scolastico | `AcademicYear` e `academicYear.ts` | Entità canonica con label, date, stato e proprietario | **REUSE**, uniformare riferimenti |
| Contesto istituzionale | `InstitutionalContext`, `InstitutionalArchive`, selectors | Riferimenti attivi a istituto, anno, sede e attore | **ADAPT** come sorgente del workspace |
| Snapshot documentale | `src/domain/documents/types.ts`, `constructors.ts`, repository e rendering | Snapshot immutabile per ogni `DocumentVersion` | **ADAPT** con riferimenti canonici opzionali |
| Persistenza | `useCurriculumStore` Zustand persist, backup/emergency backup, serializzazione istituzionale | Archive incluso nello stato locale e nei backup | **REUSE**, estendere lo schema in modo compatibile |
| Interfaccia | `src/features/session/components/InstitutionConfigPanel.tsx`, Settings e workspace | Configura istituto, sede principale, anno, attore e profilo documento | **ADAPT**, senza nuova area di navigazione |
| IA | `src/domain/ai/`, `src/features/ai/` | Provider locale Ollama, preview, consenso, nessun contesto automatico | **REFERENCE_ONLY** per CML-635A; integrazione governance in 635D |

Directory non presenti nella forma attesa: `src/features/institution/`,
`src/persistence/` e `src/store/` come layer autonomi. Gli equivalenti reali
sono la feature session, `useCurriculumStore`, il dominio institution e i
backup locali.

## 2. Inventario dei concetti esistenti

| Concetto | Tipo reale | File | Uso | Persistito | Criticità |
|---|---|---|---|---:|---|
| `EntityId` | branded string | `domain/curriculum/identity/types.ts` | Identità stabile | Sì | Non crearne uno parallelo |
| `EntityReference` | `{ id, entityType, snapshotLabel? }` | identity types | Riferimenti canonici con etichetta visuale | Sì | Label non è chiave |
| `ActorReference` | interfaccia con `displayName`, `role`, `assertion` | identity types | Autore/attore dichiarato | Nei documenti e contesti | Non è account |
| `createSelfDeclaredActor` | costruttore | identity constructors | Crea dichiarazione locale | Indirettamente | Ruolo solo descrittivo |
| `InstitutionalArchive` | aggregato con collezioni | institution types/constructors | Archivio canonico locale | Sì, Zustand e backup | Attuale autorità operativa implicita |
| `activeInstituteRef` | `InstituteReference?` | archive | Istituto attivo | Sì | Da coordinare con identity esplicita |
| `currentContextRef` | `InstitutionalContextReference?` | archive | Contesto corrente | Sì | Da usare come compatibilità |
| `InstitutionalContext` | entità con refs | institution types | Composizione istituto/anno/sede/attore | Sì | Non contiene permessi |
| `Institute` | entità canonica | institution types | Identità della scuola | Sì | `confirmed-local` non significa verificata |
| `InstituteSite` | entità canonica | institution types | Sede/plesso | Sì | Validazione owner già presente |
| `AcademicYear` | entità canonica | institution types | Anno operativo | Sì | Label `YYYY/YYYY` e date coerenti |
| `InstitutionalSnapshot` | struttura piatta | document types | Contesto storico nella versione | Sì | Mancano refs canonici e attore completo |
| `CanonicalMetadata` / `EntityMetadata` | metadata condivisi | identity types | Provenienza, timestamp, schema, autore | Sì | Riutilizzare `EntityMetadata` |
| `Workspace` | termine storico/stato UI | workspace hooks/store | Sync cloud, token e backup | Sì separatamente | Ambiguo rispetto all’identità locale |
| `WorkspaceIdentity` | **non esiste** | — | Aggregato operativo richiesto | — | **MISSING** |
| `InstitutionArchive` | nome non presente; esiste `InstitutionalArchive` | — | — | — | Usare nome reale |
| `InstitutionalContext` | esiste | institution types | Projection usata da selectors/export | Sì | Deve diventare risolvibile in modo unico |
| Provider IA configuration | `AiProviderConfiguration` | ai types | Provider locale/remoto e capability | Runtime | Non deve ricevere contesto automaticamente |

## 3. Classificazione delle strutture

| Struttura | Classificazione | Motivazione | Azione proposta |
|---|---|---|---|
| `EntityId` | `REUSE` | Identità canonica già verificata | Usarlo per workspace e ogni nuova entità |
| `EntityReference` | `REUSE` | Modello già adatto a refs e label | Aggiungere solo eventuali `EntityType` mancanti |
| `ActorReference` / `createSelfDeclaredActor` | `REUSE` | Distingue dichiarazione da autenticazione | Riutilizzare per `declaredActor` |
| `InstitutionalArchive` | `ADAPT` | È già archivio canonico e persistito | Ospitare l’identità operativa senza nuovo store |
| `activeInstituteRef` | `ADAPT` | Serve compatibilità con dati esistenti | Leggerlo come fallback e aggiornarlo nel bridge |
| `currentContextRef` | `ADAPT` | Conserva contesto già esistente | Coordinare con `WorkspaceIdentity.contextRef` |
| `Institute` | `REUSE` | Identità istituto già modellata | Nessun duplicato |
| `InstituteSite` | `REUSE` | Sede con owner e stato già validati | Nessun catalogo parallelo |
| `AcademicYear` | `REUSE` | Anno canonico già presente | Usare `AcademicYearReference` |
| `InstitutionalContext` | `REUSE` + `ADAPT` | Composizione già persistita | Diventa record storico/risolto dal workspace |
| `InstitutionalSnapshot` | `ADAPT` | Già obbligatorio in `DocumentVersion` | Aggiungere refs/attore opzionali backward-compatible |
| `DocumentEntity.instituteRef` e `academicYearRef` | `REUSE` | Refs già esistenti | Popolarli dal contesto al momento della creazione |
| `useCurriculumStore` | `REUSE` + `ADAPT` | È la persistenza locale vigente | Estendere lo stato, senza nuovo store |
| `useWorkspaceStore` | `REFERENCE_ONLY` | Contiene token/account/sync cloud | Non usarlo come autorità istituzionale |
| Google Drive sync | `OUT_OF_SCOPE` | CML-635C e autenticazione/sync | Non modificarlo in 635A |
| `AiProviderConfiguration` | `REFERENCE_ONLY` | CML-634B già chiusa | Nessun context injection; 635D futura |
| `WorkspaceIdentity` | `MISSING` | Serve aggregato operativo esplicito | Introdurlo nel dominio institution e persistilo nell’archive |
| Permission role | `OUT_OF_SCOPE` | È CML-635B | Non modellarlo in 635A |

## 4. Distinzioni semantiche

- **Workspace:** ambiente locale operativo che contiene una identità di lavoro,
  preferenze e riferimenti; non è un account e non è un repository remoto.
- **Institution:** identità dell’istituto scolastico (`Institute`).
- **Site:** sede o plesso (`InstituteSite`) appartenente a un istituto.
- **Academic year:** anno scolastico operativo (`AcademicYear`), con calendario
  e stato.
- **Actor:** persona che dichiara di operare (`ActorReference`).
- **Declared role:** ruolo scritto dall’attore; non abilita capacità.
- **Permission role:** ruolo autorizzativo, assente in 635A e rinviato a 635B.
- **Institutional snapshot:** copia immutabile del contesto usato da una
  versione documentale.
- **Current institutional context:** riferimenti attivi risolvibili nell’archive
  e modificabili per le operazioni future.

Non sono sinonimi: il workspace può essere personale e non configurato; un
istituto può esistere senza essere attivo; un attore può mancare; una versione
storica resta leggibile anche se l’istituto corrente cambia.

## 5. Sorgente autorevole: valutazione dei modelli

### Modello A — contesto derivato direttamente dall’archive

Semplice e vicino al codice attuale, ma lascia implicito il concetto di
workspace e rende più difficile distinguere dati canonici, riferimenti attivi e
storia operativa.

### Modello B — `WorkspaceIdentity` separata che referenzia l’archive

Semantica chiara, ma un secondo store o un secondo documento persistito rischia
di duplicare `activeInstituteRef`, anno e contesto. È contrario al principio di
una sola autorità locale.

### Modello C — aggregato ibrido con refs canonici e snapshot operativo

`WorkspaceIdentity` è un record operativo persistito dentro l’attuale
`InstitutionalArchive`; contiene solo riferimenti canonici, modalità e actor
dichiarato. Le entità complete restano nelle collezioni dell’archive. Lo
snapshot operativo per documenti/versioni viene copiato in modo immutabile.

| Criterio | A | B | C |
|---|---:|---:|---:|
| Coerenza con CML-633B | 4 | 5 | 5 |
| Compatibilità documenti | 4 | 4 | 5 |
| Persistenza | 5 | 2 | 5 |
| Migrazione | 5 | 2 | 4 |
| Evoluzione CML-635B | 3 | 5 | 5 |
| Evoluzione CML-635C | 3 | 5 | 5 |
| Rischio duplicazione | 5 | 1 | 4 |
| Complessità | 5 | 2 | 4 |

### Decisione raccomandata

Adottare **Modello C**. La sorgente autorevole è l’`InstitutionalArchive`
attraverso il singolo record `workspaceIdentity`; l’archive resta proprietario
delle entità `Institute`, `InstituteSite`, `AcademicYear` e dei contesti storici.
`activeInstituteRef` e `currentContextRef` diventano campi di compatibilità
gestiti dallo stesso repository, non una seconda autorità.

## 6. Modello dati minimo proposto

Il modello usa i tipi reali del repository:

```ts
type WorkspaceOperatingMode =
  | 'public-consultation'
  | 'personal-local'
  | 'institutional-local';

interface WorkspaceIdentity {
  id: EntityId;
  metadata: EntityMetadata;
  institutionRef?: InstituteReference;
  activeSiteRef?: InstituteSiteReference;
  academicYearRef?: AcademicYearReference;
  declaredActor?: DeclaredActorReference;
  contextRef?: InstitutionalContextReference;
  operatingMode: WorkspaceOperatingMode;
  status: 'unconfigured' | 'incomplete' | 'ready-local';
}

interface InstitutionalArchive {
  schemaVersion: number;
  updatedAt: string;
  workspaceIdentity?: WorkspaceIdentity;
  institutes: Institute[];
  academicYears: AcademicYear[];
  sites: InstituteSite[];
  contexts: InstitutionalContext[];
  activeInstituteRef?: InstituteReference;       // compatibilità
  currentContextRef?: InstitutionalContextReference; // compatibilità
}
```

`institutionRef` è opzionale in modalità pubblica/personale; è obbligatorio
per `institutional-local`. `activeSiteRef` e `academicYearRef` sono opzionali
solo finché lo stato è `incomplete`; in `ready-local` devono risolvere entità
appartenenti all’istituto. `declaredActor` è sempre opzionale.

`WorkspaceIdentity.metadata` usa `EntityMetadata` con origine `teacher` per
configurazione locale, `imported`/`legacy` per dati adattati e timestamp
deterministici nei test. Non si crea una nuova identificazione.

## 7. Invarianti

1. Un workspace ha al massimo un istituto attivo.
2. Una sede attiva appartiene all’istituto attivo.
3. L’anno attivo appartiene all’istituto attivo ed è in stato valido.
4. L’attore dichiarato può essere assente.
5. Il ruolo dichiarato non concede permessi.
6. Il cambio di contesto non modifica documenti o versioni esistenti.
7. Ogni nuova `DocumentVersion` riceve uno snapshot del contesto risolto.
8. Un documento storico non dipende dal contesto corrente per essere letto o
   esportato.
9. CML-634B non riceve automaticamente l’intero workspace context.
10. Nessun dato va all’esterno senza selezione e consenso espliciti.
11. Il workspace funziona senza autenticazione.
12. Archive e workspace identity sono esportabili/importabili nel backup locale
   già esistente.
13. Non possono esistere riferimenti cross-institute per sede, anno o contesto.
14. Un istituto `confirmed-local` non è autenticato né ufficialmente verificato.
15. Un archive non valido viene rifiutato senza mutare lo stato corrente.
16. Il resolver restituisce identità neutra quando il contesto non è completo.

## 8. Persistenza e migrazione

La persistenza attuale è `useCurriculumStore` con middleware Zustand persist,
chiave `curmanlight-react-db-state-v1.4.0`; `institutionalArchive` è incluso
nello stato, nei backup di emergenza e nell’esportazione JSON. Non esiste un
object store IndexedDB dedicato all’istituto; la suite conferma che lo schema
IndexedDB documentale resta separato e non deve essere duplicato.

| Dato | Persistenza attuale | Persistenza proposta | Migrazione |
|---|---|---|---|
| Istituti | `institutionalArchive.institutes` | invariata | `NO_MIGRATION` |
| Sedi | `institutionalArchive.sites` | invariata | `NO_MIGRATION` |
| Anni | `institutionalArchive.academicYears` | invariata | `NO_MIGRATION` |
| Contesti | `institutionalArchive.contexts` | invariata, referenziata dal workspace | `NO_MIGRATION` |
| Istituto attivo | `activeInstituteRef` | `workspaceIdentity.institutionRef` + bridge | `READ_COMPATIBILITY`, poi `DEPRECATED_FIELD` |
| Contesto corrente | `currentContextRef` | `workspaceIdentity.contextRef` + bridge | `READ_COMPATIBILITY`, poi `DEPRECATED_FIELD` |
| Workspace identity | assente | stesso archive, nuovo campo opzionale | `LAZY_MIGRATION` |
| Profilo legacy | legacy adapters | draft inattivo con warning | `EXPLICIT_MIGRATION` solo su conferma |
| Stato personale `schoolYear` | `useCurriculumStore.schoolYear` | mantenuto come preferenza/legacy read | `DEPRECATED_FIELD`, non identità istituzionale |

Il repository deve scrivere i riferimenti legacy e il nuovo aggregato nella
stessa operazione durante la transizione; il resolver legge prima
`workspaceIdentity`, poi ricostruisce un’identità compatibile dai riferimenti
esistenti. Nessuna trasformazione irreversibile è necessaria.

## 9. Snapshot documentale

La struttura attuale è già corretta nel principio:

```text
WorkspaceIdentity corrente
        ↓ resolver
InstitutionalContext + Institute/Site/AcademicYear
        ↓ snapshot builder
DocumentEntity refs + DocumentVersion InstitutionalSnapshot
```

Il tipo attuale `InstitutionalSnapshot` contiene nome istituto, codice, sede,
anno, ruolo e `configured`. Va adattato con campi opzionali:

```ts
interface InstitutionalSnapshot {
  instituteName: string;
  configured: boolean;
  mechanicalCode?: string;
  siteName?: string;
  academicYearLabel?: string;
  declaredRole?: string;
  instituteRef?: InstituteReference;
  siteRef?: InstituteSiteReference;
  academicYearRef?: AcademicYearReference;
  declaredActor?: DeclaredActorReference;
  workspaceIdentityRef?: EntityReference;
}
```

Le etichette già esportate restano per compatibilità e leggibilità. I refs
consentono tracciabilità senza rendere lo snapshot dipendente dal resolver.

Snapshot creation policy:

| Evento | Regola |
|---|---|
| Creazione documento | Snapshot del contesto attivo risolto in quel momento |
| Nuova versione | Nuovo snapshot del contesto attivo; mai rilettura retroattiva |
| Recupero autore | Crea versione esplicita con actor e snapshot corrente |
| Duplicazione | Copia il contenuto, ma crea una nuova versione con snapshot esplicito; default consigliato: contesto corrente dichiarato nella UI |
| Importazione | Conserva snapshot presente; se assente usa neutro con warning |
| Migrazione | Conserva campi disponibili e marca `migration`/warning |
| Riapertura | Legge lo snapshot della versione, non il contesto corrente |

La funzione di produzione documentale deve ricevere un `InstitutionalDocumentRead`
risolto dal workspace, mentre il repository documenti resta indipendente dal
store.

## 10. Interfaccia utente minima

Non si crea una dashboard. Si estende l’attuale `InstitutionConfigPanel` o il
punto di configurazione sessione con un pannello semantico:

```text
Workspace Context Panel
├── Stato del contesto
├── Istituto
├── Sede
├── Anno scolastico
├── Attore dichiarato (facoltativo)
├── Ruolo dichiarato (descrittivo, facoltativo)
├── Modalità operativa
└── Azioni: salva, attiva per nuove operazioni, esporta/importa locale
```

Flusso:

1. Il docente vede “Nessun contesto istituzionale attivo” in modalità personale
   o pubblica.
2. Inserisce/seleziona istituto, sede e anno; il sistema mostra la completezza.
3. Può dichiarare nome e ruolo, senza obbligo.
4. Salva una bozza locale.
5. Conferma esplicitamente “Attiva per le nuove operazioni”.
6. Il sistema chiarisce che documenti esistenti non cambiano.
7. Le nuove progettazioni/documenti ricevono il nuovo snapshot.

Errori: sede non appartenente all’istituto, anno incoerente, riferimenti
archiviati, campi incompleti e import incompatibile devono essere mostrati in
linguaggio docente, collegati al campo e senza reset silenzioso.

## 11. Modalità operative

Adottare la terminologia:

- `public-consultation`: consultazione neutra, nessun istituto o attore
  presunto;
- `personal-local`: lavoro personale locale, istituto opzionale;
- `institutional-local`: contesto istituzionale configurato localmente, senza
  autenticazione o autorizzazione.

La modalità descrive il contesto operativo, non un permesso. `institutional-local`
non significa istituto verificato e non abilita CML-635B.

## 12. Compatibilità CML-634B

CML-634B resta isolata. `AiRequest.context` è opzionale e non deve essere
riempito automaticamente con `WorkspaceIdentity`, `InstitutionalContext`,
attore o ruolo. Se il docente seleziona testo esplicito nella preview, solo quel
testo può essere inviato al provider locale con consenso già richiesto.

Il provider remoto resta disabilitato. Eventuali policy su identità, provider,
modelli, endpoint e credenziali appartengono a CML-635D.

## 13. Confini di fase

| Fase | Include | Esclude |
|---|---|---|
| CML-635A | workspace identity, istituto, sede, anno, actor dichiarato, ruolo descrittivo, contesto attivo, snapshot, persistenza locale, import/export locale | permessi, account, backend, sync, policy IA |
| CML-635B | ruoli autorizzativi, permessi, capacità, accesso, deleghe, approvazioni | definizione dell’identità locale di base |
| CML-635C | repository condiviso, sincronizzazione, conflitti, replica, remoto | identità personale non governata |
| CML-635D | provider amministrati, policy istituzionali, modelli/endpoints autorizzati, credenziali e governance | esecuzione remota in 635A |

## 14. Compatibilità e casi d’uso

| # | Caso d’uso | Precondizioni | Risultato e snapshot | Test richiesti |
|---:|---|---|---|---|
| 1 | Primo workspace | Archive vuoto | Identity `personal-local`, nessun istituto | costruttore neutro |
| 2 | Configurare istituto | Nome e ordine validi | Draft locale, nessun documento cambiato | repository + UI |
| 3 | Aggiungere/selezionare sede | Sede owner valida | `activeSiteRef` coerente | cross-owner validator |
| 4 | Impostare anno | Label/date coerenti | `academicYearRef` attivo | year validation |
| 5 | Dichiarare attore | Nome/ruolo opzionali | Actor self-declared | actor tests |
| 6 | Modificare ruolo | Actor esistente | Solo nuove operazioni/versioni | snapshot regression |
| 7 | Cambiare sede | Sede stessa istituzione | Nuovo contesto, storia intatta | no retroactive rewrite |
| 8 | Cambiare anno | Anno stesso istituto | Nuovo contesto, documenti storici intatti | version integration |
| 9 | Creare documento | Context ready o neutro | Version snapshot creato | document repository |
| 10 | Nuova versione dopo cambio | Documento esistente | Snapshot nuovo, previous immutable | versioning |
| 11 | Riaprire storico | Versione disponibile | Visualizza snapshot originale | rendering |
| 12 | Import senza identity | Backup legacy | Identity lazy/neutral, warning | migration |
| 13 | Contesto incompleto | Refs mancanti | Operazioni personali consentite, warning export | UI empty state |
| 14 | Rimuovere attore | Context attivo | Actor assente per future ops | invariant |
| 15 | Consultazione pubblica | Nessun config | Nessuna identità presunta | neutral state |
| 16 | IA senza context automatico | Provider locale disponibile | Solo prompt selezionato | AI boundary regression |
| 17 | Ripristino dopo riavvio | Persisted archive | Identity e refs ricostruiti | persistence |
| 18 | Export/import locale | Archive valido | Round-trip con fingerprint | serialization |

## 15. Requisiti funzionali e non funzionali

| ID | Requisito | Priorità | Fonte | Componente | Test |
|---|---|---:|---|---|---|
| CML-635A-FR-001 | Creare identity neutra senza istituto presunto | P0 | protocollo | domain | unit |
| CML-635A-FR-002 | Configurare un istituto usando `Institute` esistente | P0 | CML-633D | repository/UI | domain + UI |
| CML-635A-FR-003 | Selezionare solo sede/anno appartenenti all’istituto | P0 | invarianti | resolver | unit |
| CML-635A-FR-004 | Attivare esplicitamente il contesto per nuove operazioni | P0 | UX | UI/store | UI |
| CML-635A-FR-005 | Creare snapshot per ogni nuova versione | P0 | document model | documents | integration |
| CML-635A-FR-006 | Leggere documenti storici senza contesto corrente | P0 | immutability | documents | regression |
| CML-635A-FR-007 | Persistire/ripristinare identity nell’archive | P0 | local-first | store/backup | persistence |
| CML-635A-FR-008 | Importare legacy senza inventare identità | P0 | migration policy | adapters | migration |
| CML-635A-FR-009 | Operare in tre modalità dichiarate | P1 | operating mode | resolver/UI | unit + UI |
| CML-635A-FR-010 | Mostrare contesto incompleto e warning comprensibili | P1 | teacher UX | UI | accessibility/UI |
| CML-635A-FR-011 | Esportare/importare il contesto localmente | P1 | existing backup | serialization | round-trip |
| CML-635A-FR-012 | Non iniettare il context nel provider IA | P0 | CML-634B | AI boundary | regression |
| CML-635A-NFR-001 | Local-first, nessun backend o autenticazione | P0 | scope | architecture | static/behavior |
| CML-635A-NFR-002 | Nessuna telemetria o invio automatico | P0 | scope | all | boundary tests |
| CML-635A-NFR-003 | Determinismo e immutabilità | P0 | CML-633 | domain/docs | injected timestamps |
| CML-635A-NFR-004 | Accessibilità dei campi e messaggi | P1 | protocollo | UI | UI accessibility |
| CML-635A-NFR-005 | Test compatibili con CML-639 | P1 | CML-639 | test config | related/fast |
| CML-635A-INV-001 | Un solo istituto attivo | P0 | invarianti | validator | unit |
| CML-635A-INV-002 | Owner coerente per sede, anno, context | P0 | invarianti | validator | unit |
| CML-635A-INV-003 | Snapshot non retroattivo | P0 | document model | repository | integration |
| CML-635A-INV-004 | Declared role non autorizzativo | P0 | boundary | domain | unit |
| CML-635A-MIG-001 | Vecchi archive restano leggibili | P0 | compatibility | serialization | migration |
| CML-635A-MIG-002 | Vecchi refs diventano fallback, non doppia autorità | P0 | authority | resolver | regression |
| CML-635A-MIG-003 | Snapshot piatti esistenti restano validi | P0 | documents | document validators | compatibility |

## 16. Strategia di test

- **T0:** TypeScript, validator totali, invarianti e fingerprint.
- **T1:** `npm run test:related -- <file modificato>` per ogni sottofase.
- **T2:** nuovi test dominio per identity/resolver e regressioni dei test
  `institution-domain.test.ts`.
- **T3:** suite di area institution/session e backup.
- **UI:** pannello, attivazione esplicita, errori, keyboard/focus e neutral
  mode.
- **Persistence:** Zustand rehydration, emergency backup, JSON round-trip,
  schema precedente/futuro e rollback import.
- **Document/browser:** happy path creazione → cambio contesto → nuova versione
  → riapertura; separato dalla suite rapida UI.

Non aggiungere browser test alla suite `test:fast`; usare i comandi CML-639 già
definiti per ambito.

## 17. Rischi e mitigazioni

| Rischio | Mitigazione |
|---|---|
| Doppia autorità tra refs legacy e identity | Un repository aggiorna entrambe; resolver prioritario unico e testato |
| Confusione tra `useWorkspaceStore` cloud e workspace locale | Nome/contratto esplicito; 635A non usa token/account |
| Snapshot incompleto | Builder unico e test di completezza; fallback neutro dichiarato |
| Cambio contesto riscrive documenti | Versioni immutabili e test regression |
| Ruolo percepito come permesso | Etichette “ruolo dichiarato”; nessuna capability in tipo |
| Migrazione legacy fabbrica istituti | Draft inattivo, warning e conferma umana |
| IA riceve dati oltre il selezionato | Boundary test e nessun adapter che legga store |

## 18. Decisioni aperte reali

| Decisione | Alternative | Raccomandazione | Impatto |
|---|---|---|---|
| `WorkspaceIdentity` dentro archive o record separato | Campo opzionale nell’archive / nuovo store | Campo opzionale nell’archive | Evita doppia persistenza; nessun nuovo store |
| Compatibilità dei refs attivi | Mantenere / rimuovere subito | Mantenere come bridge deprecato | Migrazione incrementale |
| Duplicazione documentale | snapshot corrente / snapshot originale | Nuovo snapshot del contesto corrente con conferma UI | Chiarezza per docente; storico intatto |
| Modalità iniziale | derivata da dati / scelta esplicita | `personal-local` neutra al primo avvio | Nessuna identità presunta |
| Criterio `ready-local` | istituto+anno / istituto+anno+sede | istituto confermato + anno attivo; sede opzionale | Sede può restare facoltativa |

Nessuna decisione richiede autenticazione, backend o modifica della governance
architetturale.

## 19. Criteri di uscita della specifica

CML-635A è pronta per il piano di implementazione quando:

- il modello C è approvato;
- l’archive resta unica autorità locale;
- la migrazione dei refs attivi è definita;
- snapshot e contesto corrente sono separati;
- i confini 635B/C/D sono espliciti;
- i casi d’uso e la matrice requisiti hanno test associati;
- non sono presenti nuove decisioni architetturali bloccanti.

Verdetti documentali proposti:

```text
CML_635A_REPOSITORY_ASSESSMENT_COMPLETE
CML_635A_WORKSPACE_IDENTITY_SPEC_COMPLETE
CML_635A_IMPLEMENTATION_PLAN_READY
```
