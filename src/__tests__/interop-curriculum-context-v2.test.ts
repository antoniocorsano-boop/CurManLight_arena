import { describe, expect, it } from 'vitest';
import { annualPlanningFrameworkFixture } from '../domain/transfer/interopV1Fixtures';
import {
  CML_CURRICULUM_CONTEXT_CONTRACT,
  createCmlLocalHandoffV2,
  validateCmlLocalHandoffV2,
  validateCurriculumContextForClassV1,
  type CurriculumContextForClassV1,
} from '../domain/transfer/interopCurriculumContextV2';

const ref = (entityType: string, entityId: string, versionId?: string) => ({
  namespace: 'curmanlight.arena', entityType, entityId, ...(versionId ? { versionId } : {}),
});

function provisionalContext(): CurriculumContextForClassV1 {
  return {
    contract: CML_CURRICULUM_CONTEXT_CONTRACT,
    contextId: 'ctx-technology-grade-1-2026-27',
    institutionRef: ref('Institution', 'school-demo'),
    schoolYearRef: '2026-2027',
    disciplineRef: 'technology',
    gradeRef: 'grade-1',
    sectionRef: 'section-A',
    curriculumRef: ref('Curriculum', 'technology'),
    curriculumVersionRef: ref('CurriculumVersion', 'technology-grade-1', '2026-27'),
    curriculumState: 'PROVISIONAL_COMPLETE',
    approvalProcessRef: ref('RevisionProcess', 'curriculum-2025-transition'),
    applicabilityStatus: 'TRANSITIONAL',
    transitionRuleRef: ref('TransitionRule', 'dm221-2025-art5'),
    completeForPlanning: true,
    requirements: [
      {
        requirementId: 'req-001',
        kind: 'SPECIFIC_LEARNING_OBJECTIVE',
        authorityLevel: 'NATIONAL_PRESCRIPTIVE',
        curriculumNodeRef: ref('CurriculumNode', 'node-001'),
        description: 'Requisito curricolare nazionale da garantire nel percorso.',
        coverageRequired: true,
        sourceRefs: [ref('NationalFramework', 'indicazioni-2025')],
      },
      {
        requirementId: 'req-002',
        kind: 'INSTITUTIONAL_REQUIREMENT',
        authorityLevel: 'TRANSITION_REQUIRED',
        curriculumNodeRef: ref('CurriculumNode', 'node-002'),
        description: 'Requisito derivato dalla rimodulazione transitoria di istituto.',
        coverageRequired: true,
        sourceRefs: [ref('CurriculumDraft', 'technology-transition-draft')],
        transitionOriginRef: ref('TransitionRemodulationProposal', 'remod-001'),
      },
    ],
    transitionRemodulation: {
      state: 'HYPOTHESIS',
      rationale: 'Ipotesi completa per consentire la progettazione durante il processo di approvazione.',
      sourceRefs: [ref('NationalFramework', 'indicazioni-2012'), ref('NationalFramework', 'indicazioni-2025')],
      affectedRequirementIds: ['req-002'],
      usableForPlanning: true,
      institutionallyApproved: false,
      proposalRef: ref('RevisionProposal', 'remod-001'),
    },
    sourceRefs: [ref('RevisionProposal', 'curriculum-draft-001')],
  };
}

describe('CML curriculum context handoff v2', () => {
  it('allows a complete provisional curriculum with an explicit transition hypothesis', () => {
    const context = provisionalContext();
    expect(validateCurriculumContextForClassV1(context)).toEqual({ valid: true, errors: [] });
    const handoff = createCmlLocalHandoffV2({
      curricularContext: context,
      annualPlanningFramework: annualPlanningFrameworkFixture,
      generatedAt: '2026-08-26T14:00:00.000Z',
    });
    expect(validateCmlLocalHandoffV2(handoff).valid).toBe(true);
    expect(handoff.curricularContext.curriculumState).toBe('PROVISIONAL_COMPLETE');
    expect(handoff.curricularContext.transitionRemodulation.state).toBe('HYPOTHESIS');
  });

  it('requires a decision reference before a curriculum can claim APPROVED', () => {
    const invalid = { ...provisionalContext(), curriculumState: 'APPROVED' as const };
    expect(validateCurriculumContextForClassV1(invalid).errors).toContain('approved curriculum requires approvalDecisionRef');
  });

  it('does not allow a provisional curriculum to claim an approval decision', () => {
    const invalid = { ...provisionalContext(), approvalDecisionRef: ref('Decision', 'decision-001') };
    expect(validateCurriculumContextForClassV1(invalid).errors).toContain('provisional curriculum cannot claim approvalDecisionRef');
  });

  it('requires remodulation work when applicability is transitional', () => {
    const invalid = {
      ...provisionalContext(),
      transitionRemodulation: {
        ...provisionalContext().transitionRemodulation,
        state: 'NOT_REQUIRED' as const,
      },
    };
    expect(validateCurriculumContextForClassV1(invalid).errors).toContain('transitional applicability requires remodulation hypothesis or approval');
  });

  it('requires mandatory curricular requirements to be coverageRequired', () => {
    const context = provisionalContext();
    const invalid = {
      ...context,
      requirements: [{ ...context.requirements[0], coverageRequired: false }, context.requirements[1]],
    };
    expect(validateCurriculumContextForClassV1(invalid).errors.some(error => error.includes('mandatory authority requires coverageRequired=true'))).toBe(true);
  });

  it('binds the framework to the exact curriculum version, discipline and grade', () => {
    const context = { ...provisionalContext(), gradeRef: 'grade-2' };
    const candidate = {
      format: 'CML_LOCAL_HANDOFF_V2',
      targetProduct: 'DOCENTE_OS',
      acceptanceRequired: true,
      importMode: 'PREVIEW_ONLY',
      generatedAt: '2026-08-26T14:00:00.000Z',
      curricularContext: context,
      annualPlanningFramework: annualPlanningFrameworkFixture,
      structuralFootprint: { algorithm: 'fnv1a', version: 1, hash: 'pending' },
    };
    const result = validateCmlLocalHandoffV2(candidate, { skipFootprint: true });
    expect(result.errors).toContain('gradeRef mismatch');
  });

  it('keeps the structural footprint stable when only generatedAt changes', () => {
    const context = provisionalContext();
    const a = createCmlLocalHandoffV2({ curricularContext: context, annualPlanningFramework: annualPlanningFrameworkFixture, generatedAt: '2026-08-26T14:00:00.000Z' });
    const b = createCmlLocalHandoffV2({ curricularContext: context, annualPlanningFramework: annualPlanningFrameworkFixture, generatedAt: '2026-08-26T15:00:00.000Z' });
    expect(a.structuralFootprint.hash).toBe(b.structuralFootprint.hash);
  });

  it('supports approved context after the institutional decision exists', () => {
    const base = provisionalContext();
    const approved: CurriculumContextForClassV1 = {
      ...base,
      curriculumState: 'APPROVED',
      approvalDecisionRef: ref('InstitutionalDecision', 'decision-approved-001'),
      transitionRemodulation: {
        ...base.transitionRemodulation,
        state: 'APPROVED',
        institutionallyApproved: true,
        approvalDecisionRef: ref('InstitutionalDecision', 'remodulation-approved-001'),
      },
    };
    expect(validateCurriculumContextForClassV1(approved)).toEqual({ valid: true, errors: [] });
  });
});
