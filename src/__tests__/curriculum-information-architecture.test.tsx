import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { createEmptyInstitutionalArchive, getA07InstitutionalDocumentRead } from '../domain/institution';
import { ProfessionalCurriculumReader } from '../features/curriculum/components/ProfessionalCurriculumReader';

function renderReader(options: {
  onUseInPlanning?: ReturnType<typeof vi.fn>;
  onOpenReview?: ReturnType<typeof vi.fn>;
  canOpenReview?: (context: unknown) => boolean;
} = {}) {
  return render(
    <ProfessionalCurriculumReader
      institutionalProfile={getA07InstitutionalDocumentRead(createEmptyInstitutionalArchive())}
      onUseInPlanning={options.onUseInPlanning ?? vi.fn()}
      onOpenReview={options.onOpenReview ?? vi.fn()}
      canOpenReview={options.canOpenReview ?? (() => false)}
      onOpenSource={vi.fn()}
    />,
  );
}

describe('G5 curricolo information architecture', () => {
  it('starts from the complete canonical institute curricolo instead of the pilot catalog', () => {
    renderReader();

    expect(screen.getByRole('heading', { name: 'Curricolo verticale d’Istituto' })).toBeInTheDocument();
    expect(screen.getByText('Validazione professionale aperta')).toBeInTheDocument();
    expect(screen.getByText('Non vigente')).toBeInTheDocument();
    expect(screen.getByText('A.S. 2026/2027')).toBeInTheDocument();
    expect(screen.queryByText('Fascicolo pilota disponibile')).not.toBeInTheDocument();
    expect(screen.queryByText('Non acquisito nella Beta')).not.toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Tecnologia' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Educazione civica' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Alfabetizzazione all’intelligenza artificiale' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'I discorsi e le parole' })).toBeInTheDocument();
  });

  it('opens a canonical discipline through discipline order and native annuality scope', async () => {
    const user = userEvent.setup();
    renderReader();

    await user.click(screen.getByRole('button', { name: 'Tecnologia' }));

    expect(screen.getByRole('button', { name: 'Scuola primaria' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Scuola secondaria di primo grado' })).toBeInTheDocument();
    expect(screen.getByText('Validazione professionale aperta')).toBeInTheDocument();
    expect(screen.getByText('Non vigente')).toBeInTheDocument();

    const firstCard = document.querySelector('[data-curricolo-unit-card]');
    expect(firstCard).not.toBeNull();
    expect(firstCard).toHaveAttribute('data-curricolo-card-density', 'compact-disclosure');
  });

  it('keeps Infanzia and grade ranges native in the professional navigation', async () => {
    const user = userEvent.setup();
    renderReader();

    await user.click(screen.getByRole('button', { name: 'I discorsi e le parole' }));
    expect(screen.getByRole('button', { name: 'Infanzia' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3–5 anni' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Classe [1-5]/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Torna al catalogo' }));
    await user.click(screen.getByRole('button', { name: 'Alfabetizzazione all’intelligenza artificiale' }));
    await user.click(screen.getByRole('button', { name: 'Scuola primaria' }));

    expect(screen.getByRole('button', { name: 'Classi I–II' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Classi III–V' })).toBeInTheDocument();
  });

  it('passes machine order and native class identifiers to contextual handoffs', async () => {
    const user = userEvent.setup();
    const onUseInPlanning = vi.fn();
    renderReader({ onUseInPlanning });

    await user.click(screen.getByRole('button', { name: 'Tecnologia' }));
    await user.click(screen.getByRole('button', { name: 'Classe II' }));
    await user.click(screen.getAllByText('Altre azioni')[0]);
    await user.click(screen.getAllByRole('button', { name: 'Usa in Progettazione' })[0]);

    expect(onUseInPlanning).toHaveBeenCalledWith(expect.objectContaining({
      disciplineId: 'tecnologia',
      order: 'secondaria',
      targetClass: '2',
    }));
  });
});
