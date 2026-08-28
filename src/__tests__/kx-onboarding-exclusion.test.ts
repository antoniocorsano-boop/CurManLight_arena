import { describe, expect, it } from 'vitest';
import startupSource from '../features/session/hooks/useAppStartupEffects.ts?raw';
import knowledgeShellSource from '../features/documents/components/SecondBrainTab.tsx?raw';

describe('KX focused knowledge/onboarding exclusion', () => {
  it('announces the focused knowledge surface when it mounts', () => {
    expect(knowledgeShellSource).toContain("window.dispatchEvent(new CustomEvent('arena:knowledge-open'))");
  });

  it('cancels pending onboarding and closes automatic onboarding for knowledge', () => {
    expect(startupSource).toContain("window.addEventListener('arena:knowledge-open', deferAutomaticOnboardingForFocusedTask)");
    expect(startupSource).toContain('cancelPendingOnboarding();');
    expect(startupSource).toContain('setShowOnboardingModal(false);');
    expect(startupSource).toContain("window.removeEventListener('arena:knowledge-open', deferAutomaticOnboardingForFocusedTask)");
  });

  it('does not persist completion when knowledge suppresses automatic onboarding', () => {
    const exclusionBlock = startupSource.slice(
      startupSource.indexOf('const deferAutomaticOnboardingForFocusedTask'),
      startupSource.indexOf("window.addEventListener('arena:assistant-open'")
    );

    expect(exclusionBlock).not.toMatch(/safeLocalStorageSetItem|setRole\(|setDiscipline\(|setOrder\(/);
  });
});
