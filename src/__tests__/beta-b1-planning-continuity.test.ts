import { describe, expect, it, vi } from 'vitest';
import { createDidacticPlanning, type DidacticPlanning } from '../domain/planning';
import { createLocalDidacticPlanningRepository, saveDidacticPlanningSafely } from '../lib/didacticPlanningRepository';
import type { EntityId } from '../domain/curriculum/identity/types';

function planning(): DidacticPlanning {
  return createDidacticPlanning({
    id: 'b1-planning-1' as EntityId,
    context: { schoolOrder: 'secondaria', discipline: 'tecnologia', classLabel: '2A' },
    content: {
      title: 'Energia e territorio',
      period: 'Primo quadrimestre',
      hours: 12,
      objectives: ['Comprendere i consumi', 'Argomentare le scelte'],
      activities: ['Realizzare una mappa dei consumi'],
      assessment: [],
      materials: [],
    },
    status: 'in_progress',
  });
}

describe('Beta B1 planning continuity', () => {
  it('saves a Planning through the canonical repository and can reopen it with the same identity and objectives', () => {
    const repository = createLocalDidacticPlanningRepository(localStorage);
    const source = planning();

    expect(saveDidacticPlanningSafely(repository, source)).toEqual({ ok: true });
    expect(repository.get(source.id)).toEqual(source);
  });

  it('returns a controlled failure when the canonical Planning save fails', () => {
    const repository = { save: vi.fn(() => { throw new Error('storage unavailable'); }) } as never;

    const result = saveDidacticPlanningSafely(repository, planning());

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toContain('storage unavailable');
  });

  it('does not overwrite an invalid persisted archive when a save is attempted', () => {
    const raw = '{"broken":';
    localStorage.setItem('curman_canonical_plannings_v1', raw);
    const repository = createLocalDidacticPlanningRepository(localStorage);

    const result = saveDidacticPlanningSafely(repository, planning());

    expect(result.ok).toBe(false);
    expect(localStorage.getItem('curman_canonical_plannings_v1')).toBe(raw);
  });

  it('does not overwrite a non-array persisted archive when a save is attempted', () => {
    const raw = '{"unexpected":"shape"}';
    localStorage.setItem('curman_canonical_plannings_v1', raw);
    const repository = createLocalDidacticPlanningRepository(localStorage);

    const result = saveDidacticPlanningSafely(repository, planning());

    expect(result.ok).toBe(false);
    expect(localStorage.getItem('curman_canonical_plannings_v1')).toBe(raw);
  });
});
