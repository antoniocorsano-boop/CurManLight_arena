import { describe, expect, it } from 'vitest';
import {
  getSharedReviewCaseContext,
  mergeAssignedReviewCases,
  sharedRowToCurriculumReviewCase,
} from '../domain/curriculum/sharedReviewCase';
import inboxSource from '../features/beta/SharedReviewCaseInbox.tsx?raw';
import wrapperSource from '../features/beta/CaseAwareRevisionSurface.tsx?raw';
import teamContextSource from '../features/beta/useTeamWorkspaceContext.ts?raw';
import {
  normalizeSharedReviewAcademicYear,
} from '../infrastructure/supabase/sharedCurriculumReviewCaseRepository';
import repositorySource from '../infrastructure/supabase/sharedCurriculumReviewCaseRepository.ts?raw';
import migrationSource from '../../supabase/migrations/20260907064000_shared_curriculum_review_case_discovery.sql?raw';

const baseRow = {
  case_id: 'CRC:shared-case-test',
  workspace_id: 'workspace-test',
  academic_year: '2026/2027',
  group_code: 'S-G02',
  discipline: 'tecnologia',
  school_order: 'secondaria' as const,
  class_or_age_band: '1',
  curriculum_unit_key: 'CAN-CURR-MASTER-00:1.3:secondaria:1:tecnologia',
  master_id: 'CAN-CURR-MASTER-00' as const,
  master_drive_file_id: 'master-drive-file',
  master_version: '1.3',
  trigger_id: 'RT:shared-case-test',
  trigger_type: 'INSTITUTE_NEED' as const,
  qualification_basis: 'EXPLICIT_INSTITUTE_NEED' as const,
  trigger_recorded_at: '2026-09-07T04:20:00.000Z',
  targeted_proposal_refs: ['proposal-a', 'proposal-b'],
  scope_reason: 'Riaprire soltanto le schede direttamente interessate.',
  opened_at: '2026-09-07T04:30:00.000Z',
  opened_by_user_id: 'actor-test',
  opened_by_role: 'dipartimento',
  published_by_user_id: 'actor-test',
  published_by_role: 'dipartimento' as const,
  published_at: '2026-09-07T04:31:00.000Z',
  assignment_state: 'ASSIGNED' as const,
  assignment_count: 2,
};

describe('Shared CurriculumReviewCase discovery', () => {
  it('hydrates assignment without starting H2', () => {
    const reviewCase = sharedRowToCurriculumReviewCase(baseRow);
    expect(reviewCase.targetedProposalRefs).toEqual(['proposal-a', 'proposal-b']);
    expect(reviewCase.caseState).toBe('OPEN_AT_APPLICABLE_CURRICULUM');
    expect(reviewCase.currentHumanPhase).toBe('H1_APPLICABLE_CURRICULUM');
    expect(reviewCase.professionalValidationState).toBe('NOT_STARTED');
    expect(reviewCase.workSession).toBeUndefined();
    expect(getSharedReviewCaseContext(reviewCase)?.assignmentCount).toBe(2);
  });

  it('rejects a conflicting server snapshot for the same case id', () => {
    const first = sharedRowToCurriculumReviewCase(baseRow);
    const conflicting = sharedRowToCurriculumReviewCase({ ...baseRow, targeted_proposal_refs: ['proposal-c'] });
    expect(() => mergeAssignedReviewCases([first], [conflicting])).toThrowError('SHARED_REVIEW_CASE_SNAPSHOT_MISMATCH');
  });

  it('normalizes the local school-year format at the shared repository boundary', () => {
    expect(normalizeSharedReviewAcademicYear('2026-2027')).toBe('2026/2027');
    expect(normalizeSharedReviewAcademicYear('2026/2027')).toBe('2026/2027');
    expect(() => normalizeSharedReviewAcademicYear('2026/2028')).toThrowError('Anno scolastico non valido.');
    expect(() => normalizeSharedReviewAcademicYear('')).toThrowError('Anno scolastico non valido.');
  });

  it('uses the verified operational membership as the authority source for the shared academic year', () => {
    expect(teamContextSource).toContain(".from('team_operational_memberships')");
    expect(teamContextSource).toContain('academic_year,school_order,group_code,member_role,membership_state,disciplines');
    expect(inboxSource).toContain('team.operationalMemberships.filter');
    expect(inboxSource).toContain('operationalMembership.academicYear');
    expect(inboxSource).toContain('data-operational-review-scope');
    expect(wrapperSource).toContain('getSharedReviewCaseContext(focusedCase)?.academicYear');
  });

  it('keeps assignment in Riesame and starts the case only by explicit action', () => {
    expect(inboxSource).toContain('Casi assegnati al mio gruppo');
    expect(inboxSource).toContain('Condividi e assegna al gruppo');
    expect(inboxSource).toContain('start-assigned-review-case');
    expect(inboxSource).toContain('Ricevere un caso non avvia automaticamente la validazione');
    expect(wrapperSource).toContain("reviewCase.workSession?.sessionState === 'ACTIVE'");
    expect(wrapperSource).toContain('<CaseScopedCurriculumWorkSession');
    expect(wrapperSource).toContain('<SharedReviewCaseInbox');
    expect(repositorySource).toContain("rpc('publish_curriculum_review_case_v1'");
    expect(repositorySource).toContain("rpc('list_my_assigned_curriculum_review_cases_v1'");
  });

  it('derives assignees from verified membership and operational discipline scope', () => {
    for (const token of [
      'shared_curriculum_review_case_assignments',
      'SHARED_REVIEW_CASE_ASSIGN_REQUIRED',
      'OPERATIONAL_DISCIPLINE_MEMBERSHIP_REQUIRED',
      "membership.role in ('docente','dipartimento','referente')",
      "operational.membership_state in ('OPERATIVO_PROVVISORIO','FORMALIZZATO')",
      'p_discipline = any(operational.disciplines)',
      'SHARED_REVIEW_CASE_ID_REUSE_MISMATCH',
      'SHARED_REVIEW_CASE_NO_ELIGIBLE_ASSIGNEES',
      'list_my_assigned_curriculum_review_cases_v1',
      'assignment.assigned_user_id = v_user',
      'revoke all on public.shared_curriculum_review_cases from public, anon, authenticated',
    ]) expect(migrationSource).toContain(token);
  });
});
