import { describe, expect, it } from 'vitest';
import {
  ARENA_OBSERVER_READ_ONLY,
  getObserverCapabilities,
  observerMayMutate,
  projectObserverWorkQueue,
  resolveCapabilityAccess,
  type ArenaCapability,
  type ArenaWorkItemSeed,
} from '../domain/institution';

const mutationCapabilities: ArenaCapability[] = [
  'CURRICULUM_PROPOSE',
  'REVISION_REVIEW',
  'REVISION_DECIDE',
  'CURRICULUM_ADOPT',
  'DOCUMENT_PREPARE',
  'DOCUMENT_EXPORT',
  'WORKSPACE_ADMIN',
];

const seed = (
  overrides: Partial<ArenaWorkItemSeed> = {},
): ArenaWorkItemSeed => ({
  id: 'work-1',
  processId: 'P4_REVISION_REVIEW',
  title: 'Esamina proposta',
  reason: 'Proposta pronta per revisione',
  queueState: 'TO_REVIEW',
  evidenceState: 'READY',
  requiredCapability: 'REVISION_REVIEW',
  nextActionLabel: 'Apri revisione',
  consequential: false,
  authenticatedAuthorityRequired: false,
  orderKey: '001',
  ...overrides,
});

describe('R6 Observer / institutional read-only experience', () => {
  it('is a capability profile, not an authority role', () => {
    expect(ARENA_OBSERVER_READ_ONLY.authorityRole).toBe(false);
    expect(ARENA_OBSERVER_READ_ONLY.accessProfile).toBe('observer-read-only');
    expect(ARENA_OBSERVER_READ_ONLY.mutationPolicy).toBe('DENY_ALL');
    expect(ARENA_OBSERVER_READ_ONLY.visibleDomains).toEqual(['curriculum', 'evidence', 'process']);
    expect(observerMayMutate()).toBe(false);
  });

  it('grants only curriculum read regardless of the underlying role', () => {
    expect(getObserverCapabilities()).toEqual(['CURRICULUM_READ']);

    expect(resolveCapabilityAccess(
      'collegio',
      'CURRICULUM_READ',
      'authenticated-workspace',
      'observer-read-only',
    ).allowed).toBe(true);

    for (const capability of mutationCapabilities) {
      expect(resolveCapabilityAccess(
        'collegio',
        capability,
        'authenticated-workspace',
        'observer-read-only',
      ).allowed).toBe(false);
    }
  });

  it('blocks proposal mutation even when the underlying role could normally review', () => {
    const [item] = projectObserverWorkQueue(
      [seed()],
      'dipartimento',
      'authenticated-workspace',
    );

    expect(item.access).toBe('READ_ONLY');
    expect(item.accessReason).toMatch(/profilo osservatore/i);
  });

  it('blocks institutional decision even for an authenticated Collegio', () => {
    const [item] = projectObserverWorkQueue([
      seed({
        processId: 'P5_INSTITUTIONAL_DECISION',
        queueState: 'TO_DECIDE',
        requiredCapability: 'REVISION_DECIDE',
        consequential: true,
        authenticatedAuthorityRequired: true,
      }),
    ], 'collegio', 'authenticated-workspace');

    expect(item.access).toBe('READ_ONLY');
  });

  it('blocks planning export and workspace administration as mutation-adjacent capabilities', () => {
    const items = projectObserverWorkQueue([
      seed({
        id: 'handoff',
        processId: 'P7_PLANNING_HANDOFF',
        queueState: 'TO_READ',
        requiredCapability: 'DOCUMENT_EXPORT',
        consequential: true,
        authenticatedAuthorityRequired: true,
      }),
      seed({
        id: 'admin',
        processId: 'P2_CURRICULUM_CONTEXT',
        queueState: 'TO_READ',
        requiredCapability: 'WORKSPACE_ADMIN',
      }),
    ], 'amministratore', 'authenticated-workspace');

    expect(items).toHaveLength(2);
    expect(items.every((item) => item.access === 'READ_ONLY')).toBe(true);
  });
});
