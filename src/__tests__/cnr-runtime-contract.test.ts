import { describe, expect, it } from 'vitest';
import {
  CNR_PROGRAM_STAGES,
  CNR_RUNTIME_CONTRACT_VERSION,
  CNR_RUNTIME_INVARIANTS,
  assessCnrRuntimeReadModel,
} from '../domain/curriculum/national/runtimeIntegrationContract';

describe('CNR curriculum national runtime contract', () => {
  it('freezes the staged migration order', () => {
    expect(CNR_RUNTIME_CONTRACT_VERSION).toBe('cnr-runtime-v1');
    expect(CNR_PROGRAM_STAGES).toEqual([
      'CNR-1_RUNTIME_APPLICABILITY',
      'CNR-2_CANONICAL_READ_MODEL',
      'CNR-3_SOURCE_COVERAGE_ALL_DISCIPLINES',
      'CNR-4_HUMAN_SOURCE_VERIFICATION',
      'CNR-5_STRUCTURE_MIGRATION',
      'CNR-6_SOURCES_EXPERIENCE',
      'CNR-7_CURRICULUM_UX',
    ]);
  });

  it('freezes the architectural invariants', () => {
    expect(CNR_RUNTIME_INVARIANTS).toEqual({
      cohortBeforeContent: true,
      sourceBeforeCanonicalText: true,
      humanVerificationIsNotAdoption: true,
      semanticKindPreserved: true,
      legacyIsNotCanonical: true,
      coverageAfterTransition: true,
      oneCanonicalReadModelTarget: true,
    });
  });

  it('blocks canonical presentation when cohort regime is unresolved', () => {
    const result = assessCnrRuntimeReadModel({
      context: {
        academicYear: '2026/2027',
        schoolOrder: 'secondaria',
        classYear: 1,
      },
      regimeResolved: false,
      semanticKind: 'FIRST_CYCLE_DISCIPLINE',
      authorityState: 'LEGACY_UNVERIFIED',
      sourceLocatorResolved: false,
      humanSourceVerificationRequired: true,
      institutionallyAdopted: false,
    });

    expect(result.valid).toBe(false);
    expect(result.violations.some((violation) => violation.includes('CNR-I1'))).toBe(true);
  });

  it('blocks a source-verified element without source provenance', () => {
    const result = assessCnrRuntimeReadModel({
      context: {
        academicYear: '2026/2027',
        schoolOrder: 'secondaria',
        classYear: 1,
      },
      regimeResolved: true,
      semanticKind: 'FIRST_CYCLE_DISCIPLINE',
      authorityState: 'SOURCE_VERIFIED',
      sourceLocatorResolved: false,
      humanSourceVerificationRequired: false,
      institutionallyAdopted: false,
    });

    expect(result.valid).toBe(false);
    expect(result.violations.some((violation) => violation.includes('CNR-I2/CNR-I3'))).toBe(true);
  });

  it('keeps source verification distinct from institutional adoption', () => {
    const result = assessCnrRuntimeReadModel({
      context: {
        academicYear: '2026/2027',
        schoolOrder: 'secondaria',
        classYear: 1,
      },
      regimeResolved: true,
      semanticKind: 'FIRST_CYCLE_DISCIPLINE',
      authorityState: 'SOURCE_VERIFIED',
      sourceId: 'dm-221-2025-indicazioni-nazionali',
      sourceLocatorResolved: true,
      humanSourceVerificationRequired: false,
      institutionallyAdopted: true,
    });

    expect(result.valid).toBe(false);
    expect(result.violations.some((violation) => violation.includes('CNR-I4'))).toBe(true);
  });

  it('blocks discipline projection as the canonical infanzia structure', () => {
    const result = assessCnrRuntimeReadModel({
      context: {
        academicYear: '2026/2027',
        schoolOrder: 'infanzia',
      },
      regimeResolved: true,
      semanticKind: 'FIRST_CYCLE_DISCIPLINE',
      authorityState: 'LEGACY_UNVERIFIED',
      sourceLocatorResolved: false,
      humanSourceVerificationRequired: true,
      institutionallyAdopted: false,
    });

    expect(result.valid).toBe(false);
    expect(result.violations.some((violation) => violation.includes('CNR-I6'))).toBe(true);
  });

  it('accepts a source-verified non-adopted first-cycle element with resolved provenance', () => {
    const result = assessCnrRuntimeReadModel({
      context: {
        academicYear: '2026/2027',
        schoolOrder: 'secondaria',
        classYear: 1,
      },
      regimeResolved: true,
      semanticKind: 'FIRST_CYCLE_DISCIPLINE',
      authorityState: 'SOURCE_VERIFIED',
      sourceId: 'dm-221-2025-indicazioni-nazionali',
      sourceLocatorResolved: true,
      humanSourceVerificationRequired: false,
      institutionallyAdopted: false,
    });

    expect(result).toEqual({ valid: true, violations: [] });
  });
});
