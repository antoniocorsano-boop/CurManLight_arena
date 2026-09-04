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
      revisionArchive: { proposals: [], versions: [], decisions: [], effects: [], events: [] },
      setActiveRevisionFilter: vi.fn(),
      setDecision: vi.fn(),
      resetDecision: vi.fn(),
      setCustomText: vi.fn(),
      replaceRevisionArchive: vi.fn(),
      discipline: 'Tecnologia',
      order: 'secondaria',
    }),
    {
      getState: () => ({
        decisions: {},
        customTexts: {},
        activeRevisionFilter: 'all',
        revisionArchive: { proposals: [], versions: [], decisions: [], effects: [], events: [] },
      }),
    }
  ),
}));

describe('CML-610 — Empty states operational clarity', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('R1: RevisioneTab — lavoro del team', () => {
    it('shows a clear empty state when there is nothing to review', () => {
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
      expect(screen.getByText('Il mio lavoro nel curricolo')).toBeInTheDocument();
      expect(screen.getByText('Niente da esaminare qui')).toBeInTheDocument();
      expect(screen.getByText(/Non ci sono schede corrispondenti/)).toBeInTheDocument();
    });

    it('explains the task in teacher language when a proposal exists', () => {
      render(
        <RevisioneTab
          currentDisciplineProps={[
            { id: 'prop-1', focus: 'Tecnologia — classe prima', oldText: 'Testo precedente', newText: 'Proposta aggiornata', notes: '' },
          ]}
          currentDisciplineDecided={0}
          revisioneMode="list"
          setRevisioneMode={vi.fn()}
          revisioneWizardIndex={0}
          setRevisioneWizardIndex={vi.fn()}
        />
      );

      expect(screen.getByText('Il mio lavoro nel curricolo')).toBeInTheDocument();
      expect(screen.getByText('Perché è in revisione?')).toBeInTheDocument();
      expect(screen.getByText('Prima di scegliere, controlla tre cose')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Conferma proposta' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Propongo una modifica' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Mantieni testo precedente' })).toBeInTheDocument();
      expect(screen.getByText(/non approva e non modifica da solo il curricolo/)).toBeInTheDocument();
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
              sourceKind: 'uda',
              discipline: 'Matematica',
              order: 'primaria',
            },
          ]}
          onClearHistory={vi.fn()}
        />
      );
      expect(screen.queryByText('Non hai ancora prodotto documenti in questa sessione.')).not.toBeInTheDocument();
    });
  });
});