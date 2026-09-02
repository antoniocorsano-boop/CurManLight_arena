import { describe, expect, it } from 'vitest';
import { analyzeCurriculum } from '../domain/institution/curriculumAnalysis';
import { qualifySource } from '../domain/institution/sourceQualification';
import { assessEndToEndAdoptionFlow } from '../domain/institution/endToEndAdoptionValidation';
import { getArenaProcessContract } from '../domain/institution/processRoleModel';

const eligibleEvidence = () => qualifySource({
  candidate: { sourceId: 'source-1', origin: 'AUTHORITY_CANDIDATE', title: 'Fonte', locator: 'page:1', contentAvailable: true },
  decision: 'ELIGIBLE_EVIDENCE',
  qualifiedByHuman: true,
  authorityBasis: 'Fonte normativa verificata',
  qualifiedAt: '2026-09-02T10:00:00+02:00',
});

const input = () => ({
  baseline: { baselineRef: 'baseline-1', curriculumVersionRef: 'curriculum-v1', scopeRef: 'technology-lower-secondary' },
  evidence: [eligibleEvidence()],
  findings: [
    { findingRef: 'gap-1', kind: 'GAP' as const, statement: 'Manca una copertura esplicita.', evidenceSourceIds: ['source-1'], targetRef: 'objective-1' },
    { findingRef: 'coverage-1', kind: 'COVERAGE' as const, statement: 'Copertura presente.', evidenceSourceIds: ['source-1'], targetRef: 'objective-2' },
  ],
});

describe('R7B2 P3 curriculum analysis', () => {
  it('produces observations, evidence-linked issues and proposal candidates without authority effect', () => {
    const result = analyzeCurriculum(input());
    expect(result.observations).toHaveLength(2);
    expect(result.issues).toHaveLength(1);
    expect(result.proposalCandidates).toHaveLength(1);
    expect(result.proposalCandidates[0]).toMatchObject({ status: 'CANDIDATE_ONLY', authorityEffect: 'NONE' });
  });

  it('does not turn pure coverage observations into proposal candidates', () => {
    const request = input();
    request.findings = [request.findings[1]];
    const result = analyzeCurriculum(request);
    expect(result.observations).toHaveLength(1);
    expect(result.issues).toEqual([]);
    expect(result.proposalCandidates).toEqual([]);
  });

  it('fails closed on evidence that is not P1 eligible evidence', () => {
    const request = input();
    request.evidence = [qualifySource({ candidate: { sourceId: 'source-1', origin: 'USER_UPLOAD', title: 'Upload', locator: 'file:1', contentAvailable: true }, decision: 'CONSULT_ONLY', qualifiedByHuman: false, qualifiedAt: '2026-09-02T10:00:00+02:00' })];
    expect(() => analyzeCurriculum(request)).toThrow(/INELIGIBLE_EVIDENCE/);
  });

  it('keeps findings deterministic and rejects duplicate finding identities', () => {
    const request = input();
    request.findings = [request.findings[0], { ...request.findings[0] }];
    expect(() => analyzeCurriculum(request)).toThrow(/DUPLICATE_FINDING_REF/);
  });

  it('classifies P3 as executable and removes all runtime blockers without claiming release/human acceptance', () => {
    expect(getArenaProcessContract('P3_CURRICULUM_ANALYSIS').implementationStatus).toBe('IMPLEMENTED');
    const assessment = assessEndToEndAdoptionFlow();
    expect(assessment.blockingProcessIds).toEqual([]);
    expect(assessment.verdict).toBe('ADOPTION_FLOW_VALIDATED');
    expect(assessment.requiresRuntimeRemediation).toBe(false);
    expect(assessment.requiresSameShaReleaseValidation).toBe(true);
    expect(assessment.requiresRepresentativeHumanAcceptance).toBe(true);
  });
});
