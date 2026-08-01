import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createJSONStorage } from 'zustand/middleware';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { createEmptyDocumentArchive } from '../domain/documents';
import { createEmptyInstitutionalArchive } from '../domain/institution';
import { createEmptyRevisionArchive } from '../domain/revision';
import { useDocumentProduction } from '../features/documents/hooks/useDocumentProduction';
import { getDocumentList, getDocumentHistory } from '../domain/documents/selectors';
import type { UdaModel } from '../types/curriculum';

const udaA: UdaModel = {
  id: 'uda-persist-a',
  title: 'Acqua e territorio',
  discipline: 'italiano',
  order: 'secondaria',
  period: 'Primo Quadrimestre',
  hours: 12,
  status: 'bozza',
  traguardi: ['Comprendere testi narrativi'],
  obiettivi: [],
  evidenze: [],
  realTask: '',
  notes: '',
  createdAt: '2026-07-27T08:00:00.000Z',
};

const udaB: UdaModel = {
  id: 'uda-persist-b',
  title: 'Energia e sostenibilità',
  discipline: 'scienze',
  order: 'primaria',
  period: 'Secondo Quadrimestre',
  hours: 10,
  status: 'bozza',
  traguardi: ['Osservare fenomeni'],
  obiettivi: [],
  evidenze: [],
  realTask: '',
  notes: '',
  createdAt: '2026-07-01T09:00:00.000Z',
};

class MemoryStorage {
  private readonly values = new Map<string, string>();
  public readonly writeEvents: Array<{ documentCount: number; versionCount: number }> = [];

  getItem = (name: string): string | null => this.values.get(name) ?? null;

  setItem = (name: string, value: string): void => {
    this.values.set(name, value);
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    const state = parsed?.state ?? parsed;
    this.writeEvents.push({
      documentCount: state?.documentArchive?.documents?.length ?? 0,
      versionCount: state?.documentArchive?.versions?.length ?? 0,
    });
  };

  removeItem = (name: string): void => {
    this.values.delete(name);
  };
}

function resetStore() {
  useCurriculumStore.setState({
    savedUda: [udaA, udaB],
    documentArchive: createEmptyDocumentArchive(),
    institutionalArchive: createEmptyInstitutionalArchive(),
    revisionArchive: createEmptyRevisionArchive(),
  });
}

async function resetPersistence(storage: MemoryStorage) {
  useCurriculumStore.persist.setOptions({ storage: createJSONStorage(() => storage) });
  await useCurriculumStore.persist.clearStorage();
  resetStore();
  await useCurriculumStore.persist.rehydrate();
}

async function waitForPersistedArchive(storage: MemoryStorage, expectedDocuments: number) {
  const name = useCurriculumStore.persist.getOptions().name as string;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const raw = storage.getItem(name);
    if (raw) {
      const persisted = JSON.parse(raw);
      const container = persisted.state && typeof persisted.state === 'object' ? persisted.state : persisted;
      const archive = container.documentArchive as { documents?: unknown[] } | undefined;
      if (archive && Array.isArray(archive.documents) && archive.documents.length === expectedDocuments) {
        return archive;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error(`Persisted archive with ${expectedDocuments} document(s) was not written in time.`);
}

function createFromUda(udaId: string) {
  const { result } = renderHook(() => useDocumentProduction());
  let outcome: ReturnType<typeof result.current.createDocumentFromUda> | undefined;
  act(() => {
    outcome = result.current.createDocumentFromUda(udaId);
  });
  return outcome;
}

async function createFreshStore(storage: MemoryStorage) {
  vi.resetModules();
  const module = await import('../store/useCurriculumStore');
  const freshStore = module.useCurriculumStore as typeof useCurriculumStore;
  freshStore.persist.setOptions({ storage: createJSONStorage(() => storage) });
  await freshStore.persist.rehydrate();
  return freshStore;
}

describe('CML-638B canonical document persistence', () => {
  let storage: MemoryStorage;

  beforeEach(async () => {
    storage = new MemoryStorage();
    await resetPersistence(storage);
  });

  it('persists a created document and restores it after reload', async () => {
    const outcome = createFromUda('uda-persist-a');
    expect(outcome?.status).toBe('created');
    const before = useCurriculumStore.getState().documentArchive;
    expect(getDocumentList(before).length).toBe(1);
    await waitForPersistedArchive(storage, 1);

    const freshStore = await createFreshStore(storage);
    const after = freshStore.getState().documentArchive;
    const rawAfterReload = storage.getItem(useCurriculumStore.persist.getOptions().name as string);
    expect(rawAfterReload).toBeTruthy();
    const parsedAfterReload = JSON.parse(rawAfterReload as string);
    const reloadedContainer = parsedAfterReload.state && typeof parsedAfterReload.state === 'object' ? parsedAfterReload.state : parsedAfterReload;
    const reloadedArchive = reloadedContainer.documentArchive as { documents?: Array<unknown>; versions?: Array<unknown> };
    expect(reloadedArchive.documents?.length).toBe(1);
    expect(getDocumentList(after).length).toBe(1);
    expect(after.documents[0].title).toBe(before.documents[0].title);
    expect(after.versions.length).toBe(before.versions.length);
  });

  it('persists versions together with the document', async () => {
    createFromUda('uda-persist-a');
    await waitForPersistedArchive(storage, 1);

    const freshStore = await createFreshStore(storage);
    const archive = freshStore.getState().documentArchive;
    const doc = archive.documents[0];
    expect(archive.versions.some((v) => v.id === doc.currentVersionRef)).toBe(true);
    const history = getDocumentHistory(archive, doc.id);
    expect(history.length).toBe(1);
    expect(history[0].versionNumber).toBe(1);
    expect(history[0].content.sections.length).toBeGreaterThan(0);
  });

  it('persists multiple documents and restores all of them', async () => {
    createFromUda('uda-persist-a');
    createFromUda('uda-persist-b');
    await waitForPersistedArchive(storage, 2);

    const freshStore = await createFreshStore(storage);
    const docs = getDocumentList(freshStore.getState().documentArchive as never);
    expect(docs.length).toBe(2);
    expect(new Set(docs.map((d) => d.title)).size).toBe(2);
  });

  it('keeps source provenance after reload', async () => {
    createFromUda('uda-persist-a');
    await waitForPersistedArchive(storage, 1);

    const freshStore = await createFreshStore(storage);
    const doc = (freshStore.getState().documentArchive as { documents: Array<{ sourceRefs: Array<{ id: string }>; metadata: { origin: string } }> }).documents[0];
    expect(doc.sourceRefs.some((r) => r.id === 'uda-persist-a')).toBe(true);
    expect(doc.metadata.origin).toBe('teacher');
  });

  it('recovers to an empty archive when the persisted documentArchive is corrupt', async () => {
    createFromUda('uda-persist-a');
    await waitForPersistedArchive(storage, 1);

    const name = useCurriculumStore.persist.getOptions().name as string;
    const raw = storage.getItem(name);
    expect(raw).toBeTruthy();

    const persisted = JSON.parse(raw as string);
    const container = persisted.state && typeof persisted.state === 'object' ? persisted.state : persisted;
    container.documentArchive = {
      schemaVersion: 1,
      updatedAt: '2026-01-01T00:00:00.000Z',
      documents: [
        {
          id: 'phantom',
          currentVersionRef: 'ghost',
          documentType: 'report',
          title: 'Fantasmatico',
          status: 'draft',
          metadata: {},
          sourceRefs: [],
          originRefs: [],
        },
      ],
      versions: [],
    };
    storage.setItem(name, JSON.stringify(persisted));

    const freshStore = await createFreshStore(storage);
    const recovered = freshStore.getState().documentArchive as { documents: Array<unknown>; versions: Array<unknown> };
    expect(recovered.documents).toEqual([]);
    expect(recovered.versions).toEqual([]);
  });

  it('keeps the in-memory state usable when storage rejects writes', async () => {
    const failingStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('storage unavailable');
      },
      removeItem: () => {
        throw new Error('storage unavailable');
      },
    };
    useCurriculumStore.persist.setOptions({ storage: createJSONStorage(() => failingStorage) });
    await useCurriculumStore.persist.rehydrate();

    expect(() => createFromUda('uda-persist-a')).toThrow('storage unavailable');
    const after = useCurriculumStore.getState().documentArchive;
    expect(getDocumentList(after).length).toBe(1);
  });
});
