# CML-637A — Trama Taxonomy Specification

## Stato

- Programma: CML-637 — Trama
- Fase: CML-637A
- Tipo: specifica di dominio
- Implementazione: non avviata
- Stato: draft operativo
- Dipendenze: CML-633B, CML-633C, CML-633D, CML-633G, CML-633J

## 1. Obiettivo

Definire il vocabolario controllato di Trama, le categorie di nodo, le categorie di relazione, le cardinalità, le direzioni, i vincoli di integrità e le regole di validazione necessarie a implementare un grafo curricolare canonico senza introdurre ambiguità semantiche.

CML-637A non implementa componenti visuali e non sceglie una libreria grafica. Produce il contratto di dominio che guiderà CML-637B.

## 2. Decisioni di dominio

1. Il curricolo è modellato come grafo diretto tipizzato.
2. I nodi rappresentano entità curricolari, non elementi visuali.
3. Le relazioni sono entità autonome, identificabili e versionabili.
4. Le viste ad albero sono proiezioni derivate.
5. Il tipo di nodo non coincide con il contesto disciplinare.
6. Lo stesso nodo può appartenere a più discipline, ordini o nuclei.
7. Le relazioni interpretative richiedono una motivazione.
8. Le relazioni approvate e quelle proposte devono restare distinguibili.
9. Le relazioni di prerequisito e appartenenza devono essere acicliche.
10. Ogni elemento approvato deve avere provenienza e versione.

## 3. Famiglie canoniche dei nodi

```ts
export type CurriculumGraphNodeFamily =
  | 'structure'
  | 'outcome'
  | 'learningComponent'
  | 'learningExperience'
  | 'assessmentEvidence'
  | 'sourceReference'
  | 'governance';
```

## 4. Tipi canonici di nodo

```ts
export type CurriculumGraphNodeType =
  // Structure
  | 'curriculum'
  | 'curriculumSection'
  | 'schoolOrder'
  | 'gradeBand'
  | 'grade'
  | 'period'
  | 'disciplinaryArea'
  | 'discipline'
  | 'experienceField'
  | 'thematicCore'
  | 'domainArea'
  | 'curriculumPath'
  | 'curriculumUnit'

  // Outcomes
  | 'purpose'
  | 'learnerProfile'
  | 'competence'
  | 'keyCompetence'
  | 'competenceMilestone'
  | 'learningObjective'
  | 'expectedOutcome'
  | 'performance'
  | 'masteryLevel'

  // Learning components
  | 'concept'
  | 'knowledge'
  | 'skill'
  | 'procedure'
  | 'technique'
  | 'method'
  | 'strategy'
  | 'attitude'
  | 'disposition'
  | 'domainLanguage'
  | 'representation'
  | 'model'
  | 'tool'

  // Learning experiences
  | 'activity'
  | 'exercise'
  | 'laboratory'
  | 'experience'
  | 'project'
  | 'problem'
  | 'task'
  | 'authenticTask'
  | 'situation'
  | 'caseStudy'
  | 'experiment'
  | 'production'
  | 'discussion'
  | 'researchActivity'
  | 'observationActivity'

  // Assessment and evidence
  | 'evidence'
  | 'product'
  | 'observableBehaviour'
  | 'assessment'
  | 'assessmentTask'
  | 'criterion'
  | 'indicator'
  | 'descriptor'
  | 'assessmentLevel'
  | 'rubric'
  | 'observationInstrument'
  | 'formativeFeedback'

  // Sources and references
  | 'normativeSource'
  | 'ministerialDocument'
  | 'europeanDocument'
  | 'institutionalDocument'
  | 'resolution'
  | 'meetingRecord'
  | 'excerpt'
  | 'reference'
  | 'interpretativeNote'
  | 'disciplinarySource'
  | 'bibliographicSource'
  | 'resource'

  // Governance
  | 'proposal'
  | 'observation'
  | 'decision'
  | 'revision'
  | 'approval'
  | 'replacement'
  | 'integration'
  | 'rationale'
  | 'version'
  | 'event'
  | 'responsibility';
```

## 5. Definizioni minime

### Competence milestone

Formulazione di sviluppo ampia e progressiva, generalmente riferita a un periodo o alla conclusione di un segmento scolastico.

### Learning objective

Risultato di apprendimento circoscritto e collocabile in un contesto disciplinare o interdisciplinare.

### Competence

Capacità di mobilitare conoscenze, abilità, strategie, atteggiamenti e risorse in una situazione significativa.

### Knowledge

Informazione, principio, regola, relazione o struttura concettuale che lo studente deve comprendere o richiamare.

### Skill

Azione osservabile o descrivibile che lo studente è in grado di compiere.

### Concept

Idea organizzatrice che consente di interpretare fenomeni, oggetti, processi o rappresentazioni.

### Procedure

Sequenza formalizzata di operazioni.

### Strategy

Modalità scelta per affrontare un compito, prendere una decisione o risolvere un problema.

### Evidence

Elemento osservabile o documentabile che sostiene un giudizio sull’apprendimento.

### Source

Entità che documenta l’origine normativa, istituzionale, disciplinare o interpretativa di un nodo o di una relazione.

## 6. Famiglie canoniche delle relazioni

```ts
export type CurriculumGraphRelationFamily =
  | 'structural'
  | 'developmental'
  | 'prerequisite'
  | 'semantic'
  | 'interdisciplinary'
  | 'didactic'
  | 'assessment'
  | 'documentary'
  | 'revision'
  | 'vertical';
```

## 7. Tipi canonici di relazione

```ts
export type CurriculumGraphRelationType =
  // Structural
  | 'belongsTo'
  | 'contains'
  | 'partOf'
  | 'locatedIn'
  | 'validFor'
  | 'organizedBy'
  | 'specializationOf'
  | 'localFormulationOf'

  // Developmental
  | 'develops'
  | 'contributesTo'
  | 'preparesFor'
  | 'continuesInto'
  | 'deepens'
  | 'consolidates'
  | 'extends'
  | 'transfersTo'
  | 'integrates'
  | 'introduces'
  | 'resumes'

  // Prerequisite
  | 'requires'
  | 'presupposes'
  | 'prerequisiteFor'
  | 'dependsOn'
  | 'uses'
  | 'mobilizes'

  // Semantic
  | 'relatedTo'
  | 'equivalentTo'
  | 'distinctFrom'
  | 'exampleOf'
  | 'applicationOf'
  | 'represents'
  | 'defines'
  | 'specifies'
  | 'sharesConceptWith'
  | 'sharesSkillWith'

  // Interdisciplinary
  | 'interdisciplinaryWith'
  | 'convergesWith'
  | 'contributesWith'
  | 'sharesProblemWith'
  | 'sharesProductWith'
  | 'sharesEvidenceWith'
  | 'transversalTo'
  | 'appliedIn'

  // Didactic
  | 'developedThrough'
  | 'practicedThrough'
  | 'observedThrough'
  | 'produces'
  | 'supportedBy'

  // Assessment
  | 'assessedBy'
  | 'evidencedBy'
  | 'evaluatedThrough'
  | 'describedBy'
  | 'correspondsToLevel'
  | 'usesCriterion'

  // Documentary
  | 'derivedFrom'
  | 'citedIn'
  | 'documentedIn'
  | 'groundedIn'
  | 'interpretedBy'
  | 'approvedThrough'
  | 'includedInVersion'

  // Revision
  | 'replaces'
  | 'modifies'
  | 'corrects'
  | 'supersedes'
  | 'proposalToModify'
  | 'approvedAs'
  | 'rejectedAgainst'

  // Vertical curriculum
  | 'continuity'
  | 'development'
  | 'deepening'
  | 'verticalPrerequisite'
  | 'verticalIntegration'
  | 'discontinuity';
```

## 8. Direzione e simmetria

### Relazioni direzionali obbligatorie

- `belongsTo`
- `partOf`
- `develops`
- `contributesTo`
- `preparesFor`
- `continuesInto`
- `requires`
- `prerequisiteFor`
- `dependsOn`
- `developedThrough`
- `assessedBy`
- `evidencedBy`
- `derivedFrom`
- `replaces`
- tutte le relazioni verticali salvo eventuale rappresentazione inversa calcolata.

### Relazioni simmetriche

- `relatedTo`
- `equivalentTo`
- `distinctFrom`
- `sharesConceptWith`
- `sharesSkillWith`
- `interdisciplinaryWith`
- `convergesWith`
- `sharesProblemWith`
- `sharesProductWith`
- `sharesEvidenceWith`.

Le relazioni simmetriche devono essere memorizzate una sola volta e risolte in entrambe le direzioni dai selettori.

## 9. Cardinalità minime

### Regole generali

- ogni nodo approvato appartiene ad almeno una versione;
- ogni nodo curricolare approvato appartiene ad almeno un contesto strutturale;
- ogni nodo approvato possiede almeno una fonte oppure una decisione istituzionale;
- ogni relazione interpretativa possiede esattamente una motivazione testuale non vuota;
- ogni nodo sostituito ha almeno una relazione `replaces` in ingresso o `supersedes` in uscita coerente con il modello scelto;
- ogni `learningObjective` approvato contribuisce ad almeno un `competenceMilestone`, `competence` o `expectedOutcome`;
- ogni `assessmentTask` deve usare almeno un `criterion` oppure produrre almeno una `evidence`;
- ogni `rubric` contiene o aggrega almeno un `criterion`.

## 10. Compatibilità nodo-relazione

La validazione deve utilizzare una matrice esplicita. Prima matrice minima:

| Relazione | Origine ammessa | Destinazione ammessa |
|---|---|---|
| `belongsTo` | qualsiasi nodo curricolare | nodo strutturale |
| `develops` | obiettivo, abilità, attività | traguardo, competenza |
| `contributesTo` | obiettivo, attività, evidenza | traguardo, competenza, risultato atteso |
| `requires` | obiettivo, abilità, attività | conoscenza, abilità, concetto, strumento |
| `prerequisiteFor` | conoscenza, abilità, concetto, obiettivo | conoscenza, abilità, concetto, obiettivo |
| `developedThrough` | obiettivo, abilità, competenza | attività, laboratorio, progetto, compito |
| `assessedBy` | obiettivo, competenza, abilità | prova, compito di verifica, rubrica |
| `evidencedBy` | competenza, obiettivo, abilità | evidenza, prodotto, comportamento osservabile |
| `derivedFrom` | qualsiasi nodo o relazione curricolare | fonte, estratto, decisione |
| `replaces` | nodo di versione successiva | nodo di versione precedente |
| `interdisciplinaryWith` | nodo curricolare disciplinare | nodo curricolare di disciplina diversa |
| `continuity` | nodo di segmento precedente | nodo di segmento successivo |
| `development` | nodo di segmento precedente | nodo di segmento successivo |
| `deepening` | nodo di segmento precedente | nodo di segmento successivo |
| `discontinuity` | nodo di segmento precedente | nodo di segmento successivo |

La matrice completa sarà implementata come contratto dati e testata in CML-637B.

## 11. Stati canonici

```ts
export type CurriculumGraphValidationStatus =
  | 'draft'
  | 'proposed'
  | 'underReview'
  | 'validated'
  | 'approved'
  | 'rejected'
  | 'superseded'
  | 'archived';

export type CurriculumGraphOrigin =
  | 'national'
  | 'european'
  | 'regional'
  | 'institutional'
  | 'departmental'
  | 'teacher'
  | 'imported'
  | 'experimental'
  | 'aiSuggested';

export type CurriculumGraphCompletenessStatus =
  | 'complete'
  | 'missingSource'
  | 'missingRelations'
  | 'missingContext'
  | 'possibleDuplicate'
  | 'inconsistent'
  | 'needsVerification'
  | 'unclassified';
```

## 12. Contratto minimo del nodo

```ts
export interface CurriculumGraphNode {
  id: EntityId;
  entityType: 'curriculumGraphNode';
  nodeType: CurriculumGraphNodeType;
  family: CurriculumGraphNodeFamily;
  title: string;
  statement?: string;
  description?: string;
  keywords: string[];
  contextIds: EntityId[];
  sourceReferenceIds: EntityId[];
  versionId: EntityId;
  origin: CurriculumGraphOrigin;
  validationStatus: CurriculumGraphValidationStatus;
  completenessStatus: CurriculumGraphCompletenessStatus[];
  metadata: EntityMetadata;
}
```

## 13. Contratto minimo della relazione

```ts
export interface CurriculumGraphEdge {
  id: EntityId;
  entityType: 'curriculumGraphEdge';
  sourceNodeId: EntityId;
  targetNodeId: EntityId;
  relationType: CurriculumGraphRelationType;
  family: CurriculumGraphRelationFamily;
  rationale?: string;
  sourceReferenceIds: EntityId[];
  versionId: EntityId;
  origin: CurriculumGraphOrigin;
  validationStatus: CurriculumGraphValidationStatus;
  metadata: EntityMetadata;
}
```

## 14. Vincoli di integrità

### Errori bloccanti

- identificativo mancante o duplicato;
- tipo di nodo sconosciuto;
- tipo di relazione sconosciuto;
- origine o destinazione inesistente;
- combinazione nodo-relazione non ammessa;
- ciclo in `belongsTo`, `partOf`, `prerequisiteFor`, `verticalPrerequisite`;
- relazione interpretativa senza motivazione;
- versione mancante;
- nodo approvato senza fonte o decisione;
- relazione approvata con estremi non approvati, salvo eccezioni dichiarate;
- nodo `superseded` senza relazione di sostituzione.

### Segnalazioni non bloccanti

- nodo senza connessioni curricolari;
- possibile duplicato semantico;
- obiettivo non collegato a traguardi o competenze;
- competenza priva di evidenze;
- attività non collegata ad apprendimenti;
- progressione verticale incompleta;
- fonte priva di riferimento puntuale;
- relazione approvata ma scarsamente motivata.

## 15. Regole di versionamento

- una versione approvata è immutabile;
- una modifica crea una nuova entità o una nuova revisione collegata;
- nodi concettualmente identici mantengono continuità mediante relazione di versione o sostituzione;
- ogni esportazione dichiara `versionId`;
- le progettazioni conservano l’identificativo e la versione usata;
- le relazioni eliminate restano consultabili nella cronologia.

## 16. Regole per suggerimenti dell’intelligenza artificiale

- `origin` deve essere `aiSuggested`;
- `validationStatus` iniziale deve essere `proposed`;
- `rationale` è obbligatorio;
- devono essere registrati modello, fornitore e data nella provenienza;
- nessun suggerimento può diventare `approved` senza azione umana esplicita;
- il testo trasmesso deve coincidere con l’anteprima approvata dal docente;
- nessuna proposta viene applicata automaticamente.

## 17. Profilo essenziale per l’interfaccia docente

L’interfaccia iniziale espone soltanto i seguenti tipi:

- disciplina;
- nucleo tematico;
- competenza;
- traguardo;
- obiettivo;
- conoscenza;
- abilità;
- attività;
- evidenza;
- fonte.

Gli altri tipi restano disponibili nel dominio e nelle superfici di revisione avanzata.

## 18. Campione di validazione

Il campione CML-637A deve contenere:

- Tecnologia e Matematica;
- un nucleo per disciplina;
- classi prima, seconda e terza della secondaria di primo grado;
- almeno 2 traguardi;
- almeno 6 obiettivi;
- almeno 6 conoscenze;
- almeno 6 abilità;
- almeno 4 attività;
- almeno 4 evidenze;
- almeno 2 fonti;
- almeno 8 relazioni verticali;
- almeno 2 relazioni interdisciplinari;
- almeno 1 discontinuità motivata.

## 19. Criteri di accettazione di CML-637A

CML-637A è completa quando:

1. il vocabolario di nodi e relazioni è chiuso per la prima iterazione;
2. ogni termine ha definizione e famiglia;
3. direzione e simmetria sono definite;
4. la matrice minima di compatibilità è approvata;
5. i vincoli bloccanti e non bloccanti sono distinti;
6. il campione di validazione può essere espresso senza estensioni ad hoc;
7. il modello è compatibile con `EntityId`, `EntityMetadata`, fonti e versioni canoniche;
8. nessuna decisione visuale è incorporata nel dominio;
9. la specifica consente di avviare CML-637B senza ambiguità sostanziali.

## 20. Fuori perimetro

- componenti React;
- libreria di visualizzazione;
- persistenza;
- importazione automatica dell’intero curricolo;
- collaborazione remota;
- profili studente;
- valutazione degli studenti;
- generazione automatica del grafo;
- approvazione automatica di relazioni.

## 21. Prossimo passo

**CML-637B — Canonical Curriculum Graph Domain**

Implementare tipi, validatori, matrice di compatibilità, rilevamento dei cicli, serializzazione e test di dominio a partire da questa specifica.

## 22. Verdetto provvisorio

`CML_637A_TAXONOMY_SPECIFICATION_DRAFT_REMOTE`
