# EP-03 — Metadata Contract Consumer Inventory

## Assumptions

- CAD-001 è `Approved`.
- CAD-002 è `Approved`.
- ERA-001 ha esito `NO GO`.
- Extraction Preparation è `Open`.
- EP-01 è `Complete` e approvato.
- Il Metadata Contract è il boundary facts-only definito da EP-01.
- C01 mantiene classificazione ERDD `Adapt`.
- La baseline sorgente verificata è
  `7b55c4eb4327bbea772435241b24171d5a5415a6`.
- Il worktree sorgente osservato è clean.
- L'inventario riguarda consumer realmente osservati nel codice della baseline.
- L'esistenza di un import non implica conformità al boundary EP-01.
- `Implementation Authority = None`.
- `Technical Execution = Not authorized`.

## Inventory Record

| Campo | Valore |
| --- | --- |
| Deliverable | EP-03 |
| Titolo | Metadata Contract Consumer Inventory |
| Status | Complete |
| Phase | Extraction Preparation |
| Boundary source | EP-01 — Metadata Boundary Specification |
| Source candidate | C01 — Repository Intelligence metadata contracts |
| Repository examined | company-os |
| Observation method | Static code inspection, import search and field-usage inspection |
| Implementation authority | None |

## Inventory Scope

L'inventario identifica:

- producer e normalizer dei facts oggi contenuti in C01;
- consumer diretti dei tipi C01;
- consumer indiretti tramite engine, API e UI mirror;
- test che costruiscono o verificano il contratto corrente;
- campi facts-only effettivamente consumati;
- dipendenze da campi esclusi da EP-01;
- superfici pubbliche che possono nascondere consumer non osservati.

Non vengono classificati come consumer:

- file che contengono soltanto la stringa `repository-intelligence`;
- navigation surface, capability flag o copy omonimi;
- componenti che non ricevono dati C01;
- futuri consumer ipotetici del Repository Intelligence Core.

## Observed Inventory Summary

| Categoria osservata | Conteggio |
| --- | ---: |
| Importatori backend di produzione dei tipi C01 | 10 |
| File backend di test con import diretto C01 | 6 |
| Consumer UI di produzione del mirror C01 | 7 |
| Suite UI correlate al mirror C01 | 6 |
| Public type export surface | 1 |
| Transport boundary osservato | 1 |
| UI mirror canonico osservato | 1 |

I conteggi descrivono file e superfici osservate, non consumer organizzativi
univoci. Un singolo consumer logico può attraversare più file.

## Consumer Classification

### Classification Legend

| Classe | Significato |
| --- | --- |
| Producer | Produce facts o contenitori che includono facts |
| Normalizer | Trasforma osservazioni in una struttura consumabile |
| Facts consumer | Usa campi inclusi da EP-01 |
| Mixed consumer | Usa sia facts EP-01 sia campi esclusi |
| Policy consumer | Usa prevalentemente score, candidate, cluster o recommendation |
| Adapter consumer | Trasporta, duplica o presenta il contratto corrente |
| Test consumer | Costruisce o verifica forme del contratto |
| Export surface | Espone il tipo senza consumarne il comportamento |

## Backend Production Consumers

| ID | Consumer osservato | Relazione | Dati facts-only usati | Dati esclusi usati | Classificazione |
| --- | --- | --- | --- | --- | --- |
| CI-01 | `AnalysisSnapshotLoader` | Legge snapshot persistiti e li restituisce all'engine | module snapshots; data interactions; baseline timestamp | logical clusters; standalone candidates; summary product areas | Producer adapter / Mixed |
| CI-02 | `RepositoryIntelligenceEngine` | Produce live state e normalizza snapshot | module identity/path; entities; dependencies; data interactions; stores; tables | score; clusters; candidate generation; promising areas; cache metadata | Producer + Normalizer / Mixed |
| CI-03 | `ProductCandidateEngine` | Deriva candidate, template, explanation e ranking | module identity/path; dependencies; entities; stores; tables | product/library/risk score; cluster IDs; candidate vocabulary | Policy consumer / Mixed |
| CI-04 | `IntentMatchingEngine` | Classifica intent e propone extraction boundary | module identity/path; dependencies; entities; stores; tables | candidates; cluster IDs; score; explanation; recommendation rationale | Policy consumer / Mixed |
| CI-05 | `ProductProposalEngine` | Produce proposal da candidate | Nessun consumo diretto necessario del facts-only boundary | ProductCandidate; ProductTemplateType; ProductProposal | Policy consumer |
| CI-06 | `ClusterAssigner` | Assegna candidate a cluster | Nomi e path incorporati nelle candidate | ProductCandidate; candidate reasons e product semantics | Projection/policy consumer |
| CI-07 | `ClusterMapBuilder` | Aggrega candidate in cluster map | Nessun fact canonico consumato direttamente | ProductCandidate e cluster assignment | Projection consumer |
| CI-08 | `analysis.routes` | Espone state, intent, boundary, proposal e workflow HTTP | Facts transitivi presenti nello state | candidates; score; cluster map; extraction recommendation; proposal | Transport/application adapter / Mixed |
| CI-09 | `composeSpecialistDecisionBrief` | Produce brief applicativo | Nessuno | `promisingProductAreas` e interpretazione prodotto | Policy consumer |
| CI-10 | `analysis/index` | Riesporta tipi e API analysis | Espone tipi strutturali correnti | Espone anche candidate, ranking, boundary e proposal | Export surface / Mixed |

## UI Production Consumers

| ID | Consumer osservato | Relazione | Dati facts-only usati | Dati esclusi usati | Classificazione |
| --- | --- | --- | --- | --- | --- |
| CI-11 | `ui/types` | Definisce mirror manuale del contratto backend | module path, entities, dependencies, data artifacts | score, cluster, candidates, promising areas | Adapter contract mirror / Mixed |
| CI-12 | `useRepositoryIntelligence` | Legge `/api/analysis/latest` e conserva lo state UI | Trasporta l'intero payload senza interpretazione | Trasporta anche tutti i campi esclusi | Transport/UI adapter / Mixed |
| CI-13 | `productDiscovery` | Costruisce repository summary e product ideas | repo path; internal/external dependencies; stores | product candidates; kind; score; ranking; explanation | Application consumer / Mixed |
| CI-14 | `productFactory` | Alimenta discovery e factory buckets | Consumo transitivo tramite `productDiscovery` | Product ideas e candidate ranking | Application consumer / Indirect |
| CI-15 | `RepositoryIntelligencePanel` | Presenta stato e azioni repository intelligence | generatedAt; source; module count fallback | candidates; clusters; promising areas; snapshot label | UI adapter / Mixed |
| CI-16 | `ChatPanel` | Riceve e propaga repository intelligence UI state | Nessun uso facts-only diretto osservato | Pass-through verso superfici applicative | UI adapter / Indirect |
| CI-17 | `JarvisSpecialistAnalysisSummary` | Presenta un segnale repository sintetico | Nessuno | promising product areas e fallback applicativo | UI/policy consumer |

## Test Consumers

### Backend

| Suite | Relazione verificata |
| --- | --- |
| `AnalysisSnapshotLoader.test` | Lettura snapshot e merge di standalone candidates |
| `RepositoryIntelligenceEngine.test` | Produzione state, module dependencies, stores, tables, cluster e score |
| `ProductCandidateEngine.test` | Derivazione candidate, ranking, explanation e aggregazione module view |
| `IntentMatchingEngine.test` | Intent ranking ed extraction boundary |
| `analysis.routes.test` | Risposte API, live state, intent e boundary |
| `analysis.routes.e2e.test` | Flusso proposal/promotion/materialization |
| `composeSpecialistDecisionBrief.test` | Uso di promising product areas e soppressione raw facts |

Solo sei suite importano direttamente tipi C01; `AnalysisSnapshotLoader.test` e
`RepositoryIntelligenceEngine.test` esercitano inoltre il contratto tramite
inferenza dei tipi o API concrete.

### UI

| Suite | Relazione verificata |
| --- | --- |
| `productDiscovery.test` | Product idea derivata da state UI misto |
| `productFactory.test` | Factory buckets derivati dal discovery context |
| `productFactory.evolution.test` | Evoluzione deterministica del product factory input |
| `useProductDiscovery.test` | Hook consumer di repository intelligence state |
| `JarvisSpecialistAnalysisSummary.test` | Presentazione di promising areas e soppressione raw metrics |
| `guardrails.flow.test` | Fixture repository intelligence nel workflow applicativo |

Queste suite sono evidenza di compatibility behavior del sistema sorgente. Non
sono characterization baseline del Metadata Contract facts-only.

## Fact-Family Consumer Matrix

| Fact family EP-01 | Producer/normalizer osservato | Consumer diretto osservato | Consumer indiretto osservato |
| --- | --- | --- | --- |
| Repository Observation | RepositoryIntelligenceEngine; AnalysisSnapshotLoader | analysis.routes | hook/UI panel |
| Source Unit Fact | RepositoryIntelligenceEngine | ProductCandidateEngine; IntentMatchingEngine | productDiscovery; UI panel |
| Symbol Fact | Snapshot analyzer upstream; RepositoryIntelligenceEngine summary | Nessun consumer facts-only diretto verificato | UI usa soltanto conteggio aggregato |
| Reference Fact | RepositoryIntelligenceEngine live scan | Nessun consumer tipizzato autonomo | confluisce nelle dependency lists |
| Dependency Fact | RepositoryIntelligenceEngine | ProductCandidateEngine; IntentMatchingEngine | productDiscovery |
| Data Artifact Fact | Snapshot/live engine | ProductCandidateEngine; IntentMatchingEngine | productDiscovery scoring |
| Data Interaction Fact | AnalysisSnapshotLoader; RepositoryIntelligenceEngine | RepositoryIntelligenceEngine | candidate/policy consumers |
| Provenance | Loader ed engine espongono frammenti | analysis.routes | hook e UI panel |

La matrice mostra due lacune del contratto corrente:

1. Symbol e Reference non hanno consumer autonomi tipizzati; sono compressi in
   conteggi o dependency lists.
2. Provenance è distribuita tra `source`, `repoPath`, `snapshotFile` e
   `generatedAt`, senza una forma canonica condivisa.

Queste sono osservazioni sul consumo, non richieste di implementazione.

## Current Field Dependency Matrix

### Fields compatible with EP-01 semantics

| Campo corrente | Consumer osservati |
| --- | --- |
| module `name` e `path` | Engine; ProductCandidateEngine; IntentMatchingEngine; productDiscovery |
| `primaryEntities` | Engine; ProductCandidateEngine; IntentMatchingEngine |
| `internalDependencies` | Engine; ProductCandidateEngine; IntentMatchingEngine; productDiscovery |
| `externalDependencies` | Engine; productDiscovery |
| `jsonReads` / `jsonWrites` | Engine; candidate aggregation |
| `dbReads` / `dbWrites` | Engine; candidate aggregation |
| `stores` / `tables` | Engine; ProductCandidateEngine; IntentMatchingEngine; productDiscovery |
| data interaction `reads` / `writes` | Engine normalization |
| data interaction `dbReads` / `dbWrites` | Engine normalization |
| `generatedAt` | Loader; engine; UI panel |

La compatibilità semantica è preliminare: EP-04 dovrà stabilire se identità,
cardinalità, optionality e provenance correnti possono essere preservate.

### Fields excluded by EP-01 but required by current consumers

| Campo corrente escluso | Consumer osservati |
| --- | --- |
| `productPotentialScore` | Engine; ProductCandidateEngine; candidate ranking |
| `libraryPotentialScore` | Engine; ProductCandidateEngine |
| `riskComplexityScore` | ProductCandidateEngine |
| `clusterIds` | Engine; ProductCandidateEngine; IntentMatchingEngine |
| `logicalClusters` / `clusters` | Engine; UI panel |
| `standaloneCandidates` / `candidates` | Engine; policy engines; API; discovery; UI |
| `promisingProductAreas` | Jarvis brief; hooks; UI panel |
| `promisingLibraryAreas` | Engine/UI payload |
| candidate explanation/ranking | API; productDiscovery; UI |
| `ExtractionBoundary` | IntentMatchingEngine; API |
| `ProductProposal` | ProductProposalEngine; API workflow |

Questi consumer non diventano consumer canonici del Metadata Contract. EP-04
dovrà descrivere la compatibilità tramite projection, policy o adapter
boundaries senza trasferire i campi esclusi nel Core contract.

## Transport and Serialization Exposure

### Backend public surface

`analysis/index` riesporta una selezione ampia di tipi C01. Questa superficie
consente consumo interno o esterno senza importare direttamente il file
sorgente. Nel repository esaminato non sono stati trovati ulteriori consumer
del re-export per i tipi C01.

### HTTP surface

`/api/analysis/latest` restituisce il `RepositoryIntelligenceState` corrente.
Il payload unisce facts, projections, policy e persistence metadata.

L'endpoint è un adapter consumer del contratto corrente, non prova che l'intero
payload appartenga al boundary EP-01.

### UI mirror

`UIRepositoryIntelligenceState` e tipi correlati duplicano manualmente parte
del modello backend. Il mirror include facts e campi esclusi.

Il mirror è un consumer di compatibilità ad alto impatto, ma non è una sorgente
canonica alternativa secondo MB-I10.

### Persisted snapshots and cache

`AnalysisSnapshotLoader` legge snapshot JSON; `RepositoryIntelligenceEngine`
legge e scrive cache live. Snapshot e cache sono persistence artifacts, non
consumer semantici autonomi. La loro forma osservata costituisce comunque
evidenza di compatibilità per EP-04.

## Consumer Criticality

| Livello | Consumer |
| --- | --- |
| Alto | RepositoryIntelligenceEngine; analysis.routes; UI type mirror; useRepositoryIntelligence; RepositoryIntelligencePanel |
| Medio | AnalysisSnapshotLoader; ProductCandidateEngine; IntentMatchingEngine; productDiscovery; productFactory |
| Basso rispetto ai facts-only | ProductProposalEngine; ClusterAssigner; ClusterMapBuilder; Jarvis brief; Jarvis UI summary |

La criticità misura la propagazione di una futura variazione del boundary, non
il valore applicativo del consumer.

## Compatibility Exposure

### Exposure E1 — Mixed canonical and policy state

Il principale state backend e il mirror UI contengono facts e policy nello
stesso oggetto.

### Exposure E2 — Manual UI mirror

Backend e UI mantengono forme parallele. Una variazione semantica può divergere
senza un errore di import diretto.

### Exposure E3 — Public re-export

Il re-export da `analysis/index` rende possibili consumer esterni non rilevabili
dal solo repository sorgente.

### Exposure E4 — Persisted shapes

Snapshot e cache possono agire come consumer storici dello schema anche quando
nessun file TypeScript li importa.

### Exposure E5 — Facts used as policy signals

Dependency, store e table facts alimentano scoring, candidate, intent matching
e product discovery. Questi consumer devono preservare il comportamento
applicativo senza rendere canonica la loro interpretazione.

## Inventory Completeness Statement

L'inventario è completo rispetto a:

- import e riferimenti TypeScript osservabili nella baseline locale;
- consumer backend e UI presenti nel repository `company-os`;
- endpoint e persisted shapes identificati dal codice;
- test direttamente o transitivamente collegati allo state corrente.

L'inventario non può attestare:

- consumer esterni del package o dei re-export pubblici;
- script non presenti nella baseline;
- lettori esterni dei file snapshot/cache;
- consumer dinamici non identificabili tramite codice statico;
- dipendenze organizzative non registrate nel repository.

Questi limiti non sono compensati con inferenze.

## Consumer Inventory Outcome

```text
BOUNDARY = EP-01 Metadata Contract
OBSERVED_PRODUCTION_CONSUMERS = 17 files/surfaces
OBSERVED_TEST_RELATIONS = 13 suites
DIRECT_FACTS_ONLY_CONSUMERS = 0 verified
MIXED_OR_ADAPTER_CONSUMERS = Present
POLICY_ONLY_CONSUMERS = Present
EXTERNAL_CONSUMERS = Unknown
CONSUMER_INVENTORY = Complete within declared scope
```

`DIRECT_FACTS_ONLY_CONSUMERS = 0 verified` non significa che i facts non siano
usati. Significa che ogni consumer di produzione osservato riceve oggi una
forma mista o dati privi della provenance canonica richiesta da EP-01.

## Preparation State After EP-03

```text
EP-01 = Complete
EP-03 = Complete
EP-04 = Eligible, not started
EP-02 = Blocked by EP-04
EP-05 = Blocked by EP-02 and EP-04
EP-06 = Blocked by prior preparation evidence
ERA-002 = Not eligible
T1 = Not authorized
TECHNICAL_EXECUTION = Not authorized
IMPLEMENTATION_AUTHORITY = None
```

## Open Questions

1. Esistono consumer esterni del re-export pubblico `analysis/index` non
   presenti nel repository esaminato?
2. Esistono processi esterni che leggono direttamente snapshot o cache
   Repository Intelligence?
3. Quali persisted shapes devono essere considerate compatibili e per quanto
   tempo?
4. Il Compatibility Contract deve preservare il payload HTTP misto oppure
   soltanto i comportamenti osservabili dei consumer correnti?
5. Come deve essere rappresentata la provenance canonica senza rendere
   incompatibili i consumer che oggi usano `repoPath`, `snapshotFile` e
   `generatedAt`?
6. Quali campi facts-only richiedono cardinalità o optionality diverse per
   supportare provider parziali?

