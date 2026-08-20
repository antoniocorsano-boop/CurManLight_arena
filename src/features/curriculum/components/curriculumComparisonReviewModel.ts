import type { DisciplineCode } from '../../../domain/curriculum/model/vocabularies';
import type { ContentItem } from '../../../domain/curriculum/nationalCurriculumConsultation';
import type {
  NationalCurriculumComparisonResult,
} from '../../../domain/curriculum/nationalCurriculumComparison';
import type { SemanticMappingCandidate } from '../../../domain/curriculum/nationalCurriculumSemanticCandidates';
import type { NormativeCheckpoint } from '../../../domain/curriculum/model/types';
import type { SchoolOrder } from '../../../types/curriculum';

export interface ReviewScope {
  schoolOrder?: SchoolOrder;
  disciplineCode?: DisciplineCode | null;
  normativeCheckpoint?: NormativeCheckpoint;
  leftSourceAreaCode?: string;
  rightSourceAreaCode?: string;
}

export interface ReviewCandidate {
  candidate: SemanticMappingCandidate;
  left: ContentItem | null;
  right: ContentItem | null;
}

export interface ReviewSelectionState {
  selectedCandidateId: string | null;
}

export interface CurriculumComparisonReviewModel extends ReviewSelectionState {
  comparison: NationalCurriculumComparisonResult;
  candidates: ReviewCandidate[];
}

export function createReviewScope(input: ReviewScope = {}): ReviewScope {
  return { ...input };
}

export function buildComparisonReviewModel(
  comparison: NationalCurriculumComparisonResult,
  candidates: SemanticMappingCandidate[],
  selectedCandidateId: string | null = null,
): CurriculumComparisonReviewModel {
  const leftByNodeId = new Map(comparison.left.items.map(item => [item.id, item]));
  const rightByNodeId = new Map(comparison.right.items.map(item => [item.id, item]));

  return {
    comparison,
    candidates: candidates.map(candidate => ({
      candidate,
      left: candidate.left.nodeId === undefined ? null : leftByNodeId.get(candidate.left.nodeId) ?? null,
      right: candidate.right.nodeId === undefined ? null : rightByNodeId.get(candidate.right.nodeId) ?? null,
    })),
    selectedCandidateId,
  };
}

export function createReviewSelectionState(): ReviewSelectionState {
  return { selectedCandidateId: null };
}

export function resetSelectionOnScopeChange(
  selection: ReviewSelectionState,
  previousScope: ReviewScope,
  currentScope: ReviewScope,
): ReviewSelectionState {
  const scopeIsEqual =
    previousScope.schoolOrder === currentScope.schoolOrder &&
    previousScope.disciplineCode === currentScope.disciplineCode &&
    previousScope.normativeCheckpoint === currentScope.normativeCheckpoint &&
    previousScope.leftSourceAreaCode === currentScope.leftSourceAreaCode &&
    previousScope.rightSourceAreaCode === currentScope.rightSourceAreaCode;

  return scopeIsEqual ? { selectedCandidateId: selection.selectedCandidateId ?? null } : createReviewSelectionState();
}
