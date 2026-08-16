import type { DidacticPlanning, DidacticPlanningRepository } from '../domain/planning';
import type { EntityId } from '../domain/curriculum/identity/types';

export const CANONICAL_PLANNING_STORAGE_KEY = 'curman_canonical_plannings_v1';

export type PlanningSaveResult =
  | { ok: true }
  | { ok: false; message: string };

const clone = (planning: DidacticPlanning): DidacticPlanning => JSON.parse(JSON.stringify(planning)) as DidacticPlanning;

export function createLocalDidacticPlanningRepository(storage: Storage, key = CANONICAL_PLANNING_STORAGE_KEY): DidacticPlanningRepository {
  const read = (): DidacticPlanning[] | undefined => {
    try {
      const raw = storage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(value => clone(value as DidacticPlanning)) : undefined;
    } catch {
      return undefined;
    }
  };
  const write = (plannings: readonly DidacticPlanning[]) => storage.setItem(key, JSON.stringify(plannings));

  return {
    save(planning) {
      const current = read();
      if (!current) throw new Error('The persisted Planning archive is invalid.');
      const next = current.some(item => String(item.id) === String(planning.id))
        ? current.map(item => String(item.id) === String(planning.id) ? clone(planning) : item)
        : [...current, clone(planning)];
      write(next);
    },
    get(id: EntityId) {
      const current = read();
      if (!current) throw new Error('The persisted Planning archive is invalid.');
      const found = current.find(item => String(item.id) === String(id));
      return found ? clone(found) : undefined;
    },
    list() {
      const current = read();
      if (!current) throw new Error('The persisted Planning archive is invalid.');
      return current;
    },
  };
}

export function saveDidacticPlanningSafely(
  repository: DidacticPlanningRepository,
  planning: DidacticPlanning,
): PlanningSaveResult {
  try {
    repository.save(planning);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Unable to save the Planning.',
    };
  }
}
