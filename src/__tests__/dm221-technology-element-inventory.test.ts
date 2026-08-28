import { describe, expect, it } from 'vitest';
import {
  DM221_TECHNOLOGY_ELEMENT_COUNTS,
  DM221_TECHNOLOGY_ELEMENT_INVENTORY,
  getTechnologyInventoryGroup,
} from '../domain/curriculum/national/technologyElementInventory';
import { assessElementBinding } from '../domain/curriculum/national/elementBindings';

describe('DM221 Technology element inventory', () => {
  it('contains exactly 61 located elements with the expected group counts', () => {
    expect(DM221_TECHNOLOGY_ELEMENT_INVENTORY).toHaveLength(61);
    expect(DM221_TECHNOLOGY_ELEMENT_COUNTS).toEqual({
      PRIMARY_EXPECTED_COMPETENCES: 8,
      PRIMARY_GRADE3_OBJECTIVES: 8,
      PRIMARY_GRADE5_OBJECTIVES: 12,
      PRIMARY_KNOWLEDGE: 3,
      LOWER_SECONDARY_EXPECTED_COMPETENCES: 8,
      LOWER_SECONDARY_GRADE3_OBJECTIVES: 18,
      LOWER_SECONDARY_KNOWLEDGE: 4,
    });
  });

  it('keeps every inventory item source-located but not source-verified', () => {
    for (const item of DM221_TECHNOLOGY_ELEMENT_INVENTORY) {
      expect(item.sourceBindingStatus).toBe('SOURCE_LOCATED');
      expect(item.verifiedByHuman).toBe(false);
      expect(item.canonicalTextStatus).toBe('SOURCE_LOCATED_ONLY');
      expect(assessElementBinding(item)).toMatchObject({
        canTreatAsSourceVerified: false,
        canUseAsCanonicalSourceText: false,
      });
    }
  });

  it('uses stable one-based ordinals inside each group', () => {
    for (const [group, expectedCount] of Object.entries(DM221_TECHNOLOGY_ELEMENT_COUNTS)) {
      const items = getTechnologyInventoryGroup(group as keyof typeof DM221_TECHNOLOGY_ELEMENT_COUNTS);
      expect(items).toHaveLength(expectedCount);
      expect(items.map((item) => item.ordinal)).toEqual(
        Array.from({ length: expectedCount }, (_, index) => index + 1),
      );
    }
  });

  it('keeps primary and lower-secondary elements separated', () => {
    expect(
      getTechnologyInventoryGroup('PRIMARY_GRADE5_OBJECTIVES').every(
        (item) => item.schoolOrder === 'primaria',
      ),
    ).toBe(true);
    expect(
      getTechnologyInventoryGroup('LOWER_SECONDARY_GRADE3_OBJECTIVES').every(
        (item) => item.schoolOrder === 'secondaria',
      ),
    ).toBe(true);
  });
});
