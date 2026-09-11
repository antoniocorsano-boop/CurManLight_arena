import { describe, expect, it } from 'vitest';
import {
  TECHNOLOGY_CLASS1_REVIEW,
  TECHNOLOGY_CLASS1_REVIEW_PROPOSALS,
  TECHNOLOGY_CLASS1_REVIEW_PROPOSALS_R1,
  resolveOperationalReviewProposals,
} from '../domain/curriculum/validation/technologyClass1Review';
import reviewSurface from '../features/curriculum/components/RevisioneTab.tsx?raw';
import progressHook from '../features/curriculum/hooks/useCurriculumProgressStats.ts?raw';

describe('Tecnologia classe prima — validazione professionale reale', () => {
  it('collega la revisione R2 alle identità Drive e all’audit istruttorio', () => {
    expect(TECHNOLOGY_CLASS1_REVIEW.pilotId).toBe('TEC-SEC1-2026-01');
    expect(TECHNOLOGY_CLASS1_REVIEW.revision).toBe(2);
    expect(TECHNOLOGY_CLASS1_REVIEW.status).toBe('READY_FOR_HUMAN_DISCIPLINE_REVIEW');
    expect(TECHNOLOGY_CLASS1_REVIEW.humanOutcome).toBe('OPEN');
    expect(TECHNOLOGY_CLASS1_REVIEW.canonicalPromotionAuthorized).toBe(false);
    expect(TECHNOLOGY_CLASS1_REVIEW.decisionCarryForwardAuthorized).toBe(false);
    expect(TECHNOLOGY_CLASS1_REVIEW.source.driveFileId).toBe('1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf');
    expect(TECHNOLOGY_CLASS1_REVIEW.proposal.driveFileId).toBe('19nPCsAj_ItBscUwwcHwrVhxDbBy-MXIJ');
    expect(TECHNOLOGY_CLASS1_REVIEW.proposal.revision).toBe('1.1');
    expect(TECHNOLOGY_CLASS1_REVIEW.verticalMatrix.driveFileId).toBe('1CMSESN73HCi_2jM_tZYhN9hd6oWzyHgK');
    expect(TECHNOLOGY_CLASS1_REVIEW.verticalMatrix.revision).toBe('1.1');
    expect(TECHNOLOGY_CLASS1_REVIEW.instructionalAudit.driveFileId).toBe('1SZ_lmaYXNF2Fx8ro1C-hTh5iUH-riECcqyZtRx9JRPM');
    expect(TECHNOLOGY_CLASS1_REVIEW.instructionalAudit.status).toBe('CORRECTIONS_APPLIED');
    expect(TECHNOLOGY_CLASS1_REVIEW.validationGate.driveFileId).toBe('1rxKy2IDD5V7l4Nc1LfJeLr407ltfa_vbt_EFK54s7mU');
    expect(TECHNOLOGY_CLASS1_REVIEW.decisionRegister.driveFileId).toBe('1KmnrgWrNxVDUjOvdPo0oibqTvr1lQ72QepBE8KNsdZA');
  });

  it('mantiene la R1 come storico semantico e usa nuovi ID per la R2', () => {
    expect(TECHNOLOGY_CLASS1_REVIEW_PROPOSALS_R1.map((proposal) => proposal.id)).toEqual([
      'tec-sec1-2026-n1',
      'tec-sec1-2026-n2',
      'tec-sec1-2026-n3',
      'tec-sec1-2026-n4',
      'tec-sec1-2026-verticalita',
    ]);
    expect(TECHNOLOGY_CLASS1_REVIEW_PROPOSALS.map((proposal) => proposal.id)).toEqual([
      'tec-sec1-2026-r2-n1',
      'tec-sec1-2026-r2-n2',
      'tec-sec1-2026-r2-n3',
      'tec-sec1-2026-r2-n4',
      'tec-sec1-2026-r2-verticalita',
    ]);
    const r1Ids = new Set(TECHNOLOGY_CLASS1_REVIEW_PROPOSALS_R1.map((proposal) => proposal.id));
    expect(TECHNOLOGY_CLASS1_REVIEW_PROPOSALS.every((proposal) => !r1Ids.has(proposal.id))).toBe(true);
    expect(TECHNOLOGY_CLASS1_REVIEW.previousRevision.status).toBe('SUPERSEDED_INSTRUCTIONAL_TEXT_PRESERVED');
  });

  it('espone cinque decisioni reali R2 con provenienza e nessun contenuto dimostrativo', () => {
    expect(TECHNOLOGY_CLASS1_REVIEW_PROPOSALS).toHaveLength(5);
    expect(TECHNOLOGY_CLASS1_REVIEW_PROPOSALS.map((proposal) => proposal.focus).join(' ')).not.toContain('Modellazione CAD 3D e Prototipazione');
    expect(TECHNOLOGY_CLASS1_REVIEW_PROPOSALS.every((proposal) => proposal.sourceRefs?.some((ref) => ref.includes('AUD-CURR-TEC-SEC1-01')))).toBe(true);
    expect(TECHNOLOGY_CLASS1_REVIEW_PROPOSALS.every((proposal) => proposal.gateId)).toBe(true);
  });

  it('riscalibra N4 su sistemi, dati e processi senza inventare un quarto nucleo nazionale', () => {
    const n4 = TECHNOLOGY_CLASS1_REVIEW_PROPOSALS.find((proposal) => proposal.id === 'tec-sec1-2026-r2-n4');
    expect(n4).toBeDefined();
    expect(n4?.newText).toContain('funzionamento essenziale di un sistema informatico');
    expect(n4?.newText).toContain('Internet, Web e servizi');
    expect(n4?.newText).toContain('affidabilità delle informazioni');
    expect(n4?.contextSummary).toContain('Non costituisce un quarto nucleo nazionale autonomo');
  });

  it('usa il pacchetto R2 solo nel contesto Tecnologia/secondaria', () => {
    const fallback = [{ id: 'demo', focus: 'Demo', oldText: 'a', newText: 'b', notes: '' }];
    expect(resolveOperationalReviewProposals('Tecnologia', 'secondaria', fallback)).toBe(TECHNOLOGY_CLASS1_REVIEW_PROPOSALS);
    expect(resolveOperationalReviewProposals(' tecnologia ', 'secondaria', fallback)).toBe(TECHNOLOGY_CLASS1_REVIEW_PROPOSALS);
    expect(resolveOperationalReviewProposals('Matematica', 'secondaria', fallback)).toBe(fallback);
    expect(resolveOperationalReviewProposals('Tecnologia', 'primaria', fallback)).toBe(fallback);
  });

  it('mantiene la provenienza su richiesta senza caricare la vista ordinaria', () => {
    expect(reviewSurface).toContain('data-revision-secondary="context"');
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
