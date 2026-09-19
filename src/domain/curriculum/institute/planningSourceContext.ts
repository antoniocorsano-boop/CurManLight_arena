import type { SchoolOrder } from '../../../types/curriculum';
import { resolveShownFrameworkForCurriculum } from '../../../lib/curriculumTransitionUi';
import { INSTITUTE_CURRICULUM_CURRENT_SOURCE } from './currentSource';
import {
  INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCES,
  INSTITUTE_CURRICULUM_SOURCE_REPERTORY,
  type CurriculumSourceRecord,
} from './sourceRegister';

export type PlanningFramework = 'IN2025' | 'IN2012';

export type PlanningSourceApplicabilityState =
  | 'RESOLVED_IN2025'
  | 'RESOLVED_IN2012'
  | 'UNRESOLVED_CONTEXT';

export interface ResolvePlanningSourceContextInput {
  schoolYear: string;
  order: SchoolOrder;
  targetClass: string;
}

export interface PlanningSourceContext {
  masterId: 'CAN-CURR-MASTER-00';
  masterVersion: string;
  masterLifecycleState: string;
  masterInstitutionalStatus: 'IN_FORCE' | 'WORKING_BASELINE_PENDING_APPROVAL';
  masterLabel: string;
  masterStatusLabel: string;
  sourceRepertoryId: string;
  sourceRepertoryVersion: string;
  academicYear: string;
  applicabilityState: PlanningSourceApplicabilityState;
  framework: PlanningFramework | null;
  applicableSource: CurriculumSourceRecord | null;
  applicabilityLabel: string;
  applicabilityDetail: string;
}

const SOURCE_CODE_BY_FRAMEWORK: Record<PlanningFramework, 'N4' | 'N5'> = {
  IN2025: 'N4',
  IN2012: 'N5',
};

export function normalizePlanningAcademicYear(value: string): string {
  const trimmed = value.trim();
  const match = /^(\d{4})[/-](\d{4})$/.exec(trimmed);
  return match ? `${match[1]}-${match[2]}` : trimmed;
}

function sourceForFramework(framework: PlanningFramework): CurriculumSourceRecord | null {
  const code = SOURCE_CODE_BY_FRAMEWORK[framework];
  return INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCES.find((source) => source.code === code) ?? null;
}

export function resolvePlanningSourceContext({
  schoolYear,
  order,
  targetClass,
}: ResolvePlanningSourceContextInput): PlanningSourceContext {
  const academicYear = normalizePlanningAcademicYear(schoolYear);
  const framework = resolveShownFrameworkForCurriculum({
    schoolYear: academicYear,
    order,
    targetClass,
  });

  const masterInForce = INSTITUTE_CURRICULUM_CURRENT_SOURCE.curriculumInForce;
  const masterInstitutionalStatus = masterInForce
    ? 'IN_FORCE'
    : 'WORKING_BASELINE_PENDING_APPROVAL';

  const base = {
    masterId: 'CAN-CURR-MASTER-00' as const,
    masterVersion: INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceVersion,
    masterLifecycleState: INSTITUTE_CURRICULUM_CURRENT_SOURCE.lifecycleState,
    masterInstitutionalStatus,
    masterLabel: `Baseline Arena · master ${INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceVersion}`,
    masterStatusLabel: masterInForce
      ? 'Curricolo d’Istituto vigente'
      : 'Baseline canonica di lavoro · approvazione collegiale non ancora registrata',
    sourceRepertoryId: INSTITUTE_CURRICULUM_SOURCE_REPERTORY.repertoryId,
    sourceRepertoryVersion: INSTITUTE_CURRICULUM_SOURCE_REPERTORY.version,
    academicYear,
  };

  if (framework !== 'IN2025' && framework !== 'IN2012') {
    return {
      ...base,
      applicabilityState: 'UNRESOLVED_CONTEXT',
      framework: null,
      applicableSource: null,
      applicabilityLabel: 'Regime della coorte da verificare',
      applicabilityDetail: academicYear
        ? 'Completa o correggi classe e contesto per determinare il quadro nazionale applicabile.'
        : 'Definisci l’anno scolastico per determinare il quadro nazionale applicabile.',
    };
  }

  const applicableSource = sourceForFramework(framework);
  const is2025 = framework === 'IN2025';

  return {
    ...base,
    applicabilityState: is2025 ? 'RESOLVED_IN2025' : 'RESOLVED_IN2012',
    framework,
    applicableSource,
    applicabilityLabel: is2025
      ? 'Regime applicabile alla coorte · Indicazioni 2025'
      : 'Regime applicabile alla coorte · Indicazioni 2012 in prosecuzione',
    applicabilityDetail: applicableSource
      ? `${applicableSource.code} · ${applicableSource.title}`
      : is2025
        ? 'D.M. 221/2025'
        : 'D.M. 254/2012',
  };
}
