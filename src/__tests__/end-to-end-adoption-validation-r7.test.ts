import { describe, expect, it } from 'vitest';
import { assessEndToEndAdoptionFlow } from '../domain/institution/endToEndAdoptionValidation';

const byId = () => Object.fromEntries(
  assessEndToEndAdoptionFlow().steps.map((step) => [step.processId, step]),
);

describe('R7 end-to-end adoption validation', () => {
  it('fails closed while P3 remains partial after P1 and P6 runtime closure', () => {
    const assessment = assessEndToEndAdoptionFlow();

    expect(assessment.verdict).toBe('ADOPTION_FLOW_BLOCKED');
    expect(assessment.requiresRuntimeRemediation).toBe(true);
    expect(assessment.blockingProcessIds).toEqual(['P3_CURRICULUM_ANALYSIS']);
    expect(assessment.blockingProcessIds).not.toContain('P1_SOURCE_QUALIFICATION');
    expect(assessment.blockingProcessIds).not.toContain('P6_CANONICAL_ADOPTION');
  });

  it('recognizes source qualification, decision, adoption and planning handoff as executable', () => {
    const steps = byId();

    expect(steps.P1_SOURCE_QUALIFICATION.reality).toBe('EXECUTABLE');
    expect(steps.P5_INSTITUTIONAL_DECISION.reality).toBe('EXECUTABLE');
    expect(steps.P6_CANONICAL_ADOPTION.reality).toBe('EXECUTABLE');
    expect(steps.P6_CANONICAL_ADOPTION.implementationStatus).toBe('IMPLEMENTED');
    expect(steps.P7_PLANNING_HANDOFF.reality).toBe('EXECUTABLE');
  });

  it('does not turn P1/P6 closure into a false whole-pipeline PASS', () => {
    const assessment = assessEndToEndAdoptionFlow();

    expect(assessment.executableProcessIds).toContain('P1_SOURCE_QUALIFICATION');
    expect(assessment.executableProcessIds).toContain('P6_CANONICAL_ADOPTION');
    expect(assessment.verdict).toBe('ADOPTION_FLOW_BLOCKED');
    expect(assessment.blockingProcessIds).toEqual(['P3_CURRICULUM_ANALYSIS']);
  });

  it('still requires same-SHA release evidence and representative human acceptance', () => {
    const assessment = assessEndToEndAdoptionFlow();

    expect(assessment.requiresSameShaReleaseValidation).toBe(true);
    expect(assessment.requiresRepresentativeHumanAcceptance).toBe(true);
  });
});
