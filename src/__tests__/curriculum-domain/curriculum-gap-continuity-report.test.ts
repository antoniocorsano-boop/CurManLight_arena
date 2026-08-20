import { describe, expect, it } from 'vitest';
import type { ContentItem } from '../../domain/curriculum/nationalCurriculumConsultation';
import type { NationalCurriculumComparisonResult } from '../../domain/curriculum/nationalCurriculumComparison';
import type { SemanticMappingCandidate } from '../../domain/curriculum/nationalCurriculumSemanticCandidates';
import {
  createCurriculumGapContinuityReport,
  type CurriculumGapContinuityFinding,
} from '../../domain/curriculum/curriculumGapContinuityReport';
import type { ReviewScope } from '../../features/curriculum/components/curriculumComparisonReviewModel';

function item(id: string, nodeType: ContentItem['nodeType'], sourceAreaCode: string): ContentItem {
  return {
    id,
    text: id,
    nodeType,
    normativeCheckpoint: 'end-primary',
    normativeNodeKind: id.startsWith('r') ? 'osa-2025' : 'objective-2012',
    schoolOrder: 'primaria',
    disciplineCode: 'italiano',
    sourceAreaKind: 'discipline',
    sourceAreaCode,
  };
}

function candidate(
  id: string,
  leftNodeId: string,
  rightNodeId: string,
  relationKind: SemanticMappingCandidate['relationKind'] = 'possible-continuity',
): SemanticMappingCandidate {
  return {
    id,
    left: { frameworkId: 'IN2012', nodeId: leftNodeId, sourceAreaCode: 'area-2012', schoolOrder: 'primaria', disciplineCode: 'italiano', nodeType: 'traguardo', normativeCheckpoint: 'end-primary', normativeNodeKind: 'objective-2012' },
    right: { frameworkId: 'IN2025', nodeId: rightNodeId, sourceAreaCode: 'area-2025', schoolOrder: 'primaria', disciplineCode: 'italiano', nodeType: 'competenza', normativeCheckpoint: 'end-primary', normativeNodeKind: 'osa-2025' },
    relationKind,
    evidence: [
      { kind: 'same-discipline', disciplineCode: 'italiano' },
      { kind: 'same-school-order', schoolOrder: 'primaria' },
    ],
    confidence: 'medium',
    status: 'candidate',
    generatedBy: 'deterministic-structural-analysis',
  };
}

function comparison(leftItems: ContentItem[], rightItems: ContentItem[]): NationalCurriculumComparisonResult {
  return {
    left: {
      frameworkId: 'IN2012',
      areas: [{ id: 'area-left', title: 'Area 2012', kind: 'discipline', code: 'area-2012', disciplineCode: 'italiano', schoolOrder: 'primaria' }],
      items: leftItems,
      itemSourceAreaCodes: Object.fromEntries(leftItems.map(value => [value.id, value.sourceAreaCode])),
    },
    right: {
      frameworkId: 'IN2025',
      areas: [{ id: 'area-right', title: 'Area 2025', kind: 'discipline', code: 'area-2025', disciplineCode: 'italiano', schoolOrder: 'primaria' }],
      items: rightItems,
      itemSourceAreaCodes: Object.fromEntries(rightItems.map(value => [value.id, value.sourceAreaCode])),
    },
    structuralDifferences: [
      { kind: 'checkpoint-only-right', description: 'checkpoint 2025' },
      { kind: 'node-type-only-left', description: 'traguardo only 2012' },
      { kind: 'area-only-left', description: 'area only 2012', leftRef: 'area-left' },
      { kind: 'area-only-right', description: 'area only 2025', rightRef: 'area-right' },
      { kind: 'applicability-difference', description: 'conditional area', leftRef: 'area-left', rightRef: 'area-right' },
    ],
  };
}

describe('CURR-R4D-A gap / continuity report domain', () => {
  it('emits typed structural facts, candidate continuity, and side-specific gaps with provenance', () => {
    const scope: ReviewScope = { schoolOrder: 'primaria', disciplineCode: 'italiano', normativeCheckpoint: 'end-primary', leftSourceAreaCode: 'area-2012', rightSourceAreaCode: 'area-2025' };
    const result = createCurriculumGapContinuityReport(
      comparison([item('left-matched', 'traguardo', 'area-2012'), item('left-unmatched', 'traguardo', 'area-2012')], [item('right-matched', 'competenza', 'area-2025'), item('right-unmatched', 'competenza', 'area-2025')]),
      [candidate('candidate-1', 'left-matched', 'right-matched')],
      scope,
    );

    expect(result.scope).toEqual(scope);
    expect(result.findings.map(finding => finding.type)).toEqual([
      'structural-fact',
      'structural-fact',
      'structural-fact',
      'structural-fact',
      'structural-fact',
      'candidate-continuity',
      'gap-2025-without-candidate',
      'gap-2012-without-candidate',
    ]);

    const continuity = result.findings.find(finding => finding.type === 'candidate-continuity')!;
    expect(continuity.provenance).toEqual({ sources: ['R4B'], method: 'deterministic-structural-analysis' });
    expect(continuity.frameworks).toEqual(['IN2012', 'IN2025']);
    expect(continuity.references).toEqual({ leftNodeId: 'left-matched', rightNodeId: 'right-matched', leftAreaCode: 'area-2012', rightAreaCode: 'area-2025' });
    expect(continuity.evidence).toHaveLength(2);
    expect(continuity.confidence).toBe('medium');

    const rightGap = result.findings.find(finding => finding.type === 'gap-2025-without-candidate')!;
    expect(rightGap.frameworks).toEqual(['IN2025']);
    expect(rightGap.references).toEqual({ rightNodeId: 'right-unmatched', rightAreaCode: 'area-2025' });
    expect(rightGap.provenance.sources).toEqual(['R4A', 'R4B']);
  });

  it('classifies checkpoint, node type, and conditional applicability differences as structural facts', () => {
    const result = createCurriculumGapContinuityReport(comparison([], []), [], {});
    const facts = result.findings.filter((finding): finding is Extract<CurriculumGapContinuityFinding, { type: 'structural-fact' }> => finding.type === 'structural-fact');

    expect(facts.map(fact => fact.category)).toEqual([
      'checkpoint-difference',
      'nodeType-difference',
      'area-difference',
      'area-difference',
      'conditional-applicability',
    ]);
    expect(facts.every(fact => fact.provenance.sources.includes('R4A'))).toBe(true);

    expect(facts[0]).toMatchObject({
      frameworks: ['IN2025'],
      references: { rightAreaRef: 'area-right', rightAreaCode: 'area-2025' },
    });
    expect(facts[1]).toMatchObject({
      frameworks: ['IN2012'],
      references: { leftAreaRef: 'area-left', leftAreaCode: 'area-2012' },
    });
  });

  it('keeps valid area-only structural differences as sourced findings', () => {
    const result = createCurriculumGapContinuityReport(comparison([], []), [], {});
    const areaFacts = result.findings.filter(
      (finding): finding is Extract<CurriculumGapContinuityFinding, { type: 'structural-fact' }> =>
        finding.type === 'structural-fact' && finding.category === 'area-difference',
    );

    expect(areaFacts).toHaveLength(2);
    expect(areaFacts.map(fact => [fact.frameworks, fact.references])).toEqual([
      [['IN2012'], { leftAreaRef: 'area-left', leftAreaCode: 'area-2012', rightAreaCode: undefined, rightAreaRef: undefined }],
      [['IN2025'], { leftAreaCode: undefined, leftAreaRef: undefined, rightAreaRef: 'area-right', rightAreaCode: 'area-2025' }],
    ]);
    expect(areaFacts.every(fact => fact.provenance.sources.includes('R4A'))).toBe(true);
  });

  it('reports one-to-many and many-to-one candidate shapes as unresolved gaps, never as resolved mappings', () => {
    const result = createCurriculumGapContinuityReport(
      comparison([item('left-split', 'traguardo', 'area-2012'), item('left-merge-a', 'traguardo', 'area-2012'), item('left-merge-b', 'traguardo', 'area-2012')], [item('right-split-a', 'competenza', 'area-2025'), item('right-split-b', 'competenza', 'area-2025'), item('right-merge', 'competenza', 'area-2025')]),
      [candidate('split-a', 'left-split', 'right-split-a'), candidate('split-b', 'left-split', 'right-split-b'), candidate('merge-a', 'left-merge-a', 'right-merge'), candidate('merge-b', 'left-merge-b', 'right-merge')],
      {},
    );

    expect(result.findings.filter(finding => finding.type === 'unresolved-structural-case').map(finding => finding.category)).toEqual(['split', 'merge']);
    expect(result.findings.some(finding => finding.type === 'candidate-continuity' && finding.references.leftNodeId === 'left-split')).toBe(false);
    expect(result.findings.some(finding => finding.type === 'candidate-continuity' && finding.references.rightNodeId === 'right-merge')).toBe(false);
  });

  it('is deterministic and does not expose decision or persistence operations', () => {
    const input = comparison([item('left', 'traguardo', 'area-2012')], [item('right', 'competenza', 'area-2025')]);
    const candidates = [candidate('candidate', 'left', 'right')];
    const first = createCurriculumGapContinuityReport(input, candidates, {});
    const second = createCurriculumGapContinuityReport(input, candidates, {});

    expect(first).toEqual(second);
    expect(JSON.stringify(first)).not.toMatch(/approve|equivalence|CurriculumLink|persist|recommend/i);
  });
});
