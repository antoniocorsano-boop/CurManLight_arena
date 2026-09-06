import { INSTITUTE_CURRICULUM_SOURCE_RECONSTRUCTION_V3 } from './sourceReconstructionReadiness';
import { INSTITUTE_CURRICULUM_SOURCE_REPERTORY } from './sourceRegister';

export const INSTITUTE_CURRICULUM_PRIMARY_CORRECTED_SOURCE = {
  sourceFile: 'CURRICOLO_VERTICALE_CORRETTO_PROPOSTA_2026-09-03.docx',
  driveFileId: '1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf',
  sourceSha256: 'c89fbbbe43432db8410913675381b7dc3654d2448f9f91a8c72b115b9ec6fc55',
  sourceDate: '2026-09-03',
  authority: 'INSTITUTE_PROPOSAL',
  role: 'PRIMARY_CORRECTED_PROVENANCE',
  lifecycleState: 'PROPOSAL_PENDING_HUMAN_VALIDATION',
  predecessor: {
    sourceFile: INSTITUTE_CURRICULUM_SOURCE_RECONSTRUCTION_V3.sourceFile,
    sourceSha256: INSTITUTE_CURRICULUM_SOURCE_RECONSTRUCTION_V3.sourceSha256,
    role: 'HISTORICAL_TECHNICAL_BASELINE',
  },
  sourceRemediation: {
    status: 'CORRECTIONS_RECEIVED_IN_CORRECTED_SOURCE',
    historicalTaskCount: 7,
  },
} as const;

/**
 * Baseline curricolare canonica corrente di lavoro.
 *
 * Il nome dell'export è conservato per compatibilità con i consumer esistenti:
 * la "current source" applicativa non è più la proposta corretta del 3 settembre,
 * ma il master unificato che la conserva come provenienza primaria.
 *
 * La versione 1.2 incorpora nello stesso master le integrazioni emerse dal gate
 * OSA uno-a-uno. Il gate resta IN_PROGRESS: nessun test o mapping autorizza da
 * solo una validazione professionale, una promozione istituzionale o la vigenza.
 */
export const INSTITUTE_CURRICULUM_CURRENT_SOURCE = {
  schemaVersion: 'arena-institute-curriculum-current-source-v2',
  sourceFile: 'CAN-CURR-MASTER-00_Curricolo_verticale_integrale_unificato_3-14_2026-2027',
  driveFileId: '12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4',
  sourceVersion: '1.2',
  sourceDate: '2026-09-06',
  authority: 'INSTITUTE_CANONICAL_WORKING_BASELINE',
  lifecycleState: 'CANONICAL_BASELINE_PENDING_HUMAN_VALIDATION',
  materializationState: 'COMPLETE',
  curriculumInForce: false,
  primaryCorrectedSource: INSTITUTE_CURRICULUM_PRIMARY_CORRECTED_SOURCE,
  sourceRepertory: {
    ...INSTITUTE_CURRICULUM_SOURCE_REPERTORY,
    machineContract: 'src/domain/curriculum/institute/sourceRegister.ts',
    canonicalSurface: 'src/features/documents/components/InstituteCurriculumSourceRegisterPanel.tsx',
    alignmentState: 'ALIGNED_TO_MASTER_1_2',
  },
  humanProfessionalValidation: 'OPEN',
  verticalityFinalReview: 'OPEN',
  readyForCollegio: false,
  collegiateApproval: false,
  canonicalPromotionAuthorized: false,
  continuityRule: 'UPDATE_SAME_MASTER_AFTER_VALIDATED_OUTCOME',
  normativeAlignment: {
    matrixId: 'MATR-CURR-MASTER-01',
    matrixTitle: 'MATR-CURR-MASTER-01_Matrice_conformita_normativa_IN2025_e_atti_collegati_2026-2027',
    matrixDriveFileId: '1Wiw8Wsifls1-wr_GPYuqIAoB8GnwXMChO8Mz_kwiLKY',
    role: 'CONTROL_ATTACHMENT_NOT_CURRICULUM_BASELINE',
    identifiedCurricularGaps: 6,
    materializedCurricularGaps: 6,
    status: 'GAPS_MATERIALIZED_PENDING_HUMAN_VALIDATION',
    osaOneToOneGate: 'IN_PROGRESS',
    osaVerifiedIntegrationsMaterializedInMaster12: true,
    osaCompletionClaimAuthorized: false,
    benchmarkSemantics: {
      primary: 'NATIONAL_BENCHMARKS_END_III_AND_V_WITH_INSTITUTE_ANNUALIZATION',
      lowerSecondary: 'NATIONAL_BENCHMARK_END_III_WITH_INSTITUTE_ANNUALIZATION',
      noRetroactiveRewriteOf2012Cohorts: true,
    },
  },
} as const;

export function isPrimaryCorrectedSourceSha256(value: string): boolean {
  return value.toLowerCase() === INSTITUTE_CURRICULUM_PRIMARY_CORRECTED_SOURCE.sourceSha256;
}

/** @deprecated Verifica lo SHA della fonte corretta di provenienza, non del master nativo Drive. */
export function isCurrentInstituteCurriculumSourceSha256(value: string): boolean {
  return isPrimaryCorrectedSourceSha256(value);
}
