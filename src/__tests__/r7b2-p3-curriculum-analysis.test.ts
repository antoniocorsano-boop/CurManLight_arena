import { describe, expect, it } from 'vitest';
import type { CurriculumMap } from '../features/session/types/appViewContracts';
import {
  CURRICULUM_ANALYSIS_CANONICAL_SCOPE,
  analyzeCurriculum,
  computeCurriculumStructuralFindings,
  getFirstCycleCurriculumScope,
  type CurriculumAnalysisInput,
} from '../domain/institution/curriculumAnalysis';
import { qualifySource } from '../domain/institution/sourceQualification';
import { assessEndToEndAdoptionFlow } from '../domain/institution/endToEndAdoptionValidation';
import { getArenaProcessContract } from '../domain/institution/processRoleModel';

const eligibleEvidence = (sourceId = 'source-1') => qualifySource({
  candidate: { sourceId, origin: 'AUTHORITY_CANDIDATE', title: 'Fonte', locator: 'page:1', contentAvailable: true },
  decision: 'ELIGIBLE_EVIDENCE',
  qualifiedByHuman: true,
  authorityBasis: 'Fonte normativa verificata',
  qualifiedAt: '2026-09-02T10:00:00+02:00',
});

const asCurriculum = (value: Record<string, unknown>): CurriculumMap => value as unknown as CurriculumMap;

const input = (): CurriculumAnalysisInput => ({
  baseline: { baselineRef: 'baseline-1', curriculumVersionRef: 'curriculum-v1', scopeRef: 'technology-lower-secondary' },
  curriculum: asCurriculum({
    tecnologia: {
      secondaria: { traguardi: ['Traguardo verificabile'], obiettivi: ['Obiettivo verificabile'], evidenze: [] },
    },
  }),
  evidenceBindings: [{ targetRef: 'dm221:TECNOLOGIA:secondaria', evidence: [eligibleEvidence()] }],
  scope: [{ disciplineId: 'TECNOLOGIA', schoolOrder: 'secondaria' }],
});

describe('R7B2 P3 curriculum analysis', () => {
  it('computes coverage from curriculum data instead of accepting pre-classified findings', () => {
    const result = analyzeCurriculum(input());
    expect(result.canonicalScope).toBe(CURRICULUM_ANALYSIS_CANONICAL_SCOPE);
    expect(result.excludedSchoolOrders).toEqual(['infanzia']);
    expect(result.observations).toHaveLength(1);
    expect(result.observations[0]).toMatchObject({
      kind: 'COVERAGE',
      disciplineId: 'TECNOLOGIA',
      schoolOrder: 'secondaria',
      targetRef: 'dm221:TECNOLOGIA:secondaria',
      evidenceSourceIds: ['source-1'],
      decisionStatus: 'OBSERVATION_ONLY',
    });
    expect(result.issues).toEqual([]);
    expect(result.proposalCandidates).toEqual([]);
    expect(result.summary).toMatchObject({ totalTargets: 1, coverageTargets: 1, gapTargets: 0 });
  });

  it('allows structural analysis with no evidence bindings and keeps findings observation-only', () => {
    const request = input();
    request.curriculum = asCurriculum({});
    request.evidenceBindings = [];
    const result = analyzeCurriculum(request);

    expect(result.observations).toHaveLength(1);
    expect(result.observations[0]).toMatchObject({ kind: 'GAP', evidenceSourceIds: [], decisionStatus: 'OBSERVATION_ONLY' });
    expect(result.issues).toEqual([]);
    expect(result.proposalCandidates).toEqual([]);
  });

  it('computes a gap and creates only non-authoritative review artifacts when target-relevant evidence is explicit', () => {
    const request = input();
    request.curriculum = asCurriculum({});
    const result = analyzeCurriculum(request);

    expect(result.observations[0].kind).toBe('GAP');
    expect(result.issues).toHaveLength(1);
    expect(result.proposalCandidates).toHaveLength(1);
    expect(result.proposalCandidates[0]).toMatchObject({
      targetRef: 'dm221:TECNOLOGIA:secondaria',
      evidenceSourceIds: ['source-1'],
      status: 'CANDIDATE_ONLY',
      authorityEffect: 'NONE',
    });
  });

  it('does not propagate one target evidence source to unrelated findings', () => {
    const request = input();
    request.curriculum = asCurriculum({});
    request.scope = [
      { disciplineId: 'TECNOLOGIA', schoolOrder: 'secondaria' },
      { disciplineId: 'STORIA', schoolOrder: 'secondaria' },
    ];

    const result = analyzeCurriculum(request);
    const technology = result.observations.find((observation) => observation.targetRef === 'dm221:TECNOLOGIA:secondaria');
    const history = result.observations.find((observation) => observation.targetRef === 'dm221:STORIA:secondaria');

    expect(technology?.evidenceSourceIds).toEqual(['source-1']);
    expect(history?.evidenceSourceIds).toEqual([]);
    expect(result.issues.map((issue) => issue.targetRef)).toEqual(['dm221:TECNOLOGIA:secondaria']);
    expect(result.proposalCandidates.map((candidate) => candidate.targetRef)).toEqual(['dm221:TECNOLOGIA:secondaria']);
  });

  it('computes discontinuity when a discipline/order has only part of the structural baseline', () => {
    const request = input();
    request.curriculum = asCurriculum({
      tecnologia: { secondaria: { traguardi: ['Presente'], obiettivi: [], evidenze: [] } },
    });

    const result = analyzeCurriculum(request);
    expect(result.observations[0].kind).toBe('DISCONTINUITY');
  });

  it('recognizes the concrete camelCase curriculum keys used by the current repository baseline', () => {
    const findings = computeCurriculumStructuralFindings(
      asCurriculum({
        secondaLingua: { secondaria: { traguardi: ['T'], obiettivi: ['O'], evidenze: [] } },
        arteImmagine: {
          primaria: { traguardi: ['T'], obiettivi: ['O'], evidenze: [] },
          secondaria: { traguardi: ['T'], obiettivi: ['O'], evidenze: [] },
        },
        educazioneFisica: {
          primaria: { traguardi: ['T'], obiettivi: ['O'], evidenze: [] },
          secondaria: { traguardi: ['T'], obiettivi: ['O'], evidenze: [] },
        },
      }),
      [
        { disciplineId: 'SECONDA_LINGUA_COMUNITARIA', schoolOrder: 'secondaria' },
        { disciplineId: 'ARTE_E_IMMAGINE', schoolOrder: 'primaria' },
        { disciplineId: 'ARTE_E_IMMAGINE', schoolOrder: 'secondaria' },
        { disciplineId: 'EDUCAZIONE_MOTORIA', schoolOrder: 'primaria' },
        { disciplineId: 'EDUCAZIONE_FISICA', schoolOrder: 'secondaria' },
      ],
    );

    expect(findings).toHaveLength(5);
    expect(findings.every((finding) => finding.kind === 'COVERAGE')).toBe(true);
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
    request.evidenceBindings = [{
      targetRef: 'dm221:TECNOLOGIA:secondaria',
      evidence: [qualifySource({
        candidate: { sourceId: 'source-1', origin: 'USER_UPLOAD', title: 'Upload', locator: 'file:1', contentAvailable: true },
        decision: 'CONSULT_ONLY',
        qualifiedByHuman: false,
        qualifiedAt: '2026-09-02T10:00:00+02:00',
      })],
    }];
    expect(() => analyzeCurriculum(request)).toThrow(/INELIGIBLE_EVIDENCE/);
  });

  it('fails closed when evidence is bound to a target outside the explicit scope', () => {
    const request = input();
    request.evidenceBindings = [{ targetRef: 'dm221:STORIA:secondaria', evidence: [eligibleEvidence()] }];
    expect(() => analyzeCurriculum(request)).toThrow(/EVIDENCE_TARGET_OUT_OF_SCOPE/);
  });

  it('fails closed on duplicate canonical scope targets', () => {
    const request = input();
    request.scope = [request.scope[0], request.scope[0]];
    expect(() => analyzeCurriculum(request)).toThrow(/DUPLICATE_SCOPE_TARGET/);
  });

  it('defines a deterministic first-cycle discipline/order scope and does not claim infanzia coverage', () => {
    const scope = getFirstCycleCurriculumScope();
    const identities = scope.map((entry) => `${entry.disciplineId}:${entry.schoolOrder}`);
    expect(scope.length).toBeGreaterThan(0);
    expect(new Set(identities).size).toBe(scope.length);
    expect(identities).toContain('TECNOLOGIA:primaria');
    expect(identities).toContain('TECNOLOGIA:secondaria');
    expect(CURRICULUM_ANALYSIS_CANONICAL_SCOPE).toBe('DM221_FIRST_CYCLE_ONLY');
  });

  it('classifies P3 as executable only inside the explicit first-cycle R7 scope', () => {
    expect(getArenaProcessContract('P3_CURRICULUM_ANALYSIS').implementationStatus).toBe('IMPLEMENTED');
    expect(getArenaProcessContract('P3_CURRICULUM_ANALYSIS').label).toMatch(/primo ciclo/i);
    const assessment = assessEndToEndAdoptionFlow();
    expect(assessment.blockingProcessIds).toEqual([]);
    expect(assessment.verdict).toBe('ADOPTION_FLOW_VALIDATED');
    expect(assessment.curriculumScope).toBe('DM221_FIRST_CYCLE_ONLY');
    expect(assessment.excludedSchoolOrders).toEqual(['infanzia']);
    expect(assessment.requiresRuntimeRemediation).toBe(false);
    expect(assessment.requiresSameShaReleaseValidation).toBe(true);
    expect(assessment.requiresRepresentativeHumanAcceptance).toBe(true);
  });
});