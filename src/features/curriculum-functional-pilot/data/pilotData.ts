/**
 * CML-631A — Pilot Dataset
 *
 * Dataset sintetico per il pilota funzionale.
 * Matematica: Primaria classe quinta → Secondaria di primo grado classe prima.
 */

import type {
  InstituteCurriculumVersion,
  CurriculumSegment,
  CurriculumNode,
  VerticalCurriculumLink,
} from '../../../domain/curriculum';

export const PILOT_VERSION: InstituteCurriculumVersion = {
  id: 'pilot-version-001',
  title: 'Curricolo Matematica Pilota 2026-2029',
  versionNumber: 'P-1.0',
  effectiveFrom: '2026-09-01',
  effectiveTo: '2029-08-31',
  status: 'draft',
  createdAt: '2026-07-25T00:00:00Z',
  updatedAt: '2026-07-25T00:00:00Z',
};

export const PILOT_SEGMENTS: CurriculumSegment[] = [
  {
    id: 'pilot-segment-math-primary-5',
    versionId: 'pilot-version-001',
    schoolLevel: 'primaria',
    subjectOrFieldId: 'matematica',
    scope: { type: 'grade', grade: '5a' },
    frameworkApplicability: {
      framework: 'IN2025',
      resolutionStatus: 'resolved',
      resolutionReason: 'ENTRY_COHORT_2026_OR_LATER',
    },
    workStatus: 'effective',
    content: {
      traguardi: ['Numeri e calcolo', 'Spazio e misure', 'Dati e previsioni'],
      obiettivi: ['Conoscere i numeri naturali', 'Calcolare con le frazioni', 'Misurare aree e volumi'],
      evidenze: ['Verifiche scritte', 'Osservazioni in classe'],
      conoscenze: ['Numeri naturali', 'Frazioni', 'Geometria'],
      abilita: ['Calcolare', 'Risolvere problemi', 'Misurare'],
      competenze: ['Competenza matematica'],
      nucleiFondanti: ['Numeri', 'Spazio', 'Dati'],
      proposals: [],
    },
    createdAt: '2026-07-25T00:00:00Z',
    updatedAt: '2026-07-25T00:00:00Z',
  },
  {
    id: 'pilot-segment-math-secondary-1',
    versionId: 'pilot-version-001',
    schoolLevel: 'secondaria',
    subjectOrFieldId: 'matematica',
    scope: { type: 'grade', grade: '1a' },
    frameworkApplicability: {
      framework: 'IN2025',
      resolutionStatus: 'resolved',
      resolutionReason: 'ENTRY_COHORT_2026_OR_LATER',
    },
    workStatus: 'effective',
    content: {
      traguardi: ['Numeri e calcolo', 'Spazio e figure', 'Funzioni', 'Dati e probabilità'],
      obiettivi: ['Operare con i numeri relativi', 'Studiare le funzioni lineari', 'Analizzare dati statistici'],
      evidenze: ['Verifiche scritte', 'Progetti di gruppo'],
      conoscenze: ['Numeri relativi', 'Equazioni', 'Funzioni lineari', 'Statistica'],
      abilita: ['Risolvere equazioni', 'Rappresentare funzioni', 'Analizzare dati'],
      competenze: ['Competenza matematica', 'Pensiero computazionale'],
      nucleiFondanti: ['Numeri', 'Forme', 'Relazioni', 'Dati'],
      proposals: [],
    },
    createdAt: '2026-07-25T00:00:00Z',
    updatedAt: '2026-07-25T00:00:00Z',
  },
];

export const PILOT_NODES: CurriculumNode[] = [
  // Primary school nodes
  {
    id: 'pilot-node-primary-1',
    versionId: 'pilot-version-001',
    segmentId: 'pilot-segment-math-primary-5',
    type: 'competence',
    title: 'Numeri naturali e calcolo',
    description: 'Conoscere e utilizzare i numeri naturali, eseguire calcoli aritmetici',
    createdAt: '2026-07-25T00:00:00Z',
    updatedAt: '2026-07-25T00:00:00Z',
  },
  {
    id: 'pilot-node-primary-2',
    versionId: 'pilot-version-001',
    segmentId: 'pilot-segment-math-primary-5',
    type: 'objective',
    title: 'Calcolare con le frazioni',
    description: 'Eseguire operazioni con frazioni semplici e decimali',
    createdAt: '2026-07-25T00:00:00Z',
    updatedAt: '2026-07-25T00:00:00Z',
  },
  {
    id: 'pilot-node-primary-3',
    versionId: 'pilot-version-001',
    segmentId: 'pilot-segment-math-primary-5',
    type: 'milestone',
    title: 'Geometria piana',
    description: 'Conoscere le figure geometriche e calcolare perimetri e aree',
    createdAt: '2026-07-25T00:00:00Z',
    updatedAt: '2026-07-25T00:00:00Z',
  },
  // Secondary school nodes
  {
    id: 'pilot-node-secondary-1',
    versionId: 'pilot-version-001',
    segmentId: 'pilot-segment-math-secondary-1',
    type: 'competence',
    title: 'Numeri relativi e algebre',
    description: 'Operare con numeri relativi, risolvere equazioni di primo grado',
    createdAt: '2026-07-25T00:00:00Z',
    updatedAt: '2026-07-25T00:00:00Z',
  },
  {
    id: 'pilot-node-secondary-2',
    versionId: 'pilot-version-001',
    segmentId: 'pilot-segment-math-secondary-1',
    type: 'objective',
    title: 'Funzioni lineari',
    description: 'Studiare e rappresentare funzioni lineari e proporzionalità',
    createdAt: '2026-07-25T00:00:00Z',
    updatedAt: '2026-07-25T00:00:00Z',
  },
  {
    id: 'pilot-node-secondary-3',
    versionId: 'pilot-version-001',
    segmentId: 'pilot-segment-math-secondary-1',
    type: 'milestone',
    title: 'Statistica descrittiva',
    description: 'Raccogliere, organizzare e analizzare dati statistici',
    createdAt: '2026-07-25T00:00:00Z',
    updatedAt: '2026-07-25T00:00:00Z',
  },
];

export const PILOT_INITIAL_LINKS: VerticalCurriculumLink[] = [];
