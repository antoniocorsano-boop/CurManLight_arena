import { describe, expect, it } from 'vitest';
import storeSource from '../features/documents/lib/localKnowledgeStore.ts?raw';
import shellSource from '../features/documents/components/SecondBrainTab.tsx?raw';

describe('KX-4 local source verification', () => {
  it('adds a local verified state without creating institutional authority', () => {
    expect(storeSource).toContain("'LOCAL_UNVERIFIED' | 'LOCAL_VERIFIED'");
    expect(storeSource).toContain('verifiedAt?: string');
    expect(storeSource).toContain('verifyLocalKnowledgeSource');
    expect(storeSource).not.toContain('INSTITUTIONAL_VERIFIED');
    expect(storeSource).not.toContain('OFFICIAL');
  });

  it('requires an explicit human confirmation journey', () => {
    expect(shellSource).toContain('data-kx-task="source-verification"');
    expect(shellSource).toContain('Apri e verifica');
    expect(shellSource).toContain('Conferma come fonte locale verificata');
    expect(shellSource).toContain('controlla nel lettore il contenuto estratto e la provenienza disponibile');
    expect(shellSource).toContain('verifica locale umana');
  });

  it('keeps verified local sources below institutional authority', () => {
    expect(shellSource).toContain('non rende il documento una fonte normativa o istituzionale');
    expect(shellSource).toContain('non modifica il curricolo approvato');
    expect(shellSource).toContain('Non è stata resa fonte istituzionale');
    expect(shellSource).toContain('Fonte locale verificata');
  });
});
