# Arena R7C6C — local curriculum data preflight

Data: 2026-09-03  
Base logica: R7C6B `c2ee645e6d48be718353f519d897f5ea135a3570`  
Stato: **IMPLEMENTED — USER-INITIATED PREFLIGHT, NO MODE CHANGE**

## Scopo

R7C6C porta la prova di sicurezza R7C6B sullo **snapshot esatto del curricolo legacy che Arena sta usando nel browser**, senza migrare il database produttivo del nuovo dominio.

L'utente deve avviare esplicitamente il controllo dalla sezione `Fonti → Controllo tecnico dei dati curricolari locali`.

## Sorgente controllata

Il preflight usa la stessa priorità operativa del runtime legacy:

1. `localStorage['curmanlight-custom-curriculum-v2']`, se presente e strutturalmente valido;
2. altrimenti la baseline curricolare inclusa nella release.

JSON non valido o struttura incompatibile bloccano il rehearsal prima di qualunque elaborazione.

## Identità dello snapshot

Prima del rehearsal viene costruita una serializzazione canonica con chiavi oggetto ordinate. Sullo snapshot vengono registrati:

- SHA-256 della serializzazione canonica;
- checksum FNV-1a compatibile con il backup di migrazione esistente;
- byte length della serializzazione canonica;
- numero di chiavi/discipline sorgente;
- origine `LOCAL_CUSTOM_CURRICULUM` oppure `BUNDLED_BASELINE`.

Lo SHA-256 identifica lo snapshot locale sottoposto al preflight. Non attribuisce alcuna autorità nazionale o istituzionale al suo contenuto.

## Rehearsal

R7C6C invoca il rehearsal R7C6B su una copia in memoria:

`current legacy snapshot → backup → migrate in memory → compare → rollback → zero residuals`.

Una ricevuta `PASS` viene emessa soltanto se backup, confronto deterministico e rollback sono tutti positivi, il confronto è `MATCH` e dopo il rollback restano zero record appartenenti alla migrazione.

## Ricevuta

Schema: `arena-r7c6c-local-migration-preflight-v1`.

La ricevuta non contiene il testo del curricolo; conserva fingerprint, conteggi, esiti e invarianti. È salvata localmente soltanto dopo un `PASS` e può essere esportata manualmente.

Una ricevuta è considerata corrente solo se il suo `sourceSha256` coincide con lo SHA-256 ricalcolato sul curricolo locale attuale. Se il curricolo cambia, la ricevuta precedente diventa stale e non può soddisfare il blocker di rehearsal.

## Effetto sulla readiness

Una ricevuta valida può impostare esclusivamente:

`productionDatasetMigrationRehearsalProven = true`.

Non modifica e non può soddisfare automaticamente:

- fingerprint canonico PDF MIM;
- verifica umana 868/868 dei testi nazionali;
- correzioni della fonte d'istituto;
- revisione semantica umana d'istituto;
- validazione umana rappresentativa;
- stato di adozione;
- modo di persistenza.

## Confine runtime

`CURRICULUM_PERSISTENCE_MODE` resta `legacy-only`.

Il preflight:

- non apre `DexieCurriculumPersistenceBackend`;
- non scrive i record migrati negli store produttivi v2;
- non altera il curricolo legacy;
- non abilita automaticamente `dual-read`;
- non abilita `dual-write` o `new-domain-primary`;
- non modifica P3/P7;
- non esegue deployment.

Il passaggio successivo resta un gate umano e normativo: il rehearsal locale elimina soltanto il blocker tecnico relativo allo snapshot corrente quando esiste una ricevuta valida e non stale.
