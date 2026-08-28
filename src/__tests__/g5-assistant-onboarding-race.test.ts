import { describe, expect, it } from 'vitest';
import startupSource from '../features/session/hooks/useAppStartupEffects.ts?raw';

describe('G5 assistant/onboarding startup exclusion', () => {
  it('cancels deferred onboarding when the assistant opens', () => {
    expect(startupSource).toContain("window.addEventListener('arena:assistant-open', cancelPendingOnboarding)");
    expect(startupSource).toContain('clearTimeout(onboardingTimer)');
    expect(startupSource).toContain('onboardingTimer = setTimeout(() =>');
    expect(startupSource).toContain("window.removeEventListener('arena:assistant-open', cancelPendingOnboarding)");
  });

  it('does not persist completion when the assistant suppresses automatic onboarding', () => {
    const cancellationBlock = startupSource.slice(
      startupSource.indexOf('const cancelPendingOnboarding'),
      startupSource.indexOf("window.addEventListener('arena:assistant-open'")
    );

    expect(cancellationBlock).not.toMatch(/safeLocalStorageSetItem|setRole\(|setDiscipline\(|setOrder\(/);
  });
});
