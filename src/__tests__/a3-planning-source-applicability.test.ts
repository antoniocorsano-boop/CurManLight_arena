import { describe, expect, it } from 'vitest';
import {
  normalizePlanningAcademicYear,
  resolvePlanningSourceContext,
} from '../domain/curriculum/institute/planningSourceContext';
import planningWorkspaceSource from '../features/progettazione/PlanningWorkspace.tsx?raw';

describe('M4-S7 A3 planning source applicability closure', () => {
  it('keeps the Arena master as a working baseline without inventing institutional adoption', () => {
    const context = resolvePlanningSourceContext({
      schoolYear: '2026-2027',
      order: 'secondaria',
      targetClass: '1',
    });

    expect(context.masterId).toBe('CAN-CURR-MASTER-00');
    expect(context.masterVersion).toBe('1.3');
    expect(context.masterInstitutionalStatus).toBe('WORKING_BASELINE_PENDING_APPROVAL');
    expect(context.masterStatusLabel).toContain('approvazione collegiale non ancora registrata');
  });

  it('resolves the 2026/27 first secondary cohort to Indicazioni 2025 and source N4', () => {
    const context = resolvePlanningSourceContext({
      schoolYear: '2026/2027',
      order: 'secondaria',
      targetClass: '1',
    });

    expect(context.academicYear).toBe('2026-2027');
    expect(context.applicabilityState).toBe('RESOLVED_IN2025');
    expect(context.framework).toBe('IN2025');
    expect(context.applicableSource?.code).toBe('N4');
    expect(context.applicabilityLabel).toContain('Indicazioni 2025');
  });

  it('resolves continuing 2026/27 secondary cohorts to Indicazioni 2012 and source N5', () => {
    const context = resolvePlanningSourceContext({
      schoolYear: '2026-2027',
      order: 'secondaria',
      targetClass: '2',
    });

    expect(context.applicabilityState).toBe('RESOLVED_IN2012');
    expect(context.framework).toBe('IN2012');
    expect(context.applicableSource?.code).toBe('N5');
    expect(context.applicabilityLabel).toContain('Indicazioni 2012 in prosecuzione');
  });

  it('fails closed when the academic year or class context is insufficient', () => {
    const missingYear = resolvePlanningSourceContext({
      schoolYear: '',
      order: 'secondaria',
      targetClass: '1',
    });
    const missingClass = resolvePlanningSourceContext({
      schoolYear: '2026-2027',
      order: 'secondaria',
      targetClass: '',
    });

    expect(missingYear.applicabilityState).toBe('UNRESOLVED_CONTEXT');
    expect(missingYear.framework).toBeNull();
    expect(missingClass.applicabilityState).toBe('UNRESOLVED_CONTEXT');
    expect(missingClass.framework).toBeNull();
  });

  it('normalizes institutional academic-year labels without changing provenance semantics', () => {
    expect(normalizePlanningAcademicYear('2026/2027')).toBe('2026-2027');
    expect(normalizePlanningAcademicYear('2026-2027')).toBe('2026-2027');
  });

  it('removes the ambiguous non-current master label from the primary planning surface', () => {
    expect(planningWorkspaceSource).not.toContain('master ${INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceVersion} non vigente');
    expect(planningWorkspaceSource).not.toContain('Riferimento di lavoro · master');
    expect(planningWorkspaceSource).toContain('Il quadro nazionale applicabile alla coorte e lo stato di approvazione del master d’Istituto sono informazioni distinte.');
    expect(planningWorkspaceSource).toContain('data-planning-master-state');
    expect(planningWorkspaceSource).toContain('data-planning-applicability');
  });

  it('carries source repertory and applicability provenance into the read-only Atlas handoff', () => {
    expect(planningWorkspaceSource).toContain('sourceRepertoryId');
    expect(planningWorkspaceSource).toContain('sourceRepertoryVersion');
    expect(planningWorkspaceSource).toContain('applicabilityState');
    expect(planningWorkspaceSource).toContain('applicableFramework');
    expect(planningWorkspaceSource).toContain('applicableSourceCode');
  });
});
