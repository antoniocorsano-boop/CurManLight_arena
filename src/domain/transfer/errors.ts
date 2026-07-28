export type TransferErrorType =
  | 'CONTRACT_NOT_SUPPORTED'
  | 'VERSION_NOT_SUPPORTED'
  | 'PAYLOAD_INVALID'
  | 'REFERENCE_MISSING'
  | 'ENTITY_NOT_RESOLVED'
  | 'SOURCE_STATUS_INVALID'
  | 'IDENTITY_CONFLICT'
  | 'METADATA_MISSING'
  | 'SOURCE_MISSING'
  | 'LEGACY_CONTENT_INCOMPLETE'
  | 'EXPERIMENTAL_NOT_TRANSFERABLE'
  | 'POST_CONDITION_FAILED'
  | 'SIGNATURE_INCOHERENT'
  | 'TARGET_INCOMPATIBLE'
  | 'SOURCE_NOT_FOUND'
  | 'TARGET_INVALID'
  | 'STATUS_VIOLATION'
  | 'VALIDATION_FAILED'
  | 'SIGNATURE_MISMATCH'
  | 'DUPLICATE_CONFLICT'
  | 'TEMPLATE_NOT_FOUND'
  | 'FORMAT_UNSUPPORTED'
  | 'INTEGRITY_VIOLATION'
  | 'SCHEMA_MISMATCH';

export type RecoveryAction = 'retry' | 'skip' | 'rollback' | 'manual-intervention';

export interface TransferRecovery {
  readonly errorType: TransferErrorType;
  readonly recoverable: boolean;
  readonly recoveryAction?: RecoveryAction;
  readonly maxRetries?: number;
}

export interface TransferError {
  readonly errorType: TransferErrorType;
  readonly code: string;
  readonly message: string;
  readonly uiMessage?: string;
  readonly recoverable: boolean;
  readonly recoveryAction?: RecoveryAction;
  readonly details?: Record<string, unknown>;
  readonly affectedRefs?: readonly string[];
}

export const RECOVERY_STRATEGIES: ReadonlyMap<TransferErrorType, TransferRecovery> = new Map([
  ['CONTRACT_NOT_SUPPORTED', { errorType: 'CONTRACT_NOT_SUPPORTED', recoverable: false }],
  ['VERSION_NOT_SUPPORTED', { errorType: 'VERSION_NOT_SUPPORTED', recoverable: false }],
  ['PAYLOAD_INVALID', { errorType: 'PAYLOAD_INVALID', recoverable: false }],
  ['REFERENCE_MISSING', { errorType: 'REFERENCE_MISSING', recoverable: false }],
  ['ENTITY_NOT_RESOLVED', { errorType: 'ENTITY_NOT_RESOLVED', recoverable: false }],
  ['SOURCE_STATUS_INVALID', { errorType: 'SOURCE_STATUS_INVALID', recoverable: false }],
  ['IDENTITY_CONFLICT', { errorType: 'IDENTITY_CONFLICT', recoverable: false }],
  ['METADATA_MISSING', { errorType: 'METADATA_MISSING', recoverable: true, recoveryAction: 'skip' }],
  ['SOURCE_MISSING', { errorType: 'SOURCE_MISSING', recoverable: false }],
  ['LEGACY_CONTENT_INCOMPLETE', { errorType: 'LEGACY_CONTENT_INCOMPLETE', recoverable: true, recoveryAction: 'skip' }],
  ['EXPERIMENTAL_NOT_TRANSFERABLE', { errorType: 'EXPERIMENTAL_NOT_TRANSFERABLE', recoverable: false }],
  ['POST_CONDITION_FAILED', { errorType: 'POST_CONDITION_FAILED', recoverable: false }],
  ['SIGNATURE_INCOHERENT', { errorType: 'SIGNATURE_INCOHERENT', recoverable: false }],
  ['TARGET_INCOMPATIBLE', { errorType: 'TARGET_INCOMPATIBLE', recoverable: false }],
  ['SOURCE_NOT_FOUND', { errorType: 'SOURCE_NOT_FOUND', recoverable: false }],
  ['TARGET_INVALID', { errorType: 'TARGET_INVALID', recoverable: false }],
  ['STATUS_VIOLATION', { errorType: 'STATUS_VIOLATION', recoverable: false }],
  ['VALIDATION_FAILED', { errorType: 'VALIDATION_FAILED', recoverable: false }],
  ['SIGNATURE_MISMATCH', { errorType: 'SIGNATURE_MISMATCH', recoverable: false }],
  ['DUPLICATE_CONFLICT', { errorType: 'DUPLICATE_CONFLICT', recoverable: true, recoveryAction: 'skip' }],
  ['TEMPLATE_NOT_FOUND', { errorType: 'TEMPLATE_NOT_FOUND', recoverable: true, recoveryAction: 'skip' }],
  ['FORMAT_UNSUPPORTED', { errorType: 'FORMAT_UNSUPPORTED', recoverable: false }],
  ['INTEGRITY_VIOLATION', { errorType: 'INTEGRITY_VIOLATION', recoverable: false }],
  ['SCHEMA_MISMATCH', { errorType: 'SCHEMA_MISMATCH', recoverable: false }],
]);

const ERROR_MESSAGES: ReadonlyMap<TransferErrorType, string> = new Map([
  ['CONTRACT_NOT_SUPPORTED', 'Transfer contract not supported'],
  ['VERSION_NOT_SUPPORTED', 'Transfer contract version not supported'],
  ['PAYLOAD_INVALID', 'Transfer payload is invalid'],
  ['REFERENCE_MISSING', 'Required reference is missing'],
  ['ENTITY_NOT_RESOLVED', 'Entity could not be resolved'],
  ['SOURCE_STATUS_INVALID', 'Source entity is in an invalid status for this transfer'],
  ['IDENTITY_CONFLICT', 'Identity conflict detected'],
  ['METADATA_MISSING', 'Required metadata is missing'],
  ['SOURCE_MISSING', 'Source entity not found'],
  ['LEGACY_CONTENT_INCOMPLETE', 'Legacy content is incomplete'],
  ['EXPERIMENTAL_NOT_TRANSFERABLE', 'Experimental content cannot be transferred'],
  ['POST_CONDITION_FAILED', 'Post-condition validation failed'],
  ['SIGNATURE_INCOHERENT', 'Structural footprint is incoherent with payload'],
  ['TARGET_INCOMPATIBLE', 'Target is incompatible with this transfer'],
  ['SOURCE_NOT_FOUND', 'Source entity not found'],
  ['TARGET_INVALID', 'Target entity is invalid'],
  ['STATUS_VIOLATION', 'Status violation'],
  ['VALIDATION_FAILED', 'Validation failed'],
  ['SIGNATURE_MISMATCH', 'Structural footprint mismatch'],
  ['DUPLICATE_CONFLICT', 'Duplicate entity conflict'],
  ['TEMPLATE_NOT_FOUND', 'Template not found'],
  ['FORMAT_UNSUPPORTED', 'Format not supported'],
  ['INTEGRITY_VIOLATION', 'Data integrity violation'],
  ['SCHEMA_MISMATCH', 'Schema version mismatch'],
]);

const UI_MESSAGES: ReadonlyMap<TransferErrorType, string> = new Map([
  ['CONTRACT_NOT_SUPPORTED', 'Questo tipo di trasferimento non è ancora supportato.'],
  ['VERSION_NOT_SUPPORTED', 'La versione del contratto non è compatibile.'],
  ['PAYLOAD_INVALID', 'I dati inviati non sono validi.'],
  ['REFERENCE_MISSING', 'Un riferimento necessario è assente.'],
  ['ENTITY_NOT_RESOLVED', 'Un\'entità non può essere identificata.'],
  ['SOURCE_STATUS_INVALID', 'Lo stato della sorgente non permette questo trasferimento.'],
  ['IDENTITY_CONFLICT', 'È stato rilevato un conflitto di identità.'],
  ['METADATA_MISSING', 'Metadati necessari mancanti.'],
  ['SOURCE_MISSING', 'La sorgente non è stata trovata.'],
  ['LEGACY_CONTENT_INCOMPLETE', 'Il contenuto legacy è incompleto.'],
  ['EXPERIMENTAL_NOT_TRANSFERABLE', 'Il contenuto sperimentale non può essere trasferito.'],
  ['POST_CONDITION_FAILED', 'La validazione post-trasferimento non è passata.'],
  ['SIGNATURE_INCOHERENT', 'L\'impronta strutturale non corrisponde al payload.'],
  ['TARGET_INCOMPATIBLE', 'La destinazione non è compatibile con questo trasferimento.'],
  ['SOURCE_NOT_FOUND', 'La sorgente non è stata trovata.'],
  ['TARGET_INVALID', 'La destinazione non è valida.'],
  ['STATUS_VIOLATION', 'Lo stato non è consentito per questa operazione.'],
  ['VALIDATION_FAILED', 'La validazione non è passata.'],
  ['SIGNATURE_MISMATCH', 'L\'impronta strutturale non corrisponde.'],
  ['DUPLICATE_CONFLICT', 'Esiste già un\'entità duplicata.'],
  ['TEMPLATE_NOT_FOUND', 'Il modello richiesto non esiste.'],
  ['FORMAT_UNSUPPORTED', 'Il formato richiesto non è supportato.'],
  ['INTEGRITY_VIOLATION', 'Violazione di integrità dati.'],
  ['SCHEMA_MISMATCH', 'Versione schema incompatibile.'],
]);

let errorCounter = 0;

export function createTransferError(
  errorType: TransferErrorType,
  options?: {
    details?: Record<string, unknown>;
    affectedRefs?: string[];
  },
): TransferError {
  errorCounter++;
  const recovery = RECOVERY_STRATEGIES.get(errorType);
  const code = `TE-${errorType.slice(0, 4)}-${String(errorCounter).padStart(4, '0')}`;
  return {
    errorType,
    code,
    message: ERROR_MESSAGES.get(errorType) ?? errorType,
    uiMessage: UI_MESSAGES.get(errorType),
    recoverable: recovery?.recoverable ?? false,
    recoveryAction: recovery?.recoveryAction,
    details: options?.details,
    affectedRefs: options?.affectedRefs,
  };
}

export function classifyError(error: unknown): TransferError {
  if (error && typeof error === 'object' && 'errorType' in error) {
    const e = error as { errorType: string };
    if (RECOVERY_STRATEGIES.has(e.errorType as TransferErrorType)) {
      return error as TransferError;
    }
  }
  return createTransferError('VALIDATION_FAILED', {
    details: { originalError: error instanceof Error ? error.message : String(error) },
  });
}
