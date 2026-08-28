import { describe, expect, it } from 'vitest';
import shellSource from '../features/documents/components/SecondBrainTab.tsx?raw';

const FORBIDDEN_PUBLIC_TERMS = [
  'WikiLLM',
  'Second Brain',
  'Graphify',
  'Zustand',
  '.tsx',
  '.ts)',
];

describe('KX-1 plain-language knowledge shell', () => {
  it('uses the canonical task-first labels', () => {
    expect(shellSource).toContain('Conoscenza e fonti');
    expect(shellSource).toContain('Cerca e chiedi');
    expect(shellSource).toContain('Relazioni');
    expect(shellSource).toContain('Termini chiave');
    expect(shellSource).toContain('Archivio storico');
  });

  it('keeps the human authority boundary visible', () => {
    expect(shellSource).toContain('restano da verificare');
    expect(shellSource).toContain('decisione istituzionale');
  });

  it('does not expose implementation vocabulary in the public shell', () => {
    for (const term of FORBIDDEN_PUBLIC_TERMS) {
      expect(shellSource).not.toContain(term);
    }
  });

  it('preserves the legacy implementation behind a compatibility layer', () => {
    expect(shellSource).toContain("from './SecondBrainTabLegacy'");
    expect(shellSource).toContain('kx-legacy-shell');
  });
});
