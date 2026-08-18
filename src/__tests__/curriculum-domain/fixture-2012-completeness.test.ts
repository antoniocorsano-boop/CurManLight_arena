import { describe, it, expect } from 'vitest';
import { fixture2012 } from '../../domain/curriculum/fixture2012';

describe('CURR-R1E — 2012 Normative Corpus Completeness', () => {
  it('includes English language discipline for primaria and secondaria', () => {
    const englishPrimaria = fixture2012.SEGMENTS_2012_PRIMARIA_INGLESE[0];
    const englishSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA_INGLESE[0];
    expect(englishPrimaria).toBeDefined();
    expect(englishPrimaria.disciplineCode).toBe('inglese');
    expect(englishSecondaria).toBeDefined();
    expect(englishSecondaria.disciplineCode).toBe('inglese');
  });

  it('includes second language community discipline where applicable', () => {
    const secondaLingua = fixture2012.SEGMENTS_2012_PRIMARIA_SECONDA_LINGUA[0];
    expect(secondaLingua).toBeDefined();
    expect(secondaLingua.disciplineCode).toBe('seconda-lingua');
  });
});
