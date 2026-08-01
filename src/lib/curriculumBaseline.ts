import { curriculumKB } from '../data/curriculumKB';
import type { CurriculumMap } from '../features/session/types/appViewContracts';

let cachedBaseline: CurriculumMap | null = null;

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function getCurriculumBaseline(): CurriculumMap {
  if (cachedBaseline) return deepClone(cachedBaseline);
  cachedBaseline = deepClone(curriculumKB);
  return deepClone(cachedBaseline);
}

export function setCurriculumBaseline(baseline: CurriculumMap): void {
  cachedBaseline = deepClone(baseline);
}

export function resetCurriculumBaseline(): void {
  cachedBaseline = null;
}
