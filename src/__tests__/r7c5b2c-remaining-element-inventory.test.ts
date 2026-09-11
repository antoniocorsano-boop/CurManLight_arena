import { describe, expect, it } from 'vitest';
import { assessElementBinding } from '../domain/curriculum/national/elementBindings';
import {
  DM221_FIRST_CYCLE_DISCIPLINES,
  DM221_INFANZIA_FIELDS,
  DM221_SPECIAL_SEGMENTS,
} from '../domain/curriculum/national/canonicalStructure';
import {
  DM221_R7C5B2C_ELEMENT_COUNTS,
  DM221_R7C5B2C_ELEMENT_GROUPS,
  DM221_R7C5B2C_ELEMENT_INVENTORY,
  getR7C5B2CInventory,
} from '../domain/curriculum/national/r7c5b2cRemainingElementInventory';

describe('R7C5B2C closing structural inventory', () => {
  it('freezes all six remaining structural counts', () => {
    expect(DM221_R7C5B2C_ELEMENT_COUNTS).toEqual({
      INFANZIA_GENERAL_FRAMEWORK: 5,
      MUSICA: 50,
      STRUMENTO_MUSICALE: 53,
      ARTE_E_IMMAGINE: 61,
      EDUCAZIONE_MOTORIA: 38,
      EDUCAZIONE_FISICA: 27,
    });
    expect(DM221_R7C5B2C_ELEMENT_INVENTORY).toHaveLength(234);
  });

  it('models the general infanzia framework as five source-native narrative blocks', () => {
    const framework = getR7C5B2CInventory('INFANZIA_GENERAL_FRAMEWORK');
    expect(framework).toHaveLength(5);
    expect(framework.every((item) => item.schoolOrder === 'infanzia')).toBe(true);
    expect(framework.every((item) => item.elementKind === 'GENERAL_FRAMEWORK')).toBe(true);

    const canonicalIds = new Set([
      ...Object.values(DM221_INFANZIA_FIELDS).map((segment) => segment.id),
      ...Object.values(DM221_FIRST_CYCLE_DISCIPLINES).map((segment) => segment.id),
      ...DM221_SPECIAL_SEGMENTS.map((segment) => segment.id),
    ]);
    expect(framework.every((item) => !canonicalIds.has(item.segmentId))).toBe(true);
  });

  it('preserves source-native group counts for music, art and motor disciplines', () => {
    const groupsFor = (inventoryId: keyof typeof DM221_R7C5B2C_ELEMENT_COUNTS) =>
      Object.fromEntries(
        DM221_R7C5B2C_ELEMENT_GROUPS
          .filter((group) => group.inventoryId === inventoryId)
          .map((group) => [group.group, group.count]),
      );

    expect(groupsFor('MUSICA')).toEqual({
      PRIMARY_EXPECTED_COMPETENCES: 4,
      PRIMARY_GRADE3_OBJECTIVES: 7,
      PRIMARY_GRADE5_OBJECTIVES: 9,
      PRIMARY_KNOWLEDGE: 7,
      LOWER_SECONDARY_EXPECTED_COMPETENCES: 5,
      LOWER_SECONDARY_GRADE3_OBJECTIVES: 11,
      LOWER_SECONDARY_KNOWLEDGE: 7,
    });

    expect(groupsFor('ARTE_E_IMMAGINE')).toEqual({
      PRIMARY_EXPECTED_COMPETENCES: 4,
      PRIMARY_GRADE3_OBJECTIVES: 12,
      PRIMARY_GRADE5_OBJECTIVES: 12,
      PRIMARY_KNOWLEDGE: 10,
      LOWER_SECONDARY_EXPECTED_COMPETENCES: 4,
      LOWER_SECONDARY_GRADE3_OBJECTIVES: 10,
      LOWER_SECONDARY_KNOWLEDGE: 9,
    });

    expect(groupsFor('EDUCAZIONE_MOTORIA')).toEqual({
      PRIMARY_EXPECTED_COMPETENCES: 5,
      PRIMARY_GRADE3_OBJECTIVES: 11,
      PRIMARY_GRADE5_OBJECTIVES: 14,
      PRIMARY_KNOWLEDGE: 8,
    });

    expect(groupsFor('EDUCAZIONE_FISICA')).toEqual({
      LOWER_SECONDARY_EXPECTED_COMPETENCES: 5,
      LOWER_SECONDARY_GRADE3_OBJECTIVES: 16,
      LOWER_SECONDARY_KNOWLEDGE: 6,
    });
  });

  it('keeps Strumento musicale conditional and preserves the D.I. 176/2022 family blocks', () => {
    const instrument = getR7C5B2CInventory('STRUMENTO_MUSICALE');
    expect(instrument).toHaveLength(53);
    expect(instrument.every((item) => item.segmentId === 'dm221-offering-strumento-musicale')).toBe(true);

    const di176Count = DM221_R7C5B2C_ELEMENT_GROUPS
      .filter(
        (group) =>
          group.inventoryId === 'STRUMENTO_MUSICALE' && group.group.startsWith('DI176_'),
      )
      .reduce((total, group) => total + group.count, 0);
    expect(di176Count).toBe(28);
  });

  it('preserves typographic source anomalies instead of silently correcting structural counts', () => {
    const musicGrade5 = DM221_R7C5B2C_ELEMENT_GROUPS.find(
      (group) => group.inventoryId === 'MUSICA' && group.group === 'PRIMARY_GRADE5_OBJECTIVES',
    );
    const motorGrade5 = DM221_R7C5B2C_ELEMENT_GROUPS.find(
      (group) => group.inventoryId === 'EDUCAZIONE_MOTORIA' && group.group === 'PRIMARY_GRADE5_OBJECTIVES',
    );
    expect(musicGrade5?.count).toBe(9);
    expect(musicGrade5?.countingNote).toContain('Conoscenza storico-culturale della musica');
    expect(motorGrade5?.count).toBe(14);
    expect(motorGrade5?.countingNote).toContain('valutazione/autovalutazione');
  });

  it('keeps every closing item source-located but non-authoritative', () => {
    for (const item of DM221_R7C5B2C_ELEMENT_INVENTORY) {
      expect(item.sourceBindingStatus).toBe('SOURCE_LOCATED');
      expect(item.verifiedByHuman).toBe(false);
      expect(item.canonicalTextStatus).toBe('SOURCE_LOCATED_ONLY');
      expect(assessElementBinding(item)).toMatchObject({
        canTreatAsSourceVerified: false,
        canUseAsCanonicalSourceText: false,
      });
    }
  });
});
