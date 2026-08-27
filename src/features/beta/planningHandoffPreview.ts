import type { A07InstitutionalDocumentRead } from '../../domain/institution';
import type { RevisionArchive } from '../../domain/revision';
import {
  createCmlLocalHandoffV2FromArenaRuntime,
  validateCmlLocalHandoffV2,
  type CmlLocalHandoffV2,
} from '../../domain/transfer';
import { institutionalLabelToSchoolYear, parseSchoolYear } from '../../lib/academicYear';
import type { CurriculumMap } from '../session/types/appViewContracts';
import type { SchoolOrder } from '../../types/curriculum';

const INFANZIA_COHORT_REF = 'fascia-unica-3-5-anni';

export interface PlanningHandoffClassContext {
  classLevel: number;
  sectionRef?: string;
  cohortRef?: string;
}

export interface PlanningHandoffPreviewInput {
  institutionalProfile: A07InstitutionalDocumentRead;
  configuredSchoolOrders: readonly SchoolOrder[];
  schoolYear: string;
  schoolOrder: SchoolOrder;
  classLevel: number;
  sectionRef?: string;
  cohortRef?: string;
  disciplineRef: string;
  curriculumMap: CurriculumMap;
  revisionArchive: RevisionArchive;
  emittedAt?: string;
}

export type PlanningHandoffPreviewModel =
  | {
      status: 'blocked';
      reason: string;
    }
  | {
      status: 'ready';
      handoff: CmlLocalHandoffV2;
      validationErrors: readonly string[];
      valid: boolean;
      mandatoryRequirements: number;
      totalRequirements: number;
    };

export function resolvePlanningSchoolYear(
  institutionalAcademicYearLabel: string | undefined,
  legacySchoolYear: string,
): string {
  const institutionalSchoolYear = institutionalLabelToSchoolYear(institutionalAcademicYearLabel ?? '');
  if (parseSchoolYear(institutionalSchoolYear)) return institutionalSchoolYear;
  if (parseSchoolYear(legacySchoolYear)) return legacySchoolYear;
  return institutionalSchoolYear || legacySchoolYear;
}

export function resolvePlanningHandoffClassContext(
  schoolOrder: SchoolOrder,
  targetClass: string,
  targetSection: string,
): PlanningHandoffClassContext {
  const sectionRef = targetSection.trim() || undefined;

  if (schoolOrder === 'infanzia') {
    return {
      classLevel: 1,
      sectionRef,
      cohortRef: INFANZIA_COHORT_REF,
    };
  }

  return {
    classLevel: Number.parseInt(targetClass, 10),
    sectionRef,
  };
}

export function buildPlanningHandoffPreview(
  input: PlanningHandoffPreviewInput,
): PlanningHandoffPreviewModel {
  if (!input.institutionalProfile.configured) {
    return {
      status: 'blocked',
      reason: 'Configura prima l’istituto: Arena non può presentare un passaggio istituzionale usando il contesto locale neutro.',
    };
  }

  if (!input.institutionalProfile.organizationId?.trim()) {
    return {
      status: 'blocked',
      reason: 'Il contesto istituzionale non espone un identificativo organizzativo utilizzabile.',
    };
  }

  if (!input.configuredSchoolOrders.includes(input.schoolOrder)) {
    return {
      status: 'blocked',
      reason: `L’ordine ${input.schoolOrder} non è configurato per l’istituto attivo. Seleziona un ordine effettivamente offerto prima di preparare l’anteprima.`,
    };
  }

  if (!parseSchoolYear(input.schoolYear)) {
    return {
      status: 'blocked',
      reason: 'L’anno scolastico istituzionale non è disponibile in un formato utilizzabile per il passaggio alla progettazione.',
    };
  }

  if (!Number.isInteger(input.classLevel) || input.classLevel < 1) {
    return {
      status: 'blocked',
      reason: 'Seleziona una classe valida prima di preparare l’anteprima.',
    };
  }

  if (!input.sectionRef?.trim() && !input.cohortRef?.trim()) {
    return {
      status: 'blocked',
      reason: 'Seleziona una sezione o una coorte valida prima di preparare l’anteprima.',
    };
  }

  if (!input.curriculumMap[input.disciplineRef]?.[input.schoolOrder]) {
    return {
      status: 'blocked',
      reason: 'Il curricolo corrente non contiene il livello richiesto per disciplina e ordine selezionati.',
    };
  }

  try {
    const handoff = createCmlLocalHandoffV2FromArenaRuntime({
      institutionId: input.institutionalProfile.organizationId,
      schoolYearRef: input.schoolYear,
      schoolOrder: input.schoolOrder,
      classLevel: input.classLevel,
      ...(input.sectionRef?.trim() ? { sectionRef: input.sectionRef.trim() } : {}),
      ...(input.cohortRef?.trim() ? { cohortRef: input.cohortRef.trim() } : {}),
      disciplineRef: input.disciplineRef,
      curriculumMap: input.curriculumMap,
      revisionArchive: input.revisionArchive,
      sourceVersion: 'arena-beta-b3',
      emittedAt: input.emittedAt,
    });

    const validation = validateCmlLocalHandoffV2(handoff);
    const requirements = handoff.curricularContext.requirements;

    return {
      status: 'ready',
      handoff,
      valid: validation.valid,
      validationErrors: validation.errors,
      totalRequirements: requirements.length,
      mandatoryRequirements: requirements.filter(requirement => requirement.coverageRequired).length,
    };
  } catch (error) {
    return {
      status: 'blocked',
      reason: error instanceof Error
        ? error.message
        : 'Arena non riesce a costruire una baseline di progettazione verificabile.',
    };
  }
}
