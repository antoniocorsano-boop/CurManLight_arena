/**
 * CML-630E — CurriculumSegment
 *
 * Unità strutturale del curricolo.
 * Contiene solo relazioni strutturali: provenienza, sostituzione, appartenenza alla versione.
 * Le relazioni pedagogiche sono in VerticalCurriculumLink.
 */

import type {
  SchoolLevel,
  SegmentScope,
  FrameworkApplicabilityReference,
  CurriculumSegmentWorkStatus,
} from './types';

export interface CurriculumSegmentContent {
  traguardi: string[];
  obiettivi: string[];
  evidenze: string[];
  conoscenze: string[];
  abilita: string[];
  competenze: string[];
  nucleiFondanti: string[];
  proposals: Array<{
    id: string;
    focus: string;
    oldText: string;
    newText: string;
    notes: string;
  }>;
}

export interface CurriculumSegment {
  id: string;
  versionId: string;

  schoolLevel: SchoolLevel;
  subjectOrFieldId: string;
  scope: SegmentScope;

  frameworkApplicability: FrameworkApplicabilityReference;
  workStatus: CurriculumSegmentWorkStatus;

  sourceSegmentId?: string;
  replacesSegmentId?: string;

  content: CurriculumSegmentContent;

  createdAt: string;
  updatedAt: string;
}
