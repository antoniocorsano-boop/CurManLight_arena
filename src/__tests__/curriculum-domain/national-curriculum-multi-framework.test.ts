import { describe, it, expect } from 'vitest';
import {
  createNationalCurriculumConsultationService,
  adaptFixture2012ToNationalCurriculumFixture,
  adaptFixture2025ToNationalCurriculumFixture,
} from '../../domain/curriculum/nationalCurriculumConsultation';
import { fixture2012 } from '../../domain/curriculum/fixture2012';
import { fixture2025 } from '../../domain/curriculum/fixture2025';

describe('CURR-R3A — Multi-framework consultation boundary', () => {
  const service = createNationalCurriculumConsultationService([
    ...adaptFixture2012ToNationalCurriculumFixture(fixture2012),
    ...adaptFixture2025ToNationalCurriculumFixture(fixture2025),
  ]);

  const frameworkIds = () => service.listAvailableFrameworks().map(f => f.id);

  it('lists exactly IN2012 and IN2025', () => {
    expect(frameworkIds()).toEqual(['IN2012', 'IN2025']);
  });

  it('preserves distinct source metadata per framework', () => {
    const frameworks = service.listAvailableFrameworks();
    const in2012 = frameworks.find(f => f.id === 'IN2012');
    const in2025 = frameworks.find(f => f.id === 'IN2025');

    expect(in2012).toBeDefined();
    expect(in2025).toBeDefined();
    expect(in2012!.source.title).toContain('Indicazioni nazionali');
    expect(in2025!.source.title).toContain('Indicazioni nazionali');
    expect(in2012!.id).not.toBe(in2025!.id);
  });

  it('listSchoolOrders is independent per framework', () => {
    const orders2012 = service.listSchoolOrders('IN2012');
    const orders2025 = service.listSchoolOrders('IN2025');

    expect(orders2012).toEqual(['infanzia', 'primaria', 'secondaria']);
    expect(orders2025).toEqual(['infanzia', 'primaria', 'secondaria']);
    expect(orders2012).not.toBe(orders2025);
  });

  it('listContent for IN2012 returns only 2012 nodes', () => {
    const items = service.listContent({ frameworkId: 'IN2012' });
    expect(items.length).toBeGreaterThanOrEqual(1);
    const all2012NodeIds = new Set<string>(
      [...fixture2012.NODES_2012_INFANZIA, ...fixture2012.NODES_2012_PRIMARIA, ...fixture2012.NODES_2012_SECONDARIA].map(n => n.id as unknown as string)
    );

    for (const item of items) {
      expect(all2012NodeIds.has(item.id)).toBe(true);
    }
  });

  it('listContent for IN2025 returns only 2025 nodes', () => {
    const items = service.listContent({ frameworkId: 'IN2025' });
    expect(items.length).toBeGreaterThanOrEqual(1);
    for (const item of items) {
      expect(item.id).toBeDefined();
      const all2025Nodes = [
        ...fixture2025.NODES_2025_INFANZIA,
        ...fixture2025.NODES_2025_PRIMARIA_ITALIANO,
        ...fixture2025.NODES_2025_PRIMARIA_INGLESE,
        ...fixture2025.NODES_2025_PRIMARIA_STORIA,
        ...fixture2025.NODES_2025_PRIMARIA_GEOGRAFIA,
        ...fixture2025.NODES_2025_PRIMARIA_MATEMATICA,
        ...fixture2025.NODES_2025_PRIMARIA_SCIENZE,
        ...fixture2025.NODES_2025_PRIMARIA_TECNOLOGIA,
        ...fixture2025.NODES_2025_PRIMARIA_MUSICA,
        ...fixture2025.NODES_2025_PRIMARIA_ARTE,
        ...fixture2025.NODES_2025_PRIMARIA_EDUCAZIONE_FISICA,
        ...fixture2025.NODES_2025_SECONDARIA_ITALIANO,
        ...fixture2025.NODES_2025_SECONDARIA_INGLESE,
        ...fixture2025.NODES_2025_SECONDARIA_STRUMENTO_MUSICALE,
        ...fixture2025.NODES_2025_SECONDARIA_LATINO,
        ...fixture2025.NODES_2025_SECONDARIA_STORIA,
        ...fixture2025.NODES_2025_SECONDARIA_GEOGRAFIA,
        ...fixture2025.NODES_2025_SECONDARIA_MATEMATICA,
        ...fixture2025.NODES_2025_SECONDARIA_SCIENZE,
        ...fixture2025.NODES_2025_SECONDARIA_TECNOLOGIA,
        ...fixture2025.NODES_2025_SECONDARIA_MUSICA,
        ...fixture2025.NODES_2025_SECONDARIA_ARTE,
        ...fixture2025.NODES_2025_SECONDARIA_EDUCAZIONE_FISICA,
      ];
      expect(all2025Nodes.some(n => n.id === item.id)).toBe(true);
    }
  });

  it('prevents node ID leakage across framework boundary', () => {
    const in2012Ids = new Set(
      service.listContent({ frameworkId: 'IN2012' }).map(i => i.id)
    );
    const in2025Ids = new Set(
      service.listContent({ frameworkId: 'IN2025' }).map(i => i.id)
    );

    const overlap = [...in2012Ids].filter(id => in2025Ids.has(id));
    expect(overlap).toHaveLength(0);
  });

  it('preserves normativeNodeKind=osa-2025 on 2025 primary obiettivo nodes', () => {
    const items = service.listContent({
      frameworkId: 'IN2025',
      nodeType: 'obiettivo',
      normativeCheckpoint: 'end-primary-grade-3',
    });

    expect(items.length).toBeGreaterThanOrEqual(1);
    for (const item of items) {
      expect(item.normativeNodeKind).toBe('osa-2025');
    }
  });

  it('preserves competenza and conoscenza node types for 2025', () => {
    const competenzaItems = service.listContent({
      frameworkId: 'IN2025',
      nodeType: 'competenza',
    });
    const conoscenzaItems = service.listContent({
      frameworkId: 'IN2025',
      nodeType: 'conoscenza',
    });

    expect(competenzaItems.length).toBeGreaterThanOrEqual(1);
    expect(conoscenzaItems.length).toBeGreaterThanOrEqual(1);
  });

  it('preserves frameworkApplicability on Strumento musicale area', () => {
    const areas = service.listAreas('IN2025', 'secondaria');
    const strumentoArea = areas.find(a => a.code === 'in2025-strumento-musicale');

    expect(strumentoArea).toBeDefined();
    expect(strumentoArea!.frameworkApplicability).toBeDefined();
    expect(strumentoArea!.frameworkApplicability?.framework).toBe('IN2025');
    expect(strumentoArea!.frameworkApplicability?.resolutionStatus).toBe('resolved');
    expect(strumentoArea!.frameworkApplicability?.resolutionReason).toContain('indirizzo musicale');
  });

  it('preserves null disciplineCode for experience fields', () => {
    const areas = service.listAreas('IN2025', 'infanzia');
    const experienceFields = areas.filter(a => a.kind === 'experience-field');

    expect(experienceFields.length).toBeGreaterThanOrEqual(1);
    for (const area of experienceFields) {
      expect(area.disciplineCode).toBeNull();
    }
  });

  it('supports independent text search per framework', () => {
    const in2012Results = service.listContent({
      frameworkId: 'IN2012',
      text: 'Obiettivo',
    });
    const in2025Results = service.listContent({
      frameworkId: 'IN2025',
      text: 'Obiettivo',
    });

    expect(in2012Results.length).toBeGreaterThanOrEqual(1);
    expect(in2025Results.length).toBeGreaterThanOrEqual(1);
  });

  it('does not mutate fixture objects', () => {
    const fixture2025NodesBefore = fixture2025.NODES_2025_PRIMARIA_ITALIANO.map(n => n.text);
    const fixture2012NodesBefore = fixture2012.NODES_2012_INFANZIA.map(n => n.text);

    service.listContent({ frameworkId: 'IN2025' });
    service.listContent({ frameworkId: 'IN2012' });

    expect(fixture2025.NODES_2025_PRIMARIA_ITALIANO.map(n => n.text)).toEqual(fixture2025NodesBefore);
    expect(fixture2012.NODES_2012_INFANZIA.map(n => n.text)).toEqual(fixture2012NodesBefore);
  });
});
