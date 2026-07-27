# CML-633 Document & Institution Model

> **Classificazione:** `CML_633_DOCUMENT_AND_INSTITUTION_MODEL`  
> **Branch:** `design/cml-633-product-foundation-redesign`  
> **Data:** 27 luglio 2026  
> **Stato:** COMPLETO

---

## 1. Modello Documento

### 1.1 Document come Entità

Ogni documento è un'entità tracciata nel dominio, non un side-effect dell'esportazione.

```typescript
interface Document {
  id: string;                              // UUID v4
  curriculumVersionId: string;             // FK → CurriculumVersion
  
  // Identità
  title: string;
  documentType: DocumentType;
  
  // Contenuto
  content: string;                         // HTML/Markdown generato
  
  // Template
  templateId?: string;                     // FK → DocumentTemplate
  templateName?: string;                   // Nome snapshot del template al momento della generazione
  
  // Stile
  style: DocumentStyle;
  
  // Contesto istituzionale
  discipline: string;
  order: string;
  classLabel?: string;
  academicYear?: string;
  
  // Source tracking
  sourceKinds: SourceKind[];
  sourceIds: string[];
  sourceSignature?: string;
  
  // Coerenza
  coherenceStatus: CoherenceStatus;
  lastCoherenceCheck?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  exportedAt: string;
  version: number;
}
```

### 1.2 DocumentVersion

Ogni esportazione crea una nuova versione immutabile.

```typescript
interface DocumentVersion {
  id: string;
  documentId: string;
  
  // Contenuto snapshot
  content: string;
  format: ExportFormat;
  
  // Firma
  contentHash: string;
  
  // Contesto
  exportedBy: string;
  exportedAt: string;
  
  // Dimensione
  size?: number;
  
  // Metadata
  version: number;
}
```

### 1.3 DocumentTemplate

Template configurabile per la generazione di documenti.

```typescript
interface DocumentTemplate {
  id: string;
  instituteId: string;
  
  // Identità
  name: string;                            // "Relazione Annuale"
  description?: string;
  documentType: DocumentType;
  
  // Struttura
  sections: TemplateSection[];
  
  // Variabili
  variables: TemplateVariable[];
  
  // Stile predefinito
  defaultStyle: DocumentStyle;
  
  // Metadata
  isSystem: boolean;                       // true = template di sistema, false = template istituzionale
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

interface TemplateSection {
  id: string;
  name: string;                            // "Intestazione"
  order: number;
  content: string;                         // HTML con variabili
  condition?: TemplateCondition;           // Condizione di visualizzazione
}

interface TemplateVariable {
  name: string;                            // "disciplina"
  type: 'text' | 'number' | 'date' | 'list' | 'boolean';
  required: boolean;
  defaultValue?: unknown;
  description?: string;
}

interface TemplateCondition {
  type: 'field-exists' | 'field-equals' | 'role-in';
  field?: string;
  value?: unknown;
  roles?: InstitutionalRole[];
}
```

### 1.4 DocumentStyle

Configurazione visiva del documento.

```typescript
interface DocumentStyle {
  // Tipografia
  fontFamily: string;                      // "Times New Roman"
  fontSize: number;                        // 12 (punti)
  lineHeight: number;                      // 1.5
  
  // Margini (mm)
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  
  // Intestazione
  header: {
    enabled: boolean;
    content?: string;
    height?: number;
  };
  
  // Piè di pagina
  footer: {
    enabled: boolean;
    content?: string;
    height?: number;
    pageNumber: boolean;
  };
  
  // watermark
  watermark?: {
    text: string;
    opacity: number;
    rotation: number;
  };
}
```

---

## 2. Modello Istituzione

### 2.1 Institute

Fonte unica dell'identità istituzionale.

```typescript
interface Institute {
  id: string;
  name: string;
  municipality: string;
  province: string;
  region: string;
  codiceMeccanografico: string;
  logo?: string;
  config: InstituteConfig;
  createdAt: string;
  updatedAt: string;
}
```

### 2.2 InstituteConfig

Configurazione completa dell'istituto.

```typescript
interface InstituteConfig {
  id: string;
  instituteId: string;
  
  // Struttura scolastica
  schoolOrders: SchoolOrder[];
  gradeLabels: Record<string, string>;
  classSections: string[];
  
  // Dipartimenti
  departments: Department[];
  
  // Ruoli e assegnazioni
  roles: InstitutionalRole[];
  roleAssignments: RoleAssignment[];
  
  // Regole istituzionali
  rules: InstitutionalRules;
  
  // Template
  documentTemplates: DocumentTemplate[];
  
  // Stile predefinito
  defaultDocumentStyle: DocumentStyle;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  version: number;
}
```

### 2.3 Department

Dipartimento disciplinare.

```typescript
interface Department {
  id: string;
  name: string;                            // "Dipartimento di Scienze"
  disciplines: string[];                   // ["Scienze e Tecnologie", "Scienze della Terra"]
  coordinatorId?: string;                  // userId del coordinatore
  members: string[];                       // userId dei membri
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}
```

### 2.4 InstitutionalRules

Regole che governano il workflow istituzionale.

```typescript
interface InstitutionalRules {
  // Approvazione
  requiresCollegioApproval: boolean;
  approvalWorkflow: 'simple' | 'collegio' | 'dirigente';
  
  // Proposte
  allowParallelProposals: boolean;
  maxProposalsPerUser?: number;
  
  // Documenti
  requiredDocumentFields: string[];
  autoSaveEnabled: boolean;
  autoSaveInterval?: number;               // minuti
  
  // Validità
  maxDraftAge: number;                     // giorni prima della scadenza
  requireApprovalForExport: boolean;
  
  // Visibilità
  defaultVisibility: 'private' | 'department' | 'institute';
  allowPublicSharing: boolean;
}
```

---

## 3. Fonte Unica dell'Identità

### 3.1 Problema

Attualmente, l'identità della scuola è hardcoded in 8+ posizioni:
- `src/features/documents/utils/schoolIdentity.ts`
- `src/features/documents/hooks/useDocumentExportHandlers.ts` (linee 228, 241, 242, 243, 278, 635, 640, 749)
- Template inline nell'HTML

### 3.2 Soluzione

```typescript
// UNICA FONTE DELLA VERITÀ
interface InstituteIdentity {
  name: string;
  address: string;
  municipality: string;
  province: string;
  cap: string;
  codiceMeccanografico: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  pofUrl?: string;
}

// Tutte le funzioni di esportazione consumano questa interfaccia
function getSchoolIdentity(instituteId: string): InstituteIdentity {
  // Da Institute.config o da IndexedDB
}
```

### 3.3 Mapping

| Posizione Attuale | Nuova Fonte |
|-------------------|-------------|
| `getSchoolIdentity()` in `schoolIdentity.ts` | `Institute.config.identity` |
| Hardcoded in `useDocumentExportHandlers.ts` | `getSchoolIdentity(instituteId)` |
| Template inline | `DocumentTemplate.variables` |

---

## 4. Template System

### 4.1 Template di Sistema

Template predefiniti forniti dal sistema:

```typescript
const SYSTEM_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'system-uda',
    name: 'UDA Standard',
    documentType: 'uda',
    sections: [
      { id: 'header', name: 'Intestazione', order: 0, content: '<h1>{{titolo}}</h1>' },
      { id: 'context', name: 'Contesto', order: 1, content: '<p>Classe: {{classe}}</p>' },
      { id: 'body', name: 'Corpo', order: 2, content: '{{contenuto}}' },
    ],
    variables: [
      { name: 'titolo', type: 'text', required: true },
      { name: 'classe', type: 'text', required: true },
      { name: 'contenuto', type: 'text', required: true },
    ],
    defaultStyle: DEFAULT_DOCUMENT_STYLE,
    isSystem: true,
  },
  // ... altri template di sistema
];
```

### 4.2 Template Istituzionali

Template personalizzati dall'amministratore:

```typescript
const INSTITUTE_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'inst-001',
    instituteId: 'institute-001',
    name: 'Relazione Annuale Scienze',
    documentType: 'relazione',
    sections: [
      // ... sezioni personalizzate
    ],
    variables: [
      // ... variabili personalizzate
    ],
    isSystem: false,
  },
];
```

### 4.3 Generazione Documenti

```typescript
function generateDocument(
  template: DocumentTemplate,
  data: Record<string, unknown>,
  style: DocumentStyle
): string {
  let html = '';
  
  for (const section of template.sections) {
    if (section.condition && !evaluateCondition(section.condition, data)) {
      continue;
    }
    
    let sectionHtml = section.content;
    for (const [key, value] of Object.entries(data)) {
      sectionHtml = sectionHtml.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
    html += sectionHtml;
  }
  
  return applyStyle(html, style);
}
```

---

## 5. Identità Centralizzata

### 5.1 Struttura

```typescript
interface SchoolIdentity {
  // Dati anagrafici
  name: string;
  address: string;
  municipality: string;
  province: string;
  cap: string;
  
  // Codici
  codiceMeccanografico: string;
  codiceFiscale?: string;
  partitaIva?: string;
  
  // Contatti
  phone?: string;
  email?: string;
  website?: string;
  
  // Logo
  logo?: string;                           // Base64 o URL
  
  // POF
  pofUrl?: string;
  
  // Responsabile
  dirigenteName?: string;
  dirigenteEmail?: string;
}
```

### 5.2 Utilizzo

```typescript
// Invece di:
const schoolName = "Istituto Comprensivo Leonardo da Vinci";
const schoolAddress = "Via Roma 123";

// Si usa:
const identity = getSchoolIdentity(instituteId);
const schoolName = identity.name;
const schoolAddress = identity.address;
```

### 5.3 Vantaggi

1. **Singola fonte di verità** →nessuna duplicazione
2. **Facile aggiornamento** → cambia in un posto
3. **Consistenza** → tutti i documenti usano gli stessi dati
4. **Testabilità** → mock facili
5. **Configurabilità** → ogni istituto ha i propri dati
