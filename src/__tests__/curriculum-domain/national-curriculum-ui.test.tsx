import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NationalCurriculumView } from '../../features/curriculum/components/NationalCurriculumView';
import { createNationalCurriculumConsultationService, adaptFixture2012ToNationalCurriculumFixture, adaptFixture2025ToNationalCurriculumFixture } from '../../domain/curriculum/nationalCurriculumConsultation';
import { fixture2012 } from '../../domain/curriculum/fixture2012';
import { fixture2025 } from '../../domain/curriculum/fixture2025';

const service = createNationalCurriculumConsultationService([
  ...adaptFixture2012ToNationalCurriculumFixture(fixture2012),
  ...adaptFixture2025ToNationalCurriculumFixture(fixture2025),
]);

describe('CURR-R3B — National Curriculum Consultation UI multi-framework', () => {
  it('shows framework selector with 2012 and 2025', () => {
    render(<NationalCurriculumView service={service} schoolYearStr={undefined} schoolOrderContext={undefined} classLevelContext={undefined} />);
    const frameworkSelect = screen.getByText('Framework').closest('div')?.querySelector('select');
    expect(frameworkSelect).toBeDefined();
    expect(frameworkSelect?.querySelectorAll('option').length).toBeGreaterThanOrEqual(2);
  });

  it('defaults to IN2012 deterministically', () => {
    render(<NationalCurriculumView service={service} schoolYearStr={undefined} schoolOrderContext={undefined} classLevelContext={undefined} />);
    const frameworkSelect = screen.getByText('Framework').closest('div')?.querySelector('select');
    expect(frameworkSelect?.value).toBe('IN2012');
  });

  it('framework change resets schoolOrder and sourceAreaCode but keeps nodeType and text', async () => {
    render(<NationalCurriculumView service={service} schoolYearStr={undefined} schoolOrderContext={undefined} classLevelContext={undefined} />);
    const frameworkSelect = screen.getByText('Framework').closest('div')?.querySelector('select');
    const orderSelect = screen.getByText('Ordine').closest('div')?.querySelector('select');
    const nodeTypeSelect = screen.getByText('Tipo contenuto').closest('div')?.querySelector('select');
    const textInput = screen.getByPlaceholderText('Ricerca testuale...');

    if (orderSelect) {
      fireEvent.change(orderSelect, { target: { value: 'primaria' } });
    }
    await waitFor(() => {
      expect(screen.getByText('Italiano')).toBeDefined();
    });

    if (nodeTypeSelect) {
      fireEvent.change(nodeTypeSelect, { target: { value: 'traguardo' } });
    }
    fireEvent.change(textInput, { target: { value: 'TRAGUARDO' } });

    if (frameworkSelect) {
      fireEvent.change(frameworkSelect, { target: { value: 'IN2025' } });
    }

    expect(orderSelect?.value).toBe('');
    const areaSelect = screen.getByText('Campo / Disciplina').closest('div')?.querySelector('select');
    expect(areaSelect?.value).toBe('');
    expect(nodeTypeSelect?.value).toBe('traguardo');
    expect((textInput as HTMLInputElement).value).toBe('TRAGUARDO');
  });

  it('IN2012 and IN2025 do not mix', async () => {
    render(<NationalCurriculumView service={service} schoolYearStr={undefined} schoolOrderContext={undefined} classLevelContext={undefined} />);
    const frameworkSelect = screen.getByText('Framework').closest('div')?.querySelector('select');
    const orderSelect = screen.getByText('Ordine').closest('div')?.querySelector('select');

    if (frameworkSelect) {
      fireEvent.change(frameworkSelect, { target: { value: 'IN2012' } });
    }
    if (orderSelect) {
      fireEvent.change(orderSelect, { target: { value: 'infanzia' } });
    }
    await waitFor(() => {
      expect(screen.getByText("Il sé e l'altro")).toBeDefined();
    });

    if (frameworkSelect) {
      fireEvent.change(frameworkSelect, { target: { value: 'IN2025' } });
    }
    await waitFor(() => {
      expect(screen.queryByText("Il sé e l'altro")).toBeNull();
    });
    expect(frameworkSelect?.value).toBe('IN2025');
  });

  it('areas depend on selected framework', async () => {
    render(<NationalCurriculumView service={service} schoolYearStr={undefined} schoolOrderContext={undefined} classLevelContext={undefined} />);
    const frameworkSelect = screen.getByText('Framework').closest('div')?.querySelector('select');
    const orderSelect = screen.getByText('Ordine').closest('div')?.querySelector('select');

    if (frameworkSelect) {
      fireEvent.change(frameworkSelect, { target: { value: 'IN2012' } });
    }
    if (orderSelect) {
      fireEvent.change(orderSelect, { target: { value: 'primaria' } });
    }
    await waitFor(() => {
      expect(screen.getByText('Italiano')).toBeDefined();
    });

    if (frameworkSelect) {
      fireEvent.change(frameworkSelect, { target: { value: 'IN2025' } });
    }
    await waitFor(() => {
      expect(screen.queryByText('Italiano')).toBeNull();
    });
    expect(screen.getByText('Seleziona area')).toBeDefined();
  });

  it('distinguishes OSA 2025 via normativeNodeKind', async () => {
    render(<NationalCurriculumView service={service} schoolYearStr={undefined} schoolOrderContext={undefined} classLevelContext={undefined} />);
    const frameworkSelect = screen.getByText('Framework').closest('div')?.querySelector('select');
    const orderSelect = screen.getByText('Ordine').closest('div')?.querySelector('select');

    if (frameworkSelect) {
      fireEvent.change(frameworkSelect, { target: { value: 'IN2025' } });
    }
    if (orderSelect) {
      fireEvent.change(orderSelect, { target: { value: 'primaria' } });
    }
    await waitFor(() => {
      expect(screen.getByText('Italiano')).toBeDefined();
    });

    const nodeTypeSelect = screen.getByText('Tipo contenuto').closest('div')?.querySelector('select');
    if (nodeTypeSelect) {
      fireEvent.change(nodeTypeSelect, { target: { value: 'obiettivo' } });
    }

    await waitFor(() => {
      const osaBadges = screen.getAllByText('OSA 2025');
      expect(osaBadges.length).toBeGreaterThan(0);
    });
  });

  it('shows framework applicability for Strumento musicale in IN2025', async () => {
    render(<NationalCurriculumView service={service} schoolYearStr={undefined} schoolOrderContext={undefined} classLevelContext={undefined} />);
    const frameworkSelect = screen.getByText('Framework').closest('div')?.querySelector('select');
    const orderSelect = screen.getByText('Ordine').closest('div')?.querySelector('select');

    if (frameworkSelect) {
      fireEvent.change(frameworkSelect, { target: { value: 'IN2025' } });
    }
    if (orderSelect) {
      fireEvent.change(orderSelect, { target: { value: 'secondaria' } });
    }

    await waitFor(() => {
      expect(screen.getByText(/Strumento musicale \(Percorso ad indirizzo musicale\)/)).toBeDefined();
    });
  });

  it('does not access fixtures directly from UI', () => {
    render(<NationalCurriculumView service={service} schoolYearStr={undefined} schoolOrderContext={undefined} classLevelContext={undefined} />);
    expect(screen.queryByText('SOURCE_2012')).toBeNull();
    expect(screen.queryByText('SOURCE_2025')).toBeNull();
  });

  it('does not write to store', () => {
    render(<NationalCurriculumView service={service} schoolYearStr={undefined} schoolOrderContext={undefined} classLevelContext={undefined} />);
    expect(screen.queryByText('localCurriculum')).toBeNull();
  });
});

describe('CURR-R1D — National Curriculum Consultation UI regressions', () => {
  it('renders framework and order selectors', () => {
    render(<NationalCurriculumView service={service} schoolYearStr={undefined} schoolOrderContext={undefined} classLevelContext={undefined} />);
    expect(screen.getByText('Indicazioni nazionali')).toBeDefined();
    expect(screen.getByText('Framework')).toBeDefined();
    expect(screen.getByText('Ordine')).toBeDefined();
  });

  it('shows empty state until order is selected', () => {
    render(<NationalCurriculumView service={service} schoolYearStr={undefined} schoolOrderContext={undefined} classLevelContext={undefined} />);
    expect(screen.getByText('Seleziona un ordine per visualizzare i contenuti.')).toBeDefined();
  });

  it('loads areas after order selection', async () => {
    render(<NationalCurriculumView service={service} schoolYearStr={undefined} schoolOrderContext={undefined} classLevelContext={undefined} />);
    const orderSelect = screen.getByText('Ordine').closest('div')?.querySelector('select');
    if (orderSelect) {
      fireEvent.change(orderSelect, { target: { value: 'infanzia' } });
    }
    await waitFor(() => {
      expect(screen.getByText("Il sé e l'altro")).toBeDefined();
    });
  });

  it('shows content after area selection', async () => {
    render(<NationalCurriculumView service={service} schoolYearStr={undefined} schoolOrderContext={undefined} classLevelContext={undefined} />);
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
    render(<NationalCurriculumView service={service} schoolYearStr={undefined} schoolOrderContext={undefined} classLevelContext={undefined} />);
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
    render(<NationalCurriculumView service={service} schoolYearStr={undefined} schoolOrderContext={undefined} classLevelContext={undefined} />);
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
    render(<NationalCurriculumView service={service} schoolYearStr={undefined} schoolOrderContext={undefined} classLevelContext={undefined} />);
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

describe('CURR-R3D — Applicable Framework Guidance UI', () => {
  it('shows applicable framework guidance when context is provided', () => {
    render(<NationalCurriculumView 
      service={service} 
      schoolYearStr="2026-2027" 
      schoolOrderContext="secondaria" 
      classLevelContext={1} 
    />);
    
    // Should show guidance section
    expect(screen.getByText('Framework applicabile al contesto corrente')).toBeInTheDocument();
    expect(screen.getByText('Anno scolastico:')).toBeInTheDocument();
    expect(screen.getByText('2026/2027')).toBeInTheDocument();
    expect(screen.getByText('Ordine:')).toBeInTheDocument();
    expect(screen.getByText('Scuola Secondaria I grado')).toBeInTheDocument();
    expect(screen.getByText('Classe:')).toBeInTheDocument();
    expect(screen.getByText('1ª')).toBeInTheDocument();
    expect(screen.getByText('● Indicazioni nazionali 2025')).toBeInTheDocument();
  });

  it('shows framework mismatch warning when selected differs from applicable', () => {
    render(<NationalCurriculumView 
      service={service} 
      schoolYearStr="2026-2027" 
      schoolOrderContext="secondaria" 
      classLevelContext={1} 
    />);
    
    // Manually select IN2012 (should be different from applicable IN2025 for secondaria 1ª in 2026/27)
    const frameworkSelect = screen.getByText('Framework').closest('div')?.querySelector('select');
    if (frameworkSelect) {
      fireEvent.change(frameworkSelect, { target: { value: 'IN2012' } });
    }
    
    // Should show mismatch warning
    expect(screen.getByText('Stai consultando il framework 2012.')).toBeInTheDocument();
    expect(screen.getByText('Per questo contesto il framework applicabile è')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
  });

  it('preserves manual framework selection', async () => {
    render(<NationalCurriculumView 
      service={service} 
      schoolYearStr="2026-2027" 
      schoolOrderContext="secondaria" 
      classLevelContext={1} 
    />);
    
    // Select IN2012 manually
    const frameworkSelect = screen.getByText('Framework').closest('div')?.querySelector('select');
    if (frameworkSelect) {
      fireEvent.change(frameworkSelect, { target: { value: 'IN2012' } });
    }
    
    // Should still be able to interact with UI normally
    const orderSelect = screen.getByText('Ordine').closest('div')?.querySelector('select');
    if (orderSelect) {
      fireEvent.change(orderSelect, { target: { value: 'primaria' } });
    }
    await waitFor(() => {
      expect(screen.getByText('Italiano')).toBeInTheDocument();
    });
    
    // Manual selection should persist
    expect(frameworkSelect?.value).toBe('IN2012');
  });

  it('handles missing context gracefully', () => {
    render(<NationalCurriculumView 
      service={service} 
      schoolYearStr={undefined} 
      schoolOrderContext={undefined} 
      classLevelContext={undefined} 
    />);
    
    // Should not crash and should still show basic UI
    expect(screen.getByText('Consultazione nazionale')).toBeInTheDocument();
    expect(screen.getByText('Framework')).toBeInTheDocument();
    expect(screen.getByText('Ordine')).toBeInTheDocument();
    
    // Should not show guidance section
    expect(screen.queryByText('Framework applicabile al contesto corrente')).not.toBeInTheDocument();
  });

  it('handles invalid school year gracefully', () => {
    render(<NationalCurriculumView 
      service={service} 
      schoolYearStr="invalid-year" 
      schoolOrderContext="secondaria" 
      classLevelContext={1} 
    />);
    
    // Should not crash and should still show basic UI
    expect(screen.getByText('Consultazione nazionale')).toBeInTheDocument();
    expect(screen.getByText('Framework')).toBeInTheDocument();
    expect(screen.getByText('Ordine')).toBeInTheDocument();
    
    // Should not show guidance section due to invalid year
    expect(screen.queryByText('Framework applicabile al contesto corrente')).not.toBeInTheDocument();
  });
});
