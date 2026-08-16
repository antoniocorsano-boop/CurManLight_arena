import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import UdaArtifactView from '../features/progettazione/components/UdaArtifactView';
import type { UdaModel } from '../types/curriculum';

const uda: UdaModel = {
  id: 'uda-export', title: 'UDA esportabile', discipline: 'scienze', order: 'secondaria', period: 'Primo quadrimestre', hours: 8,
  status: 'bozza', traguardi: [], obiettivi: ['Obiettivo persistito'], evidenze: [], realTask: 'Compito persistito', notes: '', createdAt: '2026-08-16',
  activities: ['Attività persistita'], assessment: ['Valutazione persistita'], materials: ['Materiale persistito'],
};

describe('B3 teacher export action', () => {
  it('exposes a labelled print/PDF action for the opened UDA', () => {
    const onExport = vi.fn();
    render(<UdaArtifactView uda={uda} onSave={vi.fn()} onExport={onExport} onBackToPlanning={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Stampa / Salva PDF' }));
    expect(onExport).toHaveBeenCalledWith(uda);
    expect(screen.getByText('Obiettivi')).toBeInTheDocument();
  });

  it('blocks export while the local draft has unsaved changes', () => {
    const onExport = vi.fn();
    render(<UdaArtifactView uda={uda} onSave={vi.fn()} onExport={onExport} onBackToPlanning={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Obiettivi'), { target: { value: 'Modifica non salvata' } });
    const exportButton = screen.getByRole('button', { name: 'Salva prima di esportare' });
    expect(exportButton).toBeDisabled();
    expect(onExport).not.toHaveBeenCalled();
  });
});
