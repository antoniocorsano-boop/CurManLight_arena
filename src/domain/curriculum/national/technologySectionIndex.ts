import type { NationalSourceLocator } from './dm2212025';
import { DM221_2025_SOURCE_ID } from './dm2212025';

export type TechnologySectionId =
  | 'RATIONALE'
  | 'PRIMARY_EXPECTED_COMPETENCES'
  | 'PRIMARY_GRADE3_OBJECTIVES'
  | 'PRIMARY_GRADE5_OBJECTIVES'
  | 'PRIMARY_KNOWLEDGE'
  | 'LOWER_SECONDARY_EXPECTED_COMPETENCES'
  | 'LOWER_SECONDARY_GRADE3_OBJECTIVES'
  | 'LOWER_SECONDARY_KNOWLEDGE';

export interface TechnologySectionIndexEntry {
  id: TechnologySectionId;
  schoolOrder: 'primaria' | 'secondaria' | 'primaria+secondaria';
  title: string;
  sourceLocator: NationalSourceLocator;
  sourceBindingStatus: 'SOURCE_LOCATED';
  verifiedByHuman: false;
  canonicalTextStatus: 'SOURCE_LOCATED_ONLY';
  notes: string;
}

const located = (
  id: TechnologySectionId,
  schoolOrder: TechnologySectionIndexEntry['schoolOrder'],
  title: string,
  page: number,
  section: string,
  notes: string,
): TechnologySectionIndexEntry => ({
  id,
  schoolOrder,
  title,
  sourceLocator: {
    sourceId: DM221_2025_SOURCE_ID,
    section,
    page,
    note: notes,
  },
  sourceBindingStatus: 'SOURCE_LOCATED',
  verifiedByHuman: false,
  canonicalTextStatus: 'SOURCE_LOCATED_ONLY',
  notes,
});

/**
 * Indice di localizzazione della sezione Tecnologia del D.M. 221/2025.
 *
 * I locator sono verificati contro la pubblicazione ufficiale in Gazzetta
 * Ufficiale, ma restano intenzionalmente SOURCE_LOCATED: questo indice non
 * attesta ancora che ogni singolo testo sia stato verificato da una persona.
 */
export const DM221_TECHNOLOGY_SECTION_INDEX: readonly TechnologySectionIndexEntry[] = [
  located(
    'RATIONALE',
    'primaria+secondaria',
    'Perché si studia Tecnologia',
    96,
    'Tecnologia — Perché si studia Tecnologia',
    'La sezione Tecnologia inizia a p. 96 della pubblicazione ufficiale; la premessa comprende continuità primaria-secondaria e integrazione dell’informatica.',
  ),
  located(
    'PRIMARY_EXPECTED_COMPETENCES',
    'primaria',
    'Competenze attese al termine della classe quinta',
    96,
    'Tecnologia — Scuola primaria — Competenze attese al termine della classe quinta',
    'La sezione primaria inizia a p. 96 e prosegue a p. 97.',
  ),
  located(
    'PRIMARY_GRADE3_OBJECTIVES',
    'primaria',
    'Obiettivi specifici di apprendimento al termine della classe terza',
    97,
    'Tecnologia — Scuola primaria — Obiettivi specifici di apprendimento al termine della classe terza',
    'Comprende Vedere e osservare, Prevedere e immaginare, Intervenire e trasformare e obiettivi di Informatica.',
  ),
  located(
    'PRIMARY_GRADE5_OBJECTIVES',
    'primaria',
    'Obiettivi specifici di apprendimento al termine della classe quinta',
    97,
    'Tecnologia — Scuola primaria — Obiettivi specifici di apprendimento al termine della classe quinta',
    'Comprende i tre nuclei fondanti e Informatica.',
  ),
  located(
    'PRIMARY_KNOWLEDGE',
    'primaria',
    'Conoscenze',
    97,
    'Tecnologia — Scuola primaria — Conoscenze',
    'La sezione termina tra p. 97 e p. 98.',
  ),
  located(
    'LOWER_SECONDARY_EXPECTED_COMPETENCES',
    'secondaria',
    'Competenze attese al termine della classe terza',
    98,
    'Tecnologia — Scuola secondaria di primo grado — Competenze attese al termine della classe terza',
    'La sezione secondaria inizia a p. 98.',
  ),
  located(
    'LOWER_SECONDARY_GRADE3_OBJECTIVES',
    'secondaria',
    'Obiettivi specifici di apprendimento al termine della classe terza',
    98,
    'Tecnologia — Scuola secondaria di primo grado — Obiettivi specifici di apprendimento al termine della classe terza',
    'Comprende Vedere, osservare e sperimentare; Prevedere, immaginare e progettare; Intervenire, trasformare e produrre; Informatica.',
  ),
  located(
    'LOWER_SECONDARY_KNOWLEDGE',
    'secondaria',
    'Conoscenze',
    98,
    'Tecnologia — Scuola secondaria di primo grado — Conoscenze',
    'La sezione Conoscenze inizia a p. 98 e prosegue nelle pagine successive.',
  ),
];

export function getTechnologySectionIndexEntry(id: TechnologySectionId): TechnologySectionIndexEntry {
  const entry = DM221_TECHNOLOGY_SECTION_INDEX.find((candidate) => candidate.id === id);
  if (!entry) throw new Error(`UNKNOWN_DM221_TECHNOLOGY_SECTION: ${id}`);
  return entry;
}
