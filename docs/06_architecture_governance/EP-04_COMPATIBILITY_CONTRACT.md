# EP-04 — Metadata Contract Compatibility Contract

## Assumptions

- CAD-001 è `Approved`.
- CAD-002 è `Approved`.
- ERA-001 ha esito `NO GO`.
- Extraction Preparation è `Open`.
- EP-01 è `Complete` e approvato.
- EP-03 è `Complete` e approvato.
- Il Metadata Contract è il boundary facts-only definito da EP-01.
- EP-03 ha verificato 17 consumer/superfici di produzione e 13 relazioni di
  test.
- EP-03 non ha verificato consumer di produzione facts-only puri.
- I consumer esterni non osservabili rimangono rischio residuo.
- La policy approvata è `Behavior-preserving compatibility surface`.
- `Implementation Authority = None`.
- `Technical Execution = Not authorized`.

## Contract Record

| Campo | Valore |
| --- | --- |
| Deliverable | EP-04 |
| Titolo | Metadata Contract Compatibility Contract |
| Status | Complete |
| Phase | Extraction Preparation |
| Canonical boundary | EP-01 — Metadata Boundary Specification |
| Consumer evidence | EP-03 — Consumer Inventory |
| Compatibility policy | Behavior-preserving compatibility surface |
| Approval evidence | Opzione 1 approvata esplicitamente dall'autorità di governance |
| Implementation authority | None |

## Normative Compatibility Principle

> Il Canonical Contract rimane facts-only. La Compatibility Surface preserva i
> comportamenti osservabili dei consumer verificati attraverso projection,
> policy e adapter separati. La compatibilità non rende canonico il modello
> misto corrente e non consente a una derivazione di modificare i facts.

## Compatibility Architecture

```text
Canonical Contract
    Facts + Provenance + Observation Scope
                    |
                    v
          Projection / Policy Layer
                    |
                    v
           Compatibility Surface
                    |
                    v
            Verified Consumers
```

La direzione inversa è vietata.

Per persisted input legacy è ammesso un percorso distinto:

```text
Legacy Persisted Shape
          |
          v
Legacy Input Adapter
          |
          v
Canonical Facts
```

Il Legacy Input Adapter può produrre un fact solo quando l'evidenza disponibile
soddisfa EP-01. Campi legacy non verificabili non diventano facts per
compatibilità.

## Layer 1 — Canonical Contract

Il Canonical Contract:

- contiene esclusivamente le fact families EP-01;
- conserva provenance e observation scope;
- è l'unica sorgente normativa dei facts;
- non incorpora strutture necessarie soltanto ai consumer legacy;
- non dipende da projection, policy, adapter o persistence;
- può evolvere indipendentemente dalle Compatibility Surface;
- non cambia semantica per preservare score, cluster o candidate.

### Canonical guarantees

| Garanzia | Regola |
| --- | --- |
| Fact semantics | Uno stesso fact conserva lo stesso significato tra consumer |
| Provenance | Ogni fact resta collegato a baseline, provider, scope ed evidenza |
| Observation scope | Completezza e parzialità non vengono perse |
| Facts-only | Nessuna inferenza viene promossa per ragioni di compatibilità |
| Directionality | Projection e adapter consumano facts e non li riscrivono |
| Neutrality | Nessun dominio o runtime applicativo diventa dipendenza canonica |

## Layer 2 — Compatibility Surface

La Compatibility Surface è un contratto non canonico destinato ai consumer
verificati da EP-03.

Può esporre:

- facts trasformati nella forma attesa dal consumer;
- projection e policy output;
- campi legacy ancora osservati;
- stati vuoti, errori e fallback compatibili;
- payload applicativi misti.

La Compatibility Surface non può:

- essere dichiarata Metadata Contract;
- diventare sorgente dei facts;
- modificare la semantica canonica;
- occultare provenance incompatibile;
- garantire consumer non osservati;
- trasferire score, cluster o recommendation nel Core contract.

## Layer 3 — Projection and Policy

Projection e policy possono produrre:

- logical cluster;
- dependency graph aggregato;
- capability grouping;
- product/library/risk score;
- candidate;
- ranking;
- promising areas;
- extraction recommendation;
- product proposal;
- summary e presentation model.

Questi output:

- sono derivati;
- possono essere rigenerati;
- possono avere versioni proprie;
- possono essere esposti per compatibilità;
- non alterano i facts sorgente;
- non diventano canonici perché consumati da sistemi esistenti.

## Covered Consumers

La garanzia copre esclusivamente i consumer verificati in EP-03.

### Backend

| ID EP-03 | Consumer | Compatibility obligation |
| --- | --- | --- |
| CI-01 | AnalysisSnapshotLoader | Lettura degli snapshot osservati, fallback e merge behavior restano caratterizzabili |
| CI-02 | RepositoryIntelligenceEngine | Facts strutturali e state derivato restano semanticamente disponibili |
| CI-03 | ProductCandidateEngine | Gli input facts e gli output policy osservati restano distinguibili e compatibili |
| CI-04 | IntentMatchingEngine | Intent ranking ed extraction recommendation restano projection/policy behavior |
| CI-05 | ProductProposalEngine | Candidate e proposal restano fuori dal canonical contract ma compatibili |
| CI-06 | ClusterAssigner | Il clustering continua a consumare projection/policy input |
| CI-07 | ClusterMapBuilder | Il cluster map resta una projection compatibile |
| CI-08 | analysis.routes | Endpoint, status, empty/error behavior e payload consumati restano coperti |
| CI-09 | composeSpecialistDecisionBrief | Promising areas restano policy output disponibile alla superficie applicativa |
| CI-10 | analysis/index | I re-export osservati restano una superficie di compatibilità, non canonica |

### UI

| ID EP-03 | Consumer | Compatibility obligation |
| --- | --- | --- |
| CI-11 | UI type mirror | La forma UI osservata resta un adapter contract distinto |
| CI-12 | useRepositoryIntelligence | Loading, error e payload behavior restano coperti |
| CI-13 | productDiscovery | Dependency signals e product candidate behavior restano disponibili |
| CI-14 | productFactory | Il consumo transitivo del discovery state resta coperto |
| CI-15 | RepositoryIntelligencePanel | Provenance labels, counts, cluster e candidate presentation restano derivabili |
| CI-16 | ChatPanel | Il pass-through osservato resta compatibile |
| CI-17 | JarvisSpecialistAnalysisSummary | Il summary applicativo da promising areas resta disponibile |

## Unverified Consumers

Non sono coperti da garanzia:

- consumer esterni del public re-export non presenti nella baseline;
- lettori esterni di snapshot o cache;
- script non presenti nel repository;
- consumer dinamici non osservabili staticamente;
- dipendenze organizzative non registrate.

La loro esistenza è un rischio residuo, non un fatto.

Una futura evidenza di consumer esterno richiede:

- aggiornamento del Consumer Inventory;
- valutazione dell'obbligo di compatibilità;
- riesame delle baseline applicabili;
- decisione esplicita prima di estendere la garanzia.

## Compatibility Units

La compatibilità viene valutata per unità osservabile, non come promessa
indifferenziata sull'intero schema.

| Unità | Proprietà osservabili |
| --- | --- |
| Canonical fact | Identità, significato, provenance, cardinalità, optionality |
| Projection output | Campi consumati, determinismo richiesto, ordinamento osservato |
| API endpoint | Status, errori, stati vuoti, forma e semantica del payload consumato |
| Public type surface | Nomi e forme effettivamente importati dai consumer verificati |
| UI adapter state | Campi letti, nullability, loading/error behavior |
| Persisted input | Capacità di lettura delle forme effettivamente osservate |
| Persisted cache | Capacità di riconoscere, invalidare o leggere la forma coperta |

## Compatibility Guarantees

### Field presence

Un campo usato da un consumer verificato non può essere rimosso dalla relativa
Compatibility Surface senza una breaking-change decision.

Questo non obbliga il Canonical Contract a contenere quel campo.

### Semantic preservation

Un campo conservato non può cambiare significato mantenendo lo stesso ruolo
compatibile.

### Cardinality and optionality

Array, valore singolo, valore opzionale e `null` restano distinti quando il
consumer osservato dipende dalla distinzione.

### Ordering

L'ordinamento è garantito soltanto quando:

- il consumer lo usa senza riordinare;
- un test osservato lo verifica;
- cambia il risultato applicativo.

L'ordine non osservato non diventa implicitamente normativo.

### Empty states

Array vuoto, payload assente, `null`, `404` e fallback applicativo non sono
intercambiabili quando il consumer li distingue.

### Error behavior

Status ed errori osservati su una superficie verificata fanno parte della
compatibilità quando determinano un ramo del consumer.

### Deterministic projections

Una projection è deterministica quando EP-02 identifica lo stesso output atteso
a parità di facts, policy version e configurazione osservata.

### Provenance continuity

I consumer che oggi usano `source`, `repoPath`, `snapshotFile` e `generatedAt`
devono continuare a ricevere informazioni equivalenti dalla Compatibility
Surface. Questi campi non diventano per questo la forma canonica della
provenance.

## Observed Surface Obligations

### Snapshot input

La compatibilità osservata include:

- selezione dello snapshot enriched più recente;
- fallback allo snapshot root quando quello datato manca;
- merge dei standalone candidates dalla forma compact;
- lettura delle module snapshot e data interaction;
- disponibilità delle projection legacy necessarie ai consumer.

Questi comportamenti saranno descritti da EP-02. Non definiscono il formato
canonico del Metadata Contract.

### Repository intelligence state

La Compatibility Surface può continuare a fornire:

- source e provenance labels;
- repository path quando disponibile;
- snapshot label;
- generated timestamp;
- summary;
- module view misto;
- cluster;
- candidate.

Facts, projection e policy devono rimanere semanticamente distinguibili anche
quando esposti nello stesso payload legacy.

### HTTP surface

Sono nel perimetro:

- `/api/analysis/latest`;
- `/api/analysis/candidates`;
- `/api/analysis/propose`;
- `/api/analysis/extract/match`;
- `/api/analysis/extract/:candidateId/boundary`;
- `/api/analysis/promote`, limitatamente alle dipendenze dal contract corrente.

La copertura riguarda esclusivamente comportamenti osservati dal codice e dalle
suite EP-03. Non costituisce freeze di ogni campo o side effect interno.

### UI surface

Sono nel perimetro:

- il mirror `UIRepositoryIntelligenceState`;
- il fetch e gli stati del relativo hook;
- product discovery e product factory;
- Repository Intelligence Panel;
- Chat/Jarvis pass-through e summary osservati.

La UI rimane adapter. Il suo mirror non diventa modello canonico.

## Persisted Compatibility

Snapshot e cache sono compatibility artifacts, non Metadata Contract.

La garanzia può riguardare:

- leggibilità della forma osservata;
- riconoscimento esplicito di una forma non supportata;
- preservazione dei dati necessari ai consumer verificati;
- comportamento deterministico in caso di forma mancante o parziale.

La garanzia non implica:

- byte-for-byte identity;
- persistenza perpetua del formato;
- promozione del JSON layout a contract canonico;
- compatibilità con lettori esterni non osservati.

## Change Classification

### Canonical breaking change

È breaking per il Canonical Contract:

- rimuovere una fact family;
- cambiare il significato di un fact esistente;
- cambiare identità o relazione tra facts in modo incompatibile;
- ridurre provenance o observation scope obbligatori;
- trasformare un fatto in inferenza senza nuova decisione;
- introdurre dipendenze vietate da EP-01;
- cambiare cardinalità o optionality canonica senza gestione esplicita.

### Compatibility breaking change

È breaking per una Compatibility Surface:

- rimuovere un campo usato da un consumer coperto;
- cambiare semantica, tipo, cardinalità o nullability osservata;
- cambiare un ordinamento da cui dipende il risultato;
- cambiare status, errore o empty-state branch consumato;
- rendere illeggibile una persisted shape coperta;
- rimuovere un re-export effettivamente importato;
- modificare un projection output coperto dalle baseline senza equivalenza.

### Non-breaking change

Può essere non-breaking:

- aggiungere un fact opzionale senza reinterpretare facts esistenti;
- aggiungere provenance più precisa mantenendo quella richiesta;
- aggiungere un projection field non usato dai consumer coperti;
- cambiare algoritmo interno mantenendo gli output osservabili coperti;
- aggiungere un nuovo adapter senza cambiare le superfici esistenti;
- aggiungere un consumer senza modificare il Canonical Contract.

La classificazione definitiva richiede evidenza sul consumer e non deriva
soltanto dalla forma sintattica della modifica.

## Versioning Rules

Devono essere versionati separatamente:

| Oggetto | Motivo |
| --- | --- |
| Canonical Contract | Governa semantica facts-only |
| Compatibility Surface | Governa consumer verificati |
| Projection/Policy | Governa algoritmi e output derivati |
| Persisted shape | Governa lettura e lifecycle dei dati salvati |
| Transport adapter | Governa endpoint o protocol envelope |

Una nuova versione di projection non richiede una nuova versione del Canonical
Contract se i facts non cambiano.

Una nuova versione del Canonical Contract non autorizza automaticamente la
rimozione di una Compatibility Surface.

EP-04 non seleziona uno schema di versionamento concreto.

## Failure Rules

1. Un input privo di evidence o provenance sufficiente non produce un fact
   canonico per compatibilità.
2. Una projection non disponibile non può essere sostituita con un fact
   inventato.
3. Un mapping legacy ambiguo deve essere dichiarato incompleto o incompatibile.
4. Un consumer coperto non può ricevere silenziosamente semantica differente.
5. Un errore di Compatibility Surface non modifica il Canonical Contract.
6. Un consumer sconosciuto non estende implicitamente la garanzia.
7. L'assenza di una baseline impedisce di dichiarare equivalenza.

## Compatibility Verification Evidence

La futura verifica deve poter collegare:

- consumer ID EP-03;
- superficie osservabile;
- input o fixture EP-02;
- output o comportamento atteso;
- versione Canonical Contract;
- versione projection/policy;
- versione Compatibility Surface;
- esito;
- eccezioni e rischio residuo.

EP-04 definisce l'obbligo. EP-02 specificherà i casi osservabili senza creare
test eseguibili.

## Residual Risk

| Rischio | Trattamento normativo |
| --- | --- |
| Consumer esterni non osservati | Nessuna garanzia; nuova evidenza richiede inventory update |
| Lettori esterni di snapshot/cache | Nessuna garanzia oltre le forme osservate localmente |
| UI mirror divergente | Adapter contract verificato separatamente |
| Projection non deterministica | Nessuna equivalenza dichiarabile senza baseline |
| Provenance legacy incompleta | Fact non canonico o observation scope incompleto |
| Campi misti nello stesso payload | Consentiti solo nella Compatibility Surface |

## Compatibility Contract Invariants

### CC-I01 — Canonical Independence

Il Canonical Contract non cambia per soddisfare una forma legacy.

### CC-I02 — Verified Consumer Scope

La garanzia riguarda solo consumer verificati e registrati.

### CC-I03 — Behavioral Compatibility

La compatibilità protegge comportamento osservabile, non l'intero schema per
default.

### CC-I04 — Projection Separation

Projection e policy restano distinguibili dai facts anche quando condividono
una superficie legacy.

### CC-I05 — No Reverse Authority

Un adapter o consumer non può ridefinire la semantica canonica.

### CC-I06 — Explicit Breaking Change

Ogni rottura richiede evidenza, classificazione e decisione esplicita.

### CC-I07 — Independent Versioning

Canonical Contract, Compatibility Surface, projection e persistence hanno
lifecycle distinti.

### CC-I08 — Honest Uncertainty

Consumer non osservabili e provenance incompleta restano rischio dichiarato.

### CC-I09 — No Silent Loss

Campi o comportamenti coperti non vengono rimossi o reinterpretati
silenziosamente.

### CC-I10 — Facts Are Never Reconstructed from Policy

Score, cluster, candidate e recommendation non possono essere usati come fonte
retroattiva di facts.

## Contract Acceptance Criteria

EP-04 soddisfa il proprio scopo quando:

- Canonical Contract, Compatibility Surface e Projection Layer sono separati;
- il perimetro dei consumer coperti è esplicito;
- i consumer non osservati sono trattati come rischio residuo;
- le garanzie osservabili sono definite;
- persisted shape e trasporto non diventano canonici;
- breaking e non-breaking change sono distinguibili;
- gli oggetti versionabili sono separati;
- failure rules impediscono facts inventati;
- EP-02 dispone di obblighi osservabili da specificare;
- nessuna strategia implementativa è prescritta.

## Preparation State After EP-04

```text
EP-01 = Complete
EP-03 = Complete
EP-04 = Complete
EP-02 = Eligible, not started
EP-05 = Blocked by EP-02
EP-06 = Blocked by prior preparation evidence
ERA-002 = Not eligible
T1 = Not authorized
TECHNICAL_EXECUTION = Not authorized
IMPLEMENTATION_AUTHORITY = None
```

## Open Questions

1. Per quanto tempo deve restare supportata ciascuna Compatibility Surface?
2. Quale schema concreto identificherà le versioni di contract, projection,
   persistence e transport?
3. Quali persisted snapshot/cache shapes devono ricevere una garanzia
   temporale esplicita?
4. Esistono consumer esterni del public re-export o dei file persistiti?
5. Quale rappresentazione canonica sostituirà l'attuale provenance frammentata
   senza perdere la Compatibility Surface osservata?
6. Quali ordinamenti devono essere classificati come comportamento garantito
   da EP-02?
7. Quali errori e stati vuoti delle superfici HTTP/UI richiedono fixture
   dedicate in EP-02?

