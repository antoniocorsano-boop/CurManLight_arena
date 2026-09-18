import { describe, expect, it } from 'vitest';
import { assessElementBinding } from '../domain/curriculum/national/elementBindings';
import {
  DM221_LANGUAGE_ELEMENT_COUNTS,
  DM221_LANGUAGE_ELEMENT_GROUPS,
  DM221_LANGUAGE_ELEMENT_INVENTORY,
  getLanguageInventory,
} from '../domain/curriculum/national/languageElementInventory';

describe('R7C5B2A final-publication language element inventory', () => {
  it('freezes the recounted structural totals for the four language sections', () => {
    expect(DM221_LANGUAGE_ELEMENT_COUNTS).toEqual({
      ITALIANO: 36,
      LEL: 21,
      LINGUA_INGLESE: 51,
      SECONDA_LINGUA_COMUNITARIA: 30,
    });
    expect(DM221_LANGUAGE_ELEMENT_INVENTORY).toHaveLength(138);
  });

  it('preserves the source-native group counts instead of normalizing disciplines to one template', () => {
    expect(
      Object.fromEntries(
        DM221_LANGUAGE_ELEMENT_GROUPS
          .filter((group) => group.inventoryId === 'ITALIANO')
          .map((group) => [group.group, group.count]),
      ),
    ).toEqual({
      PRIMARY_EXPECTED_COMPETENCES: 5,
      PRIMARY_GRADE3_OBJECTIVES: 9,
      PRIMARY_GRADE5_OBJECTIVES: 6,
      PRIMARY_KNOWLEDGE: 2,
      LOWER_SECONDARY_EXPECTED_COMPETENCES: 5,
      LOWER_SECONDARY_GRADE3_OBJECTIVES: 7,
      LOWER_SECONDARY_KNOWLEDGE: 2,
    });

    expect(
      Object.fromEntries(
        DM221_LANGUAGE_ELEMENT_GROUPS
          .filter((group) => group.inventoryId === 'LEL')
          .map((group) => [group.group, group.count]),
      ),
    ).toEqual({
      LOWER_SECONDARY_EXPECTED_COMPETENCES: 5,
      LOWER_SECONDARY_GRADE3_OBJECTIVES: 15,
      LOWER_SECONDARY_KNOWLEDGE: 1,
    });

    expect(
      Object.fromEntries(
        DM221_LANGUAGE_ELEMENT_GROUPS
          .filter((group) => group.inventoryId === 'LINGUA_INGLESE')
          .map((group) => [group.group, group.count]),
      ),
    ).toEqual({
      PRIMARY_EXPECTED_COMPETENCES: 5,
      PRIMARY_GRADE3_OBJECTIVES: 10,
      PRIMARY_GRADE5_OBJECTIVES: 12,
      PRIMARY_KNOWLEDGE: 1,
      LOWER_SECONDARY_EXPECTED_COMPETENCES: 5,
      LOWER_SECONDARY_GRADE3_OBJECTIVES: 17,
      LOWER_SECONDARY_KNOWLEDGE: 1,
    });

    expect(
      Object.fromEntries(
        DM221_LANGUAGE_ELEMENT_GROUPS
          .filter((group) => group.inventoryId === 'SECONDA_LINGUA_COMUNITARIA')
          .map((group) => [group.group, group.count]),
      ),
    ).toEqual({
      LOWER_SECONDARY_EXPECTED_COMPETENCES: 6,
      LOWER_SECONDARY_OBJECTIVES: 13,
      LOWER_SECONDARY_KNOWLEDGE: 11,
    });
  });

  it('keeps every language element source-located but non-authoritative', () => {
    for (const item of DM221_LANGUAGE_ELEMENT_INVENTORY) {
      expect(item.sourceBindingStatus).toBe('SOURCE_LOCATED');
      expect(item.verifiedByHuman).toBe(false);
      expect(item.canonicalTextStatus).toBe('SOURCE_LOCATED_ONLY');
      expect(item.sourceLocator.page).toBeGreaterThanOrEqual(70);
      expect(assessElementBinding(item)).toMatchObject({
        canTreatAsSourceVerified: false,
        canUseAsCanonicalSourceText: false,
      });
    }
  });

  it('keeps LEL conditional and second-language variants under the single canonical segment', () => {
    expect(getLanguageInventory('LEL').every((item) => item.segmentId === 'dm221-offering-lel')).toBe(true);
    expect(
      getLanguageInventory('SECONDA_LINGUA_COMUNITARIA').every(
        (item) => item.segmentId === 'dm221-disc-seconda-lingua',
      ),
    ).toBe(true);
    expect(
      getLanguageInventory('SECONDA_LINGUA_COMUNITARIA').some((item) =>
        ['dm221-disc-francese', 'dm221-disc-spagnolo', 'dm221-disc-tedesco'].includes(item.segmentId),
      ),
    ).toBe(false);
  });
});
