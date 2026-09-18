import type { NationalCurriculumElementBinding, NationalCurriculumElementKind } from './elementBindings';
import { DM221_INFANZIA_FIELDS, type InfanziaFieldId } from './canonicalStructure';
import { DM221_2025_SOURCE_ID } from './dm2212025';
import {
  DM221_FINAL_PUBLICATION_SECTIONS,
  type Dm221FinalPublicationSection,
  type Dm221FinalPublicationSectionId,
} from './finalPublicationManifest';

export type InfanziaElementGroup =
  | 'FIELD_FINALITY'
  | 'METHODOLOGICAL_GUIDANCE'
  | 'EXPECTED_COMPETENCES'
  | 'SPECIFIC_OBJECTIVES';

export interface InfanziaElementInventoryItem extends NationalCurriculumElementBinding {
  fieldId: InfanziaFieldId;
  group: InfanziaElementGroup;
  ordinal: number;
  finalPublicationSectionId: Dm221FinalPublicationSectionId;
  finalPublicationPageEnd: number;
}

interface FieldGroupCounts {
  expectedCompetences: number;
  specificObjectives: number;
}

export const DM221_INFANZIA_ELEMENT_COUNTS: Readonly<Record<InfanziaFieldId, FieldGroupCounts>> = {
  IL_SE_E_L_ALTRO: { expectedCompetences: 4, specificObjectives: 6 },
  IL_CORPO_E_IL_MOVIMENTO: { expectedCompetences: 5, specificObjectives: 5 },
  IMMAGINI_SUONI_COLORI: { expectedCompetences: 4, specificObjectives: 5 },
  I_DISCORSI_E_LE_PAROLE: { expectedCompetences: 6, specificObjectives: 6 },
  LA_CONOSCENZA_DEL_MONDO: { expectedCompetences: 5, specificObjectives: 5 },
};

export const DM221_INFANZIA_FINAL_PUBLICATION_SECTION_IDS: Readonly<
  Record<InfanziaFieldId, Dm221FinalPublicationSectionId>
> = {
  IL_SE_E_L_ALTRO: 'INFANZIA_IL_SE_E_L_ALTRO',
  IL_CORPO_E_IL_MOVIMENTO: 'INFANZIA_IL_CORPO_E_IL_MOVIMENTO',
  IMMAGINI_SUONI_COLORI: 'INFANZIA_IMMAGINI_SUONI_COLORI',
  I_DISCORSI_E_LE_PAROLE: 'INFANZIA_I_DISCORSI_E_LE_PAROLE',
  LA_CONOSCENZA_DEL_MONDO: 'INFANZIA_LA_CONOSCENZA_DEL_MONDO',
};

function elementKindFor(group: InfanziaElementGroup): NationalCurriculumElementKind {
  if (group === 'FIELD_FINALITY') return 'FINALITY';
  if (group === 'METHODOLOGICAL_GUIDANCE') return 'METHODOLOGICAL_GUIDANCE';
  if (group === 'EXPECTED_COMPETENCES') return 'EXPECTED_COMPETENCE';
  return 'LEARNING_OBJECTIVE';
}

function sourceSection(fieldLabel: string, group: InfanziaElementGroup): string {
  if (group === 'FIELD_FINALITY') return `Campo di esperienza — ${fieldLabel} — Finalità`;
  if (group === 'METHODOLOGICAL_GUIDANCE') {
    return `Campo di esperienza — ${fieldLabel} — suggerimenti metodologici nel quadro aperto del campo`;
  }
  if (group === 'EXPECTED_COMPETENCES') return `Campo di esperienza — ${fieldLabel} — Competenze attese`;
  return `Campo di esperienza — ${fieldLabel} — Obiettivi specifici`;
}

function getFinalSection(fieldId: InfanziaFieldId): Dm221FinalPublicationSection {
  const sectionId = DM221_INFANZIA_FINAL_PUBLICATION_SECTION_IDS[fieldId];
  const section = DM221_FINAL_PUBLICATION_SECTIONS.find((candidate) => candidate.id === sectionId);
  if (!section) {
    throw new Error(`DM221_FINAL_PUBLICATION_SECTION_MISSING:${sectionId}`);
  }
  return section;
}

function finalPublicationNote(section: Dm221FinalPublicationSection, ordinal: number, group: InfanziaElementGroup): string {
  const pages =
    section.pageStart === section.pageEnd
      ? `p. ${section.pageStart}`
      : `pp. ${section.pageStart}-${section.pageEnd}`;
  const narrativeSection = group === 'FIELD_FINALITY' || group === 'METHODOLOGICAL_GUIDANCE';
  return narrativeSection
    ? `Edizione finale MIM, marzo 2026, ${pages}. Locator di sezione narrativa: il testo non è importato né verificato in questa tranche.`
    : `Edizione finale MIM, marzo 2026, ${pages}. Elemento strutturale n. ${ordinal}: la pagina puntuale e il testo devono ancora essere verificati da una persona.`;
}

function createItems(
  fieldId: InfanziaFieldId,
  group: InfanziaElementGroup,
  count: number,
): InfanziaElementInventoryItem[] {
  const field = DM221_INFANZIA_FIELDS[fieldId];
  const section = getFinalSection(fieldId);
  return Array.from({ length: count }, (_, index) => {
    const ordinal = index + 1;
    const slug = fieldId.toLowerCase().replace(/_/g, '-');
    const groupSlug = group.toLowerCase().replace(/_/g, '-');
    return {
      elementId: `dm221-infanzia-${slug}-${groupSlug}-${String(ordinal).padStart(2, '0')}`,
      segmentId: field.id,
      elementKind: elementKindFor(group),
      schoolOrder: 'infanzia',
      sourceLocator: {
        sourceId: DM221_2025_SOURCE_ID,
        section: sourceSection(field.label, group),
        page: section.pageStart,
        note: finalPublicationNote(section, ordinal, group),
      },
      sourceBindingStatus: 'SOURCE_LOCATED',
      verifiedByHuman: false,
      canonicalTextStatus: 'SOURCE_LOCATED_ONLY',
      fieldId,
      group,
      ordinal,
      finalPublicationSectionId: section.id,
      finalPublicationPageEnd: section.pageEnd,
      notes:
        group === 'METHODOLOGICAL_GUIDANCE'
          ? 'Voce strutturale narrativa: non viene trasformata artificialmente in una lista di obiettivi. Il locator punta all’intervallo del campo nella pubblicazione finale.'
          : 'Il conteggio strutturale è censito; l’autorità normativa del testo richiede verifica umana puntuale e HUMAN_VERIFIED_SOURCE_TEXT.',
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

export const DM221_INFANZIA_TO_PRIMARY_TRANSITION_PROFILE: NationalCurriculumElementBinding = {
  elementId: 'dm221-infanzia-to-primary-transition-profile',
  segmentId: 'dm221-infanzia-transition-to-primary',
  elementKind: 'TRANSITION_PROFILE',
  schoolOrder: 'infanzia',
  sourceLocator: {
    sourceId: DM221_2025_SOURCE_ID,
    section: 'Dalla scuola dell’infanzia alla scuola primaria',
    page: 67,
    note: 'Edizione finale MIM, marzo 2026, p. 67. Profilo di transizione separato dai cinque campi; testo non ancora verificato da una persona.',
  },
  sourceBindingStatus: 'SOURCE_LOCATED',
  verifiedByHuman: false,
  canonicalTextStatus: 'SOURCE_LOCATED_ONLY',
  notes:
    'Elemento di raccordo tra infanzia e primaria. Non è un sesto campo di esperienza e non attribuisce copertura disciplinare.',
};

export function getInfanziaInventoryForField(
  fieldId: InfanziaFieldId,
): readonly InfanziaElementInventoryItem[] {
  return DM221_INFANZIA_ELEMENT_INVENTORY.filter((item) => item.fieldId === fieldId);
}
