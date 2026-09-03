import { DM221_2025_SOURCE, DM221_2025_SOURCE_ID } from './dm2212025';
import {
  buildFinalPublicationSourceReviewQueue,
  validateFinalPublicationSourceVerificationReceipt,
  type FinalPublicationSourceVerificationReceipt,
} from './finalPublicationHumanVerification';

export const FINAL_PUBLICATION_REVIEW_PACKAGE_SCHEMA =
  'dm221-final-publication-source-review-package-v1' as const;

export interface FinalPublicationReviewPackage {
  schemaVersion: typeof FINAL_PUBLICATION_REVIEW_PACKAGE_SCHEMA;
  exportedAt: string;
  inventoryElementCount: number;
  sourceBinding: {
    sourceId: typeof DM221_2025_SOURCE_ID;
    curriculumVolumeUrl: string;
    printedAt: string;
    pageNumbering: string;
  };
  receipts: readonly FinalPublicationSourceVerificationReceipt[];
}

export type ReceiptImportDisposition =
  | 'ADDED'
  | 'DUPLICATE'
  | 'CONFLICT'
  | 'INVALID';

export interface ReceiptImportFinding {
  elementId: string;
  disposition: ReceiptImportDisposition;
  reason: string;
}

export interface FinalPublicationReviewImportResult {
  acceptedReceipts: readonly FinalPublicationSourceVerificationReceipt[];
  findings: readonly ReceiptImportFinding[];
  addedCount: number;
  duplicateCount: number;
  conflictCount: number;
  invalidCount: number;
  packageAccepted: boolean;
  packageReason?: string;
}

const EXPECTED_INVENTORY_COUNT = buildFinalPublicationSourceReviewQueue().length;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sameReceipt(
  left: FinalPublicationSourceVerificationReceipt,
  right: FinalPublicationSourceVerificationReceipt,
): boolean {
  return (
    left.schemaVersion === right.schemaVersion &&
    left.elementId === right.elementId &&
    left.segmentId === right.segmentId &&
    left.group === right.group &&
    left.ordinal === right.ordinal &&
    left.sourceId === right.sourceId &&
    left.page === right.page &&
    left.section === right.section &&
    left.decision === right.decision &&
    left.verifiedSourceText === right.verifiedSourceText &&
    left.reviewerAttestation === right.reviewerAttestation &&
    left.reviewedAt === right.reviewedAt &&
    (left.notes ?? '') === (right.notes ?? '')
  );
}

function validatePackageBinding(value: unknown): { valid: true; receipts: unknown[] } | { valid: false; reason: string } {
  // Compatibility path: R7C5C1 exported the validated receipt array directly.
  if (Array.isArray(value)) {
    return { valid: true, receipts: value };
  }

  if (!isRecord(value)) {
    return { valid: false, reason: 'Il file non contiene un pacchetto di verifiche riconoscibile.' };
  }

  if (value.schemaVersion !== FINAL_PUBLICATION_REVIEW_PACKAGE_SCHEMA) {
    return { valid: false, reason: 'Versione del pacchetto di verifiche non riconosciuta.' };
  }

  if (typeof value.exportedAt !== 'string' || Number.isNaN(Date.parse(value.exportedAt))) {
    return { valid: false, reason: 'Il pacchetto non contiene una data di esportazione valida.' };
  }

  if (value.inventoryElementCount !== EXPECTED_INVENTORY_COUNT) {
    return {
      valid: false,
      reason: `Il pacchetto dichiara ${String(value.inventoryElementCount)} slot, ma il registro corrente ne contiene ${EXPECTED_INVENTORY_COUNT}.`,
    };
  }

  if (!isRecord(value.sourceBinding)) {
    return { valid: false, reason: 'Manca il binding alla pubblicazione finale MIM.' };
  }

  const sourceBinding = value.sourceBinding;
  if (
    sourceBinding.sourceId !== DM221_2025_SOURCE_ID ||
    sourceBinding.curriculumVolumeUrl !== DM221_2025_SOURCE.officialCurriculumVolume.url ||
    sourceBinding.printedAt !== DM221_2025_SOURCE.officialCurriculumVolume.printedAt ||
    sourceBinding.pageNumbering !== DM221_2025_SOURCE.officialCurriculumVolume.pageNumbering
  ) {
    return {
      valid: false,
      reason: 'Il pacchetto è legato a una pubblicazione curricolare diversa da quella registrata in Arena.',
    };
  }

  if (!Array.isArray(value.receipts)) {
    return { valid: false, reason: 'Il pacchetto non contiene un elenco di ricevute.' };
  }

  return { valid: true, receipts: value.receipts };
}

export function buildFinalPublicationReviewPackage(
  receipts: readonly FinalPublicationSourceVerificationReceipt[],
  exportedAt = new Date().toISOString(),
): FinalPublicationReviewPackage {
  if (Number.isNaN(Date.parse(exportedAt))) {
    throw new Error('FINAL_PUBLICATION_REVIEW_PACKAGE_BLOCKED: data di esportazione non valida.');
  }

  const invalid = receipts.find(
    (receipt) => !validateFinalPublicationSourceVerificationReceipt(receipt).valid,
  );
  if (invalid) {
    throw new Error(
      `FINAL_PUBLICATION_REVIEW_PACKAGE_BLOCKED: ricevuta non valida per ${invalid.elementId}.`,
    );
  }

  return {
    schemaVersion: FINAL_PUBLICATION_REVIEW_PACKAGE_SCHEMA,
    exportedAt,
    inventoryElementCount: EXPECTED_INVENTORY_COUNT,
    sourceBinding: {
      sourceId: DM221_2025_SOURCE_ID,
      curriculumVolumeUrl: DM221_2025_SOURCE.officialCurriculumVolume.url,
      printedAt: DM221_2025_SOURCE.officialCurriculumVolume.printedAt,
      pageNumbering: DM221_2025_SOURCE.officialCurriculumVolume.pageNumbering,
    },
    receipts: [...receipts],
  };
}

export function importFinalPublicationReviewPackage(
  raw: unknown,
  existingReceipts: readonly FinalPublicationSourceVerificationReceipt[],
): FinalPublicationReviewImportResult {
  const packageValidation = validatePackageBinding(raw);
  if (!packageValidation.valid) {
    return {
      acceptedReceipts: [...existingReceipts],
      findings: [],
      addedCount: 0,
      duplicateCount: 0,
      conflictCount: 0,
      invalidCount: 0,
      packageAccepted: false,
      packageReason: packageValidation.reason,
    };
  }

  const accepted = new Map<string, FinalPublicationSourceVerificationReceipt>();
  for (const receipt of existingReceipts) {
    if (validateFinalPublicationSourceVerificationReceipt(receipt).valid) {
      accepted.set(receipt.elementId, receipt);
    }
  }

  const findings: ReceiptImportFinding[] = [];

  for (const candidate of packageValidation.receipts) {
    const receipt = candidate as FinalPublicationSourceVerificationReceipt;
    const validation = validateFinalPublicationSourceVerificationReceipt(receipt);
    if (!validation.valid) {
      findings.push({
        elementId: typeof receipt?.elementId === 'string' ? receipt.elementId : 'UNKNOWN',
        disposition: 'INVALID',
        reason: validation.reason,
      });
      continue;
    }

    const current = accepted.get(receipt.elementId);
    if (!current) {
      accepted.set(receipt.elementId, receipt);
      findings.push({
        elementId: receipt.elementId,
        disposition: 'ADDED',
        reason: 'Ricevuta valida aggiunta al registro locale.',
      });
      continue;
    }

    if (sameReceipt(current, receipt)) {
      findings.push({
        elementId: receipt.elementId,
        disposition: 'DUPLICATE',
        reason: 'La stessa ricevuta è già presente; nessuna duplicazione effettuata.',
      });
      continue;
    }

    findings.push({
      elementId: receipt.elementId,
      disposition: 'CONFLICT',
      reason: 'Esiste già una ricevuta diversa per lo stesso elemento; nessuna versione è stata sovrascritta automaticamente.',
    });
  }

  const count = (disposition: ReceiptImportDisposition) =>
    findings.filter((finding) => finding.disposition === disposition).length;

  return {
    acceptedReceipts: [...accepted.values()],
    findings,
    addedCount: count('ADDED'),
    duplicateCount: count('DUPLICATE'),
    conflictCount: count('CONFLICT'),
    invalidCount: count('INVALID'),
    packageAccepted: true,
  };
}
