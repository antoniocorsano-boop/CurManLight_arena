import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CanonicalDocumentTab } from '../features/documents/components/CanonicalDocumentTab';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { createEmptyDocumentArchive } from '../domain/documents';
import { createDocumentInArchive } from '../domain/documents';
import { createInstitutionalSnapshot } from '../domain/documents';
import { createSectionHeading } from '../domain/documents';
import { createSectionParagraph } from '../domain/documents';
import { createSectionTeachingDesign } from '../domain/documents';
import { createInitialVersion } from '../domain/documents';
import { createEmptyInstitutionalArchive } from '../domain/institution';
import { createEmptyRevisionArchive } from '../domain/revision';
import type { DocumentEntity, DocumentVersion, DocumentArchive } from '../domain/documents';
import { generateEntityId } from '../domain/curriculum/identity';

function makeFullDocument(archive: DocumentArchive, overrides: {
  title?: string;
  status?: DocumentEntity['status'];
  instituteName?: string;
  academicYearLabel?: string;
  discipline?: string;
  order?: string;
  class?: string;
  authorName?: string;
  authorRole?: string;
  sourceRefs?: DocumentEntity['sourceRefs'];
} = {}): { archive: DocumentArchive; doc: DocumentEntity; version: DocumentVersion } {
  const snapshot = createInstitutionalSnapshot(overrides.instituteName ?? 'Liceo Classico', {
    configured: true,
    academicYearLabel: overrides.academicYearLabel ?? '2026-2027',
    declaredRole: overrides.authorRole ?? 'docente',
  });

  const created = createDocumentInArchive(archive, {
    documentType: 'teaching-design',
    title: overrides.title ?? 'Progettazione: UDA-001',
    sourceRefs: overrides.sourceRefs ?? [{ id: generateEntityId(), entityType: 'source', snapshotLabel: 'UDA 1' }],
  }, {
    sections: [
      createSectionHeading(1, overrides.title ?? 'Progettazione: UDA-001'),
      createSectionParagraph('Contenuto della progettazione didattica'),
      createSectionTeachingDesign({
        discipline: overrides.discipline ?? 'italiano',
        order: overrides.order ?? 'secondaria',
        class: overrides.class ?? '3A',
      }, 'Struttura progetto'),
    ],
  }, snapshot);

  if (!created.success) throw new Error('Failed to create document');

  const doc = created.document;
  const version = created.version;

  if (overrides.status === 'archived') {
    const archivedDoc: DocumentEntity = { ...doc, status: 'archived' };
    return { archive: { ...created.archive, documents: created.archive.documents.map(d => d.id === doc.id ? archivedDoc : d) }, doc: archivedDoc, version };
  }

  return { archive: created.archive, doc, version };
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
  fireEvent.click(screen.getByText(text => text.includes(doc.title)));
}

function mockPrintWindow() {
  return vi.spyOn(window, 'open').mockReturnValue({
    print: vi.fn(),
    close: vi.fn(),
    document: { write: vi.fn(), close: vi.fn() },
  } as unknown as Window);
}

describe('CML-636B CanonicalDocumentTab — version selection', () => {
  beforeEach(() => resetStore());

  it('shows current version by default', async () => {
    const archive = createEmptyDocumentArchive();
    const result = makeFullDocument(archive);
    const { doc, version } = result;
    resetStore(archive);

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    // Use flexible text matching for dynamic title formatting
    await waitFor(() => {
      expect(screen.getByText(text => text.includes('Versione corrente'))).toBeInTheDocument();
    });
  });

  it('allows explicit version selection via dropdown', async () => {
    const archive = createEmptyDocumentArchive();
    const result = makeFullDocument(archive);
    const doc = result.doc;

    const snap2 = createInstitutionalSnapshot('Liceo Classico', { configured: true, academicYearLabel: '2026-2027', declaredRole: 'docente' });
    const v2 = createInitialVersion(doc, {
      sections: [
        createSectionHeading(1, 'Progettazione'),
        createSectionTeachingDesign({ discipline: 'italiano', order: 'secondaria', class: '3A' }),
      ],
    }, { institutionalSnapshot: snap2 });

    const archiveWithV2 = {
      ...archive,
      versions: [...archive.versions, v2],
      documents: archive.documents.map(d => d.id === doc.id ? { ...d, currentVersionRef: v2.id } : d),
    };
    resetStore(archiveWithV2);

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    await waitFor(() => {
      const select = screen.getByRole('combobox', { name: /Seleziona versione/i });
      expect(select).toBeInTheDocument();
      expect(select).toBeEnabled();
    });
  });
});

describe('CML-636B CanonicalDocumentTab — preview generation', () => {
  beforeEach(() => resetStore());

  it('generates preview from persisted version data', async () => {
    const archive = createEmptyDocumentArchive();
    const { doc } = makeFullDocument(archive);
    resetStore(archive);

    const printMock = mockPrintWindow();

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    await waitFor(() => {
      expect(screen.getByText(/Genera anteprima/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Genera anteprima/i));

    await waitFor(() => {
      expect(screen.getByText(/Anteprima pronta/i)).toBeInTheDocument();
    });

    const iframe = screen.getByTitle(`Anteprima documento ${doc.title}`) as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();

    printMock.mockRestore();
  });
});

describe('CML-636B CanonicalDocumentTab — validation summary', () => {
  beforeEach(() => resetStore());

  it('shows blocking errors with field annotations', async () => {
    const archive = createEmptyDocumentArchive();
    const { doc } = makeFullDocument(archive, { title: '' });
    resetStore(archive);

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    await waitFor(() => {
      expect(screen.getByText(/Dati mancanti o blocchi per l'esportazione/i)).toBeInTheDocument();
    });

    const errors = screen.getAllByText(/Titolo documento mancante/i);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('shows ready state when all validation passes', async () => {
    const archive = createEmptyDocumentArchive();
    const { doc } = makeFullDocument(archive);
    resetStore(archive);

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    await waitFor(() => {
      expect(screen.getByText(/Genera anteprima/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Genera anteprima/i));

    await waitFor(() => {
      expect(screen.getByText(/Pronto per l'esportazione/i)).toBeInTheDocument();
    });
  });
});

describe('CML-636B CanonicalDocumentTab — print control', () => {
  beforeEach(() => resetStore());

  it('disables print before preview is generated', async () => {
    const archive = createEmptyDocumentArchive();
    const { doc } = makeFullDocument(archive);
    resetStore(archive);

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Stampa o salva in PDF/i })).toBeDisabled();
    });
  });

  it('enables print after valid preview', async () => {
    const archive = createEmptyDocumentArchive();
    const { doc } = makeFullDocument(archive);
    resetStore(archive);

    const printMock = mockPrintWindow();

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    await waitFor(() => {
      expect(screen.getByText(/Genera anteprima/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Genera anteprima/i));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Stampa o salva in PDF/i })).toBeEnabled();
    });

    printMock.mockRestore();
  });

  it('re-validates at print time', async () => {
    const archive = createEmptyDocumentArchive();
    const { doc } = makeFullDocument(archive);
    resetStore(archive);

    const printMock = mockPrintWindow();

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    await waitFor(() => {
      expect(screen.getByText(/Genera anteprima/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Genera anteprima/i));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Stampa o salva in PDF/i })).toBeEnabled();
    });

    resetStore({ ...archive, documents: archive.documents.map(d => ({ ...d, status: 'archived' })) });

    fireEvent.click(screen.getByRole('button', { name: /Stampa o salva in PDF/i }));

    await waitFor(() => {
      expect(screen.getByText(/archiviato/i)).toBeInTheDocument();
    });

    printMock.mockRestore();
  });
});

describe('CML-636B CanonicalDocumentTab — preview invalidation', () => {
  beforeEach(() => resetStore());

  it('marks preview stale after version change', async () => {
    const archive = createEmptyDocumentArchive();
    const { doc } = makeFullDocument(archive);
    resetStore(archive);

    const printMock = mockPrintWindow();

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    await waitFor(() => {
      expect(screen.getByText(/Genera anteprima/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Genera anteprima/i));

    await waitFor(() => {
      expect(screen.getByText(/Anteprima pronta/i)).toBeInTheDocument();
    });

    const select = await screen.findByRole('combobox', { name: /Seleziona versione/i });
    fireEvent.change(select, { target: { value: 'other-version' } });

    await waitFor(() => {
      expect(screen.queryByText(/L'anteprima non è più aggiornata/i)).toBeInTheDocument();
    });

    printMock.mockRestore();
  });
});

describe('CML-636B CanonicalDocumentTab — archived document', () => {
  beforeEach(() => resetStore());

  it('renders archived document in read-only mode', async () => {
    const archive = createEmptyDocumentArchive();
    const { doc } = makeFullDocument(archive, { status: 'archived' });
    resetStore(archive);

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    await waitFor(() => {
      expect(screen.getByText(/Il documento è archiviato/i)).toBeInTheDocument();
    });
  });

  it('blocks print for archived documents', async () => {
    const archive = createEmptyDocumentArchive();
    const { doc } = makeFullDocument(archive, { status: 'archived' });
    resetStore(archive);

    const printMock = mockPrintWindow();

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    await waitFor(() => {
      expect(screen.getByText(/Genera anteprima/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Genera anteprima/i));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Stampa o salva in PDF/i })).toBeDisabled();
    });

    printMock.mockRestore();
  });
});

describe('CML-636B CanonicalDocumentTab — no HTML download', () => {
  beforeEach(() => resetStore());

  it('does not render a Scarica HTML button', async () => {
    const archive = createEmptyDocumentArchive();
    const { doc } = makeFullDocument(archive);
    resetStore(archive);

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Scarica HTML/i })).not.toBeInTheDocument();
    });
  });
});

describe('CML-636B CanonicalDocumentTab — JSON archive preserved', () => {
  beforeEach(() => resetStore());

  it('renders the Archivio JSON button independently of preview state', async () => {
    const archive = createEmptyDocumentArchive();
    const { doc } = makeFullDocument(archive);
    resetStore(archive);

    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Archivio JSON/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Archivio JSON/i }));

    expect(createObjectURL).toHaveBeenCalled();

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
  });
});

describe('CML-636B CanonicalDocumentTab — accessibility', () => {
  beforeEach(() => resetStore());

  it('provides aria-live region for validation summary', async () => {
    const archive = createEmptyDocumentArchive();
    const { doc } = makeFullDocument(archive, { title: '' });
    resetStore(archive);

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });

  it('provides aria-label for version selector', async () => {
    const archive = createEmptyDocumentArchive();
    const { doc } = makeFullDocument(archive);
    resetStore(archive);

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    await waitFor(() => {
      const select = screen.getByRole('combobox', { name: /Seleziona versione/i });
      expect(select).toBeInTheDocument();
    });
  });

  it('marks decorative Printer icon as aria-hidden', async () => {
    const archive = createEmptyDocumentArchive();
    const { doc } = makeFullDocument(archive);
    resetStore(archive);

    render(<CanonicalDocumentTab />);
    openDocument(doc);

    await waitFor(() => {
      expect(screen.getByText(/Genera anteprima/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Genera anteprima/i));

    await waitFor(() => {
      const printBtn = screen.getByRole('button', { name: /Stampa o salva in PDF/i });
      const icon = printBtn.querySelector('svg[data-lucide="printer"]');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
