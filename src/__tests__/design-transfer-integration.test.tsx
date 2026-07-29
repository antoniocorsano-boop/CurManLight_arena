import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DesignSelezioniPanel } from '../features/progettazione/components/DesignSelezioniPanel';
import { createDesignCurriculumSelection } from '../domain/design/constructors';
import { addSelection, createEmptyDesignStore } from '../domain/design/archive';
import type { EntityReference, EntityId } from '../domain/curriculum/identity/types';

vi.mock('../store/useCurriculumStore', () => ({
  useCurriculumStore: () => ({
    designArchive: createEmptyDesignStore(),
    savedUda: [],
  }),
}));

function makeRef(id: string, entityType = 'curriculum-node'): EntityReference {
  return { id: id as EntityId, entityType: entityType as never };
}

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