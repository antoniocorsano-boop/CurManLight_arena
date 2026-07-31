import type Dexie from 'dexie';
import { describe, expect, it } from 'vitest';
import {
  CURRICULUM_STORES,
  createCurriculumDatabase,
} from '../../domain/curriculum/persistence';

function awaitRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('IndexedDB request failed without a DOMException'));
  });
}

function awaitTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('IndexedDB transaction failed without a DOMException'));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('IndexedDB transaction aborted without a DOMException'));
  });
}

function deleteDatabase(name: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const request = globalThis.indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(request.error ?? new Error(`Failed to delete database ${name}`));
    request.onblocked = () =>
      reject(new Error(`Deletion of database ${name} was blocked by an open connection`));
  });
}

async function createLegacyDatabaseWithRecord(name: string): Promise<void> {
  const request = globalThis.indexedDB.open(name, 1);
  request.onupgradeneeded = () => {
    const database = request.result;
    const state = database.createObjectStore('state', { keyPath: 'key' });
    state.createIndex('value', 'value');
  };
  const database = await awaitRequest(request);
  const transaction = database.transaction('state', 'readwrite');
  transaction.objectStore('state').put({ key: 'legacy-key', value: 'legacy-value' });
  await awaitTransaction(transaction);
  database.close();
}

describe('CML-630E2 schema migration (real IndexedDB browser context)', () => {
  it('upgrades an isolated real IndexedDB from v1 to v2 preserving state', async () => {
    const uniqueId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const databaseName = `cml-630e2-upgrade-${uniqueId}`;
    const emptyDatabaseName = `${databaseName}-empty`;
    const open: Dexie[] = [];

    try {
      await createLegacyDatabaseWithRecord(databaseName);

      const upgraded = createCurriculumDatabase(databaseName);
      open.push(upgraded);
      await upgraded.open();
      const preserved = await upgraded.table('state').get('legacy-key');
      const stateIndexes = upgraded.table('state').schema.indexes.map(index => index.name);
      const upgradedStores = upgraded.tables.map(table => table.name).sort();
      const firstVersion = upgraded.verno;
      upgraded.close();

      const reopened = createCurriculumDatabase(databaseName);
      open.push(reopened);
      await reopened.open();
      const reopenedVersion = reopened.verno;
      const reopenedValue = await reopened.table('state').get('legacy-key');
      reopened.close();

      const empty = createCurriculumDatabase(emptyDatabaseName);
      open.push(empty);
      await empty.open();
      const emptyStores = empty.tables.map(table => table.name).sort();
      const emptyVersion = empty.verno;
      empty.close();

      expect(preserved).toEqual({ key: 'legacy-key', value: 'legacy-value' });
      expect(reopenedValue).toEqual(preserved);
      expect(stateIndexes).toEqual(['value']);
      expect(firstVersion).toBe(2);
      expect(reopenedVersion).toBe(2);
      expect(emptyVersion).toBe(2);
      expect(upgradedStores).toEqual(Object.keys(CURRICULUM_STORES).sort());
      expect(emptyStores).toEqual(upgradedStores);
    } finally {
      for (const database of open) database.close();
      await deleteDatabase(databaseName);
      await deleteDatabase(emptyDatabaseName);
    }
  }, 10_000);
});
