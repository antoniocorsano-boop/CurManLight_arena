// @vitest-environment node

import { chromium } from 'playwright';
import { createServer } from 'vite';
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

  it('upgrades an isolated real IndexedDB from v1 to v2 preserving state', async () => {
    const server = await createServer({
      configFile: false,
      root: new URL('../../../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
      logLevel: 'silent',
      server: { port: 0 },
    });
    await server.listen();
    const origin = server.resolvedUrls?.local[0];
    if (!origin) throw new Error('Vite test origin unavailable');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const databaseName = `cml-630e2-upgrade-${Date.now()}`;
    const emptyDatabaseName = `${databaseName}-empty`;

    try {
      await page.goto(`${origin}src/domain/curriculum/persistence/backend.ts`);
      const result = await page.evaluate(async ({ databaseName, emptyDatabaseName }) => {
        const openLegacy = indexedDB.open(databaseName, 1);
        await new Promise<void>((resolve, reject) => {
          openLegacy.onupgradeneeded = () => {
            const state = openLegacy.result.createObjectStore('state', { keyPath: 'key' });
            state.createIndex('value', 'value');
          };
          openLegacy.onerror = () => reject(openLegacy.error);
          openLegacy.onsuccess = () => {
            const database = openLegacy.result;
            const transaction = database.transaction('state', 'readwrite');
            transaction.objectStore('state').put({ key: 'legacy-key', value: 'legacy-value' });
            transaction.oncomplete = () => {
              database.close();
              resolve();
            };
            transaction.onerror = () => reject(transaction.error);
          };
        });

        const loadModule = new Function(
          'return import("/src/domain/curriculum/persistence/backend.ts")',
        ) as () => Promise<typeof import('../../domain/curriculum/persistence/backend')>;
        const module = await loadModule();
        const upgraded = module.createCurriculumDatabase(databaseName);
        await upgraded.open();
        const preserved = await upgraded.table('state').get('legacy-key');
        const stateIndexes = upgraded.table('state').schema.indexes.map(index => index.name);
        const upgradedStores = upgraded.tables.map(table => table.name).sort();
        const firstVersion = upgraded.verno;
        upgraded.close();

        const reopened = module.createCurriculumDatabase(databaseName);
        await reopened.open();
        const reopenedVersion = reopened.verno;
        const reopenedValue = await reopened.table('state').get('legacy-key');
        reopened.close();

        const empty = module.createCurriculumDatabase(emptyDatabaseName);
        await empty.open();
        const emptyStores = empty.tables.map(table => table.name).sort();
        const emptyVersion = empty.verno;
        empty.close();

        indexedDB.deleteDatabase(databaseName);
        indexedDB.deleteDatabase(emptyDatabaseName);
        return {
          preserved,
          stateIndexes,
          upgradedStores,
          firstVersion,
          reopenedVersion,
          reopenedValue,
          emptyStores,
          emptyVersion,
        };
      }, { databaseName, emptyDatabaseName });

      expect(result.preserved).toEqual({ key: 'legacy-key', value: 'legacy-value' });
      expect(result.reopenedValue).toEqual(result.preserved);
      expect(result.stateIndexes).toEqual(['value']);
      expect(result.firstVersion).toBe(2);
      expect(result.reopenedVersion).toBe(2);
      expect(result.emptyVersion).toBe(2);
      expect(result.upgradedStores).toEqual(Object.keys(CURRICULUM_STORES).sort());
      expect(result.emptyStores).toEqual(result.upgradedStores);
    } finally {
      await browser.close();
      await server.close();
    }
  }, 30_000);
});
