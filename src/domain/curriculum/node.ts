/**
 * CML-630E — CurriculumNode
 *
 * Entità produttiva autonoma che rappresenta un elemento curricolare specifico
 * all'interno di un segmento (competenza, traguardo, obiettivo, ecc.).
 *
 * Relazioni strutturali: provenienza (sourceNodeId), sostituzione (replacesNodeId).
 * Le relazioni pedagogiche sono in VerticalCurriculumLink.
 */

import type { CurriculumNodeType, CurriculumNodeWorkStatus } from './types';

export interface CurriculumNode {
  id: string;
  versionId: string;
  segmentId: string;

  type: CurriculumNodeType;
  title: string;
  description?: string;

  frameworkReferenceId?: string;
  workStatus?: CurriculumNodeWorkStatus;

  sourceNodeId?: string;
  replacesNodeId?: string;

  createdAt: string;
  updatedAt: string;
}
