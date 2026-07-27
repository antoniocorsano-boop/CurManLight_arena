# CML-633 Migration & Compatibility Plan

> **Classificazione:** `CML_633_MIGRATION_AND_COMPATIBILITY_PLAN`  
> **Branch:** `design/cml-633-product-foundation-redesign`  
> **Data:** 27 luglio 2026  
> **Stato:** COMPLETO

---

## 1. Classificazione Dati

### 1.1 Categorie

| Categoria | Descrizione | Strategia |
|-----------|-------------|-----------|
| **Migrabili** | Dati che possono essere convertiti automaticamente | Migrazione automatica |
| **Parzialmente migrabili** | Dati che richiedono trasformazione manuale | Migrazione con intervento utente |
| **Non migrabili** | Dati che non hanno corrispondenza nel nuovo modello | Archiviazione |

### 1.2 Dettaglio per Entità

#### UdaModel → CurriculumNode + Document

| Campo | Stato | Strategia |
|-------|-------|-----------|
| `id` | Migrabile | → `CurriculumNode.id` (genera nuovo UUID) |
| `title` | Migrabile | → `CurriculumNode.title` |
| `description` | Migrabile | → `CurriculumNode.description` |
| `content` | Migrabile | → `CurriculumNode.body` |
| `discipline` | Migrabile | → `CurriculumNode.discipline` |
| `order` | Migrabile | → `CurriculumNode.grade` |
| `classes` | Migrabile | → `CurriculumNode.classLabels` |
| `status` | Parziale | `completed` → `approved`, `work-in-progress` → `draft`, `review-needed` → `under-review` |
| `createdAt` | Migrabile | → `CurriculumNode.createdAt` |
| `updatedAt` | Migrabile | → `CurriculumNode.updatedAt` |
| `exportedAt` | Migrabile | → `Document.exportedAt` |
| `workStatus` | Parziale | Mapping personalizzato |
| `workProgramStatus` | Non migrabile | Archiviato |
| `programStatus` | Non migrabile | Archiviato |
| `confrontoStatus` | Non migrabile | Archiviato |
| `tags` | Migrabile | → `CurriculumNode.keywords` |
| `customTexts` | Parziale | → `Document.content` (se applicabile) |

#### Proposal → Proposal

| Campo | Stato | Strategia |
|-------|-------|-----------|
| `id` | Migrabile | → `Proposal.id` (genera nuovo UUID) |
| `title` | Migrabile | → `Proposal.title` |
| `description` | Migrabile | → `Proposal.description` |
| `content` | Migrabile | → `Proposal.proposedContent` |
| `status` | Parziale | Mapping personalizzato |
| `createdAt` | Migrabile | → `Proposal.createdAt` |

#### DocumentExportEvent → DocumentVersion

| Campo | Stato | Strategia |
|-------|-------|-----------|
| `id` | Migrabile | → `DocumentVersion.id` (genera nuovo UUID) |
| `documentType` | Migrabile | → `Document.documentType` |
| `format` | Migrabile | → `DocumentVersion.format` |
| `label` | Migrabile | → `Document.title` |
| `sourceKind` | Migrabile | → `Document.sourceKinds` |
| `sourceId` | Migrabile | → `Document.sourceIds` |
| `discipline` | Migrabile | → `Document.discipline` |
| `order` | Migrabile | → `Document.order` |
| `exportedAt` | Migrabile | → `DocumentVersion.exportedAt` |
| `sourceSignature` | Migrabile | → `Document.sourceSignature` |
| `coherence` | Migrabile | → `Document.coherenceStatus` |

#### curriculumKB → Source + CurriculumNode

| Campo | Stato | Strategia |
|-------|-------|-----------|
| `discipline` | Migrabile | → `CurriculumNode.discipline` |
| `order` | Migrabile | → `CurriculumNode.grade` |
| `traguardi` | Parziale | → `CurriculumNode` (tipo 'competence') |
| `obiettivi` | Parziale | → `CurriculumNode` (tipo 'objective') |
| `proposals` | Parziale | → `CurriculumNode` (tipo 'milestone') |
| `hasSpecificDiscipline` | Non migrabile | Archiviato |

#### UserState → InstituteConfig

| Campo | Stato | Strategia |
|-------|-------|-----------|
| `currentInstitute` | Migrabile | → `Institute.id` |
| `currentAcademicYear` | Migrabile | → `InstituteConfig.currentAcademicYear` |
| `currentRole` | Migrabile | → `RoleAssignment.roleId` |
| `currentCycle` | Migrabile | → `InstituteConfig.schoolOrders` |
| `currentClass` | Migrabile | → `RoleAssignment.scope` |
| `selectedDiscipline` | Migrabile | → contesto UI (non dominio) |
| `selectedOrder` | Migrabile | → contesto UI (non dominio) |

#### ClassContext → InstituteConfig

| Campo | Stato | Strategia |
|-------|-------|-----------|
| `className` | Migrabile | → `ClassGroup.label` |
| `studentCount` | Migrabile | → `ClassGroup.studentCount` |
| `schedule` | Non migrabile | Archiviato (struttura non compatibile) |
| `labAccess` | Non migrabile | Archiviato |
| `notes` | Migrabile | → `ClassGroup.notes` |

---

## 2. Piano di Migrazione

### 2.1 Fasi

```
Fase 1: Preparazione (CML-633M1)
  │
  │ - Backup dati esistenti
  │ - Validazione integrità
  │ - Generazione report
  │
  ▼
Fase 2: Migrazione Struttura (CML-633M2)
  │
  │ - Creazione nuove tabelle
  │ - Migrazione InstituteConfig
  │ - Migrazione Source
  │ - Migrazione CurriculumVersion
  │
  ▼
Fase 3: Migrazione Dati (CML-633M3)
  │
  │ - Migrazione UdaModel → CurriculumNode
  │ - Migrazione Proposal → Proposal
  │ - Migrazione DocumentExportEvent → Document + DocumentVersion
  │ - Migrazione curriculumKB → Source + CurriculumNode
  │
  ▼
Fase 4: Validazione (CML-633M4)
  │
  │ - Verifica integrità
  │ - Confronto conteggi
  │ - Test funzionali
  │
  ▼
Fase 5: Cleanup (CML-633M5)
  │
  │ - Rimozione tabelle vecchie
  │ - Aggiornamento store
  │ - Aggiornamento UI
  │
```

### 2.2 Script di Migrazione

```typescript
// src/domain/curriculum/persistence/migration.ts

interface MigrationPlan {
  version: string;
  steps: MigrationStep[];
  rollback: MigrationStep[];
}

interface MigrationStep {
  id: string;
  description: string;
  execute: () => Promise<void>;
  rollback: () => Promise<void>;
  validate: () => Promise<boolean>;
}

const CML_633_MIGRATION: MigrationPlan = {
  version: 'CML-633',
  steps: [
    {
      id: 'backup',
      description: 'Backup dati esistenti',
      execute: async () => {
        const backup = await createBackup();
        await saveBackup(backup);
      },
      rollback: async () => {
        // Il backup non viene rimosso
      },
      validate: async () => {
        return await backupExists();
      },
    },
    {
      id: 'create-institute',
      description: 'Creazione Institute e InstituteConfig',
      execute: async () => {
        const institute = createDefaultInstitute();
        await saveInstitute(institute);
      },
      rollback: async () => {
        await deleteInstitute(DEFAULT_INSTITUTE_ID);
      },
      validate: async () => {
        return await instituteExists(DEFAULT_INSTITUTE_ID);
      },
    },
    // ... altri step
  ],
  rollback: [
    // Rollback in ordine inverso
  ],
};
```

### 2.3 Backup

```typescript
interface Backup {
  id: string;
  createdAt: string;
  version: string;
  
  // Dati
  institutes: Institute[];
  curriculumVersions: CurriculumVersion[];
  segments: CurriculumSegment[];
  nodes: CurriculumNode[];
  links: VerticalCurriculumLink[];
  proposals: Proposal[];
  documents: Document[];
  documentVersions: DocumentVersion[];
  
  // Legacy
  legacyData: {
    udaModels: UdaModel[];
    legacyProposals: Proposal[];
    documentExportEvents: DocumentExportEvent[];
    curriculumKB: Record<string, DisciplineData>;
    userState: UserState;
  };
  
  // Metadata
  size: number;
  checksum: string;
}
```

---

## 3. Compatibilità

### 3.1 Modalità Compatibilità

```typescript
interface CompatibilityMode {
  enabled: boolean;
  
  // Feature flags
  features: {
    useNewDomainModel: boolean;        // Usa il nuovo modello dominio
    useLegacyStore: boolean;           // Mantieni lo store legacy
    enableBackwardCompatibility: boolean;  // Abilita compatibilità retroattiva
  };
  
  // Mapping
  legacyToNew: Map<string, string>;    // Mapping ID legacy → nuovi ID
  newToLegacy: Map<string, string>;    // Mapping nuovi ID → ID legacy
}
```

### 3.2 Strategia di Transizione

1. **Fase 1: Dual Write** → Scrivi sia nel vecchio che nel nuovo store
2. **Fase 2: Dual Read** → Leggi dal nuovo store, fallback al vecchio
3. **Fase 3: Legacy Read Only** → Il vecchio store è read-only
4. **Fase 4: Legacy Deprecation** → Rimuovi il vecchio store

### 3.3 API di Compatibilità

```typescript
// Adapter per compatibilità retroattiva
function adaptLegacyUdaModel(legacy: UdaModel): CurriculumNode {
  return {
    id: generateUUID(),
    segmentId: '', // Da determinare during migration
    curriculumVersionId: '', // Da determinare during migration
    nodeType: 'objective',
    title: legacy.title,
    description: legacy.description,
    body: legacy.content,
    grade: legacy.order,
    keywords: legacy.tags || [],
    workStatus: adaptStatus(legacy.status),
    source: {
      type: 'institute-legacy',
    },
    createdBy: 'migration',
    createdAt: legacy.createdAt,
    updatedAt: legacy.updatedAt,
    version: 1,
  };
}
```

---

## 4. Validazione Migrazione

### 4.1 Controlli

| Controllo | Descrizione | Priorità |
|-----------|-------------|----------|
| `count-match` | Numero entità vecchie = numero entità nuove | Alta |
| `field-preserved` | Tutti i campi migrati sono preservati | Alta |
| `status-mapped` | Gli stati sono mappati correttamente | Alta |
| `source-tracked` | Le fonti sono tracciate | Media |
| `hash-computed` | Gli hash sono calcolati | Media |
| `relations-valid` | Le relazioni sono valide | Alta |

### 4.2 Report di Migrazione

```typescript
interface MigrationReport {
  id: string;
  startedAt: string;
  completedAt: string;
  
  // Conteggi
  counts: {
    institutes: { before: number; after: number };
    curriculumVersions: { before: number; after: number };
    segments: { before: number; after: number };
    nodes: { before: number; after: number };
    links: { before: number; after: number };
    proposals: { before: number; after: number };
    documents: { before: number; after: number };
  };
  
  // Errori
  errors: MigrationError[];
  warnings: MigrationWarning[];
  
  // Statistiche
  duration: number;                       // ms
  backupSize: number;                     // bytes
}
```

---

## 5. Rollback

### 5.1 Piano di Rollback

```typescript
async function rollbackMigration(migrationId: string): Promise<void> {
  const backup = await loadBackup(migrationId);
  
  // 1. Rimuovi nuove tabelle
  await dropNewTables();
  
  // 2. Ripristina tabelle vecchie
  await restoreLegacyTables(backup);
  
  // 3. Aggiorna store
  await updateStoreToLegacy();
  
  // 4. Aggiorna UI
  await updateUIToLegacy();
  
  // 5. Valida
  await validateRollback();
}
```

### 5.2 Condizioni di Rollback

Il rollback è necessario se:
- Più del 5% delle entità non è migrabile
- Errori di integrità critici
- Perdita di dati
- Incompatibilità con funzionalità esistenti

---

## 6. Timeline

| Fase | Durata | Deliverable |
|------|--------|-------------|
| Fase 1: Preparazione | 2 ore | Backup, report |
| Fase 2: Migrazione Struttura | 4 ore | Nuove tabelle |
| Fase 3: Migrazione Dati | 8 ore | Dati migrati |
| Fase 4: Validazione | 4 ore | Report validazione |
| Fase 5: Cleanup | 2 ore | Store aggiornato |
| **Totale** | **20 ore** | Migrazione completa |
