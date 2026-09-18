import { describe, expect, it } from 'vitest';
import type { LegacyCurriculumSource } from '../domain/curriculum/persistence/legacyAdapters';
import {
  LEGACY_CUSTOM_CURRICULUM_STORAGE_KEY,
  applyLocalMigrationPreflightReceiptToReadiness,
  fingerprintLegacyCurriculumSource,
  readCurrentLegacyCurriculumSnapshot,
  runLocalLegacyCurriculumMigrationPreflight,
  validateLocalMigrationPreflightReceipt,
} from '../domain/curriculum/persistence/migrationLocalPreflight';
import type { CurriculumMigrationReadinessEvidence } from '../domain/curriculum/persistence/migrationReadiness';

const NOW = '2026-09-03T20:15:00.000Z';

const SOURCE: LegacyCurriculumSource = {
  tecnologia: {
    primaria: {
      traguardi: ['Osserva e descrive oggetti.'],
      obiettivi: ['Riconoscere materiali.'],
      conoscenze: ['Materiali di uso comune.'],
      classLabel: 'prima',
    },
    secondaria: {
      traguardi: ['Comprende sistemi tecnologici.'],
      obiettivi: ['Analizzare processi tecnici.'],
      conoscenze: ['Strutture e materiali.'],
      classRange: ['prima', 'seconda', 'terza'],
    },
  },
};

function storageWith(source: unknown): Pick<Storage, 'getItem'> {
  return {
    getItem: (key: string) => key === LEGACY_CUSTOM_CURRICULUM_STORAGE_KEY
      ? JSON.stringify(source)
      : null,
  };
}

const BASE_EVIDENCE: CurriculumMigrationReadinessEvidence = {
  persistenceMode: 'legacy-only',
  nationalStructuralElementCount: 868,
  canonicalNationalPdfSha256: null,
  humanVerifiedNationalElementCount: null,
  instituteSourceReconstructed: true,
  instituteSourceReviewBlockerCount: 5,
  instituteHumanSemanticReviewComplete: false,
  backupGateProven: true,
  rollbackGateProven: true,
  deterministicComparisonProven: true,
  productionDatasetMigrationRehearsalProven: false,
  humanValidationProven: false,
};

describe('R7C6C local curriculum migration preflight', () => {
  it('reads a valid custom local curriculum snapshot without mutating it', () => {
    const snapshot = readCurrentLegacyCurriculumSnapshot(storageWith(SOURCE));
    expect(snapshot.origin).toBe('LOCAL_CUSTOM_CURRICULUM');
    expect(snapshot.source).toEqual(SOURCE);
    expect(snapshot.source).not.toBe(SOURCE);
  });

  it('blocks malformed local curriculum JSON before rehearsal', async () => {
    const malformed = { getItem: () => '{not-json' } as Pick<Storage, 'getItem'>;
    const result = await runLocalLegacyCurriculumMigrationPreflight(malformed, NOW);
    expect(result).toEqual({
      state: 'BLOCKED',
      reason: 'R7C6C_LOCAL_CURRICULUM_JSON_INVALID',
    });
  });

  it('rehearses the exact local snapshot in memory and emits a bound receipt', async () => {
    const result = await runLocalLegacyCurriculumMigrationPreflight(storageWith(SOURCE), NOW);
    expect(result.state).toBe('PASS');
    if (result.state !== 'PASS') return;

    expect(result.receipt).toMatchObject({
      schemaVersion: 'arena-r7c6c-local-migration-preflight-v1',
      sourceOrigin: 'LOCAL_CUSTOM_CURRICULUM',
      persistenceModeAtRun: 'legacy-only',
      rehearsalState: 'PASS',
      comparisonState: 'MATCH',
      backupGateProven: true,
      rollbackGateProven: true,
      deterministicComparisonProven: true,
      productionDatasetMigrationRehearsalProven: true,
      migrationOwnedRecordCountAfterRollback: 0,
      liveLegacyDatasetMutated: false,
      productiveIndexedDbOpened: false,
      persistenceModeMutationAuthorized: false,
    });
    expect(result.receipt.sourceSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(result.receipt.comparisonExpectedChecksum)
      .toBe(result.receipt.comparisonActualChecksum);
  });

  it('rejects a receipt as stale when the current local snapshot changes', async () => {
    const result = await runLocalLegacyCurriculumMigrationPreflight(storageWith(SOURCE), NOW);
    expect(result.state).toBe('PASS');
    if (result.state !== 'PASS') return;

    const changed: LegacyCurriculumSource = {
      ...SOURCE,
      tecnologia: {
        ...SOURCE.tecnologia,
        primaria: {
          ...SOURCE.tecnologia.primaria,
          obiettivi: ['Obiettivo modificato dopo il preflight.'],
        },
      },
    };
    const changedFingerprint = await fingerprintLegacyCurriculumSource(changed);
    expect(validateLocalMigrationPreflightReceipt(result.receipt, changedFingerprint.sha256))
      .toBe(false);
  });

  it('lets a current valid receipt satisfy only the live-dataset rehearsal evidence', async () => {
    const result = await runLocalLegacyCurriculumMigrationPreflight(storageWith(SOURCE), NOW);
    expect(result.state).toBe('PASS');
    if (result.state !== 'PASS') return;

    const fingerprint = await fingerprintLegacyCurriculumSource(SOURCE);
    const next = applyLocalMigrationPreflightReceiptToReadiness(
      BASE_EVIDENCE,
      result.receipt,
      fingerprint.sha256,
    );

    expect(next.productionDatasetMigrationRehearsalProven).toBe(true);
    expect(next.canonicalNationalPdfSha256).toBeNull();
    expect(next.humanVerifiedNationalElementCount).toBeNull();
    expect(next.instituteHumanSemanticReviewComplete).toBe(false);
    expect(next.humanValidationProven).toBe(false);
  });
});
