import type { ValidationResult, ValidationError } from './validators';
import type { TransferWarning, TransferId, StructuralFootprint } from './types';
import { createTransferId, createTransferEvent } from './types';
import { computeStructuralFootprint } from './signatures';
import type { TransferEventLog } from './eventLog';

export interface A02ToA04Payload {
  readonly nodeRefs: ReadonlyArray<{ readonly entityId: string; readonly entityType: string }>;
  readonly explicitSnapshots: Record<string, string>;
  readonly sources: ReadonlyArray<string>;
  readonly evidences: ReadonlyArray<string>;
  readonly curriculumVersionRef: string;
  readonly origin: string;
  readonly legacyWarnings: ReadonlyArray<string>;
  readonly metadata: { readonly sessionTimestamp: string };
}

export interface A03ToA04Payload {
  readonly proposalRefs: ReadonlyArray<{ readonly entityId: string; readonly entityType: string; readonly status: string }>;
  readonly allowedStates: ReadonlyArray<string>;
  readonly metadata: { readonly sessionTimestamp: string };
}

export interface A04ToA07Payload {
  readonly designId: string;
  readonly curriculumRefs: ReadonlyArray<string>;
  readonly sources: ReadonlyArray<string>;
  readonly institutionalContext: Record<string, unknown>;
  readonly teachingStructure: Record<string, unknown>;
  readonly assistedContentOrigin: string;
  readonly versionOrSnapshot: string;
  readonly warnings: ReadonlyArray<string>;
  readonly metadata: { readonly sessionTimestamp: string };
}

const AUTO_CREATED_ENTITY_PATTERN = /auto[_-]?creat/i;

function checkNoAutoCreated(
  entities: ReadonlyArray<string>,
  fieldPath: string,
  errors: ValidationError[],
): void {
  for (const e of entities) {
    if (AUTO_CREATED_ENTITY_PATTERN.test(e)) {
      errors.push({
        field: fieldPath,
        message: `Auto-created document detected: "${e}"`,
        code: 'VALIDATION_FAILED',
      });
    }
  }
}

export function validateA02ToA04(payload: A02ToA04Payload): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: TransferWarning[] = [];

  if (!payload.nodeRefs || payload.nodeRefs.length === 0) {
    errors.push({
      field: 'nodeRefs',
      message: 'nodeRefs must be non-empty',
      code: 'REFERENCE_MISSING',
    });
  }

  if (!payload.curriculumVersionRef || payload.curriculumVersionRef.trim() === '') {
    errors.push({
      field: 'curriculumVersionRef',
      message: 'curriculumVersionRef must be non-empty',
      code: 'REFERENCE_MISSING',
    });
  }

  if (payload.nodeRefs) {
    checkNoAutoCreated(
      payload.nodeRefs.map(n => n.entityId),
      'nodeRefs',
      errors,
    );
  }

  if (!payload.metadata?.sessionTimestamp || payload.metadata.sessionTimestamp.trim() === '') {
    errors.push({
      field: 'metadata.sessionTimestamp',
      message: 'sessionTimestamp is required',
      code: 'METADATA_MISSING',
    });
  }

  return errors.length > 0 ? { valid: false, errors, warnings } : { valid: true, errors: [], warnings };
}

export function validateA03ToA04(payload: A03ToA04Payload): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: TransferWarning[] = [];

  if (!payload.proposalRefs || payload.proposalRefs.length === 0) {
    errors.push({
      field: 'proposalRefs',
      message: 'proposalRefs must be non-empty',
      code: 'REFERENCE_MISSING',
    });
  }

  if (payload.proposalRefs && payload.allowedStates) {
    const allowed = new Set(payload.allowedStates);
    for (const ref of payload.proposalRefs) {
      if (!allowed.has(ref.status)) {
        errors.push({
          field: 'proposalRefs',
          message: `Status "${ref.status}" is not in allowed states [${payload.allowedStates.join(', ')}]`,
          code: 'STATUS_VIOLATION',
        });
      }
      if (ref.status !== 'approved') {
        warnings.push({
          code: 'NON_APPROVED_FLAGGED',
          message: `Proposal "${ref.entityId}" has non-approved status: "${ref.status}"`,
          field: 'proposalRefs',
        });
      }
    }
  }

  if (!payload.metadata?.sessionTimestamp || payload.metadata.sessionTimestamp.trim() === '') {
    errors.push({
      field: 'metadata.sessionTimestamp',
      message: 'sessionTimestamp is required',
      code: 'METADATA_MISSING',
    });
  }

  return errors.length > 0 ? { valid: false, errors, warnings } : { valid: true, errors: [], warnings };
}

export function validateA04ToA07(payload: A04ToA07Payload): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: TransferWarning[] = [];

  if (!payload.designId || payload.designId.trim() === '') {
    errors.push({
      field: 'designId',
      message: 'designId must be non-empty',
      code: 'REFERENCE_MISSING',
    });
  }

  checkNoAutoCreated(
    [payload.designId, ...payload.curriculumRefs].filter((x): x is string => typeof x === 'string' && x.length > 0),
    'designId',
    errors,
  );

  if (!payload.metadata?.sessionTimestamp || payload.metadata.sessionTimestamp.trim() === '') {
    errors.push({
      field: 'metadata.sessionTimestamp',
      message: 'sessionTimestamp is required',
      code: 'METADATA_MISSING',
    });
  }

  return errors.length > 0 ? { valid: false, errors, warnings } : { valid: true, errors: [], warnings };
}

export interface AreaContractResult {
  readonly status: 'completed' | 'failed';
  readonly created: readonly string[];
  readonly updated: readonly string[];
  readonly skipped: readonly string[];
  readonly transferId: TransferId;
  readonly structuralFootprint: StructuralFootprint;
  readonly event: import('./types').TransferEvent;
}

export function executeA02ToA04(
  payload: A02ToA04Payload,
  log: TransferEventLog,
): AreaContractResult {
  const transferId = createTransferId(`a02-a04-${Date.now()}`);

  const preValidation = validateA02ToA04(payload);
  if (!preValidation.valid) {
    const fp = computeStructuralFootprint(payload as unknown as Record<string, unknown>);
    const event = createTransferEvent({
      transferId: transferId as string,
      kind: 'A02-A04' as string,
      fromArea: 'A02',
      toArea: 'A04',
      status: 'failed',
      entityRefs: payload.nodeRefs.map(n => n.entityId),
      structuralFootprint: fp,
      errorCode: preValidation.errors[0]?.code,
    });
    log.append(event);
    return {
      status: 'failed',
      created: [],
      updated: [],
      skipped: [],
      transferId,
      structuralFootprint: fp,
      event,
    };
  }

  const created = payload.nodeRefs.map(n => `curriculum-${n.entityId}`);
  const fp = computeStructuralFootprint(payload as unknown as Record<string, unknown>);
  const event = createTransferEvent({
    transferId: transferId as string,
    kind: 'A02-A04' as string,
    fromArea: 'A02',
    toArea: 'A04',
    status: 'completed',
    entityRefs: created,
    structuralFootprint: fp,
  });
  log.append(event);

  return {
    status: 'completed',
    created,
    updated: [],
    skipped: [],
    transferId,
    structuralFootprint: fp,
    event,
  };
}

export function executeA03ToA04(
  payload: A03ToA04Payload,
  log: TransferEventLog,
): AreaContractResult {
  const transferId = createTransferId(`a03-a04-${Date.now()}`);

  const preValidation = validateA03ToA04(payload);
  if (!preValidation.valid) {
    const fp = computeStructuralFootprint(payload as unknown as Record<string, unknown>);
    const event = createTransferEvent({
      transferId: transferId as string,
      kind: 'A03-A04' as string,
      fromArea: 'A03',
      toArea: 'A04',
      status: 'failed',
      entityRefs: payload.proposalRefs.map(p => p.entityId),
      structuralFootprint: fp,
      errorCode: preValidation.errors[0]?.code,
    });
    log.append(event);
    return {
      status: 'failed',
      created: [],
      updated: [],
      skipped: [],
      transferId,
      structuralFootprint: fp,
      event,
    };
  }

  const created = payload.proposalRefs.map(p => `curriculum-${p.entityId}`);
  const fp = computeStructuralFootprint(payload as unknown as Record<string, unknown>);
  const event = createTransferEvent({
    transferId: transferId as string,
    kind: 'A03-A04' as string,
    fromArea: 'A03',
    toArea: 'A04',
    status: 'completed',
    entityRefs: created,
    structuralFootprint: fp,
  });
  log.append(event);

  return {
    status: 'completed',
    created,
    updated: [],
    skipped: [],
    transferId,
    structuralFootprint: fp,
    event,
  };
}

export function executeA04ToA07(
  payload: A04ToA07Payload,
  log: TransferEventLog,
): AreaContractResult {
  const transferId = createTransferId(`a04-a07-${Date.now()}`);

  const preValidation = validateA04ToA07(payload);
  if (!preValidation.valid) {
    const fp = computeStructuralFootprint(payload as unknown as Record<string, unknown>);
    const event = createTransferEvent({
      transferId: transferId as string,
      kind: 'A04-A07' as string,
      fromArea: 'A04',
      toArea: 'A07',
      status: 'failed',
      entityRefs: [payload.designId],
      structuralFootprint: fp,
      errorCode: preValidation.errors[0]?.code,
    });
    log.append(event);
    return {
      status: 'failed',
      created: [],
      updated: [],
      skipped: [],
      transferId,
      structuralFootprint: fp,
      event,
    };
  }

  const created = [`teaching-plan-${payload.designId}`];
  const fp = computeStructuralFootprint(payload as unknown as Record<string, unknown>);
  const event = createTransferEvent({
    transferId: transferId as string,
    kind: 'A04-A07' as string,
    fromArea: 'A04',
    toArea: 'A07',
    status: 'completed',
    entityRefs: created,
    structuralFootprint: fp,
  });
  log.append(event);

  return {
    status: 'completed',
    created,
    updated: [],
    skipped: [],
    transferId,
    structuralFootprint: fp,
    event,
  };
}
