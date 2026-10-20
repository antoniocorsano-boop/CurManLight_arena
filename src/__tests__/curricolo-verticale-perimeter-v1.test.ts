import { describe, expect, it } from 'vitest';
import { buildCurricoloVerticaleManifestV1 } from '../domain/transfer/curricoloVerticaleReleaseV1';
import { buildCurricoloVerticalePerimeterV1 } from '../domain/transfer/curricoloVerticalePerimeterV1';
import type { CurricoloSegment } from '../types/curricolo';

const NOW = '2026-10-19T12:00:00.000Z';
const content = {
  traguardi: ['Traguardo'], obiettivi: ['Obiettivo'], evidenze: ['Evidenza'],
  conoscenze: ['Conoscenza'], abilita: ['Abilità'], competenze: ['Competenza'],
  nucleiFondanti: ['Nucleo'], proposals: [],
};

function segment(overrides: Partial<CurricoloSegment>): CurricoloSegment {
  return {
    id: 'segment',
    versionId: 'version-1',
    schoolLevel: 'primaria',
    subjectOrFieldId: 'italiano',
    scope: { type: 'grade', grade: '1' },
    frameworkApplicability: {
      framework: 'IN2025', resolutionStatus: 'resolved', resolutionReason: 'fixture',
    },
    workStatus: 'draft',
    content,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

describe('governed institute vertical perimeter v1', () => {
  it('keeps an expected missing primary scope visible as INCOMPLETE instead of inferring completeness from stored segments', () => {
    const perimeter = buildCurricoloVerticalePerimeterV1({
      schoolOrders: ['infanzia', 'primaria', 'secondaria'],
      expectedScopes: [
        {
          schoolOrder: 'infanzia',
          scope: { type: 'school-level' },
          domainId: 'i-discorsi-e-le-parole',
          domainKind: 'CAMPO_ESPERIENZA',
        },
        {
          schoolOrder: 'primaria',
          scope: { type: 'grade', grade: '1' },
          domainId: 'italiano',
          domainKind: 'DISCIPLINA',
        },
        {
          schoolOrder: 'secondaria',
          scope: { type: 'grade', grade: '1' },
          domainId: 'tecnologia',
          domainKind: 'DISCIPLINA',
        },
      ],
      intentionallyNotApplicable: [],
    });

    const manifest = buildCurricoloVerticaleManifestV1({
      perimeter,
      segments: [
        segment({
          id: 'infanzia',
          schoolLevel: 'infanzia',
          subjectOrFieldId: 'i-discorsi-e-le-parole',
          scope: { type: 'school-level' },
        }),
        segment({
          id: 'secondaria',
          schoolLevel: 'secondaria',
          subjectOrFieldId: 'tecnologia',
          scope: { type: 'grade', grade: '1' },
        }),
      ],
    });

    expect(manifest.coverageStatus).toBe('INCOMPLETE');
    expect(manifest.missing).toContainEqual(expect.objectContaining({
      schoolOrder: 'primaria', domainId: 'italiano',
    }));
  });

  it('represents infancy at school level without inventing a numeric grade', () => {
    const perimeter = buildCurricoloVerticalePerimeterV1({
      schoolOrders: ['infanzia'],
      expectedScopes: [{
        schoolOrder: 'infanzia',
        scope: { type: 'school-level' },
        domainId: 'il-se-e-l-altro',
        domainKind: 'CAMPO_ESPERIENZA',
      }],
      intentionallyNotApplicable: [],
    });

    expect(perimeter.expected[0].scope).toEqual({ type: 'school-level' });
    expect(JSON.stringify(perimeter.expected[0])).not.toMatch(/grade|yearLevel/);
  });

  it('rejects a configured school order that has no declared expected or intentionally N/A scope', () => {
    expect(() => buildCurricoloVerticalePerimeterV1({
      schoolOrders: ['infanzia', 'primaria'],
      expectedScopes: [{
        schoolOrder: 'infanzia',
        scope: { type: 'school-level' },
        domainId: 'il-se-e-l-altro',
        domainKind: 'CAMPO_ESPERIENZA',
      }],
      intentionallyNotApplicable: [],
    })).toThrow(/primaria/i);
  });

  it('normalizes grade-range order before overlap detection', () => {
    expect(() => buildCurricoloVerticalePerimeterV1({
      schoolOrders: ['primaria'],
      expectedScopes: [{
        schoolOrder: 'primaria',
        scope: { type: 'grade-range', grades: ['1', '2'] },
        domainId: 'italiano',
        domainKind: 'DISCIPLINA',
      }],
      intentionallyNotApplicable: [{
        schoolOrder: 'primaria',
        scope: { type: 'grade-range', grades: ['2', '1'] },
        domainId: 'italiano',
        domainKind: 'DISCIPLINA',
      }],
    })).toThrow(/both expected and intentionally not applicable/i);
  });
});
