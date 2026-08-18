import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NationalCurriculumView } from '../../features/curriculum/components/NationalCurriculumView';
import { createNationalCurriculumConsultationService, adaptFixture2012ToNationalCurriculumFixture } from '../../domain/curriculum/nationalCurriculumConsultation';
import { fixture2012 } from '../../domain/curriculum/fixture2012';

const service = createNationalCurriculumConsultationService(
  adaptFixture2012ToNationalCurriculumFixture(fixture2012)
);

describe('CURR-R1D — National Curriculum Consultation UI', () => {
  it('renders framework and order selectors', () => {
    render(<NationalCurriculumView service={service} />);
    expect(screen.getByText('Indicazioni nazionali')).toBeDefined();
    expect(screen.getByText('Framework')).toBeDefined();
    expect(screen.getByText('Ordine')).toBeDefined();
  });

  it('shows empty state until order is selected', () => {
    render(<NationalCurriculumView service={service} />);
    expect(screen.getByText('Seleziona un ordine per visualizzare i contenuti.')).toBeDefined();
  });

  it('loads areas after order selection', async () => {
    render(<NationalCurriculumView service={service} />);
    const orderSelect = screen.getByText('Ordine').closest('div')?.querySelector('select');
    if (orderSelect) {
      fireEvent.change(orderSelect, { target: { value: 'infanzia' } });
    }
    await waitFor(() => {
      expect(screen.getByText("Il sé e l'altro")).toBeDefined();
    });
  });

  it('shows content after area selection', async () => {
    render(<NationalCurriculumView service={service} />);
    const orderSelect = screen.getByText('Ordine').closest('div')?.querySelector('select');
    if (orderSelect) {
      fireEvent.change(orderSelect, { target: { value: 'infanzia' } });
    }
    await waitFor(() => {
      expect(screen.getByText("Il sé e l'altro")).toBeDefined();
    });
    const areaSelect = screen.getByText('Campo / Disciplina').closest('div')?.querySelector('select');
    if (areaSelect) {
      fireEvent.change(areaSelect, { target: { value: 'in2012-infanzia-se-altro' } });
    }
    await waitFor(() => {
      expect(screen.getByText('Traguardo - Il sé e l\'altro')).toBeDefined();
    });
  });

  it('filters by nodeType', async () => {
    render(<NationalCurriculumView service={service} />);
    const orderSelect = screen.getByText('Ordine').closest('div')?.querySelector('select');
    if (orderSelect) {
      fireEvent.change(orderSelect, { target: { value: 'primaria' } });
    }
    await waitFor(() => {
      expect(screen.getByText('Italiano')).toBeDefined();
    });
    const nodeTypeSelect = screen.getByText('Tipo contenuto').closest('div')?.querySelector('select');
    if (nodeTypeSelect) {
      fireEvent.change(nodeTypeSelect, { target: { value: 'traguardo' } });
    }
    await waitFor(() => {
      expect(screen.getByText('Traguardo - fine primaria')).toBeDefined();
    });
  });

  it('filters by case-insensitive text', async () => {
    render(<NationalCurriculumView service={service} />);
    const orderSelect = screen.getByText('Ordine').closest('div')?.querySelector('select');
    if (orderSelect) {
      fireEvent.change(orderSelect, { target: { value: 'primaria' } });
    }
    await waitFor(() => {
      expect(screen.getByText('Italiano')).toBeDefined();
    });
    const textInput = screen.getByPlaceholderText('Ricerca testuale...');
    fireEvent.change(textInput, { target: { value: 'TRAGUARDO' } });
    await waitFor(() => {
      expect(screen.getByText('Traguardo - fine primaria')).toBeDefined();
    });
  });

  it('resets areaCode when schoolOrder changes', async () => {
    render(<NationalCurriculumView service={service} />);
    const orderSelect = screen.getByText('Ordine').closest('div')?.querySelector('select');
    if (orderSelect) {
      fireEvent.change(orderSelect, { target: { value: 'infanzia' } });
    }
    await waitFor(() => {
      expect(screen.getByText("Il sé e l'altro")).toBeDefined();
    });
    const areaSelect = screen.getByText('Campo / Disciplina').closest('div')?.querySelector('select');
    if (areaSelect) {
      fireEvent.change(areaSelect, { target: { value: 'in2012-infanzia-se-altro' } });
    }
    await waitFor(() => {
      expect(screen.getByText('Traguardo - Il sé e l\'altro')).toBeDefined();
    });
    if (orderSelect) {
      fireEvent.change(orderSelect, { target: { value: 'primaria' } });
    }
    await waitFor(() => {
      expect(screen.queryByText("Il sé e l'altro")).toBeNull();
    });
  });
});
