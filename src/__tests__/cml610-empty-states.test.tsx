import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RevisioneTab } from '../features/curriculum/components/RevisioneTab';
import { DocumentExportHistory } from '../features/documents/components/DocumentExportHistory';

vi.mock('../store/useCurriculumStore', () => ({
  useCurriculumStore: Object.assign(
    () => ({
      decisions: {},
      customTexts: {},
      activeRevisionFilter: 'all',
      setActiveRevisionFilter: vi.fn(),
      setDecision: vi.fn(),
      resetDecision: vi.fn(),
      setCustomText: vi.fn(),
    }),
    {
      getState: () => ({
        decisions: {},
        customTexts: {},
        activeRevisionFilter: 'all',
      }),
    }
  ),
}));

describe('CML-610 — Empty states operational clarity', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('R1: RevisioneTab list mode — no matching proposals', () => {
    it('shows empty state when filtered list is empty in list mode', () => {
      render(
        <RevisioneTab
          currentDisciplineProps={[]}
          currentDisciplineDecided={0}
          revisioneMode="list"
          setRevisioneMode={vi.fn()}
          revisioneWizardIndex={0}
          setRevisioneWizardIndex={vi.fn()}
        />
      );
      expect(screen.getByText('Nessuna variazione da mostrare')).toBeInTheDocument();
      expect(screen.getByText(/Tutte le schede per questa categoria/)).toBeInTheDocument();
    });

    it('does not show empty state when proposals exist in list mode', () => {
      render(
        <RevisioneTab
          currentDisciplineProps={[
            { id: 'prop-1', focus: 'Test', oldText: 'Old', newText: 'New' },
          ]}
          currentDisciplineDecided={0}
          revisioneMode="list"
          setRevisioneMode={vi.fn()}
          revisioneWizardIndex={0}
          setRevisioneWizardIndex={vi.fn()}
        />
      );
      expect(screen.queryByText('Nessuna variazione da mostrare')).not.toBeInTheDocument();
    });
  });

  describe('R1: DocumentExportHistory — already implemented empty state', () => {
    it('shows export empty state when no events', () => {
      render(
        <DocumentExportHistory
          events={[]}
          onClearHistory={vi.fn()}
        />
      );
      expect(screen.getByText('Non hai ancora prodotto documenti in questa sessione.')).toBeInTheDocument();
    });

    it('does not show empty state when events exist', () => {
      render(
        <DocumentExportHistory
          events={[
            {
              id: '1',
              documentType: 'uda',
              format: 'PDF',
              label: 'Test UDA',
              exportedAt: '2026-01-01T00:00:00Z',
              coherence: 'current',
            },
          ]}
          onClearHistory={vi.fn()}
        />
      );
      expect(screen.queryByText('Non hai ancora prodotto documenti in questa sessione.')).not.toBeInTheDocument();
    });
  });
});
