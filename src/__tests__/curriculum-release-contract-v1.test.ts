import { describe, expect, it } from 'vitest';
import { annualPlanningFrameworkFixture } from '../domain/transfer/interopV1Fixtures';
import {
  CML_CURRICULUM_CONTEXT_CONTRACT,
  createCmlLocalHandoffV2,
  type CurriculumContextForClassV1,
} from '../domain/transfer/interopCurriculumContextV2';
import {
  CML_CURRICULUM_RELEASE_CONTRACT_V1,
  createCurriculumReleaseContractV1,
  validateCurriculumReleaseContractV1,
} from '../domain/transfer/curriculumReleaseContractV1';

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

function handoff(context: CurriculumContextForClassV1 = provisionalContext(), generatedAt = '2026-09-09T19:30:00.000Z') {
  return createCmlLocalHandoffV2({
    curricularContext: context,
    annualPlanningFramework: annualPlanningFrameworkFixture,
    generatedAt,
  });
}

describe('C2P-02 CurriculumReleaseContract v1 profile', () => {
  it('projects the existing handoff v2 without creating downstream write authority', () => {
    const source = handoff();
    const release = createCurriculumReleaseContractV1(source);

    expect(release.contract).toBe(CML_CURRICULUM_RELEASE_CONTRACT_V1);
    expect(release.contractVersion).toBe(1);
    expect(release.sourceHandoffFormat).toBe('CML_LOCAL_HANDOFF_V2');
    expect(release.authorityState).toBe('PROVISIONAL_COMPLETE');
    expect(release.authorityReceiptRef).toBeUndefined();
    expect(release.structuralFingerprint).toEqual(source.structuralFootprint);
    expect(release.issuedAt).toBe(source.generatedAt);
    expect(release.privacyClass).toBe('PROFESSIONAL_NON_PERSONAL');
    expect(release.downstreamPolicy).toEqual({
      targetProduct: 'DOCENTE_OS',
      importMode: 'PREVIEW_ONLY',
      acceptanceRequired: true,
      automaticWriteAllowed: false,
    });
    expect(release.planningSemantics.nodeRefs.map(item => item.entityId)).toEqual(['node-001', 'node-002']);
    expect(release.planningSemantics.requirements[0]).not.toHaveProperty('description');
    expect(validateCurriculumReleaseContractV1(release, source)).toEqual({ valid: true, errors: [] });
  });

  it('exposes institutional approval only when the governed decision reference exists', () => {
    const base = provisionalContext();
    const approvalDecisionRef = ref('InstitutionalDecision', 'decision-approved-001');
    const approved: CurriculumContextForClassV1 = {
      ...base,
      curriculumState: 'APPROVED',
      approvalDecisionRef,
      transitionRemodulation: {
        ...base.transitionRemodulation,
        state: 'APPROVED',
        institutionallyApproved: true,
        approvalDecisionRef: ref('InstitutionalDecision', 'remodulation-approved-001'),
      },
    };

    const release = createCurriculumReleaseContractV1(handoff(approved));
    expect(release.authorityState).toBe('APPROVED');
    expect(release.authorityReceiptRef).toEqual(approvalDecisionRef);
  });

  it('preserves the structural fingerprint when only issuance time changes', () => {
    const first = createCurriculumReleaseContractV1(handoff(provisionalContext(), '2026-09-09T19:30:00.000Z'));
    const second = createCurriculumReleaseContractV1(handoff(provisionalContext(), '2026-09-09T20:30:00.000Z'));

    expect(first.structuralFingerprint.hash).toBe(second.structuralFingerprint.hash);
    expect(first.issuedAt).not.toBe(second.issuedAt);
  });

  it('fails closed if the release fingerprint no longer matches the source handoff', () => {
    const source = handoff();
    const release = createCurriculumReleaseContractV1(source);
    const tampered = {
      ...release,
      structuralFingerprint: { ...release.structuralFingerprint, hash: 'tampered' },
    };

    expect(validateCurriculumReleaseContractV1(tampered, source).errors)
      .toContain('structuralFingerprint does not match source handoff');
  });

  it('fails closed if a provisional release claims institutional authority', () => {
    const source = handoff();
    const release = createCurriculumReleaseContractV1(source);
    const tampered = {
      ...release,
      authorityReceiptRef: ref('InstitutionalDecision', 'forbidden-claim'),
    };

    expect(validateCurriculumReleaseContractV1(tampered, source).errors)
      .toContain('PROVISIONAL_COMPLETE release cannot claim authorityReceiptRef');
  });

  it('rejects any attempt to turn the release into an automatic downstream write', () => {
    const source = handoff();
    const release = createCurriculumReleaseContractV1(source);
    const tampered = {
      ...release,
      downstreamPolicy: { ...release.downstreamPolicy, automaticWriteAllowed: true },
    };

    expect(validateCurriculumReleaseContractV1(tampered, source).errors)
      .toContain('downstreamPolicy.automaticWriteAllowed must remain false');
  });
});
