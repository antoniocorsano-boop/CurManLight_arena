import { describe, expect, it } from 'vitest';
import { MemoryCurriculumPersistenceBackend } from '../domain/curriculum/persistence/backend';
import { CURRICULUM_PERSISTENCE_MODE } from '../domain/curriculum/persistence/compatibilityMode';
import type { LegacyCurriculumSource } from '../domain/curriculum/persistence/legacyAdapters';
import { migrateLegacyCurriculum } from '../domain/curriculum/persistence/migration';
import {
  R7C6B_MIGRATION_SAFETY_CAPABILITY,
  compareLegacySourceToMigratedDomain,
  rehearseLegacyCurriculumMigrationSafety,
} from '../domain/curriculum/persistence/migrationSafetyRehearsal';

const NOW = '2026-09-03T12:00:00.000Z';

const REPRESENTATIVE_SOURCE: LegacyCurriculumSource = {
  tecnologia: {
    primaria: {
      classLabel: 'prima',
      traguardi: ['Osserva oggetti e processi tecnici.'],
      obiettivi: ['Riconoscere materiali e funzioni.'],
      conoscenze: ['Materiali di uso comune.'],
      nucleiFondanti: ['Vedere e osservare.'],
    },
    secondaria: {
      classRange: ['prima', 'seconda', 'terza'],
      traguardi: ['Comprende sistemi tecnologici.'],
      obiettivi: ['Analizzare un semplice sistema tecnico.'],
      conoscenze: ['Strutture e materiali.'],
      abilita: ['Rappresentare dati tecnici.'],
      competenze: ['Valutare scelte tecniche motivate.'],
    },
  },
  italiano: {
    infanzia: {
      competenze: ['Usa il linguaggio per comunicare.'],
      nucleiFondanti: ['Comunicazione orale.'],
    },
  },
};

describe('R7C6B migration safety rehearsal', () => {
  it('proves backup, deterministic comparison and rollback inside an isolated backend', async () => {
    const result = await rehearseLegacyCurriculumMigrationSafety(REPRESENTATIVE_SOURCE, NOW);

    expect(result).toMatchObject({
      state: 'PASS',
      migrationOutcome: 'completed',
      rollbackOutcome: 'rolled-back',
      backupGateProven: true,
      rollbackGateProven: true,
      deterministicComparisonProven: true,
      sourceUnchanged: true,
      productionDatasetRehearsalProven: false,
      persistenceModeMutationAuthorized: false,
    });
    expect(result.comparison.state).toBe('MATCH');
    expect(result.migrationOwnedRecordCountBeforeRollback).toBeGreaterThan(0);
    expect(result.migrationOwnedRecordCountAfterRollback).toBe(0);
    expect(result.backupChecksum).toBe(result.sourceChecksumBefore);
  });

  it('detects a changed migrated node instead of treating counts as sufficient', async () => {
    const backend = new MemoryCurriculumPersistenceBackend();
    await migrateLegacyCurriculum(backend, REPRESENTATIVE_SOURCE, NOW);

    const node = (await backend.listNodes())[0];
    expect(node).toBeDefined();
    if (!node) throw new Error('Representative migration created no node');
    await backend.putNode({ ...node, title: `${node.title} ALTERED` });

    const comparison = await compareLegacySourceToMigratedDomain(
      REPRESENTATIVE_SOURCE,
      backend,
      NOW,
    );

    expect(comparison.state).toBe('MISMATCH');
    expect(comparison.diffs.find((diff) => diff.collection === 'nodes')?.changedIds)
      .toContain(node.id);
  });

  it('is deterministic across object-key insertion order for the same source facts', async () => {
    const reordered: LegacyCurriculumSource = {
      italiano: REPRESENTATIVE_SOURCE.italiano,
      tecnologia: REPRESENTATIVE_SOURCE.tecnologia,
    };

    const first = await rehearseLegacyCurriculumMigrationSafety(REPRESENTATIVE_SOURCE, NOW);
    const second = await rehearseLegacyCurriculumMigrationSafety(reordered, NOW);

    expect(first.state).toBe('PASS');
    expect(second.state).toBe('PASS');
    expect(first.comparison.expectedChecksum).toBe(second.comparison.expectedChecksum);
    expect(first.comparison.actualChecksum).toBe(second.comparison.actualChecksum);
  });

  it('does not claim that isolated capability proof rehearsed the live production dataset', () => {
    expect(R7C6B_MIGRATION_SAFETY_CAPABILITY).toMatchObject({
      proofScope: 'ISOLATED_MEMORY_REHEARSAL',
      backupGateProven: true,
      rollbackGateProven: true,
      deterministicComparisonProven: true,
      productionDatasetRehearsalProven: false,
      persistenceModeMutationAuthorized: false,
    });
    expect(CURRICULUM_PERSISTENCE_MODE).toBe('legacy-only');
  });

  it('fails closed when there is no adaptable curriculum data', async () => {
    const result = await rehearseLegacyCurriculumMigrationSafety({}, NOW);
    expect(result.state).toBe('FAIL');
    expect(result.deterministicComparisonProven).toBe(false);
    expect(result.productionDatasetRehearsalProven).toBe(false);
  });
});
