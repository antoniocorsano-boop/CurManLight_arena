# EP-02 — Metadata Contract Characterization Baseline Specification

## Assumptions

- CAD-001 è `Approved`.
- CAD-002 è `Approved`.
- ERA-001 ha esito `NO GO`.
- Extraction Preparation è `Open`.
- EP-01 è `Complete` e approvato.
- EP-03 è `Complete` e approvato.
- EP-04 è `Complete` e approvato.
- Il Metadata Contract è il boundary facts-only definito da EP-01.
- La Compatibility Surface tutela esclusivamente i consumer verificati da
  EP-03.
- La policy approvata è `Equivalenza graduata per tipo di comportamento`.
- Questa specifica descrive test futuri, ma non contiene test eseguibili.
- `Implementation Authority = None`.
- `Technical Execution = Not authorized`.

## Specification Record

| Campo | Valore |
| --- | --- |
| Deliverable | EP-02 |
| Titolo | Metadata Contract Characterization Baseline Specification |
| Status | Complete |
| Phase | Extraction Preparation |
| Canonical boundary | EP-01 |
| Consumer inventory | EP-03 |
| Compatibility contract | EP-04 |
| Equivalence policy | Graduated equivalence |
| Approval evidence | Opzione 1 approvata esplicitamente dall'autorità di governance |
| Implementation authority | None |

## Characterization Principle

> La baseline preserva esclusivamente comportamenti osservati e necessari ai
> consumer verificati. Facts e provenance richiedono equivalenza semantica
> esatta; projection, ordinamento e superfici applicative richiedono il livello
> minimo di equivalenza dimostrato dal consumo reale.

La baseline non congela:

- l'intero `RepositoryIntelligenceState`;
- campi non consumati;
- ordine non osservato;
- dettagli interni degli algoritmi;
- formato byte-for-byte di snapshot o cache;
- consumer non verificati;
- tecnologie o strutture di implementazione.

## Baseline Responsibilities

EP-02 specifica:

1. scenari da caratterizzare;
2. fixture concettuali;
3. consumer coperti;
4. input e precondizioni;
5. output o comportamento osservabile;
6. livello di equivalenza;
7. negative guarantees;
8. casi limite;
9. evidenza sorgente della baseline.

EP-02 non:

- crea test automatizzati;
- prescrive un test framework;
- definisce file o package;
- modifica consumer o producer;
- autorizza estrazione;
- sceglie una strategia di migrazione;
- dichiara `GO` per ERA-002.

## Equivalence Levels

### EQ-1 — Exact Semantic Equivalence

Richiede uguaglianza di significato per:

- fact identity quando definita;
- valore osservato;
- relazione tra facts;
- provenance;
- observation scope;
- status o errore normativo;
- discriminanti usati dal consumer.

Non implica byte identity o una specifica serializzazione.

### EQ-2 — Set Equivalence

Richiede gli stessi elementi, senza vincolo di ordine, quando:

- la collezione rappresenta facts;
- il consumer non usa la posizione;
- nessuna baseline osservata rende l'ordine significativo.

Duplicati e omissioni non sono equivalenti.

### EQ-3 — Ordered Equivalence

Richiede stessi elementi nello stesso ordine soltanto quando:

- il consumer usa direttamente la prima o la posizione;
- una baseline osservata verifica il ranking;
- l'ordine modifica il ramo o l'output applicativo.

### EQ-4 — Behavioral Equivalence

Richiede lo stesso risultato osservabile, per esempio:

- stesso ramo;
- stesso candidato vincitore;
- stessa classe di fallback;
- stessa disponibilità di una superficie;
- stessa decisione di includere o sopprimere un output.

Non richiede identità dell'intero oggetto.

### EQ-5 — Negative Equivalence

Richiede che un comportamento vietato resti assente:

- nessun fact inventato;
- nessuna inferenza nel Canonical Contract;
- nessuna esposizione vietata;
- nessuna alterazione dei facts da parte di projection o adapter;
- nessuna garanzia estesa a consumer sconosciuti.

## Conceptual Fixture Catalog

Le fixture sono descrizioni normative. Non sono file né test.

### FX-01 — Minimal Repository

Repository con:

- baseline identificabile;
- manifest;
- una source unit;
- un simbolo esportato;
- nessuna dipendenza o data artifact.

### FX-02 — Dependency Repository

Repository con:

- due moduli interni;
- un import interno risolvibile;
- una dipendenza esterna dichiarata;
- valore letterale e target risolto distinguibili.

### FX-03 — Data Repository

Repository con:

- store osservato;
- tabella dichiarata;
- read e write;
- modulo che produce le interazioni;
- evidenza localizzabile.

### FX-04 — Composite Modules

Repository con:

- moduli `workspace` e `ui`;
- dipendenza fra moduli;
- entity distinte;
- data artifact condiviso;
- projection candidate composita osservabile.

### FX-05 — Partial Observation

Observation scope limitato da:

- directory inclusa;
- limite di profondità o quantità;
- provider incapace di osservare una fact family;
- completezza dichiarata come parziale.

### FX-06 — Dated Snapshot Pair

Due snapshot enriched datati e snapshot compact corrispondenti, con:

- un enriched più recente;
- candidate compact associata;
- snapshot precedente differente.

### FX-07 — Root Snapshot Fallback

Assenza di snapshot datati e presenza delle forme root enriched e compact.

### FX-08 — Missing Snapshot

Assenza di ogni snapshot supportato.

### FX-09 — Insufficient Provenance

Osservazione con valore plausibile ma priva di baseline, provider, scope o
evidenza sufficiente.

### FX-10 — Repository Intelligence API State

State compatibile contenente:

- source e provenance labels;
- module facts;
- projection cluster;
- candidate e ranking;
- summary applicativo.

### FX-11 — Accessory Service Failure

State valido con failure di un servizio accessorio non appartenente al
Metadata Contract.

### FX-12 — Empty Compatibility State

State con collezioni vuote e assenza di promising areas, senza errore di
trasporto.

### FX-13 — Missing Candidate

State valido privo del candidate richiesto.

### FX-14 — UI Repository State

Mirror UI dello state con:

- repository path;
- module dependencies;
- candidate prodotto;
- promising areas;
- loading, data ed error state distinguibili.

## Canonical Fact Scenarios

| ID | Fixture | Consumer/Boundary | Observable atteso | Equivalenza |
| --- | --- | --- | --- | :---: |
| CF-01 | FX-01 | Canonical Contract | Baseline, provider e scope sono presenti | EQ-1 |
| CF-02 | FX-01 | Canonical Contract | Source unit e symbol fact sono distinguibili | EQ-1 |
| CF-03 | FX-02 | Canonical Contract | Import letterale e target risolto restano distinti | EQ-1 |
| CF-04 | FX-02 | Canonical Contract | Internal ed external dependency contengono gli stessi facts | EQ-2 |
| CF-05 | FX-03 | Canonical Contract | Store e table sono data artifact separati | EQ-2 |
| CF-06 | FX-03 | Canonical Contract | Read e write conservano direzione, source ed evidence | EQ-1 |
| CF-07 | FX-04 | Canonical Contract | Facts dei moduli restano separati dalla candidate composita | EQ-5 |
| CF-08 | FX-05 | Canonical Contract | Scope è dichiarato parziale | EQ-1 |
| CF-09 | FX-05 | Canonical Contract | Fact assente fuori scope non diventa dichiarazione di inesistenza | EQ-5 |
| CF-10 | FX-09 | Canonical Contract | Il valore privo di provenance non diventa fact canonico | EQ-5 |
| CF-11 | FX-01–FX-05 | Projection Layer | Una projection non modifica facts o provenance | EQ-5 |
| CF-12 | FX-01–FX-05 | Adapter Layer | Serializzazione e trasporto non cambiano la semantica dei facts | EQ-1 |

## Legacy Input Compatibility Scenarios

| ID | Fixture | Consumer EP-03 | Observable atteso | Equivalenza |
| --- | --- | --- | --- | :---: |
| LI-01 | FX-06 | CI-01 AnalysisSnapshotLoader | Viene selezionato lo snapshot enriched datato più recente | EQ-1 |
| LI-02 | FX-06 | CI-01 | Candidate compact corrispondenti sono disponibili alla Compatibility Surface | EQ-2 |
| LI-03 | FX-07 | CI-01 | In assenza dei datati viene usato lo snapshot root enriched | EQ-4 |
| LI-04 | FX-07 | CI-01 | Candidate root compact sono disponibili alla Compatibility Surface | EQ-2 |
| LI-05 | FX-08 | CI-01/CI-02 | L'assenza degli snapshot produce assenza esplicita, non facts inventati | EQ-5 |
| LI-06 | FX-09 | Legacy Input Adapter | Mapping incompleto resta dichiarato incompleto | EQ-5 |
| LI-07 | FX-06/FX-07 | CI-02 | Il persisted path resta compatibility metadata, non provenance canonica | EQ-5 |

## Repository State and Projection Scenarios

| ID | Fixture | Consumer EP-03 | Observable atteso | Equivalenza |
| --- | --- | --- | --- | :---: |
| RP-01 | FX-02 | CI-02 RepositoryIntelligenceEngine | State segnala `live-repo` per l'analisi live | EQ-1 |
| RP-02 | FX-02 | CI-02/CI-03/CI-04 | Internal ed external dependencies rimangono disponibili | EQ-2 |
| RP-03 | FX-03 | CI-02/CI-03/CI-04 | Store, table, read e write rimangono disponibili | EQ-2 |
| RP-04 | FX-04 | CI-03 ProductCandidateEngine | Candidate composita conserva i source module osservati | EQ-2 |
| RP-05 | FX-04 | CI-03 | Candidate composita aggrega entity e data artifact osservati | EQ-2 |
| RP-06 | FX-10 | CI-03 | Candidate al primo posto resta al primo posto quando la baseline lo osserva | EQ-3 |
| RP-07 | FX-10 | CI-03 | Ranking reason osservata resta semanticamente equivalente | EQ-4 |
| RP-08 | FX-10 | CI-03 | Reuse benefit conserva i valori esatti dove la baseline li confronta | EQ-1 |
| RP-09 | FX-10 | CI-02/CI-03 | Scoring disabilitato produce score identici alla baseline non adattiva | EQ-1 |
| RP-10 | FX-10 | CI-02/CI-03 | Scoring adattivo conserva il limite di variazione osservato | EQ-1 |
| RP-11 | FX-10 | CI-04 IntentMatchingEngine | Lo stesso intent mantiene lo stesso candidate vincitore osservato | EQ-4 |
| RP-12 | FX-10 | CI-04 | Match valido resta sopra la soglia osservata | EQ-4 |
| RP-13 | FX-13 | CI-04 | Candidate assente produce boundary assente | EQ-4 |
| RP-14 | FX-04 | CI-04 | Boundary derivato contiene moduli e data artifact osservati | EQ-2 |
| RP-15 | FX-10 | CI-06/CI-07 | Cluster rimane projection e non compare nel Canonical Contract | EQ-5 |
| RP-16 | FX-10/FX-12 | CI-09 composeSpecialistDecisionBrief | Promising area e stato vuoto mantengono i rami applicativi osservati | EQ-4 |

I valori numerici di score sono exact soltanto negli scenari in cui la baseline
esistente li confronta esplicitamente. Negli altri scenari viene preservato il
risultato comportamentale osservato.

## API Compatibility Scenarios

| ID | Fixture | Consumer EP-03 | Observable atteso | Equivalenza |
| --- | --- | --- | --- | :---: |
| API-01 | FX-10 | CI-08 analysis.routes | `latest` restituisce status 200 con state compatibile | EQ-1 |
| API-02 | FX-08 | CI-08 | `latest` restituisce 404 e assenza esplicita dello snapshot | EQ-1 |
| API-03 | FX-10 | CI-08 | `repoPath` seleziona l'analisi del repository richiesto | EQ-4 |
| API-04 | FX-11 | CI-08 | Failure del servizio accessorio non modifica la risposta repository osservata | EQ-4 |
| API-05 | FX-11 | CI-08 | Dati accessori non richiesti non compaiono nel payload compatibile | EQ-5 |
| API-06 | FX-10 | CI-08 | Richiesta intent valida restituisce status 200 e match compatibili | EQ-4 |
| API-07 | FX-10 | CI-08 | Intent mancante restituisce status 400 | EQ-1 |
| API-08 | FX-08 | CI-08 | State mancante per intent restituisce status 404 | EQ-1 |
| API-09 | FX-13 | CI-08 | Candidate boundary mancante restituisce status 404 | EQ-1 |
| API-10 | FX-10 | CI-05 ProductProposalEngine; CI-08 | Candidate valido produce proposal compatibile | EQ-4 |
| API-11 | FX-13 | CI-08 | Candidate richiesto ma assente produce errore esplicito | EQ-1 |
| API-12 | FX-10 | CI-08 | Promote conserva la dipendenza dal candidate osservato | EQ-4 |

La baseline API riguarda status, rami e campi consumati. Non congela side
effect interni o campi non osservati.

## Public Surface Scenarios

| ID | Fixture | Consumer EP-03 | Observable atteso | Equivalenza |
| --- | --- | --- | --- | :---: |
| PS-01 | FX-10 | CI-10 analysis/index | I type re-export effettivamente osservati restano disponibili alla Compatibility Surface | EQ-1 |
## UI Compatibility Scenarios

| ID | Fixture | Consumer EP-03 | Observable atteso | Equivalenza |
| --- | --- | --- | --- | :---: |
| UI-01 | FX-14 | CI-12 useRepositoryIntelligence | Loading, data ed error restano stati distinti | EQ-4 |
| UI-02 | FX-14 | CI-12 | Repository selezionato viene rappresentato nella richiesta | EQ-4 |
| UI-03 | FX-14 | CI-13 productDiscovery | Dipendenze API-like continuano a produrre `hasApiLayer` | EQ-4 |
| UI-04 | FX-14 | CI-13/CI-14 | Candidate prodotto genera una repo-backed idea | EQ-4 |
| UI-05 | FX-14 | CI-13 | Product seed conserva il candidate name osservato | EQ-1 |
| UI-06 | FX-12 | CI-13/CI-14 | Assenza di evidenza repository attiva il fallback osservato | EQ-4 |
| UI-07 | FX-14 | CI-15 RepositoryIntelligencePanel | Source, timestamp e conteggi consumati restano presentabili | EQ-4 |
| UI-08 | FX-14 | CI-15 | Cluster e promising areas restano projection/policy output | EQ-5 |
| UI-09 | FX-14 | CI-16 ChatPanel | Il pass-through non altera lo state ricevuto | EQ-4 |
| UI-10 | FX-14 | CI-17 Jarvis summary | Promising area produce il repo signal osservato | EQ-4 |
| UI-11 | FX-12 | CI-17 | Assenza di promising areas produce il fallback osservato | EQ-4 |
| UI-12 | FX-14 | CI-17 | Raw module/symbol metrics e raw IDs restano non esposti | EQ-5 |
| UI-13 | FX-14 | CI-17 | Summary resta privo di azioni interattive osservate | EQ-5 |
| UI-14 | FX-14 | CI-11 UI type mirror | Campi, cardinalità e nullability effettivamente consumati restano compatibili | EQ-1 |

## Persistence and Cache Scenarios

| ID | Fixture | Consumer EP-03 | Observable atteso | Equivalenza |
| --- | --- | --- | --- | :---: |
| PC-01 | FX-02 | CI-02 RepositoryIntelligenceEngine | Richieste ripetute possono riusare lo state persistito osservato | EQ-4 |
| PC-02 | FX-02 | CI-02 | Il producer sorgente non viene rieseguito quando la cache valida è riusata | EQ-4 |
| PC-03 | FX-02 | CI-02 | Snapshot label resta stabile tra letture della stessa cache | EQ-1 |
| PC-04 | FX-02 | CI-02 | Cache conserva repository identity e source compatibility metadata | EQ-4 |
| PC-05 | FX-09 | Legacy Input Adapter | Cache priva di evidenza sufficiente non inventa provenance canonica | EQ-5 |

La baseline non richiede identità byte-for-byte della cache.

## Edge Cases

| ID | Caso limite | Comportamento da preservare | Equivalenza |
| --- | --- | --- | :---: |
| EC-01 | Observation scope parziale | Nessuna conclusione oltre lo scope | EQ-5 |
| EC-02 | Reference non risolta | Target letterale conservato; target risolto resta assente | EQ-1 |
| EC-03 | Collezione facts vuota | Vuoto distinto da observation non eseguita | EQ-1 |
| EC-04 | Facts duplicati dalla stessa evidence | Nessuna duplicazione semantica non dichiarata | EQ-2 |
| EC-05 | Projection unavailable | Facts restano invariati; failure esplicita nella superficie derivata | EQ-5 |
| EC-06 | Consumer sconosciuto | Nessuna garanzia implicita | EQ-5 |
| EC-07 | Campo legacy non usato | Nessun freeze automatico | EQ-5 |
| EC-08 | Ordinamento non osservato | Equivalenza per insieme, non posizione | EQ-2 |
| EC-09 | Timestamp differente su stessa baseline | Provenance temporale distinta da fact semantics | EQ-1 |
| EC-10 | Provider differente, stessa evidence | Facts semanticamente equivalenti con provenance distinta | EQ-1 |

## Negative Guarantees

La futura characterization deve dimostrare che:

1. cluster, score, candidate e recommendation non entrano nel Canonical
   Contract;
2. una projection non modifica facts o provenance;
3. un adapter non diventa sorgente canonica;
4. un input incompleto non genera facts inventati;
5. uno scope parziale non dimostra inesistenza;
6. un consumer non verificato non riceve garanzie implicite;
7. un formato persistito non diventa contract canonico;
8. il mirror UI non diventa modello parallelo canonico;
9. un errore accessorio non altera facts validi;
10. un cambio interno non viene dichiarato equivalente senza osservabili
    confrontabili.

## Scenario Traceability Matrix

| Gruppo | Scenari | Fixture principali | Consumer coperti | Livelli |
| --- | --- | --- | --- | --- |
| Canonical facts | CF-01–CF-12 | FX-01–FX-05, FX-09 | Canonical boundary, provider, adapter | EQ-1, EQ-2, EQ-5 |
| Legacy input | LI-01–LI-07 | FX-06–FX-09 | CI-01, CI-02 | EQ-1, EQ-2, EQ-4, EQ-5 |
| State/projection | RP-01–RP-15 | FX-02–FX-04, FX-10, FX-13 | CI-02–CI-07 | EQ-1–EQ-5 |
| API | API-01–API-12 | FX-08, FX-10, FX-11, FX-13 | CI-08 | EQ-1, EQ-4, EQ-5 |
| Public surface | PS-01 | FX-10 | CI-10 | EQ-1 |
| UI | UI-01–UI-14 | FX-12, FX-14 | CI-11–CI-17 | EQ-1, EQ-4, EQ-5 |
| Persistence/cache | PC-01–PC-05 | FX-02, FX-09 | CI-01, CI-02 | EQ-1, EQ-4, EQ-5 |
| Edge cases | EC-01–EC-10 | Trasversali | Tutti quelli applicabili | EQ-1, EQ-2, EQ-5 |

## Evidence Sources

| Evidenza osservata | Scenari supportati |
| --- | --- |
| AnalysisSnapshotLoader test | LI-01–LI-05 |
| RepositoryIntelligenceEngine test | RP-01–RP-05, RP-09–RP-10, PC-01–PC-04 |
| ProductCandidateEngine test | RP-04–RP-08 |
| IntentMatchingEngine test | RP-11–RP-14 |
| analysis.routes test | API-01, API-03–API-12 |
| analysis.routes E2E test | Proposal e promote behavior |
| productDiscovery test | UI-03–UI-06 |
| productFactory test/evolution test | UI-04, UI-06 |
| useProductDiscovery test | UI state consumption |
| Jarvis summary test | UI-10–UI-13 |
| composeSpecialistDecisionBrief test | Policy summary e negative raw-signal behavior |
| EP-01 invariants | CF e negative guarantees |
| EP-03 inventory | Consumer scope CI-01–CI-17 |
| EP-04 contract | Compatibility obligations e failure rules |

Queste fonti sono evidenza per la specifica. EP-02 non dichiara che una futura
suite eseguibile esista già.

## Future Executable Baseline Requirements

Quando T1 sarà autorizzato, ogni verifica eseguibile dovrà dichiarare:

- scenario ID EP-02;
- fixture materializzata;
- consumer ID EP-03;
- compatibility unit EP-04;
- observed input;
- expected observable;
- equivalence level;
- canonical/projection/compatibility versions;
- esito;
- eventuale rischio residuo.

Questa sezione definisce requisiti di tracciabilità, non un piano o una
autorizzazione.

## Baseline Acceptance Criteria

EP-02 soddisfa il proprio scopo quando:

- ogni fact family EP-01 ha almeno uno scenario;
- i consumer verificati EP-03 sono coperti;
- gli obblighi EP-04 sono traducibili in osservabili;
- equivalenza esatta e comportamentale sono distinte;
- ordinamento e score non vengono congelati oltre l'evidenza;
- empty state, errori e failure accessorie sono specificati;
- negative guarantees impediscono facts inventati;
- fixture e output rimangono concettuali;
- nessun test eseguibile o dettaglio implementativo è introdotto.

## Preparation State After EP-02

```text
EP-01 = Complete
EP-03 = Complete
EP-04 = Complete
EP-02 = Complete
EP-05 = Eligible, not started
EP-06 = Blocked by prior preparation evidence
ERA-002 = Not eligible
T1 = Not authorized
TECHNICAL_EXECUTION = Not authorized
IMPLEMENTATION_AUTHORITY = None
```

## Open Questions

1. Quale forma concreta assumerà l'identità canonica usata dagli scenari
   EQ-1?
2. Quali ordinamenti, oltre al candidate ranking già osservato, devono essere
   considerati normativi?
3. Quale versione iniziale verrà assegnata a Canonical Contract, projection e
   Compatibility Surface?
4. Quali persisted shapes riceveranno fixture materializzate durante T1?
5. I consumer esterni del public re-export o degli snapshot esistono e devono
   essere aggiunti prima di ERA-002?
6. Quale durata di supporto verrà assegnata alle Compatibility Surface?
7. Quali scenari richiederanno golden artifact e quali assertion semantiche
   durante la futura implementazione?

