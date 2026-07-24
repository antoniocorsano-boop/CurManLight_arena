import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UdaDetailModal } from '../features/progettazione/components/UdaModals';
import type { UdaModel } from '../types/curriculum';

function makeUda(overrides: Partial<UdaModel> & { id: string; title: string }): UdaModel {
  return {
    discipline: 'italiano',
    order: 'primaria',
    period: 'I semestre',
    hours: 36,
    status: 'bozza',
    traguardi: [],
    obiettivi: [],
    evidenze: [],
    realTask: '',
    notes: '',
    createdAt: '2026-07-20T10:00:00.000Z',
    ...overrides,
  };
}

const baseProps = {
  selectedUda: null as UdaModel | null,
  setSelectedUda: vi.fn(),
  handleDownloadScormManifest: vi.fn(),
  copyUdaForRegister: vi.fn(),
  copyUdaTextLocal: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('UdaDetailModal — context and accessibility', () => {

  it('renders nothing when selectedUda is null', () => {
    render(<UdaDetailModal {...baseProps} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders the dialog when selectedUda is provided', () => {
    render(<UdaDetailModal {...baseProps} selectedUda={makeUda({ id: 'u1', title: 'Test UDA' })} />);
    expect(screen.getByRole('dialog')).toBeDefined();
  });

  it('displays the UDA title', () => {
    render(<UdaDetailModal {...baseProps} selectedUda={makeUda({ id: 'u1', title: 'Rinascimento' })} />);
    expect(screen.getByText('Rinascimento')).toBeDefined();
  });

  it('displays the discipline badge', () => {
    render(<UdaDetailModal {...baseProps} selectedUda={makeUda({ id: 'u1', title: 'T', discipline: 'matematica' })} />);
    expect(screen.getByText('MATEMATICA')).toBeDefined();
  });

  it('displays the status badge', () => {
    render(<UdaDetailModal {...baseProps} selectedUda={makeUda({ id: 'u1', title: 'T', status: 'in revisione' })} />);
    expect(screen.getByText('In revisione')).toBeDefined();
  });

  it('displays the status badge for bozza', () => {
    render(<UdaDetailModal {...baseProps} selectedUda={makeUda({ id: 'u1', title: 'T', status: 'bozza' })} />);
    expect(screen.getByText('Bozza')).toBeDefined();
  });

  it('displays the status badge for pronta per confronto', () => {
    render(<UdaDetailModal {...baseProps} selectedUda={makeUda({ id: 'u1', title: 'T', status: 'pronta per confronto' })} />);
    expect(screen.getByText('Pronta')).toBeDefined();
  });

  it('displays the order', () => {
    render(<UdaDetailModal {...baseProps} selectedUda={makeUda({ id: 'u1', title: 'T', order: 'secondaria' })} />);
    expect(screen.getByText('SECONDARIA')).toBeDefined();
  });

  it('displays updatedAt when present instead of createdAt', () => {
    const uda = makeUda({ id: 'u1', title: 'T', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-07-24T12:00:00.000Z' });
    render(<UdaDetailModal {...baseProps} selectedUda={uda} />);
    expect(screen.getByText('Ultimo Aggiornamento')).toBeDefined();
    expect(screen.getByText('2026-07-24T12:00:00.000Z')).toBeDefined();
  });

  it('displays Data Creazione when updatedAt is absent', () => {
    const uda = makeUda({ id: 'u1', title: 'T', createdAt: '2026-01-01T00:00:00.000Z' });
    render(<UdaDetailModal {...baseProps} selectedUda={uda} />);
    expect(screen.getByText('Data Creazione')).toBeDefined();
    expect(screen.getByText('2026-01-01T00:00:00.000Z')).toBeDefined();
  });

  it('close button has aria-label', () => {
    render(<UdaDetailModal {...baseProps} selectedUda={makeUda({ id: 'u1', title: 'T' })} />);
    const closeBtn = screen.getByRole('button', { name: /chiudi dettaglio uda/i });
    expect(closeBtn).toBeDefined();
  });

  it('clicking close button calls setSelectedUda with null', () => {
    const setSelectedUda = vi.fn();
    render(<UdaDetailModal {...baseProps} selectedUda={makeUda({ id: 'u1', title: 'T' })} setSelectedUda={setSelectedUda} />);
    fireEvent.click(screen.getByRole('button', { name: /chiudi dettaglio uda/i }));
    expect(setSelectedUda).toHaveBeenCalledWith(null);
  });

  it('pressing Escape closes the modal', () => {
    const setSelectedUda = vi.fn();
    render(<UdaDetailModal {...baseProps} selectedUda={makeUda({ id: 'u1', title: 'T' })} setSelectedUda={setSelectedUda} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(setSelectedUda).toHaveBeenCalledWith(null);
  });

  it('close button receives focus on mount', () => {
    render(<UdaDetailModal {...baseProps} selectedUda={makeUda({ id: 'u1', title: 'T' })} />);
    const closeBtn = screen.getByRole('button', { name: /chiudi dettaglio uda/i });
    expect(document.activeElement).toBe(closeBtn);
  });

  it('does not render a "Chiudi" button in the footer', () => {
    render(<UdaDetailModal {...baseProps} selectedUda={makeUda({ id: 'u1', title: 'T' })} />);
    const buttons = screen.getAllByRole('button');
    const hasChiudiFooter = buttons.some((b) => b.textContent === 'Chiudi');
    expect(hasChiudiFooter).toBe(false);
  });

  it('renders SCORM, Registro, and Copia buttons', () => {
    render(<UdaDetailModal {...baseProps} selectedUda={makeUda({ id: 'u1', title: 'T' })} />);
    expect(screen.getByText('Scarica SCORM (.zip)')).toBeDefined();
    expect(screen.getByText(/Copia per Registro/)).toBeDefined();
    expect(screen.getByText('Copia Testo UDA')).toBeDefined();
  });

  it('SCORM button calls handleDownloadScormManifest with the UDA id', () => {
    const handleDownloadScormManifest = vi.fn();
    render(<UdaDetailModal {...baseProps} selectedUda={makeUda({ id: 'u-scorm', title: 'T' })} handleDownloadScormManifest={handleDownloadScormManifest} />);
    fireEvent.click(screen.getByText('Scarica SCORM (.zip)'));
    expect(handleDownloadScormManifest).toHaveBeenCalledWith('u-scorm');
  });

  it('Copia Testo button calls copyUdaTextLocal with the UDA id', () => {
    const copyUdaTextLocal = vi.fn();
    render(<UdaDetailModal {...baseProps} selectedUda={makeUda({ id: 'u-copy', title: 'T' })} copyUdaTextLocal={copyUdaTextLocal} />);
    fireEvent.click(screen.getByText('Copia Testo UDA'));
    expect(copyUdaTextLocal).toHaveBeenCalledWith('u-copy');
  });
});
