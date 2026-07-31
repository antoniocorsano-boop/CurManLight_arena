# EP-000 — Extraction Preparation Phase Opening Record

## Opening Record

| Campo | Valore |
| --- | --- |
| Phase | Extraction Preparation |
| Status | Open |
| Authorization | Esplicita |
| Authorizing authority | Utente, in qualità di autorità di governance del workspace |
| Evidence | Comando registrato nella conversazione: “apri la fase” |
| Effective date | 2026-07-28 |
| Governing decisions | CAD-001 Approved; CAD-002 Approved |
| Readiness input | ERA-001 — NO GO |
| Implementation authority | None |
| Technical Execution | Not authorized |

## Authorized Purpose

La fase è autorizzata esclusivamente a produrre le evidenze documentali
necessarie per riesaminare i sei finding bloccanti di ERA-001.

La fase non è autorizzata a:

- modificare codice o repository sorgente;
- creare test automatizzati;
- estrarre, copiare o refactoring componenti;
- promuovere C01 da `Adapt` a `Extract`;
- aprire T1;
- avviare Technical Execution;
- modificare CAD-001, CAD-002, AAR-001, AAR-002 o ERA-001.

## Authorized Deliverables

| Ordine | Deliverable | Stato iniziale |
| ---: | --- | --- |
| 1 | EP-01 — Metadata Boundary Specification | Eligible, not started |
| 2 | EP-03 — Consumer Inventory | Blocked by EP-01 |
| 3 | EP-04 — Compatibility Contract | Blocked by EP-01 and EP-03 |
| 4 | EP-02 — Characterization Baseline Specification | Blocked by EP-01, EP-03 and EP-04 |
| 5 | EP-05 — Rollback & Ownership Plan | Blocked by EP-01–EP-04 |
| 6 | EP-06 — Provenance & License Verification | Blocked by prior preparation evidence |

I numeri identificano deliverable stabili; l'ordine operativo segue le
dipendenze approvate e non la numerazione.

## Phase Constraints

1. Ogni deliverable deve essere basato su evidenze osservabili.
2. L'assenza di evidenza deve essere registrata come tale e non sostituita da
   inferenze.
3. EP-02 descrive comportamenti, fixture, output, criteri di equivalenza e casi
   limite; non crea test eseguibili.
4. Nessun deliverable può contenere patch, commit, branch, task di
   implementazione o istruzioni di refactoring.
5. Un deliverable successivo non può iniziare prima della verifica delle
   dipendenze dichiarate.
6. La chiusura di un deliverable non modifica automaticamente i gate CAD-002.
7. ERA-001 rimane `NO GO` come record storico.

## Entry State

```text
EXTRACTION_PREPARATION = Open
EP-01 = Eligible, not started
EP-02 = Blocked
EP-03 = Blocked
EP-04 = Blocked
EP-05 = Blocked
EP-06 = Blocked
ERA-001 = NO GO
ERA-002 = Not eligible
T1 = Not authorized
TECHNICAL_EXECUTION = Not authorized
IMPLEMENTATION_AUTHORITY = None
```

## Exit Condition

Extraction Preparation potrà essere dichiarata completa solo quando:

- EP-01–EP-06 sono completati e verificati;
- ogni finding di ERA-001 dispone di evidenza di chiusura;
- nessun deliverable introduce autorità implementativa implicita.

Solo allora ERA-002 diventerà eleggibile. La chiusura della fase non produrrà
automaticamente un esito `GO` e non autorizzerà T1.

