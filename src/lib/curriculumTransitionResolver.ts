import type {
  AcademicYear,
  FrameworkResolution,
  SchoolOrder,
  TransitionPolicy,
} from '../types/curriculumTransition';
import { DEFAULT_TRANSITION_POLICY, MAX_CLASS_LEVEL } from '../types/curriculumTransition';

export function createAcademicYear(startYear: number): AcademicYear {
  return { startYear, endYear: startYear + 1 };
}

export function formatAcademicYear(year: AcademicYear): string {
  return `${year.startYear}/${year.endYear}`;
}

export function isValidAcademicYear(year: AcademicYear): boolean {
  if (!Number.isFinite(year.startYear) || !Number.isFinite(year.endYear)) return false;
  if (!Number.isInteger(year.startYear) || !Number.isInteger(year.endYear)) return false;
  return year.endYear === year.startYear + 1;
}

function isSchoolOrder(value: unknown): value is SchoolOrder {
  return value === 'infanzia' || value === 'primaria' || value === 'secondaria';
}

function validateContext(
  context: {
    schoolOrder: SchoolOrder;
    schoolYear: AcademicYear;
    classLevel?: number;
  },
  policy: TransitionPolicy
): FrameworkResolution | null {
  if (!isSchoolOrder(context.schoolOrder)) {
    return { framework: null, status: 'requires-context-confirmation', reason: 'INVALID_CONTEXT' };
  }

  if (!isValidAcademicYear(context.schoolYear)) {
    return { framework: null, status: 'requires-context-confirmation', reason: 'INVALID_CONTEXT' };
  }

  const maxClass = MAX_CLASS_LEVEL[context.schoolOrder];

  if (context.schoolOrder !== 'infanzia') {
    if (context.classLevel === undefined) {
      return { framework: null, status: 'requires-context-confirmation', reason: 'INVALID_CONTEXT' };
    }
    if (!Number.isInteger(context.classLevel) || context.classLevel < 1 || context.classLevel > maxClass) {
      return { framework: null, status: 'requires-context-confirmation', reason: 'INVALID_CONTEXT' };
    }
  }

  if (!policy.immediateOrders.includes(context.schoolOrder) && !policy.progressiveOrders.includes(context.schoolOrder)) {
    return { framework: null, status: 'requires-context-confirmation', reason: 'INVALID_CONTEXT' };
  }

  return null;
}

export function resolveNationalFramework(
  context: {
    schoolOrder: SchoolOrder;
    schoolYear: AcademicYear;
    classLevel?: number;
  },
  policy: TransitionPolicy = DEFAULT_TRANSITION_POLICY
): FrameworkResolution {
  const validationError = validateContext(context, policy);
  if (validationError) return validationError;

  if (context.schoolYear.startYear < policy.firstEntrySchoolYear) {
    return { framework: 'IN2012', status: 'resolved', reason: 'BEFORE_TRANSITION' };
  }

  if (policy.immediateOrders.includes(context.schoolOrder)) {
    return {
      framework: policy.targetFramework,
      status: 'resolved',
      reason: 'IMMEDIATE_ORDER_FROM_EFFECTIVE_YEAR',
    };
  }

  const classLevel = context.classLevel!;
  const cohortEntryYear = context.schoolYear.startYear - (classLevel - 1);

  if (cohortEntryYear >= policy.firstEntrySchoolYear) {
    return {
      framework: policy.targetFramework,
      status: 'resolved',
      reason: 'ENTRY_COHORT_2026_OR_LATER',
      cohortEntryYear,
    };
  }

  return {
    framework: 'IN2012',
    status: 'resolved',
    reason: 'PRE_TRANSITION_COHORT',
    cohortEntryYear,
  };
}
