import { describe, expect, it } from 'vitest';
import {
  CURRICULUM_DATABASE_NAME,
  CURRICULUM_PERSISTENCE_MODE,
  CURRICULUM_SCHEMA_VERSION,
  CURRICULUM_STORES,
  LEGACY_STORES,
  createCurriculumDatabase,
} from '../../domain/curriculum/persistence';

describe('CML-630E2 schema and compatibility boundary', () => {
  it('preserves database identity and upgrades explicitly to version 2', () => {
    expect(CURRICULUM_DATABASE_NAME).toBe('CurManLightDB_Evoluto_v1.3');
    expect(CURRICULUM_SCHEMA_VERSION).toBe(2);
  });

  it('preserves the legacy state store unchanged', () => {
    expect(CURRICULUM_STORES.state).toBe(LEGACY_STORES.state);
  });

  it.each([
    'instituteCurriculumVersions',
    'curriculumSegments',
    'curriculumNodes',
    'verticalCurriculumLinks',
    'curriculumMigrationMetadata',
    'curriculumMigrationBackups',
  ] as const)('defines the %s store and indexes', store => {
    expect(CURRICULUM_STORES[store]).toContain('id');
    expect(CURRICULUM_STORES[store].split(',').length).toBeGreaterThan(2);
  });

  it('defaults to legacy-only and does not enable dual-write', () => {
    expect(CURRICULUM_PERSISTENCE_MODE).toBe('legacy-only');
  });

  it('declares all v2 stores without opening or migrating automatically', () => {
    const database = createCurriculumDatabase('cml-630e2-schema-declaration-test');
    expect(database.verno).toBe(2);
    expect(database.tables.map(table => table.name).sort()).toEqual(
      Object.keys(CURRICULUM_STORES).sort(),
    );
    expect(database.table('curriculumNodes').schema.indexes.map(index => index.name))
      .toEqual(expect.arrayContaining(['versionId', 'segmentId', 'type', 'workStatus']));
    database.close();
  });
});
