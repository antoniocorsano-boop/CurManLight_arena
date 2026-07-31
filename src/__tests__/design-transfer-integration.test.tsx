import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DesignSelezioniPanel } from '../features/progettazione/components/DesignSelezioniPanel';
import { createEmptyDesignStore } from '../domain/design/archive';

vi.mock('../store/useCurriculumStore', () => ({
  useCurriculumStore: () => ({
    designArchive: createEmptyDesignStore(),
    savedUda: [],
  }),
}));

describe('DesignSelezioniPanel', () => {
  it('shows empty state when no selections', () => {
    render(<DesignSelezioniPanel />);
    expect(screen.getByText(/Nessuna selezione curricolare trasferita/)).toBeInTheDocument();
  });

  it('shows section heading', () => {
    render(<DesignSelezioniPanel />);
    expect(screen.getByText('Selezioni curricolari')).toBeInTheDocument();
  });

  it('has accessible region', () => {
    const { container } = render(<DesignSelezioniPanel />);
    const region = container.querySelector('[role="region"]');
    expect(region).toBeTruthy();
    expect(region?.getAttribute('aria-label')).toBe('Selezioni curricolari');
  });
});