import type {
  CaseScopedCurriculumWorkSession,
  CurriculumReviewCase,
  CurriculumReviewCaseReadiness,
  CurriculumUnitReference,
  CurriculumUnitResolutionState,
  CurriculumWorkSessionStage,
} from './curriculum';
import type { CurriculumNode } from '../domain/curriculum/node';
import type { CurriculumSegment, CurriculumSegmentContent } from '../domain/curriculum/segment';
import type {
  FrameworkApplicabilityReference,
  SchoolOrder,
  SegmentScope,
} from '../domain/curriculum/types';
import type { InstituteCurriculumVersion } from '../domain/curriculum/version';
import type { VerticalCurriculumLink } from '../domain/curriculum/verticalLink';
import {
  MemoryCurriculumPersistenceBackend,
} from '../domain/curriculum/persistence/backend';
import {
  createCurriculumRepositories,
  type CurriculumRepositories,
} from '../domain/curriculum/persistence/repositories';

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

export type CurricoloNode = CurriculumNode;
export type CurricoloSegment = CurriculumSegment;
export type CurricoloSegmentContent = CurriculumSegmentContent;
export type CurricoloFrameworkApplicabilityReference = FrameworkApplicabilityReference;
export type CurricoloSchoolOrder = SchoolOrder;
export type CurricoloSegmentScope = SegmentScope;
export type InstituteCurricoloVersion = InstituteCurriculumVersion;
export type VerticalCurricoloLink = VerticalCurriculumLink;
export type CurricoloRepositories = CurriculumRepositories;

export const MemoryCurricoloPersistenceBackend = MemoryCurriculumPersistenceBackend;
export const createCurricoloRepositories = createCurriculumRepositories;
