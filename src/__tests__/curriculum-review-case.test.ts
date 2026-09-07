import { describe, expect, it } from 'vitest';
import { resolveCurriculumUnitReference } from '../domain/curriculum/didacticBinding';
import {
  buildCurriculumReviewCase,
  evaluateCurriculumReviewCaseReadiness,
} from '../domain/curriculum/reviewCase';
import { buildInstituteNeedRevisionTrigger } from '../domain/curriculum/revisionTrigger';
import panelSource from '../features/curriculum/components/CurriculumReviewCasePanel.tsx?raw';
import workspaceSource from '../features/beta/RevisionWorkspace.tsx?raw';
import storeSource from '../store/useCurriculumStore.ts?raw';

const unit = resolveCurriculumUnitReference({
  order: 'secondaria',
  targetClass: '1',
  disciplineOrField: 'tecnologia',
});

const trigger = buildInstituteNeedRevisionTrigger({
  curriculumUnit: unit,
  needReference: 'Dipartimento Tecnologia',
  needStatement: 'Verificare la progressione delle due schede interessate prima di formulare qualunque modifica.',
  declaredNonNational: true,
  recordedAt: '2026-09-07T08:00:00.000Z',
});

describe('CurriculumReviewCase — apertura mirata e fail-closed', () => {
  it('blocks opening until at least one known proposal and an explicit scope reason are provided', () => {
    const blocked = evaluateCurriculumReviewCaseReadiness({
      trigger,
      curriculumUnit: unit,
      availableProposalRefs: ['it-sec-1', 'it-sec-2'],
      selectedProposalRefs: [],
      scopeReason: '',
    });

    expect(blocked.state).toBe('BLOCKED');
    expect(blocked.blockers).toContain('NO_TARGETED_PROPOSALS');
    expect(blocked.blockers).toContain('CASE_SCOPE_REASON_REQUIRED');

    const unknown = evaluateCurriculumReviewCaseReadiness({
      trigger,
      curriculumUnit: unit,
      availableProposalRefs: ['it-sec-1', 'it-sec-2'],
      selectedProposalRefs: ['not-current'],
      scopeReason: 'Perimetro esplicito.',
    });
    expect(unknown.blockers).toContain('UNKNOWN_TARGETED_PROPOSAL');
  });

  it('opens a frozen targeted case only after all readiness checks pass', () => {
    const reviewCase = buildCurriculumReviewCase({
      trigger,
      curriculumUnit: unit,
      availableProposalRefs: ['it-sec-1', 'it-sec-2'],
      selectedProposalRefs: ['it-sec-2'],
      scopeReason: 'Riaprire soltanto la seconda scheda perché è quella direttamente interessata dall’esigenza registrata.',
      openedAt: '2026-09-07T08:15:00.000Z',
      actorId: 'teacher-2',
      roleContext: 'docente',
    });

    expect(reviewCase.kind).toBe('CURRICULUM_REVIEW_CASE');
    expect(reviewCase.originTriggerSnapshot.id).toBe(trigger.id);
    expect(reviewCase.targetedProposalRefs).toEqual(['it-sec-2']);
    expect(reviewCase.targetScopeFrozen).toBe(true);
    expect(reviewCase.readinessAtOpening.state).toBe('READY_TO_OPEN');
    expect(reviewCase.caseState).toBe('OPEN_AT_APPLICABLE_CURRICULUM');
    expect(reviewCase.cycleReentryPhase).toBe('H1_APPLICABLE_CURRICULUM');
    expect(reviewCase.currentHumanPhase).toBe('H1_APPLICABLE_CURRICULUM');
    expect(reviewCase.professionalValidationState).toBe('NOT_STARTED');
    expect(reviewCase.workSession).toBeUndefined();
    expect(reviewCase.explicitHumanOpening).toBe(true);
    expect(reviewCase.openedBy.identityState).toBe('AUTHENTICATED_SESSION');
    expect(reviewCase.openedBy.institutionalAuthorityInferred).toBe(false);
    expect(reviewCase.automaticProfessionalContributionReuse).toBe(false);
    expect(reviewCase.decisionCarryForwardFromPreviousReview).toBe(false);
    expect(reviewCase.automaticCurriculumChange).toBe(false);
    expect(reviewCase.automaticTeamOutcome).toBe(false);
    expect(reviewCase.automaticInstitutionalDecision).toBe(false);
    expect(reviewCase.automaticMasterPromotion).toBe(false);
    expect(reviewCase.parallelCurriculumBaselineCreation).toBe(false);
  });

  it('fails closed on stale master scope and duplicate opening for the same trigger', () => {
    const staleUnit = { ...unit, masterVersion: '1.4' };
    const stale = evaluateCurriculumReviewCaseReadiness({
      trigger,
      curriculumUnit: staleUnit,
      availableProposalRefs: ['it-sec-1'],
      selectedProposalRefs: ['it-sec-1'],
      scopeReason: 'Perimetro esplicito.',
    });
    expect(stale.blockers).toContain('CURRENT_MASTER_MISMATCH');

    const first = buildCurriculumReviewCase({
      trigger,
      curriculumUnit: unit,
      availableProposalRefs: ['it-sec-1'],
      selectedProposalRefs: ['it-sec-1'],
      scopeReason: 'Riapertura circoscritta alla scheda direttamente interessata.',
      openedAt: '2026-09-07T08:20:00.000Z',
    });

    expect(() => buildCurriculumReviewCase({
      trigger,
      curriculumUnit: unit,
      availableProposalRefs: ['it-sec-1'],
      selectedProposalRefs: ['it-sec-1'],
      scopeReason: 'Seconda apertura non ammessa.',
      existingCases: [first],
      openedAt: '2026-09-07T08:21:00.000Z',
    })).toThrowError('REVIEW_CASE_ALREADY_OPEN_FOR_TRIGGER');
  });

  it('keeps case opening inside Riesame and separates opening from the new professional session', () => {
    expect(workspaceSource).toContain('<CurriculumReviewCasePanel');
    expect(workspaceSource).toContain('data-curriculum-work-session');
    expect(panelSource).toContain('Apri solo il riesame necessario');
    expect(panelSource).toContain('data-review-case-readiness');
    expect(panelSource).toContain('data-human-next-action="open-targeted-review-case"');
    expect(panelSource).toContain('data-human-next-action="start-case-scoped-work-session"');
    expect(panelSource).toContain('Avvia il riesame mirato');
    expect(panelSource).toContain('Nessuna scelta o condivisione precedente viene importata.');
    expect(panelSource).not.toContain("setDecision(");
    expect(panelSource).not.toContain('TeamContributionPublisher');
  });

  it('persists review cases with the Arena state and clears them only with explicit reset', () => {
    expect(storeSource).toContain("'curriculumReviewCases',");
    expect(storeSource).toContain('curriculumReviewCases: [],');
    expect(storeSource).toContain('revisionTriggers: [], curriculumReviewCases: []');
  });
});
