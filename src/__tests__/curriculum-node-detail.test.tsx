import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CurriculumMap } from '../features/session';
import { createCurriculumConsultationViewModel } from '../features/curriculum/components/curriculumConsultationViewModel';
import { CurriculumNodeDetail } from '../features/curriculum/components/CurriculumNodeDetail';

const curriculum: CurriculumMap = {
  tecnologia: {
    infanzia: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] },
    primaria: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] },
    secondaria: {
      traguardi: ['Orienta il proprio lavoro con strumenti tecnologici'],
      obiettivi: ['Progetta una soluzione tecnica'],
      evidenze: ['Presenta il procedimento seguito'],
      proposals: [],
    },
  },
};

describe('CURR-04 curriculum node detail', () => {
  it('shows the professional context and truthful empty states without mutation actions', () => {
    const consultation = createCurriculumConsultationViewModel(curriculum, 'secondaria', 'tecnologia');

    render(<CurriculumNodeDetail item={consultation.items[1]} evidenceItems={[]} onBack={vi.fn()} />);

    expect(screen.getByText('Obiettivo di apprendimento')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Progetta una soluzione tecnica' })).toBeInTheDocument();
    expect(screen.getByText(/Tecnologia · Secondaria di I grado/i)).toBeInTheDocument();
    expect(screen.getByText(/^Versione: Curriculum KB - Legacy \(secondaria\)$/i)).toBeInTheDocument();
    expect(screen.getByText(/Provenienza:/i)).toBeInTheDocument();
    expect(screen.getByText('Nessuna relazione curricolare registrata')).toBeInTheDocument();
    expect(screen.getByText('Nessuna fonte curricolare disponibile')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Usa nella progettazione' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /modifica|revisione|approva/i })).not.toBeInTheDocument();
  });

  it('renders only the provided evidence and canonical relations', () => {
    const consultation = createCurriculumConsultationViewModel(curriculum, 'secondaria', 'tecnologia');
    const item = consultation.items[1];
    const related = consultation.items[2];

    render(
      <CurriculumNodeDetail
        item={{ ...item, relations: [{
          id: item.node.id,
          metadata: item.node.metadata,
          fromNodeRef: { id: item.node.id, entityType: 'curriculum-node', snapshotLabel: item.node.text },
          toNodeRef: { id: related.node.id, entityType: 'curriculum-node', snapshotLabel: related.node.text },
          linkType: 'evidence-for',
          sourceRefs: [],
          origin: 'legacy',
          status: 'active',
          isVertical: false,
        }] }}
        evidenceItems={[related]}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByText('Evidenza per')).toBeInTheDocument();
    expect(screen.getByText('Presenta il procedimento seguito')).toBeInTheDocument();
    expect(screen.getByText(/solo relazioni curricolari registrate/i)).toBeInTheDocument();
  });

  it('exposes the active PLAN-02 transfer action when the existing contract is available', () => {
    const consultation = createCurriculumConsultationViewModel(curriculum, 'secondaria', 'tecnologia');
    const onUseInPlanning = vi.fn(() => ({ ok: true }));

    render(
      <CurriculumNodeDetail
        item={consultation.items[1]}
        evidenceItems={[]}
        onBack={vi.fn()}
        onUseInPlanning={onUseInPlanning}
      />,
    );

    const transfer = screen.getByRole('button', { name: 'Usa nella progettazione' });
    expect(transfer).toBeEnabled();
    transfer.click();
    expect(onUseInPlanning).toHaveBeenCalledTimes(1);
  });
});
