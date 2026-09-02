import { describe, expect, it } from 'vitest';
import type { CurriculumMap } from '../features/session/types/appViewContracts';
import {
  analyzeCurriculum,
  computeCurriculumStructuralFindings,
  getWholeSchoolCurriculumScope,
} from '../domain/institution/curriculumAnalysis';
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

const asCurriculum = (value: Record<string, unknown>): CurriculumMap => value as unknown as CurriculumMap;

const input = () => ({
  baseline: { baselineRef: 'baseline-1', curriculumVersionRef: 'curriculum-v1', scopeRef: 'technology-lower-secondary' },
  curriculum: asCurriculum({
    tecnologia: {
      secondaria: { traguardi: ['Traguardo verificabile'], obiettivi: ['Obiettivo verificabile'], evidenze: [] },
    },
  }),
  evidence: [eligibleEvidence()],
  scope: [{ disciplineId: 'TECNOLOGIA' as const, schoolOrder: 'secondaria' as const }],
});

describe('R7B2 P3 curriculum analysis', () => {
  it('computes coverage from curriculum data instead of accepting pre-classified findings', () => {
    const result = analyzeCurriculum(input());
    expect(result.observations).toHaveLength(1);
    expect(result.observations[0]).toMatchObject({
      kind: 'COVERAGE',
      disciplineId: 'TECNOLOGIA',
      schoolOrder: 'secondaria',
      targetRef: 'dm221:TECNOLOGIA:secondaria',
      decisionStatus: 'OBSERVATION_ONLY',
    });
    expect(result.issues).toEqual([]);
    expect(result.proposalCandidates).toEqual([]);
    expect(result.summary).toMatchObject({ totalTargets: 1, coverageTargets: 1, gapTargets: 0 });
  });

  it('computes a gap and creates only non-authoritative review artifacts when canonical scope is missing', () => {
    const request = input();
    request.curriculum = asCurriculum({});
    const result = analyzeCurriculum(request);

    expect(result.observations[0].kind).toBe('GAP');
    expect(result.issues).toHaveLength(1);
    expect(result.proposalCandidates).toHaveLength(1);
    expect(result.proposalCandidates[0]).toMatchObject({ status: 'CANDIDATE_ONLY', authorityEffect: 'NONE' });
  });

  it('computes discontinuity when a discipline/order has only part of the structural baseline', () => {
    const request = input();
    request.curriculum = asCurriculum({
      tecnologia: { secondaria: { traguardi: ['Presente'], obiettivi: [], evidenze: [] } },
    });

    const result = analyzeCurriculum(request);
    expect(result.observations[0].kind).toBe('DISCONTINUITY');
  });

  it('computes overlap when multiple legacy representations populate the same canonical target', () => {
    const findings = computeCurriculumStructuralFindings(
      asCurriculum({
        arte: { secondaria: { traguardi: ['A'], obiettivi: ['A'], evidenze: [] } },
        arte_immagine: { secondaria: { traguardi: ['B'], obiettivi: ['B'], evidenze: [] } },
      }),
      [{ disciplineId: 'ARTE_E_IMMAGINE', schoolOrder: 'secondaria' }],
    );

    expect(findings).toHaveLength(1);
    expect(findings[0].kind).toBe('OVERLAP');
  });

  it('fails closed on evidence that is not P1 eligible evidence', () => {
    const request = input();
    request.evidence = [qualifySource({
      candidate: { sourceId: 'source-1', origin: 'USER_UPLOAD', title: 'Upload', locator: 'file:1', contentAvailable: true },
      decision: 'CONSULT_ONLY',
      qualifiedByHuman: false,
      qualifiedAt: '2026-09-02T10:00:00+02:00',
    })];
    expect(() => analyzeCurriculum(request)).toThrow(/INELIGIBLE_EVIDENCE/);
  });

  it('fails closed on duplicate canonical scope targets', () => {
    const request = input();
    request.scope = [request.scope[0], request.scope[0]];
    expect(() => analyzeCurriculum(request)).toThrow(/DUPLICATE_SCOPE_TARGET/);
  });

  it('defines a deterministic whole-school discipline/order scope from the canonical structure', () => {
    const scope = getWholeSchoolCurriculumScope();
    const identities = scope.map((entry) => `${entry.disciplineId}:${entry.schoolOrder}`);
    expect(scope.length).toBeGreaterThan(0);
    expect(new Set(identities).size).toBe(scope.length);
    expect(identities).toContain('TECNOLOGIA:primaria');
    expect(identities).toContain('TECNOLOGIA:secondaria');
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