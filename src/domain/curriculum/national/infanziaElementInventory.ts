import type { NationalCurriculumElementBinding, NationalCurriculumElementKind } from './elementBindings';
import { DM221_INFANZIA_FIELDS, type InfanziaFieldId } from './canonicalStructure';
import { DM221_2025_SOURCE_ID } from './dm2212025';

export type InfanziaElementGroup =
  | 'FIELD_FINALITY'
  | 'METHODOLOGICAL_GUIDANCE'
  | 'EXPECTED_COMPETENCES'
  | 'SPECIFIC_OBJECTIVES';

export interface InfanziaElementInventoryItem extends NationalCurriculumElementBinding {
  fieldId: InfanziaFieldId;
  group: InfanziaElementGroup;
  ordinal: number;
}

interface FieldGroupCounts {
  expectedCompetences: number;
  specificObjectives: number;
}

/**
 * Inventario strutturale ricavato dall'allegato al D.M. 221/2025.
 * Registra il numero degli elementi discreti e la posizione logica delle
 * sezioni narrative nella fonte, senza copiare o promuovere automaticamente
 * il testo normativo.
 */
export const DM221_INFANZIA_ELEMENT_COUNTS: Readonly<Record<InfanziaFieldId, FieldGroupCounts>> = {
  IL_SE_E_L_ALTRO: { expectedCompetences: 4, specificObjectives: 6 },
  IL_CORPO_E_IL_MOVIMENTO: { expectedCompetences: 5, specificObjectives: 5 },
  IMMAGINI_SUONI_COLORI: { expectedCompetences: 4, specificObjectives: 5 },
  I_DISCORSI_E_LE_PAROLE: { expectedCompetences: 6, specificObjectives: 6 },
  LA_CONOSCENZA_DEL_MONDO: { expectedCompetences: 5, specificObjectives: 5 },
};

function elementKindFor(group: InfanziaElementGroup): NationalCurriculumElementKind {
  if (group === 'FIELD_FINALITY') return 'FINALITY';
  if (group === 'METHODOLOGICAL_GUIDANCE') return 'METHODOLOGICAL_GUIDANCE';
  if (group === 'EXPECTED_COMPETENCES') return 'EXPECTED_COMPETENCE';
  return 'LEARNING_OBJECTIVE';
}

function sourceSection(fieldLabel: string, group: InfanziaElementGroup): string {
  if (group === 'FIELD_FINALITY') return `Campo di esperienza — ${fieldLabel} — Finalità`;
  if (group === 'METHODOLOGICAL_GUIDANCE') return `Campo di esperienza — ${fieldLabel} — suggerimenti metodologici nel quadro aperto del campo`;
  if (group === 'EXPECTED_COMPETENCES') return `Campo di esperienza — ${fieldLabel} — Competenze attese`;
  return `Campo di esperienza — ${fieldLabel} — Obiettivi specifici`;
}

function createItems(
  fieldId: InfanziaFieldId,
  group: InfanziaElementGroup,
  count: number,
): InfanziaElementInventoryItem[] {
  const field = DM221_INFANZIA_FIELDS[fieldId];
  return Array.from({ length: count }, (_, index) => {
    const ordinal = index + 1;
    const slug = fieldId.toLowerCase().replaceAll('_', '-');
    const narrativeSection = group === 'FIELD_FINALITY' || group === 'METHODOLOGICAL_GUIDANCE';
    return {
      elementId: `dm221-infanzia-${slug}-${group.toLowerCase().replaceAll('_', '-')}-${String(ordinal).padStart(2, '0')}`,
      segmentId: field.id,
      elementKind: elementKindFor(group),
      schoolOrder: 'infanzia',
      sourceLocator: {
        sourceId: DM221_2025_SOURCE_ID,
        section: sourceSection(field.label, group),
        note: narrativeSection
          ? 'Sezione narrativa del campo di esperienza; testo non importato in questa tranche.'
          : `Elemento n. ${ordinal} del gruppo ${group}; testo non importato in questa tranche.`,
      },
      sourceBindingStatus: 'SOURCE_LOCATED',
      verifiedByHuman: false,
      canonicalTextStatus: 'SOURCE_LOCATED_ONLY',
      fieldId,
      group,
      ordinal,
      notes:
        group === 'METHODOLOGICAL_GUIDANCE'
          ? 'Le Indicazioni dichiarano suggerimenti metodologici per ciascun campo; nella fonte sono distribuiti nel quadro narrativo del campo e non vengono trasformati artificialmente in un elenco di obiettivi.'
          : 'Inventario strutturale derivato dalla fonte ufficiale. Il testo resta non canonico finché non viene verificato da una persona e promosso a HUMAN_VERIFIED_SOURCE_TEXT.',
    } satisfies InfanziaElementInventoryItem;
  });
}

export const DM221_INFANZIA_ELEMENT_INVENTORY: readonly InfanziaElementInventoryItem[] = (
  Object.keys(DM221_INFANZIA_FIELDS) as InfanziaFieldId[]
).flatMap((fieldId) => {
  const counts = DM221_INFANZIA_ELEMENT_COUNTS[fieldId];
  return [
    ...createItems(fieldId, 'FIELD_FINALITY', 1),
    ...createItems(fieldId, 'METHODOLOGICAL_GUIDANCE', 1),
    ...createItems(fieldId, 'EXPECTED_COMPETENCES', counts.expectedCompetences),
    ...createItems(fieldId, 'SPECIFIC_OBJECTIVES', counts.specificObjectives),
  ];
});

/**
 * Sezione di continuità prevista dall'allegato nazionale.
 * È registrata separatamente dai cinque campi: non è un sesto campo di esperienza
 * e non è una disciplina della scuola dell'infanzia.
 */
export const DM221_INFANZIA_TO_PRIMARY_TRANSITION_PROFILE: NationalCurriculumElementBinding = {
  elementId: 'dm221-infanzia-to-primary-transition-profile',
  segmentId: 'dm221-infanzia-transition-to-primary',
  elementKind: 'TRANSITION_PROFILE',
  schoolOrder: 'infanzia',
  sourceLocator: {
    sourceId: DM221_2025_SOURCE_ID,
    section: "Dalla scuola dell'infanzia alla scuola primaria",
    note: 'Profilo di continuità localizzato nella fonte ufficiale; testo non importato in questa tranche.',
  },
  sourceBindingStatus: 'SOURCE_LOCATED',
  verifiedByHuman: false,
  canonicalTextStatus: 'SOURCE_LOCATED_ONLY',
  notes:
    'Elemento di raccordo tra infanzia e primaria. Non attribuisce copertura disciplinare e richiede verifica umana del testo ufficiale.',
};

export function getInfanziaInventoryForField(
  fieldId: InfanziaFieldId,
): readonly InfanziaElementInventoryItem[] {
  return DM221_INFANZIA_ELEMENT_INVENTORY.filter((item) => item.fieldId === fieldId);
}
