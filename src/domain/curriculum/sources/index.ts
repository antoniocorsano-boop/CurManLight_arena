export type {
  Source,
  SourceType,
  SourceStatus,
  SourceScope,
  SourceLocator,
  SourceVersion,
  SourceValidationError,
  SourceValidationResult,
} from './types';

export {
  VALID_SOURCE_TYPES,
  VALID_SOURCE_STATUSES,
  SOURCE_SCHEMA_VERSION,
} from './types';

export type {
  SourceAuthorityLevel,
  SourceVerificationStatus,
  SourceValidityScope,
  SourceOriginKind,
  SourceProvenanceRecord,
  SourceGovernanceRecord,
  SourceUsageContext,
  SourceGovernanceValidationResult,
  DerivedKnowledgeSourceRef,
} from './governance';

export {
  validateSourceGovernance,
  isSourceUsableForContext,
  validateDerivedKnowledgeSourceRef,
} from './governance';

export type { GovernedSourceVersion } from './registry';
export {
  listUsableSourcesForContext,
  findGovernedSourceVersion,
} from './registry';
