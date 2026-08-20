import { describe, expect, it } from 'vitest';
import type {
  CandidateContinuityFinding,
  CurriculumGapContinuityReport,
  GapFinding,
  StructuralFactFinding,
} from '../../domain/curriculum/curriculumGapContinuityReport';
import { serializeCurriculumGapContinuityReport } from '../../domain/curriculum/curriculumGapContinuityReportExport';

function reportWithFindings(findings: CurriculumGapContinuityReport['findings']): CurriculumGapContinuityReport {
  return {
    scope: {
      schoolOrder: 'primaria',
      disciplineCode: 'italiano',
      normativeCheckpoint: 'end-primary',
      leftSourceAreaCode: 'area-2012',
      rightSourceAreaCode: 'area-2025',
    },
    findings,
  };
}

const structuralFact: StructuralFactFinding = {
  type: 'structural-fact',
  category: 'checkpoint-difference',
  frameworks: ['IN2025'],
  references: { rightAreaRef: 'area-right', rightAreaCode: 'area-2025' },
  evidence: [{ kind: 'checkpoint-only-right', description: 'checkpoint 2025' }],
  provenance: { sources: ['R4A'], method: 'deterministic-structural-analysis' },
  scope: {},
};

const continuity: CandidateContinuityFinding = {
  type: 'candidate-continuity',
  frameworks: ['IN2012', 'IN2025'],
  references: {
    leftNodeId: 'left-1',
    rightNodeId: 'right-1',
    leftAreaCode: 'area-2012',
    rightAreaCode: 'area-2025',
  },
  relationKind: 'possible-continuity',
  evidence: [
    { kind: 'same-discipline', disciplineCode: 'italiano' },
    { kind: 'same-school-order', schoolOrder: 'primaria' },
  ],
  confidence: 'high',
  provenance: { sources: ['R4B'], method: 'deterministic-semantic-candidate-generation' },
  scope: {},
};

const rightGap: GapFinding = {
  type: 'gap-2025-without-candidate',
  frameworks: ['IN2025'],
  references: { rightNodeId: 'right-2', rightAreaCode: 'area-2025' },
  evidence: [{ kind: 'area-only-right', description: 'new 2025 element' }],
  provenance: { sources: ['R4A', 'R4B'], method: 'deterministic-structural-analysis' },
  scope: {},
};

describe('CURR-R4D-B report export adapter', () => {
  it('serializes the R4D-A report with stable schema and complete provenance', () => {
    const report = reportWithFindings([rightGap, continuity, structuralFact]);

    const artifact = JSON.parse(serializeCurriculumGapContinuityReport(report));

    expect(artifact).toEqual({
      schemaVersion: 1,
      report: {
        scope: report.scope,
        findings: [structuralFact, continuity, rightGap],
      },
    });
    expect(artifact.report.findings[1]).toMatchObject({
      frameworks: ['IN2012', 'IN2025'],
      references: continuity.references,
      evidence: continuity.evidence,
      confidence: 'high',
      provenance: continuity.provenance,
    });
  });

  it('is deterministic and canonically orders findings independently of input order', () => {
    const first = serializeCurriculumGapContinuityReport(reportWithFindings([rightGap, continuity, structuralFact]));
    const second = serializeCurriculumGapContinuityReport(reportWithFindings([structuralFact, rightGap, continuity]));

    expect(first).toBe(second);
  });

  it('serializes an empty report without inventing findings', () => {
    expect(JSON.parse(serializeCurriculumGapContinuityReport({ scope: {}, findings: [] }))).toEqual({
      schemaVersion: 1,
      report: { scope: {}, findings: [] },
    });
  });

  it('does not expose decision or persistence commands in the artifact', () => {
    const serialized = serializeCurriculumGapContinuityReport(reportWithFindings([continuity]));
    expect(serialized).not.toMatch(/onApprove|onSave|onCreateLink|CurriculumLink|persist|download|createLink|R5/i);
  });
});
