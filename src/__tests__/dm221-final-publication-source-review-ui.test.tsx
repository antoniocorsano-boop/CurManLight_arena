import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { FinalPublicationSourceReviewTask } from '../features/curriculum/components/FinalPublicationSourceReviewTask';
import { DM221_2025_SOURCE } from '../domain/curriculum/national/dm2212025';

describe('Final-publication source review human task', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts from the complete 868-slot register and uses the final MIM volume', () => {
    render(<FinalPublicationSourceReviewTask />);

    expect(screen.getByText(/registro contiene 868 slot strutturali/i)).toBeTruthy();
    expect(screen.getByText('Quadro generale della scuola dell’infanzia')).toBeTruthy();
    expect(screen.getByText(/Pagina stampata 53/)).toBeTruthy();
    expect(screen.getByText('868 schede nella vista corrente.')).toBeTruthy();

    const link = screen.getByRole('link', { name: 'Apri la pubblicazione finale MIM' });
    expect(link.getAttribute('href')).toBe(DM221_2025_SOURCE.officialCurriculumVolume.url);
    expect(link.getAttribute('href')).not.toContain('#page=');
    expect(link.getAttribute('href')).not.toBe(DM221_2025_SOURCE.officialLocator.pdfUrl);
  });

  it('filters by order and by canonical scope without projecting infanzia into disciplines', () => {
    render(<FinalPublicationSourceReviewTask />);

    fireEvent.change(screen.getByLabelText('Filtra per ordine scolastico'), {
      target: { value: 'primaria' },
    });
    expect(screen.getByText('Scuola primaria')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Filtra per campo o disciplina'), {
      target: { value: 'dm221-disc-tecnologia' },
    });
    expect(screen.getByText('Tecnologia')).toBeTruthy();
    expect(screen.getByText(/61 schede nella vista corrente/)).toBeTruthy();
  });

  it('blocks positive verification without explicit human attestation', () => {
    render(<FinalPublicationSourceReviewTask />);

    fireEvent.click(screen.getByRole('button', { name: 'Conferma corrispondenza' }));
    expect(screen.getByRole('status').textContent).toMatch(/Conferma prima di aver letto personalmente/);
    expect(window.localStorage.getItem('cml.dm221.final-publication.source-review.receipts.v1')).toBeNull();
  });

  it('blocks positive verification with empty attested source text', () => {
    render(<FinalPublicationSourceReviewTask />);

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Conferma corrispondenza' }));
    expect(screen.getByRole('status').textContent).toMatch(/richiede il testo effettivamente letto/);
    expect(window.localStorage.getItem('cml.dm221.final-publication.source-review.receipts.v1')).toBeNull();
  });
});
