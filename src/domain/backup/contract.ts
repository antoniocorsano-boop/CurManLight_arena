/**
 * CML-DRIVE-01 — provider-neutral backup/restore contract.
 *
 * A backup receipt is evidence that an outbound snapshot was written somewhere.
 * It never changes source authority, verification, validity or canonical state.
 */

export const CML_BACKUP_SCHEMA = 'CML_BACKUP_V1' as const;

export type BackupProvider = 'google-drive' | 'filesystem' | 'other';

export interface CmlBackupObjectCounts {
  sources: number;
  sourceVersions: number;
  curriculumVersions: number;
  revisions: number;
  workspaces: number;
  documents: number;
}

export interface CmlBackupManifest {
  schema: typeof CML_BACKUP_SCHEMA;
  backupId: string;
  product: 'CurManLight Arena';
  createdAt: string;
  /** SHA-256 hex digest of the canonical snapshot payload. */
  contentHash: string;
  sourceRegistrySchemaVersion: number;
  objectCounts: CmlBackupObjectCounts;
}

export interface BackupReceipt {
  backupId: string;
  provider: BackupProvider;
  /** Provider-owned reference. It is not a CurManLight canonical identifier. */
  remoteObjectId?: string;
  contentHash: string;
  exportedAt: string;
  direction: 'outbound-backup';
  authorityEffect: 'none';
}

export interface CreateBackupReceiptInput {
  manifest: CmlBackupManifest;
  provider: BackupProvider;
  remoteObjectId?: string;
  exportedAt: string;
}

export interface RestoreRequest {
  manifest: CmlBackupManifest;
  /** Hash independently recomputed from the candidate payload. */
  recomputedContentHash: string;
  /** Restore must be an explicit human action. */
  humanConfirmed: boolean;
}

export interface RestoreValidationResult {
  valid: boolean;
  errors: readonly string[];
}

const SHA256_HEX = /^[0-9a-f]{64}$/;

export function createBackupReceipt(input: CreateBackupReceiptInput): BackupReceipt {
  if (input.manifest.schema !== CML_BACKUP_SCHEMA) {
    throw new Error('BACKUP_SCHEMA_UNSUPPORTED');
  }
  if (!SHA256_HEX.test(input.manifest.contentHash)) {
    throw new Error('BACKUP_CONTENT_HASH_INVALID');
  }
  if (!input.exportedAt.trim()) {
    throw new Error('BACKUP_EXPORTED_AT_REQUIRED');
  }

  return {
    backupId: input.manifest.backupId,
    provider: input.provider,
    remoteObjectId: input.remoteObjectId,
    contentHash: input.manifest.contentHash,
    exportedAt: input.exportedAt,
    direction: 'outbound-backup',
    authorityEffect: 'none',
  };
}

export function validateRestoreRequest(request: RestoreRequest): RestoreValidationResult {
  const errors: string[] = [];

  if (request.manifest.schema !== CML_BACKUP_SCHEMA) {
    errors.push('BACKUP_SCHEMA_UNSUPPORTED');
  }
  if (!SHA256_HEX.test(request.manifest.contentHash)) {
    errors.push('BACKUP_CONTENT_HASH_INVALID');
  }
  if (!SHA256_HEX.test(request.recomputedContentHash)) {
    errors.push('RESTORE_RECOMPUTED_HASH_INVALID');
  }
  if (request.manifest.contentHash !== request.recomputedContentHash) {
    errors.push('RESTORE_CONTENT_HASH_MISMATCH');
  }
  if (!request.humanConfirmed) {
    errors.push('RESTORE_REQUIRES_HUMAN_CONFIRMATION');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Deliberately one-way. There is no inbound sync API in the backup contract.
 */
export interface BackupSink {
  writeSnapshot(manifest: CmlBackupManifest, payload: Uint8Array): Promise<BackupReceipt>;
}
