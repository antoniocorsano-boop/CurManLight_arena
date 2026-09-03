import type { CurriculumPersistenceBackend } from './backend';
import { CurriculumPersistenceError } from './errors';
import type { CurriculumMigrationBackup } from './records';
import { LEGACY_SCHEMA_VERSION } from './schema';

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, normalize(child)]),
    );
  }
  return value;
}

export function canonicalPayloadText(payload: unknown): string {
  return JSON.stringify(normalize(payload));
}

export function checksumPayload(payload: unknown): string {
  const text = canonicalPayloadText(payload);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export async function createMigrationBackup(
  backend: CurriculumPersistenceBackend,
  migrationId: string,
  payload: unknown,
  recordCounts: Record<string, number>,
  now: string,
): Promise<CurriculumMigrationBackup> {
  const checksum = checksumPayload(payload);
  const existing = await backend.getBackup(migrationId);
  if (existing) {
    assertValidBackup(existing);
    if (existing.checksum !== checksum) {
      throw new CurriculumPersistenceError(
        'BACKUP_ALREADY_EXISTS',
        `Backup for migration '${migrationId}' already contains a different source snapshot`,
      );
    }
    return existing;
  }
  const backup: CurriculumMigrationBackup = {
    id: `backup-${migrationId}`,
    migrationId,
    createdAt: now,
    schemaVersion: LEGACY_SCHEMA_VERSION,
    payload: structuredClone(payload),
    recordCounts,
    checksum,
  };
  try {
    await backend.putBackup(backup);
  } catch (error) {
    throw new CurriculumPersistenceError(
      'BACKUP_FAILED',
      `Backup for migration '${migrationId}' could not be persisted`,
      [error instanceof Error ? error.message : String(error)],
    );
  }
  return backup;
}

export function assertValidBackup(backup: CurriculumMigrationBackup): void {
  if (!backup.checksum || checksumPayload(backup.payload) !== backup.checksum) {
    throw new CurriculumPersistenceError('BACKUP_INVALID', `Backup '${backup.id}' checksum is invalid`);
  }
}
