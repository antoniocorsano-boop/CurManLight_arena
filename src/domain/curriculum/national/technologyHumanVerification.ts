import type { TechnologyElementInventoryItem } from './technologyElementInventory';
import { DM221_TECHNOLOGY_ELEMENT_INVENTORY } from './technologyElementInventory';

export type TechnologySourceReviewDecision = 'VERIFIED' | 'REJECTED' | 'NEEDS_CORRECTION';

export interface TechnologySourceVerificationReceipt {
  schemaVersion: 'dm221-tech-source-review-v1';
  elementId: string;
  sourceId: string;
  page: number;
  section: string;
  ordinal: number;
  decision: TechnologySourceReviewDecision;
  /** Testo letto e verificato sulla fonte ufficiale. Non viene generato dal sistema. */
  verifiedSourceText: string;
  reviewerAttestation: true;
  reviewedAt: string;
  notes?: string;
}

export interface TechnologySourceReviewTask {
  elementId: string;
  group: TechnologyElementInventoryItem['group'];
  ordinal: number;
  schoolOrder: TechnologyElementInventoryItem['schoolOrder'];
  elementKind: TechnologyElementInventoryItem['elementKind'];
  sourceId: string;
  page: number;
  section: string;
  status: 'AWAITING_HUMAN_SOURCE_REVIEW';
}

export type VerifiedTechnologyElement = TechnologyElementInventoryItem & {
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

export function buildTechnologySourceReviewQueue(): readonly TechnologySourceReviewTask[] {
  return DM221_TECHNOLOGY_ELEMENT_INVENTORY.map((item) => ({
    elementId: item.elementId,
    group: item.group,
    ordinal: item.ordinal,
    schoolOrder: item.schoolOrder,
    elementKind: item.elementKind,
    sourceId: item.sourceLocator.sourceId,
    page: item.sourceLocator.page ?? 0,
    section: item.sourceLocator.section ?? '',
    status: 'AWAITING_HUMAN_SOURCE_REVIEW' as const,
  }));
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function validateTechnologySourceVerificationReceipt(
  receipt: TechnologySourceVerificationReceipt,
): { valid: true; inventoryItem: TechnologyElementInventoryItem } | { valid: false; reason: string } {
  if (receipt.schemaVersion !== 'dm221-tech-source-review-v1') {
    return { valid: false, reason: 'Schema receipt non riconosciuto.' };
  }

  const item = DM221_TECHNOLOGY_ELEMENT_INVENTORY.find((candidate) => candidate.elementId === receipt.elementId);
  if (!item) {
    return { valid: false, reason: 'L’elemento non appartiene all’inventario canonico di Tecnologia.' };
  }

  if (receipt.sourceId !== item.sourceLocator.sourceId) {
    return { valid: false, reason: 'La fonte dichiarata non coincide con quella dell’inventario canonico.' };
  }

  if (receipt.page !== item.sourceLocator.page || receipt.section !== item.sourceLocator.section) {
    return { valid: false, reason: 'Pagina o sezione non coincidono con il locator canonico.' };
  }

  if (receipt.ordinal !== item.ordinal) {
    return { valid: false, reason: 'L’ordinale non coincide con l’elemento inventariato.' };
  }

  if (receipt.reviewerAttestation !== true) {
    return { valid: false, reason: 'Manca l’attestazione esplicita del revisore umano.' };
  }

  if (receipt.decision === 'VERIFIED' && normalizeText(receipt.verifiedSourceText).length === 0) {
    return { valid: false, reason: 'Una verifica positiva richiede il testo effettivamente letto sulla fonte.' };
  }

  if (!receipt.reviewedAt || Number.isNaN(Date.parse(receipt.reviewedAt))) {
    return { valid: false, reason: 'La data di revisione non è valida.' };
  }

  return { valid: true, inventoryItem: item };
}

export function promoteTechnologyElementFromHumanReceipt(
  receipt: TechnologySourceVerificationReceipt,
): VerifiedTechnologyElement {
  const validation = validateTechnologySourceVerificationReceipt(receipt);
  if (!validation.valid) {
    throw new Error(`TECHNOLOGY_SOURCE_REVIEW_BLOCKED: ${validation.reason}`);
  }

  if (receipt.decision !== 'VERIFIED') {
    throw new Error('TECHNOLOGY_SOURCE_REVIEW_BLOCKED: solo una decisione umana VERIFIED può verificare il testo sorgente.');
  }

  const item = validation.inventoryItem;
  return {
    ...item,
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

export function isInstitutionallyAdoptedTechnologyElement(_element: VerifiedTechnologyElement): false {
  // La verifica della fonte non costituisce mai adozione curricolare d’istituto.
  return false;
}
