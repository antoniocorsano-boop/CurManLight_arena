import { describe, expect, it } from 'vitest';
import type { InstitutionalRole } from '../domain/curriculum/types';
import {
  projectArenaWorkItem,
  projectArenaWorkQueue,
  type ArenaActorProjection,
  type ArenaWorkItemSeed,
} from '../domain/institution/workQueue';

const seed = (overrides: Partial<ArenaWorkItemSeed> = {}): ArenaWorkItemSeed => ({
  id: 'work-1',
  processId: 'P4_REVISION_REVIEW',
  title: 'Esamina proposta',
  reason: 'La proposta è pronta per la revisione.',
  queueState: 'TO_REVIEW',
  evidenceState: 'READY',
  requiredCapability: 'REVISION_REVIEW',
  nextActionLabel: 'Esamina',
  nextActorRole: 'referente',
  consequential: false,
  authenticatedAuthorityRequired: false,
  orderKey: '001',
  ...overrides,
});

const actor = (
  role: InstitutionalRole,
  assurance: ArenaActorProjection['assurance'] = 'self-declared',
): ArenaActorProjection => ({ role, assurance });

describe('Arena Work Queue Contract v1', () => {
  it('allows a role to act only when its canonical capability permits the work', () => {
    expect(projectArenaWorkItem(seed(), actor('dipartimento')).access).toBe('ACTIONABLE');
    expect(projectArenaWorkItem(seed(), actor('referente')).access).toBe('ACTIONABLE');
    expect(projectArenaWorkItem(seed(), actor('docente')).access).toBe('READ_ONLY');
  });

  it('never turns a self-declared Collegio role into institutional decision authority', () => {
    const decision = seed({
      id: 'decision-1',
      processId: 'P5_INSTITUTIONAL_DECISION',
      queueState: 'TO_DECIDE',
      requiredCapability: 'REVISION_DECIDE',
      consequential: true,
      authenticatedAuthorityRequired: true,
      nextActorRole: 'collegio',
    });

    expect(projectArenaWorkItem(decision, actor('collegio', 'self-declared')).access).toBe('READ_ONLY');
    expect(projectArenaWorkItem(decision, actor('collegio', 'authenticated-workspace')).access).toBe('ACTIONABLE');
  });

  it('cannot weaken canonical P5 authority requirements through caller-controlled seed fields', () => {
    const weakenedDecision = seed({
      id: 'decision-weakened',
      processId: 'P5_INSTITUTIONAL_DECISION',
      queueState: 'TO_DECIDE',
      requiredCapability: 'CURRICULUM_READ',
      consequential: false,
      authenticatedAuthorityRequired: false,
      nextActorRole: 'collegio',
    });

    const selfDeclared = projectArenaWorkItem(weakenedDecision, actor('collegio', 'self-declared'));
    expect(selfDeclared.access).toBe('READ_ONLY');
    expect(selfDeclared.requiredCapability).toBe('REVISION_DECIDE');
    expect(selfDeclared.consequential).toBe(true);
    expect(selfDeclared.authenticatedAuthorityRequired).toBe(true);

    const authenticated = projectArenaWorkItem(weakenedDecision, actor('collegio', 'authenticated-workspace'));
    expect(authenticated.access).toBe('ACTIONABLE');
    expect(authenticated.requiredCapability).toBe('REVISION_DECIDE');
  });

  it('cannot weaken canonical P7 authenticated handoff requirements through seed fields', () => {
    const weakenedHandoff = seed({
      id: 'handoff-weakened',
      processId: 'P7_PLANNING_HANDOFF',
      queueState: 'TO_READ',
      requiredCapability: 'CURRICULUM_READ',
      consequential: false,
      authenticatedAuthorityRequired: false,
    });

    const projected = projectArenaWorkItem(weakenedHandoff, actor('docente', 'self-declared'));
    expect(projected.access).toBe('READ_ONLY');
    expect(projected.requiredCapability).toBe('DOCUMENT_EXPORT');
    expect(projected.consequential).toBe(true);
    expect(projected.authenticatedAuthorityRequired).toBe(true);
  });

  it('keeps an authenticated Dirigente read-only for Collegio decision work', () => {
    const decision = seed({
      processId: 'P5_INSTITUTIONAL_DECISION',
      queueState: 'TO_DECIDE',
      requiredCapability: 'REVISION_DECIDE',
      consequential: true,
      authenticatedAuthorityRequired: true,
    });

    expect(projectArenaWorkItem(decision, actor('dirigente', 'authenticated-workspace')).access).toBe('READ_ONLY');
  });

  it('does not let technical administration become curriculum decision authority', () => {
    const decision = seed({
      processId: 'P5_INSTITUTIONAL_DECISION',
      queueState: 'TO_DECIDE',
      requiredCapability: 'REVISION_DECIDE',
      consequential: true,
      authenticatedAuthorityRequired: true,
    });

    expect(projectArenaWorkItem(decision, actor('amministratore', 'authenticated-workspace')).access).toBe('READ_ONLY');
  });

  it('fails canonical adoption closed because P6 is not implemented', () => {
    const adoption = seed({
      id: 'adoption-1',
      processId: 'P6_CANONICAL_ADOPTION',
      queueState: 'TO_DECIDE',
      requiredCapability: 'REVISION_DECIDE',
      consequential: true,
      authenticatedAuthorityRequired: true,
    });

    const projected = projectArenaWorkItem(adoption, actor('collegio', 'authenticated-workspace'));
    expect(projected.access).toBe('READ_ONLY');
    expect(projected.effectiveBlocker).toMatch(/non implementato/i);
  });

  it('keeps completed items non-actionable even when the actor has the capability', () => {
    const completed = projectArenaWorkItem(
      seed({
        id: 'completed-1',
        queueState: 'COMPLETED',
        requiredCapability: 'REVISION_REVIEW',
      }),
      actor('referente'),
    );

    expect(completed.access).toBe('READ_ONLY');
    expect(completed.accessReason).toMatch(/completato/i);
  });

  it('blocks consequential actions when required evidence is missing or stale', () => {
    for (const evidenceState of ['MISSING', 'STALE'] as const) {
      const decision = seed({
        processId: 'P5_INSTITUTIONAL_DECISION',
        queueState: 'TO_DECIDE',
        evidenceState,
        requiredCapability: 'REVISION_DECIDE',
        consequential: true,
        authenticatedAuthorityRequired: true,
      });
      expect(projectArenaWorkItem(decision, actor('collegio', 'authenticated-workspace')).access).toBe('READ_ONLY');
    }
  });

  it('projects work for all seven canonical processes without mutating process state', () => {
    const seeds: ArenaWorkItemSeed[] = [
      seed({ id: 'p1', processId: 'P1_SOURCE_QUALIFICATION', queueState: 'TO_VERIFY', requiredCapability: 'CURRICULUM_READ', orderKey: '001' }),
      seed({ id: 'p2', processId: 'P2_CURRICULUM_CONTEXT', queueState: 'TO_READ', requiredCapability: 'CURRICULUM_READ', orderKey: '002' }),
      seed({ id: 'p3', processId: 'P3_CURRICULUM_ANALYSIS', queueState: 'TO_REVIEW', requiredCapability: 'REVISION_REVIEW', orderKey: '003' }),
      seed({ id: 'p4', processId: 'P4_REVISION_REVIEW', queueState: 'TO_REVIEW', requiredCapability: 'REVISION_REVIEW', orderKey: '004' }),
      seed({ id: 'p5', processId: 'P5_INSTITUTIONAL_DECISION', queueState: 'TO_DECIDE', requiredCapability: 'REVISION_DECIDE', consequential: true, authenticatedAuthorityRequired: true, orderKey: '005' }),
      seed({ id: 'p6', processId: 'P6_CANONICAL_ADOPTION', queueState: 'TO_DECIDE', requiredCapability: 'REVISION_DECIDE', consequential: true, authenticatedAuthorityRequired: true, orderKey: '006' }),
      seed({ id: 'p7', processId: 'P7_PLANNING_HANDOFF', queueState: 'TO_READ', requiredCapability: 'DOCUMENT_EXPORT', consequential: true, authenticatedAuthorityRequired: true, orderKey: '007' }),
    ];

    const before = JSON.stringify(seeds);
    const projected = projectArenaWorkQueue(seeds, actor('referente'));
    expect(JSON.stringify(seeds)).toBe(before);
    expect(new Set(projected.map((item) => item.processId))).toEqual(new Set(seeds.map((item) => item.processId)));
  });

  it('covers all six institutional roles with deterministic visibility', () => {
    const work = seed({ requiredCapability: 'REVISION_REVIEW' });
    const roles: InstitutionalRole[] = ['docente', 'dipartimento', 'referente', 'collegio', 'dirigente', 'amministratore'];
    const results = roles.map((role) => [role, projectArenaWorkItem(work, actor(role)).access] as const);

    expect(results).toEqual([
      ['docente', 'READ_ONLY'],
      ['dipartimento', 'ACTIONABLE'],
      ['referente', 'ACTIONABLE'],
      ['collegio', 'READ_ONLY'],
      ['dirigente', 'ACTIONABLE'],
      ['amministratore', 'READ_ONLY'],
    ]);
  });

  it('orders the queue by governed work state, then stable order key and id', () => {
    const items = [
      seed({ id: 'read', queueState: 'TO_READ', requiredCapability: 'CURRICULUM_READ', orderKey: '001' }),
      seed({ id: 'done', queueState: 'COMPLETED', requiredCapability: 'CURRICULUM_READ', orderKey: '001' }),
      seed({ id: 'decision', queueState: 'TO_DECIDE', requiredCapability: 'CURRICULUM_READ', orderKey: '001' }),
      seed({ id: 'review-b', queueState: 'TO_REVIEW', requiredCapability: 'CURRICULUM_READ', orderKey: '002' }),
      seed({ id: 'verify', queueState: 'TO_VERIFY', requiredCapability: 'CURRICULUM_READ', orderKey: '001' }),
      seed({ id: 'review-a', queueState: 'TO_REVIEW', requiredCapability: 'CURRICULUM_READ', orderKey: '001' }),
    ];

    expect(projectArenaWorkQueue(items, actor('docente')).map((item) => item.id)).toEqual([
      'verify',
      'review-a',
      'review-b',
      'decision',
      'read',
      'done',
    ]);
  });

  it('hides work only when the actor has neither the required capability nor curriculum read access', () => {
    const undeclared = projectArenaWorkItem(seed(), actor('non-dichiarato'));
    expect(undeclared.access).toBe('HIDDEN');
    expect(projectArenaWorkQueue([seed()], actor('non-dichiarato'))).toEqual([]);
  });
});
