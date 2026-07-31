# CAD-001 — Repository Intelligence Core Boundary

> Core Architecture Decision. Questo documento stabilisce il perimetro architetturale del Repository Intelligence Core e le regole di estrazione dei componenti. Non autorizza né prescrive alcuna implementazione; ogni attività successiva deve dimostrare conformità alle decisioni qui definite.

## Status

**Approved**

| Campo | Valore |
|---|---|
| ID | CAD-001 |
| Categoria | Core Architecture / Repository Intelligence |
| Data proposta | 2026-07-28 |
| Data approvazione | 2026-07-28 |
| Impatto | Alto |
| Stato implementazione | Non autorizzata |
| Approval Record | [AAR-001](./AAR-001_CAD-001_APPROVAL.md) |

CAD-001 risulta approvato tramite [AAR-001](./AAR-001_CAD-001_APPROVAL.md), dopo la [Architecture Review](./CAD-001_ARCHITECTURE_REVIEW.md) con raccomandazione `APPROVE`. Lo stato Approved rende la decisione vincolante per governance e pianificazione, ma non apre estrazioni, CML-640 o sviluppo infrastrutturale.

## Context

L’[Ecosystem Recovery Audit](../ecosystem-recovery-audit.md) ha dimostrato che l’ecosistema contiene capacità distribuite di repository discovery, analisi dei sorgenti, metadata, ricerca, catalogazione, graph projection e integrazione MCP.

L’[Extraction Readiness Due Diligence](../../ERDD/recovery-matrix.md) ha verificato i boundary reali a livello di simboli, consumer, dipendenze, I/O, test, accoppiamento e stabilità. La classificazione risultante è 1 `Extract`, 10 `Adapt`, 8 `Reference` e 2 `Missing`.

Le capacità mancanti sono una API AST stabile, riutilizzabile e testata e un Repository Intelligence MCP server. La capacità di analisi AST esiste già come implementazione e sorgente di validazione; non esiste ancora il suo boundary riutilizzabile e testato.

Il problema architetturale non è progettare un nuovo prodotto greenfield o scegliere una UI. È stabilire il nucleo condiviso, le direzioni consentite delle dipendenze e le condizioni per consolidare capacità esistenti senza compromettere i sistemi sorgente.

## Decision

### D1 — Headless Core

Il Repository Intelligence Core è un motore indipendente dalle tecnologie di presentazione e trasporto.

Comprende esclusivamente responsabilità necessarie a:

- scoprire repository e workspace;
- produrre fatti strutturali sui sorgenti;
- rappresentare metadata e dipendenze;
- indicizzare e cercare codice e metadata;
- proiettare i metadata in strutture di grafo.

UI, CLI, API HTTP e MCP non appartengono al Core.

### D2 — Metadata Contract

Il Metadata Contract è la rappresentazione canonica condivisa tra discovery, AST facts, search/index e graph projection.

Descrive fatti osservati e non incorpora scoring prodotto, raccomandazioni, tassonomie Company OS, entità didattiche, copy UI o dettagli di storage, trasporto e framework. Nessun adapter può diventare sorgente canonica dei metadata.

### D3 — Capability Graph

Il Core è un grafo di capacità, non una pipeline temporale:

```text
Repository Intelligence Core

                  Metadata Contract
                 /        |        \
                /         |         \
       Discovery      AST Facts      Search / Index
                \         |         /
                 \        |        /
                  Graph Projection

                         |
                         v

                    Adapter Layer

              CLI   API   React Flow   MCP
```

Discovery, AST Facts e Search/Index possono evolvere come provider distinti. Graph Projection consuma il contratto e non ricostruisce né possiede i fatti sorgente.

### D4 — AST Boundary, non AST Engine

Il Core espone un contratto AST stabile. Le implementazioni esistenti costituiscono evidenza e sorgente di validazione.

- È vietata la riscrittura dell’analisi AST senza equivalenza funzionale dimostrata rispetto ai fatti esistenti.
- È vietata l’estrazione diretta di `company-os/scripts/analyze-productization.ts` senza isolamento del boundary.
- Scoring, clustering prodotto, CLI I/O e snapshot writing non appartengono al contratto AST.
- I characterization test sui fatti esistenti sono condizione di accettazione di ogni estrazione o sostituzione.

`M02 — Tested reusable AST analyzer API` rimane `Missing` finché il boundary non è verificato. Questo stato non autorizza una riscrittura greenfield.

### D5 — Replaceable Adapters

React Flow e Graph Workspace, CLI, API, MCP, exporter e strumenti di audit appartengono all’Adapter Layer.

Gli adapter possono dipendere dai contratti pubblici del Core. Il Core non può dipendere dagli adapter.

### D6 — ERDD-Governed Promotion

Le classificazioni ERDD hanno valore di gate:

- `Extract`: candidato utilizzabile senza modifiche sostanziali, previa autorizzazione;
- `Adapt`: nucleo riutilizzabile con accoppiamenti esplicitamente rimossi;
- `Reference`: evidenza, non sorgente direttamente promuovibile;
- `Missing`: capability o boundary non implementato;
- `Not reusable`: componente escluso dal riuso.

Una classificazione misura readiness e non autorizza l’estrazione.

## Core Boundary

### Nel Core

| Boundary | Responsabilità |
|---|---|
| Metadata Contract | Tipi e semantica dei fatti strutturali canonici |
| Repository Discovery | Individuazione read-only di repository, workspace e unità analizzabili |
| AST Facts | Produzione di fatti strutturali tramite contratto stabile |
| Search & Index | Indicizzazione e interrogazione di codice e metadata |
| Graph Projection | Proiezione deterministica del Metadata Contract in nodi e archi |

### Fuori dal Core

| Responsabilità | Layer |
|---|---|
| Rendering React Flow e Graph Workspace | UI adapter |
| CLI | Interface adapter |
| HTTP API | Transport adapter |
| MCP server o client | Protocol adapter |
| SQLite, JSON, browser storage, vector store | Persistence adapter |
| Scoring prodotto e raccomandazioni | Application/policy layer |
| Modelli CurManLight | CurManLight domain |
| Knowledge graph scolastico | DocenteDoc domain |

## Architectural Invariants

### CAD-I01 — Headless

Il Core non importa framework UI, React, React Flow, DOM API o copy di presentazione.

### CAD-I02 — Dependency Direction

Le dipendenze puntano dagli adapter verso il Core. Il Core non importa adapter, route, command handler o server.

### CAD-I03 — Canonical Metadata

Discovery, AST Facts e Search/Index comunicano tramite il Metadata Contract e non introducono modelli canonici paralleli.

### CAD-I04 — Facts Before Interpretation

Fatti osservati, inferenze, score e raccomandazioni sono strutturalmente separati.

### CAD-I05 — Provider-Neutral I/O

Filesystem, database, cache, rete, process execution e browser storage sono provider iniettati o adapter. Nessun path o storage specifico è canonico.

### CAD-I06 — Determinism and Provenance

Ogni fatto e proiezione dichiara la propria provenienza e produce risultati deterministici a parità di input e configurazione.

### CAD-I07 — AST Equivalence

Ogni implementazione AST estratta, adattata o sostituita dimostra equivalenza sui characterization test derivati dai fatti esistenti.

### CAD-I08 — Source-System Safety

Un’estrazione non rompe, svuota o cambia implicitamente i consumer sorgente. La compatibilità è verificata prima della promozione.

### CAD-I09 — Adapter Replaceability

CLI, API, React Flow e MCP possono essere aggiunti, sostituiti o rimossi senza cambiare la semantica del Core.

### CAD-I10 — Domain Neutrality

Il Core non possiede entità, workflow o policy Company OS, DocenteDoc o CurManLight.

### CAD-I11 — Graph as Projection

Il grafo è una proiezione del Metadata Contract, non la sorgente canonica dei fatti e non il renderer.

### CAD-I12 — Evidence-Governed Evolution

Ogni promozione, estrazione o nuova capability è sostenuta da codice, consumer, test e decision log verificabili.

## Constraints

1. Nessuna estrazione senza characterization test.
2. Nessun `Reference` può essere promosso senza nuova ERDD.
3. Nessun `Missing` autorizza automaticamente sviluppo.
4. Nessuna dipendenza del Core da UI, MCP, HTTP, CLI o runtime applicativi.
5. Nessuna dipendenza del Core dai domini Company OS, DocenteDoc o CurManLight.
6. Nessun I/O hardcoded come comportamento canonico.
7. Nessuna riscrittura AST senza equivalenza dimostrata.
8. Nessuna estrazione modifica consumer sorgente senza decisione e verifica dedicate.
9. Le API Core sono tipizzate, versionabili e testate indipendentemente.
10. Ogni adapter dichiara il contratto Core consumato.
11. Ogni deviazione da CAD-I01–CAD-I12 richiede una nuova decisione che modifichi o sostituisca CAD-001.

## Extraction Rules

- **ER-01 — Characterize before moving.** Il comportamento viene fissato in test prima di separare codice.
- **ER-02 — Extract boundary, not file.** Si estrae un contratto coeso, non automaticamente un file.
- **ER-03 — Preserve source consumers.** Il sistema sorgente resta funzionante.
- **ER-04 — Separate facts from policy.** Scoring, raccomandazioni e UI state non entrano nel Core con i fatti.
- **ER-05 — Reapply ERDD gates.** ERDD viene rieseguita quando cambiano boundary, consumer, I/O, licenza o test.
- **ER-06 — No silent promotion.** `Adapt`, `Reference` e `Missing` non diventano `Extract` tramite decisioni implementative locali.

## Dependency Rules

Consentito:

```text
Adapter -> Core public contract
Application domain -> Core public contract
Core orchestration -> Core provider interface
Provider adapter -> external runtime/library
```

Vietato:

```text
Core -> React / React Flow / DOM
Core -> CLI / HTTP route / MCP transport
Core -> Company OS / DocenteDoc / CurManLight domain
Metadata Contract -> persistence implementation
Graph Projection -> renderer state
AST Facts -> product scoring
```

## Consequences

### Abilita

- Core verificabile indipendentemente dalle superfici.
- Riuso senza equiparare riuso a copia di file.
- Adapter sostituibili.
- Validazione oggettiva tramite ERDD e characterization test.
- Separazione tra repository facts e policy.

### Impedisce

- Avvio dalla UI o da React Flow.
- Promozione automatica di codice non testato o senza consumer.
- Modelli metadata canonici duplicati.
- Path, database o runtime applicativi nel Core.
- Riscrittura AST non verificata.
- Uso del client MCP come prova dell’esistenza del server.

### Costi

- Ogni estrazione richiede evidenze e characterization test.
- Componenti funzionalmente validi restano adapter/reference finché il boundary non è dimostrato.
- La separazione facts/policy può richiedere adattamenti nei sistemi sorgente.
- Le scelte tecnologiche vengono rinviate agli adapter.

## Decisions Requiring a New CAD or ADR

Richiedono una nuova decisione o revisione di CAD-001:

- aggiungere responsabilità al Core;
- rendere un framework/runtime obbligatorio;
- invertire dipendenze Core/Adapter;
- rendere il grafo sorgente canonica;
- incorporare domini applicativi nel Metadata Contract;
- imporre un AST engine canonico;
- ammettere I/O hardcoded;
- eliminare characterization test o ERDD;
- derogare a CAD-I01–CAD-I12.

Non richiedono modifica a CAD-001, se conformi:

- scegliere renderer, CLI framework, SDK MCP o persistence adapter;
- modificare il modello CurManLight;
- aggiungere un consumer del Core.

## Non Goals

CAD-001 non:

- definisce un piano di implementazione;
- autorizza estrazioni, refactoring o sviluppo;
- avvia CML-640;
- sceglie tecnologia MCP, CLI, API o persistence;
- decide la UI del Graph Workspace;
- rende React Flow obbligatorio;
- decide il modello dati CurManLight;
- modifica repository sorgente;
- stabilisce package, directory o pubblicazione;
- sostituisce ERDD;
- promuove componenti;
- prescrive una pipeline temporale lineare.

## Compliance Gate

Ogni futura proposta deve dichiarare:

1. boundary implementato o consumato;
2. Metadata Contract usato;
3. natura Core o Adapter;
4. direzione delle dipendenze;
5. characterization test e source-system safety;
6. classificazione ERDD corrente;
7. cambiamenti a score, gate, consumer, I/O o licenza;
8. separazione facts/policy;
9. invarianti CAD-I01–CAD-I12 verificati;
10. eventuale necessità di nuova decisione.

Senza queste evidenze la proposta non supera il gate CAD-001.

## Approval Criteria

CAD-001 risulta approvato tramite [AAR-001](./AAR-001_CAD-001_APPROVAL.md), dopo la [Architecture Review](./CAD-001_ARCHITECTURE_REVIEW.md) con raccomandazione `APPROVE`. Lo stato Approved rende la decisione vincolante per governance e pianificazione, ma non apre estrazioni, CML-640 o sviluppo infrastrutturale.

- accettazione esplicita del Core Boundary;
- accettazione degli invarianti CAD-I01–CAD-I12;
- riconoscimento di Recovery Audit ed ERDD come base;
- conferma che CAD-001 non autorizza implementazione;
- Architecture Decision Index allineato;
- conflitti con decisioni esistenti registrati e risolti.

## Evidence and Traceability

- [Ecosystem Recovery Audit](../ecosystem-recovery-audit.md)
- [ERDD Recovery Matrix](../../ERDD/recovery-matrix.md)
- [ERDD machine-readable matrix](../../ERDD/recovery-matrix.json)
- [ERDD Extraction Findings](../../ERDD/extraction-findings.md)
- [ERDD Dependency Graph](../../ERDD/evidence/dependency-graph.json)
- [ERDD Stability Evidence](../../ERDD/evidence/stability-evidence.json)
- [ERDD Extraction Scorecard](../../ERDD/extraction-scorecard.md)

## Decision Summary

> CAD-001 stabilisce il perimetro architetturale del Repository Intelligence Core e le regole di estrazione dei componenti. Non autorizza né prescrive alcuna implementazione; ogni attività successiva dovrà dimostrare conformità alle decisioni qui definite.
