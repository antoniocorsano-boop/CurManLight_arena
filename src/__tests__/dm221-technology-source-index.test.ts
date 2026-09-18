import { describe, expect, it } from 'vitest';
import {
  DM221_DISCIPLINE_SOURCE_WORK_QUEUE,
  getPendingDisciplineSourceCount,
} from '../domain/curriculum/national/disciplineSourceWorkQueue';
import {
  DM221_TECHNOLOGY_SECTION_INDEX,
  getTechnologySectionIndexEntry,
} from '../domain/curriculum/national/technologySectionIndex';

describe('DM221 Technology source index', () => {
  it('indexes the final MIM Technology section from printed page 140 without promoting text', () => {
    const rationale = getTechnologySectionIndexEntry('RATIONALE');

    expect(rationale.sourceLocator.page).toBe(140);
    expect(rationale.sourceBindingStatus).toBe('SOURCE_LOCATED');
    expect(rationale.verifiedByHuman).toBe(false);
    expect(rationale.canonicalTextStatus).toBe('SOURCE_LOCATED_ONLY');
  });

  it('keeps primary and lower-secondary Technology boundaries distinct in the final publication', () => {
    expect(getTechnologySectionIndexEntry('PRIMARY_EXPECTED_COMPETENCES')).toMatchObject({
      schoolOrder: 'primaria',
      sourceLocator: { page: 141 },
    });
    expect(getTechnologySectionIndexEntry('PRIMARY_GRADE3_OBJECTIVES')).toMatchObject({
      schoolOrder: 'primaria',
      sourceLocator: { page: 142 },
    });
    expect(getTechnologySectionIndexEntry('PRIMARY_GRADE5_OBJECTIVES')).toMatchObject({
      schoolOrder: 'primaria',
      sourceLocator: { page: 143 },
    });
    expect(getTechnologySectionIndexEntry('LOWER_SECONDARY_EXPECTED_COMPETENCES')).toMatchObject({
      schoolOrder: 'secondaria',
      sourceLocator: { page: 144 },
    });
    expect(getTechnologySectionIndexEntry('LOWER_SECONDARY_GRADE3_OBJECTIVES')).toMatchObject({
      schoolOrder: 'secondaria',
      sourceLocator: { page: 144 },
    });
    expect(getTechnologySectionIndexEntry('LOWER_SECONDARY_KNOWLEDGE')).toMatchObject({
      schoolOrder: 'secondaria',
      sourceLocator: { page: 145 },
    });
  });

  it('contains the expected structural sections for both orders', () => {
    expect(DM221_TECHNOLOGY_SECTION_INDEX.map((entry) => entry.id)).toEqual([
      'RATIONALE',
      'PRIMARY_EXPECTED_COMPETENCES',
      'PRIMARY_GRADE3_OBJECTIVES',
      'PRIMARY_GRADE5_OBJECTIVES',
      'PRIMARY_KNOWLEDGE',
      'LOWER_SECONDARY_EXPECTED_COMPETENCES',
      'LOWER_SECONDARY_GRADE3_OBJECTIVES',
      'LOWER_SECONDARY_KNOWLEDGE',
    ]);
  });

  it('locates every other first-cycle discipline section without source-verifying it', () => {
    expect(DM221_DISCIPLINE_SOURCE_WORK_QUEUE.length).toBeGreaterThan(0);
    expect(getPendingDisciplineSourceCount()).toBe(0);
    expect(
      DM221_DISCIPLINE_SOURCE_WORK_QUEUE.every(
        (item) =>
          item.sourceBindingStatus === 'SOURCE_LOCATED' &&
          item.verifiedByHuman === false &&
          typeof item.sourceLocator.page === 'number',
      ),
    ).toBe(true);
    expect(
      DM221_DISCIPLINE_SOURCE_WORK_QUEUE.some((item) => item.segmentId === 'dm221-disc-tecnologia'),
    ).toBe(false);
  });
});
