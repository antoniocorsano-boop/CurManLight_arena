import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AppHeader, AppSidebar } from '../features/navigation';

function sidebarProps(overrides: Partial<ComponentProps<typeof AppSidebar>> = {}): ComponentProps<typeof AppSidebar> {
  return {
    sidebarCollapsed: false,
    activeTab: 'dashboard',
    activeCurricoloView: 'home',
    activeProgTab: 'home',
    pendingCount: 0,
    handleTabSwitch: vi.fn(),
    setActiveCurricoloView: vi.fn(),
    setActiveProgTab: vi.fn(),
    ...overrides,
  };
}

function headerProps(overrides: Partial<ComponentProps<typeof AppHeader>> = {}): ComponentProps<typeof AppHeader> {
  return {
    toggleSidebar: vi.fn(),
    isCopilotChatOpen: false,
    setIsCopilotChatOpen: vi.fn(),
    setShowAgentSetupModal: vi.fn(),
    localAgentStatus: 'none',
    localAgentType: 'none',
    ollamaStatus: 'disconnected',
    ollamaModelName: '',
    localAgentSize: 'none',
    setShowSaveModal: vi.fn(),
    roleDropdownOpen: true,
    setRoleDropdownOpen: vi.fn(),
    isWorkspaceLoggedIn: false,
    cloudAccountType: 'personale',
    workspaceUserEmail: '',
    handleWorkspaceSync: vi.fn(),
    showToast: vi.fn(),
    handleClearLocalStorageWithReset: vi.fn(),
    handleWorkspaceLogout: vi.fn(),
    setShowCloudAccountModal: vi.fn(),
    ...overrides,
  };
}

describe('CML-TARGET-P1.1 canonical product shell', () => {
  it('shows canonical professional areas without legacy tool labels', () => {
    render(<AppSidebar {...sidebarProps()} />);

    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Curricolo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Progettazione' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Documenti' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Classe' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Impostazioni' })).toBeInTheDocument();
    expect(screen.queryByText('Consulta Curricolo')).not.toBeInTheDocument();
    expect(screen.queryByText('Integrazione & Popolamento')).not.toBeInTheDocument();
    expect(screen.queryByText('Pilota Sperimentale')).not.toBeInTheDocument();
    expect(screen.queryByText("Esportazione File d'Ufficio")).not.toBeInTheDocument();
  });

  it('keeps canonical areas connected to existing runtime tabs', () => {
    const handleTabSwitch = vi.fn();
    render(<AppSidebar {...sidebarProps({ handleTabSwitch })} />);

    fireEvent.click(screen.getByRole('button', { name: 'Documenti' }));
    fireEvent.click(screen.getByRole('button', { name: 'Impostazioni' }));

    expect(handleTabSwitch).toHaveBeenNthCalledWith(1, 'esportazioni');
    expect(handleTabSwitch).toHaveBeenNthCalledWith(2, 'fonti');
  });

  it('keeps assistance visible while hiding technical and unavailable header noise', () => {
    render(<AppHeader {...headerProps()} />);

    expect(screen.getByRole('button', { name: /Assistente/i })).toBeInTheDocument();
    expect(screen.queryByText(/WebGPU|Ollama|IA: Baseline/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /SCORM|Importazione studenti/i })).not.toBeInTheDocument();
  });
});
