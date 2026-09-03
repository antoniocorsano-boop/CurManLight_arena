import { DM221_2025_SOURCE, DM221_2025_SOURCE_ID } from './dm2212025';

export const FINAL_PUBLICATION_FINGERPRINT_SCHEMA =
  'dm221-final-publication-source-fingerprint-v1' as const;

export interface FinalPublicationSourceFingerprintReceipt {
  schemaVersion: typeof FINAL_PUBLICATION_FINGERPRINT_SCHEMA;
  sourceId: typeof DM221_2025_SOURCE_ID;
  curriculumVolumeUrl: string;
  printedAt: string;
  pageNumbering: string;
  algorithm: 'SHA-256';
  sha256: string;
  byteLength: number;
  fileName: string;
  computedAt: string;
  /**
   * Attestazione umana: il file selezionato è quello ottenuto dal collegamento
   * ufficiale MIM registrato in Arena. L'hash da solo non prova la provenienza.
   */
  sourceOriginAttestation: true;
}

export interface FinalPublicationFingerprintAssessment {
  receiptValid: boolean;
  canonicalFingerprintAvailable: boolean;
  matchesCanonicalFingerprint: boolean;
  canSatisfyNationalPrescriptiveFingerprintGate: boolean;
  reason: string;
}

const SHA256_HEX = /^[a-f0-9]{64}$/i;

export async function computeSha256Hex(bytes: ArrayBuffer): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function validateFinalPublicationSourceFingerprintReceipt(
  receipt: FinalPublicationSourceFingerprintReceipt,
): { valid: true } | { valid: false; reason: string } {
  if (receipt.schemaVersion !== FINAL_PUBLICATION_FINGERPRINT_SCHEMA) {
    return { valid: false, reason: 'Schema dell’impronta sorgente non riconosciuto.' };
  }

  if (
    receipt.sourceId !== DM221_2025_SOURCE_ID ||
    receipt.curriculumVolumeUrl !== DM221_2025_SOURCE.officialCurriculumVolume.url ||
    receipt.printedAt !== DM221_2025_SOURCE.officialCurriculumVolume.printedAt ||
    receipt.pageNumbering !== DM221_2025_SOURCE.officialCurriculumVolume.pageNumbering
  ) {
    return { valid: false, reason: 'L’impronta non è legata alla pubblicazione finale MIM registrata in Arena.' };
  }

  if (receipt.algorithm !== 'SHA-256' || !SHA256_HEX.test(receipt.sha256)) {
    return { valid: false, reason: 'L’impronta SHA-256 non è valida.' };
  }

  if (!Number.isInteger(receipt.byteLength) || receipt.byteLength <= 0) {
    return { valid: false, reason: 'La dimensione del file sorgente non è valida.' };
  }

  if (!receipt.fileName.trim()) {
    return { valid: false, reason: 'Manca il nome del file sottoposto a impronta.' };
  }

  if (!receipt.computedAt || Number.isNaN(Date.parse(receipt.computedAt))) {
    return { valid: false, reason: 'La data di calcolo dell’impronta non è valida.' };
  }

  if (receipt.sourceOriginAttestation !== true) {
    return { valid: false, reason: 'Manca l’attestazione umana di provenienza dal collegamento ufficiale MIM.' };
  }

  return { valid: true };
}

export function buildFinalPublicationSourceFingerprintReceipt(input: {
  sha256: string;
  byteLength: number;
  fileName: string;
  computedAt?: string;
  sourceOriginAttestation: true;
}): FinalPublicationSourceFingerprintReceipt {
  const receipt: FinalPublicationSourceFingerprintReceipt = {
    schemaVersion: FINAL_PUBLICATION_FINGERPRINT_SCHEMA,
    sourceId: DM221_2025_SOURCE_ID,
    curriculumVolumeUrl: DM221_2025_SOURCE.officialCurriculumVolume.url,
    printedAt: DM221_2025_SOURCE.officialCurriculumVolume.printedAt,
    pageNumbering: DM221_2025_SOURCE.officialCurriculumVolume.pageNumbering,
    algorithm: 'SHA-256',
    sha256: input.sha256.toLowerCase(),
    byteLength: input.byteLength,
    fileName: input.fileName,
    computedAt: input.computedAt ?? new Date().toISOString(),
    sourceOriginAttestation: input.sourceOriginAttestation,
  };

  const validation = validateFinalPublicationSourceFingerprintReceipt(receipt);
  if (!validation.valid) {
    throw new Error(`FINAL_PUBLICATION_FINGERPRINT_BLOCKED: ${validation.reason}`);
  }
  return receipt;
}

export function assessFinalPublicationSourceFingerprint(
  receipt: FinalPublicationSourceFingerprintReceipt,
): FinalPublicationFingerprintAssessment {
  const validation = validateFinalPublicationSourceFingerprintReceipt(receipt);
  if (!validation.valid) {
    return {
      receiptValid: false,
      canonicalFingerprintAvailable: false,
      matchesCanonicalFingerprint: false,
      canSatisfyNationalPrescriptiveFingerprintGate: false,
      reason: validation.reason,
    };
  }

  const expected = DM221_2025_SOURCE.officialCurriculumVolume.contentFingerprint.sha256;
  if (!expected) {
    return {
      receiptValid: true,
      canonicalFingerprintAvailable: false,
      matchesCanonicalFingerprint: false,
      canSatisfyNationalPrescriptiveFingerprintGate: false,
      reason: 'L’evidenza locale è valida, ma nel registro non è ancora presente un’impronta canonica attesa del PDF finale.',
    };
  }

  const matches = expected.toLowerCase() === receipt.sha256.toLowerCase();
  return {
    receiptValid: true,
    canonicalFingerprintAvailable: true,
    matchesCanonicalFingerprint: matches,
    canSatisfyNationalPrescriptiveFingerprintGate: matches,
    reason: matches
      ? 'L’impronta selezionata coincide con l’impronta canonica registrata.'
      : 'L’impronta selezionata non coincide con l’impronta canonica registrata.',
  };
}
