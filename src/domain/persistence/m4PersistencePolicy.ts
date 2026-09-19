import { CURRICULUM_PERSISTENCE_MODE } from '../curriculum/persistence/compatibilityMode';

export type ArenaPersistencePlane =
  | 'LOCAL_DEVICE'
  | 'SHARED_INSTITUTIONAL'
  | 'EPHEMERAL'
  | 'FORBIDDEN_DURABLE'
  | 'EXTERNAL_PRODUCT';

export interface ArenaPersistencePolicyEntry {
  key: string;
  plane: ArenaPersistencePlane;
  mechanism: string;
  authority: 'NONE' | 'PERSONAL' | 'AUTHENTICATED_WORKSPACE' | 'EXTERNAL';
  durable: boolean;
}

export const ARENA_M4_PERSISTENCE_POLICY = {
  schemaVersion: 'arena-m4-persistence-policy-v1',
  model: 'BOUNDED_HYBRID',
  curriculumPersistenceMode: CURRICULUM_PERSISTENCE_MODE,
  curriculumMigrationAuthorized: false,
  sharedDatabaseWithAtlas: false,
  sharedDatabaseWithDocenteOs: false,
  automaticCrossProductWrite: false,
  credentialDurablePersistenceAllowed: false,
  localAuthorityPromotionAllowed: false,
  entries: [
    {
      key: 'personal-review-and-local-archives',
      plane: 'LOCAL_DEVICE',
      mechanism: 'ZUSTAND_INDEXEDDB_DEXIE',
      authority: 'PERSONAL',
      durable: true,
    },
    {
      key: 'authenticated-team-and-institutional-records',
      plane: 'SHARED_INSTITUTIONAL',
      mechanism: 'SUPABASE_POSTGRES_RLS_REPOSITORIES',
      authority: 'AUTHENTICATED_WORKSPACE',
      durable: true,
    },
    {
      key: 'ui-session-navigation',
      plane: 'EPHEMERAL',
      mechanism: 'MEMORY_OR_BOUNDED_PREFERENCES',
      authority: 'NONE',
      durable: false,
    },
    {
      key: 'oauth-access-refresh-tokens',
      plane: 'FORBIDDEN_DURABLE',
      mechanism: 'MEMORY_ONLY',
      authority: 'NONE',
      durable: false,
    },
    {
      key: 'curriculum-atlas-state',
      plane: 'EXTERNAL_PRODUCT',
      mechanism: 'SEPARATE_PRODUCT',
      authority: 'EXTERNAL',
      durable: false,
    },
    {
      key: 'docente-os-operational-state',
      plane: 'EXTERNAL_PRODUCT',
      mechanism: 'SEPARATE_PRODUCT',
      authority: 'EXTERNAL',
      durable: false,
    },
  ] satisfies ArenaPersistencePolicyEntry[],
} as const;

export function assertArenaM4PersistencePolicy(): void {
  if (ARENA_M4_PERSISTENCE_POLICY.model !== 'BOUNDED_HYBRID') {
    throw new Error('ARENA_M4_PERSISTENCE_MODEL_INVALID');
  }
  if (ARENA_M4_PERSISTENCE_POLICY.curriculumPersistenceMode !== 'legacy-only') {
    throw new Error('ARENA_M4_CURRICULUM_MIGRATION_NOT_AUTHORIZED');
  }
  if (ARENA_M4_PERSISTENCE_POLICY.curriculumMigrationAuthorized) {
    throw new Error('ARENA_M4_CURRICULUM_MIGRATION_MUST_REMAIN_BLOCKED');
  }
  if (
    ARENA_M4_PERSISTENCE_POLICY.sharedDatabaseWithAtlas
    || ARENA_M4_PERSISTENCE_POLICY.sharedDatabaseWithDocenteOs
    || ARENA_M4_PERSISTENCE_POLICY.automaticCrossProductWrite
  ) {
    throw new Error('ARENA_M4_CROSS_PRODUCT_PERSISTENCE_BOUNDARY_VIOLATION');
  }
  if (ARENA_M4_PERSISTENCE_POLICY.credentialDurablePersistenceAllowed) {
    throw new Error('ARENA_M4_CREDENTIAL_DURABLE_PERSISTENCE_FORBIDDEN');
  }
}
