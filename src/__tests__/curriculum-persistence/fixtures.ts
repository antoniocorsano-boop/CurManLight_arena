import type {
  CurriculumNode,
  CurriculumSegment,
  InstituteCurriculumVersion,
  VerticalCurriculumLink,
} from '../../domain/curriculum';
import {
  MemoryCurriculumPersistenceBackend,
  createCurriculumRepositories,
  type LegacyCurriculumSource,
} from '../../domain/curriculum/persistence';

export const NOW = '2026-07-25T10:00:00.000Z';

export const version = (
  overrides: Partial<InstituteCurriculumVersion> = {},
): InstituteCurriculumVersion => ({
  id: 'version-1',
  title: 'Curricolo',
  versionNumber: '1',
  status: 'draft',
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
});

export const segment = (overrides: Partial<CurriculumSegment> = {}): CurriculumSegment => ({
  id: 'segment-1',
  versionId: 'version-1',
  schoolLevel: 'primaria',
  subjectOrFieldId: 'italiano',
  scope: { type: 'school-level' },
  frameworkApplicability: {
    framework: null,
    resolutionStatus: 'requires-context-confirmation',
    resolutionReason: 'test',
  },
  workStatus: 'draft',
  content: {
    traguardi: [], obiettivi: [], evidenze: [], conoscenze: [],
    abilita: [], competenze: [], nucleiFondanti: [], proposals: [],
  },
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
});

export const node = (overrides: Partial<CurriculumNode> = {}): CurriculumNode => ({
  id: 'node-1',
  versionId: 'version-1',
  segmentId: 'segment-1',
  type: 'objective',
  title: 'Comprendere',
  workStatus: 'draft',
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
});

export const link = (overrides: Partial<VerticalCurriculumLink> = {}): VerticalCurriculumLink => ({
  id: 'link-1',
  versionId: 'version-1',
  sourceNodeId: 'node-1',
  targetNodeId: 'node-2',
  relationType: 'continuity',
  rationale: 'Continuità osservabile',
  status: 'draft',
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
});

export const legacy: LegacyCurriculumSource = {
  italiano: {
    primaria: {
      traguardi: ['Legge testi'],
      obiettivi: ['Comprende testi'],
      evidenze: ['Riassume un testo'],
      proposals: [],
      nucleiFondanti: ['Lettura'],
    },
  },
};

export async function prepared() {
  const backend = new MemoryCurriculumPersistenceBackend();
  const repositories = createCurriculumRepositories(backend);
  await repositories.versions.save(version());
  await repositories.segments.save(segment());
  await repositories.nodes.save(node());
  await repositories.nodes.save(node({ id: 'node-2', title: 'Argomentare' }));
  return { backend, repositories };
}
