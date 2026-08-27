import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  it('uses the CurManLight brand control as the mobile open/close navigation toggle', async () => {
    const previousWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });

    const sidebar = document.createElement('aside');
    sidebar.id = 'sidebar';
    sidebar.className = 'hidden md:block';
    document.body.appendChild(sidebar);

    const toggleSidebar = vi.fn(() => {
      sidebar.className = sidebar.classList.contains('hidden')
        ? 'fixed block'
        : 'hidden md:block';
    });

    const { unmount } = render(<AppHeader {...props({ toggleSidebar, roleDropdownOpen: false })} />);

    const openControl = await screen.findByRole('button', { name: 'Apri menu di navigazione' });
    expect(openControl).toHaveAttribute('aria-controls', 'sidebar');
    expect(openControl).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(openControl);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Chiudi menu di navigazione' })).toHaveAttribute('aria-expanded', 'true');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Chiudi menu di navigazione' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Apri menu di navigazione' })).toHaveAttribute('aria-expanded', 'false');
    });

    expect(toggleSidebar).toHaveBeenCalledTimes(2);

    unmount();
    sidebar.remove();
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: previousWidth });
  });
});
