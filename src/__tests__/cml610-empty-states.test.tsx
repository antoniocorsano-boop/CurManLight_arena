import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { RevisioneTab } from '../features/curriculum/components/RevisioneTab';
import { DocumentExportHistory } from '../features/documents/components/DocumentExportHistory';

const revisionMock = vi.hoisted(() => ({
  activeRevisionFilter: 'all' as 'all' | 'pending' | 'approved' | 'rejected',
  decisions: {} as Record<string, 'approved' | 'custom' | 'rejected'>,
  customTexts: {} as Record<string, string>,
  setActiveRevisionFilter: vi.fn(),
  setDecision: vi.fn(),
  resetDecision: vi.fn(),
  setCustomText: vi.fn(),
}));

vi.mock('../store/useCurriculumStore', () => ({
  useCurriculumStore: Object.assign(
    () => ({
      decisions: revisionMock.decisions,
      customTexts: revisionMock.customTexts,
      activeRevisionFilter: revisionMock.activeRevisionFilter,
      revisionArchive: { proposals: [], versions: [], decisions: [], effects: [], events: [] },
      setActiveRevisionFilter: revisionMock.setActiveRevisionFilter,
      setDecision: revisionMock.setDecision,
      resetDecision: revisionMock.resetDecision,
      setCustomText: revisionMock.setCustomText,
      replaceRevisionArchive: vi.fn(),
      discipline: 'Tecnologia',
      order: 'secondaria',
    }),
    {
      getState: () => ({
        decisions: revisionMock.decisions,
        customTexts: revisionMock.customTexts,
        activeRevisionFilter: revisionMock.activeRevisionFilter,
        revisionArchive: { proposals: [], versions: [], decisions: [], effects: [], events: [] },
      }),
    }
  ),
}));

const oneProposal = [
  { id: 'prop-1', focus: 'Tecnologia — classe prima', oldText: 'Testo precedente', newText: 'Proposta aggiornata', notes: '' },
];

const revisionProps = () => ({
  currentDisciplineProps: oneProposal,
  currentDisciplineDecided: 0,
  revisioneMode: 'list' as const,
  setRevisioneMode: vi.fn(),
  revisioneWizardIndex: 0,
  setRevisioneWizardIndex: vi.fn(),
});

describe('CML-610 — Empty states operational clarity', () => {
  beforeEach(() => {
    localStorage.clear();
    revisionMock.activeRevisionFilter = 'all';
    revisionMock.decisions = {};
    revisionMock.customTexts = {};
    vi.clearAllMocks();
  });

  describe('R1/R2: RevisioneTab — comunicazione operativa progressiva CCO', () => {
    it('distinguishes absence of review work from completed work', () => {
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
      expect(screen.getByText('Nessuna scheda da revisionare in questo contesto.')).toBeInTheDocument();
      expect(screen.getByText('Nessuna scheda da revisionare')).toBeInTheDocument();
      expect(screen.queryByText('Hai esaminato tutte le schede di questo contesto.')).not.toBeInTheDocument();
    });

    it('puts state and the next useful action before training copy', () => {
      render(<RevisioneTab {...revisionProps()} />);

      expect(screen.getByText('1 scheda richiede il tuo orientamento')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Esamina la prossima scheda' })).toBeInTheDocument();
      expect(screen.getByText('Apre la prima scheda ancora da esaminare.')).toBeInTheDocument();
      expect(screen.getByText('Perché è in revisione?')).toBeInTheDocument();
      expect(screen.getByText('Criteri utili per esaminare la scheda')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Conferma proposta' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Proponi una modifica' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Mantieni testo precedente' })).toBeInTheDocument();
      expect(screen.getByText(/resta personale: non approva il curricolo/i)).toBeInTheDocument();
    });

    it('recovers from an empty filter without contradicting pending work', () => {
      revisionMock.activeRevisionFilter = 'approved';
      render(<RevisioneTab {...revisionProps()} />);

      expect(screen.getByText('Questo filtro non mostra le schede da esaminare')).toBeInTheDocument();
      const action = screen.getByRole('button', { name: 'Mostra la scheda da esaminare' });
      fireEvent.click(action);
      expect(revisionMock.setActiveRevisionFilter).toHaveBeenCalledWith('pending');
    });

    it('turns a completed orientation into a visible consequence and explicit continuation', () => {
      const onContinueAfterReview = vi.fn();
      const view = render(<RevisioneTab {...revisionProps()} onContinueAfterReview={onContinueAfterReview} />);

      fireEvent.click(screen.getByRole('button', { name: 'Conferma proposta' }));
      expect(revisionMock.setDecision).toHaveBeenCalledWith('prop-1', 'approved');

      revisionMock.decisions = { 'prop-1': 'approved' };
      view.rerender(<RevisioneTab {...revisionProps()} currentDisciplineDecided={1} onContinueAfterReview={onContinueAfterReview} />);

      expect(screen.getByText('Orientamento registrato')).toBeInTheDocument();
      expect(screen.getByText('Hai esaminato tutte le schede di questo contesto.')).toBeInTheDocument();
      const continueAction = screen.getByRole('button', { name: 'Continua alla condivisione' });
      fireEvent.click(continueAction);
      expect(onContinueAfterReview).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('button', { name: 'Modifica orientamento' })).toBeInTheDocument();
    });

    it('does not count an empty custom formulation as completed work', () => {
      revisionMock.decisions = { 'prop-1': 'custom' };
      revisionMock.customTexts = { 'prop-1': '' };
      render(<RevisioneTab {...revisionProps()} currentDisciplineDecided={1} />);

      expect(screen.getByText('1 scheda richiede il tuo orientamento')).toBeInTheDocument();
      expect(screen.getByText('Modifica da completare')).toBeInTheDocument();
      expect(screen.getByText(/finché è vuota, la scheda resta da esaminare/i)).toBeInTheDocument();
      expect(screen.queryByText('Orientamento registrato')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Continua alla condivisione' })).not.toBeInTheDocument();
    });

    it('shows completion only when review work existed and all items are actually complete', () => {
      revisionMock.decisions = { 'prop-1': 'approved' };
      render(<RevisioneTab {...revisionProps()} currentDisciplineDecided={1} onContinueAfterReview={vi.fn()} />);

      expect(screen.getByText('Hai esaminato tutte le schede di questo contesto.')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Esamina la prossima scheda' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Continua alla condivisione' })).toBeInTheDocument();
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
