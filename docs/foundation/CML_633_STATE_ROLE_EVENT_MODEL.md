# CML-633 State, Role & Event Model

> **Classificazione:** `CML_633_STATE_ROLE_EVENT_MODEL`  
> **Branch:** `design/cml-633-product-foundation-redesign`  
> **Data:** 27 luglio 2026  
> **Stato:** COMPLETO

---

## 1. Macchine a Stati

### 1.1 CurriculumVersion

```
                  ┌─────────────────┐
                  │     draft       │
                  └────────┬────────┘
                           │ submit
                           ▼
                  ┌─────────────────┐
                  │  under-review   │◄─────────────────┐
                  └────────┬────────┘                  │
                           │ approve                   │ reject
                           ▼                           │
              ┌────────────────────────┐               │
              │ proposed-to-collegio   │───────────────┘
              └────────────┬───────────┘
                           │ collegio-approve
                           ▼
                  ┌─────────────────┐
                  │    approved     │
                  └────────┬────────┘
                           │ supersede
                           ▼
                  ┌─────────────────┐
                  │  superseded     │
                  └─────────────────┘
```

**Transizioni valide:**
```typescript
const VERSION_TRANSITIONS: Record<InstituteCurriculumStatus, InstituteCurriculumStatus[]> = {
  'draft':                 ['under-review'],
  'under-review':          ['proposed-to-collegio', 'draft'],
  'proposed-to-collegio':  ['approved', 'under-review'],
  'approved':              ['superseded'],
  'superseded':            [],
};
```

### 1.2 CurriculumSegment

```
┌─────────────────┐
│   not-started   │
└────────┬────────┘
         │ start
         ▼
┌─────────────────┐
│      draft      │◄──────────────────────────────────┐
└────────┬────────┘                                   │
         │ open                                       │
         ▼                                            │
┌─────────────────────────┐                           │
│ open-for-contributions  │                           │
└────────────┬────────────┘                           │
             │ request-review                         │
             ▼                                        │
┌─────────────────────────┐                           │
│     under-review        │───────────────────────────┘
└────────────┬────────────┘        reject
             │ approve
             ▼
┌─────────────────────────┐
│ ready-for-consolidation │
└────────────┬────────────┘
             │ consolidate
             ▼
┌─────────────────────────┐
│ included-in-proposal    │
└────────────┬────────────┘
             │ approve
             ▼
┌─────────────────────────┐
│      effective          │
└─────────────────────────┘
```

**Transizioni valide:**
```typescript
const SEGMENT_TRANSITIONS: Record<CurriculumSegmentWorkStatus, CurriculumSegmentWorkStatus[]> = {
  'not-started':              ['draft'],
  'draft':                    ['open-for-contributions', 'under-review'],
  'open-for-contributions':   ['under-review'],
  'under-review':             ['ready-for-consolidation', 'draft'],
  'ready-for-consolidation':  ['included-in-proposal'],
  'included-in-proposal':     ['effective', 'under-review'],
  'effective':                [],
  'legacy-imported':          [],
};
```

### 1.3 CurriculumNode

```
┌─────────────┐
│    draft    │◄───────────────────────────┐
└──────┬──────┘                            │
       │ propose                           │ reject
       ▼                                   │
┌─────────────┐                            │
│  proposed   │───────┐                    │
└──────┬──────┘       │                    │
       │ validate     │ reject             │
       ▼              ▼                    │
┌─────────────┐  ┌─────────────┐           │
│  validated  │  │  rejected   │───────────┘
└──────┬──────┘  └─────────────┘
       │ approve
       ▼
┌─────────────┐
│  approved   │
└─────────────┘
```

**Transizioni valide:**
```typescript
const NODE_TRANSITIONS: Record<CurriculumNodeWorkStatus, CurriculumNodeWorkStatus[]> = {
  'draft':     ['proposed'],
  'proposed':  ['validated', 'rejected'],
  'validated': ['approved'],
  'approved':  [],
  'rejected':  ['draft'],
};
```

### 1.4 VerticalCurriculumLink

```
┌─────────────┐
│    draft    │
└──────┬──────┘
       │ propose
       ▼
┌─────────────┐
│  proposed   │───────┐
└──────┬──────┘       │
       │ validate     │ reject
       ▼              ▼
┌─────────────┐  ┌─────────────┐
│  validated  │  │  rejected   │
└─────────────┘  └──────┬──────┘
                        │ rework
                        ▼
                  ┌─────────────┐
                  │    draft    │
                  └─────────────┘
```

**Transizioni valide:**
```typescript
const LINK_TRANSITIONS: Record<VerticalCurriculumLinkStatus, VerticalCurriculumLinkStatus[]> = {
  'draft':     ['proposed'],
  'proposed':  ['validated', 'rejected'],
  'validated': [],
  'rejected':  ['draft'],
};
```

### 1.5 Proposal

```
┌─────────────┐
│    draft    │
└──────┬──────┘
       │ submit
       ▼
┌─────────────┐
│  submitted  │
└──────┬──────┘
       │ start-review
       ▼
┌─────────────────┐
│   under-review  │
└────────┬────────┘
         │ approve / reject
         ▼
┌─────────────┐  ┌─────────────┐
│  approved   │  │  rejected   │
└─────────────┘  └─────────────┘
```

**Transizioni valide:**
```typescript
const PROPOSAL_TRANSITIONS: Record<ProposalStatus, ProposalStatus[]> = {
  'draft':        ['submitted'],
  'submitted':    ['under-review'],
  'under-review': ['approved', 'rejected'],
  'approved':     [],
  'rejected':     ['draft'],
};
```

### 1.6 Document

Il documento non ha una macchina a stati complessa. Lo stato è derivato:

```typescript
interface Document {
  // Lo stato è derivato dalla coerenza
  coherenceStatus: 'current' | 'modified' | 'unverifiable';
  
  // Un documento è 'current' se le sue sourceIds puntano a entità con status 'effective'
  // Un documento è 'modified' se almeno una source è cambiata dopo l'ultima esportazione
  // Un documento è 'unverifiable' se le source non sono più accessibili
}
```

---

## 2. Ruoli e Autorità

### 2.1 Ruoli Istituzionali

| Ruolo | Scope | Autorità |
|-------|-------|----------|
| `docente` | class | Creare/modificare proposte, esportare documenti |
| `dipartimento` | department | Validare proposte disciplinari, approvare curricoli di dipartimento |
| `referente` | grade | Coordinare lavoro di grado, supervisionare link verticali |
| `collegio` | institute | Approvare curricoli istituzionali, definire regole |
| `dirigente` | institute | Approvare finale, pubblicare curricoli |
| `amministratore` | institute | Configurare sistema, gestire utenti |

### 2.2 Matrice Autorità

| Azione | docente | dipartimento | referente | collegio | dirigente |
|--------|---------|--------------|-----------|----------|-----------|
| Creare segmento draft | ✅ | ✅ | ✅ | ✅ | ✅ |
| Proporre modifica | ✅ | ✅ | ✅ | ✅ | ✅ |
| Validare proposta disciplinare | ❌ | ✅ | ✅ | ✅ | ✅ |
| Validare link verticale | ❌ | ❌ | ✅ | ✅ | ✅ |
| Inviare a collegio | ❌ | ❌ | ✅ | ✅ | ✅ |
| Approvare curricolo | ❌ | ❌ | ❌ | ✅ | ✅ |
| Pubblicare curricolo | ❌ | ❌ | ❌ | ❌ | ✅ |
| Esportare documento | ✅ | ✅ | ✅ | ✅ | ✅ |
| Configurare sistema | ❌ | ❌ | ❌ | ❌ | ✅ |

### 2.3 Regole di Transizione

```typescript
interface TransitionRule {
  fromStatus: string;
  toStatus: string;
  requiredRole: InstitutionalRole[];
  requiresAll?: boolean;    // true = tutti i ruoli richiesti, false = almeno uno
  conditions?: TransitionCondition[];
}

interface TransitionCondition {
  type: 'field-filled' | 'validation-passed' | 'min-proposals' | 'time-elapsed';
  field?: string;
  minCount?: number;
  duration?: number;        // giorni
}

const TRANSITION_RULES: TransitionRule[] = [
  // CurriculumVersion
  {
    fromStatus: 'draft',
    toStatus: 'under-review',
    requiredRole: ['docente', 'dipartimento', 'referente'],
    requiresAll: false,
  },
  {
    fromStatus: 'under-review',
    toStatus: 'proposed-to-collegio',
    requiredRole: ['referente'],
    conditions: [{ type: 'min-proposals', minCount: 1 }],
  },
  {
    fromStatus: 'proposed-to-collegio',
    toStatus: 'approved',
    requiredRole: ['collegio'],
    requiresAll: true,
  },
  {
    fromStatus: 'approved',
    toStatus: 'superseded',
    requiredRole: ['dirigente'],
  },
  
  // CurriculumSegment
  {
    fromStatus: 'draft',
    toStatus: 'open-for-contributions',
    requiredRole: ['docente', 'dipartimento'],
    requiresAll: false,
    conditions: [{ type: 'field-filled', field: 'content.title' }],
  },
  {
    fromStatus: 'under-review',
    toStatus: 'ready-for-consolidation',
    requiredRole: ['dipartimento'],
  },
  {
    fromStatus: 'included-in-proposal',
    toStatus: 'effective',
    requiredRole: ['collegio'],
  },
  
  // CurriculumNode
  {
    fromStatus: 'draft',
    toStatus: 'proposed',
    requiredRole: ['docente'],
    conditions: [{ type: 'field-filled', field: 'title' }],
  },
  {
    fromStatus: 'proposed',
    toStatus: 'validated',
    requiredRole: ['dipartimento'],
  },
  {
    fromStatus: 'validated',
    toStatus: 'approved',
    requiredRole: ['collegio'],
  },
];
```

---

## 3. Event Log

### 3.1 Struttura

Ogni cambio di stato genera un evento immutabile.

```typescript
interface DomainEvent {
  id: string;                              // UUID v4
  aggregateType: string;                   // 'CurriculumVersion' | 'CurriculumSegment' | ...
  aggregateId: string;                     // ID dell'entità
  eventType: DomainEventType;
  
  // Contesto
  userId: string;
  userRole: InstitutionalRole;
  timestamp: string;                       // ISO 8601
  
  // Transizione
  fromStatus?: string;
  toStatus?: string;
  
  // Dati
  payload?: Record<string, unknown>;
  
  // Integrità
  previousEventId?: string;                // Catena di eventi
  eventHash: string;                       // SHA-256 dell'evento
}

type DomainEventType = 
  | 'created'
  | 'status-changed'
  | 'content-modified'
  | 'proposal-submitted'
  | 'proposal-approved'
  | 'proposal-rejected'
  | 'transfer-received'
  | 'document-exported'
  | 'document-version-created'
  | 'coherence-checked'
  | 'config-updated';
```

### 3.2 Catena di Eventi

```typescript
interface EventChain {
  aggregateId: string;
  events: DomainEvent[];
  
  // Verifica integrità
  verify(): boolean {
    for (let i = 1; i < this.events.length; i++) {
      const current = this.events[i];
      const previous = this.events[i - 1];
      
      if (current.previousEventId !== previous.id) {
        return false;
      }
      
      if (current.eventHash !== this.computeHash(current)) {
        return false;
      }
    }
    return true;
  }
}
```

### 3.3 Esempio di Eventi

```typescript
// Creazione di un curricolo
const events: DomainEvent[] = [
  {
    id: 'evt-001',
    aggregateType: 'CurriculumVersion',
    aggregateId: 'cv-001',
    eventType: 'created',
    userId: 'user-001',
    userRole: 'docente',
    timestamp: '2026-07-27T10:00:00Z',
    toStatus: 'draft',
    payload: { academicYear: '2025/2026', schoolOrder: 'medie' },
    eventHash: 'abc123...',
  },
  {
    id: 'evt-002',
    aggregateType: 'CurriculumVersion',
    aggregateId: 'cv-001',
    eventType: 'status-changed',
    userId: 'user-002',
    userRole: 'referente',
    timestamp: '2026-07-28T14:30:00Z',
    fromStatus: 'draft',
    toStatus: 'under-review',
    previousEventId: 'evt-001',
    eventHash: 'def456...',
  },
];
```

---

## 4. Validazione Transizioni

### 4.1 Funzione di Validazione

```typescript
function canTransition(
  entity: { status: string },
  targetStatus: string,
  userRole: InstitutionalRole,
  rules: TransitionRule[],
  context: Record<string, unknown>
): { allowed: boolean; reason?: string } {
  
  const rule = rules.find(r => 
    r.fromStatus === entity.status && r.toStatus === targetStatus
  );
  
  if (!rule) {
    return { allowed: false, reason: `Transizione ${entity.status} → ${targetStatus} non permessa` };
  }
  
  // Verifica ruolo
  const hasRole = rule.requiresAll
    ? rule.requiredRole.every(r => r === userRole)
    : rule.requiredRole.includes(userRole);
  
  if (!hasRole) {
    return { allowed: false, reason: `Ruolo ${userRole} non autorizzato per questa transizione` };
  }
  
  // Verifica condizioni
  if (rule.conditions) {
    for (const condition of rule.conditions) {
      if (!evaluateCondition(condition, context)) {
        return { allowed: false, reason: `Condizione non soddisfatta: ${condition.type}` };
      }
    }
  }
  
  return { allowed: true };
}
```

### 4.2 Immutabilità dopo Approvazione

```typescript
function isApprovedVersionImmutable(version: CurriculumVersion): boolean {
  return version.status === 'approved' || version.status === 'superseded';
}

// Se il curricolo è approvato, nessuna modifica è permessa
// Tranne che per il dirigente che può supersedare
```
