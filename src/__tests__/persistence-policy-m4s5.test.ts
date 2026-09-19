import { describe, expect, it } from 'vitest';
import {
  ARENA_M4_PERSISTENCE_POLICY,
  assertArenaM4PersistencePolicy,
} from '../domain/persistence/m4PersistencePolicy';

describe('M4-S5 bounded hybrid persistence policy', () => {
  it('keeps canonical curriculum migration explicitly blocked in M4', () => {
    expect(() => assertArenaM4PersistencePolicy()).not.toThrow();
    expect(ARENA_M4_PERSISTENCE_POLICY.model).toBe('BOUNDED_HYBRID');
    expect(ARENA_M4_PERSISTENCE_POLICY.curriculumPersistenceMode).toBe('legacy-only');
    expect(ARENA_M4_PERSISTENCE_POLICY.curriculumMigrationAuthorized).toBe(false);
  });

  it('separates local personal persistence from authenticated institutional persistence', () => {
    expect(ARENA_M4_PERSISTENCE_POLICY.entries).toEqual(expect.arrayContaining([
      expect.objectContaining({
        key: 'personal-review-and-local-archives',
        plane: 'LOCAL_DEVICE',
        authority: 'PERSONAL',
        durable: true,
      }),
      expect.objectContaining({
        key: 'authenticated-team-and-institutional-records',
        plane: 'SHARED_INSTITUTIONAL',
        authority: 'AUTHENTICATED_WORKSPACE',
        durable: true,
      }),
    ]));
  });

  it('forbids durable credentials and cross-product persistence coupling', () => {
    expect(ARENA_M4_PERSISTENCE_POLICY.credentialDurablePersistenceAllowed).toBe(false);
    expect(ARENA_M4_PERSISTENCE_POLICY.sharedDatabaseWithAtlas).toBe(false);
    expect(ARENA_M4_PERSISTENCE_POLICY.sharedDatabaseWithDocenteOs).toBe(false);
    expect(ARENA_M4_PERSISTENCE_POLICY.automaticCrossProductWrite).toBe(false);
  });
});
