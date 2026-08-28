import { DM221_2025_SOURCE_ID, type NationalSourceLocator } from './dm2212025';

export type CurriculumRegime = 'DM221_2025' | 'DM254_2012_CONTINUES';

export type CollegialRemodelingRule =
  | 'NOT_APPLICABLE'
  | 'WHEN_TEMPORAL_SCANS_DIFFER';

export type TransitionEvidenceLevel = 'NORMATIVE_EXPLICIT' | 'NEEDS_FUTURE_POLICY_CONFIRMATION';

export interface CurriculumCohortRule {
  academicYear: string;
  schoolOrder: 'infanzia' | 'primaria' | 'secondaria';
  classYear?: 1 | 2 | 3 | 4 | 5;
  regime: CurriculumRegime;
  collegialRemodeling: CollegialRemodelingRule;
  evidenceLevel: TransitionEvidenceLevel;
  sourceLocator: NationalSourceLocator;
  note: string;
}

const locator = (
  article: string,
  page: number,
  note: string,
): NationalSourceLocator => ({
  sourceId: DM221_2025_SOURCE_ID,
  article,
  page,
  note,
});

/**
 * Regole esplicitamente ricavabili dal D.M. 221/2025 per il 2026/27.
 *
 * Non viene inferita automaticamente la progressione delle coorti negli anni
 * successivi: quella proiezione richiede una regola dedicata e verificata.
 * Il comma 2 dell'art. 5 non crea un regime normativo ibrido: richiede ai
 * collegi di adattare/rimodulare il curricolo soltanto per le discipline in cui
 * la scansione temporale delle nuove Indicazioni differisce da quella 2012.
 */
export const DM221_TRANSITION_2026_27: readonly CurriculumCohortRule[] = [
  {
    academicYear: '2026/2027',
    schoolOrder: 'infanzia',
    regime: 'DM221_2025',
    collegialRemodeling: 'NOT_APPLICABLE',
    evidenceLevel: 'NORMATIVE_EXPLICIT',
    sourceLocator: locator('5.3', 35, 'Il D.M. 254/2012 cessa di avere efficacia per la scuola dell’infanzia dal 2026/27.'),
    note: 'Le nuove Indicazioni si applicano alla scuola dell’infanzia dal 2026/27.',
  },
  {
    academicYear: '2026/2027',
    schoolOrder: 'primaria',
    classYear: 1,
    regime: 'DM221_2025',
    collegialRemodeling: 'NOT_APPLICABLE',
    evidenceLevel: 'NORMATIVE_EXPLICIT',
    sourceLocator: locator('1.2', 34, 'Adozione a partire dalle classi prime.'),
    note: 'La classe prima adotta le Indicazioni 2025.',
  },
  ...([2, 3, 4, 5] as const).map((classYear) => ({
    academicYear: '2026/2027',
    schoolOrder: 'primaria' as const,
    classYear,
    regime: 'DM254_2012_CONTINUES' as const,
    collegialRemodeling: 'WHEN_TEMPORAL_SCANS_DIFFER' as const,
    evidenceLevel: 'NORMATIVE_EXPLICIT' as const,
    sourceLocator: locator('5.1-5.2', 35, 'Continuità delle Indicazioni 2012 per le classi intermedie; rimodulazione collegiale solo per discipline con diversa scansione temporale.'),
    note: 'La classe intermedia prosegue con le Indicazioni 2012 fino alla conclusione del corso; il collegio rimodula solo dove la diversa scansione temporale lo richiede.',
  })),
  {
    academicYear: '2026/2027',
    schoolOrder: 'secondaria',
    classYear: 1,
    regime: 'DM221_2025',
    collegialRemodeling: 'NOT_APPLICABLE',
    evidenceLevel: 'NORMATIVE_EXPLICIT',
    sourceLocator: locator('1.2', 34, 'Adozione a partire dalle classi prime.'),
    note: 'La classe prima adotta le Indicazioni 2025.',
  },
  ...([2, 3] as const).map((classYear) => ({
    academicYear: '2026/2027',
    schoolOrder: 'secondaria' as const,
    classYear,
    regime: 'DM254_2012_CONTINUES' as const,
    collegialRemodeling: 'WHEN_TEMPORAL_SCANS_DIFFER' as const,
    evidenceLevel: 'NORMATIVE_EXPLICIT' as const,
    sourceLocator: locator('5.1-5.2', 35, 'Continuità delle Indicazioni 2012 per le classi intermedie; rimodulazione collegiale solo per discipline con diversa scansione temporale.'),
    note: 'La classe intermedia prosegue con le Indicazioni 2012 fino alla conclusione del corso; il collegio rimodula solo dove la diversa scansione temporale lo richiede.',
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
