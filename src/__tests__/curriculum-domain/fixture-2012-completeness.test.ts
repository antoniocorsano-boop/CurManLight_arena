import { describe, it, expect } from 'vitest';
import { fixture2012 } from '../../domain/curriculum/fixture2012';
import {
  validateCurriculumSegment,
  validateCurriculumNode,
} from '../../domain/curriculum/validation';

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
    const artePrimaria = fixture2012.SEGMENTS_2012_PRIMARIA.find(s => s.disciplineCode === 'arte');
    const arteSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA.find(s => s.disciplineCode === 'arte');
    const educazioneFisicaPrimaria = fixture2012.SEGMENTS_2012_PRIMARIA.find(s => s.disciplineCode === 'educazione-fisica');
    const educazioneFisicaSecondaria = fixture2012.SEGMENTS_2012_SECONDARIA.find(s => s.disciplineCode === 'educazione-fisica');
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

  describe('structural coverage', () => {
    it('covers all three school orders with at least one segment each', () => {
      expect(fixture2012.SEGMENTS_2012_INFANZIA.length).toBeGreaterThan(0);
      expect(fixture2012.SEGMENTS_2012_PRIMARIA.length).toBeGreaterThan(0);
      expect(fixture2012.SEGMENTS_2012_SECONDARIA.length).toBeGreaterThan(0);
    });

    it('has at least one discipline segment per expected discipline per school order', () => {
      const expectedPrimariaDisciplines = [
        'italiano',
        'storia',
        'geografia',
        'matematica',
        'scienze',
        'musica',
        'arte',
        'educazione-fisica',
        'tecnologia',
      ];

      const expectedSecondariaDisciplines = [
        'italiano',
        'storia',
        'geografia',
        'matematica',
        'scienze',
        'musica',
        'arte',
        'educazione-fisica',
        'tecnologia',
      ];

      for (const disc of expectedPrimariaDisciplines) {
        const segment = fixture2012.SEGMENTS_2012_PRIMARIA.find(s => s.disciplineCode === disc);
        expect(segment, `missing ${disc} in primaria`).toBeDefined();
      }

      for (const disc of expectedSecondariaDisciplines) {
        const segment = fixture2012.SEGMENTS_2012_SECONDARIA.find(s => s.disciplineCode === disc);
        expect(segment, `missing ${disc} in secondaria`).toBeDefined();
      }

      expect(fixture2012.SEGMENTS_2012_PRIMARIA_INGLESE[0]).toBeDefined();
      expect(fixture2012.SEGMENTS_2012_SECONDARIA_INGLESE[0]).toBeDefined();
      expect(fixture2012.SEGMENTS_2012_PRIMARIA_SECONDA_LINGUA[0]).toBeDefined();
      expect(fixture2012.SEGMENTS_2012_SECONDARIA_SECONDA_LINGUA[0]).toBeDefined();
    });

    it('has complete and active status for every segment', () => {
      const allSegments = [
        ...fixture2012.SEGMENTS_2012_INFANZIA,
        ...fixture2012.SEGMENTS_2012_PRIMARIA,
        ...fixture2012.SEGMENTS_2012_SECONDARIA,
      ];

      for (const segment of allSegments) {
        expect(segment.status).toBe('complete');
        expect(segment.completeness).toBe('complete');
      }
    });

    it('passes canonical validation for every segment', () => {
      const allSegments = [
        ...fixture2012.SEGMENTS_2012_INFANZIA,
        ...fixture2012.SEGMENTS_2012_PRIMARIA,
        ...fixture2012.SEGMENTS_2012_SECONDARIA,
      ];

      for (const segment of allSegments) {
        const result = validateCurriculumSegment(segment);
        expect(result.valid).toBe(true);
        const errors = result.errors.filter(e => e.severity === 'error');
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('provenance coverage', () => {
    it('marks every node as normative provenance', () => {
      const allNodes = [
        ...fixture2012.NODES_2012_INFANZIA,
        ...fixture2012.NODES_2012_PRIMARIA,
        ...fixture2012.NODES_2012_SECONDARIA,
        ...fixture2012.NODES_2012_PRIMARIA_INGLESE,
        ...fixture2012.NODES_2012_SECONDARIA_INGLESE,
        ...fixture2012.NODES_2012_PRIMARIA_SECONDA_LINGUA,
        ...fixture2012.NODES_2012_SECONDARIA_SECONDA_LINGUA,
        ...fixture2012.NODES_2012_PRIMARIA_MATEMATICA,
        ...fixture2012.NODES_2012_SECONDARIA_MATEMATICA,
        ...fixture2012.NODES_2012_PRIMARIA_SCIENZE,
        ...fixture2012.NODES_2012_SECONDARIA_SCIENZE,
        ...fixture2012.NODES_2012_PRIMARIA_TECNOLOGIA,
        ...fixture2012.NODES_2012_SECONDARIA_TECNOLOGIA,
        ...fixture2012.NODES_2012_PRIMARIA_MUSICA,
        ...fixture2012.NODES_2012_SECONDARIA_MUSICA,
        ...fixture2012.NODES_2012_PRIMARIA_ARTE,
        ...fixture2012.NODES_2012_SECONDARIA_ARTE,
        ...fixture2012.NODES_2012_PRIMARIA_EDUCAZIONE_FISICA,
        ...fixture2012.NODES_2012_SECONDARIA_EDUCAZIONE_FISICA,
      ];

      for (const node of allNodes) {
        expect(node.provenance).toBe('normative');
      }
    });

    it('passes canonical validation for every node', () => {
      const allNodes = [
        ...fixture2012.NODES_2012_INFANZIA,
        ...fixture2012.NODES_2012_PRIMARIA,
        ...fixture2012.NODES_2012_SECONDARIA,
        ...fixture2012.NODES_2012_PRIMARIA_INGLESE,
        ...fixture2012.NODES_2012_SECONDARIA_INGLESE,
        ...fixture2012.NODES_2012_PRIMARIA_SECONDA_LINGUA,
        ...fixture2012.NODES_2012_SECONDARIA_SECONDA_LINGUA,
        ...fixture2012.NODES_2012_PRIMARIA_MATEMATICA,
        ...fixture2012.NODES_2012_SECONDARIA_MATEMATICA,
        ...fixture2012.NODES_2012_PRIMARIA_SCIENZE,
        ...fixture2012.NODES_2012_SECONDARIA_SCIENZE,
        ...fixture2012.NODES_2012_PRIMARIA_TECNOLOGIA,
        ...fixture2012.NODES_2012_SECONDARIA_TECNOLOGIA,
        ...fixture2012.NODES_2012_PRIMARIA_MUSICA,
        ...fixture2012.NODES_2012_SECONDARIA_MUSICA,
        ...fixture2012.NODES_2012_PRIMARIA_ARTE,
        ...fixture2012.NODES_2012_SECONDARIA_ARTE,
        ...fixture2012.NODES_2012_PRIMARIA_EDUCAZIONE_FISICA,
        ...fixture2012.NODES_2012_SECONDARIA_EDUCAZIONE_FISICA,
      ];

      for (const node of allNodes) {
        const result = validateCurriculumNode(node);
        expect(result.valid).toBe(true);
        const errors = result.errors.filter(e => e.severity === 'error');
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('zero legacy contamination', () => {
    it('has no legacy origin on any segment', () => {
      const allSegments = [
        ...fixture2012.SEGMENTS_2012_INFANZIA,
        ...fixture2012.SEGMENTS_2012_PRIMARIA,
        ...fixture2012.SEGMENTS_2012_SECONDARIA,
      ];

      for (const segment of allSegments) {
        expect(segment.metadata.origin).not.toBe('legacy');
        expect(segment.dataOrigin).not.toBe('legacy');
      }
    });

    it('has no legacy origin on any node', () => {
      const allNodes = [
        ...fixture2012.NODES_2012_INFANZIA,
        ...fixture2012.NODES_2012_PRIMARIA,
        ...fixture2012.NODES_2012_SECONDARIA,
        ...fixture2012.NODES_2012_PRIMARIA_INGLESE,
        ...fixture2012.NODES_2012_SECONDARIA_INGLESE,
        ...fixture2012.NODES_2012_PRIMARIA_SECONDA_LINGUA,
        ...fixture2012.NODES_2012_SECONDARIA_SECONDA_LINGUA,
        ...fixture2012.NODES_2012_PRIMARIA_MATEMATICA,
        ...fixture2012.NODES_2012_SECONDARIA_MATEMATICA,
        ...fixture2012.NODES_2012_PRIMARIA_SCIENZE,
        ...fixture2012.NODES_2012_SECONDARIA_SCIENZE,
        ...fixture2012.NODES_2012_PRIMARIA_TECNOLOGIA,
        ...fixture2012.NODES_2012_SECONDARIA_TECNOLOGIA,
        ...fixture2012.NODES_2012_PRIMARIA_MUSICA,
        ...fixture2012.NODES_2012_SECONDARIA_MUSICA,
        ...fixture2012.NODES_2012_PRIMARIA_ARTE,
        ...fixture2012.NODES_2012_SECONDARIA_ARTE,
        ...fixture2012.NODES_2012_PRIMARIA_EDUCAZIONE_FISICA,
        ...fixture2012.NODES_2012_SECONDARIA_EDUCAZIONE_FISICA,
      ];

      for (const node of allNodes) {
        expect(node.metadata.origin).not.toBe('legacy');
        expect(node.provenance).not.toBe('legacy');
      }
    });

    it('has no legacy info on any node', () => {
      const allNodes = [
        ...fixture2012.NODES_2012_INFANZIA,
        ...fixture2012.NODES_2012_PRIMARIA,
        ...fixture2012.NODES_2012_SECONDARIA,
      ];

      for (const node of allNodes) {
        expect(node.legacy).toBeUndefined();
      }
    });
  });

  describe('controlled checkpoints', () => {
    it('uses only valid normative checkpoints', () => {
      const validCheckpoints = [
        'end-infanzia',
        'end-primary-grade-3',
        'end-primary',
        'end-lower-secondary',
      ];

      const allNodes = [
        ...fixture2012.NODES_2012_INFANZIA,
        ...fixture2012.NODES_2012_PRIMARIA,
        ...fixture2012.NODES_2012_SECONDARIA,
      ];

      for (const node of allNodes) {
        if (node.normativeCheckpoint) {
          expect(validCheckpoints).toContain(node.normativeCheckpoint);
        }
      }
    });

    it('assigns end-infanzia checkpoint only to infanzia nodes', () => {
      for (const node of fixture2012.NODES_2012_INFANZIA) {
        expect(node.normativeCheckpoint).toBe('end-infanzia');
      }
    });

    it('assigns end-primary checkpoint to primary traguardi and fine-primary objectives', () => {
      const primaryNodes = [
        ...fixture2012.NODES_2012_PRIMARIA,
        ...fixture2012.NODES_2012_PRIMARIA_INGLESE,
        ...fixture2012.NODES_2012_PRIMARIA_SECONDA_LINGUA,
        ...fixture2012.NODES_2012_PRIMARIA_MATEMATICA,
        ...fixture2012.NODES_2012_PRIMARIA_SCIENZE,
        ...fixture2012.NODES_2012_PRIMARIA_TECNOLOGIA,
        ...fixture2012.NODES_2012_PRIMARIA_MUSICA,
        ...fixture2012.NODES_2012_PRIMARIA_ARTE,
        ...fixture2012.NODES_2012_PRIMARIA_EDUCAZIONE_FISICA,
      ];

      for (const node of primaryNodes) {
        if (node.nodeType === 'traguardo' || node.text.includes('fine primaria')) {
          expect(node.normativeCheckpoint).toBe('end-primary');
        }
      }
    });

    it('assigns end-lower-secondary checkpoint to lower-secondary traguardi and objectives', () => {
      const lowerSecondaryNodes = [
        ...fixture2012.NODES_2012_SECONDARIA,
        ...fixture2012.NODES_2012_SECONDARIA_INGLESE,
        ...fixture2012.NODES_2012_SECONDARIA_SECONDA_LINGUA,
        ...fixture2012.NODES_2012_SECONDARIA_MATEMATICA,
        ...fixture2012.NODES_2012_SECONDARIA_SCIENZE,
        ...fixture2012.NODES_2012_SECONDARIA_TECNOLOGIA,
        ...fixture2012.NODES_2012_SECONDARIA_MUSICA,
        ...fixture2012.NODES_2012_SECONDARIA_ARTE,
        ...fixture2012.NODES_2012_SECONDARIA_EDUCAZIONE_FISICA,
      ];

      for (const node of lowerSecondaryNodes) {
        if (node.nodeType === 'traguardo' || node.text.includes('fine secondaria I grado')) {
          expect(node.normativeCheckpoint).toBe('end-lower-secondary');
        }
      }
    });

    it('assigns end-primary-grade-3 checkpoint only to class III objectives', () => {
      const primaryNodes = [
        ...fixture2012.NODES_2012_PRIMARIA,
        ...fixture2012.NODES_2012_PRIMARIA_INGLESE,
        ...fixture2012.NODES_2012_PRIMARIA_SECONDA_LINGUA,
        ...fixture2012.NODES_2012_PRIMARIA_MATEMATICA,
        ...fixture2012.NODES_2012_PRIMARIA_SCIENZE,
        ...fixture2012.NODES_2012_PRIMARIA_TECNOLOGIA,
        ...fixture2012.NODES_2012_PRIMARIA_MUSICA,
        ...fixture2012.NODES_2012_PRIMARIA_ARTE,
        ...fixture2012.NODES_2012_PRIMARIA_EDUCAZIONE_FISICA,
      ];

      for (const node of primaryNodes) {
        if (node.text.includes('classe III')) {
          expect(node.normativeCheckpoint).toBe('end-primary-grade-3');
        }
      }
    });
  });

  describe('canonical validation', () => {
    it('validates all source versions', () => {
      expect(fixture2012.SOURCE_2012.id).toBeDefined();
      expect(fixture2012.SOURCE_VERSION_2012.id).toBeDefined();
      expect(fixture2012.SOURCE_2012.status).toBe('active');
      expect(fixture2012.SOURCE_VERSION_2012.status).toBe('active');
    });

    it('validates all curriculum versions', () => {
      const versions = [
        fixture2012.VERSION_2012_INFANZIA,
        fixture2012.VERSION_2012_PRIMARIA,
        fixture2012.VERSION_2012_SECONDARIA,
      ];

      for (const version of versions) {
        expect(version.status).toBe('active');
        expect(version.mainSourceRefs).toContainEqual(fixture2012.SOURCE_REF);
      }
    });
  });

  describe('deterministic ordering', () => {
    it('preserves insertion order for infanzia experience fields', () => {
      const titles = fixture2012.SEGMENTS_2012_INFANZIA
        .filter(s => s.sourceArea?.kind === 'experience-field')
        .map(s => s.title);

      expect(titles).toEqual([
        "Il sé e l'altro",
        'Il corpo e il movimento',
        'Immagini, suoni, colori',
        'I discorsi e le parole',
        'La conoscenza del mondo',
      ]);
    });

    it('preserves insertion order for primaria disciplines', () => {
      const titles = fixture2012.SEGMENTS_2012_PRIMARIA
        .filter(s => s.disciplineCode)
        .map(s => s.title);

      expect(titles).toEqual([
        'Italiano',
        'Storia',
        'Geografia',
        'Matematica',
        'Scienze',
        'Tecnologia',
        'Musica',
        'Arte e immagine',
        'Educazione fisica',
      ]);
    });

    it('preserves insertion order for secondaria disciplines', () => {
      const titles = fixture2012.SEGMENTS_2012_SECONDARIA
        .filter(s => s.disciplineCode)
        .map(s => s.title);

      expect(titles).toEqual([
        'Italiano',
        'Storia',
        'Geografia',
        'Matematica',
        'Scienze',
        'Tecnologia',
        'Musica',
        'Arte e immagine',
        'Educazione fisica',
      ]);
    });
  });

  describe('representation gaps', () => {
    it('exposes representationGaps array with expected entries', () => {
      const gaps = fixture2012.representationGaps;
      expect(gaps.length).toBeGreaterThanOrEqual(4);

      const ids = gaps.map(g => g.id);
      expect(ids).toContain('gap-2012-macrostructure-cultura-scuola-persona');
      expect(ids).toContain('gap-2012-macrostructure-finalita-generali');
      expect(ids).toContain('gap-2012-macrostructure-organizzazione-curricolo');
      expect(ids).toContain('gap-2012-narrative-framing-text');
    });

    it('each gap has id, reason, and sourceReference', () => {
      for (const gap of fixture2012.representationGaps) {
        expect(gap.id).toBeDefined();
        expect(typeof gap.id).toBe('string');
        expect(gap.reason).toBeDefined();
        expect(typeof gap.reason).toBe('string');
        expect(gap.sourceReference).toBeDefined();
        expect(typeof gap.sourceReference).toBe('string');
      }
    });
  });
});
