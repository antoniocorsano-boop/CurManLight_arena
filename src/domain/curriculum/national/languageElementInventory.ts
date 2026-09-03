import type { NationalCurriculumElementBinding, NationalCurriculumElementKind } from './elementBindings';
import { DM221_2025_SOURCE_ID } from './dm2212025';

export type LanguageInventoryId = 'ITALIANO' | 'LEL' | 'LINGUA_INGLESE' | 'SECONDA_LINGUA_COMUNITARIA';

export interface LanguageElementGroupSpec {
  inventoryId: LanguageInventoryId;
  segmentId: string;
  group: string;
  schoolOrder: 'primaria' | 'secondaria';
  elementKind: NationalCurriculumElementKind;
  count: number;
  page: number;
  section: string;
  countingNote?: string;
}

export interface LanguageElementInventoryItem extends NationalCurriculumElementBinding {
  inventoryId: LanguageInventoryId;
  group: string;
  ordinal: number;
}

/**
 * R7C5B2A - inventario strutturale delle quattro sezioni linguistiche della
 * pubblicazione finale MIM (marzo 2026).
 *
 * Regola di conteggio:
 * - competenze attese e obiettivi: una voce per ogni bullet tipografico;
 * - conoscenze bulletizzate: una voce per bullet;
 * - conoscenze narrative: una voce per blocco titolato semanticamente distinto;
 * - nessun testo viene importato o promosso automaticamente.
 */
export const DM221_LANGUAGE_ELEMENT_GROUPS: readonly LanguageElementGroupSpec[] = [
  {
    inventoryId: 'ITALIANO',
    segmentId: 'dm221-disc-italiano',
    group: 'PRIMARY_EXPECTED_COMPETENCES',
    schoolOrder: 'primaria',
    elementKind: 'EXPECTED_COMPETENCE',
    count: 5,
    page: 70,
    section: 'Italiano - Scuola primaria - Competenze attese al termine della classe quinta',
  },
  {
    inventoryId: 'ITALIANO',
    segmentId: 'dm221-disc-italiano',
    group: 'PRIMARY_GRADE3_OBJECTIVES',
    schoolOrder: 'primaria',
    elementKind: 'LEARNING_OBJECTIVE',
    count: 9,
    page: 71,
    section: 'Italiano - Scuola primaria - Obiettivi specifici di apprendimento al termine della classe terza',
  },
  {
    inventoryId: 'ITALIANO',
    segmentId: 'dm221-disc-italiano',
    group: 'PRIMARY_GRADE5_OBJECTIVES',
    schoolOrder: 'primaria',
    elementKind: 'LEARNING_OBJECTIVE',
    count: 6,
    page: 72,
    section: 'Italiano - Scuola primaria - Obiettivi specifici di apprendimento al termine della classe quinta',
  },
  {
    inventoryId: 'ITALIANO',
    segmentId: 'dm221-disc-italiano',
    group: 'PRIMARY_KNOWLEDGE',
    schoolOrder: 'primaria',
    elementKind: 'KNOWLEDGE_OR_CONTENT',
    count: 2,
    page: 73,
    section: 'Italiano - Scuola primaria - Conoscenze',
    countingNote: 'Due blocchi titolati: Lingua e Letteratura.',
  },
  {
    inventoryId: 'ITALIANO',
    segmentId: 'dm221-disc-italiano',
    group: 'LOWER_SECONDARY_EXPECTED_COMPETENCES',
    schoolOrder: 'secondaria',
    elementKind: 'EXPECTED_COMPETENCE',
    count: 5,
    page: 74,
    section: 'Italiano - Scuola secondaria di primo grado - Competenze attese al termine della classe terza',
  },
  {
    inventoryId: 'ITALIANO',
    segmentId: 'dm221-disc-italiano',
    group: 'LOWER_SECONDARY_GRADE3_OBJECTIVES',
    schoolOrder: 'secondaria',
    elementKind: 'LEARNING_OBJECTIVE',
    count: 7,
    page: 75,
    section: 'Italiano - Scuola secondaria di primo grado - Obiettivi specifici di apprendimento al termine della classe terza',
  },
  {
    inventoryId: 'ITALIANO',
    segmentId: 'dm221-disc-italiano',
    group: 'LOWER_SECONDARY_KNOWLEDGE',
    schoolOrder: 'secondaria',
    elementKind: 'KNOWLEDGE_OR_CONTENT',
    count: 2,
    page: 76,
    section: 'Italiano - Scuola secondaria di primo grado - Conoscenze',
    countingNote: 'Due blocchi titolati: Lingua e Letteratura.',
  },

  {
    inventoryId: 'LEL',
    segmentId: 'dm221-offering-lel',
    group: 'LOWER_SECONDARY_EXPECTED_COMPETENCES',
    schoolOrder: 'secondaria',
    elementKind: 'EXPECTED_COMPETENCE',
    count: 5,
    page: 81,
    section: 'Latino per l’educazione linguistica - Competenze attese al termine della classe terza',
  },
  {
    inventoryId: 'LEL',
    segmentId: 'dm221-offering-lel',
    group: 'LOWER_SECONDARY_GRADE3_OBJECTIVES',
    schoolOrder: 'secondaria',
    elementKind: 'LEARNING_OBJECTIVE',
    count: 15,
    page: 81,
    section: 'Latino per l’educazione linguistica - Obiettivi specifici di apprendimento al termine della classe terza',
  },
  {
    inventoryId: 'LEL',
    segmentId: 'dm221-offering-lel',
    group: 'LOWER_SECONDARY_KNOWLEDGE',
    schoolOrder: 'secondaria',
    elementKind: 'KNOWLEDGE_OR_CONTENT',
    count: 1,
    page: 82,
    section: 'Latino per l’educazione linguistica - Conoscenze',
    countingNote: 'Un unico blocco narrativo di conoscenze.',
  },

  {
    inventoryId: 'LINGUA_INGLESE',
    segmentId: 'dm221-disc-inglese',
    group: 'PRIMARY_EXPECTED_COMPETENCES',
    schoolOrder: 'primaria',
    elementKind: 'EXPECTED_COMPETENCE',
    count: 5,
    page: 85,
    section: 'Lingua inglese - Scuola primaria - Competenze attese al termine della classe quinta',
  },
  {
    inventoryId: 'LINGUA_INGLESE',
    segmentId: 'dm221-disc-inglese',
    group: 'PRIMARY_GRADE3_OBJECTIVES',
    schoolOrder: 'primaria',
    elementKind: 'LEARNING_OBJECTIVE',
    count: 10,
    page: 85,
    section: 'Lingua inglese - Scuola primaria - Obiettivi specifici di apprendimento al termine della classe terza',
  },
  {
    inventoryId: 'LINGUA_INGLESE',
    segmentId: 'dm221-disc-inglese',
    group: 'PRIMARY_GRADE5_OBJECTIVES',
    schoolOrder: 'primaria',
    elementKind: 'LEARNING_OBJECTIVE',
    count: 12,
    page: 86,
    section: 'Lingua inglese - Scuola primaria - Obiettivi specifici di apprendimento al termine della classe quinta',
  },
  {
    inventoryId: 'LINGUA_INGLESE',
    segmentId: 'dm221-disc-inglese',
    group: 'PRIMARY_KNOWLEDGE',
    schoolOrder: 'primaria',
    elementKind: 'KNOWLEDGE_OR_CONTENT',
    count: 1,
    page: 87,
    section: 'Lingua inglese - Scuola primaria - Conoscenze',
    countingNote: 'Un unico blocco narrativo di conoscenze.',
  },
  {
    inventoryId: 'LINGUA_INGLESE',
    segmentId: 'dm221-disc-inglese',
    group: 'LOWER_SECONDARY_EXPECTED_COMPETENCES',
    schoolOrder: 'secondaria',
    elementKind: 'EXPECTED_COMPETENCE',
    count: 5,
    page: 87,
    section: 'Lingua inglese - Scuola secondaria di primo grado - Competenze attese al termine della classe terza',
  },
  {
    inventoryId: 'LINGUA_INGLESE',
    segmentId: 'dm221-disc-inglese',
    group: 'LOWER_SECONDARY_GRADE3_OBJECTIVES',
    schoolOrder: 'secondaria',
    elementKind: 'LEARNING_OBJECTIVE',
    count: 17,
    page: 88,
    section: 'Lingua inglese - Scuola secondaria di primo grado - Obiettivi specifici di apprendimento al termine della classe terza',
  },
  {
    inventoryId: 'LINGUA_INGLESE',
    segmentId: 'dm221-disc-inglese',
    group: 'LOWER_SECONDARY_KNOWLEDGE',
    schoolOrder: 'secondaria',
    elementKind: 'KNOWLEDGE_OR_CONTENT',
    count: 1,
    page: 89,
    section: 'Lingua inglese - Scuola secondaria di primo grado - Conoscenze',
    countingNote: 'Un unico blocco narrativo di conoscenze.',
  },

  {
    inventoryId: 'SECONDA_LINGUA_COMUNITARIA',
    segmentId: 'dm221-disc-seconda-lingua',
    group: 'LOWER_SECONDARY_EXPECTED_COMPETENCES',
    schoolOrder: 'secondaria',
    elementKind: 'EXPECTED_COMPETENCE',
    count: 6,
    page: 92,
    section: 'Seconda lingua comunitaria - Competenze attese al termine della classe terza',
  },
  {
    inventoryId: 'SECONDA_LINGUA_COMUNITARIA',
    segmentId: 'dm221-disc-seconda-lingua',
    group: 'LOWER_SECONDARY_OBJECTIVES',
    schoolOrder: 'secondaria',
    elementKind: 'LEARNING_OBJECTIVE',
    count: 13,
    page: 93,
    section: 'Seconda lingua comunitaria - Obiettivi specifici di apprendimento',
  },
  {
    inventoryId: 'SECONDA_LINGUA_COMUNITARIA',
    segmentId: 'dm221-disc-seconda-lingua',
    group: 'LOWER_SECONDARY_KNOWLEDGE',
    schoolOrder: 'secondaria',
    elementKind: 'KNOWLEDGE_OR_CONTENT',
    count: 11,
    page: 94,
    section: 'Seconda lingua comunitaria - Conoscenze',
    countingNote: 'Cinque blocchi generali titolati + sei bullet di approfondimento socio-culturale specifici (2 francese, 2 spagnolo, 2 tedesco).',
  },
] as const;

function createGroup(spec: LanguageElementGroupSpec): LanguageElementInventoryItem[] {
  return Array.from({ length: spec.count }, (_, index) => {
    const ordinal = index + 1;
    const slug = spec.inventoryId.toLowerCase().replace(/_/g, '-');
    const groupSlug = spec.group.toLowerCase().replace(/_/g, '-');
    return {
      elementId: `dm221-lang-${slug}-${groupSlug}-${String(ordinal).padStart(2, '0')}`,
      segmentId: spec.segmentId,
      elementKind: spec.elementKind,
      schoolOrder: spec.schoolOrder,
      sourceLocator: {
        sourceId: DM221_2025_SOURCE_ID,
        section: spec.section,
        page: spec.page,
        note: `Elemento strutturale n. ${ordinal} del gruppo ${spec.group}; testo non importato in R7C5B2A.`,
      },
      sourceBindingStatus: 'SOURCE_LOCATED',
      verifiedByHuman: false,
      canonicalTextStatus: 'SOURCE_LOCATED_ONLY',
      inventoryId: spec.inventoryId,
      group: spec.group,
      ordinal,
      notes: spec.countingNote ?? 'Conteggio strutturale ricontrollato sulla pubblicazione finale; testo non verificato da una persona.',
    } satisfies LanguageElementInventoryItem;
  });
}

export const DM221_LANGUAGE_ELEMENT_INVENTORY: readonly LanguageElementInventoryItem[] =
  DM221_LANGUAGE_ELEMENT_GROUPS.flatMap(createGroup);

export const DM221_LANGUAGE_ELEMENT_COUNTS = Object.freeze(
  Object.fromEntries(
    (['ITALIANO', 'LEL', 'LINGUA_INGLESE', 'SECONDA_LINGUA_COMUNITARIA'] as const).map((inventoryId) => [
      inventoryId,
      DM221_LANGUAGE_ELEMENT_INVENTORY.filter((item) => item.inventoryId === inventoryId).length,
    ]),
  ) as Record<LanguageInventoryId, number>,
);

export function getLanguageInventory(inventoryId: LanguageInventoryId): readonly LanguageElementInventoryItem[] {
  return DM221_LANGUAGE_ELEMENT_INVENTORY.filter((item) => item.inventoryId === inventoryId);
}
