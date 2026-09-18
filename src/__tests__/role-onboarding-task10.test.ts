import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getRoleLabel } from '../lib/roleLabels';
import { useOnboardingProfile } from '../features/session/hooks/useOnboardingProfile';
import {
  PERSONAL_WORK_PROFILE_SCHEMA_VERSION,
  PERSONAL_WORK_PROFILE_STORAGE_KEY,
  parsePersonalWorkProfile,
  toPersonalProfileRole,
} from '../features/session/domain/personalWorkProfile';
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
      role: 'non-dichiarato', discipline: 'italiano', order: 'secondaria', setRole: vi.fn(), setDiscipline: vi.fn(), setOrder: vi.fn(), setShowOnboardingModal: vi.fn(), showToast: vi.fn(),
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

  it('does not allow institutional team roles to become personal onboarding roles', () => {
    expect(toPersonalProfileRole('insegnante')).toBe('insegnante');
    expect(toPersonalProfileRole('dipartimento')).toBe('non-dichiarato');
    expect(toPersonalProfileRole('referente')).toBe('non-dichiarato');
    expect(toPersonalProfileRole('dirigente')).toBe('non-dichiarato');
    expect(toPersonalProfileRole('collegio')).toBe('non-dichiarato');
    expect(toPersonalProfileRole('amministratore')).toBe('non-dichiarato');

    const { result } = renderHook(() => useOnboardingProfile({
      role: 'non-dichiarato', discipline: 'italiano', order: 'secondaria', setRole: vi.fn(), setDiscipline: vi.fn(), setOrder: vi.fn(), setShowOnboardingModal: vi.fn(), showToast: vi.fn(),
    }));

    act(() => result.current.setOnboardingRoleLocal('dipartimento'));
    expect(result.current.onboardingRole).toBe('non-dichiarato');
    act(() => result.current.setOnboardingRoleLocal('insegnante'));
    expect(result.current.onboardingRole).toBe('insegnante');
  });

  it('persists the versioned personal profile only on explicit save', () => {
    const showToast = vi.fn();
    const setRole = vi.fn();
    const { result } = renderHook(() => useOnboardingProfile({
      role: 'non-dichiarato', discipline: 'italiano', order: 'secondaria', setRole, setDiscipline: vi.fn(), setOrder: vi.fn(), setShowOnboardingModal: vi.fn(), showToast,
    }));

    act(() => {
      result.current.setOnboardingRoleLocal('insegnante');
      result.current.setAvailableSections(['D']);
      result.current.setOnboardingCombinations(['1^D']);
    });

    expect(localStorage.getItem(PERSONAL_WORK_PROFILE_STORAGE_KEY)).toBeNull();

    act(() => result.current.saveOnboardingProfile());
    const profile = parsePersonalWorkProfile(localStorage.getItem(PERSONAL_WORK_PROFILE_STORAGE_KEY));
    expect(profile).not.toBeNull();
    expect(profile?.schemaVersion).toBe(PERSONAL_WORK_PROFILE_SCHEMA_VERSION);
    expect(profile?.role).toBe('insegnante');
    expect(profile?.availableSections).toEqual(['D']);
    expect(profile?.assignedCombinations).toEqual(['1^D']);
    expect(setRole).toHaveBeenCalledWith('insegnante');
    expect(showToast).toHaveBeenCalledWith(expect.stringMatching(/profilo di lavoro personale salvato/i));
  });

  it('saves the onboarding selection as a personal local profile, not institutional configuration', () => {
    const showToast = vi.fn();
    const { result } = renderHook(() => useOnboardingProfile({
      role: 'non-dichiarato', discipline: 'italiano', order: 'secondaria', setRole: vi.fn(), setDiscipline: vi.fn(), setOrder: vi.fn(), setShowOnboardingModal: vi.fn(), showToast,
    }));
    act(() => result.current.saveOnboardingProfile());
    expect(showToast).toHaveBeenCalledWith(expect.stringMatching(/profilo di lavoro personale/i));
    expect(showToast).not.toHaveBeenCalledWith(expect.stringMatching(/d.istituto.*configurato con successo/i));
  });
});
