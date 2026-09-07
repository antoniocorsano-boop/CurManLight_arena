import { describe, expect, it } from 'vitest';
import { buildDidacticBinding } from '../domain/curriculum/didacticBinding';
import { buildImplementationObservation } from '../domain/curriculum/implementationObservation';
import {
  buildPracticeRevisionTrigger,
  qualifyPracticeSignal,
} from '../domain/curriculum/revisionTrigger';
import type { ImplementationSignal, UdaModel } from '../types/curriculum';
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
  });

  it('keeps mixed curriculum scope fail-closed', () => {
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

    expect(() => buildPracticeRevisionTrigger({
      observations: [first, second],
      curriculumUnitKey: first.curriculumUnit.unitKey,
      explicitProfessionalReason: 'Riesame richiesto.',
    })).not.toThrow();
    // The second observation is outside the requested unit and is therefore not silently merged.
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
