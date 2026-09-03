import { describe, expect, it } from 'vitest';
import { DM221_2025_SOURCE } from '../domain/curriculum/national/dm2212025';
import {
  assessFinalPublicationSourceFingerprint,
  buildFinalPublicationSourceFingerprintReceipt,
  computeSha256Hex,
  validateFinalPublicationSourceFingerprintReceipt,
  type FinalPublicationSourceFingerprintReceipt,
} from '../domain/curriculum/national/finalPublicationSourceFingerprint';

const ABC_SHA256 = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';

describe('R7C5C3 final-publication source fingerprint gate', () => {
  it('keeps the canonical PDF fingerprint explicitly required and unavailable', () => {
    expect(DM221_2025_SOURCE.officialCurriculumVolume.contentFingerprint).toMatchObject({
      algorithm: 'SHA-256',
      status: 'REQUIRED',
      sha256: null,
    });
  });

  it('computes standard SHA-256 locally', async () => {
    const bytes = new TextEncoder().encode('abc').buffer as ArrayBuffer;
    expect(await computeSha256Hex(bytes)).toBe(ABC_SHA256);
  });

  it('accepts human-attested fingerprint evidence for the registered final MIM volume', () => {
    const receipt = buildFinalPublicationSourceFingerprintReceipt({
      sha256: ABC_SHA256,
      byteLength: 3,
      fileName: 'curricolo_web.pdf',
      computedAt: '2026-09-03T21:30:00+02:00',
      sourceOriginAttestation: true,
    });

    expect(validateFinalPublicationSourceFingerprintReceipt(receipt)).toEqual({ valid: true });
    expect(receipt.curriculumVolumeUrl).toBe(DM221_2025_SOURCE.officialCurriculumVolume.url);
  });

  it('does not let local fingerprint evidence satisfy NATIONAL_PRESCRIPTIVE while canonical hash is absent', () => {
    const receipt = buildFinalPublicationSourceFingerprintReceipt({
      sha256: ABC_SHA256,
      byteLength: 3,
      fileName: 'curricolo_web.pdf',
      sourceOriginAttestation: true,
    });

    expect(assessFinalPublicationSourceFingerprint(receipt)).toMatchObject({
      receiptValid: true,
      canonicalFingerprintAvailable: false,
      matchesCanonicalFingerprint: false,
      canSatisfyNationalPrescriptiveFingerprintGate: false,
    });
  });

  it('rejects missing source-origin attestation even with a syntactically valid hash', () => {
    const invalid = {
      schemaVersion: 'dm221-final-publication-source-fingerprint-v1',
      sourceId: DM221_2025_SOURCE.id,
      curriculumVolumeUrl: DM221_2025_SOURCE.officialCurriculumVolume.url,
      printedAt: DM221_2025_SOURCE.officialCurriculumVolume.printedAt,
      pageNumbering: DM221_2025_SOURCE.officialCurriculumVolume.pageNumbering,
      algorithm: 'SHA-256',
      sha256: ABC_SHA256,
      byteLength: 3,
      fileName: 'curricolo_web.pdf',
      computedAt: '2026-09-03T21:30:00+02:00',
      sourceOriginAttestation: false,
    } as unknown as FinalPublicationSourceFingerprintReceipt;

    expect(validateFinalPublicationSourceFingerprintReceipt(invalid)).toMatchObject({ valid: false });
  });
});
