import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardView } from '../features/session/components/DashboardView';
import type { UserRole } from '../types/curriculum';

const baseProps = (role: UserRole = 'insegnante'): ComponentProps<typeof DashboardView> => ({
  activeTab: 'dashboard',
  role,
  savedUda: [],
  decisions: {},
  currentDisciplineProps: [],
  customKbDocs: [],
  wizardStep: 1,
  progTitle: '',
  progStatus: 'bozza',
  documentExportHistory: [],
  handleDownloadCml: vi.fn(),
  handleTabSwitch: vi.fn(),
  setSelectedBrainDoc: vi.fn(),
  setWikiWorkspaceTab: vi.fn(),
  setShowSaveModal: vi.fn(),
  setActiveCurricoloView: vi.fn(),
  setActiveProgTab: vi.fn(),
  setSelectedUda: vi.fn(),
});

describe('R3 Arena role-aware Home v1', () => {
  it('does not fabricate work when runtime state has no actionable signals', () => {
    render(<DashboardView {...baseProps()} />);
    expect(screen.getByText('Nessuna attività azionabile rilevata adesso.')).toBeDefined();
    expect(screen.getByText(/Arena non crea attività artificiali/)).toBeDefined();
  });

  it('projects an unverified local source as actionable verification work for a teacher', () => {
    const props = baseProps('insegnante');
    props.customKbDocs = [{ id: 'source-1', authorityStatus: 'LOCAL_UNVERIFIED' }] as never[];
    render(<DashboardView {...props} />);

    expect(screen.getByText('1 fonte locale da verificare')).toBeDefined();
    const card = document.querySelector('[data-home-work-item="home-source-verification"]');
    expect(card?.getAttribute('data-work-access')).toBe('ACTIONABLE');
    fireEvent.click(screen.getByRole('button', { name: /Controlla le fonti/i }));
    expect(props.handleTabSwitch).toHaveBeenCalledWith('fonti');
  });

  it('keeps revision-review work read-only for a teacher', () => {
    const props = baseProps('insegnante');
    props.currentDisciplineProps = [{ id: 'proposal-1' }] as never[];
    render(<DashboardView {...props} />);

    expect(screen.getByText('1 proposta ancora aperta')).toBeDefined();
    const card = document.querySelector('[data-home-work-item="home-pending-revisions"]');
    expect(card?.getAttribute('data-work-access')).toBe('READ_ONLY');
    expect(screen.getByRole('button', { name: /Apri per consultare/i })).toBeDefined();
  });

  it('makes the same real revision work actionable for Dipartimento', () => {
    const props = baseProps('dipartimento');
    props.currentDisciplineProps = [{ id: 'proposal-1' }] as never[];
    render(<DashboardView {...props} />);

    const card = document.querySelector('[data-home-work-item="home-pending-revisions"]');
    expect(card?.getAttribute('data-work-access')).toBe('ACTIONABLE');
    expect(screen.getByRole('button', { name: /Rivedi le proposte/i })).toBeDefined();
  });

  it('does not turn a locally selected Collegio role into institutional authority', () => {
    const props = baseProps('collegio');
    props.currentDisciplineProps = [{ id: 'proposal-1' }] as never[];
    render(<DashboardView {...props} />);

    expect(document.querySelector('[data-home-assurance="self-declared"]')).not.toBeNull();
    expect(screen.queryByText('Da decidere')).toBeNull();
    expect(screen.getByText(/non attribuisce da sola autorità istituzionale/i)).toBeDefined();
  });

  it('keeps completed handoff history outside the actionable queue', () => {
    const props = baseProps('insegnante');
    props.documentExportHistory = [{ id: 'export-1', label: 'Curricolo Tecnologia' }] as never[];
    render(<DashboardView {...props} />);

    const card = document.querySelector('[data-home-work-item="home-latest-handoff"]');
    expect(card?.getAttribute('data-work-state')).toBe('COMPLETED');
    expect(card?.getAttribute('data-work-access')).toBe('READ_ONLY');
  });
});
