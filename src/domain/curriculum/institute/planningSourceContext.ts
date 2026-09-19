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

export type PlanningMasterInstitutionalStatus =
  | 'IN_FORCE'
  | 'PENDING_PROFESSIONAL_VALIDATION'
  | 'PENDING_VERTICALITY_REVIEW'
  | 'NOT_READY_FOR_COLLEGIO'
  | 'READY_FOR_COLLEGIO_PENDING_APPROVAL'
  | 'APPROVED_PENDING_CANONICAL_PROMOTION'
  | 'PROMOTION_AUTHORIZED_PENDING_IN_FORCE';

export interface PlanningSourceContext {
  masterId: 'CAN-CURR-MASTER-00';
  masterVersion: string;
  masterLifecycleState: string;
  masterInstitutionalStatus: PlanningMasterInstitutionalStatus;
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

interface MasterGovernanceStateInput {
  curriculumInForce: boolean;
  humanProfessionalValidation: string;
  verticalityFinalReview: string;
  readyForCollegio: boolean;
  collegiateApproval: boolean;
  canonicalPromotionAuthorized: boolean;
}

export function resolvePlanningMasterGovernanceState(
  source: MasterGovernanceStateInput,
): Pick<PlanningSourceContext, 'masterInstitutionalStatus' | 'masterStatusLabel'> {
  if (source.curriculumInForce) {
    return {
      masterInstitutionalStatus: 'IN_FORCE',
      masterStatusLabel: 'Curricolo d’Istituto vigente',
    };
  }

  if (source.humanProfessionalValidation !== 'COMPLETE') {
    return {
      masterInstitutionalStatus: 'PENDING_PROFESSIONAL_VALIDATION',
      masterStatusLabel: 'Baseline canonica di lavoro · validazione professionale ancora aperta',
    };
  }

  if (source.verticalityFinalReview !== 'COMPLETE') {
    return {
      masterInstitutionalStatus: 'PENDING_VERTICALITY_REVIEW',
      masterStatusLabel: 'Baseline canonica di lavoro · revisione verticale finale ancora aperta',
    };
  }

  if (!source.readyForCollegio) {
    return {
      masterInstitutionalStatus: 'NOT_READY_FOR_COLLEGIO',
      masterStatusLabel: 'Baseline canonica di lavoro · non ancora pronta per il Collegio',
    };
  }

  if (!source.collegiateApproval) {
    return {
      masterInstitutionalStatus: 'READY_FOR_COLLEGIO_PENDING_APPROVAL',
      masterStatusLabel: 'Pronta per il Collegio · approvazione collegiale non ancora registrata',
    };
  }

  if (!source.canonicalPromotionAuthorized) {
    return {
      masterInstitutionalStatus: 'APPROVED_PENDING_CANONICAL_PROMOTION',
      masterStatusLabel: 'Approvazione collegiale registrata · promozione canonica non ancora autorizzata',
    };
  }

  return {
    masterInstitutionalStatus: 'PROMOTION_AUTHORIZED_PENDING_IN_FORCE',
    masterStatusLabel: 'Promozione canonica autorizzata · vigenza non ancora registrata',
  };
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

  const {
    masterInstitutionalStatus,
    masterStatusLabel,
  } = resolvePlanningMasterGovernanceState(INSTITUTE_CURRICULUM_CURRENT_SOURCE);

  const base: Pick<
    PlanningSourceContext,
    | 'masterId'
    | 'masterVersion'
    | 'masterLifecycleState'
    | 'masterInstitutionalStatus'
    | 'masterLabel'
    | 'masterStatusLabel'
    | 'sourceRepertoryId'
    | 'sourceRepertoryVersion'
    | 'academicYear'
  > = {
    masterId: 'CAN-CURR-MASTER-00' as const,
    masterVersion: INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceVersion,
    masterLifecycleState: INSTITUTE_CURRICULUM_CURRENT_SOURCE.lifecycleState,
    masterInstitutionalStatus,
    masterLabel: `Baseline Arena · master ${INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceVersion}`,
    masterStatusLabel,
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
