import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { createEmptyDocumentArchive } from '../domain/documents';
import { createEmptyInstitutionalArchive } from '../domain/institution';
import { createEmptyRevisionArchive } from '../domain/revision';
import { createCurriculumDatabase } from '../domain/curriculum/persistence/backend';
import { useDocumentProduction } from '../features/documents/hooks/useDocumentProduction';
import { getDocumentList } from '../domain/documents/selectors';
import type { UdaModel } from '../types/curriculum';

const udaA: UdaModel = {
  id: 'uda-browser-a',
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
  id: 'uda-browser-b',
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

function resetStore() {
  useCurriculumStore.setState({
    savedUda: [udaA, udaB],
    documentArchive: createEmptyDocumentArchive(),
    institutionalArchive: createEmptyInstitutionalArchive(),
    revisionArchive: createEmptyRevisionArchive(),
  });
}

function createFromUda(udaId: string) {
  const { result } = renderHook(() => useDocumentProduction());
  let outcome: ReturnType<typeof result.current.createDocumentFromUda> | undefined;
  act(() => {
    outcome = result.current.createDocumentFromUda(udaId);
  });
  return outcome;
}

const persistName = useCurriculumStore.persist.getOptions().name as string;

async function readPersistedRow(): Promise<{ state: unknown } | Record<string, unknown> | undefined> {
  const db = createCurriculumDatabase();
  const row = await db.table('state').get(persistName);
  db.close();
  return row ? (JSON.parse(row.value) as { state: unknown } | Record<string, unknown>) : undefined;
}

async function waitForPersistedArchiveWith(docCount: number): Promise<Record<string, unknown>> {
  const start = Date.now();
  while (Date.now() - start < 5000) {
    const persisted = await readPersistedRow();
    if (persisted) {
      const container = persisted.state && typeof persisted.state === 'object' ? persisted.state : persisted;
      const archive = (container as { documentArchive?: { documents?: unknown[] } }).documentArchive;
      if (archive && archive.documents && archive.documents.length === docCount) {
        return container as Record<string, unknown>;
      }
    }
    await new Promise((r) => setTimeout(r, 25));
  }
  throw new Error(`Timed out waiting for persisted archive with ${docCount} document(s)`);
}

async function createFreshStoreFromIndexedDb() {
  vi.resetModules();
  const module = await import('../store/useCurriculumStore');
  const freshStore = module.useCurriculumStore as typeof useCurriculumStore;
  await freshStore.persist.rehydrate();
  return freshStore;
}

describe('CML-638B canonical document persistence (real IndexedDB)', () => {
  beforeEach(async () => {
    const db = createCurriculumDatabase();
    await db.table('state').clear();
    db.close();
    resetStore();
  });

  it('writes the produced archive into real IndexedDB', async () => {
    const outcome = createFromUda('uda-browser-a');
    expect(outcome?.status).toBe('created');

    const container = await waitForPersistedArchiveWith(1);
    const archive = container.documentArchive as { documents: Array<{ sourceRefs: Array<{ id: string }> }> };
    expect(archive.documents[0].sourceRefs.some((r) => r.id === 'uda-browser-a')).toBe(true);
  });

  it('restores documents from real IndexedDB after a reload', async () => {
    createFromUda('uda-browser-a');
    await waitForPersistedArchiveWith(1);

    const freshStore = await createFreshStoreFromIndexedDb();
    const archive = freshStore.getState().documentArchive;
    expect(getDocumentList(archive).length).toBe(1);
    expect(archive.versions.length).toBe(1);
  });

  it('persists multiple documents and restores all of them', async () => {
    createFromUda('uda-browser-a');
    createFromUda('uda-browser-b');
    await waitForPersistedArchiveWith(2);

    const freshStore = await createFreshStoreFromIndexedDb();
    const docs = getDocumentList(freshStore.getState().documentArchive);
    expect(docs.length).toBe(2);
    expect(new Set(docs.map((d) => d.title)).size).toBe(2);
  });

  it('recovers to an empty archive when the persisted documentArchive is corrupt', async () => {
    createFromUda('uda-browser-a');
    await waitForPersistedArchiveWith(1);

    const persisted = await readPersistedRow();
    expect(persisted).toBeTruthy();
    const container = (persisted as { state: Record<string, unknown> }).state ?? persisted;
    (container as { documentArchive: unknown }).documentArchive = {
      schemaVersion: 1,
      updatedAt: '2026-01-01T00:00:00.000Z',
      documents: [{ id: 'phantom', currentVersionRef: 'ghost' }],
      versions: [],
    };

    const db = createCurriculumDatabase();
    await db.table('state').put({ key: persistName, value: JSON.stringify(persisted) });
    db.close();

    const freshStore = await createFreshStoreFromIndexedDb();
    const recovered = freshStore.getState().documentArchive;
    expect(recovered.documents).toEqual([]);
    expect(recovered.versions).toEqual([]);
  });
});
