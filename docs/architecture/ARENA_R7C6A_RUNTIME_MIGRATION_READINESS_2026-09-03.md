# Arena R7C6A — runtime migration readiness

Data: 2026-09-03  
Base logica: R7C5C3 `bfeadc81e5f5093ee8cb67eadd92b3d65e2632c6`  
Stato: **PREP_BLOCKED — nessuna migrazione runtime autorizzata**

## Scopo

R7C6A apre esclusivamente la fase preparatoria della migrazione `legacy-only → dual-read` prevista dall'audit di convergenza. Non modifica `CURRICULUM_PERSISTENCE_MODE`, non esegue `migrateLegacyCurriculum()` e non autorizza `dual-write` o `new-domain-primary`.

La tranche unifica nel gate di readiness le due linee già acquisite:

- lato nazionale: inventario finale D.M. 221/2025 di 868 slot, workbench di verifica umana, ricevute portabili e gate fingerprint fail-closed;
- lato d'istituto: ricostruzione cell-aware v3 del `CURRICOLO VERTICALE .docx`, SHA-256 sorgente `187bc12a771a29331c0d6638abe9e74788a2554af2735e3b9f43321d8f2ae57b`, 32 presentazioni curricolari e 741 elementi sorgente derivati conservativamente.

## Evidenza d'istituto importata nel gate

La ricostruzione v3 certificata da PR #182 registra:

- 27 presentazioni `SOURCE_READY_FOR_SEMANTIC_REVIEW`;
- 3 `BLOCKED_SOURCE_DEFECT`;
- 1 `BLOCKED_HEADER_REPAIR`;
- 1 `REVIEW_REQUIRED_IDENTITY_LABEL`;
- `authority = LOCAL_WORKING`;
- `semanticStatus = UNASSESSED`;
- nessuna promozione canonica o attribuzione nazionale automatica.

Questi dati vengono registrati come evidenza di readiness, non come contenuto canonico del curricolo.

## Gate R7C6A

Il passaggio alla sola **validazione dual-read** può essere autorizzato soltanto se sono contemporaneamente provati:

1. persistenza ancora `legacy-only` al momento del preflight;
2. inventario nazionale strutturale = 868;
3. SHA-256 canonico del PDF finale MIM acquisito;
4. 868/868 testi nazionali human-source-verified con evidenza durevole;
5. ricostruzione d'istituto disponibile;
6. zero difetti/review strutturali d'istituto bloccanti;
7. revisione semantica umana d'istituto completata;
8. backup provato;
9. rollback provato;
10. confronto deterministico legacy ↔ nuovo dominio provato;
11. validazione umana rappresentativa provata.

Il gate produce `READY_FOR_DUAL_READ_VALIDATION` solo quando non esiste alcun blocker. Anche allora non muta automaticamente il modo di persistenza.

## Stato corrente

R7C6A resta intenzionalmente `PREP_BLOCKED`. Sono già soddisfatti la struttura nazionale a 868 elementi e la ricostruzione strutturale della fonte d'istituto. Restano invece non provati o incompleti: fingerprint canonico MIM, verifica umana 868/868, correzioni della fonte d'istituto, semantic review, backup/rollback/comparison evidence e human validation.

## Autorità

`PREP_BLOCKED` non è un errore: è il risultato corretto del gate con le evidenze correnti.

R7C6A non modifica:

- autorità nazionale;
- autorità istituzionale;
- P3/P7;
- curricolo adottato;
- runtime produttivo;
- persistenza;
- dati legacy;
- UDA o allegati operativi.

La sola transizione modellata in questa tranche è `legacy-only → dual-read`, e resta non autorizzata finché tutti i prerequisiti non sono provati.