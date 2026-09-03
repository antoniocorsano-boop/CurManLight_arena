import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { DM221_2025_SOURCE } from '../domain/curriculum/national/dm2212025';
import { FinalPublicationSourceFingerprintPanel } from '../features/curriculum/components/FinalPublicationSourceFingerprintPanel';

describe('Final-publication source fingerprint panel', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('requires explicit source-origin attestation and points to the registered final MIM PDF', () => {
    render(<FinalPublicationSourceFingerprintPanel />);

    expect(screen.getByText('Verifica l’impronta del PDF finale MIM')).toBeTruthy();
    expect(screen.getByRole('checkbox')).toBeTruthy();
    expect(screen.getByLabelText('Seleziona PDF ufficiale per impronta SHA-256')).toBeTruthy();
    expect(screen.getByLabelText('Importa ricevuta impronta sorgente')).toBeTruthy();

    const link = screen.getByRole('link', { name: 'Apri il PDF ufficiale MIM' });
    expect(link.getAttribute('href')).toBe(DM221_2025_SOURCE.officialCurriculumVolume.url);
  });
});
