# CML-630E — Productive Curriculum Domain Report

> **Data:** 2026-07-24  
> **Branch:** `feat/cml-630e-productive-curriculum-domain`  
> **Stato:** CML-630E1 COMPLETATA

---

## 1. Obiettivo

Tradurre la decisione formale CML-630D (Modello C ibrido) nel dominio produttivo minimo di CurManLight.

---

## 2. Contesto

| Slice | Status | Commit |
|-------|--------|--------|
| CML-630A | COMPLETE_REMOTE | `6c8c93c` |
| CML-630F | COMPLETE_REMOTE | `5c34dc8` |
| CML-630B | COMPLETE_REMOTE | `5c34dc8` |
| CML-630C | COMPLETE_REMOTE | `635fd6a` |
| CML-630D | COMPLETE_REMOTE | `7e6b2eb` |

---

## 3. Decisione CML-630D applicata

```text
MODELLO_C_IBRIDO_ADOPTED
```

- `CurriculumSegment` → relazioni strutturali (provenienza, sostituzione, appartenenza)
- `VerticalCurriculumLink` → relazioni pedagogiche (continuità, sviluppo, prerequisito, integrazione)

---

## 4. Perimetro effettivo

### CML-630E1 — Productive Domain Contracts ✅

- Tipi produttivi definiti in `src/domain/curriculum/`
- Funzioni di validazione pure e testabili
- 55 test di dominio
- Nessuna dipendenza dal prototipo e-twin

### CML-630E2 — Persistence and Legacy Compatibility Assessment 📋

- Piano documentato in `docs/CML_630E2_PERSISTENCE_AND_LEGACY_COMPATIBILITY_PLAN.md`
- Nessuna implementazione ancora

---

## 5. Contratti introdotti

### InstituteCurriculumVersion

```typescript
interface InstituteCurriculumVersion {
  id: string;
  institutionId?: string;
  title: string;
  versionNumber: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  status: InstituteCurriculumStatus;
  previousVersionId?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}
```

### CurriculumSegment

```typescript
interface CurriculumSegment {
  id: string;
  versionId: string;
  schoolLevel: SchoolLevel;
  subjectOrFieldId: string;
  scope: SegmentScope;
  frameworkApplicability: FrameworkApplicabilityReference;
  workStatus: CurriculumSegmentWorkStatus;
  sourceSegmentId?: string;
  replacesSegmentId?: string;
  content: CurriculumSegmentContent;
  createdAt: string;
  updatedAt: string;
}
```

### CurriculumNode

```typescript
interface CurriculumNode {
  id: string;
  versionId: string;
  segmentId: string;
  type: CurriculumNodeType;
  title: string;
  description?: string;
  frameworkReferenceId?: string;
  workStatus?: CurriculumNodeWorkStatus;
  sourceNodeId?: string;
  replacesNodeId?: string;
  createdAt: string;
  updatedAt: string;
}
```

### VerticalCurriculumLink

```typescript
interface VerticalCurriculumLink {
  id: string;
  versionId: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: VerticalCurriculumRelationType;
  rationale: string;
  status: VerticalCurriculumLinkStatus;
  createdByRole?: InstitutionalRole;
  validatedByRole?: InstitutionalRole;
  createdAt: string;
  updatedAt: string;
  validatedAt?: string;
}
```

---

## 6. Separazione relazioni strutturali e pedagogiche

| Entità | Tipo relazione | Esempi |
|--------|----------------|--------|
| `CurriculumSegment` | Strutturale | provenienza, sostituzione, appartenenza versione |
| `VerticalCurriculumLink` | Pedagogica | continuità, sviluppo, prerequisito, integrazione, discontinuità |

---

## 7. Invarianti definitive

### Version

- `approved` deve avere `approvedAt`
- `superseded` deve essere stato precedentemente approvato
- `previousVersionId` non può coincidere con `id`
- Periodo di efficacia coerente (`effectiveFrom < effectiveTo`)

### Segment

- Appartenenza a versione esistente
- Scope validato (grade, grade-range, school-level)
- No auto-riferimenti strutturali
- Riferimenti a segmenti esistenti

### Node

- Appartenenza a segmento valido
- Coerenza versionId-segment.versionId
- No auto-riferimenti
- Riferimenti a nodi esistenti

### VerticalCurriculumLink

- Sorgente e destinazione esistenti e diverse
- `rationale` obbligatoria per stati `proposed` e `validated`
- `validatedByRole` e `validatedAt` obbligatori per stato `validated`
- No duplicati logici (stessa source, target, relationType)

---

## 8. Funzioni di dominio

| Funzione | Descrizione |
|----------|-------------|
| `validateInstituteCurriculumVersion` | Validazione versione con invarianti |
| `validateCurriculumSegment` | Validazione segmento con riferimenti |
| `validateCurriculumNode` | Validazione nodo con coerenza versione |
| `validateVerticalCurriculumLink` | Validazione link con stati e ruoli |
| `validateCurriculumDomainGraph` | Validazione grafo completo |
| `canTransitionVersionStatus` | Transizioni stato versione |
| `canTransitionSegmentStatus` | Transizioni stato segmento |
| `canTransitionLinkStatus` | Transizioni stato link |
| `isApprovedVersionImmutable` | Controllo immutabilità |
| `findDuplicateVerticalLinks` | Rilevamento duplicati logici |
| `findDanglingNodeReferences` | Riferimenti pendenti nodi |
| `findDanglingSegmentReferences` | Riferimenti pendenti segmenti |
| `detectInvalidStructuralCycles` | Rilevamento cicli strutturali |

---

## 9. Strategia di compatibilità

- Nessuna dipendenza dal prototipo e-twin
- Nessuna dipendenza dagli store esistenti
- Nessuna dipendenza da IndexedDB
- Funzioni pure e testabili
- Barrel pubblico controllato

---

## 10. Parti riutilizzate dal dominio corrente

| Tipo corrente | Nuovo tipo | Strategia |
|---------------|------------|-----------|
| `SchoolOrder` | `SchoolLevel` | Riuso diretto (re-export) |
| `NationalFramework` | `NationalFramework` | Riuso diretto |
| `CurricularLevel` | `CurriculumSegmentContent` | Adattamento futuro |
| `Proposal` | Proposals nel contenuto | Compatibile |

---

## 11. Parti non ancora integrate

- UI con nuovi tipi
- Store con nuove entità
- Migrazione dati legacy
- Import/Export nuovo formato
- Integrazione e-twin
- Backend o sincronizzazione

---

## 12. Test

```text
Test Files  1 passed (1)
     Tests  55 passed (55)
```

### Copertura

- Version: 12 test (validazione, invarianti, transizioni, immutabilità)
- Segment: 10 test (validazione, scope, riferimenti, cicli)
- Node: 7 test (validazione, coerenza, riferimenti)
- VerticalCurriculumLink: 14 test (validazione, stati, duplicati, relazioni)
- Graph: 6 test (grafo completo, riferimenti pendenti, coerenza)
- Detection: 6 test (duplicati, dangling refs, cicli)

---

## 13. Validazioni

| Check | Stato |
|-------|-------|
| TypeScript (`tsc --noEmit`) | ✅ |
| Test (`vitest run`) | ✅ 55/55 |
| Build (`npm run build`) | ✅ |
| Storybook (`build-storybook`) | ✅ |

---

## 14. File creati

| File | Descrizione |
|------|-------------|
| `src/domain/curriculum/types.ts` | Tipi condivisi e costanti |
| `src/domain/curriculum/version.ts` | Contratto InstituteCurriculumVersion |
| `src/domain/curriculum/segment.ts` | Contratto CurriculumSegment |
| `src/domain/curriculum/node.ts` | Contratto CurriculumNode |
| `src/domain/curriculum/verticalLink.ts` | Contratto VerticalCurriculumLink |
| `src/domain/curriculum/validation.ts` | Funzioni di validazione |
| `src/domain/curriculum/index.ts` | Barrel pubblico |
| `src/__tests__/curriculum-domain/curriculum-domain.test.ts` | Test di dominio |
| `docs/CML_630E2_PERSISTENCE_AND_LEGACY_COMPATIBILITY_PLAN.md` | Piano persistenza |
| `docs/CML_630E_PRODUCTIVE_CURRICULUM_DOMAIN_REPORT.md` | Questo report |

---

## 15. Rischi residui

| Rischio | Impatto | Mitigazione |
|---------|---------|-------------|
| Incompatibilità con dominio legacy | Alto | Adattatori puri documentati |
| Complessità migrazione | Medio | Piano CML-630E2 approvato |
| Performance con molte entità | Medio | Indici appropriati |

---

## 16. Piano CML-630E2

Vedere `docs/CML_630E2_PERSISTENCE_AND_LEGACY_COMPATIBILITY_PLAN.md`

Prossimi passi:
1. Revisione del piano
2. Conferma stabilità contratti CML-630E1
3. Apertura slice implementativa persistenza

---

## 17. Raccomandazione per slice successiva

```text
CML-630F — Curriculum Domain Legacy Compatibility
```

Obiettivo: implementare adattatori tra dominio legacy e nuovo dominio produttivo.

---

## 18. Conferma assenza modifiche

- ✅ Nessuna modifica a store
- ✅ Nessuna modifica a IndexedDB
- ✅ Nessuna modifica a UI produttiva
- ✅ Nessuna modifica a runtime produttivo
- ✅ Nessuna modifica a navigazione
- ✅ Nessuna modifica a dati curricolari reali

---

## 19. Verdetto

```text
CML_630E_PRODUCTIVE_CURRICULUM_DOMAIN_COMPLETE_LOCAL
```
