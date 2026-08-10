import { describe, expect, it } from 'vitest';
import { createEntityReference } from '../domain/curriculum/identity';
import type { EntityId } from '../domain/curriculum/identity/types';
import { createDesignCurriculumSelection } from '../domain/design/constructors';
import {
  createCanonicalPlanningWorkspace,
  updatePlanningContent,
  updatePlanningContext,
  updatePlanningReferences,
} from '../domain/planning';

const selection = createDesignCurriculumSelection({
  designRef: createEntityReference('design-1' as EntityId, 'teaching-design'),
  sourceArea: 'A02',
  sourceEntityRef: createEntityReference('node-1' as EntityId, 'curriculum-node'),
  sourceVersionRef: createEntityReference('version-1' as EntityId, 'curriculum-version'),
  curriculumNodeRef: createEntityReference('node-1' as EntityId, 'curriculum-node'),
  curriculumVersionRef: createEntityReference('version-1' as EntityId, 'curriculum-version'),
  currentTextSnapshot: 'Obiettivo corrente',
  selectedTextSnapshot: 'Obiettivo selezionato',
  qualification: 'current-curriculum',
}, '2026-08-10T10:00:00.000Z');

const workspaceInput = {
  id: 'planning-stable-1' as never,
  draft: { title: 'Progettazione tecnologia', discipline: 'tecnologia', schoolOrder: 'secondaria' as const, classLabel: '2A', objectives: ['Obiettivo'] },
  curriculumSelections: [selection],
  now: '2026-08-10T10:00:00.000Z',
};

describe('P2.1-C canonical Planning workspace', () => {
  it('creates one Planning identity with curriculum references inside the object', () => {
    const planning = createCanonicalPlanningWorkspace(workspaceInput);
    expect(planning.id).toBe('planning-stable-1');
    expect(planning.content.title).toBe('Progettazione tecnologia');
    expect(planning.curriculumReferences[0]).toMatchObject({ nodeId: 'node-1', snapshot: 'Obiettivo selezionato' });
  });

  it('keeps planning identity and reference snapshot while editing content', () => {
    const planning = createCanonicalPlanningWorkspace(workspaceInput);
    const edited = updatePlanningContent(planning, { notes: 'Nota docente' }, '2026-08-10T11:00:00.000Z');
    expect(edited.id).toBe(planning.id);
    expect(edited.content.notes).toBe('Nota docente');
    expect(edited.curriculumReferences).toEqual(planning.curriculumReferences);
  });

  it('keeps the selected curriculum version while editing context', () => {
    const planning = createCanonicalPlanningWorkspace(workspaceInput);
    const edited = updatePlanningContext(planning, { classLabel: '3A' }, '2026-08-10T11:00:00.000Z');
    expect(edited.context.classLabel).toBe('3A');
    expect(edited.curriculumReferences[0].curriculumVersionRef.id).toBe('version-1');
  });

  it('updates references through one governed path without mutating the original', () => {
    const planning = createCanonicalPlanningWorkspace(workspaceInput);
    const next = updatePlanningReferences(planning, [], '2026-08-10T11:00:00.000Z');
    expect(next.curriculumReferences).toEqual([]);
    expect(planning.curriculumReferences).toHaveLength(1);
  });

  it('does not let presentation step changes alter semantic Planning data', () => {
    const planning = createCanonicalPlanningWorkspace(workspaceInput);
    const resumed = createCanonicalPlanningWorkspace({ ...workspaceInput, id: planning.id, now: '2026-08-10T12:00:00.000Z' });
    expect(resumed.id).toBe(planning.id);
    expect(resumed.curriculumReferences).toEqual(planning.curriculumReferences);
  });
});
