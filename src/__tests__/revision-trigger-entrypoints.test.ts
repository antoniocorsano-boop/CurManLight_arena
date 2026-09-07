import { describe, expect, it } from 'vitest';
import { buildDidacticBinding, resolveCurriculumUnitReference } from '../domain/curriculum/didacticBinding';
import qualificationPanelRaw from '../features/curriculum/components/RevisionTriggerQualificationPanel.tsx?raw';
import sourceRegisterPanelRaw from '../features/documents/components/InstituteCurriculumSourceRegisterPanel.tsx?raw';
import fontiWorkspaceRaw from '../features/documents/components/FontiWorkspace.tsx?raw';
import appViewsRaw from '../features/session/components/AppViewsLayer.tsx?raw';
import revisionWorkspaceRaw from '../features/beta/RevisionWorkspace.tsx?raw';

describe('RevisionTrigger — ingressi sulle superfici esistenti', () => {
  it('uses the same CurriculumUnit identity for didactic binding and revision triggers', () => {
    const resolved = resolveCurriculumUnitReference({
      order: 'secondaria',
      targetClass: '1',
      disciplineOrField: 'tecnologia',
    });
    const binding = buildDidacticBinding({
      targetType: 'uda',
      order: 'secondaria',
      targetClass: '1',
      disciplineOrField: 'tecnologia',
      createdAt: '2026-09-07T06:00:00.000Z',
    });

    expect(binding.curriculumUnit).toEqual(resolved);
    expect(resolved.masterId).toBe('CAN-CURR-MASTER-00');
    expect(resolved.masterVersion).toBe('1.3');
  });

  it('keeps one qualification section inside the existing revision workspace', () => {
    expect(qualificationPanelRaw).toContain('data-revision-trigger-qualification');
    expect(qualificationPanelRaw).toContain('Nuova norma o circolare');
    expect(qualificationPanelRaw).toContain('Esigenza dell’Istituto');
    expect(qualificationPanelRaw).toContain('Riesame periodico');
    expect(qualificationPanelRaw).toContain('Motivo qualificato ≠ caso di riesame ≠ modifica del master ≠ decisione istituzionale.');
    expect(revisionWorkspaceRaw).toContain('<RevisionTriggerQualificationPanel');
    expect(revisionWorkspaceRaw).toContain('data-curriculum-work-session');
  });

  it('routes qualified institutional sources from Fascicolo to the existing Revisione tab', () => {
    expect(sourceRegisterPanelRaw).toContain('data-source-review-action');
    expect(sourceRegisterPanelRaw).toContain('Valuta l’impatto sul curricolo');
    expect(sourceRegisterPanelRaw).toContain('non crea automaticamente un caso e non modifica il master');
    expect(fontiWorkspaceRaw).toContain('onRequestNormativeReview={onRequestNormativeReview}');
    expect(appViewsRaw).toContain('setNormativeReviewSourceCode(sourceCode)');
    expect(appViewsRaw).toContain("safeHandleTabSwitch('revisione')");
    expect(appViewsRaw).toContain('initialNormativeSourceCode={normativeReviewSourceCode}');
  });

  it('does not add a new primary route for trigger qualification', () => {
    expect(appViewsRaw).toContain("'dashboard', 'curricolo', 'revisione'");
    expect(appViewsRaw).not.toContain("'revision-trigger'");
    expect(appViewsRaw).not.toContain("'normative-review'");
    expect(appViewsRaw).not.toContain("'periodic-review'");
  });

  it('keeps external normative qualification restricted to the verified institutional repertory', () => {
    expect(qualificationPanelRaw).toContain('INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCES');
    expect(qualificationPanelRaw).toContain("sourceQualification: 'QUALIFIED'");
    expect(qualificationPanelRaw).toContain('Una fonte non presente nel repertorio qualificato deve essere verificata nel Fascicolo');
    expect(qualificationPanelRaw).not.toContain('customKbDocs');
  });

  it('requires explicit professional content for institute and periodic origins', () => {
    expect(qualificationPanelRaw).toContain('declaredNonNational: true');
    expect(qualificationPanelRaw).toContain('Questa origine è registrata come esigenza dell’Istituto e non come prescrizione nazionale.');
    expect(qualificationPanelRaw).toContain('il semplice decorso del tempo non riapre unità stabili');
    expect(qualificationPanelRaw).toContain('buildPeriodicReviewRevisionTrigger');
  });
});
