# EP-01 — Metadata Boundary Specification

## Assumptions

- CAD-001 è `Approved`.
- CAD-002 è `Approved`.
- AAR-001 e AAR-002 sono `Effective`.
- ERA-001 ha esito `NO GO`.
- Extraction Preparation è `Open`.
- C01 — Repository Intelligence metadata contracts è il componente candidato.
- C01 mantiene classificazione ERDD `Adapt` con score 85/100.
- La baseline sorgente verificata è
  `7b55c4eb4327bbea772435241b24171d5a5415a6`.
- `Implementation Authority = None`.
- `Technical Execution = Not authorized`.

## Specification Record

| Campo | Valore |
| --- | --- |
| Deliverable | EP-01 |
| Titolo | Metadata Boundary Specification |
| Status | Complete |
| Phase | Extraction Preparation |
| Source candidate | C01 — Repository Intelligence metadata contracts |
| Governing decisions | CAD-001; CAD-002 |
| Input assessment | ERA-001 — NO GO |
| Approval evidence | Formulazione facts-only approvata esplicitamente dall'autorità di governance |
| Implementation authority | None |

## Normative Principle

> Il Metadata Contract contiene esclusivamente fatti osservati, direttamente
> verificabili e dotati di provenienza. Cluster logici, capability grouping,
> scoring, ranking, recommendation e qualsiasi altra inferenza non fanno parte
> del contratto; sono proiezioni derivate e possono essere rigenerate a partire
> dai metadata.

## Component Identity

Il componente specificato è il **Metadata Contract** del Repository
Intelligence Core.

Il Metadata Contract è la rappresentazione canonica e technology-neutral dei
fatti strutturali osservati in un repository o workspace. Costituisce il
boundary condiviso tra provider di discovery e source analysis e i consumer di
search/index e graph projection.

Il componente non coincide con:

- il file sorgente attuale di C01;
- `RepositoryIntelligenceState`;
- uno snapshot JSON;
- uno scanner;
- un analyzer AST;
- un database o indice;
- un dependency graph;
- un renderer o adapter.

## Boundary Responsibilities

Il Metadata Contract:

1. definisce la semantica dei fatti strutturali canonici;
2. rappresenta l'identità della baseline osservata;
3. collega ogni fatto alla propria provenienza;
4. rappresenta unità sorgente, simboli e riferimenti osservati;
5. rappresenta dipendenze esplicitamente dichiarate o rilevate;
6. rappresenta artefatti e interazioni dati osservate;
7. dichiara il perimetro e la completezza dell'osservazione;
8. consente a provider distinti di produrre fatti interoperabili;
9. consente ai consumer di derivare proiezioni senza modificare i fatti;
10. mantiene separati fatti, inferenze e policy.

## Canonical Fact Families

### Repository Observation

Identifica:

- repository o workspace osservato;
- revisione, snapshot o baseline di riferimento;
- scope dell'osservazione;
- provider e versione del provider;
- stato completo o parziale dell'osservazione.

L'identificatore non rende canonico un path locale, un URL o uno specifico
version-control system.

### Source Unit Fact

Rappresenta una unità sorgente effettivamente osservata, per esempio:

- file;
- modulo;
- package;
- manifest;
- schema dichiarativo.

Può descrivere identità, tipo, localizzazione logica e relazione di
contenimento. Non assegna capability, valore prodotto o maturità.

### Symbol Fact

Rappresenta una dichiarazione osservata:

- nome;
- categoria sintattica dichiarata;
- unità sorgente;
- visibilità o export osservato;
- posizione dell'evidenza, quando disponibile.

Un simbolo non contiene score, importanza, raccomandazione o interpretazione di
dominio.

### Reference Fact

Rappresenta un riferimento esplicito osservato tra unità o simboli:

- import;
- export/re-export;
- chiamata o uso rilevato;
- riferimento dichiarativo;
- target letterale e, quando verificabile, target risolto.

La risoluzione deve essere distinta dal testo letterale osservato.

### Dependency Fact

Rappresenta una dipendenza dichiarata o direttamente rilevata con:

- sorgente;
- destinazione dichiarata o risolta;
- tipo di dipendenza osservato;
- evidenza che la dimostra;
- provenienza.

Il singolo dependency fact appartiene al Metadata Contract. Il dependency
graph ottenuto aggregando i facts è una proiezione e non appartiene al
boundary.

### Data Artifact Fact

Rappresenta artefatti dati osservati, per esempio:

- store;
- tabella;
- collection;
- schema;
- file dati.

La categoria deve derivare da evidenza esplicita. Il semplice nome di un file
non prova automaticamente la semantica dell'artefatto.

### Data Interaction Fact

Rappresenta un'interazione osservata tra una unità sorgente e un artefatto dati:

- read;
- write;
- declaration;
- migration;
- query o accesso rilevabile.

La direzione dell'interazione è un fatto soltanto quando supportata
dall'evidenza registrata.

### Provenance

Ogni fatto deve dichiarare:

- baseline osservata;
- provider che lo ha prodotto;
- metodo di osservazione;
- localizzazione dell'evidenza;
- scope dell'osservazione;
- eventuale stato parziale.

La provenienza non esprime confidence o qualità interpretativa. Dichiara
soltanto origine, metodo e perimetro del fatto.

## Inputs

Il Metadata Contract accetta osservazioni prodotte da provider conformi.

Un input conforme:

- identifica baseline e observation scope;
- dichiara il provider;
- contiene fatti direttamente sostenuti da evidenza;
- distingue valore letterale e valore risolto;
- non presenta inferenze come fatti;
- non interpreta l'assenza di un fatto come prova di inesistenza quando lo
  scope è parziale.

Filesystem scanner, parser, Compiler API, ripgrep, Git e altri strumenti sono
provider possibili. Nessuno di essi è parte obbligatoria del contract.

## Outputs

L'output del boundary è un insieme canonico di fatti con provenienza.

L'output:

- è indipendente dal trasporto e dalla persistenza;
- conserva relazioni e riferimenti osservati;
- rende esplicita la completezza dello scope;
- può essere indicizzato o proiettato;
- non contiene presentazione, ranking o decisioni.

Un aggregate, summary, graph o cluster prodotto dai facts è output di un
consumer o projection layer, non del Metadata Contract.

## Included in the Boundary

| Categoria | Condizione di inclusione |
| --- | --- |
| Identità repository/workspace | Collegata a baseline e scope osservati |
| Unità sorgente | Presenza direttamente osservata |
| Relazioni di contenimento | Evidenza strutturale disponibile |
| Simboli | Dichiarazione osservata |
| Import, export e riferimenti | Esplicitamente presenti nella sorgente |
| Dipendenze | Dichiarate o direttamente rilevate |
| Store, tabelle e artefatti dati | Evidenza esplicita disponibile |
| Read/write e altre interazioni dati | Direzione sostenuta dall'evidenza |
| Provenienza | Obbligatoria per ogni fatto |
| Stato dello scope | Completezza o parzialità dichiarata |

## Excluded from the Boundary

| Categoria esclusa | Destinazione concettuale |
| --- | --- |
| Logical cluster | Projection layer |
| Dependency graph aggregato | Graph Projection |
| Capability grouping | Interpretation/application layer |
| Product e library potential | Company OS policy |
| Score e maturity level | Scoring/policy layer |
| Ranking | Application layer |
| Product candidate | Company OS domain |
| Product template | Company OS domain |
| Extraction boundary recommendation | Planning/application layer |
| Product proposal | Company OS domain |
| Narrative explanation e rationale | Presentation/application layer |
| Promising product/library areas | Derived summary |
| Conteggi aggregati rigenerabili | Derived summary |
| UI state e UI mirror types | UI adapter |
| Cache e snapshot location | Persistence adapter |
| HTTP, CLI e MCP envelope | Transport/interface adapter |
| React Flow node/edge state | UI adapter |

## Current C01 Evidence Mapping

La mappatura seguente classifica le responsabilità osservate nella baseline
sorgente. Non prescrive modifiche.

| Evidenza C01 osservata | Valutazione boundary |
| --- | --- |
| `RepositoryIntelligenceDataInteraction` | Candidato facts-only, subordinato a provenienza ed evidenza |
| Campi strutturali di `RepositoryIntelligenceModuleSnapshot` | Parzialmente nel boundary |
| `productPotential`, `libraryPotential`, `riskComplexity` | Esclusi |
| Campi strutturali di `RepositoryIntelligenceModuleView` | Parzialmente nel boundary |
| `clusterIds` e campi `*Score` del module view | Esclusi |
| `RepositoryIntelligenceLogicalCluster` | Escluso: proiezione |
| `RepositoryIntelligenceClusterView` | Escluso: proiezione |
| `StandaloneCandidate` | Escluso: Company OS policy |
| `ProductCandidate` e relative explanation/ranking | Esclusi |
| `ExtractionBoundary` | Escluso: recommendation/planning |
| `ProductProposal` e `ProductTemplateType` | Esclusi |
| `RepositoryIntelligenceSnapshot` | Contenitore misto, non boundary canonico |
| `RepositoryIntelligenceState` | Stato applicativo misto, non boundary canonico |
| `summary` e promising areas | Esclusi: aggregazione e product policy |
| `source`, `repoPath`, `snapshotFile`, `generatedAt` | Evidenza di provenance esistente, ma non forma canonica approvata |
| Tipi mirror `UIRepositoryIntelligence*` | Esclusi: adapter UI |

## Fact versus Projection Rules

1. Un import esplicito è un fatto; il grafo degli import è una proiezione.
2. Una dipendenza dichiarata è un fatto; la centralità del modulo è
   un'inferenza.
3. Un simbolo esportato è un fatto; il suo valore di riuso è una valutazione.
4. Una tabella dichiarata è un fatto; la maturità del data layer è una
   valutazione.
5. Un read/write sostenuto da evidenza è un fatto; un data flow aggregato è una
   proiezione.
6. Un insieme di moduli osservati è un fatto; un logical cluster è
   un'inferenza.
7. L'uso osservato di un boundary è un fatto; la categoria “consumer
   strategico” è una policy.
8. L'assenza di un riferimento in uno scan parziale non dimostra che il
   riferimento non esista.

## Architectural Invariants

### MB-I01 — Facts Only

Il contract contiene esclusivamente osservazioni verificabili. Inferenze e
policy sono vietate.

### MB-I02 — Mandatory Provenance

Nessun fatto è canonico senza baseline, provider, scope e localizzazione
dell'evidenza.

### MB-I03 — Domain Neutrality

Il contract non contiene tassonomie, workflow o tipi Company OS, CurManLight o
DocenteDoc.

### MB-I04 — Technology Neutrality

La semantica non dipende da TypeScript, React, MCP, HTTP, Git o da un database.

### MB-I05 — Provider Neutrality

Nessun provider di discovery, AST, search o filesystem è canonico.

### MB-I06 — Deterministic Meaning

Lo stesso fatto mantiene identità e semantica a parità di baseline, scope ed
evidenza, indipendentemente dal consumer.

### MB-I07 — Explicit Observation Scope

Completezza, filtri e limiti dell'osservazione sono dichiarati. L'assenza non è
interpretata oltre lo scope.

### MB-I08 — Stable Fact Semantics

Un consumer può cambiare algoritmo di clustering, scoring o proiezione senza
modificare la semantica dei facts.

### MB-I09 — No Canonical I/O

Serializzazione, cache, database, filesystem e trasporto non appartengono al
contract.

### MB-I10 — No Parallel Canonical Model

Gli adapter possono esporre view model, ma non possono diventare una seconda
sorgente canonica dei fatti.

### MB-I11 — Directional Derivation

Le proiezioni consumano facts. Nessuna proiezione può riscrivere retroattivamente
la verità osservata.

### MB-I12 — Versionable Contract

La semantica del contract deve poter essere versionata senza dipendere dal
lifecycle di un adapter o provider.

## Allowed Dependencies

Sono consentite esclusivamente dipendenze concettuali verso:

- tipi e identificatori neutrali del contract;
- riferimenti tra fact families;
- metadata di provenance;
- schema/version identity del contract.

Un provider può dipendere dal contract per produrre facts. Un consumer può
dipendere dal contract per indicizzare o proiettare facts.

## Forbidden Dependencies

Il Metadata Contract non può dipendere da:

- Company OS, CurManLight o DocenteDoc domain;
- scoring, ranking o recommendation engine;
- cluster o graph projection model;
- UI framework, React o React Flow;
- CLI, HTTP, MCP o altri transport;
- filesystem, process execution o Git runtime;
- database, cache, JSON file layout o browser storage;
- AST engine o linguaggio sorgente specifico;
- path locale hardcoded;
- copy o stato di presentazione.

## Responsibility Boundaries

| Responsabilità | Owner concettuale |
| --- | --- |
| Osservare repository e workspace | Discovery provider |
| Analizzare sintassi e simboli | Source/AST provider |
| Produrre facts conformi | Provider |
| Definire semantica canonica dei facts | Metadata Contract |
| Persistenza e serializzazione | Persistence adapter |
| Indicizzazione | Search/Index |
| Aggregazione dependency graph | Graph Projection |
| Clustering e capability grouping | Projection/interpretation layer |
| Scoring e recommendation | Application/policy layer |
| Rendering | UI adapter |
| Trasporto | CLI/API/MCP adapter |

## Boundary Acceptance Criteria

EP-01 soddisfa il proprio scopo quando:

- componente e responsabilità sono identificati;
- inclusioni ed esclusioni sono esplicite;
- input e output sono definiti semanticamente;
- facts e projections sono separati;
- invarianti e dipendenze sono verificabili;
- C01 è mappato senza promuoverlo o modificarlo;
- nessuna tecnologia o struttura di implementazione è prescritta;
- le assunzioni sono dichiarate;
- le questioni irrisolte sono registrate.

## Preparation State After EP-01

```text
EP-01 = Complete
EP-03 = Eligible, not started
EP-04 = Blocked by EP-03
EP-02 = Blocked by EP-03 and EP-04
EP-05 = Blocked by EP-02, EP-03 and EP-04
EP-06 = Blocked by prior preparation evidence
ERA-002 = Not eligible
T1 = Not authorized
TECHNICAL_EXECUTION = Not authorized
IMPLEMENTATION_AUTHORITY = None
```

## Open Questions

1. Quale identità neutrale distingue lo stesso repository tra clone, worktree e
   mirror?
2. Quali regole di normalizzazione rendono confrontabili le localizzazioni
   logiche senza rendere canonico un path locale?
3. Quale granularità di provenance deve essere obbligatoria per ogni fact e
   quale può essere condivisa dall'observation set?
4. Come viene dichiarata la completezza per provider che osservano soltanto una
   parte del repository?
5. Quale politica di schema versioning sarà resa vincolante dal Compatibility
   Contract?
6. Quali consumer osservati dipendono oggi da campi esclusi e richiedono quindi
   un adapter di compatibilità?

