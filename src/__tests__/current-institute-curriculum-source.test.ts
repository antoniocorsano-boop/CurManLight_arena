import { describe, expect, it } from 'vitest';
import {
  INSTITUTE_CURRICULUM_CURRENT_SOURCE,
  INSTITUTE_CURRICULUM_PRIMARY_CORRECTED_SOURCE,
} from '../domain/curriculum/institute/currentSource';
import panelSource from '../features/documents/components/InstituteCurrentSourcePanel.tsx?raw';
import workspaceSource from '../features/documents/components/FontiWorkspace.tsx?raw';

describe('current institute curriculum master', () => {
  it('uses the unified 3–14 master 1.1 as the current working baseline', () => {
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceFile).toBe(
      'CAN-CURR-MASTER-00_Curricolo_verticale_integrale_unificato_3-14_2026-2027',
    );
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.driveFileId).toBe(
      '12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4',
    );
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceVersion).toBe('1.1');
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.materializationState).toBe('COMPLETE');
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.lifecycleState).toBe(
      'CANONICAL_BASELINE_PENDING_HUMAN_VALIDATION',
    );
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.curriculumInForce).toBe(false);
  });

  it('registers normative compliance as a control attachment, not a competing curriculum', () => {
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.normativeAlignment.matrixId).toBe('MATR-CURR-MASTER-01');
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.normativeAlignment.matrixTitle).toBe(
      'MATR-CURR-MASTER-01_Matrice_conformita_normativa_IN2025_e_atti_collegati_2026-2027',
    );
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.normativeAlignment.matrixDriveFileId).toBe(
      '1Wiw8Wsifls1-wr_GPYuqIAoB8GnwXMChO8Mz_kwiLKY',
    );
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.normativeAlignment.role).toBe(
      'CONTROL_ATTACHMENT_NOT_CURRICULUM_BASELINE',
    );
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.normativeAlignment.identifiedCurricularGaps).toBe(6);
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.normativeAlignment.materializedCurricularGaps).toBe(6);
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.normativeAlignment.status).toBe(
      'GAPS_MATERIALIZED_PENDING_HUMAN_VALIDATION',
    );
  });

  it('keeps the corrected 3 September proposal as provenance, not as a competing baseline', () => {
    expect(INSTITUTE_CURRICULUM_PRIMARY_CORRECTED_SOURCE.sourceFile).toBe(
      'CURRICOLO_VERTICALE_CORRETTO_PROPOSTA_2026-09-03.docx',
    );
    expect(INSTITUTE_CURRICULUM_PRIMARY_CORRECTED_SOURCE.driveFileId).toBe(
      '1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf',
    );
    expect(INSTITUTE_CURRICULUM_PRIMARY_CORRECTED_SOURCE.sourceSha256).toBe(
      'c89fbbbe43432db8410913675381b7dc3654d2448f9f91a8c72b115b9ec6fc55',
    );
    expect(INSTITUTE_CURRICULUM_PRIMARY_CORRECTED_SOURCE.role).toBe(
      'PRIMARY_CORRECTED_PROVENANCE',
    );
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.primaryCorrectedSource).toBe(
      INSTITUTE_CURRICULUM_PRIMARY_CORRECTED_SOURCE,
    );
  });

  it('preserves validation and institutional authority boundaries', () => {
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.humanProfessionalValidation).toBe('OPEN');
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.verticalityFinalReview).toBe('OPEN');
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.readyForCollegio).toBe(false);
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.collegiateApproval).toBe(false);
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.canonicalPromotionAuthorized).toBe(false);
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.continuityRule).toBe(
      'UPDATE_SAME_MASTER_AFTER_VALIDATED_OUTCOME',
    );
  });

  it('preserves reconstruction v3 only behind the corrected provenance source', () => {
    expect(INSTITUTE_CURRICULUM_PRIMARY_CORRECTED_SOURCE.predecessor.sourceFile).toBe(
      'CURRICOLO VERTICALE .docx',
    );
    expect(INSTITUTE_CURRICULUM_PRIMARY_CORRECTED_SOURCE.predecessor.role).toBe(
      'HISTORICAL_TECHNICAL_BASELINE',
    );
  });

  it('shows the master in Fonti and keeps provenance under traceability', () => {
    expect(workspaceSource).toContain('<InstituteCurrentSourcePanel />');
    expect(workspaceSource).not.toContain('<InstituteSourceReviewPanel />');
    expect(workspaceSource).not.toContain('<InstituteSourceChangeTracePanel />');
    expect(panelSource).toContain('Baseline corrente');
    expect(panelSource).toContain('Materializzazione 3–14 completa');
    expect(panelSource).toContain('Validazione professionale aperta');
    expect(panelSource).toContain('Fonti e tracciabilità');
    expect(panelSource).toContain('non è più la rappresentazione corrente del curricolo');
  });
});
