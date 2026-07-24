# PROPOSTA DI DOMINIO — Curricolo Verticale d'Istituto in Transizione

> **Riferimento:** ACADEMIC_YEAR_AND_CURRICULUM_TRANSITION_AUDIT  
> **Stato:** Direzione di dominio APPROVATA — CML-630A COMPLETE_REMOTE — CML-630B–E proposte, non autorizzate  
> **Data:** 2026-07-24  
> **Ultimo aggiornamento:** CML-630F, 24 luglio 2026

---

## 1. CATENA CAUSALE

```text
quadro nazionale (vincolo esterno, immutabile)
  → curricolo verticale d'istituto (oggetto versionato, elaborato dalla scuola)
    → segmenti curricolari (applicabili per coorte, disciplina, classe)
      → progettazione annuale (consuma il contesto approvato)
        → UDA (non determina il regime)
```

La UDA è un **consumatore** del contesto curricolare, non l'origine della regola.

La UDA è consumatrice del contesto curricolare. Non determina il quadro normativo.

---

## 2. TRE LIVELLI

### 2.1 Quadro Nazionale

Fonte normativa immutabile. Non è scelta dell'istituto.

```text
IN2012 → D.M. 254/2012
IN2025 → D.M. 221/2025
```

Ogni quadro contiene le indicazioni nazionali, le linee guida disciplinari, i riferimenti alla certificazione delle competenze (D.M. 14/2024), all'educazione civica (D.M. 183/2024), all'inclusione (D.M. 182/2020).

**Non viene mai modificato dall'istituto.** È il vincolo esterno.

### 2.2 Curricolo Verticale d'Istituto

La rielaborazione locale. È il vero oggetto di dominio.

```text
Indicazioni nazionali
+ continuità verticale
+ scelte formative dell'istituto
+ raccordi disciplinari
+ progressione per classi
+ criteri condivisi nei dipartimenti
```

Caratteristiche:
- È **uno** per ogni istituto
- È **versionato** con periodo di efficacia (non un'istanza per anno)
- Contiene **segmenti** che possono riferirsi a quadri normativi diversi durante la transizione
- È soggetto a: elaborazione → confronto → revisione → approvazione collegiale → sostituzione progressiva
- La validazione è **sempre umana** — il sistema non dichiara autonomamente "approvato"

### 2.3 Progettazione Didattica

Programmazioni e UDA.

- Leggono il segmento curricolare applicabile
- Ne conservano uno snapshot al momento della creazione
- **Non determinano autonomamente il regime normativo**
- **Non modificano il curricolo d'istituto**

---

## 3. TIPI

### 3.1 Anno Accademico

```typescript
interface AcademicYear {
  startYear: number;
  endYear: number;
}

function createAcademicYear(startYear: number): AcademicYear {
  return { startYear, endYear: startYear + 1 };
}

function formatAcademicYear(year: AcademicYear): string {
  return `${year.startYear}/${year.endYear}`;
}

function nextAcademicYear(year: AcademicYear): AcademicYear {
  return createAcademicYear(year.endYear);
}

function academicYearFromRange(range: string): AcademicYear {
  // "2026-2027" o "2026/2027" → createAcademicYear(2026)
  const match = range.match(/(\d{4})\s*[-/]\s*(\d{4})/);
  if (!match) throw new Error(`Invalid academic year format: ${range}`);
  return createAcademicYear(parseInt(match[1]));
}
```

La stringa è una **rappresentazione**, non il modello.

### 3.2 Quadro Nazionale

```typescript
type NationalFramework = 'IN2012' | 'IN2025';

interface FrameworkMetadata {
  id: NationalFramework;
  label: string;
  sourceLaw: string;
  effectiveFrom: AcademicYear;
  description: string;
}

const NATIONAL_FRAMEWORKS: Record<NationalFramework, FrameworkMetadata> = {
  IN2012: {
    id: 'IN2012',
    label: 'Indicazioni Nazionali 2012',
    sourceLaw: 'D.M. 254/2012',
    effectiveFrom: createAcademicYear(2012),
    description: 'Ordinamento previgente per la scuola dell\'infanzia e del primo ciclo',
  },
  IN2025: {
    id: 'IN2025',
    label: 'Indicazioni Nazionali 2025',
    sourceLaw: 'D.M. 221/2025',
    effectiveFrom: createAcademicYear(2026),
    description: 'Nuove indicazioni nazionali con allineamento alle competenze chiave europee',
  },
};
```

### 3.3 Ordine Scolastico

```typescript
type SchoolOrder = 'infanzia' | 'primaria' | 'secondaria';

const ALL_SCHOOL_ORDERS: SchoolOrder[] = ['infanzia', 'primaria', 'secondaria'];

const MAX_CLASS_LEVEL: Record<SchoolOrder, number> = {
  infanzia: 0,   // fascia unica
  primaria: 5,
  secondaria: 3,
};
```

### 3.4 Piano di Transizione — Politica stabile

Il D.M. 221/2025 stabilisce l'adozione graduale a partire dalle classi prime dal 2026/2027. Non serve una regola per ogni anno: serve una **politica stabile** che il resolver applica a qualunque anno scolastico.

```typescript
interface TransitionPolicy {
  targetFramework: NationalFramework;
  sourceFramework: NationalFramework;
  firstEntryAcademicYear: AcademicYear;   // 2026/2027
  immediateOrders: SchoolOrder[];          // infanzia
  progressiveOrders: SchoolOrder[];        // primaria, secondaria
}
```

**Resolver normativo puro (CML-630A):**

```typescript
function resolveNationalFramework(
  context: {
    schoolOrder: SchoolOrder;
    schoolYear: AcademicYear;
    classLevel?: number;
  },
  policy: TransitionPolicy = DEFAULT_TRANSITION_POLICY
): FrameworkResolution {
  // 1. Ordini a adozione immediata
  if (policy.immediateOrders.includes(context.schoolOrder)) {
    if (context.schoolYear.startYear >= policy.firstEntryAcademicYear.startYear) {
      return { framework: policy.targetFramework, reason: 'immediate-order' };
    }
    return { framework: policy.sourceFramework, reason: 'pre-transition' };
  }

  // 2. Ordini a progressione per coorte
  if (context.classLevel === undefined || context.classLevel < 1) {
    return { framework: policy.sourceFramework, reason: 'no-class-level' };
  }

  // L'anno in cui la coorte è entrata alla classe 1
  const cohortEntryYear = context.schoolYear.startYear - (context.classLevel - 1);

  if (cohortEntryYear >= policy.firstEntryAcademicYear.startYear) {
    return { framework: policy.targetFramework, reason: 'cohort-progression' };
  }

  return { framework: policy.sourceFramework, reason: 'legacy-cohort' };
}

interface FrameworkResolution {
  framework: NationalFramework;
  reason:
    | 'immediate-order'
    | 'cohort-progression'
    | 'legacy-cohort'
    | 'pre-transition'
    | 'no-class-level';
}
```

**La formula non contiene stringhe hard-coded per anno.** Funziona nel 2032 senza aggiungere righe.

Costante predefinita:

```typescript
const DEFAULT_TRANSITION_POLICY: TransitionPolicy = {
  targetFramework: 'IN2025',
  sourceFramework: 'IN2012',
  firstEntryAcademicYear: createAcademicYear(2026),
  immediateOrders: ['infanzia'],
  progressiveOrders: ['primaria', 'secondaria'],
};
```

### 3.5 Matrice pluriennale derivata

La tabella non è codificata riga per riga — è il **risultato** della formula applicata ad anni e classi.

| Anno scolastico | Primaria         | Secondaria di I grado |
|-----------------|------------------|-----------------------|
| 2026/2027       | 1ª IN2025        | 1ª IN2025             |
| 2027/2028       | 1ª–2ª IN2025     | 1ª–2ª IN2025          |
| 2028/2029       | 1ª–3ª IN2025     | tutte IN2025          |
| 2029/2030       | 1ª–4ª IN2025     | tutte IN2025          |
| 2030/2031       | tutte IN2025     | tutte IN2025          |

Verifica: primaria ha 5 classi. La coorte che entra nella 1ª nel 2026/2027 raggiunge la 5ª nel 2030/2031. La transizione primaria si completa nel **2030/2031**, non nel 2029/2030.

### 3.6 Stato del Curricolo d'Istituto

Due livelli di stato, non confondibili:

**Stato della versione complessiva (approssimazione concettuale):**

```typescript
type InstituteCurriculumStatus =
  | 'draft'
  | 'under-review'
  | 'proposed-to-collegio'
  | 'approved'
  | 'superseded';
```

**Stato del singolo segmento (lavoro della scuola):**

```typescript
type SegmentWorkflowStatus =
  | 'not-started'
  | 'draft'
  | 'open-for-contributions'
  | 'under-review'
  | 'ready-for-consolidation'
  | 'included-in-proposal'
  | 'effective';
```

La versione complessiva diventa `approved` quando il collegio approva. I segmenti diventano `effective` perché inclusi nella versione approvata.

### 3.7 Versionamento del Curricolo

Una versione può restare valida per più anni. Durante la transizione si pubblicano revisioni solo quando cambiano segmenti o decisioni istituzionali.

> *Nota: lo schema sottostante è una stima preliminare. Le definizioni definitive saranno stabilite in CML-630B.*

```typescript
interface InstituteCurriculumVersion {
  id: string;
  version: number;
  effectiveFrom: AcademicYear;
  effectiveUntil?: AcademicYear;    // null = ancora attiva
  status: InstituteCurriculumStatus;
  segments: CurriculumSegment[];
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  supersededAt?: string;
  supersededBy?: string;
}
```

### 3.8 Segmento Curricolare

> *Nota: lo schema sottostante è una stima preliminare. Le definizioni definitive saranno stabilite in CML-630B.*

```typescript
interface CurriculumSegment {
  id: string;
  versionId: string;                  // riferimento alla versione del curricolo
  schoolOrder: SchoolOrder;
  classLevel?: number;                // 1-5 primaria, 1-3 secondaria, null per infanzia
  disciplineOrField: string;         // "italiano", "matematica", "campi di esperienza"
  applicableFramework: NationalFramework;   // derivato dalla norma, non scelto dall'utente
  institutionalContentStatus: SegmentWorkflowStatus;  // lavoro della scuola su questo segmento
  previousSegmentId?: string;         // il segmento che sostituisce (per storico)
  replacesSegmentId?: string;         // il segmento che viene sostituito
  traguardi: string[];
  obiettivi: string[];
  evidenze: string[];
  nucleiFondanti?: string[];
  proposals: Proposal[];             // raccordi IN2012→IN2025
  version: number;                    // incremento ad ogni modifica
  lastModifiedAt: string;
  lastModifiedBy?: string;
}
```

**Nota:** `applicableFramework` è derivato dalla norma tramite il resolver. `institutionalContentStatus` è il lavoro della scuola. Sono dati indipendenti. Un segmento con `applicableFramework: 'IN2025'` e `institutionalContentStatus: 'not-started'` significa: "la norma richiede IN2025, ma la scuola non ha ancora elaborato questo segmento".

**Il referente non può sovrascrivere liberamente `applicableFramework`.** I casi ambigui richiedono conferma del contesto, non override normativo.

### 3.9 Contesto di Risoluzione (stima preliminare)

> *Nota: queste interfacce sono ipotesi orientative. Saranno stabilite in CML-630B.*

```typescript
type ResolutionStatus =
  | 'resolved'                      // contesto determinato
  | 'requires-context-confirmation' // caso ambiguo, conferma umana necessaria
  | 'legacy-unresolved';            // dati legacy non risolvibili

interface CurriculumResolution {
  framework: NationalFramework;
  status: ResolutionStatus;
  reason: FrameworkResolution['reason'];
  segmentId?: string;               // se trovato
  segmentStatus?: SegmentWorkflowStatus;
  curriculumVersion?: string;       // se trovato
}
```

### 3.10 Risolutori (stima preliminare)

> *Nota: `resolveNationalFramework` è implementata in CML-630A. Gli altri due risolutori sono stime preliminari per CML-630B.*

```typescript
// IMPLEMENTATA — CML-630A COMPLETE_REMOTE
function resolveNationalFramework(
  context: { schoolOrder: SchoolOrder; schoolYear: AcademicYear; classLevel?: number },
  policy?: TransitionPolicy
): FrameworkResolution;

// STIMA PRELIMINARE — CML-630B PROPOSTA, NON AUTORIZZATA
function resolveInstituteSegment(
  context: {
    versions: InstituteCurriculumVersion[];
    schoolOrder: SchoolOrder;
    classLevel?: number;
    discipline: string;
    schoolYear: AcademicYear;
  }
): CurriculumResolution;

// STIMA PRELIMINARE — CML-630D PROPOSTA, NON AUTORIZZATA
function resolvePlanningContext(
  context: {
    versions: InstituteCurriculumVersion[];
    schoolOrder: SchoolOrder;
    classLevel?: number;
    discipline: string;
    schoolYear: AcademicYear;
  }
): CurriculumResolution;
```

---

## 4. WORKFLOW COLLABORATIVO

```text
Docente
  ELABORA: contribuisce alla stesura dei segmenti curricolari per la propria disciplina
  PROGETTA: propone traguardi, obiettivi, evidenze, raccordi verticali
  REVISIONA: legge e commenta i segmenti elaborati da colleghi della stessa disciplina
  DISCUTE: partecipa a riunioni di dipartimento, interclasse, intersezione
  PROPONE: le scelte vanno in capo al referente per la sintesi al collegio
  LEGGE: il segmento applicabile per ciascuna delle proprie classi
  PROGETTA: programmazioni e UDA che leggono il contesto curricolare

Referente curricolo (coord. di dipartimento)
  GOVERNA: versioni del curricolo d'istituto e matrice di applicabilità
  SINTETIZZA: raccoglie le proposte dei docenti e le compone in un documento coerente
  CONSOLIDA: porta al collegio la proposta elaborata con il dipartimento
  VISUALIZZA: stato complessivo della transizione per tutti gli ordini

Dipartimento disciplinare
  DISCUTE: le proposte dei docenti in sede di riunione
  ARMONIZZA: i raccordi verticali tra infanzia, primaria, secondaria
  VALIDA internamente: prima che il referente porti al collegio
  SEGNA: cosa è pronto per la consolidazione, cosa necessita di ulteriore lavoro

Interclasse / Intersezione
  VERIFICA: coerenza tra classi e sezioni della stessa fascia
  SEGNA: discontinuità o punti di intersezione deboli

Collegio dei docenti
  APPROVA: la versione complessiva del curricolo d'istituto
  VALIDA: esternamente il lavoro di dipartimento e referente
  È l'unico organo che può dichiarare "approved" una versione

Sistema (CurManLight)
  NON dichiara mai autonomamente "approved"
  MOSTRA: matrice, stato, progressione, contesto
  CALCOLA: quale framework si applica (resolver puro CML-630A)
  SUGGERisce: segmenti da rielaborare, coorti da aprire
  TRACCIERA: chi ha fatto cosa, quando, con quale esito
  NON DECIDE: la decisione è sempre umana e collegiale
```

---

## 5. VISUALIZZAZIONI

### 5.1 Vista per anno corrente

```text
┌─────────────┬──────────────┬─────────────────┬───────────────────────┐
│ Ordine      │ Classe       │ Framework       │ Stato contenuto       │
├─────────────┼──────────────┼─────────────────┼───────────────────────┤
│ Infanzia    │ Fascia Unica │ IN2025          │ effective             │
│ Primaria    │ 1ª           │ IN2025          │ under-review          │
│ Primaria    │ 2ª           │ IN2012          │ effective             │
│ Primaria    │ 3ª           │ IN2012          │ effective             │
│ Primaria    │ 4ª           │ IN2012          │ effective             │
│ Primaria    │ 5ª           │ IN2012          │ effective             │
│ Secondaria  │ 1ª           │ IN2025          │ included-in-proposal  │
│ Secondaria  │ 2ª           │ IN2012          │ effective             │
│ Secondaria  │ 3ª           │ IN2012          │ effective             │
└─────────────┴──────────────┴─────────────────┴───────────────────────┘
```

### 5.2 Vista multi-anno (progressione per coorte)

```text
┌─────────────┬────────┬──────────┬──────────┬──────────┬──────────┐
│ Coorte      │ 26/27  │ 27/28    │ 28/29    │ 29/30    │ 30/31    │
├─────────────┼────────┼──────────┼──────────┼──────────┼──────────┤
│ Prim. Cl.1  │ IN2025 │ IN2025   │ IN2025   │ IN2025   │ IN2025   │
│ Prim. Cl.2  │ IN2012 │ IN2025   │ IN2025   │ IN2025   │ IN2025   │
│ Prim. Cl.3  │ IN2012 │ IN2012   │ IN2025   │ IN2025   │ IN2025   │
│ Prim. Cl.4  │ IN2012 │ IN2012   │ IN2012   │ IN2025   │ IN2025   │
│ Prim. Cl.5  │ IN2012 │ IN2012   │ IN2012   │ IN2012   │ IN2025   │
│ Sec. Cl.1   │ IN2025 │ IN2025   │ IN2025   │ IN2025   │ IN2025   │
│ Sec. Cl.2   │ IN2012 │ IN2025   │ IN2025   │ IN2025   │ IN2025   │
│ Sec. Cl.3   │ IN2012 │ IN2012   │ IN2025   │ IN2025   │ IN2025   │
└─────────────┴────────┴──────────┴──────────┴──────────┴──────────┘
```

Primaria si completa nel 2030/2031 (la coorte che entra nella 1ª nel 2026 raggiunge la 5ª nel 2031).

### 5.3 Vista stato contenuto (per segmento)

```text
┌────────────────────────┬──────────┬─────────────────┬─────────────────────┐
│ Segmento               │ Anno     │ Framework       │ Stato contenuto     │
├────────────────────────┼──────────┼─────────────────┼─────────────────────┤
│ Prim. 1ª · Italiano    │ 26/27    │ IN2025          │ under-review        │
│ Prim. 2ª · Italiano    │ 26/27    │ IN2012          │ effective           │
│ Prim. 3ª · Italiano    │ 26/27    │ IN2012          │ effective           │
│ Sec. 1ª · Tecnologia   │ 26/27    │ IN2025          │ included-in-proposal│
│ Sec. 2ª · Tecnologia   │ 26/27    │ IN2012          │ not-started         │
└────────────────────────┴──────────┴─────────────────┴─────────────────────┘
```

---

## 6. CML-630A — NATIONAL FRAMEWORK APPLICABILITY FOUNDATION

**Status:** COMPLETE_REMOTE  
**Commit:** `6c8c93c`

### Risultato

CML-630A risponde **esclusivamente** alla domanda:

> Quale quadro nazionale è applicabile a un dato ordine, classe e anno scolastico?

### Perimetro effettivo

```text
src/types/curriculumTransition.ts
src/lib/curriculumTransitionResolver.ts
src/__tests__/curriculum-transition-resolver.test.ts
```

### Contenuti implementati

```ts
// Tipi
AcademicYear, createAcademicYear, formatAcademicYear, nextAcademicYear, academicYearFromRange
NationalFramework, FrameworkMetadata, NATIONAL_FRAMEWORKS
SchoolOrder, ALL_SCHOOL_ORDERS, MAX_CLASS_LEVEL
TransitionPolicy, DEFAULT_TRANSITION_POLICY
FrameworkResolution

// Funzioni
resolveNationalFramework()
```

### Evidenze

- Resolver puro, nessuna dipendenza dalla data corrente
- Formula per coorte: `cohortEntryYear = academicYear.startYear - (classLevel - 1)`
- Anno scolastico strutturato (`AcademicYear`)
- Nessuna regola ripetuta per anno
- Matrice 2025/2026 → 2030/2031 completa
- Stabilità futura testata fino al 2050
- 122 nuovi test
- 472/472 test complessivi
- TypeScript 0 errori
- Build Vite verde
- Storybook verde

### NON entra in CML-630A

```text
InstituteCurriculumVersion
CurriculumSegment
Workflow collaborativo
Persistenza (store)
Versionamento
resolveInstituteSegment()
resolvePlanningContext()
UDA
UI
Annual rollover
```

**Nessuna integrazione runtime è ancora attiva.** Il resolver CML-630A esiste nel dominio puro ma non è integrato nei componenti esistenti. La formula runtime preesistente (`schoolYear === '2026-2027' && ...`) non è stata sostituita.

---

## 7. SEQUENZA CML-630

### CML-630A — National Framework Applicability Foundation

**Status:** COMPLETE_REMOTE  
**Commit:** `6c8c93c`

Resolver normativo puro. `AcademicYear`, `TransitionPolicy`, `resolveNationalFramework()`, test.  
905 LOC, 3 file, 122 test.

### CML-630B — Institute Curriculum Version and Segment Model

**Status:** PROPOSTA — NON AUTORIZZATA

Versioni del curricolo con periodo di efficacia, segmenti con framework e stato del lavoro, relazioni di sostituzione. CRUD dello store.  
Stima preliminare: ~400 LOC, 8 file.

### CML-630C — Collaborative Vertical Curriculum Workspace

**Status:** PROPOSTA — NON AUTORIZZATA

Workspace per tutti i ruoli. Docente come autore e revisore; dipartimento/interclasse/intersezione; referente consolidatore; collegio come approvazione esterna. Docente fruitore per le proprie classi.  
Stima preliminare: ~750 LOC, 8 file.

### CML-630D — Planning Context Integration

**Status:** PROPOSTA — NON AUTORIZZATA

Programmazione e UDA consumano una versione e un segmento efficaci. Snapshot di contesto nella UDA.  
Stima preliminare: ~500 LOC, 12 file.

### CML-630E — Annual Transition and Curriculum Evolution

**Status:** PROPOSTA — NON AUTORIZZATA

Apertura delle nuove coorti, preparazione dei segmenti successivi, conservazione storica. Nessuna modifica retroattiva.  
Stima preliminare: ~450 LOC, 8 file.

---

## 8. CRITERI DI VALUTAZIONE

| Criterio | Valutazione |
|---------|-------------|
| **Valore per il docente** | Alto — vede il contesto di ogni propria classe; elabora, revisiona e propone segmenti; progetta con il contesto giusto |
| **Valore per il dipartimento** | Alto — vede lo stato di avanzamento della rielaborazione; armonizza i raccordi verticali |
| **Valore per l'istituto** | Alto — matrice visibile, storico conservato, progressione tracciata, versioni con efficacia |
| **Riduzione tempo** | Alto — eliminazione della formula hard-coded, contesto derivato automaticamente |
| **Riduzione complessità percepita** | Medio — nuovo modello da imparare, ma più trasparente e corretto dell'attuale |
| **Impatto tecnico** | Medio — nuovi tipi e resolver puri, nessuna modifica strutturale allo store attuale |

---

## 9. RISCHI

| Rischio | Probabilità | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| Modello troppo complesso per il caso d'uso attuale | Media | Alto | 630A è solo dominio puro, nessuna UI |
| Resistenza al cambiamento (formula attuale funziona) | Media | Medio | La formula resterà fino a 630D |
| Il piano ministeriale potrebbe cambiare | Bassa | Alto | La TransitionPolicy è configurabile, non hard-coded |
| Over-engineering per un'app di una scuola | Bassa | Medio | Il modello è proporzionato al problema reale |
| Mancanza di test per la matrice pluriennale | Bassa | Alto | 630A include test dedicati |

---

## 10. STATO DEL DOCUMENTO

```text
DOCUMENTO: RIALLINEATO LOCALMENTE
COMMIT: AUTORIZZATO (CML-630F)
PUSH: NON AUTORIZZATO
```

---

## 11. VERDETTO

```text
DIREZIONE DI DOMINIO: APPROVATA
CML-630A: COMPLETE_REMOTE (6c8c93c)
CML-630B–E: PROPOSTE, NON AUTORIZZATE
```

---

## 12. PROSSIMA AZIONE

```text
NEXT_SLICE_STATUS: CML-630B_CANDIDATE
IMPLEMENTAZIONE: NON AUTORIZZATA
```

La prossima azione è una proposta formale product-first e di dominio per:

**CML-630B — Institute Curriculum Version and Segment Model**

Non autorizzare CML-630B automaticamente.

---

*Proposta riallineata con CML-630F il 24 luglio 2026.*
