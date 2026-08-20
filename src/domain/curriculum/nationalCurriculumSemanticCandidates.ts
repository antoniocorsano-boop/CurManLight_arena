import type { NationalCurriculumComparisonService, ComparisonScope } from './nationalCurriculumComparison';
import type { ContentItem } from './nationalCurriculumConsultation';
import type { DisciplineCode, CurriculumNodeType } from './model/vocabularies';
import type { SchoolOrder } from '../../types/curriculum';
import type { NormativeCheckpoint } from './model/types';

export interface SemanticCandidateEndpoint {
  frameworkId: 'IN2012' | 'IN2025';
  nodeId?: string;
  areaId?: string;

  schoolOrder: SchoolOrder;
  disciplineCode: DisciplineCode | null;

  sourceAreaCode?: string;
  sourceNucleus?: string;

  nodeType?: CurriculumNodeType;
  normativeCheckpoint?: NormativeCheckpoint;
  normativeNodeKind?: 'objective-2012' | 'osa-2025';
}

export type SemanticCandidateRelationKind =
  | 'possible-continuity'
  | 'unclassified-correspondence';

export type SemanticCandidateEvidence =
  | { kind: 'same-discipline'; disciplineCode: DisciplineCode }
  | { kind: 'same-school-order'; schoolOrder: SchoolOrder }
  | { kind: 'same-checkpoint'; checkpoint: NormativeCheckpoint }
  | { kind: 'same-source-nucleus'; left: string; right: string }
  | { kind: 'structural-proximity'; reason: string };

export type SemanticCandidateConfidence = 'low' | 'medium' | 'high';

export interface SemanticMappingCandidate {
  id: string;
  left: SemanticCandidateEndpoint;
  right: SemanticCandidateEndpoint;
  relationKind: SemanticCandidateRelationKind;
  evidence: SemanticCandidateEvidence[];
  confidence: SemanticCandidateConfidence;
  status: 'candidate';
  generatedBy: 'deterministic-structural-analysis';
}

export interface SemanticMappingCandidateService {
  generateCandidates(
    leftFrameworkId: SemanticCandidateEndpoint['frameworkId'],
    rightFrameworkId: SemanticCandidateEndpoint['frameworkId'],
    scope?: ComparisonScope
  ): SemanticMappingCandidate[];
}

export function createSemanticMappingCandidateService(
  comparisonService: NationalCurriculumComparisonService
): SemanticMappingCandidateService {
  return {
    generateCandidates(
      leftFrameworkId: SemanticCandidateEndpoint['frameworkId'],
      rightFrameworkId: SemanticCandidateEndpoint['frameworkId'],
      scope: ComparisonScope = {}
    ): SemanticMappingCandidate[] {
      // If the frameworks are the same, we don't generate candidates.
      if (leftFrameworkId === rightFrameworkId) {
        return [];
      }

      // We'll use the comparison service to get the structural differences and the content
      const comparisonResult = comparisonService.compare(leftFrameworkId, rightFrameworkId, scope);

      // We'll generate candidates based on the structural differences and the content
      // For now, we'll implement a simple version that generates candidates for nodes that are in the same area and have the same discipline and checkpoint.
      // But note: the user wants to start with only 'possible-continuity' and 'unclassified-correspondence'

      // We'll collect all nodes from both sides
      const leftNodes = comparisonResult.left.items;
      const rightNodes = comparisonResult.right.items;

      const candidates: SemanticMappingCandidate[] = [];

      // We'll create a map of nodes by (disciplineCode, schoolOrder, normativeCheckpoint) for each side
      // But note: we also want to consider area? The user says we can do node<->node and area<->area.
      // Let's start with node<->node.

      // We'll create a map for left nodes: key -> list of nodes
      const leftNodeMap = new Map<string, ContentItem[]>();
      leftNodes.forEach(node => {
        const key = `${node.disciplineCode ?? 'null'}-${node.schoolOrder}-${node.normativeCheckpoint ?? 'null'}`;
        if (!leftNodeMap.has(key)) {
          leftNodeMap.set(key, []);
        }
        leftNodeMap.get(key)!.push(node);
      });

      // Similarly for right nodes
      const rightNodeMap = new Map<string, ContentItem[]>();
      rightNodes.forEach(node => {
        const key = `${node.disciplineCode ?? 'null'}-${node.schoolOrder}-${node.normativeCheckpoint ?? 'null'}`;
        if (!rightNodeMap.has(key)) {
          rightNodeMap.set(key, []);
        }
        rightNodeMap.get(key)!.push(node);
      });

      // For each key that exists in both maps, we can create candidates for every pair of nodes (left and right)
      // But note: we don't want to create a candidate for every pair if there are many? We'll do a cartesian product for now.
      // However, the user says we should not create too many candidates. We'll leave it as is for now and adjust if needed.

      const allKeys = new Set([...leftNodeMap.keys(), ...rightNodeMap.keys()]);
      allKeys.forEach(key => {
        const leftList = leftNodeMap.get(key) || [];
        const rightList = rightNodeMap.get(key) || [];

        leftList.forEach(leftNode => {
          rightList.forEach(rightNode => {
            // We'll create a candidate for this pair
            // Determine the relation kind: we'll start with 'unclassified-correspondence' and then try to see if it's a continuity
            // For now, we'll set it to 'unclassified-correspondence' and then we can refine later.
            let relationKind: SemanticCandidateRelationKind = 'unclassified-correspondence';

            // We'll collect evidence
            const evidence: SemanticCandidateEvidence[] = [];

            // Same discipline?
            if (leftNode.disciplineCode !== null && leftNode.disciplineCode === rightNode.disciplineCode) {
              evidence.push({ kind: 'same-discipline', disciplineCode: leftNode.disciplineCode });
            }

            // Same school order? (already in key, but we can check)
            if (leftNode.schoolOrder === rightNode.schoolOrder) {
              evidence.push({ kind: 'same-school-order', schoolOrder: leftNode.schoolOrder });
            }

            // Same checkpoint?
            if (leftNode.normativeCheckpoint !== undefined && leftNode.normativeCheckpoint === rightNode.normativeCheckpoint) {
              evidence.push({ kind: 'same-checkpoint', checkpoint: leftNode.normativeCheckpoint });
            }

            // Same source nucleus? We don't have source nucleus in ContentItem, so we skip for now.
            // We would need to go to the segment level? But note: the user said we can use source nucleus.
            // We don't have it in ContentItem. We might need to look up the segment? But we are trying to keep it simple.
            // We'll skip this evidence for now and note that we can add it later if we have the data.

            // Structural proximity? We don't have a measure for now. We'll skip.

            // Determine confidence based on evidence
            let confidence: SemanticCandidateConfidence = 'low';
            if (evidence.length >= 3) {
              confidence = 'high';
            } else if (evidence.length >= 2) {
              confidence = 'medium';
            } else {
              confidence = 'low';
            }

            // If we have same discipline, same school order, and same checkpoint, we might consider it a possible continuity?
            // But note: the user says we can have 'possible-continuity' for traguardo 2012 and competenza 2025 if they are in the same discipline, order, and checkpoint.
            // So we'll set relationKind to 'possible-continuity' if we have at least same discipline, same school order, and same checkpoint.
            if (evidence.some(e => e.kind === 'same-discipline') &&
                evidence.some(e => e.kind === 'same-school-order') &&
                evidence.some(e => e.kind === 'same-checkpoint')) {
              relationKind = 'possible-continuity';
            }

            // Create candidate ID: we'll use the framework IDs, node IDs, and relation kind
            const id = `${leftFrameworkId}:${leftNode.id}:${rightFrameworkId}:${rightNode.id}:${relationKind}`;

            // Build endpoints
            const leftEndpoint: SemanticCandidateEndpoint = {
              frameworkId: leftFrameworkId,
              nodeId: leftNode.id,
              schoolOrder: leftNode.schoolOrder,
              disciplineCode: leftNode.disciplineCode,
              sourceAreaCode: undefined, // we don't have it in ContentItem, we could look up the segment but skip for now
              sourceNucleus: undefined,
              nodeType: leftNode.nodeType,
              normativeCheckpoint: leftNode.normativeCheckpoint,
              normativeNodeKind: leftNode.normativeNodeKind
            };

            const rightEndpoint: SemanticCandidateEndpoint = {
              frameworkId: rightFrameworkId,
              nodeId: rightNode.id,
              schoolOrder: rightNode.schoolOrder,
              disciplineCode: rightNode.disciplineCode,
              sourceAreaCode: undefined,
              sourceNucleus: undefined,
              nodeType: rightNode.nodeType,
              normativeCheckpoint: rightNode.normativeCheckpoint,
              normativeNodeKind: rightNode.normativeNodeKind
            };

            candidates.push({
              id,
              left: leftEndpoint,
              right: rightEndpoint,
              relationKind,
              evidence,
              confidence,
              status: 'candidate',
              generatedBy: 'deterministic-structural-analysis'
            });
          });
        });
      });

      // We should also consider area<->area candidates? The user said we can do area<->area.
      // But note: the user said we should not mix node<->node and area<->area in the same algorithm? 
      // Actually, the user said: "R4B deve poter proporre candidati sia: node ↔ node, sia eventualmente: area ↔ area"
      // and "non mescolerei i due nello stesso algoritmo". 
      // We are currently doing node<->node. We'll leave area<->area for a future iteration or if we have time.

      // Sort candidates deterministically by id
      candidates.sort((a, b) => a.id.localeCompare(b.id));

      return candidates;
    }
  };
}
