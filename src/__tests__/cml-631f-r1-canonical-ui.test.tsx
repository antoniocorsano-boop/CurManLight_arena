import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CanonicalDocumentTab } from '../features/documents/components/CanonicalDocumentTab';
import { useCurriculumStore } from '../store/useCurriculumStore';
import {
  createEmptyDocumentArchive,
  createDocumentInArchive,
  createInstitutionalSnapshot,
  createSectionHeading,
  createSectionParagraph,
  createSectionTeachingDesign,
} from '../domain/documents';
import type { DocumentArchive, DocumentEntity } from '../domain/documents';
import { createEmptyInstitutionalArchive } from '../domain/institution';
import { createEmptyRevisionArchive } from '../domain/revision';
import { createSelfDeclaredActor, generateEntityId } from '../domain/curriculum/identity';

const TEST_TITLE = 'Progettazione: UDA-001';

function makeDocument(archive: DocumentArchive, opts: { withActor?: boolean } = {}): {
  archive: DocumentArchive;
  doc: DocumentEntity;
} {
  const snapshot = createInstitutionalSnapshot('Liceo Classico', {
    configured: true,
    academicYearLabel: '2026-2027',
    ...(opts.withActor ? { declaredRole: 'docente' } : {}),
  });
  const created = createDocumentInArchive(archive, {
    documentType: 'teaching-design',
    title: TEST_TITLE,
    ...(opts.withActor ? { author: createSelfDeclaredActor('Docente Test', 'docente') } : {}),
    sourceRefs: [{ id: generateEntityId(), entityType: 'source', snapshotLabel: 'UDA 1' }],
  }, {
    sections: [
      createSectionHeading(1, TEST_TITLE),
      createSectionParagraph('Contenuto della progettazione didattica'),
      createSectionTeachingDesign({ discipline: 'italiano', order: 'secondaria', class: '3A' }, 'Struttura progetto'),
    ],
  }, snapshot);
  if (!created.success) {
    throw new Error(`Fixture failed: ${created.errors.map(e => e.message).join('; ')}`);
  }
  return { archive: created.archive, doc: created.document };
}

function resetStore(archive?: DocumentArchive) {
  useCurriculumStore.setState({
    savedUda: [],
    documentArchive: archive ?? createEmptyDocumentArchive(),
    institutionalArchive: createEmptyInstitutionalArchive(),
    revisionArchive: createEmptyRevisionArchive(),
  });
}

function openDocument(doc: DocumentEntity) {
  const allButtons = screen.getAllByRole('button');
  const docButton = allButtons.find(btn => {
    const text = btn.textContent || '';
    return text.includes(doc.title) && text.includes('Progettazione didattica');
  });
  if (!docButton) {
    throw new Error('Could not find document button');
  }
  fireEvent.click(docButton);
}

function mockPrintWindow() {
  return vi.spyOn(window, 'open').mockReturnValue({
    print: vi.fn(),
    close: vi.fn(),
    document: { write: vi.fn(), close: vi.fn() },
  } as unknown as Window);
}

describe('CML-631F-R1 — archive does not fail silently (P2)', () => {
  beforeEach(() => resetStore());

  it('shows an explicit error when archiving a draft document', async () => {
    const archive = createEmptyDocumentArchive();
    const { archive: ready, doc } = makeDocument(archive);
    resetStore(ready);

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Archivia' })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Archivia' }));

    const errorMessage = await screen.findByText(/Impossibile archiviare/i);
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage.textContent).toContain('Bozza');
    expect(screen.queryByText('Documento archiviato.')).not.toBeInTheDocument();
  });

  it('offers the canonical status path so archived becomes reachable', async () => {
    const archive = createEmptyDocumentArchive();
    const { archive: ready, doc } = makeDocument(archive);
    resetStore(ready);

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    await waitFor(() => {
      expect(screen.getByText(/Stato documento/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Passa a In lavorazione/i })).toBeInTheDocument();
  });
});

describe('CML-631F-R1 — status path to archived (P3, S9)', () => {
  beforeEach(() => resetStore());

  it('advances draft → in-progress → completed → archived and persists the archived state', async () => {
    const archive = createEmptyDocumentArchive();
    const { archive: ready, doc } = makeDocument(archive);
    resetStore(ready);

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    fireEvent.click(await screen.findByRole('button', { name: /Passa a In lavorazione/i }));
    fireEvent.click(await screen.findByRole('button', { name: /Passa a Completato/i }));

    await waitFor(() => {
      const archive = useCurriculumStore.getState().documentArchive;
      expect(archive.documents[0].status).toBe('completed');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Archivia' }));

    await waitFor(() => {
      expect(screen.getByText('Documenti archiviati')).toBeInTheDocument();
    });
    expect(screen.getAllByText(/Archiviato/i).length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.getByText('Documento archiviato.')).toBeInTheDocument();
    });

    const storeArchive = useCurriculumStore.getState().documentArchive;
    expect(storeArchive.documents[0].status).toBe('archived');
  });
});

describe('CML-631F-R1 — late actor configuration recovery (P1, S6)', () => {
  beforeEach(() => resetStore());

  it('offers the author/role recovery panel for documents without actor', async () => {
    const archive = createEmptyDocumentArchive();
    const { archive: ready, doc } = makeDocument(archive);
    resetStore(ready);

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    await waitFor(() => {
      expect(screen.getByText(/Associa autore e ruolo a questo documento/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Nome autore da associare/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ruolo da associare/i)).toBeInTheDocument();
  });

  it('unblocks preview and print after applying author and role to an existing document', async () => {
    const printMock = mockPrintWindow();
    const archive = createEmptyDocumentArchive();
    const { archive: ready, doc } = makeDocument(archive);
    resetStore(ready);

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    fireEvent.change(await screen.findByLabelText(/Nome autore da associare/i), { target: { value: 'Docente Test' } });
    fireEvent.change(screen.getByLabelText(/Ruolo da associare/i), { target: { value: 'docente' } });
    fireEvent.click(screen.getByRole('button', { name: /Applica autore e ruolo/i }));

    await waitFor(() => {
      expect(screen.getByText(/Autore e ruolo associati/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Autore: Docente Test/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Genera anteprima/i));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Stampa o salva in PDF/i })).toBeEnabled();
    });
    expect(screen.getByText(/Pronto per l'esportazione/i)).toBeInTheDocument();

    printMock.mockRestore();
  });
});

describe('CML-631F-R1 — new version creation (P4, S7)', () => {
  beforeEach(() => resetStore());

  it('creates version 2 from edited paragraphs and keeps version 1 selectable', async () => {
    const archive = createEmptyDocumentArchive();
    const { archive: ready, doc } = makeDocument(archive, { withActor: true });
    resetStore(ready);

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    await waitFor(() => {
      expect(screen.getByText(/Crea una nuova versione/i)).toBeInTheDocument();
    });

    const textarea = screen.getByLabelText(/Testo paragrafo 1/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Contenuto modificato nella seconda versione' } });
    fireEvent.change(screen.getByLabelText(/Motivo della nuova versione/i), { target: { value: 'Corretto il compito di realtà' } });

    const createButton = screen.getByRole('button', { name: /Crea nuova versione/i }) as HTMLButtonElement;
    expect(createButton.disabled).toBe(false);
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Nuova versione creata: v2/i)).toBeInTheDocument();
    });

    const storeArchive = useCurriculumStore.getState().documentArchive;
    const currentDoc = storeArchive.documents.find(d => d.id === doc.id)!;
    const currentVersion = storeArchive.versions.find(v => v.id === currentDoc.currentVersionRef)!;
    expect(currentVersion.versionNumber).toBe(2);

    const select = screen.getByRole('combobox', { name: /Seleziona versione/i }) as HTMLSelectElement;
    expect(select.options.length).toBe(2);
    fireEvent.change(select, { target: { value: select.options[0].value } });
    expect(screen.getByText(/Questa non è la versione corrente/i)).toBeInTheDocument();
  });

  it('requires a modification and a reason before creating a version', async () => {
    const archive = createEmptyDocumentArchive();
    const { archive: ready, doc } = makeDocument(archive, { withActor: true });
    resetStore(ready);

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Crea nuova versione/i })).toBeInTheDocument();
    });
    const createButton = screen.getByRole('button', { name: /Crea nuova versione/i }) as HTMLButtonElement;
    expect(createButton.disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(/Testo paragrafo 1/i), { target: { value: 'Testo modificato' } });
    expect((screen.getByRole('button', { name: /Crea nuova versione/i }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(/Motivo della nuova versione/i), { target: { value: 'Motivo' } });
    expect((screen.getByRole('button', { name: /Crea nuova versione/i }) as HTMLButtonElement).disabled).toBe(false);
  });
});

describe('CML-631F-R1 — archived document read-only (S9, S10)', () => {
  beforeEach(() => resetStore());

  it('hides editing panels and shows the read-only banner for archived documents', async () => {
    const archive = createEmptyDocumentArchive();
    const { archive: ready, doc } = makeDocument(archive, { withActor: true });
    const archivedArchive: DocumentArchive = {
      ...ready,
      documents: ready.documents.map(d => (d.id === doc.id ? { ...d, status: 'archived' as const } : d)),
    };
    resetStore(archivedArchive);

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    await waitFor(() => {
      expect(screen.getByText(/Il documento è archiviato/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Crea una nuova versione/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Associa autore e ruolo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Stato documento/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Archivia' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Stampa o salva in PDF/i })).toBeDisabled();
  });
});

describe('CML-631F-R1 — author shown on the card (P5)', () => {
  beforeEach(() => resetStore());

  it('shows the author in the document card in happy path', async () => {
    const archive = createEmptyDocumentArchive();
    const { archive: ready } = makeDocument(archive, { withActor: true });
    resetStore(ready);

    render(<CanonicalDocumentTab />);

    await waitFor(() => {
      expect(screen.getByText(/Autore: Docente Test/i)).toBeInTheDocument();
    });
  });
});
