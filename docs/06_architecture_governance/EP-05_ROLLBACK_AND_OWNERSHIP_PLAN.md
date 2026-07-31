# EP-05 — Metadata Contract Rollback & Ownership Plan

## Assumptions

- CAD-001 è `Approved`.
- CAD-002 è `Approved`.
- AAR-001 e AAR-002 sono `Effective`.
- ERA-001 ha esito storico `NO GO`.
- Extraction Preparation è `Open`.
- EP-01, EP-03, EP-04 ed EP-02 sono `Complete` e approvati.
- Il componente candidato è C01 — Repository Intelligence metadata contracts.
- La baseline sorgente verificata è
  `7b55c4eb4327bbea772435241b24171d5a5415a6`.
- Il perimetro di compatibilità comprende esclusivamente i consumer verificati
  da EP-03.
- L'autorità di governance del workspace è l'utente.
- I ruoli operativi non vengono inferiti dalla proprietà del repository, dalla
  redazione dei documenti o dall'accesso tecnico.
- `Implementation Authority = None`.
- `Technical Execution = Not authorized`.

## Plan Record

| Campo | Valore |
| --- | --- |
| Deliverable | EP-05 |
| Titolo | Metadata Contract Rollback & Ownership Plan |
| Status | Complete — assignment gate open |
| Phase | Extraction Preparation |
| Boundary | EP-01 |
| Consumer inventory | EP-03 |
| Compatibility contract | EP-04 |
| Characterization baseline | EP-02 |
| Ownership model | Role-based ownership with assignment gate |
| Approval evidence | Opzione 1 approvata esplicitamente dall'autorità di governance |
| Implementation authority | None |

## Normative Principle

> Nessuna estrazione può iniziare senza responsabilità nominativamente
> assegnate, rischio esplicitamente accettato e un percorso verificabile verso
> l'ultima configurazione supportata. La preparazione del piano non equivale
> all'assegnazione dei ruoli e non costituisce autorità implementativa.

## Scope

EP-05 definisce:

- i ruoli richiesti per governare preparazione, verifica e rollback;
- i diritti decisionali e le separazioni di responsabilità;
- le evidenze necessarie a dimostrare la praticabilità del rollback;
- le condizioni di arresto, rollback, revoca e riesame;
- il registro dei rischi preparatori;
- il gate di assegnazione che deve precedere ERA-002.

EP-05 non:

- assegna automaticamente ruoli tecnici o organizzativi;
- nomina un Technical Execution Lead;
- autorizza T1;
- prescrive branch, commit, package, repository di destinazione o procedure
  tecniche;
- modifica codice, test o repository sorgente;
- rende C01 `Extract` o `Shared`;
- sostituisce un futuro Promotion Record.

## Ownership Roles

| Ruolo | Responsabilità normativa | Stato |
| --- | --- | --- |
| Governance Authority | Approva, condiziona, respinge o revoca; accetta il rischio residuo; autorizza separatamente T1 | Assegnato e verificato: utente |
| Source Owner | Attesta baseline, comportamento osservato, consumer e vincoli del repository sorgente | Non assegnato |
| Evidence Owner | Mantiene Evidence Package, collegamenti alle baseline e tracciabilità delle verifiche | Non assegnato |
| Compatibility Owner | Determina l'applicazione di EP-04 e attesta gli esiti sui consumer verificati | Non assegnato |
| Rollback Authority | Ordina arresto o rollback entro il mandato approvato e registra motivazione ed esito | Non assegnato |
| Shared Component Steward | Assume responsabilità di compatibilità, manutenzione e deprecazione solo dopo lo stato `Shared` | Non assegnato |
| Independent Reviewer | Valuta evidenze e gate senza ratificare la decisione | Da assegnare per ciascun gate |
| Technical Execution Lead | Coordina una futura attività tecnica entro un mandato T1 esplicito | Non assegnabile prima dell'autorizzazione T1 |

L'accesso a un repository, la paternità di un documento o l'esecuzione di una
verifica non costituiscono assegnazione implicita.

## Separation of Duties

1. La Governance Authority e l'Independent Reviewer non coincidono per la
   stessa decisione.
2. Il Proposer e l'Independent Reviewer non coincidono per la stessa promozione,
   come richiesto da CAD-002.
3. Il Compatibility Owner produce o valida l'evidenza; la Governance Authority
   decide se il rischio residuo è accettabile.
4. La Rollback Authority può attivare un arresto di emergenza entro il mandato
   approvato, ma non può promuovere o revocare autonomamente il componente.
5. Il Shared Component Steward non acquisisce autorità prima della promozione
   effettiva a `Shared`.
6. Il Technical Execution Lead non può essere nominato da questo deliverable.

Una stessa persona può ricoprire più ruoli non incompatibili soltanto quando
l'assegnazione è esplicita, motivata e non elimina l'indipendenza richiesta da
CAD-002.

## Assignment Gate

Prima di ERA-002 devono essere registrati almeno:

- identità e accettazione del Source Owner;
- identità e accettazione dell'Evidence Owner;
- identità e accettazione del Compatibility Owner;
- identità e accettazione della Rollback Authority;
- candidato e condizioni di attivazione dello Shared Component Steward;
- Independent Reviewer designato per ERA-002;
- eventuali cumuli di ruolo, con motivazione e verifica delle incompatibilità.

Ogni assegnazione deve contenere:

```text
Role:
Assignee:
Scope:
Effective date:
Accepted responsibilities:
Conflicts checked:
Approving authority:
```

Finché una delle assegnazioni obbligatorie manca:

```text
OWNERSHIP_ASSIGNMENT_GATE = OPEN
PG-08 = NOT SATISFIED
ERA-002 = NOT ELIGIBLE
T1 = NOT AUTHORIZED
```

## Rollback Objective

Il rollback ha un solo obiettivo normativo:

> Ripristinare l'ultima configurazione verificata e supportata per tutti i
> consumer inclusi nel perimetro di EP-03, conservando evidenze e storia
> decisionale.

Il rollback non richiede identità byte-per-byte. Richiede il ripristino del
livello di equivalenza applicabile definito da EP-02 e delle garanzie definite
da EP-04.

## Recoverable Baselines

Prima di qualsiasi esecuzione devono essere identificate e verificabili:

1. la baseline sorgente immutabile del componente candidato;
2. la baseline dei consumer verificati di EP-03;
3. la Compatibility Surface supportata prima dell'intervento;
4. gli scenari EP-02 applicabili a ciascun consumer;
5. lo stato di persistenza o cache rilevante per i consumer;
6. la configurazione supportata che costituisce la destinazione del rollback.

Una baseline è recuperabile soltanto se identità, provenienza, perimetro e
condizioni di ripristino sono registrati. La semplice esistenza nella storia
Git non dimostra da sola la praticabilità del rollback.

## Stop, Rollback, Revocation and Deprecation

| Atto | Applicazione |
| --- | --- |
| Stop | Interrompe preparazione o esecuzione prima che una configurazione non conforme venga promossa |
| Rollback | Riporta i consumer all'ultima configurazione verificata e supportata |
| Revocation | Ritira l'efficacia di una promozione mediante atto di governance |
| Deprecation | Mantiene temporaneamente una superficie supportata durante una transizione governata |

Prima di una modifica tecnica, l'azione corretta è `Stop` o cancellazione
dell'iniziativa, non rollback. Rollback, revocation e deprecation non cancellano
Evidence Package, review, decisioni o Promotion Record.

## Rollback Triggers

Il riesame è obbligatorio e il rollback deve essere valutato quando si verifica
almeno una delle condizioni seguenti:

1. fallisce uno scenario obbligatorio definito da EP-02;
2. un consumer verificato di EP-03 mostra una regressione incompatibile;
3. viene violato un invariante di EP-01 o una garanzia di EP-04;
4. facts assenti vengono sostituiti da inferenze o default non dichiarati;
5. snapshot, cache o dati persistiti non possono essere letti o ricondotti a
   una configurazione supportata;
6. emerge un consumer non censito con impatto sostanziale;
7. evidenze o risultati non sono riproducibili sulla baseline dichiarata;
8. EP-06 individua una incompatibilità di provenienza o licenza;
9. viene meno un ruolo critico o l'ownership non è più esercitabile;
10. la destinazione di rollback non è più recuperabile o supportata.

Un trigger non determina automaticamente la revoca. Determina arresto,
valutazione documentata e decisione esplicita.

## Decision Flow

```text
Trigger osservato
        ↓
Evidence Owner registra evidenza e perimetro
        ↓
Compatibility Owner valuta EP-02, EP-03 ed EP-04
        ↓
Rollback Authority dispone stop o raccomanda rollback
        ↓
Governance Authority decide:
    continue with conditions / rollback / revoke / deprecate
        ↓
Verifica post-decisione e aggiornamento dei record
```

La Rollback Authority può imporre uno stop immediato quando la continuazione
può compromettere consumer o dati. La Governance Authority deve successivamente
ratificare, modificare o revocare la misura e registrare il rischio residuo.

## Post-Rollback Verification

Il rollback è verificato soltanto quando:

- ogni consumer interessato è identificato tramite il proprio ID EP-03;
- gli scenari EP-02 applicabili hanno l'esito richiesto;
- la Compatibility Surface è nuovamente in uno stato supportato;
- dati persistiti, cache ed empty/error states rilevanti sono verificati;
- regressioni residue e consumer non verificabili sono dichiarati;
- la Rollback Authority registra l'esito;
- la Governance Authority decide lo stato della promozione.

L'assenza di errori segnalati non costituisce da sola prova di rollback
riuscito.

## Risk Assessment Scale

### Likelihood

- **Low** — richiede condizioni non osservate o eccezionali.
- **Medium** — plausibile nel primo ciclo o sostenuto da coupling osservato.
- **High** — già osservato, strutturale o inevitabile senza trattamento.

### Impact

- **Low** — effetto limitato, reversibile e senza consumer produttivi.
- **Medium** — degrado di uno o più consumer verificati.
- **High** — perdita di semantica, incompatibilità diffusa, dati non
  recuperabili o violazione normativa.

La valutazione non autorizza l'accettazione. Il rischio residuo deve essere
approvato separatamente.

## Risk Register

| ID | Rischio | Evidenza | Likelihood | Impact | Owner richiesto | Trigger principale | Trattamento normativo |
| --- | --- | --- | :---: | :---: | --- | --- | --- |
| R-01 | Deriva semantica dei facts | C01 mescola facts, projection e policy | High | High | Compatibility Owner | Violazione EP-01/EP-04 | Stop; verifica facts-only; rollback se esposto ai consumer |
| R-02 | Regressione dei consumer verificati | EP-03 identifica consumer di strutture miste | High | High | Source Owner | Scenario EP-02 fallito | Stop; valutazione per consumer; rollback |
| R-03 | Consumer esterni non osservabili | EP-03 non può garantire il perimetro esterno | Medium | High | Evidence Owner | Nuovo consumer materiale | Riesame inventario; decisione di rischio; possibile revoca |
| R-04 | Incompatibilità di snapshot, cache o dati persistiti | EP-04 distingue contract e persistence surface | Medium | High | Compatibility Owner | Lettura o round-trip non conforme | Stop; ritorno a formato supportato; verifica post-rollback |
| R-05 | Provenienza o licenza incompatibile | ERA-001 registra LICENSE root non verificata | Medium | High | Evidence Owner | Finding EP-06 | Nessuna esecuzione; remediation o ritiro |
| R-06 | Divergenza delle projection | Consumer attuali dipendono da strutture miste derivate | Medium | Medium | Compatibility Owner | Equivalenza graduata non rispettata | Applicare EP-02; rollback della Compatibility Surface |
| R-07 | Rollback non praticabile | Percorso tecnico non ancora autorizzato né dimostrato | Medium | High | Rollback Authority | Baseline non recuperabile | Gate chiuso; nessuna autorizzazione T1 |
| R-08 | Ruolo critico vacante o conflitto di responsabilità | Ruoli operativi non ancora assegnati | High | High | Governance Authority | Assignment gate incompleto | ERA-002 non eleggibile |
| R-09 | Drift della baseline sorgente | Evidenze riferite a una revisione immutabile | Medium | High | Source Owner | Differenza dalla baseline dichiarata | Nuova evidenza o nuova ERA; nessuna equivalenza presunta |
| R-10 | Evidenza non riproducibile | Characterization attuale è una specifica, non test eseguibili | Medium | High | Evidence Owner | Risultato non replicabile in T1 | Stop; ripristino della baseline; riesame del gate |

## Risk Acceptance

1. Nessun rischio è accettato implicitamente.
2. Solo la Governance Authority può accettare rischio residuo.
3. L'accettazione deve indicare evidenza, ambito, motivazione, durata,
   condizioni e data di riesame.
4. Un rischio accettato non rende automaticamente soddisfatto un Promotion
   Gate.
5. Rischi relativi a provenienza incompatibile, baseline non recuperabile o
   assenza dei ruoli obbligatori non sono compensabili da un'accettazione
   generica.
6. La scadenza o il venir meno delle condizioni riapre il gate.

Formato minimo:

```text
Risk ID:
Residual risk:
Scope:
Rationale:
Conditions:
Expiry or review date:
Decision:
Governance Authority:
```

## Evidence Required for Rollback Readiness

PG-08 può essere rivalutato soltanto quando l'Evidence Package contiene:

- baseline recuperabile e relativa provenienza;
- destinazione di rollback supportata;
- elenco dei consumer interessati;
- mappatura consumer/scenari EP-02;
- trigger applicabili;
- assegnazioni dei ruoli obbligatori;
- decision rights e canale di escalation;
- criteri di verifica post-rollback;
- rischi residui e relative decisioni;
- posizione permanente dei record.

La presenza del presente piano soddisfa la definizione del modello di rollback,
ma non dimostra da sola la sua praticabilità.

## EP-05 Acceptance Criteria

Il deliverable è completo quando:

- ruoli e responsabilità sono definiti;
- le incompatibilità tra ruoli sono esplicite;
- esiste un assignment gate verificabile;
- obiettivo, baseline, trigger e decision flow del rollback sono definiti;
- la verifica post-rollback è collegata a EP-02, EP-03 ed EP-04;
- i rischi preparatori sono censiti;
- le regole di accettazione del rischio sono esplicite;
- nessuna autorità implementativa è introdotta.

Il completamento del deliverable non richiede di assegnare nominativamente i
ruoli. L'assegnazione è un gate separato e obbligatorio prima di ERA-002.

## ERA-001 Finding Disposition

| Finding | Evidenza prodotta | Stato |
| --- | --- | --- |
| Rollback, rischio e ownership non definiti | Modello di ownership, risk register e rollback plan formalizzati | Partially remediated |
| Ruoli critici assegnati | Solo Governance Authority verificata | Open |
| Rollback praticabile | Criteri definiti; evidenza operativa non ancora disponibile | Open |

Il blocker di ERA-001 non è chiuso. Potrà essere dichiarato chiuso soltanto
dopo il superamento dell'Assignment Gate e la verifica delle evidenze di
rollback readiness.

## Preparation State After EP-05

```text
EP-01 = Complete
EP-03 = Complete
EP-04 = Complete
EP-02 = Complete
EP-05_PLAN = Complete
OWNERSHIP_ASSIGNMENT_GATE = Open
EP-06 = Eligible, not started
ERA-001_ROLLBACK_OWNERSHIP_FINDING = Partially remediated, open
ERA-002 = Not eligible
T1 = Not authorized
TECHNICAL_EXECUTION = Not authorized
IMPLEMENTATION_AUTHORITY = None
```

## Open Questions

1. Chi accetta nominativamente i ruoli di Source Owner, Evidence Owner,
   Compatibility Owner e Rollback Authority?
2. Chi è il candidato Shared Component Steward e quando la sua responsabilità
   diventa effettiva?
3. Chi svolgerà la review indipendente di ERA-002?
4. Quali cumuli di ruolo sono organizzativamente ammessi oltre alle
   incompatibilità già definite?
5. Quale tempo massimo è ammesso tra stop di emergenza e ratifica della
   Governance Authority?
6. Quale periodo di supporto deve avere la Compatibility Surface?
7. Quale evidenza futura dimostrerà che la destinazione di rollback è
   concretamente recuperabile?

