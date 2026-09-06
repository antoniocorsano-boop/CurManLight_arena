import source from '../features/session/components/OperationalOnboardingModal.tsx?raw';
import { describe, expect, it } from 'vitest';

describe('Arena operational onboarding', () => {
  it('asks for discipline competence and derives groups without names', () => {
    expect(source).toContain('Quali sono le tue discipline di competenza?');
    expect(source).toContain('Gruppi operativi derivati');
    expect(source).toContain('Coordinamento operativo');
    expect(source).toContain('Sono coordinatore operativo di');
    expect(source).not.toContain('Nome e cognome');
  });

  it('keeps coordinator, competence and institutional authority separate', () => {
    expect(source).toContain('non costituisce nomina istituzionale');
    expect(source).toContain('Non acquisisce per questo competenza nelle altre discipline');
    expect(source).toContain('Educazione civica e AI Literacy non costituiscono un quinto gruppo');
  });
});
