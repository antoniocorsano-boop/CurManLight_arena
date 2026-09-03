import { describe, expect, it } from 'vitest';
import { CURRICULUM_PERSISTENCE_MODE } from '../domain/curriculum/persistence/compatibilityMode';
import {
  CURRENT_R7C6A_MIGRATION_EVIDENCE,
  CURRENT_R7C6A_MIGRATION_READINESS,
  R7C6A_EXPECTED_NATIONAL_ELEMENT_COUNT,
  assertDualReadTransitionAuthorized,
  assessCurriculumMigrationReadiness,
} from '../domain/curriculum/persistence/migrationReadiness';

describe('R7C6A runtime migration readiness', () => {
  it('keeps the productive mode on legacy-only', () => {
    expect(CURRICULUM_PERSISTENCE_MODE).toBe('legacy-only');
    expect(CURRENT_R7C6A_MIGRATION_READINESS.currentMode).toBe('legacy-only');
    expect(CURRENT_R7C6A_MIGRATION_READINESS.nextMode).toBe('dual-read');
    expect(CURRENT_R7C6A_MIGRATION_READINESS.automaticModeMutationAuthorized).toBe(false);
  });

  it('recognizes structural IN2025 completion without confusing it with source verification', () => {
    expect(CURRENT_R7C6A_MIGRATION_EVIDENCE.nationalStructuralElementCount)
      .toBe(R7C6A_EXPECTED_NATIONAL_ELEMENT_COUNT);
    expect(CURRENT_R7C6A_MIGRATION_EVIDENCE.humanVerifiedNationalElementCount).toBeNull();
    expect(CURRENT_R7C6A_MIGRATION_READINESS.blockers).toContain(
      'NATIONAL_SOURCE_VERIFICATION_INCOMPLETE_OR_UNEVIDENCED',
    );
  });

  it('fails closed on the real remaining source and migration prerequisites', () => {
    expect(CURRENT_R7C6A_MIGRATION_READINESS.state).toBe('PREP_BLOCKED');
    expect(CURRENT_R7C6A_MIGRATION_READINESS.transitionAuthorized).toBe(false);
    expect(CURRENT_R7C6A_MIGRATION_READINESS.blockers).toEqual(expect.arrayContaining([
      'CANONICAL_NATIONAL_PDF_FINGERPRINT_MISSING',
      'NATIONAL_SOURCE_VERIFICATION_INCOMPLETE_OR_UNEVIDENCED',
      'INSTITUTE_SOURCE_DEFECTS_UNRESOLVED',
      'INSTITUTE_SEMANTIC_REVIEW_INCOMPLETE',
      'BACKUP_GATE_NOT_PROVEN',
      'ROLLBACK_GATE_NOT_PROVEN',
      'DETERMINISTIC_COMPARISON_NOT_PROVEN',
      'HUMAN_VALIDATION_NOT_PROVEN',
    ]));
    expect(() => assertDualReadTransitionAuthorized()).toThrow(/R7C6A_DUAL_READ_BLOCKED/);
  });

  it('can authorize only a dual-read validation transition when every prerequisite is proven', () => {
    const ready = assessCurriculumMigrationReadiness({
      persistenceMode: 'legacy-only',
      nationalStructuralElementCount: 868,
      canonicalNationalPdfSha256: 'a'.repeat(64),
      humanVerifiedNationalElementCount: 868,
      instituteSourceReconstructed: true,
      instituteSourceReviewBlockerCount: 0,
      instituteHumanSemanticReviewComplete: true,
      backupGateProven: true,
      rollbackGateProven: true,
      deterministicComparisonProven: true,
      humanValidationProven: true,
    });

    expect(ready).toMatchObject({
      state: 'READY_FOR_DUAL_READ_VALIDATION',
      blockers: [],
      nextMode: 'dual-read',
      transitionAuthorized: true,
      automaticModeMutationAuthorized: false,
      dualWriteAuthorized: false,
      newDomainPrimaryAuthorized: false,
    });
    expect(() => assertDualReadTransitionAuthorized(ready)).not.toThrow();
  });
});
