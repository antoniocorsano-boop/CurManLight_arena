import { describe, expect, it } from 'vitest';
import { assessEndToEndAdoptionFlow } from '../domain/institution/endToEndAdoptionValidation';

const byId = () => Object.fromEntries(
  assessEndToEndAdoptionFlow().steps.map((step) => [step.processId, step]),
);

describe('R7 end-to-end adoption validation', () => {
  it('has no remaining runtime blockers inside the declared first-cycle scope', () => {
    const assessment = assessEndToEndAdoptionFlow();
    expect(assessment.verdict).toBe('ADOPTION_FLOW_VALIDATED');
    expect(assessment.curriculumScope).toBe('DM221_FIRST_CYCLE_ONLY');
    expect(assessment.excludedSchoolOrders).toEqual(['infanzia']);
    expect(assessment.requiresRuntimeRemediation).toBe(false);
    expect(assessment.blockingProcessIds).toEqual([]);
  });

  it('recognizes every canonical process as executable in that declared scope', () => {
    const steps = byId();
    expect(Object.values(steps).every((step) => step.reality === 'EXECUTABLE')).toBe(true);
    expect(steps.P1_SOURCE_QUALIFICATION.implementationStatus).toBe('IMPLEMENTED');
    expect(steps.P3_CURRICULUM_ANALYSIS.implementationStatus).toBe('IMPLEMENTED');
    expect(steps.P3_CURRICULUM_ANALYSIS.label).toMatch(/primo ciclo/i);
    expect(steps.P6_CANONICAL_ADOPTION.implementationStatus).toBe('IMPLEMENTED');
  });

  it('does not confuse scoped runtime closure with infanzia, release or representative-human evidence', () => {
    const assessment = assessEndToEndAdoptionFlow();
    expect(assessment.verdict).toBe('ADOPTION_FLOW_VALIDATED');
    expect(assessment.curriculumScope).toBe('DM221_FIRST_CYCLE_ONLY');
    expect(assessment.excludedSchoolOrders).toContain('infanzia');
    expect(assessment.requiresSameShaReleaseValidation).toBe(true);
    expect(assessment.requiresRepresentativeHumanAcceptance).toBe(true);
  });
});
