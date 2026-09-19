import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppHeader } from '../features/navigation';
import { useOnboardingProfile } from '../features/session/hooks/useOnboardingProfile';

const headerProps = (openLocalProfileEditor: () => void): ComponentProps<typeof AppHeader> => ({
  toggleSidebar: vi.fn(), isCopilotChatOpen: false, setIsCopilotChatOpen: vi.fn(), setShowAgentSetupModal: vi.fn(),
  localAgentStatus: 'none', localAgentType: 'none', ollamaStatus: 'disconnected', ollamaModelName: '', localAgentSize: 'none',
  setShowSaveModal: vi.fn(), roleDropdownOpen: false, setRoleDropdownOpen: vi.fn(), isWorkspaceLoggedIn: false,
  cloudAccountType: 'personale', workspaceUserEmail: '', handleWorkspaceSync: vi.fn(), showToast: vi.fn(),
  handleClearLocalStorageWithReset: vi.fn(), handleWorkspaceLogout: vi.fn(), openLocalProfileEditor, setShowCloudAccountModal: vi.fn(),
});

describe('local profile editor remains reachable after onboarding', () => {
  beforeEach(() => localStorage.clear());
  it('opens from the avatar menu', () => {
    const openLocalProfileEditor = vi.fn();
    render(<AppHeader {...headerProps(openLocalProfileEditor)} />);
    fireEvent.click(screen.getByRole('button', { name: /Profilo:/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Modifica profilo locale' }));
    expect(openLocalProfileEditor).toHaveBeenCalledTimes(1);
  });
  it('rehydrates saved choices and persists draft sections only on final save', () => {
    localStorage.setItem('curman_assignedCombinations', '1A,2B');
    localStorage.setItem('curman_availableSections', 'A,B');
    localStorage.setItem('curman_isSostegno', 'false');
    const setShowOnboardingModal = vi.fn();
    const { result } = renderHook(() => useOnboardingProfile({ role: 'insegnante', discipline: 'tecnologia', order: 'secondaria', setRole: vi.fn(), setDiscipline: vi.fn(), setOrder: vi.fn(), setShowOnboardingModal, showToast: vi.fn() }));
    act(() => result.current.openOnboardingProfileEditor());
    expect(result.current.onboardingRole).toBe('insegnante');
    expect(result.current.onboardingDisc).toBe('tecnologia');
    expect(result.current.onboardingOrd).toBe('secondaria');
    expect(result.current.onboardingCombinations).toEqual(['1A', '2B']);
    expect(result.current.availableSections).toEqual(['A', 'B']);
    expect(result.current.onboardingStep).toBe(1);
    expect(setShowOnboardingModal).toHaveBeenCalledWith(true);
    act(() => result.current.setNewSectionInput('C'));
    act(() => result.current.handleAddSectionLocal());
    expect(result.current.availableSections).toEqual(['A', 'B', 'C']);
    expect(localStorage.getItem('curman_availableSections')).toBe('A,B');
    act(() => result.current.saveOnboardingProfile());
    expect(localStorage.getItem('curman_availableSections')).toBe('A,B,C');
  });
});
