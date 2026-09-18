import { useMemo } from 'react';
import {
  buildPracticeRevisionTrigger,
  qualifyPracticeSignal,
} from '../../../domain/curriculum/revisionTrigger';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import type { ImplementationObservation, RevisionTrigger, UdaModel } from '../../../types/curriculum';

const collectAllObservations = (savedUda: UdaModel[]): ImplementationObservation[] => (
  savedUda.flatMap((uda) => uda.implementationObservations ?? [])
);

export function usePracticeRevisionTrigger(uda: UdaModel) {
  const savedUda = useCurriculumStore((state) => state.savedUda);
  const revisionTriggers = useCurriculumStore((state) => state.revisionTriggers);
  const unitKey = uda.curriculumBindings?.[0]?.curriculumUnit.unitKey;
  const masterVersion = uda.curriculumBindings?.[0]?.curriculumUnit.masterVersion;

  const allObservations = useMemo(() => collectAllObservations(savedUda), [savedUda]);
  const baseQualification = useMemo(() => (
    unitKey
      ? qualifyPracticeSignal(allObservations, unitKey)
      : { qualified: false, recurringCount: 0, relatedObservations: [] }
  ), [allObservations, unitKey]);

  const currentTrigger = useMemo(() => (
    unitKey && masterVersion
      ? revisionTriggers.find((trigger) => (
          trigger.triggerType === 'PRACTICE_SIGNAL'
          && trigger.potentialCurriculumScope.curriculumUnitKey === unitKey
          && trigger.currentMaster.version === masterVersion
        ))
      : undefined
  ), [masterVersion, revisionTriggers, unitKey]);

  const qualifyWithReason = (explicitProfessionalReason?: string): RevisionTrigger => {
    if (!unitKey) throw new Error('MISSING_DIDACTIC_BINDING');
    if (currentTrigger) return currentTrigger;

    const trigger = buildPracticeRevisionTrigger({
      observations: allObservations,
      curriculumUnitKey: unitKey,
      explicitProfessionalReason,
    });

    useCurriculumStore.setState((state) => ({
      revisionTriggers: [...state.revisionTriggers, trigger],
    }));

    return trigger;
  };

  return {
    unitKey,
    baseQualification,
    currentTrigger,
    qualifyWithReason,
  };
}
