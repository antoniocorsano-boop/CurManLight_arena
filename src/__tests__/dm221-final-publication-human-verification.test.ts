import { describe, expect, it } from 'vitest';
import {
  buildFinalPublicationSourceReviewQueue,
  isInstitutionallyAdoptedFinalPublicationElement,
  migrateTechnologySourceVerificationReceipt,
  promoteFinalPublicationElementFromHumanReceipt,
  validateFinalPublicationSourceVerificationReceipt,
  type FinalPublicationSourceVerificationReceipt,
} from '../domain/curriculum/national/finalPublicationHumanVerification';
import {
  buildTechnologySourceReviewQueue,
  type TechnologySourceVerificationReceipt,
} from '../domain/curriculum/national/technologyHumanVerification';

function validReceipt(
  overrides: Partial<FinalPublicationSourceVerificationReceipt> = {},
): FinalPublicationSourceVerificationReceipt {
  const task = buildFinalPublicationSourceReviewQueue()[0];
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
    verifiedSourceText: 'Testo letto personalmente nella pubblicazione finale MIM.',
    reviewerAttestation: true,
    reviewedAt: '2026-09-03T20:00:00+02:00',
    ...overrides,
  };
}

describe('DM221 final-publication human source verification', () => {
  it('builds exactly one review task for every structural slot', () => {
    const queue = buildFinalPublicationSourceReviewQueue();
    expect(queue).toHaveLength(868);
    expect(new Set(queue.map((task) => task.elementId)).size).toBe(868);
    expect(queue.every((task) => task.status === 'AWAITING_HUMAN_SOURCE_REVIEW')).toBe(true);
    expect(queue.every((task) => task.page > 0 && task.section.length > 0)).toBe(true);
  });

  it('preserves source-native identities and expected scope totals', () => {
    const queue = buildFinalPublicationSourceReviewQueue();
    const count = (segmentId: string) => queue.filter((task) => task.segmentId === segmentId).length;

    expect(count('dm221-infanzia-general-framework')).toBe(5);
    expect(count('dm221-infanzia-transition-to-primary')).toBe(1);
    expect(count('dm221-disc-italiano')).toBe(36);
    expect(count('dm221-disc-tecnologia')).toBe(61);
    expect(count('dm221-offering-strumento-musicale')).toBe(53);
    expect(count('dm221-disc-educazione-motoria')).toBe(38);
    expect(count('dm221-disc-educazione-fisica')).toBe(27);
  });

  it('rejects a receipt whose structural identity or locator does not match', () => {
    expect(validateFinalPublicationSourceVerificationReceipt(validReceipt({ page: 999 }))).toMatchObject({ valid: false });
    expect(validateFinalPublicationSourceVerificationReceipt(validReceipt({ ordinal: 99 }))).toMatchObject({ valid: false });
    expect(validateFinalPublicationSourceVerificationReceipt(validReceipt({ segmentId: 'wrong-segment' }))).toMatchObject({ valid: false });
  });

  it('requires human-provided text for a positive verification', () => {
    expect(
      validateFinalPublicationSourceVerificationReceipt(validReceipt({ verifiedSourceText: '   ' })),
    ).toMatchObject({ valid: false });
  });

  it('promotes only a valid human VERIFIED receipt and never institutional adoption', () => {
    const promoted = promoteFinalPublicationElementFromHumanReceipt(validReceipt());
    expect(promoted.sourceBindingStatus).toBe('SOURCE_VERIFIED');
    expect(promoted.verifiedByHuman).toBe(true);
    expect(promoted.canonicalTextStatus).toBe('HUMAN_VERIFIED_SOURCE_TEXT');
    expect(promoted.canonicalText).toBe('Testo letto personalmente nella pubblicazione finale MIM.');
    expect(isInstitutionallyAdoptedFinalPublicationElement(promoted)).toBe(false);

    expect(() =>
      promoteFinalPublicationElementFromHumanReceipt(validReceipt({ decision: 'NEEDS_CORRECTION' })),
    ).toThrow(/solo|only/i);
  });

  it('migrates a valid legacy Technology receipt without changing its decision or source text', () => {
    const task = buildTechnologySourceReviewQueue()[0];
    const legacy: TechnologySourceVerificationReceipt = {
      schemaVersion: 'dm221-tech-source-review-v1',
      elementId: task.elementId,
      sourceId: task.sourceId,
      page: task.page,
      section: task.section,
      ordinal: task.ordinal,
      decision: 'VERIFIED',
      verifiedSourceText: 'Testo tecnologia già controllato.',
      reviewerAttestation: true,
      reviewedAt: '2026-09-03T19:00:00+02:00',
    };

    const migrated = migrateTechnologySourceVerificationReceipt(legacy);
    expect(migrated).not.toBeNull();
    expect(migrated).toMatchObject({
      schemaVersion: 'dm221-final-publication-source-review-v1',
      elementId: legacy.elementId,
      decision: 'VERIFIED',
      verifiedSourceText: legacy.verifiedSourceText,
    });
  });
});
