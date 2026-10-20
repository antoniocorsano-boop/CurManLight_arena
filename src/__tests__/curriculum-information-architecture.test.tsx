import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { createEmptyInstitutionalArchive, getA07InstitutionalDocumentRead } from '../domain/institution';
import { ProfessionalCurriculumReader } from '../features/curriculum/components/ProfessionalCurriculumReader';

type HandoffContext = {
  disciplineId: string;
  disciplineLabel: string;
  order: string;
  annualityId: string;
  annualityTitle: string;
  classLabel: string;
  targetClass: string;
  nucleus: string;
  references: string[];
};

type ReaderCallbacks = {
  onUseInPlanning?: (context: HandoffContext) => void;
  canUseInPlanning?: (context: HandoffContext) => boolean;
  onOpenReview?: (context: HandoffContext) => void;
  canOpenReview?: (context: HandoffContext) => boolean;
};

function renderReader(options: ReaderCallbacks = {}) {
  return render(
    <ProfessionalCurriculumReader
      institutionalProfile={getA07InstitutionalDocumentRead(createEmptyInstitutionalArchive())}
      onUseInPlanning={options.onUseInPlanning ?? vi.fn()}
      canUseInPlanning={options.canUseInPlanning ?? (() => true)}
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

  it('renders canonical content collections as scannable lists', async () => {
    const user = userEvent.setup();
    renderReader();

    await user.click(screen.getByRole('button', { name: 'Tecnologia' }));

    const firstCard = document.querySelector('[data-curricolo-unit-card]');
    expect(firstCard).not.toBeNull();
    expect(firstCard?.querySelectorAll('[data-curricolo-detail-list]').length).toBeGreaterThan(0);
    expect(firstCard?.querySelectorAll('[data-curricolo-detail-list] li').length).toBeGreaterThan(1);
  });

  it('uses teacher-facing copy when Trama has no validated professional links', async () => {
    const user = userEvent.setup();
    renderReader();

    await user.click(screen.getByRole('button', { name: 'Tecnologia' }));
    await user.click(screen.getAllByRole('button', { name: 'Vedi nella Trama' })[0]);

    expect(screen.getByText('Non sono ancora disponibili raccordi validati per questo contenuto.')).toBeInTheDocument();
    expect(screen.getByText('I collegamenti tra annualità o discipline saranno mostrati qui solo dopo la validazione professionale.')).toBeInTheDocument();
    expect(screen.queryByText(/artefatto ha.*stato proposto/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/inferenze o promozioni implicite/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/link proposto/i)).not.toBeInTheDocument();
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

  it('does not expose the planning handoff for AI literacy', async () => {
    const user = userEvent.setup();
    renderReader({ canUseInPlanning: (context) => context.disciplineId !== 'ai-literacy' });

    await user.click(screen.getByRole('button', { name: 'Alfabetizzazione all’intelligenza artificiale' }));
    await user.click(screen.getByRole('button', { name: 'Scuola secondaria di primo grado' }));
    await user.click(screen.getAllByText('Altre azioni')[0]);

    expect(screen.queryByRole('button', { name: 'Usa in Progettazione' })).not.toBeInTheDocument();
  });

  it('passes machine order and native class identifiers to contextual handoffs', async () => {
    const user = userEvent.setup();
    const onUseInPlanning = vi.fn<(context: HandoffContext) => void>();
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
