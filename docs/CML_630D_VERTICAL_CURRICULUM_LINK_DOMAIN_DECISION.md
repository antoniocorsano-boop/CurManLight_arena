# CML-630D — Vertical Curriculum Link Domain Decision

> **Modalità:** DECISIONALE — nessuna modifica implementativa  
> **Stato:** DECISIONE FORMALE  
> **Data:** 2026-07-24  
> **Fondazione:** CML-630A (`6c8c93c`), CML-630F (`5c34dc8`), CML-630B (`5c34dc8`), CML-630C (`635fd6a`)  
> **Branch:** `feat/cml-630d-vertical-curriculum-link-domain-decision`

---

## 1. Contesto

### 1.1 Problema di dominio

Come rappresentare le relazioni verticali tra segmenti curricolari di ordini scolastici diversi (infanzia → primaria → secondaria)?

### 1.2 Storia decisionale

| Slice | Decisione | Motivazione |
|-------|-----------|-------------|
| CML-630B | **Modello A** — relazioni incorporate | Semplicità, minore complessità, compatibilità offline perfetta |
| CML-630C | **Modello B** — relazioni esplicite | Evidenza sperimentale: relazioni cross-disciplina, validazione indipendente, tracciabilità |

### 1.3 Conflitto identificato

CML-630B ha scelto Modello A per prudenza. CML-630C ha prodotto evidenza che Modello A non è adeguato per:

- relazioni tra singoli nodi curricolari (non solo tra segmenti);
- collegamenti interdisciplinari (una competenza collega discipline diverse);
- motivazione pedagogica della relazione;
- proposta, validazione e rifiuto indipendenti;
- responsabilità dei ruoli nella validazione;
- stato autonomo della relazione.

---

## 2. Modelli candidati

### 2.1 Modello A — Relazioni incorporate

```typescript
interface CurriculumSegment {
  // ... campi base ...
  sourceSegmentId?: string;      // provenienza (clonazione/evoluzione)
  replacesSegmentId?: string;    // sostituzione (storico)
}
```

**Relazioni gestite:**
- provenienza del segmento
- sostituzione di un segmento precedente
- appartenenza alla versione (implicita)

**Relazioni NON gestite:**
- continuità pedagogica tra nodi
- relazioni interdisciplinari
- validazione indipendente delle relazioni
- stato e workflow delle relazioni

### 2.2 Modello B — Relazioni esplicite

```typescript
interface VerticalCurriculumLink {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: 'prerequisite' | 'continuity' | 'development' | 'deepening' | 'integration' | 'discontinuity';
  status: 'draft' | 'proposed' | 'validated' | 'rejected';
  scope: SegmentScope;
  metadata: {
    pedagogicalRationale: string;
    proposedBy: InstitutionalRole;
    validatedBy?: InstitutionalRole;
    validatedAt?: string;
  };
}
```

**Relazioni gestite:**
- tutte le relazioni pedagogiche tra nodi
- validazione indipendente
- workflow e stato
- tracciabilità completa

**Relazioni NON necessariamente gestite da VerticalCurriculumLink:**
- provenienza del segmento (tecnica, non pedagogica)
- sostituzione del segmento (tecnica, non pedagogica)

### 2.3 Modello C — Ibrido

```typescript
// Relazioni strutturali (tecniche, nel segmento)
interface CurriculumSegment {
  // ... campi base ...
  sourceSegmentId?: string;      // provenienza
  replacesSegmentId?: string;    // sostituzione
}

// Relazioni pedagogiche (entità separata)
interface VerticalCurriculumLink {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: 'continuity' | 'development' | 'deepening' | 'integration' | 'prerequisite' | 'discontinuity';
  status: 'draft' | 'proposed' | 'validated' | 'rejected';
  scope: SegmentScope;
  metadata: {
    pedagogicalRationale: string;
    proposedBy: InstitutionalRole;
    validatedBy?: InstitutionalRole;
    validatedAt?: string;
  };
}
```

**Separazione:**
- `CurriculumSegment` → relazioni strutturali (provenienza, sostituzione, appartenenza)
- `VerticalCurriculumLink` → relazioni pedagogiche (continuità, sviluppo, prerequisito, integrazione)

---

## 3. Analisi multicriterio

### 3.1 Matrice di valutazione

| Criterio | Modello A | Modello B | Modello C |
|----------|-----------|-----------|-----------|
| **Semplicità strutturale** | superiore | inferiore | media |
| **Precisione pedagogica** | limitata | elevata | elevata |
| **Relazioni interdisciplinari** | debole | nativa | nativa |
| **Validazione indipendente** | non naturale | nativa | nativa |
| **Tracciabilità** | ridotta | completa | completa |
| **Carico implementativo** | minore | maggiore | medio |
| **Utilità per e-Twin** | limitata | elevata | elevata |
| **Compatibilità uso documentale semplice** | elevata | potenzialmente eccessiva | bilanciata |
| **Separazione responsabilità** | assente | presente | presente |
| **Coerenza con CML-630A** | neutra | positiva | positiva |

### 3.2 Analisi per criterio

#### Semplicità strutturale
- **A:** Un solo oggetto, poche entità
- **B:** Due entità distinte, doppia gestione
- **C:** Due entità ma con responsabilità chiaramente separate

#### Precisione pedagogica
- **A:** Le relazioni sono implicite, difficili da motivare
- **B:** Ogni relazione ha motivazione, stato, workflow
- **C:** Come B, ma solo per relazioni pedagogiche

#### Relazioni interdisciplinari
- **A:** Difficile collegare nodi di discipline diverse (stessa struttura)
- **B:** Nativo — un link collega qualsiasi nodo
- **C:** Come B

#### Validazione indipendente
- **A:** La validazione è sul segmento, non sulla relazione
- **B:** La relazione ha il proprio workflow
- **C:** Come B, ma solo per relazioni pedagogiche

#### Tracciabilità
- **A:** Solo storico del segmento
- **B:** Storico completo della relazione
- **C:** Come B per relazioni pedagogiche, come A per strutturali

#### Carico implementativo
- **A:** Minore — nessuna entità aggiuntiva
- **B:** Maggiore — entità separata, query, UI
- **C:** Medio — entità separata ma con dominio ridotto

#### Utilità per e-Twin
- **A:** Limitata — non supporta il caso d'uso principale
- **B:** Elevata — supporta nativamente il confronto tra ordini
- **C:** Come B

#### Compatibilità uso documentale semplice
- **A:** Elevata — tutto in un posto
- **B:** Potenzialmente eccessiva — troppi dettagli per uso semplice
- **C:** Bilanciata — strutture semplici, relazioni complesse solo quando necessarie

---

## 4. Evidenza sperimentale (CML-630C)

### 4.1 Scenari testati

| Scenario | Tipo relazione | Modello A | Modello B |
|----------|----------------|-----------|-----------|
| Continuità matematica primaria→secondaria | allineamento competenze | Limitato | Completo |
| Interdisciplinare tecnologia→matematica | cross-disciplina | Non supportato | Nativo |
| Discontinuità italiano | identificazione gap | Parziale | Completo |

### 4.2 Risultati chiave

1. **Relazioni cross-disciplina:** Modello A non le supporta nativamente. Modello B le gestisce come entità prime.

2. **Validazione indipendente:** In Modello A, la validazione è sul segmento. In Modello B, ogni relazione ha il proprio workflow.

3. **Motivazione pedagogica:** In Modello A, le relazioni sono implicite. In Modello B, ogni relazione ha una `pedagogicalRationale`.

4. **Responsabilità ruoli:** In Modello A, non è chiaro chi valida la relazione. In Modello B, ogni relazione traccia `proposedBy` e `validatedBy`.

---

## 5. Decisione formale

### 5.1 Modello scelto: **C — Ibrido**

### 5.2 Motivazione

Il Modello C è la scelta più coerente perché:

1. **Separa responsabilità:** Le relazioni strutturali (provenienza, sostituzione) restano nel segmento. Le relazioni pedagogiche (continuità, sviluppo) diventano entità separate.

2. **Bilancia complessità:** Non introduce VerticalCurriculumLink per ogni relazione tecnica, ma lo riserva alle relazioni con significato pedagogico.

3. **Supporta e-Twin:** Le relazioni pedagogiche hanno stato, workflow e validazione indipendente, come richiesto dal caso d'uso.

4. **Mantiene semplicità:** Per uso documentale semplice, il segmento resta autocontenuto. Le relazioni pedagogiche sono consultabili solo quando necessarie.

5. **Coerente con CML-630A:** I segmenti restano isolati. Le relazioni pedagogiche collegano nodi di segmenti diversi senza violare l'isolamento.

### 5.3 Conseguenze

#### Entità da mantenere

| Entità | Ruolo | Relazioni gestite |
|--------|-------|-------------------|
| `CurriculumSegment` | Struttura | provenienza, sostituzione, appartenenza versione |
| `VerticalCurriculumLink` | Pedagogia | continuità, sviluppo, approfondimento, prerequisito, integrazione, discontinuità |

#### Entità da NON introdurre

| Entità | Motivo |
|--------|--------|
| `CurriculumNode` | Già presente in CML-630C, da promuovere a dominio produttivo |
| `LinkRelationType` | Già definito in CML-630C, da riutilizzare |

#### Workflow relazioni pedagogiche

```text
draft → proposed → validated → approved
                  ↓
               rejected
```

**Ruoli:**
- `docente`: propone relazioni
- `dipartimento`: valida internamente
- `referente`: consolida
- `collegio`: approva (solo per versione complessiva)

#### Campi VerticalCurriculumLink

```typescript
interface VerticalCurriculumLink {
  id: string;                          // UUID v4
  sourceNodeId: string;                // nodo sorgente
  targetNodeId: string;                // nodo destinazione
  relationType: LinkRelationType;      // tipo di relazione pedagogica
  status: LinkStatus;                  // stato del workflow
  scope: SegmentScope;                 // ambito della relazione
  metadata: {
    pedagogicalRationale: string;      // motivazione della relazione
    proposedBy: InstitutionalRole;     // chi ha proposto
    validatedBy?: InstitutionalRole;   // chi ha validato
    validatedAt?: string;              // data validazione
    rejectedBy?: InstitutionalRole;    // chi ha rifiutato
    rejectedAt?: string;               // data rifiuto
    rejectionReason?: string;          // motivo del rifiuto
  };
  createdAt: string;
  updatedAt: string;
}
```

---

## 6. Aggiornamento CML-630B

### 6.1 Sezione 8 da sostituire

La sezione 8 del PROPOSAL_CML_630B ("Relazioni verticali") deve essere aggiornata:

**Prima (CML-630B):**
```text
8.1 Alternativa scelta: Relazioni incorporate nel segmento
→ Scelta: Modello A
→ Scartata: Modello B (over-engineering), Modello C (troppo complesso)
```

**Dopo (CML-630D):**
```text
8.1 Alternativa scelta: Modello C ibrido
→ Scelta: Modello C (ibrido)
→ Motivazione: evidenza CML-630C, relazioni pedagogiche separate
→ Aggiornamento: relazioni strutturali restano nel segmento
```

### 6.2 Impatto su tipi esistenti

| Tipo CML-630B | Impatto |
|---------------|---------|
| `CurriculumSegment` | Mantenuto, con `sourceSegmentId` e `replacesSegmentId` |
| `CurriculumSegmentContent` | Mantenuto, immodificato |
| `InstituteCurriculumVersion` | Mantenuto, immodificato |
| `VerticalCurriculumLink` | **Nuovo** — da introdurre nel dominio produttivo |
| `CurriculumNode` | **Nuovo** — da promuovere da CML-630C a dominio produttivo |

---

## 7. Registry decisionale

### 7.1 Decisione

| Campo | Valore |
|-------|--------|
| ID | `DEC-630D-001` |
| Data | 2026-07-24 |
| Slice | CML-630D |
| Domina | Relazioni verticali curricolari |
| Modello scelto | C — Ibrido |
| Modelli scartati | A (limitato), B (eccessivo per relazioni strutturali) |
| Motivazione | Separazione responsabilità, bilancia complessità, supporta e-Twin |
| Evidenza | CML-630C prototipo e test |
| Impatto | Intro `VerticalCurriculumLink` e `CurriculumNode` nel dominio produttivo |
| Prossima slice | CML-630E — Production Domain Integration |

### 7.2 Conseguenze per futura implementazione

1. **CML-630E** dovrà integrare `VerticalCurriculumLink` e `CurriculumNode` nel dominio produttivo
2. Lo store dovrà supportare le nuove entità
3. La UI dovrà mostrare le relazioni pedagogiche
4. Il workflow dovrà supportare la validazione delle relazioni

---

## 8. Verdetto

```text
CML_630D_DECISION_COMPLETE
MODELLO_C_IBRIDO_ADOPTED
VERTICAL_CURRICULUM_LINK_PROMOTED_TO_PRODUCTION_DOMAIN
CURRICULUM_NODE_PROMOTED_TO_PRODUCTION_DOMAIN
CML_630E_REQUIRED_FOR_IMPLEMENTATION
```

---

## 9. Commit

```
docs(CML-630D): vertical curriculum link domain decision — Modello C ibrido
```
