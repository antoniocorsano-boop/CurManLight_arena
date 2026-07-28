import type { TransferArea } from './vocabularies';

export type TransferContractId = string & { readonly __brand: 'TransferContractId' };
export type TransferContractVersion = number & { readonly __brand: 'TransferContractVersion' };
export type TransferId = string & { readonly __brand: 'TransferId' };
export type TransferKind = string & { readonly __brand: 'TransferKind' };

export function createContractId(id: string): TransferContractId {
  return id as TransferContractId;
}

export function createContractVersion(v: number): TransferContractVersion {
  return v as TransferContractVersion;
}

export function createTransferId(id: string): TransferId {
  return id as TransferId;
}

export function createTransferKind(kind: string): TransferKind {
  return kind as TransferKind;
}

export type TransferStatus =
  | 'pending'
  | 'validating'
  | 'executing'
  | 'completed'
  | 'partial'
  | 'failed'
  | 'rolled-back';

export interface StructuralFootprint {
  readonly algorithm: 'fnv1a';
  readonly version: 1;
  readonly hash: string;
  readonly computedAt: string;
}

export interface TransferSourceRef {
  readonly entityId: string;
  readonly entityType: string;
  readonly snapshotLabel?: string;
}

export interface TransferTargetRef {
  readonly entityId: string;
  readonly entityType: string;
}

export interface TransferMetadata {
  readonly sessionTimestamp: string;
  readonly initiatedBy?: string;
}

export interface TransferPayload {
  readonly transferId: TransferId;
  readonly contractId: TransferContractId;
  readonly contractVersion: TransferContractVersion;
  readonly fromArea: TransferArea;
  readonly toArea: TransferArea;
  readonly sourceRefs: readonly TransferSourceRef[];
  readonly targetRef: TransferTargetRef;
  readonly config: Record<string, unknown>;
  readonly metadata: TransferMetadata;
}

export interface TransferContext {
  readonly initiatedBy?: string;
  readonly sessionTimestamp: string;
  readonly contractVersion: TransferContractVersion;
}

export interface TransferResultCompleted {
  readonly status: 'completed';
  readonly created: readonly string[];
  readonly updated: readonly string[];
  readonly skipped: readonly string[];
}

export interface TransferResultPartial {
  readonly status: 'partial';
  readonly created: readonly string[];
  readonly updated: readonly string[];
  readonly skipped: readonly string[];
  readonly errors: readonly TransferErrorRef[];
}

export interface TransferResultFailed {
  readonly status: 'failed';
  readonly errors: readonly TransferErrorRef[];
}

export type TransferResult = TransferResultCompleted | TransferResultPartial | TransferResultFailed;

export interface TransferErrorRef {
  readonly errorType: string;
  readonly code: string;
  readonly message: string;
  readonly recoverable: boolean;
}

export interface TransferWarning {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
}

export function createTransferWarning(code: string, message: string, field?: string): TransferWarning {
  const w: TransferWarning = { code, message };
  if (field !== undefined) {
    return { ...w, field };
  }
  return w;
}

export interface TransferEvent {
  readonly id: string;
  readonly transferId: TransferId;
  readonly kind: TransferKind;
  readonly contractVersion: TransferContractVersion;
  readonly timestamp: string;
  readonly fromArea: TransferArea;
  readonly toArea: TransferArea;
  readonly entityRefs: readonly string[];
  readonly status: TransferStatus;
  readonly errorCode?: string;
  readonly structuralFootprint: StructuralFootprint;
  readonly author?: string;
  readonly persistent: false;
}

export interface CreateTransferEventInput {
  readonly transferId: string;
  readonly kind: string;
  readonly fromArea: TransferArea;
  readonly toArea: TransferArea;
  readonly status: TransferStatus;
  readonly entityRefs: readonly string[];
  readonly structuralFootprint: StructuralFootprint;
  readonly errorCode?: string;
  readonly author?: string;
}

let eventCounter = 0;

export function createTransferEvent(input: CreateTransferEventInput): TransferEvent {
  eventCounter++;
  return {
    id: `evt-${eventCounter}-${Date.now()}`,
    transferId: createTransferId(input.transferId),
    kind: createTransferKind(input.kind),
    contractVersion: createContractVersion(1),
    timestamp: new Date().toISOString(),
    fromArea: input.fromArea,
    toArea: input.toArea,
    entityRefs: input.entityRefs,
    status: input.status,
    errorCode: input.errorCode,
    structuralFootprint: input.structuralFootprint,
    author: input.author,
    persistent: false,
  };
}

export function createCompletedResult(data: {
  created: string[];
  updated: string[];
  skipped: string[];
}): TransferResultCompleted {
  return { status: 'completed', created: data.created, updated: data.updated, skipped: data.skipped };
}

export function createPartialResult(data: {
  created: string[];
  updated: string[];
  skipped: string[];
  errors: TransferErrorRef[];
}): TransferResultPartial {
  return { status: 'partial', created: data.created, updated: data.updated, skipped: data.skipped, errors: data.errors };
}

export function createFailedResult(data: {
  errors: TransferErrorRef[];
}): TransferResultFailed {
  return { status: 'failed', errors: data.errors };
}
