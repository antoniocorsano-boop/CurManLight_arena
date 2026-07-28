import { fireEvent, render, screen } from '@testing-library/react';
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
  it('reports SCORM publication and student import as unavailable without success claims', () => {
    const showToast = vi.fn();
    const handleWorkspaceSync = vi.fn();
    render(<AppHeader {...props({ showToast, handleWorkspaceSync })} />);

    fireEvent.click(screen.getByRole('button', { name: /Pubblicazione SCORM non disponibile/i }));
    fireEvent.click(screen.getByRole('button', { name: /Importazione studenti non disponibile/i }));

    expect(showToast).toHaveBeenNthCalledWith(1, expect.stringMatching(/non disponibile|non configurata/i), false);
    expect(showToast).toHaveBeenNthCalledWith(2, expect.stringMatching(/non disponibile|non configurata/i), false);
    expect(handleWorkspaceSync).not.toHaveBeenCalled();
  });
});
