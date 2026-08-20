import type { ContentItem } from './nationalCurriculumConsultation';
import type {
  ComparisonScope,
  NationalCurriculumComparisonResult,
  StructuralDifference,
} from './nationalCurriculumComparison';
import type {
  SemanticCandidateEvidence,
  SemanticMappingCandidate,
} from './nationalCurriculumSemanticCandidates';

export type GapContinuityFindingType =
  | 'structural-fact'
  | 'candidate-continuity'
  | 'gap-2025-without-candidate'
  | 'gap-2012-without-candidate'
  | 'unresolved-structural-case';

export type StructuralFactCategory =
  | 'checkpoint-difference'
  | 'nodeType-difference'
  | 'area-difference'
  | 'conditional-applicability';

export type UnresolvedStructuralCaseCategory = 'split' | 'merge';

export interface ReportProvenance {
  sources: Array<'R4A' | 'R4B'>;
  method: string;
}

export interface ReportReferences {
  leftNodeId?: string;
  rightNodeId?: string;
  leftAreaCode?: string;
  rightAreaCode?: string;
  leftAreaRef?: string;
  rightAreaRef?: string;
  leftNodeIds?: string[];
  rightNodeIds?: string[];
}

export interface StructuralFactFinding {
  type: 'structural-fact';
  category: StructuralFactCategory;
  frameworks: string[];
  references: ReportReferences;
  evidence: [StructuralDifference];
  confidence?: never;
  provenance: ReportProvenance;
  scope: ComparisonScope;
}

export interface CandidateContinuityFinding {
  type: 'candidate-continuity';
  frameworks: ['IN2012', 'IN2025'];
  references: ReportReferences & { leftNodeId: string; rightNodeId: string };
  relationKind: SemanticMappingCandidate['relationKind'];
  evidence: SemanticCandidateEvidence[];
  confidence: SemanticMappingCandidate['confidence'];
  provenance: ReportProvenance;
  scope: ComparisonScope;
}

export interface GapFinding {
  type: 'gap-2025-without-candidate' | 'gap-2012-without-candidate';
  frameworks: ['IN2025'] | ['IN2012'];
  references: ReportReferences;
  evidence: StructuralDifference[];
  confidence?: never;
  provenance: ReportProvenance;
  scope: ComparisonScope;
}

export interface UnresolvedStructuralCaseFinding {
  type: 'unresolved-structural-case';
  category: UnresolvedStructuralCaseCategory;
  frameworks: ['IN2012', 'IN2025'];
  references: ReportReferences;
  evidence: SemanticMappingCandidate[];
  confidence?: never;
  provenance: ReportProvenance;
  scope: ComparisonScope;
}

export type CurriculumGapContinuityFinding =
  | StructuralFactFinding
  | CandidateContinuityFinding
  | GapFinding
  | UnresolvedStructuralCaseFinding;

export interface CurriculumGapContinuityReport {
  scope: ComparisonScope;
  findings: CurriculumGapContinuityFinding[];
}

const STRUCTURAL_CATEGORY_ORDER: Record<StructuralFactCategory, number> = {
  'checkpoint-difference': 0,
  'nodeType-difference': 1,
  'area-difference': 2,
  'conditional-applicability': 3,
};

function structuralCategory(difference: StructuralDifference): StructuralFactCategory | undefined {
  if (difference.kind.startsWith('checkpoint-')) return 'checkpoint-difference';
  if (difference.kind.startsWith('node-type-')) return 'nodeType-difference';
  if (difference.kind.startsWith('area-only-')) return 'area-difference';
  if (difference.kind === 'applicability-difference') return 'conditional-applicability';
  return undefined;
}

function areaCodeFor(
  comparison: NationalCurriculumComparisonResult,
  frameworkId: string,
  areaRef: string | undefined,
): string | undefined {
  if (areaRef === undefined) return undefined;
  const side = frameworkId === comparison.left.frameworkId ? comparison.left : comparison.right;
  return side.areas.find(area => area.id === areaRef)?.code ?? areaRef;
}

function firstArea(comparison: NationalCurriculumComparisonResult, frameworkId: string) {
  const side = frameworkId === comparison.left.frameworkId ? comparison.left : comparison.right;
  return [...side.areas].sort((a, b) => a.id.localeCompare(b.id))[0];
}

function firstItemAreaCode(comparison: NationalCurriculumComparisonResult, frameworkId: string): string | undefined {
  const side = frameworkId === comparison.left.frameworkId ? comparison.left : comparison.right;
  const codes = [
    ...side.items.map(item => item.sourceAreaCode),
    ...Object.values(side.itemSourceAreaCodes ?? {}),
  ].filter((value): value is string => value !== undefined);
  return [...new Set(codes)].sort((a, b) => a.localeCompare(b))[0];
}

function derivedAreaReference(
  comparison: NationalCurriculumComparisonResult,
  frameworkId: string,
  areaRef: string | undefined,
): { ref: string | undefined; code: string | undefined } {
  if (areaRef !== undefined) {
    return { ref: areaRef, code: areaCodeFor(comparison, frameworkId, areaRef) };
  }
  const area = firstArea(comparison, frameworkId);
  return {
    ref: area?.id,
    code: area?.code ?? firstItemAreaCode(comparison, frameworkId),
  };
}

function differenceSides(difference: StructuralDifference): { left: boolean; right: boolean } {
  if (difference.kind.endsWith('-left')) return { left: true, right: false };
  if (difference.kind.endsWith('-right')) return { left: false, right: true };
  return { left: difference.leftRef !== undefined, right: difference.rightRef !== undefined };
}

function sideNodeMap(items: ContentItem[]): Map<string, ContentItem> {
  return new Map(items.map(item => [item.id, item]));
}

function candidateEndpoints(candidates: SemanticMappingCandidate[]): {
  left: Set<string>;
  right: Set<string>;
} {
  const left = new Set<string>();
  const right = new Set<string>();
  for (const candidate of candidates) {
    if (candidate.left.nodeId !== undefined) left.add(candidate.left.nodeId);
    if (candidate.right.nodeId !== undefined) right.add(candidate.right.nodeId);
  }
  return { left, right };
}

function unresolvedCases(candidates: SemanticMappingCandidate[], scope: ComparisonScope): UnresolvedStructuralCaseFinding[] {
  const rightsByLeft = new Map<string, Set<string>>();
  const leftsByRight = new Map<string, Set<string>>();
  for (const candidate of candidates) {
    const leftId = candidate.left.nodeId;
    const rightId = candidate.right.nodeId;
    if (leftId === undefined || rightId === undefined) continue;
    if (!rightsByLeft.has(leftId)) rightsByLeft.set(leftId, new Set());
    if (!leftsByRight.has(rightId)) leftsByRight.set(rightId, new Set());
    rightsByLeft.get(leftId)!.add(rightId);
    leftsByRight.get(rightId)!.add(leftId);
  }

  const findings: UnresolvedStructuralCaseFinding[] = [];
  for (const [leftNodeId, rightNodeIds] of rightsByLeft) {
    if (rightNodeIds.size > 1) {
      findings.push({
        type: 'unresolved-structural-case',
        category: 'split',
        frameworks: ['IN2012', 'IN2025'],
        references: { leftNodeId, rightNodeIds: [...rightNodeIds].sort() },
        evidence: candidates.filter(candidate => candidate.left.nodeId === leftNodeId),
        provenance: { sources: ['R4B'], method: 'deterministic-structural-analysis' },
        scope,
      });
    }
  }
  for (const [rightNodeId, leftNodeIds] of leftsByRight) {
    if (leftNodeIds.size > 1) {
      findings.push({
        type: 'unresolved-structural-case',
        category: 'merge',
        frameworks: ['IN2012', 'IN2025'],
        references: { rightNodeId, leftNodeIds: [...leftNodeIds].sort() },
        evidence: candidates.filter(candidate => candidate.right.nodeId === rightNodeId),
        provenance: { sources: ['R4B'], method: 'deterministic-structural-analysis' },
        scope,
      });
    }
  }
  const categoryOrder: Record<UnresolvedStructuralCaseCategory, number> = { split: 0, merge: 1 };
  return findings.sort((a, b) => {
    const categoryDifference = categoryOrder[a.category] - categoryOrder[b.category];
    if (categoryDifference !== 0) return categoryDifference;
    return `${a.references.leftNodeId ?? a.references.rightNodeId}`.localeCompare(`${b.references.leftNodeId ?? b.references.rightNodeId}`);
  });
}

export function createCurriculumGapContinuityReport(
  comparison: NationalCurriculumComparisonResult,
  candidates: SemanticMappingCandidate[],
  scope: ComparisonScope = {},
): CurriculumGapContinuityReport {
  const findings: CurriculumGapContinuityFinding[] = [];
  const candidateEndpointIds = candidateEndpoints(candidates);
  const leftItems = sideNodeMap(comparison.left.items);
  const rightItems = sideNodeMap(comparison.right.items);
  const unresolved = unresolvedCases(candidates, scope);
  const unresolvedCandidateIds = new Set(unresolved.flatMap(finding => finding.evidence.map(candidate => candidate.id)));

  const structuralFacts = comparison.structuralDifferences
    .map(difference => ({ difference, category: structuralCategory(difference) }))
    .filter((value): value is { difference: StructuralDifference; category: StructuralFactCategory } => value.category !== undefined)
    .sort((a, b) => STRUCTURAL_CATEGORY_ORDER[a.category] - STRUCTURAL_CATEGORY_ORDER[b.category]);

  for (const { difference, category } of structuralFacts) {
    const sides = differenceSides(difference);
    const leftArea = sides.left ? derivedAreaReference(comparison, comparison.left.frameworkId, difference.leftRef) : { ref: undefined, code: undefined };
    const rightArea = sides.right ? derivedAreaReference(comparison, comparison.right.frameworkId, difference.rightRef) : { ref: undefined, code: undefined };
    const frameworks = [
      sides.left ? comparison.left.frameworkId : undefined,
      sides.right ? comparison.right.frameworkId : undefined,
    ].filter((value): value is string => value !== undefined);
    findings.push({
      type: 'structural-fact',
      category,
      frameworks,
      references: {
        leftAreaRef: leftArea.ref,
        rightAreaRef: rightArea.ref,
        leftAreaCode: leftArea.code,
        rightAreaCode: rightArea.code,
      },
      evidence: [difference],
      provenance: { sources: ['R4A'], method: 'deterministic-structural-analysis' },
      scope,
    });
  }

  for (const candidate of candidates) {
    if (candidate.left.nodeId === undefined || candidate.right.nodeId === undefined || unresolvedCandidateIds.has(candidate.id)) continue;
    findings.push({
      type: 'candidate-continuity',
      frameworks: ['IN2012', 'IN2025'],
      references: {
        leftNodeId: candidate.left.nodeId,
        rightNodeId: candidate.right.nodeId,
        leftAreaCode: candidate.left.sourceAreaCode,
        rightAreaCode: candidate.right.sourceAreaCode,
      },
      relationKind: candidate.relationKind,
      evidence: candidate.evidence,
      confidence: candidate.confidence,
      provenance: { sources: ['R4B'], method: candidate.generatedBy },
      scope,
    });
  }

  const unmatchedRight = [...rightItems.values()].filter(item => !candidateEndpointIds.right.has(item.id));
  const unmatchedLeft = [...leftItems.values()].filter(item => !candidateEndpointIds.left.has(item.id));
  for (const item of unmatchedRight.sort((a, b) => a.id.localeCompare(b.id))) {
    findings.push({
      type: 'gap-2025-without-candidate',
      frameworks: ['IN2025'],
      references: { rightNodeId: item.id, rightAreaCode: item.sourceAreaCode },
      evidence: comparison.structuralDifferences,
      provenance: { sources: ['R4A', 'R4B'], method: 'deterministic-structural-analysis' },
      scope,
    });
  }
  for (const item of unmatchedLeft.sort((a, b) => a.id.localeCompare(b.id))) {
    findings.push({
      type: 'gap-2012-without-candidate',
      frameworks: ['IN2012'],
      references: { leftNodeId: item.id, leftAreaCode: item.sourceAreaCode },
      evidence: comparison.structuralDifferences,
      provenance: { sources: ['R4A', 'R4B'], method: 'deterministic-structural-analysis' },
      scope,
    });
  }

  findings.push(...unresolved);
  return { scope: { ...scope }, findings };
}
