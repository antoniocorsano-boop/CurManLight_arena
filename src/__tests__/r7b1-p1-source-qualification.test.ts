import { describe, expect, it } from 'vitest';
import { isEligibleEvidence, qualifySource } from '../domain/institution/sourceQualification';

const candidate = (origin: 'BUNDLED' | 'USER_UPLOAD' | 'AUTHORITY_CANDIDATE') => ({
  sourceId: `source-${origin.toLowerCase()}`,
  origin,
  title: 'Fonte di prova',
  locator: 'https://example.invalid/source',
  contentAvailable: true,
});

describe('R7B1 P1 source qualification', () => {
  it('keeps every source origin consult-only unless explicitly qualified', () => {
    for (const origin of ['BUNDLED', 'USER_UPLOAD', 'AUTHORITY_CANDIDATE'] as const) {
      const result = qualifySource({
        candidate: candidate(origin),
        decision: 'CONSULT_ONLY',
        qualifiedByHuman: false,
        qualifiedAt: '2026-09-02T10:45:00+02:00',
      });
      expect(result.eligibleEvidence).toBe(false);
      expect(isEligibleEvidence(result)).toBe(false);
    }
  });

  it('never promotes a bundled source automatically', () => {
    expect(() => qualifySource({
      candidate: candidate('BUNDLED'),
      decision: 'ELIGIBLE_EVIDENCE',
      qualifiedByHuman: false,
      authorityBasis: 'Fonte ufficiale inclusa nel bundle',
      qualifiedAt: '2026-09-02T10:45:00+02:00',
    })).toThrow(/HUMAN_CONFIRMATION_REQUIRED/);
  });

  it('requires an explicit authority basis before evidence eligibility', () => {
    expect(() => qualifySource({
      candidate: candidate('USER_UPLOAD'),
      decision: 'ELIGIBLE_EVIDENCE',
      qualifiedByHuman: true,
      qualifiedAt: '2026-09-02T10:45:00+02:00',
    })).toThrow(/AUTHORITY_BASIS_REQUIRED/);
  });

  it('produces eligible evidence only after human qualification with provenance', () => {
    const result = qualifySource({
      candidate: candidate('AUTHORITY_CANDIDATE'),
      decision: 'ELIGIBLE_EVIDENCE',
      qualifiedByHuman: true,
      authorityBasis: 'Pubblicazione ufficiale verificata dal revisore',
      qualifiedAt: '2026-09-02T10:45:00+02:00',
      notes: '  Verifica manuale completata.  ',
    });
    expect(result.qualification).toBe('ELIGIBLE_EVIDENCE');
    expect(result.eligibleEvidence).toBe(true);
    expect(result.qualifiedByHuman).toBe(true);
    expect(result.authorityBasis).toBe('Pubblicazione ufficiale verificata dal revisore');
    expect(result.notes).toBe('Verifica manuale completata.');
    expect(isEligibleEvidence(result)).toBe(true);
  });

  it('fails closed when source content or provenance is not usable', () => {
    expect(() => qualifySource({
      candidate: { ...candidate('USER_UPLOAD'), contentAvailable: false },
      decision: 'CONSULT_ONLY',
      qualifiedByHuman: false,
      qualifiedAt: '2026-09-02T10:45:00+02:00',
    })).toThrow(/CONTENT_REQUIRED/);
    expect(() => qualifySource({
      candidate: { ...candidate('USER_UPLOAD'), locator: '   ' },
      decision: 'CONSULT_ONLY',
      qualifiedByHuman: false,
      qualifiedAt: '2026-09-02T10:45:00+02:00',
    })).toThrow(/INVALID_LOCATOR/);
  });
});
