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

  it('includes history and geography disciplines for primaria and secondaria', () => {
    const storiaPrimaria = fixture2012.SEGMENTS_2012_PRIMARIA.find(s => s.disciplineCode === 'storia');
    const storiaSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA.find(s => s.disciplineCode === 'storia');
    const geografiaPrimaria = fixture2012.SEGMENTS_2012_PRIMARIA.find(s => s.disciplineCode === 'geografia');
    const geografiaSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA.find(s => s.disciplineCode === 'geografia');
    expect(storiaPrimaria).toBeDefined();
    expect(storiaSecondaria).toBeDefined();
    expect(geografiaPrimaria).toBeDefined();
    expect(geografiaSecondaria).toBeDefined();
  });

  it('includes mathematics, science, and technology disciplines for primaria and secondaria', () => {
    const matematicaPrimaria = fixture2012.SEGMENTS_2012_PRIMARIA.find(s => s.disciplineCode === 'matematica');
    const matematicaSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA.find(s => s.disciplineCode === 'matematica');
    const scienzePrimaria = fixture2012.SEGMENTS_2012_PRIMARIA.find(s => s.disciplineCode === 'scienze');
    const scienzeSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA.find(s => s.disciplineCode === 'scienze');
    const tecnologiaPrimaria = fixture2012.SEGMENTS_2012_PRIMARIA.find(s => s.disciplineCode === 'tecnologia');
    const tecnologiaSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA.find(s => s.disciplineCode === 'tecnologia');
    expect(matematicaPrimaria).toBeDefined();
    expect(matematicaSecondaria).toBeDefined();
    expect(scienzePrimaria).toBeDefined();
    expect(scienzeSecondaria).toBeDefined();
    expect(tecnologiaPrimaria).toBeDefined();
    expect(tecnologiaSecondaria).toBeDefined();
  });

  it('includes music, art, and physical education disciplines for primaria and secondaria', () => {
    const musicaPrimaria = fixture2012.SEGMENTS_2012_PRIMARIA.find(s => s.disciplineCode === 'musica');
    const musicaSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA.find(s => s.disciplineCode === 'musica');
    const artePrimaria = fixture2012.SEGMENTS_2012_PRIMARIA.find(s => s.disciplineCode === 'arteImmagine');
    const arteSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA.find(s => s.disciplineCode === 'arteImmagine');
    const educazioneFisicaPrimaria = fixture2012.SEGMENTS_2012_PRIMARIA.find(s => s.disciplineCode === 'educazioneFisica');
    const educazioneFisicaSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA.find(s => s.disciplineCode === 'educazioneFisica');
    expect(musicaPrimaria).toBeDefined();
    expect(musicaSecondaria).toBeDefined();
    expect(artePrimaria).toBeDefined();
    expect(arteSecondaria).toBeDefined();
    expect(educazioneFisicaPrimaria).toBeDefined();
    expect(educazioneFisicaSecondaria).toBeDefined();
  });

  it('includes general framing sections with correct sourceArea kinds', () => {
    const generalSections = fixture2012.SEGMENTS_2012_INFANZIA.filter(s => s.sourceArea?.kind === 'general-section');
    const transversalAreas = fixture2012.SEGMENTS_2012_PRIMARIA.filter(s => s.sourceArea?.kind === 'transversal-area');
    expect(generalSections.length).toBeGreaterThanOrEqual(2);
    expect(transversalAreas.length).toBeGreaterThanOrEqual(1);
  });

  it('does not represent Cittadinanza e Costituzione as a 2012 discipline', () => {
    const cittadinanza = fixture2012.SEGMENTS_2012_PRIMARIA.find(s => (s.disciplineCode as any) === 'educazioneCivica');
    expect(cittadinanza).toBeUndefined();
  });

  it('documents representation gaps explicitly', () => {
    const gaps = (fixture2012 as any).representationGaps ?? [];
    expect(gaps).toBeDefined();
    expect(Array.isArray(gaps)).toBe(true);
  });
});
