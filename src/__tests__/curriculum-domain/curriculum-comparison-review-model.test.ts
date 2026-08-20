import { describe, expect, it } from 'vitest';
import type { ContentItem } from '../../domain/curriculum/nationalCurriculumConsultation';
import type { NationalCurriculumComparisonResult } from '../../domain/curriculum/nationalCurriculumComparison';
import type { SemanticMappingCandidate } from '../../domain/curriculum/nationalCurriculumSemanticCandidates';
import {
  buildComparisonReviewModel,
  createReviewScope,
  createReviewSelectionState,
  resetSelectionOnScopeChange,
} from '../../features/curriculum/components/curriculumComparisonReviewModel';

function contentItem(id: string, text: string): ContentItem {
  return {
    id,
    text,
    nodeType: 'traguardo',
    schoolOrder: 'primaria',
    disciplineCode: 'italiano',
    sourceAreaKind: 'discipline',
  };
}

function candidate(id: string, leftNodeId: string, rightNodeId: string): SemanticMappingCandidate {
  return {
    id,
    left: {
      frameworkId: 'IN2012',
      nodeId: leftNodeId,
      schoolOrder: 'primaria',
      disciplineCode: 'italiano',
    },
    right: {
      frameworkId: 'IN2025',
      nodeId: rightNodeId,
      schoolOrder: 'primaria',
      disciplineCode: 'italiano',
    },
    relationKind: 'unclassified-correspondence',
    evidence: [],
    confidence: 'high',
    status: 'candidate',
    generatedBy: 'deterministic-structural-analysis',
  };
}

function comparison(leftItems: ContentItem[], rightItems: ContentItem[]): NationalCurriculumComparisonResult {
  return {
    left: { frameworkId: 'IN2012', areas: [], items: leftItems },
    right: { frameworkId: 'IN2025', areas: [], items: rightItems },
    structuralDifferences: [],
  };
}

describe('curriculum comparison review model (CURR-R4C Task 1)', () => {
  it('joins candidate endpoints to content by nodeId and leaves missing sides null', () => {
    const matched = candidate('candidate-1', 'left-1', 'right-1');
    const missingLeft = candidate('candidate-2', 'missing-left', 'right-1');
    const model = buildComparisonReviewModel(
      comparison([contentItem('left-1', 'same text')], [contentItem('right-1', 'same text')]),
      [matched, missingLeft],
      null,
    );

    expect(model.candidates).toEqual([
      { candidate: matched, left: contentItem('left-1', 'same text'), right: contentItem('right-1', 'same text') },
      { candidate: missingLeft, left: null, right: contentItem('right-1', 'same text') },
    ]);
  });

  it('does not rank candidates or auto-select one', () => {
    const first = candidate('candidate-1', 'left-1', 'right-1');
    const second = candidate('candidate-2', 'left-2', 'right-2');
    const model = buildComparisonReviewModel(
      comparison([contentItem('left-1', 'a'), contentItem('left-2', 'b')], [contentItem('right-1', 'a'), contentItem('right-2', 'b')]),
      [second, first],
      null,
    );

    expect(model.candidates.map(item => item.candidate.id)).toEqual(['candidate-2', 'candidate-1']);
    expect(model.selectedCandidateId).toBeNull();
  });

  it('fails closed to no selection when selectedCandidateId is omitted or null', () => {
    const items = comparison([contentItem('left-1', 'a')], [contentItem('right-1', 'a')]);
    const mapped = [candidate('candidate-1', 'left-1', 'right-1')];

    expect(buildComparisonReviewModel(items, mapped).selectedCandidateId).toBeNull();
    expect(buildComparisonReviewModel(items, mapped, null).selectedCandidateId).toBeNull();
  });

  it('preserves distinct source-native area codes in review scope', () => {
    expect(createReviewScope({
      schoolOrder: 'primaria',
      disciplineCode: 'italiano',
      normativeCheckpoint: 'end-primary',
      leftSourceAreaCode: 'area-left',
      rightSourceAreaCode: 'area-right',
    })).toEqual({
      schoolOrder: 'primaria',
      disciplineCode: 'italiano',
      normativeCheckpoint: 'end-primary',
      leftSourceAreaCode: 'area-left',
      rightSourceAreaCode: 'area-right',
    });
  });

  it('starts with no selection', () => {
    expect(createReviewSelectionState()).toEqual({ selectedCandidateId: null });
  });

  it('preserves selection when the previous and current scopes are equal', () => {
    const scope = createReviewScope({ schoolOrder: 'primaria', leftSourceAreaCode: 'area-left' });

    expect(resetSelectionOnScopeChange(
      { selectedCandidateId: 'candidate-1' },
      scope,
      createReviewScope({ schoolOrder: 'primaria', leftSourceAreaCode: 'area-left' }),
    )).toEqual({ selectedCandidateId: 'candidate-1' });
  });

  it('resets selection when the previous and current scopes differ', () => {
    expect(resetSelectionOnScopeChange(
      { selectedCandidateId: 'candidate-1' },
      createReviewScope({ leftSourceAreaCode: 'area-left', rightSourceAreaCode: 'area-right' }),
      createReviewScope({ leftSourceAreaCode: 'area-left', rightSourceAreaCode: 'area-other' }),
    ))
      .toEqual({ selectedCandidateId: null });
  });
});
