import { describe, expect, it } from 'vitest';
import {
  ARENA_PROCESS_PIPELINE,
  ARENA_ROLE_EXPERIENCES,
  getArenaProcessContract,
  getArenaRoleExperience,
  isCanonicalAdoptionImplemented,
} from '../domain/institution/processRoleModel';
import { getRoleCapabilities } from '../domain/institution/capabilities';

describe('Arena Process & Role Model v1', () => {
  it('freezes the seven canonical institutional processes in order', () => {
    expect(ARENA_PROCESS_PIPELINE.map((process) => process.id)).toEqual([
      'P1_SOURCE_QUALIFICATION',
      'P2_CURRICULUM_CONTEXT',
      'P3_CURRICULUM_ANALYSIS',
      'P4_REVISION_REVIEW',
      'P5_INSTITUTIONAL_DECISION',
      'P6_CANONICAL_ADOPTION',
      'P7_PLANNING_HANDOFF',
    ]);
  });

  it('keeps consequential institutional decision and adoption behind authenticated authority', () => {
    expect(getArenaProcessContract('P5_INSTITUTIONAL_DECISION')).toMatchObject({
      consequential: true,
      authenticatedAuthorityRequired: true,
    });
    expect(getArenaProcessContract('P6_CANONICAL_ADOPTION')).toMatchObject({
      consequential: true,
      authenticatedAuthorityRequired: true,
    });
  });

  it('does not claim canonical adoption is implemented', () => {
    expect(isCanonicalAdoptionImplemented()).toBe(false);
    expect(getArenaProcessContract('P6_CANONICAL_ADOPTION').implementationStatus).toBe('NOT_IMPLEMENTED');
  });

  it('does not grant institutional decision capability to docente, dipartimento, referente, dirigente or amministratore', () => {
    for (const role of ['docente', 'dipartimento', 'referente', 'dirigente', 'amministratore'] as const) {
      expect(getArenaRoleExperience(role).capabilities).not.toContain('REVISION_DECIDE');
    }
    expect(getArenaRoleExperience('collegio').capabilities).toContain('REVISION_DECIDE');
  });

  it('keeps the role-experience capability declarations aligned with the canonical capability model', () => {
    for (const experience of ARENA_ROLE_EXPERIENCES) {
      expect(experience.capabilities).toEqual(getRoleCapabilities(experience.role));
    }
  });

  it('does not expose a decision queue to roles without decision capability', () => {
    for (const experience of ARENA_ROLE_EXPERIENCES) {
      if (!experience.capabilities.includes('REVISION_DECIDE')) {
        expect(experience.queueStates).not.toContain('TO_DECIDE');
      }
    }
  });

  it('binds the existing Human Tasks to the processes they govern', () => {
    expect(getArenaProcessContract('P2_CURRICULUM_CONTEXT').humanTaskIds).toContain('HT-BETA-CURRICULUM-CONTEXT');
    expect(getArenaProcessContract('P4_REVISION_REVIEW').humanTaskIds).toContain('HT-BETA-REVISION-PREPARE');
    expect(getArenaProcessContract('P5_INSTITUTIONAL_DECISION').humanTaskIds).toContain('HT-REVISION-DECISION');
    expect(getArenaProcessContract('P7_PLANNING_HANDOFF').humanTaskIds).toContain('HT-BETA-PLANNING-HANDOFF');
  });
});
