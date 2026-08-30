import type { HvaRecorderManifest } from './contract';

const DB_NAME = 'curmanlight-hva-recorder';
const DB_VERSION = 1;
const STORE_NAME = 'sessions';

export type StoredHvaSession = {
  sessionId: string;
  manifest: HvaRecorderManifest;
  audio: Blob;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'sessionId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Impossibile aprire l’archivio locale HVA.'));
  });
}

export async function saveHvaSession(session: StoredHvaSession): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(session);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Impossibile salvare la sessione HVA.'));
    tx.onabort = () => reject(tx.error ?? new Error('Salvataggio HVA interrotto.'));
  });
  db.close();
}

export async function deleteHvaSession(sessionId: string): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(sessionId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Impossibile eliminare la sessione HVA.'));
    tx.onabort = () => reject(tx.error ?? new Error('Eliminazione HVA interrotta.'));
  });
  db.close();
}
