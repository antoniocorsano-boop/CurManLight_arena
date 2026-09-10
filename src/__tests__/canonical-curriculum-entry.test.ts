import { describe, expect, it } from 'vitest';
import workspaceSource from '../features/curriculum/CurriculumWorkspace.tsx?raw';
import professionalReaderSource from '../features/curriculum/components/ProfessionalCurriculumReader.tsx?raw';
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
  it('presents the canonical curriculum as a professional publication instead of exposing the raw master', () => {
    expect(workspaceSource).toContain('ProfessionalCurriculumReader');
    expect(professionalReaderSource).toContain('data-canonical-curriculum-entry');
    expect(professionalReaderSource).toContain('data-curriculum-primary-task="consultation"');
    expect(professionalReaderSource).toContain('data-curriculum-presentation="professional-publication"');
    expect(professionalReaderSource).toContain('Curricolo verticale');
    expect(professionalReaderSource).toContain('Dipartimento Scientifico-Matematico-Tecnologico');
    expect(professionalReaderSource).toContain('Da esaminare e validare');
    expect(professionalReaderSource).toContain('Percorso 3–14');
    expect(professionalReaderSource).toContain('data-curriculum-mode="web"');
    expect(professionalReaderSource).toContain('data-curriculum-mode="document"');
    expect(professionalReaderSource).toContain('Vista web');
    expect(professionalReaderSource).toContain('Documento');
    expect(professionalReaderSource).toContain('data-curriculum-scope-summary');
    expect(professionalReaderSource).toContain('Infanzia · 3–5 anni');
    expect(professionalReaderSource).toContain('Primaria · I–V');
    expect(professionalReaderSource).toContain('Secondaria · I–III');
    expect(professionalReaderSource).not.toContain('Baseline corrente');
    expect(professionalReaderSource).not.toContain('master canonico');
  });

  it('exposes real mobile-safe navigation from the Technology section to the annual review', () => {
    expect(professionalReaderSource).toContain('data-secondary-curriculum-navigation');
    expect(professionalReaderSource).toContain('data-open-technology-review-class');
    expect(professionalReaderSource).toContain('Tecnologia — curricolo verticale');
    expect(professionalReaderSource).toContain('Se vuoi riesaminare Tecnologia, scegli l’annualità.');
    expect(professionalReaderSource).toContain('Classe II');
    expect(workspaceSource).toContain("setOrder('secondaria')");
    expect(workspaceSource).toContain("setDiscipline('tecnologia')");
    expect(workspaceSource).toContain("props.handleTabSwitch('revisione')");
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

  it('keeps canonical authority in the domain while Department documents remain presentation artifacts', () => {
    expect(currentSource).toContain('CAN-CURR-MASTER-00_Curricolo_verticale_integrale_unificato_3-14_2026-2027');
    expect(currentSource).toContain('12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4');

    expect(professionalReaderSource).toContain("DEPARTMENT_CURRICULUM_DOC_ID = '1VYNvik8oLAVWjwB5Y_Q960D62t-eUZRc'");
    expect(professionalReaderSource).toContain("DEPARTMENT_FOUNDATIONS_DOC_ID = '1KNjcyBzNAOsK-1FD1_HpasN9cyfASQTm'");
    expect(professionalReaderSource).not.toContain('12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4');
    expect(professionalReaderSource).not.toContain('INSTITUTE_CURRICULUM_CURRENT_SOURCE');

    expect(workspaceSource).toContain('ProfessionalCurriculumReader');
    expect(workspaceSource).not.toContain('CANONICAL_MASTER_URL');
    expect(workspaceSource).not.toContain('INSTITUTE_CURRICULUM_CURRENT_SOURCE.driveFileId');
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