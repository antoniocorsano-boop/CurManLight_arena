import type { CurriculumPersistenceBackend } from './backend';
import { createMigrationBackup } from './backup';
import { CurriculumPersistenceError } from './errors';
import {
  adaptLegacyCurriculum,
  countLegacyLevels,
  type LegacyCurriculumSource,
} from './legacyAdapters';
import type { CurriculumMigrationMetadata } from './records';
import { createCurriculumRepositories } from './repositories';
import { CURRICULUM_SCHEMA_VERSION, LEGACY_SCHEMA_VERSION } from './schema';

export const LEGACY_CURRICULUM_MIGRATION_ID =
  'CML-630E2-LEGACY-CURRICULUM-MIGRATION-V1';

export type CurriculumMigrationOutcome =
  | 'completed'
  | 'completed-with-warning'
  | 'already-migrated'
  | 'no-data';

export interface CurriculumMigrationResult {
  outcome: CurriculumMigrationOutcome;
  metadata: CurriculumMigrationMetadata;
  issueCodes: string[];
}

const metadataId = `metadata-${LEGACY_CURRICULUM_MIGRATION_ID}`;

export async function migrateLegacyCurriculum(
  backend: CurriculumPersistenceBackend,
  source: LegacyCurriculumSource,
  now = new Date().toISOString(),
): Promise<CurriculumMigrationResult> {
  const existing = await backend.getMigration(LEGACY_CURRICULUM_MIGRATION_ID);
  if (existing?.status === 'completed') {
    return { outcome: 'already-migrated', metadata: existing, issueCodes: [] };
  }
  if (existing && existing.status !== 'failed' && existing.status !== 'rolled-back') {
    throw new CurriculumPersistenceError(
      'MIGRATION_INCOMPLETE',
      `Migration is in '${existing.status}' state; rollback is required`,
    );
  }

  const sourceRecordCount = countLegacyLevels(source);
  const adaptation = adaptLegacyCurriculum(source, now);
  const issueCodes = adaptation.issues.map(issue => issue.code);
  const running: CurriculumMigrationMetadata = {
    id: metadataId,
    migrationId: LEGACY_CURRICULUM_MIGRATION_ID,
    sourceSchemaVersion: LEGACY_SCHEMA_VERSION,
    targetSchemaVersion: CURRICULUM_SCHEMA_VERSION,
    startedAt: now,
    status: 'running',
    sourceRecordCount,
    migratedRecordCount: 0,
    skippedRecordCount: adaptation.value ? 0 : sourceRecordCount,
    issueCount: adaptation.issues.length,
  };
  const backup = await createMigrationBackup(
    backend,
    LEGACY_CURRICULUM_MIGRATION_ID,
    source,
    { curriculumLevels: sourceRecordCount },
    now,
  );
  running.checksum = backup.checksum;
  await backend.putMigration(running);

  if (!adaptation.value) {
    const completed: CurriculumMigrationMetadata = {
      ...running,
      status: 'completed',
      completedAt: now,
    };
    await backend.putMigration(completed);
    return { outcome: 'no-data', metadata: completed, issueCodes };
  }

  const adapted = adaptation.value;
  const repositories = createCurriculumRepositories(backend);
  const provenance = {
    _migrationId: LEGACY_CURRICULUM_MIGRATION_ID,
    _importedFromLegacy: true,
  } as const;
  try {
    const migratedRecordCount = await backend.transaction(async () => {
      await repositories.versions.save({ ...adapted.version, ...provenance });
      for (const segment of adapted.segments) {
        await repositories.segments.save({ ...segment, ...provenance });
      }
      for (const node of adapted.nodes) {
        await repositories.nodes.save({ ...node, ...provenance });
      }
      const count = 1 + adapted.segments.length + adapted.nodes.length;
      await backend.putMigration({
        ...running,
        status: 'completed',
        completedAt: now,
        migratedRecordCount: count,
      });
      return count;
    });
    const completed = await backend.getMigration(LEGACY_CURRICULUM_MIGRATION_ID);
    if (!completed) {
      throw new CurriculumPersistenceError('MIGRATION_FAILED', 'Migration metadata was not persisted');
    }
    return {
      outcome: adaptation.issues.length > 0 ? 'completed-with-warning' : 'completed',
      metadata: { ...completed, migratedRecordCount },
      issueCodes,
    };
  } catch (error) {
    const failed: CurriculumMigrationMetadata = {
      ...running,
      status: 'failed',
      completedAt: now,
      errorCode: error instanceof CurriculumPersistenceError ? error.code : 'TRANSACTION_FAILED',
    };
    await backend.putMigration(failed);
    throw new CurriculumPersistenceError(
      'MIGRATION_FAILED',
      'Legacy curriculum migration failed',
      [error instanceof Error ? error.message : String(error)],
    );
  }
}
