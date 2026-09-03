import type { CurriculumPersistenceBackend } from './backend';
import { MemoryCurriculumPersistenceBackend } from './backend';
import { assertValidBackup, checksumPayload } from './backup';
import {
  adaptLegacyCurriculum,
  type AdaptedLegacyCurriculum,
  type LegacyCurriculumSource,
} from './legacyAdapters';
import { LEGACY_CURRICULUM_MIGRATION_ID, migrateLegacyCurriculum } from './migration';
import { rollbackLegacyCurriculumMigration } from './rollback';

export const R7C6B_MIGRATION_SAFETY_CAPABILITY = {
  proofScope: 'ISOLATED_MEMORY_REHEARSAL',
  backupGateProven: true,
  rollbackGateProven: true,
  deterministicComparisonProven: true,
  productionDatasetRehearsalProven: false,
  persistenceModeMutationAuthorized: false,
} as const;

type DomainCollectionName = 'versions' | 'segments' | 'nodes' | 'links';

type ComparableRecord = Record<string, unknown> & { id: string };

export interface MigrationDomainSnapshot {
  versions: ComparableRecord[];
  segments: ComparableRecord[];
  nodes: ComparableRecord[];
  links: ComparableRecord[];
}

export interface MigrationCollectionDiff {
  collection: DomainCollectionName;
  expectedCount: number;
  actualCount: number;
  missingIds: string[];
  unexpectedIds: string[];
  changedIds: string[];
}

export interface MigrationDeterministicComparison {
  state: 'MATCH' | 'MISMATCH' | 'SOURCE_NOT_ADAPTABLE';
  expectedChecksum: string | null;
  actualChecksum: string;
  diffs: MigrationCollectionDiff[];
}

export interface MigrationSafetyRehearsalResult {
  state: 'PASS' | 'FAIL';
  sourceChecksumBefore: string;
  sourceChecksumAfter: string;
  backupChecksum: string | null;
  migrationOutcome: string | null;
  rollbackOutcome: string | null;
  comparison: MigrationDeterministicComparison;
  migrationOwnedRecordCountBeforeRollback: number;
  migrationOwnedRecordCountAfterRollback: number;
  backupGateProven: boolean;
  rollbackGateProven: boolean;
  deterministicComparisonProven: boolean;
  sourceUnchanged: boolean;
  productionDatasetRehearsalProven: false;
  persistenceModeMutationAuthorized: false;
  failureReason?: string;
}

function stripMigrationProvenance<T extends Record<string, unknown>>(record: T): ComparableRecord {
  const { _migrationId: _ignoredMigrationId, _importedFromLegacy: _ignoredLegacyFlag, ...rest } = record;
  return rest as ComparableRecord;
}

function sortRecords(records: readonly ComparableRecord[]): ComparableRecord[] {
  return [...records].sort((left, right) => left.id.localeCompare(right.id));
}

function expectedSnapshot(adapted: AdaptedLegacyCurriculum): MigrationDomainSnapshot {
  return {
    versions: sortRecords([adapted.version as unknown as ComparableRecord]),
    segments: sortRecords(adapted.segments as unknown as ComparableRecord[]),
    nodes: sortRecords(adapted.nodes as unknown as ComparableRecord[]),
    links: sortRecords(adapted.links as unknown as ComparableRecord[]),
  };
}

export async function captureMigrationOwnedDomain(
  backend: CurriculumPersistenceBackend,
): Promise<MigrationDomainSnapshot> {
  const isOwned = (record: { _migrationId?: string }) =>
    record._migrationId === LEGACY_CURRICULUM_MIGRATION_ID;

  return {
    versions: sortRecords(
      (await backend.listVersions()).filter(isOwned).map((record) =>
        stripMigrationProvenance(record as unknown as ComparableRecord),
      ),
    ),
    segments: sortRecords(
      (await backend.listSegments()).filter(isOwned).map((record) =>
        stripMigrationProvenance(record as unknown as ComparableRecord),
      ),
    ),
    nodes: sortRecords(
      (await backend.listNodes()).filter(isOwned).map((record) =>
        stripMigrationProvenance(record as unknown as ComparableRecord),
      ),
    ),
    links: sortRecords(
      (await backend.listLinks()).filter(isOwned).map((record) =>
        stripMigrationProvenance(record as unknown as ComparableRecord),
      ),
    ),
  };
}

function diffCollection(
  collection: DomainCollectionName,
  expected: readonly ComparableRecord[],
  actual: readonly ComparableRecord[],
): MigrationCollectionDiff {
  const expectedById = new Map(expected.map((record) => [record.id, record] as const));
  const actualById = new Map(actual.map((record) => [record.id, record] as const));

  const missingIds = [...expectedById.keys()].filter((id) => !actualById.has(id)).sort();
  const unexpectedIds = [...actualById.keys()].filter((id) => !expectedById.has(id)).sort();
  const changedIds = [...expectedById.keys()]
    .filter((id) => {
      const actualRecord = actualById.get(id);
      return actualRecord !== undefined && checksumPayload(expectedById.get(id)) !== checksumPayload(actualRecord);
    })
    .sort();

  return {
    collection,
    expectedCount: expected.length,
    actualCount: actual.length,
    missingIds,
    unexpectedIds,
    changedIds,
  };
}

export async function compareLegacySourceToMigratedDomain(
  source: LegacyCurriculumSource,
  backend: CurriculumPersistenceBackend,
  now: string,
): Promise<MigrationDeterministicComparison> {
  const adaptation = adaptLegacyCurriculum(source, now);
  const actual = await captureMigrationOwnedDomain(backend);
  const actualChecksum = checksumPayload(actual);

  if (!adaptation.value) {
    return {
      state: 'SOURCE_NOT_ADAPTABLE',
      expectedChecksum: null,
      actualChecksum,
      diffs: [],
    };
  }

  const expected = expectedSnapshot(adaptation.value);
  const diffs: MigrationCollectionDiff[] = [
    diffCollection('versions', expected.versions, actual.versions),
    diffCollection('segments', expected.segments, actual.segments),
    diffCollection('nodes', expected.nodes, actual.nodes),
    diffCollection('links', expected.links, actual.links),
  ];
  const expectedChecksum = checksumPayload(expected);
  const mismatch = diffs.some((diff) =>
    diff.missingIds.length > 0 || diff.unexpectedIds.length > 0 || diff.changedIds.length > 0,
  );

  return {
    state: mismatch || expectedChecksum !== actualChecksum ? 'MISMATCH' : 'MATCH',
    expectedChecksum,
    actualChecksum,
    diffs,
  };
}

function countSnapshotRecords(snapshot: MigrationDomainSnapshot): number {
  return snapshot.versions.length + snapshot.segments.length + snapshot.nodes.length + snapshot.links.length;
}

/**
 * Executes the legacy migration only inside a fresh in-memory backend.
 * This proves migration mechanics, not the safety of any user's live local dataset.
 */
export async function rehearseLegacyCurriculumMigrationSafety(
  source: LegacyCurriculumSource,
  now = '2026-09-03T00:00:00.000Z',
): Promise<MigrationSafetyRehearsalResult> {
  const backend = new MemoryCurriculumPersistenceBackend();
  const sourceChecksumBefore = checksumPayload(source);
  let migrationOutcome: string | null = null;
  let rollbackOutcome: string | null = null;
  let backupChecksum: string | null = null;
  let migrationOwnedRecordCountBeforeRollback = 0;
  let migrationOwnedRecordCountAfterRollback = 0;
  let comparison: MigrationDeterministicComparison = {
    state: 'SOURCE_NOT_ADAPTABLE',
    expectedChecksum: null,
    actualChecksum: checksumPayload({ versions: [], segments: [], nodes: [], links: [] }),
    diffs: [],
  };

  try {
    const migration = await migrateLegacyCurriculum(backend, source, now);
    migrationOutcome = migration.outcome;

    const backup = await backend.getBackup(LEGACY_CURRICULUM_MIGRATION_ID);
    if (!backup) throw new Error('R7C6B_BACKUP_NOT_FOUND');
    assertValidBackup(backup);
    backupChecksum = backup.checksum;

    comparison = await compareLegacySourceToMigratedDomain(source, backend, now);
    const beforeRollback = await captureMigrationOwnedDomain(backend);
    migrationOwnedRecordCountBeforeRollback = countSnapshotRecords(beforeRollback);

    const rollback = await rollbackLegacyCurriculumMigration(backend, now);
    rollbackOutcome = rollback.outcome;

    const afterRollback = await captureMigrationOwnedDomain(backend);
    migrationOwnedRecordCountAfterRollback = countSnapshotRecords(afterRollback);

    const persistedBackup = await backend.getBackup(LEGACY_CURRICULUM_MIGRATION_ID);
    if (!persistedBackup) throw new Error('R7C6B_BACKUP_LOST_AFTER_ROLLBACK');
    assertValidBackup(persistedBackup);

    const metadata = await backend.getMigration(LEGACY_CURRICULUM_MIGRATION_ID);
    const sourceChecksumAfter = checksumPayload(source);
    const backupGateProven =
      backupChecksum === sourceChecksumBefore && checksumPayload(backup.payload) === sourceChecksumBefore;
    const rollbackGateProven =
      rollback.outcome === 'rolled-back' &&
      migrationOwnedRecordCountAfterRollback === 0 &&
      metadata?.status === 'rolled-back';
    const deterministicComparisonProven = comparison.state === 'MATCH';
    const sourceUnchanged = sourceChecksumAfter === sourceChecksumBefore;
    const state =
      backupGateProven && rollbackGateProven && deterministicComparisonProven && sourceUnchanged
        ? 'PASS'
        : 'FAIL';

    return {
      state,
      sourceChecksumBefore,
      sourceChecksumAfter,
      backupChecksum,
      migrationOutcome,
      rollbackOutcome,
      comparison,
      migrationOwnedRecordCountBeforeRollback,
      migrationOwnedRecordCountAfterRollback,
      backupGateProven,
      rollbackGateProven,
      deterministicComparisonProven,
      sourceUnchanged,
      productionDatasetRehearsalProven: false,
      persistenceModeMutationAuthorized: false,
    };
  } catch (error) {
    const sourceChecksumAfter = checksumPayload(source);
    return {
      state: 'FAIL',
      sourceChecksumBefore,
      sourceChecksumAfter,
      backupChecksum,
      migrationOutcome,
      rollbackOutcome,
      comparison,
      migrationOwnedRecordCountBeforeRollback,
      migrationOwnedRecordCountAfterRollback,
      backupGateProven: false,
      rollbackGateProven: false,
      deterministicComparisonProven: false,
      sourceUnchanged: sourceChecksumAfter === sourceChecksumBefore,
      productionDatasetRehearsalProven: false,
      persistenceModeMutationAuthorized: false,
      failureReason: error instanceof Error ? error.message : String(error),
    };
  }
}
