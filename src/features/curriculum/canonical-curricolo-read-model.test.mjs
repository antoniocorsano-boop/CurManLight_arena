import { describe, expect, it } from 'vitest';
import artifact from './data/canonicalCurricoloV13.generated.json';
import {
  buildCanonicalCurricoloReadModel,
  loadCanonicalCurricoloReadModel,
} from './data/canonicalCurricoloReadModel';

const domainById = (model, id) => model.domains.find((domain) => domain.id === id);
const orderById = (domain, id) => domain.orders.find((order) => order.id === id);

describe('canonical curricolo read model', () => {
  it('derives disciplines fields orders and scopes from the 113 canonical segments', () => {
    const result = loadCanonicalCurricoloReadModel(artifact);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const model = result.value;
    const expectedDomainIds = [...new Set(
      artifact.materialization.segments.map((segment) => segment.subjectOrFieldId),
    )].sort();

    expect(model.identity).toMatchObject({
      title: 'Curricolo verticale d’Istituto',
      schoolYearRef: '2026/2027',
      masterVersion: '1.3',
      revisionId: '27',
      validationStatus: 'OPEN',
      validationLabel: 'Validazione professionale aperta',
      curricoloVigente: false,
      vigencyLabel: 'Non vigente',
    });
    expect(model.domains.map((domain) => domain.id).sort()).toEqual(expectedDomainIds);
    expect(model.domains.flatMap((domain) => domain.orders.flatMap((order) => order.scopes))).toHaveLength(113);
  });

  it('keeps infancy school-level without a numeric class', () => {
    const model = buildCanonicalCurricoloReadModel(artifact);
    const field = domainById(model, 'i-discorsi-e-le-parole');
    expect(field?.kind).toBe('field');

    const infancy = field && orderById(field, 'infanzia');
    expect(infancy?.scopes).toHaveLength(1);
    expect(infancy?.scopes[0]).toMatchObject({
      type: 'school-level',
      label: '3–5 anni',
      targetClass: null,
    });
  });

  it('keeps AI literacy grade ranges native', () => {
    const model = buildCanonicalCurricoloReadModel(artifact);
    const ai = domainById(model, 'ai-literacy');
    expect(ai?.kind).toBe('axis');

    const primaria = ai && orderById(ai, 'primaria');
    expect(primaria?.scopes).toHaveLength(2);
    expect(primaria?.scopes.map((scope) => ({
      type: scope.type,
      grades: scope.grades,
      label: scope.label,
      targetClass: scope.targetClass,
    }))).toEqual([
      { type: 'grade-range', grades: ['1', '2'], label: 'Classi I–II', targetClass: null },
      { type: 'grade-range', grades: ['3', '4', '5'], label: 'Classi III–V', targetClass: null },
    ]);
  });

  it('reaches civic education and Latin without a hardcoded coverage registry', () => {
    const model = buildCanonicalCurricoloReadModel(artifact);

    const civic = domainById(model, 'educazione-civica');
    expect(civic?.kind).toBe('axis');
    expect(civic?.orders.map((order) => order.id)).toEqual(['infanzia', 'primaria', 'secondaria']);

    const latin = domainById(model, 'latino-lel');
    expect(latin?.kind).toBe('discipline');
    expect(latin?.orders).toHaveLength(1);
    expect(latin?.orders[0].id).toBe('secondaria');
    expect(latin?.orders[0].scopes.map((scope) => scope.targetClass)).toEqual(['2', '3']);
  });

  it('fails closed when the artifact is invalid or incomplete', () => {
    const invalid = structuredClone(artifact);
    invalid.materialization.segments.pop();

    const result = loadCanonicalCurricoloReadModel(invalid);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.join(' ')).toMatch(/113|segment/i);
  });

  it('retains proposed relation status and source relation type without promoting either', () => {
    const model = buildCanonicalCurricoloReadModel(artifact);

    expect(model.relations).toHaveLength(artifact.materialization.verticalLinks.length);
    expect(model.relations.length).toBeGreaterThan(0);
    expect(new Set(model.relations.map((relation) => relation.status))).toEqual(new Set(['proposed']));
    expect(model.relations.map((relation) => relation.relationType)).toEqual(
      artifact.materialization.verticalLinks.map((relation) => relation.relationType),
    );
  });
});
