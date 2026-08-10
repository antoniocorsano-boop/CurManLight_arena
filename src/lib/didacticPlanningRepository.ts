import type { DidacticPlanning, DidacticPlanningRepository } from '../domain/planning';
import type { EntityId } from '../domain/curriculum/identity/types';

export const CANONICAL_PLANNING_STORAGE_KEY = 'curman_canonical_plannings_v1';

const clone = (planning: DidacticPlanning): DidacticPlanning => JSON.parse(JSON.stringify(planning)) as DidacticPlanning;

export function createLocalDidacticPlanningRepository(storage: Storage, key = CANONICAL_PLANNING_STORAGE_KEY): DidacticPlanningRepository {
  const read = (): DidacticPlanning[] => {
    try {
      const raw = storage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(value => clone(value as DidacticPlanning)) : [];
    } catch {
      return [];
    }
  };
  const write = (plannings: readonly DidacticPlanning[]) => storage.setItem(key, JSON.stringify(plannings));

  return {
    save(planning) {
      const current = read();
      const next = current.some(item => String(item.id) === String(planning.id))
        ? current.map(item => String(item.id) === String(planning.id) ? clone(planning) : item)
        : [...current, clone(planning)];
      write(next);
    },
    get(id: EntityId) {
      const found = read().find(item => String(item.id) === String(id));
      return found ? clone(found) : undefined;
    },
    list() {
      return read();
    },
  };
}
