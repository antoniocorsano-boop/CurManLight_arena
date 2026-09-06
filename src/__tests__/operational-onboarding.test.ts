import { describe, expect, it } from 'vitest';
import { resolveOperationalAcademicYear } from '../infrastructure/supabase/operationalProfile';
import operationalProfileSource from '../infrastructure/supabase/operationalProfile.ts?raw';
import onboardingHookSource from '../features/session/hooks/useOnboardingProfile.ts?raw';
import teamRepositorySource from '../infrastructure/supabase/sharedTeamReviewRepository.ts?raw';
import authorityMigrationSource from '../../supabase/migrations/20260906094500_team_review_operational_scope.sql?raw';
import disciplineOrderFixSource from '../../supabase/migrations/20260906123000_fix_operational_discipline_order_validation.sql?raw';

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

  it('normalizes an explicit academic year and derives the current working year when the local store is empty', () => {
    expect(resolveOperationalAcademicYear('2026-2027', new Date(2026, 8, 6))).toBe('2026/2027');
    expect(resolveOperationalAcademicYear('2026/2027', new Date(2026, 8, 6))).toBe('2026/2027');
    expect(resolveOperationalAcademicYear('', new Date(2026, 8, 6))).toBe('2026/2027');
    expect(resolveOperationalAcademicYear('', new Date(2026, 5, 6))).toBe('2025/2026');
    expect(resolveOperationalAcademicYear('2026/2028', new Date(2026, 8, 6))).toBeNull();
  });

  it('accepts a discipline when at least one active mapping exists for the requested school order', () => {
    expect(disciplineOrderFixSource).toContain('where not exists (');
    expect(disciplineOrderFixSource).toContain('map.discipline = selected.discipline');
    expect(disciplineOrderFixSource).toContain('defs.school_order = p_school_order');
    expect(disciplineOrderFixSource).toContain('defs.active = true');
    expect(disciplineOrderFixSource).not.toContain('left join public.operational_group_discipline_map map');
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
