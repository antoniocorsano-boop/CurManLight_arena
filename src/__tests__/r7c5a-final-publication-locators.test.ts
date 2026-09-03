import { describe, expect, it } from 'vitest';
import {
  DM221_FIRST_CYCLE_DISCIPLINES,
  DM221_INFANZIA_FIELDS,
  DM221_SPECIAL_SEGMENTS,
} from '../domain/curriculum/national/canonicalStructure';
import {
  DM221_DISCIPLINE_SOURCE_WORK_QUEUE,
  getPendingDisciplineSourceCount,
} from '../domain/curriculum/national/disciplineSourceWorkQueue';
import { DM221_2025_SOURCE } from '../domain/curriculum/national/dm2212025';
import {
  DM221_FINAL_PUBLICATION,
  DM221_FINAL_PUBLICATION_SECTIONS,
  getDm221FinalPublicationSectionBySegmentId,
} from '../domain/curriculum/national/finalPublicationManifest';
import {
  DM221_TECHNOLOGY_ELEMENT_INVENTORY,
  DM221_TECHNOLOGY_ELEMENT_START_PAGES,
} from '../domain/curriculum/national/technologyElementInventory';
import { getTechnologySectionIndexEntry } from '../domain/curriculum/national/technologySectionIndex';

describe('R7C5A final D.M. 221/2025 publication locators', () => {
  it('registers the final March 2026 MIM curriculum volume without replacing the GU legal authority', () => {
    expect(DM221_2025_SOURCE.officialLocator.publication).toContain('Gazzetta Ufficiale');
    expect(DM221_2025_SOURCE.officialCurriculumVolume).toMatchObject({
      publisher: "Ministero dell'Istruzione e del Merito",
      printedAt: '2026-03',
      pageNumbering: 'PRINTED_PAGE',
    });
    expect(DM221_FINAL_PUBLICATION.printedAt).toBe('2026-03');
  });

  it('keeps final publication section ids unique with valid printed-page ranges', () => {
    const ids = DM221_FINAL_PUBLICATION_SECTIONS.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(DM221_FINAL_PUBLICATION_SECTIONS.every((section) => section.pageStart <= section.pageEnd)).toBe(true);
  });

  it('locates all five native infanzia fields in the final volume', () => {
    const fields = Object.values(DM221_INFANZIA_FIELDS);
    expect(fields).toHaveLength(5);

    for (const field of fields) {
      const section = getDm221FinalPublicationSectionBySegmentId(field.id);
      expect(section).toBeDefined();
      expect(section?.schoolOrders).toContain('infanzia');
      expect(field.sourceLocator.page).toBe(section?.pageStart);
    }
  });

  it('locates every first-cycle discipline section while keeping text unverified', () => {
    for (const discipline of Object.values(DM221_FIRST_CYCLE_DISCIPLINES)) {
      expect(getDm221FinalPublicationSectionBySegmentId(discipline.id)).toBeDefined();
    }

    expect(getPendingDisciplineSourceCount()).toBe(0);
    expect(
      DM221_DISCIPLINE_SOURCE_WORK_QUEUE.every(
        (item) => item.sourceBindingStatus === 'SOURCE_LOCATED' && item.verifiedByHuman === false,
      ),
    ).toBe(true);
  });

  it('locates the conditional LEL, musical-instrument and STEM sections without making them universal', () => {
    for (const segmentId of [
      'dm221-offering-lel',
      'dm221-offering-strumento-musicale',
      'dm221-framework-stem',
    ]) {
      const section = getDm221FinalPublicationSectionBySegmentId(segmentId);
      const canonical = DM221_SPECIAL_SEGMENTS.find((segment) => segment.id === segmentId);
      expect(section).toBeDefined();
      expect(canonical?.universalRequirement).toBe(false);
    }

    expect(getDm221FinalPublicationSectionBySegmentId('dm221-offering-lel')?.pageStart).toBe(80);
    expect(getDm221FinalPublicationSectionBySegmentId('dm221-framework-stem')?.pageStart).toBe(113);
    expect(getDm221FinalPublicationSectionBySegmentId('dm221-offering-strumento-musicale')?.pageStart).toBe(152);
  });

  it('removes the stale Technology 96-98 locators and uses printed pages 140-146', () => {
    expect(getDm221FinalPublicationSectionBySegmentId('dm221-disc-tecnologia')).toMatchObject({
      pageStart: 140,
      pageEnd: 146,
    });
    expect(getTechnologySectionIndexEntry('RATIONALE').sourceLocator.page).toBe(140);
    expect(DM221_TECHNOLOGY_ELEMENT_START_PAGES).toEqual({
      PRIMARY_EXPECTED_COMPETENCES: 141,
      PRIMARY_GRADE3_OBJECTIVES: 142,
      PRIMARY_GRADE5_OBJECTIVES: 143,
      PRIMARY_KNOWLEDGE: 143,
      LOWER_SECONDARY_EXPECTED_COMPETENCES: 144,
      LOWER_SECONDARY_GRADE3_OBJECTIVES: 144,
      LOWER_SECONDARY_KNOWLEDGE: 145,
    });
    expect(
      DM221_TECHNOLOGY_ELEMENT_INVENTORY.every(
        (item) =>
          item.sourceBindingStatus === 'SOURCE_LOCATED' &&
          item.verifiedByHuman === false &&
          item.canonicalTextStatus === 'SOURCE_LOCATED_ONLY',
      ),
    ).toBe(true);
  });

  it('rebinds the legal article and STEM locators away from stale draft pages', () => {
    expect(DM221_FIRST_CYCLE_DISCIPLINES.TECNOLOGIA.sourceLocator).toMatchObject({
      article: '2',
      page: 6,
    });
    expect(
      DM221_SPECIAL_SEGMENTS.find((segment) => segment.id === 'dm221-framework-stem')?.sourceLocator.page,
    ).toBe(113);
    expect(
      DM221_SPECIAL_SEGMENTS.find((segment) => segment.id === 'dm221-external-irc')?.sourceLocator.page,
    ).toBe(7);
  });
});
