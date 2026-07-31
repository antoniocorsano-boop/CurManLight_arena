# CAD-001 — Architecture Review

> Review indipendente del decision record `CAD-001 — Repository Intelligence Core Boundary`. La review valuta la decisione in stato `Proposed`; non modifica il CAD, non ne cambia lo stato e non autorizza implementazione.

## Review Status

**Completed**

| Campo | Valore |
|---|---|
| Decisione esaminata | [CAD-001](./CAD-001_REPOSITORY_INTELLIGENCE_CORE.md) |
| Stato esaminato | Proposed |
| Data review | 2026-07-28 |
| Tipo | Architecture governance review |
| Ambito | Coerenza, completezza, dipendenze, governabilità, evolvibilità |
| Modifiche al CAD durante la review | Nessuna |
| Transizione di stato applicata | Nessuna |

## Review Outcome

| Area | Esito |
|---|---|
| Coerenza | PASS |
| Completezza | PASS |
| Dipendenze | PASS |
| Governabilità | PASS |
| Evolvibilità | PASS |

**Recommendation: APPROVE**

La raccomandazione non modifica automaticamente lo stato di CAD-001. Il passaggio da `Proposed` ad `Approved` richiede un atto esplicito successivo e l’allineamento dell’Architecture Decision Index.

## Review Method

La review applica quattro regole:

1. ogni conclusione deve essere collegata a una decisione, evidenza o vincolo esistente;
2. l’assenza di conflitto non viene dedotta dal silenzio: vengono confrontate le decisioni potenzialmente sovrapposte;
3. una osservazione non bloccante non viene trasformata in condizione implicita;
4. la review non corregge il documento esaminato mentre lo valuta.

Fonti:

- [Ecosystem Recovery Audit](../ecosystem-recovery-audit.md)
- [ERDD Recovery Matrix](../../ERDD/recovery-matrix.md)
- [ERDD Extraction Findings](../../ERDD/extraction-findings.md)
- [ERDD Extraction Scorecard](../../ERDD/extraction-scorecard.md)
- [ERDD Dependency Graph](../../ERDD/evidence/dependency-graph.json)
- [Architecture Decision Index](./ARCHITECTURE_DECISION_INDEX.md)
- [CML-603A Runtime Distribution Strategy](./CML-603A_RUNTIME_DISTRIBUTION_STRATEGY.md)
- [CML-603C Type Boundary Strategy](./CML-603C_TYPE_BOUNDARY_STRATEGY.md)
- [CML-603D Interaction Tests](./CML-603D_INTERACTION_TESTS.md)
- [CML-603E Domain Modularization](./CML-603E_DOMAIN_MODULARIZATION.md)
- [Working Protocol](../WORKING_PROTOCOL.md)
- [Project Baseline](../PROJECT_BASELINE.md)

## 1. Coerenza

### Review question

Le decisioni riflettono realmente Recovery Audit ed ERDD?

### Evidence matrix

| Decisione CAD-001 | Evidenza Recovery Audit / ERDD | Valutazione |
|---|---|---|
| D1 — Headless Core | Audit separa scanner, analyzer, catalogo, graph UI e MCP; ERDD distingue Core e adapter | Coerente |
| D2 — Metadata Contract | ERDD identifica C01 come primo boundary core, `Adapt`, privo di I/O | Coerente |
| D3 — Capability Graph | Dependency graph mostra dipendenze funzionali non riducibili a una pipeline unica | Coerente |
| D4 — AST Boundary | C05 contiene Compiler API e facts; M02 registra l’assenza dell’API testata | Coerente |
| D5 — Replaceable Adapters | React Flow C09–C11 e MCP C19/M01 sono distinti dai fatti core | Coerente |
| D6 — ERDD-Governed Promotion | ERDD applica score, gate, confidence e classificazioni verificabili | Coerente |

### Specific checks

- CAD-001 non ripristina la stima del 72% come criterio decisionale.
- CAD-001 conserva la distinzione tra capacità esistente e boundary estraibile.
- CAD-001 non presenta il client MCP OpenCode come server.
- CAD-001 non presenta `analyze-productization.ts` come libreria già estraibile.
- CAD-001 mantiene React Flow fuori dal Core.
- I conteggi citati nel Context corrispondono alla matrice ERDD: 1 Extract, 10 Adapt, 8 Reference, 2 Missing.

### Result

**PASS**

Non sono state rilevate decisioni non sostenute dalle evidenze normative.

## 2. Completezza

### Review question

Gli invarianti sono sufficienti e non contraddittori?

### Coverage matrix

| Area necessaria | Copertura CAD-001 |
|---|---|
| Identità del Core | D1, Core Boundary |
| Modello canonico | D2, CAD-I03 |
| Topologia delle capacità | D3 |
| Boundary AST | D4, CAD-I07 |
| Core/Adapter separation | D5, CAD-I01, CAD-I02, CAD-I09 |
| Neutralità di dominio | CAD-I10 |
| I/O e provider | CAD-I05 |
| Facts vs policy | CAD-I04 |
| Provenienza e determinismo | CAD-I06 |
| Sicurezza dei sistemi sorgente | CAD-I08 |
| Ruolo del grafo | CAD-I11 |
| Governance evidence-based | D6, CAD-I12 |
| Regole di dipendenza | Dependency Rules |
| Eccezioni e cambi futuri | Decisions Requiring a New CAD or ADR |
| Esclusioni | Non Goals |
| Verifica futura | Compliance Gate |

### Contradiction analysis

Non risultano contraddizioni tra gli invarianti:

- CAD-I03 stabilisce un modello canonico, mentre CAD-I10 ne impedisce la contaminazione applicativa.
- CAD-I05 consente provider esterni, mentre CAD-I02 ne mantiene la dipendenza orientata verso il Core contract.
- CAD-I06 richiede determinismo dei facts/projection senza vietare adapter stateful.
- CAD-I11 definisce il graph come projection ed è coerente con CAD-I04, che separa fatti e interpretazione.
- CAD-I07 impone equivalenza AST ed è compatibile con CAD-I12, che richiede evidenze.

### Scope analysis

Gli argomenti intenzionalmente esclusi — tecnologia MCP, framework CLI, UI, persistence, package layout e modello CurManLight — non sono lacune del CAD. Sono decisioni adapter/application esplicitamente dichiarate Non Goals.

### Result

**PASS**

I dodici invarianti coprono identità, dati, dipendenze, I/O, dominio, compatibilità, grafo e governance senza sovrapposizioni contraddittorie.

## 3. Dipendenze

### Review question

Esistono conflitti con decisioni architetturali già approvate o verificate?

### Cross-decision matrix

| Decisione esistente | Stato | Relazione con CAD-001 | Esito |
|---|---|---|---|
| RT-001 — Local-first | Approved | CAD-I05 non impone rete o backend; provider locali restano possibili | Nessun conflitto |
| RT-002 — Nessun backend obbligatorio | Approved | MCP/API sono adapter opzionali, non dipendenze Core | Nessun conflitto |
| RT-003 — Browser canonico CurManLight | Approved | Definisce il runtime dell’app CurManLight, non il contratto del Core condiviso; browser integration resta adapter | Nessun conflitto |
| RT-006/RT-007 — Sync esplicito e no overwrite silenzioso | Approved | Source-System Safety e provider-neutral I/O sono più restrittivi, non incompatibili | Nessun conflitto |
| RT-010 — Versioni separate | Approved | API Core versionabili e adapter separati rispettano gli assi di versione | Nessun conflitto |
| UT-001 — `src/lib` utility canonico | Verified | CAD-001 non decide package o directory e non modifica la utility baseline | Nessun conflitto |
| TY-001 — Boundary-first types | Verified | Metadata Contract e public Core contracts applicano lo stesso principio | Allineato |
| TS-001 — Interaction tests | Verified | Characterization test aggiungono verifica di estrazione senza sostituire i test dei flussi utente | Allineato |
| DM-001 — Domain public APIs | Verified | Core domain-neutral e dependency direction preservano i boundary applicativi | Allineato |
| NAV-002 — React Router canonico | Verified | Navigation rimane interamente nell’Adapter/Application layer | Nessun conflitto |
| Working Protocol | Attivo | Una nuova Architecture Decision è richiesta per eccezioni strutturali; CAD-001 è Proposed e non autorizza modifiche | Conforme |

### Runtime clarification

“Headless” e “provider-neutral” non significano che CurManLight debba abbandonare il browser canonico. Significano che la semantica del Core non dipende da React, DOM, MCP o da uno specifico storage. Un eventuale consumer CurManLight continuerebbe a rispettare RT-001–RT-011 attraverso i propri adapter.

### Baseline impact

CAD-001:

- non modifica codice o layering corrente;
- non riapre CML-603/CML-604;
- non introduce framework;
- non cambia routing, shell o persistence;
- non modifica decisioni Verified.

### Result

**PASS**

Non sono stati rilevati conflitti bloccanti o dipendenze normative non dichiarate.

## 4. Governabilità

### Review question

Le regole sono verificabili e applicabili?

### Invariant verification model

| Invariante | Evidenza verificabile futura |
|---|---|
| CAD-I01 Headless | Import scan: assenza React/DOM/UI nel Core |
| CAD-I02 Dependency Direction | Dependency graph e boundary import checks |
| CAD-I03 Canonical Metadata | Un solo contratto pubblico canonico; adapter mappings espliciti |
| CAD-I04 Facts Before Interpretation | Tipi/API separati; facts fixtures indipendenti dallo scoring |
| CAD-I05 Provider-Neutral I/O | Provider interfaces; assenza path/storage hardcoded |
| CAD-I06 Determinism and Provenance | Golden/characterization tests e provenance fields |
| CAD-I07 AST Equivalence | Fixture corpus e confronto dei facts |
| CAD-I08 Source-System Safety | Test dei consumer sorgente e compatibility report |
| CAD-I09 Adapter Replaceability | Core tests senza adapter; adapter contract tests |
| CAD-I10 Domain Neutrality | Import/type scan contro domini vietati |
| CAD-I11 Graph as Projection | Projection tests; nessuna scrittura canonica dal renderer |
| CAD-I12 Evidence-Governed Evolution | ERDD e decision log allegati alla promozione |

### Gate applicability

Il Compliance Gate pone dieci domande che possono essere risposte con artefatti osservabili. Le Extraction Rules stabiliscono trigger chiari:

- characterization prima dello spostamento;
- boundary anziché file;
- consumer sorgente preservati;
- facts separati dalla policy;
- ERDD rieseguita dopo cambiamenti materiali;
- nessuna promozione implicita.

### Enforcement scope

CAD-001 non assegna ancora ruoli approvativi o lifecycle di promozione. Questa omissione è intenzionale: appartiene alla futura promotion policy CAD-002. CAD-001 resta governabile perché definisce il gate di conformità architetturale, non il workflow organizzativo.

### Result

**PASS**

Ogni invariante dispone di una forma di verifica oggettiva e nessuna regola richiede interpretazioni esclusivamente soggettive.

## 5. Evolvibilità

### Review question

Il CAD consente estensioni future senza modificare il proprio nucleo?

### Change scenarios

| Scenario futuro | Richiede modifica CAD-001? | Motivo |
|---|---:|---|
| Nuovo renderer del grafo | No | Adapter sostituibile |
| React Flow sostituito | No | Nessun renderer è canonico |
| Nuovo framework CLI | No | CLI adapter |
| MCP stdio sostituito da altro trasporto | No | Protocol adapter |
| SQLite sostituito da altro index store | No | Persistence adapter |
| Nuovo linguaggio sorgente | No, se produce il Metadata Contract | Provider di facts |
| Nuovo consumer applicativo | No | Dipende dal contratto pubblico |
| Nuovo modello CurManLight | No | Dominio esterno al Core |
| Graph reso sorgente canonica | Sì | Viola CAD-I11 |
| Modello Company OS inserito nel Core | Sì | Viola CAD-I10 |
| Framework UI reso obbligatorio | Sì | Viola CAD-I01/CAD-I09 |
| Facts e scoring fusi | Sì | Viola CAD-I04 |

### Stability of the decision

Il CAD decide semantica e direzioni di dipendenza, non tecnologie. Le estensioni ordinarie avvengono tramite nuovi provider o adapter. Solo un cambiamento del nucleo concettuale richiede revisione.

### Result

**PASS**

Il documento lascia spazio a nuovi linguaggi, storage, transport e UI senza rendere instabile il Core Boundary.

## Findings

### Blocking findings

**Nessuno.**

### Non-blocking observations

1. CAD-001 contiene regole minime di estrazione necessarie a proteggere gli invarianti. La futura CAD-002 dovrà recepirle e definire la promotion policy senza duplicarle o modificarle implicitamente.
2. L’assenza di ruoli approvativi in CAD-001 è coerente con il suo scope; tali responsabilità appartengono a CAD-002.
3. La licenza/provenienza dei componenti resta un gate ERDD/promotion e non deve essere incorporata nel Metadata Contract.
4. Un nuovo provider di linguaggio è consentito soltanto se conserva determinismo, provenance e facts contract.

Queste osservazioni non richiedono modifiche a CAD-001 e non costituiscono condizioni all’approvazione.

## Approval Criteria Review

| Criterio dichiarato da CAD-001 | Esito review |
|---|---|
| Core Boundary esplicito e valutabile | PASS |
| Invarianti CAD-I01–CAD-I12 completi | PASS |
| Recovery Audit ed ERDD coerenti con la decisione | PASS |
| Nessuna autorizzazione implementativa implicita | PASS |
| Architecture Decision Index allineato allo stato Proposed | PASS |
| Conflitti con decisioni esistenti esaminati | PASS — nessun conflitto rilevato |

## Recommendation

**APPROVE**

Motivazione:

- tutte le cinque aree di review hanno esito `PASS`;
- non esistono finding bloccanti;
- le osservazioni non bloccanti non richiedono revisione del testo;
- il documento soddisfa i propri Approval Criteria;
- il Core Boundary è coerente con le evidenze e con la baseline architetturale.

## State Transition Rule

Questa review rende CAD-001 eleggibile per una decisione esplicita di approvazione. Non esegue la transizione.

Fino a tale atto:

```text
CAD-001_STATUS = Proposed
CAD-001_REVIEW = APPROVE
CAD-001_IMPLEMENTATION_AUTHORITY = None
CAD-002_NORMATIVE_DEPENDENCY = Not yet active
```

Solo dopo una conferma esplicita:

```text
CAD-001_STATUS = Approved
CAD-001_IMPLEMENTATION_AUTHORITY = Still none
CAD-002_PROPOSAL_ELIGIBILITY = Enabled
```

L’approvazione di CAD-001 renderebbe la decisione vincolante per pianificazione e governance, ma non autorizzerebbe estrazioni o sviluppo.
