import { describe, expect, it } from 'vitest';
import { assessElementBinding } from '../domain/curriculum/national/elementBindings';
import { DM221_INFANZIA_FIELDS } from '../domain/curriculum/national/canonicalStructure';
import {
  DM221_INFANZIA_ELEMENT_COUNTS,
  DM221_INFANZIA_ELEMENT_INVENTORY,
  DM221_INFANZIA_TO_PRIMARY_TRANSITION_PROFILE,
  getInfanziaInventoryForField,
} from '../domain/curriculum/national/infanziaElementInventory';

describe('DM 221/2025 infanzia canonical element inventory', () => {
  it('keeps exactly five fields of experience as the native infanzia structure', () => {
    expect(Object.keys(DM221_INFANZIA_FIELDS)).toHaveLength(5);
    expect(new Set(DM221_INFANZIA_ELEMENT_INVENTORY.map((item) => item.fieldId))).toEqual(
      new Set(Object.keys(DM221_INFANZIA_FIELDS)),
    );
    expect(DM221_INFANZIA_ELEMENT_INVENTORY.every((item) => item.schoolOrder === 'infanzia')).toBe(true);
  });

  it('registers finality, expected competences and specific objectives for every field', () => {
    for (const fieldId of Object.keys(DM221_INFANZIA_FIELDS) as Array<keyof typeof DM221_INFANZIA_FIELDS>) {
      const items = getInfanziaInventoryForField(fieldId);
      const counts = DM221_INFANZIA_ELEMENT_COUNTS[fieldId];

      expect(items.filter((item) => item.group === 'FIELD_FINALITY')).toHaveLength(1);
      expect(items.filter((item) => item.group === 'EXPECTED_COMPETENCES')).toHaveLength(counts.expectedCompetences);
      expect(items.filter((item) => item.group === 'SPECIFIC_OBJECTIVES')).toHaveLength(counts.specificObjectives);
    }
  });

  it('matches the structural counts located in the official annex', () => {
    expect(DM221_INFANZIA_ELEMENT_COUNTS).toEqual({
      IL_SE_E_L_ALTRO: { expectedCompetences: 4, specificObjectives: 6 },
      IL_CORPO_E_IL_MOVIMENTO: { expectedCompetences: 5, specificObjectives: 5 },
      IMMAGINI_SUONI_COLORI: { expectedCompetences: 4, specificObjectives: 5 },
      I_DISCORSI_E_LE_PAROLE: { expectedCompetences: 6, specificObjectives: 6 },
      LA_CONOSCENZA_DEL_MONDO: { expectedCompetences: 5, specificObjectives: 5 },
    });

    expect(DM221_INFANZIA_ELEMENT_INVENTORY).toHaveLength(56);
  });

  it('keeps every located item non-authoritative until human source verification', () => {
    for (const item of DM221_INFANZIA_ELEMENT_INVENTORY) {
      expect(item.sourceBindingStatus).toBe('SOURCE_LOCATED');
      expect(item.verifiedByHuman).toBe(false);
      expect(item.canonicalTextStatus).toBe('SOURCE_LOCATED_ONLY');
      expect(assessElementBinding(item)).toMatchObject({
        canTreatAsSourceVerified: false,
        canUseAsCanonicalSourceText: false,
      });
    }
  });

  it('models the infanzia-to-primary profile separately from the five fields', () => {
    expect(DM221_INFANZIA_TO_PRIMARY_TRANSITION_PROFILE).toMatchObject({
      elementKind: 'TRANSITION_PROFILE',
      schoolOrder: 'infanzia',
      sourceBindingStatus: 'SOURCE_LOCATED',
      verifiedByHuman: false,
      canonicalTextStatus: 'SOURCE_LOCATED_ONLY',
    });

    expect(DM221_INFANZIA_ELEMENT_INVENTORY).not.toContainEqual(
      DM221_INFANZIA_TO_PRIMARY_TRANSITION_PROFILE,
    );
  });

  it('never maps an infanzia inventory element to a first-cycle discipline segment', () => {
    const disciplinePrefix = 'dm221-disc-';
    expect(DM221_INFANZIA_ELEMENT_INVENTORY.some((item) => item.segmentId.startsWith(disciplinePrefix))).toBe(false);
  });
});
