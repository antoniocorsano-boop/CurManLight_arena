import { describe, expect, it } from 'vitest';
import {
  buildFinalPublicationReviewPackage,
  importFinalPublicationReviewPackage,
  type FinalPublicationReviewPackage,
} from '../domain/curriculum/national/finalPublicationReviewReceiptExchange';
import {
  buildFinalPublicationSourceReviewQueue,
  type FinalPublicationSourceVerificationReceipt,
} from '../domain/curriculum/national/finalPublicationHumanVerification';

function receiptFor(
  index = 0,
  overrides: Partial<FinalPublicationSourceVerificationReceipt> = {},
): FinalPublicationSourceVerificationReceipt {
  const task = buildFinalPublicationSourceReviewQueue()[index];
  return {
    schemaVersion: 'dm221-final-publication-source-review-v1',
    elementId: task.elementId,
    segmentId: task.segmentId,
    group: task.group,
    ordinal: task.ordinal,
    sourceId: task.sourceId,
    page: task.page,
    section: task.section,
    decision: 'VERIFIED',
    verifiedSourceText: `Testo umano verificato ${index + 1}.`,
    reviewerAttestation: true,
    reviewedAt: `2026-09-03T20:${String(index).padStart(2, '0')}:00+02:00`,
    ...overrides,
  };
}

describe('R7C5C2 final-publication receipt exchange', () => {
  it('builds a source-bound package for the complete 868-slot inventory contract', () => {
    const packageFile = buildFinalPublicationReviewPackage(
      [receiptFor(0), receiptFor(1)],
      '2026-09-03T21:00:00+02:00',
    );

    expect(packageFile.schemaVersion).toBe('dm221-final-publication-source-review-package-v1');
    expect(packageFile.inventoryElementCount).toBe(868);
    expect(packageFile.receipts).toHaveLength(2);
    expect(packageFile.sourceBinding.pageNumbering).toBe('PRINTED_PAGE');
  });

  it('round-trips valid receipts without creating authority or duplicate entries', () => {
    const first = receiptFor(0);
    const second = receiptFor(1);
    const packageFile = buildFinalPublicationReviewPackage([first, second]);

    const imported = importFinalPublicationReviewPackage(packageFile, [first]);
    expect(imported.packageAccepted).toBe(true);
    expect(imported.addedCount).toBe(1);
    expect(imported.duplicateCount).toBe(1);
    expect(imported.conflictCount).toBe(0);
    expect(imported.invalidCount).toBe(0);
    expect(imported.acceptedReceipts).toHaveLength(2);
  });

  it('never overwrites a different local receipt for the same element', () => {
    const local = receiptFor(0, { notes: 'Versione locale' });
    const incoming = receiptFor(0, {
      notes: 'Versione importata diversa',
      reviewedAt: '2026-09-03T21:10:00+02:00',
    });

    const imported = importFinalPublicationReviewPackage(
      buildFinalPublicationReviewPackage([incoming]),
      [local],
    );

    expect(imported.conflictCount).toBe(1);
    expect(imported.addedCount).toBe(0);
    expect(imported.acceptedReceipts).toHaveLength(1);
    expect(imported.acceptedReceipts[0].notes).toBe('Versione locale');
  });

  it('rejects an entire package bound to a different final publication', () => {
    const packageFile = buildFinalPublicationReviewPackage([receiptFor(0)]);
    const foreignPackage: FinalPublicationReviewPackage = {
      ...packageFile,
      sourceBinding: {
        ...packageFile.sourceBinding,
        curriculumVolumeUrl: 'https://example.invalid/other-publication.pdf',
      },
    };

    const imported = importFinalPublicationReviewPackage(foreignPackage, []);
    expect(imported.packageAccepted).toBe(false);
    expect(imported.acceptedReceipts).toHaveLength(0);
    expect(imported.packageReason).toMatch(/pubblicazione curricolare diversa/i);
  });

  it('rejects invalid receipts individually while accepting valid siblings', () => {
    const valid = receiptFor(0);
    const invalid = receiptFor(1, { page: 999 });
    const packageFile = {
      ...buildFinalPublicationReviewPackage([valid]),
      receipts: [valid, invalid],
    };

    const imported = importFinalPublicationReviewPackage(packageFile, []);
    expect(imported.packageAccepted).toBe(true);
    expect(imported.addedCount).toBe(1);
    expect(imported.invalidCount).toBe(1);
    expect(imported.acceptedReceipts).toHaveLength(1);
  });

  it('accepts the legacy R7C5C1 raw receipt-array export through the compatibility path', () => {
    const imported = importFinalPublicationReviewPackage([receiptFor(0)], []);
    expect(imported.packageAccepted).toBe(true);
    expect(imported.addedCount).toBe(1);
    expect(imported.acceptedReceipts).toHaveLength(1);
  });
});
