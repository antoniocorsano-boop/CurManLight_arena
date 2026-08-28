import { DM221_2025_SOURCE_ID, type NationalSourceLocator } from './dm2212025';

export type CurriculumRegime =
  | 'DM221_2025'
  | 'DM254_2012_CONTINUES'
  | 'DM221_2025_WITH_COLLEGIAL_REMODELING';

export type TransitionEvidenceLevel = 'NORMATIVE_EXPLICIT' | 'NEEDS_FUTURE_POLICY_CONFIRMATION';

export interface CurriculumCohortRule {
  academicYear: string;
  schoolOrder: 'infanzia' | 'primaria' | 'secondaria';
  classYear?: 1 | 2 | 3 | 4 | 5;
  regime: CurriculumRegime;
  evidenceLevel: TransitionEvidenceLevel;
  sourceLocator: NationalSourceLocator;
  note: string;
}

const article5 = (note: string): NationalSourceLocator => ({
  sourceId: DM221_2025_SOURCE_ID,
  article: '5',
  page: 34,
  note,
});

/**
 * Regole esplicitamente ricavabili dal D.M. 221/2025 per il 2026/27.
 *
 * Non viene inferita automaticamente la progressione delle coorti negli anni
 * successivi: quella proiezione richiede una regola dedicata e verificata.
 */
export const DM221_TRANSITION_2026_27: readonly CurriculumCohortRule[] = [
  {
    academicYear: '2026/2027',
    schoolOrder: 'infanzia',
    regime: 'DM221_2025',
    evidenceLevel: 'NORMATIVE_EXPLICIT',
    sourceLocator: article5('Art. 5, c. 3 — il D.M. 254/2012 cessa di avere efficacia per la scuola dell’infanzia dal 2026/27'),
    note: 'Le nuove Indicazioni si applicano alla scuola dell’infanzia dal 2026/27.',
  },
  {
    academicYear: '2026/2027',
    schoolOrder: 'primaria',
    classYear: 1,
    regime: 'DM221_2025',
    evidenceLevel: 'NORMATIVE_EXPLICIT',
    sourceLocator: article5('Art. 1, c. 2 e art. 5, c. 1 — avvio dalle classi prime'),
    note: 'La classe prima adotta le Indicazioni 2025.',
  },
  ...([2, 3, 4, 5] as const).map((classYear) => ({
    academicYear: '2026/2027',
    schoolOrder: 'primaria' as const,
    classYear,
    regime: 'DM254_2012_CONTINUES' as const,
    evidenceLevel: 'NORMATIVE_EXPLICIT' as const,
    sourceLocator: article5('Art. 5, c. 1 — classi intermedie già funzionanti nel 2025/26'),
    note: 'La classe intermedia prosegue con le Indicazioni 2012 fino alla conclusione del corso, con gli adattamenti previsti dal comma 2.',
  })),
  {
    academicYear: '2026/2027',
    schoolOrder: 'secondaria',
    classYear: 1,
    regime: 'DM221_2025',
    evidenceLevel: 'NORMATIVE_EXPLICIT',
    sourceLocator: article5('Art. 1, c. 2 e art. 5, c. 1 — avvio dalle classi prime'),
    note: 'La classe prima adotta le Indicazioni 2025.',
  },
  ...([2, 3] as const).map((classYear) => ({
    academicYear: '2026/2027',
    schoolOrder: 'secondaria' as const,
    classYear,
    regime: 'DM254_2012_CONTINUES' as const,
    evidenceLevel: 'NORMATIVE_EXPLICIT' as const,
    sourceLocator: article5('Art. 5, c. 1 — classi intermedie già funzionanti nel 2025/26'),
    note: 'La classe intermedia prosegue con le Indicazioni 2012 fino alla conclusione del corso, con gli adattamenti previsti dal comma 2.',
  })),
];

export function resolveExplicit2026Regime(
  schoolOrder: CurriculumCohortRule['schoolOrder'],
  classYear?: CurriculumCohortRule['classYear'],
): CurriculumCohortRule | undefined {
  return DM221_TRANSITION_2026_27.find(
    (rule) => rule.schoolOrder === schoolOrder && rule.classYear === classYear,
  );
}
