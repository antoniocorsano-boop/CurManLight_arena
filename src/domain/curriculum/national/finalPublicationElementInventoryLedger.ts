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

function pending(
  id: string,
  sectionId: Dm221FinalPublicationSectionId,
  scopeKind: FinalPublicationInventoryScopeKind,
  segmentId: string | undefined,
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
    countStatus: 'COUNT_REQUIRED',
    countingRule,
    humanSourceTextVerified: false,
    notes,
  };
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
  pending(
    'inventory-infanzia-general-framework',
    'INFANZIA',
    'GENERAL_INFANZIA_FRAMEWORK',
    undefined,
    'Contare solo le sezioni narrative generali pp. 53-56, escludendo i cinque campi già censiti alle pp. 57-66.',
    'Il quadro pedagogico generale dell’infanzia deve essere inventariato separatamente per evitare doppio conteggio con i campi.',
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
  pending('inventory-italiano', 'ITALIANO', 'DISCIPLINE', 'dm221-disc-italiano', 'Conteggio per gruppi e ordini scolastici della struttura disciplinare finale.', 'Conteggio puntuale ancora da certificare.'),
  pending('inventory-lel', 'LEL', 'CONDITIONAL_OFFERING', 'dm221-offering-lel', 'Conteggio della sezione condizionale LEL senza promuoverla a disciplina universale.', 'Conteggio puntuale ancora da certificare.'),
  pending('inventory-lingua-inglese', 'LINGUA_INGLESE', 'DISCIPLINE', 'dm221-disc-inglese', 'Conteggio per gruppi e ordini scolastici della struttura disciplinare finale.', 'Conteggio puntuale ancora da certificare.'),
  pending('inventory-seconda-lingua', 'SECONDA_LINGUA_COMUNITARIA', 'DISCIPLINE', 'dm221-disc-seconda-lingua', 'Conteggio della sola secondaria di primo grado.', 'Conteggio puntuale ancora da certificare.'),
  pending('inventory-storia', 'STORIA', 'DISCIPLINE', 'dm221-disc-storia', 'Conteggio per gruppi e ordini scolastici della struttura disciplinare finale.', 'Conteggio puntuale ancora da certificare.'),
  pending('inventory-geografia', 'GEOGRAFIA', 'DISCIPLINE', 'dm221-disc-geografia', 'Conteggio per gruppi e ordini scolastici della struttura disciplinare finale.', 'Conteggio puntuale ancora da certificare.'),
  pending('inventory-stem', 'STEM', 'CROSS_DISCIPLINARY_FRAMEWORK', 'dm221-framework-stem', 'Inventario della sezione integrata senza trasformarla in disciplina autonoma.', 'Conteggio puntuale ancora da certificare.'),
  pending('inventory-matematica', 'MATEMATICA', 'DISCIPLINE', 'dm221-disc-matematica', 'Conteggio per gruppi e ordini scolastici, inclusi gli elementi di Informatica dove previsti.', 'Conteggio puntuale ancora da certificare.'),
  pending('inventory-scienze', 'SCIENZE', 'DISCIPLINE', 'dm221-disc-scienze', 'Conteggio per gruppi e ordini scolastici della struttura disciplinare finale.', 'Conteggio puntuale ancora da certificare.'),
  verified(
    'inventory-tecnologia',
    'TECNOLOGIA',
    'DISCIPLINE',
    'dm221-disc-tecnologia',
    DM221_TECHNOLOGY_ELEMENT_INVENTORY.length,
    '8 competenze primaria + 8 obiettivi classe terza primaria + 12 obiettivi classe quinta primaria + 3 conoscenze primaria + 8 competenze secondaria + 18 obiettivi secondaria + 4 conoscenze secondaria.',
    'Conteggio di 61 elementi ricontrollato sulla pubblicazione finale pp. 141-146; i testi restano non verificati da una persona.',
  ),
  pending('inventory-musica', 'MUSICA', 'DISCIPLINE', 'dm221-disc-musica', 'Conteggio per gruppi e ordini scolastici della struttura disciplinare finale.', 'Conteggio puntuale ancora da certificare.'),
  pending('inventory-strumento-musicale', 'STRUMENTO_MUSICALE', 'CONDITIONAL_OFFERING', 'dm221-offering-strumento-musicale', 'Conteggio della sezione per i percorsi a indirizzo musicale.', 'Conteggio puntuale ancora da certificare.'),
  pending('inventory-arte', 'ARTE_E_IMMAGINE', 'DISCIPLINE', 'dm221-disc-arte', 'Conteggio per gruppi e ordini scolastici della struttura disciplinare finale.', 'Conteggio puntuale ancora da certificare.'),
  pending('inventory-educazione-motoria', 'EDUCAZIONE_MOTORIA_E_FISICA', 'DISCIPLINE', 'dm221-disc-educazione-motoria', 'Conteggio dei soli elementi della scuola primaria nel capitolo condiviso.', 'La primaria mantiene identità distinta da Educazione fisica della secondaria.'),
  pending('inventory-educazione-fisica', 'EDUCAZIONE_MOTORIA_E_FISICA', 'DISCIPLINE', 'dm221-disc-educazione-fisica', 'Conteggio dei soli elementi della scuola secondaria di primo grado nel capitolo condiviso.', 'La secondaria mantiene identità distinta da Educazione motoria della primaria.'),
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
  if (invalid) {
    throw new Error(`DM221_GUESSED_ELEMENT_COUNT_FORBIDDEN:${invalid.id}`);
  }
}

export function assertVerifiedInventoryBackedByConcreteItems(): void {
  const infanziaInventoryCount = DM221_INFANZIA_ELEMENT_INVENTORY.length;
  const technologyInventoryCount = DM221_TECHNOLOGY_ELEMENT_INVENTORY.length;
  if (infanziaInventoryCount !== 61 || technologyInventoryCount !== 61) {
    throw new Error(
      `DM221_VERIFIED_INVENTORY_DRIFT:infanzia=${infanziaInventoryCount}:tecnologia=${technologyInventoryCount}`,
    );
  }
}
