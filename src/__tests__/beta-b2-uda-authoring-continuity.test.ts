import { describe, expect, it } from 'vitest';
import { createDidacticPlanning, materializeUdaFromPlanning } from '../domain/planning';
import type { EntityId } from '../domain/curriculum/identity/types';

describe('Beta B2 UDA authoring continuity', () => {
  it('materializes one stable UDA identity from a ready Planning', () => {
    const planning = createDidacticPlanning({
      id: 'b2-planning-1' as EntityId,
      context: { schoolOrder: 'secondaria', discipline: 'tecnologia', classLabel: '2A' },
      content: {
        title: 'Energia e territorio',
        period: 'Primo quadrimestre',
        hours: 12,
        objectives: ['Comprendere i consumi'],
        activities: ['Mappa dei consumi'],
      },
      status: 'ready',
    });

    const first = materializeUdaFromPlanning(planning);
    expect(first.status).toBe('success');
    if (first.status !== 'success') return;

    const reopened = materializeUdaFromPlanning(planning, [first.uda]);
    expect(reopened).toEqual({ status: 'already-materialized', uda: first.uda });
    expect(first.uda.sourcePlanningRef?.id).toBe(planning.id);
  });

  it('keeps distinct Planning sources distinct and does not mutate the Planning', () => {
    const planning = createDidacticPlanning({
      id: 'b2-planning-2' as EntityId,
      context: { schoolOrder: 'secondaria', discipline: 'tecnologia' },
      content: { title: 'Seconda UDA', period: 'Secondo quadrimestre', hours: 8, objectives: ['Obiettivo'], activities: ['Attività'] },
      status: 'ready',
    });
    const snapshot = JSON.stringify(planning);
    const other = createDidacticPlanning({
      id: 'b2-planning-3' as EntityId,
      context: { schoolOrder: 'secondaria', discipline: 'tecnologia' },
      content: { title: 'Terza UDA', period: 'Primo quadrimestre', hours: 6, objectives: ['Obiettivo'], activities: ['Attività'] },
      status: 'ready',
    });
    const result = materializeUdaFromPlanning(planning);
    const otherResult = materializeUdaFromPlanning(other);
    expect(result.status).toBe('success');
    expect(otherResult.status).toBe('success');
    expect(result.status === 'success' ? result.uda.id : '').toBe('uda-b2-planning-2');
    expect(otherResult.status === 'success' ? otherResult.uda.id : '').toBe('uda-b2-planning-3');
    expect(JSON.stringify(planning)).toBe(snapshot);
  });

  it('rejects a deterministic UDA identity already owned by another Planning', () => {
    const planning = createDidacticPlanning({
      id: 'b2-collision' as EntityId,
      context: { schoolOrder: 'secondaria', discipline: 'tecnologia' },
      content: { title: 'Collisione', period: 'Primo quadrimestre', hours: 6, objectives: ['Obiettivo'], activities: ['Attività'] },
      status: 'ready',
    });
    const result = materializeUdaFromPlanning(planning, [{
      id: 'uda-b2-collision', title: 'Altro Planning', discipline: 'tecnologia', order: 'secondaria', period: 'Primo quadrimestre', hours: 1, status: 'bozza', traguardi: [], obiettivi: [], evidenze: [], realTask: '', notes: '', createdAt: '2026-08-16', sourcePlanningRef: { id: 'different-planning' as EntityId, entityType: 'teaching-design' },
    }]);
    expect(result).toEqual({ status: 'validation-error', issues: [{ code: 'UDA_ID_COLLISION', message: 'The deterministic UDA identity uda-b2-collision is already owned by another Planning.' }] });
  });
});
