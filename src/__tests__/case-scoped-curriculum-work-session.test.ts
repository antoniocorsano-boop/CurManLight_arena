import { describe, expect, it } from 'vitest';
import { resolveCurriculumUnitReference } from '../domain/curriculum/didacticBinding';
import { buildCurriculumReviewCase } from '../domain/curriculum/reviewCase';
import { buildInstituteNeedRevisionTrigger } from '../domain/curriculum/revisionTrigger';
import {
  assertCaseScopeIsResolvable,
  buildCaseScopedCurriculumWorkSession,
  getCaseScopedProposals,
  isCasePersonalReviewComplete,
  recordCaseDecision,
  resumeCaseWorkSession,
  transitionCaseWorkSessionStage,
} from '../domain/curriculum/caseWorkSession';
import { fingerprintCaseScopedTeamReviewProposal } from '../domain/revision/caseScopedTeamReview';
import caseSurfaceSource from '../features/beta/CaseAwareRevisionSurface.tsx?raw';
import caseSessionSource from '../features/beta/CaseScopedCurriculumWorkSession.tsx?raw';
import casePublisherSource from '../features/beta/CaseScopedTeamContributionPublisher.tsx?raw';
import caseRepositorySource from '../infrastructure/supabase/caseScopedTeamReviewRepository.ts?raw';
import migrationSource from '../../supabase/migrations/20260907043000_team_review_case_scope.sql?raw';
import type { Proposal } from '../types/curriculum';

const unit = resolveCurriculumUnitReference({
  order: 'secondaria',
  targetClass: '1',
  disciplineOrField: 'tecnologia',
});

const trigger = buildInstituteNeedRevisionTrigger({
  curriculumUnit: unit,
  needReference: 'Dipartimento Tecnologia',
  needStatement: 'Verificare un punto circoscritto della progressione.',
  declaredNonNational: true,
  recordedAt: '2026-09-07T10:00:00.000Z',
});

const proposals: Proposal[] = [
  {
    id: 'tec-case-1',
    focus: 'Nodo 1',
    oldText: 'Testo precedente 1',
    newText: 'Proposta 1',
    notes: '',
  },
  {
    id: 'tec-case-2',
    focus: 'Nodo 2',
    oldText: 'Testo precedente 2',
    newText: 'Proposta 2',
    notes: '',
  },
  {
    id: 'tec-outside',
    focus: 'Fuori perimetro',
    oldText: 'Testo precedente 3',
    newText: 'Proposta 3',
    notes: '',
  },
];

const reviewCase = buildCurriculumReviewCase({
  trigger,
  curriculumUnit: unit,
  availableProposalRefs: proposals.map((proposal) => proposal.id),
  selectedProposalRefs: ['tec-case-1', 'tec-case-2'],
  scopeReason: 'Riesaminare soltanto i due nodi direttamente interessati.',
  openedAt: '2026-09-07T10:05:00.000Z',
  actorId: 'teacher-a',
});

describe('CurriculumWorkSession case-scoped', () => {
  it('starts empty and preserves the frozen scope without carrying prior decisions', () => {
    const session = buildCaseScopedCurriculumWorkSession({
      reviewCase,
      availableProposals: proposals,
      actorId: 'teacher-a',
      startedAt: '2026-09-07T10:10:00.000Z',
    });

    expect(session.reviewCaseId).toBe(reviewCase.id);
    expect(session.targetedProposalRefs).toEqual(['tec-case-1', 'tec-case-2']);
    expect(session.decisions).toEqual({});
    expect(session.customTexts).toEqual({});
    expect(session.previousDecisionCarryForward).toBe(false);
    expect(session.previousProfessionalContributionReuse).toBe(false);
    expect(session.sharedContributionMustMatchReviewCase).toBe(true);
    expect(session.stage).toBe('EXAMINE');
    expect(session.sessionState).toBe('ACTIVE');
    expect(getCaseScopedProposals(reviewCase, proposals).map((proposal) => proposal.id)).toEqual(['tec-case-1', 'tec-case-2']);
  });

  it('fails closed when a proposal outside the case is addressed or the frozen scope is not resolvable', () => {
    const session = buildCaseScopedCurriculumWorkSession({ reviewCase, availableProposals: proposals });
    expect(() => recordCaseDecision({ session, proposalRef: 'tec-outside', decision: 'approved' }))
      .toThrowError('CASE_WORK_SESSION_PROPOSAL_OUT_OF_SCOPE');

    expect(() => assertCaseScopeIsResolvable(reviewCase, proposals.filter((proposal) => proposal.id !== 'tec-case-2')))
      .toThrowError('CASE_WORK_SESSION_SCOPE_NOT_RESOLVABLE');
  });

  it('requires all case decisions before SHARE and a current persisted share before COMPARE', () => {
    const initial = buildCaseScopedCurriculumWorkSession({ reviewCase, availableProposals: proposals });
    const onePrepared = recordCaseDecision({ session: initial, proposalRef: 'tec-case-1', decision: 'approved' });
    expect(isCasePersonalReviewComplete(onePrepared)).toBe(false);
    expect(() => transitionCaseWorkSessionStage({ session: onePrepared, nextStage: 'SHARE' }))
      .toThrowError('CASE_PERSONAL_REVIEW_INCOMPLETE');

    const complete = recordCaseDecision({ session: onePrepared, proposalRef: 'tec-case-2', decision: 'custom', customText: 'Nuova formulazione del caso.' });
    expect(isCasePersonalReviewComplete(complete)).toBe(true);
    const share = transitionCaseWorkSessionStage({ session: complete, nextStage: 'SHARE' });
    expect(() => transitionCaseWorkSessionStage({ session: share, nextStage: 'COMPARE', persistedShareComplete: false }))
      .toThrowError('CASE_CURRENT_SHARE_REQUIRED');
    const compare = transitionCaseWorkSessionStage({ session: share, nextStage: 'COMPARE', persistedShareComplete: true });
    expect(compare.stage).toBe('COMPARE');
  });

  it('restores the same case session for the same actor and rejects actor substitution', () => {
    const session = buildCaseScopedCurriculumWorkSession({ reviewCase, availableProposals: proposals, actorId: 'teacher-a' });
    expect(resumeCaseWorkSession({ ...session, sessionState: 'PAUSED' }, 'teacher-a').sessionState).toBe('ACTIVE');
    expect(() => resumeCaseWorkSession({ ...session, sessionState: 'PAUSED' }, 'teacher-b'))
      .toThrowError('CASE_WORK_SESSION_ACTOR_MISMATCH');
  });

  it('makes the shared proposal fingerprint explicitly case-scoped', async () => {
    const base = {
      academicYear: '2026/2027',
      order: 'secondaria',
      groupCode: 'S-G02',
      discipline: 'tecnologia',
      proposalRef: proposals[0].id,
      focus: proposals[0].focus,
      oldText: proposals[0].oldText,
      newText: proposals[0].newText,
    };
    const first = await fingerprintCaseScopedTeamReviewProposal({ ...base, reviewCaseId: reviewCase.id });
    const same = await fingerprintCaseScopedTeamReviewProposal({ ...base, reviewCaseId: reviewCase.id });
    const other = await fingerprintCaseScopedTeamReviewProposal({ ...base, reviewCaseId: `${reviewCase.id}:OTHER` });
    expect(first).toBe(same);
    expect(first).not.toBe(other);
  });

  it('keeps the case session dominant, makes the active actor visible, and keeps persistence exact-case', () => {
    expect(caseSurfaceSource).toContain('data-revision-surface-mode="CASE_SCOPED"');
    expect(caseSurfaceSource).toContain("reviewCase.workSession?.sessionState === 'ACTIVE'");
    expect(caseSessionSource).toContain('data-case-scoped-curriculum-work-session');
    expect(caseSessionSource).toContain('data-case-active-identity');
    expect(caseSessionSource).toContain('data-case-active-role={activeRole ?? \'unverified\'}');
    expect(caseSessionSource).toContain('Stai lavorando come:');
    expect(caseSessionSource).toContain('team.session?.user.email');
    expect(caseSessionSource).toContain('team.selectedMembership?.role');
    expect(caseSessionSource).toContain('Identità del team in verifica. Non condividere finché account e ruolo non sono visibili.');
    expect(caseSessionSource).toContain('Le decisioni della sessione generale non vengono importate.');
    expect(casePublisherSource).toContain('data-review-case-id={reviewCaseId}');
    expect(caseRepositorySource).toContain(".eq('review_case_id', scope.reviewCaseId)");
    expect(caseRepositorySource).toContain("'upsert_team_review_contribution_v3'");
    expect(caseRepositorySource).toContain("'record_team_review_outcome_v3'");
    expect(migrationSource).toContain('team_review_contributions_case_identity_uidx');
    expect(migrationSource).toContain('and contribution.review_case_id = p_review_case_id');
    expect(migrationSource).toContain('A case-scoped contribution never satisfies another case.');
  });
});
