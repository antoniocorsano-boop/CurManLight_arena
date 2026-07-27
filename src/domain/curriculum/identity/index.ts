/**
 * CML-633B — Canonical Identity and Metadata Foundation
 *
 * Barrel pubblico per i contratti di identità e metadati.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type {
  EntityId,
  SchemaVersion,
  ContentOrigin,
  ActorReference,
  EntityReference,
  EntityType,
  EntityMetadata,
  MigrationStatus,
  MigrationMetadata,
} from './types';

export {
  CURRENT_SCHEMA_VERSION,
  CONTENT_ORIGIN_REGISTRY,
  VALID_ENTITY_TYPES,
} from './types';

// ─── Validators ──────────────────────────────────────────────────────────────

export type {
  ValidationResult,
  ValidationError,
} from './validators';

export {
  isValidEntityId,
  isValidSchemaVersion,
  isSupportedSchemaVersion,
  isValidContentOrigin,
  isValidActorReference,
  isValidEntityReference,
  isValidEntityType,
  isValidMigrationStatus,
  isValidMigrationMetadata,
  isValidMetadata,
  detectDuplicates,
  checkReferentialIntegrity,
} from './validators';

// ─── Constructors ────────────────────────────────────────────────────────────

export {
  generateEntityId,
  generateDeterministicId,
  createMetadata,
  touchMetadata,
  createLegacyMetadata,
  createMigrationMetadata,
  createSelfDeclaredActor,
  createImportedActor,
  createSystemActor,
  createEntityReference,
  createUnresolvedReference,
} from './constructors';

// ─── Serialization ───────────────────────────────────────────────────────────

export type {
  DeserializationResult,
} from './serialization';

export {
  serialize,
  deserialize,
  serializeMetadata,
  deserializeMetadata,
  serializeEntityReference,
  deserializeEntityReference,
  serializeBatch,
  deserializeBatch,
  checkSchemaCompatibility,
  preserveId,
} from './serialization';

// ─── Legacy Adapters ─────────────────────────────────────────────────────────

export type {
  LegacyCurriculumKBItem,
  LegacyUdaModel,
  AdaptedLegacyItem,
} from './legacyAdapters';

export {
  adaptCurriculumKBItem,
  adaptCurriculumKB,
  adaptUdaModel,
  adaptUdaModels,
  isLegacyDataPreserved,
  hasRequiredWarnings,
  hasNoPhantomSource,
  hasNoPhantomAuthor,
} from './legacyAdapters';
