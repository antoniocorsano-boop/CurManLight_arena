import {
  ARENA_PROCESS_PIPELINE,
  type ArenaProcessId,
  type ArenaProcessImplementationStatus,
} from './processRoleModel';

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
    return 'Il processo dispone di un percorso runtime implementato; resta soggetto ai propri gate e alla validazione umana prevista.';
  }
  if (reality === 'PARTIAL') {
    return 'Il processo è disponibile solo in parte e non può essere considerato completo nell’intero ciclo istituzionale.';
  }
  return 'Il processo non dispone di un percorso runtime utilizzabile.';
};

/**
 * R7 reality gate.
 *
 * This assessment deliberately derives its verdict from the canonical process
 * implementation statuses. It must never infer an end-to-end PASS from tests,
 * documentation, planned effects, exports, or decision receipts alone.
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
    steps,
    blockingProcessIds,
    executableProcessIds,
    requiresRuntimeRemediation: blockingProcessIds.length > 0,
    requiresSameShaReleaseValidation: true,
    requiresRepresentativeHumanAcceptance: true,
  };
};
