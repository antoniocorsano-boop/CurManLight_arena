import { describe, it, expect } from 'vitest';
import { fixture2012 } from '../../domain/curriculum/fixture2012';
import {
  validateCurriculumSegment,
  validateCurriculumNode,
} from '../../domain/curriculum/validation';

describe('CURR-R1E-5 — Sezioni comuni / trasversali / narrative lotto verification', () => {
  it('preserves infanzia general sections with general-section kind', () => {
    const bambiniFamiglie = fixture2012.SEGMENTS_2012_INFANZIA.find(
      s => s.sourceArea?.code === 'in2012-infanzia-bambini-famiglie'
    );
    const transizionePrimaria = fixture2012.SEGMENTS_2012_INFANZIA.find(
      s => s.sourceArea?.code === 'in2012-infanzia-transizione-primaria'
    );

    expect(bambiniFamiglie).toBeDefined();
    expect(bambiniFamiglie?.sourceArea?.kind).toBe('general-section');
    expect(bambiniFamiglie?.sourceArea?.label).toBe('I bambini, le famiglie, i docenti, l\'ambiente di apprendimento');
    expect(bambiniFamiglie?.schoolOrder).toBe('infanzia');
    expect(bambiniFamiglie?.status).toBe('complete');
    expect(bambiniFamiglie?.completeness).toBe('complete');

    expect(transizionePrimaria).toBeDefined();
    expect(transizionePrimaria?.sourceArea?.kind).toBe('general-section');
    expect(transizionePrimaria?.sourceArea?.label).toBe('Dalla scuola dell\'infanzia alla scuola primaria');
    expect(transizionePrimaria?.schoolOrder).toBe('infanzia');
    expect(transizionePrimaria?.status).toBe('complete');
    expect(transizionePrimaria?.completeness).toBe('complete');
  });

  it('preserves primo ciclo common sections with general-section kind', () => {
    const primariaSections = fixture2012.SEGMENTS_2012_PRIMARIA.filter(
      s => s.sourceArea?.kind === 'general-section'
    );
    const secondariaSections = fixture2012.SEGMENTS_2012_SECONDARIA.filter(
      s => s.sourceArea?.kind === 'general-section'
    );

    expect(primariaSections.length).toBeGreaterThanOrEqual(3);
    expect(secondariaSections.length).toBeGreaterThanOrEqual(3);

    const primariaCodes = primariaSections.map(s => s.sourceArea?.code).sort();
    expect(primariaCodes).toEqual(
      expect.arrayContaining([
        'in2012-primaria-senso-esperienza',
        'in2012-primaria-alfabetizzazione-culturale',
        'in2012-primaria-ambiente-apprendimento',
      ])
    );

    const secondariaCodes = secondariaSections.map(s => s.sourceArea?.code).sort();
    expect(secondariaCodes).toEqual(
      expect.arrayContaining([
        'in2012-secondaria-senso-esperienza',
        'in2012-secondaria-alfabetizzazione-culturale',
        'in2012-secondaria-ambiente-apprendimento',
      ])
    );
  });

  it('preserves Cittadinanza e Costituzione as transversal-area without mapping to educazioneCivica', () => {
    const primariaCittadinanza = fixture2012.SEGMENTS_2012_PRIMARIA.find(
      s => s.sourceArea?.code === 'in2012-primaria-cittadinanza-costituzione'
    );
    const secondariaCittadinanza = fixture2012.SEGMENTS_2012_SECONDARIA.find(
      s => s.sourceArea?.code === 'in2012-secondaria-cittadinanza-costituzione'
    );

    expect(primariaCittadinanza).toBeDefined();
    expect(primariaCittadinanza?.sourceArea?.kind).toBe('transversal-area');
    expect(primariaCittadinanza?.sourceArea?.label).toBe('Cittadinanza e Costituzione');
    expect(primariaCittadinanza?.disciplineCode).toBeNull();

    expect(secondariaCittadinanza).toBeDefined();
    expect(secondariaCittadinanza?.sourceArea?.kind).toBe('transversal-area');
    expect(secondariaCittadinanza?.sourceArea?.label).toBe('Cittadinanza e Costituzione');
    expect(secondariaCittadinanza?.disciplineCode).toBeNull();
  });

  it('does not invent synthetic traguardo/obiettivo nodes for narrative general sections', () => {
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

    const generalSectionLabels = new Set([
      'Il senso dell\'esperienza educativa',
      'L\'alfabetizzazione culturale di base',
      'L\'ambiente di apprendimento',
      'I bambini, le famiglie, i docenti, l\'ambiente di apprendimento',
      'Dalla scuola dell\'infanzia alla scuola primaria',
      'Cittadinanza e Costituzione',
    ]);

    for (const node of allNodes) {
      const segment = fixture2012.SEGMENTS_2012_INFANZIA.find(s => s.id === node.segmentRef.id)
        ?? fixture2012.SEGMENTS_2012_PRIMARIA.find(s => s.id === node.segmentRef.id)
        ?? fixture2012.SEGMENTS_2012_SECONDARIA.find(s => s.id === node.segmentRef.id)
        ?? fixture2012.SEGMENTS_2012_PRIMARIA_INGLESE.find(s => s.id === node.segmentRef.id)
        ?? fixture2012.SEGMENTS_2012_SECONDARIA_INGLESE.find(s => s.id === node.segmentRef.id)
        ?? fixture2012.SEGMENTS_2012_PRIMARIA_SECONDA_LINGUA.find(s => s.id === node.segmentRef.id)
        ?? fixture2012.SEGMENTS_2012_SECONDARIA_SECONDA_LINGUA.find(s => s.id === node.segmentRef.id)
        ?? fixture2012.SEGMENTS_2012_PRIMARIA_MATEMATICA.find(s => s.id === node.segmentRef.id)
        ?? fixture2012.SEGMENTS_2012_SECONDARIA_MATEMATICA.find(s => s.id === node.segmentRef.id)
        ?? fixture2012.SEGMENTS_2012_PRIMARIA_SCIENZE.find(s => s.id === node.segmentRef.id)
        ?? fixture2012.SEGMENTS_2012_SECONDARIA_SCIENZE.find(s => s.id === node.segmentRef.id)
        ?? fixture2012.SEGMENTS_2012_PRIMARIA_TECNOLOGIA.find(s => s.id === node.segmentRef.id)
        ?? fixture2012.SEGMENTS_2012_SECONDARIA_TECNOLOGIA.find(s => s.id === node.segmentRef.id)
        ?? fixture2012.SEGMENTS_2012_PRIMARIA_MUSICA.find(s => s.id === node.segmentRef.id)
        ?? fixture2012.SEGMENTS_2012_SECONDARIA_MUSICA.find(s => s.id === node.segmentRef.id)
        ?? fixture2012.SEGMENTS_2012_PRIMARIA_ARTE.find(s => s.id === node.segmentRef.id)
        ?? fixture2012.SEGMENTS_2012_SECONDARIA_ARTE.find(s => s.id === node.segmentRef.id)
        ?? fixture2012.SEGMENTS_2012_PRIMARIA_EDUCAZIONE_FISICA.find(s => s.id === node.segmentRef.id)
        ?? fixture2012.SEGMENTS_2012_SECONDARIA_EDUCAZIONE_FISICA.find(s => s.id === node.segmentRef.id);

      if (segment && generalSectionLabels.has(segment.title)) {
        expect(['traguardo', 'obiettivo']).not.toContain(node.nodeType);
      }
    }
  });

  it('passes canonical validation for every general/transversal segment', () => {
    const segments = [
      ...fixture2012.SEGMENTS_2012_INFANZIA.filter(s => s.sourceArea?.kind === 'general-section'),
      ...fixture2012.SEGMENTS_2012_PRIMARIA.filter(s => s.sourceArea?.kind === 'general-section' || s.sourceArea?.kind === 'transversal-area'),
      ...fixture2012.SEGMENTS_2012_SECONDARIA.filter(s => s.sourceArea?.kind === 'general-section' || s.sourceArea?.kind === 'transversal-area'),
    ];

    for (const segment of segments) {
      const result = validateCurriculumSegment(segment);
      expect(result.valid).toBe(true);
      const errors = result.errors.filter(e => e.severity === 'error');
      expect(errors).toHaveLength(0);
    }
  });

  it('marks every general/transversal segment as normative provenance with sourceRefs', () => {
    const segments = [
      ...fixture2012.SEGMENTS_2012_INFANZIA.filter(s => s.sourceArea?.kind === 'general-section'),
      ...fixture2012.SEGMENTS_2012_PRIMARIA.filter(s => s.sourceArea?.kind === 'general-section' || s.sourceArea?.kind === 'transversal-area'),
      ...fixture2012.SEGMENTS_2012_SECONDARIA.filter(s => s.sourceArea?.kind === 'general-section' || s.sourceArea?.kind === 'transversal-area'),
    ];

    for (const segment of segments) {
      expect(segment.sourceArea?.kind).toBeTruthy();
      expect(segment.status).toBe('complete');
      expect(segment.completeness).toBe('complete');
      expect(segment.sourceRefs).toHaveLength(1);
      expect(segment.sourceRefs[0].id).toBe(fixture2012.SOURCE_2012.id);
      expect(segment.metadata.origin).toBe('normative-source');
    }
  });

  it('documents representation gaps for non-discipline macrostructure sections', () => {
    const gapIds = fixture2012.representationGaps.map(g => g.id);
    expect(gapIds).toContain('gap-2012-macrostructure-cultura-scuola-persona');
    expect(gapIds).toContain('gap-2012-macrostructure-finalita-generali');
    expect(gapIds).toContain('gap-2012-macrostructure-organizzazione-curricolo');
    expect(gapIds).toContain('gap-2012-narrative-framing-text');

    for (const gap of fixture2012.representationGaps) {
      expect(gap.id).toBeDefined();
      expect(gap.reason).toBeDefined();
      expect(gap.sourceReference).toBeDefined();
    }
  });

  it('does not map Cittadinanza e Costituzione to educazioneCivica discipline code', () => {
    const primariaCittadinanza = fixture2012.SEGMENTS_2012_PRIMARIA.find(
      s => s.sourceArea?.code === 'in2012-primaria-cittadinanza-costituzione'
    );
    const secondariaCittadinanza = fixture2012.SEGMENTS_2012_SECONDARIA.find(
      s => s.sourceArea?.code === 'in2012-secondaria-cittadinanza-costituzione'
    );

    expect(primariaCittadinanza?.disciplineCode).not.toBe('educazioneCivica');
    expect(primariaCittadinanza?.disciplineCode).toBeNull();

    expect(secondariaCittadinanza?.disciplineCode).not.toBe('educazioneCivica');
    expect(secondariaCittadinanza?.disciplineCode).toBeNull();
  });

  it('preserves deterministic ordering for general/transversal segments within each school order', () => {
    const primariaGeneralTitles = fixture2012.SEGMENTS_2012_PRIMARIA
      .filter(s => s.sourceArea?.kind === 'general-section' || s.sourceArea?.kind === 'transversal-area')
      .map(s => s.title);

    expect(primariaGeneralTitles).toEqual([
      'Il senso dell\'esperienza educativa',
      'L\'alfabetizzazione culturale di base',
      'L\'ambiente di apprendimento',
      'Cittadinanza e Costituzione',
    ]);

    const secondariaGeneralTitles = fixture2012.SEGMENTS_2012_SECONDARIA
      .filter(s => s.sourceArea?.kind === 'general-section' || s.sourceArea?.kind === 'transversal-area')
      .map(s => s.title);

    expect(secondariaGeneralTitles).toEqual([
      'Il senso dell\'esperienza educativa',
      'L\'alfabetizzazione culturale di base',
      'L\'ambiente di apprendimento',
      'Cittadinanza e Costituzione',
    ]);
  });
});
