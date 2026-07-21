import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardView } from '../features/session/components/DashboardView';
import type { UserRole } from '../types/curriculum';
import type { ProgStatus } from '../features/session/types/appViewContracts';

const baseProps = {
  activeTab: 'dashboard',
  role: 'insegnante' as UserRole,
  savedUda: [] as never[],
  decisions: {} as Record<string, unknown>,
  wizardStep: 1,
  progTitle: '',
  progStatus: 'bozza' as ProgStatus,
  handleDownloadCml: vi.fn(),
  handleTabSwitch: vi.fn(),
  setSelectedBrainDoc: vi.fn(),
  setWikiWorkspaceTab: vi.fn() as never,
  setShowSaveModal: vi.fn(),
  setActiveCurricoloView: vi.fn(),
  setActiveProgTab: vi.fn(),
};

describe('Teacher Workspace Part 2 — Dashboard work status', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // --- States ---

  it('1. nessuna attività: no UDA, wizardStep 1', () => {
    render(<DashboardView {...baseProps} />);
    expect(screen.getByText('Nessuna attività')).toBeDefined();
    expect(screen.getByTestId('teacher-action-start')).toBeDefined();
  });

  it('2. in corso: wizardStep > 1', () => {
    render(<DashboardView {...baseProps} wizardStep={3} />);
    expect(screen.getByText('In corso')).toBeDefined();
    expect(screen.getByTestId('teacher-action-continue')).toBeDefined();
  });

  it('3. bozza salvata: UDA saved, wizardStep 1', () => {
    const savedUda = [{ id: '1', title: 'Test UDA' }] as never[];
    render(<DashboardView {...baseProps} savedUda={savedUda} />);
    expect(screen.getByText('Bozza salvata')).toBeDefined();
    expect(screen.getByTestId('teacher-action-consult')).toBeDefined();
  });

  it('4. completo: UDA saved, progStatus pronta per confronto', () => {
    const savedUda = [{ id: '1', title: 'Test UDA' }] as never[];
    render(<DashboardView {...baseProps} savedUda={savedUda} progStatus="pronta per confronto" />);
    expect(screen.getByText('Completo')).toBeDefined();
    expect(screen.getByTestId('teacher-action-consult')).toBeDefined();
  });

  // --- Timestamp ---

  it('5. timestamp assente: no "Ultimo salvataggio"', () => {
    render(<DashboardView {...baseProps} />);
    expect(screen.queryByText(/Ultimo salvataggio/)).toBeNull();
  });

  it('6. timestamp valido: shows relative time', () => {
    localStorage.setItem('curman_lastSaveTime', String(Date.now() - 300000));
    render(<DashboardView {...baseProps} />);
    expect(screen.getByText(/Ultimo salvataggio/)).toBeDefined();
  });

  it('7. timestamp non valido (NaN): no "Ultimo salvataggio"', () => {
    localStorage.setItem('curman_lastSaveTime', 'not-a-number');
    render(<DashboardView {...baseProps} />);
    expect(screen.queryByText(/Ultimo salvataggio/)).toBeNull();
  });

  it('8. timestamp futuro: shows "adesso"', () => {
    localStorage.setItem('curman_lastSaveTime', String(Date.now() + 3600000));
    render(<DashboardView {...baseProps} />);
    expect(screen.getByText(/adesso/)).toBeDefined();
  });

  // --- Metrics ---

  it('9. conteggio UDA pari a zero', () => {
    render(<DashboardView {...baseProps} />);
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
  });

  it('10. più UDA salvate', () => {
    const savedUda = [
      { id: '1', title: 'UDA 1' },
      { id: '2', title: 'UDA 2' },
      { id: '3', title: 'UDA 3' },
    ] as never[];
    render(<DashboardView {...baseProps} savedUda={savedUda} />);
    expect(screen.getByText('3')).toBeDefined();
  });

  it('11. nessuna decisione pendente', () => {
    render(<DashboardView {...baseProps} decisions={{}} />);
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
  });

  it('12. più decisioni pendenti', () => {
    const decisions = { d1: 'approved', d2: 'rejected', d3: 'custom', d4: 'approved' };
    render(<DashboardView {...baseProps} decisions={decisions} />);
    expect(screen.getByText('4')).toBeDefined();
  });

  it('13. wizardStep valido (3): shows "3/5"', () => {
    render(<DashboardView {...baseProps} wizardStep={3} />);
    expect(screen.getByText('3/5')).toBeDefined();
  });

  it('14. wizardStep 1 senza dati: shows "1/5" under "Prossimo Passo"', () => {
    render(<DashboardView {...baseProps} />);
    expect(screen.getByText('1/5')).toBeDefined();
    expect(screen.getByText('Prossimo Passo')).toBeDefined();
  });

  it('15. step 1 senza dati: "Nessuna attività", non "In corso"', () => {
    render(<DashboardView {...baseProps} />);
    expect(screen.getByText('Nessuna attività')).toBeDefined();
    expect(screen.queryByText('In corso')).toBeNull();
  });

  // --- Actions ---

  it('16. azione Continua UDA → progetta-annuale + activeProgTab annuale', () => {
    const handleTabSwitch = vi.fn();
    const setActiveProgTab = vi.fn();
    render(<DashboardView {...baseProps} wizardStep={3} handleTabSwitch={handleTabSwitch} setActiveProgTab={setActiveProgTab} />);
    screen.getByTestId('teacher-action-continue').click();
    expect(handleTabSwitch).toHaveBeenCalledWith('progetta-annuale');
    expect(setActiveProgTab).toHaveBeenCalledWith('annuale');
  });

  it('17. azione Consulta UDA → progetta-annuale + activeProgTab uda', () => {
    const handleTabSwitch = vi.fn();
    const setActiveProgTab = vi.fn();
    const savedUda = [{ id: '1', title: 'Test UDA' }] as never[];
    render(<DashboardView {...baseProps} savedUda={savedUda} handleTabSwitch={handleTabSwitch} setActiveProgTab={setActiveProgTab} />);
    screen.getByTestId('teacher-action-consult').click();
    expect(handleTabSwitch).toHaveBeenCalledWith('progetta-annuale');
    expect(setActiveProgTab).toHaveBeenCalledWith('uda');
  });

  it('18. azione Inizia dal Curricolo → curricolo', () => {
    const handleTabSwitch = vi.fn();
    render(<DashboardView {...baseProps} handleTabSwitch={handleTabSwitch} />);
    screen.getByTestId('teacher-action-start').click();
    expect(handleTabSwitch).toHaveBeenCalledWith('curricolo');
  });

  // --- Role visibility ---

  it('19. visibilità docente: widget presente', () => {
    render(<DashboardView {...baseProps} role="insegnante" />);
    expect(screen.getByTestId('teacher-work-status')).toBeDefined();
  });

  it('20. invisibilità per dipartimento', () => {
    render(<DashboardView {...baseProps} role="dipartimento" />);
    expect(screen.queryByTestId('teacher-work-status')).toBeNull();
  });

  it('21. cambio ruolo: widget scompare da dipartimento', () => {
    const { rerender } = render(<DashboardView {...baseProps} role="insegnante" />);
    expect(screen.getByTestId('teacher-work-status')).toBeDefined();
    rerender(<DashboardView {...baseProps} role="dipartimento" />);
    expect(screen.queryByTestId('teacher-work-status')).toBeNull();
  });

  // --- Reset & compatibility ---

  it('22. reset generale: curman_lastSaveTime rimosso, widget senza timestamp', () => {
    localStorage.setItem('curman_lastSaveTime', String(Date.now()));
    const { unmount } = render(<DashboardView {...baseProps} />);
    expect(screen.getByText(/Ultimo salvataggio/)).toBeDefined();
    unmount();

    localStorage.removeItem('curman_lastSaveTime');
    render(<DashboardView {...baseProps} />);
    expect(screen.queryByText(/Ultimo salvataggio/)).toBeNull();
  });

  it('23. compatibilità con dati precedenti: savedUda con campi extra', () => {
    const savedUda = [{ id: '1', title: 'Legacy UDA', status: 'bozza', createdAt: '2025-01-01' }] as never[];
    render(<DashboardView {...baseProps} savedUda={savedUda} />);
    expect(screen.getByText('Bozza salvata')).toBeDefined();
    expect(screen.getByText('1')).toBeDefined();
  });

  // --- Timestamp sync ---

  it('24. sincronizzazione con curman_lastSaveTime: valore nel blob consolidato', () => {
    const blob = { curman_lastSaveTime: String(Date.now() - 600000) };
    localStorage.setItem('curmanlight_stato_consolidato', JSON.stringify(blob));
    render(<DashboardView {...baseProps} />);
    expect(screen.getByText(/Ultimo salvataggio/)).toBeDefined();
  });

  // --- Wizard step detail ---

  it('shows wizard step label when wizard active with title', () => {
    render(<DashboardView {...baseProps} wizardStep={2} progTitle="UDA Italiano" />);
    expect(screen.getByText('Wizard: UDA Italiano')).toBeDefined();
  });

  it('shows default step label when wizard active without title', () => {
    render(<DashboardView {...baseProps} wizardStep={2} />);
    expect(screen.getByText('Passo 2: Compito di Realtà')).toBeDefined();
  });

  it('hides wizard detail when wizardStep is 1', () => {
    render(<DashboardView {...baseProps} wizardStep={1} />);
    expect(screen.queryByText(/Wizard:/)).toBeNull();
    expect(screen.queryByText(/Passo \d:/)).toBeNull();
  });

  it('shows "Prossimo Passo" label when UDA saved but no active wizard', () => {
    const savedUda = [{ id: '1', title: 'Test UDA' }] as never[];
    render(<DashboardView {...baseProps} savedUda={savedUda} />);
    expect(screen.getByText('Prossimo Passo')).toBeDefined();
    expect(screen.getByText('—')).toBeDefined();
  });
});
