import type { NationalCurriculumElementBinding, NationalCurriculumElementKind } from './elementBindings';
import {
  DM221_FIRST_CYCLE_DISCIPLINES,
  DM221_INFANZIA_FIELDS,
  DM221_SPECIAL_SEGMENTS,
} from './canonicalStructure';
import {
  DM221_INFANZIA_ELEMENT_INVENTORY,
  DM221_INFANZIA_TO_PRIMARY_TRANSITION_PROFILE,
} from './infanziaElementInventory';
import { DM221_LANGUAGE_ELEMENT_INVENTORY } from './languageElementInventory';
import { DM221_R7C5B2B_ELEMENT_INVENTORY } from './r7c5b2bElementInventory';
import { DM221_TECHNOLOGY_ELEMENT_INVENTORY } from './technologyElementInventory';
import { DM221_R7C5B2C_ELEMENT_INVENTORY } from './r7c5b2cRemainingElementInventory';
import {
  validateTechnologySourceVerificationReceipt,
  type TechnologySourceVerificationReceipt,
} from './technologyHumanVerification';

export type FinalPublicationSourceReviewDecision = 'VERIFIED' | 'REJECTED' | 'NEEDS_CORRECTION';

export interface FinalPublicationSourceReviewTask {
  elementId: string;
  segmentId: string;
  scopeLabel: string;
  group: string;
  ordinal: number;
  schoolOrder: 'infanzia' | 'primaria' | 'secondaria';
  elementKind: NationalCurriculumElementKind;
  sourceId: string;
  page: number;
  section: string;
  status: 'AWAITING_HUMAN_SOURCE_REVIEW';
}

export interface FinalPublicationSourceVerificationReceipt {
  schemaVersion: 'dm221-final-publication-source-review-v1';
  elementId: string;
  segmentId: string;
  group: string;
  ordinal: number;
  sourceId: string;
  page: number;
  section: string;
  decision: FinalPublicationSourceReviewDecision;
  /** Testo effettivamente letto nella pubblicazione finale MIM. */
  verifiedSourceText: string;
  reviewerAttestation: true;
  reviewedAt: string;
  notes?: string;
}

export type VerifiedFinalPublicationElement = NationalCurriculumElementBinding & {
  sourceBindingStatus: 'SOURCE_VERIFIED';
  verifiedByHuman: true;
  canonicalTextStatus: 'HUMAN_VERIFIED_SOURCE_TEXT';
  canonicalText: string;
  humanVerification: {
    reviewedAt: string;
    decision: 'VERIFIED';
    notes?: string;
  };
};

type StructuralInventoryItem = NationalCurriculumElementBinding & {
  group?: string;
  ordinal?: number;
  inventoryId?: string;
};

const SEGMENT_LABELS = new Map<string, string>([
  ...Object.values(DM221_INFANZIA_FIELDS).map((segment) => [segment.id, segment.label] as const),
  ...Object.values(DM221_FIRST_CYCLE_DISCIPLINES).map((segment) => [segment.id, segment.label] as const),
  ...DM221_SPECIAL_SEGMENTS.map((segment) => [segment.id, segment.label] as const),
  ['dm221-infanzia-general-framework', 'Quadro generale della scuola dell’infanzia'],
  ['dm221-infanzia-transition-to-primary', 'Dalla scuola dell’infanzia alla scuola primaria'],
]);

const B2C_GENERAL_FRAMEWORK = DM221_R7C5B2C_ELEMENT_INVENTORY.filter(
  (item) => item.inventoryId === 'INFANZIA_GENERAL_FRAMEWORK',
);
const B2C_REMAINING_DISCIPLINES = DM221_R7C5B2C_ELEMENT_INVENTORY.filter(
  (item) => item.inventoryId !== 'INFANZIA_GENERAL_FRAMEWORK',
);

/**
 * Sequenza canonica dei 868 slot strutturali della pubblicazione finale MIM.
 * L'ordine segue il volume: quadro infanzia, cinque campi, transizione,
 * discipline/quadri del primo ciclo, arti e area motoria.
 */
export const DM221_FINAL_PUBLICATION_STRUCTURAL_ITEMS: readonly StructuralInventoryItem[] = [
  ...B2C_GENERAL_FRAMEWORK,
  ...DM221_INFANZIA_ELEMENT_INVENTORY,
  DM221_INFANZIA_TO_PRIMARY_TRANSITION_PROFILE,
  ...DM221_LANGUAGE_ELEMENT_INVENTORY,
  ...DM221_R7C5B2B_ELEMENT_INVENTORY,
  ...DM221_TECHNOLOGY_ELEMENT_INVENTORY,
  ...B2C_REMAINING_DISCIPLINES,
] as const;

function taskMetadata(item: StructuralInventoryItem): { group: string; ordinal: number } {
  if (item.elementId === DM221_INFANZIA_TO_PRIMARY_TRANSITION_PROFILE.elementId) {
    return { group: 'TRANSITION_PROFILE', ordinal: 1 };
  }
  return {
    group: item.group ?? item.elementKind,
    ordinal: item.ordinal ?? 1,
  };
}

function scopeLabelFor(item: StructuralInventoryItem): string {
  return SEGMENT_LABELS.get(item.segmentId) ?? item.sourceLocator.section ?? item.segmentId;
}

export function buildFinalPublicationSourceReviewQueue(): readonly FinalPublicationSourceReviewTask[] {
  return DM221_FINAL_PUBLICATION_STRUCTURAL_ITEMS.map((item) => {
    const page = item.sourceLocator.page;
    const section = item.sourceLocator.section;
    if (!page || !section) {
      throw new Error(`DM221_FINAL_SOURCE_REVIEW_LOCATOR_INCOMPLETE:${item.elementId}`);
    }
    const metadata = taskMetadata(item);
    return {
      elementId: item.elementId,
      segmentId: item.segmentId,
      scopeLabel: scopeLabelFor(item),
      group: metadata.group,
      ordinal: metadata.ordinal,
      schoolOrder: item.schoolOrder,
      elementKind: item.elementKind,
      sourceId: item.sourceLocator.sourceId,
      page,
      section,
      status: 'AWAITING_HUMAN_SOURCE_REVIEW' as const,
    };
  });
}

const QUEUE_BY_ID = new Map(buildFinalPublicationSourceReviewQueue().map((task) => [task.elementId, task] as const));
const ITEM_BY_ID = new Map(DM221_FINAL_PUBLICATION_STRUCTURAL_ITEMS.map((item) => [item.elementId, item] as const));

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function validateFinalPublicationSourceVerificationReceipt(
  receipt: FinalPublicationSourceVerificationReceipt,
): { valid: true; inventoryItem: StructuralInventoryItem } | { valid: false; reason: string } {
  if (receipt.schemaVersion !== 'dm221-final-publication-source-review-v1') {
    return { valid: false, reason: 'Schema receipt non riconosciuto.' };
  }

  const item = ITEM_BY_ID.get(receipt.elementId);
  const task = QUEUE_BY_ID.get(receipt.elementId);
  if (!item || !task) {
    return { valid: false, reason: 'L’elemento non appartiene all’inventario strutturale finale D.M. 221/2025.' };
  }

  if (
    receipt.segmentId !== task.segmentId ||
    receipt.group !== task.group ||
    receipt.ordinal !== task.ordinal
  ) {
    return { valid: false, reason: 'Identità, gruppo o ordinale non coincidono con lo slot strutturale canonico.' };
  }

  if (
    receipt.sourceId !== task.sourceId ||
    receipt.page !== task.page ||
    receipt.section !== task.section
  ) {
    return { valid: false, reason: 'Fonte, pagina stampata o sezione non coincidono con il locator canonico.' };
  }

  if (receipt.reviewerAttestation !== true) {
    return { valid: false, reason: 'Manca l’attestazione esplicita del revisore umano.' };
  }

  if (receipt.decision === 'VERIFIED' && normalizeText(receipt.verifiedSourceText).length === 0) {
    return { valid: false, reason: 'Una verifica positiva richiede il testo effettivamente letto nella pubblicazione finale.' };
  }

  if (!receipt.reviewedAt || Number.isNaN(Date.parse(receipt.reviewedAt))) {
    return { valid: false, reason: 'La data di revisione non è valida.' };
  }

  return { valid: true, inventoryItem: item };
}

export function promoteFinalPublicationElementFromHumanReceipt(
  receipt: FinalPublicationSourceVerificationReceipt,
): VerifiedFinalPublicationElement {
  const validation = validateFinalPublicationSourceVerificationReceipt(receipt);
  if (!validation.valid) {
    throw new Error(`FINAL_PUBLICATION_SOURCE_REVIEW_BLOCKED: ${validation.reason}`);
  }
  if (receipt.decision !== 'VERIFIED') {
    throw new Error('FINAL_PUBLICATION_SOURCE_REVIEW_BLOCKED: solo una decisione umana VERIFIED può verificare il testo sorgente.');
  }

  return {
    ...validation.inventoryItem,
    sourceBindingStatus: 'SOURCE_VERIFIED',
    verifiedByHuman: true,
    canonicalTextStatus: 'HUMAN_VERIFIED_SOURCE_TEXT',
    canonicalText: normalizeText(receipt.verifiedSourceText),
    humanVerification: {
      reviewedAt: receipt.reviewedAt,
      decision: 'VERIFIED',
      notes: receipt.notes,
    },
  };
}

export function migrateTechnologySourceVerificationReceipt(
  receipt: TechnologySourceVerificationReceipt,
): FinalPublicationSourceVerificationReceipt | null {
  const validation = validateTechnologySourceVerificationReceipt(receipt);
  if (!validation.valid) return null;
  const task = QUEUE_BY_ID.get(receipt.elementId);
  if (!task) return null;

  return {
    schemaVersion: 'dm221-final-publication-source-review-v1',
    elementId: task.elementId,
    segmentId: task.segmentId,
    group: task.group,
    ordinal: task.ordinal,
    sourceId: task.sourceId,
    page: task.page,
    section: task.section,
    decision: receipt.decision,
    verifiedSourceText: receipt.verifiedSourceText,
    reviewerAttestation: true,
    reviewedAt: receipt.reviewedAt,
    notes: receipt.notes,
  };
}

export function isInstitutionallyAdoptedFinalPublicationElement(
  _element: VerifiedFinalPublicationElement,
): false {
  return false;
}
