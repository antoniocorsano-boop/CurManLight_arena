import type { CmlInteropEnvelope, CurriculumAdoptedPayload, AnnualPlanningFrameworkPayload } from './interopV1';

const ref = (entityType: string, entityId: string, versionId?: string) => ({
  namespace: 'curmanlight.arena', entityType, entityId, ...(versionId ? { versionId } : {}),
});

export const curriculumAdoptedFixture: CmlInteropEnvelope<CurriculumAdoptedPayload> = {
  contract: 'CML_INTEROP_V1',
  messageId: 'msg-curriculum-adopted-001',
  messageType: 'CURRICULUM_ADOPTED',
  sourceProduct: 'CURMANLIGHT_ARENA',
  sourceVersion: 'fixture-v1',
  emittedAt: '2026-08-26T12:00:00.000Z',
  payloadVersion: 1,
  privacyClass: 'PROFESSIONAL_NON_PERSONAL',
  provenance: {
    sourceRefs: [ref('CurriculumVersion', 'technology-grade-1', '2026-27')],
    generatedBy: 'HUMAN',
    humanConfirmed: true,
  },
  payload: {
    institutionRef: ref('Institution', 'school-demo'),
    schoolYearRef: '2026-2027',
    curriculumRef: ref('Curriculum', 'technology'),
    curriculumVersionRef: ref('CurriculumVersion', 'technology-grade-1', '2026-27'),
    disciplineRef: 'technology',
    gradeRef: 'grade-1',
    effectiveFrom: '2026-09-01',
    adoptionDecisionRef: ref('InstitutionalDecision', 'decision-001'),
    nodeRefs: [ref('CurriculumNode', 'node-001'), ref('CurriculumNode', 'node-002')],
  },
};

export const annualPlanningFrameworkFixture: CmlInteropEnvelope<AnnualPlanningFrameworkPayload> = {
  contract: 'CML_INTEROP_V1',
  messageId: 'msg-framework-001',
  messageType: 'ANNUAL_PLANNING_FRAMEWORK_AVAILABLE',
  sourceProduct: 'CURMANLIGHT_ARENA',
  sourceVersion: 'fixture-v1',
  emittedAt: '2026-08-26T12:00:00.000Z',
  payloadVersion: 1,
  privacyClass: 'PROFESSIONAL_NON_PERSONAL',
  provenance: {
    sourceRefs: [ref('CurriculumVersion', 'technology-grade-1', '2026-27')],
    generatedBy: 'SYSTEM_DERIVED',
    humanConfirmed: true,
  },
  payload: {
    curriculumVersionRef: ref('CurriculumVersion', 'technology-grade-1', '2026-27'),
    disciplineRef: 'technology',
    gradeRef: 'grade-1',
    periods: [
      { periodId: 'p1', label: 'Primo periodo', suggestedNodeRefs: [ref('CurriculumNode', 'node-001')] },
      { periodId: 'p2', label: 'Secondo periodo', suggestedNodeRefs: [ref('CurriculumNode', 'node-002')] },
    ],
    constraints: [
      { id: 'constraint-001', kind: 'REQUIRED', description: 'Preservare allineamento con il curricolo adottato.' },
    ],
  },
};
