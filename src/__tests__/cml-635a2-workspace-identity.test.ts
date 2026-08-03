import { beforeEach, describe, expect, it } from 'vitest';
import type { EntityId } from '../domain/curriculum/identity';
import { createWorkspaceIdentity, type WorkspaceIdentity } from '../domain/institution';
import {
  deserializePersistedWorkspaceIdentity,
  hydratePersistedWorkspaceIdentity,
  serializePersistedWorkspaceIdentity,
  useCurriculumStore,
} from '../store/useCurriculumStore';

const instituteRef = { id: 'a635a201' as EntityId, entityType: 'institute' as const, snapshotLabel: 'Istituto locale' };
const yearRef = { id: 'a635a202' as EntityId, entityType: 'academic-year' as const, snapshotLabel: '2026/2027' };

function validIdentity(): WorkspaceIdentity {
  return createWorkspaceIdentity({
    institutionRef: instituteRef,
    academicYearRef: yearRef,
    operatingMode: 'institutional-local',
  }, '2026-08-03T00:00:00.000Z');
}

describe('CML-635A2 WorkspaceIdentity persistence and state integration', () => {
  beforeEach(async () => {
    await useCurriculumStore.persist.clearStorage();
    useCurriculumStore.getState().resetWorkspaceIdentity();
  });

  it('starts from a deterministic neutral state when no identity is persisted', () => {
    expect(useCurriculumStore.getState().workspaceIdentity).toBeUndefined();
  });

  it('serializes through A1 and restores the identity in the canonical store', async () => {
    const identity = validIdentity();

    expect(serializePersistedWorkspaceIdentity(identity)).toBe(JSON.stringify(identity));
    useCurriculumStore.getState().setWorkspaceIdentity(identity);
    expect(useCurriculumStore.getState().workspaceIdentity).toEqual(identity);

    await useCurriculumStore.persist.rehydrate();
    expect(useCurriculumStore.getState().workspaceIdentity).toEqual(identity);
  });

  it('applies immutable replacement and supports returning to the neutral state', () => {
    const identity = validIdentity();
    useCurriculumStore.getState().setWorkspaceIdentity(identity);
    const replacement = { ...identity, operatingMode: 'personal-local' as const };

    useCurriculumStore.getState().setWorkspaceIdentity(replacement);
    expect(useCurriculumStore.getState().workspaceIdentity).toEqual(replacement);
    expect(useCurriculumStore.getState().workspaceIdentity).not.toBe(identity);

    useCurriculumStore.getState().resetWorkspaceIdentity();
    expect(useCurriculumStore.getState().workspaceIdentity).toBeUndefined();
  });

  it('rejects malformed or stale persisted values without breaking hydration', () => {
    expect(deserializePersistedWorkspaceIdentity('{"id":"bad"}')).toBeUndefined();
    expect(deserializePersistedWorkspaceIdentity('not-json')).toBeUndefined();
    expect(deserializePersistedWorkspaceIdentity(undefined)).toBeUndefined();

    expect(hydratePersistedWorkspaceIdentity({ workspaceIdentitySerialized: '{"id":"bad"}' })).toBeUndefined();
    expect(hydratePersistedWorkspaceIdentity({ workspaceIdentitySerialized: undefined })).toBeUndefined();
    expect(useCurriculumStore.getState().workspaceIdentity).toBeUndefined();
  });

  it('keeps persisted states created before CML-635A2 compatible', () => {
    expect(useCurriculumStore.getState().workspaceIdentity).toBeUndefined();
  });
});
