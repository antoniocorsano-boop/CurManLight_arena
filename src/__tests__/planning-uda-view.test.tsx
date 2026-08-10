import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import UdaArtifactView from '../features/progettazione/components/UdaArtifactView';
import type { UdaModel } from '../types/curriculum';

const uda: UdaModel = {
  id: 'uda-planning-1', title: 'Energia e territorio', discipline: 'tecnologia', order: 'secondaria',
  period: 'Primo quadrimestre', hours: 12, status: 'bozza', traguardi: [], obiettivi: ['Comprendere i consumi'],
  evidenze: [], realTask: 'Mappa dei consumi', notes: 'Nota docente', createdAt: '2026-08-10T10:00:00.000Z',
  sourcePlanningRef: { id: 'planning-1' as never, entityType: 'teaching-design' },
  curriculumReferences: [{
    nodeId: 'node-1', curriculumVersionRef: { id: 'version-1' as never, entityType: 'curriculum-version' },
    snapshot: 'Energia e territorio', provenance: { sourceArea: 'A02', qualification: 'current-curriculum', sourceEntityRef: { id: 'node-1' as never, entityType: 'curriculum-node' } }, sourceRefs: [], evidenceRefs: [],
  }],
  activities: ['Mappa dei consumi'], assessment: ['Rubrica'], materials: ['Scheda'],
};

describe('PLAN-03 canonical UDA artifact view', () => {
  it('presents the produced artifact and preserves an explicit return to Planning', () => {
    const onBack = vi.fn();
    render(<UdaArtifactView uda={uda} onBackToPlanning={onBack} />);

    expect(screen.getByRole('heading', { name: 'Energia e territorio' })).toBeInTheDocument();
    expect(screen.getByText('Derivata dalla progettazione planning-1')).toBeInTheDocument();
    expect(screen.getAllByText('Energia e territorio')).toHaveLength(2);
    expect(screen.getByText('Mappa dei consumi')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Torna alla progettazione' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
