import type { NationalCurriculumElementBinding, NationalCurriculumElementKind } from './elementBindings';
import { DM221_2025_SOURCE_ID } from './dm2212025';

export type R7C5B2BInventoryId = 'STORIA' | 'GEOGRAFIA' | 'STEM' | 'MATEMATICA' | 'SCIENZE';

export interface R7C5B2BGroupSpec {
  inventoryId: R7C5B2BInventoryId;
  segmentId: string;
  group: string;
  schoolOrder: 'primaria' | 'secondaria';
  elementKind: NationalCurriculumElementKind;
  count: number;
  page: number;
  section: string;
  countingNote?: string;
}

export interface R7C5B2BInventoryItem extends NationalCurriculumElementBinding {
  inventoryId: R7C5B2BInventoryId;
  group: string;
  ordinal: number;
}

/**
 * R7C5B2B - inventario strutturale ricontato sulla pubblicazione finale MIM
 * (marzo 2026) per Storia, Geografia, quadro STEM, Matematica e Scienze.
 *
 * Regola generale:
 * - un elemento per ogni bullet tipografico di competenze/obiettivi/conoscenze;
 * - nelle conoscenze narrative senza bullet, un elemento per ogni paragrafo
 *   semanticamente autonomo visivamente separato nella fonte;
 * - il quadro STEM conserva identità CROSS_DISCIPLINARY_FRAMEWORK e viene
 *   inventariato per blocchi narrativi nativi + cinque bullet di innovazione;
 * - nessun testo è importato o promosso automaticamente.
 */
export const DM221_R7C5B2B_ELEMENT_GROUPS: readonly R7C5B2BGroupSpec[] = [
  // STORIA — 93
  { inventoryId: 'STORIA', segmentId: 'dm221-disc-storia', group: 'PRIMARY_EXPECTED_COMPETENCES', schoolOrder: 'primaria', elementKind: 'EXPECTED_COMPETENCE', count: 4, page: 99, section: 'Storia - Scuola primaria - Competenze attese al termine della classe quinta' },
  { inventoryId: 'STORIA', segmentId: 'dm221-disc-storia', group: 'PRIMARY_GRADE3_OBJECTIVES', schoolOrder: 'primaria', elementKind: 'LEARNING_OBJECTIVE', count: 3, page: 100, section: 'Storia - Scuola primaria - Obiettivi specifici di apprendimento al termine della classe terza' },
  { inventoryId: 'STORIA', segmentId: 'dm221-disc-storia', group: 'PRIMARY_GRADE5_OBJECTIVES', schoolOrder: 'primaria', elementKind: 'LEARNING_OBJECTIVE', count: 4, page: 100, section: 'Storia - Scuola primaria - Obiettivi specifici di apprendimento al termine della classe quinta' },
  { inventoryId: 'STORIA', segmentId: 'dm221-disc-storia', group: 'PRIMARY_KNOWLEDGE', schoolOrder: 'primaria', elementKind: 'KNOWLEDGE_OR_CONTENT', count: 36, page: 100, section: 'Storia - Scuola primaria - Conoscenze', countingNote: '36 bullet di contenuto: 10 per I-II anno, 5 per III, 11 per IV, 10 per V.' },
  { inventoryId: 'STORIA', segmentId: 'dm221-disc-storia', group: 'LOWER_SECONDARY_EXPECTED_COMPETENCES', schoolOrder: 'secondaria', elementKind: 'EXPECTED_COMPETENCE', count: 3, page: 102, section: 'Storia - Scuola secondaria di primo grado - Competenze attese al termine della classe terza' },
  { inventoryId: 'STORIA', segmentId: 'dm221-disc-storia', group: 'LOWER_SECONDARY_GRADE3_OBJECTIVES', schoolOrder: 'secondaria', elementKind: 'LEARNING_OBJECTIVE', count: 5, page: 102, section: 'Storia - Scuola secondaria di primo grado - Obiettivi specifici di apprendimento al termine della classe terza' },
  { inventoryId: 'STORIA', segmentId: 'dm221-disc-storia', group: 'LOWER_SECONDARY_KNOWLEDGE', schoolOrder: 'secondaria', elementKind: 'KNOWLEDGE_OR_CONTENT', count: 38, page: 102, section: 'Storia - Scuola secondaria di primo grado - Conoscenze', countingNote: '38 bullet di contenuto: 14 per I anno, 10 per II, 14 per III.' },

  // GEOGRAFIA — 81
  { inventoryId: 'GEOGRAFIA', segmentId: 'dm221-disc-geografia', group: 'PRIMARY_EXPECTED_COMPETENCES', schoolOrder: 'primaria', elementKind: 'EXPECTED_COMPETENCE', count: 5, page: 106, section: 'Geografia - Scuola primaria - Competenze attese al termine della classe quinta' },
  { inventoryId: 'GEOGRAFIA', segmentId: 'dm221-disc-geografia', group: 'PRIMARY_GRADE3_OBJECTIVES', schoolOrder: 'primaria', elementKind: 'LEARNING_OBJECTIVE', count: 17, page: 107, section: 'Geografia - Scuola primaria - Obiettivi specifici di apprendimento al termine della classe terza', countingNote: '3 Orientamento + 3 Linguaggio + 3 Paesaggio e territorio + 4 Relazioni e dinamiche + 4 Organizzazione territoriale.' },
  { inventoryId: 'GEOGRAFIA', segmentId: 'dm221-disc-geografia', group: 'PRIMARY_GRADE5_OBJECTIVES', schoolOrder: 'primaria', elementKind: 'LEARNING_OBJECTIVE', count: 14, page: 108, section: 'Geografia - Scuola primaria - Obiettivi specifici di apprendimento al termine della classe quinta', countingNote: '3 Orientamento + 2 Linguaggio + 3 Paesaggio e territorio + 3 Relazioni e dinamiche + 3 Organizzazione territoriale.' },
  { inventoryId: 'GEOGRAFIA', segmentId: 'dm221-disc-geografia', group: 'PRIMARY_KNOWLEDGE', schoolOrder: 'primaria', elementKind: 'KNOWLEDGE_OR_CONTENT', count: 6, page: 109, section: 'Geografia - Scuola primaria - Conoscenze', countingNote: 'Sei paragrafi autonomi visivamente separati nella fonte, senza bullet tipografici.' },
  { inventoryId: 'GEOGRAFIA', segmentId: 'dm221-disc-geografia', group: 'LOWER_SECONDARY_EXPECTED_COMPETENCES', schoolOrder: 'secondaria', elementKind: 'EXPECTED_COMPETENCE', count: 4, page: 110, section: 'Geografia - Scuola secondaria di primo grado - Competenze attese al termine della classe terza' },
  { inventoryId: 'GEOGRAFIA', segmentId: 'dm221-disc-geografia', group: 'LOWER_SECONDARY_GRADE3_OBJECTIVES', schoolOrder: 'secondaria', elementKind: 'LEARNING_OBJECTIVE', count: 25, page: 110, section: 'Geografia - Scuola secondaria di primo grado - Obiettivi specifici di apprendimento al termine della classe terza', countingNote: '5 Orientamento + 3 Linguaggio + 6 Paesaggio e territorio + 6 Relazioni e dinamiche + 5 Organizzazione territoriale.' },
  { inventoryId: 'GEOGRAFIA', segmentId: 'dm221-disc-geografia', group: 'LOWER_SECONDARY_KNOWLEDGE', schoolOrder: 'secondaria', elementKind: 'KNOWLEDGE_OR_CONTENT', count: 10, page: 112, section: 'Geografia - Scuola secondaria di primo grado - Conoscenze', countingNote: 'Dieci paragrafi autonomi visivamente separati nella fonte, senza bullet tipografici.' },

  // STEM — 8, framework non disciplinare
  { inventoryId: 'STEM', segmentId: 'dm221-framework-stem', group: 'GENERAL_FRAMEWORK_NARRATIVE', schoolOrder: 'primaria', elementKind: 'CROSS_DISCIPLINARY_FRAMEWORK', count: 1, page: 113, section: 'Educazione integrata matematico-scientifico-tecnologica (STEM) - quadro generale', countingNote: 'Blocco narrativo generale pp. 113-114, registrato come framework e non come disciplina.' },
  { inventoryId: 'STEM', segmentId: 'dm221-framework-stem', group: 'PRIMARY_GUIDANCE_NARRATIVE', schoolOrder: 'primaria', elementKind: 'CROSS_DISCIPLINARY_FRAMEWORK', count: 1, page: 114, section: 'STEM - Scuola primaria', countingNote: 'Blocco narrativo specifico per la scuola primaria.' },
  { inventoryId: 'STEM', segmentId: 'dm221-framework-stem', group: 'LOWER_SECONDARY_GUIDANCE_NARRATIVE', schoolOrder: 'secondaria', elementKind: 'CROSS_DISCIPLINARY_FRAMEWORK', count: 1, page: 115, section: 'STEM - Scuola secondaria di primo grado', countingNote: 'Blocco narrativo specifico per la scuola secondaria di primo grado.' },
  { inventoryId: 'STEM', segmentId: 'dm221-framework-stem', group: 'INNOVATIVE_ASPECTS', schoolOrder: 'secondaria', elementKind: 'CROSS_DISCIPLINARY_FRAMEWORK', count: 5, page: 116, section: 'STEM - Aspetti innovativi degli obiettivi di apprendimento', countingNote: 'Cinque bullet tipografici: informatica, integrazione disciplinare, laboratorio, educazione civica, prospettiva storica.' },

  // MATEMATICA — 78
  { inventoryId: 'MATEMATICA', segmentId: 'dm221-disc-matematica', group: 'PRIMARY_EXPECTED_COMPETENCES', schoolOrder: 'primaria', elementKind: 'EXPECTED_COMPETENCE', count: 8, page: 121, section: 'Matematica - Scuola primaria - Competenze attese al termine della classe quinta', countingNote: '6 competenze matematiche + 2 bullet esplicitamente sotto Per Informatica.' },
  { inventoryId: 'MATEMATICA', segmentId: 'dm221-disc-matematica', group: 'PRIMARY_GRADE3_OBJECTIVES', schoolOrder: 'primaria', elementKind: 'LEARNING_OBJECTIVE', count: 11, page: 122, section: 'Matematica - Scuola primaria - Obiettivi specifici di apprendimento al termine della classe terza', countingNote: '4 Numeri + 3 Spazio e figure + 2 Relazioni, dati e previsioni + 2 Informatica.' },
  { inventoryId: 'MATEMATICA', segmentId: 'dm221-disc-matematica', group: 'PRIMARY_GRADE5_OBJECTIVES', schoolOrder: 'primaria', elementKind: 'LEARNING_OBJECTIVE', count: 14, page: 122, section: 'Matematica - Scuola primaria - Obiettivi specifici di apprendimento al termine della classe quinta', countingNote: '5 Numeri + 4 Spazio e figure + 3 Relazioni, dati e previsioni + 2 Informatica.' },
  { inventoryId: 'MATEMATICA', segmentId: 'dm221-disc-matematica', group: 'PRIMARY_KNOWLEDGE', schoolOrder: 'primaria', elementKind: 'KNOWLEDGE_OR_CONTENT', count: 4, page: 124, section: 'Matematica - Scuola primaria - Conoscenze', countingNote: 'Quattro bullet titolati: Numeri; Spazio e figure; Relazioni, dati e previsioni/funzioni; Informatica.' },
  { inventoryId: 'MATEMATICA', segmentId: 'dm221-disc-matematica', group: 'LOWER_SECONDARY_EXPECTED_COMPETENCES', schoolOrder: 'secondaria', elementKind: 'EXPECTED_COMPETENCE', count: 8, page: 125, section: 'Matematica - Scuola secondaria di primo grado - Competenze attese al termine della classe terza', countingNote: '7 competenze matematiche + 1 bullet sotto Per Informatica.' },
  { inventoryId: 'MATEMATICA', segmentId: 'dm221-disc-matematica', group: 'LOWER_SECONDARY_GRADE3_OBJECTIVES', schoolOrder: 'secondaria', elementKind: 'LEARNING_OBJECTIVE', count: 28, page: 126, section: 'Matematica - Scuola secondaria di primo grado - Obiettivi specifici di apprendimento al termine della classe terza', countingNote: '11 Numeri + 8 Spazio e figure + 4 Relazioni e funzioni + 3 Dati e previsioni + 2 Informatica.' },
  { inventoryId: 'MATEMATICA', segmentId: 'dm221-disc-matematica', group: 'LOWER_SECONDARY_KNOWLEDGE', schoolOrder: 'secondaria', elementKind: 'KNOWLEDGE_OR_CONTENT', count: 5, page: 128, section: 'Matematica - Scuola secondaria di primo grado - Conoscenze', countingNote: 'Cinque bullet titolati: Numeri; Spazio e figure; Relazioni e funzioni; Dati e previsioni; Informatica.' },

  // SCIENZE — 113
  { inventoryId: 'SCIENZE', segmentId: 'dm221-disc-scienze', group: 'PRIMARY_EXPECTED_COMPETENCES', schoolOrder: 'primaria', elementKind: 'EXPECTED_COMPETENCE', count: 3, page: 131, section: 'Scienze - Scuola primaria - Competenze attese al termine della classe quinta' },
  { inventoryId: 'SCIENZE', segmentId: 'dm221-disc-scienze', group: 'PRIMARY_GRADE3_OBJECTIVES', schoolOrder: 'primaria', elementKind: 'LEARNING_OBJECTIVE', count: 15, page: 131, section: 'Scienze - Scuola primaria - Obiettivi specifici di apprendimento al termine della classe terza', countingNote: '3 Esplorazione/osservazione + 2 Materia + 5 Fenomeni fisici + 4 Esseri viventi/corpo umano + 1 Scienza e ambiente.' },
  { inventoryId: 'SCIENZE', segmentId: 'dm221-disc-scienze', group: 'PRIMARY_GRADE5_OBJECTIVES', schoolOrder: 'primaria', elementKind: 'LEARNING_OBJECTIVE', count: 34, page: 132, section: 'Scienze - Scuola primaria - Obiettivi specifici di apprendimento al termine della classe quinta', countingNote: '9 Esplorazione/osservazione + 9 Materia/trasformazioni + 6 bullet nel blocco fenomeni fisici (incluso il bullet nominale “Esplorazione sensoriale dei fenomeni fisici”) + 8 Uomo/viventi/ambiente + 2 Interconnessioni.' },
  { inventoryId: 'SCIENZE', segmentId: 'dm221-disc-scienze', group: 'PRIMARY_KNOWLEDGE', schoolOrder: 'primaria', elementKind: 'KNOWLEDGE_OR_CONTENT', count: 5, page: 135, section: 'Scienze - Scuola primaria - Conoscenze', countingNote: 'Cinque bullet titolati: Ambiente e scienze della Terra; Ambiente e biologia; Astronomia; Fisica; Chimica.' },
  { inventoryId: 'SCIENZE', segmentId: 'dm221-disc-scienze', group: 'LOWER_SECONDARY_EXPECTED_COMPETENCES', schoolOrder: 'secondaria', elementKind: 'EXPECTED_COMPETENCE', count: 3, page: 135, section: 'Scienze - Scuola secondaria di primo grado - Competenze attese al termine della classe terza' },
  { inventoryId: 'SCIENZE', segmentId: 'dm221-disc-scienze', group: 'LOWER_SECONDARY_GRADE3_OBJECTIVES', schoolOrder: 'secondaria', elementKind: 'LEARNING_OBJECTIVE', count: 47, page: 136, section: 'Scienze - Scuola secondaria di primo grado - Obiettivi specifici di apprendimento al termine della classe terza', countingNote: '7 Fenomeni naturali/antropici + 10 Fenomeni fisici/astronomici + 5 Chimica + 4 bullet energia (incluso il bullet nominale “Sperimentazione e analisi dell’energia nei fenomeni fisici”) + 3 Fonti energetiche + 9 Viventi/corpo umano + 3 Ambiente/scienze della Terra + 6 Interconnessioni.' },
  { inventoryId: 'SCIENZE', segmentId: 'dm221-disc-scienze', group: 'LOWER_SECONDARY_KNOWLEDGE', schoolOrder: 'secondaria', elementKind: 'KNOWLEDGE_OR_CONTENT', count: 6, page: 138, section: 'Scienze - Scuola secondaria di primo grado - Conoscenze', countingNote: 'Sei bullet tipografici: Chimica; Biologia; Geologia; Struttura della Terra; Fisica e astronomia; Fonti di energia/applicazioni tecnologiche.' },
] as const;

function createGroup(spec: R7C5B2BGroupSpec): R7C5B2BInventoryItem[] {
  return Array.from({ length: spec.count }, (_, index) => {
    const ordinal = index + 1;
    const inventorySlug = spec.inventoryId.toLowerCase().replace(/_/g, '-');
    const groupSlug = spec.group.toLowerCase().replace(/_/g, '-');
    return {
      elementId: `dm221-b2b-${inventorySlug}-${groupSlug}-${String(ordinal).padStart(2, '0')}`,
      segmentId: spec.segmentId,
      elementKind: spec.elementKind,
      schoolOrder: spec.schoolOrder,
      sourceLocator: {
        sourceId: DM221_2025_SOURCE_ID,
        section: spec.section,
        page: spec.page,
        note: `Elemento strutturale n. ${ordinal} del gruppo ${spec.group}; testo non importato in R7C5B2B.`,
      },
      sourceBindingStatus: 'SOURCE_LOCATED',
      verifiedByHuman: false,
      canonicalTextStatus: 'SOURCE_LOCATED_ONLY',
      inventoryId: spec.inventoryId,
      group: spec.group,
      ordinal,
      notes: spec.countingNote ?? 'Conteggio strutturale ricontrollato sulla pubblicazione finale; testo non verificato da una persona.',
    } satisfies R7C5B2BInventoryItem;
  });
}

export const DM221_R7C5B2B_ELEMENT_INVENTORY: readonly R7C5B2BInventoryItem[] =
  DM221_R7C5B2B_ELEMENT_GROUPS.flatMap(createGroup);

export const DM221_R7C5B2B_ELEMENT_COUNTS = Object.freeze(
  Object.fromEntries(
    (['STORIA', 'GEOGRAFIA', 'STEM', 'MATEMATICA', 'SCIENZE'] as const).map((inventoryId) => [
      inventoryId,
      DM221_R7C5B2B_ELEMENT_INVENTORY.filter((item) => item.inventoryId === inventoryId).length,
    ]),
  ) as Record<R7C5B2BInventoryId, number>,
);

export function getR7C5B2BInventory(inventoryId: R7C5B2BInventoryId): readonly R7C5B2BInventoryItem[] {
  return DM221_R7C5B2B_ELEMENT_INVENTORY.filter((item) => item.inventoryId === inventoryId);
}
