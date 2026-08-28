import { describe, expect, it } from 'vitest';
import {
  buildTechnologySourceReviewQueue,
  isInstitutionallyAdoptedTechnologyElement,
  promoteTechnologyElementFromHumanReceipt,
  validateTechnologySourceVerificationReceipt,
  type TechnologySourceVerificationReceipt,
} from '../domain/curriculum/national/technologyHumanVerification';

function validReceipt(overrides: Partial<TechnologySourceVerificationReceipt> = {}): TechnologySourceVerificationReceipt {
  const task = buildTechnologySourceReviewQueue()[0];
  return {
    schemaVersion: 'dm221-tech-source-review-v1',
    elementId: task.elementId,
    sourceId: task.sourceId,
    page: task.page,
    section: task.section,
    ordinal: task.ordinal,
    decision: 'VERIFIED',
    verifiedSourceText: 'Testo letto sulla fonte ufficiale e riportato dal revisore umano.',
    reviewerAttestation: true,
    reviewedAt: '2026-08-28T10:00:00+02:00',
    ...overrides,
  };
}

describe('DM221 Technology human source verification', () => {
  it('creates one human review task for each of the 61 inventory elements', () => {
    const queue = buildTechnologySourceReviewQueue();
    expect(queue).toHaveLength(61);
    expect(new Set(queue.map((task) => task.elementId)).size).toBe(61);
    expect(queue.every((task) => task.status === 'AWAITING_HUMAN_SOURCE_REVIEW')).toBe(true);
  });

  it('rejects receipts whose locator does not match the canonical inventory', () => {
    expect(validateTechnologySourceVerificationReceipt(validReceipt({ page: 999 }))).toMatchObject({ valid: false });
    expect(validateTechnologySourceVerificationReceipt(validReceipt({ ordinal: 99 }))).toMatchObject({ valid: false });
  });

  it('rejects a positive verification without human-provided source text', () => {
    expect(validateTechnologySourceVerificationReceipt(validReceipt({ verifiedSourceText: '   ' }))).toMatchObject({ valid: false });
  });

  it('does not promote rejected or correction-needed receipts', () => {
    expect(() => promoteTechnologyElementFromHumanReceipt(validReceipt({ decision: 'REJECTED' }))).toThrow(/only|solo/i);
    expect(() => promoteTechnologyElementFromHumanReceipt(validReceipt({ decision: 'NEEDS_CORRECTION' }))).toThrow(/only|solo/i);
  });

  it('promotes only a valid human VERIFIED receipt to source-verified canonical text', () => {
    const promoted = promoteTechnologyElementFromHumanReceipt(validReceipt());
    expect(promoted.sourceBindingStatus).toBe('SOURCE_VERIFIED');
    expect(promoted.verifiedByHuman).toBe(true);
    expect(promoted.canonicalTextStatus).toBe('HUMAN_VERIFIED_SOURCE_TEXT');
    expect(promoted.canonicalText.length).toBeGreaterThan(0);
  });

  it('keeps institutional adoption false even after source-text verification', () => {
    const promoted = promoteTechnologyElementFromHumanReceipt(validReceipt());
    expect(isInstitutionallyAdoptedTechnologyElement(promoted)).toBe(false);
  });
});
