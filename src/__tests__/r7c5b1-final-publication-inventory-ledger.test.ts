import { describe, expect, it } from 'vitest';
import {
  DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER,
  assertNoGuessedFinalPublicationCounts,
  assertVerifiedInventoryBackedByConcreteItems,
  getPendingFinalPublicationInventoryEntries,
  getVerifiedFinalPublicationInventoryCount,
} from '../domain/curriculum/national/finalPublicationElementInventoryLedger';
import { DM221_LANGUAGE_ELEMENT_COUNTS } from '../domain/curriculum/national/languageElementInventory';
import { DM221_R7C5B2B_ELEMENT_COUNTS } from '../domain/curriculum/national/r7c5b2bElementInventory';
import { DM221_TECHNOLOGY_ELEMENT_INVENTORY } from '../domain/curriculum/national/technologyElementInventory';

describe('R7C5 final-publication element inventory ledger', () => {
  it('records verified counts only where concrete structural inventories exist', () => {
    expect(DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER).toHaveLength(22);
    expect(getVerifiedFinalPublicationInventoryCount()).toBe(634);
    expect(getPendingFinalPublicationInventoryEntries()).toHaveLength(6);
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

  it('records the four language inventories as concrete verified structural counts', () => {
    expect(DM221_LANGUAGE_ELEMENT_COUNTS).toEqual({
      ITALIANO: 36,
      LEL: 21,
      LINGUA_INGLESE: 51,
      SECONDA_LINGUA_COMUNITARIA: 30,
    });

    expect(
      DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER.find((entry) => entry.segmentId === 'dm221-disc-italiano'),
    ).toMatchObject({ countStatus: 'COUNT_VERIFIED', elementCount: 36 });
    expect(
      DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER.find((entry) => entry.segmentId === 'dm221-offering-lel'),
    ).toMatchObject({ countStatus: 'COUNT_VERIFIED', elementCount: 21, scopeKind: 'CONDITIONAL_OFFERING' });
    expect(
      DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER.find((entry) => entry.segmentId === 'dm221-disc-inglese'),
    ).toMatchObject({ countStatus: 'COUNT_VERIFIED', elementCount: 51 });
    expect(
      DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER.find((entry) => entry.segmentId === 'dm221-disc-seconda-lingua'),
    ).toMatchObject({ countStatus: 'COUNT_VERIFIED', elementCount: 30 });
  });

  it('records R7C5B2B humanities, STEM, mathematics and science counts from concrete inventories', () => {
    expect(DM221_R7C5B2B_ELEMENT_COUNTS).toEqual({
      STORIA: 93,
      GEOGRAFIA: 81,
      STEM: 8,
      MATEMATICA: 78,
      SCIENZE: 113,
    });

    const expected = [
      ['dm221-disc-storia', 93],
      ['dm221-disc-geografia', 81],
      ['dm221-framework-stem', 8],
      ['dm221-disc-matematica', 78],
      ['dm221-disc-scienze', 113],
    ] as const;

    for (const [segmentId, elementCount] of expected) {
      expect(
        DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER.find((entry) => entry.segmentId === segmentId),
      ).toMatchObject({ countStatus: 'COUNT_VERIFIED', elementCount, humanSourceTextVerified: false });
    }
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
      DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER.find((entry) => entry.segmentId === 'dm221-framework-stem'),
    ).toMatchObject({ scopeKind: 'CROSS_DISCIPLINARY_FRAMEWORK', countStatus: 'COUNT_VERIFIED', elementCount: 8 });
  });
});
