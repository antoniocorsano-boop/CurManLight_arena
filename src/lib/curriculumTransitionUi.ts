import { parseSchoolYear } from './academicYear';
import { resolveNationalFramework } from './curriculumTransitionResolver';
import type { NationalFramework, SchoolOrder } from '../types/curriculumTransition';

export interface CurriculumTransitionUiContext {
  schoolYear: string;
  order: SchoolOrder;
  targetClass: string;
}

export function resolveShownFrameworkForCurriculum(context: CurriculumTransitionUiContext): NationalFramework | null {
  const academicYear = parseSchoolYear(context.schoolYear);
  if (!academicYear) return null;
  const classLevel = context.order === 'infanzia' ? undefined : parseInt(context.targetClass, 10);
  const resolution = resolveNationalFramework({
    schoolOrder: context.order,
    schoolYear: academicYear,
    classLevel,
  });
  return resolution.framework;
}
