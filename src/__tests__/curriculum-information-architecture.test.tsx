import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { createEmptyInstitutionalArchive, getA07InstitutionalDocumentRead } from '../domain/institution';
import { ProfessionalCurriculumReader } from '../features/curriculum/components/ProfessionalCurriculumReader';
import { AVAILABLE_DEPARTMENT_PUBLICATION, CURRICULUM_AREA_REGISTRY } from '../features/curriculum/data/curriculumPublicationRegistry';

function renderReader() {
  return render(
    <ProfessionalCurriculumReader
      institutionalProfile={getA07InstitutionalDocumentRead(createEmptyInstitutionalArchive())}
      onUseInPlanning={vi.fn()}
      onOpenReview={vi.fn()}
      canOpenReview={() => false}
      onOpenSource={vi.fn()}
    />,
  );
}

describe('G5 curriculum information architecture', () => {
  it('starts from a neutral catalog instead of presenting one department as the whole curriculum', () => {
    renderReader();

    expect(screen.getByRole('heading', { name: 'Catalogo curricolare' })).toBeInTheDocument();
    expect(screen.getByText('Contesto istituzionale non configurato')).toBeInTheDocument();
    expect(screen.getByText(AVAILABLE_DEPARTMENT_PUBLICATION.label)).toBeInTheDocument();
    expect(screen.getByText('Fascicolo pilota disponibile')).toBeInTheDocument();
    expect(screen.getAllByText('Non acquisito nella Beta')).toHaveLength(
      CURRICULUM_AREA_REGISTRY.filter((area) => area.availability === 'not-acquired').length,
    );
  });

  it('opens a single discipline directly while preserving department source identity', async () => {
    const user = userEvent.setup();
    renderReader();

    await user.click(screen.getByRole('button', { name: 'Tecnologia' }));

    expect(screen.getByRole('button', { name: 'Torna al catalogo' })).toBeInTheDocument();
    expect(screen.getByText(/Fonte del fascicolo:/)).toHaveTextContent(AVAILABLE_DEPARTMENT_PUBLICATION.sourceInstitutionName ?? '');
    expect(screen.getByRole('button', { name: 'Tecnologia' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/stesso fascicolo curricolare sorgente/i)).toBeInTheDocument();
    expect(screen.getByText('Riferimenti del fascicolo sorgente')).toBeInTheDocument();
    expect(screen.getByText(/non attestano, da soli, l’adozione da parte dell’istituto corrente/i)).toBeInTheDocument();

    const firstCard = document.querySelector('[data-curriculum-unit-card]');
    expect(firstCard).not.toBeNull();
    expect(firstCard).toHaveAttribute('data-curriculum-card-density', 'compact-disclosure');
    const disclosure = firstCard?.querySelector('details[data-curriculum-unit-disclosure]') as HTMLDetailsElement | null;
    expect(disclosure).not.toBeNull();
    expect(disclosure?.open).toBe(false);
  });

  it('does not expose unavailable areas as actionable publications', () => {
    renderReader();

    for (const area of CURRICULUM_AREA_REGISTRY.filter((item) => item.availability === 'not-acquired')) {
      const card = screen.getByText(area.label).closest('article');
      expect(card).not.toBeNull();
      expect(card?.querySelector('[data-open-curriculum-area]')).toBeNull();
    }
  });
});
