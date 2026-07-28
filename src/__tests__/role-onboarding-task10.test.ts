import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getRoleLabel } from '../lib/roleLabels';
import { useOnboardingProfile } from '../features/session/hooks/useOnboardingProfile';
import { useCurriculumStore as useActiveStore } from '../store/useCurriculumStore';
import { useCurriculumStore as useShadowStore } from '../stores/useCurriculumStore';

describe('CML-633D Task 10 neutral role and onboarding defaults', () => {
  beforeEach(() => localStorage.clear());

  it('starts active and shadow stores with a non-authenticated undeclared role', () => {
    expect(useActiveStore.getState().role).toBe('non-dichiarato');
    expect(useShadowStore.getState().role).toBe('non-dichiarato');
    expect(getRoleLabel('non-dichiarato')).toMatch(/non dichiarato.*non autenticato/i);
  });

  it('starts onboarding without assigned classes, combinations, or sections', () => {
    const { result } = renderHook(() => useOnboardingProfile({
      order: 'secondaria', setRole: vi.fn(), setDiscipline: vi.fn(), setOrder: vi.fn(), setShowOnboardingModal: vi.fn(), showToast: vi.fn(),
    }));

    expect(result.current.onboardingRole).toBe('non-dichiarato');
    expect(result.current.assignedCombinations).toEqual([]);
    expect(result.current.onboardingCombinations).toEqual([]);
    expect(result.current.availableSections).toEqual([]);
  });

  it('preserves an explicitly persisted teacher role', async () => {
    act(() => useActiveStore.getState().setRole('insegnante'));
    expect(useActiveStore.getState().role).toBe('insegnante');
  });

  it('saves the onboarding selection as a personal local profile, not institutional configuration', () => {
    const showToast = vi.fn();
    const { result } = renderHook(() => useOnboardingProfile({
      order: 'secondaria', setRole: vi.fn(), setDiscipline: vi.fn(), setOrder: vi.fn(), setShowOnboardingModal: vi.fn(), showToast,
    }));
    act(() => result.current.saveOnboardingProfile());
    expect(showToast).toHaveBeenCalledWith(expect.stringMatching(/profilo personale locale/i));
    expect(showToast).not.toHaveBeenCalledWith(expect.stringMatching(/d.istituto.*configurato con successo/i));
  });
});
