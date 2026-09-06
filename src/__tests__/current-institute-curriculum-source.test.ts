import { describe, expect, it } from 'vitest';
import { INSTITUTE_CURRICULUM_CURRENT_SOURCE } from '../domain/curriculum/institute/currentSource';
import panelSource from '../features/documents/components/InstituteCurrentSourcePanel.tsx?raw';
import workspaceSource from '../features/documents/components/FontiWorkspace.tsx?raw';

describe('current institute curriculum source', () => {
  it('uses the corrected 3 September proposal as the current working source', () => {
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceFile).toBe(
      'CURRICOLO_VERTICALE_CORRETTO_PROPOSTA_2026-09-03.docx',
    );
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.driveFileId).toBe(
      '1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf',
    );
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceSha256).toBe(
      'c89fbbbe43432db8410913675381b7dc3654d2448f9f91a8c72b115b9ec6fc55',
    );
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.lifecycleState).toBe(
      'PROPOSAL_PENDING_HUMAN_VALIDATION',
    );
  });

  it('keeps source correction distinct from professional validation and adoption', () => {
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceRemediation.status).toBe(
      'CORRECTIONS_RECEIVED_IN_CURRENT_SOURCE',
    );
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceRemediation.historicalTaskCount).toBe(7);
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.humanProfessionalValidation).toBe('OPEN');
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.verticalityFinalReview).toBe('OPEN');
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.readyForCollegio).toBe(false);
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.collegiateApproval).toBe(false);
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.canonicalPromotionAuthorized).toBe(false);
  });

  it('preserves the reconstruction v3 only as historical technical predecessor', () => {
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.predecessor.sourceFile).toBe('CURRICOLO VERTICALE .docx');
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.predecessor.role).toBe('HISTORICAL_TECHNICAL_BASELINE');
  });

  it('shows the current source in the canonical Fonti workspace instead of reopening historical remediation', () => {
    expect(workspaceSource).toContain('<InstituteCurrentSourcePanel />');
    expect(workspaceSource).not.toContain('<InstituteSourceReviewPanel />');
    expect(workspaceSource).not.toContain('<InstituteSourceChangeTracePanel />');
    expect(panelSource).toContain('Fonte corrente');
    expect(panelSource).toContain('7 correzioni della fonte recepite');
    expect(panelSource).toContain('Validazione professionale aperta');
    expect(panelSource).toContain('La precedente ricostruzione v3 resta nello storico');
  });
});
