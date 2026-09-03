import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { FinalPublicationSourceReviewWorkbench } from '../features/curriculum/components/FinalPublicationSourceReviewWorkbench';

describe('Final-publication source review portable workbench', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('exposes explicit export and import controls without changing the human review task', () => {
    render(<FinalPublicationSourceReviewWorkbench />);

    expect(screen.getByText('Metti al sicuro e riprendi le verifiche')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Esporta pacchetto' })).toBeTruthy();
    expect(screen.getByLabelText('Importa pacchetto verifiche')).toBeTruthy();
    expect(screen.getByText(/registro contiene 868 slot strutturali/i)).toBeTruthy();
  });

  it('does not fabricate an export when no validated receipt exists', () => {
    render(<FinalPublicationSourceReviewWorkbench />);

    fireEvent.click(screen.getByRole('button', { name: 'Esporta pacchetto' }));
    expect(screen.getByRole('status').textContent).toMatch(/Non ci sono ancora verifiche valide da esportare/);
    expect(window.localStorage.getItem('cml.dm221.final-publication.source-review.receipts.v1')).toBeNull();
  });
});
