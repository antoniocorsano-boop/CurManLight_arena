// CML-633E Transfer Contracts — Public API
// All exports are domain-only. No feature hooks, no UI, no persistence.

// Types
export type {
  TransferContractId,
  TransferContractVersion,
  TransferId,
  TransferKind,
  TransferStatus,
  StructuralFootprint,
  TransferSourceRef,
  TransferTargetRef,
  TransferMetadata,
  TransferPayload,
  TransferContext,
  TransferResultCompleted,
  TransferResultPartial,
  TransferResultFailed,
  TransferResult,
  TransferErrorRef,
  TransferWarning,
  TransferEvent,
  CreateTransferEventInput,
} from './types';

export {
  createContractId,
  createContractVersion,
  createTransferId,
  createTransferKind,
  createTransferEvent,
  createTransferWarning,
  createCompletedResult,
  createPartialResult,
  createFailedResult,
} from './types';

// Vocabularies
export type { TransferArea } from './vocabularies';
export { A11, A02, A03, A04, A07, VALID_AREAS, isValidArea } from './vocabularies';

// Errors
export type { TransferErrorType, RecoveryAction, TransferRecovery, TransferError } from './errors';
export { RECOVERY_STRATEGIES, createTransferError, classifyError } from './errors';

// Validators
export type { ValidationResult, ValidationError } from './validators';
export {
  validateContract,
  validatePreConditions,
  validatePayload,
  validatePostConditions,
  validateCompleteness,
  validateStateCompatibility,
} from './validators';

// Signatures (non-cryptographic structural footprint)
export { canonicalSerialize, fnv1a, computeStructuralFootprint, validateStructuralFootprint } from './signatures';

// Event Log
export type { TransferEventLog } from './eventLog';
export { createTransferEventLog } from './eventLog';

// A11→A02 and A02→A03 contracts
export type { A11ToA02Payload, A02ToA03Payload } from './contracts';
export { validateA11ToA02, validateA02ToA03, executeA11ToA02, executeA02ToA03 } from './contracts';

// A02/A03→A04 and A04→A07 contracts
export type { A02ToA04Payload, A03ToA04Payload, A04ToA07Payload } from './areaContracts';
export {
  validateA02ToA04,
  validateA03ToA04,
  validateA04ToA07,
  executeA02ToA04,
  executeA03ToA04,
  executeA04ToA07,
} from './areaContracts';

// Legacy adapters
export type { LegacyAdaptationResult } from './legacyAdapters';
export {
  adaptLegacyCurriculumNode,
  adaptLegacyUdaModel,
  tryAdaptLegacyCurriculumNode,
  tryAdaptLegacyUdaModel,
  isLegacyFormat,
} from './legacyAdapters';

// Arena ↔ Docente OS interoperability v1 — transport-independent, domain-only.
export type {
  CmlInteropProduct,
  CmlInteropGeneratedBy,
  CmlInteropMessageType,
  CmlCanonicalRef,
  CmlSourceProvenance,
  CmlInteropEnvelope,
  CurriculumAdoptedPayload,
  PlanningConstraint,
  AnnualPlanningFrameworkPayload,
  UdaFrameworkPayload,
  CurriculumFeedbackPayload,
  CurriculumAlignmentEvidencePayload,
  CmlInteropValidationError,
  CmlInteropValidationResult,
} from './interopV1';
export {
  CML_INTEROP_CONTRACT,
  CML_INTEROP_PAYLOAD_VERSION,
  CML_INTEROP_PRIVACY_CLASS,
  validateCmlInteropEnvelope,
  parseCmlInteropEnvelope,
} from './interopV1';

// Local Arena → Docente OS handoff v1 — preview only, teacher acceptance required.
export type { CmlLocalHandoffV1, CmlLocalHandoffValidationResult } from './interopHandoffV1';
export {
  CML_LOCAL_HANDOFF_FORMAT,
  createCmlLocalHandoffV1,
  validateCmlLocalHandoffV1,
  serializeCmlLocalHandoffV1,
  parseCmlLocalHandoffV1,
} from './interopHandoffV1';
