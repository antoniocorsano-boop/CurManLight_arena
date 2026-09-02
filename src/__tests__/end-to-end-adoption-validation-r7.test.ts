import { describe, expect, it } from 'vitest';
import { assessEndToEndAdoptionFlow } from '../domain/institution/endToEndAdoptionValidation';

const byId = () => Object.fromEntries(
  assessEndToEndAdoptionFlow().steps.map((step) => [step.processId, step]),
);

describe('R7 end-to-end adoption validation', () => {
  it('has no remaining runtime blockers after P1, P3 and P6 closure', () => {
    const assessment = assessEndToEndAdoptionFlow();
    expect(assessment.verdict).toBe('ADOPTION_FLOW_VALIDATED');
    expect(assessment.requiresRuntimeRemediation).toBe(false);
    expect(assessment.blockingProcessIds).toEqual([]);
  });

  it('recognizes every canonical process as executable', () => {
    const steps = byId();
    expect(Object.values(steps).every((step) => step.reality === 'EXECUTABLE')).toBe(true);
    expect(steps.P1_SOURCE_QUALIFICATION.implementationStatus).toBe('IMPLEMENTED');
    expect(steps.P3_CURRICULUM_ANALYSIS.implementationStatus).toBe('IMPLEMENTED');
    expect(steps.P6_CANONICAL_ADOPTION.implementationStatus).toBe('IMPLEMENTED');
  });

  it('does not confuse runtime closure with release or representative-human evidence', () => {
    const assessment = assessEndToEndAdoptionFlow();
    expect(assessment.verdict).toBe('ADOPTION_FLOW_VALIDATED');
    expect(assessment.requiresSameShaReleaseValidation).toBe(true);
    expect(assessment.requiresRepresentativeHumanAcceptance).toBe(true);
  });
});
