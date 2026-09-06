import { describe, expect, it } from 'vitest';
import operationalProfileSource from '../infrastructure/supabase/operationalProfile.ts?raw';
import onboardingHookSource from '../features/session/hooks/useOnboardingProfile.ts?raw';
import teamRepositorySource from '../infrastructure/supabase/sharedTeamReviewRepository.ts?raw';
import authorityMigrationSource from '../../supabase/migrations/20260906091500_team_review_authority_hardening.sql?raw';

describe('Arena operational onboarding authority boundary', () => {
  it('allows discipline competence but exposes no self-service coordinator field', () => {
    expect(operationalProfileSource).toContain('export interface LocalOperationalProfile');
    expect(operationalProfileSource).toContain('disciplines: string[]');
    expect(operationalProfileSource).not.toContain('coordinatorGroupCode');
    expect(operationalProfileSource).toContain('p_coordinator_group_code: null');
    expect(operationalProfileSource).toContain('Self-service coordination is forbidden server-side.');
    expect(onboardingHookSource).not.toContain('coordinatorGroupCode');
    expect(onboardingHookSource).toContain('rememberOperationalDiscipline');
  });

  it('fails closed when a client tries to self-assign coordination', () => {
    expect(authorityMigrationSource).toContain('SELF_ASSIGNED_OPERATIONAL_COORDINATOR_FORBIDDEN');
    expect(authorityMigrationSource).toContain("v_workspace_role not in ('dipartimento','referente')");
    expect(authorityMigrationSource).toContain('OPERATIONAL_DISCIPLINE_MEMBERSHIP_REQUIRED');
    expect(authorityMigrationSource).toContain('TEAM_REVIEW_COVERAGE_INCOMPLETE');
    expect(authorityMigrationSource).toContain('VERIFIED_TEAM_OUTCOME_AUTHORITY_REQUIRED');
  });

  it('requires the verified shared role again at the repository boundary', () => {
    expect(teamRepositorySource).toContain("const TEAM_OUTCOME_ROLES: readonly WorkspaceMemberRole[] = ['dipartimento', 'referente']");
    expect(teamRepositorySource).toContain("if (!TEAM_OUTCOME_ROLES.includes(context.membership.role))");
    expect(teamRepositorySource).toContain('Solo una membership verificata di Dipartimento o Referente può registrare l’esito del team.');
  });
});
