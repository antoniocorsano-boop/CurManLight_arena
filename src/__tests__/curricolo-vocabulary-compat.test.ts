import { describe, expectTypeOf, it } from 'vitest';
import type {
  CurriculumReviewCase,
  CurriculumReviewCaseReadiness,
  CurriculumUnitReference,
  CurriculumUnitResolutionState,
  CurriculumWorkSessionStage,
  CaseScopedCurriculumWorkSession,
} from '../types/curriculum';
import type {
  CurricoloReviewCase,
  CurricoloReviewCaseReadiness,
  CurricoloUnitReference,
  CurricoloUnitResolutionState,
  CurricoloWorkSessionStage,
  CaseScopedCurricoloWorkSession,
} from '../types/curricolo';

describe('TRAMA-TERM-01 — canonical curricolo vocabulary compatibility', () => {
  it('keeps canonical unit references structurally identical to the legacy v1 shape', () => {
    expectTypeOf<CurricoloUnitReference>().toEqualTypeOf<CurriculumUnitReference>();
    expectTypeOf<CurricoloUnitResolutionState>().toEqualTypeOf<CurriculumUnitResolutionState>();
  });

  it('keeps review-case and work-session shapes structurally identical during migration', () => {
    expectTypeOf<CurricoloReviewCase>().toEqualTypeOf<CurriculumReviewCase>();
    expectTypeOf<CurricoloReviewCaseReadiness>().toEqualTypeOf<CurriculumReviewCaseReadiness>();
    expectTypeOf<CurricoloWorkSessionStage>().toEqualTypeOf<CurriculumWorkSessionStage>();
    expectTypeOf<CaseScopedCurricoloWorkSession>().toEqualTypeOf<CaseScopedCurriculumWorkSession>();
  });
});
