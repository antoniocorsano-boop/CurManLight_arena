import type {
  CurriculumVersion,
  CurriculumSegment,
  CurriculumNode,
  SourceAreaKind,
  NormativeCheckpoint,
} from './model/types';
import type { DisciplineCode, CurriculumNodeType } from './model/vocabularies';
import type { SchoolOrder } from '../../types/curriculum';
import type { Fixture2012 } from './fixture2012';

export interface R1BQuery {
  schoolOrder?: SchoolOrder;
  disciplineCode?: DisciplineCode | null;
  sourceAreaKind?: SourceAreaKind;
  sourceAreaCode?: string;
  nodeType?: CurriculumNodeType;
  normativeCheckpoint?: NormativeCheckpoint;
  text?: string;
}

export interface R1BVersionResult {
  version: CurriculumVersion;
  segments: CurriculumSegment[];
  nodes: CurriculumNode[];
}

export interface R1BReadModel {
  listVersions(): CurriculumVersion[];
  listSegments(query?: R1BQuery): CurriculumSegment[];
  listNodes(query?: R1BQuery): CurriculumNode[];
  getVersion(versionId: string): R1BVersionResult | undefined;
}

const CHECKPOINT_RANK: Record<NormativeCheckpoint, number> = {
  'end-infanzia': 0,
  'end-primary-grade-3': 1,
  'end-primary': 2,
  'end-lower-secondary': 3,
};

export function createR1BNationalCurriculumReadModel(fixture: Fixture2012): R1BReadModel {
  const allVersions = [
    fixture.VERSION_2012_INFANZIA,
    fixture.VERSION_2012_PRIMARIA,
    fixture.VERSION_2012_SECONDARIA,
  ];

  const allSegments = [
    ...fixture.SEGMENTS_2012_INFANZIA,
    ...fixture.SEGMENTS_2012_PRIMARIA,
    ...fixture.SEGMENTS_2012_SECONDARIA,
  ];

  const allNodes = [
    ...fixture.NODES_2012_INFANZIA,
    ...fixture.NODES_2012_PRIMARIA,
    ...fixture.NODES_2012_SECONDARIA,
  ];

  const segmentById = new Map(allSegments.map(segment => [segment.id, segment]));

  return {
    listVersions(): CurriculumVersion[] {
      return allVersions;
    },

    listSegments(query: R1BQuery = {}): CurriculumSegment[] {
      let segments = allSegments;

      if (query.schoolOrder !== undefined) {
        segments = segments.filter(segment => segment.schoolOrder === query.schoolOrder);
      }

      if (query.disciplineCode !== undefined) {
        segments = segments.filter(segment => segment.disciplineCode === query.disciplineCode);
      }

      if (query.sourceAreaKind !== undefined) {
        segments = segments.filter(segment => segment.sourceArea?.kind === query.sourceAreaKind);
      }

      if (query.sourceAreaCode !== undefined) {
        segments = segments.filter(segment => segment.sourceArea?.code === query.sourceAreaCode);
      }

      return segments.sort((a, b) => a.title.localeCompare(b.title));
    },

    listNodes(query: R1BQuery = {}): CurriculumNode[] {
      let nodes = allNodes;

      if (query.schoolOrder !== undefined || query.disciplineCode !== undefined || query.sourceAreaKind !== undefined || query.sourceAreaCode !== undefined) {
        nodes = nodes.filter(node => {
          const segment = segmentById.get(node.segmentRef.id);
          if (!segment) {
            return false;
          }
          if (query.schoolOrder !== undefined && segment.schoolOrder !== query.schoolOrder) {
            return false;
          }
          if (query.disciplineCode !== undefined && segment.disciplineCode !== query.disciplineCode) {
            return false;
          }
          if (query.sourceAreaKind !== undefined && segment.sourceArea?.kind !== query.sourceAreaKind) {
            return false;
          }
          if (query.sourceAreaCode !== undefined && segment.sourceArea?.code !== query.sourceAreaCode) {
            return false;
          }
          return true;
        });
      }

      if (query.nodeType !== undefined) {
        nodes = nodes.filter(node => node.nodeType === query.nodeType);
      }

      if (query.normativeCheckpoint !== undefined) {
        nodes = nodes.filter(node => node.normativeCheckpoint === query.normativeCheckpoint);
      }

      if (query.text !== undefined) {
        const lowerText = query.text.toLocaleLowerCase();
        nodes = nodes.filter(node => node.text.toLocaleLowerCase().includes(lowerText));
      }

      return nodes.sort((a, b) => {
        const rankA = a.normativeCheckpoint ? CHECKPOINT_RANK[a.normativeCheckpoint] : 99;
        const rankB = b.normativeCheckpoint ? CHECKPOINT_RANK[b.normativeCheckpoint] : 99;
        if (rankA !== rankB) {
          return rankA - rankB;
        }
        return a.text.localeCompare(b.text);
      });
    },

    getVersion(versionId: string): R1BVersionResult | undefined {
      const version = allVersions.find(v => v.id === versionId);
      if (!version) {
        return undefined;
      }

      const segments = allSegments
        .filter(segment => segment.curriculumVersionRef.id === versionId)
        .sort((a, b) => a.title.localeCompare(b.title));

      const nodes = allNodes
        .filter(node => node.curriculumVersionRef.id === versionId)
        .sort((a, b) => {
          const rankA = a.normativeCheckpoint ? CHECKPOINT_RANK[a.normativeCheckpoint] : 99;
          const rankB = b.normativeCheckpoint ? CHECKPOINT_RANK[b.normativeCheckpoint] : 99;
          if (rankA !== rankB) {
            return rankA - rankB;
          }
          return a.text.localeCompare(b.text);
        });

      return { version, segments, nodes };
    },
  };
}
