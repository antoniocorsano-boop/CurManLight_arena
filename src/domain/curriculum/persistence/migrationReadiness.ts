import { INSTITUTE_CURRICULUM_SOURCE_RECONSTRUCTION_V3, countInstituteSourceReviewBlockers } from '../institute/sourceReconstructionReadiness';
import { DM221_FINAL_PUBLICATION_STRUCTURAL_ITEMS } from '../national/finalPublicationHumanVerification';
import { DM221_2025_SOURCE } from '../national/dm2212025';
import { CURRICULUM_PERSISTENCE_MODE, type CurriculumPersistenceMode } from './compatibilityMode';

export const R7C6A_EXPECTED_NATIONAL_ELEMENT_COUNT = 868 as const;

export type CurriculumMigrationReadinessBlocker =
  | 'PERSISTENCE_MODE_NOT_LEGACY_ONLY'
  | 'NATIONAL_STRUCTURAL_INVENTORY_INCOMPLETE'
  | 'CANONICAL_NATIONAL_PDF_FINGERPRINT_MISSING'
  | 'NATIONAL_SOURCE_VERIFICATION_INCOMPLETE_OR_UNEVIDENCED'
  | 'INSTITUTE_SOURCE_RECONSTRUCTION_MISSING'
  | 'INSTITUTE_SOURCE_DEFECTS_UNRESOLVED'
  | 'INSTITUTE_SEMANTIC_REVIEW_INCOMPLETE'
  | 'BACKUP_GATE_NOT_PROVEN'
  | 'ROLLBACK_GATE_NOT_PROVEN'
  | 'DETERMINISTIC_COMPARISON_NOT_PROVEN'
  | 'HUMAN_VALIDATION_NOT_PROVEN';

export interface CurriculumMigrationReadinessEvidence {
  persistenceMode: CurriculumPersistenceMode;
  nationalStructuralElementCount: number;
  canonicalNationalPdfSha256: string | null;
  /** Null means that no durable repository-level evidence proves the reviewed count. */
  humanVerifiedNationalElementCount: number | null;
  instituteSourceReconstructed: boolean;
  instituteSourceReviewBlockerCount: number;
  instituteHumanSemanticReviewComplete: boolean;
  backupGateProven: boolean;
  rollbackGateProven: boolean;
  deterministicComparisonProven: boolean;
  humanValidationProven: boolean;
}

export interface CurriculumMigrationReadinessAssessment {
  state: 'PREP_BLOCKED' | 'READY_FOR_DUAL_READ_VALIDATION';
  blockers: readonly CurriculumMigrationReadinessBlocker[];
  currentMode: CurriculumPersistenceMode;
  nextMode: 'dual-read';
  transitionAuthorized: boolean;
  automaticModeMutationAuthorized: false;
  dualWriteAuthorized: false;
  newDomainPrimaryAuthorized: false;
}

export function assessCurriculumMigrationReadiness(
  evidence: CurriculumMigrationReadinessEvidence,
): CurriculumMigrationReadinessAssessment {
  const blockers: CurriculumMigrationReadinessBlocker[] = [];

  if (evidence.persistenceMode !== 'legacy-only') {
    blockers.push('PERSISTENCE_MODE_NOT_LEGACY_ONLY');
  }
  if (evidence.nationalStructuralElementCount !== R7C6A_EXPECTED_NATIONAL_ELEMENT_COUNT) {
    blockers.push('NATIONAL_STRUCTURAL_INVENTORY_INCOMPLETE');
  }
  if (!evidence.canonicalNationalPdfSha256) {
    blockers.push('CANONICAL_NATIONAL_PDF_FINGERPRINT_MISSING');
  }
  if (evidence.humanVerifiedNationalElementCount !== R7C6A_EXPECTED_NATIONAL_ELEMENT_COUNT) {
    blockers.push('NATIONAL_SOURCE_VERIFICATION_INCOMPLETE_OR_UNEVIDENCED');
  }
  if (!evidence.instituteSourceReconstructed) {
    blockers.push('INSTITUTE_SOURCE_RECONSTRUCTION_MISSING');
  }
  if (evidence.instituteSourceReviewBlockerCount > 0) {
    blockers.push('INSTITUTE_SOURCE_DEFECTS_UNRESOLVED');
  }
  if (!evidence.instituteHumanSemanticReviewComplete) {
    blockers.push('INSTITUTE_SEMANTIC_REVIEW_INCOMPLETE');
  }
  if (!evidence.backupGateProven) blockers.push('BACKUP_GATE_NOT_PROVEN');
  if (!evidence.rollbackGateProven) blockers.push('ROLLBACK_GATE_NOT_PROVEN');
  if (!evidence.deterministicComparisonProven) blockers.push('DETERMINISTIC_COMPARISON_NOT_PROVEN');
  if (!evidence.humanValidationProven) blockers.push('HUMAN_VALIDATION_NOT_PROVEN');

  const transitionAuthorized = blockers.length === 0;
  return {
    state: transitionAuthorized ? 'READY_FOR_DUAL_READ_VALIDATION' : 'PREP_BLOCKED',
    blockers,
    currentMode: evidence.persistenceMode,
    nextMode: 'dual-read',
    transitionAuthorized,
    automaticModeMutationAuthorized: false,
    dualWriteAuthorized: false,
    newDomainPrimaryAuthorized: false,
  };
}

export const CURRENT_R7C6A_MIGRATION_EVIDENCE: CurriculumMigrationReadinessEvidence = {
  persistenceMode: CURRICULUM_PERSISTENCE_MODE,
  nationalStructuralElementCount: DM221_FINAL_PUBLICATION_STRUCTURAL_ITEMS.length,
  canonicalNationalPdfSha256: DM221_2025_SOURCE.officialCurriculumVolume.contentFingerprint.sha256,
  humanVerifiedNationalElementCount: null,
  instituteSourceReconstructed: true,
  instituteSourceReviewBlockerCount: countInstituteSourceReviewBlockers(),
  instituteHumanSemanticReviewComplete:
    INSTITUTE_CURRICULUM_SOURCE_RECONSTRUCTION_V3.humanSemanticReviewComplete,
  backupGateProven: false,
  rollbackGateProven: false,
  deterministicComparisonProven: false,
  humanValidationProven: false,
};

export const CURRENT_R7C6A_MIGRATION_READINESS = assessCurriculumMigrationReadiness(
  CURRENT_R7C6A_MIGRATION_EVIDENCE,
);

export function assertDualReadTransitionAuthorized(
  assessment: CurriculumMigrationReadinessAssessment = CURRENT_R7C6A_MIGRATION_READINESS,
): void {
  if (!assessment.transitionAuthorized) {
    throw new Error(`R7C6A_DUAL_READ_BLOCKED:${assessment.blockers.join(',')}`);
  }
}
