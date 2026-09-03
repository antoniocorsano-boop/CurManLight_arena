import { describe, expect, it } from 'vitest';
import { assessElementBinding } from '../domain/curriculum/national/elementBindings';
import {
  DM221_R7C5B2B_ELEMENT_COUNTS,
  DM221_R7C5B2B_ELEMENT_GROUPS,
  DM221_R7C5B2B_ELEMENT_INVENTORY,
  getR7C5B2BInventory,
} from '../domain/curriculum/national/r7c5b2bElementInventory';

describe('R7C5B2B final-publication humanities STEM mathematics science inventory', () => {
  it('freezes the recounted structural totals', () => {
    expect(DM221_R7C5B2B_ELEMENT_COUNTS).toEqual({
      STORIA: 93,
      GEOGRAFIA: 81,
      STEM: 8,
      MATEMATICA: 78,
      SCIENZE: 113,
    });
    expect(DM221_R7C5B2B_ELEMENT_INVENTORY).toHaveLength(373);
  });

  it('preserves source-native group structures instead of applying one discipline template', () => {
    const groupsFor = (inventoryId: keyof typeof DM221_R7C5B2B_ELEMENT_COUNTS) =>
      Object.fromEntries(
        DM221_R7C5B2B_ELEMENT_GROUPS
          .filter((group) => group.inventoryId === inventoryId)
          .map((group) => [group.group, group.count]),
      );

    expect(groupsFor('STORIA')).toEqual({
      PRIMARY_EXPECTED_COMPETENCES: 4,
      PRIMARY_GRADE3_OBJECTIVES: 3,
      PRIMARY_GRADE5_OBJECTIVES: 4,
      PRIMARY_KNOWLEDGE: 36,
      LOWER_SECONDARY_EXPECTED_COMPETENCES: 3,
      LOWER_SECONDARY_GRADE3_OBJECTIVES: 5,
      LOWER_SECONDARY_KNOWLEDGE: 38,
    });

    expect(groupsFor('GEOGRAFIA')).toEqual({
      PRIMARY_EXPECTED_COMPETENCES: 5,
      PRIMARY_GRADE3_OBJECTIVES: 17,
      PRIMARY_GRADE5_OBJECTIVES: 14,
      PRIMARY_KNOWLEDGE: 6,
      LOWER_SECONDARY_EXPECTED_COMPETENCES: 4,
      LOWER_SECONDARY_GRADE3_OBJECTIVES: 25,
      LOWER_SECONDARY_KNOWLEDGE: 10,
    });

    expect(groupsFor('STEM')).toEqual({
      GENERAL_FRAMEWORK_NARRATIVE: 1,
      PRIMARY_GUIDANCE_NARRATIVE: 1,
      LOWER_SECONDARY_GUIDANCE_NARRATIVE: 1,
      INNOVATIVE_ASPECTS: 5,
    });

    expect(groupsFor('MATEMATICA')).toEqual({
      PRIMARY_EXPECTED_COMPETENCES: 8,
      PRIMARY_GRADE3_OBJECTIVES: 11,
      PRIMARY_GRADE5_OBJECTIVES: 14,
      PRIMARY_KNOWLEDGE: 4,
      LOWER_SECONDARY_EXPECTED_COMPETENCES: 8,
      LOWER_SECONDARY_GRADE3_OBJECTIVES: 28,
      LOWER_SECONDARY_KNOWLEDGE: 5,
    });

    expect(groupsFor('SCIENZE')).toEqual({
      PRIMARY_EXPECTED_COMPETENCES: 3,
      PRIMARY_GRADE3_OBJECTIVES: 15,
      PRIMARY_GRADE5_OBJECTIVES: 34,
      PRIMARY_KNOWLEDGE: 5,
      LOWER_SECONDARY_EXPECTED_COMPETENCES: 3,
      LOWER_SECONDARY_GRADE3_OBJECTIVES: 47,
      LOWER_SECONDARY_KNOWLEDGE: 6,
    });
  });

  it('keeps every concrete item non-authoritative pending human source-text verification', () => {
    for (const item of DM221_R7C5B2B_ELEMENT_INVENTORY) {
      expect(item.sourceBindingStatus).toBe('SOURCE_LOCATED');
      expect(item.verifiedByHuman).toBe(false);
      expect(item.canonicalTextStatus).toBe('SOURCE_LOCATED_ONLY');
      expect(assessElementBinding(item)).toMatchObject({
        canTreatAsSourceVerified: false,
        canUseAsCanonicalSourceText: false,
      });
    }
  });

  it('keeps STEM a cross-disciplinary framework, never a discipline segment', () => {
    const stem = getR7C5B2BInventory('STEM');
    expect(stem).toHaveLength(8);
    expect(stem.every((item) => item.segmentId === 'dm221-framework-stem')).toBe(true);
    expect(stem.every((item) => item.elementKind === 'CROSS_DISCIPLINARY_FRAMEWORK')).toBe(true);
    expect(stem.some((item) => item.segmentId.startsWith('dm221-disc-'))).toBe(false);
  });

  it('keeps Informatica inside the canonical mathematics segment where the source includes it', () => {
    const mathematics = getR7C5B2BInventory('MATEMATICA');
    expect(mathematics).toHaveLength(78);
    expect(mathematics.every((item) => item.segmentId === 'dm221-disc-matematica')).toBe(true);
    expect(mathematics.some((item) => item.segmentId === 'dm221-disc-informatica')).toBe(false);
  });

  it('preserves the visually verified science group cardinalities without silently dropping nominal bullet rows', () => {
    const primaryGrade5 = DM221_R7C5B2B_ELEMENT_GROUPS.find(
      (group) => group.inventoryId === 'SCIENZE' && group.group === 'PRIMARY_GRADE5_OBJECTIVES',
    );
    const lowerSecondary = DM221_R7C5B2B_ELEMENT_GROUPS.find(
      (group) => group.inventoryId === 'SCIENZE' && group.group === 'LOWER_SECONDARY_GRADE3_OBJECTIVES',
    );
    expect(primaryGrade5?.count).toBe(34);
    expect(primaryGrade5?.countingNote).toContain('Esplorazione sensoriale dei fenomeni fisici');
    expect(lowerSecondary?.count).toBe(47);
    expect(lowerSecondary?.countingNote).toContain('Sperimentazione e analisi dell’energia nei fenomeni fisici');
  });
});
