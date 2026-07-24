import { describe, expect, it } from 'vitest';
import {
  CurriculumPersistenceError,
  LEGACY_CURRICULUM_MIGRATION_ID,
  MemoryCurriculumPersistenceBackend,
  adaptLegacyCurriculum,
  assertValidBackup,
  checksumPayload,
  migrateLegacyCurriculum,
  rollbackLegacyCurriculumMigration,
  type PersistedCurriculumNode,
} from '../../domain/curriculum/persistence';
import { legacy, NOW, version } from './fixtures';

describe('CML-630E2 pure legacy adaptation', () => {
  it('maps discipline, order, segment content and nodes without mutation', () => {
    const snapshot = structuredClone(legacy);
    const result = adaptLegacyCurriculum(legacy, NOW);
    expect(result.value?.segments[0]).toMatchObject({
      subjectOrFieldId: 'italiano',
      schoolLevel: 'primaria',
      scope: { type: 'school-level' },
    });
    expect(result.value?.nodes.map(item => item.type))
      .toEqual(['milestone', 'objective', 'evidence', 'core-theme']);
    expect(legacy).toEqual(snapshot);
  });

  it('never invents pedagogical links or approval metadata', () => {
    const result = adaptLegacyCurriculum(legacy, NOW);
    expect(result.value?.links).toEqual([]);
    expect(result.value?.version).toMatchObject({
      title: 'Legacy imported baseline',
      status: 'draft',
    });
    expect(result.value?.version.approvedAt).toBeUndefined();
  });

  it('reports missing or empty legacy content structurally', () => {
    const empty = adaptLegacyCurriculum({}, NOW);
    expect(empty).toMatchObject({ disposition: 'skipped' });
    expect(empty.issues[0].code).toBe('LEGACY_NO_CURRICULUM_DATA');
    const partial = adaptLegacyCurriculum({ arte: { infanzia: {} } }, NOW);
    expect(partial.disposition).toBe('adapted-with-warning');
    expect(partial.issues[0].code).toBe('LEGACY_EMPTY_LEVEL');
  });

  it('is deterministic for different object insertion orders', () => {
    const left = adaptLegacyCurriculum({ arte: legacy.italiano, italiano: legacy.italiano }, NOW);
    const right = adaptLegacyCurriculum({ italiano: legacy.italiano, arte: legacy.italiano }, NOW);
    expect(left).toEqual(right);
  });
});

describe('CML-630E2 explicit migration, backup and rollback', () => {
  it('migrates once, records coherent counts and preserves the source', async () => {
    const backend = new MemoryCurriculumPersistenceBackend();
    const snapshot = structuredClone(legacy);
    const result = await migrateLegacyCurriculum(backend, legacy, NOW);
    expect(result.outcome).toBe('completed');
    expect(result.metadata).toMatchObject({
      status: 'completed',
      sourceRecordCount: 1,
      migratedRecordCount: 6,
    });
    expect(await backend.getBackup(LEGACY_CURRICULUM_MIGRATION_ID)).toBeDefined();
    expect(legacy).toEqual(snapshot);
    expect(await backend.listLinks()).toEqual([]);
  });

  it('returns already-migrated without duplicates on the second call', async () => {
    const backend = new MemoryCurriculumPersistenceBackend();
    await migrateLegacyCurriculum(backend, legacy, NOW);
    const before = await backend.listNodes();
    expect((await migrateLegacyCurriculum(backend, legacy, NOW)).outcome).toBe('already-migrated');
    expect(await backend.listNodes()).toEqual(before);
  });

  it('handles no legacy data without inventing records', async () => {
    const backend = new MemoryCurriculumPersistenceBackend();
    const result = await migrateLegacyCurriculum(backend, {}, NOW);
    expect(result.outcome).toBe('no-data');
    expect(await backend.listVersions()).toEqual([]);
  });

  it('detects an incomplete prior migration', async () => {
    const backend = new MemoryCurriculumPersistenceBackend();
    await backend.putMigration({
      id: 'metadata',
      migrationId: LEGACY_CURRICULUM_MIGRATION_ID,
      sourceSchemaVersion: 1,
      targetSchemaVersion: 2,
      startedAt: NOW,
      status: 'running',
      sourceRecordCount: 1,
      migratedRecordCount: 0,
      skippedRecordCount: 0,
      issueCount: 0,
    });
    await expect(migrateLegacyCurriculum(backend, legacy, NOW))
      .rejects.toMatchObject({ code: 'MIGRATION_INCOMPLETE' });
  });

  it('aborts partial records and marks metadata failed after a write failure', async () => {
    class FailingBackend extends MemoryCurriculumPersistenceBackend {
      override async putNode(_value: PersistedCurriculumNode): Promise<void> {
        throw new Error('simulated write failure');
      }
    }
    const backend = new FailingBackend();
    await expect(migrateLegacyCurriculum(backend, legacy, NOW))
      .rejects.toMatchObject({ code: 'MIGRATION_FAILED' });
    expect(await backend.listVersions()).toEqual([]);
    expect(await backend.listSegments()).toEqual([]);
    expect((await backend.getMigration(LEGACY_CURRICULUM_MIGRATION_ID))?.status).toBe('failed');
  });

  it('validates backup checksums', async () => {
    const backend = new MemoryCurriculumPersistenceBackend();
    await migrateLegacyCurriculum(backend, legacy, NOW);
    const backup = await backend.getBackup(LEGACY_CURRICULUM_MIGRATION_ID);
    expect(backup).toBeDefined();
    if (!backup) throw new Error('backup unavailable');
    expect(backup.checksum).toBe(checksumPayload(legacy));
    expect(() => assertValidBackup({ ...backup, checksum: 'invalid' }))
      .toThrowError(CurriculumPersistenceError);
  });

  it('rolls back only migrated records, preserves later records and is idempotent', async () => {
    const backend = new MemoryCurriculumPersistenceBackend();
    await migrateLegacyCurriculum(backend, legacy, NOW);
    await backend.putVersion(version({ id: 'manual-version' }));
    const first = await rollbackLegacyCurriculumMigration(backend, NOW);
    expect(first).toMatchObject({ outcome: 'rolled-back', removedRecordCount: 6 });
    expect((await backend.listVersions()).map(item => item.id)).toEqual(['manual-version']);
    expect((await rollbackLegacyCurriculumMigration(backend, NOW)).outcome)
      .toBe('already-rolled-back');
  });

  it('refuses rollback when the persisted backup checksum is corrupt', async () => {
    const backend = new MemoryCurriculumPersistenceBackend();
    await migrateLegacyCurriculum(backend, legacy, NOW);
    const backup = await backend.getBackup(LEGACY_CURRICULUM_MIGRATION_ID);
    if (!backup) throw new Error('backup unavailable');
    await backend.putBackup({ ...backup, checksum: 'corrupt' });
    await expect(rollbackLegacyCurriculumMigration(backend, NOW))
      .rejects.toMatchObject({ code: 'BACKUP_INVALID' });
    expect(await backend.listVersions()).toHaveLength(1);
  });

  it('fails rollback with a typed error when no migration exists', async () => {
    await expect(rollbackLegacyCurriculumMigration(
      new MemoryCurriculumPersistenceBackend(),
      NOW,
    )).rejects.toMatchObject({ code: 'ROLLBACK_FAILED' });
  });
});
