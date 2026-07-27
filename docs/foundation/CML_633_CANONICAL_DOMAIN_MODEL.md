# CML-633 Canonical Domain Model

> **Classificazione:** `CML_633_CANONICAL_DOMAIN_MODEL`  
> **Branch:** `design/cml-633-product-foundation-redesign`  
> **Data:** 27 luglio 2026  
> **Stato:** COMPLETO

---

## 1. Entità Fondamentali

### 1.1 Institute

Rappresenta l'istituto scolastico. Fonte unica dell'identità istituzionale.

```typescript
interface Institute {
  id: string;                    // UUID v4
  name: string;                  // "Istituto Comprensivo Leonardo da Vinci"
  municipality: string;          // "Roma"
  province: string;              // "RM"
  region: string;                // "Lazio"
  codiceMeccanografico: string;  // "RMPS01234H"
  logo?: string;                 // Base64 o URL
  config: InstituteConfig;
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}
```

### 1.2 InstituteConfig

Configurazione istituzionale. Definisce struttura, ruoli, regole.

```typescript
interface InstituteConfig {
  id: string;
  instituteId: string;
  
  // Struttura
  schoolOrders: SchoolOrder[];           // ["medie"]
  gradeLabels: Record<string, string>;   // {"1":"Prima","2":"Seconda","3":"Terza"}
  classSections: string[];               // ["A","B","C"]
  
  // Ruoli
  roles: InstitutionalRole[];
  roleAssignments: RoleAssignment[];
  
  // Regole
  rules: InstitutionalRules;
  
  // Template
  documentTemplates: DocumentTemplate[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  version: number;
}

interface InstitutionalRole {
  id: string;
  name: string;                    // "Referente di dipartimento"
  scope: 'institute' | 'department' | 'grade' | 'class';
  permissions: Permission[];
}

interface RoleAssignment {
  id: string;
  roleId: string;
  userId: string;
  scope?: string;                  // ID dell'ambito (dipartimento, classe, etc.)
  academicYear: string;            // "2025/2026"
}

interface InstitutionalRules {
  requiresCollegioApproval: boolean;
  approvalWorkflow: 'simple' | 'collegio' | 'dirigente';
  maxDraftAge: number;             // Giorni prima della scadenza
  allowParallelProposals: boolean;
  requiredDocumentFields: string[];
}
```

### 1.3 CurriculumVersion

Versione del curricolo per un anno accademico e ordine scolastico.

```typescript
interface CurriculumVersion {
  id: string;                          // UUID v4
  instituteId: string;                 // FK → Institute
  academicYear: string;                // "2025/2026"
  schoolOrder: SchoolOrder;            // "medie"
  framework: NationalFramework;        // "IN2025"
  
  // Stato
  status: InstituteCurriculumStatus;   // draft → under-review → proposed-to-collegio → approved → superseded
  
  // Contesto
  classGroups: ClassGroup[];
  disciplineGroups: DisciplineGroup[];
  
  // Metadata
  createdBy: string;                   // userId
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  version: number;
}

interface ClassGroup {
  id: string;
  grade: string;                      // "1"
  section: string;                    // "A"
  label: string;                      // "1^A"
  studentCount?: number;
}

interface DisciplineGroup {
  id: string;
  name: string;                       // "Scienze"
  disciplines: string[];              // ["Scienze e Tecnologie", "Scienze della Terra"]
  order: SchoolOrder;
}
```

### 1.4 CurriculumSegment

Segmento del curricolo. Contenuto disciplinare per un'area/conoscenza/abilità.

```typescript
interface CurriculumSegment {
  id: string;                              // UUID v4
  curriculumVersionId: string;             // FK → CurriculumVersion
  parentSegmentId?: string;                // FK → CurriculumSegment (auto-riferimento)
  
  // Classificazione
  segmentType: CurriculumSegmentType;      // 'area' | 'knowledge' | 'skill' | 'competence' | 'milestone'
  discipline: string;                      // "Scienze e Tecnologie"
  area: string;                            // "Scienze della Vita"
  
  // Contenuto
  content: CurriculumSegmentContent;
  
  // Stato
  workStatus: CurriculumSegmentWorkStatus; // not-started → draft → open-for-contributions → ...
  
  // Source tracking
  source: SourceReference;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

type CurriculumSegmentType = 
  | 'area'
  | 'knowledge'
  | 'skill'
  | 'competence'
  | 'milestone';

interface CurriculumSegmentContent {
  title: string;
  description?: string;
  body?: string;                          // Markdown
  keywords: string[];
  objectives: string[];
}

interface SourceReference {
  type: 'national' | 'institute' | 'transferred' | 'imported';
  document?: string;                      // "DPR 89/2010"
  article?: string;                       // "Art. 1, comma 3"
  url?: string;
  transferredFrom?: string;               // ID dell'area sorgente
  importedFrom?: string;                  // "curriculumKB"
}
```

### 1.5 CurriculumNode

Nodo atomico del curricolo. Elemento minimo di conoscenza/abilità.

```typescript
interface CurriculumNode {
  id: string;                              // UUID v4
  segmentId: string;                       // FK → CurriculumSegment
  curriculumVersionId: string;             // FK → CurriculumVersion
  
  // Tipo
  nodeType: CurriculumNodeType;            // 'competence' | 'milestone' | 'objective' | 'evidence' | 'knowledge' | 'skill' | 'core-theme'
  
  // Contenuto
  title: string;
  description?: string;
  body?: string;
  
  // Proprietà curricolari
  grade?: string;                          // "1" (prima)
  semester?: number;                       // 1 | 2
  crossCurricular?: boolean;
  keywords: string[];
  
  // Stato
  workStatus: CurriculumNodeWorkStatus;    // draft → proposed → validated → approved → rejected
  
  // Source tracking
  source: SourceReference;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}
```

### 1.6 VerticalCurriculumLink

Relazione pedagogica verticale tra nodi di gradi diversi.

```typescript
interface VerticalCurriculumLink {
  id: string;
  fromNodeId: string;                      // FK → CurriculumNode
  toNodeId: string;                        // FK → CurriculumNode
  fromGrade: string;                       // "1" (grado sorgente)
  toGrade: string;                         // "2" (grado destinazione)
  
  // Tipo relazione
  relationType: VerticalCurriculumRelationType;  // 'prerequisite' | 'continuity' | 'development' | ...
  
  // Descrizione
  description?: string;
  pedagogicalNote?: string;
  
  // Stato
  status: VerticalCurriculumLinkStatus;    // draft → proposed → validated → rejected
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}
```

### 1.7 Source

Fonte del contenuto. Ogni contenuto ha una provenienza tracciata.

```typescript
interface Source {
  id: string;                              // UUID v4
  type: SourceType;                        // 'national-framework' | 'institute-legacy' | 'teacher-created' | 'transferred' | 'imported'
  
  // Identificazione
  name: string;                            // "DPR 89/2010"
  version?: string;                        // "2012" | "2025"
  article?: string;                        // "Art. 1, comma 3"
  url?: string;
  
  // Contenuto originale
  originalContent?: string;                // Testo originale della fonte
  
  // Hash
  contentHash: string;                     // SHA-256 del contenuto originale
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

type SourceType = 
  | 'national-framework'
  | 'institute-legacy'
  | 'teacher-created'
  | 'transferred'
  | 'imported';
```

### 1.8 Proposal

Proposta di modifica al curricolo. Oggetto tracciato con workflow.

```typescript
interface Proposal {
  id: string;                              // UUID v4
  curriculumVersionId: string;             // FK → CurriculumVersion
  
  // Contenuto
  title: string;
  description?: string;
  type: ProposalType;                      // 'segment-creation' | 'segment-modification' | 'node-creation' | ...
  
  // Target
  targetSegmentId?: string;                // FK → CurriculumSegment
  targetNodeId?: string;                   // FK → CurriculumNode
  
  // Contenuto proposto
  proposedContent: Record<string, unknown>;
  
  // Stato
  status: ProposalStatus;                  // 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected'
  submittedBy?: string;                    // userId
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

type ProposalType = 
  | 'segment-creation'
  | 'segment-modification'
  | 'node-creation'
  | 'node-modification'
  | 'link-creation'
  | 'link-modification'
  | 'version-status-change';

type ProposalStatus = 
  | 'draft'
  | 'submitted'
  | 'under-review'
  | 'approved'
  | 'rejected';
```

### 1.9 Document

Documento generato dal sistema. Entità tracciata con versioning.

```typescript
interface Document {
  id: string;                              // UUID v4
  curriculumVersionId: string;             // FK → CurriculumVersion
  
  // Tipo
  documentType: DocumentType;              // 'uda' | 'programmazione' | 'relazione' | ...
  
  // Contenuto
  title: string;
  content: string;                         // HTML/Markdown generato
  
  // Template
  templateId?: string;                     // FK → DocumentTemplate
  templateName?: string;                   // Nome snapshot del template
  
  // Stile
  style: DocumentStyle;
  
  // Contesto
  discipline: string;
  order: string;
  classLabel?: string;
  academicYear?: string;
  
  // Source tracking
  sourceKinds: SourceKind[];               // 'uda' | 'curriculum' | 'revision' | ...
  sourceIds: string[];                     // ID delle entità sorgente
  sourceSignature?: string;                // Hash del contenuto sorgente
  
  // Coerenza
  coherenceStatus: CoherenceStatus;        // 'current' | 'modified' | 'unverifiable'
  lastCoherenceCheck?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  exportedAt: string;
  version: number;
}

type DocumentType = 
  | 'uda'
  | 'programmazione'
  | 'relazione'
  | 'curricolo'
  | 'confronto'
  | 'programma-svolto'
  | 'file-lavoro'
  | 'altro';

type SourceKind = 
  | 'uda'
  | 'curriculum'
  | 'revision'
  | 'planning'
  | 'class-context'
  | 'generic';

type CoherenceStatus = 
  | 'current'
  | 'modified'
  | 'unverifiable';

interface DocumentStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  margins: { top: number; right: number; bottom: number; left: number };
  headerFooter: boolean;
  watermark?: string;
}
```

### 1.10 DocumentVersion

Versione di un documento. Ogni esportazione crea una nuova versione.

```typescript
interface DocumentVersion {
  id: string;                              // UUID v4
  documentId: string;                      // FK → Document
  
  // Contenuto
  content: string;                         // HTML/Markdown snapshot
  format: ExportFormat;                    // 'DOC' | 'DOCX' | 'ODF' | 'PDF' | ...
  
  // Firma
  contentHash: string;                     // SHA-256 del contenuto
  
  // Contesto
  exportedBy: string;                      // userId
  exportedAt: string;
  
  // Metadata
  version: number;
  size?: number;                           // Byte
}

type ExportFormat = 
  | 'DOC'
  | 'DOCX'
  | 'ODF'
  | 'PDF'
  | 'TXT'
  | 'CML'
  | 'Markdown'
  | 'SCORM';
```

---

## 2. Relazioni

```
Institute 1──→ N InstituteConfig
Institute 1──→ N CurriculumVersion
CurriculumVersion 1──→ N CurriculumSegment
CurriculumVersion 1──→ N CurriculumNode
CurriculumVersion 1──→ N VerticalCurriculumLink
CurriculumVersion 1──→ N Proposal
CurriculumVersion 1──→ N Document
CurriculumSegment 1──→ N CurriculumNode
CurriculumSegment N──→ 1 Source
CurriculumNode 1──→ N VerticalCurriculumLink (from)
CurriculumNode 1──→ N VerticalCurriculumLink (to)
Document 1──→ N DocumentVersion
Document N──→ 1 Source (via sourceIds)
```

---

## 3. Vincoli di Integrità

### 3.1 Unicità
- Ogni entità ha un `id` UUID v4 univoco
- `CurriculumVersion` è unica per `(instituteId, academicYear, schoolOrder)`
- `VerticalCurriculumLink` è unica per `(fromNodeId, toNodeId, relationType)`

### 3.2 Cascata
- Eliminazione `CurriculumVersion` → elimina segmenti, nodi, link, proposte, documenti
- Eliminazione `CurriculumSegment` → elimina nodi figli
- Eliminazione `Document` → elimina versioni

### 3.3 Immutabilità
- `Source.contentHash` è immutabile dopo la creazione
- `DocumentVersion.contentHash` è immutabile dopo la creazione
- `Institute.codiceMeccanografico` è immutabile

### 3.4 Transizioni Stato
- Ogni entità con stato ha transizioni definite (vedi `CML_633_STATE_ROLE_EVENT_MODEL.md`)
- Transizioni non valide sono rifiutate dal dominio

---

## 4. Mapping Entità Esistenti → Nuovo Modello

| Entità Esistente | Nuova Entità | Strategia |
|------------------|--------------|-----------|
| `UdaModel` | `CurriculumNode` + `Document` | Split: contenuto → Node, export → Document |
| `Proposal` | `Proposal` | Estensione con workflow |
| `CurriculumSegment` | `CurriculumSegment` | Estensione con Source tracking |
| `CurriculumNode` | `CurriculumNode` | Estensione con Source tracking |
| `VerticalCurriculumLink` | `VerticalCurriculumLink` | Invariato |
| `DocumentExportEvent` | `DocumentVersion` | Estensione con content snapshot |
| `UserState` | `InstituteConfig` + `RoleAssignment` | Refactoring |
| `curriculumKB` | `Source` + `CurriculumNode` | Migrazione |
| `programmazione-insegnamento` | `Document` | Archiviazione |
| `confronto-curricoli` | Tool (non entità) | Mantenimento |

---

## 5. Hash e Firma

### 5.1 Source Signature
```typescript
function computeSourceSignature(source: Source): string {
  const payload = JSON.stringify({
    type: source.type,
    name: source.name,
    version: source.version,
    article: source.article,
    content: source.originalContent,
  });
  return sha256(payload);
}
```

### 5.2 Document Content Hash
```typescript
function computeDocumentHash(content: string, format: ExportFormat): string {
  const payload = JSON.stringify({ content, format, timestamp: new Date().toISOString() });
  return sha256(payload);
}
```

### 5.3 Transfer Signature
```typescript
function computeTransferSignature(transfer: TransferContract): string {
  const payload = JSON.stringify({
    from: transfer.fromArea,
    to: transfer.toArea,
    data: transfer.data,
    timestamp: transfer.timestamp,
  });
  return sha256(payload);
}
```
