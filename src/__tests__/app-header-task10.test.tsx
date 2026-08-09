import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AppHeader } from '../features/navigation';

function props(overrides: Partial<ComponentProps<typeof AppHeader>> = {}): ComponentProps<typeof AppHeader> {
  return {
    toggleSidebar: vi.fn(), isCopilotChatOpen: false, setIsCopilotChatOpen: vi.fn(), setShowAgentSetupModal: vi.fn(), localAgentStatus: 'none', localAgentType: 'none',
    ollamaStatus: 'disconnected', ollamaModelName: '', localAgentSize: 'none', setShowSaveModal: vi.fn(), roleDropdownOpen: true, setRoleDropdownOpen: vi.fn(),
    isWorkspaceLoggedIn: false, cloudAccountType: 'personale', workspaceUserEmail: '', handleWorkspaceSync: vi.fn(), showToast: vi.fn(), handleClearLocalStorageWithReset: vi.fn(),
    handleWorkspaceLogout: vi.fn(), setShowCloudAccountModal: vi.fn(), ...overrides,
  };
}

describe('CML-633D Task 10 AppHeader honesty', () => {
  it('keeps unavailable capabilities out of the primary profile surface', () => {
    const showToast = vi.fn();
    const handleWorkspaceSync = vi.fn();
    render(<AppHeader {...props({ showToast, handleWorkspaceSync })} />);

    expect(screen.queryByRole('button', { name: /Pubblicazione SCORM|Importazione studenti/i })).not.toBeInTheDocument();
    expect(handleWorkspaceSync).not.toHaveBeenCalled();
  });
});
