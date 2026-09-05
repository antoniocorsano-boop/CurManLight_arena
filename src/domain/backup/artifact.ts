import {
  CML_BACKUP_SCHEMA,
  type CmlBackupManifest,
  type CmlBackupObjectCounts,
} from './contract';

export interface CreateCmlBackupArtifactInput {
  backupId: string;
  createdAt: string;
  sourceRegistrySchemaVersion: number;
  objectCounts: CmlBackupObjectCounts;
  /** Canonical provider-neutral snapshot bytes. */
  payload: Uint8Array;
}

export interface CmlBackupArtifact {
  manifest: CmlBackupManifest;
  payload: Uint8Array;
}

export async function calculateCmlBackupContentHash(payload: Uint8Array): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error('BACKUP_CRYPTO_UNAVAILABLE');
  const ownedBytes = payload.slice();
  const digest = await globalThis.crypto.subtle.digest('SHA-256', ownedBytes.buffer);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Creates the provider-neutral manifest for exact snapshot bytes.
 * Provider/location is intentionally absent from the artifact.
 */
export async function createCmlBackupArtifact(input: CreateCmlBackupArtifactInput): Promise<CmlBackupArtifact> {
  if (!input.backupId.trim()) throw new Error('BACKUP_ID_REQUIRED');
  if (!input.createdAt.trim()) throw new Error('BACKUP_CREATED_AT_REQUIRED');
  if (!Number.isInteger(input.sourceRegistrySchemaVersion) || input.sourceRegistrySchemaVersion < 1) {
    throw new Error('BACKUP_SOURCE_REGISTRY_SCHEMA_INVALID');
  }

  const payload = input.payload.slice();
  const contentHash = await calculateCmlBackupContentHash(payload);
  return {
    manifest: {
      schema: CML_BACKUP_SCHEMA,
      backupId: input.backupId,
      product: 'CurManLight Arena',
      createdAt: input.createdAt,
      contentHash,
      sourceRegistrySchemaVersion: input.sourceRegistrySchemaVersion,
      objectCounts: { ...input.objectCounts },
    },
    payload,
  };
}
