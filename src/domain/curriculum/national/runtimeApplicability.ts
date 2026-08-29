import type { CurriculumRuntimeContext } from './runtimeIntegrationContract';
import {
  resolveExplicit2026Regime,
  type CurriculumCohortRule,
  type CurriculumRegime,
} from './transition2026';

export type CurriculumRuntimeApplicabilityStatus =
  | 'RESOLVED'
  | 'UNRESOLVED_MISSING_CONTEXT'
  | 'UNRESOLVED_UNSUPPORTED_ACADEMIC_YEAR';

export interface CurriculumRuntimeApplicability {
  context: CurriculumRuntimeContext;
  status: CurriculumRuntimeApplicabilityStatus;
  regimeResolved: boolean;
  regime?: CurriculumRegime;
  cohortRule?: CurriculumCohortRule;
  dm221Applicable: boolean;
  canProjectDm221Content: boolean;
  reason: string;
}

function requiresClassYear(context: CurriculumRuntimeContext): boolean {
  return context.schoolOrder === 'primaria' || context.schoolOrder === 'secondaria';
}

/**
 * CNR-1 runtime applicability resolver.
 *
 * Fail-closed by design: the system never infers a class year, never projects
 * future cohort progression, and never treats the legacy baseline as proof of
 * applicability. The only currently supported normative transition is the
 * explicit 2026/27 rule already encoded in transition2026.ts.
 */
export function resolveCurriculumRuntimeApplicability(
  context: CurriculumRuntimeContext,
): CurriculumRuntimeApplicability {
  if (!context.academicYear.trim()) {
    return {
      context,
      status: 'UNRESOLVED_MISSING_CONTEXT',
      regimeResolved: false,
      dm221Applicable: false,
      canProjectDm221Content: false,
      reason: 'Manca l’anno scolastico: il regime curricolare non può essere risolto.',
    };
  }

  if (requiresClassYear(context) && context.classYear === undefined) {
    return {
      context,
      status: 'UNRESOLVED_MISSING_CONTEXT',
      regimeResolved: false,
      dm221Applicable: false,
      canProjectDm221Content: false,
      reason: 'Manca la classe/coorte: primaria e secondaria richiedono il classYear prima di applicare un regime.',
    };
  }

  if (context.academicYear !== '2026/2027') {
    return {
      context,
      status: 'UNRESOLVED_UNSUPPORTED_ACADEMIC_YEAR',
      regimeResolved: false,
      dm221Applicable: false,
      canProjectDm221Content: false,
      reason: 'La progressione delle coorti oltre il 2026/27 non viene inferita automaticamente.',
    };
  }

  const cohortRule = resolveExplicit2026Regime(context.schoolOrder, context.classYear);
  if (!cohortRule) {
    return {
      context,
      status: 'UNRESOLVED_MISSING_CONTEXT',
      regimeResolved: false,
      dm221Applicable: false,
      canProjectDm221Content: false,
      reason: 'Il contesto non corrisponde a una regola di transizione normativa esplicita.',
    };
  }

  const dm221Applicable = cohortRule.regime === 'DM221_2025';

  return {
    context,
    status: 'RESOLVED',
    regimeResolved: true,
    regime: cohortRule.regime,
    cohortRule,
    dm221Applicable,
    canProjectDm221Content: dm221Applicable,
    reason: cohortRule.note,
  };
}

export function assertDm221ProjectionAllowed(context: CurriculumRuntimeContext): CurriculumCohortRule {
  const resolution = resolveCurriculumRuntimeApplicability(context);
  if (!resolution.canProjectDm221Content || !resolution.cohortRule) {
    throw new Error(`CNR-1_DM221_PROJECTION_BLOCKED: ${resolution.reason}`);
  }
  return resolution.cohortRule;
}
