import { describe, expect, it } from 'vitest';
import shellSource from '../features/documents/components/SecondBrainTab.tsx?raw';

describe('KX local retrieval outcome presentation', () => {
  it('distinguishes abstention from evidence without presenting both as a local answer', () => {
    expect(shellSource).toContain("INSUFFICIENT_EVIDENCE_PREFIX");
    expect(shellSource).toContain("kind: 'INSUFFICIENT_EVIDENCE'");
    expect(shellSource).toContain('Non ho trovato evidenze sufficienti');
    expect(shellSource).toContain("kind: 'EVIDENCE_FOUND'");
    expect(shellSource).toContain('Passaggi trovati nelle fonti');
    expect(shellSource).toContain('data-kx-search-outcome={searchResultPresentation.kind}');
    expect(shellSource).not.toContain('Risposta locale da verificare');
  });

  it('describes the search as evidence retrieval rather than guaranteed answering', () => {
    expect(shellSource).toContain("Arena mostra soltanto passaggi supportati dalle fonti oppure segnala quando l'evidenza non basta.");
    expect(shellSource).not.toContain('La risposta resta da verificare nelle fonti.');
  });
});
