/**
 * CML-630E — InstituteCurriculumVersion
 *
 * Rappresenta l'intero curricolo d'istituto in una specifica versione.
 * Ogni versione ha uno stato, un periodo di efficacia e un riferimento alla versione precedente.
 */

import type { InstituteCurriculumStatus } from './types';

export interface InstituteCurriculumVersion {
  id: string;
  institutionId?: string;
  title: string;
  versionNumber: string;

  effectiveFrom?: string;
  effectiveTo?: string;

  status: InstituteCurriculumStatus;

  previousVersionId?: string;

  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}
