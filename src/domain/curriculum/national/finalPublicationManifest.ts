import type { NationalSourceLocator } from './dm2212025';
import { DM221_2025_SOURCE_ID } from './dm2212025';

export const DM221_FINAL_PUBLICATION = {
  title: 'Indicazioni nazionali per il curricolo della scuola dell’infanzia e del primo ciclo d’istruzione',
  decree: 'Decreto 9 dicembre 2025, n. 221',
  publisher: 'Ministero dell’Istruzione e del Merito',
  printedAt: '2026-03',
  pageNumbering: 'PRINTED_PAGE' as const,
  url: 'https://www.mim.gov.it/documents/20182/10554370/curricolo_web.pdf/f91c31a0-5ed4-65f3-bfea-fb49adaba55f?t=1773224873548&version=1.0',
} as const;

export type Dm221FinalPublicationSectionId =
  | 'INFANZIA'
  | 'INFANZIA_IL_SE_E_L_ALTRO'
  | 'INFANZIA_IL_CORPO_E_IL_MOVIMENTO'
  | 'INFANZIA_IMMAGINI_SUONI_COLORI'
  | 'INFANZIA_I_DISCORSI_E_LE_PAROLE'
  | 'INFANZIA_LA_CONOSCENZA_DEL_MONDO'
  | 'INFANZIA_TRANSITION_PROFILE'
  | 'ITALIANO'
  | 'LEL'
  | 'LINGUA_INGLESE'
  | 'SECONDA_LINGUA_COMUNITARIA'
  | 'STORIA'
  | 'GEOGRAFIA'
  | 'STEM'
  | 'MATEMATICA'
  | 'SCIENZE'
  | 'TECNOLOGIA'
  | 'MUSICA'
  | 'STRUMENTO_MUSICALE'
  | 'ARTE_E_IMMAGINE'
  | 'EDUCAZIONE_MOTORIA_E_FISICA';

export interface Dm221FinalPublicationSection {
  id: Dm221FinalPublicationSectionId;
  label: string;
  pageStart: number;
  pageEnd: number;
  segmentIds: readonly string[];
  schoolOrders: readonly ('infanzia' | 'primaria' | 'secondaria')[];
}

export const DM221_FINAL_PUBLICATION_SECTIONS: readonly Dm221FinalPublicationSection[] = [
  {
    id: 'INFANZIA',
    label: 'Indicazioni nazionali per la scuola dell’infanzia',
    pageStart: 53,
    pageEnd: 66,
    segmentIds: [],
    schoolOrders: ['infanzia'],
  },
  {
    id: 'INFANZIA_IL_SE_E_L_ALTRO',
    label: 'Campo di esperienza - Il sé e l’altro',
    pageStart: 57,
    pageEnd: 58,
    segmentIds: ['dm221-infanzia-il-se-e-l-altro'],
    schoolOrders: ['infanzia'],
  },
  {
    id: 'INFANZIA_IL_CORPO_E_IL_MOVIMENTO',
    label: 'Campo di esperienza - Il corpo e il movimento',
    pageStart: 59,
    pageEnd: 60,
    segmentIds: ['dm221-infanzia-il-corpo-e-il-movimento'],
    schoolOrders: ['infanzia'],
  },
  {
    id: 'INFANZIA_IMMAGINI_SUONI_COLORI',
    label: 'Campo di esperienza - Immagini, suoni, colori',
    pageStart: 61,
    pageEnd: 62,
    segmentIds: ['dm221-infanzia-immagini-suoni-colori'],
    schoolOrders: ['infanzia'],
  },
  {
    id: 'INFANZIA_I_DISCORSI_E_LE_PAROLE',
    label: 'Campo di esperienza - I discorsi e le parole',
    pageStart: 63,
    pageEnd: 63,
    segmentIds: ['dm221-infanzia-i-discorsi-e-le-parole'],
    schoolOrders: ['infanzia'],
  },
  {
    id: 'INFANZIA_LA_CONOSCENZA_DEL_MONDO',
    label: 'Campo di esperienza - La conoscenza del mondo',
    pageStart: 64,
    pageEnd: 66,
    segmentIds: ['dm221-infanzia-la-conoscenza-del-mondo'],
    schoolOrders: ['infanzia'],
  },
  {
    id: 'INFANZIA_TRANSITION_PROFILE',
    label: 'Dalla scuola dell’infanzia alla scuola primaria',
    pageStart: 67,
    pageEnd: 67,
    segmentIds: [],
    schoolOrders: ['infanzia', 'primaria'],
  },
  {
    id: 'ITALIANO',
    label: 'Italiano',
    pageStart: 68,
    pageEnd: 79,
    segmentIds: ['dm221-disc-italiano'],
    schoolOrders: ['primaria', 'secondaria'],
  },
  {
    id: 'LEL',
    label: 'Latino per l’educazione linguistica (LEL)',
    pageStart: 80,
    pageEnd: 82,
    segmentIds: ['dm221-offering-lel'],
    schoolOrders: ['secondaria'],
  },
  {
    id: 'LINGUA_INGLESE',
    label: 'Lingua inglese',
    pageStart: 83,
    pageEnd: 90,
    segmentIds: ['dm221-disc-inglese'],
    schoolOrders: ['primaria', 'secondaria'],
  },
  {
    id: 'SECONDA_LINGUA_COMUNITARIA',
    label: 'Seconda lingua comunitaria',
    pageStart: 91,
    pageEnd: 95,
    segmentIds: ['dm221-disc-seconda-lingua'],
    schoolOrders: ['secondaria'],
  },
  {
    id: 'STORIA',
    label: 'Storia',
    pageStart: 96,
    pageEnd: 104,
    segmentIds: ['dm221-disc-storia'],
    schoolOrders: ['primaria', 'secondaria'],
  },
  {
    id: 'GEOGRAFIA',
    label: 'Geografia',
    pageStart: 105,
    pageEnd: 112,
    segmentIds: ['dm221-disc-geografia'],
    schoolOrders: ['primaria', 'secondaria'],
  },
  {
    id: 'STEM',
    label: 'Educazione integrata matematico-scientifico-tecnologica (STEM)',
    pageStart: 113,
    pageEnd: 117,
    segmentIds: ['dm221-framework-stem'],
    schoolOrders: ['primaria', 'secondaria'],
  },
  {
    id: 'MATEMATICA',
    label: 'Matematica',
    pageStart: 118,
    pageEnd: 129,
    segmentIds: ['dm221-disc-matematica'],
    schoolOrders: ['primaria', 'secondaria'],
  },
  {
    id: 'SCIENZE',
    label: 'Scienze',
    pageStart: 130,
    pageEnd: 139,
    segmentIds: ['dm221-disc-scienze'],
    schoolOrders: ['primaria', 'secondaria'],
  },
  {
    id: 'TECNOLOGIA',
    label: 'Tecnologia',
    pageStart: 140,
    pageEnd: 146,
    segmentIds: ['dm221-disc-tecnologia'],
    schoolOrders: ['primaria', 'secondaria'],
  },
  {
    id: 'MUSICA',
    label: 'Musica',
    pageStart: 147,
    pageEnd: 151,
    segmentIds: ['dm221-disc-musica'],
    schoolOrders: ['primaria', 'secondaria'],
  },
  {
    id: 'STRUMENTO_MUSICALE',
    label: 'Strumento musicale',
    pageStart: 152,
    pageEnd: 157,
    segmentIds: ['dm221-offering-strumento-musicale'],
    schoolOrders: ['secondaria'],
  },
  {
    id: 'ARTE_E_IMMAGINE',
    label: 'Arte e immagine',
    pageStart: 158,
    pageEnd: 167,
    segmentIds: ['dm221-disc-arte'],
    schoolOrders: ['primaria', 'secondaria'],
  },
  {
    id: 'EDUCAZIONE_MOTORIA_E_FISICA',
    label: 'Educazione motoria e fisica',
    pageStart: 168,
    pageEnd: 181,
    segmentIds: ['dm221-disc-educazione-motoria', 'dm221-disc-educazione-fisica'],
    schoolOrders: ['primaria', 'secondaria'],
  },
] as const;

export function getDm221FinalPublicationSectionBySegmentId(
  segmentId: string,
): Dm221FinalPublicationSection | undefined {
  return DM221_FINAL_PUBLICATION_SECTIONS.find((section) => section.segmentIds.includes(segmentId));
}

export function getDm221FinalPublicationLocatorBySegmentId(
  segmentId: string,
): NationalSourceLocator | undefined {
  const section = getDm221FinalPublicationSectionBySegmentId(segmentId);
  if (!section) return undefined;

  return {
    sourceId: DM221_2025_SOURCE_ID,
    section: section.label,
    page: section.pageStart,
    note:
      section.pageStart === section.pageEnd
        ? `Edizione finale MIM, marzo 2026, p. ${section.pageStart}; testo non ancora verificato elemento per elemento.`
        : `Edizione finale MIM, marzo 2026, pp. ${section.pageStart}-${section.pageEnd}; testo non ancora verificato elemento per elemento.`,
  };
}
