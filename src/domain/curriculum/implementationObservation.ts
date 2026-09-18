import type {
  DidacticBinding,
  ImplementationObservation,
  ImplementationSignal,
  UdaModel,
} from '../../types/curriculum';

export const IMPLEMENTATION_SIGNAL_LABELS: Record<ImplementationSignal, string> = {
  ADEQUATE: 'Adeguato',
  TOO_EARLY: 'Troppo anticipato',
  TOO_LATE: 'Troppo tardivo',
  DUPLICATED: 'Ripetitivo o già affrontato',
  MISSING_PREREQUISITE: 'Prerequisito mancante',
  WEAK_EVIDENCE: 'Evidenza poco utile',
  UNSUSTAINABLE_LOAD: 'Carico non sostenibile',
  EFFECTIVE_VERTICAL_LINK: 'Raccordo verticale efficace',
  OTHER: 'Altro elemento da riesaminare',
};

export interface BuildImplementationObservationInput {
  uda: UdaModel;
  signal: ImplementationSignal;
  note?: string;
  personalDataAbsentConfirmed: boolean;
  createdAt?: string;
}

const normalizeNote = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 600);
};

const getCurrentDidacticBinding = (uda: UdaModel): DidacticBinding => {
  const binding = uda.curriculumBindings?.[0];
  if (!binding) {
    throw new Error('MISSING_DIDACTIC_BINDING');
  }
  return binding;
};

export function buildImplementationObservation({
  uda,
  signal,
  note,
  personalDataAbsentConfirmed,
  createdAt = new Date().toISOString(),
}: BuildImplementationObservationInput): ImplementationObservation {
  if (!personalDataAbsentConfirmed) {
    throw new Error('PERSONAL_DATA_ABSENCE_NOT_CONFIRMED');
  }

  const normalizedNote = normalizeNote(note);
  if (signal === 'OTHER' && !normalizedNote) {
    throw new Error('OTHER_SIGNAL_REQUIRES_NOTE');
  }

  const binding = getCurrentDidacticBinding(uda);

  return {
    id: `IO:${uda.id}:${createdAt}`,
    kind: 'IMPLEMENTATION_OBSERVATION',
    signal,
    note: normalizedNote,
    didacticBindingId: binding.id,
    curriculumUnit: { ...binding.curriculumUnit },
    sourceArtifact: {
      type: 'uda',
      id: uda.id,
      title: uda.title,
    },
    personalDataDeclaration: 'DECLARED_ABSENT',
    containsStudentPersonalData: false,
    automaticCurriculumChange: false,
    reviewState: 'RECORDED_FOR_AGGREGATION',
    createdAt,
  };
}

export function countImplementationSignals(
  observations: ImplementationObservation[] | undefined,
): Partial<Record<ImplementationSignal, number>> {
  const counts: Partial<Record<ImplementationSignal, number>> = {};
  for (const observation of observations ?? []) {
    counts[observation.signal] = (counts[observation.signal] ?? 0) + 1;
  }
  return counts;
}
