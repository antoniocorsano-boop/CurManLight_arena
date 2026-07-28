import { isValidArea } from './vocabularies';
import type {
  TransferPayload,
  TransferResult,
  TransferResultCompleted,
  TransferResultPartial,
  TransferMetadata,
  TransferWarning,
} from './types';

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ValidationError[];
  readonly warnings: readonly TransferWarning[];
}

function ok(warnings: TransferWarning[] = []): ValidationResult {
  return { valid: true, errors: [], warnings };
}

function fail(errors: ValidationError[], warnings: TransferWarning[] = []): ValidationResult {
  return { valid: false, errors, warnings };
}

const SUPPORTED_CONTRACT_IDS = ['A11-A02', 'A11-A03', 'A11-A04', 'A11-A07'] as const;
const SUPPORTED_VERSIONS = [1] as const;

export function validateContract(payload: TransferPayload): ValidationResult {
  const errors: ValidationError[] = [];

  if (!(SUPPORTED_CONTRACT_IDS as readonly string[]).includes(payload.contractId as string)) {
    errors.push({
      field: 'contractId',
      message: `Contract "${payload.contractId}" is not supported`,
      code: 'CONTRACT_NOT_SUPPORTED',
    });
  }

  if (!(SUPPORTED_VERSIONS as readonly number[]).includes(payload.contractVersion as number)) {
    errors.push({
      field: 'contractVersion',
      message: `Version ${payload.contractVersion} is not supported`,
      code: 'VERSION_NOT_SUPPORTED',
    });
  }

  return errors.length > 0 ? fail(errors) : ok();
}

export function validatePreConditions(payload: TransferPayload): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: TransferWarning[] = [];

  if (!payload.sourceRefs || payload.sourceRefs.length === 0) {
    errors.push({
      field: 'sourceRefs',
      message: 'At least one source reference is required',
      code: 'SOURCE_MISSING',
    });
  }

  if (!payload.targetRef || !payload.targetRef.entityId) {
    errors.push({
      field: 'targetRef',
      message: 'Target reference is required',
      code: 'TARGET_INVALID',
    });
  }

  if (!isValidArea(payload.fromArea as string)) {
    errors.push({
      field: 'fromArea',
      message: `"${payload.fromArea}" is not a valid transfer area`,
      code: 'TARGET_INCOMPATIBLE',
    });
  }

  if (!isValidArea(payload.toArea as string)) {
    errors.push({
      field: 'toArea',
      message: `"${payload.toArea}" is not a valid transfer area`,
      code: 'TARGET_INCOMPATIBLE',
    });
  }

  if (payload.fromArea === payload.toArea) {
    errors.push({
      field: 'toArea',
      message: 'Source and target areas must differ',
      code: 'STATUS_VIOLATION',
    });
  }

  if (errors.length === 0 && payload.sourceRefs.length === 1) {
    warnings.push({ code: 'SOURCE_SINGLE', message: 'Transfer has only one source reference' });
  }

  return errors.length > 0 ? fail(errors, warnings) : ok(warnings);
}

export function validatePayload(payload: TransferPayload): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: TransferWarning[] = [];

  if (!payload.transferId || (payload.transferId as string).trim() === '') {
    errors.push({
      field: 'transferId',
      message: 'transferId must be non-empty',
      code: 'REFERENCE_MISSING',
    });
  }

  if (!payload.contractId || (payload.contractId as string).trim() === '') {
    errors.push({
      field: 'contractId',
      message: 'contractId must be non-empty',
      code: 'REFERENCE_MISSING',
    });
  }

  if (payload.sourceRefs) {
    payload.sourceRefs.forEach((ref, i) => {
      if (!ref.entityId || ref.entityId.trim() === '') {
        errors.push({
          field: `sourceRefs[${i}].entityId`,
          message: `Source ref at index ${i} has empty entityId`,
          code: 'REFERENCE_MISSING',
        });
      }
      if (!ref.entityType || ref.entityType.trim() === '') {
        errors.push({
          field: `sourceRefs[${i}].entityType`,
          message: `Source ref at index ${i} has empty entityType`,
          code: 'REFERENCE_MISSING',
        });
      }
    });
  }

  if (payload.targetRef) {
    if (!payload.targetRef.entityType || payload.targetRef.entityType.trim() === '') {
      errors.push({
        field: 'targetRef.entityType',
        message: 'Target ref has empty entityType',
        code: 'REFERENCE_MISSING',
      });
    }
  }

  if (errors.length === 0 && payload.config && Object.keys(payload.config).length === 0) {
    warnings.push({ code: 'CONFIG_EMPTY', message: 'Config is empty' });
  }

  return errors.length > 0 ? fail(errors, warnings) : ok(warnings);
}

export function validatePostConditions(
  result: TransferResult,
  _payload: TransferPayload,
): ValidationResult {
  const errors: ValidationError[] = [];

  if (result.status === 'completed') {
    const completed = result as TransferResultCompleted;
    const allCreated = completed.created.length > 0;
    if (!allCreated) {
      errors.push({
        field: 'created',
        message: 'Completed transfer must have at least one created entity',
        code: 'POST_CONDITION_FAILED',
      });
    }
  } else if (result.status === 'partial') {
    const partial = result as TransferResultPartial;
    if (partial.errors.length === 0) {
      errors.push({
        field: 'errors',
        message: 'Partial transfer must have at least one error',
        code: 'POST_CONDITION_FAILED',
      });
    }
  }

  return errors.length > 0 ? fail(errors) : ok();
}

export function validateCompleteness(metadata: TransferMetadata): ValidationResult {
  const errors: ValidationError[] = [];

  if (!metadata.sessionTimestamp || metadata.sessionTimestamp.trim() === '') {
    errors.push({
      field: 'metadata.sessionTimestamp',
      message: 'sessionTimestamp is required',
      code: 'METADATA_MISSING',
    });
  }

  return errors.length > 0 ? fail(errors) : ok();
}

export function validateStateCompatibility(_payload: TransferPayload): ValidationResult {
  const errors: ValidationError[] = [];

  if (_payload.fromArea === _payload.toArea) {
    errors.push({
      field: 'fromArea/toArea',
      message: 'Cannot transfer to the same area',
      code: 'STATUS_VIOLATION',
    });
  }

  return errors.length > 0 ? fail(errors) : ok();
}
