// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppSidebar } from '../features/navigation/components/AppSidebar';
import { appTabToPath, pathnameToAppTab } from '../features/navigation/appRouting';
import { SupportGuideView } from '../features/session/components/SupportGuideView';
import { SupportVerificationView } from '../features/session/components/SupportVerificationView';

const neutralInstitution = {
  configured: false,
  instituteName: 'Istituto non configurato',
  organizationId: 'curmanlight-local',
};

describe('SUP-01 canonical support contract', () => {
  it('gives Verifiche a stable route distinct from Documenti', () => {
    expect(appTabToPath('verifiche')).toBe('/verifiche');
    expect(pathnameToAppTab('/verifiche')).toBe('verifiche');
    expect(appTabToPath('certificazione-pa')).toBe('/verifiche');
    expect(appTabToPath('esportazioni')).toBe('/documents');
  });

  it('replaces the nominal checklist entry with Verifiche in support navigation', () => {
    const handleTabSwitch = vi.fn();
    render(
      <AppSidebar
        sidebarCollapsed={false}
        activeTab="dashboard"
        activeCurricoloView="home"
        activeProgTab="home"
        pendingCount={0}
        handleTabSwitch={handleTabSwitch}
        setActiveCurricoloView={vi.fn()}
        setActiveProgTab={vi.fn()}
      />,
    );

    expect(screen.queryByText('Controlli e checklist')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Verifiche' }));
    expect(handleTabSwitch).toHaveBeenCalledWith('verifiche');
  });

  it('renders Verifiche as a real readiness surface without institutional authority claims', () => {
    const setShowSaveModal = vi.fn();
    const { container } = render(
      <SupportVerificationView
        institutionalProfile={neutralInstitution}
        customKbDocs={[]}
        currentDisciplineProps={[]}
        currentDisciplineDecided={0}
        handleTabSwitch={vi.fn()}
        setShowSaveModal={setShowSaveModal}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Verifiche' })).toBeTruthy();
    expect(container.querySelectorAll('[data-verification-state]').length).toBeGreaterThanOrEqual(5);
    expect(screen.getByText(/non certifica il curricolo/i)).toBeTruthy();
    expect(container.querySelector('[data-teacher-surface="documents"]')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Apri le Impostazioni locali/i }));
    expect(setShowSaveModal).toHaveBeenCalledWith(true);
  });

  it('renders Guida as a task-first support surface', () => {
    render(
      <SupportGuideView
        institutionalProfile={neutralInstitution}
        handleTabSwitch={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Guida' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Consultare il curricolo' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Capire cosa manca' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Apri Verifiche/i })).toBeTruthy();
    expect(screen.queryByText(/Progettazione Guidata Unità di Apprendimento/i)).toBeNull();
  });
});
