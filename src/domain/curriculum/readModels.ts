/** Read-only contracts consumed by A11 and A02 during the legacy transition. */

import type { AdaptedCurriculumKB } from './adapters';
import type { CurriculumNode } from './model/types';
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
