import type { A07InstitutionalDocumentRead } from '../../domain/institution';
import type { RevisionArchive } from '../../domain/revision';
import {
  createCmlLocalHandoffV2FromArenaRuntime,
  validateCmlLocalHandoffV2,
  type CmlLocalHandoffV2,
} from '../../domain/transfer';
import type { CurriculumMap } from '../session/types/appViewContracts';
import type { SchoolOrder } from '../../types/curriculum';

export interface PlanningHandoffPreviewInput {
  institutionalProfile: A07InstitutionalDocumentRead;
  schoolYear: string;
  schoolOrder: SchoolOrder;
  classLevel: number;
  sectionRef: string;
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

  if (!Number.isInteger(input.classLevel) || input.classLevel < 1) {
    return {
      status: 'blocked',
      reason: 'Seleziona una classe valida prima di preparare l’anteprima.',
    };
  }

  if (!input.sectionRef.trim()) {
    return {
      status: 'blocked',
      reason: 'Seleziona una sezione prima di preparare l’anteprima.',
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
      sectionRef: input.sectionRef.trim(),
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
