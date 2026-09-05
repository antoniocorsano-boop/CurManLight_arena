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

  describe('R1/R2/R3: RevisioneTab — interazione per riconoscimento CCO', () => {
    it('distinguishes absence of review work without adding process explanation', () => {
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

      expect(screen.getByText('Nessuna scheda da revisionare')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Vai alla condivisione' })).not.toBeInTheDocument();
    });

    it('shows one dominant sheet with comparison and contextual actions', () => {
      render(<RevisioneTab {...revisionProps()} />);

      expect(screen.getByText('1 di 1')).toBeInTheDocument();
      expect(screen.getByText('Tecnologia — classe prima')).toBeInTheDocument();
      expect(screen.getByText('Precedente')).toBeInTheDocument();
      expect(screen.getByText('Proposta')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Conferma' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Modifica' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Mantieni precedente' })).toBeInTheDocument();
      expect(screen.queryByText('Qual è il tuo orientamento?')).not.toBeInTheDocument();
      expect(screen.queryByText('0/1 completate')).not.toBeInTheDocument();
      expect(screen.getByText('Personale')).toBeInTheDocument();
      expect(screen.getByText(/resta personale\. non approva il curricolo/i)).toBeInTheDocument();
    });

    it('keeps context and retrospective navigation under progressive disclosure', () => {
      render(<RevisioneTab {...revisionProps()} currentDisciplineProps={twoProposals} />);

      expect(screen.getByText('Contesto e fonti')).toBeInTheDocument();
      expect(screen.getByText('Tutte le schede · 0/2')).toBeInTheDocument();
    });

    it('does not complete a textual change until Registra modifica', () => {
      render(<RevisioneTab {...revisionProps()} />);

      fireEvent.click(screen.getByRole('button', { name: 'Modifica' }));
      expect(revisionMock.setDecision).not.toHaveBeenCalled();

      const textarea = screen.getByPlaceholderText('Scrivi la formulazione alternativa…');
      expect(screen.getByRole('button', { name: 'Registra modifica' })).toBeDisabled();

      fireEvent.change(textarea, { target: { value: 'Nuova formulazione verificabile' } });
      const register = screen.getByRole('button', { name: 'Registra modifica' });
      expect(register).toBeEnabled();
      fireEvent.click(register);

      expect(revisionMock.setCustomText).toHaveBeenCalledWith('prop-1', 'Nuova formulazione verificabile');
      expect(revisionMock.setDecision).toHaveBeenCalledWith('prop-1', 'custom');
    });

    it('turns completion into a compact visual state and one next action', () => {
      revisionMock.decisions = { 'prop-1': 'approved' };
      const onContinueAfterReview = vi.fn();
      render(<RevisioneTab {...revisionProps()} currentDisciplineDecided={1} onContinueAfterReview={onContinueAfterReview} />);

      expect(screen.getByText('✓ Confermata')).toBeInTheDocument();
      expect(screen.queryByText('Precedente')).not.toBeInTheDocument();
      expect(screen.queryByText('Proposta')).not.toBeInTheDocument();

      const continueAction = screen.getByRole('button', { name: 'Vai alla condivisione' });
      fireEvent.click(continueAction);
      expect(onContinueAfterReview).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('button', { name: 'Cambia scelta' })).toBeInTheDocument();
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
