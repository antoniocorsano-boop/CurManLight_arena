import { describe, it, expect } from 'vitest';
import {
  createNationalCurriculumConsultationService,
  adaptFixture2012ToNationalCurriculumFixture,
} from '../../domain/curriculum/nationalCurriculumConsultation';
import { fixture2012 } from '../../domain/curriculum/fixture2012';

describe('CURR-R1C — National Curriculum Consultation Boundary', () => {
  const service = createNationalCurriculumConsultationService(
    adaptFixture2012ToNationalCurriculumFixture(fixture2012)
  );

  it('lists one available framework with metadata', () => {
    const frameworks = service.listAvailableFrameworks();
    expect(frameworks).toHaveLength(1);
    expect(frameworks[0].id).toBe('IN2012');
    expect(frameworks[0].title).toBe('Indicazioni nazionali 2012');
    expect(frameworks[0].source.authority).toBe('Ministero dell\'Istruzione');
    expect(frameworks[0].schoolOrders).toEqual(['infanzia', 'primaria', 'secondaria']);
  });

  it('lists school orders for a framework', () => {
    const orders = service.listSchoolOrders('IN2012');
    expect(orders).toEqual(['infanzia', 'primaria', 'secondaria']);
  });

  it('lists areas for infanzia', () => {
    const areas = service.listAreas('IN2012', 'infanzia');
    expect(areas).toHaveLength(7);
    const experienceFields = areas.filter(a => a.kind === 'experience-field');
    expect(experienceFields).toHaveLength(5);
    expect(experienceFields[0].disciplineCode).toBeNull();
  });

  it('lists areas for primaria', () => {
    const areas = service.listAreas('IN2012', 'primaria');
    expect(areas).toHaveLength(13);
    expect(areas[0].kind).toBe('discipline');
    expect(areas[0].disciplineCode).toBe('arte');
  });

  it('lists content with default query', () => {
    const items = service.listContent({});
    expect(items.length).toBeGreaterThanOrEqual(10);
  });

  it('filters content by frameworkId', () => {
    const items = service.listContent({ frameworkId: 'IN2012' });
    expect(items.length).toBeGreaterThanOrEqual(10);
  });

  it('filters content by schoolOrder', () => {
    const items = service.listContent({ schoolOrder: 'infanzia' });
    expect(items).toHaveLength(5);
  });

  it('filters content by disciplineCode=null explicitly', () => {
    const items = service.listContent({ disciplineCode: null });
    expect(items).toHaveLength(5);
    for (const item of items) {
      expect(item.schoolOrder).toBe('infanzia');
    }
  });

  it('does not filter discipline when disciplineCode is omitted', () => {
    const items = service.listContent({});
    expect(items.length).toBeGreaterThanOrEqual(10);
  });

  it('filters content by sourceAreaKind', () => {
    const items = service.listContent({ sourceAreaKind: 'experience-field' });
    expect(items).toHaveLength(5);
  });

  it('filters content by sourceAreaCode', () => {
    const items = service.listContent({ sourceAreaCode: 'in2012-infanzia-discorsi-parole' });
    expect(items).toHaveLength(1);
    expect(items[0].text).toContain('Traguardo');
  });

  it('combines sourceAreaCode with schoolOrder', () => {
    const items = service.listContent({
      sourceAreaCode: 'in2012-italiano',
      schoolOrder: 'primaria',
    });
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it('filters content by nodeType', () => {
    const items = service.listContent({ nodeType: 'traguardo' });
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it('filters content by normativeCheckpoint', () => {
    const items = service.listContent({ normativeCheckpoint: 'end-lower-secondary' });
    expect(items).toHaveLength(2);
  });

  it('filters content by case-insensitive text', () => {
    const items = service.listContent({ text: 'TRAGUARDO' });
    expect(items.length).toBeGreaterThanOrEqual(1);
    for (const item of items) {
      expect(item.text.toLowerCase()).toContain('traguardo');
    }
  });

  it('combines multiple filters', () => {
    const items = service.listContent({
      schoolOrder: 'primaria',
      nodeType: 'obiettivo',
      normativeCheckpoint: 'end-primary-grade-3',
    });
    expect(items).toHaveLength(1);
    expect(items[0].text).toBe('Obiettivo - classe III');
  });

  it('gets content detail by id', () => {
    const allItems = service.listContent({});
    const detail = service.getContentDetail(allItems[0].id);
    expect(detail).toBeDefined();
    expect(detail!.text).toBe(allItems[0].text);
    expect(detail!.provenance).toBe('normative');
  });

  it('returns undefined for unknown id', () => {
    expect(service.getContentDetail('unknown')).toBeUndefined();
  });

  it('does not mutate fixture objects', () => {
    const nodesBefore = fixture2012.NODES_2012_INFANZIA.map(n => n.text);
    service.listContent({ schoolOrder: 'infanzia' });
    const nodesAfter = fixture2012.NODES_2012_INFANZIA.map(n => n.text);
    expect(nodesAfter).toEqual(nodesBefore);
  });

  it('orders content by checkpoint rank then text', () => {
    const items = service.listContent({ schoolOrder: 'primaria' });
    const texts = items.map(i => i.text);
    expect(texts).toEqual([
      'Obiettivo - classe III',
      'Obiettivo - fine primaria',
      'Traguardo - fine primaria',
    ]);
  });
});
