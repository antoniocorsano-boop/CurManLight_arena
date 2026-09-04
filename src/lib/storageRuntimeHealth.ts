export type ArenaStorageMode =
  | 'indexeddb-persistent'
  | 'indexeddb-best-effort'
  | 'volatile-memory';

export interface ArenaStorageProbeResult {
  mode: ArenaStorageMode;
  indexedDbOperational: boolean;
  evictionProtection: 'granted' | 'best-effort' | 'unknown';
  reason?: string;
}

const PROBE_DB_NAME = 'CurManLightDB_Runtime_Probe_v1';
const PROBE_STORE = 'probe';

function requestToPromise<T = undefined>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed'));
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
  });
}

async function openProbeDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(PROBE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(PROBE_STORE)) {
        database.createObjectStore(PROBE_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Unable to open IndexedDB probe database'));
    request.onblocked = () => reject(new Error('IndexedDB probe database open was blocked'));
  });
}

async function verifyIndexedDbRoundTrip(): Promise<void> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    throw new Error('IndexedDB unavailable');
  }

  const database = await openProbeDatabase();
  const probeKey = `arena-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const probeValue = `ok-${probeKey}`;

  try {
    const write = database.transaction(PROBE_STORE, 'readwrite');
    write.objectStore(PROBE_STORE).put(probeValue, probeKey);
    await transactionDone(write);

    const read = database.transaction(PROBE_STORE, 'readonly');
    const result = await requestToPromise(read.objectStore(PROBE_STORE).get(probeKey));
    await transactionDone(read);
    if (result !== probeValue) {
      throw new Error('IndexedDB round-trip returned an unexpected value');
    }

    const cleanup = database.transaction(PROBE_STORE, 'readwrite');
    cleanup.objectStore(PROBE_STORE).delete(probeKey);
    await transactionDone(cleanup);
  } finally {
    database.close();
    try {
      window.indexedDB.deleteDatabase(PROBE_DB_NAME);
    } catch {
      // The disposable probe database may be cleaned by the browser later.
    }
  }
}

export function classifyBrowserStorageMode(
  indexedDbOperational: boolean,
  evictionProtection: 'granted' | 'best-effort' | 'unknown',
): ArenaStorageMode {
  if (!indexedDbOperational) return 'volatile-memory';
  return evictionProtection === 'granted'
    ? 'indexeddb-persistent'
    : 'indexeddb-best-effort';
}

async function getEvictionProtection(): Promise<'granted' | 'best-effort' | 'unknown'> {
  if (typeof navigator === 'undefined' || !navigator.storage) return 'unknown';

  try {
    if (navigator.storage.persisted && await navigator.storage.persisted()) {
      return 'granted';
    }

    if (!navigator.storage.persist) return 'unknown';
    return await navigator.storage.persist() ? 'granted' : 'best-effort';
  } catch {
    return 'unknown';
  }
}

export async function verifyBrowserStorage(): Promise<ArenaStorageProbeResult> {
  try {
    await verifyIndexedDbRoundTrip();
  } catch (error) {
    return {
      mode: 'volatile-memory',
      indexedDbOperational: false,
      evictionProtection: 'unknown',
      reason: error instanceof Error ? error.message : String(error),
    };
  }

  const evictionProtection = await getEvictionProtection();
  return {
    mode: classifyBrowserStorageMode(true, evictionProtection),
    indexedDbOperational: true,
    evictionProtection,
  };
}

export const ARENA_STORAGE_VOLATILE_EVENT = 'arena:storage-volatile';
