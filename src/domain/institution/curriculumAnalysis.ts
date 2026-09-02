import type { CurriculumMap } from '../../features/session/types/appViewContracts';
import {
  DM221_FIRST_CYCLE_DISCIPLINES,
  type FirstCycleDisciplineId,
  type FirstCycleSchoolOrder,
} from '../curriculum/national/canonicalStructure';
import type { QualifiedSource } from './sourceQualification';
import { isEligibleEvidence } from './sourceQualification';

export type CurriculumAnalysisFindingKind = 'COVERAGE' | 'GAP' | 'DISCONTINUITY' | 'OVERLAP';

export interface CurriculumBaselineRef {
  baselineRef: string;
  curriculumVersionRef: string;
  scopeRef: string;
}

export interface CurriculumAnalysisScope {
  disciplineId: FirstCycleDisciplineId;
  schoolOrder: FirstCycleSchoolOrder;
}

export interface CurriculumAnalysisInput {
  baseline: CurriculumBaselineRef;
  curriculum: CurriculumMap;
  evidence: readonly QualifiedSource[];
  scope: readonly CurriculumAnalysisScope[];
}

export interface CurriculumStructuralFinding {
  findingRef: string;
  kind: CurriculumAnalysisFindingKind;
  statement: string;
  targetRef: string;
  disciplineId: FirstCycleDisciplineId;
  disciplineLabel: string;
  schoolOrder: FirstCycleSchoolOrder;
}

export interface CurriculumObservation extends CurriculumStructuralFinding {
  observationRef: string;
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

export interface CurriculumAnalysisSummary {
  totalTargets: number;
  coverageTargets: number;
  gapTargets: number;
  discontinuityTargets: number;
  overlapTargets: number;
}

export interface CurriculumAnalysisResult {
  baselineRef: string;
  curriculumVersionRef: string;
  scopeRef: string;
  observations: readonly CurriculumObservation[];
  issues: readonly EvidenceLinkedIssue[];
  proposalCandidates: readonly CurriculumProposalCandidate[];
  summary: CurriculumAnalysisSummary;
}

const LEGACY_DISCIPLINE_ALIASES: Readonly<Record<FirstCycleDisciplineId, readonly string[]>> = {
  ITALIANO: ['italiano'],
  LINGUA_INGLESE: ['inglese', 'lingua_inglese'],
  SECONDA_LINGUA_COMUNITARIA: ['seconda_lingua', 'seconda_lingua_comunitaria'],
  STORIA: ['storia'],
  GEOGRAFIA: ['geografia'],
  MATEMATICA: ['matematica'],
  TECNOLOGIA: ['tecnologia'],
  SCIENZE: ['scienze'],
  MUSICA: ['musica'],
  ARTE_E_IMMAGINE: ['arte', 'arte_immagine'],
  EDUCAZIONE_MOTORIA: ['educazione_motoria', 'motoria'],
  EDUCAZIONE_FISICA: ['educazione_fisica', 'motoria'],
};

const normalized = (value: string): string => value.replace(/\s+/g, ' ').trim();

const requireText = (value: string, field: string): string => {
  const result = normalized(value);
  if (!result) throw new Error(`CURRICULUM_ANALYSIS_INVALID_${field}`);
  return result;
};

const hasText = (values: readonly string[] | undefined): boolean =>
  Boolean(values?.some((value) => normalized(value).length > 0));

const targetRefFor = (scope: CurriculumAnalysisScope): string =>
  `dm221:${scope.disciplineId}:${scope.schoolOrder}`;

const validateScope = (scope: readonly CurriculumAnalysisScope[]): readonly CurriculumAnalysisScope[] => {
  if (scope.length === 0) throw new Error('CURRICULUM_ANALYSIS_SCOPE_REQUIRED');

  const seen = new Set<string>();
  return scope.map((entry) => {
    const segment = DM221_FIRST_CYCLE_DISCIPLINES[entry.disciplineId];
    if (!segment || !segment.schoolOrders.includes(entry.schoolOrder)) {
      throw new Error(`CURRICULUM_ANALYSIS_SCOPE_NOT_CANONICAL:${entry.disciplineId}:${entry.schoolOrder}`);
    }

    const targetRef = targetRefFor(entry);
    if (seen.has(targetRef)) throw new Error(`CURRICULUM_ANALYSIS_DUPLICATE_SCOPE_TARGET:${targetRef}`);
    seen.add(targetRef);
    return entry;
  });
};

export const getWholeSchoolCurriculumScope = (): readonly CurriculumAnalysisScope[] => {
  const disciplineIds = Object.keys(DM221_FIRST_CYCLE_DISCIPLINES) as FirstCycleDisciplineId[];
  return disciplineIds
    .flatMap((disciplineId) => DM221_FIRST_CYCLE_DISCIPLINES[disciplineId].schoolOrders.map((schoolOrder) => ({
      disciplineId,
      schoolOrder,
    })))
    .sort((left, right) => targetRefFor(left).localeCompare(targetRefFor(right)));
};

export const computeCurriculumStructuralFindings = (
  curriculum: CurriculumMap,
  scope: readonly CurriculumAnalysisScope[],
): readonly CurriculumStructuralFinding[] => validateScope(scope).map((entry) => {
  const segment = DM221_FIRST_CYCLE_DISCIPLINES[entry.disciplineId];
  const aliases = LEGACY_DISCIPLINE_ALIASES[entry.disciplineId];
  const populatedAliases = aliases.filter((alias) => {
    const cell = curriculum[alias]?.[entry.schoolOrder];
    return hasText(cell?.traguardi) || hasText(cell?.obiettivi);
  });
  const targetRef = targetRefFor(entry);

  let kind: CurriculumAnalysisFindingKind;
  let statement: string;

  if (populatedAliases.length === 0) {
    kind = 'GAP';
    statement = `Manca contenuto strutturale per ${segment.label} — ${entry.schoolOrder}.`;
  } else if (populatedAliases.length > 1) {
    kind = 'OVERLAP';
    statement = `Più rappresentazioni legacy coprono ${segment.label} — ${entry.schoolOrder}: ${populatedAliases.join(', ')}.`;
  } else {
    const cell = curriculum[populatedAliases[0]]?.[entry.schoolOrder];
    const hasTraguardi = hasText(cell?.traguardi);
    const hasObiettivi = hasText(cell?.obiettivi);
    if (hasTraguardi && hasObiettivi) {
      kind = 'COVERAGE';
      statement = `Copertura strutturale presente per ${segment.label} — ${entry.schoolOrder}; la correttezza semantica resta soggetta a verifica della fonte.`;
    } else {
      kind = 'DISCONTINUITY';
      statement = `Copertura strutturale parziale per ${segment.label} — ${entry.schoolOrder}: ${hasTraguardi ? 'traguardi presenti' : 'traguardi mancanti'}, ${hasObiettivi ? 'obiettivi presenti' : 'obiettivi mancanti'}.`;
    }
  }

  return {
    findingRef: `finding:${entry.disciplineId.toLowerCase()}:${entry.schoolOrder}:${kind.toLowerCase()}`,
    kind,
    statement,
    targetRef,
    disciplineId: entry.disciplineId,
    disciplineLabel: segment.label,
    schoolOrder: entry.schoolOrder,
  };
});

export const summarizeCurriculumFindings = (
  findings: readonly Pick<CurriculumStructuralFinding, 'kind'>[],
): CurriculumAnalysisSummary => ({
  totalTargets: findings.length,
  coverageTargets: findings.filter((finding) => finding.kind === 'COVERAGE').length,
  gapTargets: findings.filter((finding) => finding.kind === 'GAP').length,
  discontinuityTargets: findings.filter((finding) => finding.kind === 'DISCONTINUITY').length,
  overlapTargets: findings.filter((finding) => finding.kind === 'OVERLAP').length,
});

export const analyzeCurriculum = (input: CurriculumAnalysisInput): CurriculumAnalysisResult => {
  const baselineRef = requireText(input.baseline.baselineRef, 'BASELINE_REF');
  const curriculumVersionRef = requireText(input.baseline.curriculumVersionRef, 'CURRICULUM_VERSION_REF');
  const scopeRef = requireText(input.baseline.scopeRef, 'SCOPE_REF');

  if (input.evidence.length === 0) throw new Error('CURRICULUM_ANALYSIS_EVIDENCE_REQUIRED');
  const evidenceSourceIds = [...new Set(input.evidence.map((source) => requireText(source.sourceId, 'EVIDENCE_SOURCE_ID')))].sort();
  const evidenceById = new Map(input.evidence.map((source) => [source.sourceId, source] as const));
  for (const sourceId of evidenceSourceIds) {
    const source = evidenceById.get(sourceId);
    if (!source || !isEligibleEvidence(source)) {
      throw new Error(`CURRICULUM_ANALYSIS_INELIGIBLE_EVIDENCE:${sourceId}`);
    }
  }

  const findings = computeCurriculumStructuralFindings(input.curriculum, input.scope);
  const observations = findings.map((finding) => ({
    ...finding,
    observationRef: `obs:${finding.findingRef}`,
    evidenceSourceIds,
    decisionStatus: 'OBSERVATION_ONLY' as const,
  }));

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

  return {
    baselineRef,
    curriculumVersionRef,
    scopeRef,
    observations,
    issues,
    proposalCandidates,
    summary: summarizeCurriculumFindings(observations),
  };
};