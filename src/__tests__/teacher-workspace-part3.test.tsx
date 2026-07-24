import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
  documentExportHistory: [] as never[],
  handleDownloadCml: vi.fn(),
  handleTabSwitch: vi.fn(),
  setSelectedBrainDoc: vi.fn(),
  setWikiWorkspaceTab: vi.fn() as never,
  setShowSaveModal: vi.fn(),
  setActiveCurricoloView: vi.fn(),
  setActiveProgTab: vi.fn(),
  setSelectedUda: vi.fn(),
};

describe('Teacher Workspace Part 3 — Action navigation integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // --- State: In corso → Continua UDA ---

  it('1. In corso → Continua UDA navigates to wizard view', () => {
    const handleTabSwitch = vi.fn();
    const setActiveProgTab = vi.fn();
    render(<DashboardView {...baseProps} wizardStep={3} handleTabSwitch={handleTabSwitch} setActiveProgTab={setActiveProgTab} />);
    screen.getByTestId('teacher-action-continue').click();
    expect(handleTabSwitch).toHaveBeenCalledTimes(1);
    expect(handleTabSwitch).toHaveBeenCalledWith('progetta-annuale');
    expect(setActiveProgTab).toHaveBeenCalledTimes(1);
    expect(setActiveProgTab).toHaveBeenCalledWith('annuale');
  });

  // --- State: Bozza → Consulta UDA ---

  it('2. Bozza salvata → Consulta UDA navigates to archive view', () => {
    const handleTabSwitch = vi.fn();
    const setActiveProgTab = vi.fn();
    const savedUda = [{ id: '1', title: 'Test UDA' }] as never[];
    render(<DashboardView {...baseProps} savedUda={savedUda} handleTabSwitch={handleTabSwitch} setActiveProgTab={setActiveProgTab} />);
    screen.getByTestId('teacher-action-consult').click();
    expect(handleTabSwitch).toHaveBeenCalledTimes(1);
    expect(handleTabSwitch).toHaveBeenCalledWith('progetta-annuale');
    expect(setActiveProgTab).toHaveBeenCalledTimes(1);
    expect(setActiveProgTab).toHaveBeenCalledWith('uda');
  });

  // --- State: Completo → Consulta UDA ---

  it('3. Completo → Consulta UDA navigates to archive view', () => {
    const handleTabSwitch = vi.fn();
    const setActiveProgTab = vi.fn();
    const savedUda = [{ id: '1', title: 'Test UDA' }] as never[];
    render(<DashboardView {...baseProps} savedUda={savedUda} progStatus="pronta per confronto" handleTabSwitch={handleTabSwitch} setActiveProgTab={setActiveProgTab} />);
    screen.getByTestId('teacher-action-consult').click();
    expect(handleTabSwitch).toHaveBeenCalledTimes(1);
    expect(handleTabSwitch).toHaveBeenCalledWith('progetta-annuale');
    expect(setActiveProgTab).toHaveBeenCalledTimes(1);
    expect(setActiveProgTab).toHaveBeenCalledWith('uda');
  });

  // --- State: Nessuna attività → Inizia dal Curricolo ---

  it('4. Nessuna attività → Inizia dal Curricolo navigates to curriculum', () => {
    const handleTabSwitch = vi.fn();
    render(<DashboardView {...baseProps} handleTabSwitch={handleTabSwitch} />);
    screen.getByTestId('teacher-action-start').click();
    expect(handleTabSwitch).toHaveBeenCalledTimes(1);
    expect(handleTabSwitch).toHaveBeenCalledWith('curricolo');
  });

  // --- Single event per click ---

  it('5. single event per click — no double fire', () => {
    const handleTabSwitch = vi.fn();
    const setActiveProgTab = vi.fn();
    render(<DashboardView {...baseProps} wizardStep={2} handleTabSwitch={handleTabSwitch} setActiveProgTab={setActiveProgTab} />);
    fireEvent.click(screen.getByTestId('teacher-action-continue'));
    expect(handleTabSwitch).toHaveBeenCalledTimes(1);
    expect(setActiveProgTab).toHaveBeenCalledTimes(1);
  });

  // --- Keyboard activation ---

  it('6. buttons are keyboard accessible', () => {
    render(<DashboardView {...baseProps} />);
    const btn = screen.getByTestId('teacher-action-start');
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).not.toHaveAttribute('disabled');
  });

  // --- No wizardStep modification ---

  it('7. Continua UDA does not modify wizardStep', () => {
    const setWizardStep = vi.fn();
    const handleTabSwitch = vi.fn();
    render(<DashboardView {...baseProps} wizardStep={3} handleTabSwitch={handleTabSwitch} />);
    screen.getByTestId('teacher-action-continue').click();
    expect(setWizardStep).not.toHaveBeenCalled();
  });

  // --- No new activity created ---

  it('8. no addUda or createUda called on action click', () => {
    const handleTabSwitch = vi.fn();
    render(<DashboardView {...baseProps} handleTabSwitch={handleTabSwitch} />);
    screen.getByTestId('teacher-action-start').click();
    expect(handleTabSwitch).toHaveBeenCalledWith('curricolo');
    expect(handleTabSwitch).not.toHaveBeenCalledWith('progetta-annuale');
  });

  // --- Role visibility ---

  it('9. actions only visible for insegnante', () => {
    render(<DashboardView {...baseProps} role="dipartimento" />);
    expect(screen.queryByTestId('teacher-action-continue')).toBeNull();
    expect(screen.queryByTestId('teacher-action-consult')).toBeNull();
    expect(screen.queryByTestId('teacher-action-start')).toBeNull();
  });

  it('10. actions visible for insegnante', () => {
    render(<DashboardView {...baseProps} />);
    expect(screen.getByTestId('teacher-action-start')).toBeDefined();
  });

  // --- No routing changes ---

  it('11. no navigate or router.push called', () => {
    const handleTabSwitch = vi.fn();
    render(<DashboardView {...baseProps} handleTabSwitch={handleTabSwitch} />);
    screen.getByTestId('teacher-action-start').click();
    expect(handleTabSwitch).toHaveBeenCalledWith('curricolo');
  });

  // --- Compatibility with Part 1 ---

  it('12. wizardStep preserved from Part 1 persistence', () => {
    localStorage.setItem('curman_wizardStep', '4');
    const handleTabSwitch = vi.fn();
    const setActiveProgTab = vi.fn();
    render(<DashboardView {...baseProps} wizardStep={4} handleTabSwitch={handleTabSwitch} setActiveProgTab={setActiveProgTab} />);
    expect(screen.getByText('In corso')).toBeDefined();
    screen.getByTestId('teacher-action-continue').click();
    expect(setActiveProgTab).toHaveBeenCalledWith('annuale');
  });

  // --- Compatibility with Part 2 ---

  it('13. work status badge still correct after action change', () => {
    const savedUda = [{ id: '1', title: 'Test UDA' }] as never[];
    render(<DashboardView {...baseProps} savedUda={savedUda} />);
    expect(screen.getByText('Bozza salvata')).toBeDefined();
    expect(screen.getByTestId('teacher-action-consult')).toBeDefined();
  });

  // --- Consulta UDA destination ---

  it('14. Consulta UDA targets archive view, not wizard view', () => {
    const setActiveProgTab = vi.fn();
    const savedUda = [{ id: '1', title: 'Test UDA' }] as never[];
    render(<DashboardView {...baseProps} savedUda={savedUda} setActiveProgTab={setActiveProgTab} />);
    screen.getByTestId('teacher-action-consult').click();
    expect(setActiveProgTab).toHaveBeenCalledWith('uda');
    expect(setActiveProgTab).not.toHaveBeenCalledWith('annuale');
  });
});
