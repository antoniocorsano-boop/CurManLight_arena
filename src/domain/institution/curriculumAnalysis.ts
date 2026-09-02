import type { QualifiedSource } from './sourceQualification';
import { isEligibleEvidence } from './sourceQualification';

export type CurriculumAnalysisFindingKind = 'COVERAGE' | 'GAP' | 'DISCONTINUITY' | 'OVERLAP';

export interface CurriculumBaselineRef {
  baselineRef: string;
  curriculumVersionRef: string;
  scopeRef: string;
}

export interface CurriculumAnalysisInput {
  baseline: CurriculumBaselineRef;
  evidence: readonly QualifiedSource[];
  findings: readonly {
    findingRef: string;
    kind: CurriculumAnalysisFindingKind;
    statement: string;
    evidenceSourceIds: readonly string[];
    targetRef: string;
  }[];
}

export interface CurriculumObservation {
  observationRef: string;
  kind: CurriculumAnalysisFindingKind;
  statement: string;
  targetRef: string;
  evidenceSourceIds: readonly string[];
  decisionStatus: 'OBSERVATION_ONLY';
}

export interface EvidenceLinkedIssue {
  issueRef: string;
  observationRef: string;
  targetRef: string;
  evidenceSourceIds: readonly string[];
  reviewRequired: true;
}

export interface CurriculumProposalCandidate {
  candidateRef: string;
  issueRef: string;
  targetRef: string;
  evidenceSourceIds: readonly string[];
  status: 'CANDIDATE_ONLY';
  authorityEffect: 'NONE';
}

export interface CurriculumAnalysisResult {
  baselineRef: string;
  curriculumVersionRef: string;
  scopeRef: string;
  observations: readonly CurriculumObservation[];
  issues: readonly EvidenceLinkedIssue[];
  proposalCandidates: readonly CurriculumProposalCandidate[];
}

const normalized = (value: string): string => value.replace(/\s+/g, ' ').trim();

const requireText = (value: string, field: string): string => {
  const result = normalized(value);
  if (!result) throw new Error(`CURRICULUM_ANALYSIS_INVALID_${field}`);
  return result;
};

export const analyzeCurriculum = (input: CurriculumAnalysisInput): CurriculumAnalysisResult => {
  const baselineRef = requireText(input.baseline.baselineRef, 'BASELINE_REF');
  const curriculumVersionRef = requireText(input.baseline.curriculumVersionRef, 'CURRICULUM_VERSION_REF');
  const scopeRef = requireText(input.baseline.scopeRef, 'SCOPE_REF');

  const evidenceById = new Map(input.evidence.map((source) => [source.sourceId, source] as const));
  const seenFindingRefs = new Set<string>();

  const observations = input.findings.map((finding) => {
    const findingRef = requireText(finding.findingRef, 'FINDING_REF');
    if (seenFindingRefs.has(findingRef)) throw new Error('CURRICULUM_ANALYSIS_DUPLICATE_FINDING_REF');
    seenFindingRefs.add(findingRef);

    const statement = requireText(finding.statement, 'STATEMENT');
    const targetRef = requireText(finding.targetRef, 'TARGET_REF');
    const evidenceSourceIds = [...new Set(finding.evidenceSourceIds.map((id) => requireText(id, 'EVIDENCE_SOURCE_ID')))];
    if (evidenceSourceIds.length === 0) throw new Error('CURRICULUM_ANALYSIS_EVIDENCE_REQUIRED');

    for (const sourceId of evidenceSourceIds) {
      const source = evidenceById.get(sourceId);
      if (!source || !isEligibleEvidence(source)) {
        throw new Error(`CURRICULUM_ANALYSIS_INELIGIBLE_EVIDENCE:${sourceId}`);
      }
    }

    return {
      observationRef: `obs:${findingRef}`,
      kind: finding.kind,
      statement,
      targetRef,
      evidenceSourceIds,
      decisionStatus: 'OBSERVATION_ONLY' as const,
    };
  });

  const actionable = observations.filter((observation) => observation.kind !== 'COVERAGE');
  const issues = actionable.map((observation) => ({
    issueRef: `issue:${observation.observationRef}`,
    observationRef: observation.observationRef,
    targetRef: observation.targetRef,
    evidenceSourceIds: observation.evidenceSourceIds,
    reviewRequired: true as const,
  }));
  const proposalCandidates = issues.map((issue) => ({
    candidateRef: `candidate:${issue.issueRef}`,
    issueRef: issue.issueRef,
    targetRef: issue.targetRef,
    evidenceSourceIds: issue.evidenceSourceIds,
    status: 'CANDIDATE_ONLY' as const,
    authorityEffect: 'NONE' as const,
  }));

  return { baselineRef, curriculumVersionRef, scopeRef, observations, issues, proposalCandidates };
};
