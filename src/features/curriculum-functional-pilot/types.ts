/**
 * CML-631A — Curriculum Domain Functional Activation Pilot
 *
 * Tipi per la modalita di attivazione e il pilot funzionale.
 */

export type CurriculumFunctionalActivationMode =
  | 'disabled'
  | 'pilot-read-only'
  | 'pilot-contribution';

export interface PilotConfig {
  mode: CurriculumFunctionalActivationMode;
  datasetId: string;
  initializedAt: string;
}

export interface PilotDataset {
  id: string;
  versionId: string;
  segmentIds: string[];
  nodeIds: string[];
  initializedAt: string;
}

export const PILOT_DEFAULT_CONFIG: PilotConfig = {
  mode: 'disabled',
  datasetId: 'pilot-math-primary-secondary-2026',
  initializedAt: '',
};

export const PILOT_DATASET_ID = 'pilot-math-primary-secondary-2026';
