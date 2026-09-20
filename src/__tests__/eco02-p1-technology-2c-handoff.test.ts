import { describe, expect, it } from 'vitest';
import {
  ECO02_P1_TECHNOLOGY_2C_HANDOFF,
  ECO02_P1_TECHNOLOGY_2C_HANDOFF_GENERATED_AT,
} from '../domain/transfer/eco02P1Technology2CHandoff';
import { validateCmlLocalHandoffV2 } from '../domain/transfer/interopCurriculumContextV2';

describe('ECO-02/P1 Technology 2C governed handoff', () => {
  it('materializes a valid structural footprint from the Arena runtime curriculum', () => {
    expect(validateCmlLocalHandoffV2(ECO02_P1_TECHNOLOGY_2C_HANDOFF)).toEqual({ valid: true, errors: [] });
    expect(ECO02_P1_TECHNOLOGY_2C_HANDOFF.structuralFootprint.algorithm).toBe('fnv1a');
    expect(ECO02_P1_TECHNOLOGY_2C_HANDOFF.structuralFootprint.version).toBe(1);
    expect(ECO02_P1_TECHNOLOGY_2C_HANDOFF.structuralFootprint.hash).toMatch(/^[0-9a-f]{8}$/);
    expect(ECO02_P1_TECHNOLOGY_2C_HANDOFF.structuralFootprint.hash).not.toBe('pending');
  });

  it('binds the pilot to Technology 2C and the 2026-2027 transitional cohort', () => {
    const context = ECO02_P1_TECHNOLOGY_2C_HANDOFF.curricularContext;
    expect(context.schoolYearRef).toBe('2026-2027');
    expect(context.disciplineRef).toBe('tecnologia');
    expect(context.gradeRef).toBe('grade-2');
    expect(context.sectionRef).toBe('2C');
    expect(context.applicabilityStatus).toBe('TRANSITIONAL');
    expect(context.transitionRemodulation.state).toBe('HYPOTHESIS');
    expect(context.completeForPlanning).toBe(true);
    expect(context.requirements.length).toBeGreaterThan(0);
  });

  it('fails closed on authority until a complete institutional curriculum approval exists', () => {
    const handoff = ECO02_P1_TECHNOLOGY_2C_HANDOFF;
    expect(handoff.generatedAt).toBe(ECO02_P1_TECHNOLOGY_2C_HANDOFF_GENERATED_AT);
    expect(handoff.curricularContext.institutionRef.entityId).toBe('curmanlight-local');
    expect(handoff.curricularContext.curriculumState).toBe('PROVISIONAL_COMPLETE');
    expect(handoff.curricularContext.approvalDecisionRef).toBeUndefined();
    expect(handoff.annualPlanningFramework.provenance.humanConfirmed).toBe(false);
    expect(handoff.acceptanceRequired).toBe(true);
    expect(handoff.importMode).toBe('PREVIEW_ONLY');
  });

  it('keeps the pilot topic requirements visible from the actual Arena Technology runtime baseline', () => {
    const descriptions = ECO02_P1_TECHNOLOGY_2C_HANDOFF.curricularContext.requirements
      .map(requirement => requirement.description)
      .join('\n');

    expect(descriptions).toContain('Studiare l\'industria siderurgica, chimica, ceramica e alimentare locale (Cl. 1-2).');
    expect(descriptions).toContain('Disegno Tecnico');
    expect(descriptions).toContain('Materiali e Processi Industriali');
  });
});
