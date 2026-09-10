import { describe, expect, it } from 'vitest';
import migration from '../../supabase/migrations/20260907143000_vertical_review_outcome.sql?raw';
import {
  buildVerticalReviewOutcomeDraft,
  type VerticalReviewCandidate,
  type VerticalReviewMasterReference,
} from '../domain/revision/verticalReview';

const MASTER: VerticalReviewMasterReference = {
  id: 'CAN-CURR-MASTER-00',
  driveFileId: 'drive-master',
  version: '1.3',
};

const candidate = (
  teamOutcomeId: string,
  curriculumUnitKey: string,
  classOrAgeBand: string,
  teamOutcome: VerticalReviewCandidate['teamOutcome'] = 'accept-proposal',
): VerticalReviewCandidate => ({
  teamOutcomeId,
  workspaceId: 'workspace-1',
  reviewCaseId: `CRC:${curriculumUnitKey}:case`,
  academicYear: '2026/2027',
  groupCode: 'S-TEC',
  discipline: 'Tecnologia',
  schoolOrder: 'secondaria',
  classOrAgeBand,
  curriculumUnitKey,
  masterId: MASTER.id,
  masterDriveFileId: MASTER.driveFileId,
  masterVersion: MASTER.version,
  proposalRef: `proposal-${curriculumUnitKey}`,
  proposalFingerprint: 'a'.repeat(64),
  teamOutcome,
  sharedText: null,
  teamRationale: 'Esito H2 registrato.',
  teamOutcomeRecordedAt: '2026-09-07T12:00:00.000Z',
  scopeReason: 'Riesame mirato della progressione.',
});

describe('H3 VerticalReviewOutcome', () => {
  it('builds one explicit previous-to-next relation from two distinct current H2 outcomes', () => {
    const draft = buildVerticalReviewOutcomeDraft({
      workspaceId: 'workspace-1',
      master: MASTER,
      previous: candidate('11111111-1111-4111-8111-111111111111', 'unit-1', 'Classe prima'),
      next: candidate('22222222-2222-4222-8222-222222222222', 'unit-2', 'Classe seconda'),
      linkReview: 'La seconda unità riprende e sviluppa il prerequisito introdotto nella prima.',
      rationale: 'Il raccordo è leggibile e progressivo.',
      clientRequestId: '33333333-3333-4333-8333-333333333333',
    });

    expect(draft.sourceTeamOutcomeIds).toEqual([
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
    ]);
    expect(draft.outcome).toBe('COHERENT');
    expect(draft.findings).toEqual([
      expect.objectContaining({ kind: 'PROGRESSION_LINK', fromUnitKey: 'unit-1', toUnitKey: 'unit-2' }),
    ]);
  });

  it('derives issues and deferral without collapsing them into an institutional state', () => {
    const issueDraft = buildVerticalReviewOutcomeDraft({
      workspaceId: 'workspace-1',
      master: MASTER,
      previous: candidate('11111111-1111-4111-8111-111111111111', 'unit-1', 'Classe prima'),
      next: candidate('22222222-2222-4222-8222-222222222222', 'unit-2', 'Classe seconda'),
      linkReview: 'Il raccordo è stato confrontato.',
      gap: 'Manca un passaggio intermedio tra le due annualizzazioni.',
      rationale: 'Serve un riesame mirato del salto individuato.',
      clientRequestId: '33333333-3333-4333-8333-333333333333',
    });
    expect(issueDraft.outcome).toBe('ISSUES_FOUND');
    expect(issueDraft.findings.some((finding) => finding.kind === 'GAP')).toBe(true);

    const deferredDraft = buildVerticalReviewOutcomeDraft({
      workspaceId: 'workspace-1',
      master: MASTER,
      previous: candidate('11111111-1111-4111-8111-111111111111', 'unit-1', 'Classe prima', 'defer'),
      next: candidate('22222222-2222-4222-8222-222222222222', 'unit-2', 'Classe seconda'),
      linkReview: 'Il raccordo è stato esaminato ma la fonte H2 precedente è ancora rinviata.',
      rationale: 'H3 non può essere chiuso come coerente finché H2 resta rinviato.',
      clientRequestId: '44444444-4444-4444-8444-444444444444',
    });
    expect(deferredDraft.outcome).toBe('DEFERRED');
  });

  it('rejects same-unit and cross-master shortcuts before persistence', () => {
    const first = candidate('11111111-1111-4111-8111-111111111111', 'unit-1', 'Classe prima');
    expect(() => buildVerticalReviewOutcomeDraft({
      workspaceId: 'workspace-1',
      master: MASTER,
      previous: first,
      next: { ...candidate('22222222-2222-4222-8222-222222222222', 'unit-1', 'Classe seconda') },
      linkReview: 'Raccordo.',
      rationale: 'Motivazione.',
      clientRequestId: '33333333-3333-4333-8333-333333333333',
    })).toThrow('VERTICAL_REVIEW_UNITS_MUST_DIFFER');

    expect(() => buildVerticalReviewOutcomeDraft({
      workspaceId: 'workspace-1',
      master: MASTER,
      previous: first,
      next: {
        ...candidate('22222222-2222-4222-8222-222222222222', 'unit-2', 'Classe seconda'),
        masterVersion: '1.4',
      },
      linkReview: 'Raccordo.',
      rationale: 'Motivazione.',
      clientRequestId: '33333333-3333-4333-8333-333333333333',
    })).toThrow('VERTICAL_REVIEW_MASTER_MISMATCH');
  });

  it('enforces the H2 -> H3 server boundary and keeps H4 untouched', () => {
    for (const token of [
      'create table if not exists public.vertical_review_outcomes',
      'source_team_outcome_ids uuid[]',
      'public.team_review_outcomes team_outcome',
      'public.shared_curriculum_review_cases review_case',
      'VERTICAL_REVIEW_H2_OUTCOMES_REQUIRED',
      'VERTICAL_REVIEW_DISTINCT_UNITS_REQUIRED',
      'VERTICAL_REVIEW_MASTER_MISMATCH',
      'VERTICAL_REVIEW_STALE_TEAM_OUTCOME',
      "v_role not in ('dipartimento','referente','dirigente')",
      'VERTICAL_REVIEW_DISCIPLINE_COMPETENCE_REQUIRED',
      'record_vertical_review_outcome_v1',
      'institutional_decision_created boolean not null default false',
      'adoption_receipt_created boolean not null default false',
      'curriculum_in_force_changed boolean not null default false',
      'automatic_master_promotion boolean not null default false',
      'revoke all on table public.vertical_review_outcomes from public, anon, authenticated',
    ]) expect(migration).toContain(token);

    expect(migration).not.toContain('insert into public.institutional_revision_decisions');
    expect(migration).not.toContain('record_institutional_revision_decision(');
    expect(migration).not.toContain('insert into public.adoption_receipts');
  });
});
