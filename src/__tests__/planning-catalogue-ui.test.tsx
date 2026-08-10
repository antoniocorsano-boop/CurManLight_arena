import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PlanningCatalogue from '../features/progettazione/components/PlanningCatalogue';

const entry = {
  id: 'planning-1' as never,
  title: 'Energia e territorio',
  context: { schoolOrder: 'secondaria' as const, discipline: 'tecnologia', classLabel: '2A' },
  status: 'in_progress' as const,
  statusLabel: 'Da continuare' as const,
  updatedAt: '2026-08-02T09:00:00.000Z',
  curriculumReferenceCount: 3,
};

describe('PLAN-01 canonical planning catalogue', () => {
  it('separates resumable work from completed work and keeps UDA action distinct', () => {
    const onContinue = vi.fn();
    render(<PlanningCatalogue entries={[entry]} onContinue={onContinue} onNew={vi.fn()} disciplineLabel={(value) => value} />);

    expect(screen.getByRole('heading', { name: 'Progettazioni' })).toBeInTheDocument();
    expect(screen.getByText('In corso')).toBeInTheDocument();
    expect(screen.getByText('Energia e territorio')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continua Energia e territorio' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Apri UDA/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Continua Energia e territorio' }));
    expect(onContinue).toHaveBeenCalledWith(entry);
  });

  it('offers a new Planning action without an UDA creation action', () => {
    const onNew = vi.fn();
    render(<PlanningCatalogue entries={[]} onContinue={vi.fn()} onNew={onNew} disciplineLabel={(value) => value} />);

    fireEvent.click(screen.getByRole('button', { name: 'Nuova progettazione' }));
    expect(onNew).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /Genera UDA/i })).not.toBeInTheDocument();
  });
});
