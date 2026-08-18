import type {
  CurriculumVersion,
  CurriculumSegment,
  CurriculumNode,
  SourceAreaKind,
  NormativeCheckpoint,
  CurriculumProvenance,
} from './model/types';
import type { DisciplineCode, CurriculumNodeType } from './model/vocabularies';
import type { SchoolOrder } from '../../types/curriculum';
import type { EntityReference, EntityMetadata } from './identity/types';
import type { Fixture2012 } from './fixture2012';

export interface NationalCurriculumFixture {
  framework: FrameworkInfo;
  versions: CurriculumVersion[];
  segments: CurriculumSegment[];
  nodes: CurriculumNode[];
}

export interface FrameworkInfo {
  id: string;
  title: string;
  source: {
    title: string;
    authority?: string;
    issuedAt?: string;
    versionLabel?: string;
  };
  schoolOrders: SchoolOrder[];
}

export interface AreaInfo {
  id: string;
  title: string;
  kind: SourceAreaKind;
  code: string;
  disciplineCode: DisciplineCode | null;
  schoolOrder: SchoolOrder;
}

export interface ContentItem {
  id: string;
  text: string;
  nodeType: CurriculumNodeType;
  normativeCheckpoint?: NormativeCheckpoint;
  schoolOrder: SchoolOrder;
  disciplineCode: DisciplineCode | null;
  sourceAreaKind: SourceAreaKind;
}

export interface ContentDetail extends ContentItem {
  provenance: CurriculumProvenance;
  sourceRefs: EntityReference[];
  metadata: EntityMetadata;
}

export interface NationalCurriculumConsultationService {
  listAvailableFrameworks(): FrameworkInfo[];
  listSchoolOrders(frameworkId: string): SchoolOrder[];
  listAreas(frameworkId: string, schoolOrder: SchoolOrder): AreaInfo[];
  listContent(query: {
    frameworkId?: string;
    schoolOrder?: SchoolOrder;
    disciplineCode?: DisciplineCode | null;
    sourceAreaKind?: SourceAreaKind;
    sourceAreaCode?: string;
    nodeType?: CurriculumNodeType;
    normativeCheckpoint?: NormativeCheckpoint;
    text?: string;
  }): ContentItem[];
  getContentDetail(id: string): ContentDetail | undefined;
}

const CHECKPOINT_RANK: Record<NormativeCheckpoint, number> = {
  'end-infanzia': 0,
  'end-primary-grade-3': 1,
  'end-primary': 2,
  'end-lower-secondary': 3,
};

function buildSegmentIndex(segments: CurriculumSegment[]): Map<string, CurriculumSegment> {
  const index = new Map<string, CurriculumSegment>();
  for (const segment of segments) {
    index.set(segment.id, segment);
  }
  return index;
}

export function adaptFixture2012ToNationalCurriculumFixture(fixture: Fixture2012): NationalCurriculumFixture[] {
  return [
    {
      framework: {
        id: 'IN2012',
        title: 'Indicazioni nazionali 2012',
        source: {
          title: fixture.SOURCE_2012.title,
          authority: fixture.SOURCE_2012.authority,
          issuedAt: fixture.SOURCE_2012.issuedAt,
          versionLabel: fixture.SOURCE_2012.versionLabel,
        },
        schoolOrders: ['infanzia', 'primaria', 'secondaria'],
      },
      versions: [fixture.VERSION_2012_INFANZIA, fixture.VERSION_2012_PRIMARIA, fixture.VERSION_2012_SECONDARIA],
      segments: [
        ...fixture.SEGMENTS_2012_INFANZIA,
        ...fixture.SEGMENTS_2012_PRIMARIA,
        ...fixture.SEGMENTS_2012_SECONDARIA,
      ],
      nodes: [
        ...fixture.NODES_2012_INFANZIA,
        ...fixture.NODES_2012_PRIMARIA,
        ...fixture.NODES_2012_SECONDARIA,
      ],
    },
  ];
}

export function createNationalCurriculumConsultationService(fixtures: readonly NationalCurriculumFixture[]): NationalCurriculumConsultationService {
  const frameworks = fixtures
    .map(fixture => fixture.framework)
    .sort((a, b) => (a.source.issuedAt ?? '').localeCompare(b.source.issuedAt ?? ''));

  const frameworkById = new Map(frameworks.map(framework => [framework.id, framework]));
  const segmentsByFramework = new Map<string, CurriculumSegment[]>();
  const nodesByFramework = new Map<string, CurriculumNode[]>();
  const segmentIndexByFramework = new Map<string, Map<string, CurriculumSegment>>();

  for (const fixture of fixtures) {
    segmentsByFramework.set(fixture.framework.id, fixture.segments);
    nodesByFramework.set(fixture.framework.id, fixture.nodes);
    segmentIndexByFramework.set(fixture.framework.id, buildSegmentIndex(fixture.segments));
  }

  return {
    listAvailableFrameworks(): FrameworkInfo[] {
      return frameworks;
    },
    listSchoolOrders(frameworkId: string): SchoolOrder[] {
      const framework = frameworkById.get(frameworkId);
      if (!framework) {
        return [];
      }
      return framework.schoolOrders;
    },
    listAreas(frameworkId: string, schoolOrder: SchoolOrder): AreaInfo[] {
      const segments = segmentsByFramework.get(frameworkId) ?? [];
      const seen = new Map<string, AreaInfo>();

      for (const segment of segments) {
        if (segment.schoolOrder !== schoolOrder) {
          continue;
        }
        const sourceArea = segment.sourceArea;
        const key = `${segment.sourceArea?.code ?? 'unknown'}-${segment.disciplineCode ?? 'null'}`;
        if (!seen.has(key)) {
          seen.set(key, {
            id: segment.id,
            title: segment.title,
            kind: sourceArea?.kind ?? 'discipline',
            code: sourceArea?.code ?? segment.title,
            disciplineCode: segment.disciplineCode,
            schoolOrder: segment.schoolOrder,
          });
        }
      }

      return Array.from(seen.values()).sort((a, b) => a.title.localeCompare(b.title));
    },
    listContent(query: {
      frameworkId?: string;
      schoolOrder?: SchoolOrder;
      disciplineCode?: DisciplineCode | null;
      sourceAreaKind?: SourceAreaKind;
      sourceAreaCode?: string;
      nodeType?: CurriculumNodeType;
      normativeCheckpoint?: NormativeCheckpoint;
      text?: string;
    } = {}): ContentItem[] {
      const matchingFrameworks =
        query.frameworkId !== undefined
          ? fixtures.filter(fixture => fixture.framework.id === query.frameworkId)
          : fixtures;

      const items: ContentItem[] = [];

      for (const fixture of matchingFrameworks) {
        const segmentIndex = segmentIndexByFramework.get(fixture.framework.id);
        if (!segmentIndex) {
          continue;
        }

        for (const node of fixture.nodes) {
          const segment = segmentIndex.get(node.segmentRef.id);
          if (!segment) {
            continue;
          }
          if (query.schoolOrder !== undefined && segment.schoolOrder !== query.schoolOrder) {
            continue;
          }
          if (query.disciplineCode !== undefined && segment.disciplineCode !== query.disciplineCode) {
            continue;
          }
          if (query.sourceAreaKind !== undefined && segment.sourceArea?.kind !== query.sourceAreaKind) {
            continue;
          }
          if (query.sourceAreaCode !== undefined && segment.sourceArea?.code !== query.sourceAreaCode) {
            continue;
          }
          if (query.nodeType !== undefined && node.nodeType !== query.nodeType) {
            continue;
          }
          if (query.normativeCheckpoint !== undefined && node.normativeCheckpoint !== query.normativeCheckpoint) {
            continue;
          }
          if (query.text !== undefined) {
            const lowerText = query.text.toLocaleLowerCase();
            if (!node.text.toLocaleLowerCase().includes(lowerText)) {
              continue;
            }
          }

          items.push({
            id: node.id,
            text: node.text,
            nodeType: node.nodeType,
            normativeCheckpoint: node.normativeCheckpoint,
            schoolOrder: segment.schoolOrder,
            disciplineCode: segment.disciplineCode,
            sourceAreaKind: segment.sourceArea?.kind ?? 'discipline',
          });
        }
      }

      return items.sort((a, b) => {
        const rankA = a.normativeCheckpoint ? CHECKPOINT_RANK[a.normativeCheckpoint] : 99;
        const rankB = b.normativeCheckpoint ? CHECKPOINT_RANK[b.normativeCheckpoint] : 99;
        if (rankA !== rankB) {
          return rankA - rankB;
        }
        return a.text.localeCompare(b.text);
      });
    },
    getContentDetail(id: string): ContentDetail | undefined {
      for (const fixture of fixtures) {
        const node = fixture.nodes.find(item => item.id === id);
        if (!node) {
          continue;
        }
        const segmentIndex = segmentIndexByFramework.get(fixture.framework.id);
        const segment = segmentIndex?.get(node.segmentRef.id);
        if (!segment) {
          continue;
        }

        return {
          id: node.id,
          text: node.text,
          nodeType: node.nodeType,
          normativeCheckpoint: node.normativeCheckpoint,
          schoolOrder: segment.schoolOrder,
          disciplineCode: segment.disciplineCode,
          sourceAreaKind: segment.sourceArea?.kind ?? 'discipline',
          provenance: node.provenance,
          sourceRefs: node.sourceRefs,
          metadata: node.metadata,
        };
      }

      return undefined;
    },
  };
}
