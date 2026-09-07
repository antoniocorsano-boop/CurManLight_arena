import { describe, expect, it } from 'vitest';
import { buildDidacticBinding } from '../domain/curriculum/didacticBinding';
import { buildImplementationObservation } from '../domain/curriculum/implementationObservation';
import {
  buildExternalNormativeRevisionTrigger,
  buildInstituteNeedRevisionTrigger,
  buildPeriodicReviewRevisionTrigger,
  buildPracticeRevisionTrigger,
  isQualifiedRevisionTrigger,
  qualifyPracticeSignal,
} from '../domain/curriculum/revisionTrigger';
import type { CurriculumUnitReference, ImplementationSignal, UdaModel } from '../types/curriculum';
import triggerPanelRaw from '../features/progettazione/components/PracticeRevisionTriggerPanel.tsx?raw';
import udaModalsRaw from '../features/progettazione/components/UdaModals.tsx?raw';
import storeRaw from '../store/useCurriculumStore.ts?raw';

const makeUda = (id = 'uda-trigger-1'): UdaModel => ({
  id,
  title: `UDA ${id}`,
  discipline: 'tecnologia',
  order: 'secondaria',
  period: 'Novembre',
  hours: 8,
  status: 'bozza',
  traguardi: ['Traguardo'],
  obiettivi: ['Obiettivo'],
  evidenze: ['Evidenza'],
  realTask: 'Compito',
  notes: '',
  curriculumBindings: [buildDidacticBinding({
    targetType: 'uda',
    order: 'secondaria',
    targetClass: '1',
    disciplineOrField: 'tecnologia',
    createdAt: '2026-09-07T03:00:00.000Z',
  })],
  createdAt: '2026-09-07T03:00:00.000Z',
});

const makeCurriculumUnit = (): CurriculumUnitReference => {
  const binding = makeUda().curriculumBindings?.[0];
  if (!binding) throw new Error('binding fixture mancante');
  return binding.curriculumUnit;
};

const makeObservation = (
  signal: ImplementationSignal,
  id: string,
  uda = makeUda(id),
) => buildImplementationObservation({
  uda,
  signal,
  personalDataAbsentConfirmed: true,
  note: signal === 'OTHER' ? 'Motivo professionale specifico.' : undefined,
  createdAt: `2026-09-07T03:${id.endsWith('2') ? '32' : '31'}:00.000Z`,
});

describe('RevisionTrigger PRACTICE_SIGNAL', () => {
  it('does not qualify one isolated problematic observation without an explicit reason', () => {
    const observation = makeObservation('MISSING_PREREQUISITE', 'uda-trigger-1');
    const result = qualifyPracticeSignal([observation], observation.curriculumUnit.unitKey);

    expect(result.qualified).toBe(false);
    expect(result.recurringCount).toBe(1);
  });

  it('qualifies two recurring problematic signals on the same curriculum unit', () => {
    const first = makeObservation('MISSING_PREREQUISITE', 'uda-trigger-1');
    const second = makeObservation('MISSING_PREREQUISITE', 'uda-trigger-2');
    const result = qualifyPracticeSignal([first, second], first.curriculumUnit.unitKey);

    expect(result.qualified).toBe(true);
    expect(result.basis).toBe('AGGREGATED_PRACTICE_SIGNAL');
    expect(result.recurringSignal).toBe('MISSING_PREREQUISITE');
    expect(result.recurringCount).toBe(2);
  });

  it('allows one observation only when a professional reason is explicitly recorded', () => {
    const observation = makeObservation('TOO_EARLY', 'uda-trigger-1');
    const result = qualifyPracticeSignal(
      [observation],
      observation.curriculumUnit.unitKey,
      'La sequenza richiede un riesame perché il prerequisito compare più avanti nel percorso.',
    );

    expect(result.qualified).toBe(true);
    expect(result.basis).toBe('EXPLICIT_PROFESSIONAL_REASON');
  });

  it('does not auto-qualify positive signals even when recurring', () => {
    const adequate1 = makeObservation('ADEQUATE', 'uda-trigger-1');
    const adequate2 = makeObservation('ADEQUATE', 'uda-trigger-2');
    const vertical1 = makeObservation('EFFECTIVE_VERTICAL_LINK', 'uda-trigger-3');
    const vertical2 = makeObservation('EFFECTIVE_VERTICAL_LINK', 'uda-trigger-4');

    expect(qualifyPracticeSignal([adequate1, adequate2], adequate1.curriculumUnit.unitKey).qualified).toBe(false);
    expect(qualifyPracticeSignal([vertical1, vertical2], vertical1.curriculumUnit.unitKey).qualified).toBe(false);
  });

  it('builds a qualified trigger tied to master 1.3 and H1 without automatic consequences', () => {
    const first = makeObservation('DUPLICATED', 'uda-trigger-1');
    const second = makeObservation('DUPLICATED', 'uda-trigger-2');
    const trigger = buildPracticeRevisionTrigger({
      observations: [first, second],
      curriculumUnitKey: first.curriculumUnit.unitKey,
      recordedAt: '2026-09-07T04:00:00.000Z',
    });

    expect(trigger.kind).toBe('REVISION_TRIGGER');
    expect(trigger.triggerType).toBe('PRACTICE_SIGNAL');
    expect(trigger.qualificationState).toBe('QUALIFIED_FOR_TARGETED_REVIEW');
    expect(trigger.qualificationBasis).toBe('AGGREGATED_PRACTICE_SIGNAL');
    expect(trigger.currentMaster.id).toBe('CAN-CURR-MASTER-00');
    expect(trigger.currentMaster.version).toBe('1.3');
    expect(trigger.cycleReentryPhase).toBe('H1_APPLICABLE_CURRICULUM');
    expect(trigger.automaticCurriculumChange).toBe(false);
    expect(trigger.automaticReviewCaseOpening).toBe(false);
    expect(trigger.parallelCurriculumBaselineCreation).toBe(false);
    expect(isQualifiedRevisionTrigger(trigger)).toBe(true);
  });

  it('keeps observations from a different curriculum unit outside the requested scope', () => {
    const first = makeObservation('TOO_LATE', 'uda-trigger-1');
    const differentUda = makeUda('uda-trigger-2');
    const differentBinding = differentUda.curriculumBindings?.[0];
    if (!differentBinding) throw new Error('binding fixture mancante');
    differentUda.curriculumBindings = [{
      ...differentBinding,
      curriculumUnit: {
        ...differentBinding.curriculumUnit,
        unitKey: `${differentBinding.curriculumUnit.unitKey}:different`,
      },
    }];
    const second = makeObservation('TOO_LATE', 'uda-trigger-2', differentUda);

    const trigger = buildPracticeRevisionTrigger({
      observations: [first, second],
      curriculumUnitKey: first.curriculumUnit.unitKey,
      explicitProfessionalReason: 'Riesame richiesto.',
    });
    expect(trigger.originOrSource.observationIds).toEqual([first.id]);
  });

  it('exposes qualification as a reason for review, not as an automatic review case', () => {
    expect(triggerPanelRaw).toContain('Valuta un possibile riesame');
    expect(triggerPanelRaw).toContain('Arena non apre revisioni in automatico.');
    expect(triggerPanelRaw).toContain('Perché ritieni necessario il riesame?');
    expect(triggerPanelRaw).toContain('Registra il motivo di riesame');
    expect(triggerPanelRaw).toContain('Motivo di riesame ≠ caso di revisione ≠ modifica del master.');
    expect(udaModalsRaw).toContain('<PracticeRevisionTriggerPanel uda={selectedUda} />');
  });

  it('persists revision triggers in the same Arena state and backup boundary', () => {
    expect(storeRaw).toContain("'revisionTriggers',");
    expect(storeRaw).toContain('revisionTriggers: []');
    expect(storeRaw).toContain('revisionTriggers: []');
  });
});

describe('RevisionTrigger altre cause previste dal ciclo', () => {
  it('qualifies an external normative trigger only with qualified source and explicit applicability', () => {
    const curriculumUnit = makeCurriculumUnit();
    const trigger = buildExternalNormativeRevisionTrigger({
      curriculumUnit,
      sourceReference: 'Circolare applicabile al curricolo verticale',
      sourceType: 'CIRCULAR',
      sourceQualification: 'QUALIFIED',
      applicabilityAssessment: 'La fonte incide sulla stessa unità curricolare e richiede un riesame mirato.',
      recordedAt: '2026-09-07T05:00:00.000Z',
    });

    expect(trigger.triggerType).toBe('EXTERNAL_NORMATIVE');
    expect(trigger.originOrSource.kind).toBe('EXTERNAL_NORMATIVE_SOURCE');
    expect(trigger.originOrSource.sourceQualification).toBe('QUALIFIED');
    expect(trigger.qualificationBasis).toBe('QUALIFIED_EXTERNAL_NORMATIVE_SOURCE');
    expect(isQualifiedRevisionTrigger(trigger)).toBe(true);

    expect(() => buildExternalNormativeRevisionTrigger({
      curriculumUnit,
      sourceReference: 'Fonte non qualificata',
      sourceType: 'OTHER',
      sourceQualification: 'UNQUALIFIED',
      applicabilityAssessment: 'Potenzialmente pertinente.',
    })).toThrowError('EXTERNAL_NORMATIVE_SOURCE_NOT_QUALIFIED');

    expect(() => buildExternalNormativeRevisionTrigger({
      curriculumUnit,
      sourceReference: 'Circolare qualificata',
      sourceType: 'CIRCULAR',
      sourceQualification: 'QUALIFIED',
      applicabilityAssessment: '   ',
    })).toThrowError('EXTERNAL_NORMATIVE_APPLICABILITY_REQUIRED');
  });

  it('keeps an institute need explicitly non-national', () => {
    const curriculumUnit = makeCurriculumUnit();
    const trigger = buildInstituteNeedRevisionTrigger({
      curriculumUnit,
      needReference: 'Esigenza organizzativa curricolare dell’Istituto',
      needStatement: 'Il Dipartimento rileva la necessità di riesaminare il raccordo tra le annualità.',
      declaredNonNational: true,
      recordedAt: '2026-09-07T05:05:00.000Z',
    });

    expect(trigger.triggerType).toBe('INSTITUTE_NEED');
    expect(trigger.originOrSource.nationalSource).toBe(false);
    expect(trigger.qualificationBasis).toBe('EXPLICIT_INSTITUTE_NEED');
    expect(isQualifiedRevisionTrigger(trigger)).toBe(true);

    expect(() => buildInstituteNeedRevisionTrigger({
      curriculumUnit,
      needReference: 'Esigenza senza classificazione corretta',
      needStatement: 'Riesame richiesto.',
      declaredNonNational: false,
    })).toThrowError('INSTITUTE_NEED_MUST_REMAIN_NON_NATIONAL');
  });

  it('does not turn elapsed time alone into a periodic review trigger', () => {
    const curriculumUnit = makeCurriculumUnit();

    expect(() => buildPeriodicReviewRevisionTrigger({
      curriculumUnit,
      reviewCycle: 'ANNUAL',
      reviewReason: '   ',
    })).toThrowError('PERIODIC_REVIEW_REASON_REQUIRED');

    const trigger = buildPeriodicReviewRevisionTrigger({
      curriculumUnit,
      reviewCycle: 'ANNUAL',
      reviewReason: 'Verificare la continuità verticale dopo il ciclo annuale di attuazione.',
      recordedAt: '2026-09-07T05:10:00.000Z',
    });

    expect(trigger.triggerType).toBe('PERIODIC_REVIEW');
    expect(trigger.qualificationBasis).toBe('PERIODIC_REVIEW_WITH_EXPLICIT_REASON');
    expect(trigger.professionalReason).toContain('continuità verticale');
    expect(isQualifiedRevisionTrigger(trigger)).toBe(true);
  });

  it('keeps all trigger causes scoped to the current master and without automatic consequences', () => {
    const curriculumUnit = makeCurriculumUnit();
    const triggers = [
      buildExternalNormativeRevisionTrigger({
        curriculumUnit,
        sourceReference: 'D.M. qualificato',
        sourceType: 'DECREE',
        sourceQualification: 'QUALIFIED',
        applicabilityAssessment: 'Applicabile alla specifica unità.',
      }),
      buildInstituteNeedRevisionTrigger({
        curriculumUnit,
        needReference: 'Esigenza interna',
        needStatement: 'Raccordo verticale da riesaminare.',
        declaredNonNational: true,
      }),
      buildPeriodicReviewRevisionTrigger({
        curriculumUnit,
        reviewCycle: 'MULTIYEAR',
        reviewReason: 'Riesame motivato della progressione dopo il periodo previsto.',
      }),
    ];

    for (const trigger of triggers) {
      expect(trigger.currentMaster.id).toBe('CAN-CURR-MASTER-00');
      expect(trigger.currentMaster.version).toBe('1.3');
      expect(trigger.potentialCurriculumScope.curriculumUnitKey).toBe(curriculumUnit.unitKey);
      expect(trigger.cycleReentryPhase).toBe('H1_APPLICABLE_CURRICULUM');
      expect(trigger.automaticCurriculumChange).toBe(false);
      expect(trigger.automaticReviewCaseOpening).toBe(false);
      expect(trigger.parallelCurriculumBaselineCreation).toBe(false);
    }
  });
});
