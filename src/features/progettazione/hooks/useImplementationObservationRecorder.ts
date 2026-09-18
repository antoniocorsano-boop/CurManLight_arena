import { useCallback } from 'react';
import { buildImplementationObservation } from '../../../domain/curriculum/implementationObservation';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import type { ImplementationSignal, UdaModel } from '../../../types/curriculum';

export interface RecordImplementationObservationInput {
  uda: UdaModel;
  signal: ImplementationSignal;
  note?: string;
  personalDataAbsentConfirmed: boolean;
}

export function useImplementationObservationRecorder() {
  const recordImplementationObservation = useCallback((input: RecordImplementationObservationInput) => {
    const observation = buildImplementationObservation(input);
    const updatedUda: UdaModel = {
      ...input.uda,
      implementationObservations: [
        ...(input.uda.implementationObservations ?? []),
        observation,
      ],
      updatedAt: observation.createdAt,
    };

    useCurriculumStore.setState((state) => ({
      savedUda: state.savedUda.map((uda) => uda.id === updatedUda.id ? updatedUda : uda),
    }));

    return { observation, updatedUda };
  }, []);

  return { recordImplementationObservation };
}
