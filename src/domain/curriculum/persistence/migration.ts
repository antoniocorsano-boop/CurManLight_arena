import type { CurriculumPersistenceBackend } from './backend';
import { createMigrationBackup } from './backup';
import { CurriculumPersistenceError } from './errors';
import {
  adaptLegacyCurriculum,
  countLegacyLevels,
  type AdaptedLegacyCurriculum,
  type LegacyAdaptationResult,
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
type LegacyCurriculumAdapter = (
  source: LegacyCurriculumSource,
  now: string,
) => LegacyAdaptationResult<AdaptedLegacyCurriculum>;

export async function migrateLegacyCurriculum(
  backend: CurriculumPersistenceBackend,
  source: LegacyCurriculumSource,
  now = new Date().toISOString(),
  adapter: LegacyCurriculumAdapter = adaptLegacyCurriculum,
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
  const backup = await createMigrationBackup(
    backend,
    LEGACY_CURRICULUM_MIGRATION_ID,
    source,
    { curriculumLevels: sourceRecordCount },
    now,
  );
  const running: CurriculumMigrationMetadata = {
    id: metadataId,
    migrationId: LEGACY_CURRICULUM_MIGRATION_ID,
    sourceSchemaVersion: LEGACY_SCHEMA_VERSION,
    targetSchemaVersion: CURRICULUM_SCHEMA_VERSION,
    startedAt: now,
    status: 'running',
    sourceRecordCount,
    migratedRecordCount: 0,
    skippedRecordCount: 0,
    issueCount: 0,
    checksum: backup.checksum,
  };
  try {
    await backend.putMigration(running);
    const adaptation = adapter(source, now);
    const issueCodes = adaptation.issues.map(issue => issue.code);
    const migrationState: CurriculumMigrationMetadata = {
      ...running,
      skippedRecordCount: adaptation.value ? 0 : sourceRecordCount,
      issueCount: adaptation.issues.length,
    };

    if (!adaptation.value) {
      const completed: CurriculumMigrationMetadata = {
        ...migrationState,
        status: 'completed',
        completedAt: now,
      };
      await backend.transaction(() => backend.putMigration(completed));
      return { outcome: 'no-data', metadata: completed, issueCodes };
    }

    const adapted = adaptation.value;
    const repositories = createCurriculumRepositories(backend);
    const provenance = {
      _migrationId: LEGACY_CURRICULUM_MIGRATION_ID,
      _importedFromLegacy: true,
    } as const;
    const migratedRecordCount = await backend.transaction(async () => {
      await repositories.versions.save({ ...adapted.version, ...provenance });
      for (const segment of adapted.segments) {
        await repositories.segments.save({ ...segment, ...provenance });
      }
      for (const node of adapted.nodes) {
        await repositories.nodes.save({ ...node, ...provenance });
      }
      const expectedCount = 1 + adapted.segments.length + adapted.nodes.length;
      const actualCount = [
        ...(await backend.listVersions()),
        ...(await backend.listSegments()),
        ...(await backend.listNodes()),
      ].filter(record => record._migrationId === LEGACY_CURRICULUM_MIGRATION_ID).length;
      if (actualCount !== expectedCount) {
        throw new CurriculumPersistenceError(
          'MIGRATION_FAILED',
          `Migration count mismatch: expected ${expectedCount}, found ${actualCount}`,
        );
      }
      await backend.putMigration({
        ...migrationState,
        status: 'completed',
        completedAt: now,
        migratedRecordCount: actualCount,
      });
      return actualCount;
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
    try {
      await backend.putMigration(failed);
    } catch (metadataError) {
      throw new CurriculumPersistenceError(
        'MIGRATION_FAILED',
        'Legacy curriculum migration failed and failed state could not be persisted',
        [
          error instanceof Error ? error.message : String(error),
          metadataError instanceof Error ? metadataError.message : String(metadataError),
        ],
      );
    }
    throw new CurriculumPersistenceError(
      'MIGRATION_FAILED',
      'Legacy curriculum migration failed',
      [error instanceof Error ? error.message : String(error)],
    );
  }
}
