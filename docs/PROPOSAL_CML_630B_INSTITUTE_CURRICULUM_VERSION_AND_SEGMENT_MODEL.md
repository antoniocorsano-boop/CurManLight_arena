# CML-630B — Institute Curriculum Version and Segment Model

> **Modalità:** READ-ONLY — nessun file modificato  
> **Stato:** PROPOSTA FORMALE — PRONTA PER REVISIONE  
> **Data:** 2026-07-24  
> **Fondazione:** CML-630A COMPLETE_REMOTE (`6c8c93c`), CML-630F COMPLETE_REMOTE (`5c34dc8`)  
> **Repository:** `5c34dc8`, divergenza 0 0, working tree pulito

---

## 1. Stato remoto verificato

```text
HEAD == origin/main == 5c34dc8
Divergenza: 0 0
Working tree: pulito
```

Milestone consolidate:

| Slice | Status | Commit |
|-------|--------|--------|
| CML-630A — National Framework Applicability Foundation | COMPLETE_REMOTE | `6c8c93c` |
| CML-630F — Curriculum Transition Documentation Alignment | COMPLETE_REMOTE | `5c34dc8` |

CML-630A ha introdotto: `AcademicYear`, `NationalFramework`, `TransitionPolicy`, `FrameworkResolution`, `resolveNationalFramework()`, helper per anni scolastici, matrice pluriennale testata, validazione contesti invalidi, nessuna dipendenza dalla data corrente.

---

## 2. Contratti esistenti

### 2.1 Tipi curricolari — `src/types/curriculum.ts`

| Elemento | Requisiti | Valutazione |
|----------|-----------|-------------|
| `SchoolOrder` (`'infanzia' \| 'primaria' \| 'secondaria'`) | Tipo condiviso | **Riusabile** — già in `curriculumTransition.ts` |
| `DecisionStatus` (`'approved' \| 'rejected' \| 'custom'`) | Stato voto su proposta | **Parzialmente riusabile** — estendibile per il workflow segmento |
| `UserRole` (`'insegnante' \| 'dipartimento' \| 'referente' \| 'dirigente' \| 'collegio' \| 'amministratore'`) | Ruoli utente | **Riusabile** — mappa direttamente ai ruoli del workflow |
| `Proposal` (`id`, `focus`, `oldText`, `newText`, `notes`) | Proposta di modifica testuale | **Riusabile** — concetto di base per le proposte di revisione segmento |
| `CurricularLevel` (`traguardi[]`, `obiettivi[]`, `proposals[]`, `evidenze[]`, `nucleiFondanti[]`) | Livello curricolare per ordine | **Parzialmente riusabile** — diventa il contenuto di un segmento |
| `DisciplineData` (`infanzia`, `primaria`, `secondaria`) | Mappa disciplina→ordine→CurricularLevel | **Non riusabile** come struttura fissa — va sostituita dal modello versionato |
| `UdaModel` (`id`, `title`, `discipline`, `order`, `period`, `hours`, `status`, `traguardi[]`, `obiettivi[]`, `evidenze[]`, `realTask`, `notes`, `createdAt`, `updatedAt?`) | Modello UDA | **Da non toccare** in CML-630B — consumo in CML-630D |
| `UserState` (role, discipline, order, schoolYear, decisions, customTexts, savedUda, filtri UI) | Stato globale utente | **Parzialmente riusabile** — schoolYear va in `AcademicYear` strutturato |

### 2.2 Fondazione normativa — `src/types/curriculumTransition.ts`

| Elemento | Valutazione |
|----------|-------------|
| `AcademicYear`, `createAcademicYear`, `formatAcademicYear`, `isValidAcademicYear` | **Riusabile** — CML-630B li consuma direttamente |
| `NationalFramework`, `ALL_SCHOOL_ORDERS`, `MAX_CLASS_LEVEL` | **Riusabile** |
| `TransitionPolicy`, `DEFAULT_TRANSITION_POLICY` | **Riusabile** — immutabile |
| `FrameworkResolution`, `ResolutionStatus`, `ResolutionReason` | **Riusabile** — estende per segmento |
| `resolveNationalFramework()` | **Riusabile** — CML-630B aggiunge `resolveInstituteSegment()` |

### 2.3 Knowledge base — `src/data/curriculumKB.ts`

| Elemento | Valutazione |
|----------|-------------|
| Struttura `Record<string, DisciplineData>` (disciplina→ordine→CurricularLevel) | **Non riusabile** come struttura versionata — diventa il contenuto iniziale del primo segmento legacy |
| Contenuti (traguardi, obiettivi, evidenze, proposals, nucleiFondanti) | **Riusabile** — migrabili come snapshot del segmento iniziale |

### 2.4 Store — `src/store/useCurriculumStore.ts`

| Elemento | Valutazione |
|----------|-------------|
| Zustand + persist + Dexie IndexedDB | **Riusabile** — architettura di persistenza confermata |
| `schoolYear: string` (default `'2025-2026'`) | **Parzialmente riusabile** — va affiancato da `AcademicYear` strutturato |
| `decisions: Record<string, DecisionStatus>` | **Riusabile** — estendibile per voti su versioni |
| `customTexts: Record<string, string>` | **Riusabile** — estende `Proposal` |
| `savedUda: UdaModel[]` | **Da non toccare** in CML-630B |
| `activeRevisionFilter: 'all' \| 'pending' \| 'approved' \| 'rejected'` | **Riusabile** — allineabile ai nuovi stati |

### 2.5 Formula hard-coded

| Elemento | Valutazione |
|----------|-------------|
| `schoolYear === '2026-2027' && targetClass !== '1' && order !== 'infanzia'` in `useUdaProgrammingHandlers.ts:77` e `ProgettazioneTab.tsx:605-619` | **Da sostituire** in CML-630D — CML-630B fornisce il resolver |

### 2.6 Riepilogo riusabilità

```text
Riusabili:           SchoolOrder, UserRole, Proposal, tutti i tipi CML-630A, store architecture
Parzialmente:        DecisionStatus, CurricularLevel, UserState (estendibili)
Non riusabili:       DisciplineData (struttura fissa), curriculumKB (struttura non versionata)
Da non toccare:      UdaModel, savedUda, programmazione, UI, export
Da sostituire:       formula year-pegged (in CML-630D)
```

---

## 3. Problema di dominio

Il sistema attuale ha un curricolo statico hardcoded in `curriculumKB` come `Record<string, DisciplineData>`. Non esiste:

- una **versione** del curricolo verticale d'istituto
- un **segmento** curricolare che associ un contenuto a un ordine, classe, disciplina e framework
- uno **stato del lavoro** della scuola su ciascun segmento
- un **workflow collaborativo** tra docente, dipartimento, referente e collegio
- uno **storico** delle versioni precedenti
- una **validità temporale** delle versioni

La UDA attualmente non ha `schoolYear` strutturato né riferimento al segmento curricolare di provenienza. La formula `isReformed` è year-pegged e non scalabile.

**CML-630B risponde alla domanda:**

> Come rappresentiamo, in modo coerente e scalabile, le versioni del curricolo verticale d'istituto e i relativi segmenti, distinguendo applicabilità normativa, stato del lavoro della scuola, workflow collaborativo e validità temporale?

---

## 4. Modello della versione

### 4.1 Interfaccia

```typescript
interface InstituteCurriculumVersion {
  id: string;                          // UUID stabile
  versionNumber: number;               // incrementale, mai riciclato
  title: string;                       // es. "Curricolo verticale 2026-2028"
  status: InstituteCurriculumStatus;
  effectiveFrom: AcademicYear;         // da CML-630A
  effectiveUntil?: AcademicYear;       // null = ancora attiva
  createdAt: string;                   // ISO 8601
  updatedAt: string;                   // ISO 8601
  proposedAt?: string;                 // quando proposta al collegio
  approvedAt?: string;                 // quando approvata dal collegio
  supersededAt?: string;               // quando sostituita
  previousVersionId?: string;          // id della versione precedente
}
```

### 4.2 Macchina a stati

```text
                  ┌──────────┐
                  │  draft   │
                  └────┬─────┘
                       │ referente consolida
                       ▼
              ┌─────────────────┐
              │  under-review   │◀──┐
              └────────┬────────┘   │
                       │            │ rinvio per revisione
            ┌──────────┤            │
            ▼          ▼            │
   ┌─────────────┐  ┌──────────┐   │
   │  proposed-  │  │ rejected │───┘
   │  to-collegio│  └──────────┘
   └──────┬──────┘
          │ collegio approva
          ▼
   ┌────────────┐
   │  approved  │
   └─────┬──────┘
         │ nuova versione creata
         ▼
   ┌────────────┐
   │ superseded │
   └────────────┘
```

### 4.3 Transizioni

| Da | A | Chi | Evidenza | Reversibile | Effetto validità | Decisione umana |
|----|---|-----|----------|-------------|------------------|-----------------|
| `draft` | `under-review` | Referente | Contenuti consolidati, almeno 1 segmento | Sì | Nessuno | No |
| `under-review` | `proposed-to-collegio` | Referente | Tutti i segmenti pronti, consenso dipartimento | Sì | Nessuno | No |
| `proposed-to-collegio` | `approved` | Collegio | Voto formale collegio | **No** | `approvedAt` settato, `effectiveFrom` valido | **Sì** |
| `proposed-to-collegio` | `under-review` | Collegio | Rinvio per revisione | Sì | Nessuno | **Sì** |
| `under-review` | `draft` | Referente | Revisione necessaria | Sì | Nessuno | No |
| `approved` | `superseded` | Sistema | Nuova versione approvata | **No** | `supersededAt` settato | No (automatico) |

**Il sistema non dichiara mai autonomamente `approved`.** Solo il collegio può farlo.

---

## 5. Modello del segmento

### 5.1 Interfaccia

```typescript
interface CurriculumSegment {
  id: string;                                    // UUID stabile
  curriculumVersionId: string;                   // riferimento alla versione
  schoolOrder: SchoolOrder;
  classLevel?: number;                           // 1-5 primaria, 1-3 secondaria, null per infanzia
  disciplineOrField: string;                     // "italiano", "matematica", "campi di esperienza"
  applicableFramework: NationalFramework;         // derivato dalla norma (CML-630A)
  institutionalContentStatus: SegmentWorkflowStatus;  // lavoro della scuola
  sourceSegmentId?: string;                      // segmento da cui deriva (per clonazione/evoluzione)
  replacesSegmentId?: string;                    // segmento che sostituisce (per storico)
  contentVersion: number;                        // incrementale ad ogni modifica contenuto
  updatedAt: string;                             // ISO 8601
}
```

### 5.2 Contenuto del segmento (struttura interna)

Il contenuto curricolare effettivo è mantenuto in un tipo separato per chiarezza:

```typescript
interface CurriculumSegmentContent {
  traguardi: string[];
  obiettivi: string[];
  evidenze: string[];
  nucleiFondanti?: string[];
  proposals: Proposal[];                         // raccordi IN2012→IN2025
}
```

**Nota:** `applicableFramework` è derivato dalla norma tramite il resolver CML-630A. `institutionalContentStatus` è il lavoro della scuola. Sono dati indipendenti.

Esempio:
```text
Framework applicabile: IN2025 (derivato dalla norma)
Stato del segmento: under-review (lavoro della scuola in corso)
```

### 5.3 Contenuto separato da struttura

Il contenuto (`CurriculumSegmentContent`) è separato dalla struttura (`CurriculumSegment`) per:
- ridurre la superficie di modifica durante il workflow (lo stato cambia spesso, i contenuti meno)
- facilitare lo storico incrementale (solo `contentVersion` cambia)
- semplificare il confronto tra versioni

---

## 6. Stati e transizioni

### 6.1 Stati del segmento

```text
not-started → draft → open-for-contributions → under-review → ready-for-consolidation → included-in-proposal → effective
```

### 6.2 Significato per ruolo

| Stato | Docente | Dipartimento | Referente | Azioni consentite | Transizioni ammesse |
|-------|---------|--------------|-----------|-------------------|---------------------|
| `not-started` | Vede che il segmento esiste ma non è ancora lavorato | Vede che non è iniziato | Può assegnare, monitorare | Leggere | → `draft` |
| `draft` | Elabora contenuti, propone traguardi/obiettivi/evidenze | Può leggere | Può leggere, suggerire | Modificare contenuto | → `open-for-contributions`, → `under-review` |
| `open-for-contributions` | Contribuisce, commenta | Può contribuire | Può leggere, moderare | Modificare, commentare | → `under-review` |
| `under-review` | Legge, commenta | Discute, armonizza | Raccoglie feedback, prepara consolidamento | Commentare | → `ready-for-consolidation`, → `draft` (rinvio) |
| `ready-for-consolidation` | Vede che è pronto | Conferma internamente | Consolida nella proposta | Leggere | → `included-in-proposal` |
| `included-in-proposal` | Vede che è nella proposta al collegio | Vede stato | Monitora esito collegio | Leggere | → `effective` (se approvato), → `under-review` (se rifiutato) |
| `effective` | Utilizza nella progettazione UDA | Vede segmento efficace | Monitora | Utilizzare, leggere | → (chiuso, until versione superseded) |

### 6.3 Evidenze richieste per transizione

| Transizione | Evidenza minima |
|-------------|-----------------|
| → `draft` | Almeno un campo contenuto compilato |
| → `open-for-contributions` | `contentVersion >= 1` |
| → `under-review` | `contentVersion >= 2` o conferma autore |
| → `ready-for-consolidation` | Tutti i campi obbligatori compilati |
| → `included-in-proposal` | Referente conferma inclusione |
| → `effective` | Versione del curricolo `approved` + segmento `included-in-proposal` |

---

## 7. Workflow collaborativo

### 7.1 Ruoli e responsabilità

```text
Docente
  ELABORA: contribuisce alla stesura dei segmenti per la propria disciplina
  PROGETTA: propone traguardi, obiettivi, evidenze, raccordi verticali
  REVISIONA: legge e commenta i segmenti elaborati da colleghi
  DISCUTE: partecipa a riunioni di dipartimento, interclasse
  PROPONE: le scelte vanno al referente per la sintesi al collegio
  LEGGE: il segmento applicabile per ciascuna delle proprie classi
  PROGETTA: programmazioni e UDA con il contesto curricolare giusto

Referente curricolo
  GOVERNA: versioni del curricolo d'istituto e matrice di applicabilità
  SINTETIZZA: raccoglie le proposte e le compone in documento coerente
  CONSOLIDA: porta al collegio la proposta elaborata con il dipartimento
  MONITORA: stato complessivo della transizione per tutti gli ordini

Dipartimento disciplinare
  DISCUTE: le proposte dei docenti
  ARMONIZZA: i raccordi verticali tra infanzia, primaria, secondaria
  VALIDA internamente: prima che il referente porti al collegio
  SEGNA: cosa è pronto, cosa necessita di ulteriore lavoro

Interclasse / Intersezione
  VERIFICA: coerenza tra classi e sezioni della stessa fascia
  SEGNA: discontinuità o punti deboli

Collegio dei docenti
  APPROVA: la versione complessiva del curricolo d'istituto
  VALIDA: esternamente il lavoro di dipartimento e referente
  RINVIA: per revisione se necessario
  È l'unico organo che può dichiarare "approved"

Sistema (CurManLight)
  NON dichiara mai autonomamente "approved"
  MOSTRA: matrice, stato, progressione, contesto
  CALCOLA: quale framework si applica (resolver CML-630A)
  SUGGERisce: segmenti da rielaborare, coorti da aprire
  TRACCIERA: chi ha fatto cosa, quando, con quale esito
  NON DECIDE: la decisione è sempre umana e collegiale
```

### 7.2 Collaborazione

La collaborazione è **concettuale**, non tecnica simultanea. CurManLight resta locale e senza backend.

- Ogni docente lavora sulla propria copia locale
- Il referente consolida le proposte ricevute
- Il collegio approva la versione complessiva
- Non esiste collaborazione real-time
- Non esiste sincronizzazione automatica remota

---

## 8. Relazioni verticali

> **Aggiornamento CML-630D:** La sezione originale (Modello A) è stata sostituita con la decisione formale (Modello C ibrido). Vedere `docs/CML_630D_VERTICAL_CURRICULUM_LINK_DOMAIN_DECISION.md` per l'analisi completa.

### 8.1 Alternativa scelta: Modello C ibrido

```typescript
// Relazioni strutturali (tecniche, nel segmento)
interface CurriculumSegment {
  // ... campi base ...
  sourceSegmentId?: string;      // provenienza (clonazione/evoluzione)
  replacesSegmentId?: string;    // sostituzione (storico)
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

### 8.2 Motivazione

| Alternativa | Beneficio | Rischio | Complessità | Utilità e-Twin | Verdetto |
|-------------|-----------|---------|-------------|----------------|----------|
| A — Incorporate nel segmento | Semplicità | Limitata per relazioni pedagogiche | Bassa | Limitata | Scartata — insufficiente |
| B — Entità separata (`VerticalCurriculumLink`) | Flessibilità massima | Eccessiva per relazioni strutturali | Media | Elevata | Scartata — troppo per strutturali |
| **C — Modello ibrido** | Separazione responsabilità | Gestione due entità | Media | Elevata | **Scelta** — bilancia complessità e valore |

### 8.3 Separazione responsabilità

| Entità | Relazioni gestite | Motivazione |
|--------|-------------------|-------------|
| `CurriculumSegment` | provenienza, sostituzione, appartenenza versione | Tecniche, non pedagogiche |
| `VerticalCurriculumLink` | continuità, sviluppo, approfondimento, prerequisito, integrazione, discontinuità | Pedagogiche, con stato e workflow |

### 8.4 Rappresentazione delle relazioni verticali

Le relazioni sono ora rappresentate su due livelli:

1. **Relazioni strutturali (nel segmento):**
   - provenienza: `sourceSegmentId`
   - sostituzione: `replacesSegmentId`
   - appartenenza: `versionId`

2. **Relazioni pedagogiche (VerticalCurriculumLink):**
   - continuità infanzia→primaria→secondaria
   - progressione tra classi
   - raccordi traguardi/obiettivi
   - dipendenze pedagogiche
   - discontinuità identificate

### 8.5 Rilevamento discontinuità

Il sistema può calcolare automaticamente:
- Framework diverso tra classi adiacenti dello stesso ordine e disciplina
- Segmenti con stato `not-started` o `draft` in zone critiche
- Transizioni IN2012→IN2025 non ancora lavorate
- Relazioni pedagogiche con stato `rejected` o `draft`

### 8.6 Workflow relazioni pedagogiche

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

---

## 9. Versionamento

### 9.1 Alternativa scelta: Snapshot ibrido

| Alternativa | Beneficio | Rischio | Complessità | Compatibilità offline | Verdetto |
|-------------|-----------|---------|-------------|----------------------|----------|
| A — Snapshot completo per versione | Storico perfetto, ogni versione è autocontenuta | Duplicazione dati, storage elevato | Media | Ottima | Scartata — eccessiva |
| B — Segmenti versionati indipendentemente | Flessibilità, storico granulare | Complessità merge, confusione versioni | Alta | Buona | Scartata — troppo complesso |
| **C — Snapshot ibrido** | Bilanciamento, contenuti snapshot solo alla consolidazione | Complessità moderata | Media | Ottima | **Scelta** |

### 9.2 Come funziona

1. Ogni modifica al contenuto incrementa `contentVersion` nel segmento
2. Le modifiche restano draft fino al consolidamento
3. Quando il referente consolida, il contenuto viene snapshot-izzato nella versione del curricolo
4. I contenuti approvati diventano immutabili (la versione è `approved`)
5. Una nuova revisione crea una nuova versione senza sovrascrivere la precedente
6. La versione precedente diventa `superseded` ma resta leggibile

### 9.3 Immutabilità

- Una versione `approved` non è modificabile
- I segmenti in una versione `approved` sono in sola lettura
- Per modificare, il referente crea una nuova versione
- La vecchia versione resta storico

---

## 10. Compatibilità locale e offline

### 10.1 Requisiti

| Requisito | Soluzione |
|-----------|-----------|
| Identità locali stabili | UUID v4 generati localmente |
| Persistenza futura in IndexedDB | Modelli progettati per serializzazione JSON |
| Export/import manuale | Campi serializzabili, nessun riferimento circolare |
| Conflitti tra contributi | Merge umano guidato dal referente |
| Merge umano | Il referente sceglie quale versione tenere |
| Storico locale | Ogni versione è un oggetto autonomo |
| Nessuna telemetria | Confermato |
| Nessuna sincronizzazione remota | Confermato |
| Nessuna collaborazione real-time | Confermato |

### 10.2 Collaborazione concettuale vs tecnica

```text
Collaborazione concettuale (IN PERIMETRO):
- Ogni docente elabora la propria parte
- Il referente consolida
- Il collegio approva
- La distribuzione avviene verbalmente o tramite export

Collaborazione tecnica simultanea (NON AUTORIZZATA):
- Editing concorrente in tempo reale
- Sincronizzazione automatica
- Backend centrale
- Multi-utente simultaneo
```

---

## 11. Compatibilità legacy

### 11.1 Strategia

I dati legacy (curriculumKB, proposal, decisioni esistenti) vengono trattati come:

- **curriculumKB** → diventa il contenuto del primo segmento legacy con stato `legacy-imported`
- **Proposal esistenti** → migrate come `proposals` nel contenuto del segmento
- **Decisioni esistenti** → migrate come voti sulla versione legacy
- **UdaModel** → resta indipendente (consumatrice, non produttrice di curricolo)

### 11.2 Stato esplicito per dati legacy

```typescript
type SegmentWorkflowStatus =
  | 'not-started'
  | 'draft'
  | 'open-for-contributions'
  | 'under-review'
  | 'ready-for-consolidation'
  | 'included-in-proposal'
  | 'effective'
  | 'legacy-imported';     // dati importati da curriculumKB senza workflow
```

### 11.3 Invarianti legacy

1. I dati legacy non diventano automaticamente `approved`
2. I dati legacy mantengono `legacy-imported` fino a revisione esplicita
3. Non si inventano date storiche per i dati legacy
4. Le proposal legacy mantengono il loro `id` originale
5. Le decisioni legacy mantengono il loro `DecisionStatus`

---

## 12. Invarianti

1. Una versione `approved` non è modificabile
2. Un segmento `effective` appartiene a una versione `approved`
3. Il framework applicabile deriva esclusivamente da CML-630A (`resolveNationalFramework`)
4. Il referente non può cambiare liberamente `applicableFramework` (IN2012/IN2025)
5. Una nuova versione non elimina la precedente (storico non distruttivo)
6. `effectiveUntil` non precede `effectiveFrom`
7. Un segmento non può sostituire se stesso (`replacesSegmentId !== id`)
8. Un segmento appartiene a una sola versione del curricolo
9. Il collegio approva la versione complessiva, non ogni singolo segmento
10. I dati legacy non diventano automaticamente approvati
11. `contentVersion` è sempre ≥ 1 per segmenti non-legacy
12. Un segmento `effective` ha `contentVersion` uguale al valore al momento dell'approvazione
13. La transizione `approved` → `superseded` è irreversibile
14. Ogni transizione di stato richiede una decisione umana (nessuna transizione automatica verso stati finali)

---

## 13. Alternative

### 13.1 A — Modello minimo

Solo versione + segmento + status.

| Aspetto | Valutazione |
|---------|-------------|
| Beneficio docente | Basso — niente workflow |
| Beneficio istituto | Basso — niente storico |
| Rischio | Bassa |
| Impatto tecnico | Minimo |
| Verdetto | **Scartato** — insufficiente per il caso d'uso reale |

### 13.2 B — Modello versionato con workflow collaborativo

Versioni, segmenti, stati, relazioni e storico.

| Aspetto | Valutazione |
|---------|-------------|
| Beneficio docente | Alto — vede stato, contribuisce, revisiona |
| Beneficio istituto | Alto — storico, workflow, approvazione collegiale |
| Rischio | Media — complessità moderata |
| Impatto tecnico | Medio — nuovi tipi e logica pura |
| Verdetto | **Scelta** |

### 13.3 C — Event sourcing completo

Ogni modifica come evento.

| Aspetto | Valutazione |
|---------|-------------|
| Beneficio docente | Medio — storico perfetto ma complesso |
| Beneficio istituto | Alto — audit trail completo |
| Rischio | Alta — over-engineering |
| Impatto tecnico | Alta — architettura completamente diversa |
| Verdetto | **Scartato** — non proporzionato |

### 13.4 D — Modello documentale monolitico

Un unico grande oggetto curricolo.

| Aspetto | Valutazione |
|---------|-------------|
| Beneficio docente | Basso — difficile navigazione |
| Beneficio istituto | Basso — difficile estrazione dati |
| Rischio | Bassa — semplice |
| Impatto tecnico | Bassa |
| Verdetto | **Scartato** — non scalabile |

### 13.5 Tabella comparativa

| Alternativa | Beneficio docente | Beneficio istituto | Rischio | Impatto tecnico | Verdetto |
|-------------|-------------------|---------------------|---------|-----------------|----------|
| A — Minimo | Basso | Basso | Bassa | Minimo | Scartato |
| **B — Versionato + workflow** | **Alto** | **Alto** | **Media** | **Medio** | **Scelto** |
| C — Event sourcing | Medio | Alto | Alta | Alta | Scartato |
| D — Monolitico | Basso | Basso | Bassa | Bassa | Scartato |

---

## 14. Raccomandazione

Il docente e l'istituto potranno:

- **vedere** quali quadri normativi si applicano a ciascuna classe e disciplina
- **lavorare** collaborativamente alla rielaborazione del curricolo verticale
- **tracciare** lo stato di avanzamento dei segmenti per ordine, classe e disciplina
- **consolidare** le proposte dei docenti in una versione coerente del curricolo
- **approvare** formalmente la versione del curricolo d'istituto in sede collegiale
- **conservare** lo storico delle versioni precedenti senza perdita di dati
- **utilizzare** il segmento efficace come contesto per programmazioni e UDA
- **rilevare** discontinuità verticali e segmenti ancora da lavorare

La direzione consigliata è **Alternativa B**: modello versionato con workflow collaborativo, bilanciamento tra chiarezza, verificabilità e semplicità percepita, senza over-engineering.

---

## 15. Perimetro preliminare

### 15.1 Include

```text
Tipi:     InstituteCurriculumVersion, CurriculumSegment, CurriculumSegmentContent,
          InstituteCurriculumStatus, SegmentWorkflowStatus
Logica:   creazione versione, transizioni di stato, creazione segmento,
          validazione invarianti, helper di query
Test:     TDD dominio (transizioni, invarianti, relazioni, legacy)
```

### 15.2 Non include

```text
Store definitivo      (CML-630C)
Persistenza           (CML-630C)
UI                    (CML-630C)
Import/export         (CML-630C)
Wizard                (CML-630C)
UDA                   (CML-630D)
Annual progression    (CML-630E)
Migrazioni            (CML-630C)
Runtime integration   (CML-630D)
```

### 15.3 Stima

| Metrica | Stima |
|---------|-------|
| LOC | ~450 |
| File | 3-4 |
| Test | ~80 |
| Dipendenze | Solo CML-630A |

---

## 16. Test preliminari

### 16.1 Creazione versione draft

```text
Dato: titolo "Curricolo 2026-2028", effectiveFrom 2026/2027
Quando: createVersion()
Allora: stato = draft, versionNumber = 1, effectiveFrom = 2026/2027
```

### 16.2 Transizioni valide

```text
draft → under-review (referente consolida)
under-review → proposed-to-collegio (referente propone)
proposed-to-collegio → approved (collegio approva)
approved → superseded (nuova versione creata)
```

### 16.3 Transizioni non valide

```text
draft → approved (manca under-review e proposta)
approved → draft (irreversibile)
superseded → approved (irreversibile)
under-review → approved (manca proposta al collegio)
```

### 16.4 Versione approvata immutabile

```text
Dato: versione con stato "approved"
Quando: tentativo di modifica campo
Allora: errore "version-immutable"
```

### 16.5 Segmento efficace solo in versione approvata

```text
Dato: segmento con stato "effective"
Quando: query versione associata
Allora: versione.status = "approved"
Quando: tentativo di creare segmento "effective" in versione "draft"
Allora: errore "segment-requires-approved-version"
```

### 16.6 Date di efficacia valide

```text
Dato: effectiveFrom 2028/2029, effectiveUntil 2027/2028
Quando: validazione
Allora: errore "effective-until-before-from"
```

### 16.7 Relazioni di sostituzione

```text
Dato: segmento B con replacesSegmentId = A.id
Quando: query segmento A
Allora: A è markato come sostituito da B
Quando: B tenta replacesSegmentId = B.id (stesso)
Allora: errore "segment-cannot-replace-itself"
```

### 16.8 Storico preservato

```text
Dato: versione 1 approvata, poi sostituita da versione 2
Quando: query versione 1
Allora: versione 1 è "superseded" ma leggibile con tutti i suoi segmenti
```

### 16.9 Legacy unresolved

```text
Dato: segmento importato da curriculumKB con stato "legacy-imported"
Quando: query stato
Allora: institutionalContentStatus = "legacy-imported"
Quando: tentativo di marcare come "effective"
Allora: errore "legacy-segment-requires-review"
```

### 16.10 Separazione framework/stato istituzionale

```text
Dato: segmento con applicableFramework = "IN2025" e institutionalContentStatus = "under-review"
Quando: query framework
Allora: "IN2025" (dalla norma, non modificabile dall'utente)
Quando: query stato lavoro
Allora: "under-review" (lavoro della scuola)
```

### 16.11 Workflow completo docente→revisione→consolidamento→proposta→approvazione

```text
Dato: segmento "not-started"
Quando: docente modifica → "draft"
Quando: docente apre contribuzioni → "open-for-contributions"
Quando: colleghi contribuiscono → "under-review"
Quando: referente consolida → "ready-for-consolidation"
Quando: referente include in proposta → "included-in-proposal"
Quando: collegio approva versione → segmento diventa "effective"
```

### 16.12 Nessuna approvazione automatica

```text
Dato: tutti i segmenti con stato "included-in-proposal"
Quando: sistema controlla
Allora: stato versione resta "proposed-to-collegio" (non "approved")
Quando: nessuna azione del collegio
Allora: versione resta "proposed-to-collegio" indefinitamente
```

---

## 17. Decisioni aperte da validare nel prototipo e-twin

La presente proposta definisce un contratto di dominio preliminare e non determina ancora la struttura definitiva delle relazioni curricolari verticali.

### 17.1 Relazioni verticali — scelta sperimentale

L'inclusione delle relazioni verticali all'interno di `CurriculumSegment` (alternativa A — incorporate) costituisce l'alternativa iniziale adottata per contenere la complessità del modello. Tale scelta dovrà essere confrontata, nel prototipo e-twin, con un modello sperimentale basato su relazioni esplicite e tipizzate tra singoli nodi curricolari.

**L'alternativa A è sufficiente per:**
- provenienza del segmento (`sourceSegmentId`)
- sostituzione di un segmento precedente (`replacesSegmentId`)
- continuità generale tra porzioni di curricolo
- prototipo documentale semplice

**L'alternativa A non è sufficiente per:**
- relazioni tra singoli traguardi e obiettivi
- motivazione pedagogica della relazione
- autore della proposta di relazione
- validazione o rifiuto della relazione
- relazioni trasversali tra discipline
- confronto tra versioni della stessa relazione

Il prototipo potrà pertanto introdurre, esclusivamente su dati sintetici e senza modificare la baseline applicativa:

- un'entità sperimentale `CurriculumNode` (singolo traguardo, obiettivo o evidenza)
- un'entità sperimentale `VerticalCurriculumLink` (relazione tra nodi)
- relazioni dotate di tipologia, motivazione e stato di validazione
- flussi differenziati per ruolo
- confronto visuale tra relazioni implicite (nel segmento) ed esplicite (tra nodi)

L'esito della sperimentazione determinerà se:

1. mantenere le relazioni incorporate nel segmento (alternativa A);
2. adottare relazioni esplicite come parte del dominio (alternativa B);
3. utilizzare un modello ibrido, con relazioni strutturali nel segmento e relazioni pedagogiche tra nodi (alternativa C).

Fino alla conclusione della sperimentazione, nessuna delle tre alternative costituisce baseline definitiva.

### Impatto sulla stima

L'introduzione di `CurriculumNode` e `VerticalCurriculumLink` cambierebbe sensibilmente perimetro e numerosità dei casi di test. La stima di ~450 LOC e ~80 test va mantenuta come indicazione preliminare valida solo per il modello segment-based.

### Parti approvabili

- `InstituteCurriculumVersion`
- `CurriculumSegment`
- `CurriculumSegmentContent`
- distinzione tra stato normativo e stato del lavoro
- snapshot immutabile delle versioni approvate
- workflow collaborativo non simultaneo
- invarianti di dominio
- casi TDD preliminari
- esclusione di persistenza e integrazione applicativa

### Parti da mantenere sperimentali

- granularità obbligatoria per singola classe
- unicità della macchina a stati del segmento
- relazioni verticali incorporate nel segmento
- rappresentazione delle proposte testuali dentro il segmento
- sufficienza del segmento come unità dell'e-twin

---

## 18. Esclusioni

- **Store definitivo:** L'architettura di persistenza è definita in CML-630C
- **Persistenza:** La strategia di salvataggio è definita in CML-630C
- **UI:** L'interfaccia utente è definita in CML-630C
- **Import/export:** La funzionalità è definita in CML-630C
- **Wizard:** Il wizard è definito in CML-630C
- **UDA:** Il consumo del curricolo da parte delle UDA è definito in CML-630D
- **Annual progression:** La progressione annuale è definita in CML-630E
- **Migrazioni:** La strategia di migrazione è definita in CML-630C
- **Runtime integration:** L'integrazione con il codice esistente è definita in CML-630D
- **Formula year-pegged:** La sostituzione è definita in CML-630D

---

## 19. Stato finale

```text
CML_630B_INSTITUTE_CURRICULUM_MODEL_CONDITIONALLY_APPROVED_FOR_PROTOTYPING
```

### Esito revisione

```text
PARTI APPROVATE:        InstituteCurriculumVersion, CurriculumSegment,
                        CurriculumSegmentContent, workflow, invarianti,
                        esclusione persistenza e integrazione
PARTI SPERIMENTALI:     relazioni verticali, granularità classe,
                        macchina stati segmento, proposte nel segmento
IMPLEMENTAZIONE:        NON AUTORIZZATA
REPOSITORY:             NON MODIFICATO
COMMIT:                 NESSUNO
PUSH:                   NESSUNO
PROSSIMO PASSO:         prototipo e-twin con dati sintetici
```

### Prossima azione

```text
1. Prototipo e-twin con dati sintetici
2. Confronto: relazioni incorporate vs esplicite vs ibrido
3. Decisione di dominio successiva
4. Nessuna implementazione applicativa fino alla conclusione della sperimentazione
```

La proposta è pronta per una revisione critica. Non è ancora contratto definitivo.

---

*Proposta CML-630B prodotta in modalità READ-ONLY. Nessun file del repository è stato modificato.*
