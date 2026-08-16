import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import UdaArtifactView from '../features/progettazione/components/UdaArtifactView';
import type { UdaModel } from '../types/curriculum';

const uda: UdaModel = {
  id: 'uda-b2-1',
  title: 'Energia e territorio',
  discipline: 'tecnologia',
  order: 'secondaria',
  period: 'Primo quadrimestre',
  hours: 12,
  status: 'bozza',
  traguardi: [],
  obiettivi: ['Comprendere i consumi'],
  evidenze: [],
  realTask: 'Mappa dei consumi',
  notes: '',
  createdAt: '2026-08-16T10:00:00.000Z',
  sourcePlanningRef: { id: 'b2-planning-1', entityType: 'teaching-design' },
  activities: ['Mappa dei consumi'],
  assessment: [],
  materials: [],
};

describe('Beta B2 UDA editor', () => {
  it('edits didactic fields and emits a save patch for the same UDA identity', () => {
    const onSave = vi.fn();
    render(<UdaArtifactView uda={uda} onSave={onSave} onBackToPlanning={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Obiettivi'), { target: { value: 'Comprendere i consumi\nArgomentare le scelte' } });
    fireEvent.change(screen.getByLabelText('Attività'), { target: { value: 'Mappa dei consumi\nDiscussione guidata' } });
    fireEvent.change(screen.getByLabelText('Valutazione'), { target: { value: 'Rubrica osservativa' } });
    fireEvent.change(screen.getByLabelText('Materiali'), { target: { value: 'Schede didattiche' } });
    fireEvent.change(screen.getByLabelText('Note'), { target: { value: 'Adattamento inclusivo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salva UDA' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      id: uda.id,
      title: uda.title,
      obiettivi: ['Comprendere i consumi', 'Argomentare le scelte'],
      activities: ['Mappa dei consumi', 'Discussione guidata'],
      assessment: ['Rubrica osservativa'],
      materials: ['Schede didattiche'],
      notes: 'Adattamento inclusivo',
      sourcePlanningRef: uda.sourcePlanningRef,
    }));
  });
});
