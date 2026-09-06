import { INSTITUTE_CURRICULUM_SOURCE_RECONSTRUCTION_V3 } from './sourceReconstructionReadiness';

export const INSTITUTE_CURRICULUM_CURRENT_SOURCE = {
  schemaVersion: 'arena-institute-curriculum-current-source-v1',
  sourceFile: 'CURRICOLO_VERTICALE_CORRETTO_PROPOSTA_2026-09-03.docx',
  driveFileId: '1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf',
  sourceSha256: 'c89fbbbe43432db8410913675381b7dc3654d2448f9f91a8c72b115b9ec6fc55',
  sourceDate: '2026-09-03',
  authority: 'INSTITUTE_PROPOSAL',
  lifecycleState: 'PROPOSAL_PENDING_HUMAN_VALIDATION',
  predecessor: {
    sourceFile: INSTITUTE_CURRICULUM_SOURCE_RECONSTRUCTION_V3.sourceFile,
    sourceSha256: INSTITUTE_CURRICULUM_SOURCE_RECONSTRUCTION_V3.sourceSha256,
    role: 'HISTORICAL_TECHNICAL_BASELINE',
  },
  sourceRemediation: {
    status: 'CORRECTIONS_RECEIVED_IN_CURRENT_SOURCE',
    historicalTaskCount: 7,
  },
  humanProfessionalValidation: 'OPEN',
  verticalityFinalReview: 'OPEN',
  readyForCollegio: false,
  collegiateApproval: false,
  canonicalPromotionAuthorized: false,
} as const;

export function isCurrentInstituteCurriculumSourceSha256(value: string): boolean {
  return value.toLowerCase() === INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceSha256;
}
