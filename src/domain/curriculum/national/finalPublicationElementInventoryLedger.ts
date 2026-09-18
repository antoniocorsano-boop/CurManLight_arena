import { DM221_INFANZIA_FIELDS, type InfanziaFieldId } from './canonicalStructure';
import {
  DM221_INFANZIA_ELEMENT_INVENTORY,
  DM221_INFANZIA_FINAL_PUBLICATION_SECTION_IDS,
  DM221_INFANZIA_TO_PRIMARY_TRANSITION_PROFILE,
  getInfanziaInventoryForField,
} from './infanziaElementInventory';
import {
  DM221_FINAL_PUBLICATION_SECTIONS,
  type Dm221FinalPublicationSectionId,
} from './finalPublicationManifest';
import {
  DM221_LANGUAGE_ELEMENT_COUNTS,
  DM221_LANGUAGE_ELEMENT_INVENTORY,
} from './languageElementInventory';
import {
  DM221_R7C5B2B_ELEMENT_COUNTS,
  DM221_R7C5B2B_ELEMENT_INVENTORY,
} from './r7c5b2bElementInventory';
import {
  DM221_R7C5B2C_ELEMENT_COUNTS,
  DM221_R7C5B2C_ELEMENT_INVENTORY,
} from './r7c5b2cRemainingElementInventory';
import { DM221_TECHNOLOGY_ELEMENT_INVENTORY } from './technologyElementInventory';

export type FinalPublicationInventoryStatus = 'COUNT_VERIFIED' | 'COUNT_REQUIRED';

export type FinalPublicationInventoryScopeKind =
  | 'GENERAL_INFANZIA_FRAMEWORK'
  | 'FIELD_OF_EXPERIENCE'
  | 'TRANSITION_PROFILE'
  | 'DISCIPLINE'
  | 'CONDITIONAL_OFFERING'
  | 'CROSS_DISCIPLINARY_FRAMEWORK';

export interface FinalPublicationElementInventoryLedgerEntry {
  id: string;
  sectionId: Dm221FinalPublicationSectionId;
  label: string;
  segmentId?: string;
  schoolOrders: readonly ('infanzia' | 'primaria' | 'secondaria')[];
  scopeKind: FinalPublicationInventoryScopeKind;
  pageStart: number;
  pageEnd: number;
  countStatus: FinalPublicationInventoryStatus;
  elementCount?: number;
  countingRule: string;
  humanSourceTextVerified: false;
  notes: string;
}

function finalSection(sectionId: Dm221FinalPublicationSectionId) {
  const section = DM221_FINAL_PUBLICATION_SECTIONS.find((candidate) => candidate.id === sectionId);
  if (!section) throw new Error(`DM221_FINAL_PUBLICATION_SECTION_MISSING:${sectionId}`);
  return section;
}

function verified(
  id: string,
  sectionId: Dm221FinalPublicationSectionId,
  scopeKind: FinalPublicationInventoryScopeKind,
  segmentId: string | undefined,
  elementCount: number,
  countingRule: string,
  notes: string,
): FinalPublicationElementInventoryLedgerEntry {
  const section = finalSection(sectionId);
  return {
    id,
    sectionId,
    label: section.label,
    ...(segmentId ? { segmentId } : {}),
    schoolOrders: section.schoolOrders,
    scopeKind,
    pageStart: section.pageStart,
    pageEnd: section.pageEnd,
    countStatus: 'COUNT_VERIFIED',
    elementCount,
    countingRule,
    humanSourceTextVerified: false,
    notes,
  };
}

const INFANZIA_FIELD_ENTRIES = (Object.keys(DM221_INFANZIA_FIELDS) as InfanziaFieldId[]).map(
  (fieldId) =>
    verified(
      `inventory-${DM221_INFANZIA_FIELDS[fieldId].id}`,
      DM221_INFANZIA_FINAL_PUBLICATION_SECTION_IDS[fieldId],
      'FIELD_OF_EXPERIENCE',
      DM221_INFANZIA_FIELDS[fieldId].id,
      getInfanziaInventoryForField(fieldId).length,
      '1 finalità narrativa + 1 voce narrativa di suggerimenti metodologici + competenze attese discrete + obiettivi specifici discreti.',
      'Conteggio strutturale ricontrollato sulla pubblicazione finale. I testi restano SOURCE_LOCATED_ONLY e non verificati da una persona.',
    ),
);

export const DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER: readonly FinalPublicationElementInventoryLedgerEntry[] = [
  verified(
    'inventory-infanzia-general-framework',
    'INFANZIA',
    'GENERAL_INFANZIA_FRAMEWORK',
    undefined,
    DM221_R7C5B2C_ELEMENT_COUNTS.INFANZIA_GENERAL_FRAMEWORK,
    'Cinque blocchi narrativi nativi prima del primo campo: identità/finalità generali; sfide del tempo; gioco; quadro dei campi di esperienza; professionalità dell’insegnante.',
    'Il quadro generale è inventariato come struttura di fonte, senza creare un sesto campo o una disciplina. La sezione sulla professionalità inizia a p. 56 e prosegue a p. 57 fino a prima del primo campo.',
  ),
  ...INFANZIA_FIELD_ENTRIES,
  verified(
    'inventory-infanzia-transition-profile',
    'INFANZIA_TRANSITION_PROFILE',
    'TRANSITION_PROFILE',
    DM221_INFANZIA_TO_PRIMARY_TRANSITION_PROFILE.segmentId,
    1,
    'Un profilo di transizione autonomo.',
    'Il profilo di transizione è separato dai cinque campi e non è una disciplina.',
  ),
  verified('inventory-italiano', 'ITALIANO', 'DISCIPLINE', 'dm221-disc-italiano', DM221_LANGUAGE_ELEMENT_COUNTS.ITALIANO, '5 competenze primaria + 9 obiettivi classe terza primaria + 6 obiettivi classe quinta primaria + 2 blocchi di conoscenze primaria + 5 competenze secondaria + 7 obiettivi secondaria + 2 blocchi di conoscenze secondaria.', 'Conteggio strutturale di 36 elementi; testo non verificato elemento per elemento.'),
  verified('inventory-lel', 'LEL', 'CONDITIONAL_OFFERING', 'dm221-offering-lel', DM221_LANGUAGE_ELEMENT_COUNTS.LEL, '5 competenze + 15 obiettivi + 1 blocco narrativo di conoscenze.', 'LEL resta offerta condizionale, non disciplina universale.'),
  verified('inventory-lingua-inglese', 'LINGUA_INGLESE', 'DISCIPLINE', 'dm221-disc-inglese', DM221_LANGUAGE_ELEMENT_COUNTS.LINGUA_INGLESE, '5 competenze primaria + 10 obiettivi classe terza + 12 obiettivi classe quinta + 1 conoscenza primaria + 5 competenze secondaria + 17 obiettivi secondaria + 1 conoscenza secondaria.', 'Conteggio strutturale di 51 elementi; testo non verificato elemento per elemento.'),
  verified('inventory-seconda-lingua', 'SECONDA_LINGUA_COMUNITARIA', 'DISCIPLINE', 'dm221-disc-seconda-lingua', DM221_LANGUAGE_ELEMENT_COUNTS.SECONDA_LINGUA_COMUNITARIA, '6 competenze + 13 obiettivi + 11 elementi di conoscenza.', 'Le varianti linguistiche restano interne alla seconda lingua comunitaria canonica.'),
  verified('inventory-storia', 'STORIA', 'DISCIPLINE', 'dm221-disc-storia', DM221_R7C5B2B_ELEMENT_COUNTS.STORIA, '4 competenze primaria + 3 obiettivi classe terza + 4 obiettivi classe quinta + 36 conoscenze primaria + 3 competenze secondaria + 5 obiettivi secondaria + 38 conoscenze secondaria.', 'Conteggio strutturale di 93 elementi; testo non verificato elemento per elemento.'),
  verified('inventory-geografia', 'GEOGRAFIA', 'DISCIPLINE', 'dm221-disc-geografia', DM221_R7C5B2B_ELEMENT_COUNTS.GEOGRAFIA, '5 competenze primaria + 17 obiettivi classe terza + 14 obiettivi classe quinta + 6 blocchi di conoscenze primaria + 4 competenze secondaria + 25 obiettivi secondaria + 10 blocchi di conoscenze secondaria.', 'Conteggio strutturale di 81 elementi; testo non verificato elemento per elemento.'),
  verified('inventory-stem', 'STEM', 'CROSS_DISCIPLINARY_FRAMEWORK', 'dm221-framework-stem', DM221_R7C5B2B_ELEMENT_COUNTS.STEM, '1 quadro generale + 1 blocco primaria + 1 blocco secondaria + 5 aspetti innovativi.', 'STEM resta framework trasversale e non disciplina autonoma.'),
  verified('inventory-matematica', 'MATEMATICA', 'DISCIPLINE', 'dm221-disc-matematica', DM221_R7C5B2B_ELEMENT_COUNTS.MATEMATICA, '8 competenze primaria + 11 obiettivi classe terza + 14 obiettivi classe quinta + 4 conoscenze primaria + 8 competenze secondaria + 28 obiettivi secondaria + 5 conoscenze secondaria.', 'Informatica resta interna al segmento Matematica dove la fonte la colloca.'),
  verified('inventory-scienze', 'SCIENZE', 'DISCIPLINE', 'dm221-disc-scienze', DM221_R7C5B2B_ELEMENT_COUNTS.SCIENZE, '3 competenze primaria + 15 obiettivi classe terza + 34 obiettivi classe quinta + 5 conoscenze primaria + 3 competenze secondaria + 47 obiettivi secondaria + 6 conoscenze secondaria.', 'Conteggio strutturale di 113 elementi; sono preservate anche le righe nominali tipograficamente bulletizzate.'),
  verified('inventory-tecnologia', 'TECNOLOGIA', 'DISCIPLINE', 'dm221-disc-tecnologia', DM221_TECHNOLOGY_ELEMENT_INVENTORY.length, '8 competenze primaria + 8 obiettivi classe terza + 12 obiettivi classe quinta + 3 conoscenze primaria + 8 competenze secondaria + 18 obiettivi secondaria + 4 conoscenze secondaria.', 'Conteggio di 61 elementi; testo non verificato elemento per elemento.'),
  verified('inventory-musica', 'MUSICA', 'DISCIPLINE', 'dm221-disc-musica', DM221_R7C5B2C_ELEMENT_COUNTS.MUSICA, '4 competenze primaria + 7 obiettivi classe terza + 9 obiettivi classe quinta + 7 conoscenze primaria + 5 competenze secondaria + 11 obiettivi secondaria + 7 conoscenze secondaria.', 'Conteggio strutturale di 50 elementi; la riga nominale tipograficamente bulletizzata nella classe quinta è preservata come elemento strutturale.'),
  verified('inventory-strumento-musicale', 'STRUMENTO_MUSICALE', 'CONDITIONAL_OFFERING', 'dm221-offering-strumento-musicale', DM221_R7C5B2C_ELEMENT_COUNTS.STRUMENTO_MUSICALE, '4 competenze + 16 obiettivi generali + 28 obiettivi della modifica D.I. 176/2022 distribuiti per famiglie strumentali + 5 conoscenze.', 'Conteggio strutturale di 53 elementi. Strumento musicale resta offerta condizionale per i percorsi a indirizzo musicale.'),
  verified('inventory-arte', 'ARTE_E_IMMAGINE', 'DISCIPLINE', 'dm221-disc-arte', DM221_R7C5B2C_ELEMENT_COUNTS.ARTE_E_IMMAGINE, '4 competenze primaria + 12 obiettivi classe terza + 12 obiettivi classe quinta + 10 conoscenze primaria + 4 competenze secondaria + 10 obiettivi secondaria + 9 conoscenze secondaria.', 'Conteggio strutturale di 61 elementi; testo non verificato elemento per elemento.'),
  verified('inventory-educazione-motoria', 'EDUCAZIONE_MOTORIA_E_FISICA', 'DISCIPLINE', 'dm221-disc-educazione-motoria', DM221_R7C5B2C_ELEMENT_COUNTS.EDUCAZIONE_MOTORIA, '5 competenze primaria + 11 obiettivi classe terza + 14 obiettivi classe quinta + 8 conoscenze.', 'Conteggio strutturale di 38 elementi. L’identità primaria resta distinta da Educazione fisica della secondaria.'),
  verified('inventory-educazione-fisica', 'EDUCAZIONE_MOTORIA_E_FISICA', 'DISCIPLINE', 'dm221-disc-educazione-fisica', DM221_R7C5B2C_ELEMENT_COUNTS.EDUCAZIONE_FISICA, '5 competenze secondaria + 16 obiettivi classe terza + 6 conoscenze bulletizzate.', 'Conteggio strutturale di 27 elementi. La frase introduttiva non bulletizzata delle conoscenze non viene trasformata artificialmente in un item; l’identità secondaria resta distinta da Educazione motoria primaria.'),
] as const;

export function getVerifiedFinalPublicationInventoryCount(): number {
  return DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER.reduce(
    (total, entry) => total + (entry.countStatus === 'COUNT_VERIFIED' ? entry.elementCount ?? 0 : 0),
    0,
  );
}

export function getPendingFinalPublicationInventoryEntries(): readonly FinalPublicationElementInventoryLedgerEntry[] {
  return DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER.filter(
    (entry) => entry.countStatus === 'COUNT_REQUIRED',
  );
}

export function assertNoGuessedFinalPublicationCounts(): void {
  const invalid = DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER.find(
    (entry) => entry.countStatus === 'COUNT_REQUIRED' && entry.elementCount !== undefined,
  );
  if (invalid) throw new Error(`DM221_GUESSED_ELEMENT_COUNT_FORBIDDEN:${invalid.id}`);
}

export function assertVerifiedInventoryBackedByConcreteItems(): void {
  const infanziaInventoryCount = DM221_INFANZIA_ELEMENT_INVENTORY.length;
  const languageInventoryCount = DM221_LANGUAGE_ELEMENT_INVENTORY.length;
  const b2bInventoryCount = DM221_R7C5B2B_ELEMENT_INVENTORY.length;
  const b2cInventoryCount = DM221_R7C5B2C_ELEMENT_INVENTORY.length;
  const technologyInventoryCount = DM221_TECHNOLOGY_ELEMENT_INVENTORY.length;

  if (
    infanziaInventoryCount !== 61 ||
    languageInventoryCount !== 138 ||
    b2bInventoryCount !== 373 ||
    b2cInventoryCount !== 234 ||
    technologyInventoryCount !== 61
  ) {
    throw new Error(
      `DM221_VERIFIED_INVENTORY_DRIFT:infanzia=${infanziaInventoryCount}:lingue=${languageInventoryCount}:b2b=${b2bInventoryCount}:b2c=${b2cInventoryCount}:tecnologia=${technologyInventoryCount}`,
    );
  }
}
