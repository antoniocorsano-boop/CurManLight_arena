import type { NationalSourceLocator } from './dm2212025';
import { DM221_2025_SOURCE_ID } from './dm2212025';

export type NationalCurriculumSegmentKind =
  | 'INFANZIA_FIELD_OF_EXPERIENCE'
  | 'FIRST_CYCLE_DISCIPLINE'
  | 'CROSS_DISCIPLINARY_FRAMEWORK'
  | 'CONDITIONAL_OFFERING'
  | 'EXTERNAL_AUTHORITY_SUBJECT';

export type InfanziaFieldId =
  | 'IL_SE_E_L_ALTRO'
  | 'IL_CORPO_E_IL_MOVIMENTO'
  | 'IMMAGINI_SUONI_COLORI'
  | 'I_DISCORSI_E_LE_PAROLE'
  | 'LA_CONOSCENZA_DEL_MONDO';

export type FirstCycleDisciplineId =
  | 'ITALIANO'
  | 'LINGUA_INGLESE'
  | 'SECONDA_LINGUA_COMUNITARIA'
  | 'STORIA'
  | 'GEOGRAFIA'
  | 'MATEMATICA'
  | 'TECNOLOGIA'
  | 'SCIENZE'
  | 'MUSICA'
  | 'ARTE_E_IMMAGINE'
  | 'EDUCAZIONE_MOTORIA'
  | 'EDUCAZIONE_FISICA';

export type FirstCycleSchoolOrder = 'primaria' | 'secondaria';

export interface CanonicalNationalSegment {
  id: string;
  kind: NationalCurriculumSegmentKind;
  label: string;
  schoolOrders: readonly ('infanzia' | FirstCycleSchoolOrder)[];
  universalRequirement: boolean;
  sourceLocator: NationalSourceLocator;
  notes?: string;
}

const art2 = (note: string): NationalSourceLocator => ({
  sourceId: DM221_2025_SOURCE_ID,
  article: '2',
  page: 34,
  note,
});

const annexInfanzia = (section: string): NationalSourceLocator => ({
  sourceId: DM221_2025_SOURCE_ID,
  section,
  note: 'Sezione canonica dell’allegato; il locator di dettaglio per competenze e obiettivi sarà aggiunto elemento per elemento.',
});

export const DM221_INFANZIA_FIELDS: Readonly<Record<InfanziaFieldId, CanonicalNationalSegment>> = {
  IL_SE_E_L_ALTRO: {
    id: 'dm221-infanzia-il-se-e-l-altro',
    kind: 'INFANZIA_FIELD_OF_EXPERIENCE',
    label: 'Il sé e l’altro',
    schoolOrders: ['infanzia'],
    universalRequirement: true,
    sourceLocator: annexInfanzia('Campo di esperienza — Il sé e l’altro'),
  },
  IL_CORPO_E_IL_MOVIMENTO: {
    id: 'dm221-infanzia-il-corpo-e-il-movimento',
    kind: 'INFANZIA_FIELD_OF_EXPERIENCE',
    label: 'Il corpo e il movimento',
    schoolOrders: ['infanzia'],
    universalRequirement: true,
    sourceLocator: annexInfanzia('Campo di esperienza — Il corpo e il movimento'),
  },
  IMMAGINI_SUONI_COLORI: {
    id: 'dm221-infanzia-immagini-suoni-colori',
    kind: 'INFANZIA_FIELD_OF_EXPERIENCE',
    label: 'Immagini, suoni e colori',
    schoolOrders: ['infanzia'],
    universalRequirement: true,
    sourceLocator: annexInfanzia('Campo di esperienza — Immagini, suoni e colori'),
  },
  I_DISCORSI_E_LE_PAROLE: {
    id: 'dm221-infanzia-i-discorsi-e-le-parole',
    kind: 'INFANZIA_FIELD_OF_EXPERIENCE',
    label: 'I discorsi e le parole',
    schoolOrders: ['infanzia'],
    universalRequirement: true,
    sourceLocator: annexInfanzia('Campo di esperienza — I discorsi e le parole'),
  },
  LA_CONOSCENZA_DEL_MONDO: {
    id: 'dm221-infanzia-la-conoscenza-del-mondo',
    kind: 'INFANZIA_FIELD_OF_EXPERIENCE',
    label: 'La conoscenza del mondo',
    schoolOrders: ['infanzia'],
    universalRequirement: true,
    sourceLocator: annexInfanzia('Campo di esperienza — La conoscenza del mondo'),
  },
};

export const DM221_FIRST_CYCLE_DISCIPLINES: Readonly<Record<FirstCycleDisciplineId, CanonicalNationalSegment>> = {
  ITALIANO: { id: 'dm221-disc-italiano', kind: 'FIRST_CYCLE_DISCIPLINE', label: 'Italiano', schoolOrders: ['primaria', 'secondaria'], universalRequirement: true, sourceLocator: art2('Art. 2, c. 1') },
  LINGUA_INGLESE: { id: 'dm221-disc-inglese', kind: 'FIRST_CYCLE_DISCIPLINE', label: 'Lingua inglese', schoolOrders: ['primaria', 'secondaria'], universalRequirement: true, sourceLocator: art2('Art. 2, c. 1') },
  SECONDA_LINGUA_COMUNITARIA: { id: 'dm221-disc-seconda-lingua', kind: 'FIRST_CYCLE_DISCIPLINE', label: 'Seconda lingua comunitaria', schoolOrders: ['secondaria'], universalRequirement: true, sourceLocator: art2('Art. 2, c. 1 — scuola secondaria di primo grado') },
  STORIA: { id: 'dm221-disc-storia', kind: 'FIRST_CYCLE_DISCIPLINE', label: 'Storia', schoolOrders: ['primaria', 'secondaria'], universalRequirement: true, sourceLocator: art2('Art. 2, c. 1') },
  GEOGRAFIA: { id: 'dm221-disc-geografia', kind: 'FIRST_CYCLE_DISCIPLINE', label: 'Geografia', schoolOrders: ['primaria', 'secondaria'], universalRequirement: true, sourceLocator: art2('Art. 2, c. 1') },
  MATEMATICA: { id: 'dm221-disc-matematica', kind: 'FIRST_CYCLE_DISCIPLINE', label: 'Matematica', schoolOrders: ['primaria', 'secondaria'], universalRequirement: true, sourceLocator: art2('Art. 2, c. 1') },
  TECNOLOGIA: { id: 'dm221-disc-tecnologia', kind: 'FIRST_CYCLE_DISCIPLINE', label: 'Tecnologia', schoolOrders: ['primaria', 'secondaria'], universalRequirement: true, sourceLocator: art2('Art. 2, c. 1') },
  SCIENZE: { id: 'dm221-disc-scienze', kind: 'FIRST_CYCLE_DISCIPLINE', label: 'Scienze', schoolOrders: ['primaria', 'secondaria'], universalRequirement: true, sourceLocator: art2('Art. 2, c. 1') },
  MUSICA: { id: 'dm221-disc-musica', kind: 'FIRST_CYCLE_DISCIPLINE', label: 'Musica', schoolOrders: ['primaria', 'secondaria'], universalRequirement: true, sourceLocator: art2('Art. 2, c. 1') },
  ARTE_E_IMMAGINE: { id: 'dm221-disc-arte', kind: 'FIRST_CYCLE_DISCIPLINE', label: 'Arte e immagine', schoolOrders: ['primaria', 'secondaria'], universalRequirement: true, sourceLocator: art2('Art. 2, c. 1') },
  EDUCAZIONE_MOTORIA: { id: 'dm221-disc-educazione-motoria', kind: 'FIRST_CYCLE_DISCIPLINE', label: 'Educazione motoria', schoolOrders: ['primaria'], universalRequirement: true, sourceLocator: art2('Art. 2, c. 1 — scuola primaria') },
  EDUCAZIONE_FISICA: { id: 'dm221-disc-educazione-fisica', kind: 'FIRST_CYCLE_DISCIPLINE', label: 'Educazione fisica', schoolOrders: ['secondaria'], universalRequirement: true, sourceLocator: art2('Art. 2, c. 1 — scuola secondaria di primo grado') },
};

export const DM221_SPECIAL_SEGMENTS: readonly CanonicalNationalSegment[] = [
  {
    id: 'dm221-framework-stem',
    kind: 'CROSS_DISCIPLINARY_FRAMEWORK',
    label: 'Educazione integrata matematico-scientifico-tecnologica (STEM)',
    schoolOrders: ['primaria', 'secondaria'],
    universalRequirement: false,
    sourceLocator: { sourceId: DM221_2025_SOURCE_ID, section: 'Educazione integrata matematico-scientifico-tecnologica (STEM)', page: 83 },
    notes: 'Sezione integrata dell’allegato; non viene trasformata in una disciplina autonoma dell’art. 2, comma 1.',
  },
  {
    id: 'dm221-offering-lel',
    kind: 'CONDITIONAL_OFFERING',
    label: 'Latino per l’educazione linguistica (LEL)',
    schoolOrders: ['secondaria'],
    universalRequirement: false,
    sourceLocator: art2('Art. 2, c. 3 — avvio possibile in prima applicazione per classi seconde e terze 2026/27'),
  },
  {
    id: 'dm221-offering-strumento-musicale',
    kind: 'CONDITIONAL_OFFERING',
    label: 'Strumento musicale',
    schoolOrders: ['secondaria'],
    universalRequirement: false,
    sourceLocator: art2('Art. 2, c. 5 — percorsi ad indirizzo musicale'),
  },
  {
    id: 'dm221-external-irc',
    kind: 'EXTERNAL_AUTHORITY_SUBJECT',
    label: 'Religione cattolica',
    schoolOrders: ['infanzia', 'primaria', 'secondaria'],
    universalRequirement: false,
    sourceLocator: art2('Art. 2, c. 6 — rinvio al D.P.R. 11 febbraio 2010'),
    notes: 'Il contenuto curricolare IRC richiede la fonte concordataria richiamata; non va auto-popolato dal D.M. 221/2025.',
  },
  {
    id: 'dm221-framework-educazione-civica',
    kind: 'CROSS_DISCIPLINARY_FRAMEWORK',
    label: 'Educazione civica',
    schoolOrders: ['primaria', 'secondaria'],
    universalRequirement: false,
    sourceLocator: art2('Art. 2, c. 4 — insegnamento trasversale ai sensi della L. 92/2019'),
  },
];

export const DM221_CANONICAL_STRUCTURE_VERSION = 'dm221-structure-v1' as const;

export function getUniversalFirstCycleRequirements() {
  return Object.values(DM221_FIRST_CYCLE_DISCIPLINES).flatMap((segment) =>
    segment.schoolOrders.map((schoolOrder) => ({
      segmentId: segment.id,
      disciplineLabel: segment.label,
      schoolOrder: schoolOrder as FirstCycleSchoolOrder,
      sourceLocator: segment.sourceLocator,
    })),
  );
}
