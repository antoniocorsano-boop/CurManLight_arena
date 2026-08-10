import { beforeEach, describe, expect, it } from 'vitest';
import { createEntityReference, type EntityId } from '../domain/curriculum/identity';
import { createDidacticPlanning, resolveCanonicalPlanningSources, type DidacticPlanning, type PlanningCompatibilityResult } from '../domain/planning';
import { createLocalDidacticPlanningRepository } from '../lib/didacticPlanningRepository';

const makePlanning = (id: string, title: string): DidacticPlanning => createDidacticPlanning({
  id: id as EntityId,
  context: { schoolOrder: 'secondaria', discipline: 'tecnologia', classLabel: id },
  curriculumReferences: [{
    nodeId: 'node-1', curriculumVersionRef: createEntityReference('version-1' as EntityId, 'curriculum-version'), snapshot: 'Snapshot canonico',
    provenance: { sourceArea: 'A02', qualification: 'current-curriculum', sourceEntityRef: createEntityReference('node-1' as EntityId, 'curriculum-node') }, sourceRefs: [], evidenceRefs: [],
  }],
  content: { title, period: 'Primo quadrimestre', hours: 10, objectives: ['Obiettivo'], activities: ['Attività'], assessment: [], materials: [], notes: 'Nota' },
  status: 'in_progress', createdAt: '2026-08-10T10:00:00.000Z', updatedAt: '2026-08-10T10:00:00.000Z',
});

describe('P2.1-E canonical DidacticPlanning persistence', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips one Planning without losing identity or curriculum provenance', () => {
    const repository = createLocalDidacticPlanningRepository(localStorage);
    const planning = makePlanning('planning-1', 'Energia');

    repository.save(planning);

    expect(repository.get(planning.id)).toEqual(planning);
  });

  it('lists isolated canonical Planning records', () => {
    const repository = createLocalDidacticPlanningRepository(localStorage);
    repository.save(makePlanning('planning-1', 'Energia'));
    repository.save(makePlanning('planning-2', 'Materiali'));

    expect(repository.list().map(item => item.id)).toEqual(['planning-1', 'planning-2']);
  });

  it('keeps canonical records authoritative over compatibility results with the same identity', () => {
    const canonical = makePlanning('planning-1', 'Titolo canonico');
    const legacy = { planning: makePlanning('planning-1', 'Titolo legacy'), sourceKind: 'legacy-draft', mappedFields: [], unmappedFields: [], warnings: [] } satisfies PlanningCompatibilityResult;

    const repository = createLocalDidacticPlanningRepository(localStorage);
    repository.save(canonical);

    expect(resolveCanonicalPlanningSources([canonical], [legacy])).toEqual([canonical]);
  });

  it('deduplicates the current canonical copy and its repository copy', () => {
    const current = makePlanning('planning-1', 'Titolo corrente');
    const repositoryCopy = makePlanning('planning-1', 'Titolo repository');

    expect(resolveCanonicalPlanningSources([current, repositoryCopy], [])).toEqual([current]);
  });

  it('does not remove or rewrite an incompatible legacy source during canonical save', () => {
    const repository = createLocalDidacticPlanningRepository(localStorage);
    const planning = makePlanning('planning-1', 'Canonica');
    const legacyKey = 'legacy-planning-draft';
    localStorage.setItem(legacyKey, JSON.stringify({ title: 'Legacy non rappresentabile' }));

    repository.save(planning);

    expect(localStorage.getItem(legacyKey)).toContain('Legacy non rappresentabile');
  });
});
