import type { CurriculumGapContinuityFinding, CurriculumGapContinuityReport } from './curriculumGapContinuityReport';

export interface CurriculumGapContinuityReportExport {
  schemaVersion: 1;
  report: CurriculumGapContinuityReport;
}

const FINDING_TYPE_ORDER: Record<CurriculumGapContinuityFinding['type'], number> = {
  'structural-fact': 0,
  'candidate-continuity': 1,
  'gap-2025-without-candidate': 2,
  'gap-2012-without-candidate': 3,
  'unresolved-structural-case': 4,
};

function findingKey(finding: CurriculumGapContinuityFinding): string {
  return [
    finding.type,
    'category' in finding ? finding.category : '',
    finding.references.leftNodeId ?? '',
    finding.references.rightNodeId ?? '',
    finding.references.leftAreaCode ?? '',
    finding.references.rightAreaCode ?? '',
    JSON.stringify(finding.references),
  ].join('|');
}

function canonicalFindings(report: CurriculumGapContinuityReport): CurriculumGapContinuityFinding[] {
  return [...report.findings].sort((left, right) => {
    const typeDifference = FINDING_TYPE_ORDER[left.type] - FINDING_TYPE_ORDER[right.type];
    return typeDifference !== 0 ? typeDifference : findingKey(left).localeCompare(findingKey(right));
  });
}

export function serializeCurriculumGapContinuityReport(report: CurriculumGapContinuityReport): string {
  const artifact: CurriculumGapContinuityReportExport = {
    schemaVersion: 1,
    report: {
      scope: { ...report.scope },
      findings: canonicalFindings(report),
    },
  };

  return JSON.stringify(artifact);
}
