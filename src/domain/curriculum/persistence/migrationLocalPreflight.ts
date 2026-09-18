import { getCurriculumBaseline } from '../../../lib';
import { canonicalPayloadText, checksumPayload } from './backup';
import { CURRICULUM_PERSISTENCE_MODE } from './compatibilityMode';
import type { LegacyCurriculumSource } from './legacyAdapters';
import type { CurriculumMigrationReadinessEvidence } from './migrationReadiness';
import { rehearseLegacyCurriculumMigrationSafety } from './migrationSafetyRehearsal';

export const LEGACY_CUSTOM_CURRICULUM_STORAGE_KEY = 'curmanlight-custom-curriculum-v2' as const;
export const R7C6C_LOCAL_PREFLIGHT_RECEIPT_STORAGE_KEY =
  'cml.r7c6.local-migration-preflight-receipt.v1' as const;

export type LocalLegacyCurriculumOrigin = 'LOCAL_CUSTOM_CURRICULUM' | 'BUNDLED_BASELINE';

export interface CurrentLegacyCurriculumSnapshot {
  source: LegacyCurriculumSource;
  origin: LocalLegacyCurriculumOrigin;
}

export interface LocalMigrationPreflightReceipt {
  schemaVersion: 'arena-r7c6c-local-migration-preflight-v1';
  sourceOrigin: LocalLegacyCurriculumOrigin;
  sourceSha256: string;
  sourceChecksumFnv1a: string;
  sourceCanonicalByteLength: number;
  sourceSubjectCount: number;
  persistenceModeAtRun: 'legacy-only';
  runAt: string;
  rehearsalState: 'PASS';
  migrationOutcome: string;
  rollbackOutcome: string;
  comparisonState: 'MATCH';
  comparisonExpectedChecksum: string;
  comparisonActualChecksum: string;
  migrationOwnedRecordCountBeforeRollback: number;
  migrationOwnedRecordCountAfterRollback: 0;
  backupGateProven: true;
  rollbackGateProven: true;
  deterministicComparisonProven: true;
  productionDatasetMigrationRehearsalProven: true;
  liveLegacyDatasetMutated: false;
  productiveIndexedDbOpened: false;
  persistenceModeMutationAuthorized: false;
}

export type LocalMigrationPreflightRunResult =
  | { state: 'PASS'; receipt: LocalMigrationPreflightReceipt }
  | { state: 'BLOCKED'; reason: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const STRING_ARRAY_FIELDS = [
  'traguardi',
  'obiettivi',
  'evidenze',
  'conoscenze',
  'abilita',
  'competenze',
  'nucleiFondanti',
] as const;

export function isLegacyCurriculumSource(value: unknown): value is LegacyCurriculumSource {
  if (!isRecord(value)) return false;

  for (const discipline of Object.values(value)) {
    if (!isRecord(discipline)) return false;
    for (const order of ['infanzia', 'primaria', 'secondaria'] as const) {
      const level = discipline[order];
      if (level === undefined) continue;
      if (!isRecord(level)) return false;

      for (const field of STRING_ARRAY_FIELDS) {
        const candidate = level[field];
        if (
          candidate !== undefined &&
          (!Array.isArray(candidate) || candidate.some((item) => typeof item !== 'string'))
        ) {
          return false;
        }
      }

      if (level.classLabel !== undefined && typeof level.classLabel !== 'string') return false;
      if (
        level.classRange !== undefined &&
        (!Array.isArray(level.classRange) || level.classRange.some((item) => typeof item !== 'string'))
      ) {
        return false;
      }
    }
  }

  return true;
}

export function readCurrentLegacyCurriculumSnapshot(
  storage: Pick<Storage, 'getItem'>,
): CurrentLegacyCurriculumSnapshot {
  const custom = storage.getItem(LEGACY_CUSTOM_CURRICULUM_STORAGE_KEY);
  if (custom !== null) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(custom);
    } catch {
      throw new Error('R7C6C_LOCAL_CURRICULUM_JSON_INVALID');
    }
    if (!isLegacyCurriculumSource(parsed)) {
      throw new Error('R7C6C_LOCAL_CURRICULUM_SHAPE_INVALID');
    }
    return { source: structuredClone(parsed), origin: 'LOCAL_CUSTOM_CURRICULUM' };
  }

  const baseline = getCurriculumBaseline() as unknown;
  if (!isLegacyCurriculumSource(baseline)) {
    throw new Error('R7C6C_BUNDLED_BASELINE_SHAPE_INVALID');
  }
  return { source: structuredClone(baseline), origin: 'BUNDLED_BASELINE' };
}

async function sha256Hex(text: string): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error('R7C6C_WEB_CRYPTO_UNAVAILABLE');
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function fingerprintLegacyCurriculumSource(
  source: LegacyCurriculumSource,
): Promise<{ sha256: string; fnv1a: string; canonicalByteLength: number }> {
  const text = canonicalPayloadText(source);
  return {
    sha256: await sha256Hex(text),
    fnv1a: checksumPayload(source),
    canonicalByteLength: new TextEncoder().encode(text).byteLength,
  };
}

export async function runLocalLegacyCurriculumMigrationPreflight(
  storage: Pick<Storage, 'getItem'>,
  now = new Date().toISOString(),
): Promise<LocalMigrationPreflightRunResult> {
  if (CURRICULUM_PERSISTENCE_MODE !== 'legacy-only') {
    return { state: 'BLOCKED', reason: 'R7C6C_REQUIRES_LEGACY_ONLY_MODE' };
  }

  try {
    const snapshot = readCurrentLegacyCurriculumSnapshot(storage);
    const fingerprint = await fingerprintLegacyCurriculumSource(snapshot.source);
    const rehearsal = await rehearseLegacyCurriculumMigrationSafety(snapshot.source, now);

    if (
      rehearsal.state !== 'PASS' ||
      rehearsal.backupGateProven !== true ||
      rehearsal.rollbackGateProven !== true ||
      rehearsal.deterministicComparisonProven !== true ||
      rehearsal.comparison.state !== 'MATCH' ||
      rehearsal.comparison.expectedChecksum === null ||
      rehearsal.migrationOutcome === null ||
      rehearsal.rollbackOutcome === null ||
      rehearsal.migrationOwnedRecordCountAfterRollback !== 0
    ) {
      return {
        state: 'BLOCKED',
        reason: rehearsal.failureReason ?? 'R7C6C_REHEARSAL_DID_NOT_PASS',
      };
    }

    const receipt: LocalMigrationPreflightReceipt = {
      schemaVersion: 'arena-r7c6c-local-migration-preflight-v1',
      sourceOrigin: snapshot.origin,
      sourceSha256: fingerprint.sha256,
      sourceChecksumFnv1a: fingerprint.fnv1a,
      sourceCanonicalByteLength: fingerprint.canonicalByteLength,
      sourceSubjectCount: Object.keys(snapshot.source).length,
      persistenceModeAtRun: 'legacy-only',
      runAt: now,
      rehearsalState: 'PASS',
      migrationOutcome: rehearsal.migrationOutcome,
      rollbackOutcome: rehearsal.rollbackOutcome,
      comparisonState: 'MATCH',
      comparisonExpectedChecksum: rehearsal.comparison.expectedChecksum,
      comparisonActualChecksum: rehearsal.comparison.actualChecksum,
      migrationOwnedRecordCountBeforeRollback: rehearsal.migrationOwnedRecordCountBeforeRollback,
      migrationOwnedRecordCountAfterRollback: 0,
      backupGateProven: true,
      rollbackGateProven: true,
      deterministicComparisonProven: true,
      productionDatasetMigrationRehearsalProven: true,
      liveLegacyDatasetMutated: false,
      productiveIndexedDbOpened: false,
      persistenceModeMutationAuthorized: false,
    };

    return { state: 'PASS', receipt };
  } catch (error) {
    return {
      state: 'BLOCKED',
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

export function validateLocalMigrationPreflightReceipt(
  value: unknown,
  currentSourceSha256: string,
): value is LocalMigrationPreflightReceipt {
  if (!isRecord(value)) return false;
  return (
    value.schemaVersion === 'arena-r7c6c-local-migration-preflight-v1' &&
    value.persistenceModeAtRun === 'legacy-only' &&
    value.rehearsalState === 'PASS' &&
    value.comparisonState === 'MATCH' &&
    value.backupGateProven === true &&
    value.rollbackGateProven === true &&
    value.deterministicComparisonProven === true &&
    value.productionDatasetMigrationRehearsalProven === true &&
    value.liveLegacyDatasetMutated === false &&
    value.productiveIndexedDbOpened === false &&
    value.persistenceModeMutationAuthorized === false &&
    value.migrationOwnedRecordCountAfterRollback === 0 &&
    typeof value.sourceSha256 === 'string' &&
    /^[a-f0-9]{64}$/.test(value.sourceSha256) &&
    value.sourceSha256 === currentSourceSha256 &&
    typeof value.sourceChecksumFnv1a === 'string' &&
    value.sourceChecksumFnv1a.startsWith('fnv1a-') &&
    typeof value.runAt === 'string' &&
    typeof value.comparisonExpectedChecksum === 'string' &&
    value.comparisonExpectedChecksum === value.comparisonActualChecksum
  );
}

export function applyLocalMigrationPreflightReceiptToReadiness(
  evidence: CurriculumMigrationReadinessEvidence,
  receipt: unknown,
  currentSourceSha256: string,
): CurriculumMigrationReadinessEvidence {
  if (!validateLocalMigrationPreflightReceipt(receipt, currentSourceSha256)) return evidence;
  return {
    ...evidence,
    productionDatasetMigrationRehearsalProven: true,
  };
}
