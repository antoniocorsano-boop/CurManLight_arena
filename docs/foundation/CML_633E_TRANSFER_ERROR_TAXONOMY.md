# CML-633E Transfer Error Taxonomy

> Complete error classification for cross-area transfer contracts.

## Error Types

| Code | Error Type | Recoverable | Recovery Action | UI Message |
|------|-----------|-------------|-----------------|------------|
| TE-CONT-0001 | CONTRACT_NOT_SUPPORTED | No | — | Questo tipo di trasferimento non è ancora supportato. |
| TE-VERS-0002 | VERSION_NOT_SUPPORTED | No | — | La versione del contratto non è compatibile. |
| TE-PAYL-0003 | PAYLOAD_INVALID | No | — | I dati inviati non sono validi. |
| TE-REFE-0004 | REFERENCE_MISSING | No | — | Un riferimento necessario è assente. |
| TE-ENTI-0005 | ENTITY_NOT_RESOLVED | No | — | Un'entità non può essere identificata. |
| TE-SOUR-0006 | SOURCE_STATUS_INVALID | No | — | Lo stato della sorgente non permette questo trasferimento. |
| TE-IDE-0007 | IDENTITY_CONFLICT | No | — | È stato rilevato un conflitto di identità. |
| TE-META-0008 | METADATA_MISSING | Yes | Skip | Metadati necessari mancanti. |
| TE-SOUR-0009 | SOURCE_MISSING | No | — | La sorgente non è stata trovata. |
| TE-LEGA-0010 | LEGACY_CONTENT_INCOMPLETE | Yes | Skip | Il contenuto legacy è incompleto. |
| TE-EXPE-0011 | EXPERIMENTAL_NOT_TRANSFERABLE | No | — | Il contenuto sperimentale non può essere trasferito. |
| TE-POST-0012 | POST_CONDITION_FAILED | No | — | La validazione post-trasferimento non è passata. |
| TE-SIGN-0013 | SIGNATURE_INCOHERENT | No | — | L'impronta strutturale non corrisponde al payload. |
| TE-TARG-0014 | TARGET_INCOMPATIBLE | No | — | La destinazione non è compatibile con questo trasferimento. |
| TE-SOUR-0015 | SOURCE_NOT_FOUND | No | — | La sorgente non è stata trovata. |
| TE-TARG-0016 | TARGET_INVALID | No | — | La destinazione non è valida. |
| TE-STAT-0017 | STATUS_VIOLATION | No | — | Lo stato non è consentito per questa operazione. |
| TE-VALI-0018 | VALIDATION_FAILED | No | — | La validazione non è passata. |
| TE-SIGN-0019 | SIGNATURE_MISMATCH | No | — | L'impronta strutturale non corrisponde. |
| TE-DUPL-0020 | DUPLICATE_CONFLICT | Yes | Skip | Esiste già un'entità duplicata. |
| TE-TEMP-0021 | TEMPLATE_NOT_FOUND | Yes | Skip | Il modello richiesto non esiste. |
| TE-FORM-0022 | FORMAT_UNSUPPORTED | No | — | Il formato richiesto non è supportato. |
| TE-INTG-0023 | INTEGRITY_VIOLATION | No | — | Violazione di integrità dati. |
| TE-SCHE-0024 | SCHEMA_MISMATCH | No | — | Versione schema incompatibile. |

## Recovery Strategies

- **Retry:** Operation may succeed on retry (transient failure).
- **Skip:** Individual entity can be skipped without halting transfer.
- **Rollback:** Entire transfer can be reversed.
- **Manual intervention:** Requires human action to resolve.

## Error Structure

```typescript
interface TransferError {
  errorType: TransferErrorType;  // Stable enum value
  code: string;                   // Stable code (e.g., "TE-SOUR-0009")
  message: string;                // Technical message
  uiMessage?: string;             // User-facing message (Italian)
  recoverable: boolean;           // Whether transfer can continue
  recoveryAction?: RecoveryAction;
  details?: Record<string, unknown>;
  affectedRefs?: readonly string[];
}
```
