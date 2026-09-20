import { describe, expect, it } from 'vitest';
import {
  addAcademicYear,
  addInstitute,
  confirmInstitute,
  createAcademicYear,
  createEmptyInstitutionalArchive,
  createInstituteDraft,
  createInstitutionalContext,
  getInstitutionalConfigurationSummary,
  setActiveAcademicYear,
  setActiveInstitute,
  setInstitutionalContext,
} from '../domain/institution';
import {
  normalizePlanningAcademicYear,
  resolvePlanningMasterGovernanceState,
  resolvePlanningSourceContext,
} from '../domain/curriculum/institute/planningSourceContext';
import planningWorkspaceSource from '../features/progettazione/PlanningWorkspace.tsx?raw';
import planningHandoffSource from '../features/beta/PlanningHandoffPreview.tsx?raw';

describe('M4-S7 A3 planning source applicability closure', () => {
  it('keeps the Arena master as a working baseline without inventing institutional adoption', () => {
    const context = resolvePlanningSourceContext({
      schoolYear: '2026-2027',
      order: 'secondaria',
      targetClass: '1',
    });

    expect(context.masterId).toBe('CAN-CURR-MASTER-00');
    expect(context.masterVersion).toBe('1.3');
    expect(context.masterInstitutionalStatus).toBe('PENDING_PROFESSIONAL_VALIDATION');
    expect(context.masterStatusLabel).toContain('validazione professionale ancora aperta');
    expect(context.masterStatusLabel).not.toContain('approvazione collegiale non ancora registrata');
  });

  it('preserves the master governance gate sequence without collapsing open review into Collegio approval', () => {
    const common = {
      curriculumInForce: false,
      humanProfessionalValidation: 'COMPLETE',
      verticalityFinalReview: 'COMPLETE',
      readyForCollegio: true,
      collegiateApproval: false,
      canonicalPromotionAuthorized: false,
    };

    expect(resolvePlanningMasterGovernanceState({
      ...common,
      humanProfessionalValidation: 'OPEN',
      verticalityFinalReview: 'OPEN',
      readyForCollegio: false,
    })).toEqual({
      masterInstitutionalStatus: 'PENDING_PROFESSIONAL_VALIDATION',
      masterStatusLabel: 'Baseline canonica di lavoro · validazione professionale ancora aperta',
    });

    expect(resolvePlanningMasterGovernanceState({
      ...common,
      verticalityFinalReview: 'OPEN',
      readyForCollegio: false,
    }).masterInstitutionalStatus).toBe('PENDING_VERTICALITY_REVIEW');

    expect(resolvePlanningMasterGovernanceState({
      ...common,
      readyForCollegio: false,
    }).masterInstitutionalStatus).toBe('NOT_READY_FOR_COLLEGIO');

    const collegioReady = resolvePlanningMasterGovernanceState(common);
    expect(collegioReady.masterInstitutionalStatus).toBe('READY_FOR_COLLEGIO_PENDING_APPROVAL');
    expect(collegioReady.masterStatusLabel).toContain('approvazione collegiale non ancora registrata');

    expect(resolvePlanningMasterGovernanceState({
      ...common,
      collegiateApproval: true,
    }).masterInstitutionalStatus).toBe('APPROVED_PENDING_CANONICAL_PROMOTION');

    expect(resolvePlanningMasterGovernanceState({
      ...common,
      collegiateApproval: true,
      canonicalPromotionAuthorized: true,
    }).masterInstitutionalStatus).toBe('PROMOTION_AUTHORIZED_PENDING_IN_FORCE');

    expect(resolvePlanningMasterGovernanceState({
      ...common,
      curriculumInForce: true,
      collegiateApproval: true,
      canonicalPromotionAuthorized: true,
    }).masterInstitutionalStatus).toBe('IN_FORCE');
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
    expect(planningWorkspaceSource).toContain('Il quadro nazionale applicabile alla coorte e lo stato di approvazione del riferimento curricolare d’Istituto sono informazioni distinte.');
    expect(planningWorkspaceSource).toContain('data-planning-master-state');
    expect(planningWorkspaceSource).toContain('data-planning-applicability');
    expect(planningWorkspaceSource).toContain('Curricolo di lavoro Arena · versione');
    expect(planningWorkspaceSource).toContain('Riferimento curricolare di lavoro');
    expect(planningWorkspaceSource).toContain('sviluppo verticale, linea temporale e provenienza in sola consultazione');
    expect(planningWorkspaceSource).not.toContain('Anteprima S1 pubblica');
  });

  it('carries source repertory and applicability provenance into the read-only Atlas handoff', () => {
    expect(planningWorkspaceSource).toContain('masterGovernanceStatus');
    expect(planningWorkspaceSource).toContain('masterLifecycleState');
    expect(planningWorkspaceSource).toContain('sourceRepertoryId');
    expect(planningWorkspaceSource).toContain('sourceRepertoryVersion');
    expect(planningWorkspaceSource).toContain('applicabilityState');
    expect(planningWorkspaceSource).toContain('applicableFramework');
    expect(planningWorkspaceSource).toContain('applicableSourceCode');
  });
  it('distinguishes defined, confirmed-inactive and active institutional states', () => {
    const now = '2026-09-20T00:00:00.000Z';
    const institute = createInstituteDraft({ name: 'Istituto Test', schoolOrders: ['secondaria'] }, now);
    let archive = addInstitute(createEmptyInstitutionalArchive(now), institute, now).archive!;

    expect(getInstitutionalConfigurationSummary(archive)).toMatchObject({
      phase: 'DRAFT',
      instituteDefined: true,
      instituteName: 'Istituto Test',
      contextActive: false,
    });

    const year = createAcademicYear({
      instituteRef: { id: institute.id, entityType: 'institute' },
      label: '2026/2027',
      startsOn: '2026-09-01',
      endsOn: '2027-08-31',
      status: 'planned',
    }, now);
    archive = addAcademicYear(archive, year, now).archive!;
    archive = confirmInstitute(archive, institute.id, now).archive!;

    expect(getInstitutionalConfigurationSummary(archive)).toMatchObject({
      phase: 'CONFIRMED_INACTIVE',
      instituteName: 'Istituto Test',
      academicYearLabel: '2026/2027',
      contextActive: false,
    });

    archive = setActiveInstitute(archive, institute.id, now).archive!;
    archive = setActiveAcademicYear(archive, institute.id, year.id, now).archive!;
    const context = createInstitutionalContext({
      instituteRef: { id: institute.id, entityType: 'institute' },
      academicYearRef: { id: year.id, entityType: 'academic-year', snapshotLabel: year.label },
    }, now);
    archive = setInstitutionalContext(archive, context, now).archive!;

    expect(getInstitutionalConfigurationSummary(archive)).toMatchObject({
      phase: 'ACTIVE',
      instituteName: 'Istituto Test',
      academicYearLabel: '2026/2027',
      contextActive: true,
    });
  });

  it('exposes phase-aware recovery to the canonical institution configuration panel', () => {
    expect(planningHandoffSource).toContain('getInstitutionalConfigurationSummary');
    expect(planningHandoffSource).toContain("configurationSummary.phase === 'DRAFT'");
    expect(planningHandoffSource).toContain("configurationSummary.phase === 'CONFIRMED_INACTIVE'");
    expect(planningHandoffSource).toContain('Completa e conferma l’istituto');
    expect(planningHandoffSource).toContain('Attiva anno e contesto');
    expect(planningHandoffSource).toContain('data-human-next-action="configure-institution"');
    expect(planningHandoffSource).toContain('setShowSaveModal(true)');
  });

  it('uses a configured academic-year candidate for national applicability without promoting institutional authority', () => {
    expect(planningWorkspaceSource).toContain('configurationSummary.academicYearLabel');
    expect(planningWorkspaceSource).toContain('data-planning-institution-phase');
    expect(planningWorkspaceSource).toContain('Istituto definito:');
  });

  it('requires explicit class context before resolving cohort applicability', () => {
    expect(planningWorkspaceSource).toContain('Classe da scegliere');
    expect(planningWorkspaceSource).toContain('data-planning-target-selection');
    expect(planningWorkspaceSource).toContain('Arena non assegna automaticamente una classe o una sezione.');
    expect(planningWorkspaceSource).toContain('data-planning-target-class');
    expect(planningHandoffSource).toContain('Classe da scegliere');
  });

});
