import { describe, expect, it } from 'vitest';
import {
  canUseAdaptiveHcmMemory,
  detectPrimaryTechnicalLeak,
  getHcmMemoryPolicy,
  hcmAuthorityDisclosure,
  projectHcmTerm,
  resolveHcmTone,
  validateHcmContext,
  type HcmContext,
} from '../domain/human-communication';

const baseContext: HcmContext = {
  roleId: 'docente',
  roleTone: 'operational',
  phase: 'ACT',
  detailLevel: 'PRIMARY',
  consequence: 'LOCAL',
  authority: { state: 'NOT_REQUIRED', source: 'NONE' },
};

describe('Human Communication Model', () => {
  it('projects role-aware vocabulary without deriving authority from the role', () => {
    const term = {
      id: 'proposal-action',
      human: 'Lavora sulla proposta',
      roleVariants: {
        docente: 'Prepara la proposta',
        collegio: 'Esamina la proposta',
      },
    } as const;

    const teacher = projectHcmTerm(term, baseContext);
    const collegio = projectHcmTerm(term, { ...baseContext, roleId: 'collegio' });

    expect(teacher.text).toBe('Prepara la proposta');
    expect(collegio.text).toBe('Esamina la proposta');
    expect(teacher.authorityState).toBe('NOT_REQUIRED');
    expect(collegio.authorityState).toBe('NOT_REQUIRED');
  });

  it('lets consequential task phase override cosmetic role tone', () => {
    expect(resolveHcmTone({
      ...baseContext,
      roleTone: 'facilitative',
      phase: 'DECIDE',
      consequence: 'INSTITUTIONAL',
      authority: { state: 'VERIFIED', source: 'EXTERNAL_DOMAIN' },
    })).toBe('formal');
  });

  it('requires verified authority to come from the owning domain', () => {
    const invalid = validateHcmContext({
      ...baseContext,
      phase: 'DECIDE',
      consequence: 'INSTITUTIONAL',
      authority: { state: 'VERIFIED', source: 'NONE' },
    });

    expect(invalid.valid).toBe(false);
    expect(invalid.errors.join(' ')).toMatch(/external domain/i);
  });

  it('does not permit institutional consequence to skip authority state', () => {
    const invalid = validateHcmContext({
      ...baseContext,
      phase: 'DECIDE',
      consequence: 'INSTITUTIONAL',
      authority: { state: 'NOT_REQUIRED', source: 'NONE' },
    });

    expect(invalid.valid).toBe(false);
  });

  it('treats role context as adaptive memory but authority and receipts as canonical facts', () => {
    expect(canUseAdaptiveHcmMemory('ROLE_CONTEXT')).toBe(true);
    expect(canUseAdaptiveHcmMemory('RESUME_POINT')).toBe(true);
    expect(canUseAdaptiveHcmMemory('MEMBERSHIP')).toBe(false);
    expect(canUseAdaptiveHcmMemory('DECISION_AUTHORITY')).toBe(false);
    expect(getHcmMemoryPolicy('RECEIPT')).toBe('CANONICAL_SOURCE_REQUIRED');
  });

  it('detects avoidable technical leakage in a primary human layer', () => {
    const leaks = detectPrimaryTechnicalLeak(
      'Apri CML_LOCAL_HANDOFF_V2 per UUID 123e4567-e89b-42d3-a456-426614174000 e verifica SHA-256.',
    );

    expect(leaks).toContain('CML_*');
    expect(leaks).toContain('UUID');
    expect(leaks).toContain('SHA-256');
  });

  it('keeps technical terminology available when the user deliberately opens the technical layer', () => {
    const projection = projectHcmTerm({
      id: 'receipt-fingerprint',
      human: 'Impronta della versione',
      technical: 'SHA-256 proposalVersionFingerprint',
    }, {
      ...baseContext,
      phase: 'REVIEW',
      detailLevel: 'TECHNICAL',
    });

    expect(projection.text).toBe('SHA-256 proposalVersionFingerprint');
    expect(projection.detailLevel).toBe('TECHNICAL');
  });

  it('reports authority disclosure solely from supplied domain state', () => {
    const verified = {
      ...baseContext,
      roleId: 'docente',
      consequence: 'INSTITUTIONAL' as const,
      authority: { state: 'VERIFIED' as const, source: 'EXTERNAL_DOMAIN' as const },
    };

    expect(hcmAuthorityDisclosure(verified)).toBe('AUTHORITY_VERIFIED_BY_DOMAIN');
    expect(hcmAuthorityDisclosure({ ...verified, roleId: 'collegio' })).toBe('AUTHORITY_VERIFIED_BY_DOMAIN');
  });
});
