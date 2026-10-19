import { describe, expect, it } from 'vitest';
import {
  MemoryCurriculumPersistenceBackend,
  createCurriculumRepositories,
} from '../domain/curriculum/persistence';
import {
  createCurricoloVerticaleReleaseV1,
  type CurricoloVerticalePerimeterV1,
} from '../domain/transfer/curricoloVerticaleReleaseV1';
import { exportCurricoloVerticaleFromRepositoriesV1 } from '../domain/transfer/curricoloVerticaleRepositoryExportV1';

const NOW = '2026-10-19T12:00:00.000Z';
const perimeter: CurricoloVerticalePerimeterV1 = {
  expected: [{
    schoolOrder: 'primaria',
    scope: { type: 'grade-range', grades: ['1', '2', '3', '4', '5'] },
    domainId: 'italiano',
    domainKind: 'DISCIPLINA',
  }],
  intentionallyNotApplicable: [],
};

const content = {
  traguardi: ['Traguardo'],
  obiettivi: ['Obiettivo'],
  evidenze: ['Evidenza'],
  conoscenze: ['Conoscenza'],
  abilita: ['Abilità'],
  competenze: ['Competenza'],
  nucleiFondanti: ['Nucleo'],
  proposals: [],
};

describe('vertical curriculum repository export v1', () => {
  it('exports only the requested productive version with deterministic ordering and footprint', async () => {
    const backend = new MemoryCurriculumPersistenceBackend();
    const repositories = createCurriculumRepositories(backend);

    const version = {
      id: 'version-target',
      institutionId: 'school-demo',
      title: 'Curricolo verticale',
      versionNumber: '7',
      status: 'draft' as const,
      createdAt: NOW,
      updatedAt: NOW,
    };
    await repositories.versions.save(version);
    await repositories.versions.save({
      ...version,
      id: 'version-other',
      versionNumber: '6',
      institutionId: 'school-demo',
    });

    const targetSegment = {
      id: 'segment-z',
      versionId: version.id,
      schoolLevel: 'primaria' as const,
      subjectOrFieldId: 'italiano',
      scope: { type: 'grade-range' as const, grades: ['1', '2', '3', '4', '5'] },
      frameworkApplicability: {
        framework: 'IN2025' as const,
        resolutionStatus: 'resolved' as const,
        resolutionReason: 'fixture',
      },
      workStatus: 'draft' as const,
      content,
      createdAt: NOW,
      updatedAt: NOW,
    };
    await repositories.segments.save(targetSegment);
    await repositories.segments.save({
      ...targetSegment,
      id: 'segment-other',
      versionId: 'version-other',
    });

    const nodeB = {
      id: 'node-b',
      versionId: version.id,
      segmentId: targetSegment.id,
      type: 'objective' as const,
      title: 'B',
      workStatus: 'draft' as const,
      createdAt: NOW,
      updatedAt: NOW,
    };
    const nodeA = { ...nodeB, id: 'node-a', title: 'A' };
    await repositories.nodes.save(nodeB);
    await repositories.nodes.save(nodeA);
    await repositories.links.save({
      id: 'link-1',
      versionId: version.id,
      sourceNodeId: nodeA.id,
      targetNodeId: nodeB.id,
      relationType: 'development',
      rationale: 'Sviluppo verticale',
      status: 'draft',
      createdAt: NOW,
      updatedAt: NOW,
    });

    const exported = await exportCurricoloVerticaleFromRepositoriesV1({
      repositories,
      versionId: version.id,
      institutionId: 'school-demo',
      schoolYearRef: '2026/2027',
      perimeter,
      authority: {
        state: 'PROVISIONAL_COMPLETE',
        requiresRevalidationOnApproval: true,
      },
      issuedAt: NOW,
    });

    expect(exported.version.id).toBe(version.id);
    expect(exported.segments.map(item => item.id)).toEqual(['segment-z']);
    expect(exported.nodes.map(item => item.id)).toEqual(['node-a', 'node-b']);
    expect(exported.verticalLinks.map(item => item.id)).toEqual(['link-1']);

    const pure = createCurricoloVerticaleReleaseV1({
      institutionId: 'school-demo',
      schoolYearRef: '2026/2027',
      version,
      segments: [targetSegment],
      nodes: [nodeB, nodeA],
      verticalLinks: [{
        id: 'link-1',
        versionId: version.id,
        sourceNodeId: nodeA.id,
        targetNodeId: nodeB.id,
        relationType: 'development',
        rationale: 'Sviluppo verticale',
        status: 'draft',
        createdAt: NOW,
        updatedAt: NOW,
      }],
      perimeter,
      authority: {
        state: 'PROVISIONAL_COMPLETE',
        requiresRevalidationOnApproval: true,
      },
      issuedAt: NOW,
    });

    expect(exported.structuralFootprint.hash).toBe(pure.structuralFootprint.hash);
  });

  it('fails closed when the requested curriculum version does not exist', async () => {
    const repositories = createCurriculumRepositories(new MemoryCurriculumPersistenceBackend());

    await expect(exportCurricoloVerticaleFromRepositoriesV1({
      repositories,
      versionId: 'missing-version',
      institutionId: 'school-demo',
      schoolYearRef: '2026/2027',
      perimeter,
      authority: {
        state: 'PROVISIONAL_COMPLETE',
        requiresRevalidationOnApproval: true,
      },
      issuedAt: NOW,
    })).rejects.toThrow(/not found/i);
  });
});
