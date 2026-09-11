import { describe, expect, it } from 'vitest';
import curriculumExploreSource from '../features/curriculum/components/CurriculumExploreTrama.tsx?raw';

describe('Curriculum mobile compact contract', () => {
  it('keeps mobile detail progressive while desktop detail and Trama stay directly available', () => {
    expect(curriculumExploreSource).toContain('data-curriculum-mobile-detail="expandable"');
    expect(curriculumExploreSource).toContain('data-curriculum-mobile-summary="detail"');
    expect(curriculumExploreSource).toContain('data-curriculum-detail-fields={scope}');
    expect(curriculumExploreSource).toContain("scope=\"mobile\"");
    expect(curriculumExploreSource).toContain("scope=\"desktop\"");
    expect(curriculumExploreSource).toContain('group mt-4 sm:hidden');
    expect(curriculumExploreSource).toContain('mt-4 hidden space-y-3 sm:block');
    expect(curriculumExploreSource).toContain('data-open-curriculum-trama');
    expect(curriculumExploreSource).toContain('Vedi nella Trama');
    expect(curriculumExploreSource).toContain('data-relation-policy="same-nucleus-exact-only"');
  });

  it('does not mark the mobile detail as open by default', () => {
    expect(curriculumExploreSource).not.toMatch(/<details[^>]*data-curriculum-mobile-detail="expandable"[^>]*\sopen(?:=|\s|>)/);
  });
});
