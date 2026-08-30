import { describe, expect, it } from 'vitest';
import storeSource from '../features/documents/lib/localKnowledgeStore.ts?raw';
import presentationSource from '../features/documents/lib/knowledgeSourcePresentation.ts?raw';
import shellSource from '../features/documents/components/SecondBrainTab.tsx?raw';

describe('KX-4 canonical local source verification', () => {
  it('keeps one local authority state model without institutional promotion', () => {
    expect(storeSource).toContain("'LOCAL_UNVERIFIED' | 'LOCAL_VERIFIED'");
    expect(storeSource).toContain('verifiedAt?: string');
    expect(storeSource).toContain('verifyLocalKnowledgeSource');
    expect(storeSource).not.toContain('INSTITUTIONAL_VERIFIED');
    expect(storeSource).not.toContain('OFFICIAL');
  });

  it('derives source presentation from the authority state in one canonical model', () => {
    expect(presentationSource).toContain('deriveKnowledgeSourcePresentation');
    expect(presentationSource).toContain("source.authorityStatus === 'LOCAL_VERIFIED'");
    expect(presentationSource).toContain('Fonte locale da verificare');
    expect(presentationSource).toContain('Fonte locale verificata');
    expect(presentationSource).toContain('institutionalAuthority: false');
  });

  it('requires an explicit human confirmation journey', () => {
    expect(shellSource).toContain('data-kx-task="source-verification"');
    expect(shellSource).toContain('Apri e verifica');
    expect(shellSource).toContain('Conferma come fonte locale verificata');
    expect(shellSource).toContain('Controlla titolo, provenienza e contenuto');
  });

  it('keeps verified local sources below institutional authority', () => {
    expect(shellSource).toContain('non rende la fonte normativa o istituzionale');
    expect(shellSource).toContain('non modifica il curricolo approvato');
    expect(shellSource).toContain('Non è stata resa fonte istituzionale');
  });

  it('does not delegate the canonical knowledge surface back to the legacy component', () => {
    expect(shellSource).not.toContain('SecondBrainTabLegacy');
    expect(shellSource).not.toContain('LegacySecondBrainTab');
    expect(shellSource).toContain('deriveKnowledgeSourcePresentation');
    expect(shellSource).toContain('data-kx-shell="teacher-first-v3"');
  });
});
