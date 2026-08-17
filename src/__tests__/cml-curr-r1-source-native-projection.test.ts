import { describe, expect, it } from 'vitest';
import {
  createSource,
  createSourceReference,
  createCurriculumVersion,
  createCurriculumVersionReference,
  createCurriculumSegment,
  createSegmentReference,
  createCurriculumNode,
  validateCanonicalCurriculumSegment,
  validateCanonicalCurriculumNode,
} from '../domain/curriculum';

describe('CURR-R1 source-native canonical projection', () => {
  const now = '2026-08-17T21:00:00.000Z';

  const source = createSource(
    'D.M. 254/2012 — Indicazioni nazionali per il curricolo',
    'normative-national',
    { schoolOrders: ['infanzia', 'primaria', 'secondaria'], isNational: true },
    {
      authority: 'Ministero dell’Istruzione',
      issuedAt: '2012-11-16',
      versionLabel: 'D.M. 254/2012',
      status: 'active',
      origin: 'normative-source',
      now,
    },
  );

  const sourceRef = createSourceReference(source.id, source.title);

  it('represents an infanzia experience field without inventing a discipline', () => {
    const version = createCurriculumVersion('Indicazioni nazionali 2012 — Infanzia', 'infanzia', {
      status: 'active',
      mainSourceRefs: [sourceRef],
      origin: 'normative-source',
      now,
    });
    const versionRef = createCurriculumVersionReference(version.id, version.title);

    const segment = createCurriculumSegment(
      versionRef,
      'infanzia',
      null,
      'I discorsi e le parole',
      {
        sourceArea: {
          kind: 'experience-field',
          code: 'in2012-infanzia-discorsi-parole',
          label: 'I discorsi e le parole',
        },
        status: 'complete',
        completeness: 'complete',
        sourceRefs: [sourceRef],
        origin: 'normative-source',
        now,
      },
    );

    expect(segment.disciplineCode).toBeNull();
    expect(segment.sourceArea?.kind).toBe('experience-field');
    expect(validateCanonicalCurriculumSegment(segment).valid).toBe(true);
  });

  it('requires either a discipline or a source-native area', () => {
    const version = createCurriculumVersion('Indicazioni nazionali 2012 — Infanzia', 'infanzia', {
      origin: 'normative-source',
      now,
    });
    const segment = createCurriculumSegment(
      createCurriculumVersionReference(version.id, version.title),
      'infanzia',
      null,
      'Segmento non classificato',
      { origin: 'normative-source', now },
    );

    const result = validateCanonicalCurriculumSegment(segment);
    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.code === 'SEG-005')).toBe(true);
  });

  it('preserves a source-native nucleus for a disciplinary segment', () => {
    const version = createCurriculumVersion('Indicazioni nazionali 2012 — Primaria', 'primaria', {
      disciplines: ['italiano'],
      status: 'active',
      mainSourceRefs: [sourceRef],
      origin: 'normative-source',
      now,
    });
    const segment = createCurriculumSegment(
      createCurriculumVersionReference(version.id, version.title),
      'primaria',
      'italiano',
      'Italiano — Ascolto e parlato',
      {
        sourceArea: {
          kind: 'discipline',
          code: 'in2012-italiano',
          label: 'Italiano',
        },
        sourceNucleus: {
          code: 'in2012-italiano-ascolto-parlato',
          label: 'Ascolto e parlato',
        },
        sourceRefs: [sourceRef],
        origin: 'normative-source',
        now,
      },
    );

    expect(segment.sourceNucleus?.label).toBe('Ascolto e parlato');
    expect(validateCanonicalCurriculumSegment(segment).valid).toBe(true);
  });

  it('uses a controlled normative checkpoint for national nodes', () => {
    const version = createCurriculumVersion('Indicazioni nazionali 2012 — Primaria', 'primaria', {
      disciplines: ['italiano'],
      mainSourceRefs: [sourceRef],
      origin: 'normative-source',
      now,
    });
    const versionRef = createCurriculumVersionReference(version.id, version.title);
    const segment = createCurriculumSegment(versionRef, 'primaria', 'italiano', 'Italiano', {
      sourceRefs: [sourceRef],
      origin: 'normative-source',
      now,
    });
    const node = createCurriculumNode(
      versionRef,
      createSegmentReference(segment.id, segment.title),
      'obiettivo',
      'Obiettivo normativo di collaudo',
      {
        sourceRefs: [sourceRef],
        provenance: 'normative',
        normativeCheckpoint: 'end-primary-grade-3',
        origin: 'normative-source',
        now,
      },
    );

    expect(node.normativeCheckpoint).toBe('end-primary-grade-3');
    expect(validateCanonicalCurriculumNode(node).valid).toBe(true);

    const invalidNode = { ...node, normativeCheckpoint: 'annual' } as unknown as typeof node;
    const invalidResult = validateCanonicalCurriculumNode(invalidNode);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.some(error => error.code === 'NODE-011')).toBe(true);
  });
});
