import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { EsportazioniTab } from '../features/documents/components/EsportazioniTab';
import { createEmptyDocumentArchive } from '../domain/documents';
import { createEmptyInstitutionalArchive, getA07InstitutionalDocumentRead } from '../domain/institution';
import { useCurriculumStore } from '../store/useCurriculumStore';
import type { UdaModel } from '../types/curriculum';

function makeUda(overrides: Partial<UdaModel> = {}): UdaModel {
  return {
    id: 'uda-a07-1',
    title: 'UDA Acqua e territorio',
    discipline: 'italiano',
    order: 'secondaria',
    period: 'Primo Quadrimestre',
    hours: 12,
    status: 'bozza',
    traguardi: ['Comprendere testi narrativi'],
    obiettivi: [],
    evidenze: [],
    realTask: 'Analisi del territorio',
    notes: '',
    createdAt: '2026-07-27T08:00:00.000Z',
    ...overrides,
  };
}

function buildProps() {
  return {
    esportazioniTab: 'standard' as const,
    setEsportazioniTab: vi.fn(),
    templateDocType: 'relazione' as const,
    setTemplateDocType: vi.fn(),
    templateJsonState: {
      sections: [],
      fontFamily: 'Arial',
      fontSize: '12pt',
      lineHeight: '1.4',
      margins: 'Normali',
      showMinisterialHeader: false,
      logoLeft: '',
      logoRight: '',
      leftSignee: '',
      rightSignee: '',
    },
    setTemplateJsonState: vi.fn(),
    templateChatInput: '',
    setTemplateChatInput: vi.fn(),
    templateChatHistory: [],
    handleSendTemplateInstruction: vi.fn(),
    handleDownloadWordDefinitivo: vi.fn(),
    handleDownloadWordDocx: vi.fn(),
    handleDownloadODF: vi.fn(),
    handleDownloadCurricoloPDF: vi.fn(),
    handleCopyToClipboardFormatted: vi.fn(),
    handleDownloadTxt: vi.fn(),
    handleDownloadCml: vi.fn(),
    handleDownloadWordConfronto: vi.fn(),
    handleDownloadRichMarkdown: vi.fn(),
    handleDownloadPdfDirect: vi.fn(),
    handleClearLocalStorageWithReset: vi.fn(),
    handleGenerateProgrammazioneAnnualeDoc: vi.fn(),
    handleGenerateRelazioneDoc: vi.fn(),
    handleGenerateSpecificoGradoDoc: vi.fn(),
    targetClass: '3',
    targetSection: 'A',
    showToast: vi.fn(),
    documentExportHistory: [],
    clearDocumentExportHistory: vi.fn(),
    institutionalProfile: getA07InstitutionalDocumentRead(createEmptyInstitutionalArchive()),
    resetTemplateState: vi.fn(),
  };
}

function resetStore() {
  useCurriculumStore.setState({
    savedUda: [],
    documentArchive: createEmptyDocumentArchive(),
    institutionalArchive: createEmptyInstitutionalArchive(),
  });
}

describe('A07 canonical document creation UI', () => {
  beforeEach(() => {
    resetStore();
  });

  it('shows an explicit empty state when no documents have been created from UDA', () => {
    render(<EsportazioniTab {...buildProps()} />);

    expect(screen.getByText(/Non sono ancora presenti documenti creati dalle progettazioni/i)).toBeInTheDocument();
  });

  it('creates a canonical document from a selected UDA and shows it in the list', () => {
    useCurriculumStore.setState({ savedUda: [makeUda()] });

    render(<EsportazioniTab {...buildProps()} />);

    fireEvent.change(screen.getByLabelText(/Seleziona progettazione/i), {
      target: { value: 'uda-a07-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Crea documento/i }));

    expect(screen.getByText(/Progettazione: uda-a07-1/i)).toBeInTheDocument();
    expect(screen.getByText(/Origine/i)).toBeInTheDocument();
    expect(screen.getByText(/Versione corrente/i)).toBeInTheDocument();
  });

  it('does not create duplicates when the same UDA is created twice', () => {
    useCurriculumStore.setState({ savedUda: [makeUda()] });

    render(<EsportazioniTab {...buildProps()} />);

    fireEvent.change(screen.getByLabelText(/Seleziona progettazione/i), {
      target: { value: 'uda-a07-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Crea documento/i }));
    fireEvent.click(screen.getByRole('button', { name: /Crea documento/i }));

    expect(screen.getAllByText(/Progettazione: uda-a07-1/i)).toHaveLength(1);
    expect(screen.getByText(/Documento già presente/i)).toBeInTheDocument();
  });
});
