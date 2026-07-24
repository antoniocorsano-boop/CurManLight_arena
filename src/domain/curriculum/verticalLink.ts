/**
 * CML-630E — VerticalCurriculumLink
 *
 * Entità produttiva autonoma per relazioni pedagogiche tra nodi curricolari.
 * Supporta relazioni interdisciplinari e tra ordini scolastici diversi.
 *
 * Modello C ibrido: le relazioni strutturali restano nei segmenti/nodi,
 * le relazioni pedagogiche sono gestite da questa entità.
 */

import type {
  InstitutionalRole,
  VerticalCurriculumRelationType,
  VerticalCurriculumLinkStatus,
} from './types';

export interface VerticalCurriculumLink {
  id: string;
  versionId: string;

  sourceNodeId: string;
  targetNodeId: string;

  relationType: VerticalCurriculumRelationType;
  rationale: string;

  status: VerticalCurriculumLinkStatus;

  createdByRole?: InstitutionalRole;
  validatedByRole?: InstitutionalRole;

  createdAt: string;
  updatedAt: string;
  validatedAt?: string;
}
