# AAR-001 — CAD-001 Architecture Approval Record

> Atto di governance che registra l’approvazione formale di CAD-001. Questo record non modifica il contenuto della decisione e non autorizza implementazione.

## Approval Record

| Campo | Valore |
|---|---|
| Approval Record | AAR-001 |
| Decision | [CAD-001 — Repository Intelligence Core Boundary](./CAD-001_REPOSITORY_INTELLIGENCE_CORE.md) |
| Stato precedente | Proposed |
| Stato nuovo | Approved |
| Architecture Review | [CAD-001 Architecture Review](./CAD-001_ARCHITECTURE_REVIEW.md) |
| Review outcome | APPROVE |
| Autorità approvante | Utente, in qualità di autorità di governance del workspace |
| Evidenza dell’atto | Approvazione esplicita registrata nella conversazione: “io approvo” |
| Condizioni | Nessuna condizione dichiarata |
| Data di efficacia | 2026-07-28 |
| Implementation authority | None |

## Decision

CAD-001 è formalmente approvato come decisione architetturale normativa.

L’approvazione:

- rende vincolanti il Core Boundary e gli invarianti CAD-I01–CAD-I12 per la pianificazione futura;
- rende CAD-001 una dipendenza normativa utilizzabile da decisioni successive;
- abilita la proposta di CAD-002;
- non autorizza estrazioni, refactoring, CML-640, AST API, MCP server o altre implementazioni;
- non modifica le classificazioni ERDD;
- non promuove alcun componente.

## Traceability

```text
Recovery Audit = Complete
ERDD = Complete
CAD-001 Review = APPROVE
CAD-001 Previous Status = Proposed
CAD-001 New Status = Approved
CAD-001 Implementation Authority = None
CAD-002 Proposal Eligibility = Enabled
```

## Conditions

Nessuna condizione è stata dichiarata nell’atto di approvazione.

Restano applicabili senza eccezioni:

- gli Approval Criteria di CAD-001;
- il Compliance Gate di CAD-001;
- le classificazioni e i gate ERDD;
- la baseline architetturale CML-603/CML-604;
- il Working Protocol;
- l’obbligo di una decisione separata prima di qualsiasi deviazione dagli invarianti.

## Immutability

AAR-001 registra l’atto avvenuto e non deve essere riscritto per rappresentare decisioni future.

Correzioni, condizioni successive, sospensioni, revoche o sostituzioni devono essere registrate in un nuovo Approval Record collegato ad AAR-001.
