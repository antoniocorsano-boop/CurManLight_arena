import { describe, expect, it } from 'vitest';
import type {
  CurricoloNode,
  CurricoloSegment,
  InstituteCurricoloVersion,
  VerticalCurricoloLink,
} from '../types/curricolo';
import {
  createCurricoloVerticaleReleaseV1,
  validateCurricoloVerticaleReleaseV1,
} from '../domain/transfer/curricoloVerticaleReleaseV1';

const NOW = '2026-10-19T12:00:00.000Z';

const version: InstituteCurricoloVersion = {
  id: 'arena-curricolo-istituto-2026-27-v1',
  institutionId: 'ic-calvario-covotta-don-milani',
  title: 'Curricolo verticale di istituto 2026/2027',
  versionNumber: '1',
  status: 'under-review',
  createdAt: NOW,
  updatedAt: NOW,
};

const emptyContent = {
  traguardi: ['Traguardo governato'],
  obiettivi: ['Obiettivo governato'],
  evidenze: ['Evidenza governata'],
  conoscenze: ['Conoscenza governata'],
  abilita: ['Abilità governata'],
  competenze: ['Competenza governata'],
  nucleiFondanti: ['Nucleo governato'],
  proposals: [],
};

function segment(
  id: string,
  schoolLevel: 'infanzia' | 'primaria' | 'secondaria',
  subjectOrFieldId: string,
  scope: CurricoloSegment['scope'],
): CurricoloSegment {
  return {
    id,
    versionId: version.id,
    schoolLevel,
    subjectOrFieldId,
    scope,
    frameworkApplicability: {
      framework: 'IN2025',
      resolutionStatus: 'resolved',
      resolutionReason: 'fixture',
    },
    workStatus: 'ready-for-consolidation',
    content: emptyContent,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

const segments: CurricoloSegment[] = [
  segment('seg-infanzia-linguaggi', 'infanzia', 'i-discorsi-e-le-parole', { type: 'school-level' }),
  segment('seg-primaria-italiano', 'primaria', 'italiano', {
    type: 'grade-range',
    grades: ['1', '2', '3', '4', '5'],
  }),
  segment('seg-secondaria-tecnologia', 'secondaria', 'tecnologia', {
    type: 'grade-range',
    grades: ['1', '2', '3'],
  }),
];

const nodes: CurricoloNode[] = [
  {
    id: 'node-infanzia-linguaggi',
    versionId: version.id,
    segmentId: 'seg-infanzia-linguaggi',
    type: 'milestone',
    title: 'Comunicare e raccontare',
    workStatus: 'validated',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'node-primaria-italiano',
    versionId: version.id,
    segmentId: 'seg-primaria-italiano',
    type: 'milestone',
    title: 'Comprendere e produrre testi',
    workStatus: 'validated',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'node-secondaria-tecnologia',
    versionId: version.id,
    segmentId: 'seg-secondaria-tecnologia',
    type: 'milestone',
    title: 'Comprendere sistemi tecnologici',
    workStatus: 'validated',
    createdAt: NOW,
    updatedAt: NOW,
  },
];

const verticalLinks: VerticalCurricoloLink[] = [
  {
    id: 'link-infanzia-primaria',
    versionId: version.id,
    sourceNodeId: 'node-infanzia-linguaggi',
    targetNodeId: 'node-primaria-italiano',
    relationType: 'development',
    rationale: 'Continuità verticale governata',
    status: 'validated',
    createdAt: NOW,
    updatedAt: NOW,
  },
];

const perimeter = {
  expected: [
    {
      schoolOrder: 'infanzia' as const,
      scope: { type: 'school-level' as const },
      domainId: 'i-discorsi-e-le-parole',
      domainKind: 'CAMPO_ESPERIENZA' as const,
    },
    {
      schoolOrder: 'primaria' as const,
      scope: { type: 'grade-range' as const, grades: ['1', '2', '3', '4', '5'] },
      domainId: 'italiano',
      domainKind: 'DISCIPLINA' as const,
    },
    {
      schoolOrder: 'secondaria' as const,
      scope: { type: 'grade-range' as const, grades: ['1', '2', '3'] },
      domainId: 'tecnologia',
      domainKind: 'DISCIPLINA' as const,
    },
  ],
  intentionallyNotApplicable: [],
};

function validInput(issuedAt = NOW) {
  return {
    institutionId: 'ic-calvario-covotta-don-milani',
    schoolYearRef: '2026/2027',
    version,
    segments,
    nodes,
    verticalLinks,
    perimeter,
    authority: {
      state: 'PROVISIONAL_COMPLETE' as const,
      requiresRevalidationOnApproval: true as const,
    },
    issuedAt,
  };
}

describe('TRAMA_CURRICOLO_VERTICALE_RELEASE_V1', () => {
  it('emits one governed release covering infancy, primary and lower secondary', () => {
    const release = createCurricoloVerticaleReleaseV1(validInput());

    expect(release.contract).toBe('TRAMA_CURRICOLO_VERTICALE_RELEASE_V1');
    expect(release.manifest.coverageStatus).toBe('SATISFIED');
    expect(release.manifest.schoolOrders).toEqual(['infanzia', 'primaria', 'secondaria']);
    expect(release.downstreamPolicy).toEqual({
      acceptanceRequired: true,
      automaticWriteAllowed: false,
    });

    const infancy = release.segments.find(item => item.schoolLevel === 'infanzia');
    expect(infancy?.scope).toEqual({ type: 'school-level' });
    expect(JSON.stringify(infancy)).not.toMatch(/grade|yearLevel/);

    expect(validateCurricoloVerticaleReleaseV1(release)).toEqual({ valid: true, errors: [] });
  });

  it('marks the manifest incomplete when an expected institutional scope is missing', () => {
    const input = validInput();
    const release = createCurricoloVerticaleReleaseV1({
      ...input,
      segments: input.segments.filter(item => item.schoolLevel !== 'primaria'),
      nodes: input.nodes.filter(item => item.segmentId !== 'seg-primaria-italiano'),
      verticalLinks: [],
    });

    expect(release.manifest.coverageStatus).toBe('INCOMPLETE');
    expect(release.manifest.missing).toContainEqual(
      expect.objectContaining({ schoolOrder: 'primaria', domainId: 'italiano' }),
    );
  });

  it('rejects APPROVED authority without verifiable Arena authority evidence', () => {
    expect(() => createCurricoloVerticaleReleaseV1({
      ...validInput(),
      authority: {
        state: 'APPROVED',
        requiresRevalidationOnApproval: false,
      } as never,
    })).toThrow(/authorityReceiptRef/i);
  });

  it('rejects graph members that do not belong to the released Arena version', () => {
    const input = validInput();
    expect(() => createCurricoloVerticaleReleaseV1({
      ...input,
      nodes: [{ ...input.nodes[0], versionId: 'other-version' }, ...input.nodes.slice(1)],
    })).toThrow(/version/i);
  });

  it('keeps the structural footprint stable when only issuedAt changes', () => {
    const first = createCurricoloVerticaleReleaseV1(validInput('2026-10-19T12:00:00.000Z'));
    const second = createCurricoloVerticaleReleaseV1(validInput('2026-10-19T13:00:00.000Z'));

    expect(first.structuralFootprint.hash).toBe(second.structuralFootprint.hash);
  });
});
