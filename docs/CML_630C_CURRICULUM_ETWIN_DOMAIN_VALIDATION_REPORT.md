# CML-630C — Curriculum e-Twin Domain Validation Report

**Data:** 2026-07-24  
**Stato:** VALIDATO  
**Branch:** `feat/cml-630c-curriculum-etwin-domain-validation`  
**Commit:** `5c34dc8` (base, nessuna modifica a main)

---

## 1. Obiettivo

Validare il dominio curricolare verticale (CML-630B) tramite prototipo sperimentale isolato, confrontando:

- **Modello A** (relazioni incorporate): le relazioni verticali sono embedded nelle strutture del segmento
- **Modello B** (relazioni esplicite): le relazioni verticali sono entità separate con stato e transizioni

---

## 2. Architettura del Prototipo

```
src/features/curriculum-etwin/
├── domain/
│   ├── types.ts          # Tipi sperimentali (InstituteCurriculumVersion, CurriculumSegment, etc.)
│   └── logic.ts          # Logica di dominio (CRUD, transizioni, validazione, query)
├── data/
│   └── syntheticData.ts  # 3 scenari sintetici con nodi e link
├── hooks/
│   └── useEtwinPrototype.ts  # Hook React per gestione stato e simulazione ruoli
├── components/
│   └── EtwinMainView.tsx  # Vista principale di confronto (Model A vs Model B)
└── index.ts              # Entry point feature
```

**Vincoli rispettati:**
- Nessuna modifica a store, persistenza, UDAs o UI esistenti
- Nessuna dipendenza aggiuntiva
- Solo dati sintetici
- Prototipo completamente isolato

---

## 3. Tipi Dominio

### InstituteCurriculumVersion
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | string | Identificatore univoco |
| title | string | Titolo della versione |
| versionNumber | number | Numero progressivo |
| effectivePeriod | string | Periodo di efficacia |
| status | InstituteCurriculumStatus | Stato attuale |
| previousVersionId | string? | ID versione precedente |
| createdAt / updatedAt | string | Timestamp |

### CurriculumSegment
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | string | Identificatore univoco |
| versionId | string | Riferimento alla versione |
| title | string | Titolo del segmento |
| disciplineOrField | string | Disciplina o campo |
| order | SegmentOrder | Ordine nel curriculum |
| scope | SegmentScope | Ambito (department, school, institute) |
| workflowStatus | SegmentWorkflowStatus | Stato del workflow |

### CurriculumNode
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | string | Identificatore univoco |
| segmentId | string | Riferimento al segmento |
| title | string | Titolo del nodo |
| description | string | Descrizione |
| type | CurriculumNodeType | competence, objective, content, activity, assessment |

### VerticalCurriculumLink
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | string | Identificatore univoco |
| sourceNodeId | string | Nodo sorgente |
| targetNodeId | string | Nodo destinazione |
| relationType | LinkRelationType | prerequisite, alignment, extension, coherence |
| status | LinkStatus | proposed, validated, approved, rejected |
| scope | SegmentScope | Ambito della relazione |

---

## 4. Logica di Dominio

### Funzionalità Implementate
- **CRUD**: createVersion, createSegment, createNode, createLink
- **Transizioni Stato**: transitionVersion, transitionSegment, transitionLink
- **Validazione**: validateLink, canTransitionVersion, canTransitionSegment, canTransitionLink
- **Query**: getVersionWithSegments, getSegmentWithNodes, getLinkWithNodes, getSegmentsByDiscipline, getSegmentsByOrder, getLinksByNode, getLinksByStatus, getNodesBySegment, getNodesByType

### Transizioni Supportate
| Entità | Da | A | Condizione |
|--------|----|----|------------|
| Version | draft → proposed | Sempre |
| Version | proposed → approved | Ruolo: collegio |
| Version | approved → superseded | Ha versione successiva |
| Segment | draft → in_review | Sempre |
| Segment | in_review → approved | Ruolo: dipartimento |
| Link | proposed → validated | Ruolo: dipartimento |
| Link | validated → approved | Ruolo: dipartimento |

---

## 5. Scenari Sintetici

### Scenario 1: Continuità Matematica Primaria→Secondaria
- **Versione:** 2026-2029
- **Segmenti:** Matematica Primaria, Matematica Secondaria I grado
- **Nodi:** 5 competenze (numeri, geometria, misurazione, dati, problem solving)
- **Link:** 5 relazioni di allineamento tra competenze equivalenti
- **Validazione:** Tutti i link validati ✓

### Scenario 2: Progetto Interdisciplinare Tecnologia→Matematica
- **Versione:** 2026-2027
- **Segmenti:** Tecnologia e Innovazione, Matematica Applicata
- **Nodi:** 6 nodi (3 per disciplina)
- **Link:** 3 relazioni cross-disciplina
- **Validazione:** 2 link validati, 1 in attesa

### Scenario 3: Discontinuità/Ripresa Italiano
- **Versione:** 2026-2028
- **Segmenti:** Italiano Scuola Primaria, Italiano Scuola Secondaria I grado
- **Nodi:** 6 competenze linguistiche
- **Link:** 4 relazioni (2 approvate, 2 in validazione)
- **Validazione:** Copertura parziale con gap identificati

---

## 6. Test

### Risultati
```
Test Files  1 passed (1)
     Tests  35 passed (35)
  Duration  9.53s
```

### Copertura Test
- ✅ Creazione versioni con transizioni di stato
- ✅ Creazione segmenti con scope e discipline
- ✅ Creazione nodi con tipologie diverse
- ✅ Creazione link con validazione
- ✅ Transizioni versione (draft → proposed → approved → superseded)
- ✅ Transizioni segmento (draft → in_review → approved)
- ✅ Transizioni link (proposed → validated → approved)
- ✅ Query per disciplina, ordine, nodo, stato
- ✅ Validazione link (cicli, coerenza scope, nodi esistenti)
- ✅ Tutti e 3 gli scenari sintetici

---

## 7. Validazione Tecnica

| Check | Stato |
|-------|-------|
| TypeScript (`tsc --noEmit`) | ✅ Pulito |
| Test (`vitest run`) | ✅ 35/35 passati |
| Build (`npm run build`) | ✅ 1.1 MB gzip 287 KB |
| Storybook (`build-storybook`) | ✅ Build completato |

---

## 8. Confronto Modello A vs Modello B

### Modello A (Relazioni Incorporate)
- Le relazioni sono embedding nei segmenti
- Più semplice da queryare per un singolo segmento
- Ridondanza dati quando una competenza appare in più segmenti
- Difficile gestire relazioni cross-segmento

### Modello B (Relazioni Esplicite)
- Le relazioni sono entità separate (VerticalCurriculumLink)
- Più flessibile per relazioni cross-segmento
- Gestione separata del workflow di validazione
- Supporto nativo per versioning e transizioni

### Raccomandazione
Il **Modello B** è più adatto per il caso d'uso e-Twin perché:
1. Supporta nativamente relazioni cross-disciplina
2. Permette validazione indipendente dalle entità coinvolte
3. Facilita il confronto tra versioni diverse del curricolo
4. Allineato con l'architettura CML-630A (segmenti isolati)

---

## 9. Prossimi Passi

1. **Valutare integrazione** in architettura esistente (CML-630B)
2. **Estendere test** con scenari edge case (cicli, conflitti multipli)
3. **Aggiungere UI** di confronto versioni (solo se richiesto)
4. **Documentare decisioni** di design nel PROPOSAL_CML_630B

---

## 10. Commit

```
feat(CML-630C): curriculum e-twin domain validation prototype
```

**File modificati:**
- `src/features/curriculum-etwin/domain/types.ts`
- `src/features/curriculum-etwin/domain/logic.ts`
- `src/features/curriculum-etwin/data/syntheticData.ts`
- `src/features/curriculum-etwin/hooks/useEtwinPrototype.ts`
- `src/features/curriculum-etwin/components/EtwinMainView.tsx`
- `src/features/curriculum-etwin/index.ts`
- `src/__tests__/curriculum-etwin/etwin-domain.test.ts`
