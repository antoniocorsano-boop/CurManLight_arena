import type {
  CaseScopedCurriculumWorkSession,
  CurriculumReviewCase,
  CurriculumReviewCaseReadiness,
  CurriculumUnitReference,
  CurriculumUnitResolutionState,
  CurriculumWorkSessionStage,
} from './curriculum';

/**
 * TRAMA-TERM-01 canonical vocabulary facade.
 *
 * These aliases deliberately preserve the exact v1 runtime/data shapes while
 * Arena migrates its internal ubiquitous language from Curriculum* to
 * Curricolo*. The legacy module remains available for published v1 contracts
 * and compatibility boundaries; new internal code should prefer this module.
 */
export type CurricoloUnitResolutionState = CurriculumUnitResolutionState;
export type CurricoloUnitReference = CurriculumUnitReference;
export type CurricoloReviewCaseReadiness = CurriculumReviewCaseReadiness;
export type CurricoloReviewCase = CurriculumReviewCase;
export type CurricoloWorkSessionStage = CurriculumWorkSessionStage;
export type CaseScopedCurricoloWorkSession = CaseScopedCurriculumWorkSession;
