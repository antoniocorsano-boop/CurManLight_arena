import { describe, expect, it } from 'vitest';
import { assessEndToEndAdoptionFlow } from '../domain/institution/endToEndAdoptionValidation';

const byId = () => Object.fromEntries(
  assessEndToEndAdoptionFlow().steps.map((step) => [step.processId, step]),
);

describe('R7 end-to-end adoption validation', () => {
  it('fails closed while any canonical process remains partial or contract-only', () => {
    const assessment = assessEndToEndAdoptionFlow();

    expect(assessment.verdict).toBe('ADOPTION_FLOW_BLOCKED');
    expect(assessment.requiresRuntimeRemediation).toBe(true);
    expect(assessment.blockingProcessIds).toContain('P1_SOURCE_QUALIFICATION');
    expect(assessment.blockingProcessIds).toContain('P3_CURRICULUM_ANALYSIS');
    expect(assessment.blockingProcessIds).toContain('P6_CANONICAL_ADOPTION');
  });

  it('distinguishes an implemented decision from contract-only canonical adoption', () => {
    const steps = byId();

    expect(steps.P5_INSTITUTIONAL_DECISION.reality).toBe('EXECUTABLE');
    expect(steps.P6_CANONICAL_ADOPTION.reality).toBe('CONTRACT_ONLY');
    expect(steps.P6_CANONICAL_ADOPTION.consequential).toBe(true);
    expect(steps.P6_CANONICAL_ADOPTION.reason).toMatch(/non esiste ancora una mutazione runtime/i);
  });

  it('does not treat an implemented planning handoff as proof that adoption happened', () => {
    const assessment = assessEndToEndAdoptionFlow();
    const steps = byId();

    expect(steps.P7_PLANNING_HANDOFF.reality).toBe('EXECUTABLE');
    expect(assessment.verdict).toBe('ADOPTION_FLOW_BLOCKED');
    expect(assessment.blockingProcessIds).toContain('P6_CANONICAL_ADOPTION');
  });

  it('requires same-SHA release evidence and representative human acceptance even after runtime remediation', () => {
    const assessment = assessEndToEndAdoptionFlow();

    expect(assessment.requiresSameShaReleaseValidation).toBe(true);
    expect(assessment.requiresRepresentativeHumanAcceptance).toBe(true);
  });
});
