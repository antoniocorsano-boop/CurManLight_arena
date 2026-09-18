import type { NationalCurriculumElementBinding, NationalCurriculumElementKind } from './elementBindings';
import { DM221_2025_SOURCE_ID } from './dm2212025';

const TECHNOLOGY_SEGMENT_ID = 'dm221-disc-tecnologia' as const;

export type TechnologyElementGroup =
  | 'PRIMARY_EXPECTED_COMPETENCES'
  | 'PRIMARY_GRADE3_OBJECTIVES'
  | 'PRIMARY_GRADE5_OBJECTIVES'
  | 'PRIMARY_KNOWLEDGE'
  | 'LOWER_SECONDARY_EXPECTED_COMPETENCES'
  | 'LOWER_SECONDARY_GRADE3_OBJECTIVES'
  | 'LOWER_SECONDARY_KNOWLEDGE';

export interface TechnologyElementInventoryItem extends NationalCurriculumElementBinding {
  group: TechnologyElementGroup;
  ordinal: number;
}

interface GroupSpec {
  group: TechnologyElementGroup;
  schoolOrder: 'primaria' | 'secondaria';
  elementKind: NationalCurriculumElementKind;
  count: number;
  page: number;
  section: string;
}

/**
 * Locator del volume finale MIM stampato a marzo 2026.
 *
 * I numeri indicano la prima pagina stampata in cui compare il gruppo. Alcuni
 * gruppi proseguono nella pagina successiva. R7C5A corregge soltanto i locator:
 * conteggi e testi restano soggetti alla verifica elemento-per-elemento gia'
 * prevista dal contratto di source review.
 */
const GROUPS: readonly GroupSpec[] = [
  {
    group: 'PRIMARY_EXPECTED_COMPETENCES',
    schoolOrder: 'primaria',
    elementKind: 'EXPECTED_COMPETENCE',
    count: 8,
    page: 141,
    section: 'Tecnologia — Scuola primaria — Competenze attese al termine della classe quinta',
  },
  {
    group: 'PRIMARY_GRADE3_OBJECTIVES',
    schoolOrder: 'primaria',
    elementKind: 'LEARNING_OBJECTIVE',
    count: 8,
    page: 142,
    section: 'Tecnologia — Scuola primaria — Obiettivi specifici di apprendimento al termine della classe terza',
  },
  {
    group: 'PRIMARY_GRADE5_OBJECTIVES',
    schoolOrder: 'primaria',
    elementKind: 'LEARNING_OBJECTIVE',
    count: 12,
    page: 143,
    section: 'Tecnologia — Scuola primaria — Obiettivi specifici di apprendimento al termine della classe quinta',
  },
  {
    group: 'PRIMARY_KNOWLEDGE',
    schoolOrder: 'primaria',
    elementKind: 'KNOWLEDGE_OR_CONTENT',
    count: 3,
    page: 143,
    section: 'Tecnologia — Scuola primaria — Conoscenze',
  },
  {
    group: 'LOWER_SECONDARY_EXPECTED_COMPETENCES',
    schoolOrder: 'secondaria',
    elementKind: 'EXPECTED_COMPETENCE',
    count: 8,
    page: 144,
    section: 'Tecnologia — Scuola secondaria di primo grado — Competenze attese al termine della classe terza',
  },
  {
    group: 'LOWER_SECONDARY_GRADE3_OBJECTIVES',
    schoolOrder: 'secondaria',
    elementKind: 'LEARNING_OBJECTIVE',
    count: 18,
    page: 144,
    section: 'Tecnologia — Scuola secondaria di primo grado — Obiettivi specifici di apprendimento al termine della classe terza',
  },
  {
    group: 'LOWER_SECONDARY_KNOWLEDGE',
    schoolOrder: 'secondaria',
    elementKind: 'KNOWLEDGE_OR_CONTENT',
    count: 4,
    page: 145,
    section: 'Tecnologia — Scuola secondaria di primo grado — Conoscenze',
  },
];

function createGroup(spec: GroupSpec): TechnologyElementInventoryItem[] {
  return Array.from({ length: spec.count }, (_, index) => {
    const ordinal = index + 1;
    return {
      elementId: `dm221-tech-${spec.group.toLowerCase()}-${String(ordinal).padStart(2, '0')}`,
      segmentId: TECHNOLOGY_SEGMENT_ID,
      elementKind: spec.elementKind,
      schoolOrder: spec.schoolOrder,
      sourceLocator: {
        sourceId: DM221_2025_SOURCE_ID,
        section: spec.section,
        page: spec.page,
        note: `Elemento n. ${ordinal} nel gruppo ${spec.group}; locator riallineato al volume finale MIM di marzo 2026; testo non importato in questa tranche.`,
      },
      sourceBindingStatus: 'SOURCE_LOCATED',
      verifiedByHuman: false,
      canonicalTextStatus: 'SOURCE_LOCATED_ONLY',
      group: spec.group,
      ordinal,
      notes: 'Inventario strutturale localizzato nella fonte finale; richiede verifica umana del singolo testo prima di SOURCE_VERIFIED/HUMAN_VERIFIED_SOURCE_TEXT.',
    } satisfies TechnologyElementInventoryItem;
  });
}

export const DM221_TECHNOLOGY_ELEMENT_INVENTORY: readonly TechnologyElementInventoryItem[] = GROUPS.flatMap(createGroup);

export const DM221_TECHNOLOGY_ELEMENT_COUNTS = Object.freeze(
  Object.fromEntries(GROUPS.map((group) => [group.group, group.count])) as Record<TechnologyElementGroup, number>,
);

export const DM221_TECHNOLOGY_ELEMENT_START_PAGES = Object.freeze(
  Object.fromEntries(GROUPS.map((group) => [group.group, group.page])) as Record<TechnologyElementGroup, number>,
);

export function getTechnologyInventoryGroup(group: TechnologyElementGroup): readonly TechnologyElementInventoryItem[] {
  return DM221_TECHNOLOGY_ELEMENT_INVENTORY.filter((item) => item.group === group);
}
