# CAD-002 — Extraction Promotion Policy

## Status

**Approved**

CAD-002 è approvato tramite [AAR-002](./AAR-002_CAD-002_APPROVAL.md), dopo la
[Architecture Review](./CAD-002_ARCHITECTURE_REVIEW.md) con raccomandazione
`APPROVE`. La decisione è normativa per la promotion policy e rende Execution
Readiness eleggibile, ma non la avvia e non concede autorità implementativa.

## Decision Metadata

| Campo | Valore |
| --- | --- |
| Decision ID | CAD-002 |
| Titolo | Extraction Promotion Policy |
| Tipo | Core Architecture Decision — execution policy |
| Dipendenza normativa | CAD-001 — Repository Intelligence Core Boundary (`Approved`) |
| Evidenza di approvazione dipendenza | AAR-001 |
| Approval Record | [AAR-002](./AAR-002_CAD-002_APPROVAL.md) |
| Autorità implementativa | Nessuna |
| Ambito | Promozione di componenti candidati al riuso condiviso |

## Context

L'Ecosystem Recovery Audit ha censito le capacità esistenti nei repository
dell'ecosistema. L'Extraction Readiness Due Diligence (ERDD) ha poi classificato
i componenti in base alla loro estraibilità verificata. CAD-001 ha stabilito il
boundary del Repository Intelligence Core, la separazione Core/Adapter e gli
invarianti architetturali applicabili.

Queste evidenze non autorizzano automaticamente un'estrazione. È necessaria una
policy stabile e verificabile che determini quando un componente possa essere
promosso, quali prove debbano accompagnare la richiesta e quale atto di
governance renda efficace la promozione.

CAD-002 disciplina tale processo. Non descrive come modificare codice o
repository.

## Decision

Ogni promozione di un componente verso il riuso condiviso deve:

1. partire da una classificazione ERDD vigente;
2. essere sostenuta da un Evidence Package completo;
3. superare i gate definiti in questo documento;
4. ricevere una valutazione tecnica indipendente;
5. essere ratificata dall'autorità di governance;
6. produrre un Promotion Record permanente;
7. rimanere distinta dall'autorizzazione a eseguire modifiche tecniche.

Nessuna classificazione, review o promozione approvata costituisce da sola
autorità implementativa.

## Two-Axis Model

La governance mantiene separati due assi.

### Asse 1 — Extraction Readiness

Descrive ciò che le evidenze dimostrano sul componente esistente:

- **Reference** — evidenza utile, ma non riutilizzabile come nucleo.
- **Adapt** — nucleo riutilizzabile con isolamento o refactoring sostanziale.
- **Extract** — boundary sufficientemente generico per una estrazione limitata.
- **Not Reusable** — riuso non giustificato dalle evidenze.
- **Missing** — capacità non presente nel codice analizzato.

La classificazione ERDD è una valutazione tecnica, non uno stato operativo.

### Asse 2 — Promotion Lifecycle

Descrive lo stato governato di una proposta concreta:

```text
Candidate
    ↓
Under Review
    ↓
Approved for Promotion
    ↓
Shared
```

Stati terminali o correttivi:

- **Rejected** — le evidenze non soddisfano i gate.
- **Withdrawn** — la proposta è ritirata prima della decisione.
- **Revoked** — una promozione approvata perde efficacia.
- **Deprecated** — un componente Shared resta disponibile durante una
  transizione governata, ma non deve acquisire nuovi consumer.

`Approved for Promotion` autorizza lo stato decisionale registrato, non
l'esecuzione tecnica. `Shared` può essere assegnato solo dopo verifica
dell'esito tecnico e approvazione del relativo Promotion Record.

## Permitted Readiness Transitions

### Reference → Adapt

Richiede:

- nuova evidenza di codice o nuova analisi del boundary;
- ERDD aggiornata con motivazione verificabile;
- identificazione esplicita del nucleo riutilizzabile;
- identificazione degli accoppiamenti di dominio e tecnici;
- assenza di conflitto con CAD-001.

### Adapt → Extract

Richiede:

- boundary candidato esplicito;
- characterization baseline sufficiente a descrivere il comportamento
  esistente;
- inventario verificato dei consumer;
- dipendenze di dominio e tecniche dichiarate;
- compatibility contract definito;
- strategia di rollback verificabile;
- ERDD aggiornata e approvata.

### Extract → Shared

Richiede:

- promozione `Adapt → Extract` già efficace, oppure classificazione `Extract`
  originaria ancora valida;
- esito tecnico verificato senza regressioni note nei consumer dichiarati;
- superficie pubblica e ownership dichiarate;
- regole di compatibilità e versionamento applicabili;
- processo di rilascio, deprecazione e rollback definito;
- Promotion Record approvato.

Non sono consentiti salti di stato privi delle evidenze richieste per tutti i
passaggi intermedi.

## Required Evidence Package

Ogni proposta deve contenere almeno:

| Evidenza | Contenuto minimo |
| --- | --- |
| Identità | Nome univoco, repository e percorso di origine |
| Provenienza | Commit o baseline immutabile esaminata |
| Readiness | Stato ERDD, punteggio e motivazione |
| Boundary | Responsabilità incluse ed escluse |
| Coupling | Dipendenze tecniche, di dominio e runtime |
| Consumers | Consumer esistenti, modalità d'uso e criticità |
| Characterization | Comportamenti osservati e risultati della baseline |
| Compatibility | Contratto da preservare e tolleranze ammesse |
| Architecture | Verifica di conformità a CAD-001 |
| Risk | Rischi, impatto e condizioni di arresto |
| Rollback | Condizioni, responsabile e percorso di ripristino |
| Ownership | Owner sorgente e steward candidato |
| Provenance | Licenze, attribuzioni e vincoli di distribuzione |

Un riferimento al solo nome di un file, a un README o a una similarità
concettuale non costituisce evidenza sufficiente.

## Characterization Baseline

La characterization baseline deve:

- essere rilevata prima di qualsiasi estrazione;
- descrivere output, errori, effetti osservabili e casi limite rilevanti;
- essere eseguibile o altrimenti riproducibile;
- distinguere fatti prodotti dal componente da policy del consumer;
- includere i casi usati dai consumer esistenti;
- registrare eventuali comportamenti noti ma non desiderabili senza
  correggerli implicitamente;
- restare collegata alla baseline di provenienza.

La characterization dimostra equivalenza osservabile. Non prescrive la tecnica
con cui tale equivalenza sarà ottenuta.

## Consumer Verification

L'inventario dei consumer deve essere basato sul codice e deve distinguere:

- import o chiamate dirette;
- consumo tramite adapter o API;
- dipendenze da tipi, formati o side effect;
- consumer di test, build e tooling;
- consumer esterni noti ma non verificabili localmente.

Una promozione non può dichiarare compatibilità completa se esistono consumer
noti non verificati. Le eccezioni devono essere esplicite, motivate e approvate
dall'autorità di governance.

## Compatibility Contract

Il contratto di compatibilità deve indicare:

- superficie e comportamenti da preservare;
- schema dei dati e semantica dei campi;
- errori ed effetti osservabili rilevanti;
- politica di compatibilità applicabile;
- condizioni che costituiscono breaking change;
- periodo e modalità di deprecazione;
- responsabilità della verifica.

Modifiche non coperte dal contratto non possono essere considerate
automaticamente compatibili.

## Versioning and Compatibility

Ogni componente promosso a `Shared` deve avere:

- un'identità di versione verificabile;
- una politica dichiarata per modifiche compatibili e incompatibili;
- una relazione tracciabile tra versione condivisa e baseline sorgente;
- un registro dei consumer supportati;
- una procedura di deprecazione;
- ownership responsabile delle decisioni di compatibilità.

CAD-002 non impone uno schema di versionamento o uno strumento di rilascio
specifico.

## Promotion Gates

| Gate | Criterio | Esito richiesto |
| --- | --- | --- |
| PG-01 | Dipendenza da CAD-001 | Conforme |
| PG-02 | Evidence Package | Completo e tracciabile |
| PG-03 | ERDD | Vigente e coerente con la promozione |
| PG-04 | Characterization baseline | Riproducibile e superata |
| PG-05 | Consumer inventory | Completo per il perimetro dichiarato |
| PG-06 | Compatibility contract | Esplicito e verificabile |
| PG-07 | Provenienza e licenze | Compatibili con il riuso previsto |
| PG-08 | Rischio e rollback | Valutati e praticabili |
| PG-09 | Architecture Review | Indipendente e favorevole |
| PG-10 | Governance Approval | Esplicita e registrata |

Un gate non soddisfatto produce `Revise` o `Reject`; non può essere compensato
da un punteggio aggregato.

## Roles and Responsibilities

| Ruolo | Responsabilità |
| --- | --- |
| Proposer | Formula la promozione e ne definisce il perimetro |
| Evidence Owner | Mantiene Evidence Package e tracciabilità |
| Source Owner | Conferma comportamento, consumer e vincoli del repository sorgente |
| Independent Reviewer | Valuta evidenze, gate e conformità senza ratificare |
| Governance Authority | Approva, respinge, condiziona o revoca la promozione |
| Shared Component Steward | Assume ownership solo dopo la promozione a Shared |

Il Proposer e l'Independent Reviewer non devono coincidere per la stessa
promozione. La raccomandazione del Reviewer non modifica lo stato senza un atto
della Governance Authority.

## Decision Outcomes

La review può raccomandare:

- **Approve** — tutti i gate tecnici applicabili sono soddisfatti;
- **Revise** — evidenze incomplete o condizioni correggibili;
- **Reject** — promozione non sostenuta o incompatibile con gli invarianti.

La Governance Authority può:

- approvare;
- approvare con condizioni verificabili e scadenza;
- respingere;
- richiedere una nuova ERDD;
- revocare una promozione efficace.

## Promotion Record

Ogni promozione approvata deve produrre un record permanente con almeno:

```text
Promotion Record ID:
Component:
Source Baseline:
Previous Readiness:
New Readiness or Lifecycle State:
Evidence Package:
Characterization:
Consumer Verification:
Compatibility:
Architecture Review:
Governance Decision:
Conditions:
Effective Date:
Approving Authority:
```

Il Promotion Record registra la decisione concreta. Non sostituisce CAD-002 e
non può ridurne i gate.

## Rollback

Prima dell'esecuzione deve essere dimostrato che:

- esiste una baseline sorgente recuperabile;
- i consumer possono tornare a una configurazione supportata;
- sono definite le condizioni che attivano il rollback;
- è assegnata la responsabilità della decisione;
- la verifica post-rollback è determinata in anticipo.

Il rollback tecnico non annulla la storia decisionale: il Promotion Record
rimane e viene collegato all'eventuale revoca.

## Revocation and Deprecation

Una promozione può essere revocata quando:

- emergono regressioni o consumer non censiti con impatto sostanziale;
- viene violato il compatibility contract;
- le evidenze risultano non riproducibili;
- cambia una dipendenza normativa;
- vengono meno ownership, manutenzione o requisiti di provenienza;
- il componente viola gli invarianti di CAD-001.

La revoca deve:

1. essere motivata con evidenze;
2. indicare l'effetto sui consumer;
3. attivare rollback o deprecazione governata;
4. produrre un aggiornamento del Promotion Record;
5. non cancellare la decisione storica.

## Exit Gates

### Exit Gate per Execution Readiness

La preparazione operativa può iniziare solo dopo:

- approvazione formale di CAD-002;
- registrazione dell'atto di approvazione;
- conferma che CAD-001 resta `Approved`;
- assegnazione dei ruoli di governance;
- assenza di condizioni sospensive.

Questo gate autorizza la preparazione delle evidenze, non modifiche ai
repository sorgente.

### Exit Gate per Technical Execution

Una iniziativa tecnica può essere proposta solo quando:

- il componente ha un Evidence Package completo;
- i gate PG-01–PG-10 applicabili sono soddisfatti;
- esiste un Promotion Record approvato o un atto equivalente esplicito;
- esiste una separata autorità implementativa che definisce il perimetro.

CAD-002 non concede tale autorità.

## Architectural Constraints

- Nessuna promozione può violare CAD-001.
- Nessuna estrazione può precedere la characterization baseline.
- Nessun consumer noto può essere escluso silenziosamente.
- Nessun componente `Reference` può essere promosso senza una nuova ERDD.
- Fatti tecnici e policy applicative devono restare separati.
- Core e adapter devono conservare la separazione definita da CAD-001.
- Una dipendenza da UI, store o runtime applicativo deve essere dichiarata come
  accoppiamento, non occultata nel boundary.
- Review tecnica, approvazione di governance ed esecuzione devono restare atti
  distinti.

## Consequences

### Positive

- Le promozioni diventano confrontabili, verificabili e revocabili.
- Il riuso viene fondato su evidenze e compatibilità dei consumer.
- La storia decisionale resta separata dalla storia delle modifiche tecniche.
- Il protocollo può essere applicato a componenti e repository differenti.

### Costs and Limitations

- Ogni promozione richiede evidenze e responsabilità esplicite.
- Componenti promettenti possono rimanere `Adapt` finché i gate non sono
  soddisfatti.
- Una review favorevole non accelera né sostituisce la ratifica.
- Il protocollo resta candidato finché non viene validato da un ciclo completo
  di esecuzione e verifica.

## Decisions Requiring a New CAD or ADR

Richiedono una nuova decisione:

- modifica del boundary o degli invarianti di CAD-001;
- eliminazione o sostanziale riduzione dei gate di promozione;
- fusione dei ruoli di review e approvazione;
- modifica della distinzione tra readiness, promozione e autorità
  implementativa;
- adozione di una politica di compatibilità vincolante per tutti i componenti
  Shared.

## Non-Goals

CAD-002 non:

- autorizza estrazioni, refactoring o implementazioni;
- definisce un backlog operativo;
- seleziona il primo componente da estrarre;
- prescrive file, commit, branch, package o repository di destinazione;
- sceglie strumenti di test, versionamento o rilascio;
- progetta Repository Intelligence, AST, MCP, CLI, API o Graph Workspace;
- modifica la classificazione corrente dell'ERDD;
- approva Promotion Record concreti;
- promuove il protocollo candidato a metodo validato.

## Approval Criteria for CAD-002

CAD-002 è passato da `Proposed` ad `Approved` dopo che la
[Architecture Review](./CAD-002_ARCHITECTURE_REVIEW.md) ha verificato:

- coerenza con CAD-001 e AAR-001;
- separazione tra readiness, promozione e implementazione;
- completezza e verificabilità dei gate;
- governabilità di ruoli, revoca e rollback;
- applicabilità senza dipendere da tecnologie o repository specifici;
- assenza di autorità implementativa implicita.

L'approvazione è registrata nel separato
[AAR-002](./AAR-002_CAD-002_APPROVAL.md). Essa rende Execution Readiness
eleggibile, ma non avviata, e mantiene `Implementation Authority = None`.

## References

- Ecosystem Recovery Audit
- Extraction Readiness Due Diligence (ERDD)
- CAD-001 — Repository Intelligence Core Boundary
- CAD-001 Architecture Review
- AAR-001 — CAD-001 Approval

