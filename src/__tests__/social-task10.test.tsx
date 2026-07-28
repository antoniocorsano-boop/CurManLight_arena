import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SocialTab } from '../features/social/components/SocialTab';
import type { SocialUda } from '../features/session';

function uda(id: string, title: string, overrides: Partial<SocialUda> = {}): SocialUda {
  return {
    id, title, discipline: 'scienze', order: 'primaria', period: 'Periodo locale', hours: 1,
    traguardi: [], obiettivi: [], evidenze: [], realTask: 'Attività locale', notes: '', author: 'Autore locale', likes: 0, likedByMe: false, annotations: [],
    ...overrides,
  };
}

function renderSocial(socialUdas: SocialUda[]) {
  render(<SocialTab
    selectedClassCombination="" setSelectedClassCombination={vi.fn()} classroomStudents={[]} assignedCombinations={[]} showToast={vi.fn()}
    socialUdas={socialUdas} newAnnotationInputs={{}} setNewAnnotationInputs={vi.fn()} handleLikeUda={vi.fn()} handleReuseUda={vi.fn()}
    updateSocialUdas={vi.fn()} setSelectedUdaForOutcomes={vi.fn()} setShowOutcomesModal={vi.fn()} handleAddAnnotation={vi.fn()}
  />);
}

describe('CML-633D Task 10 social metrics provenance', () => {
  it('renders missing outcomes, rating, reuse, and OSI as unavailable', () => {
    renderSocial([uda('missing', 'UDA senza esiti', { annotations: [{ author: 'Autore locale', text: 'Nota' }] })]);
    const card = screen.getByText('UDA senza esiti').closest('div.bg-white') as HTMLElement;
    expect(within(card).getAllByText('Non disponibile').length).toBeGreaterThanOrEqual(6);
    expect(card).toHaveTextContent('Riutilizzi registrati localmente: Non disponibile');
    expect(card).not.toHaveTextContent(/50%|30%|15%|5 volte|★★★★/);
    expect(card).toHaveTextContent('Non verificato');
    expect(card).not.toHaveTextContent("Approvato d'Istituto");
  });

  it('preserves actual zero values instead of replacing them with defaults', () => {
    renderSocial([uda('zero', 'UDA con zeri', {
      studentOutcomes: { avanzato: 0, intermedio: 0, base: 0, iniziale: 0 }, selfEvaluation: 0, reusedCount: 0,
    })]);
    const card = screen.getByText('UDA con zeri').closest('div.bg-white') as HTMLElement;
    expect(within(card).getAllByText('0%')).toHaveLength(5);
    expect(card).toHaveTextContent('0/5');
    expect(card).toHaveTextContent('Riutilizzi registrati localmente: 0');
  });

  it('labels seeded provenance as demonstration rather than institutional approval', () => {
    renderSocial([uda('demo', 'UDA demo', { author: 'Esempio dimostrativo (Scuola primaria)', annotations: [{ author: 'Docente dimostrativo', text: 'Nota demo' }] })]);
    expect(screen.getAllByText('Contenuto dimostrativo')).toHaveLength(2);
    expect(screen.queryByText("Approvato d'Istituto")).not.toBeInTheDocument();
  });
});
