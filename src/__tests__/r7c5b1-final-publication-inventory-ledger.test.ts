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
import { DM221_R7C5B2C_ELEMENT_COUNTS } from '../domain/curriculum/national/r7c5b2cRemainingElementInventory';
import { DM221_TECHNOLOGY_ELEMENT_INVENTORY } from '../domain/curriculum/national/technologyElementInventory';

describe('R7C5 final-publication element inventory ledger', () => {
  it('closes all 22 structural inventory scopes with concrete counts', () => {
    expect(DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER).toHaveLength(22);
    expect(getVerifiedFinalPublicationInventoryCount()).toBe(868);
    expect(getPendingFinalPublicationInventoryEntries()).toHaveLength(0);
    expect(DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER.every((entry) => entry.countStatus === 'COUNT_VERIFIED')).toBe(true);
    expect(() => assertNoGuessedFinalPublicationCounts()).not.toThrow();
    expect(() => assertVerifiedInventoryBackedByConcreteItems()).not.toThrow();
  });

  it('keeps every verified count non-authoritative at source-text level', () => {
    for (const entry of DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER) {
      expect(entry.countStatus).toBe('COUNT_VERIFIED');
      expect(entry.elementCount).toBeGreaterThan(0);
      expect(entry.humanSourceTextVerified).toBe(false);
    }
  });

  it('records the four language inventories as concrete verified structural counts', () => {
    expect(DM221_LANGUAGE_ELEMENT_COUNTS).toEqual({
      ITALIANO: 36,
      LEL: 21,
      LINGUA_INGLESE: 51,
      SECONDA_LINGUA_COMUNITARIA: 30,
    });
  });

  it('records R7C5B2B humanities, STEM, mathematics and science counts', () => {
    expect(DM221_R7C5B2B_ELEMENT_COUNTS).toEqual({
      STORIA: 93,
      GEOGRAFIA: 81,
      STEM: 8,
      MATEMATICA: 78,
      SCIENZE: 113,
    });
  });

  it('records the six R7C5B2C closing inventories', () => {
    expect(DM221_R7C5B2C_ELEMENT_COUNTS).toEqual({
      INFANZIA_GENERAL_FRAMEWORK: 5,
      MUSICA: 50,
      STRUMENTO_MUSICALE: 53,
      ARTE_E_IMMAGINE: 61,
      EDUCAZIONE_MOTORIA: 38,
      EDUCAZIONE_FISICA: 27,
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

  it('keeps primary motor education and lower-secondary physical education distinct after closure', () => {
    const primary = DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER.find(
      (entry) => entry.segmentId === 'dm221-disc-educazione-motoria',
    );
    const secondary = DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER.find(
      (entry) => entry.segmentId === 'dm221-disc-educazione-fisica',
    );

    expect(primary?.id).not.toBe(secondary?.id);
    expect(primary).toMatchObject({
      sectionId: 'EDUCAZIONE_MOTORIA_E_FISICA',
      countStatus: 'COUNT_VERIFIED',
      elementCount: 38,
    });
    expect(secondary).toMatchObject({
      sectionId: 'EDUCAZIONE_MOTORIA_E_FISICA',
      countStatus: 'COUNT_VERIFIED',
      elementCount: 27,
    });
  });

  it('does not confuse conditional offerings or STEM with universal disciplines', () => {
    expect(
      DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER.find((entry) => entry.segmentId === 'dm221-offering-lel')?.scopeKind,
    ).toBe('CONDITIONAL_OFFERING');
    expect(
      DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER.find((entry) => entry.segmentId === 'dm221-offering-strumento-musicale'),
    ).toMatchObject({ scopeKind: 'CONDITIONAL_OFFERING', countStatus: 'COUNT_VERIFIED', elementCount: 53 });
    expect(
      DM221_FINAL_PUBLICATION_ELEMENT_INVENTORY_LEDGER.find((entry) => entry.segmentId === 'dm221-framework-stem'),
    ).toMatchObject({ scopeKind: 'CROSS_DISCIPLINARY_FRAMEWORK', countStatus: 'COUNT_VERIFIED', elementCount: 8 });
  });
});
