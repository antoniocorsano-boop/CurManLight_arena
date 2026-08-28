import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { TechnologySourceReviewTask } from '../features/curriculum/components/TechnologySourceReviewTask';

describe('Technology source review human task', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('presents one source item at a time with human-readable context', () => {
    render(<TechnologySourceReviewTask />);

    expect(screen.getByText('Controlla Tecnologia nelle Indicazioni 2025')).toBeTruthy();
    expect(screen.getByText('0 di 61 controllati')).toBeTruthy();
    expect(screen.getByText(/D\.M\. 221\/2025 · pagina 96/)).toBeTruthy();
    expect(screen.getByLabelText('Testo che hai letto nella fonte')).toBeTruthy();
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
