import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AppHeader } from '../features/navigation';

function props(overrides: Partial<ComponentProps<typeof AppHeader>> = {}): ComponentProps<typeof AppHeader> {
  return {
    toggleSidebar: vi.fn(), isCopilotChatOpen: false, setIsCopilotChatOpen: vi.fn(), setShowAgentSetupModal: vi.fn(), localAgentStatus: 'none', localAgentType: 'none',
    ollamaStatus: 'disconnected', ollamaModelName: '', localAgentSize: 'none', setShowSaveModal: vi.fn(), roleDropdownOpen: false, setRoleDropdownOpen: vi.fn(),
    isWorkspaceLoggedIn: false, cloudAccountType: 'personale', workspaceUserEmail: '', handleWorkspaceSync: vi.fn(), showToast: vi.fn(), handleClearLocalStorageWithReset: vi.fn(),
    handleWorkspaceLogout: vi.fn(), openLocalProfileEditor: vi.fn(), setShowCloudAccountModal: vi.fn(), ...overrides,
  };
}

describe('Arena Beta canonical AppHeader', () => {
  it('keeps unavailable and experimental capabilities out of the primary header', () => {
    const { container } = render(<AppHeader {...props()} />);

    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByText(/Co-pilota Chat|Baseline d'Aula|Pubblicazione SCORM|Importazione studenti/i)).not.toBeInTheDocument();
    expect(screen.getByText('CurManLight')).toBeInTheDocument();
    expect(screen.getByText('Curricolo d’istituto')).toBeInTheDocument();
  });

  it('exposes a bounded assistant entry without making it a primary navigation area', () => {
    const setIsCopilotChatOpen = vi.fn();
    render(<AppHeader {...props({ setIsCopilotChatOpen })} />);

    const assistant = screen.getByRole('button', { name: 'Apri Assistente Arena' });
    expect(assistant).toHaveAttribute('data-assistant-entry', 'bounded');
    expect(assistant).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(assistant);
    expect(setIsCopilotChatOpen).toHaveBeenCalledWith(true);
  });

  it('exposes session continuity without claiming institutional authority', () => {
    const setRoleDropdownOpen = vi.fn();
    render(<AppHeader {...props({ roleDropdownOpen: true, setRoleDropdownOpen })} />);

    expect(screen.getByText('Sessione locale')).toBeInTheDocument();
    expect(screen.getByText(/Nessun accesso istituzionale verificato/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Collega un account' })).toBeInTheDocument();
  });

  it('keeps save as an explicit session action', () => {
    const setShowSaveModal = vi.fn();
    render(<AppHeader {...props({ setShowSaveModal })} />);

    fireEvent.click(screen.getByRole('button', { name: 'Gestisci una copia della sessione' }));
    expect(setShowSaveModal).toHaveBeenCalledWith(true);
  });
});
