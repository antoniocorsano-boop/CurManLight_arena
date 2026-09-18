import type { NationalCurriculumElementBinding, NationalCurriculumElementKind } from './elementBindings';
import { DM221_2025_SOURCE_ID } from './dm2212025';

export type R7C5B2CInventoryId =
  | 'INFANZIA_GENERAL_FRAMEWORK'
  | 'MUSICA'
  | 'STRUMENTO_MUSICALE'
  | 'ARTE_E_IMMAGINE'
  | 'EDUCAZIONE_MOTORIA'
  | 'EDUCAZIONE_FISICA';

export interface R7C5B2CGroupSpec {
  inventoryId: R7C5B2CInventoryId;
  segmentId: string;
  group: string;
  schoolOrder: 'infanzia' | 'primaria' | 'secondaria';
  elementKind: NationalCurriculumElementKind;
  count: number;
  page: number;
  section: string;
  countingNote?: string;
}

export interface R7C5B2CInventoryItem extends NationalCurriculumElementBinding {
  inventoryId: R7C5B2CInventoryId;
  group: string;
  ordinal: number;
}

/**
 * R7C5B2C chiude l'inventario strutturale della pubblicazione finale MIM.
 * Il conteggio conserva la forma nativa della fonte e non attribuisce autorità
 * al testo: tutti gli elementi restano SOURCE_LOCATED_ONLY finché una persona
 * non verifica il testo ufficiale elemento per elemento.
 */
export const DM221_R7C5B2C_ELEMENT_GROUPS: readonly R7C5B2CGroupSpec[] = [
  // Quadro generale infanzia: cinque blocchi narrativi prima del primo campo.
  {
    inventoryId: 'INFANZIA_GENERAL_FRAMEWORK',
    segmentId: 'dm221-infanzia-general-framework',
    group: 'IDENTITY_AND_GENERAL_FINALITIES',
    schoolOrder: 'infanzia',
    elementKind: 'GENERAL_FRAMEWORK',
    count: 1,
    page: 53,
    section: 'Indicazioni nazionali per la scuola dell’infanzia - identità, finalità e funzione sociale',
  },
  {
    inventoryId: 'INFANZIA_GENERAL_FRAMEWORK',
    segmentId: 'dm221-infanzia-general-framework',
    group: 'CONTEMPORARY_CHALLENGES',
    schoolOrder: 'infanzia',
    elementKind: 'GENERAL_FRAMEWORK',
    count: 1,
    page: 54,
    section: 'La scuola dell’infanzia di fronte alle sfide del tempo',
  },
  {
    inventoryId: 'INFANZIA_GENERAL_FRAMEWORK',
    segmentId: 'dm221-infanzia-general-framework',
    group: 'PLAY',
    schoolOrder: 'infanzia',
    elementKind: 'GENERAL_FRAMEWORK',
    count: 1,
    page: 54,
    section: 'Il gioco',
  },
  {
    inventoryId: 'INFANZIA_GENERAL_FRAMEWORK',
    segmentId: 'dm221-infanzia-general-framework',
    group: 'FIELDS_FRAMEWORK',
    schoolOrder: 'infanzia',
    elementKind: 'GENERAL_FRAMEWORK',
    count: 1,
    page: 55,
    section: 'I campi di esperienza - quadro generale',
    countingNote: 'Il blocco descrive il costrutto dei campi e la loro funzione; i cinque campi concreti sono inventariati separatamente e non vengono duplicati qui.',
  },
  {
    inventoryId: 'INFANZIA_GENERAL_FRAMEWORK',
    segmentId: 'dm221-infanzia-general-framework',
    group: 'TEACHER_PROFESSIONALITY',
    schoolOrder: 'infanzia',
    elementKind: 'GENERAL_FRAMEWORK',
    count: 1,
    page: 56,
    section: 'La professionalità dell’insegnante di scuola dell’infanzia',
    countingNote: 'La sezione inizia a p. 56 e prosegue a p. 57 fino a prima del primo campo di esperienza.',
  },

  // MUSICA — 50
  { inventoryId: 'MUSICA', segmentId: 'dm221-disc-musica', group: 'PRIMARY_EXPECTED_COMPETENCES', schoolOrder: 'primaria', elementKind: 'EXPECTED_COMPETENCE', count: 4, page: 148, section: 'Musica - Scuola primaria - Competenze attese al termine della classe quinta' },
  { inventoryId: 'MUSICA', segmentId: 'dm221-disc-musica', group: 'PRIMARY_GRADE3_OBJECTIVES', schoolOrder: 'primaria', elementKind: 'LEARNING_OBJECTIVE', count: 7, page: 148, section: 'Musica - Scuola primaria - Obiettivi specifici di apprendimento al termine della classe terza' },
  { inventoryId: 'MUSICA', segmentId: 'dm221-disc-musica', group: 'PRIMARY_GRADE5_OBJECTIVES', schoolOrder: 'primaria', elementKind: 'LEARNING_OBJECTIVE', count: 9, page: 149, section: 'Musica - Scuola primaria - Obiettivi specifici di apprendimento al termine della classe quinta', countingNote: 'Include la riga tipograficamente bulletizzata “Conoscenza storico-culturale della musica”; non viene silently riclassificata come intestazione.' },
  { inventoryId: 'MUSICA', segmentId: 'dm221-disc-musica', group: 'PRIMARY_KNOWLEDGE', schoolOrder: 'primaria', elementKind: 'KNOWLEDGE_OR_CONTENT', count: 7, page: 149, section: 'Musica - Scuola primaria - Conoscenze' },
  { inventoryId: 'MUSICA', segmentId: 'dm221-disc-musica', group: 'LOWER_SECONDARY_EXPECTED_COMPETENCES', schoolOrder: 'secondaria', elementKind: 'EXPECTED_COMPETENCE', count: 5, page: 150, section: 'Musica - Scuola secondaria di primo grado - Competenze attese al termine della classe terza' },
  { inventoryId: 'MUSICA', segmentId: 'dm221-disc-musica', group: 'LOWER_SECONDARY_GRADE3_OBJECTIVES', schoolOrder: 'secondaria', elementKind: 'LEARNING_OBJECTIVE', count: 11, page: 150, section: 'Musica - Scuola secondaria di primo grado - Obiettivi specifici di apprendimento al termine della classe terza' },
  { inventoryId: 'MUSICA', segmentId: 'dm221-disc-musica', group: 'LOWER_SECONDARY_KNOWLEDGE', schoolOrder: 'secondaria', elementKind: 'KNOWLEDGE_OR_CONTENT', count: 7, page: 151, section: 'Musica - Scuola secondaria di primo grado - Conoscenze' },

  // STRUMENTO MUSICALE — 53
  { inventoryId: 'STRUMENTO_MUSICALE', segmentId: 'dm221-offering-strumento-musicale', group: 'LOWER_SECONDARY_EXPECTED_COMPETENCES', schoolOrder: 'secondaria', elementKind: 'EXPECTED_COMPETENCE', count: 4, page: 153, section: 'Strumento musicale - Competenze attese al termine della classe terza' },
  { inventoryId: 'STRUMENTO_MUSICALE', segmentId: 'dm221-offering-strumento-musicale', group: 'GENERAL_GRADE3_OBJECTIVES', schoolOrder: 'secondaria', elementKind: 'LEARNING_OBJECTIVE', count: 16, page: 153, section: 'Strumento musicale - Obiettivi specifici di apprendimento al termine della classe terza', countingNote: '4 percezione/analisi + 2 decodifica + 4 esecuzione/interpretazione + 6 collaborazione/esplorazione/interazione.' },
  { inventoryId: 'STRUMENTO_MUSICALE', segmentId: 'dm221-offering-strumento-musicale', group: 'DI176_STRING_BOWED_OBJECTIVES', schoolOrder: 'secondaria', elementKind: 'LEARNING_OBJECTIVE', count: 8, page: 154, section: 'Strumento musicale - modifica D.I. 176/2022 - Strumenti ad arco' },
  { inventoryId: 'STRUMENTO_MUSICALE', segmentId: 'dm221-offering-strumento-musicale', group: 'DI176_WIND_OBJECTIVES', schoolOrder: 'secondaria', elementKind: 'LEARNING_OBJECTIVE', count: 7, page: 155, section: 'Strumento musicale - modifica D.I. 176/2022 - Strumenti a fiato' },
  { inventoryId: 'STRUMENTO_MUSICALE', segmentId: 'dm221-offering-strumento-musicale', group: 'DI176_KEYBOARD_PERCUSSION_OBJECTIVES', schoolOrder: 'secondaria', elementKind: 'LEARNING_OBJECTIVE', count: 7, page: 155, section: 'Strumento musicale - modifica D.I. 176/2022 - Strumenti a tastiera e percussioni' },
  { inventoryId: 'STRUMENTO_MUSICALE', segmentId: 'dm221-offering-strumento-musicale', group: 'DI176_PLUCKED_STRING_OBJECTIVES', schoolOrder: 'secondaria', elementKind: 'LEARNING_OBJECTIVE', count: 6, page: 156, section: 'Strumento musicale - modifica D.I. 176/2022 - Strumenti a corde pizzicate' },
  { inventoryId: 'STRUMENTO_MUSICALE', segmentId: 'dm221-offering-strumento-musicale', group: 'LOWER_SECONDARY_KNOWLEDGE', schoolOrder: 'secondaria', elementKind: 'KNOWLEDGE_OR_CONTENT', count: 5, page: 156, section: 'Strumento musicale - Conoscenze' },

  // ARTE E IMMAGINE — 61
  { inventoryId: 'ARTE_E_IMMAGINE', segmentId: 'dm221-disc-arte', group: 'PRIMARY_EXPECTED_COMPETENCES', schoolOrder: 'primaria', elementKind: 'EXPECTED_COMPETENCE', count: 4, page: 161, section: 'Arte e immagine - Scuola primaria - Competenze attese al termine della classe quinta' },
  { inventoryId: 'ARTE_E_IMMAGINE', segmentId: 'dm221-disc-arte', group: 'PRIMARY_GRADE3_OBJECTIVES', schoolOrder: 'primaria', elementKind: 'LEARNING_OBJECTIVE', count: 12, page: 162, section: 'Arte e immagine - Scuola primaria - Obiettivi specifici di apprendimento al termine della classe terza' },
  { inventoryId: 'ARTE_E_IMMAGINE', segmentId: 'dm221-disc-arte', group: 'PRIMARY_GRADE5_OBJECTIVES', schoolOrder: 'primaria', elementKind: 'LEARNING_OBJECTIVE', count: 12, page: 163, section: 'Arte e immagine - Scuola primaria - Obiettivi specifici di apprendimento al termine della classe quinta' },
  { inventoryId: 'ARTE_E_IMMAGINE', segmentId: 'dm221-disc-arte', group: 'PRIMARY_KNOWLEDGE', schoolOrder: 'primaria', elementKind: 'KNOWLEDGE_OR_CONTENT', count: 10, page: 164, section: 'Arte e immagine - Scuola primaria - Conoscenze' },
  { inventoryId: 'ARTE_E_IMMAGINE', segmentId: 'dm221-disc-arte', group: 'LOWER_SECONDARY_EXPECTED_COMPETENCES', schoolOrder: 'secondaria', elementKind: 'EXPECTED_COMPETENCE', count: 4, page: 164, section: 'Arte e immagine - Scuola secondaria di primo grado - Competenze attese al termine della classe terza' },
  { inventoryId: 'ARTE_E_IMMAGINE', segmentId: 'dm221-disc-arte', group: 'LOWER_SECONDARY_GRADE3_OBJECTIVES', schoolOrder: 'secondaria', elementKind: 'LEARNING_OBJECTIVE', count: 10, page: 165, section: 'Arte e immagine - Scuola secondaria di primo grado - Obiettivi specifici di apprendimento al termine della classe terza' },
  { inventoryId: 'ARTE_E_IMMAGINE', segmentId: 'dm221-disc-arte', group: 'LOWER_SECONDARY_KNOWLEDGE', schoolOrder: 'secondaria', elementKind: 'KNOWLEDGE_OR_CONTENT', count: 9, page: 166, section: 'Arte e immagine - Scuola secondaria di primo grado - Conoscenze' },

  // EDUCAZIONE MOTORIA PRIMARIA — 38
  { inventoryId: 'EDUCAZIONE_MOTORIA', segmentId: 'dm221-disc-educazione-motoria', group: 'PRIMARY_EXPECTED_COMPETENCES', schoolOrder: 'primaria', elementKind: 'EXPECTED_COMPETENCE', count: 5, page: 170, section: 'Educazione motoria - Scuola primaria - Competenze attese al termine della classe quinta' },
  { inventoryId: 'EDUCAZIONE_MOTORIA', segmentId: 'dm221-disc-educazione-motoria', group: 'PRIMARY_GRADE3_OBJECTIVES', schoolOrder: 'primaria', elementKind: 'LEARNING_OBJECTIVE', count: 11, page: 170, section: 'Educazione motoria - Scuola primaria - Obiettivi specifici di apprendimento al termine della classe terza' },
  { inventoryId: 'EDUCAZIONE_MOTORIA', segmentId: 'dm221-disc-educazione-motoria', group: 'PRIMARY_GRADE5_OBJECTIVES', schoolOrder: 'primaria', elementKind: 'LEARNING_OBJECTIVE', count: 14, page: 171, section: 'Educazione motoria - Scuola primaria - Obiettivi specifici di apprendimento al termine della classe quinta', countingNote: 'Include la riga tipograficamente bulletizzata sugli strumenti di valutazione/autovalutazione; il ledger non la corregge semanticamente.' },
  { inventoryId: 'EDUCAZIONE_MOTORIA', segmentId: 'dm221-disc-educazione-motoria', group: 'PRIMARY_KNOWLEDGE', schoolOrder: 'primaria', elementKind: 'KNOWLEDGE_OR_CONTENT', count: 8, page: 172, section: 'Educazione motoria - Scuola primaria - Conoscenze' },

  // EDUCAZIONE FISICA SECONDARIA — 27
  { inventoryId: 'EDUCAZIONE_FISICA', segmentId: 'dm221-disc-educazione-fisica', group: 'LOWER_SECONDARY_EXPECTED_COMPETENCES', schoolOrder: 'secondaria', elementKind: 'EXPECTED_COMPETENCE', count: 5, page: 172, section: 'Educazione fisica - Scuola secondaria di primo grado - Competenze attese al termine della classe terza' },
  { inventoryId: 'EDUCAZIONE_FISICA', segmentId: 'dm221-disc-educazione-fisica', group: 'LOWER_SECONDARY_GRADE3_OBJECTIVES', schoolOrder: 'secondaria', elementKind: 'LEARNING_OBJECTIVE', count: 16, page: 173, section: 'Educazione fisica - Scuola secondaria di primo grado - Obiettivi specifici di apprendimento al termine della classe terza' },
  { inventoryId: 'EDUCAZIONE_FISICA', segmentId: 'dm221-disc-educazione-fisica', group: 'LOWER_SECONDARY_KNOWLEDGE', schoolOrder: 'secondaria', elementKind: 'KNOWLEDGE_OR_CONTENT', count: 6, page: 174, section: 'Educazione fisica - Scuola secondaria di primo grado - Conoscenze', countingNote: 'La frase introduttiva non bulletizzata sulle attività sportive/cognitive non viene trasformata artificialmente in un settimo item; vengono contati i sei bullet tipografici.' },
] as const;

function createGroup(spec: R7C5B2CGroupSpec): R7C5B2CInventoryItem[] {
  return Array.from({ length: spec.count }, (_, index) => {
    const ordinal = index + 1;
    const inventorySlug = spec.inventoryId.toLowerCase().replace(/_/g, '-');
    const groupSlug = spec.group.toLowerCase().replace(/_/g, '-');
    return {
      elementId: `dm221-b2c-${inventorySlug}-${groupSlug}-${String(ordinal).padStart(2, '0')}`,
      segmentId: spec.segmentId,
      elementKind: spec.elementKind,
      schoolOrder: spec.schoolOrder,
      sourceLocator: {
        sourceId: DM221_2025_SOURCE_ID,
        section: spec.section,
        page: spec.page,
        note: `Elemento strutturale n. ${ordinal} del gruppo ${spec.group}; testo non importato in R7C5B2C.`,
      },
      sourceBindingStatus: 'SOURCE_LOCATED',
      verifiedByHuman: false,
      canonicalTextStatus: 'SOURCE_LOCATED_ONLY',
      inventoryId: spec.inventoryId,
      group: spec.group,
      ordinal,
      notes: spec.countingNote ?? 'Conteggio strutturale ricontrollato sulla pubblicazione finale; testo non verificato da una persona.',
    } satisfies R7C5B2CInventoryItem;
  });
}

export const DM221_R7C5B2C_ELEMENT_INVENTORY: readonly R7C5B2CInventoryItem[] =
  DM221_R7C5B2C_ELEMENT_GROUPS.flatMap(createGroup);

export const DM221_R7C5B2C_ELEMENT_COUNTS = Object.freeze(
  Object.fromEntries(
    (
      [
        'INFANZIA_GENERAL_FRAMEWORK',
        'MUSICA',
        'STRUMENTO_MUSICALE',
        'ARTE_E_IMMAGINE',
        'EDUCAZIONE_MOTORIA',
        'EDUCAZIONE_FISICA',
      ] as const
    ).map((inventoryId) => [
      inventoryId,
      DM221_R7C5B2C_ELEMENT_INVENTORY.filter((item) => item.inventoryId === inventoryId).length,
    ]),
  ) as Record<R7C5B2CInventoryId, number>,
);

export function getR7C5B2CInventory(inventoryId: R7C5B2CInventoryId): readonly R7C5B2CInventoryItem[] {
  return DM221_R7C5B2C_ELEMENT_INVENTORY.filter((item) => item.inventoryId === inventoryId);
}
