import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { TechnologySourceReviewTask } from '../features/curriculum/components/TechnologySourceReviewTask';
import { DM221_2025_SOURCE } from '../domain/curriculum/national/dm2212025';

describe('Technology source review human task', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('presents one source item at a time with human-readable context', () => {
    render(<TechnologySourceReviewTask />);

    expect(screen.getByText('Curricolo verticale · Tecnologia')).toBeTruthy();
    expect(screen.getByText('Verifica il testo nella fonte ufficiale')).toBeTruthy();
    expect(screen.getByText('Scheda 1 di 61')).toBeTruthy();
    expect(screen.getByText('0 già controllate')).toBeTruthy();
    expect(screen.getByText('Scuola primaria')).toBeTruthy();
    expect(screen.getByText(/D\.M\. 221\/2025 · pagina stampata 141/)).toBeTruthy();
    const link = screen.getByRole('link', { name: 'Apri la fonte ufficiale' });
    expect(link.getAttribute('href')).toBe(DM221_2025_SOURCE.officialCurriculumVolume.url);
    expect(link.getAttribute('href')).not.toContain('#page=');
    expect(screen.getByLabelText('Testo che leggi nella fonte')).toBeTruthy();
  });

  it('blocks a positive verification without explicit human attestation', () => {
    render(<TechnologySourceReviewTask />);

    fireEvent.click(screen.getByRole('button', { name: 'Conferma corrispondenza' }));
    expect(screen.getByRole('status').textContent).toMatch(/Conferma prima di aver letto personalmente/);
    expect(window.localStorage.getItem('cml.dm221.technology.source-review.receipts.v1')).toBeNull();
  });

  it('blocks a positive verification when the attested source text is empty', () => {
    render(<TechnologySourceReviewTask />);

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Conferma corrispondenza' }));

    expect(screen.getByRole('status').textContent).toMatch(/richiede il testo effettivamente letto/);
    expect(window.localStorage.getItem('cml.dm221.technology.source-review.receipts.v1')).toBeNull();
  });
});
