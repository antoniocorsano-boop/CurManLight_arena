import { describe, expect, it } from 'vitest';
import { buildDeferredCaseContinuationWorkSession } from '../domain/curriculum/deferredCaseContinuation';
import type { CaseScopedCurriculumWorkSession, CurriculumReviewCase, Proposal } from '../types/curriculum';
import migration from '../../supabase/migrations/20260910090000_team_review_deferred_continuation.sql?raw';
import triggerAclMigration from '../../supabase/migrations/20260910093000_deferred_continuation_trigger_acl_hardening.sql?raw';
import performanceMigration from '../../supabase/migrations/20260910094500_deferred_continuation_performance_hardening.sql?raw';

const proposals: Proposal[] = [
  { id: 'p-1', focus: 'Osservare, misurare e rappresentare', oldText: 'Testo precedente', newText: 'Proposta uno', notes: '' },
  { id: 'p-2', focus: 'Materiali', oldText: 'Testo precedente due', newText: 'Proposta due', notes: '' },
];

const completedSession: CaseScopedCurriculumWorkSession = {
  id: 'CWS:case-1:old',
  kind: 'CURRICULUM_WORK_SESSION',
  reviewCaseId: 'CRC:case-1',
  sessionState: 'COMPLETE',
  stage: 'RECORD_TEAM_OUTCOME',
  startedAt: '2026-09-07T10:00:00.000Z',
  updatedAt: '2026-09-07T11:00:00.000Z',
  actor: { actorId: 'user-1', identityState: 'AUTHENTICATED_SESSION' },
  currentMaster: { id: 'CAN-CURR-MASTER-00', driveFileId: 'drive-master', version: '1.3' },
  curriculumUnitKey: 'secondaria:classe-1:tecnologia',
  targetedProposalRefs: ['p-1', 'p-2'],
  targetScopeFrozen: true,
  decisions: { 'p-1': 'rejected', 'p-2': 'approved' },
  customTexts: {},
  previousDecisionCarryForward: false,
  previousProfessionalContributionReuse: false,
  sharedContributionMustMatchReviewCase: true,
  automaticTeamOutcome: false,
  automaticInstitutionalDecision: false,
  automaticCurriculumChange: false,
};

const reviewCase: CurriculumReviewCase = {
  id: 'CRC:case-1',
  kind: 'CURRICULUM_REVIEW_CASE',
  originTriggerSnapshot: {
    id: 'trigger-1',
    triggerType: 'PERIODIC_REVIEW',
    qualificationBasis: 'PERIODIC_REVIEW_WITH_EXPLICIT_REASON',
    recordedAt: '2026-09-07T09:00:00.000Z',
  },
  openedAt: '2026-09-07T09:30:00.000Z',
  openedBy: {
    actorId: 'user-1',
    roleContext: 'dipartimento',
    identityState: 'AUTHENTICATED_SESSION',
    institutionalAuthorityInferred: false,
  },
  curriculumUnit: {
    masterId: 'CAN-CURR-MASTER-00',
    masterDriveFileId: 'drive-master',
    masterVersion: '1.3',
    unitKey: 'secondaria:classe-1:tecnologia',
    identityKind: 'ARENA_MASTER_CONTEXT_KEY',
    order: 'secondaria',
    classOrAgeBand: 'classe-1',
    disciplineOrField: 'tecnologia',
    resolutionState: 'CONTEXT_BOUND',
  },
  currentMaster: { id: 'CAN-CURR-MASTER-00', driveFileId: 'drive-master', version: '1.3' },
  targetedProposalRefs: ['p-1', 'p-2'],
  scopeReason: 'Caso mirato',
  targetScopeFrozen: true,
  readinessAtOpening: {
    state: 'READY_TO_OPEN',
    checks: {
      qualifiedTrigger: true,
      currentMasterMatch: true,
      curriculumUnitScopeMatch: true,
      targetedProposalSelection: true,
      targetedProposalsKnown: true,
      explicitScopeReason: true,
    },
    blockers: [],
  },
  caseState: 'PROFESSIONAL_REVIEW_COMPLETE',
  cycleReentryPhase: 'H1_APPLICABLE_CURRICULUM',
  currentHumanPhase: 'H2_PROFESSIONAL_VALIDATION',
  professionalValidationState: 'TEAM_OUTCOMES_RECORDED',
  workSession: completedSession,
  explicitHumanOpening: true,
  automaticProfessionalContributionReuse: false,
  decisionCarryForwardFromPreviousReview: false,
  automaticCurriculumChange: false,
  automaticTeamOutcome: false,
  automaticInstitutionalDecision: false,
  automaticMasterPromotion: false,
  parallelCurriculumBaselineCreation: false,
};

describe('H2 deferred continuation', () => {
  it('starts a fresh professional session in the same case and only for the deferred item', () => {
    const next = buildDeferredCaseContinuationWorkSession({
      reviewCase,
      availableProposals: proposals,
      proposalRef: 'p-1',
      actorId: 'user-1',
      startedAt: '2026-09-10T09:00:00.000Z',
    });

    expect(next.reviewCaseId).toBe(reviewCase.id);
    expect(next.targetedProposalRefs).toEqual(['p-1']);
    expect(next.sessionState).toBe('ACTIVE');
    expect(next.stage).toBe('EXAMINE');
    expect(next.decisions).toEqual({});
    expect(next.customTexts).toEqual({});
    expect(next.previousDecisionCarryForward).toBe(false);
    expect(next.previousProfessionalContributionReuse).toBe(false);
    expect(next.automaticTeamOutcome).toBe(false);
    expect(next.automaticInstitutionalDecision).toBe(false);
    expect(next.automaticCurriculumChange).toBe(false);

    expect(reviewCase.targetedProposalRefs).toEqual(['p-1', 'p-2']);
    expect(reviewCase.workSession?.decisions).toEqual({ 'p-1': 'rejected', 'p-2': 'approved' });
  });

  it('cannot extend the immutable case scope while reopening a deferred point', () => {
    expect(() => buildDeferredCaseContinuationWorkSession({
      reviewCase,
      availableProposals: [...proposals, { id: 'p-3', focus: 'Fuori caso', oldText: '', newText: '', notes: '' }],
      proposalRef: 'p-3',
      actorId: 'user-1',
    })).toThrow('DEFERRED_CONTINUATION_PROPOSAL_OUT_OF_CASE_SCOPE');
  });

  it('keeps the SQL boundary append-only and blocks H3 while a continuation is open', () => {
    expect(migration).toContain('source_outcome_id uuid not null unique references public.team_review_outcomes');
    expect(migration).toContain('completed_by_outcome_id uuid references public.team_review_outcomes');
    expect(migration).toContain('team_review_contribution_history');
    expect(migration.indexOf('insert into public.team_review_contribution_history')).toBeLessThan(
      migration.indexOf('delete from public.team_review_contributions contribution'),
    );
    expect(migration).toContain("if v_source.outcome <> 'defer' then");
    expect(migration).toContain('DEFERRED_CONTINUATION_ALREADY_OPEN');
    expect(migration).toContain('VERTICAL_REVIEW_H2_CONTINUATION_OPEN');
    expect(migration).toContain('completed_by_outcome_id = new.id');
    expect(migration).not.toContain('insert into public.institutional_revision_decisions');
    expect(migration).not.toContain('insert into public.adoption_receipts');
  });

  it('keeps trigger-only continuation guards outside the client RPC surface', () => {
    expect(triggerAclMigration).toContain(
      'revoke all on function public.complete_deferred_team_review_continuation_v1()',
    );
    expect(triggerAclMigration).toContain(
      'revoke all on function public.guard_vertical_review_against_open_h2_continuation_v1()',
    );
    expect(triggerAclMigration).toContain('from public, anon, authenticated');
    expect(triggerAclMigration).not.toContain('grant execute');
  });

  it('keeps new foreign-key paths indexed and evaluates auth identity once per RLS statement', () => {
    expect(performanceMigration).toContain('team_review_deferred_continuations_completed_outcome_idx');
    expect(performanceMigration).toContain('team_review_deferred_continuations_group_code_idx');
    expect(performanceMigration).toContain('team_review_deferred_continuations_opened_by_idx');
    expect(performanceMigration).toContain('team_review_contribution_history_source_outcome_idx');
    expect(performanceMigration).toContain('team_review_contribution_history_workspace_idx');
    expect(performanceMigration).toContain('team_review_contribution_history_contributor_idx');
    expect(performanceMigration.match(/\(select auth\.uid\(\)\)/g)?.length).toBe(2);
  });
});
