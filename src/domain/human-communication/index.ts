export {
  HUMAN_COMMUNICATION_MODEL_VERSION,
  canUseAdaptiveHcmMemory,
  detectPrimaryTechnicalLeak,
  getHcmMemoryPolicy,
  hcmAuthorityDisclosure,
  projectHcmTerm,
  resolveHcmTone,
  validateHcmContext,
} from './model';

export type {
  HcmAdaptiveMemoryCategory,
  HcmAuthorityContext,
  HcmAuthoritySource,
  HcmAuthorityState,
  HcmConsequenceLevel,
  HcmContext,
  HcmDetailLevel,
  HcmMemoryPolicy,
  HcmProjection,
  HcmRoleTone,
  HcmTaskPhase,
  HcmTermSpec,
  HcmTone,
  HcmValidationResult,
} from './model';
