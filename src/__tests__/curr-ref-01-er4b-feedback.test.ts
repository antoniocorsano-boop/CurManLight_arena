import { describe, expect, it } from 'vitest';
import reviewShellSource from '../features/beta/CaseScopedExperienceShell.tsx?raw';
import reviewEntrySource from '../features/beta/CaseAwareRevisionSurface.tsx?raw';

describe('CURR-REF-01/E-R4b — riscontro percettibile del riesame', () => {
  it('mostra un esito accessibile dopo la conclusione senza simulare approvazione istituzionale', () => {
    // @trama-feedback-test: la conferma del caso è verificabile nella superficie visibile.
    expect(reviewShellSource).toContain('role="status"');
    expect(reviewShellSource).toContain('aria-live="polite"');
    expect(reviewShellSource).toContain('data-case-professional-completion-acknowledgement');
    expect(reviewShellSource).toContain('Gli esiti professionali del caso sono stati registrati.');
    expect(reviewShellSource).toContain('non equivale a una decisione istituzionale');
    expect(reviewEntrySource).toContain('recordCompletionAcknowledgement(focusedCase.id)');
    expect(reviewEntrySource).toContain('data-case-completion-awaiting-acknowledgement');
  });
});
