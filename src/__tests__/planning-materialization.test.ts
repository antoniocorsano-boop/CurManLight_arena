import { describe, expect, it } from 'vitest';
import { createEntityReference, type EntityId } from '../domain/curriculum/identity';
import { createDesignCurriculumSelection } from '../domain/design/constructors';
import {
  createCanonicalPlanningWorkspace,
  materializeUdaFromPlanning,
  updatePlanningContent,
} from '../domain/planning';

const selection = createDesignCurriculumSelection({
  designRef: createEntityReference('design-d' as EntityId, 'teaching-design'),
  sourceArea: 'A02',
  sourceEntityRef: createEntityReference('node-d' as EntityId, 'curriculum-node'),
  sourceVersionRef: createEntityReference('version-d' as EntityId, 'curriculum-version'),
  curriculumNodeRef: createEntityReference('node-d' as EntityId, 'curriculum-node'),
  curriculumVersionRef: createEntityReference('version-d' as EntityId, 'curriculum-version'),
  currentTextSnapshot: 'Energia e territorio',
  selectedTextSnapshot: 'Energia e territorio selezionata',
  qualification: 'current-curriculum',
}, '2026-08-10T10:00:00.000Z');

const planning = createCanonicalPlanningWorkspace({
  id: 'planning-d-1' as EntityId,
  draft: {
    title: 'Energia e territorio', discipline: 'tecnologia', schoolOrder: 'secondaria', classLabel: '2A',
    period: 'Primo quadrimestre', hours: 12, objectives: ['Comprendere i consumi'],
    activities: ['Realizzare una mappa dei consumi'], assessment: ['Rubrica'], materials: ['Scheda'], notes: 'Nota docente',
  },
  curriculumSelections: [selection], status: 'ready', now: '2026-08-10T10:00:00.000Z',
});

describe('P2.1-D explicit Planning to UDA materialization', () => {
  it('creates a distinct deterministic UDA and preserves planning semantics', () => {
    const result = materializeUdaFromPlanning(planning);
    expect(result.status).toBe('success');
    if (result.status !== 'success') return;
    expect(result.uda.id).not.toBe(planning.id);
    expect(result.uda.id).toBe('uda-planning-d-1');
    expect(result.uda.sourcePlanningRef).toMatchObject({ id: planning.id, entityType: 'teaching-design' });
    expect(result.uda.curriculumReferences).toEqual(planning.curriculumReferences);
    expect(result.uda.activities).toEqual(planning.content.activities);
    expect(result.uda.assessment).toEqual(planning.content.assessment);
    expect(result.uda.materials).toEqual(planning.content.materials);
    expect(result.uda.realTask).toBe(planning.content.activities[0]);
    expect(result.uda.createdAt).toBe(planning.updatedAt);
    expect(planning.derivedArtifactRef).toBeUndefined();
  });

  it('is deterministic for the same planning snapshot and does not mutate Planning', () => {
    const before = JSON.parse(JSON.stringify(planning));
    expect(materializeUdaFromPlanning(planning)).toEqual(materializeUdaFromPlanning(planning));
    expect(planning).toEqual(before);
  });

  it('does not materialize a Planning that is not ready', () => {
    expect(materializeUdaFromPlanning({ ...planning, status: 'in_progress' })).toMatchObject({ status: 'not-ready' });
  });

  it('rejects invalid required Planning content', () => {
    expect(materializeUdaFromPlanning(updatePlanningContent(planning, { title: ' ', hours: 0, objectives: [] })).status)
      .toBe('validation-error');
  });

  it('returns the existing artifact instead of silently duplicating it', () => {
    const created = materializeUdaFromPlanning(planning);
    if (created.status !== 'success') throw new Error('fixture should be materializable');
    expect(materializeUdaFromPlanning(planning, [created.uda])).toMatchObject({ status: 'already-materialized', uda: created.uda });
  });

  it('does not update an existing UDA when Planning changes later', () => {
    const created = materializeUdaFromPlanning(planning);
    if (created.status !== 'success') throw new Error('fixture should be materializable');
    const result = materializeUdaFromPlanning(updatePlanningContent(planning, { notes: 'Nota aggiornata' }), [created.uda]);
    expect(result).toMatchObject({ status: 'already-materialized', uda: created.uda });
    expect(created.uda.notes).toBe('Nota docente');
  });
});
