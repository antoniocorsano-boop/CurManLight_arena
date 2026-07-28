import type { TransferResult, TransferWarning } from './types';
import { createCompletedResult, createFailedResult } from './types';
import { createTransferError } from './errors';
import { computeStructuralFootprint } from './signatures';
import { createTransferEventLog } from './eventLog';

const log = createTransferEventLog();

export interface A11ToA02Payload {
  readonly sourceNodes: ReadonlyArray<{ entityId: string; entityType: string; snapshotLabel?: string }>;
  readonly targetVersionId: string;
  readonly mergeStrategy: 'create-new' | 'update-existing' | 'skip-duplicates';
  readonly targetDiscipline: string;
  readonly targetArea: string;
  readonly metadata: { sessionTimestamp: string };
}

export interface A02ToA03Payload {
  readonly nodeRef: { entityId: string; entityType: string };
  readonly currentTextSnapshot: string;
  readonly curriculumVersionRef: string;
  readonly sources: readonly string[];
  readonly evidences: readonly string[];
  readonly context: Record<string, unknown>;
  readonly origin: string;
  readonly status: string;
  readonly metadata: { sessionTimestamp: string };
}

function toTransferPayload(payload: { metadata: { sessionTimestamp: string }; sourceRefs?: unknown[] }, from: string, to: string) {
  return {
    transferId: `t-${Date.now()}` as any,
    contractId: `${from}-${to}` as any,
    contractVersion: 1 as any,
    fromArea: from,
    toArea: to,
    sourceRefs: (payload.sourceRefs ?? []) as any[],
    targetRef: { entityId: 'target', entityType: 'version' },
    config: {},
    metadata: payload.metadata,
  };
}

export function validateA11ToA02(payload: A11ToA02Payload): { valid: boolean; errors: any[]; warnings: TransferWarning[] } {
  const warnings: TransferWarning[] = [];
  const errors: any[] = [];

  if (!payload.sourceNodes || payload.sourceNodes.length === 0) {
    errors.push(createTransferError('SOURCE_MISSING'));
  }
  if (!payload.targetVersionId) {
    errors.push(createTransferError('REFERENCE_MISSING', { details: { field: 'targetVersionId' } }));
  }
  if (!['create-new', 'update-existing', 'skip-duplicates'].includes(payload.mergeStrategy)) {
    errors.push(createTransferError('PAYLOAD_INVALID', { details: { field: 'mergeStrategy' } }));
  }
  if (!payload.targetDiscipline) {
    errors.push(createTransferError('METADATA_MISSING', { details: { field: 'targetDiscipline' } }));
  }
  if (!payload.targetArea) {
    errors.push(createTransferError('METADATA_MISSING', { details: { field: 'targetArea' } }));
  }
  if (payload.sourceNodes && payload.sourceNodes.length === 1) {
    warnings.push({ code: 'SOURCE_SINGLE', message: 'Single source node transfer' });
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateA02ToA03(payload: A02ToA03Payload): { valid: boolean; errors: any[]; warnings: TransferWarning[] } {
  const warnings: TransferWarning[] = [];
  const errors: any[] = [];

  if (!payload.nodeRef || !payload.nodeRef.entityId) {
    errors.push(createTransferError('REFERENCE_MISSING', { details: { field: 'nodeRef.entityId' } }));
  }
  if (!payload.currentTextSnapshot) {
    errors.push(createTransferError('PAYLOAD_INVALID', { details: { field: 'currentTextSnapshot' } }));
  }
  if (!payload.curriculumVersionRef) {
    errors.push(createTransferError('REFERENCE_MISSING', { details: { field: 'curriculumVersionRef' } }));
  }
  const allowedStatuses = ['draft', 'under-review'];
  if (!allowedStatuses.includes(payload.status)) {
    errors.push(createTransferError('SOURCE_STATUS_INVALID', { details: { status: payload.status } }));
  }
  if (payload.status === 'approved') {
    errors.push(createTransferError('STATUS_VIOLATION', { details: { message: 'Cannot transfer approved status as proposal' } }));
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function executeA11ToA02(payload: A11ToA02Payload): TransferResult {
  const preValidation = validateA11ToA02(payload);
  if (!preValidation.valid) {
    return createFailedResult({ errors: preValidation.errors });
  }

  const created = payload.sourceNodes.map(n => `curriculum-node-${n.entityId}`);
  const result = createCompletedResult({ created, updated: [], skipped: [] });

  const transferPayload = toTransferPayload(payload, 'A11', 'A02');
  const footprint = computeStructuralFootprint(transferPayload as any);
  log.append({
    id: `evt-${Date.now()}`,
    transferId: transferPayload.transferId,
    kind: 'knowledge-to-curriculum' as any,
    contractVersion: transferPayload.contractVersion,
    timestamp: new Date().toISOString(),
    fromArea: 'A11',
    toArea: 'A02',
    entityRefs: created,
    status: 'completed',
    structuralFootprint: footprint,
    persistent: false,
  });

  return result;
}

export function executeA02ToA03(payload: A02ToA03Payload): TransferResult {
  const preValidation = validateA02ToA03(payload);
  if (!preValidation.valid) {
    return createFailedResult({ errors: preValidation.errors });
  }

  const created = [`proposal-${payload.nodeRef.entityId}`];
  const result = createCompletedResult({ created, updated: [], skipped: [] });

  const transferPayload = toTransferPayload({ ...payload, sourceRefs: [payload.nodeRef] }, 'A02', 'A03');
  const footprint = computeStructuralFootprint(transferPayload as any);
  log.append({
    id: `evt-${Date.now()}`,
    transferId: transferPayload.transferId,
    kind: 'curriculum-to-proposal' as any,
    contractVersion: transferPayload.contractVersion,
    timestamp: new Date().toISOString(),
    fromArea: 'A02',
    toArea: 'A03',
    entityRefs: created,
    status: 'completed',
    structuralFootprint: footprint,
    persistent: false,
  });

  return result;
}
