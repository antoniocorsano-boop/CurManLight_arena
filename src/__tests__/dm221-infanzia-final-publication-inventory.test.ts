import { describe, expect, it } from 'vitest';
import { DM221_INFANZIA_FIELDS, type InfanziaFieldId } from '../domain/curriculum/national/canonicalStructure';
import {
  DM221_INFANZIA_ELEMENT_COUNTS,
  DM221_INFANZIA_ELEMENT_INVENTORY,
  DM221_INFANZIA_FINAL_PUBLICATION_SECTION_IDS,
  DM221_INFANZIA_TO_PRIMARY_TRANSITION_PROFILE,
  getInfanziaInventoryForField,
} from '../domain/curriculum/national/infanziaElementInventory';
import { DM221_FINAL_PUBLICATION_SECTIONS } from '../domain/curriculum/national/finalPublicationManifest';

describe('R7C5B1 infanzia final-publication inventory', () => {
  it('keeps exactly the five native fields and their verified structural counts', () => {
    expect(Object.keys(DM221_INFANZIA_ELEMENT_COUNTS).sort()).toEqual(Object.keys(DM221_INFANZIA_FIELDS).sort());
    expect(DM221_INFANZIA_ELEMENT_INVENTORY).toHaveLength(61);

    const expectedTotals: Record<InfanziaFieldId, number> = {
      IL_SE_E_L_ALTRO: 12,
      IL_CORPO_E_IL_MOVIMENTO: 12,
      IMMAGINI_SUONI_COLORI: 11,
      I_DISCORSI_E_LE_PAROLE: 14,
      LA_CONOSCENZA_DEL_MONDO: 12,
    };

    (Object.keys(expectedTotals) as InfanziaFieldId[]).forEach((fieldId) => {
      expect(getInfanziaInventoryForField(fieldId)).toHaveLength(expectedTotals[fieldId]);
    });
  });

  it('binds every field item to the final March 2026 printed-page range without verifying text', () => {
    (Object.keys(DM221_INFANZIA_FIELDS) as InfanziaFieldId[]).forEach((fieldId) => {
      const sectionId = DM221_INFANZIA_FINAL_PUBLICATION_SECTION_IDS[fieldId];
      const section = DM221_FINAL_PUBLICATION_SECTIONS.find((candidate) => candidate.id === sectionId);
      expect(section).toBeTruthy();

      getInfanziaInventoryForField(fieldId).forEach((item) => {
        expect(item.finalPublicationSectionId).toBe(sectionId);
        expect(item.sourceLocator.page).toBe(section?.pageStart);
        expect(item.finalPublicationPageEnd).toBe(section?.pageEnd);
        expect(item.sourceBindingStatus).toBe('SOURCE_LOCATED');
        expect(item.verifiedByHuman).toBe(false);
        expect(item.canonicalTextStatus).toBe('SOURCE_LOCATED_ONLY');
      });
    });
  });

  it('preserves finality and methodological guidance as narrative source material', () => {
    (Object.keys(DM221_INFANZIA_FIELDS) as InfanziaFieldId[]).forEach((fieldId) => {
      const fieldItems = getInfanziaInventoryForField(fieldId);
      expect(fieldItems.filter((item) => item.elementKind === 'FINALITY')).toHaveLength(1);
      expect(fieldItems.filter((item) => item.elementKind === 'METHODOLOGICAL_GUIDANCE')).toHaveLength(1);
    });
  });

  it('keeps the transition profile separate from fields and disciplines', () => {
    expect(DM221_INFANZIA_TO_PRIMARY_TRANSITION_PROFILE.elementKind).toBe('TRANSITION_PROFILE');
    expect(DM221_INFANZIA_TO_PRIMARY_TRANSITION_PROFILE.sourceLocator.page).toBe(67);
    expect(DM221_INFANZIA_TO_PRIMARY_TRANSITION_PROFILE.verifiedByHuman).toBe(false);
    expect(DM221_INFANZIA_TO_PRIMARY_TRANSITION_PROFILE.segmentId).not.toMatch(/^dm221-disc-/);
    expect(DM221_INFANZIA_ELEMENT_INVENTORY.map((item) => item.elementId)).not.toContain(
      DM221_INFANZIA_TO_PRIMARY_TRANSITION_PROFILE.elementId,
    );
  });
});
