import {
  ARENA_PROCESS_PIPELINE,
  type ArenaProcessId,
  type ArenaProcessImplementationStatus,
} from './processRoleModel';

export type AdoptionPipelineReality =
  | 'EXECUTABLE'
  | 'PARTIAL'
  | 'CONTRACT_ONLY'
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

const CONTRACT_ONLY_PROCESS_IDS = new Set<ArenaProcessId>([
  'P6_CANONICAL_ADOPTION',
]);

const classifyProcessReality = (
  processId: ArenaProcessId,
  implementationStatus: ArenaProcessImplementationStatus,
): AdoptionPipelineReality => {
  if (implementationStatus === 'IMPLEMENTED') return 'EXECUTABLE';
  if (implementationStatus === 'PARTIAL') return 'PARTIAL';
  if (CONTRACT_ONLY_PROCESS_IDS.has(processId)) return 'CONTRACT_ONLY';
  return 'BLOCKED';
};

const explainReality = (
  processId: ArenaProcessId,
  reality: AdoptionPipelineReality,
): string => {
  if (reality === 'EXECUTABLE') {
    return 'Il processo dispone di un percorso runtime implementato; resta soggetto ai propri gate e alla validazione umana prevista.';
  }
  if (reality === 'PARTIAL') {
    return 'Il processo è disponibile solo in parte e non può essere considerato completo nell’intero ciclo istituzionale.';
  }
  if (reality === 'CONTRACT_ONLY' && processId === 'P6_CANONICAL_ADOPTION') {
    return 'Il contratto di adozione canonica è congelato e fail-closed, ma non esiste ancora una mutazione runtime che produca una nuova versione canonica e una adoption receipt.';
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
    const reality = classifyProcessReality(process.id, process.implementationStatus);
    return {
      processId: process.id,
      label: process.label,
      implementationStatus: process.implementationStatus,
      reality,
      consequential: process.consequential,
      reason: explainReality(process.id, reality),
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
