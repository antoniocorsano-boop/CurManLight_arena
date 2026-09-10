import { describe, expect, it } from 'vitest';
import workspaceSource from '../features/curriculum/CurriculumWorkspace.tsx?raw';
import caseAwareSource from '../features/beta/CaseAwareRevisionSurface.tsx?raw';
import baselineSource from '../lib/curriculumBaseline.ts?raw';
import currentSource from '../domain/curriculum/institute/currentSource.ts?raw';
import { TECHNOLOGY_CLASS1_REVIEW_PROPOSALS } from '../domain/curriculum/validation/technologyClass1Review';
import {
  TECHNOLOGY_CLASS2_REVIEW,
  TECHNOLOGY_CLASS2_REVIEW_PROPOSALS,
  resolveClassAwareOperationalReviewProposals,
} from '../domain/curriculum/validation/technologySecondaryClassReview';

describe('canonical curriculum entry', () => {
  it('makes the unified master the first curriculum surface in teacher-readable language', () => {
    expect(workspaceSource).toContain('data-canonical-curriculum-entry');
    expect(workspaceSource).toContain('data-curriculum-primary-task="consultation"');
    expect(workspaceSource).toContain('Curricolo verticale d’Istituto');
    expect(workspaceSource).toContain('Curricolo verticale 3–14');
    expect(workspaceSource).toContain('In revisione');
    expect(workspaceSource).toContain('deve ancora essere validato dall’Istituto.');
    expect(workspaceSource).toContain('data-curriculum-scope-summary');
    expect(workspaceSource).toContain('Infanzia · 3–5 anni');
    expect(workspaceSource).toContain('Primaria · I–V');
    expect(workspaceSource).toContain('Secondaria · I–III');
    expect(workspaceSource).toContain('Consulta il curricolo');
    expect(workspaceSource).not.toContain('Baseline corrente');
    expect(workspaceSource).not.toContain('master canonico');
  });

  it('exposes real mobile-safe navigation from the secondary curriculum context to the annual review', () => {
    expect(workspaceSource).toContain('data-secondary-curriculum-navigation');
    expect(workspaceSource).toContain('data-open-technology-review-class');
    expect(workspaceSource).toContain("setOrder('secondaria')");
    expect(workspaceSource).toContain("setDiscipline('tecnologia')");
    expect(workspaceSource).toContain("props.handleTabSwitch('revisione')");
    expect(workspaceSource).toContain('Scegli una classe se vuoi passare al Riesame.');
    expect(workspaceSource).toContain('Classe II');
  });

  it('keeps source verification behind two intentional disclosure levels', () => {
    expect(workspaceSource).toContain('data-source-review-progressive-disclosure');
    expect(workspaceSource).toContain('data-advanced-source-tools-default="collapsed"');
    expect(workspaceSource).toContain('Fonti e verifiche');
    expect(workspaceSource).toContain('Apri gli strumenti di verifica');
    expect(workspaceSource).toContain('{sourceToolsOpen && (');
    expect(workspaceSource).toContain('data-source-review-advanced-tools');
  });

  it('keeps the legacy local curriculum behind an explicit historical disclosure', () => {
    expect(workspaceSource).toContain('data-legacy-curriculum-disclosure');
    expect(workspaceSource).toContain('data-legacy-default="collapsed"');
    expect(workspaceSource).toContain('Archivio precedente');
    expect(workspaceSource).toContain('vecchia copia locale per consultazione storica');
    expect(workspaceSource).toContain('Non è il curricolo corrente dell’Istituto.');
    expect(workspaceSource).toContain('Torna al curricolo corrente');
    expect(workspaceSource).toContain('{legacyOpen && (');
    expect(workspaceSource).toContain('onClick={() => setLegacyOpen(true)}');
  });

  it('binds the canonical entry to the same master registered by the domain', () => {
    expect(currentSource).toContain('CAN-CURR-MASTER-00_Curricolo_verticale_integrale_unificato_3-14_2026-2027');
    expect(currentSource).toContain('12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4');
    expect(workspaceSource).toContain('INSTITUTE_CURRICULUM_CURRENT_SOURCE.driveFileId');
    expect(workspaceSource).toContain('CANONICAL_MASTER_URL');
  });

  it('materializes a distinct class-II H2 pilot from the canonical master without reusing class-I cards', () => {
    const class1 = resolveClassAwareOperationalReviewProposals('tecnologia', 'secondaria', '1', []);
    const class2 = resolveClassAwareOperationalReviewProposals('tecnologia', 'secondaria', '2', []);
    const class3 = resolveClassAwareOperationalReviewProposals('tecnologia', 'secondaria', '3', []);

    expect(class1).toBe(TECHNOLOGY_CLASS1_REVIEW_PROPOSALS);
    expect(class1.length).toBeGreaterThan(0);
    expect(class1.every((proposal) => proposal.id.startsWith('tec-sec1-'))).toBe(true);

    expect(class2).toBe(TECHNOLOGY_CLASS2_REVIEW_PROPOSALS);
    expect(class2).toHaveLength(1);
    expect(class2[0].id).toBe('tec-sec2-2026-r1-n1');
    expect(class2[0].id.startsWith('tec-sec1-')).toBe(false);
    expect(class2[0].newText).toContain('ANALIZZARE SISTEMI E PROPORRE');
    expect(class2[0].newText).toContain('consolidare misura/disegno/scala');
    expect(class2[0].newText).toContain('Raccordo: valutazione/progetto responsabile in III.');

    expect(class3).toEqual([]);
  });

  it('keeps class-II H2 traceable to master 1.3 and blocks cross-class contamination in the revision surface', () => {
    const proposal = TECHNOLOGY_CLASS2_REVIEW_PROPOSALS[0];
    expect(TECHNOLOGY_CLASS2_REVIEW.master.version).toBe('1.3');
    expect(TECHNOLOGY_CLASS2_REVIEW.master.driveFileId).toBe('12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4');
    expect(proposal.sourceRefs).toEqual(expect.arrayContaining([
      expect.stringContaining('12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4'),
      expect.stringContaining('1cCRWwvRT5Hl51DgR8SmjJb5pM-whlL1tA9xfRAwPf4Y'),
    ]));
    expect(caseAwareSource).toContain('resolveClassAwareOperationalReviewProposals');
    expect(caseAwareSource).toContain('availableProposals={operationalProposals}');
    expect(caseAwareSource).toContain('currentDisciplineProps={operationalProposals}');
    expect(caseAwareSource).toContain('proposals={operationalProposals}');
    expect(caseAwareSource).toContain('key={currentUnit.unitKey}');
    expect(caseAwareSource).toContain('data-class3-h2-not-materialized');
  });

  it('does not allow the compatibility baseline to regain canonical authority', () => {
    expect(baselineSource).toContain('NON è la baseline curricolare canonica');
    expect(baselineSource).toContain('getCanonicalCurriculumMasterIdentity');
    expect(baselineSource).toContain('Non aggiorna CAN-CURR-MASTER-00');
  });
});
