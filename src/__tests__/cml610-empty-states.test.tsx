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
    },
  ),
}));

const oneProposal = [
  { id: 'prop-1', focus: 'Tecnologia — classe prima', oldText: 'Testo precedente', newText: 'Proposta aggiornata', notes: '' },
];

const twoProposals = [
  ...oneProposal,
  { id: 'prop-2', focus: 'Tecnologia — classe seconda', oldText: 'Testo precedente 2', newText: 'Proposta aggiornata 2', notes: '' },
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
    Object.defineProperty(window, 'scrollTo', { value: vi.fn(), configurable: true });
  });

  describe('R1/R2: RevisioneTab — singolo compito operativo CCO', () => {
    it('distinguishes absence of review work from completed work', () => {
      render(
        <RevisioneTab
          currentDisciplineProps={[]}
          currentDisciplineDecided={0}
          revisioneMode="list"
          setRevisioneMode={vi.fn()}
          revisioneWizardIndex={0}
          setRevisioneWizardIndex={vi.fn()}
        />,
      );

      expect(screen.getByText('Il mio lavoro nel curricolo')).toBeInTheDocument();
      expect(screen.getByText('Nessuna scheda da revisionare')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Passa alla condivisione' })).not.toBeInTheDocument();
    });

    it('shows one active sheet without duplicate process rails', () => {
      render(<RevisioneTab {...revisionProps()} />);

      expect(screen.getByText('0/1 completate')).toBeInTheDocument();
      expect(screen.getByText('1 da esaminare')).toBeInTheDocument();
      expect(screen.getByText('Testo precedente')).toBeInTheDocument();
      expect(screen.getByText('Proposta aggiornata')).toBeInTheDocument();
      expect(screen.getByText('Qual è il tuo orientamento?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Conferma proposta' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Proponi una modifica' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Mantieni testo precedente' })).toBeInTheDocument();
      expect(screen.queryByText('1 · Confronto')).not.toBeInTheDocument();
      expect(screen.queryByText('2 · Orientamento')).not.toBeInTheDocument();
      expect(screen.getByText(/resta personale\. non approva il curricolo/i)).toBeInTheDocument();
    });

    it('keeps retrospective navigation behind progressive disclosure', () => {
      render(<RevisioneTab {...revisionProps()} currentDisciplineProps={twoProposals} />);

      expect(screen.getByText('Rivedi le schede · 2')).toBeInTheDocument();
      expect(screen.getAllByText(/Tecnologia — classe/).length).toBeGreaterThanOrEqual(2);
    });

    it('does not complete a textual change until Registra la modifica', () => {
      render(<RevisioneTab {...revisionProps()} />);

      fireEvent.click(screen.getByRole('button', { name: 'Proponi una modifica' }));
      expect(revisionMock.setDecision).not.toHaveBeenCalled();

      const textarea = screen.getByPlaceholderText('Scrivi la formulazione alternativa…');
      expect(screen.getByRole('button', { name: 'Registra la modifica' })).toBeDisabled();

      fireEvent.change(textarea, { target: { value: 'Nuova formulazione verificabile' } });
      const register = screen.getByRole('button', { name: 'Registra la modifica' });
      expect(register).toBeEnabled();
      fireEvent.click(register);

      expect(revisionMock.setCustomText).toHaveBeenCalledWith('prop-1', 'Nuova formulazione verificabile');
      expect(revisionMock.setDecision).toHaveBeenCalledWith('prop-1', 'custom');
    });

    it('shows a compact completed card and the real transition action only when all work is complete', () => {
      revisionMock.decisions = { 'prop-1': 'approved' };
      const onContinueAfterReview = vi.fn();
      render(<RevisioneTab {...revisionProps()} currentDisciplineDecided={1} onContinueAfterReview={onContinueAfterReview} />);

      expect(screen.getByText('1/1 completate')).toBeInTheDocument();
      expect(screen.getByText('Proposta confermata')).toBeInTheDocument();
      expect(screen.queryByText('Qual è il tuo orientamento?')).not.toBeInTheDocument();

      const continueAction = screen.getByRole('button', { name: 'Passa alla condivisione' });
      fireEvent.click(continueAction);
      expect(onContinueAfterReview).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('button', { name: 'Modifica orientamento' })).toBeInTheDocument();
    });
  });

  describe('R1: DocumentExportHistory — already implemented empty state', () => {
    it('shows export empty state when no events', () => {
      render(
        <DocumentExportHistory
          events={[]}
          onClearHistory={vi.fn()}
        />,
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
        />,
      );
      expect(screen.queryByText('Non hai ancora prodotto documenti in questa sessione.')).not.toBeInTheDocument();
    });
  });
});
