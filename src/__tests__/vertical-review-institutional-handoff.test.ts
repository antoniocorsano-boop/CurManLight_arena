import { describe, expect, it } from 'vitest';
import migration from '../../supabase/migrations/20260910120000_vertical_review_institutional_handoff.sql?raw';
import panelSource from '../features/beta/VerticalReviewPanel.tsx?raw';
import repositorySource from '../infrastructure/supabase/institutionalReviewHandoffRepository.ts?raw';
import { canPrepareInstitutionalReviewHandoff } from '../domain/revision/institutionalReviewHandoff';

describe('H3 to institutional review handoff', () => {
  const noEffects = {
    institutionalDecisionCreated: false as const,
    adoptionReceiptCreated: false as const,
    curriculumInForceChanged: false as const,
    automaticMasterPromotion: false as const,
  };

  it('admits only non-deferred H3 receipts', () => {
    expect(canPrepareInstitutionalReviewHandoff({ outcome: 'COHERENT', ...noEffects })).toBe(true);
    expect(canPrepareInstitutionalReviewHandoff({ outcome: 'ISSUES_FOUND', ...noEffects })).toBe(true);
    expect(canPrepareInstitutionalReviewHandoff({ outcome: 'DEFERRED', ...noEffects })).toBe(false);
  });

  it('persists an append-only H3 snapshot and keeps H4 closed', () => {
    expect(migration).toContain('vertical_review_institutional_handoffs');
    expect(migration).toContain('READY_FOR_INSTITUTIONAL_REVIEW');
    expect(migration).toContain("required_authority_role text not null default 'collegio'");
    expect(migration).toContain('VERTICAL_REVIEW_HANDOFF_STALE_H2_SOURCE');
    expect(migration).toContain('VERTICAL_REVIEW_HANDOFF_H2_CONTINUATION_OPEN');
    expect(migration).toContain('VERTICAL_REVIEW_HANDOFF_STALE_H3');
    expect(migration).toContain('newer.recorded_at > v_h3.recorded_at');
    expect(migration).toContain('revoke execute on function public.record_institutional_revision_decision');
    expect(migration).not.toContain('insert into public.institutional_revision_decisions');
    expect(migration).not.toContain('update public.vertical_review_outcomes');
  });

  it('binds the browser handoff to authenticated server authority', () => {
    expect(repositorySource).toContain("rpc('prepare_vertical_review_institutional_handoff_v1'");
    expect(repositorySource).toContain('p_expected_context_user_id: context.membership.userId');
    expect(repositorySource).toContain('p_vertical_review_outcome_id: verticalReviewOutcome.id');
  });

  it('requires explicit finding assessments instead of inferring absence from free text', () => {
    expect(panelSource).toContain("type FindingAssessment = 'unreviewed' | 'absent' | 'present'");
    expect(panelSource).toContain('Da verificare');
    expect(panelSource).toContain('Nessuna criticità rilevata');
    expect(panelSource).toContain('Criticità presente');
    expect(panelSource).toContain('allAssessmentsReviewed');
    expect(panelSource).toContain("gap: gapAssessment === 'present' ? gap : undefined");
    expect(panelSource).toContain("openQuestion: openQuestionAssessment === 'present' ? openQuestion : undefined");
  });

  it('exposes only an explicit preparation gesture, never an H4 decision gesture', () => {
    expect(panelSource).toContain('Prepara per l’iter istituzionale');
    expect(panelSource).toContain('data-human-next-action="prepare-institutional-review-handoff"');
    expect(panelSource).toContain('Autorità richiesta per H4: Collegio.');
    expect(panelSource).not.toContain('Approva il curricolo');
    expect(panelSource).not.toContain('Registra la decisione istituzionale');
  });
});
