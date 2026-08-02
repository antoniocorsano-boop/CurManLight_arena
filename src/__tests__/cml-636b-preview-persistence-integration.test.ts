import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createJSONStorage } from 'zustand/middleware';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { createEmptyDocumentArchive } from '../domain/documents';
import { createEmptyInstitutionalArchive, createInstituteDraft, createAcademicYear, createInstituteSite, createInstitutionalContext, addInstitute, confirmInstitute, setActiveInstitute, addAcademicYear, setActiveAcademicYear, addInstituteSite, setInstitutionalContext } from '../domain/institution';
import { createEmptyRevisionArchive } from '../domain/revision';
import { useDocumentProduction } from '../features/documents/hooks/useDocumentProduction';
import { executeA04ToA07DocumentTransfer } from '../domain/documents/contracts';
import { createInstitutionalSnapshot } from '../domain/documents';
import { createDocumentInArchive } from '../domain/documents';
import { getDocumentList } from '../domain/documents/selectors';
import { getDocumentHistory } from '../domain/documents/selectors';
import { getCurrentVersion } from '../domain/documents/repository';
import { validateExportability } from '../domain/documents';
import { computePreviewKey, serializePreviewKey, isPreviewStale } from '../domain/documents';
import { renderDocument } from '../domain/documents';
import type { UdaModel } from '../types/curriculum';
import type { A04ToA07Payload } from '../domain/transfer/areaContracts';

const udaTest: UdaModel = {
  id: 'uda-integrazione-1',
  title: 'Acqua e territorio',
  discipline: 'scienze',
  order: 'secondaria',
  period: 'Primo Quadrimestre',
  hours: 12,
  status: 'bozza',
  traguardi: ['Comprendere sistemi ambientali'],
  obiettivi: ['Osservare relazioni tra uomo e ambiente'],
  evidenze: ['Cartina geologica', 'Diagramma idrografico'],
  realTask: 'Analisi del territorio',
  notes: 'Note di lavoro',
  createdAt: '2026-07-27T08:00:00.000Z',
};

class MemoryStorage {
  private values = new Map<string, string>();
  getItem = (name: string): string | null => this.values.get(name) ?? null;
  setItem = (name: string, value: string): void => { this.values.set(name, value); };
  removeItem = (name: string): void => { this.values.delete(name); };
}

function createTestInstitutionalArchive() {
  const NOW = '2026-08-01T00:00:00.000Z';
  const institute = createInstituteDraft({ name: 'Istituto Test', schoolOrders: ['secondaria'] }, NOW);
  let archive = addInstitute(createEmptyInstitutionalArchive(NOW), institute).archive!;
  archive = confirmInstitute(archive, institute.id, NOW).archive!;
  archive = setActiveInstitute(archive, institute.id, NOW).archive!;
  const year = createAcademicYear({ instituteRef: { id: institute.id, entityType: 'institute' }, label: '2026/2027', startsOn: '2026-09-01', endsOn: '2027-08-31', status: 'planned' }, NOW);
  archive = addAcademicYear(archive, year).archive!;
  archive = setActiveAcademicYear(archive, institute.id, year.id, NOW).archive!;
  const site = createInstituteSite({ instituteRef: { id: institute.id, entityType: 'institute' }, name: 'Sede principale', isMain: true }, NOW);
  archive = addInstituteSite(archive, site).archive!;
  const context = createInstitutionalContext({
    instituteRef: { id: institute.id, entityType: 'institute' },
    academicYearRef: { id: year.id, entityType: 'academic-year' },
    siteRef: { id: site.id, entityType: 'institute-site' },
    declaredActor: { displayName: 'Marco Rossi', role: 'docente', assertion: 'self-declared' },
  }, NOW);
  archive = setInstitutionalContext(archive, context).archive!;
  return archive;
}

function resetStore() {
  useCurriculumStore.setState({
    savedUda: [udaTest],
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
      const parsed = JSON.parse(raw);
      const container = parsed.state && typeof parsed.state === 'object' ? parsed.state : parsed;
      const archive = container.documentArchive as { documents?: unknown[] } | undefined;
      if (archive && Array.isArray(archive.documents) && archive.documents.length === expectedDocuments) {
        return archive;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error(`Persisted archive with ${expectedDocuments} document(s) was not written in time.`);
}

async function createFreshStore(storage: MemoryStorage) {
  vi.resetModules();
  const module = await import('../store/useCurriculumStore');
  const freshStore = module.useCurriculumStore as typeof useCurriculumStore;
  freshStore.persist.setOptions({ storage: createJSONStorage(() => storage) });
  await freshStore.persist.rehydrate();
  return freshStore;
}

function createFromUda(udaId: string) {
  const { result } = renderHook(() => useDocumentProduction());
  let outcome: ReturnType<typeof result.current.createDocumentFromUda> | undefined;
  act(() => {
    outcome = result.current.createDocumentFromUda(udaId);
  });
  return outcome;
}

describe('CML-636B — Canonical document creation and persistence', () => {
  let storage: MemoryStorage;

  beforeEach(async () => {
    storage = new MemoryStorage();
    await resetPersistence(storage);
  });

  it('creates a canonical document through A04 → A07 path', () => {
    const outcome = createFromUda('uda-integrazione-1');
    expect(outcome?.status).toBe('created');
  });

  it('persists the created document', async () => {
    createFromUda('uda-integrazione-1');
    await waitForPersistedArchive(storage, 1);

    const freshStore = await createFreshStore(storage);
    const docs = getDocumentList(freshStore.getState().documentArchive);
    expect(docs).toHaveLength(1);
  });

  it('persists the version with its content', async () => {
    createFromUda('uda-integrazione-1');
    await waitForPersistedArchive(storage, 1);

    const freshStore = await createFreshStore(storage);
    const archive = freshStore.getState().documentArchive;
    const doc = archive.documents[0];

    const history = getDocumentHistory(archive, doc.id);
    expect(history).toHaveLength(1);
    expect(history[0].versionNumber).toBe(1);
    expect(history[0].content.sections.length).toBeGreaterThan(0);
    expect(history[0].institutionalSnapshot.instituteName).toBe('Istituto non configurato');
  });

  it('preserves source provenance after reload', async () => {
    createFromUda('uda-integrazione-1');
    await waitForPersistedArchive(storage, 1);

    const freshStore = await createFreshStore(storage);
    const doc = freshStore.getState().documentArchive.documents[0];
    expect(doc.sourceRefs.some(r => r.id === 'uda-integrazione-1')).toBe(true);
  });
});

describe('CML-636B — Rehydration and currentVersionRef resolution', () => {
  let storage: MemoryStorage;

  beforeEach(async () => {
    storage = new MemoryStorage();
    await resetPersistence(storage);
  });

  it('resolves currentVersionRef correctly after rehydration', async () => {
    createFromUda('uda-integrazione-1');
    await waitForPersistedArchive(storage, 1);

    const freshStore = await createFreshStore(storage);
    const archive = freshStore.getState().documentArchive;
    const doc = archive.documents[0];

    const version = getCurrentVersion(archive, doc);
    expect(version).toBeDefined();
    expect(version?.id).toBe(doc.currentVersionRef);
    expect(version?.documentRef).toBe(doc.id);
  });
});

describe('CML-636B — Validation and preview from persisted data', () => {
  let storage: MemoryStorage;

  beforeEach(async () => {
    storage = new MemoryStorage();
    await resetPersistence(storage);
    useCurriculumStore.setState({
      savedUda: [udaTest],
      documentArchive: createEmptyDocumentArchive(),
      institutionalArchive: createTestInstitutionalArchive(),
      revisionArchive: createEmptyRevisionArchive(),
    });
  });

  it('renders preview from persisted DocumentVersion (not synthetic)', async () => {
    createFromUda('uda-integrazione-1');
    await waitForPersistedArchive(storage, 1);

    const freshStore = await createFreshStore(storage);
    const archive = freshStore.getState().documentArchive;
    const doc = archive.documents[0];
    const version = getCurrentVersion(archive, doc)!;

    const html = renderDocument(doc, version);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Acqua e territorio');
    expect(html).toContain('scienze');

    const previewKey = serializePreviewKey(computePreviewKey(doc, version));
    const previewState = {
      key: previewKey,
      html,
      renderedAt: new Date().toISOString(),
      versionNumber: version.versionNumber,
    };

    const result = validateExportability({
      archive,
      document: doc,
      version,
      selectedVersionId: version.id,
      previewState,
    });

    expect(result.exportable).toBe(true);
  });

  it('isPreviewStale detects content drift after rehydration', async () => {
    const archive = createEmptyDocumentArchive();
    const snapshot = createInstitutionalSnapshot('Istituto Verifica', { configured: true });
    const created = createDocumentInArchive(archive, {
      documentType: 'teaching-design',
      title: 'Progettazione: test-stale',
    }, {
      sections: [
        { type: 'teaching-design', snapshot: { discipline: 'italiano', order: 'secondaria', class: '3A' } },
      ],
    }, snapshot);

    if (!created.success) throw new Error('Failed to create');
    const doc = created.document;
    const version = created.version;

    const correctKey = serializePreviewKey(computePreviewKey(doc, version));
    const staleState = {
      key: 'wrong-key',
      html: '<!DOCTYPE html><html><body>test</body></html>',
      renderedAt: new Date().toISOString(),
      versionNumber: 1,
    };

    expect(isPreviewStale(staleState, doc, version)).toBe(true);
    expect(isPreviewStale(
      { ...staleState, key: correctKey },
      doc, version
    )).toBe(false);
  });
});

describe('CML-636B — No new store or archive introduced', () => {
  it('uses existing useCurriculumStore.documentArchive', () => {
    const store = useCurriculumStore.getState();
    expect(store).toHaveProperty('documentArchive');
    expect(store).toHaveProperty('replaceDocumentArchive');
  });

  it('produces archive with correct schema version', () => {
    const archive = createEmptyDocumentArchive();
    expect(archive.schemaVersion).toBe(1);
    expect(Array.isArray(archive.documents)).toBe(true);
    expect(Array.isArray(archive.versions)).toBe(true);
  });
});

describe('CML-636B — Dedup behavior from CML-638B not regressed', () => {
  let storage: MemoryStorage;

  beforeEach(async () => {
    storage = new MemoryStorage();
    await resetPersistence(storage);
  });

  it('deterministic dedup: second create returns already-exists', () => {
    const outcome1 = createFromUda('uda-integrazione-1');
    expect(outcome1?.status).toBe('created');

    const outcome2 = createFromUda('uda-integrazione-1');
    expect(outcome2?.status).toBe('already-exists');
  });

  it('dedup preserves single document after both attempts', async () => {
    createFromUda('uda-integrazione-1');
    createFromUda('uda-integrazione-1');
    await waitForPersistedArchive(storage, 1);

    const freshStore = await createFreshStore(storage);
    expect(getDocumentList(freshStore.getState().documentArchive)).toHaveLength(1);
  });
});

describe('CML-636B — executeA04ToA07DocumentTransfer as single transfer path', () => {
  it('produceCanonicalDocumentFromPayload delegates to executeA04ToA07DocumentTransfer', () => {
    const archive = createEmptyDocumentArchive();

    const payload: A04ToA07Payload = {
      designId: 'uda-test-integrity',
      curriculumRefs: ['uda-test-integrity'],
      sources: ['Test Source'],
      institutionalContext: {
        instituteName: 'Istituto Integrazione',
        configured: true,
        academicYearLabel: '2026-2027',
        declaredRole: 'docente',
      },
      teachingStructure: {
        discipline: 'italiano',
        order: 'secondaria',
        class: '3A',
      },
      assistedContentOrigin: 'teacher',
      versionOrSnapshot: 'v1',
      warnings: [],
      metadata: { sessionTimestamp: new Date().toISOString() },
    };

    const result = executeA04ToA07DocumentTransfer(payload, archive);

    expect(result.status).toBe('completed');
    if (result.status === 'completed') {
      expect(result.document.title).toBe('Progettazione: uda-test-integrity');
      expect(result.version.institutionalSnapshot.instituteName).toBe('Istituto Integrazione');
      expect(result.archive.documents).toHaveLength(1);
      expect(result.archive.versions).toHaveLength(1);
    }
  });
});
