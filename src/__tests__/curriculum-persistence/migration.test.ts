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
  type CurriculumMigrationMetadata,
  type PersistedCurriculumNode,
  type PersistedCurriculumSegment,
  type PersistedInstituteCurriculumVersion,
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

  it('maps a single class and a class interval without inventing scope', () => {
    const single = adaptLegacyCurriculum({
      italiano: { primaria: { ...legacy.italiano.primaria, classLabel: '3' } },
    }, NOW);
    const range = adaptLegacyCurriculum({
      italiano: { primaria: { ...legacy.italiano.primaria, classRange: ['1', '2', '3'] } },
    }, NOW);
    expect(single.value?.segments[0].scope).toEqual({ type: 'grade', grade: '3' });
    expect(range.value?.segments[0].scope)
      .toEqual({ type: 'grade-range', grades: ['1', '2', '3'] });
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

  it('creates the backup before transformation and records a typed failed state', async () => {
    const backend = new MemoryCurriculumPersistenceBackend();
    await expect(migrateLegacyCurriculum(
      backend,
      legacy,
      NOW,
      () => { throw new Error('simulated transformation failure'); },
    )).rejects.toMatchObject({ code: 'MIGRATION_FAILED' });
    expect(await backend.getBackup(LEGACY_CURRICULUM_MIGRATION_ID)).toBeDefined();
    expect((await backend.getMigration(LEGACY_CURRICULUM_MIGRATION_ID))?.status).toBe('failed');
    expect(await backend.listVersions()).toEqual([]);
  });

  it('reports backup write failures as typed errors and leaves no migration records', async () => {
    class FailingBackupBackend extends MemoryCurriculumPersistenceBackend {
      override async putBackup(): Promise<void> {
        throw new Error('simulated backup failure');
      }
    }
    const backend = new FailingBackupBackend();
    await expect(migrateLegacyCurriculum(backend, legacy, NOW))
      .rejects.toMatchObject({ code: 'BACKUP_FAILED' });
    expect(await backend.getMigration(LEGACY_CURRICULUM_MIGRATION_ID)).toBeUndefined();
    expect(await backend.listVersions()).toEqual([]);
  });

  it.each(['version', 'segment', 'node', 'completion'] as const)(
    'aborts atomically when %s persistence fails',
    async failurePoint => {
      class PhaseFailureBackend extends MemoryCurriculumPersistenceBackend {
        override async putVersion(value: PersistedInstituteCurriculumVersion): Promise<void> {
          if (failurePoint === 'version') throw new Error('version failure');
          await super.putVersion(value);
        }
        override async putSegment(value: PersistedCurriculumSegment): Promise<void> {
          if (failurePoint === 'segment') throw new Error('segment failure');
          await super.putSegment(value);
        }
        override async putNode(value: PersistedCurriculumNode): Promise<void> {
          if (failurePoint === 'node') throw new Error('node failure');
          await super.putNode(value);
        }
        override async putMigration(value: CurriculumMigrationMetadata): Promise<void> {
          if (failurePoint === 'completion' && value.status === 'completed') {
            throw new Error('completion failure');
          }
          await super.putMigration(value);
        }
      }
      const backend = new PhaseFailureBackend();
      await expect(migrateLegacyCurriculum(backend, legacy, NOW))
        .rejects.toMatchObject({ code: 'MIGRATION_FAILED' });
      expect(await backend.listVersions()).toEqual([]);
      expect(await backend.listSegments()).toEqual([]);
      expect(await backend.listNodes()).toEqual([]);
      expect((await backend.getMigration(LEGACY_CURRICULUM_MIGRATION_ID))?.status)
        .toBe('failed');
    },
  );

  it('backs up the source and records failed when transformed data is invalid', async () => {
    const backend = new MemoryCurriculumPersistenceBackend();
    await expect(migrateLegacyCurriculum(backend, legacy, NOW, (source, now) => {
      const result = adaptLegacyCurriculum(source, now);
      if (!result.value) return result;
      return {
        ...result,
        value: {
          ...result.value,
          version: { ...result.value.version, title: '' },
        },
      };
    })).rejects.toMatchObject({ code: 'MIGRATION_FAILED' });
    expect(await backend.getBackup(LEGACY_CURRICULUM_MIGRATION_ID)).toBeDefined();
    expect(await backend.listVersions()).toEqual([]);
    expect((await backend.getMigration(LEGACY_CURRICULUM_MIGRATION_ID))?.status)
      .toBe('failed');
  });

  it('does not silently overwrite a valid backup with a different source', async () => {
    const backend = new MemoryCurriculumPersistenceBackend();
    await migrateLegacyCurriculum(backend, legacy, NOW);
    await rollbackLegacyCurriculumMigration(backend, NOW);
    const original = await backend.getBackup(LEGACY_CURRICULUM_MIGRATION_ID);

    await expect(migrateLegacyCurriculum(
      backend,
      { arte: legacy.italiano },
      '2026-07-26T10:00:00.000Z',
    )).rejects.toMatchObject({ code: 'BACKUP_ALREADY_EXISTS' });
    expect(await backend.getBackup(LEGACY_CURRICULUM_MIGRATION_ID)).toEqual(original);
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

  it('computes a stable local-integrity checksum independent of object key order', () => {
    expect(checksumPayload({ a: 1, b: { c: 2 } }))
      .toBe(checksumPayload({ b: { c: 2 }, a: 1 }));
    expect(checksumPayload({ a: 1 })).not.toBe(checksumPayload({ a: 2 }));
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

  it('aborts a partial rollback and preserves every migrated record', async () => {
    class FailingRollbackBackend extends MemoryCurriculumPersistenceBackend {
      override async deleteNode(): Promise<void> {
        throw new Error('simulated rollback failure');
      }
    }
    const backend = new FailingRollbackBackend();
    await migrateLegacyCurriculum(backend, legacy, NOW);
    const before = {
      versions: await backend.listVersions(),
      segments: await backend.listSegments(),
      nodes: await backend.listNodes(),
    };
    await expect(rollbackLegacyCurriculumMigration(backend, NOW))
      .rejects.toMatchObject({ code: 'ROLLBACK_FAILED' });
    expect(await backend.listVersions()).toEqual(before.versions);
    expect(await backend.listSegments()).toEqual(before.segments);
    expect(await backend.listNodes()).toEqual(before.nodes);
    expect((await backend.getMigration(LEGACY_CURRICULUM_MIGRATION_ID))?.status)
      .toBe('completed');
  });

  it('rejects rollback when metadata exists but the backup is missing', async () => {
    const backend = new MemoryCurriculumPersistenceBackend();
    await backend.putMigration({
      id: 'metadata',
      migrationId: LEGACY_CURRICULUM_MIGRATION_ID,
      sourceSchemaVersion: 1,
      targetSchemaVersion: 2,
      startedAt: NOW,
      completedAt: NOW,
      status: 'completed',
      sourceRecordCount: 1,
      migratedRecordCount: 1,
      skippedRecordCount: 0,
      issueCount: 0,
    });
    await expect(rollbackLegacyCurriculumMigration(backend, NOW))
      .rejects.toMatchObject({ code: 'ROLLBACK_FAILED' });
  });

  it('fails rollback with a typed error when no migration exists', async () => {
    await expect(rollbackLegacyCurriculumMigration(
      new MemoryCurriculumPersistenceBackend(),
      NOW,
    )).rejects.toMatchObject({ code: 'ROLLBACK_FAILED' });
  });
});
