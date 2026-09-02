import {
  ARENA_PROCESS_PIPELINE,
  type ArenaProcessId,
  type ArenaProcessImplementationStatus,
} from './processRoleModel';
import {
  CURRICULUM_ANALYSIS_CANONICAL_SCOPE,
  CURRICULUM_ANALYSIS_EXCLUDED_SCHOOL_ORDERS,
} from './curriculumAnalysis';

export type AdoptionPipelineReality =
  | 'EXECUTABLE'
  | 'PARTIAL'
  | 'BLOCKED';

export type AdoptionFlowVerdict =
  | 'ADOPTION_FLOW_VALIDATED'
  | 'ADOPTION_FLOW_BLOCKED';

export interface AdoptionPipelineStepAssessment {
  processId: ArenaProcessId;
  label: string;
  implementationStatus: ArenaProcessImplementationStatus;
  reality: AdoptionPipelineReality;
  consequential: boolean;
  reason: string;
}

export interface EndToEndAdoptionAssessment {
  verdict: AdoptionFlowVerdict;
  curriculumScope: typeof CURRICULUM_ANALYSIS_CANONICAL_SCOPE;
  excludedSchoolOrders: typeof CURRICULUM_ANALYSIS_EXCLUDED_SCHOOL_ORDERS;
  steps: readonly AdoptionPipelineStepAssessment[];
  blockingProcessIds: readonly ArenaProcessId[];
  executableProcessIds: readonly ArenaProcessId[];
  requiresRuntimeRemediation: boolean;
  requiresSameShaReleaseValidation: true;
  requiresRepresentativeHumanAcceptance: true;
}

const classifyProcessReality = (
  implementationStatus: ArenaProcessImplementationStatus,
): AdoptionPipelineReality => {
  if (implementationStatus === 'IMPLEMENTED') return 'EXECUTABLE';
  if (implementationStatus === 'PARTIAL') return 'PARTIAL';
  return 'BLOCKED';
};

const explainReality = (reality: AdoptionPipelineReality): string => {
  if (reality === 'EXECUTABLE') {
    return 'Il processo dispone di un percorso runtime implementato nel perimetro dichiarato; resta soggetto ai propri gate e alla validazione umana prevista.';
  }
  if (reality === 'PARTIAL') {
    return 'Il processo è disponibile solo in parte e non può essere considerato completo nell’intero ciclo istituzionale.';
  }
  return 'Il processo non dispone di un percorso runtime utilizzabile.';
};

/**
 * R7 reality gate.
 *
 * The current executable curriculum-analysis perimeter is explicitly the
 * D.M. 221 first cycle (primaria + secondaria). Infanzia is excluded until its
 * legacy discipline projection is migrated to canonical fields of experience.
 * Therefore ADOPTION_FLOW_VALIDATED is never a claim of infanzia coverage.
 */
export const assessEndToEndAdoptionFlow = (): EndToEndAdoptionAssessment => {
  const steps = ARENA_PROCESS_PIPELINE.map((process) => {
    const reality = classifyProcessReality(process.implementationStatus);
    return {
      processId: process.id,
      label: process.label,
      implementationStatus: process.implementationStatus,
      reality,
      consequential: process.consequential,
      reason: explainReality(reality),
    } satisfies AdoptionPipelineStepAssessment;
  });

  const blockingProcessIds = steps
    .filter((step) => step.reality !== 'EXECUTABLE')
    .map((step) => step.processId);
  const executableProcessIds = steps
    .filter((step) => step.reality === 'EXECUTABLE')
    .map((step) => step.processId);

  return {
    verdict: blockingProcessIds.length === 0
      ? 'ADOPTION_FLOW_VALIDATED'
      : 'ADOPTION_FLOW_BLOCKED',
    curriculumScope: CURRICULUM_ANALYSIS_CANONICAL_SCOPE,
    excludedSchoolOrders: CURRICULUM_ANALYSIS_EXCLUDED_SCHOOL_ORDERS,
    steps,
    blockingProcessIds,
    executableProcessIds,
    requiresRuntimeRemediation: blockingProcessIds.length > 0,
    requiresSameShaReleaseValidation: true,
    requiresRepresentativeHumanAcceptance: true,
  };
};