import { curriculumKB } from '../data/curriculumKB';
import type { CurriculumMap } from '../features/session/types/appViewContracts';
import {
  LEGACY_CURRICULUM_KB_PROVENANCE,
  assessCurriculumAuthority,
  type CurriculumAuthorityAssessment,
  type CurriculumBaselineProvenance,
} from '../domain/curriculum/foundationAuthority';
import { INSTITUTE_CURRICULUM_CURRENT_SOURCE } from '../domain/curriculum/institute/currentSource';

let cachedBaseline: CurriculumMap | null = null;
let cachedBaselineProvenance: CurriculumBaselineProvenance = LEGACY_CURRICULUM_KB_PROVENANCE;

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Identità della baseline curricolare canonica corrente.
 * Il master vive nel fascicolo Drive e non viene ricostruito dal dataset legacy.
 */
export function getCanonicalCurriculumMasterIdentity() {
  return deepClone({
    title: INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceFile,
    driveFileId: INSTITUTE_CURRICULUM_CURRENT_SOURCE.driveFileId,
    version: INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceVersion,
    materializationState: INSTITUTE_CURRICULUM_CURRENT_SOURCE.materializationState,
    humanProfessionalValidation: INSTITUTE_CURRICULUM_CURRENT_SOURCE.humanProfessionalValidation,
    curriculumInForce: INSTITUTE_CURRICULUM_CURRENT_SOURCE.curriculumInForce,
  });
}

/**
 * Restituisce la copia locale legacy usata dai componenti non ancora migrati.
 *
 * IMPORTANTE: questa funzione conserva il nome storico per compatibilità del
 * runtime, ma il valore restituito NON è la baseline curricolare canonica da
 * REG-CURR-00 1.9. È una proiezione locale non verificata, utile soltanto per
 * compatibilità, ispezione e migrazione. Il master corrente è ottenibile con
 * getCanonicalCurriculumMasterIdentity().
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
 * Sostituisce soltanto la copia locale compatibile con il vecchio CurriculumMap.
 * Non aggiorna CAN-CURR-MASTER-00 e non attribuisce autorevolezza istituzionale.
 */
export function setCurriculumBaseline(
  baseline: CurriculumMap,
  provenance: CurriculumBaselineProvenance = LEGACY_CURRICULUM_KB_PROVENANCE,
): void {
  cachedBaseline = deepClone(baseline);
  cachedBaselineProvenance = deepClone(provenance);
}

/**
 * Ripristina soltanto la copia locale legacy; non modifica il master canonico.
 */
export function resetCurriculumBaseline(): void {
  cachedBaseline = null;
  cachedBaselineProvenance = deepClone(LEGACY_CURRICULUM_KB_PROVENANCE);
}
