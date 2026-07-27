# CML-633 Cross-Area Transfer Contracts

> **Classificazione:** `CML_633_CROSS_AREA_TRANSFER_CONTRACTS`  
> **Branch:** `design/cml-633-product-foundation-redesign`  
> **Data:** 27 luglio 2026  
> **Stato:** COMPLETO

---

## 1. Contratti di Transfer

### 1.1 Princìpi

1. **Ogni transfer è un'operazione tracciata** → genera un evento nel dominio
2. **Ogni transfer ha un contratto formale** → input/output tipizzati
3. **Ogni transfer genera una firma** → hash del contenuto trasferito
4. **I transfer sono unidirezionali** → A→B non implica B→A
5. **I transfer possono essere reversibili** → con operazione inverse esplicita

---

## 2. Transfer A11 → A02 (Knowledge Builder → Curriculum Editor)

### 2.1 Descrizione

L'utente trasferisce conoscenze strutturate dal Knowledge Builder al Curriculum Editor per creare nuovi nodi curricolari.

### 2.2 Contratto

```typescript
interface A11ToA02Transfer {
  // Input
  sourceNodes: CurriculumNode[];
  targetCurriculumVersionId: string;
  
  // Configurazione
  mergeStrategy: 'create-new' | 'update-existing' | 'skip-duplicates';
  targetDiscipline: string;
  targetArea: string;
  
  // Output
  result: TransferResult;
}

interface TransferResult {
  success: boolean;
  created: CurriculumNode[];
  updated: CurriculumNode[];
  skipped: CurriculumNode[];
  errors: TransferError[];
  
  // Firma
  transferSignature: string;
  transferredAt: string;
  transferredBy: string;
}

interface TransferError {
  nodeId: string;
  reason: string;
  recoverable: boolean;
}
```

### 2.3 Flusso

```
A11: Knowledge Builder
  │
  │ 1. Utente seleziona conoscenze
  │
  ▼
TransferContract.validate()
  │
  │ 2. Validazione input
  │  - Source nodes esistono
  │  - Target curriculum version è in stato 'draft'
  │  - Merge strategy è valida
  │
  ▼
TransferContract.execute()
  │
  │ 3. Esecuzione transfer
  │  - Per ogni source node:
  │    - Se create-new: crea nuovo CurriculumNode
  │    - Se update-existing: aggiorna nodo esistente
  │    - Se skip-duplicates: salta se esiste
  │
  ▼
TransferContract.sign()
  │
  │ 4. Firma transfer
  │  - Calcola hash del contenuto trasferito
  │  - Crea DomainEvent di tipo 'transfer-received'
  │
  ▼
A02: Curriculum Editor
  │
  │ 5. Nuovi nodi disponibili per editing
  │
```

### 2.4 Vincoli

- Il target curriculum version deve essere in stato `draft`
- I nodi sorgente devono avere stato `validated` o `approved`
- La disciplina target deve essere valida nel curriculum

---

## 3. Transfer A02 → A03 (Curriculum Editor → Proposal Generator)

### 3.1 Descrizione

L'utente trasferisce segmenti curricolari dal Curriculum Editor al Proposal Generator per generare proposte di modifica.

### 3.2 Contratto

```typescript
interface A02ToA03Transfer {
  // Input
  sourceSegments: CurriculumSegment[];
  proposalType: ProposalType;
  
  // Configurazione
  includeChildNodes: boolean;
  preserveSourceReferences: boolean;
  
  // Output
  result: TransferResult;
  proposals: Proposal[];
}
```

### 3.3 Flusso

```
A02: Curriculum Editor
  │
  │ 1. Utente seleziona segmenti
  │
  ▼
TransferContract.validate()
  │
  │ 2. Validazione input
  │  - Source segments esistono
  │  - Segmenti hanno contenuto valido
  │  - Proposal type è compatibile
  │
  ▼
TransferContract.execute()
  │
  │ 3. Creazione proposte
  │  - Per ogni segmento:
  │    - Crea Proposal con proposedContent
  │    - Collega a source segment
  │    - Imposta stato 'draft'
  │
  ▼
A03: Proposal Generator
  │
  │ 4. Proposte disponibili per editing
  │
```

---

## 4. Transfer A02/A03 → A04 (Curriculum/Proposal → Document Generator)

### 4.1 Descrizione

Trasferimento di contenuti curricolari e proposte al Document Generator per la creazione di documenti esportabili.

### 4.2 Contratto

```typescript
interface A02A03ToA04Transfer {
  // Input
  sourceType: 'curriculum' | 'proposal' | 'mixed';
  sourceIds: string[];
  
  // Configurazione
  documentType: DocumentType;
  templateId?: string;
  style?: DocumentStyle;
  
  // Contesto
  discipline: string;
  order: string;
  classLabel?: string;
  academicYear?: string;
  
  // Output
  result: TransferResult;
  document: Document;
}
```

### 4.3 Flusso

```
A02/A03: Curriculum/Proposal
  │
  │ 1. Utente seleziona contenuti
  │
  ▼
TransferContract.validate()
  │
  │ 2. Validazione input
  │  - Source IDs esistono
  │  - Document type è valido
  │  - Template esiste (se specificato)
  │  - Campi obbligatori compilati
  │
  ▼
TransferContract.execute()
  │
  │ 3. Generazione documento
  │  - Crea Document entity
  │  - Applica template
  │  - Inserisci contenuto
  │  - Calcola firma
  │
  ▼
TransferContract.sign()
  │
  │ 4. Firma documento
  │  - Calcola content hash
  │  - Crea DocumentVersion
  │  - Registra evento 'document-exported'
  │
  ▼
A04: Document Generator
  │
  │ 5. Documento pronto per esportazione
  │
```

---

## 5. Transfer A04 → A07 (Document Generator → Export Center)

### 5.1 Descrizione

Trasferimento di documenti generati al Export Center per l'esportazione finale.

### 5.2 Contratto

```typescript
interface A04ToA07Transfer {
  // Input
  documentId: string;
  exportFormat: ExportFormat;
  
  // Configurazione
  includeMetadata: boolean;
  includeSignature: boolean;
  
  // Output
  result: TransferResult;
  exportData: ExportData;
}

interface ExportData {
  document: Document;
  version: DocumentVersion;
  exportUrl?: string;          // Blob URL per download
  exportedAt: string;
}
```

### 5.3 Flusso

```
A04: Document Generator
  │
  │ 1. Utente richiede esportazione
  │
  ▼
TransferContract.validate()
  │
  │ 2. Validazione input
  │  - Document ID esiste
  │  - Formato è supportato
  │  - Documento ha contenuto
  │
  ▼
TransferContract.execute()
  │
  │ 3. Generazione export
  │  - Applica formattazione
  │  - Inserisci header/footer
  │  - Aggiungi watermark (se previsto)
  │  - Genera file
  │
  ▼
TransferContract.sign()
  │
  │ 4. Registra export
  │  - Crea DocumentVersion
  │  - Calcola content hash
  │  - Registra evento 'document-version-created'
  │
  ▼
A07: Export Center
  │
  │ 5. File pronto per download
  │
```

---

## 6. Transfer Reverse (A07 → A04)

### 6.1 Descrizione

Operazione inverse per importare documenti esportati. Utile per ripristinare documenti o importare da fonti esterne.

### 6.2 Contratto

```typescript
interface A07ToA04TransferReverse {
  // Input
  importFile: File;
  importFormat: ExportFormat;
  
  // Configurazione
  mergeStrategy: 'create-new' | 'update-existing';
  preserveVersionHistory: boolean;
  
  // Output
  result: TransferResult;
  document: Document;
}
```

---

## 7. Transfer Signatures

### 7.1 Struttura Firma

```typescript
interface TransferSignature {
  transferId: string;
  fromArea: string;
  toArea: string;
  data: Record<string, unknown>;
  timestamp: string;
  userId: string;
  
  // Firma
  signatureHash: string;       // SHA-256 di tutti i campi
  previousSignature?: string;  // Firma precedente per catena
}
```

### 7.2 Calcolo Firma

```typescript
function computeTransferSignature(transfer: TransferSignature): string {
  const payload = JSON.stringify({
    transferId: transfer.transferId,
    fromArea: transfer.fromArea,
    toArea: transfer.toArea,
    data: transfer.data,
    timestamp: transfer.timestamp,
    userId: transfer.userId,
  });
  return sha256(payload);
}
```

### 7.3 Validazione Firma

```typescript
function validateTransferSignature(
  transfer: TransferSignature,
  storedSignature: string
): boolean {
  const computed = computeTransferSignature(transfer);
  return computed === storedSignature;
}
```

---

## 8. Matrice Transfer

| Da \ A | A01 | A02 | A03 | A04 | A07 |
|--------|-----|-----|-----|-----|-----|
| **A01** | — | ✅ | ❌ | ❌ | ❌ |
| **A02** | ❌ | — | ✅ | ✅ | ❌ |
| **A03** | ❌ | ❌ | — | ✅ | ❌ |
| **A04** | ❌ | ❌ | ❌ | — | ✅ |
| **A07** | ❌ | ❌ | ❌ | ✅* | — |

*Transfer reverse

---

## 9. Error Handling

### 9.1 Tipi di Errore

```typescript
type TransferErrorType = 
  | 'SOURCE_NOT_FOUND'        // Entità sorgente non trovata
  | 'TARGET_INVALID'          // Entità target non valida
  | 'STATUS_VIOLATION'        // Stato non permesso
  | 'ROLE_VIOLATION'          // Ruolo non autorizzato
  | 'VALIDATION_FAILED'       // Validazione contenuto fallita
  | 'SIGNATURE_MISMATCH'      // Firma non valida
  | 'DUPLICATE_CONFLICT'      // Conflitto con duplicato
  | 'TEMPLATE_NOT_FOUND'      // Template non trovato
  | 'FORMAT_UNSUPPORTED'      // Formato non supportato
  | 'INTEGRITY_VIOLATION';    // Violazione integrità dati
```

### 9.2 Strategia di Recovery

```typescript
interface TransferRecovery {
  errorType: TransferErrorType;
  recoverable: boolean;
  recoveryAction?: 'retry' | 'skip' | 'rollback' | 'manual-intervention';
  maxRetries?: number;
}
```

---

## 10. Eventi di Transfer

Ogni transfer genera un evento nel dominio:

```typescript
interface TransferEvent extends DomainEvent {
  eventType: 'transfer-received';
  payload: {
    transferId: string;
    fromArea: string;
    toArea: string;
    entityCount: number;
    signatureHash: string;
  };
}
```
