import { describe, it, expect } from 'vitest';
import { fixture2025 } from '../../domain/curriculum/fixture2025';
import {
  validateCurriculumSegment,
  validateCurriculumNode,
} from '../../domain/curriculum/validation';

describe('CURR-R2E-6 — 2025 Strumento musicale + sezioni trasversali residue', () => {
  it('preserves Strumento musicale as distinct source-native area with frameworkApplicability', () => {
    const segment = fixture2025.SEGMENTS_2025_SECONDARIA_STRUMENTO_MUSICALE[0];

    expect(segment).toBeDefined();
    expect(segment.disciplineCode).toBe('musica');
    expect(segment.schoolOrder).toBe('secondaria');
    expect(segment.sourceArea?.kind).toBe('discipline');
    expect(segment.sourceArea?.code).toBe('in2025-strumento-musicale');
    expect(segment.sourceArea?.label).toBe('Strumento musicale');
    expect(segment.status).toBe('complete');
    expect(segment.completeness).toBe('complete');
    expect(segment.frameworkApplicability).toBeDefined();
    expect(segment.frameworkApplicability?.framework).toBe('IN2025');
    expect(segment.frameworkApplicability?.resolutionStatus).toBe('resolved');
    expect(segment.frameworkApplicability?.resolutionReason).toContain('indirizzo musicale');
    expect(segment.frameworkApplicability?.cohortEntryYear).toBe(2026);
  });

  it('validates Strumento musicale segment', () => {
    const result = validateCurriculumSegment(fixture2025.SEGMENTS_2025_SECONDARIA_STRUMENTO_MUSICALE[0]);
    expect(result.valid).toBe(true);
    expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
  });

  it('contains required lower-secondary nodes for Strumento musicale', () => {
    const nodes = fixture2025.NODES_2025_SECONDARIA_STRUMENTO_MUSICALE;
    expect(nodes).toHaveLength(2);

    const competenza = nodes.find(n => n.nodeType === 'competenza');
    const obiettivo = nodes.find(n => n.nodeType === 'obiettivo');

    expect(competenza).toBeDefined();
    expect(competenza?.text).toBe('Competenza - fine secondaria I grado');
    expect(competenza?.normativeCheckpoint).toBe('end-lower-secondary');

    expect(obiettivo).toBeDefined();
    expect(obiettivo?.text).toBe('Obiettivo - fine secondaria I grado');
    expect(obiettivo?.normativeCheckpoint).toBe('end-lower-secondary');
  });

  it('marks Strumento musicale nodes as normative provenance with sourceRefs', () => {
    const nodes = fixture2025.NODES_2025_SECONDARIA_STRUMENTO_MUSICALE;

    for (const node of nodes) {
      expect(node.provenance).toBe('normative');
      expect(node.sourceRefs).toHaveLength(1);
      expect(node.sourceRefs[0].id).toBe(fixture2025.SOURCE_2025.id);
      expect(node.metadata.origin).toBe('normative-source');
      expect(node.legacy).toBeUndefined();
    }
  });

  it('passes canonical validation for Strumento musicale nodes', () => {
    const nodes = fixture2025.NODES_2025_SECONDARIA_STRUMENTO_MUSICALE;

    for (const node of nodes) {
      const result = validateCurriculumNode(node);
      expect(result.valid).toBe(true);
      expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
    }
  });

  it('keeps Musica distinct from Strumento musicale', () => {
    const musica = fixture2025.SEGMENTS_2025_PRIMARIA_MUSICA[0];
    const strumento = fixture2025.SEGMENTS_2025_SECONDARIA_STRUMENTO_MUSICALE[0];

    expect(musica.disciplineCode).toBe('musica');
    expect(strumento.disciplineCode).toBe('musica');
    expect(musica.title).toBe('Musica');
    expect(strumento.title).toBe('Strumento musicale');
    expect(musica.sourceArea?.kind).toBe('discipline');
    expect(strumento.sourceArea?.kind).toBe('discipline');
    expect(musica.id).not.toBe(strumento.id);
  });

  it('includes primaria general sections', () => {
    const sections = fixture2025.SEGMENTS_2025_PRIMARIA_GENERAL_SECTIONS;
    expect(sections).toHaveLength(4);

    const titles = sections.map(s => s.title);
    expect(titles).toContain('Il senso dell\'esperienza educativa');
    expect(titles).toContain('L\'alfabetizzazione culturale di base');
    expect(titles).toContain('L\'ambiente di apprendimento');
    expect(titles).toContain('Cittadinanza e Costituzione');
  });

  it('includes secondaria general sections', () => {
    const sections = fixture2025.SEGMENTS_2025_SECONDARIA_GENERAL_SECTIONS;
    expect(sections).toHaveLength(4);

    const titles = sections.map(s => s.title);
    expect(titles).toContain('Il senso dell\'esperienza educativa');
    expect(titles).toContain('L\'alfabetizzazione culturale di base');
    expect(titles).toContain('L\'ambiente di apprendimento');
    expect(titles).toContain('Cittadinanza e Costituzione');
  });

  it('preserves source-native area kinds for general sections', () => {
    const primaria = fixture2025.SEGMENTS_2025_PRIMARIA_GENERAL_SECTIONS;
    const secondaria = fixture2025.SEGMENTS_2025_SECONDARIA_GENERAL_SECTIONS;

    const primariaGeneral = primaria.filter(s => s.sourceArea?.kind === 'general-section');
    const primariaTransversal = primaria.filter(s => s.sourceArea?.kind === 'transversal-area');
    expect(primariaGeneral).toHaveLength(3);
    expect(primariaTransversal).toHaveLength(1);

    const secondariaGeneral = secondaria.filter(s => s.sourceArea?.kind === 'general-section');
    const secondariaTransversal = secondaria.filter(s => s.sourceArea?.kind === 'transversal-area');
    expect(secondariaGeneral).toHaveLength(3);
    expect(secondariaTransversal).toHaveLength(1);
  });

  it('does not create synthetic curriculum nodes for general sections', () => {
    const primariaNodes = fixture2025.NODES_2025_PRIMARIA_GENERAL_SECTIONS;
    const secondariaNodes = fixture2025.NODES_2025_SECONDARIA_GENERAL_SECTIONS;

    expect(primariaNodes).toBeUndefined();
    expect(secondariaNodes).toBeUndefined();
  });

  it('passes canonical validation for every general section segment', () => {
    const segments = [
      ...fixture2025.SEGMENTS_2025_PRIMARIA_GENERAL_SECTIONS,
      ...fixture2025.SEGMENTS_2025_SECONDARIA_GENERAL_SECTIONS,
    ];

    for (const segment of segments) {
      const result = validateCurriculumSegment(segment);
      expect(result.valid).toBe(true);
      const errors = result.errors.filter(e => e.severity === 'error');
      expect(errors).toHaveLength(0);
    }
  });

  it('marks every general section as normative provenance with sourceRefs', () => {
    const segments = [
      ...fixture2025.SEGMENTS_2025_PRIMARIA_GENERAL_SECTIONS,
      ...fixture2025.SEGMENTS_2025_SECONDARIA_GENERAL_SECTIONS,
    ];

    for (const segment of segments) {
      expect(segment.metadata.origin).toBe('normative-source');
      expect(segment.dataOrigin).toBe('normative-source');
      expect(segment.sourceRefs).toHaveLength(1);
      expect(segment.sourceRefs[0].id).toBe(fixture2025.SOURCE_2025.id);
    }
  });

  it('does not introduce STEM as a synthetic discipline or general section', () => {
    const allSegments = [
      ...fixture2025.SEGMENTS_2025_PRIMARIA_GENERAL_SECTIONS,
      ...fixture2025.SEGMENTS_2025_SECONDARIA_GENERAL_SECTIONS,
    ];

    const stemSegments = allSegments.filter(s => s.disciplineCode === 'stem');
    expect(stemSegments).toHaveLength(0);

    const stemLabels = allSegments.filter(s => s.title === 'STEM');
    expect(stemLabels).toHaveLength(0);
  });
});
