import { curriculumKB } from '../data/curriculumKB';
import type { CurriculumMap } from '../features/session/types/appViewContracts';

let cachedBaseline: CurriculumMap | null = null;

export function getCurriculumBaseline(): CurriculumMap {
  if (cachedBaseline) return cachedBaseline;
  cachedBaseline = curriculumKB;
  return cachedBaseline;
}

export function setCurriculumBaseline(baseline: CurriculumMap): void {
  cachedBaseline = baseline;
}

export function resetCurriculumBaseline(): void {
  cachedBaseline = null;
}