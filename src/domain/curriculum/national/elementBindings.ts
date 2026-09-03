import type { NationalSourceLocator, SourceBindingStatus } from './dm2212025';

export type NationalCurriculumElementKind =
  | 'FIELD_OF_EXPERIENCE'
  | 'DISCIPLINE_SECTION'
  | 'FINALITY'
  | 'EXPECTED_COMPETENCE'
  | 'LEARNING_OBJECTIVE'
  | 'KNOWLEDGE_OR_CONTENT'
  | 'TRANSITION_PROFILE'
  | 'CROSS_DISCIPLINARY_FRAMEWORK';

export type CanonicalTextStatus =
  | 'NOT_IMPORTED'
  | 'SOURCE_LOCATED_ONLY'
  | 'HUMAN_VERIFIED_SOURCE_TEXT';

export interface NationalCurriculumElementBinding {
  elementId: string;
  segmentId: string;
  elementKind: NationalCurriculumElementKind;
  schoolOrder: 'infanzia' | 'primaria' | 'secondaria';
  /** Locator nella fonte ufficiale; obbligatorio anche prima di importare testo. */
  sourceLocator: NationalSourceLocator;
  sourceBindingStatus: SourceBindingStatus;
  verifiedByHuman: boolean;
  canonicalTextStatus: CanonicalTextStatus;
  /**
   * Collegamenti al dataset storico servono solo per confronto/migrazione.
   * Non attribuiscono autorità e non possono produrre SOURCE_VERIFIED.
   */
  legacyCandidateRefs?: readonly string[];
  notes?: string;
}

export interface ElementBindingAssessment {
  canTreatAsSourceVerified: boolean;
  canUseAsCanonicalSourceText: boolean;
  reason: string;
}

export function assessElementBinding(
  binding: NationalCurriculumElementBinding,
): ElementBindingAssessment {
  const sourceVerified =
    binding.sourceBindingStatus === 'SOURCE_VERIFIED' &&
    binding.verifiedByHuman === true &&
    Boolean(
      binding.sourceLocator.article ||
        binding.sourceLocator.section ||
        binding.sourceLocator.page,
    );

  const canonicalTextVerified =
    sourceVerified && binding.canonicalTextStatus === 'HUMAN_VERIFIED_SOURCE_TEXT';

  if (canonicalTextVerified) {
    return {
      canTreatAsSourceVerified: true,
      canUseAsCanonicalSourceText: true,
      reason: 'L’elemento è localizzato nella fonte ufficiale e il testo canonico è stato verificato da una persona.',
    };
  }

  if (sourceVerified) {
    return {
      canTreatAsSourceVerified: true,
      canUseAsCanonicalSourceText: false,
      reason: 'La provenienza è verificata, ma il testo canonico non è ancora stato verificato/importato.',
    };
  }

  return {
    canTreatAsSourceVerified: false,
    canUseAsCanonicalSourceText: false,
    reason: 'Serve un locator ufficiale verificato da una persona prima di attribuire autorità normativa all’elemento.',
  };
}

export function assertCanonicalSourceText(binding: NationalCurriculumElementBinding): void {
  const assessment = assessElementBinding(binding);
  if (!assessment.canUseAsCanonicalSourceText) {
    throw new Error(`CURRICULUM_SOURCE_BINDING_BLOCKED: ${assessment.reason}`);
  }
}
