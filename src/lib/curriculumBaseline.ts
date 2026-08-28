import { curriculumKB } from '../data/curriculumKB';
import type { CurriculumMap } from '../features/session/types/appViewContracts';
import {
  LEGACY_CURRICULUM_KB_PROVENANCE,
  assessCurriculumAuthority,
  type CurriculumAuthorityAssessment,
  type CurriculumBaselineProvenance,
} from '../domain/curriculum/foundationAuthority';

let cachedBaseline: CurriculumMap | null = null;
let cachedBaselineProvenance: CurriculumBaselineProvenance = LEGACY_CURRICULUM_KB_PROVENANCE;

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Restituisce i dati curricolari correnti per compatibilita' con il runtime.
 * La presenza dei dati NON implica che siano una fonte verificata o un
 * curricolo d'istituto adottato: usare getCurriculumBaselineAuthority() per
 * qualsiasi proiezione istituzionale o comunicazione di autorevolezza.
 */
export function getCurriculumBaseline(): CurriculumMap {
  if (cachedBaseline) return deepClone(cachedBaseline);
  cachedBaseline = deepClone(curriculumKB);
  cachedBaselineProvenance = deepClone(LEGACY_CURRICULUM_KB_PROVENANCE);
  return deepClone(cachedBaseline);
}

export function getCurriculumBaselineProvenance(): CurriculumBaselineProvenance {
  return deepClone(cachedBaselineProvenance);
}

export function getCurriculumBaselineAuthority(): CurriculumAuthorityAssessment {
  return assessCurriculumAuthority(cachedBaselineProvenance);
}

/**
 * Sostituisce i dati senza attribuire automaticamente autorevolezza.
 * La provenienza deve essere fornita esplicitamente dal chiamante; in sua
 * assenza la baseline resta classificata come dimostrativa/non verificata.
 */
export function setCurriculumBaseline(
  baseline: CurriculumMap,
  provenance: CurriculumBaselineProvenance = LEGACY_CURRICULUM_KB_PROVENANCE,
): void {
  cachedBaseline = deepClone(baseline);
  cachedBaselineProvenance = deepClone(provenance);
}

export function resetCurriculumBaseline(): void {
  cachedBaseline = null;
  cachedBaselineProvenance = deepClone(LEGACY_CURRICULUM_KB_PROVENANCE);
}
