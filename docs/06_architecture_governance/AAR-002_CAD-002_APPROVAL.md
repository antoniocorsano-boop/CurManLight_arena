# AAR-002 — CAD-002 Architecture Approval Record

> Atto di governance che registra l'approvazione formale di CAD-002. Questo
> record rende efficace la promotion policy, ma non autorizza implementazione.

## Approval Record

| Campo | Valore |
| --- | --- |
| Approval Record | AAR-002 |
| Decision | [CAD-002 — Extraction Promotion Policy](./CAD-002_EXTRACTION_PROMOTION_POLICY.md) |
| Stato precedente | Proposed |
| Stato nuovo | Approved |
| Architecture Review | [CAD-002 Architecture Review](./CAD-002_ARCHITECTURE_REVIEW.md) |
| Review outcome | APPROVE — 5/5 PASS, nessun finding |
| Autorità approvante | Utente, in qualità di autorità di governance del workspace |
| Evidenza dell'atto | Approvazione esplicita registrata nella conversazione: “il prossimo atto corretto è esclusivamente AAR-002 — CAD-002 Approval” |
| Condizioni | Nessuna condizione dichiarata |
| Data di efficacia | 2026-07-28 |
| Implementation authority | None |
| Execution Readiness | Eligible, not started |
| Technical Execution | Not authorized |

## Decision

CAD-002 è formalmente approvato come policy normativa per la promozione dei
componenti.

L'approvazione:

- rende vincolanti Evidence Package, lifecycle, gate, ruoli, Promotion Record,
  compatibility, rollback, revoca ed exit gate definiti da CAD-002;
- abilita la proposta di un Execution Readiness Assessment conforme a CAD-002;
- consente di valutare l'apertura della fase Execution Readiness;
- non avvia ERA-001;
- non crea backlog, characterization baseline o consumer inventory;
- non autorizza estrazioni, refactoring o modifiche ai repository;
- non apre T1 e non seleziona formalmente il Metadata Contract;
- non assegna autorità implementativa.

## Traceability

```text
Recovery Audit = Complete
ERDD = Complete
CAD-001 = Approved
AAR-001 = Effective
CAD-002 Review = APPROVE
CAD-002 Previous Status = Proposed
CAD-002 New Status = Approved
AAR-002 = Effective
Execution Readiness = Eligible, not started
ERA-001 = Not started
Technical Execution = Not authorized
Implementation Authority = None
```

## Governance Boundary

`Execution Readiness = Eligible` significa esclusivamente che può essere
proposta una verifica operativa conforme alla policy approvata.

Non equivale a:

- `Execution Readiness = Started`;
- approvazione di un componente;
- apertura di una iniziativa tecnica;
- autorizzazione a modificare codice;
- promozione `Adapt → Extract` o `Extract → Shared`.

Qualsiasi ERA deve essere richiesto come attività distinta. Qualsiasi Technical
Execution richiede inoltre una decisione esplicita di avvio e un'autorità
implementativa separata.

## Conditions

Nessuna condizione è stata dichiarata nell'atto di approvazione.

Restano applicabili senza eccezioni:

- CAD-001 e i suoi invarianti;
- CAD-002 e tutti i gate PG-01–PG-10;
- Recovery Audit ed ERDD come evidenze storiche;
- la separazione tra review, approvazione, readiness ed esecuzione;
- la baseline architetturale CML-603/CML-604;
- il Working Protocol.

## Immutability

AAR-002 registra l'atto avvenuto e non deve essere riscritto per rappresentare
decisioni future.

Correzioni, condizioni successive, sospensioni, revoche o sostituzioni devono
essere registrate in un nuovo Approval Record collegato ad AAR-002.

