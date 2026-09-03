# Arena R7C6B — migration safety rehearsal

Data: 2026-09-03  
Base logica: R7C6A `fd3e33a4ca4235a4f33f41e23bb98652b3e2f3ed`  
Stato: **CAPABILITY PROVEN / PRODUCTION DATA REHEARSAL NOT PROVEN**

## Scopo

R7C6B dimostra in isolamento che il meccanismo di persistenza può eseguire la sequenza di sicurezza necessaria prima di qualunque futura validazione `dual-read`:

`legacy source → backup → migration → deterministic comparison → rollback → zero residual migrated records`.

La prova usa esclusivamente `MemoryCurriculumPersistenceBackend`. Non apre IndexedDB produttivo, non legge dati personali/locali dell'utente, non esegue `migrateLegacyCurriculum()` sul dataset reale e non modifica `CURRICULUM_PERSISTENCE_MODE`.

## Prove introdotte

### Backup

Il rehearsal richiede che:

- il backup esista prima della migrazione;
- `assertValidBackup()` ne riconfermi l'integrità;
- il checksum del payload coincida con quello della sorgente in ingresso;
- il backup resti valido anche dopo il rollback.

Il checksum di backup preesistente è `FNV-1a`: è usato qui come checksum deterministico di integrità della migrazione, **non** come fingerprint crittografico di autorità. Il gate SHA-256 della pubblicazione MIM introdotto da R7C5C3 resta separato.

### Confronto deterministico

Il comparatore:

- ricostruisce l'aspettativa tramite lo stesso adattatore legacy governato;
- acquisisce dal backend soltanto record con `_migrationId = CML-630E2-LEGACY-CURRICULUM-MIGRATION-V1`;
- rimuove esclusivamente i metadati di provenienza di migrazione prima del confronto;
- ordina versioni, segmenti, nodi e link per `id`;
- confronta sia checksum complessivo sia differenze per identificativo;
- distingue `missing`, `unexpected` e `changed` anche quando i conteggi sono identici.

Un singolo titolo di nodo alterato deve quindi produrre `MISMATCH`: la parità dei conteggi non è sufficiente.

### Rollback

Il rehearsal esegue poi `rollbackLegacyCurriculumMigration()` e richiede:

- stato metadata `rolled-back`;
- zero record ancora appartenenti alla migrazione;
- backup ancora presente e valido;
- sorgente legacy invariata.

## Effetto sulla readiness R7C6A

Dopo la validazione exact-head di questa tranche possono essere considerati provati a livello di **capacità tecnica isolata**:

- `backupGateProven = true`;
- `rollbackGateProven = true`;
- `deterministicComparisonProven = true`.

R7C6B introduce però esplicitamente il blocker più preciso:

`PRODUCTION_DATA_MIGRATION_REHEARSAL_NOT_PROVEN`.

Questo impedisce di trasformare un test in-memory in una dichiarazione sulla sicurezza del dataset locale reale.

## Confine di autorità

R7C6B non autorizza:

- mutazione `legacy-only → dual-read`;
- migrazione reale dei dati locali;
- `dual-write`;
- `new-domain-primary`;
- verifica automatica dei 868 testi nazionali;
- correzione automatica del curricolo d'istituto;
- revisione semantica automatica;
- adozione istituzionale;
- P3/P7 mutation;
- deployment.

Il prossimo passo tecnico, quando appropriato, deve essere un **preflight/rehearsal esplicito sul dataset locale reale**, ancora con runtime in `legacy-only`, con ricevuta esportabile e nessuna promozione automatica del modo di persistenza.
