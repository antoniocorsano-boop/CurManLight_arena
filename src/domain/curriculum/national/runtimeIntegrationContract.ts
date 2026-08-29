export const CNR_RUNTIME_CONTRACT_VERSION = 'cnr-runtime-v1' as const;

export const CNR_PROGRAM_STAGES = [
  'CNR-1_RUNTIME_APPLICABILITY',
  'CNR-2_CANONICAL_READ_MODEL',
  'CNR-3_SOURCE_COVERAGE_ALL_DISCIPLINES',
  'CNR-4_HUMAN_SOURCE_VERIFICATION',
  'CNR-5_STRUCTURE_MIGRATION',
  'CNR-6_SOURCES_EXPERIENCE',
  'CNR-7_CURRICULUM_UX',
] as const;

export type CnrProgramStage = (typeof CNR_PROGRAM_STAGES)[number];

export const CNR_RUNTIME_INVARIANTS = {
  cohortBeforeContent: true,
  sourceBeforeCanonicalText: true,
  humanVerificationIsNotAdoption: true,
  semanticKindPreserved: true,
  legacyIsNotCanonical: true,
  coverageAfterTransition: true,
  oneCanonicalReadModelTarget: true,
} as const;

export type CurriculumContentAuthorityState =
  | 'LEGACY_UNVERIFIED'
  | 'LOCAL_CONTENT'
  | 'PROPOSAL'
  | 'SOURCE_LOCATED'
  | 'SOURCE_VERIFIED'
  | 'INSTITUTIONALLY_ADOPTED';

export interface CurriculumRuntimeContext {
  academicYear: string;
  schoolOrder: 'infanzia' | 'primaria' | 'secondaria';
  classYear?: 1 | 2 | 3 | 4 | 5;
}

export interface CurriculumRuntimeReadModelContract {
  context: CurriculumRuntimeContext;
  regimeResolved: boolean;
  semanticKind: 'INFANZIA_FIELD_OF_EXPERIENCE' | 'FIRST_CYCLE_DISCIPLINE' | 'CROSS_DISCIPLINARY_FRAMEWORK' | 'CONDITIONAL_OFFERING' | 'EXTERNAL_AUTHORITY_SUBJECT';
  authorityState: CurriculumContentAuthorityState;
  sourceId?: string;
  sourceLocatorResolved: boolean;
  humanSourceVerificationRequired: boolean;
  institutionallyAdopted: boolean;
}

export interface CnrRuntimeContractAssessment {
  valid: boolean;
  violations: string[];
}

/**
 * Guardrail architetturale del read model canonico.
 *
 * Non risolve il regime e non promuove contenuti: verifica esclusivamente che
 * un read model gia' costruito non violi gli invarianti CNR v1.
 */
export function assessCnrRuntimeReadModel(
  model: CurriculumRuntimeReadModelContract,
): CnrRuntimeContractAssessment {
  const violations: string[] = [];

  if (!model.regimeResolved) {
    violations.push('CNR-I1: il regime della coorte deve essere risolto prima di presentare contenuto curricolare canonico.');
  }

  if (
    (model.authorityState === 'SOURCE_LOCATED' ||
      model.authorityState === 'SOURCE_VERIFIED' ||
      model.authorityState === 'INSTITUTIONALLY_ADOPTED') &&
    (!model.sourceId || !model.sourceLocatorResolved)
  ) {
    violations.push('CNR-I2/CNR-I3: uno stato sorgente o adottato richiede fonte e locator risolti.');
  }

  if (model.authorityState === 'SOURCE_VERIFIED' && model.humanSourceVerificationRequired) {
    violations.push('CNR-I3: SOURCE_VERIFIED non puo mantenere una verifica umana sorgente ancora richiesta.');
  }

  if (model.institutionallyAdopted && model.authorityState !== 'INSTITUTIONALLY_ADOPTED') {
    violations.push('CNR-I4: adozione istituzionale e verifica della fonte sono stati distinti.');
  }

  if (
    model.semanticKind === 'INFANZIA_FIELD_OF_EXPERIENCE' &&
    model.context.schoolOrder !== 'infanzia'
  ) {
    violations.push('CNR-I5/CNR-I6: un campo di esperienza e canonico soltanto nel contesto infanzia.');
  }

  if (
    model.context.schoolOrder === 'infanzia' &&
    model.semanticKind === 'FIRST_CYCLE_DISCIPLINE'
  ) {
    violations.push('CNR-I6: l\'infanzia non puo essere modellata canonicamente come proiezione disciplinare.');
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}
