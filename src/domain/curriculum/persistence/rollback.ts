import type { CurriculumPersistenceBackend } from './backend';
import { assertValidBackup } from './backup';
import { CurriculumPersistenceError } from './errors';
import { LEGACY_CURRICULUM_MIGRATION_ID } from './migration';

export interface CurriculumRollbackResult {
  outcome: 'rolled-back' | 'already-rolled-back';
  removedRecordCount: number;
  migrationId: string;
}

export async function rollbackLegacyCurriculumMigration(
  backend: CurriculumPersistenceBackend,
  now = new Date().toISOString(),
): Promise<CurriculumRollbackResult> {
  const metadata = await backend.getMigration(LEGACY_CURRICULUM_MIGRATION_ID);
  if (!metadata) {
    throw new CurriculumPersistenceError('ROLLBACK_FAILED', 'Migration metadata was not found');
  }
  if (metadata.status === 'rolled-back') {
    return {
      outcome: 'already-rolled-back',
      removedRecordCount: 0,
      migrationId: LEGACY_CURRICULUM_MIGRATION_ID,
    };
  }
  const backup = await backend.getBackup(LEGACY_CURRICULUM_MIGRATION_ID);
  if (!backup) {
    throw new CurriculumPersistenceError('ROLLBACK_FAILED', 'Migration backup was not found');
  }
  assertValidBackup(backup);

  try {
    return await backend.transaction(async () => {
      let removedRecordCount = 0;
      for (const link of await backend.listLinks()) {
        if (link._migrationId === LEGACY_CURRICULUM_MIGRATION_ID) {
          await backend.deleteLink(link.id);
          removedRecordCount += 1;
        }
      }
      for (const node of await backend.listNodes()) {
        if (node._migrationId === LEGACY_CURRICULUM_MIGRATION_ID) {
          await backend.deleteNode(node.id);
          removedRecordCount += 1;
        }
      }
      for (const segment of await backend.listSegments()) {
        if (segment._migrationId === LEGACY_CURRICULUM_MIGRATION_ID) {
          await backend.deleteSegment(segment.id);
          removedRecordCount += 1;
        }
      }
      for (const version of await backend.listVersions()) {
        if (version._migrationId === LEGACY_CURRICULUM_MIGRATION_ID) {
          await backend.deleteVersion(version.id);
          removedRecordCount += 1;
        }
      }
      await backend.putMigration({
        ...metadata,
        status: 'rolled-back',
        completedAt: now,
        migratedRecordCount: 0,
      });
      return {
        outcome: 'rolled-back',
        removedRecordCount,
        migrationId: LEGACY_CURRICULUM_MIGRATION_ID,
      };
    });
  } catch (error) {
    if (error instanceof CurriculumPersistenceError) throw error;
    throw new CurriculumPersistenceError(
      'ROLLBACK_FAILED',
      'Rollback failed',
      [error instanceof Error ? error.message : String(error)],
    );
  }
}
