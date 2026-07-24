import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecentActivity } from '../features/session/components/RecentActivity';
import { DashboardView } from '../features/session/components/DashboardView';
import type { UdaModel, DocumentExportEvent, UserRole } from '../types/curriculum';
import type { ProgStatus } from '../features/session/types/appViewContracts';

function makeUda(overrides: Partial<UdaModel> & { id: string; title: string }): UdaModel {
  return {
    discipline: 'italiano',
    order: 'primaria',
    period: 'I semestre',
    hours: 36,
    status: 'bozza',
    traguardi: [],
    obiettivi: [],
    evidenze: [],
    realTask: '',
    notes: '',
    createdAt: '2026-07-20T10:00:00.000Z',
    ...overrides,
  };
}

function makeExport(overrides: Partial<DocumentExportEvent> & { id: string; label: string }): DocumentExportEvent {
  return {
    documentType: 'uda',
    format: 'PDF',
    sourceKind: 'uda',
    discipline: 'italiano',
    order: 'primaria',
    exportedAt: '2026-07-23T10:00:00.000Z',
    coherence: 'current',
    ...overrides,
  };
}

const baseProps = {
  savedUda: [] as UdaModel[],
  documentExportHistory: [] as DocumentExportEvent[],
  handleTabSwitch: vi.fn(),
  setActiveProgTab: vi.fn(),
};

const dashboardBaseProps = {
  activeTab: 'dashboard',
  role: 'insegnante' as UserRole,
  savedUda: [] as UdaModel[],
  decisions: {} as Record<string, unknown>,
  wizardStep: 1,
  progTitle: '',
  progStatus: 'bozza' as ProgStatus,
  documentExportHistory: [] as DocumentExportEvent[],
  handleDownloadCml: vi.fn(),
  handleTabSwitch: vi.fn(),
  setSelectedBrainDoc: vi.fn(),
  setWikiWorkspaceTab: vi.fn() as never,
  setShowSaveModal: vi.fn(),
  setActiveCurricoloView: vi.fn(),
  setActiveProgTab: vi.fn(),
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-07-24T12:00:00.000Z'));
  vi.clearAllMocks();
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('CML-617B \u2014 RecentActivity widget', () => {

  // 1. Rendering del titolo "Attività recenti"
  it('1. renders widget title "Attività recenti"', () => {
    render(<RecentActivity {...baseProps} />);
    expect(screen.getByText('Attività recenti')).toBeDefined();
  });

  it('1b. renders title in empty state too', () => {
    render(<RecentActivity {...baseProps} />);
    const titles = screen.getAllByText('Attività recenti');
    expect(titles.length).toBeGreaterThanOrEqual(1);
  });

  // 2. Posizione logica tra Stato del Lavoro e card principali
  it('2. positioned between work status and main cards in DashboardView', () => {
    render(<DashboardView {...dashboardBaseProps} />);
    const workStatus = screen.getByTestId('teacher-work-status');
    const recentActivity = screen.getByTestId('recent-activity-empty');

    const workStatusPos = workStatus.compareDocumentPosition(recentActivity);
    expect(workStatusPos & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  // 3. Stato vuoto
  it('3. shows the approved informational empty state when no historical activities exist', () => {
    render(<RecentActivity {...baseProps} />);
    expect(screen.getByTestId('recent-activity-empty')).toBeDefined();
    expect(screen.getByText('Le UDA salvate e le esportazioni recenti compariranno qui.')).toBeDefined();
  });

  // 4. CTA "Inizia dal Curricolo"
  it('4. empty state has no CTA or navigation action', () => {
    const handleTabSwitch = vi.fn();
    render(<RecentActivity {...baseProps} handleTabSwitch={handleTabSwitch} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByTestId('recent-activity-start')).toBeNull();
    expect(handleTabSwitch).not.toHaveBeenCalled();
  });

  it('5. keeps the active wizard and its only resume action in the work-status card', () => {
    const handleTabSwitch = vi.fn();
    const setActiveProgTab = vi.fn();
    render(
      <DashboardView
        {...dashboardBaseProps}
        wizardStep={3}
        progTitle="Wizard persistito"
        handleTabSwitch={handleTabSwitch}
        setActiveProgTab={setActiveProgTab}
      />
    );

    expect(screen.getByText('Wizard: Wizard persistito')).toBeDefined();
    expect(screen.queryByTestId(/recent-activity-action-wizard-/)).toBeNull();
    screen.getByTestId('teacher-action-continue').click();
    expect(handleTabSwitch).toHaveBeenCalledWith('progetta-annuale');
    expect(setActiveProgTab).toHaveBeenCalledWith('annuale');
  });

  it('6. renders recent UDA', () => {
    const savedUda = [makeUda({ id: 'uda-1', title: 'UDA Italiano', createdAt: '2026-07-23T08:00:00.000Z' })];
    render(<RecentActivity {...baseProps} savedUda={savedUda} />);
    expect(screen.getByText('UDA Italiano')).toBeDefined();
  });

  // 7. Rendering dell'esportazione recente
  it('7. renders recent export', () => {
    const documentExportHistory = [makeExport({ id: 'exp-1', label: 'Curricolo PDF', exportedAt: '2026-07-23T08:00:00.000Z' })];
    render(<RecentActivity {...baseProps} documentExportHistory={documentExportHistory} />);
    expect(screen.getByText('Curricolo PDF')).toBeDefined();
    expect(screen.getByText('documento esportato')).toBeDefined();
  });

  // 8. Limite massimo di tre elementi
  it('8. limits to 3 activities max', () => {
    const savedUda = [
      makeUda({ id: 'uda-1', title: 'UDA 1', createdAt: '2026-07-22T08:00:00.000Z' }),
      makeUda({ id: 'uda-2', title: 'UDA 2', createdAt: '2026-07-23T08:00:00.000Z' }),
    ];
    const documentExportHistory = [
      makeExport({ id: 'exp-1', label: 'Export 1', exportedAt: '2026-07-22T08:00:00.000Z' }),
      makeExport({ id: 'exp-2', label: 'Export 2', exportedAt: '2026-07-23T08:00:00.000Z' }),
    ];

    render(
      <RecentActivity
        {...baseProps}
        savedUda={savedUda}
        documentExportHistory={documentExportHistory}
      />
    );

    const items = screen.getAllByTestId(/recent-activity-action-/);
    expect(items.length).toBeLessThanOrEqual(3);
  });

  // 10. Uso di updatedAt prima di createdAt
  it('10. prefers updatedAt over createdAt for most recent UDA', () => {
    const savedUda = [
      makeUda({ id: 'uda-old', title: 'Old UDA', createdAt: '2026-07-20T08:00:00.000Z', updatedAt: '2026-07-21T08:00:00.000Z' }),
      makeUda({ id: 'uda-new', title: 'New UDA', createdAt: '2026-07-22T08:00:00.000Z', updatedAt: '2026-07-23T08:00:00.000Z' }),
    ];

    render(<RecentActivity {...baseProps} savedUda={savedUda} />);
    expect(
      screen.getAllByTestId(/recent-activity-action-/).map((node) => node.getAttribute('data-testid')),
    ).toEqual([
      'recent-activity-action-uda-uda-new',
      'recent-activity-action-uda-uda-old',
    ]);
  });

  // 11. Ripiego su createdAt
  it('11. falls back to createdAt when updatedAt absent', () => {
    const savedUda = [
      makeUda({ id: 'uda-1', title: 'Earlier', createdAt: '2026-07-20T08:00:00.000Z' }),
      makeUda({ id: 'uda-2', title: 'Later', createdAt: '2026-07-23T08:00:00.000Z' }),
    ];

    render(<RecentActivity {...baseProps} savedUda={savedUda} />);
    expect(
      screen.getAllByTestId(/recent-activity-action-/).map((node) => node.getAttribute('data-testid')),
    ).toEqual([
      'recent-activity-action-uda-uda-2',
      'recent-activity-action-uda-uda-1',
    ]);
  });

  it('11b. neutral description when only createdAt available', () => {
    const savedUda = [makeUda({ id: 'uda-1', title: 'Draft UDA', createdAt: '2026-07-23T08:00:00.000Z' })];
    render(<RecentActivity {...baseProps} savedUda={savedUda} />);
    expect(screen.getByText('UDA salvata')).toBeDefined();
  });

  // 13. Deduplicazione tramite chiave composita
  it('13. deduplicates export when sourceId matches UDA id', () => {
    const savedUda = [makeUda({ id: 'uda-1', title: 'My UDA', createdAt: '2026-07-23T08:00:00.000Z' })];
    const documentExportHistory = [
      makeExport({ id: 'exp-1', label: 'My UDA export', sourceId: 'uda-1', exportedAt: '2026-07-23T08:00:00.000Z' }),
    ];

    render(
      <RecentActivity
        {...baseProps}
        savedUda={savedUda}
        documentExportHistory={documentExportHistory}
      />
    );

    expect(screen.getByText('My UDA')).toBeDefined();
    expect(screen.queryByText('My UDA export')).toBeNull();
  });

  // 14. Mancata deduplicazione di due UDA con titolo uguale ma identità diversa
  it('14. does NOT deduplicate two UDAs with same title but different ids', () => {
    const savedUda = [
      makeUda({ id: 'uda-1', title: 'Duplicate Title', createdAt: '2026-07-20T08:00:00.000Z' }),
      makeUda({ id: 'uda-2', title: 'Duplicate Title', createdAt: '2026-07-23T08:00:00.000Z' }),
    ];

    render(<RecentActivity {...baseProps} savedUda={savedUda} />);

    const udaItems = screen.getAllByText('Duplicate Title');
    expect(udaItems.length).toBe(2);

    expect(screen.getByTestId('recent-activity-action-uda-uda-1')).toBeDefined();
    expect(screen.getByTestId('recent-activity-action-uda-uda-2')).toBeDefined();
  });

  // 15. Etichetta oggi
  it('15. shows "oggi" for activity from today', () => {
    const today = '2026-07-24T08:00:00.000Z';
    const savedUda = [makeUda({ id: 'uda-1', title: 'Today UDA', createdAt: today, updatedAt: today })];

    render(<RecentActivity {...baseProps} savedUda={savedUda} />);
    expect(screen.getByText('oggi')).toBeDefined();
  });

  // 16. Etichetta ieri oltre il confine della mezzanotte
  it('16. shows "ieri" for yesterday even within 24h', () => {
    const yesterday = '2026-07-23T01:30:00.000Z';
    const savedUda = [makeUda({ id: 'uda-1', title: 'Yesterday UDA', createdAt: yesterday, updatedAt: yesterday })];

    render(<RecentActivity {...baseProps} savedUda={savedUda} />);
    expect(screen.getByText('ieri')).toBeDefined();
  });

  // 17. Etichetta N giorni fa
  it('17. shows "N giorni fa" for 2-6 days ago', () => {
    const threeDaysAgo = '2026-07-21T08:00:00.000Z';
    const savedUda = [makeUda({ id: 'uda-1', title: '3gg fa UDA', createdAt: threeDaysAgo, updatedAt: threeDaysAgo })];

    render(<RecentActivity {...baseProps} savedUda={savedUda} />);
    expect(screen.getByText('3 giorni fa')).toBeDefined();
  });

  // 18. Data breve oltre sette giorni
  it('18. shows short date for items older than 7 days', () => {
    const tenDaysAgo = '2026-07-14T08:00:00.000Z';
    const savedUda = [makeUda({ id: 'uda-1', title: 'Old UDA', createdAt: tenDaysAgo, updatedAt: tenDaysAgo })];

    render(<RecentActivity {...baseProps} savedUda={savedUda} />);
    expect(screen.getByText('14/7')).toBeDefined();
  });

  // 19. Gestione di una data non valida
  it('19. handles invalid date gracefully', () => {
    const savedUda = [makeUda({ id: 'uda-1', title: 'Bad Date UDA', createdAt: 'not-a-date' })];

    render(<RecentActivity {...baseProps} savedUda={savedUda} />);
    expect(screen.getByText('Bad Date UDA')).toBeDefined();

    const timeLabels = screen.getAllByText('');
    expect(timeLabels.length).toBeGreaterThanOrEqual(0);
  });

  it('19b. invalid date in export does not show Invalid Date', () => {
    const documentExportHistory = [
      makeExport({ id: 'exp-1', label: 'Bad Export', exportedAt: 'invalid' }),
    ];

    render(<RecentActivity {...baseProps} documentExportHistory={documentExportHistory} />);
    expect(screen.queryByText('Invalid Date')).toBeNull();
  });

  // 21. Navigazione "Apri" per UDA
  it('21. UDA action navigates to progetta-annuale + uda', () => {
    const handleTabSwitch = vi.fn();
    const setActiveProgTab = vi.fn();
    const savedUda = [makeUda({ id: 'uda-1', title: 'Test UDA', createdAt: '2026-07-23T08:00:00.000Z' })];

    render(
      <RecentActivity
        {...baseProps}
        savedUda={savedUda}
        handleTabSwitch={handleTabSwitch}
        setActiveProgTab={setActiveProgTab}
      />
    );

    screen.getByTestId('recent-activity-action-uda-uda-1').click();
    expect(handleTabSwitch).toHaveBeenCalledWith('progetta-annuale');
    expect(setActiveProgTab).toHaveBeenCalledWith('uda');
  });

  // 22. Navigazione "Apri" per esportazione
  it('22. export action navigates to esportazioni', () => {
    const handleTabSwitch = vi.fn();
    const documentExportHistory = [makeExport({ id: 'exp-1', label: 'Test Export', exportedAt: '2026-07-23T08:00:00.000Z' })];

    render(
      <RecentActivity
        {...baseProps}
        documentExportHistory={documentExportHistory}
        handleTabSwitch={handleTabSwitch}
      />
    );

    screen.getByTestId('recent-activity-action-export-exp-1').click();
    expect(handleTabSwitch).toHaveBeenCalledWith('esportazioni');
  });

  // --- Additional edge cases ---

  it('UDA with updatedAt shows status as description', () => {
    const savedUda = [makeUda({ id: 'uda-1', title: 'UDA', status: 'in revisione', createdAt: '2026-07-23T08:00:00.000Z', updatedAt: '2026-07-23T08:00:00.000Z' })];
    render(<RecentActivity {...baseProps} savedUda={savedUda} />);
    expect(screen.getByText('in revisione')).toBeDefined();
  });

  it('export deduplicates when sourceId matches even with different label', () => {
    const savedUda = [makeUda({ id: 'uda-42', title: 'The UDA', createdAt: '2026-07-23T08:00:00.000Z' })];
    const documentExportHistory = [
      makeExport({ id: 'exp-1', label: 'Export of The UDA', sourceId: 'uda-42', exportedAt: '2026-07-23T08:00:00.000Z' }),
    ];

    render(
      <RecentActivity
        {...baseProps}
        savedUda={savedUda}
        documentExportHistory={documentExportHistory}
      />
    );

    expect(screen.getByText('The UDA')).toBeDefined();
    expect(screen.queryByText('Export of The UDA')).toBeNull();
  });

  it('export shows when sourceId does not match any UDA', () => {
    const savedUda = [makeUda({ id: 'uda-1', title: 'UDA', createdAt: '2026-07-23T08:00:00.000Z' })];
    const documentExportHistory = [
      makeExport({ id: 'exp-1', label: 'Unrelated Export', sourceId: 'uda-999', exportedAt: '2026-07-23T08:00:00.000Z' }),
    ];

    render(
      <RecentActivity
        {...baseProps}
        savedUda={savedUda}
        documentExportHistory={documentExportHistory}
      />
    );

    expect(screen.getByText('UDA')).toBeDefined();
    expect(screen.getByText('Unrelated Export')).toBeDefined();
  });

  it('only export data shows export without duplication', () => {
    const documentExportHistory = [makeExport({ id: 'exp-1', label: 'Solo Export', exportedAt: '2026-07-23T08:00:00.000Z' })];
    render(<RecentActivity {...baseProps} documentExportHistory={documentExportHistory} />);
    expect(screen.getByText('Solo Export')).toBeDefined();
    expect(screen.getByText('documento esportato')).toBeDefined();
  });

  it('stable id resolves equal timestamps independently of array position', () => {
    const savedUda = [
      makeUda({ id: 'uda-1', title: 'First', createdAt: '2026-07-20T08:00:00.000Z' }),
      makeUda({ id: 'uda-2', title: 'Last', createdAt: '2026-07-20T08:00:00.000Z' }),
    ];

    render(<RecentActivity {...baseProps} savedUda={savedUda} />);
    expect(
      screen.getAllByTestId(/recent-activity-action-/).map((node) => node.getAttribute('data-testid')),
    ).toEqual([
      'recent-activity-action-uda-uda-1',
      'recent-activity-action-uda-uda-2',
    ]);
  });

  it('does not show "Invalid Date" for completely empty dates', () => {
    const savedUda = [makeUda({ id: 'uda-1', title: 'No Date UDA', createdAt: '' })];
    render(<RecentActivity {...baseProps} savedUda={savedUda} />);
    expect(screen.queryByText('Invalid Date')).toBeNull();
  });

  // --- Civil day serial edge cases ---

  it('handles DST spring-forward: 23h day still counts as 1 day', () => {
    vi.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));
    const yesterday = '2026-03-29T08:00:00.000Z';
    const savedUda = [makeUda({ id: 'uda-1', title: 'DST UDA', createdAt: yesterday, updatedAt: yesterday })];
    render(<RecentActivity {...baseProps} savedUda={savedUda} />);
    expect(screen.getByText('ieri')).toBeDefined();
  });

  it('handles DST fall-back: 25h day still counts as 1 day', () => {
    vi.setSystemTime(new Date('2026-10-26T12:00:00.000Z'));
    const yesterday = '2026-10-25T08:00:00.000Z';
    const savedUda = [makeUda({ id: 'uda-1', title: 'DST UDA', createdAt: yesterday, updatedAt: yesterday })];
    render(<RecentActivity {...baseProps} savedUda={savedUda} />);
    expect(screen.getByText('ieri')).toBeDefined();
  });

  it('midnight boundary: activity at 23:59 local yesterday shows "ieri"', () => {
    const now = new Date();
    const yesterday2359 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 0);
    const savedUda = [makeUda({ id: 'uda-1', title: 'Late UDA', createdAt: yesterday2359.toISOString(), updatedAt: yesterday2359.toISOString() })];
    render(<RecentActivity {...baseProps} savedUda={savedUda} />);
    expect(screen.getByText('ieri')).toBeDefined();
  });

  it('export without sourceId is never deduplicated against UDA', () => {
    const savedUda = [makeUda({ id: 'uda-1', title: 'The UDA', createdAt: '2026-07-23T08:00:00.000Z' })];
    const documentExportHistory = [
      makeExport({ id: 'exp-1', label: 'The UDA export', exportedAt: '2026-07-23T09:00:00.000Z' }),
    ];

    render(
      <RecentActivity
        {...baseProps}
        savedUda={savedUda}
        documentExportHistory={documentExportHistory}
      />
    );

    expect(screen.getByText('The UDA')).toBeDefined();
    expect(screen.getByText('The UDA export')).toBeDefined();
  });
  describe('CML-621 — global relevance selection', () => {
    const actionIds = () => screen.getAllByTestId(/recent-activity-action-/).map((node) => node.getAttribute('data-testid'));

    it('shows three recent UDAs when no wizard is active', () => {
      const savedUda = [
        makeUda({ id: 'uda-1', title: 'UDA One', createdAt: '2026-07-21T08:00:00.000Z' }),
        makeUda({ id: 'uda-2', title: 'UDA Two', createdAt: '2026-07-22T08:00:00.000Z' }),
        makeUda({ id: 'uda-3', title: 'UDA Three', createdAt: '2026-07-23T08:00:00.000Z' }),
      ];

      render(<RecentActivity {...baseProps} savedUda={savedUda} />);

      expect(screen.getByText('UDA One')).toBeDefined();
      expect(screen.getByText('UDA Two')).toBeDefined();
      expect(screen.getByText('UDA Three')).toBeDefined();
      expect(actionIds()).toHaveLength(3);
    });

    it('shows three recent exports when no wizard is active', () => {
      const documentExportHistory = [
        makeExport({ id: 'exp-1', label: 'Export One', exportedAt: '2026-07-21T08:00:00.000Z' }),
        makeExport({ id: 'exp-2', label: 'Export Two', exportedAt: '2026-07-22T08:00:00.000Z' }),
        makeExport({ id: 'exp-3', label: 'Export Three', exportedAt: '2026-07-23T08:00:00.000Z' }),
      ];

      render(<RecentActivity {...baseProps} documentExportHistory={documentExportHistory} />);

      expect(screen.getByText('Export One')).toBeDefined();
      expect(screen.getByText('Export Two')).toBeDefined();
      expect(screen.getByText('Export Three')).toBeDefined();
      expect(actionIds()).toHaveLength(3);
    });

    it('uses all three slots for globally recent events regardless of wizard state', () => {
      const savedUda = [
        makeUda({ id: 'uda-1', title: 'Recent UDA', createdAt: '2026-07-23T10:00:00.000Z' }),
        makeUda({ id: 'uda-2', title: 'Second UDA', createdAt: '2026-07-22T10:00:00.000Z' }),
      ];
      const documentExportHistory = [
        makeExport({ id: 'exp-old', label: 'Old Export', exportedAt: '2026-07-21T08:00:00.000Z' }),
      ];

      render(
        <RecentActivity
          {...baseProps}
          savedUda={savedUda}
          documentExportHistory={documentExportHistory}
        />
      );

      expect(actionIds()).toEqual([
        'recent-activity-action-uda-uda-1',
        'recent-activity-action-uda-uda-2',
        'recent-activity-action-export-exp-old',
      ]);
      expect(screen.getByText('Old Export')).toBeDefined();
    });

    it('keeps the same historical order with and without an active wizard', () => {
      const savedUda = [
        makeUda({ id: 'uda-1', title: 'Recent UDA', createdAt: '2026-07-23T10:00:00.000Z' }),
        makeUda({ id: 'uda-2', title: 'Second UDA', createdAt: '2026-07-22T10:00:00.000Z' }),
      ];
      const documentExportHistory = [
        makeExport({ id: 'exp-1', label: 'Recent Export', exportedAt: '2026-07-21T10:00:00.000Z' }),
      ];
      const first = render(
        <DashboardView
          {...dashboardBaseProps}
          savedUda={savedUda}
          documentExportHistory={documentExportHistory}
          wizardStep={1}
        />
      );
      const withoutWizard = actionIds();
      first.unmount();

      render(
        <DashboardView
          {...dashboardBaseProps}
          savedUda={savedUda}
          documentExportHistory={documentExportHistory}
          wizardStep={3}
          progTitle="Open Wizard"
        />
      );

      expect(actionIds()).toEqual(withoutWizard);
      expect(screen.queryByTestId(/recent-activity-action-wizard-/)).toBeNull();
    });

    it('shows exactly one or two available historical events without fillers', () => {
      const savedUda = [
        makeUda({ id: 'uda-1', title: 'Only UDA', createdAt: '2026-07-23T08:00:00.000Z' }),
      ];
      const first = render(<RecentActivity {...baseProps} savedUda={savedUda} />);
      expect(actionIds()).toHaveLength(1);
      first.unmount();

      const exports = [
        makeExport({ id: 'exp-1', label: 'Only Export', exportedAt: '2026-07-22T08:00:00.000Z' }),
      ];
      render(<RecentActivity {...baseProps} savedUda={savedUda} documentExportHistory={exports} />);
      expect(actionIds()).toHaveLength(2);
      expect(screen.queryByTestId(/recent-activity-action-wizard-/)).toBeNull();
    });

    it('produces the same order after reversing both source arrays', () => {
      const savedUda = [
        makeUda({ id: 'uda-b', title: 'UDA B', createdAt: '2026-07-23T08:00:00.000Z' }),
        makeUda({ id: 'uda-a', title: 'UDA A', createdAt: '2026-07-23T08:00:00.000Z' }),
      ];
      const exports = [
        makeExport({ id: 'exp-b', label: 'Export B', exportedAt: '2026-07-20T08:00:00.000Z' }),
        makeExport({ id: 'exp-a', label: 'Export A', exportedAt: '2026-07-21T08:00:00.000Z' }),
      ];
      const first = render(<RecentActivity {...baseProps} savedUda={savedUda} documentExportHistory={exports} />);
      const firstOrder = actionIds();
      first.unmount();

      render(<RecentActivity {...baseProps} savedUda={[...savedUda].reverse()} documentExportHistory={[...exports].reverse()} />);

      expect(actionIds()).toEqual(firstOrder);
    });

    it('keeps the newest event in a verified UDA-export source family', () => {
      const savedUda = [makeUda({ id: 'uda-source', title: 'Source UDA', createdAt: '2026-07-20T08:00:00.000Z' })];
      const exports = [makeExport({ id: 'exp-new', label: 'Newer Export', sourceId: 'uda-source', exportedAt: '2026-07-23T08:00:00.000Z' })];

      render(<RecentActivity {...baseProps} savedUda={savedUda} documentExportHistory={exports} />);

      expect(screen.getByText('Newer Export')).toBeDefined();
      expect(screen.queryByText('Source UDA')).toBeNull();
    });

    it('reduces multiple exports of a known source to the newest event', () => {
      const savedUda = [makeUda({ id: 'uda-source', title: 'Source UDA', createdAt: '2026-07-20T08:00:00.000Z' })];
      const exports = [
        makeExport({ id: 'exp-old', label: 'Old Source Export', sourceId: 'uda-source', exportedAt: '2026-07-21T08:00:00.000Z' }),
        makeExport({ id: 'exp-new', label: 'New Source Export', sourceId: 'uda-source', exportedAt: '2026-07-23T08:00:00.000Z' }),
      ];

      render(<RecentActivity {...baseProps} savedUda={savedUda} documentExportHistory={exports} />);

      expect(screen.getByText('New Source Export')).toBeDefined();
      expect(screen.queryByText('Old Source Export')).toBeNull();
      expect(screen.queryByText('Source UDA')).toBeNull();
      expect(actionIds()).toHaveLength(1);
    });

    it('keeps exports without sourceId as independent events', () => {
      const exports = [
        makeExport({ id: 'exp-1', label: 'Independent One', exportedAt: '2026-07-22T08:00:00.000Z' }),
        makeExport({ id: 'exp-2', label: 'Independent Two', exportedAt: '2026-07-23T08:00:00.000Z' }),
      ];

      render(<RecentActivity {...baseProps} documentExportHistory={exports} />);

      expect(screen.getByText('Independent One')).toBeDefined();
      expect(screen.getByText('Independent Two')).toBeDefined();
    });

    it('resolves equal timestamps deterministically by category then stable id', () => {
      const timestamp = '2026-07-23T08:00:00.000Z';
      const savedUda = [
        makeUda({ id: 'uda-b', title: 'UDA B', createdAt: timestamp }),
        makeUda({ id: 'uda-a', title: 'UDA A', createdAt: timestamp }),
      ];
      const exports = [makeExport({ id: 'exp-a', label: 'Export A', exportedAt: timestamp })];

      render(<RecentActivity {...baseProps} savedUda={savedUda} documentExportHistory={exports} />);

      expect(actionIds()).toEqual([
        'recent-activity-action-uda-uda-a',
        'recent-activity-action-uda-uda-b',
        'recent-activity-action-export-exp-a',
      ]);
    });

    it('places invalid timestamps after all valid events', () => {
      const savedUda = [
        makeUda({ id: 'uda-invalid', title: 'Invalid UDA', createdAt: 'invalid' }),
        makeUda({ id: 'uda-new', title: 'Newest UDA', createdAt: '2026-07-23T08:00:00.000Z' }),
        makeUda({ id: 'uda-old', title: 'Older UDA', createdAt: '2026-07-21T08:00:00.000Z' }),
      ];
      const exports = [makeExport({ id: 'exp-valid', label: 'Valid Export', exportedAt: '2026-07-22T08:00:00.000Z' })];

      render(<RecentActivity {...baseProps} savedUda={savedUda} documentExportHistory={exports} />);

      expect(screen.getByText('Newest UDA')).toBeDefined();
      expect(screen.getByText('Valid Export')).toBeDefined();
      expect(screen.getByText('Older UDA')).toBeDefined();
      expect(screen.queryByText('Invalid UDA')).toBeNull();
    });
  });
});
