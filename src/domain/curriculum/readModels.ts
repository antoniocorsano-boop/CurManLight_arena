/** Read-only contracts consumed by A11 and A02 during the legacy transition. */

import type { AdaptedCurriculumKB } from './adapters';
import type { EntityReference } from './identity/types';
import type { CurriculumLink, CurriculumNode, CurriculumSegment, CurriculumVersion } from './model/types';
import type { DisciplineCode, CurriculumNodeType } from './model/vocabularies';
import type { SchoolOrder } from '../../types/curriculum';

export interface A11SourceSummary {
  id: string;
  title: string;
  status: string;
  completeness: 'complete' | 'partial';
  linkedNodes: number;
  nodesWithoutSource: number;
  missingMetadata: string[];
}

export function createA11SourceReadModel(domain: AdaptedCurriculumKB) {
  return {
    list(): A11SourceSummary[] {
      return domain.sources.map(source => ({
        id: source.id,
        title: source.title,
        status: source.status,
        completeness: source.authority && source.issuedAt && source.versionLabel ? 'complete' : 'partial',
        linkedNodes: source.usedByNodeRefs.length,
        nodesWithoutSource: domain.stats.nodesWithoutSource,
        missingMetadata: ['authority', 'issuedAt', 'versionLabel'].filter(field => !source[field as keyof typeof source]),
      }));
    },
  };
}

export interface A02CurriculumQuery {
  order?: SchoolOrder;
  discipline?: DisciplineCode;
  nodeType?: CurriculumNodeType;
  text?: string;
}

export interface CurriculumConsultationQuery extends A02CurriculumQuery {
  nodeId?: string;
}

export interface CurriculumConsultationItem {
  nodeId: string;
  curriculumVersionRef: EntityReference;
  schoolOrder: SchoolOrder;
  disciplineCode: DisciplineCode;
  version: CurriculumVersion;
  segment: CurriculumSegment;
  node: CurriculumNode;
  sourceRefs: EntityReference[];
  provenance: CurriculumNode['provenance'];
  relations: CurriculumLink[];
}

export interface CurriculumConsultationReadModel {
  query(query?: CurriculumConsultationQuery): CurriculumConsultationItem[];
  getNode(nodeId: string): CurriculumConsultationItem | undefined;
}

export function createA02CurriculumReadModel(domain: AdaptedCurriculumKB) {
  return {
    search(query: A02CurriculumQuery = {}): CurriculumNode[] {
      const segmentById = new Map(domain.segments.map(segment => [segment.id, segment]));
      const text = query.text?.trim().toLocaleLowerCase();
      return domain.nodes.filter(node => {
        const segment = segmentById.get(node.segmentRef.id);
        return (!query.order || segment?.schoolOrder === query.order)
          && (!query.discipline || segment?.disciplineCode === query.discipline)
          && (!query.nodeType || node.nodeType === query.nodeType)
          && (!text || node.text.toLocaleLowerCase().includes(text));
      });
    },
  };
}

/**
 * Canonical, read-only projection shared by curriculum consultation views.
 * It deliberately exposes only links already present in the adapted domain.
 */
export function createCurriculumConsultationReadModel(
  domain: AdaptedCurriculumKB,
): CurriculumConsultationReadModel {
  const versionsById = new Map(domain.versions.map(version => [version.id, version]));
  const segmentsById = new Map(domain.segments.map(segment => [segment.id, segment]));

  const sourceRefsFor = (
    version: CurriculumVersion,
    segment: CurriculumSegment,
    node: CurriculumNode,
  ): EntityReference[] => {
    const refs = [...version.mainSourceRefs, ...segment.sourceRefs, ...node.sourceRefs];
    return refs.filter((ref, index) => refs.findIndex(candidate => candidate.id === ref.id) === index);
  };

  const project = (node: CurriculumNode): CurriculumConsultationItem | undefined => {
    const segment = segmentsById.get(node.segmentRef.id);
    const version = segment ? versionsById.get(segment.curriculumVersionRef.id) : undefined;
    if (!segment || !version) return undefined;

    const relations = domain.links
      .filter(link => link.fromNodeRef.id === node.id || link.toNodeRef.id === node.id)
      .slice()
      .sort((left, right) => String(left.id).localeCompare(String(right.id)));

    return {
      nodeId: String(node.id),
      curriculumVersionRef: { ...node.curriculumVersionRef },
      schoolOrder: segment.schoolOrder,
      disciplineCode: segment.disciplineCode,
      version,
      segment,
      node,
      sourceRefs: sourceRefsFor(version, segment, node),
      provenance: node.provenance,
      relations,
    };
  };

  return {
    query(query: CurriculumConsultationQuery = {}): CurriculumConsultationItem[] {
      const text = query.text?.trim().toLocaleLowerCase();
      return domain.nodes
        .filter(node => !query.nodeId || String(node.id) === query.nodeId)
        .map(project)
        .filter((item): item is CurriculumConsultationItem => Boolean(item))
        .filter(item => (!query.order || item.schoolOrder === query.order)
          && (!query.discipline || item.disciplineCode === query.discipline)
          && (!query.nodeType || item.node.nodeType === query.nodeType)
          && (!text || item.node.text.toLocaleLowerCase().includes(text)))
        .sort((left, right) => left.nodeId.localeCompare(right.nodeId));
    },
    getNode(nodeId: string): CurriculumConsultationItem | undefined {
      return this.query({ nodeId })[0];
    },
  };
}
