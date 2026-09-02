import { describe, expect, it } from 'vitest';
import { assessEndToEndAdoptionFlow } from '../domain/institution/endToEndAdoptionValidation';

const byId = () => Object.fromEntries(
  assessEndToEndAdoptionFlow().steps.map((step) => [step.processId, step]),
);

describe('R7 end-to-end adoption validation', () => {
  it('fails closed while P1 or P3 remain partial even after P6 runtime closure', () => {
    const assessment = assessEndToEndAdoptionFlow();

    expect(assessment.verdict).toBe('ADOPTION_FLOW_BLOCKED');
    expect(assessment.requiresRuntimeRemediation).toBe(true);
    expect(assessment.blockingProcessIds).toEqual([
      'P1_SOURCE_QUALIFICATION',
      'P3_CURRICULUM_ANALYSIS',
    ]);
    expect(assessment.blockingProcessIds).not.toContain('P6_CANONICAL_ADOPTION');
  });

  it('recognizes decision, canonical adoption and planning handoff as executable', () => {
    const steps = byId();

    expect(steps.P5_INSTITUTIONAL_DECISION.reality).toBe('EXECUTABLE');
    expect(steps.P6_CANONICAL_ADOPTION.reality).toBe('EXECUTABLE');
    expect(steps.P6_CANONICAL_ADOPTION.implementationStatus).toBe('IMPLEMENTED');
    expect(steps.P6_CANONICAL_ADOPTION.consequential).toBe(true);
    expect(steps.P7_PLANNING_HANDOFF.reality).toBe('EXECUTABLE');
  });

  it('does not turn P6 closure into a false whole-pipeline PASS', () => {
    const assessment = assessEndToEndAdoptionFlow();

    expect(assessment.executableProcessIds).toContain('P6_CANONICAL_ADOPTION');
    expect(assessment.verdict).toBe('ADOPTION_FLOW_BLOCKED');
    expect(assessment.blockingProcessIds).toEqual([
      'P1_SOURCE_QUALIFICATION',
      'P3_CURRICULUM_ANALYSIS',
    ]);
  });

  it('still requires same-SHA release evidence and representative human acceptance', () => {
    const assessment = assessEndToEndAdoptionFlow();

    expect(assessment.requiresSameShaReleaseValidation).toBe(true);
    expect(assessment.requiresRepresentativeHumanAcceptance).toBe(true);
  });
});
