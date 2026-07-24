# CML-630E2 — Curriculum Persistence and Legacy Compatibility

## 1. Obiettivo e perimetro

La slice rende persistibili `InstituteCurriculumVersion`, `CurriculumSegment`,
`CurriculumNode` e `VerticalCurriculumLink`, senza attivarli nei flussi
produttivi. Sono inclusi schema locale, repository, adattamento legacy,
migrazione esplicita, backup, rollback e test. UI, navigazione, UDA,
programmazione, import ed export restano invariati.

## 2. Contesto e decisioni

Il modello C ibrido di CML-630E1 resta vincolante: provenienza e sostituzione
sono relazioni strutturali; le relazioni pedagogiche appartengono esclusivamente
a `VerticalCurriculumLink`. La persistenza disponibile non equivale
all'attivazione funzionale.

La modalità definita in `compatibilityMode.ts` è `legacy-only`. Le modalità
`dual-read`, `dual-write` e `new-domain-primary` sono valori contrattuali non
attivati.

## 3. Inventario precedente e divergenze dal piano

Il database reale è `CurManLightDB_Evoluto_v1.3`, schema Dexie versione 1.
Contiene il solo object store:

| Store | Chiave | Indici | Contratto |
| --- | --- | --- | --- |
| `state` | `key` | `value` | stringa JSON dello stato Zustand |

Il punto di apertura è `src/store/useCurriculumStore.ts`; lettura, scrittura e
cancellazione avvengono mediante l'adapter `indexedDBStorage`. Il fallback è in
memoria. Per evitare connessioni concorrenti con dichiarazioni v1/v2
incompatibili, questo punto usa ora la definizione condivisa dello schema v2;
chiave, adapter, stato e azioni restano invariati.

Il curricolo legacy non è memorizzato in uno store IndexedDB separato:

- baseline statica: `src/data/curriculumKB.ts`;
- override locale: `curmanlight-custom-curriculum-v2`;
- lettura: `useLocalCurriculum.ts` e store corrente;
- scrittura/rimozione: `useCurriculumImportHandlers.ts`.

Il backup di sessione esistente (`curman_emergency_backup`) riguarda lo stato
applicativo, non una migrazione del curricolo. Non esistevano test di upgrade o
migrazione curricolare.

## 4. Nuovo schema

Lo schema dichiarato è Dexie versione 2 e preserva `state` senza variazioni.

| Store | Chiave | Indici principali |
| --- | --- | --- |
| `instituteCurriculumVersions` | `id` | institutionId, status, effectiveFrom/To, previousVersionId, versionNumber, migrationId |
| `curriculumSegments` | `id` | versionId, schoolLevel, subjectOrFieldId, workStatus, framework, source/replaces, migrationId |
| `curriculumNodes` | `id` | versionId, segmentId, type, workStatus, source/replaces, migrationId |
| `verticalCurriculumLinks` | `id` | versionId, source/target, relationType, status, validatedByRole, migrationId |
| `curriculumMigrationMetadata` | `id` | migrationId univoco, status, startedAt, completedAt |
| `curriculumMigrationBackups` | `id` | migrationId univoco, createdAt, schemaVersion |

`createCurriculumDatabase()` configura entrambe le versioni. Il runtime la usa
esclusivamente per continuare a leggere e scrivere lo store legacy `state`;
nessun repository nuovo o comando di migrazione è istanziato automaticamente.

## 5. Repository ed errori

Sono disponibili repository tipizzati per versioni, segmenti, nodi e link, con
letture ordinate deterministicamente, query per riferimento, salvataggio e
cancellazione protetta. Il backend è iniettato:

- `DexieCurriculumPersistenceBackend` per IndexedDB;
- `MemoryCurriculumPersistenceBackend` per test senza browser.

Gli errori sono `CurriculumPersistenceError` con codici:
`DOMAIN_VALIDATION_FAILED`, `REFERENCE_NOT_FOUND`, `IMMUTABLE_VERSION`,
`SCHEMA_UPGRADE_FAILED`, `MIGRATION_FAILED`, `MIGRATION_INCOMPLETE`,
`ROLLBACK_FAILED`, `BACKUP_INVALID`, `DUPLICATE_RECORD`,
`DELETE_RESTRICTED`, `TRANSACTION_FAILED`.

## 6. Validazione, integrità e immutabilità

Ogni scrittura usa le funzioni CML-630E1 prima di persistere. Il repository
aggiunge i controlli di esistenza dei riferimenti e verifica la scrittura.
Versioni `approved` o `superseded` e relativi segmenti, nodi e link non sono
mutabili. Le cancellazioni sono rifiutate quando esistono figli o riferimenti;
non esistono cascade implicite.

## 7. Adattamento legacy

`adaptLegacyCurriculum()` è puro, non muta l'origine, ordina le discipline e
produce warning strutturati. La mappa è:

| Legacy | Nuovo dominio |
| --- | --- |
| disciplina | `subjectOrFieldId` |
| ordine | `schoolLevel` |
| livello senza classe | scope `school-level` |
| traguardo | nodo `milestone` |
| obiettivo | nodo `objective` |
| evidenza | nodo `evidence` |
| nuclei fondanti | nodo `core-theme` |
| proposte | contenuto del segmento |
| framework senza contesto | `requires-context-confirmation` |

Conoscenze, abilità e competenze sono gestite se presenti. Nessuna vicinanza
testuale o verticale genera link pedagogici. I campi mancanti producono
`LEGACY_EMPTY_LEVEL`; l'assenza di dati produce
`LEGACY_NO_CURRICULUM_DATA`.

## 8. Migrazione

La migrazione ha identificativo stabile
`CML-630E2-LEGACY-CURRICULUM-MIGRATION-V1` ed è richiamabile solo tramite
`migrateLegacyCurriculum()`.

Sequenza: preflight metadati, adattamento in memoria, snapshot, metadato
`running`, transazione su versione/segmenti/nodi/metadato `completed`,
verifica dei conteggi. La versione generata è `Legacy imported baseline`,
`draft`, priva di approvazione, efficacia e autore. Non sono generati link.

Un secondo avvio completato restituisce `already-migrated`; uno stato
incompleto produce `MIGRATION_INCOMPLETE`. Un errore di scrittura annulla i
record parziali e registra `failed`. I dati legacy non vengono scritti,
rimossi o modificati.

## 9. Backup e rollback

Prima della scrittura viene salvato uno snapshot locale con schema sorgente,
timestamp, conteggi e checksum FNV-1a deterministico sul payload normalizzato.
Il payload resta `unknown` ed è verificato tramite checksum prima del rollback.

`rollbackLegacyCurriculumMigration()` elimina, in ordine link → nodi →
segmenti → versione, soltanto record con provenienza della migrazione. Record
manuali successivi e dati legacy restano intatti. Il metadato diventa
`rolled-back`; un secondo rollback è idempotente. Nessuno store viene
svuotato globalmente.

## 10. Atomicità e sicurezza dei dati

Le scritture critiche sono eseguite nella stessa transazione del backend.
Il backend in memoria ripristina uno snapshot in caso di errore; Dexie usa una
transazione `rw` sui sei store nuovi. Backup e registrazione iniziale sono
precedenti alla transazione per lasciare evidenza recuperabile. Non avvengono
scritture remote, telemetria o sincronizzazione.

## 11. Compatibilità

La lettura e scrittura produttiva restano esclusivamente legacy. Il solo store
applicativo importa la factory dello schema condiviso; nessun repository,
adattatore o comando di migrazione è usato da hook, componenti o route. Non
esiste dual-write automatico e la migrazione non è avviata al caricamento.
L'apertura aggiorna in modo non distruttivo lo schema v1 a v2 preservando
`state`; un database vuoto riceve lo stesso schema.

## 12. Test e verifiche

La suite mirata copre 37 casi: dichiarazione di store/indici, preservazione
legacy, modalità, CRUD e query, validazione, riferimenti, duplicati,
cancellazioni protette, atomicità, immutabilità, adattamento deterministico,
warning, assenza di link inventati, migrazione completa/vuota/incompleta,
idempotenza, failure injection, conteggi, backup/checksum, rollback selettivo
e idempotente.

Verifiche finali eseguite:

```text
npx tsc --noEmit
npm test                 → 599/599 in 25 file
npm run build            → verde, dist/index.html single-file
npm run build-storybook  → verde
git diff --check         → pulito
```

Non sono presenti script architetturali aggiuntivi nel repository. La ricerca
statica conferma assenza di `any`/`as any`, assenza di import runtime del nuovo
backend o della migrazione e nessuna modifica a dipendenze o store correnti.

## 13. File

Creati:

- `src/domain/curriculum/persistence/{schema,backend,records,errors,repositories}.ts`;
- `src/domain/curriculum/persistence/{compatibilityMode,legacyAdapters}.ts`;
- `src/domain/curriculum/persistence/{backup,migration,rollback,index}.ts`;
- `src/__tests__/curriculum-persistence/{fixtures,schema,repositories,migration}.ts`;
- questo report.

Modificato `src/store/useCurriculumStore.ts` soltanto per sostituire la
dichiarazione Dexie v1 privata con la factory condivisa v2. Nessun file UI,
hook, routing, UDA, programmazione, import/export, dipendenza o configurazione
è modificato; il contratto dello store è invariato.

## 14. Rischi residui e attività rinviate

- L'esecuzione della migrazione su dati reali richiederà un comando
  amministrativo esplicito in una slice futura.
- L'upgrade dello schema viene eseguito da Dexie all'apertura, ma non trasforma
  né copia dati curricolari: la migrazione dati resta esclusivamente esplicita.
- Non sono implementati workflow di duplicazione/superseding.
- Classi e intervalli non presenti nel contratto legacy corrente non vengono
  inferiti.
- Attivazione dual-read/dual-write, adozione nelle viste, UI amministrativa,
  import/export del nuovo dominio e rimozione legacy restano fuori perimetro.
- La prova di upgrade IndexedDB reale dipende dal runtime browser; la suite
  senza browser verifica dichiarazione, versione, store e indici, mentre build
  e test di non regressione verificano l'isolamento applicativo.

## 15. Raccomandazione

La slice successiva dovrebbe definire separatamente il comando amministrativo
di preflight/migrazione e la sua verifica browser end-to-end, mantenendo
`legacy-only` finché una decisione di prodotto e governance non autorizzerà
l'adozione del nuovo dominio.

## 16. Conferma finale di isolamento

Il nuovo dominio è persistibile ma non è attivo nei flussi produttivi. Il
legacy resta la sola fonte letta e scritta dall'applicazione. Non sono stati
inventati link pedagogici, cancellati dati legacy o introdotti effetti
automatici.
