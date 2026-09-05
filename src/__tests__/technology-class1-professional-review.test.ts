import { describe, expect, it } from 'vitest';
import {
  TECHNOLOGY_CLASS1_REVIEW,
  TECHNOLOGY_CLASS1_REVIEW_PROPOSALS,
  resolveOperationalReviewProposals,
} from '../domain/curriculum/validation/technologyClass1Review';
import reviewSurface from '../features/curriculum/components/RevisioneTab.tsx?raw';
import progressHook from '../features/curriculum/hooks/useCurriculumProgressStats.ts?raw';

describe('Tecnologia classe prima — validazione professionale reale', () => {
  it('collega il pilota alle identità Drive del fascicolo corrente', () => {
    expect(TECHNOLOGY_CLASS1_REVIEW.pilotId).toBe('TEC-SEC1-2026-01');
    expect(TECHNOLOGY_CLASS1_REVIEW.status).toBe('READY_FOR_HUMAN_DISCIPLINE_REVIEW');
    expect(TECHNOLOGY_CLASS1_REVIEW.humanOutcome).toBe('OPEN');
    expect(TECHNOLOGY_CLASS1_REVIEW.canonicalPromotionAuthorized).toBe(false);
    expect(TECHNOLOGY_CLASS1_REVIEW.source.driveFileId).toBe('1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf');
    expect(TECHNOLOGY_CLASS1_REVIEW.proposal.driveFileId).toBe('19nPCsAj_ItBscUwwcHwrVhxDbBy-MXIJ');
    expect(TECHNOLOGY_CLASS1_REVIEW.verticalMatrix.driveFileId).toBe('1CMSESN73HCi_2jM_tZYhN9hd6oWzyHgK');
    expect(TECHNOLOGY_CLASS1_REVIEW.validationGate.driveFileId).toBe('1rxKy2IDD5V7l4Nc1LfJeLr407ltfa_vbt_EFK54s7mU');
    expect(TECHNOLOGY_CLASS1_REVIEW.decisionRegister.driveFileId).toBe('1KmnrgWrNxVDUjOvdPo0oibqTvr1lQ72QepBE8KNsdZA');
  });

  it('sostituisce le proposte dimostrative con cinque decisioni curricolari reali', () => {
    expect(TECHNOLOGY_CLASS1_REVIEW_PROPOSALS).toHaveLength(5);
    expect(TECHNOLOGY_CLASS1_REVIEW_PROPOSALS.map((proposal) => proposal.id)).toEqual([
      'tec-sec1-2026-n1',
      'tec-sec1-2026-n2',
      'tec-sec1-2026-n3',
      'tec-sec1-2026-n4',
      'tec-sec1-2026-verticalita',
    ]);
    expect(TECHNOLOGY_CLASS1_REVIEW_PROPOSALS.map((proposal) => proposal.focus).join(' ')).not.toContain('Modellazione CAD 3D e Prototipazione');
    expect(TECHNOLOGY_CLASS1_REVIEW_PROPOSALS.every((proposal) => proposal.sourceRefs && proposal.sourceRefs.length > 0)).toBe(true);
    expect(TECHNOLOGY_CLASS1_REVIEW_PROPOSALS.every((proposal) => proposal.gateId)).toBe(true);
  });

  it('usa il pacchetto reale solo nel contesto Tecnologia/secondaria', () => {
    const fallback = [{ id: 'demo', focus: 'Demo', oldText: 'a', newText: 'b', notes: '' }];
    expect(resolveOperationalReviewProposals('Tecnologia', 'secondaria', fallback)).toBe(TECHNOLOGY_CLASS1_REVIEW_PROPOSALS);
    expect(resolveOperationalReviewProposals(' tecnologia ', 'secondaria', fallback)).toBe(TECHNOLOGY_CLASS1_REVIEW_PROPOSALS);
    expect(resolveOperationalReviewProposals('Matematica', 'secondaria', fallback)).toBe(fallback);
    expect(resolveOperationalReviewProposals('Tecnologia', 'primaria', fallback)).toBe(fallback);
  });

  it('mantiene la provenienza su richiesta senza caricare la vista ordinaria', () => {
    expect(reviewSurface).toContain("data-revision-secondary=\"context\"");
    expect(reviewSurface).toContain('current.oldLabel');
    expect(reviewSurface).toContain('current.newLabel');
    expect(reviewSurface).toContain('current.sourceRefs');
    expect(reviewSurface).toContain('current.gateId');
    expect(reviewSurface).toContain("current.keepLabel || 'Mantieni precedente'");
  });

  it('fa usare il resolver anche ai conteggi del contesto operativo', () => {
    expect(progressHook).toContain('resolveOperationalReviewProposals(disc, schoolOrder, fallback)');
    expect(progressHook).toContain('resolveOperationalReviewProposals(discipline, order, fallbackCurrent)');
  });
});
