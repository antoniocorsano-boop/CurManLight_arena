import { describe, expect, it } from 'vitest';
import {
  DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER,
  assertNoGuessedFinalPublicationCounts,
  assertVerifiedInventoryBackedByConcreteItems,
  getPendingFinalPublicationInventoryEntries,
  getVerifiedFinalPublicationInventoryCount,
} from '../domain/curriculum/national/finalPublicationElementInventoryLedger';
import { DM221_TECHNOLOGY_ELEMENT_INVENTORY } from '../domain/curriculum/national/technologyElementInventory';

describe('R7C5B1 final-publication element inventory ledger', () => {
  it('records verified counts only where concrete structural inventories exist', () => {
    expect(DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER).toHaveLength(22);
    expect(getVerifiedFinalPublicationInventoryCount()).toBe(123);
    expect(getPendingFinalPublicationInventoryEntries()).toHaveLength(15);
    expect(() => assertNoGuessedFinalPublicationCounts()).not.toThrow();
    expect(() => assertVerifiedInventoryBackedByConcreteItems()).not.toThrow();
  });

  it('keeps all pending sections fail-closed with no guessed numeric count', () => {
    getPendingFinalPublicationInventoryEntries().forEach((entry) => {
      expect(entry.countStatus).toBe('COUNT_REQUIRED');
      expect(entry.elementCount).toBeUndefined();
      expect(entry.humanSourceTextVerified).toBe(false);
    });
  });

  it('revalidates Technology as 61 structural elements on the final publication', () => {
    const technology = DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER.find(
      (entry) => entry.segmentId === 'dm221-disc-tecnologia',
    );
    expect(DM221_TECHNOLOGY_ELEMENT_INVENTORY).toHaveLength(61);
    expect(technology).toMatchObject({
      sectionId: 'TECNOLOGIA',
      pageStart: 140,
      pageEnd: 146,
      countStatus: 'COUNT_VERIFIED',
      elementCount: 61,
      humanSourceTextVerified: false,
    });
  });

  it('keeps primary motor education and lower-secondary physical education distinct', () => {
    const primary = DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER.find(
      (entry) => entry.segmentId === 'dm221-disc-educazione-motoria',
    );
    const secondary = DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER.find(
      (entry) => entry.segmentId === 'dm221-disc-educazione-fisica',
    );

    expect(primary?.id).not.toBe(secondary?.id);
    expect(primary?.sectionId).toBe('EDUCAZIONE_MOTORIA_E_FISICA');
    expect(secondary?.sectionId).toBe('EDUCAZIONE_MOTORIA_E_FISICA');
    expect(primary?.countStatus).toBe('COUNT_REQUIRED');
    expect(secondary?.countStatus).toBe('COUNT_REQUIRED');
  });

  it('does not confuse conditional offerings or STEM with universal disciplines', () => {
    expect(
      DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER.find((entry) => entry.segmentId === 'dm221-offering-lel')?.scopeKind,
    ).toBe('CONDITIONAL_OFFERING');
    expect(
      DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER.find((entry) => entry.segmentId === 'dm221-offering-strumento-musicale')?.scopeKind,
    ).toBe('CONDITIONAL_OFFERING');
    expect(
      DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER.find((entry) => entry.segmentId === 'dm221-framework-stem')?.scopeKind,
    ).toBe('CROSS_DISCIPLINARY_FRAMEWORK');
  });
});
